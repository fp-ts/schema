import { pipe } from "@fp-ts/data/Function"
import * as Optic from "@fp-ts/optic"
import * as optics from "@fp-ts/schema/Optics"
import * as S from "@fp-ts/schema/Schema"

const unsafeOpticsFor = optics.unsafeOpticsFor

describe("Optics", () => {
  it("struct", () => {
    const _schema = S.struct({ a: S.string, b: S.struct({ c: S.number }) })
    interface S extends S.Infer<typeof _schema> {}
    const schema: S.Schema<S> = _schema
    const optics = unsafeOpticsFor(schema).optics
    expect(pipe({ a: "a", b: { c: 1 } }, Optic.get(optics.a.self))).toEqual("a")
    expect(pipe({ a: "a", b: { c: 1 } }, Optic.get(optics.b.self))).toEqual({ c: 1 })
    expect(pipe({ a: "a", b: { c: 1 } }, Optic.get(optics.b.c.self))).toEqual(1)
  })

  it("tuple", () => {
    const _schema = S.tuple(S.string, S.struct({ c: S.number }))
    interface S extends S.Infer<typeof _schema> {}
    const schema: S.Schema<S> = _schema
    const optics = unsafeOpticsFor(schema).optics
    expect(pipe(["a", { c: 1 }], Optic.get(optics[0].self))).toEqual("a")
    expect(pipe(["a", { c: 1 }], Optic.get(optics[1].self))).toEqual({ c: 1 })
    expect(pipe(["a", { c: 1 }], Optic.get(optics[1].c.self))).toEqual(1)
  })
})
