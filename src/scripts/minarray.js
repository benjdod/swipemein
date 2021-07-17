const arr = [6,5,2,9,10,4]

let c = Number.MAX_VALUE;
let a = 0;

for (let i = 0; i < arr.length; i++) {
    if (arr[i] < c) {c = arr[i]; a = i;}
}

console.log(a);