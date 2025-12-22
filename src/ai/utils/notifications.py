#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
📢 Notifications Utility - أداة الإشعارات
=========================================

نظام إشعارات متقدم لمنصة Google Ads AI Platform
يدعم إرسال الإشعارات عبر قنوات متعددة

المطور: Google Ads AI Platform Team
التاريخ: 2025-07-07
الإصدار: 1.0.0
"""

import os
import json
import smtplib
from datetime import datetime
from typing import Dict, Any, List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dataclasses import dataclass
from enum import Enum

class NotificationType(Enum):
    """أنواع الإشعارات"""
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    SUCCESS = "SUCCESS"
    CRITICAL = "CRITICAL"

class NotificationChannel(Enum):
    """قنوات الإشعارات"""
    EMAIL = "EMAIL"
    CONSOLE = "CONSOLE"
    FILE = "FILE"
    WEBHOOK = "WEBHOOK"

@dataclass
class Notification:
    """كائن الإشعار"""
    title: str
    message: str
    notification_type: NotificationType
    timestamp: datetime
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """تحويل الإشعار إلى قاموس"""
        return {
            'title': self.title,
            'message': self.message,
            'type': self.notification_type.value,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata
        }

class NotificationManager:
    """
    مدير الإشعارات
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """تهيئة مدير الإشعارات"""
        self.config = config or {}
        self.enabled_channels = self.config.get('enabled_channels', [NotificationChannel.CONSOLE])
        
        # إعدادات البريد الإلكتروني
        self.email_config = {
            'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', '587')),
            'email_user': os.getenv('EMAIL_USER', ''),
            'email_password': os.getenv('EMAIL_PASSWORD', ''),
            'from_email': os.getenv('FROM_EMAIL', ''),
            'to_emails': os.getenv('TO_EMAILS', '').split(',') if os.getenv('TO_EMAILS') else []
        }
        
        # مسار ملف الإشعارات
        self.notifications_file = os.getenv('NOTIFICATIONS_FILE', 'logs/notifications.json')
    
    def send_notification(
        self,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        metadata: Optional[Dict[str, Any]] = None,
        channels: Optional[List[NotificationChannel]] = None
    ) -> bool:
        """
        إرسال إشعار
        
        Args:
            title: عنوان الإشعار
            message: نص الإشعار
            notification_type: نوع الإشعار
            metadata: بيانات إضافية
            channels: قنوات الإرسال
        
        Returns:
            bool: نجح الإرسال أم لا
        """
        try:
            # إنشاء كائن الإشعار
            notification = Notification(
                title=title,
                message=message,
                notification_type=notification_type,
                timestamp=datetime.now(),
                metadata=metadata or {}
            )
            
            # تحديد قنوات الإرسال
            if channels is None:
                channels = self.enabled_channels
            
            # إرسال عبر القنوات المختلفة
            success = True
            for channel in channels:
                try:
                    if channel == NotificationChannel.CONSOLE:
                        self._send_console_notification(notification)
                    elif channel == NotificationChannel.EMAIL:
                        self._send_email_notification(notification)
                    elif channel == NotificationChannel.FILE:
                        self._send_file_notification(notification)
                    elif channel == NotificationChannel.WEBHOOK:
                        self._send_webhook_notification(notification)
                except Exception as e:
                    print(f"❌ فشل إرسال الإشعار عبر {channel.value}: {e}")
                    success = False
            
            return success
            
        except Exception as e:
            print(f"❌ خطأ في إرسال الإشعار: {e}")
            return False
    
    def _send_console_notification(self, notification: Notification):
        """إرسال إشعار للكونسول"""
        # رموز الإشعارات
        icons = {
            NotificationType.INFO: "ℹ️",
            NotificationType.WARNING: "⚠️",
            NotificationType.ERROR: "❌",
            NotificationType.SUCCESS: "✅",
            NotificationType.CRITICAL: "🚨"
        }
        
        icon = icons.get(notification.notification_type, "📢")
        timestamp = notification.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
        print(f"\n{icon} [{timestamp}] {notification.title}")
        print(f"   {notification.message}")
        
        if notification.metadata:
            print(f"   📋 معلومات إضافية: {notification.metadata}")
    
    def _send_email_notification(self, notification: Notification):
        """إرسال إشعار بالبريد الإلكتروني"""
        if not self.email_config['email_user'] or not self.email_config['to_emails']:
            return
        
        try:
            # إنشاء الرسالة
            msg = MIMEMultipart()
            msg['From'] = self.email_config['from_email'] or self.email_config['email_user']
            msg['To'] = ', '.join(self.email_config['to_emails'])
            msg['Subject'] = f"[{notification.notification_type.value}] {notification.title}"
            
            # محتوى الرسالة
            body = f"""
            {notification.message}
            
            الوقت: {notification.timestamp.strftime("%Y-%m-%d %H:%M:%S")}
            النوع: {notification.notification_type.value}
            
            معلومات إضافية:
            {json.dumps(notification.metadata, indent=2, ensure_ascii=False)}
            
            ---
            Google Ads AI Platform
            """
            
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # إرسال الرسالة
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['email_user'], self.email_config['email_password'])
            
            text = msg.as_string()
            server.sendmail(msg['From'], self.email_config['to_emails'], text)
            server.quit()
            
        except Exception as e:
            print(f"❌ فشل إرسال البريد الإلكتروني: {e}")
    
    def _send_file_notification(self, notification: Notification):
        """حفظ الإشعار في ملف"""
        try:
            # إنشاء مجلد السجلات إذا لم يكن موجوداً
            os.makedirs(os.path.dirname(self.notifications_file), exist_ok=True)
            
            # قراءة الإشعارات الموجودة
            notifications = []
            if os.path.exists(self.notifications_file):
                try:
                    with open(self.notifications_file, 'r', encoding='utf-8') as f:
                        notifications = json.load(f)
                except:
                    notifications = []
            
            # إضافة الإشعار الجديد
            notifications.append(notification.to_dict())
            
            # الاحتفاظ بآخر 1000 إشعار فقط
            if len(notifications) > 1000:
                notifications = notifications[-1000:]
            
            # حفظ الإشعارات
            with open(self.notifications_file, 'w', encoding='utf-8') as f:
                json.dump(notifications, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"❌ فشل حفظ الإشعار في الملف: {e}")
    
    def _send_webhook_notification(self, notification: Notification):
        """إرسال إشعار عبر webhook"""
        # يمكن تطوير هذه الوظيفة لاحقاً
        pass
    
    def get_recent_notifications(self, limit: int = 50) -> List[Dict[str, Any]]:
        """الحصول على الإشعارات الأخيرة"""
        try:
            if not os.path.exists(self.notifications_file):
                return []
            
            with open(self.notifications_file, 'r', encoding='utf-8') as f:
                notifications = json.load(f)
            
            return notifications[-limit:] if notifications else []
            
        except Exception as e:
            print(f"❌ خطأ في قراءة الإشعارات: {e}")
            return []

# إنشاء مدير إشعارات افتراضي
default_notification_manager = NotificationManager()

# دوال مساعدة سريعة
def notify_info(title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    """إرسال إشعار معلومات"""
    default_notification_manager.send_notification(title, message, NotificationType.INFO, metadata)

def notify_warning(title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    """إرسال إشعار تحذير"""
    default_notification_manager.send_notification(title, message, NotificationType.WARNING, metadata)

def notify_error(title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    """إرسال إشعار خطأ"""
    default_notification_manager.send_notification(title, message, NotificationType.ERROR, metadata)

def notify_success(title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    """إرسال إشعار نجاح"""
    default_notification_manager.send_notification(title, message, NotificationType.SUCCESS, metadata)

def notify_critical(title: str, message: str, metadata: Optional[Dict[str, Any]] = None):
    """إرسال إشعار حرج"""
    default_notification_manager.send_notification(title, message, NotificationType.CRITICAL, metadata)

# اختبار النظام
if __name__ == "__main__":
    # اختبار نظام الإشعارات
    notify_info("اختبار النظام", "تم تشغيل نظام الإشعارات بنجاح")
    notify_success("نجح الاختبار", "جميع الوظائف تعمل بشكل صحيح")
    
    print("✅ تم اختبار نظام الإشعارات بنجاح")

