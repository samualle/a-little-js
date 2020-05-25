function greet() {
	var reply = [this.animal, 'typically sleep between', this.sleepDuration].join(' ');
	console.log(reply);
}

var obj = {
	animal: 'cats', sleepDuration: '12 and 16 hours'
};

greet.call(obj);
/*
通过指定 this 参数，把函数内部的 this 指向参数代表的对象实例，否则指向全局对象实例
*/

var sData = 'Wisen';

function display() {
	console.log('sData value is %s ', this.sData);
}

display.call();
/*
这里没有指定 this 参数，因此指向全局对象，在严格模式下，this 指向 undefined
*/