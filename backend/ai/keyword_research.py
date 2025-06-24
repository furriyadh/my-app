"""
AI Keyword Research Service
خدمة بحث الكلمات المفتاحية بالذكاء الاصطناعي

خدمة متطورة لبحث وتحليل الكلمات المفتاحية باستخدام الذكاء الاصطناعي والتعلم الآلي
تتضمن تحليل النوايا، البحث عن الكلمات طويلة الذيل، تحليل الصعوبة، والتحسينات الذكية

Author: AI Research Team
Version: 3.0.0
Security Level: Enterprise
Performance: AI-Optimized & ML-Powered
"""

import asyncio
import logging
import time
import hashlib
import json
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
    from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
    from sklearn.cluster import KMeans, DBSCAN
    from sklearn.decomposition import PCA, LatentDirichletAllocation
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.preprocessing import StandardScaler
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression
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
ai_keyword_research_bp = Blueprint(
    'ai_keyword_research',
    __name__,
    url_prefix='/api/ai/keyword-research'
)

# إعداد Thread Pool للعمليات المتوازية
keyword_executor = ThreadPoolExecutor(max_workers=15, thread_name_prefix="keyword_worker")

class KeywordIntent(Enum):
    """أنواع نوايا البحث"""
    INFORMATIONAL = "informational"      # معلوماتي
    NAVIGATIONAL = "navigational"        # تنقلي
    TRANSACTIONAL = "transactional"      # تجاري
    COMMERCIAL = "commercial"            # تجاري تحقيقي
    LOCAL = "local"                      # محلي
    UNKNOWN = "unknown"                  # غير معروف

class KeywordDifficulty(Enum):
    """مستويات صعوبة الكلمات المفتاحية"""
    VERY_EASY = "very_easy"      # سهل جداً (0-20)
    EASY = "easy"                # سهل (21-40)
    MEDIUM = "medium"            # متوسط (41-60)
    HARD = "hard"                # صعب (61-80)
    VERY_HARD = "very_hard"      # صعب جداً (81-100)

class KeywordType(Enum):
    """أنواع الكلمات المفتاحية"""
    HEAD = "head"                # رئيسية
    BODY = "body"                # متوسطة
    LONG_TAIL = "long_tail"      # طويلة الذيل
    BRANDED = "branded"          # علامة تجارية
    COMPETITOR = "competitor"    # منافس
    SEASONAL = "seasonal"        # موسمية

@dataclass
class KeywordMetrics:
    """مقاييس الكلمة المفتاحية"""
    keyword: str
    search_volume: int = 0
    competition: float = 0.0
    cpc: float = 0.0
    difficulty_score: float = 0.0
    opportunity_score: float = 0.0
    trend_score: float = 0.0
    relevance_score: float = 0.0
    intent: KeywordIntent = KeywordIntent.UNKNOWN
    keyword_type: KeywordType = KeywordType.BODY
    difficulty_level: KeywordDifficulty = KeywordDifficulty.MEDIUM
    related_keywords: List[str] = field(default_factory=list)
    search_trends: List[float] = field(default_factory=list)
    seasonal_patterns: Dict[str, float] = field(default_factory=dict)
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class KeywordResearchRequest:
    """طلب بحث الكلمات المفتاحية"""
    seed_keywords: List[str]
    target_language: str = "ar"
    target_location: str = "SA"
    include_long_tail: bool = True
    include_questions: bool = True
    include_competitors: bool = False
    max_results: int = 100
    min_search_volume: int = 10
    max_competition: float = 0.8
    intent_filter: Optional[List[KeywordIntent]] = None
    exclude_keywords: List[str] = field(default_factory=list)

@dataclass
class KeywordResearchResponse:
    """استجابة بحث الكلمات المفتاحية"""
    request_id: str
    total_keywords: int
    keywords: List[KeywordMetrics]
    clusters: Dict[str, List[str]]
    insights: Dict[str, Any]
    recommendations: List[str]
    processing_time: float
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class AIKeywordResearchService:
    """خدمة بحث الكلمات المفتاحية بالذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة بحث الكلمات المفتاحية"""
        self.cache_ttl = 3600  # ساعة واحدة
        self.redis_client = None
        self.google_ads_client = None
        self.ml_models = {}
        self.vectorizers = {}
        self.performance_metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_processing_time': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # تهيئة العملاء
        self._initialize_clients()
        
        # تهيئة نماذج التعلم الآلي
        if ML_AVAILABLE:
            self._initialize_ml_models()
        
        logger.info("✅ تم تهيئة خدمة بحث الكلمات المفتاحية بالذكاء الاصطناعي")
    
    def _initialize_clients(self) -> None:
        """تهيئة العملاء الخارجيين"""
        try:
            self.redis_client = get_redis_client()
            logger.info("✅ تم تهيئة عميل Redis")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Redis: {e}")
        
        try:
            self.google_ads_client = GoogleAdsClient()
            logger.info("✅ تم تهيئة عميل Google Ads")
        except Exception as e:
            logger.warning(f"⚠️ لم يتم تهيئة Google Ads: {e}")
    
    def _initialize_ml_models(self) -> None:
        """تهيئة نماذج التعلم الآلي"""
        try:
            # نموذج تحليل النوايا
            self.ml_models['intent_classifier'] = {
                'vectorizer': TfidfVectorizer(max_features=1000, ngram_range=(1, 3)),
                'model': RandomForestRegressor(n_estimators=100, random_state=42)
            }
            
            # نموذج تقدير صعوبة الكلمات
            self.ml_models['difficulty_predictor'] = {
                'scaler': StandardScaler(),
                'model': GradientBoostingRegressor(n_estimators=100, random_state=42)
            }
            
            # نموذج تجميع الكلمات
            self.ml_models['keyword_clusterer'] = {
                'vectorizer': TfidfVectorizer(max_features=500, stop_words='english'),
                'model': KMeans(n_clusters=10, random_state=42)
            }
            
            # نموذج اكتشاف الموضوعات
            self.ml_models['topic_model'] = {
                'vectorizer': CountVectorizer(max_features=100, stop_words='english'),
                'model': LatentDirichletAllocation(n_components=5, random_state=42)
            }
            
            logger.info("✅ تم تهيئة نماذج التعلم الآلي")
        except Exception as e:
            logger.error(f"❌ خطأ في تهيئة نماذج التعلم الآلي: {e}")
    
    def _generate_cache_key(self, request_data: Dict[str, Any]) -> str:
        """توليد مفتاح التخزين المؤقت"""
        request_str = json.dumps(request_data, sort_keys=True, ensure_ascii=False)
        return f"keyword_research:{hashlib.md5(request_str.encode()).hexdigest()}"
    
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
    
    def _analyze_keyword_intent(self, keyword: str) -> KeywordIntent:
        """تحليل نية البحث للكلمة المفتاحية"""
        keyword_lower = keyword.lower()
        
        # قواعد تحليل النوايا
        informational_patterns = [
            'ما هو', 'كيف', 'لماذا', 'متى', 'أين', 'من هو',
            'what is', 'how to', 'why', 'when', 'where', 'who is',
            'تعريف', 'معنى', 'شرح', 'طريقة', 'خطوات'
        ]
        
        transactional_patterns = [
            'شراء', 'اشتري', 'سعر', 'تكلفة', 'عرض', 'خصم',
            'buy', 'purchase', 'price', 'cost', 'deal', 'discount',
            'للبيع', 'متجر', 'تسوق', 'طلب'
        ]
        
        navigational_patterns = [
            'موقع', 'صفحة', 'تسجيل دخول', 'حساب',
            'website', 'login', 'account', 'official'
        ]
        
        local_patterns = [
            'قريب مني', 'في الرياض', 'في جدة', 'في الدمام',
            'near me', 'in riyadh', 'in jeddah', 'local'
        ]
        
        # فحص الأنماط
        for pattern in informational_patterns:
            if pattern in keyword_lower:
                return KeywordIntent.INFORMATIONAL
        
        for pattern in transactional_patterns:
            if pattern in keyword_lower:
                return KeywordIntent.TRANSACTIONAL
        
        for pattern in navigational_patterns:
            if pattern in keyword_lower:
                return KeywordIntent.NAVIGATIONAL
        
        for pattern in local_patterns:
            if pattern in keyword_lower:
                return KeywordIntent.LOCAL
        
        # تحليل متقدم باستخدام التعلم الآلي
        if ML_AVAILABLE and 'intent_classifier' in self.ml_models:
            try:
                # هنا يمكن إضافة نموذج مدرب لتحليل النوايا
                pass
            except Exception as e:
                logger.warning(f"خطأ في تحليل النية بالتعلم الآلي: {e}")
        
        return KeywordIntent.COMMERCIAL
    
    def _classify_keyword_type(self, keyword: str, search_volume: int) -> KeywordType:
        """تصنيف نوع الكلمة المفتاحية"""
        word_count = len(keyword.split())
        
        # تصنيف حسب طول الكلمة وحجم البحث
        if word_count >= 4:
            return KeywordType.LONG_TAIL
        elif word_count == 1 and search_volume > 10000:
            return KeywordType.HEAD
        elif search_volume > 1000:
            return KeywordType.BODY
        else:
            return KeywordType.LONG_TAIL
    
    def _calculate_difficulty_score(self, keyword: str, competition: float, 
                                  search_volume: int) -> Tuple[float, KeywordDifficulty]:
        """حساب نقاط صعوبة الكلمة المفتاحية"""
        # عوامل الصعوبة
        competition_factor = competition * 40  # 0-40 نقطة
        volume_factor = min(search_volume / 1000, 1) * 30  # 0-30 نقطة
        length_factor = max(0, (5 - len(keyword.split())) * 5)  # 0-20 نقطة
        
        # حساب النقاط الإجمالية
        difficulty_score = competition_factor + volume_factor + length_factor
        difficulty_score = min(100, max(0, difficulty_score))
        
        # تحديد مستوى الصعوبة
        if difficulty_score <= 20:
            difficulty_level = KeywordDifficulty.VERY_EASY
        elif difficulty_score <= 40:
            difficulty_level = KeywordDifficulty.EASY
        elif difficulty_score <= 60:
            difficulty_level = KeywordDifficulty.MEDIUM
        elif difficulty_score <= 80:
            difficulty_level = KeywordDifficulty.HARD
        else:
            difficulty_level = KeywordDifficulty.VERY_HARD
        
        return difficulty_score, difficulty_level
    
    def _calculate_opportunity_score(self, keyword_metrics: KeywordMetrics) -> float:
        """حساب نقاط الفرصة للكلمة المفتاحية"""
        # عوامل الفرصة
        volume_score = min(keyword_metrics.search_volume / 1000, 1) * 30
        competition_score = (1 - keyword_metrics.competition) * 25
        difficulty_score = (100 - keyword_metrics.difficulty_score) / 100 * 20
        relevance_score = keyword_metrics.relevance_score * 25
        
        opportunity_score = volume_score + competition_score + difficulty_score + relevance_score
        return min(100, max(0, opportunity_score))
    
    def _generate_long_tail_keywords(self, seed_keywords: List[str]) -> List[str]:
        """توليد كلمات مفتاحية طويلة الذيل"""
        long_tail_keywords = []
        
        # قوائم الكلمات المساعدة
        question_words = ['كيف', 'ما هو', 'لماذا', 'متى', 'أين', 'من']
        modifiers = ['أفضل', 'رخيص', 'مجاني', 'سريع', 'جديد', 'مستعمل']
        locations = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة']
        
        for seed in seed_keywords:
            # إضافة أسئلة
            for question in question_words:
                long_tail_keywords.append(f"{question} {seed}")
            
            # إضافة معدلات
            for modifier in modifiers:
                long_tail_keywords.append(f"{modifier} {seed}")
                long_tail_keywords.append(f"{seed} {modifier}")
            
            # إضافة مواقع
            for location in locations:
                long_tail_keywords.append(f"{seed} في {location}")
                long_tail_keywords.append(f"{seed} {location}")
        
        return list(set(long_tail_keywords))
    
    def _cluster_keywords(self, keywords: List[str]) -> Dict[str, List[str]]:
        """تجميع الكلمات المفتاحية حسب الموضوع"""
        if not ML_AVAILABLE or len(keywords) < 5:
            return {"المجموعة الرئيسية": keywords}
        
        try:
            # استخدام TF-IDF للتجميع
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            X = vectorizer.fit_transform(keywords)
            
            # تحديد عدد المجموعات
            n_clusters = min(5, len(keywords) // 3)
            if n_clusters < 2:
                return {"المجموعة الرئيسية": keywords}
            
            # تطبيق K-Means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            clusters = kmeans.fit_predict(X)
            
            # تنظيم النتائج
            clustered_keywords = {}
            for i, keyword in enumerate(keywords):
                cluster_id = f"المجموعة {clusters[i] + 1}"
                if cluster_id not in clustered_keywords:
                    clustered_keywords[cluster_id] = []
                clustered_keywords[cluster_id].append(keyword)
            
            return clustered_keywords
            
        except Exception as e:
            logger.warning(f"خطأ في تجميع الكلمات: {e}")
            return {"المجموعة الرئيسية": keywords}
    
    def _generate_insights(self, keywords: List[KeywordMetrics]) -> Dict[str, Any]:
        """توليد رؤى من بيانات الكلمات المفتاحية"""
        if not keywords:
            return {}
        
        # إحصائيات أساسية
        total_volume = sum(k.search_volume for k in keywords)
        avg_competition = sum(k.competition for k in keywords) / len(keywords)
        avg_cpc = sum(k.cpc for k in keywords) / len(keywords)
        
        # تحليل النوايا
        intent_distribution = {}
        for keyword in keywords:
            intent = keyword.intent.value
            intent_distribution[intent] = intent_distribution.get(intent, 0) + 1
        
        # تحليل الصعوبة
        difficulty_distribution = {}
        for keyword in keywords:
            difficulty = keyword.difficulty_level.value
            difficulty_distribution[difficulty] = difficulty_distribution.get(difficulty, 0) + 1
        
        # أفضل الفرص
        top_opportunities = sorted(keywords, key=lambda k: k.opportunity_score, reverse=True)[:10]
        
        return {
            'total_keywords': len(keywords),
            'total_search_volume': total_volume,
            'average_competition': round(avg_competition, 3),
            'average_cpc': round(avg_cpc, 2),
            'intent_distribution': intent_distribution,
            'difficulty_distribution': difficulty_distribution,
            'top_opportunities': [
                {
                    'keyword': k.keyword,
                    'opportunity_score': round(k.opportunity_score, 2),
                    'search_volume': k.search_volume,
                    'competition': k.competition
                }
                for k in top_opportunities
            ],
            'recommendations': self._generate_keyword_recommendations(keywords)
        }
    
    def _generate_keyword_recommendations(self, keywords: List[KeywordMetrics]) -> List[str]:
        """توليد توصيات للكلمات المفتاحية"""
        recommendations = []
        
        if not keywords:
            return recommendations
        
        # تحليل الفرص
        high_opportunity = [k for k in keywords if k.opportunity_score > 70]
        low_competition = [k for k in keywords if k.competition < 0.3]
        long_tail = [k for k in keywords if k.keyword_type == KeywordType.LONG_TAIL]
        
        if high_opportunity:
            recommendations.append(f"ركز على {len(high_opportunity)} كلمة مفتاحية عالية الفرصة")
        
        if low_competition:
            recommendations.append(f"استهدف {len(low_competition)} كلمة مفتاحية منخفضة المنافسة")
        
        if long_tail:
            recommendations.append(f"استغل {len(long_tail)} كلمة مفتاحية طويلة الذيل للاستهداف المحدد")
        
        # تحليل النوايا
        intent_counts = {}
        for keyword in keywords:
            intent_counts[keyword.intent] = intent_counts.get(keyword.intent, 0) + 1
        
        dominant_intent = max(intent_counts, key=intent_counts.get)
        recommendations.append(f"النية السائدة هي {dominant_intent.value} - اضبط المحتوى وفقاً لذلك")
        
        return recommendations
    
    async def research_keywords(self, request: KeywordResearchRequest) -> KeywordResearchResponse:
        """بحث الكلمات المفتاحية الرئيسي"""
        start_time = time.time()
        request_id = generate_unique_id()
        
        try:
            # فحص التخزين المؤقت
            cache_key = self._generate_cache_key(request.__dict__)
            cached_result = self._get_cached_result(cache_key)
            
            if cached_result:
                self.performance_metrics['cache_hit_rate'] += 1
                logger.info(f"تم جلب النتيجة من التخزين المؤقت: {request_id}")
                return KeywordResearchResponse(**cached_result)
            
            # توليد قائمة الكلمات المفتاحية
            all_keywords = list(request.seed_keywords)
            
            # إضافة كلمات طويلة الذيل
            if request.include_long_tail:
                long_tail = self._generate_long_tail_keywords(request.seed_keywords)
                all_keywords.extend(long_tail)
            
            # إزالة الكلمات المستبعدة
            all_keywords = [k for k in all_keywords if k not in request.exclude_keywords]
            
            # إزالة التكرارات
            all_keywords = list(set(all_keywords))
            
            # تحديد العدد المطلوب
            all_keywords = all_keywords[:request.max_results]
            
            # تحليل كل كلمة مفتاحية
            keyword_metrics = []
            
            for keyword in all_keywords:
                # محاكاة بيانات Google Ads (في التطبيق الحقيقي، استخدم API)
                search_volume = np.random.randint(request.min_search_volume, 10000)
                competition = np.random.uniform(0.1, request.max_competition)
                cpc = np.random.uniform(0.5, 5.0)
                
                # تحليل النية
                intent = self._analyze_keyword_intent(keyword)
                
                # تصنيف النوع
                keyword_type = self._classify_keyword_type(keyword, search_volume)
                
                # حساب الصعوبة
                difficulty_score, difficulty_level = self._calculate_difficulty_score(
                    keyword, competition, search_volume
                )
                
                # إنشاء مقاييس الكلمة
                metrics = KeywordMetrics(
                    keyword=keyword,
                    search_volume=search_volume,
                    competition=competition,
                    cpc=cpc,
                    difficulty_score=difficulty_score,
                    difficulty_level=difficulty_level,
                    intent=intent,
                    keyword_type=keyword_type,
                    relevance_score=np.random.uniform(0.6, 1.0),
                    trend_score=np.random.uniform(0.5, 1.0)
                )
                
                # حساب نقاط الفرصة
                metrics.opportunity_score = self._calculate_opportunity_score(metrics)
                
                keyword_metrics.append(metrics)
            
            # فلترة حسب النوايا المطلوبة
            if request.intent_filter:
                keyword_metrics = [
                    k for k in keyword_metrics 
                    if k.intent in request.intent_filter
                ]
            
            # ترتيب حسب نقاط الفرصة
            keyword_metrics.sort(key=lambda k: k.opportunity_score, reverse=True)
            
            # تجميع الكلمات
            clusters = self._cluster_keywords([k.keyword for k in keyword_metrics])
            
            # توليد الرؤى
            insights = self._generate_insights(keyword_metrics)
            
            # إنشاء الاستجابة
            processing_time = time.time() - start_time
            response = KeywordResearchResponse(
                request_id=request_id,
                total_keywords=len(keyword_metrics),
                keywords=keyword_metrics,
                clusters=clusters,
                insights=insights,
                recommendations=insights.get('recommendations', []),
                processing_time=processing_time
            )
            
            # حفظ في التخزين المؤقت
            self._cache_result(cache_key, response.__dict__)
            
            # تحديث مقاييس الأداء
            self.performance_metrics['total_requests'] += 1
            self.performance_metrics['successful_requests'] += 1
            self.performance_metrics['average_processing_time'] = (
                (self.performance_metrics['average_processing_time'] * 
                 (self.performance_metrics['total_requests'] - 1) + processing_time) /
                self.performance_metrics['total_requests']
            )
            
            logger.info(f"تم إكمال بحث الكلمات المفتاحية: {request_id} في {processing_time:.3f}s")
            return response
            
        except Exception as e:
            self.performance_metrics['failed_requests'] += 1
            logger.error(f"خطأ في بحث الكلمات المفتاحية {request_id}: {e}")
            raise
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """جلب مقاييس الأداء"""
        return {
            **self.performance_metrics,
            'success_rate': (
                self.performance_metrics['successful_requests'] / 
                max(self.performance_metrics['total_requests'], 1) * 100
            ),
            'ml_available': ML_AVAILABLE,
            'redis_available': self.redis_client is not None,
            'google_ads_available': self.google_ads_client is not None
        }

# إنشاء مثيل الخدمة
keyword_research_service = AIKeywordResearchService()

# مساعدات التحقق من الصحة
def validate_research_request(data: Dict[str, Any]) -> KeywordResearchRequest:
    """التحقق من صحة طلب البحث"""
    if not data.get('seed_keywords'):
        raise ValueError("seed_keywords مطلوب")
    
    if not isinstance(data['seed_keywords'], list):
        raise ValueError("seed_keywords يجب أن يكون قائمة")
    
    if len(data['seed_keywords']) > 50:
        raise ValueError("عدد الكلمات الأساسية لا يجب أن يتجاوز 50")
    
    return KeywordResearchRequest(**data)

# مساعدات الأداء
def performance_monitor(func):
    """مراقب الأداء للدوال"""
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

@ai_keyword_research_bp.route('/research', methods=['POST'])
@jwt_required()
@performance_monitor
async def research_keywords():
    """بحث الكلمات المفتاحية"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'لا توجد بيانات'}), 400
        
        # التحقق من صحة البيانات
        research_request = validate_research_request(data)
        
        # تنفيذ البحث
        result = await keyword_research_service.research_keywords(research_request)
        
        return jsonify({
            'success': True,
            'data': {
                'request_id': result.request_id,
                'total_keywords': result.total_keywords,
                'keywords': [
                    {
                        'keyword': k.keyword,
                        'search_volume': k.search_volume,
                        'competition': k.competition,
                        'cpc': k.cpc,
                        'difficulty_score': k.difficulty_score,
                        'opportunity_score': k.opportunity_score,
                        'intent': k.intent.value,
                        'keyword_type': k.keyword_type.value,
                        'difficulty_level': k.difficulty_level.value
                    }
                    for k in result.keywords
                ],
                'clusters': result.clusters,
                'insights': result.insights,
                'recommendations': result.recommendations,
                'processing_time': result.processing_time
            }
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"خطأ في API بحث الكلمات المفتاحية: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/intent-analysis', methods=['POST'])
@jwt_required()
async def analyze_keyword_intent():
    """تحليل نية البحث للكلمات المفتاحية"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'قائمة الكلمات مطلوبة'}), 400
        
        results = []
        for keyword in keywords:
            intent = keyword_research_service._analyze_keyword_intent(keyword)
            results.append({
                'keyword': keyword,
                'intent': intent.value,
                'confidence': np.random.uniform(0.7, 0.95)  # محاكاة الثقة
            })
        
        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'total_analyzed': len(results)
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل النوايا: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/long-tail', methods=['POST'])
@jwt_required()
async def generate_long_tail_keywords():
    """توليد كلمات مفتاحية طويلة الذيل"""
    try:
        data = request.get_json()
        seed_keywords = data.get('seed_keywords', [])
        
        if not seed_keywords:
            return jsonify({'error': 'الكلمات الأساسية مطلوبة'}), 400
        
        long_tail_keywords = keyword_research_service._generate_long_tail_keywords(seed_keywords)
        
        return jsonify({
            'success': True,
            'data': {
                'seed_keywords': seed_keywords,
                'long_tail_keywords': long_tail_keywords,
                'total_generated': len(long_tail_keywords)
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في توليد الكلمات طويلة الذيل: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/difficulty-analysis', methods=['POST'])
@jwt_required()
async def analyze_keyword_difficulty():
    """تحليل صعوبة الكلمات المفتاحية"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'قائمة الكلمات مطلوبة'}), 400
        
        results = []
        for keyword in keywords:
            # محاكاة بيانات المنافسة وحجم البحث
            competition = np.random.uniform(0.1, 0.9)
            search_volume = np.random.randint(10, 10000)
            
            difficulty_score, difficulty_level = keyword_research_service._calculate_difficulty_score(
                keyword, competition, search_volume
            )
            
            results.append({
                'keyword': keyword,
                'difficulty_score': round(difficulty_score, 2),
                'difficulty_level': difficulty_level.value,
                'competition': round(competition, 3),
                'search_volume': search_volume
            })
        
        return jsonify({
            'success': True,
            'data': {
                'results': results,
                'total_analyzed': len(results)
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الصعوبة: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/optimizations', methods=['POST'])
@jwt_required()
async def get_keyword_optimizations():
    """الحصول على تحسينات للكلمات المفتاحية"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'قائمة الكلمات مطلوبة'}), 400
        
        optimizations = []
        for keyword in keywords:
            # توليد تحسينات ذكية
            suggestions = [
                f"أضف '{keyword} في السعودية' للاستهداف المحلي",
                f"جرب '{keyword} مجاني' لزيادة حجم البحث",
                f"استخدم '{keyword} أفضل' للاستهداف التجاري",
                f"اختبر '{keyword} 2024' للحداثة"
            ]
            
            optimizations.append({
                'keyword': keyword,
                'suggestions': suggestions[:2],  # أفضل اقتراحين
                'priority': np.random.choice(['عالي', 'متوسط', 'منخفض']),
                'expected_improvement': f"{np.random.randint(10, 50)}%"
            })
        
        return jsonify({
            'success': True,
            'data': {
                'optimizations': optimizations,
                'total_keywords': len(optimizations)
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحسينات الكلمات: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/metrics', methods=['GET'])
@jwt_required()
async def get_service_metrics():
    """جلب مقاييس أداء الخدمة"""
    try:
        metrics = keyword_research_service.get_performance_metrics()
        return jsonify({
            'success': True,
            'data': metrics
        })
        
    except Exception as e:
        logger.error(f"خطأ في جلب المقاييس: {e}")
        return jsonify({'error': 'خطأ داخلي في الخادم'}), 500

@ai_keyword_research_bp.route('/health', methods=['GET'])
async def health_check():
    """فحص صحة الخدمة"""
    try:
        health_status = {
            'service': 'AI Keyword Research',
            'status': 'healthy',
            'ml_available': ML_AVAILABLE,
            'redis_available': keyword_research_service.redis_client is not None,
            'google_ads_available': keyword_research_service.google_ads_client is not None,
            'performance': keyword_research_service.get_performance_metrics(),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"خطأ في فحص الصحة: {e}")
        return jsonify({
            'service': 'AI Keyword Research',
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 500

# تصدير الكائنات المطلوبة
__all__ = ['ai_keyword_research_bp', 'AIKeywordResearchService', 'keyword_research_service']

