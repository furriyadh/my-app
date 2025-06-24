"""
AI Insights Service
خدمة الرؤى الذكية بالذكاء الاصطناعي

خدمة متطورة لتوليد رؤى ذكية وتحليلات عميقة لحملات Google Ads
تتضمن تحليل الأداء، اكتشاف الاتجاهات، كشف الشذوذ، والتنبؤات المستقبلية

Author: AI Insights Team
Version: 3.0.0
Security Level: Enterprise
Performance: AI-Optimized & ML-Powered
"""

import asyncio
import logging
import time
import hashlib
import json
import math
from typing import Dict, List, Any, Optional, Union, Tuple, Set
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from enum import Enum, auto
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from functools import wraps, lru_cache

# Flask imports
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

# AI and ML imports
try:
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import IsolationForest, RandomForestRegressor
    from sklearn.cluster import KMeans, DBSCAN
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.metrics import silhouette_score
    from sklearn.linear_model import LinearRegression
    from scipy import stats
    from scipy.signal import find_peaks
    import matplotlib.pyplot as plt
    import seaborn as sns
    ML_AVAILABLE = True
except ImportError as e:
    ML_AVAILABLE = False
    logging.warning(f"مكتبات التعلم الآلي غير متاحة: {e}")

# Local imports
try:
    from utils.helpers import (
        validate_input, sanitize_text, generate_unique_id,
        cache_result, get_cached_result, log_performance
    )
    from utils.redis_config import get_redis_client
    from services.google_ads_client import GoogleAdsClient
except ImportError as e:
    logging.warning(f"بعض الوحدات المحلية غير متاحة: {e}")

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إعداد Blueprint
ai_insights_bp = Blueprint(
    'ai_insights',
    __name__,
    url_prefix='/api/ai/insights'
)

# إعداد Thread Pool للعمليات المتوازية
insights_executor = ThreadPoolExecutor(max_workers=15, thread_name_prefix="insights_worker")

class InsightType(Enum):
    """أنواع الرؤى"""
    PERFORMANCE_ANALYSIS = "performance_analysis"     # تحليل الأداء
    TREND_ANALYSIS = "trend_analysis"                 # تحليل الاتجاهات
    ANOMALY_DETECTION = "anomaly_detection"           # كشف الشذوذ
    COMPETITIVE_ANALYSIS = "competitive_analysis"     # تحليل المنافسة
    AUDIENCE_INSIGHTS = "audience_insights"           # رؤى الجمهور
    SEASONAL_PATTERNS = "seasonal_patterns"           # الأنماط الموسمية
    PREDICTIVE_INSIGHTS = "predictive_insights"       # رؤى تنبؤية
    OPTIMIZATION_OPPORTUNITIES = "optimization_opportunities"  # فرص التحسين

class InsightPriority(Enum):
    """أولوية الرؤى"""
    CRITICAL = "critical"     # حرج
    HIGH = "high"            # عالي
    MEDIUM = "medium"        # متوسط
    LOW = "low"              # منخفض
    INFO = "info"            # معلوماتي

class TrendDirection(Enum):
    """اتجاه الترند"""
    INCREASING = "increasing"     # متزايد
    DECREASING = "decreasing"     # متناقص
    STABLE = "stable"            # مستقر
    VOLATILE = "volatile"        # متقلب

@dataclass
class PerformanceMetric:
    """مقياس الأداء"""
    metric_name: str
    current_value: float
    previous_value: float
    change_percentage: float
    trend_direction: TrendDirection
    benchmark_comparison: float
    industry_average: float
    confidence_level: float

@dataclass
class AnomalyDetection:
    """كشف الشذوذ"""
    anomaly_id: str
    metric_name: str
    detected_at: datetime
    anomaly_score: float
    expected_value: float
    actual_value: float
    deviation_percentage: float
    possible_causes: List[str]
    severity: str
    impact_assessment: str

@dataclass
class TrendAnalysis:
    """تحليل الاتجاهات"""
    trend_id: str
    metric_name: str
    trend_direction: TrendDirection
    trend_strength: float
    duration_days: int
    projected_value: float
    confidence_interval: Tuple[float, float]
    seasonal_component: bool
    trend_description: str

@dataclass
class PredictiveInsight:
    """رؤية تنبؤية"""
    prediction_id: str
    metric_name: str
    prediction_horizon: int  # أيام
    predicted_value: float
    confidence_score: float
    prediction_range: Tuple[float, float]
    factors_influencing: List[str]
    recommendation: str
    risk_assessment: str

@dataclass
class InsightData:
    """بيانات الرؤية"""
    insight_id: str
    insight_type: InsightType
    priority: InsightPriority
    title: str
    description: str
    key_findings: List[str]
    metrics_analyzed: List[str]
    time_period: str
    confidence_score: float
    actionable_recommendations: List[str]
    supporting_data: Dict[str, Any]
    visualization_data: Optional[Dict[str, Any]] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class InsightsRequest:
    """طلب الرؤى"""
    campaign_ids: List[str]
    insight_types: List[InsightType]
    time_period: str = "last_30_days"
    include_predictions: bool = True
    include_anomalies: bool = True
    include_trends: bool = True
    metrics_focus: List[str] = field(default_factory=list)
    comparison_period: Optional[str] = None

@dataclass
class InsightsResponse:
    """استجابة الرؤى"""
    request_id: str
    total_insights: int
    insights: List[InsightData]
    performance_summary: Dict[str, Any]
    trend_analysis: List[TrendAnalysis]
    anomalies_detected: List[AnomalyDetection]
    predictions: List[PredictiveInsight]
    processing_time: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class AIInsightsService:
    """خدمة الرؤى الذكية بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة الرؤى"""
        self.cache_ttl = 3600  # ساعة واحدة
        self.redis_client = None
        self.google_ads_client = None
        self.ml_models = {}
        self.historical_data = {}
        self.performance_metrics = {
            'total_analyses': 0,
            'successful_analyses': 0,
            'failed_analyses': 0,
            'average_processing_time': 0.0,
            'insights_generated': 0,
            'anomalies_detected': 0,
            'predictions_made': 0
        }
        
        # تهيئة العملاء
        self._initialize_clients()
        
        # تهيئة نماذج التعلم الآلي
        if ML_AVAILABLE:
            self._initialize_ml_models()
        
        logger.info("✅ تم تهيئة خدمة الرؤى الذكية بالذكاء الاصطناعي")
    
    def _initialize_clients(self) -> None:
        """تهيئة العملاء الخارجيين"""
        try:
            self.redis_client = get_redis_client()
            logger.info("✅ تم تهيئة عميل Redis للرؤى")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Redis: {e}")
        
        try:
            self.google_ads_client = GoogleAdsClient()
            logger.info("✅ تم تهيئة عميل Google Ads للرؤى")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Google Ads: {e}")
    
    def _initialize_ml_models(self) -> None:
        """تهيئة نماذج التعلم الآلي للرؤى"""
        try:
            # نموذج كشف الشذوذ
            self.ml_models['anomaly_detector'] = {
                'model': IsolationForest(contamination=0.1, random_state=42),
                'scaler': StandardScaler()
            }
            
            # نموذج التنبؤ
            self.ml_models['predictor'] = {
                'model': RandomForestRegressor(n_estimators=100, random_state=42),
                'scaler': StandardScaler()
            }
            
            # نموذج تحليل الاتجاهات
            self.ml_models['trend_analyzer'] = {
                'model': LinearRegression(),
                'scaler': MinMaxScaler()
            }
            
            # نموذج تجميع الجمهور
            self.ml_models['audience_clusterer'] = {
                'model': KMeans(n_clusters=5, random_state=42),
                'scaler': StandardScaler()
            }
            
            logger.info("✅ تم تهيئة نماذج التعلم الآلي للرؤى")
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة نماذج التعلم الآلي: {e}")
    
    def _generate_cache_key(self, request_data: Dict[str, Any]) -> str:
        """توليد مفتاح التخزين المؤقت"""
        request_str = json.dumps(request_data, sort_keys=True, ensure_ascii=False)
        return f"insights:{hashlib.md5(request_str.encode()).hexdigest()}"
    
    def _simulate_campaign_data(self, campaign_id: str, days: int = 30) -> pd.DataFrame:
        """محاكاة بيانات الحملة التاريخية"""
        np.random.seed(hash(campaign_id) % 2**32)
        
        dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
        
        # توليد بيانات واقعية مع اتجاهات وموسمية
        base_impressions = 5000
        base_clicks = 250
        base_conversions = 25
        base_cost = 500
        
        data = []
        for i, date in enumerate(dates):
            # إضافة اتجاه عام
            trend_factor = 1 + (i / days) * 0.2
            
            # إضافة موسمية أسبوعية
            seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * i / 7)
            
            # إضافة ضوضاء عشوائية
            noise_factor = 1 + np.random.normal(0, 0.1)
            
            # حساب المقاييس
            impressions = int(base_impressions * trend_factor * seasonal_factor * noise_factor)
            clicks = int(base_clicks * trend_factor * seasonal_factor * noise_factor)
            conversions = int(base_conversions * trend_factor * seasonal_factor * noise_factor)
            cost = base_cost * trend_factor * seasonal_factor * noise_factor
            
            # إضافة شذوذ عشوائي
            if np.random.random() < 0.05:  # 5% احتمال شذوذ
                impressions *= np.random.uniform(0.3, 3.0)
                clicks *= np.random.uniform(0.3, 3.0)
                conversions *= np.random.uniform(0.1, 2.0)
                cost *= np.random.uniform(0.5, 2.5)
            
            # حساب المقاييس المشتقة
            ctr = (clicks / impressions * 100) if impressions > 0 else 0
            cpc = (cost / clicks) if clicks > 0 else 0
            cpa = (cost / conversions) if conversions > 0 else 0
            conversion_rate = (conversions / clicks * 100) if clicks > 0 else 0
            
            data.append({
                'date': date,
                'campaign_id': campaign_id,
                'impressions': impressions,
                'clicks': clicks,
                'conversions': conversions,
                'cost': cost,
                'ctr': ctr,
                'cpc': cpc,
                'cpa': cpa,
                'conversion_rate': conversion_rate
            })
        
        return pd.DataFrame(data)
    
    def _detect_anomalies(self, data: pd.DataFrame, metric: str) -> List[AnomalyDetection]:
        """كشف الشذوذ في البيانات"""
        anomalies = []
        
        if not ML_AVAILABLE or len(data) < 7:
            return anomalies
        
        try:
            # تحضير البيانات
            values = data[metric].values.reshape(-1, 1)
            
            # تطبيق نموذج كشف الشذوذ
            scaler = self.ml_models['anomaly_detector']['scaler']
            model = self.ml_models['anomaly_detector']['model']
            
            scaled_values = scaler.fit_transform(values)
            anomaly_scores = model.fit_predict(scaled_values)
            
            # العثور على الشذوذ
            for i, (score, value) in enumerate(zip(anomaly_scores, data[metric])):
                if score == -1:  # شذوذ
                    # حساب القيمة المتوقعة (متوسط النافذة المتحركة)
                    window_start = max(0, i - 7)
                    window_end = min(len(data), i + 7)
                    expected_value = data[metric].iloc[window_start:window_end].median()
                    
                    deviation = abs(value - expected_value) / expected_value * 100
                    
                    # تحديد الأسباب المحتملة
                    possible_causes = self._identify_anomaly_causes(data.iloc[i], metric)
                    
                    anomaly = AnomalyDetection(
                        anomaly_id=generate_unique_id(),
                        metric_name=metric,
                        detected_at=data.iloc[i]['date'],
                        anomaly_score=abs(value - expected_value),
                        expected_value=expected_value,
                        actual_value=value,
                        deviation_percentage=deviation,
                        possible_causes=possible_causes,
                        severity=self._assess_anomaly_severity(deviation),
                        impact_assessment=self._assess_anomaly_impact(metric, deviation)
                    )
                    
                    anomalies.append(anomaly)
            
        except Exception as e:
            logger.warning(f"خطأ في كشف الشذوذ: {e}")
        
        return anomalies
    
    def _identify_anomaly_causes(self, row: pd.Series, metric: str) -> List[str]:
        """تحديد الأسباب المحتملة للشذوذ"""
        causes = []
        
        # تحليل يوم الأسبوع
        weekday = row['date'].weekday()
        if weekday in [5, 6]:  # عطلة نهاية الأسبوع
            causes.append("تأثير عطلة نهاية الأسبوع")
        
        # تحليل المقاييس المترابطة
        if metric == 'clicks' and row['impressions'] < row['clicks'] * 20:
            causes.append("انخفاض الانطباعات مقارنة بالنقرات")
        
        if metric == 'cost' and row['cpc'] > 5.0:
            causes.append("ارتفاع تكلفة النقرة")
        
        if metric == 'conversions' and row['conversion_rate'] < 1.0:
            causes.append("انخفاض معدل التحويل")
        
        # أسباب عامة
        causes.extend([
            "تغيير في استراتيجية العروض",
            "تحديث في الإعلانات أو الكلمات المفتاحية",
            "تغيير في المنافسة",
            "أحداث خارجية أو موسمية"
        ])
        
        return causes[:3]  # أفضل 3 أسباب
    
    def _assess_anomaly_severity(self, deviation: float) -> str:
        """تقييم شدة الشذوذ"""
        if deviation > 50:
            return "عالي"
        elif deviation > 25:
            return "متوسط"
        else:
            return "منخفض"
    
    def _assess_anomaly_impact(self, metric: str, deviation: float) -> str:
        """تقييم تأثير الشذوذ"""
        impact_map = {
            'cost': "تأثير مالي مباشر",
            'conversions': "تأثير على الأهداف التجارية",
            'clicks': "تأثير على حركة المرور",
            'impressions': "تأثير على الوصول"
        }
        
        base_impact = impact_map.get(metric, "تأثير على الأداء العام")
        
        if deviation > 50:
            return f"{base_impact} - تأثير كبير"
        elif deviation > 25:
            return f"{base_impact} - تأثير متوسط"
        else:
            return f"{base_impact} - تأثير محدود"
    
    def _analyze_trends(self, data: pd.DataFrame, metric: str) -> TrendAnalysis:
        """تحليل الاتجاهات"""
        if len(data) < 7:
            return None
        
        try:
            # تحضير البيانات
            x = np.arange(len(data)).reshape(-1, 1)
            y = data[metric].values
            
            # تطبيق الانحدار الخطي
            model = LinearRegression()
            model.fit(x, y)
            
            # حساب الاتجاه
            slope = model.coef_[0]
            trend_strength = abs(slope) / np.std(y) if np.std(y) > 0 else 0
            
            # تحديد اتجاه الترند
            if abs(slope) < np.std(y) * 0.1:
                trend_direction = TrendDirection.STABLE
            elif slope > 0:
                trend_direction = TrendDirection.INCREASING
            else:
                trend_direction = TrendDirection.DECREASING
            
            # التحقق من التقلب
            if np.std(y) / np.mean(y) > 0.3:
                trend_direction = TrendDirection.VOLATILE
            
            # التنبؤ بالقيمة المستقبلية
            future_x = len(data)
            projected_value = model.predict([[future_x]])[0]
            
            # حساب فترة الثقة
            residuals = y - model.predict(x)
            mse = np.mean(residuals**2)
            confidence_interval = (
                projected_value - 1.96 * np.sqrt(mse),
                projected_value + 1.96 * np.sqrt(mse)
            )
            
            # وصف الاتجاه
            trend_description = self._generate_trend_description(
                trend_direction, trend_strength, metric
            )
            
            return TrendAnalysis(
                trend_id=generate_unique_id(),
                metric_name=metric,
                trend_direction=trend_direction,
                trend_strength=trend_strength,
                duration_days=len(data),
                projected_value=projected_value,
                confidence_interval=confidence_interval,
                seasonal_component=self._detect_seasonality(data[metric]),
                trend_description=trend_description
            )
            
        except Exception as e:
            logger.warning(f"خطأ في تحليل الاتجاهات: {e}")
            return None
    
    def _detect_seasonality(self, series: pd.Series) -> bool:
        """كشف الموسمية في البيانات"""
        if len(series) < 14:
            return False
        
        try:
            # تحليل الارتباط الذاتي للكشف عن الموسمية الأسبوعية
            autocorr_7 = series.autocorr(lag=7)
            return abs(autocorr_7) > 0.3
        except:
            return False
    
    def _generate_trend_description(self, direction: TrendDirection, 
                                  strength: float, metric: str) -> str:
        """توليد وصف الاتجاه"""
        strength_desc = "قوي" if strength > 0.5 else "متوسط" if strength > 0.2 else "ضعيف"
        
        descriptions = {
            TrendDirection.INCREASING: f"اتجاه صاعد {strength_desc} في {metric}",
            TrendDirection.DECREASING: f"اتجاه هابط {strength_desc} في {metric}",
            TrendDirection.STABLE: f"استقرار في {metric}",
            TrendDirection.VOLATILE: f"تقلب عالي في {metric}"
        }
        
        return descriptions.get(direction, f"اتجاه غير محدد في {metric}")
    
    def _generate_predictions(self, data: pd.DataFrame, metric: str, 
                            horizon: int = 7) -> PredictiveInsight:
        """توليد التنبؤات"""
        if not ML_AVAILABLE or len(data) < 14:
            return None
        
        try:
            # تحضير البيانات للتنبؤ
            features = []
            targets = []
            
            # استخدام نافذة متحركة للتنبؤ
            window_size = 7
            for i in range(window_size, len(data)):
                features.append(data[metric].iloc[i-window_size:i].values)
                targets.append(data[metric].iloc[i])
            
            if len(features) < 5:
                return None
            
            features = np.array(features)
            targets = np.array(targets)
            
            # تدريب النموذج
            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(features, targets)
            
            # التنبؤ
            last_window = data[metric].tail(window_size).values.reshape(1, -1)
            predicted_value = model.predict(last_window)[0]
            
            # حساب فترة الثقة
            predictions = []
            for estimator in model.estimators_[:10]:  # استخدام 10 أشجار للتنوع
                pred = estimator.predict(last_window)[0]
                predictions.append(pred)
            
            std_pred = np.std(predictions)
            prediction_range = (
                predicted_value - 1.96 * std_pred,
                predicted_value + 1.96 * std_pred
            )
            
            # تحديد العوامل المؤثرة
            factors_influencing = self._identify_prediction_factors(data, metric)
            
            # توليد التوصية
            recommendation = self._generate_prediction_recommendation(
                predicted_value, data[metric].iloc[-1], metric
            )
            
            # تقييم المخاطر
            risk_assessment = self._assess_prediction_risk(
                predicted_value, data[metric].iloc[-1], std_pred
            )
            
            return PredictiveInsight(
                prediction_id=generate_unique_id(),
                metric_name=metric,
                prediction_horizon=horizon,
                predicted_value=predicted_value,
                confidence_score=min(0.95, 1 - (std_pred / abs(predicted_value)) if predicted_value != 0 else 0.5),
                prediction_range=prediction_range,
                factors_influencing=factors_influencing,
                recommendation=recommendation,
                risk_assessment=risk_assessment
            )
            
        except Exception as e:
            logger.warning(f"خطأ في التنبؤ: {e}")
            return None
    
    def _identify_prediction_factors(self, data: pd.DataFrame, metric: str) -> List[str]:
        """تحديد العوامل المؤثرة على التنبؤ"""
        factors = []
        
        # تحليل الارتباط مع المقاييس الأخرى
        correlations = data.corr()[metric].abs().sort_values(ascending=False)
        
        for other_metric, corr in correlations.items():
            if other_metric != metric and corr > 0.5:
                factors.append(f"ارتباط قوي مع {other_metric}")
        
        # عوامل زمنية
        if self._detect_seasonality(data[metric]):
            factors.append("أنماط موسمية أسبوعية")
        
        # اتجاهات حديثة
        recent_trend = data[metric].tail(7).mean() - data[metric].head(7).mean()
        if abs(recent_trend) > data[metric].std():
            factors.append("اتجاه حديث في البيانات")
        
        return factors[:3]  # أهم 3 عوامل
    
    def _generate_prediction_recommendation(self, predicted: float, 
                                          current: float, metric: str) -> str:
        """توليد توصية بناءً على التنبؤ"""
        change_percent = (predicted - current) / current * 100 if current != 0 else 0
        
        if abs(change_percent) < 5:
            return f"متوقع استقرار في {metric}"
        elif change_percent > 10:
            return f"متوقع ارتفاع كبير في {metric} - استعد لزيادة الميزانية"
        elif change_percent > 0:
            return f"متوقع ارتفاع طفيف في {metric}"
        elif change_percent < -10:
            return f"متوقع انخفاض كبير في {metric} - راجع الاستراتيجية"
        else:
            return f"متوقع انخفاض طفيف في {metric}"
    
    def _assess_prediction_risk(self, predicted: float, current: float, 
                              uncertainty: float) -> str:
        """تقييم مخاطر التنبؤ"""
        change_percent = abs(predicted - current) / current * 100 if current != 0 else 0
        uncertainty_percent = uncertainty / abs(predicted) * 100 if predicted != 0 else 100
        
        if uncertainty_percent > 30:
            return "مخاطر عالية - عدم يقين كبير في التنبؤ"
        elif change_percent > 25:
            return "مخاطر متوسطة - تغيير كبير متوقع"
        else:
            return "مخاطر منخفضة - تنبؤ مستقر"
    
    def _analyze_performance(self, data: pd.DataFrame) -> Dict[str, PerformanceMetric]:
        """تحليل الأداء الشامل"""
        performance_metrics = {}
        
        # المقاييس المهمة للتحليل
        key_metrics = ['impressions', 'clicks', 'conversions', 'cost', 'ctr', 'cpc', 'cpa']
        
        for metric in key_metrics:
            if metric in data.columns:
                current_period = data.tail(7)[metric].mean()
                previous_period = data.head(7)[metric].mean()
                
                change_percentage = (
                    (current_period - previous_period) / previous_period * 100
                    if previous_period != 0 else 0
                )
                
                # تحديد اتجاه الترند
                if abs(change_percentage) < 5:
                    trend_direction = TrendDirection.STABLE
                elif change_percentage > 0:
                    trend_direction = TrendDirection.INCREASING
                else:
                    trend_direction = TrendDirection.DECREASING
                
                # محاكاة مقارنة مع المعايير
                industry_average = current_period * np.random.uniform(0.8, 1.2)
                benchmark_comparison = (current_period / industry_average - 1) * 100
                
                performance_metrics[metric] = PerformanceMetric(
                    metric_name=metric,
                    current_value=current_period,
                    previous_value=previous_period,
                    change_percentage=change_percentage,
                    trend_direction=trend_direction,
                    benchmark_comparison=benchmark_comparison,
                    industry_average=industry_average,
                    confidence_level=0.85
                )
        
        return performance_metrics
    
    def _generate_insights(self, data: pd.DataFrame, anomalies: List[AnomalyDetection],
                         trends: List[TrendAnalysis], predictions: List[PredictiveInsight]) -> List[InsightData]:
        """توليد الرؤى الذكية"""
        insights = []
        
        # رؤى الأداء
        performance_metrics = self._analyze_performance(data)
        for metric_name, metric in performance_metrics.items():
            if abs(metric.change_percentage) > 10:
                priority = InsightPriority.HIGH if abs(metric.change_percentage) > 25 else InsightPriority.MEDIUM
                
                insight = InsightData(
                    insight_id=generate_unique_id(),
                    insight_type=InsightType.PERFORMANCE_ANALYSIS,
                    priority=priority,
                    title=f"تغيير كبير في {metric_name}",
                    description=f"تغير {metric_name} بنسبة {metric.change_percentage:.1f}% مقارنة بالفترة السابقة",
                    key_findings=[
                        f"القيمة الحالية: {metric.current_value:.2f}",
                        f"القيمة السابقة: {metric.previous_value:.2f}",
                        f"الاتجاه: {metric.trend_direction.value}"
                    ],
                    metrics_analyzed=[metric_name],
                    time_period="آخر 7 أيام مقارنة بالـ 7 أيام السابقة",
                    confidence_score=metric.confidence_level,
                    actionable_recommendations=self._generate_performance_recommendations(metric),
                    supporting_data={
                        'current_value': metric.current_value,
                        'previous_value': metric.previous_value,
                        'change_percentage': metric.change_percentage,
                        'benchmark_comparison': metric.benchmark_comparison
                    }
                )
                insights.append(insight)
        
        # رؤى الشذوذ
        for anomaly in anomalies:
            insight = InsightData(
                insight_id=generate_unique_id(),
                insight_type=InsightType.ANOMALY_DETECTION,
                priority=InsightPriority.CRITICAL if anomaly.severity == "عالي" else InsightPriority.HIGH,
                title=f"شذوذ مكتشف في {anomaly.metric_name}",
                description=f"قيمة غير طبيعية في {anomaly.metric_name} بانحراف {anomaly.deviation_percentage:.1f}%",
                key_findings=[
                    f"القيمة المتوقعة: {anomaly.expected_value:.2f}",
                    f"القيمة الفعلية: {anomaly.actual_value:.2f}",
                    f"مستوى الشدة: {anomaly.severity}"
                ],
                metrics_analyzed=[anomaly.metric_name],
                time_period=f"مكتشف في {anomaly.detected_at.strftime('%Y-%m-%d')}",
                confidence_score=0.9,
                actionable_recommendations=self._generate_anomaly_recommendations(anomaly),
                supporting_data={
                    'anomaly_score': anomaly.anomaly_score,
                    'possible_causes': anomaly.possible_causes,
                    'impact_assessment': anomaly.impact_assessment
                }
            )
            insights.append(insight)
        
        # رؤى الاتجاهات
        for trend in trends:
            if trend and trend.trend_strength > 0.3:
                insight = InsightData(
                    insight_id=generate_unique_id(),
                    insight_type=InsightType.TREND_ANALYSIS,
                    priority=InsightPriority.MEDIUM,
                    title=f"اتجاه {trend.trend_direction.value} في {trend.metric_name}",
                    description=trend.trend_description,
                    key_findings=[
                        f"قوة الاتجاه: {trend.trend_strength:.2f}",
                        f"المدة: {trend.duration_days} يوم",
                        f"القيمة المتوقعة: {trend.projected_value:.2f}"
                    ],
                    metrics_analyzed=[trend.metric_name],
                    time_period=f"آخر {trend.duration_days} يوم",
                    confidence_score=0.8,
                    actionable_recommendations=self._generate_trend_recommendations(trend),
                    supporting_data={
                        'trend_strength': trend.trend_strength,
                        'projected_value': trend.projected_value,
                        'confidence_interval': trend.confidence_interval,
                        'seasonal_component': trend.seasonal_component
                    }
                )
                insights.append(insight)
        
        # رؤى التنبؤات
        for prediction in predictions:
            if prediction and prediction.confidence_score > 0.7:
                insight = InsightData(
                    insight_id=generate_unique_id(),
                    insight_type=InsightType.PREDICTIVE_INSIGHTS,
                    priority=InsightPriority.MEDIUM,
                    title=f"تنبؤ لـ {prediction.metric_name}",
                    description=prediction.recommendation,
                    key_findings=[
                        f"القيمة المتنبأ بها: {prediction.predicted_value:.2f}",
                        f"مستوى الثقة: {prediction.confidence_score:.1%}",
                        f"أفق التنبؤ: {prediction.prediction_horizon} أيام"
                    ],
                    metrics_analyzed=[prediction.metric_name],
                    time_period=f"التنبؤ للـ {prediction.prediction_horizon} أيام القادمة",
                    confidence_score=prediction.confidence_score,
                    actionable_recommendations=[prediction.recommendation],
                    supporting_data={
                        'predicted_value': prediction.predicted_value,
                        'prediction_range': prediction.prediction_range,
                        'factors_influencing': prediction.factors_influencing,
                        'risk_assessment': prediction.risk_assessment
                    }
                )
                insights.append(insight)
        
        # ترتيب الرؤى حسب الأولوية
        priority_order = {
            InsightPriority.CRITICAL: 0,
            InsightPriority.HIGH: 1,
            InsightPriority.MEDIUM: 2,
            InsightPriority.LOW: 3,
            InsightPriority.INFO: 4
        }
        
        insights.sort(key=lambda x: (priority_order[x.priority], -x.confidence_score))
        
        return insights
    
    def _generate_performance_recommendations(self, metric: PerformanceMetric) -> List[str]:
        """توليد توصيات الأداء"""
        recommendations = []
        
        if metric.change_percentage > 20:
            recommendations.append(f"استغل الأداء الجيد في {metric.metric_name} بزيادة الاستثمار")
        elif metric.change_percentage < -20:
            recommendations.append(f"راجع استراتيجية {metric.metric_name} لتحسين الأداء")
        
        if metric.benchmark_comparison < -10:
            recommendations.append("الأداء أقل من المعايير الصناعية - يحتاج تحسين")
        elif metric.benchmark_comparison > 10:
            recommendations.append("الأداء أفضل من المعايير الصناعية - حافظ على الاستراتيجية")
        
        return recommendations
    
    def _generate_anomaly_recommendations(self, anomaly: AnomalyDetection) -> List[str]:
        """توليد توصيات الشذوذ"""
        recommendations = [
            f"تحقق من الأسباب المحتملة: {', '.join(anomaly.possible_causes[:2])}",
            "راقب الأداء عن كثب في الأيام القادمة",
            "قم بمراجعة التغييرات الحديثة في الحملة"
        ]
        
        if anomaly.severity == "عالي":
            recommendations.insert(0, "اتخذ إجراءً فورياً لمعالجة هذا الشذوذ")
        
        return recommendations
    
    def _generate_trend_recommendations(self, trend: TrendAnalysis) -> List[str]:
        """توليد توصيات الاتجاهات"""
        recommendations = []
        
        if trend.trend_direction == TrendDirection.INCREASING:
            recommendations.append("استغل الاتجاه الصاعد بزيادة الاستثمار")
        elif trend.trend_direction == TrendDirection.DECREASING:
            recommendations.append("اتخذ إجراءات لعكس الاتجاه الهابط")
        elif trend.trend_direction == TrendDirection.VOLATILE:
            recommendations.append("قلل المخاطر بسبب التقلب العالي")
        
        if trend.seasonal_component:
            recommendations.append("اضبط الاستراتيجية حسب الأنماط الموسمية")
        
        return recommendations
    
    async def generate_insights(self, request: InsightsRequest) -> InsightsResponse:
        """توليد الرؤى الذكية الرئيسي"""
        start_time = time.time()
        request_id = generate_unique_id()
        
        try:
            # فحص التخزين المؤقت
            cache_key = self._generate_cache_key(request.__dict__)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                logger.info(f"تم جلب الرؤى من التخزين المؤقت: {request_id}")
                return InsightsResponse(**cached_result)
            
            all_insights = []
            all_anomalies = []
            all_trends = []
            all_predictions = []
            
            # تحليل كل حملة
            for campaign_id in request.campaign_ids:
                # جلب البيانات التاريخية
                data = self._simulate_campaign_data(campaign_id, 30)
                
                # كشف الشذوذ
                if request.include_anomalies:
                    for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                        if metric in data.columns:
                            anomalies = self._detect_anomalies(data, metric)
                            all_anomalies.extend(anomalies)
                
                # تحليل الاتجاهات
                if request.include_trends:
                    for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                        if metric in data.columns:
                            trend = self._analyze_trends(data, metric)
                            if trend:
                                all_trends.append(trend)
                
                # التنبؤات
                if request.include_predictions:
                    for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                        if metric in data.columns:
                            prediction = self._generate_predictions(data, metric)
                            if prediction:
                                all_predictions.append(prediction)
            
            # توليد الرؤى
            if request.campaign_ids:
                sample_data = self._simulate_campaign_data(request.campaign_ids[0], 30)
                insights = self._generate_insights(sample_data, all_anomalies, all_trends, all_predictions)
                all_insights.extend(insights)
            
            # إنشاء ملخص الأداء
            performance_summary = self._create_performance_summary(
                request.campaign_ids, all_anomalies, all_trends, all_predictions
            )
            
            # إنشاء الاستجابة
            processing_time = time.time() - start_time
            response = InsightsResponse(
                request_id=request_id,
                total_insights=len(all_insights),
                insights=all_insights,
                performance_summary=performance_summary,
                trend_analysis=all_trends,
                anomalies_detected=all_anomalies,
                predictions=all_predictions,
                processing_time=processing_time
            )
            
            # حفظ في التخزين المؤقت
            self._cache_result(cache_key, response.__dict__)
            
            # تحديث مقاييس الأداء
            self.performance_metrics['total_analyses'] += 1
            self.performance_metrics['successful_analyses'] += 1
            self.performance_metrics['insights_generated'] += len(all_insights)
            self.performance_metrics['anomalies_detected'] += len(all_anomalies)
            self.performance_metrics['predictions_made'] += len(all_predictions)
            
            logger.info(f"تم إكمال تحليل الرؤى: {request_id} في {processing_time:.3f}s")
            return response
            
        except Exception as e:
            self.performance_metrics['failed_analyses'] += 1
            logger.error(f"خطأ في توليد الرؤى {request_id}: {e}")
            raise
    
    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """جلب النتيجة من التخزين المؤقت"""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"خطأ في جلب البيانات المخزنة: {e}")
        
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]) -> None:
        """حفظ النتيجة في التخزين المؤقت"""
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(result, ensure_ascii=False, default=str)
            )
        except Exception as e:
            logger.warning(f"خطأ في حفظ البيانات المخزنة: {e}")
    
    def _create_performance_summary(self, campaign_ids: List[str], 
                                  anomalies: List[AnomalyDetection],
                                  trends: List[TrendAnalysis],
                                  predictions: List[PredictiveInsight]) -> Dict[str, Any]:
        """إنشاء ملخص الأداء"""
        return {
            'total_campaigns_analyzed': len(campaign_ids),
            'anomalies_found': len(anomalies),
            'trends_identified': len(trends),
            'predictions_generated': len(predictions),
            'critical_issues': len([a for a in anomalies if a.severity == "عالي"]),
            'positive_trends': len([t for t in trends if t.trend_direction == TrendDirection.INCREASING]),
            'negative_trends': len([t for t in trends if t.trend_direction == TrendDirection.DECREASING]),
            'high_confidence_predictions': len([p for p in predictions if p.confidence_score > 0.8]),
            'analysis_timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """جلب مقاييس الأداء"""
        return {
            **self.performance_metrics,
            'success_rate': (
                self.performance_metrics['successful_analyses'] / 
                max(self.performance_metrics['total_analyses'], 1) * 100
            ),
            'ml_available': ML_AVAILABLE,
            'redis_available': self.redis_client is not None,
            'google_ads_available': self.google_ads_client is not None
        }

# إنشاء مثيل الخدمة
insights_service = AIInsightsService()

# مساعدات التحقق من الصحة
def validate_insights_request(data: Dict[str, Any]) -> InsightsRequest:
    """التحقق من صحة طلب الرؤى"""
    if not data.get('campaign_ids'):
        raise ValueError("campaign_ids مطلوب")
    
    if not isinstance(data['campaign_ids'], list):
        raise ValueError("campaign_ids يجب أن يكون قائمة")
    
    if len(data['campaign_ids']) > 10:
        raise ValueError("عدد الحملات لا يجب أن يتجاوز 10")
    
    # تحويل أنواع الرؤى من نص إلى enum
    if 'insight_types' in data:
        data['insight_types'] = [
            InsightType(insight_type) for insight_type in data['insight_types']
        ]
    
    return InsightsRequest(**data)

# مساعدات الأداء
def insights_monitor(func):
    """مراقب الأداء للرؤى"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            processing_time = time.time() - start_time
            logger.info(f"تم تنفيذ {func.__name__} في {processing_time:.3f}s")
            return result
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"خطأ في {func.__name__} بعد {processing_time:.3f}s: {e}")
            raise
    return wrapper

# ===== API Routes =====

@ai_insights_bp.route('/performance', methods=['POST'])
@jwt_required()
@insights_monitor
async def analyze_performance():
    """تحليل الأداء"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # التحقق من صحة البيانات
        insights_request = validate_insights_request(data)
        insights_request.insight_types = [InsightType.PERFORMANCE_ANALYSIS]
        
        # تنفيذ التحليل
        result = await insights_service.generate_insights(insights_request)
        
        # فلترة الرؤى للأداء فقط
        performance_insights = [
            insight for insight in result.insights 
            if insight.insight_type == InsightType.PERFORMANCE_ANALYSIS
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'request_id': result.request_id,
                'total_insights': len(performance_insights),
                'insights': [
                    {
                        'insight_id': insight.insight_id,
                        'title': insight.title,
                        'description': insight.description,
                        'priority': insight.priority.value,
                        'key_findings': insight.key_findings,
                        'recommendations': insight.actionable_recommendations,
                        'confidence_score': insight.confidence_score,
                        'supporting_data': insight.supporting_data
                    }
                    for insight in performance_insights
                ],
                'performance_summary': result.performance_summary,
                'processing_time': result.processing_time
            }
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"خطأ في تحليل الأداء: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/trends', methods=['POST'])
@jwt_required()
async def analyze_trends():
    """تحليل الاتجاهات"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # تحليل الاتجاهات لكل حملة
        all_trends = []
        for campaign_id in campaign_ids:
            campaign_data = insights_service._simulate_campaign_data(campaign_id, 30)
            
            for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                if metric in campaign_data.columns:
                    trend = insights_service._analyze_trends(campaign_data, metric)
                    if trend:
                        all_trends.append(trend)
        
        return jsonify({
            'success': True,
            'data': {
                'total_trends': len(all_trends),
                'trends': [
                    {
                        'trend_id': trend.trend_id,
                        'metric_name': trend.metric_name,
                        'trend_direction': trend.trend_direction.value,
                        'trend_strength': trend.trend_strength,
                        'duration_days': trend.duration_days,
                        'projected_value': trend.projected_value,
                        'confidence_interval': trend.confidence_interval,
                        'seasonal_component': trend.seasonal_component,
                        'description': trend.trend_description
                    }
                    for trend in all_trends
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الاتجاهات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/anomalies', methods=['POST'])
@jwt_required()
async def detect_anomalies():
    """كشف الشذوذ"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # كشف الشذوذ لكل حملة
        all_anomalies = []
        for campaign_id in campaign_ids:
            campaign_data = insights_service._simulate_campaign_data(campaign_id, 30)
            
            for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                if metric in campaign_data.columns:
                    anomalies = insights_service._detect_anomalies(campaign_data, metric)
                    all_anomalies.extend(anomalies)
        
        return jsonify({
            'success': True,
            'data': {
                'total_anomalies': len(all_anomalies),
                'anomalies': [
                    {
                        'anomaly_id': anomaly.anomaly_id,
                        'metric_name': anomaly.metric_name,
                        'detected_at': anomaly.detected_at.isoformat(),
                        'severity': anomaly.severity,
                        'expected_value': anomaly.expected_value,
                        'actual_value': anomaly.actual_value,
                        'deviation_percentage': anomaly.deviation_percentage,
                        'possible_causes': anomaly.possible_causes,
                        'impact_assessment': anomaly.impact_assessment
                    }
                    for anomaly in all_anomalies
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في كشف الشذوذ: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/predictions', methods=['POST'])
@jwt_required()
async def generate_predictions():
    """توليد التنبؤات"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        horizon = data.get('horizon', 7)
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # توليد التنبؤات لكل حملة
        all_predictions = []
        for campaign_id in campaign_ids:
            campaign_data = insights_service._simulate_campaign_data(campaign_id, 30)
            
            for metric in ['impressions', 'clicks', 'conversions', 'cost']:
                if metric in campaign_data.columns:
                    prediction = insights_service._generate_predictions(campaign_data, metric, horizon)
                    if prediction:
                        all_predictions.append(prediction)
        
        return jsonify({
            'success': True,
            'data': {
                'total_predictions': len(all_predictions),
                'predictions': [
                    {
                        'prediction_id': pred.prediction_id,
                        'metric_name': pred.metric_name,
                        'prediction_horizon': pred.prediction_horizon,
                        'predicted_value': pred.predicted_value,
                        'confidence_score': pred.confidence_score,
                        'prediction_range': pred.prediction_range,
                        'factors_influencing': pred.factors_influencing,
                        'recommendation': pred.recommendation,
                        'risk_assessment': pred.risk_assessment
                    }
                    for pred in all_predictions
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توليد التنبؤات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/competitive', methods=['POST'])
@jwt_required()
async def analyze_competitive():
    """تحليل المنافسة"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # محاكاة تحليل المنافسة
        competitive_insights = []
        for campaign_id in campaign_ids:
            # محاكاة بيانات المنافسة
            competitive_data = {
                'campaign_id': campaign_id,
                'market_share': np.random.uniform(5, 25),
                'competitor_count': np.random.randint(3, 15),
                'average_cpc_vs_competitors': np.random.uniform(-20, 30),
                'impression_share': np.random.uniform(10, 60),
                'top_competitors': [f"منافس {i}" for i in range(1, 4)],
                'competitive_advantages': [
                    "تكلفة نقرة أقل من المتوسط",
                    "معدل تحويل أعلى",
                    "جودة إعلانات متميزة"
                ],
                'improvement_opportunities': [
                    "زيادة حصة الانطباعات",
                    "تحسين موضع الإعلانات",
                    "استهداف كلمات مفتاحية جديدة"
                ]
            }
            competitive_insights.append(competitive_data)
        
        return jsonify({
            'success': True,
            'data': {
                'total_campaigns': len(competitive_insights),
                'competitive_analysis': competitive_insights
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل المنافسة: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/metrics', methods=['GET'])
@jwt_required()
async def get_insights_metrics():
    """جلب مقاييس أداء الرؤى"""
    try:
        metrics = insights_service.get_performance_metrics()
        return jsonify({
            'success': True,
            'data': metrics
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب مقاييس الرؤى: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_insights_bp.route('/health', methods=['GET'])
async def health_check():
    """فحص صحة خدمة الرؤى"""
    try:
        health_status = {
            'service': 'AI Insights',
            'status': 'healthy',
            'ml_available': ML_AVAILABLE,
            'redis_available': insights_service.redis_client is not None,
            'google_ads_available': insights_service.google_ads_client is not None,
            'performance': insights_service.get_performance_metrics(),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص صحة الرؤى: {e}")
        return jsonify({
            'service': 'AI Insights',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تصدير الكائنات المطلوبة
__all__ = ['ai_insights_bp', 'AIInsightsService', 'insights_service']

