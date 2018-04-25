const $$observable = require('symbol-observable').default
const pipe = require('tubo')
const typeFrom = require('type-from')

/**
 * Interoperability point for observable/reactive libraries.
 * @returns {observable} A minimal observable of state changes.
 * For more information, see the observable proposal:
 * https://github.com/tc39/proposal-observable
 */
function implementObservableInterface (target) {
  Object.defineProperty(target, $$observable, {
    enumerable: false,
    value: function () {
      return ({
        subscribe (observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.')
          }

          function observeState () {
            if (observer.next) {
              observer.next(target)
            }
          }

          observeState()
          const unsubscribe = target.subscribe(observeState)
          return { unsubscribe }
        },

        [$$observable] () {
          return this
        }
      })
    }
  })

  return target
}

function implementSubscribeInterface (target) {
  let subscribers = []

  if (target.subscribe !== undefined) {
    throw new Error('A subscribe property is already present on target object')
  }

  Object.defineProperty(target, 'subscribe', {
    enumerable: false,
    value: callback => {
      subscribers.push(callback)

      return () => {
        subscribers = subscribers.filter(subscriber => subscriber !== callback)
      }
    }
  })

  return new Proxy(target, {
    set (target_, key, value) {
      target_[key] = value
      subscribers.forEach(subscriber => subscriber(target_))
      return true
    }
  })
}

function withSubscribe (target) {
  if (typeFrom(target) === 'function') {
    return function (...args) {
      // eslint-disable-next-line new-cap
      const instance = new target(...args)
      return pipe(
        instance,
        implementSubscribeInterface,
        implementObservableInterface
      )
    }
  } else {
    return pipe(
      target,
      implementSubscribeInterface,
      implementObservableInterface
    )
  }
}

module.exports = withSubscribe
