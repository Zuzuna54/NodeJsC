// const isAnagram = (str1: string, str2: string): boolean => {

//     if (str1.length === 0 && str2.length === 0) {
//         return true;
//     }

//     if (str1.length !== str2.length) {
//         return false;
//     }


//     let frequencyCounter1: Record<string, number> = {};
//     let frequencyCounter2: Record<string, number> = {};

//     for (let char of str1) {
//         frequencyCounter1[char] = (frequencyCounter1[char] || 0) + 1;
//     }

//     for (let char of str2) {
//         frequencyCounter2[char] = (frequencyCounter2[char] || 0) + 1;
//     }

//     for (let key in frequencyCounter1) {
//         if (!(key in frequencyCounter2)) {
//             return false;
//         }
//         if (frequencyCounter2[key] !== frequencyCounter1[key]) {
//             return false;
//         }
//     }

//     return true;

// }


const isAnagram = (str1: string, str2: string): boolean => {

    if (str1.length === 0 && str2.length === 0) {
        return true;
    }

    if (str1.length !== str2.length) {
        return false;
    }

    const lookup: Record<string, number> = {};
    for (let char of str1) {
        lookup[char] = (lookup[char] || 0) + 1;
    }


    for (let char of str2) {
        if (!lookup[char]) {
            return false;
        } else {
            lookup[char] -= 1;
        }
    }

    return true

}


console.log(isAnagram('anagram', 'nararam')); //true