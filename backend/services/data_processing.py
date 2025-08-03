"""
Data Processing Module
وحدة معالجة البيانات المتقدمة

يوفر معالجة شاملة ومتقدمة لبيانات Google Ads بما في ذلك:
- تنظيف وتحويل البيانات
- تجميع وتحليل البيانات
- حساب المقاييس والإحصائيات
- معالجة البيانات الزمنية
- تحليل الاتجاهات والأنماط
- كشف الشذوذ والقيم الشاذة
- تحليل الأداء والمقارنات
- تصدير البيانات بتنسيقات متعددة

Author: Google Ads AI Platform Team
Version: 2.3.0
Security Level: Enterprise
Performance: High-Performance Data Processing
"""

import os
import asyncio
import json
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from collections import defaultdict, Counter, deque
import hashlib
import uuid
import pickle
import gzip
import logging
import math
import statistics
from pathlib import Path

# Data processing imports
# Scientific computing
try:
    import scipy.stats as stats
    SCIPY_STATS_AVAILABLE = True
except ImportError:
    SCIPY_STATS_AVAILABLE = False
    # Fallback for stats functions
    class MockStats:
        @staticmethod
        def pearsonr(x, y): return (0.0, 1.0)
        @staticmethod
        def spearmanr(x, y): return (0.0, 1.0)
        @staticmethod
        def normaltest(x): return (0.0, 1.0)
    stats = MockStats()

# Core scipy
try:
    import scipy
    from scipy import signal
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    # Fallback for scipy functions
    class MockScipy:
        class signal:
            @staticmethod
            def find_peaks(x, **kwargs): return ([], {})
            @staticmethod
            def savgol_filter(x, window, polyorder): return x
    scipy = MockScipy()
    signal = MockScipy.signal

# Interpolation
try:
    import scipy.interpolate
    SCIPY_INTERPOLATE_AVAILABLE = True
except ImportError:
    SCIPY_INTERPOLATE_AVAILABLE = False
    # Fallback for interpolation
    class MockInterpolate:
        @staticmethod
        def interp1d(x, y, **kwargs):
            def interpolator(new_x): return y[0] if len(y) > 0 else 0
            return interpolator
    scipy.interpolate = MockInterpolate()

# Advanced analytics
try:
    from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans, DBSCAN
    from sklearn.ensemble import IsolationForest
    from sklearn.metrics import silhouette_score
    from sklearn.linear_model import LinearRegression
    ML_AVAILABLE = True
    SKLEARN_PREPROCESSING_AVAILABLE = True
    SKLEARN_CLUSTER_AVAILABLE = True
    SKLEARN_LINEAR_MODEL_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    SKLEARN_PREPROCESSING_AVAILABLE = False
    SKLEARN_CLUSTER_AVAILABLE = False
    SKLEARN_LINEAR_MODEL_AVAILABLE = False
    
    # Fallback classes
    class MockStandardScaler:
        def fit(self, X): return self
        def transform(self, X): return X
        def fit_transform(self, X): return X
    
    class MockMinMaxScaler:
        def fit(self, X): return self
        def transform(self, X): return X
        def fit_transform(self, X): return X
    
    class MockRobustScaler:
        def fit(self, X): return self
        def transform(self, X): return X
        def fit_transform(self, X): return X
    
    class MockPCA:
        def __init__(self, n_components=2): pass
        def fit(self, X): return self
        def transform(self, X): return X[:, :2] if len(X[0]) >= 2 else X
        def fit_transform(self, X): return X[:, :2] if len(X[0]) >= 2 else X
    
    class MockKMeans:
        def __init__(self, n_clusters=3, **kwargs): 
            self.n_clusters = n_clusters
            self.labels_ = None
        def fit(self, X): 
            self.labels_ = [0] * len(X)
            return self
        def predict(self, X): return [0] * len(X)
        def fit_predict(self, X): 
            self.labels_ = [0] * len(X)
            return self.labels_
    
    class MockDBSCAN:
        def __init__(self, **kwargs): 
            self.labels_ = None
        def fit(self, X): 
            self.labels_ = [0] * len(X)
            return self
        def fit_predict(self, X): 
            self.labels_ = [0] * len(X)
            return self.labels_
    
    class MockIsolationForest:
        def fit(self, X): return self
        def predict(self, X): return [1] * len(X)
        def decision_function(self, X): return [0.0] * len(X)
    
    class MockLinearRegression:
        def __init__(self):
            self.coef_ = [0.0]
            self.intercept_ = 0.0
        def fit(self, X, y): return self
        def predict(self, X): return [0.0] * len(X)
        def score(self, X, y): return 0.5
    
    # Assign mock classes
    StandardScaler = MockStandardScaler
    MinMaxScaler = MockMinMaxScaler
    RobustScaler = MockRobustScaler
    PCA = MockPCA
    KMeans = MockKMeans
    DBSCAN = MockDBSCAN
    IsolationForest = MockIsolationForest
    LinearRegression = MockLinearRegression
    
    # Mock functions
    def silhouette_score(X, labels): return 0.5

# Time series analysis
# Statsmodels imports with fallback
STATSMODELS_AVAILABLE = False
seasonal_decompose = None
adfuller = None
ARIMA = None

try:
    from statsmodels.tsa.seasonal import seasonal_decompose  # type: ignore
    STATSMODELS_SEASONAL_AVAILABLE = True
except ImportError:
    STATSMODELS_SEASONAL_AVAILABLE = False

try:
    from statsmodels.tsa.stattools import adfuller  # type: ignore
    STATSMODELS_STATTOOLS_AVAILABLE = True
except ImportError:
    STATSMODELS_STATTOOLS_AVAILABLE = False

try:
    from statsmodels.tsa.arima.model import ARIMA  # type: ignore
    STATSMODELS_ARIMA_AVAILABLE = True
except ImportError:
    STATSMODELS_ARIMA_AVAILABLE = False

# Set overall availability
STATSMODELS_AVAILABLE = (STATSMODELS_SEASONAL_AVAILABLE and 
                         STATSMODELS_STATTOOLS_AVAILABLE and 
                         STATSMODELS_ARIMA_AVAILABLE)

# Fallback classes for statsmodels
if not STATSMODELS_AVAILABLE:
    class MockSeasonalDecompose:
        def __init__(self, data, **kwargs):
            self.trend = data
            self.seasonal = [0] * len(data)
            self.resid = [0] * len(data)
    
    class MockARIMA:
        def __init__(self, data, order=(1,1,1)): pass
        def fit(self): return self
        def forecast(self, steps=1): return [0.0] * steps
    
    # Set fallback functions
    if not STATSMODELS_SEASONAL_AVAILABLE:
        seasonal_decompose = MockSeasonalDecompose
    if not STATSMODELS_STATTOOLS_AVAILABLE:
        def adfuller(data): return (0.0, 0.5, 0, 0, {}, 0.0)
    if not STATSMODELS_ARIMA_AVAILABLE:
        ARIMA = MockARIMA

# Local imports
try:
    from backend.utils.helpers import (
        generate_unique_id, sanitize_text, calculate_hash,
        format_timestamp, compress_data, decompress_data
    )
    HELPERS_AVAILABLE = True
except ImportError:
    HELPERS_AVAILABLE = False
    
    # Fallback functions for helpers
    import uuid
    import hashlib
    import re
    import gzip
    import base64
    from datetime import datetime
    
    def generate_unique_id(): 
        return str(uuid.uuid4())
    
    def sanitize_text(text): 
        return re.sub(r'[^\w\s-]', '', str(text))
    
    def calculate_hash(data): 
        return hashlib.md5(str(data).encode()).hexdigest()
    
    def format_timestamp(dt=None): 
        if dt is None: dt = datetime.now()
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    
    def compress_data(data):
        try:
            if isinstance(data, dict):
                import json
                data = json.dumps(data)
            elif not isinstance(data, (str, bytes)):
                data = str(data)
            
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            compressed = gzip.compress(data)
            return base64.b64encode(compressed).decode('utf-8')
        except Exception:
            return str(data)
    
    def decompress_data(compressed_data):
        try:
            data = base64.b64decode(compressed_data.encode('utf-8'))
            decompressed = gzip.decompress(data)
            return decompressed.decode('utf-8')
        except Exception:
            return compressed_data

# Redis configuration

try:
    from backend.utils.redis_config import cache_set, cache_get, cache_delete
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    
    # Fallback cache functions
    _local_cache = {}
    
    def cache_set(key, value, timeout=3600):
        _local_cache[key] = value
        return True
    
    def cache_get(key):
        return _local_cache.get(key)
    
    def cache_delete(key):
        return _local_cache.pop(key, None) is not None

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إعداد Thread Pool للمعالجة المتوازية
processing_executor = ThreadPoolExecutor(max_workers=20, thread_name_prefix="data_worker")

class DataType(Enum):
    """أنواع البيانات"""
    CAMPAIGN_DATA = "campaign_data"
    AD_GROUP_DATA = "ad_group_data"
    KEYWORD_DATA = "keyword_data"
    AD_DATA = "ad_data"
    PERFORMANCE_DATA = "performance_data"
    CONVERSION_DATA = "conversion_data"
    AUDIENCE_DATA = "audience_data"
    DEMOGRAPHIC_DATA = "demographic_data"
    GEOGRAPHIC_DATA = "geographic_data"
    DEVICE_DATA = "device_data"
    TIME_SERIES_DATA = "time_series_data"

class ProcessingType(Enum):
    """أنواع المعالجة"""
    CLEANING = "cleaning"
    TRANSFORMATION = "transformation"
    AGGREGATION = "aggregation"
    ANALYSIS = "analysis"
    ANOMALY_DETECTION = "anomaly_detection"
    TREND_ANALYSIS = "trend_analysis"
    SEGMENTATION = "segmentation"
    CORRELATION = "correlation"
    FORECASTING = "forecasting"

class AggregationType(Enum):
    """أنواع التجميع"""
    SUM = "sum"
    MEAN = "mean"
    MEDIAN = "median"
    COUNT = "count"
    MIN = "min"
    MAX = "max"
    STD = "std"
    VAR = "var"
    PERCENTILE = "percentile"

class TimeGranularity(Enum):
    """دقة الوقت"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

@dataclass
class ProcessingConfig:
    """إعدادات المعالجة"""
    processing_id: str
    data_type: DataType
    processing_type: ProcessingType
    source_data: Dict[str, Any]
    parameters: Dict[str, Any] = field(default_factory=dict)
    filters: Dict[str, Any] = field(default_factory=dict)
    aggregation_rules: Dict[str, Any] = field(default_factory=dict)
    time_range: Optional[Tuple[datetime, datetime]] = None
    granularity: TimeGranularity = TimeGranularity.DAILY
    include_metadata: bool = True
    enable_caching: bool = True
    parallel_processing: bool = True
    quality_checks: bool = True

@dataclass
class ProcessingResult:
    """نتيجة المعالجة"""
    processing_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    processed_data: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    statistics: Dict[str, Any] = field(default_factory=dict)
    quality_metrics: Dict[str, Any] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    execution_time_seconds: float = 0.0
    records_processed: int = 0
    records_filtered: int = 0

@dataclass
class DataQualityMetrics:
    """مقاييس جودة البيانات"""
    completeness: float = 0.0
    accuracy: float = 0.0
    consistency: float = 0.0
    validity: float = 0.0
    uniqueness: float = 0.0
    timeliness: float = 0.0
    overall_score: float = 0.0
    issues_found: List[str] = field(default_factory=list)

class DataProcessor:
    """معالج البيانات الرئيسي"""
    
    def __init__(self):
        """تهيئة معالج البيانات"""
        self.processing_cache = {}
        self.processing_history = []
        self.data_schemas = {}
        self.quality_rules = {}
        
        # إعداد معالجات البيانات
        self._initialize_processors()
        
        # إعداد قواعد الجودة
        self._initialize_quality_rules()
    
    def _initialize_processors(self):
        """تهيئة معالجات البيانات"""
        try:
            self.processors = {
                ProcessingType.CLEANING: self._clean_data,
                ProcessingType.TRANSFORMATION: self._transform_data,
                ProcessingType.AGGREGATION: self._aggregate_data,
                ProcessingType.ANALYSIS: self._analyze_data,
                ProcessingType.ANOMALY_DETECTION: self._detect_anomalies,
                ProcessingType.TREND_ANALYSIS: self._analyze_trends,
                ProcessingType.SEGMENTATION: self._segment_data,
                ProcessingType.CORRELATION: self._analyze_correlations,
                ProcessingType.FORECASTING: self._forecast_trends
            }
            
            logger.info("✅ تم تهيئة معالجات البيانات")
            
        except Exception as e:
            logger.error(f"خطأ في تهيئة معالجات البيانات: {e}")
    
    def _initialize_quality_rules(self):
        """تهيئة قواعد الجودة"""
        try:
            self.quality_rules = {
                'required_fields': {
                    DataType.CAMPAIGN_DATA: ['campaign_id', 'campaign_name', 'status'],
                    DataType.PERFORMANCE_DATA: ['date', 'impressions', 'clicks', 'cost'],
                    DataType.KEYWORD_DATA: ['keyword', 'match_type', 'bid']
                },
                'data_types': {
                    'impressions': int,
                    'clicks': int,
                    'cost': float,
                    'conversions': int,
                    'date': str
                },
                'value_ranges': {
                    'ctr': (0.0, 1.0),
                    'conversion_rate': (0.0, 1.0),
                    'quality_score': (1, 10),
                    'impression_share': (0.0, 1.0)
                }
            }
            
            logger.info("✅ تم تهيئة قواعد الجودة")
            
        except Exception as e:
            logger.error(f"خطأ في تهيئة قواعد الجودة: {e}")
    
    async def process_data(self, config: ProcessingConfig) -> ProcessingResult:
        """معالجة البيانات"""
        try:
            # إنشاء نتيجة المعالجة
            result = ProcessingResult(
                processing_id=config.processing_id,
                status="running",
                start_time=datetime.now(timezone.utc)
            )
            
            # فحص الكاش
            if config.enable_caching:
                cached_result = await self._get_cached_result(config)
                if cached_result:
                    logger.info(f"🎯 استخدام النتيجة المحفوظة للمعالجة {config.processing_id}")
                    return cached_result
            
            # فحص جودة البيانات
            if config.quality_checks:
                quality_metrics = await self._check_data_quality(config.source_data, config.data_type)
                result.quality_metrics = asdict(quality_metrics)
                
                if quality_metrics.overall_score < 0.7:
                    result.warnings.append(f"جودة البيانات منخفضة: {quality_metrics.overall_score:.2f}")
            
            # تطبيق المرشحات
            filtered_data = await self._apply_filters(config.source_data, config.filters)
            result.records_filtered = len(config.source_data) - len(filtered_data) if isinstance(filtered_data, list) else 0
            
            # اختيار المعالج المناسب
            processor = self.processors.get(config.processing_type)
            if not processor:
                raise ValueError(f"نوع المعالجة غير مدعوم: {config.processing_type}")
            
            # تنفيذ المعالجة
            if config.parallel_processing and len(filtered_data) > 1000:
                processed_data = await self._process_parallel(processor, filtered_data, config)
            else:
                processed_data = await processor(filtered_data, config)
            
            # حساب الإحصائيات
            statistics = await self._calculate_statistics(processed_data, config)
            
            # تحديث النتيجة
            result.status = "completed"
            result.end_time = datetime.now(timezone.utc)
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.processed_data = processed_data
            result.statistics = statistics
            result.records_processed = len(processed_data) if isinstance(processed_data, list) else 1
            
            # حفظ في الكاش
            if config.enable_caching:
                await self._cache_result(config, result)
            
            # حفظ في التاريخ
            self.processing_history.append(result)
            
            logger.info(f"✅ انتهت معالجة البيانات {config.processing_id} - {result.records_processed} سجل")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في معالجة البيانات: {e}")
            result.status = "failed"
            result.errors.append(str(e))
            return result
    
    async def _clean_data(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تنظيف البيانات"""
        try:
            if isinstance(data, list):
                cleaned_data = []
                for record in data:
                    cleaned_record = await self._clean_record(record, config)
                    if cleaned_record:
                        cleaned_data.append(cleaned_record)
                return {"records": cleaned_data}
            
            elif isinstance(data, dict):
                return {"record": await self._clean_record(data, config)}
            
            else:
                return {"data": data}
                
        except Exception as e:
            logger.error(f"خطأ في تنظيف البيانات: {e}")
            return {"error": str(e)}
    
    async def _clean_record(self, record: Dict[str, Any], config: ProcessingConfig) -> Optional[Dict[str, Any]]:
        """تنظيف سجل واحد"""
        try:
            cleaned = {}
            
            for key, value in record.items():
                # إزالة القيم الفارغة
                if value is None or value == "" or value == "null":
                    if key in config.parameters.get('required_fields', []):
                        return None  # تجاهل السجل إذا كان حقل مطلوب فارغ
                    continue
                
                # تنظيف النصوص
                if isinstance(value, str):
                    value = value.strip()
                    if HELPERS_AVAILABLE:
                        value = sanitize_text(value)
                
                # تحويل الأرقام
                elif isinstance(value, (int, float)):
                    if math.isnan(value) or math.isinf(value):
                        continue
                    
                    # فحص النطاقات
                    if key in self.quality_rules.get('value_ranges', {}):
                        min_val, max_val = self.quality_rules['value_ranges'][key]
                        if not (min_val <= value <= max_val):
                            continue
                
                # تحويل التواريخ
                elif key in ['date', 'timestamp', 'created_at', 'updated_at']:
                    if isinstance(value, str):
                        try:
                            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except:
                            continue
                
                cleaned[key] = value
            
            return cleaned if cleaned else None
            
        except Exception as e:
            logger.error(f"خطأ في تنظيف السجل: {e}")
            return None
    
    async def _transform_data(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تحويل البيانات"""
        try:
            transformation_rules = config.parameters.get('transformation_rules', {})
            
            if isinstance(data, list):
                transformed_data = []
                for record in data:
                    transformed_record = await self._transform_record(record, transformation_rules)
                    transformed_data.append(transformed_record)
                return {"records": transformed_data}
            
            elif isinstance(data, dict):
                return {"record": await self._transform_record(data, transformation_rules)}
            
            else:
                return {"data": data}
                
        except Exception as e:
            logger.error(f"خطأ في تحويل البيانات: {e}")
            return {"error": str(e)}
    
    async def _transform_record(self, record: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
        """تحويل سجل واحد"""
        try:
            transformed = record.copy()
            
            # تطبيق قواعد التحويل
            for field, rule in rules.items():
                if field in transformed:
                    value = transformed[field]
                    
                    # تحويل النوع
                    if 'type' in rule:
                        target_type = rule['type']
                        if target_type == 'float':
                            transformed[field] = float(value)
                        elif target_type == 'int':
                            transformed[field] = int(value)
                        elif target_type == 'str':
                            transformed[field] = str(value)
                    
                    # تطبيق دالة
                    if 'function' in rule:
                        func_name = rule['function']
                        if func_name == 'normalize':
                            # تطبيع القيم
                            min_val = rule.get('min', 0)
                            max_val = rule.get('max', 1)
                            transformed[field] = (value - min_val) / (max_val - min_val)
                        
                        elif func_name == 'log':
                            transformed[field] = math.log(max(value, 1))
                        
                        elif func_name == 'sqrt':
                            transformed[field] = math.sqrt(max(value, 0))
            
            # حساب حقول مشتقة
            derived_fields = rules.get('derived_fields', {})
            for new_field, formula in derived_fields.items():
                try:
                    # تقييم الصيغة (بحذر)
                    if formula == 'ctr':
                        clicks = transformed.get('clicks', 0)
                        impressions = transformed.get('impressions', 1)
                        transformed[new_field] = clicks / impressions if impressions > 0 else 0
                    
                    elif formula == 'cpc':
                        cost = transformed.get('cost', 0)
                        clicks = transformed.get('clicks', 1)
                        transformed[new_field] = cost / clicks if clicks > 0 else 0
                    
                    elif formula == 'conversion_rate':
                        conversions = transformed.get('conversions', 0)
                        clicks = transformed.get('clicks', 1)
                        transformed[new_field] = conversions / clicks if clicks > 0 else 0
                    
                    elif formula == 'roas':
                        revenue = transformed.get('revenue', 0)
                        cost = transformed.get('cost', 1)
                        transformed[new_field] = revenue / cost if cost > 0 else 0
                        
                except Exception as e:
                    logger.warning(f"خطأ في حساب الحقل المشتق {new_field}: {e}")
            
            return transformed
            
        except Exception as e:
            logger.error(f"خطأ في تحويل السجل: {e}")
            return record
    
    async def _aggregate_data(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تجميع البيانات"""
        try:
            if not isinstance(data, list):
                return {"error": "البيانات يجب أن تكون قائمة للتجميع"}
            
            aggregation_rules = config.aggregation_rules
            group_by = aggregation_rules.get('group_by', [])
            metrics = aggregation_rules.get('metrics', {})
            
            if not group_by:
                # تجميع عام بدون تجميع
                return await self._aggregate_all(data, metrics)
            
            # تجميع بناءً على الحقول
            grouped_data = defaultdict(list)
            
            for record in data:
                # إنشاء مفتاح التجميع
                group_key = tuple(record.get(field, 'unknown') for field in group_by)
                grouped_data[group_key].append(record)
            
            # تجميع كل مجموعة
            aggregated_results = []
            for group_key, group_records in grouped_data.items():
                group_result = dict(zip(group_by, group_key))
                
                # حساب المقاييس
                for metric_name, aggregation_type in metrics.items():
                    values = [record.get(metric_name, 0) for record in group_records if record.get(metric_name) is not None]
                    
                    if values:
                        if aggregation_type == AggregationType.SUM.value:
                            group_result[f"{metric_name}_sum"] = sum(values)
                        elif aggregation_type == AggregationType.MEAN.value:
                            group_result[f"{metric_name}_mean"] = statistics.mean(values)
                        elif aggregation_type == AggregationType.MEDIAN.value:
                            group_result[f"{metric_name}_median"] = statistics.median(values)
                        elif aggregation_type == AggregationType.COUNT.value:
                            group_result[f"{metric_name}_count"] = len(values)
                        elif aggregation_type == AggregationType.MIN.value:
                            group_result[f"{metric_name}_min"] = min(values)
                        elif aggregation_type == AggregationType.MAX.value:
                            group_result[f"{metric_name}_max"] = max(values)
                        elif aggregation_type == AggregationType.STD.value:
                            group_result[f"{metric_name}_std"] = statistics.stdev(values) if len(values) > 1 else 0
                
                aggregated_results.append(group_result)
            
            return {"aggregated_data": aggregated_results}
            
        except Exception as e:
            logger.error(f"خطأ في تجميع البيانات: {e}")
            return {"error": str(e)}
    
    async def _aggregate_all(self, data: List[Dict[str, Any]], metrics: Dict[str, str]) -> Dict[str, Any]:
        """تجميع جميع البيانات"""
        try:
            result = {}
            
            for metric_name, aggregation_type in metrics.items():
                values = [record.get(metric_name, 0) for record in data if record.get(metric_name) is not None]
                
                if values:
                    if aggregation_type == AggregationType.SUM.value:
                        result[f"{metric_name}_sum"] = sum(values)
                    elif aggregation_type == AggregationType.MEAN.value:
                        result[f"{metric_name}_mean"] = statistics.mean(values)
                    elif aggregation_type == AggregationType.MEDIAN.value:
                        result[f"{metric_name}_median"] = statistics.median(values)
                    elif aggregation_type == AggregationType.COUNT.value:
                        result[f"{metric_name}_count"] = len(values)
                    elif aggregation_type == AggregationType.MIN.value:
                        result[f"{metric_name}_min"] = min(values)
                    elif aggregation_type == AggregationType.MAX.value:
                        result[f"{metric_name}_max"] = max(values)
                    elif aggregation_type == AggregationType.STD.value:
                        result[f"{metric_name}_std"] = statistics.stdev(values) if len(values) > 1 else 0
            
            return {"aggregated_data": result}
            
        except Exception as e:
            logger.error(f"خطأ في التجميع العام: {e}")
            return {"error": str(e)}
    
    async def _analyze_data(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تحليل البيانات"""
        try:
            analysis_results = {}
            
            if isinstance(data, list):
                # تحليل إحصائي
                analysis_results['descriptive_stats'] = await self._descriptive_statistics(data)
                
                # تحليل الاتجاهات
                if config.parameters.get('include_trends', True):
                    analysis_results['trends'] = await self._basic_trend_analysis(data)
                
                # تحليل التوزيع
                if config.parameters.get('include_distribution', True):
                    analysis_results['distribution'] = await self._distribution_analysis(data)
                
                # تحليل الارتباط
                if config.parameters.get('include_correlation', True):
                    analysis_results['correlation'] = await self._basic_correlation_analysis(data)
            
            return analysis_results
            
        except Exception as e:
            logger.error(f"خطأ في تحليل البيانات: {e}")
            return {"error": str(e)}
    
    async def _descriptive_statistics(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """إحصائيات وصفية"""
        try:
            stats_result = {}
            
            # جمع الحقول الرقمية
            numeric_fields = set()
            for record in data:
                for key, value in record.items():
                    if isinstance(value, (int, float)) and not math.isnan(value):
                        numeric_fields.add(key)
            
            # حساب الإحصائيات لكل حقل
            for field in numeric_fields:
                values = [record.get(field, 0) for record in data if record.get(field) is not None]
                values = [v for v in values if isinstance(v, (int, float)) and not math.isnan(v)]
                
                if values:
                    field_stats = {
                        'count': len(values),
                        'mean': statistics.mean(values),
                        'median': statistics.median(values),
                        'min': min(values),
                        'max': max(values),
                        'sum': sum(values)
                    }
                    
                    if len(values) > 1:
                        field_stats['std'] = statistics.stdev(values)
                        field_stats['variance'] = statistics.variance(values)
                    
                    # المئينات
                    if len(values) >= 4:
                        sorted_values = sorted(values)
                        n = len(sorted_values)
                        field_stats['q1'] = sorted_values[n // 4]
                        field_stats['q3'] = sorted_values[3 * n // 4]
                        field_stats['iqr'] = field_stats['q3'] - field_stats['q1']
                    
                    stats_result[field] = field_stats
            
            return stats_result
            
        except Exception as e:
            logger.error(f"خطأ في الإحصائيات الوصفية: {e}")
            return {}
    
    async def _detect_anomalies(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """كشف الشذوذ"""
        try:
            if not isinstance(data, list) or len(data) < 10:
                return {"error": "البيانات غير كافية لكشف الشذوذ"}
            
            anomaly_results = {}
            detection_method = config.parameters.get('method', 'statistical')
            
            if detection_method == 'statistical':
                anomaly_results = await self._statistical_anomaly_detection(data, config)
            elif detection_method == 'isolation_forest' and ML_AVAILABLE:
                anomaly_results = await self._isolation_forest_anomaly_detection(data, config)
            else:
                anomaly_results = await self._statistical_anomaly_detection(data, config)
            
            return anomaly_results
            
        except Exception as e:
            logger.error(f"خطأ في كشف الشذوذ: {e}")
            return {"error": str(e)}
    
    async def _statistical_anomaly_detection(self, data: List[Dict[str, Any]], config: ProcessingConfig) -> Dict[str, Any]:
        """كشف الشذوذ الإحصائي"""
        try:
            anomalies = []
            threshold = config.parameters.get('threshold', 2.5)  # عدد الانحرافات المعيارية
            
            # جمع الحقول الرقمية
            numeric_fields = set()
            for record in data:
                for key, value in record.items():
                    if isinstance(value, (int, float)) and not math.isnan(value):
                        numeric_fields.add(key)
            
            # كشف الشذوذ لكل حقل
            for field in numeric_fields:
                values = [record.get(field, 0) for record in data if record.get(field) is not None]
                values = [v for v in values if isinstance(v, (int, float)) and not math.isnan(v)]
                
                if len(values) > 3:
                    mean_val = statistics.mean(values)
                    std_val = statistics.stdev(values) if len(values) > 1 else 0
                    
                    if std_val > 0:
                        for i, record in enumerate(data):
                            value = record.get(field)
                            if value is not None and isinstance(value, (int, float)):
                                z_score = abs(value - mean_val) / std_val
                                if z_score > threshold:
                                    anomalies.append({
                                        'record_index': i,
                                        'field': field,
                                        'value': value,
                                        'z_score': z_score,
                                        'mean': mean_val,
                                        'std': std_val,
                                        'record': record
                                    })
            
            return {
                'anomalies': anomalies,
                'total_anomalies': len(anomalies),
                'method': 'statistical',
                'threshold': threshold
            }
            
        except Exception as e:
            logger.error(f"خطأ في كشف الشذوذ الإحصائي: {e}")
            return {"error": str(e)}
    
    async def _analyze_trends(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تحليل الاتجاهات"""
        try:
            if not isinstance(data, list) or len(data) < 5:
                return {"error": "البيانات غير كافية لتحليل الاتجاهات"}
            
            # فرز البيانات حسب التاريخ
            date_field = config.parameters.get('date_field', 'date')
            sorted_data = sorted(data, key=lambda x: x.get(date_field, ''))
            
            trends = {}
            
            # تحليل الاتجاهات للحقول الرقمية
            numeric_fields = set()
            for record in sorted_data:
                for key, value in record.items():
                    if isinstance(value, (int, float)) and not math.isnan(value) and key != date_field:
                        numeric_fields.add(key)
            
            for field in numeric_fields:
                values = [record.get(field, 0) for record in sorted_data if record.get(field) is not None]
                
                if len(values) >= 3:
                    # حساب الاتجاه البسيط
                    trend_direction = await self._calculate_trend_direction(values)
                    trend_strength = await self._calculate_trend_strength(values)
                    
                    # كشف النقاط المحورية
                    turning_points = await self._find_turning_points(values)
                    
                    trends[field] = {
                        'direction': trend_direction,
                        'strength': trend_strength,
                        'turning_points': turning_points,
                        'start_value': values[0],
                        'end_value': values[-1],
                        'change_percent': ((values[-1] - values[0]) / values[0] * 100) if values[0] != 0 else 0
                    }
            
            return {'trends': trends}
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الاتجاهات: {e}")
            return {"error": str(e)}
    
    async def _calculate_trend_direction(self, values: List[float]) -> str:
        """حساب اتجاه الاتجاه"""
        try:
            if len(values) < 2:
                return "unknown"
            
            # حساب الميل البسيط
            x = list(range(len(values)))
            n = len(values)
            
            sum_x = sum(x)
            sum_y = sum(values)
            sum_xy = sum(x[i] * values[i] for i in range(n))
            sum_x2 = sum(xi * xi for xi in x)
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
            
            if slope > 0.01:
                return "increasing"
            elif slope < -0.01:
                return "decreasing"
            else:
                return "stable"
                
        except Exception as e:
            logger.error(f"خطأ في حساب اتجاه الاتجاه: {e}")
            return "unknown"
    
    async def _calculate_trend_strength(self, values: List[float]) -> float:
        """حساب قوة الاتجاه"""
        try:
            if len(values) < 3:
                return 0.0
            
            # حساب معامل الارتباط مع الزمن
            x = list(range(len(values)))
            n = len(values)
            
            mean_x = sum(x) / n
            mean_y = sum(values) / n
            
            numerator = sum((x[i] - mean_x) * (values[i] - mean_y) for i in range(n))
            denominator_x = sum((x[i] - mean_x) ** 2 for i in range(n))
            denominator_y = sum((values[i] - mean_y) ** 2 for i in range(n))
            
            if denominator_x == 0 or denominator_y == 0:
                return 0.0
            
            correlation = numerator / (math.sqrt(denominator_x) * math.sqrt(denominator_y))
            return abs(correlation)
            
        except Exception as e:
            logger.error(f"خطأ في حساب قوة الاتجاه: {e}")
            return 0.0
    
    async def _find_turning_points(self, values: List[float]) -> List[int]:
        """العثور على النقاط المحورية"""
        try:
            if len(values) < 3:
                return []
            
            turning_points = []
            
            for i in range(1, len(values) - 1):
                # نقطة محورية عالية
                if values[i] > values[i-1] and values[i] > values[i+1]:
                    turning_points.append(i)
                # نقطة محورية منخفضة
                elif values[i] < values[i-1] and values[i] < values[i+1]:
                    turning_points.append(i)
            
            return turning_points
            
        except Exception as e:
            logger.error(f"خطأ في العثور على النقاط المحورية: {e}")
            return []
    
    async def _apply_filters(self, data: Any, filters: Dict[str, Any]) -> Any:
        """تطبيق المرشحات"""
        try:
            if not filters or not isinstance(data, list):
                return data
            
            filtered_data = []
            
            for record in data:
                include_record = True
                
                for field, filter_config in filters.items():
                    if field not in record:
                        continue
                    
                    value = record[field]
                    
                    # مرشح القيم
                    if 'equals' in filter_config:
                        if value != filter_config['equals']:
                            include_record = False
                            break
                    
                    if 'not_equals' in filter_config:
                        if value == filter_config['not_equals']:
                            include_record = False
                            break
                    
                    if 'in' in filter_config:
                        if value not in filter_config['in']:
                            include_record = False
                            break
                    
                    if 'not_in' in filter_config:
                        if value in filter_config['not_in']:
                            include_record = False
                            break
                    
                    # مرشحات رقمية
                    if isinstance(value, (int, float)):
                        if 'min' in filter_config:
                            if value < filter_config['min']:
                                include_record = False
                                break
                        
                        if 'max' in filter_config:
                            if value > filter_config['max']:
                                include_record = False
                                break
                    
                    # مرشحات نصية
                    if isinstance(value, str):
                        if 'contains' in filter_config:
                            if filter_config['contains'].lower() not in value.lower():
                                include_record = False
                                break
                        
                        if 'starts_with' in filter_config:
                            if not value.lower().startswith(filter_config['starts_with'].lower()):
                                include_record = False
                                break
                
                if include_record:
                    filtered_data.append(record)
            
            return filtered_data
            
        except Exception as e:
            logger.error(f"خطأ في تطبيق المرشحات: {e}")
            return data
    
    async def _check_data_quality(self, data: Any, data_type: DataType) -> DataQualityMetrics:
        """فحص جودة البيانات"""
        try:
            metrics = DataQualityMetrics()
            
            if not isinstance(data, list):
                data = [data] if isinstance(data, dict) else []
            
            if not data:
                return metrics
            
            total_records = len(data)
            required_fields = self.quality_rules.get('required_fields', {}).get(data_type, [])
            
            # فحص الاكتمال
            completeness_scores = []
            for record in data:
                complete_fields = sum(1 for field in required_fields if field in record and record[field] is not None)
                completeness_scores.append(complete_fields / len(required_fields) if required_fields else 1.0)
            
            metrics.completeness = statistics.mean(completeness_scores) if completeness_scores else 0.0
            
            # فحص الصحة
            validity_scores = []
            for record in data:
                valid_fields = 0
                total_fields = 0
                
                for field, value in record.items():
                    total_fields += 1
                    
                    # فحص نوع البيانات
                    expected_type = self.quality_rules.get('data_types', {}).get(field)
                    if expected_type:
                        if isinstance(value, expected_type) or (expected_type == float and isinstance(value, int)):
                            valid_fields += 1
                    else:
                        valid_fields += 1  # إذا لم يكن هناك نوع محدد
                    
                    # فحص النطاقات
                    if field in self.quality_rules.get('value_ranges', {}):
                        min_val, max_val = self.quality_rules['value_ranges'][field]
                        if isinstance(value, (int, float)) and not (min_val <= value <= max_val):
                            valid_fields -= 1
                
                validity_scores.append(valid_fields / total_fields if total_fields > 0 else 0.0)
            
            metrics.validity = statistics.mean(validity_scores) if validity_scores else 0.0
            
            # فحص التفرد
            unique_records = len(set(json.dumps(record, sort_keys=True) for record in data))
            metrics.uniqueness = unique_records / total_records if total_records > 0 else 0.0
            
            # النتيجة الإجمالية
            metrics.overall_score = (metrics.completeness + metrics.validity + metrics.uniqueness) / 3
            
            # تحديد المشاكل
            if metrics.completeness < 0.8:
                metrics.issues_found.append("بيانات ناقصة")
            if metrics.validity < 0.8:
                metrics.issues_found.append("بيانات غير صحيحة")
            if metrics.uniqueness < 0.9:
                metrics.issues_found.append("بيانات مكررة")
            
            return metrics
            
        except Exception as e:
            logger.error(f"خطأ في فحص جودة البيانات: {e}")
            return DataQualityMetrics()
    
    async def _calculate_statistics(self, processed_data: Dict[str, Any], config: ProcessingConfig) -> Dict[str, Any]:
        """حساب الإحصائيات"""
        try:
            statistics_result = {
                'processing_type': config.processing_type.value,
                'data_type': config.data_type.value,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            # إحصائيات بناءً على نوع المعالجة
            if config.processing_type == ProcessingType.AGGREGATION:
                if 'aggregated_data' in processed_data:
                    agg_data = processed_data['aggregated_data']
                    if isinstance(agg_data, list):
                        statistics_result['groups_count'] = len(agg_data)
                    elif isinstance(agg_data, dict):
                        statistics_result['metrics_count'] = len(agg_data)
            
            elif config.processing_type == ProcessingType.CLEANING:
                if 'records' in processed_data:
                    statistics_result['cleaned_records'] = len(processed_data['records'])
            
            elif config.processing_type == ProcessingType.TRANSFORMATION:
                if 'records' in processed_data:
                    statistics_result['transformed_records'] = len(processed_data['records'])
            
            return statistics_result
            
        except Exception as e:
            logger.error(f"خطأ في حساب الإحصائيات: {e}")
            return {}
    
    async def _get_cached_result(self, config: ProcessingConfig) -> Optional[ProcessingResult]:
        """جلب النتيجة من الكاش"""
        try:
            if not REDIS_AVAILABLE:
                return None
            
            cache_key = f"data_processing_{calculate_hash(json.dumps(asdict(config), sort_keys=True))}"
            cached_data = cache_get(cache_key)
            
            if cached_data:
                return ProcessingResult(**json.loads(cached_data))
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب النتيجة من الكاش: {e}")
            return None
    
    async def _cache_result(self, config: ProcessingConfig, result: ProcessingResult):
        """حفظ النتيجة في الكاش"""
        try:
            if not REDIS_AVAILABLE:
                return
            
            cache_key = f"data_processing_{calculate_hash(json.dumps(asdict(config), sort_keys=True))}"
            cache_data = json.dumps(asdict(result), default=str)
            cache_set(cache_key, cache_data, expire=3600)  # ساعة واحدة
            
        except Exception as e:
            logger.error(f"خطأ في حفظ النتيجة في الكاش: {e}")
    
    async def _segment_data(self, data: Any, config: ProcessingConfig) -> Dict[str, Any]:
        """تقسيم البيانات إلى شرائح"""
        try:
            if not isinstance(data, list):
                return {"error": "البيانات يجب أن تكون قائمة للتقسيم"}
            
            segmentation_rules = config.parameters.get('segmentation_rules', {})
            segment_field = segmentation_rules.get('field', 'performance_tier')
            segment_method = segmentation_rules.get('method', 'quantile')
            num_segments = segmentation_rules.get('segments', 3)
            
            segments = {}
            
            if segment_method == 'quantile':
                # تقسيم بناءً على المئينات
                segments = await self._quantile_segmentation(data, segment_field, num_segments)
            elif segment_method == 'value_range':
                # تقسيم بناءً على نطاقات القيم
                segments = await self._value_range_segmentation(data, segmentation_rules)
            elif segment_method == 'clustering' and ML_AVAILABLE:
                # تقسيم بناءً على التجميع
                segments = await self._clustering_segmentation(data, segmentation_rules)
            else:
                # تقسيم افتراضي
                segments = await self._default_segmentation(data, segment_field)
            
            return {
                'segments': segments,
                'total_segments': len(segments),
                'method': segment_method,
                'field': segment_field
            }
            
        except Exception as e:
            logger.error(f"خطأ في تقسيم البيانات: {e}")
            return {"error": str(e)}
    
    async def _quantile_segmentation(self, data: List[Dict[str, Any]], field: str, num_segments: int) -> Dict[str, List[Dict[str, Any]]]:
        """تقسيم بناءً على المئينات"""
        try:
            # استخراج القيم الرقمية
            values = []
            for record in data:
                value = record.get(field)
                if value is not None and isinstance(value, (int, float)) and not math.isnan(value):
                    values.append((value, record))
            
            if not values:
                return {"default": data}
            
            # ترتيب القيم
            values.sort(key=lambda x: x[0])
            
            # تقسيم إلى شرائح
            segments = {}
            segment_size = len(values) // num_segments
            
            for i in range(num_segments):
                start_idx = i * segment_size
                end_idx = (i + 1) * segment_size if i < num_segments - 1 else len(values)
                
                segment_name = f"segment_{i+1}"
                segment_records = [record for _, record in values[start_idx:end_idx]]
                segments[segment_name] = segment_records
            
            return segments
            
        except Exception as e:
            logger.error(f"خطأ في التقسيم الكمي: {e}")
            return {"default": data}
    
    async def _value_range_segmentation(self, data: List[Dict[str, Any]], rules: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """تقسيم بناءً على نطاقات القيم"""
        try:
            field = rules.get('field', 'performance_tier')
            ranges = rules.get('ranges', [])
            
            if not ranges:
                return {"default": data}
            
            segments = {f"range_{i+1}": [] for i in range(len(ranges))}
            segments["out_of_range"] = []
            
            for record in data:
                value = record.get(field)
                if value is not None and isinstance(value, (int, float)):
                    assigned = False
                    for i, (min_val, max_val) in enumerate(ranges):
                        if min_val <= value <= max_val:
                            segments[f"range_{i+1}"].append(record)
                            assigned = True
                            break
                    
                    if not assigned:
                        segments["out_of_range"].append(record)
                else:
                    segments["out_of_range"].append(record)
            
            return segments
            
        except Exception as e:
            logger.error(f"خطأ في تقسيم النطاقات: {e}")
            return {"default": data}
    
    async def _clustering_segmentation(self, data: List[Dict[str, Any]], rules: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """تقسيم بناءً على التجميع"""
        try:
            if not ML_AVAILABLE:
                return await self._default_segmentation(data, rules.get('field', 'performance_tier'))
            
            # استخراج الميزات الرقمية
            features = []
            feature_names = rules.get('features', ['impressions', 'clicks', 'cost'])
            
            for record in data:
                feature_vector = []
                for feature in feature_names:
                    value = record.get(feature, 0)
                    if isinstance(value, (int, float)) and not math.isnan(value):
                        feature_vector.append(value)
                    else:
                        feature_vector.append(0)
                features.append(feature_vector)
            
            if not features:
                return {"default": data}
            
            # تطبيع الميزات
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform(features)
            
            # تطبيق K-Means
            num_clusters = rules.get('clusters', 3)
            kmeans = KMeans(n_clusters=num_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(features_scaled)
            
            # تجميع البيانات حسب العناقيد
            segments = {f"cluster_{i}": [] for i in range(num_clusters)}
            
            for record, label in zip(data, cluster_labels):
                segments[f"cluster_{label}"].append(record)
            
            return segments
            
        except Exception as e:
            logger.error(f"خطأ في تقسيم التجميع: {e}")
            return await self._default_segmentation(data, rules.get('field', 'performance_tier'))
    
    async def _default_segmentation(self, data: List[Dict[str, Any]], field: str) -> Dict[str, List[Dict[str, Any]]]:
        """تقسيم افتراضي"""
        try:
            # تقسيم بسيط بناءً على قيم الحقل
            segments = defaultdict(list)
            
            for record in data:
                value = record.get(field, 'unknown')
                segment_key = str(value)
                segments[segment_key].append(record)
            
            return dict(segments)
            
        except Exception as e:
            logger.error(f"خطأ في تقسيم البيانات: {e}")
            return {"default": data}

    async def _analyze_correlations(self, config: ProcessingConfig) -> ProcessingResult:
        """تحليل الارتباطات بين المتغيرات"""
        result = ProcessingResult(
            processing_id=config.processing_id,
            status="processing",
            start_time=datetime.now()
        )
        
        try:
            data = config.source_data.get('data', [])
            if not data:
                result.status = "error"
                result.errors.append("لا توجد بيانات للتحليل")
                return result
            
            # تحويل إلى DataFrame
            df = pd.DataFrame(data)
            
            # اختيار الأعمدة الرقمية فقط
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            
            if len(numeric_cols) < 2:
                result.status = "error"
                result.errors.append("يجب وجود عمودين رقميين على الأقل لحساب الارتباط")
                return result
            
            # حساب مصفوفة الارتباط
            correlation_matrix = df[numeric_cols].corr()
            
            # تحويل إلى قاموس
            correlations = {}
            for i, col1 in enumerate(numeric_cols):
                correlations[col1] = {}
                for j, col2 in enumerate(numeric_cols):
                    if i != j:  # تجاهل الارتباط مع النفس
                        correlations[col1][col2] = float(correlation_matrix.iloc[i, j])
            
            # العثور على أقوى الارتباطات
            strong_correlations = []
            for col1 in correlations:
                for col2 in correlations[col1]:
                    corr_value = correlations[col1][col2]
                    if abs(corr_value) > 0.5:  # ارتباط قوي
                        strong_correlations.append({
                            'variable1': col1,
                            'variable2': col2,
                            'correlation': corr_value,
                            'strength': 'قوي' if abs(corr_value) > 0.7 else 'متوسط'
                        })
            
            result.processed_data = {
                'correlation_matrix': correlations,
                'strong_correlations': strong_correlations,
                'numeric_variables': numeric_cols
            }
            
            result.statistics = {
                'total_variables': len(numeric_cols),
                'strong_correlations_count': len(strong_correlations),
                'average_correlation': float(np.mean(np.abs(correlation_matrix.values)))
            }
            
            result.status = "completed"
            result.end_time = datetime.now()
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.records_processed = len(data)
            
            return result
            
        except Exception as e:
            logger.error(f"خطأ في تحليل الارتباطات: {e}")
            result.status = "error"
            result.errors.append(str(e))
            result.end_time = datetime.now()
            return result

    async def _forecast_trends(self, config: ProcessingConfig) -> ProcessingResult:
        """التنبؤ بالاتجاهات"""
        result = ProcessingResult(
            processing_id=config.processing_id,
            status="processing",
            start_time=datetime.now()
        )
        
        try:
            data = config.source_data.get('data', [])
            if not data:
                result.status = "error"
                result.errors.append("لا توجد بيانات للتحليل")
                return result
            
            df = pd.DataFrame(data)
            
            # البحث عن عمود التاريخ
            date_col = None
            for col in df.columns:
                if 'date' in col.lower() or 'time' in col.lower():
                    date_col = col
                    break
            
            if not date_col:
                result.status = "error"
                result.errors.append("لا يوجد عمود تاريخ للتنبؤ")
                return result
            
            # تحويل عمود التاريخ
            df[date_col] = pd.to_datetime(df[date_col])
            df = df.sort_values(date_col)
            
            # اختيار المتغير للتنبؤ
            target_col = config.parameters.get('target_column')
            if not target_col:
                numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                if numeric_cols:
                    target_col = numeric_cols[0]
                else:
                    result.status = "error"
                    result.errors.append("لا يوجد متغير رقمي للتنبؤ")
                    return result
            
            # تحضير البيانات للتنبؤ
            df_forecast = df[[date_col, target_col]].dropna()
            
            if len(df_forecast) < 10:
                result.status = "error"
                result.errors.append("البيانات قليلة جداً للتنبؤ (يجب 10 نقاط على الأقل)")
                return result
            
            # تنبؤ بسيط باستخدام الاتجاه الخطي
            if SKLEARN_LINEAR_MODEL_AVAILABLE:
                
                # تحويل التواريخ إلى أرقام
                df_forecast['date_numeric'] = (df_forecast[date_col] - df_forecast[date_col].min()).dt.days
                
                X = df_forecast[['date_numeric']]
                y = df_forecast[target_col]
                
                model = LinearRegression()
                model.fit(X, y)
                
                # التنبؤ للفترات القادمة
                forecast_days = config.parameters.get('forecast_days', 30)
                last_date_numeric = df_forecast['date_numeric'].max()
                
                future_dates_numeric = range(last_date_numeric + 1, last_date_numeric + forecast_days + 1)
                future_predictions = model.predict([[d] for d in future_dates_numeric])
                
                # تحويل التواريخ المستقبلية
                base_date = df_forecast[date_col].max()
                future_dates = [base_date + timedelta(days=i) for i in range(1, forecast_days + 1)]
                
                forecast_data = []
                for date, prediction in zip(future_dates, future_predictions):
                    forecast_data.append({
                        'date': date.isoformat(),
                        'predicted_value': float(prediction),
                        'confidence': 'متوسط'
                    })
                
                # حساب الاتجاه
                trend_direction = 'صاعد' if model.coef_[0] > 0 else 'هابط'
                trend_strength = abs(model.coef_[0])
                model_score = float(model.score(X, y))
            else:
                # تنبؤ بسيط بدون sklearn
                values = df_forecast[target_col].values
                trend_direction = 'صاعد' if values[-1] > values[0] else 'هابط'
                trend_strength = abs(values[-1] - values[0]) / len(values)
                model_score = 0.5
                
                forecast_days = config.parameters.get('forecast_days', 30)
                base_date = df_forecast[date_col].max()
                future_dates = [base_date + timedelta(days=i) for i in range(1, forecast_days + 1)]
                
                # تنبؤ بسيط بناءً على المتوسط المتحرك
                recent_avg = np.mean(values[-5:]) if len(values) >= 5 else np.mean(values)
                forecast_data = []
                for date in future_dates:
                    forecast_data.append({
                        'date': date.isoformat(),
                        'predicted_value': float(recent_avg),
                        'confidence': 'منخفض'
                    })
            
            result.processed_data = {
                'forecast': forecast_data,
                'trend_direction': trend_direction,
                'trend_strength': float(trend_strength),
                'model_score': model_score,
                'target_column': target_col
            }
            
            result.statistics = {
                'historical_points': len(df_forecast),
                'forecast_points': len(forecast_data),
                'model_accuracy': model_score
            }
            
            result.status = "completed"
            result.end_time = datetime.now()
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.records_processed = len(data)
            
            return result
            
        except Exception as e:
            logger.error(f"خطأ في التنبؤ بالاتجاهات: {e}")
            result.status = "error"
            result.errors.append(str(e))
            result.end_time = datetime.now()
            return result

class MetricsCalculator:
    """حاسبة المقاييس"""
    
    @staticmethod
    def calculate_performance_metrics(data: Dict[str, Any]) -> Dict[str, float]:
        """حساب مقاييس الأداء"""
        try:
            metrics = {}
            
            # البيانات الأساسية
            impressions = data.get('impressions', 0)
            clicks = data.get('clicks', 0)
            cost = data.get('cost', 0.0)
            conversions = data.get('conversions', 0)
            revenue = data.get('revenue', 0.0)
            
            # CTR
            metrics['ctr'] = clicks / impressions if impressions > 0 else 0.0
            
            # CPC
            metrics['cpc'] = cost / clicks if clicks > 0 else 0.0
            
            # Conversion Rate
            metrics['conversion_rate'] = conversions / clicks if clicks > 0 else 0.0
            
            # CPA
            metrics['cpa'] = cost / conversions if conversions > 0 else 0.0
            
            # ROAS
            metrics['roas'] = revenue / cost if cost > 0 else 0.0
            
            # CPM
            metrics['cpm'] = (cost / impressions) * 1000 if impressions > 0 else 0.0
            
            return metrics
            
        except Exception as e:
            logger.error(f"خطأ في حساب مقاييس الأداء: {e}")
            return {}

# إنشاء معالج البيانات العام
data_processor = DataProcessor()
metrics_calculator = MetricsCalculator()

# تسجيل معلومات البدء
logger.info(f"🚀 تم تحميل Data Processing Module v2.3.0")
logger.info(f"📊 ML متاح: {ML_AVAILABLE}")
logger.info(f"🔬 SciPy متاح: {SCIPY_AVAILABLE}")
logger.info(f"📈 StatsModels متاح: {STATSMODELS_AVAILABLE}")
logger.info(f"⚡ Thread Pool: {processing_executor._max_workers} workers")

