/**
 * @since 1.0.0
 */
import type { Chunk } from "@fp-ts/data/Chunk"
import * as C from "@fp-ts/data/Chunk"
import { pipe } from "@fp-ts/data/Function"
import * as H from "@fp-ts/schema/annotation/TypeAliasHook"
import * as A from "@fp-ts/schema/Arbitrary"
import type * as G from "@fp-ts/schema/Guard"
import * as I from "@fp-ts/schema/internal/common"
import * as P from "@fp-ts/schema/Pretty"
import type { Schema } from "@fp-ts/schema/Schema"

const guard = <A>(item: G.Guard<A>): G.Guard<Chunk<A>> =>
  I.makeGuard(
    chunk(item),
    (u): u is Chunk<A> => C.isChunk(u) && pipe(u, C.every(item.is))
  )

const arbitrary = <A>(item: A.Arbitrary<A>): A.Arbitrary<Chunk<A>> =>
  A.make(chunk(item), (fc) => fc.array(item.arbitrary(fc)).map(C.fromIterable))

const pretty = <A>(item: P.Pretty<A>): P.Pretty<Chunk<A>> =>
  P.make(
    chunk(item),
    (c) => `Chunk(${C.toReadonlyArray(c).map(item.pretty).join(", ")})`
  )

/**
 * @since 1.0.0
 */
export const chunk = <A>(item: Schema<A>): Schema<Chunk<A>> =>
  I.typeAlias(
    [item],
    I.struct({}),
    {
      [H.GuardTypeAliasHookId]: H.typeAliasHook(guard),
      [H.PrettyTypeAliasHookId]: H.typeAliasHook(pretty),
      [H.ArbitraryTypeAliasHookId]: H.typeAliasHook(arbitrary)
    }
  )

/**
 * @since 1.0.0
 */
export const fromArray = <A>(item: Schema<A>): Schema<Chunk<A>> =>
  pipe(I.array(item), I.transform(chunk(item), C.fromIterable, C.toReadonlyArray))
