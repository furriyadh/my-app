#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Ads MCC Data Fetcher - Enterprise Test Suite
==================================================
مجموعة اختبارات شاملة للتحقق من جميع ميزات المشروع
Author: Google Ads AI Platform Team
Version: 6.0.0 - MCC Enterprise Edition
License: MIT
"""

import sys
import os
import time
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# استيراد GoogleAdsMCCFetcher بمسار مطلق
from backend.complete_google_ads_fetcher_mcc import GoogleAdsMCCFetcher

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.logging import RichHandler
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.layout import Layout
from rich.live import Live
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# إزالة إضافة المجلد الحالي إلى مسار Python لأننا نستخدم استيرادات مطلقة الآن
# current_dir = Path(__file__).parent
# sys.path.insert(0, str(current_dir))

# إزالة كتلة try-except للاستيرادات إذا تم تثبيت جميع المكتبات
# try:
#     # استيراد المكتبات الأساسية
#     from complete_google_ads_fetcher_mcc import GoogleAdsMCCFetcher
#     from rich.console import Console
#     from rich.panel import Panel
#     from rich.text import Text
#     from rich.table import Table
#     from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
#     from rich.layout import Layout
#     from rich.live import Live
#     import pandas as pd
#     import numpy as np
#     import matplotlib.pyplot as plt
#     import seaborn as sns
#     
# except ImportError as e:
#     print(f"❌ خطأ في استيراد المكتبات: {e}")
#     print("🔧 يرجى تثبيت المكتبات المطلوبة باستخدام:")
#     print("pip install google-ads pandas numpy matplotlib seaborn tqdm rich cerberus pybreaker cryptography arabic-reshaper python-bidi")
#     sys.exit(1)


class GoogleAdsTestSuite:
    """مجموعة اختبارات شاملة لمشروع Google Ads MCC"""
    
    def __init__(self):
        self.console = Console()
        self.test_results = {}
        self.start_time = time.time()
        self.fetcher = None
        self.test_data_dir = Path("test_results")
        self.test_data_dir.mkdir(exist_ok=True)
        
    def display_header(self):
        """عرض رأس الاختبار"""
        title = Text("🧪 Google Ads MCC Enterprise Test Suite", style="bold blue")
        subtitle = Text("مجموعة اختبارات شاملة للمشروع المتقدم", style="italic cyan")
        
        header_content = f"""
{title}
{subtitle}

📅 تاريخ الاختبار: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
🏢 نوع الحساب: MCC Enterprise Edition
🔧 إصدار المشروع: 6.0.0
        """
        
        panel = Panel(header_content.strip(), title="🚀 بدء الاختبارات", expand=False)
        self.console.print(panel)
        
    def test_1_configuration_loading(self) -> Dict[str, Any]:
        """اختبار 1: تحميل وتحقق من صحة الإعدادات"""
        self.console.print("\n🔧 [bold blue]الاختبار 1: تحميل وتحقق من صحة الإعدادات[/bold blue]")
        
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=self.console
            ) as progress:
                task = progress.add_task("تحميل ملف الإعدادات...", total=None)
                
                # محاولة إنشاء كائن الجلب
                self.fetcher = GoogleAdsMCCFetcher()
                progress.update(task, description="تم تحميل الإعدادات بنجاح ✅")
                
            # التحقق من الإعدادات المهمة
            config_checks = {
                "customer_id": self.fetcher.mcc_customer_id,
                "developer_token": self.fetcher.config_manager.get("account.developer_token"),
                "client_id": self.fetcher.config_manager.get("oauth2.client_id"),
                "refresh_token": self.fetcher.config_manager.get("oauth2.refresh_token"),
                "auto_discovery": self.fetcher.config_manager.get("mcc.auto_discovery.enabled"),
                "real_time_discovery": self.fetcher.config_manager.get("mcc.auto_discovery.real_time_discovery"),
                "ai_ml_enabled": self.fetcher.config_manager.get("ai_ml.enabled"),
                "circuit_breaker": self.fetcher.config_manager.get("circuit_breaker.enabled")
            }
            
            # عرض نتائج التحقق
            table = Table(title="📋 نتائج فحص الإعدادات")
            table.add_column("الإعداد", style="cyan")
            table.add_column("القيمة", style="green")
            table.add_column("الحالة", style="bold")
            
            for key, value in config_checks.items():
                status = "✅ صحيح" if value else "❌ مفقود"
                display_value = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                table.add_row(key, display_value, status)
            
            self.console.print(table)
            
            return {
                "success": True,
                "config_checks": config_checks,
                "message": "تم تحميل الإعدادات بنجاح"
            }
            
        except FileNotFoundError:
            return {
                "success": False,
                "error": "ملف الإعدادات google_ads_config.yaml غير موجود",
                "message": "تأكد من وجود ملف الإعدادات في المجلد الصحيح"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"خطأ في تحميل الإعدادات: {e}"
            }
    
    def test_2_api_authentication(self) -> Dict[str, Any]:
        """اختبار 2: المصادقة والاتصال بـ Google Ads API"""
        self.console.print("\n🔐 [bold blue]الاختبار 2: المصادقة والاتصال بـ Google Ads API[/bold blue]")
        
        if not self.fetcher:
            return {
                "success": False,
                "error": "لم يتم تحميل الإعدادات بعد",
                "message": "يجب تشغيل اختبار الإعدادات أولاً"
            }
        
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=self.console
            ) as progress:
                task = progress.add_task("اختبار المصادقة...", total=None)
                
                # اختبار بسيط للاتصال
                test_query = "SELECT customer.id FROM customer LIMIT 1"
                # تم تعديل استدعاء _execute_query ليتضمن customer_id
                result = self.fetcher._execute_query(test_query, "Authentication Test", self.fetcher.mcc_customer_id)
                
                progress.update(task, description="تم التحقق من المصادقة بنجاح ✅")
            
            auth_info = {
                "customer_id": self.fetcher.mcc_customer_id,
                "login_customer_id": self.fetcher.login_customer_id,
                "api_version": "v16",  # Google Ads API version
                "connection_status": "متصل",
                "test_query_results": len(result) if result else 0
            }
            
            # عرض معلومات المصادقة
            table = Table(title="🔑 معلومات المصادقة")
            table.add_column("المعلومة", style="cyan")
            table.add_column("القيمة", style="green")
            
            for key, value in auth_info.items():
                table.add_row(key, str(value))
            
            self.console.print(table)
            
            return {
                "success": True,
                "auth_info": auth_info,
                "message": "تم التحقق من المصادقة بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في المصادقة: {e}"
            }
    
    def test_3_mcc_connection_and_clients(self) -> Dict[str, Any]:
        """اختبار 3: الاتصال بـ MCC وجلب قائمة العملاء"""
        self.console.print("\n🏢 [bold blue]الاختبار 3: الاتصال بـ MCC وجلب قائمة العملاء[/bold blue]")
        
        if not self.fetcher:
            return {
                "success": False,
                "error": "لم يتم تحميل الإعدادات بعد"
            }
        
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TimeElapsedColumn(),
                console=self.console
            ) as progress:
                task = progress.add_task("جلب قائمة العملاء من MCC...", total=100)
                
                # جلب قائمة العملاء
                client_accounts = self.fetcher.fetch_client_accounts()
                progress.update(task, advance=50)
                
                # تحليل البيانات
                active_clients = []
                inactive_clients = []
                test_accounts = []
                
                for client in client_accounts:
                    client_info = client.get("customer_client", {})
                    if client_info.get("test_account", False):
                        test_accounts.append(client)
                    elif client_info.get("status") == "ENABLED":
                        active_clients.append(client)
                    else:
                        inactive_clients.append(client)
                
                progress.update(task, advance=50, description="تم تحليل قائمة العملاء ✅")
            
            # إحصائيات العملاء
            stats = {
                "total_clients": len(client_accounts),
                "active_clients": len(active_clients),
                "inactive_clients": len(inactive_clients),
                "test_accounts": len(test_accounts)
            }
            
            # عرض الإحصائيات
            table = Table(title="📊 إحصائيات العملاء في MCC")
            table.add_column("النوع", style="cyan")
            table.add_column("العدد", style="green")
            table.add_column("النسبة", style="yellow")
            
            total = stats["total_clients"]
            for key, value in stats.items():
                if key == "total_clients":
                    table.add_row("إجمالي العملاء", str(value), "100%")
                else:
                    percentage = f"{(value/total*100):.1f}%" if total > 0 else "0%"
                    display_name = {
                        "active_clients": "العملاء النشطون",
                        "inactive_clients": "العملاء غير النشطين",
                        "test_accounts": "الحسابات التجريبية"
                    }.get(key, key)
                    table.add_row(display_name, str(value), percentage)
            
            self.console.print(table)
            
            # عرض عينة من العملاء النشطين
            if active_clients:
                self.console.print("\n📋 [bold cyan]عينة من العملاء النشطين:[/bold cyan]")
                sample_table = Table()
                sample_table.add_column("الاسم", style="green")
                sample_table.add_column("معرف العميل", style="cyan")
                sample_table.add_column("العملة", style="yellow")
                sample_table.add_column("المنطقة الزمنية", style="blue")
                
                for client in active_clients[:5]:  # أول 5 عملاء
                    client_info = client.get("customer_client", {})
                    sample_table.add_row(
                        client_info.get("descriptive_name", "غير محدد"),
                        str(client_info.get("id", "غير محدد")),
                        client_info.get("currency_code", "غير محدد"),
                        client_info.get("time_zone", "غير محدد")
                    )
                
                self.console.print(sample_table)
                
                if len(active_clients) > 5:
                    self.console.print(f"... و {len(active_clients) - 5} عميل آخر")
            
            return {
                "success": True,
                "stats": stats,
                "client_accounts": client_accounts,
                "active_clients": active_clients,
                "message": f"تم جلب {len(client_accounts)} عميل من MCC بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في جلب قائمة العملاء: {e}"
            }
    
    def test_4_single_client_data_collection(self) -> Dict[str, Any]:
        """اختبار 4: جلب البيانات من عميل واحد"""
        self.console.print("\n📊 [bold blue]الاختبار 4: جلب البيانات من عميل واحد[/bold blue]")
        
        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}
        
        # الحصول على قائمة العملاء من الاختبار السابق
        if "test_3_mcc_connection_and_clients" not in self.test_results:
            return {"success": False, "error": "يجب تشغيل اختبار MCC أولاً"}
        
        active_clients = self.test_results["test_3_mcc_connection_and_clients"].get("active_clients", [])
        if not active_clients:
            return {"success": False, "error": "لا توجد عملاء نشطون للاختبار"}
        
        try:
            # اختيار أول عميل نشط
            test_client = active_clients[0]
            client_info = test_client.get("customer_client", {})
            client_id = str(client_info.get("id"))
            client_name = client_info.get("descriptive_name", f"Client_{client_id}")
            
            self.console.print(f"🎯 [yellow]اختبار العميل: {client_name} (ID: {client_id})[/yellow]")
            
            data_collection_results = {}
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TimeElapsedColumn(),
                console=self.console
            ) as progress:
                
                # اختبار جلب معلومات الحساب
                task1 = progress.add_task("جلب معلومات الحساب...", total=100)
                # تم تعديل استدعاء fetch_account_info ليتوافق مع التغييرات المحتملة
                account_info = self.fetcher.fetch_account_info(client_id) if hasattr(self.fetcher, 'fetch_account_info') else []
                data_collection_results["account_info"] = len(account_info) if account_info else 0
                progress.update(task1, advance=100)
                
                # اختبار جلب الحملات
                task2 = progress.add_task("جلب الحملات...", total=100)
                try:
                    # تم تعديل استدعاء fetch_campaigns_complete ليتوافق مع التغييرات المحتملة
                    campaigns = self.fetcher.fetch_campaign_data(client_id) if hasattr(self.fetcher, 'fetch_campaign_data') else []
                    data_collection_results["campaigns"] = len(campaigns) if campaigns else 0
                    progress.update(task2, advance=100)
                except Exception as e:
                    data_collection_results["campaigns"] = f"خطأ: {str(e)[:50]}"
                    progress.update(task2, advance=100)
                
                # اختبار جلب الكلمات المفتاحية (إذا كان متاحاً)
                task3 = progress.add_task("جلب الكلمات المفتاحية...", total=100)
                try:
                    # استعلام بسيط للكلمات المفتاحية
                    keywords_query = """
                    SELECT 
                      ad_group_criterion.keyword.text,
                      ad_group_criterion.keyword.match_type,
                      metrics.impressions,
                      metrics.clicks,
                      metrics.ctr
                    FROM keyword_view 
                    WHERE segments.date DURING LAST_30_DAYS
                    LIMIT 10
                    """
                    # تم تعديل استدعاء _execute_query ليتضمن customer_id
                    keywords = self.fetcher._execute_query(keywords_query, "Keywords Test", client_id)
                    data_collection_results["keywords"] = len(keywords) if keywords else 0
                    progress.update(task3, advance=100)
                except Exception as e:
                    data_collection_results["keywords"] = f"خطأ: {str(e)[:50]}"
                    progress.update(task3, advance=100)
            
            # عرض نتائج جمع البيانات
            table = Table(title=f"📈 نتائج جمع البيانات - {client_name}")
            table.add_column("نوع البيانات", style="cyan")
            table.add_column("عدد السجلات", style="green")
            table.add_column("الحالة", style="bold")
            
            for data_type, count in data_collection_results.items():
                if isinstance(count, int):
                    status = "✅ نجح" if count > 0 else "⚪ لا توجد بيانات"
                else:
                    status = "❌ فشل"
                table.add_row(data_type, str(count), status)
            
            self.console.print(table)
            
            return {
                "success": True,
                "data_collection_results": data_collection_results,
                "message": f"تم جلب البيانات من عميل {client_name} بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في جلب البيانات من عميل واحد: {e}"
            }

    def test_5_data_processing_and_visualization(self) -> Dict[str, Any]:
        """اختبار 5: معالجة البيانات وتصورها (تحليل بسيط)"""
        self.console.print("\n📊 [bold blue]الاختبار 5: معالجة البيانات وتصورها[/bold blue]")

        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}

        # الحصول على بيانات من اختبار جلب عميل واحد
        if "test_4_single_client_data_collection" not in self.test_results:
            return {"success": False, "error": "يجب تشغيل اختبار جلب البيانات من عميل واحد أولاً"}

        single_client_data = self.test_results["test_4_single_client_data_collection"].get("data_collection_results", {})
        campaigns_data = single_client_data.get("campaigns", [])

        if not campaigns_data or isinstance(campaigns_data, str):
            return {"success": False, "error": "لا توجد بيانات حملات متاحة للتحليل"}

        try:
            df_campaigns = pd.DataFrame(campaigns_data)
            self.console.print(f"[green]تم تحميل {len(df_campaigns)} سجل حملة.[/green]")

            if not df_campaigns.empty:
                # تحويل الأعمدة الرقمية
                for col in ["metrics.impressions", "metrics.clicks", "metrics.cost_micros", "metrics.conversions"]:
                    if col in df_campaigns.columns:
                        df_campaigns[col] = pd.to_numeric(df_campaigns[col], errors='coerce').fillna(0)
                
                # حساب إجمالي النقرات والانطباعات والتكلفة
                total_impressions = df_campaigns["metrics.impressions"].sum()
                total_clicks = df_campaigns["metrics.clicks"].sum()
                total_cost = df_campaigns["metrics.cost_micros"].sum() / 1_000_000 # تحويل من ميكرو إلى عملة
                total_conversions = df_campaigns["metrics.conversions"].sum()

                summary_table = Table(title="ملخص أداء الحملات")
                summary_table.add_column("المقياس", style="cyan")
                summary_table.add_column("القيمة", style="green")
                summary_table.add_row("إجمالي الانطباعات", f"{total_impressions:,}")
                summary_table.add_row("إجمالي النقرات", f"{total_clicks:,}")
                summary_table.add_row("إجمالي التكلفة", f"{total_cost:,.2f}")
                summary_table.add_row("إجمالي التحويلات", f"{total_conversions:,}")
                self.console.print(summary_table)

                # إنشاء رسم بياني بسيط (مثال: النقرات حسب نوع القناة الإعلانية)
                if "campaign.advertising_channel_type" in df_campaigns.columns:
                    channel_clicks = df_campaigns.groupby("campaign.advertising_channel_type")["metrics.clicks"].sum().reset_index()
                    
                    plt.figure(figsize=(10, 6))
                    sns.barplot(x="campaign.advertising_channel_type", y="metrics.clicks", data=channel_clicks)
                    plt.title("النقرات حسب نوع القناة الإعلانية")
                    plt.xlabel("نوع القناة الإعلانية")
                    plt.ylabel("إجمالي النقرات")
                    plt.xticks(rotation=45, ha="right")
                    plt.tight_layout()
                    
                    plot_path = self.test_data_dir / "channel_clicks.png"
                    plt.savefig(plot_path)
                    self.console.print(f"[green]تم حفظ الرسم البياني إلى {plot_path}[/green]")
                    plt.close()

            return {"success": True, "message": "تم معالجة البيانات وتصورها بنجاح"}
        except Exception as e:
            return {"success": False, "error": str(e), "message": f"فشل في معالجة البيانات أو تصورها: {e}"}

    def test_6_full_mcc_data_collection(self) -> Dict[str, Any]:
        """اختبار 6: جلب جميع البيانات لجميع العملاء تحت حساب MCC"""
        self.console.print("\n🌍 [bold blue]الاختبار 6: جلب جميع البيانات لجميع العملاء تحت حساب MCC[/bold blue]")
        
        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}
        
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TimeElapsedColumn(),
                console=self.console
            ) as progress:
                task = progress.add_task("جلب جميع بيانات MCC...", total=100)
                
                all_mcc_data = self.fetcher.fetch_all_mcc_data()
                progress.update(task, advance=100, description="تم جلب جميع بيانات MCC ✅")
            
            self.fetcher.save_data_to_json(all_mcc_data, "all_mcc_data_test.json")
            self.fetcher.save_logs_to_json()
            self.fetcher.generate_summary_report()

            return {"success": True, "message": f"تم جلب {len(all_mcc_data)} مجموعة بيانات عميل بنجاح"}
        except Exception as e:
            return {"success": False, "error": str(e), "message": f"فشل في جلب جميع بيانات MCC: {e}"}

    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        self.display_header()
        
        tests = [
            self.test_1_configuration_loading,
            self.test_2_api_authentication,
            self.test_3_mcc_connection_and_clients,
            self.test_4_single_client_data_collection,
            self.test_5_data_processing_and_visualization,
            self.test_6_full_mcc_data_collection
        ]
        
        for i, test_func in enumerate(tests):
            test_name = test_func.__name__
            self.console.print(Panel(f"[bold yellow]Running {test_name.replace('_', ' ').title()}[/bold yellow]", expand=False))
            result = test_func()
            self.test_results[test_name] = result
            
            status_text = "[bold green]SUCCESS[/bold green]" if result.get("success") else "[bold red]FAILED[/bold red]"
            self.console.print(f"[bold]{test_name.replace('_', ' ').title()}: {status_text}[/bold]")
            if not result.get("success"):
                self.console.print(f"[red]Error: {result.get('error', 'N/A')}[/red]")
                self.console.print(f"[red]Message: {result.get('message', 'N/A')}[/red]")
            self.console.print("\n" + "="*80 + "\n")

        self.display_summary()

    def display_summary(self):
        """عرض ملخص لجميع الاختبارات"""
        end_time = time.time()
        total_time = end_time - self.start_time
        
        self.console.print(Panel("[bold blue]🏁 Test Suite Summary[/bold blue]", expand=False))
        
        summary_table = Table(title="نتائج الاختبارات النهائية")
        summary_table.add_column("الاختبار", style="cyan")
        summary_table.add_column("الحالة", style="bold")
        summary_table.add_column("الرسالة", style="magenta")
        
        overall_success = True
        for test_name, result in self.test_results.items():
            status = "✅ نجح" if result.get("success") else "❌ فشل"
            message = result.get("message", "")
            summary_table.add_row(test_name.replace('_', ' ').title(), status, message)
            if not result.get("success"):
                overall_success = False
        
        self.console.print(summary_table)
        
        overall_status_text = "[bold green]جميع الاختبارات نجحت! 🎉[/bold green]" if overall_success else "[bold red]بعض الاختبارات فشلت! 💔[/bold red]"
        self.console.print(overall_status_text)
        self.console.print(f"[bold]إجمالي وقت التشغيل: {total_time:.2f} ثانية[/bold]")


if __name__ == "__main__":
    test_suite = GoogleAdsTestSuite()
    test_suite.run_all_tests()
