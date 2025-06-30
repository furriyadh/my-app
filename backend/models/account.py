"""
نموذج الحساب الإعلاني - Account Model
Google Ads AI Platform - Account Management
"""

from datetime import datetime, date
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import secrets

class AccountStatus(Enum):
    """حالات الحساب"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    PENDING = "pending"

class AccountType(Enum):
    """أنواع الحسابات"""
    INDIVIDUAL = "individual"
    BUSINESS = "business"
    AGENCY = "agency"
    MCC = "mcc"  # My Client Center

class AccessLevel(Enum):
    """مستويات الوصول"""
    OWNER = "owner"
    ADMIN = "admin"
    STANDARD = "standard"
    READ_ONLY = "read_only"

@dataclass
class AdAccount:
    """نموذج الحساب الإعلاني"""
    
    id: Optional[str] = None
    user_id: str = ""  # مالك الحساب الأساسي
    google_account_id: Optional[str] = None
    mcc_account_id: Optional[str] = None  # حساب MCC الأب
    
    # معلومات أساسية
    name: str = ""
    description: Optional[str] = None
    account_type: str = AccountType.INDIVIDUAL.value
    status: str = AccountStatus.PENDING.value
    
    # معلومات الشركة/العمل
    company_name: Optional[str] = None
    business_category: Optional[str] = None
    website: Optional[str] = None
    
    # معلومات الاتصال
    contact_email: str = ""
    contact_phone: Optional[str] = None
    billing_address: Dict[str, str] = None
    
    # الإعدادات المالية
    currency: str = "USD"
    timezone: str = "UTC"
    billing_threshold: float = 100.0
    auto_payment: bool = True
    
    # حدود الإنفاق
    daily_spending_limit: Optional[float] = None
    monthly_spending_limit: Optional[float] = None
    total_spending_limit: Optional[float] = None
    
    # الإحصائيات المالية
    total_spent: float = 0.0
    current_balance: float = 0.0
    pending_charges: float = 0.0
    
    # إعدادات الذكاء الاصطناعي
    ai_recommendations: bool = True
    auto_optimization: bool = False
    smart_campaigns: bool = True
    
    # معلومات التحقق
    is_verified: bool = False
    verification_date: Optional[datetime] = None
    tax_id: Optional[str] = None
    
    # التواريخ
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.billing_address is None:
            self.billing_address = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def available_balance(self) -> float:
        """الرصيد المتاح"""
        return self.current_balance - self.pending_charges
    
    @property
    def spending_percentage(self) -> float:
        """نسبة الإنفاق من الحد الشهري"""
        if self.monthly_spending_limit and self.monthly_spending_limit > 0:
            return (self.total_spent / self.monthly_spending_limit) * 100
        return 0.0
    
    def is_active(self) -> bool:
        """هل الحساب نشط"""
        return self.status == AccountStatus.ACTIVE.value
    
    def can_spend(self, amount: float) -> bool:
        """هل يمكن الإنفاق بالمبلغ المحدد"""
        if not self.is_active():
            return False
        
        # التحقق من الرصيد المتاح
        if self.available_balance < amount:
            return False
        
        # التحقق من الحد اليومي
        if self.daily_spending_limit and amount > self.daily_spending_limit:
            return False
        
        return True
    
    def add_spending(self, amount: float):
        """إضافة مبلغ إنفاق"""
        self.total_spent += amount
        self.pending_charges += amount
        self.last_activity = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def add_balance(self, amount: float):
        """إضافة رصيد"""
        self.current_balance += amount
        self.updated_at = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        # تحويل التواريخ إلى نصوص
        for field in ['created_at', 'updated_at', 'last_activity', 'verification_date']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AdAccount':
        """إنشاء من قاموس"""
        # تحويل التواريخ من نصوص
        for field in ['created_at', 'updated_at', 'last_activity', 'verification_date']:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        return cls(**data)


@dataclass
class AccountAccess:
    """صلاحيات الوصول للحساب"""
    
    id: Optional[str] = None
    account_id: str = ""
    user_id: str = ""
    granted_by: str = ""  # معرف المستخدم الذي منح الصلاحية
    
    # مستوى الوصول
    access_level: str = AccessLevel.READ_ONLY.value
    
    # الصلاحيات المحددة
    can_view_campaigns: bool = True
    can_edit_campaigns: bool = False
    can_create_campaigns: bool = False
    can_delete_campaigns: bool = False
    can_manage_billing: bool = False
    can_manage_users: bool = False
    can_view_reports: bool = True
    can_export_data: bool = False
    
    # قيود الوصول
    ip_restrictions: List[str] = None
    time_restrictions: Dict[str, Any] = None
    
    # معلومات الصلاحية
    is_active: bool = True
    expires_at: Optional[datetime] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_used: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.ip_restrictions is None:
            self.ip_restrictions = []
        if self.time_restrictions is None:
            self.time_restrictions = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    def is_valid(self) -> bool:
        """هل الصلاحية صالحة"""
        if not self.is_active:
            return False
        
        if self.expires_at and self.expires_at < datetime.utcnow():
            return False
        
        return True
    
    def has_permission(self, permission: str) -> bool:
        """التحقق من وجود صلاحية معينة"""
        return getattr(self, permission, False)
    
    def set_access_level(self, level: AccessLevel):
        """تعيين مستوى الوصول"""
        self.access_level = level.value
        
        # تعيين الصلاحيات حسب المستوى
        if level == AccessLevel.OWNER:
            self._set_all_permissions(True)
        elif level == AccessLevel.ADMIN:
            self._set_all_permissions(True)
            self.can_manage_users = False  # الأدمن لا يمكنه إدارة المستخدمين
        elif level == AccessLevel.STANDARD:
            self.can_view_campaigns = True
            self.can_edit_campaigns = True
            self.can_create_campaigns = True
            self.can_view_reports = True
        elif level == AccessLevel.READ_ONLY:
            self._set_all_permissions(False)
            self.can_view_campaigns = True
            self.can_view_reports = True
        
        self.updated_at = datetime.utcnow()
    
    def _set_all_permissions(self, value: bool):
        """تعيين جميع الصلاحيات"""
        permissions = [
            'can_view_campaigns', 'can_edit_campaigns', 'can_create_campaigns',
            'can_delete_campaigns', 'can_manage_billing', 'can_manage_users',
            'can_view_reports', 'can_export_data'
        ]
        for perm in permissions:
            setattr(self, perm, value)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        for field in ['created_at', 'updated_at', 'last_used', 'expires_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data


@dataclass
class AccountStats:
    """إحصائيات الحساب"""
    
    id: Optional[str] = None
    account_id: str = ""
    stats_date: date = None
    
    # إحصائيات الحملات
    total_campaigns: int = 0
    active_campaigns: int = 0
    paused_campaigns: int = 0
    
    # إحصائيات الأداء
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    
    # معدلات الأداء
    ctr: float = 0.0
    cpc: float = 0.0
    conversion_rate: float = 0.0
    cost_per_conversion: float = 0.0
    
    # إحصائيات الكلمات المفتاحية
    total_keywords: int = 0
    active_keywords: int = 0
    avg_quality_score: float = 0.0
    
    # إحصائيات الإعلانات
    total_ads: int = 0
    active_ads: int = 0
    
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.date is None:
            self.date = date.today()
        if self.created_at is None:
            self.created_at = datetime.utcnow()
    
    def calculate_metrics(self):
        """حساب المعدلات"""
        # معدل النقر
        if self.impressions > 0:
            self.ctr = (self.clicks / self.impressions) * 100
        
        # تكلفة النقرة
        if self.clicks > 0:
            self.cpc = self.cost / self.clicks
        
        # معدل التحويل
        if self.clicks > 0:
            self.conversion_rate = (self.conversions / self.clicks) * 100
        
        # تكلفة التحويل
        if self.conversions > 0:
            self.cost_per_conversion = self.cost / self.conversions
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        if data['date']:
            data['date'] = data['date'].isoformat()
        
        if data['created_at']:
            data['created_at'] = data['created_at'].isoformat()
        
        return data


# دوال مساعدة للحسابات
class AccountHelper:
    """مساعد إدارة الحسابات"""
    
    @staticmethod
    def generate_account_id() -> str:
        """توليد معرف حساب فريد"""
        return f"acc_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def generate_access_id() -> str:
        """توليد معرف صلاحية فريد"""
        return f"access_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def validate_account_data(data: Dict[str, Any]) -> List[str]:
        """التحقق من صحة بيانات الحساب"""
        errors = []
        
        # التحقق من الاسم
        if not data.get('name'):
            errors.append("اسم الحساب مطلوب")
        
        # التحقق من البريد الإلكتروني
        if not data.get('contact_email'):
            errors.append("البريد الإلكتروني مطلوب")
        elif '@' not in data['contact_email']:
            errors.append("البريد الإلكتروني غير صحيح")
        
        # التحقق من العملة
        valid_currencies = ['USD', 'EUR', 'SAR', 'AED', 'EGP']
        if data.get('currency') not in valid_currencies:
            errors.append(f"العملة يجب أن تكون أحد: {', '.join(valid_currencies)}")
        
        return errors
    
    @staticmethod
    def create_default_access(account_id: str, user_id: str) -> AccountAccess:
        """إنشاء صلاحية افتراضية للمالك"""
        access = AccountAccess(
            account_id=account_id,
            user_id=user_id,
            granted_by=user_id
        )
        access.set_access_level(AccessLevel.OWNER)
        return access
    
    @staticmethod
    def calculate_account_health(account: AdAccount, stats: AccountStats) -> Dict[str, Any]:
        """حساب صحة الحساب"""
        health_score = 100
        issues = []
        
        # التحقق من الرصيد
        if account.available_balance < 50:
            health_score -= 20
            issues.append("رصيد منخفض")
        
        # التحقق من الأداء
        if stats.ctr < 1.0:
            health_score -= 15
            issues.append("معدل نقر منخفض")
        
        if stats.conversion_rate < 2.0:
            health_score -= 15
            issues.append("معدل تحويل منخفض")
        
        # التحقق من جودة الكلمات المفتاحية
        if stats.avg_quality_score < 5.0:
            health_score -= 10
            issues.append("جودة كلمات مفتاحية منخفضة")
        
        return {
            'score': max(0, health_score),
            'status': 'excellent' if health_score >= 80 else 'good' if health_score >= 60 else 'needs_attention',
            'issues': issues
        }

