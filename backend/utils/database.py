import os
from postgrest import SyncPostgrestClient
from typing import Optional, Dict, Any, List

class DatabaseManager:
    """مدير قاعدة البيانات باستخدام Supabase"""
    
    def __init__(self):
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            print("تحذير: لم يتم تقديم قيم Supabase صالحة")
            self.client = None
            self.admin_client = None
            return
        
        try:
            self.client: SyncPostgrestClient = SyncPostgrestClient(self.supabase_url + "/rest/v1", schema="public")
            
            # إنشاء عميل منفصل للعمليات الإدارية
            if self.service_role_key:
                self.admin_client: SyncPostgrestClient = SyncPostgrestClient(self.supabase_url + "/rest/v1", schema="public")
            else:
                self.admin_client = self.client
        except Exception as e:
            print(f"تحذير: فشل في تهيئة Supabase: {e}")
            self.client = None
            self.admin_client = None
    
    def get_client(self) -> Optional[SyncPostgrestClient]:
        """الحصول على عميل Supabase"""
        return self.client
    
    def get_admin_client(self) -> Optional[SyncPostgrestClient]:
        """الحصول على عميل Supabase الإداري"""
        return self.admin_client
    
    @property
    def is_connected(self) -> bool:
        """فحص حالة الاتصال"""
        return self.client is not None

