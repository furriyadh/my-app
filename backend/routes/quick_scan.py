#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick Backend Scanner - فاحص المكتبات الأصلية
===========================================
سكريبت للتأكد من استخدام المكتبات الأصلية السريعة

المكتبات المدعومة:
✅ bcrypt
✅ PyJWT  
✅ cryptography

Usage: python quick_scan.py [backend_path]
"""

import os
import re
import sys
from pathlib import Path
from collections import defaultdict

def scan_backend(backend_path="."):
    """فحص الباك اند للمكتبات الأصلية"""
    backend_path = Path(backend_path).resolve()
    
    print(f"🔍 فحص المكتبات الأصلية: {backend_path}")
    print("="*50)
    
    # المكتبات الأصلية المدعومة
    supported_patterns = {
        "bcrypt": [r"import bcrypt(?!\w)", r"from bcrypt import"],
        "PyJWT": [r"import jwt(?!\w)", r"from jwt import", r"import PyJWT", r"from PyJWT import"],
        "cryptography": [r"import cryptography", r"from cryptography import", r"from cryptography\.fernet import"]
    }
    
    # المكتبات غير المدعومة
    unsupported_patterns = {
        "passlib": [r"from passlib import", r"from passlib\.hash import"],
        "python-jose": [r"from jose import", r"import jose"],
        "PyCryptodome": [r"from Crypto import", r"from Crypto\.Cipher import"]
    }
    
    # النتائج
    supported_usage = defaultdict(list)
    unsupported_usage = defaultdict(list)
    
    # فحص ملفات Python
    python_files = list(backend_path.rglob("*.py"))
    print(f"📊 فحص {len(python_files)} ملف...")
    
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        relative_path = file_path.relative_to(backend_path)
        
        # فحص المكتبات المدعومة
        for library, patterns in supported_patterns.items():
            for pattern in patterns:
                matches = list(re.finditer(pattern, content, re.MULTILINE))
                if matches:
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        supported_usage[library].append({
                            "file": str(relative_path),
                            "line": line_num,
                            "match": match.group()
                        })
        
        # فحص المكتبات غير المدعومة
        for library, patterns in unsupported_patterns.items():
            for pattern in patterns:
                matches = list(re.finditer(pattern, content, re.MULTILINE))
                if matches:
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        unsupported_usage[library].append({
                            "file": str(relative_path),
                            "line": line_num,
                            "match": match.group()
                        })
    
    # طباعة النتائج
    print("\n✅ المكتبات المدعومة:")
    total_supported = 0
    for library, library_usage in supported_usage.items():
        if library_usage:
            print(f"\n🟢 {library} ({len(library_usage)} استخدام):")
            total_supported += len(library_usage)
            for usage in library_usage[:3]:
                print(f"   📁 {usage['file']}:{usage['line']} → {usage['match']}")
            if len(library_usage) > 3:
                print(f"   ... و {len(library_usage) - 3} استخدام آخر")
    
    if total_supported == 0:
        print("   ⚠️ لا توجد مكتبات مدعومة!")
    
    print("\n❌ المكتبات غير المدعومة:")
    total_unsupported = 0
    for library, library_usage in unsupported_usage.items():
        if library_usage:
            print(f"\n🔴 {library} ({len(library_usage)} استخدام):")
            total_unsupported += len(library_usage)
            for usage in library_usage[:3]:
                print(f"   📁 {usage['file']}:{usage['line']} → {usage['match']}")
            if len(library_usage) > 3:
                print(f"   ... و {len(library_usage) - 3} استخدام آخر")
    
    if total_unsupported == 0:
        print("   ✅ لا توجد مكتبات غير مدعومة!")
    
    # الملخص
    print("\n" + "="*50)
    print("📊 الملخص:")
    print(f"   ✅ مكتبات مدعومة: {total_supported}")
    print(f"   ❌ مكتبات غير مدعومة: {total_unsupported}")
    
    # حساب نسبة النظافة
    total_usage = total_supported + total_unsupported
    if total_usage > 0:
        clean_ratio = (total_supported / total_usage) * 100
        print(f"   🧹 نسبة النظافة: {clean_ratio:.1f}%")
        
        if clean_ratio == 100:
            print("   🏆 مثالي! جميع المكتبات مدعومة")
        elif clean_ratio >= 80:
            print("   👍 جيد! معظم المكتبات مدعومة")
        else:
            print("   ⚠️ يحتاج تحسين!")
    
    if total_unsupported > 0:
        print("\n🔧 التوصيات:")
        print("   1. استبدال المكتبات غير المدعومة")
        print("   2. تثبيت المكتبات الأصلية:")
        print("      python -m pip install bcrypt PyJWT cryptography")
    
    print("="*50)
    
    return {
        "supported_usage": dict(supported_usage),
        "unsupported_usage": dict(unsupported_usage),
        "total_supported": total_supported,
        "total_unsupported": total_unsupported,
        "clean_ratio": clean_ratio if total_usage > 0 else 100
    }

def main():
    """الدالة الرئيسية"""
    backend_path = sys.argv[1] if len(sys.argv) > 1 else "."
    
    try:
        results = scan_backend(backend_path)
        
        # حفظ النتائج
        import json
        output_file = Path(backend_path) / "scan_results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 تم حفظ النتائج في: {output_file}")
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

