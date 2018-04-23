/* eslint-env jest */

const withSubscribe = require('./index')

it('works with object', () => {
  const foo = withSubscribe({
    a: 1,
    b: 2
  })

  let subscribeCalls = 0
  foo.subscribe(() => {
    subscribeCalls += 1
  })

  foo.a = 3
  foo.b = 4

  expect(foo.a).toEqual(3)
  expect(foo.b).toEqual(4)
  expect(subscribeCalls).toEqual(2)
})

it('works with class', () => {
  class Foo {
    constructor (a, b) {
      this.a = a
      this.b = b
    }
  }
  const FooSubscribable = withSubscribe(Foo)
  const foo = new FooSubscribable(1, 2)

  let subscribeCalls = 0
  foo.subscribe(() => {
    subscribeCalls += 1
  })

  foo.a = 3
  foo.b = 4

  expect(foo.a).toEqual(3)
  expect(foo.b).toEqual(4)
  expect(subscribeCalls).toEqual(2)
})

it('works as decorator', () => {
  @withSubscribe
  class Foo {
    constructor (a, b) {
      this.a = a
      this.b = b
    }
  }
  const foo = new Foo(1, 2)

  let subscribeCalls = 0
  foo.subscribe(() => {
    subscribeCalls += 1
  })

  foo.a = 3
  foo.b = 4

  expect(foo.a).toEqual(3)
  expect(foo.b).toEqual(4)
  expect(subscribeCalls).toEqual(2)
})

it('returns unsubscribe function', () => {
  const foo = withSubscribe({
    a: 1,
    b: 2
  })

  let subscribeCalls = 0
  const unsubscribe = foo.subscribe(() => {
    subscribeCalls += 1
  })

  foo.a = 3
  foo.b = 4

  expect(foo.a).toEqual(3)
  expect(foo.b).toEqual(4)
  expect(subscribeCalls).toEqual(2)

  unsubscribe()

  foo.a = 5
  foo.b = 6

  expect(foo.a).toEqual(5)
  expect(foo.b).toEqual(6)
  expect(subscribeCalls).toEqual(2)
})
