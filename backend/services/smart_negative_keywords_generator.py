#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مولد الكلمات السلبية الذكي - Smart Negative Keywords Generator
يستخدم الذكاء الاصطناعي لتوليد كلمات سلبية حسب مجال العمل والكلمات المفتاحية
"""

import os
import logging
from typing import List, Dict, Any, Set
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv(dotenv_path='../.env.development')

logger = logging.getLogger(__name__)


class SmartNegativeKeywordsGenerator:
    """مولد ذكي للكلمات السلبية حسب السياق"""
    
    def __init__(self):
        """تهيئة المولد الذكي"""
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
    def generate_negative_keywords(self, 
                                   positive_keywords: List[str],
                                   business_domain: str,
                                   website_content: str = None) -> List[str]:
        """
        توليد كلمات سلبية ذكية حسب السياق
        
        Args:
            positive_keywords: الكلمات المفتاحية الإيجابية للحملة
            business_domain: مجال العمل (مثل: كهرباء، سباكة، خدمات)
            website_content: محتوى الموقع (اختياري)
            
        Returns:
            قائمة الكلمات السلبية المناسبة
        """
        logger.info(f"🧠 توليد كلمات سلبية ذكية لمجال: {business_domain}")
        
        try:
            # استخدام Gemini AI لتوليد كلمات سلبية ذكية
            negative_keywords = self._generate_with_gemini(
                positive_keywords,
                business_domain,
                website_content
            )
            
            # تنقية الكلمات من التضارب
            filtered_keywords = self._filter_conflicting_keywords(
                negative_keywords,
                positive_keywords
            )
            
            logger.info(f"✅ تم توليد {len(filtered_keywords)} كلمة سلبية ذكية")
            return filtered_keywords
            
        except Exception as e:
            logger.error(f"❌ خطأ في توليد الكلمات السلبية: {e}")
            # Fallback: استخدام قائمة أساسية عامة
            return self._get_basic_negative_keywords()
    
    def _generate_with_gemini(self, 
                              positive_keywords: List[str],
                              business_domain: str,
                              website_content: str = None) -> List[str]:
        """استخدام Gemini AI لتوليد كلمات سلبية"""
        
        if not self.gemini_api_key:
            logger.warning("⚠️ Gemini API Key غير متوفر، استخدام الطريقة الاحتياطية")
            return self._generate_intelligent_fallback(positive_keywords, business_domain)
        
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # إنشاء البرومبت الذكي
            prompt = self._create_smart_prompt(
                positive_keywords,
                business_domain,
                website_content
            )
            
            # استدعاء Gemini
            response = model.generate_content(prompt)
            
            # استخراج الكلمات السلبية من الرد
            negative_keywords = self._parse_gemini_response(response.text)
            
            return negative_keywords
            
        except Exception as e:
            logger.error(f"❌ خطأ في Gemini API: {e}")
            return self._generate_intelligent_fallback(positive_keywords, business_domain)
    
    def _create_smart_prompt(self,
                            positive_keywords: List[str],
                            business_domain: str,
                            website_content: str = None) -> str:
        """إنشاء برومبت ذكي لـ Gemini"""
        
        keywords_text = ", ".join(positive_keywords[:10])  # أول 10 كلمات
        
        prompt = f"""أنت خبير في إعلانات Google Ads. مهمتك توليد قائمة شاملة من الكلمات السلبية (Negative Keywords) لحملة إعلانية.

**معلومات الحملة:**
- مجال العمل: {business_domain}
- الكلمات المفتاحية الإيجابية: {keywords_text}

**المطلوب:**
قم بتوليد قائمة شاملة من الكلمات السلبية التي يجب استبعادها من هذه الحملة الإعلانية.

**القواعد الهامة:**
1. **لا تضع كلمات تتضارب** مع الكلمات المفتاحية الإيجابية
2. استبعد الكلمات التي قد تجلب زيارات غير مفيدة (مجاني، وظائف، تعليم، إلخ)
3. ركز على مجال العمل: {business_domain}
4. اجعل الكلمات باللغة العربية والإنجليزية
5. تجنب الكلمات العامة جداً

**التصنيفات المطلوبة:**
1. كلمات مجانية (free, مجاني، إلخ)
2. وظائف وتوظيف
3. تعليم وتدريب
4. محتوى معلوماتي (كيف، طريقة، شرح)
5. مقارنات ومراجعات (للمجالات غير المناسبة)
6. محتوى ترفيهي
7. مجالات أخرى غير متعلقة بـ {business_domain}

**تنبيه مهم:**
- إذا كان مجال العمل "صيانة كهرباء"، لا تضع كلمات مثل "كهرباء" أو "كهربائي" كسلبية!
- إذا كان "سباكة"، لا تضع "سباك" كسلبية!
- كن ذكياً في اختيار الكلمات حسب السياق.

**صيغة الإخراج:**
أعطني الكلمات السلبية فقط، كلمة في كل سطر، بدون ترقيم أو تصنيفات.

الكلمات السلبية:"""

        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> List[str]:
        """استخراج الكلمات السلبية من رد Gemini"""
        
        lines = response_text.strip().split('\n')
        keywords = []
        
        for line in lines:
            # تنظيف السطر
            line = line.strip()
            
            # تجاهل السطور الفارغة والعناوين
            if not line or line.startswith('#') or line.startswith('**'):
                continue
            
            # إزالة الترقيم
            if line[0].isdigit() and ('.' in line or '-' in line):
                line = line.split('.', 1)[-1].split('-', 1)[-1].strip()
            
            # إزالة النقاط والشرطات في البداية
            line = line.lstrip('.-•*→ ')
            
            # إضافة الكلمة إذا كانت صالحة
            if line and len(line) > 1:
                keywords.append(line.lower())
        
        return list(set(keywords))  # إزالة المكررات
    
    def _generate_intelligent_fallback(self, 
                                      positive_keywords: List[str],
                                      business_domain: str) -> List[str]:
        """
        توليد كلمات سلبية ذكية بدون Gemini
        (نظام احتياطي ذكي)
        """
        
        # قاعدة بيانات ذكية للكلمات السلبية حسب المجال
        domain_specific_negatives = {
            "كهرباء": [
                # كلمات عامة (ليست متعلقة بالخدمة)
                "مجاني", "وظيفة", "وظائف", "تدريب", "دورة", "كورس", "تعليم",
                "فيديو", "صور", "pdf", "تحميل", "كتاب", "شرح", "كيف",
                
                # مجالات أخرى
                "سباكة", "نجارة", "دهان", "بناء", "حدادة",
                
                # محتوى غير مفيد
                "نكت", "العاب", "اغاني", "افلام", "رياضة"
            ],
            
            "سباكة": [
                "مجاني", "وظيفة", "وظائف", "تدريب", "دورة", "كورس",
                "كهرباء", "كهربائي", "نجارة", "دهان", "بناء",
                "فيديو", "صور", "pdf", "شرح", "كيف"
            ],
            
            "نقل اثاث": [
                "مجاني", "وظيفة", "وظائف", "تدريب",
                "بيع", "شراء", "للبيع", "مستعمل",
                "كهرباء", "سباكة", "دهان", "نجارة",
                "فيديو", "صور", "pdf"
            ],
            
            # يمكن إضافة المزيد من المجالات
        }
        
        # الكلمات السلبية العامة (تطبق على جميع المجالات)
        universal_negatives = [
            # مجاني
            "مجاني", "مجانا", "بالمجان", "free", "gratuit",
            
            # وظائف
            "وظيفة", "وظائف", "job", "jobs", "career", "توظيف",
            
            # تعليم
            "تدريب", "دورة", "كورس", "تعليم", "course", "training",
            
            # محتوى
            "فيديو", "صور", "pdf", "تحميل", "download",
            
            # معلومات
            "كيف", "طريقة", "شرح", "معلومات", "how to", "what is",
            
            # ترفيه
            "لعبة", "العاب", "نكت", "اغاني", "افلام", "game", "games",
            
            # مستعمل ورخيص
            "مستعمل", "رخيص", "used", "cheap",
            
            # منصات
            "wikipedia", "youtube", "facebook", "instagram"
        ]
        
        # دمج الكلمات
        negative_keywords = set(universal_negatives)
        
        # إضافة كلمات خاصة بالمجال
        domain_lower = business_domain.lower()
        for domain_key, domain_negatives in domain_specific_negatives.items():
            if domain_key in domain_lower:
                negative_keywords.update(domain_negatives)
                break
        
        # تحويل إلى قائمة
        return list(negative_keywords)
    
    def _filter_conflicting_keywords(self,
                                     negative_keywords: List[str],
                                     positive_keywords: List[str]) -> List[str]:
        """
        تصفية الكلمات السلبية لإزالة التضارب مع الكلمات الإيجابية
        """
        
        # تحويل الكلمات الإيجابية إلى lowercase للمقارنة
        positive_set = set([kw.lower() for kw in positive_keywords])
        
        # الكلمات الجذرية من الكلمات الإيجابية
        positive_roots = set()
        for kw in positive_keywords:
            # استخراج الكلمات الجذرية (أول 4 أحرف)
            if len(kw) >= 4:
                positive_roots.add(kw[:4].lower())
        
        filtered = []
        for neg_kw in negative_keywords:
            neg_kw_lower = neg_kw.lower()
            
            # تجاهل إذا كانت الكلمة موجودة في الكلمات الإيجابية
            if neg_kw_lower in positive_set:
                logger.warning(f"⚠️ تجاهل كلمة سلبية متضاربة: {neg_kw}")
                continue
            
            # تجاهل إذا كانت تحتوي على جذر من الكلمات الإيجابية
            has_conflict = False
            for pos_kw in positive_keywords:
                if len(pos_kw) >= 3 and len(neg_kw) >= 3:
                    # تحقق من التشابه
                    if pos_kw.lower() in neg_kw_lower or neg_kw_lower in pos_kw.lower():
                        logger.warning(f"⚠️ تجاهل كلمة سلبية متشابهة: {neg_kw} (تشبه: {pos_kw})")
                        has_conflict = True
                        break
            
            if not has_conflict:
                filtered.append(neg_kw)
        
        logger.info(f"🔍 تمت تصفية {len(negative_keywords) - len(filtered)} كلمة متضاربة")
        return filtered
    
    def _get_basic_negative_keywords(self) -> List[str]:
        """قائمة أساسية آمنة من الكلمات السلبية (كحل أخير)"""
        
        return [
            # مجاني فقط
            "مجاني", "مجانا", "free",
            
            # وظائف فقط
            "وظيفة", "وظائف", "job", "jobs",
            
            # تعليم فقط
            "تدريب", "دورة", "course",
            
            # محتوى فقط
            "فيديو", "pdf", "تحميل"
        ]


# مثال على الاستخدام
if __name__ == "__main__":
    import sys
    import codecs
    
    # إصلاح الترميز لـ Windows
    if sys.platform == 'win32':
        sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    
    generator = SmartNegativeKeywordsGenerator()
    
    # مثال: حملة كهرباء
    positive_keywords = [
        "كهربائي", "فني كهرباء", "صيانة كهرباء",
        "اصلاح كهرباء", "كهرباء منزلية"
    ]
    
    negative_keywords = generator.generate_negative_keywords(
        positive_keywords=positive_keywords,
        business_domain="صيانة كهرباء منزلية"
    )
    
    print("✅ الكلمات السلبية المولدة:")
    print(f"📊 العدد: {len(negative_keywords)} كلمة")
    print("\nالكلمات:")
    for kw in negative_keywords:
        print(f"  - {kw}")

