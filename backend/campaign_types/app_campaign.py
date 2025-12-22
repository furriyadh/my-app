# -*- coding: utf-8 -*-
"""
منشئ حملات التطبيقات (App Campaigns)
=====================================

هذا الملف يحتوي على جميع الوظائف المطلوبة لإنشاء حملات التطبيقات
باستخدام المكتبة الرسمية لـ Google Ads API v21.

المرجع الرسمي:
google-ads-official/examples/advanced_operations/add_app_campaign.py

الميزات:
- إنشاء حملة تطبيق كاملة (App Campaign)
- استهداف المواقع واللغات
- إنشاء مجموعة إعلانية
- إنشاء إعلانات تطبيق
- دعم Google Play Store و Apple App Store
"""

import uuid
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


class AppCampaignCreator:
    """منشئ حملات التطبيقات"""
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        """
        تهيئة منشئ حملات التطبيقات
        
        Args:
            client: عميل Google Ads API
            customer_id: معرف العميل
        """
        self.client = client
        self.customer_id = customer_id
    
    def create_app_campaign(
        self,
        campaign_name: str,
        daily_budget: float,
        app_id: str,
        app_store: str,
        target_locations: List[str],
        target_language: str,
        headlines: List[str],
        descriptions: List[str],
        website_url: str = "https://www.example.com"
    ) -> str:
        """
        إنشاء حملة تطبيق كاملة (حسب المكتبة الرسمية)
        
        Args:
            campaign_name: اسم الحملة
            daily_budget: الميزانية اليومية بالدولار
            app_id: معرف التطبيق (com.example.app أو ID من App Store)
            app_store: نوع المتجر ('GOOGLE_PLAY' أو 'APPLE_APP_STORE')
            target_locations: قائمة معرفات المواقع الجغرافية
            target_language: معرف اللغة
            headlines: قائمة العناوين (2-5 عناوين)
            descriptions: قائمة الأوصاف (2-5 أوصاف)
            website_url: رابط الموقع
        
        Returns:
            معرف الحملة المنشأة
        """
        print("🚀 إنشاء حملة التطبيق...")
        print("=" * 50)
        
        try:
            # 1. إنشاء الميزانية
            budget_resource_name = self._create_campaign_budget(campaign_name, daily_budget)
            print(f"✅ تم إنشاء الميزانية: {budget_resource_name}")
            
            # 2. إنشاء الحملة
            campaign_resource_name = self._create_app_campaign_core(
                campaign_name, 
                budget_resource_name,
                app_id,
                app_store
            )
            print(f"✅ تم إنشاء الحملة: {campaign_resource_name}")
            
            # 3. إضافة استهداف المواقع واللغات
            self._add_campaign_targeting(
                campaign_resource_name,
                target_locations,
                target_language
            )
            print(f"✅ تم إضافة الاستهداف")
            
            # 4. إنشاء مجموعة إعلانية
            ad_group_resource_name = self._create_ad_group(
                campaign_resource_name,
                campaign_name
            )
            print(f"✅ تم إنشاء المجموعة الإعلانية: {ad_group_resource_name}")
            
            # 5. إنشاء إعلان التطبيق
            self._create_app_ad(
                ad_group_resource_name,
                headlines,
                descriptions
            )
            print(f"✅ تم إنشاء الإعلان")
            
            campaign_id = campaign_resource_name.split('/')[-1]
            print("\n" + "=" * 50)
            print(f"🎉 تم إنشاء حملة التطبيق بنجاح!")
            print(f"📊 معرف الحملة: {campaign_id}")
            print(f"📱 التطبيق: {app_id}")
            print(f"🏪 المتجر: {app_store}")
            print("=" * 50)
            
            return campaign_id
            
        except GoogleAdsException as ex:
            print(f"\n❌ خطأ من Google Ads API:")
            print(f"   Request ID: {ex.request_id}")
            print(f"   Error: {ex.error.code().name}")
            for error in ex.failure.errors:
                print(f"   - {error.message}")
            raise
        except Exception as e:
            print(f"\n❌ خطأ غير متوقع: {e}")
            raise
    
    def _create_campaign_budget(self, campaign_name: str, daily_budget: float) -> str:
        """إنشاء ميزانية الحملة"""
        campaign_budget_service = self.client.get_service("CampaignBudgetService")
        campaign_budget_operation = self.client.get_type("CampaignBudgetOperation")
        
        campaign_budget = campaign_budget_operation.create
        timestamp = int(time.time())
        campaign_budget.name = f"{campaign_name} Budget #{timestamp}"
        campaign_budget.amount_micros = int(round(daily_budget * 100) * 10000)  # Round to cents
        campaign_budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
        # App campaigns cannot use shared budgets
        campaign_budget.explicitly_shared = False
        
        response = campaign_budget_service.mutate_campaign_budgets(
            customer_id=self.customer_id,
            operations=[campaign_budget_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_app_campaign_core(
        self,
        campaign_name: str,
        budget_resource_name: str,
        app_id: str,
        app_store: str
    ) -> str:
        """إنشاء الحملة الأساسية"""
        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        
        campaign = campaign_operation.create
        timestamp = int(time.time())
        short_id = uuid.uuid4().hex[:4].upper()
        campaign.name = f"{campaign_name} #{short_id}"
        campaign.campaign_budget = budget_resource_name
        
        # Set campaign status to ENABLED (مفعلة)
        campaign.status = self.client.enums.CampaignStatusEnum.ENABLED
        
        # App campaigns have MULTI_CHANNEL type
        campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.MULTI_CHANNEL
        campaign.advertising_channel_sub_type = self.client.enums.AdvertisingChannelSubTypeEnum.APP_CAMPAIGN
        
        # Set bidding strategy: Target CPA ($0.03 per install for all categories)
        campaign.target_cpa.target_cpa_micros = 30000  # $0.03 per install
        
        # Set geo targeting type: PRESENCE (customers in your included locations)
        # Options: PRESENCE_OR_INTEREST, PRESENCE, SEARCH_INTEREST
        campaign.geo_target_type_setting.positive_geo_target_type = (
            self.client.enums.PositiveGeoTargetTypeEnum.PRESENCE_OR_INTEREST
        )
        campaign.geo_target_type_setting.negative_geo_target_type = (
            self.client.enums.NegativeGeoTargetTypeEnum.PRESENCE_OR_INTEREST
        )
        
        # Configure App Campaign Settings
        campaign.app_campaign_setting.app_id = app_id
        
        # Set app store
        if app_store.upper() == 'GOOGLE_PLAY':
            campaign.app_campaign_setting.app_store = self.client.enums.AppCampaignAppStoreEnum.GOOGLE_APP_STORE
        elif app_store.upper() == 'APPLE_APP_STORE':
            campaign.app_campaign_setting.app_store = self.client.enums.AppCampaignAppStoreEnum.APPLE_APP_STORE
        else:
            campaign.app_campaign_setting.app_store = self.client.enums.AppCampaignAppStoreEnum.GOOGLE_APP_STORE
        
        # Set bidding goal: Optimize for installs
        campaign.app_campaign_setting.bidding_strategy_goal_type = (
            self.client.enums.AppCampaignBiddingStrategyGoalTypeEnum.OPTIMIZE_INSTALLS_TARGET_INSTALL_COST
        )
        
        # EU Political Advertising
        campaign.contains_eu_political_advertising = (
            self.client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )
        
        # Set start date (tomorrow) - no end date = runs indefinitely
        campaign.start_date = (datetime.now() + timedelta(1)).strftime("%Y%m%d")
        # end_date not set = غير محدد (runs indefinitely)
        
        response = campaign_service.mutate_campaigns(
            customer_id=self.customer_id,
            operations=[campaign_operation]
        )
        
        return response.results[0].resource_name
    
    def _add_campaign_targeting(
        self,
        campaign_resource_name: str,
        target_locations: List[str],
        target_language: str
    ):
        """إضافة استهداف المواقع واللغات"""
        campaign_criterion_service = self.client.get_service("CampaignCriterionService")
        geo_target_constant_service = self.client.get_service("GeoTargetConstantService")
        googleads_service = self.client.get_service("GoogleAdsService")
        
        operations = []
        
        # Add location targeting
        for location_id in target_locations:
            operation = self.client.get_type("CampaignCriterionOperation")
            criterion = operation.create
            criterion.campaign = campaign_resource_name
            criterion.location.geo_target_constant = (
                geo_target_constant_service.geo_target_constant_path(location_id)
            )
            criterion.negative = False
            operations.append(operation)
        
        # Add language targeting
        operation = self.client.get_type("CampaignCriterionOperation")
        criterion = operation.create
        criterion.campaign = campaign_resource_name
        criterion.language.language_constant = googleads_service.language_constant_path(target_language)
        operations.append(operation)
        
        campaign_criterion_service.mutate_campaign_criteria(
            customer_id=self.customer_id,
            operations=operations
        )
    
    def _create_ad_group(self, campaign_resource_name: str, campaign_name: str) -> str:
        """إنشاء مجموعة إعلانية"""
        ad_group_service = self.client.get_service("AdGroupService")
        ad_group_operation = self.client.get_type("AdGroupOperation")
        
        ad_group = ad_group_operation.create
        # Smart naming: use campaign name + short unique ID
        short_id = uuid.uuid4().hex[:4].upper()
        ad_group.name = f"{campaign_name} - Ad Group #{short_id}"
        ad_group.status = self.client.enums.AdGroupStatusEnum.ENABLED
        ad_group.campaign = campaign_resource_name
        
        # Note: Ad group type must not be set for app campaigns
        # Bid settings cannot be overridden at ad group level
        
        response = ad_group_service.mutate_ad_groups(
            customer_id=self.customer_id,
            operations=[ad_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_app_ad(
        self,
        ad_group_resource_name: str,
        headlines: List[str],
        descriptions: List[str]
    ):
        """إنشاء إعلان تطبيق"""
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        
        ad_group_ad = ad_group_ad_operation.create
        ad_group_ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
        ad_group_ad.ad_group = ad_group_resource_name
        
        # Add headlines (2-5 required)
        for headline in headlines[:5]:  # Max 5
            ad_text_asset = self.client.get_type("AdTextAsset")
            ad_text_asset.text = headline[:30]  # Max 30 chars
            ad_group_ad.ad.app_ad.headlines.append(ad_text_asset)
        
        # Add descriptions (2-5 required)
        for description in descriptions[:5]:  # Max 5
            ad_text_asset = self.client.get_type("AdTextAsset")
            ad_text_asset.text = description[:90]  # Max 90 chars
            ad_group_ad.ad.app_ad.descriptions.append(ad_text_asset)
        
        # Optional: Add images (up to 20)
        # ad_group_ad.ad.app_ad.images.extend([image_resource_names])
        
        ad_group_ad_service.mutate_ad_group_ads(
            customer_id=self.customer_id,
            operations=[ad_group_ad_operation]
        )
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات التطبيقات"""
        return {
            "campaign_type": "APP",
            "name": "حملات التطبيقات",
            "description": "حملات للترويج لتطبيقات Android و iOS",
            "app_requirements": {
                "required": True,
                "app_id": "معرف التطبيق (com.example.app)",
                "app_store": "GOOGLE_PLAY أو APPLE_APP_STORE"
            },
            "text_requirements": {
                "headlines": {
                    "required": True,
                    "min_count": 2,
                    "max_count": 5,
                    "max_length": 30
                },
                "descriptions": {
                    "required": True,
                    "min_count": 2,
                    "max_count": 5,
                    "max_length": 90
                }
            },
            "image_requirements": {
                "required": False,
                "max_count": 20,
                "formats": ["JPEG", "PNG"],
                "description": "صور اختيارية للإعلان"
            },
            "bidding_strategy": {
                "type": "TARGET_CPA",
                "goal": "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST",
                "description": "استهداف تكلفة التثبيت"
            },
            "targeting": {
                "location_required": True,
                "language_required": True,
                "audience": "اختياري"
            }
        }

