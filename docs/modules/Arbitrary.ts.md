---
title: Arbitrary.ts
nav_order: 9
parent: Modules
---

## Arbitrary overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [model](#model)
  - [Arbitrary (interface)](#arbitrary-interface)
- [utils](#utils)
  - [arbitraryFor](#arbitraryfor)

---

# constructors

## make

**Signature**

```ts
export declare const make: <A>(
  schema: Schema<A>,
  arbitrary: (fc: typeof FastCheck) => FastCheck.Arbitrary<A>
) => Arbitrary<A>
```

Added in v1.0.0

# model

## Arbitrary (interface)

**Signature**

```ts
export interface Arbitrary<A> extends Schema<A> {
  readonly arbitrary: (fc: typeof FastCheck) => FastCheck.Arbitrary<A>
}
```

Added in v1.0.0

# utils

## arbitraryFor

**Signature**

```ts
export declare const arbitraryFor: <A>(schema: Schema<A>) => Arbitrary<A>
```

Added in v1.0.0
