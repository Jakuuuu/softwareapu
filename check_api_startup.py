import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from src.main import app
    print("SUCCESS: FastAPI app initialized successfully.")
    print(f"Routes included: {[route.path for route in app.routes]}")
except Exception as e:
    print(f"ERROR: Failed to initialize app. {e}")
    import traceback
    traceback.print_exc()
