"""
Supabase Manager Service
خدمة إدارة قاعدة البيانات Supabase لربط الحسابات الإعلانية

يوفر وظائف شاملة لإدارة:
- حسابات المستخدمين
- رموز OAuth2
- حسابات Google Ads
- حسابات MCC
- ربط الحسابات
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
import uuid

# محاولة استيراد Supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("⚠️ Supabase غير متاح - سيتم استخدام التخزين المحلي")

# إعداد التسجيل
logger = logging.getLogger(__name__)

class SupabaseManager:
    """مدير قاعدة البيانات Supabase"""
    
    def __init__(self):
        """تهيئة مدير Supabase"""
        self.client = None
        self.is_connected = False
        
        # إعدادات Supabase
        self.supabase_url = os.getenv('SUPABASE_URL')
        # استخدام SERVICE_ROLE_KEY للكتابة، ANON_KEY للقراءة فقط
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')
        logger.info(f"✅ استخدام مفتاح Supabase: {'SERVICE_ROLE' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'ANON'}")
        
        # تهيئة الاتصال
        self._initialize_connection()
        
        # التخزين المحلي كبديل
        self.local_storage = {
            'users': {},
            'oauth_tokens': {},
            'google_ads_accounts': {},
            'mcc_accounts': {},
            'linked_accounts': {}
        }
    
    def _initialize_connection(self):
        """تهيئة الاتصال بـ Supabase"""
        try:
            if not SUPABASE_AVAILABLE:
                logger.warning("Supabase غير متاح - استخدام التخزين المحلي")
                return
            
            if not self.supabase_url or not self.supabase_key:
                logger.warning("متغيرات Supabase غير محددة - استخدام التخزين المحلي")
                return
            
            self.client = create_client(self.supabase_url, self.supabase_key)
            
            # اختبار الاتصال
            test_response = self.client.table('users').select('id').limit(1).execute()
            self.is_connected = True
            logger.info("✅ تم الاتصال بـ Supabase بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل الاتصال بـ Supabase: {e}")
            self.is_connected = False
    
    def save_user_oauth_tokens(self, user_id: str, tokens: Dict[str, Any]) -> Dict[str, Any]:
        """حفظ رموز OAuth2 للمستخدم"""
        try:
            token_data = {
                'user_id': user_id,
                'access_token': tokens.get('access_token'),
                'refresh_token': tokens.get('refresh_token'),
                'token_type': tokens.get('token_type', 'Bearer'),
                'expires_at': tokens.get('expires_at'),
                'scope': tokens.get('scope'),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if self.is_connected and self.client:
                # حفظ في Supabase
                response = self.client.table('user_oauth_tokens').upsert(token_data).execute()
                logger.info(f"✅ تم حفظ رموز OAuth2 للمستخدم {user_id} في Supabase")
                return {'success': True, 'data': response.data}
            else:
                # حفظ محلي
                self.local_storage['oauth_tokens'][user_id] = token_data
                logger.info(f"✅ تم حفظ رموز OAuth2 للمستخدم {user_id} محلياً")
                return {'success': True, 'data': token_data}
                
        except Exception as e:
            logger.error(f"❌ خطأ في حفظ رموز OAuth2: {e}")
            return {'success': False, 'error': str(e)}
    
    def save_google_ads_accounts(self, user_id: str, accounts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """حفظ حسابات Google Ads للمستخدم"""
        try:
            saved_accounts = []
            
            for account in accounts:
                account_data = {
                    'user_id': user_id,
                    'customer_id': account.get('customerId'),
                    'descriptive_name': account.get('descriptiveName'),
                    'currency_code': account.get('currencyCode'),
                    'time_zone': account.get('timeZone'),
                    'manager': account.get('manager', False),
                    'test_account': account.get('testAccount', False),
                    'can_manage_clients': account.get('canManageClients', False),
                    'created_at': datetime.utcnow().isoformat()
                }
                
                if self.is_connected and self.client:
                    # حفظ في Supabase
                    response = self.client.table('user_google_ads_accounts').upsert(account_data).execute()
                    saved_accounts.append(response.data[0] if response.data else account_data)
                else:
                    # حفظ محلي
                    account_id = f"{user_id}_{account.get('customerId')}"
                    self.local_storage['google_ads_accounts'][account_id] = account_data
                    saved_accounts.append(account_data)
            
            logger.info(f"✅ تم حفظ {len(saved_accounts)} حساب Google Ads للمستخدم {user_id}")
            return {'success': True, 'accounts': saved_accounts}
            
        except Exception as e:
            logger.error(f"❌ خطأ في حفظ حسابات Google Ads: {e}")
            return {'success': False, 'error': str(e)}
    
    def link_account_to_mcc(self, customer_id: str, mcc_customer_id: str, 
                           account_name: str, user_id: str) -> Dict[str, Any]:
        """ربط حساب إعلاني بحساب MCC"""
        try:
            link_data = {
                'id': str(uuid.uuid4()),
                'customer_id': customer_id,
                'mcc_customer_id': mcc_customer_id,
                'account_name': account_name,
                'user_id': user_id,
                'linked_at': datetime.utcnow().isoformat(),
                'status': 'LINKED',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if self.is_connected and self.client:
                # حفظ في Supabase
                response = self.client.table('mcc_accounts').upsert(link_data).execute()
                logger.info(f"✅ تم ربط الحساب {customer_id} بـ MCC {mcc_customer_id} في Supabase")
                return {'success': True, 'data': response.data}
            else:
                # حفظ محلي
                link_id = f"{customer_id}_{mcc_customer_id}"
                self.local_storage['linked_accounts'][link_id] = link_data
                logger.info(f"✅ تم ربط الحساب {customer_id} بـ MCC {mcc_customer_id} محلياً")
                return {'success': True, 'data': link_data}
                
        except Exception as e:
            logger.error(f"❌ خطأ في ربط الحساب: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_linked_accounts(self, mcc_customer_id: str) -> Dict[str, Any]:
        """الحصول على الحسابات المرتبطة بـ MCC"""
        try:
            if self.is_connected and self.client:
                # استعلام من Supabase
                response = self.client.table('mcc_accounts').select('*').eq('mcc_customer_id', mcc_customer_id).execute()
                accounts = response.data
            else:
                # استعلام محلي
                accounts = [
                    account for account in self.local_storage['linked_accounts'].values()
                    if account.get('mcc_customer_id') == mcc_customer_id
                ]
            
            logger.info(f"✅ تم الحصول على {len(accounts)} حساب مرتبط بـ MCC {mcc_customer_id}")
            return {'success': True, 'accounts': accounts}
            
        except Exception as e:
            logger.error(f"❌ خطأ في الحصول على الحسابات المرتبطة: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_user_google_ads_accounts(self, user_id: str) -> Dict[str, Any]:
        """الحصول على حسابات Google Ads للمستخدم"""
        try:
            if self.is_connected and self.client:
                # استعلام من Supabase
                response = self.client.table('user_google_ads_accounts').select('*').eq('user_id', user_id).execute()
                accounts = response.data
            else:
                # استعلام محلي
                accounts = [
                    account for account in self.local_storage['google_ads_accounts'].values()
                    if account.get('user_id') == user_id
                ]
            
            logger.info(f"✅ تم الحصول على {len(accounts)} حساب Google Ads للمستخدم {user_id}")
            return {'success': True, 'accounts': accounts}
            
        except Exception as e:
            logger.error(f"❌ خطأ في الحصول على حسابات Google Ads: {e}")
            return {'success': False, 'error': str(e)}
    
    def update_account_status(self, customer_id: str, status: str) -> Dict[str, Any]:
        """تحديث حالة الحساب"""
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if self.is_connected and self.client:
                # تحديث في Supabase
                response = self.client.table('mcc_accounts').update(update_data).eq('customer_id', customer_id).execute()
                logger.info(f"✅ تم تحديث حالة الحساب {customer_id} إلى {status} في Supabase")
                return {'success': True, 'data': response.data}
            else:
                # تحديث محلي
                for link_id, account in self.local_storage['linked_accounts'].items():
                    if account.get('customer_id') == customer_id:
                        account.update(update_data)
                        logger.info(f"✅ تم تحديث حالة الحساب {customer_id} إلى {status} محلياً")
                        return {'success': True, 'data': account}
                
                return {'success': False, 'error': 'الحساب غير موجود'}
                
        except Exception as e:
            logger.error(f"❌ خطأ في تحديث حالة الحساب: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_connection_status(self) -> Dict[str, Any]:
        """الحصول على حالة الاتصال"""
        return {
            'supabase_available': SUPABASE_AVAILABLE,
            'is_connected': self.is_connected,
            'supabase_url': self.supabase_url is not None,
            'supabase_key': self.supabase_key is not None,
            'local_storage_enabled': True,
            'local_accounts_count': len(self.local_storage['linked_accounts'])
        }
    
    def get_client_requests(self, customer_id: str = None) -> List[Dict[str, Any]]:
        """جلب طلبات العميل من قاعدة البيانات"""
        try:
            if not self.is_connected:
                logger.warning("⚠️ Supabase غير متصل - استخدام التخزين المحلي")
                return []
            
            if customer_id and customer_id.lower() == 'all':
                # جلب جميع الطلبات
                response = self.client.table('client_requests').select('*').execute()
            elif customer_id:
                # جلب طلبات عميل محدد
                response = self.client.table('client_requests').select('*').eq('customer_id', customer_id).execute()
            else:
                # جلب جميع الطلبات (افتراضي)
                response = self.client.table('client_requests').select('*').execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب طلبات العميل: {e}")
            return []
    
    def save_client_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """حفظ طلب العميل في قاعدة البيانات"""
        try:
            if not self.is_connected:
                logger.warning("⚠️ Supabase غير متصل - استخدام التخزين المحلي")
                return {'success': False, 'error': 'Database not connected'}
            
            # التحقق من وجود طلب سابق للعميل
            existing_requests = self.get_client_requests(request_data.get('customer_id'))
            
            if existing_requests:
                # تحديث الطلب الموجود
                response = self.client.table('client_requests').update({
                    'status': request_data.get('status'),
                    'account_name': request_data.get('account_name'),
                    'link_details': request_data.get('link_details'),
                    'request_type': request_data.get('request_type', 'status_update')
                }).eq('customer_id', request_data.get('customer_id')).execute()
                
                logger.info(f"✅ تم تحديث طلب العميل {request_data.get('customer_id')}")
            else:
                # إنشاء طلب جديد
                new_request = {
                    'customer_id': request_data.get('customer_id'),
                    'status': request_data.get('status'),
                    'account_name': request_data.get('account_name'),
                    'link_details': request_data.get('link_details'),
                    'request_type': request_data.get('request_type', 'new_request')
                }
                
                response = self.client.table('client_requests').insert(new_request).execute()
                logger.info(f"✅ تم إنشاء طلب جديد للعميل {request_data.get('customer_id')}")
            
            return {'success': True, 'data': response.data}
            
        except Exception as e:
            logger.error(f"❌ خطأ في حفظ طلب العميل: {e}")
            return {'success': False, 'error': str(e)}
    
    def delete_client_request(self, customer_id: str) -> Dict[str, Any]:
        """حذف طلب العميل من قاعدة البيانات"""
        try:
            if not self.is_connected:
                logger.warning("⚠️ Supabase غير متصل - لا يمكن الحذف")
                return {'success': False, 'error': 'Database not connected'}
            
            # حذف الطلب
            response = self.client.table('client_requests').delete().eq('customer_id', customer_id).execute()
            
            if response.data:
                logger.info(f"✅ تم حذف طلب العميل {customer_id}")
                return {
                    'success': True, 
                    'customer_id': customer_id,
                    'deleted_records': len(response.data),
                    'message': f'تم حذف طلب العميل {customer_id} بنجاح'
                }
            else:
                logger.info(f"ℹ️ لم يتم العثور على طلب للعميل {customer_id}")
                return {
                    'success': True,
                    'customer_id': customer_id, 
                    'deleted_records': 0,
                    'message': f'لم يتم العثور على طلب للعميل {customer_id}'
                }
            
        except Exception as e:
            logger.error(f"❌ خطأ في حذف طلب العميل: {e}")
            return {'success': False, 'error': str(e)}

# إنشاء نسخة عامة
supabase_manager = SupabaseManager()
