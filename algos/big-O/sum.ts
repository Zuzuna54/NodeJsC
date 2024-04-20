const addUpToo = (n: number) => {
    let total = 0;
    for (let i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}
const t1 = performance.now();
console.log(addUpToo(10000));
const t2 = performance.now();
console.log(`Time Elapsed: ${(t2 - t1) / 1000} seconds.`);





//function addUpTo with O(n) time complexity
const addUpTo = (n: number) => {
    return n * (n + 1) / 2;
}
const t3 = performance.now();
console.log(addUpTo(10000));
const t4 = performance.now();
console.log(`Time Elapsed: ${(t4 - t3) / 1000} seconds.`);