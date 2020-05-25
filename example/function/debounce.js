/*
debounce(f, ms) 装饰者的返回结果是一个包装器，允许每隔 ms 毫秒将调用传递给 f 一次。
在实际使用中，对于那些用于检索或更新某些内容的函数，如果短时间内不会频繁更新内容，debounce 函数就很有用，减少了资源浪费
*/
function debounce(f, ms) {
	let isCooldown = false;
	
	return function() {
		if (isCooldown) return;
		
		f.apply(this, arguments);
		isCooldown = true;
		
		setTimeout(() => isCooldown = false, ms);
	}
}

let f = debounce(alert, 1000);

f(1);
f(2);

setTimeout(() => f(3), 100);
setTimeout(() => f(4), 1100);
setTimeout(() => f(5), 1500);