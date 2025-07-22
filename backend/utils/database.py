import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List

class DatabaseManager:
    """مدير قاعدة البيانات باستخدام Supabase"""
    
    def __init__(self):
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("لم يتم تقديم قيم Supabase صالحة")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        
        # إنشاء عميل منفصل للعمليات الإدارية
        if self.service_role_key:
            self.admin_client: Client = create_client(self.supabase_url, self.service_role_key)
        else:
            self.admin_client = self.client
    
    def get_client(self) -> Client:
        """الحصول على عميل Supabase"""
        return self.client
    
    def get_admin_client(self) -> Client:
        """الحصول على عميل Supabase الإداري"""
        return self.admin_client

