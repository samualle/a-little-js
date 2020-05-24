function shuffle(arr) {
	let i = arr.length;
	while (--i) {
		let j = Math.floor(Math.random() * i);
		[arr[j], arr[i]] = [arr[i], arr[j]];
	}
}

// Fisher–Yates shuffle ES6
// https://www.cnblogs.com/macq/p/6650586.html