var frequnceCounter = function (arr1, arr2) {
    var result = false;
    if (arr1.length !== arr2.length) {
        return result;
    }
    var frequencyCounter1 = {};
    var frequencyCounter2 = {};
    for (var _i = 0, arr1_1 = arr1; _i < arr1_1.length; _i++) {
        var val = arr1_1[_i];
        frequencyCounter1[val] = frequencyCounter1[val] || 1;
    }
    for (var _a = 0, arr2_1 = arr2; _a < arr2_1.length; _a++) {
        var val = arr2_1[_a];
        frequencyCounter2[val] = frequencyCounter2[val] || 1;
    }
    for (var key in frequencyCounter1) {
        if (!(Math.pow(Number(key), 2) in frequencyCounter2)) {
            return result;
        }
        if (frequencyCounter2[Math.pow(Number(key), 2)] !== frequencyCounter1[key]) {
            return result;
        }
    }
    return true;
};
console.log(frequnceCounter([1, 2, 3], [4, 1, 9])); //true
