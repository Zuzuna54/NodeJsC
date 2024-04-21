const sumZero = (arr: number[]): number[] | undefined => {

    let left: number = 0;
    let right: number = arr.length - 1;

    while (left < right) {

        if (arr[left] + arr[right] === 0) {
            return [arr[left], arr[right]];
        } else if (arr[left] + arr[right] > 0) {
            right--;
        } else {
            left++;
        }

    }

    return undefined;
};



console.log(sumZero([-3, -2, -1, 0, 1, 2, 9])); //[-3, 3]