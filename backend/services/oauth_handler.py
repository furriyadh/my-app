"""
OAuth Handler Service
خدمة معالجة OAuth

يوفر وظائف OAuth 2.0 لـ Google Ads API بما في ذلك:
- إنشاء روابط التفويض
- تبديل الرموز
- تجديد الرموز
- إدارة الجلسات
- التحقق من الصلاحيات
"""

import os
import logging
import secrets
import hashlib
import base64
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from urllib.parse import urlencode, parse_qs, urlparse
import jwt

# إعداد التسجيل
logger = logging.getLogger(__name__)

class OAuthHandler:
    """معالج OAuth 2.0 المتطور لـ Google Ads"""
    
    def __init__(self):
        """تهيئة معالج OAuth"""
        self.logger = logging.getLogger(__name__)
        
        # إعدادات OAuth من متغيرات البيئة
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/callback/google"  )
        self.developer_token = os.getenv("GOOGLE_DEVELOPER_TOKEN")
        
        # نطاقات Google Ads
        self.scopes = [
            "https://www.googleapis.com/auth/adwords",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/com/auth/userinfo.profile"
        ]
        
        # URLs للـ OAuth
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        self.revoke_url = "https://oauth2.googleapis.com/revoke"
        
        # تخزين الجلسات النشطة (للتطوير، يفضل استخدام قاعدة بيانات أو Redis في الإنتاج  )
        self.active_sessions = {}
        self.token_cache = {}
        self.state_storage = {}
        
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
            self.logger.error(f"خطأ في إنشاء رابط التفويض: {str(e)}")
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
                raise ValueError(f"فشل في الحصول على رمز الوصول: {error_data.get("error_description", response.text)}")
                
        except Exception as e:
            self.logger.error(f"خطأ في تبديل الكود: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في تبديل الكود"
            }
    
    def refresh_access_token(self, user_id: str) -> Dict[str, Any]:
        """تجديد رمز الوصول"""
        try:
            token_info = self.token_cache.get(user_id)
            if not token_info or not token_info.get("refresh_token"):
                raise ValueError("No refresh token available for this user.")
            
            refresh_token = token_info["refresh_token"]
            
            refresh_params = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }
            
            response = requests.post(
                self.token_url,
                data=refresh_params,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                # تحديث الرموز في الذاكرة المؤقتة
                self.token_cache[user_id]["access_token"] = token_data["access_token"]
                self.token_cache[user_id]["expires_at"] = (datetime.now() + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat()
                if "refresh_token" in token_data: # قد يتم إرجاع refresh token جديد
                    self.token_cache[user_id]["refresh_token"] = token_data["refresh_token"]
                
                return {
                    "success": True,
                    "access_token": token_data["access_token"],
                    "message": "تم تجديد رمز الوصول بنجاح"
                }
            else:
                error_data = response.json() if response.content else {}
                raise ValueError(f"فشل في تجديد الرمز: {error_data.get("error_description", response.text)}")
                
        except Exception as e:
            self.logger.error(f"خطأ في تجديد الرمز: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في تجديد رمز الوصول"
            }
    
    def revoke_token(self, user_id: str) -> Dict[str, Any]:
        """إلغاء رمز الوصول والتجديد"""
        try:
            token_info = self.token_cache.get(user_id)
            if not token_info or not token_info.get("access_token"):
                raise ValueError("No token available for this user.")
            
            token = token_info["access_token"]
            
            revoke_params = {"token": token}
            response = requests.post(
                self.revoke_url,
                data=revoke_params,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                del self.token_cache[user_id]
                return {"success": True, "message": "تم إلغاء الرمز بنجاح"}
            else:
                error_data = response.json() if response.content else {}
                raise ValueError(f"فشل في إلغاء الرمز: {error_data.get("error_description", response.text)}")
                
        except Exception as e:
            self.logger.error(f"خطأ في إلغاء الرمز: {str(e)}")
            return {"success": False, "error": str(e), "message": "فشل في إلغاء الرمز"}
    
    def get_user_tokens(self, user_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على رموز المستخدم"""
        return self.token_cache.get(user_id)

    def _generate_state(self) -> str:
        """توليد state آمن"""
        return secrets.token_urlsafe(32)
    
    def _generate_code_verifier(self) -> str:
        """توليد PKCE code verifier"""
        return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode("utf-8").rstrip("=")
    
    def _generate_code_challenge(self, code_verifier: str) -> str:
        """توليد PKCE code challenge"""
        return base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode("utf-8")).digest()
        ).decode("utf-8").rstrip("=")
    
    def _get_user_info(self, access_token: str) -> Dict[str, Any]:
        """الحصول على معلومات المستخدم من Google"""
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(self.userinfo_url, headers=headers)
            response.raise_for_status()
            return {"success": True, "user_info": response.json()}
        except requests.exceptions.RequestException as e:
            self.logger.error(f"خطأ في الحصول على معلومات المستخدم: {e}")
            return {"success": False, "error": str(e)}

# مثال على الاستخدام (للتطوير والاختبار)
if __name__ == "__main__":
    # يجب تعيين هذه المتغيرات البيئية قبل التشغيل
    os.environ["GOOGLE_CLIENT_ID"] = "YOUR_CLIENT_ID"
    os.environ["GOOGLE_CLIENT_SECRET"] = "YOUR_CLIENT_SECRET"
    os.environ["GOOGLE_REDIRECT_URI"] = "http://localhost:3000/api/auth/callback/google"

    handler = OAuthHandler(  )
    print("OAuthHandler initialized.")

    # مثال على إنشاء رابط التفويض
    auth_result = handler.create_authorization_url("test_user_123", "127.0.0.1", "TestUserAgent")
    if auth_result["success"]:
        print(f"Authorization URL: {auth_result["authorization_url"]}")
        print(f"Session ID: {auth_result["session_id"]}")
    else:
        print(f"Error: {auth_result["error"]}")

    # مثال على تبديل الكود (يتطلب كود حقيقي من Google)
    print("\n--- مثال على تبديل الكود ---")
    # في سيناريو حقيقي، ستحصل على `code` و `state` من رد الاتصال من Google
    code_from_google = "YOUR_ACTUAL_AUTHORIZATION_CODE" # استبدل هذا بالكود الفعلي
    state_from_google = auth_result["state"] # استخدم الـ state الذي تم إنشاؤه في create_authorization_url
    
    if code_from_google != "YOUR_ACTUAL_AUTHORIZATION_CODE":
        exchange_result = handler.exchange_code_for_token(auth_result["session_id"], code_from_google, state_from_google)
        if exchange_result["success"]:
            print("Token exchange successful!")
            print(f"Access Token: {exchange_result["access_token"]}")
            print(f"User Info: {exchange_result["user_info"]}")
        else:
            print(f"Error: {exchange_result["error"]}")
    else:
        print("يرجى توفير كود تفويض حقيقي لاختبار تبديل الكود.")

    # مثال على تجديد الرمز (يتطلب refresh token حقيقي)
    print("\n--- مثال على تجديد الرمز ---")
    # في سيناريو حقيقي، ستحتاج إلى refresh token تم تخزينه مسبقًا للمستخدم
    user_id_for_refresh = "test_user_123" # المستخدم الذي تم الحصول على refresh token له
    
    # تأكد من أن لديك refresh token مخزن لهذا المستخدم في self.token_cache
    if handler.get_user_tokens(user_id_for_refresh) and handler.get_user_tokens(user_id_for_refresh).get("refresh_token"):
        refresh_result = handler.refresh_access_token(user_id_for_refresh)
        if refresh_result["success"]:
            print("Token refresh successful!")
            print(f"New Access Token: {refresh_result["access_token"]}")
        else:
            print(f"Error: {refresh_result["error"]}")
    else:
        print("لا يوجد refresh token متاح للمستخدم test_user_123. يرجى إكمال تدفق OAuth أولاً.")

    # مثال على إلغاء الرمز
    print("\n--- مثال على إلغاء الرمز ---")
    user_id_for_revoke = "test_user_123" # المستخدم الذي سيتم إلغاء رمزه
    
    if handler.get_user_tokens(user_id_for_revoke):
        revoke_result = handler.revoke_token(user_id_for_revoke)
        if revoke_result["success"]:
            print("Token revoked successfully!")
        else:
            print(f"Error: {revoke_result["error"]}")
    else:
        print("لا يوجد رمز متاح للمستخدم test_user_123 لإلغائه.")




