// cleanNames_modified.js
// This script is a modified version of cleanNames.js
// and returns them in alphabetical order with two improvements added.
function processNames(names) {
    // MODIFICATION 1 - Input validation
    // checks if the input is an array before running
    // without this someone could accidentally pass in a single name like "Alice"
    // instead of ["Alice"] and the function would produce wrong results silently
    // throws an error with a clear message so the user knows exactly what went wrong
    if (!Array.isArray(names)) {
        throw new TypeError("Input must be an array of strings.");
    }
    // MODIFICATION 2 - Case-insensitive deduplication
    // a Map is used instead of new Set() to fix the case-sensitive problem. It is empty first
    const seen = new Map();
    // loops through each name in the array one at a time
    for (const name of names) {
        // skips anything that is not a string so the function does not crash on unexpected items like numbers or undefined
        if (typeof name !== "string") continue;
        // new Set() would keep "Alice" and "alice" as separate names which is not what we want. Big mistake in original code.
        // converting to lowercase means all variations of a name are treated the same
        const key = name.toLowerCase();
        if (!seen.has(key)) {
            // stores the Title Case version so the output looks clean and consistent
            seen.set(key, name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
        }
    }
    return Array.from(seen.values()).sort(); // sorts alphabetically so output is predictable // sends the finished list back
}
// Test list with duplicates and inconsistent capitalisation
const testNames = ["Alice", "bob", "alice", "Charlie", "BOB", "dave", "Eve", "charlie"];
console.log("Original list:", testNames);
console.log("Processed list:", processNames(testNames));