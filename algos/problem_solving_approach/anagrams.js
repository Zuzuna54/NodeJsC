var isAnagram = function (str1, str2) {
    if (str1.length === 0 && str2.length === 0) {
        return true;
    }
    if (str1.length !== str2.length) {
        return false;
    }
    var frequencyCounter1 = {};
    var frequencyCounter2 = {};
    for (var _i = 0, str1_1 = str1; _i < str1_1.length; _i++) {
        var char = str1_1[_i];
        frequencyCounter1[char] = (frequencyCounter1[char] || 0) + 1;
    }
    for (var _a = 0, str2_1 = str2; _a < str2_1.length; _a++) {
        var char = str2_1[_a];
        frequencyCounter2[char] = (frequencyCounter2[char] || 0) + 1;
    }
    for (var key in frequencyCounter1) {
        if (!(key in frequencyCounter2)) {
            return false;
        }
        if (frequencyCounter2[key] !== frequencyCounter1[key]) {
            return false;
        }
    }
    return true;
};
console.log(isAnagram('anagram', 'nararam')); //true
