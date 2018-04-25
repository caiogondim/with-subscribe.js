/* eslint-env jest */

const withSubscribe = require('./index')
const Rx = require('rxjs')
const $$observable = require('symbol-observable').default

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

// Tests adapted from https://github.com/reactjs/redux/blob/4e5f7ef3569e9ef6d02f7b3043b290dc093c853b/test/createStore.spec.js#L613
describe('Symbol.observable interop point', () => {
  it('should exist', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    expect(typeof foo[$$observable]).toBe('function')
  })

  describe('returned value', () => {
    it('should be subscribable', () => {
      const foo = withSubscribe({
        a: 1,
        b: 2
      })
      const obs = foo[$$observable]()
      expect(typeof obs.subscribe).toBe('function')
    })

    it('should throw a TypeError if an observer object is not supplied to subscribe', () => {
      const foo = withSubscribe({
        a: 1,
        b: 2
      })
      const obs = foo[$$observable]()

      expect(function () {
        obs.subscribe()
      }).toThrowError(new TypeError('Expected the observer to be an object.'))

      expect(function () {
        obs.subscribe(null)
      }).toThrowError(new TypeError('Expected the observer to be an object.'))

      expect(function () {
        obs.subscribe(() => {})
      }).toThrowError(new TypeError('Expected the observer to be an object.'))

      expect(function () {
        obs.subscribe({})
      }).not.toThrow()
    })

    it('should return a subscription object when subscribed', () => {
      const foo = withSubscribe({
        a: 1,
        b: 2
      })
      const obs = foo[$$observable]()
      const sub = obs.subscribe({})
      expect(typeof sub.unsubscribe).toBe('function')
    })
  })

  it('should pass an integration test with no unsubscribe', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = foo[$$observable]()
    const results = []

    observable.subscribe({
      next (observed) {
        results.push({
          a: observed.a,
          b: observed.b
        })
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

  it('should pass an integration test with an unsubscribe', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = foo[$$observable]()
    const results = []

    const sub = observable.subscribe({
      next (observed) {
        results.push({
          a: observed.a,
          b: observed.b
        })
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

  it('should pass an integration test with a common library (RxJS)', () => {
    const foo = withSubscribe({
      a: 1,
      b: 2
    })
    const observable = Rx.Observable.from(foo)
    const results = []

    const sub = observable
      .map(snapshot => ({
        fromRx: true,
        a: snapshot.a,
        b: snapshot.b
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
