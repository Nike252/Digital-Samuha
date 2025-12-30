import qrcode
import io
import base64
from django.conf import settings

def generate_samuha_qr(samuha_id, amount=None, tx_type='saving', token=None):
    """
    Generates a QR code for a Samuha with optional amount and type.
    Includes a Magic Login token for seamless mobile access if provided.
    """
    base_url = "http://192.168.0.5:5173"
    
    # Target path for the deposit - pointing to the direct redirect route
    target_path = f"/pay-direct/esewa/{samuha_id}?type={tx_type}"
    if amount:
        target_path += f"&amount={amount}"

    # Wrap in Magic Login if token is provided
    if token:
        import urllib.parse
        encoded_next = urllib.parse.quote(target_path)
        url = f"{base_url}/magic-login?token={token}&next={encoded_next}"
    else:
        url = f"{base_url}{target_path}"
    
    # Create the QR code with automatic sizing to handle long JWT tokens
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Generate image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to a bytes buffer
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    
    # Encode as Base64 so it can be sent in JSON response
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return f"data:image/png;base64,{qr_base64}"
