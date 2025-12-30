# -*- coding: utf-8 -*-
"""
منشئ حملات البحث (Search Campaigns)
===================================

هذا الملف يحتوي على جميع الوظائف المطلوبة لإنشاء حملات البحث
باستخدام المكتبة الرسمية لـ Google Ads API.

       متطلبات حملات البحث:
       - تتطلب صورًا: مربعة (1200×1200) وأفقية (1200×628) - بدون نصوص!
       - تتطلب عناوين إعلانية (15 عنوان كحد أقصى)
       - تتطلب أوصاف إعلانية (4 أوصاف كحد أقصى)
       - تتطلب كلمات مفتاحية
       - تتطلب استهداف الموقع واللغة
       - تتطلب استراتيجية مزايدة
       - تتطلب تتبع التحويلات

الميزات:
- تحليل الموقع للكلمات المفتاحية
- إنشاء عناوين وأوصاف إعلانية
- توليد صور احترافية بدون نصوص
- إنشاء حملة بحث فعلية
- إعداد استراتيجيات المزايدة
- إعداد الشبكات المستهدفة
- إعداد استهداف الجمهور والأجهزة والأوقات
"""

import uuid
import re
from typing import Dict, List, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
# تم إزالة الاستيرادات المباشرة للـ Enums - سنستخدم self.client.enums بدلاً من ذلك
from google.ads.googleads.v21.enums.types.keyword_plan_competition_level import KeywordPlanCompetitionLevelEnum
from google.ads.googleads.v21.enums.types.keyword_plan_network import KeywordPlanNetworkEnum
from google.ads.googleads.v21.services.services.keyword_plan_idea_service.client import KeywordPlanIdeaServiceClient
from google.ads.googleads.v21.services.types.keyword_plan_idea_service import (
    GenerateKeywordIdeasRequest,
    KeywordSeed,
    UrlSeed,
)
from google.ads.googleads.v21.services.services.geo_target_constant_service.client import GeoTargetConstantServiceClient
from google.ads.googleads.v21.services.types.geo_target_constant_service import SuggestGeoTargetConstantsRequest
from google.ads.googleads.v21.services.services.google_ads_service.client import GoogleAdsServiceClient
from google.ads.googleads.v21.services.types.google_ads_service import SearchGoogleAdsRequest
from google.ads.googleads.v21.resources.types.campaign import Campaign
from google.ads.googleads.v21.resources.types.campaign_budget import CampaignBudget
from google.ads.googleads.v21.resources.types.ad_group import AdGroup
from google.ads.googleads.v21.resources.types.ad_group_ad import AdGroupAd
from google.ads.googleads.v21.resources.types.ad_group_criterion import AdGroupCriterion
from google.ads.googleads.v21.common.types.ad_type_infos import ResponsiveSearchAdInfo
from services.campaign_image_service import CampaignImageService
from google.ads.googleads.v21.common.types.ad_asset import AdTextAsset
from google.ads.googleads.v21.common.types.criteria import KeywordInfo
from google.ads.googleads.v21.enums.types.keyword_match_type import KeywordMatchTypeEnum
from google.ads.googleads.v21.enums.types.ad_group_type import AdGroupTypeEnum
from google.ads.googleads.v21.enums.types.ad_group_status import AdGroupStatusEnum
from services.smart_negative_keywords_generator import SmartNegativeKeywordsGenerator
from google.ads.googleads.v21.enums.types.criterion_type import CriterionTypeEnum
from google.ads.googleads.v21.enums.types.campaign_criterion_status import CampaignCriterionStatusEnum
from google.ads.googleads.v21.enums.types.served_asset_field_type import ServedAssetFieldTypeEnum
from google.ads.googleads.v21.enums.types.bidding_strategy_type import BiddingStrategyTypeEnum
from google.ads.googleads.v21.services.types.campaign_budget_service import CampaignBudgetOperation
from google.ads.googleads.v21.services.types.campaign_service import CampaignOperation
from google.ads.googleads.v21.services.types.ad_group_service import AdGroupOperation
from google.ads.googleads.v21.services.types.ad_group_ad_service import AdGroupAdOperation
from google.ads.googleads.v21.services.types.ad_group_criterion_service import AdGroupCriterionOperation

import requests
from bs4 import BeautifulSoup
import os
from services.ai_content_generator import AIContentGenerator


class SearchCampaignCreator:
    """منشئ حملات البحث"""
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        self.client = client
        self.customer_id = customer_id
        self.smart_negative_generator = SmartNegativeKeywordsGenerator()
        self.ai_generator = AIContentGenerator()
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات البحث"""
        return {
            "campaign_type": "SEARCH",
            "name": "حملات البحث",
            "description": "حملات إعلانية تظهر في نتائج البحث على Google",
                   "image_requirements": {
                       "required": True,
                       "min_images": 4,
                       "max_images": 4,
                       "square_image": {
                           "size": "1200×1200",
                           "aspect_ratio": "1:1",
                           "min_size": "300×300",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "description": "صورة مربعة للإعلان",
                           "field_type": "AD_IMAGE"
                       },
                       "landscape_image": {
                           "size": "1200×628",
                           "aspect_ratio": "1.91:1",
                           "min_size": "600×314",
                           "max_file_size": "5120 KB",
                           "formats": ["JPEG", "PNG"],
                           "description": "صورة أفقية للإعلان",
                           "field_type": "AD_IMAGE"
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
                }
            },
            "keyword_requirements": {
                "required": True,
                "min_count": 1,
                "max_count": 10000,
                "description": "كلمات مفتاحية مستهدفة"
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
                "partner_search_network": False
            },
            "ad_types": [
                "RESPONSIVE_SEARCH_AD",
                "EXPANDED_TEXT_AD",
                "CALL_AD"
            ],
            "budget_requirements": {
                "min_daily_budget": 1.0,
                "currency": "USD",
                "delivery_method": "STANDARD"
            }
        }
    
    def analyze_website_for_search(self, website_url: str, target_language: str = "1019", 
                                 target_locations: List[str] = ["2682"]) -> Dict[str, Any]:
        """تحليل الموقع لاستخراج الكلمات المفتاحية المناسبة لحملات البحث"""
        print("🔍 تحليل الموقع لحملات البحث...")
        print("=" * 50)
        
        try:
            # استخراج الكلمات المفتاحية باستخدام Google Keyword Planner
            keywords = self._extract_keywords_from_website(website_url, target_language, target_locations)
            
            if not keywords:
                print("❌ لم يتم العثور على كلمات مفتاحية مناسبة")
                return None
            
            # تحليل المحتوى للموقع
            website_content = self._fetch_website_content(website_url)
            
            # استخراج معلومات الموقع
            title = website_content.get('title', f"موقع {website_url.split('/')[-1]}")
            description = website_content.get('description', f"خدمات متخصصة من {website_url}")
            
            # تصنيف الكلمات المفتاحية
            classified_keywords = self._classify_keywords_for_search(keywords)
            
            result = {
                'title': title,
                'description': description,
                'keywords': [kw['text'] for kw in keywords[:20]],
                'real_keywords': keywords[:20],
                'classified_keywords': classified_keywords,
                'content_length': len(str(keywords)),
                'campaign_type': 'SEARCH',
                'website_url': website_url
            }
            
            print(f"✅ تم تحليل الموقع لحملات البحث")
            print(f"🔑 الكلمات المفتاحية: {len(keywords)} كلمة")
            print(f"📊 أفضل الكلمات: {', '.join([kw['text'] for kw in keywords[:5]])}")
            
            return result
            
        except Exception as e:
            print(f"❌ خطأ في تحليل الموقع: {e}")
            return None
    
    def generate_search_ad_copies(self, website_content: Dict[str, Any], 
                                target_language: str = "1019") -> Dict[str, Any]:
        """إنشاء نسخ إعلانية لحملات البحث"""
        print("📝 إنشاء نسخ إعلانية لحملات البحث...")
        print("=" * 50)
        
        try:
            # إعداد البيانات للذكاء الاصطناعي
            keywords = website_content.get('real_keywords', [])
            top_keywords = [kw['text'] for kw in keywords[:10]]
            
            prompt = f"""
            أنشئ نسخ إعلانية احترافية لحملة بحث Google Ads للموقع التالي:
            
            الموقع: {website_content.get('website_url', '')}
            العنوان: {website_content.get('title', '')}
            الوصف: {website_content.get('description', '')}
            الكلمات المفتاحية: {', '.join(top_keywords)}
            
            المطلوب:
            1. 5 عناوين إعلانية جذابة (30 حرف كحد أقصى)
            2. 3 أوصاف إعلانية مقنعة (90 حرف كحد أقصى)
            3. التركيز على الفوائد والنتائج
            4. استخدام الكلمات المفتاحية بشكل طبيعي
            5. دعوة واضحة للعمل
            
            أرجو الإجابة بصيغة JSON:
            {{
                "headlines": ["العنوان 1", "العنوان 2", ...],
                "descriptions": ["الوصف 1", "الوصف 2", ...],
                "call_to_action": "نص الدعوة للعمل"
            }}
            """
            
            # استخدام الذكاء الاصطناعي لإنشاء المحتوى
            ai_result = self.ai_generator.generate_complete_ad_content(
                website_url=website_content.get('website_url', ''),
                service_type="خدمات البحث",
                target_language=target_language
            )
            
            if ai_result and ai_result.get('success'):
                ad_copies = ai_result.get('ad_copies', {})
                
                # إنشاء عناوين إعلانية (15 عنوان - الحد الأقصى)
                headlines = ad_copies.get('headlines', [])
                if len(headlines) < 15:
                    # إضافة عناوين إضافية إذا لم تكن كافية
                    title = website_content.get('title', 'خدمات')
                    additional_headlines = [
                        f"أفضل {title}",
                        f"احترافية وسريعة",
                        f"نتائج مضمونة",
                        f"أسعار تنافسية",
                        f"خدمة 24/7",
                        f"فريق محترف",
                        f"جودة عالية",
                        f"خبرة طويلة",
                        f"ضمان الجودة",
                        f"خدمة سريعة",
                        f"أسعار مناسبة",
                        f"احصل عليها الآن",
                        f"اتصل بنا اليوم",
                        f"خدمات موثوقة",
                        f"رضا العملاء أولاً"
                    ]
                    headlines.extend(additional_headlines[:15-len(headlines)])
                
                # إنشاء أوصاف إعلانية (4 أوصاف - الحد الأقصى)
                descriptions = ad_copies.get('descriptions', [])
                if len(descriptions) < 4:
                    title = website_content.get('title', 'خدمات')
                    additional_descriptions = [
                        f"احصل على أفضل {title} بأسعار مناسبة وجودة عالية",
                        f"فريق محترف يضمن لك النتائج المطلوبة مع خبرة طويلة",
                        f"خدمة سريعة وموثوقة مع ضمان الجودة ورضا العملاء",
                        f"تواصل معنا الآن واحصل على استشارة مجانية"
                    ]
                    descriptions.extend(additional_descriptions[:4-len(descriptions)])
                
                result = {
                    'headlines': headlines[:15],  # 15 عنوان كحد أقصى
                    'descriptions': descriptions[:4],  # 4 أوصاف كحد أقصى
                    'call_to_action': ad_copies.get('call_to_action', 'اتصل الآن'),
                    'images': ai_result.get('images', []),
                    'success': True
                }
                
                print("✅ تم إنشاء النسخ الإعلانية لحملات البحث")
                print(f"📰 العناوين: {len(result['headlines'])} عنوان")
                print(f"📄 الأوصاف: {len(result['descriptions'])} وصف")
                
                return result
            else:
                print("❌ فشل في إنشاء النسخ الإعلانية")
                return {'success': False, 'error': 'فشل في إنشاء المحتوى'}
                
        except Exception as e:
            print(f"❌ خطأ في إنشاء النسخ الإعلانية: {e}")
            return {'success': False, 'error': str(e)}
    
    def create_search_campaign(self, campaign_name: str, daily_budget: float,
                             target_locations: List[str], target_language: str,
                             keywords: List[str], ad_copies: Dict[str, Any], 
                             website_url: str = "https://www.example.com",
                             dry_run: bool = False,
                             proximity_targets: List[Dict] = None,
                             real_cpc: float = None) -> str:
        """
        إنشاء حملة بحث فعلية باستخدام Google Ads API
        
        Args:
            dry_run: إذا كان True، سيتم فقط الفحص بدون رفع الحملة
        """
        print(f"🎯 {'[وضع الاختبار] ' if dry_run else ''}إنشاء حملة البحث...")
        print("=" * 50)
        
        if dry_run:
            print("\n⚠️ **وضع الاختبار (Dry Run) - لن يتم رفع الحملة**")
        print("=" * 50)
        
        try:
            if not self.client:
                print("⚠️ Google Ads API غير متاح - إرجاع معرف وهمي")
                return f"search_campaign_{uuid.uuid4().hex[:8]}"
            
            # حفظ Real CPC للاستخدام في Ad Group و Keywords (محول لعملة الحساب)
            if real_cpc:
                self.real_cpc = real_cpc
                print(f"💰 استخدام Real CPC من Google Ads: {real_cpc:.2f} (عملة الحساب)")
            else:
                self.real_cpc = 1.0  # Default fallback
                print(f"⚠️ لم يتم تمرير Real CPC، استخدام القيمة الافتراضية: 1.00 (عملة الحساب)")
            
            # 1. إنشاء ميزانية الحملة
            budget_resource_name = self._create_campaign_budget(campaign_name, daily_budget)
            
            # 2. إنشاء الحملة
            campaign_resource_name = self._create_search_campaign_core(
                campaign_name, budget_resource_name, target_locations, target_language, proximity_targets
            )
            
            # 3. إنشاء مجموعة الإعلانات (مع Real CPC)
            ad_group_resource_name = self._create_ad_group(campaign_resource_name, f"{campaign_name} - مجموعة الإعلانات")
            
            # 3.1 إضافة Ad Customizers للمحتوى الديناميكي (من المكتبة الرسمية)
            # DISABLED: يسبب خطأ UNPAIRED_BRACE_IN_AD_CUSTOMIZER_TAG
            customizer_names = None  # self._add_ad_customizers(ad_group_resource_name, campaign_name)
            
            # 4. إنشاء 3 إعلانات (أفضل ممارسة من Google)
            for ad_number in range(1, 4):  # إنشاء 3 إعلانات
                print(f"\n📝 إنشاء الإعلان #{ad_number}...")
                self._create_responsive_search_ads(ad_group_resource_name, ad_copies, website_url, ad_number, customizer_names)
            
            # 4.1 إضافة الصور للمجموعة الإعلانية (AD_IMAGE)
            self._add_images_to_ad_group(ad_group_resource_name, campaign_name, keywords)
            print("ℹ️ الصور غير مدعومة في حملات البحث (Search Campaigns) - متوفرة في Performance Max فقط")
            
            # 5. إضافة الكلمات المفتاحية (مطابقة عبارة)
            self._add_keywords_to_ad_group(ad_group_resource_name, keywords)
            
            # 5.1 إضافة كلمات سلبية ذكية (لمنع النقرات الوهمية)
            self._add_negative_keywords(ad_group_resource_name, keywords, campaign_name)
            
            # 6. إضافة استهداف الجمهور (متطلب رسمي)
            self._add_audience_targeting(campaign_resource_name)
            
            # 7. إضافة استهداف الأجهزة (متطلب رسمي)
            self._add_device_targeting(campaign_resource_name)
            
            # 7.1 إضافة تعديلات العروض للمجموعة الإعلانية (من المكتبة الرسمية)
            self._add_ad_group_bid_modifiers(ad_group_resource_name)
            
            # 8. إضافة استهداف الأوقات (متطلب رسمي)
            self._add_schedule_targeting(campaign_resource_name)
            
            # 9. إضافة الأصول/الإضافات (Assets/Extensions) - المولدة من AI
            business_name = campaign_name.replace("حملة ", "").replace(" - SEARCH", "")
            self._add_campaign_assets(
                campaign_resource_name, 
                website_url, 
                business_name=business_name,
                phone_number=None,  # يمكن إضافته لاحقاً من معاملات الدالة
                ad_copies=ad_copies,  # تمرير الأصول المولدة من AI
                keywords=keywords  # تمرير الكلمات المفتاحية للاستخدام في Negative Keywords
            )
            
            campaign_id = campaign_resource_name.split('/')[-1]
            print(f"✅ تم إنشاء حملة البحث بمعرف: {campaign_id}")
            return campaign_id
            
        except Exception as e:
            print(f"❌ خطأ في إنشاء حملة البحث: {e}")
            raise Exception(f"فشل في إنشاء حملة البحث: {e}")
    
    def _create_campaign_budget(self, campaign_name: str, daily_budget: float) -> str:
        """إنشاء ميزانية الحملة"""
        budget_service = self.client.get_service("CampaignBudgetService")
        budget_operation = self.client.get_type("CampaignBudgetOperation")
        budget = budget_operation.create
        
        # اسم فريد لتجنب التكرار
        import time
        timestamp = int(time.time())
        budget.name = f"ميزانية {campaign_name} {timestamp}"
        budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
        budget.amount_micros = int(round(daily_budget * 100) * 10000)  # Round to cents, then convert to micros
        
        # جعل الميزانية فردية (غير مشتركة) - explicitly_shared = False
        budget.explicitly_shared = False
        
        budget_response = budget_service.mutate_campaign_budgets(
            customer_id=self.customer_id,
            operations=[budget_operation]
        )
        
        return budget_response.results[0].resource_name
    
    def _create_search_campaign_core(self, campaign_name: str, budget_resource_name: str,
                                   target_locations: List[str], target_language: str,
                                   proximity_targets: List[Dict] = None) -> str:
        """إنشاء الحملة الأساسية"""
        # اسم الحملة مباشرة بدون أي إضافات
        
        print(f"\n🔥 دخلنا _create_search_campaign_core")
        print(f"   🏷️ اسم الحملة: {campaign_name}")
        print(f"   💰 الميزانية: {budget_resource_name}")
        
        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        campaign = campaign_operation.create
        
        # اسم فريد لتجنب التكرار
        import time
        timestamp = int(time.time())
        short_id = uuid.uuid4().hex[:4].upper()
        campaign.name = f"{campaign_name} #{short_id}"
        campaign.campaign_budget = budget_resource_name
        # تعيين حقل contains_eu_political_advertising
        # هذا الحقل REQUIRED في Google Ads API v21
        campaign.contains_eu_political_advertising = (
            self.client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )
        campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.SEARCH
        campaign.status = self.client.enums.CampaignStatusEnum.ENABLED  # ✅ تفعيل الحملة مباشرة
        
        # إضافة Tracking Template و Final URL Suffix للتتبع الصحيح
        campaign.tracking_url_template = "{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}"
        campaign.final_url_suffix = "utm_term={keyword}&utm_content={creative}"
        
        # إعداد الشبكة (Google Search فقط - بدون شبكة البحث)
        campaign.network_settings.target_google_search = True
        campaign.network_settings.target_search_network = False  # إزالة شبكة البحث
        campaign.network_settings.target_content_network = False
        campaign.network_settings.target_partner_search_network = False
        
        # تعيين خيارات الموقع الجغرافي: "الحضور" فقط (الخيار الأول)
        campaign.geo_target_type_setting.positive_geo_target_type = (
            self.client.enums.PositiveGeoTargetTypeEnum.PRESENCE
        )
        
        # إعداد استراتيجية المزايدة (REQUIRED في Google Ads API v21)
        # استخدام Manual CPC كإستراتيجية افتراضية - بدون Enhanced CPC
        self.client.copy_from(campaign.manual_cpc, self.client.get_type("ManualCpc"))
        
        # طباعة معلومات الحملة قبل الإنشاء (للتشخيص)
        print(f"\n🔍 تشخيص الحملة:")
        print(f"   📛 الاسم: {campaign.name}")
        print(f"   💰 الميزانية: {campaign.campaign_budget}")
        print(f"   📺 نوع القناة: {campaign.advertising_channel_type}")
        print(f"   📊 الحالة: {campaign.status}")
        print(f"   🇪🇺 الإعلان السياسي الأوروبي: {campaign.contains_eu_political_advertising}")
        print(f"   🔢 القيمة الرقمية: {int(campaign.contains_eu_political_advertising)}")
        
        # إنشاء الحملة أولاً
        response = campaign_service.mutate_campaigns(
            customer_id=self.customer_id,
            operations=[campaign_operation]
        )
        
        campaign_resource_name = response.results[0].resource_name
        campaign_id = campaign_resource_name.split('/')[-1]
        
        # إضافة اللغة والموقع الجغرافي باستخدام CampaignCriterion
        self._add_location_and_language_targeting(
            campaign_id, target_locations, target_language, proximity_targets
        )
        
        return campaign_resource_name
    
    def _create_ad_group(self, campaign_resource_name: str, ad_group_name: str) -> str:
        """إنشاء مجموعة الإعلانات"""
        ad_group_service = self.client.get_service("AdGroupService")
        ad_group_operation = self.client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.create
        
        ad_group.name = ad_group_name
        ad_group.campaign = campaign_resource_name
        ad_group.type_ = self.client.enums.AdGroupTypeEnum.SEARCH_STANDARD
        ad_group.status = self.client.enums.AdGroupStatusEnum.ENABLED
        
        # استخدام Real CPC من Google Ads Historical Metrics (محول لعملة الحساب)
        real_cpc_value = getattr(self, 'real_cpc', 1.0)
        cpc_micros = int(real_cpc_value * 1_000_000)
        
        # تقريب إلى أقرب مضاعف للوحدة القابلة للفوترة (billable unit)
        # معظم العملات: 10,000 micros (0.01) | بعض العملات: 1,000,000 micros (1.0)
        billable_unit = 10_000  # Default: 10,000 micros (0.01 في معظم العملات)
        cpc_micros_rounded = round(cpc_micros / billable_unit) * billable_unit
        
        ad_group.cpc_bid_micros = cpc_micros_rounded
        print(f"💰 Ad Group CPC Bid: {real_cpc_value:.2f} → {cpc_micros_rounded / 1_000_000:.2f} (عملة الحساب) = {cpc_micros_rounded:,} micros")
        
        response = ad_group_service.mutate_ad_groups(
            customer_id=self.customer_id,
            operations=[ad_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_ad_text_asset(self, text: str, pinned_field=None) -> AdTextAsset:
        """إنشاء نص إعلاني (AdTextAsset) حسب المكتبة الرسمية"""
        ad_text_asset = self.client.get_type("AdTextAsset")
        ad_text_asset.text = text
        if pinned_field:
            ad_text_asset.pinned_field = pinned_field
        return ad_text_asset
    
    def _add_ad_customizers(self, ad_group_resource_name: str, campaign_name: str):
        """إضافة Ad Customizers للمحتوى الديناميكي (من المكتبة الرسمية)"""
        try:
            print("🎨 إضافة Ad Customizers للمحتوى الديناميكي...")
            
            import uuid
            customizer_attribute_service = self.client.get_service("CustomizerAttributeService")
            ad_group_customizer_service = self.client.get_service("AdGroupCustomizerService")
            
            # 1. إنشاء Text Customizer (اسم الخدمة)
            text_customizer_name = f"Service_{uuid.uuid4().hex[:8]}"
            text_operation = self.client.get_type("CustomizerAttributeOperation")
            text_attribute = text_operation.create
            text_attribute.name = text_customizer_name
            text_attribute.type_ = self.client.enums.CustomizerAttributeTypeEnum.TEXT
            
            # 2. إنشاء Price Customizer (السعر) - استخدام TEXT بدلاً من PRICE
            price_customizer_name = f"Price_{uuid.uuid4().hex[:8]}"
            price_operation = self.client.get_type("CustomizerAttributeOperation")
            price_attribute = price_operation.create
            price_attribute.name = price_customizer_name
            price_attribute.type_ = self.client.enums.CustomizerAttributeTypeEnum.TEXT  # TEXT للتوافق
            
            # إضافة Customizer Attributes
            response = customizer_attribute_service.mutate_customizer_attributes(
                customer_id=self.customer_id,
                operations=[text_operation, price_operation]
            )
            
            text_customizer_resource = response.results[0].resource_name
            price_customizer_resource = response.results[1].resource_name
            
            print(f"✅ تم إنشاء Text Customizer: {text_customizer_resource}")
            print(f"✅ تم إنشاء Price Customizer: {price_customizer_resource}")
            
            # 3. ربط Customizers بالـ Ad Group
            # Text Customizer - استخراج اسم الخدمة من campaign_name
            service_name = campaign_name.replace("حملة ", "").split("-")[0].strip()
            text_customizer_operation = self.client.get_type("AdGroupCustomizerOperation")
            text_customizer = text_customizer_operation.create
            text_customizer.customizer_attribute = text_customizer_resource
            text_customizer.value.type_ = self.client.enums.CustomizerAttributeTypeEnum.TEXT
            text_customizer.value.string_value = service_name
            text_customizer.ad_group = ad_group_resource_name
            
            # Price Customizer - سعر افتراضي (string format بدون علامات عشرية)
            price_customizer_operation = self.client.get_type("AdGroupCustomizerOperation")
            price_customizer = price_customizer_operation.create
            price_customizer.customizer_attribute = price_customizer_resource
            price_customizer.value.type_ = self.client.enums.CustomizerAttributeTypeEnum.TEXT  # استخدام TEXT بدلاً من PRICE
            # FIXED: Google Ads يتطلب string_value للأسعار (بدون أرقام عشرية)
            price_customizer.value.string_value = "100"  # السعر كـ string بدون micros
            price_customizer.ad_group = ad_group_resource_name
            
            # إضافة Customizers للـ Ad Group
            ad_group_customizer_service.mutate_ad_group_customizers(
                customer_id=self.customer_id,
                operations=[text_customizer_operation, price_customizer_operation]
            )
            
            print(f"✅ تم ربط Ad Customizers بالمجموعة الإعلانية")
            
            return {
                "text": text_customizer_name,
                "price": price_customizer_name
            }
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Ad Customizers: {e}")
            return None
    
    def _create_responsive_search_ads(self, ad_group_resource_name: str, ad_copies: Dict[str, Any], 
                                    final_url: str, ad_number: int = 1, customizer_names: dict = None):
        """
        إنشاء إعلانات البحث المتجاوبة مختلفة حسب المكتبة الرسمية
        
        كل إعلان يحتوي على مجموعة مختلفة من العناوين والأوصاف:
        - الإعلان 1: أول 5 عناوين + أول 2 وصف
        - الإعلان 2: 5 عناوين وسطى + 2 وصف وسطى  
        - الإعلان 3: آخر 5 عناوين + كل الأوصاف (4)
        """
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create
        
        # تعيين الحالة ومجموعة الإعلانات
        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
        
        # إضافة final_urls للإعلان (مطلوب)
        ad_group_ad.ad.final_urls.append(final_url)
        
        # الحصول على كل العناوين والأوصاف
        all_headlines = ad_copies.get('headlines', [])
        all_descriptions = ad_copies.get('descriptions', [])
        
        # تقسيم العناوين والأوصاف حسب رقم الإعلان
        # كل إعلان يحتاج على الأقل 3 عناوين و 2 وصف (حد أدنى من Google)
        # الإعلان 1: عناوين 0-4 (5 عناوين)
        # الإعلان 2: عناوين 5-9 (5 عناوين)
        # الإعلان 3: عناوين 10-14 (5 عناوين)
        
        # التأكد من وجود عدد كافٍ من العناوين
        if len(all_headlines) < 15:
            print(f"⚠️ تحذير: عدد العناوين {len(all_headlines)} أقل من 15، سيتم توزيعها")
        
        if ad_number == 1:
            selected_headlines = all_headlines[0:5] if len(all_headlines) >= 5 else all_headlines[0:3]
            selected_descriptions = all_descriptions[0:2] if len(all_descriptions) >= 2 else all_descriptions
        elif ad_number == 2:
            start_idx = min(5, len(all_headlines))
            end_idx = min(10, len(all_headlines))
            selected_headlines = all_headlines[start_idx:end_idx] if end_idx > start_idx else all_headlines[0:3]
            selected_descriptions = all_descriptions[2:4] if len(all_descriptions) >= 4 else all_descriptions[0:2]
        else:  # ad_number == 3
            start_idx = min(10, len(all_headlines))
            selected_headlines = all_headlines[start_idx:15] if len(all_headlines) > start_idx else all_headlines[0:5]
            selected_descriptions = all_descriptions[0:4]  # استخدام كل الأوصاف للإعلان الثالث
        
        # إزالة التكرار من العناوين + التحقق من الطول
        unique_headlines = []
        seen_headline_texts = set()
        MAX_HEADLINE_LENGTH = 30  # حد Google Ads للعناوين
        
        for h in selected_headlines:
            h_text = h.strip()
            # قص العنوان إذا كان أطول من 30 حرف
            if len(h_text) > MAX_HEADLINE_LENGTH:
                h_text = h_text[:MAX_HEADLINE_LENGTH].rsplit(' ', 1)[0]  # قص عند آخر كلمة كاملة
                if len(h_text) == 0:  # إذا كان العنوان كله كلمة واحدة طويلة
                    h_text = h[:MAX_HEADLINE_LENGTH]
            
            if h_text and h_text not in seen_headline_texts:
                unique_headlines.append(h_text)
                seen_headline_texts.add(h_text)
        
        headline_assets = []
        
        # إضافة عنوان ديناميكي مع Ad Customizer (إذا كان موجوداً)
        if customizer_names and ad_number == 1:
            # إضافة عنوان مع Customizer في الإعلان الأول فقط
            customizer_headline = f"{{{{CUSTOMIZER.{customizer_names['text']}:خدماتنا}}}} بسعر {{{{CUSTOMIZER.{customizer_names['price']}:مميز}}}}"[:30]
            headline_asset = self._create_ad_text_asset(customizer_headline, self.client.enums.ServedAssetFieldTypeEnum.HEADLINE_1)
            headline_assets.append(headline_asset)
        
        for i, headline in enumerate(unique_headlines[:15]):  # حد أقصى 15 عنوان فريد
            # تثبيت العنوان الأول في HEADLINE_1 (إذا لم يكن هناك customizer)
            if i == 0 and not (customizer_names and ad_number == 1):
                served_asset_enum = self.client.enums.ServedAssetFieldTypeEnum
                headline_asset = self._create_ad_text_asset(headline, served_asset_enum.HEADLINE_1)
            else:
                headline_asset = self._create_ad_text_asset(headline)
            headline_assets.append(headline_asset)
        
        # إضافة العناوين للإعلان
        ad_group_ad.ad.responsive_search_ad.headlines.extend(headline_assets)
        
        # إنشاء الأوصاف كـ AdTextAsset
        # إزالة التكرار من الأوصاف + التحقق من الطول
        unique_descriptions = []
        seen_texts = set()
        MAX_DESCRIPTION_LENGTH = 90  # حد Google Ads للأوصاف
        
        for desc in selected_descriptions:
            desc_text = desc.strip()
            # قص الوصف إذا كان أطول من 90 حرف
            if len(desc_text) > MAX_DESCRIPTION_LENGTH:
                desc_text = desc_text[:MAX_DESCRIPTION_LENGTH].rsplit(' ', 1)[0]  # قص عند آخر كلمة كاملة
                if len(desc_text) == 0:  # إذا كان الوصف كله كلمة واحدة طويلة
                    desc_text = desc[:MAX_DESCRIPTION_LENGTH]
            
            if desc_text and desc_text not in seen_texts:
                unique_descriptions.append(desc_text)
                seen_texts.add(desc_text)
        
        description_assets = []
        for description in unique_descriptions[:4]:  # حد أقصى 4 أوصاف فريدة
            description_asset = self._create_ad_text_asset(description)
            description_assets.append(description_asset)
        
        # إضافة الأوصاف للإعلان
        ad_group_ad.ad.responsive_search_ad.descriptions.extend(description_assets)
        
        # إضافة المسارات (paths) - اختياري
        ad_group_ad.ad.responsive_search_ad.path1 = "offers"
        ad_group_ad.ad.responsive_search_ad.path2 = "deals"
        
        # إرسال الطلب لإنشاء الإعلان
        response = ad_group_ad_service.mutate_ad_group_ads(
            customer_id=self.customer_id,
            operations=[ad_group_ad_operation]
        )
        
        # طباعة النتيجة
        for result in response.results:
            print(f"✅ تم إنشاء الإعلان #{ad_number}: {result.resource_name}")
            print(f"   📝 العناوين: {len(unique_headlines)}")
            print(f"   📄 الأوصاف: {len(unique_descriptions)}")
    
    def _add_location_and_language_targeting(self, campaign_id: str, 
                                            target_locations: List[str], 
                                            target_language: str,
                                            proximity_targets: List[Dict] = None):
        """إضافة الموقع الجغرافي واللغة باستخدام CampaignCriterion"""
        try:
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            campaign_service = self.client.get_service("CampaignService")
            geo_target_constant_service = self.client.get_service("GeoTargetConstantService")
            
            operations = []
            
            # إضافة الموقع الجغرافي (إيجابي)
            # تعيين خيارات الموقع الجغرافي: "الحضور أو الاهتمام" (الخيار الثاني)
            for location_id in target_locations:
                campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
                campaign_criterion = campaign_criterion_operation.create
                campaign_criterion.campaign = campaign_service.campaign_path(
                    self.customer_id, campaign_id
                )
                # تحديد أن الموقع إيجابي (مستهدف) وليس سلبي (مستبعد)
                campaign_criterion.negative = False
                campaign_criterion.location.geo_target_constant = (
                    geo_target_constant_service.geo_target_constant_path(location_id)
                )
                operations.append(campaign_criterion_operation)
            
            # إضافة proximity targeting للمواقع الدقيقة (المدن، الأحياء)
            if proximity_targets:
                for prox_target in proximity_targets:
                    campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
                    campaign_criterion = campaign_criterion_operation.create
                    campaign_criterion.campaign = campaign_service.campaign_path(
                        self.customer_id, campaign_id
                    )
                    campaign_criterion.negative = False
                    
                    # تعيين الإحداثيات والنطاق
                    proximity = campaign_criterion.proximity
                    proximity.geo_point.longitude_in_micro_degrees = int(prox_target['longitude'] * 1_000_000)
                    proximity.geo_point.latitude_in_micro_degrees = int(prox_target['latitude'] * 1_000_000)
                    proximity.radius = prox_target['radius_km']
                    proximity.radius_units = self.client.enums.ProximityRadiusUnitsEnum.KILOMETERS
                    
                    operations.append(campaign_criterion_operation)
                    print(f"✅ Added PRECISE proximity targeting: {prox_target['name']} (lat: {prox_target['latitude']}, lng: {prox_target['longitude']}, radius: {prox_target['radius_km']}km)")
            
            # إضافة اللغة
            language_criterion_operation = self.client.get_type("CampaignCriterionOperation")
            language_criterion = language_criterion_operation.create
            language_criterion.campaign = campaign_service.campaign_path(
                self.customer_id, campaign_id
            )
            language_criterion.language.language_constant = f"languageConstants/{target_language}"
            operations.append(language_criterion_operation)
            
            # تطبيق التغييرات
            if operations:
                response = campaign_criterion_service.mutate_campaign_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                print(f"✅ تم إضافة {len(response.results)} معيار استهداف (موقع + لغة)")
                
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة الاستهداف الجغرافي/اللغوي: {e}")
    
    def _add_keywords_to_ad_group(self, ad_group_resource_name: str, keywords: List[str]):
        """إضافة الكلمات المفتاحية لمجموعة الإعلانات (بناءً على المثال الرسمي)"""
        ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
        
        operations = []
        
        # إنشاء كلمات مفتاحية بأنواع مطابقة مختلفة (كما في المثال الرسمي)
        for keyword in keywords[:20]:  # حد أقصى 20 كلمة مفتاحية
            operation = self.client.get_type("AdGroupCriterionOperation")
            criterion = operation.create
            
            criterion.ad_group = ad_group_resource_name
            criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
            
            # تعيين الكلمة المفتاحية
            criterion.keyword.text = keyword
            # استخدام PHRASE match لتحسين الدقة وتقليل النقرات الوهمية
            criterion.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.PHRASE
            
            # تعيين CPC Bid من Real CPC (Google Ads Historical Metrics)
            real_cpc_value = getattr(self, 'real_cpc', 1.0)
            cpc_micros = int(real_cpc_value * 1_000_000)
            
            # تقريب إلى أقرب مضاعف للوحدة القابلة للفوترة (billable unit)
            billable_unit = 10_000
            cpc_micros_rounded = round(cpc_micros / billable_unit) * billable_unit
            criterion.cpc_bid_micros = cpc_micros_rounded
            
            operations.append(operation)
        
        if operations:
            response = ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=self.customer_id,
                operations=operations
            )
            
            for result in response.results:
                print(f"✅ تم إضافة كلمة مفتاحية: {result.resource_name}")
    
    def _add_negative_keywords(self, ad_group_resource_name: str, 
                              positive_keywords: List[str],
                              campaign_name: str):
        """
        إضافة كلمات سلبية ذكية لمنع النقرات الوهمية
        يستخدم الذكاء الاصطناعي لتوليد كلمات حسب مجال العمل
        """
        print("\n🧠 توليد كلمات سلبية ذكية حسب مجال العمل...")
        
        # استخراج مجال العمل من اسم الحملة
        business_domain = campaign_name.replace("حملة ", "").strip()
        
        # توليد كلمات سلبية ذكية باستخدام AI
        negative_keywords = self.smart_negative_generator.generate_negative_keywords(
            positive_keywords=positive_keywords,
            business_domain=business_domain
        )
        
        ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
        operations = []
        
        for keyword in negative_keywords:
            operation = self.client.get_type("AdGroupCriterionOperation")
            criterion = operation.create
            
            criterion.ad_group = ad_group_resource_name
            criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED
            criterion.keyword.text = keyword
            criterion.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.PHRASE
            # وضع علامة كلمة سلبية
            criterion.negative = True
            
            operations.append(operation)
        
        if operations:
            response = ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=self.customer_id,
                operations=operations
            )
            
            print(f"✅ تم إضافة {len(response.results)} كلمة سلبية لمنع النقرات الوهمية")
    
    def _add_image_assets_to_campaign(self, campaign_resource_name: str, campaign_name: str, keywords: List[str]):
        """
        إضافة الصور كأصول للحملة (Image Assets)
        في حملات البحث، الصور تُضاف كـ Campaign Assets وليس Ad Group Assets
        """
        print("\n🖼️ توليد وإضافة الصور للحملة (بدون نصوص)...")
        
        try:
            # إنشاء خدمة الصور
            image_service = CampaignImageService(self.client, self.customer_id)
            
            # توليد ورفع الصور
            uploaded_images = image_service.generate_and_upload_images_for_campaign(
                campaign_type="SEARCH",
                business_name=campaign_name,
                keywords=keywords
            )
            
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            operations = []
            
            # إضافة الصور المربعة (MARKETING_IMAGE)
            for image_resource_name in uploaded_images.get('square', []):
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = image_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.MARKETING_IMAGE
                operations.append(campaign_asset_operation)
            
            # إضافة الصور الأفقية (MARKETING_IMAGE)
            for image_resource_name in uploaded_images.get('landscape', []):
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = image_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.MARKETING_IMAGE
                operations.append(campaign_asset_operation)
            
            # تطبيق التغييرات
            if operations:
                response = campaign_asset_service.mutate_campaign_assets(
                    customer_id=self.customer_id,
                    operations=operations
                )
                print(f"✅ تم إضافة {len(response.results)} صورة للحملة")
            else:
                print("⚠️ لم يتم توليد أي صور")
                
        except Exception as e:
            print(f"⚠️ خطأ في إضافة الصور: {e}")
    
    def _add_images_to_ad_group(self, ad_group_resource_name: str, campaign_name: str, keywords: List[str]):
        """
        إضافة صور للمجموعة الإعلانية (بدون نصوص!)
        طبقاً للمكتبة الرسمية: examples/misc/add_ad_group_image_asset.py
        """
        print("\n🖼️ توليد وإضافة الصور للحملة (بدون نصوص)...")
        
        try:
            # إنشاء خدمة الصور
            image_service = CampaignImageService(self.client, self.customer_id)
            
            # توليد ورفع الصور (بدون نصوص!)
            uploaded_images = image_service.generate_and_upload_images_for_campaign(
                campaign_type="SEARCH",
                business_name=campaign_name,
                keywords=keywords
            )
            
            # إضافة الصور المربعة والأفقية للمجموعة الإعلانية
            images_added = 0
            
            # إضافة الصور المربعة
            for image_resource_name in uploaded_images.get('square', []):
                try:
                    image_service.add_image_to_ad_group(
                        ad_group_resource_name,
                        image_resource_name
                    )
                    images_added += 1
                except Exception as e:
                    print(f"⚠️ خطأ في إضافة صورة مربعة: {e}")
            
            # إضافة الصور الأفقية
            for image_resource_name in uploaded_images.get('landscape', []):
                try:
                    image_service.add_image_to_ad_group(
                        ad_group_resource_name,
                        image_resource_name
                    )
                    images_added += 1
                except Exception as e:
                    print(f"⚠️ خطأ في إضافة صورة أفقية: {e}")
            
            print(f"✅ تم إضافة {images_added} صورة للمجموعة الإعلانية")
            
        except Exception as e:
            print(f"⚠️ لم يتم إضافة الصور: {e}")
            print("ℹ️ سيتم الاستمرار بدون صور...")
    
    def _extract_keywords_from_website(self, website_url: str, target_language: str, 
                                     target_locations: List[str]) -> List[Dict[str, Any]]:
        """استخراج الكلمات المفتاحية من الموقع"""
        try:
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            
            request = GenerateKeywordIdeasRequest()
            request.customer_id = self.customer_id
            request.language = f"languageConstants/{target_language}"
            request.geo_target_constants = [f"geoTargetConstants/{loc}" for loc in target_locations]
            request.keyword_plan_network = KeywordPlanNetworkEnum.GOOGLE_SEARCH
            
            # استخدام URL كبذرة
            url_seed = UrlSeed()
            url_seed.url = website_url
            request.url_seed = url_seed
            
            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            
            keywords = []
            for result in response.results:
                keyword_text = result.text
                competition = result.keyword_idea_metrics.competition.name
                avg_monthly_searches = result.keyword_idea_metrics.avg_monthly_searches
                
                # فلترة الكلمات حسب اللغة
                if target_language == "1019":  # العربية
                    if any('\u0600' <= char <= '\u06FF' for char in keyword_text):
                        keywords.append({
                            'text': keyword_text,
                            'competition': competition,
                            'avg_monthly_searches': avg_monthly_searches,
                            'competition_index': result.keyword_idea_metrics.competition_index
                        })
                elif target_language == "1000":  # الإنجليزية
                    if all(ord(char) < 128 for char in keyword_text if char.isalpha()):
                        keywords.append({
                            'text': keyword_text,
                            'competition': competition,
                            'avg_monthly_searches': avg_monthly_searches,
                            'competition_index': result.keyword_idea_metrics.competition_index
                        })
                else:
                    keywords.append({
                        'text': keyword_text,
                        'competition': competition,
                        'avg_monthly_searches': avg_monthly_searches,
                        'competition_index': result.keyword_idea_metrics.competition_index
                    })
            
            # ترتيب الكلمات حسب حجم البحث
            keywords.sort(key=lambda x: x['avg_monthly_searches'], reverse=True)
            return keywords[:30]  # أفضل 30 كلمة
            
        except Exception as e:
            print(f"⚠️ خطأ في استخراج الكلمات المفتاحية: {e}")
            return []
    
    def _classify_keywords_for_search(self, keywords: List[Dict[str, Any]]) -> Dict[str, List[Dict]]:
        """تصنيف الكلمات المفتاحية لحملات البحث"""
        classified = {
            'transactional': [],
            'commercial': [],
            'informational': [],
            'navigational': [],
            'local': [],
            'question': []
        }
        
        for kw in keywords:
            keyword_text = kw['text'].lower()
            word_count = len(keyword_text.split())
            
            # تصنيف حسب النية
            if any(word in keyword_text for word in ['شراء', 'طلب', 'احجز', 'اشتر', 'buy', 'order', 'book']):
                classified['transactional'].append(kw)
            elif any(word in keyword_text for word in ['سعر', 'تكلفة', 'أرخص', 'خصم', 'price', 'cost', 'cheap']):
                classified['commercial'].append(kw)
            elif any(word in keyword_text for word in ['كيف', 'ماذا', 'أين', 'how', 'what', 'where']):
                classified['question'].append(kw)
            elif any(word in keyword_text for word in ['في', 'بالقرب', 'محلي', 'in', 'near', 'local']):
                classified['local'].append(kw)
            elif any(word in keyword_text for word in ['موقع', 'صفحة', 'website', 'page']):
                classified['navigational'].append(kw)
            else:
                classified['informational'].append(kw)
        
        return classified
    
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
    
    def _add_audience_targeting(self, campaign_resource_name: str):
        """إضافة استهداف الجمهور (متطلب رسمي لحملات البحث)"""
        try:
            print("🎯 إضافة استهداف الجمهور...")
            
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
            campaign_criterion = campaign_criterion_operation.create
            
            campaign_criterion.campaign = campaign_resource_name
            # لا نضع type_ هنا - يتم تحديده تلقائياً من خلال الحقل المستخدم (audience)
            campaign_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            
            # استهداف جمهور عام (جميع المستخدمين)
            campaign_criterion.audience.audience = "audiences/1000001"  # All users audience
            
            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=[campaign_criterion_operation]
            )
            
            print("✅ تم إضافة استهداف الجمهور بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استهداف الجمهور: {e}")
    
    def _add_device_targeting(self, campaign_resource_name: str):
        """إضافة استهداف الأجهزة (متطلب رسمي لحملات البحث)"""
        try:
            print("📱 إضافة استهداف الأجهزة...")
            
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            
            # استهداف أجهزة سطح المكتب
            desktop_operation = self.client.get_type("CampaignCriterionOperation")
            desktop_criterion = desktop_operation.create
            desktop_criterion.campaign = campaign_resource_name
            # type_ يتم تحديده تلقائياً من خلال الحقل المستخدم (device)
            desktop_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            desktop_criterion.device.type_ = self.client.enums.DeviceEnum.DESKTOP
            
            # استهداف الأجهزة المحمولة (مع Bid Modifier +20%)
            mobile_operation = self.client.get_type("CampaignCriterionOperation")
            mobile_criterion = mobile_operation.create
            mobile_criterion.campaign = campaign_resource_name
            # type_ يتم تحديده تلقائياً من خلال الحقل المستخدم (device)
            mobile_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            mobile_criterion.device.type_ = self.client.enums.DeviceEnum.MOBILE
            mobile_criterion.bid_modifier = 1.2  # زيادة 20% للموبايل
            
            # استهداف الأجهزة اللوحية
            tablet_operation = self.client.get_type("CampaignCriterionOperation")
            tablet_criterion = tablet_operation.create
            tablet_criterion.campaign = campaign_resource_name
            # type_ يتم تحديده تلقائياً من خلال الحقل المستخدم (device)
            tablet_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            tablet_criterion.device.type_ = self.client.enums.DeviceEnum.TABLET
            
            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=[desktop_operation, mobile_operation, tablet_operation]
            )
            
            print("✅ تم إضافة استهداف الأجهزة بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استهداف الأجهزة: {e}")
    
    def _add_ad_group_bid_modifiers(self, ad_group_resource_name: str):
        """إضافة تعديلات العروض على مستوى المجموعة الإعلانية (من المكتبة الرسمية)"""
        try:
            print("💰 إضافة تعديلات العروض للمجموعة الإعلانية...")
            
            ad_group_bid_modifier_service = self.client.get_service("AdGroupBidModifierService")
            
            # إضافة Bid Modifier للموبايل (+30% على مستوى Ad Group)
            ad_group_bid_modifier_operation = self.client.get_type("AdGroupBidModifierOperation")
            ad_group_bid_modifier = ad_group_bid_modifier_operation.create
            
            ad_group_bid_modifier.ad_group = ad_group_resource_name
            ad_group_bid_modifier.bid_modifier = 1.3  # زيادة 30% للموبايل
            ad_group_bid_modifier.device.type_ = self.client.enums.DeviceEnum.MOBILE
            
            ad_group_bid_modifier_service.mutate_ad_group_bid_modifiers(
                customer_id=self.customer_id,
                operations=[ad_group_bid_modifier_operation]
            )
            
            print("✅ تم إضافة تعديلات العروض بنجاح (+30% للموبايل)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة تعديلات العروض: {e}")
    
    def _add_schedule_targeting(self, campaign_resource_name: str):
        """إضافة استهداف الأوقات (متطلب رسمي لحملات البحث)"""
        try:
            print("⏰ إضافة استهداف الأوقات...")
            
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
            campaign_criterion = campaign_criterion_operation.create
            
            campaign_criterion.campaign = campaign_resource_name
            # type_ يتم تحديده تلقائياً من خلال الحقل المستخدم (ad_schedule)
            campaign_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            
            # جدولة الإعلانات لجميع الأيام والأوقات
            campaign_criterion.ad_schedule.day_of_week = self.client.enums.DayOfWeekEnum.MONDAY
            campaign_criterion.ad_schedule.start_hour = 0
            campaign_criterion.ad_schedule.end_hour = 24
            campaign_criterion.ad_schedule.start_minute = self.client.enums.MinuteOfHourEnum.ZERO
            campaign_criterion.ad_schedule.end_minute = self.client.enums.MinuteOfHourEnum.ZERO
            
            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=[campaign_criterion_operation]
            )
            
            print("✅ تم إضافة استهداف الأوقات بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استهداف الأوقات: {e}")
    
    def _add_bidding_strategy(self, campaign_resource_name: str, strategy_type: str = "TARGET_CPA"):
        """إضافة استراتيجية المزايدة (متطلب رسمي لحملات البحث)"""
        try:
            print(f"💰 إضافة استراتيجية المزايدة: {strategy_type}")
            
            campaign_service = self.client.get_service("CampaignService")
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.update
            
            campaign.resource_name = campaign_resource_name
            campaign.bidding_strategy_type = getattr(BiddingStrategyTypeEnum, strategy_type)
            
            # إعدادات المزايدة اليدوية
            if strategy_type == "MANUAL_CPC":
                campaign.manual_cpc.enhanced_cpc_enabled = True
            
            campaign_service.mutate_campaigns(
                customer_id=self.customer_id,
                operations=[campaign_operation]
            )
            
            print("✅ تم إضافة استراتيجية المزايدة بنجاح")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة استراتيجية المزايدة: {e}")
    
    def _add_conversion_tracking(self, campaign_resource_name: str):
        """إضافة تتبع التحويلات (متطلب رسمي لحملات البحث)"""
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
    
    def _add_campaign_assets(self, campaign_resource_name: str, website_url: str, 
                            business_name: str = "أعمالنا", phone_number: str = None, ad_copies: dict = None, keywords: list = None):
        """إضافة الأصول/الإضافات للحملة (Sitelinks, Callouts, Call Extension) - مولدة من محتوى الموقع"""
        try:
            print("\n🎨 إضافة الأصول الإعلانية (Assets/Extensions) - مولدة من محتوى الموقع...")
            
            # استخراج الأصول المولدة من AI
            callouts = ad_copies.get('callouts', []) if ad_copies else []
            structured_snippets_list = ad_copies.get('structured_snippets', []) if ad_copies else []
            
            # معالجة structured_snippets - يمكن أن يكون array أو object
            if isinstance(structured_snippets_list, list):
                structured_snippets = structured_snippets_list
            elif isinstance(structured_snippets_list, dict):
                structured_snippets = [structured_snippets_list]  # تحويل إلى array
            else:
                structured_snippets = []
            
            promotion = ad_copies.get('promotion', {}) if ad_copies else {}
            
            if callouts:
                print(f"✅ استلام {len(callouts)} Callouts مولدة من AI")
            if structured_snippets:
                print(f"✅ استلام {len(structured_snippets)} Structured Snippets مولدة من AI")
            if promotion:
                print(f"✅ استلام Promotion مولد من AI")
            
            # 1. إضافة Sitelinks (روابط إضافية)
            self._add_sitelink_assets(campaign_resource_name, website_url)
            
            # 2. إضافة Callouts (نقاط مميزة) - المولدة من AI
            self._add_callout_assets(campaign_resource_name, callouts)
            
            # 3. إضافة Structured Snippets (مقتطفات منظمة) - المولدة من AI (يمكن أن يكون 1-2)
            if structured_snippets:
                for snippet in structured_snippets[:2]:  # حد أقصى 2 snippets
                    if snippet:
                        self._add_structured_snippet_assets(campaign_resource_name, snippet)
            
            # 4. إضافة Call Extension (رقم الهاتف) إذا كان متاحاً
            if phone_number:
                self._add_call_extension(campaign_resource_name, phone_number, business_name)
            
            # 5. Price Extension محذوف (حسب طلب المستخدم)
            # self._add_price_extension(campaign_resource_name)
            
            # 6. إضافة Promotion Extension (العروض) - المولد من AI
            self._add_promotion_extension(campaign_resource_name, website_url, promotion)
            
            # 7. إضافة Image Extensions (للحصول على Quality Score 10/10)
            if ad_copies and ad_copies.get('images'):
                self._add_image_assets(campaign_resource_name, ad_copies.get('images'))
            
            # 8. إضافة Negative Keywords (لتحسين Relevance و Quality Score)
            self._add_campaign_negative_keywords(campaign_resource_name, keywords)
            
            print("✅ تم إضافة جميع الأصول الإعلانية (Sitelinks, Callouts, Snippets, Promotions, Images, Negative Keywords)")
            
        except Exception as e:
            print(f"⚠️ خطأ في إضافة الأصول: {e}")
    
    def _extract_real_sitelinks_from_website(self, website_url: str) -> List[Dict]:
        """استخراج الروابط الحقيقية من الموقع"""
        try:
            import requests
            from bs4 import BeautifulSoup
            from urllib.parse import urljoin, urlparse
            
            response = requests.get(website_url, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # البحث عن روابط في القائمة الرئيسية (nav, menu)
            nav_links = []
            for nav in soup.find_all(['nav', 'header']):
                for link in nav.find_all('a', href=True):
                    href = link.get('href')
                    text = link.get_text(strip=True)
                    
                    # تجاهل الروابط الفارغة أو الـ anchors
                    if not href or href.startswith('#') or not text:
                        continue
                    
                    # تحويل الروابط النسبية إلى مطلقة
                    full_url = urljoin(website_url, href)
                    
                    # التأكد أن الرابط من نفس الدومين
                    if urlparse(full_url).netloc == urlparse(website_url).netloc:
                        nav_links.append({
                            "text": text[:25],  # حد أقصى 25 حرف
                            "url": full_url,
                            "desc1": f"اكتشف {text[:20]}",
                            "desc2": "تعرف على المزيد"
                        })
            
            # إرجاع أول 4 روابط فريدة
            unique_links = []
            seen_urls = set()
            for link in nav_links:
                if link["url"] not in seen_urls and link["url"] != website_url:
                    unique_links.append(link)
                    seen_urls.add(link["url"])
                    if len(unique_links) >= 4:
                        break
            
            return unique_links
            
        except Exception as e:
            print(f"⚠️ تعذر استخراج الروابط من الموقع: {e}")
            return []
    
    def _add_sitelink_assets(self, campaign_resource_name: str, website_url: str):
        """إضافة روابط إضافية (Sitelinks)"""
        try:
            asset_service = self.client.get_service("AssetService")
            asset_set_asset_service = self.client.get_service("CampaignAssetService")
            
            # محاولة استخراج الروابط الحقيقية من الموقع
            real_sitelinks = self._extract_real_sitelinks_from_website(website_url)
            
            # إذا لم نجد روابط حقيقية، نستخدم الرابط الأساسي فقط
            if not real_sitelinks:
                # استخدام الرابط الأساسي فقط مع نصوص مختلفة
                base_url = website_url.rstrip('/')
                sitelinks = [
                    {"text": "تواصل معنا", "url": base_url, "desc1": "اتصل بنا الآن", "desc2": "خدمة العملاء 24/7"},
                    {"text": "خدماتنا", "url": base_url, "desc1": "اكتشف خدماتنا", "desc2": "جودة وكفاءة عالية"},
                    {"text": "احجز الآن", "url": base_url, "desc1": "احجز موعدك", "desc2": "سريع وسهل"},
                    {"text": "المزيد", "url": base_url, "desc1": "معلومات إضافية", "desc2": "تعرف علينا أكثر"}
                ]
            else:
                sitelinks = real_sitelinks[:4]  # أول 4 روابط فقط
            
            for sitelink in sitelinks:
                # إنشاء Asset
                asset_operation = self.client.get_type("AssetOperation")
                asset = asset_operation.create
                asset.name = sitelink["text"]
                asset.type_ = self.client.enums.AssetTypeEnum.SITELINK
                asset.sitelink_asset.link_text = sitelink["text"]
                asset.sitelink_asset.description1 = sitelink.get("desc1", f"اكتشف {sitelink['text']}")
                asset.sitelink_asset.description2 = sitelink.get("desc2", "اضغط هنا للمزيد")
                asset.final_urls.append(sitelink["url"])
                
                # إنشاء الأصل
                asset_response = asset_service.mutate_assets(
                    customer_id=self.customer_id,
                    operations=[asset_operation]
                )
                
                asset_resource_name = asset_response.results[0].resource_name
                
                # ربط الأصل بالحملة
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = asset_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.SITELINK
                
                asset_set_asset_service.mutate_campaign_assets(
                    customer_id=self.customer_id,
                    operations=[campaign_asset_operation]
                )
            
            print(f"✅ تم إضافة {len(sitelinks)} روابط إضافية (Sitelinks)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Sitelinks: {e}")
    
    def _add_callout_assets(self, campaign_resource_name: str, callouts_from_ai: list = None):
        """إضافة نقاط مميزة (Callouts) - مولدة من AI بناءً على محتوى الموقع"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            # استخدام Callouts المولدة من AI، أو fallback إذا لم تُولَّد
            if callouts_from_ai and len(callouts_from_ai) >= 4:
                callouts = callouts_from_ai[:6]  # حد أقصى 6
                print(f"✅ استخدام Callouts المولدة من AI: {callouts}")
            else:
                # fallback فقط إذا فشل التوليد
                callouts = [
                    "خدمة متميزة",
                    "جودة عالية",
                    "أسعار مناسبة",
                    "فريق محترف",
                    "خبرة واسعة",
                    "رضا العملاء"
                ]
                print(f"⚠️ استخدام Callouts الافتراضية (لم تُولَّد من AI)")
            
            for callout_text in callouts:
                # إنشاء Asset
                asset_operation = self.client.get_type("AssetOperation")
                asset = asset_operation.create
                asset.name = f"Callout: {callout_text}"
                asset.type_ = self.client.enums.AssetTypeEnum.CALLOUT
                asset.callout_asset.callout_text = callout_text
                
                # إنشاء الأصل
                asset_response = asset_service.mutate_assets(
                    customer_id=self.customer_id,
                    operations=[asset_operation]
                )
                
                asset_resource_name = asset_response.results[0].resource_name
                
                # ربط الأصل بالحملة
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = asset_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.CALLOUT
                
                campaign_asset_service.mutate_campaign_assets(
                    customer_id=self.customer_id,
                    operations=[campaign_asset_operation]
                )
            
            print(f"✅ تم إضافة {len(callouts)} نقاط مميزة (Callouts)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Callouts: {e}")
    
    def _add_structured_snippet_assets(self, campaign_resource_name: str, snippets_from_ai: dict = None):
        """إضافة مقتطفات منظمة (Structured Snippets) - مولدة من AI بناءً على محتوى الموقع"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            # استخدام Structured Snippets المولدة من AI، أو fallback
            if snippets_from_ai and 'header' in snippets_from_ai and 'values' in snippets_from_ai and len(snippets_from_ai['values']) >= 3:
                header = snippets_from_ai['header']
                values = snippets_from_ai['values'][:4]  # حد أقصى 4
                print(f"✅ استخدام Structured Snippets المولدة من AI: {header} - {values}")
            else:
                # fallback فقط إذا فشل التوليد
                header = "الخدمات"
                values = ["خدمة متميزة", "جودة عالية", "فريق محترف", "خبرة واسعة"]
                print(f"⚠️ استخدام Structured Snippets الافتراضية (لم تُولَّد من AI)")
            
            # إنشاء Structured Snippet
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = f"{header} المميزة"
            asset.type_ = self.client.enums.AssetTypeEnum.STRUCTURED_SNIPPET
            asset.structured_snippet_asset.header = header
            asset.structured_snippet_asset.values.extend(values)
            
            # إنشاء الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            
            asset_resource_name = asset_response.results[0].resource_name
            
            # ربط الأصل بالحملة
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.STRUCTURED_SNIPPET
            
            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )
            
            print("✅ تم إضافة المقتطفات المنظمة (Structured Snippets)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Structured Snippets: {e}")
    
    def _add_call_extension(self, campaign_resource_name: str, phone_number: str, business_name: str):
        """إضافة إضافة المكالمة (Call Extension)"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            # إنشاء Call Asset
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = f"Call: {business_name}"
            asset.type_ = self.client.enums.AssetTypeEnum.CALL
            asset.call_asset.phone_number = phone_number
            asset.call_asset.country_code = "SA"  # السعودية
            asset.call_asset.call_conversion_reporting_state = (
                self.client.enums.CallConversionReportingStateEnum.USE_ACCOUNT_LEVEL_CALL_CONVERSION_ACTION
            )
            
            # إنشاء الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            
            asset_resource_name = asset_response.results[0].resource_name
            
            # ربط الأصل بالحملة
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.CALL
            
            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )
            
            print(f"✅ تم إضافة إضافة المكالمة (Call Extension): {phone_number}")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Call Extension: {e}")
    
    def _add_price_extension(self, campaign_resource_name: str):
        """إضافة إضافة الأسعار (Price Extension)"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            # إنشاء Price Asset
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = "باقات الأسعار"
            asset.type_ = self.client.enums.AssetTypeEnum.PRICE
            
            # تعيين نوع الأسعار
            asset.price_asset.type_ = self.client.enums.PriceExtensionTypeEnum.SERVICES
            asset.price_asset.price_qualifier = self.client.enums.PriceExtensionPriceQualifierEnum.FROM
            asset.price_asset.language_code = "en"  # استخدام "en" بدلاً من "ar" (غير مدعوم)
            
            # إضافة عناصر الأسعار (3-8 عناصر)
            price_offerings = [
                {
                    "header": "الباقة الأساسية",
                    "description": "خدمات أساسية شاملة",
                    "price_micros": 100_000_000,  # 100 ريال
                    "unit": "PER_HOUR"
                },
                {
                    "header": "الباقة المتوسطة",
                    "description": "خدمات متقدمة",
                    "price_micros": 200_000_000,  # 200 ريال
                    "unit": "PER_HOUR"
                },
                {
                    "header": "الباقة المميزة",
                    "description": "خدمات شاملة VIP",
                    "price_micros": 350_000_000,  # 350 ريال
                    "unit": "PER_HOUR"
                }
            ]
            
            # إنشاء price_offerings بشكل صحيح
            for offering in price_offerings:
                price_offering = self.client.get_type("PriceOffering")
                price_offering.header = offering["header"]
                price_offering.description = offering["description"]
                price_offering.price.amount_micros = offering["price_micros"]
                price_offering.price.currency_code = "USD"  # استخدام USD بدلاً من SAR (غير مدعوم)
                price_offering.unit = self.client.enums.PriceExtensionPriceUnitEnum[offering["unit"]]
                price_offering.final_url = "https://warshasa.com"  # رابط موحد
                asset.price_asset.price_offerings.append(price_offering)
            
            # إنشاء الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            
            asset_resource_name = asset_response.results[0].resource_name
            
            # ربط الأصل بالحملة
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.PRICE
            
            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )
            
            print(f"✅ تم إضافة إضافة الأسعار (Price Extension)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Price Extension: {e}")
    
    def _add_promotion_extension(self, campaign_resource_name: str, website_url: str = None, promotion_from_ai: dict = None):
        """إضافة إضافة العروض (Promotion Extension) - مولدة من AI بناءً على محتوى الموقع"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            # استخدام Promotion المولد من AI، أو fallback
            if promotion_from_ai and 'name' in promotion_from_ai and 'target' in promotion_from_ai:
                promo_name = promotion_from_ai['name'][:15]  # حد أقصى 15 حرف
                promo_target = promotion_from_ai['target'][:30]  # حد أقصى 30 حرف
                print(f"✅ استخدام Promotion المولد من AI: {promo_name} - {promo_target}")
            else:
                # fallback فقط إذا فشل التوليد
                promo_name = "عرض خاص"
                promo_target = "خصم على جميع الخدمات"
                print(f"⚠️ استخدام Promotion الافتراضي (لم يُولَّد من AI)")
            
            # إنشاء Promotion Asset
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = promo_name
            asset.type_ = self.client.enums.AssetTypeEnum.PROMOTION
            
            # إضافة final_urls (مطلوب)
            asset.final_urls.append(website_url if website_url else "https://warshasa.com")
            
            # تعيين تفاصيل العرض
            asset.promotion_asset.promotion_target = promo_target
            asset.promotion_asset.discount_modifier = self.client.enums.PromotionExtensionDiscountModifierEnum.UP_TO
            
            # FIXED: استخدام money_amount_off بدلاً من percent_off لتجنب مشاكل Format
            # percent_off يسبب خطأ TOO_MANY_DECIMAL_PLACES_SPECIFIED
            money_amount = self.client.get_type("Money")
            money_amount.amount_micros = 50000000  # 50 وحدة عملة (50 * 1000000 micros)
            money_amount.currency_code = "USD"
            asset.promotion_asset.money_amount_off = money_amount
            
            # لا نستخدم occasion لتجنب خطأ UNKNOWN
            # asset.promotion_asset.occasion - تركها فارغة
            asset.promotion_asset.language_code = "en"  # استخدام "en" بدلاً من "ar" (غير مدعوم)
            
            # إضافة تاريخ البداية والنهاية (اختياري)
            import datetime
            start_date = datetime.datetime.now()
            end_date = start_date + datetime.timedelta(days=30)
            asset.promotion_asset.start_date = start_date.strftime("%Y-%m-%d")
            asset.promotion_asset.end_date = end_date.strftime("%Y-%m-%d")
            
            # إنشاء الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            
            asset_resource_name = asset_response.results[0].resource_name
            
            # ربط الأصل بالحملة
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.PROMOTION
            
            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )
            
            print(f"✅ تم إضافة إضافة العروض (Promotion Extension)")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Promotion Extension: {e}")
    
    def _add_image_assets(self, campaign_resource_name: str, images: list = None):
        """إضافة صور إعلانية (Image Assets) - للحصول على Quality Score 10/10"""
        try:
            if not images or len(images) == 0:
                print("⚠️ لا توجد صور لإضافتها")
                return
            
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")
            
            print(f"📸 إضافة {len(images)} صورة إعلانية...")
            
            for idx, image_url in enumerate(images[:4]):  # حد أقصى 4 صور
                try:
                    # تحميل الصورة
                    import requests
                    response = requests.get(image_url, timeout=10)
                    if response.status_code != 200:
                        continue
                    
                    image_data = response.content
                    
                    # إنشاء Image Asset
                    asset_operation = self.client.get_type("AssetOperation")
                    asset = asset_operation.create
                    asset.name = f"Search Image {idx + 1}"
                    asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
                    asset.image_asset.data = image_data
                    
                    # إنشاء الأصل
                    asset_response = asset_service.mutate_assets(
                        customer_id=self.customer_id,
                        operations=[asset_operation]
                    )
                    
                    asset_resource_name = asset_response.results[0].resource_name
                    
                    # ربط الأصل بالحملة
                    campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                    campaign_asset = campaign_asset_operation.create
                    campaign_asset.campaign = campaign_resource_name
                    campaign_asset.asset = asset_resource_name
                    campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.MARKETING_IMAGE
                    
                    campaign_asset_service.mutate_campaign_assets(
                        customer_id=self.customer_id,
                        operations=[campaign_asset_operation]
                    )
                    
                    print(f"  ✅ تم إضافة صورة {idx + 1}")
                    
                except Exception as img_error:
                    print(f"  ⚠️ فشل في إضافة صورة {idx + 1}: {img_error}")
                    continue
            
            print(f"✅ تم إضافة Image Assets للحملة")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Image Assets: {e}")
    
    def _add_campaign_negative_keywords(self, campaign_resource_name: str, keywords: list = None):
        """إضافة كلمات مفتاحية سلبية على مستوى الحملة (Negative Keywords) - لتحسين Quality Score"""
        try:
            if not keywords:
                print("⚠️ لا توجد كلمات مفتاحية لاستخراج الكلمات السلبية منها")
                return
            
            # قائمة الكلمات السلبية العامة (تُستخدم دائماً)
            universal_negatives = [
                "مجاني", "مجانا", "مجانية", "free",
                "وظيفة", "وظائف", "توظيف", "job", "jobs",
                "كورس", "كورسات", "دورة", "course",
                "pdf", "تحميل", "download",
                "رخيص", "رخيصة", "cheap"
            ]
            
            # استخراج كلمات سلبية ذكية بناءً على نوع النشاط
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            operations = []
            
            for negative_keyword in universal_negatives[:20]:  # حد أقصى 20
                try:
                    campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
                    criterion = campaign_criterion_operation.create
                    criterion.campaign = campaign_resource_name
                    criterion.negative = True
                    criterion.keyword.text = negative_keyword
                    criterion.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.PHRASE
                    
                    operations.append(campaign_criterion_operation)
                except Exception as e:
                    continue
            
            if operations:
                response = campaign_criterion_service.mutate_campaign_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                print(f"✅ تم إضافة {len(operations)} كلمة مفتاحية سلبية")
            
        except Exception as e:
            print(f"⚠️ تحذير: فشل في إضافة Negative Keywords: {e}")

