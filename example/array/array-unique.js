// array
let arr = [1, 4, 2, 4, 1, 3, 7, 5, 3];

// Set ES6
[...new Set(arr)];
Array.from(new Set(arr));

// sort 改变原数组
let array1 = [...arr].sort();
let array2 = [array1[0]];
for (let i = 1; i < array1.length; i++) {
  if (array1[i] !== array1[i - 1]) {
    array2.push(array1[i]);
  }
}
 
// indexOf
let array = [];
for (let i = 0; i < arr.length; i++) {
  if (array.indexOf(arr[i]) === -1) {
    array.push(arr[i]);
  }
}

// includes ES6
let array = [];
for (let i = 0; i < arr.length; i++) {
  if (!array.indexOf(arr[i])) {
    array.push(arr[i]);
  }
}

// filter
arr.filter((item, key, self) => self.indexOf(item) === key);