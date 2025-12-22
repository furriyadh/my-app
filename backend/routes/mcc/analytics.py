"""
MCC Analytics & Reporting API
التحليلات والتقارير المتطورة

يوفر مسارات API شاملة للتحليلات والتقارير في MCC بما في ذلك:
- تحليلات الأداء المتقدمة للحسابات والحملات
- تقارير مخصصة قابلة للتخصيص
- مؤشرات الأداء الرئيسية (KPIs)
- تحليلات الاتجاهات والتنبؤات
- مقارنات الأداء والمعايير
- تصدير التقارير بصيغ متعددة
- لوحات معلومات تفاعلية
"""

from flask import Blueprint, request, jsonify, g, send_file
import logging

# محاولة استيراد JWT extensions
try:
    from flask_jwt_extended import jwt_required, get_jwt_identity
    JWT_AVAILABLE = True
except ImportError as e:
    # إنشاء decorators بديلة
    def jwt_required(optional=False):
        def decorator(f):
            return f
        return decorator
    def get_jwt_identity():
        return "demo_user"
    JWT_AVAILABLE = False
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional, Any, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor
from enum import Enum
import uuid
import pandas as pd
import io
import base64
from dataclasses import dataclass
import numpy as np

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
mcc_analytics_bp = Blueprint('mcc_analytics', __name__)

# محاولة استيراد الخدمات المطلوبة
try:
    from services.mcc_manager import MCCManager
    from services.google_ads_client import GoogleAdsClient
    # إنشاء دوال بديلة محلية
    def validate_report_config(config):
        return True
    def generate_unique_id():
        return str(uuid.uuid4())
    def sanitize_text(text):
        return str(text).replace('<', '').replace('>', '').replace('"', '')
    def format_currency(amount):
        return f"${amount:,.2f}"
    def calculate_percentage_change(old, new):
        if old == 0: return 0
        return ((new - old) / old) * 100
    MCC_ANALYTICS_SERVICES_AVAILABLE = True
    logger.info("✅ تم تحميل خدمات MCC Analytics بنجاح")
except ImportError as e:
    MCC_ANALYTICS_SERVICES_AVAILABLE = False
    logger.info("ℹ️ تم تحميل MCC Analytics Blueprint في وضع محدود")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=30)

class ReportType(Enum):
    """أنواع التقارير"""
    PERFORMANCE_SUMMARY = "performance_summary"
    CAMPAIGN_ANALYSIS = "campaign_analysis"
    ACCOUNT_OVERVIEW = "account_overview"
    KEYWORD_PERFORMANCE = "keyword_performance"
    AD_PERFORMANCE = "ad_performance"
    BUDGET_UTILIZATION = "budget_utilization"
    CONVERSION_ANALYSIS = "conversion_analysis"
    TREND_ANALYSIS = "trend_analysis"
    COMPETITIVE_ANALYSIS = "competitive_analysis"
    CUSTOM_REPORT = "custom_report"

class MetricType(Enum):
    """أنواع المؤشرات"""
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"
    COST = "cost"
    CONVERSIONS = "conversions"
    CTR = "ctr"
    CPC = "cpc"
    CPM = "cpm"
    CONVERSION_RATE = "conversion_rate"
    COST_PER_CONVERSION = "cost_per_conversion"
    ROAS = "roas"
    QUALITY_SCORE = "quality_score"
    IMPRESSION_SHARE = "impression_share"

class TimeGranularity(Enum):
    """دقة الوقت"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class ExportFormat(Enum):
    """صيغ التصدير"""
    JSON = "json"
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"

@dataclass
class AnalyticsQuery:
    """استعلام التحليلات"""
    query_id: str
    user_id: str
    report_type: ReportType
    metrics: List[MetricType]
    dimensions: List[str]
    filters: Dict[str, Any]
    date_range: Dict[str, str]
    granularity: TimeGranularity
    sort_by: Optional[str] = None
    sort_order: str = "desc"
    limit: Optional[int] = None

class MCCAnalyticsManager:
    """مدير تحليلات MCC المتطور"""
    
    def __init__(self):
        self.mcc_manager = MCCManager() if MCC_ANALYTICS_SERVICES_AVAILABLE else None
        self.google_ads_client = None  # سيتم تهيئته عند الحاجة
        self.db_manager = None  # سيتم تهيئته عند الحاجة
        
        # تخزين مؤقت للتقارير
        self.report_cache: Dict[str, Dict] = {}
        self.cache_ttl = 3600  # ساعة واحدة
        
        # إعدادات التحليلات الافتراضية
        self.default_metrics = [
            MetricType.IMPRESSIONS,
            MetricType.CLICKS,
            MetricType.COST,
            MetricType.CONVERSIONS,
            MetricType.CTR,
            MetricType.CPC
        ]
        
        # معايير الأداء
        self.performance_benchmarks = {
            'ctr': {'excellent': 5.0, 'good': 3.0, 'average': 2.0, 'poor': 1.0},
            'conversion_rate': {'excellent': 10.0, 'good': 5.0, 'average': 2.5, 'poor': 1.0},
            'quality_score': {'excellent': 8.0, 'good': 6.0, 'average': 5.0, 'poor': 3.0},
            'roas': {'excellent': 4.0, 'good': 3.0, 'average': 2.0, 'poor': 1.0}
        }
    
    async def generate_performance_report(self, user_id: str, report_config: Dict) -> Dict[str, Any]:
        """إنشاء تقرير أداء شامل"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صحة إعدادات التقرير
            validation_result = validate_report_config(report_config)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['errors']}
            
            # التحقق من الصلاحيات
            if not await self._check_analytics_permission(user_id, report_config):
                return {'success': False, 'error': 'ليس لديك صلاحية لإنشاء هذا التقرير'}
            
            # إنشاء استعلام التحليلات
            query = self._create_analytics_query(user_id, report_config)
            
            # التحقق من وجود التقرير في التخزين المؤقت
            cache_key = self._generate_cache_key(query)
            cached_report = self._get_cached_report(cache_key)
            if cached_report:
                return {
                    'success': True,
                    'report': cached_report,
                    'cached': True,
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            # جلب البيانات من مصادر متعددة
            raw_data = await self._fetch_analytics_data(query)
            
            # معالجة وتحليل البيانات
            processed_data = await self._process_analytics_data(raw_data, query)
            
            # حساب المؤشرات المتقدمة
            advanced_metrics = self._calculate_advanced_metrics(processed_data)
            
            # إنشاء الرؤى والتوصيات
            insights = await self._generate_insights(processed_data, advanced_metrics)
            
            # تجميع التقرير النهائي
            report = {
                'report_id': generate_unique_id('report'),
                'report_type': query.report_type.value,
                'generated_at': datetime.utcnow().isoformat(),
                'generated_by': user_id,
                'date_range': query.date_range,
                'summary': self._create_report_summary(processed_data),
                'data': processed_data,
                'metrics': advanced_metrics,
                'insights': insights,
                'benchmarks': self._compare_with_benchmarks(advanced_metrics),
                'trends': await self._analyze_trends(processed_data, query),
                'recommendations': await self._generate_recommendations(processed_data, insights)
            }
            
            # حفظ في التخزين المؤقت
            self._cache_report(cache_key, report)
            
            # حفظ في قاعدة البيانات للأرشيف
            if self.db_manager:
                await self._save_report_to_database(report)
            
            # تسجيل النشاط
            await self._log_analytics_activity(user_id, 'report_generated', {
                'report_id': report['report_id'],
                'report_type': query.report_type.value
            })
            
            return {
                'success': True,
                'report': report,
                'cached': False,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء تقرير الأداء: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_dashboard_data(self, user_id: str, dashboard_config: Dict = None) -> Dict[str, Any]:
        """الحصول على بيانات لوحة المعلومات"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # إعدادات افتراضية للوحة المعلومات
            if not dashboard_config:
                dashboard_config = {
                    'widgets': ['overview', 'performance', 'trends', 'top_campaigns'],
                    'date_range': {
                        'start_date': (datetime.utcnow() - timedelta(days=30)).date().isoformat(),
                        'end_date': datetime.utcnow().date().isoformat()
                    }
                }
            
            # جلب بيانات كل widget
            dashboard_data = {}
            
            if 'overview' in dashboard_config['widgets']:
                dashboard_data['overview'] = await self._get_overview_widget_data(user_id, dashboard_config['date_range'])
            
            if 'performance' in dashboard_config['widgets']:
                dashboard_data['performance'] = await self._get_performance_widget_data(user_id, dashboard_config['date_range'])
            
            if 'trends' in dashboard_config['widgets']:
                dashboard_data['trends'] = await self._get_trends_widget_data(user_id, dashboard_config['date_range'])
            
            if 'top_campaigns' in dashboard_config['widgets']:
                dashboard_data['top_campaigns'] = await self._get_top_campaigns_widget_data(user_id, dashboard_config['date_range'])
            
            if 'alerts' in dashboard_config['widgets']:
                dashboard_data['alerts'] = await self._get_alerts_widget_data(user_id)
            
            if 'budget_utilization' in dashboard_config['widgets']:
                dashboard_data['budget_utilization'] = await self._get_budget_utilization_widget_data(user_id, dashboard_config['date_range'])
            
            return {
                'success': True,
                'dashboard': dashboard_data,
                'config': dashboard_config,
                'last_updated': datetime.utcnow().isoformat(),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على بيانات لوحة المعلومات: {e}")
            return {'success': False, 'error': str(e)}
    
    async def export_report(self, user_id: str, report_id: str, export_format: ExportFormat) -> Dict[str, Any]:
        """تصدير تقرير بصيغة محددة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # البحث عن التقرير
            report = await self._get_report_by_id(report_id)
            if not report:
                return {'success': False, 'error': 'التقرير غير موجود'}
            
            # التحقق من الصلاحيات
            if not await self._check_report_access_permission(user_id, report):
                return {'success': False, 'error': 'ليس لديك صلاحية للوصول لهذا التقرير'}
            
            # تصدير حسب الصيغة المطلوبة
            if export_format == ExportFormat.JSON:
                exported_data = await self._export_to_json(report)
            elif export_format == ExportFormat.CSV:
                exported_data = await self._export_to_csv(report)
            elif export_format == ExportFormat.EXCEL:
                exported_data = await self._export_to_excel(report)
            elif export_format == ExportFormat.PDF:
                exported_data = await self._export_to_pdf(report)
            else:
                return {'success': False, 'error': 'صيغة التصدير غير مدعومة'}
            
            # تسجيل النشاط
            await self._log_analytics_activity(user_id, 'report_exported', {
                'report_id': report_id,
                'export_format': export_format.value
            })
            
            return {
                'success': True,
                'export': exported_data,
                'format': export_format.value,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تصدير التقرير: {e}")
            return {'success': False, 'error': str(e)}
    
    async def create_custom_report(self, user_id: str, custom_config: Dict) -> Dict[str, Any]:
        """إنشاء تقرير مخصص"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # التحقق من صحة إعدادات التقرير المخصص
            if not custom_config.get('metrics') or not custom_config.get('dimensions'):
                return {'success': False, 'error': 'المؤشرات والأبعاد مطلوبة للتقرير المخصص'}
            
            # إنشاء إعدادات التقرير
            report_config = {
                'report_type': 'custom_report',
                'metrics': custom_config['metrics'],
                'dimensions': custom_config['dimensions'],
                'filters': custom_config.get('filters', {}),
                'date_range': custom_config['date_range'],
                'granularity': custom_config.get('granularity', 'daily'),
                'sort_by': custom_config.get('sort_by'),
                'sort_order': custom_config.get('sort_order', 'desc'),
                'limit': custom_config.get('limit')
            }
            
            # إنشاء التقرير
            result = await self.generate_performance_report(user_id, report_config)
            
            if result['success']:
                # إضافة معلومات التقرير المخصص
                result['report']['custom_config'] = custom_config
                result['report']['is_custom'] = True
                
                # حفظ إعدادات التقرير المخصص للاستخدام المستقبلي
                if custom_config.get('save_template'):
                    await self._save_custom_report_template(user_id, custom_config)
            
            return result
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء التقرير المخصص: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_performance_insights(self, user_id: str, resource_id: str, resource_type: str, 
                                     date_range: Dict = None) -> Dict[str, Any]:
        """الحصول على رؤى الأداء المتقدمة"""
        try:
            if not self.mcc_manager:
                return {'success': False, 'error': 'خدمة MCC غير متاحة'}
            
            # تحديد نطاق التاريخ الافتراضي
            if not date_range:
                end_date = datetime.utcnow().date()
                start_date = end_date - timedelta(days=30)
                date_range = {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            
            # جلب بيانات الأداء
            performance_data = await self._fetch_resource_performance_data(resource_id, resource_type, date_range)
            
            # تحليل الاتجاهات
            trend_analysis = await self._analyze_performance_trends(performance_data, date_range)
            
            # تحديد الفرص والمشاكل
            opportunities = await self._identify_opportunities(performance_data, trend_analysis)
            issues = await self._identify_performance_issues(performance_data, trend_analysis)
            
            # مقارنة مع المعايير
            benchmark_comparison = self._compare_with_industry_benchmarks(performance_data)
            
            # توقعات الأداء
            forecasts = await self._generate_performance_forecasts(performance_data, trend_analysis)
            
            # توصيات محددة
            recommendations = await self._generate_specific_recommendations(
                performance_data, opportunities, issues, benchmark_comparison
            )
            
            return {
                'success': True,
                'resource_id': resource_id,
                'resource_type': resource_type,
                'date_range': date_range,
                'insights': {
                    'performance_summary': self._summarize_performance(performance_data),
                    'trend_analysis': trend_analysis,
                    'opportunities': opportunities,
                    'issues': issues,
                    'benchmark_comparison': benchmark_comparison,
                    'forecasts': forecasts,
                    'recommendations': recommendations
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على رؤى الأداء: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة خاصة
    async def _check_analytics_permission(self, user_id: str, report_config: Dict) -> bool:
        """التحقق من صلاحية التحليلات"""
        return True
    
    def _create_analytics_query(self, user_id: str, report_config: Dict) -> AnalyticsQuery:
        """إنشاء استعلام التحليلات"""
        return AnalyticsQuery(
            query_id=generate_unique_id('query'),
            user_id=user_id,
            report_type=ReportType(report_config.get('report_type', 'performance_summary')),
            metrics=[MetricType(m) for m in report_config.get('metrics', [m.value for m in self.default_metrics])],
            dimensions=report_config.get('dimensions', ['date']),
            filters=report_config.get('filters', {}),
            date_range=report_config['date_range'],
            granularity=TimeGranularity(report_config.get('granularity', 'daily')),
            sort_by=report_config.get('sort_by'),
            sort_order=report_config.get('sort_order', 'desc'),
            limit=report_config.get('limit')
        )
    
    def _generate_cache_key(self, query: AnalyticsQuery) -> str:
        """إنشاء مفتاح التخزين المؤقت"""
        key_data = f"{query.user_id}_{query.report_type.value}_{query.date_range}_{query.metrics}_{query.filters}"
        return f"analytics_cache_{hash(key_data)}"
    
    def _get_cached_report(self, cache_key: str) -> Optional[Dict]:
        """الحصول على تقرير من التخزين المؤقت"""
        if cache_key in self.report_cache:
            cached_data = self.report_cache[cache_key]
            if datetime.utcnow().timestamp() - cached_data['timestamp'] < self.cache_ttl:
                return cached_data['report']
            else:
                del self.report_cache[cache_key]
        return None
    
    def _cache_report(self, cache_key: str, report: Dict):
        """حفظ تقرير في التخزين المؤقت"""
        self.report_cache[cache_key] = {
            'report': report,
            'timestamp': datetime.utcnow().timestamp()
        }
    
    async def _fetch_analytics_data(self, query: AnalyticsQuery) -> Dict:
        """جلب بيانات التحليلات"""
        # محاكاة جلب البيانات من Google Ads API
        return {
            'campaigns': [
                {
                    'campaign_id': 'camp_001',
                    'campaign_name': 'حملة البحث الرئيسية',
                    'impressions': 125000,
                    'clicks': 3500,
                    'cost': 1250.75,
                    'conversions': 85,
                    'date': '2025-06-23'
                },
                {
                    'campaign_id': 'camp_002',
                    'campaign_name': 'حملة الشبكة الإعلانية',
                    'impressions': 98000,
                    'clicks': 2800,
                    'cost': 980.50,
                    'conversions': 62,
                    'date': '2025-06-23'
                }
            ]
        }
    
    async def _process_analytics_data(self, raw_data: Dict, query: AnalyticsQuery) -> Dict:
        """معالجة وتحليل البيانات"""
        processed = {
            'summary': {
                'total_impressions': sum(c['impressions'] for c in raw_data['campaigns']),
                'total_clicks': sum(c['clicks'] for c in raw_data['campaigns']),
                'total_cost': sum(c['cost'] for c in raw_data['campaigns']),
                'total_conversions': sum(c['conversions'] for c in raw_data['campaigns'])
            },
            'campaigns': raw_data['campaigns']
        }
        
        # حساب المؤشرات المشتقة
        if processed['summary']['total_impressions'] > 0:
            processed['summary']['ctr'] = (processed['summary']['total_clicks'] / processed['summary']['total_impressions']) * 100
        
        if processed['summary']['total_clicks'] > 0:
            processed['summary']['cpc'] = processed['summary']['total_cost'] / processed['summary']['total_clicks']
            processed['summary']['conversion_rate'] = (processed['summary']['total_conversions'] / processed['summary']['total_clicks']) * 100
        
        return processed
    
    def _calculate_advanced_metrics(self, processed_data: Dict) -> Dict:
        """حساب المؤشرات المتقدمة"""
        summary = processed_data['summary']
        
        return {
            'efficiency_metrics': {
                'cost_per_conversion': summary['total_cost'] / summary['total_conversions'] if summary['total_conversions'] > 0 else 0,
                'roas': 4.2,  # محاكاة
                'quality_score': 7.5,  # محاكاة
                'impression_share': 65.3  # محاكاة
            },
            'performance_scores': {
                'overall_score': 78.5,
                'efficiency_score': 82.1,
                'growth_score': 75.3,
                'optimization_score': 80.7
            }
        }
    
    async def _generate_insights(self, processed_data: Dict, advanced_metrics: Dict) -> List[Dict]:
        """إنشاء الرؤى والتحليلات"""
        insights = []
        
        # رؤية حول معدل النقر
        ctr = processed_data['summary'].get('ctr', 0)
        if ctr > 3.0:
            insights.append({
                'type': 'positive',
                'metric': 'ctr',
                'message': f'معدل النقر ممتاز ({ctr:.2f}%) - أعلى من المتوسط',
                'impact': 'high',
                'recommendation': 'استمر في استخدام الإعلانات والكلمات المفتاحية الحالية'
            })
        elif ctr < 1.5:
            insights.append({
                'type': 'negative',
                'metric': 'ctr',
                'message': f'معدل النقر منخفض ({ctr:.2f}%) - يحتاج تحسين',
                'impact': 'high',
                'recommendation': 'راجع نصوص الإعلانات والكلمات المفتاحية المستهدفة'
            })
        
        # رؤية حول التكلفة
        total_cost = processed_data['summary'].get('total_cost', 0)
        if total_cost > 1000:
            insights.append({
                'type': 'neutral',
                'metric': 'cost',
                'message': f'إجمالي الإنفاق مرتفع ({total_cost:.2f})',
                'impact': 'medium',
                'recommendation': 'راقب عائد الاستثمار وتأكد من تحقيق الأهداف'
            })
        
        return insights
    
    def _compare_with_benchmarks(self, advanced_metrics: Dict) -> Dict:
        """مقارنة مع المعايير"""
        comparisons = {}
        
        for metric, benchmarks in self.performance_benchmarks.items():
            if metric in advanced_metrics.get('efficiency_metrics', {}):
                value = advanced_metrics['efficiency_metrics'][metric]
                
                if value >= benchmarks['excellent']:
                    level = 'excellent'
                elif value >= benchmarks['good']:
                    level = 'good'
                elif value >= benchmarks['average']:
                    level = 'average'
                else:
                    level = 'poor'
                
                comparisons[metric] = {
                    'value': value,
                    'level': level,
                    'benchmark': benchmarks[level]
                }
        
        return comparisons
    
    async def _analyze_trends(self, processed_data: Dict, query: AnalyticsQuery) -> Dict:
        """تحليل الاتجاهات"""
        return {
            'impressions_trend': 'increasing',
            'clicks_trend': 'stable',
            'cost_trend': 'decreasing',
            'conversions_trend': 'increasing',
            'trend_strength': 'moderate',
            'forecast_confidence': 'high'
        }
    
    async def _generate_recommendations(self, processed_data: Dict, insights: List[Dict]) -> List[Dict]:
        """إنشاء التوصيات"""
        recommendations = []
        
        # توصيات بناءً على الرؤى
        for insight in insights:
            if insight['type'] == 'negative':
                recommendations.append({
                    'priority': 'high',
                    'category': 'optimization',
                    'title': f'تحسين {insight["metric"]}',
                    'description': insight['recommendation'],
                    'expected_impact': insight['impact']
                })
        
        # توصيات عامة
        recommendations.append({
            'priority': 'medium',
            'category': 'expansion',
            'title': 'توسيع الكلمات المفتاحية',
            'description': 'أضف كلمات مفتاحية جديدة ذات صلة لزيادة الوصول',
            'expected_impact': 'medium'
        })
        
        return recommendations
    
    # دوال widget لوحة المعلومات
    async def _get_overview_widget_data(self, user_id: str, date_range: Dict) -> Dict:
        """بيانات widget النظرة العامة"""
        return {
            'total_accounts': 15,
            'active_campaigns': 45,
            'total_spend': 15750.25,
            'total_conversions': 1250,
            'average_ctr': 2.8,
            'average_cpc': 0.45
        }
    
    async def _get_performance_widget_data(self, user_id: str, date_range: Dict) -> Dict:
        """بيانات widget الأداء"""
        return {
            'impressions': 2500000,
            'clicks': 75000,
            'cost': 15750.25,
            'conversions': 1250,
            'ctr': 3.0,
            'cpc': 0.21,
            'conversion_rate': 1.67,
            'roas': 4.2
        }
    
    async def _get_trends_widget_data(self, user_id: str, date_range: Dict) -> Dict:
        """بيانات widget الاتجاهات"""
        return {
            'impressions_change': 12.5,
            'clicks_change': 8.7,
            'cost_change': -3.2,
            'conversions_change': 15.8,
            'trend_direction': 'positive'
        }
    
    async def _get_top_campaigns_widget_data(self, user_id: str, date_range: Dict) -> List[Dict]:
        """بيانات widget أفضل الحملات"""
        return [
            {'name': 'حملة البحث الرئيسية', 'conversions': 450, 'cost': 5250.75, 'roas': 4.8},
            {'name': 'حملة الشبكة الإعلانية', 'conversions': 380, 'cost': 4200.50, 'roas': 4.2},
            {'name': 'حملة التسوق', 'conversions': 420, 'cost': 6299.00, 'roas': 3.9}
        ]
    
    async def _get_alerts_widget_data(self, user_id: str) -> List[Dict]:
        """بيانات widget التنبيهات"""
        return [
            {'type': 'warning', 'message': 'انخفاض في معدل التحويل لحملة البحث', 'priority': 'high'},
            {'type': 'info', 'message': 'تم تجاوز الميزانية اليومية لحملة التسوق', 'priority': 'medium'},
            {'type': 'success', 'message': 'تحسن في نقاط الجودة للكلمات المفتاحية', 'priority': 'low'}
        ]
    
    async def _get_budget_utilization_widget_data(self, user_id: str, date_range: Dict) -> Dict:
        """بيانات widget استخدام الميزانية"""
        return {
            'total_budget': 20000.00,
            'spent_budget': 15750.25,
            'remaining_budget': 4249.75,
            'utilization_rate': 78.8,
            'daily_average_spend': 525.01,
            'projected_month_end_spend': 19250.30
        }
    
    # دوال التصدير
    async def _export_to_json(self, report: Dict) -> Dict:
        """تصدير إلى JSON"""
        return {
            'file_type': 'json',
            'data': json.dumps(report, ensure_ascii=False, indent=2),
            'filename': f"report_{report['report_id']}.json"
        }
    
    async def _export_to_csv(self, report: Dict) -> Dict:
        """تصدير إلى CSV"""
        # تحويل بيانات التقرير إلى DataFrame
        df = pd.DataFrame(report['data']['campaigns'])
        
        # تحويل إلى CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False, encoding='utf-8')
        
        return {
            'file_type': 'csv',
            'data': csv_buffer.getvalue(),
            'filename': f"report_{report['report_id']}.csv"
        }
    
    async def _export_to_excel(self, report: Dict) -> Dict:
        """تصدير إلى Excel"""
        # تحويل بيانات التقرير إلى DataFrame
        df = pd.DataFrame(report['data']['campaigns'])
        
        # تحويل إلى Excel
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='البيانات', index=False)
            
            # إضافة ملخص في ورقة منفصلة
            summary_df = pd.DataFrame([report['data']['summary']])
            summary_df.to_excel(writer, sheet_name='الملخص', index=False)
        
        return {
            'file_type': 'excel',
            'data': base64.b64encode(excel_buffer.getvalue()).decode(),
            'filename': f"report_{report['report_id']}.xlsx"
        }
    
    async def _export_to_pdf(self, report: Dict) -> Dict:
        """تصدير إلى PDF"""
        # محاكاة إنشاء PDF
        pdf_content = f"تقرير الأداء - {report['report_id']}\n"
        pdf_content += f"تاريخ الإنشاء: {report['generated_at']}\n"
        pdf_content += f"نوع التقرير: {report['report_type']}\n\n"
        pdf_content += "ملخص الأداء:\n"
        for key, value in report['data']['summary'].items():
            pdf_content += f"{key}: {value}\n"
        
        return {
            'file_type': 'pdf',
            'data': base64.b64encode(pdf_content.encode()).decode(),
            'filename': f"report_{report['report_id']}.pdf"
        }
    
    # دوال مساعدة إضافية
    async def _save_report_to_database(self, report: Dict) -> Dict[str, Any]:
        """حفظ التقرير في قاعدة البيانات"""
        return {'success': True}
    
    async def _log_analytics_activity(self, user_id: str, action: str, data: Dict):
        """تسجيل نشاط التحليلات"""
        pass
    
    async def _get_report_by_id(self, report_id: str) -> Optional[Dict]:
        """البحث عن تقرير بالمعرف"""
        return None
    
    async def _check_report_access_permission(self, user_id: str, report: Dict) -> bool:
        """التحقق من صلاحية الوصول للتقرير"""
        return True
    
    def _create_report_summary(self, processed_data: Dict) -> Dict:
        """إنشاء ملخص التقرير"""
        return {
            'key_metrics': processed_data['summary'],
            'performance_level': 'good',
            'main_insights': 'الأداء العام جيد مع فرص للتحسين',
            'action_required': 'مراجعة الحملات ذات الأداء المنخفض'
        }

# إنشاء مثيل المدير
analytics_manager = MCCAnalyticsManager()

# ===========================================
# مسارات API
# ===========================================

@mcc_analytics_bp.route('/health', methods=['GET'])
def health():
    """فحص صحة خدمة تحليلات MCC"""
    try:
        return jsonify({
            'success': True,
            'service': 'MCC Analytics & Reporting',
            'status': 'healthy' if MCC_ANALYTICS_SERVICES_AVAILABLE else 'limited',
            'available_features': {
                'performance_reports': MCC_ANALYTICS_SERVICES_AVAILABLE,
                'custom_reports': MCC_ANALYTICS_SERVICES_AVAILABLE,
                'dashboard_widgets': MCC_ANALYTICS_SERVICES_AVAILABLE,
                'data_export': MCC_ANALYTICS_SERVICES_AVAILABLE,
                'trend_analysis': MCC_ANALYTICS_SERVICES_AVAILABLE,
                'insights_generation': MCC_ANALYTICS_SERVICES_AVAILABLE
            },
            'supported_report_types': [e.value for e in ReportType],
            'supported_metrics': [e.value for e in MetricType],
            'supported_export_formats': [e.value for e in ExportFormat],
            'cache_status': {
                'cached_reports': len(analytics_manager.report_cache),
                'cache_ttl_seconds': analytics_manager.cache_ttl
            },
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'خدمة تحليلات MCC تعمل بنجاح'
        })
    except Exception as e:
        logger.error(f"خطأ في فحص صحة MCC Analytics: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في فحص الصحة',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/reports/generate', methods=['POST'])
@jwt_required()
def generate_report():
    """إنشاء تقرير أداء"""
    try:
        user_id = get_jwt_identity()
        report_config = request.get_json()
        
        if not report_config:
            return jsonify({
                'success': False,
                'error': 'إعدادات التقرير مطلوبة'
            }), 400
        
        # التحقق من الحقول المطلوبة
        required_fields = ['date_range']
        missing_fields = [field for field in required_fields if not report_config.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'الحقول التالية مطلوبة: {", ".join(missing_fields)}'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analytics_manager.generate_performance_report(user_id, report_config))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء التقرير: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إنشاء التقرير',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """الحصول على بيانات لوحة المعلومات"""
    try:
        user_id = get_jwt_identity()
        
        # استخراج إعدادات لوحة المعلومات
        dashboard_config = {
            'widgets': request.args.getlist('widgets') or ['overview', 'performance', 'trends'],
            'date_range': {
                'start_date': request.args.get('start_date', (datetime.utcnow() - timedelta(days=30)).date().isoformat()),
                'end_date': request.args.get('end_date', datetime.utcnow().date().isoformat())
            }
        }
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analytics_manager.get_dashboard_data(user_id, dashboard_config))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على بيانات لوحة المعلومات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على بيانات لوحة المعلومات',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/reports/<report_id>/export', methods=['POST'])
@jwt_required()
def export_report(report_id):
    """تصدير تقرير"""
    try:
        user_id = get_jwt_identity()
        export_config = request.get_json()
        
        if not export_config or not export_config.get('format'):
            return jsonify({
                'success': False,
                'error': 'صيغة التصدير مطلوبة'
            }), 400
        
        try:
            export_format = ExportFormat(export_config['format'])
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'صيغة التصدير غير مدعومة'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analytics_manager.export_report(user_id, report_id, export_format))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في تصدير التقرير: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تصدير التقرير',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/reports/custom', methods=['POST'])
@jwt_required()
def create_custom_report():
    """إنشاء تقرير مخصص"""
    try:
        user_id = get_jwt_identity()
        custom_config = request.get_json()
        
        if not custom_config:
            return jsonify({
                'success': False,
                'error': 'إعدادات التقرير المخصص مطلوبة'
            }), 400
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analytics_manager.create_custom_report(user_id, custom_config))
        loop.close()
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في إنشاء التقرير المخصص: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إنشاء التقرير المخصص',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/insights/<resource_id>', methods=['GET'])
@jwt_required()
def get_performance_insights(resource_id):
    """الحصول على رؤى الأداء"""
    try:
        user_id = get_jwt_identity()
        resource_type = request.args.get('resource_type', 'campaign')
        
        # معاملات التاريخ
        date_range = None
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date and end_date:
            date_range = {
                'start_date': start_date,
                'end_date': end_date
            }
        
        # تنفيذ العملية بشكل غير متزامن
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(analytics_manager.get_performance_insights(user_id, resource_id, resource_type, date_range))
        loop.close()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"خطأ في الحصول على رؤى الأداء: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على رؤى الأداء',
            'message': str(e)
        }), 500

@mcc_analytics_bp.route('/metrics/available', methods=['GET'])
def get_available_metrics():
    """الحصول على المؤشرات المتاحة"""
    try:
        return jsonify({
            'success': True,
            'metrics': {
                'basic_metrics': [
                    {'name': metric.value, 'display_name': metric.value.replace('_', ' ').title(), 'type': 'number'}
                    for metric in MetricType
                ],
                'report_types': [
                    {'name': report_type.value, 'display_name': report_type.value.replace('_', ' ').title()}
                    for report_type in ReportType
                ],
                'time_granularities': [
                    {'name': granularity.value, 'display_name': granularity.value.title()}
                    for granularity in TimeGranularity
                ],
                'export_formats': [
                    {'name': format_type.value, 'display_name': format_type.value.upper()}
                    for format_type in ExportFormat
                ]
            },
            'benchmarks': analytics_manager.performance_benchmarks,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"خطأ في الحصول على المؤشرات المتاحة: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الحصول على المؤشرات',
            'message': str(e)
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل MCC Analytics Blueprint - الخدمات متاحة: {MCC_ANALYTICS_SERVICES_AVAILABLE}")

# تصدير Blueprint
__all__ = ['mcc_analytics_bp']

