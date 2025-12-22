#!/usr/bin/env python3
"""
Google Keyword Planner Service - خدمة مخطط الكلمات المفتاحية
Google Ads API v21 - Keyword Planning Integration
"""

import os
import sys
import logging
import time
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# إضافة مسار المكتبة الرسمية
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'google-ads-official'))

# استيراد المكتبة الرسمية
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    GOOGLE_ADS_AVAILABLE = True
except ImportError as e:
    logging.error(f"فشل استيراد المكتبة الرسمية: {e}")
    GOOGLE_ADS_AVAILABLE = False

# تحميل متغيرات البيئة
env_path = Path(__file__).parent.parent.parent / '.env.development'
if env_path.exists():
    load_dotenv(env_path)

# إعداد التسجيل
logger = logging.getLogger(__name__)

class KeywordPlannerService:
    """
    خدمة مخطط الكلمات المفتاحية - Google Keyword Planner API
    تخطيط الكلمات الرئيسية: أفكار → مقاييس توقعات → حملة جديدة → تعديل → تشغيل
    """
    
    def __init__(self):
        self.client = None
        self.is_initialized = False
        
        # متغيرات البيئة
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        # تخزين مؤقت للنتائج (مهم بسبب محدودية معدل الطلبات)
        self.cache = {}
        self.cache_duration = 3600  # ساعة واحدة
        
        # التحقق من المتغيرات
        self._validate_configuration()
        
        # محاولة التهيئة
        if GOOGLE_ADS_AVAILABLE:
            self._initialize_client()
    
    def _get_cache_key(self, method_name: str, params: Dict[str, Any]) -> str:
        """إنشاء مفتاح التخزين المؤقت"""
        import hashlib
        import json
        key_string = f"{method_name}_{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """التحقق من صحة التخزين المؤقت"""
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache[cache_key].get('timestamp', 0)
        current_time = time.time()
        return (current_time - cache_time) < self.cache_duration
    
    def _get_cached_result(self, cache_key: str) -> Dict[str, Any]:
        """الحصول على النتيجة من التخزين المؤقت"""
        return self.cache[cache_key].get('data', {})
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """حفظ النتيجة في التخزين المؤقت"""
        self.cache[cache_key] = {
            'data': result,
            'timestamp': time.time()
        }
    
    def _get_cache_key(self, method_name: str, params: Dict[str, Any]) -> str:
        """إنشاء مفتاح التخزين المؤقت"""
        import hashlib
        import json
        key_data = f"{method_name}_{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """الحصول على نتيجة من التخزين المؤقت"""
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration:
                logger.info(f"📦 استخدام النتيجة من التخزين المؤقت: {cache_key[:8]}...")
                return cached_data
            else:
                # انتهت صلاحية التخزين المؤقت
                del self.cache[cache_key]
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]):
        """حفظ النتيجة في التخزين المؤقت"""
        self.cache[cache_key] = (result, time.time())
        logger.info(f"💾 حفظ النتيجة في التخزين المؤقت: {cache_key[:8]}...")
    
    def _validate_configuration(self):
        """التحقق من صحة الإعدادات"""
        required_vars = [
            'GOOGLE_ADS_DEVELOPER_TOKEN',
            'GOOGLE_ADS_CLIENT_ID', 
            'GOOGLE_ADS_CLIENT_SECRET',
            'GOOGLE_ADS_REFRESH_TOKEN',
            'MCC_LOGIN_CUSTOMER_ID'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            logger.error(f"متغيرات البيئة المفقودة: {missing_vars}")
            self.is_initialized = False
        else:
            logger.info("All environment variables are available")
    
    def _initialize_client(self):
        """تهيئة عميل Google Ads الرسمي"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متاحة")
                return False
            
            # إعداد التكوين
            config = {
                'developer_token': self.developer_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': self.refresh_token,
                'login_customer_id': self.mcc_customer_id,
                'use_proto_plus': True
            }
            
            # إنشاء العميل
            self.client = GoogleAdsClient.load_from_dict(config)
            self.is_initialized = True
            logger.info("✅ Google Ads client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"فشل في إنشاء Google Ads Client: {e}")
            self.is_initialized = False
            return False
    
    def map_locations_ids_to_resource_names(self, client, location_ids: List[str]) -> List[str]:
        """تحويل معرفات المواقع إلى أسماء الموارد - تطبيق الكود الرسمي"""
        try:
            googleads_service = client.get_service("GoogleAdsService")
            location_rns = []
            for location_id in location_ids:
                location_rn = googleads_service.geo_target_constant_path(location_id)
                location_rns.append(location_rn)
            return location_rns
        except Exception as e:
            logger.error(f"خطأ في تحويل معرفات المواقع: {e}")
            return []
    
    def main_generate_keyword_ideas(self, customer_id: str, location_ids: List[str], 
                                   language_id: str, keyword_texts: List[str] = None, 
                                   page_url: str = None) -> Dict[str, Any]:
        """الدالة الرئيسية لإنشاء أفكار الكلمات المفتاحية - تطبيق الكود الرسمي بالضبط"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'keywords': []
                }
            
            # تطبيق الكود الرسمي بالضبط
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            keyword_competition_level_enum = self.client.enums.KeywordPlanCompetitionLevelEnum
            keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH_AND_PARTNERS
            location_rns = self.map_locations_ids_to_resource_names(self.client, location_ids)
            google_ads_service = self.client.get_service("GoogleAdsService")
            language_rn = google_ads_service.language_constant_path(language_id)

            # Either keywords or a page_url are required to generate keyword ideas
            # so this raises an error if neither are provided.
            if not (keyword_texts or page_url):
                return {
                    'success': False,
                    'error': 'At least one of keywords or page URL is required, but neither was specified.',
                    'keywords': []
                }

            # Only one of the fields "url_seed", "keyword_seed", or
            # "keyword_and_url_seed" can be set on the request, depending on whether
            # keywords, a page_url or both were passed to this function.
            request = self.client.get_type("GenerateKeywordIdeasRequest")
            request.customer_id = customer_id
            request.language = language_rn
            request.geo_target_constants = location_rns
            request.include_adult_keywords = False
            request.keyword_plan_network = keyword_plan_network

            # To generate keyword ideas with only a page_url and no keywords we need
            # to initialize a UrlSeed object with the page_url as the "url" field.
            if not keyword_texts and page_url:
                request.url_seed.url = page_url

            # To generate keyword ideas with only a list of keywords and no page_url
            # we need to initialize a KeywordSeed object and set the "keywords" field
            # to be a list of StringValue objects.
            if keyword_texts and not page_url:
                request.keyword_seed.keywords.extend(keyword_texts)

            # To generate keyword ideas using both a list of keywords and a page_url we
            # need to initialize a KeywordAndUrlSeed object, setting both the "url" and
            # "keywords" fields.
            if keyword_texts and page_url:
                request.keyword_and_url_seed.url = page_url
                request.keyword_and_url_seed.keywords.extend(keyword_texts)

            keyword_ideas = keyword_plan_idea_service.generate_keyword_ideas(request=request)

            # معالجة النتائج الحقيقية - تطبيق الكود الرسمي بالضبط
            keywords = []
            for idea in keyword_ideas:
                competition_value = idea.keyword_idea_metrics.competition.name
                print(
                    f'Keyword idea text "{idea.text}" has '
                    f'"{idea.keyword_idea_metrics.avg_monthly_searches}" '
                    f'average monthly searches and "{competition_value}" '
                    "competition.\n"
                )
                
                keyword_data = {
                    'keyword': idea.text,
                    'avg_monthly_searches': idea.keyword_idea_metrics.avg_monthly_searches,
                    'competition': competition_value,
                    'competition_index': idea.keyword_idea_metrics.competition_index,
                    'low_top_of_page_bid_micros': idea.keyword_idea_metrics.low_top_of_page_bid_micros,
                    'high_top_of_page_bid_micros': idea.keyword_idea_metrics.high_top_of_page_bid_micros,
                    'source': 'google_keyword_planner_real'
                }
                keywords.append(keyword_data)
            
            logger.info(f"✅ Extracted {len(keywords)} real keywords from Google Keyword Planner")
            
            return {
                'success': True,
                'keywords': keywords,
                'total_count': len(keywords),
                'message': f'تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من Google Keyword Planner'
            }
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج الكلمات المفتاحية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'keywords': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج الكلمات المفتاحية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'keywords': []
            }
    
    def generate_keyword_ideas(self, customer_id: str, keyword_plan_request: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء أفكار الكلمات المفتاحية الحقيقية باستخدام Google Keyword Planner API
        
        تطبيق الكود الرسمي من Google Ads API:
        - KeywordSeed: للكلمات والعبارات
        - UrlSeed: لعنوان URL محدد  
        - KeywordAndUrlSeed: للكلمات + URL (أفضل نتائج)
        - SiteSeed: للموقع كاملاً (حتى 250,000 فكرة)
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'keywords': []
                }
            
            # فحص customer_id
            if not customer_id or customer_id.strip() == '':
                logger.warning("customer_id فارغ - سيتم استخدام fallback")
                return {
                    'success': False,
                    'error': 'customer_id مطلوب لاستخدام Google Keyword Planner API',
                    'keywords': []
                }
            
            # التحقق من التخزين المؤقت
            cache_key = f"keyword_ideas_{hash(str(keyword_plan_request))}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if time.time() - cached_result['timestamp'] < self.cache_duration:
                    logger.info("📋 استخدام النتائج من التخزين المؤقت")
                    return cached_result['data']
            
            # الحصول على الخدمات - تطبيق الكود الرسمي
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            google_ads_service = self.client.get_service("GoogleAdsService")
            
            # إعداد المعايير - تطبيق الكود الرسمي
            keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH_AND_PARTNERS
            
            # إعداد اللغة - يجب توفيرها من المستخدم
            language_id = keyword_plan_request.get('language_id')
            if not language_id:
                return {
                    'success': False,
                    'error': 'language_id مطلوب - يجب توفير معرف اللغة',
                    'keywords': []
                }
            language_rn = google_ads_service.language_constant_path(language_id)
            
            # إعداد المواقع الجغرافية - يجب توفيرها من المستخدم
            geo_target_ids = keyword_plan_request.get('geo_target_ids')
            if not geo_target_ids:
                return {
                    'success': False,
                    'error': 'geo_target_ids مطلوب - يجب توفير معرفات المواقع الجغرافية',
                    'keywords': []
                }
            location_rns = self.map_locations_ids_to_resource_names(self.client, geo_target_ids)
            
            # إعداد البذور (Seeds) - تطبيق الكود الرسمي
            keyword_texts = keyword_plan_request.get('keyword_texts', [])
            page_url = keyword_plan_request.get('page_url', '')
            site_url = keyword_plan_request.get('site_url', '')
            
            # التحقق من وجود البيانات المطلوبة - تطبيق الكود الرسمي
            if not (keyword_texts or page_url or site_url):
                return {
                    'success': False,
                    'error': 'يجب توفير كلمات مفتاحية أو رابط صفحة أو موقع',
                    'keywords': []
                }
            
            # إنشاء الطلب - تطبيق الكود الرسمي
            request = self.client.get_type("GenerateKeywordIdeasRequest")
            request.customer_id = customer_id
            request.language = language_rn
            request.geo_target_constants = location_rns
            request.include_adult_keywords = False
            request.keyword_plan_network = keyword_plan_network
            
            # إعداد البذور حسب البيانات المتوفرة - تطبيق الكود الرسمي
            if site_url:
                # استخدام SiteSeed للموقع كاملاً (أفضل النتائج - حتى 250,000 فكرة)
                request.site_seed.site = site_url
                logger.info(f"🌐 استخدام SiteSeed للموقع: {site_url}")
            elif keyword_texts and page_url:
                # استخدام KeywordAndUrlSeed (نتائج أفضل من UrlSeed فقط)
                request.keyword_and_url_seed.url = page_url
                request.keyword_and_url_seed.keywords.extend(keyword_texts)
                logger.info(f"🔗 استخدام KeywordAndUrlSeed: {keyword_texts} + {page_url}")
            elif keyword_texts and not page_url:
                # استخدام KeywordSeed فقط
                request.keyword_seed.keywords.extend(keyword_texts)
                logger.info(f"📝 استخدام KeywordSeed: {keyword_texts}")
            elif not keyword_texts and page_url:
                # استخدام UrlSeed فقط
                request.url_seed.url = page_url
                logger.info(f"🔗 استخدام UrlSeed: {page_url}")
            
            # إعداد المقاييس التاريخية - تطبيق الكود الرسمي
            if keyword_plan_request.get('include_historical_metrics', True):
                historical_metrics_options = self.client.get_type("HistoricalMetricsOptions")
                historical_metrics_options.include_average_cpc = True
                request.historical_metrics_options = historical_metrics_options
            
            # تنفيذ الطلب الحقيقي - تطبيق الكود الرسمي
            logger.info(f"Searching for real keywords from Google...")
            logger.info(f"Request params: customer_id={customer_id}, language={language_id}, locations={len(location_rns)}, keywords={len(keyword_texts) if keyword_texts else 0}")
            keyword_ideas = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            
            # Count total results
            ideas_list = list(keyword_ideas)
            logger.info(f"Google returned {len(ideas_list)} keyword ideas")
            
            # معالجة النتائج الحقيقية - تطبيق الكود الرسمي
            keywords = []
            for idea in ideas_list:
                try:
                    if hasattr(idea, 'keyword_idea_metrics') and hasattr(idea, 'text'):
                        competition_value = idea.keyword_idea_metrics.competition.name
                        
                        keyword_data = {
                            'keyword': idea.text,
                            'avg_monthly_searches': idea.keyword_idea_metrics.avg_monthly_searches,
                            'competition': competition_value,
                            'competition_index': idea.keyword_idea_metrics.competition_index,
                            'low_top_of_page_bid_micros': idea.keyword_idea_metrics.low_top_of_page_bid_micros,
                            'high_top_of_page_bid_micros': idea.keyword_idea_metrics.high_top_of_page_bid_micros,
                            'source': 'google_keyword_planner_real'
                        }
                        keywords.append(keyword_data)
                        
                        # طباعة النتائج كما في الكود الرسمي
                        logger.info(
                            f'Keyword idea text "{idea.text}" has '
                            f'"{idea.keyword_idea_metrics.avg_monthly_searches}" '
                            f'average monthly searches and "{competition_value}" '
                            "competition."
                        )
                except Exception as parse_error:
                    logger.warning(f"Error parsing keyword idea: {parse_error}")
            
            # حفظ في التخزين المؤقت
            result = {
                'success': True,
                'keywords': keywords,
                'total_count': len(keywords),
                'message': f'تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من Google Keyword Planner'
            }
            
            self.cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ Extracted {len(keywords)} real keywords from Google Keyword Planner")
            
            return result
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج الكلمات المفتاحية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'keywords': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج الكلمات المفتاحية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'keywords': []
            }
    
    def generate_ad_group_themes(self, customer_id: str, ad_group_theme_request: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء مواضيع مجموعات الإعلانات الحقيقية
        
        تنظيم تلقائي للكلمات المفتاحية في مجموعات إعلانية حسب المواضيع
        مثال: "bakery" → "bakery near me", "local bakery", "cake shop"
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'themes': []
                }
            
            # التحقق من التخزين المؤقت
            cache_key = f"ad_group_themes_{hash(str(ad_group_theme_request))}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if time.time() - cached_result['timestamp'] < self.cache_duration:
                    logger.info("📋 استخدام مواضيع المجموعات من التخزين المؤقت")
                    return cached_result['data']
            
            # الحصول على الخدمات
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            google_ads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء طلب مواضيع مجموعات الإعلانات
            request = self.client.get_type("GenerateAdGroupThemesRequest")
            request.customer_id = customer_id
            
            # إعداد اللغة - يجب توفيرها من المستخدم
            language_id = ad_group_theme_request.get('language_id')
            if not language_id:
                return {
                    'success': False,
                    'error': 'language_id مطلوب - يجب توفير معرف اللغة',
                    'themes': []
                }
            request.language = google_ads_service.language_constant_path(language_id)
            
            # إعداد المواقع الجغرافية - يجب توفيرها من المستخدم
            geo_target_ids = ad_group_theme_request.get('geo_target_ids')
            if not geo_target_ids:
                return {
                    'success': False,
                    'error': 'geo_target_ids مطلوب - يجب توفير معرفات المواقع الجغرافية',
                    'themes': []
                }
            for geo_id in geo_target_ids:
                request.geo_target_constants.append(
                    google_ads_service.geo_target_constant_path(geo_id)
                )
            
            # إعداد الشبكة
            request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH_AND_PARTNERS
            
            # إعداد الكلمات المفتاحية البذرة
            seed_keywords = ad_group_theme_request.get('seed_keywords', [])
            if not seed_keywords:
                return {
                    'success': False,
                    'error': 'يجب توفير كلمات مفتاحية بذرة',
                    'themes': []
                }
            
            request.keyword_seed.keywords.extend(seed_keywords)
            
            # تنفيذ الطلب الحقيقي
            logger.info(f"🎯 إنشاء مواضيع مجموعات الإعلانات للكلمات: {seed_keywords}")
            response = keyword_plan_idea_service.generate_ad_group_themes(request=request)
            
            # معالجة النتائج الحقيقية
            themes = []
            for result in response:
                if hasattr(result, 'theme') and hasattr(result, 'keywords'):
                    theme_data = {
                        'theme': result.theme,
                        'keywords': [kw.text for kw in result.keywords] if result.keywords else [],
                        'keyword_count': len(result.keywords) if result.keywords else 0,
                        'source': 'google_keyword_planner_real'
                    }
                    themes.append(theme_data)
            
            # حفظ في التخزين المؤقت
            result = {
                'success': True,
                'themes': themes,
                'total_count': len(themes),
                'message': f'تم إنشاء {len(themes)} موضوع مجموعة إعلانات حقيقي'
            }
            
            self.cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ تم إنشاء {len(themes)} موضوع مجموعة إعلانات حقيقي")
            
            return result
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء مواضيع المجموعات: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'themes': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء مواضيع المجموعات: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'themes': []
            }
    
    def generate_historical_metrics(self, customer_id: str, historical_metrics_request: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء المقاييس التاريخية الحقيقية للكلمات المفتاحية
        
        المقاييس المتوفرة:
        - متوسط عمليات البحث الشهرية (آخر 12 شهر)
        - حجم البحث الشهري التقريبي (شهرياً)
        - مستوى المنافسة ومؤشر المنافسة
        - الشريحة المئوية 20 و 80 لعروض الأسعار
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'metrics': []
                }
            
            # التحقق من التخزين المؤقت
            cache_key = f"historical_metrics_{hash(str(historical_metrics_request))}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if time.time() - cached_result['timestamp'] < self.cache_duration:
                    logger.info("📋 استخدام المقاييس التاريخية من التخزين المؤقت")
                    return cached_result['data']
            
            # الحصول على الخدمات
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            google_ads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء طلب المقاييس التاريخية
            request = self.client.get_type("GenerateKeywordHistoricalMetricsRequest")
            request.customer_id = customer_id
            
            # إعداد الكلمات المفتاحية
            keywords = historical_metrics_request.get('keywords', [])
            if not keywords:
                return {
                    'success': False,
                    'error': 'يجب توفير كلمات مفتاحية',
                    'metrics': []
                }
            request.keywords.extend(keywords)
            
            # إعداد اللغة - يجب توفيرها من المستخدم
            language_id = historical_metrics_request.get('language_id')
            if not language_id:
                return {
                    'success': False,
                    'error': 'language_id مطلوب - يجب توفير معرف اللغة',
                    'metrics': []
                }
            request.language = google_ads_service.language_constant_path(language_id)
            
            # إعداد المواقع الجغرافية - يجب توفيرها من المستخدم
            geo_target_ids = historical_metrics_request.get('geo_target_ids')
            if not geo_target_ids:
                return {
                    'success': False,
                    'error': 'geo_target_ids مطلوب - يجب توفير معرفات المواقع الجغرافية',
                    'metrics': []
                }
            for geo_id in geo_target_ids:
                request.geo_target_constants.append(
                    google_ads_service.geo_target_constant_path(geo_id)
                )
            
            # إعداد الشبكة
            request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            
            # إعداد النطاق الزمني (اختياري)
            if historical_metrics_request.get('include_historical_metrics', True):
                historical_metrics_options = self.client.get_type("HistoricalMetricsOptions")
                historical_metrics_options.include_average_cpc = True
                request.historical_metrics_options = historical_metrics_options
            
            # تنفيذ الطلب الحقيقي
            logger.info(f"📊 استخراج المقاييس التاريخية للكلمات: {keywords}")
            response = keyword_plan_idea_service.generate_keyword_historical_metrics(request=request)
            
            # معالجة النتائج الحقيقية
            metrics = []
            for result in response:
                if hasattr(result, 'keyword_metrics'):
                    metrics_data = result.keyword_metrics
                    
                    # استخراج بيانات البحث الشهري
                    monthly_searches = []
                    if hasattr(metrics_data, 'monthly_search_volumes'):
                        for month_data in metrics_data.monthly_search_volumes:
                            monthly_searches.append({
                                'year': month_data.year,
                                'month': month_data.month.name if hasattr(month_data.month, 'name') else month_data.month,
                                'monthly_searches': month_data.monthly_searches
                            })
                    
                metric_data = {
                    'keyword': result.text,
                        'close_variants': result.close_variants if hasattr(result, 'close_variants') else [],
                        'avg_monthly_searches': metrics_data.avg_monthly_searches,
                        'competition': metrics_data.competition.name if hasattr(metrics_data.competition, 'name') else str(metrics_data.competition),
                        'competition_index': metrics_data.competition_index,
                        'low_top_of_page_bid_micros': metrics_data.low_top_of_page_bid_micros,
                        'high_top_of_page_bid_micros': metrics_data.high_top_of_page_bid_micros,
                        'monthly_search_volumes': monthly_searches,
                        'source': 'google_keyword_planner_real'
                }
                metrics.append(metric_data)
            
            # حفظ في التخزين المؤقت
            result = {
                'success': True,
                'metrics': metrics,
                'total_count': len(metrics),
                'message': f'تم استخراج {len(metrics)} مقياس تاريخي حقيقي'
            }
            
            self.cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ تم استخراج {len(metrics)} مقياس تاريخي حقيقي")
            
            return result
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'metrics': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'metrics': []
            }
    
    def generate_forecast_metrics(self, customer_id: str, forecast_metrics_request: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء مقاييس التنبؤ الحقيقية للكلمات المفتاحية
        
        المقاييس المتوفرة:
        - مرات الظهور (Impressions)
        - نسبة النقر إلى الظهور (CTR)
        - متوسط تكلفة النقرة (Average CPC)
        - النقرات (Clicks)
        - التكلفة (Cost)
        - التحويلات (Conversions)
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'forecasts': []
                }
            
            # التحقق من التخزين المؤقت
            cache_key = f"forecast_metrics_{hash(str(forecast_metrics_request))}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if time.time() - cached_result['timestamp'] < self.cache_duration:
                    logger.info("📋 استخدام مقاييس التنبؤ من التخزين المؤقت")
                    return cached_result['data']
            
            # الحصول على الخدمات
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            google_ads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء حملة للتنبؤ
            campaign_to_forecast = self._create_campaign_to_forecast(forecast_metrics_request)
            
            # إنشاء طلب مقاييس التنبؤ
            request = self.client.get_type("GenerateKeywordForecastMetricsRequest")
            request.customer_id = customer_id
            request.campaign = campaign_to_forecast
            
            # إعداد فترة التنبؤ
            forecast_period = self.client.get_type("DateRange")
            start_date = forecast_metrics_request.get('start_date', datetime.now() + timedelta(days=1))
            end_date = forecast_metrics_request.get('end_date', datetime.now() + timedelta(days=30))
            
            forecast_period.start_date = start_date.strftime("%Y-%m-%d")
            forecast_period.end_date = end_date.strftime("%Y-%m-%d")
            request.forecast_period = forecast_period
            
            # تنفيذ الطلب الحقيقي
            logger.info(f"🔮 إنشاء مقاييس التنبؤ الحقيقية للحملة")
            response = keyword_plan_idea_service.generate_keyword_forecast_metrics(request=request)
            
            # معالجة النتائج الحقيقية
            forecasts = []
            if hasattr(response, 'campaign_forecast_metrics'):
                metrics = response.campaign_forecast_metrics
                forecast_data = {
                    'estimated_daily_clicks': metrics.clicks,
                    'estimated_daily_impressions': metrics.impressions,
                    'estimated_daily_average_cpc_micros': metrics.average_cpc_micros,
                    'estimated_daily_cost_micros': metrics.cost_micros,
                    'estimated_daily_conversions': getattr(metrics, 'conversions', None),
                    'estimated_daily_ctr': getattr(metrics, 'ctr', None),
                    'forecast_period_start': start_date.strftime("%Y-%m-%d"),
                    'forecast_period_end': end_date.strftime("%Y-%m-%d"),
                    'campaign_configuration': {
                        'keywords_count': len(forecast_metrics_request.get('keywords', [])),
                        'geo_targets': forecast_metrics_request.get('geo_target_ids', []),
                        'language': forecast_metrics_request.get('language_id', '1019'),
                        'bidding_strategy': 'MANUAL_CPC',
                        'max_cpc_bid': forecast_metrics_request.get('max_cpc_bid', 1.0)
                    },
                    'source': 'google_keyword_planner_real'
                }
                forecasts.append(forecast_data)
            
            # حفظ في التخزين المؤقت
            result = {
                'success': True,
                'forecasts': forecasts,
                'total_count': len(forecasts),
                'message': 'تم إنشاء مقاييس التنبؤ الحقيقية بنجاح'
            }
            
            self.cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ تم إنشاء مقاييس التنبؤ الحقيقية")
            
            return result
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء مقاييس التنبؤ: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'forecasts': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء مقاييس التنبؤ: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'forecasts': []
            }
    
    def _create_campaign_to_forecast(self, forecast_metrics_request: Dict[str, Any]):
        """إنشاء حملة للتنبؤ بأدائها
        
        نصائح لإنشاء حملة تنبؤ فعالة:
        - إنشاء المجموعات الإعلانية حسب المواضيع
        - إدراج كلمات رئيسية سلبية شائعة
        - استخدام حساب ذو صلة بالحملة
        - تكرار التوقعات بآفاق زمنية مختلفة
        """
        try:
            # إنشاء حملة للتنبؤ
            campaign_to_forecast = self.client.get_type("CampaignToForecast")
            campaign_to_forecast.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            
            # إعداد استراتيجية المزايدة
            bidding_strategy = self.client.get_type("BiddingStrategy")
            manual_cpc = self.client.get_type("ManualCpcBiddingStrategy")
            manual_cpc.max_cpc_bid_micros = int(forecast_metrics_request.get('max_cpc_bid', 1.0) * 1000000)
            bidding_strategy.manual_cpc_bidding_strategy.CopyFrom(manual_cpc)
            campaign_to_forecast.bidding_strategy.CopyFrom(bidding_strategy)
            
            # إعداد المعايير الجغرافية - يجب توفيرها من المستخدم
            geo_target_ids = forecast_metrics_request.get('geo_target_ids')
            if not geo_target_ids:
                raise ValueError('geo_target_ids مطلوب - يجب توفير معرفات المواقع الجغرافية')
            for geo_id in geo_target_ids:
                criterion_bid_modifier = self.client.get_type("CriterionBidModifier")
                criterion_bid_modifier.geo_target_constant = f"geoTargetConstants/{geo_id}"
                campaign_to_forecast.geo_modifiers.append(criterion_bid_modifier)
            
            # إعداد اللغة - يجب توفيرها من المستخدم
            language_id = forecast_metrics_request.get('language_id')
            if not language_id:
                raise ValueError('language_id مطلوب - يجب توفير معرف اللغة')
            campaign_to_forecast.language_constants.append(f"languageConstants/{language_id}")
            
            # إنشاء مجموعات الإعلانات للتنبؤ حسب المواضيع
            keywords = forecast_metrics_request.get('keywords', [])
            if keywords:
                # إنشاء مجموعة إعلانية واحدة للتنبؤ
                forecast_ad_group = self.client.get_type("ForecastAdGroup")
                
                # إضافة الكلمات المفتاحية القابلة للمزايدة مع أنواع مطابقة مختلفة
                for i, keyword_text in enumerate(keywords[:10]):  # حد أقصى 10 كلمات للتنبؤ
                    biddable_keyword = self.client.get_type("BiddableKeyword")
                    
                    # تحديد مبلغ المزايدة حسب نوع المطابقة
                    if i < 3:  # أول 3 كلمات - مطابقة عريضة
                        biddable_keyword.max_cpc_bid_micros = int(forecast_metrics_request.get('keyword_cpc_bid', 1.0) * 1000000)
                        biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD
                    elif i < 6:  # كلمات 4-6 - مطابقة عبارة
                        biddable_keyword.max_cpc_bid_micros = int(forecast_metrics_request.get('keyword_cpc_bid', 1.0) * 0.8 * 1000000)
                        biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.PHRASE
                    else:  # باقي الكلمات - مطابقة دقيقة
                        biddable_keyword.max_cpc_bid_micros = int(forecast_metrics_request.get('keyword_cpc_bid', 1.0) * 1.2 * 1000000)
                        biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.EXACT
                    
                    biddable_keyword.keyword.text = keyword_text
                    forecast_ad_group.biddable_keywords.append(biddable_keyword)
                
                # إضافة كلمات مفتاحية سلبية شائعة
                negative_keywords = forecast_metrics_request.get('negative_keywords', [
                    'مجاني', 'مجانية', 'وظائف', 'توظيف', 'شراء', 'بيع'
                ])
                for neg_keyword in negative_keywords[:5]:  # حد أقصى 5 كلمات سلبية
                    negative_keyword_obj = self.client.get_type("KeywordInfo")
                    negative_keyword_obj.text = neg_keyword
                    negative_keyword_obj.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD
                    forecast_ad_group.negative_keywords.append(negative_keyword_obj)
                
                campaign_to_forecast.ad_groups.append(forecast_ad_group)
            
            logger.info(f"✅ تم إنشاء حملة التنبؤ مع {len(keywords)} كلمة مفتاحية")
            
            return campaign_to_forecast
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء حملة التنبؤ: {e}")
            raise e
    
    def _get_cache_key(self, request_type: str, request_data: Dict[str, Any]) -> str:
        """إنشاء مفتاح التخزين المؤقت"""
        return f"{request_type}_{hash(str(request_data))}"
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """التحقق من صحة التخزين المؤقت"""
        if not cache_entry:
            return False
        return time.time() - cache_entry['timestamp'] < self.cache_duration
    
    def clear_cache(self):
        """مسح التخزين المؤقت"""
        self.cache.clear()
        logger.info("🗑️ تم مسح التخزين المؤقت")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """إحصائيات التخزين المؤقت"""
        return {
            'cache_size': len(self.cache),
            'cache_duration': self.cache_duration,
            'cache_keys': list(self.cache.keys())
        }
    
    def main_forecast_workflow(self, customer_id: str) -> Dict[str, Any]:
        """الدالة الرئيسية لسير عمل التوقعات - تطبيق الكود الرسمي الثالث بالضبط
        
        The main method that creates all necessary entities for the example.
        
        Args:
            customer_id: a client customer ID.
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'message': 'تأكد من إعداد Google Ads API'
                }
            
            if not customer_id or customer_id.strip() == '':
                return {
                    'success': False,
                    'error': 'customer_id مطلوب',
                    'message': 'يجب توفير معرف العميل'
                }
            
            # تطبيق الكود الرسمي الثالث بالضبط
            campaign_to_forecast = self.main_create_campaign_to_forecast()
            if not campaign_to_forecast['success']:
                return campaign_to_forecast
            
            forecast_metrics = self.main_generate_forecast_metrics(
                customer_id=customer_id,
                campaign_to_forecast=campaign_to_forecast['campaign']
            )
            
            return {
                'success': True,
                'campaign_created': True,
                'forecast_metrics': forecast_metrics,
                'message': 'تم إكمال سير عمل التوقعات بنجاح'
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في سير عمل التوقعات: {e}")
            return {
                'success': False,
                'error': 'خطأ في سير العمل',
                'message': str(e)
            }
    
    def main(self, customer_id: str, location_ids: List[str], language_id: str, 
             keyword_texts: List[str] = None, page_url: str = None, max_cpc_bid_micros: int = 1000000) -> Dict[str, Any]:
        """الدالة الرئيسية لتخطيط الكلمات الرئيسية - تطبيق الكود الرسمي الكامل
        
        سير العمل:
        1. إنشاء قائمة بالأفكار يمكن إدارتها
        2. إنشاء مقاييس توقعات للكلمات الرئيسية
        3. إنشاء حملة جديدة باستخدام الكلمات الرئيسية الجديدة
        4. تعديل الكلمات الرئيسية ومعلمات التقدير
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'message': 'تأكد من إعداد Google Ads API'
                }
            
            if not customer_id or customer_id.strip() == '':
                return {
                    'success': False,
                    'error': 'customer_id مطلوب',
                    'message': 'يجب توفير معرف العميل'
                }
            
            logger.info("🚀 بدء سير عمل تخطيط الكلمات الرئيسية الكامل...")
            
            # الخطوة 1: إنشاء أفكار الكلمات الرئيسية
            logger.info("📝 الخطوة 1: إنشاء أفكار الكلمات الرئيسية...")
            keyword_ideas_result = self.main_generate_keyword_ideas(
                customer_id=customer_id,
                location_ids=location_ids,
                language_id=language_id,
                keyword_texts=keyword_texts,
                page_url=page_url
            )
            
            if not keyword_ideas_result['success']:
                return keyword_ideas_result
            
            keywords = keyword_ideas_result['keywords']
            logger.info(f"✅ تم إنشاء {len(keywords)} فكرة كلمة مفتاحية")
            
            # الخطوة 2: إنشاء المقاييس التاريخية
            logger.info("📊 الخطوة 2: إنشاء المقاييس التاريخية...")
            historical_metrics_result = self.main_generate_historical_metrics(
                customer_id=customer_id,
                keywords=[kw.get('keyword', '') for kw in keywords[:5]],  # أول 5 كلمات
                location_ids=location_ids,
                language_id=language_id
            )
            
            if not historical_metrics_result['success']:
                logger.warning(f"⚠️ فشل المقاييس التاريخية: {historical_metrics_result.get('error')}")
                historical_metrics = []
            else:
                historical_metrics = historical_metrics_result['metrics']
                logger.info(f"✅ تم إنشاء {len(historical_metrics)} مقياس تاريخي")
            
            # الخطوة 3: إنشاء حملة للتوقعات
            logger.info("🎯 الخطوة 3: إنشاء حملة للتوقعات...")
            campaign_forecast_result = self.main_create_campaign_to_forecast(
                keywords=[kw.get('keyword', '') for kw in keywords[:10]],  # أول 10 كلمات
                location_ids=location_ids,
                language_id=language_id,
                max_cpc_bid_micros=max_cpc_bid_micros
            )
            
            if not campaign_forecast_result['success']:
                return {
                    'success': False,
                    'error': 'فشل في إنشاء حملة للتوقعات',
                    'message': campaign_forecast_result.get('error')
                }
            
            campaign_to_forecast = campaign_forecast_result['campaign']
            logger.info("✅ تم إنشاء حملة للتوقعات")
            
            # الخطوة 4: إنشاء مقاييس التوقعات
            logger.info("🔮 الخطوة 4: إنشاء مقاييس التوقعات...")
            forecast_metrics_result = self.main_generate_forecast_metrics(
                customer_id=customer_id,
                campaign_to_forecast=campaign_to_forecast
            )
            
            if not forecast_metrics_result['success']:
                logger.warning(f"⚠️ فشل مقاييس التوقعات: {forecast_metrics_result.get('error')}")
                forecast_metrics = None
            else:
                forecast_metrics = forecast_metrics_result['forecast']
                logger.info("✅ تم إنشاء مقاييس التوقعات")
            
            # النتيجة النهائية
            result = {
                'success': True,
                'keyword_planning_workflow': {
                    'step_1_keyword_ideas': {
                        'success': True,
                        'keywords_count': len(keywords),
                        'keywords': keywords[:10],  # أول 10 كلمات
                        'total_available': len(keywords)
                    },
                    'step_2_historical_metrics': {
                        'success': historical_metrics_result['success'],
                        'metrics_count': len(historical_metrics) if historical_metrics else 0,
                        'metrics': historical_metrics[:5] if historical_metrics else []  # أول 5 مقاييس
                    },
                    'step_3_campaign_forecast': {
                        'success': True,
                        'campaign_created': True,
                        'message': 'تم إنشاء حملة للتوقعات بنجاح'
                    },
                    'step_4_forecast_metrics': {
                        'success': forecast_metrics_result['success'],
                        'forecast': forecast_metrics,
                        'message': 'تم إنشاء مقاييس التوقعات' if forecast_metrics else 'فشل في إنشاء مقاييس التوقعات'
                    }
                },
                'summary': {
                    'total_keywords': len(keywords),
                    'historical_metrics_available': len(historical_metrics) if historical_metrics else 0,
                    'forecast_available': forecast_metrics is not None,
                    'workflow_completed': True
                },
                'message': 'تم إكمال سير عمل تخطيط الكلمات الرئيسية بنجاح'
            }
            
            logger.info("🎉 تم إكمال سير عمل تخطيط الكلمات الرئيسية بنجاح!")
            return result
            
        except Exception as e:
            logger.error(f"❌ خطأ في سير عمل تخطيط الكلمات الرئيسية: {e}")
            return {
                'success': False,
                'error': 'خطأ في سير العمل',
                'message': str(e)
            }
    
    def main_generate_historical_metrics(self, customer_id: str, keywords: List[str], 
                                       location_ids: List[str], language_id: str) -> Dict[str, Any]:
        """الدالة الرئيسية لإنشاء المقاييس التاريخية - تطبيق الكود الرسمي بالضبط"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'metrics': []
                }
            
            # تطبيق الكود الرسمي بالضبط
            googleads_service = self.client.get_service("GoogleAdsService")
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            request = self.client.get_type("GenerateKeywordHistoricalMetricsRequest")
            request.customer_id = customer_id
            request.keywords = keywords if keywords else ["mars cruise", "cheap cruise", "jupiter cruise"]
            
            # إضافة المواقع الجغرافية من اختيار العميل في الفرونت إند
            for location_id in location_ids:
                request.geo_target_constants.append(
                    googleads_service.geo_target_constant_path(location_id)
                )
            
            request.keyword_plan_network = (
                self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            )
            
            # إضافة اللغة من اختيار العميل في الفرونت إند
            request.language = googleads_service.language_constant_path(language_id)

            response = keyword_plan_idea_service.generate_keyword_historical_metrics(request=request)

            results = response.results
            metrics = []
            for result in results:
                keyword_metrics = result.keyword_metrics
                # These metrics include those for both the search query and any variants
                # included in the response.
                print(
                    f"The search query '{result.text}' (and the following variants: "
                    f"'{result.close_variants if result.close_variants else 'None'}'), "
                    "generated the following historical metrics:\n"
                )

                # Approximate number of monthly searches on this query averaged for the
                # past 12 months.
                print(f"\tApproximate monthly searches: {keyword_metrics.avg_monthly_searches}")

                # The competition level for this search query.
                print(f"\tCompetition level: {keyword_metrics.competition}")

                # The competition index for the query in the range [0, 100]. This shows
                # how competitive ad placement is for a keyword. The level of
                # competition from 0-100 is determined by the number of ad slots filled
                # divided by the total number of ad slots available. If not enough data
                # is available, undef will be returned.
                print(f"\tCompetition index: {keyword_metrics.competition_index}")

                # Top of page bid low range (20th percentile) in micros for the keyword.
                print(
                    f"\tTop of page bid low range: {keyword_metrics.low_top_of_page_bid_micros}"
                )

                # Top of page bid high range (80th percentile) in micros for the
                # keyword.
                print(
                    "\tTop of page bid high range: "
                    f"{keyword_metrics.high_top_of_page_bid_micros}"
                )

                # Approximate number of searches on this query for the past twelve
                # months.
                months = keyword_metrics.monthly_search_volumes
                monthly_data = []
                for month in months:
                    print(
                        f"\tApproximately {month.monthly_searches} searches in "
                        f"{month.month.name}, {month.year}"
                    )
                    monthly_data.append({
                        'monthly_searches': month.monthly_searches,
                        'month': month.month.name,
                        'year': month.year
                    })
                
                # إضافة البيانات للنتيجة
                metric_data = {
                    'keyword': result.text,
                    'close_variants': result.close_variants if result.close_variants else [],
                    'avg_monthly_searches': keyword_metrics.avg_monthly_searches,
                    'competition': keyword_metrics.competition.name,
                    'competition_index': keyword_metrics.competition_index,
                    'low_top_of_page_bid_micros': keyword_metrics.low_top_of_page_bid_micros,
                    'high_top_of_page_bid_micros': keyword_metrics.high_top_of_page_bid_micros,
                    'monthly_search_volumes': monthly_data
                }
                metrics.append(metric_data)
            
            logger.info(f"✅ تم استخراج {len(metrics)} مقياس تاريخي من Google Keyword Planner")
            
            return {
                'success': True,
                'metrics': metrics,
                'total_count': len(metrics),
                'message': f'تم استخراج {len(metrics)} مقياس تاريخي من Google Keyword Planner'
            }
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'metrics': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'metrics': []
            }

    def generate_historical_metrics(self, customer_id: str, keywords: List[str], 
                                   language_id: str, geo_target_ids: List[str]) -> Dict[str, Any]:
        """إنشاء المقاييس التاريخية للكلمات المفتاحية
        
        تطبيق الكود الرسمي من Google Ads API:
        - متوسط عمليات البحث الشهرية (آخر 12 شهر)
        - مستوى المنافسة ومؤشر المنافسة
        - عروض الأسعار (الشريحة المئوية 20 و 80)
        """
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return {
                    'success': False,
                    'error': 'المكتبة الرسمية غير متوفرة',
                    'metrics': []
                }
            
            # فحص customer_id
            if not customer_id or customer_id.strip() == '':
                return {
                    'success': False,
                    'error': 'customer_id مطلوب لاستخدام Google Keyword Planner API',
                    'metrics': []
                }
            
            # التحقق من التخزين المؤقت
            cache_key = f"historical_metrics_{hash(str(keywords) + str(language_id) + str(geo_target_ids))}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if time.time() - cached_result['timestamp'] < self.cache_duration:
                    logger.info("📋 استخدام النتائج من التخزين المؤقت")
                    return cached_result['data']
            
            # الحصول على الخدمات - تطبيق الكود الرسمي
            googleads_service = self.client.get_service("GoogleAdsService")
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            
            # إنشاء الطلب - تطبيق الكود الرسمي
            request = self.client.get_type("GenerateKeywordHistoricalMetricsRequest")
            request.customer_id = customer_id
            request.keywords = keywords
            
            # إعداد المواقع الجغرافية - تطبيق الكود الرسمي
            for geo_id in geo_target_ids:
                request.geo_target_constants.append(
                    googleads_service.geo_target_constant_path(geo_id)
                )
            
            # إعداد الشبكة - تطبيق الكود الرسمي
            request.keyword_plan_network = (
                self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            )
            
            # إعداد اللغة - تطبيق الكود الرسمي
            request.language = googleads_service.language_constant_path(language_id)
            
            # تنفيذ الطلب الحقيقي - تطبيق الكود الرسمي
            logger.info(f"🔍 البحث عن المقاييس التاريخية للكلمات المفتاحية...")
            response = keyword_plan_idea_service.generate_keyword_historical_metrics(request=request)
            
            # معالجة النتائج الحقيقية - تطبيق الكود الرسمي
            metrics = []
            for result in response.results:
                keyword_metrics = result.keyword_metrics
                
                # طباعة النتائج كما في الكود الرسمي
                logger.info(
                    f"The search query '{result.text}' (and the following variants: "
                    f"'{result.close_variants if result.close_variants else 'None'}'), "
                    "generated the following historical metrics:"
                )
                
                metric_data = {
                    'keyword': result.text,
                    'close_variants': result.close_variants if result.close_variants else [],
                    'avg_monthly_searches': keyword_metrics.avg_monthly_searches,
                    'competition': keyword_metrics.competition.name,
                    'competition_index': keyword_metrics.competition_index,
                    'low_top_of_page_bid_micros': keyword_metrics.low_top_of_page_bid_micros,
                    'high_top_of_page_bid_micros': keyword_metrics.high_top_of_page_bid_micros,
                    'monthly_search_volumes': []
                }
                
                # إضافة بيانات البحث الشهرية
                for month in keyword_metrics.monthly_search_volumes:
                    month_data = {
                        'monthly_searches': month.monthly_searches,
                        'month': month.month.name,
                        'year': month.year
                    }
                    metric_data['monthly_search_volumes'].append(month_data)
                    
                    logger.info(
                        f"Approximately {month.monthly_searches} searches in "
                        f"{month.month.name}, {month.year}"
                    )
                
                metrics.append(metric_data)
                
                # طباعة المقاييس كما في الكود الرسمي
                logger.info(f"Approximate monthly searches: {keyword_metrics.avg_monthly_searches}")
                logger.info(f"Competition level: {keyword_metrics.competition.name}")
                logger.info(f"Competition index: {keyword_metrics.competition_index}")
                logger.info(f"Top of page bid low range: {keyword_metrics.low_top_of_page_bid_micros}")
                logger.info(f"Top of page bid high range: {keyword_metrics.high_top_of_page_bid_micros}")
            
            # حفظ في التخزين المؤقت
            result = {
                'success': True,
                'metrics': metrics,
                'total_count': len(metrics),
                'message': f'تم استخراج {len(metrics)} مقياس تاريخي من Google Keyword Planner'
            }
            
            self.cache[cache_key] = {
                'data': result,
                'timestamp': time.time()
            }
            
            logger.info(f"✅ تم استخراج {len(metrics)} مقياس تاريخي من Google Keyword Planner")
            
            return result
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'metrics': []
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'metrics': []
            }
    
    def main_create_campaign_to_forecast(self, keywords: List[str], location_ids: List[str], 
                                       language_id: str, max_cpc_bid_micros: int = 1000000) -> Dict[str, Any]:
        """الدالة الرئيسية لإنشاء حملة للتوقعات - ديناميكية حسب اختيار العميل"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {'success': False, 'error': 'المكتبة الرسمية غير متوفرة', 'campaign': None}
            
            if not keywords or not location_ids or not language_id:
                return {'success': False, 'error': 'الكلمات المفتاحية والموقع واللغة مطلوبة', 'campaign': None}
            
            # تطبيق الكود الرسمي مع البيانات الديناميكية
            googleads_service = self.client.get_service("GoogleAdsService")
            # Create a campaign to forecast.
            campaign_to_forecast = self.client.get_type("CampaignToForecast")
            campaign_to_forecast.keyword_plan_network = (
                self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            )

            # Set the bidding strategy.
            campaign_to_forecast.bidding_strategy.manual_cpc_bidding_strategy.max_cpc_bid_micros = (
                max_cpc_bid_micros
            )

            # إضافة المواقع الجغرافية من اختيار العميل في الفرونت إند
            for location_id in location_ids:
                criterion_bid_modifier = self.client.get_type("CriterionBidModifier")
                criterion_bid_modifier.geo_target_constant = (
                    googleads_service.geo_target_constant_path(location_id)
                )
                campaign_to_forecast.geo_modifiers.append(criterion_bid_modifier)

            # إضافة اللغة من اختيار العميل في الفرونت إند
            campaign_to_forecast.language_constants.append(
                googleads_service.language_constant_path(language_id)
            )

            # Create forecast ad groups based on themes such as creative relevance,
            # product category, or cost per click.
            forecast_ad_group = self.client.get_type("ForecastAdGroup")

            # إنشاء الكلمات المفتاحية حسب البيانات الفعلية
            biddable_keywords = []
            for i, keyword_text in enumerate(keywords[:10]):  # أول 10 كلمات
                biddable_keyword = self.client.get_type("BiddableKeyword")
                biddable_keyword.max_cpc_bid_micros = max_cpc_bid_micros + (i * 100000)  # زيادة تدريجية
                biddable_keyword.keyword.text = keyword_text
                
                # تحديد نوع المطابقة حسب ترتيب الكلمة
                if i % 3 == 0:
                    biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD
                elif i % 3 == 1:
                    biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.PHRASE
                else:
                    biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.EXACT
                
                biddable_keywords.append(biddable_keyword)

            # Add the biddable keywords to the forecast ad group.
            forecast_ad_group.biddable_keywords.extend(biddable_keywords)

            # لا نضيف كلمات سلبية وهمية - فقط إذا كانت متوفرة من العميل

            campaign_to_forecast.ad_groups.append(forecast_ad_group)

            logger.info(f"✅ تم إنشاء حملة للتوقعات مع {len(keywords)} كلمة مفتاحية للموقع {location_ids} واللغة {language_id}")
            return {
                'success': True, 
                'campaign': campaign_to_forecast, 
                'message': f'تم إنشاء حملة للتوقعات مع {len(keywords)} كلمة مفتاحية للموقع {location_ids} واللغة {language_id}'
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء حملة للتوقعات: {e}")
            return {'success': False, 'error': f'خطأ في إنشاء حملة للتوقعات: {e}', 'campaign': None}

    def main_generate_forecast_metrics(self, customer_id: str, campaign_to_forecast) -> Dict[str, Any]:
        """الدالة الرئيسية لإنشاء مقاييس التوقعات - تطبيق الكود الرسمي بالضبط"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {'success': False, 'error': 'المكتبة الرسمية غير متوفرة', 'forecast': None}
            
            if not customer_id or customer_id.strip() == '':
                return {'success': False, 'error': 'customer_id مطلوب', 'forecast': None}
            
            # تطبيق الكود الرسمي بالضبط
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            request = self.client.get_type("GenerateKeywordForecastMetricsRequest")
            request.customer_id = customer_id
            request.campaign = campaign_to_forecast
            # Set the forecast range. Repeat forecasts with different horizons to get a
            # holistic picture.
            # Set the forecast start date to tomorrow.
            tomorrow = datetime.now() + timedelta(days=1)
            request.forecast_period.start_date = tomorrow.strftime("%Y-%m-%d")
            # Set the forecast end date to 30 days from today.
            thirty_days_from_now = datetime.now() + timedelta(days=30)
            request.forecast_period.end_date = thirty_days_from_now.strftime("%Y-%m-%d")

            response = keyword_plan_idea_service.generate_keyword_forecast_metrics(request=request)

            metrics = response.campaign_forecast_metrics
            print(f"Estimated daily clicks: {metrics.clicks}")
            print(f"Estimated daily impressions: {metrics.impressions}")
            print(f"Estimated daily average CPC: {metrics.average_cpc_micros}")
            
            # إضافة البيانات للنتيجة
            forecast_data = {
                'impressions': metrics.impressions,
                'clicks': metrics.clicks,
                'average_cpc_micros': metrics.average_cpc_micros,
                'ctr': metrics.ctr,
                'cost_micros': metrics.cost_micros,
                'conversions': metrics.conversions,
                'conversion_rate': metrics.conversion_rate,
                'source': 'google_keyword_planner_forecast'
            }
            
            logger.info(f"✅ تم استخراج مقاييس التوقعات بنجاح")
            
            return {
                'success': True,
                'forecast': forecast_data,
                'message': 'تم استخراج مقاييس التوقعات بنجاح'
            }
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في استخراج مقاييس التوقعات: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'forecast': None
            }
        except Exception as e:
            logger.error(f"❌ خطأ عام في استخراج مقاييس التوقعات: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'forecast': None
            }
    
    def create_campaign_to_forecast(self, keywords: List[str], language_id: str,
                                   geo_target_ids: List[str], max_cpc_bid_micros: int = 1000000) -> Dict[str, Any]:
        """إنشاء حملة للتوقعات - تطبيق الكود الرسمي من Google Ads API"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {'success': False, 'error': 'المكتبة الرسمية غير متوفرة', 'campaign': None}
            
            googleads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء حملة للتوقعات - تطبيق الكود الرسمي
            campaign_to_forecast = self.client.get_type("CampaignToForecast")
            campaign_to_forecast.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            
            # تعيين استراتيجية المزايدة - تطبيق الكود الرسمي
            campaign_to_forecast.bidding_strategy.manual_cpc_bidding_strategy.max_cpc_bid_micros = max_cpc_bid_micros
            
            # إعداد المواقع الجغرافية - تطبيق الكود الرسمي
            for geo_id in geo_target_ids:
                criterion_bid_modifier = self.client.get_type("CriterionBidModifier")
                criterion_bid_modifier.geo_target_constant = googleads_service.geo_target_constant_path(geo_id)
                campaign_to_forecast.geo_modifiers.append(criterion_bid_modifier)
            
            # إعداد اللغة - تطبيق الكود الرسمي
            campaign_to_forecast.language_constants.append(googleads_service.language_constant_path(language_id))
            
            # إنشاء مجموعة إعلانات للتوقعات - تطبيق الكود الرسمي
            forecast_ad_group = self.client.get_type("ForecastAdGroup")
            
            # إضافة الكلمات المفتاحية القابلة للمزايدة - تطبيق الكود الرسمي
            for i, keyword_text in enumerate(keywords[:10]):
                biddable_keyword = self.client.get_type("BiddableKeyword")
                biddable_keyword.max_cpc_bid_micros = max_cpc_bid_micros + (i * 100000)
                biddable_keyword.keyword.text = keyword_text
                biddable_keyword.keyword.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD
                forecast_ad_group.biddable_keywords.append(biddable_keyword)
            
            # إضافة كلمات مفتاحية سلبية شائعة - تطبيق الكود الرسمي
            negative_keyword = self.client.get_type("KeywordInfo")
            negative_keyword.text = "وظائف"  # كلمة سلبية شائعة
            negative_keyword.match_type = self.client.enums.KeywordMatchTypeEnum.BROAD
            forecast_ad_group.negative_keywords.append(negative_keyword)
            
            campaign_to_forecast.ad_groups.append(forecast_ad_group)
            logger.info(f"✅ تم إنشاء حملة للتوقعات مع {len(keywords)} كلمة مفتاحية")
            
            return {'success': True, 'campaign': campaign_to_forecast, 'message': f'تم إنشاء حملة للتوقعات مع {len(keywords)} كلمة مفتاحية'}
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء حملة للتوقعات: {e}")
            return {'success': False, 'error': f'خطأ في إنشاء حملة للتوقعات: {e}', 'campaign': None}
    
    def generate_forecast_metrics(self, customer_id: str, campaign_to_forecast, forecast_days: int = 30) -> Dict[str, Any]:
        """إنشاء مقاييس التوقعات - تطبيق الكود الرسمي من Google Ads API"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {'success': False, 'error': 'المكتبة الرسمية غير متوفرة', 'forecast': None}
            
            if not customer_id or customer_id.strip() == '':
                return {'success': False, 'error': 'customer_id مطلوب', 'forecast': None}
            
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            request = self.client.get_type("GenerateKeywordForecastMetricsRequest")
            request.customer_id = customer_id
            request.campaign = campaign_to_forecast
            
            # تعيين نطاق التوقعات - تطبيق الكود الرسمي
            from datetime import datetime, timedelta
            tomorrow = datetime.now() + timedelta(days=1)
            request.forecast_period.start_date = tomorrow.strftime("%Y-%m-%d")
            forecast_end_date = datetime.now() + timedelta(days=forecast_days)
            request.forecast_period.end_date = forecast_end_date.strftime("%Y-%m-%d")
            
            logger.info(f"🔍 البحث عن مقاييس التوقعات...")
            response = keyword_plan_idea_service.generate_keyword_forecast_metrics(request=request)
            metrics = response.campaign_forecast_metrics
            
            forecast_data = {
                'estimated_daily_clicks': metrics.clicks,
                'estimated_daily_impressions': metrics.impressions,
                'estimated_daily_average_cpc_micros': metrics.average_cpc_micros,
                'estimated_daily_cost_micros': metrics.cost_micros,
                'forecast_period_days': forecast_days,
                'start_date': request.forecast_period.start_date,
                'end_date': request.forecast_period.end_date
            }
            
            # طباعة النتائج كما في الكود الرسمي
            logger.info(f"Estimated daily clicks: {metrics.clicks}")
            logger.info(f"Estimated daily impressions: {metrics.impressions}")
            logger.info(f"Estimated daily average CPC: {metrics.average_cpc_micros}")
            
            logger.info(f"✅ تم إنشاء مقاييس التوقعات لـ {forecast_days} يوم")
            return {'success': True, 'forecast': forecast_data, 'message': f'تم إنشاء مقاييس التوقعات لـ {forecast_days} يوم'}
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء مقاييس التوقعات: {e}")
            return {'success': False, 'error': f'خطأ في إنشاء مقاييس التوقعات: {e}', 'forecast': None}
    
    def generate_ad_group_themes(self, customer_id: str, keywords: List[str], 
                                language_id: str, geo_target_ids: List[str]) -> Dict[str, Any]:
        """إنشاء مواضيع مجموعات الإعلانات - تطبيق الكود الرسمي من Google Ads API"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                return {'success': False, 'error': 'المكتبة الرسمية غير متوفرة', 'themes': []}
            
            if not customer_id or customer_id.strip() == '':
                return {'success': False, 'error': 'customer_id مطلوب', 'themes': []}
            
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            googleads_service = self.client.get_service("GoogleAdsService")
            
            # إنشاء الطلب - تطبيق الكود الرسمي
            request = self.client.get_type("GenerateAdGroupThemesRequest")
            request.customer_id = customer_id
            request.keywords = keywords
            request.language = googleads_service.language_constant_path(language_id)
            
            # إعداد المواقع الجغرافية - تطبيق الكود الرسمي
            for geo_id in geo_target_ids:
                request.geo_target_constants.append(googleads_service.geo_target_constant_path(geo_id))
            
            request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            
            logger.info(f"🔍 البحث عن مواضيع مجموعات الإعلانات...")
            response = keyword_plan_idea_service.generate_ad_group_themes(request=request)
            
            # معالجة النتائج - تطبيق الكود الرسمي
            themes = []
            for theme in response.ad_group_keyword_suggestions:
                theme_data = {
                    'ad_group': theme.ad_group_info.name,
                    'keywords': [kw.text for kw in theme.keyword_ideas],
                    'keyword_count': len(theme.keyword_ideas)
                }
                themes.append(theme_data)
                
                logger.info(f"Ad group theme '{theme.ad_group_info.name}' has {len(theme.keyword_ideas)} keywords")
            
            logger.info(f"✅ تم إنشاء {len(themes)} موضوع مجموعة إعلانات")
            return {'success': True, 'themes': themes, 'total_count': len(themes), 'message': f'تم إنشاء {len(themes)} موضوع مجموعة إعلانات'}
            
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء مواضيع مجموعات الإعلانات: {e}")
            return {'success': False, 'error': f'خطأ في إنشاء مواضيع مجموعات الإعلانات: {e}', 'themes': []}
    
    def extract_keywords_from_website(self, website_url: str, language_code: str = "ar", location_ids: List[str] = None, target_locations: List[str] = None, target_language: str = None) -> Dict[str, Any]:
        """استخراج الكلمات المفتاحية من الموقع الإلكتروني"""
        try:
            logger.info(f"🔍 بدء استخراج الكلمات المفتاحية من: {website_url}")
            
            # استخدام الدالة الموجودة
            result = self.generate_keyword_ideas(
                customer_id="5582327249",  # معرف العميل الحقيقي
                keyword_plan_request={
                    'website_url': website_url,
                    'language_code': target_language or language_code,
                    'location_ids': location_ids or target_locations or ["2682"]  # السعودية
                }
            )
            
            if result.get('success'):
                logger.info(f"✅ تم استخراج {len(result.get('keywords', []))} كلمة مفتاحية")
                return result
            else:
                logger.error(f"❌ فشل في استخراج الكلمات المفتاحية: {result.get('error')}")
                return result
                
        except Exception as e:
            logger.error(f"❌ خطأ في استخراج الكلمات المفتاحية من الموقع: {e}")
            return {
                'success': False,
                'error': f'خطأ في استخراج الكلمات المفتاحية: {e}',
                'keywords': []
            }

