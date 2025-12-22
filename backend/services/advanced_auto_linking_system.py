#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام الربط التلقائي المتطور للحسابات الإعلانية
Advanced Automatic Account Linking System
"""

import os
import json
import time
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import requests
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv('../.env.development')

# إعداد logging متقدم
class ColoredFormatter(logging.Formatter):
    """Formatter ملون للـ logs"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{log_color}{record.levelname}{self.RESET}"
        return super().format(record)

# إعداد logger
logger = logging.getLogger('AdvancedAutoLinking')
logger.setLevel(logging.INFO)

# Console handler مع ألوان
console_handler = logging.StreamHandler()
console_handler.setFormatter(ColoredFormatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

# File handler للحفظ
file_handler = logging.FileHandler('advanced_auto_linking.log', encoding='utf-8')
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))

logger.addHandler(console_handler)
logger.addHandler(file_handler)

class LinkingStatus(Enum):
    """حالات الربط"""
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

@dataclass
class GoogleAdsAccount:
    """بيانات الحساب الإعلاني"""
    customer_id: str
    customer_name: str
    currency_code: str = "USD"
    time_zone: str = "UTC"
    status: str = "ENABLED"
    account_type: str = "STANDARD"
    manager_customer_id: Optional[str] = None
    is_test_account: bool = False
    creation_date: Optional[str] = None
    last_modified_time: Optional[str] = None

@dataclass
class LinkingOperation:
    """عملية ربط الحساب"""
    operation_id: str
    account: GoogleAdsAccount
    mcc_customer_id: str
    status: LinkingStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    invitation_id: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3

class AdvancedAutoLinkingSystem:
    """نظام الربط التلقائي المتطور"""
    
    def __init__(self):
        """تهيئة النظام"""
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        self.developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        self.mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        self.active_operations: Dict[str, LinkingOperation] = {}
        self.completed_operations: List[LinkingOperation] = []
        
        logger.info("🚀 تم تهيئة نظام الربط التلقائي المتطور")
        logger.info(f"   📊 MCC Customer ID: {self.mcc_customer_id}")
        logger.info(f"   📊 Developer Token: {self.developer_token[:10]}...")
        
    def validate_configuration(self) -> bool:
        """التحقق من صحة الإعدادات"""
        logger.info("🔧 التحقق من صحة الإعدادات...")
        
        required_vars = {
            'GOOGLE_ADS_CLIENT_ID': self.client_id,
            'GOOGLE_ADS_CLIENT_SECRET': self.client_secret,
            'GOOGLE_ADS_DEVELOPER_TOKEN': self.developer_token,
            'MCC_LOGIN_CUSTOMER_ID': self.mcc_customer_id
        }
        
        missing_vars = []
        for var_name, var_value in required_vars.items():
            if not var_value or var_value.startswith('your_'):
                missing_vars.append(var_name)
                logger.error(f"❌ {var_name}: مفقود أو غير صحيح")
            else:
                logger.info(f"✅ {var_name}: {var_value[:15]}...")
        
        if missing_vars:
            logger.error(f"❌ متغيرات مفقودة: {missing_vars}")
            return False
        
        logger.info("✅ جميع الإعدادات صحيحة")
        return True
    
    async def discover_google_ads_accounts(self, access_token: str) -> List[GoogleAdsAccount]:
        """اكتشاف الحسابات الإعلانية بطريقة متطورة"""
        logger.info("🔍 بدء اكتشاف الحسابات الإعلانية المتطور...")
        
        discovered_accounts = []
        
        # الطريقة 1: Google Ads API - Accessible Customers
        try:
            logger.info("🔍 الطريقة 1: استخدام Google Ads API - Accessible Customers")
            accounts = await self._get_accessible_customers(access_token)
            discovered_accounts.extend(accounts)
            logger.info(f"✅ تم اكتشاف {len(accounts)} حساب عبر Accessible Customers")
        except Exception as e:
            logger.warning(f"⚠️ فشل في الطريقة 1: {e}")
        
        # الطريقة 2: Google Ads API - Customer Search
        try:
            logger.info("🔍 الطريقة 2: استخدام Google Ads API - Customer Search")
            accounts = await self._search_customers(access_token)
            discovered_accounts.extend(accounts)
            logger.info(f"✅ تم اكتشاف {len(accounts)} حساب إضافي عبر Customer Search")
        except Exception as e:
            logger.warning(f"⚠️ فشل في الطريقة 2: {e}")
        
        # الطريقة 3: Google My Business API
        try:
            logger.info("🔍 الطريقة 3: استخدام Google My Business API")
            accounts = await self._get_gmb_accounts(access_token)
            discovered_accounts.extend(accounts)
            logger.info(f"✅ تم اكتشاف {len(accounts)} حساب عبر Google My Business")
        except Exception as e:
            logger.warning(f"⚠️ فشل في الطريقة 3: {e}")
        
        # إزالة التكرارات
        unique_accounts = self._remove_duplicate_accounts(discovered_accounts)
        
        logger.info("🎯 ملخص الاكتشاف:")
        logger.info(f"   📊 إجمالي الحسابات المكتشفة: {len(discovered_accounts)}")
        logger.info(f"   📊 الحسابات الفريدة: {len(unique_accounts)}")
        
        # عرض تفاصيل كل حساب
        for i, account in enumerate(unique_accounts, 1):
            logger.info(f"   {i}. 📊 Customer ID: {account.customer_id}")
            logger.info(f"      📊 Name: {account.customer_name}")
            logger.info(f"      📊 Currency: {account.currency_code}")
            logger.info(f"      📊 Status: {account.status}")
            logger.info(f"      📊 Type: {account.account_type}")
            logger.info("      " + "="*60)
        
        return unique_accounts
    
    async def _get_accessible_customers(self, access_token: str) -> List[GoogleAdsAccount]:
        """الحصول على الحسابات المتاحة باستخدام Google Ads API Client Library"""
        try:
            # استخدام Google Ads API Client Library (الطريقة الرسمية)
            from google.ads.googleads.client import GoogleAdsClient
            from google.ads.googleads.errors import GoogleAdsException
            from google.auth.credentials import Credentials
            
            # إنشاء credentials
            credentials = Credentials(
                access_token,
                client_id=os.getenv('GOOGLE_ADS_CLIENT_ID'),
                client_secret=os.getenv('GOOGLE_ADS_CLIENT_SECRET'),
                scopes=['https://www.googleapis.com/auth/adwords']
            )
            
            # إنشاء client configuration
            config = {
                'developer_token': self.developer_token,
                'use_proto_plus': True,
                'credentials': credentials
            }
            
            # إنشاء Google Ads client
            client = GoogleAdsClient.load_from_dict(config)
            customer_service = client.get_service("CustomerService")
            
            # الحصول على الحسابات المتاحة
            accessible_customers = customer_service.list_accessible_customers()
            resource_names = list(accessible_customers.resource_names)
            
        except Exception as e:
            logger.error(f"فشل في استخدام Google Ads API Client Library: {e}")
            # استخدام REST API كبديل
            headers = {
                'Authorization': f'Bearer {access_token}',
                'developer-token': self.developer_token,
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                'https://googleads.googleapis.com/v20/customers:listAccessibleCustomers',
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                resource_names = data.get('resourceNames', [])
            else:
                logger.error(f"فشل في الحصول على الحسابات: {response.status_code}")
                return []
        
        accounts = []
        if resource_names:
            
            for resource_name in resource_names:
                customer_id = resource_name.split('/')[-1]
                account_details = await self._get_account_details(access_token, customer_id)
                if account_details:
                    accounts.append(account_details)
        
        return accounts
    
    async def _get_account_details(self, access_token: str, customer_id: str) -> Optional[GoogleAdsAccount]:
        """الحصول على تفاصيل الحساب"""
        try:
            try:
                # استخدام Google Ads API Client Library (الطريقة الرسمية)
                from google.ads.googleads.client import GoogleAdsClient
                from google.ads.googleads.errors import GoogleAdsException
                from google.auth.credentials import Credentials
                
                # إنشاء credentials
                credentials = Credentials(
                    access_token,
                    client_id=os.getenv('GOOGLE_ADS_CLIENT_ID') or os.getenv('GOOGLE_CLIENT_ID'),
                    client_secret=os.getenv('GOOGLE_ADS_CLIENT_SECRET') or os.getenv('GOOGLE_CLIENT_SECRET'),
                    scopes=['https://www.googleapis.com/auth/adwords']
                )
                
                # إنشاء client configuration
                config = {
                    'developer_token': self.developer_token,
                    'use_proto_plus': True,
                    'login_customer_id': self.mcc_customer_id,
                    'credentials': credentials
                }
                
                # إنشاء Google Ads client
                client = GoogleAdsClient.load_from_dict(config)
                google_ads_service = client.get_service("GoogleAdsService")
                
                query = """
                SELECT 
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status,
                    customer.test_account,
                    customer.manager
                FROM customer
                LIMIT 1
                """
                
                # استخدام Google Ads service
                search_request = client.get_type("SearchGoogleAdsRequest")
                search_request.customer_id = customer_id
                search_request.query = query
                
                response = google_ads_service.search(request=search_request)
                
                # معالجة النتائج
                for row in response:
                    customer = row.customer
                    return GoogleAdsAccount(
                        customer_id=str(customer.id),
                        name=customer.descriptive_name or f"Account {customer.id}",
                        currency_code=customer.currency_code or "USD",
                        time_zone=customer.time_zone or "UTC",
                        status="ENABLED" if customer.status.name == "ENABLED" else "DISABLED",
                        is_test_account=customer.test_account,
                        is_manager=customer.manager,
                        account_type="MCC" if customer.manager else "REGULAR"
                    )
                    
            except Exception as e:
                logger.error(f"فشل في استخدام Google Ads API Client Library: {e}")
                # استخدام REST API كبديل
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'developer-token': self.developer_token,
                    'login-customer-id': self.mcc_customer_id,
                    'Content-Type': 'application/json'
                }
                
                query = """
                SELECT 
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status,
                    customer.test_account,
                    customer.manager
                FROM customer
                LIMIT 1
                """
                
                response = requests.post(
                    f'https://googleads.googleapis.com/v20/customers/{customer_id}/googleAds:search',
                    headers=headers,
                    json={'query': query},
                    timeout=30
                )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                if results:
                    customer_data = results[0]['customer']
                    return GoogleAdsAccount(
                        customer_id=str(customer_data['id']),
                        customer_name=customer_data.get('descriptiveName', f'Account {customer_id}'),
                        currency_code=customer_data.get('currencyCode', 'USD'),
                        time_zone=customer_data.get('timeZone', 'UTC'),
                        status=customer_data.get('status', 'ENABLED'),
                        account_type='MANAGER' if customer_data.get('manager') else 'STANDARD',
                        is_test_account=customer_data.get('testAccount', False)
                    )
        
        except Exception as e:
            logger.warning(f"⚠️ فشل في الحصول على تفاصيل الحساب {customer_id}: {e}")
        
        return None
    
    async def _search_customers(self, access_token: str) -> List[GoogleAdsAccount]:
        """البحث عن العملاء"""
        # تنفيذ وهمي - يمكن تطويره لاحقاً
        return []
    
    async def _get_gmb_accounts(self, access_token: str) -> List[GoogleAdsAccount]:
        """الحصول على حسابات Google My Business"""
        # تنفيذ وهمي - يمكن تطويره لاحقاً
        return []
    
    def _remove_duplicate_accounts(self, accounts: List[GoogleAdsAccount]) -> List[GoogleAdsAccount]:
        """إزالة الحسابات المكررة"""
        seen_ids = set()
        unique_accounts = []
        
        for account in accounts:
            if account.customer_id not in seen_ids:
                seen_ids.add(account.customer_id)
                unique_accounts.append(account)
        
        return unique_accounts
    
    async def start_automatic_linking(self, access_token: str, accounts: List[GoogleAdsAccount]) -> Dict[str, Any]:
        """بدء الربط التلقائي للحسابات"""
        logger.info("🚀 بدء عملية الربط التلقائي المتطور...")
        logger.info(f"   📊 عدد الحسابات للربط: {len(accounts)}")
        logger.info(f"   📊 MCC Customer ID: {self.mcc_customer_id}")
        
        linking_results = {
            'total_accounts': len(accounts),
            'successful_links': 0,
            'failed_links': 0,
            'operations': [],
            'started_at': datetime.now().isoformat(),
            'completed_at': None
        }
        
        # إنشاء عمليات الربط
        operations = []
        for account in accounts:
            operation_id = f"link_{account.customer_id}_{int(time.time())}"
            operation = LinkingOperation(
                operation_id=operation_id,
                account=account,
                mcc_customer_id=self.mcc_customer_id,
                status=LinkingStatus.PENDING,
                started_at=datetime.now()
            )
            operations.append(operation)
            self.active_operations[operation_id] = operation
        
        # تنفيذ العمليات بشكل متوازي
        tasks = [self._execute_linking_operation(access_token, op) for op in operations]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # تحليل النتائج
        for i, result in enumerate(results):
            operation = operations[i]
            
            if isinstance(result, Exception):
                operation.status = LinkingStatus.FAILED
                operation.error_message = str(result)
                linking_results['failed_links'] += 1
                logger.error(f"❌ فشل ربط الحساب {operation.account.customer_id}: {result}")
            else:
                if result.get('success'):
                    operation.status = LinkingStatus.SUCCESS
                    operation.invitation_id = result.get('invitation_id')
                    linking_results['successful_links'] += 1
                    
                    logger.info("🎉 تم ربط الحساب الإعلاني تلقائياً بنجاح!")
                    logger.info(f"   📊 Customer ID: {operation.account.customer_id}")
                    logger.info(f"   📊 Account Name: {operation.account.customer_name}")
                    logger.info(f"   📊 MCC Customer ID: {operation.mcc_customer_id}")
                    logger.info(f"   📊 Invitation ID: {operation.invitation_id}")
                    logger.info(f"   📊 Currency: {operation.account.currency_code}")
                    logger.info(f"   📊 Status: ACTIVE")
                    logger.info(f"   📊 Linked At: {datetime.now().isoformat()}")
                    logger.info("   " + "="*70)
                else:
                    operation.status = LinkingStatus.FAILED
                    operation.error_message = result.get('error', 'Unknown error')
                    linking_results['failed_links'] += 1
                    logger.error(f"❌ فشل ربط الحساب {operation.account.customer_id}: {operation.error_message}")
            
            operation.completed_at = datetime.now()
            linking_results['operations'].append({
                'operation_id': operation.operation_id,
                'customer_id': operation.account.customer_id,
                'customer_name': operation.account.customer_name,
                'status': operation.status.value,
                'invitation_id': operation.invitation_id,
                'error_message': operation.error_message,
                'started_at': operation.started_at.isoformat(),
                'completed_at': operation.completed_at.isoformat() if operation.completed_at else None
            })
        
        linking_results['completed_at'] = datetime.now().isoformat()
        
        # نقل العمليات المكتملة
        for operation in operations:
            if operation.operation_id in self.active_operations:
                del self.active_operations[operation.operation_id]
            self.completed_operations.append(operation)
        
        # عرض الملخص النهائي
        logger.info("🎯 ملخص عملية الربط التلقائي:")
        logger.info(f"   📊 إجمالي الحسابات: {linking_results['total_accounts']}")
        logger.info(f"   ✅ الحسابات المرتبطة بنجاح: {linking_results['successful_links']}")
        logger.info(f"   ❌ الحسابات التي فشل ربطها: {linking_results['failed_links']}")
        logger.info(f"   📊 معدل النجاح: {(linking_results['successful_links'] / linking_results['total_accounts'] * 100):.1f}%")
        
        # حفظ التقرير
        self._save_linking_report(linking_results)
        
        return linking_results
    
    async def _execute_linking_operation(self, access_token: str, operation: LinkingOperation) -> Dict[str, Any]:
        """تنفيذ عملية ربط واحدة"""
        operation.status = LinkingStatus.IN_PROGRESS
        
        logger.info(f"🔗 بدء ربط الحساب: {operation.account.customer_id} ({operation.account.customer_name})")
        
        try:
            # محاولة الربط عبر CustomerManagerLinkService
            result = await self._send_manager_link_request(access_token, operation)
            
            if result.get('success'):
                logger.info(f"✅ تم إرسال طلب ربط بنجاح للحساب {operation.account.customer_id}")
                return result
            
            # إذا فشلت الطريقة الأولى، جرب CustomerClientLinkService
            result = await self._send_client_link_request(access_token, operation)
            
            if result.get('success'):
                logger.info(f"✅ تم إرسال طلب ربط بديل بنجاح للحساب {operation.account.customer_id}")
                return result
            
            # إذا فشلت كل الطرق
            return {
                'success': False,
                'error': 'فشل في جميع طرق الربط المتاحة'
            }
            
        except Exception as e:
            logger.error(f"❌ خطأ في ربط الحساب {operation.account.customer_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _send_manager_link_request(self, access_token: str, operation: LinkingOperation) -> Dict[str, Any]:
        """إرسال طلب ربط عبر Manager Link"""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'developer-token': self.developer_token,
            'login-customer-id': self.mcc_customer_id,
            'Content-Type': 'application/json'
        }
        
        link_request_data = {
            'clientCustomer': f'customers/{operation.account.customer_id}',
            'status': 'ACTIVE'
        }
        
        response = requests.post(
            f'https://googleads.googleapis.com/v20/customers/{self.mcc_customer_id}/customerManagerLinks',
            headers=headers,
            json=link_request_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            invitation_id = data.get('resourceName', f"mgr_link_{self.mcc_customer_id}_{operation.account.customer_id}_{int(time.time())}")
            
            return {
                'success': True,
                'invitation_id': invitation_id,
                'method': 'CustomerManagerLinkService',
                'api_response': data
            }
        
        return {
            'success': False,
            'error': f'HTTP {response.status_code}: {response.text}',
            'method': 'CustomerManagerLinkService'
        }
    
    async def _send_client_link_request(self, access_token: str, operation: LinkingOperation) -> Dict[str, Any]:
        """إرسال طلب ربط عبر Client Link"""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'developer-token': self.developer_token,
            'login-customer-id': self.mcc_customer_id,
            'Content-Type': 'application/json'
        }
        
        client_link_data = {
            'clientCustomer': f'customers/{operation.account.customer_id}',
            'managerLink': {
                'managerCustomer': f'customers/{self.mcc_customer_id}',
                'status': 'ACTIVE'
            }
        }
        
        response = requests.post(
            f'https://googleads.googleapis.com/v20/customers/{self.mcc_customer_id}/customerClientLinks',
            headers=headers,
            json=client_link_data,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            invitation_id = data.get('resourceName', f"client_link_{self.mcc_customer_id}_{operation.account.customer_id}_{int(time.time())}")
            
            return {
                'success': True,
                'invitation_id': invitation_id,
                'method': 'CustomerClientLinkService',
                'api_response': data
            }
        
        return {
            'success': False,
            'error': f'HTTP {response.status_code}: {response.text}',
            'method': 'CustomerClientLinkService'
        }
    
    def _save_linking_report(self, results: Dict[str, Any]) -> None:
        """حفظ تقرير الربط"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"advanced_auto_linking_report_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            logger.info(f"📄 تم حفظ تقرير الربط في: {filename}")
        except Exception as e:
            logger.error(f"❌ فشل في حفظ التقرير: {e}")
    
    def get_linking_status(self) -> Dict[str, Any]:
        """الحصول على حالة الربط الحالية"""
        return {
            'active_operations': len(self.active_operations),
            'completed_operations': len(self.completed_operations),
            'total_operations': len(self.active_operations) + len(self.completed_operations),
            'active_operation_ids': list(self.active_operations.keys()),
            'last_update': datetime.now().isoformat()
        }

# إنشاء instance عام
advanced_auto_linking = AdvancedAutoLinkingSystem()

async def main():
    """الدالة الرئيسية للاختبار"""
    logger.info("🚀 بدء اختبار نظام الربط التلقائي المتطور...")
    
    # التحقق من الإعدادات
    if not advanced_auto_linking.validate_configuration():
        logger.error("❌ فشل في التحقق من الإعدادات")
        return
    
    # محاكاة access token
    test_access_token = "test_access_token_for_advanced_linking"
    
    # اكتشاف الحسابات
    accounts = await advanced_auto_linking.discover_google_ads_accounts(test_access_token)
    
    if not accounts:
        logger.warning("⚠️ لم يتم اكتشاف أي حسابات للربط")
        return
    
    # بدء الربط التلقائي
    results = await advanced_auto_linking.start_automatic_linking(test_access_token, accounts)
    
    logger.info("🎉 انتهى اختبار نظام الربط التلقائي المتطور!")

if __name__ == "__main__":
    asyncio.run(main())
