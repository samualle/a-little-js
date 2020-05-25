var numbers = [5, 6, 2, 3, 7];

var max = Math.max.apply(this, numbers);
var min = Math.min.apply(null, numbers);

console.log(max);
console.log(min);

/*
注意：上述方式调用 apply 方法，有超出 JavaScript 引擎的参数长度限制的风险，JavaScript 核心中做了硬编码，参数个数限制为 65536
*/

// 如果参数数组可能非常大，推荐下述方式来处理，参数数组分块后循环传入
function minOfArray(arr) {
	var min = Infinity;
	var QUANTUM = 32768;
	
	for (var i = 0, len = arr.length; i < len; i += QUANTUM) {
		var submin = Math.min.apply(null, arr.slice(i, Math.min(i + QUANTUM, len)));
		min = Math.min(submin, min);
	}
	return min;
}

console.log(minOfArray([3, 5, 0, 7, 1]));