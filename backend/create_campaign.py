#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ملف إنشاء الحملة الإعلانية باستخدام المكتبة الرسمية
Campaign Creation Script using Official Google Ads Library
"""

import os
import sys
import logging
import argparse
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

# تعيين الترميز إلى UTF-8 لدعم النصوص العربية والرموز
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# إضافة مسار المكتبة الرسمية
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'google-ads-official'))

# تحميل متغيرات البيئة
try:
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env.development'))
except Exception as e:
    print(f"⚠️ تحذير: لا يمكن تحميل ملف .env.development: {e}")
load_dotenv()  # تحميل إضافي من المسار الحالي

# استيراد المكتبة الرسمية
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# استيراد مكتبة أنواع الحملات الجديدة
from campaign_types import get_campaign_creator

# استيراد نظام التحقق من الحملات
from campaign_validator import CampaignValidator

# استيراد الخدمات المتقدمة
from services.ai_campaign_creator import AICampaignCreator
from services.campaign_builder import CampaignBuilder
from services.google_ads_official_service import GoogleAdsOfficialService
from services.keyword_planner_service import KeywordPlannerService
from services.website_analyzer import WebsiteAnalyzer
from services.image_generation_service import ImageGenerationService
from services.ai_content_generator import AIContentGenerator
from services.ai_campaign_selector import AICampaignSelector
from google.ads.googleads.v21.enums.types.keyword_plan_competition_level import (
    KeywordPlanCompetitionLevelEnum,
)
from google.ads.googleads.v21.enums.types.keyword_plan_network import (
    KeywordPlanNetworkEnum,
)
from google.ads.googleads.v21.services.services.geo_target_constant_service.client import (
    GeoTargetConstantServiceClient,
)
from google.ads.googleads.v21.services.services.google_ads_service.client import (
    GoogleAdsServiceClient,
)
from google.ads.googleads.v21.services.services.keyword_plan_idea_service.client import (
    KeywordPlanIdeaServiceClient,
)
from google.ads.googleads.v21.services.types.keyword_plan_idea_service import (
    GenerateKeywordIdeasRequest,
    GenerateKeywordIdeaResult,
)

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

class OfficialCampaignCreator:
    """فئة إنشاء الحملة الإعلانية باستخدام المكتبة الرسمية"""
    
    def __init__(self, customer_id=None):
        """تهيئة منشئ الحملة الرسمي"""
        try:
            # تهيئة عميل Google Ads الرسمي
            config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'google-ads-official', 'google-ads.yaml')
            if os.path.exists(config_path):
                self.client = GoogleAdsClient.load_from_storage(config_path)
            else:
                # استخدام متغيرات البيئة إذا لم يوجد ملف الإعدادات
                print("🔍 استخدام متغيرات البيئة لتهيئة Google Ads API...")
                
                # التحقق من وجود متغيرات البيئة
                dev_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
                client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
                client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
                refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
                
                print(f"  Developer Token: {'✅ موجود' if dev_token else '❌ غير موجود'}")
                print(f"  Client ID: {'✅ موجود' if client_id else '❌ غير موجود'}")
                print(f"  Client Secret: {'✅ موجود' if client_secret else '❌ غير موجود'}")
                print(f"  Refresh Token: {'✅ موجود' if refresh_token else '❌ غير موجود'}")
                
                if not all([dev_token, client_id, client_secret, refresh_token]):
                    raise ValueError("متغيرات البيئة غير مكتملة")
                
                self.client = GoogleAdsClient.load_from_dict({
                    'developer_token': os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN'),
                    'client_id': os.getenv('GOOGLE_ADS_CLIENT_ID'),
                    'client_secret': os.getenv('GOOGLE_ADS_CLIENT_SECRET'),
                    'refresh_token': os.getenv('GOOGLE_ADS_REFRESH_TOKEN'),
                    'login_customer_id': '9252466178',  # MCC Login Customer ID
                    'use_proto_plus': True,
                })
            
            # استخدام الحساب المختار من الفرونت إند أو الافتراضي
            self.customer_id = customer_id if customer_id else os.getenv('GOOGLE_ADS_CUSTOMER_ID', '5582327249')
            logger.info(f"🎯 OfficialCampaignCreator initialized with customer_id: {self.customer_id}")
            
            # التحقق من صحة الإعدادات
            if not self.client:
                raise ValueError("Google Ads API client not initialized")
            
            # تهيئة الخدمات المتقدمة
            try:
                self.ai_campaign_creator = AICampaignCreator()
                self.campaign_builder = CampaignBuilder()
                self.google_ads_service = GoogleAdsOfficialService()
                self.keyword_planner = KeywordPlannerService()
                self.website_analyzer = WebsiteAnalyzer()
                self.image_generator = ImageGenerationService()
                self.ai_campaign_selector = AICampaignSelector()  # اختيار نوع الحملة بالذكاء الاصطناعي
                logger.info("✅ تم تهيئة الخدمات المتقدمة بنجاح")
            except Exception as e:
                logger.error(f"❌ فشل في تهيئة الخدمات المتقدمة: {e}")
            
            logger.info("✅ تم تهيئة منشئ الحملة الرسمي بنجاح")
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة منشئ الحملة الرسمي: {e}")
            # إنشاء عميل وهمي للاختبار
            self.client = None
            self.customer_id = None
            logger.warning("⚠️ تم إنشاء عميل وهمي للاختبار")
    
    def get_linked_accounts(self) -> List[Dict[str, Any]]:
        """جلب الحسابات المرتبطة من MCC"""
        try:
            if not self.client:
                print("❌ Google Ads API غير متاح")
                return []
            
            print("🔍 جلب الحسابات المرتبطة من MCC...")
            
            # استخدام MCC للوصول إلى الحسابات المرتبطة
            customer_service = self.client.get_service("CustomerService")
            
            # جلب قائمة الحسابات المرتبطة
            request = self.client.get_type("ListAccessibleCustomersRequest")
            response = customer_service.list_accessible_customers(request=request)
            
            accounts = []
            print(f"📊 تم العثور على {len(response.resource_names)} حساب مرتبط")
            
            for resource_name in response.resource_names:
                # استخراج Customer ID من resource_name
                customer_id = resource_name.split('/')[-1]
                
                # جلب تفاصيل الحساب باستخدام GoogleAdsService
                try:
                    ga_service = self.client.get_service("GoogleAdsService")
                    
                    query = f"""
                        SELECT
                            customer.id,
                            customer.descriptive_name,
                            customer.currency_code,
                            customer.time_zone,
                            customer.manager,
                            customer.test_account,
                            customer.resource_name
                        FROM customer
                        WHERE customer.resource_name = '{resource_name}'
                    """
                    
                    response_data = ga_service.search(customer_id=customer_id, query=query)
                    
                    for row in response_data:
                        account_info = {
                            'customer_id': customer_id,
                            'descriptive_name': row.customer.descriptive_name,
                            'currency_code': row.customer.currency_code,
                            'time_zone': row.customer.time_zone,
                            'manager': row.customer.manager,
                            'test_account': row.customer.test_account,
                            'resource_name': resource_name
                        }
                        
                        accounts.append(account_info)
                    print(f"  ✅ {row.customer.descriptive_name} ({customer_id}) - Manager: {row.customer.manager}")
                    
                except Exception as e:
                    print(f"  ❌ خطأ في جلب تفاصيل الحساب {customer_id}: {e}")
                    # حتى لو فشل جلب التفاصيل، أضف الحساب بالمعلومات الأساسية
                    accounts.append({
                        'customer_id': customer_id,
                        'descriptive_name': f'Customer {customer_id}',
                        'currency_code': 'USD',
                        'time_zone': 'UTC',
                        'manager': False,
                        'test_account': False,
                        'resource_name': resource_name
                    })
                    continue
            
            print(f"📋 إجمالي الحسابات المتاحة: {len(accounts)}")
            return accounts
            
        except Exception as e:
            print(f"❌ خطأ في جلب الحسابات المرتبطة: {e}")
            return []
    
    def set_customer_id(self, customer_id: str):
        """تعيين Customer ID ديناميكياً"""
        self.customer_id = customer_id
        logger.info(f"✅ تم تعيين Customer ID: {customer_id}")
    
    def auto_select_customer_account(self) -> bool:
        """اختيار حساب العميل تلقائياً من الحسابات المرتبطة"""
        try:
            if not self.client:
                print("❌ Google Ads API غير متاح")
                return False
            
            # جلب الحسابات المرتبطة
            accounts = self.get_linked_accounts()
            
            if not accounts:
                print("❌ لا توجد حسابات مرتبطة في MCC")
                return False
            
            # استخدام أول حساب مرتبط في MCC (أي حساب)
            if accounts:
                account = accounts[0]  # أول حساب مرتبط
                self.set_customer_id(account['customer_id'])
                print(f"✅ تم اختيار حساب من MCC: {account['descriptive_name']} ({account['customer_id']})")
                return True
            
            print("❌ لا توجد حسابات مرتبطة في MCC")
            return False
            
        except Exception as e:
            print(f"❌ خطأ في اختيار الحساب تلقائياً: {e}")
            return False
    
    def _classify_keyword_type(self, keyword_text: str) -> Dict[str, Any]:
        """تصنيف الكلمة المفتاحية حسب النوع والنية"""
        keyword_lower = keyword_text.lower()
        word_count = len(keyword_text.split())
        
        # تصنيف حسب الطول
        if word_count == 1:
            length_type = "short_tail"  # كلمات قصيرة الذيل
        elif word_count == 2:
            length_type = "medium_tail"  # كلمات متوسطة الذيل
        else:
            length_type = "long_tail"  # كلمات طويلة الذيل
        
        # تصنيف حسب النية (Intent)
        intent_type = "informational"  # افتراضي
        
        # كلمات تجارية (Commercial)
        commercial_keywords = ['شراء', 'سعر', 'تكلفة', 'رخيص', 'أرخص', 'خصم', 'عرض', 'تخفيض', 'مقارنة', 'أفضل', 'buy', 'price', 'cost', 'cheap', 'discount', 'offer', 'compare', 'best']
        if any(word in keyword_lower for word in commercial_keywords):
            intent_type = "commercial"
        
        # كلمات معاملاتية (Transactional)
        transactional_keywords = ['طلب', 'احجز', 'اشتر', 'سجل', 'اتصل', 'احصل على', 'order', 'book', 'buy', 'purchase', 'contact', 'get']
        if any(word in keyword_lower for word in transactional_keywords):
            intent_type = "transactional"
        
        # كلمات ملاحية (Navigational)
        navigational_keywords = ['موقع', 'صفحة', 'تطبيق', 'موقع رسمي', 'website', 'official', 'app', 'page']
        if any(word in keyword_lower for word in navigational_keywords):
            intent_type = "navigational"
        
        # كلمات محلية (Local)
        local_keywords = ['في', 'بالقرب من', 'محلي', 'مدينة', 'منطقة', 'in', 'near', 'local', 'city', 'area']
        if any(word in keyword_lower for word in local_keywords):
            intent_type = "local"
        
        # كلمات استفهامية (Question-based)
        question_keywords = ['كيف', 'ماذا', 'أين', 'متى', 'لماذا', 'ما هو', 'how', 'what', 'where', 'when', 'why', 'what is']
        if any(word in keyword_lower for word in question_keywords):
            intent_type = "question"
        
        return {
            "length_type": length_type,
            "intent_type": intent_type,
            "word_count": word_count,
            "keyword_text": keyword_text
        }
    
    def _calculate_keyword_metrics(self, keyword_text: str, target_language: str) -> tuple:
        """حساب المقاييس بناءً على نوع الكلمة المفتاحية"""
        # تصنيف الكلمة المفتاحية
        classification = self._classify_keyword_type(keyword_text)
        
        # حساب المقاييس الأساسية
        avg_searches = 500
        competition = 'MEDIUM'
        competition_index = 40
        low_bid = 2.0
        high_bid = 7.0
        
        # تعديل المقاييس حسب نوع الطول
        if classification["length_type"] == "short_tail":
            avg_searches = int(avg_searches * 1.8)
            competition = 'HIGH'
            competition_index = min(90, competition_index + 25)
        elif classification["length_type"] == "medium_tail":
            avg_searches = int(avg_searches * 1.2)
            competition_index = min(85, competition_index + 10)
        else:  # long_tail
            avg_searches = int(avg_searches * 0.6)
            competition = 'LOW'
            competition_index = max(10, competition_index - 25)
        
        # تعديل المقاييس حسب النية
        if classification["intent_type"] == "transactional":
            avg_searches = int(avg_searches * 1.5)
            competition = 'HIGH'
            competition_index = min(90, competition_index + 20)
            low_bid = max(3.0, low_bid * 1.5)
            high_bid = max(5.0, high_bid * 1.5)
        elif classification["intent_type"] == "commercial":
            avg_searches = int(avg_searches * 1.3)
            competition_index = min(85, competition_index + 15)
            low_bid = max(2.5, low_bid * 1.3)
            high_bid = max(4.0, high_bid * 1.3)
        elif classification["intent_type"] == "local":
            avg_searches = int(avg_searches * 0.8)
            competition = 'MEDIUM'
            competition_index = max(20, competition_index - 10)
        elif classification["intent_type"] == "informational":
            avg_searches = int(avg_searches * 0.9)
            competition = 'LOW'
            competition_index = max(15, competition_index - 15)
        
        # ضمان أن القيم ضمن الحدود المعقولة
        avg_searches = max(50, min(5000, avg_searches))
        competition_index = max(10, min(90, competition_index))
        low_bid = max(0.5, min(20.0, low_bid))
        high_bid = max(low_bid + 1.0, min(50.0, high_bid))
        
        return avg_searches, competition, competition_index, low_bid, high_bid

    def extract_website_content(self, website_url: str, target_language: str = "1019", target_locations: List[str] = ["2682"]) -> Dict[str, Any]:
        """استخراج محتوى الموقع باستخدام Google Keyword Planner API"""
        try:
            print(f"🔍 تحليل محتوى الموقع باستخدام Google Keyword Planner: {website_url}")
            print(f"🌐 اللغة المستخدمة: {target_language} ({'العربية' if target_language == '1019' else 'الإنجليزية' if target_language == '1000' else 'غير محدد'})")
            print(f"📍 الموقع الجغرافي: {target_locations}")
            
            # استخدام Google Keyword Planner API لاستخراج الكلمات المفتاحية الحقيقية
            if not self.client:
                print("❌ Google Ads API غير متاح - يلزم إعداد API")
                return None
            
            # استخدام الحساب المرتبط المحدد
            print(f"✅ استخدام الحساب المرتبط: {self.customer_id}")
            
            # استخراج الكلمات المفتاحية الحقيقية من Google Keyword Planner
            keyword_plan_idea_service = self.client.get_service("KeywordPlanIdeaService")
            
            # إعداد الطلب
            request = self.client.get_type("GenerateKeywordIdeasRequest")
            request.customer_id = self.customer_id
            
            # استخدام URL الموقع
            request.url_seed.url = website_url
            
            # إعداد اللغة والموقع (ديناميكي)
            request.language = f"languageConstants/{target_language}"
            
            # إعداد الموقع الجغرافي (ديناميكي)
            geo_targets = [f"geoTargetConstants/{loc}" for loc in target_locations]
            request.geo_target_constants = geo_targets
            
            # إعداد الشبكة
            request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            request.include_adult_keywords = False
            
            # تنفيذ الطلب الأساسي
            print("🔍 جلب الكلمات المفتاحية الأساسية...")
            response = keyword_plan_idea_service.generate_keyword_ideas(request=request)
            
            # جمع الكلمات المفتاحية أولاً مع فلترة حسب اللغة
            keyword_texts = []
            seen_keywords = set()
            
            for result in response:
                if not hasattr(result, 'text') or not result.text:
                    continue
                    
                keyword_text = result.text.strip()
                
                # تجنب الكلمات المكررة (حساسية للحالة)
                if keyword_text.lower() in seen_keywords:
                    continue
                
                # فلترة الكلمات المفتاحية حسب اللغة المختارة
                if target_language == "1019":  # العربية
                    # قبول الكلمات العربية فقط
                    if any('\u0600' <= char <= '\u06FF' for char in keyword_text):
                        # تجنب الكلمات المفتاحية الثابتة والمتكررة
                        if not any(common_word in keyword_text.lower() for common_word in 
                                 ['clean service', 'deep clean', 'cleaning service', 'house cleaning', 
                                  'office cleaning', 'carpet cleaning', 'window cleaning']):
                            seen_keywords.add(keyword_text.lower())
                            keyword_texts.append(keyword_text)
                elif target_language == "1000":  # الإنجليزية
                    # قبول الكلمات الإنجليزية فقط
                    if all(ord(char) < 128 for char in keyword_text if char.isalpha()):
                        # تجنب الكلمات المفتاحية الثابتة والمتكررة
                        if not any(common_word in keyword_text.lower() for common_word in 
                                 ['تنظيف', 'خدمات', 'شركة', 'مكتب', 'منزل', 'شقة']):
                            seen_keywords.add(keyword_text.lower())
                            keyword_texts.append(keyword_text)
                else:
                    # للغات الأخرى، قبول جميع الكلمات
                    seen_keywords.add(keyword_text.lower())
                    keyword_texts.append(keyword_text)
            
            print(f"📊 تم جمع {len(keyword_texts)} كلمة مفتاحية فريدة باللغة المختارة")
            
            # التحقق من وجود كلمات مفتاحية باللغة المختارة
            if not keyword_texts:
                language_display = "العربية" if target_language == "1019" else "الإنجليزية" if target_language == "1000" else "المختارة"
                print(f"⚠️ لم يتم العثور على كلمات مفتاحية باللغة المختارة ({language_display})")
                print("🔄 سيتم استخراج الكلمات المفتاحية من URL الموقع...")
                
                # استخراج الكلمات من URL
                from urllib.parse import unquote
                url_decoded = unquote(website_url)
                url_keywords = []
                
                # استخراج الكلمات من المسار
                import re
                # إزالة النطاق والحصول على المسار فقط
                path = url_decoded.split('.com/')[-1] if '.com/' in url_decoded else url_decoded
                # تقسيم حسب - و / و _
                words = re.split(r'[-/_]', path)
                # تصفية الكلمات الفارغة والرموز
                words = [w.strip() for w in words if w and len(w) > 2 and not w.isdigit()]
                
                # إنشاء تراكيب من الكلمات
                if len(words) >= 2:
                    url_keywords.append(' '.join(words[:2]))  # أول كلمتين
                    if len(words) >= 3:
                        url_keywords.append(' '.join(words[:3]))  # أول 3 كلمات
                        url_keywords.append(' '.join(words[1:3]))  # الكلمة الثانية والثالثة
                    if len(words) >= 4:
                        url_keywords.append(' '.join(words[:4]))  # أول 4 كلمات
                
                # إضافة كلمات فردية إذا كانت طويلة
                url_keywords.extend([w for w in words if len(w) > 4])
                
                if url_keywords:
                    keyword_texts = url_keywords[:10]  # أول 10 كلمات
                    print(f"📝 تم استخراج {len(keyword_texts)} كلمة مفتاحية من URL: {keyword_texts}")
                else:
                    # Fallback: استخدام كلمات عامة فقط في حالة الفشل التام
                    if target_language == "1019":  # العربية
                        keyword_texts = ["خدمات", "شركة", "خدمات عامة"]
                    elif target_language == "1000":  # الإنجليزية
                        keyword_texts = ["services", "company", "professional services"]
                    else:
                        keyword_texts = ["services", "company"]
                    print(f"📝 تم إضافة {len(keyword_texts)} كلمة مفتاحية عامة")
            
            # الآن جلب المقاييس التاريخية للكلمات المفتاحية
            keywords = []
            result_count = 0
            
            if keyword_texts:
                print("📈 جلب المقاييس التاريخية...")
                try:
                    # إعداد طلب المقاييس التاريخية
                    historical_request = self.client.get_type("GenerateKeywordHistoricalMetricsRequest")
                    historical_request.customer_id = self.customer_id
                    historical_request.keywords = keyword_texts[:100]  # حد أقصى 100 كلمة
                    historical_request.language = f"languageConstants/{target_language}"
                    historical_request.geo_target_constants = geo_targets
                    historical_request.keyword_plan_network = self.client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
                    
                    # تنفيذ طلب المقاييس التاريخية
                    historical_response = keyword_plan_idea_service.generate_keyword_historical_metrics(request=historical_request)
                    
                    # معالجة النتائج مع المقاييس التاريخية
                    if hasattr(historical_response, 'results') and historical_response.results:
                        for result in historical_response.results:
                            if not hasattr(result, 'text') or not result.text:
                                continue
                                
                            keyword_text = result.text.strip()
                            result_count += 1
                            
                            if hasattr(result, 'keyword_metrics') and result.keyword_metrics:
                                metrics = result.keyword_metrics
                                
                                # استخراج جميع المقاييس التاريخية
                                avg_searches = metrics.avg_monthly_searches if hasattr(metrics, 'avg_monthly_searches') else 0
                                competition = metrics.competition.name if hasattr(metrics, 'competition') and metrics.competition else 'UNKNOWN'
                                competition_index = metrics.competition_index if hasattr(metrics, 'competition_index') else 0
                                low_bid = metrics.low_top_of_page_bid_micros if hasattr(metrics, 'low_top_of_page_bid_micros') else 0
                                high_bid = metrics.high_top_of_page_bid_micros if hasattr(metrics, 'high_top_of_page_bid_micros') else 0
                                
                                # التحقق من صحة البيانات - إذا كانت جميع المقاييس 0 أو UNKNOWN، استخدم المقاييس المحسوبة
                                if avg_searches == 0 and competition == 'UNKNOWN' and competition_index == 0:
                                    # تصنيف الكلمة المفتاحية
                                    classification = self._classify_keyword_type(keyword_text)
                                    
                                    print(f"🔍 {result_count}: {keyword_text} | استخدام المقاييس المحسوبة (البيانات التاريخية غير متاحة)")
                                    print(f"    🏷️ نوع الطول: {classification['length_type']} ({classification['word_count']} كلمة)")
                                    print(f"    🎯 نوع النية: {classification['intent_type']}")
                                    
                                    # حساب المقاييس بناءً على نوع الكلمة المفتاحية
                                    calc_searches, calc_competition, calc_competition_index, calc_low_bid, calc_high_bid = self._calculate_keyword_metrics(keyword_text, target_language)
                                    
                                    print(f"    📊 البحث الشهري: {calc_searches:,}")
                                    print(f"    🏆 مستوى المنافسة: {calc_competition}")
                                    print(f"    📈 مؤشر المنافسة: {calc_competition_index}")
                                    
                                    if calc_low_bid > 0 and calc_high_bid > 0:
                                        print(f"    💰 السعر المنخفض: {calc_low_bid:.2f}$")
                                        print(f"    💰 السعر العالي: {calc_high_bid:.2f}$")
                                    else:
                                        print(f"    💰 الأسعار: غير متاحة (لا توجد بيانات كافية للتنبؤ)")
                                    print()
                                    
                                    keywords.append({
                                        'text': keyword_text,
                                        'avg_monthly_searches': calc_searches,
                                        'competition': calc_competition,
                                        'competition_index': calc_competition_index,
                                        'low_top_of_page_bid_micros': calc_low_bid * 1000000,  # تحويل للمايكرو
                                        'high_top_of_page_bid_micros': calc_high_bid * 1000000,  # تحويل للمايكرو
                                        'source': 'calculated_metrics_fallback',
                                        'classification': classification
                                    })
                                else:
                                    # تصنيف الكلمة المفتاحية
                                    classification = self._classify_keyword_type(keyword_text)
                                    
                                    # طباعة المقاييس الكاملة من Google
                                    print(f"🔍 {result_count}: {keyword_text}")
                                    print(f"    🏷️ نوع الطول: {classification['length_type']} ({classification['word_count']} كلمة)")
                                    print(f"    🎯 نوع النية: {classification['intent_type']}")
                                    print(f"    📊 البحث الشهري: {avg_searches:,}")
                                    print(f"    🏆 مستوى المنافسة: {competition}")
                                    print(f"    📈 مؤشر المنافسة: {competition_index}")
                                    
                                    # عرض الأسعار مع رسالة توضيحية إذا كانت غير متاحة
                                    if low_bid > 0 and high_bid > 0:
                                        print(f"    💰 السعر المنخفض: {low_bid / 1000000:.2f}$")
                                        print(f"    💰 السعر العالي: {high_bid / 1000000:.2f}$")
                                    else:
                                        print(f"    💰 الأسعار: غير متاحة (لا توجد بيانات كافية للتنبؤ)")
                                    print()
                                    
                                    keywords.append({
                                        'text': keyword_text,
                                        'avg_monthly_searches': avg_searches,
                                        'competition': competition,
                                        'competition_index': competition_index,
                                        'low_top_of_page_bid_micros': low_bid,
                                        'high_top_of_page_bid_micros': high_bid,
                                        'source': 'google_keyword_planner_historical',
                                        'classification': classification
                                    })
                            else:
                                # تصنيف الكلمة المفتاحية
                                classification = self._classify_keyword_type(keyword_text)
                                
                                print(f"🔍 {result_count}: {keyword_text} | استخدام المقاييس المحسوبة (بدون مقاييس تاريخية)")
                                print(f"    🏷️ نوع الطول: {classification['length_type']} ({classification['word_count']} كلمة)")
                                print(f"    🎯 نوع النية: {classification['intent_type']}")
                                
                                # حساب المقاييس بناءً على نوع الكلمة المفتاحية
                                calc_searches, calc_competition, calc_competition_index, calc_low_bid, calc_high_bid = self._calculate_keyword_metrics(keyword_text, target_language)
                                
                                print(f"    📊 البحث الشهري: {calc_searches:,}")
                                print(f"    🏆 مستوى المنافسة: {calc_competition}")
                                print(f"    📈 مؤشر المنافسة: {calc_competition_index}")
                                
                                if calc_low_bid > 0 and calc_high_bid > 0:
                                    print(f"    💰 السعر المنخفض: {calc_low_bid:.2f}$")
                                    print(f"    💰 السعر العالي: {calc_high_bid:.2f}$")
                                else:
                                    print(f"    💰 الأسعار: غير متاحة (لا توجد بيانات كافية للتنبؤ)")
                                print()
                                
                                keywords.append({
                                    'text': keyword_text,
                                    'avg_monthly_searches': calc_searches,
                                    'competition': calc_competition,
                                    'competition_index': calc_competition_index,
                                    'low_top_of_page_bid_micros': calc_low_bid * 1000000,  # تحويل للمايكرو
                                    'high_top_of_page_bid_micros': calc_high_bid * 1000000,  # تحويل للمايكرو
                                    'source': 'calculated_metrics_no_historical',
                                    'classification': classification
                                })
                    else:
                        print("⚠️ لا توجد نتائج في المقاييس التاريخية")
                        # العودة للبيانات الأساسية
                        for i, keyword_text in enumerate(keyword_texts[:50], 1):
                            keywords.append({
                                'text': keyword_text,
                                'avg_monthly_searches': 0,
                                'competition': 'UNKNOWN',
                                'competition_index': 0,
                                'low_top_of_page_bid_micros': 0,
                                'high_top_of_page_bid_micros': 0,
                                'source': 'google_keyword_planner_basic'
                            })
                        raise Exception("لا توجد نتائج في المقاييس التاريخية")
                    
                    print(f"✅ تم جلب المقاييس التاريخية لـ {len(keywords)} كلمة مفتاحية")
                    
                except Exception as e:
                    print(f"⚠️ فشل في جلب المقاييس التاريخية: {e}")
                    print("🔄 استخدام المقاييس المحسوبة بناءً على نوع الكلمة...")
                    
                    # استخدام مقاييس محسوبة بناءً على نوع الكلمة المفتاحية
                    for i, keyword_text in enumerate(keyword_texts[:50], 1):
                        result_count += 1
                        
                        # تصنيف الكلمة المفتاحية
                        classification = self._classify_keyword_type(keyword_text)
                        
                        # حساب المقاييس بناءً على نوع الكلمة المفتاحية
                        avg_searches, competition, competition_index, low_bid, high_bid = self._calculate_keyword_metrics(keyword_text, target_language)
                        
                        print(f"🔍 {result_count}: {keyword_text}")
                        print(f"    🏷️ نوع الطول: {classification['length_type']} ({classification['word_count']} كلمة)")
                        print(f"    🎯 نوع النية: {classification['intent_type']}")
                        print(f"    📊 البحث الشهري: {avg_searches:,}")
                        print(f"    🏆 مستوى المنافسة: {competition}")
                        print(f"    📈 مؤشر المنافسة: {competition_index}")
                        
                        if low_bid > 0 and high_bid > 0:
                            print(f"    💰 السعر المنخفض: {low_bid:.2f}$")
                            print(f"    💰 السعر العالي: {high_bid:.2f}$")
                        else:
                            print(f"    💰 الأسعار: غير متاحة (لا توجد بيانات كافية للتنبؤ)")
                        print()
                        
                        keywords.append({
                            'text': keyword_text,
                            'avg_monthly_searches': avg_searches,
                            'competition': competition,
                            'competition_index': competition_index,
                            'low_top_of_page_bid_micros': low_bid * 1000000,  # تحويل للمايكرو
                            'high_top_of_page_bid_micros': high_bid * 1000000,  # تحويل للمايكرو
                            'source': 'calculated_metrics',
                            'classification': classification
                        })
            
            print(f"📊 إجمالي النتائج المعروضة: {len(keywords)}")
            print(f"🔑 الكلمات المفتاحية الصالحة: {len(keywords)}")
            
            # 🎯 تصفية الكلمات المفتاحية - استخدام فقط LOW و MEDIUM في المنافسة
            keywords_before_filter = len(keywords)
            keywords = [kw for kw in keywords if kw.get('competition') in ['LOW', 'MEDIUM']]
            keywords_after_filter = len(keywords)
            
            if keywords_before_filter > keywords_after_filter:
                print(f"\n🎯 تصفية الكلمات المفتاحية حسب مستوى المنافسة:")
                print(f"   📊 الكلمات قبل التصفية: {keywords_before_filter}")
                print(f"   ✅ الكلمات بعد التصفية (LOW/MEDIUM فقط): {keywords_after_filter}")
                print(f"   ❌ تم استبعاد: {keywords_before_filter - keywords_after_filter} كلمة (HIGH/UNKNOWN)")
            
            # ملخص الكلمات المفتاحية حسب التصنيف
            if keywords:
                print("\n📋 ملخص الكلمات المفتاحية حسب التصنيف:")
                print("=" * 60)
                
                # تصنيف حسب الطول
                short_tail = [kw for kw in keywords if kw.get('classification', {}).get('length_type') == 'short_tail']
                medium_tail = [kw for kw in keywords if kw.get('classification', {}).get('length_type') == 'medium_tail']
                long_tail = [kw for kw in keywords if kw.get('classification', {}).get('length_type') == 'long_tail']
                
                print(f"🏷️ كلمات قصيرة الذيل: {len(short_tail)} كلمة")
                print(f"🏷️ كلمات متوسطة الذيل: {len(medium_tail)} كلمة")
                print(f"🏷️ كلمات طويلة الذيل: {len(long_tail)} كلمة")
                
                # تصنيف حسب النية
                transactional = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'transactional']
                commercial = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'commercial']
                informational = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'informational']
                local = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'local']
                navigational = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'navigational']
                question = [kw for kw in keywords if kw.get('classification', {}).get('intent_type') == 'question']
                
                print(f"\n🎯 كلمات معاملاتية (للعملاء المحتملين): {len(transactional)} كلمة")
                print(f"🎯 كلمات تجارية: {len(commercial)} كلمة")
                print(f"🎯 كلمات معلوماتية: {len(informational)} كلمة")
                print(f"🎯 كلمات محلية: {len(local)} كلمة")
                print(f"🎯 كلمات ملاحية: {len(navigational)} كلمة")
                print(f"🎯 كلمات استفهامية: {len(question)} كلمة")
                
                # تصنيف حسب مستوى المنافسة
                low_competition = [kw for kw in keywords if kw.get('competition') == 'LOW']
                medium_competition = [kw for kw in keywords if kw.get('competition') == 'MEDIUM']
                
                print(f"\n🏆 تصنيف حسب مستوى المنافسة:")
                print(f"🟢 منافسة منخفضة (LOW): {len(low_competition)} كلمة")
                print(f"🟡 منافسة متوسطة (MEDIUM): {len(medium_competition)} كلمة")
                print(f"✅ إجمالي الكلمات المستخدمة: {len(low_competition) + len(medium_competition)} كلمة")
                
                # عرض أفضل الكلمات للعملاء المحتملين
                if transactional:
                    print(f"\n⭐ أفضل الكلمات للعملاء المحتملين (معاملاتية):")
                    for i, kw in enumerate(transactional[:3], 1):
                        print(f"  {i}. {kw['text']} - {kw['avg_monthly_searches']:,} بحث شهري")
                
                if commercial:
                    print(f"\n⭐ أفضل الكلمات التجارية:")
                    for i, kw in enumerate(commercial[:3], 1):
                        print(f"  {i}. {kw['text']} - {kw['avg_monthly_searches']:,} بحث شهري")
            
            # استخراج رقم الهاتف من URL (عام)
            phone_number = None
            
            result = {
                'title': f"موقع {website_url.split('/')[-1]}",
                'description': f"خدمات متخصصة من {website_url}",
                'keywords': [kw['text'] for kw in keywords[:20]],
                'phone_number': phone_number,
                'content_length': len(str(keywords)),
                'real_keywords': keywords[:20]  # الكلمات المفتاحية الحقيقية مع البيانات
            }
            
            print(f"✅ تم تحليل الموقع باستخدام Google Keyword Planner")
            print(f"🔑 الكلمات المفتاحية الحقيقية: {len(keywords)} كلمة")
            if phone_number:
                print(f"📞 رقم الهاتف: {phone_number}")
            
            return result
            
        except Exception as e:
            print(f"❌ خطأ في تحليل الموقع: {e}")
            return None
    
    def analyze_website(self, website_url: str, target_language: str = "1019", target_locations: List[str] = ["2682"]) -> Dict[str, Any]:
        """تحليل الموقع"""
        print("🔍 تحليل الموقع...")
        print("=" * 50)
        
        try:
            # تحليل حقيقي للموقع
            website_content = self.extract_website_content(website_url, target_language, target_locations)
            
            if website_content:
                print(f"✅ تم تحليل الموقع بنجاح: {website_url}")
                print("📝 معلومات الموقع:")
                print(f"  🌐 الرابط: {website_url}")
                print(f"  📊 العنوان: {website_content['title'][:50]}...")
                print(f"  📝 الوصف: {website_content['description'][:50]}...")
                print(f"  🔑 الكلمات المفتاحية: {len(website_content['keywords'])} كلمة")
                print(f"  📞 رقم الهاتف: {website_content['phone_number'] if website_content['phone_number'] else 'غير محدد'}")
                print(f"  📏 طول المحتوى: {website_content['content_length']} حرف")
                
                return {
                    "success": True,
                    "analysis": website_content,
                    "message": "تم تحليل الموقع بنجاح"
                }
            else:
                print(f"❌ فشل في تحليل الموقع: {website_url}")
                return {
                    "success": False,
                    "error": "فشل في تحليل الموقع",
                    "message": "لا يمكن تحليل محتوى الموقع"
                }
                
        except Exception as e:
            print(f"❌ خطأ في تحليل الموقع: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في تحليل الموقع"
            }
    
    def extract_keywords(self, website_url: str, target_locations: List[str], target_language: str) -> Dict[str, Any]:
        """استخراج الكلمات المفتاحية باستخدام المكتبة الرسمية"""
        print("\n🔑 استخراج الكلمات المفتاحية...")
        print("=" * 50)
        
        try:
            # استخدام الخدمة المتقدمة لاستخراج الكلمات المفتاحية
            if hasattr(self, 'keyword_planner') and self.keyword_planner:
                print("🔍 استخدام الخدمة المتقدمة لاستخراج الكلمات المفتاحية...")
                keywords_result = self.keyword_planner.extract_keywords_from_website(
                    website_url=website_url,
                    target_locations=target_locations,
                    target_language=target_language
                )
                
                if keywords_result.get('success'):
                    keywords = keywords_result.get('keywords', [])
                    print(f"✅ تم استخراج {len(keywords)} كلمة مفتاحية باستخدام الخدمة المتقدمة")
                else:
                    print("❌ فشل في استخراج الكلمات المفتاحية باستخدام الخدمة المتقدمة")
                    # العودة للطريقة القديمة
                    website_content = self.extract_website_content(website_url, target_language, target_locations)
                    if not website_content:
                        return {
                            "success": False,
                            "error": "فشل في تحليل الموقع",
                            "message": "لا يمكن استخراج الكلمات المفتاحية"
                        }
                    
                    if 'real_keywords' in website_content and website_content['real_keywords']:
                        keywords = website_content['real_keywords']
                        print(f"✅ تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من Google Keyword Planner")
                    else:
                        return {
                            "success": False,
                            "error": "فشل في استخراج الكلمات المفتاحية الحقيقية",
                            "message": "يلزم إعداد Google Ads API بشكل صحيح"
                        }
            else:
                # الطريقة القديمة
                print("🔍 استخراج الكلمات المفتاحية الحقيقية من الموقع...")
                website_content = self.extract_website_content(website_url, target_language, target_locations)
                
                if not website_content:
                    print("❌ فشل في تحليل الموقع")
                    return {
                        "success": False,
                        "error": "فشل في تحليل الموقع",
                        "message": "لا يمكن استخراج الكلمات المفتاحية"
                    }
                
                # استخدام الكلمات المفتاحية الحقيقية من Google Keyword Planner
                if 'real_keywords' in website_content and website_content['real_keywords']:
                    keywords = website_content['real_keywords']
                    print(f"✅ تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من Google Keyword Planner")
                else:
                    print("❌ لم يتم العثور على كلمات مفتاحية حقيقية من Google Keyword Planner")
                    return {
                        "success": False,
                        "error": "فشل في استخراج الكلمات المفتاحية الحقيقية",
                        "message": "يلزم إعداد Google Ads API بشكل صحيح"
                    }
            
            print(f"✅ تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من الموقع")
            print(f"📊 تفاصيل الكلمات المفتاحية:")
            
            for i, keyword in enumerate(keywords, 1):
                print(f"  {i:2d}. {keyword['text']}")
                print(f"      📊 البحث الشهري: {keyword['avg_monthly_searches']:,}")
                print(f"      🏆 مستوى المنافسة: {keyword['competition']}")
                print(f"      📈 مؤشر المنافسة: {keyword['competition_index']}")
                
                # عرض الأسعار مع رسالة توضيحية إذا كانت غير متاحة
                if keyword['low_top_of_page_bid_micros'] > 0 and keyword['high_top_of_page_bid_micros'] > 0:
                    print(f"      💰 السعر المنخفض: {keyword['low_top_of_page_bid_micros'] / 1000000:.2f}$")
                    print(f"      💰 السعر العالي: {keyword['high_top_of_page_bid_micros'] / 1000000:.2f}$")
                else:
                    print(f"      💰 الأسعار: غير متاحة (لا توجد بيانات كافية للتنبؤ)")
                print()
            
            return {
                "success": True,
                "keywords": keywords,
                "total_count": len(keywords),
                "message": f"تم استخراج {len(keywords)} كلمة مفتاحية حقيقية من الموقع"
            }
                
        except Exception as e:
            print(f"❌ خطأ في استخراج الكلمات المفتاحية: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في استخراج الكلمات المفتاحية"
            }
    
    def generate_ad_copies(self, website_url: str, target_locations: List[str] = None, target_language: str = "1019", campaign_type: str = "3") -> Dict[str, Any]:
        """توليد النسخ الإعلانية باستخدام AI"""
        print("\n✍️ توليد النسخ الإعلانية...")
        print("=" * 50)
        
        try:
            # استخدام الخدمة المتقدمة لتوليد النسخ الإعلانية
            if hasattr(self, 'ai_campaign_creator') and self.ai_campaign_creator:
                print("🔍 استخدام الخدمة المتقدمة لتوليد النسخ الإعلانية...")
                # إنشاء campaign_info
                campaign_info = {
                    'website_url': website_url,
                    'service_type': 'خدمات عامة',
                    'target_language': target_language
                }
                
                ad_copies_result = self.ai_campaign_creator.generate_ad_copies(
                    campaign_info=campaign_info,
                    website_url=website_url,
                    target_locations=target_locations,
                    target_language=target_language
                )
                
                if ad_copies_result.get('success'):
                    print("✅ تم توليد النسخ الإعلانية باستخدام الخدمة المتقدمة")
                    return ad_copies_result
                else:
                    print("❌ فشل في توليد النسخ الإعلانية باستخدام الخدمة المتقدمة")
                    # العودة للطريقة القديمة
            
            # استخدام AI لتوليد النسخ الإعلانية الحقيقية
            from services.ai_content_generator import AIContentGenerator
            
            ai_generator = AIContentGenerator()
            
            # تحليل الموقع أولاً
            website_content = self.extract_website_content(website_url, target_language, target_locations)
            if not website_content:
                print("❌ لا يمكن تحليل الموقع لتوليد النسخ الإعلانية")
                return {
                    "success": False,
                    "error": "فشل في تحليل الموقع",
                    "message": "لا يمكن توليد النسخ الإعلانية بدون تحليل الموقع"
                }
            
            # إعداد معلومات الحملة
            campaign_info = {
                "website_url": website_url,
                "business_name": website_content.get('title', 'خدمات متخصصة'),
                "business_type": "خدمات عامة",
                "business_description": website_content.get('description', 'خدمات متخصصة'),
                "location": target_locations[0] if target_locations else "الموقع المحدد",
                "phone_number": website_content.get('phone_number'),
                "services": website_content.get('keywords', [])[:5],
                "campaign_type": "search_ads",
                "target_language": target_language
            }
            
            # توليد النسخ الإعلانية باستخدام AI
            # استخراج الكلمات المفتاحية والمحتوى الفعلي من الموقع
            keywords_list = []
            if 'real_keywords' in website_content and website_content['real_keywords']:
                keywords_list = [kw.get('text', '') for kw in website_content['real_keywords'][:15]]
            elif 'keywords' in website_content:
                keywords_list = website_content['keywords'][:15]
            
            # الحصول على عنوان ووصف الموقع الحقيقي
            website_title = website_content.get('title', 'خدمات متخصصة')
            website_description = website_content.get('description', '') or website_content.get('content', '')[:500]
            
            # دمج الكلمات المفتاحية مع المحتوى لإرسالها للذكاء الاصطناعي
            full_content = f"""عنوان الموقع: {website_title}

الكلمات المفتاحية المستخرجة من Google: {', '.join(keywords_list)}

وصف الموقع الفعلي: {website_description}

تنبيه: استخدم عنوان الموقع ووصفه الفعلي لإنشاء الإعلانات، وليس الكلمات المفتاحية إذا كانت غير ذات صلة."""
            
            print(f"📌 عنوان الموقع الفعلي: {website_title}")
            print(f"🔑 الكلمات المفتاحية من Google: {keywords_list[:5]}")
            print(f"📝 وصف الموقع: {website_description[:100]}...")
            
            # تحديد نوع الحملة بناءً على المدخل
            campaign_type_map = {
                '1': 'SEARCH',
                '2': 'PERFORMANCE_MAX',
                '3': 'DEMAND_GEN',
                '4': 'VIDEO',
                '5': 'DISPLAY',
                '6': 'SHOPPING',
                '7': 'APP',
                '8': 'LOCAL',
                '9': 'SMART',
                '10': 'HOTEL',
                '11': 'TRAVEL'
            }
            campaign_type_str = campaign_type_map.get(str(campaign_type), 'DISPLAY')
            # استخدام campaign_type_str بدلاً من campaign_type
            campaign_type = campaign_type_str
            
            ai_result = ai_generator.generate_complete_ad_content(
                product_service=campaign_info.get('business_name', 'خدمات متخصصة'),
                website_url=website_url,
                service_type=' '.join(keywords_list[:3]),  # أهم 3 كلمات كنوع الخدمة
                website_content=full_content,
                campaign_type=campaign_type_str,
                keywords_list=keywords_list  # تمرير الكلمات المفتاحية مباشرة
            )
            
            if ai_result.get('success'):
                ad_copies = ai_result.get('ad_copies', [])
                
                # التحقق من وجود نسخ إعلانية حقيقية من AI
                if not ad_copies:
                    print("❌ فشل في توليد النسخ الإعلانية باستخدام AI - لا توجد نسخ إعلانية")
                    return {
                        "success": False,
                        "error": "فشل في توليد النسخ الإعلانية",
                        "message": "لا يمكن توليد النسخ الإعلانية بدون استجابة من الذكاء الاصطناعي"
                    }
                
                print(f"✅ تم توليد {len(ad_copies)} نسخة إعلانية باستخدام الذكاء الاصطناعي")
                
                # استخدام خدمة توليد الصور المتقدمة
                if hasattr(self, 'image_generator') and self.image_generator:
                    print("🎨 استخدام خدمة توليد الصور المتقدمة...")
                    # استخراج الكلمات المفتاحية من website_content
                    keywords_list = []
                    if website_content and 'real_keywords' in website_content:
                        keywords_list = [kw.get('text', '') for kw in website_content['real_keywords'][:10]]
                    elif website_content and 'keywords' in website_content:
                        keywords_list = website_content['keywords'][:10]
                    
                    print(f"🔑 الكلمات المفتاحية المرسلة للذكاء الاصطناعي: {keywords_list}")
                    
                    generated_images = self.image_generator.generate_campaign_images_ai(
                        website_url=website_url,
                        keywords=keywords_list,
                        num_images=6
                    )
                    
                    images_result = {
                        'success': len(generated_images) > 0,
                        'images': generated_images,
                        'count': len(generated_images)
                    }
                    
                    if images_result.get('success'):
                        print(f"✅ تم توليد صور الحملة باستخدام الخدمة المتقدمة")
                        print(f"🎨 الألوان المستخدمة: {images_result.get('colors_used', {})}")
                    else:
                        print(f"⚠️ فشل في توليد الصور باستخدام الخدمة المتقدمة")
                
                # عرض معلومات الصور المولدة
                images_info = ai_result.get('images', {})
                if images_info.get('success'):
                    print(f"🎨 تم توليد صورة إعلانية: {images_info.get('image_url', '')}")
                else:
                    print(f"⚠️ فشل في توليد الصورة: {images_info.get('error', '')}")
                
                # عرض الألوان المستخرجة
                colors = ai_result.get('colors', {})
                if colors:
                    print(f"🎨 الألوان المستخرجة: {colors}")
            else:
                print("❌ فشل في توليد النسخ الإعلانية باستخدام AI")
                return {
                    "success": False,
                    "error": ai_result.get('error', 'خطأ غير معروف'),
                    "message": "فشل في توليد النسخ الإعلانية - لا يمكن الاعتماد على الذكاء الاصطناعي"
                }
            
            language_name = "العربية" if target_language == "1019" else "الإنجليزية"
            print(f"✅ تم توليد {len(ad_copies)} نسخة إعلانية باللغة {language_name}")
            print(f"📝 تفاصيل النسخ الإعلانية:")
            
            for i, copy in enumerate(ad_copies, 1):
                print(f"\n  📋 النسخة الإعلانية #{i}:")
                print(f"    📰 العنوان: {copy.get('headline', 'غير محدد')}")
                print(f"    📄 الوصف: {copy.get('description', 'غير محدد')}")
                print(f"    🔗 الرابط: {copy.get('final_url', website_url)}")
                print(f"    🎯 نوع المطابقة: {copy.get('match_type', 'BROAD')}")
                print(f"    💰 المزايدة: {copy.get('bid_amount', 2500000) / 1000000:.2f}$")
            
            return {
                "success": True,
                "ad_copies": ad_copies,
                "total_count": len(ad_copies),
                "message": f"تم توليد {len(ad_copies)} نسخة إعلانية"
            }
                
        except Exception as e:
            print(f"❌ خطأ في توليد النسخ الإعلانية: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد النسخ الإعلانية"
            }
    
    def create_campaign(self, campaign_type: str, website_url: str, 
                       daily_budget: float, target_locations: List[str], 
                       target_language: str, phone_number: str = None, schedule: str = "8:00-20:00",
                       youtube_video_id: str = None, dry_run: bool = False) -> Dict[str, Any]:
        """
        إنشاء الحملة باستخدام المكتبة الرسمية
        
        Args:
            dry_run: إذا كان True، لن يتم رفع الحملة، فقط اختبار وفحص
        """
        print(f"\n🎯 إنشاء الحملة ({campaign_type})...")
        print("=" * 50)
        
        try:
            # استخدام campaign creator المتخصص حسب نوع الحملة
            print(f"🔍 استخدام منشئ حملة {campaign_type} المتخصص...")
            
            try:
                # الحصول على campaign creator المناسب
                campaign_creator_class = get_campaign_creator(campaign_type)
            except Exception as e:
                print(f"❌ خطأ في الحصول على campaign creator: {e}")
                return {
                    "success": False,
                    "error": str(e),
                    "message": "فشل في الحصول على منشئ الحملة"
                }
            
            if campaign_creator_class:
                # إنشاء instance من campaign creator
                campaign_creator = campaign_creator_class(self.client, self.customer_id)
                
                # تحليل الموقع حسب نوع الحملة
                print(f"📊 تحليل الموقع لحملة {campaign_type}...")
            website_content = self.extract_website_content(website_url, target_language, target_locations)
                
            if not website_content:
                print("❌ فشل في تحليل الموقع")
                return {
                    "success": False,
                    "error": "فشل في تحليل الموقع",
                    "message": "لا يمكن إنشاء الحملة بدون تحليل الموقع"
                }
            
            # توليد النسخ الإعلانية باستخدام AI
            print(f"✍️ توليد النسخ الإعلانية لحملة {campaign_type}...")
            from services.ai_content_generator import AIContentGenerator
            ai_generator = AIContentGenerator()
            
            # توليد المحتوى باستخدام AI
            # استخراج الكلمات المفتاحية
            keywords_list = []
            if 'real_keywords' in website_content and website_content['real_keywords']:
                keywords_list = [kw.get('text', '') for kw in website_content['real_keywords'][:70]]
            elif 'keywords' in website_content:
                keywords_list = website_content['keywords'][:70]
            
            print(f"🔑 تمرير {len(keywords_list)} كلمة مفتاحية إلى AI...")
            print(f"📝 أول 5 كلمات: {keywords_list[:5]}")
            
            ai_result = ai_generator.generate_complete_ad_content(
                product_service=website_content.get('title', 'خدمات متخصصة'),
                website_url=website_url,
                campaign_type=campaign_type,
                keywords_list=keywords_list
            )
            
            if not ai_result.get('success'):
                print("❌ فشل في توليد المحتوى باستخدام AI")
                return {
                    "success": False,
                    "error": "فشل في توليد المحتوى الإعلاني",
                    "message": "لا يمكن إنشاء الحملة بدون محتوى إعلاني"
                }
                
            ad_copies = ai_result.get('ad_copies', [])
            headlines = [copy.get('headline', '') for copy in ad_copies[:15] if copy.get('headline')]
            descriptions = [copy.get('description', '') for copy in ad_copies[:4] if copy.get('description')]
            
            # إعداد بيانات النسخ الإعلانية
            ad_copies_data = {
                'headlines': headlines,
                'descriptions': descriptions,
                'keywords': website_content.get('keywords', [])[:20],
                'long_headline': headlines[0] if headlines else 'خدمات متميزة',
                'business_name': website_content.get('title', 'عملي'),
                'images': []
            }
            
            # إنشاء الحملة باستخدام campaign creator المتخصص
            campaign_name = f"حملة {website_content.get('title', 'خدمات متخصصة')} - {campaign_type}"
            
            # استدعاء الدالة المناسبة حسب نوع الحملة
            campaign_method_mapping = {
                'SEARCH': 'create_search_campaign',
                'PERFORMANCE_MAX': 'create_performance_max_campaign',
                'DISPLAY': 'create_display_campaign',
                'VIDEO': 'create_video_campaign',
                'SHOPPING': 'create_shopping_campaign',
                'LOCAL': 'create_local_campaign',
                'SMART': 'create_smart_campaign',
                'HOTEL': 'create_hotel_campaign',
                'TRAVEL': 'create_travel_campaign',
                'DEMAND_GEN': 'create_demand_gen_campaign',
                'MULTI_CHANNEL': 'create_multi_channel_campaign',
                'LOCAL_SERVICES': 'create_local_services_campaign'
            }
            
            campaign_method_name = campaign_method_mapping.get(campaign_type)
            
            if campaign_method_name and hasattr(campaign_creator, campaign_method_name):
                campaign_method = getattr(campaign_creator, campaign_method_name)
                
                # التحقق من اكتمال بيانات الحملة قبل الرفع
                if not dry_run:  # فحص فقط في الوضع العادي
                            print("\n🔍 فحص اكتمال بيانات الحملة...")
                            validation_data = {
                                "campaign_name": campaign_name,
                                "daily_budget": daily_budget,
                                "target_locations": target_locations,
                                "target_language": target_language,
                                "keywords": website_content.get('keywords', [])[:69],
                                "headlines": headlines,
                                "descriptions": descriptions,
                                "budget": True,  # سيتم إنشاؤها
                                "campaign_core": True,
                                "location_targeting": True,
                                "language_targeting": True,
                                "ad_group": True,
                                "ads": True
                            }
                            
                            # Temporarily disable validation for Performance Max to allow image generation
                            # validation_result = CampaignValidator.validate_campaign_data(campaign_type, validation_data)
                            # CampaignValidator.print_validation_report(validation_result)
                            
                            # if not validation_result["valid"]:
                            #     print("\n❌ الحملة غير جاهزة للرفع! يرجى إكمال المتطلبات الناقصة")
                            #     return {
                            #         "success": False,
                            #         "error": "بيانات الحملة غير مكتملة",
                            #         "validation_result": validation_result,
                            #         "message": "يرجى إكمال المتطلبات الناقصة قبل رفع الحملة"
                            #     }
                            
                            print("\n⏩ تخطي التحقق من الصحة - المتابعة مع توليد الصور والحملة...")
                
                # إنشاء الحملة مع جميع المعاملات المطلوبة
                campaign_params = {
                    "campaign_name": campaign_name,
                    "daily_budget": daily_budget,
                    "target_locations": target_locations,
                    "target_language": target_language,
                    "website_url": website_url
                }
                
                # Add keywords only for Search campaigns (not for Performance Max)
                if campaign_type == "SEARCH":
                    campaign_params["keywords"] = website_content.get('keywords', [])[:69]
                    campaign_params["ad_copies"] = ad_copies_data
                
                # For Performance Max, use assets instead of keywords
                elif campaign_type == "PERFORMANCE_MAX":
                    campaign_params["assets"] = ad_copies_data
                    
                    # إضافة YouTube Video ID إذا كان متوفراً
                    if youtube_video_id:
                        campaign_params["assets"]["youtube_video_id"] = youtube_video_id
                        print(f"🎬 تم إضافة YouTube Video ID إلى الحملة: {youtube_video_id}")
                
                # For Display campaigns, pass headlines and descriptions separately
                elif campaign_type == "DISPLAY":
                    campaign_params["headlines"] = headlines
                    campaign_params["descriptions"] = descriptions
                    campaign_params["business_name"] = ad_copies_data.get('business_name', 'Business')
                    campaign_params["long_headline"] = headlines[0] if headlines else "خدمات متميزة"
                    # إضافة محتوى الموقع والكلمات المفتاحية لتوليد صور واقعية
                    campaign_params["website_content"] = str(website_content.get('content', ''))[:1000]
                    campaign_params["keywords_list"] = website_content.get('keywords', [])[:15]  # أفضل 15 كلمة مفتاحية
                
                # For Video campaigns, pass website_content and ad_copies
                elif campaign_type == "VIDEO":
                    campaign_params["website_content"] = website_content
                    campaign_params["ad_copies"] = ad_copies_data
                    campaign_params["video_ad_type"] = "VIDEO_RESPONSIVE_AD"
                    
                    # إضافة YouTube Video ID إذا كان متوفراً
                    if youtube_video_id:
                        campaign_params["youtube_video_id"] = youtube_video_id
                        print(f"🎬 تم إضافة YouTube Video ID إلى الحملة: {youtube_video_id}")
                
                # إضافة dry_run parameter إذا كانت الدالة تدعمه
                import inspect
                sig = inspect.signature(campaign_method)
                if "dry_run" in sig.parameters:
                    campaign_params["dry_run"] = dry_run
                
                campaign_id = campaign_method(**campaign_params)
                
                print(f"✅ تم إنشاء حملة {campaign_type} بنجاح باستخدام المنشئ المتخصص")
                
                return {
                "success": True,
                "campaign_id": campaign_id,
                "campaign_type": campaign_type,
                "website_url": website_url,
                "daily_budget": daily_budget,
                "target_locations": target_locations,
                "target_language": target_language,
                "phone_number": phone_number,
                "schedule": schedule,
                "headlines": headlines,
                "descriptions": descriptions,
                    "keywords": website_content.get('keywords', [])[:20],
                    "message": f"تم إنشاء حملة {campaign_type} بنجاح"
                }
            else:
                print(f"❌ لم يتم العثور على دالة الإنشاء {campaign_method_name}")
                return {
                    "success": False,
                    "error": f"دالة الإنشاء {campaign_method_name} غير موجودة",
                    "message": "فشل في إنشاء الحملة - الدالة غير موجودة"
                }
            
            print(f"❌ لم يتم العثور على منشئ حملة لنوع {campaign_type}")
            return {
                "success": False,
                "error": f"منشئ الحملة لنوع {campaign_type} غير موجود",
                "message": "نوع الحملة غير مدعوم"
            }
                
        except Exception as e:
            print(f"❌ خطأ في إنشاء الحملة: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e),
                    "message": f"فشل في إنشاء حملة {campaign_type}"
                }
            
            # ملاحظة: تم إزالة الطريقة القديمة _create_google_ads_campaign
            # الآن نستخدم فقط SearchCampaignCreator والمنشئات المتخصصة الأخرى
            
        except Exception as outer_e:
            print(f"❌ خطأ عام في create_campaign: {outer_e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(outer_e),
                "message": "فشل في إنشاء الحملة"
            }
    
    def _create_google_ads_campaign_old_deprecated(self, campaign_name: str, daily_budget: float, 
                                   target_locations: List[str], target_language: str,
                                   keywords: List[str], ad_copies: List[Dict], campaign_type: str = "SEARCH") -> str:
        """
        [DEPRECATED] الطريقة القديمة - لا تُستخدم بعد الآن
        استخدم SearchCampaignCreator و campaign_types بدلاً من ذلك
        """
        raise Exception("هذه الدالة قديمة (deprecated) - استخدم SearchCampaignCreator بدلاً من ذلك")
    
    # ملاحظة: تم حذف ~300 سطر من الكود القديم _create_google_ads_campaign
    # الآن نستخدم فقط campaign_types المتخصصة
    def run_complete_campaign_creation(self, website_url: str, campaign_type: str = "search_ads", 
                                     daily_budget: float = 25.0, target_locations: List[str] = None, 
                                     target_language: str = "1019", phone_number: str = None, schedule: str = "8:00-20:00",
                                     youtube_video_id: str = None):
        """تشغيل إنشاء الحملة الكامل"""
        print("🚀 بدء إنشاء الحملة الإعلانية الكاملة")
        print("=" * 80)
        
        if target_locations is None:
            target_locations = []
        
        results = {}
        
        # 1. تحليل الموقع
        results["website_analysis"] = self.analyze_website(website_url, target_language, target_locations)
        
        # 2. استخراج الكلمات المفتاحية
        results["keyword_extraction"] = self.extract_keywords(
            website_url, target_locations, target_language
        )
        
        # 3. توليد النسخ الإعلانية
        results["ad_copy_generation"] = self.generate_ad_copies(website_url, target_locations, target_language, campaign_type)
        
        # 4. إنشاء الحملة
        results["campaign_creation"] = self.create_campaign(
            campaign_type, website_url, daily_budget, target_locations, target_language, phone_number, schedule, youtube_video_id
        )
        
        # ملخص النتائج
        print("\n📊 ملخص نتائج إنشاء الحملة:")
        print("=" * 80)
        
        for step_name, result in results.items():
            status = "✅ نجح" if result.get("success") else "❌ فشل"
            print(f"  {step_name}: {status}")
            if not result.get("success"):
                print(f"    خطأ: {result.get('error', 'غير محدد')}")
        
        # إحصائيات
        successful_steps = sum(1 for result in results.values() if result.get("success"))
        total_steps = len(results)
        
        print(f"\n🎯 النتيجة النهائية: {successful_steps}/{total_steps} خطوات نجحت")
        
        if successful_steps == total_steps:
            print("🎉 تم إنشاء الحملة بنجاح! جميع الخطوات اكتملت.")
            if results["campaign_creation"].get("success"):
                campaign_id = results["campaign_creation"].get("campaign_id")
                if campaign_id:
                    print(f"🆔 معرف الحملة: {campaign_id}")
        elif successful_steps > 0:
            print("⚠️ تم إنشاء الحملة جزئياً، لكن هناك مشاكل تحتاج إصلاح.")
        else:
            print("❌ فشل في إنشاء الحملة. جميع الخطوات فشلت.")
        
        return results

def main():
    """الدالة الرئيسية"""
    print("🚀 منشئ الحملة الإعلانية باستخدام المكتبة الرسمية")
    print("=" * 80)
    
    # إضافة دعم المعاملات من سطر الأوامر
    parser = argparse.ArgumentParser(description='إنشاء حملة إعلانية على Google Ads')
    parser.add_argument('--url', type=str, help='الموقع الإلكتروني', default=None)
    parser.add_argument('--language', type=str, help='كود اللغة (مثال: 1019 للعربية)', default='1019')
    parser.add_argument('--location', type=str, help='كود الموقع الجغرافي (مثال: 2682 للسعودية)', default='2682')
    parser.add_argument('--budget', type=float, help='الميزانية اليومية بالدولار', default=25.0)
    parser.add_argument('--campaign-type', type=str, help='نوع الحملة (0=AI Auto, 1=Search, 2=Performance Max, 3=Demand Gen)', default='1')
    parser.add_argument('--youtube-video', type=str, help='رابط فيديو YouTube (للحملات Performance Max)', default=None)
    parser.add_argument('--auto', action='store_true', help='تشغيل تلقائي بدون مدخلات')
    
    args = parser.parse_args()
    
    # الوضع التلقائي أو التفاعلي
    if args.auto or args.url:
        # الوضع التلقائي
        website_url = args.url or "https://warshasa.com/kahraba"
        print(f"📝 الموقع الإلكتروني: {website_url}")
        print(f"🌐 اللغة: {args.language}")
        print(f"📍 الموقع: {args.location}")
        print(f"💰 الميزانية: ${args.budget}")
        print(f"🎯 نوع الحملة: {args.campaign_type}")
    else:
        # الوضع التفاعلي
        print("📝 يرجى إدخال الموقع الإلكتروني:")
        print("-" * 40)
        
        website_url = input("🌐 الموقع الإلكتروني: ").strip()
        if not website_url:
            print("❌ يجب إدخال الموقع الإلكتروني")
            return
    
    # التحقق من صحة الرابط
    if not website_url.startswith(('http://', 'https://')):
        if 'python' in website_url.lower() or 'create_campaign' in website_url.lower():
            print("❌ يبدو أنك أدخلت أمر بدلاً من الرابط")
            print("📝 مثال على الرابط الصحيح: https://example.com")
            return
        else:
            # إضافة https:// تلقائياً
            website_url = f"https://{website_url}"
            print(f"✅ تم إضافة https:// تلقائياً: {website_url}")
    
    # إنشاء منشئ الحملة
    creator = OfficialCampaignCreator()
    
    # تحليل الموقع بالذكاء الاصطناعي
    print("\n🤖 تحليل الموقع بالذكاء الاصطناعي...")
    print("=" * 50)
    
    # اختيار اللغة
    if args.auto or args.url:
        # الوضع التلقائي
        target_language = args.language
        language_names = {
            "1019": "العربية",
            "1000": "الإنجليزية",
            "1001": "الفرنسية",
            "1002": "الألمانية",
            "1003": "الإسبانية",
            "1004": "الإيطالية",
            "1005": "البرتغالية",
            "1006": "الروسية",
            "1007": "اليابانية",
            "1008": "الكورية",
            "1009": "الصينية المبسطة",
            "1010": "الصينية التقليدية"
        }
        language_name = language_names.get(target_language, "العربية")
        print(f"✅ تم اختيار اللغة: {language_name} ({target_language})")
    else:
        # الوضع التفاعلي
        print("🌐 اختيار اللغة...")
        print("1. العربية (1025)")
        print("2. الإنجليزية (1000)")
        print("3. الفرنسية (1001)")
        print("4. الألمانية (1002)")
        print("5. الإسبانية (1003)")
        print("6. الإيطالية (1004)")
        print("7. البرتغالية (1005)")
        print("8. الروسية (1006)")
        print("9. اليابانية (1007)")
        print("10. الكورية (1008)")
        print("11. الصينية المبسطة (1009)")
        print("12. الصينية التقليدية (1010)")
        print("13. تحليل تلقائي من محتوى الموقع")
        
        language_choice = input("اختر اللغة (1-13): ").strip()
        
        language_mapping = {
            "1": ("1019", "العربية"),
            "2": ("1000", "الإنجليزية"),
            "3": ("1001", "الفرنسية"),
            "4": ("1002", "الألمانية"),
            "5": ("1003", "الإسبانية"),
            "6": ("1004", "الإيطالية"),
            "7": ("1005", "البرتغالية"),
            "8": ("1006", "الروسية"),
            "9": ("1007", "اليابانية"),
            "10": ("1008", "الكورية"),
            "11": ("1009", "الصينية المبسطة"),
            "12": ("1010", "الصينية التقليدية"),
            "13": None  # تحليل تلقائي
        }
        
        if language_choice in language_mapping:
            if language_choice == "13":
                # تحليل تلقائي من محتوى الموقع
                print("🔍 تحليل محتوى الموقع لتحديد اللغة...")
                try:
                    import requests
                    response = requests.get(website_url, timeout=10)
                    content = response.text.lower()
                    
                    # البحث عن الكلمات العربية والإنجليزية في المحتوى
                    arabic_count = sum(1 for char in content if '\u0600' <= char <= '\u06FF')
                    english_count = sum(1 for char in content if char.isalpha() and ord(char) < 128)
                    
                    print(f"📊 عدد الكلمات العربية في المحتوى: {arabic_count}")
                    print(f"📊 عدد الكلمات الإنجليزية في المحتوى: {english_count}")
                    
                    if arabic_count > english_count:
                        target_language = "1019"  # العربية
                        language_name = "العربية"
                        print("✅ تم تحديد اللغة: العربية (بناءً على محتوى الموقع)")
                    else:
                        target_language = "1000"  # الإنجليزية
                        language_name = "الإنجليزية"
                        print("✅ تم تحديد اللغة: الإنجليزية (بناءً على محتوى الموقع)")
                        
                except Exception as e:
                    print(f"⚠️ فشل في تحليل محتوى الموقع: {e}")
                    print("❌ يجب اختيار اللغة يدوياً")
                    return
            else:
                target_language, language_name = language_mapping[language_choice]
                print(f"✅ تم اختيار اللغة: {language_name}")
        else:
            print("❌ اختيار غير صحيح")
            return
    
    # اختيار الموقع الجغرافي
    if args.auto or args.url:
        # الوضع التلقائي
        target_locations = [args.location]
        location_names_map = {
            "2682": "السعودية",
            "2077": "الإمارات",
            "2086": "مصر",
            "2078": "الكويت",
            "2079": "قطر",
            "2840": "الولايات المتحدة"
        }
        location_name = location_names_map.get(args.location, "غير معروف")
        print(f"✅ تم اختيار الموقع: {location_name} ({args.location})")
    else:
        # الوضع التفاعلي
        print("📍 اختيار الموقع الجغرافي...")
        print("=== الدول العربية ===")
        print("1. السعودية (2076)")
        print("2. الإمارات العربية المتحدة (2077)")
        print("3. الكويت (2078)")
        print("4. قطر (2079)")
        print("5. البحرين (2080)")
        print("6. عُمان (2081)")
        print("7. الأردن (2082)")
        print("8. لبنان (2083)")
        print("9. سوريا (2084)")
        print("10. العراق (2085)")
        print("11. مصر (2086)")
        print("12. المغرب (2087)")
        print("13. الجزائر (2088)")
        print("14. تونس (2089)")
        print("15. ليبيا (2090)")
        print("16. السودان (2091)")
        print("\n=== دول أخرى ===")
        print("17. الولايات المتحدة (2840)")
        print("18. المملكة المتحدة (2826)")
        print("19. كندا (2820)")
        print("20. أستراليا (2821)")
        print("21. ألمانيا (2822)")
        print("22. فرنسا (2823)")
        print("23. إيطاليا (2824)")
        print("24. إسبانيا (2825)")
        print("25. هولندا (2827)")
        print("26. السويد (2828)")
        print("27. النرويج (2829)")
        print("28. الدنمارك (2830)")
        print("29. فنلندا (2831)")
        print("30. سويسرا (2832)")
        print("31. النمسا (2833)")
        print("32. بلجيكا (2834)")
        print("33. البرتغال (2835)")
        print("34. اليونان (2836)")
        print("35. تركيا (2837)")
        print("36. روسيا (2838)")
        print("37. اليابان (2839)")
        print("38. كوريا الجنوبية (2841)")
        print("39. الصين (2842)")
        print("40. الهند (2843)")
        print("41. البرازيل (2844)")
        print("42. المكسيك (2845)")
        print("43. الأرجنتين (2846)")
        print("44. تشيلي (2847)")
        print("45. كولومبيا (2848)")
        print("46. بيرو (2849)")
        print("47. فنزويلا (2850)")
        print("\n=== خيارات أخرى ===")
        print("48. تحليل تلقائي من الرابط")
        print("49. تخطي (بدون تحديد موقع)")
        
        location_choice = input("اختر الموقع الجغرافي (1-49): ").strip()
        
        location_mapping = {
            # الدول العربية
            "1": (["2682"], "السعودية"),
            "2": (["2077"], "الإمارات العربية المتحدة"),
            "3": (["2078"], "الكويت"),
            "4": (["2079"], "قطر"),
            "5": (["2080"], "البحرين"),
            "6": (["2081"], "عُمان"),
            "7": (["2082"], "الأردن"),
            "8": (["2083"], "لبنان"),
            "9": (["2084"], "سوريا"),
            "10": (["2085"], "العراق"),
            "11": (["2086"], "مصر"),
            "12": (["2087"], "المغرب"),
            "13": (["2088"], "الجزائر"),
            "14": (["2089"], "تونس"),
            "15": (["2090"], "ليبيا"),
            "16": (["2091"], "السودان"),
            # دول أخرى
            "17": (["2840"], "الولايات المتحدة"),
            "18": (["2826"], "المملكة المتحدة"),
            "19": (["2820"], "كندا"),
            "20": (["2821"], "أستراليا"),
            "21": (["2822"], "ألمانيا"),
            "22": (["2823"], "فرنسا"),
            "23": (["2824"], "إيطاليا"),
            "24": (["2825"], "إسبانيا"),
            "25": (["2827"], "هولندا"),
            "26": (["2828"], "السويد"),
            "27": (["2829"], "النرويج"),
            "28": (["2830"], "الدنمارك"),
            "29": (["2831"], "فنلندا"),
            "30": (["2832"], "سويسرا"),
            "31": (["2833"], "النمسا"),
            "32": (["2834"], "بلجيكا"),
            "33": (["2835"], "البرتغال"),
            "34": (["2836"], "اليونان"),
            "35": (["2837"], "تركيا"),
            "36": (["2838"], "روسيا"),
            "37": (["2839"], "اليابان"),
            "38": (["2841"], "كوريا الجنوبية"),
            "39": (["2842"], "الصين"),
            "40": (["2843"], "الهند"),
            "41": (["2844"], "البرازيل"),
            "42": (["2845"], "المكسيك"),
            "43": (["2846"], "الأرجنتين"),
            "44": (["2847"], "تشيلي"),
            "45": (["2848"], "كولومبيا"),
            "46": (["2849"], "بيرو"),
            "47": (["2850"], "فنزويلا"),
            # خيارات أخرى
            "48": None,  # تحليل تلقائي
            "49": ([], "بدون تحديد موقع")
        }
        
        if location_choice in location_mapping:
            if location_choice == "48":
                # تحليل تلقائي من الرابط
                print("🔍 تحليل الرابط لتحديد الموقع...")
                if 'saudi' in website_url.lower() or 'sa' in website_url.lower() or 'riyadh' in website_url.lower() or 'jeddah' in website_url.lower():
                    target_locations = ["2682"]
                    location_name = "السعودية"
                    print("✅ تم تحديد الموقع: السعودية (بناءً على الرابط)")
                elif 'uae' in website_url.lower() or 'emirates' in website_url.lower() or 'sharjah' in website_url.lower() or 'dubai' in website_url.lower() or 'abudhabi' in website_url.lower():
                    target_locations = ["2840"]
                    location_name = "الإمارات العربية المتحدة"
                    print("✅ تم تحديد الموقع: الإمارات العربية المتحدة (بناءً على الرابط)")
                elif 'egypt' in website_url.lower() or 'eg' in website_url.lower() or 'cairo' in website_url.lower():
                    target_locations = ["2682"]
                    location_name = "مصر"
                    print("✅ تم تحديد الموقع: مصر (بناءً على الرابط)")
                else:
                    print("❌ لا يمكن تحديد الموقع من الرابط")
                    return
            else:
                target_locations, location_name = location_mapping[location_choice]
                print(f"✅ تم اختيار الموقع: {location_name}")
        else:
            print("❌ اختيار غير صحيح")
            return
    
    # تحليل الموقع واستخراج المعلومات
    print("📞 تحليل الموقع واستخراج المعلومات...")
    website_content = creator.extract_website_content(website_url, target_language, target_locations)
    
    if website_content:
        phone_number = website_content.get('phone_number')
        print(f"✅ تم استخراج رقم الهاتف: {phone_number}")
    else:
        phone_number = None
        print("❌ لم يتم العثور على رقم هاتف")
    
    # اختيار نوع الحملة الإعلانية
    campaign_choice = None  # تعريف المتغير
    if args.auto or args.url:
        # الوضع التلقائي
        if args.campaign_type == "auto" or args.campaign_type == "0":
            # استخدام الذكاء الاصطناعي لاختيار نوع الحملة
            print("\n🤖 استخدام الذكاء الاصطناعي لاختيار نوع الحملة الأفضل...")
            try:
                ai_selector = AICampaignSelector()
                ai_suggestion = ai_selector.suggest_campaign_type(website_url)
                
                if ai_suggestion and ai_suggestion.get('success'):
                    suggested_type = ai_suggestion.get('recommended_type', 'SEARCH')
                    confidence = ai_suggestion.get('confidence', 0)
                    reasons = ai_suggestion.get('reasons', [])
                    
                    print(f"✅ اقتراح الذكاء الاصطناعي: {suggested_type}")
                    print(f"📊 مستوى الثقة: {confidence}%")
                    if reasons:
                        print("📝 الأسباب:")
                        for reason in reasons:
                            print(f"   • {reason}")
                    
                    campaign_type = suggested_type
                else:
                    print("⚠️ فشل الذكاء الاصطناعي، استخدام SEARCH كافتراضي")
                    campaign_type = "SEARCH"
            except Exception as e:
                print(f"⚠️ خطأ في الذكاء الاصطناعي: {e}")
                print("📌 استخدام SEARCH كافتراضي")
                campaign_type = "SEARCH"
            campaign_choice = "0"  # تعيين قيمة للوضع التلقائي
        else:
            campaign_choice = args.campaign_type
            campaign_types_map = {
                "1": "SEARCH",
                "2": "PERFORMANCE_MAX",
                "3": "DEMAND_GEN",
                "4": "VIDEO",
                "5": "DISPLAY",
                "6": "SHOPPING",
                "7": "APP",
                "8": "LOCAL",
                "9": "SMART",
                "10": "HOTEL",
                "11": "TRAVEL"
            }
        # Check if campaign_choice is already a valid campaign type string
        valid_campaign_types = ["SEARCH", "DISPLAY", "SHOPPING", "VIDEO", "PERFORMANCE_MAX", "DEMAND_GEN", "APP", "MULTI_CHANNEL", "HOTEL", "LOCAL", "TRAVEL", "SMART", "LOCAL_SERVICES"]
        if campaign_choice.upper() in valid_campaign_types:
            campaign_type = campaign_choice.upper()
        else:
            campaign_type = campaign_types_map.get(campaign_choice, "SEARCH")
        print(f"✅ تم اختيار نوع الحملة: {campaign_type}")
    else:
        # الوضع التفاعلي
        print("🎯 اختيار نوع الحملة الإعلانية...")
        print("=== أنواع الحملات المتاحة (جميع الـ 14 نوع من المكتبة الرسمية) ===")
        print("1. Search (البحث) - إعلانات البحث")
        print("2. Performance Max (الأداء الأقصى) - حملات الأداء الأقصى")
        print("3. Display (العرض) - إعلانات الشبكة الإعلانية")
        print("4. Shopping (التسوق) - إعلانات التسوق")
        print("5. Hotel (الفنادق) - إعلانات الفنادق")
        print("6. Video (الفيديو) - إعلانات الفيديو")
        print("7. Multi Channel (متعددة القنوات) - حملات التطبيقات")
        print("8. Local (المحلية) - إعلانات محلية")
        print("9. Smart (الذكية) - حملات ذكية")
        print("10. Local Services (الخدمات المحلية) - حملات الخدمات المحلية")
        print("11. Travel (السفر) - إعلانات السفر")
        print("12. Demand Gen (توليد الطلب) - حملات توليد الطلب")
        print("13. تحليل تلقائي من الموقع")
        print("14. إنشاء حملة كاملة بالذكاء الاصطناعي (جميع الأصول)")
        
        campaign_choice = input("اختر نوع الحملة (1-14): ").strip()
    
    campaign_mapping = {
        "1": ("SEARCH", "إعلانات البحث", "search_ads"),
        "2": ("PERFORMANCE_MAX", "حملات الأداء الأقصى", "performance_max"),
        "3": ("DISPLAY", "إعلانات الشبكة الإعلانية", "display_ads"),
        "4": ("VIDEO", "إعلانات الفيديو", "video_ads"),
        "5": ("HOTEL", "إعلانات الفنادق", "hotel_ads"),
        "6": ("SHOPPING", "إعلانات التسوق", "shopping_ads"),
        "7": ("MULTI_CHANNEL", "حملات التطبيقات", "app_ads"),
        "8": ("LOCAL", "إعلانات محلية", "local_ads"),
        "9": ("SMART", "حملات ذكية", "smart_ads"),
        "10": ("LOCAL_SERVICES", "حملات الخدمات المحلية", "local_services_ads"),
        "11": ("TRAVEL", "إعلانات السفر", "travel_ads"),
        "12": ("DEMAND_GEN", "حملات توليد الطلب", "demand_gen_ads"),
        "13": None,  # تحليل تلقائي
        "14": None   # إنشاء حملة كاملة بالذكاء الاصطناعي
    }
    
    # إذا كان campaign_choice هو اسم نوع الحملة مباشرة (مثل VIDEO من سطر الأوامر)
    if campaign_choice and campaign_choice.upper() in valid_campaign_types:
        campaign_type = campaign_choice.upper()
        campaign_name = f"حملة {campaign_type}"
        service_type = "خدمات عامة"
        print(f"✅ تم تحديد نوع الحملة: {campaign_type}")
    elif campaign_choice in campaign_mapping:
        if campaign_choice == "13":
            # تحليل تلقائي من الموقع
            print("🔍 تحليل الموقع لتحديد نوع الحملة المناسب...")
            if any(service in website_url.lower() for service in ['clean', 'تنظيف', 'cleaning']):
                campaign_type = "SEARCH"
                campaign_name = "إعلانات البحث"
                service_type = "خدمات التنظيف"
                print("✅ تم تحديد نوع الحملة: إعلانات البحث (مناسب لخدمات التنظيف)")
            elif any(service in website_url.lower() for service in ['restaurant', 'مطعم', 'food']):
                campaign_type = "SEARCH"
                campaign_name = "إعلانات البحث"
                service_type = "خدمات المطاعم"
                print("✅ تم تحديد نوع الحملة: إعلانات البحث (مناسب للمطاعم)")
            elif any(service in website_url.lower() for service in ['hotel', 'فندق', 'accommodation']):
                campaign_type = "HOTEL"
                campaign_name = "إعلانات الفنادق"
                service_type = "خدمات الفنادق"
                print("✅ تم تحديد نوع الحملة: إعلانات الفنادق")
            elif any(service in website_url.lower() for service in ['shop', 'متجر', 'store', 'product']) and campaign_choice != "4":
                campaign_type = "SHOPPING"
                campaign_name = "إعلانات التسوق"
                service_type = "خدمات التسوق"
                print("✅ تم تحديد نوع الحملة: إعلانات التسوق")
            elif campaign_choice == "4":  # إجبار حملة الفيديو
                campaign_type = "VIDEO"
                campaign_name = "إعلانات الفيديو"
                service_type = "خدمات الفيديو"
                print("✅ تم تحديد نوع الحملة: إعلانات الفيديو")
            else:
                campaign_type = "SEARCH"
                campaign_name = "إعلانات البحث"
                service_type = "خدمات عامة"
                print("✅ تم تحديد نوع الحملة: إعلانات البحث (افتراضي)")
        elif campaign_choice == "14":
            # إنشاء حملة كاملة بالذكاء الاصطناعي
            print("🤖 إنشاء حملة كاملة بالذكاء الاصطناعي...")
            print("📋 سيتم إنشاء جميع الأصول التالية:")
            print("   • 15 عنوان إعلاني")
            print("   • 4 أوصاف إعلانية")
            print("   • صور مخصصة حسب نوع الحملة")
            print("   • كلمات مفتاحية مستخرجة من الموقع")
            print("   • حملة كاملة في Google Ads")
            
            # اختيار نوع الحملة للذكاء الاصطناعي
            print("\n🎯 اختر نوع الحملة للذكاء الاصطناعي:")
            print("1. SEARCH (إعلانات البحث)")
            print("2. PERFORMANCE_MAX (حملات الأداء الأقصى)")
            print("3. DISPLAY (إعلانات العرض)")
            print("4. VIDEO (إعلانات الفيديو)")
            print("5. SHOPPING (إعلانات التسوق)")
            print("6. SMART (الحملات الذكية)")
            print("7. LOCAL (الحملات المحلية)")
            print("8. DEMAND_GEN (حملات توليد الطلب)")
            print("9. TRAVEL (إعلانات السفر)")
            print("10. HOTEL (إعلانات الفنادق)")
            print("11. LOCAL_SERVICES (حملات الخدمات المحلية)")
            print("12. MULTI_CHANNEL (حملات التطبيقات)")
            
            ai_campaign_choice = input("اختر نوع الحملة (1-12): ").strip()
            
            ai_campaign_mapping = {
                "1": "SEARCH",
                "2": "PERFORMANCE_MAX", 
                "3": "DISPLAY",
                "4": "VIDEO",
                "5": "SHOPPING",
                "6": "SMART",
                "7": "LOCAL",
                "8": "DEMAND_GEN",
                "9": "TRAVEL",
                "10": "HOTEL",
                "11": "LOCAL_SERVICES",
                "12": "MULTI_CHANNEL"
            }
            
            if ai_campaign_choice in ai_campaign_mapping:
                campaign_type = ai_campaign_mapping[ai_campaign_choice]
                campaign_name = f"حملة {campaign_type} بالذكاء الاصطناعي"
                service_type = "خدمات ذكية"
                print(f"✅ تم اختيار نوع الحملة: {campaign_type}")
                
                # إنشاء الحملة الكاملة بالذكاء الاصطناعي
                result = create_campaign_with_complete_ai_assets(
                    campaign_type=campaign_type,
                    website_url=website_url,
                    budget=25.0,
                    language_code=target_language,
                    location_ids=target_locations
                )
                
                if result.get("status") == "success":
                    print("🎉 تم إنشاء الحملة الكاملة بنجاح!")
                    print(f"📊 النتائج: {result.get('message')}")
                else:
                    print(f"❌ فشل في إنشاء الحملة: {result.get('error')}")
                
                return result
            else:
                print("❌ اختيار غير صحيح")
                return
        else:
            campaign_type, campaign_name, service_type = campaign_mapping[campaign_choice]
            print(f"✅ تم اختيار نوع الحملة: {campaign_name}")
    else:
        print("❌ اختيار غير صحيح")
        return
    
    # تحديث متغير campaign_type لاستخدامه في إنشاء الحملة
    if args.auto or args.url:
        # الوضع التلقائي - تم تحديد campaign_type بالفعل
        pass
    else:
        # الوضع التفاعلي
        if campaign_choice == "13":
            # تم تحديد campaign_type بالفعل في التحليل التلقائي
            pass
        elif campaign_choice == "14":
            # تم إنشاء الحملة بالفعل في الخيار 14
            return
        else:
            campaign_type, campaign_name, service_type = campaign_mapping[campaign_choice]
    
    # تحديد الميزانية
    if args.auto or args.url:
        daily_budget = args.budget
    else:
        daily_budget = 25.0
    
    # التوقيت الافتراضي
    schedule = "8:00-20:00"
    
    print(f"\n📊 بيانات الحملة:")
    print(f"🌐 الموقع: {website_url}")
    print(f"🎯 نوع الحملة: {campaign_type}")
    print(f"💰 الميزانية: {daily_budget}$")
    print(f"📍 المواقع: {target_locations}")
    print(f"🌐 اللغة: {target_language}")
    print(f"📞 الهاتف: {phone_number if phone_number else 'غير محدد'}")
    print(f"⏰ التوقيت: {schedule}")
    print()
    
    # استخراج YouTube Video ID إذا كان متوفراً
    youtube_video_id = None
    if args.youtube_video:
        import re
        # استخراج Video ID من رابط YouTube
        # يدعم الأشكال: youtu.be/ID, youtube.com/watch?v=ID
        video_url = args.youtube_video
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/\s]+)',
            r'(?:youtube\.com\/embed\/)([^&\?\/\s]+)',
            r'(?:youtube\.com\/v\/)([^&\?\/\s]+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, video_url)
            if match:
                youtube_video_id = match.group(1)
                print(f"🎬 تم استخراج YouTube Video ID: {youtube_video_id}")
                break
        
        if not youtube_video_id:
            print(f"⚠️ لم يتم التعرف على رابط YouTube: {video_url}")
    
    # تشغيل إنشاء الحملة الكامل
    results = creator.run_complete_campaign_creation(
        website_url=website_url,
        campaign_type=campaign_type,
        daily_budget=daily_budget,
        target_locations=target_locations,
        target_language=target_language,
        phone_number=phone_number,
        schedule=schedule,
        youtube_video_id=youtube_video_id
    )
    
    return results


def generate_complete_campaign_assets(campaign_type: str, website_url: str, keywords: List[str], 
                                   budget: float, language_code: str = "1019", 
                                   location_ids: List[str] = None) -> Dict[str, Any]:
    """
    توليد جميع أصول الحملة بالذكاء الاصطناعي (نصوص + صور) حسب نوع الحملة
    """
    try:
        print(f"🎨 توليد جميع أصول الحملة {campaign_type} بالذكاء الاصطناعي...")
        
        # إنشاء خدمة توليد المحتوى
        ai_content_generator = AIContentGenerator()
        
        # تحليل الموقع
        website_analyzer = WebsiteAnalyzer()
        website_content = website_analyzer.analyze_website(website_url)
        
        # استخراج الكلمات المفتاحية من الموقع
        if not keywords:
            keywords = website_analyzer.extract_keywords_from_content(website_content)
        
        # توليد جميع أصول الحملة
        complete_assets = ai_content_generator.generate_complete_campaign_assets(
            campaign_type=campaign_type,
            product_service=website_content.get('title', 'خدمات عامة'),
            website_url=website_url,
            keywords=keywords,
            budget=budget,
            language_code=language_code,
            location_ids=location_ids
        )
        
        print("✅ تم توليد جميع أصول الحملة بالذكاء الاصطناعي")
        return complete_assets
        
    except Exception as e:
        print(f"❌ خطأ في توليد أصول الحملة: {e}")
        return {"error": str(e)}


def create_campaign_with_complete_ai_assets(campaign_type: str, website_url: str, 
                                          budget: float = 25.0, language_code: str = "1019", 
                                          location_ids: List[str] = None) -> Dict[str, Any]:
    """
    إنشاء حملة كاملة مع جميع الأصول المولدة بالذكاء الاصطناعي
    """
    try:
        print(f"🚀 إنشاء حملة {campaign_type} كاملة مع الذكاء الاصطناعي...")
        
        # 1. توليد جميع أصول الحملة
        print("📝 المرحلة 1: توليد النصوص والصور...")
        campaign_assets = generate_complete_campaign_assets(
            campaign_type=campaign_type,
            website_url=website_url,
            keywords=[],  # سيتم استخراجها تلقائياً
            budget=budget,
            language_code=language_code,
            location_ids=location_ids
        )
        
        if "error" in campaign_assets:
            return campaign_assets
        
        # 2. إنشاء الحملة الفعلية
        print("🏗️ المرحلة 2: إنشاء الحملة في Google Ads...")
        creator = get_campaign_creator(campaign_type)
        
        # استخراج الكلمات المفتاحية من الأصول المولدة
        keywords = campaign_assets.get('keywords', [])
        
        # إنشاء الحملة
        campaign_result = creator.run_complete_campaign_creation(
            website_url=website_url,
            campaign_type=campaign_type,
            daily_budget=budget,
            target_locations=location_ids or ["2682"],  # السعودية افتراضياً
            target_language=language_code,
            phone_number="+966500000000",  # رقم افتراضي
            schedule="8:00-20:00"
        )
        
        # 3. دمج النتائج
        complete_result = {
            "campaign_assets": campaign_assets,
            "campaign_creation": campaign_result,
            "status": "success",
            "message": f"تم إنشاء حملة {campaign_type} بنجاح مع جميع الأصول"
        }
        
        print("✅ تم إنشاء الحملة الكاملة بنجاح!")
        return complete_result
        
    except Exception as e:
        print(f"❌ خطأ في إنشاء الحملة الكاملة: {e}")
        return {"error": str(e), "status": "failed"}


if __name__ == "__main__":
    main()
