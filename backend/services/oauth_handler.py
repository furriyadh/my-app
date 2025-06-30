import os
import logging
import secrets
import hashlib
import base64
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from urllib.parse import urlencode

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
        """إنشاء رابط التفويض مع PKCE - الدالة المطلوبة في MCC"""
        try:
            if not self.client_id:
                raise ValueError("Google Client ID not configured in environment variables.")
            
            state = self._generate_state()
            code_verifier = self._generate_code_verifier()
            code_challenge = self._generate_code_challenge(code_verifier)
            
            session_id = secrets.token_urlsafe(32) # معرف فريد للجلسة
            self.active_sessions[session_id] = {
                "user_id": user_id,
                "state": state,
                "code_verifier": code_verifier,
                "code_challenge": code_challenge,
                "redirect_uri": self.redirect_uri,
                "scopes": self.scopes,
                "created_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat(), # صلاحية 10 دقائق
                "ip_address": ip_address,
                "user_agent": user_agent
            }
            
            auth_params = {
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "scope": " ".join(self.scopes),
                "response_type": "code",
                "state": state,
                "access_type": "offline", # للحصول على refresh token
                "prompt": "consent", # لضمان ظهور شاشة الموافقة دائمًا
                "code_challenge": code_challenge,
                "code_challenge_method": "S256",
                "include_granted_scopes": "true"
            }
            
            authorization_url = f"{self.auth_url}?{urlencode(auth_params)}"
            
            return {
                "success": True,
                "authorization_url": authorization_url,
                "session_id": session_id,
                "message": "تم إنشاء رابط التفويض بنجاح"
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء رابط التفويض: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في إنشاء رابط التفويض"
            }
    
    def exchange_code_for_token(self, session_id: str, code: str, state: str) -> Dict[str, Any]:
        """تبديل الكود برمز الوصول - الدالة المطلوبة في MCC"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError("Invalid or expired OAuth session.")
            
            session_data = self.active_sessions[session_id]
            
            # التحقق من صحة state
            if state != session_data["state"]:
                raise ValueError("Invalid state parameter.")
            
            # التحقق من انتهاء الصلاحية
            expires_at = datetime.fromisoformat(session_data["expires_at"])
            if datetime.now() > expires_at:
                del self.active_sessions[session_id]
                raise ValueError("OAuth session expired.")
            
            token_params = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": session_data["redirect_uri"],
                "code_verifier": session_data["code_verifier"]
            }
            
            response = requests.post(
                self.token_url,
                data=token_params,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # الحصول على معلومات المستخدم
                user_info_result = self._get_user_info(token_data["access_token"])
                
                # تخزين الرموز ومعلومات المستخدم (للتطوير، يفضل قاعدة بيانات في الإنتاج)
                self.token_cache[session_data["user_id"]] = {
                    "access_token": token_data["access_token"],
                    "refresh_token": token_data.get("refresh_token"),
                    "expires_at": (datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat(),
                    "user_info": user_info_result.get("user_info", {}),
                    "scopes": session_data["scopes"]
                }
                
                # تنظيف الجلسة
                del self.active_sessions[session_id]
                
                return {
                    "success": True,
                    "access_token": token_data["access_token"],
                    "refresh_token": token_data.get("refresh_token"),
                    "expires_in": token_data.get("expires_in", 3600),
                    "user_info": user_info_result.get("user_info", {}),
                    "scopes": session_data["scopes"],
                    "message": "تم تبديل الكود بنجاح"
                }
            else:
                error_data = response.json() if response.content else {}
                error_message = error_data.get("error_description", response.text)
                raise ValueError(f"فشل في الحصول على رمز الوصول: {error_message}")
        except Exception as e:
            self.logger.error(f"خطأ في تبديل الكود برمز الوصول: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في تبديل الكود برمز الوصول"
            }

    def refresh_access_token(self, user_id: str) -> Dict[str, Any]:
        """تجديد رمز الوصول باستخدام رمز التحديث - الدالة المطلوبة في MCC"""
        try:
            if user_id not in self.token_cache or not self.token_cache[user_id].get("refresh_token"):
                raise ValueError("No refresh token found for this user.")
            
            refresh_token = self.token_cache[user_id]["refresh_token"]
            
            token_params = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }
            
            response = requests.post(
                self.token_url,
                data=token_params,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # تحديث رمز الوصول وتاريخ الانتهاء
                self.token_cache[user_id]["access_token"] = token_data["access_token"]
                self.token_cache[user_id]["expires_at"] = (datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat()
                
                return {
                    "success": True,
                    "access_token": token_data["access_token"],
                    "expires_in": token_data.get("expires_in", 3600),
                    "message": "تم تجديد رمز الوصول بنجاح"
                }
            else:
                error_data = response.json() if response.content else {}
                error_message = error_data.get("error_description", response.text)
                raise ValueError(f"فشل في تجديد الرمز: {error_message}")
        except Exception as e:
            self.logger.error(f"خطأ في تجديد رمز الوصول: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في تجديد رمز الوصول"
            }

    def revoke_token(self, user_id: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول ورمز التحديث - الدالة المطلوبة في MCC"""
        try:
            if user_id not in self.token_cache or not self.token_cache[user_id].get("access_token"):
                raise ValueError("No access token found for this user.")
            
            access_token = self.token_cache[user_id]["access_token"]
            
            revoke_params = {
                "token": access_token
            }
            
            response = requests.post(
                self.revoke_url,
                data=revoke_params,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                del self.token_cache[user_id]
                return {
                    "success": True,
                    "message": "تم إلغاء الرمز بنجاح"
                }
            else:
                error_data = response.json() if response.content else {}
                error_message = error_data.get("error_description", response.text)
                raise ValueError(f"فشل في إلغاء الرمز: {error_message}")
        except Exception as e:
            self.logger.error(f"خطأ في إلغاء الرمز: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في إلغاء الرمز"
            }

    def _generate_state(self) -> str:
        """توليد قيمة state عشوائية"""
        return secrets.token_urlsafe(32)

    def _generate_code_verifier(self) -> str:
        """توليد code verifier لـ PKCE"""
        return secrets.token_urlsafe(96)

    def _generate_code_challenge(self, code_verifier: str) -> str:
        """توليد code challenge من code verifier لـ PKCE"""
        s256 = hashlib.sha256()
        s256.update(code_verifier.encode("utf-8"))
        return base64.urlsafe_b64encode(s256.digest()).decode("utf-8").replace("=", "")

    def _get_user_info(self, access_token: str) -> Dict[str, Any]:
        """الحصول على معلومات المستخدم من Google"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}"
            }
            response = requests.get(self.userinfo_url, headers=headers)
            response.raise_for_status() # يرفع استثناء لأخطاء HTTP
            return {"success": True, "user_info": response.json()}
        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في الحصول على معلومات المستخدم: {e}")
            return {"success": False, "error": str(e), "user_info": {}}

    def is_token_valid(self, user_id: str) -> bool:
        """التحقق مما إذا كان رمز الوصول لا يزال صالحًا"""
        if user_id not in self.token_cache:
            return False
        
        expires_at_str = self.token_cache[user_id].get("expires_at")
        if not expires_at_str:
            return False
        
        expires_at = datetime.fromisoformat(expires_at_str)
        return datetime.now() < expires_at

    def get_access_token(self, user_id: str) -> Optional[str]:
        """الحصول على رمز الوصول للمستخدم"""
        if self.is_token_valid(user_id):
            return self.token_cache[user_id]["access_token"]
        
        # حاول تجديد الرمز إذا انتهت صلاحيته
        try:
            refresh_result = self.refresh_access_token(user_id)
            if refresh_result["success"]:
                return refresh_result["access_token"]
        except Exception as e:
            self.logger.warning(f"فشل في تجديد رمز الوصول للمستخدم {user_id}: {e}")
        
        return None

    def get_user_info(self, user_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على معلومات المستخدم المخزنة"""
        if user_id in self.token_cache:
            return self.token_cache[user_id].get("user_info")
        return None

    def get_user_scopes(self, user_id: str) -> List[str]:
        """الحصول على نطاقات المستخدم المخزنة"""
        if user_id in self.token_cache:
            return self.token_cache[user_id].get("scopes", [])
        return []

    def get_all_active_users(self) -> List[str]:
        """الحصول على قائمة بجميع معرفات المستخدمين النشطين"""
        return list(self.token_cache.keys())

    def get_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على بيانات الجلسة النشطة"""
        return self.active_sessions.get(session_id)

    def delete_session(self, session_id: str):
        """حذف جلسة OAuth"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]


# مثال على الاستخدام (للتجربة فقط)
if __name__ == "__main__":
    # قم بتعيين متغيرات البيئة قبل التشغيل
    # os.environ["GOOGLE_ADS_CLIENT_ID"] = "YOUR_CLIENT_ID"
    # os.environ["GOOGLE_ADS_CLIENT_SECRET"] = "YOUR_CLIENT_SECRET"
    # os.environ["GOOGLE_ADS_REDIRECT_URI"] = "http://localhost:3000/auth/callback"
    # os.environ["GOOGLE_DEVELOPER_TOKEN"] = "YOUR_DEVELOPER_TOKEN"
    
    oauth_handler = OAuthHandler( )
    
    # مثال: إنشاء رابط تفويض
    auth_url_result = oauth_handler.create_authorization_url("test_user_123", "192.168.1.1", "TestBrowser")
    if auth_url_result["success"]:
        print(f"رابط التفويض: {auth_url_result["authorization_url"]}") # تم تصحيح f-string
        print(f"معرف الجلسة: {auth_url_result["session_id"]}") # تم تصحيح f-string
    else:
        print(f"خطأ: {auth_url_result["message"]}")

    # مثال: تجديد رمز الوصول (يتطلب refresh token صالح)
    # user_id_to_refresh = "some_user_id"
    # refresh_result = oauth_handler.refresh_access_token(user_id_to_refresh)
    # if refresh_result["success"]:
    #     print(f"تم تجديد رمز الوصول بنجاح: {refresh_result["access_token"]}")
    # else:
    #     print(f"فشل تجديد رمز الوصول: {refresh_result["message"]}")

    # مثال: إلغاء الرمز (يتطلب access token صالح)
    # user_id_to_revoke = "some_user_id"
    # revoke_result = oauth_handler.revoke_token(user_id_to_revoke)
    # if revoke_result["success"]:
    #     print(f"تم إلغاء الرمز بنجاح: {revoke_result["message"]}")
    # else:
    #     print(f"فشل إلغاء الرمز: {revoke_result["message"]}")
    