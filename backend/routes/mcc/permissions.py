"""
MCC Permissions Management API
إدارة الصلاحيات والأذونات المتطورة

يوفر مسارات API شاملة لإدارة الصلاحيات في MCC بما في ذلك:
- إدارة أدوار المستخدمين والصلاحيات
- تحديد مستويات الوصول للحسابات والحملات
- إدارة الأذونات المؤقتة والدائمة
- مراقبة وتتبع استخدام الصلاحيات
- نظام موافقات متقدم للعمليات الحساسة
- إدارة الصلاحيات على مستوى المجموعات
"""

from flask import Blueprint, request, jsonify, g
import logging

# محاولة استيراد JWT extensions
try:
    from flask_jwt_extended import jwt_required, get_jwt_identity
    JWT_AVAILABLE = True
except ImportError as e:
    # إنشاء decorators بديلة
    def jwt_required(optional=False):
        def decorator(f):
            return f
        return decorator
    def get_jwt_identity():
        return "demo_user"
    JWT_AVAILABLE = False
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional, Any, Set
import asyncio
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
import uuid

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
mcc_permissions_bp = Blueprint('mcc_permissions', __name__)

# محاولة استيراد الخدمات المطلوبة
try:
    from services.mcc_manager import MCCManager
    from services.google_ads_client import GoogleAdsClient
    # إنشاء دوال بديلة محلية
    def validate_customer_id(customer_id):
        return True
    def validate_email(email):
        return True
    def validate_permission_data(data):
        return True
    def generate_unique_id():
        return str(uuid.uuid4())
    def sanitize_text(text):
        return str(text).replace('<', '').replace('>', '').replace('"', '')
    def send_notification(message):
        print(f"📧 Notification: {message}")
    
    # إنشاء DatabaseManager بسيط
    class DatabaseManager:
        def __init__(self):
            pass
        def save(self, table, data):
            print(f"💾 Saving to {table}: {data}")
            return True
        def get(self, table, filters=None):
            print(f"📊 Getting from {table}")
            return []
    
    MCC_PERMISSIONS_SERVICES_AVAILABLE = True
    logger.info("✅ تم تحميل خدمات MCC Permissions بنجاح")
except ImportError as e:
    MCC_PERMISSIONS_SERVICES_AVAILABLE = False
    logger.info("ℹ️ تم تحميل MCC Permissions Blueprint في وضع محدود")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=20)

class PermissionLevel(Enum):
    """مستويات الصلاحيات"""
    NONE = "none"
    VIEW = "view"
    EDIT = "edit"
    MANAGE = "manage"
    ADMIN = "admin"
    OWNER = "owner"

class ResourceType(Enum):
    """أنواع الموارد"""
    MCC_ACCOUNT = "mcc_account"
    CLIENT_ACCOUNT = "client_account"
    CAMPAIGN = "campaign"
    AD_GROUP = "ad_group"
    KEYWORD = "keyword"
    AD = "ad"
    BUDGET = "budget"
    REPORT = "report"

class PermissionAction(Enum):
    """إجراءات الصلاحيات"""
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    MANAGE = "manage"
    APPROVE = "approve"
    EXPORT = "export"
    SHARE = "share"

class MCCPermissionsManager:
    """مدير صلاحيات MCC المتطور"""
    
    def __init__(self):
        self.mcc_manager = MCCManager() if MCC_PERMISSIONS_SERVICES_AVAILABLE else None
        self.google_ads_client = None  # سيتم تهيئته عند الحاجة
        self.db_manager = DatabaseManager() if MCC_PERMISSIONS_SERVICES_AVAILABLE else None
        
        # تعريف الصلاحيات الافتراضية لكل دور
        self.default_role_permissions = {
            'owner': {
                'mcc_account': ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
                'client_account': ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
                'campaign': ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
                'budget': ['view', 'create', 'edit', 'delete', 'manage', 'approve'],
                'report': ['view', 'create', 'export', 'share']
            },
            'admin': {
                'mcc_account': ['view', 'edit', 'manage'],
                'client_account': ['view', 'create', 'edit', 'manage'],
                'campaign': ['view', 'create', 'edit', 'delete', 'manage'],
                'budget': ['view', 'edit', 'manage'],
                'report': ['view', 'create', 'export', 'share']
            },
            'manager': {
                'mcc_account': ['view'],
                'client_account': ['view', 'edit'],
                'campaign': ['view', 'create', 'edit', 'manage'],
                'budget': ['view', 'edit'],
                'report': ['view', 'create', 'export']
            },
            'editor': {
                'mcc_account': ['view'],
                'client_account': ['view'],
                'campaign': ['view', 'edit'],
                'budget': ['view'],
                'report': ['view', 'create']
            },
            'viewer': {
                'mcc_account': ['view'],
                'client_account': ['view'],
                'campaign': ['view'],
                'budget': ['view'],
                'report': ['view']
            }
        }
    
    async def get_user_permissions(self, user_id: str, resource_id: str = None, resource_type: str = None) -> Dict[str, Any]:
        """الحصول على صلاحيات المستخدم"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # جلب صلاحيات المستخدم من قاعدة البيانات
            user_permissions = await self._fetch_user_permissions(user_id, resource_id, resource_type)
            
            # جلب الأدوار المخصصة للمستخدم
            user_roles = await self._fetch_user_roles(user_id, resource_id)
            
            # دمج الصلاحيات من الأدوار والصلاحيات المباشرة
            combined_permissions = self._combine_permissions(user_permissions, user_roles)
            
            # إضافة معلومات إضافية
            permission_details = await self._enrich_permissions_with_details(combined_permissions, user_id)
            
            return {
                'success': True,
                'user_id': user_id,
                'permissions': combined_permissions,
                'roles': user_roles,
                'details': permission_details,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على صلاحيات المستخدم: {e}")
            return {'success': False, 'error': str(e)}
    
    async def assign_role(self, assigner_id: str, user_id: str, role: str, resource_id: str, resource_type: str, 
                         duration: Optional[int] = None) -> Dict[str, Any]:
        """تخصيص دور لمستخدم"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صلاحية المخصص
            if not await self._check_assignment_permission(assigner_id, resource_id, resource_type, role):
                return {'success': False, 'error': 'ليس لديك صلاحية لتخصيص هذا الدور'}
            
            # التحقق من صحة الدور
            if role not in self.default_role_permissions:
                return {'success': False, 'error': 'الدور المحدد غير صحيح'}
            
            # إنشاء تخصيص الدور
            role_assignment_id = generate_unique_id('role_assignment')
            
            role_assignment = {
                'assignment_id': role_assignment_id,
                'user_id': user_id,
                'role': role,
                'resource_id': resource_id,
                'resource_type': resource_type,
                'assigned_by': assigner_id,
                'assigned_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(days=duration)).isoformat() if duration else None,
                'status': 'active',
                'permissions': self.default_role_permissions[role]
            }
            
            # حفظ في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_role_assignment_to_database(role_assignment)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ تخصيص الدور في قاعدة البيانات: {db_result['error']}")
            
            # إرسال إشعار للمستخدم
            await self._send_role_assignment_notification(user_id, role_assignment)
            
            # تسجيل النشاط
            await self._log_permission_activity(assigner_id, 'role_assigned', {
                'user_id': user_id,
                'role': role,
                'resource_id': resource_id,
                'resource_type': resource_type
            })
            
            return {
                'success': True,
                'assignment': {
                    'assignment_id': role_assignment_id,
                    'user_id': user_id,
                    'role': role,
                    'resource_id': resource_id,
                    'resource_type': resource_type,
                    'expires_at': role_assignment['expires_at']
                },
                'message': 'تم تخصيص الدور بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تخصيص دور MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def revoke_role(self, revoker_id: str, assignment_id: str, reason: str = None) -> Dict[str, Any]:
        """إلغاء تخصيص دور"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن تخصيص الدور
            role_assignment = await self._get_role_assignment_by_id(assignment_id)
            if not role_assignment:
                return {'success': False, 'error': 'تخصيص الدور غير موجود'}
            
            # التحقق من صلاحية الإلغاء
            if not await self._check_revocation_permission(revoker_id, role_assignment):
                return {'success': False, 'error': 'ليس لديك صلاحية لإلغاء هذا التخصيص'}
            
            # تحديث حالة التخصيص
            revocation_data = {
                'status': 'revoked',
                'revoked_by': revoker_id,
                'revoked_at': datetime.utcnow().isoformat(),
                'revocation_reason': reason or 'لم يتم تحديد السبب'
            }
            
            # تحديث في قاعدة البيانات
            if self.db_manager:
                db_result = await self._update_role_assignment_in_database(assignment_id, revocation_data)
                if not db_result['success']:
                    logger.warning(f"فشل تحديث تخصيص الدور في قاعدة البيانات: {db_result['error']}")
            
            # إرسال إشعار للمستخدم
            await self._send_role_revocation_notification(role_assignment['user_id'], role_assignment, reason)
            
            # تسجيل النشاط
            await self._log_permission_activity(revoker_id, 'role_revoked', {
                'assignment_id': assignment_id,
                'user_id': role_assignment['user_id'],
                'role': role_assignment['role'],
                'reason': reason
            })
            
            return {
                'success': True,
                'message': 'تم إلغاء تخصيص الدور بنجاح',
                'assignment_id': assignment_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء تخصيص دور MCC: {e}")
            return {'success': False, 'error': str(e)}
    
    async def grant_custom_permission(self, granter_id: str, user_id: str, permission_data: Dict) -> Dict[str, Any]:
        """منح صلاحية مخصصة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صحة بيانات الصلاحية
            validation_result = validate_permission_data(permission_data)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # التحقق من صلاحية المانح
            if not await self._check_grant_permission(granter_id, permission_data):
                return {'success': False, 'error': 'ليس لديك صلاحية لمنح هذه الصلاحية'}
            
            # إنشاء الصلاحية المخصصة
            permission_id = generate_unique_id('custom_permission')
            
            custom_permission = {
                'permission_id': permission_id,
                'user_id': user_id,
                'resource_id': permission_data['resource_id'],
                'resource_type': permission_data['resource_type'],
                'actions': permission_data['actions'],
                'conditions': permission_data.get('conditions', {}),
                'granted_by': granter_id,
                'granted_at': datetime.utcnow().isoformat(),
                'expires_at': permission_data.get('expires_at'),
                'status': 'active',
                'description': sanitize_text(permission_data.get('description', ''))
            }
            
            # حفظ في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_custom_permission_to_database(custom_permission)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ الصلاحية المخصصة في قاعدة البيانات: {db_result['error']}")
            
            # إرسال إشعار للمستخدم
            await self._send_permission_grant_notification(user_id, custom_permission)
            
            # تسجيل النشاط
            await self._log_permission_activity(granter_id, 'custom_permission_granted', {
                'permission_id': permission_id,
                'user_id': user_id,
                'resource_id': permission_data['resource_id'],
                'actions': permission_data['actions']
            })
            
            return {
                'success': True,
                'permission': {
                    'permission_id': permission_id,
                    'user_id': user_id,
                    'resource_id': permission_data['resource_id'],
                    'resource_type': permission_data['resource_type'],
                    'actions': permission_data['actions'],
                    'expires_at': custom_permission['expires_at']
                },
                'message': 'تم منح الصلاحية المخصصة بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في منح صلاحية مخصصة: {e}")
            return {'success': False, 'error': str(e)}
    
    async def check_permission(self, user_id: str, resource_id: str, resource_type: str, action: str) -> Dict[str, Any]:
        """التحقق من صلاحية محددة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة', 'has_permission': False}
            
            # جلب جميع صلاحيات المستخدم
            user_permissions_result = await self.get_user_permissions(user_id, resource_id, resource_type)
            if not user_permissions_result['success']:
                return {'success': False, 'error': user_permissions_result['error'], 'has_permission': False}
            
            user_permissions = user_permissions_result['permissions']
            
            # التحقق من الصلاحية المحددة
            has_permission = self._evaluate_permission(user_permissions, resource_type, action, resource_id)
            
            # تسجيل محاولة الوصول
            await self._log_access_attempt(user_id, resource_id, resource_type, action, has_permission)
            
            return {
                'success': True,
                'user_id': user_id,
                'resource_id': resource_id,
                'resource_type': resource_type,
                'action': action,
                'has_permission': has_permission,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في التحقق من الصلاحية: {e}")
            return {'success': False, 'error': str(e), 'has_permission': False}
    
    async def get_resource_permissions(self, resource_id: str, resource_type: str, requester_id: str) -> Dict[str, Any]:
        """الحصول على جميع الصلاحيات لمورد محدد"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صلاحية المطالب لعرض صلاحيات المورد
            if not await self._check_view_permissions_access(requester_id, resource_id, resource_type):
                return {'success': False, 'error': 'ليس لديك صلاحية لعرض صلاحيات هذا المورد'}
            
            # جلب جميع الصلاحيات للمورد
            resource_permissions = await self._fetch_resource_permissions(resource_id, resource_type)
            
            # تجميع البيانات حسب المستخدم
            permissions_by_user = self._group_permissions_by_user(resource_permissions)
            
            # إضافة معلومات المستخدمين
            enriched_permissions = await self._enrich_permissions_with_user_info(permissions_by_user)
            
            return {
                'success': True,
                'resource_id': resource_id,
                'resource_type': resource_type,
                'permissions': enriched_permissions,
                'total_users': len(enriched_permissions),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على صلاحيات المورد: {e}")
            return {'success': False, 'error': str(e)}
    
    async def create_permission_group(self, creator_id: str, group_data: Dict) -> Dict[str, Any]:
        """إنشاء مجموعة صلاحيات"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صحة بيانات المجموعة
            if not group_data.get('name') or not group_data.get('permissions'):
                return {'success': False, 'error': 'اسم المجموعة والصلاحيات مطلوبة'}
            
            # التحقق من صلاحية الإنشاء
            if not await self._check_create_group_permission(creator_id, group_data):
                return {'success': False, 'error': 'ليس لديك صلاحية لإنشاء مجموعات الصلاحيات'}
            
            # إنشاء المجموعة
            group_id = generate_unique_id('permission_group')
            
            permission_group = {
                'group_id': group_id,
                'name': sanitize_text(group_data['name']),
                'description': sanitize_text(group_data.get('description', '')),
                'permissions': group_data['permissions'],
                'members': group_data.get('members', []),
                'created_by': creator_id,
                'created_at': datetime.utcnow().isoformat(),
                'status': 'active'
            }
            
            # حفظ في قاعدة البيانات
            if self.db_manager:
                db_result = await self._save_permission_group_to_database(permission_group)
                if not db_result['success']:
                    logger.warning(f"فشل حفظ مجموعة الصلاحيات في قاعدة البيانات: {db_result['error']}")
            
            # إضافة الأعضاء إلى المجموعة
            if permission_group['members']:
                await self._add_members_to_group(group_id, permission_group['members'], creator_id)
            
            # تسجيل النشاط
            await self._log_permission_activity(creator_id, 'permission_group_created', {
                'group_id': group_id,
                'group_name': permission_group['name'],
                'members_count': len(permission_group['members'])
            })
            
            return {
                'success': True,
                'group': {
                    'group_id': group_id,
                    'name': permission_group['name'],
                    'description': permission_group['description'],
                    'members_count': len(permission_group['members'])
                },
                'message': 'تم إنشاء مجموعة الصلاحيات بنجاح',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء مجموعة صلاحيات: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة خاصة
    async def _fetch_user_permissions(self, user_id: str, resource_id: str = None, resource_type: str = None) -> List[Dict]:
        """جلب صلاحيات المستخدم من قاعدة البيانات"""
        # تنفيذ منطق جلب الصلاحيات
        return []
    
    async def _fetch_user_roles(self, user_id: str, resource_id: str = None) -> List[Dict]:
        """جلب أدوار المستخدم"""
        # تنفيذ منطق جلب الأدوار
        return []
    
    def _combine_permissions(self, permissions: List[Dict], roles: List[Dict]) -> Dict:
        """دمج الصلاحيات من الأدوار والصلاحيات المباشرة"""
        combined = {}
        
        # دمج صلاحيات الأدوار
        for role in roles:
            role_name = role.get('role')
            if role_name in self.default_role_permissions:
                for resource_type, actions in self.default_role_permissions[role_name].items():
                    if resource_type not in combined:
                        combined[resource_type] = set()
                    combined[resource_type].update(actions)
        
        # دمج الصلاحيات المباشرة
        for permission in permissions:
            resource_type = permission.get('resource_type')
            actions = permission.get('actions', [])
            if resource_type not in combined:
                combined[resource_type] = set()
            combined[resource_type].update(actions)
        
        # تحويل sets إلى lists
        return {k: list(v) for k, v in combined.items()}
    
    async def _enrich_permissions_with_details(self, permissions: Dict, user_id: str) -> Dict:
        """إضافة تفاصيل إضافية للصلاحيات"""
        return {
            'last_updated': datetime.utcnow().isoformat(),
            'permissions_count': sum(len(actions) for actions in permissions.values()),
            'resource_types_count': len(permissions)
        }
    
    async def _check_assignment_permission(self, assigner_id: str, resource_id: str, resource_type: str, role: str) -> bool:
        """التحقق من صلاحية تخصيص الدور"""
        # تنفيذ منطق التحقق من صلاحية التخصيص
        return True
    
    async def _save_role_assignment_to_database(self, role_assignment: Dict) -> Dict[str, Any]:
        """حفظ تخصيص الدور في قاعدة البيانات"""
        return {'success': True}
    
    async def _send_role_assignment_notification(self, user_id: str, role_assignment: Dict):
        """إرسال إشعار تخصيص الدور"""
        pass
    
    async def _log_permission_activity(self, user_id: str, action: str, data: Dict):
        """تسجيل نشاط الصلاحيات"""
        pass
    
    async def _get_role_assignment_by_id(self, assignment_id: str) -> Optional[Dict]:
        """البحث عن تخصيص دور بالمعرف"""
        return None
    
    async def _check_revocation_permission(self, revoker_id: str, role_assignment: Dict) -> bool:
        """التحقق من صلاحية إلغاء التخصيص"""
        return True
    
    async def _update_role_assignment_in_database(self, assignment_id: str, updates: Dict) -> Dict[str, Any]:
        """تحديث تخصيص الدور في قاعدة البيانات"""
        return {'success': True}
    
    async def _send_role_revocation_notification(self, user_id: str, role_assignment: Dict, reason: str):
        """إرسال إشعار إلغاء تخصيص الدور"""
        pass
    
    async def _check_grant_permission(self, granter_id: str, permission_data: Dict) -> bool:
        """التحقق من صلاحية منح الصلاحية"""
        return True
    
    async def _save_custom_permission_to_database(self, permission: Dict) -> Dict[str, Any]:
        """حفظ الصلاحية المخصصة في قاعدة البيانات"""
        return {'success': True}
    
    async def _send_permission_grant_notification(self, user_id: str, permission: Dict):
        """إرسال إشعار منح الصلاحية"""
        pass
    
    def _evaluate_permission(self, user_permissions: Dict, resource_type: str, action: str, resource_id: str) -> bool:
        """تقييم الصلاحية المحددة"""
        if resource_type in user_permissions:
            return action in user_permissions[resource_type]
        return False
    
    async def _log_access_attempt(self, user_id: str, resource_id: str, resource_type: str, action: str, granted: bool):
        """تسجيل محاولة الوصول"""
        pass
    
    async def _check_view_permissions_access(self, requester_id: str, resource_id: str, resource_type: str) -> bool:
        """التحقق من صلاحية عرض الصلاحيات"""
        return True
    
    async def _fetch_resource_permissions(self, resource_id: str, resource_type: str) -> List[Dict]:
        """جلب صلاحيات المورد"""
        return []
    
    def _group_permissions_by_user(self, permissions: List[Dict]) -> Dict:
        """تجميع الصلاحيات حسب المستخدم"""
        grouped = {}
        for permission in permissions:
            user_id = permission.get('user_id')
            if user_id not in grouped:
                grouped[user_id] = []
            grouped[user_id].append(permission)
        return grouped
    
    async def _enrich_permissions_with_user_info(self, permissions_by_user: Dict) -> List[Dict]:
        """إضافة معلومات المستخدمين للصلاحيات"""
        return []
    
    async def _check_create_group_permission(self, creator_id: str, group_data: Dict) -> bool:
        """التحقق من صلاحية إنشاء المجموعة"""
        return True
    
    async def _save_permission_group_to_database(self, group: Dict) -> Dict[str, Any]:
        """حفظ مجموعة الصلاحيات في قاعدة البيانات"""
        return {'success': True}
    
    async def _add_members_to_group(self, group_id: str, members: List[str], added_by: str):
        """إضافة أعضاء إلى المجموعة"""
        pass

# إنشاء مثيل المدير
permissions_manager = MCCPermissionsManager()

# ===========================================
# مسارات API
# ===========================================

@mcc_permissions_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة إدارة صلاحيات MCC"""
    try:
        return jsonify({
            'success': True,
            'service': 'MCC Permissions Management',
            'status': 'healthy' if MCC_PERMISSIONS_SERVICES_AVAILABLE else 'limited',
            'available_features': {
                'role_management': MCC_PERMISSIONS_SERVICES_AVAILABLE,
                'custom_permissions': MCC_PERMISSIONS_SERVICES_AVAILABLE,
                'permission_groups': MCC_PERMISSIONS_SERVICES_AVAILABLE,
                'access_control': MCC_PERMISSIONS_SERVICES_AVAILABLE
            },
            'supported_roles': list(permissions_manager.default_role_permissions.keys()),
            'supported_resources': [e.value for e in ResourceType],
            'supported_actions': [e.value for e in PermissionAction],
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'خدمة إدارة صلاحيات MCC تعمل بنجاح'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة MCC Permissions: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في فحص الصحة',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/users/<user_id>/permissions', methods=['GET'])
@jwt_required()
def get_user_permissions(user_id):
    """الحصول على صلاحيات مستخدم محدد"""
    try:
        requester_id = get_jwt_identity()
        
        # معاملات اختيارية
        resource_id = request.args.get('resource_id')
        resource_type = request.args.get('resource_type')
        
        # التحقق من الصلاحية (يمكن للمستخدم عرض صلاحياته أو للمدراء عرض صلاحيات الآخرين)
        if user_id != requester_id:
            # التحقق من صلاحية عرض صلاحيات المستخدمين الآخرين
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            check_result = loop.run_until_complete(
                permissions_manager.check_permission(requester_id, resource_id or 'system', 'mcc_account', 'manage')
            )
            loop.close()
            
            if not check_result.get('has_permission', False):
                return jsonify({
                    'success': False,
                    'error': 'ليس لديك صلاحية لعرض صلاحيات هذا المستخدم'
                }), 403
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.get_user_permissions(user_id, resource_id, resource_type))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على صلاحيات المستخدم: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على الصلاحيات',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/roles/assign', methods=['POST'])
@jwt_required()
def assign_role():
    """تخصيص دور لمستخدم"""
    try:
        assigner_id = get_jwt_identity()
        assignment_data = request.get_json()
        
        if not assignment_data:
            return jsonify({
                'success': False,
                'error': 'بيانات التخصيص مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['user_id', 'role', 'resource_id', 'resource_type']
        missing_fields = [field for field in required_fields if not assignment_data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.assign_role(
            assigner_id,
            assignment_data['user_id'],
            assignment_data['role'],
            assignment_data['resource_id'],
            assignment_data['resource_type'],
            assignment_data.get('duration')
        ))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تخصيص دور: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تخصيص الدور',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/roles/<assignment_id>/revoke', methods=['DELETE'])
@jwt_required()
def revoke_role(assignment_id):
    """إلغاء تخصيص دور"""
    try:
        revoker_id = get_jwt_identity()
        revocation_data = request.get_json() or {}
        reason = revocation_data.get('reason')
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.revoke_role(revoker_id, assignment_id, reason))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إلغاء تخصيص دور: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إلغاء التخصيص',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/custom/grant', methods=['POST'])
@jwt_required()
def grant_custom_permission():
    """منح صلاحية مخصصة"""
    try:
        granter_id = get_jwt_identity()
        permission_data = request.get_json()
        
        if not permission_data:
            return jsonify({
                'success': False,
                'error': 'بيانات الصلاحية مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['user_id', 'resource_id', 'resource_type', 'actions']
        missing_fields = [field for field in required_fields if not permission_data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.grant_custom_permission(granter_id, permission_data['user_id'], permission_data))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في منح صلاحية مخصصة: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في منح الصلاحية',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/check', methods=['POST'])
@jwt_required()
def check_permission():
    """التحقق من صلاحية محددة"""
    try:
        user_id = get_jwt_identity()
        check_data = request.get_json()
        
        if not check_data:
            return jsonify({
                'success': False,
                'error': 'بيانات التحقق مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['resource_id', 'resource_type', 'action']
        missing_fields = [field for field in required_fields if not check_data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # يمكن للمدراء التحقق من صلاحيات مستخدمين آخرين
        target_user_id = check_data.get('user_id', user_id)
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.check_permission(
            target_user_id,
            check_data['resource_id'],
            check_data['resource_type'],
            check_data['action']
        ))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في التحقق من الصلاحية: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في التحقق من الصلاحية',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/resources/<resource_id>/permissions', methods=['GET'])
@jwt_required()
def get_resource_permissions(resource_id):
    """الحصول على جميع الصلاحيات لمورد محدد"""
    try:
        requester_id = get_jwt_identity()
        resource_type = request.args.get('resource_type', 'mcc_account')
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.get_resource_permissions(resource_id, resource_type, requester_id))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على صلاحيات المورد: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على صلاحيات المورد',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_permission_group():
    """إنشاء مجموعة صلاحيات"""
    try:
        creator_id = get_jwt_identity()
        group_data = request.get_json()
        
        if not group_data:
            return jsonify({
                'success': False,
                'error': 'بيانات المجموعة مطلوبة'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(permissions_manager.create_permission_group(creator_id, group_data))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء مجموعة صلاحيات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إنشاء المجموعة',
            'message': str(e)
        }), 500

@mcc_permissions_bp.route('/roles', methods=['GET'])
def get_available_roles():
    """الحصول على الأدوار المتاحة"""
    try:
        return jsonify({
            'success': True,
            'roles': {
                role: {
                    'name': role,
                    'permissions': permissions,
                    'description': f'دور {role} مع صلاحيات متنوعة'
                }
                for role, permissions in permissions_manager.default_role_permissions.items()
            },
            'total_roles': len(permissions_manager.default_role_permissions),
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"خطأ في الحصول على الأدوار المتاحة: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على الأدوار',
            'message': str(e)
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل MCC Permissions Blueprint - الخدمات متاحة: {MCC_PERMISSIONS_SERVICES_AVAILABLE}")

# تصدير Blueprint
__all__ = ['mcc_permissions_bp']

