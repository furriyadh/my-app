"""
🔐 Token Refresh Service - نظام التجديد التلقائي للـ OAuth Tokens
================================================================

هذه الخدمة تقوم بـ:
1. تخزين OAuth Tokens في Supabase
2. تجديد Access Token تلقائياً قبل انتهاء صلاحيته
3. الاحتفاظ بالـ Refresh Token محدّث في الداتابيز

الجداول المطلوبة في Supabase:
- oauth_tokens: لتخزين الـ tokens

"""

import os
import time
import logging
import threading
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import requests

# تحميل البيئة
try:
    from dotenv import load_dotenv
    load_dotenv('../.env.development')
except:
    pass

# إعداد التسجيل
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# إضافة handler للـ console إذا لم يكن موجوداً
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)


class TokenRefreshService:
    """
    خدمة التجديد التلقائي للـ OAuth Tokens
    
    تقوم بـ:
    - تخزين tokens في Supabase
    - تجديد access_token تلقائياً
    - تحديث refresh_token إذا أرجع Google واحد جديد
    """
    
    # Token Endpoint لـ Google
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    
    # تجديد Access Token قبل 5 دقائق من انتهائه
    REFRESH_MARGIN_SECONDS = 300
    
    # الحد الأدنى للفحص (كل دقيقة)
    MIN_CHECK_INTERVAL_SECONDS = 60
    
    def __init__(self, supabase_client=None):
        """
        تهيئة خدمة التجديد
        
        Args:
            supabase_client: عميل Supabase للتخزين
        """
        self.supabase = supabase_client
        self._init_supabase()
        
        # OAuth Credentials من البيئة
        self.client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        
        # Token cache في الذاكرة
        self._token_cache: Dict[str, Any] = {}
        
        # Background thread للتجديد التلقائي
        self._refresh_thread: Optional[threading.Thread] = None
        self._stop_refresh = threading.Event()
        
        # تشغيل التجديد التلقائي
        self._start_auto_refresh()
        
        logger.info("✅ تم تهيئة Token Refresh Service")
    
    def _init_supabase(self):
        """تهيئة عميل Supabase"""
        if self.supabase:
            return
        
        try:
            from supabase import create_client
            
            supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
            
            if supabase_url and supabase_key:
                self.supabase = create_client(supabase_url, supabase_key)
                logger.info("✅ تم الاتصال بـ Supabase")
            else:
                logger.warning("⚠️ متغيرات Supabase غير موجودة")
                
        except Exception as e:
            logger.error(f"❌ فشل في الاتصال بـ Supabase: {e}")
    
    def store_token(self, 
                    token_name: str,
                    access_token: str, 
                    refresh_token: str,
                    expires_in: int = 3600,
                    token_type: str = "google_ads") -> bool:
        """
        حفظ Token في الداتابيز
        
        Args:
            token_name: اسم التوكن (مثل 'mcc_main')
            access_token: Access Token
            refresh_token: Refresh Token
            expires_in: مدة الصلاحية بالثواني
            token_type: نوع التوكن
            
        Returns:
            bool: نجاح العملية
        """
        try:
            if not self.supabase:
                logger.error("❌ Supabase غير متصل")
                return False
            
            # حساب وقت الانتهاء
            expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            
            # البحث عن token موجود
            existing = self.supabase.table('oauth_tokens') \
                .select('id') \
                .eq('token_name', token_name) \
                .single() \
                .execute()
            
            token_data = {
                'token_name': token_name,
                'token_type': token_type,
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_at': expires_at.isoformat(),
                'expires_in': expires_in,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            if existing.data:
                # تحديث Token موجود
                result = self.supabase.table('oauth_tokens') \
                    .update(token_data) \
                    .eq('token_name', token_name) \
                    .execute()
                logger.info(f"✅ تم تحديث Token: {token_name}")
            else:
                # إنشاء Token جديد
                token_data['created_at'] = datetime.utcnow().isoformat()
                result = self.supabase.table('oauth_tokens') \
                    .insert(token_data) \
                    .execute()
                logger.info(f"✅ تم إنشاء Token جديد: {token_name}")
            
            # تحديث الكاش
            self._token_cache[token_name] = {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'expires_at': expires_at
            }
            
            return True
            
        except Exception as e:
            logger.error(f"❌ فشل في حفظ Token: {e}")
            return False
    
    def get_token(self, token_name: str) -> Optional[Dict[str, Any]]:
        """
        الحصول على Token من الداتابيز
        
        Args:
            token_name: اسم التوكن
            
        Returns:
            Dict مع access_token و refresh_token أو None
        """
        try:
            # فحص الكاش أولاً
            if token_name in self._token_cache:
                cached = self._token_cache[token_name]
                # تحقق من الصلاحية
                if cached['expires_at'] > datetime.utcnow():
                    return cached
            
            if not self.supabase:
                # إرجاع Token من البيئة كـ fallback
                return self._get_env_token()
            
            result = self.supabase.table('oauth_tokens') \
                .select('*') \
                .eq('token_name', token_name) \
                .single() \
                .execute()
            
            if result.data:
                token = result.data
                expires_at = datetime.fromisoformat(token['expires_at'].replace('Z', '+00:00'))
                
                # تحديث الكاش
                self._token_cache[token_name] = {
                    'access_token': token['access_token'],
                    'refresh_token': token['refresh_token'],
                    'expires_at': expires_at
                }
                
                return self._token_cache[token_name]
            
            return None
            
        except Exception as e:
            logger.error(f"❌ فشل في جلب Token: {e}")
            # Fallback إلى متغيرات البيئة
            return self._get_env_token()
    
    def _get_env_token(self) -> Dict[str, Any]:
        """الحصول على Token من متغيرات البيئة كـ fallback"""
        return {
            'access_token': None,  # يتم الحصول عليه عند الحاجة
            'refresh_token': os.getenv('GOOGLE_ADS_REFRESH_TOKEN') or os.getenv('MCC_REFRESH_TOKEN'),
            'expires_at': datetime.utcnow()  # منتهي = يحتاج تجديد
        }
    
    def refresh_access_token(self, token_name: str = 'mcc_main') -> Optional[str]:
        """
        تجديد Access Token باستخدام Refresh Token
        
        Args:
            token_name: اسم التوكن
            
        Returns:
            Access Token الجديد أو None
        """
        try:
            # الحصول على Refresh Token
            token_data = self.get_token(token_name)
            if not token_data or not token_data.get('refresh_token'):
                logger.error("❌ لا يوجد Refresh Token")
                return None
            
            refresh_token = token_data['refresh_token']
            
            if not self.client_id or not self.client_secret:
                logger.error("❌ OAuth credentials غير موجودة")
                return None
            
            # طلب تجديد Token
            response = requests.post(self.TOKEN_URL, data={
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            })
            
            if response.status_code != 200:
                error_data = response.json()
                logger.error(f"❌ فشل تجديد Token: {error_data}")
                return None
            
            data = response.json()
            
            access_token = data.get('access_token')
            expires_in = data.get('expires_in', 3600)
            new_refresh_token = data.get('refresh_token', refresh_token)  # قد يُرجع refresh جديد
            
            if not access_token:
                logger.error("❌ لم يتم الحصول على Access Token")
                return None
            
            # حفظ الـ Token الجديد
            self.store_token(
                token_name=token_name,
                access_token=access_token,
                refresh_token=new_refresh_token,
                expires_in=expires_in
            )
            
            logger.info(f"✅ تم تجديد Access Token - ينتهي في {expires_in} ثانية")
            
            # إذا أرجع Google refresh token جديد، نسجله
            if new_refresh_token != refresh_token:
                logger.info("🔄 تم الحصول على Refresh Token جديد!")
            
            return access_token
            
        except Exception as e:
            logger.error(f"❌ خطأ في تجديد Token: {e}")
            return None
    
    def get_valid_access_token(self, token_name: str = 'mcc_main') -> Optional[str]:
        """
        الحصول على Access Token صالح (يجدد تلقائياً إذا لزم)
        
        Args:
            token_name: اسم التوكن
            
        Returns:
            Access Token صالح أو None
        """
        try:
            token_data = self.get_token(token_name)
            
            if not token_data:
                # لا يوجد token محفوظ، حاول التجديد
                return self.refresh_access_token(token_name)
            
            # فحص انتهاء الصلاحية
            expires_at = token_data.get('expires_at')
            now = datetime.utcnow()
            
            # إذا منتهي أو سينتهي قريباً
            if expires_at and (expires_at - now).total_seconds() < self.REFRESH_MARGIN_SECONDS:
                logger.info("⏰ Token قارب على الانتهاء، جاري التجديد...")
                return self.refresh_access_token(token_name)
            
            # Token صالح
            access_token = token_data.get('access_token')
            if access_token:
                return access_token
            
            # لا يوجد access token، حاول التجديد
            return self.refresh_access_token(token_name)
            
        except Exception as e:
            logger.error(f"❌ خطأ في الحصول على Access Token: {e}")
            return None
    
    def _start_auto_refresh(self):
        """بدء التجديد التلقائي في الخلفية"""
        if self._refresh_thread and self._refresh_thread.is_alive():
            return
        
        self._stop_refresh.clear()
        self._refresh_thread = threading.Thread(
            target=self._auto_refresh_loop,
            daemon=True,
            name="TokenRefreshThread"
        )
        self._refresh_thread.start()
        logger.info("🔄 تم بدء التجديد التلقائي للـ Tokens")
    
    def _auto_refresh_loop(self):
        """حلقة التجديد التلقائي"""
        while not self._stop_refresh.is_set():
            try:
                # فحص كل الـ tokens المخزنة
                self._check_and_refresh_tokens()
                
                # انتظار قبل الفحص التالي
                self._stop_refresh.wait(self.MIN_CHECK_INTERVAL_SECONDS)
                
            except Exception as e:
                logger.error(f"❌ خطأ في حلقة التجديد: {e}")
                time.sleep(60)  # انتظار دقيقة عند الخطأ
    
    def _check_and_refresh_tokens(self):
        """فحص وتجديد جميع الـ Tokens"""
        try:
            if not self.supabase:
                return
            
            # جلب جميع الـ tokens
            result = self.supabase.table('oauth_tokens').select('*').execute()
            
            if not result.data:
                return
            
            now = datetime.utcnow()
            
            for token in result.data:
                token_name = token['token_name']
                expires_at_str = token.get('expires_at')
                
                if not expires_at_str:
                    continue
                
                # تحويل expires_at
                try:
                    # إزالة timezone info للمقارنة
                    expires_at_clean = expires_at_str.replace('Z', '').replace('+00:00', '')
                    if '.' in expires_at_clean:
                        expires_at_clean = expires_at_clean.split('.')[0]
                    expires_at = datetime.fromisoformat(expires_at_clean)
                except:
                    expires_at = now  # افترض أنه منتهي
                
                # فحص إذا يحتاج تجديد
                seconds_until_expiry = (expires_at - now).total_seconds()
                
                if seconds_until_expiry < self.REFRESH_MARGIN_SECONDS:
                    logger.info(f"⏰ Token '{token_name}' يحتاج تجديد (ينتهي في {seconds_until_expiry:.0f} ثانية)")
                    self.refresh_access_token(token_name)
                else:
                    minutes_remaining = seconds_until_expiry / 60
                    logger.debug(f"✅ Token '{token_name}' صالح ({minutes_remaining:.0f} دقيقة متبقية)")
                    
        except Exception as e:
            logger.error(f"❌ خطأ في فحص الـ Tokens: {e}")
    
    def stop(self):
        """إيقاف التجديد التلقائي"""
        self._stop_refresh.set()
        if self._refresh_thread:
            self._refresh_thread.join(timeout=5)
        logger.info("⏹️ تم إيقاف التجديد التلقائي")
    
    def initialize_from_env(self, token_name: str = 'mcc_main') -> bool:
        """
        تهيئة Token من متغيرات البيئة وحفظه في الداتابيز
        
        Args:
            token_name: اسم التوكن
            
        Returns:
            bool: نجاح العملية
        """
        try:
            refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN') or os.getenv('MCC_REFRESH_TOKEN')
            
            if not refresh_token:
                logger.error("❌ لا يوجد Refresh Token في متغيرات البيئة")
                return False
            
            # حفظ Refresh Token فقط (بدون Access Token)
            if self.supabase:
                # فحص إذا كان Token موجود
                try:
                    existing = self.supabase.table('oauth_tokens') \
                        .select('id') \
                        .eq('token_name', token_name) \
                        .execute()
                    
                    if existing.data and len(existing.data) > 0:
                        # Token موجود، تحديث فقط
                        self.supabase.table('oauth_tokens') \
                            .update({'refresh_token': refresh_token, 'updated_at': datetime.utcnow().isoformat()}) \
                            .eq('token_name', token_name) \
                            .execute()
                        logger.info(f"✅ تم تحديث Token '{token_name}' في الداتابيز")
                    else:
                        # Token غير موجود، إضافة جديد
                        token_data = {
                            'token_name': token_name,
                            'token_type': 'google_ads',
                            'access_token': '',
                            'refresh_token': refresh_token,
                            'expires_at': datetime.utcnow().isoformat(),
                            'expires_in': 0,
                            'created_at': datetime.utcnow().isoformat(),
                            'updated_at': datetime.utcnow().isoformat()
                        }
                        self.supabase.table('oauth_tokens').insert(token_data).execute()
                        logger.info(f"✅ تم إنشاء Token '{token_name}' في الداتابيز")
                except Exception as db_err:
                    logger.warning(f"⚠️ خطأ في الداتابيز: {db_err}")
                logger.info(f"✅ تم تهيئة Token '{token_name}' من متغيرات البيئة")
            
            # تجديد Access Token فوراً
            access_token = self.refresh_access_token(token_name)
            
            return access_token is not None
            
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة Token: {e}")
            return False


# ===== إنشاء instance عام =====
token_refresh_service: Optional[TokenRefreshService] = None

def get_token_refresh_service() -> TokenRefreshService:
    """الحصول على خدمة التجديد التلقائي"""
    global token_refresh_service
    
    if token_refresh_service is None:
        token_refresh_service = TokenRefreshService()
    
    return token_refresh_service


# ===== دوال مساعدة للاستخدام السريع =====

def get_valid_access_token(token_name: str = 'mcc_main') -> Optional[str]:
    """الحصول على Access Token صالح"""
    service = get_token_refresh_service()
    return service.get_valid_access_token(token_name)


def refresh_token_now(token_name: str = 'mcc_main') -> Optional[str]:
    """تجديد Token الآن"""
    service = get_token_refresh_service()
    return service.refresh_access_token(token_name)


def initialize_token_from_env(token_name: str = 'mcc_main') -> bool:
    """تهيئة Token من البيئة"""
    service = get_token_refresh_service()
    return service.initialize_from_env(token_name)


# تصدير
__all__ = [
    'TokenRefreshService',
    'get_token_refresh_service',
    'get_valid_access_token',
    'refresh_token_now',
    'initialize_token_from_env'
]
