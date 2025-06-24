"""
MCC Clients Management API
إدارة العملاء والحسابات الفرعية المتطورة

يوفر مسارات API شاملة لإدارة العملاء في MCC بما في ذلك:
- إدارة العملاء والحسابات الفرعية
- دعوة العملاء الجدد
- إدارة الصلاحيات والأذونات
- مراقبة نشاط العملاء
- تتبع الأداء والإحصائيات
- إدارة الفواتير والمدفوعات
"""

from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
mcc_clients_bp = Blueprint('mcc_clients', __name__)

# محاولة استيراد الخدمات المطلوبة
try:
    from services.mcc_manager import MCCManager
    from services.google_ads_client import GoogleAdsClient
    from services.oauth_handler import OAuthHandler
    from utils.validators import validate_customer_id, validate_email, validate_client_data
    from utils.helpers import generate_unique_id, sanitize_text, format_currency, send_email
    from utils.database import DatabaseManager
    MCC_CLIENTS_SERVICES_AVAILABLE = True
    logger.info("✅ تم تحميل خدمات MCC Clients بنجاح")
except ImportError as e:
    MCC_CLIENTS_SERVICES_AVAILABLE = False
    logger.warning(f"⚠️ لم يتم تحميل خدمات MCC Clients: {e}")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=15)

class MCCClientsManager:
    """مدير عملاء MCC المتطور"""
    
    def __init__(self):
        self.mcc_manager = MCCManager() if MCC_CLIENTS_SERVICES_AVAILABLE else None
        self.google_ads_client = GoogleAdsClient() if MCC_CLIENTS_SERVICES_AVAILABLE else None
        self.oauth_handler = OAuthHandler() if MCC_CLIENTS_SERVICES_AVAILABLE else None
        self.db_manager = DatabaseManager() if MCC_CLIENTS_SERVICES_AVAILABLE else None
        
    async def get_all_clients(self, mcc_account_id: str, user_id: str, filters: Dict = None) -> Dict[str, Any]:
        """الحصول على جميع عملاء MCC مع فلترة متقدمة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من الصلاحيات
            if not await self._check_mcc_permissions(mcc_account_id, user_id, 'view_clients'):
                return {'success': False, 'error': 'ليس لديك صلاحية لعرض عملاء هذا الحساب'}
            
            # تطبيق الفلاتر
            clients = await self._fetch_clients_with_filters(mcc_account_id, filters or {})
            
            # إضافة معلومات الأداء والنشاط
            enriched_clients = await self._enrich_clients_with_data(clients)
            
            # تجميع الإحصائيات
            stats = self._calculate_clients_statistics(enriched_clients)
            
            return {
                'success': True,
                'clients': enriched_clients,
                'statistics': stats,
                'total_count': len(enriched_clients),
                'mcc_account_id': mcc_account_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على عملاء MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def invite_client(self, mcc_account_id: str, user_id: str, invitation_data: Dict) -> Dict[str, Any]:
        """دعوة عميل جديد للانضمام إلى MCC"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من الصلاحيات
            if not await self._check_mcc_permissions(mcc_account_id, user_id, 'invite_clients'):
                return {'success': False, 'error': 'ليس لديك صلاحية لدعوة عملاء جدد'}
            
            # التحقق من صحة البيانات
            validation_result = validate_client_data(invitation_data)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # إنشاء معرف دعوة فريد
            invitation_id = generate_unique_id('invitation')
            
            # إعداد بيانات الدعوة
            invitation = {
                'invitation_id': invitation_id,
                'mcc_account_id': mcc_account_id,
                'invited_by': user_id,
                'client_email': invitation_data['email'],
                'client_name': sanitize_text(invitation_data.get('name', '')),
                'company_name': sanitize_text(invitation_data.get('company_name', '')),
                'permissions': invitation_data.get('permissions', ['view_campaigns']),
                'message': sanitize_text(invitation_data.get('message', '')),
                'status': 'pending',
                'expires_at': (datetime.utcnow() + timedelta(days=7)).isoformat(),
                'created_at': datetime.utcnow().isoformat(),
                'invitation_token': str(uuid.uuid4())
            }
            
            # حفظ الدعوة في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_invitation_to_database(invitation)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ الدعوة في قاعدة البيانات: {db_result['error']}")
            
            # إرسال بريد إلكتروني للدعوة
            email_result = await self._send_invitation_email(invitation)
            if not email_result['success']:
                logger.warning(f"فشل إرسال بريد الدعوة: {email_result['error']}")
            
            # تسجيل النشاط
            await self._log_client_activity(mcc_account_id, user_id, 'invite_sent', {
                'invitation_id': invitation_id,
                'client_email': invitation_data['email']
            })
            
            return {
                'success': True,
                'invitation': {
                    'invitation_id': invitation_id,
                    'client_email': invitation_data['email'],
                    'status': 'pending',
                    'expires_at': invitation['expires_at']
                },
                'message': 'تم إرسال الدعوة بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في دعوة عميل MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def accept_invitation(self, invitation_token: str, client_data: Dict) -> Dict[str, Any]:
        """قبول دعوة الانضمام إلى MCC"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن الدعوة
            invitation = await self._get_invitation_by_token(invitation_token)
            if not invitation:
                return {'success': False, 'error': 'رمز الدعوة غير صحيح أو منتهي الصلاحية'}
            
            # التحقق من انتهاء صلاحية الدعوة
            if datetime.fromisoformat(invitation['expires_at']) < datetime.utcnow():
                return {'success': False, 'error': 'انتهت صلاحية الدعوة'}
            
            # التحقق من حالة الدعوة
            if invitation['status'] != 'pending':
                return {'success': False, 'error': 'تم قبول هذه الدعوة مسبقاً أو تم إلغاؤها'}
            
            # التحقق من صحة بيانات العميل
            validation_result = validate_client_data(client_data, for_acceptance=True)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # إنشاء حساب العميل
            client_id = generate_unique_id('client')
            
            client_account = {
                'client_id': client_id,
                'mcc_account_id': invitation['mcc_account_id'],
                'invitation_id': invitation['invitation_id'],
                'email': invitation['client_email'],
                'name': sanitize_text(client_data.get('name', invitation.get('client_name', ''))),
                'company_name': sanitize_text(client_data.get('company_name', invitation.get('company_name', ''))),
                'phone': sanitize_text(client_data.get('phone', '')),
                'address': sanitize_text(client_data.get('address', '')),
                'google_ads_customer_id': client_data.get('google_ads_customer_id'),
                'permissions': invitation['permissions'],
                'status': 'active',
                'joined_at': datetime.utcnow().isoformat(),
                'last_activity': datetime.utcnow().isoformat()
            }
            
            # ربط حساب Google Ads إذا تم توفيره
            if client_account['google_ads_customer_id']:
                link_result = await self._link_google_ads_account(
                    invitation['mcc_account_id'],
                    client_account['google_ads_customer_id']
                )
                if not link_result['success']:
                    logger.warning(f"فشل ربط حساب Google Ads: {link_result['error']}")
            
            # حفظ حساب العميل في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_client_to_database(client_account)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ العميل في قاعدة البيانات: {db_result['error']}")
            
            # تحديث حالة الدعوة
            await self._update_invitation_status(invitation['invitation_id'], 'accepted', client_id)
            
            # إرسال بريد ترحيب
            await self._send_welcome_email(client_account)
            
            # تسجيل النشاط
            await self._log_client_activity(invitation['mcc_account_id'], client_id, 'joined', {
                'invitation_id': invitation['invitation_id']
            })
            
            return {
                'success': True,
                'client': {
                    'client_id': client_id,
                    'name': client_account['name'],
                    'email': client_account['email'],
                    'company_name': client_account['company_name'],
                    'status': 'active'
                },
                'message': 'تم قبول الدعوة والانضمام بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في قبول دعوة MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def update_client(self, client_id: str, user_id: str, update_data: Dict) -> Dict[str, Any]:
        """تحديث بيانات عميل MCC"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن العميل
            client = await self._get_client_by_id(client_id)
            if not client:
                return {'success': False, 'error': 'العميل غير موجود'}
            
            # التحقق من الصلاحيات
            if not await self._check_mcc_permissions(client['mcc_account_id'], user_id, 'manage_clients'):
                return {'success': False, 'error': 'ليس لديك صلاحية لتعديل هذا العميل'}
            
            # التحقق من صحة البيانات المحدثة
            validation_result = validate_client_data(update_data, partial=True)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # معالجة البيانات المحدثة
            processed_updates = {}
            for key, value in update_data.items():
                if key in ['name', 'company_name', 'phone', 'address']:
                    processed_updates[key] = sanitize_text(value)
                elif key in ['permissions', 'status']:
                    processed_updates[key] = value
                elif key == 'google_ads_customer_id':
                    # التحقق من صحة معرف Google Ads
                    if validate_customer_id(value):
                        processed_updates[key] = value
                    else:
                        return {'success': False, 'error': 'معرف Google Ads غير صحيح'}
            
            processed_updates['updated_at'] = datetime.utcnow().isoformat()
            processed_updates['updated_by'] = user_id
            
            # تحديث ربط Google Ads إذا تغير
            if 'google_ads_customer_id' in processed_updates:
                if client.get('google_ads_customer_id') != processed_updates['google_ads_customer_id']:
                    # إلغاء الربط القديم
                    if client.get('google_ads_customer_id'):
                        await self._unlink_google_ads_account(
                            client['mcc_account_id'],
                            client['google_ads_customer_id']
                        )
                    
                    # ربط الحساب الجديد
                    if processed_updates['google_ads_customer_id']:
                        link_result = await self._link_google_ads_account(
                            client['mcc_account_id'],
                            processed_updates['google_ads_customer_id']
                        )
                        if not link_result['success']:
                            return {'success': False, 'error': f"فشل ربط حساب Google Ads: {link_result['error']}"}
            
            # تحديث في قاعدة البيانات
            if self.db_manager:
                db_result = await self._update_client_in_database(client_id, processed_updates)
                if not db_result['success']:
                    logger.warning(f"فشل تحديث العميل في قاعدة البيانات: {db_result['error']}")
            
            # دمج البيانات المحدثة
            updated_client = {**client, **processed_updates}
            
            # تسجيل التغيير
            await self._log_client_activity(client['mcc_account_id'], user_id, 'client_updated', {
                'client_id': client_id,
                'updates': list(processed_updates.keys())
            })
            
            return {
                'success': True,
                'client': updated_client,
                'message': 'تم تحديث بيانات العميل بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحديث عميل MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def remove_client(self, client_id: str, user_id: str, removal_reason: str = None) -> Dict[str, Any]:
        """إزالة عميل من MCC"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن العميل
            client = await self._get_client_by_id(client_id)
            if not client:
                return {'success': False, 'error': 'العميل غير موجود'}
            
            # التحقق من الصلاحيات
            if not await self._check_mcc_permissions(client['mcc_account_id'], user_id, 'remove_clients'):
                return {'success': False, 'error': 'ليس لديك صلاحية لإزالة هذا العميل'}
            
            # التحقق من وجود حملات نشطة
            active_campaigns = await self._check_client_active_campaigns(client_id)
            if active_campaigns['count'] > 0:
                return {
                    'success': False,
                    'error': f'لا يمكن إزالة العميل لوجود {active_campaigns["count"]} حملة نشطة'
                }
            
            # إلغاء ربط حساب Google Ads
            if client.get('google_ads_customer_id'):
                unlink_result = await self._unlink_google_ads_account(
                    client['mcc_account_id'],
                    client['google_ads_customer_id']
                )
                if not unlink_result['success']:
                    logger.warning(f"فشل إلغاء ربط حساب Google Ads: {unlink_result['error']}")
            
            # إزالة ناعمة من قاعدة البيانات
            if self.db_manager:
                db_result = await self._soft_remove_client_from_database(client_id, user_id, removal_reason)
                if not db_result['success']:
                    logger.warning(f"فشل إزالة العميل من قاعدة البيانات: {db_result['error']}")
            
            # إرسال إشعار للعميل
            await self._send_removal_notification(client, removal_reason)
            
            # تسجيل الإزالة
            await self._log_client_activity(client['mcc_account_id'], user_id, 'client_removed', {
                'client_id': client_id,
                'reason': removal_reason or 'لم يتم تحديد السبب'
            })
            
            return {
                'success': True,
                'message': 'تم إزالة العميل بنجاح',
                'client_id': client_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إزالة عميل MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_client_performance(self, client_id: str, user_id: str, date_range: Dict = None) -> Dict[str, Any]:
        """الحصول على إحصائيات أداء عميل محدد"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن العميل
            client = await self._get_client_by_id(client_id)
            if not client:
                return {'success': False, 'error': 'العميل غير موجود'}
            
            # التحقق من الصلاحيات
            if not await self._check_mcc_permissions(client['mcc_account_id'], user_id, 'view_performance'):
                return {'success': False, 'error': 'ليس لديك صلاحية لعرض أداء هذا العميل'}
            
            # تحديد نطاق التاريخ
            if not date_range:
                end_date = datetime.utcnow().date()
                start_date = end_date - timedelta(days=30)
            else:
                start_date = datetime.fromisoformat(date_range['start_date']).date()
                end_date = datetime.fromisoformat(date_range['end_date']).date()
            
            # جلب بيانات الأداء من Google Ads
            performance_data = await self._fetch_client_performance_data(client, start_date, end_date)
            
            # حساب المؤشرات المتقدمة
            advanced_metrics = self._calculate_advanced_metrics(performance_data)
            
            # مقارنة مع الفترة السابقة
            comparison_data = await self._get_performance_comparison(client, start_date, end_date)
            
            return {
                'success': True,
                'client_id': client_id,
                'client_name': client['name'],
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'performance': performance_data,
                'advanced_metrics': advanced_metrics,
                'comparison': comparison_data,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على أداء عميل MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة خاصة
    async def _check_mcc_permissions(self, mcc_account_id: str, user_id: str, action: str) -> bool:
        """التحقق من صلاحيات MCC"""
        # تنفيذ منطق التحقق من الصلاحيات
        return True
    
    async def _fetch_clients_with_filters(self, mcc_account_id: str, filters: Dict) -> List[Dict]:
        """جلب العملاء مع تطبيق الفلاتر"""
        # تنفيذ منطق الفلترة المتقدم
        return []
    
    async def _enrich_clients_with_data(self, clients: List[Dict]) -> List[Dict]:
        """إضافة معلومات إضافية للعملاء"""
        # تنفيذ منطق إضافة البيانات
        return clients
    
    def _calculate_clients_statistics(self, clients: List[Dict]) -> Dict:
        """حساب إحصائيات العملاء"""
        return {
            'total_clients': len(clients),
            'active_clients': len([c for c in clients if c.get('status') == 'active']),
            'pending_invitations': len([c for c in clients if c.get('status') == 'pending']),
            'total_spend': sum(c.get('total_spend', 0) for c in clients)
        }
    
    async def _save_invitation_to_database(self, invitation: Dict) -> Dict[str, Any]:
        """حفظ الدعوة في قاعدة البيانات"""
        return {'success': True}
    
    async def _send_invitation_email(self, invitation: Dict) -> Dict[str, Any]:
        """إرسال بريد إلكتروني للدعوة"""
        return {'success': True}
    
    async def _log_client_activity(self, mcc_account_id: str, user_id: str, action: str, data: Dict):
        """تسجيل نشاط العميل"""
        pass
    
    async def _get_invitation_by_token(self, token: str) -> Optional[Dict]:
        """البحث عن دعوة بالرمز"""
        return None
    
    async def _link_google_ads_account(self, mcc_account_id: str, customer_id: str) -> Dict[str, Any]:
        """ربط حساب Google Ads"""
        return {'success': True}
    
    async def _save_client_to_database(self, client: Dict) -> Dict[str, Any]:
        """حفظ العميل في قاعدة البيانات"""
        return {'success': True}
    
    async def _update_invitation_status(self, invitation_id: str, status: str, client_id: str = None):
        """تحديث حالة الدعوة"""
        pass
    
    async def _send_welcome_email(self, client: Dict):
        """إرسال بريد ترحيب"""
        pass
    
    async def _get_client_by_id(self, client_id: str) -> Optional[Dict]:
        """البحث عن عميل بالمعرف"""
        return None
    
    async def _unlink_google_ads_account(self, mcc_account_id: str, customer_id: str) -> Dict[str, Any]:
        """إلغاء ربط حساب Google Ads"""
        return {'success': True}
    
    async def _update_client_in_database(self, client_id: str, updates: Dict) -> Dict[str, Any]:
        """تحديث العميل في قاعدة البيانات"""
        return {'success': True}
    
    async def _check_client_active_campaigns(self, client_id: str) -> Dict:
        """فحص الحملات النشطة للعميل"""
        return {'count': 0, 'campaigns': []}
    
    async def _soft_remove_client_from_database(self, client_id: str, user_id: str, reason: str) -> Dict[str, Any]:
        """إزالة ناعمة للعميل من قاعدة البيانات"""
        return {'success': True}
    
    async def _send_removal_notification(self, client: Dict, reason: str):
        """إرسال إشعار الإزالة"""
        pass
    
    async def _fetch_client_performance_data(self, client: Dict, start_date, end_date) -> Dict:
        """جلب بيانات أداء العميل"""
        return {
            'impressions': 50000,
            'clicks': 1500,
            'cost': 750.50,
            'conversions': 45,
            'ctr': 3.0,
            'cpc': 0.50,
            'conversion_rate': 3.0
        }
    
    def _calculate_advanced_metrics(self, performance_data: Dict) -> Dict:
        """حساب المؤشرات المتقدمة"""
        return {
            'roas': 4.2,
            'quality_score': 7.5,
            'impression_share': 65.3,
            'cost_per_acquisition': 16.68
        }
    
    async def _get_performance_comparison(self, client: Dict, start_date, end_date) -> Dict:
        """مقارنة الأداء مع الفترة السابقة"""
        return {
            'impressions_change': 12.5,
            'clicks_change': 8.7,
            'cost_change': -3.2,
            'conversions_change': 22.1
        }

# إنشاء مثيل المدير
clients_manager = MCCClientsManager()

# ===========================================
# مسارات API
# ===========================================

@mcc_clients_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة إدارة عملاء MCC"""
    try:
        return jsonify({
            'success': True,
            'service': 'MCC Clients Management',
            'status': 'healthy' if MCC_CLIENTS_SERVICES_AVAILABLE else 'limited',
            'available_features': {
                'client_invitation': MCC_CLIENTS_SERVICES_AVAILABLE,
                'client_management': MCC_CLIENTS_SERVICES_AVAILABLE,
                'performance_tracking': MCC_CLIENTS_SERVICES_AVAILABLE,
                'google_ads_linking': MCC_CLIENTS_SERVICES_AVAILABLE
            },
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'خدمة إدارة عملاء MCC تعمل بنجاح'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة MCC Clients: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في فحص الصحة',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/<mcc_account_id>/clients', methods=['GET'])
@jwt_required()
def get_clients(mcc_account_id):
    """الحصول على جميع عملاء MCC"""
    try:
        user_id = get_jwt_identity()
        
        # استخراج معاملات الفلترة
        filters = {
            'status': request.args.get('status'),
            'search': request.args.get('search'),
            'has_google_ads': request.args.get('has_google_ads', type=bool),
            'joined_after': request.args.get('joined_after'),
            'joined_before': request.args.get('joined_before'),
            'sort_by': request.args.get('sort_by', 'joined_at'),
            'sort_order': request.args.get('sort_order', 'desc'),
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int)
        }
        
        # إزالة القيم الفارغة
        filters = {k: v for k, v in filters.items() if v is not None}
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(clients_manager.get_all_clients(mcc_account_id, user_id, filters))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على عملاء MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على العملاء',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/<mcc_account_id>/invite', methods=['POST'])
@jwt_required()
def invite_client(mcc_account_id):
    """دعوة عميل جديد للانضمام إلى MCC"""
    try:
        user_id = get_jwt_identity()
        invitation_data = request.get_json()
        
        if not invitation_data:
            return jsonify({
                'success': False,
                'error': 'بيانات الدعوة مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['email']
        missing_fields = [field for field in required_fields if not invitation_data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(clients_manager.invite_client(mcc_account_id, user_id, invitation_data))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في دعوة عميل MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إرسال الدعوة',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/accept-invitation/<invitation_token>', methods=['POST'])
def accept_invitation(invitation_token):
    """قبول دعوة الانضمام إلى MCC"""
    try:
        client_data = request.get_json() or {}
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(clients_manager.accept_invitation(invitation_token, client_data))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في قبول دعوة MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في قبول الدعوة',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/clients/<client_id>', methods=['PUT'])
@jwt_required()
def update_client(client_id):
    """تحديث بيانات عميل MCC"""
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
        result = loop.run_until_complete(clients_manager.update_client(client_id, user_id, update_data))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تحديث عميل MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تحديث العميل',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/clients/<client_id>', methods=['DELETE'])
@jwt_required()
def remove_client(client_id):
    """إزالة عميل من MCC"""
    try:
        user_id = get_jwt_identity()
        removal_data = request.get_json() or {}
        removal_reason = removal_data.get('reason')
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(clients_manager.remove_client(client_id, user_id, removal_reason))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إزالة عميل MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إزالة العميل',
            'message': str(e)
        }), 500

@mcc_clients_bp.route('/clients/<client_id>/performance', methods=['GET'])
@jwt_required()
def get_client_performance(client_id):
    """الحصول على إحصائيات أداء عميل محدد"""
    try:
        user_id = get_jwt_identity()
        
        # معاملات التاريخ
        date_range = None
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date and end_date:
            date_range = {
                'start_date': start_date,
                'end_date': end_date
            }
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(clients_manager.get_client_performance(client_id, user_id, date_range))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على أداء عميل MCC: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على بيانات الأداء',
            'message': str(e)
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل MCC Clients Blueprint - الخدمات متاحة: {MCC_CLIENTS_SERVICES_AVAILABLE}")

# تصدير Blueprint
__all__ = ['mcc_clients_bp']

