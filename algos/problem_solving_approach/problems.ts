const sameFrequency = (num1: number, num2: number): boolean => {


    const num1Str: string = num1.toString()
    const num2Str: string = num2.toString()
    if (num1Str.length !== num2Str.length) return false;

    const num1Freq: Record<number, number> = {};
    const num2Freq: Record<number, number> = {};


    for (let i = 0; i < num1Str.length; i++) {

        num1Freq[num1Str[i]] ? num1Freq[num1Str[i]]++ : num1Freq[num1Str[i]] = 1;
        num2Freq[num2Str[i]] ? num2Freq[num2Str[i]]++ : num2Freq[num2Str[i]] = 1;

    }

    for (let key in num1Freq) {

        if (num1Freq[key] !== num2Freq[key]) return false;

    }


    return true;
}


const areThereDuplicates = (...args): boolean => {

    const frequency: Record<any, any> = {};

    for (let arg in args) {

        frequency[arg] = (frequency[arg] || 0) + 1

        if (frequency[arg] > 1) return true;

    }

    return false;

}


const averagePair = (arr: number[], num: number): boolean => {

    let start: number = 0;
    let end: number = arr.length - 1;

    while (start < end) {

        if (arr[start] + arr[end] / 2 === num) return true;

        else if (avg < num) start++;

        else end--;


    }

    return false;

}


const isSubSequence = (subStr: string, str: string): boolean => {





    return true;

}



const maxSubArraySum = (arr: number[], num: number): number | null => {

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

}


const minSubArrayLen = (arr: number[], num: number): number => {

    let output: number = 0;

    for (let i = 0; i < arr.length; i++) {

        const numArr = arr[i]

        if (numArr >= num) output = 1;

        else {



        }


    }

    return output;
}