"""
Optimization Engine Module
وحدة محرك التحسين المتطور

يوفر محرك تحسين شامل ومتقدم لحملات Google Ads بما في ذلك:
- تحسين العروض التلقائي والذكي
- تحسين الميزانيات والتوزيع الأمثل
- تحسين الاستهداف والجماهير
- تحسين نصوص الإعلانات
- تحسين الكلمات المفتاحية
- تحسين الأداء العام للحملات
- التنبؤ بالأداء والتحسين المستمر

Author: Google Ads AI Platform Team
Version: 2.5.0
Security Level: Enterprise
Performance: Real-time Optimization Engine
"""

import os
import asyncio
import aiohttp
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

# Machine Learning imports
try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression, Ridge, Lasso
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.model_selection import train_test_split, GridSearchCV
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

# Optimization libraries
try:
    from scipy.optimize import minimize, differential_evolution, basinhopping
    from scipy.stats import norm, chi2
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

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

# إعداد Thread Pool للعمليات المتوازية
optimization_executor = ThreadPoolExecutor(max_workers=25, thread_name_prefix="opt_worker")

class OptimizationType(Enum):
    """أنواع التحسين"""
    BID_OPTIMIZATION = "bid_optimization"
    BUDGET_OPTIMIZATION = "budget_optimization"
    KEYWORD_OPTIMIZATION = "keyword_optimization"
    AD_COPY_OPTIMIZATION = "ad_copy_optimization"
    AUDIENCE_OPTIMIZATION = "audience_optimization"
    LANDING_PAGE_OPTIMIZATION = "landing_page_optimization"
    SCHEDULE_OPTIMIZATION = "schedule_optimization"
    DEVICE_OPTIMIZATION = "device_optimization"

class OptimizationStrategy(Enum):
    """استراتيجيات التحسين"""
    AGGRESSIVE = "aggressive"
    CONSERVATIVE = "conservative"
    BALANCED = "balanced"
    EXPERIMENTAL = "experimental"
    DATA_DRIVEN = "data_driven"

class OptimizationGoal(Enum):
    """أهداف التحسين"""
    MAXIMIZE_CLICKS = "maximize_clicks"
    MAXIMIZE_IMPRESSIONS = "maximize_impressions"
    MAXIMIZE_CONVERSIONS = "maximize_conversions"
    MAXIMIZE_CONVERSION_VALUE = "maximize_conversion_value"
    TARGET_CPA = "target_cpa"
    TARGET_ROAS = "target_roas"
    MAXIMIZE_CLICKS_WITH_TARGET_CPC = "maximize_clicks_with_target_cpc"
    MINIMIZE_COST = "minimize_cost"

class OptimizationStatus(Enum):
    """حالات التحسين"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

@dataclass
class OptimizationConfig:
    """إعدادات التحسين"""
    optimization_id: str
    optimization_type: OptimizationType
    strategy: OptimizationStrategy
    goal: OptimizationGoal
    target_value: Optional[float] = None
    constraints: Dict[str, Any] = field(default_factory=dict)
    parameters: Dict[str, Any] = field(default_factory=dict)
    max_iterations: int = 100
    convergence_threshold: float = 0.001
    learning_rate: float = 0.01
    exploration_rate: float = 0.1
    confidence_level: float = 0.95
    time_horizon_days: int = 30
    enable_ml_predictions: bool = True
    enable_ab_testing: bool = True
    enable_real_time_updates: bool = True

@dataclass
class OptimizationResult:
    """نتيجة التحسين"""
    optimization_id: str
    status: OptimizationStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    iterations_completed: int = 0
    convergence_achieved: bool = False
    final_objective_value: Optional[float] = None
    improvement_percentage: float = 0.0
    optimized_parameters: Dict[str, Any] = field(default_factory=dict)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    confidence_intervals: Dict[str, Tuple[float, float]] = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    execution_time_seconds: float = 0.0

@dataclass
class PerformanceMetrics:
    """مقاييس الأداء"""
    clicks: int = 0
    impressions: int = 0
    conversions: int = 0
    cost: float = 0.0
    revenue: float = 0.0
    ctr: float = 0.0
    cpc: float = 0.0
    cpa: float = 0.0
    roas: float = 0.0
    quality_score: float = 0.0
    impression_share: float = 0.0
    conversion_rate: float = 0.0

class OptimizationEngine:
    """محرك التحسين الرئيسي"""
    
    def __init__(self):
        """تهيئة محرك التحسين"""
        self.active_optimizations = {}
        self.optimization_history = []
        self.performance_models = {}
        self.optimization_cache = {}
        self.learning_data = defaultdict(list)
        
        # إعداد النماذج التنبؤية
        self._initialize_prediction_models()
        
        # إعداد خوارزميات التحسين
        self._initialize_optimization_algorithms()
    
    def _initialize_prediction_models(self):
        """تهيئة النماذج التنبؤية"""
        try:
            if ML_AVAILABLE:
                # نموذج التنبؤ بـ CTR
                self.performance_models['ctr_predictor'] = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                
                # نموذج التنبؤ بالتحويلات
                self.performance_models['conversion_predictor'] = GradientBoostingRegressor(
                    n_estimators=150,
                    learning_rate=0.1,
                    max_depth=8,
                    random_state=42
                )
                
                # نموذج التنبؤ بالتكلفة
                self.performance_models['cost_predictor'] = Ridge(alpha=1.0)
                
                logger.info("✅ تم تهيئة النماذج التنبؤية")
            else:
                logger.warning("⚠️ مكتبات ML غير متاحة - سيتم استخدام نماذج بسيطة")
                
        except Exception as e:
            logger.error(f"خطأ في تهيئة النماذج التنبؤية: {e}")
    
    def _initialize_optimization_algorithms(self):
        """تهيئة خوارزميات التحسين"""
        try:
            self.optimization_algorithms = {
                'gradient_descent': self._gradient_descent_optimization,
                'genetic_algorithm': self._genetic_algorithm_optimization,
                'simulated_annealing': self._simulated_annealing_optimization,
                'bayesian_optimization': self._bayesian_optimization,
                'particle_swarm': self._particle_swarm_optimization
            }
            
            logger.info("✅ تم تهيئة خوارزميات التحسين")
            
        except Exception as e:
            logger.error(f"خطأ في تهيئة خوارزميات التحسين: {e}")
    
    async def optimize(self, config: OptimizationConfig, 
                      current_data: Dict[str, Any]) -> OptimizationResult:
        """تنفيذ عملية التحسين"""
        try:
            # إنشاء نتيجة التحسين
            result = OptimizationResult(
                optimization_id=config.optimization_id,
                status=OptimizationStatus.RUNNING,
                start_time=datetime.now(timezone.utc)
            )
            
            # حفظ في التحسينات النشطة
            self.active_optimizations[config.optimization_id] = {
                'config': config,
                'result': result,
                'current_data': current_data
            }
            
            # اختيار خوارزمية التحسين
            algorithm = self._select_optimization_algorithm(config)
            
            # تنفيذ التحسين
            optimized_params = await algorithm(config, current_data, result)
            
            # تقييم النتائج
            performance_improvement = await self._evaluate_optimization_results(
                config, current_data, optimized_params
            )
            
            # تحديث النتيجة
            result.status = OptimizationStatus.COMPLETED
            result.end_time = datetime.now(timezone.utc)
            result.execution_time_seconds = (result.end_time - result.start_time).total_seconds()
            result.optimized_parameters = optimized_params
            result.improvement_percentage = performance_improvement
            result.convergence_achieved = True
            
            # توليد التوصيات
            result.recommendations = self._generate_optimization_recommendations(
                config, optimized_params, performance_improvement
            )
            
            # حفظ في التاريخ
            self.optimization_history.append(result)
            if config.optimization_id in self.active_optimizations:
                del self.active_optimizations[config.optimization_id]
            
            # حفظ بيانات التعلم
            self._save_learning_data(config, current_data, result)
            
            logger.info(f"✅ انتهى التحسين {config.optimization_id} - تحسن: {performance_improvement:.2f}%")
            return result
            
        except Exception as e:
            logger.error(f"خطأ في تنفيذ التحسين: {e}")
            result.status = OptimizationStatus.FAILED
            result.warnings.append(str(e))
            return result
    
    def _select_optimization_algorithm(self, config: OptimizationConfig) -> Callable:
        """اختيار خوارزمية التحسين المناسبة"""
        try:
            # اختيار بناءً على نوع التحسين والاستراتيجية
            if config.optimization_type == OptimizationType.BID_OPTIMIZATION:
                if config.strategy == OptimizationStrategy.AGGRESSIVE:
                    return self.optimization_algorithms['genetic_algorithm']
                else:
                    return self.optimization_algorithms['gradient_descent']
            
            elif config.optimization_type == OptimizationType.BUDGET_OPTIMIZATION:
                return self.optimization_algorithms['bayesian_optimization']
            
            elif config.optimization_type == OptimizationType.KEYWORD_OPTIMIZATION:
                return self.optimization_algorithms['particle_swarm']
            
            else:
                # خوارزمية افتراضية
                return self.optimization_algorithms['gradient_descent']
                
        except Exception as e:
            logger.error(f"خطأ في اختيار خوارزمية التحسين: {e}")
            return self.optimization_algorithms['gradient_descent']
    
    async def _gradient_descent_optimization(self, config: OptimizationConfig, 
                                           current_data: Dict[str, Any],
                                           result: OptimizationResult) -> Dict[str, Any]:
        """تحسين بخوارزمية Gradient Descent"""
        try:
            # استخراج المعاملات الحالية
            current_params = self._extract_optimization_parameters(config, current_data)
            
            # تهيئة المعاملات
            params = np.array(list(current_params.values()))
            learning_rate = config.learning_rate
            
            best_params = params.copy()
            best_objective = await self._calculate_objective_function(config, current_params, current_data)
            
            for iteration in range(config.max_iterations):
                # حساب التدرج
                gradient = await self._calculate_gradient(config, params, current_data)
                
                # تحديث المعاملات
                new_params = params - learning_rate * gradient
                
                # تطبيق القيود
                new_params = self._apply_constraints(config, new_params)
                
                # تقييم الهدف الجديد
                param_dict = dict(zip(current_params.keys(), new_params))
                new_objective = await self._calculate_objective_function(config, param_dict, current_data)
                
                # فحص التحسن
                if new_objective > best_objective:
                    best_objective = new_objective
                    best_params = new_params.copy()
                    params = new_params
                else:
                    # تقليل معدل التعلم
                    learning_rate *= 0.95
                
                # فحص التقارب
                if iteration > 0 and abs(new_objective - best_objective) < config.convergence_threshold:
                    result.convergence_achieved = True
                    break
                
                result.iterations_completed = iteration + 1
            
            # تحويل إلى قاموس
            optimized_params = dict(zip(current_params.keys(), best_params))
            result.final_objective_value = best_objective
            
            return optimized_params
            
        except Exception as e:
            logger.error(f"خطأ في Gradient Descent: {e}")
            return current_params
    
    async def _genetic_algorithm_optimization(self, config: OptimizationConfig,
                                            current_data: Dict[str, Any],
                                            result: OptimizationResult) -> Dict[str, Any]:
        """تحسين بالخوارزمية الجينية"""
        try:
            current_params = self._extract_optimization_parameters(config, current_data)
            
            # معاملات الخوارزمية الجينية
            population_size = 50
            mutation_rate = 0.1
            crossover_rate = 0.8
            elite_size = 5
            
            # تهيئة الجيل الأول
            population = []
            param_keys = list(current_params.keys())
            param_ranges = self._get_parameter_ranges(config, current_params)
            
            for _ in range(population_size):
                individual = {}
                for key in param_keys:
                    min_val, max_val = param_ranges[key]
                    individual[key] = np.random.uniform(min_val, max_val)
                population.append(individual)
            
            best_individual = None
            best_fitness = float('-inf')
            
            for generation in range(config.max_iterations):
                # تقييم اللياقة
                fitness_scores = []
                for individual in population:
                    fitness = await self._calculate_objective_function(config, individual, current_data)
                    fitness_scores.append(fitness)
                    
                    if fitness > best_fitness:
                        best_fitness = fitness
                        best_individual = individual.copy()
                
                # اختيار النخبة
                elite_indices = np.argsort(fitness_scores)[-elite_size:]
                elite = [population[i] for i in elite_indices]
                
                # إنشاء الجيل الجديد
                new_population = elite.copy()
                
                while len(new_population) < population_size:
                    # اختيار الوالدين
                    parent1 = self._tournament_selection(population, fitness_scores)
                    parent2 = self._tournament_selection(population, fitness_scores)
                    
                    # التزاوج
                    if np.random.random() < crossover_rate:
                        child1, child2 = self._crossover(parent1, parent2, param_keys)
                    else:
                        child1, child2 = parent1.copy(), parent2.copy()
                    
                    # الطفرة
                    if np.random.random() < mutation_rate:
                        child1 = self._mutate(child1, param_ranges)
                    if np.random.random() < mutation_rate:
                        child2 = self._mutate(child2, param_ranges)
                    
                    new_population.extend([child1, child2])
                
                population = new_population[:population_size]
                result.iterations_completed = generation + 1
                
                # فحص التقارب
                if generation > 10:
                    recent_best = max(fitness_scores)
                    if abs(recent_best - best_fitness) < config.convergence_threshold:
                        result.convergence_achieved = True
                        break
            
            result.final_objective_value = best_fitness
            return best_individual
            
        except Exception as e:
            logger.error(f"خطأ في الخوارزمية الجينية: {e}")
            return current_params
    
    async def _bayesian_optimization(self, config: OptimizationConfig,
                                   current_data: Dict[str, Any],
                                   result: OptimizationResult) -> Dict[str, Any]:
        """تحسين بايزي"""
        try:
            current_params = self._extract_optimization_parameters(config, current_data)
            
            # بيانات التدريب
            X_train = []
            y_train = []
            
            # نقاط البداية
            param_ranges = self._get_parameter_ranges(config, current_params)
            param_keys = list(current_params.keys())
            
            # جمع نقاط البداية
            for _ in range(10):  # 10 نقاط عشوائية للبداية
                sample_params = {}
                sample_point = []
                for key in param_keys:
                    min_val, max_val = param_ranges[key]
                    value = np.random.uniform(min_val, max_val)
                    sample_params[key] = value
                    sample_point.append(value)
                
                objective_value = await self._calculate_objective_function(config, sample_params, current_data)
                X_train.append(sample_point)
                y_train.append(objective_value)
            
            best_params = current_params.copy()
            best_objective = max(y_train)
            
            # التحسين التكراري
            for iteration in range(config.max_iterations - 10):
                if ML_AVAILABLE:
                    # تدريب نموذج Gaussian Process (محاكاة)
                    # في الواقع، نحتاج مكتبة GPy أو scikit-optimize
                    
                    # استخدام Random Forest كبديل
                    model = RandomForestRegressor(n_estimators=50, random_state=42)
                    model.fit(X_train, y_train)
                    
                    # البحث عن النقطة التالية (محاكاة acquisition function)
                    best_acquisition = float('-inf')
                    next_point = None
                    next_params = None
                    
                    for _ in range(100):  # 100 نقطة مرشحة
                        candidate_params = {}
                        candidate_point = []
                        for key in param_keys:
                            min_val, max_val = param_ranges[key]
                            value = np.random.uniform(min_val, max_val)
                            candidate_params[key] = value
                            candidate_point.append(value)
                        
                        # حساب acquisition (محاكاة Upper Confidence Bound)
                        pred_mean = model.predict([candidate_point])[0]
                        pred_std = 0.1  # محاكاة الانحراف المعياري
                        acquisition = pred_mean + 2.0 * pred_std  # UCB
                        
                        if acquisition > best_acquisition:
                            best_acquisition = acquisition
                            next_point = candidate_point
                            next_params = candidate_params
                    
                    # تقييم النقطة الجديدة
                    if next_params:
                        objective_value = await self._calculate_objective_function(config, next_params, current_data)
                        X_train.append(next_point)
                        y_train.append(objective_value)
                        
                        if objective_value > best_objective:
                            best_objective = objective_value
                            best_params = next_params.copy()
                
                result.iterations_completed = iteration + 11
            
            result.final_objective_value = best_objective
            return best_params
            
        except Exception as e:
            logger.error(f"خطأ في التحسين البايزي: {e}")
            return current_params
    
    async def _particle_swarm_optimization(self, config: OptimizationConfig,
                                         current_data: Dict[str, Any],
                                         result: OptimizationResult) -> Dict[str, Any]:
        """تحسين بخوارزمية Particle Swarm"""
        try:
            current_params = self._extract_optimization_parameters(config, current_data)
            param_keys = list(current_params.keys())
            param_ranges = self._get_parameter_ranges(config, current_params)
            
            # معاملات PSO
            num_particles = 30
            w = 0.7  # inertia weight
            c1 = 1.5  # cognitive parameter
            c2 = 1.5  # social parameter
            
            # تهيئة الجسيمات
            particles = []
            velocities = []
            personal_best = []
            personal_best_fitness = []
            
            for _ in range(num_particles):
                particle = []
                velocity = []
                for key in param_keys:
                    min_val, max_val = param_ranges[key]
                    particle.append(np.random.uniform(min_val, max_val))
                    velocity.append(np.random.uniform(-1, 1))
                
                particles.append(particle)
                velocities.append(velocity)
                personal_best.append(particle.copy())
                
                # تقييم اللياقة الأولية
                param_dict = dict(zip(param_keys, particle))
                fitness = await self._calculate_objective_function(config, param_dict, current_data)
                personal_best_fitness.append(fitness)
            
            # أفضل جسيم عالمياً
            global_best_index = np.argmax(personal_best_fitness)
            global_best = personal_best[global_best_index].copy()
            global_best_fitness = personal_best_fitness[global_best_index]
            
            # التحسين التكراري
            for iteration in range(config.max_iterations):
                for i in range(num_particles):
                    # تحديث السرعة
                    for j in range(len(param_keys)):
                        r1, r2 = np.random.random(), np.random.random()
                        velocities[i][j] = (w * velocities[i][j] + 
                                          c1 * r1 * (personal_best[i][j] - particles[i][j]) +
                                          c2 * r2 * (global_best[j] - particles[i][j]))
                    
                    # تحديث الموضع
                    for j in range(len(param_keys)):
                        particles[i][j] += velocities[i][j]
                        
                        # تطبيق القيود
                        min_val, max_val = param_ranges[param_keys[j]]
                        particles[i][j] = max(min_val, min(max_val, particles[i][j]))
                    
                    # تقييم اللياقة
                    param_dict = dict(zip(param_keys, particles[i]))
                    fitness = await self._calculate_objective_function(config, param_dict, current_data)
                    
                    # تحديث أفضل شخصي
                    if fitness > personal_best_fitness[i]:
                        personal_best_fitness[i] = fitness
                        personal_best[i] = particles[i].copy()
                        
                        # تحديث أفضل عالمي
                        if fitness > global_best_fitness:
                            global_best_fitness = fitness
                            global_best = particles[i].copy()
                
                result.iterations_completed = iteration + 1
                
                # فحص التقارب
                if iteration > 10:
                    avg_fitness = np.mean(personal_best_fitness)
                    if abs(global_best_fitness - avg_fitness) < config.convergence_threshold:
                        result.convergence_achieved = True
                        break
            
            result.final_objective_value = global_best_fitness
            optimized_params = dict(zip(param_keys, global_best))
            return optimized_params
            
        except Exception as e:
            logger.error(f"خطأ في Particle Swarm Optimization: {e}")
            return current_params
    
    async def _simulated_annealing_optimization(self, config: OptimizationConfig,
                                              current_data: Dict[str, Any],
                                              result: OptimizationResult) -> Dict[str, Any]:
        """تحسين بخوارزمية Simulated Annealing"""
        try:
            current_params = self._extract_optimization_parameters(config, current_data)
            param_keys = list(current_params.keys())
            param_ranges = self._get_parameter_ranges(config, current_params)
            
            # تهيئة
            current_solution = np.array(list(current_params.values()))
            current_objective = await self._calculate_objective_function(config, current_params, current_data)
            
            best_solution = current_solution.copy()
            best_objective = current_objective
            
            # معاملات SA
            initial_temp = 100.0
            final_temp = 0.1
            cooling_rate = 0.95
            
            temperature = initial_temp
            
            for iteration in range(config.max_iterations):
                # توليد حل جديد
                new_solution = current_solution.copy()
                
                # إضافة ضوضاء
                for i in range(len(new_solution)):
                    min_val, max_val = param_ranges[param_keys[i]]
                    noise = np.random.normal(0, temperature / initial_temp * (max_val - min_val) * 0.1)
                    new_solution[i] += noise
                    new_solution[i] = max(min_val, min(max_val, new_solution[i]))
                
                # تقييم الحل الجديد
                new_params = dict(zip(param_keys, new_solution))
                new_objective = await self._calculate_objective_function(config, new_params, current_data)
                
                # قرار القبول
                delta = new_objective - current_objective
                
                if delta > 0 or np.random.random() < np.exp(delta / temperature):
                    current_solution = new_solution
                    current_objective = new_objective
                    
                    if new_objective > best_objective:
                        best_objective = new_objective
                        best_solution = new_solution.copy()
                
                # تبريد
                temperature *= cooling_rate
                temperature = max(temperature, final_temp)
                
                result.iterations_completed = iteration + 1
                
                # فحص التقارب
                if temperature <= final_temp:
                    result.convergence_achieved = True
                    break
            
            result.final_objective_value = best_objective
            optimized_params = dict(zip(param_keys, best_solution))
            return optimized_params
            
        except Exception as e:
            logger.error(f"خطأ في Simulated Annealing: {e}")
            return current_params
    
    def _extract_optimization_parameters(self, config: OptimizationConfig, 
                                       current_data: Dict[str, Any]) -> Dict[str, float]:
        """استخراج المعاملات القابلة للتحسين"""
        try:
            params = {}
            
            if config.optimization_type == OptimizationType.BID_OPTIMIZATION:
                # معاملات العروض
                params['max_cpc'] = current_data.get('max_cpc', 1.0)
                params['bid_adjustment'] = current_data.get('bid_adjustment', 1.0)
                params['target_cpa'] = current_data.get('target_cpa', 20.0)
                
            elif config.optimization_type == OptimizationType.BUDGET_OPTIMIZATION:
                # معاملات الميزانية
                params['daily_budget'] = current_data.get('daily_budget', 100.0)
                params['budget_allocation'] = current_data.get('budget_allocation', 1.0)
                
            elif config.optimization_type == OptimizationType.KEYWORD_OPTIMIZATION:
                # معاملات الكلمات المفتاحية
                params['keyword_bid'] = current_data.get('keyword_bid', 1.0)
                params['quality_score_weight'] = current_data.get('quality_score_weight', 0.5)
                
            else:
                # معاملات عامة
                params['optimization_factor'] = current_data.get('optimization_factor', 1.0)
            
            return params
            
        except Exception as e:
            logger.error(f"خطأ في استخراج المعاملات: {e}")
            return {'default_param': 1.0}
    
    def _get_parameter_ranges(self, config: OptimizationConfig, 
                            current_params: Dict[str, float]) -> Dict[str, Tuple[float, float]]:
        """الحصول على نطاقات المعاملات"""
        try:
            ranges = {}
            
            for param_name, current_value in current_params.items():
                # نطاقات افتراضية
                if 'cpc' in param_name.lower() or 'bid' in param_name.lower():
                    ranges[param_name] = (0.1, min(50.0, current_value * 5))
                elif 'budget' in param_name.lower():
                    ranges[param_name] = (10.0, current_value * 3)
                elif 'adjustment' in param_name.lower():
                    ranges[param_name] = (0.1, 3.0)
                elif 'weight' in param_name.lower():
                    ranges[param_name] = (0.0, 1.0)
                else:
                    ranges[param_name] = (current_value * 0.1, current_value * 2.0)
                
                # تطبيق قيود من الإعدادات
                if param_name in config.constraints:
                    constraint = config.constraints[param_name]
                    if 'min' in constraint and 'max' in constraint:
                        ranges[param_name] = (constraint['min'], constraint['max'])
            
            return ranges
            
        except Exception as e:
            logger.error(f"خطأ في الحصول على نطاقات المعاملات: {e}")
            return {param: (0.1, 10.0) for param in current_params.keys()}
    
    async def _calculate_objective_function(self, config: OptimizationConfig,
                                          params: Dict[str, float],
                                          current_data: Dict[str, Any]) -> float:
        """حساب دالة الهدف"""
        try:
            # محاكاة حساب دالة الهدف بناءً على الهدف
            if config.goal == OptimizationGoal.MAXIMIZE_CLICKS:
                # تحسين النقرات
                cpc = params.get('max_cpc', 1.0)
                budget = current_data.get('daily_budget', 100.0)
                estimated_clicks = budget / cpc
                return estimated_clicks
                
            elif config.goal == OptimizationGoal.MAXIMIZE_CONVERSIONS:
                # تحسين التحويلات
                cpc = params.get('max_cpc', 1.0)
                budget = current_data.get('daily_budget', 100.0)
                conversion_rate = current_data.get('conversion_rate', 0.05)
                estimated_clicks = budget / cpc
                estimated_conversions = estimated_clicks * conversion_rate
                return estimated_conversions
                
            elif config.goal == OptimizationGoal.TARGET_CPA:
                # تحسين CPA
                target_cpa = config.target_value or 20.0
                current_cpa = current_data.get('cpa', 25.0)
                cpc = params.get('max_cpc', 1.0)
                
                # كلما اقترب CPA من الهدف، كان أفضل
                predicted_cpa = cpc / current_data.get('conversion_rate', 0.05)
                objective = 1.0 / (1.0 + abs(predicted_cpa - target_cpa))
                return objective
                
            elif config.goal == OptimizationGoal.TARGET_ROAS:
                # تحسين ROAS
                target_roas = config.target_value or 4.0
                revenue_per_conversion = current_data.get('revenue_per_conversion', 50.0)
                cpc = params.get('max_cpc', 1.0)
                conversion_rate = current_data.get('conversion_rate', 0.05)
                
                predicted_roas = (revenue_per_conversion * conversion_rate) / cpc
                objective = 1.0 / (1.0 + abs(predicted_roas - target_roas))
                return objective
                
            else:
                # هدف افتراضي - تحسين عام
                return np.random.uniform(0.5, 1.0)
                
        except Exception as e:
            logger.error(f"خطأ في حساب دالة الهدف: {e}")
            return 0.0
    
    async def _calculate_gradient(self, config: OptimizationConfig,
                                params: np.ndarray,
                                current_data: Dict[str, Any]) -> np.ndarray:
        """حساب التدرج"""
        try:
            gradient = np.zeros_like(params)
            epsilon = 1e-6
            
            param_keys = list(self._extract_optimization_parameters(config, current_data).keys())
            
            for i in range(len(params)):
                # تقدير التدرج بالفروق المحدودة
                params_plus = params.copy()
                params_plus[i] += epsilon
                
                params_minus = params.copy()
                params_minus[i] -= epsilon
                
                # تحويل إلى قاموس
                params_plus_dict = dict(zip(param_keys, params_plus))
                params_minus_dict = dict(zip(param_keys, params_minus))
                
                # حساب الفرق
                f_plus = await self._calculate_objective_function(config, params_plus_dict, current_data)
                f_minus = await self._calculate_objective_function(config, params_minus_dict, current_data)
                
                gradient[i] = (f_plus - f_minus) / (2 * epsilon)
            
            return gradient
            
        except Exception as e:
            logger.error(f"خطأ في حساب التدرج: {e}")
            return np.zeros_like(params)
    
    def _apply_constraints(self, config: OptimizationConfig, params: np.ndarray) -> np.ndarray:
        """تطبيق القيود على المعاملات"""
        try:
            current_params = self._extract_optimization_parameters(config, {})
            param_ranges = self._get_parameter_ranges(config, current_params)
            param_keys = list(current_params.keys())
            
            constrained_params = params.copy()
            
            for i, key in enumerate(param_keys):
                if key in param_ranges:
                    min_val, max_val = param_ranges[key]
                    constrained_params[i] = max(min_val, min(max_val, constrained_params[i]))
            
            return constrained_params
            
        except Exception as e:
            logger.error(f"خطأ في تطبيق القيود: {e}")
            return params
    
    def _tournament_selection(self, population: List[Dict[str, float]], 
                            fitness_scores: List[float], tournament_size: int = 3) -> Dict[str, float]:
        """اختيار البطولة للخوارزمية الجينية"""
        try:
            tournament_indices = np.random.choice(len(population), tournament_size, replace=False)
            tournament_fitness = [fitness_scores[i] for i in tournament_indices]
            winner_index = tournament_indices[np.argmax(tournament_fitness)]
            return population[winner_index].copy()
            
        except Exception as e:
            logger.error(f"خطأ في اختيار البطولة: {e}")
            return population[0].copy()
    
    def _crossover(self, parent1: Dict[str, float], parent2: Dict[str, float], 
                  param_keys: List[str]) -> Tuple[Dict[str, float], Dict[str, float]]:
        """تزاوج للخوارزمية الجينية"""
        try:
            child1 = {}
            child2 = {}
            
            crossover_point = np.random.randint(1, len(param_keys))
            
            for i, key in enumerate(param_keys):
                if i < crossover_point:
                    child1[key] = parent1[key]
                    child2[key] = parent2[key]
                else:
                    child1[key] = parent2[key]
                    child2[key] = parent1[key]
            
            return child1, child2
            
        except Exception as e:
            logger.error(f"خطأ في التزاوج: {e}")
            return parent1.copy(), parent2.copy()
    
    def _mutate(self, individual: Dict[str, float], 
               param_ranges: Dict[str, Tuple[float, float]]) -> Dict[str, float]:
        """طفرة للخوارزمية الجينية"""
        try:
            mutated = individual.copy()
            
            for key in mutated.keys():
                if np.random.random() < 0.1:  # معدل الطفرة 10%
                    min_val, max_val = param_ranges[key]
                    mutated[key] = np.random.uniform(min_val, max_val)
            
            return mutated
            
        except Exception as e:
            logger.error(f"خطأ في الطفرة: {e}")
            return individual
    
    async def _evaluate_optimization_results(self, config: OptimizationConfig,
                                           current_data: Dict[str, Any],
                                           optimized_params: Dict[str, Any]) -> float:
        """تقييم نتائج التحسين"""
        try:
            # حساب الأداء الحالي
            current_params = self._extract_optimization_parameters(config, current_data)
            current_objective = await self._calculate_objective_function(config, current_params, current_data)
            
            # حساب الأداء المحسن
            optimized_objective = await self._calculate_objective_function(config, optimized_params, current_data)
            
            # حساب نسبة التحسن
            if current_objective > 0:
                improvement = ((optimized_objective - current_objective) / current_objective) * 100
            else:
                improvement = 0.0
            
            return improvement
            
        except Exception as e:
            logger.error(f"خطأ في تقييم نتائج التحسين: {e}")
            return 0.0
    
    def _generate_optimization_recommendations(self, config: OptimizationConfig,
                                             optimized_params: Dict[str, Any],
                                             improvement: float) -> List[str]:
        """توليد توصيات التحسين"""
        try:
            recommendations = []
            
            # توصيات بناءً على نوع التحسين
            if config.optimization_type == OptimizationType.BID_OPTIMIZATION:
                if 'max_cpc' in optimized_params:
                    new_cpc = optimized_params['max_cpc']
                    recommendations.append(f"اضبط الحد الأقصى للنقرة على {new_cpc:.2f}")
                
                if improvement > 10:
                    recommendations.append("التحسين المقترح سيحقق تحسناً كبيراً في الأداء")
                elif improvement > 0:
                    recommendations.append("التحسين المقترح سيحقق تحسناً متوسطاً في الأداء")
                else:
                    recommendations.append("قد تحتاج لمراجعة استراتيجية العروض")
            
            elif config.optimization_type == OptimizationType.BUDGET_OPTIMIZATION:
                if 'daily_budget' in optimized_params:
                    new_budget = optimized_params['daily_budget']
                    recommendations.append(f"اضبط الميزانية اليومية على {new_budget:.2f}")
                
                recommendations.append("راقب الأداء بعد تطبيق التحسين وأعد التقييم أسبوعياً")
            
            # توصيات عامة
            recommendations.extend([
                "اختبر التحسينات على نطاق صغير أولاً",
                "راقب المقاييس الرئيسية بعد التطبيق",
                "أعد تشغيل التحسين بانتظام للحصول على أفضل النتائج"
            ])
            
            return recommendations[:5]  # أول 5 توصيات
            
        except Exception as e:
            logger.error(f"خطأ في توليد التوصيات: {e}")
            return []
    
    def _save_learning_data(self, config: OptimizationConfig,
                          current_data: Dict[str, Any],
                          result: OptimizationResult):
        """حفظ بيانات التعلم"""
        try:
            learning_entry = {
                'config': asdict(config),
                'current_data': current_data,
                'result': asdict(result),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            self.learning_data[config.optimization_type.value].append(learning_entry)
            
            # الاحتفاظ بآخر 1000 إدخال فقط
            if len(self.learning_data[config.optimization_type.value]) > 1000:
                self.learning_data[config.optimization_type.value] = \
                    self.learning_data[config.optimization_type.value][-1000:]
            
            # حفظ في cache إذا كان متاحاً
            if REDIS_AVAILABLE:
                cache_key = f"optimization_learning_{config.optimization_type.value}"
                cache_set(cache_key, json.dumps(learning_entry), expire=86400)
            
        except Exception as e:
            logger.error(f"خطأ في حفظ بيانات التعلم: {e}")
    
    async def get_optimization_status(self, optimization_id: str) -> Optional[Dict[str, Any]]:
        """جلب حالة التحسين"""
        try:
            # البحث في التحسينات النشطة
            if optimization_id in self.active_optimizations:
                opt_data = self.active_optimizations[optimization_id]
                return {
                    'optimization_id': optimization_id,
                    'status': opt_data['result'].status.value,
                    'iterations_completed': opt_data['result'].iterations_completed,
                    'convergence_achieved': opt_data['result'].convergence_achieved,
                    'current_objective': opt_data['result'].final_objective_value,
                    'start_time': opt_data['result'].start_time.isoformat()
                }
            
            # البحث في التاريخ
            for result in self.optimization_history:
                if result.optimization_id == optimization_id:
                    return {
                        'optimization_id': optimization_id,
                        'status': result.status.value,
                        'iterations_completed': result.iterations_completed,
                        'convergence_achieved': result.convergence_achieved,
                        'final_objective': result.final_objective_value,
                        'improvement_percentage': result.improvement_percentage,
                        'execution_time': result.execution_time_seconds,
                        'start_time': result.start_time.isoformat(),
                        'end_time': result.end_time.isoformat() if result.end_time else None,
                        'recommendations': result.recommendations
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب حالة التحسين: {e}")
            return None

class PerformancePredictor:
    """متنبئ الأداء"""
    
    def __init__(self):
        """تهيئة متنبئ الأداء"""
        self.prediction_models = {}
        self.feature_scalers = {}
        self.prediction_cache = {}
        
        if ML_AVAILABLE:
            self._initialize_prediction_models()
    
    def _initialize_prediction_models(self):
        """تهيئة نماذج التنبؤ"""
        try:
            # نموذج التنبؤ بـ CTR
            self.prediction_models['ctr'] = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # نموذج التنبؤ بالتحويلات
            self.prediction_models['conversions'] = GradientBoostingRegressor(
                n_estimators=150,
                learning_rate=0.1,
                max_depth=8,
                random_state=42
            )
            
            # نموذج التنبؤ بالتكلفة
            self.prediction_models['cost'] = LinearRegression()
            
            # معايرات الميزات
            for model_name in self.prediction_models.keys():
                self.feature_scalers[model_name] = StandardScaler()
            
            logger.info("✅ تم تهيئة نماذج التنبؤ")
            
        except Exception as e:
            logger.error(f"خطأ في تهيئة نماذج التنبؤ: {e}")
    
    async def predict_performance(self, campaign_data: Dict[str, Any],
                                optimization_params: Dict[str, Any]) -> Dict[str, float]:
        """التنبؤ بالأداء"""
        try:
            if not ML_AVAILABLE:
                return self._fallback_prediction(campaign_data, optimization_params)
            
            # استخراج الميزات
            features = self._extract_prediction_features(campaign_data, optimization_params)
            
            predictions = {}
            
            # التنبؤ بكل مقياس
            for metric, model in self.prediction_models.items():
                try:
                    # محاكاة التنبؤ (في الواقع، النماذج تحتاج تدريب مسبق)
                    if metric == 'ctr':
                        predictions[metric] = max(0.001, min(0.2, np.random.uniform(0.01, 0.05)))
                    elif metric == 'conversions':
                        clicks = campaign_data.get('expected_clicks', 100)
                        conversion_rate = np.random.uniform(0.02, 0.08)
                        predictions[metric] = clicks * conversion_rate
                    elif metric == 'cost':
                        cpc = optimization_params.get('max_cpc', 1.0)
                        clicks = campaign_data.get('expected_clicks', 100)
                        predictions[metric] = cpc * clicks
                    
                except Exception as e:
                    logger.error(f"خطأ في التنبؤ بـ {metric}: {e}")
                    predictions[metric] = 0.0
            
            # حساب مقاييس مشتقة
            if 'conversions' in predictions and 'cost' in predictions:
                if predictions['conversions'] > 0:
                    predictions['cpa'] = predictions['cost'] / predictions['conversions']
                else:
                    predictions['cpa'] = float('inf')
            
            if 'cost' in predictions and campaign_data.get('expected_revenue'):
                revenue = campaign_data['expected_revenue']
                if predictions['cost'] > 0:
                    predictions['roas'] = revenue / predictions['cost']
                else:
                    predictions['roas'] = 0.0
            
            return predictions
            
        except Exception as e:
            logger.error(f"خطأ في التنبؤ بالأداء: {e}")
            return self._fallback_prediction(campaign_data, optimization_params)
    
    def _extract_prediction_features(self, campaign_data: Dict[str, Any],
                                   optimization_params: Dict[str, Any]) -> List[float]:
        """استخراج ميزات التنبؤ"""
        try:
            features = []
            
            # ميزات الحملة
            features.append(campaign_data.get('historical_ctr', 0.02))
            features.append(campaign_data.get('historical_conversion_rate', 0.05))
            features.append(campaign_data.get('quality_score', 7.0))
            features.append(campaign_data.get('competition_level', 0.5))
            
            # ميزات التحسين
            features.append(optimization_params.get('max_cpc', 1.0))
            features.append(optimization_params.get('bid_adjustment', 1.0))
            features.append(optimization_params.get('daily_budget', 100.0))
            
            # ميزات زمنية
            current_hour = datetime.now().hour
            features.append(np.sin(2 * np.pi * current_hour / 24))
            features.append(np.cos(2 * np.pi * current_hour / 24))
            
            # ميزات السوق
            features.append(campaign_data.get('market_trends', 1.0))
            features.append(campaign_data.get('seasonal_factor', 1.0))
            
            return features
            
        except Exception as e:
            logger.error(f"خطأ في استخراج ميزات التنبؤ: {e}")
            return [0.0] * 12
    
    def _fallback_prediction(self, campaign_data: Dict[str, Any],
                           optimization_params: Dict[str, Any]) -> Dict[str, float]:
        """تنبؤ احتياطي"""
        try:
            # تنبؤات بسيطة بناءً على البيانات التاريخية
            historical_ctr = campaign_data.get('historical_ctr', 0.02)
            historical_conversion_rate = campaign_data.get('historical_conversion_rate', 0.05)
            expected_clicks = campaign_data.get('expected_clicks', 100)
            cpc = optimization_params.get('max_cpc', 1.0)
            
            predictions = {
                'ctr': historical_ctr * 1.1,  # تحسن متوقع 10%
                'conversions': expected_clicks * historical_conversion_rate * 1.05,  # تحسن 5%
                'cost': expected_clicks * cpc,
                'clicks': expected_clicks
            }
            
            # حساب مقاييس مشتقة
            if predictions['conversions'] > 0:
                predictions['cpa'] = predictions['cost'] / predictions['conversions']
            
            return predictions
            
        except Exception as e:
            logger.error(f"خطأ في التنبؤ الاحتياطي: {e}")
            return {
                'ctr': 0.02,
                'conversions': 5.0,
                'cost': 100.0,
                'cpa': 20.0
            }

# إنشاء محرك التحسين العام
optimization_engine = OptimizationEngine()
performance_predictor = PerformancePredictor()

# تسجيل معلومات البدء
logger.info(f"🚀 تم تحميل Optimization Engine v2.5.0")
logger.info(f"📊 ML متاح: {ML_AVAILABLE}")
logger.info(f"🔬 SciPy متاح: {SCIPY_AVAILABLE}")
logger.info(f"⚡ Thread Pool: {optimization_executor._max_workers} workers")

