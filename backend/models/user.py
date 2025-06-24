"""
نموذج المستخدم - User Model
Google Ads AI Platform - User Management
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import json
import hashlib
import secrets

@dataclass
class User:
    """نموذج المستخدم الأساسي"""
    
    id: Optional[str] = None
    email: str = ""
    password_hash: str = ""
    first_name: str = ""
    last_name: str = ""
    phone: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role: str = "user"  # user, admin, manager
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def full_name(self) -> str:
        """الاسم الكامل"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @staticmethod
    def hash_password(password: str) -> str:
        """تشفير كلمة المرور"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                          password.encode('utf-8'), 
                                          salt.encode('utf-8'), 
                                          100000)
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password: str) -> bool:
        """التحقق من كلمة المرور"""
        try:
            salt, stored_hash = self.password_hash.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256',
                                              password.encode('utf-8'),
                                              salt.encode('utf-8'),
                                              100000)
            return password_hash.hex() == stored_hash
        except:
            return False
    
    def set_password(self, password: str):
        """تعيين كلمة مرور جديدة"""
        self.password_hash = self.hash_password(password)
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        # تحويل التواريخ إلى نصوص
        for field in ['created_at', 'updated_at', 'last_login']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        # إزالة البيانات الحساسة
        if not include_sensitive:
            data.pop('password_hash', None)
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """إنشاء من قاموس"""
        # تحويل التواريخ من نصوص
        for field in ['created_at', 'updated_at', 'last_login']:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        return cls(**data)


@dataclass
class UserProfile:
    """ملف المستخدم الشخصي"""
    
    id: Optional[str] = None
    user_id: str = ""
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    timezone: str = "UTC"
    language: str = "ar"
    currency: str = "USD"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        # تحويل التواريخ إلى نصوص
        for field in ['created_at', 'updated_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserProfile':
        """إنشاء من قاموس"""
        # تحويل التواريخ من نصوص
        for field in ['created_at', 'updated_at']:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        return cls(**data)


@dataclass
class UserSettings:
    """إعدادات المستخدم"""
    
    id: Optional[str] = None
    user_id: str = ""
    
    # إعدادات الإشعارات
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    
    # إعدادات الحملات
    auto_optimize_campaigns: bool = True
    auto_pause_low_performance: bool = False
    daily_budget_alerts: bool = True
    
    # إعدادات التقارير
    weekly_reports: bool = True
    monthly_reports: bool = True
    performance_alerts: bool = True
    
    # إعدادات الذكاء الاصطناعي
    ai_suggestions: bool = True
    auto_keyword_expansion: bool = False
    smart_bidding: bool = True
    
    # إعدادات أخرى
    theme: str = "light"  # light, dark, auto
    dashboard_layout: str = "default"
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    def update_setting(self, key: str, value: Any):
        """تحديث إعداد معين"""
        if hasattr(self, key):
            setattr(self, key, value)
            self.updated_at = datetime.utcnow()
    
    def get_notification_settings(self) -> Dict[str, bool]:
        """الحصول على إعدادات الإشعارات"""
        return {
            'email': self.email_notifications,
            'push': self.push_notifications,
            'sms': self.sms_notifications
        }
    
    def get_campaign_settings(self) -> Dict[str, bool]:
        """الحصول على إعدادات الحملات"""
        return {
            'auto_optimize': self.auto_optimize_campaigns,
            'auto_pause': self.auto_pause_low_performance,
            'budget_alerts': self.daily_budget_alerts
        }
    
    def get_ai_settings(self) -> Dict[str, bool]:
        """الحصول على إعدادات الذكاء الاصطناعي"""
        return {
            'suggestions': self.ai_suggestions,
            'keyword_expansion': self.auto_keyword_expansion,
            'smart_bidding': self.smart_bidding
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        # تحويل التواريخ إلى نصوص
        for field in ['created_at', 'updated_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserSettings':
        """إنشاء من قاموس"""
        # تحويل التواريخ من نصوص
        for field in ['created_at', 'updated_at']:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        return cls(**data)


# دوال مساعدة للمستخدمين
class UserHelper:
    """مساعد إدارة المستخدمين"""
    
    @staticmethod
    def create_user_with_profile(user_data: Dict[str, Any], 
                               profile_data: Dict[str, Any] = None) -> tuple[User, UserProfile, UserSettings]:
        """إنشاء مستخدم مع ملف شخصي وإعدادات"""
        
        # إنشاء المستخدم
        user = User.from_dict(user_data)
        
        # إنشاء الملف الشخصي
        if profile_data is None:
            profile_data = {}
        profile_data['user_id'] = user.id
        profile = UserProfile.from_dict(profile_data)
        
        # إنشاء الإعدادات الافتراضية
        settings = UserSettings(user_id=user.id)
        
        return user, profile, settings
    
    @staticmethod
    def validate_user_data(data: Dict[str, Any]) -> List[str]:
        """التحقق من صحة بيانات المستخدم"""
        errors = []
        
        # التحقق من البريد الإلكتروني
        if not data.get('email'):
            errors.append("البريد الإلكتروني مطلوب")
        elif '@' not in data['email']:
            errors.append("البريد الإلكتروني غير صحيح")
        
        # التحقق من كلمة المرور
        if not data.get('password') and not data.get('password_hash'):
            errors.append("كلمة المرور مطلوبة")
        elif data.get('password') and len(data['password']) < 8:
            errors.append("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        
        # التحقق من الاسم
        if not data.get('first_name'):
            errors.append("الاسم الأول مطلوب")
        
        return errors
    
    @staticmethod
    def generate_user_id() -> str:
        """توليد معرف مستخدم فريد"""
        return f"user_{secrets.token_urlsafe(16)}"

