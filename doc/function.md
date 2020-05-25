- 立即执行函数可以写成箭头函数的形式
```js
//
(() => {
  console.log('Welcome to my world.');
})()

//
(() => console.log('Welcome to my world.'))()

//
((value) => console.log(value))(item = 4)
```

- 使用`立即执行函数`（`Immediately-Invoked Function Expression`），可以达到不暴露私有成员的目的

```js
var module = (function() {
  var _count = 0;
  var m1 = function() {
    console.log(_count);
  };
  var m2 = function() {
    console.log(_count + 1);
  };

  return {
    method1: m1,
    method2: m2,
  };
})()
```
`使用上述写法，外部代码无法读取内部的 _count 变量`
