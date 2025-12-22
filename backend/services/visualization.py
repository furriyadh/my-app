"""
Visualization Module
وحدة التصور والرسوم البيانية المتقدمة

يوفر إنشاء رسوم بيانية ولوحات معلومات تفاعلية شاملة بما في ذلك:
- رسوم بيانية للأداء والاتجاهات
- لوحات معلومات تفاعلية
- تصور البيانات الزمنية
- رسوم المقارنات والتحليلات
- خرائط الحرارة والتوزيعات
- رسوم الشبكات والعلاقات
- تصدير الرسوم بتنسيقات متعددة
- رسوم متجاوبة للويب والموبايل

Author: Google Ads AI Platform Team
Version: 2.4.0
Security Level: Enterprise
Performance: High-Performance Visualization Engine
"""

import os
import asyncio
import json
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps, lru_cache
from concurrent.futures import ThreadPoolExecutor
import threading
from collections import defaultdict, Counter
import hashlib
import uuid
import base64
import io
import logging
import math

# Visualization imports
try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.figure import Figure
    from matplotlib.backends.backend_agg import FigureCanvasAgg
    import seaborn as sns
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

try:
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.subplots import make_subplots
    import plotly.offline as pyo
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False

# Local imports
try:
    from utils.helpers import (
        generate_unique_id, sanitize_text, calculate_hash,
        format_timestamp, compress_data, decompress_data
    )
    HELPERS_AVAILABLE = True
except ImportError:
    HELPERS_AVAILABLE = False

try:
    from utils.redis_config import cache_set, cache_get, cache_delete
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# إعداد التسجيل المتقدم
logger = logging.getLogger(__name__)

# إعداد Thread Pool للرسم المتوازي
visualization_executor = ThreadPoolExecutor(max_workers=15, thread_name_prefix="viz_worker")

class ChartType(Enum):
    """أنواع الرسوم البيانية"""
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    SCATTER_PLOT = "scatter_plot"
    HEATMAP = "heatmap"
    HISTOGRAM = "histogram"
    BOX_PLOT = "box_plot"
    AREA_CHART = "area_chart"
    DONUT_CHART = "donut_chart"
    GAUGE_CHART = "gauge_chart"
    FUNNEL_CHART = "funnel_chart"
    TREEMAP = "treemap"
    SUNBURST = "sunburst"
    WATERFALL = "waterfall"
    CANDLESTICK = "candlestick"

class DashboardType(Enum):
    """أنواع لوحات المعلومات"""
    PERFORMANCE_DASHBOARD = "performance_dashboard"
    CAMPAIGN_DASHBOARD = "campaign_dashboard"
    KEYWORD_DASHBOARD = "keyword_dashboard"
    AUDIENCE_DASHBOARD = "audience_dashboard"
    FINANCIAL_DASHBOARD = "financial_dashboard"
    TREND_DASHBOARD = "trend_dashboard"
    COMPARISON_DASHBOARD = "comparison_dashboard"
    REAL_TIME_DASHBOARD = "real_time_dashboard"

class ExportFormat(Enum):
    """تنسيقات التصدير"""
    PNG = "png"
    JPG = "jpg"
    SVG = "svg"
    PDF = "pdf"
    HTML = "html"
    JSON = "json"

@dataclass
class ChartConfig:
    """إعدادات الرسم البياني"""
    chart_id: str
    chart_type: ChartType
    title: str
    data: Dict[str, Any]
    x_axis: str
    y_axis: Union[str, List[str]]
    color_scheme: str = "default"
    width: int = 800
    height: int = 600
    interactive: bool = True
    show_legend: bool = True
    show_grid: bool = True
    annotations: List[Dict[str, Any]] = field(default_factory=list)
    styling: Dict[str, Any] = field(default_factory=dict)
    export_format: ExportFormat = ExportFormat.HTML

@dataclass
class DashboardConfig:
    """إعدادات لوحة المعلومات"""
    dashboard_id: str
    dashboard_type: DashboardType
    title: str
    charts: List[ChartConfig]
    layout: Dict[str, Any] = field(default_factory=dict)
    refresh_interval: int = 300  # ثواني
    filters: Dict[str, Any] = field(default_factory=dict)
    responsive: bool = True
    theme: str = "light"

@dataclass
class VisualizationResult:
    """نتيجة التصور"""
    visualization_id: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    output_path: Optional[str] = None
    output_data: Optional[str] = None  # Base64 encoded
    metadata: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    execution_time_seconds: float = 0.0

class ChartGenerator:
    """مولد الرسوم البيانية"""
    
    def __init__(self):
        """تهيئة مولد الرسوم"""
        self.chart_cache = {}
        self.color_schemes = self._initialize_color_schemes()
        self.chart_templates = self._initialize_chart_templates()
    
    def _initialize_color_schemes(self) -> Dict[str, List[str]]:
        """تهيئة أنظمة الألوان"""
        return {
            'default': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
            'google': ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01', '#9aa0a6'],
            'professional': ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#592E83', '#1B998B'],
            'pastel': ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E1BAFF'],
            'dark': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            'corporate': ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a']
        }
    
    def _initialize_chart_templates(self) -> Dict[str, Dict[str, Any]]:
        """تهيئة قوالب الرسوم"""
        return {
            'performance_line': {
                'layout': {
                    'showlegend': True,
                    'hovermode': 'x unified',
                    'xaxis': {'showgrid': True},
                    'yaxis': {'showgrid': True}
                }
            },
            'comparison_bar': {
                'layout': {
                    'barmode': 'group',
                    'showlegend': True
                }
            },
            'distribution_pie': {
                'layout': {
                    'showlegend': True,
                    'annotations': []
                }
            }
        }
    
    async def generate_chart(self, config: ChartConfig) -> VisualizationResult:
        """إنشاء رسم بياني"""
        try:
            result = VisualizationResult(
                visualization_id=config.chart_id,
                status="running",
                start_time=datetime.now(timezone.utc)
            )
            
            # فحص الكاش
            cache_key = self._generate_cache_key(config)
            cached_result = await self._get_cached_chart(cache_key)
            if cached_result:
                logger.info(f"🎯 استخدام الرسم المحفوظ {config.chart_id}")
                return cached_result
            
            # اختيار مكتبة الرسم
            if config.interactive and PLOTLY_AVAILABLE:
                chart_data = await self._generate_plotly_chart(config)
            elif MATPLOTLIB_AVAILABLE:
                chart_data = await self._generate_matplotlib_chart(config)
            else:
                raise Exception("لا توجد مكتبات رسم متاحة")
            
            # تحديث النتيجة
            result.status = "completed"
            result.end_time = datetime.now(timezone.utc)
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.output_data = chart_data
            result.metadata = {
                'chart_type': config.chart_type.value,
                'width': config.width,
                'height': config.height,
                'interactive': config.interactive
            }
            
            # حفظ في الكاش
            await self._cache_chart(cache_key, result)
            
            logger.info(f"✅ تم إنشاء الرسم البياني {config.chart_id}")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء الرسم البياني: {e}")
            result.status = "failed"
            result.errors.append(str(e))
            return result
    
    async def _generate_plotly_chart(self, config: ChartConfig) -> str:
        """إنشاء رسم بياني باستخدام Plotly"""
        try:
            data = config.data
            colors = self.color_schemes.get(config.color_scheme, self.color_schemes['default'])
            
            if config.chart_type == ChartType.LINE_CHART:
                fig = await self._create_plotly_line_chart(data, config, colors)
            elif config.chart_type == ChartType.BAR_CHART:
                fig = await self._create_plotly_bar_chart(data, config, colors)
            elif config.chart_type == ChartType.PIE_CHART:
                fig = await self._create_plotly_pie_chart(data, config, colors)
            elif config.chart_type == ChartType.SCATTER_PLOT:
                fig = await self._create_plotly_scatter_plot(data, config, colors)
            elif config.chart_type == ChartType.HEATMAP:
                fig = await self._create_plotly_heatmap(data, config, colors)
            elif config.chart_type == ChartType.AREA_CHART:
                fig = await self._create_plotly_area_chart(data, config, colors)
            elif config.chart_type == ChartType.GAUGE_CHART:
                fig = await self._create_plotly_gauge_chart(data, config, colors)
            else:
                fig = await self._create_plotly_line_chart(data, config, colors)  # افتراضي
            
            # تطبيق التخصيصات
            fig.update_layout(
                title=config.title,
                width=config.width,
                height=config.height,
                showlegend=config.show_legend,
                **config.styling
            )
            
            # إضافة التعليقات التوضيحية
            for annotation in config.annotations:
                fig.add_annotation(**annotation)
            
            # تصدير
            if config.export_format == ExportFormat.HTML:
                return fig.to_html(include_plotlyjs=True, div_id=config.chart_id)
            elif config.export_format == ExportFormat.JSON:
                return fig.to_json()
            else:
                # تصدير كصورة
                img_bytes = fig.to_image(format=config.export_format.value)
                return base64.b64encode(img_bytes).decode()
                
        except Exception as e:
            logger.error(f"خطأ في إنشاء رسم Plotly: {e}")
            raise
    
    async def _create_plotly_line_chart(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم خطي بـ Plotly"""
        fig = go.Figure()
        
        x_data = data.get(config.x_axis, [])
        
        if isinstance(config.y_axis, list):
            for i, y_col in enumerate(config.y_axis):
                y_data = data.get(y_col, [])
                fig.add_trace(go.Scatter(
                    x=x_data,
                    y=y_data,
                    mode='lines+markers',
                    name=y_col,
                    line=dict(color=colors[i % len(colors)]),
                    hovertemplate=f'<b>{y_col}</b><br>%{{x}}: %{{y}}<extra></extra>'
                ))
        else:
            y_data = data.get(config.y_axis, [])
            fig.add_trace(go.Scatter(
                x=x_data,
                y=y_data,
                mode='lines+markers',
                name=config.y_axis,
                line=dict(color=colors[0]),
                hovertemplate=f'<b>{config.y_axis}</b><br>%{{x}}: %{{y}}<extra></extra>'
            ))
        
        fig.update_layout(
            xaxis_title=config.x_axis,
            yaxis_title=config.y_axis if isinstance(config.y_axis, str) else "القيم",
            hovermode='x unified'
        )
        
        return fig
    
    async def _create_plotly_bar_chart(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم أعمدة بـ Plotly"""
        fig = go.Figure()
        
        x_data = data.get(config.x_axis, [])
        
        if isinstance(config.y_axis, list):
            for i, y_col in enumerate(config.y_axis):
                y_data = data.get(y_col, [])
                fig.add_trace(go.Bar(
                    x=x_data,
                    y=y_data,
                    name=y_col,
                    marker_color=colors[i % len(colors)],
                    hovertemplate=f'<b>{y_col}</b><br>%{{x}}: %{{y}}<extra></extra>'
                ))
        else:
            y_data = data.get(config.y_axis, [])
            fig.add_trace(go.Bar(
                x=x_data,
                y=y_data,
                name=config.y_axis,
                marker_color=colors[0],
                hovertemplate=f'<b>{config.y_axis}</b><br>%{{x}}: %{{y}}<extra></extra>'
            ))
        
        fig.update_layout(
            xaxis_title=config.x_axis,
            yaxis_title=config.y_axis if isinstance(config.y_axis, str) else "القيم",
            barmode='group'
        )
        
        return fig
    
    async def _create_plotly_pie_chart(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم دائري بـ Plotly"""
        labels = data.get(config.x_axis, [])
        values = data.get(config.y_axis, [])
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=0.3,  # donut style
            marker=dict(colors=colors),
            hovertemplate='<b>%{label}</b><br>القيمة: %{value}<br>النسبة: %{percent}<extra></extra>'
        )])
        
        return fig
    
    async def _create_plotly_scatter_plot(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم نقطي بـ Plotly"""
        fig = go.Figure()
        
        x_data = data.get(config.x_axis, [])
        y_data = data.get(config.y_axis, [])
        
        fig.add_trace(go.Scatter(
            x=x_data,
            y=y_data,
            mode='markers',
            marker=dict(
                color=colors[0],
                size=8,
                opacity=0.7
            ),
            hovertemplate=f'<b>{config.x_axis}</b>: %{{x}}<br><b>{config.y_axis}</b>: %{{y}}<extra></extra>'
        ))
        
        fig.update_layout(
            xaxis_title=config.x_axis,
            yaxis_title=config.y_axis
        )
        
        return fig
    
    async def _create_plotly_heatmap(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء خريطة حرارية بـ Plotly"""
        # افتراض أن البيانات في شكل مصفوفة
        z_data = data.get('values', [[]])
        x_labels = data.get('x_labels', [])
        y_labels = data.get('y_labels', [])
        
        fig = go.Figure(data=go.Heatmap(
            z=z_data,
            x=x_labels,
            y=y_labels,
            colorscale='Viridis',
            hovertemplate='<b>X</b>: %{x}<br><b>Y</b>: %{y}<br><b>القيمة</b>: %{z}<extra></extra>'
        ))
        
        return fig
    
    async def _create_plotly_area_chart(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم مساحي بـ Plotly"""
        fig = go.Figure()
        
        x_data = data.get(config.x_axis, [])
        
        if isinstance(config.y_axis, list):
            for i, y_col in enumerate(config.y_axis):
                y_data = data.get(y_col, [])
                fig.add_trace(go.Scatter(
                    x=x_data,
                    y=y_data,
                    fill='tonexty' if i > 0 else 'tozeroy',
                    name=y_col,
                    line=dict(color=colors[i % len(colors)]),
                    hovertemplate=f'<b>{y_col}</b><br>%{{x}}: %{{y}}<extra></extra>'
                ))
        else:
            y_data = data.get(config.y_axis, [])
            fig.add_trace(go.Scatter(
                x=x_data,
                y=y_data,
                fill='tozeroy',
                name=config.y_axis,
                line=dict(color=colors[0]),
                hovertemplate=f'<b>{config.y_axis}</b><br>%{{x}}: %{{y}}<extra></extra>'
            ))
        
        return fig
    
    async def _create_plotly_gauge_chart(self, data: Dict[str, Any], config: ChartConfig, colors: List[str]) -> go.Figure:
        """إنشاء رسم مقياس بـ Plotly"""
        value = data.get('value', 0)
        max_value = data.get('max_value', 100)
        
        fig = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=value,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': config.title},
            delta={'reference': max_value * 0.8},
            gauge={
                'axis': {'range': [None, max_value]},
                'bar': {'color': colors[0]},
                'steps': [
                    {'range': [0, max_value * 0.5], 'color': "lightgray"},
                    {'range': [max_value * 0.5, max_value * 0.8], 'color': "gray"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': max_value * 0.9
                }
            }
        ))
        
        return fig
    
    async def _generate_matplotlib_chart(self, config: ChartConfig) -> str:
        """إنشاء رسم بياني باستخدام Matplotlib"""
        try:
            plt.style.use('seaborn-v0_8' if hasattr(plt.style, 'seaborn-v0_8') else 'default')
            
            fig, ax = plt.subplots(figsize=(config.width/100, config.height/100))
            
            data = config.data
            colors = self.color_schemes.get(config.color_scheme, self.color_schemes['default'])
            
            if config.chart_type == ChartType.LINE_CHART:
                await self._create_matplotlib_line_chart(ax, data, config, colors)
            elif config.chart_type == ChartType.BAR_CHART:
                await self._create_matplotlib_bar_chart(ax, data, config, colors)
            elif config.chart_type == ChartType.PIE_CHART:
                await self._create_matplotlib_pie_chart(ax, data, config, colors)
            elif config.chart_type == ChartType.SCATTER_PLOT:
                await self._create_matplotlib_scatter_plot(ax, data, config, colors)
            elif config.chart_type == ChartType.HISTOGRAM:
                await self._create_matplotlib_histogram(ax, data, config, colors)
            else:
                await self._create_matplotlib_line_chart(ax, data, config, colors)
            
            # تطبيق التخصيصات
            ax.set_title(config.title, fontsize=14, fontweight='bold')
            ax.grid(config.show_grid, alpha=0.3)
            
            if config.show_legend:
                ax.legend()
            
            plt.tight_layout()
            
            # تصدير
            buffer = io.BytesIO()
            if config.export_format == ExportFormat.PNG:
                plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            elif config.export_format == ExportFormat.SVG:
                plt.savefig(buffer, format='svg', bbox_inches='tight')
            else:
                plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            
            buffer.seek(0)
            image_data = base64.b64encode(buffer.getvalue()).decode()
            
            plt.close(fig)
            return image_data
            
        except Exception as e:
            logger.error(f"خطأ في إنشاء رسم Matplotlib: {e}")
            raise
    
    async def _create_matplotlib_line_chart(self, ax, data: Dict[str, Any], config: ChartConfig, colors: List[str]):
        """إنشاء رسم خطي بـ Matplotlib"""
        x_data = data.get(config.x_axis, [])
        
        if isinstance(config.y_axis, list):
            for i, y_col in enumerate(config.y_axis):
                y_data = data.get(y_col, [])
                ax.plot(x_data, y_data, label=y_col, color=colors[i % len(colors)], marker='o')
        else:
            y_data = data.get(config.y_axis, [])
            ax.plot(x_data, y_data, label=config.y_axis, color=colors[0], marker='o')
        
        ax.set_xlabel(config.x_axis)
        ax.set_ylabel(config.y_axis if isinstance(config.y_axis, str) else "القيم")
    
    async def _create_matplotlib_bar_chart(self, ax, data: Dict[str, Any], config: ChartConfig, colors: List[str]):
        """إنشاء رسم أعمدة بـ Matplotlib"""
        x_data = data.get(config.x_axis, [])
        
        if isinstance(config.y_axis, list):
            x_pos = np.arange(len(x_data))
            width = 0.8 / len(config.y_axis)
            
            for i, y_col in enumerate(config.y_axis):
                y_data = data.get(y_col, [])
                ax.bar(x_pos + i * width, y_data, width, label=y_col, color=colors[i % len(colors)])
            
            ax.set_xticks(x_pos + width * (len(config.y_axis) - 1) / 2)
            ax.set_xticklabels(x_data)
        else:
            y_data = data.get(config.y_axis, [])
            ax.bar(x_data, y_data, color=colors[0])
        
        ax.set_xlabel(config.x_axis)
        ax.set_ylabel(config.y_axis if isinstance(config.y_axis, str) else "القيم")
    
    async def _create_matplotlib_pie_chart(self, ax, data: Dict[str, Any], config: ChartConfig, colors: List[str]):
        """إنشاء رسم دائري بـ Matplotlib"""
        labels = data.get(config.x_axis, [])
        values = data.get(config.y_axis, [])
        
        ax.pie(values, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        ax.axis('equal')
    
    async def _create_matplotlib_scatter_plot(self, ax, data: Dict[str, Any], config: ChartConfig, colors: List[str]):
        """إنشاء رسم نقطي بـ Matplotlib"""
        x_data = data.get(config.x_axis, [])
        y_data = data.get(config.y_axis, [])
        
        ax.scatter(x_data, y_data, color=colors[0], alpha=0.7)
        ax.set_xlabel(config.x_axis)
        ax.set_ylabel(config.y_axis)
    
    async def _create_matplotlib_histogram(self, ax, data: Dict[str, Any], config: ChartConfig, colors: List[str]):
        """إنشاء رسم تكراري بـ Matplotlib"""
        values = data.get(config.y_axis, [])
        
        ax.hist(values, bins=20, color=colors[0], alpha=0.7, edgecolor='black')
        ax.set_xlabel(config.y_axis)
        ax.set_ylabel('التكرار')
    
    def _generate_cache_key(self, config: ChartConfig) -> str:
        """توليد مفتاح الكاش"""
        try:
            config_str = json.dumps(asdict(config), sort_keys=True, default=str)
            if HELPERS_AVAILABLE:
                return f"chart_{calculate_hash(config_str)}"
            else:
                return f"chart_{hashlib.md5(config_str.encode()).hexdigest()}"
        except Exception as e:
            logger.error(f"خطأ في توليد مفتاح الكاش: {e}")
            return f"chart_{config.chart_id}"
    
    async def _get_cached_chart(self, cache_key: str) -> Optional[VisualizationResult]:
        """جلب الرسم من الكاش"""
        try:
            if not REDIS_AVAILABLE:
                return None
            
            cached_data = cache_get(cache_key)
            if cached_data:
                return VisualizationResult(**json.loads(cached_data))
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب الرسم من الكاش: {e}")
            return None
    
    async def _cache_chart(self, cache_key: str, result: VisualizationResult):
        """حفظ الرسم في الكاش"""
        try:
            if not REDIS_AVAILABLE:
                return
            
            cache_data = json.dumps(asdict(result), default=str)
            cache_set(cache_key, cache_data, expire=1800)  # 30 دقيقة
            
        except Exception as e:
            logger.error(f"خطأ في حفظ الرسم في الكاش: {e}")

class DashboardBuilder:
    """بناء لوحات المعلومات"""
    
    def __init__(self):
        """تهيئة بناء لوحات المعلومات"""
        self.chart_generator = ChartGenerator()
        self.dashboard_templates = self._initialize_dashboard_templates()
    
    def _initialize_dashboard_templates(self) -> Dict[str, Dict[str, Any]]:
        """تهيئة قوالب لوحات المعلومات"""
        return {
            'performance': {
                'layout': {
                    'grid': {'rows': 2, 'cols': 2},
                    'charts': [
                        {'position': [0, 0], 'type': 'line_chart', 'title': 'الأداء الزمني'},
                        {'position': [0, 1], 'type': 'bar_chart', 'title': 'مقارنة الحملات'},
                        {'position': [1, 0], 'type': 'pie_chart', 'title': 'توزيع التكلفة'},
                        {'position': [1, 1], 'type': 'gauge_chart', 'title': 'مؤشر الأداء'}
                    ]
                }
            },
            'campaign': {
                'layout': {
                    'grid': {'rows': 3, 'cols': 2},
                    'charts': [
                        {'position': [0, 0], 'type': 'line_chart', 'title': 'النقرات والانطباعات'},
                        {'position': [0, 1], 'type': 'area_chart', 'title': 'التكلفة والإيرادات'},
                        {'position': [1, 0], 'type': 'bar_chart', 'title': 'أداء الكلمات المفتاحية'},
                        {'position': [1, 1], 'type': 'heatmap', 'title': 'الأداء حسب الوقت'},
                        {'position': [2, 0], 'type': 'funnel_chart', 'title': 'قمع التحويل'},
                        {'position': [2, 1], 'type': 'scatter_plot', 'title': 'العلاقة بين المقاييس'}
                    ]
                }
            }
        }
    
    async def build_dashboard(self, config: DashboardConfig) -> VisualizationResult:
        """بناء لوحة معلومات"""
        try:
            result = VisualizationResult(
                visualization_id=config.dashboard_id,
                status="running",
                start_time=datetime.now(timezone.utc)
            )
            
            # إنشاء الرسوم البيانية
            chart_results = []
            for chart_config in config.charts:
                chart_result = await self.chart_generator.generate_chart(chart_config)
                if chart_result.status == "completed":
                    chart_results.append(chart_result)
                else:
                    result.warnings.append(f"فشل في إنشاء الرسم {chart_config.chart_id}")
            
            # بناء HTML للوحة المعلومات
            dashboard_html = await self._build_dashboard_html(config, chart_results)
            
            # تحديث النتيجة
            result.status = "completed"
            result.end_time = datetime.now(timezone.utc)
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.output_data = dashboard_html
            result.metadata = {
                'dashboard_type': config.dashboard_type.value,
                'charts_count': len(chart_results),
                'theme': config.theme,
                'responsive': config.responsive
            }
            
            logger.info(f"✅ تم بناء لوحة المعلومات {config.dashboard_id}")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في بناء لوحة المعلومات: {e}")
            result.status = "failed"
            result.errors.append(str(e))
            return result
    
    async def _build_dashboard_html(self, config: DashboardConfig, chart_results: List[VisualizationResult]) -> str:
        """بناء HTML للوحة المعلومات"""
        try:
            # CSS للتصميم
            css_styles = """
            <style>
                .dashboard-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .dashboard-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .chart-container {
                    background: white;
                    border-radius: 10px;
                    padding: 15px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease;
                }
                .chart-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                .chart-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: #333;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                }
                .dashboard-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding: 15px;
                    background: #333;
                    color: white;
                    border-radius: 10px;
                    font-size: 12px;
                }
                @media (max-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .dashboard-container {
                        padding: 10px;
                    }
                }
            </style>
            """
            
            # JavaScript للتفاعل
            javascript = """
            <script>
                function refreshDashboard() {
                    location.reload();
                }
                
                function exportDashboard() {
                    window.print();
                }
                
                // تحديث تلقائي
                setInterval(refreshDashboard, """ + str(config.refresh_interval * 1000) + """);
            </script>
            """
            
            # بناء HTML
            html_parts = [
                "<!DOCTYPE html>",
                "<html dir='rtl' lang='ar'>",
                "<head>",
                "<meta charset='UTF-8'>",
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>",
                f"<title>{config.title}</title>",
                css_styles,
                "</head>",
                "<body>",
                "<div class='dashboard-container'>",
                "<div class='dashboard-header'>",
                f"<h1>{config.title}</h1>",
                f"<p>آخر تحديث: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>",
                "<button onclick='refreshDashboard()' style='margin: 5px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;'>تحديث</button>",
                "<button onclick='exportDashboard()' style='margin: 5px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer;'>تصدير</button>",
                "</div>",
                "<div class='dashboard-grid'>"
            ]
            
            # إضافة الرسوم البيانية
            for i, chart_result in enumerate(chart_results):
                chart_config = config.charts[i] if i < len(config.charts) else None
                chart_title = chart_config.title if chart_config else f"رسم بياني {i+1}"
                
                html_parts.extend([
                    "<div class='chart-container'>",
                    f"<div class='chart-title'>{chart_title}</div>",
                    chart_result.output_data or "",
                    "</div>"
                ])
            
            # إنهاء HTML
            html_parts.extend([
                "</div>",
                "<div class='dashboard-footer'>",
                f"تم إنشاؤها بواسطة Google Ads AI Platform | {datetime.now().strftime('%Y')}",
                "</div>",
                "</div>",
                javascript,
                "</body>",
                "</html>"
            ])
            
            return "\n".join(html_parts)
            
        except Exception as e:
            logger.error(f"خطأ في بناء HTML للوحة المعلومات: {e}")
            return f"<html><body><h1>خطأ في بناء لوحة المعلومات</h1><p>{str(e)}</p></body></html>"

# إنشاء المولدات العامة
chart_generator = ChartGenerator()
dashboard_builder = DashboardBuilder()

# تسجيل معلومات البدء
logger.info(f"🚀 تم تحميل Visualization Module v2.4.0")
logger.info(f"📊 Matplotlib متاح: {MATPLOTLIB_AVAILABLE}")
logger.info(f"📈 Plotly متاح: {PLOTLY_AVAILABLE}")
logger.info(f"⚡ Thread Pool: {visualization_executor._max_workers} workers")

