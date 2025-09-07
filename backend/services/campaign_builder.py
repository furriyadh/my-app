"""
بناء الحملات الذكي - Campaign Builder
Google Ads AI Platform - Intelligent Campaign Builder
"""

import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import re

from .ai_processor import AIProcessor
from .google_ads_client import GoogleAdsClientService
from .website_analyzer import WebsiteAnalyzer

class CampaignBuilder:
    """بناء الحملات الإعلانية الذكي"""
    
    def __init__(self):
        """تهيئة بناء الحملات"""
        self.logger = logging.getLogger(__name__)
        self.ai_processor = AIProcessor()
        self.google_ads_client = GoogleAdsClientService()
        self.website_analyzer = WebsiteAnalyzer()
        
        self.logger.info("تم تهيئة بناء الحملات الذكي")
    
    # ===========================================
    # بناء الحملة الذكي
    # ===========================================
    
    def build_smart_campaign(self, campaign_request: Dict[str, Any]) -> Dict[str, Any]:
        """بناء حملة ذكية شاملة"""
        try:
            self.logger.info(f"بدء بناء حملة ذكية: {campaign_request.get('name', 'غير محدد')}")
            
            # تحليل الموقع إذا تم توفيره
            website_analysis = None
            if campaign_request.get('website_url'):
                website_result = self.website_analyzer.analyze_website(campaign_request['website_url'])
                if website_result['success']:
                    website_analysis = website_result['analysis']
            
            # تحليل الكلمات المفتاحية بالذكاء الاصطناعي
            keywords_result = self.ai_processor.analyze_keywords(
                campaign_request.get('business_description', ''),
                campaign_request.get('target_audience', '')
            )
            
            # دمج الكلمات المفتاحية من الموقع
            if website_analysis:
                website_keywords = website_analysis.get('keywords_suggestions', {})
                keywords_result = self._merge_keyword_sources(keywords_result, website_keywords)
            
            # إنشاء النسخ الإعلانية
            ad_copies_result = self.ai_processor.generate_ad_copy(
                [kw['keyword'] for kw in keywords_result.get('keywords', [])[:10]],
                {
                    'name': campaign_request.get('business_name', ''),
                    'description': campaign_request.get('business_description', ''),
                    'website': campaign_request.get('website_url', '')
                }
            )
            
            # بناء هيكل الحملة
            campaign_structure = self._build_campaign_structure(
                campaign_request,
                keywords_result,
                ad_copies_result,
                website_analysis
            )
            
            # تحسين الميزانية والمزايدة
            budget_optimization = self._optimize_budget_and_bidding(
                campaign_request,
                keywords_result,
                website_analysis
            )
            
            # إنشاء الحملة في Google Ads (إذا طُلب)
            google_ads_result = None
            if campaign_request.get('create_in_google_ads', False):
                google_ads_result = self._create_in_google_ads(
                    campaign_request.get('customer_id'),
                    campaign_structure,
                    budget_optimization
                )
            
            return {
                'success': True,
                'campaign_structure': campaign_structure,
                'keywords_analysis': keywords_result,
                'ad_copies': ad_copies_result,
                'budget_optimization': budget_optimization,
                'website_analysis': website_analysis,
                'google_ads_result': google_ads_result,
                'recommendations': self._generate_campaign_recommendations(
                    campaign_structure, keywords_result, website_analysis
                ),
                'timestamp': datetime.now().isoformat(),
                'message': 'تم بناء الحملة الذكية بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في بناء الحملة الذكية: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في بناء الحملة الذكية'
            }
    
    def build_campaign_from_website(self, website_url: str, customer_id: str = None) -> Dict[str, Any]:
        """بناء حملة من تحليل الموقع"""
        try:
            # تحليل الموقع
            website_result = self.website_analyzer.analyze_website(website_url)
            if not website_result['success']:
                return website_result
            
            website_analysis = website_result['analysis']
            
            # استخراج معلومات الأعمال من الموقع
            business_info = website_analysis.get('business_analysis', {})
            
            # بناء طلب الحملة من تحليل الموقع
            campaign_request = {
                'name': f"حملة {website_analysis['basic_info'].get('title', 'الموقع')}",
                'business_name': website_analysis['basic_info'].get('title', ''),
                'business_description': website_analysis['basic_info'].get('description', ''),
                'website_url': website_url,
                'business_type': business_info.get('business_type', 'عام'),
                'services': business_info.get('services', []),
                'target_audience': 'عام',
                'budget': 1000,  # ميزانية افتراضية
                'customer_id': customer_id,
                'create_in_google_ads': bool(customer_id)
            }
            
            # بناء الحملة الذكية
            return self.build_smart_campaign(campaign_request)
            
        except Exception as e:
            self.logger.error(f"خطأ في بناء الحملة من الموقع: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في بناء الحملة من الموقع'
            }
    
    def build_competitor_based_campaign(self, competitor_urls: List[str], business_info: Dict[str, Any]) -> Dict[str, Any]:
        """بناء حملة بناءً على تحليل المنافسين"""
        try:
            competitors_analysis = []
            
            # تحليل مواقع المنافسين
            for url in competitor_urls[:3]:  # أول 3 منافسين فقط
                competitor_result = self.website_analyzer.analyze_competitor_website(url)
                if competitor_result['success']:
                    competitors_analysis.append(competitor_result['analysis'])
            
            if not competitors_analysis:
                return {
                    'success': False,
                    'error': 'فشل في تحليل مواقع المنافسين',
                    'message': 'لم يتم العثور على بيانات منافسين صالحة'
                }
            
            # دمج الكلمات المفتاحية من المنافسين
            competitor_keywords = self._extract_competitor_keywords(competitors_analysis)
            
            # تحليل استراتيجيات المنافسين
            competitor_strategies = self._analyze_competitor_strategies(competitors_analysis)
            
            # بناء استراتيجية مضادة
            counter_strategy = self._build_counter_strategy(competitor_strategies, business_info)
            
            # بناء طلب الحملة
            campaign_request = {
                'name': f"حملة مضادة - {business_info.get('name', 'الأعمال')}",
                'business_name': business_info.get('name', ''),
                'business_description': business_info.get('description', ''),
                'website_url': business_info.get('website', ''),
                'target_audience': business_info.get('target_audience', 'عام'),
                'budget': business_info.get('budget', 1500),
                'competitor_keywords': competitor_keywords,
                'counter_strategy': counter_strategy
            }
            
            # بناء الحملة مع التركيز على المنافسة
            campaign_result = self.build_smart_campaign(campaign_request)
            
            if campaign_result['success']:
                campaign_result['competitors_analysis'] = competitors_analysis
                campaign_result['competitor_strategies'] = competitor_strategies
                campaign_result['counter_strategy'] = counter_strategy
            
            return campaign_result
            
        except Exception as e:
            self.logger.error(f"خطأ في بناء الحملة المضادة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في بناء الحملة المضادة'
            }
    
    # ===========================================
    # بناء هيكل الحملة
    # ===========================================
    
    def _build_campaign_structure(self, request: Dict[str, Any], keywords: Dict[str, Any], 
                                 ads: Dict[str, Any], website_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """بناء هيكل الحملة"""
        
        # معلومات الحملة الأساسية
        campaign_info = {
            'name': request.get('name', f"حملة {datetime.now().strftime('%Y-%m-%d')}"),
            'type': 'SEARCH',
            'status': 'PAUSED',  # تبدأ متوقفة للمراجعة
            'budget': request.get('budget', 1000),
            'bidding_strategy': 'MANUAL_CPC',
            'target_locations': request.get('target_locations', ['السعودية']),
            'target_languages': request.get('target_languages', ['ar']),
            'start_date': datetime.now().strftime('%Y-%m-%d'),
            'end_date': (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')
        }
        
        # بناء مجموعات الإعلانات
        ad_groups = self._build_ad_groups(keywords, ads, request)
        
        # إعدادات الاستهداف
        targeting_settings = self._build_targeting_settings(request, website_analysis)
        
        # إعدادات التتبع
        tracking_settings = self._build_tracking_settings(request)
        
        return {
            'campaign': campaign_info,
            'ad_groups': ad_groups,
            'targeting': targeting_settings,
            'tracking': tracking_settings,
            'extensions': self._build_ad_extensions(request, website_analysis)
        }
    
    def _build_ad_groups(self, keywords: Dict[str, Any], ads: Dict[str, Any], request: Dict[str, Any]) -> List[Dict[str, Any]]:
        """بناء مجموعات الإعلانات"""
        ad_groups = []
        
        # تجميع الكلمات المفتاحية حسب الموضوع
        keyword_groups = self._group_keywords_by_theme(keywords.get('keywords', []))
        
        for theme, theme_keywords in keyword_groups.items():
            # إنشاء مجموعة إعلانات لكل موضوع
            ad_group = {
                'name': f"مجموعة {theme}",
                'status': 'ENABLED',
                'default_cpc': self._calculate_default_cpc(theme_keywords),
                'keywords': self._format_keywords_for_ad_group(theme_keywords),
                'ads': self._select_ads_for_theme(ads.get('ad_copies', []), theme),
                'negative_keywords': self._generate_negative_keywords(theme)
            }
            ad_groups.append(ad_group)
        
        return ad_groups
    
    def _build_targeting_settings(self, request: Dict[str, Any], website_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """بناء إعدادات الاستهداف"""
        targeting = {
            'locations': request.get('target_locations', ['السعودية']),
            'languages': request.get('target_languages', ['ar']),
            'demographics': {
                'age_ranges': request.get('age_ranges', ['25-34', '35-44', '45-54']),
                'genders': request.get('genders', ['MALE', 'FEMALE'])
            },
            'devices': {
                'mobile': True,
                'desktop': True,
                'tablet': True,
                'mobile_bid_modifier': 0.9  # تقليل المزايدة على الجوال قليلاً
            },
            'schedule': {
                'days': request.get('schedule_days', ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
                'hours': request.get('schedule_hours', list(range(8, 22)))  # من 8 صباحاً إلى 10 مساءً
            }
        }
        
        # إضافة استهداف إضافي بناءً على تحليل الموقع
        if website_analysis:
            business_type = website_analysis.get('business_analysis', {}).get('business_type', '')
            if business_type == 'مطعم':
                targeting['schedule']['hours'] = list(range(11, 23))  # ساعات المطاعم
            elif business_type == 'طبي':
                targeting['schedule']['hours'] = list(range(8, 18))  # ساعات العيادات
        
        return targeting
    
    def _build_tracking_settings(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """بناء إعدادات التتبع"""
        return {
            'conversion_tracking': {
                'enabled': True,
                'goals': [
                    {
                        'name': 'إرسال نموذج',
                        'type': 'FORM_SUBMISSION',
                        'value': 50
                    },
                    {
                        'name': 'اتصال هاتفي',
                        'type': 'PHONE_CALL',
                        'value': 30
                    },
                    {
                        'name': 'زيارة صفحة مهمة',
                        'type': 'PAGE_VIEW',
                        'value': 10
                    }
                ]
            },
            'utm_parameters': {
                'utm_source': 'google',
                'utm_medium': 'cpc',
                'utm_campaign': request.get('name', 'campaign'),
                'utm_content': '{keyword}',
                'utm_term': '{keyword}'
            }
        }
    
    def _build_ad_extensions(self, request: Dict[str, Any], website_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """بناء ملحقات الإعلان"""
        extensions = {
            'sitelinks': [],
            'callouts': [],
            'structured_snippets': [],
            'call_extension': None,
            'location_extension': None
        }
        
        # ملحقات الروابط
        if website_analysis:
            services = website_analysis.get('business_analysis', {}).get('services', [])
            for service in services[:4]:  # أول 4 خدمات
                extensions['sitelinks'].append({
                    'text': service[:25],  # حد أقصى 25 حرف
                    'url': request.get('website_url', '') + '#services'
                })
        
        # ملحقات الوصف
        extensions['callouts'] = [
            'خدمة عملاء ممتازة',
            'جودة عالية',
            'أسعار منافسة',
            'توصيل سريع'
        ]
        
        # المقاطع المنظمة
        business_type = website_analysis.get('business_analysis', {}).get('business_type', '') if website_analysis else ''
        if business_type:
            extensions['structured_snippets'] = [
                {
                    'header': 'الخدمات',
                    'values': website_analysis.get('business_analysis', {}).get('services', [])[:10]
                }
            ]
        
        # ملحق الاتصال
        contact_info = website_analysis.get('business_analysis', {}).get('contact_info', {}) if website_analysis else {}
        if contact_info.get('phone'):
            extensions['call_extension'] = {
                'phone_number': contact_info['phone'],
                'country_code': 'SA'
            }
        
        return extensions
    
    # ===========================================
    # تحسين الميزانية والمزايدة
    # ===========================================
    
    def _optimize_budget_and_bidding(self, request: Dict[str, Any], keywords: Dict[str, Any], 
                                   website_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        """تحسين الميزانية والمزايدة"""
        
        total_budget = request.get('budget', 1000)
        keywords_list = keywords.get('keywords', [])
        
        # تحليل المنافسة للكلمات المفتاحية
        competition_analysis = self._analyze_keyword_competition(keywords_list)
        
        # حساب التكلفة المتوقعة لكل نقرة
        estimated_cpcs = self._estimate_keyword_cpcs(keywords_list, competition_analysis)
        
        # توزيع الميزانية على مجموعات الإعلانات
        budget_distribution = self._distribute_budget(total_budget, keywords_list, estimated_cpcs)
        
        # اقتراح استراتيجية المزايدة
        bidding_strategy = self._suggest_bidding_strategy(total_budget, competition_analysis)
        
        return {
            'total_budget': total_budget,
            'daily_budget': total_budget / 30,  # ميزانية يومية
            'budget_distribution': budget_distribution,
            'estimated_cpcs': estimated_cpcs,
            'bidding_strategy': bidding_strategy,
            'competition_analysis': competition_analysis,
            'recommendations': self._generate_budget_recommendations(total_budget, estimated_cpcs)
        }
    
    def _analyze_keyword_competition(self, keywords: List[Dict[str, Any]]) -> Dict[str, Any]:
        """تحليل منافسة الكلمات المفتاحية"""
        # تحليل بسيط للمنافسة بناءً على خصائص الكلمات المفتاحية
        high_competition = []
        medium_competition = []
        low_competition = []
        
        for keyword in keywords:
            keyword_text = keyword.get('keyword', '')
            
            # كلمات عامة = منافسة عالية
            if len(keyword_text.split()) <= 2 and keyword.get('frequency', 0) > 10:
                high_competition.append(keyword_text)
            # كلمات متوسطة الطول = منافسة متوسطة
            elif len(keyword_text.split()) == 3:
                medium_competition.append(keyword_text)
            # كلمات طويلة = منافسة منخفضة
            else:
                low_competition.append(keyword_text)
        
        return {
            'high_competition': high_competition,
            'medium_competition': medium_competition,
            'low_competition': low_competition,
            'competition_score': len(high_competition) * 3 + len(medium_competition) * 2 + len(low_competition)
        }
    
    def _estimate_keyword_cpcs(self, keywords: List[Dict[str, Any]], competition: Dict[str, Any]) -> Dict[str, float]:
        """تقدير تكلفة النقرة للكلمات المفتاحية"""
        estimated_cpcs = {}
        
        for keyword in keywords:
            keyword_text = keyword.get('keyword', '')
            
            # تقدير بسيط بناءً على المنافسة
            if keyword_text in competition['high_competition']:
                base_cpc = 3.0  # 3 ريال
            elif keyword_text in competition['medium_competition']:
                base_cpc = 2.0  # 2 ريال
            else:
                base_cpc = 1.0  # 1 ريال
            
            # تعديل بناءً على طول الكلمة المفتاحية
            word_count = len(keyword_text.split())
            if word_count >= 4:
                base_cpc *= 0.7  # تقليل للكلمات الطويلة
            
            estimated_cpcs[keyword_text] = round(base_cpc, 2)
        
        return estimated_cpcs
    
    def _distribute_budget(self, total_budget: float, keywords: List[Dict[str, Any]], 
                          estimated_cpcs: Dict[str, float]) -> Dict[str, float]:
        """توزيع الميزانية على مجموعات الإعلانات"""
        keyword_groups = self._group_keywords_by_theme(keywords)
        budget_distribution = {}
        
        # حساب الوزن لكل مجموعة
        total_weight = 0
        group_weights = {}
        
        for theme, theme_keywords in keyword_groups.items():
            # الوزن بناءً على عدد الكلمات المفتاحية ومتوسط التكلفة
            avg_cpc = sum(estimated_cpcs.get(kw.get('keyword', ''), 1.0) for kw in theme_keywords) / len(theme_keywords)
            weight = len(theme_keywords) * avg_cpc
            group_weights[theme] = weight
            total_weight += weight
        
        # توزيع الميزانية
        for theme, weight in group_weights.items():
            budget_share = (weight / total_weight) * total_budget if total_weight > 0 else total_budget / len(group_weights)
            budget_distribution[theme] = round(budget_share, 2)
        
        return budget_distribution
    
    def _suggest_bidding_strategy(self, budget: float, competition: Dict[str, Any]) -> Dict[str, Any]:
        """اقتراح استراتيجية المزايدة"""
        competition_score = competition.get('competition_score', 0)
        
        if budget < 500:
            # ميزانية منخفضة - التركيز على الكفاءة
            strategy = {
                'type': 'MANUAL_CPC',
                'enhanced_cpc': True,
                'focus': 'cost_efficiency',
                'recommendations': [
                    'استخدم الكلمات المفتاحية منخفضة المنافسة',
                    'ركز على الكلمات طويلة الذيل',
                    'راقب الأداء يومياً'
                ]
            }
        elif budget < 2000:
            # ميزانية متوسطة - توازن بين الوصول والكفاءة
            strategy = {
                'type': 'TARGET_CPA',
                'target_cpa': 50,
                'focus': 'balanced',
                'recommendations': [
                    'امزج بين الكلمات عالية ومنخفضة المنافسة',
                    'استخدم المزايدة التلقائية المحسنة',
                    'راقب معدل التحويل'
                ]
            }
        else:
            # ميزانية عالية - التركيز على الوصول والنمو
            strategy = {
                'type': 'MAXIMIZE_CONVERSIONS',
                'target_roas': 300,  # 300% عائد على الاستثمار
                'focus': 'growth',
                'recommendations': [
                    'استهدف الكلمات عالية المنافسة',
                    'استخدم جميع أنواع المطابقة',
                    'وسع الاستهداف الجغرافي'
                ]
            }
        
        return strategy
    
    # ===========================================
    # دوال مساعدة
    # ===========================================
    
    def _group_keywords_by_theme(self, keywords: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """تجميع الكلمات المفتاحية حسب الموضوع"""
        themes = {
            'عام': [],
            'منتجات': [],
            'خدمات': [],
            'أسعار': [],
            'موقع': []
        }
        
        for keyword in keywords:
            keyword_text = keyword.get('keyword', '').lower()
            
            if any(word in keyword_text for word in ['منتج', 'سلعة', 'بضاعة']):
                themes['منتجات'].append(keyword)
            elif any(word in keyword_text for word in ['خدمة', 'خدمات', 'استشارة']):
                themes['خدمات'].append(keyword)
            elif any(word in keyword_text for word in ['سعر', 'تكلفة', 'رخيص', 'غالي']):
                themes['أسعار'].append(keyword)
            elif any(word in keyword_text for word in ['قريب', 'موقع', 'عنوان', 'مكان']):
                themes['موقع'].append(keyword)
            else:
                themes['عام'].append(keyword)
        
        # إزالة المجموعات الفارغة
        return {theme: keywords for theme, keywords in themes.items() if keywords}
    
    def _calculate_default_cpc(self, keywords: List[Dict[str, Any]]) -> float:
        """حساب تكلفة النقرة الافتراضية لمجموعة الإعلانات"""
        if not keywords:
            return 1.0
        
        # حساب متوسط بناءً على تقدير المنافسة
        total_estimated_cpc = 0
        for keyword in keywords:
            keyword_text = keyword.get('keyword', '')
            word_count = len(keyword_text.split())
            
            # تقدير بسيط
            if word_count <= 2:
                estimated_cpc = 2.5
            elif word_count == 3:
                estimated_cpc = 2.0
            else:
                estimated_cpc = 1.5
            
            total_estimated_cpc += estimated_cpc
        
        return round(total_estimated_cpc / len(keywords), 2)
    
    def _format_keywords_for_ad_group(self, keywords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """تنسيق الكلمات المفتاحية لمجموعة الإعلانات"""
        formatted_keywords = []
        
        for keyword in keywords:
            keyword_text = keyword.get('keyword', '')
            
            # تحديد نوع المطابقة بناءً على طول الكلمة
            if len(keyword_text.split()) <= 2:
                match_type = 'PHRASE'  # مطابقة العبارة للكلمات القصيرة
            else:
                match_type = 'BROAD'   # مطابقة واسعة للكلمات الطويلة
            
            formatted_keywords.append({
                'text': keyword_text,
                'match_type': match_type,
                'cpc_bid': self._calculate_keyword_bid(keyword),
                'final_url': keyword.get('landing_page', '')
            })
        
        return formatted_keywords
    
    def _calculate_keyword_bid(self, keyword: Dict[str, Any]) -> float:
        """حساب مزايدة الكلمة المفتاحية"""
        base_bid = 1.5
        
        # تعديل بناءً على الصلة
        relevance = keyword.get('relevance', 50)
        if relevance > 80:
            base_bid *= 1.3
        elif relevance > 60:
            base_bid *= 1.1
        elif relevance < 30:
            base_bid *= 0.8
        
        return round(base_bid, 2)
    
    def _select_ads_for_theme(self, ad_copies: List[Dict[str, Any]], theme: str) -> List[Dict[str, Any]]:
        """اختيار الإعلانات المناسبة للموضوع"""
        if not ad_copies:
            return []
        
        # اختيار أول 3 إعلانات (يمكن تحسين هذا لاحقاً)
        selected_ads = ad_copies[:3]
        
        # تخصيص الإعلانات للموضوع
        for ad in selected_ads:
            if theme == 'أسعار':
                # إضافة كلمات متعلقة بالأسعار
                ad['headline1'] = ad.get('headline1', '') + ' - أسعار مميزة'
            elif theme == 'موقع':
                # إضافة كلمات متعلقة بالموقع
                ad['headline2'] = ad.get('headline2', '') + ' قريب منك'
        
        return selected_ads
    
    def _generate_negative_keywords(self, theme: str) -> List[str]:
        """توليد الكلمات المفتاحية السلبية"""
        general_negative = ['مجاني', 'مجانا', 'مجانية', 'وظيفة', 'وظائف', 'تحميل']
        
        theme_specific = {
            'منتجات': ['خدمة', 'استشارة', 'دورة'],
            'خدمات': ['منتج', 'سلعة', 'شراء'],
            'أسعار': ['مجاني', 'مجانا'],
            'موقع': ['أونلاين', 'إنترنت', 'رقمي']
        }
        
        negative_keywords = general_negative.copy()
        if theme in theme_specific:
            negative_keywords.extend(theme_specific[theme])
        
        return negative_keywords
    
    def _merge_keyword_sources(self, ai_keywords: Dict[str, Any], website_keywords: Dict[str, Any]) -> Dict[str, Any]:
        """دمج الكلمات المفتاحية من مصادر مختلفة"""
        merged_keywords = ai_keywords.copy()
        
        if website_keywords and 'primary' in website_keywords:
            # إضافة الكلمات المفتاحية من الموقع
            website_kw_list = []
            for kw in website_keywords['primary'][:10]:  # أول 10 فقط
                website_kw_list.append({
                    'keyword': kw,
                    'source': 'website',
                    'relevance': 70
                })
            
            merged_keywords['keywords'].extend(website_kw_list)
        
        return merged_keywords
    
    def _create_in_google_ads(self, customer_id: str, campaign_structure: Dict[str, Any], 
                            budget_optimization: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء الحملة في Google Ads"""
        try:
            if not customer_id:
                return {'success': False, 'error': 'معرف العميل مطلوب'}
            
            # إنشاء الحملة
            campaign_data = campaign_structure['campaign'].copy()
            campaign_data['budget'] = budget_optimization['daily_budget']
            
            campaign_id = self.google_ads_client.create_campaign(customer_id, campaign_data)
            if not campaign_id:
                return {'success': False, 'error': 'فشل في إنشاء الحملة'}
            
            # إنشاء مجموعات الإعلانات
            created_ad_groups = []
            for ad_group_data in campaign_structure['ad_groups']:
                ad_group_id = self.google_ads_client.create_ad_group(
                    customer_id, campaign_id, ad_group_data
                )
                if ad_group_id:
                    created_ad_groups.append({
                        'id': ad_group_id,
                        'name': ad_group_data['name']
                    })
                    
                    # إضافة الكلمات المفتاحية
                    if ad_group_data.get('keywords'):
                        self.google_ads_client.add_keywords(
                            customer_id, ad_group_id, ad_group_data['keywords']
                        )
                    
                    # إنشاء الإعلانات
                    for ad_data in ad_group_data.get('ads', []):
                        self.google_ads_client.create_text_ad(
                            customer_id, ad_group_id, ad_data
                        )
            
            return {
                'success': True,
                'campaign_id': campaign_id,
                'ad_groups': created_ad_groups,
                'message': 'تم إنشاء الحملة في Google Ads بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الحملة في Google Ads: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_campaign_recommendations(self, campaign_structure: Dict[str, Any], 
                                         keywords: Dict[str, Any], 
                                         website_analysis: Dict[str, Any] = None) -> List[str]:
        """توليد توصيات للحملة"""
        recommendations = []
        
        # توصيات بناءً على عدد الكلمات المفتاحية
        total_keywords = len(keywords.get('keywords', []))
        if total_keywords < 10:
            recommendations.append("أضف المزيد من الكلمات المفتاحية لتحسين الوصول")
        elif total_keywords > 50:
            recommendations.append("قلل عدد الكلمات المفتاحية للتركيز على الأكثر صلة")
        
        # توصيات بناءً على مجموعات الإعلانات
        ad_groups_count = len(campaign_structure.get('ad_groups', []))
        if ad_groups_count < 2:
            recommendations.append("أنشئ مجموعات إعلانات متعددة لتحسين التنظيم")
        
        # توصيات بناءً على تحليل الموقع
        if website_analysis:
            seo_score = website_analysis.get('seo_analysis', {}).get('seo_score', 0)
            if seo_score < 50:
                recommendations.append("حسن SEO الموقع لتحسين جودة الإعلانات")
            
            conversion_score = website_analysis.get('conversion_elements', {}).get('conversion_score', 0)
            if conversion_score < 60:
                recommendations.append("أضف المزيد من عناصر التحويل في صفحة الهبوط")
        
        # توصيات عامة
        recommendations.extend([
            "راقب الأداء يومياً في الأسبوع الأول",
            "اختبر إعلانات متعددة لكل مجموعة",
            "استخدم ملحقات الإعلانات لتحسين الظهور",
            "تابع الكلمات المفتاحية السلبية بانتظام"
        ])
        
        return recommendations
    
    def _generate_budget_recommendations(self, budget: float, estimated_cpcs: Dict[str, float]) -> List[str]:
        """توليد توصيات الميزانية"""
        recommendations = []
        
        avg_cpc = sum(estimated_cpcs.values()) / len(estimated_cpcs) if estimated_cpcs else 2.0
        daily_budget = budget / 30
        estimated_daily_clicks = daily_budget / avg_cpc
        
        if estimated_daily_clicks < 10:
            recommendations.append("الميزانية قد تكون منخفضة للحصول على نقرات كافية")
        elif estimated_daily_clicks > 100:
            recommendations.append("يمكن تقليل الميزانية أو توسيع الاستهداف")
        
        if budget < 500:
            recommendations.append("ركز على الكلمات المفتاحية منخفضة التكلفة")
        elif budget > 5000:
            recommendations.append("فكر في استهداف كلمات مفتاحية أكثر تنافسية")
        
        return recommendations
    
    def _extract_competitor_keywords(self, competitors_analysis: List[Dict[str, Any]]) -> List[str]:
        """استخراج الكلمات المفتاحية من تحليل المنافسين"""
        competitor_keywords = []
        
        for competitor in competitors_analysis:
            keywords = competitor.get('keywords', [])
            for keyword in keywords[:10]:  # أول 10 من كل منافس
                if isinstance(keyword, dict):
                    competitor_keywords.append(keyword.get('keyword', ''))
                else:
                    competitor_keywords.append(str(keyword))
        
        # إزالة التكرارات
        return list(set(competitor_keywords))
    
    def _analyze_competitor_strategies(self, competitors_analysis: List[Dict[str, Any]]) -> Dict[str, Any]:
        """تحليل استراتيجيات المنافسين"""
        strategies = {
            'common_keywords': [],
            'pricing_strategies': [],
            'value_propositions': [],
            'content_themes': []
        }
        
        # تحليل بسيط للاستراتيجيات
        for competitor in competitors_analysis:
            if 'pricing_strategy' in competitor:
                strategies['pricing_strategies'].append(competitor['pricing_strategy'])
            if 'value_propositions' in competitor:
                strategies['value_propositions'].extend(competitor['value_propositions'])
        
        return strategies
    
    def _build_counter_strategy(self, competitor_strategies: Dict[str, Any], business_info: Dict[str, Any]) -> Dict[str, Any]:
        """بناء استراتيجية مضادة"""
        counter_strategy = {
            'differentiation_points': [],
            'competitive_advantages': [],
            'pricing_approach': 'competitive',
            'messaging_focus': 'value'
        }
        
        # تحديد نقاط التميز
        counter_strategy['differentiation_points'] = [
            'جودة أعلى',
            'خدمة عملاء أفضل',
            'أسعار أكثر تنافسية',
            'توصيل أسرع'
        ]
        
        return counter_strategy


    # ===== الدوال المفقودة المطلوبة =====
    
    def create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء حملة إعلانية جديدة"""
        try:
            self.logger.info(f"بدء إنشاء حملة: {campaign_data.get('name', 'غير محدد')}")
            
            # التحقق من البيانات المطلوبة
            required_fields = ['name', 'budget', 'keywords']
            for field in required_fields:
                if not campaign_data.get(field):
                    return {
                        'success': False,
                        'error': f'الحقل المطلوب مفقود: {field}',
                        'message': 'بيانات الحملة غير مكتملة'
                    }
            
            # إنشاء معرف فريد للحملة
            campaign_id = f"camp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # بناء هيكل الحملة الأساسي
            campaign_structure = {
                'campaign_id': campaign_id,
                'name': campaign_data['name'],
                'type': campaign_data.get('type', 'SEARCH'),
                'status': campaign_data.get('status', 'PAUSED'),
                'budget': {
                    'amount': campaign_data['budget'],
                    'delivery_method': campaign_data.get('budget_delivery', 'STANDARD')
                },
                'bidding_strategy': {
                    'type': campaign_data.get('bidding_strategy', 'MANUAL_CPC'),
                    'target_cpa': campaign_data.get('target_cpa'),
                    'target_roas': campaign_data.get('target_roas')
                },
                'targeting': {
                    'locations': campaign_data.get('target_locations', ['السعودية']),
                    'languages': campaign_data.get('target_languages', ['ar']),
                    'demographics': campaign_data.get('demographics', {})
                },
                'schedule': {
                    'start_date': campaign_data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
                    'end_date': campaign_data.get('end_date'),
                    'ad_schedule': campaign_data.get('ad_schedule', [])
                }
            }
            
            # إنشاء مجموعات الإعلانات
            ad_groups = []
            keywords = campaign_data.get('keywords', [])
            
            # تجميع الكلمات حسب الموضوع
            keyword_groups = self._group_keywords_by_similarity(keywords)
            
            for group_name, group_keywords in keyword_groups.items():
                ad_group = {
                    'ad_group_id': f"ag_{len(ad_groups) + 1}_{campaign_id}",
                    'name': f"مجموعة {group_name}",
                    'status': 'ENABLED',
                    'default_cpc': self._calculate_suggested_cpc(group_keywords),
                    'keywords': [
                        {
                            'keyword': kw,
                            'match_type': 'BROAD_MATCH_MODIFIER',
                            'cpc': self._calculate_keyword_cpc(kw),
                            'status': 'ENABLED'
                        } for kw in group_keywords
                    ],
                    'ads': self._generate_default_ads(group_name, campaign_data)
                }
                ad_groups.append(ad_group)
            
            campaign_structure['ad_groups'] = ad_groups
            
            # إضافة ملحقات الإعلان
            campaign_structure['extensions'] = self._create_default_extensions(campaign_data)
            
            # حفظ الحملة (في التطبيق الحقيقي، سيتم حفظها في قاعدة البيانات)
            self.logger.info(f"تم إنشاء الحملة بنجاح: {campaign_id}")
            
            return {
                'success': True,
                'campaign_id': campaign_id,
                'campaign_structure': campaign_structure,
                'ad_groups_count': len(ad_groups),
                'keywords_count': len(keywords),
                'estimated_daily_budget': campaign_data['budget'],
                'message': 'تم إنشاء الحملة بنجاح',
                'next_steps': [
                    'مراجعة الكلمات المفتاحية',
                    'تخصيص النسخ الإعلانية',
                    'تفعيل الحملة'
                ]
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في إنشاء الحملة'
            }
    
    def build_campaign_structure(self, business_info: Dict[str, Any], keywords: List[str]) -> Dict[str, Any]:
        """بناء هيكل حملة متكامل"""
        try:
            self.logger.info("بدء بناء هيكل الحملة المتكامل")
            
            # تحليل نوع الأعمال
            business_type = business_info.get('business_type', 'عام')
            business_name = business_info.get('business_name', 'الأعمال')
            
            # إنشاء استراتيجية الحملة بناءً على نوع الأعمال
            campaign_strategy = self._create_business_specific_strategy(business_type, business_info)
            
            # تحليل الكلمات المفتاحية وتجميعها
            keyword_analysis = self._analyze_and_group_keywords(keywords, business_type)
            
            # بناء مجموعات الإعلانات المتخصصة
            specialized_ad_groups = self._create_specialized_ad_groups(
                keyword_analysis, business_info, campaign_strategy
            )
            
            # إنشاء النسخ الإعلانية المخصصة
            custom_ad_copies = self._create_custom_ad_copies(
                specialized_ad_groups, business_info
            )
            
            # تحديد استراتيجية المزايدة المثلى
            bidding_strategy = self._determine_optimal_bidding_strategy(
                business_type, business_info.get('budget', 1000), keyword_analysis
            )
            
            # إنشاء إعدادات الاستهداف المتقدمة
            advanced_targeting = self._create_advanced_targeting(business_info, business_type)
            
            # بناء الهيكل النهائي
            campaign_structure = {
                'campaign_info': {
                    'name': f"حملة {business_name} - {business_type}",
                    'type': campaign_strategy['campaign_type'],
                    'objective': campaign_strategy['objective'],
                    'budget': business_info.get('budget', 1000),
                    'bidding_strategy': bidding_strategy,
                    'status': 'PAUSED'  # تبدأ متوقفة للمراجعة
                },
                'ad_groups': specialized_ad_groups,
                'ad_copies': custom_ad_copies,
                'targeting': advanced_targeting,
                'extensions': self._create_business_specific_extensions(business_info),
                'tracking': self._setup_conversion_tracking(business_type),
                'optimization_rules': self._create_optimization_rules(business_type),
                'performance_targets': self._set_performance_targets(business_info, keyword_analysis)
            }
            
            # إضافة توصيات التحسين
            optimization_recommendations = self._generate_structure_recommendations(
                campaign_structure, business_info
            )
            
            return {
                'success': True,
                'campaign_structure': campaign_structure,
                'keyword_analysis': keyword_analysis,
                'campaign_strategy': campaign_strategy,
                'optimization_recommendations': optimization_recommendations,
                'estimated_performance': self._estimate_campaign_performance(
                    campaign_structure, keyword_analysis
                ),
                'setup_checklist': self._create_setup_checklist(campaign_structure),
                'message': 'تم بناء هيكل الحملة المتكامل بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في بناء هيكل الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في بناء هيكل الحملة'
            }
    
    def optimize_existing_campaign(self, campaign_id: str, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """تحسين حملة موجودة بناءً على بيانات الأداء"""
        try:
            self.logger.info(f"بدء تحسين الحملة: {campaign_id}")
            
            # تحليل أداء الحملة الحالي
            performance_analysis = self._analyze_campaign_performance(performance_data)
            
            # تحديد نقاط الضعف والقوة
            strengths = performance_analysis['strengths']
            weaknesses = performance_analysis['weaknesses']
            
            # إنشاء خطة التحسين
            optimization_plan = {
                'immediate_actions': [],
                'short_term_improvements': [],
                'long_term_strategies': [],
                'budget_adjustments': {},
                'keyword_optimizations': {},
                'ad_copy_improvements': {},
                'targeting_refinements': {}
            }
            
            # تحسينات فورية (مشاكل حرجة)
            if performance_analysis['ctr'] < 1.0:
                optimization_plan['immediate_actions'].append({
                    'action': 'تحسين النسخ الإعلانية',
                    'priority': 'عاجل',
                    'description': 'معدل النقر منخفض جداً',
                    'expected_impact': 'زيادة CTR بنسبة 50-100%'
                })
            
            if performance_analysis['quality_score'] < 5:
                optimization_plan['immediate_actions'].append({
                    'action': 'تحسين نقاط الجودة',
                    'priority': 'عاجل',
                    'description': 'نقاط الجودة منخفضة تؤثر على التكلفة',
                    'expected_impact': 'تقليل CPC بنسبة 30-50%'
                })
            
            # تحسينات قصيرة المدى (1-2 أسبوع)
            optimization_plan['short_term_improvements'] = [
                {
                    'action': 'إضافة كلمات مفتاحية سلبية',
                    'timeline': '3-5 أيام',
                    'description': 'منع النقرات غير المرغوبة',
                    'expected_impact': 'تحسين جودة الزيارات بنسبة 20%'
                },
                {
                    'action': 'تحسين صفحات الهبوط',
                    'timeline': '1-2 أسبوع',
                    'description': 'زيادة معدل التحويل',
                    'expected_impact': 'زيادة التحويلات بنسبة 25%'
                }
            ]
            
            # استراتيجيات طويلة المدى (شهر+)
            optimization_plan['long_term_strategies'] = [
                {
                    'strategy': 'توسيع الاستهداف الجغرافي',
                    'timeline': '1-2 شهر',
                    'description': 'اختبار مناطق جديدة تدريجياً',
                    'expected_impact': 'زيادة الوصول بنسبة 40%'
                },
                {
                    'strategy': 'تطوير حملات متخصصة',
                    'timeline': '2-3 شهر',
                    'description': 'إنشاء حملات لخدمات محددة',
                    'expected_impact': 'تحسين الصلة والأداء'
                }
            ]
            
            # تحسينات الميزانية
            current_budget = performance_data.get('budget', 1000)
            if performance_analysis['budget_utilization'] > 0.9:
                optimization_plan['budget_adjustments'] = {
                    'recommendation': 'زيادة الميزانية',
                    'suggested_increase': '20-30%',
                    'reason': 'الميزانية مستنفدة والأداء جيد',
                    'new_budget': current_budget * 1.25
                }
            
            # تحسينات الكلمات المفتاحية
            optimization_plan['keyword_optimizations'] = self._optimize_keywords_based_on_performance(
                performance_data.get('keyword_performance', [])
            )
            
            # تحسينات النسخ الإعلانية
            optimization_plan['ad_copy_improvements'] = self._suggest_ad_copy_improvements(
                performance_data.get('ad_performance', [])
            )
            
            # تحسينات الاستهداف
            optimization_plan['targeting_refinements'] = self._refine_targeting_based_on_performance(
                performance_data.get('audience_performance', {})
            )
            
            # تقدير التأثير المتوقع
            expected_improvements = self._calculate_expected_improvements(
                optimization_plan, performance_analysis
            )
            
            return {
                'success': True,
                'campaign_id': campaign_id,
                'current_performance': performance_analysis,
                'optimization_plan': optimization_plan,
                'expected_improvements': expected_improvements,
                'implementation_timeline': self._create_implementation_timeline(optimization_plan),
                'monitoring_metrics': self._define_monitoring_metrics(),
                'message': 'تم إنشاء خطة تحسين شاملة للحملة'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحسين الحملة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'فشل في تحسين الحملة'
            }
    
    # ===== دوال مساعدة للدوال الجديدة =====
    
    def _group_keywords_by_similarity(self, keywords: List[str]) -> Dict[str, List[str]]:
        """تجميع الكلمات المفتاحية حسب التشابه"""
        groups = {}
        
        for keyword in keywords:
            # تحديد المجموعة بناءً على الكلمة الأولى
            first_word = keyword.split()[0] if keyword.split() else 'عام'
            
            if first_word not in groups:
                groups[first_word] = []
            groups[first_word].append(keyword)
        
        # إذا كانت المجموعات قليلة، أنشئ مجموعة عامة
        if len(groups) < 2:
            groups = {'المجموعة الرئيسية': keywords}
        
        return groups
    
    def _calculate_suggested_cpc(self, keywords: List[str]) -> float:
        """حساب تكلفة النقرة المقترحة"""
        # خوارزمية بسيطة لحساب CPC بناءً على طول الكلمات
        avg_length = sum(len(kw.split()) for kw in keywords) / len(keywords)
        
        if avg_length <= 2:
            return 2.5  # كلمات قصيرة = منافسة أعلى
        elif avg_length <= 4:
            return 1.8  # كلمات متوسطة
        else:
            return 1.2  # كلمات طويلة = منافسة أقل
    
    def _calculate_keyword_cpc(self, keyword: str) -> float:
        """حساب تكلفة النقرة لكلمة محددة"""
        word_count = len(keyword.split())
        
        # كلمات أكثر تحديداً = تكلفة أقل
        base_cpc = 2.0
        if word_count >= 3:
            base_cpc *= 0.7
        elif word_count >= 4:
            base_cpc *= 0.5
        
        return round(base_cpc, 2)
    
    def _generate_default_ads(self, group_name: str, campaign_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """إنشاء إعلانات افتراضية لمجموعة"""
        business_name = campaign_data.get('business_name', 'أعمالنا')
        
        return [
            {
                'headline_1': f'{business_name} - {group_name}',
                'headline_2': 'خدمات متميزة',
                'headline_3': 'اتصل الآن',
                'description_1': f'احصل على أفضل خدمات {group_name} بجودة عالية وأسعار منافسة',
                'description_2': 'فريق محترف وخدمة عملاء ممتازة',
                'final_url': campaign_data.get('website_url', 'https://example.com'),
                'path_1': group_name[:15],
                'path_2': 'خدمات'
            }
        ]
    
    def _create_default_extensions(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء ملحقات افتراضية"""
        return {
            'sitelinks': [
                {'text': 'خدماتنا', 'url': campaign_data.get('website_url', '') + '/services'},
                {'text': 'من نحن', 'url': campaign_data.get('website_url', '') + '/about'},
                {'text': 'اتصل بنا', 'url': campaign_data.get('website_url', '') + '/contact'}
            ],
            'callouts': [
                'خدمة عملاء 24/7',
                'جودة مضمونة',
                'أسعار منافسة',
                'توصيل سريع'
            ],
            'structured_snippets': [
                {
                    'header': 'الخدمات',
                    'values': campaign_data.get('services', ['خدمة عامة'])
                }
            ]
        }
    
    def _create_business_specific_strategy(self, business_type: str, business_info: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء استراتيجية خاصة بنوع الأعمال"""
        strategies = {
            'مطعم': {
                'campaign_type': 'SEARCH',
                'objective': 'STORE_VISITS_AND_CONVERSIONS',
                'focus_keywords': ['طعام', 'مطعم', 'توصيل', 'وجبات'],
                'peak_hours': [12, 13, 19, 20, 21],
                'location_radius': 10
            },
            'طبي': {
                'campaign_type': 'SEARCH',
                'objective': 'CONVERSIONS',
                'focus_keywords': ['طبيب', 'عيادة', 'علاج', 'استشارة'],
                'peak_hours': [9, 10, 11, 14, 15, 16],
                'location_radius': 25
            },
            'تجارة إلكترونية': {
                'campaign_type': 'SHOPPING',
                'objective': 'CONVERSIONS',
                'focus_keywords': ['شراء', 'منتج', 'متجر', 'تسوق'],
                'peak_hours': [19, 20, 21, 22],
                'location_radius': 50
            },
            'خدمات': {
                'campaign_type': 'SEARCH',
                'objective': 'CONVERSIONS',
                'focus_keywords': ['خدمة', 'شركة', 'محترف', 'خبير'],
                'peak_hours': [9, 10, 11, 14, 15, 16, 17],
                'location_radius': 30
            }
        }
        
        return strategies.get(business_type, strategies['خدمات'])
    
    def _analyze_and_group_keywords(self, keywords: List[str], business_type: str) -> Dict[str, Any]:
        """تحليل وتجميع الكلمات المفتاحية"""
        analysis = {
            'total_keywords': len(keywords),
            'keyword_groups': {},
            'difficulty_analysis': {},
            'search_volume_estimates': {},
            'competition_levels': {}
        }
        
        # تجميع الكلمات حسب الموضوع
        for keyword in keywords:
            # تحديد المجموعة بناءً على الكلمات الرئيسية
            group = 'عام'
            if any(word in keyword for word in ['سعر', 'تكلفة', 'رخيص']):
                group = 'الأسعار'
            elif any(word in keyword for word in ['أفضل', 'ممتاز', 'جودة']):
                group = 'الجودة'
            elif any(word in keyword for word in ['قريب', 'محلي', 'منطقة']):
                group = 'محلي'
            elif any(word in keyword for word in ['سريع', 'فوري', 'عاجل']):
                group = 'السرعة'
            
            if group not in analysis['keyword_groups']:
                analysis['keyword_groups'][group] = []
            analysis['keyword_groups'][group].append(keyword)
            
            # تقدير صعوبة الكلمة
            difficulty = self._estimate_keyword_difficulty(keyword)
            analysis['difficulty_analysis'][keyword] = difficulty
            
            # تقدير حجم البحث
            search_volume = self._estimate_search_volume(keyword, business_type)
            analysis['search_volume_estimates'][keyword] = search_volume
            
            # تقدير مستوى المنافسة
            competition = self._estimate_competition_level(keyword)
            analysis['competition_levels'][keyword] = competition
        
        return analysis
    
    def _estimate_keyword_difficulty(self, keyword: str) -> str:
        """تقدير صعوبة الكلمة المفتاحية"""
        word_count = len(keyword.split())
        
        if word_count == 1:
            return 'عالي'
        elif word_count == 2:
            return 'متوسط'
        else:
            return 'منخفض'
    
    def _estimate_search_volume(self, keyword: str, business_type: str) -> str:
        """تقدير حجم البحث"""
        # تقدير بسيط بناءً على نوع الأعمال وطول الكلمة
        high_volume_types = ['مطعم', 'تجارة إلكترونية']
        word_count = len(keyword.split())
        
        if business_type in high_volume_types and word_count <= 2:
            return 'عالي'
        elif word_count <= 3:
            return 'متوسط'
        else:
            return 'منخفض'
    
    def _estimate_competition_level(self, keyword: str) -> str:
        """تقدير مستوى المنافسة"""
        commercial_words = ['شراء', 'سعر', 'أفضل', 'رخيص', 'عرض']
        
        if any(word in keyword for word in commercial_words):
            return 'عالي'
        elif len(keyword.split()) <= 2:
            return 'متوسط'
        else:
            return 'منخفض'

# تصدير الكلاس
__all__ = ['CampaignBuilder']

