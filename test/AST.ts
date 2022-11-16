import * as ast from "@fp-ts/codec/AST"
import * as S from "@fp-ts/codec/Schema"
import * as O from "@fp-ts/data/Option"

describe("Meta", () => {
  describe("getFields", () => {
    it("struct", () => {
      const schema = S.struct({
        a: S.string,
        b: S.number
      })
      expect(ast.getFields(schema.ast)).toEqual([
        ast.field("a", ast.string({}), false, true),
        ast.field("b", ast.number({}), false, true)
      ])
    })

    /*
    type U = {
      readonly a: string
      readonly b: number
      [_: string]: unknown
    } | {
      readonly a: boolean
      readonly c: Date
    }

    type P = Pick<U, "a">
    type O = Omit<U, "b">
    type K = keyof U
    */

    it("union", () => {
      const schema = S.union(
        S.struct({
          a: S.string,
          b: S.number
        }),
        S.struct({
          a: S.boolean,
          c: S.number
        })
      )
      expect(ast.getFields(schema.ast)).toEqual([
        ast.field("a", ast.union([ast.string({}), ast.boolean]), false, true)
      ])
    })

    it("lazy", () => {
      interface Category {
        readonly name: string
        readonly categories: ReadonlyArray<Category>
      }
      const Category: S.Schema<Category> = S.lazy<Category>(
        () =>
          S.struct({
            name: S.string,
            categories: S.array(true, Category)
          })
      )
      expect(ast.getFields(Category.ast)).toEqual([
        ast.field("name", ast.string({}), false, true),
        ast.field("categories", ast.tuple([], O.some(Category.ast), true), false, true)
      ])
    })
  })
})