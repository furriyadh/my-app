"""
AI Campaign Optimization Service
خدمة تحسين الحملات بالذكاء الاصطناعي

خدمة متطورة لتحسين حملات Google Ads باستخدام الذكاء الاصطناعي والتعلم الآلي
تتضمن تحسين العروض، الميزانيات، الكلمات المفتاحية، والإعلانات بشكل تلقائي وذكي

Author: AI Optimization Team
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
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression, LogisticRegression
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    from scipy.optimize import minimize, differential_evolution
    import scipy.stats as stats
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
ai_optimization_bp = Blueprint(
    'ai_optimization',
    __name__,
    url_prefix='/api/ai/optimization'
)

# إعداد Thread Pool للعمليات المتوازية
optimization_executor = ThreadPoolExecutor(max_workers=20, thread_name_prefix="optimization_worker")

class OptimizationType(Enum):
    """أنواع التحسين"""
    BID_OPTIMIZATION = "bid_optimization"           # تحسين العروض
    BUDGET_OPTIMIZATION = "budget_optimization"     # تحسين الميزانية
    KEYWORD_OPTIMIZATION = "keyword_optimization"   # تحسين الكلمات المفتاحية
    AD_OPTIMIZATION = "ad_optimization"             # تحسين الإعلانات
    AUDIENCE_OPTIMIZATION = "audience_optimization" # تحسين الجمهور
    SCHEDULE_OPTIMIZATION = "schedule_optimization" # تحسين الجدولة
    DEVICE_OPTIMIZATION = "device_optimization"     # تحسين الأجهزة
    LOCATION_OPTIMIZATION = "location_optimization" # تحسين المواقع

class OptimizationStrategy(Enum):
    """استراتيجيات التحسين"""
    MAXIMIZE_CONVERSIONS = "maximize_conversions"     # تعظيم التحويلات
    MAXIMIZE_CLICKS = "maximize_clicks"               # تعظيم النقرات
    MAXIMIZE_REVENUE = "maximize_revenue"             # تعظيم الإيرادات
    MINIMIZE_COST = "minimize_cost"                   # تقليل التكلفة
    OPTIMIZE_ROAS = "optimize_roas"                   # تحسين عائد الإنفاق الإعلاني
    BALANCE_PERFORMANCE = "balance_performance"       # توازن الأداء

class OptimizationPriority(Enum):
    """أولوية التحسين"""
    CRITICAL = "critical"     # حرج
    HIGH = "high"            # عالي
    MEDIUM = "medium"        # متوسط
    LOW = "low"              # منخفض

@dataclass
class CampaignData:
    """بيانات الحملة"""
    campaign_id: str
    campaign_name: str
    status: str
    budget: float
    impressions: int = 0
    clicks: int = 0
    conversions: int = 0
    cost: float = 0.0
    revenue: float = 0.0
    ctr: float = 0.0
    cpc: float = 0.0
    cpa: float = 0.0
    roas: float = 0.0
    quality_score: float = 0.0
    keywords: List[Dict[str, Any]] = field(default_factory=list)
    ads: List[Dict[str, Any]] = field(default_factory=list)
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class OptimizationRecommendation:
    """توصية التحسين"""
    recommendation_id: str
    optimization_type: OptimizationType
    priority: OptimizationPriority
    title: str
    description: str
    expected_impact: Dict[str, float]
    confidence_score: float
    implementation_effort: str
    estimated_time: str
    current_value: Any
    recommended_value: Any
    reasoning: str
    risk_level: str = "low"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class OptimizationRequest:
    """طلب التحسين"""
    campaign_ids: List[str]
    optimization_types: List[OptimizationType]
    strategy: OptimizationStrategy
    target_metrics: Dict[str, float]
    constraints: Dict[str, Any] = field(default_factory=dict)
    auto_apply: bool = False
    test_mode: bool = True

@dataclass
class OptimizationResponse:
    """استجابة التحسين"""
    request_id: str
    total_recommendations: int
    recommendations: List[OptimizationRecommendation]
    summary: Dict[str, Any]
    performance_prediction: Dict[str, float]
    processing_time: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class AIOptimizationService:
    """خدمة تحسين الحملات بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة التحسين"""
        self.cache_ttl = 1800  # 30 دقيقة
        self.redis_client = None
        self.google_ads_client = None
        self.ml_models = {}
        self.optimization_history = []
        self.performance_metrics = {
            'total_optimizations': 0,
            'successful_optimizations': 0,
            'failed_optimizations': 0,
            'average_processing_time': 0.0,
            'average_improvement': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # تهيئة العملاء
        self._initialize_clients()
        
        # تهيئة نماذج التعلم الآلي
        if ML_AVAILABLE:
            self._initialize_ml_models()
        
        logger.info("✅ تم تهيئة خدمة تحسين الحملات بالذكاء الاصطناعي")
    
    def _initialize_clients(self) -> None:
        """تهيئة العملاء الخارجيين"""
        try:
            self.redis_client = get_redis_client()
            logger.info("✅ تم تهيئة عميل Redis للتحسين")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Redis: {e}")
        
        try:
            self.google_ads_client = GoogleAdsClient()
            logger.info("✅ تم تهيئة عميل Google Ads للتحسين")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Google Ads: {e}")
    
    def _initialize_ml_models(self) -> None:
        """تهيئة نماذج التعلم الآلي للتحسين"""
        try:
            # نموذج تنبؤ الأداء
            self.ml_models['performance_predictor'] = {
                'scaler': StandardScaler(),
                'model': GradientBoostingRegressor(n_estimators=100, random_state=42)
            }
            
            # نموذج تحسين العروض
            self.ml_models['bid_optimizer'] = {
                'scaler': MinMaxScaler(),
                'model': RandomForestRegressor(n_estimators=150, random_state=42)
            }
            
            # نموذج تحليل الجمهور
            self.ml_models['audience_analyzer'] = {
                'model': KMeans(n_clusters=5, random_state=42)
            }
            
            # نموذج تحسين الميزانية
            self.ml_models['budget_optimizer'] = {
                'scaler': StandardScaler(),
                'model': LinearRegression()
            }
            
            logger.info("✅ تم تهيئة نماذج التعلم الآلي للتحسين")
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة نماذج التعلم الآلي: {e}")
    
    def _generate_cache_key(self, request_data: Dict[str, Any]) -> str:
        """توليد مفتاح التخزين المؤقت"""
        request_str = json.dumps(request_data, sort_keys=True, ensure_ascii=False)
        return f"optimization:{hashlib.md5(request_str.encode()).hexdigest()}"
    
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
    
    def _calculate_campaign_metrics(self, campaign_data: CampaignData) -> CampaignData:
        """حساب مقاييس الحملة"""
        if campaign_data.clicks > 0:
            campaign_data.ctr = (campaign_data.clicks / campaign_data.impressions) * 100
            campaign_data.cpc = campaign_data.cost / campaign_data.clicks
        
        if campaign_data.conversions > 0:
            campaign_data.cpa = campaign_data.cost / campaign_data.conversions
        
        if campaign_data.cost > 0:
            campaign_data.roas = campaign_data.revenue / campaign_data.cost
        
        return campaign_data
    
    def _analyze_bid_optimization(self, campaign_data: CampaignData, 
                                strategy: OptimizationStrategy) -> List[OptimizationRecommendation]:
        """تحليل تحسين العروض"""
        recommendations = []
        
        # تحليل أداء الكلمات المفتاحية
        for keyword in campaign_data.keywords:
            current_bid = keyword.get('bid', 0)
            clicks = keyword.get('clicks', 0)
            conversions = keyword.get('conversions', 0)
            cost = keyword.get('cost', 0)
            
            # حساب العرض المثالي باستخدام الذكاء الاصطناعي
            if ML_AVAILABLE and clicks > 0:
                # استخدام نموذج التعلم الآلي لتحسين العرض
                features = np.array([[
                    clicks, conversions, cost, keyword.get('quality_score', 5),
                    keyword.get('competition', 0.5), keyword.get('search_volume', 1000)
                ]])
                
                try:
                    if 'bid_optimizer' in self.ml_models:
                        optimal_bid = self.ml_models['bid_optimizer']['model'].predict(features)[0]
                        optimal_bid = max(0.1, min(optimal_bid, current_bid * 2))  # حدود آمنة
                    else:
                        # خوارزمية تحسين بسيطة
                        if conversions > 0:
                            target_cpa = cost / conversions
                            optimal_bid = current_bid * (target_cpa / (cost / clicks)) if clicks > 0 else current_bid
                        else:
                            optimal_bid = current_bid * 0.9  # تقليل العرض إذا لم تكن هناك تحويلات
                except Exception as e:
                    logger.warning(f"خطأ في تحسين العرض: {e}")
                    optimal_bid = current_bid
            else:
                optimal_bid = current_bid
            
            # إنشاء توصية إذا كان هناك تحسين مطلوب
            if abs(optimal_bid - current_bid) > 0.05:  # تغيير أكثر من 5 سنت
                expected_impact = self._calculate_bid_impact(current_bid, optimal_bid, keyword)
                
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.BID_OPTIMIZATION,
                    priority=OptimizationPriority.HIGH if abs(expected_impact.get('conversion_change', 0)) > 10 else OptimizationPriority.MEDIUM,
                    title=f"تحسين عرض الكلمة المفتاحية: {keyword.get('keyword', 'غير محدد')}",
                    description=f"تعديل العرض من {current_bid:.2f} إلى {optimal_bid:.2f}",
                    expected_impact=expected_impact,
                    confidence_score=0.85,
                    implementation_effort="منخفض",
                    estimated_time="5 دقائق",
                    current_value=current_bid,
                    recommended_value=optimal_bid,
                    reasoning=self._generate_bid_reasoning(current_bid, optimal_bid, keyword, strategy)
                )
                
                recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_bid_impact(self, current_bid: float, optimal_bid: float, 
                            keyword: Dict[str, Any]) -> Dict[str, float]:
        """حساب تأثير تغيير العرض"""
        bid_change_ratio = optimal_bid / current_bid if current_bid > 0 else 1
        
        # تقدير التأثير على المقاييس
        click_change = (bid_change_ratio - 1) * 50  # تقدير تغيير النقرات
        cost_change = (optimal_bid - current_bid) * keyword.get('clicks', 0)
        conversion_change = click_change * 0.3  # تقدير تغيير التحويلات
        
        return {
            'click_change': round(click_change, 2),
            'cost_change': round(cost_change, 2),
            'conversion_change': round(conversion_change, 2),
            'cpc_change': round(optimal_bid - current_bid, 2)
        }
    
    def _generate_bid_reasoning(self, current_bid: float, optimal_bid: float,
                              keyword: Dict[str, Any], strategy: OptimizationStrategy) -> str:
        """توليد تبرير تغيير العرض"""
        if optimal_bid > current_bid:
            return f"زيادة العرض لتحسين الموضع وزيادة النقرات حسب استراتيجية {strategy.value}"
        else:
            return f"تقليل العرض لتحسين الكفاءة وتقليل التكلفة حسب استراتيجية {strategy.value}"
    
    def _analyze_budget_optimization(self, campaign_data: CampaignData,
                                   strategy: OptimizationStrategy) -> List[OptimizationRecommendation]:
        """تحليل تحسين الميزانية"""
        recommendations = []
        
        current_budget = campaign_data.budget
        daily_spend = campaign_data.cost
        
        # تحليل أداء الحملة
        if campaign_data.clicks > 0:
            # حساب الميزانية المثالية
            if strategy == OptimizationStrategy.MAXIMIZE_CONVERSIONS:
                # زيادة الميزانية إذا كان الأداء جيد
                if campaign_data.roas > 3.0:
                    optimal_budget = current_budget * 1.2
                elif campaign_data.roas > 2.0:
                    optimal_budget = current_budget * 1.1
                else:
                    optimal_budget = current_budget * 0.9
            elif strategy == OptimizationStrategy.MINIMIZE_COST:
                # تقليل الميزانية للتحكم في التكلفة
                optimal_budget = current_budget * 0.85
            else:
                # استراتيجية متوازنة
                if campaign_data.roas > 2.5:
                    optimal_budget = current_budget * 1.15
                else:
                    optimal_budget = current_budget * 0.95
            
            # التأكد من الحدود المعقولة
            optimal_budget = max(current_budget * 0.5, min(optimal_budget, current_budget * 2))
            
            # إنشاء توصية إذا كان هناك تغيير كبير
            if abs(optimal_budget - current_budget) > current_budget * 0.1:  # تغيير أكثر من 10%
                expected_impact = self._calculate_budget_impact(current_budget, optimal_budget, campaign_data)
                
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.BUDGET_OPTIMIZATION,
                    priority=OptimizationPriority.HIGH,
                    title=f"تحسين ميزانية الحملة: {campaign_data.campaign_name}",
                    description=f"تعديل الميزانية من {current_budget:.2f} إلى {optimal_budget:.2f}",
                    expected_impact=expected_impact,
                    confidence_score=0.80,
                    implementation_effort="منخفض",
                    estimated_time="2 دقيقة",
                    current_value=current_budget,
                    recommended_value=optimal_budget,
                    reasoning=self._generate_budget_reasoning(current_budget, optimal_budget, campaign_data, strategy)
                )
                
                recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_budget_impact(self, current_budget: float, optimal_budget: float,
                               campaign_data: CampaignData) -> Dict[str, float]:
        """حساب تأثير تغيير الميزانية"""
        budget_change_ratio = optimal_budget / current_budget if current_budget > 0 else 1
        
        # تقدير التأثير
        impression_change = (budget_change_ratio - 1) * 100
        click_change = impression_change * 0.8  # تقدير أن النقرات تتبع الانطباعات
        conversion_change = click_change * 0.6  # تقدير أن التحويلات تتبع النقرات
        
        return {
            'budget_change': round(optimal_budget - current_budget, 2),
            'impression_change': round(impression_change, 2),
            'click_change': round(click_change, 2),
            'conversion_change': round(conversion_change, 2)
        }
    
    def _generate_budget_reasoning(self, current_budget: float, optimal_budget: float,
                                 campaign_data: CampaignData, strategy: OptimizationStrategy) -> str:
        """توليد تبرير تغيير الميزانية"""
        if optimal_budget > current_budget:
            return f"زيادة الميزانية لاستغلال الأداء الجيد (ROAS: {campaign_data.roas:.2f}) حسب استراتيجية {strategy.value}"
        else:
            return f"تقليل الميزانية لتحسين الكفاءة وتقليل الهدر حسب استراتيجية {strategy.value}"
    
    def _analyze_keyword_optimization(self, campaign_data: CampaignData) -> List[OptimizationRecommendation]:
        """تحليل تحسين الكلمات المفتاحية"""
        recommendations = []
        
        for keyword in campaign_data.keywords:
            keyword_text = keyword.get('keyword', '')
            impressions = keyword.get('impressions', 0)
            clicks = keyword.get('clicks', 0)
            conversions = keyword.get('conversions', 0)
            cost = keyword.get('cost', 0)
            quality_score = keyword.get('quality_score', 5)
            
            # تحليل أداء الكلمة المفتاحية
            ctr = (clicks / impressions * 100) if impressions > 0 else 0
            cpa = (cost / conversions) if conversions > 0 else float('inf')
            
            # توصيات بناءً على الأداء
            if quality_score < 5:
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.KEYWORD_OPTIMIZATION,
                    priority=OptimizationPriority.HIGH,
                    title=f"تحسين جودة الكلمة المفتاحية: {keyword_text}",
                    description="تحسين نقاط الجودة لتقليل التكلفة وتحسين الموضع",
                    expected_impact={'quality_score_improvement': 2, 'cpc_reduction': 15},
                    confidence_score=0.75,
                    implementation_effort="متوسط",
                    estimated_time="30 دقيقة",
                    current_value=quality_score,
                    recommended_value=7,
                    reasoning="نقاط الجودة المنخفضة تؤثر على التكلفة والموضع"
                )
                recommendations.append(recommendation)
            
            if ctr < 2.0 and impressions > 100:
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.KEYWORD_OPTIMIZATION,
                    priority=OptimizationPriority.MEDIUM,
                    title=f"تحسين معدل النقر للكلمة: {keyword_text}",
                    description="تحسين الإعلانات أو إضافة كلمات سلبية",
                    expected_impact={'ctr_improvement': 1.5, 'quality_score_improvement': 1},
                    confidence_score=0.70,
                    implementation_effort="متوسط",
                    estimated_time="20 دقيقة",
                    current_value=f"{ctr:.2f}%",
                    recommended_value="3.5%",
                    reasoning="معدل النقر المنخفض يؤثر على نقاط الجودة"
                )
                recommendations.append(recommendation)
            
            if conversions == 0 and cost > 50:
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.KEYWORD_OPTIMIZATION,
                    priority=OptimizationPriority.HIGH,
                    title=f"مراجعة الكلمة المفتاحية: {keyword_text}",
                    description="إيقاف أو تعديل كلمة مفتاحية غير منتجة",
                    expected_impact={'cost_saving': cost, 'budget_reallocation': cost},
                    confidence_score=0.85,
                    implementation_effort="منخفض",
                    estimated_time="5 دقائق",
                    current_value="نشط",
                    recommended_value="إيقاف مؤقت",
                    reasoning="تكلفة عالية بدون تحويلات"
                )
                recommendations.append(recommendation)
        
        return recommendations
    
    def _analyze_ad_optimization(self, campaign_data: CampaignData) -> List[OptimizationRecommendation]:
        """تحليل تحسين الإعلانات"""
        recommendations = []
        
        for ad in campaign_data.ads:
            ad_id = ad.get('ad_id', '')
            impressions = ad.get('impressions', 0)
            clicks = ad.get('clicks', 0)
            conversions = ad.get('conversions', 0)
            
            ctr = (clicks / impressions * 100) if impressions > 0 else 0
            conversion_rate = (conversions / clicks * 100) if clicks > 0 else 0
            
            # توصيات تحسين الإعلانات
            if ctr < 2.0 and impressions > 1000:
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.AD_OPTIMIZATION,
                    priority=OptimizationPriority.HIGH,
                    title=f"تحسين الإعلان: {ad_id}",
                    description="تحسين نص الإعلان لزيادة معدل النقر",
                    expected_impact={'ctr_improvement': 2.5, 'click_increase': 25},
                    confidence_score=0.80,
                    implementation_effort="متوسط",
                    estimated_time="45 دقيقة",
                    current_value=f"{ctr:.2f}%",
                    recommended_value="4.5%",
                    reasoning="معدل النقر المنخفض يشير إلى ضرورة تحسين نص الإعلان"
                )
                recommendations.append(recommendation)
            
            if conversion_rate < 2.0 and clicks > 100:
                recommendation = OptimizationRecommendation(
                    recommendation_id=generate_unique_id(),
                    optimization_type=OptimizationType.AD_OPTIMIZATION,
                    priority=OptimizationPriority.MEDIUM,
                    title=f"تحسين صفحة الهبوط للإعلان: {ad_id}",
                    description="تحسين صفحة الهبوط لزيادة معدل التحويل",
                    expected_impact={'conversion_rate_improvement': 3.0, 'conversion_increase': 50},
                    confidence_score=0.75,
                    implementation_effort="عالي",
                    estimated_time="2 ساعة",
                    current_value=f"{conversion_rate:.2f}%",
                    recommended_value="5.0%",
                    reasoning="معدل التحويل المنخفض يشير إلى مشكلة في صفحة الهبوط"
                )
                recommendations.append(recommendation)
        
        return recommendations
    
    def _predict_performance(self, recommendations: List[OptimizationRecommendation],
                           campaign_data: CampaignData) -> Dict[str, float]:
        """تنبؤ الأداء بعد تطبيق التحسينات"""
        current_metrics = {
            'clicks': campaign_data.clicks,
            'conversions': campaign_data.conversions,
            'cost': campaign_data.cost,
            'revenue': campaign_data.revenue,
            'ctr': campaign_data.ctr,
            'cpc': campaign_data.cpc,
            'cpa': campaign_data.cpa,
            'roas': campaign_data.roas
        }
        
        predicted_metrics = current_metrics.copy()
        
        # تطبيق تأثير كل توصية
        for rec in recommendations:
            impact = rec.expected_impact
            confidence = rec.confidence_score
            
            # تطبيق التأثير مع مراعاة مستوى الثقة
            for metric, change in impact.items():
                if metric in predicted_metrics:
                    predicted_metrics[metric] += change * confidence
        
        # حساب التحسن النسبي
        improvement = {}
        for metric in current_metrics:
            if current_metrics[metric] > 0:
                improvement[f"{metric}_improvement"] = (
                    (predicted_metrics[metric] - current_metrics[metric]) / 
                    current_metrics[metric] * 100
                )
            else:
                improvement[f"{metric}_improvement"] = 0
        
        return {**predicted_metrics, **improvement}
    
    async def optimize_campaigns(self, request: OptimizationRequest) -> OptimizationResponse:
        """تحسين الحملات الرئيسي"""
        start_time = time.time()
        request_id = generate_unique_id()
        
        try:
            # فحص التخزين المؤقت
            cache_key = self._generate_cache_key(request.__dict__)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                self.performance_metrics['cache_hit_rate'] += 1
                logger.info(f"تم جلب نتيجة التحسين من التخزين المؤقت: {request_id}")
                return OptimizationResponse(**cached_result)
            
            all_recommendations = []
            
            # تحليل كل حملة
            for campaign_id in request.campaign_ids:
                # محاكاة جلب بيانات الحملة (في التطبيق الحقيقي، استخدم Google Ads API)
                campaign_data = self._simulate_campaign_data(campaign_id)
                campaign_data = self._calculate_campaign_metrics(campaign_data)
                
                # تطبيق أنواع التحسين المطلوبة
                for optimization_type in request.optimization_types:
                    if optimization_type == OptimizationType.BID_OPTIMIZATION:
                        recommendations = self._analyze_bid_optimization(campaign_data, request.strategy)
                        all_recommendations.extend(recommendations)
                    
                    elif optimization_type == OptimizationType.BUDGET_OPTIMIZATION:
                        recommendations = self._analyze_budget_optimization(campaign_data, request.strategy)
                        all_recommendations.extend(recommendations)
                    
                    elif optimization_type == OptimizationType.KEYWORD_OPTIMIZATION:
                        recommendations = self._analyze_keyword_optimization(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif optimization_type == OptimizationType.AD_OPTIMIZATION:
                        recommendations = self._analyze_ad_optimization(campaign_data)
                        all_recommendations.extend(recommendations)
            
            # ترتيب التوصيات حسب الأولوية والتأثير المتوقع
            all_recommendations.sort(
                key=lambda r: (
                    r.priority.value,
                    -r.confidence_score,
                    -sum(r.expected_impact.values())
                )
            )
            
            # تحديد أفضل التوصيات
            top_recommendations = all_recommendations[:20]  # أفضل 20 توصية
            
            # تنبؤ الأداء
            performance_prediction = {}
            if request.campaign_ids:
                sample_campaign = self._simulate_campaign_data(request.campaign_ids[0])
                performance_prediction = self._predict_performance(top_recommendations, sample_campaign)
            
            # إنشاء ملخص
            summary = self._generate_optimization_summary(top_recommendations, request.strategy)
            
            # إنشاء الاستجابة
            processing_time = time.time() - start_time
            response = OptimizationResponse(
                request_id=request_id,
                total_recommendations=len(top_recommendations),
                recommendations=top_recommendations,
                summary=summary,
                performance_prediction=performance_prediction,
                processing_time=processing_time
            )
            
            # حفظ في التخزين المؤقت
            self._cache_result(cache_key, response.__dict__)
            
            # تحديث مقاييس الأداء
            self.performance_metrics['total_optimizations'] += 1
            self.performance_metrics['successful_optimizations'] += 1
            avg_improvement = sum(r.confidence_score for r in top_recommendations) / len(top_recommendations) if top_recommendations else 0
            self.performance_metrics['average_improvement'] = (
                (self.performance_metrics['average_improvement'] * 
                 (self.performance_metrics['total_optimizations'] - 1) + avg_improvement) /
                self.performance_metrics['total_optimizations']
            )
            
            logger.info(f"تم إكمال تحسين الحملات: {request_id} في {processing_time:.3f}s")
            return response
            
        except Exception as e:
            self.performance_metrics['failed_optimizations'] += 1
            logger.error(f"خطأ في تحسين الحملات {request_id}: {e}")
            raise
    
    def _simulate_campaign_data(self, campaign_id: str) -> CampaignData:
        """محاكاة بيانات الحملة (للاختبار)"""
        # في التطبيق الحقيقي، هذه البيانات ستأتي من Google Ads API
        return CampaignData(
            campaign_id=campaign_id,
            campaign_name=f"حملة {campaign_id}",
            status="ENABLED",
            budget=np.random.uniform(100, 1000),
            impressions=np.random.randint(1000, 50000),
            clicks=np.random.randint(50, 2000),
            conversions=np.random.randint(5, 200),
            cost=np.random.uniform(50, 500),
            revenue=np.random.uniform(100, 1500),
            keywords=[
                {
                    'keyword': f'كلمة مفتاحية {i}',
                    'bid': np.random.uniform(0.5, 5.0),
                    'clicks': np.random.randint(10, 200),
                    'conversions': np.random.randint(0, 20),
                    'cost': np.random.uniform(10, 100),
                    'quality_score': np.random.randint(3, 10),
                    'impressions': np.random.randint(100, 5000)
                }
                for i in range(5)
            ],
            ads=[
                {
                    'ad_id': f'إعلان {i}',
                    'impressions': np.random.randint(500, 10000),
                    'clicks': np.random.randint(25, 500),
                    'conversions': np.random.randint(2, 50)
                }
                for i in range(3)
            ]
        )
    
    def _generate_optimization_summary(self, recommendations: List[OptimizationRecommendation],
                                     strategy: OptimizationStrategy) -> Dict[str, Any]:
        """توليد ملخص التحسينات"""
        if not recommendations:
            return {}
        
        # تجميع التوصيات حسب النوع
        by_type = {}
        for rec in recommendations:
            type_name = rec.optimization_type.value
            if type_name not in by_type:
                by_type[type_name] = []
            by_type[type_name].append(rec)
        
        # تجميع التوصيات حسب الأولوية
        by_priority = {}
        for rec in recommendations:
            priority = rec.priority.value
            if priority not in by_priority:
                by_priority[priority] = []
            by_priority[priority].append(rec)
        
        # حساب التأثير الإجمالي المتوقع
        total_expected_impact = {}
        for rec in recommendations:
            for metric, value in rec.expected_impact.items():
                if metric not in total_expected_impact:
                    total_expected_impact[metric] = 0
                total_expected_impact[metric] += value * rec.confidence_score
        
        return {
            'strategy_used': strategy.value,
            'total_recommendations': len(recommendations),
            'recommendations_by_type': {k: len(v) for k, v in by_type.items()},
            'recommendations_by_priority': {k: len(v) for k, v in by_priority.items()},
            'average_confidence': sum(r.confidence_score for r in recommendations) / len(recommendations),
            'total_expected_impact': total_expected_impact,
            'implementation_time_estimate': f"{len(recommendations) * 15} دقيقة",
            'top_priorities': [
                {
                    'title': rec.title,
                    'priority': rec.priority.value,
                    'confidence': rec.confidence_score
                }
                for rec in recommendations[:5]
            ]
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """جلب مقاييس الأداء"""
        return {
            **self.performance_metrics,
            'success_rate': (
                self.performance_metrics['successful_optimizations'] / 
                max(self.performance_metrics['total_optimizations'], 1) * 100
            ),
            'ml_available': ML_AVAILABLE,
            'redis_available': self.redis_client is not None,
            'google_ads_available': self.google_ads_client is not None
        }

# إنشاء مثيل الخدمة
optimization_service = AIOptimizationService()

# مساعدات التحقق من الصحة
def validate_optimization_request(data: Dict[str, Any]) -> OptimizationRequest:
    """التحقق من صحة طلب التحسين"""
    if not data.get('campaign_ids'):
        raise ValueError("campaign_ids مطلوب")
    
    if not isinstance(data['campaign_ids'], list):
        raise ValueError("campaign_ids يجب أن يكون قائمة")
    
    if len(data['campaign_ids']) > 20:
        raise ValueError("عدد الحملات لا يجب أن يتجاوز 20")
    
    # تحويل أنواع التحسين من نص إلى enum
    if 'optimization_types' in data:
        data['optimization_types'] = [
            OptimizationType(opt_type) for opt_type in data['optimization_types']
        ]
    
    # تحويل الاستراتيجية من نص إلى enum
    if 'strategy' in data:
        data['strategy'] = OptimizationStrategy(data['strategy'])
    
    return OptimizationRequest(**data)

# مساعدات الأداء
def optimization_monitor(func):
    """مراقب الأداء للتحسين"""
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

@ai_optimization_bp.route('/campaigns', methods=['POST'])
@jwt_required()
@optimization_monitor
async def optimize_campaigns():
    """تحسين الحملات"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # التحقق من صحة البيانات
        optimization_request = validate_optimization_request(data)
        
        # تنفيذ التحسين
        result = await optimization_service.optimize_campaigns(optimization_request)
        
        return jsonify({
            'success': True,
            'data': {
                'request_id': result.request_id,
                'total_recommendations': result.total_recommendations,
                'recommendations': [
                    {
                        'recommendation_id': r.recommendation_id,
                        'optimization_type': r.optimization_type.value,
                        'priority': r.priority.value,
                        'title': r.title,
                        'description': r.description,
                        'expected_impact': r.expected_impact,
                        'confidence_score': r.confidence_score,
                        'implementation_effort': r.implementation_effort,
                        'estimated_time': r.estimated_time,
                        'current_value': r.current_value,
                        'recommended_value': r.recommended_value,
                        'reasoning': r.reasoning,
                        'risk_level': r.risk_level
                    }
                    for r in result.recommendations
                ],
                'summary': result.summary,
                'performance_prediction': result.performance_prediction,
                'processing_time': result.processing_time
            }
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"خطأ في API تحسين الحملات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/bids', methods=['POST'])
@jwt_required()
async def optimize_bids():
    """تحسين العروض"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        strategy = data.get('strategy', 'maximize_conversions')
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # محاكاة تحسين العروض
        recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = optimization_service._simulate_campaign_data(campaign_id)
            bid_recommendations = optimization_service._analyze_bid_optimization(
                campaign_data, OptimizationStrategy(strategy)
            )
            recommendations.extend(bid_recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(recommendations),
                'recommendations': [
                    {
                        'title': r.title,
                        'description': r.description,
                        'current_value': r.current_value,
                        'recommended_value': r.recommended_value,
                        'expected_impact': r.expected_impact,
                        'confidence_score': r.confidence_score
                    }
                    for r in recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحسين العروض: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/budgets', methods=['POST'])
@jwt_required()
async def optimize_budgets():
    """تحسين الميزانيات"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        strategy = data.get('strategy', 'balance_performance')
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # محاكاة تحسين الميزانيات
        recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = optimization_service._simulate_campaign_data(campaign_id)
            budget_recommendations = optimization_service._analyze_budget_optimization(
                campaign_data, OptimizationStrategy(strategy)
            )
            recommendations.extend(budget_recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(recommendations),
                'recommendations': [
                    {
                        'title': r.title,
                        'description': r.description,
                        'current_value': r.current_value,
                        'recommended_value': r.recommended_value,
                        'expected_impact': r.expected_impact,
                        'confidence_score': r.confidence_score
                    }
                    for r in recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحسين الميزانيات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/keywords', methods=['POST'])
@jwt_required()
async def optimize_keywords():
    """تحسين الكلمات المفتاحية"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # محاكاة تحسين الكلمات المفتاحية
        recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = optimization_service._simulate_campaign_data(campaign_id)
            keyword_recommendations = optimization_service._analyze_keyword_optimization(campaign_data)
            recommendations.extend(keyword_recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(recommendations),
                'recommendations': [
                    {
                        'title': r.title,
                        'description': r.description,
                        'current_value': r.current_value,
                        'recommended_value': r.recommended_value,
                        'expected_impact': r.expected_impact,
                        'confidence_score': r.confidence_score,
                        'priority': r.priority.value
                    }
                    for r in recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحسين الكلمات المفتاحية: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/ads', methods=['POST'])
@jwt_required()
async def optimize_ads():
    """تحسين الإعلانات"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        # محاكاة تحسين الإعلانات
        recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = optimization_service._simulate_campaign_data(campaign_id)
            ad_recommendations = optimization_service._analyze_ad_optimization(campaign_data)
            recommendations.extend(ad_recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(recommendations),
                'recommendations': [
                    {
                        'title': r.title,
                        'description': r.description,
                        'current_value': r.current_value,
                        'recommended_value': r.recommended_value,
                        'expected_impact': r.expected_impact,
                        'confidence_score': r.confidence_score,
                        'implementation_effort': r.implementation_effort
                    }
                    for r in recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحسين الإعلانات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/metrics', methods=['GET'])
@jwt_required()
async def get_optimization_metrics():
    """جلب مقاييس أداء التحسين"""
    try:
        metrics = optimization_service.get_performance_metrics()
        return jsonify({
            'success': True,
            'data': metrics
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب مقاييس التحسين: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_optimization_bp.route('/health', methods=['GET'])
async def health_check():
    """فحص صحة خدمة التحسين"""
    try:
        health_status = {
            'service': 'AI Campaign Optimization',
            'status': 'healthy',
            'ml_available': ML_AVAILABLE,
            'redis_available': optimization_service.redis_client is not None,
            'google_ads_available': optimization_service.google_ads_client is not None,
            'performance': optimization_service.get_performance_metrics(),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص صحة التحسين: {e}")
        return jsonify({
            'service': 'AI Campaign Optimization',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تصدير الكائنات المطلوبة
__all__ = ['ai_optimization_bp', 'AIOptimizationService', 'optimization_service']

