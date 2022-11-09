/**
 * @since 1.0.0
 */

import { guardFor } from "@fp-ts/codec/Guard"
import type { LiteralValue, Meta } from "@fp-ts/codec/Meta"
import type { Schema } from "@fp-ts/codec/Schema"
import * as C from "@fp-ts/data/Context"
import { pipe } from "@fp-ts/data/Function"

/**
 * @since 1.0.0
 */
export interface Show<A> {
  readonly show: (a: A) => string
}

/**
 * @since 1.0.0
 */
export const make = <A>(show: Show<A>["show"]): Show<A> => ({ show })

/**
 * @since 1.0.0
 */
export const showFor = <P>(ctx: C.Context<P>): <E, A>(schema: Schema<P, E, A>) => Show<A> => {
  const g = guardFor(ctx)
  const f = (dsl: Meta): Show<any> => {
    switch (dsl._tag) {
      case "Constructor": {
        const service: any = pipe(ctx, C.get(dsl.tag as any))
        return make((a) => service.show(f(dsl.type)).show(a))
      }
      case "String":
        return make((a) => JSON.stringify(a))
      case "Number":
        return make((a) => JSON.stringify(a))
      case "Boolean":
        return make((a) => JSON.stringify(a))
      case "Literal":
        return make((literal: LiteralValue) => JSON.stringify(literal))
      case "Tuple": {
        const shows: ReadonlyArray<Show<unknown>> = dsl.components.map(f)
        return make((tuple: ReadonlyArray<unknown>) =>
          "[" + tuple.map((c, i) => shows[i].show(c)).join(", ") + "]"
        )
      }
      case "Union": {
        const shows: ReadonlyArray<Show<unknown>> = dsl.members.map(f)
        const guards = dsl.members.map((member) => g(member as any))
        return make((a) => {
          const index = guards.findIndex((guard) => guard.is(a))
          return shows[index].show(a)
        })
      }
      case "Struct": {
        const shows: ReadonlyArray<Show<unknown>> = dsl.fields.map((field) => f(field.value))
        return make((a: { [_: PropertyKey]: unknown }) =>
          `{ ${
            dsl.fields.map((field, i) => `${String(field.key)}: ${shows[i].show(a[field.key])}`)
              .join(", ")
          } }`
        )
      }
      case "IndexSignature": {
        const show = f(dsl.value)
        return make((a) =>
          `{ ${Object.keys(a).map((key) => `${String(key)}: ${show.show(a[key])}`).join(", ")} }`
        )
      }
      case "Array": {
        const show = f(dsl.item)
        return make((a: ReadonlyArray<unknown>) =>
          "[" + a.map((elem) => show.show(elem)).join(", ") + "]"
        )
      }
    }
  }
  return f
}