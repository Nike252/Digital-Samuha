import os
import joblib
import sys

# Define path
MODEL_PATH = r'd:\FYP\digital-samuha-backend\ml_models\exported_calibrated_rf.pkl'

print(f"Checking model at: {MODEL_PATH}")

if not os.path.exists(MODEL_PATH):
    print("ERROR: File does not exist!")
    sys.exit(1)

try:
    print("Attempting to load model with joblib...")
    model = joblib.load(MODEL_PATH)
    print("SUCCESS: Model loaded successfully!")
    print(f"Model type: {type(model)}")
    
    # Check for feature names
    if hasattr(model, 'feature_names_in_'):
        print("\nEXPECTED FEATURES (43):")
        for i, name in enumerate(model.feature_names_in_):
            print(f"{i}: {name}")
    else:
        print("\nNo feature_names_in_ found in model.")
        # If it's a pipeline or calibrated classifier, we might need to look deeper
        if hasattr(model, 'base_estimator'):
             print("Checking base_estimator...")
             # ...
except Exception as e:

    print(f"FAILED: {str(e)}")
    import traceback
    traceback.print_exc()
