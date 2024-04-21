


const maxSubArraySum = (arr: number[], num: number): number | null => {

    let maxSum: number = 0;
    let tempSum: number = 0;

    if (arr.length < num) {
        return null;
    }

    for (let i = 0; i < num; i++) {
        maxSum += arr[i];
    }

    tempSum = maxSum;

    for (let i = num; i < arr.length; i++) {
        tempSum = tempSum - arr[i - num] + arr[i];
        maxSum = Math.max(maxSum, tempSum);
    }

    return maxSum;

}


console.log(maxSubArraySum([1, 2, 5, 2, 8, 1, 5], 2)); //10