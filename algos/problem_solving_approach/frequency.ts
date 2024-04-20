

const frequnceCounter = (arr1: number[], arr2: number[]): boolean => {

    let result: boolean = false;

    if (arr1.length !== arr2.length) {
        return result;
    }

    let frequencyCounter1: Record<number, number> = {};
    let frequencyCounter2: Record<number, number> = {};

    for (let val of arr1) {
        frequencyCounter1[val] = frequencyCounter1[val] || 1;
    }

    for (let val of arr2) {
        frequencyCounter2[val] = frequencyCounter2[val] || 1;
    }

    for (let key in frequencyCounter1) {
        if (!(Number(key) ** 2 in frequencyCounter2)) {
            return result;
        }
        if (frequencyCounter2[Number(key) ** 2] !== frequencyCounter1[key]) {
            return result;
        }
    }

    return true;

}


console.log(frequnceCounter([1, 2, 3], [4, 1, 9])); //true