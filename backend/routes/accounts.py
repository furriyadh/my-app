"""
مسارات الحسابات - Accounts Routes
Google Ads AI Platform - Accounts API Routes
"""

from flask import Blueprint, request, jsonify, session
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

from ..services.google_ads_client import GoogleAdsClient
from ..services.mcc_manager import MCCManager
from ..services.oauth_handler import OAuthHandler
from ..utils.validators import GoogleAdsValidator
from ..utils.helpers import format_currency, format_percentage, calculate_performance_score
from ..utils.database import DatabaseManager
from .auth import login_required

# إنشاء Blueprint
accounts_bp = Blueprint('accounts', __name__)

# إعداد الخدمات
google_ads_client = GoogleAdsClient()
mcc_manager = MCCManager()
oauth_handler = OAuthHandler()
db_manager = DatabaseManager()
logger = logging.getLogger(__name__)

@accounts_bp.route('/', methods=['GET'])
@login_required
def get_accounts():
    """الحصول على قائمة الحسابات الإعلانية"""
    try:
        user_id = session.get('user_id')
        
        # معاملات الاستعلام
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        status = request.args.get('status')  # ENABLED, SUSPENDED, CANCELLED
        search = request.args.get('search', '').strip()
        
        # الحصول على الحسابات من قاعدة البيانات
        accounts = db_manager.get_user_accounts(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status,
            search=search
        )
        
        # تنسيق البيانات
        formatted_accounts = []
        for account in accounts['data']:
            formatted_account = {
                'id': account['id'],
                'customer_id': account['customer_id'],
                'name': account['name'],
                'currency': account.get('currency', 'SAR'),
                'timezone': account.get('timezone', 'Asia/Riyadh'),
                'status': account['status'],
                'account_type': account.get('account_type', 'STANDARD'),
                'created_at': account.get('created_at'),
                'last_sync': account.get('last_sync'),
                'performance': {
                    'total_campaigns': account.get('total_campaigns', 0),
                    'active_campaigns': account.get('active_campaigns', 0),
                    'total_spend': format_currency(account.get('total_spend', 0), account.get('currency', 'SAR')),
                    'total_clicks': account.get('total_clicks', 0),
                    'total_impressions': account.get('total_impressions', 0),
                    'avg_ctr': format_percentage(account.get('avg_ctr', 0))
                }
            }
            formatted_accounts.append(formatted_account)
        
        return jsonify({
            'success': True,
            'accounts': formatted_accounts,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': accounts['total'],
                'pages': accounts['pages']
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحسابات: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على الحسابات',
            'error_code': 'ACCOUNTS_FETCH_ERROR'
        }), 500

@accounts_bp.route('/', methods=['POST'])
@login_required
def connect_account():
    """ربط حساب Google Ads جديد"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        customer_id = data.get('customer_id', '').strip()
        
        if not customer_id:
            return jsonify({
                'success': False,
                'message': 'معرف العميل مطلوب',
                'error_code': 'MISSING_CUSTOMER_ID'
            }), 400
        
        # التحقق من صحة معرف العميل
        is_valid, message = GoogleAdsValidator.validate_customer_id(customer_id)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': f'معرف العميل: {message}',
                'error_code': 'INVALID_CUSTOMER_ID'
            }), 400
        
        # التحقق من وجود الحساب مسبقاً
        existing_account = db_manager.get_account_by_customer_id(customer_id)
        if existing_account:
            return jsonify({
                'success': False,
                'message': 'هذا الحساب مربوط بالفعل',
                'error_code': 'ACCOUNT_ALREADY_EXISTS'
            }), 409
        
        # الحصول على معلومات الحساب من Google Ads
        try:
            account_info = google_ads_client.get_account_info(customer_id)
            
            if not account_info:
                return jsonify({
                    'success': False,
                    'message': 'لا يمكن الوصول لهذا الحساب أو غير موجود',
                    'error_code': 'ACCOUNT_NOT_ACCESSIBLE'
                }), 404
            
        except Exception as api_error:
            logger.error(f"خطأ في الوصول لحساب Google Ads: {str(api_error)}")
            return jsonify({
                'success': False,
                'message': 'فشل في الوصول لحساب Google Ads',
                'error_code': 'GOOGLE_ADS_API_ERROR'
            }), 400
        
        # حفظ الحساب في قاعدة البيانات
        account_data = {
            'user_id': user_id,
            'customer_id': customer_id,
            'name': account_info.get('name', f'حساب {customer_id}'),
            'currency': account_info.get('currency', 'SAR'),
            'timezone': account_info.get('timezone', 'Asia/Riyadh'),
            'status': account_info.get('status', 'ENABLED'),
            'account_type': account_info.get('account_type', 'STANDARD')
        }
        
        account_id = db_manager.create_account(account_data)
        
        if not account_id:
            return jsonify({
                'success': False,
                'message': 'فشل في حفظ الحساب',
                'error_code': 'ACCOUNT_SAVE_ERROR'
            }), 500
        
        # مزامنة بيانات الحساب
        try:
            sync_result = google_ads_client.sync_account_data(customer_id)
            if sync_result:
                db_manager.update_account_sync_status(account_id, 'completed')
        except Exception as sync_error:
            logger.warning(f"فشل في مزامنة بيانات الحساب: {str(sync_error)}")
            db_manager.update_account_sync_status(account_id, 'failed')
        
        return jsonify({
            'success': True,
            'message': 'تم ربط الحساب بنجاح',
            'account_id': account_id,
            'account': account_data
        }), 201
        
    except Exception as e:
        logger.error(f"خطأ في ربط الحساب: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في ربط الحساب',
            'error_code': 'ACCOUNT_CONNECT_ERROR'
        }), 500

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@login_required
def get_account(account_id):
    """الحصول على تفاصيل حساب محدد"""
    try:
        user_id = session.get('user_id')
        
        # الحصول على الحساب
        account = db_manager.get_account_by_id(account_id, user_id)
        
        if not account:
            return jsonify({
                'success': False,
                'message': 'الحساب غير موجود',
                'error_code': 'ACCOUNT_NOT_FOUND'
            }), 404
        
        # الحصول على إحصائيات الأداء
        performance_data = db_manager.get_account_performance(account_id)
        
        # الحصول على الحملات النشطة
        active_campaigns = db_manager.get_account_campaigns(account_id, status='ENABLED')
        
        # تنسيق البيانات
        formatted_account = {
            'id': account['id'],
            'customer_id': account['customer_id'],
            'name': account['name'],
            'currency': account.get('currency', 'SAR'),
            'timezone': account.get('timezone', 'Asia/Riyadh'),
            'status': account['status'],
            'account_type': account.get('account_type', 'STANDARD'),
            'created_at': account.get('created_at'),
            'last_sync': account.get('last_sync'),
            'performance': {
                'total_campaigns': len(active_campaigns),
                'total_spend': format_currency(performance_data.get('total_spend', 0), account.get('currency', 'SAR')),
                'total_clicks': performance_data.get('total_clicks', 0),
                'total_impressions': performance_data.get('total_impressions', 0),
                'avg_ctr': format_percentage(performance_data.get('avg_ctr', 0)),
                'total_conversions': performance_data.get('total_conversions', 0),
                'avg_conversion_rate': format_percentage(performance_data.get('avg_conversion_rate', 0)),
                'avg_cpc': format_currency(performance_data.get('avg_cpc', 0), account.get('currency', 'SAR'))
            },
            'campaigns': active_campaigns[:5]  # أول 5 حملات
        }
        
        # حساب نقاط الأداء
        performance_score = calculate_performance_score({
            'ctr': performance_data.get('avg_ctr', 0),
            'conversion_rate': performance_data.get('avg_conversion_rate', 0),
            'quality_score': performance_data.get('avg_quality_score', 5),
            'roas': performance_data.get('avg_roas', 0)
        })
        
        formatted_account['performance_score'] = performance_score
        
        return jsonify({
            'success': True,
            'account': formatted_account
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحساب: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على الحساب',
            'error_code': 'ACCOUNT_FETCH_ERROR'
        }), 500

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@login_required
def update_account(account_id):
    """تحديث بيانات الحساب"""
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        # التحقق من وجود الحساب
        account = db_manager.get_account_by_id(account_id, user_id)
        if not account:
            return jsonify({
                'success': False,
                'message': 'الحساب غير موجود',
                'error_code': 'ACCOUNT_NOT_FOUND'
            }), 404
        
        # البيانات المسموح تحديثها
        allowed_fields = ['name']
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({
                'success': False,
                'message': 'لا توجد بيانات للتحديث',
                'error_code': 'NO_UPDATE_DATA'
            }), 400
        
        # تحديث الحساب
        success = db_manager.update_account(account_id, update_data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'فشل في تحديث الحساب',
                'error_code': 'ACCOUNT_UPDATE_FAILED'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'تم تحديث الحساب بنجاح'
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الحساب: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحديث الحساب',
            'error_code': 'ACCOUNT_UPDATE_ERROR'
        }), 500

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@login_required
def disconnect_account(account_id):
    """قطع ربط الحساب"""
    try:
        user_id = session.get('user_id')
        
        # التحقق من وجود الحساب
        account = db_manager.get_account_by_id(account_id, user_id)
        if not account:
            return jsonify({
                'success': False,
                'message': 'الحساب غير موجود',
                'error_code': 'ACCOUNT_NOT_FOUND'
            }), 404
        
        # قطع ربط الحساب
        success = db_manager.delete_account(account_id)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'فشل في قطع ربط الحساب',
                'error_code': 'ACCOUNT_DISCONNECT_FAILED'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'تم قطع ربط الحساب بنجاح'
        })
        
    except Exception as e:
        logger.error(f"خطأ في قطع ربط الحساب: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في قطع ربط الحساب',
            'error_code': 'ACCOUNT_DISCONNECT_ERROR'
        }), 500

@accounts_bp.route('/<int:account_id>/sync', methods=['POST'])
@login_required
def sync_account(account_id):
    """مزامنة بيانات الحساب مع Google Ads"""
    try:
        user_id = session.get('user_id')
        
        # التحقق من وجود الحساب
        account = db_manager.get_account_by_id(account_id, user_id)
        if not account:
            return jsonify({
                'success': False,
                'message': 'الحساب غير موجود',
                'error_code': 'ACCOUNT_NOT_FOUND'
            }), 404
        
        # بدء عملية المزامنة
        db_manager.update_account_sync_status(account_id, 'in_progress')
        
        try:
            # مزامنة البيانات
            sync_result = google_ads_client.sync_account_data(account['customer_id'])
            
            if sync_result:
                # تحديث البيانات في قاعدة البيانات
                db_manager.update_account_data(account_id, sync_result)
                db_manager.update_account_sync_status(account_id, 'completed')
                
                return jsonify({
                    'success': True,
                    'message': 'تم مزامنة البيانات بنجاح',
                    'sync_result': sync_result
                })
            else:
                db_manager.update_account_sync_status(account_id, 'failed')
                return jsonify({
                    'success': False,
                    'message': 'فشل في مزامنة البيانات',
                    'error_code': 'SYNC_FAILED'
                }), 500
                
        except Exception as sync_error:
            db_manager.update_account_sync_status(account_id, 'failed')
            logger.error(f"خطأ في مزامنة البيانات: {str(sync_error)}")
            return jsonify({
                'success': False,
                'message': 'حدث خطأ في مزامنة البيانات',
                'error_code': 'SYNC_ERROR'
            }), 500
        
    except Exception as e:
        logger.error(f"خطأ في مزامنة الحساب: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في مزامنة الحساب',
            'error_code': 'ACCOUNT_SYNC_ERROR'
        }), 500

@accounts_bp.route('/<int:account_id>/performance', methods=['GET'])
@login_required
def get_account_performance(account_id):
    """الحصول على تقرير أداء الحساب"""
    try:
        user_id = session.get('user_id')
        
        # معاملات التاريخ
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # التحقق من وجود الحساب
        account = db_manager.get_account_by_id(account_id, user_id)
        if not account:
            return jsonify({
                'success': False,
                'message': 'الحساب غير موجود',
                'error_code': 'ACCOUNT_NOT_FOUND'
            }), 404
        
        # الحصول على بيانات الأداء
        performance_data = db_manager.get_account_performance_report(
            account_id, start_date, end_date
        )
        
        return jsonify({
            'success': True,
            'performance': performance_data
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على تقرير الأداء: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على تقرير الأداء',
            'error_code': 'PERFORMANCE_REPORT_ERROR'
        }), 500

@accounts_bp.route('/mcc', methods=['GET'])
@login_required
def get_mcc_accounts():
    """الحصول على حسابات MCC"""
    try:
        user_id = session.get('user_id')
        
        # الحصول على حسابات MCC
        mcc_accounts = mcc_manager.get_mcc_accounts()
        
        return jsonify({
            'success': True,
            'mcc_accounts': mcc_accounts
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على حسابات MCC: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على حسابات MCC',
            'error_code': 'MCC_ACCOUNTS_ERROR'
        }), 500

@accounts_bp.route('/accessible', methods=['GET'])
@login_required
def get_accessible_accounts():
    """الحصول على الحسابات المتاحة للوصول"""
    try:
        # الحصول على الحسابات المتاحة من Google Ads
        accessible_accounts = google_ads_client.get_accessible_accounts()
        
        return jsonify({
            'success': True,
            'accounts': accessible_accounts
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحسابات المتاحة: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على الحسابات المتاحة',
            'error_code': 'ACCESSIBLE_ACCOUNTS_ERROR'
        }), 500

