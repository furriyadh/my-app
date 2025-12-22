#!/usr/bin/env python3
"""
Google OAuth2 Manager - نسخة منظفة ومحسنة
يتبع أفضل الممارسات من Google Ads API Documentation
"""

import os
import logging
import secrets
import base64
import hashlib
import requests
from datetime import datetime
from urllib.parse import urlencode, parse_qs
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv('../.env.development')

# إعداد التسجيل
logger = logging.getLogger(__name__)

class GoogleOAuth2Manager:
    """
    مدير OAuth2 لـ Google Ads API
    يتبع الممارسات الرسمية من Google Ads API Documentation
    """
    
    def __init__(self):
        """تهيئة مدير OAuth2"""
        # إعدادات OAuth2
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        # تحديد redirect URI حسب البيئة
        if os.getenv('NODE_ENV') == 'production':
            self.redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'https://furriyadh.com/api/oauth/google/callback')
        else:
            self.redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:3000/api/oauth/google/callback')
        
        # نطاقات الصلاحيات
        self.scopes = [
            'https://www.googleapis.com/auth/adwords',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
            'profile',
            'email'
        ]
        
        # التحقق من الإعدادات
        self.is_configured = self._validate_configuration()
        
        if self.is_configured:
            logger.info("✅ إعدادات OAuth2 صحيحة ومتوافقة مع Google Ads API Documentation")
            logger.info("✅ تم تهيئة Google Ads OAuth2 Manager بنجاح")
            logger.info("📋 يتبع الممارسات الرسمية من Google Ads API Documentation")
        else:
            logger.error("❌ متغيرات OAuth2 مفقودة: GOOGLE_CLIENT_ID or GOOGLE_ADS_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN")
            logger.error("📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview")
            logger.warning("⚠️ Google Ads OAuth2 Managger غير مُكون بالكامل")

    def _validate_configuration(self):
        """التحقق من صحة الإعدادات"""
        required_vars = [
            self.client_id,
            self.client_secret,
            self.developer_token
        ]
        return all(var for var in required_vars)

    def generate_pkce_pair(self):
        """إنشاء PKCE code verifier و code challenge"""
        # إنشاء code verifier عشوائي
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        
        # إنشاء code challenge من code verifier
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        return code_verifier, code_challenge

    def get_authorization_url(self, mcc_customer_id=None, redirect_after=None):
        """
        إنشاء رابط المصادقة مع Google
        يتبع الممارسات الرسمية من Google Identity Platform
        """
        try:
            logger.info("🔗 بدء OAuth مع Google (حسب Google Ads API Documentation)...")
            
            if not self.is_configured:
                logger.error("❌ OAuth2 Manager غير مُكون بشكل صحيح")
                return None
            
            # إنشاء state parameter للأمان
            state = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
            
            # إنشاء PKCE parameters
            code_verifier, code_challenge = self.generate_pkce_pair()
            
            # معاملات OAuth2
            params = {
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'response_type': 'code',
                'scope': ' '.join(self.scopes),
                'state': state,
                'code_challenge': code_challenge,
                'code_challenge_method': 'S256',
                'access_type': 'offline',
                'prompt': 'consent',
                'include_granted_scopes': 'true'
            }
            
            # إنشاء URL
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
            
            logger.info("✅ تم إنشاء رابط المصادقة بنجاح (حسب Google Ads API Documentation)")
            logger.info("📋 يتبع: https://developers.google.com/identity/protocols/oauth2")
            
            return {
                'auth_url': auth_url,
                'state': state,
                'code_verifier': code_verifier,
                'mcc_customer_id': mcc_customer_id,
                'redirect_after': redirect_after
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء رابط المصادقة: {e}")
            logger.error("📋 راجع: https://developers.google.com/google-ads/api/docs/oauth/overview")
            return None

    def get_google_ads_accounts(self, access_token):
        """
        جلب حسابات Google Ads باستخدام access token
        يستخدم REST API مباشرة لتجنب مشاكل YAML configuration
        """
        try:
            logger.info("📊 الحصول على الحسابات الإعلانية...")
            
            if not access_token:
                logger.error("❌ access_token غير محدد")
                return []
            
            if not self.developer_token:
                logger.error("❌ GOOGLE_ADS_DEVELOPER_TOKEN غير محدد")
                return []
            
            # استخدام Google Ads REST API مباشرة
            logger.info("📊 استخدام Google Ads REST API...")
            
            # إعداد headers للطلب
            headers = {
                'Authorization': f'Bearer {access_token}',
                'developer-token': self.developer_token,
                'Content-Type': 'application/json'
            }
            
            # إضافة login_customer_id فقط إذا كان متوفراً
            mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
            if mcc_customer_id and mcc_customer_id.strip():
                headers['login-customer-id'] = mcc_customer_id
                logger.info(f"📊 استخدام MCC Customer ID: {mcc_customer_id}")
            else:
                logger.info("📊 عدم استخدام MCC - الوصول المباشر للحسابات")
            
            # جلب الحسابات المتاحة
            url = "https://googleads.googleapis.com/v20/customers:listAccessibleCustomers"
            
            logger.info(f"📊 إرسال طلب إلى: {url}")
            response = requests.get(url, headers=headers, timeout=5)  # timeout أسرع
            
            if response.status_code == 200:
                data = response.json()
                resource_names = data.get('resourceNames', [])
                
                logger.info(f"📊 تم العثور على {len(resource_names)} حساب متاح")
                
                accounts = []
                for resource_name in resource_names:
                    # استخراج customer ID من resource name
                    customer_id = resource_name.split('/')[-1]
                    
                    # إضافة الحساب بمعلومات أساسية
                    account_info = {
                        'customerId': customer_id,
                        'customerName': f"Google Ads Account {customer_id}",
                        'currencyCode': 'USD',
                        'timeZone': 'UTC',
                        'status': 'ENABLED'
                    }
                    accounts.append(account_info)
                    logger.info(f"📊 تم العثور على حساب: {account_info['customerName']} ({account_info['customerId']})")
                
                logger.info(f"📊 تم جلب {len(accounts)} حساب بنجاح")
                
                # حفظ الحسابات في قاعدة البيانات (بشكل مُحسن للسرعة)
                try:
                    import threading
                    
                    def save_accounts_async():
                        """حفظ الحسابات في thread منفصل مع timeout محدود (Windows compatible)"""
                        try:
                            import time
                            
                            # استخدام threading.Timer بدلاً من signal (متوافق مع Windows)
                            timeout_event = threading.Event()
                            
                            def timeout_handler():
                                timeout_event.set()
                                logger.warning("⚠️ Database save timeout (30 seconds) - ستكمل العملية في الخلفية")
                            
                            # تعيين timeout 30 ثانية للحسابات الكثيرة
                            timeout_timer = threading.Timer(30.0, timeout_handler)
                            timeout_timer.start()
                            
                            try:
                                from utils.google_ads_database import GoogleAdsDatabaseManager
                                db_manager = GoogleAdsDatabaseManager()
                                
                                # حفظ جميع الحسابات مع معالجة متقدمة
                                total_accounts = len(accounts)
                                saved_count = 0
                                failed_count = 0
                                batch_size = 10  # حفظ 10 حسابات في كل دفعة
                                
                                logger.info(f"📊 بدء حفظ {total_accounts} حساب في دفعات من {batch_size}")
                                
                                # معالجة الحسابات في دفعات للكفاءة
                                for i in range(0, total_accounts, batch_size):
                                    batch = accounts[i:i + batch_size]
                                    batch_num = (i // batch_size) + 1
                                    
                                    logger.info(f"📦 معالجة الدفعة {batch_num}: حسابات {i+1}-{min(i+batch_size, total_accounts)}")
                                    
                                    for account in batch:
                                        try:
                                            account_data = {
                                        'customer_id': account['customerId'],
                                        'account_name': account['customerName'],
                                        'currency_code': account.get('currencyCode', 'USD'),
                                        'time_zone': account.get('timeZone', 'UTC'),
                                        'status': account['status'],
                                        'is_manager_account': account.get('isManagerAccount', False),
                                        'is_test_account': account.get('isTestAccount', False)
                                    }
                                            
                                            if db_manager.save_google_ads_account(account_data):
                                                saved_count += 1
                                            else:
                                                failed_count += 1
                                                
                                        except Exception as account_error:
                                            failed_count += 1
                                            logger.warning(f"⚠️ فشل حفظ حساب {account.get('customerId', 'unknown')}: {account_error}")
                                    
                                    # استراحة قصيرة بين الدفعات لتجنب الضغط على قاعدة البيانات
                                    if i + batch_size < total_accounts:
                                        time.sleep(0.1)
                                
                                logger.info(f"✅ اكتمل الحفظ: {saved_count} نجح، {failed_count} فشل من أصل {total_accounts}")
                                
                                # إحصائيات مفصلة
                                success_rate = (saved_count / total_accounts * 100) if total_accounts > 0 else 0
                                logger.info(f"📈 معدل النجاح: {success_rate:.1f}%")
                                
                            finally:
                                # إلغاء timeout timer (Windows compatible)
                                if 'timeout_timer' in locals():
                                    timeout_timer.cancel()
                                
                        except TimeoutError:
                            logger.warning("⚠️ تم تجاهل حفظ الحسابات بسبب timeout - العملية تستمر")
                        except Exception as async_save_error:
                            logger.error(f"❌ خطأ في حفظ الحسابات في الخلفية: {async_save_error}")
                    
                    # تشغيل الحفظ في thread منفصل
                    save_thread = threading.Thread(target=save_accounts_async, daemon=True)
                    save_thread.start()
                    logger.info("🚀 بدء حفظ الحسابات في الخلفية للسرعة")
                            
                except Exception as save_error:
                    logger.error(f"❌ خطأ في إعداد حفظ الحسابات: {save_error}")
                    # المتابعة بدون حفظ
                
                return accounts
            else:
                logger.error(f"❌ فشل في جلب الحسابات: {response.status_code}")
                logger.error(f"❌ الاستجابة: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"❌ خطأ في جلب الحسابات: {e}")
            return []

    def unlink_google_ads_account(self, access_token, customer_id):
        """إلغاء ربط حساب Google Ads من MCC"""
        try:
            logger.info(f"🔗 بدء إلغاء ربط الحساب {customer_id} من MCC...")
            
            if not self.is_configured:
                logger.error("❌ OAuth2 Manager غير مُكون بشكل صحيح")
                return {'success': False, 'error': 'OAuth2 Manager not configured'}
            
            # تحديث قاعدة البيانات - تغيير الحالة إلى INACTIVE
            try:
                from supabase import create_client
                supabase_url = os.getenv('SUPABASE_URL')
                supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                
                if supabase_url and supabase_key:
                    supabase = create_client(supabase_url, supabase_key)
                    
                    # تحديث الحالة إلى PENDING (Awaiting Acceptance) - طلب ربط معلق
                    update_data = {
                        'status': 'PENDING',
                        'accepted_at': None,  # مسح تاريخ القبول = طلب معلق
                        'last_checked_at': datetime.now().isoformat()
                    }
                    
                    result = supabase.table('mcc_linked_accounts').update(update_data).eq('customer_id', customer_id).execute()
                    
                    if result.data:
                        logger.info(f"✅ تم تحديث الحساب {customer_id} إلى INACTIVE في قاعدة البيانات")
                        
                        # إزالة من الذاكرة إذا كان موجوداً
                        if 'recently_linked_accounts' in globals():
                            if customer_id in globals()['recently_linked_accounts']:
                                globals()['recently_linked_accounts'].remove(customer_id)
                                logger.info(f"🗑️ تم إزالة الحساب {customer_id} من الذاكرة")
                        
                        return {
                            'success': True,
                            'message': f'تم إلغاء ربط الحساب {customer_id} بنجاح',
                            'account_id': customer_id,
                            'new_status': 'INACTIVE'
                        }
                    else:
                        logger.warning(f"⚠️ لم يتم العثور على الحساب {customer_id} في قاعدة البيانات")
                        return {
                            'success': False,
                            'error': 'Account not found in database',
                            'message': 'الحساب غير موجود في قاعدة البيانات'
                        }
                else:
                    logger.error("❌ Supabase not configured")
                    return {'success': False, 'error': 'Supabase not configured'}
                    
            except Exception as db_error:
                logger.error(f"❌ خطأ في تحديث قاعدة البيانات: {db_error}")
                return {'success': False, 'error': f'Database error: {str(db_error)}'}
                
        except Exception as e:
            logger.error(f"❌ خطأ في إلغاء ربط الحساب: {e}")
            return {'success': False, 'error': str(e)}

# إنشاء instance عام
oauth2_manager = GoogleOAuth2Manager()

# للتوافق مع الكود الموجود
oauth_manager = oauth2_manager
