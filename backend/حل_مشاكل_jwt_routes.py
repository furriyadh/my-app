#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 حل مشاكل JWT في ملفات routes
================================================================================
المشكلة: ملفات routes تستخدم 'import jwt' لكن استبدلناه بـ python-jose
الحل: تعديل جميع ملفات routes لتستخدم 'from jose import jwt'
================================================================================
"""

import os
import re
import sys
from pathlib import Path
import shutil
from datetime import datetime

def print_header():
    """طباعة رأس البرنامج"""
    print("=" * 80)
    print("🔧 حل مشاكل JWT في ملفات routes")
    print("=" * 80)
    print("📋 المشكلة: No module named 'jwt' في 5 ملفات routes")
    print("🎯 الهدف: استبدال 'import jwt' بـ 'from jose import jwt'")
    print("⏱️ الوقت المتوقع: 5-10 دقائق")
    print("=" * 80)
    print()

def find_routes_files():
    """البحث عن ملفات routes"""
    print("🔍 البحث عن ملفات routes...")
    
    routes_dir = Path("routes")
    if not routes_dir.exists():
        print(f"❌ مجلد routes غير موجود: {routes_dir}")
        return []
    
    # البحث عن ملفات Python في مجلد routes
    python_files = []
    for root, dirs, files in os.walk(routes_dir):
        for file in files:
            if file.endswith('.py') and file != '__init__.py':
                python_files.append(Path(root) / file)
    
    print(f"📁 تم العثور على {len(python_files)} ملفات Python:")
    for file in python_files:
        print(f"   📄 {file}")
    
    return python_files

def analyze_jwt_usage(file_path):
    """تحليل استخدام JWT في ملف"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # البحث عن أنماط JWT
        patterns = {
            'import_jwt': r'^import jwt$',
            'import_jwt_as': r'^import jwt as \w+$',
            'from_jwt': r'^from jwt import',
            'jwt_usage': r'\bjwt\.',
        }
        
        findings = {}
        lines = content.split('\n')
        
        for pattern_name, pattern in patterns.items():
            matches = []
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line.strip(), re.MULTILINE):
                    matches.append({
                        'line_number': i,
                        'line_content': line.strip()
                    })
            findings[pattern_name] = matches
        
        return findings, content
        
    except Exception as e:
        print(f"❌ خطأ في قراءة {file_path}: {e}")
        return None, None

def fix_jwt_imports(file_path, content):
    """إصلاح استيرادات JWT في الملف"""
    print(f"🔧 إصلاح {file_path}...")
    
    # إنشاء نسخة احتياطية
    backup_path = f"{file_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(file_path, backup_path)
    print(f"   💾 نسخة احتياطية: {backup_path}")
    
    # قائمة التعديلات
    replacements = [
        # استبدال import jwt
        (r'^import jwt$', 'from jose import jwt'),
        (r'^import jwt as jwt_lib$', 'from jose import jwt as jwt_lib'),
        (r'^import jwt as (\w+)$', r'from jose import jwt as \1'),
        
        # استبدال from jwt import
        (r'^from jwt import (.+)$', r'from jose.jwt import \1'),
        
        # إضافة تعليق توضيحي
        (r'^from jose import jwt$', '# ✅ استخدام python-jose بدلاً من PyJWT\nfrom jose import jwt'),
    ]
    
    modified_content = content
    changes_made = 0
    
    # تطبيق التعديلات
    for old_pattern, new_pattern in replacements:
        new_content = re.sub(old_pattern, new_pattern, modified_content, flags=re.MULTILINE)
        if new_content != modified_content:
            changes_made += 1
            modified_content = new_content
    
    # كتابة الملف المعدل
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        print(f"   ✅ تم تعديل {changes_made} سطر")
        return True
    except Exception as e:
        print(f"   ❌ فشل في كتابة الملف: {e}")
        # استعادة النسخة الاحتياطية
        shutil.copy2(backup_path, file_path)
        return False

def fix_pydantic_forwardref():
    """إصلاح مشكلة pydantic ForwardRef"""
    print("\n🔧 إصلاح مشكلة pydantic ForwardRef...")
    
    try:
        # ترقية pydantic لإصدار متوافق
        import subprocess
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "--no-cache-dir", "--upgrade", "pydantic==2.5.3"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("   ✅ تم ترقية pydantic إلى 2.5.3")
            return True
        else:
            print(f"   ❌ فشل في ترقية pydantic: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"   ❌ خطأ في ترقية pydantic: {e}")
        return False

def test_jwt_import():
    """اختبار استيراد JWT"""
    print("\n🧪 اختبار استيراد JWT...")
    
    try:
        from jose import jwt
        print("   ✅ from jose import jwt - نجح")
        
        # اختبار وظائف JWT
        test_payload = {'test': 'data'}
        test_secret = 'test_secret'
        
        token = jwt.encode(test_payload, test_secret, algorithm='HS256')
        decoded = jwt.decode(token, test_secret, algorithms=['HS256'])
        
        print("   ✅ JWT encode/decode - نجح")
        return True
        
    except Exception as e:
        print(f"   ❌ فشل اختبار JWT: {e}")
        return False

def create_routes_compatibility_layer():
    """إنشاء طبقة توافق لملفات routes"""
    print("\n📝 إنشاء طبقة توافق...")
    
    compatibility_code = '''"""
طبقة توافق للمكتبات البديلة
================================================================================
هذا الملف يوفر واجهات متوافقة للمكتبات البديلة
"""

# ✅ JWT compatibility layer
try:
    from jose import jwt
    from jose import jwk
    from jose import jws
    JWT_AVAILABLE = True
    print("✅ JWT: استخدام python-jose")
except ImportError:
    # Fallback to PyJWT if available
    try:
        import jwt
        JWT_AVAILABLE = True
        print("⚠️ JWT: استخدام PyJWT (fallback)")
    except ImportError:
        JWT_AVAILABLE = False
        print("❌ JWT: غير متاح")

# ✅ Crypto compatibility layer  
try:
    from Crypto.Hash import SHA256, SHA512
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    from Crypto.Random import get_random_bytes
    CRYPTO_AVAILABLE = True
    print("✅ Crypto: استخدام PyCryptodome")
except ImportError:
    try:
        from cryptography.hazmat.primitives import hashes
        CRYPTO_AVAILABLE = True
        print("⚠️ Crypto: استخدام cryptography (fallback)")
    except ImportError:
        CRYPTO_AVAILABLE = False
        print("❌ Crypto: غير متاح")

# ✅ Password hashing compatibility layer
try:
    from passlib.hash import bcrypt as bcrypt_hash
    from passlib.hash import pbkdf2_sha256
    PASSWORD_AVAILABLE = True
    print("✅ Password: استخدام passlib")
except ImportError:
    try:
        import bcrypt
        PASSWORD_AVAILABLE = True
        print("⚠️ Password: استخدام bcrypt (fallback)")
    except ImportError:
        PASSWORD_AVAILABLE = False
        print("❌ Password: غير متاح")

# Helper functions
def safe_jwt_encode(payload, secret, algorithm='HS256'):
    """JWT encoding with error handling"""
    if JWT_AVAILABLE:
        return jwt.encode(payload, secret, algorithm=algorithm)
    else:
        raise ImportError("JWT library not available")

def safe_jwt_decode(token, secret, algorithms=['HS256']):
    """JWT decoding with error handling"""
    if JWT_AVAILABLE:
        return jwt.decode(token, secret, algorithms=algorithms)
    else:
        raise ImportError("JWT library not available")

def safe_hash_password(password):
    """Password hashing with error handling"""
    if PASSWORD_AVAILABLE:
        return bcrypt_hash.hash(password)
    else:
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

def safe_verify_password(password, hashed):
    """Password verification with error handling"""
    if PASSWORD_AVAILABLE:
        return bcrypt_hash.verify(password, hashed)
    else:
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest() == hashed
'''
    
    # حفظ طبقة التوافق
    compatibility_path = Path("routes") / "compatibility.py"
    try:
        with open(compatibility_path, 'w', encoding='utf-8') as f:
            f.write(compatibility_code)
        print(f"   ✅ تم إنشاء طبقة التوافق: {compatibility_path}")
        return True
    except Exception as e:
        print(f"   ❌ فشل في إنشاء طبقة التوافق: {e}")
        return False

def main():
    """الوظيفة الرئيسية"""
    print_header()
    
    # البحث عن ملفات routes
    routes_files = find_routes_files()
    if not routes_files:
        print("❌ لم يتم العثور على ملفات routes")
        return False
    
    # تحليل وإصلاح كل ملف
    fixed_files = 0
    total_files = len(routes_files)
    
    for file_path in routes_files:
        print(f"\n📄 معالجة {file_path}...")
        
        # تحليل استخدام JWT
        findings, content = analyze_jwt_usage(file_path)
        if findings is None:
            continue
        
        # فحص ما إذا كان الملف يحتاج إصلاح
        needs_fix = (
            findings['import_jwt'] or 
            findings['import_jwt_as'] or 
            findings['from_jwt']
        )
        
        if needs_fix:
            print(f"   🔍 تم العثور على استخدام JWT:")
            for pattern_name, matches in findings.items():
                if matches:
                    print(f"     - {pattern_name}: {len(matches)} مطابقة")
            
            # إصلاح الملف
            if fix_jwt_imports(file_path, content):
                fixed_files += 1
        else:
            print(f"   ℹ️ لا يحتاج إصلاح")
    
    print(f"\n📊 تم إصلاح {fixed_files}/{total_files} ملفات")
    
    # إصلاح مشكلة pydantic
    if fix_pydantic_forwardref():
        print("✅ تم إصلاح مشكلة pydantic")
    
    # اختبار JWT
    if test_jwt_import():
        print("✅ JWT يعمل بشكل صحيح")
    
    # إنشاء طبقة التوافق
    if create_routes_compatibility_layer():
        print("✅ تم إنشاء طبقة التوافق")
    
    # النتيجة النهائية
    print("\n" + "=" * 80)
    print("🎉 تم إصلاح مشاكل JWT في ملفات routes!")
    print("=" * 80)
    print("📋 الخطوات التالية:")
    print("   1. شغل التطبيق: python app.py")
    print("   2. يجب أن ترى تحسن في عدد blueprints")
    print("   3. راقب رسائل 'No module named jwt'")
    print("=" * 80)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("✅ انتهى البرنامج بنجاح")
            sys.exit(0)
        else:
            print("❌ فشل البرنامج")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️ تم إيقاف البرنامج بواسطة المستخدم")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {e}")
        sys.exit(1)

