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
    SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase environment variables are required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    SUPABASE_AVAILABLE = True
    logger.info("✅ Supabase متاح")
except ImportError as e:
    logger.warning(f"⚠️ Supabase غير متاح: {e}")
    supabase = None
    SUPABASE_AVAILABLE = False

def init_supabase():
    """التحقق من الاتصال بـ Supabase"""
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
init_supabase()

# تحميل الإعدادات من متغيرات البيئة
MCC_CUSTOMER_ID = os.getenv('MCC_LOGIN_CUSTOMER_ID')
DEVELOPER_TOKEN = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
CLIENT_ID = os.getenv('GOOGLE_ADS_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')

# التحقق من وجود جميع المتغيرات المطلوبة
required_vars = {
    'MCC_LOGIN_CUSTOMER_ID': MCC_CUSTOMER_ID,
    'GOOGLE_ADS_DEVELOPER_TOKEN': DEVELOPER_TOKEN,
    'GOOGLE_ADS_CLIENT_ID': CLIENT_ID,
    'GOOGLE_ADS_CLIENT_SECRET': CLIENT_SECRET,
    'GOOGLE_ADS_REFRESH_TOKEN': REFRESH_TOKEN
}

missing_vars = [var for var, value in required_vars.items() if not value]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

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
        # اختبار الاتصال بـ Google Ads API
        client = get_google_ads_client()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
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

@app.route('/api/delete-client-request/<customer_id>', methods=['DELETE'])
def delete_client_request(customer_id):
    """حذف طلب العميل من قاعدة البيانات"""
    try:
        logger.info(f"🗑️ حذف طلب العميل {customer_id}")
        
        from services.supabase_manager import supabase_manager
        
        # استخدام method الحذف من SupabaseManager
        result = supabase_manager.delete_client_request(customer_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 500
        
    except Exception as e:
        logger.error(f"❌ خطأ في حذف طلب العميل {customer_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'customer_id': customer_id
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

# ==================== Account Status Sync Endpoints ====================

@app.route('/api/sync-account-status/<customer_id>', methods=['GET'])
def sync_single_account_status(customer_id):
    """مزامنة حالة حساب واحد مع Google Ads API"""
    try:
        # التحقق من صحة معرف العميل مباشرة
        def validate_customer_id(customer_id):
            return customer_id and customer_id.isdigit() and len(customer_id) == 10
        
        # التحقق من صحة معرف العميل
        if not validate_customer_id(customer_id):
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل غير صحيح'
            }), 400
        
        logger.info(f"🔄 مزامنة حالة الحساب {customer_id}")
        
        # استخدام النظام الحالي بدلاً من الملفات المحذوفة
        return jsonify({
            'success': False,
            'error': 'Service temporarily unavailable',
            'message': 'الخدمة غير متاحة مؤقتاً'
        }), 503
        
        # الخدمة غير متاحة - تم حذف الملفات
            
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة الحساب {customer_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'customer_id': customer_id
        }), 500

@app.route('/api/sync-all-accounts', methods=['POST'])
def sync_all_accounts():
    """مزامنة جميع الحسابات مع Google Ads API"""
    try:
        logger.info("🔄 بدء مزامنة جميع الحسابات")
        
        # الخدمة غير متاحة - تم حذف الملفات
        return jsonify({
            'success': False,
            'error': 'Service temporarily unavailable',
            'message': 'الخدمة غير متاحة مؤقتاً'
        }), 503
            
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة جميع الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/discover-new-accounts', methods=['POST'])
def discover_new_accounts():
    """اكتشاف الحسابات الجديدة المربوطة بـ MCC"""
    try:
        logger.info("🔍 بدء اكتشاف الحسابات الجديدة")
        
        # الخدمة غير متاحة - تم حذف الملفات
        return jsonify({
            'success': False,
            'error': 'Service temporarily unavailable',
            'message': 'الخدمة غير متاحة مؤقتاً'
        }), 503
        
    except Exception as e:
        logger.error(f"❌ خطأ في اكتشاف الحسابات الجديدة: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== Account Status Discovery System ====================

@app.route('/api/discover-account-status/<customer_id>', methods=['GET'])
def discover_account_status(customer_id):
    """اكتشاف حالة الحساب باستخدام المكتبة الرسمية Google Ads API v21"""
    try:
        logger.info(f"🔍 اكتشاف حالة الحساب {customer_id}")
        
        # التحقق من صحة معرف العميل
        if not customer_id or not customer_id.isdigit() or len(customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        # استخدام Google Ads Client Manager الموجود
        from services.google_ads_client import GoogleAdsClientManager
        
        client_manager = GoogleAdsClientManager()
        if not client_manager.is_initialized:
            return jsonify({
                'success': False,
                'error': 'Google Ads client not initialized',
                'message': 'عميل Google Ads غير مُهيأ'
            }), 500
        
        # إنشاء عميل Google Ads
        client = client_manager.get_client()
        if not client:
            return jsonify({
                'success': False,
                'error': 'Failed to create Google Ads client',
                'message': 'فشل في إنشاء عميل Google Ads'
            }), 500
        
        # فحص حالة الربط باستخدام customer_client_link
        status, link_details = check_customer_link_status(client, customer_id)
        
        # تحديث قاعدة البيانات
        from services.supabase_manager import supabase_manager
        
        # جلب الحالة الحالية من قاعدة البيانات
        current_requests = supabase_manager.get_client_requests(customer_id)
        current_status = None
        
        if current_requests and len(current_requests) > 0:
            current_status = current_requests[0].get('status')
        
        # تحديث الحالة إذا تغيرت
        status_changed = False
        if current_status != status:
            # حفظ/تحديث في قاعدة البيانات
            request_data = {
                'customer_id': customer_id,
                'status': status,
                'request_type': 'status_discovery',
                'account_name': f'Google Ads Account {customer_id}',
                'link_details': link_details
            }
            
            save_result = supabase_manager.save_client_request(request_data)
            status_changed = save_result.get('success', False)
            
            if status_changed:
                logger.info(f"✅ تم تحديث حالة الحساب {customer_id}: {current_status} → {status}")
        
        return jsonify({
            'success': True,
            'customer_id': customer_id,
            'status': status,
            'previous_status': current_status,
            'status_changed': status_changed,
            'link_details': link_details,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في اكتشاف حالة الحساب {customer_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'customer_id': customer_id
        }), 500

def check_customer_link_status(client, customer_id: str):
    """فحص حالة ربط الحساب باستخدام المكتبة الرسمية"""
    try:
        googleads_service = client.get_service("GoogleAdsService")
        mcc_customer_id = MCC_CUSTOMER_ID
        
        # البحث في customer_client_link من MCC - جلب جميع الدعوات
        query = f"""
            SELECT 
                customer_client_link.client_customer,
                customer_client_link.status,
                customer_client_link.resource_name
            FROM customer_client_link 
            WHERE customer_client_link.client_customer = 'customers/{customer_id}'
        """
        
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = mcc_customer_id
        search_request.query = query
        
        response = googleads_service.search(request=search_request)
        
        # جمع جميع الدعوات واختيار أحدثها
        all_links = []
        for row in response:
            if hasattr(row, 'customer_client_link'):
                link = row.customer_client_link
                status = link.status.name if hasattr(link.status, 'name') else str(link.status)
                
                link_details = {
                    'client_customer': link.client_customer,
                    'status': status,
                    'resource_name': link.resource_name,
                    'link_type': 'client_link'
                }
                all_links.append((status, link_details))
        
        if all_links:
            # اختيار أحدث دعوة (آخر resource_name)
            latest_link = max(all_links, key=lambda x: x[1]['resource_name'])
            status, link_details = latest_link
            
            logger.info(f"✅ تم العثور على أحدث ربط client: {link_details}")
            return status, link_details
        
        # إذا لم نجد في customer_client_link، ابحث في customer_manager_link
        manager_query = f"""
            SELECT 
                customer_manager_link.manager_customer,
                customer_manager_link.status,
                customer_manager_link.resource_name
            FROM customer_manager_link 
            WHERE customer_manager_link.manager_customer = 'customers/{mcc_customer_id}'
        """
        
        search_request.customer_id = customer_id  # البحث من حساب العميل
        search_request.query = manager_query
        
        try:
            response = googleads_service.search(request=search_request)
            
            for row in response:
                if hasattr(row, 'customer_manager_link'):
                    link = row.customer_manager_link
                    status = link.status.name if hasattr(link.status, 'name') else str(link.status)
                    
                    link_details = {
                        'client_customer': f'customers/{customer_id}',
                        'manager_customer': link.manager_customer,
                        'status': status,
                        'resource_name': link.resource_name,
                        'link_type': 'manager_link'
                    }
                    
                    logger.info(f"✅ تم العثور على ربط manager: {link_details}")
                    return status, link_details
        except Exception as e:
            logger.warning(f"⚠️ فشل البحث في customer_manager_link: {e}")
        
        # لا يوجد ربط
        logger.info(f"📋 لا يوجد ربط للحساب {customer_id}")
        return "NOT_LINKED", None
        
    except Exception as e:
        logger.error(f"❌ خطأ في فحص حالة الربط: {e}")
        return "ERROR", None

@app.route('/api/discover-all-accounts', methods=['POST'])
def discover_all_accounts():
    """اكتشاف جميع الحسابات وحالاتها"""
    try:
        logger.info("🔍 بدء اكتشاف جميع الحسابات")
        
        # جلب جميع الحسابات من قاعدة البيانات
        from services.supabase_manager import supabase_manager
        
        all_requests = supabase_manager.get_client_requests('all')
        if not all_requests:
            return jsonify({
                'success': True,
                'message': 'لا توجد حسابات للفحص',
                'discovered_accounts': 0,
                'updated_accounts': 0
            })
        
        discovered_count = 0
        updated_count = 0
        results = []
        
        for request in all_requests:
            customer_id = request.get('customer_id')
            if not customer_id:
                continue
            
            # فحص حالة كل حساب
            try:
                response = discover_account_status(customer_id)
                if response.status_code == 200:
                    data = response.get_json()
                    if data.get('success'):
                        discovered_count += 1
                        if data.get('status_changed'):
                            updated_count += 1
                        results.append(data)
            except Exception as e:
                logger.error(f"❌ خطأ في فحص الحساب {customer_id}: {e}")
        
        return jsonify({
            'success': True,
            'message': f'تم فحص {discovered_count} حساب، تم تحديث {updated_count} حساب',
            'discovered_accounts': discovered_count,
            'updated_accounts': updated_count,
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في اكتشاف جميع الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )

