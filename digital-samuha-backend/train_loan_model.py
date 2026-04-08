import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# 1. Generate Synthetic Data
np.random.seed(42)
n_samples = 1500

data = {
    'annual_income': np.random.uniform(200000, 1500000, n_samples),
    'loan_amount': np.random.uniform(10000, 300000, n_samples),
    'savings_consistency': np.random.uniform(0.1, 1.0, n_samples), # 0.1 to 1.0 (1.0 = perfect record)
    'membership_age_days': np.random.uniform(30, 1500, n_samples),
    'collateral_ratio': np.random.uniform(0.0, 2.0, n_samples), # (Total Savings / Loan Amount)
}

df = pd.DataFrame(data)

# 2. Logic for "Default" (Target Variable)
# Calculated risk score based on synthetic behavior rules
def calculate_risk(row):
    score = 0
    # Rule 1: High Loan to Income is bad
    if row['loan_amount'] > (row['annual_income'] * 0.3): score += 20
    # Rule 2: Low savings consistency is bad
    if row['savings_consistency'] < 0.7: score += 30
    if row['savings_consistency'] < 0.4: score += 40
    # Rule 3: New members are riskier
    if row['membership_age_days'] < 365: score += 15
    # Rule 4: Low collateral is bad
    if row['collateral_ratio'] < 0.3: score += 25
    
    # Random noise for "AI" realism
    noise = np.random.uniform(-10, 10)
    final_score = score + noise
    
    return 1 if final_score > 50 else 0 # 1 = Default Risk, 0 = Safe

df['target'] = df.apply(calculate_risk, axis=1)

# 3. Train Model
X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 4. Save Model
MODEL_DIR = 'ml_models'
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

MODEL_PATH = os.path.join(MODEL_DIR, 'samuha_loan_model.joblib')
joblib.dump(model, MODEL_PATH)

print(f"SUCCESS: Model trained on {n_samples} records and saved to {MODEL_PATH}")
print(f"Feature Importance: {dict(zip(X.columns, model.feature_importances_))}")
