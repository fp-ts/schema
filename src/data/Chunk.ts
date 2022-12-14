/**
 * @since 1.0.0
 */
import type { Chunk } from "@fp-ts/data/Chunk"
import * as C from "@fp-ts/data/Chunk"
import { pipe } from "@fp-ts/data/Function"
import * as T from "@fp-ts/data/These"
import * as AH from "@fp-ts/schema/annotation/ArbitraryHooks"
import * as DH from "@fp-ts/schema/annotation/DecoderHooks"
import * as EH from "@fp-ts/schema/annotation/EncoderHooks"
import * as GH from "@fp-ts/schema/annotation/GuardHooks"
import * as PH from "@fp-ts/schema/annotation/PrettyHooks"
import * as A from "@fp-ts/schema/Arbitrary"
import type { Decoder } from "@fp-ts/schema/Decoder"
import * as D from "@fp-ts/schema/Decoder"
import type { Encoder } from "@fp-ts/schema/Encoder"
import type * as G from "@fp-ts/schema/Guard"
import * as I from "@fp-ts/schema/internal/common"
import * as P from "@fp-ts/schema/Pretty"
import type { Schema } from "@fp-ts/schema/Schema"

const guard = <A>(item: G.Guard<A>): G.Guard<Chunk<A>> =>
  I.makeGuard(
    chunk(item),
    (u): u is Chunk<A> => C.isChunk(u) && pipe(u, C.every(item.is))
  )

const decoder = <A>(
  item: Decoder<unknown, A>
): Decoder<unknown, Chunk<A>> =>
  I.makeDecoder(
    chunk(item),
    (u) => pipe(D.decoderFor(I.array(item)).decode(u), T.map(C.fromIterable))
  )

const encoder = <A>(item: Encoder<unknown, A>): Encoder<unknown, Chunk<A>> =>
  I.makeEncoder(chunk(item), (chunk) => C.toReadonlyArray(chunk).map(item.encode))

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
    I.struct({ _id: I.uniqueSymbol(Symbol.for("@fp-ts/data/Chunk")) }),
    {
      [DH.TypeAliasHookId]: DH.typeAliasHook(decoder),
      [GH.TypeAliasHookId]: GH.typeAliasHook(guard),
      [EH.TypeAliasHookId]: EH.typeAliasHook(encoder),
      [PH.TypeAliasHookId]: PH.typeAliasHook(pretty),
      [AH.TypeAliasHookId]: AH.typeAliasHook(arbitrary)
    }
  )
