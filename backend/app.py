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
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, make_response, Response, stream_with_context
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# Eventlet removed due to Python 3.13 incompatibility on Windows
# using 'threading' mode instead

# تحميل متغيرات البيئة
from dotenv import load_dotenv
from pathlib import Path

# تحديد مسار ملف البيئة - فقط للتطوير المحلي
env_path = Path(__file__).parent.parent / '.env.development'
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
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.oauth2.credentials import Credentials  # ✅ Import Credentials
from google.api_core import protobuf_helpers  # ✅ Import for field_mask in ghost link cleanup
import supabase
from supabase import create_client, Client

# إعداد التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# إنشاء تطبيق Flask
app = Flask(__name__)

# إعداد Socket.IO مع CORS ديناميكي (dev vs production)
SOCKET_CORS_ORIGINS = "*" if os.getenv("RAILWAY_ENVIRONMENT") is None else ["https://furriyadh.com", "https://www.furriyadh.com"]
socketio = SocketIO(app, cors_allowed_origins=SOCKET_CORS_ORIGINS, async_mode='threading')

@socketio.on('connect')
def handle_connect():
    logger.info("✅ Client Connected to Socket.IO")
    emit('status', {'message': 'Connected to Google Ads Service'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("❌ Client Disconnected from Socket.IO")

@socketio.on('ping')
def handle_ping(data):
    logger.info(f"Ping received: {data}")
    emit('pong', {'message': 'Pong from Flask Server'})

# ⚡ Zero-Latency Neuro-Link: دالة البث المركزية
def broadcast_status_update(customer_id: str, status: str, additional_data: dict = None):
    """
    بث تحديث الحالة لجميع العملاء المتصلين عبر Socket.IO
    هذه الدالة هي جوهر نظام المزامنة اللحظية
    """
    from datetime import datetime
    
    # تنظيف customer_id
    clean_id = str(customer_id).replace('-', '').strip()
    
    data = {
        'customer_id': clean_id,
        'status': status,
        'timestamp': datetime.now().isoformat()
    }
    if additional_data:
        data.update(additional_data)
    
    try:
        socketio.emit('status_update', data)
        logger.info(f"📡 [BROADCAST] {clean_id} → {status}")
    except Exception as e:
        logger.error(f"❌ Broadcast Error: {e}")

# ⚡ Test Endpoint: محاكاة إرسال حدث Socket للاختبار
@app.route('/api/test/simulate-status-update', methods=['POST'])
def simulate_status_update():
    """
    محاكاة إرسال حدث status_update للاختبار
    يستخدم للتحقق من عمل نظام Neuro-Link
    """
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        status = data.get('status')
        
        if not customer_id or not status:
            return jsonify({
                'success': False,
                'error': 'customer_id and status are required'
            }), 400
        
        # التحقق من الحالة
        valid_statuses = ['PENDING', 'ACTIVE', 'LINKED', 'REJECTED', 'CANCELLED', 'NOT_LINKED']
        if status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Invalid status. Valid: {valid_statuses}'
            }), 400
        
        logger.info(f"🧪 [TEST] Simulating status update: {customer_id} → {status}")
        
        # بث الحدث عبر Socket.IO
        broadcast_status_update(customer_id, status, {'source': 'test_simulation'})
        
        return jsonify({
            'success': True,
            'message': f'Simulated status update: {customer_id} → {status}',
            'broadcast_sent': True
        })
        
    except Exception as e:
        logger.error(f"❌ Test simulation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# إعداد CORS للتطوير والإنتاج
NODE_ENV = os.getenv("NODE_ENV", "development")

IS_PRODUCTION = NODE_ENV == "production"

# تفعيل CORS لجميع المسارات
CORS(app, 
     origins="*" if not IS_PRODUCTION else ["https://furriyadh.com", "https://www.furriyadh.com"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=False if not IS_PRODUCTION else True
)

# إضافة CORS headers لجميع الردود
@app.after_request
def add_cors_headers(response):
    if not IS_PRODUCTION:
        response.headers['Access-Control-Allow-Origin'] = '*'
    else:
        origin = request.headers.get('Origin', '')
        if origin in ['https://furriyadh.com', 'https://www.furriyadh.com']:
            response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    return response

# Global OPTIONS handler for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

# بدون تشفير - تخزين مباشر

# تسجيل Blueprints
try:
    from routes.ai_campaign_creator import ai_campaign_creator_bp
    app.register_blueprint(ai_campaign_creator_bp, url_prefix='/api/ai-campaign')
    logger.info("✅ تم تسجيل AI Campaign Creator Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل AI Campaign Creator Blueprint: {e}")

try:
    from routes.ai_campaign_flow import ai_campaign_flow_bp
    app.register_blueprint(ai_campaign_flow_bp, url_prefix='/api/ai-campaign-flow')
    logger.info("✅ تم تسجيل AI Campaign Flow Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل AI Campaign Flow Blueprint: {e}")

try:
    from routes.youtube_routes import youtube_bp
    app.register_blueprint(youtube_bp, url_prefix='/api/youtube')
    logger.info("✅ تم تسجيل YouTube Integration Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل YouTube Integration Blueprint: {e}")

try:
    from routes.accounts import accounts_bp
    app.register_blueprint(accounts_bp, url_prefix='/api/user/accounts')
    logger.info("✅ تم تسجيل User Accounts Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل User Accounts Blueprint: {e}")

# 🏢 Furriyadh Commission System Blueprint
try:
    from routes.furriyadh_routes import furriyadh_bp
    app.register_blueprint(furriyadh_bp)  # url_prefix is already set in the blueprint
    logger.info("✅ تم تسجيل Furriyadh Commission System Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل Furriyadh Commission System Blueprint: {e}")

# 💳 Stripe Payment Blueprint
try:
    from routes.stripe_routes import stripe_bp
    app.register_blueprint(stripe_bp)
    logger.info("✅ تم تسجيل Stripe Payment Blueprint")
except Exception as e:
    logger.error(f"❌ فشل تسجيل Stripe Blueprint: {e}")

try:
    # إعداد Supabase مع إصدار محدث (باستخدام متغيرات البيئة فقط بدون قيم افتراضية حساسة)
    SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    logger.info("🔄 إنشاء عميل Supabase مع إصدار محدث...")
    logger.info(f"🔍 SUPABASE_URL موجود: {bool(SUPABASE_URL)}")
    logger.info(f"🔍 SUPABASE_KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

    # تأكيد توافر متغيرات البيئة قبل إنشاء العميل
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("متغيرات البيئة الخاصة بـ Supabase غير مضبوطة (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)")

    # إنشاء العميل بدون معاملات إضافية
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    SUPABASE_AVAILABLE = True
    logger.info("✅ Supabase تم إنشاؤه بنجاح")

except Exception as e:
    logger.error(f"❌ فشل إنشاء Supabase: {e}")
    logger.error(f"🔍 نوع الخطأ: {type(e).__name__}")
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

# ===== 🔐 Token Refresh Service - التجديد التلقائي للـ Tokens =====
TOKEN_REFRESH_SERVICE = None
try:
    from services.token_refresh_service import TokenRefreshService, get_token_refresh_service
    
    if SUPABASE_AVAILABLE and supabase:
        TOKEN_REFRESH_SERVICE = TokenRefreshService(supabase_client=supabase)
        
        # تهيئة Token من متغيرات البيئة إذا لم يكن موجوداً في الداتابيز
        TOKEN_REFRESH_SERVICE.initialize_from_env('mcc_main')
        
        logger.info("✅ تم تهيئة Token Refresh Service بنجاح")
        logger.info("   - التجديد التلقائي: مفعّل")
        logger.info("   - التخزين: Supabase Database")
    else:
        logger.warning("⚠️ Token Refresh Service: Supabase غير متاح - سيتم استخدام متغيرات البيئة فقط")
except Exception as e:
    logger.warning(f"⚠️ فشل تحميل Token Refresh Service: {e}")
    logger.info("   - سيتم استخدام الطريقة التقليدية (متغيرات البيئة)")
# ===== نهاية Token Refresh Service =====

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

# 🔒 Security: دالة للتحقق من المصادقة
def require_auth():
    """
    التحقق من وجود Authorization header صالح.
    يُرجع tuple: (success, token_or_error_response)
    
    الاستخدام:
        is_auth, result = require_auth()
        if not is_auth:
            return result  # يرجع error response
        access_token = result  # يستخدم الـ token
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        logger.warning("⚠️ طلب بدون Authorization header - مرفوض")
        return False, (jsonify({
            'success': False,
            'error': 'UNAUTHORIZED',
            'message': 'Authorization header مطلوب - يجب تسجيل الدخول'
        }), 401)
    
    token = auth_header.split(' ')[1]
    if not token or len(token) < 10:
        logger.warning("⚠️ طلب بـ token فارغ أو غير صالح - مرفوض")
        return False, (jsonify({
            'success': False,
            'error': 'UNAUTHORIZED', 
            'message': 'Token غير صالح'
        }), 401)
    
    return True, token

def get_google_ads_client(access_token=None):
    """
    إنشاء عميل Google Ads باستخدام المكتبة الرسمية.
    إذا تم تمرير access_token، يتم استخدامه مباشرة للمصادقة (نيابة عن المستخدم).
    طالما لم يتم تمريره، يتم استخدام refresh_token من البيئة (MCC).
    """
    try:
        if access_token:
            logger.info("🔑 استخدام Access Token الممرر من الطلب للمصادقة")
            # 1. إنشاء Credential Object باستخدام الـ Token الممرر
            credentials = Credentials(token=access_token)

            # 2. تحميل الإعدادات الأساسية (بدون refresh token)
            # ملاحظة: عند استخدام credentials مباشرة، نحتاج فقط لـ developer_token و login_customer_id
            try:
                client = GoogleAdsClient(
                    credentials=credentials, 
                    developer_token=DEVELOPER_TOKEN, 
                    login_customer_id=MCC_CUSTOMER_ID,
                    version='v21'
                )
                logger.info("✅ تم إنشاء Google Ads Client باستخدام Access Token")
                return client
            except Exception as client_err:
                logger.warning(f"⚠️ فشل إنشاء Client باستخدام Credentials مباشرة: {client_err}")
                # Fallback to load_from_dict if needed, but usually constructing with credentials is standard
                raise client_err
        else:
            # استخدام Refresh Token من البيئة (الطريقة القديمة)
            logger.info("ℹ️ استخدام Refresh Token من البيئة للمصادقة")
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
            logger.info("✅ تم إنشاء Google Ads Client بنجاح (Environment Config)")
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


def convert_status_to_db_safe(api_status: str) -> str:
    """
    تحويل حالات Google Ads API إلى حالات آمنة ومتوافقة مع جدول client_requests في Supabase.

    نستخدم نفس المنطق الموجود في google_ads_official_service._convert_status_to_db_safe
    لتوحيد القيم المخزنة في قاعدة البيانات.
    """
    # في Google Ads API:
    # - ACTIVE = الرابط نشط ومقبول ✅
    # - INACTIVE = الرابط غير نشط (تم رفضه أو إلغاؤه سابقاً) = NOT_LINKED
    # - PENDING = طلب ربط في الانتظار (طلب جديد)
    # - DISABLED = الحساب معطّل/غير مفعّل
    # 
    # ⚠️ INACTIVE يعني طلب قديم غير نشط - يجب اعتباره NOT_LINKED
    status_mapping = {
        'PENDING': 'PENDING',
        'ACTIVE': 'ACTIVE',
        'INACTIVE': 'NOT_LINKED',  # ✅ INACTIVE = طلب قديم غير نشط (تم رفضه/إلغاؤه)
        'DISABLED': 'SUSPENDED',  # ✅ DISABLED = الحساب معطّل/غير مفعّل (CUSTOMER_NOT_ENABLED)
        'REFUSED': 'REJECTED',
        'CANCELED': 'REJECTED',
        'CANCELLED': 'REJECTED',
        'REJECTED': 'REJECTED', # ✅ Added REJECTED explicit mapping
        'UNKNOWN': 'NOT_LINKED',
        'UNSPECIFIED': 'NOT_LINKED',
        # في حالة الأخطاء العامة نعتبرها NOT_LINKED لتفادي تعارض مع الـ constraint
        'ERROR': 'NOT_LINKED',
    }
    return status_mapping.get(str(api_status or '').upper(), 'NOT_LINKED')

@app.route('/api/user/accounts', methods=['GET'])
def get_user_accounts():
    """الحصول على حسابات المستخدم المرتبطة بـ MCC باستخدام المكتبة الرسمية"""
    try:
        # 🔒 Security: التحقق من المصادقة - مطلوب Authorization header
        is_auth, result = require_auth()
        if not is_auth:
            return result
        access_token = result
        
        logger.info("📋 طلب الحصول على حسابات المستخدم (مصادق)")
        
        # 🔒 استخدام token المستخدم بدلاً من MCC token
        client = get_google_ads_client(access_token)
        logger.info("🔍 استخدام المكتبة الرسمية لجلب الحسابات (User Context)")
        
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
    """ربط حساب عميل بـ MCC باستخدام المكتبة الرسمية - مع دعم إعادة تفعيل الروابط"""
    
    # خريطة حالات الرابط - الأرقام إلى النصوص
    STATUS_MAP = {
        0: "UNSPECIFIED",
        1: "UNKNOWN", 
        2: "PENDING",
        3: "ACTIVE",
        4: "INACTIVE",
        5: "REFUSED",
        6: "CANCELLED"
    }
    
    try:
        data = request.get_json()
        # دعم كلا الصيغتين: customer_id و customerId
        customer_id = data.get('customer_id') or data.get('customerId')
        account_name = data.get('account_name') or data.get('accountName') or 'Unknown Account'
        
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
        
        # ⚡ Optimistic Update: بث حالة "جاري الربط" فوراً للـ UI
        broadcast_status_update(clean_customer_id, 'LINKING', {'optimistic': True})
        
        # استخراج Access Token من الهيدر (إذا وجد)
        auth_header = request.headers.get('Authorization')
        access_token = None
        if auth_header and auth_header.startswith('Bearer '):
            access_token = auth_header.split(' ')[1]
            logger.info("🔑 تم اكتشاف Authorization Header")

        # استخدام المكتبة الرسمية لربط الحساب (تمرير التوكن إذا وجد)
        client = get_google_ads_client(access_token)
        
        # الخطوة 1: التحقق من وجود رابط سابق
        ga_service = client.get_service("GoogleAdsService")
        query = f"""
            SELECT 
                customer_client_link.resource_name,
                customer_client_link.client_customer,
                customer_client_link.status,
                customer_client_link.manager_link_id
            FROM customer_client_link
            WHERE customer_client_link.client_customer = 'customers/{clean_customer_id}'
        """
        
        existing_link = None
        try:
            response = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
            for row in response:
                link = row.customer_client_link
                # معالجة الحالة - قد تكون رقم أو نص
                raw_status = link.status
                if hasattr(raw_status, 'name'):
                    existing_status = raw_status.name
                elif isinstance(raw_status, int):
                    existing_status = STATUS_MAP.get(raw_status, f"UNKNOWN_{raw_status}")
                else:
                    existing_status = str(raw_status)
                    # إذا كانت الحالة رقم في شكل نص
                    if existing_status.isdigit():
                        existing_status = STATUS_MAP.get(int(existing_status), f"UNKNOWN_{existing_status}")
                
                logger.info(f"📍 وجدنا رابط موجود: {link.resource_name} - الحالة: {existing_status}")
                existing_link = {
                    "resource_name": link.resource_name,
                    "status": existing_status,
                    "manager_link_id": link.manager_link_id
                }
                break
        except Exception as search_error:
            logger.warning(f"⚠️ خطأ في البحث عن رابط موجود: {search_error}")
        
        customer_client_link_service = client.get_service("CustomerClientLinkService")
        
        # الخطوة 2: معالجة الرابط حسب الحالة
        if existing_link:
            existing_status = existing_link.get("status", "UNKNOWN")
            resource_name = existing_link.get("resource_name")
            
            logger.info(f"📋 رابط موجود بحالة: {existing_status}")
            
            # إذا كان الرابط PENDING بالفعل
            if existing_status == "PENDING":
                logger.info(f"⏳ طلب ربط معلق موجود بالفعل للحساب {clean_customer_id}")
                
                # ✅ بث التحديث الفوري للـ Frontend
                broadcast_status_update(clean_customer_id, 'PENDING')
                
                return jsonify({
                    'success': True,
                    'message': 'طلب الربط موجود بالفعل وينتظر موافقة العميل',
                    'customer_id': customer_id,
                    'mcc_customer_id': MCC_CUSTOMER_ID,
                    'status': 'PENDING',
                    'resource_name': resource_name,
                    'source': 'google_ads_official_library_v21',
                    'next_steps': 'العميل يحتاج للموافقة على طلب الربط الموجود في Google Ads'
                })
            
            # إذا كان الرابط ACTIVE بالفعل - ✅ القاعدة الذهبية: نثق في حالة MCC
            # MCC يقول ACTIVE = الحساب متصل فعلياً في Google Ads
            if existing_status == "ACTIVE":
                logger.info(f"🔍 [التحقق الميداني] MCC يظهر ACTIVE للحساب {clean_customer_id} - نتحقق من الصلاحيات فعلياً...")
                
                # 🔍 التحقق الميداني: محاولة الوصول للحساب للتأكد من صحة الرابط
                link_is_valid = False
                try:
                    # نحاول جلب اسم الحساب كاختبار بسيط للصلاحيات
                    verification_query = """
                        SELECT customer.descriptive_name
                        FROM customer
                        LIMIT 1
                    """
                    ga_service = client.get_service("GoogleAdsService")
                    verification_response = ga_service.search(
                        customer_id=clean_customer_id,
                        query=verification_query
                    )
                    # إذا نجح الاستعلام، الرابط فعال
                    for row in verification_response:
                        link_is_valid = True
                        logger.info(f"✅ [التحقق ناجح] الرابط فعال - اسم الحساب: {row.customer.descriptive_name}")
                        break
                    
                    if not link_is_valid:
                        # الاستعلام نجح لكن بدون نتائج - نعتبره صالحاً
                        link_is_valid = True
                        logger.info(f"✅ [التحقق ناجح] الرابط فعال - الاستعلام نجح")
                        
                except Exception as verification_error:
                    error_str = str(verification_error).upper()
                    if 'USER_PERMISSION_DENIED' in error_str or 'PERMISSION_DENIED' in error_str or 'NOT_ADS_USER' in error_str:
                        logger.warning(f"👻 [رابط شبح] الحساب {clean_customer_id} يظهر ACTIVE لكن لا توجد صلاحيات فعلية!")
                        link_is_valid = False
                    else:
                        # خطأ آخر - قد يكون مشكلة مؤقتة، نفترض الرابط صالح
                        logger.warning(f"⚠️ خطأ في التحقق: {verification_error} - نفترض الرابط صالح")
                        link_is_valid = True
                
                if link_is_valid:
                    # ✅ الرابط فعال حقاً - نثق في الحالة
                    logger.info(f"✅ [القاعدة الذهبية] الرابط مؤكد فعال للحساب {clean_customer_id}")
                    
                    # بث التحديث الفوري للـ Frontend
                    try:
                        socketio.emit('status_update', {
                            'customer_id': clean_customer_id,
                            'status': 'ACTIVE',
                            'timestamp': datetime.now().isoformat()
                        })
                        logger.info(f"📡 تم بث حالة ACTIVE للحساب {clean_customer_id}")
                    except Exception as emit_error:
                        logger.warning(f"⚠️ فشل بث الحالة: {emit_error}")
                    
                    # تحديث Supabase
                    try:
                        latest_record = supabase.table('client_requests') \
                            .select('id') \
                            .eq('customer_id', clean_customer_id) \
                            .order('created_at', desc=True) \
                            .limit(1) \
                            .execute()
                        
                        if latest_record.data:
                            record_id = latest_record.data[0]['id']
                            supabase.table('client_requests') \
                                .update({
                                    'status': 'ACTIVE',
                                    'updated_at': datetime.now().isoformat()
                                }) \
                                .eq('id', record_id) \
                                .execute()
                            logger.info(f"💾 [SUCCESS] تم تحديث السجل {record_id} إلى ACTIVE")
                    except Exception as db_error:
                        logger.error(f"❌ فشل تحديث قاعدة البيانات: {db_error}")
                    
                    return jsonify({
                        'success': True,
                        'message': 'الحساب متصل بالفعل',
                        'customer_id': customer_id,
                        'mcc_customer_id': MCC_CUSTOMER_ID,
                        'status': 'ACTIVE',
                        'resource_name': resource_name,
                        'source': 'google_ads_official_library_v21',
                        'next_steps': 'لا حاجة لأي إجراء - الحساب متصل بـ MCC',
                        'golden_rule': True,
                        'verified': True
                    })
                    
                else:
                    # 👻 الرابط شبح - نحتاج إصلاح تلقائي
                    logger.info(f"🔧 [الإصلاح التلقائي] بدء تنظيف الرابط الشبح للحساب {clean_customer_id}...")
                    
                    try:
                        # محاولة تغيير الرابط القديم إلى INACTIVE
                        update_operation = client.get_type("CustomerClientLinkOperation")
                        update_link = update_operation.update
                        update_link.resource_name = resource_name
                        update_link.status = client.enums.ManagerLinkStatusEnum.INACTIVE
                        
                        # تحديد الحقول المراد تعديلها
                        client.copy_from(
                            update_operation.update_mask,
                            protobuf_helpers.field_mask(None, update_link._pb)
                        )
                        
                        customer_client_link_service.mutate_customer_client_link(
                            customer_id=MCC_CUSTOMER_ID,
                            operation=update_operation
                        )
                        logger.info(f"✅ تم تغيير الرابط الشبح إلى INACTIVE")
                    except Exception as inactive_error:
                        logger.warning(f"⚠️ فشل تغيير الرابط: {inactive_error} - نستمر بإنشاء رابط جديد")
                    
                    # إنشاء رابط جديد كلياً
                    try:
                        create_operation = client.get_type("CustomerClientLinkOperation")
                        create_operation.create.client_customer = f"customers/{clean_customer_id}"
                        create_operation.create.status = client.enums.ManagerLinkStatusEnum.PENDING
                        
                        new_link_response = customer_client_link_service.mutate_customer_client_link(
                            customer_id=MCC_CUSTOMER_ID,
                            operation=create_operation
                        )
                        new_resource_name = new_link_response.result.resource_name
                        logger.info(f"✅ [الإصلاح التلقائي] تم إنشاء رابط جديد: {new_resource_name}")
                        
                        # بث PENDING للـ Frontend
                        socketio.emit('status_update', {
                            'customer_id': clean_customer_id,
                            'status': 'PENDING',
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        # تحديث Supabase إلى PENDING
                        try:
                            latest_record = supabase.table('client_requests') \
                                .select('id') \
                                .eq('customer_id', clean_customer_id) \
                                .order('created_at', desc=True) \
                                .limit(1) \
                                .execute()
                            
                            if latest_record.data:
                                record_id = latest_record.data[0]['id']
                                supabase.table('client_requests') \
                                    .update({
                                        'status': 'PENDING',
                                        'updated_at': datetime.now().isoformat()
                                    }) \
                                    .eq('id', record_id) \
                                    .execute()
                        except:
                            pass
                        
                        return jsonify({
                            'success': True,
                            'message': 'تم اكتشاف رابط شبح وإصلاحه - تم إرسال دعوة جديدة',
                            'customer_id': customer_id,
                            'mcc_customer_id': MCC_CUSTOMER_ID,
                            'status': 'PENDING',
                            'resource_name': new_resource_name,
                            'ghost_link_fixed': True,
                            'next_steps': 'يرجى قبول دعوة الربط الجديدة في Google Ads'
                        })
                        
                    except Exception as create_error:
                        logger.error(f"❌ فشل إنشاء رابط جديد: {create_error}")
                        return jsonify({
                            'success': False,
                            'error': f'فشل إصلاح الرابط الشبح: {str(create_error)}',
                            'ghost_link_detected': True
                        }), 500
            
            # إذا كان الرابط INACTIVE أو CANCELLED أو REFUSED -> إنشاء رابط جديد
            # ملاحظة: Google Ads API لا يسمح بتغيير هذه الحالات إلى PENDING مباشرة
            # ولا يوجد عملية "remove" - نحاول إنشاء رابط جديد مباشرة
            if existing_status in ["INACTIVE", "CANCELLED", "REFUSED"]:
                logger.info(f"🔄 محاولة إنشاء رابط جديد للحساب بحالة {existing_status}")
                
                # إنشاء رابط جديد مباشرة
                create_operation = client.get_type("CustomerClientLinkOperation")
                create_operation.create.client_customer = f"customers/{clean_customer_id}"
                create_operation.create.status = client.enums.ManagerLinkStatusEnum.PENDING
                
                response = customer_client_link_service.mutate_customer_client_link(
                    customer_id=MCC_CUSTOMER_ID,
                    operation=create_operation
                )
                
                logger.info(f"✅ تم إنشاء رابط جديد: {response.result.resource_name}")
                
                # ✅ بث التحديث الفوري للـ Frontend
                broadcast_status_update(clean_customer_id, 'PENDING')
                
                return jsonify({
                    'success': True,
                    'message': 'تم إعادة إرسال دعوة الربط بنجاح - العميل سيتلقى دعوة جديدة للموافقة',
                    'customer_id': customer_id,
                    'mcc_customer_id': MCC_CUSTOMER_ID,
                    'status': 'PENDING',
                    'resource_name': response.result.resource_name,
                    'source': 'google_ads_official_library_v21',
                    'reactivated_from': existing_status,
                    'next_steps': 'العميل يحتاج للموافقة على طلب الربط الجديد في Google Ads'
                })
        
        # الخطوة 3: إنشاء رابط جديد (لا يوجد رابط سابق)
        logger.info(f"🔗 إنشاء رابط جديد للعميل {clean_customer_id} مع MCC {MCC_CUSTOMER_ID}")
        
        customer_client_link_operation = client.get_type("CustomerClientLinkOperation")
        customer_client_link_operation.create.client_customer = f"customers/{clean_customer_id}"
        customer_client_link_operation.create.status = client.enums.ManagerLinkStatusEnum.PENDING
        
        response = customer_client_link_service.mutate_customer_client_link(
            customer_id=MCC_CUSTOMER_ID,
            operation=customer_client_link_operation
        )
        
        logger.info(f"✅ تم إرسال طلب ربط الحساب {customer_id} بنجاح")
        logger.info(f"📋 Response: {response}")
        
        # استخراج resource_name من الاستجابة
        resource_name = None
        if hasattr(response, 'result') and response.result:
            resource_name = response.result.resource_name
        elif hasattr(response, 'results') and response.results:
            resource_name = response.results[0].resource_name
        
        # ✅ بث التحديث الفوري للـ Frontend
        broadcast_status_update(clean_customer_id, 'PENDING')
        
        return jsonify({
            'success': True,
            'message': 'تم إرسال دعوة الربط بنجاح - العميل سيتلقى دعوة للموافقة في حسابه الإعلاني',
            'customer_id': customer_id,
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'status': 'PENDING',
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


# =============================================================================
# 🔄 Sync All Accounts - High-Performance Batch Sync (محسّن للسرعة القصوى)
# =============================================================================
@app.route('/api/sync-all-accounts', methods=['POST'])
def sync_all_accounts():
    """
    🚀 مزامنة جميع الحسابات - نسخة عالية الأداء
    - استعلام BATCH واحد لجلب جميع الحالات
    - معالجة متوازية لتحديث Supabase
    - Timeout 15 ثانية للحماية من التعليق
    - تنظيف السجلات المكررة
    """
    import datetime as dt
    
    # خريطة حالات الرابط
    STATUS_MAP = {
        0: "UNSPECIFIED", 1: "UNKNOWN", 2: "PENDING",
        3: "ACTIVE", 4: "INACTIVE", 5: "REFUSED", 6: "CANCELLED"
    }
    
    def update_single_account(clean_id: str, found_status: str, original_id: str):
        """تحديث حساب واحد في Supabase (للمعالجة المتوازية) + تنظيف المكررات"""
        result = {
            'customer_id': original_id,
            'clean_id': clean_id,
            'status': found_status,
            'updated': False
        }
        
        try:
            # جلب جميع السجلات لهذا الحساب (للكشف عن المكررات)
            all_records = supabase.table('client_requests').select('id, status, updated_at').eq('customer_id', clean_id).order('updated_at', desc=True).execute()
            
            if all_records.data and len(all_records.data) > 0:
                # السجل الأحدث هو الذي سنحتفظ به
                latest_record = all_records.data[0]
                record_id = latest_record['id']
                old_status = latest_record['status']
                
                # تحديث فقط إذا تغيرت الحالة
                if old_status != found_status:
                    supabase.table('client_requests').update({
                        'status': found_status,
                        'updated_at': dt.datetime.now(dt.timezone.utc).isoformat(),
                        'link_details': {
                            'synced_at': dt.datetime.now(dt.timezone.utc).isoformat(),
                            'synced_from': 'batch_sync_parallel'
                        }
                    }).eq('id', record_id).execute()
                    
                    result['updated'] = True
                    result['old_status'] = old_status
                    
                    # بث التحديث الفوري
                    broadcast_status_update(clean_id, found_status)
                    logger.info(f"✅ تم تحديث {clean_id}: {old_status} -> {found_status}")
                
                # 🧹 تنظيف السجلات المكررة (حذف كل السجلات عدا الأحدث)
                if len(all_records.data) > 1:
                    duplicate_ids = [rec['id'] for rec in all_records.data[1:]]
                    for dup_id in duplicate_ids:
                        try:
                            supabase.table('client_requests').delete().eq('id', dup_id).execute()
                        except:
                            pass
                    result['duplicates_cleaned'] = len(duplicate_ids)
                    logger.info(f"🧹 تم تنظيف {len(duplicate_ids)} سجل مكرر للحساب {clean_id}")
                    
        except Exception as e:
            result['error'] = str(e)[:100]
            logger.warning(f"⚠️ خطأ في تحديث {clean_id}: {e}")
        
        return result
    
    try:
        start_time = dt.datetime.now()
        data = request.get_json() or {}
        customer_ids = data.get('customer_ids', [])
        
        if not customer_ids:
            return jsonify({
                'success': False,
                'error': 'No customer IDs provided'
            }), 400
        
        # تنظيف المعرفات
        clean_ids = []
        id_mapping = {}
        for cid in customer_ids:
            clean_id = str(cid).replace('-', '').strip()
            if clean_id.isdigit() and len(clean_id) == 10:
                clean_ids.append(clean_id)
                id_mapping[clean_id] = cid
        
        if not clean_ids:
            return jsonify({
                'success': False,
                'error': 'No valid customer IDs'
            }), 400
        
        logger.info(f"🚀 بدء المزامنة الفائقة لـ {len(clean_ids)} حساب...")
        
        # ✅ استعلام BATCH واحد من Google Ads API
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        query = """
            SELECT 
                customer_client_link.client_customer,
                customer_client_link.status
            FROM customer_client_link
        """
        
        status_results = {}
        api_start = dt.datetime.now()
        
        try:
            response = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
            for row in response:
                link = row.customer_client_link
                client_customer = link.client_customer
                cust_id = client_customer.split('/')[-1] if '/' in client_customer else client_customer
                
                raw_status = link.status
                if hasattr(raw_status, 'name'):
                    status = raw_status.name
                elif isinstance(raw_status, int):
                    status = STATUS_MAP.get(raw_status, f"UNKNOWN_{raw_status}")
                else:
                    status = str(raw_status)
                    if status.isdigit():
                        status = STATUS_MAP.get(int(status), f"UNKNOWN_{status}")
                
                status_results[cust_id] = status
            
            api_time = (dt.datetime.now() - api_start).total_seconds()
            logger.info(f"⚡ جلب {len(status_results)} حساب من Google Ads في {api_time:.2f}s")
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads API: {e}")
            return jsonify({
                'success': False,
                'error': str(e)[:200],
                'message': 'فشل الاتصال بـ Google Ads API'
            }), 500
        
        # ✅ معالجة متوازية لتحديث Supabase
        results = []
        updated_count = 0
        
        db_start = dt.datetime.now()
        
        # استخدام ThreadPoolExecutor للمعالجة المتوازية
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {}
            for clean_id in clean_ids:
                original_id = id_mapping.get(clean_id, clean_id)
                found_status = status_results.get(clean_id, "NOT_LINKED")
                
                future = executor.submit(update_single_account, clean_id, found_status, original_id)
                futures[future] = clean_id
            
            # جمع النتائج
            for future in as_completed(futures, timeout=15):
                try:
                    result = future.result(timeout=5)
                    results.append(result)
                    if result.get('updated'):
                        updated_count += 1
                except Exception as e:
                    clean_id = futures[future]
                    logger.warning(f"⚠️ فشل تحديث {clean_id}: {e}")
                    results.append({
                        'customer_id': id_mapping.get(clean_id, clean_id),
                        'clean_id': clean_id,
                        'status': status_results.get(clean_id, "ERROR"),
                        'error': str(e)[:100]
                    })
        
        db_time = (dt.datetime.now() - db_start).total_seconds()
        total_time = (dt.datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ اكتملت المزامنة في {total_time:.2f}s (API: {api_time:.2f}s, DB: {db_time:.2f}s)")
        logger.info(f"📊 تم تحديث {updated_count} من {len(clean_ids)} حساب")
        
        return jsonify({
            'success': True,
            'message': f'تم مزامنة {len(clean_ids)} حساب في {total_time:.2f} ثانية',
            'total': len(clean_ids),
            'updated': updated_count,
            'results': results,
            'timing': {
                'api_seconds': round(api_time, 2),
                'db_seconds': round(db_time, 2),
                'total_seconds': round(total_time, 2)
            },
            'source': 'high_performance_batch_v2'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في المزامنة'
        }), 500


# =============================================================================
# 🔌 Disconnect Customer - فصل الرابط وتنظيف الروابط الشبحية
# =============================================================================
@app.route('/api/disconnect-customer', methods=['POST'])
def disconnect_customer():
    """
    🔌 فصل حساب عميل من MCC
    يقوم بتغيير حالة الرابط إلى INACTIVE في Google Ads
    وتحديث Supabase إلى NOT_LINKED
    """
    try:
        data = request.get_json()
        customer_id = data.get('customer_id', '').replace('-', '').strip()
        
        if not customer_id:
            return jsonify({
                'success': False,
                'error': 'customer_id is required'
            }), 400
        
        logger.info(f"🔌 محاولة فصل الحساب {customer_id} من MCC {MCC_CUSTOMER_ID}")
        
        # ⚡ Optimistic Update: بث حالة "جاري الفصل" فوراً للـ UI
        broadcast_status_update(customer_id, 'DISCONNECTING', {'optimistic': True})
        
        # إنشاء Google Ads Client
        client = get_google_ads_client()
        if not client:
            return jsonify({
                'success': False,
                'error': 'فشل إنشاء عميل Google Ads'
            }), 500
        
        ga_service = client.get_service("GoogleAdsService")
        customer_client_link_service = client.get_service("CustomerClientLinkService")
        
        # البحث عن الرابط الحالي
        query = f"""
            SELECT 
                customer_client_link.resource_name,
                customer_client_link.status
            FROM customer_client_link
            WHERE customer_client_link.client_customer = 'customers/{customer_id}'
        """
        
        response = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
        
        link_found = False
        for row in response:
            link = row.customer_client_link
            resource_name = link.resource_name
            current_status = link.status.name if hasattr(link.status, 'name') else str(link.status)
            
            logger.info(f"📍 وجدنا رابط: {resource_name} - الحالة الحالية: {current_status}")
            link_found = True
            
            if current_status == "ACTIVE":
                # تغيير الحالة إلى INACTIVE
                try:
                    update_operation = client.get_type("CustomerClientLinkOperation")
                    update_link = update_operation.update
                    update_link.resource_name = resource_name
                    update_link.status = client.enums.ManagerLinkStatusEnum.INACTIVE
                    
                    # تحديد الحقول المراد تعديلها
                    client.copy_from(
                        update_operation.update_mask,
                        protobuf_helpers.field_mask(None, update_link._pb)
                    )
                    
                    customer_client_link_service.mutate_customer_client_link(
                        customer_id=MCC_CUSTOMER_ID,
                        operation=update_operation
                    )
                    logger.info(f"✅ تم تغيير الرابط إلى INACTIVE بنجاح")
                except Exception as inactive_error:
                    logger.warning(f"⚠️ فشل تغيير الرابط إلى INACTIVE: {inactive_error}")
            
            break
        
        # تحديث Supabase إلى NOT_LINKED
        try:
            latest_record = supabase.table('client_requests') \
                .select('id') \
                .eq('customer_id', customer_id) \
                .order('created_at', desc=True) \
                .limit(1) \
                .execute()
            
            if latest_record.data:
                record_id = latest_record.data[0]['id']
                supabase.table('client_requests') \
                    .update({
                        'status': 'NOT_LINKED',
                        'updated_at': datetime.now().isoformat()
                    }) \
                    .eq('id', record_id) \
                    .execute()
                logger.info(f"💾 تم تحديث Supabase إلى NOT_LINKED للحساب {customer_id}")
        except Exception as db_error:
            logger.error(f"❌ فشل تحديث Supabase: {db_error}")
        
        # بث الحالة الجديدة للـ Frontend
        try:
            socketio.emit('status_update', {
                'customer_id': customer_id,
                'status': 'NOT_LINKED',
                'timestamp': datetime.now().isoformat()
            })
            logger.info(f"📡 تم بث حالة NOT_LINKED للحساب {customer_id}")
        except Exception as emit_error:
            logger.warning(f"⚠️ فشل بث الحالة: {emit_error}")
        
        return jsonify({
            'success': True,
            'message': 'تم فصل الحساب بنجاح',
            'customer_id': customer_id,
            'status': 'NOT_LINKED',
            'link_found': link_found,
            'next_steps': 'يمكنك الآن إعادة ربط الحساب من جديد'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في فصل الحساب: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في disconnect_customer: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في فصل الحساب'
        }), 500


@app.route('/api/unlink-customer', methods=['POST'])
def unlink_customer():
    """إلغاء ربط حساب عميل من MCC باستخدام المكتبة الرسمية - من جهة MCC"""
    try:
        data = request.get_json()
        # دعم كلا الصيغتين: customer_id و customerId
        customer_id = data.get('customer_id') or data.get('customerId')
        
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
        
        logger.info(f"🔓 محاولة إلغاء ربط الحساب {clean_customer_id} من MCC {MCC_CUSTOMER_ID}")
        
        # ✅ استخدام MCC credentials - لأن الـ unlink يجب أن يتم من جهة MCC
        # لأن MCC هي من تملك صلاحية إدارة الروابط مع العملاء
        client = get_google_ads_client()  # استخدام MCC credentials
        
        # أولاً: البحث عن CustomerClientLink من جهة MCC
        ga_service = client.get_service("GoogleAdsService")
        
        query = f"""
            SELECT 
                customer_client_link.resource_name,
                customer_client_link.client_customer,
                customer_client_link.status
            FROM customer_client_link 
            WHERE customer_client_link.client_customer = 'customers/{clean_customer_id}'
        """
        
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = MCC_CUSTOMER_ID  # الاستعلام من جهة MCC
        search_request.query = query
        
        try:
            response = ga_service.search(request=search_request)
        except Exception as search_err:
            logger.error(f"❌ فشل البحث عن CustomerClientLink: {search_err}")
            return jsonify({
                'success': False,
                'error': 'Cannot find link',
                'message': 'لا يمكن العثور على رابط الحساب. قد يكون غير مرتبط بالفعل.',
                'fallback_url': f'https://ads.google.com/aw/accountaccess/clients?ocid={MCC_CUSTOMER_ID}'
            }), 404
        
        resource_name = None
        current_status = None
        for row in response:
            if hasattr(row, 'customer_client_link'):
                link = row.customer_client_link
                resource_name = link.resource_name
                current_status = link.status.name if hasattr(link.status, 'name') else str(link.status)
                logger.info(f"📍 وجدنا CustomerClientLink: {resource_name} - الحالة: {current_status}")
                break
        
        if not resource_name:
            logger.warning(f"⚠️ لم يتم العثور على رابط للحساب {clean_customer_id} في MCC")
            # تحديث الحالة في Supabase على أي حال
            try:
                supabase.table('client_requests').update({
                    'link_status': 'NOT_LINKED',
                    'updated_at': datetime.now().isoformat()
                }).eq('customer_id', clean_customer_id).execute()
                logger.info(f"✅ تم تحديث حالة الحساب {clean_customer_id} في Supabase إلى NOT_LINKED")
            except Exception as db_err:
                logger.warning(f"⚠️ فشل تحديث Supabase: {db_err}")
            
            # بث التحديث عبر Socket.IO
            broadcast_status_update(clean_customer_id, 'NOT_LINKED', {'source': 'unlink_not_found'})
            
            return jsonify({
                'success': True,
                'message': 'الحساب غير مرتبط بالـ MCC',
                'customer_id': customer_id,
                'status': 'NOT_LINKED',
                'note': 'Link was not found - account may already be unlinked'
            })
        
        # ثانياً: تحديث حالة الرابط إلى INACTIVE (إلغاء الربط) من جهة MCC
        customer_client_link_service = client.get_service("CustomerClientLinkService")
        
        # إنشاء عملية التحديث
        customer_client_link_operation = client.get_type("CustomerClientLinkOperation")
        
        # تعيين الحقول مباشرة
        customer_client_link_operation.update.resource_name = resource_name
        customer_client_link_operation.update.status = client.enums.ManagerLinkStatusEnum.INACTIVE
        
        # تعيين field mask
        customer_client_link_operation.update_mask.paths.append("status")
        
        # تنفيذ العملية من جهة MCC
        unlink_response = customer_client_link_service.mutate_customer_client_link(
            customer_id=MCC_CUSTOMER_ID,  # من جهة MCC
            operation=customer_client_link_operation
        )
        
        logger.info(f"✅ تم إلغاء ربط الحساب {customer_id} بنجاح من MCC")
        logger.info(f"📋 Response: {unlink_response}")
        
        # تحديث الحالة في Supabase
        try:
            supabase.table('client_requests').update({
                'link_status': 'NOT_LINKED',
                'updated_at': datetime.now().isoformat()
            }).eq('customer_id', clean_customer_id).execute()
            logger.info(f"✅ تم تحديث حالة الحساب {clean_customer_id} في Supabase")
        except Exception as db_err:
            logger.warning(f"⚠️ فشل تحديث Supabase: {db_err}")
        
        # بث التحديث عبر Socket.IO
        broadcast_status_update(clean_customer_id, 'NOT_LINKED', {'source': 'unlink_success'})
        
        return jsonify({
            'success': True,
            'message': 'تم إلغاء ربط الحساب بنجاح',
            'customer_id': customer_id,
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'status': 'UNLINKED',
            'source': 'google_ads_official_library_v21'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في إلغاء الربط: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في unlink_customer: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': 'GENERAL_ERROR',
            'message': 'خطأ في إلغاء ربط الحساب'
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

@app.route('/api/check-link-status/<customer_id>', methods=['GET'])
def check_link_status(customer_id):
    """
    التحقق من حالة الربط الفعلية من Google Ads API
    دورة حياة الزر:
    - ACTIVE → أحمر (Disconnect)
    - PENDING → أصفر (Pending)
    - REJECTED/CANCELLED/NOT_LINKED → أخضر (Link Google Ads)
    """
    # خريطة الحالات - تحويل الأرقام إلى نصوص
    STATUS_MAP = {
        0: "UNSPECIFIED",
        1: "UNKNOWN", 
        2: "PENDING",
        3: "ACTIVE",
        4: "INACTIVE",
        5: "REFUSED",
        6: "CANCELLED"
    }
    
    try:
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()
        
        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        logger.info(f"🔍 التحقق من حالة الربط للحساب {clean_customer_id}")
        
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        # الاستعلام عن حالة الرابط
        query = f"""
            SELECT 
                customer_client_link.resource_name,
                customer_client_link.client_customer,
                customer_client_link.status
            FROM customer_client_link
            WHERE customer_client_link.client_customer = 'customers/{clean_customer_id}'
        """
        
        try:
            response = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
            
            link_found = False
            final_status = "NOT_LINKED"  # الحالة الافتراضية
            
            for row in response:
                link = row.customer_client_link
                raw_status = link.status
                
                # تحويل الحالة
                if hasattr(raw_status, 'name'):
                    final_status = raw_status.name
                elif isinstance(raw_status, int):
                    final_status = STATUS_MAP.get(raw_status, f"UNKNOWN_{raw_status}")
                else:
                    final_status = str(raw_status)
                    if final_status.isdigit():
                        final_status = STATUS_MAP.get(int(final_status), final_status)
                
                link_found = True
                logger.info(f"📍 حالة الرابط للحساب {clean_customer_id}: {final_status}")
                break
            
            # تحويل الحالات إلى القيم المعيارية للـ Frontend
            db_safe_status = final_status
            if final_status in ["INACTIVE", "REFUSED"]:
                # INACTIVE و REFUSED تعني أن الرابط ملغي أو مرفوض
                db_safe_status = "NOT_LINKED" if final_status == "INACTIVE" else "REJECTED"
            elif final_status == "CANCELLED":
                db_safe_status = "NOT_LINKED"
            
            # ✅ بث التحديث الفوري للـ Frontend
            broadcast_status_update(clean_customer_id, db_safe_status)
            
            return jsonify({
                'success': True,
                'customer_id': customer_id,
                'status': db_safe_status,
                'raw_status': final_status,
                'link_found': link_found,
                'message': 'تم التحقق من الحالة بنجاح'
            })
            
        except Exception as search_error:
            error_str = str(search_error)
            logger.warning(f"⚠️ لا يوجد رابط للحساب {clean_customer_id}: {error_str}")
            
            # لا يوجد رابط - الحساب غير مرتبط
            broadcast_status_update(clean_customer_id, 'NOT_LINKED')
            
            return jsonify({
                'success': True,
                'customer_id': customer_id,
                'status': 'NOT_LINKED',
                'raw_status': None,
                'link_found': False,
                'message': 'الحساب غير مرتبط'
            })
            
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في check_link_status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في التحقق من حالة الربط'
        }), 500


@app.route('/api/user/accounts/<customer_id>/stats', methods=['GET'])
def get_account_stats(customer_id):
    """الحصول على إحصائيات حساب معين باستخدام المكتبة الرسمية"""
    try:
        # 🔒 Security: التحقق من المصادقة - مطلوب Authorization header
        is_auth, result = require_auth()
        if not is_auth:
            return result
        access_token = result
        
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()
        
        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        logger.info(f"📊 طلب إحصائيات الحساب {customer_id} (مصادق)")
        
        # 🔒 استخدام token المستخدم بدلاً من MCC token
        client = get_google_ads_client(access_token)
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
        error_text = str(e)
        logger.error(f"❌ خطأ عام في get_account_stats: {error_text}")

        # في بعض الحالات تكون الأخطاء عبارة عن مشاكل صلاحيات أو حساب غير مفعّل
        # من Google Ads (USER_PERMISSION_DENIED / CUSTOMER_NOT_ENABLED)
        # نرجع 200 مع success=False بدلاً من 500 حتى لا يعتبرها الـ frontend كـ crash.
        permission_markers = [
            "USER_PERMISSION_DENIED",
            "CUSTOMER_NOT_ENABLED",
            "The caller does not have permission",
            "The customer account can't be accessed because it is not yet enabled or has been deactivated.",
        ]
        if any(marker in error_text for marker in permission_markers):
            logger.warning(
                f"⚠️ حساب غير متاح أو صلاحيات غير كافية للحساب {customer_id} - سيتم إرجاع نتيجة فارغة بدلاً من 500"
            )
            return jsonify({
                'success': False,
                'customer_id': customer_id,
                'campaigns': [],
                'summary': {
                    'total_campaigns': 0,
                    'total_impressions': 0,
                    'total_clicks': 0,
                    'total_cost_micros': 0,
                    'total_cost_currency': 0,
                },
                'source': 'google_ads_official_library_v21',
                'error': 'ACCOUNT_NOT_ACCESSIBLE',
                'error_details': error_text,
                'message': 'لا يمكن الوصول إلى هذا الحساب لأنه غير مفعّل أو لا توجد صلاحيات كافية على MCC الحالي.'
            }), 200

        # أي أخطاء أخرى حقيقية تظل 500
        return jsonify({
            'success': False,
            'error': error_text,
            'message': 'خطأ في جلب إحصائيات الحساب'
        }), 500


@app.route('/api/all-campaigns', methods=['GET'])
def get_all_campaigns():
    """جلب الحملات من حساب محدد أو من جميع الحسابات المرتبطة بـ MCC"""
    try:
        # الحصول على customer_id من الـ query parameters (اختياري)
        customer_id = request.args.get('customer_id')
        
        if customer_id:
            logger.info(f"📊 طلب جلب حملات الحساب: {customer_id}")
            account_ids = [customer_id]
        else:
            logger.info("📊 طلب جلب جميع الحملات من جميع الحسابات...")
            
            client = get_google_ads_client()
            ga_service = client.get_service("GoogleAdsService")
            
            # جلب جميع الحسابات الفرعية من MCC باستخدام customer_client
            accounts_query = """
                SELECT
                    customer_client.id,
                    customer_client.descriptive_name,
                    customer_client.manager,
                    customer_client.status
                FROM customer_client
                WHERE customer_client.manager = false
            """
            
            search_request = client.get_type("SearchGoogleAdsRequest")
            search_request.customer_id = MCC_CUSTOMER_ID
            search_request.query = accounts_query
            
            response = ga_service.search(request=search_request)
            
            account_ids = []
            for row in response:
                customer = row.customer_client
                # فقط الحسابات غير المدير والنشطة
                if customer.id and str(customer.id) != MCC_CUSTOMER_ID:
                    account_ids.append(str(customer.id))
                    logger.info(f"📌 حساب: {customer.id} - {customer.descriptive_name}")
            
            logger.info(f"✅ تم العثور على {len(account_ids)} حساب مرتبط")
        
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        # جلب الحملات من كل حساب
        all_campaigns = []
        total_impressions = 0
        total_clicks = 0
        total_cost = 0
        total_conversions = 0
        
        for account_id in account_ids:
            try:
                campaigns_query = """
                    SELECT
                        campaign.id,
                        campaign.name,
                        campaign.status,
                        campaign.advertising_channel_type,
                        campaign_budget.amount_micros,
                        metrics.impressions,
                        metrics.clicks,
                        metrics.cost_micros,
                        metrics.conversions
                    FROM campaign
                    WHERE campaign.status != REMOVED
                    ORDER BY metrics.cost_micros DESC
                    LIMIT 50
                """
                
                campaign_request = client.get_type("SearchGoogleAdsRequest")
                campaign_request.customer_id = account_id
                campaign_request.query = campaigns_query
                
                campaign_response = ga_service.search(request=campaign_request)
                
                for row in campaign_response:
                    campaign = row.campaign
                    metrics = row.metrics
                    budget = row.campaign_budget
                    
                    campaign_data = {
                        'id': str(campaign.id),
                        'name': campaign.name,
                        'status': campaign.status.name if campaign.status else 'UNKNOWN',
                        'type': campaign.advertising_channel_type.name if campaign.advertising_channel_type else 'UNKNOWN',
                        'customerId': account_id,
                        'budget': budget.amount_micros / 1000000 if budget.amount_micros else 0,
                        'impressions': metrics.impressions or 0,
                        'clicks': metrics.clicks or 0,
                        'cost': metrics.cost_micros / 1000000 if metrics.cost_micros else 0,
                        'conversions': metrics.conversions or 0
                    }
                    
                    all_campaigns.append(campaign_data)
                    total_impressions += metrics.impressions or 0
                    total_clicks += metrics.clicks or 0
                    total_cost += (metrics.cost_micros or 0) / 1000000
                    total_conversions += metrics.conversions or 0
                    
                logger.info(f"✅ تم جلب حملات الحساب {account_id}")
                
            except Exception as account_error:
                logger.warning(f"⚠️ خطأ في جلب حملات الحساب {account_id}: {account_error}")
                continue
        
        logger.info(f"✅ تم جلب {len(all_campaigns)} حملة من {len(account_ids)} حساب")
        
        return jsonify({
            'success': True,
            'campaigns': all_campaigns,
            'accounts': account_ids,
            'accountsCount': len(account_ids),
            'metrics': {
                'totalCampaigns': len(all_campaigns),
                'activeCampaigns': len([c for c in all_campaigns if c['status'] == 'ENABLED']),
                'totalSpend': total_cost,
                'impressions': total_impressions,
                'clicks': total_clicks,
                'conversions': total_conversions,
                'ctr': f"{(total_clicks / total_impressions * 100):.2f}" if total_impressions > 0 else '0',
                'averageCpc': f"{(total_cost / total_clicks):.2f}" if total_clicks > 0 else '0',
                'campaignTypes': {
                    'SEARCH': len([c for c in all_campaigns if c['type'] == 'SEARCH']),
                    'DISPLAY': len([c for c in all_campaigns if c['type'] == 'DISPLAY']),
                    'VIDEO': len([c for c in all_campaigns if c['type'] == 'VIDEO']),
                    'SHOPPING': len([c for c in all_campaigns if c['type'] == 'SHOPPING']),
                    'PERFORMANCE_MAX': len([c for c in all_campaigns if c['type'] == 'PERFORMANCE_MAX'])
                }
            },
            'source': 'google_ads_mcc_all_accounts'
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'campaigns': [],
            'metrics': {}
        }), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'campaigns': [],
            'metrics': {}
        }), 500


@app.route('/api/account-status-stream', methods=['GET'])
def account_status_stream():
    """توفير SSE بسيط لحالة الحسابات (connected + heartbeat فقط حالياً)"""
    try:
        logger.info("📡 بدء اتصال SSE لـ /api/account-status-stream")

        def generate():
            # حدث اتصال أولي
            connected_event = json.dumps({
                'type': 'connected',
                'message': 'SSE connection established',
                'timestamp': datetime.now().isoformat()
            })
            yield f"data: {connected_event}\n\n"

            # نبضات دورية للحفاظ على الاتصال
            while True:
                heartbeat_event = json.dumps({
                    'type': 'heartbeat',
                    'message': 'alive',
                    'timestamp': datetime.now().isoformat()
                })
                yield f"data: {heartbeat_event}\n\n"
                import time as _time
                _time.sleep(15)

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
        )

    except Exception as e:
        logger.error(f"❌ خطأ في SSE account_status_stream: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to establish SSE stream'
        }), 500


@app.route('/api/sync-account-status/<customer_id>', methods=['POST'])
def sync_account_status(customer_id):
    """مزامنة حالة ربط الحساب مع MCC وتحديث Supabase"""
    try:
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()

        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400

        logger.info(f"🔄 مزامنة حالة الحساب {clean_customer_id} مع MCC {MCC_CUSTOMER_ID}")

        # التحقق من وجود Token مرسل من الـ Frontend (User Context)
        user_refresh_token = request.headers.get('X-Google-Refresh-Token')
        client = None
        
        if user_refresh_token:
            logger.info("🔑 تم اكتشاف X-Google-Refresh-Token في الترويسات - محاولة استخدام User Context")
            try:
                # إنشاء عميل مخصص لهذا الطلب باستخدام توكن المستخدم
                # ❗ لا نستخدم login_customer_id لأن المستخدم عادي وليس مدير MCC
                config_data = {
                    'developer_token': DEVELOPER_TOKEN,
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'refresh_token': user_refresh_token,
                    # 'login_customer_id' محذوف - المستخدم سيستعلم مباشرة على حسابه
                    'use_proto_plus': True
                }
                client = GoogleAdsClient.load_from_dict(config_data, version='v21')
                logger.info("✅ تم إنشاء Google Ads Client باستخدام توكن المستخدم (بدون MCC)")
                # ✅ علامة أننا نستخدم User Context
                using_user_context = True
            except Exception as auth_e:
                logger.warning(f"⚠️ فشل إنشاء Client بتوكن المستخدم: {auth_e} - سيتم استخدام Default Client")
                client = get_google_ads_client()
                using_user_context = False
        else:
            client = get_google_ads_client()
            using_user_context = False


        # الحالة الحالية في قاعدة البيانات (Supabase)
        db_status = 'NOT_LINKED'
        last_request = None
        try:
            requests = get_client_requests_from_db(clean_customer_id)
            if requests:
                last_request = requests[0]
                db_status = last_request.get('status') or 'NOT_LINKED'
        except Exception as e:
            logger.warning(f"⚠️ فشل في جلب حالة الحساب من Supabase للحساب {clean_customer_id}: {e}")

        # الحالة الفعلية من Google Ads API (خام من Google)
        api_status = 'NOT_LINKED'
        link_details = {
            'mcc_customer_id': MCC_CUSTOMER_ID,
            'checked_at': datetime.now().isoformat()
        }

        try:
            # ✅ استخدام الـ client المُنشأ من توكن المستخدم (إذا وجد)
            # إذا لم يكن هناك client، استخدم الـ MCC default
            if client is None:
                logger.info("⚠️ لا يوجد client - استخدام MCC default client")
                client = get_google_ads_client()
                using_user_context = False
            ga_service = client.get_service("GoogleAdsService")

            # ✅ إذا كنا نستخدم User Context، نستعلم على الحساب مباشرة
            if using_user_context:
                logger.info(f"🔍 استخدام User Context - استعلام مباشر على الحساب {clean_customer_id}")
                # استعلام مباشر على الحساب (لأن المستخدم يملك هذا الحساب)
                query = """
                    SELECT
                        customer.id,
                        customer.descriptive_name,
                        customer.status
                    FROM customer
                    LIMIT 1
                """
                search_request = client.get_type("SearchGoogleAdsRequest")
                search_request.customer_id = clean_customer_id  # ✅ استعلام على الحساب مباشرة
                search_request.query = query
                
                try:
                    # 1. أولاً: التحقق من حالة الحساب نفسه
                    response = ga_service.search(request=search_request)
                    account_is_enabled = False
                    
                    for row in response:
                        customer_status = row.customer.status.name if row.customer.status else 'UNKNOWN'
                        link_details.update({
                            'customer_status': customer_status,
                            'customer_name': row.customer.descriptive_name,
                            'method': 'direct_customer_query'
                        })
                        
                        if customer_status == 'ENABLED':
                            account_is_enabled = True
                            api_status = 'ACTIVE' # مبدئياً نحسبه نشط حتى نتحقق من الربط
                        else:
                            api_status = customer_status
                        
                        logger.info(f"✅ User Context: الحساب {clean_customer_id} حالته {customer_status}")

                    # 2. ثانياً: التحقق من الربط مع MCC الخاص بنا (إذا كان الحساب يعمل)
                    if account_is_enabled:
                        link_query = f"""
                            SELECT
                                customer_manager_link.manager_customer,
                                customer_manager_link.status
                            FROM
                                customer_manager_link
                            WHERE
                                customer_manager_link.manager_customer = 'customers/{MCC_CUSTOMER_ID}'
                        """
                        link_request = client.get_type("SearchGoogleAdsRequest")
                        link_request.customer_id = clean_customer_id
                        link_request.query = link_query
                        
                        link_response = ga_service.search(request=link_request)
                        is_linked = False
                        
                        for link_row in link_response:
                            manager_link_status = link_row.customer_manager_link.status.name
                            # logger.info(f"🔗 وجدنا ربط مع MCC للحساب {clean_customer_id}: {manager_link_status}") # تقليل الضجيج كما طلب المستخدم
                            
                            if manager_link_status == 'ACTIVE':
                                api_status = 'ACTIVE'
                                is_linked = True
                            elif manager_link_status == 'PENDING':
                                api_status = 'PENDING'
                                is_linked = True
                            elif manager_link_status == 'INACTIVE':
                                api_status = 'DISCONNECTED'
                            else:
                                api_status = manager_link_status
                            
                            link_details['manager_link_status'] = manager_link_status

                        if not is_linked:
                            logger.warning(f"⚠️ الحساب {clean_customer_id} يعمل لكنه غير مرتبط بـ MCC {MCC_CUSTOMER_ID}")
                            api_status = 'NOT_LINKED'

                    # ✅ تعيين found_link لتخطي الكود القديم
                    found_link = True
                    raw_link_status = api_status
                except Exception as user_query_error:
                    logger.error(f"❌ فشل استعلام User Context للحساب {clean_customer_id}: {user_query_error}")
                    api_status = 'ERROR'
                    found_link = False  # ✅ Fix UnboundLocalError - ensure found_link is defined
            else:
                # الطريقة القديمة: البحث في customer_client_link من MCC
                query = f"""
                    SELECT
                        customer_client_link.client_customer,
                        customer_client_link.status
                    FROM customer_client_link
                    WHERE customer_client_link.client_customer = 'customers/{clean_customer_id}'
                """

                search_request = client.get_type("SearchGoogleAdsRequest")
                search_request.customer_id = MCC_CUSTOMER_ID
                search_request.query = query

                response = ga_service.search(request=search_request)
                found_link = False

                # ✅ إصلاح: تكرار جميع النتائج واختيار أحدث حالة بناءً على Link ID
                # هذا يضمن أننا نتعامل مع آخر تفاعل (دعوة جديدة أو رفض حديث)
                links_found = []
                
                for row in response:
                    link = row.customer_client_link
                    if link.client_customer and link.client_customer.endswith(clean_customer_id):
                        status = link.status.name if link.status else 'UNKNOWN'
                        resource_name = link.resource_name
                        
                        # استخراج Link ID من resource_name (customers/{mcc}/customerClientLinks/{client}~{id})
                        link_id = 0
                        try:
                            if '~' in resource_name:
                                link_id = int(resource_name.split('~')[1])
                        except:
                            link_id = 0
                            
                        links_found.append({
                            'status': status,
                            'link_id': link_id,
                            'resource_name': resource_name
                        })
                        found_link = True
                
                # فرز الروابط حسب ID تنازلياً (الأحدث أولاً)
                links_found.sort(key=lambda x: x['link_id'], reverse=True)
                
                # اختيار الحالة الأحدث
                if links_found:
                    latest_link = links_found[0]
                    raw_link_status = latest_link['status']
                    
                    link_details.update({
                        'link_status': raw_link_status,
                        'raw_status': raw_link_status,
                        'latest_link_id': latest_link['link_id'],
                        'method': 'customer_client_link_sorted_by_id'
                    })
                    logger.info(f"📊 الحالة الأحدث للحساب {clean_customer_id}: {raw_link_status} (ID: {latest_link['link_id']})")
                
            
            # الطريقة 2: تحديد الحالة بناءً على raw_link_status
            if found_link:
                # التحقق من حالة الرابط أولاً
                if raw_link_status == 'ACTIVE':
                    # ✅ الرابط نشط = الحساب مرتبط ومُفعّل
                    api_status = 'ACTIVE'
                    link_details.update({
                        'verified': True,
                        'is_disabled': False,
                        'needs_activation': False
                    })
                    logger.info(f"✅ الحساب {clean_customer_id} مرتبط ومُفعّل (link_status=ACTIVE)")
                elif raw_link_status == 'PENDING':
                    # ⚠️ STRICT MATRIX: PENDING must ALWAYS stay PENDING
                    # The only way to transition to ACTIVE is when Google API reports link_status=ACTIVE
                    # Direct access verification is REMOVED because it causes wrong status transitions
                    api_status = 'PENDING'
                    link_details.update({
                        'link_status': 'PENDING',
                        'verified': False,
                        'is_disabled': False,
                        'needs_activation': False,
                        'pending_acceptance': True,  # ✅ Clear indicator that client needs to accept
                        'method': 'strict_matrix'
                    })
                    logger.info(f"⏳ STRICT MATRIX: الحساب {clean_customer_id} - دعوة معلقة (PENDING) - يجب على العميل قبولها")
                elif raw_link_status == 'INACTIVE':
                    # ❌ INACTIVE = الرابط غير نشط (مُلغى/منتهي/مرفوض قديم) -> NOT_LINKED
                    # نتحقق من الوصول المباشر للتأكد
                    logger.info(f"🔍 التحقق من الوصول الفعلي للحساب {clean_customer_id} (link_status=INACTIVE)...")
                    try:
                        direct_query = """
                            SELECT customer.id, customer.descriptive_name, customer.status
                            FROM customer
                            LIMIT 1
                        """
                        direct_request = client.get_type("SearchGoogleAdsRequest")
                        direct_request.customer_id = clean_customer_id
                        direct_request.query = direct_query
                        
                        direct_response = ga_service.search(request=direct_request)
                        access_success = False
                        for row in direct_response:
                            # ✅ نجحنا في الوصول = الحساب مرتبط فعلاً (رغم أن link_status=INACTIVE)
                            access_success = True
                            api_status = 'ACTIVE'
                            link_details.update({
                                'link_status': 'ACTIVE',
                                'verified': True,
                                'method': 'direct_access_verified',
                                'customer_name': row.customer.descriptive_name if row.customer.descriptive_name else None,
                                'is_disabled': False,
                                'needs_activation': False
                            })
                            logger.info(f"✅ الحساب {clean_customer_id} مرتبط فعلاً (link_status=INACTIVE لكن الوصول ناجح)")
                            break
                        
                        if not access_success:
                            # ❌ لم نحصل على نتائج + INACTIVE = الربط مُلغى
                            api_status = 'NOT_LINKED'
                            link_details.update({
                                'verified': False,
                                'is_disabled': False,
                                'needs_activation': False
                            })
                            logger.info(f"❌ الحساب {clean_customer_id} - الربط مُلغى (link_status=INACTIVE)")
                    except GoogleAdsException as direct_error:
                        error_str = str(direct_error)
                        if 'RESOURCE_EXHAUSTED' in error_str:
                            logger.warning(f"⚠️ خطأ كوتا أثناء التحقق من الحساب {clean_customer_id}")
                            raise direct_error
                        else:
                            # ❌ فشل الوصول + INACTIVE = الربط مُلغى
                            api_status = 'NOT_LINKED'
                            link_details.update({
                                'verified': False,
                                'is_disabled': False,
                                'needs_activation': False
                            })
                            logger.info(f"❌ الحساب {clean_customer_id} - الربط مُلغى (INACTIVE + فشل الوصول)")
                    except Exception as direct_error:
                        error_str = str(direct_error)
                        if 'RESOURCE_EXHAUSTED' in error_str or 'quota' in error_str.lower():
                            logger.warning(f"⚠️ خطأ كوتا أثناء التحقق من الحساب {clean_customer_id}")
                            raise direct_error
                        else:
                            # ❌ أي خطأ + INACTIVE = الربط مُلغى
                            api_status = 'NOT_LINKED'
                            link_details.update({
                                'verified': False,
                                'is_disabled': False,
                                'needs_activation': False
                            })
                            logger.info(f"❌ الحساب {clean_customer_id} - الربط مُلغى (INACTIVE + خطأ عام)")
                elif raw_link_status in ['REFUSED', 'CANCELED', 'CANCELLED', 'REJECTED']:
                    # ❌ تم رفض الدعوة أو إلغاؤها بشكل صريح
                    api_status = 'REJECTED'
                    link_details.update({
                        'verified': False,
                        'is_disabled': False,
                        'needs_activation': False,
                        'rejection_reason': f"Invitation was {raw_link_status}"
                    })
                    logger.info(f"❌ الحساب {clean_customer_id} تم رفض الدعوة (link_status={raw_link_status})")
                else:
                    # أي حالة أخرى (UNKNOWN, etc.) = غير مرتبط
                    api_status = 'NOT_LINKED'
                    link_details.update({
                        'verified': False,
                        'is_disabled': False,
                        'needs_activation': False
                    })
                    logger.info(f"❌ الحساب {clean_customer_id} غير مرتبط (link_status={raw_link_status})")
            elif not found_link:
                # لم نجد أي رابط في customer_client_link
                api_status = 'NOT_LINKED'
                logger.info(f"❌ الحساب {clean_customer_id} غير مرتبط (لا يوجد رابط)")

        except GoogleAdsException as e:
            logger.error(f"❌ Google Ads API error in sync_account_status for {clean_customer_id}: {e}")
            error_payload = handle_google_ads_exception(e)

            # محاولة استخراج كود الخطأ الرئيسي
            primary_code = None
            is_quota_error = False
            try:
                if error_payload.get('errors'):
                    first_error = error_payload['errors'][0]
                    primary_code = first_error.get('error_code')
                    # التحقق من خطأ الكوتا
                    if primary_code == 'RESOURCE_EXHAUSTED' or 'quota' in str(first_error).lower():
                        is_quota_error = True
                # التحقق أيضاً من نص الخطأ
                if 'RESOURCE_EXHAUSTED' in str(e) or 'quota' in str(e).lower():
                    is_quota_error = True
            except Exception:
                primary_code = None

            # إذا كان خطأ كوتا، نحتفظ بالحالة القديمة ولا نُحدّث
            if is_quota_error:
                logger.warning(f"⚠️ خطأ كوتا للحساب {clean_customer_id} - الاحتفاظ بالحالة القديمة: {db_status}")
                return jsonify({
                    'success': False,
                    'customer_id': clean_customer_id,
                    'db_status': db_status,  # الحالة القديمة
                    'api_status': 'QUOTA_EXHAUSTED',
                    'status_changed': False,
                    'quota_error': True,
                    'message': 'تم استهلاك كوتا Google Ads API - الحالة المحفوظة لم تتغير',
                    'link_details': link_details
                })

            # حساب حالة منطقية خام بناءً على الخطأ
            if primary_code in ('CUSTOMER_NOT_ENABLED', 'USER_PERMISSION_DENIED', 'CUSTOMER_NOT_FOUND'):
                api_status = 'NOT_LINKED'
            else:
                api_status = 'ERROR'

            link_details.update({
                'error': error_payload,
                'error_type': error_payload.get('error'),
            })

        except Exception as e:
            logger.error(f"❌ خطأ عام في Google Ads أثناء sync_account_status للحساب {clean_customer_id}: {e}")
            
            # التحقق من خطأ الكوتا في الاستثناء العام
            if 'RESOURCE_EXHAUSTED' in str(e) or 'quota' in str(e).lower():
                logger.warning(f"⚠️ خطأ كوتا (استثناء عام) للحساب {clean_customer_id} - الاحتفاظ بالحالة القديمة: {db_status}")
                return jsonify({
                    'success': False,
                    'customer_id': clean_customer_id,
                    'db_status': db_status,  # الحالة القديمة
                    'api_status': 'QUOTA_EXHAUSTED',
                    'status_changed': False,
                    'quota_error': True,
                    'message': 'تم استهلاك كوتا Google Ads API - الحالة المحفوظة لم تتغير',
                    'link_details': link_details
                })
            
            api_status = 'ERROR'
            link_details.update({
                'error': str(e),
                'error_type': 'GENERAL_ERROR'
            })

        # تحويل الحالة الخام إلى قيمة آمنة ومتوافقة مع قاعدة البيانات
        db_safe_status = convert_status_to_db_safe(api_status)

        status_changed = db_safe_status != db_status

        # تحديث Supabase بحالة الحساب (إن أمكن) - فقط إذا لم يكن خطأ عام
        # لا نُحدّث إذا كانت الحالة ERROR لأنها قد تكون مؤقتة
        if api_status != 'ERROR':
            try:
                save_client_request_to_db(
                    clean_customer_id,
                    request_type='status_update',
                    account_name=(last_request or {}).get('account_name'),
                    oauth_data=(last_request or {}).get('oauth_data'),
                    status=db_safe_status,
                    link_details=link_details
                )
            except Exception as e:
                logger.warning(f"⚠️ فشل في تحديث حالة الحساب في Supabase للحساب {clean_customer_id}: {e}")
        else:
            logger.warning(f"⚠️ لم يتم تحديث الحالة في Supabase للحساب {clean_customer_id} بسبب خطأ عام")

        # DEBUG: طباعة link_details قبل الإرسال
        is_disabled_flag = link_details.get('is_disabled', False)
        needs_activation_flag = link_details.get('needs_activation', False)
        logger.info(f"📤 إرسال response للحساب {clean_customer_id}: api_status={api_status}, is_disabled={is_disabled_flag}, needs_activation={needs_activation_flag}")
        
        return jsonify({
            'success': api_status not in ('ERROR',),
            'customer_id': clean_customer_id,
            'db_status': db_safe_status if api_status != 'ERROR' else db_status,
            'api_status': api_status,
            'status_changed': status_changed if api_status != 'ERROR' else False,
            'link_details': link_details
        })

    except Exception as e:
        logger.error(f"❌ خطأ عام في sync_account_status للحساب {customer_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في مزامنة حالة الحساب'
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
            
        # التحقق من وجود أي طلب سابق لهذا الحساب (بغض النظر عن request_type)
        # هذا يضمن تحديث نفس السجل بدلاً من إنشاء سجلات متعددة
        # ✅ تعديل: جلب جميع السجلات لترتيبها وحذف القديم منها
        existing_response = supabase.table('client_requests').select('id, request_type').eq('customer_id', customer_id).order('created_at', desc=True).execute()
        existing_rows = existing_response.data if existing_response.data else []
        
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
        
        if existing_rows:
            # تحديث أحدث طلب (الأول في القائمة)
            latest_id = existing_rows[0]['id']
            result = supabase.table('client_requests').update(data).eq('id', latest_id).execute()
            logger.info(f"🔄 تم تحديث طلب العميل {customer_id} في Supabase - الحالة: {status or 'لم تتغير'}")
            
            # 🗑️ حذف السجلات القديمة المكررة (إذا وجدت)
            if len(existing_rows) > 1:
                old_ids = [row['id'] for row in existing_rows[1:]]
                if old_ids:
                    logger.info(f"🗑️ جاري حذف {len(old_ids)} سجل قديم للحساب {customer_id}")
                    # حذف دفعة واحدة
                    supabase.table('client_requests').delete().in_('id', old_ids).execute()
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

# Note: check_link_status is defined below in the Zero-Latency Neuro-Link section (line ~2615)

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

# Note: Main block moved to end of file for Zero-Latency Neuro-Link architecture

def get_real_link_status(customer_id):
    """
    تحقق مزدوج للحالة (Standard + Deep Check).
    يعيد (db_status, api_status, link_details)
    """
    db_status = 'NOT_LINKED'
    api_status = 'NOT_FOUND'
    link_details = None
    
    try:
        # A. Standard Check (MCC View)
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        
        query = f"""
            SELECT 
                customer_client_link.client_customer,
                customer_client_link.status,
                customer_client_link.resource_name
            FROM customer_client_link 
            WHERE customer_client_link.client_customer = 'customers/{customer_id}'
        """
        
        try:
            search_req = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
            for row in search_req:
                api_status = row.customer_client_link.status.name
                
                if api_status == 'ACTIVE': db_status = 'ACTIVE'
                elif api_status == 'PENDING': db_status = 'PENDING'
                elif api_status == 'REFUSED': db_status = 'REJECTED'
                elif api_status == 'CANCELLED': db_status = 'CANCELLED'
                elif api_status == 'SUSPENDED': db_status = 'SUSPENDED'
                else: db_status = 'NOT_LINKED'
                
                link_details = {
                    "client_customer": row.customer_client_link.client_customer,
                    "manager_customer": MCC_CUSTOMER_ID,
                    "status": api_status,
                    "resource_name": row.customer_client_link.resource_name
                }
                break
        except Exception as e:
            # logger.warning(f"⚠️ Basic Check Failed {customer_id}: {e}")
            pass

        # B. Deep Check (Impersonation) - Only upgrade NOT_LINKED, NEVER override PENDING
        # ⚠️ STRICT MATRIX: PENDING must stay PENDING until Socket/Webhook confirms ACTIVE
        if db_status == 'NOT_LINKED':
            try:
                check_client = get_google_ads_client()
                check_client.login_customer_id = customer_id
                check_svc = check_client.get_service("GoogleAdsService")
                check_svc.search(customer_id=customer_id, query="SELECT customer.id FROM customer LIMIT 1")
                
                # If we are here, we have access -> ACTIVE (only if was NOT_LINKED)
                db_status = 'ACTIVE'
                api_status = 'ACTIVE'
                if not link_details:
                    link_details = {"status": "ACTIVE", "source": "deep_check", "manager_customer": MCC_CUSTOMER_ID}
                else:
                    link_details['status'] = 'ACTIVE (Deep Check)'
                
                logger.info(f"✅ Deep Check Verified: {customer_id} is ACTIVE")
            except:
                pass # Normal if not linked
                
    except Exception as e:
        logger.warning(f"⚠️ Status Check Error {customer_id}: {e}")
        
    return db_status, api_status, link_details


@app.route('/api/sync-all-statuses', methods=['POST'])
def sync_all_statuses():
    """مزامنة جميع حالات الربط من Google Ads API إلى قاعدة البيانات (Optimized)"""
    try:
        logger.info("🔄 بدء مزامنة جميع حالات الربط...")
        all_requests = get_client_requests_from_db()
        
        if not all_requests:
            return jsonify({'success': True, 'message': 'لا توجد طلبات للمزامنة', 'synced_count': 0})
        
        synced_count = 0
        sync_results = []
        
        for request in all_requests:
            customer_id = request.get('customer_id')
            if not customer_id: continue
                
            try:
                # 1. Get Real Status (Standard + Deep Check)
                db_status, api_status, link_details = get_real_link_status(customer_id)
                
                # 2. Update DB if changed
                current_status = request.get('status')
                
                # Special handling for CANCELLED to avoid flickering
                if db_status == 'NOT_LINKED' and current_status == 'CANCELLED':
                    pass
                elif current_status != db_status:
                    logger.info(f"🔄 تحديث تلقائي {customer_id}: {current_status} → {db_status}")
                    
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
                    
            except Exception as e:
                logger.error(f"❌ خطأ بسيط في مزامنة {customer_id}: {e}")
                continue
        
        logger.info(f"✅ تمت مزامنة {synced_count} حساب")
        return jsonify({
            'success': True,
            'message': f'تمت مزامنة {synced_count} حساب',
            'synced_count': synced_count,
            'sync_results': sync_results
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ جذري في مزامنة الحالات: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== WEBHOOKS FOR PUB/SUB ====================

@app.route('/api/webhooks/pubsub', methods=['POST'])
def pubsub_webhook():
    """معالجة فورية للإشعارات (Instant Reaction) - Zero-Latency Architecture"""
    # === VERBOSE ENTRY LOGGING (BEFORE ANYTHING) ===
    try:
        logger.info("=" * 60)
        logger.info(f"🔔 [WEBHOOK RAW HIT] Method: {request.method}")
        logger.info(f"🔔 [WEBHOOK RAW HIT] URL: {request.url}")
        logger.info(f"🔔 [WEBHOOK RAW HIT] Remote IP: {request.remote_addr}")
        logger.info(f"🔔 [WEBHOOK RAW HIT] Headers: {dict(request.headers)}")
        raw_data = request.get_data(as_text=True)
        logger.info(f"🔔 [WEBHOOK RAW HIT] Raw Body (First 1000 chars): {raw_data[:1000]}")
        logger.info("=" * 60)
    except Exception as log_err:
        logger.error(f"Error logging webhook entry: {log_err}")

    # === TOKEN VERIFICATION ===
    token = request.args.get('token')
    expected_token = os.getenv('PUBSUB_VERIFICATION_TOKEN')
    
    logger.info(f"🔐 [TOKEN CHECK] Received: '{token}' | Expected: '...{str(expected_token)[-6:] if expected_token else 'None'}'")
    
    if not token or token != expected_token:
        logger.warning(f"🚫 [SECURITY] Invalid Token! Blocking request.")
        return jsonify({'error': 'Invalid or missing token', 'success': False}), 401

    logger.info("✅ [TOKEN] Verification passed!")

    try:
        if not request.json: 
            logger.warning("⚠️ [WEBHOOK] Empty JSON body received")
            return jsonify({'success': False, 'error': 'Empty body'}), 400
            
        message = request.json.get('message', {})
        
        logger.info(f"📨 [WEBHOOK] Message ID: {message.get('messageId', 'N/A')}")
        
        # 1. Emit Raw Log (Legacy - for debugging)
        socketio.emit('log_event', request.json)
        
        # 2. Parse Payload and Extract Customer ID + Status
        customer_id = None
        payload_status = None  # ⚡ Status from webhook payload (instant)
        
        if 'data' in message:
            try:
                decoded_data = base64.b64decode(message['data']).decode('utf-8')
                data_json = json.loads(decoded_data)
                logger.info(f"📦 [DECODED PAYLOAD]: {json.dumps(data_json, indent=2)[:500]}")
                
                # Extract Customer ID from resourceName
                if 'resourceName' in data_json:
                    import re
                    match = re.search(r'customers/(\d+)', data_json['resourceName'])
                    if match:
                        customer_id = match.group(1)
                        logger.info(f"🎯 [EXTRACTED] Customer ID: {customer_id}")
                
                # Extract Status directly from payload (if present)
                if 'status' in data_json:
                    payload_status = data_json['status'].upper()
                    logger.info(f"⚡ [PAYLOAD STATUS] Direct from webhook: {payload_status}")
                    
            except Exception as decode_err:
                logger.error(f"⚠️ [DECODE ERROR]: {decode_err}")
        
        # 3. Process if we have a Customer ID
        if customer_id:
            logger.info(f"⚡ [ZERO-LATENCY] Processing instant update for {customer_id}")
            
            # ⚡ PRIORITY: Use status from payload if available (TRUE Zero-Latency)
            # This avoids the delay of querying Google API
            if payload_status and payload_status in ['ACTIVE', 'LINKED', 'PENDING', 'REJECTED', 'CANCELLED']:
                final_status = payload_status
                logger.info(f"⚡ [INSTANT] Using payload status directly: {final_status}")
            else:
                # FALLBACK: Query Google API only if no status in payload
                logger.info(f"🔍 [FALLBACK] No payload status, querying Google API...")
                db_status, api_status, link_details = get_real_link_status(customer_id)
                final_status = db_status
                logger.info(f"📡 [API STATUS] From Google: {final_status}")
            
            # Save to Supabase (instant)
            save_client_request_to_db(
                customer_id=customer_id,
                request_type='link_request',
                account_name=f'Google Ads Account {customer_id}',
                status=final_status,
                link_details={'source': 'webhook', 'timestamp': datetime.now().isoformat()}
            )
            logger.info(f"💾 [SAVED] Status {final_status} saved to Supabase")
            
            # ⚡ EMIT INSTANT UPDATE VIA SOCKET.IO
            emit_payload = {
                'customer_id': customer_id,
                'status': final_status,
                'source': 'webhook',
                'timestamp': datetime.now().isoformat()
            }
            socketio.emit('status_update', emit_payload)
            logger.info(f"🚀 [SOCKET.IO EMITTED] Instant status update: {customer_id} → {final_status}")
            logger.info("=" * 60)
        else:
            logger.warning("⚠️ [WEBHOOK] Could not extract Customer ID from payload")

        return jsonify({'success': True, 'processed': customer_id is not None}), 200

    except Exception as e:
        logger.error(f"❌ [WEBHOOK CRITICAL ERROR]: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== AI INSIGHTS ENDPOINTS ====================

@app.route('/api/ai-insights/recommendations', methods=['GET', 'OPTIONS'])
def get_ai_recommendations():
    """جلب التوصيات الذكية من Google Ads API"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        customer_id = request.args.get('customer_id')
        if not customer_id:
            return jsonify({'success': False, 'error': 'customer_id is required'}), 400
        
        customer_id = customer_id.replace('-', '')
        
        # إنشاء client باستخدام الدالة المساعدة الموحدة
        client = get_google_ads_client()
        googleads_service = client.get_service("GoogleAdsService")
        
        # استعلام التوصيات
        query = """
            SELECT
              recommendation.resource_name,
              recommendation.type,
              recommendation.impact,
              recommendation.campaign,
              recommendation.ad_group
            FROM recommendation
            WHERE recommendation.type IN (
              'KEYWORD', 'KEYWORD_MATCH_TYPE', 'CAMPAIGN_BUDGET', 
              'TEXT_AD', 'RESPONSIVE_SEARCH_AD', 'SITELINK_ASSET',
              'CALLOUT_ASSET', 'CALL_ASSET', 'TARGET_CPA_OPT_IN',
              'TARGET_ROAS_OPT_IN', 'MAXIMIZE_CONVERSIONS_OPT_IN',
              'ENHANCED_CPC_OPT_IN', 'SEARCH_PARTNERS_OPT_IN'
            )
            LIMIT 20
        """
        
        response = googleads_service.search(customer_id=customer_id, query=query)
        
        recommendations = []
        recommendation_types = {}
        
        for row in response:
            rec = row.recommendation
            rec_type = str(rec.type).replace('RecommendationType.', '')
            
            # تجميع حسب النوع
            if rec_type not in recommendation_types:
                recommendation_types[rec_type] = 0
            recommendation_types[rec_type] += 1
            
            # معلومات التوصية
            rec_data = {
                'resource_name': rec.resource_name,
                'type': rec_type,
                'campaign': rec.campaign if rec.campaign else None,
                'ad_group': rec.ad_group if rec.ad_group else None
            }
            
            # إضافة معلومات التأثير إذا وجدت
            if hasattr(rec, 'impact') and rec.impact:
                impact = rec.impact
                rec_data['impact'] = {
                    'base_metrics': {
                        'impressions': impact.base_metrics.impressions if hasattr(impact.base_metrics, 'impressions') else 0,
                        'clicks': impact.base_metrics.clicks if hasattr(impact.base_metrics, 'clicks') else 0,
                        'cost_micros': impact.base_metrics.cost_micros if hasattr(impact.base_metrics, 'cost_micros') else 0,
                        'conversions': impact.base_metrics.conversions if hasattr(impact.base_metrics, 'conversions') else 0
                    },
                    'potential_metrics': {
                        'impressions': impact.potential_metrics.impressions if hasattr(impact.potential_metrics, 'impressions') else 0,
                        'clicks': impact.potential_metrics.clicks if hasattr(impact.potential_metrics, 'clicks') else 0,
                        'cost_micros': impact.potential_metrics.cost_micros if hasattr(impact.potential_metrics, 'cost_micros') else 0,
                        'conversions': impact.potential_metrics.conversions if hasattr(impact.potential_metrics, 'conversions') else 0
                    }
                }
            
            recommendations.append(rec_data)
        
        logger.info(f"✅ تم جلب {len(recommendations)} توصية للحساب {customer_id}")
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'summary': recommendation_types,
            'total_count': len(recommendations)
        })
        
    except GoogleAdsException as ex:
        error_message = f"Google Ads API Error: {ex.failure.errors[0].message if ex.failure.errors else str(ex)}"
        logger.error(f"❌ {error_message}")
        return jsonify({'success': False, 'error': error_message}), 400
    except Exception as e:
        logger.error(f"❌ خطأ في جلب التوصيات: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ai-insights/audience', methods=['GET', 'OPTIONS'])
def get_audience_insights():
    """جلب تحليلات الجمهور من Google Ads API"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        customer_id = request.args.get('customer_id')
        if not customer_id:
            return jsonify({'success': False, 'error': 'customer_id is required'}), 400
        
        customer_id = customer_id.replace('-', '')
        
        # إنشاء client باستخدام الدالة المساعدة الموحدة
        client = get_google_ads_client()
        googleads_service = client.get_service("GoogleAdsService")
        
        # استعلام بيانات الجمهور حسب العمر والجنس
        age_gender_query = """
            SELECT
              ad_group_criterion.age_range.type,
              ad_group_criterion.gender.type,
              metrics.impressions,
              metrics.clicks,
              metrics.conversions,
              metrics.cost_micros
            FROM age_range_view
            WHERE segments.date DURING LAST_30_DAYS
        """
        
        # استعلام بيانات الأجهزة
        device_query = """
            SELECT
              segments.device,
              metrics.impressions,
              metrics.clicks,
              metrics.conversions,
              metrics.cost_micros
            FROM campaign
            WHERE segments.date DURING LAST_30_DAYS
              AND campaign.status = 'ENABLED'
        """
        
        # جلب بيانات الأجهزة
        device_data = {}
        try:
            device_response = googleads_service.search(customer_id=customer_id, query=device_query)
            for row in device_response:
                device = str(row.segments.device).replace('Device.', '')
                if device not in device_data:
                    device_data[device] = {'impressions': 0, 'clicks': 0, 'conversions': 0, 'cost': 0}
                device_data[device]['impressions'] += row.metrics.impressions
                device_data[device]['clicks'] += row.metrics.clicks
                device_data[device]['conversions'] += row.metrics.conversions
                device_data[device]['cost'] += row.metrics.cost_micros / 1000000
        except Exception as e:
            logger.warning(f"⚠️ لم يتم جلب بيانات الأجهزة: {e}")
        
        # تحويل البيانات للـ Frontend
        device_breakdown = [
            {'device': k, **v} for k, v in device_data.items()
        ]
        
        logger.info(f"✅ تم جلب تحليلات الجمهور للحساب {customer_id}")
        
        return jsonify({
            'success': True,
            'audience_insights': {
                'device_breakdown': device_breakdown,
                'total_devices': len(device_breakdown)
            }
        })
        
    except GoogleAdsException as ex:
        error_message = f"Google Ads API Error: {ex.failure.errors[0].message if ex.failure.errors else str(ex)}"
        logger.error(f"❌ {error_message}")
        return jsonify({'success': False, 'error': error_message}), 400
    except Exception as e:
        logger.error(f"❌ خطأ في جلب تحليلات الجمهور: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ai-insights/budget-impact', methods=['POST', 'OPTIONS'])
def get_budget_impact():
    """جلب تأثير تغيير الميزانية على الأداء"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        budget_amount = data.get('budget_amount', 100)  # الميزانية بالدولار
        
        if not customer_id:
            return jsonify({'success': False, 'error': 'customer_id is required'}), 400
        
        customer_id = customer_id.replace('-', '')
        
        # إنشاء client باستخدام الدالة المساعدة الموحدة
        client = get_google_ads_client()
        recommendation_service = client.get_service("RecommendationService")
        
        # إنشاء طلب توليد التوصيات
        request_obj = client.get_type("GenerateRecommendationsRequest")
        request_obj.customer_id = customer_id
        request_obj.recommendation_types = ["CAMPAIGN_BUDGET"]
        request_obj.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
        
        # تحويل الميزانية إلى micros
        request_obj.budget_info.current_budget = int(budget_amount * 1000000)
        
        try:
            response = recommendation_service.generate_recommendations(request_obj)
            
            budget_options = []
            for rec in response.recommendations:
                if hasattr(rec, 'campaign_budget_recommendation'):
                    budget_rec = rec.campaign_budget_recommendation
                    for option in budget_rec.budget_options:
                        if hasattr(option, 'impact') and option.impact:
                            budget_options.append({
                                'budget_amount': option.budget_amount_micros / 1000000,
                                'potential_impressions': option.impact.potential_metrics.impressions if hasattr(option.impact.potential_metrics, 'impressions') else 0,
                                'potential_clicks': option.impact.potential_metrics.clicks if hasattr(option.impact.potential_metrics, 'clicks') else 0,
                                'potential_conversions': option.impact.potential_metrics.conversions if hasattr(option.impact.potential_metrics, 'conversions') else 0,
                                'potential_cost': option.impact.potential_metrics.cost_micros / 1000000 if hasattr(option.impact.potential_metrics, 'cost_micros') else 0
                            })
            
            logger.info(f"✅ تم جلب تأثير الميزانية للحساب {customer_id}")
            
            return jsonify({
                'success': True,
                'budget_impact': budget_options,
                'requested_budget': budget_amount
            })
            
        except Exception as api_error:
            logger.warning(f"⚠️ لم يتم توليد توصيات الميزانية: {api_error}")
            return jsonify({
                'success': True,
                'budget_impact': [],
                'requested_budget': budget_amount,
                'message': 'No budget recommendations available for this account'
            })
        
    except GoogleAdsException as ex:
        error_message = f"Google Ads API Error: {ex.failure.errors[0].message if ex.failure.errors else str(ex)}"
        logger.error(f"❌ {error_message}")
        return jsonify({'success': False, 'error': error_message}), 400
    except Exception as e:
        logger.error(f"❌ خطأ في جلب تأثير الميزانية: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/google-ads/update-campaign-budget', methods=['POST'])
def update_campaign_budget():
    """تحديث ميزانية حملة معينة عبر Google Ads API"""
    try:
        data = request.get_json()
        
        customer_id = data.get('customer_id')
        campaign_id = data.get('campaign_id')
        new_daily_budget = data.get('new_daily_budget')
        
        if not customer_id or not campaign_id or not new_daily_budget:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: customer_id, campaign_id, new_daily_budget',
                'message': 'الحقول المطلوبة غير مكتملة'
            }), 400
        
        # تنظيف معرف العميل
        clean_customer_id = str(customer_id).replace('-', '').strip()
        
        if not clean_customer_id.isdigit() or len(clean_customer_id) != 10:
            return jsonify({
                'success': False,
                'error': 'Invalid customer ID format',
                'message': 'معرف العميل يجب أن يكون 10 أرقام'
            }), 400
        
        # تحويل الميزانية إلى micros
        budget_amount_micros = int(float(new_daily_budget) * 1_000_000)
        
        logger.info(f"💰 تحديث ميزانية الحملة {campaign_id} للحساب {clean_customer_id}")
        logger.info(f"   الميزانية الجديدة: {new_daily_budget} ({budget_amount_micros} micros)")
        
        client = get_google_ads_client()
        ga_service = client.get_service("GoogleAdsService")
        campaign_budget_service = client.get_service("CampaignBudgetService")
        
        # 1. جلب resource_name للميزانية المرتبطة بالحملة
        query = f"""
            SELECT
                campaign.id,
                campaign.name,
                campaign_budget.resource_name,
                campaign_budget.amount_micros
            FROM campaign
            WHERE campaign.id = {campaign_id}
        """
        
        search_request = client.get_type("SearchGoogleAdsRequest")
        search_request.customer_id = clean_customer_id
        search_request.query = query
        
        response = ga_service.search(request=search_request)
        
        budget_resource_name = None
        campaign_name = None
        old_budget_micros = 0
        
        for row in response:
            budget_resource_name = row.campaign_budget.resource_name
            old_budget_micros = row.campaign_budget.amount_micros
            campaign_name = row.campaign.name
            break
        
        if not budget_resource_name:
            return jsonify({
                'success': False,
                'error': 'Campaign budget not found',
                'message': 'لم يتم العثور على ميزانية لهذه الحملة'
            }), 404
        
        logger.info(f"   الميزانية الحالية: {old_budget_micros / 1_000_000}")
        
        # 2. تحديث الميزانية
        campaign_budget_operation = client.get_type("CampaignBudgetOperation")
        campaign_budget = campaign_budget_operation.update
        
        campaign_budget.resource_name = budget_resource_name
        campaign_budget.amount_micros = budget_amount_micros
        
        # تعيين field mask
        from google.api_core import protobuf_helpers
        client.copy_from(
            campaign_budget_operation.update_mask,
            protobuf_helpers.field_mask(None, campaign_budget._pb)
        )
        
        # تنفيذ التحديث
        mutate_response = campaign_budget_service.mutate_campaign_budgets(
            customer_id=clean_customer_id,
            operations=[campaign_budget_operation]
        )
        
        logger.info(f"✅ تم تحديث ميزانية الحملة {campaign_id} بنجاح")
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث الميزانية بنجاح',
            'campaign_id': campaign_id,
            'campaign_name': campaign_name,
            'old_budget': old_budget_micros / 1_000_000,
            'new_budget': new_daily_budget,
            'customer_id': clean_customer_id
        })
        
    except GoogleAdsException as e:
        logger.error(f"❌ خطأ Google Ads API في تحديث الميزانية: {e}")
        return jsonify(handle_google_ads_exception(e)), 400
        
    except Exception as e:
        logger.error(f"❌ خطأ عام في update_campaign_budget: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في تحديث الميزانية'
        }), 500


# =============================================================================
# ⚡ Zero-Latency Neuro-Link: Webhook & SSE Endpoints
# =============================================================================

# قائمة SSE clients المتصلين
sse_clients = []

# Note: Old webhook removed - see google_ads_status_change_webhook at end of file (Golden Rule)


def broadcast_sse_event(data):
    """بث حدث لجميع SSE clients المتصلين"""
    global sse_clients
    dead_clients = []
    
    for client_queue in sse_clients:
        try:
            client_queue.put(data)
        except:
            dead_clients.append(client_queue)
    
    # إزالة clients الميتين
    for dead in dead_clients:
        try:
            sse_clients.remove(dead)
        except:
            pass


@app.route('/api/account-status-stream', methods=['GET'])
def neuro_link_sse_stream():
    """
    📡 SSE Endpoint للمزامنة اللحظية
    يسمح للمتصفح بالاستماع لتحديثات الحالة في الوقت الفعلي
    """
    import queue
    
    def event_stream():
        client_queue = queue.Queue()
        sse_clients.append(client_queue)
        
        try:
            # إرسال رسالة ترحيب
            yield f"data: {json.dumps({'type': 'connected', 'message': 'SSE Connected to Neuro-Link'})}\n\n"
            
            # Heartbeat counter
            heartbeat_count = 0
            
            while True:
                try:
                    # انتظار رسالة لمدة 15 ثانية (للـ Keep-alive)
                    data = client_queue.get(timeout=15)
                    yield f"data: {json.dumps(data)}\n\n"
                except queue.Empty:
                    # إرسال heartbeat للحفاظ على الاتصال
                    heartbeat_count += 1
                    yield f"data: {json.dumps({'type': 'heartbeat', 'message': f'Heartbeat #{heartbeat_count}'})}\n\n"
                except GeneratorExit:
                    break
                    
        finally:
            # إزالة العميل عند قطع الاتصال
            try:
                sse_clients.remove(client_queue)
            except:
                pass
    
    response = Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*'
        }
    )
    return response


@app.route('/api/webhooks/google-ads/status-change', methods=['POST'])
def google_ads_status_change_webhook():
    """
    📡 القاعدة الذهبية Webhook: نقطة استقبال تحديثات الحالة من Google Ads
    عند وصول أي تغيير (ACTIVE/REJECTED/CANCELLED) يتم:
    1. تحديث أحدث سجل في Supabase
    2. بث الحالة فوراً للـ Frontend عبر Socket.IO + SSE
    """
    try:
        data = request.get_json()
        logger.info(f"📥 [WEBHOOK] Received status change: {data}")
        
        customer_id = data.get('customer_id', '').replace('-', '').strip()
        new_status = data.get('status', '').upper().strip()
        
        if not customer_id or not new_status:
            return jsonify({
                'success': False,
                'error': 'customer_id and status are required'
            }), 400
        
        # القاعدة الذهبية: تحديث أحدث سجل في Supabase (جلب الـ ID أولاً ثم التحديث)
        try:
            # أولاً: جلب ID أحدث سجل
            latest_record = supabase.table('client_requests') \
                .select('id') \
                .eq('customer_id', customer_id) \
                .order('created_at', desc=True) \
                .limit(1) \
                .execute()
            
            if latest_record.data:
                record_id = latest_record.data[0]['id']
                # ثانياً: التحديث باستخدام الـ ID الفريد
                supabase.table('client_requests') \
                    .update({
                        'status': new_status,
                        'updated_at': datetime.now().isoformat()
                    }) \
                    .eq('id', record_id) \
                    .execute()
                logger.info(f"💾 [WEBHOOK] تم تحديث السجل {record_id} → {new_status}")
            else:
                logger.warning(f"⚠️ [WEBHOOK] لم يتم العثور على سجل للحساب {customer_id}")
        except Exception as db_error:
            logger.error(f"❌ [WEBHOOK] فشل تحديث قاعدة البيانات: {db_error}")
        
        # بث لحظي عبر Socket.IO
        broadcast_status_update(customer_id, new_status, {'source': 'webhook'})
        
        # بث عبر SSE أيضاً
        broadcast_sse_event({
            'type': 'status_update',
            'customer_id': customer_id,
            'status': new_status,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"✅ [WEBHOOK] Broadcast complete: {customer_id} → {new_status}")
        
        return jsonify({
            'success': True,
            'message': f'Status updated and broadcasted: {customer_id} → {new_status}',
            'golden_rule': True
        })
        
    except Exception as e:
        logger.error(f"❌ [WEBHOOK] Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/neuro-link/health', methods=['GET'])
def neuro_link_health():
    """
    🏥 فحص صحة نظام Neuro-Link
    """
    return jsonify({
        'success': True,
        'system': 'Zero-Latency Neuro-Link',
        'sse_clients': len(sse_clients),
        'socket_io': 'active',
        'webhook_endpoint': '/api/webhooks/google-ads/status-change',
        'sse_endpoint': '/api/account-status-stream',
        'status': 'operational',
        'timestamp': datetime.now().isoformat()
    })


# =============================================================================
# 🔄 Background Sync Worker - المزامنة الخلفية الذكية (Self-Healing Sync)
# =============================================================================

# متغير للتحكم في إيقاف المزامنة الخلفية
_background_sync_stop_event = threading.Event()
_background_sync_thread = None

def background_sync_worker():
    """
    🔄 مهمة المزامنة الخلفية - تعمل كل 5 دقائق
    تحافظ على مطابقة Supabase مع Google Ads
    """
    import datetime as dt
    
    # خريطة حالات الرابط
    STATUS_MAP = {
        0: "UNSPECIFIED", 1: "UNKNOWN", 2: "PENDING",
        3: "ACTIVE", 4: "INACTIVE", 5: "REFUSED", 6: "CANCELLED"
    }
    
    SYNC_INTERVAL = 300  # 5 دقائق
    
    logger.info("🔄 بدء Background Sync Worker - المزامنة كل 5 دقائق")
    
    while not _background_sync_stop_event.is_set():
        try:
            # انتظار 5 دقائق (أو حتى يتم الإيقاف)
            if _background_sync_stop_event.wait(timeout=SYNC_INTERVAL):
                break
            
            logger.info("⏰ Background Sync: بدء المزامنة الدورية...")
            sync_start = dt.datetime.now()
            
            # جلب جميع الحسابات من Supabase
            try:
                all_accounts = supabase.table('client_requests').select('customer_id, status').execute()
                
                if not all_accounts.data:
                    logger.info("📭 Background Sync: لا توجد حسابات للمزامنة")
                    continue
                    
                customer_ids = [acc.get('customer_id') for acc in all_accounts.data if acc.get('customer_id')]
                current_statuses = {acc.get('customer_id'): acc.get('status') for acc in all_accounts.data}
                
                logger.info(f"🔄 Background Sync: مزامنة {len(customer_ids)} حساب...")
                
            except Exception as db_err:
                logger.warning(f"⚠️ Background Sync: فشل جلب الحسابات من Supabase: {db_err}")
                continue
            
            # استعلام BATCH واحد من Google Ads
            try:
                client = get_google_ads_client()
                ga_service = client.get_service("GoogleAdsService")
                
                query = """
                    SELECT 
                        customer_client_link.client_customer,
                        customer_client_link.status
                    FROM customer_client_link
                """
                
                status_results = {}
                response = ga_service.search(customer_id=MCC_CUSTOMER_ID, query=query)
                
                for row in response:
                    link = row.customer_client_link
                    client_customer = link.client_customer
                    cust_id = client_customer.split('/')[-1] if '/' in client_customer else client_customer
                    
                    raw_status = link.status
                    if hasattr(raw_status, 'name'):
                        status = raw_status.name
                    elif isinstance(raw_status, int):
                        status = STATUS_MAP.get(raw_status, f"UNKNOWN_{raw_status}")
                    else:
                        status = str(raw_status)
                        if status.isdigit():
                            status = STATUS_MAP.get(int(status), f"UNKNOWN_{status}")
                    
                    status_results[cust_id] = status
                
            except GoogleAdsException as api_err:
                logger.warning(f"⚠️ Background Sync: فشل الاتصال بـ Google Ads: {api_err}")
                continue
            
            # تحديث الحسابات التي تغيرت حالتها
            updated_count = 0
            for customer_id in customer_ids:
                clean_id = str(customer_id).replace('-', '').strip()
                google_status = status_results.get(clean_id, "NOT_LINKED")
                supabase_status = current_statuses.get(customer_id)
                
                if supabase_status != google_status:
                    try:
                        # استخدام clean_id للتحديث لضمان التطابق
                        supabase.table('client_requests').update({
                            'status': google_status,
                            'updated_at': dt.datetime.now(dt.timezone.utc).isoformat(),
                            'link_details': {
                                'synced_at': dt.datetime.now(dt.timezone.utc).isoformat(),
                                'synced_from': 'background_worker'
                            }
                        }).eq('customer_id', clean_id).execute()
                        
                        updated_count += 1
                        
                        # بث التحديث للـ UI
                        broadcast_status_update(clean_id, google_status)
                            
                        logger.info(f"🔄 Background Sync: {clean_id}: {supabase_status} -> {google_status}")
                        
                    except Exception as update_err:
                        logger.warning(f"⚠️ Background Sync: فشل تحديث {clean_id}: {update_err}")
            
            sync_time = (dt.datetime.now() - sync_start).total_seconds()
            logger.info(f"✅ Background Sync: اكتملت في {sync_time:.2f}s - تم تحديث {updated_count} حساب")
            
        except Exception as e:
            logger.error(f"❌ Background Sync Error: {e}")
            continue
    
    logger.info("🛑 Background Sync Worker توقف")


def start_background_sync():
    """بدء المزامنة الخلفية"""
    global _background_sync_thread
    if _background_sync_thread is None or not _background_sync_thread.is_alive():
        _background_sync_stop_event.clear()
        _background_sync_thread = threading.Thread(target=background_sync_worker, daemon=True)
        _background_sync_thread.start()
        logger.info("✅ تم بدء Background Sync Worker")


def stop_background_sync():
    """إيقاف المزامنة الخلفية"""
    global _background_sync_thread
    _background_sync_stop_event.set()
    if _background_sync_thread and _background_sync_thread.is_alive():
        _background_sync_thread.join(timeout=5)
    logger.info("🛑 تم إيقاف Background Sync Worker")


# بدء المزامنة الخلفية عند تشغيل التطبيق (يعمل مع Gunicorn أيضاً)
# يمكن تعطيله بتعيين ENABLE_BACKGROUND_SYNC=false
if os.getenv('ENABLE_BACKGROUND_SYNC', 'true').lower() != 'false':
    # تأخير البدء 30 ثانية لإعطاء السيرفر وقتاً للتهيئة
    threading.Timer(30.0, start_background_sync).start()
    logger.info("⏳ Background Sync سيبدأ بعد 30 ثانية...")


if __name__ == '__main__':

    # استخدام المنفذ من متغير البيئة PORT (Railway) أو 5000 للتطوير المحلي
    port = int(os.getenv('PORT', 5000))
    
    print(f"🚀 Starting Flask app on port {port}")
    print(f"📊 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'local')}")
    print(f"🔧 Production mode: {IS_PRODUCTION}")
    
    # استخدام socketio.run بدلاً من app.run لدعم WebSocket
    # Flask development server في جميع الحالات
    # Railway سيتعامل مع production server تلقائياً
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=not IS_PRODUCTION,  # تعطيل debug في الإنتاج
        use_reloader=not IS_PRODUCTION,
        log_output=True
    )