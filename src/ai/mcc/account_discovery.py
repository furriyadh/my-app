#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🔍 Account Discovery - اكتشاف الحسابات التلقائي
===============================================

هذا الملف يوفر نظام اكتشاف الحسابات التلقائي والمراقبة المستمرة
لحسابات Google Ads الجديدة في MCC.

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import os
import asyncio
import threading
import time
from typing import List, Dict, Optional, Callable, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import logging

from .mcc_manager import MCCManager, MCCAccount
from ..utils.logger import setup_logger
from ..utils.notifications import send_notification

# إعداد نظام السجلات
logger = setup_logger(__name__)

@dataclass
class DiscoveryConfig:
    """
    ⚙️ إعدادات اكتشاف الحسابات
    """
    enabled: bool = True
    check_interval: int = 300  # 5 دقائق
    auto_setup_new_accounts: bool = True
    notification_enabled: bool = True
    max_retries: int = 3
    retry_delay: int = 60
    batch_size: int = 10
    
    @classmethod
    def from_env(cls) -> 'DiscoveryConfig':
        """تحميل الإعدادات من متغيرات البيئة"""
        return cls(
            enabled=os.getenv('MCC_MONITOR_NEW_ACCOUNTS', 'true').lower() == 'true',
            check_interval=int(os.getenv('MCC_NEW_ACCOUNT_CHECK_INTERVAL', '300')),
            auto_setup_new_accounts=os.getenv('MCC_AUTO_SETUP_NEW_ACCOUNTS', 'true').lower() == 'true',
            notification_enabled=os.getenv('MCC_NEW_ACCOUNT_NOTIFICATION', 'true').lower() == 'true',
            max_retries=int(os.getenv('MCC_DISCOVERY_MAX_RETRIES', '3')),
            retry_delay=int(os.getenv('MCC_DISCOVERY_RETRY_DELAY', '60')),
            batch_size=int(os.getenv('MCC_DISCOVERY_BATCH_SIZE', '10'))
        )

@dataclass
class DiscoveryEvent:
    """
    📅 حدث اكتشاف حساب
    """
    event_type: str  # NEW_ACCOUNT, ACCOUNT_UPDATED, ACCOUNT_REMOVED
    account: MCCAccount
    timestamp: datetime = field(default_factory=datetime.now)
    details: Dict = field(default_factory=dict)

class AccountDiscovery:
    """
    🔍 نظام اكتشاف الحسابات التلقائي
    
    يوفر:
    - مراقبة مستمرة للحسابات الجديدة
    - إشعارات فورية عند اكتشاف حسابات جديدة
    - إعداد تلقائي للحسابات الجديدة
    - تتبع تغييرات الحسابات
    """
    
    def __init__(self, mcc_manager: Optional[MCCManager] = None):
        """
        تهيئة نظام اكتشاف الحسابات
        
        Args:
            mcc_manager: مدير MCC
        """
        self.mcc_manager = mcc_manager or MCCManager()
        self.config = DiscoveryConfig.from_env()
        
        # حالة النظام
        self.is_running = False
        self.discovery_thread = None
        self.known_accounts: Set[str] = set()
        self.last_discovery = None
        self.discovery_count = 0
        self.error_count = 0
        
        # معالجات الأحداث
        self.event_handlers: Dict[str, List[Callable]] = {
            'NEW_ACCOUNT': [],
            'ACCOUNT_UPDATED': [],
            'ACCOUNT_REMOVED': []
        }
        
        # ملف حفظ الحالة
        self.state_file = "./cache/discovery_state.json"
        
        logger.info("🔍 تم تهيئة نظام اكتشاف الحسابات")
    
    def start_monitoring(self):
        """بدء مراقبة الحسابات"""
        if not self.config.enabled:
            logger.info("⏸️ مراقبة الحسابات معطلة")
            return
        
        if self.is_running:
            logger.warning("⚠️ نظام المراقبة يعمل بالفعل")
            return
        
        logger.info("🚀 بدء مراقبة الحسابات التلقائية")
        
        # تحميل الحالة المحفوظة
        self._load_state()
        
        # بدء خيط المراقبة
        self.is_running = True
        self.discovery_thread = threading.Thread(target=self._discovery_loop, daemon=True)
        self.discovery_thread.start()
        
        logger.info(f"✅ تم بدء المراقبة - فحص كل {self.config.check_interval} ثانية")
    
    def stop_monitoring(self):
        """إيقاف مراقبة الحسابات"""
        if not self.is_running:
            return
        
        logger.info("⏹️ إيقاف مراقبة الحسابات")
        self.is_running = False
        
        if self.discovery_thread:
            self.discovery_thread.join(timeout=10)
        
        # حفظ الحالة
        self._save_state()
        
        logger.info("✅ تم إيقاف المراقبة بنجاح")
    
    def _discovery_loop(self):
        """حلقة اكتشاف الحسابات الرئيسية"""
        while self.is_running:
            try:
                self._perform_discovery()
                time.sleep(self.config.check_interval)
                
            except Exception as e:
                self.error_count += 1
                logger.error(f"❌ خطأ في حلقة الاكتشاف: {e}")
                
                # تأخير إضافي في حالة الخطأ
                time.sleep(min(self.config.retry_delay * self.error_count, 300))
    
    def _perform_discovery(self):
        """تنفيذ عملية اكتشاف واحدة"""
        try:
            logger.debug("🔍 بدء عملية اكتشاف الحسابات")
            
            # اكتشاف الحسابات الحالية
            current_accounts = self.mcc_manager.discover_accounts(force_refresh=True)
            current_account_ids = {acc.customer_id for acc in current_accounts}
            
            # البحث عن حسابات جديدة
            new_account_ids = current_account_ids - self.known_accounts
            removed_account_ids = self.known_accounts - current_account_ids
            
            # معالجة الحسابات الجديدة
            for account_id in new_account_ids:
                account = self.mcc_manager.get_account_by_id(account_id)
                if account:
                    self._handle_new_account_sync(account)
            
            # معالجة الحسابات المحذوفة
            for account_id in removed_account_ids:
                self._handle_removed_account_sync(account_id)
            
            # تحديث قائمة الحسابات المعروفة
            self.known_accounts = current_account_ids
            self.last_discovery = datetime.now()
            self.discovery_count += 1
            
            # إعادة تعيين عداد الأخطاء عند النجاح
            self.error_count = 0
            
            logger.debug(f"✅ اكتملت عملية الاكتشاف - {len(current_accounts)} حساب")
            
        except Exception as e:
            logger.error(f"❌ فشل في عملية الاكتشاف: {e}")
            raise   
    async def _handle_new_account(self, account: MCCAccount):
        """
        معالجة حساب جديد
        
        Args:
            account: الحساب الجديد
        """
        try:
            logger.info(f"🆕 تم اكتشاف حساب جديد: {account.name} ({account.customer_id})")
            
            # إنشاء حدث
            event = DiscoveryEvent(
                event_type='NEW_ACCOUNT',
                account=account,
                details={
                    'discovery_method': 'automatic',
                    'account_type': account.account_type,
                    'status': account.status
                }
            )
            
            # تشغيل معالجات الأحداث
            await self._trigger_event_handlers('NEW_ACCOUNT', event)
            
            # الإعداد التلقائي
            if self.config.auto_setup_new_accounts:
                success = self.mcc_manager.setup_new_account(account)
                if success:
                    logger.info(f"⚙️ تم إعداد الحساب {account.name} تلقائياً")
                else:
                    logger.warning(f"⚠️ فشل في الإعداد التلقائي للحساب {account.name}")
            
            # إرسال إشعار
            if self.config.notification_enabled:
                await self._send_new_account_notification(account)
            
        except Exception as e:
            logger.error(f"❌ فشل في معالجة الحساب الجديد {account.customer_id}: {e}")
    
    async def _handle_removed_account(self, account_id: str):
        """
        معالجة حساب محذوف
        
        Args:
            account_id: معرف الحساب المحذوف
        """
        try:
            logger.info(f"🗑️ تم حذف الحساب: {account_id}")
            
            # إنشاء حدث (بدون كائن الحساب لأنه محذوف)
            event = DiscoveryEvent(
                event_type='ACCOUNT_REMOVED',
                account=MCCAccount(customer_id=account_id),  # حساب فارغ
                details={'removal_detected': True}
            )
            
            # تشغيل معالجات الأحداث
            await self._trigger_event_handlers('ACCOUNT_REMOVED', event)
            
        except Exception as e:
            logger.error(f"❌ فشل في معالجة الحساب المحذوف {account_id}: {e}")
    
    async def _trigger_event_handlers(self, event_type: str, event: DiscoveryEvent):
        """
        تشغيل معالجات الأحداث
        
        Args:
            event_type: نوع الحدث
            event: بيانات الحدث
        """
        handlers = self.event_handlers.get(event_type, [])
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"❌ فشل في تشغيل معالج الحدث {event_type}: {e}")
    
    async def _send_new_account_notification(self, account: MCCAccount):
        """
        إرسال إشعار بحساب جديد
        
        Args:
            account: الحساب الجديد
        """
        try:
            message = f"""
🆕 تم اكتشاف حساب جديد في MCC

📋 التفاصيل:
• الاسم: {account.name}
• المعرف: {account.customer_id}
• النوع: {account.account_type}
• الحالة: {account.status}
• العملة: {account.currency_code}
• المنطقة الزمنية: {account.time_zone}

⏰ وقت الاكتشاف: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            """
            
            await send_notification(
                title="حساب جديد في MCC",
                message=message,
                notification_type="new_account"
            )
            
        except Exception as e:
            logger.error(f"❌ فشل في إرسال إشعار الحساب الجديد: {e}")
    
    def add_event_handler(self, event_type: str, handler: Callable):
        """
        إضافة معالج حدث
        
        Args:
            event_type: نوع الحدث (NEW_ACCOUNT, ACCOUNT_UPDATED, ACCOUNT_REMOVED)
            handler: دالة المعالجة
        """
        if event_type not in self.event_handlers:
            logger.warning(f"⚠️ نوع حدث غير معروف: {event_type}")
            return
        
        self.event_handlers[event_type].append(handler)
        logger.info(f"✅ تم إضافة معالج حدث لـ {event_type}")
    
    def remove_event_handler(self, event_type: str, handler: Callable):
        """
        إزالة معالج حدث
        
        Args:
            event_type: نوع الحدث
            handler: دالة المعالجة
        """
        if event_type in self.event_handlers:
            try:
                self.event_handlers[event_type].remove(handler)
                logger.info(f"✅ تم إزالة معالج حدث من {event_type}")
            except ValueError:
                logger.warning(f"⚠️ معالج الحدث غير موجود في {event_type}")
    
    def force_discovery(self) -> List[MCCAccount]:
        """
        فرض عملية اكتشاف فورية
        
        Returns:
            List[MCCAccount]: قائمة الحسابات المكتشفة
        """
        try:
            logger.info("🔍 بدء اكتشاف فوري للحسابات")
            
            # تنفيذ الاكتشاف
            asyncio.run(self._perform_discovery())
            
            # إرجاع الحسابات الحالية
            return list(self.mcc_manager.accounts.values())
            
        except Exception as e:
            logger.error(f"❌ فشل في الاكتشاف الفوري: {e}")
            return []
    
    def get_discovery_stats(self) -> Dict:
        """الحصول على إحصائيات الاكتشاف"""
        return {
            'is_running': self.is_running,
            'known_accounts_count': len(self.known_accounts),
            'last_discovery': self.last_discovery.isoformat() if self.last_discovery else None,
            'discovery_count': self.discovery_count,
            'error_count': self.error_count,
            'check_interval': self.config.check_interval,
            'auto_setup_enabled': self.config.auto_setup_new_accounts
        }
    
    def _load_state(self):
        """تحميل حالة النظام المحفوظة"""
        try:
            if os.path.exists(self.state_file):
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                
                self.known_accounts = set(state.get('known_accounts', []))
                self.discovery_count = state.get('discovery_count', 0)
                
                if state.get('last_discovery'):
                    self.last_discovery = datetime.fromisoformat(state['last_discovery'])
                
                logger.info(f"📋 تم تحميل حالة النظام - {len(self.known_accounts)} حساب معروف")
                
        except Exception as e:
            logger.warning(f"⚠️ فشل في تحميل حالة النظام: {e}")
    
    def _save_state(self):
        """حفظ حالة النظام"""
        try:
            os.makedirs(os.path.dirname(self.state_file), exist_ok=True)
            
            state = {
                'known_accounts': list(self.known_accounts),
                'discovery_count': self.discovery_count,
                'last_discovery': self.last_discovery.isoformat() if self.last_discovery else None,
                'saved_at': datetime.now().isoformat()
            }
            
            with open(self.state_file, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
                
            logger.debug("💾 تم حفظ حالة النظام")
            
        except Exception as e:
            logger.warning(f"⚠️ فشل في حفظ حالة النظام: {e}")

    def _handle_new_account_sync(self, account: 'MCCAccount'):
        """
        معالجة حساب جديد (نسخة متزامنة)
        
        Args:
            account: الحساب الجديد
        """
        try:
            logger.info(f"🆕 تم اكتشاف حساب جديد: {account.name} ({account.customer_id})")
            
            # إنشاء حدث
            event = DiscoveryEvent(
                event_type='NEW_ACCOUNT',
                account=account,
                details={
                    'discovery_method': 'automatic',
                    'account_type': account.account_type,
                    'status': account.status
                }
            )
            
            # الإعداد التلقائي
            if self.config.auto_setup_new_accounts:
                success = self.mcc_manager.setup_new_account(account)
                if success:
                    logger.info(f"⚙️ تم إعداد الحساب {account.name} تلقائياً")
                else:
                    logger.warning(f"⚠️ فشل في الإعداد التلقائي للحساب {account.name}")
            
        except Exception as e:
            logger.error(f"❌ فشل في معالجة الحساب الجديد {account.customer_id}: {e}")
    
    def _handle_removed_account_sync(self, account_id: str):
        """
        معالجة حساب محذوف (نسخة متزامنة)
        
        Args:
            account_id: معرف الحساب المحذوف
        """
        try:
            logger.info(f"🗑️ تم حذف الحساب: {account_id}")
            
            # إنشاء حدث (بدون كائن الحساب لأنه محذوف)
            event = DiscoveryEvent(
                event_type='ACCOUNT_REMOVED',
                account=None,
                details={
                    'removed_account_id': account_id,
                    'removal_time': datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"❌ فشل في معالجة الحساب المحذوف {account_id}: {e}")

# دوال مساعدة للاستخدام السريع
def start_account_discovery() -> AccountDiscovery:
    """بدء نظام اكتشاف الحسابات"""
    discovery = AccountDiscovery()
    discovery.start_monitoring()
    return discovery

def stop_account_discovery(discovery: AccountDiscovery):
    """إيقاف نظام اكتشاف الحسابات"""
    discovery.stop_monitoring()

# معالجات أحداث افتراضية
async def default_new_account_handler(event: DiscoveryEvent):
    """معالج افتراضي للحسابات الجديدة"""
    account = event.account
    logger.info(f"🎉 مرحباً بالحساب الجديد: {account.name}")

async def default_removed_account_handler(event: DiscoveryEvent):
    """معالج افتراضي للحسابات المحذوفة"""
    logger.info(f"👋 وداعاً للحساب: {event.account.customer_id}")

# اختبار النظام
if __name__ == "__main__":
    print("🧪 اختبار نظام اكتشاف الحسابات...")
    
    try:
        # إنشاء نظام الاكتشاف
        discovery = AccountDiscovery()
        
        # إضافة معالجات الأحداث
        discovery.add_event_handler('NEW_ACCOUNT', default_new_account_handler)
        discovery.add_event_handler('ACCOUNT_REMOVED', default_removed_account_handler)
        
        # تشغيل اكتشاف فوري
        accounts = discovery.force_discovery()
        print(f"✅ تم اكتشاف {len(accounts)} حساب")
        
        # عرض الإحصائيات
        stats = discovery.get_discovery_stats()
        print(f"📊 إحصائيات الاكتشاف:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        # بدء المراقبة لمدة قصيرة للاختبار
        print("🚀 بدء المراقبة لمدة 30 ثانية...")
        discovery.start_monitoring()
        time.sleep(30)
        discovery.stop_monitoring()
        
        print("✅ انتهى الاختبار بنجاح")
        
    except Exception as e:
        print(f"❌ خطأ في الاختبار: {e}")

