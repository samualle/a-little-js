function LateBloomer() {
	this.petalCount = Math.ceil(Math.random() * 12) + 1;
}

LateBloomer.prototype.declare = function() {
	console.log('I am a beautiful flower with ' + this.petalCount + ' petals!');
}

LateBloomer.prototype.bloom = function() {
	window.setTimeout(this.declare.bind(this), 1000);
}

var flower = new LateBloomer();
flower.bloom();
/*
在默认情况下，使用 window.setTimeout() 时，this 会指向 window 或 global 对象。当类的方法需要 this 指向类的实例时候，需要显式的把 this 绑定到回调函数。
*/