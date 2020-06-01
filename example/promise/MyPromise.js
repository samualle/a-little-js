const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this._status = PENDING;
    this._value = undefined;
    this._resolveQueue = [];
    this._rejectQueue = [];

    let _resolve = val => {
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

    let _reject = val => {
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
    typeof resolveFn !== 'function' && (resolveFn = value => value);
    typeof rejectFn !== 'function' &&
      (rejectFn = reason => {
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
        } catch (err) {
          reject(err);
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
      reason => MyPromise.resolve(callback()).then(() => { throw reason; }),
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
          },
        );
      });
    });
  }

  static race(promiseArr) {
    return new MyPromise((resolve, reject) => {
      for (let p of promiseArr) {
        MyPromise.resolve(p).then(
          val => {
            resolve(val);
          },
          err => {
            reject(err);
          },
        );
      }
    });
  }
}

const p1 = new MyPromise((resolve, reject) => {
  resolve(1);
});

p1
  .then(res => {
    console.log(res);
    return 2;
  })
  .then()
  .then(res => {
    console.log(res);
    return new MyPromise((resolve, reject) => {
      resolve(3);
    });
  })
  .then(res => {
    console.log(res);
    throw new Error('reject测试');
  })
  .then(() => { }, err => {
    console.log(err);
  });
