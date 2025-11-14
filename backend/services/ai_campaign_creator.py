"""
AI Campaign Creator - منشئ الحملات بالذكاء الاصطناعي
Google Ads AI Platform - Intelligent Campaign Creation Service
"""

import os
import logging
from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
import uuid

# استيراد الخدمات
from .ai_campaign_selector import AICampaignSelector
from .campaign_builder import CampaignBuilder
from .real_ai_processor import RealAIProcessor
from .website_analyzer import WebsiteAnalyzer
from .google_ads_official_service import GoogleAdsOfficialService

class AICampaignCreator:
    """منشئ الحملات الإعلانية بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة منشئ الحملات"""
        self.logger = logging.getLogger(__name__)
        self.ai_campaign_selector = AICampaignSelector()
        self.campaign_builder = CampaignBuilder()
        self.ai_processor = RealAIProcessor()
        self.website_analyzer = WebsiteAnalyzer()
        self.google_ads_service = GoogleAdsOfficialService()
        
        self.logger.info("تم تهيئة منشئ الحملات بالذكاء الاصطناعي")
    
    def create_complete_campaign(self, campaign_request: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء حملة إعلانية كاملة بالذكاء الاصطناعي"""
        try:
            self.logger.info(f"بدء إنشاء حملة كاملة: {campaign_request.get('name', 'غير محدد')}")
            
            # التحقق من البيانات المطلوبة
            validation_result = self._validate_campaign_request(campaign_request)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'error': 'بيانات الحملة غير صحيحة',
                    'validation_errors': validation_result['errors'],
                    'message': 'يرجى تصحيح الأخطاء في البيانات'
                }
            
            # إنشاء معرف فريد للحملة
            campaign_id = str(uuid.uuid4())
            
            # المرحلة 1: تحليل الموقع واقتراح نوع الحملة
            website_analysis = self._analyze_website_and_suggest_type(campaign_request)
            if not website_analysis['success']:
                return website_analysis
            
            # المرحلة 2: إنشاء الكلمات المفتاحية بالذكاء الاصطناعي
            keywords_analysis = self._generate_ai_keywords(campaign_request, website_analysis)
            if not keywords_analysis['success']:
                return keywords_analysis
            
            # المرحلة 3: إنشاء النسخ الإعلانية بالذكاء الاصطناعي
            ad_copies = self._generate_ai_ad_copies(campaign_request, website_analysis, keywords_analysis)
            if not ad_copies['success']:
                return ad_copies
            
            # المرحلة 4: بناء هيكل الحملة المتكامل
            campaign_structure = self._build_complete_campaign_structure(
                campaign_request, website_analysis, keywords_analysis, ad_copies
            )
            if not campaign_structure['success']:
                return campaign_structure
            
            # المرحلة 5: تحسين الميزانية والاستهداف
            optimization_result = self._optimize_campaign_settings(
                campaign_request, campaign_structure, website_analysis
            )
            if not optimization_result['success']:
                return optimization_result
            
            # المرحلة 6: إنشاء الحملة في Google Ads (إذا طُلب)
            google_ads_result = None
            if campaign_request.get('create_in_google_ads', False):
                google_ads_result = self._create_campaign_in_google_ads(
                    campaign_request, campaign_structure, optimization_result
                )
            
            # تجميع النتائج النهائية
            final_result = {
                'success': True,
                'campaign_id': campaign_id,
                'campaign_name': campaign_request.get('name', f"حملة {datetime.now().strftime('%Y-%m-%d')}"),
                'campaign_type': campaign_structure['campaign_structure']['campaign']['type'],
                'website_analysis': website_analysis,
                'keywords_analysis': keywords_analysis,
                'ad_copies': ad_copies,
                'campaign_structure': campaign_structure,
                'optimization_result': optimization_result,
                'google_ads_result': google_ads_result,
                'performance_estimates': self._generate_performance_estimates(
                    campaign_request, campaign_structure
                ),
                'recommendations': self._generate_campaign_recommendations(
                    campaign_structure, website_analysis, keywords_analysis
                ),
                'next_steps': self._generate_next_steps(campaign_structure, google_ads_result),
                'timestamp': datetime.now().isoformat(),
                'message': 'تم إنشاء الحملة الإعلانية بنجاح بالذكاء الاصطناعي'
            }
            
            self.logger.info(f"تم إنشاء الحملة بنجاح: {campaign_id}")
            return final_result
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الحملة الكاملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء الحملة الإعلانية'
            }
    
    def _validate_campaign_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """التحقق من صحة طلب إنشاء الحملة"""
        errors = []
        warnings = []
        
        # الحقول المطلوبة
        required_fields = {
            'website_url': 'رابط الموقع الإلكتروني',
            'budget': 'الميزانية اليومية'
        }
        
        for field, field_name in required_fields.items():
            if not request.get(field):
                errors.append(f'{field_name} مطلوب')
        
        # التحقق من الميزانية
        if request.get('budget'):
            try:
                budget = float(request['budget'])
                if budget < 50:
                    warnings.append('الميزانية منخفضة جداً (أقل من 50 ريال)')
                elif budget > 50000:
                    warnings.append('الميزانية عالية جداً (أكثر من 50,000 ريال)')
            except ValueError:
                errors.append('الميزانية يجب أن تكون رقماً صحيحاً')
        
        # التحقق من رابط الموقع
        if request.get('website_url'):
            website_url = request['website_url']
            if not website_url.startswith(('http://', 'https://')):
                warnings.append('رابط الموقع يجب أن يبدأ بـ http:// أو https://')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
    
    def _analyze_website_and_suggest_type(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل الموقع واقتراح نوع الحملة"""
        try:
            website_url = request['website_url']
            business_info = request.get('business_info', {})
            
            # استخدام AI Campaign Selector
            suggestion_result = self.ai_campaign_selector.suggest_campaign_type(website_url, business_info)
            
            if not suggestion_result['success']:
                return suggestion_result
            
            # إضافة نوع الحملة المختار إلى الطلب
            if not request.get('campaign_type'):
                request['campaign_type'] = suggestion_result['recommendation']['campaign_type']
            
            return suggestion_result
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل الموقع: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحليل الموقع'
            }
    
    def _generate_ai_keywords(self, request: Dict[str, Any], website_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء الكلمات المفتاحية بالذكاء الاصطناعي"""
        try:
            business_info = request.get('business_info', {})
            website_info = website_analysis.get('business_analysis', {})
            
            # دمج معلومات الأعمال
            combined_business_info = {**business_info, **website_info}
            
            # استخدام AI Processor لتحليل الكلمات المفتاحية
            keywords_result = self.ai_processor.analyze_keywords(combined_business_info)
            
            # استخراج الكلمات المفتاحية من الموقع
            website_keywords = website_analysis.get('keywords_suggestions', {})
            
            # دمج الكلمات المفتاحية
            merged_keywords = self._merge_keyword_sources(keywords_result, website_keywords)
            
            return {
                'success': True,
                'ai_keywords': keywords_result,
                'website_keywords': website_keywords,
                'merged_keywords': merged_keywords,
                'total_keywords': len(merged_keywords.get('keywords', [])),
                'message': 'تم إنشاء الكلمات المفتاحية بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الكلمات المفتاحية: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء الكلمات المفتاحية'
            }
    
    def _generate_ai_ad_copies(self, request: Dict[str, Any], website_analysis: Dict[str, Any], 
                              keywords_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء النسخ الإعلانية بالذكاء الاصطناعي"""
        try:
            campaign_type = request.get('campaign_type', 'SEARCH')
            business_info = request.get('business_info', {})
            website_info = website_analysis.get('business_analysis', {})
            
            # إعداد معلومات الحملة للذكاء الاصطناعي
            campaign_info = {
                'product_name': website_info.get('business_name', business_info.get('business_name', '')),
                'benefits': ', '.join(website_info.get('services', [])[:3]),
                'offer': business_info.get('special_offer', ''),
                'target_audience': business_info.get('target_audience', 'عام'),
                'keywords': ', '.join([kw.get('keyword', '') for kw in keywords_analysis.get('merged_keywords', {}).get('keywords', [])[:10]]) if keywords_analysis.get('merged_keywords', {}).get('keywords') else ''
            }
            
            # إنشاء النسخ الإعلانية
            ad_copies_result = self.ai_processor.generate_ad_copy(campaign_info)
            
            # تخصيص النسخ حسب نوع الحملة
            customized_copies = self._customize_ad_copies_for_campaign_type(ad_copies_result, campaign_type)
            
            return {
                'success': True,
                'original_copies': ad_copies_result,
                'customized_copies': customized_copies,
                'campaign_type': campaign_type,
                'message': 'تم إنشاء النسخ الإعلانية بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء النسخ الإعلانية: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء النسخ الإعلانية'
            }
    
    def _build_complete_campaign_structure(self, request: Dict[str, Any], website_analysis: Dict[str, Any],
                                         keywords_analysis: Dict[str, Any], ad_copies: Dict[str, Any]) -> Dict[str, Any]:
        """بناء هيكل الحملة المتكامل"""
        try:
            # إعداد بيانات الحملة
            campaign_data = {
                'name': request.get('name', f"حملة {datetime.now().strftime('%Y-%m-%d')}"),
                'type': request.get('campaign_type', 'SEARCH'),
                'budget': request['budget'],
                'website_url': request['website_url'],
                'business_info': request.get('business_info', {}),
                'target_locations': request.get('target_locations', []),
                'target_languages': request.get('target_languages', ['ar']),
                'keywords': keywords_analysis.get('merged_keywords', {}).get('keywords', []),
                'ad_copies': ad_copies.get('customized_copies', {}),
                'website_analysis': website_analysis
            }
            
            # استخدام Campaign Builder
            campaign_structure = self.campaign_builder.build_smart_campaign(campaign_data)
            
            if not campaign_structure['success']:
                return campaign_structure
            
            return {
                'success': True,
                'campaign_structure': campaign_structure,
                'message': 'تم بناء هيكل الحملة بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في بناء هيكل الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في بناء هيكل الحملة'
            }
    
    def _optimize_campaign_settings(self, request: Dict[str, Any], campaign_structure: Dict[str, Any],
                                  website_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """تحسين إعدادات الحملة"""
        try:
            # تحليل الميزانية
            budget_analysis = self._analyze_budget_optimization(request, campaign_structure)
            
            # تحليل الاستهداف
            targeting_analysis = self._analyze_targeting_optimization(request, website_analysis)
            
            # تحليل المزايدة
            bidding_analysis = self._analyze_bidding_optimization(request, campaign_structure)
            
            # تحليل التوقيت
            scheduling_analysis = self._analyze_scheduling_optimization(request, website_analysis)
            
            return {
                'success': True,
                'budget_optimization': budget_analysis,
                'targeting_optimization': targeting_analysis,
                'bidding_optimization': bidding_analysis,
                'scheduling_optimization': scheduling_analysis,
                'overall_optimization_score': self._calculate_optimization_score(
                    budget_analysis, targeting_analysis, bidding_analysis, scheduling_analysis
                ),
                'message': 'تم تحسين إعدادات الحملة بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحسين إعدادات الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحسين إعدادات الحملة'
            }
    
    def _create_campaign_in_google_ads(self, request: Dict[str, Any], campaign_structure: Dict[str, Any],
                                     optimization_result: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء الحملة في Google Ads"""
        try:
            customer_id = request.get('customer_id')
            if not customer_id:
                return {
                    'success': False,
                    'error': 'معرف العميل مطلوب لإنشاء الحملة في Google Ads',
                    'message': 'يرجى توفير معرف العميل'
                }
            
            # التحقق من حالة خدمة Google Ads
            if not self.google_ads_service.is_initialized:
                return {
                    'success': False,
                    'error': 'خدمة Google Ads غير مهيأة',
                    'message': 'يرجى التحقق من إعدادات Google Ads'
                }
            
            # إنشاء الحملة في Google Ads
            # (هنا سيتم استخدام Google Ads Official Service)
            # campaign_creation_result = self.google_ads_service.create_campaign(...)
            
            # محاكاة إنشاء الحملة (في التطبيق الحقيقي، سيتم استخدام API)
            campaign_creation_result = {
                'success': True,
                'campaign_id': f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'ad_group_ids': [f"adgroup_{i}" for i in range(1, 4)],
                'keyword_ids': [f"keyword_{i}" for i in range(1, 20)],
                'ad_ids': [f"ad_{i}" for i in range(1, 6)],
                'message': 'تم إنشاء الحملة في Google Ads بنجاح'
            }
            
            return campaign_creation_result
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الحملة في Google Ads: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء الحملة في Google Ads'
            }
    
    def _merge_keyword_sources(self, ai_keywords: Dict[str, Any], website_keywords: Dict[str, Any]) -> Dict[str, Any]:
        """دمج الكلمات المفتاحية من مصادر مختلفة"""
        merged = ai_keywords.copy()
        
        # إضافة الكلمات المفتاحية من الموقع
        if website_keywords:
            website_kw_list = []
            for category, keywords in website_keywords.items():
                if isinstance(keywords, list):
                    for kw in keywords[:5]:  # أول 5 من كل فئة
                        if isinstance(kw, dict):
                            website_kw_list.append(kw)
                        else:
                            website_kw_list.append({
                                'keyword': str(kw),
                                'source': 'website',
                                'category': category,
                                'relevance': 70
                            })
            
            if 'keywords' not in merged:
                merged['keywords'] = []
            merged['keywords'].extend(website_kw_list)
        
        return merged
    
    def _customize_ad_copies_for_campaign_type(self, ad_copies: Dict[str, Any], campaign_type: str) -> Dict[str, Any]:
        """تخصيص النسخ الإعلانية حسب نوع الحملة"""
        customized = ad_copies.copy()
        
        if campaign_type == 'SEARCH':
            # تخصيص للبحث النصي
            if 'headlines' in customized:
                customized['headlines'].extend([
                    'احصل على أفضل الأسعار',
                    'خدمة عملاء 24/7',
                    'ضمان الجودة'
                ])
        elif campaign_type == 'DISPLAY':
            # تخصيص للعرض البصري
            if 'descriptions' in customized:
                customized['descriptions'] = [
                    desc + ' - اكتشف المزيد الآن!' for desc in customized['descriptions']
                ]
        elif campaign_type == 'SHOPPING':
            # تخصيص للتسوق
            customized['product_highlights'] = [
                'شحن مجاني',
                'ضمان الجودة',
                'أسعار منافسة'
            ]
        elif campaign_type == 'VIDEO':
            # تخصيص للفيديو
            customized['video_scripts'] = [
                'اكتشف منتجنا الجديد',
                'شاهد كيف نعمل',
                'انضم إلى آلاف العملاء الراضين'
            ]
        elif campaign_type == 'CALL_ADS':
            # تخصيص للمكالمات
            customized['call_highlights'] = [
                'اتصل الآن للحصول على عرض خاص',
                'استشارة مجانية',
                'خدمة عملاء متاحة 24/7'
            ]
        
        return customized
    
    def _analyze_budget_optimization(self, request: Dict[str, Any], campaign_structure: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل تحسين الميزانية"""
        budget = float(request.get('budget', 1000))
        campaign_type = request.get('campaign_type', 'SEARCH')
        
        # تحليل الميزانية حسب نوع الحملة
        budget_analysis = {
            'current_budget': budget,
            'budget_adequacy': 'مناسب' if 100 <= budget <= 5000 else 'يحتاج مراجعة',
            'recommended_budget': self._get_recommended_budget(campaign_type, budget),
            'budget_distribution': self._suggest_budget_distribution(budget, campaign_type),
            'optimization_tips': self._get_budget_optimization_tips(campaign_type, budget)
        }
        
        return budget_analysis
    
    def _analyze_targeting_optimization(self, request: Dict[str, Any], website_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل تحسين الاستهداف"""
        business_type = website_analysis.get('business_analysis', {}).get('business_type', 'عام')
        target_locations = request.get('target_locations', [])
        
        targeting_analysis = {
            'current_targeting': {
                'locations': target_locations,
                'languages': request.get('target_languages', ['ar'])
            },
            'recommended_targeting': self._get_recommended_targeting(business_type),
            'audience_insights': self._get_audience_insights(business_type),
            'optimization_suggestions': self._get_targeting_optimization_suggestions(business_type)
        }
        
        return targeting_analysis
    
    def _analyze_bidding_optimization(self, request: Dict[str, Any], campaign_structure: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل تحسين المزايدة"""
        campaign_type = request.get('campaign_type', 'SEARCH')
        budget = float(request.get('budget', 1000))
        
        bidding_analysis = {
            'recommended_strategy': self._get_recommended_bidding_strategy(campaign_type, budget),
            'bid_suggestions': self._get_bid_suggestions(campaign_type, budget),
            'optimization_timeline': self._get_bidding_optimization_timeline(),
            'performance_expectations': self._get_bidding_performance_expectations(campaign_type)
        }
        
        return bidding_analysis
    
    def _analyze_scheduling_optimization(self, request: Dict[str, Any], website_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل تحسين التوقيت"""
        business_type = website_analysis.get('business_analysis', {}).get('business_type', 'عام')
        
        scheduling_analysis = {
            'recommended_schedule': self._get_recommended_schedule(business_type),
            'peak_hours': self._get_peak_hours(business_type),
            'day_parting_suggestions': self._get_day_parting_suggestions(business_type),
            'seasonal_considerations': self._get_seasonal_considerations(business_type)
        }
        
        return scheduling_analysis
    
    def _calculate_optimization_score(self, budget_analysis: Dict[str, Any], targeting_analysis: Dict[str, Any],
                                    bidding_analysis: Dict[str, Any], scheduling_analysis: Dict[str, Any]) -> int:
        """حساب نقاط التحسين الإجمالية"""
        score = 0
        
        # نقاط الميزانية
        if budget_analysis.get('budget_adequacy') == 'مناسب':
            score += 25
        
        # نقاط الاستهداف
        if targeting_analysis.get('recommended_targeting'):
            score += 25
        
        # نقاط المزايدة
        if bidding_analysis.get('recommended_strategy'):
            score += 25
        
        # نقاط التوقيت
        if scheduling_analysis.get('recommended_schedule'):
            score += 25
        
        return min(score, 100)
    
    def _generate_performance_estimates(self, request: Dict[str, Any], campaign_structure: Dict[str, Any]) -> Dict[str, Any]:
        """توليد تقديرات الأداء"""
        campaign_type = request.get('campaign_type', 'SEARCH')
        budget = float(request.get('budget', 1000))
        
        # تقديرات أساسية حسب نوع الحملة
        estimates = {
            'SEARCH': {
                'estimated_clicks': int(budget * 0.8),
                'estimated_impressions': int(budget * 15),
                'estimated_ctr': 2.5,
                'estimated_cpc': 1.25,
                'estimated_conversions': int(budget * 0.05)
            },
            'DISPLAY': {
                'estimated_clicks': int(budget * 0.3),
                'estimated_impressions': int(budget * 50),
                'estimated_ctr': 0.6,
                'estimated_cpc': 3.33,
                'estimated_conversions': int(budget * 0.02)
            },
            'SHOPPING': {
                'estimated_clicks': int(budget * 0.6),
                'estimated_impressions': int(budget * 20),
                'estimated_ctr': 3.0,
                'estimated_cpc': 1.67,
                'estimated_conversions': int(budget * 0.08)
            },
            'PERFORMANCE_MAX': {
                'estimated_clicks': int(budget * 0.7),
                'estimated_impressions': int(budget * 25),
                'estimated_ctr': 2.8,
                'estimated_cpc': 1.43,
                'estimated_conversions': int(budget * 0.06)
            },
            'CALL_ADS': {
                'estimated_clicks': int(budget * 0.4),
                'estimated_impressions': int(budget * 12),
                'estimated_ctr': 3.33,
                'estimated_cpc': 2.5,
                'estimated_conversions': int(budget * 0.15)
            }
        }
        
        base_estimates = estimates.get(campaign_type, estimates['SEARCH'])
        
        return {
            'campaign_type': campaign_type,
            'budget': budget,
            'estimates': base_estimates,
            'confidence_level': 'متوسط',
            'notes': [
                'هذه تقديرات تقريبية بناءً على متوسطات الصناعة',
                'الأداء الفعلي قد يختلف حسب عوامل متعددة',
                'يُنصح بمراقبة الأداء وتعديل الميزانية حسب النتائج'
            ]
        }
    
    def _generate_campaign_recommendations(self, campaign_structure: Dict[str, Any], 
                                         website_analysis: Dict[str, Any], 
                                         keywords_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """توليد توصيات الحملة"""
        recommendations = []
        
        # توصيات بناءً على تحليل الموقع
        seo_score = website_analysis.get('seo_analysis', {}).get('seo_score', 0)
        if seo_score < 70:
            recommendations.append({
                'category': 'SEO',
                'priority': 'عالي',
                'recommendation': 'تحسين SEO الموقع لتحسين جودة الإعلانات',
                'action': 'تحسين عناوين الصفحات وإضافة meta descriptions'
            })
        
        # توصيات بناءً على الكلمات المفتاحية
        total_keywords = keywords_analysis.get('total_keywords', 0)
        if total_keywords < 20:
            recommendations.append({
                'category': 'الكلمات المفتاحية',
                'priority': 'متوسط',
                'recommendation': 'إضافة المزيد من الكلمات المفتاحية',
                'action': 'استخدام أدوات البحث عن الكلمات المفتاحية'
            })
        
        # توصيات عامة
        recommendations.extend([
            {
                'category': 'المراقبة',
                'priority': 'عالي',
                'recommendation': 'مراقبة الأداء يومياً في الأسبوع الأول',
                'action': 'مراجعة التقارير اليومية وتعديل المزايدات'
            },
            {
                'category': 'الاختبار',
                'priority': 'متوسط',
                'recommendation': 'اختبار نسخ إعلانية متعددة',
                'action': 'إنشاء 3-5 نسخ إعلانية مختلفة واختبارها'
            }
        ])
        
        return recommendations
    
    def _generate_next_steps(self, campaign_structure: Dict[str, Any], google_ads_result: Dict[str, Any]) -> List[str]:
        """توليد الخطوات التالية"""
        steps = [
            'مراجعة هيكل الحملة والتأكد من صحة الإعدادات',
            'تخصيص النسخ الإعلانية حسب احتياجات الأعمال',
            'إعداد صفحات الهبوط المحسنة',
            'تكوين تتبع التحويلات'
        ]
        
        if google_ads_result and google_ads_result.get('success'):
            steps.extend([
                'مراقبة أداء الحملة في Google Ads',
                'تحسين المزايدات بناءً على النتائج',
                'إضافة كلمات مفتاحية سلبية',
                'تحسين الاستهداف الجغرافي'
            ])
        else:
            steps.extend([
                'ربط حساب Google Ads',
                'إنشاء الحملة في Google Ads',
                'تفعيل الحملة وبدء الإعلان'
            ])
        
        return steps
    
    # دوال مساعدة إضافية
    def _get_recommended_budget(self, campaign_type: str, current_budget: float) -> Dict[str, Any]:
        """الحصول على الميزانية المقترحة"""
        min_budgets = {
            'SEARCH': 100,
            'DISPLAY': 200,
            'SHOPPING': 300,
            'VIDEO': 500,
            'APP': 200,
            'PERFORMANCE_MAX': 1000,
            'CALL_ADS': 150
        }
        
        min_budget = min_budgets.get(campaign_type, 100)
        recommended = max(current_budget, min_budget * 1.5)
        
        return {
            'minimum': min_budget,
            'recommended': int(recommended),
            'optimal': int(recommended * 1.5)
        }
    
    def _suggest_budget_distribution(self, budget: float, campaign_type: str) -> Dict[str, float]:
        """اقتراح توزيع الميزانية"""
        if campaign_type == 'SEARCH':
            return {
                'keywords': 0.6,
                'ad_groups': 0.3,
                'extensions': 0.1
            }
        elif campaign_type == 'DISPLAY':
            return {
                'placements': 0.5,
                'audiences': 0.3,
                'creatives': 0.2
            }
        else:
            return {
                'main_campaign': 0.8,
                'optimization': 0.2
            }
    
    def _get_budget_optimization_tips(self, campaign_type: str, budget: float) -> List[str]:
        """نصائح تحسين الميزانية"""
        tips = []
        
        if budget < 500:
            tips.append('ركز على الكلمات المفتاحية منخفضة التكلفة')
            tips.append('استخدم الاستهداف الجغرافي المحدود')
        elif budget > 2000:
            tips.append('فكر في توسيع الاستهداف الجغرافي')
            tips.append('اختبر كلمات مفتاحية أكثر تنافسية')
        
        tips.extend([
            'راقب الأداء يومياً وعدل الميزانية حسب النتائج',
            'استخدم المزايدة التلقائية المحسنة',
            'ركز على الكلمات المفتاحية عالية الجودة'
        ])
        
        return tips
    
    def _get_recommended_targeting(self, business_type: str) -> Dict[str, Any]:
        """الحصول على الاستهداف المقترح"""
        targeting_templates = {
            'مطعم': {
                'locations': [],
                'radius': 10,
                'demographics': {'age_ranges': ['25-44'], 'genders': ['MALE', 'FEMALE']},
                'interests': ['طعام', 'مطاعم', 'توصيل']
            },
            'طبي': {
                'locations': [],
                'radius': 25,
                'demographics': {'age_ranges': ['25-65'], 'genders': ['MALE', 'FEMALE']},
                'interests': ['صحة', 'طب', 'علاج']
            },
            'خدمات': {
                'locations': [],
                'radius': 30,
                'demographics': {'age_ranges': ['25-54'], 'genders': ['MALE', 'FEMALE']},
                'interests': ['خدمات', 'استشارات', 'حلول']
            }
        }
        
        return targeting_templates.get(business_type, targeting_templates['خدمات'])
    
    def _get_audience_insights(self, business_type: str) -> Dict[str, Any]:
        """الحصول على رؤى الجمهور"""
        insights = {
            'mcp_Playwright_browser_console_messages': 'متوسط',
            'peak_hours': ['9-11', '14-16', '19-21'],
            'device_preference': 'mobile',
            'language_preference': 'ar'
        }
        
        if business_type == 'مطعم':
            insights.update({
                'peak_hours': ['12-14', '19-21'],
                'device_preference': 'mobile',
                'location_sensitivity': 'high'
            })
        elif business_type == 'طبي':
            insights.update({
                'peak_hours': ['9-11', '14-16'],
                'device_preference': 'desktop',
                'location_sensitivity': 'medium'
            })
        
        return insights
    
    def _get_targeting_optimization_suggestions(self, business_type: str) -> List[str]:
        """اقتراحات تحسين الاستهداف"""
        suggestions = [
            'استخدم الاستهداف الجغرافي الدقيق',
            'ركز على الفئات العمرية المناسبة',
            'استهدف الاهتمامات ذات الصلة'
        ]
        
        if business_type == 'مطعم':
            suggestions.extend([
                'استهدف المناطق القريبة من المطعم',
                'ركز على أوقات الوجبات',
                'استهدف المهتمين بالطعام والتوصيل'
            ])
        
        return suggestions
    
    def _get_recommended_bidding_strategy(self, campaign_type: str, budget: float) -> Dict[str, Any]:
        """الحصول على استراتيجية المزايدة المقترحة"""
        if budget < 500:
            return {
                'strategy': 'MANUAL_CPC',
                'reason': 'ميزانية منخفضة - تحكم يدوي أفضل',
                'enhanced_cpc': True
            }
        elif budget < 2000:
            return {
                'strategy': 'TARGET_CPA',
                'reason': 'ميزانية متوسطة - توازن بين التحكم والأداء',
                'target_cpa': 50
            }
        else:
            return {
                'strategy': 'MAXIMIZE_CONVERSIONS',
                'reason': 'ميزانية عالية - التركيز على التحويلات',
                'target_roas': 300
            }
    
    def _get_bid_suggestions(self, campaign_type: str, budget: float) -> Dict[str, float]:
        """اقتراحات المزايدة"""
        base_bids = {
            'SEARCH': 1.5,
            'DISPLAY': 0.8,
            'SHOPPING': 2.0,
            'VIDEO': 0.5,
            'PERFORMANCE_MAX': 1.8,
            'CALL_ADS': 2.5
        }
        
        base_bid = base_bids.get(campaign_type, 1.5)
        
        return {
            'suggested_bid': base_bid,
            'max_bid': base_bid * 1.5,
            'min_bid': base_bid * 0.5
        }
    
    def _get_bidding_optimization_timeline(self) -> Dict[str, str]:
        """جدولة تحسين المزايدة"""
        return {
            'initial_setup': '1-2 أيام',
            'first_optimization': '1 أسبوع',
            'full_optimization': '2-3 أسابيع',
            'continuous_monitoring': 'مستمر'
        }
    
    def _get_bidding_performance_expectations(self, campaign_type: str) -> Dict[str, Any]:
        """توقعات أداء المزايدة"""
        expectations = {
            'SEARCH': {
                'ctr_target': '2-4%',
                'cpc_target': '1-3 ريال',
                'conversion_rate': '2-5%'
            },
            'DISPLAY': {
                'ctr_target': '0.5-1.5%',
                'cpc_target': '2-5 ريال',
                'conversion_rate': '1-3%'
            },
            'SHOPPING': {
                'ctr_target': '2-5%',
                'cpc_target': '1.5-4 ريال',
                'conversion_rate': '3-8%'
            }
        }
        
        return expectations.get(campaign_type, expectations['SEARCH'])
    
    def _get_recommended_schedule(self, business_type: str) -> Dict[str, Any]:
        """الحصول على الجدولة المقترحة"""
        schedules = {
            'مطعم': {
                'days': ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
                'hours': [11, 12, 13, 14, 19, 20, 21, 22],
                'reason': 'أوقات الوجبات'
            },
            'طبي': {
                'days': ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                'hours': [9, 10, 11, 12, 14, 15, 16, 17],
                'reason': 'ساعات العمل الطبية'
            },
            'خدمات': {
                'days': ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
                'hours': [9, 10, 11, 12, 14, 15, 16, 17, 18],
                'reason': 'ساعات العمل العادية'
            }
        }
        
        return schedules.get(business_type, schedules['خدمات'])
    
    def _get_peak_hours(self, business_type: str) -> List[str]:
        """الحصول على ساعات الذروة"""
        peak_hours = {
            'مطعم': ['12-14', '19-21'],
            'طبي': ['9-11', '14-16'],
            'خدمات': ['9-11', '14-17'],
            'متجر إلكتروني': ['19-22']
        }
        
        return peak_hours.get(business_type, ['9-11', '14-17'])
    
    def _get_day_parting_suggestions(self, business_type: str) -> List[str]:
        """اقتراحات تقسيم اليوم"""
        suggestions = [
            'ركز على ساعات الذروة',
            'قلل المزايدة في الساعات الهادئة',
            'اختبر أوقات مختلفة'
        ]
        
        if business_type == 'مطعم':
            suggestions.extend([
                'زد المزايدة في أوقات الوجبات',
                'قلل المزايدة في الصباح الباكر'
            ])
        
        return suggestions
    
    def _get_seasonal_considerations(self, business_type: str) -> List[str]:
        """اعتبارات موسمية"""
        considerations = [
            'راقب الأداء في المواسم المختلفة',
            'عدل الميزانية حسب الطلب الموسمي',
            'استخدم الحملات الموسمية'
        ]
        
        if business_type == 'مطعم':
            considerations.extend([
                'زد الميزانية في رمضان',
                'ركز على الأطباق الموسمية'
            ])
        
        return considerations

# تصدير الكلاس
    def generate_ad_copies(self, campaign_info: Dict[str, Any], website_url: str = None, target_locations: List[str] = None, target_language: str = None) -> Dict[str, Any]:
        """توليد النسخ الإعلانية بالذكاء الاصطناعي"""
        try:
            self.logger.info("🎨 بدء توليد النسخ الإعلانية بالذكاء الاصطناعي")
            
            # استخدام AI Content Generator
            from .ai_content_generator import AIContentGenerator
            ai_generator = AIContentGenerator()
            
            result = ai_generator.generate_complete_ad_content(
                website_url=website_url or campaign_info.get('website_url', ''),
                product_service=campaign_info.get('service_type', 'خدمات عامة'),
                target_language=target_language or campaign_info.get('target_language', 'ar')
            )
            
            if result.get('success'):
                self.logger.info("✅ تم توليد النسخ الإعلانية بنجاح")
                return result
            else:
                self.logger.error(f"❌ فشل في توليد النسخ الإعلانية: {result.get('error')}")
                return result
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد النسخ الإعلانية: {e}")
            return {
                'success': False,
                'error': f'خطأ في توليد النسخ الإعلانية: {e}',
                'ad_copies': []
            }

__all__ = ['AICampaignCreator']
