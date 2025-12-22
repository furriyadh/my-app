#!/usr/bin/env python3
"""
MCC Customer Linking Service - محسن باستخدام المكتبة الرسمية
يتبع أفضل الممارسات من google-ads-python الرسمية
"""

from flask import Blueprint, request, jsonify
import json
import logging
import os
import sys
import requests
from datetime import datetime
from typing import Dict, Any, Optional

# إضافة مسار الخدمات
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# إعداد التسجيل أولاً
logger = logging.getLogger(__name__)

try:
    from services.google_ads_client import GoogleAdsClientManager
    from google.ads.googleads.errors import GoogleAdsException
    GOOGLE_ADS_AVAILABLE = True
    logger.info("✅ تم تحميل مكتبة Google Ads بنجاح")
except ImportError as e:
    GOOGLE_ADS_AVAILABLE = False
    logger.warning(f"⚠️ مكتبة Google Ads غير متاحة: {e}")

# إنشاء Blueprint
mcc_link_bp = Blueprint('mcc_link', __name__)

class MCCLinkingService:
    """
    خدمة ربط الحسابات بـ MCC - محسنة باستخدام المكتبة الرسمية
    يستخدم GoogleAdsClient بدلاً من REST API المباشر
    """
    
    # إعدادات الطلبات
    TIMEOUT = 30  # ثواني
    
    def __init__(self):
        """تهيئة خدمة الربط مع التحقق من المتغيرات المطلوبة"""
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        
        # تهيئة Google Ads Client Manager
        self.google_ads_manager = GoogleAdsClientManager() if GOOGLE_ADS_AVAILABLE else None
        
        # التحقق من المتغيرات المطلوبة
        self._validate_configuration()
        
        # تسجيل حالة المكتبة الرسمية
        if GOOGLE_ADS_AVAILABLE and self.google_ads_manager:
            logger.info("✅ المكتبة الرسمية Google Ads متاحة وستستخدم")
        else:
            logger.warning("⚠️ المكتبة الرسمية غير متاحة - سيتم استخدام REST API")
    
    def _validate_configuration(self) -> None:
        """التحقق من صحة إعدادات الخدمة"""
        missing_vars = []
        
        if not self.mcc_customer_id:
            missing_vars.append('MCC_LOGIN_CUSTOMER_ID')
        if not self.developer_token:
            missing_vars.append('GOOGLE_ADS_DEVELOPER_TOKEN')
        if not self.client_id:
            missing_vars.append('GOOGLE_ADS_CLIENT_ID')
        if not self.client_secret:
            missing_vars.append('GOOGLE_ADS_CLIENT_SECRET')
            
        if missing_vars:
            logger.error(f"❌ متغيرات البيئة المفقودة: {', '.join(missing_vars)}")
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        logger.info(f"✅ تم التحقق من إعدادات MCC بنجاح - MCC ID: {self.mcc_customer_id}")
    
    def _build_headers(self, access_token: str) -> Dict[str, str]:
        """بناء headers للطلبات"""
        return {
            'Authorization': f'Bearer {access_token}',
            'developer-token': self.developer_token,
            'login-customer-id': self.mcc_customer_id,
            'Content-Type': 'application/json',
            'User-Agent': 'MCC-Linking-Service/1.0'
        }
    
    def _validate_customer_id(self, customer_id: str) -> bool:
        """التحقق من صحة معرف العميل"""
        if not customer_id:
            return False
        
        # إزالة الشرطات إذا وجدت
        clean_id = customer_id.replace('-', '')
        
        # التحقق من أن المعرف يحتوي على أرقام فقط وطوله صحيح
        return clean_id.isdigit() and len(clean_id) == 10
    
    def _format_customer_id(self, customer_id: str) -> str:
        """تنسيق معرف العميل"""
        return customer_id.replace('-', '')
        
    def create_customer_client_link(self, access_token: str, customer_id: str, account_name: str = None) -> Dict[str, Any]:
        """
        إنشاء رابط بين MCC والحساب الإعلاني - طريقة محسنة
        يستخدم المكتبة الرسمية Google Ads Python
        
        Args:
            access_token: رمز الوصول للمصادقة
            customer_id: معرف الحساب الإعلاني المراد ربطه
            account_name: اسم الحساب (اختياري)
            
        Returns:
            Dict containing success status and result data
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"🔗 بدء عملية ربط الحساب {customer_id} بـ MCC {self.mcc_customer_id} (الطريقة المحسنة)")
            
            # التحقق من صحة معرف العميل
            if not self._validate_customer_id(customer_id):
                logger.error(f"❌ معرف العميل غير صحيح: {customer_id}")
                return {
                    'success': False,
                    'error': 'Invalid customer ID format',
                    'message': 'معرف العميل غير صحيح - يجب أن يكون 10 أرقام'
                }
            
            # تنسيق معرف العميل
            formatted_customer_id = self._format_customer_id(customer_id)
            
            # تشخيص حالة المكتبة الرسمية
            logger.info(f"🔍 GOOGLE_ADS_AVAILABLE: {GOOGLE_ADS_AVAILABLE}")
            logger.info(f"🔍 self.google_ads_manager: {self.google_ads_manager}")
            logger.info(f"🔍 google_ads_manager.is_initialized: {getattr(self.google_ads_manager, 'is_initialized', 'N/A')}")
            
            # محاولة استخدام المكتبة الرسمية أولاً
            if GOOGLE_ADS_AVAILABLE and self.google_ads_manager:
                logger.info("✅ سيتم استخدام المكتبة الرسمية Google Ads")
                return self._link_using_official_library(access_token, formatted_customer_id, account_name, start_time)
            else:
                # Fallback إلى REST API
                logger.warning("⚠️ استخدام REST API كبديل لعدم توفر المكتبة الرسمية")
                logger.warning(f"⚠️ السبب - GOOGLE_ADS_AVAILABLE: {GOOGLE_ADS_AVAILABLE}, google_ads_manager: {bool(self.google_ads_manager)}")
                return self._link_using_rest_api(access_token, formatted_customer_id, account_name, start_time)
                
        except requests.exceptions.Timeout:
            logger.error(f"❌ انتهت مهلة الطلب للحساب {customer_id}")
            return {
                'success': False,
                'error': 'Request timeout',
                'message': 'انتهت مهلة الطلب - يرجى المحاولة مرة أخرى'
            }
            
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ خطأ في الاتصال بـ Google Ads API للحساب {customer_id}")
            return {
                'success': False,
                'error': 'Connection error',
                'message': 'خطأ في الاتصال بـ Google Ads API'
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ غير متوقع في ربط الحساب {customer_id}: {e}")
            return {
                'success': False,
                'error': 'Unexpected error',
                'message': f'خطأ غير متوقع: {str(e)}'
            }
    
    def _make_api_request(self, url: str, headers: Dict[str, str], data: Dict[str, Any]) -> requests.Response:
        """إرسال طلب API مع retry logic"""
        max_retries = 3
        retry_delay = 1  # ثانية
        
        for attempt in range(max_retries):
            try:
                logger.info(f"📡 محاولة {attempt + 1}/{max_retries}")
                
                response = requests.post(
                    url,
                    headers=headers,
                    json=data,
                    timeout=self.TIMEOUT
                )
                
                logger.info(f"📊 استجابة الطلب: {response.status_code}")
                return response
                
            except requests.exceptions.Timeout as e:
                if attempt < max_retries - 1:
                    logger.warning(f"⚠️ انتهت مهلة المحاولة {attempt + 1} - إعادة المحاولة خلال {retry_delay} ثانية")
                    import time
                    time.sleep(retry_delay)
                    retry_delay *= 2  # exponential backoff
                else:
                    raise e
                    
            except requests.exceptions.ConnectionError as e:
                if attempt < max_retries - 1:
                    logger.warning(f"⚠️ خطأ اتصال في المحاولة {attempt + 1} - إعادة المحاولة خلال {retry_delay} ثانية")
                    import time
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    raise e
    
    def _handle_api_error(self, response: requests.Response, customer_id: str) -> Dict[str, Any]:
        """معالجة أخطاء API بشكل احترافي"""
        error_text = response.text
        status_code = response.status_code
        
        logger.error(f"❌ فشل طلب الربط للحساب {customer_id}")
        logger.error(f"❌ Status Code: {status_code}")
        logger.error(f"❌ Response: {error_text}")
        logger.error(f"❌ Headers: {dict(response.headers)}")
        
        # محاولة استخراج تفاصيل الخطأ من JSON
        error_details = None
        try:
            error_json = response.json()
            error_details = error_json.get('error', {})
            
            # استخراج رسالة الخطأ الرئيسية
            main_error = error_details.get('message', 'Unknown error')
            
            # استخراج تفاصيل الأخطاء
            details = error_details.get('details', [])
            if details:
                logger.error(f"❌ Error Details: {details}")
                
        except (json.JSONDecodeError, AttributeError):
            logger.error("❌ لا يمكن parse JSON من استجابة الخطأ")
            main_error = f"HTTP {status_code} Error"
        
        # تحديد نوع الخطأ وإرجاع رسالة مناسبة
        if status_code == 400:
            message = 'طلب غير صحيح - تحقق من معرف الحساب ومعرف MCC'
        elif status_code == 401:
            message = 'خطأ في المصادقة - تحقق من رمز الوصول'
        elif status_code == 403:
            message = 'ليس لديك صلاحية للوصول لهذا الحساب أو MCC'
        elif status_code == 404:
            message = 'الحساب أو MCC غير موجود'
        elif status_code == 429:
            message = 'تم تجاوز حد الطلبات - يرجى المحاولة لاحقاً'
        elif status_code >= 500:
            message = 'خطأ في خادم Google Ads - يرجى المحاولة لاحقاً'
        else:
            message = f'خطأ غير معروف: {main_error}'
        
        return {
            'success': False,
            'error': f'HTTP {status_code}',
            'message': message,
            'details': {
                'status_code': status_code,
                'error_response': error_text,
                'customer_id': customer_id,
                'mcc_customer_id': self.mcc_customer_id,
                'error_details': error_details
            }
        }
    
    def _link_using_official_library(self, access_token: str, customer_id: str, account_name: str, start_time: datetime) -> Dict[str, Any]:
        """ربط العميل باستخدام المكتبة الرسمية Google Ads Python"""
        try:
            logger.info(f"🚀 استخدام المكتبة الرسمية لربط العميل {customer_id}")
            
            # إنشاء عميل Google Ads مع الـ token
            client = self.google_ads_manager.create_client_with_token(access_token)
            
            if not client:
                logger.error("❌ فشل في إنشاء عميل Google Ads")
                return {
                    'success': False,
                    'error': 'Client creation failed',
                    'message': 'فشل في إنشاء عميل Google Ads'
                }
            
            # ربط العميل بـ MCC
            result = self.google_ads_manager.link_customer_to_mcc_standard(
                client=client,
                manager_customer_id=self.mcc_customer_id,
                customer_id=customer_id
            )
            
            if result['success']:
                execution_time = (datetime.now() - start_time).total_seconds()
                
                # إضافة معلومات إضافية للنجاح
                result['data'] = {
                    'customer_id': customer_id,
                    'mcc_customer_id': self.mcc_customer_id,
                    'status': result.get('status', 'PENDING_APPROVAL'),
                    'account_name': account_name or f'Account {customer_id}',
                    'resource_name': result.get('resource_name'),
                    'created_at': start_time.isoformat(),
                    'execution_time_seconds': execution_time,
                    'method_used': 'official_library',
                    'next_steps': 'العميل يحتاج للموافقة على طلب الربط في حسابه الإعلاني'
                }
                
                # حفظ في Supabase عند نجاح الربط
                try:
                    import os 
                    from supabase import create_client
                    
                    supabase_url = os.getenv('SUPABASE_URL')
                    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                    
                    if supabase_url and supabase_key:
                        supabase = create_client(supabase_url, supabase_key)
                        
                        # بيانات الحساب للحفظ
                        account_data = {
                            'customer_id': customer_id,
                            'account_name': account_name or f'Account {customer_id}',
                            'mcc_customer_id': self.mcc_customer_id,
                            'status': 'PENDING',  # دائماً PENDING حتى يقبل المستخدم
                            'resource_name': result.get('resource_name'),
                            'link_id': result.get('link_id'),
                            'invitation_sent_at': start_time.isoformat(),
                            'never_expires': True,
                            'auto_refresh_enabled': True
                        }
                        
                        # حفظ في الجدول
                        supabase.table('mcc_linked_accounts').insert(account_data).execute()
                        logger.info(f"💾 تم حفظ الحساب {customer_id} في Supabase بحالة PENDING")
                        
                        # تسجيل الحدث في جدول الأحداث
                        action_data = {
                            'customer_id': customer_id,
                            'action': 'INVITATION_SENT',
                            'action_source': 'api',
                            'action_details': {'resource_name': result.get('resource_name')}
                        }
                        supabase.table('mcc_user_actions').insert(action_data).execute()
                        
                    else:
                        logger.warning("⚠️ Supabase غير مُعد - لم يتم حفظ البيانات")
                        
                except Exception as save_error:
                    logger.error(f"❌ فشل في حفظ البيانات في Supabase: {save_error}")
                
                logger.info(f"✅ نجح الربط باستخدام المكتبة الرسمية في {execution_time:.2f} ثانية")
                
            return result
            
        except Exception as e:
            logger.error(f"❌ خطأ في استخدام المكتبة الرسمية: {e}")
            # Fallback إلى REST API
            logger.info("🔄 التبديل إلى REST API كبديل")
            return self._link_using_rest_api(access_token, customer_id, account_name, start_time)
    
    def _link_using_rest_api(self, access_token: str, customer_id: str, account_name: str, start_time: datetime) -> Dict[str, Any]:
        """ربط العميل باستخدام REST API (طريقة احتياطية)"""
        try:
            logger.info(f"🌐 استخدام REST API لربط العميل {customer_id}")
            
            # بناء headers الطلب  
            headers = self._build_headers(access_token)
            
            # بناء URL الطلب
            url = f"https://googleads.googleapis.com/v20/customers/{self.mcc_customer_id}/customerClientLinks:mutate"
            
            # بناء بيانات العملية بالتنسيق الصحيح (مبسط بدون حقول زائدة)
            operation_data = {
                "operation": {
                    "create": {
                        "clientCustomer": f"customers/{customer_id}",
                        "status": "PENDING"
                    }
                }
            }
            
            logger.info(f"📡 إرسال طلب REST API للحساب {customer_id}")
            logger.info(f"📋 JSON Payload: {json.dumps(operation_data, indent=2)}")
            
            # إرسال الطلب
            response = self._make_api_request(url, headers, operation_data)
            
            if response.status_code == 200:
                result_data = response.json()
                results = result_data.get('results', [])
                execution_time = (datetime.now() - start_time).total_seconds()
                
                logger.info(f"✅ REST API نجح في {execution_time:.2f} ثانية")
                
                return {
                    'success': True,
                    'message': 'تم إرسال طلب الربط بنجاح باستخدام REST API',
                    'data': {
                        'customer_id': customer_id,
                        'mcc_customer_id': self.mcc_customer_id,
                        'status': 'PENDING_APPROVAL',
                        'account_name': account_name or f'Account {customer_id}',
                        'resource_name': results[0].get('resourceName') if results else None,
                        'created_at': start_time.isoformat(),
                        'execution_time_seconds': execution_time,
                        'method_used': 'rest_api',
                        'next_steps': 'العميل يحتاج للموافقة على طلب الربط في حسابه الإعلاني'
                    }
                }
            else:
                return self._handle_api_error(response, customer_id)
                
        except Exception as e:
            logger.error(f"❌ خطأ في REST API: {e}")
            return {
                'success': False,
                'error': 'REST API Error',
                'message': f'خطأ في REST API: {str(e)}'
            }

# إنشاء instance من الخدمة
mcc_linking_service = MCCLinkingService()

@mcc_link_bp.route('/api/mcc/link-customer', methods=['POST'])
def link_customer_to_mcc():
    """
    ربط حساب إعلاني بـ MCC - Professional Implementation
    
    Request Body:
        {
            "customer_id": "1234567890",
            "account_name": "Optional Account Name"
        }
    
    Headers:
        Authorization: Bearer {access_token}
    
    Returns:
        JSON response with success status and link details
    """
    request_start_time = datetime.now()
    
    try:
        logger.info(f"🔗 طلب ربط جديد من {request.remote_addr}")
        
        # التحقق من Content-Type
        if not request.is_json:
            logger.error("❌ Content-Type غير صحيح")
            return jsonify({
                'success': False,
                'error': 'Invalid Content-Type',
                'message': 'يجب أن يكون Content-Type application/json'
            }), 400
        
        # الحصول على البيانات من الطلب
        data = request.get_json()
        
        if not data:
            logger.error("❌ لم يتم توفير بيانات في الطلب")
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'لم يتم توفير بيانات في الطلب'
            }), 400
        
        # استخراج البيانات المطلوبة
        customer_id = data.get('customer_id', '').strip()
        account_name = data.get('account_name', '').strip()
        
        # التحقق من وجود معرف العميل
        if not customer_id:
            logger.error("❌ معرف العميل مفقود")
            return jsonify({
                'success': False,
                'error': 'Customer ID is required',
                'message': 'معرف العميل مطلوب'
            }), 400
        
        # التحقق من صحة معرف العميل
        if not mcc_linking_service._validate_customer_id(customer_id):
            logger.error(f"❌ معرف العميل غير صحيح: {customer_id}")
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل غير صحيح - يجب أن يكون 10 أرقام'
            }), 400
        
        # توليد access token من refresh token في ملفات البيئة
        refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        client_id = os.getenv('GOOGLE_ADS_CLIENT_ID') 
        client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        
        if not all([refresh_token, client_id, client_secret]):
            logger.error("❌ بيانات OAuth غير مكتملة في متغيرات البيئة")
            return jsonify({
                'success': False,
                'error': 'Missing OAuth credentials',
                'message': 'بيانات OAuth غير مكتملة في متغيرات البيئة'
            }), 500
        
        logger.info("🔄 توليد access token من refresh token...")
        try:
            token_response = requests.post('https://oauth2.googleapis.com/token', data={
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            }, timeout=10)
            
            if token_response.status_code != 200:
                logger.error(f"❌ فشل في تجديد token: {token_response.status_code}")
                logger.error(f"❌ Response: {token_response.text}")
                return jsonify({
                    'success': False,
                    'error': 'Token refresh failed',
                    'message': 'فشل في تجديد OAuth token',
                    'details': token_response.text
                }), 401
            
            token_data = token_response.json()
            access_token = token_data.get('access_token')
            
            if not access_token:
                logger.error("❌ لم يتم الحصول على access token")
                return jsonify({
                    'success': False,
                    'error': 'No access token received',
                    'message': 'لم يتم الحصول على access token'
                }), 401
                
            logger.info("✅ تم الحصول على access token بنجاح")
            
        except Exception as e:
            logger.error(f"❌ خطأ في تجديد token: {e}")
            return jsonify({
                'success': False,
                'error': 'Token generation error',
                'message': f'خطأ في توليد access token: {str(e)}'
            }), 500
        
        logger.info(f"📋 بيانات الطلب: Customer ID: {customer_id}, Account Name: {account_name or 'غير محدد'}")
        
        # تنفيذ عملية الربط
        logger.info("🚀 بدء عملية الربط...")
        result = mcc_linking_service.create_customer_client_link(
            access_token=access_token,
            customer_id=customer_id,
            account_name=account_name
        )
        
        # حساب وقت التنفيذ
        execution_time = (datetime.now() - request_start_time).total_seconds()
        result['execution_time'] = execution_time
        
        # تسجيل النتيجة
        if result['success']:
            logger.info(f"✅ تم ربط الحساب {customer_id} بنجاح في {execution_time:.2f} ثانية")
            return jsonify(result), 200
        else:
            logger.error(f"❌ فشل في ربط الحساب {customer_id}: {result.get('message', 'خطأ غير معروف')}")
            return jsonify(result), 400
            
    except ValueError as e:
        # خطأ في التحقق من الإعدادات
        logger.error(f"❌ خطأ في الإعدادات: {e}")
        return jsonify({
            'success': False,
            'error': 'Configuration error',
            'message': 'خطأ في إعدادات الخدمة - تحقق من متغيرات البيئة'
        }), 500
        
    except Exception as e:
        # خطأ غير متوقع
        execution_time = (datetime.now() - request_start_time).total_seconds()
        logger.error(f"❌ خطأ غير متوقع في endpoint ربط العميل: {e}")
        logger.error(f"❌ وقت التنفيذ قبل الخطأ: {execution_time:.2f} ثانية")
        
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'خطأ داخلي في الخادم - يرجى المحاولة لاحقاً',
            'execution_time': execution_time
        }), 500

@mcc_link_bp.route('/api/mcc/link-customer', methods=['GET'])
def get_link_info():
    """معلومات حول خدمة الربط"""
    return jsonify({
        'success': True,
        'message': 'MCC Customer Linking Service',
        'mcc_customer_id': mcc_linking_service.mcc_customer_id,
        'endpoints': {
            'link_customer': 'POST /api/mcc/link-customer'
        },
        'docs': 'https://developers.google.com/google-ads/api/docs/account-management/create-account-links'
    })
