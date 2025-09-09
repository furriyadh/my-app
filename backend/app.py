#!/usr/bin/env python3
"""
Google Ads MCC Server - النسخة الرسمية
خادم ربط الحسابات الإعلانية باستخدام المكتبة الرسمية فقط
"""

import os
import sys
import logging
import json
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

# تحميل متغيرات البيئة
from dotenv import load_dotenv
from pathlib import Path

# تحديد مسار ملف البيئة - فقط للتطوير المحلي
env_path = Path(__file__).parent / '.env.development'
if env_path.exists() and os.getenv('RAILWAY_ENVIRONMENT') is None:
    # تحميل ملف .env فقط في التطوير المحلي، وليس في Railway
    try:
        load_dotenv(env_path, encoding='utf-8-sig')
        print("✅ تم تحميل متغيرات البيئة من ملف .env.development")
    except UnicodeDecodeError:
        try:
            load_dotenv(env_path, encoding='utf-8')
            print("✅ تم تحميل متغيرات البيئة من ملف .env.development (UTF-8)")
        except Exception as e:
            print(f"⚠️ فشل تحميل ملف .env: {e}")
    except Exception as e:
        print(f"⚠️ فشل تحميل ملف .env: {e}")
elif os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('PORT'):
    print("🚀 تشغيل في Railway - استخدام متغيرات البيئة من النظام")
    print(f"   - RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT', 'غير محدد')}")
    print(f"   - PORT: {os.getenv('PORT', 'غير محدد')}")
else:
    print("💻 تشغيل محلي - لم يتم العثور على ملف .env.development")
    print("💡 تأكد من إضافة متغيرات البيئة إلى النظام أو إنشاء ملف .env.development")

# إضافة مسار المكتبة الرسمية
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'google_ads_lib'))

# استيراد المكتبة الرسمية
from google_ads_lib.client import GoogleAdsClient
from google_ads_lib.config import load_from_env
from google_ads_lib.errors import GoogleAdsException
from google_ads_lib import oauth2, config

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# إنشاء تطبيق Flask
app = Flask(__name__)

# إعداد CORS للتطوير والإنتاج
NODE_ENV = os.getenv("NODE_ENV", "development")
IS_PRODUCTION = NODE_ENV == "production"

if IS_PRODUCTION:
    # إعدادات الإنتاج - furriyadh.com
    CORS(app, resources={
        r"/api/*": {
            "origins": ["https://furriyadh.com", "https://www.furriyadh.com"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
else:
    # إعدادات التطوير - localhost
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

# بدون تشفير - تخزين مباشر

# إعداد Supabase (بدون مشاكل التشفير)
try:
    from supabase import create_client, Client
    SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://mkzwqbgcfdzcqmkgzwgy.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rendxYmdjZmR6Y3Fta2d6d2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkzMzk4NSwiZXhwIjoyMDY1NTA5OTg1fQ.Xp687KZnQNvZ99ygaielsRLEIT3ubciunYcNoRZhfd4')
    
    # إنشاء عميل Supabase مع معالجة أفضل للأخطاء
    logger.info(f"🔍 تشخيص Supabase:")
    logger.info(f"   - URL: {SUPABASE_URL}")
    logger.info(f"   - Key length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")
    
    try:
        logger.info("🔄 إنشاء عميل Supabase...")
        
        # إنشاء عميل Supabase بسيط بدون اختبار فوري
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        SUPABASE_AVAILABLE = True
        logger.info("✅ Supabase تم إنشاؤه بنجاح")
        
    except Exception as supabase_error:
        logger.error(f"❌ فشل إنشاء Supabase: {supabase_error}")
        supabase = None
        SUPABASE_AVAILABLE = False
except ImportError as e:
    logger.warning(f"⚠️ Supabase غير متاح: {e}")
    supabase = None
    SUPABASE_AVAILABLE = False
except Exception as e:
    logger.error(f"❌ فشل تهيئة Supabase: {e}")
    logger.error("   ❌ تأكد من صحة الإعدادات في .env.development أو متغيرات البيئة في Railway")
    supabase = None
    SUPABASE_AVAILABLE = False

def init_supabase():
    """التحقق من الاتصال بـ Supabase"""
    if not SUPABASE_AVAILABLE or supabase is None:
        logger.warning("⚠️ Supabase غير متاح - تخطي اختبار الاتصال")
        return False
        
    try:
        # اختبار الاتصال
        result = supabase.table('client_requests').select('id').limit(1).execute()
        logger.info("✅ تم الاتصال بـ Supabase بنجاح")
        return True
    except Exception as e:
        logger.error(f"❌ فشل الاتصال بـ Supabase: {e}")
        logger.error("🔧 تأكد من إنشاء الجداول في Supabase Dashboard")
        return False

# التحقق من الاتصال بـ Supabase عند بدء التشغيل
if SUPABASE_AVAILABLE:
    init_supabase()
else:
    logger.warning("⚠️ تخطي اختبار Supabase - غير متاح")

# تحميل الإعدادات من متغيرات البيئة
MCC_CUSTOMER_ID = os.getenv('MCC_LOGIN_CUSTOMER_ID')
DEVELOPER_TOKEN = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')

# رسائل تشخيصية لمتغيرات البيئة
print(f"🔍 تشخيص متغيرات البيئة:")
print(f"   - MCC_CUSTOMER_ID: {'✅ موجود' if MCC_CUSTOMER_ID else '❌ مفقود'}")
print(f"   - DEVELOPER_TOKEN: {'✅ موجود' if DEVELOPER_TOKEN else '❌ مفقود'}")
print(f"   - CLIENT_ID: {'✅ موجود' if CLIENT_ID else '❌ مفقود'}")
print(f"   - CLIENT_SECRET: {'✅ موجود' if CLIENT_SECRET else '❌ مفقود'}")
print(f"   - REFRESH_TOKEN: {'✅ موجود' if REFRESH_TOKEN else '❌ مفقود'}")
print(f"   - NODE_ENV: {NODE_ENV}")
print(f"   - RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT', 'غير محدد')}")
print(f"   - PORT: {os.getenv('PORT', 'غير محدد')}")

# تشخيص إضافي لمعرفة جميع متغيرات البيئة المتاحة
print(f"🔍 جميع متغيرات البيئة المتاحة:")
all_env_vars = [key for key in os.environ.keys() if any(keyword in key.upper() for keyword in ['GOOGLE', 'MCC', 'SUPABASE', 'NODE', 'RAILWAY', 'PORT'])]
for var in sorted(all_env_vars):
    value = os.getenv(var)
    if value and len(value) > 20:
        print(f"   - {var}: {value[:20]}...")
    else:
        print(f"   - {var}: {value}")

logger.info("🚀 بدء تشغيل Google Ads MCC Server - المكتبة الرسمية 100%")
logger.info(f"🏢 MCC Customer ID: {MCC_CUSTOMER_ID}")
logger.info(f"🔑 Developer Token: {'✅ موجود' if DEVELOPER_TOKEN else '❌ مفقود'}")
logger.info(f"🔐 OAuth Credentials: {'✅ مكتملة' if all([CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]) else '❌ ناقصة'}")

# التحقق من الإعدادات المطلوبة
if not all([MCC_CUSTOMER_ID, DEVELOPER_TOKEN, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]):
    logger.error("❌ إعدادات Google Ads API غير مكتملة")
    logger.error("❌ يرجى تعيين متغيرات البيئة المطلوبة")
    logger.info("📋 المتغيرات المطلوبة:")
    logger.info("   - MCC_LOGIN_CUSTOMER_ID")
    logger.info("   - GOOGLE_ADS_DEVELOPER_TOKEN") 
    logger.info("   - GOOGLE_ADS_CLIENT_ID")
    logger.info("   - GOOGLE_ADS_CLIENT_SECRET")
    logger.info("   - GOOGLE_ADS_REFRESH_TOKEN")
else:
    logger.info("✅ جميع الإعدادات المطلوبة متوفرة")

def get_google_ads_client():
    """إنشاء عميل Google Ads باستخدام المكتبة الرسمية"""
    try:
        # إعداد التكوين
        config_data = {
            'developer_token': DEVELOPER_TOKEN,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': REFRESH_TOKEN,
            'login_customer_id': MCC_CUSTOMER_ID,
            'use_proto_plus': True
        }
        
        # إنشاء العميل باستخدام المكتبة الرسمية
        client = GoogleAdsClient.load_from_dict(config_data, version='v21')
        logger.info("✅ تم إنشاء Google Ads Client بنجاح")
        return client
        
    except Exception as e:
        logger.error(f"❌ فشل في إنشاء Google Ads Client: {e}")
        raise e

def handle_google_ads_exception(exception):
    """معالجة استثناءات Google Ads وتحويلها إلى JSON"""
    try:
        if hasattr(exception, 'failure') and exception.failure:
            errors = []
            for error in exception.failure.errors:
                error_dict = {
                    'error_code': error.error_code._name if hasattr(error.error_code, '_name') else str(error.error_code),
                    'message': error.message,
                    'trigger': error.trigger.string_value if hasattr(error, 'trigger') and hasattr(error.trigger, 'string_value') else None,
                    'location': []
                }
                
                if hasattr(error, 'location') and error.location:
                    for field_path_element in error.location.field_path_elements:
                        error_dict['location'].append({
                            'field_name': field_path_element.field_name,
                            'index': field_path_element.index if hasattr(field_path_element, 'index') else None
                        })
                
                errors.append(error_dict)
            
            return {
                'success': False,
                'error': 'GoogleAdsFailure',
                'message': 'خطأ في Google Ads API',
                'errors': errors,
                'request_id': exception.request_id if hasattr(exception, 'request_id') else None
            }
        else:
            return {
                'success': False,
                'error': 'GoogleAdsException',
                'message': str(exception)
            }
    except Exception as e:
        logger.error(f"❌ خطأ في معالجة GoogleAdsException: {e}")
        return {
            'success': False,
            'error': 'Exception handling failed',
            'message': str(exception)
        }

@app.route('/api/user/accounts', methods=['GET'])
def get_user_accounts():
    """الحصول على حسابات المستخدم المرتبطة بـ MCC باستخدام المكتبة الرسمية"""
    try:
        logger.info("📋 طلب الحصول على حسابات المستخدم")
        
        client = get_google_ads_client()
        logger.info("🔍 استخدام المكتبة الرسمية لجلب الحسابات")
        
        # الحصول على خدمة Google Ads
        ga_service = client.get_service("GoogleAdsService")
        
        # استعلام للحصول على الحسابات المرتبطة بـ MCC
        # استخدام الحقول الصحيحة لـ customer_client_link في v21
        query = f"""
            SELECT
                customer_client_link.client_customer,
                customer_client_link.status,
                customer_client_link.resource_name
            FROM customer_client_link
        """
        
        # تنفيذ الاستعلام
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = MCC_CUSTOMER_ID
        search_request.query = query
        
        response = ga_service.search(request=search_request)
        
        accounts = []
        for row in response:
            link = row.customer_client_link
            # استخراج معرف العميل من المسار
            client_customer_id = link.client_customer.split('/')[-1] if link.client_customer else None
            
            if client_customer_id:
                # الآن نحصل على تفاصيل العميل
                try:
                    customer_query = f"""
                        SELECT
                            customer.id,
                            customer.descriptive_name,
                            customer.currency_code,
                            customer.time_zone,
                            customer.status
                        FROM customer
                        WHERE customer.id = {client_customer_id}
                    """
                    
                    customer_request = client.get_type("SearchGoogleAdsRequest")
                    customer_request.customer_id = client_customer_id
                    customer_request.query = customer_query
                    
                    customer_response = ga_service.search(request=customer_request)
                    
                    for customer_row in customer_response:
                        customer = customer_row.customer
                        accounts.append({
                            'customerId': str(customer.id),
                            'name': customer.descriptive_name or f'Account {customer.id}',
                            'currency': customer.currency_code or 'USD',
                            'timeZone': customer.time_zone or 'UTC',
                            'status': customer.status.name if customer.status else 'UNKNOWN',
                            'linkStatus': link.status.name if link.status else 'UNKNOWN',
                            'isManager': False
                        })
                        break  # نحتاج فقط للسجل الأول
                        
                except Exception as customer_error:
                    logger.warning(f"⚠️ لا يمكن جلب تفاصيل العميل {client_customer_id}: {customer_error}")
                    # إضافة الحساب بمعلومات أساسية فقط
                    accounts.append({
                        'customerId': client_customer_id,
                        'name': f'Account {client_customer_id}',
                        'currency': 'USD',
                        'timeZone': 'UTC',
                        'status': 'UNKNOWN',
                        'linkStatus': link.status.name if link.status else 'UNKNOWN',
                        'isManager': False
                    })
        
        logger.info(f"✅ تم جلب {len(accounts)} حساب من المكتبة الرسمية")
        return jsonify({
            'success': True,
            'accounts': accounts,
            'total': len(accounts),
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'source': 'google_ads_official_library_v21',
            'message': f'تم جلب {len(accounts)} حساب مرتبط بـ MCC' if accounts else 'لا توجد حسابات مرتبطة بـ MCC حتى الآن'
        })
                
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في get_user_accounts: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ عام في الخادم'
        }), 500

@app.route('/api/link-customer', methods=['POST'])
def link_customer():
    """ربط حساب عميل بـ MCC باستخدام المكتبة الرسمية"""
    try:
        data = request.get_json()
        customer_id = data.get('customerId')
        
        if not customer_id:
            return jsonify({
                'success': False,
                'error': 'Missing customer ID',
                'message': 'معرف العميل مطلوب'
            }), 400
        
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()
        
        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        logger.info(f"🔗 محاولة ربط الحساب {clean_customer_id} بـ MCC {MCC_CUSTOMER_ID}")
        
        # استخدام المكتبة الرسمية لربط الحساب
        client = get_google_ads_client()
        
        # إنشاء خدمة ربط العملاء
        customer_client_link_service = client.get_service("CustomerClientLinkService")
        
        # إنشاء عملية ربط العميل
        customer_client_link_operation = client.get_type("CustomerClientLinkOperation")
        
        # إنشاء رابط العميل
        customer_client_link = client.get_type("CustomerClientLink")
        customer_client_link.client_customer = f"customers/{clean_customer_id}"
        customer_client_link.status = client.enums.ManagerLinkStatusEnum.PENDING
        
        # إعداد العملية
        customer_client_link_operation.create = customer_client_link
        
        # تنفيذ العملية
        mutate_request = client.get_type("MutateCustomerClientLinkRequest")
        mutate_request.customer_id = MCC_CUSTOMER_ID
        mutate_request.operation = customer_client_link_operation
        
        response = customer_client_link_service.mutate_customer_client_link(request=mutate_request)
        
        logger.info(f"✅ تم إرسال طلب ربط الحساب {customer_id} بنجاح")
        logger.info(f"📋 Response: {response}")
        
        # استخراج resource_name من الاستجابة
        resource_name = None
        if hasattr(response, 'result') and response.result:
            resource_name = response.result.resource_name
        elif hasattr(response, 'results') and response.results:
            resource_name = response.results[0].resource_name
        
        return jsonify({
            'success': True,
            'message': 'تم إرسال دعوة الربط بنجاح - العميل سيتلقى دعوة للموافقة في حسابه الإعلاني',
                'customer_id': customer_id,
            'mcc_customer_id': MCC_CUSTOMER_ID,
                'status': 'PENDING_APPROVAL',
            'resource_name': resource_name,
            'source': 'google_ads_official_library_v21',
            'next_steps': 'العميل يحتاج للموافقة على طلب الربط في Google Ads'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في ربط الحساب: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ خطأ عام في link_customer: {e}")
        
        # معالجة خاصة لأخطاء OAuth
        if 'Connection' in error_msg and 'accounts.google.com' in error_msg:
            return jsonify({
                'success': False,
                'error': 'OAuth connection failed - tokens may be expired',
                'details': 'Please re-authenticate with Google Ads',
                'error_type': 'OAUTH_ERROR',
                'message': 'خطأ في المصادقة - يرجى إعادة تسجيل الدخول'
            }), 401
        elif 'ConnectionResetError' in error_msg or 'Connection aborted' in error_msg:
            return jsonify({
                'success': False,
                'error': 'Network connection error',
                'details': 'Please try again in a few moments',
                'error_type': 'NETWORK_ERROR',
                'message': 'خطأ في الاتصال - يرجى المحاولة مرة أخرى'
            }), 503
        else:
            return jsonify({
                'success': False,
                'error': str(e),
                'error_type': 'GENERAL_ERROR',
                'message': 'خطأ في ربط الحساب'
            }), 500


@app.route('/api/mcc/invitations', methods=['GET'])
def get_mcc_invitations():
    """الحصول على جميع الدعوات المرسلة من MCC باستخدام المكتبة الرسمية"""
    try:
        logger.info("📨 طلب الحصول على دعوات MCC")
        
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        # استعلام للحصول على جميع روابط العملاء
        query = """
            SELECT
                customer_client_link.resource_name,
                customer_client_link.client_customer,
                customer_client_link.manager_customer,
                customer_client_link.status,
                customer_client_link.hidden
            FROM customer_client_link
        """
        
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = MCC_CUSTOMER_ID
        search_request.query = query
        
        response = ga_service.search(request=search_request)
        
        invitations = []
        for row in response:
            link = row.customer_client_link
            
            # استخراج معرف العميل من المسار
            client_customer_id = link.client_customer.split('/')[-1] if link.client_customer else None
            
            invitation = {
                'resource_name': link.resource_name,
                'client_customer_id': client_customer_id,
                'manager_customer_id': MCC_CUSTOMER_ID,
                'status': link.status.name if link.status else 'UNKNOWN',
                'hidden': link.hidden if hasattr(link, 'hidden') else False
            }
            
            invitations.append(invitation)
        
        # تصنيف الدعوات حسب الحالة
        pending_invitations = [inv for inv in invitations if inv['status'] == 'PENDING']
        active_links = [inv for inv in invitations if inv['status'] == 'ACTIVE']
        rejected_invitations = [inv for inv in invitations if inv['status'] == 'REJECTED']
        cancelled_invitations = [inv for inv in invitations if inv['status'] == 'CANCELLED']
        
        logger.info(f"✅ تم جلب {len(invitations)} دعوة/رابط من MCC")
        return jsonify({
            'success': True,
            'invitations': {
                'all': invitations,
                'pending': pending_invitations,
                'active': active_links,
                'rejected': rejected_invitations,
                'cancelled': cancelled_invitations
            },
            'summary': {
                'total': len(invitations),
                'pending_count': len(pending_invitations),
                'active_count': len(active_links),
                'rejected_count': len(rejected_invitations),
                'cancelled_count': len(cancelled_invitations)
            },
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'source': 'google_ads_official_library_v21'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في جلب الدعوات: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في get_mcc_invitations: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في جلب دعوات MCC'
        }), 500

@app.route('/api/user/accounts/<customer_id>/stats', methods=['GET'])
def get_account_stats(customer_id):
    """الحصول على إحصائيات حساب معين باستخدام المكتبة الرسمية"""
    try:
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()
        
        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        logger.info(f"📊 طلب إحصائيات الحساب {customer_id}")
        
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        # استعلام للحصول على إحصائيات الحساب
        query = """
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros
            FROM campaign
            WHERE campaign.status != 'REMOVED'
        """
        
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = clean_customer_id
        search_request.query = query
        
        response = ga_service.search(request=search_request)
        
        campaigns = []
        total_impressions = 0
        total_clicks = 0
        total_cost_micros = 0
        
        for row in response:
            campaign = row.campaign
            metrics = row.metrics
            
            campaign_data = {
                'id': str(campaign.id),
                'name': campaign.name,
                'status': campaign.status.name if campaign.status else 'UNKNOWN',
                'impressions': metrics.impressions,
                'clicks': metrics.clicks,
                'cost_micros': metrics.cost_micros
            }
            
            campaigns.append(campaign_data)
            total_impressions += metrics.impressions
            total_clicks += metrics.clicks
            total_cost_micros += metrics.cost_micros
        
        logger.info(f"✅ تم جلب إحصائيات {len(campaigns)} حملة للحساب {customer_id}")
        return jsonify({
            'success': True,
            'customer_id': customer_id,
            'campaigns': campaigns,
            'summary': {
                'total_campaigns': len(campaigns),
                'total_impressions': total_impressions,
                'total_clicks': total_clicks,
                'total_cost_micros': total_cost_micros,
                'total_cost_currency': total_cost_micros / 1000000  # تحويل من micros
            },
            'source': 'google_ads_official_library_v21'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في جلب الإحصائيات: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في get_account_stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في جلب إحصائيات الحساب'
        }), 500

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """فحص صحة الخادم"""
    try:
        # فحص أساسي للخادم
        basic_health = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'server': 'running',
            'port': int(os.getenv('PORT', 5000)),
            'environment': os.getenv('RAILWAY_ENVIRONMENT', 'local')
        }
        
        # محاولة اختبار Google Ads API (اختياري)
        try:
            client = get_google_ads_client()
            basic_health.update({
                'services': {
                    'google_ads_official_library': True,
                    'google_ads_client': True
                },
                'config': {
                    'mcc_customer_id': MCC_CUSTOMER_ID,
                    'developer_token_configured': bool(DEVELOPER_TOKEN),
                    'oauth_configured': bool(CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN),
                    'api_version': 'v21'
                },
                'library_info': {
                    'source': 'google_ads_lib (Official)',
                    'version': '28.0.0',
                    'proto_plus': True
                }
            })
        except Exception as api_error:
            # إذا فشل Google Ads API، نعيد الخادم كـ healthy لكن مع تحذير
            basic_health.update({
                'services': {
                    'google_ads_official_library': False,
                    'google_ads_client': False
                },
                'warning': f'Google Ads API غير متاح: {str(api_error)}',
                'config': {
                    'mcc_customer_id': MCC_CUSTOMER_ID,
                    'developer_token_configured': bool(DEVELOPER_TOKEN),
                    'oauth_configured': bool(CLIENT_ID and CLIENT_SECRET and REFRESH_TOKEN),
                    'api_version': 'v21'
                }
            })
        
        return jsonify(basic_health)
        
    except Exception as e:
        logger.error(f"❌ فشل فحص الصحة: {e}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }), 503

def save_client_request_to_db(customer_id, request_type, account_name=None, oauth_data=None, status=None, link_details=None):
    """حفظ طلب العميل في Supabase بدون تشفير"""
    try:
        if not SUPABASE_AVAILABLE:
            logger.warning("⚠️ Supabase غير متاح - تخطي حفظ البيانات")
            return False
            
        # التحقق من وجود طلب سابق
        existing = supabase.table('client_requests').select('id').eq('customer_id', customer_id).eq('request_type', request_type).order('created_at', desc=True).limit(1).execute()
        
        # إعداد البيانات
        data = {
            'updated_at': datetime.now().isoformat(),
            'account_name': account_name,
            'oauth_data': oauth_data,
            'expires_at': (datetime.now() + timedelta(days=3650)).isoformat()  # تخزين لمدة 10 سنوات
        }
        
        # إضافة الحالة إذا تم توفيرها
        if status:
            data['status'] = status
            
        # إضافة تفاصيل الربط إذا تم توفيرها
        if link_details:
            data['link_details'] = link_details
        
        if existing.data:
            # تحديث الطلب الموجود
            result = supabase.table('client_requests').update(data).eq('id', existing.data[0]['id']).execute()
            logger.info(f"🔄 تم تحديث طلب العميل {customer_id} في Supabase - الحالة: {status or 'لم تتغير'}")
        else:
            # إنشاء طلب جديد
            data.update({
                'customer_id': customer_id,
                'request_type': request_type,
                'status': status or 'PENDING'  # استخدام الحالة المرسلة أو PENDING كافتراضي
            })
            result = supabase.table('client_requests').insert(data).execute()
            logger.info(f"💾 تم حفظ طلب جديد للعميل {customer_id} في Supabase - الحالة: {status or 'PENDING'}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ خطأ في حفظ طلب العميل في Supabase: {e}")
        return False

def get_client_requests_from_db(customer_id=None):
    """جلب طلبات العميل من Supabase بدون تشفير"""
    try:
        if not SUPABASE_AVAILABLE:
            logger.warning("⚠️ Supabase غير متاح - إرجاع قائمة فارغة")
            return []
            
        if customer_id:
            result = supabase.table('client_requests').select('*').eq('customer_id', customer_id).order('created_at', desc=True).execute()
        else:
            result = supabase.table('client_requests').select('*').order('created_at', desc=True).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"❌ خطأ في جلب طلبات العميل من Supabase: {e}")
        return []

@app.route('/api/save-client-request', methods=['POST'])
def save_client_request():
    """حفظ طلب العميل في الكوكيز والداتابيز"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        request_type = data.get('request_type', 'link_request')
        account_name = data.get('account_name')
        oauth_data = data.get('oauth_data')
        status = data.get('status')  # إضافة دعم للحالة
        link_details = data.get('link_details')  # إضافة دعم لتفاصيل الربط
        
        if not customer_id:
            return jsonify({
                'success': False,
                'error': 'Missing customer_id'
            }), 400
        
        # حفظ في قاعدة البيانات مع الحالة الجديدة
        db_saved = save_client_request_to_db(customer_id, request_type, account_name, oauth_data, status, link_details)
        
        # إعداد الاستجابة
        response_data = {
            'success': True,
            'customer_id': customer_id,
            'request_type': request_type,
            'account_name': account_name,
            'timestamp': datetime.now().isoformat(),
            'saved_to_db': db_saved,
            'message': f'تم حفظ طلب العميل {customer_id}'
        }
        
        response = make_response(jsonify(response_data))
        
        # إعداد الكوكيز
        cookie_data = {
            'customer_id': customer_id,
            'request_type': request_type,
            'account_name': account_name,
            'timestamp': datetime.now().isoformat()
        }
        
        response.set_cookie(
            f'client_request_{customer_id}',
            value=json.dumps(cookie_data),
            max_age=30*24*60*60,  # 30 يوم
            httponly=False,  # السماح للـ JavaScript بالوصول
            secure=False,
            samesite='Lax'
        )
        
        # حفظ جلسة العميل
        response.set_cookie(
            'client_session',
            value=json.dumps({
                'customer_ids': [customer_id],
                'last_request': datetime.now().isoformat()
            }),
            max_age=30*24*60*60,
            httponly=False,
            secure=False,
            samesite='Lax'
        )
        
        logger.info(f"💾 تم حفظ طلب العميل {customer_id}: {request_type}")
        return response
        
    except Exception as e:
        logger.error(f"❌ خطأ في حفظ طلب العميل: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/get-client-requests/<customer_id>', methods=['GET'])
def get_client_requests(customer_id):
    """جلب طلبات العميل المحفوظة"""
    try:
        # إذا كان customer_id هو "all"، جلب جميع الطلبات
        if customer_id.lower() == 'all':
            requests = get_client_requests_from_db()  # بدون معرف العميل
            return jsonify(requests)  # إرجاع القائمة مباشرة
        else:
            requests = get_client_requests_from_db(customer_id)
            return jsonify({
                'success': True,
                'customer_id': customer_id,
                'requests': requests,
                'count': len(requests)
            })
        
    except Exception as e:
        logger.error(f"❌ خطأ في جلب طلبات العميل: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/check-link-status/<customer_id>', methods=['GET'])
def check_link_status(customer_id):
    """فحص حالة ربط حساب عميل مع MCC باستخدام المكتبة الرسمية"""
    try:
        logger.info(f"🔍 فحص حالة ربط الحساب {customer_id} مع MCC {MCC_CUSTOMER_ID}")
        
        # إنشاء Google Ads client
        client = get_google_ads_client()
        
        # الحصول على خدمة GoogleAds
        googleads_service = client.get_service("GoogleAdsService")
        
        # استعلام GAQL لفحص حالة الربط - البحث في كلا الاتجاهين
        query = f"""
            SELECT 
                customer_client_link.client_customer,
                customer_client_link.status,
                customer_client_link.resource_name
            FROM customer_client_link 
            WHERE customer_client_link.client_customer = 'customers/{customer_id}'
        """
        
        logger.info(f"📋 تنفيذ استعلام GAQL: {query}")
        
        # تنفيذ الاستعلام من MCC
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = MCC_CUSTOMER_ID
        search_request.query = query
        
        response = googleads_service.search(request=search_request)
        
        # معالجة النتائج
        link_status = "NOT_LINKED"
        link_details = None
        
        for row in response:
            if hasattr(row, 'customer_client_link'):
                link = row.customer_client_link
                link_status = link.status.name if hasattr(link.status, 'name') else str(link.status)
                link_details = {
                    'client_customer': link.client_customer,
                    'manager_customer': MCC_CUSTOMER_ID,
                    'status': link_status,
                    'resource_name': link.resource_name
                }
                logger.info(f"✅ تم العثور على ربط client: {link_details}")
                break
        
        # إذا لم نجد في customer_client_link، ابحث في customer_manager_link
        if link_status == "NOT_LINKED":
            manager_query = f"""
                SELECT 
                    customer_manager_link.manager_customer,
                    customer_manager_link.status,
                    customer_manager_link.resource_name
                FROM customer_manager_link 
                WHERE customer_manager_link.manager_customer = 'customers/{MCC_CUSTOMER_ID}'
            """
            
            logger.info(f"📋 البحث في customer_manager_link: {manager_query}")
            
            manager_search_request = client.get_type("SearchGoogleAdsRequest")
            manager_search_request.customer_id = customer_id  # البحث من حساب العميل
            manager_search_request.query = manager_query
            
            try:
                manager_response = googleads_service.search(request=manager_search_request)
                
                for row in manager_response:
                    if hasattr(row, 'customer_manager_link'):
                        link = row.customer_manager_link
                        link_status = link.status.name if hasattr(link.status, 'name') else str(link.status)
                        link_details = {
                            'client_customer': f'customers/{customer_id}',
                            'manager_customer': link.manager_customer,
                            'status': link_status,
                            'resource_name': link.resource_name
                        }
                        logger.info(f"✅ تم العثور على ربط manager: {link_details}")
                        break
            except Exception as e:
                logger.warning(f"⚠️ فشل البحث في customer_manager_link: {e}")
        
        if link_status == "NOT_LINKED":
            logger.info(f"📋 لا يوجد ربط للحساب {customer_id}")
        
        return jsonify({
            'success': True,
            'customer_id': customer_id,
            'link_status': link_status,
            'link_details': link_details,
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'message': f'تم فحص حالة الربط للحساب {customer_id}'
        })
        
    except GoogleAdsException as ex:
        logger.error(f"❌ خطأ Google Ads API: {ex}")
        error_details = handle_google_ads_exception(ex)
        return jsonify({
            'success': False,
            'error': 'Google Ads API Error',
            'details': error_details,
            'customer_id': customer_id,
            'message': f'فشل في فحص حالة الربط للحساب {customer_id}'
        }), 500
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في فحص حالة الربط: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'customer_id': customer_id,
            'message': f'فشل في فحص حالة الربط للحساب {customer_id}'
        }), 500

@app.route('/', methods=['GET'])
@app.route('/api', methods=['GET'])
def root():
    """المسار الجذر"""
    return jsonify({
        'message': 'Google Ads MCC Server - Official Library 100%',
        'version': '2.0.0',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'library': 'google_ads_lib (Official Google Ads Python Library)',
        'api_version': 'v21',
        'endpoints': {
            'health': '/health',
            'user_accounts': '/api/user/accounts',
            'link_customer': '/api/link-customer',
            'check_link_status': '/api/check-link-status/{customer_id}',
            'account_stats': '/api/user/accounts/{customer_id}/stats',
            'mcc_invitations': '/api/mcc/invitations'
        },
        'features': [
            'Real Google Ads API integration',
            'MCC account linking',
            'Invitation tracking',
            'Account statistics',
            'Official library only'
        ]
    })

if __name__ == '__main__':
    logger.info("🚀 بدء تشغيل Google Ads MCC Server - المكتبة الرسمية 100%")
    logger.info(f"🏢 MCC Customer ID: {MCC_CUSTOMER_ID}")
    logger.info("📚 النظام يستخدم المكتبة الرسمية Google Ads Python فقط")
    logger.info("✅ جميع العمليات تتم عبر Google Ads API الرسمي v21")
    
    # اختبار الاتصال بـ Google Ads API
    try:
        test_client = get_google_ads_client()
        logger.info("✅ تم التحقق من الاتصال بـ Google Ads API بنجاح")
    except Exception as e:
        logger.error(f"❌ فشل في الاتصال بـ Google Ads API: {e}")
        logger.error("❌ تأكد من صحة الإعدادات في .env.development")
        exit(1)

@app.route('/api/sync-all-statuses', methods=['POST'])
def sync_all_statuses():
    """مزامنة جميع حالات الربط من Google Ads API إلى قاعدة البيانات"""
    try:
        logger.info("🔄 بدء مزامنة جميع حالات الربط...")
        
        # جلب جميع الطلبات من قاعدة البيانات
        all_requests = get_client_requests_from_db()
        
        if not all_requests:
            return jsonify({
                'success': True,
                'message': 'لا توجد طلبات للمزامنة',
                'synced_count': 0
            })
        
        synced_count = 0
        sync_results = []
        
        # تحميل إعدادات Google Ads
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        for request in all_requests:
            customer_id = request.get('customer_id')
            if not customer_id:
                continue
                
            try:
                logger.info(f"🔍 مزامنة الحساب: {customer_id}")
                
                # استعلام للبحث عن الربط (بدون manager_customer لأنه غير مدعوم في v21)
                query = f"""
                    SELECT 
                        customer_client_link.client_customer,
                        customer_client_link.status,
                        customer_client_link.resource_name
                    FROM customer_client_link 
                    WHERE customer_client_link.client_customer = 'customers/{customer_id}'
                """
                
                search_request = ga_service.search(
                    customer_id=MCC_CUSTOMER_ID,
                    query=query
                )
                
                link_found = False
                for row in search_request:
                    link_found = True
                    api_status = row.customer_client_link.status.name
                    
                    # تحويل حالات Google Ads API إلى حالات قاعدة البيانات
                    if api_status == 'ACTIVE':
                        db_status = 'ACTIVE'
                    elif api_status == 'PENDING':
                        db_status = 'PENDING'
                    elif api_status == 'REFUSED':
                        db_status = 'REJECTED'
                    elif api_status == 'CANCELLED':
                        db_status = 'CANCELLED'
                    elif api_status == 'SUSPENDED':
                        db_status = 'SUSPENDED'
                    else:
                        db_status = 'NOT_LINKED'
                    
                    link_details = {
                        "client_customer": row.customer_client_link.client_customer,
                        "manager_customer": MCC_CUSTOMER_ID,  # استخدام MCC_CUSTOMER_ID المعروف
                        "status": api_status,
                        "resource_name": row.customer_client_link.resource_name
                    }
                    
                    # تحديث قاعدة البيانات إذا تغيرت الحالة
                    current_status = request.get('status')
                    if current_status != db_status:
                        logger.info(f"🔄 تحديث حالة {customer_id}: {current_status} → {db_status}")
                        
                        save_client_request_to_db(
                            customer_id=customer_id,
                            request_type='link_request',
                            account_name=request.get('account_name', f'Google Ads Account {customer_id}'),
                            status=db_status,
                            link_details=link_details
                        )
                        
                        sync_results.append({
                            'customer_id': customer_id,
                            'old_status': current_status,
                            'new_status': db_status,
                            'api_status': api_status
                        })
                        synced_count += 1
                    
                    break
                
                if not link_found:
                    # لم يتم العثور على ربط - تحديث إلى NOT_LINKED
                    current_status = request.get('status')
                    if current_status not in ['NOT_LINKED', 'CANCELLED']:
                        logger.info(f"🔄 تحديث حالة {customer_id}: {current_status} → NOT_LINKED")
                        
                        save_client_request_to_db(
                            customer_id=customer_id,
                            request_type='link_request',
                            account_name=request.get('account_name', f'Google Ads Account {customer_id}'),
                            status='NOT_LINKED',
                            link_details=None
                        )
                        
                        sync_results.append({
                            'customer_id': customer_id,
                            'old_status': current_status,
                            'new_status': 'NOT_LINKED',
                            'api_status': 'NOT_FOUND'
                        })
                        synced_count += 1
                        
            except Exception as e:
                logger.error(f"❌ خطأ في مزامنة {customer_id}: {e}")
                continue
        
        logger.info(f"✅ تمت مزامنة {synced_count} حساب")
        
        return jsonify({
            'success': True,
            'message': f'تمت مزامنة {synced_count} حساب',
            'synced_count': synced_count,
            'sync_results': sync_results
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة الحالات: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # استخدام المنفذ من متغير البيئة PORT (Railway) أو 5000 للتطوير المحلي
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=not IS_PRODUCTION,  # تعطيل debug في الإنتاج
        threaded=True
    )

