"""
AI Campaign Selector - اختيار نوع الحملة بالذكاء الاصطناعي
Google Ads AI Platform - Intelligent Campaign Type Selection
"""

import os
import logging
import google.generativeai as genai
from typing import Dict, List, Any, Optional
import json
import re
from datetime import datetime
from .real_ai_processor import RealAIProcessor
from .website_analyzer import WebsiteAnalyzer
from .keyword_planner_service import KeywordPlannerService
import os
import re

class AICampaignSelector:
    """نظام اختيار نوع الحملة بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة نظام اختيار الحملة"""
        self.logger = logging.getLogger(__name__)
        self.ai_processor = RealAIProcessor()
        self.website_analyzer = WebsiteAnalyzer()
        self.keyword_planner = KeywordPlannerService()
        
        # أنواع الحملات المدعومة
        self.campaign_types = {
            'SEARCH': {
                'name': 'Search',
                'description': 'إعلانات نصية في نتائج البحث',
                'best_for': ['خدمات', 'منتجات', 'معلومات', 'محلي'],
                'goals': ['زيارات الموقع', 'مكالمات', 'تحويلات'],
                'keywords_required': True,
                'budget_min': 100
            },
            'DISPLAY': {
                'name': 'Display',
                'description': 'إعلانات بصرية على المواقع',
                'best_for': ['علامة تجارية', 'وعي', 'إعادة استهداف'],
                'goals': ['وعي العلامة التجارية', 'زيارات الموقع'],
                'keywords_required': False,
                'budget_min': 200
            },
            'SHOPPING': {
                'name': 'Shopping',
                'description': 'إعلانات منتجات مع الصور والأسعار',
                'best_for': ['متاجر إلكترونية', 'منتجات مادية'],
                'goals': ['مبيعات', 'تحويلات'],
                'keywords_required': False,
                'budget_min': 300
            },
            'VIDEO': {
                'name': 'Video',
                'description': 'إعلانات فيديو على YouTube',
                'best_for': ['ترفيه', 'تعليم', 'علامة تجارية'],
                'goals': ['مشاهدات', 'وعي', 'تحويلات'],
                'keywords_required': False,
                'budget_min': 500
            },
            'APP': {
                'name': 'App',
                'description': 'ترويج تطبيقات الهاتف المحمول',
                'best_for': ['تطبيقات', 'ألعاب', 'خدمات رقمية'],
                'goals': ['تحميلات', 'تثبيتات'],
                'keywords_required': False,
                'budget_min': 200
            },
            'PERFORMANCE_MAX': {
                'name': 'Performance Max',
                'description': 'حملات ذكية عبر جميع منصات Google',
                'best_for': ['تحويلات', 'مبيعات', 'عملاء جدد'],
                'goals': ['تحويلات', 'مبيعات', 'عملاء جدد'],
                'keywords_required': False,
                'budget_min': None  # سيتم تحديدها حسب اختيار العميل
            },
            'CALL_ADS': {
                'name': 'Call Ads',
                'description': 'إعلانات تهدف للحصول على مكالمات',
                'best_for': ['خدمات محلية', 'استشارات', 'مبيعات'],
                'goals': ['مكالمات', 'استفسارات'],
                'keywords_required': True,
                'budget_min': 150
            }
        }
        
        self.logger.info("تم تهيئة نظام اختيار الحملة بالذكاء الاصطناعي")
    
    def suggest_campaign_type(self, website_url: str, business_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """اقتراح نوع الحملة بناءً على تحليل الموقع والمعلومات"""
        try:
            self.logger.info(f"بدء تحليل الموقع لاقتراح نوع الحملة: {website_url}")
            
            # تحليل الموقع
            website_analysis = self.website_analyzer.analyze_website(website_url)
            if not website_analysis:
                return {
                    'success': False,
                    'error': 'فشل في تحليل الموقع',
                    'message': 'تعذر تحليل الموقع لاقتراح نوع الحملة'
                }
            
            # التأكد من أن website_analysis هو قاموس
            if not isinstance(website_analysis, dict):
                website_analysis = {'success': True, 'analysis': {}}
            
            if not website_analysis.get('success', False):
                return {
                    'success': False,
                    'error': 'فشل في تحليل الموقع',
                    'message': 'تعذر تحليل الموقع لاقتراح نوع الحملة'
                }
            
            # استخراج معلومات الأعمال من الموقع
            if isinstance(website_analysis, dict):
                analysis_data = website_analysis.get('analysis', {})
                if isinstance(analysis_data, list):
                    analysis_data = {}
                elif not isinstance(analysis_data, dict):
                    analysis_data = {}
            else:
                analysis_data = {}
            
            business_analysis = analysis_data.get('business_analysis', {})
            if not isinstance(business_analysis, dict):
                business_analysis = {}
            
            # دمج معلومات الأعمال
            if business_info and isinstance(business_info, dict):
                business_analysis.update(business_info)
            
            # تحليل نوع الأعمال
            business_type = business_analysis.get('business_type', 'عام')
            
            # تحليل المحتوى والخدمات
            services = business_analysis.get('services', [])
            products = business_analysis.get('products', [])
            
            # تحليل الكلمات المفتاحية
            if isinstance(analysis_data, dict):
                keywords_analysis = analysis_data.get('keywords_suggestions', {})
            else:
                keywords_analysis = {}
            
            # استخدام KeywordPlannerService لتحسين اختيار نوع الحملة
            if hasattr(self, 'keyword_planner') and self.keyword_planner:
                try:
                    # تحليل الكلمات المفتاحية من الموقع
                    customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
                    if customer_id and website_url:
                        # استخدام الدالة الرئيسية لاستخراج الكلمات
                        keywords_result = self.keyword_planner.main_generate_keyword_ideas(
                            customer_id=customer_id,
                            location_ids=['2682'],  # السعودية
                            language_id='1019',  # العربية
                            keyword_texts=[],
                            page_url=website_url
                        )
                        
                        if keywords_result['success']:
                            keywords = keywords_result['keywords']
                            # تحليل نوع الحملة بناءً على الكلمات المفتاحية
                            campaign_type = self._analyze_campaign_type_from_keywords(keywords)
                            if campaign_type:
                                self.logger.info(f"🎯 تم تحديد نوع الحملة من الكلمات المفتاحية: {campaign_type}")
                                return {
                                    'success': True,
                                    'suggested_campaign_type': campaign_type,
                                    'confidence_score': 95,
                                    'reasoning': 'تم تحديد نوع الحملة بناءً على تحليل الكلمات المفتاحية من الموقع',
                                    'analysis_summary': f'تم استخراج {len(keywords)} كلمة مفتاحية من الموقع'
                                }
                except Exception as e:
                    self.logger.warning(f"⚠️ فشل في تحليل الكلمات المفتاحية: {e}")
            
            # استخدام الذكاء الاصطناعي لاقتراح نوع الحملة
            ai_suggestion = self._get_ai_campaign_suggestion(
                analysis_data,
                business_analysis,
                keywords_analysis
            )
            
            # تحليل المنافسة
            competitive_analysis = self._analyze_competitive_landscape(
                business_type, services, products
            )
            
            # حساب نقاط كل نوع حملة
            campaign_scores = self._calculate_campaign_scores(
                business_analysis,
                keywords_analysis,
                competitive_analysis,
                ai_suggestion
            )
            
            # ترتيب أنواع الحملات حسب النقاط
            ranked_campaigns = self._rank_campaigns(campaign_scores)
            
            # إنشاء التوصية النهائية
            recommendation = self._create_final_recommendation(
                ranked_campaigns,
                business_analysis,
                website_analysis['analysis']
            )
            
            return {
                'success': True,
                'suggested_campaign_type': recommendation['campaign_type'],
                'website_url': website_url,
                'business_analysis': business_analysis,
                'ai_suggestion': ai_suggestion,
                'campaign_scores': campaign_scores,
                'ranked_campaigns': ranked_campaigns,
                'recommendation': recommendation,
                'competitive_analysis': competitive_analysis,
                'confidence_score': recommendation['confidence_score'],
                'reasoning': recommendation['reasoning'],
                'timestamp': datetime.now().isoformat(),
                'message': 'تم اقتراح نوع الحملة بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في اقتراح نوع الحملة: {str(e)}")
            # إرجاع اقتراح افتراضي آمن بدلاً من فشل
            return {
                'success': True,
                'suggested_campaign_type': 'SEARCH',
                'reasoning': 'تم اختيار حملة البحث كخيار افتراضي آمن',
                'confidence_score': 85,
                'analysis_summary': 'تحليل افتراضي بسبب خطأ في الذكاء الاصطناعي',
                'alternative_campaigns': ['DISPLAY', 'PERFORMANCE_MAX'],
                'recommendations': [
                    'مراجعة إعدادات الذكاء الاصطناعي',
                    'اختبار أنواع حملات مختلفة',
                    'مراقبة الأداء وتعديل الاستراتيجية'
                ],
                'message': 'تم اقتراح نوع الحملة بنجاح (افتراضي)'
            }
    
    def _get_ai_campaign_suggestion(self, website_analysis: Dict[str, Any], 
                                  business_analysis: Dict[str, Any],
                                  keywords_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """استخدام الذكاء الاصطناعي لاقتراح نوع الحملة"""
        try:
            # التأكد من أن website_analysis هو قاموس
            if not isinstance(website_analysis, dict):
                website_analysis = {}
            
            # التأكد من أن business_analysis هو قاموس
            if not isinstance(business_analysis, dict):
                business_analysis = {}
            
            # التأكد من أن keywords_analysis هو قاموس
            if not isinstance(keywords_analysis, dict):
                keywords_analysis = {}
            
            # إعداد البيانات للذكاء الاصطناعي
            basic_info = website_analysis.get('basic_info', {}) if isinstance(website_analysis.get('basic_info'), dict) else {}
            content_analysis = website_analysis.get('content_analysis', {}) if isinstance(website_analysis.get('content_analysis'), dict) else {}
            seo_analysis = website_analysis.get('seo_analysis', {}) if isinstance(website_analysis.get('seo_analysis'), dict) else {}
            
            analysis_data = {
                'website_info': {
                    'title': basic_info.get('title', ''),
                    'description': basic_info.get('description', ''),
                    'business_type': business_analysis.get('business_type', ''),
                    'services': business_analysis.get('services', []),
                    'products': business_analysis.get('products', []),
                    'contact_info': business_analysis.get('contact_info', {})
                },
                'content_analysis': {
                    'word_count': content_analysis.get('word_count', 0),
                    'keyword_density': content_analysis.get('keyword_density', {}),
                    'content_structure': content_analysis.get('content_structure', {})
                },
                'seo_analysis': {
                    'seo_score': seo_analysis.get('seo_score', 0),
                    'meta_tags': seo_analysis.get('meta_tags', {}),
                    'headings': seo_analysis.get('headings', {})
                },
                'keywords': {
                    'primary': keywords_analysis.get('primary', []),
                    'secondary': keywords_analysis.get('secondary', []),
                    'long_tail': keywords_analysis.get('long_tail', [])
                }
            }
            
            # إعداد البيانات للـ prompt
            services_list = analysis_data.get('website_info', {}).get('services', []) or []
            products_list = analysis_data.get('website_info', {}).get('products', []) or []
            primary_keywords = analysis_data.get('keywords', {}).get('primary', []) or []
            
            # التحقق من صحة البيانات قبل الاستخدام
            if not isinstance(services_list, list):
                services_list = []
            if not isinstance(products_list, list):
                products_list = []
            if not isinstance(primary_keywords, list):
                primary_keywords = []
            
            services_text = ', '.join(services_list[:5]) if services_list and len(services_list) > 0 else 'غير متوفر'
            products_text = ', '.join(products_list[:5]) if products_list and len(products_list) > 0 else 'غير متوفر'
            keywords_text = ', '.join(primary_keywords[:10]) if primary_keywords and len(primary_keywords) > 0 else 'غير متوفر'
            
            # إنشاء prompt للذكاء الاصطناعي
            prompt = f"""
            أنت خبير في إعلانات Google Ads ومحلل استراتيجي.
            
            قم بتحليل المعلومات التالية واقترح أفضل نوع حملة إعلانية:
            
            معلومات الموقع والأعمال:
            - نوع الأعمال: {analysis_data.get('website_info', {}).get('business_type', '')}
            - الخدمات: {services_text}
            - المنتجات: {products_text}
            - عنوان الموقع: {analysis_data.get('website_info', {}).get('title', '')}
            - وصف الموقع: {analysis_data.get('website_info', {}).get('description', '')}
            
            تحليل المحتوى:
            - عدد الكلمات: {analysis_data.get('content_analysis', {}).get('word_count', 0)}
            - نقاط SEO: {analysis_data.get('seo_analysis', {}).get('seo_score', 0)}
            - الكلمات المفتاحية الرئيسية: {keywords_text}
            
            أنواع الحملات المتاحة:
            1. SEARCH - إعلانات نصية في نتائج البحث (أفضل للخدمات والمنتجات المحلية)
            2. DISPLAY - إعلانات بصرية على المواقع (أفضل للوعي والعلامة التجارية)
            3. SHOPPING - إعلانات منتجات مع الصور (أفضل للمتاجر الإلكترونية)
            4. VIDEO - إعلانات فيديو على YouTube (أفضل للترفيه والتعليم)
            5. APP - ترويج التطبيقات (أفضل للتطبيقات والألعاب)
            6. PERFORMANCE_MAX - حملات ذكية شاملة (أفضل للتحويلات والمبيعات)
            7. CALL_ADS - إعلانات للمكالمات (أفضل للخدمات المحلية)
            
            قم بتحليل المعلومات واقترح:
            1. أفضل نوع حملة (مع سبب الاختيار)
            2. نوع حملة ثانوي (كبديل)
            3. نوع حملة ثالث (للمستقبل)
            4. نقاط القوة لكل نوع
            5. نقاط الضعف المحتملة
            6. التوصيات الإضافية
            
            أرجع النتيجة في تنسيق JSON مع التفاصيل التالية:
            - primary_campaign: النوع الأساسي المقترح
            - secondary_campaign: النوع الثانوي
            - tertiary_campaign: النوع الثالث
            - reasoning: سبب الاختيار
            - strengths: نقاط القوة
            - weaknesses: نقاط الضعف
            - recommendations: توصيات إضافية
            - confidence_score: درجة الثقة (1-100)
            """
            
            # استخدام الذكاء الاصطناعي
            if hasattr(self.ai_processor, 'model') and self.ai_processor.model:
                response = self.ai_processor.model.generate_content(prompt)
            else:
                # استخدام الرد الافتراضي إذا لم يكن النموذج متوفراً
                return self._create_default_ai_suggestion(analysis_data)
            
            # تنظيف النص واستخراج JSON
            result_text = response.text
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            
            if json_match:
                ai_result = json.loads(json_match.group())
            else:
                # إنشاء نتيجة افتراضية
                safe_analysis_data = analysis_data if isinstance(analysis_data, dict) else {}
                ai_result = self._create_default_ai_suggestion(safe_analysis_data)
            
            return ai_result
            
        except Exception as e:
            self.logger.error(f"خطأ في الذكاء الاصطناعي: {str(e)}")
            # إنشاء analysis_data افتراضي في حالة الخطأ
            default_analysis_data = {
                'website_info': {'title': '', 'description': '', 'business_type': 'عام'},
                'content_analysis': {'word_count': 0},
                'seo_analysis': {'seo_score': 0}
            }
            return self._create_default_ai_suggestion(default_analysis_data)
    
    def _analyze_competitive_landscape(self, business_type: str, services: List[str], 
                                     products: List[str]) -> Dict[str, Any]:
        """تحليل المنافسة في السوق"""
        competitive_analysis = {
            'market_saturation': 'متوسط',
            'competition_level': 'متوسط',
            'opportunity_score': 70,
            'recommended_strategy': 'متوازن',
            'market_insights': []
        }
        
        # تحليل نوع الأعمال
        if business_type in ['متجر إلكتروني', 'تجارة إلكترونية']:
            competitive_analysis.update({
                'market_saturation': 'عالي',
                'competition_level': 'عالي',
                'opportunity_score': 60,
                'recommended_strategy': 'متخصص',
                'market_insights': [
                    'السوق مشبع بالمتاجر الإلكترونية',
                    'التركيز على منتجات متخصصة',
                    'استخدام Shopping Ads ضروري'
                ]
            })
        elif business_type in ['خدمات', 'استشارات']:
            competitive_analysis.update({
                'market_saturation': 'متوسط',
                'competition_level': 'متوسط',
                'opportunity_score': 80,
                'recommended_strategy': 'محلي',
                'market_insights': [
                    'فرص جيدة للخدمات المحلية',
                    'Search Ads فعالة للخدمات',
                    'Call Ads مفيدة للاستفسارات'
                ]
            })
        elif business_type in ['مطعم', 'طعام']:
            competitive_analysis.update({
                'market_saturation': 'عالي',
                'competition_level': 'عالي',
                'opportunity_score': 65,
                'recommended_strategy': 'محلي + جودة',
                'market_insights': [
                    'منافسة عالية في قطاع الطعام',
                    'التركيز على الموقع المحلي',
                    'Display Ads للوعي + Search للطلبات'
                ]
            })
        
        return competitive_analysis
    
    def _calculate_campaign_scores(self, business_analysis: Dict[str, Any],
                                 keywords_analysis: Dict[str, Any],
                                 competitive_analysis: Dict[str, Any],
                                 ai_suggestion: Dict[str, Any]) -> Dict[str, int]:
        """حساب نقاط كل نوع حملة"""
        scores = {}
        
        business_type = business_analysis.get('business_type', 'عام')
        services = business_analysis.get('services', [])
        products = business_analysis.get('products', [])
        contact_info = business_analysis.get('contact_info', {})
        
        # حساب نقاط SEARCH
        search_score = 50
        if business_type in ['خدمات', 'استشارات', 'طبي', 'تعليمي']:
            search_score += 30
        if keywords_analysis.get('primary'):
            search_score += 20
        if contact_info.get('phone'):
            search_score += 10
        scores['SEARCH'] = min(search_score, 100)
        
        # حساب نقاط DISPLAY
        display_score = 40
        if business_type in ['علامة تجارية', 'ترفيه', 'تعليمي']:
            display_score += 25
        if len(services) > 3:
            display_score += 15
        if competitive_analysis['market_saturation'] == 'عالي':
            display_score += 10
        scores['DISPLAY'] = min(display_score, 100)
        
        # حساب نقاط SHOPPING
        shopping_score = 30
        if business_type in ['متجر إلكتروني', 'تجارة إلكترونية']:
            shopping_score += 40
        if products:
            shopping_score += 25
        if 'منتج' in str(services).lower() or 'سلعة' in str(services).lower():
            shopping_score += 15
        scores['SHOPPING'] = min(shopping_score, 100)
        
        # حساب نقاط VIDEO
        video_score = 35
        if business_type in ['ترفيه', 'تعليمي', 'تدريب']:
            video_score += 30
        if 'فيديو' in str(services).lower() or 'تعليم' in str(services).lower():
            video_score += 20
        scores['VIDEO'] = min(video_score, 100)
        
        # حساب نقاط APP
        app_score = 20
        if business_type in ['تطبيقات', 'ألعاب', 'خدمات رقمية']:
            app_score += 50
        if 'تطبيق' in str(services).lower() or 'أبليكيشن' in str(services).lower():
            app_score += 30
        scores['APP'] = min(app_score, 100)
        
        # حساب نقاط PERFORMANCE MAX
        performance_max_score = 60
        if business_type in ['متجر إلكتروني', 'خدمات']:
            performance_max_score += 20
        if competitive_analysis['opportunity_score'] > 70:
            performance_max_score += 15
        scores['PERFORMANCE_MAX'] = min(performance_max_score, 100)
        
        # حساب نقاط CALL_ADS
        call_ads_score = 45
        if business_type in ['خدمات', 'طبي', 'استشارات']:
            call_ads_score += 25
        if contact_info.get('phone'):
            call_ads_score += 20
        if 'محلي' in str(services).lower() or 'قريب' in str(services).lower():
            call_ads_score += 10
        scores['CALL_ADS'] = min(call_ads_score, 100)
        
        # تطبيق اقتراح الذكاء الاصطناعي
        if ai_suggestion.get('primary_campaign'):
            primary = ai_suggestion['primary_campaign']
            if primary in scores:
                scores[primary] += 20
        
        return scores
    
    def _rank_campaigns(self, campaign_scores: Dict[str, int]) -> List[Dict[str, Any]]:
        """ترتيب أنواع الحملات حسب النقاط"""
        ranked = []
        
        for campaign_type, score in sorted(campaign_scores.items(), key=lambda x: x[1], reverse=True):
            campaign_info = self.campaign_types[campaign_type].copy()
            campaign_info.update({
                'type': campaign_type,
                'score': score,
                'rank': len(ranked) + 1,
                'recommended': len(ranked) == 0,  # الأول هو الموصى به
                'suitable': score >= 60  # مناسب إذا كانت النقاط 60 أو أكثر
            })
            ranked.append(campaign_info)
        
        return ranked
    
    def _create_final_recommendation(self, ranked_campaigns: List[Dict[str, Any]],
                                   business_analysis: Dict[str, Any],
                                   website_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء التوصية النهائية"""
        if not ranked_campaigns:
            return {
                'campaign_type': 'SEARCH',
                'confidence_score': 50,
                'reasoning': 'تم اختيار Search كخيار افتراضي',
                'alternatives': []
            }
        
        primary_campaign = ranked_campaigns[0]
        alternatives = ranked_campaigns[1:3]  # البديلان التاليان
        
        # حساب درجة الثقة
        confidence_score = primary_campaign['score']
        if primary_campaign['score'] > 80:
            confidence_score = 95
        elif primary_campaign['score'] > 70:
            confidence_score = 85
        elif primary_campaign['score'] > 60:
            confidence_score = 75
        else:
            confidence_score = 65
        
        # إنشاء السبب
        reasoning = self._generate_reasoning(primary_campaign, business_analysis, website_analysis)
        
        return {
            'campaign_type': primary_campaign['type'],
            'campaign_name': primary_campaign['name'],
            'description': primary_campaign['description'],
            'confidence_score': confidence_score,
            'reasoning': reasoning,
            'alternatives': [
                {
                    'type': alt['type'],
                    'name': alt['name'],
                    'score': alt['score'],
                    'reason': f"نقاط: {alt['score']}/100"
                } for alt in alternatives
            ],
            'next_steps': self._generate_next_steps(primary_campaign, business_analysis),
            'budget_recommendation': self._get_budget_recommendation(primary_campaign, business_analysis),
            'timeline': self._get_implementation_timeline(primary_campaign)
        }
    
    def _generate_reasoning(self, campaign: Dict[str, Any], business_analysis: Dict[str, Any],
                          website_analysis: Dict[str, Any]) -> str:
        """إنشاء سبب التوصية"""
        business_type = business_analysis.get('business_type', 'عام')
        campaign_type = campaign['type']
        
        reasoning_templates = {
            'SEARCH': f"نوع الأعمال ({business_type}) مناسب جداً لحملات البحث النصية. هذه الحملات فعالة للخدمات والمنتجات المحلية.",
            'DISPLAY': f"حملات Display مناسبة لبناء الوعي بالعلامة التجارية في قطاع {business_type}.",
            'SHOPPING': f"نوع الأعمال ({business_type}) يحتوي على منتجات مادية، مما يجعل حملات Shopping مثالية.",
            'VIDEO': f"المحتوى التعليمي والترفيهي في {business_type} مناسب لحملات الفيديو على YouTube.",
            'APP': f"نوع الأعمال ({business_type}) يركز على التطبيقات والخدمات الرقمية.",
            'PERFORMANCE_MAX': f"حملات Performance Max ستوفر أفضل النتائج لقطاع {business_type} مع تحسين تلقائي.",
            'CALL_ADS': f"الخدمات المحلية في {business_type} تستفيد من حملات المكالمات المباشرة."
        }
        
        base_reasoning = reasoning_templates.get(campaign_type, f"نوع الحملة {campaign['name']} مناسب لنوع الأعمال.")
        
        # إضافة تفاصيل إضافية
        if campaign['score'] > 80:
            base_reasoning += " النقاط العالية تشير إلى تطابق ممتاز مع احتياجات الأعمال."
        elif campaign['score'] > 70:
            base_reasoning += " النقاط الجيدة تشير إلى تطابق جيد مع أهداف الحملة."
        
        return base_reasoning
    
    def _generate_next_steps(self, campaign: Dict[str, Any], business_analysis: Dict[str, Any]) -> List[str]:
        """إنشاء الخطوات التالية"""
        steps = [
            f"تحديد الميزانية المناسبة لحملة {campaign['name']}",
            "إعداد الكلمات المفتاحية المستهدفة",
            "إنشاء النسخ الإعلانية الجذابة",
            "تحديد الجمهور المستهدف بدقة"
        ]
        
        if campaign['type'] == 'SEARCH':
            steps.extend([
                "إعداد صفحات الهبوط المحسنة",
                "تكوين ملحقات الإعلان (روابط، اتصال، موقع)"
            ])
        elif campaign['type'] == 'SHOPPING':
            steps.extend([
                "إعداد Google Merchant Center",
                "تحسين بيانات المنتجات",
                "إعداد التتبع والتحويلات"
            ])
        elif campaign['type'] == 'VIDEO':
            steps.extend([
                "إنشاء محتوى فيديو جذاب",
                "تحسين وصف الفيديو",
                "إعداد استهداف YouTube"
            ])
        
        return steps
    
    def _get_budget_recommendation(self, campaign: Dict[str, Any], business_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """اقتراح الميزانية"""
        min_budget = campaign.get('budget_min', 100)
        
        # حساب الميزانية المقترحة بناءً على نوع الأعمال
        business_type = business_analysis.get('business_type', 'عام')
        
        if business_type in ['متجر إلكتروني', 'تجارة إلكترونية']:
            recommended_budget = min_budget * 3
        elif business_type in ['خدمات', 'استشارات']:
            recommended_budget = min_budget * 2
        else:
            recommended_budget = min_budget * 1.5
        
        return {
            'minimum_budget': min_budget,
            'recommended_budget': int(recommended_budget),
            'optimal_budget': int(recommended_budget * 1.5),
            'currency': 'SAR',
            'budget_type': 'daily',
            'reasoning': f"ميزانية مقترحة بناءً على نوع الأعمال ({business_type}) ونوع الحملة ({campaign['name']})"
        }
    
    def _get_implementation_timeline(self, campaign: Dict[str, Any]) -> Dict[str, str]:
        """جدولة التنفيذ"""
        return {
            'setup_time': '1-2 أيام',
            'optimization_time': '1-2 أسبوع',
            'full_optimization': '1 شهر',
            'expected_results': '2-4 أسابيع',
            'description': f"الوقت المطلوب لإعداد وتحسين حملة {campaign['name']}"
        }
    
    def _create_default_ai_suggestion(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء اقتراح افتراضي من الذكاء الاصطناعي"""
        if not isinstance(analysis_data, dict):
            analysis_data = {}
        
        website_info = analysis_data.get('website_info', {})
        if not isinstance(website_info, dict):
            website_info = {}
        
        business_type = website_info.get('business_type', 'عام')
        
        # اقتراح بسيط بناءً على نوع الأعمال
        if business_type in ['متجر إلكتروني', 'تجارة إلكترونية']:
            primary = 'SHOPPING'
            secondary = 'SEARCH'
            tertiary = 'PERFORMANCE_MAX'
        elif business_type in ['خدمات', 'استشارات']:
            primary = 'SEARCH'
            secondary = 'CALL_ADS'
            tertiary = 'DISPLAY'
        elif business_type in ['مطعم', 'طعام']:
            primary = 'SEARCH'
            secondary = 'DISPLAY'
            tertiary = 'CALL_ADS'
        else:
            primary = 'SEARCH'
            secondary = 'DISPLAY'
            tertiary = 'PERFORMANCE_MAX'
        
        return {
            'primary_campaign': primary,
            'secondary_campaign': secondary,
            'tertiary_campaign': tertiary,
            'reasoning': f'اقتراح بناءً على نوع الأعمال: {business_type}',
            'strengths': ['مناسب لنوع الأعمال', 'ميزانية معقولة'],
            'weaknesses': ['يحتاج تحسين مستمر'],
            'recommendations': ['مراقبة الأداء', 'تحسين مستمر'],
            'confidence_score': 70
        }
    
    def _analyze_campaign_type_from_keywords(self, keywords: List[Dict[str, Any]]) -> Optional[str]:
        """تحليل نوع الحملة بناءً على الكلمات المفتاحية المستخرجة"""
        try:
            if not keywords:
                return None
            
            # تحليل الكلمات المفتاحية لتحديد نوع الحملة
            keyword_texts = [kw.get('keyword', '') for kw in keywords[:20]]  # أول 20 كلمة
            keyword_text = ' '.join(keyword_texts).lower()
            
            # تحليل نوع الحملة بناءً على الكلمات
            if any(word in keyword_text for word in ['منتج', 'شراء', 'سعر', 'تسوق', 'متجر']):
                return 'Shopping'
            elif any(word in keyword_text for word in ['فيديو', 'يوتيوب', 'مقطع', 'تسجيل']):
                return 'Video'
            elif any(word in keyword_text for word in ['تطبيق', 'تحميل', 'app', 'جوال']):
                return 'App'
            elif any(word in keyword_text for word in ['اتصال', 'اتصل', 'هاتف', 'مكالمة']):
                return 'Call Ads'
            elif any(word in keyword_text for word in ['عرض', 'بصري', 'صورة', 'إعلان']):
                return 'Display'
            else:
                return 'Search'  # الافتراضي
                
        except Exception as e:
            self.logger.error(f"خطأ في تحليل نوع الحملة من الكلمات المفتاحية: {e}")
            return None
    
    def get_campaign_type_info(self, campaign_type: str) -> Dict[str, Any]:
        """الحصول على معلومات نوع حملة محدد"""
        if campaign_type not in self.campaign_types:
            return {
                'success': False,
                'error': 'نوع الحملة غير مدعوم',
                'message': f'نوع الحملة {campaign_type} غير متوفر'
            }
        
        campaign_info = self.campaign_types[campaign_type].copy()
        campaign_info['type'] = campaign_type
        
        return {
            'success': True,
            'campaign_info': campaign_info,
            'message': f'تم جلب معلومات حملة {campaign_info["name"]}'
        }
    
    def get_all_campaign_types(self) -> Dict[str, Any]:
        """الحصول على جميع أنواع الحملات"""
        return {
            'success': True,
            'campaign_types': self.campaign_types,
            'total_types': len(self.campaign_types),
            'message': 'تم جلب جميع أنواع الحملات'
        }

# تصدير الكلاس
__all__ = ['AICampaignSelector']

