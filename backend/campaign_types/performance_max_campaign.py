# -*- coding: utf-8 -*-
"""
منشئ حملات الأداء الأقصى (Performance Max Campaigns)
===================================================

هذا الملف يحتوي على جميع الوظائف المطلوبة لإنشاء حملات الأداء الأقصى
باستخدام المكتبة الرسمية لـ Google Ads API.

متطلبات حملات Performance Max:
- تتطلب صورًا: أفقي (1200×628) ومربع (1200×1200)
- تتطلب عناوين إعلانية (3-15 عنوان)
- تتطلب أوصاف إعلانية (2-4 أوصاف)
- تتطلب عنوان طويل (90 حرف كحد أقصى)
- تتطلب اسم العمل والشعار
- تتطلب أصول متعددة (صور، نصوص، فيديو)
- تتطلب استهداف الموقع واللغة
- تتطلب استراتيجية مزايدة (MAXIMIZE_CONVERSION_VALUE أو MAXIMIZE_CONVERSIONS)
- تتطلب تتبع التحويلات
- تتطلب Asset Groups

الميزات:
- تحليل الموقع الشامل
- إنشاء أصول متعددة (صور، نصوص، فيديو)
- إنشاء حملة أداء أقصى فعلية
- إعداد استراتيجيات المزايدة المتقدمة
- إعداد جميع الشبكات
- إنشاء Asset Groups
- إعداد Search Themes و Audiences
"""

import uuid
from typing import Dict, List, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.ads.googleads.v21.enums.types.asset_type import AssetTypeEnum
from google.ads.googleads.v21.enums.types.asset_field_type import AssetFieldTypeEnum
from google.ads.googleads.v21.enums.types.bidding_strategy_type import BiddingStrategyTypeEnum
from google.ads.googleads.v21.enums.types.advertising_channel_type import AdvertisingChannelTypeEnum
from google.ads.googleads.v21.enums.types.campaign_status import CampaignStatusEnum
from google.ads.googleads.v21.enums.types.budget_delivery_method import BudgetDeliveryMethodEnum
from google.ads.googleads.v21.services.types.campaign_budget_service import CampaignBudgetOperation
from google.ads.googleads.v21.services.types.campaign_service import CampaignOperation
from google.ads.googleads.v21.services.types.asset_service import AssetOperation
from google.ads.googleads.v21.services.types.asset_group_service import AssetGroupOperation
from google.ads.googleads.v21.services.types.asset_group_asset_service import AssetGroupAssetOperation
from google.ads.googleads.v21.resources.types.campaign import Campaign
from google.ads.googleads.v21.resources.types.campaign_budget import CampaignBudget
from google.ads.googleads.v21.resources.types.asset import Asset
from google.ads.googleads.v21.resources.types.asset_group import AssetGroup
from google.ads.googleads.v21.resources.types.asset_group_asset import AssetGroupAsset
from services.campaign_image_service import CampaignImageService
# from google.ads.googleads.v21.common.types.asset_types import (
#     AdTextAsset,
#     AdImageAsset,
#     AdVideoAsset,
#     AdCalloutAsset,
#     AdSitelinkAsset,
#     AdCallAsset,
#     AdLocationAsset
# )
# from google.ads.googleads.v21.common.types.criteria import (
#     LocationInfo,
#     LanguageInfo,
#     AgeRangeInfo,
#     GenderInfo,
#     UserListInfo
# )
# from google.ads.googleads.v21.enums.types.age_range_type import AgeRangeTypeEnum
# from google.ads.googleads.v21.enums.types.gender_type import GenderTypeEnum

import requests
from bs4 import BeautifulSoup
from services.ai_content_generator import AIContentGenerator


class PerformanceMaxCampaignCreator:
    """منشئ حملات الأداء الأقصى"""
    
    # Temporary IDs for resources (used in mutate operations)
    _BUDGET_TEMPORARY_ID = "-1"
    _CAMPAIGN_TEMPORARY_ID = "-2"
    _ASSET_GROUP_TEMPORARY_ID = "-3"
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        self.client = client
        self.customer_id = customer_id
        self.ai_generator = AIContentGenerator()
        self.next_temp_id = -4  # Start after asset group temp ID
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات Performance Max"""
        return {
            "campaign_type": "PERFORMANCE_MAX",
            "name": "حملات الأداء الأقصى",
            "description": "حملات إعلانية ذكية تعمل على جميع شبكات Google",
                   "image_requirements": {
                       "required": True,
                       "min_images": 4,
                       "max_images": 10,
                       "marketing_image": {
                           "size": "1200×628",
                           "aspect_ratio": "1.91:1",
                           "min_size": "600×314",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "field_type": "MARKETING_IMAGE",
                           "description": "صورة تسويقية أفقية"
                       },
                       "square_marketing_image": {
                           "size": "1200×1200",
                           "aspect_ratio": "1:1",
                           "min_size": "300×300",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "field_type": "SQUARE_MARKETING_IMAGE",
                           "description": "صورة تسويقية مربعة"
                       },
                       "logo": {
                           "size": "1200×628",
                           "aspect_ratio": "1.91:1",
                           "min_size": "600×314",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "field_type": "LOGO",
                           "description": "شعار العمل"
                       },
                       "landscape_logo": {
                           "size": "1200×628",
                           "aspect_ratio": "1.91:1",
                           "min_size": "600×314",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "field_type": "LANDSCAPE_LOGO",
                           "description": "شعار أفقي"
                       }
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
                },
                "long_headline": {
                    "required": True,
                    "max_length": 90,
                    "description": "عنوان طويل"
                },
                "business_name": {
                    "required": True,
                    "max_length": 25,
                    "description": "اسم العمل"
                }
            },
            "asset_requirements": {
                "required": True,
                "asset_groups": {
                    "required": True,
                    "min_count": 1,
                    "description": "مجموعات الأصول"
                },
                "final_urls": {
                    "required": True,
                    "min_count": 1,
                    "description": "روابط نهائية"
                }
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
                    "required": False,
                    "description": "استهداف الجمهور (اختياري)"
                },
                "search_themes": {
                    "required": False,
                    "description": "مواضيع البحث (اختياري)"
                }
            },
            "bidding_requirements": {
                "required": True,
                "strategies": [
                    "MAXIMIZE_CONVERSION_VALUE",
                    "MAXIMIZE_CONVERSIONS"
                ],
                "target_roas": {
                    "required": False,
                    "min_value": 1.0,
                    "max_value": 10.0,
                    "description": "هدف عائد الاستثمار"
                },
                "description": "استراتيجية المزايدة"
            },
            "conversion_tracking": {
                "required": True,
                "description": "تتبع التحويلات"
            },
            "network_settings": {
                "google_search": True,
                "search_network": True,
                "content_network": True,
                "partner_search_network": True,
                "youtube": True,
                "gmail": True,
                "discover": True,
                "maps": True
            },
            "ad_types": [
                "PERFORMANCE_MAX_AD"
            ],
            "budget_requirements": {
                "min_daily_budget": 1.0,
                "currency": "USD",
                "delivery_method": "STANDARD"
            },
            "special_requirements": {
                "url_expansion_opt_out": False,
                "brand_guidelines_enabled": False,
                "contains_eu_political_advertising": False
            }
        }
    
    def analyze_website_for_performance_max(self, website_url: str, target_language: str = "1019", 
                                         target_locations: List[str] = ["2682"]) -> Dict[str, Any]:
        """تحليل الموقع الشامل لحملات الأداء الأقصى"""
        print("🚀 تحليل الموقع لحملات الأداء الأقصى...")
        print("=" * 50)
        
        try:
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # استخراج الأصول
            assets = self._extract_assets_from_website(website_url)
            
            # تحليل شامل للمحتوى
            content_analysis = self._analyze_comprehensive_content(website_content, assets)
            
            result = {
                'title': website_content.get('title', f"موقع {website_url.split('/')[-1]}"),
                'description': website_content.get('description', f"خدمات متخصصة من {website_url}"),
                'assets': assets,
                'content_analysis': content_analysis,
                'campaign_type': 'PERFORMANCE_MAX',
                'website_url': website_url
            }
            
            print(f"✅ تم تحليل الموقع لحملات الأداء الأقصى")
            print(f"🎨 الأصول: {len(assets.get('images', []))} صورة")
            print(f"📝 النصوص: {len(assets.get('texts', []))} نص")
            
            return result
            
        except Exception as e:
            print(f"❌ خطأ في تحليل الموقع: {e}")
            return None
    
    def generate_performance_max_assets(self, website_content: Dict[str, Any], 
                                     target_language: str = "1019") -> Dict[str, Any]:
        """إنشاء أصول حملات الأداء الأقصى"""
        print("🚀 إنشاء أصول حملات الأداء الأقصى...")
        print("=" * 50)
        
        try:
            # استخدام الذكاء الاصطناعي لإنشاء المحتوى
            ai_result = self.ai_generator.generate_complete_ad_content(
                website_url=website_content.get('website_url', ''),
                service_type="خدمات الأداء الأقصى",
                target_language=target_language
            )
            
            if ai_result and ai_result.get('success'):
                ad_copies = ai_result.get('ad_copies', {})
                
                # إنشاء العناوين
                headlines = ad_copies.get('headlines', [])
                if len(headlines) < 15:
                    additional_headlines = [
                        f"اكتشف {website_content.get('title', 'خدماتنا')}",
                        f"جودة استثنائية",
                        f"نتائج مذهلة",
                        f"تجربة فريدة",
                        f"تميز في كل تفصيل",
                        f"أفضل الأسعار",
                        f"خدمة 24/7",
                        f"ضمان الجودة",
                        f"نتائج سريعة",
                        f"خبرة سنوات"
                    ]
                    headlines.extend(additional_headlines[:15-len(headlines)])
                
                # إنشاء الأوصاف
                descriptions = ad_copies.get('descriptions', [])
                if len(descriptions) < 4:
                    additional_descriptions = [
                        f"استمتع بأفضل {website_content.get('title', 'خدمات')} معنا",
                        f"نقدم لك تجربة لا تُنسى مع ضمان الجودة",
                        f"اكتشف الفرق مع خدماتنا المتميزة",
                        f"حلول مبتكرة تناسب احتياجاتك"
                    ]
                    descriptions.extend(additional_descriptions[:4-len(descriptions)])
                
                result = {
                    'headlines': headlines[:15],
                    'descriptions': descriptions[:4],
                    'call_to_actions': ["اكتشف المزيد", "ابدأ الآن", "احجز موعدك", "تسوق الآن"],
                    'images': ai_result.get('images', []),
                    'success': True
                }
                
                print("✅ تم إنشاء أصول حملات الأداء الأقصى")
                print(f"📰 العناوين: {len(result['headlines'])} عنوان")
                print(f"📄 الأوصاف: {len(result['descriptions'])} وصف")
                
                return result
            else:
                print("❌ فشل في إنشاء الأصول")
                return {'success': False, 'error': 'فشل في إنشاء المحتوى'}
                
        except Exception as e:
            print(f"❌ خطأ في إنشاء الأصول: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_performance_max_campaign(self, campaign_name: str, daily_budget: float,
                                     target_locations: List[str], target_language: str,
                                     assets: Dict[str, Any], website_url: str = "https://www.example.com") -> str:
        """إنشاء حملة أداء أقصى فعلية (حسب المكتبة الرسمية)"""
        print("🚀 إنشاء حملة الأداء الأقصى...")
        print("=" * 50)
        
        try:
            if not self.client:
                print("⚠️ Google Ads API غير متاح - إرجاع معرف وهمي")
                return f"performance_max_campaign_{uuid.uuid4().hex[:8]}"
            
            googleads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء Assets للعناوين والأوصاف أولاً
            headline_asset_resource_names = self._create_multiple_text_assets(
                assets.get('headlines', [])[:15]
            )
            description_asset_resource_names = self._create_multiple_text_assets(
                assets.get('descriptions', [])[:4]
            )
            
            # إنشاء Operations للحملة وAsset Group
            mutate_operations = []
            
            # 1. Budget Operation
            mutate_operations.append(self._create_campaign_budget_operation(campaign_name, daily_budget))
            
            # 2. Campaign Operation
            mutate_operations.append(self._create_performance_max_campaign_operation(
                campaign_name, target_locations, target_language
            ))
            
            # 3. Campaign Criterion Operations (location & language)
            mutate_operations.extend(self._create_campaign_criterion_operations(
                target_locations, target_language
            ))
            
            # 4. Asset Group Operations
            mutate_operations.extend(self._create_asset_group_operations(
                headline_asset_resource_names,
                description_asset_resource_names,
                assets,
                website_url
            ))
            
            # إرسال جميع Operations في Mutate واحد (Best Practice)
            response = googleads_service.mutate(
                customer_id=self.customer_id,
                mutate_operations=mutate_operations
            )
            
            # استخراج معرف الحملة
            campaign_id = None
            for result in response.mutate_operation_responses:
                if result._pb.HasField("campaign_result"):
                    campaign_resource_name = result.campaign_result.resource_name
                    campaign_id = campaign_resource_name.split('/')[-1]
                    break
            
            print(f"✅ تم إنشاء حملة الأداء الأقصى بمعرف: {campaign_id}")
            return campaign_id
            
        except Exception as e:
            print(f"❌ خطأ في إنشاء حملة الأداء الأقصى: {e}")
            raise Exception(f"فشل في إنشاء حملة الأداء الأقصى: {e}")
    
    def _create_campaign_budget_operation(self, campaign_name: str, daily_budget: float):
        """إنشاء عملية ميزانية الحملة (حسب المكتبة الرسمية)"""
        mutate_operation = self.client.get_type("MutateOperation")
        campaign_budget = mutate_operation.campaign_budget_operation.create
        
        campaign_budget.name = f"Performance Max Budget #{uuid.uuid4()}"
        campaign_budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
        campaign_budget.amount_micros = int(daily_budget * 1_000_000)
        # Performance Max campaigns cannot use a shared campaign budget
        campaign_budget.explicitly_shared = False
        campaign_budget.resource_name = self.client.get_service("CampaignBudgetService").campaign_budget_path(
            self.customer_id,
            self._BUDGET_TEMPORARY_ID
        )
        
        return mutate_operation
    
    def _create_performance_max_campaign_operation(self, campaign_name: str, 
                                                  target_locations: List[str], 
                                                  target_language: str):
        """إنشاء عملية حملة الأداء الأقصى (حسب المكتبة الرسمية)"""
        mutate_operation = self.client.get_type("MutateOperation")
        campaign = mutate_operation.campaign_operation.create
        campaign_service = self.client.get_service("CampaignService")
        
        campaign.name = f"Performance Max Campaign #{uuid.uuid4()}"
        # Set campaign status as PAUSED
        campaign.status = self.client.enums.CampaignStatusEnum.PAUSED
        # All Performance Max campaigns have PERFORMANCE_MAX type
        campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.PERFORMANCE_MAX
        
        # Bidding strategy: Maximize Conversion Value with target ROAS
        campaign.bidding_strategy_type = self.client.enums.BiddingStrategyTypeEnum.MAXIMIZE_CONVERSION_VALUE
        campaign.maximize_conversion_value.target_roas = 3.5
        
        # Set Final URL expansion opt out
        campaign.url_expansion_opt_out = False
        
        campaign.campaign_budget = self.client.get_service("CampaignBudgetService").campaign_budget_path(
            self.customer_id,
            self._BUDGET_TEMPORARY_ID
        )
        campaign.resource_name = campaign_service.campaign_path(
            self.customer_id,
            self._CAMPAIGN_TEMPORARY_ID
        )
        
        return mutate_operation
    
    def _create_campaign_criterion_operations(self, target_locations: List[str], target_language: str):
        """إنشاء عمليات معايير الحملة (Location & Language)"""
        operations = []
        campaign_service = self.client.get_service("CampaignService")
        geo_target_service = self.client.get_service("GeoTargetConstantService")
        googleads_service = self.client.get_service("GoogleAdsService")
        
        # إضافة Location targeting
        for location_id in target_locations:
            mutate_operation = self.client.get_type("MutateOperation")
            campaign_criterion = mutate_operation.campaign_criterion_operation.create
            campaign_criterion.campaign = campaign_service.campaign_path(
                self.customer_id,
                self._CAMPAIGN_TEMPORARY_ID
            )
            campaign_criterion.location.geo_target_constant = (
                geo_target_service.geo_target_constant_path(location_id)
            )
            campaign_criterion.negative = False
            operations.append(mutate_operation)
        
        # إضافة Language targeting
        mutate_operation = self.client.get_type("MutateOperation")
        campaign_criterion = mutate_operation.campaign_criterion_operation.create
        campaign_criterion.campaign = campaign_service.campaign_path(
            self.customer_id,
            self._CAMPAIGN_TEMPORARY_ID
        )
        campaign_criterion.language.language_constant = (
            googleads_service.language_constant_path(target_language)
        )
        operations.append(mutate_operation)
        
        return operations
    
    def _create_asset_group_operations(self, headline_asset_resource_names: List[str],
                                       description_asset_resource_names: List[str],
                                       assets: Dict[str, Any],
                                       website_url: str):
        """إنشاء عمليات مجموعة الأصول (حسب المكتبة الرسمية)"""
        operations = []
        asset_group_service = self.client.get_service("AssetGroupService")
        campaign_service = self.client.get_service("CampaignService")
        
        # 1. إنشاء AssetGroup
        mutate_operation = self.client.get_type("MutateOperation")
        asset_group = mutate_operation.asset_group_operation.create
        asset_group.name = f"Performance Max asset group {uuid.uuid4()}"
        asset_group.campaign = campaign_service.campaign_path(
            self.customer_id,
            self._CAMPAIGN_TEMPORARY_ID
        )
        asset_group.final_urls.append(website_url)
        asset_group.final_mobile_urls.append(website_url)
        asset_group.status = self.client.enums.AssetGroupStatusEnum.PAUSED
        asset_group.resource_name = asset_group_service.asset_group_path(
            self.customer_id,
            self._ASSET_GROUP_TEMPORARY_ID
        )
        operations.append(mutate_operation)
        
        # 2. ربط Headlines
        for resource_name in headline_asset_resource_names:
            mutate_operation = self.client.get_type("MutateOperation")
            asset_group_asset = mutate_operation.asset_group_asset_operation.create
            asset_group_asset.field_type = self.client.enums.AssetFieldTypeEnum.HEADLINE
            asset_group_asset.asset_group = asset_group_service.asset_group_path(
                self.customer_id,
                self._ASSET_GROUP_TEMPORARY_ID
            )
            asset_group_asset.asset = resource_name
            operations.append(mutate_operation)
        
        # 3. ربط Descriptions
        for resource_name in description_asset_resource_names:
            mutate_operation = self.client.get_type("MutateOperation")
            asset_group_asset = mutate_operation.asset_group_asset_operation.create
            asset_group_asset.field_type = self.client.enums.AssetFieldTypeEnum.DESCRIPTION
            asset_group_asset.asset_group = asset_group_service.asset_group_path(
                self.customer_id,
                self._ASSET_GROUP_TEMPORARY_ID
            )
            asset_group_asset.asset = resource_name
            operations.append(mutate_operation)
        
        # 4. إنشاء وربط Long Headline
        long_headline = assets.get('long_headline', 'Discover Amazing Services')
        operations.extend(self._create_and_link_text_asset(
            long_headline,
            self.client.enums.AssetFieldTypeEnum.LONG_HEADLINE
        ))
        
        # 5. إنشاء وربط Business Name
        business_name = assets.get('business_name', 'My Business')
        operations.extend(self._create_and_link_text_asset(
            business_name,
            self.client.enums.AssetFieldTypeEnum.BUSINESS_NAME
        ))
        
        # 6. إنشاء وربط Marketing Images
        # Generate images if not provided
        print("🎨 إنشاء الصور التسويقية...")
        try:
            from services.image_generation_service import ImageGenerationService
            image_service = ImageGenerationService()
            
            # Generate Marketing Image (1792x1024 - landscape for Performance Max)
            business_name = assets.get('business_name', 'خدمات')
            headlines = assets.get('headlines', [])
            keywords_text = ', '.join(headlines[:3]) if headlines else business_name
            
            # برومبت ذكي محسّن بناءً على أمثلة واقعية
            prompt_marketing = f"""
**PHOTOREALISTIC DOCUMENTARY PHOTOGRAPHY - LANDSCAPE FORMAT**

**SERVICE:** {business_name} - {keywords_text}
**LOCATION:** UAE/Dubai Middle East

**VISUAL REQUIREMENTS:**
- 1-2 REAL workers in navy/turquoise uniforms performing the service
- Bright TURQUOISE/CYAN waterproofing material being applied (if waterproofing)
- Paint roller or brush ACTIVELY in use with wooden handle
- Turquoise paint bucket visible in frame
- Blue protective gloves on worker hands
- Safety cap (turquoise/blue)
- Work boots visible
- Building rooftop OR tank surface OR concrete structure
- Middle Eastern/UAE urban buildings in background
- Natural daylight photography
- Documentary journalism style
- Sharp focus on work in progress

**COLORS:**
- DOMINANT: Bright turquoise/cyan blue coating material
- Worker uniform: Navy blue or turquoise
- Gloves: Bright blue
- Background: Gray concrete

**ABSOLUTELY NO TEXT - NO WORDS - NO LETTERS - NO LOGOS**

**STYLE:** Professional commercial documentary photography for UAE service companies
"""
            
            marketing_image_result = image_service.generate_image(
                prompt=prompt_marketing,
                size="1792x1024",
                quality="hd"
            )
            
            if marketing_image_result and marketing_image_result.get('success'):
                import requests
                image_url = marketing_image_result.get('url')
                image_data = requests.get(image_url, timeout=30).content
                operations.extend(self._create_and_link_image_asset_from_data(
                    image_data,
                    self.client.enums.AssetFieldTypeEnum.MARKETING_IMAGE,
                    "Marketing Image"
                ))
                print("✅ تم إنشاء Marketing Image (1792x1024)")
            
            # Generate Square Marketing Image (1024x1024)
            prompt_square = f"""
**PHOTOREALISTIC DOCUMENTARY PHOTOGRAPHY - SQUARE FORMAT (CLOSE-UP)**

**SERVICE:** {business_name} - {keywords_text}
**LOCATION:** UAE/Dubai Middle East

**VISUAL REQUIREMENTS (CLOSE-UP SHOT):**
- Focus on WORKER'S HANDS with blue gloves
- Paint roller or brush ACTIVELY applying turquoise/cyan coating
- Close-up of the waterproofing material being spread
- Worker's arm/torso visible (navy/turquoise uniform)
- Paint bucket edge visible in frame
- Wet glossy turquoise coating clearly visible
- Concrete surface texture showing
- Natural daylight
- Sharp focus on the hands and tool
- Documentary style close-up

**COLORS:**
- PRIMARY: Bright turquoise/cyan coating
- Blue gloves (bright blue)
- Navy/turquoise uniform
- Gray concrete background

**COMPOSITION:** Square format, close-up of work in action

**ABSOLUTELY NO TEXT - NO WORDS - NO LETTERS - NO LOGOS**

**STYLE:** Professional close-up documentary photography showing actual waterproofing work
"""
            
            square_image_result = image_service.generate_image(
                prompt=prompt_square,
                size="1024x1024",
                quality="hd"
            )
            
            if square_image_result and square_image_result.get('success'):
                import requests
                image_url = square_image_result.get('url')
                image_data = requests.get(image_url, timeout=30).content
                operations.extend(self._create_and_link_image_asset_from_data(
                    image_data,
                    self.client.enums.AssetFieldTypeEnum.SQUARE_MARKETING_IMAGE,
                    "Square Marketing Image"
                ))
                print("✅ تم إنشاء Square Marketing Image (1024x1024)")
            
            # Generate Logo (1024x1024 then crop/resize)
            prompt_logo = f"Business logo for {business_name}, automotive service company, simple clean design, NO TEXT, NO WORDS, professional branding"
            
            logo_result = image_service.generate_image(
                prompt=prompt_logo,
                size="1024x1024",
                quality="hd"
            )
            
            if logo_result and logo_result.get('success'):
                import requests
                image_url = logo_result.get('url')
                image_data = requests.get(image_url, timeout=30).content
                operations.extend(self._create_and_link_image_asset_from_data(
                    image_data,
                    self.client.enums.AssetFieldTypeEnum.LOGO,
                    "Business Logo"
                ))
                print("✅ تم إنشاء Logo (1024x1024)")
                
        except Exception as e:
            print(f"⚠️ خطأ في إنشاء الصور: {e}")
            print("📌 استخدام صور افتراضية...")
            # Fallback to default images
            operations.extend(self._create_and_link_image_asset(
                'https://gaagl.page.link/Eit5',
                self.client.enums.AssetFieldTypeEnum.MARKETING_IMAGE,
                "Marketing Image"
            ))
            operations.extend(self._create_and_link_image_asset(
                'https://gaagl.page.link/bjYi',
                self.client.enums.AssetFieldTypeEnum.SQUARE_MARKETING_IMAGE,
                "Square Marketing Image"
            ))
        
        # 7. إنشاء وربط YouTube Video (إذا توفر)
        # ملاحظة: الفيديوهات يضيفها العميل يدوياً من لوحة تحكم Google Ads
        # يمكن للعميل إضافة فيديوهات YouTube من حسابه مباشرة
        # youtube_video_id = assets.get('youtube_video_id')
        # if youtube_video_id:
        #     print(f"🎬 إضافة فيديو YouTube: {youtube_video_id}")
        #     operations.extend(self._create_and_link_youtube_video_asset(youtube_video_id))
        print(f"📹 ملاحظة: يمكن للعميل إضافة فيديوهات YouTube من لوحة التحكم بعد إنشاء الحملة")
        
        return operations
    
    def _create_campaign_budget(self, campaign_name: str, daily_budget: float) -> str:
        """إنشاء ميزانية الحملة (Old method - kept for compatibility)"""
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
    
    def _create_performance_max_campaign_core(self, campaign_name: str, budget_resource_name: str,
                                           target_locations: List[str], target_language: str) -> str:
        """إنشاء الحملة الأساسية"""
        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        campaign = campaign_operation.create
        
        campaign.name = campaign_name
        campaign.advertising_channel_type = AdvertisingChannelTypeEnum.PERFORMANCE_MAX
        campaign.status = CampaignStatusEnum.PAUSED
        campaign.campaign_budget = budget_resource_name
        campaign.contains_eu_political_advertising = False
        
        # إعداد جميع الشبكات
        campaign.network_settings.target_google_search = True
        campaign.network_settings.target_search_network = True
        campaign.network_settings.target_content_network = True
        campaign.network_settings.target_partner_search_network = True
        
        # إعداد اللغة والموقع
        campaign.language_constants.append(f"languageConstants/{target_language}")
        for location in target_locations:
            campaign.geo_targets.append(f"geoTargetConstants/{location}")
        
        # إعداد حملة الأداء الأقصى
        campaign.performance_max_setting.final_url_expansion_opt_out = False
        
        response = campaign_service.mutate_campaigns(
            customer_id=self.customer_id,
            operations=[campaign_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_multiple_text_assets(self, texts: List[str]) -> List[str]:
        """إنشاء عدة أصول نصية (حسب المكتبة الرسمية)"""
        googleads_service = self.client.get_service("GoogleAdsService")
        operations = []
        
        for text in texts:
            mutate_operation = self.client.get_type("MutateOperation")
            asset = mutate_operation.asset_operation.create
            asset.text_asset.text = text
            operations.append(mutate_operation)
        
        # إرسال الطلبات في Mutate واحد
        response = googleads_service.mutate(
            customer_id=self.customer_id,
            mutate_operations=operations
        )
        
        asset_resource_names = []
        for result in response.mutate_operation_responses:
            if result._pb.HasField("asset_result"):
                asset_resource_names.append(result.asset_result.resource_name)
        
        return asset_resource_names
    
    def _create_and_link_text_asset(self, text: str, field_type) -> List:
        """إنشاء وربط أصل نصي واحد (حسب المكتبة الرسمية)"""
        operations = []
        asset_service = self.client.get_service("AssetService")
        asset_group_service = self.client.get_service("AssetGroupService")
        
        # إنشاء Asset
        mutate_operation = self.client.get_type("MutateOperation")
        asset = mutate_operation.asset_operation.create
        asset.resource_name = asset_service.asset_path(self.customer_id, self.next_temp_id)
        asset.text_asset.text = text
        operations.append(mutate_operation)
        
        # إنشاء AssetGroupAsset للربط
        mutate_operation = self.client.get_type("MutateOperation")
        asset_group_asset = mutate_operation.asset_group_asset_operation.create
        asset_group_asset.field_type = field_type
        asset_group_asset.asset_group = asset_group_service.asset_group_path(
            self.customer_id,
            self._ASSET_GROUP_TEMPORARY_ID
        )
        asset_group_asset.asset = asset_service.asset_path(
            self.customer_id, 
            self.next_temp_id
        )
        operations.append(mutate_operation)
        
        self.next_temp_id -= 1
        return operations
    
    def _create_and_link_image_asset(self, image_url: str, field_type, image_name: str) -> List:
        """إنشاء وربط أصل صورة من URL (حسب المكتبة الرسمية)"""
        operations = []
        asset_service = self.client.get_service("AssetService")
        asset_group_service = self.client.get_service("AssetGroupService")
        
        # تحميل الصورة
        try:
            import requests
            image_data = requests.get(image_url, timeout=10).content
        except:
            print(f"⚠️ فشل في تحميل الصورة: {image_url}")
            return []
        
        # إنشاء Asset
        mutate_operation = self.client.get_type("MutateOperation")
        asset = mutate_operation.asset_operation.create
        asset.resource_name = asset_service.asset_path(self.customer_id, self.next_temp_id)
        asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
        asset.image_asset.data = image_data
        asset.name = image_name
        operations.append(mutate_operation)
        
        # إنشاء AssetGroupAsset للربط
        mutate_operation = self.client.get_type("MutateOperation")
        asset_group_asset = mutate_operation.asset_group_asset_operation.create
        asset_group_asset.field_type = field_type
        asset_group_asset.asset_group = asset_group_service.asset_group_path(
            self.customer_id,
            self._ASSET_GROUP_TEMPORARY_ID
        )
        asset_group_asset.asset = asset_service.asset_path(
            self.customer_id, 
            self.next_temp_id
        )
        operations.append(mutate_operation)
        
        self.next_temp_id -= 1
        return operations
    
    def _create_and_link_image_asset_from_data(self, image_data: bytes, field_type, image_name: str) -> List:
        """إنشاء وربط أصل صورة من بيانات (حسب المكتبة الرسمية)"""
        operations = []
        asset_service = self.client.get_service("AssetService")
        asset_group_service = self.client.get_service("AssetGroupService")
        
        # إنشاء Asset
        mutate_operation = self.client.get_type("MutateOperation")
        asset = mutate_operation.asset_operation.create
        asset.resource_name = asset_service.asset_path(self.customer_id, self.next_temp_id)
        asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
        asset.image_asset.data = image_data
        asset.name = image_name
        operations.append(mutate_operation)
        
        # إنشاء AssetGroupAsset للربط
        mutate_operation = self.client.get_type("MutateOperation")
        asset_group_asset = mutate_operation.asset_group_asset_operation.create
        asset_group_asset.field_type = field_type
        asset_group_asset.asset_group = asset_group_service.asset_group_path(
            self.customer_id,
            self._ASSET_GROUP_TEMPORARY_ID
        )
        asset_group_asset.asset = asset_service.asset_path(
            self.customer_id, 
            self.next_temp_id
        )
        operations.append(mutate_operation)
        
        self.next_temp_id -= 1
        return operations
    
    def _create_and_link_youtube_video_asset(self, youtube_video_id: str) -> List:
        """إنشاء وربط فيديو YouTube (حسب المكتبة الرسمية)"""
        operations = []
        asset_service = self.client.get_service("AssetService")
        asset_group_service = self.client.get_service("AssetGroupService")
        
        # إنشاء YouTube Video Asset
        mutate_operation = self.client.get_type("MutateOperation")
        asset = mutate_operation.asset_operation.create
        asset.resource_name = asset_service.asset_path(self.customer_id, self.next_temp_id)
        asset.type_ = self.client.enums.AssetTypeEnum.YOUTUBE_VIDEO
        asset.youtube_video_asset.youtube_video_id = youtube_video_id
        asset.name = f"YouTube Video - {youtube_video_id}"
        operations.append(mutate_operation)
        
        # إنشاء AssetGroupAsset للربط
        mutate_operation = self.client.get_type("MutateOperation")
        asset_group_asset = mutate_operation.asset_group_asset_operation.create
        asset_group_asset.field_type = self.client.enums.AssetFieldTypeEnum.YOUTUBE_VIDEO
        asset_group_asset.asset_group = asset_group_service.asset_group_path(
            self.customer_id,
            self._ASSET_GROUP_TEMPORARY_ID
        )
        asset_group_asset.asset = asset_service.asset_path(
            self.customer_id, 
            self.next_temp_id
        )
        operations.append(mutate_operation)
        
        self.next_temp_id -= 1
        print(f"✅ تم إضافة فيديو YouTube: {youtube_video_id}")
        return operations
    
    def _create_asset_group(self, campaign_resource_name: str, asset_group_name: str) -> str:
        """إنشاء مجموعة الأصول"""
        asset_group_service = self.client.get_service("AssetGroupService")
        asset_group_operation = self.client.get_type("AssetGroupOperation")
        asset_group = asset_group_operation.create
        
        asset_group.name = asset_group_name
        asset_group.campaign = campaign_resource_name
        asset_group.status = CampaignStatusEnum.ENABLED
        
        response = asset_group_service.mutate_asset_groups(
            customer_id=self.customer_id,
            operations=[asset_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _link_assets_to_asset_group(self, asset_group_resource_name: str, asset_resource_names: List[str]):
        """ربط الأصول بمجموعة الأصول"""
        asset_group_asset_service = self.client.get_service("AssetGroupAssetService")
        operations = []
        
        for asset_resource_name in asset_resource_names:
            operation = self.client.get_type("AssetGroupAssetOperation")
            asset_group_asset = operation.create
            
            asset_group_asset.asset_group = asset_group_resource_name
            asset_group_asset.asset = asset_resource_name
            asset_group_asset.field_type = AssetFieldTypeEnum.HEADLINE
            
            operations.append(operation)
        
        if operations:
            asset_group_asset_service.mutate_asset_group_assets(
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
    
    def _extract_assets_from_website(self, website_url: str) -> Dict[str, Any]:
        """استخراج الأصول من الموقع"""
        try:
            response = requests.get(website_url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # استخراج الصور
            images = []
            for img in soup.find_all('img'):
                src = img.get('src', '')
                if src:
                    if src.startswith('http'):
                        images.append(src)
                    elif src.startswith('/'):
                        images.append(f"{website_url.rstrip('/')}{src}")
            
            # استخراج النصوص
            texts = []
            for text_elem in soup.find_all(['h1', 'h2', 'h3', 'p']):
                text = text_elem.get_text().strip()
                if text and len(text) > 10:
                    texts.append(text)
            
            return {
                'images': images[:10],
                'texts': texts[:20]
            }
        except Exception as e:
            print(f"⚠️ خطأ في استخراج الأصول: {e}")
            return {'images': [], 'texts': []}
    
    def _analyze_comprehensive_content(self, website_content: Dict[str, str], 
                                    assets: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل شامل للمحتوى"""
        return {
            'has_images': len(assets.get('images', [])) > 0,
            'image_count': len(assets.get('images', [])),
            'text_count': len(assets.get('texts', [])),
            'content_richness': 'high' if len(assets.get('images', [])) > 5 else 'medium'
        }
    
    def _add_audience_signals(self, campaign_resource_name: str):
        """إضافة إشارات الجمهور (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("🎯 إضافة إشارات الجمهور...")
            
            # إنشاء إشارات الجمهور للحملة
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            
            campaign.resource_name = campaign_resource_name
            
            # إضافة إشارات الجمهور الأساسية
            campaign.performance_max_setting.audience_signals.append(
                self.client.get_type("AudienceSignal")
            )
            
            campaign_service.mutate_campaigns(
                customer_id=self.customer_id,
                operations=[campaign_operation]
            )
            
            print("✅ تم إضافة إشارات الجمهور بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة إشارات الجمهور: {e}")
    
    def _add_conversion_goals(self, campaign_resource_name: str):
        """إضافة أهداف التحويل (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("🎯 إضافة أهداف التحويل...")
            
            # البحث عن إجراءات التحويل الموجودة
            google_ads_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT conversion_action.resource_name, conversion_action.name
                FROM conversion_action
                WHERE conversion_action.status = ENABLED
                LIMIT 5
            """
            
            response = google_ads_service.search(
                customer_id=self.customer_id,
                query=query
            )
            
            if response:
                # إضافة أهداف التحويل للحملة
                campaign_service = self.client.get_service("CampaignService")
                campaign_operation = self.client.get_type("CampaignOperation")
                campaign = campaign_operation.update
                
                campaign.resource_name = campaign_resource_name
                
                # إضافة أهداف التحويل
                for result in response:
                    conversion_action = result.conversion_action.resource_name
                    campaign.selective_optimization.conversion_actions.append(conversion_action)
                
                campaign_service.mutate_campaigns(
                    customer_id=self.customer_id,
                    operations=[campaign_operation]
                )
                
                print("✅ تم إضافة أهداف التحويل بنجاح")
            else:
                print("⚠️ لم يتم العثور على إجراءات تحويل")
                
        except Exception as e:
            print(f"⚠️ خطأ في إضافة أهداف التحويل: {e}")
    
    def _add_advanced_bidding_strategy(self, campaign_resource_name: str):
        """إضافة استراتيجية المزايدة المتقدمة (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("💰 إضافة استراتيجية المزايدة المتقدمة...")
            
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            
            campaign.resource_name = campaign_resource_name
            
            # إعداد استراتيجية المزايدة المتقدمة
            campaign.bidding_strategy_type = BiddingStrategyTypeEnum.TARGET_CPA
            campaign.target_cpa.target_cpa_micros = 1000000  # 1.00 في العملة المحلية
            
            campaign_service.mutate_campaigns(
                customer_id=self.customer_id,
                operations=[campaign_operation]
            )
            
            print("✅ تم إضافة استراتيجية المزايدة المتقدمة بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استراتيجية المزايدة المتقدمة: {e}")
    
    def _add_conversion_tracking(self, campaign_resource_name: str):
        """إضافة تتبع التحويلات (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("📊 إضافة تتبع التحويلات...")
            
            # البحث عن إجراءات التحويل الموجودة
            google_ads_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT conversion_action.resource_name, conversion_action.name
                FROM conversion_action
                WHERE conversion_action.status = ENABLED
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
                
                print("✅ تم إضافة تتبع التحويلات بنجاح")
            else:
                print("⚠️ لم يتم العثور على إجراءات تحويل")
                
        except Exception as e:
            print(f"⚠️ خطأ في إضافة تتبع التحويلات: {e}")
    
    def _add_asset_group_signals(self, asset_group_resource_name: str):
        """إضافة إشارات مجموعة الأصول (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("🔗 إضافة إشارات مجموعة الأصول...")
            
            # إنشاء إشارات مجموعة الأصول
            asset_group_signal_service = self.client.get_service("AssetGroupSignalService")
            asset_group_signal_operation = self.client.get_type("AssetGroupSignalOperation")
            asset_group_signal = asset_group_signal_operation.create
            
            asset_group_signal.asset_group = asset_group_resource_name
            asset_group_signal.audience.user_list = "customers/1234567890/userLists/1234567890"
            
            asset_group_signal_service.mutate_asset_group_signals(
                customer_id=self.customer_id,
                operations=[asset_group_signal_operation]
            )
            
            print("✅ تم إضافة إشارات مجموعة الأصول بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة إشارات مجموعة الأصول: {e}")
    
    def _add_asset_group_listing_group(self, asset_group_resource_name: str):
        """إضافة مجموعة قوائم الأصول (متطلب رسمي لحملات الأداء الأقصى)"""
        try:
            print("📋 إضافة مجموعة قوائم الأصول...")
            
            # إنشاء مجموعة قوائم الأصول
            asset_group_listing_group_service = self.client.get_service("AssetGroupListingGroupService")
            asset_group_listing_group_operation = self.client.get_type("AssetGroupListingGroupOperation")
            asset_group_listing_group = asset_group_listing_group_operation.create
            
            asset_group_listing_group.asset_group = asset_group_resource_name
            asset_group_listing_group.type_ = self.client.enums.ListingGroupTypeEnum.SUBDIVISION
            asset_group_listing_group.case_value.product_channel = self.client.enums.ProductChannelEnum.ONLINE
            
            asset_group_listing_group_service.mutate_asset_group_listing_groups(
                customer_id=self.customer_id,
                operations=[asset_group_listing_group_operation]
            )
            
            print("✅ تم إضافة مجموعة قوائم الأصول بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة مجموعة قوائم الأصول: {e}")

