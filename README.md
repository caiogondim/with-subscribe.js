# with-subscribe

<div>
  <img src="https://travis-ci.com/caiogondim/monocle-decorators.js.svg?token=rC867oquXMnLzSZmNcfx&branch=master" alt="Travis CI"> <a href="https://www.npmjs.com/package/with-subscribe"><img src="https://img.shields.io/npm/v/with-subscribe.svg" /></a>
</div>

<br>

Minimal Observable interface to watch for object modifications.

## Installation

```console
npm install --save with-subscribe
```

## Usage

On a constructor:
```js
class Counter {
  constructor() {
    this.count = 0
  }

  increment() {
    this.count += 1
  }
}
const CounterWithSubscribe = withSubscribe(Counter)
const counter = new CounterWithSubscribe()

counter.subscribe(() => console.log('State:', counter.count)) // -> State: 0

counter.increment() // -> State: 1
counter.increment() // -> State: 2
```

As a decorator:
```js
@withSubscribe
class Counter {
  constructor() {
    this.count = 0
  }

  increment() {
    this.count += 1
  }
}
const counter = new Counter()

counter.subscribe(() => console.log('State:', counter.count)) // -> State: 0

counter.increment() // -> State: 1
counter.increment() // -> State: 2
```

On an object:
```js
const counter = withSubscribe({
  count: 0,
  increment() {
    this.count += 1
  }
})

counter.subscribe(() => console.log('State:', counter.count)) // -> State: 0

counter.increment() // -> State: 1
counter.increment() // -> State: 2
```

---

[caiogondim.com](https://caiogondim.com) &nbsp;&middot;&nbsp;
GitHub [@caiogondim](https://github.com/caiogondim) &nbsp;&middot;&nbsp;
Twitter [@caio_gondim](https://twitter.com/caio_gondim)
