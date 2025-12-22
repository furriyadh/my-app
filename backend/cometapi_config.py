#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
إعدادات CometAPI - بناءً على الوثائق الرسمية
CometAPI Configuration based on official documentation
"""

import os
import requests
import logging
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env.development
load_dotenv(dotenv_path='.env.development')

logger = logging.getLogger(__name__)

class CometAPIConfig:
    """إعدادات CometAPI بناءً على الوثائق الرسمية"""
    
    def __init__(self):
        """تهيئة إعدادات CometAPI"""
        self.api_key = os.getenv("COMETAPI_API_KEY")
        self.base_url = "https://api.cometapi.com"
        
        if not self.api_key:
            raise ValueError("COMETAPI_API_KEY environment variable not set")
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("تم تهيئة إعدادات CometAPI")
    
    def get_available_models(self) -> Dict[str, List[str]]:
        """الحصول على النماذج المتاحة من CometAPI - محدث بناءً على النتائج الفعلية"""
        return {
            "text_models": [
                "gpt-4o",
                "gpt-4o-mini", 
                "gpt-4-turbo",
                "gpt-3.5-turbo",
                "claude-3-5-sonnet-20241022",
                "claude-3-5-haiku-20241022",
                "claude-3-opus-20240229",
                "gemini-2.0-flash-exp",
                "gemini-1.5-pro",
                "gemini-1.5-flash",
                "llama-2-13b-chat",
                "llama-2-70b-chat",
                "mistral-7b-instruct",
                "mistral-8x7b-instruct",
                "qwen-2.5-7b-instruct",
                "qwen-2.5-14b-instruct",
                "qwen-2.5-32b-instruct",
                "deepseek-chat",
                "deepseek-coder",
                # نماذج إضافية متاحة
                "gpt-4o-all",
                "gpt-4o-mini-2024-07-18",
                "claude-3-5-sonnet-latest",
                "claude-3-5-haiku-latest",
                "gemini-2.0-flash",
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "qwen-max",
                "qwen-plus",
                "qwen-turbo",
                "deepseek-v3",
                "deepseek-r1",
                "o1-mini",
                "o1-preview",
                "grok-2",
                "grok-3"
            ],
            "image_models": [
                "dall-e-3",
                "dall-e-2",
                "midjourney",
                "stable-diffusion-v1.5",
                "stable-diffusion-v2.1",
                "stable-diffusion-xl",
                "flux-1.1-pro",
                "flux-1.1-schnell",
                # نماذج إضافية متاحة
                "flux-pro",
                "flux-dev",
                "flux-kontext-max",
                "flux-kontext-pro",
                "stable-diffusion-3",
                "stable-diffusion-3.5-large",
                "stable-diffusion-3.5-medium",
                "ideogram-v3/generate",
                "ideogram-v3/edit",
                "runwayml_text_to_image",
                "kling_image"
            ],
            "audio_models": [
                "suno-v3",
                "suno-v3.5",
                "udio-v1",
                "whisper-1",
                # نماذج إضافية متاحة
                "suno_music",
                "suno_lyrics",
                "tts-1",
                "tts-1-hd",
                "kling_audio_text_to_audio"
            ],
            "vision_models": [
                "gpt-4o",
                "gpt-4o-mini",
                "claude-3-5-sonnet-20241022",
                "claude-3-5-haiku-20241022",
                "claude-3-opus-20240229",
                "gemini-2.0-flash-exp",
                "gemini-1.5-pro",
                "gemini-1.5-flash",
                # نماذج إضافية متاحة
                "gpt-4o-image",
                "gpt-4-vision",
                "claude-3-5-sonnet-latest",
                "claude-3-5-haiku-latest",
                "gemini-2.0-flash",
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "qwen-vl-max",
                "qwen-vl-plus",
                "qwen2-vl-72b-instruct",
                "qwen2-vl-7b-instruct",
                "grok-2-vision-1212",
                "grok-3-deepersearch",
                "grok-3-deepsearch",
                "grok-3-search"
            ]
        }
    
    def get_model_pricing(self) -> Dict[str, Dict[str, float]]:
        """الحصول على أسعار النماذج (تقديرية بناءً على CometAPI)"""
        return {
            "text_models": {
                "gpt-4o": {"input": 0.0025, "output": 0.01},
                "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
                "gpt-4-turbo": {"input": 0.01, "output": 0.03},
                "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
                "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
                "claude-3-5-haiku-20241022": {"input": 0.00025, "output": 0.00125},
                "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
                "gemini-2.0-flash-exp": {"input": 0.000075, "output": 0.0003},
                "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
                "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
                "llama-2-13b-chat": {"input": 0.0003, "output": 0.0003},
                "llama-2-70b-chat": {"input": 0.0007, "output": 0.0007},
                "mistral-7b-instruct": {"input": 0.0002, "output": 0.0002},
                "mistral-8x7b-instruct": {"input": 0.0003, "output": 0.0003},
                "qwen-2.5-7b-instruct": {"input": 0.0002, "output": 0.0002},
                "qwen-2.5-14b-instruct": {"input": 0.0003, "output": 0.0003},
                "qwen-2.5-32b-instruct": {"input": 0.0005, "output": 0.0005},
                "deepseek-chat": {"input": 0.0002, "output": 0.0002},
                "deepseek-coder": {"input": 0.0002, "output": 0.0002}
            },
            "image_models": {
                "dall-e-3": {"1024x1024": 0.04, "1024x1792": 0.08, "1792x1024": 0.08},
                "dall-e-2": {"1024x1024": 0.02, "512x512": 0.018, "256x256": 0.016},
                "midjourney": {"standard": 0.05, "hd": 0.1},
                "stable-diffusion-v1.5": {"standard": 0.01},
                "stable-diffusion-v2.1": {"standard": 0.01},
                "stable-diffusion-xl": {"standard": 0.02},
                "flux-1.1-pro": {"standard": 0.03},
                "flux-1.1-schnell": {"standard": 0.015}
            },
            "audio_models": {
                "suno-v3": {"standard": 0.1},
                "suno-v3.5": {"standard": 0.12},
                "udio-v1": {"standard": 0.08},
                "whisper-1": {"per_minute": 0.006}
            }
        }
    
    def get_recommended_models_for_ads(self) -> Dict[str, str]:
        """النماذج الموصى بها للإعلانات بناءً على التكلفة والأداء - محدث بناءً على النتائج الفعلية"""
        return {
            "text_generation": "gpt-4o-mini",  # أرخص للنصوص
            "text_advanced": "gpt-4o-mini",  # متوازن للأداء والتكلفة
            "text_premium": "gpt-4o",  # أفضل جودة
            "text_budget": "qwen-2.5-7b-instruct",  # أرخص بديل
            "text_creative": "claude-3-5-sonnet-20241022",  # إبداعي للنصوص
            "image_generation": "dall-e-3",  # أفضل جودة للصور
            "image_budget": "stable-diffusion-v1.5",  # أرخص للصور
            "image_creative": "flux-1.1-pro",  # إبداعي للصور
            "image_advanced": "stable-diffusion-3.5-large",  # متقدم للصور
            "vision_analysis": "gpt-4o-mini",  # لتحليل الصور
            "vision_advanced": "gpt-4o",  # متقدم لتحليل الصور
            "keyword_extraction": "gpt-4o-mini",  # أرخص لاستخراج الكلمات
            "ad_copy_generation": "mistral-7b-instruct",  # جيد للنصوص الإعلانية
            "website_analysis": "claude-3-5-haiku-20241022",  # سريع لتحليل المواقع
            "content_optimization": "gpt-4o-mini",  # لتحسين المحتوى
            "arabic_content": "qwen-2.5-7b-instruct",  # جيد للمحتوى العربي
            "multilingual": "gemini-2.0-flash-exp"  # متعدد اللغات
        }
    
    def get_api_endpoints(self) -> Dict[str, str]:
        """نقاط نهاية CometAPI"""
        return {
            "chat_completions": f"{self.base_url}/v1/chat/completions",
            "images_generations": f"{self.base_url}/v1/images/generations",
            "audio_transcriptions": f"{self.base_url}/v1/audio/transcriptions",
            "audio_generations": f"{self.base_url}/v1/audio/generations",
            "models_list": f"{self.base_url}/v1/models",
            "usage": f"{self.base_url}/v1/usage"
        }
    
    def get_headers(self) -> Dict[str, str]:
        """رؤوس HTTP المطلوبة لـ CometAPI"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "CometAPI-Python-Client/1.0"
        }
    
    def test_connection(self) -> Dict[str, Any]:
        """اختبار الاتصال بـ CometAPI"""
        try:
            self.logger.info("🔍 اختبار الاتصال بـ CometAPI...")
            
            # اختبار قائمة النماذج
            response = requests.get(
                self.get_api_endpoints()["models_list"],
                headers=self.get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                models_data = response.json()
                self.logger.info("✅ تم الاتصال بـ CometAPI بنجاح")
                return {
                    "success": True,
                    "status": "connected",
                    "models_count": len(models_data.get("data", [])),
                    "available_models": [model.get("id") for model in models_data.get("data", [])]
                }
            else:
                self.logger.error(f"❌ فشل الاتصال بـ CometAPI: {response.status_code}")
                return {
                    "success": False,
                    "status": "failed",
                    "error": f"HTTP {response.status_code}",
                    "message": response.text
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في اختبار الاتصال: {e}")
            return {
                "success": False,
                "status": "error",
                "error": str(e),
                "message": "خطأ في الاتصال"
            }
    
    def get_usage_info(self) -> Dict[str, Any]:
        """الحصول على معلومات الاستخدام"""
        try:
            response = requests.get(
                self.get_api_endpoints()["usage"],
                headers=self.get_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "message": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في الحصول على معلومات الاستخدام"
            }

# مثال على الاستخدام
if __name__ == "__main__":
    # تهيئة الإعدادات
    config = CometAPIConfig()
    
    # اختبار الاتصال
    connection_test = config.test_connection()
    print("اختبار الاتصال:")
    print(connection_test)
    
    # عرض النماذج المتاحة
    models = config.get_available_models()
    print("\nالنماذج المتاحة:")
    for category, model_list in models.items():
        print(f"{category}: {len(model_list)} نموذج")
    
    # عرض النماذج الموصى بها
    recommended = config.get_recommended_models_for_ads()
    print("\nالنماذج الموصى بها للإعلانات:")
    for purpose, model in recommended.items():
        print(f"{purpose}: {model}")
    
    # عرض معلومات الاستخدام
    usage = config.get_usage_info()
    print("\nمعلومات الاستخدام:")
    print(usage)
