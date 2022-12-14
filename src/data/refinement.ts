/**
 * @since 1.0.0
 */

import {
  jsonSchemaAnnotation,
  JSONSchemaAnnotationId
} from "@fp-ts/schema/annotation/JSONSchemaAnnotation"
import * as I from "@fp-ts/schema/internal/common"
import type { Schema } from "@fp-ts/schema/Schema"

/**
 * @since 1.0.0
 */
export const endsWith = (endsWith: string) =>
  <A extends string>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a.endsWith(endsWith), { endsWith })

/**
 * @since 1.0.0
 */
export const finite = <A extends number>(self: Schema<A>): Schema<A> =>
  I.refinement(self, (a): a is A => Number.isFinite(a), { type: "Finite" })

/**
 * @since 1.0.0
 */
export const greaterThan = (min: number) =>
  <A extends number>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a > min, { exclusiveMinimum: min }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ exclusiveMinimum: min })
    })

/**
 * @since 1.0.0
 */
export const greaterThanOrEqualTo = (min: number) =>
  <A extends number>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a >= min, { minimum: min }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ minimum: min })
    })

/**
 * @since 1.0.0
 */
export abstract class Class {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(..._: Array<any>) {}
}

/**
 * @since 1.0.0
 */
export const instanceOf = <A extends typeof Class>(constructor: A) =>
  (self: Schema<object>): Schema<InstanceType<A>> =>
    I.refinement(self, (a): a is InstanceType<A> => a instanceof constructor, {
      instanceof: constructor
    })

/**
 * @since 1.0.0
 */
export const int = <A extends number>(self: Schema<A>): Schema<A> =>
  I.refinement(self, (a): a is A => Number.isInteger(a), { type: "integer" }, {
    [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ type: "integer" })
  })

/**
 * @since 1.0.0
 */
export const lessThan = (max: number) =>
  <A extends number>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a < max, { exclusiveMaximum: max }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ exclusiveMaximum: max })
    })

/**
 * @since 1.0.0
 */
export const lessThanOrEqualTo = (max: number) =>
  <A extends number>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a <= max, { maximum: max }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ maximum: max })
    })

/**
 * @since 1.0.0
 */
export const maxLength = (
  maxLength: number
) =>
  <A extends string>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a.length <= maxLength, { maxLength }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ maxLength })
    })

/**
 * @since 1.0.0
 */
export const minLength = (
  minLength: number
) =>
  <A extends string>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a.length >= minLength, { minLength }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ minLength })
    })

/**
 * @since 1.0.0
 */
export const nonNaN = <A extends number>(self: Schema<A>): Schema<A> =>
  I.refinement(self, (a): a is A => !Number.isNaN(a), { type: "NonNaN" })

/**
 * @since 1.0.0
 */
export const regex = (
  regex: RegExp
) =>
  <A extends string>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => regex.test(a), { pattern: regex.toString() }, {
      [JSONSchemaAnnotationId]: jsonSchemaAnnotation({ pattern: regex.toString() })
    })

/**
 * @since 1.0.0
 */
export const startsWith = (startsWith: string) =>
  <A extends string>(self: Schema<A>): Schema<A> =>
    I.refinement(self, (a): a is A => a.startsWith(startsWith), { startsWith })
