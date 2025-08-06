#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Ads AI Platform - Fixed with Alternative Libraries
Flask Application with Pure Python Libraries (No Rust bindings)

Fixed DLL load failed issues by replacing:
❌ cryptography → ✅ PyCryptodome  
❌ bcrypt → ✅ passlib
❌ PyJWT → ✅ python-jose

Author: AI Assistant  
Version: 2.0.0 (Fixed)
Date: 2025-08-05
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
import importlib
from pathlib import Path
import traceback

# ✅ استخدام البدائل Pure Python بدلاً من المكتبات المتأثرة
try:
    from passlib.hash import bcrypt as bcrypt_hash
    from passlib.hash import pbkdf2_sha256
    BCRYPT_AVAILABLE = True
    print("✅ passlib loaded successfully (bcrypt alternative)")
except ImportError as e:
    print(f"⚠️ passlib not available: {e}")
    BCRYPT_AVAILABLE = False

try:
    from jose import jwt
    from jose import jwk
    JWT_AVAILABLE = True
    print("✅ python-jose loaded successfully (PyJWT alternative)")
except ImportError as e:
    print(f"⚠️ python-jose not available: {e}")
    JWT_AVAILABLE = False

try:
    from Crypto.Hash import SHA256, SHA512
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Random import get_random_bytes
    CRYPTO_AVAILABLE = True
    print("✅ PyCryptodome loaded successfully (cryptography alternative)")
except ImportError as e:
    print(f"⚠️ PyCryptodome not available: {e}")
    CRYPTO_AVAILABLE = False

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')

# ✅ Helper functions using alternative libraries
def hash_password(password):
    """Hash password using passlib (bcrypt alternative)"""
    if BCRYPT_AVAILABLE:
        return bcrypt_hash.hash(password)
    else:
        # Fallback to pbkdf2
        return pbkdf2_sha256.hash(password)

def verify_password(password, hashed):
    """Verify password using passlib"""
    if BCRYPT_AVAILABLE:
        return bcrypt_hash.verify(password, hashed)
    else:
        return pbkdf2_sha256.verify(password, hashed)

def create_jwt_token(payload):
    """Create JWT token using python-jose"""
    if JWT_AVAILABLE:
        return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
    else:
        # Fallback - simple base64 encoding (not secure, for testing only)
        import base64
        import json
        return base64.b64encode(json.dumps(payload).encode()).decode()

def verify_jwt_token(token):
    """Verify JWT token using python-jose"""
    if JWT_AVAILABLE:
        try:
            return jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        except Exception as e:
            print(f"JWT verification failed: {e}")
            return None
    else:
        # Fallback
        try:
            import base64
            import json
            return json.loads(base64.b64decode(token.encode()).decode())
        except:
            return None

def encrypt_data(data):
    """Encrypt data using PyCryptodome"""
    if CRYPTO_AVAILABLE:
        key = get_random_bytes(16)
        cipher = AES.new(key, AES.MODE_EAX)
        nonce = cipher.nonce
        ciphertext, tag = cipher.encrypt_and_digest(data.encode())
        return {
            'key': key.hex(),
            'nonce': nonce.hex(), 
            'ciphertext': ciphertext.hex(),
            'tag': tag.hex()
        }
    else:
        # Fallback - simple base64 (not secure, for testing only)
        import base64
        return {'data': base64.b64encode(data.encode()).decode()}

def hash_data(data):
    """Hash data using PyCryptodome"""
    if CRYPTO_AVAILABLE:
        h = SHA256.new()
        h.update(data.encode())
        return h.hexdigest()
    else:
        # Fallback to built-in hashlib
        import hashlib
        return hashlib.sha256(data.encode()).hexdigest()

# Blueprint registration with error handling
def register_blueprints():
    """Register all blueprints with comprehensive error handling"""
    print("\n🔧 تسجيل Blueprints...")
    
    blueprints_config = [
        {
            'module': 'routes.google_ads.oauth_routes',
            'blueprint': 'oauth_bp',
            'url_prefix': '/api/auth/google'
        },
        {
            'module': 'routes.google_ads.campaigns',
            'blueprint': 'campaigns_bp', 
            'url_prefix': '/api/google-ads/campaigns'
        },
        {
            'module': 'routes.google_ads.discovery',
            'blueprint': 'discovery_bp',
            'url_prefix': '/api/google-ads/discovery'
        },
        {
            'module': 'routes.google_ads.reports',
            'blueprint': 'reports_bp',
            'url_prefix': '/api/google-ads/reports'
        },
        {
            'module': 'routes.google_ads.sync',
            'blueprint': 'sync_bp',
            'url_prefix': '/api/google-ads/sync'
        },
        {
            'module': 'routes.accounts',
            'blueprint': 'accounts_bp',
            'url_prefix': '/api/accounts'
        },
        {
            'module': 'routes.ai',
            'blueprint': 'ai_bp',
            'url_prefix': '/api/ai'
        },
        {
            'module': 'routes.auth_jwt',
            'blueprint': 'auth_bp',
            'url_prefix': '/api/auth'
        }
    ]
    
    registered_count = 0
    failed_blueprints = []
    
    for config in blueprints_config:
        module_name = config['module']
        blueprint_name = config['blueprint']
        url_prefix = config['url_prefix']
        
        try:
            print(f"   📦 تحميل {module_name}...")
            
            # Import module
            module = importlib.import_module(module_name)
            
            # Get blueprint
            if hasattr(module, blueprint_name):
                blueprint = getattr(module, blueprint_name)
                
                # Register blueprint
                app.register_blueprint(blueprint, url_prefix=url_prefix)
                print(f"   ✅ {module_name} → {blueprint_name} مسجل بنجاح")
                registered_count += 1
                
            else:
                print(f"   ❌ {module_name}: Blueprint '{blueprint_name}' غير موجود")
                failed_blueprints.append({
                    'module': module_name,
                    'error': f"Blueprint '{blueprint_name}' not found"
                })
                
        except ImportError as e:
            error_msg = str(e)
            if "_rust" in error_msg:
                print(f"   ❌ {module_name}: مشكلة Rust DLL - {error_msg}")
            elif "_bcrypt" in error_msg:
                print(f"   ❌ {module_name}: مشكلة bcrypt DLL - {error_msg}")
            else:
                print(f"   ❌ {module_name}: خطأ استيراد - {error_msg}")
            
            failed_blueprints.append({
                'module': module_name,
                'error': error_msg
            })
            
        except Exception as e:
            print(f"   ❌ {module_name}: خطأ عام - {str(e)}")
            failed_blueprints.append({
                'module': module_name,
                'error': str(e)
            })
    
    total_blueprints = len(blueprints_config)
    print(f"\n📊 نتائج تسجيل Blueprints: {registered_count}/{total_blueprints}")
    
    if registered_count == total_blueprints:
        print("🎉 جميع Blueprints مسجلة بنجاح!")
    else:
        print(f"⚠️ {len(failed_blueprints)} blueprints فشلت:")
        for failed in failed_blueprints:
            print(f"   - {failed['module']}: {failed['error']}")
    
    return registered_count, failed_blueprints

# API Routes
@app.route('/')
def home():
    """Home route"""
    return jsonify({
        'message': 'Google Ads AI Platform API',
        'version': '2.0.0',
        'status': 'running',
        'libraries': {
            'bcrypt_alternative': 'passlib' if BCRYPT_AVAILABLE else 'not available',
            'jwt_alternative': 'python-jose' if JWT_AVAILABLE else 'not available', 
            'crypto_alternative': 'PyCryptodome' if CRYPTO_AVAILABLE else 'not available'
        }
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'libraries': {
            'passlib': BCRYPT_AVAILABLE,
            'python-jose': JWT_AVAILABLE,
            'pycryptodome': CRYPTO_AVAILABLE
        }
    })

@app.route('/api/blueprints/status')
def blueprints_status():
    """Get blueprints registration status"""
    registered_count, failed_blueprints = register_blueprints()
    
    return jsonify({
        'total_blueprints': 8,
        'registered_blueprints': registered_count,
        'success_rate': f"{(registered_count/8)*100:.1f}%",
        'failed_blueprints': failed_blueprints,
        'status': 'success' if registered_count == 8 else 'partial_failure'
    })

@app.route('/api/test/crypto')
def test_crypto():
    """Test crypto functionality"""
    if not CRYPTO_AVAILABLE:
        return jsonify({'error': 'PyCryptodome not available'}), 500
    
    try:
        # Test hashing
        test_data = "Hello, World!"
        hash_result = hash_data(test_data)
        
        # Test encryption
        encrypt_result = encrypt_data(test_data)
        
        return jsonify({
            'status': 'success',
            'hash': hash_result,
            'encryption': 'success',
            'library': 'PyCryptodome'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test/auth')
def test_auth():
    """Test authentication functionality"""
    try:
        # Test password hashing
        test_password = "test_password_123"
        hashed = hash_password(test_password)
        verified = verify_password(test_password, hashed)
        
        # Test JWT
        test_payload = {'user_id': 123, 'username': 'test_user'}
        token = create_jwt_token(test_payload)
        decoded = verify_jwt_token(token)
        
        return jsonify({
            'status': 'success',
            'password_hash': 'success',
            'password_verify': verified,
            'jwt_create': 'success',
            'jwt_verify': decoded is not None,
            'libraries': {
                'password': 'passlib' if BCRYPT_AVAILABLE else 'fallback',
                'jwt': 'python-jose' if JWT_AVAILABLE else 'fallback'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("=" * 80)
    print("🚀 Google Ads AI Platform - Fixed Version")
    print("=" * 80)
    print("📋 استخدام مكتبات Pure Python بدلاً من Rust bindings:")
    print("   ✅ passlib بدلاً من bcrypt")
    print("   ✅ python-jose بدلاً من PyJWT") 
    print("   ✅ PyCryptodome بدلاً من cryptography")
    print("=" * 80)
    
    # Register blueprints
    registered_count, failed_blueprints = register_blueprints()
    
    if registered_count > 0:
        print(f"\n🎉 Flask app starting with {registered_count}/8 blueprints...")
        print("🌐 Available endpoints:")
        print("   - http://127.0.0.1:5000/ (Home)")
        print("   - http://127.0.0.1:5000/api/health (Health check)")
        print("   - http://127.0.0.1:5000/api/blueprints/status (Blueprints status)")
        print("   - http://127.0.0.1:5000/api/test/crypto (Test crypto)")
        print("   - http://127.0.0.1:5000/api/test/auth (Test auth)")
        print("=" * 80)
        
        # Start Flask app
        app.run(
            host='127.0.0.1',
            port=5000,
            debug=True,
            use_reloader=False  # تجنب إعادة التحميل لتجنب مشاكل DLL
        )
    else:
        print("\n❌ لا يمكن تشغيل التطبيق - لم يتم تسجيل أي blueprints")
        print("💡 تأكد من:")
        print("   1. تثبيت المكتبات البديلة: pip install pycryptodome passlib python-jose")
        print("   2. وجود ملفات routes في المجلد الصحيح")
        print("   3. عدم وجود أخطاء DLL load failed")
        sys.exit(1)

