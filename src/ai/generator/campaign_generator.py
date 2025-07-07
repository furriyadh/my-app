#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚀 Campaign Generator - مولد الحملات المحدث
===========================================

محرك إنشاء الحملات الرئيسي مع دعم نظام MCC الديناميكي.
يدعم إنشاء حملات Google Ads لحسابات متعددة بشكل متزامن.

المميزات الجديدة:
- دعم حسابات MCC متعددة
- إنشاء حملات متزامنة
- قوالب ديناميكية مخصصة
- تحسين تلقائي للحملات
- إدارة الميزانيات الذكية

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 2.0.0 (MCC Support)
"""

import logging
import asyncio
import os
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import json
import re
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor

# استيراد وحدات MCC
try:
    from ..mcc.mcc_manager import MCCManager, MCCAccount
    from ..mcc.bulk_operations import BulkOperationsManager
    MCC_AVAILABLE = True
except ImportError:
    MCC_AVAILABLE = False
    MCCManager = None
    MCCAccount = None
    BulkOperationsManager = None

from ..utils.logger import setup_logger

# إعداد نظام السجلات
logger = setup_logger(__name__)

class CampaignStatus(Enum):
    """حالات الحملة"""
    DRAFT = "DRAFT"
    PAUSED = "PAUSED"
    ENABLED = "ENABLED"
    REMOVED = "REMOVED"

class CampaignPriority(Enum):
    """أولويات الحملة"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class CampaignGenerationRequest:
    """
    📋 طلب إنشاء حملة
    """
    customer_id: str
    campaign_name: str
    campaign_type: str
    objective: str
    budget: float
    target_locations: List[str] = field(default_factory=list)
    target_languages: List[str] = field(default_factory=lambda: ['ar', 'en'])
    keywords: List[str] = field(default_factory=list)
    ad_copy: Dict[str, Any] = field(default_factory=dict)
    bidding_strategy: str = "MAXIMIZE_CONVERSIONS"
    status: CampaignStatus = CampaignStatus.PAUSED
    priority: CampaignPriority = CampaignPriority.MEDIUM
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    custom_settings: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل الطلب إلى قاموس"""
        return {
            'customer_id': self.customer_id,
            'campaign_name': self.campaign_name,
            'campaign_type': self.campaign_type,
            'objective': self.objective,
            'budget': self.budget,
            'target_locations': self.target_locations,
            'target_languages': self.target_languages,
            'keywords': self.keywords,
            'ad_copy': self.ad_copy,
            'bidding_strategy': self.bidding_strategy,
            'status': self.status.value,
            'priority': self.priority.value,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'custom_settings': self.custom_settings
        }

@dataclass
class CampaignGenerationResult:
    """
    📊 نتيجة إنشاء الحملة
    """
    request_id: str
    customer_id: str
    campaign_id: Optional[str] = None
    campaign_name: str = ""
    success: bool = False
    error_message: str = ""
    warnings: List[str] = field(default_factory=list)
    generated_assets: Dict[str, Any] = field(default_factory=dict)
    performance_estimates: Dict[str, float] = field(default_factory=dict)
    execution_time: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل النتيجة إلى قاموس"""
        return {
            'request_id': self.request_id,
            'customer_id': self.customer_id,
            'campaign_id': self.campaign_id,
            'campaign_name': self.campaign_name,
            'success': self.success,
            'error_message': self.error_message,
            'warnings': self.warnings,
            'generated_assets': self.generated_assets,
            'performance_estimates': self.performance_estimates,
            'execution_time': self.execution_time,
            'created_at': self.created_at.isoformat()
        }

class CampaignGenerator:
    """
    🚀 مولد الحملات المحدث
    
    محرك إنشاء الحملات الرئيسي مع دعم:
    - حسابات MCC متعددة
    - إنشاء حملات متزامنة
    - قوالب ديناميكية
    - تحسين تلقائي
    """
    
    def __init__(self, mcc_manager: Optional['MCCManager'] = None):
        """
        تهيئة مولد الحملات
        
        Args:
            mcc_manager: مدير MCC
        """
        self.mcc_manager = mcc_manager
        
        # إعدادات العمليات المتزامنة
        self.max_concurrent_campaigns = int(os.getenv('MCC_MAX_CONCURRENT_OPERATIONS', '5'))
        self.thread_pool = ThreadPoolExecutor(max_workers=self.max_concurrent_campaigns)
        
        # قوالب الحملات المحدثة
        self._initialize_campaign_templates()
        
        # إعدادات الصناعات
        self._initialize_industry_settings()
        
        # إحصائيات الأداء
        self.performance_stats = {
            'total_campaigns_created': 0,
            'successful_campaigns': 0,
            'failed_campaigns': 0,
            'average_execution_time': 0.0,
            'last_reset': datetime.now()
        }
        
        logger.info("🚀 تم تهيئة مولد الحملات المحدث مع دعم MCC")
    
    def _initialize_campaign_templates(self):
        """تهيئة قوالب الحملات"""
        self.campaign_templates = {
            "search_basic": {
                "name": "حملة البحث الأساسية",
                "type": "SEARCH",
                "networks": ["SEARCH"],
                "bidding_strategy": "MAXIMIZE_CONVERSIONS",
                "ad_groups": 3,
                "headlines_per_group": 15,
                "descriptions_per_group": 4,
                "keywords_per_group": 20,
                "extensions": ["sitelink", "callout", "structured_snippet"]
            },
            "search_advanced": {
                "name": "حملة البحث المتقدمة",
                "type": "SEARCH",
                "networks": ["SEARCH", "SEARCH_PARTNERS"],
                "bidding_strategy": "TARGET_CPA",
                "ad_groups": 5,
                "headlines_per_group": 15,
                "descriptions_per_group": 4,
                "keywords_per_group": 30,
                "extensions": ["sitelink", "callout", "structured_snippet", "call", "location"]
            },
            "display_awareness": {
                "name": "حملة العرض للوعي",
                "type": "DISPLAY",
                "networks": ["DISPLAY"],
                "bidding_strategy": "TARGET_CPM",
                "ad_groups": 3,
                "headlines_per_group": 5,
                "descriptions_per_group": 5,
                "audiences": ["affinity", "in_market", "custom_intent"],
                "placements": ["automatic", "managed"]
            },
            "performance_max": {
                "name": "حملة الأداء الأقصى",
                "type": "PERFORMANCE_MAX",
                "networks": ["SEARCH", "DISPLAY", "YOUTUBE", "GMAIL", "DISCOVER"],
                "bidding_strategy": "MAXIMIZE_CONVERSIONS",
                "asset_groups": 1,
                "headlines": 15,
                "descriptions": 4,
                "images": 15,
                "logos": 5,
                "videos": 5
            }
        }
        
        logger.info(f"📋 تم تحميل {len(self.campaign_templates)} قالب حملة")
    
    def _initialize_industry_settings(self):
        """تهيئة إعدادات الصناعات"""
        self.industry_settings = {
            "ecommerce": {
                "focus": "product_sales",
                "keywords": "commercial_intent",
                "bidding": "TARGET_ROAS",
                "extensions": ["sitelink", "callout", "structured_snippet", "price"],
                "recommended_campaigns": ["search_advanced", "performance_max"]
            },
            "local_business": {
                "focus": "local_visibility",
                "keywords": "local_intent",
                "bidding": "TARGET_CPA",
                "extensions": ["location", "call", "sitelink"],
                "recommended_campaigns": ["search_basic", "display_awareness"]
            },
            "services": {
                "focus": "lead_generation",
                "keywords": "service_intent",
                "bidding": "TARGET_CPA",
                "extensions": ["call", "callout", "structured_snippet"],
                "recommended_campaigns": ["search_advanced", "display_awareness"]
            }
        }
        
        logger.info(f"🏭 تم تحميل إعدادات {len(self.industry_settings)} صناعة")
    
    async def create_campaign(self, request: Union[CampaignGenerationRequest, Dict[str, Any]]) -> CampaignGenerationResult:
        """
        إنشاء حملة واحدة
        
        Args:
            request: طلب إنشاء الحملة
            
        Returns:
            CampaignGenerationResult: نتيجة إنشاء الحملة
        """
        start_time = datetime.now()
        request_id = f"campaign_{int(start_time.timestamp())}"
        
        # تحويل القاموس إلى كائن إذا لزم الأمر
        if isinstance(request, dict):
            request = self._dict_to_request(request)
        
        logger.info(f"🚀 بدء إنشاء حملة: {request.campaign_name} للحساب {request.customer_id}")
        
        result = CampaignGenerationResult(
            request_id=request_id,
            customer_id=request.customer_id,
            campaign_name=request.campaign_name
        )
        
        try:
            # التحقق من صحة الطلب
            validation_result = self._validate_request(request)
            if not validation_result['valid']:
                raise ValueError(f"طلب غير صحيح: {validation_result['errors']}")
            
            # إنشاء محتوى الحملة
            campaign_content = await self._generate_campaign_content(request)
            
            # إنشاء الحملة في Google Ads
            campaign_id = await self._create_google_ads_campaign(request, campaign_content)
            
            # حساب تقديرات الأداء
            performance_estimates = await self._calculate_performance_estimates(request, campaign_content)
            
            # تحديث النتيجة
            result.success = True
            result.campaign_id = campaign_id
            result.generated_assets = campaign_content
            result.performance_estimates = performance_estimates
            
            # تحديث الإحصائيات
            self.performance_stats['successful_campaigns'] += 1
            
            logger.info(f"✅ تم إنشاء الحملة بنجاح: {request.campaign_name}")
            
        except Exception as e:
            result.success = False
            result.error_message = str(e)
            self.performance_stats['failed_campaigns'] += 1
            logger.error(f"❌ فشل في إنشاء الحملة {request.campaign_name}: {e}")
        
        finally:
            # حساب وقت التنفيذ
            execution_time = (datetime.now() - start_time).total_seconds()
            result.execution_time = execution_time
            
            # تحديث الإحصائيات
            self.performance_stats['total_campaigns_created'] += 1
            self._update_average_execution_time(execution_time)
        
        return result
    
    async def create_campaigns_bulk(
        self,
        requests: List[Union[CampaignGenerationRequest, Dict[str, Any]]],
        max_concurrent: Optional[int] = None
    ) -> List[CampaignGenerationResult]:
        """
        إنشاء حملات متعددة بشكل متزامن
        
        Args:
            requests: قائمة طلبات إنشاء الحملات
            max_concurrent: الحد الأقصى للعمليات المتزامنة
            
        Returns:
            List[CampaignGenerationResult]: نتائج إنشاء الحملات
        """
        if not requests:
            return []
        
        max_concurrent = max_concurrent or self.max_concurrent_campaigns
        logger.info(f"🚀 بدء إنشاء {len(requests)} حملة بشكل متزامن (الحد الأقصى: {max_concurrent})")
        
        # تقسيم الطلبات إلى دفعات
        batches = [requests[i:i + max_concurrent] for i in range(0, len(requests), max_concurrent)]
        all_results = []
        
        for batch_index, batch in enumerate(batches, 1):
            logger.info(f"📦 معالجة الدفعة {batch_index}/{len(batches)} ({len(batch)} حملة)")
            
            # تنفيذ الدفعة الحالية
            batch_tasks = [self.create_campaign(request) for request in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # معالجة النتائج
            for i, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    # إنشاء نتيجة فشل للاستثناءات
                    error_result = CampaignGenerationResult(
                        request_id=f"error_{int(datetime.now().timestamp())}_{i}",
                        customer_id=batch[i].customer_id if hasattr(batch[i], 'customer_id') else "unknown",
                        campaign_name=batch[i].campaign_name if hasattr(batch[i], 'campaign_name') else "unknown",
                        success=False,
                        error_message=str(result)
                    )
                    all_results.append(error_result)
                else:
                    all_results.append(result)
            
            # فترة راحة بين الدفعات
            if batch_index < len(batches):
                await asyncio.sleep(1)
        
        # إحصائيات النتائج
        successful = sum(1 for r in all_results if r.success)
        failed = len(all_results) - successful
        
        logger.info(f"📊 اكتملت العملية الجماعية: {successful} نجح، {failed} فشل")
        
        return all_results
    
    async def create_campaigns_for_mcc_accounts(
        self,
        template_id: str,
        accounts: Optional[List['MCCAccount']] = None,
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        إنشاء حملات لحسابات MCC
        
        Args:
            template_id: معرف قالب الحملة
            accounts: قائمة الحسابات (اختيارية)
            custom_settings: إعدادات مخصصة
            
        Returns:
            Dict[str, Any]: ملخص العملية
        """
        if not MCC_AVAILABLE:
            raise ImportError("وحدة MCC غير متاحة")
        
        if not self.mcc_manager:
            self.mcc_manager = MCCManager()
        
        # الحصول على الحسابات
        if accounts is None:
            accounts = self.mcc_manager.get_client_accounts()
        
        if not accounts:
            return {
                'error': 'لا توجد حسابات متاحة',
                'total_accounts': 0,
                'successful_accounts': 0,
                'failed_accounts': 0
            }
        
        logger.info(f"🏢 إنشاء حملات لـ {len(accounts)} حساب MCC باستخدام القالب {template_id}")
        
        # إنشاء طلبات الحملات
        requests = []
        for account in accounts:
            request = await self._create_request_from_template(template_id, account, custom_settings)
            if request:
                requests.append(request)
        
        # تنفيذ العملية الجماعية
        results = await self.create_campaigns_bulk(requests)
        
        # تجميع النتائج
        successful_accounts = sum(1 for r in results if r.success)
        failed_accounts = len(results) - successful_accounts
        total_campaigns = len(results)
        
        return {
            'template_id': template_id,
            'total_accounts': len(accounts),
            'successful_accounts': successful_accounts,
            'failed_accounts': failed_accounts,
            'success_rate': (successful_accounts / len(accounts) * 100) if accounts else 0,
            'total_campaigns_created': total_campaigns,
            'detailed_results': [result.to_dict() for result in results]
        }
    
    async def _generate_campaign_content(self, request: CampaignGenerationRequest) -> Dict[str, Any]:
        """
        إنشاء محتوى الحملة
        
        Args:
            request: طلب إنشاء الحملة
            
        Returns:
            Dict[str, Any]: محتوى الحملة المُنشأ
        """
        content = {
            'campaign_info': {
                'name': request.campaign_name,
                'type': request.campaign_type,
                'objective': request.objective,
                'budget': request.budget,
                'bidding_strategy': request.bidding_strategy
            },
            'targeting': {
                'locations': request.target_locations,
                'languages': request.target_languages
            },
            'ad_groups': [],
            'keywords': [],
            'ads': [],
            'extensions': []
        }
        
        # الحصول على قالب الحملة
        template = self.campaign_templates.get(request.campaign_type.lower(), {})
        
        # إنشاء مجموعات الإعلانات
        ad_groups_count = template.get('ad_groups', 3)
        for i in range(ad_groups_count):
            ad_group = await self._generate_ad_group(request, i + 1, template)
            content['ad_groups'].append(ad_group)
        
        # إنشاء الكلمات المفتاحية
        if request.keywords:
            content['keywords'] = request.keywords
        else:
            # إنشاء كلمات مفتاحية أساسية
            generated_keywords = self._generate_basic_keywords(request)
            content['keywords'] = generated_keywords
        
        # إنشاء الإعلانات
        ads_count = template.get('headlines_per_group', 5)
        for i in range(ads_count):
            ad = await self._generate_ad(request, template)
            content['ads'].append(ad)
        
        # إنشاء الإضافات
        extensions = template.get('extensions', [])
        for extension_type in extensions:
            extension = await self._generate_extension(extension_type, request)
            if extension:
                content['extensions'].append(extension)
        
        return content
    
    def _generate_basic_keywords(self, request: CampaignGenerationRequest) -> List[str]:
        """إنشاء كلمات مفتاحية أساسية"""
        # كلمات مفتاحية أساسية بناءً على اسم الحملة ونوعها
        base_keywords = []
        
        # استخراج كلمات من اسم الحملة
        campaign_words = re.findall(r'\w+', request.campaign_name)
        base_keywords.extend(campaign_words)
        
        # إضافة كلمات حسب نوع الحملة
        type_keywords = {
            'SEARCH': ['خدمات', 'منتجات', 'شراء', 'أفضل'],
            'DISPLAY': ['عروض', 'خصومات', 'جديد', 'مميز'],
            'SHOPPING': ['متجر', 'تسوق', 'أسعار', 'عروض'],
            'PERFORMANCE_MAX': ['جودة', 'خدمة', 'سريع', 'موثوق']
        }
        
        base_keywords.extend(type_keywords.get(request.campaign_type, []))
        
        # إضافة كلمات حسب الهدف
        objective_keywords = {
            'SALES': ['شراء', 'طلب', 'احجز', 'اشتري'],
            'LEADS': ['استشارة', 'تواصل', 'معلومات', 'عرض سعر'],
            'WEBSITE_TRAFFIC': ['زيارة', 'تصفح', 'اكتشف', 'تعرف'],
            'BRAND_AWARENESS': ['علامة تجارية', 'شركة', 'خبرة', 'ثقة']
        }
        
        base_keywords.extend(objective_keywords.get(request.objective, []))
        
        return list(set(base_keywords))  # إزالة التكرار
    
    async def _generate_ad_group(self, request: CampaignGenerationRequest, group_number: int, template: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء مجموعة إعلانات"""
        return {
            'name': f"{request.campaign_name} - مجموعة {group_number}",
            'status': 'ENABLED',
            'type': 'SEARCH_STANDARD',
            'cpc_bid_micros': int(request.budget * 1000000 / 30),  # تقدير CPC
            'target_cpa_micros': int(request.budget * 1000000 / 10) if 'TARGET_CPA' in request.bidding_strategy else None
        }
    
    async def _generate_ad(self, request: CampaignGenerationRequest, template: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء إعلان"""
        # استخدام محتوى الإعلان المخصص إذا كان متاحاً
        if request.ad_copy:
            headlines = request.ad_copy.get('headlines', [])
            descriptions = request.ad_copy.get('descriptions', [])
        else:
            # إنشاء عناوين ووصف أساسية
            headlines = self._generate_basic_headlines(request)
            descriptions = self._generate_basic_descriptions(request)
        
        return {
            'type': 'EXPANDED_TEXT_AD',
            'headlines': headlines[:3],  # حد أقصى 3 عناوين
            'descriptions': descriptions[:2],  # حد أقصى 2 وصف
            'path1': 'خدمات',
            'path2': 'جودة',
            'final_urls': [request.custom_settings.get('landing_url', 'https://example.com' )]
        }
    
    def _generate_basic_headlines(self, request: CampaignGenerationRequest) -> List[str]:
        """إنشاء عناوين أساسية"""
        headlines = [
            f"{request.campaign_name} - خدمة متميزة",
            f"أفضل {request.campaign_name} في المنطقة",
            f"{request.campaign_name} بجودة عالية"
        ]
        return headlines
    
    def _generate_basic_descriptions(self, request: CampaignGenerationRequest) -> List[str]:
        """إنشاء أوصاف أساسية"""
        descriptions = [
            f"احصل على أفضل خدمات {request.campaign_name} بأسعار منافسة وجودة عالية.",
            f"نقدم لك {request.campaign_name} بخبرة واحترافية. اتصل بنا الآن!"
        ]
        return descriptions
    
    async def _generate_extension(self, extension_type: str, request: CampaignGenerationRequest) -> Optional[Dict[str, Any]]:
        """إنشاء إضافة"""
        extensions_map = {
            'sitelink': {
                'type': 'SITELINK',
                'sitelinks': [
                    {'text': 'خدماتنا', 'url': 'https://example.com/services'},
                    {'text': 'من نحن', 'url': 'https://example.com/about'},
                    {'text': 'اتصل بنا', 'url': 'https://example.com/contact'}
                ]
            },
            'callout': {
                'type': 'CALLOUT',
                'callouts': ['جودة عالية', 'خدمة ممتازة', 'أسعار منافسة', 'دعم 24/7']
            },
            'structured_snippet': {
                'type': 'STRUCTURED_SNIPPET',
                'header': 'الخدمات',
                'values': ['استشارات', 'تطوير', 'دعم', 'صيانة']
            },
            'call': {
                'type': 'CALL',
                'phone_number': request.custom_settings.get('phone', '+966501234567' ),
                'country_code': 'SA'
            },
            'location': {
                'type': 'LOCATION',
                'address': request.custom_settings.get('address', 'الرياض، السعودية')
            }
        }
        
        return extensions_map.get(extension_type)
    
    async def _create_google_ads_campaign(self, request: CampaignGenerationRequest, content: Dict[str, Any]) -> str:
        """إنشاء الحملة في Google Ads (محاكاة)"""
        # هذه دالة محاكاة - في التطبيق الحقيقي ستتصل بـ Google Ads API
        await asyncio.sleep(0.1)  # محاكاة وقت الاستجابة
        
        campaign_id = f"campaign_{int(datetime.now().timestamp())}_{request.customer_id}"
        logger.info(f"🎯 تم إنشاء الحملة في Google Ads: {campaign_id}")
        
        return campaign_id
    
    async def _calculate_performance_estimates(self, request: CampaignGenerationRequest, content: Dict[str, Any]) -> Dict[str, float]:
        """حساب تقديرات الأداء"""
        # تقديرات أساسية بناءً على نوع الحملة والميزانية
        base_ctr = 0.02  # معدل النقر الأساسي
        base_conversion_rate = 0.05  # معدل التحويل الأساسي
        
        # تعديل التقديرات حسب نوع الحملة
        campaign_type_multipliers = {
            'SEARCH': {'ctr': 1.2, 'conversion_rate': 1.1},
            'DISPLAY': {'ctr': 0.8, 'conversion_rate': 0.7},
            'SHOPPING': {'ctr': 1.0, 'conversion_rate': 1.3},
            'VIDEO': {'ctr': 0.6, 'conversion_rate': 0.8},
            'PERFORMANCE_MAX': {'ctr': 1.1, 'conversion_rate': 1.2}
        }
        
        multiplier = campaign_type_multipliers.get(request.campaign_type, {'ctr': 1.0, 'conversion_rate': 1.0})
        
        estimated_ctr = base_ctr * multiplier['ctr']
        estimated_conversion_rate = base_conversion_rate * multiplier['conversion_rate']
        
        # حساب التقديرات
        daily_budget = request.budget
        estimated_clicks = daily_budget / 2.0  # متوسط CPC = 2 ريال
        estimated_impressions = estimated_clicks / estimated_ctr
        estimated_conversions = estimated_clicks * estimated_conversion_rate
        
        return {
            'estimated_daily_impressions': round(estimated_impressions),
            'estimated_daily_clicks': round(estimated_clicks),
            'estimated_daily_conversions': round(estimated_conversions, 2),
            'estimated_ctr': round(estimated_ctr * 100, 2),
            'estimated_conversion_rate': round(estimated_conversion_rate * 100, 2),
            'estimated_cpc': round(daily_budget / estimated_clicks, 2) if estimated_clicks > 0 else 0,
            'estimated_cost_per_conversion': round(daily_budget / estimated_conversions, 2) if estimated_conversions > 0 else 0
        }
    
    async def _create_request_from_template(
        self,
        template_id: str,
        account: 'MCCAccount',
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Optional[CampaignGenerationRequest]:
        """إنشاء طلب حملة من قالب لحساب MCC"""
        if template_id not in self.campaign_templates:
            logger.warning(f"⚠️ قالب غير موجود: {template_id}")
            return None
        
        template = self.campaign_templates[template_id]
        settings = custom_settings or {}
        
        # إنشاء اسم الحملة
        campaign_name = f"{account.name} - {template['name']}"
        
        # إنشاء الطلب
        request = CampaignGenerationRequest(
            customer_id=account.customer_id,
            campaign_name=campaign_name,
            campaign_type=template['type'],
            objective=settings.get('objective', 'SALES'),
            budget=settings.get('budget', 1000.0),
            target_locations=settings.get('target_locations', ['SA']),
            target_languages=settings.get('target_languages', ['ar', 'en']),
            bidding_strategy=template.get('bidding_strategy', 'MAXIMIZE_CONVERSIONS'),
            custom_settings=settings
        )
        
        return request
    
    def _dict_to_request(self, data: Dict[str, Any]) -> CampaignGenerationRequest:
        """تحويل قاموس إلى طلب إنشاء حملة"""
        return CampaignGenerationRequest(
            customer_id=data['customer_id'],
            campaign_name=data['campaign_name'],
            campaign_type=data['campaign_type'],
            objective=data['objective'],
            budget=data['budget'],
            target_locations=data.get('target_locations', []),
            target_languages=data.get('target_languages', ['ar', 'en']),
            keywords=data.get('keywords', []),
            ad_copy=data.get('ad_copy', {}),
            bidding_strategy=data.get('bidding_strategy', 'MAXIMIZE_CONVERSIONS'),
            status=CampaignStatus(data.get('status', 'PAUSED')),
            priority=CampaignPriority(data.get('priority', 'MEDIUM')),
            custom_settings=data.get('custom_settings', {})
        )
    
    def _validate_request(self, request: CampaignGenerationRequest) -> Dict[str, Any]:
        """التحقق من صحة طلب إنشاء الحملة"""
        errors = []
        
        # التحقق من الحقول المطلوبة
        if not request.customer_id:
            errors.append("customer_id مطلوب")
        
        if not request.campaign_name:
            errors.append("campaign_name مطلوب")
        
        if not request.campaign_type:
            errors.append("campaign_type مطلوب")
        
        if request.budget <= 0:
            errors.append("budget يجب أن يكون أكبر من صفر")
        
        # التحقق من نوع الحملة
        valid_types = ['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'PERFORMANCE_MAX', 'LOCAL']
        if request.campaign_type not in valid_types:
            errors.append(f"campaign_type يجب أن يكون أحد: {valid_types}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def _update_average_execution_time(self, execution_time: float):
        """تحديث متوسط وقت التنفيذ"""
        current_avg = self.performance_stats['average_execution_time']
        total_campaigns = self.performance_stats['total_campaigns_created']
        
        if total_campaigns == 1:
            self.performance_stats['average_execution_time'] = execution_time
        else:
            # حساب المتوسط المتحرك
            new_avg = ((current_avg * (total_campaigns - 1)) + execution_time) / total_campaigns
            self.performance_stats['average_execution_time'] = new_avg
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        stats = self.performance_stats.copy()
        stats['success_rate'] = (
            (stats['successful_campaigns'] / stats['total_campaigns_created'] * 100)
            if stats['total_campaigns_created'] > 0 else 0
        )
        return stats
    
    def reset_performance_stats(self):
        """إعادة تعيين إحصائيات الأداء"""
        self.performance_stats = {
            'total_campaigns_created': 0,
            'successful_campaigns': 0,
            'failed_campaigns': 0,
            'average_execution_time': 0.0,
            'last_reset': datetime.now()
        }
        logger.info("📊 تم إعادة تعيين إحصائيات الأداء")
    
    def get_available_templates(self) -> List[Dict[str, Any]]:
        """الحصول على القوالب المتاحة"""
        return [
            {
                'id': template_id,
                'name': template_data['name'],
                'type': template_data['type'],
                'description': f"قالب {template_data['name']} لحملات {template_data['type']}"
            }
            for template_id, template_data in self.campaign_templates.items()
        ]
    
    def get_industry_recommendations(self, industry: str) -> Dict[str, Any]:
        """الحصول على توصيات الصناعة"""
        return self.industry_settings.get(industry, {})

# دوال مساعدة للاستخدام السريع
def get_campaign_generator(mcc_manager: Optional['MCCManager'] = None) -> CampaignGenerator:
    """الحصول على مولد الحملات"""
    return CampaignGenerator(mcc_manager=mcc_manager)

async def create_campaign_for_account(
    customer_id: str,
    campaign_name: str,
    campaign_type: str,
    budget: float,
    **kwargs
) -> CampaignGenerationResult:
    """إنشاء حملة لحساب واحد"""
    generator = get_campaign_generator()
    
    request = CampaignGenerationRequest(
        customer_id=customer_id,
        campaign_name=campaign_name,
        campaign_type=campaign_type,
        objective=kwargs.get('objective', 'SALES'),
        budget=budget,
        **kwargs
    )
    
    return await generator.create_campaign(request)

# تصدير الوحدات المهمة
__all__ = [
    'CampaignGenerator',
    'CampaignGenerationRequest',
    'CampaignGenerationResult',
    'CampaignStatus',
    'CampaignPriority',
    'get_campaign_generator',
    'create_campaign_for_account'
]
