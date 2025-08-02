"""
Google Ads Reports & Analytics
نظام التقارير والتحليلات المتطور لـ Google Ads

يوفر نظام تقارير شامل ومتطور لـ Google Ads بما في ذلك:
- تقارير الأداء التفصيلية
- تحليلات متقدمة بالذكاء الاصطناعي
- تقارير مخصصة وقابلة للتخصيص
- تصدير البيانات بصيغ متعددة
- لوحات معلومات تفاعلية
- تحليل الاتجاهات والتنبؤات
- مقارنات الأداء والمعايير
- تقارير ROI والعائد على الاستثمار

Author: Google Ads Analytics Team
Version: 2.2.0
Security Level: Enterprise
Performance: AI-Powered Analytics Engine
"""

import os
import asyncio
import aiohttp
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from collections import defaultdict, Counter
import hashlib
import uuid
import math
import io
import base64

# Flask imports
from flask import Blueprint, request, jsonify, current_app, send_file, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

# Third-party imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.io as pio

# Local imports
import logging

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إنشاء Blueprint مع إعدادات متقدمة
google_ads_reports_bp = Blueprint(
    'google_ads_reports',
    __name__,
    url_prefix='/api/google-ads/reports',
    static_folder=None,
    template_folder=None
)

# محاولة استيراد الخدمات المطلوبة
REPORTS_SERVICES_STATUS = {
    'google_ads_client': False,
    'database': False,
    'redis': False,
    'validators': False,
    'helpers': False,
    'ai_services': False,
    'data_processing': False,
    'visualization': False
}

try:
    from services.google_ads_client import GoogleAdsClientManager
    REPORTS_SERVICES_STATUS['google_ads_client'] = True
except ImportError as e:
    logger.warning(f"⚠️ GoogleAdsClientManager غير متاح: {e}")

try:
    from utils.database import DatabaseManager
    REPORTS_SERVICES_STATUS['database'] = True
except ImportError as e:
    logger.warning(f"⚠️ DatabaseManager غير متاح: {e}")

try:
    from utils.redis_config import cache_set, cache_get, cache_delete
    REPORTS_SERVICES_STATUS['redis'] = True
except ImportError as e:
    logger.warning(f"⚠️ Redis غير متاح: {e}")

try:
    from utils.validators import validate_customer_id, validate_date_range
    REPORTS_SERVICES_STATUS['validators'] = True
except ImportError as e:
    logger.warning(f"⚠️ Validators غير متاح: {e}")

try:
    from utils.helpers import (
        generate_unique_id, sanitize_text, format_currency,
        calculate_performance_score, format_percentage
    )
    REPORTS_SERVICES_STATUS['helpers'] = True
except ImportError as e:
    logger.warning(f"⚠️ Helpers غير متاح: {e}")

try:
    from services.ai_services import DataAnalysisService, PredictionService
    REPORTS_SERVICES_STATUS['ai_services'] = True
except ImportError as e:
    logger.warning(f"⚠️ AI Services غير متاح: {e}")

try:
    from services.data_processing import DataProcessor, MetricsCalculator
    REPORTS_SERVICES_STATUS['data_processing'] = True
except ImportError as e:
    logger.warning(f"⚠️ Data Processing غير متاح: {e}")

try:
    from services.visualization import ChartGenerator, DashboardBuilder
    REPORTS_SERVICES_STATUS['visualization'] = True
except ImportError as e:
    logger.warning(f"⚠️ Visualization غير متاح: {e}")

# تحديد حالة الخدمات
REPORTS_SERVICES_AVAILABLE = any(REPORTS_SERVICES_STATUS.values())
logger.info(f"✅ تم تحميل خدمات Reports - الخدمات المتاحة: {sum(REPORTS_SERVICES_STATUS.values())}/8")

# إعداد Thread Pool للعمليات المتوازية
reports_executor = ThreadPoolExecutor(max_workers=30, thread_name_prefix="reports_worker")

class ReportType(Enum):
    """أنواع التقارير"""
    PERFORMANCE = "performance"
    CAMPAIGN = "campaign"
    KEYWORD = "keyword"
    AD_GROUP = "ad_group"
    AUDIENCE = "audience"
    GEOGRAPHIC = "geographic"
    DEVICE = "device"
    TIME_BASED = "time_based"
    CONVERSION = "conversion"
    BUDGET = "budget"
    QUALITY_SCORE = "quality_score"
    COMPETITIVE = "competitive"
    CUSTOM = "custom"

class ReportFormat(Enum):
    """صيغ التقارير"""
    JSON = "json"
    CSV = "csv"
    EXCEL = "excel"
    PDF = "pdf"
    HTML = "html"
    CHART = "chart"
    DASHBOARD = "dashboard"

class TimeGranularity(Enum):
    """دقة الوقت"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class MetricType(Enum):
    """أنواع المقاييس"""
    IMPRESSIONS = "impressions"
    CLICKS = "clicks"
    CTR = "ctr"
    CPC = "cpc"
    COST = "cost"
    CONVERSIONS = "conversions"
    CONVERSION_RATE = "conversion_rate"
    CPA = "cpa"
    ROAS = "roas"
    QUALITY_SCORE = "quality_score"
    IMPRESSION_SHARE = "impression_share"
    SEARCH_IMPRESSION_SHARE = "search_impression_share"

@dataclass
class ReportConfig:
    """إعدادات التقرير"""
    report_type: ReportType
    date_range: Dict[str, str]
    metrics: List[MetricType]
    dimensions: List[str] = field(default_factory=list)
    filters: Dict[str, Any] = field(default_factory=dict)
    granularity: TimeGranularity = TimeGranularity.DAILY
    format: ReportFormat = ReportFormat.JSON
    include_charts: bool = True
    include_insights: bool = True
    include_recommendations: bool = True
    custom_segments: List[str] = field(default_factory=list)
    comparison_periods: List[Dict[str, str]] = field(default_factory=list)

@dataclass
class ReportData:
    """بيانات التقرير"""
    report_id: str
    config: ReportConfig
    data: List[Dict[str, Any]]
    summary: Dict[str, Any]
    insights: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    charts: List[Dict[str, Any]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    generated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    processing_time: float = 0.0

@dataclass
class DashboardConfig:
    """إعدادات لوحة المعلومات"""
    dashboard_id: str
    title: str
    widgets: List[Dict[str, Any]]
    layout: Dict[str, Any]
    refresh_interval: int = 300  # 5 دقائق
    auto_refresh: bool = True
    filters: Dict[str, Any] = field(default_factory=dict)
    permissions: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AnalyticsInsight:
    """رؤية تحليلية"""
    insight_id: str
    type: str
    title: str
    description: str
    impact_level: str  # high, medium, low
    confidence_score: float
    supporting_data: Dict[str, Any]
    recommendations: List[str]
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class DataAnalyzer:
    """محلل البيانات المتطور"""
    
    def __init__(self):
        """تهيئة محلل البيانات"""
        self.analysis_cache = {}
        self.ml_models = {}
        self.scaler = StandardScaler()
    
    async def analyze_performance_data(self, data: List[Dict[str, Any]], 
                                     config: ReportConfig) -> Dict[str, Any]:
        """تحليل بيانات الأداء"""
        try:
            if not data:
                return {'error': 'لا توجد بيانات للتحليل'}
            
            # تحويل البيانات إلى DataFrame
            df = pd.DataFrame(data)
            
            analysis = {
                'basic_stats': await self._calculate_basic_statistics(df),
                'trends': await self._analyze_trends(df, config.granularity),
                'correlations': await self._analyze_correlations(df),
                'anomalies': await self._detect_anomalies(df),
                'segments': await self._analyze_segments(df),
                'predictions': await self._generate_predictions(df),
                'insights': await self._generate_insights(df, config)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"خطأ في تحليل بيانات الأداء: {e}")
            return {'error': str(e)}
    
    async def _calculate_basic_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """حساب الإحصائيات الأساسية"""
        try:
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            stats = {
                'total_rows': len(df),
                'date_range': {
                    'start': df['date'].min() if 'date' in df.columns else None,
                    'end': df['date'].max() if 'date' in df.columns else None
                },
                'metrics_summary': {}
            }
            
            for col in numeric_columns:
                if col in ['impressions', 'clicks', 'cost', 'conversions']:
                    stats['metrics_summary'][col] = {
                        'total': float(df[col].sum()),
                        'average': float(df[col].mean()),
                        'median': float(df[col].median()),
                        'std': float(df[col].std()),
                        'min': float(df[col].min()),
                        'max': float(df[col].max())
                    }
            
            # حساب المقاييس المشتقة
            if 'impressions' in df.columns and 'clicks' in df.columns:
                total_impressions = df['impressions'].sum()
                total_clicks = df['clicks'].sum()
                stats['derived_metrics'] = {
                    'overall_ctr': (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
                    'avg_cpc': (df['cost'].sum() / total_clicks) if total_clicks > 0 else 0,
                    'total_conversion_rate': (df['conversions'].sum() / total_clicks * 100) if total_clicks > 0 else 0
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"خطأ في حساب الإحصائيات الأساسية: {e}")
            return {}
    
    async def _analyze_trends(self, df: pd.DataFrame, granularity: TimeGranularity) -> Dict[str, Any]:
        """تحليل الاتجاهات"""
        try:
            if 'date' not in df.columns:
                return {'error': 'عمود التاريخ غير موجود'}
            
            # تحويل التاريخ
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            trends = {}
            numeric_columns = ['impressions', 'clicks', 'cost', 'conversions', 'ctr', 'cpc']
            
            for col in numeric_columns:
                if col in df.columns:
                    # حساب الاتجاه باستخدام الانحدار الخطي
                    x = np.arange(len(df)).reshape(-1, 1)
                    y = df[col].values
                    
                    model = LinearRegression()
                    model.fit(x, y)
                    
                    slope = model.coef_[0]
                    r_squared = model.score(x, y)
                    
                    # تحديد اتجاه التغيير
                    if slope > 0.01:
                        direction = 'increasing'
                    elif slope < -0.01:
                        direction = 'decreasing'
                    else:
                        direction = 'stable'
                    
                    # حساب معدل التغيير
                    if len(df) >= 7:
                        recent_avg = df[col].tail(7).mean()
                        previous_avg = df[col].head(7).mean()
                        change_rate = ((recent_avg - previous_avg) / previous_avg * 100) if previous_avg > 0 else 0
                    else:
                        change_rate = 0
                    
                    trends[col] = {
                        'direction': direction,
                        'slope': float(slope),
                        'r_squared': float(r_squared),
                        'change_rate_percentage': float(change_rate),
                        'trend_strength': 'strong' if abs(slope) > 0.1 else 'moderate' if abs(slope) > 0.05 else 'weak'
                    }
            
            return trends
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الاتجاهات: {e}")
            return {}
    
    async def _analyze_correlations(self, df: pd.DataFrame) -> Dict[str, Any]:
        """تحليل الارتباطات"""
        try:
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            if len(numeric_columns) < 2:
                return {'error': 'عدد غير كافٍ من الأعمدة الرقمية'}
            
            # حساب مصفوفة الارتباط
            correlation_matrix = df[numeric_columns].corr()
            
            # العثور على أقوى الارتباطات
            correlations = []
            for i in range(len(correlation_matrix.columns)):
                for j in range(i+1, len(correlation_matrix.columns)):
                    col1 = correlation_matrix.columns[i]
                    col2 = correlation_matrix.columns[j]
                    corr_value = correlation_matrix.iloc[i, j]
                    
                    if not np.isnan(corr_value) and abs(corr_value) > 0.3:
                        correlations.append({
                            'metric1': col1,
                            'metric2': col2,
                            'correlation': float(corr_value),
                            'strength': 'strong' if abs(corr_value) > 0.7 else 'moderate' if abs(corr_value) > 0.5 else 'weak',
                            'direction': 'positive' if corr_value > 0 else 'negative'
                        })
            
            # ترتيب حسب قوة الارتباط
            correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
            
            return {
                'correlation_matrix': correlation_matrix.to_dict(),
                'significant_correlations': correlations[:10],  # أقوى 10 ارتباطات
                'insights': await self._generate_correlation_insights(correlations)
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الارتباطات: {e}")
            return {}
    
    async def _detect_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """كشف الشذوذ في البيانات"""
        try:
            anomalies = {}
            numeric_columns = ['impressions', 'clicks', 'cost', 'conversions']
            
            for col in numeric_columns:
                if col in df.columns:
                    # استخدام IQR لكشف الشذوذ
                    Q1 = df[col].quantile(0.25)
                    Q3 = df[col].quantile(0.75)
                    IQR = Q3 - Q1
                    
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    
                    # العثور على القيم الشاذة
                    outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
                    
                    if len(outliers) > 0:
                        anomalies[col] = {
                            'count': len(outliers),
                            'percentage': (len(outliers) / len(df)) * 100,
                            'outlier_values': outliers[col].tolist(),
                            'bounds': {
                                'lower': float(lower_bound),
                                'upper': float(upper_bound)
                            }
                        }
            
            return anomalies
            
        except Exception as e:
            logger.error(f"خطأ في كشف الشذوذ: {e}")
            return {}
    
    async def _analyze_segments(self, df: pd.DataFrame) -> Dict[str, Any]:
        """تحليل الشرائح"""
        try:
            segments = {}
            
            # تحليل حسب الجهاز (إذا كان متاحاً)
            if 'device' in df.columns:
                device_analysis = df.groupby('device').agg({
                    'impressions': 'sum',
                    'clicks': 'sum',
                    'cost': 'sum',
                    'conversions': 'sum'
                }).reset_index()
                
                device_analysis['ctr'] = (device_analysis['clicks'] / device_analysis['impressions'] * 100)
                device_analysis['conversion_rate'] = (device_analysis['conversions'] / device_analysis['clicks'] * 100)
                
                segments['device'] = device_analysis.to_dict('records')
            
            # تحليل حسب الوقت (يوم الأسبوع)
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
                df['day_of_week'] = df['date'].dt.day_name()
                
                day_analysis = df.groupby('day_of_week').agg({
                    'impressions': 'sum',
                    'clicks': 'sum',
                    'cost': 'sum',
                    'conversions': 'sum'
                }).reset_index()
                
                day_analysis['ctr'] = (day_analysis['clicks'] / day_analysis['impressions'] * 100)
                segments['day_of_week'] = day_analysis.to_dict('records')
            
            # تجميع الأداء (عالي، متوسط، منخفض)
            if 'ctr' in df.columns:
                df['performance_tier'] = pd.cut(df['ctr'], 
                                              bins=[0, 2, 5, float('inf')], 
                                              labels=['منخفض', 'متوسط', 'عالي'])
                
                performance_analysis = df.groupby('performance_tier').agg({
                    'impressions': 'sum',
                    'clicks': 'sum',
                    'cost': 'sum',
                    'conversions': 'sum'
                }).reset_index()
                
                segments['performance_tier'] = performance_analysis.to_dict('records')
            
            return segments
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الشرائح: {e}")
            return {}
    
    async def _generate_predictions(self, df: pd.DataFrame) -> Dict[str, Any]:
        """توليد التنبؤات"""
        try:
            if len(df) < 7:  # نحتاج بيانات كافية للتنبؤ
                return {'error': 'بيانات غير كافية للتنبؤ'}
            
            predictions = {}
            
            # تحضير البيانات للتنبؤ
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
                df = df.sort_values('date')
                
                # إنشاء ميزات زمنية
                df['day_of_year'] = df['date'].dt.dayofyear
                df['day_of_week'] = df['date'].dt.dayofweek
                df['month'] = df['date'].dt.month
                
                features = ['day_of_year', 'day_of_week', 'month']
                
                for metric in ['impressions', 'clicks', 'cost', 'conversions']:
                    if metric in df.columns:
                        # تحضير البيانات
                        X = df[features].values
                        y = df[metric].values
                        
                        # تدريب نموذج Random Forest
                        model = RandomForestRegressor(n_estimators=100, random_state=42)
                        model.fit(X, y)
                        
                        # التنبؤ للأيام السبعة القادمة
                        future_dates = pd.date_range(start=df['date'].max() + timedelta(days=1), periods=7)
                        future_features = []
                        
                        for date in future_dates:
                            future_features.append([
                                date.dayofyear,
                                date.dayofweek,
                                date.month
                            ])
                        
                        future_predictions = model.predict(future_features)
                        
                        predictions[metric] = {
                            'next_7_days': [
                                {
                                    'date': date.isoformat(),
                                    'predicted_value': float(pred),
                                    'confidence': 'medium'  # يمكن تحسينها بحساب فترات الثقة
                                }
                                for date, pred in zip(future_dates, future_predictions)
                            ],
                            'total_predicted': float(future_predictions.sum()),
                            'average_predicted': float(future_predictions.mean())
                        }
            
            return predictions
            
        except Exception as e:
            logger.error(f"خطأ في توليد التنبؤات: {e}")
            return {}
    
    async def _generate_insights(self, df: pd.DataFrame, config: ReportConfig) -> List[AnalyticsInsight]:
        """توليد الرؤى التحليلية"""
        insights = []
        
        try:
            # رؤى الأداء العام
            if 'ctr' in df.columns:
                avg_ctr = df['ctr'].mean()
                if avg_ctr < 2.0:
                    insights.append(AnalyticsInsight(
                        insight_id=generate_unique_id('insight') if REPORTS_SERVICES_STATUS['helpers'] else f"insight_{int(time.time())}",
                        type="performance",
                        title="معدل النقر منخفض",
                        description=f"متوسط معدل النقر {avg_ctr:.2f}% أقل من المعدل المطلوب (2%)",
                        impact_level="high",
                        confidence_score=0.85,
                        supporting_data={'avg_ctr': avg_ctr, 'benchmark': 2.0},
                        recommendations=[
                            "تحسين نصوص الإعلانات",
                            "إضافة امتدادات الإعلانات",
                            "مراجعة الاستهداف"
                        ]
                    ))
                elif avg_ctr > 5.0:
                    insights.append(AnalyticsInsight(
                        insight_id=generate_unique_id('insight') if REPORTS_SERVICES_STATUS['helpers'] else f"insight_{int(time.time())}",
                        type="performance",
                        title="معدل النقر ممتاز",
                        description=f"متوسط معدل النقر {avg_ctr:.2f}% أعلى من المتوسط",
                        impact_level="medium",
                        confidence_score=0.90,
                        supporting_data={'avg_ctr': avg_ctr, 'benchmark': 2.0},
                        recommendations=[
                            "الحفاظ على الاستراتيجية الحالية",
                            "توسيع الحملة",
                            "زيادة الميزانية"
                        ]
                    ))
            
            # رؤى التكلفة
            if 'cost' in df.columns and 'conversions' in df.columns:
                total_cost = df['cost'].sum()
                total_conversions = df['conversions'].sum()
                
                if total_conversions > 0:
                    avg_cpa = total_cost / total_conversions
                    if avg_cpa > 150:
                        insights.append(AnalyticsInsight(
                            insight_id=generate_unique_id('insight') if REPORTS_SERVICES_STATUS['helpers'] else f"insight_{int(time.time())}",
                            type="cost",
                            title="تكلفة التحويل مرتفعة",
                            description=f"متوسط تكلفة التحويل {avg_cpa:.2f} ريال أعلى من المطلوب",
                            impact_level="high",
                            confidence_score=0.80,
                            supporting_data={'avg_cpa': avg_cpa, 'total_cost': total_cost, 'total_conversions': total_conversions},
                            recommendations=[
                                "تحسين الكلمات المفتاحية",
                                "تحسين الصفحات المقصودة",
                                "مراجعة استراتيجية العروض"
                            ]
                        ))
            
            # رؤى الاتجاهات
            if len(df) >= 7 and 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
                df = df.sort_values('date')
                
                # تحليل اتجاه التكلفة
                if 'cost' in df.columns:
                    recent_cost = df['cost'].tail(3).mean()
                    previous_cost = df['cost'].head(3).mean()
                    
                    if recent_cost > previous_cost * 1.2:
                        insights.append(AnalyticsInsight(
                            insight_id=generate_unique_id('insight') if REPORTS_SERVICES_STATUS['helpers'] else f"insight_{int(time.time())}",
                            type="trend",
                            title="ارتفاع في التكلفة",
                            description="التكلفة في ارتفاع مستمر خلال الفترة الأخيرة",
                            impact_level="medium",
                            confidence_score=0.75,
                            supporting_data={'recent_cost': recent_cost, 'previous_cost': previous_cost},
                            recommendations=[
                                "مراجعة المنافسة",
                                "تحسين نقاط الجودة",
                                "إعادة تقييم الاستهداف"
                            ]
                        ))
            
            return insights
            
        except Exception as e:
            logger.error(f"خطأ في توليد الرؤى: {e}")
            return []
    
    async def _generate_correlation_insights(self, correlations: List[Dict[str, Any]]) -> List[str]:
        """توليد رؤى الارتباط"""
        insights = []
        
        for corr in correlations[:5]:  # أقوى 5 ارتباطات
            if corr['correlation'] > 0.7:
                insights.append(f"ارتباط قوي إيجابي بين {corr['metric1']} و {corr['metric2']} ({corr['correlation']:.2f})")
            elif corr['correlation'] < -0.7:
                insights.append(f"ارتباط قوي سلبي بين {corr['metric1']} و {corr['metric2']} ({corr['correlation']:.2f})")
            elif abs(corr['correlation']) > 0.5:
                direction = "إيجابي" if corr['correlation'] > 0 else "سلبي"
                insights.append(f"ارتباط متوسط {direction} بين {corr['metric1']} و {corr['metric2']} ({corr['correlation']:.2f})")
        
        return insights

class ChartGenerator:
    """مولد الرسوم البيانية"""
    
    def __init__(self):
        """تهيئة مولد الرسوم البيانية"""
        # إعداد الألوان والأنماط
        self.color_palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
        plt.style.use('seaborn-v0_8')
        
    async def generate_performance_charts(self, df: pd.DataFrame, config: ReportConfig) -> List[Dict[str, Any]]:
        """توليد رسوم الأداء"""
        charts = []
        
        try:
            # رسم الاتجاهات الزمنية
            if 'date' in df.columns and config.granularity == TimeGranularity.DAILY:
                time_series_chart = await self._create_time_series_chart(df)
                if time_series_chart:
                    charts.append(time_series_chart)
            
            # رسم توزيع المقاييس
            metrics_distribution_chart = await self._create_metrics_distribution_chart(df)
            if metrics_distribution_chart:
                charts.append(metrics_distribution_chart)
            
            # رسم الارتباطات
            correlation_chart = await self._create_correlation_heatmap(df)
            if correlation_chart:
                charts.append(correlation_chart)
            
            # رسم الأداء حسب الشرائح
            if 'device' in df.columns:
                device_performance_chart = await self._create_device_performance_chart(df)
                if device_performance_chart:
                    charts.append(device_performance_chart)
            
            return charts
            
        except Exception as e:
            logger.error(f"خطأ في توليد الرسوم البيانية: {e}")
            return []
    
    async def _create_time_series_chart(self, df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """إنشاء رسم الاتجاهات الزمنية"""
        try:
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # إنشاء رسم تفاعلي باستخدام Plotly
            fig = make_subplots(
                rows=2, cols=2,
                subplot_titles=('الظهور والنقرات', 'معدل النقر', 'التكلفة', 'التحويلات'),
                specs=[[{"secondary_y": True}, {"secondary_y": False}],
                       [{"secondary_y": False}, {"secondary_y": False}]]
            )
            
            # الظهور والنقرات
            if 'impressions' in df.columns:
                fig.add_trace(
                    go.Scatter(x=df['date'], y=df['impressions'], name='الظهور', line=dict(color='blue')),
                    row=1, col=1
                )
            
            if 'clicks' in df.columns:
                fig.add_trace(
                    go.Scatter(x=df['date'], y=df['clicks'], name='النقرات', line=dict(color='orange')),
                    row=1, col=1, secondary_y=True
                )
            
            # معدل النقر
            if 'ctr' in df.columns:
                fig.add_trace(
                    go.Scatter(x=df['date'], y=df['ctr'], name='معدل النقر %', line=dict(color='green')),
                    row=1, col=2
                )
            
            # التكلفة
            if 'cost' in df.columns:
                fig.add_trace(
                    go.Scatter(x=df['date'], y=df['cost'], name='التكلفة', line=dict(color='red')),
                    row=2, col=1
                )
            
            # التحويلات
            if 'conversions' in df.columns:
                fig.add_trace(
                    go.Scatter(x=df['date'], y=df['conversions'], name='التحويلات', line=dict(color='purple')),
                    row=2, col=2
                )
            
            fig.update_layout(
                title='اتجاهات الأداء الزمنية',
                height=600,
                showlegend=True
            )
            
            # تحويل إلى JSON
            chart_json = pio.to_json(fig)
            
            return {
                'type': 'time_series',
                'title': 'اتجاهات الأداء الزمنية',
                'data': json.loads(chart_json),
                'format': 'plotly'
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رسم الاتجاهات الزمنية: {e}")
            return None
    
    async def _create_metrics_distribution_chart(self, df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """إنشاء رسم توزيع المقاييس"""
        try:
            metrics = ['impressions', 'clicks', 'cost', 'conversions']
            available_metrics = [m for m in metrics if m in df.columns]
            
            if not available_metrics:
                return None
            
            fig = go.Figure()
            
            for metric in available_metrics:
                fig.add_trace(go.Box(
                    y=df[metric],
                    name=metric,
                    boxpoints='outliers'
                ))
            
            fig.update_layout(
                title='توزيع المقاييس',
                yaxis_title='القيم',
                xaxis_title='المقاييس'
            )
            
            chart_json = pio.to_json(fig)
            
            return {
                'type': 'box_plot',
                'title': 'توزيع المقاييس',
                'data': json.loads(chart_json),
                'format': 'plotly'
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رسم توزيع المقاييس: {e}")
            return None
    
    async def _create_correlation_heatmap(self, df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """إنشاء خريطة حرارية للارتباطات"""
        try:
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            if len(numeric_columns) < 2:
                return None
            
            correlation_matrix = df[numeric_columns].corr()
            
            fig = go.Figure(data=go.Heatmap(
                z=correlation_matrix.values,
                x=correlation_matrix.columns,
                y=correlation_matrix.columns,
                colorscale='RdBu',
                zmid=0,
                text=correlation_matrix.round(2).values,
                texttemplate="%{text}",
                textfont={"size": 10}
            ))
            
            fig.update_layout(
                title='مصفوفة الارتباط بين المقاييس',
                xaxis_title='المقاييس',
                yaxis_title='المقاييس'
            )
            
            chart_json = pio.to_json(fig)
            
            return {
                'type': 'heatmap',
                'title': 'مصفوفة الارتباط',
                'data': json.loads(chart_json),
                'format': 'plotly'
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء خريطة الارتباط: {e}")
            return None
    
    async def _create_device_performance_chart(self, df: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """إنشاء رسم أداء الأجهزة"""
        try:
            device_data = df.groupby('device').agg({
                'impressions': 'sum',
                'clicks': 'sum',
                'cost': 'sum',
                'conversions': 'sum'
            }).reset_index()
            
            device_data['ctr'] = (device_data['clicks'] / device_data['impressions'] * 100)
            
            fig = make_subplots(
                rows=1, cols=2,
                subplot_titles=('التوزيع حسب الجهاز', 'معدل النقر حسب الجهاز'),
                specs=[[{"type": "pie"}, {"type": "bar"}]]
            )
            
            # رسم دائري للتوزيع
            fig.add_trace(
                go.Pie(labels=device_data['device'], values=device_data['clicks'], name="النقرات"),
                row=1, col=1
            )
            
            # رسم بياني لمعدل النقر
            fig.add_trace(
                go.Bar(x=device_data['device'], y=device_data['ctr'], name="معدل النقر %"),
                row=1, col=2
            )
            
            fig.update_layout(title='أداء الأجهزة')
            
            chart_json = pio.to_json(fig)
            
            return {
                'type': 'device_performance',
                'title': 'أداء الأجهزة',
                'data': json.loads(chart_json),
                'format': 'plotly'
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رسم أداء الأجهزة: {e}")
            return None

class ReportGenerator:
    """مولد التقارير المتطور"""
    
    def __init__(self):
        """تهيئة مولد التقارير"""
        self.google_ads_client = GoogleAdsClientManager() if REPORTS_SERVICES_STATUS['google_ads_client'] else None
        self.db_manager = DatabaseManager() if REPORTS_SERVICES_STATUS['database'] else None
        self.data_analyzer = DataAnalyzer()
        self.chart_generator = ChartGenerator()
        
        # إحصائيات الخدمة
        self.service_stats = {
            'total_reports_generated': 0,
            'reports_by_type': defaultdict(int),
            'average_processing_time': 0.0,
            'last_report_generated': None,
            'cache_hit_rate': 0.0
        }
        
        logger.info("🚀 تم تهيئة مولد التقارير المتطور")
    
    async def generate_report(self, customer_id: str, config: ReportConfig) -> ReportData:
        """توليد تقرير"""
        start_time = time.time()
        
        try:
            # إنشاء معرف التقرير
            report_id = generate_unique_id('report') if REPORTS_SERVICES_STATUS['helpers'] else f"report_{int(time.time())}"
            
            # التحقق من التخزين المؤقت
            cache_key = f"report_{customer_id}_{hash(str(asdict(config)))}"
            cached_report = await self._get_cached_report(cache_key)
            
            if cached_report:
                logger.info(f"تم جلب التقرير من التخزين المؤقت: {report_id}")
                self.service_stats['cache_hit_rate'] += 1
                return cached_report
            
            # جلب البيانات
            raw_data = await self._fetch_report_data(customer_id, config)
            
            if not raw_data:
                return ReportData(
                    report_id=report_id,
                    config=config,
                    data=[],
                    summary={'error': 'لا توجد بيانات متاحة'},
                    processing_time=time.time() - start_time
                )
            
            # تحليل البيانات
            analysis = await self.data_analyzer.analyze_performance_data(raw_data, config)
            
            # توليد الرسوم البيانية
            charts = []
            if config.include_charts:
                df = pd.DataFrame(raw_data)
                charts = await self.chart_generator.generate_performance_charts(df, config)
            
            # توليد الملخص
            summary = await self._generate_summary(raw_data, analysis)
            
            # توليد الرؤى
            insights = []
            if config.include_insights and 'insights' in analysis:
                insights = [insight.description for insight in analysis['insights']]
            
            # توليد التوصيات
            recommendations = []
            if config.include_recommendations:
                recommendations = await self._generate_recommendations(raw_data, analysis)
            
            # إنشاء التقرير
            report = ReportData(
                report_id=report_id,
                config=config,
                data=raw_data,
                summary=summary,
                insights=insights,
                recommendations=recommendations,
                charts=charts,
                metadata={
                    'total_rows': len(raw_data),
                    'analysis_results': analysis,
                    'generation_timestamp': datetime.now(timezone.utc).isoformat()
                },
                processing_time=time.time() - start_time
            )
            
            # حفظ في التخزين المؤقت
            await self._cache_report(cache_key, report)
            
            # تحديث الإحصائيات
            self.service_stats['total_reports_generated'] += 1
            self.service_stats['reports_by_type'][config.report_type.value] += 1
            self.service_stats['last_report_generated'] = datetime.now(timezone.utc)
            
            # تحديث متوسط وقت المعالجة
            current_avg = self.service_stats['average_processing_time']
            total_reports = self.service_stats['total_reports_generated']
            self.service_stats['average_processing_time'] = (
                (current_avg * (total_reports - 1) + report.processing_time) / total_reports
            )
            
            return report
            
        except Exception as e:
            logger.error(f"خطأ في توليد التقرير: {e}")
            return ReportData(
                report_id=f"error_{int(time.time())}",
                config=config,
                data=[],
                summary={'error': str(e)},
                processing_time=time.time() - start_time
            )
    
    async def export_report(self, report: ReportData, format: ReportFormat) -> Dict[str, Any]:
        """تصدير التقرير بصيغة محددة"""
        try:
            if format == ReportFormat.JSON:
                return await self._export_json(report)
            elif format == ReportFormat.CSV:
                return await self._export_csv(report)
            elif format == ReportFormat.EXCEL:
                return await self._export_excel(report)
            elif format == ReportFormat.PDF:
                return await self._export_pdf(report)
            elif format == ReportFormat.HTML:
                return await self._export_html(report)
            else:
                return {'error': f'صيغة غير مدعومة: {format.value}'}
                
        except Exception as e:
            logger.error(f"خطأ في تصدير التقرير: {e}")
            return {'error': str(e)}
    
    async def create_dashboard(self, customer_id: str, config: DashboardConfig) -> Dict[str, Any]:
        """إنشاء لوحة معلومات"""
        try:
            dashboard_data = {
                'dashboard_id': config.dashboard_id,
                'title': config.title,
                'widgets': [],
                'layout': config.layout,
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            # توليد البيانات لكل widget
            for widget_config in config.widgets:
                widget_data = await self._generate_widget_data(customer_id, widget_config)
                dashboard_data['widgets'].append(widget_data)
            
            return {
                'success': True,
                'dashboard': dashboard_data
            }
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء لوحة المعلومات: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة
    async def _fetch_report_data(self, customer_id: str, config: ReportConfig) -> List[Dict[str, Any]]:
        """جلب بيانات التقرير"""
        # محاكاة جلب البيانات من Google Ads API
        # في التطبيق الحقيقي، ستستخدم Google Ads API
        
        sample_data = []
        start_date = datetime.fromisoformat(config.date_range['start_date'])
        end_date = datetime.fromisoformat(config.date_range['end_date'])
        
        current_date = start_date
        while current_date <= end_date:
            # محاكاة بيانات يومية
            daily_data = {
                'date': current_date.isoformat(),
                'impressions': np.random.randint(1000, 10000),
                'clicks': np.random.randint(50, 500),
                'cost': np.random.uniform(100, 1000),
                'conversions': np.random.randint(1, 25),
                'device': np.random.choice(['desktop', 'mobile', 'tablet']),
                'campaign_id': f"campaign_{np.random.randint(1, 5)}"
            }
            
            # حساب المقاييس المشتقة
            daily_data['ctr'] = (daily_data['clicks'] / daily_data['impressions']) * 100
            daily_data['cpc'] = daily_data['cost'] / daily_data['clicks'] if daily_data['clicks'] > 0 else 0
            daily_data['conversion_rate'] = (daily_data['conversions'] / daily_data['clicks']) * 100 if daily_data['clicks'] > 0 else 0
            daily_data['cpa'] = daily_data['cost'] / daily_data['conversions'] if daily_data['conversions'] > 0 else 0
            
            sample_data.append(daily_data)
            current_date += timedelta(days=1)
        
        return sample_data
    
    async def _generate_summary(self, data: List[Dict[str, Any]], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """توليد ملخص التقرير"""
        if not data:
            return {'error': 'لا توجد بيانات'}
        
        df = pd.DataFrame(data)
        
        summary = {
            'period': {
                'start_date': df['date'].min() if 'date' in df.columns else None,
                'end_date': df['date'].max() if 'date' in df.columns else None,
                'total_days': len(df)
            },
            'totals': {
                'impressions': int(df['impressions'].sum()) if 'impressions' in df.columns else 0,
                'clicks': int(df['clicks'].sum()) if 'clicks' in df.columns else 0,
                'cost': float(df['cost'].sum()) if 'cost' in df.columns else 0,
                'conversions': int(df['conversions'].sum()) if 'conversions' in df.columns else 0
            },
            'averages': {
                'daily_impressions': float(df['impressions'].mean()) if 'impressions' in df.columns else 0,
                'daily_clicks': float(df['clicks'].mean()) if 'clicks' in df.columns else 0,
                'daily_cost': float(df['cost'].mean()) if 'cost' in df.columns else 0,
                'daily_conversions': float(df['conversions'].mean()) if 'conversions' in df.columns else 0
            },
            'performance_metrics': {}
        }
        
        # حساب المقاييس الإجمالية
        if summary['totals']['impressions'] > 0:
            summary['performance_metrics']['overall_ctr'] = (summary['totals']['clicks'] / summary['totals']['impressions']) * 100
        
        if summary['totals']['clicks'] > 0:
            summary['performance_metrics']['overall_cpc'] = summary['totals']['cost'] / summary['totals']['clicks']
            summary['performance_metrics']['overall_conversion_rate'] = (summary['totals']['conversions'] / summary['totals']['clicks']) * 100
        
        if summary['totals']['conversions'] > 0:
            summary['performance_metrics']['overall_cpa'] = summary['totals']['cost'] / summary['totals']['conversions']
        
        # إضافة نتائج التحليل
        if 'basic_stats' in analysis:
            summary['analysis_summary'] = analysis['basic_stats']
        
        return summary
    
    async def _generate_recommendations(self, data: List[Dict[str, Any]], analysis: Dict[str, Any]) -> List[str]:
        """توليد التوصيات"""
        recommendations = []
        
        if not data:
            return recommendations
        
        df = pd.DataFrame(data)
        
        # توصيات معدل النقر
        if 'ctr' in df.columns:
            avg_ctr = df['ctr'].mean()
            if avg_ctr < 2.0:
                recommendations.append("تحسين نصوص الإعلانات لزيادة معدل النقر")
                recommendations.append("إضافة امتدادات الإعلانات لتحسين الظهور")
        
        # توصيات التكلفة
        if 'cost' in df.columns and 'conversions' in df.columns:
            total_cost = df['cost'].sum()
            total_conversions = df['conversions'].sum()
            
            if total_conversions > 0:
                avg_cpa = total_cost / total_conversions
                if avg_cpa > 100:
                    recommendations.append("تحسين الكلمات المفتاحية لتقليل تكلفة التحويل")
                    recommendations.append("مراجعة الصفحات المقصودة لتحسين معدل التحويل")
        
        # توصيات الاتجاهات
        if 'trends' in analysis:
            trends = analysis['trends']
            for metric, trend_data in trends.items():
                if trend_data.get('direction') == 'decreasing' and metric in ['clicks', 'conversions']:
                    recommendations.append(f"الاهتمام بتحسين {metric} حيث يظهر اتجاه تنازلي")
        
        return recommendations
    
    async def _get_cached_report(self, cache_key: str) -> Optional[ReportData]:
        """جلب التقرير من التخزين المؤقت"""
        if REPORTS_SERVICES_STATUS['redis']:
            try:
                cached_data = cache_get(cache_key)
                if cached_data:
                    return ReportData(**json.loads(cached_data))
            except Exception as e:
                logger.warning(f"خطأ في جلب التقرير من التخزين المؤقت: {e}")
        
        return None
    
    async def _cache_report(self, cache_key: str, report: ReportData) -> None:
        """حفظ التقرير في التخزين المؤقت"""
        if REPORTS_SERVICES_STATUS['redis']:
            try:
                cache_set(cache_key, json.dumps(asdict(report), default=str), expire=3600)  # ساعة واحدة
            except Exception as e:
                logger.warning(f"خطأ في حفظ التقرير في التخزين المؤقت: {e}")
    
    def get_service_stats(self) -> Dict[str, Any]:
        """جلب إحصائيات الخدمة"""
        return {
            **self.service_stats,
            'services_status': REPORTS_SERVICES_STATUS,
            'last_updated': datetime.now(timezone.utc).isoformat()
        }

# إنشاء مثيل مولد التقارير
report_generator = ReportGenerator()

# ===========================================
# API Routes - المسارات المتطورة
# ===========================================

@google_ads_reports_bp.route('/generate', methods=['POST'])
@jwt_required()
async def generate_report():
    """توليد تقرير"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # إنشاء إعدادات التقرير
        config = ReportConfig(
            report_type=ReportType(data.get('report_type', 'performance')),
            date_range=data.get('date_range', {
                'start_date': (datetime.now() - timedelta(days=30)).isoformat(),
                'end_date': datetime.now().isoformat()
            }),
            metrics=[MetricType(m) for m in data.get('metrics', ['impressions', 'clicks', 'cost'])],
            dimensions=data.get('dimensions', []),
            filters=data.get('filters', {}),
            granularity=TimeGranularity(data.get('granularity', 'daily')),
            format=ReportFormat(data.get('format', 'json')),
            include_charts=data.get('include_charts', True),
            include_insights=data.get('include_insights', True),
            include_recommendations=data.get('include_recommendations', True)
        )
        
        customer_id = data.get('customer_id', '')
        
        # توليد التقرير
        report = await report_generator.generate_report(customer_id, config)
        
        return jsonify({
            'success': True,
            'report': asdict(report)
        })
        
    except Exception as e:
        logger.error(f"خطأ في API توليد التقرير: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في توليد التقرير',
            'message': str(e)
        }), 500

@google_ads_reports_bp.route('/<report_id>/export', methods=['POST'])
@jwt_required()
async def export_report(report_id: str):
    """تصدير تقرير"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        format = ReportFormat(data.get('format', 'json'))
        
        # جلب التقرير (محاكاة)
        # في التطبيق الحقيقي، ستجلب التقرير من قاعدة البيانات
        sample_report = ReportData(
            report_id=report_id,
            config=ReportConfig(
                report_type=ReportType.PERFORMANCE,
                date_range={'start_date': '2024-01-01', 'end_date': '2024-01-31'},
                metrics=[MetricType.IMPRESSIONS, MetricType.CLICKS]
            ),
            data=[],
            summary={}
        )
        
        # تصدير التقرير
        export_result = await report_generator.export_report(sample_report, format)
        
        return jsonify({
            'success': True,
            'export_result': export_result
        })
        
    except Exception as e:
        logger.error(f"خطأ في API تصدير التقرير: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في تصدير التقرير',
            'message': str(e)
        }), 500

@google_ads_reports_bp.route('/dashboard', methods=['POST'])
@jwt_required()
async def create_dashboard():
    """إنشاء لوحة معلومات"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # إنشاء إعدادات لوحة المعلومات
        config = DashboardConfig(
            dashboard_id=data.get('dashboard_id', generate_unique_id('dashboard') if REPORTS_SERVICES_STATUS['helpers'] else f"dashboard_{int(time.time())}"),
            title=data.get('title', 'لوحة معلومات Google Ads'),
            widgets=data.get('widgets', []),
            layout=data.get('layout', {}),
            refresh_interval=data.get('refresh_interval', 300),
            auto_refresh=data.get('auto_refresh', True)
        )
        
        customer_id = data.get('customer_id', '')
        
        # إنشاء لوحة المعلومات
        result = await report_generator.create_dashboard(customer_id, config)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"خطأ في API إنشاء لوحة المعلومات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في إنشاء لوحة المعلومات',
            'message': str(e)
        }), 500

@google_ads_reports_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_reports_stats():
    """جلب إحصائيات التقارير"""
    try:
        stats = report_generator.get_service_stats()
        
        return jsonify({
            'success': True,
            'stats': stats,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في API إحصائيات التقارير: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في جلب إحصائيات التقارير',
            'message': str(e)
        }), 500

@google_ads_reports_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة خدمة التقارير"""
    try:
        health_status = {
            'service': 'Google Ads Reports',
            'status': 'healthy',
            'version': '2.2.0',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'services_status': REPORTS_SERVICES_STATUS,
            'total_reports_generated': report_generator.service_stats['total_reports_generated']
        }
        
        # فحص الخدمات الأساسية
        if not any(REPORTS_SERVICES_STATUS.values()):
            health_status['status'] = 'degraded'
            health_status['warning'] = 'بعض الخدمات غير متاحة'
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {e}")
        return jsonify({
            'service': 'Google Ads Reports',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل Google Ads Reports Blueprint - الخدمات متاحة: {REPORTS_SERVICES_AVAILABLE}")
logger.info(f"📊 حالة الخدمات: {sum(REPORTS_SERVICES_STATUS.values())}/8 متاحة")

# تصدير Blueprint والكلاسات
__all__ = [
    'google_ads_reports_bp',
    'ReportGenerator',
    'ReportConfig',
    'ReportData',
    'DashboardConfig',
    'AnalyticsInsight',
    'DataAnalyzer',
    'ChartGenerator',
    'ReportType',
    'ReportFormat',
    'TimeGranularity',
    'MetricType'
]

