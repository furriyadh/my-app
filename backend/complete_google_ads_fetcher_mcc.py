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

# استيراد الفئات المنقولة من backend.utils
from backend.utils.config_manager import ConfigManager
from backend.utils.logger_config import LoggerManager
from backend.utils.error_handling import ErrorHandler, GoogleAdsCircuitBreaker
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich.panel import Panel
from rich.logging import RichHandler # للتأكد من استيرادها

import os
os.environ["GOOGLE_ADS_CONFIGURATION_FILE_PATH"] = "ads_config.yaml"

# إعداد الخطوط لتجنب تحذيرات الخطوط العربية - FIXED
plt.rcParams["font.family"] = ["Tahoma", "DejaVu Sans", "Arial", "sans-serif"]
plt.rcParams["axes.unicode_minus"] = False
warnings.filterwarnings("ignore", category=UserWarning, module="matplotlib.font_manager")

# دالة لإعداد الخط العربي - FIXED
def setup_arabic_font():
    """إعداد الخط العربي للمخططات"""
    try:
        # البحث عن خطوط عربية متاحة
        available_fonts = [f.name for f in fm.fontManager.ttflist]
        arabic_fonts = ["Tahoma", "Arial Unicode MS", "DejaVu Sans", "Liberation Sans"]
        
        for font in arabic_fonts:
            if font in available_fonts:
                plt.rcParams["font.family"] = [font]
                break
        else:
            plt.rcParams["font.family"] = ["sans-serif"]
            
    except Exception as e:
        print(f"تحذير: مشكلة في إعداد الخط العربي: {e}")
        plt.rcParams["font.family"] = ["sans-serif"]

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
    # import matplotlib.pyplot as plt # تم استيرادها بالفعل في الأعلى
    import seaborn as sns
    from tqdm import tqdm
    # from rich.console import Console # تم استيرادها بالفعل في الأعلى
    # from rich.progress import Progress, SpinnerColumn, TextColumn # تم استيرادها بالفعل في الأعلى
    # from rich.table import Table # تم استيرادها بالفعل في الأعلى
    # from rich.panel import Panel # تم استيرادها بالفعل في الأعلى
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

# تم نقل ConfigManager إلى backend/utils/config_manager.py

# ===========================================
# END OF PART 2
# نهاية الجزء الثاني
# ===========================================

# ===========================================
# PART 3: LOGGING SETUP
# الجزء الثالث: إعداد التسجيل
# ===========================================

# تم نقل LoggerManager إلى backend/utils/logger_config.py

# ===========================================
# END OF PART 3
# نهاية الجزء الثالث
# ===========================================
# ===========================================
# PART 4: ERROR HANDLING AND CIRCUIT BREAKER
# الجزء الرابع: إدارة الأخطاء و Circuit Breaker
# ===========================================

# تم نقل GoogleAdsCircuitBreaker و ErrorHandler إلى backend/utils/error_handling.py

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
        self.config = self.config_manager.get_config()
        
        self.logger_manager = LoggerManager(self.config)
        self.logger = self.logger_manager.get_logger()
        
        self.error_handler = ErrorHandler(self.config, self.logger)

        self.client = self._initialize_google_ads_client()
        self.mcc_customer_id = self.config_manager.get("account.customer_id")
        self.login_customer_id = self.config_manager.get("account.customer_id", self.mcc_customer_id)

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
            os.environ["GOOGLE_ADS_USE_PROTO_PLUS"] = "True"
            
            self.logger.info("Initializing Google Ads client...")
            
            # إنشاء قاموس الإعدادات مع use_proto_plus - FIXED
            config_dict = {
                "developer_token": self.config_manager.get("account.developer_token"),
                "client_id": self.config_manager.get("oauth2.client_id"),
                "client_secret": self.config_manager.get("oauth2.client_secret"),
                "refresh_token": self.config_manager.get("oauth2.refresh_token"),
                "login_customer_id": self.config_manager.get("account.customer_id"),
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
                        if hasattr(value, "_pb"):
                            # Convert protobuf message to dict
                            row_dict[field_name] = self._protobuf_to_dict(value._pb)
                        else:
                            row_dict[field_name] = value
                results.append(row_dict)
            
            execution_time = time.time() - start_time
            self.logger.info(f"Query \'{description}\' completed in {execution_time:.2f}s, returned {len(results)} rows")
            
            self.success_log.append({
                "timestamp": datetime.now().isoformat(),
                "query": description,
                "customer_id": customer_id,
                "execution_time": execution_time,
                "rows_returned": len(results)
            })
            
            return results
            
        except Exception as ex:
            self.logger.error(f"Error executing query \'{description}\' for customer {customer_id}: {ex}")
            raise ex

    def _protobuf_to_dict(self, pb_obj) -> Dict:
        """تحويل كائن protobuf إلى قاموس"""
        result = {}
        for field, value in pb_obj.ListFields():
            if field.label == field.LABEL_REPEATED:
                result[field.name] = [self._protobuf_to_dict(item) if hasattr(item, "ListFields") else item for item in value]
            elif hasattr(value, "ListFields"):
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
            AND customer_client.status = \'ENABLED\'
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
            WHERE campaign.status IN (\'ENABLED\', \'PAUSED\')
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
            WHERE ad_group.status IN (\'ENABLED\', \'PAUSED\')
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
            WHERE ad_group_criterion.status IN (\'ENABLED\', \'PAUSED\')
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
            WHERE ad_group_ad.status IN (\'ENABLED\', \'PAUSED\')
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
        customer_id = client_info.get("customer_client", {}).get("id")
        client_name = client_info.get("customer_client", {}).get("descriptive_name", f"Client_{customer_id}")
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
                client_name = client_info.get("customer_client", {}).get("descriptive_name", "Unknown Client")
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

        self.console.print(Panel("[bold blue]Google Ads Data Fetch Completed[/bold blue]", expand=False))
        self.console.print(f"[green]Processed {len(all_clients_data)} clients successfully.[/green]")
        if self.error_log:
            self.console.print(f"[red]Encountered {len(self.error_log)} errors. Check logs for details.[/red]")

        return all_clients_data

    def save_data_to_json(self, data: List[Dict], filename: str = "all_mcc_data.json"):
        """حفظ البيانات المجلوبة إلى ملف JSON."""
        file_path = self.data_dir / filename
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            self.logger.info(f"Data saved to {file_path}")
            self.console.print(f"[green]Data saved to {file_path}[/green]")
        except Exception as e:
            self.logger.error(f"Error saving data to JSON: {e}")
            self.console.print(f"[red]Error saving data to JSON: {e}[/red]")

    def save_logs_to_json(self):
        """حفظ سجلات النجاح والأخطاء إلى ملفات JSON."""
        success_log_path = self.data_dir / "success_log.json"
        error_log_path = self.data_dir / "error_log.json"
        try:
            with open(success_log_path, "w", encoding="utf-8") as f:
                json.dump(self.success_log, f, ensure_ascii=False, indent=4)
            self.logger.info(f"Success log saved to {success_log_path}")
            
            with open(error_log_path, "w", encoding="utf-8") as f:
                json.dump(self.error_log, f, ensure_ascii=False, indent=4)
            self.logger.info(f"Error log saved to {error_log_path}")
            self.console.print("[green]Logs saved successfully.[/green]")
        except Exception as e:
            self.logger.error(f"Error saving logs to JSON: {e}")
            self.console.print(f"[red]Error saving logs to JSON: {e}[/red]")

    def generate_summary_report(self):
        """إنشاء تقرير ملخص للبيانات المجلوبة."""
        self.console.print(Panel("[bold blue]Generating Summary Report[/bold blue]", expand=False))
        
        total_clients = len(self.success_log) + len(self.error_log)
        successful_clients = len(self.success_log)
        failed_clients = len(self.error_log)

        table = Table(title="Data Fetch Summary")
        table.add_column("Metric", style="cyan", no_wrap=True)
        table.add_column("Value", style="magenta")

        table.add_row("Total Clients Attempted", str(total_clients))
        table.add_row("Successful Clients", str(successful_clients))
        table.add_row("Failed Clients", str(failed_clients))
        
        self.console.print(table)

        if self.error_log:
            error_table = Table(title="Failed Clients Details")
            error_table.add_column("Client Name", style="cyan")
            error_table.add_column("Error", style="red")
            for error_entry in self.error_log:
                client_name = error_entry.get("client_name", "N/A")
                error_msg = error_entry.get("error", "N/A")
                error_table.add_row(client_name, error_msg)
            self.console.print(error_table)

        self.console.print("[green]Summary report generated.[/green]")

    def run(self):
        """تشغيل عملية جلب البيانات بالكامل."""
        try:
            self.console.print(Panel("[bold green]Starting Google Ads MCC Data Fetcher[/bold green]", expand=False))
            all_data = self.fetch_all_mcc_data()
            self.save_data_to_json(all_data)
            self.save_logs_to_json()
            self.generate_summary_report()
            self.console.print(Panel("[bold green]Google Ads MCC Data Fetcher Finished[/bold green]", expand=False))
        except Exception as e:
            self.logger.critical(f"Critical error during data fetcher run: {e}")
            self.console.print(f"[red]Critical error during data fetcher run: {e}[/red]")
            sys.exit(1)

if __name__ == "__main__":
    fetcher = GoogleAdsMCCFetcher()
    fetcher.run()
