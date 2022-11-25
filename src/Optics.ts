/**
 * @since 1.0.0
 */
import * as Optic from "@fp-ts/optic"
import type { AST } from "@fp-ts/schema/AST"
import * as I from "@fp-ts/schema/internal/common"
import type { Provider } from "@fp-ts/schema/Provider"
import { empty } from "@fp-ts/schema/Provider"
import type { Schema } from "@fp-ts/schema/Schema"
import * as S from "@fp-ts/schema/Schema"

/**
 * @since 1.0.0
 */
export const OpticId = I.OpticId

/**
 * @since 1.0.0
 */
export type OpticId = I.OpticId

/**
 * @since 1.0.0
 */
export type GetOptics<Root, A> = {
  [K in keyof A]:
    & { self: Optic.Lens<Root, A[K]> }
    & (A[K] extends object ? GetOptics<Root, A[K]> : {})
}

/**
 * @since 1.0.0
 */
export interface Optics<in out A> extends Schema<A> {
  readonly optics: GetOptics<A, A>
}

/**
 * @since 1.0.0
 */
export const make = <A>(schema: Schema<A>, optics: Optics<A>["optics"]): Optics<A> =>
  ({ ast: schema.ast, optics }) as any

/**
 * @since 1.0.0
 */
export const provideUnsafeOpticsFor = (_provider: Provider) =>
  <A>(schema: Schema<A>): Optics<A> => {
    const go = (ast: AST, parent = Optic.id<any>()): Optics<any> => {
      switch (ast._tag) {
        case "Declaration":
        case "Of":
        case "Union":
        case "Lazy":
          return make(S.make(ast), {})
        case "Tuple": {
          const optics = {}
          for (let i = 0; i < ast.components.length; i++) {
            const self = parent.compose(Optic.key(String(i)))
            const value = go(ast.components[i], self).optics
            optics[String(i)] = {
              self,
              ...value
            }
          }
          return make(S.make(ast), optics)
        }
        case "Struct": {
          const optics = {}
          for (const field of ast.fields) {
            const self = parent.compose(Optic.key(field.key as any))
            const value = go(field.value, self).optics
            optics[field.key] = {
              self,
              ...value
            }
          }
          return make(S.make(ast), optics)
        }
      }
    }

    return go(schema.ast)
  }

/**
 * @since 1.0.0
 */
export const unsafeOpticsFor: <A>(schema: Schema<A>) => Optics<A> = provideUnsafeOpticsFor(empty)
