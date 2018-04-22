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
