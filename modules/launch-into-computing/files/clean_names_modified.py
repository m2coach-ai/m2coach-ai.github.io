# clean_names_modified.py
# This script is a modified version of clean_names.py
# and returns them in alphabetical order with two improvements added.

def process_names(names):
    # MODIFICATION 1 - Input validation
    # checks if the input is a list before running
    # without this someone could accidentally pass in a single name like "Alice"
    # instead of ["Alice"] and the function would produce wrong results silently
    # raises an error with a clear message so the user knows exactly what went wrong
    if not isinstance(names, list):
        raise TypeError("Input must be a list of strings.")

    # MODIFICATION 2 - Case-insensitive deduplication
    # a dictionary is used instead of set() to fix the case-sensitive problem. It is empty first
    seen = {}

    # loops through each name in the list one at a time
    for name in names:
        # skips anything that is not a string so the function does not crash on unexpected items like numbers or None
        if not isinstance(name, str):
            continue
        # set() would keep "Alice" and "alice" as separate names which is not what we want. Big mistake in original code.
        # converting to lowercase means all variations of a name are treated the same
        key = name.lower()
        if key not in seen:
            # stores the Title Case version so the output looks clean and consistent
            seen[key] = name.title()

    unique_names = sorted(seen.values())  # sorts alphabetically so output is predictable
    return unique_names  # sends the finished list back

# Test list with duplicates and inconsistent capitalisation
test_names = ["Alice", "bob", "alice", "Charlie", "BOB", "dave", "Eve", "charlie"]
print("Original list:", test_names)
print("Processed list:", process_names(test_names))