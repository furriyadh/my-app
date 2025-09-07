#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📊 Data Processor - معالج البيانات المحدث
=========================================

محرك معالجة البيانات المتقدم مع دعم نظام MCC الديناميكي.
يدعم معالجة وتحليل بيانات حسابات متعددة بشكل متزامن.

المميزات الجديدة:
- معالجة بيانات MCC متعددة الحسابات
- تحليل مقارن للأداء
- تجميع البيانات الذكي
- تقارير شاملة موحدة
- معالجة متزامنة للبيانات الكبيرة

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 2.0.0 (MCC Support)
"""

import logging
import asyncio
import json
import re
import os
from typing import Dict, Any, List, Optional, Tuple, Union, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
from enum import Enum
import pandas as pd
import numpy as np
import hashlib
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics
from collections import defaultdict, Counter

# استيراد وحدات MCC
try:
    from ..mcc.mcc_manager import MCCManager, MCCAccount
    MCC_AVAILABLE = True
except ImportError:
    MCC_AVAILABLE = False
    MCCManager = None
    MCCAccount = None

from ..utils.logger import setup_logger

# إعداد السجل
logger = setup_logger(__name__)

class DataType(Enum):
    """أنواع البيانات"""
    CAMPAIGN = "campaign"
    AD_GROUP = "ad_group"
    KEYWORD = "keyword"
    AD = "ad"
    EXTENSION = "extension"
    AUDIENCE = "audience"
    PLACEMENT = "placement"
    DEMOGRAPHIC = "demographic"
    GEOGRAPHIC = "geographic"
    DEVICE = "device"
    TIME = "time"
    CONVERSION = "conversion"
    ATTRIBUTION = "attribution"

class ProcessingStatus(Enum):
    """حالات المعالجة"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class QualityLevel(Enum):
    """مستويات الجودة"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

@dataclass
class DataQualityMetrics:
    """
    📊 مقاييس جودة البيانات
    """
    completeness: float = 0.0  # اكتمال البيانات (0-1)
    accuracy: float = 0.0      # دقة البيانات (0-1)
    consistency: float = 0.0   # اتساق البيانات (0-1)
    timeliness: float = 0.0    # حداثة البيانات (0-1)
    validity: float = 0.0      # صحة البيانات (0-1)
    uniqueness: float = 0.0    # تفرد البيانات (0-1)
    
    @property
    def overall_score(self) -> float:
        """النتيجة الإجمالية لجودة البيانات"""
        scores = [self.completeness, self.accuracy, self.consistency, 
                 self.timeliness, self.validity, self.uniqueness]
        return sum(scores) / len(scores)
    
    @property
    def quality_level(self) -> QualityLevel:
        """مستوى الجودة"""
        score = self.overall_score
        if score >= 0.9:
            return QualityLevel.EXCELLENT
        elif score >= 0.8:
            return QualityLevel.GOOD
        elif score >= 0.6:
            return QualityLevel.FAIR
        elif score >= 0.4:
            return QualityLevel.POOR
        else:
            return QualityLevel.CRITICAL
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'completeness': self.completeness,
            'accuracy': self.accuracy,
            'consistency': self.consistency,
            'timeliness': self.timeliness,
            'validity': self.validity,
            'uniqueness': self.uniqueness,
            'overall_score': self.overall_score,
            'quality_level': self.quality_level.value
        }

@dataclass
class ProcessingResult:
    """
    📋 نتيجة المعالجة
    """
    id: str
    data_type: DataType
    status: ProcessingStatus
    input_count: int = 0
    output_count: int = 0
    processed_count: int = 0
    error_count: int = 0
    warnings: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    quality_metrics: Optional[DataQualityMetrics] = None
    processing_time: float = 0.0
    memory_usage: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def success_rate(self) -> float:
        """معدل النجاح"""
        if self.input_count == 0:
            return 0.0
        return (self.processed_count / self.input_count) * 100
    
    @property
    def error_rate(self) -> float:
        """معدل الأخطاء"""
        if self.input_count == 0:
            return 0.0
        return (self.error_count / self.input_count) * 100
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return {
            'id': self.id,
            'data_type': self.data_type.value,
            'status': self.status.value,
            'input_count': self.input_count,
            'output_count': self.output_count,
            'processed_count': self.processed_count,
            'error_count': self.error_count,
            'success_rate': self.success_rate,
            'error_rate': self.error_rate,
            'warnings': self.warnings,
            'errors': self.errors,
            'quality_metrics': self.quality_metrics.to_dict() if self.quality_metrics else None,
            'processing_time': self.processing_time,
            'memory_usage': self.memory_usage,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'metadata': self.metadata
        }

@dataclass
class MCCDataSummary:
    """
    🏢 ملخص بيانات MCC
    """
    mcc_id: str
    total_accounts: int = 0
    active_accounts: int = 0
    total_campaigns: int = 0
    total_ad_groups: int = 0
    total_keywords: int = 0
    total_ads: int = 0
    total_impressions: int = 0
    total_clicks: int = 0
    total_conversions: float = 0.0
    total_cost: float = 0.0
    average_ctr: float = 0.0
    average_cpc: float = 0.0
    average_conversion_rate: float = 0.0
    quality_score: float = 0.0
    data_freshness: datetime = field(default_factory=datetime.now)
    account_summaries: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل إلى قاموس"""
        return asdict(self)

class DataProcessor:
    """
    📊 معالج البيانات المحدث
    
    محرك معالجة البيانات المتقدم مع دعم:
    - معالجة بيانات MCC متعددة الحسابات
    - تحليل مقارن للأداء
    - تجميع البيانات الذكي
    - معالجة متزامنة
    """
    
    def __init__(self, mcc_manager: Optional['MCCManager'] = None, max_workers: int = 5):
        """
        تهيئة معالج البيانات
        
        Args:
            mcc_manager: مدير MCC
            max_workers: عدد العمليات المتزامنة
        """
        self.mcc_manager = mcc_manager
        self.max_workers = max_workers
        self.thread_pool = ThreadPoolExecutor(max_workers=max_workers)
        
        # إعدادات المعالجة
        self.batch_size = int(os.getenv('DATA_PROCESSING_BATCH_SIZE', '1000'))
        self.timeout = int(os.getenv('DATA_PROCESSING_TIMEOUT', '300'))
        
        # ذاكرة التخزين المؤقت
        self.cache = {}
        self.cache_ttl = timedelta(minutes=30)
        
        # إحصائيات الأداء
        self.performance_stats = {
            'total_processed': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'average_processing_time': 0.0,
            'total_data_volume': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        
        logger.info("📊 تم تهيئة معالج البيانات المحدث مع دعم MCC")
    
    async def process_data(
        self,
        data: Union[List[Dict[str, Any]], pd.DataFrame],
        data_type: DataType,
        processing_options: Optional[Dict[str, Any]] = None
    ) -> ProcessingResult:
        """
        معالجة البيانات
        
        Args:
            data: البيانات المراد معالجتها
            data_type: نوع البيانات
            processing_options: خيارات المعالجة
            
        Returns:
            ProcessingResult: نتيجة المعالجة
        """
        start_time = datetime.now()
        result_id = f"proc_{int(start_time.timestamp())}_{data_type.value}"
        
        result = ProcessingResult(
            id=result_id,
            data_type=data_type,
            status=ProcessingStatus.PROCESSING,
            input_count=len(data) if data else 0
        )
        
        logger.info(f"📊 بدء معالجة {result.input_count} عنصر من نوع {data_type.value}")
        
        try:
            # تحويل البيانات إلى DataFrame إذا لزم الأمر
            if isinstance(data, list):
                df = pd.DataFrame(data)
            else:
                df = data.copy()
            
            # تطبيق المعالجة حسب النوع
            processed_df = await self._process_by_type(df, data_type, processing_options or {})
            
            # تقييم جودة البيانات
            quality_metrics = await self._assess_data_quality(processed_df, data_type)
            
            # تحديث النتيجة
            result.status = ProcessingStatus.COMPLETED
            result.output_count = len(processed_df)
            result.processed_count = len(processed_df)
            result.quality_metrics = quality_metrics
            result.completed_at = datetime.now()
            
            # حفظ النتيجة في الذاكرة المؤقتة
            self._cache_result(result_id, processed_df)
            
            # تحديث الإحصائيات
            self.performance_stats['successful_operations'] += 1
            
            logger.info(f"✅ تمت معالجة البيانات بنجاح: {result.processed_count} عنصر")
            
        except Exception as e:
            result.status = ProcessingStatus.FAILED
            result.errors.append(str(e))
            self.performance_stats['failed_operations'] += 1
            logger.error(f"❌ فشل في معالجة البيانات: {e}")
        
        finally:
            # حساب وقت المعالجة
            processing_time = (datetime.now() - start_time).total_seconds()
            result.processing_time = processing_time
            
            # تحديث الإحصائيات
            self.performance_stats['total_processed'] += result.input_count
            self._update_average_processing_time(processing_time)
        
        return result
    
    async def process_mcc_accounts_data(
        self,
        accounts: Optional[List['MCCAccount']] = None,
        data_types: Optional[List[DataType]] = None,
        date_range: Optional[Tuple[datetime, datetime]] = None
    ) -> MCCDataSummary:
        """
        معالجة بيانات حسابات MCC
        
        Args:
            accounts: قائمة الحسابات (اختيارية)
            data_types: أنواع البيانات المطلوبة
            date_range: نطاق التاريخ
            
        Returns:
            MCCDataSummary: ملخص بيانات MCC
        """
        if not MCC_AVAILABLE:
            raise ImportError("وحدة MCC غير متاحة")
        
        if not self.mcc_manager:
            self.mcc_manager = MCCManager()
        
        # الحصول على الحسابات
        if accounts is None:
            accounts = self.mcc_manager.get_client_accounts()
        
        if not accounts:
            logger.warning("لا توجد حسابات متاحة للمعالجة")
            return MCCDataSummary(mcc_id="unknown")
        
        logger.info(f"🏢 معالجة بيانات {len(accounts)} حساب MCC")
        
        # إعداد أنواع البيانات
        if data_types is None:
            data_types = [DataType.CAMPAIGN, DataType.AD_GROUP, DataType.KEYWORD, DataType.AD]
        
        # معالجة البيانات لكل حساب
        account_summaries = []
        total_stats = {
            'campaigns': 0,
            'ad_groups': 0,
            'keywords': 0,
            'ads': 0,
            'impressions': 0,
            'clicks': 0,
            'conversions': 0.0,
            'cost': 0.0
        }
        
        # معالجة متزامنة للحسابات
        tasks = []
        for account in accounts:
            task = self._process_account_data(account, data_types, date_range)
            tasks.append(task)
        
        # تنفيذ المهام
        account_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # تجميع النتائج
        active_accounts = 0
        for i, result in enumerate(account_results):
            if isinstance(result, Exception):
                logger.error(f"فشل في معالجة الحساب {accounts[i].customer_id}: {result}")
                continue
            
            if result:
                account_summaries.append(result)
                active_accounts += 1
                
                # تجميع الإحصائيات
                for key in total_stats:
                    total_stats[key] += result.get(key, 0)
        
        # حساب المتوسطات
        average_ctr = (total_stats['clicks'] / total_stats['impressions'] * 100) if total_stats['impressions'] > 0 else 0
        average_cpc = (total_stats['cost'] / total_stats['clicks']) if total_stats['clicks'] > 0 else 0
        average_conversion_rate = (total_stats['conversions'] / total_stats['clicks'] * 100) if total_stats['clicks'] > 0 else 0
        
        # إنشاء الملخص
        summary = MCCDataSummary(
            mcc_id=self.mcc_manager.mcc_customer_id if self.mcc_manager else "unknown",
            total_accounts=len(accounts),
            active_accounts=active_accounts,
            total_campaigns=total_stats['campaigns'],
            total_ad_groups=total_stats['ad_groups'],
            total_keywords=total_stats['keywords'],
            total_ads=total_stats['ads'],
            total_impressions=total_stats['impressions'],
            total_clicks=total_stats['clicks'],
            total_conversions=total_stats['conversions'],
            total_cost=total_stats['cost'],
            average_ctr=round(average_ctr, 2),
            average_cpc=round(average_cpc, 2),
            average_conversion_rate=round(average_conversion_rate, 2),
            account_summaries=account_summaries
        )
        
        logger.info(f"📊 تم إنشاء ملخص MCC: {active_accounts}/{len(accounts)} حساب نشط")
        
        return summary
    
    async def generate_comparative_report(
        self,
        accounts: List['MCCAccount'],
        metrics: List[str],
        date_range: Optional[Tuple[datetime, datetime]] = None
    ) -> Dict[str, Any]:
        """
        إنشاء تقرير مقارن للحسابات
        
        Args:
            accounts: قائمة الحسابات
            metrics: المقاييس المطلوبة
            date_range: نطاق التاريخ
            
        Returns:
            Dict[str, Any]: التقرير المقارن
        """
        logger.info(f"📈 إنشاء تقرير مقارن لـ {len(accounts)} حساب")
        
        # جمع البيانات لكل حساب
        account_data = {}
        for account in accounts:
            try:
                data = await self._get_account_metrics(account, metrics, date_range)
                account_data[account.customer_id] = {
                    'name': account.name,
                    'data': data
                }
            except Exception as e:
                logger.error(f"فشل في جمع بيانات الحساب {account.customer_id}: {e}")
                continue
        
        # تحليل البيانات
        analysis = {
            'summary': self._analyze_account_performance(account_data, metrics),
            'rankings': self._rank_accounts(account_data, metrics),
            'trends': self._identify_trends(account_data, metrics),
            'recommendations': self._generate_recommendations(account_data, metrics),
            'detailed_data': account_data
        }
        
        return {
            'report_id': f"comparative_{int(datetime.now().timestamp())}",
            'generated_at': datetime.now().isoformat(),
            'accounts_count': len(accounts),
            'metrics': metrics,
            'date_range': {
                'start': date_range[0].isoformat() if date_range else None,
                'end': date_range[1].isoformat() if date_range else None
            },
            'analysis': analysis
        }
    
    async def _process_by_type(
        self,
        df: pd.DataFrame,
        data_type: DataType,
        options: Dict[str, Any]
    ) -> pd.DataFrame:
        """معالجة البيانات حسب النوع"""
        
        if data_type == DataType.CAMPAIGN:
            return await self._process_campaign_data(df, options)
        elif data_type == DataType.AD_GROUP:
            return await self._process_ad_group_data(df, options)
        elif data_type == DataType.KEYWORD:
            return await self._process_keyword_data(df, options)
        elif data_type == DataType.AD:
            return await self._process_ad_data(df, options)
        else:
            # معالجة عامة
            return await self._process_generic_data(df, options)
    
    async def _process_campaign_data(self, df: pd.DataFrame, options: Dict[str, Any]) -> pd.DataFrame:
        """معالجة بيانات الحملات"""
        processed_df = df.copy()
        
        # تنظيف البيانات
        processed_df = processed_df.dropna(subset=['campaign_id', 'campaign_name'])
        
        # تحويل الأنواع
        numeric_columns = ['impressions', 'clicks', 'cost', 'conversions']
        for col in numeric_columns:
            if col in processed_df.columns:
                processed_df[col] = pd.to_numeric(processed_df[col], errors='coerce').fillna(0)
        
        # حساب المقاييس المشتقة
        if 'impressions' in processed_df.columns and 'clicks' in processed_df.columns:
            processed_df['ctr'] = (processed_df['clicks'] / processed_df['impressions'] * 100).fillna(0)
        
        if 'cost' in processed_df.columns and 'clicks' in processed_df.columns:
            processed_df['cpc'] = (processed_df['cost'] / processed_df['clicks']).fillna(0)
        
        if 'conversions' in processed_df.columns and 'clicks' in processed_df.columns:
            processed_df['conversion_rate'] = (processed_df['conversions'] / processed_df['clicks'] * 100).fillna(0)
        
        return processed_df
    
    async def _process_ad_group_data(self, df: pd.DataFrame, options: Dict[str, Any]) -> pd.DataFrame:
        """معالجة بيانات مجموعات الإعلانات"""
        processed_df = df.copy()
        
        # تنظيف البيانات
        processed_df = processed_df.dropna(subset=['ad_group_id', 'ad_group_name'])
        
        # معالجة مشابهة للحملات
        return await self._process_campaign_data(processed_df, options)
    
    async def _process_keyword_data(self, df: pd.DataFrame, options: Dict[str, Any]) -> pd.DataFrame:
        """معالجة بيانات الكلمات المفتاحية"""
        processed_df = df.copy()
        
        # تنظيف البيانات
        processed_df = processed_df.dropna(subset=['keyword'])
        
        # تنظيف الكلمات المفتاحية
        processed_df['keyword_clean'] = processed_df['keyword'].str.lower().str.strip()
        
        # تصنيف نوع المطابقة
        if 'match_type' not in processed_df.columns:
            processed_df['match_type'] = 'BROAD'
        
        return processed_df
    
    async def _process_ad_data(self, df: pd.DataFrame, options: Dict[str, Any]) -> pd.DataFrame:
        """معالجة بيانات الإعلانات"""
        processed_df = df.copy()
        
        # تنظيف البيانات
        processed_df = processed_df.dropna(subset=['ad_id'])
        
        # تحليل محتوى الإعلان
        if 'headline' in processed_df.columns:
            processed_df['headline_length'] = processed_df['headline'].str.len()
        
        if 'description' in processed_df.columns:
            processed_df['description_length'] = processed_df['description'].str.len()
        
        return processed_df
    
    async def _process_generic_data(self, df: pd.DataFrame, options: Dict[str, Any]) -> pd.DataFrame:
        """معالجة عامة للبيانات"""
        processed_df = df.copy()
        
        # إزالة الصفوف الفارغة
        processed_df = processed_df.dropna(how='all')
        
        # تحويل الأعمدة الرقمية
        for col in processed_df.columns:
            if processed_df[col].dtype == 'object':
                # محاولة تحويل إلى رقم
                numeric_series = pd.to_numeric(processed_df[col], errors='coerce')
                if not numeric_series.isna().all():
                    processed_df[col] = numeric_series
        
        return processed_df
    
    async def _assess_data_quality(self, df: pd.DataFrame, data_type: DataType) -> DataQualityMetrics:
        """تقييم جودة البيانات"""
        metrics = DataQualityMetrics()
        
        if df.empty:
            return metrics
        
        # اكتمال البيانات
        total_cells = df.size
        non_null_cells = df.count().sum()
        metrics.completeness = non_null_cells / total_cells if total_cells > 0 else 0
        
        # دقة البيانات (تحقق أساسي)
        accuracy_score = 1.0
        
        # فحص القيم الرقمية السالبة في الأعمدة التي يجب أن تكون موجبة
        positive_columns = ['impressions', 'clicks', 'cost', 'conversions']
        for col in positive_columns:
            if col in df.columns:
                negative_count = (df[col] < 0).sum()
                if negative_count > 0:
                    accuracy_score -= 0.1
        
        metrics.accuracy = max(0, accuracy_score)
        
        # اتساق البيانات
        consistency_score = 1.0
        
        # فحص اتساق CTR
        if all(col in df.columns for col in ['impressions', 'clicks', 'ctr']):
            calculated_ctr = (df['clicks'] / df['impressions'] * 100).fillna(0)
            ctr_diff = abs(df['ctr'] - calculated_ctr).mean()
            if ctr_diff > 1:  # فرق أكثر من 1%
                consistency_score -= 0.2
        
        metrics.consistency = max(0, consistency_score)
        
        # حداثة البيانات
        if 'date' in df.columns:
            try:
                latest_date = pd.to_datetime(df['date']).max()
                days_old = (datetime.now() - latest_date).days
                metrics.timeliness = max(0, 1 - (days_old / 30))  # تقل الحداثة مع الوقت
            except:
                metrics.timeliness = 0.5  # قيمة افتراضية
        else:
            metrics.timeliness = 0.8  # افتراض أن البيانات حديثة
        
        # صحة البيانات
        validity_score = 1.0
        
        # فحص صحة معرفات العملاء
        if 'customer_id' in df.columns:
            invalid_ids = df['customer_id'].astype(str).str.len() != 10
            if invalid_ids.any():
                validity_score -= 0.2
        
        metrics.validity = max(0, validity_score)
        
        # تفرد البيانات
        if 'id' in df.columns or f'{data_type.value}_id' in df.columns:
            id_col = 'id' if 'id' in df.columns else f'{data_type.value}_id'
            unique_ratio = df[id_col].nunique() / len(df)
            metrics.uniqueness = unique_ratio
        else:
            metrics.uniqueness = 0.9  # قيمة افتراضية
        
        return metrics
    
    async def _process_account_data(
        self,
        account: 'MCCAccount',
        data_types: List[DataType],
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> Optional[Dict[str, Any]]:
        """معالجة بيانات حساب واحد"""
        try:
            # محاكاة جمع البيانات من Google Ads API
            account_data = {
                'customer_id': account.customer_id,
                'name': account.name,
                'campaigns': 10,  # محاكاة
                'ad_groups': 30,
                'keywords': 200,
                'ads': 50,
                'impressions': 10000,
                'clicks': 500,
                'conversions': 25.0,
                'cost': 1000.0
            }
            
            return account_data
            
        except Exception as e:
            logger.error(f"فشل في معالجة بيانات الحساب {account.customer_id}: {e}")
            return None
    
    async def _get_account_metrics(
        self,
        account: 'MCCAccount',
        metrics: List[str],
        date_range: Optional[Tuple[datetime, datetime]]
    ) -> Dict[str, float]:
        """الحصول على مقاييس الحساب"""
        # إرجاع بيانات فارغة بدلاً من البيانات الوهمية
        empty_data = {
            'impressions': 0,
            'clicks': 0,
            'cost': 0.0,
            'conversions': 0.0,
            'ctr': 0.0,
            'cpc': 0.0,
            'conversion_rate': 0.0
        }
        
        return {metric: empty_data.get(metric, 0) for metric in metrics}
    
    def _analyze_account_performance(self, account_data: Dict[str, Any], metrics: List[str]) -> Dict[str, Any]:
        """تحليل أداء الحسابات"""
        if not account_data:
            return {}
        
        analysis = {}
        
        for metric in metrics:
            values = [data['data'].get(metric, 0) for data in account_data.values()]
            
            if values:
                analysis[metric] = {
                    'average': statistics.mean(values),
                    'median': statistics.median(values),
                    'min': min(values),
                    'max': max(values),
                    'std_dev': statistics.stdev(values) if len(values) > 1 else 0
                }
        
        return analysis
    
    def _rank_accounts(self, account_data: Dict[str, Any], metrics: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """ترتيب الحسابات حسب المقاييس"""
        rankings = {}
        
        for metric in metrics:
            account_scores = []
            
            for customer_id, data in account_data.items():
                score = data['data'].get(metric, 0)
                account_scores.append({
                    'customer_id': customer_id,
                    'name': data['name'],
                    'score': score
                })
            
            # ترتيب تنازلي
            account_scores.sort(key=lambda x: x['score'], reverse=True)
            rankings[metric] = account_scores
        
        return rankings
    
    def _identify_trends(self, account_data: Dict[str, Any], metrics: List[str]) -> Dict[str, Any]:
        """تحديد الاتجاهات"""
        # تحليل أساسي للاتجاهات
        trends = {}
        
        for metric in metrics:
            values = [data['data'].get(metric, 0) for data in account_data.values()]
            
            if values:
                avg_value = statistics.mean(values)
                trends[metric] = {
                    'trend': 'stable',  # محاكاة
                    'average': avg_value,
                    'variance': statistics.variance(values) if len(values) > 1 else 0
                }
        
        return trends
    
    def _generate_recommendations(self, account_data: Dict[str, Any], metrics: List[str]) -> List[str]:
        """إنشاء توصيات"""
        recommendations = []
        
        # توصيات أساسية
        if 'ctr' in metrics:
            ctr_values = [data['data'].get('ctr', 0) for data in account_data.values()]
            avg_ctr = statistics.mean(ctr_values) if ctr_values else 0
            
            if avg_ctr < 2:
                recommendations.append("معدل النقر منخفض - يُنصح بتحسين الإعلانات والكلمات المفتاحية")
        
        if 'conversion_rate' in metrics:
            conv_values = [data['data'].get('conversion_rate', 0) for data in account_data.values()]
            avg_conv = statistics.mean(conv_values) if conv_values else 0
            
            if avg_conv < 3:
                recommendations.append("معدل التحويل منخفض - يُنصح بتحسين صفحات الهبوط")
        
        return recommendations
    
    def _cache_result(self, key: str, data: pd.DataFrame):
        """حفظ النتيجة في الذاكرة المؤقتة"""
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.now()
        }
        
        # تنظيف الذاكرة المؤقتة من البيانات القديمة
        self._cleanup_cache()
    
    def _cleanup_cache(self):
        """تنظيف الذاكرة المؤقتة"""
        current_time = datetime.now()
        expired_keys = []
        
        for key, value in self.cache.items():
            if current_time - value['timestamp'] > self.cache_ttl:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.cache[key]
    
    def _update_average_processing_time(self, processing_time: float):
        """تحديث متوسط وقت المعالجة"""
        current_avg = self.performance_stats['average_processing_time']
        total_ops = self.performance_stats['successful_operations'] + self.performance_stats['failed_operations']
        
        if total_ops == 1:
            self.performance_stats['average_processing_time'] = processing_time
        else:
            new_avg = ((current_avg * (total_ops - 1)) + processing_time) / total_ops
            self.performance_stats['average_processing_time'] = new_avg
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات الأداء"""
        stats = self.performance_stats.copy()
        total_ops = stats['successful_operations'] + stats['failed_operations']
        stats['success_rate'] = (stats['successful_operations'] / total_ops * 100) if total_ops > 0 else 0
        stats['cache_hit_rate'] = (stats['cache_hits'] / (stats['cache_hits'] + stats['cache_misses']) * 100) if (stats['cache_hits'] + stats['cache_misses']) > 0 else 0
        return stats
    
    def reset_performance_stats(self):
        """إعادة تعيين إحصائيات الأداء"""
        self.performance_stats = {
            'total_processed': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'average_processing_time': 0.0,
            'total_data_volume': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        logger.info("📊 تم إعادة تعيين إحصائيات الأداء")

# دوال مساعدة للاستخدام السريع
def get_data_processor(mcc_manager: Optional['MCCManager'] = None) -> DataProcessor:
    """الحصول على معالج البيانات"""
    return DataProcessor(mcc_manager=mcc_manager)

async def process_campaign_data(data: List[Dict[str, Any]]) -> ProcessingResult:
    """معالجة بيانات الحملات"""
    processor = get_data_processor()
    return await processor.process_data(data, DataType.CAMPAIGN)

async def process_mcc_data(mcc_manager: 'MCCManager') -> MCCDataSummary:
    """معالجة بيانات MCC"""
    processor = get_data_processor(mcc_manager)
    return await processor.process_mcc_accounts_data()

# تصدير الوحدات المهمة
__all__ = [
    'DataProcessor',
    'DataType',
    'ProcessingStatus',
    'QualityLevel',
    'DataQualityMetrics',
    'ProcessingResult',
    'MCCDataSummary',
    'get_data_processor',
    'process_campaign_data',
    'process_mcc_data'
]
