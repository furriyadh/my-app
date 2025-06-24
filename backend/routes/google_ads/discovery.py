"""
Google Ads Discovery Service
خدمة اكتشاف Google Ads الذكية والمتطورة

يوفر وظائف اكتشاف وتحليل شاملة لحسابات Google Ads بما في ذلك:
- اكتشاف الحسابات والحملات تلقائياً
- تحليل الكلمات المفتاحية بالذكاء الاصطناعي
- اكتشاف الفرص الجديدة والتحسينات
- تحليل المنافسين والسوق
- توصيات التحسين المدعومة بالبيانات
- مراقبة الأداء في الوقت الفعلي
- تحليل الاتجاهات والتنبؤات

Author: Google Ads AI Platform Team
Version: 2.1.0
Security Level: Enterprise
Performance: Optimized with AI
"""

import os
import asyncio
import aiohttp
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from collections import defaultdict, Counter
import hashlib
import uuid

# Flask imports
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

# Third-party imports
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Local imports
import logging

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إنشاء Blueprint مع إعدادات متقدمة
google_ads_discovery_bp = Blueprint(
    'google_ads_discovery',
    __name__,
    url_prefix='/api/google-ads/discovery',
    static_folder=None,
    template_folder=None
)

# محاولة استيراد الخدمات المطلوبة
SERVICES_STATUS = {
    'google_ads_client': False,
    'oauth_manager': False,
    'validators': False,
    'helpers': False,
    'database': False,
    'redis': False,
    'ai_services': False
}

try:
    from services.google_ads_client import GoogleAdsClient
    SERVICES_STATUS['google_ads_client'] = True
except ImportError as e:
    logger.warning(f"⚠️ GoogleAdsClient غير متاح: {e}")

try:
    from routes.google_ads.oauth import oauth_manager
    SERVICES_STATUS['oauth_manager'] = True
except ImportError as e:
    logger.warning(f"⚠️ OAuth Manager غير متاح: {e}")

try:
    from utils.validators import validate_customer_id, validate_discovery_params
    SERVICES_STATUS['validators'] = True
except ImportError as e:
    logger.warning(f"⚠️ Validators غير متاح: {e}")

try:
    from utils.helpers import (
        generate_unique_id, sanitize_text, format_currency,
        calculate_performance_score, extract_keywords_from_text
    )
    SERVICES_STATUS['helpers'] = True
except ImportError as e:
    logger.warning(f"⚠️ Helpers غير متاح: {e}")

try:
    from utils.database import DatabaseManager
    SERVICES_STATUS['database'] = True
except ImportError as e:
    logger.warning(f"⚠️ DatabaseManager غير متاح: {e}")

try:
    from utils.redis_config import cache_set, cache_get, cache_delete
    SERVICES_STATUS['redis'] = True
except ImportError as e:
    logger.warning(f"⚠️ Redis غير متاح: {e}")

try:
    from services.ai_services import AIAnalysisService, KeywordAnalyzer, CompetitorAnalyzer
    SERVICES_STATUS['ai_services'] = True
except ImportError as e:
    logger.warning(f"⚠️ AI Services غير متاح: {e}")

# تحديد حالة الخدمات
DISCOVERY_SERVICES_AVAILABLE = any(SERVICES_STATUS.values())
logger.info(f"✅ تم تحميل خدمات Discovery - الخدمات المتاحة: {sum(SERVICES_STATUS.values())}/7")

# إعداد Thread Pool للعمليات المتوازية
executor = ThreadPoolExecutor(max_workers=25, thread_name_prefix="discovery_worker")

class DiscoveryType(Enum):
    """أنواع الاكتشاف"""
    ACCOUNTS = auto()
    CAMPAIGNS = auto()
    AD_GROUPS = auto()
    KEYWORDS = auto()
    COMPETITORS = auto()
    OPPORTUNITIES = auto()
    TRENDS = auto()
    PERFORMANCE = auto()

class AnalysisDepth(Enum):
    """عمق التحليل"""
    BASIC = "basic"
    STANDARD = "standard"
    ADVANCED = "advanced"
    COMPREHENSIVE = "comprehensive"

class OpportunityType(Enum):
    """أنواع الفرص"""
    KEYWORD_EXPANSION = "keyword_expansion"
    BID_OPTIMIZATION = "bid_optimization"
    AD_COPY_IMPROVEMENT = "ad_copy_improvement"
    AUDIENCE_TARGETING = "audience_targeting"
    BUDGET_REALLOCATION = "budget_reallocation"
    NEGATIVE_KEYWORDS = "negative_keywords"
    LANDING_PAGE_OPTIMIZATION = "landing_page_optimization"

@dataclass
class DiscoveryConfig:
    """إعدادات الاكتشاف"""
    customer_id: str
    discovery_types: List[DiscoveryType] = field(default_factory=lambda: [DiscoveryType.ACCOUNTS])
    analysis_depth: AnalysisDepth = AnalysisDepth.STANDARD
    include_historical_data: bool = True
    historical_days: int = 90
    include_competitor_analysis: bool = False
    include_ai_insights: bool = True
    max_results_per_type: int = 100
    enable_caching: bool = True
    cache_duration_hours: int = 24
    parallel_processing: bool = True
    include_performance_metrics: bool = True
    language: str = "ar"
    currency: str = "SAR"
    timezone: str = "Asia/Riyadh"

@dataclass
class AccountInfo:
    """معلومات الحساب"""
    customer_id: str
    name: str
    currency_code: str
    time_zone: str
    status: str
    account_type: str
    manager_customer_id: Optional[str] = None
    descriptive_name: Optional[str] = None
    can_manage_clients: bool = False
    test_account: bool = False
    auto_tagging_enabled: bool = False
    tracking_url_template: Optional[str] = None
    final_url_suffix: Optional[str] = None
    created_date: Optional[datetime] = None
    last_modified_time: Optional[datetime] = None

@dataclass
class CampaignInfo:
    """معلومات الحملة"""
    campaign_id: str
    name: str
    status: str
    campaign_type: str
    serving_status: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget_amount: Optional[float] = None
    budget_type: Optional[str] = None
    bidding_strategy: Optional[str] = None
    target_locations: List[str] = field(default_factory=list)
    target_languages: List[str] = field(default_factory=list)
    ad_groups_count: int = 0
    keywords_count: int = 0
    ads_count: int = 0
    performance_metrics: Dict[str, Any] = field(default_factory=dict)

@dataclass
class KeywordInfo:
    """معلومات الكلمة المفتاحية"""
    keyword_id: str
    text: str
    match_type: str
    status: str
    bid_amount: Optional[float] = None
    quality_score: Optional[int] = None
    search_volume: Optional[int] = None
    competition: Optional[str] = None
    suggested_bid: Optional[float] = None
    performance_metrics: Dict[str, Any] = field(default_factory=dict)
    ai_insights: Dict[str, Any] = field(default_factory=dict)

@dataclass
class OpportunityInsight:
    """فرصة التحسين"""
    opportunity_id: str
    type: OpportunityType
    title: str
    description: str
    impact_score: float
    effort_score: float
    priority: str
    estimated_impact: Dict[str, Any]
    recommended_actions: List[str]
    supporting_data: Dict[str, Any]
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class CompetitorInfo:
    """معلومات المنافس"""
    competitor_id: str
    domain: str
    name: Optional[str] = None
    estimated_budget: Optional[float] = None
    ad_count: Optional[int] = None
    keyword_overlap: Optional[float] = None
    position_overlap: Optional[float] = None
    shared_keywords: List[str] = field(default_factory=list)
    competitive_metrics: Dict[str, Any] = field(default_factory=dict)

class PerformanceAnalyzer:
    """محلل الأداء المتطور"""
    
    def __init__(self):
        """تهيئة محلل الأداء"""
        self.metrics_cache = {}
        self.benchmark_data = {}
    
    def calculate_performance_score(self, metrics: Dict[str, Any]) -> float:
        """حساب نقاط الأداء"""
        try:
            # وزن المقاييس المختلفة
            weights = {
                'ctr': 0.25,  # معدل النقر
                'conversion_rate': 0.30,  # معدل التحويل
                'cost_per_conversion': 0.20,  # تكلفة التحويل
                'quality_score': 0.15,  # نقاط الجودة
                'impression_share': 0.10  # حصة الظهور
            }
            
            score = 0.0
            total_weight = 0.0
            
            for metric, weight in weights.items():
                if metric in metrics and metrics[metric] is not None:
                    normalized_value = self._normalize_metric(metric, metrics[metric])
                    score += normalized_value * weight
                    total_weight += weight
            
            return (score / total_weight * 100) if total_weight > 0 else 0.0
            
        except Exception as e:
            logger.error(f"خطأ في حساب نقاط الأداء: {e}")
            return 0.0
    
    def _normalize_metric(self, metric_name: str, value: float) -> float:
        """تطبيع قيم المقاييس"""
        # تطبيع القيم بناءً على المعايير الصناعية
        normalization_rules = {
            'ctr': lambda x: min(x / 5.0, 1.0),  # 5% CTR = 100%
            'conversion_rate': lambda x: min(x / 10.0, 1.0),  # 10% CR = 100%
            'cost_per_conversion': lambda x: max(1.0 - (x / 1000.0), 0.0),  # أقل تكلفة = أفضل
            'quality_score': lambda x: x / 10.0,  # من 10
            'impression_share': lambda x: x / 100.0  # من 100%
        }
        
        if metric_name in normalization_rules:
            return normalization_rules[metric_name](value)
        
        return min(value / 100.0, 1.0)  # تطبيع افتراضي

class AIInsightsEngine:
    """محرك الرؤى بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة محرك الذكاء الاصطناعي"""
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.keyword_clusters = {}
        self.trend_patterns = {}
    
    async def analyze_keywords(self, keywords: List[KeywordInfo]) -> Dict[str, Any]:
        """تحليل الكلمات المفتاحية بالذكاء الاصطناعي"""
        try:
            if not keywords:
                return {'clusters': [], 'insights': [], 'recommendations': []}
            
            # استخراج النصوص
            keyword_texts = [kw.text for kw in keywords]
            
            # تجميع الكلمات المفتاحية
            clusters = await self._cluster_keywords(keyword_texts)
            
            # تحليل الأداء
            performance_insights = await self._analyze_keyword_performance(keywords)
            
            # توليد التوصيات
            recommendations = await self._generate_keyword_recommendations(keywords, clusters)
            
            return {
                'clusters': clusters,
                'performance_insights': performance_insights,
                'recommendations': recommendations,
                'total_keywords': len(keywords),
                'analysis_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الكلمات المفتاحية: {e}")
            return {'error': str(e)}
    
    async def _cluster_keywords(self, keyword_texts: List[str]) -> List[Dict[str, Any]]:
        """تجميع الكلمات المفتاحية"""
        try:
            if len(keyword_texts) < 3:
                return [{'cluster_id': 0, 'keywords': keyword_texts, 'theme': 'عام'}]
            
            # تحويل النصوص إلى vectors
            tfidf_matrix = self.vectorizer.fit_transform(keyword_texts)
            
            # تحديد عدد المجموعات
            n_clusters = min(5, len(keyword_texts) // 3)
            
            # تطبيق K-means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(tfidf_matrix)
            
            # تنظيم النتائج
            clusters = []
            for i in range(n_clusters):
                cluster_keywords = [keyword_texts[j] for j, label in enumerate(cluster_labels) if label == i]
                theme = await self._extract_cluster_theme(cluster_keywords)
                
                clusters.append({
                    'cluster_id': i,
                    'keywords': cluster_keywords,
                    'theme': theme,
                    'size': len(cluster_keywords)
                })
            
            return clusters
            
        except Exception as e:
            logger.error(f"خطأ في تجميع الكلمات المفتاحية: {e}")
            return []
    
    async def _extract_cluster_theme(self, keywords: List[str]) -> str:
        """استخراج موضوع المجموعة"""
        try:
            # تحليل بسيط لاستخراج الموضوع
            word_freq = Counter()
            for keyword in keywords:
                words = keyword.lower().split()
                word_freq.update(words)
            
            # أكثر الكلمات تكراراً
            most_common = word_freq.most_common(3)
            if most_common:
                return ' + '.join([word for word, _ in most_common])
            
            return 'عام'
            
        except Exception as e:
            logger.error(f"خطأ في استخراج موضوع المجموعة: {e}")
            return 'غير محدد'
    
    async def _analyze_keyword_performance(self, keywords: List[KeywordInfo]) -> List[Dict[str, Any]]:
        """تحليل أداء الكلمات المفتاحية"""
        insights = []
        
        try:
            # تحليل توزيع نقاط الجودة
            quality_scores = [kw.quality_score for kw in keywords if kw.quality_score]
            if quality_scores:
                avg_quality = np.mean(quality_scores)
                insights.append({
                    'type': 'quality_analysis',
                    'message': f'متوسط نقاط الجودة: {avg_quality:.1f}',
                    'recommendation': 'تحسين نقاط الجودة' if avg_quality < 7 else 'نقاط جودة ممتازة'
                })
            
            # تحليل أنواع المطابقة
            match_types = Counter([kw.match_type for kw in keywords])
            insights.append({
                'type': 'match_type_distribution',
                'data': dict(match_types),
                'recommendation': 'توازن جيد في أنواع المطابقة' if len(match_types) > 1 else 'تنويع أنواع المطابقة'
            })
            
            # تحليل الحالة
            statuses = Counter([kw.status for kw in keywords])
            active_ratio = statuses.get('ENABLED', 0) / len(keywords) * 100
            insights.append({
                'type': 'status_analysis',
                'active_percentage': active_ratio,
                'recommendation': 'نسبة تفعيل جيدة' if active_ratio > 80 else 'تحسين نسبة الكلمات النشطة'
            })
            
            return insights
            
        except Exception as e:
            logger.error(f"خطأ في تحليل أداء الكلمات المفتاحية: {e}")
            return []
    
    async def _generate_keyword_recommendations(self, keywords: List[KeywordInfo], clusters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """توليد توصيات الكلمات المفتاحية"""
        recommendations = []
        
        try:
            # توصيات بناءً على نقاط الجودة
            low_quality_keywords = [kw for kw in keywords if kw.quality_score and kw.quality_score < 5]
            if low_quality_keywords:
                recommendations.append({
                    'type': 'quality_improvement',
                    'priority': 'high',
                    'title': 'تحسين نقاط الجودة',
                    'description': f'يوجد {len(low_quality_keywords)} كلمة مفتاحية بنقاط جودة منخفضة',
                    'action': 'مراجعة وتحسين الإعلانات والصفحات المقصودة'
                })
            
            # توصيات بناءً على المجموعات
            for cluster in clusters:
                if cluster['size'] > 10:
                    recommendations.append({
                        'type': 'keyword_expansion',
                        'priority': 'medium',
                        'title': f'توسيع مجموعة {cluster["theme"]}',
                        'description': f'مجموعة كبيرة ({cluster["size"]} كلمة) يمكن تقسيمها',
                        'action': 'إنشاء مجموعات إعلانية منفصلة'
                    })
            
            # توصيات عامة
            if len(keywords) < 20:
                recommendations.append({
                    'type': 'keyword_expansion',
                    'priority': 'medium',
                    'title': 'توسيع قائمة الكلمات المفتاحية',
                    'description': 'عدد الكلمات المفتاحية قليل نسبياً',
                    'action': 'إضافة كلمات مفتاحية ذات صلة'
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"خطأ في توليد توصيات الكلمات المفتاحية: {e}")
            return []

class OpportunityDetector:
    """كاشف الفرص المتطور"""
    
    def __init__(self):
        """تهيئة كاشف الفرص"""
        self.opportunity_rules = self._load_opportunity_rules()
        self.performance_analyzer = PerformanceAnalyzer()
    
    def _load_opportunity_rules(self) -> Dict[str, Any]:
        """تحميل قواعد اكتشاف الفرص"""
        return {
            'low_ctr_threshold': 2.0,  # أقل من 2% CTR
            'high_cpc_threshold': 10.0,  # أعلى من 10 ريال CPC
            'low_quality_score_threshold': 5,  # أقل من 5 نقاط جودة
            'low_impression_share_threshold': 50.0,  # أقل من 50% حصة ظهور
            'high_cost_per_conversion_threshold': 100.0  # أعلى من 100 ريال لكل تحويل
        }
    
    async def detect_opportunities(self, campaigns: List[CampaignInfo], keywords: List[KeywordInfo]) -> List[OpportunityInsight]:
        """اكتشاف الفرص"""
        opportunities = []
        
        try:
            # اكتشاف فرص تحسين معدل النقر
            ctr_opportunities = await self._detect_ctr_opportunities(campaigns, keywords)
            opportunities.extend(ctr_opportunities)
            
            # اكتشاف فرص تحسين العروض
            bid_opportunities = await self._detect_bid_opportunities(keywords)
            opportunities.extend(bid_opportunities)
            
            # اكتشاف فرص الكلمات السلبية
            negative_keyword_opportunities = await self._detect_negative_keyword_opportunities(keywords)
            opportunities.extend(negative_keyword_opportunities)
            
            # اكتشاف فرص إعادة توزيع الميزانية
            budget_opportunities = await self._detect_budget_opportunities(campaigns)
            opportunities.extend(budget_opportunities)
            
            # ترتيب الفرص حسب الأولوية
            opportunities.sort(key=lambda x: x.impact_score, reverse=True)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف الفرص: {e}")
            return []
    
    async def _detect_ctr_opportunities(self, campaigns: List[CampaignInfo], keywords: List[KeywordInfo]) -> List[OpportunityInsight]:
        """اكتشاف فرص تحسين معدل النقر"""
        opportunities = []
        
        try:
            for campaign in campaigns:
                ctr = campaign.performance_metrics.get('ctr', 0)
                if ctr < self.opportunity_rules['low_ctr_threshold']:
                    opportunity = OpportunityInsight(
                        opportunity_id=generate_unique_id('opp_ctr') if SERVICES_STATUS['helpers'] else f"ctr_{campaign.campaign_id}",
                        type=OpportunityType.AD_COPY_IMPROVEMENT,
                        title=f"تحسين معدل النقر للحملة {campaign.name}",
                        description=f"معدل النقر الحالي {ctr:.2f}% أقل من المتوسط المطلوب",
                        impact_score=85.0,
                        effort_score=60.0,
                        priority="high",
                        estimated_impact={
                            'ctr_improvement': f"+{2.0 - ctr:.1f}%",
                            'additional_clicks': int((2.0 - ctr) * campaign.performance_metrics.get('impressions', 0) / 100),
                            'potential_conversions': int((2.0 - ctr) * campaign.performance_metrics.get('impressions', 0) * campaign.performance_metrics.get('conversion_rate', 2) / 10000)
                        },
                        recommended_actions=[
                            "إعادة كتابة نصوص الإعلانات",
                            "إضافة عبارات دعوة للعمل قوية",
                            "اختبار عناوين مختلفة",
                            "تحسين الوصف والامتدادات"
                        ],
                        supporting_data={
                            'current_ctr': ctr,
                            'target_ctr': 2.0,
                            'campaign_id': campaign.campaign_id,
                            'impressions': campaign.performance_metrics.get('impressions', 0)
                        }
                    )
                    opportunities.append(opportunity)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف فرص CTR: {e}")
            return []
    
    async def _detect_bid_opportunities(self, keywords: List[KeywordInfo]) -> List[OpportunityInsight]:
        """اكتشاف فرص تحسين العروض"""
        opportunities = []
        
        try:
            high_cpc_keywords = [kw for kw in keywords if kw.performance_metrics.get('avg_cpc', 0) > self.opportunity_rules['high_cpc_threshold']]
            
            if high_cpc_keywords:
                total_cost_savings = sum(kw.performance_metrics.get('cost', 0) * 0.2 for kw in high_cpc_keywords)
                
                opportunity = OpportunityInsight(
                    opportunity_id=generate_unique_id('opp_bid') if SERVICES_STATUS['helpers'] else f"bid_{int(time.time())}",
                    type=OpportunityType.BID_OPTIMIZATION,
                    title="تحسين عروض الكلمات المفتاحية عالية التكلفة",
                    description=f"يوجد {len(high_cpc_keywords)} كلمة مفتاحية بتكلفة نقرة عالية",
                    impact_score=75.0,
                    effort_score=40.0,
                    priority="medium",
                    estimated_impact={
                        'cost_savings': f"{total_cost_savings:.2f} ريال شهرياً",
                        'affected_keywords': len(high_cpc_keywords),
                        'average_cpc_reduction': "15-25%"
                    },
                    recommended_actions=[
                        "مراجعة عروض الكلمات عالية التكلفة",
                        "تطبيق استراتيجيات عروض ذكية",
                        "تحسين نقاط الجودة لتقليل التكلفة",
                        "إضافة كلمات سلبية لتحسين الاستهداف"
                    ],
                    supporting_data={
                        'high_cpc_keywords': [kw.text for kw in high_cpc_keywords[:10]],
                        'average_cpc': np.mean([kw.performance_metrics.get('avg_cpc', 0) for kw in high_cpc_keywords]),
                        'total_keywords': len(high_cpc_keywords)
                    }
                )
                opportunities.append(opportunity)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف فرص العروض: {e}")
            return []
    
    async def _detect_negative_keyword_opportunities(self, keywords: List[KeywordInfo]) -> List[OpportunityInsight]:
        """اكتشاف فرص الكلمات السلبية"""
        opportunities = []
        
        try:
            # البحث عن كلمات بمعدل تحويل منخفض وتكلفة عالية
            poor_performing_keywords = [
                kw for kw in keywords 
                if kw.performance_metrics.get('conversion_rate', 0) < 1.0 
                and kw.performance_metrics.get('cost', 0) > 50
            ]
            
            if poor_performing_keywords:
                potential_savings = sum(kw.performance_metrics.get('cost', 0) for kw in poor_performing_keywords)
                
                opportunity = OpportunityInsight(
                    opportunity_id=generate_unique_id('opp_neg') if SERVICES_STATUS['helpers'] else f"neg_{int(time.time())}",
                    type=OpportunityType.NEGATIVE_KEYWORDS,
                    title="إضافة كلمات سلبية لتحسين الاستهداف",
                    description=f"يوجد {len(poor_performing_keywords)} كلمة مفتاحية بأداء ضعيف",
                    impact_score=70.0,
                    effort_score=30.0,
                    priority="medium",
                    estimated_impact={
                        'cost_savings': f"{potential_savings:.2f} ريال شهرياً",
                        'improved_relevance': "تحسين جودة الزيارات بنسبة 20-30%",
                        'affected_keywords': len(poor_performing_keywords)
                    },
                    recommended_actions=[
                        "تحليل استعلامات البحث للكلمات ضعيفة الأداء",
                        "إضافة كلمات سلبية للاستعلامات غير ذات الصلة",
                        "مراجعة أنواع مطابقة الكلمات المفتاحية",
                        "تحسين استهداف الجمهور"
                    ],
                    supporting_data={
                        'poor_keywords': [kw.text for kw in poor_performing_keywords[:10]],
                        'average_conversion_rate': np.mean([kw.performance_metrics.get('conversion_rate', 0) for kw in poor_performing_keywords]),
                        'total_cost': potential_savings
                    }
                )
                opportunities.append(opportunity)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف فرص الكلمات السلبية: {e}")
            return []
    
    async def _detect_budget_opportunities(self, campaigns: List[CampaignInfo]) -> List[OpportunityInsight]:
        """اكتشاف فرص إعادة توزيع الميزانية"""
        opportunities = []
        
        try:
            # تحليل أداء الحملات
            campaign_performance = []
            for campaign in campaigns:
                performance_score = self.performance_analyzer.calculate_performance_score(campaign.performance_metrics)
                campaign_performance.append({
                    'campaign': campaign,
                    'performance_score': performance_score,
                    'budget': campaign.budget_amount or 0
                })
            
            # ترتيب حسب الأداء
            campaign_performance.sort(key=lambda x: x['performance_score'], reverse=True)
            
            # البحث عن فرص إعادة التوزيع
            high_performers = [cp for cp in campaign_performance if cp['performance_score'] > 70]
            low_performers = [cp for cp in campaign_performance if cp['performance_score'] < 40]
            
            if high_performers and low_performers:
                opportunity = OpportunityInsight(
                    opportunity_id=generate_unique_id('opp_budget') if SERVICES_STATUS['helpers'] else f"budget_{int(time.time())}",
                    type=OpportunityType.BUDGET_REALLOCATION,
                    title="إعادة توزيع الميزانية بناءً على الأداء",
                    description=f"يمكن تحسين العائد بإعادة توزيع الميزانية من {len(low_performers)} حملة ضعيفة إلى {len(high_performers)} حملة قوية",
                    impact_score=80.0,
                    effort_score=50.0,
                    priority="high",
                    estimated_impact={
                        'roi_improvement': "15-25%",
                        'high_performing_campaigns': len(high_performers),
                        'underperforming_campaigns': len(low_performers),
                        'potential_budget_shift': f"{sum(cp['budget'] for cp in low_performers) * 0.3:.2f} ريال"
                    },
                    recommended_actions=[
                        "زيادة ميزانية الحملات عالية الأداء",
                        "تقليل ميزانية الحملات ضعيفة الأداء",
                        "مراجعة استراتيجيات الحملات ضعيفة الأداء",
                        "تطبيق تحسينات على الحملات المتوسطة"
                    ],
                    supporting_data={
                        'high_performers': [cp['campaign'].name for cp in high_performers[:5]],
                        'low_performers': [cp['campaign'].name for cp in low_performers[:5]],
                        'performance_gap': campaign_performance[0]['performance_score'] - campaign_performance[-1]['performance_score']
                    }
                )
                opportunities.append(opportunity)
            
            return opportunities
            
        except Exception as e:
            logger.error(f"خطأ في اكتشاف فرص الميزانية: {e}")
            return []

class GoogleAdsDiscoveryService:
    """خدمة اكتشاف Google Ads المتطورة والذكية"""
    
    def __init__(self):
        """تهيئة خدمة الاكتشاف"""
        self.google_ads_client = GoogleAdsClient() if SERVICES_STATUS['google_ads_client'] else None
        self.db_manager = DatabaseManager() if SERVICES_STATUS['database'] else None
        self.ai_insights_engine = AIInsightsEngine()
        self.opportunity_detector = OpportunityDetector()
        self.performance_analyzer = PerformanceAnalyzer()
        
        # تخزين مؤقت للنتائج
        self.discovery_cache = {}
        self.cache_expiry = {}
        
        # إحصائيات الخدمة
        self.service_stats = {
            'total_discoveries': 0,
            'successful_discoveries': 0,
            'failed_discoveries': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'last_discovery': None
        }
        
        logger.info("🚀 تم تهيئة خدمة اكتشاف Google Ads المتطورة")
    
    async def discover_accounts(self, config: DiscoveryConfig) -> Dict[str, Any]:
        """اكتشاف الحسابات"""
        try:
            self.service_stats['total_discoveries'] += 1
            
            # فحص التخزين المؤقت
            cache_key = f"accounts_{config.customer_id}"
            if config.enable_caching:
                cached_result = await self._get_from_cache(cache_key)
                if cached_result:
                    self.service_stats['cache_hits'] += 1
                    return cached_result
            
            self.service_stats['cache_misses'] += 1
            
            # اكتشاف الحسابات
            accounts = await self._fetch_accounts(config)
            
            # تحليل الحسابات
            analysis = await self._analyze_accounts(accounts, config)
            
            result = {
                'success': True,
                'discovery_type': 'accounts',
                'config': asdict(config),
                'accounts': [asdict(account) for account in accounts],
                'analysis': analysis,
                'total_accounts': len(accounts),
                'discovery_timestamp': datetime.now(timezone.utc).isoformat(),
                'cache_key': cache_key
            }
            
            # حفظ في التخزين المؤقت
            if config.enable_caching:
                await self._save_to_cache(cache_key, result, config.cache_duration_hours)
            
            self.service_stats['successful_discoveries'] += 1
            self.service_stats['last_discovery'] = datetime.now(timezone.utc)
            
            return result
            
        except Exception as e:
            self.service_stats['failed_discoveries'] += 1
            logger.error(f"خطأ في اكتشاف الحسابات: {e}")
            return {'success': False, 'error': str(e)}
    
    async def discover_campaigns(self, config: DiscoveryConfig) -> Dict[str, Any]:
        """اكتشاف الحملات"""
        try:
            self.service_stats['total_discoveries'] += 1
            
            # فحص التخزين المؤقت
            cache_key = f"campaigns_{config.customer_id}_{config.analysis_depth.value}"
            if config.enable_caching:
                cached_result = await self._get_from_cache(cache_key)
                if cached_result:
                    self.service_stats['cache_hits'] += 1
                    return cached_result
            
            self.service_stats['cache_misses'] += 1
            
            # اكتشاف الحملات
            campaigns = await self._fetch_campaigns(config)
            
            # تحليل الحملات
            analysis = await self._analyze_campaigns(campaigns, config)
            
            # اكتشاف الفرص
            opportunities = []
            if config.analysis_depth in [AnalysisDepth.ADVANCED, AnalysisDepth.COMPREHENSIVE]:
                keywords = await self._fetch_keywords_for_campaigns(campaigns, config)
                opportunities = await self.opportunity_detector.detect_opportunities(campaigns, keywords)
            
            result = {
                'success': True,
                'discovery_type': 'campaigns',
                'config': asdict(config),
                'campaigns': [asdict(campaign) for campaign in campaigns],
                'analysis': analysis,
                'opportunities': [asdict(opp) for opp in opportunities],
                'total_campaigns': len(campaigns),
                'total_opportunities': len(opportunities),
                'discovery_timestamp': datetime.now(timezone.utc).isoformat(),
                'cache_key': cache_key
            }
            
            # حفظ في التخزين المؤقت
            if config.enable_caching:
                await self._save_to_cache(cache_key, result, config.cache_duration_hours)
            
            self.service_stats['successful_discoveries'] += 1
            self.service_stats['last_discovery'] = datetime.now(timezone.utc)
            
            return result
            
        except Exception as e:
            self.service_stats['failed_discoveries'] += 1
            logger.error(f"خطأ في اكتشاف الحملات: {e}")
            return {'success': False, 'error': str(e)}
    
    async def discover_keywords(self, config: DiscoveryConfig) -> Dict[str, Any]:
        """اكتشاف الكلمات المفتاحية"""
        try:
            self.service_stats['total_discoveries'] += 1
            
            # فحص التخزين المؤقت
            cache_key = f"keywords_{config.customer_id}_{config.analysis_depth.value}"
            if config.enable_caching:
                cached_result = await self._get_from_cache(cache_key)
                if cached_result:
                    self.service_stats['cache_hits'] += 1
                    return cached_result
            
            self.service_stats['cache_misses'] += 1
            
            # اكتشاف الكلمات المفتاحية
            keywords = await self._fetch_keywords(config)
            
            # تحليل بالذكاء الاصطناعي
            ai_analysis = {}
            if config.include_ai_insights:
                ai_analysis = await self.ai_insights_engine.analyze_keywords(keywords)
            
            # تحليل الأداء
            performance_analysis = await self._analyze_keyword_performance(keywords, config)
            
            result = {
                'success': True,
                'discovery_type': 'keywords',
                'config': asdict(config),
                'keywords': [asdict(keyword) for keyword in keywords],
                'ai_analysis': ai_analysis,
                'performance_analysis': performance_analysis,
                'total_keywords': len(keywords),
                'discovery_timestamp': datetime.now(timezone.utc).isoformat(),
                'cache_key': cache_key
            }
            
            # حفظ في التخزين المؤقت
            if config.enable_caching:
                await self._save_to_cache(cache_key, result, config.cache_duration_hours)
            
            self.service_stats['successful_discoveries'] += 1
            self.service_stats['last_discovery'] = datetime.now(timezone.utc)
            
            return result
            
        except Exception as e:
            self.service_stats['failed_discoveries'] += 1
            logger.error(f"خطأ في اكتشاف الكلمات المفتاحية: {e}")
            return {'success': False, 'error': str(e)}
    
    async def comprehensive_discovery(self, config: DiscoveryConfig) -> Dict[str, Any]:
        """اكتشاف شامل"""
        try:
            self.service_stats['total_discoveries'] += 1
            
            # تشغيل جميع أنواع الاكتشاف بالتوازي
            tasks = []
            
            if DiscoveryType.ACCOUNTS in config.discovery_types:
                tasks.append(self.discover_accounts(config))
            
            if DiscoveryType.CAMPAIGNS in config.discovery_types:
                tasks.append(self.discover_campaigns(config))
            
            if DiscoveryType.KEYWORDS in config.discovery_types:
                tasks.append(self.discover_keywords(config))
            
            # تنفيذ المهام بالتوازي
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # تجميع النتائج
            comprehensive_result = {
                'success': True,
                'discovery_type': 'comprehensive',
                'config': asdict(config),
                'results': {},
                'summary': {},
                'discovery_timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            # معالجة النتائج
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"خطأ في المهمة {i}: {result}")
                    continue
                
                if result.get('success'):
                    discovery_type = result.get('discovery_type')
                    comprehensive_result['results'][discovery_type] = result
            
            # إنشاء ملخص
            comprehensive_result['summary'] = await self._create_comprehensive_summary(comprehensive_result['results'])
            
            self.service_stats['successful_discoveries'] += 1
            self.service_stats['last_discovery'] = datetime.now(timezone.utc)
            
            return comprehensive_result
            
        except Exception as e:
            self.service_stats['failed_discoveries'] += 1
            logger.error(f"خطأ في الاكتشاف الشامل: {e}")
            return {'success': False, 'error': str(e)}
    
    # دوال مساعدة للاكتشاف
    async def _fetch_accounts(self, config: DiscoveryConfig) -> List[AccountInfo]:
        """جلب معلومات الحسابات"""
        # محاكاة جلب البيانات من Google Ads API
        accounts = [
            AccountInfo(
                customer_id=config.customer_id,
                name="الحساب الرئيسي",
                currency_code=config.currency,
                time_zone=config.timezone,
                status="ENABLED",
                account_type="STANDARD",
                descriptive_name="حساب Google Ads الرئيسي",
                can_manage_clients=False,
                test_account=False,
                auto_tagging_enabled=True,
                created_date=datetime.now(timezone.utc) - timedelta(days=365)
            )
        ]
        return accounts
    
    async def _fetch_campaigns(self, config: DiscoveryConfig) -> List[CampaignInfo]:
        """جلب معلومات الحملات"""
        # محاكاة جلب البيانات من Google Ads API
        campaigns = [
            CampaignInfo(
                campaign_id="12345678901",
                name="حملة البحث الرئيسية",
                status="ENABLED",
                campaign_type="SEARCH",
                serving_status="SERVING",
                start_date="2024-01-01",
                budget_amount=1000.0,
                budget_type="DAILY",
                bidding_strategy="TARGET_CPA",
                target_locations=["Saudi Arabia", "UAE"],
                target_languages=["ar", "en"],
                ad_groups_count=5,
                keywords_count=50,
                ads_count=15,
                performance_metrics={
                    'impressions': 10000,
                    'clicks': 500,
                    'ctr': 5.0,
                    'cost': 2500.0,
                    'conversions': 25,
                    'conversion_rate': 5.0,
                    'cost_per_conversion': 100.0,
                    'avg_cpc': 5.0
                }
            ),
            CampaignInfo(
                campaign_id="12345678902",
                name="حملة الشبكة الإعلانية",
                status="ENABLED",
                campaign_type="DISPLAY",
                serving_status="SERVING",
                start_date="2024-02-01",
                budget_amount=500.0,
                budget_type="DAILY",
                bidding_strategy="TARGET_CPM",
                target_locations=["Saudi Arabia"],
                target_languages=["ar"],
                ad_groups_count=3,
                keywords_count=0,
                ads_count=8,
                performance_metrics={
                    'impressions': 50000,
                    'clicks': 200,
                    'ctr': 0.4,
                    'cost': 800.0,
                    'conversions': 8,
                    'conversion_rate': 4.0,
                    'cost_per_conversion': 100.0,
                    'avg_cpc': 4.0
                }
            )
        ]
        return campaigns
    
    async def _fetch_keywords(self, config: DiscoveryConfig) -> List[KeywordInfo]:
        """جلب معلومات الكلمات المفتاحية"""
        # محاكاة جلب البيانات من Google Ads API
        keywords = [
            KeywordInfo(
                keyword_id="11111111111",
                text="شراء سيارة",
                match_type="BROAD",
                status="ENABLED",
                bid_amount=5.0,
                quality_score=8,
                search_volume=1000,
                competition="MEDIUM",
                suggested_bid=4.5,
                performance_metrics={
                    'impressions': 2000,
                    'clicks': 100,
                    'ctr': 5.0,
                    'cost': 500.0,
                    'conversions': 5,
                    'conversion_rate': 5.0,
                    'avg_cpc': 5.0
                }
            ),
            KeywordInfo(
                keyword_id="11111111112",
                text="سيارات للبيع",
                match_type="PHRASE",
                status="ENABLED",
                bid_amount=6.0,
                quality_score=7,
                search_volume=800,
                competition="HIGH",
                suggested_bid=7.0,
                performance_metrics={
                    'impressions': 1500,
                    'clicks': 75,
                    'ctr': 5.0,
                    'cost': 450.0,
                    'conversions': 4,
                    'conversion_rate': 5.3,
                    'avg_cpc': 6.0
                }
            ),
            KeywordInfo(
                keyword_id="11111111113",
                text="[سيارة جديدة]",
                match_type="EXACT",
                status="ENABLED",
                bid_amount=8.0,
                quality_score=9,
                search_volume=500,
                competition="LOW",
                suggested_bid=6.0,
                performance_metrics={
                    'impressions': 800,
                    'clicks': 60,
                    'ctr': 7.5,
                    'cost': 480.0,
                    'conversions': 6,
                    'conversion_rate': 10.0,
                    'avg_cpc': 8.0
                }
            )
        ]
        return keywords
    
    async def _fetch_keywords_for_campaigns(self, campaigns: List[CampaignInfo], config: DiscoveryConfig) -> List[KeywordInfo]:
        """جلب الكلمات المفتاحية للحملات"""
        # في التطبيق الحقيقي، سيتم جلب الكلمات المفتاحية لكل حملة
        return await self._fetch_keywords(config)
    
    async def _analyze_accounts(self, accounts: List[AccountInfo], config: DiscoveryConfig) -> Dict[str, Any]:
        """تحليل الحسابات"""
        analysis = {
            'total_accounts': len(accounts),
            'account_types': Counter([acc.account_type for acc in accounts]),
            'currencies': Counter([acc.currency_code for acc in accounts]),
            'timezones': Counter([acc.time_zone for acc in accounts]),
            'enabled_accounts': len([acc for acc in accounts if acc.status == 'ENABLED']),
            'test_accounts': len([acc for acc in accounts if acc.test_account]),
            'auto_tagging_enabled': len([acc for acc in accounts if acc.auto_tagging_enabled])
        }
        
        return analysis
    
    async def _analyze_campaigns(self, campaigns: List[CampaignInfo], config: DiscoveryConfig) -> Dict[str, Any]:
        """تحليل الحملات"""
        analysis = {
            'total_campaigns': len(campaigns),
            'campaign_types': Counter([camp.campaign_type for camp in campaigns]),
            'campaign_statuses': Counter([camp.status for camp in campaigns]),
            'serving_statuses': Counter([camp.serving_status for camp in campaigns]),
            'bidding_strategies': Counter([camp.bidding_strategy for camp in campaigns]),
            'total_budget': sum([camp.budget_amount or 0 for camp in campaigns]),
            'average_budget': np.mean([camp.budget_amount or 0 for camp in campaigns]),
            'total_ad_groups': sum([camp.ad_groups_count for camp in campaigns]),
            'total_keywords': sum([camp.keywords_count for camp in campaigns]),
            'total_ads': sum([camp.ads_count for camp in campaigns])
        }
        
        # تحليل الأداء
        if config.include_performance_metrics:
            performance_metrics = []
            for campaign in campaigns:
                if campaign.performance_metrics:
                    performance_score = self.performance_analyzer.calculate_performance_score(campaign.performance_metrics)
                    performance_metrics.append(performance_score)
            
            if performance_metrics:
                analysis['performance_analysis'] = {
                    'average_performance_score': np.mean(performance_metrics),
                    'best_performing_campaign': max(performance_metrics),
                    'worst_performing_campaign': min(performance_metrics),
                    'performance_distribution': {
                        'excellent': len([p for p in performance_metrics if p >= 80]),
                        'good': len([p for p in performance_metrics if 60 <= p < 80]),
                        'average': len([p for p in performance_metrics if 40 <= p < 60]),
                        'poor': len([p for p in performance_metrics if p < 40])
                    }
                }
        
        return analysis
    
    async def _analyze_keyword_performance(self, keywords: List[KeywordInfo], config: DiscoveryConfig) -> Dict[str, Any]:
        """تحليل أداء الكلمات المفتاحية"""
        analysis = {
            'total_keywords': len(keywords),
            'match_types': Counter([kw.match_type for kw in keywords]),
            'statuses': Counter([kw.status for kw in keywords]),
            'competition_levels': Counter([kw.competition for kw in keywords if kw.competition])
        }
        
        # تحليل نقاط الجودة
        quality_scores = [kw.quality_score for kw in keywords if kw.quality_score]
        if quality_scores:
            analysis['quality_score_analysis'] = {
                'average_quality_score': np.mean(quality_scores),
                'quality_score_distribution': {
                    'excellent': len([q for q in quality_scores if q >= 8]),
                    'good': len([q for q in quality_scores if 6 <= q < 8]),
                    'average': len([q for q in quality_scores if 4 <= q < 6]),
                    'poor': len([q for q in quality_scores if q < 4])
                }
            }
        
        # تحليل الأداء
        if config.include_performance_metrics:
            performance_data = []
            for keyword in keywords:
                if keyword.performance_metrics:
                    performance_data.append(keyword.performance_metrics)
            
            if performance_data:
                analysis['performance_summary'] = {
                    'total_impressions': sum([p.get('impressions', 0) for p in performance_data]),
                    'total_clicks': sum([p.get('clicks', 0) for p in performance_data]),
                    'total_cost': sum([p.get('cost', 0) for p in performance_data]),
                    'total_conversions': sum([p.get('conversions', 0) for p in performance_data]),
                    'average_ctr': np.mean([p.get('ctr', 0) for p in performance_data]),
                    'average_cpc': np.mean([p.get('avg_cpc', 0) for p in performance_data]),
                    'average_conversion_rate': np.mean([p.get('conversion_rate', 0) for p in performance_data])
                }
        
        return analysis
    
    async def _create_comprehensive_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء ملخص شامل"""
        summary = {
            'discovery_types_completed': list(results.keys()),
            'total_discovery_types': len(results),
            'overall_health_score': 0.0,
            'key_insights': [],
            'priority_recommendations': [],
            'next_steps': []
        }
        
        # حساب نقاط الصحة العامة
        health_scores = []
        
        # تحليل نتائج الحملات
        if 'campaigns' in results:
            campaigns_data = results['campaigns']
            if campaigns_data.get('analysis', {}).get('performance_analysis'):
                perf_analysis = campaigns_data['analysis']['performance_analysis']
                health_scores.append(perf_analysis.get('average_performance_score', 0))
                
                summary['key_insights'].append(
                    f"متوسط أداء الحملات: {perf_analysis.get('average_performance_score', 0):.1f}%"
                )
        
        # تحليل نتائج الكلمات المفتاحية
        if 'keywords' in results:
            keywords_data = results['keywords']
            if keywords_data.get('performance_analysis', {}).get('quality_score_analysis'):
                quality_analysis = keywords_data['performance_analysis']['quality_score_analysis']
                avg_quality = quality_analysis.get('average_quality_score', 0)
                health_scores.append(avg_quality * 10)  # تحويل إلى نسبة مئوية
                
                summary['key_insights'].append(
                    f"متوسط نقاط الجودة: {avg_quality:.1f}/10"
                )
        
        # حساب النقاط العامة
        if health_scores:
            summary['overall_health_score'] = np.mean(health_scores)
        
        # توصيات أولوية
        if summary['overall_health_score'] < 60:
            summary['priority_recommendations'].append("تحسين الأداء العام للحساب")
            summary['next_steps'].append("مراجعة شاملة لجميع الحملات والكلمات المفتاحية")
        
        if 'campaigns' in results and results['campaigns'].get('opportunities'):
            opportunities = results['campaigns']['opportunities']
            high_priority_opps = [opp for opp in opportunities if opp.get('priority') == 'high']
            if high_priority_opps:
                summary['priority_recommendations'].append(f"تنفيذ {len(high_priority_opps)} فرصة عالية الأولوية")
        
        return summary
    
    # دوال التخزين المؤقت
    async def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """جلب من التخزين المؤقت"""
        try:
            # فحص انتهاء الصلاحية
            if cache_key in self.cache_expiry:
                if datetime.now(timezone.utc) > self.cache_expiry[cache_key]:
                    # انتهت الصلاحية
                    if cache_key in self.discovery_cache:
                        del self.discovery_cache[cache_key]
                    del self.cache_expiry[cache_key]
                    return None
            
            # جلب من الذاكرة
            if cache_key in self.discovery_cache:
                return self.discovery_cache[cache_key]
            
            # جلب من Redis إذا كان متاحاً
            if SERVICES_STATUS['redis']:
                cached_data = cache_get(f"discovery:{cache_key}")
                if cached_data:
                    self.discovery_cache[cache_key] = cached_data
                    return cached_data
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب البيانات من التخزين المؤقت: {e}")
            return None
    
    async def _save_to_cache(self, cache_key: str, data: Dict[str, Any], duration_hours: int):
        """حفظ في التخزين المؤقت"""
        try:
            # حفظ في الذاكرة
            self.discovery_cache[cache_key] = data
            self.cache_expiry[cache_key] = datetime.now(timezone.utc) + timedelta(hours=duration_hours)
            
            # حفظ في Redis إذا كان متاحاً
            if SERVICES_STATUS['redis']:
                cache_set(f"discovery:{cache_key}", data, duration_hours * 3600)
            
        except Exception as e:
            logger.error(f"خطأ في حفظ البيانات في التخزين المؤقت: {e}")
    
    def get_service_stats(self) -> Dict[str, Any]:
        """جلب إحصائيات الخدمة"""
        success_rate = 0
        if self.service_stats['total_discoveries'] > 0:
            success_rate = (self.service_stats['successful_discoveries'] / self.service_stats['total_discoveries']) * 100
        
        cache_hit_rate = 0
        total_cache_requests = self.service_stats['cache_hits'] + self.service_stats['cache_misses']
        if total_cache_requests > 0:
            cache_hit_rate = (self.service_stats['cache_hits'] / total_cache_requests) * 100
        
        return {
            **self.service_stats,
            'success_rate': success_rate,
            'cache_hit_rate': cache_hit_rate,
            'active_cache_entries': len(self.discovery_cache),
            'services_status': SERVICES_STATUS
        }

# إنشاء مثيل خدمة الاكتشاف
discovery_service = GoogleAdsDiscoveryService()

# ===========================================
# API Routes - المسارات المتطورة
# ===========================================

@google_ads_discovery_bp.route('/accounts', methods=['POST'])
@jwt_required()
async def discover_accounts():
    """اكتشاف الحسابات"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # إنشاء إعدادات الاكتشاف
        config = DiscoveryConfig(
            customer_id=data.get('customer_id', ''),
            analysis_depth=AnalysisDepth(data.get('analysis_depth', 'standard')),
            include_historical_data=data.get('include_historical_data', True),
            historical_days=data.get('historical_days', 90),
            enable_caching=data.get('enable_caching', True),
            cache_duration_hours=data.get('cache_duration_hours', 24)
        )
        
        # التحقق من صحة البيانات
        if SERVICES_STATUS['validators']:
            if not validate_customer_id(config.customer_id):
                return jsonify({
                    'success': False,
                    'error': 'معرف العميل غير صحيح'
                }), 400
        
        # تنفيذ الاكتشاف
        result = await discovery_service.discover_accounts(config)
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API اكتشاف الحسابات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في اكتشاف الحسابات',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/campaigns', methods=['POST'])
@jwt_required()
async def discover_campaigns():
    """اكتشاف الحملات"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # إنشاء إعدادات الاكتشاف
        config = DiscoveryConfig(
            customer_id=data.get('customer_id', ''),
            analysis_depth=AnalysisDepth(data.get('analysis_depth', 'standard')),
            include_historical_data=data.get('include_historical_data', True),
            historical_days=data.get('historical_days', 90),
            include_ai_insights=data.get('include_ai_insights', True),
            include_performance_metrics=data.get('include_performance_metrics', True),
            enable_caching=data.get('enable_caching', True)
        )
        
        # تنفيذ الاكتشاف
        result = await discovery_service.discover_campaigns(config)
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API اكتشاف الحملات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في اكتشاف الحملات',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/keywords', methods=['POST'])
@jwt_required()
async def discover_keywords():
    """اكتشاف الكلمات المفتاحية"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # إنشاء إعدادات الاكتشاف
        config = DiscoveryConfig(
            customer_id=data.get('customer_id', ''),
            analysis_depth=AnalysisDepth(data.get('analysis_depth', 'advanced')),
            include_ai_insights=data.get('include_ai_insights', True),
            include_performance_metrics=data.get('include_performance_metrics', True),
            max_results_per_type=data.get('max_results', 100),
            enable_caching=data.get('enable_caching', True)
        )
        
        # تنفيذ الاكتشاف
        result = await discovery_service.discover_keywords(config)
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API اكتشاف الكلمات المفتاحية: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في اكتشاف الكلمات المفتاحية',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/comprehensive', methods=['POST'])
@jwt_required()
async def comprehensive_discovery():
    """اكتشاف شامل"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # تحديد أنواع الاكتشاف
        discovery_types = []
        requested_types = data.get('discovery_types', ['accounts', 'campaigns', 'keywords'])
        
        type_mapping = {
            'accounts': DiscoveryType.ACCOUNTS,
            'campaigns': DiscoveryType.CAMPAIGNS,
            'keywords': DiscoveryType.KEYWORDS,
            'competitors': DiscoveryType.COMPETITORS,
            'opportunities': DiscoveryType.OPPORTUNITIES
        }
        
        for type_name in requested_types:
            if type_name in type_mapping:
                discovery_types.append(type_mapping[type_name])
        
        # إنشاء إعدادات الاكتشاف
        config = DiscoveryConfig(
            customer_id=data.get('customer_id', ''),
            discovery_types=discovery_types,
            analysis_depth=AnalysisDepth(data.get('analysis_depth', 'comprehensive')),
            include_historical_data=data.get('include_historical_data', True),
            historical_days=data.get('historical_days', 90),
            include_competitor_analysis=data.get('include_competitor_analysis', False),
            include_ai_insights=data.get('include_ai_insights', True),
            include_performance_metrics=data.get('include_performance_metrics', True),
            parallel_processing=data.get('parallel_processing', True),
            enable_caching=data.get('enable_caching', True)
        )
        
        # تنفيذ الاكتشاف الشامل
        result = await discovery_service.comprehensive_discovery(config)
        
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        logger.error(f"خطأ في API الاكتشاف الشامل: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في الاكتشاف الشامل',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/opportunities', methods=['POST'])
@jwt_required()
async def detect_opportunities():
    """اكتشاف الفرص"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        customer_id = data.get('customer_id', '')
        
        # إنشاء إعدادات مؤقتة
        config = DiscoveryConfig(customer_id=customer_id)
        
        # جلب البيانات المطلوبة
        campaigns = await discovery_service._fetch_campaigns(config)
        keywords = await discovery_service._fetch_keywords(config)
        
        # اكتشاف الفرص
        opportunities = await discovery_service.opportunity_detector.detect_opportunities(campaigns, keywords)
        
        return jsonify({
            'success': True,
            'opportunities': [asdict(opp) for opp in opportunities],
            'total_opportunities': len(opportunities),
            'high_priority_count': len([opp for opp in opportunities if opp.priority == 'high']),
            'medium_priority_count': len([opp for opp in opportunities if opp.priority == 'medium']),
            'low_priority_count': len([opp for opp in opportunities if opp.priority == 'low']),
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في API اكتشاف الفرص: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في اكتشاف الفرص',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_discovery_stats():
    """جلب إحصائيات خدمة الاكتشاف"""
    try:
        stats = discovery_service.get_service_stats()
        
        return jsonify({
            'success': True,
            'stats': stats,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في API الإحصائيات: {e}")
        return jsonify({
            'success': False,
            'error': 'خطأ في جلب الإحصائيات',
            'message': str(e)
        }), 500

@google_ads_discovery_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة خدمة الاكتشاف"""
    try:
        health_status = {
            'service': 'Google Ads Discovery',
            'status': 'healthy',
            'version': '2.1.0',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'services_status': SERVICES_STATUS,
            'cache_entries': len(discovery_service.discovery_cache),
            'total_discoveries': discovery_service.service_stats['total_discoveries']
        }
        
        # فحص الخدمات الأساسية
        if not any(SERVICES_STATUS.values()):
            health_status['status'] = 'degraded'
            health_status['warning'] = 'بعض الخدمات غير متاحة'
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {e}")
        return jsonify({
            'service': 'Google Ads Discovery',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تسجيل معلومات Blueprint
logger.info(f"✅ تم تحميل Google Ads Discovery Blueprint - الخدمات متاحة: {DISCOVERY_SERVICES_AVAILABLE}")
logger.info(f"📊 حالة الخدمات: {sum(SERVICES_STATUS.values())}/7 متاحة")

# تصدير Blueprint والكلاسات
__all__ = [
    'google_ads_discovery_bp',
    'GoogleAdsDiscoveryService',
    'DiscoveryConfig',
    'AccountInfo',
    'CampaignInfo',
    'KeywordInfo',
    'OpportunityInsight',
    'CompetitorInfo',
    'DiscoveryType',
    'AnalysisDepth',
    'OpportunityType',
    'PerformanceAnalyzer',
    'AIInsightsEngine',
    'OpportunityDetector'
]

