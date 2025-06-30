#!/usr/bin/env python3
"""
WSGI Configuration for Google Ads AI Platform
إعدادات WSGI لمنصة Google Ads AI - للإنتاج
"""

import os
import sys
from pathlib import Path

# إضافة مجلد backend للمسار
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# تحديد متغيرات البيئة للإنتاج
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault('FLASK_DEBUG', 'False')

try:
    from app import create_app
    
    # إنشاء تطبيق Flask
    application = create_app()
    
    # للتوافق مع خوادم WSGI المختلفة
    app = application
    
    if __name__ == "__main__":
        # للاختبار المحلي
        application.run(
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5000)),
            debug=False
        )
        
except ImportError as e:
    print(f"خطأ في استيراد التطبيق: {e}")
    raise

except Exception as e:
    print(f"خطأ في تهيئة التطبيق: {e}")
    raise
