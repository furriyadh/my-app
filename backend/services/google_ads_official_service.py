#!/usr/bin/env python3
"""
خدمة Google Ads الرسمية - تطبيق كامل للمكتبة الرسمية
Google Ads Official Service - Complete Official Library Implementation

يستخدم:
- Google Ads API v21
- google-ads-python library v28.0.0
- جميع حالات ManagerLinkStatusEnum
- Live Currency Exchange Rates API
"""

import os
import sys
import logging
import uuid
import requests
import json
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

# ===========================================
# نظام أسعار العملات الحية
# ===========================================

class CurrencyExchangeService:
    """خدمة أسعار العملات الحية من APIs عالمية - بدون أي أسعار ثابتة"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.cache = {}
        self.cache_duration = timedelta(hours=1)  # تحديث كل ساعة
        self.last_update = None
        
        # Dual API System - لا أسعار ثابتة في الكود!
        self.primary_api = "https://api.exchangerate-api.com/v4/latest/USD"
        self.fallback_api = "https://api.exchangerate.host/latest?base=USD"
        
        self.logger.info("🌐 تم تهيئة نظام العملات الحي بدون أي أسعار ثابتة")
        self.logger.info(f"   Primary API: exchangerate-api.com")
        self.logger.info(f"   Fallback API: exchangerate.host")
    
    def get_live_rates(self) -> Dict[str, float]:
        """جلب أسعار العملات الحية من APIs - بدون أي أسعار ثابتة"""
        try:
            # التحقق من الـ cache
            if self.cache and self.last_update:
                if datetime.now() - self.last_update < self.cache_duration:
                    self.logger.debug("📦 استخدام أسعار العملات من Cache")
                    return self.cache
            
            # محاولة جلب من Primary API
            self.logger.info("🌐 جلب أسعار العملات الحية من Primary API...")
            try:
                response = requests.get(self.primary_api, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    rates = data.get('rates', {})
                    
                    if rates and len(rates) > 50:  # التأكد من وجود بيانات كافية
                        self.cache = rates
                        self.last_update = datetime.now()
                        self.logger.info(f"✅ تم تحديث أسعار {len(rates)} عملة من Primary API (exchangerate-api.com)")
                        self.logger.debug(f"📊 أمثلة: EGP={rates.get('EGP', 'N/A')}, SAR={rates.get('SAR', 'N/A')}, EUR={rates.get('EUR', 'N/A')}")
                        return rates
            except Exception as primary_error:
                self.logger.warning(f"⚠️ Primary API failed: {primary_error}")
            
            # محاولة جلب من Fallback API
            self.logger.info("🔄 محاولة Fallback API...")
            try:
                response = requests.get(self.fallback_api, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    # exchangerate.host يعيد البيانات في "rates" object
                    rates = data.get('rates', {})
                    
                    if rates and len(rates) > 50:
                        self.cache = rates
                        self.last_update = datetime.now()
                        self.logger.info(f"✅ تم تحديث أسعار {len(rates)} عملة من Fallback API (exchangerate.host)")
                        self.logger.debug(f"📊 أمثلة: EGP={rates.get('EGP', 'N/A')}, SAR={rates.get('SAR', 'N/A')}, EUR={rates.get('EUR', 'N/A')}")
                        return rates
            except Exception as fallback_error:
                self.logger.error(f"❌ Fallback API failed: {fallback_error}")
            
            # إذا فشلت جميع APIs وهناك cache قديم، استخدمه
            if self.cache:
                self.logger.warning("⚠️ جميع APIs فشلت، استخدام آخر cache متوفر (قد يكون قديم)")
                return self.cache
            
            # فشل كل شيء!
            self.logger.error("❌ فشل جلب الأسعار من جميع المصادر!")
            raise Exception("Cannot fetch live currency rates from any API and no cache available")
            
        except Exception as e:
            self.logger.error(f"❌ خطأ حرج في نظام العملات: {e}")
            # محاولة أخيرة من الـ cache
            if self.cache:
                self.logger.warning("⚠️ استخدام cache قديم كحل أخير")
                return self.cache
            raise Exception(f"Currency service failed completely: {e}")
    
    def convert(self, amount_usd: float, target_currency: str) -> float:
        """تحويل مبلغ من USD إلى عملة أخرى باستخدام أسعار حية فقط"""
        rates = self.get_live_rates()
        
        if target_currency not in rates:
            self.logger.error(f"❌ العملة {target_currency} غير متوفرة في الأسعار الحية!")
            raise ValueError(f"Currency {target_currency} not available in live rates")
        
        rate = rates[target_currency]
        converted_amount = amount_usd * rate
        
        self.logger.info(f"💱 تحويل ${amount_usd:.2f} USD → {converted_amount:.2f} {target_currency} (rate: {rate})")
        
        return converted_amount
    
    def get_rate(self, target_currency: str) -> float:
        """الحصول على سعر صرف عملة معينة مقابل USD من أسعار حية فقط"""
        rates = self.get_live_rates()
        
        if target_currency not in rates:
            self.logger.error(f"❌ العملة {target_currency} غير متوفرة في الأسعار الحية!")
            raise ValueError(f"Currency {target_currency} not available in live rates")
        
        return rates[target_currency]

# إنشاء instance عام لخدمة العملات
currency_service = CurrencyExchangeService()

class GoogleAdsOfficialService:
    """
    خدمة Google Ads الرسمية - تطبيق كامل للمكتبة الرسمية
    
    Features:
    - استخدام GoogleAdsClient الرسمي
    - دعم جميع حالات ManagerLinkStatusEnum
    - معالجة أخطاء GoogleAdsException
    - دعم MCC operations
    - إدارة tokens محسنة
    """
    
    def __init__(self):
        self.client = None
        self.is_initialized = False
        self.config = {}
        
        # متغيرات البيئة
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        # التحقق من المتغيرات
        self._validate_configuration()
        
        # محاولة التهيئة
        if GOOGLE_ADS_AVAILABLE:
            self._initialize_client()
    
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
            logger.info("جميع متغيرات البيئة متوفرة")
    
    def _initialize_client(self):
        """تهيئة عميل Google Ads الرسمي"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متاحة")
                return False
            
            # إعداد التكوين
            self.config = {
                'developer_token': self.developer_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': self.refresh_token,
                'login_customer_id': self.mcc_customer_id,
                'use_proto_plus': True
            }
            
            # إنشاء العميل
            self.client = GoogleAdsClient.load_from_dict(self.config)
            self.is_initialized = True
            logger.info("✅ تم تهيئة عميل Google Ads الرسمي بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"فشل في إنشاء Google Ads Client: {e}")
            self.is_initialized = False
            return False
    
    def get_customer_client_link_status(self, customer_id: str) -> Dict[str, Any]:
        """
        جلب حالة ربط العميل باستخدام المكتبة الرسمية
        
        Args:
            customer_id: معرف العميل
            
        Returns:
            Dict containing status information
        """
        try:
            if not self.is_initialized:
                return {
                    'success': False,
                    'error': 'Client not initialized',
                    'message': 'Google Ads Client غير مهيأ'
                }
            
            # تنظيف معرف العميل
            clean_customer_id = customer_id.replace('-', '')
            
            # الحصول على خدمة Google Ads
            ga_service = self.client.get_service("GoogleAdsService")
            
            # استعلام للبحث عن رابط العميل - البحث في جميع الحالات
            query = f"""
                SELECT 
                    customer_client_link.client_customer,
                    customer_client_link.status,
                    customer_client_link.resource_name
                FROM customer_client_link 
                WHERE customer_client_link.client_customer = 'customers/{clean_customer_id}'
            """
            
            # إعداد طلب البحث
            search_request = self.client.get_type("SearchGoogleAdsRequest")
            search_request.customer_id = self.mcc_customer_id
            search_request.query = query
            
            # تنفيذ البحث
            response = ga_service.search(request=search_request)
            
            # معالجة النتائج
            links = []
            for row in response:
                link = {
                    'client_customer': row.customer_client_link.client_customer,
                    'status': row.customer_client_link.status.name,
                    'resource_name': row.customer_client_link.resource_name
                }
                links.append(link)
                logger.info(f"🔍 وجد رابط: {link['status']} - {link['resource_name']}")
            
            # تحديد الحالة - تحسين المنطق للكشف عن ACTIVE
            if links:
                # البحث عن رابط ACTIVE أولاً (الأولوية للربط النشط)
                active_links = [link for link in links if link['status'] == 'ACTIVE']
                
                if active_links:
                    # استخدام رابط ACTIVE
                    latest_link = active_links[0]  # أول رابط نشط
                    logger.info(f"✅ وجد رابط ACTIVE: {latest_link['resource_name']}")
                else:
                    # البحث عن رابط PENDING
                    pending_links = [link for link in links if link['status'] == 'PENDING']
                    if pending_links:
                        latest_link = pending_links[0]  # أول رابط في انتظار
                        logger.info(f"⏳ وجد رابط PENDING: {latest_link['resource_name']}")
                    else:
                        # استخدام آخر رابط (حتى لو كان مرفوض)
                        latest_link = links[-1]
                        logger.info(f"📋 استخدام آخر رابط: {latest_link['status']}")
                
                status = latest_link['status']
                
                # تحويل الحالة إلى حالة متوافقة مع قاعدة البيانات
                db_status = self._convert_status_to_db_safe(status)
                
                # Get account status (ENABLED, SUSPENDED, etc.)
                account_status = 'UNKNOWN'
                try:
                    customer_query = f"""
                        SELECT 
                            customer.id,
                            customer.status
                        FROM customer
                        WHERE customer.id = {clean_customer_id}
                    """
                    customer_request = self.client.get_type("SearchGoogleAdsRequest")
                    customer_request.customer_id = clean_customer_id
                    customer_request.query = customer_query
                    
                    customer_response = ga_service.search(request=customer_request)
                    for row in customer_response:
                        account_status = row.customer.status.name
                        logger.info(f"📊 حالة الحساب {clean_customer_id}: {account_status}")
                        break
                except Exception as e:
                    logger.warning(f"⚠️ فشل في جلب حالة الحساب {clean_customer_id}: {e}")
                    account_status = 'UNKNOWN'
                
                return {
                    'success': True,
                    'api_status': db_status,
                    'original_status': status,
                    'account_status': account_status,  # Added account status
                    'resource_name': latest_link['resource_name'],
                    'client_customer': latest_link['client_customer'],
                    'links_found': len(links),
                    'all_links': links
                }
            else:
                # لا يوجد رابط - العميل غير مربوط
                logger.info(f"🔍 لم يتم العثور على أي رابط للحساب {clean_customer_id}")
                return {
                    'success': True,
                    'api_status': 'NOT_LINKED',
                    'original_status': 'NOT_LINKED',
                    'account_status': 'UNKNOWN',  # No account status if not linked
                    'resource_name': None,
                    'client_customer': f'customers/{clean_customer_id}',
                    'links_found': 0,
                    'all_links': []
                }
                
        except GoogleAdsException as e:
            logger.error(f"Google Ads API Error: {e}")
            
            # فحص إضافي: إذا كان الخطأ يشير إلى عدم وجود الحساب، فقد يكون مرفوض
            error_message = str(e).lower()
            if 'not found' in error_message or 'does not exist' in error_message:
                logger.info(f"🔍 الحساب {clean_customer_id} غير موجود في Google Ads API - محتمل الرفض")
                return {
                    'success': True,
                    'api_status': 'REJECTED',
                    'original_status': 'NOT_FOUND',
                    'resource_name': None,
                    'client_customer': f'customers/{clean_customer_id}',
                    'links_found': 0,
                    'all_links': [],
                    'error': 'Account not found - likely rejected'
                }
            # إرجاع خطأ عام
            return {
                'success': False,
                'error': 'GoogleAdsException',
                'message': str(e),
                'customer_id': customer_id
            }
        except Exception as e:
            logger.error(f"خطأ عام في جلب حالة الربط: {e}")
            return {
                'success': False,
                'error': 'General Error',
                'message': str(e),
                'customer_id': customer_id
            }
    
    def _convert_status_to_db_safe(self, api_status: str) -> str:
        """
        تحويل حالات Google Ads API إلى حالات مدعومة في قاعدة البيانات
        
        Args:
            api_status: حالة من Google Ads API
            
        Returns:
            حالة متوافقة مع قاعدة البيانات
        """
        status_mapping = {
            'PENDING': 'PENDING',
            'ACTIVE': 'ACTIVE',
            'REFUSED': 'REJECTED',
            'CANCELED': 'REJECTED',  # تغيير من CANCELLED إلى REJECTED
            'CANCELLED': 'REJECTED',
            'INACTIVE': 'NOT_LINKED',
            'UNKNOWN': 'NOT_LINKED',
            'UNSPECIFIED': 'NOT_LINKED'
        }
        
        return status_mapping.get(api_status, 'NOT_LINKED')
    
    def get_service_info(self) -> Dict[str, Any]:
        """
        جلب معلومات الخدمة
        
        Returns:
            Dict containing service information
        """
        return {
            'is_initialized': self.is_initialized,
            'google_ads_available': GOOGLE_ADS_AVAILABLE,
            'api_version': 'v21',
            'library_version': '28.0.0',
            'mcc_customer_id': self.mcc_customer_id,
            'developer_token_available': bool(self.developer_token),
            'client_id_available': bool(self.client_id),
            'refresh_token_available': bool(self.refresh_token)
        }
    
    # ===========================================
    # دوال العملات والتحويل
    # ===========================================
    
    def get_account_currency(self, customer_id: str) -> Optional[str]:
        """جلب عملة الحساب الإعلاني من Google Ads"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return None
            
            # تنظيف معرف العميل
            clean_customer_id = str(customer_id).replace('-', '').strip()
            
            # استعلام لجلب عملة الحساب
            ga_service = self.client.get_service("GoogleAdsService")
            query = """
                SELECT
                    customer.id,
                    customer.currency_code
                FROM customer
                WHERE customer.id = {}
            """.format(clean_customer_id)
            
            search_request = self.client.get_type("SearchGoogleAdsRequest")
            search_request.customer_id = clean_customer_id
            search_request.query = query
            
            response = ga_service.search(request=search_request)
            
            for row in response:
                currency_code = row.customer.currency_code
                logger.info(f"✅ عملة الحساب {customer_id}: {currency_code}")
                return currency_code
            
            logger.warning(f"⚠️ لم يتم العثور على عملة للحساب {customer_id}")
            return None
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في جلب عملة الحساب: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في جلب عملة الحساب: {e}")
            return None
    
    def convert_currency(self, amount_usd: float, target_currency: str) -> float:
        """تحويل المبلغ من USD إلى العملة المستهدفة باستخدام أسعار حية"""
        # استخدام خدمة العملات العالمية الحية
        converted_amount = currency_service.convert(amount_usd, target_currency)
        return converted_amount
    
    # ===========================================
    # دوال إنشاء الحملات
    # ===========================================
    
    def create_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة جديدة باستخدام المكتبة الرسمية"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return None
            
            # إنشاء الميزانية أولاً
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign_data.get('name', 'حملة جديدة')} - {str(uuid.uuid4())[:8]}"
            # استخدام القيمة الصحيحة من المكتبة الرسمية
            budget.delivery_method = self.client.enums.BudgetDeliveryMethodEnum.STANDARD
            budget.amount_micros = int(campaign_data.get('budget', 0) * 1000000)
            
            # تنفيذ إنشاء الميزانية
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء الميزانية: {budget_id}")
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة جديدة')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.enums.AdvertisingChannelTypeEnum.SEARCH
            campaign.status = self.client.enums.CampaignStatusEnum.PAUSED
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            campaign.contains_eu_political_advertising = False
            
            # تنفيذ إنشاء الحملة
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء الحملة بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء الحملة: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء الحملة: {e}")
            return None
    
    def create_ad_group(self, customer_id: str, campaign_id: str, ad_group_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء مجموعة إعلانات جديدة"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # جلب عملة الحساب
            account_currency = self.get_account_currency(customer_id)
            if not account_currency:
                logger.warning(f"⚠️ لم يتم العثور على عملة للحساب {customer_id}، استخدام USD")
                account_currency = 'USD'
            
            # الحصول على CPC Bid من البيانات (بالدولار من التوقعات)
            cpc_bid_usd = ad_group_data.get('cpc_bid', 1.0)
            
            # تحويل CPC إلى عملة الحساب
            cpc_bid_local = self.convert_currency(cpc_bid_usd, account_currency)
            
            logger.info(f"💰 CPC Bid: ${cpc_bid_usd:.2f} USD → {cpc_bid_local:.2f} {account_currency}")
            
            # إنشاء مجموعة الإعلانات
            ad_group_operation = self.client.get_type("AdGroupOperation")
            ad_group = ad_group_operation.create
            
            # إعداد بيانات مجموعة الإعلانات
            ad_group.name = ad_group_data.get('name', 'مجموعة إعلانات جديدة')
            ad_group.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
            ad_group.status = self.client.get_type("AdGroupStatusEnum").ENABLED
            ad_group.type_ = self.client.get_type("AdGroupTypeEnum").SEARCH_STANDARD
            
            # تحويل CPC إلى micros وتقريبه إلى أقرب مضاعف للوحدة القابلة للفوترة
            cpc_micros = int(cpc_bid_local * 1000000)
            billable_unit = 10_000  # معظم العملات: 10,000 micros (0.01)
            cpc_micros_rounded = round(cpc_micros / billable_unit) * billable_unit
            ad_group.cpc_bid_micros = cpc_micros_rounded
            
            logger.info(f"💰 CPC Bid Rounded: {cpc_bid_local:.2f} → {cpc_micros_rounded / 1000000:.2f} {account_currency} ({cpc_micros_rounded:,} micros)")
            
            # تنفيذ العملية
            ad_group_response = self.client.get_service("AdGroupService").mutate_ad_groups(
                customer_id=customer_id,
                operations=[ad_group_operation]
            )
            
            ad_group_id = ad_group_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء مجموعة الإعلانات بنجاح: {ad_group_id}")
            
            return ad_group_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء مجموعة الإعلانات: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء مجموعة الإعلانات: {e}")
            return None
    
    def add_keywords(self, customer_id: str, ad_group_id: str, keywords: List[str]) -> bool:
        """إضافة كلمات مفتاحية لمجموعة الإعلانات"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء عمليات الكلمات المفتاحية
            keyword_operations = []
            for keyword_text in keywords:
                keyword_operation = self.client.get_type("AdGroupCriterionOperation")
                keyword = keyword_operation.create
                keyword.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
                keyword.status = self.client.get_type("AdGroupCriterionStatusEnum").ENABLED
                keyword.keyword.text = keyword_text
                keyword.keyword.match_type = self.client.get_type("KeywordMatchTypeEnum").BROAD
                keyword_operations.append(keyword_operation)
            
            # تنفيذ العمليات
            keyword_response = self.client.get_service("AdGroupCriterionService").mutate_ad_group_criteria(
                customer_id=customer_id,
                operations=keyword_operations
            )
            
            logger.info(f"✅ تم إضافة {len(keywords)} كلمة مفتاحية بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إضافة الكلمات المفتاحية: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إضافة الكلمات المفتاحية: {e}")
            return False
    
    def create_text_ad(self, customer_id: str, ad_group_id: str, ad_data: Dict[str, Any]) -> bool:
        """إنشاء إعلان نصي متقدم باستخدام المكتبة الرسمية"""
        try:
            if not GOOGLE_ADS_AVAILABLE or not self.is_initialized:
                logger.error("المكتبة الرسمية غير متوفرة أو غير مهيأة")
                return False
            
            # إنشاء الإعلان
            ad_operation = self.client.get_type("AdGroupAdOperation")
            ad = ad_operation.create
            ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            # إعداد الإعلان النصي المتقدم
            ad.ad.responsive_search_ad.headlines.extend([
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('headline', 'عنوان الإعلان')
                ),
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('headline2', 'عنوان الإعلان الثاني')
                )
            ])
            
            ad.ad.responsive_search_ad.descriptions.extend([
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('description', 'وصف الإعلان')
                )
            ])
            
            # إضافة مسار العرض
            if ad_data.get('path1'):
                ad.ad.responsive_search_ad.path1 = ad_data.get('path1')
            if ad_data.get('path2'):
                ad.ad.responsive_search_ad.path2 = ad_data.get('path2')
            
            # تنفيذ العملية
            ad_response = self.client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_operation]
            )
            
            logger.info(f"✅ تم إنشاء الإعلان النصي المتقدم بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء الإعلان النصي: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء الإعلان النصي: {e}")
            return False
    
    def create_display_ad(self, customer_id: str, ad_group_id: str, ad_data: Dict[str, Any]) -> bool:
        """إنشاء إعلان عرض"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء الإعلان
            ad_operation = self.client.get_type("AdGroupAdOperation")
            ad = ad_operation.create
            ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            # إعداد إعلان العرض
            ad.ad.display_upload_ad.media_bundle = ad_data.get('media_bundle', '')
            ad.ad.display_upload_ad.business_name = ad_data.get('business_name', '')
            ad.ad.display_upload_ad.headline = ad_data.get('headline', '')
            ad.ad.display_upload_ad.description = ad_data.get('description', '')
            
            # تنفيذ العملية
            ad_response = self.client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_operation]
            )
            
            logger.info(f"✅ تم إنشاء إعلان العرض بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء إعلان العرض: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء إعلان العرض: {e}")
            return False
    
    def create_video_ad(self, customer_id: str, ad_group_id: str, ad_data: Dict[str, Any]) -> bool:
        """إنشاء إعلان فيديو"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء الإعلان
            ad_operation = self.client.get_type("AdGroupAdOperation")
            ad = ad_operation.create
            ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            # إعداد إعلان الفيديو
            ad.ad.video_responsive_ad.videos.extend([
                self.client.get_type("AdVideoAsset").create(
                    asset=f"customers/{customer_id}/assets/{ad_data.get('video_asset_id', '')}"
                )
            ])
            
            ad.ad.video_responsive_ad.headlines.extend([
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('headline1', 'عنوان الفيديو 1')
                ),
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('headline2', 'عنوان الفيديو 2')
                )
            ])
            
            ad.ad.video_responsive_ad.descriptions.extend([
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('description1', 'وصف الفيديو 1')
                ),
                self.client.get_type("AdTextAsset").create(
                    text=ad_data.get('description2', 'وصف الفيديو 2')
                )
            ])
            
            # تنفيذ العملية
            ad_response = self.client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_operation]
            )
            
            logger.info(f"✅ تم إنشاء إعلان الفيديو بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء إعلان الفيديو: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء إعلان الفيديو: {e}")
            return False
    
    def create_shopping_ad(self, customer_id: str, ad_group_id: str, ad_data: Dict[str, Any]) -> bool:
        """إنشاء إعلان تسوق"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء الإعلان
            ad_operation = self.client.get_type("AdGroupAdOperation")
            ad = ad_operation.create
            ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            # إعداد إعلان التسوق
            ad.ad.shopping_product_ad.product_channel = self.client.get_type("ProductChannelEnum").ONLINE
            ad.ad.shopping_product_ad.product_channel_exclusivity = self.client.get_type("ProductChannelExclusivityEnum").SINGLE_CHANNEL
            
            # تنفيذ العملية
            ad_response = self.client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_operation]
            )
            
            logger.info(f"✅ تم إنشاء إعلان التسوق بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء إعلان التسوق: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء إعلان التسوق: {e}")
            return False
    
    def create_call_ad(self, customer_id: str, ad_group_id: str, ad_data: Dict[str, Any]) -> bool:
        """إنشاء إعلان مكالمات"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء الإعلان
            ad_operation = self.client.get_type("AdGroupAdOperation")
            ad = ad_operation.create
            ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
            ad.status = self.client.enums.AdGroupAdStatusEnum.ENABLED
            
            # إعداد إعلان المكالمات
            ad.ad.call_ad.phone_number = ad_data.get('phone_number', '')
            ad.ad.call_ad.country_code = ad_data.get('country_code', 'SA')
            ad.ad.call_ad.business_name = ad_data.get('business_name', '')
            ad.ad.call_ad.headline1 = ad_data.get('headline1', '')
            ad.ad.call_ad.headline2 = ad_data.get('headline2', '')
            ad.ad.call_ad.description1 = ad_data.get('description1', '')
            ad.ad.call_ad.description2 = ad_data.get('description2', '')
            ad.ad.call_ad.call_tracked = True
            ad.ad.call_ad.disable_call_conversion = False
            
            # تنفيذ العملية
            ad_response = self.client.get_service("AdGroupAdService").mutate_ad_group_ads(
                customer_id=customer_id,
                operations=[ad_operation]
            )
            
            logger.info(f"✅ تم إنشاء إعلان المكالمات بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء إعلان المكالمات: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء إعلان المكالمات: {e}")
            return False
    
    def create_extensions(self, customer_id: str, campaign_id: str, extensions_data: Dict[str, Any]) -> bool:
        """إنشاء امتدادات الحملة"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء امتدادات الموقع
            if extensions_data.get('site_links'):
                site_link_operations = []
                for site_link in extensions_data['site_links']:
                    operation = self.client.get_type("CampaignExtensionSettingOperation")
                    extension_setting = operation.create
                    extension_setting.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                    extension_setting.extension_type = self.client.get_type("ExtensionTypeEnum").SITELINK
                    extension_setting.extension_feed_items.extend([
                        self.client.get_type("ExtensionFeedItem").create(
                            site_link_asset=self.client.get_type("SiteLinkAsset").create(
                                link_text=site_link.get('text', ''),
                                description1=site_link.get('description', ''),
                                description2=site_link.get('description2', ''),
                                final_urls=[site_link.get('url', '')]
                            )
                        )
                    ])
                    site_link_operations.append(operation)
                
                # تنفيذ عمليات امتدادات الموقع
                self.client.get_service("CampaignExtensionSettingService").mutate_campaign_extension_settings(
                    customer_id=customer_id,
                    operations=site_link_operations
                )
            
            # إنشاء امتدادات الهاتف
            if extensions_data.get('phone_number'):
                phone_operation = self.client.get_type("CampaignExtensionSettingOperation")
                extension_setting = phone_operation.create
                extension_setting.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                extension_setting.extension_type = self.client.get_type("ExtensionTypeEnum").CALL
                extension_setting.extension_feed_items.extend([
                    self.client.get_type("ExtensionFeedItem").create(
                        call_asset=self.client.get_type("CallAsset").create(
                            phone_number=extensions_data['phone_number'],
                            country_code=extensions_data.get('country_code', 'SA')
                        )
                    )
                ])
                
                # تنفيذ عملية امتداد الهاتف
                self.client.get_service("CampaignExtensionSettingService").mutate_campaign_extension_settings(
                    customer_id=customer_id,
                    operations=[phone_operation]
                )
            
            logger.info(f"✅ تم إنشاء امتدادات الحملة بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء الامتدادات: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء الامتدادات: {e}")
            return False
    
    def set_geographic_targeting(self, customer_id: str, campaign_id: str, locations: List[str]) -> bool:
        """تعيين الاستهداف الجغرافي"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء عمليات الاستهداف الجغرافي
            geo_operations = []
            for location in locations:
                operation = self.client.get_type("CampaignCriterionOperation")
                criterion = operation.create
                criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                criterion.type_ = self.client.get_type("CriterionTypeEnum").LOCATION
                criterion.location.geo_target_constant = f"geoTargetConstants/{location}"
                geo_operations.append(operation)
            
            # تنفيذ عمليات الاستهداف الجغرافي
            self.client.get_service("CampaignCriterionService").mutate_campaign_criteria(
                customer_id=customer_id,
                operations=geo_operations
            )
            
            logger.info(f"✅ تم تعيين الاستهداف الجغرافي بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في الاستهداف الجغرافي: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في الاستهداف الجغرافي: {e}")
            return False
    
    def set_demographic_targeting(self, customer_id: str, campaign_id: str, demographics: Dict[str, Any]) -> bool:
        """تعيين الاستهداف الديموغرافي"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء عمليات الاستهداف الديموغرافي
            demo_operations = []
            
            # استهداف العمر
            if demographics.get('age_ranges'):
                for age_range in demographics['age_ranges']:
                    operation = self.client.get_type("CampaignCriterionOperation")
                    criterion = operation.create
                    criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                    criterion.type_ = self.client.get_type("CriterionTypeEnum").AGE_RANGE
                    criterion.age_range.type_ = getattr(self.client.get_type("AgeRangeTypeEnum"), age_range)
                    demo_operations.append(operation)
            
            # استهداف الجنس
            if demographics.get('genders'):
                for gender in demographics['genders']:
                    operation = self.client.get_type("CampaignCriterionOperation")
                    criterion = operation.create
                    criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                    criterion.type_ = self.client.get_type("CriterionTypeEnum").GENDER
                    criterion.gender.type_ = getattr(self.client.get_type("GenderTypeEnum"), gender)
                    demo_operations.append(operation)
            
            # تنفيذ عمليات الاستهداف الديموغرافي
            if demo_operations:
                self.client.get_service("CampaignCriterionService").mutate_campaign_criteria(
                    customer_id=customer_id,
                    operations=demo_operations
                )
            
            logger.info(f"✅ تم تعيين الاستهداف الديموغرافي بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في الاستهداف الديموغرافي: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في الاستهداف الديموغرافي: {e}")
            return False
    
    def set_schedule_targeting(self, customer_id: str, campaign_id: str, schedule: Dict[str, Any]) -> bool:
        """تعيين استهداف الجدولة الزمنية"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return False
            
            # إنشاء عمليات الجدولة الزمنية
            schedule_operations = []
            
            for day_schedule in schedule.get('days', []):
                operation = self.client.get_type("CampaignCriterionOperation")
                criterion = operation.create
                criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                criterion.type_ = self.client.get_type("CriterionTypeEnum").AD_SCHEDULE
                criterion.ad_schedule.day_of_week = getattr(self.client.get_type("DayOfWeekEnum"), day_schedule['day'])
                criterion.ad_schedule.start_hour = day_schedule.get('start_hour', 0)
                criterion.ad_schedule.start_minute = day_schedule.get('start_minute', 0)
                criterion.ad_schedule.end_hour = day_schedule.get('end_hour', 23)
                criterion.ad_schedule.end_minute = day_schedule.get('end_minute', 59)
                schedule_operations.append(operation)
            
            # تنفيذ عمليات الجدولة الزمنية
            if schedule_operations:
                self.client.get_service("CampaignCriterionService").mutate_campaign_criteria(
                    customer_id=customer_id,
                    operations=schedule_operations
                )
            
            logger.info(f"✅ تم تعيين الجدولة الزمنية بنجاح")
            return True
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في الجدولة الزمنية: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ خطأ عام في الجدولة الزمنية: {e}")
            return False
    
    def get_campaign_performance(self, customer_id: str, campaign_id: str) -> Dict[str, Any]:
        """الحصول على أداء الحملة"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return {}
            
            # إنشاء استعلام الأداء
            query = f"""
                SELECT 
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.ctr,
                    metrics.average_cpc,
                    metrics.cost_micros,
                    metrics.conversions,
                    metrics.conversion_rate,
                    metrics.cost_per_conversion
                FROM campaign 
                WHERE campaign.id = {campaign_id}
                AND segments.date DURING LAST_30_DAYS
            """
            
            # تنفيذ الاستعلام
            response = self.client.get_service("GoogleAdsService").search(
                customer_id=customer_id,
                query=query
            )
            
            # معالجة النتائج
            performance_data = {}
            for row in response:
                performance_data = {
                    'campaign_id': row.campaign.id,
                    'campaign_name': row.campaign.name,
                    'status': row.campaign.status.name,
                    'impressions': row.metrics.impressions,
                    'clicks': row.metrics.clicks,
                    'ctr': row.metrics.ctr,
                    'average_cpc': row.metrics.average_cpc,
                    'cost_micros': row.metrics.cost_micros,
                    'conversions': row.metrics.conversions,
                    'conversion_rate': row.metrics.conversion_rate,
                    'cost_per_conversion': row.metrics.cost_per_conversion
                }
                break
            
            logger.info(f"✅ تم الحصول على أداء الحملة بنجاح")
            return performance_data
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في الحصول على الأداء: {e}")
            return {}
        except Exception as e:
            logger.error(f"❌ خطأ عام في الحصول على الأداء: {e}")
            return {}
    
    # ===========================================
    # مميزات متقدمة للحملات الإعلانية
    # ===========================================
    
    def create_performance_max_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة Performance Max"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة Performance Max')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").PERFORMANCE_MAX
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة Performance Max بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة Performance Max: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة Performance Max: {e}")
            return None
    
    def create_shopping_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة تسوق"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة تسوق')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").SHOPPING
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة التسوق بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة التسوق: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة التسوق: {e}")
            return None
    
    def create_video_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة فيديو"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة فيديو')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").VIDEO
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة الفيديو بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة الفيديو: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة الفيديو: {e}")
            return None
    
    def create_display_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة عرض"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة عرض')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").DISPLAY
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة العرض بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة العرض: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة العرض: {e}")
            return None
    
    def create_app_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة تطبيق"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة تطبيق')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").MULTI_CHANNEL
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة التطبيق بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة التطبيق: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة التطبيق: {e}")
            return None
    
    def create_smart_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة ذكية"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة ذكية')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").SMART
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء الحملة الذكية بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء الحملة الذكية: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء الحملة الذكية: {e}")
            return None
    
    def create_local_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة محلية"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة محلية')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").LOCAL
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء الحملة المحلية بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء الحملة المحلية: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء الحملة المحلية: {e}")
            return None
    
    def create_discovery_campaign(self, customer_id: str, campaign_data: Dict[str, Any]) -> Optional[str]:
        """إنشاء حملة اكتشاف"""
        try:
            if not GOOGLE_ADS_AVAILABLE:
                logger.error("المكتبة الرسمية غير متوفرة")
                return None
            
            # إنشاء الحملة
            campaign_operation = self.client.get_type("CampaignOperation")
            campaign = campaign_operation.create
            
            # إعداد بيانات الحملة
            campaign.name = f"{campaign_data.get('name', 'حملة اكتشاف')} - {str(uuid.uuid4())[:8]}"
            campaign.advertising_channel_type = self.client.get_type("AdvertisingChannelTypeEnum").DISCOVERY
            campaign.status = self.client.get_type("CampaignStatusEnum").PAUSED
            campaign.contains_eu_political_advertising = False
            
            # إعداد الميزانية
            budget_operation = self.client.get_type("CampaignBudgetOperation")
            budget = budget_operation.create
            budget.name = f"ميزانية {campaign.name} - {str(uuid.uuid4())[:8]}"
            budget.delivery_method = self.client.get_type("BudgetDeliveryMethodEnum").STANDARD
            budget.amount_micros = int(campaign_data.get('daily_budget', 0) * 1000000)
            
            # تنفيذ العمليات
            budget_response = self.client.get_service("CampaignBudgetService").mutate_campaign_budgets(
                customer_id=customer_id,
                operations=[budget_operation]
            )
            
            budget_id = budget_response.results[0].resource_name.split('/')[-1]
            campaign.campaign_budget = f"customers/{customer_id}/campaignBudgets/{budget_id}"
            
            campaign_response = self.client.get_service("CampaignService").mutate_campaigns(
                customer_id=customer_id,
                operations=[campaign_operation]
            )
            
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"✅ تم إنشاء حملة الاكتشاف بنجاح: {campaign_id}")
            
            return campaign_id
            
        except GoogleAdsException as e:
            logger.error(f"❌ خطأ Google Ads في إنشاء حملة الاكتشاف: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ عام في إنشاء حملة الاكتشاف: {e}")
            return None

# إنشاء instance عام للاستخدام
google_ads_service = GoogleAdsOfficialService()

def get_google_ads_service() -> GoogleAdsOfficialService:
    """الحصول على instance الخدمة"""
    return google_ads_service