var array = ['a', 'b', 'c'];
var elements = [1, 2, 3];

array.push.apply(array, elements);

console.info(array);

/*
此方法和 concat 方法的效果一样，区别是，concat 合并数组后生成了新的数组，而上述方法是在原数组上进行合并，改变了原始数据，不适合要求不变性的场景。
*/