"""
Google Keyword Planner الحقيقي
استخراج كلمات مفتاحية حقيقية من Google Ads
"""

import os
import sys
import logging
from typing import Dict, List, Any, Optional
from google.ads.googleads.errors import GoogleAdsException
import time

# Add parent directory to path for utils import
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

class RealKeywordPlanner:
    """مخطط الكلمات المفتاحية الحقيقي من Google"""
    
    def __init__(self):
        """تهيئة مخطط الكلمات المفتاحية"""
        self.logger = logging.getLogger(__name__)
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """تهيئة عميل Google Ads"""
        try:
            # استخدام الدالة المساعدة الموحدة
            from utils.google_ads_helper import get_google_ads_client
            self.client = get_google_ads_client()
            self.logger.info("✅ تم تهيئة Google Keyword Planner بنجاح")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ فشل تهيئة Google Keyword Planner: {e}")
            return False
    
    def get_keyword_ideas(self, 
                         seed_keywords: List[str], 
                         location_id: str = None,  # سيتم تحديدها حسب اختيار العميل
                         language_id: str = None,  # سيتم تحديدها حسب اختيار العميل
                         customer_id: str = None) -> Dict[str, Any]:
        """استخراج أفكار الكلمات المفتاحية الحقيقية"""
        
        if not self.client:
            return {
                'success': False,
                'error': 'Google Ads Client غير مهيأ',
                'keywords': []
            }
        
        try:
            if not customer_id:
                customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
            
            if not customer_id:
                return {
                    'success': False,
                    'error': 'معرف العميل مطلوب',
                    'keywords': []
                }
            
            # إنشاء طلب البحث عن الكلمات المفتاحية
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            
            # إعداد معايير البحث
            request = self.client.get_type("GenerateKeywordIdeasRequest")
            request.customer_id = customer_id
            request.language = f"languageConstants/{language_id}"
            request.geo_target_constants = [f"geoTargetConstants/{location_id}"]
            request.include_adult_keywords = False
            
            # إضافة الكلمات الأساسية
            for keyword in seed_keywords:
                keyword_seed = self.client.get_type("KeywordSeed")
                keyword_seed.keywords.append(keyword)
                request.keyword_seed.CopyFrom(keyword_seed)
                break  # نأخذ أول كلمة فقط للبساطة
            
            # تنفيذ الطلب
            self.logger.info(f"🔍 البحث عن الكلمات المفتاحية: {seed_keywords}")
            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            
            # معالجة النتائج
            keywords = []
            for result in response:
                if hasattr(result, 'text_metrics'):
                    keyword_data = {
                        'keyword': result.text,
                        'search_volume': getattr(result.text_metrics, 'monthly_search_volumes', [{}])[0].get('monthly_searches', 0) if result.text_metrics.monthly_search_volumes else 0,
                        'competition': self._get_competition_level(result.text_metrics.competition),
                        'competition_index': result.text_metrics.competition_index,
                        'low_top_of_page_bid_micros': result.text_metrics.low_top_of_page_bid_micros,
                        'high_top_of_page_bid_micros': result.text_metrics.high_top_of_page_bid_micros,
                        'source': 'google_keyword_planner'
                    }
                    keywords.append(keyword_data)
            
            self.logger.info(f"✅ تم استخراج {len(keywords)} كلمة مفتاحية حقيقية")
            
            return {
                'success': True,
                'keywords': keywords,
                'total_count': len(keywords),
                'message': 'تم استخراج الكلمات المفتاحية الحقيقية بنجاح'
            }
            
        except GoogleAdsException as e:
            self.logger.error(f"❌ خطأ Google Ads: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'keywords': []
            }
        except Exception as e:
            self.logger.error(f"❌ خطأ عام: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'keywords': []
            }
    
    def _get_competition_level(self, competition_enum) -> str:
        """تحويل مستوى المنافسة إلى نص"""
        if competition_enum == 0:  # UNKNOWN
            return 'unknown'
        elif competition_enum == 1:  # LOW
            return 'low'
        elif competition_enum == 2:  # MEDIUM
            return 'medium'
        elif competition_enum == 3:  # HIGH
            return 'high'
        else:
            return 'unknown'
    
    def get_keyword_historical_metrics(self, 
                                     keywords: List[str], 
                                     location_id: str = None,
                                     language_id: str = None,
                                     customer_id: str = None) -> Dict[str, Any]:
        """الحصول على المقاييس التاريخية للكلمات المفتاحية"""
        
        if not self.client:
            return {
                'success': False,
                'error': 'Google Ads Client غير مهيأ',
                'metrics': []
            }
        
        try:
            if not customer_id:
                customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
            
            # إنشاء خطة الكلمات المفتاحية
            keyword_plan_service = self.client.get_service("KeywordPlanService")
            
            # إنشاء الخطة
            keyword_plan = self.client.get_type("KeywordPlan")
            keyword_plan.name = f"Keyword Plan - {int(time.time())}"
            keyword_plan.customer_id = customer_id
            
            # إعداد المعايير الجغرافية واللغوية
            geo_target = self.client.get_type("KeywordPlanGeoTarget")
            geo_target.geo_target_constant = f"geoTargetConstants/{location_id}"
            keyword_plan.geo_targets.append(geo_target)
            
            language = self.client.get_type("KeywordPlanLanguage")
            language.language_constant = f"languageConstants/{language_id}"
            keyword_plan.language_constants.append(language)
            
            # إضافة الكلمات المفتاحية
            for keyword_text in keywords:
                keyword_plan_keyword = self.client.get_type("KeywordPlanKeyword")
                keyword_plan_keyword.text = keyword_text
                keyword_plan_keyword.match_type = self.client.get_type("KeywordMatchTypeEnum").BROAD
                keyword_plan.keyword_plan_network = self.client.get_type("KeywordPlanNetworkEnum").GOOGLE_SEARCH
                keyword_plan.keyword_plan_keywords.append(keyword_plan_keyword)
            
            # إنشاء الخطة
            create_request = self.client.get_type("CreateKeywordPlanRequest")
            create_request.customer_id = customer_id
            create_request.keyword_plan = keyword_plan
            
            keyword_plan_response = keyword_plan_service.create_keyword_plan(request=create_request)
            keyword_plan_resource_name = keyword_plan_response.resource_name
            
            # الحصول على المقاييس التاريخية
            historical_metrics_service = self.client.get_service("KeywordPlanHistoricalMetricsService")
            
            generate_request = self.client.get_type("GenerateHistoricalMetricsRequest")
            generate_request.keyword_plan = keyword_plan_resource_name
            
            historical_metrics_response = historical_metrics_service.generate_historical_metrics(request=generate_request)
            
            # معالجة النتائج
            metrics = []
            for result in historical_metrics_response.metrics:
                if hasattr(result, 'keyword_metrics'):
                    metric_data = {
                        'keyword': result.keyword_metrics.search_query,
                        'avg_monthly_searches': result.keyword_metrics.avg_monthly_searches,
                        'competition': self._get_competition_level(result.keyword_metrics.competition),
                        'competition_index': result.keyword_metrics.competition_index,
                        'low_top_of_page_bid_micros': result.keyword_metrics.low_top_of_page_bid_micros,
                        'high_top_of_page_bid_micros': result.keyword_metrics.high_top_of_page_bid_micros,
                        'source': 'google_historical_metrics'
                    }
                    metrics.append(metric_data)
            
            # حذف الخطة المؤقتة
            try:
                delete_request = self.client.get_type("DeleteKeywordPlanRequest")
                delete_request.resource_name = keyword_plan_resource_name
                keyword_plan_service.delete_keyword_plan(request=delete_request)
            except:
                pass  # تجاهل أخطاء الحذف
            
            self.logger.info(f"✅ تم الحصول على المقاييس التاريخية لـ {len(metrics)} كلمة مفتاحية")
            
            return {
                'success': True,
                'metrics': metrics,
                'total_count': len(metrics),
                'message': 'تم الحصول على المقاييس التاريخية بنجاح'
            }
            
        except GoogleAdsException as e:
            self.logger.error(f"❌ خطأ Google Ads في المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ Google Ads: {e}',
                'metrics': []
            }
        except Exception as e:
            self.logger.error(f"❌ خطأ عام في المقاييس التاريخية: {e}")
            return {
                'success': False,
                'error': f'خطأ عام: {e}',
                'metrics': []
            }
    
    def get_related_keywords(self, 
                           base_keyword: str, 
                           location_id: str = None,
                           language_id: str = None,
                           customer_id: str = None) -> Dict[str, Any]:
        """الحصول على الكلمات المفتاحية ذات الصلة"""
        
        # استخدام الكلمة الأساسية للحصول على كلمات ذات صلة
        related_keywords = self.get_keyword_ideas(
            seed_keywords=[base_keyword],
            location_id=location_id,
            language_id=language_id,
            customer_id=customer_id
        )
        
        if related_keywords['success']:
            # تصفية الكلمات ذات الصلة (تحتوي على الكلمة الأساسية أو مشابهة)
            filtered_keywords = []
            base_words = base_keyword.lower().split()
            
            for keyword_data in related_keywords['keywords']:
                keyword_text = keyword_data['keyword'].lower()
                
                # التحقق من وجود كلمات مشابهة
                if any(word in keyword_text for word in base_words):
                    filtered_keywords.append(keyword_data)
            
            return {
                'success': True,
                'keywords': filtered_keywords,
                'total_count': len(filtered_keywords),
                'message': f'تم العثور على {len(filtered_keywords)} كلمة مفتاحية ذات صلة'
            }
        else:
            return related_keywords
