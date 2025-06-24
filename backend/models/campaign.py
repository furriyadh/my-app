"""
نموذج الحملة الإعلانية - Campaign Model
Google Ads AI Platform - Campaign Management
"""

from datetime import datetime, date
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import secrets

class CampaignStatus(Enum):
    """حالات الحملة"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"
    REMOVED = "removed"

class CampaignType(Enum):
    """أنواع الحملات"""
    SEARCH = "search"
    DISPLAY = "display"
    SHOPPING = "shopping"
    VIDEO = "video"
    APP = "app"
    SMART = "smart"

class BiddingStrategy(Enum):
    """استراتيجيات المزايدة"""
    MANUAL_CPC = "manual_cpc"
    ENHANCED_CPC = "enhanced_cpc"
    TARGET_CPA = "target_cpa"
    TARGET_ROAS = "target_roas"
    MAXIMIZE_CLICKS = "maximize_clicks"
    MAXIMIZE_CONVERSIONS = "maximize_conversions"

@dataclass
class Campaign:
    """نموذج الحملة الإعلانية"""
    
    id: Optional[str] = None
    user_id: str = ""
    account_id: str = ""
    google_campaign_id: Optional[str] = None
    
    # معلومات أساسية
    name: str = ""
    description: Optional[str] = None
    campaign_type: str = CampaignType.SEARCH.value
    status: str = CampaignStatus.DRAFT.value
    
    # الميزانية والمزايدة
    daily_budget: float = 0.0
    total_budget: Optional[float] = None
    bidding_strategy: str = BiddingStrategy.MANUAL_CPC.value
    target_cpa: Optional[float] = None
    target_roas: Optional[float] = None
    
    # الاستهداف
    target_locations: List[str] = None
    target_languages: List[str] = None
    target_demographics: Dict[str, Any] = None
    target_interests: List[str] = None
    target_keywords: List[str] = None
    
    # الجدولة
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    schedule: Dict[str, Any] = None  # جدولة الأيام والساعات
    
    # الإعدادات المتقدمة
    ad_rotation: str = "optimize"  # optimize, rotate_indefinitely
    frequency_cap: Optional[Dict[str, Any]] = None
    conversion_tracking: bool = True
    
    # إعدادات الذكاء الاصطناعي
    ai_optimization: bool = True
    auto_keyword_expansion: bool = False
    smart_bidding_enabled: bool = False
    
    # الإحصائيات
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    
    # التواريخ
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_sync: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.target_locations is None:
            self.target_locations = []
        if self.target_languages is None:
            self.target_languages = ["ar"]
        if self.target_demographics is None:
            self.target_demographics = {}
        if self.target_interests is None:
            self.target_interests = []
        if self.target_keywords is None:
            self.target_keywords = []
        if self.schedule is None:
            self.schedule = {}
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def ctr(self) -> float:
        """معدل النقر"""
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0.0
    
    @property
    def cpc(self) -> float:
        """تكلفة النقرة"""
        if self.clicks > 0:
            return self.cost / self.clicks
        return 0.0
    
    @property
    def conversion_rate(self) -> float:
        """معدل التحويل"""
        if self.clicks > 0:
            return (self.conversions / self.clicks) * 100
        return 0.0
    
    @property
    def cost_per_conversion(self) -> float:
        """تكلفة التحويل"""
        if self.conversions > 0:
            return self.cost / self.conversions
        return 0.0
    
    def is_active(self) -> bool:
        """هل الحملة نشطة"""
        return self.status == CampaignStatus.ACTIVE.value
    
    def can_edit(self) -> bool:
        """هل يمكن تعديل الحملة"""
        return self.status in [CampaignStatus.DRAFT.value, CampaignStatus.PAUSED.value]
    
    def update_stats(self, impressions: int, clicks: int, conversions: int, cost: float):
        """تحديث الإحصائيات"""
        self.impressions = impressions
        self.clicks = clicks
        self.conversions = conversions
        self.cost = cost
        self.updated_at = datetime.utcnow()
        self.last_sync = datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        # تحويل التواريخ إلى نصوص
        for field in ['created_at', 'updated_at', 'last_sync']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        for field in ['start_date', 'end_date']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Campaign':
        """إنشاء من قاموس"""
        # تحويل التواريخ من نصوص
        for field in ['created_at', 'updated_at', 'last_sync']:
            if data.get(field):
                data[field] = datetime.fromisoformat(data[field].replace('Z', '+00:00'))
        
        for field in ['start_date', 'end_date']:
            if data.get(field):
                data[field] = date.fromisoformat(data[field])
        
        return cls(**data)


@dataclass
class AdGroup:
    """مجموعة الإعلانات"""
    
    id: Optional[str] = None
    campaign_id: str = ""
    google_adgroup_id: Optional[str] = None
    
    name: str = ""
    status: str = CampaignStatus.ACTIVE.value
    default_cpc: float = 0.0
    
    # الاستهداف
    keywords: List[str] = None
    negative_keywords: List[str] = None
    
    # الإحصائيات
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.keywords is None:
            self.keywords = []
        if self.negative_keywords is None:
            self.negative_keywords = []
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def ctr(self) -> float:
        """معدل النقر"""
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        for field in ['created_at', 'updated_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data


@dataclass
class Ad:
    """الإعلان"""
    
    id: Optional[str] = None
    adgroup_id: str = ""
    google_ad_id: Optional[str] = None
    
    # محتوى الإعلان
    headline1: str = ""
    headline2: str = ""
    headline3: Optional[str] = None
    description1: str = ""
    description2: Optional[str] = None
    display_url: str = ""
    final_url: str = ""
    
    # الحالة
    status: str = CampaignStatus.ACTIVE.value
    ad_type: str = "text"  # text, image, video, responsive
    
    # الإحصائيات
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def ctr(self) -> float:
        """معدل النقر"""
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        for field in ['created_at', 'updated_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data


@dataclass
class Keyword:
    """الكلمة المفتاحية"""
    
    id: Optional[str] = None
    adgroup_id: str = ""
    google_keyword_id: Optional[str] = None
    
    # معلومات الكلمة المفتاحية
    text: str = ""
    match_type: str = "broad"  # broad, phrase, exact
    max_cpc: float = 0.0
    status: str = CampaignStatus.ACTIVE.value
    
    # بيانات الأداء
    quality_score: Optional[int] = None
    search_volume: Optional[int] = None
    competition: Optional[str] = None  # low, medium, high
    suggested_bid: Optional[float] = None
    
    # الإحصائيات
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    
    # إعدادات الذكاء الاصطناعي
    ai_suggested: bool = False
    auto_generated: bool = False
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """تهيئة القيم الافتراضية"""
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()
    
    @property
    def ctr(self) -> float:
        """معدل النقر"""
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0.0
    
    @property
    def cpc(self) -> float:
        """تكلفة النقرة"""
        if self.clicks > 0:
            return self.cost / self.clicks
        return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        data = asdict(self)
        
        for field in ['created_at', 'updated_at']:
            if data[field]:
                data[field] = data[field].isoformat()
        
        return data


# دوال مساعدة للحملات
class CampaignHelper:
    """مساعد إدارة الحملات"""
    
    @staticmethod
    def generate_campaign_id() -> str:
        """توليد معرف حملة فريد"""
        return f"camp_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def generate_adgroup_id() -> str:
        """توليد معرف مجموعة إعلانات فريد"""
        return f"adg_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def generate_ad_id() -> str:
        """توليد معرف إعلان فريد"""
        return f"ad_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def generate_keyword_id() -> str:
        """توليد معرف كلمة مفتاحية فريد"""
        return f"kw_{secrets.token_urlsafe(16)}"
    
    @staticmethod
    def validate_campaign_data(data: Dict[str, Any]) -> List[str]:
        """التحقق من صحة بيانات الحملة"""
        errors = []
        
        # التحقق من الاسم
        if not data.get('name'):
            errors.append("اسم الحملة مطلوب")
        
        # التحقق من الميزانية
        if not data.get('daily_budget') or data['daily_budget'] <= 0:
            errors.append("الميزانية اليومية مطلوبة ويجب أن تكون أكبر من صفر")
        
        # التحقق من نوع الحملة
        valid_types = [t.value for t in CampaignType]
        if data.get('campaign_type') not in valid_types:
            errors.append(f"نوع الحملة يجب أن يكون أحد: {', '.join(valid_types)}")
        
        return errors
    
    @staticmethod
    def calculate_campaign_performance(campaign: Campaign) -> Dict[str, float]:
        """حساب أداء الحملة"""
        return {
            'ctr': campaign.ctr,
            'cpc': campaign.cpc,
            'conversion_rate': campaign.conversion_rate,
            'cost_per_conversion': campaign.cost_per_conversion,
            'roas': (campaign.conversions * 100) / campaign.cost if campaign.cost > 0 else 0
        }

