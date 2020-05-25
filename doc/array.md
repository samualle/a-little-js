数组去重的方法

```js
// 使用 Set 结构
[...new Set(array)];

// 使用 filter 方法进行过滤
array.filter((item, key, self) => self.indexOf(item) === key);
```

数组解析中的空值占位
```js
// 第一种解析 a = 2
const [, a] = [1, 2, 3, 4, 5];

// 第二种解析 a = [2, 3, 4, 5]
const [, ...a] = [1, 2, 3, 4, 5];
```
