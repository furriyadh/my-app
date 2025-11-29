# -*- coding: utf-8 -*-
"""
منشئ حملات التسوق (Shopping Campaigns)
======================================

هذا الملف يحتوي على جميع الوظائف المطلوبة لإنشاء حملات التسوق
باستخدام المكتبة الرسمية لـ Google Ads API.

       متطلبات حملات التسوق:
       - تتطلب صور منتجات: 800×800 (موصى به) أو 250×250 (حد أدنى)
       - تتطلب صور فريدة حسب عدد المنتجات
       - تتطلب Merchant Center مرتبط
       - تتطلب feed منتجات محدث
       - تتطلب عناوين إعلانية (15 عنوان كحد أقصى)
       - تتطلب أوصاف إعلانية (4 أوصاف كحد أقصى)
       - تتطلب استهداف الموقع واللغة
       - تتطلب استراتيجية مزايدة
       - تتطلب تتبع التحويلات
       - تتطلب معايير المنتجات

الميزات:
- تحليل الموقع للمنتجات والتصنيفات
- إنشاء إعلانات منتجات جذابة
- إنشاء حملة تسوق فعلية
- إعداد Merchant Center
- إعداد معايير المنتجات
- إعداد استهداف متقدم
"""

import uuid
import re
from typing import Dict, List, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.ads.googleads.v21.enums.types.advertising_channel_type import AdvertisingChannelTypeEnum
from google.ads.googleads.v21.enums.types.campaign_status import CampaignStatusEnum
from google.ads.googleads.v21.enums.types.budget_delivery_method import BudgetDeliveryMethodEnum
from google.ads.googleads.v21.enums.types.ad_group_type import AdGroupTypeEnum
from google.ads.googleads.v21.enums.types.ad_group_status import AdGroupStatusEnum
from google.ads.googleads.v21.enums.types.ad_group_ad_status import AdGroupAdStatusEnum
from google.ads.googleads.v21.enums.types.criterion_type import CriterionTypeEnum
from google.ads.googleads.v21.enums.types.campaign_criterion_status import CampaignCriterionStatusEnum
# from google.ads.googleads.v21.enums.types.product_bidding_category_level import ProductBiddingCategoryLevelEnum
# from google.ads.googleads.v21.enums.types.listing_group_type import ListingGroupTypeEnum
# from google.ads.googleads.v21.enums.types.product_channel import ProductChannelEnum
# from google.ads.googleads.v21.enums.types.product_channel_exclusivity import ProductChannelExclusivityEnum
# from google.ads.googleads.v21.enums.types.product_condition import ProductConditionEnum
from google.ads.googleads.v21.services.types.campaign_budget_service import CampaignBudgetOperation
from google.ads.googleads.v21.services.types.campaign_service import CampaignOperation
from google.ads.googleads.v21.services.types.ad_group_service import AdGroupOperation
from google.ads.googleads.v21.services.types.ad_group_ad_service import AdGroupAdOperation
from google.ads.googleads.v21.services.types.ad_group_criterion_service import AdGroupCriterionOperation
from google.ads.googleads.v21.resources.types.campaign import Campaign
from google.ads.googleads.v21.resources.types.campaign_budget import CampaignBudget
from google.ads.googleads.v21.resources.types.ad_group import AdGroup
from google.ads.googleads.v21.resources.types.ad_group_ad import AdGroupAd
from google.ads.googleads.v21.resources.types.ad_group_criterion import AdGroupCriterion
from google.ads.googleads.v21.common.types.ad_type_infos import ShoppingProductAdInfo
# from google.ads.googleads.v21.common.types.criteria import (
#     ProductBiddingCategoryInfo,
#     ProductBrandInfo,
#     ProductChannelInfo,
#     ProductChannelExclusivityInfo,
#     ProductConditionInfo,
#     ProductCustomAttributeInfo,
#     ProductItemIdInfo,
#     ProductTypeInfo
# )

import requests
from bs4 import BeautifulSoup
import os
from services.ai_content_generator import AIContentGenerator
from services.campaign_image_service import CampaignImageService


class ShoppingCampaignCreator:
    """منشئ حملات التسوق"""
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        self.client = client
        self.customer_id = customer_id
        self.ai_generator = AIContentGenerator()
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات التسوق"""
        return {
            "campaign_type": "SHOPPING",
            "name": "حملات التسوق",
            "description": "حملات إعلانية للمنتجات تظهر في نتائج البحث والتسوق",
                   "image_requirements": {
                       "required": True,
                       "min_images": 1,
                       "max_images": 1000,
                       "product_images": {
                           "recommended_size": "800×800",
                           "min_size": "250×250",
                           "max_file_size": "16 MB",
                           "formats": ["JPEG", "PNG", "GIF"],
                           "field_type": "AD_IMAGE",
                           "description": "صور المنتجات - عدد فريد حسب المنتجات"
                       }
                   },
            "merchant_center_requirements": {
                "required": True,
                "description": "حساب Merchant Center مرتبط"
            },
            "product_feed_requirements": {
                "required": True,
                "description": "feed منتجات محدث"
            },
            "text_requirements": {
                "headlines": {
                    "required": True,
                    "min_count": 15,
                    "max_count": 15,
                    "max_length": 30,
                    "description": "عناوين إعلانية جذابة"
                },
                "descriptions": {
                    "required": True,
                    "min_count": 4,
                    "max_count": 4,
                    "max_length": 90,
                    "description": "أوصاف إعلانية مقنعة"
                }
            },
            "product_criteria_requirements": {
                "required": True,
                "options": [
                    "product_bidding_category",
                    "product_brand",
                    "product_channel",
                    "product_condition",
                    "product_custom_attribute",
                    "product_item_id",
                    "product_type"
                ],
                "description": "معايير المنتجات"
            },
            "targeting_requirements": {
                "location": {
                    "required": True,
                    "description": "استهداف الموقع الجغرافي"
                },
                "language": {
                    "required": True,
                    "description": "استهداف اللغة"
                },
                "audience": {
                    "required": True,
                    "description": "استهداف الجمهور"
                },
                "device": {
                    "required": True,
                    "description": "استهداف الأجهزة"
                },
                "schedule": {
                    "required": True,
                    "description": "استهداف الأوقات"
                }
            },
            "bidding_requirements": {
                "required": True,
                "strategies": [
                    "MANUAL_CPC",
                    "TARGET_CPA",
                    "TARGET_ROAS",
                    "MAXIMIZE_CONVERSIONS",
                    "MAXIMIZE_CONVERSION_VALUE"
                ],
                "description": "استراتيجية المزايدة"
            },
            "conversion_tracking": {
                "required": True,
                "description": "تتبع التحويلات"
            },
            "network_settings": {
                "google_search": True,
                "search_network": True,
                "content_network": False,
                "partner_search_network": False,
                "youtube": False,
                "gmail": False,
                "discover": False
            },
            "ad_types": [
                "SHOPPING_PRODUCT_AD"
            ],
            "budget_requirements": {
                "min_daily_budget": 1.0,
                "currency": "USD",
                "delivery_method": "STANDARD"
            },
            "shopping_settings": {
                "merchant_id": {
                    "required": True,
                    "description": "معرف Merchant Center"
                },
                "sales_country": {
                    "required": True,
                    "description": "بلد المبيعات"
                },
                "campaign_priority": {
                    "required": True,
                    "options": ["LOW", "NORMAL", "HIGH"],
                    "description": "أولوية الحملة"
                }
            }
        }
    
    def analyze_website_for_shopping(self, website_url: str, target_language: str = "1019", 
                                   target_locations: List[str] = ["2682"]) -> Dict[str, Any]:
        """تحليل الموقع لاستخراج المنتجات والتصنيفات المناسبة لحملات التسوق"""
        print("🛒 تحليل الموقع لحملات التسوق...")
        print("=" * 50)
        
        try:
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # استخراج المنتجات
            products = self._extract_products_from_website(website_url)
            
            # تحليل التصنيفات
            categories = self._analyze_product_categories(products)
            
            # استخراج العلامات التجارية
            brands = self._extract_brands(products)
            
            # تحليل الأسعار
            price_analysis = self._analyze_pricing(products)
            
            result = {
                'title': website_content.get('title', f"متجر {website_url.split('/')[-1]}"),
                'description': website_content.get('description', f"منتجات عالية الجودة من {website_url}"),
                'products': products,
                'categories': categories,
                'brands': brands,
                'price_analysis': price_analysis,
                'campaign_type': 'SHOPPING',
                'website_url': website_url
            }
            
            print(f"✅ تم تحليل الموقع لحملات التسوق")
            print(f"🛍️ المنتجات: {len(products)} منتج")
            print(f"📂 التصنيفات: {len(categories)} تصنيف")
            print(f"🏷️ العلامات التجارية: {len(brands)} علامة")
            
            return result
            
        except Exception as e:
            print(f"❌ خطأ في تحليل الموقع: {e}")
            return None
    
    def generate_shopping_ad_copies(self, website_content: Dict[str, Any], 
                                  target_language: str = "1019") -> Dict[str, Any]:
        """إنشاء نسخ إعلانية لحملات التسوق"""
        print("🛒 إنشاء نسخ إعلانية لحملات التسوق...")
        print("=" * 50)
        
        try:
            # إعداد البيانات للذكاء الاصطناعي
            products = website_content.get('products', [])
            categories = website_content.get('categories', [])
            brands = website_content.get('brands', [])
            
            prompt = f"""
            أنشئ نسخ إعلانية جذابة لحملة تسوق Google Ads للموقع التالي:
            
            الموقع: {website_content.get('website_url', '')}
            العنوان: {website_content.get('title', '')}
            الوصف: {website_content.get('description', '')}
            المنتجات: {len(products)} منتج
            التصنيفات: {', '.join(categories[:5])}
            العلامات التجارية: {', '.join(brands[:5])}
            
            المطلوب:
            1. 5 عناوين إعلانية جذابة تركز على المنتجات
            2. 3 أوصاف إعلانية مقنعة تركز على الجودة والأسعار
            3. 3 دعوات للعمل واضحة للتسوق
            4. التركيز على الفوائد والجودة
            5. استخدام كلمات مفتاحية تجارية
            
            أرجو الإجابة بصيغة JSON:
            {{
                "headlines": ["العنوان 1", "العنوان 2", ...],
                "descriptions": ["الوصف 1", "الوصف 2", ...],
                "call_to_actions": ["دعوة 1", "دعوة 2", ...],
                "product_highlights": ["ميزة 1", "ميزة 2", ...]
            }}
            """
            
            # استخدام الذكاء الاصطناعي لإنشاء المحتوى
            ai_result = self.ai_generator.generate_complete_ad_content(
                website_url=website_content.get('website_url', ''),
                service_type="خدمات التسوق",
                target_language=target_language
            )
            
            if ai_result and ai_result.get('success'):
                ad_copies = ai_result.get('ad_copies', {})
                
                # إنشاء عناوين إعلانية
                headlines = ad_copies.get('headlines', [])
                if len(headlines) < 5:
                    additional_headlines = [
                        f"أفضل {website_content.get('title', 'منتجات')}",
                        f"جودة عالية وأسعار مناسبة",
                        f"تسوق آمن وموثوق",
                        f"منتجات أصلية 100%",
                        f"شحن سريع ومجاني"
                    ]
                    headlines.extend(additional_headlines[:5-len(headlines)])
                
                # إنشاء أوصاف إعلانية
                descriptions = ad_copies.get('descriptions', [])
                if len(descriptions) < 3:
                    additional_descriptions = [
                        f"اكتشف أفضل {website_content.get('title', 'منتجات')} بأسعار تنافسية",
                        f"منتجات عالية الجودة مع ضمان الجودة والاسترداد",
                        f"تسوق بثقة مع خدمة عملاء متميزة"
                    ]
                    descriptions.extend(additional_descriptions[:3-len(descriptions)])
                
                # إنشاء دعوات للعمل
                call_to_actions = [
                    "تسوق الآن",
                    "اطلب الآن",
                    "اشتر الآن"
                ]
                
                # إنشاء مميزات المنتجات
                product_highlights = [
                    "جودة عالية",
                    "أسعار تنافسية",
                    "شحن سريع",
                    "ضمان الجودة",
                    "خدمة عملاء 24/7"
                ]
                
                result = {
                    'headlines': headlines[:5],
                    'descriptions': descriptions[:3],
                    'call_to_actions': call_to_actions,
                    'product_highlights': product_highlights,
                    'images': ai_result.get('images', []),
                    'success': True
                }
                
                print("✅ تم إنشاء النسخ الإعلانية لحملات التسوق")
                print(f"🛍️ العناوين: {len(result['headlines'])} عنوان")
                print(f"📄 الأوصاف: {len(result['descriptions'])} وصف")
                
                return result
            else:
                print("❌ فشل في إنشاء النسخ الإعلانية")
                return {'success': False, 'error': 'فشل في إنشاء المحتوى'}
                
        except Exception as e:
            print(f"❌ خطأ في إنشاء النسخ الإعلانية: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_shopping_campaign(self, campaign_name: str, daily_budget: float,
                              target_locations: List[str], target_language: str,
                              products: List[Dict], ad_copies: Dict[str, Any]) -> str:
        """إنشاء حملة تسوق فعلية باستخدام Google Ads API"""
        print("🛒 إنشاء حملة التسوق...")
        print("=" * 50)
        
        try:
            if not self.client:
                print("⚠️ Google Ads API غير متاح - إرجاع معرف وهمي")
                return f"shopping_campaign_{uuid.uuid4().hex[:8]}"
            
            # 1. إنشاء ميزانية الحملة
            budget_resource_name = self._create_campaign_budget(campaign_name, daily_budget)
            
            # 2. إنشاء الحملة
            campaign_resource_name = self._create_shopping_campaign_core(
                campaign_name, budget_resource_name, target_locations, target_language
            )
            
            # 3. إنشاء مجموعة الإعلانات
            ad_group_resource_name = self._create_ad_group(campaign_resource_name, f"{campaign_name} - مجموعة المنتجات")
            
            # 4. إنشاء إعلانات المنتجات
            self._create_shopping_product_ads(ad_group_resource_name, ad_copies)
            
            # 5. إضافة معايير المنتجات
            self._add_product_criteria(ad_group_resource_name, products)
            
            campaign_id = campaign_resource_name.split('/')[-1]
            print(f"✅ تم إنشاء حملة التسوق بمعرف: {campaign_id}")
            return campaign_id
            
        except Exception as e:
            print(f"❌ خطأ في إنشاء حملة التسوق: {e}")
            raise Exception(f"فشل في إنشاء حملة التسوق: {e}")
    
    def _create_campaign_budget(self, campaign_name: str, daily_budget: float) -> str:
        """إنشاء ميزانية الحملة"""
        budget_service = self.client.get_service("CampaignBudgetService")
        budget_operation = self.client.get_type("CampaignBudgetOperation")
        budget = budget_operation.create
        
        budget.name = f"{campaign_name} - الميزانية"
        budget.delivery_method = BudgetDeliveryMethodEnum.STANDARD
        budget.amount_micros = int(daily_budget * 1_000_000)
        
        budget_response = budget_service.mutate_campaign_budgets(
            customer_id=self.customer_id,
            operations=[budget_operation]
        )
        
        return budget_response.results[0].resource_name
    
    def _create_shopping_campaign_core(self, campaign_name: str, budget_resource_name: str,
                                     target_locations: List[str], target_language: str) -> str:
        """إنشاء الحملة الأساسية"""
        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        campaign = campaign_operation.create
        
        campaign.name = campaign_name
        campaign.advertising_channel_type = AdvertisingChannelTypeEnum.SHOPPING
        campaign.status = CampaignStatusEnum.PAUSED
        campaign.campaign_budget = budget_resource_name
        
        # إعداد الشبكة
        campaign.network_settings.target_google_search = True
        campaign.network_settings.target_search_network = True
        campaign.network_settings.target_content_network = False
        campaign.network_settings.target_partner_search_network = False
        
        # إعداد اللغة والموقع
        campaign.language_constants.append(f"languageConstants/{target_language}")
        for location in target_locations:
            campaign.geo_targets.append(f"geoTargetConstants/{location}")
        
        # إعداد حملة التسوق
        campaign.shopping_setting.merchant_id = "123456789"  # يجب استبدالها بـ Merchant ID الفعلي
        campaign.shopping_setting.sales_country = "SA"  # السعودية
        campaign.shopping_setting.campaign_priority = 0
        campaign.shopping_setting.enable_local = True
        
        campaign.contains_eu_political_advertising = False
        
        response = campaign_service.mutate_campaigns(
            customer_id=self.customer_id,
            operations=[campaign_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_ad_group(self, campaign_resource_name: str, ad_group_name: str) -> str:
        """إنشاء مجموعة الإعلانات"""
        ad_group_service = self.client.get_service("AdGroupService")
        ad_group_operation = self.client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.create
        
        ad_group.name = ad_group_name
        ad_group.campaign = campaign_resource_name
        ad_group.type_ = AdGroupTypeEnum.SHOPPING_PRODUCT_ADS
        ad_group.status = AdGroupStatusEnum.ENABLED
        ad_group.cpc_bid_micros = 1_000_000  # 1 دولار
        
        response = ad_group_service.mutate_ad_groups(
            customer_id=self.customer_id,
            operations=[ad_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_shopping_product_ads(self, ad_group_resource_name: str, ad_copies: Dict[str, Any]):
        """إنشاء إعلانات منتجات التسوق"""
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create
        
        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.status = AdGroupAdStatusEnum.ENABLED
        
        # إنشاء إعلان منتج التسوق
        shopping_product_ad = ad_group_ad.ad.shopping_product_ad
        
        # إضافة النصوص
        headlines = ad_copies.get('headlines', [])
        descriptions = ad_copies.get('descriptions', [])
        
        if headlines:
            shopping_product_ad.headline = headlines[0]
        if descriptions:
            shopping_product_ad.description = descriptions[0]
        
        ad_group_ad_service.mutate_ad_group_ads(
            customer_id=self.customer_id,
            operations=[ad_group_ad_operation]
        )
    
    def _add_product_criteria(self, ad_group_resource_name: str, products: List[Dict]):
        """إضافة معايير المنتجات"""
        ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
        
        operations = []
        
        # إضافة معايير التصنيف
        categories = list(set([product.get('category', 'عام') for product in products]))
        
        for category in categories[:5]:  # أول 5 تصنيفات
            operation = self.client.get_type("AdGroupCriterionOperation")
            criterion = operation.create
            
            criterion.ad_group = ad_group_resource_name
            criterion.status = CampaignCriterionStatusEnum.ENABLED
            criterion.type_ = CriterionTypeEnum.PRODUCT_BIDDING_CATEGORY
            
            product_bidding_category = criterion.product_bidding_category
            product_bidding_category.level = self.client.enums.ProductBiddingCategoryLevelEnum.LEVEL1
            product_bidding_category.value = category
            
            criterion.cpc_bid_micros = 1_000_000  # 1 دولار
            
            operations.append(operation)
        
        # إضافة معايير القناة
        operation = self.client.get_type("AdGroupCriterionOperation")
        criterion = operation.create
        
        criterion.ad_group = ad_group_resource_name
        criterion.status = CampaignCriterionStatusEnum.ENABLED
        criterion.type_ = CriterionTypeEnum.PRODUCT_CHANNEL
        
        product_channel = criterion.product_channel
        product_channel.channel = self.client.enums.ProductChannelEnum.ONLINE
        
        operations.append(operation)
        
        # إضافة معايير الحالة
        operation = self.client.get_type("AdGroupCriterionOperation")
        criterion = operation.create
        
        criterion.ad_group = ad_group_resource_name
        criterion.status = CampaignCriterionStatusEnum.ENABLED
        criterion.type_ = CriterionTypeEnum.PRODUCT_CONDITION
        
        product_condition = criterion.product_condition
        product_condition.condition = self.client.enums.ProductConditionEnum.NEW
        
        operations.append(operation)
        
        if operations:
            ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=self.customer_id,
                operations=operations
            )
    
    def _fetch_website_content(self, website_url: str) -> Dict[str, str]:
        """جلب محتوى الموقع"""
        try:
            response = requests.get(website_url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            title = soup.find('title')
            title_text = title.get_text().strip() if title else ""
            
            description = soup.find('meta', attrs={'name': 'description'})
            description_text = description.get('content', '') if description else ""
            
            return {
                'title': title_text,
                'description': description_text
            }
        except Exception as e:
            print(f"⚠️ خطأ في جلب محتوى الموقع: {e}")
            return {'title': '', 'description': ''}
    
    def _extract_products_from_website(self, website_url: str) -> List[Dict[str, Any]]:
        """استخراج المنتجات من الموقع"""
        try:
            response = requests.get(website_url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            products = []
            
            # البحث عن المنتجات في HTML
            product_elements = soup.find_all(['div', 'article', 'section'], 
                                           class_=re.compile(r'product|item|card', re.I))
            
            for element in product_elements[:20]:  # أول 20 منتج
                product = {}
                
                # استخراج اسم المنتج
                name_elem = element.find(['h1', 'h2', 'h3', 'h4'], 
                                       class_=re.compile(r'title|name|product', re.I))
                if name_elem:
                    product['name'] = name_elem.get_text().strip()
                
                # استخراج السعر
                price_elem = element.find(['span', 'div'], 
                                        class_=re.compile(r'price|cost', re.I))
                if price_elem:
                    price_text = price_elem.get_text().strip()
                    price_match = re.search(r'[\d,]+\.?\d*', price_text)
                    if price_match:
                        product['price'] = float(price_match.group().replace(',', ''))
                
                # استخراج الصورة
                img_elem = element.find('img')
                if img_elem:
                    src = img_elem.get('src', '')
                    if src:
                        if src.startswith('http'):
                            product['image'] = src
                        elif src.startswith('/'):
                            product['image'] = f"{website_url.rstrip('/')}{src}"
                
                # استخراج التصنيف
                category_elem = element.find(['span', 'div'], 
                                           class_=re.compile(r'category|type', re.I))
                if category_elem:
                    product['category'] = category_elem.get_text().strip()
                
                if product.get('name'):
                    products.append(product)
            
            return products
            
        except Exception as e:
            print(f"⚠️ خطأ في استخراج المنتجات: {e}")
            return []
    
    def _analyze_product_categories(self, products: List[Dict[str, Any]]) -> List[str]:
        """تحليل تصنيفات المنتجات"""
        categories = []
        for product in products:
            category = product.get('category', 'عام')
            if category not in categories:
                categories.append(category)
        return categories[:10]  # أول 10 تصنيفات
    
    def _extract_brands(self, products: List[Dict[str, Any]]) -> List[str]:
        """استخراج العلامات التجارية"""
        brands = []
        for product in products:
            name = product.get('name', '')
            # البحث عن علامات تجارية شائعة
            brand_keywords = ['nike', 'adidas', 'apple', 'samsung', 'sony', 'lg', 'hp', 'dell']
            for brand in brand_keywords:
                if brand.lower() in name.lower() and brand not in brands:
                    brands.append(brand)
        return brands[:10]  # أول 10 علامات تجارية
    
    def _analyze_pricing(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """تحليل الأسعار"""
        prices = [product.get('price', 0) for product in products if product.get('price')]
        
        if not prices:
            return {'min_price': 0, 'max_price': 0, 'avg_price': 0, 'price_range': 'غير محدد'}
        
        return {
            'min_price': min(prices),
            'max_price': max(prices),
            'avg_price': sum(prices) / len(prices),
            'price_range': f"{min(prices):.2f} - {max(prices):.2f}"
        }
    
    def _add_merchant_center_setup(self, campaign_resource_name: str, merchant_center_id: str):
        """إعداد Merchant Center (متطلب رسمي لحملات التسوق)"""
        try:
            print("🏪 إعداد Merchant Center...")
            
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            
            campaign.resource_name = campaign_resource_name
            
            # إعداد Merchant Center
            campaign.shopping_setting.merchant_id = merchant_center_id
            campaign.shopping_setting.sales_country = "SA"  # السعودية
            campaign.shopping_setting.campaign_priority = 0
            campaign.shopping_setting.enable_local = True
            
            campaign_service.mutate_campaigns(
                customer_id=self.customer_id,
                operations=[campaign_operation]
            )
            
            print("✅ تم إعداد Merchant Center بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إعداد Merchant Center: {e}")
    
    def _add_product_feed_setup(self, campaign_resource_name: str):
        """إعداد تغذية المنتجات (متطلب رسمي لحملات التسوق)"""
        try:
            print("📦 إعداد تغذية المنتجات...")
            
            # إنشاء تغذية المنتجات
            feed_service = self.client.get_service("FeedService")
            feed_operation = self.client.get_type("FeedOperation")
            feed = feed_operation.create
            
            feed.name = "Product Feed"
            feed.origin = self.client.enums.FeedOriginEnum.USER
            feed.status = self.client.enums.FeedStatusEnum.ENABLED
            
            # إضافة سمات المنتجات
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[0].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[0].name = "id"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[1].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[1].name = "title"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[2].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[2].name = "description"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[3].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[3].name = "link"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[4].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[4].name = "image_link"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[5].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[5].name = "price"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[6].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[6].name = "availability"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[7].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[7].name = "brand"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[8].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[8].name = "condition"
            
            feed.attributes.append(self.client.get_type("FeedAttribute"))
            feed.attributes[9].type_ = self.client.enums.FeedAttributeTypeEnum.STRING
            feed.attributes[9].name = "product_type"
            
            feed_response = feed_service.mutate_feeds(
                customer_id=self.customer_id,
                operations=[feed_operation]
            )
            
            print("✅ تم إعداد تغذية المنتجات بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إعداد تغذية المنتجات: {e}")
    
    def _add_listing_groups(self, ad_group_resource_name: str):
        """إضافة مجموعات القوائم (متطلب رسمي لحملات التسوق)"""
        try:
            print("📋 إضافة مجموعات القوائم...")
            
            ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
            ad_group_criterion_operation = self.client.get_type("AdGroupCriterionOperation")
            ad_group_criterion = ad_group_criterion_operation.create
            
            ad_group_criterion.ad_group = ad_group_resource_name
            ad_group_criterion.type_ = CriterionTypeEnum.LISTING_GROUP
            ad_group_criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
            
            # إعداد مجموعة القوائم
            ad_group_criterion.listing_group.type_ = self.client.enums.ListingGroupTypeEnum.SUBDIVISION
            ad_group_criterion.listing_group.case_value.product_channel = self.client.enums.ProductChannelEnum.ONLINE
            
            ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=self.customer_id,
                operations=[ad_group_criterion_operation]
            )
            
            print("✅ تم إضافة مجموعات القوائم بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة مجموعات القوائم: {e}")
    
    def _add_product_criteria(self, ad_group_resource_name: str, products: List[Dict[str, Any]]):
        """إضافة معايير المنتجات (متطلب رسمي لحملات التسوق)"""
        try:
            print("🎯 إضافة معايير المنتجات...")
            
            ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
            operations = []
            
            for product in products[:10]:  # أول 10 منتجات
                operation = self.client.get_type("AdGroupCriterionOperation")
                ad_group_criterion = operation.create
                
                ad_group_criterion.ad_group = ad_group_resource_name
                ad_group_criterion.type_ = CriterionTypeEnum.PRODUCT_GROUP
                ad_group_criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
                
                # إعداد معايير المنتج
                ad_group_criterion.product_group.type_ = self.client.enums.ListingGroupTypeEnum.UNIT
                ad_group_criterion.product_group.case_value.product_item_id = product.get('id', '')
                
                operations.append(operation)
            
            if operations:
                ad_group_criterion_service.mutate_ad_group_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                
                print("✅ تم إضافة معايير المنتجات بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة معايير المنتجات: {e}")
    
    def _add_shopping_bidding_strategy(self, campaign_resource_name: str):
        """إضافة استراتيجية المزايدة للتسوق (متطلب رسمي لحملات التسوق)"""
        try:
            print("💰 إضافة استراتيجية المزايدة للتسوق...")
            
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            
            campaign.resource_name = campaign_resource_name
            
            # إعداد استراتيجية المزايدة للتسوق
            campaign.bidding_strategy_type = self.client.enums.BiddingStrategyTypeEnum.TARGET_ROAS
            campaign.target_roas.target_roas = 4.0  # 400% ROAS
            
            campaign_service.mutate_campaigns(
                customer_id=self.customer_id,
                operations=[campaign_operation]
            )
            
            print("✅ تم إضافة استراتيجية المزايدة للتسوق بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استراتيجية المزايدة للتسوق: {e}")
    
    def _add_shopping_conversion_tracking(self, campaign_resource_name: str):
        """إضافة تتبع تحويلات التسوق (متطلب رسمي لحملات التسوق)"""
        try:
            print("📊 إضافة تتبع تحويلات التسوق...")
            
            # البحث عن إجراءات التحويل الموجودة
            google_ads_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT conversion_action.resource_name, conversion_action.name
                FROM conversion_action
                WHERE conversion_action.status = ENABLED
                AND conversion_action.category = PURCHASE
                LIMIT 1
            """
            
            response = google_ads_service.search(
                customer_id=self.customer_id,
                query=query
            )
            
            if response:
                conversion_action = response[0].conversion_action.resource_name
                
                # إضافة تتبع التحويل للحملة
                campaign_service = self.client.get_service("CampaignService")
                campaign_operation = self.client.get_type("CampaignOperation")
                campaign = campaign_operation.update
                
                campaign.resource_name = campaign_resource_name
                campaign.selective_optimization.conversion_actions.append(conversion_action)
                
                campaign_service.mutate_campaigns(
                    customer_id=self.customer_id,
                    operations=[campaign_operation]
                )
                
                print("✅ تم إضافة تتبع تحويلات التسوق بنجاح")
            else:
                print("⚠️ لم يتم العثور على إجراءات تحويل للتسوق")
                
        except Exception as e:
            print(f"⚠️ خطأ في إضافة تتبع تحويلات التسوق: {e}")
