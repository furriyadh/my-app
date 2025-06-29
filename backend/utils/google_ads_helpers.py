"""
Google Ads Helper Functions

This module provides a collection of advanced helper functions for managing
Google Ads accounts, including:
- Account analysis and quality scoring
- Intelligent primary account selection
- MCC (My Client Center) account management utilities
- Data formatting for API responses

These functions are designed to be robust, efficient, and integrate seamlessly
with the Google Ads API and database layers.

Author: Google Ads AI Platform Team
Version: 1.1.0
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class GoogleAdsAccountAnalyzer:
    """
    يقوم بتحليل جودة حسابات Google Ads ويقدم تقييمات بناءً على معايير مختلفة.
    """
    @staticmethod
    def analyze_account_quality(account: Dict[str, Any]) -> Dict[str, Any]:
        """
        يحلل جودة حساب Google Ads ويقدم تقييمًا.
        
        المعايير تشمل:
        - حالة الحساب (نشط، معلق، إلخ)
        - ما إذا كان حساب MCC
        - ما إذا كان حساب تجريبي
        - تمكين العلامات التلقائية (Auto-tagging)
        - وجود معرف تتبع التحويل (Conversion Tracking ID)
        - وجود إعدادات إعادة التسويق (Remarketing Setting)
        - تاريخ آخر مزامنة (كلما كان أحدث كان أفضل)
        
        Args:
            account (Dict[str, Any]): قاموس يحتوي على معلومات الحساب.
            
        Returns:
            Dict[str, Any]: قاموس يحتوي على تحليل الجودة والتقييم.
        """
        quality_score = 0
        issues = []
        recommendations = []

        # 1. حالة الحساب
        status = account.get("status", "UNKNOWN").upper()
        if status == "ENABLED":
            quality_score += 10
        elif status == "PAUSED":
            quality_score += 5
            issues.append("الحساب في حالة إيقاف مؤقت.")
        elif status == "SUSPENDED":
            quality_score -= 20
            issues.append("الحساب معلق وقد يتطلب اهتمامًا فوريًا.")
            recommendations.append("التحقق من سبب تعليق الحساب وحل المشكلة.")
        else:
            issues.append(f"حالة الحساب غير معروفة: {status}.")

        # 2. نوع الحساب (MCC vs. Standard)
        is_manager = account.get("manager", False)
        if is_manager:
            quality_score += 5  # MCCs غالباً ما تكون أكثر استقراراً
            issues.append("هذا حساب MCC (مركز العملاء الخاص بي).")
        
        # 3. حساب تجريبي
        is_test_account = account.get("test_account", False)
        if is_test_account:
            quality_score -= 10
            issues.append("هذا حساب تجريبي ولا ينبغي استخدامه للحملات الحقيقية.")
            recommendations.append("استخدم حسابًا غير تجريبي للحملات الفعلية.")

        # 4. تمكين العلامات التلقائية (Auto-tagging)
        auto_tagging_enabled = account.get("auto_tagging_enabled", False)
        if auto_tagging_enabled:
            quality_score += 7
        else:
            issues.append("العلامات التلقائية (Auto-tagging) غير مفعلة.")
            recommendations.append("تفعيل العلامات التلقائية لتحسين تتبع التحويلات.")

        # 5. وجود معرف تتبع التحويل (Conversion Tracking ID)
        conversion_tracking_id = account.get("conversion_tracking_id")
        if conversion_tracking_id:
            quality_score += 8
        else:
            issues.append("معرف تتبع التحويل غير موجود.")
            recommendations.append("إعداد تتبع التحويلات لتقييم أداء الحملات.")

        # 6. وجود إعدادات إعادة التسويق (Remarketing Setting)
        remarketing_setting = account.get("remarketing_setting", {})
        if remarketing_setting and remarketing_setting.get("status") == "ENABLED":
            quality_score += 5
        else:
            issues.append("إعدادات إعادة التسويق غير مفعلة أو غير موجودة.")
            recommendations.append("تفعيل إعادة التسويق لاستهداف المستخدمين السابقين.")

        # 7. تاريخ آخر مزامنة (افتراضًا أن الحسابات المزامنة حديثًا أفضل)
        last_sync_str = account.get("last_sync")
        if last_sync_str:
            try:
                last_sync = datetime.fromisoformat(last_sync_str.replace("Z", "+00:00"))
                time_since_sync = datetime.now(last_sync.tzinfo) - last_sync
                if time_since_sync < timedelta(days=7):
                    quality_score += 3
                elif time_since_sync > timedelta(days=30):
                    issues.append("آخر مزامنة للحساب كانت منذ أكثر من 30 يومًا.")
                    recommendations.append("تأكد من مزامنة الحسابات بانتظام.")
            except ValueError:
                issues.append("تنسيق تاريخ آخر مزامنة غير صالح.")
        else:
            issues.append("تاريخ آخر مزامنة غير متاح.")

        # تحديد التقييم العام
        if quality_score >= 25:
            rating = "ممتاز"
        elif quality_score >= 15:
            rating = "جيد"
        elif quality_score >= 0:
            rating = "متوسط"
        else:
            rating = "ضعيف"

        return {
            "quality_score": quality_score,
            "rating": rating,
            "issues": issues,
            "recommendations": recommendations
        }

class GoogleAdsAccountSelector:
    """
    يختار أفضل حساب Google Ads ليكون الحساب الرئيسي بناءً على معايير محددة.
    """
    @staticmethod
    def select_best_primary_account(accounts: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        يختار أفضل حساب Google Ads ليكون الحساب الرئيسي.
        
        منطق الاختيار:
        1. استبعاد الحسابات التجريبية.
        2. تفضيل الحسابات غير الإدارية (Standard accounts) على حسابات MCC.
        3. تفضيل الحسابات ذات حالة 'ENABLED'.
        4. استخدام تحليل الجودة (إذا كان متاحًا) لتحديد الأفضل.
        5. إذا لم يتم العثور على حساب مثالي، يتم اختيار أول حساب غير تجريبي.
        
        Args:
            accounts (List[Dict[str, Any]]): قائمة بقواميس حسابات Google Ads.
            
        Returns:
            Optional[Dict[str, Any]]: قاموس يمثل الحساب الرئيسي المختار، أو None إذا لم يتم العثور على حساب.
        """
        if not accounts:
            return None

        # استبعاد الحسابات التجريبية أولاً
        non_test_accounts = [acc for acc in accounts if not acc.get("test_account", False)]
        if not non_test_accounts:
            logger.warning("لا توجد حسابات غير تجريبية متاحة. اختيار من الحسابات التجريبية.")
            non_test_accounts = accounts # إذا كانت جميعها تجريبية، نعود لاستخدامها

        # فصل الحسابات العادية عن حسابات MCC
        standard_accounts = [acc for acc in non_test_accounts if not acc.get("manager", False)]
        mcc_accounts = [acc for acc in non_test_accounts if acc.get("manager", False)]

        candidate_accounts = []

        # تفضيل الحسابات العادية النشطة
        for acc in standard_accounts:
            if acc.get("status", "").upper() == "ENABLED":
                candidate_accounts.append(acc)
        
        # إذا لم توجد حسابات عادية نشطة، نأخذ أي حساب عادي
        if not candidate_accounts:
            candidate_accounts.extend(standard_accounts)

        # إذا لم توجد حسابات عادية على الإطلاق، نأخذ حسابات MCC النشطة
        if not candidate_accounts:
            for acc in mcc_accounts:
                if acc.get("status", "").upper() == "ENABLED":
                    candidate_accounts.append(acc)
        
        # إذا لم توجد حسابات MCC نشطة، نأخذ أي حساب MCC
        if not candidate_accounts:
            candidate_accounts.extend(mcc_accounts)

        # إذا ما زالت القائمة فارغة، نعود إلى جميع الحسابات غير التجريبية
        if not candidate_accounts:
            candidate_accounts = non_test_accounts

        # تحليل الجودة واختيار الأفضل
        if candidate_accounts:
            best_account = None
            highest_score = -float("inf")

            for account in candidate_accounts:
                analysis = GoogleAdsAccountAnalyzer.analyze_account_quality(account)
                account["quality_analysis"] = analysis # إضافة التحليل للحساب
                account["selection_reason"] = "" # لتوضيح سبب الاختيار

                score = analysis["quality_score"]
                
                # تفضيل الحسابات غير MCC
                if not account.get("manager", False):
                    score += 10 # مكافأة للحسابات العادية
                
                # تفضيل الحسابات النشطة
                if account.get("status", "").upper() == "ENABLED":
                    score += 5

                if score > highest_score:
                    highest_score = score
                    best_account = account

            if best_account:
                best_account["selection_reason"] = "تم الاختيار بناءً على تحليل الجودة والأولوية."
                return best_account
        
        # إذا لم يتم العثور على حساب مثالي، نعود إلى أول حساب غير تجريبي
        if non_test_accounts:
            first_non_test = non_test_accounts[0]
            first_non_test["quality_analysis"] = GoogleAdsAccountAnalyzer.analyze_account_quality(first_non_test)
            first_non_test["selection_reason"] = "تم الاختيار كأول حساب غير تجريبي متاح."
            return first_non_test

        # إذا لم يتبق شيء، نعود إلى أول حساب على الإطلاق
        if accounts:
            first_account = accounts[0]
            first_account["quality_analysis"] = GoogleAdsAccountAnalyzer.analyze_account_quality(first_account)
            first_account["selection_reason"] = "تم الاختيار كأول حساب متاح (قد يكون تجريبيًا أو غير نشط)."
            return first_account

        return None

class GoogleAdsMCCManager:
    """
    يدير العمليات المتعلقة بحسابات MCC (My Client Center).
    """
    @staticmethod
    def validate_mcc_configuration() -> Dict[str, Any]:
        """
        يتحقق من صحة إعدادات MCC في متغيرات البيئة.
        
        Returns:
            Dict[str, Any]: قاموس يوضح ما إذا كانت الإعدادات صالحة وأي مشاكل.
        """
        mcc_customer_id = os.getenv("GOOGLE_ADS_MCC_CUSTOMER_ID")
        issues = []

        if not mcc_customer_id:
            issues.append("متغير البيئة GOOGLE_ADS_MCC_CUSTOMER_ID غير موجود.")
        elif not mcc_customer_id.isdigit() or len(mcc_customer_id) != 10:
            issues.append("معرف عميل MCC غير صالح (يجب أن يكون رقمًا مكونًا من 10 أرقام).")
        
        if issues:
            return {"valid": False, "issues": issues}
        else:
            return {"valid": True, "mcc_customer_id": mcc_customer_id, "issues": []}

    @staticmethod
    def can_link_to_mcc(account: Dict[str, Any]) -> Dict[str, Any]:
        """
        يحدد ما إذا كان يمكن ربط حساب معين بحساب MCC.
        
        Args:
            account (Dict[str, Any]): قاموس يحتوي على معلومات الحساب.
            
        Returns:
            Dict[str, Any]: قاموس يوضح ما إذا كان يمكن ربط الحساب وأي أسباب.
        """
        reasons = []

        if account.get("manager", False):
            reasons.append("الحساب هو بالفعل حساب MCC ولا يمكن ربطه بـ MCC آخر.")
        
        if account.get("test_account", False):
            reasons.append("الحساب تجريبي ولا ينبغي ربطه بحساب MCC حقيقي.")

        if account.get("status", "").upper() != "ENABLED":
            reasons.append(f"الحساب ليس نشطًا (الحالة: {account.get("status")}).")

        if reasons:
            return {"can_link": False, "reasons": reasons}
        else:
            return {"can_link": True, "reasons": []}

class GoogleAdsDataFormatter:
    """
    يقوم بتنسيق بيانات Google Ads للعرض في واجهة المستخدم أو لعمليات أخرى.
    """
    @staticmethod
    def format_accounts_list(accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        ينسق قائمة حسابات Google Ads للعرض.
        
        Args:
            accounts (List[Dict[str, Any]]): قائمة بقواميس حسابات Google Ads.
            
        Returns:
            List[Dict[str, Any]]: قائمة بقواميس الحسابات المنسقة.
        """
        formatted_list = []
        for account in accounts:
            formatted_account = {
                "id": account.get("id"),
                "customer_id": account.get("customer_id"),
                "descriptive_name": account.get("descriptive_name"),
                "currency_code": account.get("currency_code", "N/A"),
                "time_zone": account.get("time_zone", "N/A"),
                "account_type": "MCC" if account.get("manager", False) else "STANDARD",
                "is_primary": account.get("is_primary", False),
                "status": account.get("status", "UNKNOWN"),
                "linked_at": account.get("linked_at"),
                "last_sync": account.get("last_sync"),
                "quality_rating": account.get("quality_analysis", {}).get("rating", "N/A"),
                "issues": account.get("quality_analysis", {}).get("issues", [])
            }
            formatted_list.append(formatted_account)
        return formatted_list

    @staticmethod
    def format_token_info(token_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        ينسق معلومات رمز الوصول للعرض.
        
        Args:
            token_data (Dict[str, Any]): قاموس يحتوي على معلومات الرمز.
            
        Returns:
            Dict[str, Any]: قاموس بمعلومات الرمز المنسقة.
        """
        return {
            "token_id": token_data.get("id"),
            "user_id": token_data.get("user_id"),
            "customer_id": token_data.get("customer_id"),
            "token_type": token_data.get("token_type"),
            "scope": token_data.get("scope"),
            "expires_at": token_data.get("expires_at"),
            "created_at": token_data.get("created_at"),
            "last_refreshed": token_data.get("last_refreshed"),
            "is_active": token_data.get("is_active"),
            "security_level": token_data.get("metadata", {}).get("security_level", "N/A")
        }

logger.info("✅ تم تحميل Google Ads Helper Functions")


