## this 指向的知识要点

> [徒手掰榴莲](https://juejin.im/post/5ec9cfd0f265da76e81a28c7)

> 注意事项

```js
function foo(num) {
  console.log('foo: ', num);
  this.count++;
}

foo.count = 0;
for (var i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}

console.log(foo.count);
```

+ 引擎在作用域中的查找规则
```js
function foo(a) {
  var b = a * 2;

  function bar(c) {
    console.log(a, b, c);
  }

  bar(b * 3);
}

foo(2);
```
> 1. 引擎在查找标识符时，总是会从当前作用域开始查找，直至找到第一个匹配选项为止。  
> 2. 如果当前作用域找不到该标识符，则外延一层作用域，继续进行查找，直至找到第一个匹配选项。  
> 3. 最后延伸到全局作用域，如果仍然找不到，则在全局作用域中新建一个标识符，然后返回该标识符。

+ 没有查找到标识符的情况
```js
function foo(obj) {
  with (obj) {
    a = 2;
  }
}

var o1 = {
  a: 3
};

var o2 = {
  b: 3
};

foo(o1);
console.log(o1.a);

foo(o2);
console.log(o2.a);
console.log(a);
```
> 1. 以 o1 为参数调用 foo 的时候，因为实参 o1 中存在 a 属性，而且 o1 作为对象实例，传参的时候传递的是引用而非拷贝，所以形参 obj 实际上和 o1 都指向了同一个对象实例，因此 obj 中存在属性 a，因此可以直接修改 a 属性的值，因此 o1.a 的输出结果为 2  
> 2. 以 o2 为参数调用 foo 的时候，和上述情况相同。不同的地方在于，o2 中没有 a 属性，因此引擎外延一层进行查找，foo 里也没有 a 变量，继续向外层查找。直到全局作用域，仍然没有找到 a 变量。于是在全局作用域中创建了 a 变量并返回，返回后赋值为 2

+ 上述示例略作修改之后
```js
function foo(obj) {
  var a;
  with (obj) {
    a = 2;
  }
  if (!obj.a) {
    obj.c = a;
  }
}

var o1 = {
  a: 3
};

var o2 = {
  b: 3
}

foo(o1);
console.log(o1.a);

foo(o2);
console.log(o2.a);
console.log(o2.c);
```
> 1. 当 o1 里有 a 的时候，执行结果与上述示例结果一致。  
> 2. 当 o2 里面没有 a，但是 foo 里面有 a 的时候，foo 内部的 a 被赋值为 2，没有继续扩大查找范围

### 深入调用位置

this 的绑定发生在函数调用时，this 的指向取决于函数的调用位置。
分析调用栈可以更好的确认调用位置。
调用栈中存储了函数的调用序列，倒序排序，栈顶进行出栈入栈操作。
可以使用浏览器内置的开发者工具来查看调用栈，使用 debugger 指令开启。
```js
function baz() {
  console.log('baz');
  bar();
}

function bar() {
  console.log('bar');
  foo();
}

function foo() {
  console.log('foo');
}

baz();
```
> Call Stack: `baz() -> bar() -> foo()`

### 绑定规则
了解了调用栈也就了解了函数的调用位置，然后需要判断适用的绑定规则。

+ #### 默认绑定
```js
function foo() {
  console.log(a);
}

var a = 2;
foo();
// [output]-> 2
```
> 这里的 this 指向全局作用域，函数在全局中进行调用，没有任何修饰，一般适用默认绑定。

+ #### 隐式绑定
```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 2,
  foo: foo,
};

obj.foo();
// [output]-> 2
```
> 在上下文对象中调用函数时，隐式绑定把 this 指向当前上下文对象。

+ 对象属性链
```js
function foo() {
  console.log(this.a);
}

var obj2 = {
  a: 1,
  foo: foo,
};

var obj1 = {
  a: 2,
  obj2: obj2,
};

obj1.obj2.foo();
// [output]-> 1
```
> + 连续的函数调用会有调用栈序列，函数包含在一连串对象中即`对象属性链`。  
> + 对象属性链中，调用位置遵循临近的原则，只在第一层对象中进行绑定。  
> + 隐式绑定存在丢失的问题。`一个最常见的 this 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把 this 绑定到全局对象或 undefined 上。`

+ 隐式绑定丢失
```js
function foo() {
  console.log(this.a);
}

var obj = {
  a: 1,
  foo: foo,
};

var bar = obj.foo; // 传递函数，隐式绑定丢失
var a = 'hello';

bar();
// [output]-> hello
```

+ #### 显式绑定
    + `func.call(this)`
    + `func.apply(this)`
    + `func.bind(this)`

> 显式绑定很好理解，我们可以显式的指定 this 绑定的对象。  
> 上述三种方法可以达成显式绑定的效果。  
> 需要注意的是，一旦完成显式绑定之后，便无法再次绑定了。
```js
var obj1 = {
  a: 1,
  say: function() {
    console.log(this.a);
  },
};

var obj2 = {
  a: 2,
  say: function() {
    obj1.say.call(this);
  },
};

obj1.say();
obj2.say();
```

+ #### new 绑定
```js
function foo(a) {
  this.a = a;
}

var bar = new foo(2);
console.log(bar.a);
// [output]-> 2
```
> 使用 new 来调用函数，先创建一个新的对象，再把新对象绑定到函数的 this

### 绑定优先级
我们发现一个调用可能应用多条规则，这时就要考虑绑定规则的优先级。

+ #### 隐式绑定 vs 显式绑定
```js
function foo() {
  console.log(this.a);
}

var obj1 = {
  a: 2,
  foo: foo,
};

var obj2 = {
  a: 3,
  foo: foo,
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call(obj2); // 3
obj2.foo.call(obj1); // 2
```
> 从上述示例可以看出，显式绑定的优先级要高于隐式绑定，在隐式绑定之后仍然可以使用显式绑定。

+ #### new 绑定 vs 隐式绑定
```js
function foo(something) {
  this.a = something;
}

var obj1 = {
  foo: foo,
};

obj1.foo(2);
console.log(obj1.a); // 2

var bar = new obj1.foo(4);
console.log(obj1.a);
console.log(bar.a);
```
> 从上述示例可以看出，new 绑定的优先级要高于隐式绑定，在隐式绑定之后仍然可以使用 new 绑定。

+ #### new 绑定 vs 显式绑定
```js
function foo(something) {
  this.a = something;
}

var obj1 = {};
var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); // 2

var baz = new bar(3);
console.log(obj1.a); // 2
console.log(baz.a); // 3
```
> 从上述示例可以看出，new 绑定的优先级高于显式绑定，在显式绑定之后仍然可以使用 new 绑定。

### 箭头函数中 this 的指向
箭头函数没有多个规则，不用考虑绑定的四个规则，箭头函数的 this 是根据外层作用域来决定的。
```js
var obj = {
  count: 0,
  cool: function() {
    console.log(this);
    setTimeout(() => {
      console.log(this);
      this.count++;
      console.log("awesome?");
    }, 100);
  },
};

obj.cool();
```
> 1. 类中方法的 this 指向类实例
> 2. function 中的 this 指向函数调用者
> 3. 箭头函数中 this 向上查找最近的 function 作用域
