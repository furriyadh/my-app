"""
Supabase Configuration
إعدادات Supabase لقاعدة البيانات والمصادقة
"""

import os
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

# محاولة استيراد Supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    logger.warning("⚠️ مكتبة Supabase غير مثبتة")
    SUPABASE_AVAILABLE = False
    Client = None

class SupabaseConfig:
    """إعدادات Supabase"""
    
    def __init__(self):
        """تهيئة إعدادات Supabase"""
        self.url = os.getenv('SUPABASE_URL')
        self.key = os.getenv('SUPABASE_ANON_KEY')
        self.service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        # إعدادات قاعدة البيانات
        self.database_url = os.getenv('SUPABASE_DATABASE_URL')
        self.jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
        
        # إعدادات المصادقة
        self.auth_enabled = os.getenv('SUPABASE_AUTH_ENABLED', 'true').lower() == 'true'
        self.email_confirm_enabled = os.getenv('SUPABASE_EMAIL_CONFIRM', 'false').lower() == 'true'
        
        self.client = None
        self.admin_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """تهيئة عملاء Supabase"""
        if not SUPABASE_AVAILABLE:
            logger.warning("⚠️ Supabase غير متاح - تأكد من تثبيت المكتبة")
            return
        
        if not self.url or not self.key:
            logger.warning("⚠️ معلومات Supabase غير متوفرة في متغيرات البيئة")
            logger.info("💡 أضف SUPABASE_URL و SUPABASE_ANON_KEY لتفعيل Supabase")
            return
        
        try:
            # عميل عادي للمستخدمين
            self.client = create_client(self.url, self.key)
            
            # عميل إداري للعمليات المتقدمة
            if self.service_key:
                self.admin_client = create_client(self.url, self.service_key)
            
            logger.info("✅ تم الاتصال بـ Supabase بنجاح")
            
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة Supabase: {e}")
            self.client = None
            self.admin_client = None
    
    def is_connected(self) -> bool:
        """فحص حالة الاتصال بـ Supabase"""
        return self.client is not None
    
    def test_connection(self) -> Dict[str, Any]:
        """اختبار الاتصال بـ Supabase"""
        if not self.client:
            return {
                "connected": False,
                "error": "Supabase غير متصل",
                "available": SUPABASE_AVAILABLE
            }
        
        try:
            # اختبار بسيط للاتصال
            response = self.client.table('users').select('id').limit(1).execute()
            
            return {
                "connected": True,
                "status": "success",
                "message": "الاتصال بـ Supabase يعمل بنجاح"
            }
            
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "message": "فشل في اختبار الاتصال"
            }
    
    # ===========================================
    # إدارة المستخدمين
    # ===========================================
    
    def create_user(self, email: str, password: str, user_metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """إنشاء مستخدم جديد"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_metadata or {}
                }
            })
            
            if response.user:
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": response.user.created_at
                    }
                }
            else:
                return {"success": False, "error": "فشل في إنشاء المستخدم"}
                
        except Exception as e:
            logger.error(f"خطأ في إنشاء المستخدم: {e}")
            return {"success": False, "error": str(e)}
    
    def sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """تسجيل دخول المستخدم"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user and response.session:
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email
                    },
                    "session": {
                        "access_token": response.session.access_token,
                        "refresh_token": response.session.refresh_token,
                        "expires_at": response.session.expires_at
                    }
                }
            else:
                return {"success": False, "error": "بيانات الدخول غير صحيحة"}
                
        except Exception as e:
            logger.error(f"خطأ في تسجيل الدخول: {e}")
            return {"success": False, "error": str(e)}
    
    def sign_out(self) -> Dict[str, Any]:
        """تسجيل خروج المستخدم"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            self.client.auth.sign_out()
            return {"success": True, "message": "تم تسجيل الخروج بنجاح"}
            
        except Exception as e:
            logger.error(f"خطأ في تسجيل الخروج: {e}")
            return {"success": False, "error": str(e)}
    
    def get_user(self, access_token: str) -> Dict[str, Any]:
        """جلب بيانات المستخدم"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            response = self.client.auth.get_user(access_token)
            
            if response.user:
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "user_metadata": response.user.user_metadata,
                        "created_at": response.user.created_at,
                        "updated_at": response.user.updated_at
                    }
                }
            else:
                return {"success": False, "error": "المستخدم غير موجود"}
                
        except Exception as e:
            logger.error(f"خطأ في جلب بيانات المستخدم: {e}")
            return {"success": False, "error": str(e)}
    
    # ===========================================
    # إدارة قاعدة البيانات
    # ===========================================
    
    def insert_data(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """إدراج بيانات في الجدول"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            response = self.client.table(table).insert(data).execute()
            
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0
            }
            
        except Exception as e:
            logger.error(f"خطأ في إدراج البيانات: {e}")
            return {"success": False, "error": str(e)}
    
    def select_data(self, table: str, columns: str = "*", 
                   filters: Optional[Dict[str, Any]] = None,
                   limit: Optional[int] = None) -> Dict[str, Any]:
        """جلب بيانات من الجدول"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            query = self.client.table(table).select(columns)
            
            # إضافة الفلاتر
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            # إضافة الحد الأقصى
            if limit:
                query = query.limit(limit)
            
            response = query.execute()
            
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0
            }
            
        except Exception as e:
            logger.error(f"خطأ في جلب البيانات: {e}")
            return {"success": False, "error": str(e)}
    
    def update_data(self, table: str, data: Dict[str, Any], 
                   filters: Dict[str, Any]) -> Dict[str, Any]:
        """تحديث بيانات في الجدول"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            query = self.client.table(table).update(data)
            
            # إضافة الفلاتر
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.execute()
            
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحديث البيانات: {e}")
            return {"success": False, "error": str(e)}
    
    def delete_data(self, table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """حذف بيانات من الجدول"""
        if not self.client:
            return {"success": False, "error": "Supabase غير متصل"}
        
        try:
            query = self.client.table(table).delete()
            
            # إضافة الفلاتر
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.execute()
            
            return {
                "success": True,
                "data": response.data,
                "count": len(response.data) if response.data else 0
            }
            
        except Exception as e:
            logger.error(f"خطأ في حذف البيانات: {e}")
            return {"success": False, "error": str(e)}
    
    def get_stats(self) -> Dict[str, Any]:
        """إحصائيات Supabase"""
        return {
            "connected": self.is_connected(),
            "available": SUPABASE_AVAILABLE,
            "url_configured": bool(self.url),
            "key_configured": bool(self.key),
            "service_key_configured": bool(self.service_key),
            "auth_enabled": self.auth_enabled,
            "email_confirm_enabled": self.email_confirm_enabled
        }

# إنشاء مثيل عام
supabase_config = SupabaseConfig()

# دوال مساعدة للاستخدام السريع
def db_insert(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """إدراج بيانات"""
    return supabase_config.insert_data(table, data)

def db_select(table: str, columns: str = "*", 
              filters: Optional[Dict[str, Any]] = None,
              limit: Optional[int] = None) -> Dict[str, Any]:
    """جلب بيانات"""
    return supabase_config.select_data(table, columns, filters, limit)

def db_update(table: str, data: Dict[str, Any], 
              filters: Dict[str, Any]) -> Dict[str, Any]:
    """تحديث بيانات"""
    return supabase_config.update_data(table, data, filters)

def db_delete(table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    """حذف بيانات"""
    return supabase_config.delete_data(table, filters)

__all__ = [
    'SupabaseConfig', 'supabase_config', 'SUPABASE_AVAILABLE',
    'db_insert', 'db_select', 'db_update', 'db_delete'
]

