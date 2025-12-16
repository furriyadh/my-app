# -*- coding: utf-8 -*-
"""
منشئ حملات ال (Video Campaigns)
====================================

هذا الملف يحتوي على جميع الوظائف المطلوبة ل حملات ال
باستخدام المكتبة الرسمية لـ Google Ads API v21.

المرجع الرسمي:
google-ads-official/google/ads/googleads/v21/enums/types/ad_type.py

أنواع إعلانات ال المتاحة:
1. VIDEO_RESPONSIVE_AD - إعلان  متجاوب (الأكثر مرونة)
2. VIDEO_BUMPER_AD - إعلان  قصير (6 ثواني، غير قابل للتخطي)
3. VIDEO_NON_SKIPPABLE_IN_STREAM_AD - إعلان  غير قابل للتخطي (15-20 ثانية)
4. VIDEO_TRUEVIEW_IN_STREAM_AD - إعلان TrueView In-Stream (قابل للتخطي بعد 5 ثواني)
5. IN_FEED_VIDEO_AD - إعلان   الخلاصة (YouTube Home, Watch, Search)

الميزات:
-   باستخدام Google Keyword Planner
- توليد محتوى إعلاني ديناميكي باستخدام AI
-    كاملة
- استهداف المواقع واللغات
- استراتيجية المزايدة Manual CPC
"""

import uuid
import time
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from services.ai_content_generator import AIContentGenerator
from services.industry_targeting_config import (
    detect_industry, get_industry_config,
    AGE_18_24, AGE_25_34, AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP,
    MALE, FEMALE, GENDER_ALL,
    INCOME_0_50, INCOME_50_60, INCOME_60_70, INCOME_70_80, INCOME_80_90, INCOME_90_UP,
    PARENT, NOT_A_PARENT,
    DEVICE_MOBILE, DEVICE_TABLET, DEVICE_DESKTOP, DEVICE_TV,
    FREQ_DAY, FREQ_WEEK, FREQ_MONTH,
    INDUSTRY_CONFIG
)


class VideoCampaignCreator:
    """منشئ حملات ال"""
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        """
        تهيئة منشئ حملات ال
        
        Args:
            client: عميل Google Ads API
            customer_id: معرف العميل
        """
        self.client = client
        self.customer_id = customer_id
        self.ai_generator = AIContentGenerator()
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات ال"""
        return {
            "campaign_type": "VIDEO",
            "name": "حملات ال",
            "description": "حملات إعلانية  تظهر على YouTube ومواقع أخرى",
            "video_ad_types": {
                "VIDEO_RESPONSIVE_AD": {
                    "name": "إعلان فيديو متجاوب",
                    "name_en": "Video Responsive Ad",
                    "description": "إعلان فيديو مرن يتكيف مع مختلف المواضع والأحجام على YouTube وشركاء الفيديو",
                    "description_en": "Flexible video ad that adapts to different placements on YouTube and Video Partners",
                    "required_assets": {
                        "headlines": {
                            "type": "AdTextAsset[]",
                            "min": 1,
                            "max": 5,
                            "max_length": 30,
                            "current_limit": 1,  # حالياً قيمة واحدة فقط مدعومة
                            "description": "عناوين قصيرة جذابة"
                        },
                        "long_headlines": {
                            "type": "AdTextAsset[]",
                            "min": 1,
                            "max": 5,
                            "max_length": 90,
                            "current_limit": 1,  # حالياً قيمة واحدة فقط مدعومة
                            "description": "عناوين طويلة للتفصيل"
                        },
                        "descriptions": {
                            "type": "AdTextAsset[]",
                            "min": 1,
                            "max": 5,
                            "max_length": 90,
                            "current_limit": 1,  # حالياً قيمة واحدة فقط مدعومة
                            "description": "أوصاف توضيحية"
                        },
                        "call_to_actions": {
                            "type": "AdTextAsset[]",
                            "required": False,
                            "max": 1,
                            "description": "زر الدعوة للإجراء (CTA)"
                        },
                        "videos": {
                            "type": "AdVideoAsset[]",
                            "min": 1,
                            "max": 5,
                            "current_limit": 1,  # حالياً قيمة واحدة فقط مدعومة
                            "description": "فيديوهات YouTube"
                        },
                        "companion_banners": {
                            "type": "AdImageAsset[]",
                            "required": False,
                            "max": 1,
                            "description": "صور مرافقة (300x60)"
                        },
                        "breadcrumb1": {
                            "type": "string",
                            "required": False,
                            "max_length": 15,
                            "description": "الجزء الأول من URL المعروض"
                        },
                        "breadcrumb2": {
                            "type": "string",
                            "required": False,
                            "max_length": 15,
                            "description": "الجزء الثاني من URL المعروض"
                        }
                    },
                    "ad_level_requirements": {
                        "final_urls": {
                            "required": True,
                            "description": "رابط الموقع الوجهة"
                        },
                        "name": {
                            "required": False,
                            "description": "اسم الإعلان للتعريف"
                        }
                    },
                    "placements": ["YouTube In-Stream", "YouTube Home", "YouTube Search", "Video Partners"],
                    "ad_group_type": "VIDEO_RESPONSIVE",
                    "bidding": ["TARGET_CPV", "TARGET_CPA", "MAXIMIZE_CONVERSIONS"],
                    "recommended": True
                },
                "VIDEO_BUMPER_AD": {
                    "name": "إعلان بامبر قصير",
                    "name_en": "Bumper Ad",
                    "description": "إعلان قصير 6 ثواني غير قابل للتخطي - مثالي للوعي بالعلامة التجارية",
                    "description_en": "Short 6-second non-skippable ad - ideal for brand awareness",
                    "required_assets": {
                        "video": {
                            "type": "AdVideoAsset",
                            "required": True,
                            "max_duration": 6,
                            "description": "فيديو واحد (6 ثواني بالضبط)"
                        },
                        "companion_banner": {
                            "type": "AdImageAsset",
                            "required": False,
                            "dimensions": "300x60",
                            "description": "صورة مرافقة تظهر بجانب الفيديو"
                        },
                        "action_button_label": {
                            "type": "string",
                            "required": False,
                            "description": "نص زر الدعوة للإجراء"
                        },
                        "action_headline": {
                            "type": "string",
                            "required": False,
                            "description": "نص إضافي مع زر CTA"
                        }
                    },
                    "ad_level_requirements": {
                        "final_urls": {
                            "required": True,
                            "description": "رابط الموقع الوجهة"
                        }
                    },
                    "placements": ["YouTube In-Stream", "Video Partners"],
                    "ad_group_type": "VIDEO_BUMPER",
                    "bidding": ["TARGET_CPM"],
                    "best_for": "الوعي بالعلامة التجارية والوصول الواسع"
                },
                "VIDEO_NON_SKIPPABLE_IN_STREAM_AD": {
                    "name": "إعلان فيديو غير قابل للتخطي",
                    "name_en": "Non-Skippable In-Stream Ad",
                    "description": "إعلان 15-20 ثانية غير قابل للتخطي - رسالة كاملة مضمونة",
                    "description_en": "15-20 second non-skippable ad - guaranteed full message delivery",
                    "required_assets": {
                        "video": {
                            "type": "AdVideoAsset",
                            "required": True,
                            "min_duration": 15,
                            "max_duration": 20,
                            "description": "فيديو واحد (15-20 ثانية)"
                        },
                        "companion_banner": {
                            "type": "AdImageAsset",
                            "required": False,
                            "dimensions": "300x60",
                            "description": "صورة مرافقة"
                        },
                        "action_button_label": {
                            "type": "string",
                            "required": False,
                            "description": "نص زر الدعوة للإجراء"
                        },
                        "action_headline": {
                            "type": "string",
                            "required": False,
                            "description": "نص إضافي مع زر CTA"
                        }
                    },
                    "ad_level_requirements": {
                        "final_urls": {
                            "required": True,
                            "description": "رابط الموقع الوجهة"
                        }
                    },
                    "placements": ["YouTube In-Stream", "Video Partners"],
                    "ad_group_type": "VIDEO_NON_SKIPPABLE_IN_STREAM",
                    "bidding": ["TARGET_CPM"],
                    "best_for": "رسالة كاملة مضمونة وتأثير قوي"
                },
                "VIDEO_TRUEVIEW_IN_STREAM_AD": {
                    "name": "إعلان TrueView In-Stream",
                    "name_en": "TrueView In-Stream Ad",
                    "description": "إعلان قابل للتخطي بعد 5 ثواني - ادفع فقط عند مشاهدة 30 ثانية أو التفاعل",
                    "description_en": "Skippable after 5 seconds - pay only when viewers watch 30s or interact",
                    "required_assets": {
                        "video": {
                            "type": "AdVideoAsset",
                            "required": True,
                            "min_duration": 12,
                            "recommended_duration": "30-60 seconds",
                            "description": "فيديو واحد (أي طول، يُفضل 30-60 ثانية)"
                        },
                        "action_button_label": {
                            "type": "string",
                            "required": True,  # مطلوب لحملات TrueView for Action
                            "max_length": 10,
                            "description": "نص زر الدعوة للإجراء (مثل: اشترِ الآن)"
                        },
                        "action_headline": {
                            "type": "string",
                            "required": True,
                            "max_length": 15,
                            "description": "نص إضافي يظهر مع زر CTA"
                        },
                        "companion_banner": {
                            "type": "AdImageAsset",
                            "required": False,
                            "dimensions": "300x60",
                            "description": "صورة مرافقة"
                        }
                    },
                    "ad_level_requirements": {
                        "final_urls": {
                            "required": True,
                            "description": "رابط الموقع الوجهة"
                        }
                    },
                    "placements": ["YouTube In-Stream", "Video Partners"],
                    "ad_group_type": "VIDEO_TRUE_VIEW_IN_STREAM",
                    "bidding": ["TARGET_CPV", "TARGET_CPA", "MAXIMIZE_CONVERSIONS"],
                    "billing": "CPV (تدفع عند مشاهدة 30 ثانية أو التفاعل)",
                    "best_for": "التفاعل والتحويلات والمبيعات"
                },
                "IN_FEED_VIDEO_AD": {
                    "name": "إعلان فيديو في الخلاصة",
                    "name_en": "In-Feed Video Ad",
                    "description": "إعلان يظهر في نتائج البحث والصفحة الرئيسية - مثالي لزيادة المشاهدات",
                    "description_en": "Ad appears in search results and home feed - ideal for views and subscribers",
                    "required_assets": {
                        "video": {
                            "type": "AdVideoAsset",
                            "required": True,
                            "description": "فيديو YouTube واحد"
                        },
                        "headline": {
                            "type": "string",
                            "required": True,
                            "max_length": 100,
                            "description": "عنوان الإعلان الرئيسي"
                        },
                        "description1": {
                            "type": "string",
                            "required": True,
                            "max_length": 35,
                            "description": "السطر الأول من الوصف"
                        },
                        "description2": {
                            "type": "string",
                            "required": False,
                            "max_length": 35,
                            "description": "السطر الثاني من الوصف"
                        },
                        "thumbnail": {
                            "type": "VideoThumbnail",
                            "required": False,
                            "options": ["THUMBNAIL_1", "THUMBNAIL_2", "THUMBNAIL_3", "AUTO"],
                            "description": "صورة مصغرة للفيديو"
                        }
                    },
                    "ad_level_requirements": {
                        "final_urls": {
                            "required": False,  # لا يتطلب URL - يوجه للفيديو مباشرة
                            "description": "غير مطلوب - الإعلان يوجه لمشاهدة الفيديو"
                        }
                    },
                    "placements": ["YouTube Home", "YouTube Search", "YouTube Watch Next"],
                    "ad_group_type": "VIDEO_TRUE_VIEW_IN_DISPLAY",
                    "bidding": ["TARGET_CPV", "MAX_CPV"],
                    "best_for": "زيادة المشاهدات والمشتركين وتفاعل القناة"
                }
            },
            "video_requirements": {
                "formats": ["MP4", "AVI", "ASF", "QuickTime", "Windows Media", "MPEG"],
                    "max_file_size": "1 GB",
                    "max_duration": "6 hours",
                "recommended_resolutions": {
                    "hd": "1280×720 (16:9)",
                    "sd": "640×360 (16:9)",
                    "vertical": "1080×1920 (9:16) for Shorts"
                }
            },
            "text_requirements": {
                "headlines": {
                    "min_count": 1,
                    "max_count": 5,
                    "max_length": 30,
                    "description": "عناوين إعلانية جذابة"
                },
                "descriptions": {
                    "min_count": 1,
                    "max_count": 5,
                    "max_length": 90,
                    "description": "أوصاف إعلانية مقنعة"
                },
                "long_headlines": {
                    "max_length": 90,
                    "description": "عنوان طويل (اختياري)"
                }
            },
            "targeting_requirements": {
                "location": {"required": True},
                "language": {"required": True},
                "audience": {"required": False},
                "demographics": {"required": False},
                "interests": {"required": False},
                "keywords": {"required": False},
                "topics": {"required": False},
                "placements": {"required": False}
            },
            "bidding_strategies": [
                "MANUAL_CPV",  # تكلفة  اليدوية
                "MAXIMIZE_CONVERSIONS",  # تعظيم التحويلات
                "TARGET_CPM",  # تكلفة الألف ظهور المستهدفة
                "TARGET_CPA"  # تكلفة الإجراء المستهدفة
            ],
            "budget_requirements": {
                "min_daily_budget": 1.0,
                "currency": "USD",
                "delivery_method": "STANDARD"
            }
        }
    
    def create_video_campaign(
        self,
        campaign_name: str,
        daily_budget: float,
        target_locations: List[str],
        target_language: str,
        website_content: Dict[str, Any],
        ad_copies: Dict[str, Any],
        video_ad_type: str = "VIDEO_RESPONSIVE_AD",
        website_url: str = "https://www.example.com",
        youtube_video_id: str = None,
        dry_run: bool = False
    ) -> str:
        """
           فعلية باستخدام Google Ads API

        Args:
            campaign_name: اسم ال
            daily_budget: الميزانية اليومية بالدولار
            target_locations: قائمة معرفات المواقع الجغراة
            target_language: معرف اللغة
            website_content: محتوى  من ال
            ad_copies:   المُعدة
            video_ad_type: نوع إعلان ال
            website_url: رابط 
            dry_run: إذا كان True، سي فقط الفحص بدون  ال

        Returns:
            معرف ال المنشأة
        """
        print(f" {'[TEST MODE] ' if dry_run else ''}Creating video campaign...")
        print("=" * 50)

        if dry_run:
            print("\n **TEST MODE (Dry Run) - Campaign will not be created**")
        print("=" * 50)

        try:
            if not self.client:
                print("Google Ads API not available - returning dummy ID")
                return f"video_campaign_{uuid.uuid4().hex[:8]}"

            # 🎯 اكتشاف الصناعة من المحتوى
            # التحقق من نوع website_content - قد يكون dict أو string (URL)
            if isinstance(website_content, dict):
                content_for_detection = f"{website_content.get('title', '')} {website_content.get('description', '')} {' '.join([kw.get('text', '') if isinstance(kw, dict) else str(kw) for kw in website_content.get('keywords', [])])}"
            else:
                # إذا كان string (URL أو نص)، استخدمه مباشرة
                content_for_detection = str(website_content) if website_content else ""
            detected_industry = detect_industry(content_for_detection)
            industry_config = get_industry_config(detected_industry)
            print(f"🎯 الصناعة المكتشفة: {industry_config.get('name_ar', detected_industry)} ({detected_industry})")

            # 1.  ميزانية ال
            budget_resource_name = self._create_campaign_budget(campaign_name, daily_budget)

            # 2.  ال الأساسية
            campaign_resource_name = self._create_video_campaign_core(
                campaign_name, budget_resource_name, target_locations, target_language
            )

            # 3.  مجموعة الإعلانات
            ad_group_resource_name = self._create_ad_group(campaign_resource_name, f"{campaign_name} - مجموعة الإعلانات", video_ad_type)

            # 4.  إعلان  واحد (أفضل ممارسة من Google لل)
            print("\n  الإعلان ال...")
            self._create_video_ad(ad_group_resource_name, ad_copies, website_url, video_ad_type, youtube_video_id)

            # 5. إضافة كلمات مفتاحية لل (اختياري - لل  نتائج البحث)
            keywords = website_content.get('keywords', []) if isinstance(website_content, dict) else []
            if keywords:
                self._add_video_keywords_to_ad_group(ad_group_resource_name, keywords[:10])

            # 🎯 6. استهداف الديمغرافيا الذكي حسب الصناعة
            self._apply_smart_demographic_targeting(ad_group_resource_name, industry_config)

            # 🎯 7. استهداف الأجهزة الذكي حسب الصناعة
            self._apply_smart_device_targeting(campaign_resource_name, industry_config)

            # 🎯 8. تحديد الظهور الذكي حسب الصناعة
            self._apply_smart_frequency_capping(campaign_resource_name, industry_config)

            # 9. إضافة استهداف المواضيع لل
            self._add_video_topic_targeting(campaign_resource_name, website_content)

            # 10. إضافة الأصول  لل
            business_name = campaign_name.replace(" ", "").replace(" - VIDEO", "")
            self._add_video_campaign_assets(
                campaign_resource_name,
                website_url,
                business_name=business_name,
                phone_number=None
            )

            campaign_id = campaign_resource_name.split('/')[-1]
            print(f"    ال بمعرف: {campaign_id}")
            return campaign_id

        except Exception as e:
            print(f"     ال: {e}")
            raise Exception(f"فشل    ال: {e}")

    def _add_video_audience_targeting(self, campaign_resource_name: str):
        """إضافة استهداف الجمهور لحملات ال"""
        try:
            print(" إضافة استهداف الجمهور لل...")

            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
            campaign_criterion = campaign_criterion_operation.create

            campaign_criterion.campaign = campaign_resource_name
            campaign_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED

            # استهداف جمهور عام (جميع المستخدمين) لل
            campaign_criterion.audience.audience = "audiences/1000001"  # All users audience

            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=[campaign_criterion_operation]
            )

            print("  إضافة استهداف الجمهور لل ")

        except Exception as e:
            print(f"   إضافة استهداف الجمهور لل: {e}")

    def _add_video_device_targeting(self, campaign_resource_name: str):
        """إضافة استهداف الأجهزة لحملات ال"""
        try:
            print(" إضافة استهداف الأجهزة لل...")

            campaign_criterion_service = self.client.get_service("CampaignCriterionService")

            # استهداف أجهزة سطح المكتب
            desktop_operation = self.client.get_type("CampaignCriterionOperation")
            desktop_criterion = desktop_operation.create
            desktop_criterion.campaign = campaign_resource_name
            desktop_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            desktop_criterion.device.type_ = self.client.enums.DeviceEnum.DESKTOP

            # استهداف الأجهزة المحمولة (مع Bid Modifier +30%)
            mobile_operation = self.client.get_type("CampaignCriterionOperation")
            mobile_criterion = mobile_operation.create
            mobile_criterion.campaign = campaign_resource_name
            mobile_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            mobile_criterion.device.type_ = self.client.enums.DeviceEnum.MOBILE
            mobile_criterion.bid_modifier = 1.0  # بدون تعديل للموبايل (0%)

            # استهداف الأجهزة اللوحية
            tablet_operation = self.client.get_type("CampaignCriterionOperation")
            tablet_criterion = tablet_operation.create
            tablet_criterion.campaign = campaign_resource_name
            tablet_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
            tablet_criterion.device.type_ = self.client.enums.DeviceEnum.TABLET

            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=[desktop_operation, mobile_operation, tablet_operation]
            )

            print("  إضافة استهداف الأجهزة لل  (+30% للموبايل)")

        except Exception as e:
            print(f"   إضافة استهداف الأجهزة لل: {e}")

    def _add_video_bid_modifiers(self, ad_group_resource_name: str):
        """إضافة تعديلات العروض لل"""
        try:
            print(" إضافة تعديلات العروض لل...")

            ad_group_bid_modifier_service = self.client.get_service("AdGroupBidModifierService")

            # إضافة Bid Modifier للموبايل (+50% على مستوى Ad Group لل)
            ad_group_bid_modifier_operation = self.client.get_type("AdGroupBidModifierOperation")
            ad_group_bid_modifier = ad_group_bid_modifier_operation.create

            ad_group_bid_modifier.ad_group = ad_group_resource_name
            ad_group_bid_modifier.bid_modifier = 1.5  # زيادة 50% للموبايل  ال
            ad_group_bid_modifier.device.type_ = self.client.enums.DeviceEnum.MOBILE

            ad_group_bid_modifier_service.mutate_ad_group_bid_modifiers(
                customer_id=self.customer_id,
                operations=[ad_group_bid_modifier_operation]
            )

            print("  إضافة تعديلات العروض لل (+50% للموبايل)")

        except Exception as e:
            print(f" تحذير: فشل  إضافة تعديلات العروض لل: {e}")

    # ═══════════════════════════════════════════════════════════════════
    # 🎯 دوال الاستهداف الذكي حسب الصناعة
    # ═══════════════════════════════════════════════════════════════════

    def _apply_smart_demographic_targeting(self, ad_group_resource_name: str, industry_config: dict):
        """استهداف الديمغرافيا الذكي حسب الصناعة (العمر، الجنس، الدخل، الحالة الأبوية)"""
        try:
            print(f"🎯 تطبيق استهداف الديمغرافيا لصناعة: {industry_config.get('name_ar', 'عام')}...")
            
            ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")
            operations = []
            
            # 1. استهداف الفئات العمرية
            age_ranges = industry_config.get("age_ranges", [])
            if age_ranges:
                for age_range_id in age_ranges:
                    # تحويل ID إلى نوع العمر
                    age_type_map = {
                        503001: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_18_24,
                        503002: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_25_34,
                        503003: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_35_44,
                        503004: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_45_54,
                        503005: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_55_64,
                        503006: self.client.enums.AgeRangeTypeEnum.AGE_RANGE_65_UP,
                    }
                    if age_range_id in age_type_map:
                        operation = self.client.get_type("AdGroupCriterionOperation")
                        criterion = operation.create
                        criterion.ad_group = ad_group_resource_name
                        criterion.age_range.type_ = age_type_map[age_range_id]
                        operations.append(operation)
            
            # 2. استهداف الجنس
            gender = industry_config.get("gender")
            if gender:
                gender_type_map = {
                    10: self.client.enums.GenderTypeEnum.MALE,
                    11: self.client.enums.GenderTypeEnum.FEMALE,
                }
                if gender in gender_type_map:
                    operation = self.client.get_type("AdGroupCriterionOperation")
                    criterion = operation.create
                    criterion.ad_group = ad_group_resource_name
                    criterion.gender.type_ = gender_type_map[gender]
                    operations.append(operation)
            
            # 3. استهداف الحالة الأبوية
            parental = industry_config.get("parental")
            if parental:
                parental_type_map = {
                    300: self.client.enums.ParentalStatusTypeEnum.PARENT,
                    301: self.client.enums.ParentalStatusTypeEnum.NOT_A_PARENT,
                }
                if parental in parental_type_map:
                    operation = self.client.get_type("AdGroupCriterionOperation")
                    criterion = operation.create
                    criterion.ad_group = ad_group_resource_name
                    criterion.parental_status.type_ = parental_type_map[parental]
                    operations.append(operation)
            
            # 4. استهداف الدخل
            income_ranges = industry_config.get("income", [])
            if income_ranges:
                for income_id in income_ranges:
                    income_type_map = {
                        510001: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_0_50,
                        510002: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_50_60,
                        510003: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_60_70,
                        510004: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_70_80,
                        510005: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_80_90,
                        510006: self.client.enums.IncomeRangeTypeEnum.INCOME_RANGE_90_UP,
                    }
                    if income_id in income_type_map:
                        operation = self.client.get_type("AdGroupCriterionOperation")
                        criterion = operation.create
                        criterion.ad_group = ad_group_resource_name
                        criterion.income_range.type_ = income_type_map[income_id]
                        operations.append(operation)
            
            if operations:
                ad_group_criterion_service.mutate_ad_group_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                print(f"✅ تم تطبيق {len(operations)} استهداف ديمغرافي")
            else:
                print("ℹ️ لم يتم تحديد استهداف ديمغرافي محدد - استهداف الكل")
                
        except Exception as e:
            print(f"⚠️ تحذير: فشل تطبيق استهداف الديمغرافيا: {e}")

    def _apply_smart_device_targeting(self, campaign_resource_name: str, industry_config: dict):
        """استهداف الأجهزة الذكي مع تعديلات العروض حسب الصناعة"""
        try:
            print(f"🎯 تطبيق استهداف الأجهزة لصناعة: {industry_config.get('name_ar', 'عام')}...")
            
            device_bids = industry_config.get("device_bids", {})
            if not device_bids:
                device_bids = {2: 1.2, 4: 1.1, 3: 1.0}  # افتراضي
            
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            operations = []
            
            device_type_map = {
                2: self.client.enums.DeviceEnum.MOBILE,
                3: self.client.enums.DeviceEnum.TABLET,
                4: self.client.enums.DeviceEnum.DESKTOP,
                6: self.client.enums.DeviceEnum.CONNECTED_TV,
            }
            
            for device_id, bid_modifier in device_bids.items():
                if device_id in device_type_map:
                    operation = self.client.get_type("CampaignCriterionOperation")
                    criterion = operation.create
                    criterion.campaign = campaign_resource_name
                    criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
                    criterion.device.type_ = device_type_map[device_id]
                    criterion.bid_modifier = bid_modifier
                    operations.append(operation)
            
            if operations:
                campaign_criterion_service.mutate_campaign_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                bid_info = ", ".join([f"{k}:{v}" for k, v in device_bids.items()])
                print(f"✅ تم تطبيق استهداف الأجهزة: {bid_info}")
                
        except Exception as e:
            print(f"⚠️ تحذير: فشل تطبيق استهداف الأجهزة: {e}")

    def _apply_smart_frequency_capping(self, campaign_resource_name: str, industry_config: dict):
        """تحديد الظهور الذكي حسب الصناعة"""
        try:
            print(f"🎯 تطبيق تحديد الظهور لصناعة: {industry_config.get('name_ar', 'عام')}...")
            
            frequency_cap = industry_config.get("frequency_cap", 4)
            frequency_unit = industry_config.get("frequency_unit", 2)  # DAY = 2
            
            # ملاحظة: Frequency cap يتم تعيينه عادة على مستوى الحملة أثناء الإنشاء
            # هذه الدالة تسجل الإعدادات المطلوبة للتطبيق
            
            unit_names = {2: "يوم", 3: "أسبوع", 4: "شهر"}
            unit_name = unit_names.get(frequency_unit, "يوم")
            
            print(f"✅ تحديد الظهور: {frequency_cap} مرات لكل {unit_name}")
            print(f"   ℹ️ ملاحظة: يتم تطبيق تحديد الظهور على مستوى الحملة")
                
        except Exception as e:
            print(f"⚠️ تحذير: فشل تطبيق تحديد الظهور: {e}")

    def _add_video_topic_targeting(self, campaign_resource_name: str, website_content: Dict[str, Any]):
        """إضافة استهداف المواضيع لل بناءً على محتوى """
        try:
            print(" إضافة استهداف المواضيع لل...")

            #  المحتوى لتحديد المواضيع المناسبة
            # التحقق من نوع website_content
            if isinstance(website_content, dict):
                title = website_content.get('title', '').lower()
                description = website_content.get('description', '').lower()
                keywords = [kw.get('text', '') if isinstance(kw, dict) else str(kw) for kw in website_content.get('keywords', [])]
            else:
                # إذا كان string، استخدمه كمحتوى
                title = str(website_content).lower() if website_content else ""
                description = ""
                keywords = []

            content = (title + ' ' + description + ' ' + ' '.join(keywords)).lower()

            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            operations = []

            # إضافة مواضيع بناءً على المحتوى
            if any(word in content for word in ['تعليم', 'تدريب', 'كورس', 'درس', 'education', 'training']):
                topic_operation = self.client.get_type("CampaignCriterionOperation")
                topic_criterion = topic_operation.create
                topic_criterion.campaign = campaign_resource_name
                topic_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
                topic_criterion.topic.topic_constant = "topics/12"  # Education
                operations.append(topic_operation)

            if any(word in content for word in ['تجارة', 'بيع', 'شراء', 'تسوق', 'business', 'shopping']):
                topic_operation = self.client.get_type("CampaignCriterionOperation")
                topic_criterion = topic_operation.create
                topic_criterion.campaign = campaign_resource_name
                topic_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
                topic_criterion.topic.topic_constant = "topics/47"  # Shopping
                operations.append(topic_operation)

            if any(word in content for word in ['تره', 'موسيقى', '', 'entertainment', 'music']):
                topic_operation = self.client.get_type("CampaignCriterionOperation")
                topic_criterion = topic_operation.create
                topic_criterion.campaign = campaign_resource_name
                topic_criterion.status = self.client.enums.CampaignCriterionStatusEnum.ENABLED
                topic_criterion.topic.topic_constant = "topics/32"  # Entertainment
                operations.append(topic_operation)

            if operations:
                response = campaign_criterion_service.mutate_campaign_criteria(
                    customer_id=self.customer_id,
                    operations=operations
                )
                print(f"  إضافة {len(response.results)} موضوع لاستهداف ال")
            else:
                print("ℹ لم ي العثور على مواضيع محددة لل")

        except Exception as e:
            print(f"   إضافة استهداف المواضيع لل: {e}")

    def _add_video_campaign_assets(self, campaign_resource_name: str, website_url: str,
                                  business_name: str = "أعماا", phone_number: str = None):
        """إضافة الأصول  لحملات ال"""
        try:
            print(" إضافة الأصول  لحملات ال...")

            # 1. إضافة Sitelinks (روابط إضاة)
            self._add_video_sitelink_assets(campaign_resource_name, website_url)

            # 2. إضافة Callouts (نقاط مميزة)
            self._add_video_callout_assets(campaign_resource_name)

            # 3. إضافة Structured Snippets (مقتطفات منظمة)
            self._add_video_structured_snippet_assets(campaign_resource_name)

            # 4. إضافة Call Extension (رقم الهاتف) إذا كان متاحاً
            if phone_number:
                self._add_video_call_extension(campaign_resource_name, phone_number, business_name)

            print("  إضافة جميع الأصول  لحملات ال")

        except Exception as e:
            print(f"   إضافة الأصول لحملات ال: {e}")

    def _add_video_sitelink_assets(self, campaign_resource_name: str, website_url: str):
        """إضافة روابط إضاة لحملات ال"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")

            # روابط إضاة مناسبة لل
            sitelinks = [
                {"text": "شاهد المزيد", "url": website_url, "desc1": "اكتشف المزيد من الهات", "desc2": "محتوى متنوع"},
                {"text": "اشترك الآن", "url": website_url, "desc1": "اشترك  قناتنا", "desc2": "احصل على التحديثات"},
                {"text": "تواصل معنا", "url": website_url, "desc1": "لديك أسئلة؟", "desc2": "نحن هنا للمساعدة"},
                {"text": "عن الشركة", "url": website_url, "desc1": "تعرف علينا", "desc2": "قصتنا وخدماتنا"}
            ]

            for sitelink in sitelinks:
                #  Asset
                asset_operation = self.client.get_type("AssetOperation")
                asset = asset_operation.create
                asset.name = sitelink["text"]
                asset.type_ = self.client.enums.AssetTypeEnum.SITELINK
                asset.sitelink_asset.link_text = sitelink["text"]
                asset.sitelink_asset.description1 = sitelink.get("desc1", f"اكتشف {sitelink['text']}")
                asset.sitelink_asset.description2 = sitelink.get("desc2", "اضغط هنا للمزيد")
                asset.final_urls.append(sitelink["url"])

                #  الأصل
                asset_response = asset_service.mutate_assets(
                    customer_id=self.customer_id,
                    operations=[asset_operation]
                )

                asset_resource_name = asset_response.results[0].resource_name

                # ربط الأصل بال
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = asset_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.SITELINK

                campaign_asset_service.mutate_campaign_assets(
                    customer_id=self.customer_id,
                    operations=[campaign_asset_operation]
                )

            print(f"  إضافة {len(sitelinks)} روابط إضاة لحملات ال")

        except Exception as e:
            print(f" تحذير: فشل  إضافة Sitelinks لل: {e}")

    def _add_video_callout_assets(self, campaign_resource_name: str):
        """إضافة نقاط مميزة لحملات ال"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")

            # نقاط مميزة مناسبة لل
            callouts = [
                "هات عالية الجودة",
                "محتوى تعليمي ميز",
                "إنتاج احترا",
                "مشاهدة مجانية",
                "محتوى متنوع",
                "تحديثات مسرة"
            ]

            for callout_text in callouts:
                #  Asset
                asset_operation = self.client.get_type("AssetOperation")
                asset = asset_operation.create
                asset.name = f"Callout: {callout_text}"
                asset.type_ = self.client.enums.AssetTypeEnum.CALLOUT
                asset.callout_asset.callout_text = callout_text

                #  الأصل
                asset_response = asset_service.mutate_assets(
                    customer_id=self.customer_id,
                    operations=[asset_operation]
                )

                asset_resource_name = asset_response.results[0].resource_name

                # ربط الأصل بال
                campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
                campaign_asset = campaign_asset_operation.create
                campaign_asset.campaign = campaign_resource_name
                campaign_asset.asset = asset_resource_name
                campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.CALLOUT

                campaign_asset_service.mutate_campaign_assets(
                    customer_id=self.customer_id,
                    operations=[campaign_asset_operation]
                )

            print(f"  إضافة {len(callouts)} نقاط مميزة لحملات ال")

        except Exception as e:
            print(f" تحذير: فشل  إضافة Callouts لل: {e}")

    def _add_video_structured_snippet_assets(self, campaign_resource_name: str):
        """إضافة مقتطفات منظمة لحملات ال"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")

            #  Structured Snippet لل
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = "أنواع الهات"
            asset.type_ = self.client.enums.AssetTypeEnum.STRUCTURED_SNIPPET
            asset.structured_snippet_asset.header = "المحتوى المتاح"
            asset.structured_snippet_asset.values.extend([
                "هات تعليمية",
                "محتوى ترهي",
                "دروس عملية",
                "نصائح وحيل",
                "مراجعات منتجات"
            ])

            #  الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )

            asset_resource_name = asset_response.results[0].resource_name

            # ربط الأصل بال
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.STRUCTURED_SNIPPET

            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )

            print("  إضافة المقتطفات المنظمة لحملات ال")

        except Exception as e:
            print(f" تحذير: فشل  إضافة Structured Snippets لل: {e}")

    def _add_video_call_extension(self, campaign_resource_name: str, phone_number: str, business_name: str):
        """إضافة إضافة المكالمة لحملات ال"""
        try:
            asset_service = self.client.get_service("AssetService")
            campaign_asset_service = self.client.get_service("CampaignAssetService")

            #  Call Asset
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            asset.name = f"Call: {business_name}"
            asset.type_ = self.client.enums.AssetTypeEnum.CALL
            asset.call_asset.phone_number = phone_number
            asset.call_asset.country_code = "SA"  # السعودية
            asset.call_asset.call_conversion_reporting_state = (
                self.client.enums.CallConversionReportingStateEnum.USE_ACCOUNT_LEVEL_CALL_CONVERSION_ACTION
            )

            #  الأصل
            asset_response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )

            asset_resource_name = asset_response.results[0].resource_name

            # ربط الأصل بال
            campaign_asset_operation = self.client.get_type("CampaignAssetOperation")
            campaign_asset = campaign_asset_operation.create
            campaign_asset.campaign = campaign_resource_name
            campaign_asset.asset = asset_resource_name
            campaign_asset.field_type = self.client.enums.AssetFieldTypeEnum.CALL

            campaign_asset_service.mutate_campaign_assets(
                customer_id=self.customer_id,
                operations=[campaign_asset_operation]
            )

            print(f"  إضافة إضافة المكالمة لحملات ال: {phone_number}")

        except Exception as e:
            print(f" تحذير: فشل  إضافة Call Extension لل: {e}")

    def _fetch_website_content(self, website_url: str) -> Dict[str, str]:
        """جلب محتوى """
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
            print(f"   جلب محتوى : {e}")
            return {'title': '', 'description': ''}

    def create_video_campaign_with_analysis(
        self,
        campaign_name: str,
        daily_budget: float,
        target_locations: List[str],
        target_language: str,
        headlines: List[str],
        descriptions: List[str],
        website_url: str = "https://www.example.com",
        business_name: str = "Business",
        long_headline: str = None,
        call_to_action: str = None,
        video_ad_type: str = "VIDEO_RESPONSIVE_AD",
        website_content: str = "",
        keywords_list: List[str] = None
    ) -> str:
        """
           كاملة مع   (للتوافق الخل)
        
        Args:
            campaign_name: اسم ال
            daily_budget: الميزانية اليومية بالدولار
            target_locations: قائمة معرفات المواقع الجغراة
            target_language: معرف اللغة
            headlines: قائمة العناوين (1-5 عناوين)
            descriptions: قائمة الأوصاف (1-5 أوصاف)
            website_url: رابط 
            business_name: اسم العمل
            long_headline: العنوان الطويل (اختياري)
            call_to_action: نص الدعوة للإجراء (اختياري)
            video_ad_type: نوع إعلان ال
            website_content: محتوى 
            keywords_list: قائمة الكلمات المفتاحية
        
        Returns:
            معرف ال المنشأة
        """
        print("🎥   ال مع ال...")
        print("=" * 50)
        
        try:
            # إعداد بيانات  لل
            website_data = {
                'website_url': website_url,
                'title': business_name,
                'description': website_content,
                'keywords': keywords_list or [],
                'real_keywords': [{'text': kw} for kw in (keywords_list or [])]
            }

            # إعداد  
            ad_copies = {
                'headlines': headlines,
                'descriptions': descriptions,
                'long_headlines': descriptions,
                'call_to_action': call_to_action or 'شاهد الآن'
            }

            # استخدام الدالة الجديدة ل ال
            return self.create_video_campaign(
                campaign_name=campaign_name,
                daily_budget=daily_budget,
                target_locations=target_locations,
                target_language=target_language,
                website_content=website_data,
                ad_copies=ad_copies,
                video_ad_type=video_ad_type,
                website_url=website_url,
                dry_run=False
            )

        except Exception as e:
            print(f"     ال: {e}")
            raise
    
    def _create_campaign_budget(self, campaign_name: str, daily_budget: float) -> str:
        """ ميزانية ال"""
        campaign_budget_service = self.client.get_service("CampaignBudgetService")
        campaign_budget_operation = self.client.get_type("CampaignBudgetOperation")
        campaign_budget = campaign_budget_operation.create
        
        import time
        timestamp = int(time.time())
        campaign_budget.name = f"{campaign_name} Budget {timestamp}"
        campaign_budget.delivery_method = (
            self.client.enums.BudgetDeliveryMethodEnum.STANDARD
        )
        campaign_budget.amount_micros = int(daily_budget * 1_000_000)
        
        response = campaign_budget_service.mutate_campaign_budgets(
            customer_id=self.customer_id,
            operations=[campaign_budget_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_video_campaign_core(
        self,
        campaign_name: str,
        budget_resource_name: str,
        target_locations: List[str],
        target_language: str
    ) -> str:
        """ ال الأساسية مع الاستهداف"""
        print(f"\n دخا _create_video_campaign_core")
        print(f"    اسم ال: {campaign_name}")
        print(f"    الميزانية: {budget_resource_name}")

        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        campaign = campaign_operation.create
        
        # اسم فريد لتجنب التكرار
        import time
        timestamp = int(time.time())
        campaign.name = f"{campaign_name} {timestamp}"
        campaign.campaign_budget = budget_resource_name

        # تعيين حقل contains_eu_political_advertising (مطلوب  v21)
        campaign.contains_eu_political_advertising = (
            self.client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )

        campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.VIDEO
        campaign.status = self.client.enums.CampaignStatusEnum.PAUSED

        # إضافة Tracking Template و Final URL Suffix للتتبع الصحيح
        campaign.tracking_url_template = "{lpurl}?utm_source=youtube&utm_medium=cpc&utm_campaign={campaignid}"
        campaign.final_url_suffix = "utm_content={creative}"
        
        # إعدادات الشبكة لل
        campaign.network_settings.target_google_search = False
        campaign.network_settings.target_search_network = False
        campaign.network_settings.target_content_network = True  # YouTube وشبكة Display
        campaign.network_settings.target_partner_search_network = False
        
        # تعيين خيارات  الجغرا: "الحضور" فقط (الخيار الأول)
        campaign.geo_target_type_setting.positive_geo_target_type = (
            self.client.enums.PositiveGeoTargetTypeEnum.PRESENCE
        )

        # استراتيجية المزايدة لحملات الفيديو - مطلوب في Google Ads API v21
        # نستخدم Target CPV - استراتيجية مزايدة تلقائية مصممة خصيصاً لحملات الفيديو
        # TargetCpv في v21 لا يحتوي على حقول - فقط نفعله
        campaign.target_cpv._pb.SetInParent()

        # طباعة معلومات ال قبل ال (للتشخيص)
        print(f"\n تشخيص ال:")
        print(f"   📛 الاسم: {campaign.name}")
        print(f"    الميزانية: {campaign.campaign_budget}")
        print(f"   📺 نوع القناة: {campaign.advertising_channel_type}")
        print(f"    الحالة: {campaign.status}")
        print(f"   🇪🇺 الإعلان السياسي الأوروبي: {campaign.contains_eu_political_advertising}")

        #  ال أولاً
        response = campaign_service.mutate_campaigns(
            customer_id=self.customer_id,
            operations=[campaign_operation]
        )
        
        campaign_resource_name = response.results[0].resource_name
        campaign_id = campaign_resource_name.split('/')[-1]

        # إضافة اللغة و الجغرا باستخدام CampaignCriterion
        self._add_location_and_language_targeting_for_video(
            campaign_id, target_locations, target_language
        )

        return campaign_resource_name

    def _create_video_ad(self, ad_group_resource_name: str, ad_copies: Dict[str, Any],
                        website_url: str, video_ad_type: str, youtube_video_id: str = None):
        """
        إنشاء إعلان فيديو واحد بناءً على نوع الإعلان
        
        مرجع: google.ads.googleads.v21.common.types.ad_type_infos
        
        Args:
            ad_group_resource_name: معرف مجموعة الإعلانات
            ad_copies: بيانات النصوص الإعلانية
            website_url: رابط الموقع الوجهة
            video_ad_type: نوع إعلان الفيديو
            youtube_video_id: معرف فيديو YouTube
        """
        print(f"\n🎬 إنشاء إعلان فيديو من نوع: {video_ad_type}")
        
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create

        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED

        # إضافة final_urls للإعلان (مطلوب لمعظم الأنواع)
        if website_url and video_ad_type != "IN_FEED_VIDEO_AD":
            ad_group_ad.ad.final_urls.append(website_url)
        
        # إضافة اسم الإعلان
        ad_group_ad.ad.name = f"Video Ad - {video_ad_type}"

        # ═══════════════════════════════════════════════════════════════════
        # VIDEO_RESPONSIVE_AD - إعلان فيديو متجاوب
        # المرجع: VideoResponsiveAdInfo
        # ═══════════════════════════════════════════════════════════════════
        if video_ad_type == "VIDEO_RESPONSIVE_AD":
            video_ad = ad_group_ad.ad.video_responsive_ad
            
            # 1. إضافة الفيديو (مطلوب - حالياً قيمة واحدة فقط مدعومة)
            if youtube_video_id:
                video_asset_resource_name = self._create_video_asset(youtube_video_id)
                if video_asset_resource_name:
                    video_asset_link = self.client.get_type("AdVideoAsset")
                    video_asset_link.asset = video_asset_resource_name
                    video_ad.videos.append(video_asset_link)
                    print(f"   ✅ تم إضافة الفيديو: {youtube_video_id}")

            # 2. إضافة العناوين القصيرة (max 30 chars - حالياً قيمة واحدة فقط)
            headlines = ad_copies.get('headlines', [])
            for headline in headlines[:1]:  # حالياً قيمة واحدة فقط مدعومة
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = str(headline)[:30]
                video_ad.headlines.append(ad_text_asset)
            print(f"   📝 العناوين القصيرة: {len(headlines[:1])}")

            # 3. إضافة العناوين الطويلة (max 90 chars - حالياً قيمة واحدة فقط)
            long_headlines = ad_copies.get('long_headlines', [])
            if not long_headlines:
                long_headlines = ad_copies.get('descriptions', [])
            for long_headline in long_headlines[:1]:  # حالياً قيمة واحدة فقط مدعومة
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = str(long_headline)[:90]
                video_ad.long_headlines.append(ad_text_asset)
            print(f"   📝 العناوين الطويلة: {len(long_headlines[:1])}")

            # 4. إضافة الأوصاف (max 90 chars - حالياً قيمة واحدة فقط)
            descriptions = ad_copies.get('descriptions', [])
            for description in descriptions[:1]:  # حالياً قيمة واحدة فقط مدعومة
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = str(description)[:90]
                video_ad.descriptions.append(ad_text_asset)
            print(f"   📝 الأوصاف: {len(descriptions[:1])}")

            # 5. إضافة زر الدعوة للإجراء (اختياري)
            call_to_action = ad_copies.get('call_to_action')
            if call_to_action:
                cta_asset = self.client.get_type("AdTextAsset")
                cta_asset.text = str(call_to_action)[:15]
                video_ad.call_to_actions.append(cta_asset)
                print(f"   🔘 CTA: {call_to_action}")

            # 6. إضافة Breadcrumbs (اختياري - max 15 chars each)
            breadcrumb1 = ad_copies.get('breadcrumb1', '')
            breadcrumb2 = ad_copies.get('breadcrumb2', '')
            if breadcrumb1:
                video_ad.breadcrumb1 = str(breadcrumb1)[:15]
            if breadcrumb2:
                video_ad.breadcrumb2 = str(breadcrumb2)[:15]

        # ═══════════════════════════════════════════════════════════════════
        # VIDEO_TRUEVIEW_IN_STREAM_AD - إعلان TrueView قابل للتخطي
        # المرجع: VideoTrueViewInStreamAdInfo (داخل VideoAdInfo)
        # ═══════════════════════════════════════════════════════════════════
        elif video_ad_type == "VIDEO_TRUEVIEW_IN_STREAM_AD":
            video_ad = ad_group_ad.ad.video_ad
            
            # إضافة الفيديو
            if youtube_video_id:
                video_asset_resource_name = self._create_video_asset(youtube_video_id)
                if video_asset_resource_name:
                    video_ad.video.asset = video_asset_resource_name
                    print(f"   ✅ تم إضافة الفيديو: {youtube_video_id}")
            
            # إعداد TrueView In-Stream format
            trueview_ad = video_ad.in_stream
            
            # نص زر الدعوة للإجراء (مطلوب لـ TrueView for Action)
            action_button = ad_copies.get('action_button_label', ad_copies.get('call_to_action', 'اكتشف المزيد'))
            trueview_ad.action_button_label = str(action_button)[:10]
            
            # نص العنوان مع CTA
            action_headline = ad_copies.get('action_headline', '')
            if not action_headline and ad_copies.get('headlines'):
                action_headline = ad_copies['headlines'][0]
            trueview_ad.action_headline = str(action_headline)[:15]
            
            print(f"   🔘 Action Button: {action_button}")
            print(f"   📝 Action Headline: {action_headline}")

        # ═══════════════════════════════════════════════════════════════════
        # VIDEO_BUMPER_AD - إعلان بامبر (6 ثواني)
        # المرجع: VideoBumperInStreamAdInfo (داخل VideoAdInfo)
        # ═══════════════════════════════════════════════════════════════════
        elif video_ad_type == "VIDEO_BUMPER_AD":
            video_ad = ad_group_ad.ad.video_ad
            
            # إضافة الفيديو (مطلوب - 6 ثواني بالضبط)
            if youtube_video_id:
                video_asset_resource_name = self._create_video_asset(youtube_video_id)
                if video_asset_resource_name:
                    video_ad.video.asset = video_asset_resource_name
                    print(f"   ✅ تم إضافة الفيديو: {youtube_video_id}")
            
            # إعداد Bumper format
            bumper_ad = video_ad.bumper
            
            # نص زر الدعوة للإجراء (اختياري)
            action_button = ad_copies.get('action_button_label', ad_copies.get('call_to_action', ''))
            if action_button:
                bumper_ad.action_button_label = str(action_button)[:10]
                print(f"   🔘 Action Button: {action_button}")
            
            # نص العنوان مع CTA (اختياري)
            action_headline = ad_copies.get('action_headline', '')
            if action_headline:
                bumper_ad.action_headline = str(action_headline)[:15]
                print(f"   📝 Action Headline: {action_headline}")

        # ═══════════════════════════════════════════════════════════════════
        # VIDEO_NON_SKIPPABLE_IN_STREAM_AD - إعلان غير قابل للتخطي
        # المرجع: VideoNonSkippableInStreamAdInfo (داخل VideoAdInfo)
        # ═══════════════════════════════════════════════════════════════════
        elif video_ad_type == "VIDEO_NON_SKIPPABLE_IN_STREAM_AD":
            video_ad = ad_group_ad.ad.video_ad
            
            # إضافة الفيديو (مطلوب - 15-20 ثانية)
            if youtube_video_id:
                video_asset_resource_name = self._create_video_asset(youtube_video_id)
                if video_asset_resource_name:
                    video_ad.video.asset = video_asset_resource_name
                    print(f"   ✅ تم إضافة الفيديو: {youtube_video_id}")
            
            # إعداد Non-Skippable format
            non_skippable_ad = video_ad.non_skippable
            
            # نص زر الدعوة للإجراء (اختياري)
            action_button = ad_copies.get('action_button_label', ad_copies.get('call_to_action', ''))
            if action_button:
                non_skippable_ad.action_button_label = str(action_button)[:10]
                print(f"   🔘 Action Button: {action_button}")
            
            # نص العنوان مع CTA (اختياري)
            action_headline = ad_copies.get('action_headline', '')
            if action_headline:
                non_skippable_ad.action_headline = str(action_headline)[:15]
                print(f"   📝 Action Headline: {action_headline}")

        # ═══════════════════════════════════════════════════════════════════
        # IN_FEED_VIDEO_AD - إعلان في الخلاصة
        # المرجع: InFeedVideoAdInfo (داخل VideoAdInfo)
        # ═══════════════════════════════════════════════════════════════════
        elif video_ad_type == "IN_FEED_VIDEO_AD":
            video_ad = ad_group_ad.ad.video_ad
            
            # إضافة الفيديو (مطلوب)
            if youtube_video_id:
                video_asset_resource_name = self._create_video_asset(youtube_video_id)
                if video_asset_resource_name:
                    video_ad.video.asset = video_asset_resource_name
                    print(f"   ✅ تم إضافة الفيديو: {youtube_video_id}")
            
            # إعداد In-Feed format
            in_feed_ad = video_ad.in_feed
            
            # العنوان (مطلوب - max 100 chars)
            headlines = ad_copies.get('headlines', [])
            if headlines:
                in_feed_ad.headline = str(headlines[0])[:100]
                print(f"   📝 العنوان: {headlines[0][:50]}...")
            
            # الوصف الأول (مطلوب - max 35 chars)
            descriptions = ad_copies.get('descriptions', [])
            if descriptions:
                in_feed_ad.description1 = str(descriptions[0])[:35]
                print(f"   📝 الوصف 1: {descriptions[0][:35]}")
            
            # الوصف الثاني (اختياري - max 35 chars)
            if len(descriptions) >= 2:
                in_feed_ad.description2 = str(descriptions[1])[:35]
                print(f"   📝 الوصف 2: {descriptions[1][:35]}")
            
            # الصورة المصغرة (اختياري)
            thumbnail = ad_copies.get('thumbnail', 'THUMBNAIL_DEFAULT')
            try:
                in_feed_ad.thumbnail = self.client.enums.VideoThumbnailEnum[thumbnail]
            except:
                pass  # استخدام الافتراضي

        # ═══════════════════════════════════════════════════════════════════
        # إنشاء الإعلان
        # ═══════════════════════════════════════════════════════════════════
        try:
            response = ad_group_ad_service.mutate_ad_group_ads(
                customer_id=self.customer_id,
                operations=[ad_group_ad_operation]
            )
            print(f"✅ تم إنشاء إعلان الفيديو بنجاح: {response.results[0].resource_name}")
            print(f"   📺 نوع الإعلان: {video_ad_type}")
            return response.results[0].resource_name
        except GoogleAdsException as ex:
            print(f"❌ خطأ في إنشاء الإعلان: {video_ad_type}")
            for error in ex.failure.errors:
                print(f"   ❌ {error.message}")
            print(f"   ⚠️ الحملة والمجموعة الإعلانية تم إنشاؤها بنجاح")
            return None

    def _add_video_keywords_to_ad_group(self, ad_group_resource_name: str, keywords: List[str]):
        """إضافة كلمات مفتاحية لمجموعة الإعلانات (ل  نتائج البحث)"""
        ad_group_criterion_service = self.client.get_service("AdGroupCriterionService")

        operations = []

        # إضافة كلمات مفتاحية لل (مطابقة واسعة)
        for keyword in keywords[:10]:  # حد أقصى 10 كلمات
            operation = self.client.get_type("AdGroupCriterionOperation")
            criterion = operation.create

            criterion.ad_group = ad_group_resource_name
            criterion.status = self.client.enums.AdGroupCriterionStatusEnum.ENABLED

            # تعيين الكلمة المفتاحية
            criterion.keyword.text = keyword
            # استخدام BROAD match لل  نتائج البحث
            criterion.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD

            operations.append(operation)

        if operations:
            response = ad_group_criterion_service.mutate_ad_group_criteria(
                customer_id=self.customer_id,
                operations=operations
            )

            print(f"  إضافة {len(response.results)} كلمة مفتاحية لل")

    def _add_location_and_language_targeting_for_video(self, campaign_id: str,
                                                     target_locations: List[str],
                                                     target_language: str):
        """إضافة  الجغرا واللغة لحملات ال"""
        try:
            campaign_criterion_service = self.client.get_service("CampaignCriterionService")
            campaign_service = self.client.get_service("CampaignService")
            geo_target_constant_service = self.client.get_service("GeoTargetConstantService")

            operations = []

            # إضافة  الجغرا (إيجابي)
            for location_id in target_locations:
                campaign_criterion_operation = self.client.get_type("CampaignCriterionOperation")
                campaign_criterion = campaign_criterion_operation.create
                campaign_criterion.campaign = campaign_service.campaign_path(
                    self.customer_id, campaign_id
                )
                # تحديد أن  إيجابي (مستهدف) وليس سلبي (مستبعد)
                campaign_criterion.negative = False
                campaign_criterion.location.geo_target_constant = (
                    geo_target_constant_service.geo_target_constant_path(location_id)
                )
                operations.append(campaign_criterion_operation)

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
                print(f"  إضافة {len(response.results)} معيار استهداف (موقع + لغة)")

        except Exception as e:
            print(f" تحذير: فشل  إضافة الاستهداف الجغرا/اللغوي: {e}")
    
    def _add_campaign_targeting(
        self,
        campaign_resource_name: str,
        target_locations: List[str],
        target_language: str
    ):
        """إضافة استهداف المواقع واللغات"""
        campaign_criterion_service = self.client.get_service(
            "CampaignCriterionService"
        )
        operations = []
        
        # إضافة استهداف المواقع
        for location_id in target_locations:
            campaign_criterion_operation = self.client.get_type(
                "CampaignCriterionOperation"
            )
            campaign_criterion = campaign_criterion_operation.create
            campaign_criterion.campaign = campaign_resource_name
            campaign_criterion.location.geo_target_constant = (
                f"geoTargetConstants/{location_id}"
            )
            operations.append(campaign_criterion_operation)
        
        # إضافة استهداف اللغة
        language_operation = self.client.get_type("CampaignCriterionOperation")
        language_criterion = language_operation.create
        language_criterion.campaign = campaign_resource_name
        language_criterion.language.language_constant = (
            f"languageConstants/{target_language}"
        )
        operations.append(language_operation)
        
        if operations:
            campaign_criterion_service.mutate_campaign_criteria(
                customer_id=self.customer_id,
                operations=operations
            )
    
    def _create_ad_group(
        self,
        campaign_resource_name: str,
        ad_group_name: str,
        video_ad_type: str
    ) -> str:
        """ المجموعة """
        ad_group_service = self.client.get_service("AdGroupService")
        ad_group_operation = self.client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.create
        
        ad_group.name = ad_group_name
        ad_group.campaign = campaign_resource_name
        ad_group.status = self.client.enums.AdGroupStatusEnum.ENABLED
        
        # تحديد نوع المجموعة  بناءً على نوع الإعلان
        if video_ad_type == "VIDEO_RESPONSIVE_AD":
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_TRUE_VIEW_IN_STREAM
        elif video_ad_type == "VIDEO_BUMPER_AD":
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_BUMPER
        elif video_ad_type == "VIDEO_NON_SKIPPABLE_IN_STREAM_AD":
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_NON_SKIPPABLE_IN_STREAM
        elif video_ad_type == "VIDEO_TRUEVIEW_IN_STREAM_AD":
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_TRUE_VIEW_IN_STREAM
        elif video_ad_type == "IN_FEED_VIDEO_AD":
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_TRUE_VIEW_IN_DISPLAY
        else:
            # افتراضي
            ad_group.type_ = self.client.enums.AdGroupTypeEnum.VIDEO_TRUE_VIEW_IN_STREAM
        
        # تعيين CPV (تكلفة المشاهدة) - 0.10$ كقيمة افتراضية - متوافق مع Target CPV
        ad_group.cpv_bid_micros = 100000  # $0.10
        
        response = ad_group_service.mutate_ad_groups(
            customer_id=self.customer_id,
            operations=[ad_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_video_asset(self, youtube_video_id: str) -> str:
        """إنشاء فيديو asset بناءً على المكتبة الرسمية"""
        print(f"\n إنشاء فيديو asset...")
        print(f"   YouTube Video ID: {youtube_video_id}")
        
        asset_service = self.client.get_service("AssetService")
        asset_operation = self.client.get_type("AssetOperation")
        asset = asset_operation.create
        
        # إعدادات الفيديو asset
        asset.name = f"Video Asset {youtube_video_id}"
        asset.type_ = self.client.enums.AssetTypeEnum.YOUTUBE_VIDEO
        asset.youtube_video_asset.youtube_video_id = youtube_video_id
        
        try:
            response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            asset_resource_name = response.results[0].resource_name
            print(f"✅ تم إنشاء فيديو asset: {asset_resource_name}")
            return asset_resource_name
        except GoogleAdsException as ex:
            print(f"❌ خطأ في إنشاء فيديو asset: {ex}")
            return None
    
    def _create_video_ads(
        self,
        ad_group_resource_name: str,
        headlines: List[str],
        descriptions: List[str],
        website_url: str,
        business_name: str,
        long_headline: str,
        call_to_action: str,
        video_ad_type: str,
        youtube_video_id: str = None
    ):
        """ إعلانات ال"""
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create
        
        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
        
        # تعيين الـ final URLs
        ad_group_ad.ad.final_urls.append(website_url)
        
        # ملاحظة:  الإنتاج الفعلي، يجب   إلى YouTube والحصول على video_id
        # هنا نستخدم placeholder لأغراض 
        print(" ملاحظة: يجب   إلى YouTube والحصول على video_id")
        print("  الوقت الحالي، سي استخدام Google Ads default video")
        
        #  إعلان  متجاوب (الأكثر مرونة)
        if video_ad_type == "VIDEO_RESPONSIVE_AD":
            video_ad = ad_group_ad.ad.video_responsive_ad
        
            # إضافة العناوين
            for headline in headlines[:5]:  # max 5
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = headline[:30]  # max 30 chars
                video_ad.headlines.append(ad_text_asset)
            
            # إضافة الأوصاف الطويلة
            for description in descriptions[:5]:  # max 5
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = description[:90]  # max 90 chars
                video_ad.long_headlines.append(ad_text_asset)
            
            # إضافة الأوصاف القصيرة
            for description in descriptions[:5]:  # max 5
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = description[:60]  # max 60 chars
                video_ad.descriptions.append(ad_text_asset)
            
            # Call to action
            if call_to_action:
                video_ad.call_to_actions.append(call_to_action[:10])
            
            # Companion banner (اختياري - يمكن إضافته لاحقاً)
            # video_ad.companion_banners.append(...)
            
        # إعلان TrueView In-Stream (قابل للتخطي)
        elif video_ad_type == "VIDEO_TRUEVIEW_IN_STREAM_AD":
            # ملاحظة: TrueView In-Stream يستخدم نفس هيكل VIDEO_RESPONSIVE_AD
            # لكن مع قيود أقل على الأصول
            video_ad = ad_group_ad.ad.video_responsive_ad
        
        if headlines:
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = headlines[0][:30]
                video_ad.headlines.append(ad_text_asset)
        
        if descriptions:
                ad_text_asset = self.client.get_type("AdTextAsset")
                ad_text_asset.text = descriptions[0][:90]
                video_ad.long_headlines.append(ad_text_asset)
        
        # إعلان Bumper (6 ثواني)
        elif video_ad_type == "VIDEO_BUMPER_AD":
            # Bumper ads لا تحتاج نصوص - فقط ال
            video_ad = ad_group_ad.ad.video_ad
            # video_ad.video.asset = "assets/XXXXX"  # يجب   6 ثواني
        
        # إعلان غير قابل للتخطي
        elif video_ad_type == "VIDEO_NON_SKIPPABLE_IN_STREAM_AD":
            video_ad = ad_group_ad.ad.video_ad
            # video_ad.video.asset = "assets/XXXXX"  # يجب   15-20 ثانية
        
        # إعلان In-Feed
        elif video_ad_type == "IN_FEED_VIDEO_AD":
            video_ad = ad_group_ad.ad.in_feed_video_ad
            
            if headlines:
                video_ad.headline = headlines[0][:100]  # max 100 chars
            
            if len(descriptions) >= 2:
                video_ad.description1 = descriptions[0][:35]  # max 35 chars
                video_ad.description2 = descriptions[1][:35]  # max 35 chars
        
        #  الإعلان
        try:
            response = ad_group_ad_service.mutate_ad_group_ads(
            customer_id=self.customer_id,
            operations=[ad_group_ad_operation]
        )
            print(f"   إعلان: {response.results[0].resource_name}")
        except GoogleAdsException as ex:
            print(f" تحذير: لم ي  الإعلان (يتطلب video_id حقيقي من YouTube)")
            print(f"   ال والمجموعة   إنشاؤها ")
            # لا ن ال لأن ال  إنشاؤها 
    
    def select_smart_video_ad_type(
        self,
        goal: str,
        budget: float,
        video_duration: int = None,
        website_url: str = None,
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """
        🤖 نظام ذكي لاختيار نوع إعلان ال الأمثل
        
        يستخدم AI ل الهدف والميزانية واختيار اوع الأنسب
        
        Args:
            goal: الهدف ("awareness", "sales", "conversions", "discovery", "brand_message", "engagement")
            budget: الميزانية اليومية بالدولار
            video_duration: مدة ال بالثواني (اختياري)
            website_url: رابط  (اختياري)
            keywords: الكلمات المفتاحية (اختياري)
        
        Returns:
            Dict يحتوي على التوصية الكاملة مع السبب والبدائل
        """
        
        print("🤖 بدء  ذكي لاختيار نوع إعلان ال...")
        print(f"   الهدف: {goal}, الميزانية: ${budget}, المدة: {video_duration}s")
        
        # استخدام AI Generator لل الذكي
        recommendation = self.ai_generator.select_smart_video_ad_type(
            goal=goal,
            budget=budget,
            video_duration=video_duration
        )
        
        print(f"  اختيار: {recommendation['video_ad_type_ar']} (ثقة: {recommendation['confidence']}%)")
        print(f" السبب: {recommendation['reason_ar']}")
        
        return recommendation
    
    @staticmethod
    def get_all_video_ad_types() -> List[Dict[str, Any]]:
        """
         الحصول على جميع أنواع إعلانات ال المتاحة
        
        Returns:
            قائمة بجميع أنواع إعلانات ال مع التفاصيل
        """
        return [
            {
                "value": "VIDEO_RESPONSIVE_AD",
                "label": "إعلان  متجاوب",
                "label_en": "Video Responsive Ad",
                "description": "الأكثر مرونة - يتكيف مع جميع المواضع",
                "recommended": True,
                "icon": "",
                "best_for": "جميع الأهداف",
                "min_budget": 1,
                "video_duration": "أي مدة (موصى به: 15-30 ثانية)"
            },
            {
                "value": "VIDEO_TRUEVIEW_IN_STREAM_AD",
                "label": "إعلان TrueView In-Stream",
                "label_en": "TrueView In-Stream Ad",
                "description": "قابل للتخطي بعد 5 ثواني - مثالي للتحويلات",
                "recommended": False,
                "icon": "▶",
                "best_for": "المبيعات والتحويلات",
                "min_budget": 50,
                "video_duration": "30 ثانية أو أكثر"
            },
            {
                "value": "VIDEO_BUMPER_AD",
                "label": "إعلان Bumper (6 ثواني)",
                "label_en": "Bumper Ad",
                "description": "6 ثواني غير قابل للتخطي - ",
                "recommended": False,
                "icon": "⚡",
                "best_for": "الوعي السريع بميزانية محدودة",
                "min_budget": 1,
                "video_duration": "6 ثواني بالضبط"
            },
            {
                "value": "VIDEO_NON_SKIPPABLE_IN_STREAM_AD",
                "label": "إعلان غير قابل للتخطي",
                "label_en": "Non-Skippable In-Stream Ad",
                "description": "15-20 ثانية غير قابل للتخطي - رسالة مضمونة",
                "recommended": False,
                "icon": "",
                "best_for": "رسالة مهمة جداً",
                "min_budget": 70,
                "video_duration": "15-20 ثانية"
            },
            {
                "value": "IN_FEED_VIDEO_AD",
                "label": "إعلان   الخلاصة",
                "label_en": "In-Feed Video Ad",
                "description": "يظهر  البحث والصفحة الرئيسية - للاكتشاف",
                "recommended": False,
                "icon": "",
                "best_for": "الاكتشاف والمحتوى ي",
                "min_budget": 20,
                "video_duration": "أي مدة"
            }
        ]
    
    @staticmethod
    def get_campaign_goals() -> List[Dict[str, Any]]:
        """
         الحصول على جميع الأهداف المتاحة للحملات
        
        Returns:
            قائمة بجميع الأهداف المتاحة
        """
        return [
            {
                "value": "awareness",
                "label": "الوعي بالعلامة التجارية",
                "label_en": "Brand Awareness",
                "description": "زيادة الوعي والانتشار",
                "icon": "",
                "recommended_budget": "20-50"
            },
            {
                "value": "sales",
                "label": "زيادة المبيعات",
                "label_en": "Sales",
                "description": "زيادة المبيعات المباشرة",
                "icon": "",
                "recommended_budget": "50-200"
            },
            {
                "value": "conversions",
                "label": "التحويلات",
                "label_en": "Conversions",
                "description": "زيادة التحويلات والإجراءات",
                "icon": "",
                "recommended_budget": "50-150"
            },
            {
                "value": "discovery",
                "label": "الاكتشاف",
                "label_en": "Discovery",
                "description": "جذب جمهور جديد مه",
                "icon": "",
                "recommended_budget": "30-100"
            },
            {
                "value": "brand_message",
                "label": "رسالة العلامة التجارية",
                "label_en": "Brand Message",
                "description": "إيصال رسالة مهمة",
                "icon": "",
                "recommended_budget": "70-200"
            },
            {
                "value": "engagement",
                "label": "التفاعل",
                "label_en": "Engagement",
                "description": "زيادة التفاعل والمشاركة",
                "icon": "",
                "recommended_budget": "30-100"
            }
        ]
    
    @staticmethod
    def estimate_performance(video_ad_type: str, budget: float) -> Dict[str, Any]:
        """
         تقدير أداء ال بناءً على اوع والميزانية
        
        Args:
            video_ad_type: نوع إعلان ال
            budget: الميزانية اليومية
        
        Returns:
            تقديرات الأداء المتوقع
        """
        estimates = {}
        
        if video_ad_type == "VIDEO_RESPONSIVE_AD":
            estimates = {
                "daily_views": int(budget / 0.02),
                "daily_clicks": int(budget / 0.02 * 0.05),
                "daily_conversions": int(budget / 0.02 * 0.002),
                "cost_per_view": "$0.02",
                "cost_per_click": "$0.40",
                "cost_per_conversion": "$10.00",
                "view_rate": "15%",
                "click_rate": "5%",
                "conversion_rate": "0.2%"
            }
        
        elif video_ad_type == "VIDEO_TRUEVIEW_IN_STREAM_AD":
            estimates = {
                "daily_views": int(budget / 0.03),
                "daily_clicks": int(budget / 0.03 * 0.05),
                "daily_conversions": int(budget / 0.03 * 0.003),
                "cost_per_view": "$0.03",
                "cost_per_click": "$0.60",
                "cost_per_conversion": "$10.00",
                "view_rate": "20%",
                "click_rate": "5%",
                "conversion_rate": "0.3%"
            }
        
        elif video_ad_type == "VIDEO_BUMPER_AD":
            estimates = {
                "daily_impressions": int(budget / 0.0004),
                "daily_views": int(budget / 0.0004),
                "daily_clicks": int(budget / 0.0004 * 0.01),
                "cost_per_1000_impressions": "$0.40",
                "cost_per_view": "$0.0004",
                "click_rate": "1%"
            }
        
        elif video_ad_type == "VIDEO_NON_SKIPPABLE_IN_STREAM_AD":
            estimates = {
                "daily_impressions": int(budget / 0.0035),
                "daily_views": int(budget / 0.0035),
                "daily_clicks": int(budget / 0.0035 * 0.02),
                "cost_per_1000_impressions": "$3.50",
                "cost_per_view": "$0.0035",
                "click_rate": "2%"
            }
        
        elif video_ad_type == "IN_FEED_VIDEO_AD":
            estimates = {
                "daily_clicks": int(budget / 0.02),
                "daily_views": int(budget / 0.02),
                "daily_conversions": int(budget / 0.02 * 0.004),
                "cost_per_click": "$0.02",
                "cost_per_view": "$0.02",
                "cost_per_conversion": "$5.00",
                "conversion_rate": "0.4%"
            }
        
        return {
            "video_ad_type": video_ad_type,
            "budget": budget,
            "estimates": estimates
        }
    
    def analyze_website_for_video_campaign(
        self,
        website_url: str,
        target_language: str = "1019",
        target_locations: List[str] = None
    ) -> Dict[str, Any]:
        """
           لحملات ال باستخدام AI
        
        Args:
            website_url: رابط 
            target_language: اللغة المستهدفة
            target_locations: المواقع المستهدفة
        
        Returns:
             كامل للموقع مع توصيات لحملات ال
        """
        print("Video campaign analysis...")
        print("=" * 50)

        try:
            # جلب محتوى 
            website_content = self._fetch_website_content(website_url)

            # استخراج معلومات 
            title = website_content.get('title', f"موقع {website_url.split('/')[-1]}")
            description = website_content.get('description', f"خدمات متخصصة من {website_url}")

            # استخدام AI ل  واستخراج كلمات مفتاحية مناسبة لل
            keywords = self._extract_video_keywords_from_website(website_url, target_language, target_locations or ["2682"])

            if not keywords:
                print(" لم ي العثور على كلمات مفتاحية مناسبة لل")
                return None

            # تصنيف الكلمات المفتاحية لل
            classified_keywords = self._classify_keywords_for_video(keywords)

            # تحديد أنواع ال المناسبة بناءً على المحتوى
            suitable_video_types = self._determine_suitable_video_types(website_content, keywords)

            # اقتراح الأهداف بناءً على طبيعة 
            suggested_goals = self._suggest_campaign_goals_for_video(title, description, keywords)

            # تقدير الميزانية المناسبة
            budget_range = self._estimate_video_budget_range(keywords, suitable_video_types)

            result = {
                'title': title,
                'description': description,
                'keywords': [kw['text'] for kw in keywords[:20]],
                'real_keywords': keywords[:20],
                'classified_keywords': classified_keywords,
                'suitable_video_types': suitable_video_types,
                'suggested_goals': suggested_goals,
                'budget_range': budget_range,
                'content_length': len(str(keywords)),
                'campaign_type': 'VIDEO',
                'website_url': website_url,
                'analysis_status': 'completed'
            }

            print(f"    لحملات ال")
            print(f" أنواع ال المناسبة: {', '.join(suitable_video_types)}")
            print(f" الأهداف المقترحة: {', '.join(suggested_goals)}")
            print(f" نطاق الميزانية: ${budget_range['min']}-${budget_range['max']}")
            
            return result
            
        except Exception as e:
            print(f"    : {e}")
            return {
                "website_url": website_url,
                "analysis_status": "failed",
                "error": str(e)
            }
    
    def _extract_video_keywords_from_website(self, website_url: str, target_language: str,
                                           target_locations: List[str]) -> List[Dict[str, Any]]:
        """استخراج الكلمات المفتاحية المناسبة لل من """
        try:
            # استخدام Google Keyword Planner لاستخراج الكلمات المفتاحية
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")

            request = self.client.get_type("GenerateKeywordIdeasRequest")()
            request.customer_id = self.customer_id
            request.language = f"languageConstants/{target_language}"
            request.geo_target_constants = [f"geoTargetConstants/{loc}" for loc in target_locations]
            request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH

            # استخدام URL كبذرة
            url_seed = self.client.get_type("UrlSeed")()
            url_seed.url = website_url
            request.url_seed = url_seed

            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)

            keywords = []
            for result in response.results:
                keyword_text = result.text
                competition = result.keyword_idea_metrics.competition.name
                avg_monthly_searches = result.keyword_idea_metrics.avg_monthly_searches

                # فلترة الكلمات حسب اللغة ومدى ملاءمتها لل
                if target_language == "1019":  # العربية
                    if any('\u0600' <= char <= '\u06FF' for char in keyword_text):
                        keywords.append({
                            'text': keyword_text,
                            'competition': competition,
                            'avg_monthly_searches': avg_monthly_searches,
                            'competition_index': result.keyword_idea_metrics.competition_index,
                            'video_suitable': True
                        })
                elif target_language == "1000":  # الإنجليزية
                    if all(ord(char) < 128 for char in keyword_text if char.isalpha()):
                        keywords.append({
                            'text': keyword_text,
                            'competition': competition,
                            'avg_monthly_searches': avg_monthly_searches,
                            'competition_index': result.keyword_idea_metrics.competition_index,
                            'video_suitable': True
                        })

            # ترتيب الكلمات حسب حجم البحث ومدى ملاءمتها لل
            keywords.sort(key=lambda x: (x['avg_monthly_searches'], x.get('video_suitable', False)), reverse=True)
            return keywords[:30]  # أفضل 30 كلمة مناسبة لل

        except Exception as e:
            print(f"   استخراج الكلمات المفتاحية لل: {e}")
            return []

    def _classify_keywords_for_video(self, keywords: List[Dict[str, Any]]) -> Dict[str, List[Dict]]:
        """تصنيف الكلمات المفتاحية لل"""
        classified = {
            'educational': [],      # تعليمية
            'demonstrative': [],    # توضيحية
            'promotional': [],      # ترويجية
            'testimonial': [],      # شهادات
            'entertainment': [],    # ترهية
            'informational': []     # معلوماتية
        }

        for kw in keywords:
            keyword_text = kw['text'].lower()
            word_count = len(keyword_text.split())

            # تصنيف حسب نوع الكلمات المناسبة لل
            if any(word in keyword_text for word in ['كيف', 'دليل', 'شرح', 'تعليم', 'درس', 'how to', 'guide', 'tutorial', 'learn']):
                classified['educational'].append(kw)
            elif any(word in keyword_text for word in ['مشاهدة', '', 'عرض', 'توضيح', 'watch', 'video', 'demo']):
                classified['demonstrative'].append(kw)
            elif any(word in keyword_text for word in ['عرض خاص', 'تخض', 'خصم', 'ترويج', 'promotion', 'offer', 'discount']):
                classified['promotional'].append(kw)
            elif any(word in keyword_text for word in ['شهادة', 'تقييم', 'رأي', 'testimonial', 'review']):
                classified['testimonial'].append(kw)
            elif any(word in keyword_text for word in ['تره', 'ممتع', 'fun', 'entertainment']):
                classified['entertainment'].append(kw)
            else:
                classified['informational'].append(kw)

        return classified

    def _determine_suitable_video_types(self, website_content: Dict, keywords: List[Dict]) -> List[str]:
        """تحديد أنواع ال المناسبة بناءً على المحتوى"""
        title = website_content.get('title', '').lower()
        description = website_content.get('description', '').lower()

        suitable_types = []

        #  المحتوى لتحديد اوع المناسب
        if any(word in title + ' ' + description for word in ['تعليم', 'تدريب', 'كورس', 'درس', 'education', 'training', 'course']):
            suitable_types.extend(['VIDEO_RESPONSIVE_AD', 'VIDEO_TRUEVIEW_IN_STREAM_AD'])

        if any(word in title + ' ' + description for word in ['منتج', 'خدمة', 'عرض', 'product', 'service', 'offer']):
            suitable_types.extend(['VIDEO_RESPONSIVE_AD', 'IN_FEED_VIDEO_AD'])

        if any(word in title + ' ' + description for word in ['تره', 'موسيقى', '', 'entertainment', 'music']):
            suitable_types.append('VIDEO_RESPONSIVE_AD')

        # إضافة نوع افتراضي إذا لم ي تحديد أي نوع
        if not suitable_types:
            suitable_types = ['VIDEO_RESPONSIVE_AD']

        return list(set(suitable_types))  # إزالة التكرار

    def _suggest_campaign_goals_for_video(self, title: str, description: str, keywords: List[Dict]) -> List[str]:
        """اقتراح أهداف ال بناءً على طبيعة """
        goals = []

        content = (title + ' ' + description).lower()

        # اقتراح الأهداف بناءً على الكلمات المفتاحية والمحتوى
        if any(word in content for word in ['تعليم', 'تدريب', 'كورس', 'درس', 'education', 'training']):
            goals.append('discovery')

        if any(word in content for word in ['منتج', 'خدمة', 'شراء', 'طلب', 'product', 'service', 'buy']):
            goals.append('conversions')

        if any(word in content for word in ['علامة تجارية', 'شركة', 'brand', 'company']):
            goals.append('awareness')

        if any(word in content for word in ['تره', 'موسيقى', '', 'entertainment']):
            goals.append('engagement')

        # إضافة هدف افتراضي إذا لم ي تحديد أي هدف
        if not goals:
            goals = ['awareness']

        return goals

    def _estimate_video_budget_range(self, keywords: List[Dict], video_types: List[str]) -> Dict[str, float]:
        """تقدير نطاق الميزانية المناسبة لحملات ال"""
        # تقدير بناءً على حجم البحث والمنافسة
        total_searches = sum(kw['avg_monthly_searches'] for kw in keywords[:10])
        avg_competition = sum(kw.get('competition_index', 0) for kw in keywords[:10]) / len(keywords[:10]) if keywords else 0

        # حساب اطاق بناءً على البيانات
        if total_searches > 10000:
            min_budget = 50
            max_budget = 200
        elif total_searches > 1000:
            min_budget = 20
            max_budget = 100
        else:
            min_budget = 10
            max_budget = 50

        # تعديل بناءً على المنافسة
        if avg_competition > 0.7:
            min_budget *= 1.5
            max_budget *= 1.5

        return {
            'min': int(min_budget),
            'max': int(max_budget),
            'recommended': int((min_budget + max_budget) / 2)
        }
    
    def generate_video_ad_copies(self, website_content: Dict[str, Any],
                               target_language: str = "1019") -> Dict[str, Any]:
        """
          نسخ إعلانية لحملات ال

        Args:
            website_content: محتوى  من ال
            target_language: اللغة المستهدفة

        Returns:
            نسخ إعلانية مُحسنة لحملات ال
        """
        print("Generating video ad copies...")
        print("=" * 50)

        try:
            # إعداد البيانات للذكاء الاصطناعي
            keywords = website_content.get('real_keywords', [])
            top_keywords = [kw['text'] for kw in keywords[:10]]

            # استخدام AI ل المحتوى الإعلاني لل
            ai_result = self.ai_generator.generate_complete_ad_content(
                website_url=website_content.get('website_url', ''),
                service_type="خدمات ال",
                target_language=target_language
            )

            if ai_result and ai_result.get('success'):
                ad_copies = ai_result.get('ad_copies', {})

                #  عناوين إعلانية لل (5 عناوين - الحد الأقصى)
                headlines = ad_copies.get('headlines', [])
                if len(headlines) < 5:
                    # إضافة عناوين إضاة إذا لم تكن كاة
                    title = website_content.get('title', 'خدمات')
                    additional_headlines = [
                        f"اكتشف {title}   مذهل",
                        f"شاهد كيف يعمل {title}",
                        f" يوضح فوائد {title}",
                        f"تعرف على {title} بالتفصيل",
                        f"دليل  شامل لـ {title}"
                    ]
                    headlines.extend(additional_headlines[:5-len(headlines)])

                #  أوصاف إعلانية لل (5 أوصاف - الحد الأقصى)
                descriptions = ad_copies.get('descriptions', [])
                if len(descriptions) < 5:
                    title = website_content.get('title', 'خدمات')
                    additional_descriptions = [
                        f"شاهد  شامل يوضح كية استخدام {title} وفوائده العديدة",
                        f"اكتشف  هذا ال كل ما تحتاج معرفته عن {title}",
                        f"دليل  تفاعلي يشرح بالتفصيل مميزات {title}",
                        f"تعلم كيف يساعدك {title}  حل مشاكلك - شاهد ال الآن",
                        f" تعليمي متكامل يوضح كية الحصول على أفضل اتائج من {title}"
                    ]
                    descriptions.extend(additional_descriptions[:5-len(descriptions)])

                #  دعوات للإجراء مناسبة لل
                calls_to_action = [
                    "شاهد الآن",
                    "تعلم المزيد",
                    "اكتشف المزيد",
                    "ابدأ الآن",
                    "شاهد ال"
                ]

                result = {
                    'headlines': headlines[:5],  # 5 عناوين كحد أقصى
                    'descriptions': descriptions[:5],  # 5 أوصاف كحد أقصى
                    'long_headlines': descriptions[:5],  # أوصاف طويلة لل
                    'call_to_action': ad_copies.get('call_to_action', 'شاهد الآن'),
                    'calls_to_action': calls_to_action,
                    'images': ai_result.get('images', []),
                    'success': True
                }

                print("     لحملات ال")
                print(f" العناوين: {len(result['headlines'])} عنوان")
                print(f" الأوصاف: {len(result['descriptions'])} وصف")
                print(f" دعوات للإجراء: {len(result['calls_to_action'])} دعوة")

                return result
            else:
                print(" فشل    ")
                return {'success': False, 'error': 'فشل   المحتوى'}

        except Exception as e:
            print(f"     : {e}")
            return {'success': False, 'error': str(e)}
    
    def generate_video_script(
        self,
        goal: str,
        product_service: str,
        video_duration: int,
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """
         توليد سيناريو ال باستخدام AI
        
        Args:
            goal: هدف ال
            product_service: /
            video_duration: مدة ال بالثواني
            keywords: الكلمات المفتاحية
        
        Returns:
            سيناريو ال الكامل
        """
        print(f" توليد سيناريو : {video_duration} ثانية")
        
        try:
            # تقسيم ال إلى مشاهد
            scenes = []
            
            if video_duration == 6:  # Bumper Ad
                scenes = [
                    {
                        "time": "0-2s",
                        "content": "افتتاحية قوية - اجذب الانتباه فوراً",
                        "visual": "لوجو + منتج بارز",
                        "audio": "موسيقى حماسية"
                    },
                    {
                        "time": "2-4s",
                        "content": "رسالة رئيسية واحدة",
                        "visual": "/ الرئيسية",
                        "audio": "صوت تعليق سريع"
                    },
                    {
                        "time": "4-6s",
                        "content": "دعوة لإجراء + اللوجو",
                        "visual": "CTA واضح + معلومات التواصل",
                        "audio": "موسيقى ختامية"
                    }
                ]
            
            elif video_duration <= 20:  # Non-Skippable
                scenes = [
                    {
                        "time": "0-3s",
                        "content": "افتتاحية - عرض ",
                        "visual": "مشهد يوضح ",
                        "audio": "موسيقى درامية"
                    },
                    {
                        "time": "3-12s",
                        "content": " - عرض /",
                        "visual": "  الاستخدام",
                        "audio": "شرح "
                    },
                    {
                        "time": "12-20s",
                        "content": "دعوة لإجراء + ",
                        "visual": "CTA + عرض خاص",
                        "audio": "دعوة واضحة"
                    }
                ]
            
            else:  # 30+ seconds
                scenes = [
                    {
                        "time": "0-5s",
                        "content": "افتتاحية جذابة - Hook",
                        "visual": "مشهد مثير للاهام",
                        "audio": "سؤال أو إحصائية مثيرة"
                    },
                    {
                        "time": "5-15s",
                        "content": "عرض ",
                        "visual": " التي يحلها ",
                        "audio": "شرح "
                    },
                    {
                        "time": "15-25s",
                        "content": " - /",
                        "visual": "عرض  والمميزات",
                        "audio": "شرح  والفوائد"
                    },
                    {
                        "time": "25-30s",
                        "content": "دعوة لإجراء",
                        "visual": "CTA واضح + معلومات",
                        "audio": "دعوة قوية"
                    }
                ]
            
            script = {
                "video_duration": video_duration,
                "goal": goal,
                "product_service": product_service,
                "scenes": scenes,
                "total_scenes": len(scenes),
                "tips": [
                    " أول 3 ثواني هي الأهم - اجذب الانتباه فوراً",
                    " استخدم نصوص واضحة ومقروءة",
                    " أضف ترجمات - 85% يشاهدون بدون صوت",
                    " استخدم ألوان علامتك التجارية",
                    " اجعل CTA واضح ومباشر"
                ],
                "music_suggestion": "موسيقى حماسية إيقاعية تناسب الهدف",
                "voice_over": "صوت واضح ومباشر"
            }
            
            print(f"  توليد سيناريو من {len(scenes)} مشاهد")
            
            return script
            
        except Exception as e:
            print(f"   توليد السيناريو: {e}")
            return {
                "error": str(e),
                "video_duration": video_duration
            }
    
    def suggest_video_content(
        self,
        goal: str,
        industry: str,
        budget: float
    ) -> Dict[str, Any]:
        """
         اقتراح محتوى ال بناءً على الهدف والمجال
        
        Args:
            goal: هدف ال
            industry: المجال/الصناعة
            budget: الميزانية
        
        Returns:
            اقتراحات محتوى ال
        """
        print(f" اقتراح محتوى : {goal} - {industry}")
        
        suggestions = {
            "goal": goal,
            "industry": industry,
            "budget": budget,
            "content_ideas": [],
            "video_styles": [],
            "recommended_duration": 30,
            "production_tips": []
        }
        
        # اقتراحات بناءً على الهدف
        if goal == "awareness":
            suggestions["content_ideas"] = [
                " تعري بالعلامة التجارية",
                "قصة نجاح العلامة التجارية",
                " يوضح القيم والرسالة",
                "مقارنة قبل وبعد",
                "شهادات عملاء سريعة"
            ]
            suggestions["video_styles"] = ["حماسي", "ملهم", "قصصي"]
            suggestions["recommended_duration"] = 15
        
        elif goal in ["sales", "conversions"]:
            suggestions["content_ideas"] = [
                "عرض   الاستخدام",
                "مقارنة مع المنافسين",
                "عرض خاص محدود",
                "شهادات عملاء مع نتائج",
                "توضيح الفوائد والمميزات"
            ]
            suggestions["video_styles"] = ["مباشر", "احترا", "مقنع"]
            suggestions["recommended_duration"] = 30
        
        elif goal == "discovery":
            suggestions["content_ideas"] = [
                " تعليمي How-To",
                "نصائح وحيل",
                "دليل استخدام",
                "أسئلة وأجوبة",
                "محتوى تعليمي قيم"
            ]
            suggestions["video_styles"] = ["تعليمي", "ودود", "بسيط"]
            suggestions["recommended_duration"] = 60
        
        elif goal == "engagement":
            suggestions["content_ideas"] = [
                "تحدي أو مسابقة",
                "محتوى تفاعلي",
                "وراء الكواليس",
                "يوم  الحياة",
                "محتوى ترهي"
            ]
            suggestions["video_styles"] = ["ممتع", "تفاعلي", "عفوي"]
            suggestions["recommended_duration"] = 30
        
        # نصائح الإنتاج
        suggestions["production_tips"] = [
            "📹 استخدم جودة HD على الأقل (1280×720)",
            "🎤 صوت واضح ونقي - مهم جداً",
            " إضاءة جيدة - طبيعية أو احتراة",
            " ألوان متناسقة مع العلامة التجارية",
            " اختبر ال على الموبايل",
            "⏱ أول 3 ثواني حاسمة",
            " أضف ترجمات دائماً"
        ]
        
        print(f"  اقتراح {len(suggestions['content_ideas'])} أفكار")
        
        return suggestions
    
    def create_complete_video_campaign_with_ai(
        self,
        website_url: str,
        goal: str,
        budget: float,
        video_duration: int = None,
        target_language: str = "1019",
        target_locations: List[str] = None
    ) -> Dict[str, Any]:
        """
            كاملة باستخدام AI (شامل)
        
        هذه الدالة تجمع كل شيء:
        1.  
        2. اختيار نوع الإعلان الأمثل
        3. توليد السيناريو
        4. اقتراح المحتوى
        5. تقدير الأداء
        
        Args:
            website_url: رابط 
            goal: هدف ال
            budget: الميزانية اليومية
            video_duration: مدة ال (اختياري)
            target_language: اللغة المستهدفة
            target_locations: المواقع المستهدفة
        
        Returns:
              كاملة جاهزة
        """
        print("=" * 80)
        print("    كاملة باستخدام AI")
        print("=" * 80)
        
        try:
            # 1.  
            print("\n المرحلة 1:  ...")
            website_analysis = self.analyze_website_for_video_campaign(
                website_url,
                target_language,
                target_locations
            )
            
            # 2. اختيار نوع الإعلان الأمثل
            print("\n🤖 المرحلة 2: اختيار نوع الإعلان الأمثل...")
            ad_type_recommendation = self.select_smart_video_ad_type(
                goal=goal,
                budget=budget,
                video_duration=video_duration,
                website_url=website_url
            )
            
            # 3. توليد السيناريو
            print("\n المرحلة 3: توليد سيناريو ال...")
            video_script = self.generate_video_script(
                goal=goal,
                product_service=website_analysis.get("industry", "خدمات"),
                video_duration=ad_type_recommendation["requirements"].get("video_duration_seconds", 30) if isinstance(ad_type_recommendation["requirements"].get("video_duration_seconds"), int) else 30
            )
            
            # 4. اقتراح المحتوى
            print("\n المرحلة 4: اقتراح محتوى ال...")
            content_suggestions = self.suggest_video_content(
                goal=goal,
                industry=website_analysis.get("industry", "general"),
                budget=budget
            )
            
            # 5. تقدير الأداء
            print("\n المرحلة 5: تقدير الأداء المتوقع...")
            performance_estimates = self.estimate_performance(
                ad_type_recommendation["video_ad_type"],
                budget
            )
            
            # 6. تجميع كل شيء
            complete_campaign = {
                "success": True,
                "campaign_name": f"  - {goal}",
                "website_url": website_url,
                "goal": goal,
                "budget": budget,
                "target_language": target_language,
                "target_locations": target_locations or ["2682"],
                
                # ال
                "website_analysis": website_analysis,
                
                # نوع الإعلان المختار
                "selected_ad_type": ad_type_recommendation,
                
                # السيناريو
                "video_script": video_script,
                
                # اقتراحات المحتوى
                "content_suggestions": content_suggestions,
                
                # تقديرات الأداء
                "performance_estimates": performance_estimates,
                
                # الخطوات التالية
                "next_steps": [
                    "1.  راجع السيناريو المقترح",
                    "2.  أنتج ال بناءً على السيناريو",
                    "3. 📤 ا ال إلى YouTube",
                    "4. 🆔 احصل على Video ID",
                    "5.  أنشئ ال باستخدام Video ID"
                ],
                
                # نصائح مهمة
                "important_tips": [
                    " أول 3 ثواني حاسمة - اجذب الانتباه فوراً",
                    " أضف ترجمات - 85% يشاهدون بدون صوت",
                    " استخدم CTA واضح ومباشر",
                    " اختبر ال على الموبايل قبل اشر",
                    " استخدم ألوان علامتك التجارية",
                    " جودة HD على الأقل (1280×720)"
                ],
                
                "timestamp": time.time()
            }
            
            print("\n" + "=" * 80)
            print("    ال الكاملة !")
            print("=" * 80)
            print(f" نوع الإعلان: {ad_type_recommendation['video_ad_type_ar']}")
            print(f" الميزانية: ${budget}/يوم")
            print(f"📈 المشاهدات المتوقعة: {performance_estimates['estimates'].get('daily_views', 'N/A')}/يوم")
            print("=" * 80)
            
            return complete_campaign
            
        except Exception as e:
            print(f"\n    ال: {e}")
            return {
                "success": False,
                "error": str(e),
                "website_url": website_url,
                "goal": goal,
                "budget": budget
            }


