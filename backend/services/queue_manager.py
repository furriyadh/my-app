"""
Queue Manager Module
وحدة إدارة المهام والطوابير المتقدمة

يوفر نظام إدارة مهام شامل ومتطور بما في ذلك:
- إدارة طوابير المهام المتعددة
- جدولة المهام والتنفيذ المتوازي
- مراقبة حالة المهام والأداء
- إعادة المحاولة والتعامل مع الأخطاء
- أولويات المهام والتوزيع الذكي
- تخزين النتائج والتتبع
- إحصائيات الأداء والمراقبة
- تكامل مع Redis للتخزين المؤقت

Author: Google Ads AI Platform Team
Version: 2.2.0
Security Level: Enterprise
Performance: High-Performance Queue Management
"""

import os
import asyncio
import json
import time
import threading
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple, Union, Set, Callable, Awaitable
from dataclasses import dataclass, field, asdict
from enum import Enum, auto
from functools import wraps
from concurrent.futures import ThreadPoolExecutor, as_completed, Future
from collections import defaultdict, deque
import hashlib
import uuid
import pickle
import gzip
import logging
import heapq
import weakref
from queue import Queue, PriorityQueue, Empty
import signal
import sys

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

class TaskStatus(Enum):
    """حالات المهام"""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"
    PAUSED = "paused"

class TaskPriority(Enum):
    """أولويات المهام"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4
    CRITICAL = 5

class QueueType(Enum):
    """أنواع الطوابير"""
    FIFO = "fifo"  # First In, First Out
    LIFO = "lifo"  # Last In, First Out
    PRIORITY = "priority"  # Priority-based
    ROUND_ROBIN = "round_robin"  # Round Robin
    WEIGHTED = "weighted"  # Weighted distribution

@dataclass
class TaskConfig:
    """إعدادات المهمة"""
    task_id: str
    task_type: str
    function_name: str
    args: Tuple[Any, ...] = field(default_factory=tuple)
    kwargs: Dict[str, Any] = field(default_factory=dict)
    priority: TaskPriority = TaskPriority.NORMAL
    max_retries: int = 3
    retry_delay: float = 1.0
    timeout: Optional[float] = None
    depends_on: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    scheduled_time: Optional[datetime] = None
    expires_at: Optional[datetime] = None

@dataclass
class TaskResult:
    """نتيجة المهمة"""
    task_id: str
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Any = None
    error: Optional[str] = None
    retry_count: int = 0
    execution_time_seconds: float = 0.0
    worker_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class QueueStats:
    """إحصائيات الطابور"""
    queue_name: str
    total_tasks: int = 0
    pending_tasks: int = 0
    running_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    average_execution_time: float = 0.0
    throughput_per_minute: float = 0.0
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class WorkerStats:
    """إحصائيات العامل"""
    worker_id: str
    tasks_processed: int = 0
    tasks_failed: int = 0
    average_task_time: float = 0.0
    current_task: Optional[str] = None
    status: str = "idle"
    last_activity: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class Task:
    """فئة المهمة"""
    
    def __init__(self, config: TaskConfig):
        """تهيئة المهمة"""
        self.config = config
        self.result = TaskResult(
            task_id=config.task_id,
            status=TaskStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        self._future: Optional[Future] = None
        self._dependencies_met = threading.Event()
        
        # فحص التبعيات
        if not config.depends_on:
            self._dependencies_met.set()
    
    def __lt__(self, other):
        """مقارنة للأولوية"""
        return self.config.priority.value > other.config.priority.value
    
    def mark_dependency_met(self, dependency_id: str):
        """تحديد أن تبعية تم الوفاء بها"""
        if dependency_id in self.config.depends_on:
            self.config.depends_on.remove(dependency_id)
            if not self.config.depends_on:
                self._dependencies_met.set()
    
    def are_dependencies_met(self) -> bool:
        """فحص ما إذا كانت جميع التبعيات مستوفاة"""
        return self._dependencies_met.is_set()
    
    def is_expired(self) -> bool:
        """فحص ما إذا كانت المهمة منتهية الصلاحية"""
        if self.config.expires_at:
            return datetime.now(timezone.utc) > self.config.expires_at
        return False
    
    def should_execute_now(self) -> bool:
        """فحص ما إذا كان يجب تنفيذ المهمة الآن"""
        if self.config.scheduled_time:
            return datetime.now(timezone.utc) >= self.config.scheduled_time
        return True

class TaskQueue:
    """طابور المهام"""
    
    def __init__(self, name: str, queue_type: QueueType = QueueType.FIFO, max_size: Optional[int] = None):
        """تهيئة طابور المهام"""
        self.name = name
        self.queue_type = queue_type
        self.max_size = max_size
        
        # اختيار نوع الطابور المناسب
        if queue_type == QueueType.PRIORITY:
            self._queue = PriorityQueue(maxsize=max_size or 0)
        else:
            self._queue = Queue(maxsize=max_size or 0)
        
        self._tasks: Dict[str, Task] = {}
        self._lock = threading.RLock()
        self.stats = QueueStats(queue_name=name)
        
        # للطوابير المجدولة
        self._scheduled_tasks: List[Task] = []
        self._scheduler_thread = None
        self._scheduler_running = False
        
        self._start_scheduler()
    
    def _start_scheduler(self):
        """بدء مجدول المهام"""
        if self._scheduler_thread is None or not self._scheduler_thread.is_alive():
            self._scheduler_running = True
            self._scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self._scheduler_thread.start()
    
    def _scheduler_loop(self):
        """حلقة مجدول المهام"""
        while self._scheduler_running:
            try:
                current_time = datetime.now(timezone.utc)
                tasks_to_queue = []
                
                with self._lock:
                    # فحص المهام المجدولة
                    for task in self._scheduled_tasks[:]:
                        if task.should_execute_now() and task.are_dependencies_met():
                            if not task.is_expired():
                                tasks_to_queue.append(task)
                                self._scheduled_tasks.remove(task)
                            else:
                                # إزالة المهام المنتهية الصلاحية
                                self._scheduled_tasks.remove(task)
                                task.result.status = TaskStatus.CANCELLED
                                task.result.error = "Task expired"
                
                # إضافة المهام إلى الطابور
                for task in tasks_to_queue:
                    self._enqueue_task(task)
                
                time.sleep(1)  # فحص كل ثانية
                
            except Exception as e:
                logger.error(f"خطأ في مجدول المهام: {e}")
                time.sleep(5)
    
    def put(self, task: Task) -> bool:
        """إضافة مهمة إلى الطابور"""
        try:
            with self._lock:
                if task.config.task_id in self._tasks:
                    logger.warning(f"المهمة {task.config.task_id} موجودة بالفعل")
                    return False
                
                # فحص الحد الأقصى للحجم
                if self.max_size and len(self._tasks) >= self.max_size:
                    logger.warning(f"الطابور {self.name} ممتلئ")
                    return False
                
                self._tasks[task.config.task_id] = task
                
                # إذا كانت المهمة مجدولة
                if task.config.scheduled_time and task.config.scheduled_time > datetime.now(timezone.utc):
                    self._scheduled_tasks.append(task)
                    task.result.status = TaskStatus.QUEUED
                    logger.info(f"تم جدولة المهمة {task.config.task_id} للتنفيذ في {task.config.scheduled_time}")
                else:
                    # إضافة فورية إذا كانت التبعيات مستوفاة
                    if task.are_dependencies_met():
                        self._enqueue_task(task)
                    else:
                        task.result.status = TaskStatus.PENDING
                        logger.info(f"المهمة {task.config.task_id} في انتظار التبعيات")
                
                self.stats.total_tasks += 1
                self.stats.pending_tasks += 1
                return True
                
        except Exception as e:
            logger.error(f"خطأ في إضافة المهمة: {e}")
            return False
    
    def _enqueue_task(self, task: Task):
        """إضافة مهمة إلى الطابور الفعلي"""
        try:
            if self.queue_type == QueueType.PRIORITY:
                self._queue.put(task, block=False)
            elif self.queue_type == QueueType.LIFO:
                # محاكاة LIFO باستخدام Queue عادي
                self._queue.put(task, block=False)
            else:  # FIFO
                self._queue.put(task, block=False)
            
            task.result.status = TaskStatus.QUEUED
            logger.debug(f"تم إضافة المهمة {task.config.task_id} إلى الطابور")
            
        except Exception as e:
            logger.error(f"خطأ في إضافة المهمة إلى الطابور: {e}")
            task.result.status = TaskStatus.FAILED
            task.result.error = str(e)
    
    def get(self, timeout: Optional[float] = None) -> Optional[Task]:
        """جلب مهمة من الطابور"""
        try:
            task = self._queue.get(timeout=timeout)
            
            with self._lock:
                if task.config.task_id in self._tasks:
                    task.result.status = TaskStatus.RUNNING
                    task.result.started_at = datetime.now(timezone.utc)
                    self.stats.pending_tasks = max(0, self.stats.pending_tasks - 1)
                    self.stats.running_tasks += 1
                    return task
            
            return None
            
        except Empty:
            return None
        except Exception as e:
            logger.error(f"خطأ في جلب المهمة: {e}")
            return None
    
    def task_done(self, task: Task):
        """تحديد انتهاء المهمة"""
        try:
            with self._lock:
                if task.config.task_id in self._tasks:
                    task.result.completed_at = datetime.now(timezone.utc)
                    if task.result.started_at:
                        task.result.execution_time_seconds = (
                            task.result.completed_at - task.result.started_at
                        ).total_seconds()
                    
                    self.stats.running_tasks = max(0, self.stats.running_tasks - 1)
                    
                    if task.result.status == TaskStatus.COMPLETED:
                        self.stats.completed_tasks += 1
                        # إشعار المهام التابعة
                        self._notify_dependent_tasks(task.config.task_id)
                    elif task.result.status == TaskStatus.FAILED:
                        self.stats.failed_tasks += 1
                    
                    # تحديث الإحصائيات
                    self._update_stats()
            
            self._queue.task_done()
            
        except Exception as e:
            logger.error(f"خطأ في تحديد انتهاء المهمة: {e}")
    
    def _notify_dependent_tasks(self, completed_task_id: str):
        """إشعار المهام التابعة"""
        try:
            tasks_to_queue = []
            
            for task in self._tasks.values():
                if completed_task_id in task.config.depends_on:
                    task.mark_dependency_met(completed_task_id)
                    if task.are_dependencies_met() and task.result.status == TaskStatus.PENDING:
                        if task.should_execute_now():
                            tasks_to_queue.append(task)
            
            # إضافة المهام الجاهزة إلى الطابور
            for task in tasks_to_queue:
                self._enqueue_task(task)
                
        except Exception as e:
            logger.error(f"خطأ في إشعار المهام التابعة: {e}")
    
    def _update_stats(self):
        """تحديث الإحصائيات"""
        try:
            completed_tasks = [t for t in self._tasks.values() if t.result.status == TaskStatus.COMPLETED]
            
            if completed_tasks:
                total_time = sum(t.result.execution_time_seconds for t in completed_tasks)
                self.stats.average_execution_time = total_time / len(completed_tasks)
            
            # حساب الإنتاجية (مهام في الدقيقة)
            now = datetime.now(timezone.utc)
            one_minute_ago = now - timedelta(minutes=1)
            recent_completions = [
                t for t in completed_tasks 
                if t.result.completed_at and t.result.completed_at >= one_minute_ago
            ]
            self.stats.throughput_per_minute = len(recent_completions)
            self.stats.last_updated = now
            
        except Exception as e:
            logger.error(f"خطأ في تحديث الإحصائيات: {e}")
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """جلب مهمة بالمعرف"""
        with self._lock:
            return self._tasks.get(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """إلغاء مهمة"""
        try:
            with self._lock:
                task = self._tasks.get(task_id)
                if task:
                    if task.result.status in [TaskStatus.PENDING, TaskStatus.QUEUED]:
                        task.result.status = TaskStatus.CANCELLED
                        task.result.completed_at = datetime.now(timezone.utc)
                        
                        # إزالة من المهام المجدولة
                        if task in self._scheduled_tasks:
                            self._scheduled_tasks.remove(task)
                        
                        return True
                    elif task.result.status == TaskStatus.RUNNING:
                        # محاولة إلغاء المهمة الجارية
                        if task._future:
                            task._future.cancel()
                        task.result.status = TaskStatus.CANCELLED
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء المهمة: {e}")
            return False
    
    def size(self) -> int:
        """حجم الطابور"""
        return self._queue.qsize()
    
    def is_empty(self) -> bool:
        """فحص ما إذا كان الطابور فارغ"""
        return self._queue.empty()
    
    def clear(self):
        """مسح الطابور"""
        try:
            with self._lock:
                while not self._queue.empty():
                    try:
                        self._queue.get_nowait()
                        self._queue.task_done()
                    except Empty:
                        break
                
                # إلغاء جميع المهام
                for task in self._tasks.values():
                    if task.result.status in [TaskStatus.PENDING, TaskStatus.QUEUED, TaskStatus.RUNNING]:
                        task.result.status = TaskStatus.CANCELLED
                
                self._scheduled_tasks.clear()
                self.stats = QueueStats(queue_name=self.name)
                
        except Exception as e:
            logger.error(f"خطأ في مسح الطابور: {e}")
    
    def stop_scheduler(self):
        """إيقاف مجدول المهام"""
        self._scheduler_running = False
        if self._scheduler_thread and self._scheduler_thread.is_alive():
            self._scheduler_thread.join(timeout=5)

class Worker:
    """عامل تنفيذ المهام"""
    
    def __init__(self, worker_id: str, queue_manager: 'QueueManager'):
        """تهيئة العامل"""
        self.worker_id = worker_id
        self.queue_manager = queue_manager
        self.stats = WorkerStats(worker_id=worker_id)
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._current_task: Optional[Task] = None
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"worker_{worker_id}")
    
    def start(self):
        """بدء العامل"""
        if not self._running:
            self._running = True
            self._thread = threading.Thread(target=self._work_loop, daemon=True)
            self._thread.start()
            logger.info(f"تم بدء العامل {self.worker_id}")
    
    def stop(self):
        """إيقاف العامل"""
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=10)
        
        self._executor.shutdown(wait=True)
        logger.info(f"تم إيقاف العامل {self.worker_id}")
    
    def _work_loop(self):
        """حلقة عمل العامل"""
        while self._running:
            try:
                # جلب مهمة من أي طابور متاح
                task = self.queue_manager.get_next_task(timeout=1.0)
                
                if task:
                    self._current_task = task
                    self.stats.current_task = task.config.task_id
                    self.stats.status = "working"
                    self.stats.last_activity = datetime.now(timezone.utc)
                    
                    # تنفيذ المهمة
                    success = self._execute_task(task)
                    
                    # تحديث الإحصائيات
                    if success:
                        self.stats.tasks_processed += 1
                    else:
                        self.stats.tasks_failed += 1
                    
                    # حساب متوسط وقت التنفيذ
                    if task.result.execution_time_seconds > 0:
                        total_time = self.stats.average_task_time * (self.stats.tasks_processed - 1)
                        total_time += task.result.execution_time_seconds
                        self.stats.average_task_time = total_time / self.stats.tasks_processed
                    
                    self._current_task = None
                    self.stats.current_task = None
                    self.stats.status = "idle"
                else:
                    # لا توجد مهام، انتظار قصير
                    time.sleep(0.1)
                    
            except Exception as e:
                logger.error(f"خطأ في حلقة عمل العامل {self.worker_id}: {e}")
                time.sleep(1)
    
    def _execute_task(self, task: Task) -> bool:
        """تنفيذ مهمة"""
        try:
            # فحص انتهاء الصلاحية
            if task.is_expired():
                task.result.status = TaskStatus.CANCELLED
                task.result.error = "Task expired before execution"
                self.queue_manager._complete_task(task)
                return False
            
            # تنفيذ المهمة مع timeout
            future = self._executor.submit(self._run_task_function, task)
            task._future = future
            
            try:
                if task.config.timeout:
                    result = future.result(timeout=task.config.timeout)
                else:
                    result = future.result()
                
                task.result.result = result
                task.result.status = TaskStatus.COMPLETED
                task.result.worker_id = self.worker_id
                
                logger.info(f"تم تنفيذ المهمة {task.config.task_id} بنجاح")
                self.queue_manager._complete_task(task)
                return True
                
            except TimeoutError:
                future.cancel()
                task.result.status = TaskStatus.FAILED
                task.result.error = "Task timeout"
                logger.error(f"انتهت مهلة المهمة {task.config.task_id}")
                
            except Exception as e:
                task.result.status = TaskStatus.FAILED
                task.result.error = str(e)
                logger.error(f"فشل في تنفيذ المهمة {task.config.task_id}: {e}")
            
            # إعادة المحاولة إذا لزم الأمر
            if task.result.retry_count < task.config.max_retries:
                return self._retry_task(task)
            else:
                self.queue_manager._complete_task(task)
                return False
                
        except Exception as e:
            logger.error(f"خطأ عام في تنفيذ المهمة: {e}")
            task.result.status = TaskStatus.FAILED
            task.result.error = str(e)
            self.queue_manager._complete_task(task)
            return False
    
    def _run_task_function(self, task: Task) -> Any:
        """تشغيل دالة المهمة"""
        try:
            # جلب الدالة من queue_manager
            function = self.queue_manager.get_task_function(task.config.function_name)
            if not function:
                raise ValueError(f"الدالة {task.config.function_name} غير موجودة")
            
            # تنفيذ الدالة
            if asyncio.iscoroutinefunction(function):
                # دالة async
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    return loop.run_until_complete(function(*task.config.args, **task.config.kwargs))
                finally:
                    loop.close()
            else:
                # دالة عادية
                return function(*task.config.args, **task.config.kwargs)
                
        except Exception as e:
            logger.error(f"خطأ في تشغيل دالة المهمة: {e}")
            raise
    
    def _retry_task(self, task: Task) -> bool:
        """إعادة محاولة المهمة"""
        try:
            task.result.retry_count += 1
            task.result.status = TaskStatus.RETRYING
            
            logger.info(f"إعادة محاولة المهمة {task.config.task_id} - المحاولة {task.result.retry_count}")
            
            # انتظار قبل إعادة المحاولة
            time.sleep(task.config.retry_delay * task.result.retry_count)
            
            # إعادة إضافة إلى الطابور
            task.result.status = TaskStatus.PENDING
            return self.queue_manager.requeue_task(task)
            
        except Exception as e:
            logger.error(f"خطأ في إعادة محاولة المهمة: {e}")
            return False

class QueueManager:
    """مدير الطوابير الرئيسي"""
    
    def __init__(self, max_workers: int = 10):
        """تهيئة مدير الطوابير"""
        self.max_workers = max_workers
        self.queues: Dict[str, TaskQueue] = {}
        self.workers: Dict[str, Worker] = {}
        self.task_functions: Dict[str, Callable] = {}
        self.global_stats = {
            'total_tasks_processed': 0,
            'total_tasks_failed': 0,
            'average_processing_time': 0.0,
            'uptime_start': datetime.now(timezone.utc)
        }
        
        self._running = False
        self._lock = threading.RLock()
        
        # إعداد معالج الإشارات للإغلاق الآمن
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """معالج إشارات النظام"""
        logger.info(f"تم استلام إشارة {signum}، إيقاف مدير الطوابير...")
        self.shutdown()
        sys.exit(0)
    
    def create_queue(self, name: str, queue_type: QueueType = QueueType.FIFO, max_size: Optional[int] = None) -> TaskQueue:
        """إنشاء طابور جديد"""
        try:
            with self._lock:
                if name in self.queues:
                    logger.warning(f"الطابور {name} موجود بالفعل")
                    return self.queues[name]
                
                queue = TaskQueue(name, queue_type, max_size)
                self.queues[name] = queue
                
                logger.info(f"تم إنشاء الطابور {name} من نوع {queue_type.value}")
                return queue
                
        except Exception as e:
            logger.error(f"خطأ في إنشاء الطابور: {e}")
            raise
    
    def register_task_function(self, name: str, function: Callable):
        """تسجيل دالة مهمة"""
        try:
            self.task_functions[name] = function
            logger.info(f"تم تسجيل دالة المهمة {name}")
            
        except Exception as e:
            logger.error(f"خطأ في تسجيل دالة المهمة: {e}")
    
    def get_task_function(self, name: str) -> Optional[Callable]:
        """جلب دالة مهمة"""
        return self.task_functions.get(name)
    
    def submit_task(self, queue_name: str, task_config: TaskConfig) -> bool:
        """إرسال مهمة إلى طابور"""
        try:
            queue = self.queues.get(queue_name)
            if not queue:
                logger.error(f"الطابور {queue_name} غير موجود")
                return False
            
            task = Task(task_config)
            success = queue.put(task)
            
            if success:
                logger.info(f"تم إرسال المهمة {task_config.task_id} إلى الطابور {queue_name}")
                
                # حفظ في Redis إذا كان متاحاً
                if REDIS_AVAILABLE:
                    self._cache_task(task)
            
            return success
            
        except Exception as e:
            logger.error(f"خطأ في إرسال المهمة: {e}")
            return False
    
    def get_next_task(self, timeout: Optional[float] = None) -> Optional[Task]:
        """جلب المهمة التالية من أي طابور"""
        try:
            # استراتيجية Round Robin للطوابير
            queue_names = list(self.queues.keys())
            if not queue_names:
                return None
            
            for queue_name in queue_names:
                queue = self.queues[queue_name]
                task = queue.get(timeout=0.1)  # timeout قصير لكل طابور
                if task:
                    return task
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب المهمة التالية: {e}")
            return None
    
    def requeue_task(self, task: Task) -> bool:
        """إعادة إضافة مهمة إلى الطابور"""
        try:
            # البحث عن الطابور الذي يحتوي على المهمة
            for queue in self.queues.values():
                if task.config.task_id in queue._tasks:
                    return queue.put(task)
            
            logger.error(f"لم يتم العثور على طابور للمهمة {task.config.task_id}")
            return False
            
        except Exception as e:
            logger.error(f"خطأ في إعادة إضافة المهمة: {e}")
            return False
    
    def _complete_task(self, task: Task):
        """إكمال مهمة"""
        try:
            # البحث عن الطابور وإكمال المهمة
            for queue in self.queues.values():
                if task.config.task_id in queue._tasks:
                    queue.task_done(task)
                    break
            
            # تحديث الإحصائيات العامة
            self.global_stats['total_tasks_processed'] += 1
            if task.result.status == TaskStatus.FAILED:
                self.global_stats['total_tasks_failed'] += 1
            
            # حفظ النتيجة في Redis
            if REDIS_AVAILABLE:
                self._cache_task_result(task)
                
        except Exception as e:
            logger.error(f"خطأ في إكمال المهمة: {e}")
    
    def start_workers(self, num_workers: Optional[int] = None):
        """بدء العمال"""
        try:
            if self._running:
                logger.warning("العمال يعملون بالفعل")
                return
            
            num_workers = num_workers or self.max_workers
            
            with self._lock:
                for i in range(num_workers):
                    worker_id = f"worker_{i+1}"
                    worker = Worker(worker_id, self)
                    self.workers[worker_id] = worker
                    worker.start()
                
                self._running = True
                logger.info(f"تم بدء {num_workers} عامل")
                
        except Exception as e:
            logger.error(f"خطأ في بدء العمال: {e}")
    
    def stop_workers(self):
        """إيقاف العمال"""
        try:
            with self._lock:
                for worker in self.workers.values():
                    worker.stop()
                
                self.workers.clear()
                self._running = False
                logger.info("تم إيقاف جميع العمال")
                
        except Exception as e:
            logger.error(f"خطأ في إيقاف العمال: {e}")
    
    def get_task_status(self, task_id: str) -> Optional[TaskResult]:
        """جلب حالة مهمة"""
        try:
            # البحث في جميع الطوابير
            for queue in self.queues.values():
                task = queue.get_task(task_id)
                if task:
                    return task.result
            
            # البحث في Redis
            if REDIS_AVAILABLE:
                cached_result = cache_get(f"task_result_{task_id}")
                if cached_result:
                    return TaskResult(**json.loads(cached_result))
            
            return None
            
        except Exception as e:
            logger.error(f"خطأ في جلب حالة المهمة: {e}")
            return None
    
    def cancel_task(self, task_id: str) -> bool:
        """إلغاء مهمة"""
        try:
            for queue in self.queues.values():
                if queue.cancel_task(task_id):
                    logger.info(f"تم إلغاء المهمة {task_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"خطأ في إلغاء المهمة: {e}")
            return False
    
    def get_queue_stats(self, queue_name: str) -> Optional[QueueStats]:
        """جلب إحصائيات طابور"""
        queue = self.queues.get(queue_name)
        return queue.stats if queue else None
    
    def get_worker_stats(self, worker_id: str) -> Optional[WorkerStats]:
        """جلب إحصائيات عامل"""
        worker = self.workers.get(worker_id)
        return worker.stats if worker else None
    
    def get_global_stats(self) -> Dict[str, Any]:
        """جلب الإحصائيات العامة"""
        stats = self.global_stats.copy()
        stats['uptime_seconds'] = (datetime.now(timezone.utc) - stats['uptime_start']).total_seconds()
        stats['active_workers'] = len([w for w in self.workers.values() if w._running])
        stats['total_queues'] = len(self.queues)
        stats['total_pending_tasks'] = sum(q.stats.pending_tasks for q in self.queues.values())
        stats['total_running_tasks'] = sum(q.stats.running_tasks for q in self.queues.values())
        return stats
    
    def _cache_task(self, task: Task):
        """حفظ مهمة في الكاش"""
        try:
            if REDIS_AVAILABLE:
                cache_key = f"task_{task.config.task_id}"
                cache_data = json.dumps(asdict(task.config), default=str)
                cache_set(cache_key, cache_data, expire=86400)  # 24 ساعة
                
        except Exception as e:
            logger.error(f"خطأ في حفظ المهمة في الكاش: {e}")
    
    def _cache_task_result(self, task: Task):
        """حفظ نتيجة مهمة في الكاش"""
        try:
            if REDIS_AVAILABLE:
                cache_key = f"task_result_{task.config.task_id}"
                cache_data = json.dumps(asdict(task.result), default=str)
                cache_set(cache_key, cache_data, expire=86400)  # 24 ساعة
                
        except Exception as e:
            logger.error(f"خطأ في حفظ نتيجة المهمة في الكاش: {e}")
    
    def shutdown(self):
        """إغلاق مدير الطوابير"""
        try:
            logger.info("بدء إغلاق مدير الطوابير...")
            
            # إيقاف العمال
            self.stop_workers()
            
            # إيقاف مجدولات الطوابير
            for queue in self.queues.values():
                queue.stop_scheduler()
            
            # مسح الطوابير
            self.queues.clear()
            
            logger.info("تم إغلاق مدير الطوابير بنجاح")
            
        except Exception as e:
            logger.error(f"خطأ في إغلاق مدير الطوابير: {e}")

# إنشاء مدير الطوابير العام
queue_manager = QueueManager()

# دوال مساعدة للاستخدام السهل
def create_queue(name: str, queue_type: QueueType = QueueType.FIFO, max_size: Optional[int] = None) -> TaskQueue:
    """إنشاء طابور جديد"""
    return queue_manager.create_queue(name, queue_type, max_size)

def register_task_function(name: str, function: Callable):
    """تسجيل دالة مهمة"""
    queue_manager.register_task_function(name, function)

def submit_task(queue_name: str, task_id: str, function_name: str, 
               *args, priority: TaskPriority = TaskPriority.NORMAL, **kwargs) -> bool:
    """إرسال مهمة بسيطة"""
    config = TaskConfig(
        task_id=task_id,
        task_type="simple",
        function_name=function_name,
        args=args,
        kwargs=kwargs,
        priority=priority
    )
    return queue_manager.submit_task(queue_name, config)

def get_task_status(task_id: str) -> Optional[TaskResult]:
    """جلب حالة مهمة"""
    return queue_manager.get_task_status(task_id)

def start_workers(num_workers: Optional[int] = None):
    """بدء العمال"""
    queue_manager.start_workers(num_workers)

def stop_workers():
    """إيقاف العمال"""
    queue_manager.stop_workers()

# تسجيل معلومات البدء
logger.info(f"🚀 تم تحميل Queue Manager Module v2.2.0")
logger.info(f"💾 Redis متاح: {REDIS_AVAILABLE}")
logger.info(f"🔧 Helpers متاح: {HELPERS_AVAILABLE}")
logger.info(f"⚡ مدير الطوابير جاهز للاستخدام")

