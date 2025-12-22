#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🚀 Dynamic Campaign Generator - مولد الحملات الديناميكي
========================================================

نظام متقدم لإنشاء وإدارة الحملات الإعلانية بشكل ديناميكي
لجميع حسابات Google Ads في MCC.

المميزات:
- إنشاء حملات مخصصة لكل حساب
- قوالب حملات ذكية
- تحسين تلقائي للحملات
- إدارة الميزانيات الديناميكية
- تخصيص المحتوى حسب الجمهور

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import os
import asyncio
from typing import Dict, Any, List, Optional, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import logging

from .mcc_manager import MCCManager, MCCAccount
from .bulk_operations import BulkOperationsManager, OperationType
from ..generator.campaign_generator import CampaignGenerator
from ..scraper.website_analyzer import WebsiteAnalyzer
from ..scraper.business_info import BusinessInfoExtractor
from ..utils.logger import setup_logger

# إعداد نظام السجلات
logger = setup_logger(__name__)

class CampaignType(Enum):
    """أنواع الحملات"""
    SEARCH = "SEARCH"
    DISPLAY = "DISPLAY"
    SHOPPING = "SHOPPING"
    VIDEO = "VIDEO"
    PERFORMANCE_MAX = "PERFORMANCE_MAX"
    SMART = "SMART"
    LOCAL = "LOCAL"

class CampaignObjective(Enum):
    """أهداف الحملات"""
    SALES = "sales"
    LEADS = "leads"
    WEBSITE_TRAFFIC = "website_traffic"
    BRAND_AWARENESS = "brand_awareness"
    APP_PROMOTION = "app_promotion"
    LOCAL_STORE_VISITS = "local_store_visits"

class BudgetStrategy(Enum):
    """استراتيجيات الميزانية"""
    FIXED = "fixed"
    PERCENTAGE_OF_REVENUE = "percentage_of_revenue"
    COMPETITIVE_BASED = "competitive_based"
    PERFORMANCE_BASED = "performance_based"
    SEASONAL_ADJUSTED = "seasonal_adjusted"

@dataclass
class CampaignTemplate:
    """
    📋 قالب الحملة
    """
    template_id: str
    name: str
    campaign_type: CampaignType
    objective: CampaignObjective
    budget_strategy: BudgetStrategy
    default_budget: float
    target_locations: List[str] = field(default_factory=list)
    target_languages: List[str] = field(default_factory=lambda: ['ar', 'en'])
    keywords_template: List[str] = field(default_factory=list)
    ad_copy_template: Dict[str, str] = field(default_factory=dict)
    bidding_strategy: str = "MAXIMIZE_CONVERSIONS"
    custom_settings: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل القالب إلى قاموس"""
        return {
            'template_id': self.template_id,
            'name': self.name,
            'campaign_type': self.campaign_type.value,
            'objective': self.objective.value,
            'budget_strategy': self.budget_strategy.value,
            'default_budget': self.default_budget,
            'target_locations': self.target_locations,
            'target_languages': self.target_languages,
            'keywords_template': self.keywords_template,
            'ad_copy_template': self.ad_copy_template,
            'bidding_strategy': self.bidding_strategy,
            'custom_settings': self.custom_settings
        }

@dataclass
class AccountCampaignData:
    """
    📊 بيانات حملة الحساب
    """
    account: MCCAccount
    business_info: Dict[str, Any] = field(default_factory=dict)
    website_data: Dict[str, Any] = field(default_factory=dict)
    competitor_data: Dict[str, Any] = field(default_factory=dict)
    historical_performance: Dict[str, Any] = field(default_factory=dict)
    custom_keywords: List[str] = field(default_factory=list)
    budget_recommendations: Dict[str, float] = field(default_factory=dict)
    
    def get_recommended_budget(self, campaign_type: CampaignType) -> float:
        """الحصول على الميزانية المقترحة لنوع حملة"""
        return self.budget_recommendations.get(campaign_type.value, 1000.0)

class DynamicCampaignGenerator:
    """
    🚀 مولد الحملات الديناميكي
    
    يوفر:
    - إنشاء حملات مخصصة لكل حساب
    - تحليل البيانات التجارية
    - تحسين الحملات تلقائياً
    - إدارة القوالب
    """
    
    def __init__(self, mcc_manager: Optional[MCCManager] = None):
        """
        تهيئة مولد الحملات الديناميكي
        
        Args:
            mcc_manager: مدير MCC
        """
        self.mcc_manager = mcc_manager or MCCManager()
        self.bulk_manager = BulkOperationsManager(self.mcc_manager)
        self.campaign_generator = CampaignGenerator()
        self.website_analyzer = WebsiteAnalyzer()
        self.business_extractor = BusinessInfoExtractor()
        
        # قوالب الحملات
        self.templates: Dict[str, CampaignTemplate] = {}
        self._load_default_templates()
        
        # بيانات الحسابات
        self.accounts_data: Dict[str, AccountCampaignData] = {}
        
        logger.info("🚀 تم تهيئة مولد الحملات الديناميكي")
    
    def _load_default_templates(self):
        """تحميل القوالب الافتراضية"""
        # قالب حملة البحث
        search_template = CampaignTemplate(
            template_id="search_basic",
            name="حملة البحث الأساسية",
            campaign_type=CampaignType.SEARCH,
            objective=CampaignObjective.SALES,
            budget_strategy=BudgetStrategy.PERFORMANCE_BASED,
            default_budget=1000.0,
            target_locations=["SA", "AE", "EG"],
            keywords_template=[
                "{business_name}",
                "{business_category}",
                "{main_products}",
                "شراء {main_products}",
                "{business_category} في {location}"
            ],
            ad_copy_template={
                "headline1": "{business_name} - {main_service}",
                "headline2": "أفضل {business_category} في {location}",
                "description": "احصل على {main_service} عالي الجودة. اتصل الآن!"
            }
        )
        
        # قالب حملة العرض
        display_template = CampaignTemplate(
            template_id="display_awareness",
            name="حملة العرض للوعي بالعلامة التجارية",
            campaign_type=CampaignType.DISPLAY,
            objective=CampaignObjective.BRAND_AWARENESS,
            budget_strategy=BudgetStrategy.FIXED,
            default_budget=500.0,
            target_locations=["SA", "AE", "EG"],
            ad_copy_template={
                "headline": "اكتشف {business_name}",
                "description": "{business_description}",
                "call_to_action": "تعرف أكثر"
            }
        )
        
        # قالب Performance Max
        pmax_template = CampaignTemplate(
            template_id="pmax_comprehensive",
            name="حملة الأداء الأقصى الشاملة",
            campaign_type=CampaignType.PERFORMANCE_MAX,
            objective=CampaignObjective.SALES,
            budget_strategy=BudgetStrategy.PERCENTAGE_OF_REVENUE,
            default_budget=2000.0,
            target_locations=["SA", "AE", "EG", "KW", "QA", "BH", "OM"],
            ad_copy_template={
                "headlines": [
                    "{business_name} - الخيار الأول",
                    "أفضل {business_category}",
                    "{main_service} عالي الجودة"
                ],
                "descriptions": [
                    "احصل على {main_service} بأفضل الأسعار",
                    "خدمة عملاء ممتازة وجودة مضمونة"
                ]
            }
        )
        
        # حفظ القوالب
        self.templates = {
            "search_basic": search_template,
            "display_awareness": display_template,
            "pmax_comprehensive": pmax_template
        }
        
        logger.info(f"📋 تم تحميل {len(self.templates)} قالب افتراضي")
    
    async def analyze_account_data(self, account: MCCAccount) -> AccountCampaignData:
        """
        تحليل بيانات الحساب
        
        Args:
            account: حساب MCC
            
        Returns:
            AccountCampaignData: بيانات الحساب المحللة
        """
        logger.info(f"🔍 تحليل بيانات الحساب: {account.name}")
        
        account_data = AccountCampaignData(account=account)
        
        try:
            # استخراج معلومات الأعمال
            if account.website_url:
                logger.info(f"🌐 تحليل الموقع: {account.website_url}")
                
                # تحليل الموقع
                website_analysis = await self.website_analyzer.analyze_website(account.website_url)
                account_data.website_data = website_analysis
                
                # استخراج معلومات الأعمال
                business_info = await self.business_extractor.extract_business_info(account.website_url)
                account_data.business_info = business_info
                
                # إنشاء كلمات مفتاحية مخصصة
                custom_keywords = self._generate_custom_keywords(business_info, website_analysis)
                account_data.custom_keywords = custom_keywords
                
                # حساب توصيات الميزانية
                budget_recommendations = self._calculate_budget_recommendations(
                    business_info, website_analysis, account
                )
                account_data.budget_recommendations = budget_recommendations
            
            # حفظ بيانات الحساب
            self.accounts_data[account.customer_id] = account_data
            
            logger.info(f"✅ تم تحليل بيانات الحساب: {account.name}")
            
        except Exception as e:
            logger.error(f"❌ فشل في تحليل بيانات الحساب {account.name}: {e}")
        
        return account_data
    
    def _generate_custom_keywords(
        self, 
        business_info: Dict[str, Any], 
        website_data: Dict[str, Any]
    ) -> List[str]:
        """
        إنشاء كلمات مفتاحية مخصصة
        
        Args:
            business_info: معلومات الأعمال
            website_data: بيانات الموقع
            
        Returns:
            List[str]: قائمة الكلمات المفتاحية
        """
        keywords = []
        
        # كلمات من اسم الشركة
        business_name = business_info.get('business_name', '')
        if business_name:
            keywords.extend([
                business_name,
                f"شركة {business_name}",
                f"{business_name} السعودية",
                f"{business_name} الإمارات"
            ])
        
        # كلمات من الخدمات
        services = business_info.get('services', [])
        for service in services[:5]:  # أول 5 خدمات
            keywords.extend([
                service,
                f"خدمة {service}",
                f"أفضل {service}",
                f"{service} في السعودية"
            ])
        
        # كلمات من المنتجات
        products = business_info.get('products', [])
        for product in products[:5]:  # أول 5 منتجات
            keywords.extend([
                product,
                f"شراء {product}",
                f"{product} عالي الجودة",
                f"أسعار {product}"
            ])
        
        # كلمات من فئة الأعمال
        category = business_info.get('business_category', '')
        if category:
            keywords.extend([
                category,
                f"أفضل {category}",
                f"{category} موثوق",
                f"{category} في المنطقة"
            ])
        
        # إزالة التكرارات وتنظيف القائمة
        keywords = list(set([kw.strip() for kw in keywords if kw.strip()]))
        
        return keywords[:50]  # أول 50 كلمة مفتاحية
    
    def _calculate_budget_recommendations(
        self,
        business_info: Dict[str, Any],
        website_data: Dict[str, Any],
        account: MCCAccount
    ) -> Dict[str, float]:
        """
        حساب توصيات الميزانية
        
        Args:
            business_info: معلومات الأعمال
            website_data: بيانات الموقع
            account: الحساب
            
        Returns:
            Dict[str, float]: توصيات الميزانية لكل نوع حملة
        """
        recommendations = {}
        
        # ميزانية أساسية حسب حجم الشركة
        base_budget = 1000.0
        
        # تعديل حسب عدد الخدمات/المنتجات
        services_count = len(business_info.get('services', []))
        products_count = len(business_info.get('products', []))
        complexity_multiplier = 1 + (services_count + products_count) * 0.1
        
        # تعديل حسب جودة الموقع
        website_quality = website_data.get('quality_score', 50) / 100
        quality_multiplier = 0.5 + website_quality
        
        # حساب الميزانيات
        adjusted_budget = base_budget * complexity_multiplier * quality_multiplier
        
        recommendations = {
            CampaignType.SEARCH.value: adjusted_budget,
            CampaignType.DISPLAY.value: adjusted_budget * 0.3,
            CampaignType.PERFORMANCE_MAX.value: adjusted_budget * 1.5,
            CampaignType.SHOPPING.value: adjusted_budget * 0.8,
            CampaignType.VIDEO.value: adjusted_budget * 0.4
        }
        
        return recommendations
    
    async def create_campaigns_for_account(
        self,
        account: MCCAccount,
        template_ids: List[str],
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        إنشاء حملات لحساب واحد
        
        Args:
            account: الحساب
            template_ids: معرفات القوالب
            custom_settings: إعدادات مخصصة
            
        Returns:
            Dict[str, Any]: نتائج إنشاء الحملات
        """
        logger.info(f"🚀 إنشاء حملات للحساب: {account.name}")
        
        results = {
            'account_id': account.customer_id,
            'account_name': account.name,
            'campaigns_created': [],
            'campaigns_failed': [],
            'total_budget': 0.0
        }
        
        try:
            # تحليل بيانات الحساب إذا لم تكن محللة
            if account.customer_id not in self.accounts_data:
                await self.analyze_account_data(account)
            
            account_data = self.accounts_data.get(account.customer_id)
            if not account_data:
                raise Exception("فشل في تحليل بيانات الحساب")
            
            # إنشاء حملة لكل قالب
            for template_id in template_ids:
                if template_id not in self.templates:
                    logger.warning(f"⚠️ قالب غير موجود: {template_id}")
                    continue
                
                template = self.templates[template_id]
                
                try:
                    # تخصيص الحملة للحساب
                    campaign_data = self._customize_campaign_for_account(
                        template, account_data, custom_settings
                    )
                    
                    # إنشاء الحملة
                    campaign_result = await self.campaign_generator.create_campaign(campaign_data)
                    
                    results['campaigns_created'].append({
                        'template_id': template_id,
                        'campaign_id': campaign_result.get('id'),
                        'campaign_name': campaign_result.get('name'),
                        'budget': campaign_data.get('budget', 0),
                        'status': 'created'
                    })
                    
                    results['total_budget'] += campaign_data.get('budget', 0)
                    
                    logger.info(f"✅ تم إنشاء حملة {template.name} للحساب {account.name}")
                    
                except Exception as e:
                    logger.error(f"❌ فشل في إنشاء حملة {template.name}: {e}")
                    results['campaigns_failed'].append({
                        'template_id': template_id,
                        'template_name': template.name,
                        'error': str(e)
                    })
            
        except Exception as e:
            logger.error(f"❌ فشل في إنشاء حملات للحساب {account.name}: {e}")
            results['error'] = str(e)
        
        return results
    
    def _customize_campaign_for_account(
        self,
        template: CampaignTemplate,
        account_data: AccountCampaignData,
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        تخصيص الحملة للحساب
        
        Args:
            template: قالب الحملة
            account_data: بيانات الحساب
            custom_settings: إعدادات مخصصة
            
        Returns:
            Dict[str, Any]: بيانات الحملة المخصصة
        """
        business_info = account_data.business_info
        account = account_data.account
        
        # بيانات أساسية للتخصيص
        customization_data = {
            'business_name': business_info.get('business_name', account.name),
            'business_category': business_info.get('business_category', 'خدمات'),
            'main_service': business_info.get('services', ['خدمات عامة'])[0] if business_info.get('services') else 'خدمات عامة',
            'main_products': ', '.join(business_info.get('products', ['منتجات'])[:3]),
            'location': business_info.get('location', 'السعودية'),
            'business_description': business_info.get('description', f'شركة {account.name} المتخصصة في تقديم أفضل الخدمات')
        }
        
        # إنشاء بيانات الحملة
        campaign_data = {
            'customer_id': account.customer_id,
            'name': self._customize_text(template.name, customization_data),
            'type': template.campaign_type.value,
            'objective': template.objective.value,
            'budget': account_data.get_recommended_budget(template.campaign_type),
            'bidding_strategy': template.bidding_strategy,
            'target_locations': template.target_locations,
            'target_languages': template.target_languages,
            'status': 'PAUSED'  # تبدأ متوقفة للمراجعة
        }
        
        # تخصيص الكلمات المفتاحية
        if template.keywords_template:
            customized_keywords = []
            for keyword_template in template.keywords_template:
                customized_keyword = self._customize_text(keyword_template, customization_data)
                customized_keywords.append(customized_keyword)
            
            # إضافة الكلمات المفتاحية المخصصة للحساب
            customized_keywords.extend(account_data.custom_keywords[:20])
            campaign_data['keywords'] = customized_keywords
        
        # تخصيص نسخ الإعلانات
        if template.ad_copy_template:
            customized_ads = {}
            for key, ad_template in template.ad_copy_template.items():
                if isinstance(ad_template, str):
                    customized_ads[key] = self._customize_text(ad_template, customization_data)
                elif isinstance(ad_template, list):
                    customized_ads[key] = [
                        self._customize_text(item, customization_data) 
                        for item in ad_template
                    ]
            campaign_data['ad_copy'] = customized_ads
        
        # دمج الإعدادات المخصصة
        if custom_settings:
            campaign_data.update(custom_settings)
        
        # دمج إعدادات القالب المخصصة
        if template.custom_settings:
            for key, value in template.custom_settings.items():
                if key not in campaign_data:
                    campaign_data[key] = value
        
        return campaign_data
    
    def _customize_text(self, template_text: str, data: Dict[str, Any]) -> str:
        """
        تخصيص النص باستخدام البيانات
        
        Args:
            template_text: نص القالب
            data: بيانات التخصيص
            
        Returns:
            str: النص المخصص
        """
        customized_text = template_text
        
        for key, value in data.items():
            placeholder = f"{{{key}}}"
            if placeholder in customized_text:
                customized_text = customized_text.replace(placeholder, str(value))
        
        return customized_text
    
    async def create_campaigns_bulk(
        self,
        template_ids: List[str],
        accounts: Optional[List[MCCAccount]] = None,
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        إنشاء حملات جماعية
        
        Args:
            template_ids: معرفات القوالب
            accounts: قائمة الحسابات (اختيارية)
            custom_settings: إعدادات مخصصة
            
        Returns:
            Dict[str, Any]: نتائج العملية الجماعية
        """
        logger.info(f"🚀 بدء إنشاء حملات جماعية باستخدام {len(template_ids)} قالب")
        
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
        
        # دالة إنشاء الحملات لحساب واحد
        async def create_campaigns_operation(account: MCCAccount, data: Dict[str, Any]) -> Dict[str, Any]:
            """عملية إنشاء الحملات لحساب واحد"""
            return await self.create_campaigns_for_account(
                account, 
                data['template_ids'], 
                data.get('custom_settings')
            )
        
        # تنفيذ العملية الجماعية
        operation_data = {
            'template_ids': template_ids,
            'custom_settings': custom_settings
        }
        
        summary = await self.bulk_manager.execute_bulk_operation(
            operation_type=OperationType.CREATE_CAMPAIGNS,
            operation_function=create_campaigns_operation,
            accounts=accounts,
            operation_data=operation_data
        )
        
        # تجميع النتائج
        total_campaigns = 0
        total_budget = 0.0
        
        for result in summary.results:
            if result.success and result.data:
                total_campaigns += len(result.data.get('campaigns_created', []))
                total_budget += result.data.get('total_budget', 0)
        
        return {
            'operation_id': summary.operation_id,
            'total_accounts': summary.total_accounts,
            'successful_accounts': summary.successful_accounts,
            'failed_accounts': summary.failed_accounts,
            'success_rate': summary.success_rate,
            'total_campaigns_created': total_campaigns,
            'total_budget_allocated': total_budget,
            'execution_time': summary.total_execution_time,
            'detailed_results': [result.to_dict() for result in summary.results]
        }
    
    def add_template(self, template: CampaignTemplate) -> bool:
        """
        إضافة قالب جديد
        
        Args:
            template: قالب الحملة
            
        Returns:
            bool: True إذا تم الإضافة بنجاح
        """
        try:
            self.templates[template.template_id] = template
            logger.info(f"✅ تم إضافة قالب جديد: {template.name}")
            return True
        except Exception as e:
            logger.error(f"❌ فشل في إضافة القالب: {e}")
            return False
    
    def get_templates(self) -> List[CampaignTemplate]:
        """الحصول على جميع القوالب"""
        return list(self.templates.values())
    
    def get_template(self, template_id: str) -> Optional[CampaignTemplate]:
        """الحصول على قالب محدد"""
        return self.templates.get(template_id)
    
    def remove_template(self, template_id: str) -> bool:
        """
        حذف قالب
        
        Args:
            template_id: معرف القالب
            
        Returns:
            bool: True إذا تم الحذف بنجاح
        """
        if template_id in self.templates:
            del self.templates[template_id]
            logger.info(f"🗑️ تم حذف القالب: {template_id}")
            return True
        return False
    
    def save_templates_to_file(self, file_path: str) -> bool:
        """
        حفظ القوالب في ملف
        
        Args:
            file_path: مسار الملف
            
        Returns:
            bool: True إذا تم الحفظ بنجاح
        """
        try:
            templates_data = {
                template_id: template.to_dict() 
                for template_id, template in self.templates.items()
            }
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(templates_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"💾 تم حفظ {len(self.templates)} قالب في {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ القوالب: {e}")
            return False
    
    def load_templates_from_file(self, file_path: str) -> bool:
        """
        تحميل القوالب من ملف
        
        Args:
            file_path: مسار الملف
            
        Returns:
            bool: True إذا تم التحميل بنجاح
        """
        try:
            if not os.path.exists(file_path):
                logger.warning(f"⚠️ ملف القوالب غير موجود: {file_path}")
                return False
            
            with open(file_path, 'r', encoding='utf-8') as f:
                templates_data = json.load(f)
            
            loaded_count = 0
            for template_id, template_dict in templates_data.items():
                try:
                    # تحويل القيم النصية إلى Enum
                    template_dict['campaign_type'] = CampaignType(template_dict['campaign_type'])
                    template_dict['objective'] = CampaignObjective(template_dict['objective'])
                    template_dict['budget_strategy'] = BudgetStrategy(template_dict['budget_strategy'])
                    
                    template = CampaignTemplate(**template_dict)
                    self.templates[template_id] = template
                    loaded_count += 1
                    
                except Exception as e:
                    logger.warning(f"⚠️ فشل في تحميل القالب {template_id}: {e}")
            
            logger.info(f"📋 تم تحميل {loaded_count} قالب من {file_path}")
            return loaded_count > 0
            
        except Exception as e:
            logger.error(f"❌ فشل في تحميل القوالب: {e}")
            return False

# دوال مساعدة للاستخدام السريع
def get_dynamic_campaign_generator() -> DynamicCampaignGenerator:
    """الحصول على مولد الحملات الديناميكي"""
    return DynamicCampaignGenerator()

async def create_campaigns_for_all_accounts_with_templates(
    template_ids: List[str],
    custom_settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """إنشاء حملات لجميع الحسابات باستخدام القوالب"""
    generator = get_dynamic_campaign_generator()
    return await generator.create_campaigns_bulk(template_ids, custom_settings=custom_settings)

# اختبار النظام
if __name__ == "__main__":
    print("🧪 اختبار مولد الحملات الديناميكي...")
    
    async def test_dynamic_generator():
        try:
            generator = DynamicCampaignGenerator()
            
            # عرض القوالب المتاحة
            templates = generator.get_templates()
            print(f"📋 القوالب المتاحة: {len(templates)}")
            for template in templates:
                print(f"  - {template.name} ({template.template_id})")
            
            # اختبار إنشاء حملات جماعية
            template_ids = ["search_basic", "display_awareness"]
            print(f"\n🚀 اختبار إنشاء حملات باستخدام القوالب: {template_ids}")
            
            result = await generator.create_campaigns_bulk(template_ids)
            
            print(f"✅ النتائج:")
            print(f"  📊 إجمالي الحسابات: {result.get('total_accounts', 0)}")
            print(f"  ✅ نجح: {result.get('successful_accounts', 0)}")
            print(f"  ❌ فشل: {result.get('failed_accounts', 0)}")
            print(f"  🚀 إجمالي الحملات: {result.get('total_campaigns_created', 0)}")
            print(f"  💰 إجمالي الميزانية: {result.get('total_budget_allocated', 0):.2f}")
            
        except Exception as e:
            print(f"❌ خطأ في الاختبار: {e}")
    
    # تشغيل الاختبار
    asyncio.run(test_dynamic_generator())

