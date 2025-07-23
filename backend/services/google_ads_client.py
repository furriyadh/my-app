
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
import yaml # إضافة استيراد مكتبة yaml

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
    from backend.utils.helpers import (
        generate_unique_id, validate_email, format_currency,
        calculate_performance_score, safe_divide
    )
    from backend.utils.redis_config import redis_manager
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
    
    # لا نحتاج لـ __post_init__ هنا لأننا سنقوم بتحميل الإعدادات من ملف YAML

@dataclass
class CampaignData:
    """نموذج بيانات الحملة"""
    id: str
    name: str
    status: str
    budget: float
    bid_strategy: str
    start_date: str
    end_date: Optional[str]
    target_cpa: Optional[float] = None
    target_roas: Optional[float] = None

@dataclass
class CampaignMetrics:
    """مقاييس أداء الحملة"""
    impressions: int = 0
    clicks: int = 0
    cost: float = 0.0 # بالدولار
    conversions: float = 0.0
    conversion_value: float = 0.0
    ctr: float = 0.0
    average_cpc: float = 0.0
    average_cpm: float = 0.0

    def calculate_derived_metrics(self):
        self.ctr = safe_divide(self.clicks, self.impressions) * 100
        self.average_cpc = safe_divide(self.cost, self.clicks)
        self.average_cpm = safe_divide(self.cost * 1000, self.impressions)

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
        if config:
            self.config = config
        else:
            config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "google_ads.yaml"))
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r') as f:
                        yaml_config = yaml.safe_load(f)
                    
                    # استخراج الإعدادات من ملف YAML
                    self.config = GoogleAdsConfig(
                        developer_token=yaml_config.get('developer_token', ''),
                        client_id=yaml_config.get('client_id', ''),
                        client_secret=yaml_config.get('client_secret', ''),
                        refresh_token=yaml_config.get('refresh_token'),
                        login_customer_id=yaml_config.get('login_customer_id')
                    )
                    logger.info(f"تم تحميل إعدادات Google Ads من {config_path}")
                except Exception as e:
                    logger.error(f"فشل تحميل إعدادات Google Ads من {config_path}: {str(e)}")
                    # Fallback to environment variables if YAML fails
                    self.config = GoogleAdsConfig(
                        developer_token=os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', ''),
                        client_id=os.getenv('GOOGLE_ADS_CLIENT_ID', ''),
                        client_secret=os.getenv('GOOGLE_ADS_CLIENT_SECRET', ''),
                        refresh_token=os.getenv('GOOGLE_ADS_REFRESH_TOKEN', ''),
                        login_customer_id=os.getenv('MCC_LOGIN_CUSTOMER_ID', '')
                    )
            else:
                logger.warning(f"ملف google_ads.yaml غير موجود في {config_path}. استخدام متغيرات البيئة.")
                self.config = GoogleAdsConfig(
                    developer_token=os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', ''),
                    client_id=os.getenv('GOOGLE_ADS_CLIENT_ID', ''),
                    client_secret=os.getenv('GOOGLE_ADS_CLIENT_SECRET', ''),
                    refresh_token=os.getenv('GOOGLE_ADS_REFRESH_TOKEN', ''),
                    login_customer_id=os.getenv('MCC_LOGIN_CUSTOMER_ID', '')
                )
        
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
            # استخدام get_oauth2_client لضمان التوافق
            oauth2_client = GoogleAdsClient.get_oauth2_client(self.config.version)
            oauth2_client.client_id = self.config.client_id
            oauth2_client.client_secret = self.config.client_secret
            oauth2_client.refresh_token = self.config.refresh_token
            oauth2_client.refresh()
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
            logger.error(f"خطأ في جلب ميزانيات الحملات للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_campaign_budget(self, customer_id: str, budget_data: Dict[str, Any]) -> str:
        """إنشاء ميزانية حملة جديدة"""
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
                    'quality_score': criterion.quality_info.quality_score,
                    'ad_group_id': ad_group.id,
                    'ad_group_name': ad_group.name,
                    'campaign_id': campaign.id,
                    'campaign_name': campaign.name
                }
                keywords.append(keyword_data)
            
            return keywords
            
        except Exception as e:
            logger.error(f"خطأ في جلب الكلمات المفتاحية للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_keyword(self, customer_id: str, ad_group_id: str, 
                       keyword_text: str, match_type: str) -> str:
        """إنشاء كلمة مفتاحية جديدة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
            ad_group_criterion_operation = self.client.get_type("AdGroupCriterionOperation")
            
            # إنشاء الكلمة المفتاحية
            ad_group_criterion = ad_group_criterion_operation.create
            ad_group_criterion.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad_group_criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
            
            ad_group_criterion.keyword.text = keyword_text
            ad_group_criterion.keyword.match_type = getattr(
                self.client.enums.KeywordMatchTypeEnum,
                match_type
            )
            
            # تنفيذ العملية
            response = ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=customer_id,
                operations=[ad_group_criterion_operation]
            )
            
            keyword_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء الكلمة المفتاحية بنجاح: {keyword_id}")
            
            return keyword_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الكلمة المفتاحية: {str(e)}")
            raise
    
    # ===========================================
    # إدارة الإعلانات
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_ads(self, customer_id: str, ad_group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """الحصول على الإعلانات"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            fields = [
                "ad_group_ad.ad.id",
                "ad_group_ad.ad.name",
                "ad_group_ad.status",
                "ad_group_ad.ad.final_urls",
                "ad_group_ad.ad.display_url",
                "ad_group_ad.ad.expanded_text_ad.headline_part1",
                "ad_group_ad.ad.expanded_text_ad.headline_part2",
                "ad_group_ad.ad.expanded_text_ad.headline_part3",
                "ad_group_ad.ad.expanded_text_ad.description",
                "ad_group_ad.ad.expanded_text_ad.description2",
                "ad_group.id",
                "ad_group.name",
                "campaign.id",
                "campaign.name"
            ]
            
            conditions = []
            if ad_group_id:
                conditions.append(f"ad_group.id = {ad_group_id}")
            
            query = self._build_query(
                resource="ad_group_ad",
                fields=fields,
                conditions=conditions
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            ads = []
            for row in response:
                ad_group_ad = row.ad_group_ad
                ad_group = row.ad_group
                campaign = row.campaign
                
                ad_data = {
                    'id': ad_group_ad.ad.id,
                    'name': ad_group_ad.ad.name,
                    'status': ad_group_ad.status.name,
                    'final_urls': list(ad_group_ad.ad.final_urls),
                    'display_url': ad_group_ad.ad.display_url,
                    'headline1': ad_group_ad.ad.expanded_text_ad.headline_part1,
                    'headline2': ad_group_ad.ad.expanded_text_ad.headline_part2,
                    'headline3': ad_group_ad.ad.expanded_text_ad.headline_part3,
                    'description1': ad_group_ad.ad.expanded_text_ad.description,
                    'description2': ad_group_ad.ad.expanded_text_ad.description2,
                    'ad_group_id': ad_group.id,
                    'ad_group_name': ad_group.name,
                    'campaign_id': campaign.id,
                    'campaign_name': campaign.name
                }
                ads.append(ad_data)
            
            return ads
            
        except Exception as e:
            logger.error(f"خطأ في جلب الإعلانات للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_expanded_text_ad(self, customer_id: str, ad_group_id: str,
                                headline1: str, headline2: str, description: str,
                                final_url: str, headline3: Optional[str] = None,
                                description2: Optional[str] = None) -> str:
        """إنشاء إعلان نصي موسع"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ad_group_ad_service = self.client.get_service("AdGroupAdService")
            ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
            
            # إنشاء الإعلان
            ad_group_ad = ad_group_ad_operation.create
            ad_group_ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad_group_ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            ad_group_ad.ad.final_urls.append(final_url)
            
            ad_group_ad.ad.expanded_text_ad.headline_part1 = headline1
            ad_group_ad.ad.expanded_text_ad.headline_part2 = headline2
            ad_group_ad.ad.expanded_text_ad.description = description
            
            if headline3:
                ad_group_ad.ad.expanded_text_ad.headline_part3 = headline3
            if description2:
                ad_group_ad.ad.expanded_text_ad.description2 = description2
            
            # تنفيذ العملية
            response = ad_group_ad_service.mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_group_ad_operation]
            )
            
            ad_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء الإعلان بنجاح: {ad_id}")
            
            return ad_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الإعلان: {str(e)}")
            raise
    
    # ===========================================
    # إدارة المجموعات الإعلانية
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=1800)
    def get_ad_groups(self, customer_id: str, campaign_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """الحصول على المجموعات الإعلانية"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            fields = [
                "ad_group.id",
                "ad_group.name",
                "ad_group.status",
                "ad_group.type",
                "ad_group.cpc_bid_micros",
                "campaign.id",
                "campaign.name"
            ]
            
            conditions = []
            if campaign_id:
                conditions.append(f"campaign.id = {campaign_id}")
            
            query = self._build_query(
                resource="ad_group",
                fields=fields,
                conditions=conditions
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            ad_groups = []
            for row in response:
                ad_group = row.ad_group
                campaign = row.campaign
                
                ad_group_data = {
                    'id': ad_group.id,
                    'name': ad_group.name,
                    'status': ad_group.status.name,
                    'type': ad_group.type.name,
                    'cpc_bid': ad_group.cpc_bid_micros / 1000000 if ad_group.cpc_bid_micros else 0,
                    'campaign_id': campaign.id,
                    'campaign_name': campaign.name
                }
                ad_groups.append(ad_group_data)
            
            return ad_groups
            
        except Exception as e:
            logger.error(f"خطأ في جلب المجموعات الإعلانية للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_ad_group(self, customer_id: str, campaign_id: str, 
                        ad_group_name: str, ad_group_type: str = 'STANDARD',
                        cpc_bid: float = 1.0) -> str:
        """إنشاء مجموعة إعلانية جديدة"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ad_group_service = self.client.get_service("AdGroupService")
            ad_group_operation = self.client.get_type("AdGroupOperation")
            
            # إنشاء المجموعة الإعلانية
            ad_group = ad_group_operation.create
            ad_group.name = ad_group_name
            ad_group.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
            ad_group.status = self.client.enums.AdGroupStatusEnum.ENABLED
            ad_group.type = getattr(
                self.client.enums.AdGroupTypeEnum,
                ad_group_type
            )
            ad_group.cpc_bid_micros = int(cpc_bid * 1000000)
            
            # تنفيذ العملية
            response = ad_group_service.mutate_ad_groups(
                customer_id=customer_id,
                operations=[ad_group_operation]
            )
            
            ad_group_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء المجموعة الإعلانية بنجاح: {ad_group_id}")
            
            return ad_group_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء المجموعة الإعلانية: {str(e)}")
            raise
    
    # ===========================================
    # إدارة العملاء (MCC)
    # ===========================================
    
    @google_ads_operation(retry_count=3, cache_ttl=3600)
    def get_customer_client_links(self, customer_id: str) -> List[Dict[str, Any]]:
        """الحصول على روابط عملاء MCC"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = self._build_query(
                resource="customer_client_link",
                fields=[
                    "customer_client_link.client_customer",
                    "customer_client_link.status",
                    "customer_client_link.manager_customer",
                    "customer_client_link.hidden"
                ]
            )
            
            response = ga_service.search(customer_id=customer_id, query=query)
            
            links = []
            for row in response:
                link = row.customer_client_link
                links.append({
                    'client_customer_id': link.client_customer.split('/')[-1],
                    'status': link.status.name,
                    'is_manager': link.manager_customer,
                    'is_hidden': link.hidden
                })
            
            return links
            
        except Exception as e:
            logger.error(f"خطأ في جلب روابط عملاء MCC للعميل {customer_id}: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def create_customer_client_link(self, manager_customer_id: str, 
                                    client_customer_id: str) -> str:
        """إنشاء رابط عميل جديد"""
        if not self.is_authenticated:
            raise Exception("العميل غير مصادق")
        
        try:
            customer_client_link_service = self.client.get_service("CustomerClientLinkService")
            customer_client_link_operation = self.client.get_type("CustomerClientLinkOperation")
            
            # إنشاء الرابط
            customer_client_link = customer_client_link_operation.create
            customer_client_link.client_customer = f"customers/{client_customer_id}"
            customer_client_link.manager_link_id = manager_customer_id # هذا ليس هو customer_id
            customer_client_link.status = self.client.enums.CustomerClientLinkStatusEnum.PENDING
            
            # تنفيذ العملية
            response = customer_client_link_service.mutate_customer_client_links(
                customer_id=manager_customer_id,
                operations=[customer_client_link_operation]
            )
            
            link_id = response.results[0].resource_name.split('/')[-1]
            logger.info(f"تم إنشاء رابط العميل بنجاح: {link_id}")
            
            return link_id
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رابط العميل: {str(e)}")
            raise
    
    # ===========================================
    # إدارة OAuth2
    # ===========================================
    
    @google_ads_operation(retry_count=3)
    def generate_oauth_url(self, redirect_uri: str, scopes: List[str]) -> str:
        """إنشاء عنوان URL للمصادقة OAuth2"""
        if not GOOGLE_ADS_AVAILABLE:
            raise Exception("Google Ads library غير متاح")
        
        try:
            oauth2_client = GoogleAdsClient.get_oauth2_client(self.config.version)
            oauth2_client.client_id = self.config.client_id
            oauth2_client.client_secret = self.config.client_secret
            oauth2_client.redirect_uri = redirect_uri
            
            authorization_url = oauth2_client.get_authorization_url(scopes)
            return authorization_url
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء عنوان URL للمصادقة OAuth2: {str(e)}")
            raise
    
    @google_ads_operation(retry_count=3)
    def exchange_authorization_code(self, authorization_code: str, redirect_uri: str) -> str:
        """تبادل رمز المصادقة برمز التحديث"""
        if not GOOGLE_ADS_AVAILABLE:
            raise Exception("Google Ads library غير متاح")
        
        try:
            oauth2_client = GoogleAdsClient.get_oauth2_client(self.config.version)
            oauth2_client.client_id = self.config.client_id
            oauth2_client.client_secret = self.config.client_secret
            oauth2_client.redirect_uri = redirect_uri
            
            refresh_token = oauth2_client.fetch_access_token(authorization_code)
            self.config.refresh_token = refresh_token # تحديث الرمز في الإعدادات
            
            logger.info("تم تبادل رمز المصادقة بنجاح")
            return refresh_token
            
        except Exception as e:
            logger.error(f"خطأ في تبادل رمز المصادقة: {str(e)}")
            raise
    
    # ===========================================
    # أدوات مساعدة
    # ===========================================
    
    def get_api_usage_metrics(self) -> Dict[str, Any]:
        """الحصول على مقاييس استخدام API"""
        with self._lock:
            return self.metrics
    
    def get_enum(self, enum_name: str):
        """الحصول على كائن Enum"""
        return getattr(self.client.enums, enum_name, None)





