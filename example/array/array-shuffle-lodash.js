var arr = []; // 初始化一个空数组

for (var i = 0; i < 10; i++) {
	arr.push(i); // 填充数组
}
console.log('原始: ' + arr);

// Fisher-Yates shuffle
function shuffle(array) {
	var length = array === null ? 0 : array.length;
	if (!length) {
		return [];
	}
	var index = -1;
	var lastIndex = length - 1;
	var result = [];
	while (++index < length) {
		var rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
		var value = array[rand];
		array[rand] = array[index];
		array[index] = value;
		result.push(value);
		console.log('步进: ' + array);
	}
	console.log('对比: ' + result);
	return array;
}

arr2 = shuffle(arr);
console.log('结果: ' + arr);