/* eslint-env jest */

const $$observable = require('symbol-observable').default
const typeFrom = require('type-from')
const Rx = require('rxjs')
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
  expect(subscribeCalls).toEqual(3)
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
  expect(subscribeCalls).toEqual(3)
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
  expect(subscribeCalls).toEqual(3)
})

it('works with nested object properties', () => {
  const foo = withSubscribe({
    a: 1,
    b: {
      c: {
        d: {
          e: 2
        }
      }
    }
  })

  let subscribeCalls = 0
  foo.subscribe(() => {
    subscribeCalls += 1
  })

  foo.a = 3
  foo.b.c.d.e = 4

  expect(foo.a).toEqual(3)
  expect(foo.b.c.d.e).toEqual(4)
  expect(subscribeCalls).toEqual(3)
})

describe('subscribe method', () => {
  it('throws error if subscribe property already exists in target', () => {
    function createObservableObj () {
      return withSubscribe({
        a: 1,
        b: 2,
        subscribe () {}
      })
    }

    expect(createObservableObj).toThrowError()
  })

  it('is non-enumerable', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })

    expect(Object.values(foo)).toEqual([1, 2])
    expect(Object.keys(foo)).toEqual(['a', 'b'])
    expect(typeFrom(foo.subscribe)).toEqual('function')
  })

  it('returns subscription object', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })

    let subscribeCalls = 0
    const subscription = foo.subscribe(() => {
      subscribeCalls += 1
    })
    expect(typeof subscription).toEqual('object')
    expect(typeof subscription.unsubscribe).toEqual('function')

    foo.a = 3
    foo.b = 4

    expect(foo.a).toEqual(3)
    expect(foo.b).toEqual(4)
    expect(subscribeCalls).toEqual(3)

    subscription.unsubscribe()

    foo.a = 5
    foo.b = 6

    expect(foo.a).toEqual(5)
    expect(foo.b).toEqual(6)
    expect(subscribeCalls).toEqual(3)
  })
})

// Tests adapted from https://github.com/reactjs/redux/blob/4e5f7ef3569e9ef6d02f7b3043b290dc093c853b/test/createStore.spec.js#L613
describe('Symbol.observable interop point', () => {
  it('exists', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    expect(typeof foo[$$observable]).toBe('function')
  })

  describe('returned value', () => {
    it('is subscribable', () => {
      const foo = withSubscribe({
        a: 1,
        b: 2
      })
      const obs = foo[$$observable]()
      expect(typeof obs.subscribe).toBe('function')
    })

    it('returns a subscription object when subscribed', () => {
      const foo = withSubscribe({
        a: 1,
        b: 2
      })
      const obs = foo[$$observable]()
      const sub = obs.subscribe({})
      expect(typeof sub.unsubscribe).toBe('function')
    })
  })

  it('passes an integration test with no unsubscribe', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = foo[$$observable]()
    const results = []

    observable.subscribe({
      next (observed) {
        results.push({ ...observed })
      }
    })

    foo.a = 3
    foo.b = 4

    expect(results).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 2 },
      { a: 3, b: 4 }
    ])
  })

  it('passes an integration test with an unsubscribe', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = foo[$$observable]()
    const results = []

    const sub = observable.subscribe({
      next (observed) {
        results.push({ ...observed })
      }
    })

    foo.a = 3
    sub.unsubscribe()
    foo.b = 4

    expect(results).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 2 }
    ])
  })

  it('passes an integration test with a common library (RxJS)', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = Rx.Observable.from(foo)
    const results = []

    const sub = observable
      .map(snapshot => ({
        fromRx: true,
        ...snapshot
      }))
      .subscribe(snapshot => results.push(snapshot))

    foo.a = 3
    sub.unsubscribe()
    foo.b = 4

    expect(results).toEqual([
      { a: 1, b: 2, fromRx: true },
      { a: 3, b: 2, fromRx: true }
    ])
  })
})
