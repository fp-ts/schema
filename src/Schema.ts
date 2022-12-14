/**
 * @since 1.0.0
 */

import { pipe } from "@fp-ts/data/Function"
import type { Json } from "@fp-ts/data/Json"
import type { Option } from "@fp-ts/data/Option"
import type { Refinement } from "@fp-ts/data/Predicate"
import * as AST from "@fp-ts/schema/AST"
import * as DataJson from "@fp-ts/schema/data/Json"
import * as DataOption from "@fp-ts/schema/data/Option"
import * as DataParse from "@fp-ts/schema/data/parser"
import * as R from "@fp-ts/schema/data/refinement"
import type { Decoder } from "@fp-ts/schema/Decoder"
import type { Encoder } from "@fp-ts/schema/Encoder"
import * as I from "@fp-ts/schema/internal/common"

/**
 * @category model
 * @since 1.0.0
 */
export interface Schema<A> {
  readonly A: (_: A) => A
  readonly ast: AST.AST
}

/**
 * @since 1.0.0
 */
export type Infer<S extends Schema<any>> = Parameters<S["A"]>[0]

// ---------------------------------------------
// constructors
// ---------------------------------------------

/**
 * @category constructors
 * @since 1.0.0
 */
export const make: <A>(ast: AST.AST) => Schema<A> = I.makeSchema

/**
 * @category constructors
 * @since 1.0.0
 */
export const literal: <Literals extends ReadonlyArray<AST.Literal>>(
  ...literals: Literals
) => Schema<Literals[number]> = I.literal

/**
 * @category constructors
 * @since 1.0.0
 */
export const uniqueSymbol: <S extends symbol>(symbol: S) => Schema<S> = I.uniqueSymbol

/**
 * @category constructors
 * @since 1.0.0
 */
export const enums = <A extends { [x: string]: string | number }>(enums: A): Schema<A[keyof A]> =>
  make(
    AST.enums(
      Object.keys(enums).filter(
        (key) => typeof enums[enums[key]] !== "number"
      ).map((key) => [key, enums[key]])
    )
  )

/**
 * @category constructors
 * @since 1.0.0
 */
export const instanceOf: <A extends typeof R.Class>(
  constructor: A
) => (self: Schema<object>) => Schema<InstanceType<A>> = R.instanceOf

// ---------------------------------------------
// filters
// ---------------------------------------------

/**
 * @category filters
 * @since 1.0.0
 */
export const minLength: (minLength: number) => <A extends string>(self: Schema<A>) => Schema<A> =
  R.minLength

/**
 * @category filters
 * @since 1.0.0
 */
export const maxLength: (maxLength: number) => <A extends string>(self: Schema<A>) => Schema<A> =
  R.maxLength

/**
 * @category filters
 * @since 1.0.0
 */
export const length = (length: number) =>
  <A extends string>(self: Schema<A>): Schema<A> => minLength(length)(maxLength(length)(self))

/**
 * @category filters
 * @since 1.0.0
 */
export const nonEmpty: <A extends string>(self: Schema<A>) => Schema<A> = minLength(1)

/**
 * @category filters
 * @since 1.0.0
 */
export const startsWith: (startsWith: string) => <A extends string>(self: Schema<A>) => Schema<A> =
  R.startsWith

/**
 * @category filters
 * @since 1.0.0
 */
export const endsWith: (endsWith: string) => <A extends string>(self: Schema<A>) => Schema<A> =
  R.endsWith

/**
 * @category filters
 * @since 1.0.0
 */
export const regex: (regex: RegExp) => <A extends string>(self: Schema<A>) => Schema<A> = R.regex

/**
 * @category filters
 * @since 1.0.0
 */
export const lessThan: (max: number) => <A extends number>(self: Schema<A>) => Schema<A> =
  R.lessThan

/**
 * @category filters
 * @since 1.0.0
 */
export const lessThanOrEqualTo: (max: number) => <A extends number>(self: Schema<A>) => Schema<A> =
  R.lessThanOrEqualTo

/**
 * @category filters
 * @since 1.0.0
 */
export const greaterThan: (
  min: number
) => <A extends number>(self: Schema<A>) => Schema<A> = R.greaterThan

/**
 * @category filters
 * @since 1.0.0
 */
export const greaterThanOrEqualTo: (
  min: number
) => <A extends number>(self: Schema<A>) => Schema<A> = R.greaterThanOrEqualTo

/**
 * @category filters
 * @since 1.0.0
 */
export const int: <A extends number>(self: Schema<A>) => Schema<A> = R.int

/**
 * @category filters
 * @since 1.0.0
 */
export const nonNaN: <A extends number>(self: Schema<A>) => Schema<A> = R.nonNaN

/**
 * @category filters
 * @since 1.0.0
 */
export const finite: <A extends number>(self: Schema<A>) => Schema<A> = R.finite

// ---------------------------------------------
// combinators
// ---------------------------------------------

/**
 * @category unexpected keys / indexes
 * @since 1.0.0
 */
export const allowUnexpected = <A>(self: Schema<A>): Schema<A> =>
  AST.isStruct(self.ast) || AST.isTuple(self.ast) ?
    make({ ...self.ast, allowUnexpected: true }) :
    self

/**
 * @category unexpected keys / indexes
 * @since 1.0.0
 */
export const disallowUnexpected = <A>(self: Schema<A>): Schema<A> =>
  AST.isStruct(self.ast) ?
    make({ ...self.ast, allowUnexpected: false }) :
    self

/**
 * @category combinators
 * @since 1.0.0
 */
export const union: <Members extends ReadonlyArray<Schema<any>>>(
  ...members: Members
) => Schema<Infer<Members[number]>> = I.union

/**
 * @category combinators
 * @since 1.0.0
 */
export const nullable = <A>(self: Schema<A>): Schema<A | null> => union(self, literal(null))

/**
 * @category combinators
 * @since 1.0.0
 */
export const keyof = <A>(schema: Schema<A>): Schema<keyof A> => make(AST.keyof(schema.ast))

/**
 * @category combinators
 * @since 1.0.0
 */
export const tuple: <Elements extends ReadonlyArray<Schema<any>>>(
  ...elements: Elements
) => Schema<{ readonly [K in keyof Elements]: Infer<Elements[K]> }> = I.tuple

/**
 * @category combinators
 * @since 1.0.0
 */
export const rest = <R>(rest: Schema<R>) =>
  <A extends ReadonlyArray<any>>(self: Schema<A>): Schema<readonly [...A, ...Array<R>]> => {
    if (AST.isTuple(self.ast)) {
      return make(AST.appendRestElement(self.ast, rest.ast))
    }
    throw new Error("`rest` is not supported on this schema")
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const element = <E>(element: Schema<E>) =>
  <A extends ReadonlyArray<any>>(self: Schema<A>): Schema<readonly [...A, E]> => {
    if (AST.isTuple(self.ast)) {
      return make(AST.appendElement(self.ast, AST.element(element.ast, false)))
    }
    throw new Error("`element` is not supported on this schema")
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const optionalElement = <E>(element: Schema<E>) =>
  <A extends ReadonlyArray<any>>(self: Schema<A>): Schema<readonly [...A, E?]> => {
    if (AST.isTuple(self.ast)) {
      return make(AST.appendElement(self.ast, AST.element(element.ast, true)))
    }
    throw new Error("`optionalElement` is not supported on this schema")
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const array: <A>(item: Schema<A>) => Schema<ReadonlyArray<A>> = I.array

/**
 * @category combinators
 * @since 1.0.0
 */
export const nonEmptyArray = <A>(
  item: Schema<A>
): Schema<readonly [A, ...Array<A>]> => pipe(tuple(item), rest(item))

/**
 * @since 1.0.0
 */
export type Spread<A> = {
  [K in keyof A]: A[K]
} extends infer B ? B : never

/**
 * @category symbol
 * @since 1.0.0
 */
export const OptionalSchemaId = Symbol.for("@fp-ts/schema/Schema/OptionalSchema")

/**
 * @category symbol
 * @since 1.0.0
 */
export type OptionalSchemaId = typeof OptionalSchemaId

/**
 * @since 1.0.0
 */
export interface OptionalSchema<A, isOptional extends boolean> extends Schema<A>, AST.Annotated {
  readonly _id: OptionalSchemaId
  readonly isOptional: isOptional
}

/**
 * @category combinators
 * @since 1.0.0
 */
export const optional: <A>(schema: Schema<A>) => OptionalSchema<A, true> = I.optional

/**
 * @since 1.0.0
 */
export type OptionalKeys<T> = {
  [K in keyof T]: T[K] extends OptionalSchema<any, true> ? K : never
}[keyof T]

/**
 * @category combinators
 * @since 1.0.0
 */
export const struct: <Fields extends Record<PropertyKey, Schema<any>>>(
  fields: Fields
) => Schema<
  Spread<
    & { readonly [K in Exclude<keyof Fields, OptionalKeys<Fields>>]: Infer<Fields[K]> }
    & { readonly [K in OptionalKeys<Fields>]?: Infer<Fields[K]> }
  >
> = I.struct

/**
 * @category combinators
 * @since 1.0.0
 */
export const field: <Key extends PropertyKey, A, isOptional extends boolean>(
  key: Key,
  value: Schema<A>,
  isOptional: isOptional
) => Schema<isOptional extends true ? { readonly [K in Key]?: A } : { readonly [K in Key]: A }> =
  I.field

/**
 * @category combinators
 * @since 1.0.0
 */
export const pick = <A, Keys extends ReadonlyArray<keyof A>>(...keys: Keys) =>
  (self: Schema<A>): Schema<{ readonly [P in Keys[number]]: A[P] }> =>
    make(AST.pick(self.ast, keys))

/**
 * @category combinators
 * @since 1.0.0
 */
export const omit = <A, Keys extends ReadonlyArray<keyof A>>(...keys: Keys) =>
  (self: Schema<A>): Schema<{ readonly [P in Exclude<keyof A, Keys[number]>]: A[P] }> =>
    make(AST.omit(self.ast, keys))

/**
 * @category combinators
 * @since 1.0.0
 */
export const partial = <A>(self: Schema<A>): Schema<Partial<A>> => make(AST.partial(self.ast))

/**
 * @category combinators
 * @since 1.0.0
 */
export const record: <K extends PropertyKey, V>(
  key: Schema<K>,
  value: Schema<V>
) => Schema<{ readonly [k in K]: V }> = I.record

/**
 * @category combinators
 * @since 1.0.0
 */
export const extend = <B>(that: Schema<B>) =>
  <A>(self: Schema<A>): Schema<Spread<A & B>> => {
    if (AST.isStruct(self.ast) && AST.isStruct(that.ast)) {
      return make(AST.struct(
        self.ast.fields.concat(that.ast.fields),
        self.ast.indexSignatures.concat(that.ast.indexSignatures)
      ))
    }
    throw new Error("`extend` is not supported on this schema")
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const lazy: <A>(f: () => Schema<A>) => Schema<A> = I.lazy

/**
 * @category combinators
 * @since 1.0.0
 */
export const filter = <A, B extends A>(
  refinement: Refinement<A, B>,
  meta: unknown,
  annotations: AST.Annotated["annotations"] = {}
) => (self: Schema<A>): Schema<B> => I.refinement(self, refinement, meta, annotations)

/**
 * @category combinators
 * @since 1.0.0
 */
export const parse: <A, B>(
  to: Schema<B>,
  decode: Decoder<A, B>["decode"],
  encode: Encoder<A, B>["encode"]
) => (self: Schema<A>) => Schema<B> = DataParse.parse

/**
 * @category combinators
 * @since 1.0.0
 */
export const annotations: (
  annotations: AST.Annotated["annotations"]
) => <A>(self: Schema<A>) => Schema<A> = I.annotations

// ---------------------------------------------
// data
// ---------------------------------------------

const _undefined: Schema<undefined> = I._undefined

const _void: Schema<void> = I._void

const _null: Schema<null> = I._null

export {
  /**
   * @category primitives
   * @since 1.0.0
   */
  _null as null,
  /**
   * @category primitives
   * @since 1.0.0
   */
  _undefined as undefined,
  /**
   * @category primitives
   * @since 1.0.0
   */
  _void as void
}

/**
 * @category primitives
 * @since 1.0.0
 */
export const never: Schema<never> = I.never

/**
 * @category primitives
 * @since 1.0.0
 */
export const unknown: Schema<unknown> = I.unknown

/**
 * @category primitives
 * @since 1.0.0
 */
export const any: Schema<any> = I.any

/**
 * @category primitives
 * @since 1.0.0
 */
export const string: Schema<string> = I.string

/**
 * @category primitives
 * @since 1.0.0
 */
export const number: Schema<number> = I.number

/**
 * @category primitives
 * @since 1.0.0
 */
export const boolean: Schema<boolean> = I.boolean

/**
 * @category primitives
 * @since 1.0.0
 */
export const bigint: Schema<bigint> = I.bigint

/**
 * @category primitives
 * @since 1.0.0
 */
export const symbol: Schema<symbol> = I.symbol

/**
 * @category primitives
 * @since 1.0.0
 */
export const object: Schema<object> = I.object

/**
 * @category data
 * @since 1.0.0
 */
export const json: Schema<Json> = DataJson.json

/**
 * @category data
 * @since 1.0.0
 */
export const option: <A>(value: Schema<A>) => Schema<Option<A>> = DataOption.option
