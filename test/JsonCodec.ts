import * as O from "@fp-ts/data/Option"
import * as parseFloat from "@fp-ts/schema/data/parser/parseFloat"
import * as D from "@fp-ts/schema/Decoder"
import * as JC from "@fp-ts/schema/JsonCodec"
import * as S from "@fp-ts/schema/Schema"
import * as Util from "@fp-ts/schema/test/util"

const jsonCodecFor = JC.jsonCodecFor

const NumberFromStringSchema = parseFloat.schema(S.string)

describe("JsonCodec", () => {
  it("of", () => {
    const schema = S.of(1)
    const codec = jsonCodecFor(schema)
    expect(codec.decode(1)).toEqual(D.success(1))
    Util.expectFailure(codec, "a", "\"a\" did not satisfy isEqual(1)")
  })

  it("tuple", () => {
    const schema = S.tuple(S.string, NumberFromStringSchema)
    const codec = jsonCodecFor(schema)
    expect(codec.decode(["a", "1"])).toEqual(D.success(["a", 1]))

    Util.expectFailure(codec, {}, "{} did not satisfy is(JsonArray)")
    Util.expectFailure(codec, ["a"], "/1 undefined did not satisfy is(string)")

    expect(codec.encode(["b", 2])).toEqual(["b", "2"])
  })

  it("union", () => {
    const schema = S.union(NumberFromStringSchema, S.string)
    const codec = jsonCodecFor(schema)
    expect(codec.decode("a")).toEqual(D.success("a"))
    expect(codec.decode("1")).toEqual(D.success(1))

    Util.expectFailure(
      codec,
      null,
      "member 0 null did not satisfy is(string), member 1 null did not satisfy is(string)"
    )

    expect(codec.encode("b")).toEqual("b")
    expect(codec.encode(2)).toEqual("2")
  })

  it("Option", () => {
    const codec = JC.option(JC.number)
    expect(codec.decode(null)).toEqual(D.success(O.none))
    expect(codec.decode(1)).toEqual(D.success(O.some(1)))

    Util.expectFailure(
      codec,
      {},
      "member 0 {} did not satisfy isEqual(null), member 1 {} did not satisfy is(number)"
    )
    Util.expectWarning(
      codec,
      NaN,
      "did not satisfy not(isNaN)",
      O.some(NaN)
    )

    expect(codec.encode(O.none)).toEqual(null)
    expect(codec.encode(O.some(1))).toEqual(1)
  })
})
