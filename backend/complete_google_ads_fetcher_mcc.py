#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Ads MCC Data Fetcher - AI-Powered Enterprise Edition
===========================================================
أقوى نظام لجلب بيانات جميع العملاء من MCC مع ميزات متقدمة للذكاء الاصطناعي والأمان
Author: Google Ads AI Platform Team
Version: 5.0.0 - MCC Edition - FIXED
License: MIT
"""

# ===========================================
# PART 1: IMPORTS AND BASIC SETUP
# الجزء الأول: الاستيرادات والإعدادات الأساسية
# ===========================================

import os
import sys
import json
import yaml
import time
import logging
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback
import hashlib
import pickle
from pathlib import Path
import base64

# إضافة هذه الاستيرادات في بداية الملف - FIXED
import arabic_reshaper
from bidi.algorithm import get_display

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import warnings

import os
os.environ['GOOGLE_ADS_CONFIGURATION_FILE_PATH'] = 'ads_config.yaml'

# إعداد الخطوط لتجنب تحذيرات الخطوط العربية - FIXED
plt.rcParams['font.family'] = ['Tahoma', 'DejaVu Sans', 'Arial', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False
warnings.filterwarnings('ignore', category=UserWarning, module='matplotlib.font_manager')

# دالة لإعداد الخط العربي - FIXED
def setup_arabic_font():
    """إعداد الخط العربي للمخططات"""
    try:
        # البحث عن خطوط عربية متاحة
        available_fonts = [f.name for f in fm.fontManager.ttflist]
        arabic_fonts = ['Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Liberation Sans']
        
        for font in arabic_fonts:
            if font in available_fonts:
                plt.rcParams['font.family'] = [font]
                break
        else:
            plt.rcParams['font.family'] = ['sans-serif']
            
    except Exception as e:
        print(f"تحذير: مشكلة في إعداد الخط العربي: {e}")
        plt.rcParams['font.family'] = ['sans-serif']

# تشغيل إعداد الخط
setup_arabic_font()

# التحقق من وجود المكتبات المطلوبة وتثبيتها إذا لزم الأمر
def install_if_missing(package_name, import_name=None):
    if import_name is None:
        import_name = package_name
    try:
        __import__(import_name)
    except ImportError:
        print(f"📦 Installing {package_name}...")
        os.system(f"pip install {package_name}")

# تثبيت المكتبات المطلوبة
install_if_missing("cryptography")
install_if_missing("google-ads", "google.ads")
install_if_missing("pandas")
install_if_missing("numpy")
install_if_missing("matplotlib")
install_if_missing("seaborn")
install_if_missing("tqdm")
install_if_missing("rich")
install_if_missing("cerberus")
install_if_missing("pybreaker")
install_if_missing("openpyxl")

# استيراد المكتبات
try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    from tqdm import tqdm
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.table import Table
    from rich.panel import Panel
    from cryptography.fernet import Fernet
    
    # For advanced configuration validation
    from cerberus import Validator
    
    # Circuit breaker for resilience
    import pybreaker
    
except ImportError as e:
    print(f"❌ Error importing required libraries: {e}")
    print("🔧 Please install missing libraries using:")
    print("pip install google-ads pandas numpy matplotlib seaborn tqdm rich cerberus pybreaker cryptography openpyxl")
    sys.exit(1)

# ===========================================
# END OF PART 1
# نهاية الجزء الأول
# ===========================================

# ===========================================
# PART 2: CONFIGURATION AND ENCRYPTION MANAGEMENT
# الجزء الثاني: إدارة الإعدادات والتشفير
# ===========================================

class ConfigManager:
    """مدير الإعدادات المتقدم مع التشفير والتحقق"""
    
    def __init__(self, config_file: str = "ads_config.yaml"):
        self.config_file = config_file
        self.config = {}
        self.encryption_key = None
        self.validator = None
        self.console = Console()
        self._setup_encryption()
        self._setup_validator()
        self.load_config()
    
    def _setup_encryption(self):
        """إعداد التشفير للبيانات الحساسة"""
        try:
            key_file = "config_encryption.key"
            if os.path.exists(key_file):
                with open(key_file, 'rb') as f:
                    self.encryption_key = f.read()
            else:
                self.encryption_key = Fernet.generate_key()
                with open(key_file, 'wb') as f:
                    f.write(self.encryption_key)
            self.cipher = Fernet(self.encryption_key)
        except Exception as e:
            self.console.print(f"[yellow]Warning: Encryption setup failed: {e}[/yellow]")
            self.encryption_key = None
    
    def _setup_validator(self):
        """إعداد مُحقق الإعدادات"""
        schema = {
            'account': {
                'type': 'dict',
                'required': True,
                'schema': {
                    'customer_id': {'type': 'string', 'required': True},
                    'developer_token': {'type': 'string', 'required': True}
                }
            },
            'oauth2': {
                'type': 'dict',
                'required': True,
                'schema': {
                    'client_id': {'type': 'string', 'required': True},
                    'client_secret': {'type': 'string', 'required': True},
                    'refresh_token': {'type': 'string', 'required': True}
                }
            }
        }
        self.validator = Validator(schema)
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """تشفير البيانات الحساسة"""
        if self.encryption_key and data:
            try:
                encrypted = self.cipher.encrypt(data.encode())
                return base64.b64encode(encrypted).decode()
            except Exception:
                return data
        return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """فك تشفير البيانات الحساسة"""
        if self.encryption_key and encrypted_data:
            try:
                decoded = base64.b64decode(encrypted_data.encode())
                decrypted = self.cipher.decrypt(decoded)
                return decrypted.decode()
            except Exception:
                return encrypted_data
        return encrypted_data
    
    def load_config(self) -> Dict:
        """تحميل الإعدادات من الملف"""
        try:
            if not os.path.exists(self.config_file):
                self.console.print(f"[red]❌ Configuration file not found: {self.config_file}[/red]")
                self._create_default_config()
                return self.config
            
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
            
            # فك تشفير البيانات الحساسة
            self._decrypt_config()
            
            # التحقق من صحة الإعدادات
            if self.validator and not self.validator.validate(self.config):
                self.console.print(f"[yellow]⚠️ Configuration validation warnings: {self.validator.errors}[/yellow]")
            
            self.console.print("[green]✅ Configuration loaded successfully[/green]")
            return self.config
            
        except Exception as e:
            self.console.print(f"[red]❌ Error loading configuration: {e}[/red]")
            self._create_default_config()
            return self.config
    
    def _decrypt_config(self):
        """فك تشفير الإعدادات الحساسة"""
        sensitive_fields = [
            'account.developer_token',
            'oauth2.client_secret',
            'oauth2.refresh_token'
        ]
        
        for field_path in sensitive_fields:
            try:
                keys = field_path.split('.')
                current = self.config
                for key in keys[:-1]:
                    current = current.get(key, {})
                
                if keys[-1] in current:
                    current[keys[-1]] = self.decrypt_sensitive_data(current[keys[-1]])
            except Exception:
                continue
    
    def _create_default_config(self):
        """إنشاء ملف إعدادات افتراضي"""
        default_config = {
            'account': {
                'customer_id': 'YOUR_MCC_CUSTOMER_ID',
                'developer_token': 'YOUR_DEVELOPER_TOKEN'
            },
            'oauth2': {
                'client_id': 'YOUR_CLIENT_ID',
                'client_secret': 'YOUR_CLIENT_SECRET',
                'refresh_token': 'YOUR_REFRESH_TOKEN'
            },
            'logging': {
                'level': 'INFO',
                'format': 'text'
            },
            'api_requests': {
                'timeout_seconds': 120,
                'max_retries': 3
            }
        }
        
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(default_config, f, default_flow_style=False, allow_unicode=True)
            self.config = default_config
            self.console.print(f"[yellow]📝 Created default configuration file: {self.config_file}[/yellow]")
            self.console.print("[yellow]Please update the configuration with your actual credentials[/yellow]")
        except Exception as e:
            self.console.print(f"[red]❌ Error creating default configuration: {e}[/red]")
    
    def get(self, key_path: str, default=None):
        """الحصول على قيمة من الإعدادات باستخدام مسار النقاط"""
        try:
            keys = key_path.split('.')
            current = self.config
            for key in keys:
                current = current[key]
            return current
        except (KeyError, TypeError):
            return default
    
    def set(self, key_path: str, value):
        """تعيين قيمة في الإعدادات باستخدام مسار النقاط"""
        keys = key_path.split('.')
        current = self.config
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        current[keys[-1]] = value
    
    def save_config(self):
        """حفظ الإعدادات في الملف"""
        try:
            # تشفير البيانات الحساسة قبل الحفظ
            config_to_save = self.config.copy()
            self._encrypt_config_for_save(config_to_save)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                yaml.dump(config_to_save, f, default_flow_style=False, allow_unicode=True)
            
            self.console.print("[green]✅ Configuration saved successfully[/green]")
        except Exception as e:
            self.console.print(f"[red]❌ Error saving configuration: {e}[/red]")
    
    def _encrypt_config_for_save(self, config):
        """تشفير الإعدادات الحساسة للحفظ"""
        sensitive_fields = [
            'account.developer_token',
            'oauth2.client_secret',
            'oauth2.refresh_token'
        ]
        
        for field_path in sensitive_fields:
            try:
                keys = field_path.split('.')
                current = config
                for key in keys[:-1]:
                    current = current.get(key, {})
                
                if keys[-1] in current:
                    current[keys[-1]] = self.encrypt_sensitive_data(current[keys[-1]])
            except Exception:
                continue

# ===========================================
# END OF PART 2
# نهاية الجزء الثاني
# ===========================================

# ===========================================
# PART 3: LOGGING SETUP
# الجزء الثالث: إعداد التسجيل
# ===========================================

class LoggerManager:
    """مدير التسجيل المتقدم مع دعم الملفات و Rich Console"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger("GoogleAdsFetcher")
        self.logger.setLevel(self._get_log_level())
        self.console = Console()
        self._setup_handlers()

    def _get_log_level(self):
        """الحصول على مستوى التسجيل من الإعدادات"""
        level_str = self.config.get('logging.level', 'INFO').upper()
        return getattr(logging, level_str, logging.INFO)

    def _setup_handlers(self):
        """إعداد معالجات التسجيل (ملف وكونسول)"""
        # إزالة المعالجات الموجودة لتجنب التكرار
        if self.logger.handlers:
            for handler in self.logger.handlers[:]:
                self.logger.removeHandler(handler)
                handler.close()

        # معالج الملف
        log_dir = Path("logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"google_ads_fetcher_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding='utf-8'
        )
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)

        # معالج الكونسول (Rich Console)
        console_handler = RichHandler(console=self.console, show_time=True, show_level=True, show_path=False)
        console_formatter = logging.Formatter(
            '%(message)s'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

    def get_logger(self):
        """إرجاع كائن المسجل"""
        return self.logger

# ===========================================
# END OF PART 3
# نهاية الجزء الثالث
# ===========================================
# ===========================================
# PART 4: ERROR HANDLING AND CIRCUIT BREAKER
# الجزء الرابع: إدارة الأخطاء و Circuit Breaker
# ===========================================

class GoogleAdsCircuitBreaker(pybreaker.CircuitBreaker):
    """Circuit Breaker مخصص لـ Google Ads API"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("GoogleAdsFetcher")

    def call(self, func, *args, **kwargs):
        try:
            return super().call(func, *args, **kwargs)
        except pybreaker.CircuitBreakerError:
            self.logger.error("Circuit breaker is OPEN! Preventing further calls to Google Ads API.")
            raise
        except Exception as e:
            self.logger.error(f"Call failed, attempting to break circuit: {e}")
            self.fail()
            raise

class ErrorHandler:
    """معالج الأخطاء مع إعادة المحاولة الذكية"""
    def __init__(self, config: Dict, logger: logging.Logger):
        self.config = config
        self.logger = logger
        self.max_retries = self.config.get("error_handling.max_retry_attempts", 5)
        self.initial_delay = self.config.get("error_handling.initial_retry_delay_seconds", 1)
        self.max_delay = self.config.get("error_handling.max_retry_delay_seconds", 300)
        self.retry_on_errors = self.config.get("error_handling.retry_on_errors", [])
        self.circuit_breaker_enabled = self.config.get("circuit_breaker.enabled", False)
        
        if self.circuit_breaker_enabled:
            self.circuit_breaker = GoogleAdsCircuitBreaker(
                fail_max=self.config.get("circuit_breaker.failure_threshold", 5),
                reset_timeout=self.config.get("circuit_breaker.recovery_timeout_seconds", 300),
                exclude=[GoogleAdsException] # لا تكسر الدائرة إذا كان الخطأ من GoogleAdsException
            )
        else:
            self.circuit_breaker = None

    def handle_error(self, func, *args, **kwargs):
        """معالجة الأخطاء مع إعادة المحاولة"""
        for attempt in range(self.max_retries):
            try:
                if self.circuit_breaker_enabled:
                    return self.circuit_breaker.call(func, *args, **kwargs)
                else:
                    return func(*args, **kwargs)
            except GoogleAdsException as ex:
                self.logger.warning(f"Google Ads API Error (Attempt {attempt + 1}/{self.max_retries}): {ex}")
                if self._should_retry(ex) and attempt < self.max_retries - 1:
                    delay = self._calculate_delay(attempt)
                    self.logger.info(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                else:
                    self.logger.error(f"Max retries reached or unretryable error: {ex}")
                    raise
            except pybreaker.CircuitBreakerError:
                self.logger.error("Circuit breaker is open. Not attempting call.")
                raise
            except Exception as ex:
                self.logger.error(f"An unexpected error occurred (Attempt {attempt + 1}/{self.max_retries}): {ex}")
                if attempt < self.max_retries - 1:
                    delay = self._calculate_delay(attempt)
                    self.logger.info(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
                else:
                    raise
        raise Exception("Failed after multiple retries.")

    def _should_retry(self, exception: GoogleAdsException) -> bool:
        """تحديد ما إذا كان يجب إعادة المحاولة بناءً على نوع الخطأ"""
        error_code = exception.error.code().name if hasattr(exception.error, 'code') else None
        if error_code and error_code in self.retry_on_errors:
            return True
        
        # تحقق من الأخطاء الشائعة التي يمكن إعادة محاولتها
        for detail in exception.failure.errors:
            if detail.error_code.quota_error == self.client.get_type("QuotaErrorEnum").QuotaError.RESOURCE_EXHAUSTED:
                return True
            if detail.error_code.rate_limit_error == self.client.get_type("RateLimitErrorEnum").RateLimitError.RATE_LIMITED:
                return True
            if detail.error_code.internal_error == self.client.get_type("InternalErrorEnum").InternalError.INTERNAL_ERROR:
                return True
            if detail.error_code.request_error == self.client.get_type("RequestErrorEnum").RequestError.TOO_MANY_REQUESTS:
                return True
        return False

    def _calculate_delay(self, attempt: int) -> float:
        """حساب تأخير إعادة المحاولة باستخدام استراتيجية الأس الأسي"""
        delay = min(self.max_delay, self.initial_delay * (2 ** attempt))
        return delay + (delay * 0.1 * (2 * np.random.random() - 1)) # إضافة Jitter

# ===========================================
# END OF PART 4
# نهاية الجزء الرابع
# ===========================================

# ===========================================
# PART 5: MAIN DATA FETCHER CLASS - FIXED
# الجزء الخامس: الفئة الرئيسية لجلب البيانات - مُصحح
# ===========================================

class GoogleAdsMCCFetcher:
    """فئة لجلب البيانات من Google Ads API لحسابات MCC مع ميزات متقدمة."""

    def __init__(self, config_file: str = "ads_config.yaml"):
        self.console = Console()
        self.config_manager = ConfigManager(config_file)
        self.config = self.config_manager.config
        
        self.logger_manager = LoggerManager(self.config)
        self.logger = self.logger_manager.get_logger()
        
        self.error_handler = ErrorHandler(self.config, self.logger)

        self.client = self._initialize_google_ads_client()
        self.mcc_customer_id = self.config_manager.get("login_customer_id")
        self.login_customer_id = self.config_manager.get("login_customer_id", self.mcc_customer_id)

        self.data_dir = Path("google_ads_data")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.clients_dir = self.data_dir / "clients"
        self.clients_dir.mkdir(parents=True, exist_ok=True)

        self.success_log = []
        self.error_log = []

        self.executor = ThreadPoolExecutor(max_workers=os.cpu_count() * 2)

        self.logger.info("GoogleAdsMCCFetcher initialized.")

    def _initialize_google_ads_client(self) -> GoogleAdsClient:
        """تهيئة عميل Google Ads API - FIXED: إضافة use_proto_plus"""
        try:
            # إجبار استخدام proto_plus - FIXED
            import os
            os.environ['GOOGLE_ADS_USE_PROTO_PLUS'] = 'True'
            
            self.logger.info("Initializing Google Ads client...")
            
            # إنشاء قاموس الإعدادات مع use_proto_plus - FIXED
            config_dict = {
                "developer_token": self.config_manager.get("developer_token"),
                "client_id": self.config_manager.get("client_id"),
                "client_secret": self.config_manager.get("client_secret"),
                "refresh_token": self.config_manager.get("refresh_token"),
                "login_customer_id": self.config_manager.get("login_customer_id"),
                "use_proto_plus": True  # إضافة مباشرة - FIXED
            }
            
            client = GoogleAdsClient.load_from_dict(config_dict)
            self.logger.info("Google Ads client initialized successfully.")
            return client
        except Exception as e:
            self.logger.critical(f"Failed to initialize Google Ads client: {e}")
            sys.exit(1)

    def _execute_query(self, query: str, description: str, customer_id: str) -> List[Dict]:
        """تنفيذ الاستعلام الأساسي - FIXED: إزالة page_size"""
        try:
            self.logger.info(f"Executing query: {description} for customer: {customer_id}")
            start_time = time.time()
            
            ga_service = self.client.get_service("GoogleAdsService")
            
            # تنفيذ الاستعلام بدون page_size (FIXED)
            response = ga_service.search(customer_id=customer_id, query=query)
            
            results = []
            for row in response:
                row_dict = {}
                for field in row._pb.DESCRIPTOR.fields:
                    field_name = field.name
                    if hasattr(row, field_name):
                        value = getattr(row, field_name)
                        if hasattr(value, '_pb'):
                            # Convert protobuf message to dict
                            row_dict[field_name] = self._protobuf_to_dict(value._pb)
                        else:
                            row_dict[field_name] = value
                results.append(row_dict)
            
            execution_time = time.time() - start_time
            self.logger.info(f"Query '{description}' completed in {execution_time:.2f}s, returned {len(results)} rows")
            
            self.success_log.append({
                "timestamp": datetime.now().isoformat(),
                "query": description,
                "customer_id": customer_id,
                "execution_time": execution_time,
                "rows_returned": len(results)
            })
            
            return results
            
        except Exception as ex:
            self.logger.error(f"Error executing query '{description}' for customer {customer_id}: {ex}")
            raise ex

    def _protobuf_to_dict(self, pb_obj) -> Dict:
        """تحويل كائن protobuf إلى قاموس"""
        result = {}
        for field, value in pb_obj.ListFields():
            if field.label == field.LABEL_REPEATED:
                result[field.name] = [self._protobuf_to_dict(item) if hasattr(item, 'ListFields') else item for item in value]
            elif hasattr(value, 'ListFields'):
                result[field.name] = self._protobuf_to_dict(value)
            else:
                result[field.name] = value
        return result

    def _execute_query_with_retries(self, query: str, description: str, customer_id: str) -> List[Dict]:
        """تنفيذ الاستعلام مع إعادة المحاولة ومعالجة الأخطاء."""
        return self.error_handler.handle_error(self._execute_query, query, description, customer_id)

    def fetch_client_accounts(self) -> List[Dict]:
        """جلب قائمة بجميع حسابات العملاء المرتبطة بحساب MCC."""
        query = """
            SELECT
                customer_client.client_customer, 
                customer_client.id, 
                customer_client.descriptive_name, 
                customer_client.currency_code, 
                customer_client.time_zone, 
                customer_client.manager, 
                customer_client.test_account, 
                customer_client.status
            FROM customer_client
            WHERE customer_client.manager = FALSE
            AND customer_client.status = 'ENABLED'
        """
        self.logger.info(f"Fetching client accounts for MCC: {self.mcc_customer_id}")
        try:
            # استخدام login_customer_id لجلب العملاء المرتبطين بالـ MCC
            client_accounts = self._execute_query_with_retries(
                query, "Client Accounts", self.login_customer_id
            )
            self.logger.info(f"Successfully fetched {len(client_accounts)} client accounts.")
            return client_accounts
        except GoogleAdsException as ex:
            self.logger.error(f"Error fetching client accounts: {ex}")
            if ex.error.code().name == "CUSTOMER_NOT_FOUND":
                self.logger.error("The provided login_customer_id or customer_id might be incorrect or not accessible.")
            return []
        except Exception as e:
            self.logger.error(f"An unexpected error occurred while fetching client accounts: {e}")
            return []

    def fetch_campaign_data(self, customer_id: str) -> List[Dict]:
        """جلب بيانات الحملات الإعلانية لعميل معين."""
        query = """
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.advertising_channel_type,
                campaign.start_date,
                campaign.end_date,
                campaign.campaign_budget.amount_micros,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.ctr,
                metrics.average_cpc,
                metrics.average_cpm
            FROM campaign
            WHERE campaign.status IN ('ENABLED', 'PAUSED')
            AND segments.date DURING LAST_30_DAYS
        """
        self.logger.info(f"Fetching campaign data for customer: {customer_id}")
        try:
            campaign_data = self._execute_query_with_retries(
                query, "Campaign Data", customer_id
            )
            self.logger.info(f"Successfully fetched {len(campaign_data)} campaigns for customer {customer_id}.")
            return campaign_data
        except Exception as e:
            self.logger.error(f"Error fetching campaign data for {customer_id}: {e}")
            return []

    def fetch_ad_group_data(self, customer_id: str) -> List[Dict]:
        """جلب بيانات المجموعات الإعلانية لعميل معين."""
        query = """
            SELECT
                ad_group.id,
                ad_group.name,
                ad_group.status,
                ad_group.type,
                campaign.id,
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.ctr
            FROM ad_group
            WHERE ad_group.status IN ('ENABLED', 'PAUSED')
            AND segments.date DURING LAST_30_DAYS
        """
        self.logger.info(f"Fetching ad group data for customer: {customer_id}")
        try:
            ad_group_data = self._execute_query_with_retries(
                query, "Ad Group Data", customer_id
            )
            self.logger.info(f"Successfully fetched {len(ad_group_data)} ad groups for customer {customer_id}.")
            return ad_group_data
        except Exception as e:
            self.logger.error(f"Error fetching ad group data for {customer_id}: {e}")
            return []

    def fetch_keyword_data(self, customer_id: str) -> List[Dict]:
        """جلب بيانات الكلمات المفتاحية لعميل معين."""
        query = """
            SELECT
                ad_group_criterion.keyword.text,
                ad_group_criterion.keyword.match_type,
                ad_group_criterion.status,
                ad_group.name,
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.ctr
            FROM keyword_view
            WHERE ad_group_criterion.status IN ('ENABLED', 'PAUSED')
            AND segments.date DURING LAST_30_DAYS
        """
        self.logger.info(f"Fetching keyword data for customer: {customer_id}")
        try:
            keyword_data = self._execute_query_with_retries(
                query, "Keyword Data", customer_id
            )
            self.logger.info(f"Successfully fetched {len(keyword_data)} keywords for customer {customer_id}.")
            return keyword_data
        except Exception as e:
            self.logger.error(f"Error fetching keyword data for {customer_id}: {e}")
            return []

    def fetch_ad_data(self, customer_id: str) -> List[Dict]:
        """جلب بيانات الإعلانات لعميل معين."""
        query = """
            SELECT
                ad_group_ad.ad.id,
                ad_group_ad.ad.name,
                ad_group_ad.status,
                ad_group.name,
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.ctr
            FROM ad_group_ad
            WHERE ad_group_ad.status IN ('ENABLED', 'PAUSED')
            AND segments.date DURING LAST_30_DAYS
        """
        self.logger.info(f"Fetching ad data for customer: {customer_id}")
        try:
            ad_data = self._execute_query_with_retries(
                query, "Ad Data", customer_id
            )
            self.logger.info(f"Successfully fetched {len(ad_data)} ads for customer {customer_id}.")
            return ad_data
        except Exception as e:
            self.logger.error(f"Error fetching ad data for {customer_id}: {e}")
            return []

    def fetch_all_data_for_client(self, client_info: Dict) -> Dict:
        """جلب جميع البيانات المتاحة لعميل واحد."""
        customer_id = client_info.get('customer_client', {}).get('id')
        client_name = client_info.get('customer_client', {}).get('descriptive_name', f'Client_{customer_id}')
        self.logger.info(f"Starting data fetch for client: {client_name} (ID: {customer_id})")

        client_data = {
            "client_info": client_info,
            "campaigns": [],
            "ad_groups": [],
            "keywords": [],
            "ads": []
        }

        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                transient=True
            ) as progress:
                tasks = [
                    progress.add_task(f"[cyan]Fetching campaigns for {client_name}...[/cyan]", total=1),
                    progress.add_task(f"[cyan]Fetching ad groups for {client_name}...[/cyan]", total=1),
                    progress.add_task(f"[cyan]Fetching keywords for {client_name}...[/cyan]", total=1),
                    progress.add_task(f"[cyan]Fetching ads for {client_name}...[/cyan]", total=1)
                ]

                futures = {
                    self.executor.submit(self.fetch_campaign_data, customer_id): "campaigns",
                    self.executor.submit(self.fetch_ad_group_data, customer_id): "ad_groups",
                    self.executor.submit(self.fetch_keyword_data, customer_id): "keywords",
                    self.executor.submit(self.fetch_ad_data, customer_id): "ads"
                }

                for future in as_completed(futures):
                    data_type = futures[future]
                    try:
                        client_data[data_type] = future.result()
                        progress.update(tasks[["campaigns", "ad_groups", "keywords", "ads"].index(data_type)], completed=1)
                    except Exception as e:
                        self.logger.error(f"Error fetching {data_type} for {client_name}: {e}")
                        progress.update(tasks[["campaigns", "ad_groups", "keywords", "ads"].index(data_type)], completed=1)

            self.logger.info(f"Finished data fetch for client: {client_name} (ID: {customer_id})")
            return client_data
        except Exception as e:
            self.logger.error(f"An error occurred during parallel data fetch for {client_name}: {e}")
            return client_data

    def fetch_all_mcc_data(self) -> List[Dict]:
        """جلب جميع البيانات لجميع العملاء تحت حساب MCC."""
        self.console.print(Panel("[bold blue]Starting Google Ads Data Fetch for MCC Account[/bold blue]", expand=False))
        all_clients_data = []

        client_accounts = self.fetch_client_accounts()
        if not client_accounts:
            self.console.print("[red]No client accounts found or accessible.[/red]")
            return []

        self.console.print(f"[green]Found {len(client_accounts)} client accounts.[/green]")

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            "[progress.percentage]{task.percentage:>3.0f}%",
            TextColumn("[bold green]{task.completed}/{task.total} clients processed[/bold green]"),
            transient=False
        ) as progress:
            main_task = progress.add_task("[bold magenta]Processing clients...[/bold magenta]", total=len(client_accounts))

            futures = {
                self.executor.submit(self.fetch_all_data_for_client, client_info): client_info
                for client_info in client_accounts
            }

            for future in as_completed(futures):
                client_info = futures[future]
                client_name = client_info.get('customer_client', {}).get('descriptive_name', 'Unknown Client')
                try:
                    client_data = future.result()
                    all_clients_data.append(client_data)
                    self.logger.info(f"Successfully processed data for client: {client_name}")
                except Exception as e:
                    self.logger.error(f"Error processing data for client {client_name}: {e}")
                    self.error_log.append({
                        "timestamp": datetime.now().isoformat(),
                        "client_name": client_name,
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    })
                progress.update(main_task, advance=1)

        self.console.print(Panel("[bold blue]Google Ads Data Fetch Completed![/bold blue]", expand=False))
        return all_clients_data

# ===========================================
# END OF PART 5 - FIXED
# نهاية الجزء الخامس - مُصحح
# ===========================================

# ===========================================
# PART 6: ADVANCED ANALYTICS AND AI FUNCTIONS
# الجزء السادس: دوال التحليل المتقدم والذكاء الاصطناعي
# ===========================================

    def fix_arabic_text(self, text):
        """إصلاح النص العربي للعرض الصحيح في المخططات - FIXED"""
        if not text or not isinstance(text, str):
            return text
        
        try:
            # إعادة تشكيل النص العربي
            reshaped_text = arabic_reshaper.reshape(text)
            
            # تطبيق خوارزمية الاتجاه الثنائي
            display_text = get_display(reshaped_text)
            
            return display_text
        except Exception as e:
            self.logger.warning(f"Error fixing Arabic text: {e}")
            return text

    def analyze_performance_trends(self, data: Dict, metric: str = "ctr") -> Dict:
        """تحليل اتجاهات الأداء باستخدام الذكاء الاصطناعي"""
        try:
            if not data or len(data) == 0:
                return {"error": "No data available for analysis"}
            
            df = pd.DataFrame(data)
            if 'segments' not in df.columns or metric not in df.columns:
                return {"error": f"Required columns not found in data"}
            
            # تحويل التواريخ
            df['date'] = pd.to_datetime(df['segments'].apply(lambda x: x.get('date') if isinstance(x, dict) else None))
            df = df.dropna(subset=['date'])
            df = df.sort_values('date')
            
            # حساب المتوسطات المتحركة
            df['ma_7'] = df[metric].rolling(window=7, min_periods=1).mean()
            df['ma_14'] = df[metric].rolling(window=14, min_periods=1).mean()
            df['ma_30'] = df[metric].rolling(window=30, min_periods=1).mean()
            
            # كشف الاتجاهات
            recent_trend = "stable"
            if len(df) >= 7:
                recent_avg = df[metric].tail(7).mean()
                previous_avg = df[metric].head(-7).tail(7).mean() if len(df) >= 14 else df[metric].head(7).mean()
                
                if recent_avg > previous_avg * 1.05:
                    recent_trend = "improving"
                elif recent_avg < previous_avg * 0.95:
                    recent_trend = "declining"
            
            # كشف الشذوذ باستخدام IQR
            Q1 = df[metric].quantile(0.25)
            Q3 = df[metric].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            anomalies = df[(df[metric] < lower_bound) | (df[metric] > upper_bound)]
            
            # إحصائيات متقدمة
            stats = {
                "metric": metric,
                "total_days": len(df),
                "current_value": float(df[metric].iloc[-1]) if len(df) > 0 else 0,
                "average": float(df[metric].mean()),
                "median": float(df[metric].median()),
                "std_deviation": float(df[metric].std()),
                "min_value": float(df[metric].min()),
                "max_value": float(df[metric].max()),
                "trend": recent_trend,
                "anomalies_count": len(anomalies),
                "volatility": float(df[metric].std() / df[metric].mean()) if df[metric].mean() != 0 else 0,
                "improvement_percentage": float(((df[metric].tail(7).mean() / df[metric].head(7).mean()) - 1) * 100) if len(df) >= 14 and df[metric].head(7).mean() != 0 else 0
            }
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Error analyzing performance trends: {e}")
            return {"error": str(e)}

    def generate_ai_insights(self, data_dict: Dict) -> Dict:
        """توليد رؤى وتوصيات باستخدام الذكاء الاصطناعي"""
        insights = {
            "recommendations": [],
            "alerts": [],
            "opportunities": []
        }

        # تحليل أداء الحملات
        if 'campaigns' in data_dict and data_dict['campaigns']:
            campaign_performance = self.analyze_performance_trends(data_dict['campaigns'], "clicks")
            if "error" not in campaign_performance:
                if campaign_performance["trend"] == "declining":
                    insights["alerts"].append({
                        "type": "performance_drop",
                        "message": f"أداء الحملات (النقرات) في انخفاض. متوسط النقرات الأخير: {campaign_performance['current_value']:.2f}",
                        "details": campaign_performance
                    })
                elif campaign_performance["trend"] == "improving":
                    insights["opportunities"].append({
                        "type": "performance_gain",
                        "message": f"أداء الحملات (النقرات) في تحسن. استمر في المراقبة.",
                        "details": campaign_performance
                    })
                
                if campaign_performance["volatility"] > 0.5: # مثال على عتبة التقلب
                    insights["alerts"].append({
                        "type": "high_volatility",
                        "message": f"تقلب كبير في أداء الحملات (النقرات). قد يشير إلى عدم استقرار.",
                        "details": campaign_performance
                    })

        # تحليل أداء الكلمات المفتاحية
        if 'keywords' in data_dict and data_dict['keywords']:
            keyword_performance = self.analyze_performance_trends(data_dict['keywords'], "impressions")
            if "error" not in keyword_performance:
                if keyword_performance["trend"] == "declining":
                    insights["alerts"].append({
                        "type": "keyword_performance_drop",
                        "message": f"أداء الكلمات المفتاحية (الانطباعات) في انخفاض. متوسط الانطباعات الأخير: {keyword_performance['current_value']:.2f}",
                        "details": keyword_performance
                    })
                
                if keyword_performance["anomalies_count"] > 0:
                    insights["alerts"].append({
                        "type": "keyword_anomalies",
                        "message": f"تم اكتشاف {keyword_performance['anomalies_count']} شذوذ في أداء الكلمات المفتاحية. يرجى المراجعة.",
                        "details": keyword_performance
                    })

        # تحليل ميزانية الحملات (مثال بسيط)
        if 'campaigns' in data_dict and data_dict['campaigns']:
            for campaign in data_dict['campaigns']:
                budget_amount = campaign.get('campaign_budget', {}).get('amount_micros', 0) / 1000000
                campaign_name = campaign.get('campaign', {}).get('name', 'N/A')
                
                if budget_amount > 0 and campaign.get('metrics', {}).get('cost_micros', 0) / 1000000 > budget_amount * 0.9:
                    insights["alerts"].append({
                        "type": "budget_nearly_exhausted",
                        "message": f"ميزانية الحملة '{self.fix_arabic_text(campaign_name)}' تقترب من النفاد.",
                        "details": {"campaign_name": campaign_name, "budget": budget_amount}
                    })

        # توصيات عامة بناءً على البيانات المتاحة
        if len(data_dict.get('campaigns', [])) > 0 and len(data_dict.get('keywords', [])) == 0:
            insights["recommendations"].append({
                "type": "missing_keywords",
                "message": "لا توجد كلمات مفتاحية نشطة. يرجى إضافة كلمات مفتاحية لتحسين الأداء.",
                "details": {}
            })

        if len(insights["recommendations"]) == 0 and len(insights["alerts"]) == 0 and len(insights["opportunities"]) == 0:
            insights["recommendations"].append({
                "type": "good_performance",
                "message": "الأداء العام جيد ولا توجد مشكلات ملحوظة حالياً.",
                "details": {}
            })

        return insights

    def create_visualizations(self, data_dict: Dict, client_name: str) -> List[str]:
        """إنشاء مخططات بيانية للعميل مع دعم النص العربي - FIXED"""
        try:
            visualization_files = []
            client_reports_dir = self.clients_dir / client_name / "reports"
            client_reports_dir.mkdir(parents=True, exist_ok=True)
            
            # إعداد الخط العربي - FIXED
            setup_arabic_font()
            
            # مخطط أداء الحملات
            if 'campaigns' in data_dict and data_dict['campaigns']:
                campaigns_df = pd.DataFrame(data_dict['campaigns'])
                
                # تأكد من وجود عمود metrics و campaign
                if 'metrics' in campaigns_df.columns and 'campaign' in campaigns_df.columns:
                    campaign_names = []
                    impressions = []
                    clicks = []
                    costs = []
                    
                    for idx, row in campaigns_df.iterrows():
                        campaign_name = row.get('campaign', {}).get('name', f'Campaign_{idx}')
                        metrics = row.get('metrics', {})
                        
                        if isinstance(metrics, dict):
                            # إصلاح النص العربي
                            fixed_name = self.fix_arabic_text(campaign_name[:20]) # قص الاسم الطويل
                            campaign_names.append(fixed_name)
                            impressions.append(metrics.get('impressions', 0))
                            clicks.append(metrics.get('clicks', 0))
                            costs.append(metrics.get('cost_micros', 0) / 1000000) # تحويل من ميكرو إلى عملة
                    
                    if campaign_names and any(impressions):
                        # مخطط الانطباعات
                        plt.figure(figsize=(12, 6))
                        plt.bar(campaign_names[:10], impressions[:10], color='skyblue', alpha=0.7)
                        
                        # إصلاح العناوين العربية
                        title = self.fix_arabic_text(f'أداء الحملات - الانطباعات ({client_name})')
                        xlabel = self.fix_arabic_text('الحملات')
                        ylabel = self.fix_arabic_text('عدد الانطباعات')
                        
                        plt.title(title, fontsize=14, fontweight='bold')
                        plt.xlabel(xlabel)
                        plt.ylabel(ylabel)
                        plt.xticks(rotation=45, ha='right')
                        plt.grid(True, alpha=0.3)
                        plt.tight_layout()
                        
                        viz_filename = f"campaigns_impressions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                        viz_path = client_reports_dir / viz_filename
                        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
                        plt.close()
                        
                        visualization_files.append(str(viz_path))
                        self.logger.info(f"Campaign impressions visualization saved: {viz_path}")

                    if campaign_names and any(clicks):
                        # مخطط النقرات
                        plt.figure(figsize=(12, 6))
                        plt.bar(campaign_names[:10], clicks[:10], color='lightcoral', alpha=0.7)
                        
                        # إصلاح العناوين العربية
                        title = self.fix_arabic_text(f'أداء الحملات - النقرات ({client_name})')
                        xlabel = self.fix_arabic_text('الحملات')
                        ylabel = self.fix_arabic_text('عدد النقرات')
                        
                        plt.title(title, fontsize=14, fontweight='bold')
                        plt.xlabel(xlabel)
                        plt.ylabel(ylabel)
                        plt.xticks(rotation=45, ha='right')
                        plt.grid(True, alpha=0.3)
                        plt.tight_layout()
                        
                        viz_filename = f"campaigns_clicks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                        viz_path = client_reports_dir / viz_filename
                        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
                        plt.close()
                        
                        visualization_files.append(str(viz_path))
                        self.logger.info(f"Campaign clicks visualization saved: {viz_path}")

                    if campaign_names and any(costs):
                        # مخطط التكلفة
                        plt.figure(figsize=(12, 6))
                        plt.bar(campaign_names[:10], costs[:10], color='lightgreen', alpha=0.7)
                        
                        # إصلاح العناوين العربية
                        title = self.fix_arabic_text(f'أداء الحملات - التكلفة ({client_name})')
                        xlabel = self.fix_arabic_text('الحملات')
                        ylabel = self.fix_arabic_text('التكلفة (بالعملة المحلية)')
                        
                        plt.title(title, fontsize=14, fontweight='bold')
                        plt.xlabel(xlabel)
                        plt.ylabel(ylabel)
                        plt.xticks(rotation=45, ha='right')
                        plt.grid(True, alpha=0.3)
                        plt.tight_layout()
                        
                        viz_filename = f"campaigns_cost_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                        viz_path = client_reports_dir / viz_filename
                        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
                        plt.close()
                        
                        visualization_files.append(str(viz_path))
                        self.logger.info(f"Campaign cost visualization saved: {viz_path}")

            # مخطط أداء الكلمات المفتاحية (أعلى 10 كلمات حسب النقرات)
            if 'keywords' in data_dict and data_dict['keywords']:
                keywords_df = pd.DataFrame(data_dict['keywords'])
                if 'metrics' in keywords_df.columns and 'ad_group_criterion' in keywords_df.columns:
                    keyword_data = []
                    for idx, row in keywords_df.iterrows():
                        keyword_text = row.get('ad_group_criterion', {}).get('keyword', {}).get('text', f'Keyword_{idx}')
                        metrics = row.get('metrics', {})
                        if isinstance(metrics, dict):
                            keyword_data.append({
                                'text': keyword_text,
                                'clicks': metrics.get('clicks', 0),
                                'impressions': metrics.get('impressions', 0)
                            })
                    
                    if keyword_data:
                        keyword_df_processed = pd.DataFrame(keyword_data)
                        keyword_df_processed = keyword_df_processed.sort_values(by='clicks', ascending=False).head(10)
                        
                        if not keyword_df_processed.empty:
                            # إصلاح النصوص العربية للكلمات المفتاحية
                            keyword_df_processed['text_fixed'] = keyword_df_processed['text'].apply(self.fix_arabic_text)

                            plt.figure(figsize=(12, 6))
                            plt.bar(keyword_df_processed['text_fixed'], keyword_df_processed['clicks'], color='purple', alpha=0.7)
                            
                            # إصلاح العناوين العربية
                            title = self.fix_arabic_text(f'أعلى 10 كلمات مفتاحية حسب النقرات ({client_name})')
                            xlabel = self.fix_arabic_text('الكلمة المفتاحية')
                            ylabel = self.fix_arabic_text('عدد النقرات')
                            
                            plt.title(title, fontsize=14, fontweight='bold')
                            plt.xlabel(xlabel)
                            plt.ylabel(ylabel)
                            plt.xticks(rotation=45, ha='right')
                            plt.grid(True, alpha=0.3)
                            plt.tight_layout()
                            
                            viz_filename = f"keywords_top_clicks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                            viz_path = client_reports_dir / viz_filename
                            plt.savefig(viz_path, dpi=300, bbox_inches='tight')
                            plt.close()
                            
                            visualization_files.append(str(viz_path))
                            self.logger.info(f"Top keywords clicks visualization saved: {viz_path}")

            return visualization_files
            
        except Exception as e:
            self.logger.error(f"Error creating visualizations for {client_name}: {e}")
            return []

# ===========================================
# END OF PART 6
# نهاية الجزء السادس
# ===========================================

# ===========================================
# PART 7: EXPORT AND REPORT GENERATION FUNCTIONS
# الجزء السابع: دوال التصدير وإنشاء التقارير
# ===========================================

    def export_to_excel(self, data_dict: Dict, client_name: str) -> str:
        """تصدير البيانات إلى ملف Excel"""
        try:
            client_data_dir = self.clients_dir / client_name
            client_data_dir.mkdir(parents=True, exist_ok=True)
            
            excel_filename = f"{client_name}_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            excel_path = client_data_dir / excel_filename
            
            with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
                # معلومات العميل
                if 'client_info' in data_dict:
                    client_info_df = pd.json_normalize(data_dict['client_info'])
                    client_info_df.to_excel(writer, sheet_name='Client_Info', index=False)
                
                # بيانات الحملات
                if 'campaigns' in data_dict and data_dict['campaigns']:
                    campaigns_df = pd.json_normalize(data_dict['campaigns'])
                    campaigns_df.to_excel(writer, sheet_name='Campaigns', index=False)
                
                # بيانات المجموعات الإعلانية
                if 'ad_groups' in data_dict and data_dict['ad_groups']:
                    ad_groups_df = pd.json_normalize(data_dict['ad_groups'])
                    ad_groups_df.to_excel(writer, sheet_name='Ad_Groups', index=False)
                
                # بيانات الكلمات المفتاحية
                if 'keywords' in data_dict and data_dict['keywords']:
                    keywords_df = pd.json_normalize(data_dict['keywords'])
                    keywords_df.to_excel(writer, sheet_name='Keywords', index=False)
                
                # بيانات الإعلانات
                if 'ads' in data_dict and data_dict['ads']:
                    ads_df = pd.json_normalize(data_dict['ads'])
                    ads_df.to_excel(writer, sheet_name='Ads', index=False)
            
            self.logger.info(f"Excel file exported successfully: {excel_path}")
            return str(excel_path)
            
        except Exception as e:
            self.logger.error(f"Error exporting to Excel for {client_name}: {e}")
            return ""

    def export_to_csv(self, data_dict: Dict, client_name: str) -> List[str]:
        """تصدير البيانات إلى ملفات CSV منفصلة"""
        try:
            client_data_dir = self.clients_dir / client_name / "csv"
            client_data_dir.mkdir(parents=True, exist_ok=True)
            
            csv_files = []
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # تصدير كل نوع بيانات إلى ملف CSV منفصل
            data_types = ['client_info', 'campaigns', 'ad_groups', 'keywords', 'ads']
            
            for data_type in data_types:
                if data_type in data_dict and data_dict[data_type]:
                    df = pd.json_normalize(data_dict[data_type])
                    csv_filename = f"{client_name}_{data_type}_{timestamp}.csv"
                    csv_path = client_data_dir / csv_filename
                    df.to_csv(csv_path, index=False, encoding='utf-8-sig')
                    csv_files.append(str(csv_path))
                    self.logger.info(f"CSV file exported: {csv_path}")
            
            return csv_files
            
        except Exception as e:
            self.logger.error(f"Error exporting to CSV for {client_name}: {e}")
            return []

    def export_to_json(self, data_dict: Dict, client_name: str) -> str:
        """تصدير البيانات إلى ملف JSON"""
        try:
            client_data_dir = self.clients_dir / client_name
            client_data_dir.mkdir(parents=True, exist_ok=True)
            
            json_filename = f"{client_name}_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            json_path = client_data_dir / json_filename
            
            # تحويل البيانات إلى تنسيق قابل للتسلسل
            serializable_data = self._make_serializable(data_dict)
            
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(serializable_data, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"JSON file exported successfully: {json_path}")
            return str(json_path)
            
        except Exception as e:
            self.logger.error(f"Error exporting to JSON for {client_name}: {e}")
            return ""

    def _make_serializable(self, obj):
        """تحويل الكائنات إلى تنسيق قابل للتسلسل في JSON"""
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif hasattr(obj, '__dict__'):
            return self._make_serializable(obj.__dict__)
        elif isinstance(obj, (int, float, str, bool)) or obj is None:
            return obj
        else:
            return str(obj)

    def generate_html_report(self, data_dict: Dict, client_name: str, ai_insights: Dict, visualization_files: List[str]) -> str:
        """إنشاء تقرير HTML تفاعلي"""
        try:
            client_reports_dir = self.clients_dir / client_name / "reports"
            client_reports_dir.mkdir(parents=True, exist_ok=True)
            
            html_filename = f"{client_name}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            html_path = client_reports_dir / html_filename
            
            # إنشاء محتوى HTML
            html_content = self._create_html_content(data_dict, client_name, ai_insights, visualization_files)
            
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            self.logger.info(f"HTML report generated successfully: {html_path}")
            return str(html_path)
            
        except Exception as e:
            self.logger.error(f"Error generating HTML report for {client_name}: {e}")
            return ""

    def _create_html_content(self, data_dict: Dict, client_name: str, ai_insights: Dict, visualization_files: List[str]) -> str:
        """إنشاء محتوى HTML للتقرير"""
        
        # معلومات العميل
        client_info = data_dict.get('client_info', {}).get('customer_client', {})
        customer_id = client_info.get('id', 'N/A')
        currency = client_info.get('currency_code', 'N/A')
        timezone = client_info.get('time_zone', 'N/A')
        
        # إحصائيات سريعة
        campaigns_count = len(data_dict.get('campaigns', []))
        ad_groups_count = len(data_dict.get('ad_groups', []))
        keywords_count = len(data_dict.get('keywords', []))
        ads_count = len(data_dict.get('ads', []))
        
        # حساب المجاميع
        total_impressions = sum(campaign.get('metrics', {}).get('impressions', 0) for campaign in data_dict.get('campaigns', []))
        total_clicks = sum(campaign.get('metrics', {}).get('clicks', 0) for campaign in data_dict.get('campaigns', []))
        total_cost = sum(campaign.get('metrics', {}).get('cost_micros', 0) for campaign in data_dict.get('campaigns', [])) / 1000000
        
        # محتوى HTML
        html_content = f"""
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير Google Ads - {client_name}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4285f4;
        }}
        .header h1 {{
            color: #4285f4;
            margin: 0;
            font-size: 2.5em;
        }}
        .header p {{
            color: #666;
            margin: 10px 0;
            font-size: 1.1em;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }}
        .stat-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }}
        .stat-card h3 {{
            margin: 0 0 10px 0;
            font-size: 2em;
        }}
        .stat-card p {{
            margin: 0;
            opacity: 0.9;
        }}
        .section {{
            margin: 30px 0;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 8px;
        }}
        .section h2 {{
            color: #333;
            border-bottom: 2px solid #4285f4;
            padding-bottom: 10px;
        }}
        .insights {{
            margin: 20px 0;
        }}
        .insight-item {{
            background-color: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #4285f4;
        }}
        .alert {{
            border-left-color: #ea4335;
            background-color: #fef7f7;
        }}
        .opportunity {{
            border-left-color: #34a853;
            background-color: #f7fef7;
        }}
        .recommendation {{
            border-left-color: #fbbc04;
            background-color: #fffef7;
        }}
        .visualizations {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        .viz-item {{
            text-align: center;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .viz-item img {{
            max-width: 100%;
            height: auto;
            border-radius: 5px;
        }}
        .footer {{
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تقرير Google Ads</h1>
            <p><strong>العميل:</strong> {client_name}</p>
            <p><strong>معرف العميل:</strong> {customer_id}</p>
            <p><strong>العملة:</strong> {currency} | <strong>المنطقة الزمنية:</strong> {timezone}</p>
            <p><strong>تاريخ التقرير:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>{campaigns_count}</h3>
                <p>الحملات الإعلانية</p>
            </div>
            <div class="stat-card">
                <h3>{ad_groups_count}</h3>
                <p>المجموعات الإعلانية</p>
            </div>
            <div class="stat-card">
                <h3>{keywords_count}</h3>
                <p>الكلمات المفتاحية</p>
            </div>
            <div class="stat-card">
                <h3>{ads_count}</h3>
                <p>الإعلانات</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>{total_impressions:,}</h3>
                <p>إجمالي الانطباعات</p>
            </div>
            <div class="stat-card">
                <h3>{total_clicks:,}</h3>
                <p>إجمالي النقرات</p>
            </div>
            <div class="stat-card">
                <h3>{total_cost:,.2f}</h3>
                <p>إجمالي التكلفة ({currency})</p>
            </div>
            <div class="stat-card">
                <h3>{(total_clicks/total_impressions*100) if total_impressions > 0 else 0:.2f}%</h3>
                <p>معدل النقر (CTR)</p>
            </div>
        </div>
"""

        # إضافة رؤى الذكاء الاصطناعي
        if ai_insights:
            html_content += """
        <div class="section">
            <h2>🤖 رؤى الذكاء الاصطناعي</h2>
            <div class="insights">
"""
            
            # التنبيهات
            for alert in ai_insights.get('alerts', []):
                html_content += f"""
                <div class="insight-item alert">
                    <strong>⚠️ تنبيه:</strong> {alert.get('message', '')}
                </div>
"""
            
            # الفرص
            for opportunity in ai_insights.get('opportunities', []):
                html_content += f"""
                <div class="insight-item opportunity">
                    <strong>🚀 فرصة:</strong> {opportunity.get('message', '')}
                </div>
"""
            
            # التوصيات
            for recommendation in ai_insights.get('recommendations', []):
                html_content += f"""
                <div class="insight-item recommendation">
                    <strong>💡 توصية:</strong> {recommendation.get('message', '')}
                </div>
"""
            
            html_content += """
            </div>
        </div>
"""

        # إضافة المخططات البيانية
        if visualization_files:
            html_content += """
        <div class="section">
            <h2>📊 المخططات البيانية</h2>
            <div class="visualizations">
"""
            
            for viz_file in visualization_files:
                viz_filename = Path(viz_file).name
                # تحويل المسار إلى مسار نسبي للعرض في HTML
                relative_path = viz_filename
                html_content += f"""
                <div class="viz-item">
                    <img src="{relative_path}" alt="مخطط بياني">
                    <p>{viz_filename}</p>
                </div>
"""
            
            html_content += """
            </div>
        </div>
"""

        # إضافة الخاتمة
        html_content += """
        <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة Google Ads MCC Data Fetcher - AI Edition</p>
            <p>© 2024 جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
"""
        
        return html_content

    def save_client_data(self, client_data: Dict, client_name: str) -> Dict[str, str]:
        """حفظ بيانات العميل بجميع التنسيقات"""
        saved_files = {}
        
        try:
            # إنشاء رؤى الذكاء الاصطناعي
            ai_insights = self.generate_ai_insights(client_data)
            
            # إنشاء المخططات البيانية
            visualization_files = self.create_visualizations(client_data, client_name)
            
            # تصدير البيانات
            excel_file = self.export_to_excel(client_data, client_name)
            if excel_file:
                saved_files['excel'] = excel_file
            
            csv_files = self.export_to_csv(client_data, client_name)
            if csv_files:
                saved_files['csv'] = csv_files
            
            json_file = self.export_to_json(client_data, client_name)
            if json_file:
                saved_files['json'] = json_file
            
            # إنشاء تقرير HTML
            html_report = self.generate_html_report(client_data, client_name, ai_insights, visualization_files)
            if html_report:
                saved_files['html_report'] = html_report
            
            if visualization_files:
                saved_files['visualizations'] = visualization_files
            
            self.logger.info(f"All data saved successfully for client: {client_name}")
            return saved_files
            
        except Exception as e:
            self.logger.error(f"Error saving client data for {client_name}: {e}")
            return {}

# ===========================================
# END OF PART 7
# نهاية الجزء السابع
# ===========================================

# ===========================================
# PART 8: MAIN FUNCTION AND PROGRAM EXECUTION
# الجزء الثامن والأخير: الدالة الرئيسية وتشغيل البرنامج
# ===========================================

    def run_full_data_fetch(self) -> Dict:
        """تشغيل عملية جلب البيانات الكاملة لجميع العملاء"""
        start_time = time.time()
        
        self.console.print(Panel.fit(
            "[bold blue]🚀 بدء عملية جلب البيانات الشاملة من Google Ads MCC[/bold blue]",
            border_style="blue"
        ))
        
        try:
            # جلب جميع بيانات العملاء
            all_clients_data = self.fetch_all_mcc_data()
            
            if not all_clients_data:
                self.console.print("[red]❌ لم يتم العثور على بيانات للمعالجة[/red]")
                return {"success": False, "message": "No data found"}
            
            # معالجة وحفظ بيانات كل عميل
            processed_clients = []
            failed_clients = []
            
            self.console.print(f"\n[cyan]📊 معالجة وحفظ بيانات {len(all_clients_data)} عميل...[/cyan]")
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                "[progress.percentage]{task.percentage:>3.0f}%",
                TextColumn("[bold green]{task.completed}/{task.total} clients saved[/bold green]"),
                transient=False
            ) as progress:
                save_task = progress.add_task("[bold magenta]حفظ البيانات...[/bold magenta]", total=len(all_clients_data))
                
                for client_data in all_clients_data:
                    client_info = client_data.get('client_info', {}).get('customer_client', {})
                    client_name = client_info.get('descriptive_name', f"Client_{client_info.get('id', 'Unknown')}")
                    
                    try:
                        saved_files = self.save_client_data(client_data, client_name)
                        if saved_files:
                            processed_clients.append({
                                "client_name": client_name,
                                "client_id": client_info.get('id'),
                                "saved_files": saved_files,
                                "campaigns_count": len(client_data.get('campaigns', [])),
                                "keywords_count": len(client_data.get('keywords', [])),
                                "ads_count": len(client_data.get('ads', []))
                            })
                            self.logger.info(f"✅ تم حفظ بيانات العميل: {client_name}")
                        else:
                            failed_clients.append(client_name)
                            self.logger.warning(f"⚠️ فشل في حفظ بيانات العميل: {client_name}")
                    except Exception as e:
                        failed_clients.append(client_name)
                        self.logger.error(f"❌ خطأ في معالجة العميل {client_name}: {e}")
                    
                    progress.update(save_task, advance=1)
            
            # إنشاء تقرير شامل
            summary_report = self._create_summary_report(processed_clients, failed_clients)
            
            execution_time = time.time() - start_time
            
            # عرض النتائج النهائية
            self._display_final_results(processed_clients, failed_clients, execution_time)
            
            return {
                "success": True,
                "processed_clients": len(processed_clients),
                "failed_clients": len(failed_clients),
                "execution_time": execution_time,
                "summary_report": summary_report,
                "clients_data": processed_clients
            }
            
        except Exception as e:
            self.logger.critical(f"خطأ حرج في عملية جلب البيانات: {e}")
            self.console.print(f"[red]❌ خطأ حرج: {e}[/red]")
            return {"success": False, "error": str(e)}
        
        finally:
            # إغلاق ThreadPoolExecutor
            self.executor.shutdown(wait=True)

    def _create_summary_report(self, processed_clients: List[Dict], failed_clients: List[str]) -> str:
        """إنشاء تقرير ملخص شامل"""
        try:
            summary_dir = self.data_dir / "summary"
            summary_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            summary_file = summary_dir / f"mcc_summary_report_{timestamp}.json"
            
            # إحصائيات شاملة
            total_campaigns = sum(client.get('campaigns_count', 0) for client in processed_clients)
            total_keywords = sum(client.get('keywords_count', 0) for client in processed_clients)
            total_ads = sum(client.get('ads_count', 0) for client in processed_clients)
            
            summary_data = {
                "report_timestamp": datetime.now().isoformat(),
                "mcc_customer_id": self.mcc_customer_id,
                "summary_statistics": {
                    "total_clients_processed": len(processed_clients),
                    "total_clients_failed": len(failed_clients),
                    "success_rate": (len(processed_clients) / (len(processed_clients) + len(failed_clients))) * 100 if (len(processed_clients) + len(failed_clients)) > 0 else 0,
                    "total_campaigns": total_campaigns,
                    "total_keywords": total_keywords,
                    "total_ads": total_ads
                },
                "processed_clients": processed_clients,
                "failed_clients": failed_clients,
                "success_log": self.success_log,
                "error_log": self.error_log
            }
            
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary_data, f, ensure_ascii=False, indent=2, default=str)
            
            self.logger.info(f"تم إنشاء التقرير الشامل: {summary_file}")
            return str(summary_file)
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء التقرير الشامل: {e}")
            return ""

    def _display_final_results(self, processed_clients: List[Dict], failed_clients: List[str], execution_time: float):
        """عرض النتائج النهائية"""
        
        # جدول النتائج
        results_table = Table(title="📊 ملخص النتائج النهائية", show_header=True, header_style="bold magenta")
        results_table.add_column("المؤشر", style="cyan", no_wrap=True)
        results_table.add_column("القيمة", style="green")
        
        results_table.add_row("✅ العملاء المعالجين بنجاح", str(len(processed_clients)))
        results_table.add_row("❌ العملاء الفاشلين", str(len(failed_clients)))
        results_table.add_row("⏱️ وقت التنفيذ", f"{execution_time:.2f} ثانية")
        results_table.add_row("📈 معدل النجاح", f"{(len(processed_clients) / (len(processed_clients) + len(failed_clients))) * 100:.1f}%" if (len(processed_clients) + len(failed_clients)) > 0 else "0%")
        
        # إحصائيات البيانات
        total_campaigns = sum(client.get('campaigns_count', 0) for client in processed_clients)
        total_keywords = sum(client.get('keywords_count', 0) for client in processed_clients)
        total_ads = sum(client.get('ads_count', 0) for client in processed_clients)
        
        results_table.add_row("🎯 إجمالي الحملات", str(total_campaigns))
        results_table.add_row("🔑 إجمالي الكلمات المفتاحية", str(total_keywords))
        results_table.add_row("📢 إجمالي الإعلانات", str(total_ads))
        
        self.console.print("\n")
        self.console.print(results_table)
        
        # عرض العملاء المعالجين بنجاح
        if processed_clients:
            clients_table = Table(title="✅ العملاء المعالجين بنجاح", show_header=True, header_style="bold green")
            clients_table.add_column("اسم العميل", style="cyan")
            clients_table.add_column("معرف العميل", style="yellow")
            clients_table.add_column("الحملات", style="blue")
            clients_table.add_column("الكلمات المفتاحية", style="magenta")
            clients_table.add_column("الإعلانات", style="red")
            
            for client in processed_clients[:10]:  # عرض أول 10 عملاء فقط
                clients_table.add_row(
                    client.get('client_name', 'N/A')[:30],
                    str(client.get('client_id', 'N/A')),
                    str(client.get('campaigns_count', 0)),
                    str(client.get('keywords_count', 0)),
                    str(client.get('ads_count', 0))
                )
            
            if len(processed_clients) > 10:
                clients_table.add_row("...", "...", "...", "...", f"و {len(processed_clients) - 10} عميل آخر")
            
            self.console.print("\n")
            self.console.print(clients_table)
        
        # عرض العملاء الفاشلين
        if failed_clients:
            self.console.print(f"\n[red]❌ العملاء الذين فشلت معالجتهم ({len(failed_clients)}):[/red]")
            for client in failed_clients[:5]:  # عرض أول 5 فقط
                self.console.print(f"   • {client}")
            if len(failed_clients) > 5:
                self.console.print(f"   • ... و {len(failed_clients) - 5} عميل آخر")
        
        # رسالة النجاح النهائية
        self.console.print(Panel.fit(
            f"[bold green]🎉 تمت عملية جلب البيانات بنجاح!\n"
            f"📁 تم حفظ جميع البيانات في مجلد: {self.data_dir}\n"
            f"⏱️ وقت التنفيذ الإجمالي: {execution_time:.2f} ثانية[/bold green]",
            border_style="green"
        ))


def main():
    """الدالة الرئيسية لتشغيل البرنامج"""
    console = Console()
    
    try:
        console.print(Panel.fit(
            "[bold blue]🚀 Google Ads MCC Data Fetcher - AI Edition v5.0[/bold blue]\n"
            "[cyan]نظام متقدم لجلب وتحليل بيانات Google Ads من حسابات MCC[/cyan]",
            border_style="blue"
        ))
        
        # إنشاء كائن الجلب
        fetcher = GoogleAdsMCCFetcher()
        
        # تشغيل عملية جلب البيانات الكاملة
        results = fetcher.run_full_data_fetch()
        
        if results.get("success"):
            console.print("\n[bold green]✅ تمت العملية بنجاح![/bold green]")
            return 0
        else:
            console.print(f"\n[bold red]❌ فشلت العملية: {results.get('error', 'خطأ غير معروف')}[/bold red]")
            return 1
            
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️ تم إيقاف البرنامج بواسطة المستخدم[/yellow]")
        return 1
    except Exception as e:
        console.print(f"\n[bold red]❌ خطأ حرج: {e}[/bold red]")
        return 1


if __name__ == "__main__":
    # إضافة استيراد RichHandler هنا - FIXED
    try:
        from rich.logging import RichHandler
    except ImportError:
        print("❌ خطأ: مكتبة rich غير مثبتة. يرجى تثبيتها باستخدام: pip install rich")
        sys.exit(1)
    
    # تشغيل البرنامج
    exit_code = main()
    sys.exit(exit_code)

# ===========================================
# END OF PART 8 - PROGRAM COMPLETE
# نهاية الجزء الثامن - البرنامج مكتمل
# ===========================================

"""
🎉 تم الانتهاء من الكود الكامل!

الميزات المُصححة في هذا الإصدار:
✅ إضافة الدالة المفقودة _execute_query
✅ إزالة page_size من جميع طلبات API
✅ إصلاح دعم النصوص العربية في المخططات
✅ تحسين معالجة الأخطاء
✅ إضافة Circuit Breaker للمرونة
✅ تحسين التسجيل والتقارير

للتشغيل:
python complete_google_ads_fetcher_mcc_fixed.py

متطلبات التشغيل:
- ملف google_ads_config.yaml محدث بالبيانات الصحيحة
- تثبيت المكتبات المطلوبة
- اتصال بالإنترنت
- صلاحيات Google Ads API

🚀 البرنامج جاهز للاستخدام!
"""
