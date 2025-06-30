"""
مدير قاعدة البيانات - Supabase Integration
Google Ads AI Platform - Database Manager
"""

import os
import logging
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
from datetime import datetime, timedelta
import json

class DatabaseManager:
    """مدير قاعدة البيانات الرئيسي"""
    
    def __init__(self):
        """تهيئة الاتصال بقاعدة البيانات"""
        # قراءة متغيرات البيئة مع دعم طرق متعددة
        self.supabase_url = (
            os.getenv('SUPABASE_URL') or 
            os.environ.get('SUPABASE_URL')
        )
        self.supabase_key = (
            os.getenv('SUPABASE_KEY') or 
            os.environ.get('SUPABASE_KEY') or
            os.getenv('SUPABASE_SERVICE_ROLE_KEY') or
            os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        if not all([self.supabase_url, self.supabase_key]):
            raise ValueError("لم يتم تقديم قيم Supabase صالحة")
        
        # إنشاء عميل Supabase
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        self.logger = logging.getLogger(__name__)
        
        self.logger.info("تم تهيئة مدير قاعدة البيانات بنجاح")
    
    def check_connection(self) -> bool:
        """فحص الاتصال بقاعدة البيانات"""
        try:
            # محاولة استعلام بسيط للتحقق من الاتصال
            result = self.client.table('users').select('id').limit(1).execute()
            self.logger.info("تم التحقق من الاتصال بقاعدة البيانات بنجاح")
            return True
        except Exception as e:
            self.logger.error(f"فشل في الاتصال بقاعدة البيانات: {str(e)}")
            return False
    
    def test_connection(self) -> Dict[str, Any]:
        """اختبار الاتصال بقاعدة البيانات مع تفاصيل"""
        try:
            # محاولة استعلام بسيط
            result = self.client.table('users').select('id').limit(1).execute()
            
            return {
                'connected': True,
                'status': 'متصل بنجاح',
                'url': self.supabase_url,
                'timestamp': datetime.utcnow().isoformat(),
                'test_query': 'نجح'
            }
        except Exception as e:
            self.logger.error(f"فشل في اختبار الاتصال: {str(e)}")
            return {
                'connected': False,
                'status': 'فشل في الاتصال',
                'error': str(e),
                'url': self.supabase_url,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    # ===========================================
    # إدارة المستخدمين
    # ===========================================
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء مستخدم جديد"""
        try:
            result = self.client.table('users').insert(user_data).execute()
            self.logger.info(f"تم إنشاء مستخدم جديد: {user_data.get('email')}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم إنشاء المستخدم بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء المستخدم: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء المستخدم'
            }
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """الحصول على مستخدم بالبريد الإلكتروني"""
        try:
            result = self.client.table('users').select('*').eq('email', email).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            self.logger.error(f"خطأ في البحث عن المستخدم: {str(e)}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على مستخدم بالمعرف"""
        try:
            result = self.client.table('users').select('*').eq('id', user_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            self.logger.error(f"خطأ في البحث عن المستخدم: {str(e)}")
            return None
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """تحديث بيانات المستخدم"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            result = self.client.table('users').update(update_data).eq('id', user_id).execute()
            self.logger.info(f"تم تحديث المستخدم: {user_id}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم تحديث المستخدم بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في تحديث المستخدم: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحديث المستخدم'
            }
    
    # ===========================================
    # إدارة الحملات الإعلانية
    # ===========================================
    
    def create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء حملة إعلانية جديدة"""
        try:
            campaign_data['created_at'] = datetime.utcnow().isoformat()
            campaign_data['updated_at'] = datetime.utcnow().isoformat()
            
            result = self.client.table('campaigns').insert(campaign_data).execute()
            self.logger.info(f"تم إنشاء حملة جديدة: {campaign_data.get('name')}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم إنشاء الحملة بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء الحملة'
            }
    
    def get_user_campaigns(self, user_id: str) -> List[Dict[str, Any]]:
        """الحصول على حملات المستخدم"""
        try:
            result = self.client.table('campaigns').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            self.logger.error(f"خطأ في جلب الحملات: {str(e)}")
            return []
    
    def get_campaign_by_id(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على حملة بالمعرف"""
        try:
            result = self.client.table('campaigns').select('*').eq('id', campaign_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            self.logger.error(f"خطأ في البحث عن الحملة: {str(e)}")
            return None
    
    def update_campaign(self, campaign_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """تحديث بيانات الحملة"""
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            result = self.client.table('campaigns').update(update_data).eq('id', campaign_id).execute()
            self.logger.info(f"تم تحديث الحملة: {campaign_id}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم تحديث الحملة بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في تحديث الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحديث الحملة'
            }
    
    def delete_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """حذف حملة إعلانية"""
        try:
            result = self.client.table('campaigns').delete().eq('id', campaign_id).execute()
            self.logger.info(f"تم حذف الحملة: {campaign_id}")
            return {
                'success': True,
                'message': 'تم حذف الحملة بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في حذف الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في حذف الحملة'
            }
    
    # ===========================================
    # إدارة الكلمات المفتاحية
    # ===========================================
    
    def save_keywords(self, campaign_id: str, keywords: List[Dict[str, Any]]) -> Dict[str, Any]:
        """حفظ الكلمات المفتاحية للحملة"""
        try:
            # إضافة معرف الحملة لكل كلمة مفتاحية
            for keyword in keywords:
                keyword['campaign_id'] = campaign_id
                keyword['created_at'] = datetime.utcnow().isoformat()
            
            result = self.client.table('keywords').insert(keywords).execute()
            self.logger.info(f"تم حفظ {len(keywords)} كلمة مفتاحية للحملة: {campaign_id}")
            return {
                'success': True,
                'data': result.data,
                'message': f'تم حفظ {len(keywords)} كلمة مفتاحية'
            }
        except Exception as e:
            self.logger.error(f"خطأ في حفظ الكلمات المفتاحية: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في حفظ الكلمات المفتاحية'
            }
    
    def get_campaign_keywords(self, campaign_id: str) -> List[Dict[str, Any]]:
        """الحصول على كلمات الحملة المفتاحية"""
        try:
            result = self.client.table('keywords').select('*').eq('campaign_id', campaign_id).execute()
            return result.data or []
        except Exception as e:
            self.logger.error(f"خطأ في جلب الكلمات المفتاحية: {str(e)}")
            return []
    
    # ===========================================
    # إدارة الإحصائيات
    # ===========================================
    
    def save_campaign_stats(self, stats_data: Dict[str, Any]) -> Dict[str, Any]:
        """حفظ إحصائيات الحملة"""
        try:
            stats_data['created_at'] = datetime.utcnow().isoformat()
            result = self.client.table('campaign_stats').insert(stats_data).execute()
            self.logger.info(f"تم حفظ إحصائيات الحملة: {stats_data.get('campaign_id')}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم حفظ الإحصائيات بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في حفظ الإحصائيات: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في حفظ الإحصائيات'
            }
    
    def get_campaign_stats(self, campaign_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """الحصول على إحصائيات الحملة"""
        try:
            from_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            result = self.client.table('campaign_stats').select('*').eq('campaign_id', campaign_id).gte('created_at', from_date).order('created_at', desc=True).execute()
            return result.data or []
        except Exception as e:
            self.logger.error(f"خطأ في جلب الإحصائيات: {str(e)}")
            return []
    
    # ===========================================
    # إدارة الإعدادات
    # ===========================================
    
    def save_user_settings(self, user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """حفظ إعدادات المستخدم"""
        try:
            settings_data = {
                'user_id': user_id,
                'settings': json.dumps(settings),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # محاولة التحديث أولاً، ثم الإدراج إذا لم يوجد
            result = self.client.table('user_settings').upsert(settings_data).execute()
            self.logger.info(f"تم حفظ إعدادات المستخدم: {user_id}")
            return {
                'success': True,
                'data': result.data[0] if result.data else None,
                'message': 'تم حفظ الإعدادات بنجاح'
            }
        except Exception as e:
            self.logger.error(f"خطأ في حفظ الإعدادات: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في حفظ الإعدادات'
            }
    
    def get_user_settings(self, user_id: str) -> Dict[str, Any]:
        """الحصول على إعدادات المستخدم"""
        try:
            result = self.client.table('user_settings').select('*').eq('user_id', user_id).execute()
            if result.data:
                settings_json = result.data[0].get('settings', '{}')
                return json.loads(settings_json)
            return {}
        except Exception as e:
            self.logger.error(f"خطأ في جلب الإعدادات: {str(e)}")
            return {}
    
    # ===========================================
    # إدارة السجلات
    # ===========================================
    
    def log_user_activity(self, user_id: str, activity_type: str, details: Dict[str, Any]) -> None:
        """تسجيل نشاط المستخدم"""
        try:
            activity_data = {
                'user_id': user_id,
                'activity_type': activity_type,
                'details': json.dumps(details),
                'created_at': datetime.utcnow().isoformat()
            }
            self.client.table('user_activities').insert(activity_data).execute()
            self.logger.debug(f"تم تسجيل نشاط المستخدم: {user_id} - {activity_type}")
        except Exception as e:
            self.logger.error(f"خطأ في تسجيل النشاط: {str(e)}")
    
    def get_user_activities(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """الحصول على أنشطة المستخدم"""
        try:
            result = self.client.table('user_activities').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            self.logger.error(f"خطأ في جلب الأنشطة: {str(e)}")
            return []

