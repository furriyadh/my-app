"""
Merchant Center API Routes
مسارات API لـ Google Merchant Center
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from typing import Dict, Any

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
merchant_center_bp = Blueprint('merchant_center', __name__)

# استيراد خدمة Merchant Center
try:
    from services.merchant_center_service import merchant_center_service
    MERCHANT_CENTER_AVAILABLE = True
    logger.info("✅ تم تحميل خدمة Merchant Center بنجاح")
except ImportError:
    try:
        from ..services.merchant_center_service import merchant_center_service
        MERCHANT_CENTER_AVAILABLE = True
        logger.info("✅ تم تحميل خدمة Merchant Center بنجاح")
    except ImportError as e:
        MERCHANT_CENTER_AVAILABLE = False
        logger.warning(f"⚠️ لم يتم تحميل خدمة Merchant Center: {e}")
        merchant_center_service = None

@merchant_center_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة Merchant Center"""
    try:
        return jsonify({
            'success': True,
            'service': 'Merchant Center API',
            'status': 'healthy' if MERCHANT_CENTER_AVAILABLE else 'unavailable',
            'available': MERCHANT_CENTER_AVAILABLE,
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'خدمة Merchant Center تعمل بنجاح' if MERCHANT_CENTER_AVAILABLE else 'خدمة Merchant Center غير متاحة'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في فحص الصحة',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/status', methods=['GET'])
def status():
    """الحصول على حالة خدمة Merchant Center"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'message': 'لم يتم تحميل خدمة Merchant Center',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        status_info = merchant_center_service.get_service_status()
        
        return jsonify({
            'success': True,
            'status': status_info,
            'message': 'تم الحصول على حالة Merchant Center بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على حالة Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على الحالة',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/accounts', methods=['GET'])
def get_merchant_accounts():
    """جلب جميع حسابات Merchant Center المرتبطة"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'accounts': [],
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # جلب حسابات Merchant Center
        accounts = merchant_center_service.get_all_mcc_merchant_accounts()
        
        # تحويل البيانات إلى تنسيق JSON
        accounts_data = []
        for account in accounts:
            accounts_data.append({
                'merchant_id': account.merchant_id,
                'name': account.name,
                'country': account.country,
                'currency': account.currency,
                'status': account.status,
                'linked_ads_accounts': account.linked_ads_accounts,
                'products': {
                    'total': account.products_count,
                    'approved': account.approved_products,
                    'pending': account.pending_products,
                    'disapproved': account.disapproved_products
                },
                'last_sync': account.last_sync.isoformat() if account.last_sync else None
            })
        
        return jsonify({
            'success': True,
            'accounts': accounts_data,
            'total_accounts': len(accounts_data),
            'message': f'تم جلب {len(accounts_data)} حساب Merchant Center بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب حسابات Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في جلب الحسابات',
            'message': str(e),
            'accounts': [],
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/accounts/<merchant_id>', methods=['GET'])
def get_merchant_account_details(merchant_id: str):
    """جلب تفاصيل حساب Merchant Center محدد"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # جلب تفاصيل الحساب
        account_details = merchant_center_service.get_merchant_account_details(merchant_id)
        
        if not account_details:
            return jsonify({
                'success': False,
                'error': 'حساب Merchant Center غير موجود',
                'merchant_id': merchant_id,
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        return jsonify({
            'success': True,
            'account': account_details,
            'message': 'تم جلب تفاصيل الحساب بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب تفاصيل حساب Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في جلب تفاصيل الحساب',
            'message': str(e),
            'merchant_id': merchant_id,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/accounts/<merchant_id>/validate', methods=['GET'])
def validate_merchant_account(merchant_id: str):
    """التحقق من صحة حساب Merchant Center"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # التحقق من صحة الحساب
        validation_result = merchant_center_service.validate_merchant_account(merchant_id)
        
        return jsonify({
            'success': True,
            'validation': validation_result,
            'message': 'تم التحقق من الحساب بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في التحقق من حساب Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في التحقق من الحساب',
            'message': str(e),
            'merchant_id': merchant_id,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/accounts/search', methods=['GET'])
def search_merchant_accounts():
    """البحث في حسابات Merchant Center"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'accounts': [],
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # الحصول على معاملات البحث
        search_query = request.args.get('q', '').strip()
        country = request.args.get('country', '').strip()
        currency = request.args.get('currency', '').strip()
        status = request.args.get('status', '').strip()
        
        # جلب جميع الحسابات
        all_accounts = merchant_center_service.get_all_mcc_merchant_accounts()
        
        # تطبيق الفلاتر
        filtered_accounts = []
        for account in all_accounts:
            # فلتر النص
            if search_query and search_query.lower() not in account.name.lower():
                continue
            
            # فلتر البلد
            if country and account.country.lower() != country.lower():
                continue
            
            # فلتر العملة
            if currency and account.currency.lower() != currency.lower():
                continue
            
            # فلتر الحالة
            if status and account.status.lower() != status.lower():
                continue
            
            filtered_accounts.append(account)
        
        # تحويل البيانات إلى تنسيق JSON
        accounts_data = []
        for account in filtered_accounts:
            accounts_data.append({
                'merchant_id': account.merchant_id,
                'name': account.name,
                'country': account.country,
                'currency': account.currency,
                'status': account.status,
                'linked_ads_accounts': account.linked_ads_accounts,
                'products': {
                    'total': account.products_count,
                    'approved': account.approved_products,
                    'pending': account.pending_products,
                    'disapproved': account.disapproved_products
                },
                'last_sync': account.last_sync.isoformat() if account.last_sync else None
            })
        
        return jsonify({
            'success': True,
            'accounts': accounts_data,
            'total_accounts': len(accounts_data),
            'search_params': {
                'query': search_query,
                'country': country,
                'currency': currency,
                'status': status
            },
            'message': f'تم العثور على {len(accounts_data)} حساب',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في البحث في حسابات Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في البحث',
            'message': str(e),
            'accounts': [],
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_center_bp.route('/accounts/summary', methods=['GET'])
def get_accounts_summary():
    """الحصول على ملخص حسابات Merchant Center"""
    try:
        if not MERCHANT_CENTER_AVAILABLE or not merchant_center_service:
            return jsonify({
                'success': False,
                'error': 'خدمة Merchant Center غير متاحة',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # جلب جميع الحسابات
        accounts = merchant_center_service.get_all_mcc_merchant_accounts()
        
        # حساب الإحصائيات
        total_accounts = len(accounts)
        enabled_accounts = len([a for a in accounts if a.status == 'ENABLED'])
        total_products = sum(a.products_count for a in accounts)
        total_approved = sum(a.approved_products for a in accounts)
        total_pending = sum(a.pending_products for a in accounts)
        total_disapproved = sum(a.disapproved_products for a in accounts)
        
        # تجميع البيانات حسب البلد
        countries = {}
        for account in accounts:
            if account.country not in countries:
                countries[account.country] = 0
            countries[account.country] += 1
        
        # تجميع البيانات حسب العملة
        currencies = {}
        for account in accounts:
            if account.currency not in currencies:
                currencies[account.currency] = 0
            currencies[account.currency] += 1
        
        return jsonify({
            'success': True,
            'summary': {
                'total_accounts': total_accounts,
                'enabled_accounts': enabled_accounts,
                'disabled_accounts': total_accounts - enabled_accounts,
                'products': {
                    'total': total_products,
                    'approved': total_approved,
                    'pending': total_pending,
                    'disapproved': total_disapproved,
                    'approval_rate': (total_approved / total_products * 100) if total_products > 0 else 0
                },
                'distribution': {
                    'by_country': countries,
                    'by_currency': currencies
                }
            },
            'message': 'تم جلب ملخص الحسابات بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب ملخص حسابات Merchant Center: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في جلب الملخص',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

