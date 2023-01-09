import * as _ from "@fp-ts/schema/data/filter"
import * as D from "@fp-ts/schema/Decoder"
import * as G from "@fp-ts/schema/Guard"
import * as P from "@fp-ts/schema/Pretty"
import * as S from "@fp-ts/schema/Schema"
import * as Util from "@fp-ts/schema/test/util"

describe.concurrent("includes", () => {
  it("property tests", () => {
    Util.property(_.includes("a")(S.string))
  })

  it("Guard", () => {
    const is = G.is(_.includes("a")(S.string))
    expect(is("")).toEqual(false)
    expect(is("a")).toEqual(true)
    expect(is("aa")).toEqual(true)
    expect(is("bac")).toEqual(true)
    expect(is("ba")).toEqual(true)
  })

  it("Decoder", () => {
    const decoder = D.decoderFor(_.includes("a")(S.string))
    Util.expectDecodingSuccess(decoder, "a")
    Util.expectDecodingSuccess(decoder, "aa")
    Util.expectDecodingSuccess(decoder, "bac")
    Util.expectDecodingSuccess(decoder, "ba")
    Util.expectDecodingFailure(decoder, "", `"" did not satisfy refinement({"includes":"a"})`)
  })

  it("Pretty", () => {
    const pretty = P.prettyFor(_.includes("a")(S.string))
    expect(pretty.pretty("a")).toEqual(`"a"`)
  })
})
