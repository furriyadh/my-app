"""
AI Recommendations Service
خدمة التوصيات الذكية بالذكاء الاصطناعي

خدمة متطورة لتوليد توصيات ذكية ومخصصة لتحسين حملات Google Ads
تتضمن توصيات الكلمات المفتاحية، العروض، الاستهداف، والمحتوى

Author: AI Recommendations Team
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
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
    from sklearn.cluster import KMeans
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, mean_squared_error
    import nltk
    from textblob import TextBlob
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
ai_recommendations_bp = Blueprint(
    'ai_recommendations',
    __name__,
    url_prefix='/api/ai/recommendations'
)

# إعداد Thread Pool للعمليات المتوازية
recommendations_executor = ThreadPoolExecutor(max_workers=20, thread_name_prefix="recommendations_worker")

class RecommendationType(Enum):
    """أنواع التوصيات"""
    KEYWORD_EXPANSION = "keyword_expansion"           # توسيع الكلمات المفتاحية
    BID_OPTIMIZATION = "bid_optimization"             # تحسين العروض
    AD_COPY_IMPROVEMENT = "ad_copy_improvement"       # تحسين نص الإعلان
    AUDIENCE_TARGETING = "audience_targeting"         # استهداف الجمهور
    BUDGET_ALLOCATION = "budget_allocation"           # توزيع الميزانية
    LANDING_PAGE_OPTIMIZATION = "landing_page_optimization"  # تحسين صفحة الهبوط
    NEGATIVE_KEYWORDS = "negative_keywords"           # الكلمات المفتاحية السلبية
    CAMPAIGN_STRUCTURE = "campaign_structure"         # هيكل الحملة
    SCHEDULING_OPTIMIZATION = "scheduling_optimization"  # تحسين الجدولة
    DEVICE_TARGETING = "device_targeting"             # استهداف الأجهزة

class RecommendationPriority(Enum):
    """أولوية التوصيات"""
    CRITICAL = "critical"     # حرج
    HIGH = "high"            # عالي
    MEDIUM = "medium"        # متوسط
    LOW = "low"              # منخفض

class RecommendationStatus(Enum):
    """حالة التوصية"""
    PENDING = "pending"           # في الانتظار
    APPLIED = "applied"           # مطبقة
    REJECTED = "rejected"         # مرفوضة
    EXPIRED = "expired"           # منتهية الصلاحية

class ImpactLevel(Enum):
    """مستوى التأثير"""
    HIGH = "high"        # عالي
    MEDIUM = "medium"    # متوسط
    LOW = "low"          # منخفض

@dataclass
class KeywordRecommendation:
    """توصية الكلمات المفتاحية"""
    keyword: str
    match_type: str
    estimated_cpc: float
    search_volume: int
    competition_level: str
    relevance_score: float
    potential_impressions: int
    potential_clicks: int
    potential_conversions: float
    confidence_score: float

@dataclass
class BidRecommendation:
    """توصية العروض"""
    keyword_or_adgroup: str
    current_bid: float
    recommended_bid: float
    bid_change_percentage: float
    expected_position_change: float
    expected_cost_change: float
    expected_conversion_change: float
    reasoning: str

@dataclass
class AdCopyRecommendation:
    """توصية نص الإعلان"""
    current_headline: str
    recommended_headline: str
    current_description: str
    recommended_description: str
    improvement_reason: str
    expected_ctr_improvement: float
    a_b_test_suggestion: bool

@dataclass
class AudienceRecommendation:
    """توصية الجمهور"""
    audience_type: str
    audience_name: str
    audience_size: int
    targeting_criteria: Dict[str, Any]
    expected_performance: Dict[str, float]
    overlap_with_existing: float

@dataclass
class RecommendationData:
    """بيانات التوصية"""
    recommendation_id: str
    recommendation_type: RecommendationType
    priority: RecommendationPriority
    title: str
    description: str
    impact_level: ImpactLevel
    estimated_impact: Dict[str, float]
    implementation_effort: str
    implementation_steps: List[str]
    expected_results: Dict[str, Any]
    confidence_score: float
    supporting_data: Dict[str, Any]
    expiry_date: datetime
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: RecommendationStatus = RecommendationStatus.PENDING

@dataclass
class RecommendationsRequest:
    """طلب التوصيات"""
    campaign_ids: List[str]
    recommendation_types: List[RecommendationType]
    priority_filter: Optional[RecommendationPriority] = None
    max_recommendations: int = 20
    include_implementation_guide: bool = True
    performance_goals: Dict[str, float] = field(default_factory=dict)

@dataclass
class RecommendationsResponse:
    """استجابة التوصيات"""
    request_id: str
    total_recommendations: int
    recommendations: List[RecommendationData]
    summary: Dict[str, Any]
    processing_time: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class AIRecommendationsService:
    """خدمة التوصيات الذكية بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة التوصيات"""
        self.cache_ttl = 1800  # 30 دقيقة
        self.redis_client = None
        self.google_ads_client = None
        self.ml_models = {}
        self.keyword_database = {}
        self.performance_metrics = {
            'total_recommendations': 0,
            'successful_recommendations': 0,
            'failed_recommendations': 0,
            'applied_recommendations': 0,
            'average_processing_time': 0.0,
            'average_confidence_score': 0.0
        }
        
        # تهيئة العملاء
        self._initialize_clients()
        
        # تهيئة نماذج التعلم الآلي
        if ML_AVAILABLE:
            self._initialize_ml_models()
        
        # تحميل قاعدة بيانات الكلمات المفتاحية
        self._load_keyword_database()
        
        logger.info("✅ تم تهيئة خدمة التوصيات الذكية بالذكاء الاصطناعي")
    
    def _initialize_clients(self) -> None:
        """تهيئة العملاء الخارجيين"""
        try:
            self.redis_client = get_redis_client()
            logger.info("✅ تم تهيئة عميل Redis للتوصيات")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Redis: {e}")
        
        try:
            self.google_ads_client = GoogleAdsClient()
            logger.info("✅ تم تهيئة عميل Google Ads للتوصيات")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Google Ads: {e}")
    
    def _initialize_ml_models(self) -> None:
        """تهيئة نماذج التعلم الآلي للتوصيات"""
        try:
            # نموذج توقع أداء الكلمات المفتاحية
            self.ml_models['keyword_performance'] = {
                'model': RandomForestClassifier(n_estimators=100, random_state=42),
                'scaler': StandardScaler(),
                'encoder': LabelEncoder()
            }
            
            # نموذج تحسين العروض
            self.ml_models['bid_optimizer'] = {
                'model': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'scaler': StandardScaler()
            }
            
            # نموذج تحليل النصوص للإعلانات
            self.ml_models['ad_copy_analyzer'] = {
                'vectorizer': TfidfVectorizer(max_features=1000, stop_words='english'),
                'similarity_threshold': 0.7
            }
            
            # نموذج تجميع الجمهور
            self.ml_models['audience_clusterer'] = {
                'model': KMeans(n_clusters=8, random_state=42),
                'scaler': StandardScaler()
            }
            
            logger.info("✅ تم تهيئة نماذج التعلم الآلي للتوصيات")
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة نماذج التعلم الآلي: {e}")
    
    def _load_keyword_database(self) -> None:
        """تحميل قاعدة بيانات الكلمات المفتاحية"""
        # محاكاة قاعدة بيانات الكلمات المفتاحية
        self.keyword_database = {
            'technology': {
                'keywords': ['software', 'app', 'digital', 'tech', 'innovation', 'AI', 'machine learning'],
                'avg_cpc': 2.5,
                'competition': 'high'
            },
            'marketing': {
                'keywords': ['advertising', 'promotion', 'brand', 'campaign', 'social media', 'SEO'],
                'avg_cpc': 3.2,
                'competition': 'high'
            },
            'business': {
                'keywords': ['consulting', 'strategy', 'management', 'enterprise', 'solution'],
                'avg_cpc': 4.1,
                'competition': 'medium'
            },
            'ecommerce': {
                'keywords': ['online store', 'shopping', 'buy', 'sale', 'discount', 'product'],
                'avg_cpc': 1.8,
                'competition': 'high'
            }
        }
        
        logger.info("✅ تم تحميل قاعدة بيانات الكلمات المفتاحية")
    
    def _generate_cache_key(self, request_data: Dict[str, Any]) -> str:
        """توليد مفتاح التخزين المؤقت"""
        request_str = json.dumps(request_data, sort_keys=True, ensure_ascii=False)
        return f"recommendations:{hashlib.md5(request_str.encode()).hexdigest()}"
    
    def _simulate_campaign_data(self, campaign_id: str) -> Dict[str, Any]:
        """محاكاة بيانات الحملة"""
        np.random.seed(hash(campaign_id) % 2**32)
        
        return {
            'campaign_id': campaign_id,
            'current_keywords': [
                f"keyword_{i}" for i in range(np.random.randint(10, 30))
            ],
            'current_performance': {
                'impressions': np.random.randint(1000, 10000),
                'clicks': np.random.randint(50, 500),
                'conversions': np.random.randint(5, 50),
                'cost': np.random.uniform(100, 1000),
                'ctr': np.random.uniform(1, 8),
                'cpc': np.random.uniform(0.5, 5.0),
                'conversion_rate': np.random.uniform(2, 15)
            },
            'current_bids': {
                f"keyword_{i}": np.random.uniform(0.5, 3.0)
                for i in range(np.random.randint(5, 15))
            },
            'ad_copies': [
                {
                    'headline': f"عنوان إعلان {i}",
                    'description': f"وصف إعلان {i}",
                    'ctr': np.random.uniform(1, 6)
                }
                for i in range(np.random.randint(2, 5))
            ],
            'target_audiences': [
                f"جمهور_{i}" for i in range(np.random.randint(1, 4))
            ],
            'budget': np.random.uniform(500, 5000),
            'goals': {
                'target_cpa': np.random.uniform(10, 50),
                'target_roas': np.random.uniform(300, 800)
            }
        }
    
    def _generate_keyword_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات الكلمات المفتاحية"""
        recommendations = []
        
        try:
            current_keywords = set(campaign_data.get('current_keywords', []))
            
            # تحليل الكلمات المفتاحية الحالية لتحديد الفئة
            category = self._detect_campaign_category(current_keywords)
            
            if category in self.keyword_database:
                suggested_keywords = self.keyword_database[category]['keywords']
                
                for keyword in suggested_keywords:
                    if keyword not in current_keywords:
                        # محاكاة بيانات الكلمة المفتاحية
                        keyword_data = KeywordRecommendation(
                            keyword=keyword,
                            match_type="broad",
                            estimated_cpc=np.random.uniform(1.0, 4.0),
                            search_volume=np.random.randint(1000, 10000),
                            competition_level="medium",
                            relevance_score=np.random.uniform(0.7, 0.95),
                            potential_impressions=np.random.randint(500, 5000),
                            potential_clicks=np.random.randint(25, 250),
                            potential_conversions=np.random.uniform(2, 25),
                            confidence_score=np.random.uniform(0.75, 0.95)
                        )
                        
                        recommendation = RecommendationData(
                            recommendation_id=generate_unique_id(),
                            recommendation_type=RecommendationType.KEYWORD_EXPANSION,
                            priority=RecommendationPriority.HIGH,
                            title=f"إضافة الكلمة المفتاحية: {keyword}",
                            description=f"كلمة مفتاحية عالية الصلة بحجم بحث {keyword_data.search_volume:,}",
                            impact_level=ImpactLevel.MEDIUM,
                            estimated_impact={
                                'impressions_increase': keyword_data.potential_impressions,
                                'clicks_increase': keyword_data.potential_clicks,
                                'conversions_increase': keyword_data.potential_conversions,
                                'cost_increase': keyword_data.estimated_cpc * keyword_data.potential_clicks
                            },
                            implementation_effort="سهل",
                            implementation_steps=[
                                f"إضافة الكلمة المفتاحية '{keyword}' للمجموعة الإعلانية",
                                f"تعيين عرض ابتدائي {keyword_data.estimated_cpc:.2f}",
                                "مراقبة الأداء لمدة أسبوع",
                                "تحسين العرض حسب النتائج"
                            ],
                            expected_results={
                                'timeline': '1-2 أسابيع',
                                'success_probability': keyword_data.confidence_score
                            },
                            confidence_score=keyword_data.confidence_score,
                            supporting_data=keyword_data.__dict__,
                            expiry_date=datetime.now(timezone.utc) + timedelta(days=30)
                        )
                        
                        recommendations.append(recommendation)
                        
                        if len(recommendations) >= 5:  # حد أقصى 5 توصيات كلمات مفتاحية
                            break
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات الكلمات المفتاحية: {e}")
        
        return recommendations
    
    def _detect_campaign_category(self, keywords: Set[str]) -> str:
        """تحديد فئة الحملة بناءً على الكلمات المفتاحية"""
        category_scores = {}
        
        for category, data in self.keyword_database.items():
            score = 0
            for keyword in keywords:
                for category_keyword in data['keywords']:
                    if category_keyword.lower() in keyword.lower():
                        score += 1
            category_scores[category] = score
        
        # إرجاع الفئة ذات أعلى نقاط أو فئة افتراضية
        return max(category_scores, key=category_scores.get) if category_scores else 'business'
    
    def _generate_bid_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات العروض"""
        recommendations = []
        
        try:
            current_bids = campaign_data.get('current_bids', {})
            performance = campaign_data.get('current_performance', {})
            
            for keyword, current_bid in current_bids.items():
                # محاكاة تحليل الأداء وتوصية العرض
                performance_score = np.random.uniform(0.3, 1.0)
                
                if performance_score < 0.6:  # أداء ضعيف
                    # توصية بزيادة العرض
                    recommended_bid = current_bid * np.random.uniform(1.1, 1.5)
                    change_percentage = (recommended_bid - current_bid) / current_bid * 100
                    
                    bid_rec = BidRecommendation(
                        keyword_or_adgroup=keyword,
                        current_bid=current_bid,
                        recommended_bid=recommended_bid,
                        bid_change_percentage=change_percentage,
                        expected_position_change=np.random.uniform(0.5, 2.0),
                        expected_cost_change=change_percentage,
                        expected_conversion_change=np.random.uniform(10, 30),
                        reasoning="زيادة العرض لتحسين الموضع والحصول على المزيد من النقرات"
                    )
                    
                    recommendation = RecommendationData(
                        recommendation_id=generate_unique_id(),
                        recommendation_type=RecommendationType.BID_OPTIMIZATION,
                        priority=RecommendationPriority.HIGH,
                        title=f"زيادة عرض {keyword}",
                        description=f"زيادة العرض من {current_bid:.2f} إلى {recommended_bid:.2f}",
                        impact_level=ImpactLevel.MEDIUM,
                        estimated_impact={
                            'cost_increase_percentage': change_percentage,
                            'position_improvement': bid_rec.expected_position_change,
                            'conversion_increase_percentage': bid_rec.expected_conversion_change
                        },
                        implementation_effort="سهل",
                        implementation_steps=[
                            f"تغيير عرض '{keyword}' إلى {recommended_bid:.2f}",
                            "مراقبة الأداء لمدة 3-5 أيام",
                            "تحسين إضافي حسب النتائج"
                        ],
                        expected_results={
                            'timeline': '3-7 أيام',
                            'success_probability': 0.8
                        },
                        confidence_score=0.8,
                        supporting_data=bid_rec.__dict__,
                        expiry_date=datetime.now(timezone.utc) + timedelta(days=14)
                    )
                    
                    recommendations.append(recommendation)
                    
                    if len(recommendations) >= 3:  # حد أقصى 3 توصيات عروض
                        break
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات العروض: {e}")
        
        return recommendations
    
    def _generate_ad_copy_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات نص الإعلان"""
        recommendations = []
        
        try:
            ad_copies = campaign_data.get('ad_copies', [])
            
            for i, ad_copy in enumerate(ad_copies):
                current_ctr = ad_copy.get('ctr', 0)
                
                if current_ctr < 3.0:  # CTR منخفض
                    # توليد توصيات تحسين
                    improved_headline = self._improve_headline(ad_copy.get('headline', ''))
                    improved_description = self._improve_description(ad_copy.get('description', ''))
                    
                    ad_copy_rec = AdCopyRecommendation(
                        current_headline=ad_copy.get('headline', ''),
                        recommended_headline=improved_headline,
                        current_description=ad_copy.get('description', ''),
                        recommended_description=improved_description,
                        improvement_reason="تحسين معدل النقر من خلال عناوين أكثر جاذبية",
                        expected_ctr_improvement=np.random.uniform(15, 40),
                        a_b_test_suggestion=True
                    )
                    
                    recommendation = RecommendationData(
                        recommendation_id=generate_unique_id(),
                        recommendation_type=RecommendationType.AD_COPY_IMPROVEMENT,
                        priority=RecommendationPriority.MEDIUM,
                        title=f"تحسين نص الإعلان {i+1}",
                        description="تحسين العنوان والوصف لزيادة معدل النقر",
                        impact_level=ImpactLevel.MEDIUM,
                        estimated_impact={
                            'ctr_improvement_percentage': ad_copy_rec.expected_ctr_improvement,
                            'clicks_increase_percentage': ad_copy_rec.expected_ctr_improvement * 0.8
                        },
                        implementation_effort="متوسط",
                        implementation_steps=[
                            "إنشاء نسخة محسنة من الإعلان",
                            "تشغيل اختبار A/B لمدة أسبوعين",
                            "تحليل النتائج واختيار الأفضل",
                            "تطبيق التحسينات على باقي الإعلانات"
                        ],
                        expected_results={
                            'timeline': '2-3 أسابيع',
                            'success_probability': 0.75
                        },
                        confidence_score=0.75,
                        supporting_data=ad_copy_rec.__dict__,
                        expiry_date=datetime.now(timezone.utc) + timedelta(days=21)
                    )
                    
                    recommendations.append(recommendation)
                    
                    if len(recommendations) >= 2:  # حد أقصى 2 توصيات نص إعلان
                        break
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات نص الإعلان: {e}")
        
        return recommendations
    
    def _improve_headline(self, current_headline: str) -> str:
        """تحسين عنوان الإعلان"""
        improvements = [
            "🔥 عرض خاص - ",
            "✅ الأفضل في ",
            "💯 جودة مضمونة - ",
            "⚡ سريع وموثوق - ",
            "🎯 الحل الأمثل لـ "
        ]
        
        if current_headline:
            return np.random.choice(improvements) + current_headline
        else:
            return "عنوان محسن بالذكاء الاصطناعي"
    
    def _improve_description(self, current_description: str) -> str:
        """تحسين وصف الإعلان"""
        improvements = [
            " - احصل على أفضل النتائج اليوم!",
            " - جرب الآن مجاناً!",
            " - خصم خاص لفترة محدودة!",
            " - اكتشف الفرق بنفسك!",
            " - انضم لآلاف العملاء الراضين!"
        ]
        
        if current_description:
            return current_description + np.random.choice(improvements)
        else:
            return "وصف محسن بالذكاء الاصطناعي"
    
    def _generate_audience_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات الجمهور"""
        recommendations = []
        
        try:
            current_audiences = campaign_data.get('target_audiences', [])
            
            # توصيات جماهير جديدة
            suggested_audiences = [
                {
                    'name': 'المهتمون بالتكنولوجيا',
                    'type': 'interest',
                    'size': np.random.randint(50000, 500000),
                    'criteria': {'interests': ['technology', 'innovation', 'gadgets']}
                },
                {
                    'name': 'المتسوقون عبر الإنترنت',
                    'type': 'behavior',
                    'size': np.random.randint(100000, 1000000),
                    'criteria': {'behaviors': ['online_shopping', 'frequent_buyers']}
                },
                {
                    'name': 'أصحاب الأعمال',
                    'type': 'demographic',
                    'size': np.random.randint(30000, 300000),
                    'criteria': {'job_titles': ['CEO', 'Manager', 'Director']}
                }
            ]
            
            for audience in suggested_audiences:
                if audience['name'] not in current_audiences:
                    audience_rec = AudienceRecommendation(
                        audience_type=audience['type'],
                        audience_name=audience['name'],
                        audience_size=audience['size'],
                        targeting_criteria=audience['criteria'],
                        expected_performance={
                            'ctr': np.random.uniform(2.5, 5.0),
                            'conversion_rate': np.random.uniform(3.0, 8.0),
                            'cpc': np.random.uniform(1.0, 3.0)
                        },
                        overlap_with_existing=np.random.uniform(10, 30)
                    )
                    
                    recommendation = RecommendationData(
                        recommendation_id=generate_unique_id(),
                        recommendation_type=RecommendationType.AUDIENCE_TARGETING,
                        priority=RecommendationPriority.MEDIUM,
                        title=f"استهداف جمهور: {audience['name']}",
                        description=f"جمهور جديد بحجم {audience['size']:,} مستخدم",
                        impact_level=ImpactLevel.HIGH,
                        estimated_impact={
                            'reach_increase': audience['size'],
                            'ctr_improvement': audience_rec.expected_performance['ctr'],
                            'conversion_rate': audience_rec.expected_performance['conversion_rate']
                        },
                        implementation_effort="متوسط",
                        implementation_steps=[
                            f"إنشاء جمهور جديد: {audience['name']}",
                            "تعيين معايير الاستهداف",
                            "تشغيل حملة تجريبية بميزانية محدودة",
                            "تحليل النتائج وتوسيع الاستهداف"
                        ],
                        expected_results={
                            'timeline': '1-2 أسابيع',
                            'success_probability': 0.7
                        },
                        confidence_score=0.7,
                        supporting_data=audience_rec.__dict__,
                        expiry_date=datetime.now(timezone.utc) + timedelta(days=28)
                    )
                    
                    recommendations.append(recommendation)
                    
                    if len(recommendations) >= 2:  # حد أقصى 2 توصيات جمهور
                        break
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات الجمهور: {e}")
        
        return recommendations
    
    def _generate_budget_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات الميزانية"""
        recommendations = []
        
        try:
            current_budget = campaign_data.get('budget', 0)
            performance = campaign_data.get('current_performance', {})
            
            # تحليل كفاءة الميزانية
            cost = performance.get('cost', 0)
            conversions = performance.get('conversions', 0)
            
            if conversions > 0 and cost > 0:
                current_cpa = cost / conversions
                target_cpa = campaign_data.get('goals', {}).get('target_cpa', current_cpa * 1.2)
                
                if current_cpa < target_cpa:  # الأداء جيد
                    # توصية بزيادة الميزانية
                    recommended_budget = current_budget * np.random.uniform(1.2, 1.5)
                    
                    recommendation = RecommendationData(
                        recommendation_id=generate_unique_id(),
                        recommendation_type=RecommendationType.BUDGET_ALLOCATION,
                        priority=RecommendationPriority.HIGH,
                        title="زيادة الميزانية",
                        description=f"زيادة الميزانية من {current_budget:.0f} إلى {recommended_budget:.0f}",
                        impact_level=ImpactLevel.HIGH,
                        estimated_impact={
                            'budget_increase_percentage': (recommended_budget - current_budget) / current_budget * 100,
                            'conversions_increase_percentage': np.random.uniform(20, 40),
                            'revenue_increase_percentage': np.random.uniform(25, 50)
                        },
                        implementation_effort="سهل",
                        implementation_steps=[
                            f"زيادة الميزانية اليومية إلى {recommended_budget:.0f}",
                            "مراقبة الأداء لمدة أسبوع",
                            "تحسين التوزيع حسب الأداء"
                        ],
                        expected_results={
                            'timeline': '1 أسبوع',
                            'success_probability': 0.85
                        },
                        confidence_score=0.85,
                        supporting_data={
                            'current_budget': current_budget,
                            'recommended_budget': recommended_budget,
                            'current_cpa': current_cpa,
                            'target_cpa': target_cpa
                        },
                        expiry_date=datetime.now(timezone.utc) + timedelta(days=7)
                    )
                    
                    recommendations.append(recommendation)
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات الميزانية: {e}")
        
        return recommendations
    
    def _generate_negative_keyword_recommendations(self, campaign_data: Dict[str, Any]) -> List[RecommendationData]:
        """توليد توصيات الكلمات المفتاحية السلبية"""
        recommendations = []
        
        try:
            # قائمة الكلمات السلبية المقترحة
            suggested_negative_keywords = [
                'مجاني', 'free', 'مجانا', 'بلا مقابل',
                'رخيص', 'cheap', 'وظيفة', 'job',
                'تحميل', 'download', 'كراك', 'crack'
            ]
            
            recommendation = RecommendationData(
                recommendation_id=generate_unique_id(),
                recommendation_type=RecommendationType.NEGATIVE_KEYWORDS,
                priority=RecommendationPriority.MEDIUM,
                title="إضافة كلمات مفتاحية سلبية",
                description="منع ظهور الإعلانات للبحثات غير ذات الصلة",
                impact_level=ImpactLevel.MEDIUM,
                estimated_impact={
                    'cost_reduction_percentage': np.random.uniform(10, 25),
                    'ctr_improvement_percentage': np.random.uniform(5, 15),
                    'quality_score_improvement': np.random.uniform(0.5, 1.5)
                },
                implementation_effort="سهل",
                implementation_steps=[
                    "مراجعة تقرير مصطلحات البحث",
                    "تحديد الكلمات غير ذات الصلة",
                    "إضافة الكلمات السلبية المقترحة",
                    "مراقبة التأثير على الأداء"
                ],
                expected_results={
                    'timeline': '3-5 أيام',
                    'success_probability': 0.9
                },
                confidence_score=0.9,
                supporting_data={
                    'suggested_negative_keywords': suggested_negative_keywords,
                    'expected_cost_savings': np.random.uniform(50, 200)
                },
                expiry_date=datetime.now(timezone.utc) + timedelta(days=14)
            )
            
            recommendations.append(recommendation)
        
        except Exception as e:
            logger.warning(f"خطأ في توليد توصيات الكلمات السلبية: {e}")
        
        return recommendations
    
    async def generate_recommendations(self, request: RecommendationsRequest) -> RecommendationsResponse:
        """توليد التوصيات الذكية الرئيسي"""
        start_time = time.time()
        request_id = generate_unique_id()
        
        try:
            # فحص التخزين المؤقت
            cache_key = self._generate_cache_key(request.__dict__)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                logger.info(f"تم جلب التوصيات من التخزين المؤقت: {request_id}")
                return RecommendationsResponse(**cached_result)
            
            all_recommendations = []
            
            # توليد التوصيات لكل حملة
            for campaign_id in request.campaign_ids:
                campaign_data = self._simulate_campaign_data(campaign_id)
                
                # توليد أنواع مختلفة من التوصيات
                for rec_type in request.recommendation_types:
                    if rec_type == RecommendationType.KEYWORD_EXPANSION:
                        recommendations = self._generate_keyword_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif rec_type == RecommendationType.BID_OPTIMIZATION:
                        recommendations = self._generate_bid_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif rec_type == RecommendationType.AD_COPY_IMPROVEMENT:
                        recommendations = self._generate_ad_copy_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif rec_type == RecommendationType.AUDIENCE_TARGETING:
                        recommendations = self._generate_audience_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif rec_type == RecommendationType.BUDGET_ALLOCATION:
                        recommendations = self._generate_budget_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
                    
                    elif rec_type == RecommendationType.NEGATIVE_KEYWORDS:
                        recommendations = self._generate_negative_keyword_recommendations(campaign_data)
                        all_recommendations.extend(recommendations)
            
            # فلترة حسب الأولوية إذا تم تحديدها
            if request.priority_filter:
                all_recommendations = [
                    rec for rec in all_recommendations 
                    if rec.priority == request.priority_filter
                ]
            
            # ترتيب التوصيات حسب الأولوية والثقة
            priority_order = {
                RecommendationPriority.CRITICAL: 0,
                RecommendationPriority.HIGH: 1,
                RecommendationPriority.MEDIUM: 2,
                RecommendationPriority.LOW: 3
            }
            
            all_recommendations.sort(
                key=lambda x: (priority_order[x.priority], -x.confidence_score)
            )
            
            # تحديد العدد المطلوب
            all_recommendations = all_recommendations[:request.max_recommendations]
            
            # إنشاء الملخص
            summary = self._create_recommendations_summary(all_recommendations)
            
            # إنشاء الاستجابة
            processing_time = time.time() - start_time
            response = RecommendationsResponse(
                request_id=request_id,
                total_recommendations=len(all_recommendations),
                recommendations=all_recommendations,
                summary=summary,
                processing_time=processing_time
            )
            
            # حفظ في التخزين المؤقت
            self._cache_result(cache_key, response.__dict__)
            
            # تحديث مقاييس الأداء
            self.performance_metrics['total_recommendations'] += len(all_recommendations)
            self.performance_metrics['successful_recommendations'] += 1
            
            if all_recommendations:
                avg_confidence = sum(rec.confidence_score for rec in all_recommendations) / len(all_recommendations)
                self.performance_metrics['average_confidence_score'] = avg_confidence
            
            logger.info(f"تم إكمال توليد التوصيات: {request_id} في {processing_time:.3f}s")
            return response
            
        except Exception as e:
            self.performance_metrics['failed_recommendations'] += 1
            logger.error(f"خطأ في توليد التوصيات {request_id}: {e}")
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
    
    def _create_recommendations_summary(self, recommendations: List[RecommendationData]) -> Dict[str, Any]:
        """إنشاء ملخص التوصيات"""
        if not recommendations:
            return {}
        
        # تجميع حسب النوع
        by_type = {}
        for rec in recommendations:
            rec_type = rec.recommendation_type.value
            if rec_type not in by_type:
                by_type[rec_type] = 0
            by_type[rec_type] += 1
        
        # تجميع حسب الأولوية
        by_priority = {}
        for rec in recommendations:
            priority = rec.priority.value
            if priority not in by_priority:
                by_priority[priority] = 0
            by_priority[priority] += 1
        
        # حساب متوسط الثقة
        avg_confidence = sum(rec.confidence_score for rec in recommendations) / len(recommendations)
        
        # تقدير التأثير الإجمالي
        total_estimated_impact = {
            'potential_cost_change': 0,
            'potential_conversion_increase': 0,
            'implementation_complexity': 'متوسط'
        }
        
        return {
            'total_recommendations': len(recommendations),
            'by_type': by_type,
            'by_priority': by_priority,
            'average_confidence_score': avg_confidence,
            'estimated_total_impact': total_estimated_impact,
            'high_priority_count': by_priority.get('high', 0) + by_priority.get('critical', 0),
            'quick_wins': len([rec for rec in recommendations if rec.implementation_effort == "سهل"]),
            'analysis_timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """جلب مقاييس الأداء"""
        return {
            **self.performance_metrics,
            'success_rate': (
                self.performance_metrics['successful_recommendations'] / 
                max(self.performance_metrics['total_recommendations'], 1) * 100
            ),
            'ml_available': ML_AVAILABLE,
            'redis_available': self.redis_client is not None,
            'google_ads_available': self.google_ads_client is not None
        }

# إنشاء مثيل الخدمة
recommendations_service = AIRecommendationsService()

# مساعدات التحقق من الصحة
def validate_recommendations_request(data: Dict[str, Any]) -> RecommendationsRequest:
    """التحقق من صحة طلب التوصيات"""
    if not data.get('campaign_ids'):
        raise ValueError("campaign_ids مطلوب")
    
    if not isinstance(data['campaign_ids'], list):
        raise ValueError("campaign_ids يجب أن يكون قائمة")
    
    if len(data['campaign_ids']) > 5:
        raise ValueError("عدد الحملات لا يجب أن يتجاوز 5")
    
    # تحويل أنواع التوصيات من نص إلى enum
    if 'recommendation_types' in data:
        data['recommendation_types'] = [
            RecommendationType(rec_type) for rec_type in data['recommendation_types']
        ]
    
    # تحويل فلتر الأولوية
    if 'priority_filter' in data and data['priority_filter']:
        data['priority_filter'] = RecommendationPriority(data['priority_filter'])
    
    return RecommendationsRequest(**data)

# مساعدات الأداء
def recommendations_monitor(func):
    """مراقب الأداء للتوصيات"""
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

@ai_recommendations_bp.route('/generate', methods=['POST'])
@jwt_required()
@recommendations_monitor
async def generate_recommendations():
    """توليد التوصيات الذكية"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # التحقق من صحة البيانات
        recommendations_request = validate_recommendations_request(data)
        
        # تنفيذ التوليد
        result = await recommendations_service.generate_recommendations(recommendations_request)
        
        return jsonify({
            'success': True,
            'data': {
                'request_id': result.request_id,
                'total_recommendations': result.total_recommendations,
                'recommendations': [
                    {
                        'recommendation_id': rec.recommendation_id,
                        'type': rec.recommendation_type.value,
                        'priority': rec.priority.value,
                        'title': rec.title,
                        'description': rec.description,
                        'impact_level': rec.impact_level.value,
                        'estimated_impact': rec.estimated_impact,
                        'implementation_effort': rec.implementation_effort,
                        'implementation_steps': rec.implementation_steps,
                        'expected_results': rec.expected_results,
                        'confidence_score': rec.confidence_score,
                        'expiry_date': rec.expiry_date.isoformat(),
                        'status': rec.status.value
                    }
                    for rec in result.recommendations
                ],
                'summary': result.summary,
                'processing_time': result.processing_time
            }
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"خطأ في توليد التوصيات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/keywords', methods=['POST'])
@jwt_required()
async def recommend_keywords():
    """توصيات الكلمات المفتاحية"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        all_recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = recommendations_service._simulate_campaign_data(campaign_id)
            recommendations = recommendations_service._generate_keyword_recommendations(campaign_data)
            all_recommendations.extend(recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(all_recommendations),
                'keyword_recommendations': [
                    {
                        'recommendation_id': rec.recommendation_id,
                        'title': rec.title,
                        'description': rec.description,
                        'priority': rec.priority.value,
                        'confidence_score': rec.confidence_score,
                        'keyword_data': rec.supporting_data,
                        'implementation_steps': rec.implementation_steps
                    }
                    for rec in all_recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توصيات الكلمات المفتاحية: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/bids', methods=['POST'])
@jwt_required()
async def recommend_bids():
    """توصيات العروض"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        all_recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = recommendations_service._simulate_campaign_data(campaign_id)
            recommendations = recommendations_service._generate_bid_recommendations(campaign_data)
            all_recommendations.extend(recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(all_recommendations),
                'bid_recommendations': [
                    {
                        'recommendation_id': rec.recommendation_id,
                        'title': rec.title,
                        'description': rec.description,
                        'priority': rec.priority.value,
                        'confidence_score': rec.confidence_score,
                        'bid_data': rec.supporting_data,
                        'estimated_impact': rec.estimated_impact
                    }
                    for rec in all_recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توصيات العروض: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/ad-copy', methods=['POST'])
@jwt_required()
async def recommend_ad_copy():
    """توصيات نص الإعلان"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        all_recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = recommendations_service._simulate_campaign_data(campaign_id)
            recommendations = recommendations_service._generate_ad_copy_recommendations(campaign_data)
            all_recommendations.extend(recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(all_recommendations),
                'ad_copy_recommendations': [
                    {
                        'recommendation_id': rec.recommendation_id,
                        'title': rec.title,
                        'description': rec.description,
                        'priority': rec.priority.value,
                        'confidence_score': rec.confidence_score,
                        'ad_copy_data': rec.supporting_data,
                        'implementation_steps': rec.implementation_steps
                    }
                    for rec in all_recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توصيات نص الإعلان: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/audience', methods=['POST'])
@jwt_required()
async def recommend_audience():
    """توصيات الجمهور"""
    try:
        data = request.get_json()
        campaign_ids = data.get('campaign_ids', [])
        
        if not campaign_ids:
            return jsonify({'error': 'معرفات الحملات مطلوبة'}), 400
        
        all_recommendations = []
        for campaign_id in campaign_ids:
            campaign_data = recommendations_service._simulate_campaign_data(campaign_id)
            recommendations = recommendations_service._generate_audience_recommendations(campaign_data)
            all_recommendations.extend(recommendations)
        
        return jsonify({
            'success': True,
            'data': {
                'total_recommendations': len(all_recommendations),
                'audience_recommendations': [
                    {
                        'recommendation_id': rec.recommendation_id,
                        'title': rec.title,
                        'description': rec.description,
                        'priority': rec.priority.value,
                        'confidence_score': rec.confidence_score,
                        'audience_data': rec.supporting_data,
                        'estimated_impact': rec.estimated_impact
                    }
                    for rec in all_recommendations
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توصيات الجمهور: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/metrics', methods=['GET'])
@jwt_required()
async def get_recommendations_metrics():
    """جلب مقاييس أداء التوصيات"""
    try:
        metrics = recommendations_service.get_performance_metrics()
        return jsonify({
            'success': True,
            'data': metrics
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب مقاييس التوصيات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_recommendations_bp.route('/health', methods=['GET'])
async def health_check():
    """فحص صحة خدمة التوصيات"""
    try:
        health_status = {
            'service': 'AI Recommendations',
            'status': 'healthy',
            'ml_available': ML_AVAILABLE,
            'redis_available': recommendations_service.redis_client is not None,
            'google_ads_available': recommendations_service.google_ads_client is not None,
            'performance': recommendations_service.get_performance_metrics(),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص صحة التوصيات: {e}")
        return jsonify({
            'service': 'AI Recommendations',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تصدير الكائنات المطلوبة
__all__ = ['ai_recommendations_bp', 'AIRecommendationsService', 'recommendations_service']

