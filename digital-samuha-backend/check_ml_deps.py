import sys
try:
    import sklearn
    import pandas
    import joblib
    print("SUCCESS: sklearn, pandas, and joblib are installed.")
except ImportError as e:
    print(f"MISSING: {str(e)}")
