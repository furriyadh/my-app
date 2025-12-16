
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

print("Attempting to import oauth_handler...")
try:
    import oauth_handler
    print("✅ oauth_handler imported successfully")
    print(f"File: {oauth_handler.__file__}")
    print("Attributes in oauth_handler:", dir(oauth_handler))
    
    if hasattr(oauth_handler, 'oauth_manager'):
        print("✅ oauth_manager found!")
        print(f"Type: {type(oauth_handler.oauth_manager)}")
    else:
        print("❌ oauth_manager NOT found in attributes")
        
except ImportError as e:
    print(f"❌ ImportError: {e}")
except Exception as e:
    print(f"❌ Exception: {e}")
