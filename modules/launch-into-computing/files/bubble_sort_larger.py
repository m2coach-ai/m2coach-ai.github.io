import random
import time
import matplotlib.pyplot as plt

def bubble_sort(arr):
    # Create a copy of the list
    data_copy = arr[:]  
    n = len(data_copy)

    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if data_copy[j] > data_copy[j + 1]:
                # Swap the elements
                data_copy[j], data_copy[j + 1] = data_copy[j + 1], data_copy[j]
                swapped = True
        if not swapped:
            break
    return data_copy

def main():
    random.seed(42)
    # The sizes of lists we want to test
    sizes = [100, 500, 1000, 2000, 3000]
    times_taken = []

    for n in sizes:
        # Create random data
        test_data = [random.randint(0, 1000) for _ in range(n)]
        
        # Start timer
        start = time.perf_counter()
        bubble_sort(test_data)
        end = time.perf_counter()
        
        duration = end - start
        times_taken.append(duration)
        print(f"Size {n} took {duration:.5f} seconds")

    # Create the graph
    plt.plot(sizes, times_taken, marker="o")
    plt.title("Bubble Sort Speed")
    plt.xlabel("Number of Items")
    plt.ylabel("Time (Seconds)")
    plt.show()

if __name__ == "__main__":
    main()