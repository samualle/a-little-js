/*
创建一个装饰者 spy(func)，返回一个包装器，该包装器将所有对函数的调用保存在其 calls 属性中，每个调用保存为一个参数数组。
*/
function spy(func) {
	function wrapper(...args) {
		wrapper.calls.push(args);
		return func.apply(this, args);
	}
	wrapper.calls = [];
	
	return wrapper;
}

function work(a, b) {
	alert(a + b);
}

work = spy(work);

work(1, 2);
work(4, 5);

for (let args of work.calls) {
	alert('call: ' + args.join());
}