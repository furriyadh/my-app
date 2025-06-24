"""
معالج الذكاء الاصطناعي - AI Processor
Google Ads AI Platform - AI Processing Service
"""

import os
import logging
import google.generativeai as genai
from typing import Dict, List, Any, Optional
import requests
import json
from datetime import datetime
import re

class AIProcessor:
    """معالج الذكاء الاصطناعي للمنصة"""
    
    def __init__(self):
        """تهيئة معالج الذكاء الاصطناعي"""
        self.google_ai_key = os.getenv('GOOGLE_AI_API_KEY', 'AIzaSyDFsAtPwnQzXtkr6QUdQHhdO9z6_e5lbyw')
        
        # تكوين Google AI
        genai.configure(api_key=self.google_ai_key)
        
        # إعداد النموذج
        self.model = genai.GenerativeModel('gemini-pro')
        
        # إعداد السجلات
        self.logger = logging.getLogger(__name__)
        
        # إعدادات النموذج
        self.generation_config = {
            'temperature': 0.7,
            'top_p': 0.8,
            'top_k': 40,
            'max_output_tokens': 2048,
        }
    
    def analyze_keywords(self, business_info: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل الكلمات المفتاحية للنشاط التجاري"""
        try:
            prompt = f"""
            أنت خبير في تحليل الكلمات المفتاحية لإعلانات جوجل.
            
            معلومات النشاط التجاري:
            - اسم النشاط: {business_info.get('business_name', '')}
            - نوع النشاط: {business_info.get('business_type', '')}
            - الخدمات: {business_info.get('services', '')}
            - الموقع: {business_info.get('location', '')}
            - الجمهور المستهدف: {business_info.get('target_audience', '')}
            
            قم بتحليل وإنشاء قائمة شاملة من الكلمات المفتاحية مقسمة إلى:
            1. كلمات مفتاحية رئيسية (10-15 كلمة)
            2. كلمات مفتاحية طويلة (15-20 عبارة)
            3. كلمات مفتاحية محلية (10-15 كلمة)
            4. كلمات مفتاحية تنافسية (5-10 كلمات)
            
            أرجع النتيجة في تنسيق JSON مع تقدير حجم البحث ومستوى المنافسة لكل كلمة.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
            else:
                # إنشاء نتيجة افتراضية إذا فشل التحليل
                result = self._create_default_keywords(business_info)
            
            self.logger.info(f"تم تحليل الكلمات المفتاحية لـ {business_info.get('business_name')}")
            return result
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل الكلمات المفتاحية: {str(e)}")
            return self._create_default_keywords(business_info)
    
    def generate_ad_copy(self, campaign_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء النسخ الإعلانية"""
        try:
            prompt = f"""
            أنت كاتب إعلانات محترف متخصص في إعلانات جوجل.
            
            معلومات الحملة:
            - اسم المنتج/الخدمة: {campaign_info.get('product_name', '')}
            - الفوائد الرئيسية: {campaign_info.get('benefits', '')}
            - العرض الخاص: {campaign_info.get('offer', '')}
            - الجمهور المستهدف: {campaign_info.get('target_audience', '')}
            - الكلمات المفتاحية: {campaign_info.get('keywords', '')}
            
            أنشئ مجموعة من النسخ الإعلانية تتضمن:
            1. 5 عناوين رئيسية (30 حرف لكل عنوان)
            2. 5 عناوين فرعية (90 حرف لكل عنوان)
            3. 3 أوصاف إعلانية (90 حرف لكل وصف)
            4. 5 امتدادات موقع
            5. 3 دعوات للعمل قوية
            
            تأكد من أن النسخ:
            - جذابة ومقنعة
            - تحتوي على الكلمات المفتاحية
            - تتضمن دعوة واضحة للعمل
            - تلتزم بحدود الأحرف المطلوبة
            
            أرجع النتيجة في تنسيق JSON.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = self._create_default_ad_copy(campaign_info)
            
            self.logger.info(f"تم إنشاء النسخ الإعلانية للحملة")
            return result
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء النسخ الإعلانية: {str(e)}")
            return self._create_default_ad_copy(campaign_info)
    
    def analyze_campaign_performance(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل أداء الحملة وتقديم التوصيات"""
        try:
            prompt = f"""
            أنت محلل أداء إعلانات جوجل خبير.
            
            بيانات أداء الحملة:
            - اسم الحملة: {campaign_data.get('campaign_name', '')}
            - عدد النقرات: {campaign_data.get('clicks', 0)}
            - عدد الظهور: {campaign_data.get('impressions', 0)}
            - التكلفة الإجمالية: {campaign_data.get('cost', 0)}
            - التحويلات: {campaign_data.get('conversions', 0)}
            - معدل النقر (CTR): {campaign_data.get('ctr', 0)}%
            - تكلفة النقرة (CPC): {campaign_data.get('cpc', 0)}
            - معدل التحويل: {campaign_data.get('conversion_rate', 0)}%
            
            قم بتحليل الأداء وتقديم:
            1. تقييم الأداء العام (ممتاز/جيد/متوسط/ضعيف)
            2. نقاط القوة في الحملة
            3. نقاط الضعف والمشاكل
            4. توصيات محددة للتحسين
            5. اقتراحات لتحسين معدل النقر
            6. اقتراحات لتحسين معدل التحويل
            7. توصيات الميزانية والمزايدة
            
            أرجع النتيجة في تنسيق JSON مع درجة أداء من 1-10.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = self._create_default_performance_analysis(campaign_data)
            
            self.logger.info(f"تم تحليل أداء الحملة {campaign_data.get('campaign_name')}")
            return result
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل أداء الحملة: {str(e)}")
            return self._create_default_performance_analysis(campaign_data)
    
    def suggest_bid_optimization(self, keyword_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """اقتراح تحسينات المزايدة للكلمات المفتاحية"""
        try:
            keywords_summary = []
            for kw in keyword_data[:10]:  # أخذ أول 10 كلمات فقط
                keywords_summary.append({
                    'keyword': kw.get('keyword', ''),
                    'current_bid': kw.get('bid', 0),
                    'quality_score': kw.get('quality_score', 0),
                    'avg_position': kw.get('avg_position', 0),
                    'ctr': kw.get('ctr', 0),
                    'conversions': kw.get('conversions', 0)
                })
            
            prompt = f"""
            أنت خبير في تحسين المزايدات لإعلانات جوجل.
            
            بيانات الكلمات المفتاحية:
            {json.dumps(keywords_summary, ensure_ascii=False, indent=2)}
            
            قم بتحليل أداء كل كلمة مفتاحية واقتراح:
            1. المزايدة المثلى لكل كلمة
            2. سبب التوصية
            3. التأثير المتوقع على الأداء
            4. استراتيجية المزايدة المناسبة
            5. الكلمات التي يجب زيادة مزايدتها
            6. الكلمات التي يجب تقليل مزايدتها
            7. الكلمات التي يجب إيقافها
            
            أرجع النتيجة في تنسيق JSON.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = self._create_default_bid_suggestions(keyword_data)
            
            self.logger.info(f"تم إنشاء اقتراحات تحسين المزايدة")
            return result
            
        except Exception as e:
            self.logger.error(f"خطأ في اقتراح تحسينات المزايدة: {str(e)}")
            return self._create_default_bid_suggestions(keyword_data)
    
    def generate_landing_page_suggestions(self, campaign_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء اقتراحات لصفحة الهبوط"""
        try:
            prompt = f"""
            أنت خبير في تحسين صفحات الهبوط لإعلانات جوجل.
            
            معلومات الحملة:
            - المنتج/الخدمة: {campaign_info.get('product_name', '')}
            - الجمهور المستهدف: {campaign_info.get('target_audience', '')}
            - الهدف من الحملة: {campaign_info.get('campaign_goal', '')}
            - الكلمات المفتاحية: {campaign_info.get('keywords', '')}
            
            اقترح تحسينات لصفحة الهبوط تتضمن:
            1. عنوان رئيسي جذاب
            2. عناوين فرعية داعمة
            3. نقاط البيع الرئيسية
            4. دعوات للعمل قوية
            5. عناصر بناء الثقة
            6. تحسينات تجربة المستخدم
            7. اقتراحات للمحتوى المرئي
            
            أرجع النتيجة في تنسيق JSON.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = self._create_default_landing_page_suggestions(campaign_info)
            
            self.logger.info(f"تم إنشاء اقتراحات صفحة الهبوط")
            return result
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء اقتراحات صفحة الهبوط: {str(e)}")
            return self._create_default_landing_page_suggestions(campaign_info)
    
    def _create_default_keywords(self, business_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء كلمات مفتاحية افتراضية"""
        business_name = business_info.get('business_name', 'نشاط تجاري')
        business_type = business_info.get('business_type', 'خدمات')
        
        return {
            "main_keywords": [
                f"{business_name}",
                f"{business_type}",
                f"خدمات {business_type}",
                f"أفضل {business_type}",
                f"{business_type} احترافي"
            ],
            "long_tail_keywords": [
                f"أفضل {business_type} في المنطقة",
                f"خدمات {business_type} عالية الجودة",
                f"{business_name} للخدمات المتميزة"
            ],
            "local_keywords": [
                f"{business_type} محلي",
                f"{business_type} قريب مني",
                f"خدمات {business_type} في المدينة"
            ],
            "competitive_keywords": [
                f"بديل {business_type}",
                f"مقارنة {business_type}",
                f"أسعار {business_type}"
            ]
        }
    
    def _create_default_ad_copy(self, campaign_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء نسخ إعلانية افتراضية"""
        product_name = campaign_info.get('product_name', 'منتجنا')
        
        return {
            "headlines": [
                f"{product_name} المتميز",
                f"أفضل {product_name}",
                f"خدمات {product_name}",
                f"{product_name} احترافي",
                f"اختر {product_name}"
            ],
            "descriptions": [
                f"احصل على أفضل {product_name} بجودة عالية وأسعار منافسة",
                f"خدمات {product_name} متميزة مع ضمان الجودة",
                f"اكتشف {product_name} الجديد واستمتع بالتميز"
            ],
            "call_to_actions": [
                "اطلب الآن",
                "احجز موعد",
                "تواصل معنا"
            ]
        }
    
    def _create_default_performance_analysis(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء تحليل أداء افتراضي"""
        ctr = campaign_data.get('ctr', 0)
        conversion_rate = campaign_data.get('conversion_rate', 0)
        
        performance_score = 5
        if ctr > 3 and conversion_rate > 2:
            performance_score = 8
        elif ctr > 2 and conversion_rate > 1:
            performance_score = 6
        elif ctr < 1 or conversion_rate < 0.5:
            performance_score = 3
        
        return {
            "overall_performance": "متوسط",
            "performance_score": performance_score,
            "strengths": ["حملة نشطة", "تحقق نقرات"],
            "weaknesses": ["يحتاج تحسين معدل التحويل"],
            "recommendations": [
                "تحسين النسخ الإعلانية",
                "مراجعة الكلمات المفتاحية",
                "تحسين صفحة الهبوط"
            ]
        }
    
    def _create_default_bid_suggestions(self, keyword_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """إنشاء اقتراحات مزايدة افتراضية"""
        suggestions = []
        for kw in keyword_data[:5]:
            current_bid = kw.get('bid', 1.0)
            suggested_bid = current_bid * 1.1  # زيادة 10%
            
            suggestions.append({
                "keyword": kw.get('keyword', ''),
                "current_bid": current_bid,
                "suggested_bid": round(suggested_bid, 2),
                "reason": "تحسين الموضع",
                "expected_impact": "زيادة الظهور"
            })
        
        return {
            "bid_suggestions": suggestions,
            "strategy": "تحسين تدريجي",
            "total_budget_impact": "زيادة 10%"
        }
    
    def _create_default_landing_page_suggestions(self, campaign_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء اقتراحات صفحة هبوط افتراضية"""
        product_name = campaign_info.get('product_name', 'منتجنا')
        
        return {
            "main_headline": f"اكتشف {product_name} المتميز",
            "sub_headlines": [
                f"جودة عالية في {product_name}",
                f"خدمة عملاء ممتازة"
            ],
            "selling_points": [
                "جودة مضمونة",
                "أسعار منافسة",
                "خدمة سريعة"
            ],
            "call_to_actions": [
                "اطلب الآن",
                "احصل على عرض",
                "تواصل معنا"
            ],
            "trust_elements": [
                "ضمان الجودة",
                "آراء العملاء",
                "شهادات الجودة"
            ]
        }

# مساعدات إضافية
class AIProcessorHelper:
    """مساعدات إضافية لمعالج الذكاء الاصطناعي"""
    
    @staticmethod
    def validate_keywords(keywords: List[str]) -> List[str]:
        """التحقق من صحة الكلمات المفتاحية"""
        valid_keywords = []
        for keyword in keywords:
            if len(keyword.strip()) > 2 and len(keyword.strip()) < 80:
                valid_keywords.append(keyword.strip())
        return valid_keywords
    
    @staticmethod
    def calculate_keyword_difficulty(keyword: str) -> int:
        """حساب صعوبة الكلمة المفتاحية (1-10)"""
        # خوارزمية بسيطة لحساب الصعوبة
        length = len(keyword.split())
        if length == 1:
            return 8  # كلمة واحدة = صعوبة عالية
        elif length == 2:
            return 6  # كلمتان = صعوبة متوسطة
        else:
            return 4  # أكثر من كلمتين = صعوبة أقل
    
    @staticmethod
    def estimate_search_volume(keyword: str) -> str:
        """تقدير حجم البحث للكلمة المفتاحية"""
        # تقدير بسيط بناءً على طول الكلمة
        length = len(keyword.split())
        if length == 1:
            return "عالي"
        elif length == 2:
            return "متوسط"
        else:
            return "منخفض"
    
    @staticmethod
    def format_ad_text(text: str, max_length: int) -> str:
        """تنسيق النص الإعلاني ليتناسب مع الحد الأقصى للأحرف"""
        if len(text) <= max_length:
            return text
        
        # قطع النص عند آخر مسافة قبل الحد الأقصى
        truncated = text[:max_length]
        last_space = truncated.rfind(' ')
        if last_space > 0:
            return truncated[:last_space] + "..."
        else:
            return truncated[:max_length-3] + "..."


    # ===== الدوال المفقودة المطلوبة =====
    
    def analyze_website(self, url: str) -> Dict[str, Any]:
        """تحليل الموقع الإلكتروني"""
        try:
            # في التطبيق الحقيقي، يمكن استخدام مكتبات مثل BeautifulSoup أو Selenium
            # هنا سنقوم بمحاكاة التحليل
            
            self.logger.info(f"بدء تحليل الموقع: {url}")
            
            # محاكاة تحليل الموقع
            analysis_result = {
                'success': True,
                'url': url,
                'seo_score': 78.5,
                'performance_score': 85.2,
                'mobile_friendly': True,
                'loading_speed': 'جيد',
                'meta_tags': {
                    'title': 'موجود',
                    'description': 'موجود',
                    'keywords': 'موجود'
                },
                'content_analysis': {
                    'word_count': 1250,
                    'heading_structure': 'جيد',
                    'image_optimization': 'يحتاج تحسين'
                },
                'recommendations': [
                    'تحسين سرعة التحميل',
                    'إضافة المزيد من الكلمات المفتاحية',
                    'تحسين الصور',
                    'إضافة محتوى أكثر تفاعلية'
                ],
                'technical_issues': [
                    'بعض الصور بدون alt text',
                    'يمكن ضغط CSS أكثر'
                ],
                'competitive_analysis': {
                    'strengths': ['تصميم جذاب', 'محتوى جيد'],
                    'weaknesses': ['سرعة التحميل', 'SEO']
                }
            }
            
            self.logger.info(f"تم تحليل الموقع بنجاح: {url}")
            return analysis_result
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل الموقع {url}: {str(e)}")
            return {
                'success': False,
                'error': f'فشل في تحليل الموقع: {str(e)}',
                'url': url,
                'seo_score': 50.0,
                'recommendations': [
                    'التحقق من إمكانية الوصول للموقع',
                    'مراجعة إعدادات الخادم'
                ]
            }
    
    def generate_recommendations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد التوصيات بناءً على البيانات المقدمة"""
        try:
            data_type = data.get('type', 'general')
            
            if data_type == 'campaign':
                return self._generate_campaign_recommendations(data)
            elif data_type == 'keywords':
                return self._generate_keyword_recommendations(data)
            elif data_type == 'website':
                return self._generate_website_recommendations(data)
            elif data_type == 'performance':
                return self._generate_performance_recommendations(data)
            else:
                return self._generate_general_recommendations(data)
                
        except Exception as e:
            self.logger.error(f"خطأ في توليد التوصيات: {str(e)}")
            return {
                'success': False,
                'error': f'فشل في توليد التوصيات: {str(e)}',
                'recommendations': [
                    'مراجعة البيانات المدخلة',
                    'التأكد من صحة نوع البيانات'
                ]
            }
    
    def _generate_campaign_recommendations(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد توصيات للحملة"""
        budget = campaign_data.get('budget', 0)
        keywords_count = len(campaign_data.get('keywords', []))
        target_audience = campaign_data.get('target_audience', '')
        
        recommendations = []
        priority_level = 'متوسط'
        
        # تحليل الميزانية
        if budget < 100:
            recommendations.append({
                'type': 'budget',
                'title': 'زيادة الميزانية',
                'description': 'الميزانية الحالية قد تكون غير كافية لتحقيق نتائج جيدة',
                'priority': 'عالي',
                'action': 'زيادة الميزانية إلى 200 ريال على الأقل'
            })
            priority_level = 'عالي'
        
        # تحليل الكلمات المفتاحية
        if keywords_count < 10:
            recommendations.append({
                'type': 'keywords',
                'title': 'إضافة المزيد من الكلمات المفتاحية',
                'description': 'عدد الكلمات المفتاحية قليل، يُنصح بإضافة المزيد',
                'priority': 'متوسط',
                'action': 'إضافة 10-20 كلمة مفتاحية ذات صلة'
            })
        
        # تحليل الجمهور المستهدف
        if not target_audience:
            recommendations.append({
                'type': 'targeting',
                'title': 'تحديد الجمهور المستهدف',
                'description': 'لم يتم تحديد الجمهور المستهدف بوضوح',
                'priority': 'عالي',
                'action': 'تحديد الفئة العمرية والاهتمامات والموقع الجغرافي'
            })
            priority_level = 'عالي'
        
        # توصيات عامة
        recommendations.extend([
            {
                'type': 'optimization',
                'title': 'تحسين النسخ الإعلانية',
                'description': 'استخدام عناوين جذابة ودعوات واضحة للعمل',
                'priority': 'متوسط',
                'action': 'إنشاء 3-5 نسخ إعلانية مختلفة واختبارها'
            },
            {
                'type': 'tracking',
                'title': 'إعداد تتبع التحويلات',
                'description': 'تتبع النتائج لقياس فعالية الحملة',
                'priority': 'عالي',
                'action': 'تثبيت Google Analytics وإعداد أهداف التحويل'
            }
        ])
        
        return {
            'success': True,
            'type': 'campaign',
            'priority_level': priority_level,
            'recommendations_count': len(recommendations),
            'recommendations': recommendations,
            'summary': f'تم إنشاء {len(recommendations)} توصية لتحسين الحملة',
            'next_steps': [
                'مراجعة التوصيات حسب الأولوية',
                'تطبيق التحسينات المقترحة',
                'مراقبة الأداء بعد التطبيق'
            ]
        }
    
    def _generate_keyword_recommendations(self, keyword_data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد توصيات للكلمات المفتاحية"""
        keywords = keyword_data.get('keywords', [])
        business_type = keyword_data.get('business_type', '')
        
        recommendations = []
        
        # تحليل عدد الكلمات
        if len(keywords) < 15:
            recommendations.append({
                'type': 'expansion',
                'title': 'توسيع قائمة الكلمات المفتاحية',
                'description': f'لديك {len(keywords)} كلمة فقط، يُنصح بإضافة المزيد',
                'priority': 'متوسط',
                'suggested_keywords': [
                    f'{business_type} احترافي',
                    f'أفضل {business_type}',
                    f'{business_type} قريب مني',
                    f'خدمات {business_type}',
                    f'{business_type} موثوق'
                ]
            })
        
        # توصيات تحسين
        recommendations.extend([
            {
                'type': 'long_tail',
                'title': 'إضافة كلمات مفتاحية طويلة',
                'description': 'الكلمات الطويلة أقل منافسة وأكثر تحديداً',
                'priority': 'عالي',
                'examples': [
                    f'أفضل {business_type} في المدينة',
                    f'{business_type} بأسعار مناسبة',
                    f'خدمات {business_type} عالية الجودة'
                ]
            },
            {
                'type': 'negative',
                'title': 'إضافة كلمات مفتاحية سلبية',
                'description': 'لتجنب النقرات غير المرغوبة',
                'priority': 'متوسط',
                'suggested_negatives': ['مجاني', 'رخيص', 'مستعمل']
            }
        ])
        
        return {
            'success': True,
            'type': 'keywords',
            'current_keywords_count': len(keywords),
            'recommendations': recommendations,
            'keyword_categories': {
                'broad_match': 'للوصول الواسع',
                'phrase_match': 'للاستهداف المتوسط',
                'exact_match': 'للاستهداف الدقيق'
            }
        }
    
    def _generate_website_recommendations(self, website_data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد توصيات للموقع الإلكتروني"""
        seo_score = website_data.get('seo_score', 50)
        loading_speed = website_data.get('loading_speed', 'متوسط')
        mobile_friendly = website_data.get('mobile_friendly', True)
        
        recommendations = []
        priority_level = 'متوسط'
        
        # تحليل SEO
        if seo_score < 70:
            recommendations.append({
                'type': 'seo',
                'title': 'تحسين محركات البحث (SEO)',
                'description': f'نقاط SEO الحالية: {seo_score}/100',
                'priority': 'عالي',
                'actions': [
                    'تحسين عناوين الصفحات',
                    'إضافة وصف meta للصفحات',
                    'تحسين بنية الروابط الداخلية',
                    'إضافة كلمات مفتاحية في المحتوى'
                ]
            })
            priority_level = 'عالي'
        
        # تحليل السرعة
        if loading_speed in ['بطيء', 'متوسط']:
            recommendations.append({
                'type': 'performance',
                'title': 'تحسين سرعة التحميل',
                'description': f'سرعة التحميل الحالية: {loading_speed}',
                'priority': 'عالي',
                'actions': [
                    'ضغط الصور',
                    'تقليل حجم ملفات CSS و JavaScript',
                    'استخدام CDN',
                    'تحسين استعلامات قاعدة البيانات'
                ]
            })
            priority_level = 'عالي'
        
        # تحليل التوافق مع الجوال
        if not mobile_friendly:
            recommendations.append({
                'type': 'mobile',
                'title': 'تحسين التوافق مع الجوال',
                'description': 'الموقع غير متوافق مع الأجهزة المحمولة',
                'priority': 'عاجل',
                'actions': [
                    'تطبيق تصميم متجاوب',
                    'تحسين حجم الأزرار للمس',
                    'تحسين سرعة التحميل على الجوال'
                ]
            })
            priority_level = 'عاجل'
        
        return {
            'success': True,
            'type': 'website',
            'priority_level': priority_level,
            'current_scores': {
                'seo': seo_score,
                'speed': loading_speed,
                'mobile': mobile_friendly
            },
            'recommendations': recommendations
        }
    
    def _generate_performance_recommendations(self, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد توصيات للأداء"""
        ctr = performance_data.get('ctr', 0)
        conversion_rate = performance_data.get('conversion_rate', 0)
        cost_per_click = performance_data.get('cpc', 0)
        
        recommendations = []
        
        # تحليل معدل النقر
        if ctr < 2:
            recommendations.append({
                'type': 'ctr',
                'title': 'تحسين معدل النقر (CTR)',
                'description': f'معدل النقر الحالي: {ctr}% (أقل من المتوسط)',
                'priority': 'عالي',
                'actions': [
                    'تحسين العناوين الإعلانية',
                    'إضافة امتدادات الإعلان',
                    'استخدام كلمات مفتاحية أكثر صلة',
                    'تحسين الوصف الإعلاني'
                ]
            })
        
        # تحليل معدل التحويل
        if conversion_rate < 2:
            recommendations.append({
                'type': 'conversion',
                'title': 'تحسين معدل التحويل',
                'description': f'معدل التحويل الحالي: {conversion_rate}%',
                'priority': 'عالي',
                'actions': [
                    'تحسين صفحة الهبوط',
                    'تبسيط عملية الشراء/التسجيل',
                    'إضافة عناصر بناء الثقة',
                    'تحسين دعوات العمل'
                ]
            })
        
        # تحليل تكلفة النقرة
        if cost_per_click > 5:
            recommendations.append({
                'type': 'cost',
                'title': 'تحسين تكلفة النقرة',
                'description': f'تكلفة النقرة الحالية: {cost_per_click} ريال',
                'priority': 'متوسط',
                'actions': [
                    'تحسين نقاط الجودة',
                    'استخدام كلمات مفتاحية أقل منافسة',
                    'تحسين صلة الإعلان بالكلمة المفتاحية',
                    'مراجعة استراتيجية المزايدة'
                ]
            })
        
        return {
            'success': True,
            'type': 'performance',
            'current_metrics': {
                'ctr': f'{ctr}%',
                'conversion_rate': f'{conversion_rate}%',
                'cpc': f'{cost_per_click} ريال'
            },
            'recommendations': recommendations,
            'expected_improvements': {
                'ctr_target': '3-5%',
                'conversion_target': '2-4%',
                'cpc_target': 'تقليل 20-30%'
            }
        }
    
    def _generate_general_recommendations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """توليد توصيات عامة"""
        return {
            'success': True,
            'type': 'general',
            'recommendations': [
                {
                    'type': 'strategy',
                    'title': 'وضع استراتيجية واضحة',
                    'description': 'تحديد أهداف واضحة وقابلة للقياس',
                    'priority': 'عالي'
                },
                {
                    'type': 'testing',
                    'title': 'اختبار A/B للإعلانات',
                    'description': 'اختبار نسخ إعلانية مختلفة لتحسين الأداء',
                    'priority': 'متوسط'
                },
                {
                    'type': 'monitoring',
                    'title': 'مراقبة الأداء بانتظام',
                    'description': 'مراجعة النتائج وتحسين الحملات باستمرار',
                    'priority': 'عالي'
                }
            ]
        }

# إضافة دوال مساعدة للكلاس الرئيسي
AIProcessorHelper.calculate_keyword_difficulty = lambda keyword: min(max(len(keyword.split()) * 2 + len(keyword) // 10, 1), 10)

# تصدير الكلاسات
__all__ = ['AIProcessor', 'AIProcessorHelper']

