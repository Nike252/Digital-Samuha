import hmac
import hashlib
import base64
import requests
from django.conf import settings

def verify_khalti_payment(token, amount):
    """
    Verifies a Khalti payment token.
    Returns (bool, response_data)
    """
    # DEMO/TEST BYPASS
    if isinstance(token, str) and token.startswith('simulate_token_'):
        return True, {"detail": "SIMULATED_SUCCESS", "amount": amount}

    url = "https://khalti.com/api/v2/payment/verify/"
    payload = {
        "token": token,
        "amount": amount  # Amount in paisa
    }
    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
    }

    try:
        response = requests.post(url, payload, headers=headers)
        if response.status_code == 200:
            return True, response.json()
        return False, response.json()
    except Exception as e:
        return False, {"error": str(e)}

def generate_esewa_signature(total_amount, transaction_uuid, product_code="EPAYTEST"):
    """
    Generates eSewa v2 signature (HMAC-SHA256)
    Ensures total_amount is a clean string (no extra .00 if whole number)
    """
    secret = "8gBm/:&EnhH.1/q" # Official eSewa v2 UAT Secret
    
    # Normalize amount to string (e.g. 1000.00 -> 1000, 1000.50 -> 1000.5)
    from decimal import Decimal
    try:
        amt = Decimal(str(total_amount))
        amt_str = f"{amt:g}"
    except:
        amt_str = str(total_amount)

    message = f"total_amount={amt_str},transaction_uuid={transaction_uuid},product_code={product_code}"
    
    hash = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    return base64.b64encode(hash).decode(), amt_str

def verify_esewa_payment(encoded_data):
    """
    Verifies an eSewa payment v2 using the encoded response data.
    """
    # Decode data
    import json
    try:
        decoded_bytes = base64.b64decode(encoded_data)
        data = json.loads(decoded_bytes.decode())
        print(f"DEBUG: Decoded eSewa Response: {data}")
    except Exception as e:
        return False, {"error": f"Failed to decode eSewa response: {str(e)}"}
    
    # Verification API (UAT)
    try:
        url = f"https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code={data.get('product_code')}&total_amount={data.get('total_amount')}&transaction_uuid={data.get('transaction_uuid')}"
        print(f"DEBUG: eSewa Verification URL: {url}")
    except Exception as e:
        print(f"DEBUG: Failed to build eSewa URL. Data received: {data}")
        return False, {"error": f"Invalid data in eSewa response: {str(e)}", "data": data}
    
    try:
        response = requests.get(url)
        print(f"DEBUG: eSewa Status API Code: {response.status_code}")
        if response.status_code == 200:
            res_data = response.json()
            print(f"DEBUG: eSewa Status API Res: {res_data}")
            if res_data.get('status') == 'COMPLETE':
                return True, res_data
            return False, res_data
        return False, response.json()
    except Exception as e:
        print(f"DEBUG: eSewa Verification Exception: {str(e)}")
        return False, {"error": str(e)}
