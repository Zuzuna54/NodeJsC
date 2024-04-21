var countUniqueValues = function (arr) {
    var output = [];
    for (var i = 0; i < arr.length; i++) {
        if (output[output.length - 1] !== arr[i]) {
            output.push(arr[i]);
        }
    }
    return output.length;
};
console.log(countUniqueValues([1, 1, 1, 1, 1, 2])); //2
// diffrent example
console.log(countUniqueValues([1, 2, 3, 4, 4, 4, 7, 7, 12, 12, 13])); //7
