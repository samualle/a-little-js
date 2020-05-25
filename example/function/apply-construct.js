// 此方式使用 Object.create() 方法，相对比较新。
Function.prototype.construct = function(aArgs) {
	var oNew = Object.create(this.prototype);
	this.apply(oNew, aArgs);
	return oNew;
};

// 使用 Object__proto__ 做替代方案
Function.prototype.construct = function(aArgs) {
	var oNew = {};
	oNew.__proto__ = this.prototype;
	this.apply(oNew, aArgs);
	return oNew;
};

// 使用闭包的方式做替代方案
Function.prototype.construct = function(aArgs) {
	var fConstructor = this,
	    fNewConstr = function() {
		fConstructor.apply(this, aArgs);
	};
	fNewConstr.prototype = fConstructor.prototype;
	return new fNewConstr();
};

// 使用 Function 构造器做替代方案
Function.prototype.construct = function(aArgs) {
	var fNewConstr = new Function("");
	fNewConstr.prototype = this.prototype;
	var oNew = new fNewConstr();
	this.apply(oNew, aArgs);
	return oNew;
}

// 使用示例
function MyConstructor(arguments) {
	for (var nProp = 0; nProp < arguments.length; nProp++) {
		this["property" + nProp] = arguments[nProp];
	}
}

var myArray = [4, "Hello world", false];
var myInstance = new MyConstructor(myArray);

console.log(myInstance.property1);
console.log(myInstance instanceof MyConstructor);
console.log(myInstance.constructor);