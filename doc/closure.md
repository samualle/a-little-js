闭包的知识要点：
-

> [爱吐泡泡的小鱼儿](https://juejin.im/post/5ebfb6476fb9a0432f1004ae)

> 不是所有的函数嵌套都能形成闭包
> 

+ 作用域
  + 全局作用域
  + 函数作用域
  + 块级作用域，ES6 新增，使用 let 和 const 解决 var 的变量提升问题
+ 作用域链
  + 作用域嵌套形成作用域链
  + 外部作用域无法访问内部作用域
+ 作用域模型
  + 词法作用域：静态，按照编码时的位置来决定
  + 动态作用域：目前在使用的有 Perl，Bash 等
+ 概念理解：
  + 当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数在当前词法作用域外执行
  + 闭包是指有权访问另一个函数作用域中的变量的函数
  + 当一个变量不是函数的内部变量，相对于作用域来说，就是一个外部变量，这样就会形成闭包

+ 一个示例 demo
```js
let count = 500; // 全局作用域
function foo1() {
  let count = 0; // 函数作用域，外层
  function foo2() {
    count++; // 函数作用域，内层
    console.log(count);
    return count;
  }
  return foo2; // 返回函数
}
let result = foo1();
result(); // output: 1
result(); // output: 2
```

+ 认识作用域
```js
let count = 100; // 全局作用域中的 count
function foo() {
  let count = 0; // 函数作用域中的 count
  return count;
}
for (let count = 0; count < 10; count++) {
  // 块级作用域中的 count
  console.log('for: ', count);
}
console.log('all: ', count);
console.log('foo: ', foo());
```

+ 作用域链
```js
function foo() {
  var n = 1;

  function bar() {
    var m = 2;
    console.log(n);
  }
  bar();
}
foo();
console.log(n);
```

+ 词法作用域
```js
var name = 'Mike';

function showName() {
  console.log(name);
}

function changeName() {
  var name = 'Jay';
  showName();
}
changeName();
/*
[output]-> Mike
*/
```

经典的题目：
+ 循环中使用异步方法输出循环变量的值
```js
for (var i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    debugger;
    console.log(i); // 输出结果是什么？
  }, 1000);
}
/*
[output]-> 6 6 6 6 6
*/
```
> 结果超出我们的预期值

- [x] 改用 let 声明循环变量，发挥块级作用域的作用
```js
for (let i = 1; i <= 5; i++) {
  setTimeout(function timer() {
    debugger;
    console.log(i);
  }, 1000);
}
/*
[output]-> 1 2 3 4 5
*/
```

- [x] 把异步方法放到一个函数里，形成函数作用域
```js
for (var i = 1; i <= 5; i++) {
  log(i);
}
function log(i) {
  setTimeout(function timer() {
    debugger;
    console.log(i);
  }, 1000);
}
/*
[output]-> 1 2 3 4 5
*/
```

- [x] 把异步方法放到立即执行函数里，形成函数作用域
```js
for (var i = 1; i <= 5; i++) {
  (function(i) {
    setTimeout(function timer() {
      debugger;
      console.log(i);
    }, 1000);
  })(i)
}
/*
[output]-> 1 2 3 4 5
*/
```
