import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, f1_score

df = pd.read_csv("data/NASDAQCOM_cleaned.csv")

print("Dataset loaded successfully.")
print("Dataset shape:", df.shape)
print()
print("Columns:")
print(df.columns.tolist())

X = df[["NASDAQCOM"]]
y = df["target"]

print()
print("Feature matrix shape:", X.shape)
print("Target vector shape:", y.shape)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    shuffle=False
)

print()
print("Train and test split completed.")
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)
print("y_train shape:", y_train.shape)
print("y_test shape:", y_test.shape)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

print()
print("Model trained successfully.")

y_pred = model.predict(X_test)

print()
print("Predictions generated successfully.")
print("First 10 predictions:")
print(y_pred[:10])

comparison_df = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred
})

print()
print("First 10 actual vs predicted rows:")
print(comparison_df.head(10))

accuracy = accuracy_score(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)

tn = cm[0, 0]
fp = cm[0, 1]
fn = cm[1, 0]
tp = cm[1, 1]

precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print()
print("FINAL MODEL RESULTS")
print("-" * 40)
print("Accuracy:", accuracy)
print("Precision:", precision)
print("Recall:", recall)
print("F1 Score:", f1)

print()
print("Accuracy percentage:", round(accuracy * 100, 2), "%")
print("Precision percentage:", round(precision * 100, 2), "%")
print("Recall percentage:", round(recall * 100, 2), "%")
print("F1 percentage:", round(f1 * 100, 2), "%")

print()
print("Confusion Matrix Values")
print("True Negatives:", tn)
print("False Positives:", fp)
print("False Negatives:", fn)
print("True Positives:", tp)

print()
print("Interpretation")
print("This baseline logistic regression model predicted class 1 for every test row.")
print("That means it predicted the NASDAQ would close higher the next day in all test cases.")
print("The model achieved moderate accuracy, but it did not identify any class 0 cases.")
print("This shows the baseline model is too simple and likely needs more useful features.")