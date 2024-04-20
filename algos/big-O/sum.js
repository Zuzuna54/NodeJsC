var addUpToo = function (n) {
    var total = 0;
    for (var i = 1; i <= n; i++) {
        total += i;
    }
    return total;
};
var t1 = performance.now();
console.log(addUpToo(6));
var t2 = performance.now();
console.log("Time Elapsed: ".concat((t2 - t1) / 1000, " seconds."));
//function addUpTo with O(n) time complexity
var addUpTo = function (n) {
    return n * (n + 1) / 2;
};
var t3 = performance.now();
console.log(addUpTo(6));
var t4 = performance.now();
console.log("Time Elapsed: ".concat((t4 - t3) / 1000, " seconds."));
