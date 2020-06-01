## Promise 实现原理解析

在传统的异步编程中，如果存在结果依赖，我们需要通过嵌套回调来实现。如果嵌套层数过多，可读性和可维护性就会变得很糟糕。`Promise` 将回调嵌套改为链式调用，增加了可读性和可维护性。

+ ### 观察者模式
简单的 `Promise` 使用
```js
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('result');
  }, 1000);
});

p1.then(res => console.log(res), err => console.log(err));
```
观察上述示例，分析 `Promise` 调用流程：
- `Promise` 的构造方法接收一个 `executor()`，在 `new Promise()` 时立即执行 `executor()` 回调  
- `executor()` 内部的异步任务被放入`宏/微任务`队列，等待执行  
- `then()` 被执行，收集`成功/失败`回调，放入`成功/失败`队列  
- `executor()` 的异步任务被执行，触发 `resolve/reject`，从`成功/失败`队列中取出回调依次执行

这种 `收集依赖 -> 触发通知 -> 取出依赖执行` 的方式，广泛应用于`观察者模式`的实现。在 `Promise` 里，执行的顺序是 `then 收集依赖 -> 异步触发 resolve -> resolve 执行依赖`。由此，可以勾画出 `Promise` 的大概形态。
```js
class MyPromise {
  // 构造方法接收一个回调
  constructor(executor) {
    this._resolveQueue = []; // then 收集的执行成功的回调队列
    this._rejectQueue = [];  // then 收集的执行失败的回调队列

    // 由于 resolve 和 reject 是在 executor 内部被调用，因此需要使用箭头函数固定 this 指向，否则找不到 this_resolveQueue
    let _resolve = (val) => {
      // 从成功队列里取出回调依次执行
      while (this._resolveQueue.length) {
        const callback = this.resolveQueue.shift();
        callback(val);
      }
    };

    // 实现同 resolve
    let _reject = (val) => {
      while (this._rejectQueue.length) {
        const callback = this._rejectQueue.shift();
        callback(val);
      }
    };

    // new Promise() 时立即执行 executor，并传入 resolve 和 reject
    executor(_resole, _reject);
  }

  // then 方法，接收一个成功的回调和一个失败的回调，并 push 进对应队列
  then(resolveFn, rejectFn) {
    this._resolveQueue.push(resolveFn);
    this._rejectQueue.push(rejectFn);
  }
}
```

+ ### Promise A+ 规范
`ES6` 的 `Promise` 实现需要遵循 `Promise/A+` 规范，该规范对 `Promise` 的状态控制做了要求。`Promise/A+` 规范内容较长，总结两条核心规则如下：
> 1. `Promise` 本质是一个状态机，且状态只能为三种：`Pending`（等待）、`Fulfilled`（执行）、`Rejected`（拒绝），状态的变更是单向的，只能从 `Pending` 到 `Fulfilled` 或者从 `Pending` 到 `Rejected`，状态变更不可逆转  
> 2. `then` 方法接收两个可选参数，分别对应状态改变时触发的回调，`then` 方法返回一个 `Promise`，且可以被同一个 `Promise` 调用多次

根据规范，完善 MyPromise 的代码如下：
```js
// promise
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  // executor
  constructor(executor) {
    this._status = PENDING;
    this._resolveQueue = [];
    this._rejectQueue = [];

    let _resolve = (val) {
      if (this._status !== PENDING) return;
      this._status = FULFILLED;

      while (this._resolveQueue.length) {
        const callback = this._resolveQueue.shift();
        callback(val);
      }
    };

    let _reject = (val) {
      if (this._status !== PENDING) return
      this._status = REJECTED;

      while (this._rejectQueue.length) {
        const callback = this._rejectQueue.shift();
        callback(val);
      }
    };

    executor(_resolve, _reject);
  }

  then(resolveFn, rejectFn) {
    this._resolveQueue.push(resolveFn);
    this._rejectQueue.push(rejectFn);
  }
}
```

+ ### then 的链式调用
链式调用是 `Promise` 实现的重点和难点，先看一下 `Promise` 是如何实现 `then` 的链式调用：
```js
const p1 = new Promise((resolve, reject) => {
  resolve(1);
});
p1.then(res => {
  console.log(res);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 1000);
  });
}).then(res => {
  console.log(res);

  return 3;
}).then(res => {
  console.log(res);
})
```
思考链式调用的实现：
- 显然 `.then()` 需要返回一个 `Promise`，这样才能找到 `then` 方法，所以把 `then` 方法的返回值包装成 `Promise`  
- `.then()` 的回调需要拿到上一个 `.then()` 的返回值  
- `.then()` 的回调需要顺利执行，要等到当前 `Promise` 的状态变更，再执行下一个 `then` 方法收集的回调，这就需要对 `then` 的返回值分别处理
```js
then(resolveFn, rejectFn) {
  return new MyPromise((resolve, reject) => {
    const fulfilledFn = (value) => {
      try {
        let x = resolveFn(value);

        x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
      } catch (error) {
        reject(error);
      }
    }
    this._resolveQueue.push(fulfilledFn);

    const rejectedFn = (error) => {
      try {
        let x = rejectFn(error);
        x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
      } catch (error) {
        reject(error);
      }
    }
    this._rejectQueue.push(rejectedFn);
  });
}
```

+ ### 值穿透 & 状态已变更
链式调用已经初步成形，但是对于 then 方法，还有两个细节需要处理。
- 值穿透：根据规范，如果 then() 接收的参数不是 function，就要忽略掉。否则会抛出异常，导致链式调用中断  
- 状态已变更：上面对于 then() 的改写只是对应了状态为 Pending 的情况。有时候也会出现，resolve 或 reject 在 then() 之前就已经执行了的情况，比如 Promise.resolve().then()。这种情况下，push 进 resolve 或 reject 执行队列的 then 回调不会被执行。因此对于状态已经变为 Fulfilled 或者 Rejected 的情况，直接执行 then 回调
```js
then(resolveFn, rejectFn) {
  typeof resolveFn !== 'function' &&
    (resolveFn = (value) => value);
  typeof rejectFn !=== 'function' &&
    (rejectFn = (reason) => {
      throw new Error(
        reason instanceof Error ? reason.message : reason
      );
    });
  
  return new MyPromise((resolve, reject) => {
    const fulfilledFn = (value) => {
      try {
        let x = resolveFn(value);
        x instanceof MyPromise ? x.then(resolve, reject) : resole(x);
      } catch (error) {
        reject(error);
      }
    };

    const rejectedFn = (error) => {
      try {
        let x = rejectFn(error);
        x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
      } catch (error) {
        reject(error);
      }
    };

    switch (this._status) {
      case PENDING:
        this._resolveQueue.push(fulfilledFn);
        this._rejectQueue.push(rejectedFn);
        break;
      case FULFILLED:
        fulfilledFn(this._value);
        break;
      case REJECTED:
        rejectedFn(this._value);
        break;
    }
  });
}
```

+ ### 兼容同步任务
上文说过，`Promise` 的执行顺序是 `new Promise -> then()收集回调 -> resolve/reject` 执行回调。然而，这种顺序取决于 `executor` 是异步任务。如果 `executor` 是同步任务，执行顺序就会变成 `new Promise -> resolve/reject 执行回调 -> then()收集回调`。为此，需要把 `resolve/reject` 执行回调的操作包裹在 `setTimeout` 里，改为异步执行。
> - 规范没有限定回调应该放入宏任务还是微任务  
> - `Promise` 的默认实现把回调放入了微任务  
> - 使用 `setTimeout` 等于把回调放入了宏任务  
> - 可以使用 `MutationObserver` 模拟微任务
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._resolveQueue = [];
    this._rejectQueue = [];

    let _resolve = (val) => {
      setTimeout(() => {
        if (this._status !== PENDING) return;
        this._status = FULFILLED;
        this._value = val;

        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift();
          callback(val);
        }
      });
    };

    let _reject = (val) => {
      setTimeout(() => {
        if (this._status !== PENDING) return;
        this._status = REJECTED;
        this._value = val;

        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift();
          callback(val);
        }
      });
    };

    executor(_resolve, _reject);
  }

  then(resolveFn, rejectFn) {
    typeof resolveFn !== 'function' &&
      (resolveFn = (value) => value);
    typeof rejectFn !== 'function' &&
      (rejectFn = (reason) => {
        throw new Error(
          reason instanceof Error ? reason.message : reason
        );
      });
    
    return new MyPromise((resolve, reject) => {
      const fulfilledFn = (value) => {
        try {
          let x = resolveFn(value);
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      };

      const rejectedFn = (error) => {
        try {
          let x = rejectFn(error);
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        }
      };

      switch (this._status) {
        case PENDING:
          this._resolveQueue.push(fulfilledFn);
          this._rejectQueue.push(rejectedFn);
          break;
        case FULFILLED:
          fulfilledFn(this._status);
          break;
        case REJECTED:
          rejectedFn(this._value);
          break;
      }
    });
  }
}
```
至此，已经实现 Promise 的主要功能。

+ ### Promise.prototype.catch()
> `catch()` 方法返回一个 Promise，处理拒绝的情况。等同于调用 `Promise.prototype.then(undefined, onRejected)`
```js
catch (rejectFn) {
  return this.then(undefined, rejectFn);
}
```

+ ### Promise.prototype.finally()
> - `finally()` 方法返回一个 `Promise`，无论结果是 `Fulfilled` 还是 `Rejected`，都会执行指定的回调函数  
> - 在 `finally` 之后，还可以继续 `then`，并且会将值传递给后面的 `then`
```js
finally(callback) {
  return this.then(
    (value) => MyPromise.resolve(callback()).then(() => value),
    (reason) => MyPromise.resolve(callback()).then(() => {throw reason}),
  );
}
```
> `MyPromise.resolve(callback())` 的意义，这个写法涉及到finally()的一个使用细节。finally()如果 return 了一个 Rejected 状态的 Promise，将会改变当前 Promise 的状态，这个写法用于改变 Promise 的状态。

+ ### Promise.resolve()
```js
static resolve(value) {
  if (value instanceof MyPromise) return value;
  return new MyPromise(resolve => resolve(value));
}
```

+ ### Promise.reject()
```js
static reject(reason) {
  return new MyPromise((resolve, reject) => reject(reason));
}
```

+ ### Promise.all()
```js
static all(promiseArr) {
  let index = 0;
  let result = [];

  return new MyPromise((resolve, reject) => {
    promiseArr.forEach((p, i) => {
      MyPromise.resolve(p).then(
        val => {
          index++;
          result[i] = val;

          if (index === promiseArr.length) {
            resolve(result);
          }
        },
        err => {
          reject(err);
        },
      );
    });
  });
}
```

+ ### Promise.race()
> Promise.race(iterable)方法返回一个 Promise，一旦迭代器中的某个 Promise resolve 或者 reject，返回的 Promise 就会 resolve 或者 reject
```js
static race(promiseArr) {
  return new MyPromise((resolve, reject) => {
    for (let p of promiseArr) {
      MyPromise.resolve(p).then(
        value => {
          resolve(value);
        },
        err => {
          reject(err);
        },
      );
    }
  });
}
```

+ ### 完整代码
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._resolveQueue = [];
    this._rejectQueue = [];

    let _resolve = (val) => {
      setTimeout(() => {
        if (this._status !== PENDING) return;
        this._status = FULFILLED;
        this._value = val;

        while (this._resolveQueue.length) {
          const callback = this._resolveQueue.shift();
          callback(val);
        }
      });
    };

    let _reject = (val) => {
      setTimeout(() => {
        if (this._status !== PENDING) return;
        this._status = REJECTED;
        this._value = val;

        while (this._rejectQueue.length) {
          const callback = this._rejectQueue.shift();
          callback(val);
        }
      });
    };

    executor(_resolve, _reject);
  }

  then(resolveFn, rejectFn) {
    typeof resolveFn !== 'function' && (resolveFn = (value) => value);
    typeof rejectFn !== 'function' &&
      (rejectFn = (reason) => {
        throw new Error(reason instanceof Error ? reason.message : reason);
      });
    
    return new MyPromise((resolve, reject) => {
      const fulfilledFn = value => {
        try {
          let x = resolveFn(value);
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      };

      const rejectedFn = error => {
        try {
          let x = rejectFn(error);
          x instanceof MyPromise ? x.then(resolve, reject) : resolve(x);
        } catch (error) {
          reject(error);
        }
      };

      switch (this._status) {
        case PENDING:
          this._resolveQueue.push(fulfilledFn);
          this._rejectQueue.push(rejectedFn);
          break;
        case FULFILLED:
          fulfilledFn(this._value);
          break;
        case REJECTED:
          rejectedFn(this._value);
          break;
      }
    });
  }

  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }

  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason }),
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promiseArr) {
    let index = 0;
    let result = [];

    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        MyPromise.resolve(p).then(
          val => {
            index++;
            result[i] = val;

            if (index === promiseArr.length) {
              resolve(result);
            }
          },
          err => {
            reject(err);
          }
        );
      });
    });
  }

  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(
          value => {
            resolve(value);
          },
          err => {
            reject(err);
          }
        );
      }
    });
  }
}
```

从一个简单的 Promise 使用示例开始，通过对调用流程的分析，根据观察者模式实现了 Promise 的基本骨架，然后依据 PromiseA+规范填充代码，重点实现了 then 的链式调用，最后完成 Promise 的静态方法和实例方法。
