import joblib
import os
import numpy as np
import pandas as pd
from django.conf import settings

# Path to your model
# Paths to your model (Try multiple locations for Render consistency)
PATH_OPTIONS = [
    os.path.join(settings.BASE_DIR, 'ml_models', 'exported_calibrated_rf.pkl'),
    os.path.join(os.getcwd(), 'ml_models', 'exported_calibrated_rf.pkl'),
    os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'exported_calibrated_rf.pkl'),
]

# Feature categories for encoding (matching your Jupyter model)
GRADE_MAP = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6}
HOME_MAP = {'RENT': 0, 'MORTGAGE': 1, 'OWN': 2, 'ANY': 3}
VERIFIED_MAP = {'Not Verified': 0, 'Source Verified': 1, 'Verified': 2}
PURPOSE_MAP = {
    'debt_consolidation': 0, 'credit_card': 1, 'home_improvement': 2, 
    'major_purchase': 3, 'medical': 4, 'moving': 5, 
    'small_business': 6, 'vacation': 7, 'wedding': 8, 'other': 9
}

def load_ai_model():
    model_path = None
    for p in PATH_OPTIONS:
        print(f"DEBUG: Checking path: {p}")
        if os.path.exists(p):
            model_path = p
            print(f"DEBUG: FOUND model at: {p}")
            break
            
    if not model_path:
        print(f"DEBUG: Model file NOT FOUND in any of the {len(PATH_OPTIONS)} locations.")
        return None
        
    try:
        return joblib.load(model_path)
    except Exception as e:
        print(f"DEBUG: Error loading model with joblib: {str(e)}")
        return None

def predict_loan_default(loan):
    """
    Takes a Loan model instance and returns prediction & probability.
    Mapped to 43 expected features from the trained model.
    """
    model = load_ai_model()
    if not model:
        return {"error": "Model file not found. Please upload to /ml_models/"}

    try:
        # 1. Capture primary numeric values
        principal = float(loan.principal_amount)
        annual_inc = float(loan.annual_income or 1) # Avoid div by zero
        monthly_pay = float(loan.monthly_payment or 0)
        
        # 2. Derive features (41, 42)
        loan_to_inc = principal / annual_inc
        pay_to_inc = monthly_pay / (annual_inc / 12) if annual_inc > 0 else 0

        # Create the 43-feature vector
        # [0-22: Numerics, 23: Grade, 24: Len, 25-26: Home, 27-28: Verified, 29-40: Reason, 41-42: Derived]
        f = [0.0] * 43
        
        # Map Basics
        f[0] = principal
        f[1] = float(loan.loan_term)
        f[2] = float(loan.interest_rate)
        f[3] = monthly_pay
        f[4] = annual_inc
        f[5] = float(loan.debt_to_income or 0)
        
        # 6-22 are historical data (missing in Samuha, default to 0)
        # f[6] to f[22] = 0.0
        f[13] = float(loan.total_balance or 0)  # totalBal matches our model field

        # Encoding (23, 24)
        # Assuming Grade A=0, B=1... matching your Jupyter encoding
        GRADE_NUM = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6}
        f[23] = float(GRADE_NUM.get(loan.credit_grade, 1))
        f[24] = float(loan.employment_length)

        # One-Hot Encoding: Home Ownership (25, 26)
        # Expected: home_OWN, home_RENT (MORTGAGE is baseline)
        if loan.home_ownership == 'OWN': f[25] = 1.0
        elif loan.home_ownership == 'RENT': f[26] = 1.0

        # One-Hot Encoding: Verification (27, 28)
        # Expected: verified_Source Verified, verified_Verified
        if loan.income_verified == 'Source Verified': f[27] = 1.0
        elif loan.income_verified == 'Verified': f[28] = 1.0

        # One-Hot Encoding: Purpose/Reason (29-40)
        reasons = [
            'credit_card', 'debt_consolidation', 'home_improvement', 'house',
            'major_purchase', 'medical', 'moving', 'other', 'renewable_energy',
            'small_business', 'vacation', 'wedding'
        ]
        purpose_val = loan.purpose.lower().replace(' ', '_')
        for i, r in enumerate(reasons):
            if purpose_val == r:
                f[29 + i] = 1.0
                break
        
        # Derived Features (41, 42)
        f[41] = loan_to_inc
        f[42] = pay_to_inc

        # Convert to numpy array
        features_array = np.array([f])
        
        # Get Probability
        prob = model.predict_proba(features_array)[0][1]
        prediction = model.predict(features_array)[0]
        
        return {
            "prediction": "Default" if prediction == 1 or prob > 0.5 else "Non-Default",
            "probability": round(float(prob) * 100, 2),
            "status": "success"
        }
    except Exception as e:
        return {"error": f"Feature mapping error: {str(e)}"}

