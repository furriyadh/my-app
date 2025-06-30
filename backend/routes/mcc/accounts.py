"""
MCC Accounts Management API
إدارة حسابات MCC المتطورة

يوفر مسارات API شاملة لإدارة حسابات MCC بما في ذلك:
- إنشاء وإدارة الحسابات
- ربط وإلغاء ربط الحسابات
- مراقبة حالة الحسابات
- إدارة الميزانيات والحدود
- تتبع الأداء والإحصائيات
"""

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
mcc_accounts_bp = Blueprint('mcc_accounts', __name__)

# محاولة استيراد الخدمات المطلوبة
try:
    from services.mcc_manager import MCCManager
    from services.google_ads_client import GoogleAdsClient
    from utils.validators import validate_customer_id, validate_email, validate_account_data
    from utils.helpers import generate_unique_id, sanitize_text, format_currency
    from utils.database import DatabaseManager
    MCC_SERVICES_AVAILABLE = True
    logger.info("✅ تم تحميل خدمات MCC Accounts بنجاح")
except ImportError as e:
    MCC_SERVICES_AVAILABLE = False
    logger.warning(f"⚠️ لم يتم تحميل خدمات MCC Accounts: {e}")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=10)

class MCCAccountsManager:
    """مدير حسابات MCC المتطور"""
    
    def __init__(self):
        self.mcc_manager = MCCManager() if MCC_SERVICES_AVAILABLE else None
        self.google_ads_client = GoogleAdsClient() if MCC_SERVICES_AVAILABLE else None
        self.db_manager = DatabaseManager() if MCC_SERVICES_AVAILABLE else None
        
    async def get_all_accounts(self, user_id: str, filters: Dict = None) -> Dict[str, Any]:
        """الحصول على جميع حسابات MCC مع فلترة متقدمة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # تطبيق الفلاتر
            accounts = await self._fetch_accounts_with_filters(user_id, filters or {})
            
            # إضافة معلومات الأداء
            enriched_accounts = await self._enrich_accounts_with_performance(accounts)
            
            # تجميع الإحصائيات
            stats = self._calculate_accounts_statistics(enriched_accounts)
            
            return {
                'success': True,
                'accounts': enriched_accounts,
                'statistics': stats,
                'total_count': len(enriched_accounts),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على حسابات MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def create_account(self, user_id: str, account_data: Dict) -> Dict[str, Any]:
        """إنشاء حساب MCC جديد مع تكوين متقدم"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صحة البيانات
            validation_result = validate_account_data(account_data)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # إنشاء معرف فريد
            account_id = generate_unique_id('mcc_account')
            
            # إعداد بيانات الحساب
            processed_data = {
                'account_id': account_id,
                'user_id': user_id,
                'name': sanitize_text(account_data.get('name')),
                'description': sanitize_text(account_data.get('description', '')),
                'currency': account_data.get('currency', 'USD'),
                'timezone': account_data.get('timezone', 'UTC'),
                'budget_limit': account_data.get('budget_limit', 0),
                'status': 'active',
                'created_at': datetime.utcnow().isoformat(),
                'settings': account_data.get('settings', {}),
                'permissions': account_data.get('permissions', [])
            }
            
            # إنشاء الحساب في Google Ads
            google_ads_result = await self._create_google_ads_account(processed_data)
            if not google_ads_result['success']:
                return google_ads_result
            
            processed_data['google_ads_customer_id'] = google_ads_result['customer_id']
            
            # حفظ في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_account_to_database(processed_data)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ الحساب في قاعدة البيانات: {db_result['error']}")
            
            # إعداد الصلاحيات الافتراضية
            await self._setup_default_permissions(account_id, user_id)
            
            # إرسال إشعار
            await self._send_account_creation_notification(user_id, processed_data)
            
            return {
                'success': True,
                'account': processed_data,
                'message': 'تم إنشاء حساب MCC بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء حساب MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def update_account(self, account_id: str, user_id: str, update_data: Dict) -> Dict[str, Any]:
        """تحديث حساب MCC مع التحقق من الصلاحيات"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من وجود الحساب والصلاحيات
            account = await self._get_account_by_id(account_id)
            if not account:
                return {'success': False, 'error': 'الحساب غير موجود'}
            
            if not await self._check_account_permissions(account_id, user_id, 'edit'):
                return {'success': False, 'error': 'ليس لديك صلاحية لتعديل هذا الحساب'}
            
            # التحقق من صحة البيانات المحدثة
            validation_result = validate_account_data(update_data, partial=True)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # معالجة البيانات المحدثة
            processed_updates = {}
            for key, value in update_data.items():
                if key in ['name', 'description']:
                    processed_updates[key] = sanitize_text(value)
                elif key in ['currency', 'timezone', 'budget_limit', 'status']:
                    processed_updates[key] = value
                elif key == 'settings':
                    processed_updates[key] = {**account.get('settings', {}), **value}
            
            processed_updates['updated_at'] = datetime.utcnow().isoformat()
            processed_updates['updated_by'] = user_id
            
            # تحديث في Google Ads
            if 'name' in processed_updates or 'currency' in processed_updates:
                google_ads_result = await self._update_google_ads_account(
                    account['google_ads_customer_id'], 
                    processed_updates
                )
                if not google_ads_result['success']:
                    return google_ads_result
            
            # تحديث في قاعدة البيانات
            if self.db_manager:
                db_result = await self._update_account_in_database(account_id, processed_updates)
                if not db_result['success']:
                    logger.warning(f"فشل تحديث الحساب في قاعدة البيانات: {db_result['error']}")
            
            # دمج البيانات المحدثة
            updated_account = {**account, **processed_updates}
            
            # تسجيل التغيير
            await self._log_account_change(account_id, user_id, 'update', processed_updates)
            
            return {
                'success': True,
                'account': updated_account,
                'message': 'تم تحديث الحساب بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحديث حساب MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def delete_account(self, account_id: str, user_id: str) -> Dict[str, Any]:
        """حذف حساب MCC مع التحقق من الأمان"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من وجود الحساب والصلاحيات
            account = await self._get_account_by_id(account_id)
            if not account:
                return {'success': False, 'error': 'الحساب غير موجود'}
            
            if not await self._check_account_permissions(account_id, user_id, 'delete'):
                return {'success': False, 'error': 'ليس لديك صلاحية لحذف هذا الحساب'}
            
            # التحقق من وجود حملات نشطة
            active_campaigns = await self._check_active_campaigns(account_id)
            if active_campaigns['count'] > 0:
                return {
                    'success': False, 
                    'error': f'لا يمكن حذف الحساب لوجود {active_campaigns["count"]} حملة نشطة'
                }
            
            # إيقاف الحساب أولاً
            await self._deactivate_account(account_id)
            
            # حذف من Google Ads (إيقاف فقط)
            google_ads_result = await self._suspend_google_ads_account(account['google_ads_customer_id'])
            if not google_ads_result['success']:
                logger.warning(f"فشل إيقاف الحساب في Google Ads: {google_ads_result['error']}")
            
            # وضع علامة حذف في قاعدة البيانات (soft delete)
            if self.db_manager:
                db_result = await self._soft_delete_account_in_database(account_id, user_id)
                if not db_result['success']:
                    logger.warning(f"فشل حذف الحساب من قاعدة البيانات: {db_result['error']}")
            
            # تسجيل الحذف
            await self._log_account_change(account_id, user_id, 'delete', {'reason': 'user_request'})
            
            # إرسال إشعار
            await self._send_account_deletion_notification(user_id, account)
            
            return {
                'success': True,
                'message': 'تم حذف الحساب بنجاح',
                'account_id': account_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في حذف حساب MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة خاصة
    async def _fetch_accounts_with_filters(self, user_id: str, filters: Dict) -> List[Dict]:
        """جلب الحسابات مع تطبيق الفلاتر"""
        # تنفيذ منطق الفلترة المتقدم
        return []
    
    async def _enrich_accounts_with_performance(self, accounts: List[Dict]) -> List[Dict]:
        """إضافة معلومات الأداء للحسابات"""
        # تنفيذ منطق إضافة معلومات الأداء
        return accounts
    
    def _calculate_accounts_statistics(self, accounts: List[Dict]) -> Dict:
        """حساب إحصائيات الحسابات"""
        return {
            'total_accounts': len(accounts),
            'active_accounts': len([a for a in accounts if a.get('status') == 'active']),
            'total_budget': sum(a.get('budget_limit', 0) for a in accounts),
            'average_performance': 0.0
        }
    
    async def _create_google_ads_account(self, account_data: Dict) -> Dict[str, Any]:
        """إنشاء حساب في Google Ads"""
        # تنفيذ منطق إنشاء الحساب في Google Ads
        return {'success': True, 'customer_id': f"123-456-{generate_unique_id('customer')[:4]}"}
    
    async def _save_account_to_database(self, account_data: Dict) -> Dict[str, Any]:
        """حفظ الحساب في قاعدة البيانات"""
        # تنفيذ منطق حفظ قاعدة البيانات
        return {'success': True}
    
    async def _setup_default_permissions(self, account_id: str, user_id: str):
        """إعداد الصلاحيات الافتراضية"""
        # تنفيذ منطق إعداد الصلاحيات
        pass
    
    async def _send_account_creation_notification(self, user_id: str, account_data: Dict):
        """إرسال إشعار إنشاء الحساب"""
        # تنفيذ منطق الإشعارات
        pass
    
    async def _get_account_by_id(self, account_id: str) -> Optional[Dict]:
        """الحصول على حساب بالمعرف"""
        # تنفيذ منطق البحث عن الحساب
        return None
    
    async def _check_account_permissions(self, account_id: str, user_id: str, action: str) -> bool:
        """التحقق من صلاحيات الحساب"""
        # تنفيذ منطق التحقق من الصلاحيات
        return True
    
    async def _update_google_ads_account(self, customer_id: str, updates: Dict) -> Dict[str, Any]:
        """تحديث حساب Google Ads"""
        # تنفيذ منطق التحديث في Google Ads
        return {'success': True}
    
    async def _update_account_in_database(self, account_id: str, updates: Dict) -> Dict[str, Any]:
        """تحديث الحساب في قاعدة البيانات"""
        # تنفيذ منطق تحديث قاعدة البيانات
        return {'success': True}
    
    async def _log_account_change(self, account_id: str, user_id: str, action: str, data: Dict):
        """تسجيل تغييرات الحساب"""
        # تنفيذ منطق تسجيل التغييرات
        pass
    
    async def _check_active_campaigns(self, account_id: str) -> Dict:
        """فحص الحملات النشطة"""
        # تنفيذ منطق فحص الحملات
        return {'count': 0, 'campaigns': []}
    
    async def _deactivate_account(self, account_id: str):
        """إيقاف الحساب"""
        # تنفيذ منطق إيقاف الحساب
        pass
    
    async def _suspend_google_ads_account(self, customer_id: str) -> Dict[str, Any]:
        """إيقاف حساب Google Ads"""
        # تنفيذ منطق الإيقاف في Google Ads
        return {'success': True}
    
    async def _soft_delete_account_in_database(self, account_id: str, user_id: str) -> Dict[str, Any]:
        """حذف ناعم من قاعدة البيانات"""
        # تنفيذ منطق الحذف الناعم
        return {'success': True}
    
    async def _send_account_deletion_notification(self, user_id: str, account: Dict):
        """إرسال إشعار حذف الحساب"""
        # تنفيذ منطق إشعار الحذف
        pass

# إنشاء مثيل المدير
accounts_manager = MCCAccountsManager()

# ===========================================
# مسارات API
# ===========================================

@mcc_accounts_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة إدارة حسابات MCC"""
    try:
        return jsonify({
            'success': True,
            'service': 'MCC Accounts Management',
            'status': 'healthy' if MCC_SERVICES_AVAILABLE else 'limited',
            'available_features': {
                'account_creation': MCC_SERVICES_AVAILABLE,
                'account_management': MCC_SERVICES_AVAILABLE,
                'performance_tracking': MCC_SERVICES_AVAILABLE,
                'permissions_management': MCC_SERVICES_AVAILABLE
            },
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'خدمة إدارة حسابات MCC تعمل بنجاح'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة MCC Accounts: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في فحص الصحة',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/', methods=['GET'])
@jwt_required()
def get_accounts():
    """الحصول على جميع حسابات MCC للمستخدم"""
    try:
        user_id = get_jwt_identity()
        
        # استخراج معاملات الفلترة
        filters = {
            'status': request.args.get('status'),
            'currency': request.args.get('currency'),
            'min_budget': request.args.get('min_budget', type=float),
            'max_budget': request.args.get('max_budget', type=float),
            'created_after': request.args.get('created_after'),
            'created_before': request.args.get('created_before'),
            'search': request.args.get('search'),
            'sort_by': request.args.get('sort_by', 'created_at'),
            'sort_order': request.args.get('sort_order', 'desc'),
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int)
        }
        
        # إزالة القيم الفارغة
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(accounts_manager.get_all_accounts(user_id, filters))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على حسابات MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على الحسابات',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/', methods=['POST'])
@jwt_required()
def create_account():
    """إنشاء حساب MCC جديد"""
    try:
        user_id = get_jwt_identity()
        account_data = request.get_json()
        
        if not account_data:
            return jsonify({
                'success': False,
                'error': 'بيانات الحساب مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['name', 'currency']
        missing_fields = [field for field in required_fields if not account_data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(accounts_manager.create_account(user_id, account_data))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إنشاء الحساب',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    """الحصول على تفاصيل حساب MCC محدد"""
    try:
        user_id = get_jwt_identity()
        
        # التحقق من صحة معرف الحساب
        if not account_id:
            return jsonify({
                'success': False,
                'error': 'معرف الحساب مطلوب'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        account = loop.run_until_complete(accounts_manager._get_account_by_id(account_id))
        loop.close()
        
        if not account:
            return jsonify({
                'success': False,
                'error': 'الحساب غير موجود'
            }), 404
        
        # التحقق من الصلاحيات
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        has_permission = loop.run_until_complete(
            accounts_manager._check_account_permissions(account_id, user_id, 'view')
        )
        loop.close()
        
        if not has_permission:
            return jsonify({
                'success': False,
                'error': 'ليس لديك صلاحية لعرض هذا الحساب'
            }), 403
        
        return jsonify({
            'success': True,
            'account': account,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على الحساب',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    """تحديث حساب MCC"""
    try:
        user_id = get_jwt_identity()
        update_data = request.get_json()
        
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'بيانات التحديث مطلوبة'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(accounts_manager.update_account(account_id, user_id, update_data))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تحديث حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تحديث الحساب',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    """حذف حساب MCC"""
    try:
        user_id = get_jwt_identity()
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(accounts_manager.delete_account(account_id, user_id))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في حذف حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في حذف الحساب',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>/performance', methods=['GET'])
@jwt_required()
def get_account_performance(account_id):
    """الحصول على إحصائيات أداء حساب MCC"""
    try:
        user_id = get_jwt_identity()
        
        # معاملات التاريخ
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        metrics = request.args.getlist('metrics') or ['impressions', 'clicks', 'cost', 'conversions']
        
        # التحقق من الصلاحيات
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        has_permission = loop.run_until_complete(
            accounts_manager._check_account_permissions(account_id, user_id, 'view')
        )
        loop.close()
        
        if not has_permission:
            return jsonify({
                'success': False,
                'error': 'ليس لديك صلاحية لعرض أداء هذا الحساب'
            }), 403
        
        # جلب بيانات الأداء (محاكاة)
        performance_data = {
            'account_id': account_id,
            'period': {
                'start_date': start_date or (datetime.utcnow() - timedelta(days=30)).date().isoformat(),
                'end_date': end_date or datetime.utcnow().date().isoformat()
            },
            'metrics': {
                'impressions': 125000,
                'clicks': 3500,
                'cost': 1250.75,
                'conversions': 85,
                'ctr': 2.8,
                'cpc': 0.36,
                'conversion_rate': 2.43
            },
            'trends': {
                'impressions_change': 12.5,
                'clicks_change': 8.3,
                'cost_change': -5.2,
                'conversions_change': 15.7
            },
            'top_campaigns': [
                {'name': 'حملة البحث الرئيسية', 'cost': 450.25, 'conversions': 32},
                {'name': 'حملة الشبكة الإعلانية', 'cost': 380.50, 'conversions': 28},
                {'name': 'حملة التسوق', 'cost': 420.00, 'conversions': 25}
            ]
        }
        
        return jsonify({
            'success': True,
            'performance': performance_data,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على أداء حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على بيانات الأداء',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>/link', methods=['POST'])
@jwt_required()
def link_account(account_id):
    """ربط حساب فرعي بحساب MCC"""
    try:
        user_id = get_jwt_identity()
        link_data = request.get_json()
        
        if not link_data or not link_data.get('child_customer_id'):
            return jsonify({
                'success': False,
                'error': 'معرف الحساب الفرعي مطلوب'
            }), 400
        
        child_customer_id = link_data['child_customer_id']
        
        # التحقق من الصلاحيات
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        has_permission = loop.run_until_complete(
            accounts_manager._check_account_permissions(account_id, user_id, 'manage')
        )
        loop.close()
        
        if not has_permission:
            return jsonify({
                'success': False,
                'error': 'ليس لديك صلاحية لإدارة هذا الحساب'
            }), 403
        
        # محاكاة عملية الربط
        link_result = {
            'success': True,
            'link_id': generate_unique_id('link'),
            'parent_account_id': account_id,
            'child_customer_id': child_customer_id,
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'message': 'تم إرسال طلب ربط الحساب بنجاح'
        }
        
        return jsonify(link_result), 201
        
    except Exception as e:
        logger.error(f"خطأ في ربط حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في ربط الحساب',
            'message': str(e)
        }), 500

@mcc_accounts_bp.route('/<account_id>/unlink/<child_customer_id>', methods=['DELETE'])
@jwt_required()
def unlink_account(account_id, child_customer_id):
    """إلغاء ربط حساب فرعي من حساب MCC"""
    try:
        user_id = get_jwt_identity()
        
        # التحقق من الصلاحيات
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        has_permission = loop.run_until_complete(
            accounts_manager._check_account_permissions(account_id, user_id, 'manage')
        )
        loop.close()
        
        if not has_permission:
            return jsonify({
                'success': False,
                'error': 'ليس لديك صلاحية لإدارة هذا الحساب'
            }), 403
        
        # محاكاة عملية إلغاء الربط
        unlink_result = {
            'success': True,
            'parent_account_id': account_id,
            'child_customer_id': child_customer_id,
            'unlinked_at': datetime.utcnow().isoformat(),
            'message': 'تم إلغاء ربط الحساب بنجاح'
        }
        
        return jsonify(unlink_result)
        
    except Exception as e:
        logger.error(f"خطأ في إلغاء ربط حساب MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إلغاء ربط الحساب',
            'message': str(e)
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل MCC Accounts Blueprint - الخدمات متاحة: {MCC_SERVICES_AVAILABLE}")

# تصدير Blueprint
__all__ = ['mcc_accounts_bp']

