import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

df = pd.read_csv("data/NASDAQCOM_cleaned.csv")

X = df[["NASDAQCOM"]]
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    shuffle=False
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

print("Baseline model trained successfully.")
print("Model type:", type(model).__name__)
print("Training rows:", len(X_train))
print("Test rows:", len(X_test))
