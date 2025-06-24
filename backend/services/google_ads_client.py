"""
Google Ads Client Service
خدمة عميل Google Ads المتطورة

نظام شامل لإدارة Google Ads API يتضمن:
- إدارة المصادقة والرموز المميزة
- عمليات CRUD للحملات والإعلانات
- تحليل الأداء والإحصائيات
- إدارة الميزانيات والعروض
- تحسين الحملات بالذكاء الاصطناعي
- مراقبة الأداء والتنبيهات
"""

import os
import json
import logging
import time
import asyncio
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from functools import wraps
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

# استيراد Google Ads مع معالجة أخطاء متقدمة
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    from google.auth.exceptions import RefreshError
    from google.oauth2.credentials import Credentials
    GOOGLE_ADS_AVAILABLE = True
except ImportError:
    GOOGLE_ADS_AVAILABLE = False
    logging.warning("Google Ads library not available")

# استيراد المكتبات المحلية
try:
    from ..utils.helpers import (
        generate_unique_id, validate_email, format_currency,
        calculate_performance_score, safe_divide
    )
    from ..utils.redis_config import redis_manager
except ImportError:
    # Fallback imports
    def generate_unique_id(): return str(int(time.time()))
    def validate_email(email): return '@' in email
    def format_currency(amount, currency='USD'): return f"{amount} {currency}"
    def calculate_performance_score(metrics): return 0.0
    def safe_divide(a, b): return a / b if b != 0 else 0
    redis_manager = None

logger = logging.getLogger(__name__)

@dataclass
class GoogleAdsConfig:
    """إعدادات Google Ads API"""
    developer_token: str
    client_id: str
    client_secret: str
    refresh_token: Optional[str] = None
    customer_id: Optional[str] = None
    login_customer_id: Optional[str] = None
    
    # إعدادات API
    use_proto_plus: bool = True
    version: str = 'v15'
    endpoint: Optional[str] = None
    
    # إعدادات الأداء
    timeout: int = 60
    retry_count: int = 3
    page_size: int = 1000
    
    # إعدادات التخزين المؤقت
    cache_enabled: bool = True
    cache_ttl: int = 3600
    
    def __post_init__(self):
        # تحميل من متغيرات البيئة
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', self.developer_token)
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID', self.client_id)
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET', self.client_secret)
        self.refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN', self.refresh_token)
        self.customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID', self.customer_id)
        self.login_customer_id = os.getenv('GOOGLE_ADS_LOGIN_CUSTOMER_ID', self.login_customer_id)

@dataclass
class CampaignMetrics:
    """مقاييس أداء الحملة"""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0
    conversions: int = 0
    conversion_value: float = 0.0
    ctr: float = 0.0
    cpc: float = 0.0
    cpm: float = 0.0
    roas: float = 0.0
    quality_score: float = 0.0
    
    def calculate_derived_metrics(self):
        """حساب المقاييس المشتقة"""
        self.ctr = safe_divide(self.clicks, self.impressions) * 100
        self.cpc = safe_divide(self.cost, self.clicks)
        self.cpm = safe_divide(self.cost, self.impressions) * 1000
        self.roas = safe_divide(self.conversion_value, self.cost)

@dataclass
class CampaignData:
    """بيانات الحملة"""
    id: str
    name: str
    status: str
    budget: float
    bid_strategy: str
    target_cpa: Optional[float] = None
    target_roas: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    metrics: Optional[CampaignMetrics] = None
    keywords: List[str] = None
    ad_groups: List[Dict] = None
    
    def __post_init__(self):
        if self.metrics is None:
            self.metrics = CampaignMetrics()
        if self.keywords is None:
            self.keywords = []
        if self.ad_groups is None:
            self.ad_groups = []

def google_ads_operation(retry_count: int = 3, cache_ttl: Optional[int] = None):
    """Decorator لعمليات Google Ads مع إعادة المحاولة والتخزين المؤقت"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            # إنشاء مفتاح التخزين المؤقت
            cache_key = None
            if cache_ttl and self.config.cache_enabled:
                cache_key = f"google_ads:{func.__name__}:{hash(str(args) + str(kwargs))}"
                cached_result = redis_manager.get(cache_key) if redis_manager else None
                if cached_result:
                    logger.debug(f"استخدام النتيجة المخزنة مؤقتاً لـ {func.__name__}")
                    return cached_result
            
            last_exception = None
            for attempt in range(retry_count):
                try:
                    start_time = time.time()
                    result = func(self, *args, **kwargs)
                    
                    # تتبع الأداء
                    execution_time = time.time() - start_time
                    self._track_operation(func.__name__, True, execution_time)
                    
                    # حفظ في التخزين المؤقت
                    if cache_key and cache_ttl:
                        redis_manager.set(cache_key, result, cache_ttl)
                    
                    return result
                    
                except GoogleAdsException as e:
                    last_exception = e
                    logger.warning(f"خطأ Google Ads في المحاولة {attempt + 1}: {str(e)}")
                    if attempt < retry_count - 1:
                        time.sleep(2 ** attempt)  # Exponential backoff
                    
                except RefreshError as e:
                    last_exception = e
                    logger.error(f"خطأ في تجديد الرمز المميز: {str(e)}")
                    # محاولة تجديد الرمز
                    if attempt < retry_count - 1:
                        self._refresh_credentials()
                        time.sleep(1)
                    
                except Exception as e:
                    last_exception = e
                    logger.error(f"خطأ غير متوقع في {func.__name__}: {str(e)}")
                    if attempt < retry_count - 1:
                        time.sleep(1)
            
            # تتبع الفشل
            self._track_operation(func.__name__, False, 0)
            logger.error(f"فشل في جميع محاولات {func.__name__}: {str(last_exception)}")
            raise last_exception
            
        return wrapper
    return decorator

class GoogleAdsClientService:
    """خدمة عميل Google Ads المتطورة"""
    
    def __init__(self, config: Optional[GoogleAdsConfig] = None):
        """تهيئة خدمة Google Ads"""
        self.config = config or GoogleAdsConfig(
            developer_token=os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', ''),
            client_id=os.getenv('GOOGLE_ADS_CLIENT_ID', ''),
            client_secret=os.getenv('GOOGLE_ADS_CLIENT_SECRET', '')
        )
        
        self.client = None
        self.is_authenticated = False
        self._lock = threading.RLock()
        
        # إحصائيات الأداء
        self.metrics = {
            'total_operations': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'average_response_time': 0.0,
            'last_operation_time': None,
            'operations_by_type': {},
            'api_quota_usage': 0,
            'rate_limit_hits': 0
        }
        
        # تهيئة العميل
        self._initialize_client()
    
    def _initialize_client(self):
        """تهيئة عميل Google Ads"""
        if not GOOGLE_ADS_AVAILABLE:
            logger.error("Google Ads library غير متاح")
            return
        
        try:
            # إعداد الاعتمادات
            credentials_data = {
                'developer_token': self.config.developer_token,
                'client_id': self.config.client_id,
                'client_secret': self.config.client_secret,
                'use_proto_plus': self.config.use_proto_plus
            }
            
            if self.config.refresh_token:
                credentials_data['refresh_token'] = self.config.refresh_token
            
            if self.config.customer_id:
                credentials_data['customer_id'] = self.config.customer_id
            
            if self.config.login_customer_id:
                credentials_data['login_customer_id'] = self.config.login_customer_id
            
            # إنشاء العميل
            self.client = GoogleAdsClient.load_from_dict(credentials_data)
            self.is_authenticated = True
            
            logger.info("✅ تم تهيئة عميل Google Ads بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة عميل Google Ads: {str(e)}")
            self.is_authenticated = False
    
    def _refresh_credentials(self):
        """تجديد الاعتمادات"""
        try:
            if self.client and hasattr(self.client, 'oauth2'):
                self.client.oauth2.refresh()
                logger.info("تم تجديد الاعتمادات بنجاح")
        except Exception as e:
            logger.error(f"فشل في تجديد الاعتمادات: {str(e)}")
    
    def _track_operation(self, operation_name: str, success: bool, response_time: float):
        """تتبع إحصائيات العمليات"""
        with self._lock:
            self.metrics['total_operations'] += 1
            self.metrics['last_operation_time'] = time.time()
            
            if success:
                self.metrics['successful_operations'] += 1
            else:
                self.metrics['failed_operations'] += 1
            
            # تحديث متوسط وقت الاستجابة
            if response_time > 0:
                total_time = (self.metrics['average_response_time'] * 
                            (self.metrics['total_operations'] - 1))
                self.metrics['average_response_time'] = (
                    (total_time + response_time) / self.metrics['total_operations']
                )
            
            # تتبع العمليات حسب النوع
            self.metrics['operations_by_type'][operation_name] = (
                self.metrics['operations_by_type'].get(operation_name, 0) + 1
            )
    
    def _build_query(self, resource: str, fields: List[str], 
                    conditions: Optional[List[str]] = None,
                    order_by: Optional[str] = None,
                    limit: Optional[int] = None) -> str:
        """بناء استعلام GAQL"""
        query_parts = [f"SELECT {', '.join(fields)} FROM {resource}"]
        
        if conditions:
            query_parts.append(f"WHERE {' AND '.join(conditions)}")
        
        if order_by:
            query_parts.append(f"ORDER BY {order_by}")
        
        if limit:
            query_parts.append(f"LIMIT {limit}")
        
        return " ".join(query_parts)
    
    # ===========================================
    # إدارة الحسابات
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=3600)
    def get_accessible_customers(self) -> List[Dict[str, Any]]:
        """الحصول على الحسابات المتاحة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            customer_service = self.client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            
            customers = []
            for customer_resource in accessible_customers.resource_names:
                customer_id = customer_resource.split('/')[-1]
                customer_info = self.get_customer_info(customer_id)
                customers.append(customer_info)
            
            return customers
            
        except Exception as e:
            logger.error(f"خطأ في جلب الحسابات المتاحة: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_customer_info(self, customer_id: str) -> Dict[str, Any]:
        """الحصول على معلومات العميل"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = self._build_query(
                resource="customer",
                fields=[
                    "customer.id",
                    "customer.descriptive_name",
                    "customer.currency_code",
                    "customer.time_zone",
                    "customer.status",
                    "customer.manager",
                    "customer.test_account"
                ]
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            for row in response:
                customer = row.customer
                return {
                    'id': customer.id,
                    'name': customer.descriptive_name,
                    'currency': customer.currency_code,
                    'timezone': customer.time_zone,
                    'status': customer.status.name,
                    'is_manager': customer.manager,
                    'is_test': customer.test_account
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"خطأ في جلب معلومات العميل {customer_id}: {str(e)}")
            raise
    
    # ===========================================
    # إدارة الحملات
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_campaigns(self, customer_id: str, 
                     status_filter: Optional[str] = None) -> List[CampaignData]:
        """الحصول على الحملات"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            fields = [
                "campaign.id",
                "campaign.name",
                "campaign.status",
                "campaign.start_date",
                "campaign.end_date",
                "campaign.campaign_budget",
                "campaign.bidding_strategy_type",
                "campaign.target_cpa.target_cpa_micros",
                "campaign.target_roas.target_roas"
            ]
            
            conditions = []
            if status_filter:
                conditions.append(f"campaign.status = {status_filter}")
            
            query = self._build_query(
                resource="campaign",
                fields=fields,
                conditions=conditions if conditions else None,
                order_by="campaign.name"
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            campaigns = []
            for row in response:
                campaign = row.campaign
                
                campaign_data = CampaignData(
                    id=str(campaign.id),
                    name=campaign.name,
                    status=campaign.status.name,
                    budget=0.0,  # سيتم جلبها من budget service
                    bid_strategy=campaign.bidding_strategy_type.name,
                    start_date=campaign.start_date,
                    end_date=campaign.end_date if campaign.end_date else None
                )
                
                # إضافة معلومات العروض
                if hasattr(campaign, 'target_cpa') and campaign.target_cpa:
                    campaign_data.target_cpa = campaign.target_cpa.target_cpa_micros / 1000000
                
                if hasattr(campaign, 'target_roas') and campaign.target_roas:
                    campaign_data.target_roas = campaign.target_roas.target_roas
                
                campaigns.append(campaign_data)
            
            return campaigns
            
        except Exception as e:
            logger.error(f"خطأ في جلب الحملات للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> str:
        """إنشاء حملة جديدة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            
            # إنشاء الحملة
            campaign = campaign_operation.create
            campaign.name = campaign_data['name']
            campaign.status = self.client.enums.CampaignStatusEnum.PAUSED
            
            # إعداد نوع الحملة
            campaign.advertising_channel_type = getattr(
                self.client.enums.AdvertisingChannelTypeEnum,
                campaign_data.get('type', 'SEARCH')
            )
            
            # إعداد الميزانية
            if 'budget_id' in campaign_data:
                campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{campaign_data['budget_id']}"
            
            # إعداد استراتيجية العروض
            bid_strategy = campaign_data.get('bid_strategy', 'MANUAL_CPC')
            if bid_strategy == 'TARGET_CPA':
                campaign.target_cpa.target_cpa_micros = int(campaign_data.get('target_cpa', 0) * 1000000)
            elif bid_strategy == 'TARGET_ROAS':
                campaign.target_roas.target_roas = campaign_data.get('target_roas', 1.0)
            
            # تنفيذ العملية
            response = campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء الحملة بنجاح: {campaign_id}")
            
            return campaign_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الحملة: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def update_campaign(self, customer_id: str, campaign_id: str, 
                       updates: Dict[str, Any]) -> bool:
        """تحديث حملة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            
            # إعداد التحديث
            campaign = campaign_operation.update
            campaign.resource_name = f"customers/{customer_id}/campaigns/{campaign_id}"
            
            # تطبيق التحديثات
            field_mask = []
            
            if 'name' in updates:
                campaign.name = updates['name']
                field_mask.append('name')
            
            if 'status' in updates:
                campaign.status = getattr(
                    self.client.enums.CampaignStatusEnum,
                    updates['status']
                )
                field_mask.append('status')
            
            if 'target_cpa' in updates:
                campaign.target_cpa.target_cpa_micros = int(updates['target_cpa'] * 1000000)
                field_mask.append('target_cpa.target_cpa_micros')
            
            if 'target_roas' in updates:
                campaign.target_roas.target_roas = updates['target_roas']
                field_mask.append('target_roas.target_roas')
            
            # تحديد الحقول المحدثة
            campaign_operation.update_mask.CopyFrom(
                self.client.get_type("FieldMask", paths=field_mask)
            )
            
            # تنفيذ العملية
            response = campaign_service.mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            logger.info(f"تم تحديث الحملة بنجاح: {campaign_id}")
            return True
            
        except Exception as e:
            logger.error(f"خطأ في تحديث الحملة {campaign_id}: {str(e)}")
            raise
    
    # ===========================================
    # إدارة الميزانيات
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_campaign_budgets(self, customer_id: str) -> List[Dict[str, Any]]:
        """الحصول على ميزانيات الحملات"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = self._build_query(
                resource="campaign_budget",
                fields=[
                    "campaign_budget.id",
                    "campaign_budget.name",
                    "campaign_budget.amount_micros",
                    "campaign_budget.delivery_method",
                    "campaign_budget.status"
                ]
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            budgets = []
            for row in response:
                budget = row.campaign_budget
                budgets.append({
                    'id': budget.id,
                    'name': budget.name,
                    'amount': budget.amount_micros / 1000000,
                    'delivery_method': budget.delivery_method.name,
                    'status': budget.status.name
                })
            
            return budgets
            
        except Exception as e:
            logger.error(f"خطأ في جلب الميزانيات للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_campaign_budget(self, customer_id: str, 
                              budget_data: Dict[str, Any]) -> str:
        """إنشاء ميزانية حملة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            budget_service = self.client.get_service("CampaignBudgetService")
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            
            # إنشاء الميزانية
            budget = budget_operation.create
            budget.name = budget_data['name']
            budget.amount_micros = int(budget_data['amount'] * 1000000)
            budget.delivery_method = getattr(
                self.client.enums.BudgetDeliveryMethodEnum,
                budget_data.get('delivery_method', 'STANDARD')
            )
            
            # تنفيذ العملية
            response = budget_service.mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء الميزانية بنجاح: {budget_id}")
            
            return budget_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الميزانية: {str(e)}")
            raise
    
    # ===========================================
    # التقارير والإحصائيات
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_campaign_performance(self, customer_id: str, campaign_id: str,
                               date_range: Tuple[str, str]) -> CampaignMetrics:
        """الحصول على أداء الحملة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            start_date, end_date = date_range
            
            query = self._build_query(
                resource="campaign",
                fields=[
                    "campaign.id",
                    "metrics.impressions",
                    "metrics.clicks",
                    "metrics.cost_micros",
                    "metrics.conversions",
                    "metrics.conversions_value",
                    "metrics.ctr",
                    "metrics.average_cpc",
                    "metrics.average_cpm"
                ],
                conditions=[
                    f"campaign.id = {campaign_id}",
                    f"segments.date BETWEEN '{start_date}' AND '{end_date}'"
                ]
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            # تجميع المقاييس
            total_metrics = CampaignMetrics()
            
            for row in response:
                metrics = row.metrics
                total_metrics.impressions += metrics.impressions
                total_metrics.clicks += metrics.clicks
                total_metrics.cost += metrics.cost_micros / 1000000
                total_metrics.conversions += metrics.conversions
                total_metrics.conversion_value += metrics.conversions_value
            
            # حساب المقاييس المشتقة
            total_metrics.calculate_derived_metrics()
            
            return total_metrics
            
        except Exception as e:
            logger.error(f"خطأ في جلب أداء الحملة {campaign_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3, cache_ttl=3600)
    def get_account_performance_summary(self, customer_id: str,
                                      date_range: Tuple[str, str]) -> Dict[str, Any]:
        """الحصول على ملخص أداء الحساب"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            start_date, end_date = date_range
            
            # جلب إحصائيات الحساب
            query = self._build_query(
                resource="customer",
                fields=[
                    "customer.id",
                    "metrics.impressions",
                    "metrics.clicks",
                    "metrics.cost_micros",
                    "metrics.conversions",
                    "metrics.conversions_value"
                ],
                conditions=[
                    f"segments.date BETWEEN '{start_date}' AND '{end_date}'"
                ]
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            # تجميع الإحصائيات
            summary = {
                'total_impressions': 0,
                'total_clicks': 0,
                'total_cost': 0.0,
                'total_conversions': 0,
                'total_conversion_value': 0.0,
                'average_ctr': 0.0,
                'average_cpc': 0.0,
                'roas': 0.0,
                'active_campaigns': 0,
                'date_range': date_range
            }
            
            for row in response:
                metrics = row.metrics
                summary['total_impressions'] += metrics.impressions
                summary['total_clicks'] += metrics.clicks
                summary['total_cost'] += metrics.cost_micros / 1000000
                summary['total_conversions'] += metrics.conversions
                summary['total_conversion_value'] += metrics.conversions_value
            
            # حساب المقاييس المشتقة
            summary['average_ctr'] = safe_divide(summary['total_clicks'], summary['total_impressions']) * 100
            summary['average_cpc'] = safe_divide(summary['total_cost'], summary['total_clicks'])
            summary['roas'] = safe_divide(summary['total_conversion_value'], summary['total_cost'])
            
            # جلب عدد الحملات النشطة
            campaigns = self.get_campaigns(customer_id, 'ENABLED')
            summary['active_campaigns'] = len(campaigns)
            
            return summary
            
        except Exception as e:
            logger.error(f"خطأ في جلب ملخص أداء الحساب {customer_id}: {str(e)}")
            raise
    
    # ===========================================
    # إدارة الكلمات المفتاحية
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_keywords(self, customer_id: str, campaign_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """الحصول على الكلمات المفتاحية"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            fields = [
                "ad_group_criterion.keyword.text",
                "ad_group_criterion.keyword.match_type",
                "ad_group_criterion.status",
                "ad_group_criterion.quality_info.quality_score",
                "ad_group.id",
                "ad_group.name",
                "campaign.id",
                "campaign.name"
            ]
            
            conditions = ["ad_group_criterion.type = KEYWORD"]
            if campaign_id:
                conditions.append(f"campaign.id = {campaign_id}")
            
            query = self._build_query(
                resource="keyword_view",
                fields=fields,
                conditions=conditions
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            keywords = []
            for row in response:
                criterion = row.ad_group_criterion
                ad_group = row.ad_group
                campaign = row.campaign
                
                keyword_data = {
                    'text': criterion.keyword.text,
                    'match_type': criterion.keyword.match_type.name,
                    'status': criterion.status.name,
                    'quality_score': criterion.quality_info.quality_score if criterion.quality_info else None,
                    'ad_group_id': ad_group.id,
                    'ad_group_name': ad_group.name,
                    'campaign_id': campaign.id,
                    'campaign_name': campaign.name
                }
                
                keywords.append(keyword_data)
            
            return keywords
            
        except Exception as e:
            logger.error(f"خطأ في جلب الكلمات المفتاحية: {str(e)}")
            raise
    
    # ===========================================
    # المراقبة والإحصائيات
    # ===========================================
    
    def get_metrics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        metrics = self.metrics.copy()
        
        # إضافة معلومات إضافية
        metrics.update({
            'is_authenticated': self.is_authenticated,
            'success_rate': (
                self.metrics['successful_operations'] / 
                max(self.metrics['total_operations'], 1)
            ) * 100,
            'config': asdict(self.config),
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return metrics
    
    def health_check(self) -> Dict[str, Any]:
        """فحص صحة النظام"""
        try:
            if not self.is_authenticated:
                return {
                    'status': 'unhealthy',
                    'authenticated': False,
                    'message': 'العميل غير مصادق',
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            # اختبار عملية بسيطة
            start_time = time.time()
            customer_service = self.client.get_service("CustomerService")
            accessible_customers = customer_service.list_accessible_customers()
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy',
                'authenticated': True,
                'api_response_time': response_time,
                'accessible_customers_count': len(accessible_customers.resource_names),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'authenticated': self.is_authenticated,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def reset_metrics(self):
        """إعادة تعيين الإحصائيات"""
        with self._lock:
            self.metrics = {
                'total_operations': 0,
                'successful_operations': 0,
                'failed_operations': 0,
                'average_response_time': 0.0,
                'last_operation_time': None,
                'operations_by_type': {},
                'api_quota_usage': 0,
                'rate_limit_hits': 0
            }

# إنشاء مثيل عام
google_ads_client = GoogleAdsClientService()

# دوال مساعدة للاستخدام السريع
def get_client_instance(config: Optional[GoogleAdsConfig] = None) -> GoogleAdsClientService:
    """الحصول على مثيل العميل"""
    if config:
        return GoogleAdsClientService(config)
    return google_ads_client

def validate_customer_id(customer_id: str) -> bool:
    """التحقق من صحة معرف العميل"""
    return customer_id.isdigit() and len(customer_id) >= 10

def format_campaign_budget(amount_micros: int) -> float:
    """تحويل الميزانية من micros إلى عملة"""
    return amount_micros / 1000000

def format_date_range(days_back: int = 30) -> Tuple[str, str]:
    """تنسيق نطاق التاريخ"""
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days_back)
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

# تصدير الكلاسات والدوال المهمة
__all__ = [
    'GoogleAdsConfig', 'CampaignMetrics', 'CampaignData', 
    'GoogleAdsClientService', 'google_ads_client',
    'get_client_instance', 'validate_customer_id', 
    'format_campaign_budget', 'format_date_range'
]

