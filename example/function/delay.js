/*
创建一个装饰者 delay(f, ms)，该装饰者将 f 的每次调用延时 ms 毫秒
注意箭头函数的使用，箭头函数没有自己的 this 和 arguments，所以 f.apply(this, arguments) 从包装器中获取 this 和 arguments
*/
function delay(f, ms) {
	return function() {
		setTimeout(() => f.apply(this, arguments), ms);
	};
}

let f1000 = delay(alert, 1000);
f1000("test delay");