import logging
import secrets
import hashlib
import base64
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from urllib.parse import urlencode
import os

# إعداد التسجيل
logger = logging.getLogger(__name__)

class OAuthHandler:
    """معالج OAuth 2.0 المتطور لـ Google Ads"""
    
    def __init__(self):
        """تهيئة معالج OAuth"""
        self.logger = logging.getLogger(__name__)
        
        # إعدادات OAuth من متغيرات البيئة
        self.client_id = os.getenv("GOOGLE_ADS_CLIENT_ID") # تم التعديل لاستخدام GOOGLE_ADS_CLIENT_ID
        self.client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET") # تم التعديل لاستخدام GOOGLE_ADS_CLIENT_SECRET
        self.redirect_uri = os.getenv("GOOGLE_ADS_REDIRECT_URI", "http://localhost:3000/auth/callback" ) # تم التعديل لاستخدام GOOGLE_ADS_REDIRECT_URI
        self.developer_token = os.getenv("GOOGLE_DEVELOPER_TOKEN")
        
        # نطاقات Google Ads
        self.scopes = [
            "https://www.googleapis.com/auth/adwords",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
        
        # URLs للـ OAuth
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        self.revoke_url = "https://oauth2.googleapis.com/revoke"
        
        # تخزين الجلسات النشطة (للتطوير، يفضل استخدام قاعدة بيانات أو Redis في الإنتاج )
        self.active_sessions = {}
        self.token_cache = {}
        
        self.logger.info("تم تهيئة معالج OAuth")
    
    # ===========================================
    # إنشاء روابط التفويض
    # ===========================================
    
    def create_authorization_url(self, user_id: str, ip_address: str, user_agent: str) -> Dict[str, Any]:
        """إنشاء رابط تفويض Google Ads API"""
        if not all([self.client_id, self.redirect_uri]):
            self.logger.error("معرف العميل أو URI إعادة التوجيه مفقود")
            return {"success": False, "message": "معرف العميل أو URI إعادة التوجيه مفقود"}

        # إنشاء code_verifier و code_challenge
        code_verifier = secrets.token_urlsafe(96)
        code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode()).digest()).decode().rstrip("=")

        # تخزين code_verifier في الجلسة
        session_id = secrets.token_urlsafe(32)
        self.active_sessions[session_id] = {
            "user_id": user_id,
            "code_verifier": code_verifier,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now().isoformat()
        }
        self.logger.info(f"تم إنشاء جلسة OAuth جديدة: {session_id}")

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.scopes),
            "access_type": "offline",
            "prompt": "consent",
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "state": session_id  # استخدام session_id كـ state
        }
        auth_url = f"{self.auth_url}?{urlencode(params)}"
        return {"success": True, "authorization_url": auth_url, "session_id": session_id}

    # ===========================================
    # معالجة رد الاتصال (Callback)
    # ===========================================

    def handle_oauth_callback(self, code: str, state: str) -> Dict[str, Any]:
        """معالجة رد الاتصال من Google OAuth"""
        session_data = self.active_sessions.pop(state, None)
        if not session_data:
            self.logger.error(f"جلسة غير صالحة أو منتهية الصلاحية: {state}")
            return {"success": False, "message": "جلسة غير صالحة أو منتهية الصلاحية"}

        code_verifier = session_data["code_verifier"]

        token_params = {
            "code": code,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "grant_type": "authorization_code",
            "code_verifier": code_verifier
        }

        try:
            response = requests.post(self.token_url, data=token_params)
            response.raise_for_status()  # يرفع استثناء لأخطاء HTTP
            token_data = response.json()

            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")
            expires_in = token_data.get("expires_in")

            if not access_token:
                self.logger.error(f"لم يتم الحصول على access_token: {token_data}")
                return {"success": False, "message": "لم يتم الحصول على access_token", "details": token_data}

            # تخزين الرموز (في الإنتاج، يجب تخزينها في قاعدة بيانات)
            self.token_cache[session_data["user_id"]] = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_at": datetime.now() + timedelta(seconds=expires_in),
                "scope": token_data.get("scope"),
                "token_type": token_data.get("token_type")
            }
            user_id = session_data["user_id"]
            self.logger.info(f"تم الحصول على الرموز بنجاح للمستخدم: {user_id}")

            return {"success": True, "access_token": access_token, "refresh_token": refresh_token}

        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في طلب الرمز: {e}")
            return {"success": False, "message": f"خطأ في طلب الرمز: {e}"}
        except json.JSONDecodeError as e:
            self.logger.error(f"خطأ في تحليل استجابة JSON: {e}")
            return {"success": False, "message": f"خطأ في تحليل استجابة JSON: {e}"}

    # ===========================================
    # تجديد رمز الوصول
    # ===========================================

    def refresh_access_token(self, user_id: str) -> Dict[str, Any]:
        """تجديد رمز الوصول باستخدام refresh_token"""
        user_tokens = self.token_cache.get(user_id)
        if not user_tokens or not user_tokens.get("refresh_token"):
            self.logger.warning(f"لا يوجد refresh_token للمستخدم: {user_id}")
            return {"success": False, "message": "لا يوجد refresh_token متاح"}

        refresh_token = user_tokens["refresh_token"]

        token_params = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }

        try:
            response = requests.post(self.token_url, data=token_params)
            response.raise_for_status()
            token_data = response.json()

            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in")

            if not access_token:
                self.logger.error(f"فشل تجديد access_token: {token_data}")
                return {"success": False, "message": "فشل تجديد access_token", "details": token_data}

            # تحديث الرموز في الكاش
            user_tokens["access_token"] = access_token
            user_tokens["expires_at"] = datetime.now() + timedelta(seconds=expires_in)
            self.token_cache[user_id] = user_tokens
            self.logger.info(f"تم تجديد access_token بنجاح للمستخدم: {user_id}")

            return {"success": True, "access_token": access_token}

        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في طلب تجديد الرمز: {e}")
            return {"success": False, "message": f"خطأ في طلب تجديد الرمز: {e}"}

    # ===========================================
    # إلغاء الرمز (Revoke Token)
    # ===========================================

    def revoke_token(self, user_id: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول أو التجديد"""
        user_tokens = self.token_cache.pop(user_id, None)
        if not user_tokens or not user_tokens.get("access_token"):
            self.logger.warning(f"لا يوجد رمز متاح للإلغاء للمستخدم: {user_id}")
            return {"success": False, "message": "لا يوجد رمز متاح للإلغاء"}

        token_to_revoke = user_tokens["access_token"]

        revoke_params = {
            "token": token_to_revoke
        }

        try:
            response = requests.post(self.revoke_url, data=revoke_params)
            response.raise_for_status()
            self.logger.info(f"تم إلغاء الرمز بنجاح للمستخدم: {user_id}")
            return {"success": True, "message": "تم إلغاء الرمز بنجاح"}
        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في إلغاء الرمز: {e}")
            return {"success": False, "message": f"خطأ في إلغاء الرمز: {e}"}

    # ===========================================
    # الحصول على معلومات المستخدم
    # ===========================================

    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """الحصول على معلومات المستخدم من Google"""
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        try:
            response = requests.get(self.userinfo_url, headers=headers)
            response.raise_for_status()
            user_info = response.json()
            user_email = user_info.get("email")
            self.logger.info(f"تم الحصول على معلومات المستخدم: {user_email}")
            return {"success": True, "user_info": user_info}
        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في الحصول على معلومات المستخدم: {e}")
            return {"success": False, "message": f"خطأ في الحصول على معلومات المستخدم: {e}"}

# مثال للاستخدام (للتطوير فقط)
if __name__ == "__main__":
    # تأكد من تعيين متغيرات البيئة قبل التشغيل
    os.environ["GOOGLE_ADS_CLIENT_ID"] = "YOUR_CLIENT_ID"
    os.environ["GOOGLE_ADS_CLIENT_SECRET"] = "YOUR_CLIENT_SECRET"
    os.environ["GOOGLE_ADS_REDIRECT_URI"] = "http://localhost:3000/api/oauth/callback"
    os.environ["GOOGLE_DEVELOPER_TOKEN"] = "YOUR_DEVELOPER_TOKEN"
    
    oauth_handler = OAuthHandler( )
    
    # مثال: إنشاء رابط تفويض
    auth_url_result = oauth_handler.create_authorization_url("test_user_123", "192.168.1.1", "TestBrowser")
    if auth_url_result["success"]:
        auth_url = auth_url_result["authorization_url"]
        session_id = auth_url_result["session_id"]
        print(f"رابط التفويض: {auth_url}")
        print(f"معرف الجلسة: {session_id}")
    else:
        message = auth_url_result["message"]
        print(f"خطأ: {message}")

    # مثال: تجديد رمز الوصول (يتطلب refresh token صالح)
    # user_id_to_refresh = "some_user_id"
    # refresh_result = oauth_handler.refresh_access_token(user_id_to_refresh)
    # if refresh_result["success"]:
    #     access_token = refresh_result["access_token"]
    #     print(f"تم تجديد رمز الوصول بنجاح: {access_token}")
    # else:
    #     message = refresh_result["message"]
    #     print(f"فشل تجديد رمز الوصول: {message}")

    # مثال: إلغاء الرمز (يتطلب access token صالح)
    # user_id_to_revoke = "some_user_id"
    # revoke_result = oauth_handler.revoke_token(user_id_to_revoke)
    # if revoke_result["success"]:
    #     message = revoke_result["message"]
    #     print(f"تم إلغاء الرمز بنجاح: {message}")
    # else:
    #     message = revoke_result["message"]
    #     print(f"فشل إلغاء الرمز: {message}")


