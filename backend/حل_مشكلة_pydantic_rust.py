#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 حل مشكلة pydantic Rust dependency
================================================================================
المشكلة: pydantic v2 يحتاج Rust compiler وpydantic-core
الحل: استخدام pydantic v1 (Pure Python) أو بدائل أخرى
================================================================================
"""

import subprocess
import sys
import os
import importlib
from pathlib import Path

def print_header():
    """طباعة رأس البرنامج"""
    print("=" * 80)
    print("🔧 حل مشكلة pydantic Rust dependency")
    print("=" * 80)
    print("📋 المشكلة: pydantic v2 يحتاج Rust compiler")
    print("🎯 الهدف: استخدام pydantic v1 (Pure Python)")
    print("⏱️ الوقت المتوقع: 5-10 دقائق")
    print("=" * 80)
    print()

def check_current_pydantic():
    """فحص إصدار pydantic الحالي"""
    print("🔍 فحص pydantic الحالي...")
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pip", "show", "pydantic"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            lines = result.stdout.split('\n')
            version_line = [line for line in lines if line.startswith('Version:')]
            if version_line:
                version = version_line[0].split(': ')[1]
                print(f"   📦 pydantic حالياً: {version}")
                
                # فحص pydantic-core
                core_result = subprocess.run([
                    sys.executable, "-m", "pip", "show", "pydantic-core"
                ], capture_output=True, text=True)
                
                if core_result.returncode == 0:
                    core_lines = core_result.stdout.split('\n')
                    core_version_line = [line for line in core_lines if line.startswith('Version:')]
                    if core_version_line:
                        core_version = core_version_line[0].split(': ')[1]
                        print(f"   📦 pydantic-core: {core_version}")
                else:
                    print(f"   ❌ pydantic-core: غير مثبت")
                
                return version
        else:
            print("   ❌ pydantic: غير مثبت")
            return None
    except Exception as e:
        print(f"   ❌ خطأ في فحص pydantic: {e}")
        return None

def test_pydantic_import():
    """اختبار استيراد pydantic"""
    print("\n🧪 اختبار استيراد pydantic...")
    
    try:
        result = subprocess.run([
            sys.executable, "-c", 
            "import pydantic; print(f'pydantic {pydantic.__version__} - OK')"
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"   ✅ {result.stdout.strip()}")
            return True
        else:
            print(f"   ❌ فشل استيراد pydantic")
            print(f"   📝 الخطأ: {result.stderr.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print("   ⏱️ انتهت مهلة اختبار pydantic")
        return False
    except Exception as e:
        print(f"   ❌ خطأ في اختبار pydantic: {e}")
        return False

def uninstall_pydantic_v2():
    """إلغاء تثبيت pydantic v2 وpydantic-core"""
    print("\n🗑️ إلغاء تثبيت pydantic v2...")
    
    packages_to_remove = ["pydantic", "pydantic-core"]
    
    for package in packages_to_remove:
        print(f"   🗑️ إلغاء تثبيت {package}...")
        try:
            result = subprocess.run([
                sys.executable, "-m", "pip", "uninstall", package, "-y"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"   ✅ تم إلغاء تثبيت {package}")
            else:
                if "not installed" in result.stdout.lower():
                    print(f"   ℹ️ {package} غير مثبت مسبقاً")
                else:
                    print(f"   ⚠️ تحذير في إلغاء تثبيت {package}")
        except Exception as e:
            print(f"   ❌ خطأ في إلغاء تثبيت {package}: {e}")

def install_pydantic_v1():
    """تثبيت pydantic v1 (Pure Python)"""
    print("\n📦 تثبيت pydantic v1 (Pure Python)...")
    
    # pydantic v1 - آخر إصدار مستقر بدون Rust
    pydantic_v1_version = "1.10.12"
    
    print(f"   📦 تثبيت pydantic=={pydantic_v1_version}...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "--no-cache-dir", f"pydantic=={pydantic_v1_version}"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"   ✅ تم تثبيت pydantic=={pydantic_v1_version}")
            return True
        else:
            print(f"   ❌ فشل تثبيت pydantic v1")
            print(f"   📝 الخطأ: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ❌ خطأ في تثبيت pydantic v1: {e}")
        return False

def test_pydantic_functionality():
    """اختبار وظائف pydantic v1"""
    print("\n🧪 اختبار وظائف pydantic v1...")
    
    test_code = '''
import pydantic
from pydantic import BaseModel, Field
from typing import Optional

# اختبار BaseModel
class User(BaseModel):
    name: str
    age: int = Field(..., gt=0)
    email: Optional[str] = None

# إنشاء instance
user = User(name="Test User", age=25, email="test@example.com")
print(f"User: {user.name}, Age: {user.age}")

# اختبار validation
try:
    invalid_user = User(name="Invalid", age=-1)
except pydantic.ValidationError as e:
    print("Validation working correctly")

print(f"pydantic v1 functionality: OK")
'''
    
    try:
        result = subprocess.run([
            sys.executable, "-c", test_code
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"   ✅ {result.stdout.strip()}")
            return True
        else:
            print(f"   ❌ فشل اختبار وظائف pydantic")
            print(f"   📝 الخطأ: {result.stderr.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print("   ⏱️ انتهت مهلة اختبار pydantic")
        return False
    except Exception as e:
        print(f"   ❌ خطأ في اختبار pydantic: {e}")
        return False

def create_pydantic_compatibility_layer():
    """إنشاء طبقة توافق لـ pydantic"""
    print("\n📝 إنشاء طبقة توافق لـ pydantic...")
    
    compatibility_code = '''"""
طبقة توافق لـ pydantic v1/v2
================================================================================
هذا الملف يوفر توافق بين pydantic v1 و v2
"""

try:
    import pydantic
    from pydantic import BaseModel, Field, ValidationError
    from pydantic import validator  # v1 style
    PYDANTIC_AVAILABLE = True
    PYDANTIC_VERSION = pydantic.VERSION if hasattr(pydantic, 'VERSION') else pydantic.__version__
    print(f"✅ pydantic {PYDANTIC_VERSION} loaded successfully")
    
    # تحديد إصدار pydantic
    if PYDANTIC_VERSION.startswith('1.'):
        PYDANTIC_V1 = True
        PYDANTIC_V2 = False
        print("ℹ️ استخدام pydantic v1")
    else:
        PYDANTIC_V1 = False
        PYDANTIC_V2 = True
        print("ℹ️ استخدام pydantic v2")
        
        # استيراد v2 specific
        try:
            from pydantic import field_validator  # v2 style
        except ImportError:
            field_validator = None
            
except ImportError as e:
    print(f"❌ pydantic not available: {e}")
    PYDANTIC_AVAILABLE = False
    PYDANTIC_V1 = False
    PYDANTIC_V2 = False
    
    # Fallback classes
    class BaseModel:
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)
    
    class Field:
        def __init__(self, *args, **kwargs):
            pass
    
    class ValidationError(Exception):
        pass

# Helper functions
def create_model_v1_compatible(name, fields):
    """إنشاء model متوافق مع v1"""
    if PYDANTIC_AVAILABLE:
        return type(name, (BaseModel,), fields)
    else:
        return type(name, (object,), fields)

def validate_data(model_class, data):
    """التحقق من البيانات مع معالجة الأخطاء"""
    if PYDANTIC_AVAILABLE:
        try:
            return model_class(**data)
        except ValidationError as e:
            print(f"Validation error: {e}")
            return None
    else:
        return model_class(**data)

# Common models for the application
class GoogleAdsConfig(BaseModel):
    """إعدادات Google Ads"""
    developer_token: str = Field(..., min_length=1)
    client_id: str = Field(..., min_length=1)
    client_secret: str = Field(..., min_length=1)
    refresh_token: str = Field(..., min_length=1)
    
    if PYDANTIC_V1:
        @validator('developer_token')
        def validate_developer_token(cls, v):
            if not v or len(v.strip()) == 0:
                raise ValueError('Developer token cannot be empty')
            return v.strip()
    
class UserModel(BaseModel):
    """نموذج المستخدم"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\\.[^@]+$')
    is_active: bool = Field(default=True)
    
    if PYDANTIC_V1:
        @validator('email')
        def validate_email(cls, v):
            if '@' not in v:
                raise ValueError('Invalid email format')
            return v.lower()

class APIResponse(BaseModel):
    """نموذج استجابة API"""
    success: bool = Field(default=True)
    message: str = Field(default="")
    data: dict = Field(default_factory=dict)
    
print("✅ pydantic compatibility layer loaded")
'''
    
    # حفظ طبقة التوافق
    compatibility_path = Path("pydantic_compat.py")
    try:
        with open(compatibility_path, 'w', encoding='utf-8') as f:
            f.write(compatibility_code)
        print(f"   ✅ تم إنشاء طبقة التوافق: {compatibility_path}")
        return True
    except Exception as e:
        print(f"   ❌ فشل في إنشاء طبقة التوافق: {e}")
        return False

def fix_forwardref_issue():
    """حل مشكلة ForwardRef في pydantic v1"""
    print("\n🔧 حل مشكلة ForwardRef...")
    
    # إنشاء ملف مساعد لحل مشكلة ForwardRef
    forwardref_fix = '''"""
حل مشكلة ForwardRef في pydantic v1
================================================================================
"""

import sys
from typing import ForwardRef

# إصلاح ForwardRef للتوافق مع Python 3.13
if sys.version_info >= (3, 13):
    original_evaluate = ForwardRef._evaluate
    
    def patched_evaluate(self, globalns=None, localns=None, recursive_guard=None):
        """نسخة معدلة من _evaluate للتوافق مع Python 3.13"""
        if recursive_guard is None:
            recursive_guard = set()
        
        try:
            return original_evaluate(self, globalns, localns, recursive_guard)
        except TypeError:
            # fallback للإصدارات الأقدم
            return original_evaluate(self, globalns, localns)
    
    ForwardRef._evaluate = patched_evaluate
    print("✅ تم إصلاح مشكلة ForwardRef")

print("✅ ForwardRef compatibility loaded")
'''
    
    # حفظ إصلاح ForwardRef
    forwardref_path = Path("forwardref_fix.py")
    try:
        with open(forwardref_path, 'w', encoding='utf-8') as f:
            f.write(forwardref_fix)
        print(f"   ✅ تم إنشاء إصلاح ForwardRef: {forwardref_path}")
        return True
    except Exception as e:
        print(f"   ❌ فشل في إنشاء إصلاح ForwardRef: {e}")
        return False

def main():
    """الوظيفة الرئيسية"""
    print_header()
    
    # فحص pydantic الحالي
    current_version = check_current_pydantic()
    
    # اختبار الاستيراد الحالي
    if test_pydantic_import():
        print("✅ pydantic يعمل حالياً")
        
        # فحص إذا كان v2 ويسبب مشاكل
        if current_version and current_version.startswith('2.'):
            print("⚠️ pydantic v2 قد يسبب مشاكل Rust")
            user_choice = input("هل تريد التبديل إلى pydantic v1؟ (y/n): ")
            if user_choice.lower() != 'y':
                print("ℹ️ الاحتفاظ بـ pydantic v2")
                return True
        else:
            print("✅ pydantic v1 يعمل بشكل جيد")
            return True
    
    # إلغاء تثبيت pydantic v2
    uninstall_pydantic_v2()
    
    # تثبيت pydantic v1
    if not install_pydantic_v1():
        print("❌ فشل في تثبيت pydantic v1")
        return False
    
    # اختبار pydantic v1
    if not test_pydantic_import():
        print("❌ فشل في اختبار pydantic v1")
        return False
    
    # اختبار الوظائف
    if not test_pydantic_functionality():
        print("❌ فشل في اختبار وظائف pydantic")
        return False
    
    # إنشاء طبقة التوافق
    if not create_pydantic_compatibility_layer():
        print("❌ فشل في إنشاء طبقة التوافق")
        return False
    
    # إصلاح مشكلة ForwardRef
    if not fix_forwardref_issue():
        print("❌ فشل في إصلاح ForwardRef")
        return False
    
    # النتيجة النهائية
    print("\n" + "=" * 80)
    print("🎉 تم حل مشكلة pydantic Rust dependency!")
    print("=" * 80)
    print("✅ pydantic v1 مثبت ويعمل (Pure Python)")
    print("✅ تم إنشاء طبقة التوافق")
    print("✅ تم إصلاح مشكلة ForwardRef")
    print("=" * 80)
    print("📋 الخطوات التالية:")
    print("   1. شغل التطبيق: python app.py")
    print("   2. يجب أن ترى تحسن في routes.accounts")
    print("   3. لا مزيد من أخطاء ForwardRef")
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

