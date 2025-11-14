"""
نظام التحقق من اكتمال الحملات قبل الرفع
"""
from typing import Dict, List, Any
import json

class CampaignValidator:
    """التحقق من اكتمال جميع مكونات الحملة قبل الرفع"""
    
    # متطلبات كل نوع حملة
    CAMPAIGN_REQUIREMENTS = {
        "SEARCH": {
            "required_fields": [
                "campaign_name",
                "daily_budget",
                "target_locations",
                "target_language"
            ],
            "required_components": {
                "budget": "ميزانية الحملة",
                "campaign_core": "الحملة الأساسية",
                "location_targeting": "الاستهداف الجغرافي",
                "language_targeting": "استهداف اللغة",
                "ad_group": "مجموعة إعلانية واحدة على الأقل",
                "ads": "إعلان واحد على الأقل",
                "keywords": "10 كلمات مفتاحية على الأقل"
            },
            "optional_components": {
                "sitelinks": "روابط إضافية (Sitelinks)",
                "callouts": "نقاط مميزة (Callouts)",
                "structured_snippets": "مقتطفات منظمة",
                "call_extensions": "إضافة رقم الهاتف"
            },
            "min_keywords": 10,
            "max_keywords": 20000,
            "min_headlines": 3,
            "max_headlines": 15,
            "min_descriptions": 2,
            "max_descriptions": 4,
            "headline_max_length": 30,
            "description_max_length": 90
        },
        "PERFORMANCE_MAX": {
            "required_fields": [
                "campaign_name",
                "daily_budget",
                "target_locations",
                "target_language"
            ],
            "required_components": {
                "budget": "ميزانية الحملة",
                "campaign_core": "الحملة الأساسية",
                "asset_group": "مجموعة أصول واحدة على الأقل",
                "headlines": "3-5 عناوين",
                "descriptions": "2-5 أوصاف",
                "images": "صور إعلانية (مربعة + أفقية)",
                "logos": "شعار الشركة"
            },
            "min_headlines": 3,
            "max_headlines": 5,
            "min_descriptions": 2,
            "max_descriptions": 5
        },
        "DISPLAY": {
            "required_fields": [
                "campaign_name",
                "daily_budget",
                "target_locations",
                "target_language"
            ],
            "required_components": {
                "budget": "ميزانية الحملة",
                "campaign_core": "الحملة الأساسية",
                "ad_group": "مجموعة إعلانية",
                "responsive_display_ads": "إعلانات العرض المتجاوبة",
                "images": "صور إعلانية"
            }
        }
    }
    
    @classmethod
    def validate_campaign_data(cls, campaign_type: str, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        التحقق من اكتمال بيانات الحملة قبل الرفع
        
        Returns:
            Dict مع:
                - valid: bool
                - missing_required: List[str]
                - missing_optional: List[str]
                - warnings: List[str]
                - summary: str
        """
        if campaign_type not in cls.CAMPAIGN_REQUIREMENTS:
            return {
                "valid": False,
                "error": f"نوع الحملة {campaign_type} غير مدعوم",
                "missing_required": [],
                "missing_optional": [],
                "warnings": []
            }
        
        requirements = cls.CAMPAIGN_REQUIREMENTS[campaign_type]
        missing_required = []
        missing_optional = []
        warnings = []
        
        # 1. فحص الحقول المطلوبة
        for field in requirements["required_fields"]:
            if field not in campaign_data or not campaign_data[field]:
                missing_required.append(f"❌ {field}: مطلوب")
        
        # 2. فحص المكونات المطلوبة
        if "required_components" in requirements:
            for component, description in requirements["required_components"].items():
                if component not in campaign_data or not campaign_data[component]:
                    missing_required.append(f"❌ {component}: {description} - مطلوب")
        
        # 3. فحص المكونات الاختيارية
        if "optional_components" in requirements:
            for component, description in requirements["optional_components"].items():
                if component not in campaign_data or not campaign_data[component]:
                    missing_optional.append(f"⚠️ {component}: {description} - اختياري")
        
        # 4. فحص العناوين (Headlines)
        if campaign_type in ["SEARCH", "PERFORMANCE_MAX"]:
            headlines = campaign_data.get("headlines", [])
            min_headlines = requirements.get("min_headlines", 3)
            max_headlines = requirements.get("max_headlines", 15)
            
            if len(headlines) < min_headlines:
                missing_required.append(f"❌ العناوين: {len(headlines)} موجود، يجب {min_headlines} على الأقل")
            elif len(headlines) > max_headlines:
                warnings.append(f"⚠️ العناوين: {len(headlines)} موجود، الحد الأقصى {max_headlines}")
            
            # فحص طول العناوين
            if "headline_max_length" in requirements:
                max_length = requirements["headline_max_length"]
                for i, headline in enumerate(headlines, 1):
                    if len(headline) > max_length:
                        warnings.append(f"⚠️ العنوان #{i} طويل جداً ({len(headline)} حرف، الحد الأقصى {max_length})")
        
        # 5. فحص الأوصاف (Descriptions)
        if campaign_type in ["SEARCH", "PERFORMANCE_MAX"]:
            descriptions = campaign_data.get("descriptions", [])
            min_descriptions = requirements.get("min_descriptions", 2)
            max_descriptions = requirements.get("max_descriptions", 4)
            
            if len(descriptions) < min_descriptions:
                missing_required.append(f"❌ الأوصاف: {len(descriptions)} موجود، يجب {min_descriptions} على الأقل")
            elif len(descriptions) > max_descriptions:
                warnings.append(f"⚠️ الأوصاف: {len(descriptions)} موجود، الحد الأقصى {max_descriptions}")
            
            # فحص طول الأوصاف
            if "description_max_length" in requirements:
                max_length = requirements["description_max_length"]
                for i, desc in enumerate(descriptions, 1):
                    if len(desc) > max_length:
                        warnings.append(f"⚠️ الوصف #{i} طويل جداً ({len(desc)} حرف، الحد الأقصى {max_length})")
        
        # 6. فحص الكلمات المفتاحية (للحملات Search)
        if campaign_type == "SEARCH":
            keywords = campaign_data.get("keywords", [])
            min_keywords = requirements.get("min_keywords", 10)
            
            if len(keywords) < min_keywords:
                missing_required.append(f"❌ الكلمات المفتاحية: {len(keywords)} موجود، يجب {min_keywords} على الأقل")
        
        # النتيجة النهائية
        is_valid = len(missing_required) == 0
        
        return {
            "valid": is_valid,
            "missing_required": missing_required,
            "missing_optional": missing_optional,
            "warnings": warnings,
            "summary": cls._generate_summary(is_valid, missing_required, missing_optional, warnings)
        }
    
    @classmethod
    def _generate_summary(cls, is_valid: bool, missing_required: List[str], 
                         missing_optional: List[str], warnings: List[str]) -> str:
        """إنشاء ملخص نصي للتحقق"""
        lines = []
        lines.append("="*80)
        lines.append("📋 تقرير التحقق من اكتمال الحملة")
        lines.append("="*80)
        
        if is_valid:
            lines.append("\n✅ **الحملة جاهزة للرفع!**")
            lines.append("   جميع المتطلبات الأساسية متوفرة\n")
        else:
            lines.append("\n❌ **الحملة غير جاهزة - توجد متطلبات ناقصة**\n")
            lines.append("المتطلبات الناقصة:")
            for item in missing_required:
                lines.append(f"   {item}")
        
        if missing_optional:
            lines.append("\nالمكونات الاختيارية الناقصة:")
            for item in missing_optional:
                lines.append(f"   {item}")
        
        if warnings:
            lines.append("\n⚠️ تحذيرات:")
            for warning in warnings:
                lines.append(f"   {warning}")
        
        lines.append("\n" + "="*80)
        
        return "\n".join(lines)
    
    @classmethod
    def print_validation_report(cls, validation_result: Dict[str, Any]):
        """طباعة تقرير التحقق"""
        print(validation_result["summary"])

