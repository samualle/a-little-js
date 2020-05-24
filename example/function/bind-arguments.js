function list() {
	console.log(arguments);
	return Array.prototype.slice.call(arguments);
}

function addArguments(arg1, arg2) {
	return arg1 + arg2;
}

var list1 = list(1, 2, 3);
var result1 = addArguments(1, 2);

// 为绑定函数添加预设参数，当调用时，预设参数会插入到参数列表的开始位置，传递的参数跟随在后面
var leadingThirtysevenList = list.bind(null, 37);
var addThirtyseven = addArguments.bind(null, 37);

var list2 = leadingThirtysevenList();
var list3 = leadingThirtysevenList(1, 2, 3);

var result2 = addThirtyseven(5);
var result3 = addThirtyseven(5, 10); // 忽略多余参数

console.log(list1);
console.log(list2);
console.log(list3);

console.log(result1);
console.log(result2);
console.log(result3);