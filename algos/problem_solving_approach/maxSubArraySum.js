var maxSubArraySum = function (arr, num) {
    var maxSum = 0;
    var tempSum = 0;
    if (arr.length < num) {
        return null;
    }
    for (var i = 0; i < num; i++) {
        maxSum += arr[i];
    }
    tempSum = maxSum;
    for (var i = num; i < arr.length; i++) {
        tempSum = tempSum - arr[i - num] + arr[i];
        maxSum = Math.max(maxSum, tempSum);
    }
    return maxSum;
};
console.log(maxSubArraySum([1, 2, 5, 2, 8, 1, 5], 2)); //10
