this.x = 9;
var module = {
	x: 81,
	getX: function() {
		return this.x;
	}
};

var m = module.getX(); // 此处调用，this 指向当前对象

var retrieveX = module.getX;
var r = retrieveX(); // 此处调用，this 指向全局对象

var boundGetX = retrieveX.bind(module);
var b = boundGetX(); // 绑定 module 后，this 指向 module

console.log('m =', m, ' r =', r, ' b =', b);