"""
=============================================================================
Machine Learning - 2301CS621 | Lab - 8 (Decision Tree Classification)
Dataset: cardio_cleaned.csv (Cardiovascular Disease Prediction)
=============================================================================
"""

# # import necessary libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split

from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.preprocessing import LabelEncoder

import warnings
warnings.filterwarnings('ignore')

print("Libraries imported successfully.\n")

# # Import cardio_cleaned.csv dataset
df = pd.read_csv('cardio_cleaned.csv')
print("Dataset Head:")
print(df.head())
print("\nDataset Info:")
df.info()

# # Check the distribution of the target
print("\nTarget ('cardio') distribution:")
print(df['cardio'].value_counts())

# # Check for missing values
print("\nMissing values count:")
print(df.isnull().sum())

# # Visualize Distributions
print("\nVisualizing feature distributions...")
df.hist(figsize=(12, 10))
plt.tight_layout()
plt.savefig('features_distribution.png')
plt.close()
print("Saved histogram plot to 'features_distribution.png'.")

# # Convert Target data into integer code
print("\nUnique target values:", df['cardio'].unique())
le = LabelEncoder()
df['cardio'] = le.fit_transform(df['cardio'])
print("Target sample after encoding:")
print(df['cardio'].head())

# # Divide the data into input and output
# Axis = 1 means drop column, axis = 0 means drop row
x = df.drop(['cardio', 'id'], axis=1) 
y = df['cardio']

# shape gives the number of rows and columns in the dataset
print("\nInput features shape (x.shape):", x.shape)
print("Target shape (y.shape):", y.shape)

# # Splitting the dataset into the Training set and Test set
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
print("X_train shape:", X_train.shape)
print("X_test shape:", X_test.shape)

# # Create Model
from sklearn.tree import DecisionTreeClassifier
model = DecisionTreeClassifier()

# # Fitting DecisionTreeClassifier on dataset across depths 1 to 10
print("\nEvaluating DecisionTreeClassifier across depths (1 to 10):")
for depth in range(1, 11):
    model = DecisionTreeClassifier(max_depth=depth, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(f"Depth: {depth:2d}, TrainingAccuracy: {model.score(X_train, y_train):.4f}, TestingAccuracy: {model.score(X_test, y_test):.4f}")

# # Display Decision Tree
print("\nGenerating Decision Tree plot (max_depth=3)...")
model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

plt.figure(figsize=(20, 15))
plot_tree(model, filled=True, feature_names=list(x.columns), class_names=['Non-Cardio', 'Cardio'])
plt.savefig('decision_tree_visualization.png', dpi=300)
plt.close()
print("Saved tree plot to 'decision_tree_visualization.png'.")

# # Predict the x_test
y_pred = model.predict(X_test)
print("\nPredictions on X_test (first 20):")
print(y_pred[:20])

# # Display Training Accuracy
TrainingAccuracy = model.score(X_train, y_train)
print(f"\nTrainingAccuracy: {TrainingAccuracy:.4f}")

# # Display Test Accuracy
testAccuracy = model.score(X_test, y_test)
print(f"testAccuracy: {testAccuracy:.4f}")

# Additional Metrics
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Non-Cardio (0)', 'Cardio (1)']))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

