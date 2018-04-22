const typeFrom = require('type-from')

function implementSubscribeInterface (target) {
  let subscribers = []

  target.subscribe = callback => {
    subscribers.push(callback)

    return () => {
      subscribers = subscribers.filter(subscriber => subscriber !== callback)
    }
  }

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
      return implementSubscribeInterface(instance)
    }
  } else {
    return implementSubscribeInterface(target)
  }
}

module.exports = withSubscribe
