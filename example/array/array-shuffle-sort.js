var arr = []; // 初始化一个空数组

for (var i = 0; i < 100; i++) {
	arr.push(i); // 填充数组
}
console.log(arr);

arr.sort(function() {
	return 0.5 - Math.random(); // 根据随机数是否大于 0 来排序
});
console.log(arr);

/*
此算法可以满足简单需求，但不能实现理想的随机，元素大概率停留在初始位置
在 sort 排序中，元素之间的比较次数通常小于 n(n-1)/2，而理想的乱序方案中，元素之间的比较次数要达到 n(n-1)。因此 sort不能实现理想的随机
*/