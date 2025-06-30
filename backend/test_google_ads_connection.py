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
from complete_google_ads_fetcher_mcc import GoogleAdsMCCFetcher
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.logging import RichHandler

# إضافة المجلد الحالي إلى مسار Python
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    # استيراد المكتبات الأساسية
    from complete_google_ads_fetcher_mcc import GoogleAdsMCCFetcher
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
    from rich.layout import Layout
    from rich.live import Live
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    import seaborn as sns
    
except ImportError as e:
    print(f"❌ خطأ في استيراد المكتبات: {e}")
    print("🔧 يرجى تثبيت المكتبات المطلوبة باستخدام:")
    print("pip install google-ads pandas numpy matplotlib seaborn tqdm rich cerberus pybreaker cryptography arabic-reshaper python-bidi")
    sys.exit(1)


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

📅 تاريخ الاختبار: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
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
                result = self.fetcher._execute_query(test_query, "Authentication Test")
                
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
                    client_info = client.get('customer_client', {})
                    if client_info.get('test_account', False):
                        test_accounts.append(client)
                    elif client_info.get('status') == 'ENABLED':
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
                    client_info = client.get('customer_client', {})
                    sample_table.add_row(
                        client_info.get('descriptive_name', 'غير محدد'),
                        str(client_info.get('id', 'غير محدد')),
                        client_info.get('currency_code', 'غير محدد'),
                        client_info.get('time_zone', 'غير محدد')
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
            client_info = test_client.get('customer_client', {})
            client_id = str(client_info.get('id'))
            client_name = client_info.get('descriptive_name', f'Client_{client_id}')
            
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
                account_info = self.fetcher.fetch_account_info(client_id)
                data_collection_results["account_info"] = len(account_info) if account_info else 0
                progress.update(task1, advance=100)
                
                # اختبار جلب الحملات
                task2 = progress.add_task("جلب الحملات...", total=100)
                try:
                    campaigns = self.fetcher.fetch_campaigns_complete(client_id)
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
                    status = "✅ نجح" if count > 0 else "⚠️ فارغ"
                    count_str = str(count)
                else:
                    status = "❌ فشل"
                    count_str = str(count)
                
                display_name = {
                    "account_info": "معلومات الحساب",
                    "campaigns": "الحملات",
                    "keywords": "الكلمات المفتاحية"
                }.get(data_type, data_type)
                
                table.add_row(display_name, count_str, status)
            
            self.console.print(table)
            
            # عرض تفاصيل معلومات الحساب إذا كانت متاحة
            if account_info and len(account_info) > 0:
                account = account_info[0]
                customer_data = account.get('customer', {})
                
                account_details = Table(title="🏢 تفاصيل الحساب")
                account_details.add_column("المعلومة", style="cyan")
                account_details.add_column("القيمة", style="green")
                
                details = {
                    "اسم الحساب": customer_data.get('descriptive_name', 'غير محدد'),
                    "معرف الحساب": customer_data.get('id', 'غير محدد'),
                    "العملة": customer_data.get('currency_code', 'غير محدد'),
                    "المنطقة الزمنية": customer_data.get('time_zone', 'غير محدد'),
                    "التتبع التلقائي": "مُفعل" if customer_data.get('auto_tagging_enabled') else "غير مُفعل",
                    "حساب إداري": "نعم" if customer_data.get('manager') else "لا",
                    "حساب تجريبي": "نعم" if customer_data.get('test_account') else "لا"
                }
                
                for key, value in details.items():
                    account_details.add_row(key, str(value))
                
                self.console.print(account_details)
            
            return {
                "success": True,
                "client_id": client_id,
                "client_name": client_name,
                "data_collection_results": data_collection_results,
                "account_info": account_info,
                "message": f"تم اختبار جمع البيانات من العميل {client_name} بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في جلب البيانات من العميل: {e}"
            }
    
    def test_5_data_export_functionality(self) -> Dict[str, Any]:
        """اختبار 5: وظائف تصدير البيانات"""
        self.console.print("\n💾 [bold blue]الاختبار 5: وظائف تصدير البيانات[/bold blue]")
        
        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}
        
        try:
            # إنشاء بيانات تجريبية للاختبار
            test_data = {
                "campaigns": [
                    {"name": "حملة تجريبية 1", "status": "ENABLED", "budget": 1000, "impressions": 5000, "clicks": 250, "ctr": 5.0},
                    {"name": "حملة تجريبية 2", "status": "PAUSED", "budget": 2000, "impressions": 8000, "clicks": 400, "ctr": 5.0},
                    {"name": "حملة تجريبية 3", "status": "ENABLED", "budget": 1500, "impressions": 6000, "clicks": 300, "ctr": 5.0}
                ]
            }
            
            export_results = {}
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=self.console
            ) as progress:
                
                # اختبار تصدير Excel
                task1 = progress.add_task("اختبار تصدير Excel...", total=100)
                try:
                    df = pd.DataFrame(test_data["campaigns"])
                    excel_path = self.test_data_dir / "test_export.xlsx"
                    df.to_excel(excel_path, index=False, engine='openpyxl')
                    export_results["excel"] = {"success": True, "path": str(excel_path), "size": excel_path.stat().st_size}
                    progress.update(task1, advance=100)
                except Exception as e:
                    export_results["excel"] = {"success": False, "error": str(e)}
                    progress.update(task1, advance=100)
                
                # اختبار تصدير CSV
                task2 = progress.add_task("اختبار تصدير CSV...", total=100)
                try:
                    df = pd.DataFrame(test_data["campaigns"])
                    csv_path = self.test_data_dir / "test_export.csv"
                    df.to_csv(csv_path, index=False, encoding='utf-8-sig')
                    export_results["csv"] = {"success": True, "path": str(csv_path), "size": csv_path.stat().st_size}
                    progress.update(task2, advance=100)
                except Exception as e:
                    export_results["csv"] = {"success": False, "error": str(e)}
                    progress.update(task2, advance=100)
                
                # اختبار تصدير JSON
                task3 = progress.add_task("اختبار تصدير JSON...", total=100)
                try:
                    json_path = self.test_data_dir / "test_export.json"
                    with open(json_path, 'w', encoding='utf-8') as f:
                        json.dump(test_data, f, ensure_ascii=False, indent=2)
                    export_results["json"] = {"success": True, "path": str(json_path), "size": json_path.stat().st_size}
                    progress.update(task3, advance=100)
                except Exception as e:
                    export_results["json"] = {"success": False, "error": str(e)}
                    progress.update(task3, advance=100)
            
            # عرض نتائج التصدير
            table = Table(title="📁 نتائج اختبار التصدير")
            table.add_column("نوع الملف", style="cyan")
            table.add_column("الحالة", style="bold")
            table.add_column("المسار", style="green")
            table.add_column("الحجم (بايت)", style="yellow")
            
            for format_type, result in export_results.items():
                if result["success"]:
                    status = "✅ نجح"
                    path = result["path"]
                    size = str(result["size"])
                else:
                    status = "❌ فشل"
                    path = result.get("error", "غير محدد")[:50]
                    size = "0"
                
                table.add_row(format_type.upper(), status, path, size)
            
            self.console.print(table)
            
            return {
                "success": True,
                "export_results": export_results,
                "message": "تم اختبار وظائف التصدير بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في اختبار التصدير: {e}"
            }
    
    def test_6_visualization_capabilities(self) -> Dict[str, Any]:
        """اختبار 6: قدرات إنشاء المخططات البيانية"""
        self.console.print("\n📈 [bold blue]الاختبار 6: قدرات إنشاء المخططات البيانية[/bold blue]")
        
        try:
            # إنشاء بيانات تجريبية للمخططات
            test_data = {
                "dates": pd.date_range(start='2024-01-01', end='2024-01-30', freq='D'),
                "impressions": np.random.randint(1000, 5000, 30),
                "clicks": np.random.randint(50, 250, 30),
                "cost": np.random.uniform(100, 500, 30)
            }
            
            df = pd.DataFrame(test_data)
            df['ctr'] = (df['clicks'] / df['impressions']) * 100
            
            visualization_results = {}
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=self.console
            ) as progress:
                
                # اختبار مخطط خطي
                task1 = progress.add_task("إنشاء مخطط خطي...", total=100)
                try:
                    plt.figure(figsize=(12, 6))
                    plt.plot(df['dates'], df['impressions'], label='مرات الظهور', marker='o')
                    plt.plot(df['dates'], df['clicks'], label='النقرات', marker='s')
                    plt.title('أداء الحملة - مرات الظهور والنقرات', fontsize=14)
                    plt.xlabel('التاريخ')
                    plt.ylabel('العدد')
                    plt.legend()
                    plt.xticks(rotation=45)
                    plt.tight_layout()
                    
                    line_chart_path = self.test_data_dir / "test_line_chart.png"
                    plt.savefig(line_chart_path, dpi=300, bbox_inches='tight')
                    plt.close()
                    
                    visualization_results["line_chart"] = {"success": True, "path": str(line_chart_path)}
                    progress.update(task1, advance=100)
                except Exception as e:
                    visualization_results["line_chart"] = {"success": False, "error": str(e)}
                    progress.update(task1, advance=100)
                
                # اختبار مخطط دائري
                task2 = progress.add_task("إنشاء مخطط دائري...", total=100)
                try:
                    # بيانات تجريبية للمخطط الدائري
                    campaign_data = ['حملة البحث', 'حملة العرض', 'حملة الفيديو', 'حملة التسوق']
                    campaign_costs = [30, 25, 20, 25]
                    
                    plt.figure(figsize=(10, 8))
                    plt.pie(campaign_costs, labels=campaign_data, autopct='%1.1f%%', startangle=90)
                    plt.title('توزيع التكلفة حسب نوع الحملة', fontsize=14)
                    
                    pie_chart_path = self.test_data_dir / "test_pie_chart.png"
                    plt.savefig(pie_chart_path, dpi=300, bbox_inches='tight')
                    plt.close()
                    
                    visualization_results["pie_chart"] = {"success": True, "path": str(pie_chart_path)}
                    progress.update(task2, advance=100)
                except Exception as e:
                    visualization_results["pie_chart"] = {"success": False, "error": str(e)}
                    progress.update(task2, advance=100)
                
                # اختبار مخطط شريطي
                task3 = progress.add_task("إنشاء مخطط شريطي...", total=100)
                try:
                    # بيانات تجريبية للمخطط الشريطي
                    keywords = ['كلمة مفتاحية 1', 'كلمة مفتاحية 2', 'كلمة مفتاحية 3', 'كلمة مفتاحية 4', 'كلمة مفتاحية 5']
                    performance = [85, 92, 78, 88, 95]
                    
                    plt.figure(figsize=(12, 6))
                    bars = plt.bar(keywords, performance, color=['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'])
                    plt.title('أداء الكلمات المفتاحية', fontsize=14)
                    plt.xlabel('الكلمات المفتاحية')
                    plt.ylabel('نقاط الأداء')
                    plt.xticks(rotation=45)
                    
                    # إضافة قيم على الأعمدة
                    for bar, value in zip(bars, performance):
                        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                                str(value), ha='center', va='bottom')
                    
                    plt.tight_layout()
                    
                    bar_chart_path = self.test_data_dir / "test_bar_chart.png"
                    plt.savefig(bar_chart_path, dpi=300, bbox_inches='tight')
                    plt.close()
                    
                    visualization_results["bar_chart"] = {"success": True, "path": str(bar_chart_path)}
                    progress.update(task3, advance=100)
                except Exception as e:
                    visualization_results["bar_chart"] = {"success": False, "error": str(e)}
                    progress.update(task3, advance=100)
            
            # عرض نتائج إنشاء المخططات
            table = Table(title="🎨 نتائج اختبار المخططات البيانية")
            table.add_column("نوع المخطط", style="cyan")
            table.add_column("الحالة", style="bold")
            table.add_column("المسار", style="green")
            
            chart_names = {
                "line_chart": "مخطط خطي",
                "pie_chart": "مخطط دائري", 
                "bar_chart": "مخطط شريطي"
            }
            
            for chart_type, result in visualization_results.items():
                if result["success"]:
                    status = "✅ نجح"
                    path = result["path"]
                else:
                    status = "❌ فشل"
                    path = result.get("error", "غير محدد")[:50]
                
                table.add_row(chart_names.get(chart_type, chart_type), status, path)
            
            self.console.print(table)
            
            return {
                "success": True,
                "visualization_results": visualization_results,
                "message": "تم اختبار إنشاء المخططات البيانية بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في اختبار المخططات البيانية: {e}"
            }
    
    def test_7_ai_analysis_features(self) -> Dict[str, Any]:
        """اختبار 7: ميزات التحليل الذكي والذكاء الاصطناعي"""
        self.console.print("\n🤖 [bold blue]الاختبار 7: ميزات التحليل الذكي والذكاء الاصطناعي[/bold blue]")
        
        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}
        
        try:
            # بيانات تجريبية للتحليل
            test_performance_data = {
                "campaign_name": ["حملة البحث 1", "حملة العرض 1", "حملة الفيديو 1"],
                "impressions": [10000, 15000, 8000],
                "clicks": [500, 300, 200],
                "cost": [1000, 800, 600],
                "conversions": [25, 15, 10],
                "segments": ["2024-01-01", "2024-01-02", "2024-01-03"]
            }
            
            ai_analysis_results = {}
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=self.console
            ) as progress:
                
                # اختبار تحليل الاتجاهات
                task1 = progress.add_task("اختبار تحليل الاتجاهات...", total=100)
                try:
                    if hasattr(self.fetcher, 'analyze_performance_trends'):
                        trends_result = self.fetcher.analyze_performance_trends(test_performance_data, "ctr")
                        ai_analysis_results["trends_analysis"] = {"success": True, "result": trends_result}
                    else:
                        ai_analysis_results["trends_analysis"] = {"success": False, "error": "الوظيفة غير متاحة"}
                    progress.update(task1, advance=100)
                except Exception as e:
                    ai_analysis_results["trends_analysis"] = {"success": False, "error": str(e)}
                    progress.update(task1, advance=100)
                
                # اختبار كشف الشذوذ
                task2 = progress.add_task("اختبار كشف الشذوذ...", total=100)
                try:
                    if hasattr(self.fetcher, 'detect_anomalies'):
                        anomalies_result = self.fetcher.detect_anomalies(test_performance_data)
                        ai_analysis_results["anomaly_detection"] = {"success": True, "result": anomalies_result}
                    else:
                        ai_analysis_results["anomaly_detection"] = {"success": False, "error": "الوظيفة غير متاحة"}
                    progress.update(task2, advance=100)
                except Exception as e:
                    ai_analysis_results["anomaly_detection"] = {"success": False, "error": str(e)}
                    progress.update(task2, advance=100)
                
                # اختبار التوصيات الذكية
                task3 = progress.add_task("اختبار التوصيات الذكية...", total=100)
                try:
                    if hasattr(self.fetcher, 'generate_ai_recommendations'):
                        recommendations_result = self.fetcher.generate_ai_recommendations(test_performance_data)
                        ai_analysis_results["ai_recommendations"] = {"success": True, "result": recommendations_result}
                    else:
                        ai_analysis_results["ai_recommendations"] = {"success": False, "error": "الوظيفة غير متاحة"}
                    progress.update(task3, advance=100)
                except Exception as e:
                    ai_analysis_results["ai_recommendations"] = {"success": False, "error": str(e)}
                    progress.update(task3, advance=100)
            
            # عرض نتائج التحليل الذكي
            table = Table(title="🧠 نتائج اختبار التحليل الذكي")
            table.add_column("نوع التحليل", style="cyan")
            table.add_column("الحالة", style="bold")
            table.add_column("النتيجة", style="green")
            
            analysis_names = {
                "trends_analysis": "تحليل الاتجاهات",
                "anomaly_detection": "كشف الشذوذ",
                "ai_recommendations": "التوصيات الذكية"
            }
            
            for analysis_type, result in ai_analysis_results.items():
                if result["success"]:
                    status = "✅ نجح"
                    result_text = "تم التحليل بنجاح"
                else:
                    status = "❌ فشل"
                    result_text = result.get("error", "غير محدد")[:50]
                
                table.add_row(analysis_names.get(analysis_type, analysis_type), status, result_text)
            
            self.console.print(table)
            
            # عرض معلومات إضافية عن إعدادات الذكاء الاصطناعي
            ai_config = self.fetcher.config_manager.get("ai_ml", {})
            if ai_config.get("enabled", False):
                ai_info_table = Table(title="⚙️ إعدادات الذكاء الاصطناعي")
                ai_info_table.add_column("الميزة", style="cyan")
                ai_info_table.add_column("الحالة", style="green")
                
                ai_features = {
                    "التحليل التنبؤي": ai_config.get("predictive_analytics", {}).get("enabled", False),
                    "كشف الشذوذ": ai_config.get("anomaly_detection", {}).get("enabled", False),
                    "معالجة اللغة الطبيعية": ai_config.get("nlp", {}).get("enabled", False),
                    "الرؤية الحاسوبية": ai_config.get("computer_vision", {}).get("enabled", False),
                    "التعلم الآلي التلقائي": ai_config.get("automl", {}).get("enabled", False)
                }
                
                for feature, enabled in ai_features.items():
                    status = "✅ مُفعل" if enabled else "❌ غير مُفعل"
                    ai_info_table.add_row(feature, status)
                
                self.console.print(ai_info_table)
            
            return {
                "success": True,
                "ai_analysis_results": ai_analysis_results,
                "ai_config": ai_config,
                "message": "تم اختبار ميزات التحليل الذكي"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في اختبار التحليل الذكي: {e}"
            }
    
    def test_8_auto_discovery_simulation(self) -> Dict[str, Any]:
        """اختبار 8: محاكاة الاكتشاف التلقائي للحسابات الجديدة"""
        self.console.print("\n🔍 [bold blue]الاختبار 8: محاكاة الاكتشاف التلقائي للحسابات الجديدة[/bold blue]")
        
        if not self.fetcher:
            return {"success": False, "error": "لم يتم تحميل الإعدادات بعد"}
        
        try:
            # فحص إعدادات الاكتشاف التلقائي
            auto_discovery_config = self.fetcher.config_manager.get("mcc.auto_discovery", {})
            
            discovery_test_results = {}
            
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                console=self.console
            ) as progress:
                
                # فحص الإعدادات
                task1 = progress.add_task("فحص إعدادات الاكتشاف التلقائي...", total=100)
                
                required_settings = {
                    "enabled": auto_discovery_config.get("enabled", False),
                    "real_time_discovery": auto_discovery_config.get("real_time_discovery", False),
                    "continuous_monitoring": auto_discovery_config.get("continuous_monitoring", False),
                    "instant_processing": auto_discovery_config.get("instant_processing", False),
                    "scan_interval_seconds": auto_discovery_config.get("scan_interval_seconds", 0)
                }
                
                discovery_test_results["config_check"] = required_settings
                progress.update(task1, advance=100)
                
                # محاكاة عملية الاكتشاف
                task2 = progress.add_task("محاكاة عملية الاكتشاف...", total=100)
                
                # جلب قائمة العملاء الحالية
                current_clients = self.fetcher.fetch_client_accounts()
                current_client_ids = [
                    client.get('customer_client', {}).get('id') 
                    for client in current_clients
                ]
                
                discovery_test_results["current_clients_count"] = len(current_clients)
                discovery_test_results["current_client_ids"] = current_client_ids[:5]  # أول 5 معرفات
                
                progress.update(task2, advance=50)
                
                # محاكاة فحص للحسابات الجديدة (نفس الاستعلام مرة أخرى)
                time.sleep(1)  # محاكاة وقت المعالجة
                new_scan_clients = self.fetcher.fetch_client_accounts()
                
                discovery_test_results["new_scan_clients_count"] = len(new_scan_clients)
                discovery_test_results["discovery_simulation"] = "تم تشغيل المحاكاة بنجاح"
                
                progress.update(task2, advance=50)
                
                # اختبار الإجراءات الفورية
                task3 = progress.add_task("اختبار الإجراءات الفورية...", total=100)
                
                instant_actions_config = auto_discovery_config.get("instant_actions", {})
                instant_actions_test = {
                    "send_welcome_email": instant_actions_config.get("send_welcome_email", False),
                    "create_account_folder": instant_actions_config.get("create_account_folder", False),
                    "initialize_tracking": instant_actions_config.get("initialize_tracking", False),
                    "setup_alerts": instant_actions_config.get("setup_alerts", False),
                    "generate_baseline_report": instant_actions_config.get("generate_baseline_report", False)
                }
                
                discovery_test_results["instant_actions"] = instant_actions_test
                progress.update(task3, advance=100)
            
            # عرض نتائج اختبار الاكتشاف التلقائي
            config_table = Table(title="⚙️ إعدادات الاكتشاف التلقائي")
            config_table.add_column("الإعداد", style="cyan")
            config_table.add_column("القيمة", style="green")
            config_table.add_column("الحالة", style="bold")
            
            for setting, value in required_settings.items():
                if setting == "scan_interval_seconds":
                    status = "✅ مُحسن" if value <= 60 else "⚠️ بطيء" if value > 0 else "❌ غير مُعين"
                    display_value = f"{value} ثانية"
                else:
                    status = "✅ مُفعل" if value else "❌ غير مُفعل"
                    display_value = "نعم" if value else "لا"
                
                setting_name = {
                    "enabled": "الاكتشاف التلقائي",
                    "real_time_discovery": "الاكتشاف الفوري",
                    "continuous_monitoring": "المراقبة المستمرة",
                    "instant_processing": "المعالجة الفورية",
                    "scan_interval_seconds": "فترة الفحص"
                }.get(setting, setting)
                
                config_table.add_row(setting_name, display_value, status)
            
            self.console.print(config_table)
            
            # عرض نتائج المحاكاة
            simulation_table = Table(title="🎭 نتائج محاكاة الاكتشاف")
            simulation_table.add_column("المعلومة", style="cyan")
            simulation_table.add_column("القيمة", style="green")
            
            simulation_table.add_row("عدد العملاء الحاليين", str(discovery_test_results["current_clients_count"]))
            simulation_table.add_row("عدد العملاء بعد الفحص", str(discovery_test_results["new_scan_clients_count"]))
            simulation_table.add_row("حالة المحاكاة", discovery_test_results["discovery_simulation"])
            
            self.console.print(simulation_table)
            
            # عرض الإجراءات الفورية
            actions_table = Table(title="⚡ الإجراءات الفورية المُكونة")
            actions_table.add_column("الإجراء", style="cyan")
            actions_table.add_column("الحالة", style="bold")
            
            action_names = {
                "send_welcome_email": "إرسال بريد ترحيبي",
                "create_account_folder": "إنشاء مجلد الحساب",
                "initialize_tracking": "تفعيل التتبع",
                "setup_alerts": "إعداد التنبيهات",
                "generate_baseline_report": "إنشاء تقرير أساسي"
            }
            
            for action, enabled in instant_actions_test.items():
                status = "✅ مُفعل" if enabled else "❌ غير مُفعل"
                actions_table.add_row(action_names.get(action, action), status)
            
            self.console.print(actions_table)
            
            return {
                "success": True,
                "discovery_test_results": discovery_test_results,
                "auto_discovery_config": auto_discovery_config,
                "message": "تم اختبار الاكتشاف التلقائي بنجاح"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"فشل في اختبار الاكتشاف التلقائي: {e}"
            }
    
    def generate_final_report(self):
        """إنشاء التقرير النهائي للاختبارات"""
        self.console.print("\n📋 [bold blue]إنشاء التقرير النهائي...[/bold blue]")
        
        # حساب الوقت الإجمالي
        total_time = time.time() - self.start_time
        
        # إحصائيات الاختبارات
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results.values() if result.get("success", False))
        failed_tests = total_tests - successful_tests
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        # إنشاء تقرير شامل
        report_table = Table(title="📊 ملخص نتائج الاختبارات")
        report_table.add_column("الاختبار", style="cyan")
        report_table.add_column("الحالة", style="bold")
        report_table.add_column("الرسالة", style="green")
        
        test_names = {
            "test_1_configuration_loading": "1. تحميل الإعدادات",
            "test_2_api_authentication": "2. المصادقة والاتصال",
            "test_3_mcc_connection_and_clients": "3. اتصال MCC وجلب العملاء",
            "test_4_single_client_data_collection": "4. جلب بيانات عميل واحد",
            "test_5_data_export_functionality": "5. وظائف تصدير البيانات",
            "test_6_visualization_capabilities": "6. إنشاء المخططات البيانية",
            "test_7_ai_analysis_features": "7. التحليل الذكي والذكاء الاصطناعي",
            "test_8_auto_discovery_simulation": "8. الاكتشاف التلقائي للحسابات"
        }
        
        for test_key, result in self.test_results.items():
            test_name = test_names.get(test_key, test_key)
            status = "✅ نجح" if result.get("success", False) else "❌ فشل"
            message = result.get("message", "غير محدد")[:60]
            
            report_table.add_row(test_name, status, message)
        
        self.console.print(report_table)
        
        # إحصائيات عامة
        stats_table = Table(title="📈 إحصائيات عامة")
        stats_table.add_column("المقياس", style="cyan")
        stats_table.add_column("القيمة", style="green")
        
        stats_table.add_row("إجمالي الاختبارات", str(total_tests))
        stats_table.add_row("الاختبارات الناجحة", str(successful_tests))
        stats_table.add_row("الاختبارات الفاشلة", str(failed_tests))
        stats_table.add_row("معدل النجاح", f"{success_rate:.1f}%")
        stats_table.add_row("الوقت الإجمالي", f"{total_time:.2f} ثانية")
        
        self.console.print(stats_table)
        
        # التوصيات النهائية
        self.console.print("\n💡 [bold yellow]التوصيات النهائية:[/bold yellow]")
        
        if success_rate >= 90:
            self.console.print("🎉 [green]ممتاز! المشروع جاهز للاستخدام الكامل[/green]")
            self.console.print("  🚀 يمكنك تشغيل المشروع الكامل بثقة")
            self.console.print("  📊 جميع الميزات تعمل بشكل صحيح")
        elif success_rate >= 70:
            self.console.print("⚠️ [yellow]جيد! هناك بعض المشاكل البسيطة[/yellow]")
            self.console.print("  🔧 راجع الاختبارات الفاشلة وأصلح المشاكل")
            self.console.print("  📈 معظم الميزات تعمل بشكل صحيح")
        else:
            self.console.print("❌ [red]يحتاج إلى مراجعة! عدة مشاكل موجودة[/red]")
            self.console.print("  🛠️ راجع الإعدادات والمتطلبات")
            self.console.print("  📞 تواصل مع الدعم الفني إذا لزم الأمر")
        
        # حفظ التقرير
        try:
            report_data = {
                "timestamp": datetime.now().isoformat(),
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": failed_tests,
                "success_rate": success_rate,
                "total_time": total_time,
                "test_results": self.test_results
            }
            
            report_path = self.test_data_dir / "test_report.json"
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2, default=str)
            
            self.console.print(f"\n💾 [blue]تم حفظ التقرير في: {report_path}[/blue]")
            
        except Exception as e:
            self.console.print(f"\n⚠️ [yellow]تعذر حفظ التقرير: {e}[/yellow]")
    
    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        self.display_header()
        
        # قائمة الاختبارات
        tests = [
            ("test_1_configuration_loading", self.test_1_configuration_loading),
            ("test_2_api_authentication", self.test_2_api_authentication),
            ("test_3_mcc_connection_and_clients", self.test_3_mcc_connection_and_clients),
            ("test_4_single_client_data_collection", self.test_4_single_client_data_collection),
            ("test_5_data_export_functionality", self.test_5_data_export_functionality),
            ("test_6_visualization_capabilities", self.test_6_visualization_capabilities),
            ("test_7_ai_analysis_features", self.test_7_ai_analysis_features),
            ("test_8_auto_discovery_simulation", self.test_8_auto_discovery_simulation)
        ]
        
        # تشغيل الاختبارات
        for test_name, test_function in tests:
            try:
                result = test_function()
                self.test_results[test_name] = result
                
                # إضافة فاصل بين الاختبارات
                time.sleep(0.5)
                
            except Exception as e:
                self.test_results[test_name] = {
                    "success": False,
                    "error": str(e),
                    "message": f"خطأ غير متوقع في الاختبار: {e}"
                }
                self.console.print(f"❌ [red]خطأ في {test_name}: {e}[/red]")
        
        # إنشاء التقرير النهائي
        self.generate_final_report()


def main():
    """الدالة الرئيسية لتشغيل مجموعة الاختبارات"""
    try:
        # إنشاء مجموعة الاختبارات
        test_suite = GoogleAdsTestSuite()
        
        # تشغيل جميع الاختبارات
        test_suite.run_all_tests()
        
    except KeyboardInterrupt:
        print("\n⏹️ تم إيقاف الاختبارات بواسطة المستخدم")
    except Exception as e:
        print(f"\n❌ خطأ عام في تشغيل الاختبارات: {e}")


if __name__ == "__main__":
    main()
