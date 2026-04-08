from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("Listing all models...")
models = [m.name for m in client.models.list()]
print(f"Total models found: {len(models)}")

for m_full in models:
    m = m_full.replace('models/', '')
    print(f"Testing {m}...", end=' ', flush=True)
    try:
        # Try both v1 and v1beta (default is v1beta for client.models.list() but let's test)
        response = client.models.generate_content(model=m, contents="Hi")
        print(f"SUCCESS!")
        print(f"Working model: {m}")
        exit(0)
    except Exception as e:
        print(f"FAIL: {str(e)[:50]}...")

print("\nNo working models found with this API key.")
exit(1)
