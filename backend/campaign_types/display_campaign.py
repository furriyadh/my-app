# -*- coding: utf-8 -*-
"""
منشئ حملات العرض (Display Campaigns)
====================================

هذا الملف يحتوي على جميع الوظائف المطلوبة لإنشاء حملات العرض
باستخدام المكتبة الرسمية لـ Google Ads API v21.

المرجع الرسمي:
google-ads-official/examples/remarketing/add_merchant_center_dynamic_remarketing_campaign.py

الميزات:
- إنشاء حملة عرض كاملة (Display Campaign)
- إنشاء Responsive Display Ads
- إضافة Image Assets (Marketing + Square + Logo)
- استهداف المواقع واللغات
- استهداف الجمهور (User Lists)
- استراتيجية المزايدة Manual CPC
"""

import uuid
import time
import requests
from typing import Dict, List, Any, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


class DisplayCampaignCreator:
    """منشئ حملات العرض"""
    
    def __init__(self, client: GoogleAdsClient, customer_id: str):
        """
        تهيئة منشئ حملات العرض
        
        Args:
            client: عميل Google Ads API
            customer_id: معرف العميل
        """
        self.client = client
        self.customer_id = customer_id
    
    def create_display_campaign(
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
        main_color: str = "#0000ff",
        accent_color: str = "#ffff00",
        website_content: str = "",
        keywords_list: List[str] = None
    ) -> str:
        """
        إنشاء حملة عرض كاملة (حسب المكتبة الرسمية)
        
        Args:
            campaign_name: اسم الحملة
            daily_budget: الميزانية اليومية بالدولار
            target_locations: قائمة معرفات المواقع الجغرافية
            target_language: معرف اللغة
            headlines: قائمة العناوين (1-5 عناوين)
            descriptions: قائمة الأوصاف (1-5 أوصاف)
            website_url: رابط الموقع
            business_name: اسم العمل
            long_headline: العنوان الطويل
            call_to_action: نص الدعوة للإجراء
            main_color: اللون الرئيسي (hex)
            accent_color: اللون الفرعي (hex)
        
        Returns:
            معرف الحملة المنشأة
        """
        print("🎨 إنشاء حملة العرض (Display Campaign)...")
        print("=" * 50)
        
        try:
            # 1. إنشاء الميزانية
            budget_resource_name = self._create_campaign_budget(campaign_name, daily_budget)
            print(f"✅ تم إنشاء الميزانية: {budget_resource_name}")
            
            # 2. إنشاء الحملة
            campaign_resource_name = self._create_display_campaign_core(
                campaign_name,
                budget_resource_name
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
            
            # 5. إنشاء وإضافة الصور (مع محتوى الموقع والكلمات المفتاحية)
            # استخراج الكلمات المفتاحية من محتوى الموقع إذا كان متاحاً
            keywords_list = []
            if website_content and "keywords" in str(website_content):
                # محاولة استخراج الكلمات المفتاحية من محتوى الموقع
                try:
                    import re
                    keywords_match = re.findall(r'([\u0600-\u06FF\s]+(?:خزانات|عزل|مياه|خدمات)[\u0600-\u06FF\s]*)', website_content)
                    if keywords_match:
                        keywords_list = keywords_match[:10]
                except:
                    pass
            
            marketing_image_resource = self._upload_marketing_images(
                business_name=business_name,
                website_content=website_content,
                keywords=keywords_list
            )
            print(f"✅ تم تحميل الصور التسويقية")
            
            # 6. إنشاء Responsive Display Ad
            self._create_responsive_display_ad(
                ad_group_resource_name,
                marketing_image_resource,
                headlines,
                descriptions,
                website_url,
                business_name,
                long_headline or (headlines[0] if headlines else "خدمات متميزة"),
                call_to_action,
                main_color,
                accent_color
            )
            print(f"✅ تم إنشاء الإعلانات")
            
            campaign_id = campaign_resource_name.split('/')[-1]
            print("\n" + "=" * 50)
            print(f"🎉 تم إنشاء حملة العرض بنجاح!")
            print(f"📊 معرف الحملة: {campaign_id}")
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
        """إنشاء ميزانية الحملة (حسب المكتبة الرسمية)"""
        campaign_budget_service = self.client.get_service("CampaignBudgetService")
        campaign_budget_operation = self.client.get_type("CampaignBudgetOperation")
        
        campaign_budget = campaign_budget_operation.create
        timestamp = int(time.time())
        campaign_budget.name = f"{campaign_name} Budget #{timestamp}"
        campaign_budget.amount_micros = int(daily_budget * 1_000_000)
        campaign_budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
        campaign_budget.explicitly_shared = False
        
        response = campaign_budget_service.mutate_campaign_budgets(
            customer_id=self.customer_id,
            operations=[campaign_budget_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_display_campaign_core(
        self,
        campaign_name: str,
        budget_resource_name: str
    ) -> str:
        """إنشاء الحملة الأساسية (حسب المكتبة الرسمية)"""
        campaign_service = self.client.get_service("CampaignService")
        campaign_operation = self.client.get_type("CampaignOperation")
        
        campaign = campaign_operation.create
        timestamp = int(time.time())
        campaign.name = f"{campaign_name} #{timestamp}"
        
        # Set Display channel type
        campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.DISPLAY
        
        # Set campaign status to PAUSED
        campaign.status = self.client.enums.CampaignStatusEnum.PAUSED
        
        # Set budget
        campaign.campaign_budget = budget_resource_name
        
        # Set bidding strategy: Manual CPC
        self.client.copy_from(campaign.manual_cpc, self.client.get_type("ManualCpc"))
        
        # Set geo target type to PRESENCE only (الحضور فقط)
        campaign.geo_target_type_setting.positive_geo_target_type = (
            self.client.enums.PositiveGeoTargetTypeEnum.PRESENCE
        )
        
        # EU Political Advertising
        campaign.contains_eu_political_advertising = (
            self.client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )
        
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
        """إضافة استهداف المواقع واللغات (حسب المكتبة الرسمية)"""
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
        """إنشاء مجموعة إعلانية (حسب المكتبة الرسمية)"""
        ad_group_service = self.client.get_service("AdGroupService")
        ad_group_operation = self.client.get_type("AdGroupOperation")
        
        ad_group = ad_group_operation.create
        ad_group.name = f"{campaign_name} - Ad Group {uuid.uuid4().hex[:8]}"
        ad_group.campaign = campaign_resource_name
        ad_group.status = self.client.enums.AdGroupStatusEnum.ENABLED
        
        response = ad_group_service.mutate_ad_groups(
            customer_id=self.customer_id,
            operations=[ad_group_operation]
        )
        
        return response.results[0].resource_name
    
    def _upload_marketing_images(self, business_name: str = "Business", website_content: str = "", keywords: List[str] = None) -> Dict[str, str]:
        """تحميل صور متعددة (4-6 صور) مع توليد ذكي باستخدام AI"""
        
        try:
            print("🎨 توليد عدد كبير من الصور الواقعية...")
            
            # استيراد AIContentGenerator
            from services.ai_content_generator import AIContentGenerator
            ai_generator = AIContentGenerator()
            
            # إنشاء سياق الخدمة
            keywords_list = keywords[:5] if keywords else [business_name]
            
            # توليد 3 صور Marketing Images بزوايا مختلفة
            print(f"📸 توليد 3 Marketing Images بزوايا مختلفة...")
            marketing_images = []
            
            for i in range(1, 4):  # 3 صور أفقية
                print(f"  └─ صورة {i}/3: زاوية مختلفة...")
                result = ai_generator._generate_single_image_detailed(
                    campaign_type="DISPLAY",
                    image_type="marketing_image",
                    product_service=business_name,
                    website_url="",
                    keywords=keywords_list,
                    config={"size": "1792×1024", "aspect_ratio": "1.91:1"},
                    image_index=i,
                    website_content=website_content  # تمرير المحتوى المُستخرج مسبقاً
                )
                if result and result.get('success'):
                    marketing_images.append(result)
                    img_url = result.get('image_url', '')
                    print(f"  ✅ Marketing Image {i} تم التوليد: {img_url}")
                    # حفظ الرابط
                    with open('backend/google_ads_data/logs/generated_images.txt', 'a', encoding='utf-8') as f:
                        f.write(f"Marketing Image {i}/3 (Landscape): {img_url}\n")
            
            # اختيار أفضل صورة للاستخدام الرئيسي
            marketing_result = marketing_images[0] if marketing_images else None
            
            print(f"✅ تم توليد {len(marketing_images)} Marketing Images")
            
            if marketing_result and marketing_result.get('success'):
                # تحميل الصورة المولدة
                import requests
                from PIL import Image
                from io import BytesIO
                import tempfile
                
                image_url = marketing_result.get('image_url')
                print(f"🖼️ Marketing Image URL: {image_url}")
                
                # حفظ رابط الصورة في ملف
                with open('backend/google_ads_data/logs/generated_images.txt', 'a', encoding='utf-8') as f:
                    f.write(f"Marketing Image (1200x628): {image_url}\n")
                
                response = requests.get(image_url, timeout=30)
                img = Image.open(BytesIO(response.content))
                
                # تغيير الحجم إلى 1200x628
                img_resized = img.resize((1200, 628), Image.Resampling.LANCZOS)
                
                # حفظ مؤقتاً
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    img_resized.save(tmp_file, format='JPEG', quality=95, optimize=True)
                    tmp_path = tmp_file.name
                
                # رفع الصورة
                with open(tmp_path, 'rb') as f:
                    image_data = f.read()
                
                marketing_image_resource = self._upload_image_asset_from_data(
                    image_data,
                    "AI Generated Marketing Image (1200x628)"
                )
                print("✅ تم توليد Marketing Image بنجاح")
            else:
                raise Exception("فشل توليد Marketing Image")
            
            # توليد 3 صور Square Images بزوايا مختلفة
            print(f"📸 توليد 3 Square Images (Close-up)...")
            square_images = []
            
            for i in range(1, 4):  # 3 صور مربعة
                print(f"  └─ صورة {i}/3: Close-up مختلف...")
                result = ai_generator._generate_single_image_detailed(
                    campaign_type="DISPLAY",
                    image_type="square_marketing_image",
                    product_service=business_name,
                    website_url="",
                    keywords=keywords_list,
                    config={"size": "1024×1024", "aspect_ratio": "1:1"},
                    image_index=i,
                    website_content=website_content  # تمرير المحتوى المُستخرج مسبقاً
                )
                if result and result.get('success'):
                    square_images.append(result)
                    img_url = result.get('image_url', '')
                    print(f"  ✅ Square Image {i} تم التوليد: {img_url}")
                    # حفظ الرابط
                    with open('backend/google_ads_data/logs/generated_images.txt', 'a', encoding='utf-8') as f:
                        f.write(f"Square Image {i}/3 (Close-up): {img_url}\n")
            
            # اختيار أفضل صورة مربعة
            square_result = square_images[0] if square_images else None
            
            print(f"✅ تم توليد {len(square_images)} Square Images")
            print(f"📊 إجمالي الصور المولدة: {len(marketing_images) + len(square_images)} صورة")
            
            if square_result and square_result.get('success'):
                image_url = square_result.get('image_url')
                print(f"🖼️ Square Image URL: {image_url}")
                
                # حفظ رابط الصورة في ملف
                with open('backend/google_ads_data/logs/generated_images.txt', 'a', encoding='utf-8') as f:
                    f.write(f"Square Image (1200x1200): {image_url}\n")
                
                response = requests.get(image_url, timeout=30)
                img = Image.open(BytesIO(response.content))
                
                # تغيير الحجم إلى 1200x1200
                img_resized = img.resize((1200, 1200), Image.Resampling.LANCZOS)
                
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    img_resized.save(tmp_file, format='JPEG', quality=95, optimize=True)
                    tmp_path = tmp_file.name
                
                with open(tmp_path, 'rb') as f:
                    image_data = f.read()
                
                square_marketing_image_resource = self._upload_image_asset_from_data(
                    image_data,
                    "AI Generated Square Image (1200x1200)"
                )
                print("✅ تم توليد Square Image بنجاح")
            else:
                raise Exception("فشل توليد Square Image")
            
            return {
                "marketing_image": marketing_image_resource,
                "square_marketing_image": square_marketing_image_resource
            }
            
        except Exception as e:
            print(f"⚠️ فشل توليد الصور بالذكاء الاصطناعي: {e}")
            print("📥 استخدام صور Google الافتراضية كبديل...")
            
            # Fallback إلى الصور الافتراضية
            marketing_image_url = "https://gaagl.page.link/Eit5"
            square_marketing_image_url = "https://gaagl.page.link/bjYi"
            
            marketing_image_resource = self._upload_image_asset(
                marketing_image_url,
                "Marketing Image"
            )
            
            square_marketing_image_resource = self._upload_image_asset(
                square_marketing_image_url,
                "Square Marketing Image"
            )
            
            return {
                "marketing_image": marketing_image_resource,
                "square_marketing_image": square_marketing_image_resource
            }
    
    def _upload_image_asset_from_data(self, image_data: bytes, asset_name: str) -> str:
        """تحميل صورة من بيانات ثنائية مباشرة"""
        asset_service = self.client.get_service("AssetService")
        
        asset_operation = self.client.get_type("AssetOperation")
        asset = asset_operation.create
        asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
        asset.name = asset_name
        asset.image_asset.data = image_data
        
        response = asset_service.mutate_assets(
                customer_id=self.customer_id,
            operations=[asset_operation]
        )
        
        return response.results[0].resource_name
    
    def _upload_image_asset(self, image_url: str, asset_name: str) -> str:
        """تحميل صورة كـ Asset (حسب المكتبة الرسمية)"""
        asset_service = self.client.get_service("AssetService")
        
        # Fetch image data
        try:
            image_data = requests.get(image_url, timeout=10).content
        except Exception as e:
            print(f"⚠️ فشل في تحميل الصورة من {image_url}: {e}")
            # Use fallback placeholder
            image_data = b''
        
        # Create asset operation
        asset_operation = self.client.get_type("AssetOperation")
        asset = asset_operation.create
        asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
        asset.image_asset.data = image_data
        asset.name = asset_name
        
        response = asset_service.mutate_assets(
                customer_id=self.customer_id,
            operations=[asset_operation]
        )
        
        return response.results[0].resource_name
    
    def _create_responsive_display_ad(
        self,
        ad_group_resource_name: str,
        marketing_image_resource: Dict[str, str],
        headlines: List[str],
        descriptions: List[str],
        website_url: str,
        business_name: str,
        long_headline: str,
        call_to_action: str,
        main_color: str,
        accent_color: str
    ):
        """إنشاء Responsive Display Ad (حسب المكتبة الرسمية)"""
        ad_group_ad_service = self.client.get_service("AdGroupAdService")
        
        # Create ad group ad operation
        ad_group_ad_operation = self.client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create
        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.ad.final_urls.append(website_url)
        
        # Create image assets
        marketing_image = self.client.get_type("AdImageAsset")
        marketing_image.asset = marketing_image_resource["marketing_image"]
        
        square_marketing_image = self.client.get_type("AdImageAsset")
        square_marketing_image.asset = marketing_image_resource["square_marketing_image"]
        
        # Configure Responsive Display Ad
        responsive_display_ad_info = ad_group_ad.ad.responsive_display_ad
        
        # Add marketing images
        responsive_display_ad_info.marketing_images.append(marketing_image)
        responsive_display_ad_info.square_marketing_images.append(square_marketing_image)
        
        # Add short headlines (5 minimum للحصول على GOOD Ad Strength)
        for headline_text in headlines[:5]:
            headline = self.client.get_type("AdTextAsset")
            headline.text = headline_text[:30]  # Max 30 chars
            responsive_display_ad_info.headlines.append(headline)
        
        # Add long headlines (1-5 للحصول على EXCELLENT - Google Ads API v21)
        long_headlines = headlines[5:10] if len(headlines) > 5 else [long_headline] if long_headline else []
        for long_headline_text in long_headlines[:5]:
            long_headline_asset = self.client.get_type("AdTextAsset")
            long_headline_asset.text = long_headline_text[:90]  # Max 90 chars
            responsive_display_ad_info.long_headlines.append(long_headline_asset)
        
        # Fallback: إذا لم يتم إضافة أي long headline، استخدم الأول
        if len(responsive_display_ad_info.long_headlines) == 0 and long_headline:
            responsive_display_ad_info.long_headline.text = long_headline[:90]
        
        # Add descriptions (5 minimum للحصول على EXCELLENT Ad Strength)
        unique_descriptions = list(dict.fromkeys(descriptions[:5]))  # إزالة التكرار
        for description_text in unique_descriptions:
            description = self.client.get_type("AdTextAsset")
            description.text = description_text[:90]  # Max 90 chars
            responsive_display_ad_info.descriptions.append(description)
        
        # Add business name
        responsive_display_ad_info.business_name = business_name[:25]  # Max 25 chars
        
        # Add call to action (optional) - لا تضيفه إذا لم يكن صحيحاً
        # Valid values: https://support.google.com/google-ads/answer/7005917
        # ملاحظة: call_to_action_text اختياري ويمكن تركه فارغاً
        # Google ستستخدم القيمة الافتراضية تلقائياً
        # valid_cta_values = [
        #     "APPLY_NOW", "BOOK_NOW", "CONTACT_US", "DOWNLOAD", "GET_QUOTE",
        #     "LEARN_MORE", "SHOP_NOW", "SIGN_UP", "SUBSCRIBE", "GET_OFFER"
        # ]
        # if call_to_action and call_to_action.upper() in valid_cta_values:
        #     responsive_display_ad_info.call_to_action_text = call_to_action.upper()
        
        # Set colors
        responsive_display_ad_info.main_color = main_color
        responsive_display_ad_info.accent_color = accent_color
        responsive_display_ad_info.allow_flexible_color = False
        
        # Set format setting
        responsive_display_ad_info.format_setting = (
            self.client.enums.DisplayAdFormatSettingEnum.NON_NATIVE
        )
        
        # Optional: Add logo images
        # logo_image = self.client.get_type("AdImageAsset")
        # logo_image.asset = "INSERT_LOGO_IMAGE_RESOURCE_NAME_HERE"
        # responsive_display_ad_info.logo_images.append(logo_image)
        
        # Issue mutate request
        ad_group_ad_service.mutate_ad_group_ads(
                    customer_id=self.customer_id,
            operations=[ad_group_ad_operation]
        )
    
    def get_campaign_requirements(self) -> Dict[str, Any]:
        """الحصول على متطلبات حملات العرض"""
        return {
            "campaign_type": "DISPLAY",
            "name": "الشبكة الإعلانية",
            "description": "حملات إعلانية بصرية تظهر على شبكة Google الإعلانية",
            "text_requirements": {
                "headlines": {
                    "required": True,
                    "min_count": 1,
                    "max_count": 5,
                    "max_length": 30
                },
                "long_headline": {
                    "required": True,
                    "max_length": 90
                },
                "descriptions": {
                    "required": True,
                    "min_count": 1,
                    "max_count": 5,
                    "max_length": 90
                },
                "business_name": {
                    "required": True,
                    "max_length": 25
                }
            },
            "image_requirements": {
                "required": True,
                "marketing_image": {
                    "aspect_ratio": "1.91:1",
                    "recommended_size": "1200x628",
                    "description": "صورة تسويقية أفقية"
                },
                "square_marketing_image": {
                    "aspect_ratio": "1:1",
                    "recommended_size": "1200x1200",
                    "description": "صورة تسويقية مربعة"
                },
                "logo_image": {
                    "required": False,
                    "aspect_ratio": "1:1 or 4:1",
                    "recommended_size": "1200x1200 or 1200x300",
                    "description": "شعار"
                }
            },
            "ad_type": "RESPONSIVE_DISPLAY_AD",
            "bidding_strategy": {
                "type": "MANUAL_CPC",
                "description": "تكلفة النقرة اليدوية"
            },
            "targeting": {
                "location_required": True,
                "language_required": True,
                "user_list": "اختياري - لإعادة الاستهداف"
            },
            "customization": {
                "call_to_action": "اختياري - نص الدعوة للإجراء",
                "colors": "اختياري - اللون الرئيسي والفرعي",
                "format_setting": "NON_NATIVE or NATIVE"
            }
        }
