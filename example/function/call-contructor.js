function Product(name, price) {
	this.name = name;
	this.price = price;
}

function Food(name, price) {
	Product.call(this, name, price);
	this.category = 'food';
}

function Toy(name, price) {
	Product.call(this, name, price);
	this.category = 'toy';
}

var cheese = new Food('feta', 5);
var fun = new Toy('robot', 40);
console.log(cheese);
console.log(fun);

/*
通过调用父构造函数的 call 方法来实现继承
使用 Food 和 Toy 构造函数创建的实例，都会拥有在 Product 构造函数中添加的 name 属性和 price 属性

Food { name: 'feta', price: 5, category: 'food' }
Toy { name: 'robot', price: 40, category: 'toy' }
*/