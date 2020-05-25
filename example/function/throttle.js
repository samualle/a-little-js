/*
节流装饰者
返回一个包装器，最多每个 1ms 将调用传递给 f 一次，那些冷却期的调用将被忽略。
如果被忽略的调用是冷却期的最后一次，那么会在延时结束后执行。
比如，我们想要跟踪鼠标的移动，当指针移动的时候，更新网页上的某些信息。但是，鼠标的移动是连续的，过于频繁的更新没有意义。因此我们可以使用包装者来进行节流操作，而不必修改原有的更新函数，而且可以灵活的设置冷却时间。
*/

function throttle(f, ms) {
	let isThrottled = false,
	  savedArgs,
	  savedThis;
	
	function wrapper() {
		if (isThrottled) {
			savedArgs = arguments;
			savedThis = this;
			return;
		}
		
		f.apply(this, arguments);
		isThrottled = true;
		
		setTimeout(function() {
			isThrottled = false;
			if (savedArgs) {
				wrapper.apply(savedThis, savedArgs);
				savedArgs = null;
				savedThis = null;
			}
		}, ms);
	}
	
	return wrapper;
}

function f(a) {
	console.log(a);
}

let f1000 = throttle(f, 1000);

f1000(1);
f1000(2);
f1000(3);