/**
 * @since 1.0.0
 */
import { isNumber } from "@fp-ts/data/Number"
import { parse } from "@fp-ts/schema/data/parse"
import * as DE from "@fp-ts/schema/DecodeError"
import * as I from "@fp-ts/schema/internal/common"
import type { Schema } from "@fp-ts/schema/Schema"

/**
 * @since 1.0.0
 */
export const schema: (self: Schema<string>) => Schema<number> = parse(
  (s: string) => {
    const n = parseFloat(s)
    return isNaN(n) ?
      I.failure(DE.parse("string", "number", s)) :
      I.success(n)
  },
  String,
  isNumber,
  (fc) => fc.float().filter((n) => !isNaN(n) && isFinite(n)),
  String
)
