#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
خدمة توليد المحتوى الإعلاني باستخدام نماذج الذكاء الاصطناعي
AI Content Generation Service for Ad Copy
"""

import os
import requests
import logging
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import sys
from dotenv import load_dotenv

# تحميل متغيرات البيئة من ملف .env.development
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.development'))

# إضافة مسار backend للاستيراد
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)

from cometapi_config import CometAPIConfig

logger = logging.getLogger(__name__)

# دالة عامة لإزالة أرقام الهواتف من النصوص (Google Ads Policy)
def remove_phone_numbers(text: str) -> str:
    """إزالة جميع أرقام الهواتف من النص لتجنب انتهاك سياسات Google Ads"""
    if not text:
        return text
    
    # أنماط أرقام الهواتف المختلفة
    patterns = [
        r'\b0\d{9,10}\b',  # أرقام محلية مثل 0558038312
        r'\b\+?\d{10,15}\b',  # أرقام دولية
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # 555-123-4567
        r'\b\d{4}[-.\s]?\d{3}[-.\s]?\d{3}\b',  # 0555-123-456
        r'\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}\b',  # (555) 123-4567
    ]
    
    cleaned_text = text
    for pattern in patterns:
        cleaned_text = re.sub(pattern, '', cleaned_text)
    
    # تنظيف المسافات الزائدة
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    return cleaned_text

class AIContentGenerator:
    """خدمة توليد المحتوى الإعلاني باستخدام الذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة توليد المحتوى"""
        self.api_key = os.getenv("COMETAPI_API_KEY")
        self.base_url = os.getenv("COMETAPI_BASE_URL", "https://api.cometapi.com")
        self.text_model = os.getenv("TEXT_MODEL", "gpt-4o-mini")
        self.image_model = os.getenv("IMAGE_MODEL", "black-forest-labs/flux-1.1-pro-ultra")  # الأفضل للواقعية المطلقة
        
        # إصلاح مشكلة نموذج llama-2-7b-chat غير المتوفر
        if self.text_model == "llama-2-7b-chat":
            # استخدام أرخص نموذج GPT (أفضل للأداء والتكلفة)
            self.text_model = "gpt-4o-mini"  # $0.00015/1K tokens - أرخص GPT وأفضل للأداء
            logger.warning(f"⚠️ نموذج llama-2-7b-chat غير متوفر، تم التبديل إلى {self.text_model} (أرخص GPT وأفضل للأداء)")
        
        if not self.api_key:
            raise ValueError("COMETAPI_API_KEY environment variable not set")
        
        # تهيئة إعدادات CometAPI
        self.logger = logging.getLogger(__name__)
        try:
            self.cometapi_config = CometAPIConfig()
            # إضافة الخصائص المطلوبة
            self.cometapi_base_url = self.base_url
            self.cometapi_headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            self.logger.info("تم تهيئة خدمة توليد المحتوى الإعلاني مع CometAPI")
        except Exception as e:
            self.logger.error(f"خطأ في تهيئة CometAPI: {e}")
            self.cometapi_config = None
            self.cometapi_base_url = self.base_url
            self.cometapi_headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
    
    def get_campaign_image_requirements(self) -> Dict[str, Dict[str, Any]]:
        """الحصول على متطلبات الصور لكل نوع حملة"""
        return {
                   "SEARCH": {
                       "required": True,
                       "min_images": 4,
                       "max_images": 4,
                       "images": {
                           "square_image": {
                               "size": "1200×1200",
                               "aspect_ratio": "1:1",
                               "min_size": "300×300",
                               "max_file_size": "5120 KB",
                               "formats": ["JPEG", "PNG"],
                               "field_type": "AD_IMAGE",
                               "description": "صورة مربعة للإعلان"
                           },
                           "landscape_image": {
                               "size": "1200×628",
                               "aspect_ratio": "1.91:1",
                               "min_size": "600×314",
                               "max_file_size": "5120 KB",
                               "formats": ["JPEG", "PNG"],
                               "field_type": "AD_IMAGE",
                               "description": "صورة أفقية للإعلان"
                           }
                       }
                   },
            "PERFORMANCE_MAX": {
                "required": True,
                "min_images": 4,
                "max_images": 4,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "MARKETING_IMAGE",
                        "description": "صورة تسويقية أفقية"
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "SQUARE_MARKETING_IMAGE",
                        "description": "صورة تسويقية مربعة"
                    },
                    "logo": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "LOGO",
                        "description": "شعار العمل"
                    },
                    "landscape_logo": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "LANDSCAPE_LOGO",
                        "description": "شعار أفقي"
                    }
                }
            },
            "DISPLAY": {
                "required": True,
                "min_images": 5,
                "max_images": 5,
                "images": {
                    "medium_rectangle": {
                        "size": "300×250",
                        "aspect_ratio": "1.2:1",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "مستطيل متوسط"
                    },
                    "leaderboard": {
                        "size": "728×90",
                        "aspect_ratio": "8.09:1",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "لوحة المتصدرين"
                    },
                    "wide_skyscraper": {
                        "size": "160×600",
                        "aspect_ratio": "1:3.75",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "ناطحة سحاب عريضة"
                    },
                    "large_rectangle": {
                        "size": "336×280",
                        "aspect_ratio": "1.2:1",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "مستطيل كبير"
                    },
                    "half_page": {
                        "size": "300×600",
                        "aspect_ratio": "1:2",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "نصف صفحة"
                    }
                }
            },
            "VIDEO": {
                "required": True,
                "min_images": 2,
                "max_images": 2,
                "images": {
                    "hd_thumbnail": {
                        "size": "1280×720",
                        "aspect_ratio": "16:9",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "AD_IMAGE",
                        "description": "صورة مصغرة عالية الدقة"
                    },
                    "sd_thumbnail": {
                        "size": "640×360",
                        "aspect_ratio": "16:9",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "AD_IMAGE",
                        "description": "صورة مصغرة عادية الدقة"
                    }
                }
            },
            "SHOPPING": {
                "required": True,
                "min_images": 1,
                "max_images": 1000,
                "images": {
                    "product_images": {
                        "recommended_size": "800×800",
                        "min_size": "250×250",
                        "max_file_size": "16 MB",
                        "formats": ["JPEG", "PNG", "GIF"],
                        "field_type": "AD_IMAGE",
                        "description": "صور المنتجات - عدد فريد حسب المنتجات"
                    }
                }
            },
            "SMART": {
                "required": True,
                "min_images": 2,
                "max_images": 2,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "MARKETING_IMAGE",
                        "description": "صورة تسويقية أفقية"
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "SQUARE_MARKETING_IMAGE",
                        "description": "صورة تسويقية مربعة"
                    }
                }
            },
            "LOCAL": {
                "required": True,
                "min_images": 2,
                "max_images": 2,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "MARKETING_IMAGE",
                        "description": "صورة تسويقية أفقية"
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "SQUARE_MARKETING_IMAGE",
                        "description": "صورة تسويقية مربعة"
                    }
                }
            },
            "DEMAND_GEN": {
                "required": True,
                "min_images": 3,
                "max_images": 3,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "MARKETING_IMAGE",
                        "description": "صورة تسويقية أفقية"
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "SQUARE_MARKETING_IMAGE",
                        "description": "صورة تسويقية مربعة"
                    },
                    "logo": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "LOGO",
                        "description": "شعار العمل"
                    }
                }
            },
                   "HOTEL": {
                       "required": False,
                       "description": "لا تتطلب صورًا - تعتمد على بيانات الفنادق والأسعار من Hotel Center"
                   },
            "TRAVEL": {
                "required": True,
                "min_images": 2,
                "max_images": 2,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "MARKETING_IMAGE",
                        "description": "صورة تسويقية أفقية"
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "SQUARE_MARKETING_IMAGE",
                        "description": "صورة تسويقية مربعة"
                    }
                }
            },
            "DEMAND_GEN": {
                "required": True,
                "images": {
                    "marketing_image": {
                        "size": "1200×628",
                        "aspect_ratio": "1.91:1",
                        "min_size": "600×314",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"]
                    },
                    "square_marketing_image": {
                        "size": "1200×1200",
                        "aspect_ratio": "1:1",
                        "min_size": "300×300",
                        "max_file_size": "5120 KB",
                        "formats": ["JPEG", "PNG"]
                    }
                }
            },
            "LOCAL_SERVICES": {
                "required": False,
                "min_images": 0,
                "max_images": 0,
                "description": "لا تتطلب صورًا - تعتمد على معلومات الخدمة والموقع من Local Services"
            },
            "MULTI_CHANNEL": {
                "required": True,
                "min_images": 3,
                "max_images": 3,
                "images": {
                    "app_icon": {
                        "size": "320×50",
                        "aspect_ratio": "6.4:1",
                        "max_file_size": "150 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "AD_IMAGE",
                        "description": "أيقونة التطبيق"
                    },
                    "app_screenshot": {
                        "size": "480×320",
                        "aspect_ratio": "1.5:1",
                        "max_file_size": "150 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "AD_IMAGE",
                        "description": "لقطة شاشة التطبيق"
                    },
                    "app_banner": {
                        "size": "320×480",
                        "aspect_ratio": "2:3",
                        "max_file_size": "150 KB",
                        "formats": ["JPEG", "PNG"],
                        "field_type": "AD_IMAGE",
                        "description": "بانر التطبيق"
                    }
                }
            }
        }
    
    def _get_ad_copy_prompts(self, language: str = 'Arabic') -> Dict[str, str]:
        """الحصول على برومبتات النسخ الإعلانية (ديناميكية حسب اللغة)"""
        
        # Language-specific instructions
        language_instructions = {
            'Arabic': 'Write in Arabic language. Use Arabic action words.',
            'English': 'Write in English language. Use compelling English action words.',
            'French': 'Write in French language. Use compelling French action words.',
            'German': 'Write in German language. Use compelling German action words.',
            'Spanish': 'Write in Spanish language. Use compelling Spanish action words.',
            'Italian': 'Write in Italian language. Use compelling Italian action words.',
            'Portuguese': 'Write in Portuguese language. Use compelling Portuguese action words.',
            'Russian': 'Write in Russian language. Use compelling Russian action words.',
            'Chinese (simplified)': 'Write in Simplified Chinese language.',
            'Chinese (traditional)': 'Write in Traditional Chinese language.',
            'Japanese': 'Write in Japanese language.',
            'Korean': 'Write in Korean language.',
            'Hindi': 'Write in Hindi language.',
            'Turkish': 'Write in Turkish language.',
            'Dutch': 'Write in Dutch language.',
            'Polish': 'Write in Polish language.',
            'Swedish': 'Write in Swedish language.',
            'Thai': 'Write in Thai language.',
            'Vietnamese': 'Write in Vietnamese language.',
        }
        
        lang_instruction = language_instructions.get(language, f'Write in {language} language.')
        
        return {
            "headlines": f"""
You are an expert in writing Google Ads headlines. Write 5 professional headlines for the following product/service:

Product/Service: {{product_service}}
Website: {{website_url}}
Website Content: {{website_content}}

IMPORTANT LANGUAGE REQUIREMENT:
{lang_instruction}
ALL headlines MUST be written in {language} language.

Requirements:
- Each headline maximum 30 characters
- Include key benefit
- Clear and honest (Google Ads compliant)
- Compelling and persuasive
- Suitable for {language} speaking audience

Return results in JSON format:
{{{{
    "headlines": [
        "First headline in {language}",
        "Second headline in {language}",
        "Third headline in {language}",
        "Fourth headline in {language}",
        "Fifth headline in {language}"
    ]
}}}}
""",
            "descriptions": f"""
You are an expert in writing Google Ads descriptions. Write 5 professional descriptions for the following product/service:

Product/Service: {{product_service}}
Website: {{website_url}}
Website Content: {{website_content}}

IMPORTANT LANGUAGE REQUIREMENT:
{lang_instruction}
ALL descriptions MUST be written in {language} language.

Requirements:
- Each description maximum 90 characters
- Clearly explain key benefit
- Include clear call-to-action
- Avoid misleading claims
- Google Ads compliant
- Compelling and attractive
- Suitable for {language} speaking audience

Return results in JSON format:
{{{{
    "descriptions": [
        "First description in {language}",
        "Second description in {language}",
        "Third description in {language}",
        "Fourth description in {language}",
        "Fifth description in {language}"
    ]
}}}}
""",
            "keywords": f"""
You are an expert in Google Ads keyword research. Suggest 20 keywords for the following product/service:

Product/Service: {{product_service}}
Website: {{website_url}}
Website Content: {{website_content}}

IMPORTANT LANGUAGE REQUIREMENT:
{lang_instruction}
ALL keywords MUST be in {language} language.

Requirements:
- Keywords relevant to product/service
- Suitable for {language} speaking audience
- Include long-tail keywords
- Include short direct keywords
- Suitable for Google Ads campaigns
- Varied phrasing

Return results in JSON format:
{{{{
    "keywords": [
        "First keyword in {language}",
        "Second keyword in {language}",
        "Third keyword in {language}",
        ...
    ]
}}}}
""",
            "campaign_type": """
أنت خبير في تحليل المواقع الإلكترونية واقتراح نوع الحملة الإعلانية المناسب. حلل الموقع التالي واقترح نوع الحملة:

المنتج/الخدمة: {product_service}
الموقع الإلكتروني: {website_url}
محتوى الموقع: {website_content}

أنواع الحملات المتاحة:
- search_ads: إعلانات البحث
- display_ads: إعلانات الشبكة الإعلانية
- video_ads: إعلانات الفيديو
- shopping_ads: إعلانات التسوق
- performance_max: إعلانات الأداء الأقصى
- app_ads: إعلانات التطبيقات
- call_ads: إعلانات المكالمات

أرجع النتائج في تنسيق JSON:
{{
    "recommended_campaign_type": "نوع الحملة المقترح",
    "confidence_score": 85,
    "reasoning": "السبب في اختيار هذا النوع",
    "alternative_types": ["نوع بديل 1", "نوع بديل 2"]
}}
""",
            "color_analysis": """
أنت خبير في تحليل الألوان والعلامات التجارية. حلل الموقع التالي واستخرج الألوان الرئيسية:

المنتج/الخدمة: {product_service}
الموقع الإلكتروني: {website_url}
محتوى الموقع: {website_content}

أرجع النتائج في تنسيق JSON:
{{
    "primary_color": "#1A1A1A",
    "secondary_color": "#00BFA5",
    "accent_color": "#FF6B6B",
    "text_color": "#FFFFFF",
    "background_color": "#1A1A1A",
    "color_palette": ["#1A1A1A", "#00BFA5", "#FF6B6B", "#FFFFFF"],
    "brand_style": "modern, clean, professional"
}}
"""
        }
    
    def _fetch_website_content(self, website_url: str) -> str:
        """Fetch website content with www fallback"""
        try:
            from urllib.parse import urlparse
            
            # Add https:// if no scheme provided
            if not website_url.startswith(('http://', 'https://')):
                website_url = f'https://{website_url}'
            
            self.logger.info(f"Fetching website content: {website_url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            # Try to fetch with www fallback
            urls_to_try = [website_url]
            parsed = urlparse(website_url)
            if not parsed.netloc.startswith('www.'):
                www_url = f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}"
                if parsed.query:
                    www_url += f"?{parsed.query}"
                urls_to_try.append(www_url)
            
            response = None
            for url_attempt in urls_to_try:
                try:
                    self.logger.info(f"🔗 Trying: {url_attempt}")
                    response = requests.get(url_attempt, headers=headers, timeout=30)
                    if response.status_code == 200:
                        self.logger.info(f"✅ Successfully fetched: {url_attempt}")
                        break
                except Exception as e:
                    self.logger.warning(f"⚠️ Failed {url_attempt}: {e}")
                    continue
            
            if not response or response.status_code != 200:
                raise Exception("Could not fetch website from any URL variant")
            
            # Extract text from HTML
            html_content = response.text
            text_content = self._extract_text_from_html(html_content)
            
            # Limit content to reduce cost (first 3000 chars)
            text_content = text_content[:3000]
            
            self.logger.info(f"Successfully fetched website content: {len(text_content)} chars")
            return text_content
                
        except Exception as e:
            self.logger.error(f"Error fetching website content: {e}")
            return ""
    
    def _extract_text_from_html(self, html_content: str) -> str:
        """استخراج النص من محتوى HTML"""
        import re
        
        # إزالة script و style tags
        clean = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
        clean = re.sub(r'<style[^>]*>.*?</style>', '', clean, flags=re.DOTALL)
        
        # إزالة HTML tags
        clean = re.sub(r'<[^>]+>', ' ', clean)
        
        # إزالة المسافات الزائدة
        clean = re.sub(r'\s+', ' ', clean)
        
        # إزالة الأحرف الخاصة
        clean = re.sub(r'[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]', ' ', clean)
        
        return clean.strip()
    
    def _get_best_model_for_task(self, task_type: str) -> str:
        """اختيار أفضل نموذج حسب نوع المهمة"""
        model_mapping = {
            "website_analysis": "claude-3-5-haiku-20241022",  # سريع لتحليل المواقع
            "ad_copy_generation": "qwen-2.5-7b-instruct",     # ممتاز للمحتوى العربي
            "keyword_extraction": "gpt-4o-mini",              # أرخص لاستخراج الكلمات
            "content_optimization": "gpt-4o-mini",            # لتحسين المحتوى
            "arabic_content": "qwen-2.5-7b-instruct",         # جيد للمحتوى العربي
            "multilingual": "gemini-2.0-flash-exp",           # متعدد اللغات
            "creative": "claude-3-5-sonnet-20241022",         # إبداعي
            "budget": "qwen-2.5-7b-instruct",                 # أرخص
            "premium": "gpt-4o"                               # أفضل جودة
        }
        return model_mapping.get(task_type, self.text_model)
    
    def _call_cometapi(self, prompt: str, task_type: str = "general") -> Dict[str, Any]:
        """استدعاء CometAPI لتوليد المحتوى"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.text_model,
                "messages": [
                    {
                        "role": "system",
                        "content": """You are a Google Ads expert specializing in high-converting ad copy. 

KEY REQUIREMENTS:
1. Generate exactly 30 headlines (max 30 characters each)
2. Generate exactly 4 descriptions (60-90 characters each - MINIMUM 60 chars)
3. EVERY description MUST end with a strong Call-to-Action (CTA) appropriate for the industry

DESCRIPTION BEST PRACTICES:
- Length: 60-90 characters (use full space available)
- Structure: [Value Proposition] + [Key Benefit] + [Industry-Specific CTA]
- CTA must match the business type and keywords (e.g., booking services use "احجز الآن", e-commerce uses "تسوق الآن", professional services use "اتصل بنا")
- Include numbers, guarantees, or urgency when relevant to the industry
- Focus on benefits, not just features

HEADLINE BEST PRACTICES:
- Use numbers and percentages when relevant to the business
- Include location when provided in keywords
- Add urgency elements appropriate to the industry
- Use power words that match the business tone
- Focus on unique selling propositions and benefits

Base ALL content on the keywords from Google Keyword Planner and adapt to the specific industry."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.5,
                "top_p": 0.9
            }
            
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    return {
                        "success": True,
                        "content": content
                    }
                else:
                    return {
                        "success": False,
                        "error": "No content generated"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """تحليل استجابة JSON"""
        try:
            import json
            import re
            
            # تنظيف المحتوى أولاً
            content = content.strip()
            
            # البحث عن JSON في النص - تحسين البحث
            json_patterns = [
                r'\{.*\}',  # البحث عن JSON عادي
                r'```json\s*(\{.*?\})\s*```',  # JSON في code blocks
                r'```\s*(\{.*?\})\s*```',  # JSON في code blocks بدون json
            ]
            
            for pattern in json_patterns:
                matches = re.findall(pattern, content, re.DOTALL)
                if matches:
                    json_str = matches[0] if isinstance(matches[0], str) else matches[0]
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        continue
            
            # إذا لم نجد JSON، حاول البحث عن الأقواس
            start = content.find('{')
            end = content.rfind('}') + 1
            
            if start != -1 and end != -1 and end > start:
                json_str = content[start:end]
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    # محاولة إصلاح JSON بسيط
                    json_str = self._fix_json_format(json_str)
                    return json.loads(json_str)
            
            # إذا فشل كل شيء، إرجاع استجابة افتراضية
            return self._create_fallback_response(content)
                
        except Exception as e:
            self.logger.error(f"خطأ في تحليل JSON: {e}")
            return {"error": f"JSON parsing error: {str(e)}"}
    
    def _fix_json_format(self, json_str: str) -> str:
        """إصلاح تنسيق JSON البسيط"""
        try:
            # إزالة المسافات الزائدة
            json_str = json_str.strip()
            
            # إصلاح المشاكل الشائعة
            json_str = json_str.replace("'", '"')  # استبدال الاقتباسات المفردة
            json_str = re.sub(r',\s*}', '}', json_str)  # إزالة الفواصل الأخيرة
            json_str = re.sub(r',\s*]', ']', json_str)  # إزالة الفواصل الأخيرة من المصفوفات
            
            return json_str
        except Exception:
            return json_str
    
    def _create_fallback_response(self, content: str) -> Dict[str, Any]:
        """إنشاء استجابة احتياطية عند فشل تحليل JSON"""
        try:
            # محاولة استخراج معلومات مفيدة من النص
            headlines = []
            descriptions = []
            keywords = []
            
            # البحث عن عناوين
            headline_patterns = [
                r'عنوان[:\s]*([^\n]+)',
                r'headline[:\s]*([^\n]+)',
                r'العنوان[:\s]*([^\n]+)'
            ]
            
            for pattern in headline_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                headlines.extend(matches[:5])  # أول 5 عناوين
            
            # البحث عن أوصاف
            desc_patterns = [
                r'وصف[:\s]*([^\n]+)',
                r'description[:\s]*([^\n]+)',
                r'الوصف[:\s]*([^\n]+)'
            ]
            
            for pattern in desc_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                descriptions.extend(matches[:3])  # أول 3 أوصاف
            
            # البحث عن كلمات مفتاحية
            keyword_patterns = [
                r'كلمة[:\s]*([^\n]+)',
                r'keyword[:\s]*([^\n]+)',
                r'الكلمة[:\s]*([^\n]+)'
            ]
            
            for pattern in keyword_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                keywords.extend(matches[:10])  # أول 10 كلمات
            
            # إنشاء استجابة افتراضية
            response = {}
            if headlines:
                response['headlines'] = headlines
            if descriptions:
                response['descriptions'] = descriptions
            if keywords:
                response['keywords'] = keywords
            
            # إضافة نوع الحملة الافتراضي
            if 'search' in content.lower() or 'بحث' in content:
                response['recommended_campaign_type'] = 'search_ads'
            elif 'display' in content.lower() or 'عرض' in content:
                response['recommended_campaign_type'] = 'display_ads'
            else:
                response['recommended_campaign_type'] = 'search_ads'
            
            response['confidence_score'] = 60
            response['reasoning'] = 'تم إنشاء استجابة احتياطية من النص'
            
            return response
            
        except Exception as e:
            self.logger.error(f"خطأ في إنشاء الاستجابة الاحتياطية: {e}")
            return {
                'error': 'فشل في تحليل الاستجابة',
                'headlines': ['عنوان إعلاني احتياطي'],
                'descriptions': ['وصف إعلاني احتياطي'],
                'keywords': ['كلمة مفتاحية احتياطية'],
                'recommended_campaign_type': 'search_ads',
                'confidence_score': 50
            }
    
    def generate_headlines(self, product_service: str, website_url: str, language: str = 'Arabic') -> Dict[str, Any]:
        """توليد العناوين الإعلانية باللغة المختارة"""
        try:
            self.logger.info(f"📝 بدء توليد العناوين للمنتج: {product_service} باللغة: {language}")
            
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # الحصول على البرومبت (مع اللغة)
            prompts = self._get_ad_copy_prompts(language=language)
            prompt = prompts["headlines"].format(
                product_service=product_service,
                website_url=website_url,
                website_content=website_content[:2000]  # أول 2000 حرف
            )
            
            # استدعاء CometAPI
            response = self._call_cometapi(prompt)
            
            if response.get("success"):
                # تحليل الاستجابة
                parsed_response = self._parse_json_response(response["content"])
                
                if "headlines" in parsed_response:
                    self.logger.info(f"✅ تم توليد {len(parsed_response['headlines'])} عنوان")
                    return {
                        "success": True,
                        "headlines": parsed_response["headlines"],
                        "website_content": website_content,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No headlines found in response",
                        "raw_response": response["content"]
                    }
            else:
                return {
                    "success": False,
                    "error": response.get("error"),
                    "message": "فشل في توليد العناوين"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد العناوين: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد العناوين"
            }
    
    def generate_descriptions(self, product_service: str, website_url: str, language: str = 'Arabic') -> Dict[str, Any]:
        """توليد الأوصاف الإعلانية باللغة المختارة"""
        try:
            self.logger.info(f"📝 بدء توليد الأوصاف للمنتج: {product_service} باللغة: {language}")
            
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # الحصول على البرومبت (مع اللغة)
            prompts = self._get_ad_copy_prompts(language=language)
            prompt = prompts["descriptions"].format(
                product_service=product_service,
                website_url=website_url,
                website_content=website_content[:2000]  # أول 2000 حرف
            )
            
            # استدعاء CometAPI
            response = self._call_cometapi(prompt)
            
            if response.get("success"):
                # تحليل الاستجابة
                parsed_response = self._parse_json_response(response["content"])
                
                if "descriptions" in parsed_response:
                    self.logger.info(f"✅ تم توليد {len(parsed_response['descriptions'])} وصف")
                    return {
                        "success": True,
                        "descriptions": parsed_response["descriptions"],
                        "website_content": website_content,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No descriptions found in response",
                        "raw_response": response["content"]
                    }
            else:
                return {
                    "success": False,
                    "error": response.get("error"),
                    "message": "فشل في توليد الأوصاف"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد الأوصاف: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد الأوصاف"
            }
    
    def generate_keywords(self, product_service: str, website_url: str, language: str = 'Arabic') -> Dict[str, Any]:
        """توليد الكلمات المفتاحية باللغة المختارة"""
        try:
            self.logger.info(f"🔑 بدء توليد الكلمات المفتاحية للمنتج: {product_service} باللغة: {language}")
            
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # الحصول على البرومبت (مع اللغة)
            prompts = self._get_ad_copy_prompts(language=language)
            prompt = prompts["keywords"].format(
                product_service=product_service,
                website_url=website_url,
                website_content=website_content[:2000]  # أول 2000 حرف
            )
            
            # استدعاء CometAPI
            response = self._call_cometapi(prompt)
            
            if response.get("success"):
                # تحليل الاستجابة
                parsed_response = self._parse_json_response(response["content"])
                
                if "keywords" in parsed_response:
                    self.logger.info(f"✅ تم توليد {len(parsed_response['keywords'])} كلمة مفتاحية")
                    return {
                        "success": True,
                        "keywords": parsed_response["keywords"],
                        "website_content": website_content,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No keywords found in response",
                        "raw_response": response["content"]
                    }
            else:
                return {
                    "success": False,
                    "error": response.get("error"),
                    "message": "فشل في توليد الكلمات المفتاحية"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد الكلمات المفتاحية: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد الكلمات المفتاحية"
            }
    
    def suggest_campaign_type(self, product_service: str, website_url: str) -> Dict[str, Any]:
        """اقتراح نوع الحملة الإعلانية"""
        try:
            self.logger.info(f"🎯 بدء اقتراح نوع الحملة للمنتج: {product_service}")
            
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # الحصول على البرومبت
            prompts = self._get_ad_copy_prompts()
            prompt = prompts["campaign_type"].format(
                product_service=product_service,
                website_url=website_url,
                website_content=website_content[:2000]  # أول 2000 حرف
            )
            
            # استدعاء CometAPI
            response = self._call_cometapi(prompt)
            
            if response.get("success"):
                # تحليل الاستجابة
                parsed_response = self._parse_json_response(response["content"])
                
                if "recommended_campaign_type" in parsed_response:
                    self.logger.info(f"✅ تم اقتراح نوع الحملة: {parsed_response['recommended_campaign_type']}")
                    return {
                        "success": True,
                        "recommended_campaign_type": parsed_response["recommended_campaign_type"],
                        "confidence_score": parsed_response.get("confidence_score", 0),
                        "reasoning": parsed_response.get("reasoning", ""),
                        "alternative_types": parsed_response.get("alternative_types", []),
                        "website_content": website_content,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No campaign type found in response",
                        "raw_response": response["content"]
                    }
            else:
                return {
                    "success": False,
                    "error": response.get("error"),
                    "message": "فشل في اقتراح نوع الحملة"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في اقتراح نوع الحملة: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في اقتراح نوع الحملة"
            }
    
    def analyze_website_colors(self, product_service: str, website_url: str) -> Dict[str, Any]:
        """تحليل ألوان الموقع الإلكتروني"""
        try:
            self.logger.info(f"🎨 بدء تحليل ألوان الموقع: {website_url}")
            
            # جلب محتوى الموقع
            website_content = self._fetch_website_content(website_url)
            
            # الحصول على البرومبت
            prompts = self._get_ad_copy_prompts()
            prompt = prompts["color_analysis"].format(
                product_service=product_service,
                website_url=website_url,
                website_content=website_content[:2000]  # أول 2000 حرف
            )
            
            # استدعاء CometAPI
            response = self._call_cometapi(prompt)
            
            if response.get("success"):
                # تحليل الاستجابة
                parsed_response = self._parse_json_response(response["content"])
                
                if "primary_color" in parsed_response:
                    self.logger.info(f"✅ تم تحليل ألوان الموقع")
                    return {
                        "success": True,
                        "colors": {
                            "primary": parsed_response.get("primary_color", "#1A1A1A"),
                            "secondary": parsed_response.get("secondary_color", "#00BFA5"),
                            "accent": parsed_response.get("accent_color", "#FF6B6B"),
                            "text": parsed_response.get("text_color", "#FFFFFF"),
                            "background": parsed_response.get("background_color", "#1A1A1A")
                        },
                        "color_palette": parsed_response.get("color_palette", []),
                        "brand_style": parsed_response.get("brand_style", "modern, clean, professional"),
                        "website_content": website_content,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No colors found in response",
                        "raw_response": response["content"]
                    }
            else:
                return {
                    "success": False,
                    "error": response.get("error"),
                    "message": "فشل في تحليل ألوان الموقع"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في تحليل ألوان الموقع: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في تحليل ألوان الموقع"
            }
    
    def _get_campaign_requirements(self, campaign_type: str) -> str:
        """الحصول على متطلبات Google Ads لكل نوع حملة"""
        requirements = {
            "SEARCH": "Headlines: 3-15 (max 30 chars each), Descriptions: 2-4 (max 90 chars each)",
            "DISPLAY": "Headlines: 5 short (max 30 chars), Descriptions: 5 long (max 90 chars), Images required",
            "VIDEO": "Headlines: 5 (max 30 chars), Descriptions: 5 (max 90 chars), Video required",
            "SHOPPING": "Product title, description, price, images",
            "PERFORMANCE_MAX": "Headlines: 3-15 (max 30 chars), Descriptions: 2-5 (max 90 chars), Images: 3-20",
            "DEMAND_GEN": "Headlines: 5 (max 40 chars), Descriptions: 5 (max 90 chars), Images required",
            "APP": "Headlines: 4 (max 30 chars), Descriptions: 4 (max 90 chars)",
            "LOCAL": "Business name, address, phone, headlines, descriptions",
            "SMART": "Headlines: 3 (max 30 chars), Descriptions: 2 (max 90 chars)",
            "HOTEL": "Hotel name, price, images, descriptions",
            "TRAVEL": "Headlines, descriptions, destination info, images"
        }
        return requirements.get(campaign_type.upper(), requirements["DISPLAY"])
    
    def generate_complete_ad_content(self, product_service: str, website_url: str, service_type: str = None, target_language: str = "ar", website_content: str = None, campaign_type: str = "DISPLAY", keywords_list: list = None) -> Dict[str, Any]:
        """توليد المحتوى الإعلاني الكامل بناءً على نوع الحملة وتعليمات Google Ads"""
        try:
            self.logger.info(f"🚀 بدء توليد المحتوى الإعلاني - نوع الحملة: {campaign_type}")
            
            # استخدام website_content إذا تم تمريره، وإلا جلبه
            if not website_content:
                website_content = self._fetch_website_content(website_url)
            else:
                self.logger.info(f"✅ استخدام محتوى الموقع الممرر: {len(website_content)} حرف")

            # استخدام الكلمات المفتاحية الممررة مباشرة
            keywords_line = ""
            if keywords_list and len(keywords_list) > 0:
                keywords_line = ', '.join(keywords_list)
                print(f"✅ تم استقبال {len(keywords_list)} كلمة مفتاحية من Google!")
                print(f"✅ أول 5 كلمات: {keywords_list[:5]}")
            else:
                # محاولة استخراجها من المحتوى كنسخة احتياطية
                if "الكلمات المفتاحية المستخرجة من Google:" in website_content:
                    keywords_line = website_content.split("الكلمات المفتاحية المستخرجة من Google:")[1].split("\n")[0].strip()
                    print(f"✅ تم استخراج الكلمات المفتاحية من النص: {keywords_line[:200]}")
                elif "الكلمات المفتاحية:" in website_content:
                    keywords_line = website_content.split("الكلمات المفتاحية:")[1].split("\n")[0].strip()
                    print(f"✅ تم استخراج الكلمات المفتاحية: {keywords_line[:200]}")
                else:
                    # استخراج كلمات مفتاحية من محتوى الموقع نفسه كـ fallback
                    print("⚠️ No keywords provided - extracting from website content...")
                    import re
                    # استخراج الكلمات العربية الطويلة (أكثر من 3 أحرف)
                    arabic_words = re.findall(r'[\u0600-\u06FF]{4,}', website_content)
                    # أخذ أكثر 10 كلمات تكراراً
                    from collections import Counter
                    word_counts = Counter(arabic_words)
                    top_keywords = [word for word, count in word_counts.most_common(10)]
                    if top_keywords:
                        keywords_line = ', '.join(top_keywords)
                        print(f"✅ Extracted {len(top_keywords)} keywords from website content: {top_keywords[:5]}")
                    else:
                        # آخر fallback - كلمات عامة
                        keywords_line = "منتجات, خدمات, عروض, جودة, أسعار"
                        print(f"⚠️ Using default fallback keywords")
            
            # الحصول على متطلبات Google Ads لنوع الحملة
            campaign_requirements = self._get_campaign_requirements(campaign_type)
            
            # Convert language code to language name
            language_map = {
                'ar': 'Arabic', 'en': 'English', 'fr': 'French', 'de': 'German', 
                'es': 'Spanish', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
                'zh-CN': 'Chinese (simplified)', 'zh-TW': 'Chinese (traditional)',
                'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi', 'tr': 'Turkish',
                'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish', 'th': 'Thai',
                'vi': 'Vietnamese', 'bn': 'Bengali', 'bg': 'Bulgarian', 'ca': 'Catalan',
                'cs': 'Czech', 'da': 'Danish', 'et': 'Estonian', 'fil': 'Filipino',
                'fi': 'Finnish', 'el': 'Greek', 'gu': 'Gujarati', 'he': 'Hebrew',
                'hu': 'Hungarian', 'is': 'Icelandic', 'id': 'Indonesian', 'kn': 'Kannada',
                'lv': 'Latvian', 'lt': 'Lithuanian', 'ms': 'Malay', 'ml': 'Malayalam',
                'mr': 'Marathi', 'no': 'Norwegian', 'fa': 'Persian', 'ro': 'Romanian',
                'sr': 'Serbian', 'sk': 'Slovak', 'sl': 'Slovenian', 'ta': 'Tamil',
                'te': 'Telugu', 'uk': 'Ukrainian', 'ur': 'Urdu'
            }
            
            language_name = language_map.get(target_language, 'English')
            self.logger.info(f"🌍 Generating content in {language_name} (code: {target_language})")
            
            # برومبت ديناميكي بناءً على نوع الحملة والكلمات المفتاحية الحقيقية من Google
            comprehensive_prompt = f"""
Create professional Google Ads content based on these keywords from Google Keyword Planner.

Campaign Type: {campaign_type}
Website URL: {website_url}

KEYWORDS FROM GOOGLE KEYWORD PLANNER:
{keywords_line}

Website Content:
{website_content}

Google Ads Requirements for {campaign_type}:
{campaign_requirements}

REQUIREMENTS:

**HEADLINES (30 characters max):**
- Generate EXACTLY 30 unique headlines
- Analyze the keywords to understand the industry and target audience
- Use relevant numbers, percentages, and industry-specific power words
- Include location if present in keywords
- Create headlines that match the business type and tone
- Mix of: service/product names, benefits, urgency, credibility elements

**DESCRIPTIONS (60-90 characters - CRITICAL):**
- Generate EXACTLY 4 descriptions
- Length: MINIMUM 60 characters, MAXIMUM 90 characters
- MANDATORY: Each description MUST end with a Call-to-Action (CTA)
- Structure: [Value/Benefit] + [Key Feature] + [Industry-Appropriate CTA]
- The CTA must be relevant to the business type identified from keywords
- Analyze keywords to determine appropriate CTAs (booking, purchasing, contacting, registering, etc.)
- Use full character space (60-90 chars)

CRITICAL LANGUAGE REQUIREMENT:
ALL content (headlines, descriptions, keywords) MUST be written in {language_name} language.
Use {language_name} professional, persuasive, industry-appropriate tone.

Return VALID JSON:
{{
    "headlines": ["headline 1", "headline 2", "headline 3", "headline 4", "headline 5", "headline 6", "headline 7", "headline 8", "headline 9", "headline 10", "headline 11", "headline 12", "headline 13", "headline 14", "headline 15", "headline 16", "headline 17", "headline 18", "headline 19", "headline 20", "headline 21", "headline 22", "headline 23", "headline 24", "headline 25", "headline 26", "headline 27", "headline 28", "headline 29", "headline 30"],
    "descriptions": ["description 1 (60-90 chars with CTA)", "description 2 (60-90 chars with CTA)", "description 3 (60-90 chars with CTA)", "description 4 (60-90 chars with CTA)"],
    "keywords": {keywords_line.split(',') if keywords_line else []},
    "recommended_campaign_type": "{campaign_type.lower()}",
    "confidence_score": 95,
    "reasoning": "Created content based on Google keywords with industry-appropriate CTAs",
    "colors": {{"primary": "#hex", "secondary": "#hex", "accent": "#hex"}},
    "color_palette": ["#hex1", "#hex2", "#hex3"],
    "brand_style": "modern professional"
            }}
            """
            
            # طباعة البرومبت للتحقق من الكلمات المفتاحية
            print("=" * 80)
            print("🤖 البرومبت المرسل للذكاء الاصطناعي:")
            print("=" * 80)
            print(comprehensive_prompt[:500] + "..." if len(comprehensive_prompt) > 500 else comprehensive_prompt)
            print("=" * 80)
            
            # طلب واحد فقط لجميع المهام
            ai_response = self._call_cometapi(comprehensive_prompt)
            
            if ai_response.get("success"):
                # استخدام دالة تحليل JSON المحسنة
                content = ai_response.get("content", "{}")
                
                print("=" * 80)
                print("✅ استجابة الذكاء الاصطناعي:")
                print("=" * 80)
                print(content[:800] + "..." if len(content) > 800 else content)
                print("=" * 80)
                
                parsed_result = self._parse_json_response(content)
                
                # التحقق من وجود خطأ في التحليل
                if "error" in parsed_result:
                    self.logger.error(f"خطأ في تحليل JSON: {parsed_result['error']}")
                    return {
                        "success": False,
                        "error": "فشل في تحليل استجابة الذكاء الاصطناعي",
                        "message": "لا يمكن توليد المحتوى بدون استجابة صحيحة من الذكاء الاصطناعي"
                    }
                
                # إنشاء النسخ الإعلانية من النتيجة المحللة
                ad_copies = []
                headlines = parsed_result.get("headlines", [])
                descriptions = parsed_result.get("descriptions", [])
                
                # إنشاء نسخ إعلانية من العناوين والأوصاف
                for i, headline in enumerate(headlines[:5]):
                    description = descriptions[i] if i < len(descriptions) else descriptions[0] if descriptions else "وصف إعلاني احتياطي"
                    ad_copies.append({
                        "headline": headline,
                        "description": description,
                        "final_url": website_url,
                        "match_type": "BROAD",
                        "bid_amount": 2500000  # 2.5 دولار
                    })
                
                # توليد الصور الإعلانية باستخدام الألوان المستخرجة
                brand_colors = parsed_result.get("colors", {})
                image_result = self.generate_ad_images(product_service, website_url, brand_colors)
                
                # تنظيف Headlines و Descriptions و Keywords من أرقام الهواتف (Google Ads Policy)
                self.logger.info("🧹 تنظيف المحتوى من أرقام الهواتف (Google Ads Policy)...")
                cleaned_headlines = [remove_phone_numbers(h) for h in headlines if h]
                cleaned_descriptions = [remove_phone_numbers(d) for d in descriptions if d]
                cleaned_keywords = [remove_phone_numbers(k) for k in parsed_result.get("keywords", []) if k]
                
                # إزالة أي نصوص فارغة بعد التنظيف
                cleaned_headlines = [h for h in cleaned_headlines if h.strip()]
                cleaned_descriptions = [d for d in cleaned_descriptions if d.strip()]
                cleaned_keywords = [k for k in cleaned_keywords if k.strip()]
                
                self.logger.info(f"✅ تم تنظيف {len(headlines)} headlines → {len(cleaned_headlines)} نظيفة")
                self.logger.info(f"✅ تم تنظيف {len(descriptions)} descriptions → {len(cleaned_descriptions)} نظيفة")
                self.logger.info(f"✅ تم تنظيف {len(parsed_result.get('keywords', []))} keywords → {len(cleaned_keywords)} نظيفة")
                
                # تحديث ad_copies بالنصوص المنظفة
                cleaned_ad_copies = []
                for i, headline in enumerate(cleaned_headlines[:5]):
                    description = cleaned_descriptions[i] if i < len(cleaned_descriptions) else cleaned_descriptions[0] if cleaned_descriptions else "وصف إعلاني احتراف"
                    cleaned_ad_copies.append({
                        "headline": headline,
                        "description": description,
                        "final_url": website_url,
                        "match_type": "BROAD",
                        "bid_amount": 2500000
                    })
                
                result = {
                    "success": True,
                    "product_service": product_service,
                    "website_url": website_url,
                    "headlines": cleaned_headlines,
                    "descriptions": cleaned_descriptions,
                    "keywords": cleaned_keywords,
                    "ad_copies": cleaned_ad_copies,
                    "recommended_campaign_type": parsed_result.get("recommended_campaign_type", "search_ads"),
                    "confidence_score": parsed_result.get("confidence_score", 0),
                    "reasoning": parsed_result.get("reasoning", ""),
                    "alternative_types": parsed_result.get("alternative_types", []),
                    "colors": brand_colors,
                    "color_palette": parsed_result.get("color_palette", []),
                    "brand_style": parsed_result.get("brand_style", "modern, clean, professional"),
                    "website_content": website_content,
                    "timestamp": datetime.now().isoformat(),
                    "errors": [],
                    "images": {
                        "success": image_result.get("success", False),
                        "image_url": image_result.get("image_url", ""),
                        "error": image_result.get("error", "") if not image_result.get("success") else ""
                    }
                }
            else:
                # في حالة فشل الطلب، إرجاع خطأ
                return {
                    "success": False,
                    "error": ai_response.get("error", "خطأ في استدعاء الذكاء الاصطناعي"),
                    "message": "لا يمكن توليد المحتوى بدون استجابة من الذكاء الاصطناعي"
                }
            
            self.logger.info(f"✅ تم توليد المحتوى الإعلاني الكامل")
            return result
            
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد المحتوى الإعلاني الكامل: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد المحتوى الإعلاني الكامل"
            }
    
    def generate_single_ad_element(self, element_type: str, website_url: str, existing_content: Dict = None, keywords_list: list = None, language: str = 'ar') -> Dict[str, Any]:
        """توليد عنصر إعلاني واحد فقط (headline أو description) بسرعة"""
        try:
            # Language mapping
            language_map = {
                'ar': 'Arabic', 'en': 'English', 'fr': 'French', 'de': 'German', 
                'es': 'Spanish', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
                'zh-CN': 'Chinese (simplified)', 'zh-TW': 'Chinese (traditional)',
                'ja': 'Japanese', 'ko': 'Korean', 'hi': 'Hindi', 'tr': 'Turkish',
                'nl': 'Dutch', 'pl': 'Polish', 'sv': 'Swedish', 'th': 'Thai',
                'vi': 'Vietnamese'
            }
            
            language_name = language_map.get(language, 'English')
            self.logger.info(f"🚀 توليد {element_type} واحد فقط بلغة {language_name}")
            
            # استخدام الكلمات المفتاحية الموجودة
            keywords_line = ""
            if keywords_list and len(keywords_list) > 0:
                keywords_line = ', '.join(keywords_list[:5])  # أول 5 كلمات فقط للسرعة
            elif existing_content and existing_content.get('keywords'):
                keywords_line = ', '.join(existing_content['keywords'][:5])
            
            # برومبت مختصر وسريع (ديناميكي حسب اللغة)
            if element_type == 'headline':
                prompt = f"""Generate ONE new Google Ads headline in {language_name}.

Keywords: {keywords_line}
Website: {website_url}

CRITICAL LANGUAGE REQUIREMENT:
Write ONLY in {language_name} language. Do NOT use any other language.

Requirements:
- Maximum 30 characters
- Use keywords naturally
- Different from existing headlines
- Focus on benefits
- Professional {language_name} tone

Return ONLY JSON:
{{"headline": "your headline here in {language_name}"}}"""
            else:  # description
                prompt = f"""Generate ONE new Google Ads description in {language_name}.

Keywords: {keywords_line}
Website: {website_url}

CRITICAL LANGUAGE REQUIREMENT:
Write ONLY in {language_name} language. Do NOT use any other language.

Requirements:
- 60-90 characters (MINIMUM 60)
- MUST end with a Call-to-Action (CTA)
- Use keywords naturally
- Different from existing descriptions
- Structure: [Value] + [Benefit] + [CTA]
- Professional {language_name} tone

Return ONLY JSON:
{{"description": "your description here with CTA in {language_name}"}}"""
            
            # استدعاء سريع للذكاء الاصطناعي
            ai_response = self._call_cometapi(prompt)
            
            if ai_response.get("success"):
                content = ai_response.get("content", "{}")
                parsed_result = self._parse_json_response(content)
                
                if element_type == 'headline' and 'headline' in parsed_result:
                    return {
                        "success": True,
                        "text": parsed_result['headline']
                    }
                elif element_type == 'description' and 'description' in parsed_result:
                    return {
                        "success": True,
                        "text": parsed_result['description']
                    }
                else:
                    return {
                        "success": False,
                        "error": "No valid content in response"
                    }
            else:
                return {
                    "success": False,
                    "error": ai_response.get("error", "AI call failed")
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد {element_type}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_ad_images(self, product_service: str, website_url: str, brand_colors: Dict[str, str] = None) -> Dict[str, Any]:
        """توليد صور إعلانية باستخدام DALL-E 3"""
        try:
            self.logger.info(f"🎨 بدء توليد الصور الإعلانية للمنتج: {product_service}")
            
            # إنشاء وصف للصورة بناءً على المنتج/الخدمة
            image_prompt = f"""
            Create a professional advertisement image for: {product_service}
            Website: {website_url}
            
            Requirements:
            - Professional, clean, modern design
            - Suitable for Google Ads display campaigns
            - High quality, commercial use
            - Brand colors: {brand_colors.get('primary', '#1A1A1A') if brand_colors else '#1A1A1A'}
            - Arabic-friendly design
            - No text overlay (text will be added separately)
            - 1024x1024 pixels, square format
            - Bright, engaging, trustworthy appearance
            """
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.image_model,
                "prompt": image_prompt,
                "n": 1,
                "size": "1024x1024",
                "quality": "standard",
                "style": "natural"
            }
            
            response = requests.post(
                f"{self.base_url}/v1/images/generations",
                headers=headers,
                json=data,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if "data" in result and len(result["data"]) > 0:
                    image_url = result["data"][0]["url"]
                    self.logger.info(f"✅ تم توليد صورة إعلانية بنجاح")
                    return {
                        "success": True,
                        "image_url": image_url,
                        "product_service": product_service,
                        "website_url": website_url,
                        "brand_colors": brand_colors,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No image generated",
                        "message": "فشل في توليد الصورة"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}",
                    "message": "فشل في استدعاء خدمة توليد الصور"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد الصور الإعلانية: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد الصور الإعلانية"
            }

    def generate_campaign_images(self, campaign_type: str, product_service: str, website_url: str, keywords: List[str], brand_colors: Dict[str, str] = None) -> Dict[str, Any]:
        """توليد صور إعلانية مناسبة لكل نوع حملة ومحتواها وكلماتها المفتاحية"""
        try:
            self.logger.info(f"🎨 بدء توليد الصور الإعلانية للحملة: {campaign_type}")
            
            # الحصول على متطلبات الصور للحملة
            image_requirements = self.get_campaign_image_requirements()
            campaign_requirements = image_requirements.get(campaign_type, {})
            
            if not campaign_requirements.get("required", False):
                self.logger.info(f"✅ نوع الحملة {campaign_type} لا يتطلب صورًا")
                return {
                    "success": True,
                    "message": f"نوع الحملة {campaign_type} لا يتطلب صورًا",
                    "campaign_type": campaign_type,
                    "images": []
                }
            
            # إنشاء وصف للصورة بناءً على نوع الحملة والمحتوى
            image_prompt = self._create_campaign_image_prompt(campaign_type, product_service, website_url, keywords, brand_colors)
            
            # توليد الصور حسب متطلبات الحملة
            generated_images = []
            images_config = campaign_requirements.get("images", {})
            
            for image_type, image_config in images_config.items():
                try:
                    # إنشاء وصف محدد لكل نوع صورة
                    specific_prompt = f"{image_prompt}\n\nImage type: {image_type}\nSize: {image_config.get('size', '1024x1024')}\nAspect ratio: {image_config.get('aspect_ratio', '1:1')}"
                    
                    # توليد الصورة
                    image_result = self._generate_single_image(specific_prompt, image_config)
                    
                    if image_result.get("success"):
                        generated_images.append({
                            "type": image_type,
                            "url": image_result["image_url"],
                            "size": image_config.get("size", "1024x1024"),
                            "aspect_ratio": image_config.get("aspect_ratio", "1:1"),
                            "format": image_config.get("formats", ["JPEG", "PNG"])[0]
                        })
                        self.logger.info(f"✅ تم توليد صورة {image_type} بنجاح")
                    else:
                        self.logger.warning(f"⚠️ فشل في توليد صورة {image_type}: {image_result.get('error')}")
                        
                except Exception as e:
                    self.logger.error(f"❌ خطأ في توليد صورة {image_type}: {e}")
                    continue
            
            if generated_images:
                self.logger.info(f"✅ تم توليد {len(generated_images)} صورة للحملة {campaign_type}")
                return {
                    "success": True,
                    "campaign_type": campaign_type,
                    "product_service": product_service,
                    "website_url": website_url,
                    "keywords": keywords,
                    "brand_colors": brand_colors,
                    "images": generated_images,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "فشل في توليد أي صورة",
                    "message": "لم يتم توليد أي صورة للحملة"
                }
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد صور الحملة: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "خطأ في توليد صور الحملة"
            }
    
    def generate_campaign_images_detailed(self, campaign_type: str, product_service: str, website_url: str, keywords: List[str], brand_colors: Dict[str, str] = None) -> List[Dict[str, Any]]:
        """توليد صور إعلانية للحملة بناءً على المتطلبات التفصيلية"""
        try:
            logger.info(f"🎨 بدء توليد الصور الإعلانية التفصيلية للمنتج: {product_service}")
            
            # الحصول على متطلبات الصور للحملة
            image_requirements = self.get_campaign_image_requirements().get(campaign_type, {})
            
            if not image_requirements.get("required", False):
                logger.info(f"نوع الحملة {campaign_type} لا يتطلب صورًا")
                return []
            
            generated_images = []
            images_config = image_requirements.get("images", {})
            min_images = image_requirements.get("min_images", 1)
            max_images = image_requirements.get("max_images", 10)
            
            # توليد العدد المطلوب من الصور لكل نوع
            for image_type, config in images_config.items():
                try:
                    # تحديد عدد الصور المطلوبة لهذا النوع
                    images_needed = min(max_images, max(min_images, 1))
                    
                    for i in range(images_needed):
                        image_data = self._generate_single_image_detailed(
                            campaign_type=campaign_type,
                            image_type=image_type,
                            product_service=product_service,
                            website_url=website_url,
                            keywords=keywords,
                            brand_colors=brand_colors,
                            config=config,
                            image_index=i + 1
                        )
                        
                        if image_data:
                            generated_images.append(image_data)
                            logger.info(f"✅ تم توليد صورة {image_type} #{i + 1} بنجاح")
                    
                except Exception as e:
                    logger.error(f"❌ فشل في توليد صورة {image_type}: {str(e)}")
                    continue
            
            logger.info(f"✅ تم توليد {len(generated_images)} صورة إعلانية بنجاح")
            return generated_images
            
        except Exception as e:
            logger.error(f"❌ فشل في توليد الصور الإعلانية: {str(e)}")
            return []

    def _create_campaign_image_prompt(self, campaign_type: str, product_service: str, website_url: str, keywords: List[str], brand_colors: Dict[str, str] = None) -> str:
        """إنشاء وصف الصورة المناسب لكل نوع حملة"""
        
        # إنشاء وصف أساسي
        base_prompt = f"""
        Create a professional advertisement image for: {product_service}
        Website: {website_url}
        Keywords: {', '.join(keywords[:5])}
        Brand colors: {brand_colors.get('primary', '#1A1A1A') if brand_colors else '#1A1A1A'}
        
        Requirements:
        - Professional, clean, modern design
        - High quality, commercial use
        - Arabic-friendly design
        - NO TEXT, NO WORDS, NO LETTERS on the image (absolutely no text overlay - text will be added separately by the ad system)
        - Pure visual design without any written content
        - Bright, engaging, trustworthy appearance
        - Image only, no typography
        """
        
        # إضافة متطلبات محددة لكل نوع حملة
        campaign_specific_prompts = {
            "SEARCH": """
            - Suitable for Search campaigns
            - Text-based ads with image assets for enhancement
            - Professional and trustworthy appearance
            - Clear and compelling messaging
            - Square and landscape image formats
            """,
            "PERFORMANCE_MAX": """
            - Suitable for Performance Max campaigns
            - Works across all Google networks (Search, Display, YouTube, Gmail, Discover)
            - Versatile design that works in different contexts
            - Eye-catching and conversion-focused
            """,
            "DISPLAY": """
            - Suitable for Display campaigns
            - Visual appeal for website banners and ads
            - Attention-grabbing design
            - Professional and trustworthy appearance
            """,
            "VIDEO": """
            - Suitable for Video campaign thumbnails
            - High visual impact for video content
            - Engaging and click-worthy design
            - Professional video thumbnail style
            """,
            "SHOPPING": """
            - Suitable for Shopping campaigns
            - Product-focused design
            - Clean and professional product presentation
            - E-commerce friendly appearance
            - High-quality product images
            """,
            "SMART": """
            - Suitable for Smart campaigns
            - Automated campaign friendly design
            - Simple and clear visual message
            - Professional business appearance
            """,
            "LOCAL": """
            - Suitable for Local campaigns
            - Local business focused design
            - Community and location-based appeal
            - Professional local service appearance
            """,
            "DISCOVERY": """
            - Suitable for Discovery campaigns
            - Engaging and discovery-focused design
            - Eye-catching for feed content
            - Modern and appealing appearance
            """,
            "TRAVEL": """
            - Suitable for Travel campaigns
            - Travel and tourism focused design
            - Destination and experience appeal
            - Professional travel service appearance
            """,
            "DEMAND_GEN": """
            - Suitable for Demand Gen campaigns
            - Demand generation focused design
            - Engaging and conversion-oriented
            - Professional marketing appearance
            """,
            "MULTI_CHANNEL": """
            - Suitable for Multi-Channel campaigns
            - App and mobile focused design
            - Modern app store appearance
            - Professional mobile app design
            - App icon, screenshot, and banner formats
            """
        }
        
        # إضافة الوصف المحدد للحملة
        campaign_prompt = campaign_specific_prompts.get(campaign_type, "")
        
        return f"{base_prompt}\n{campaign_prompt}"
    
    def _generate_single_image(self, prompt: str, image_config: Dict[str, Any]) -> Dict[str, Any]:
        """توليد صورة واحدة باستخدام Flux-1.1-Pro-Ultra (أعلى جودة واقعية)"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # تحديد أبعاد الصورة - Flux Ultra يدعم أحجام مخصصة
            width = 1024
            height = 1024
            
            size = image_config.get("size", "1024x1024")
            if "x" in size or "×" in size:
                try:
                    dims = size.replace("×", "x").split("x")
                    width = int(dims[0])
                    height = int(dims[1])
                except:
                    width, height = 1024, 1024
            
            # تحسين البرومبت باستخدام GPT-4o-mini للحصول على صور واقعية 100%
            enhanced_prompt = self._enhance_prompt_with_gpt4o(prompt)
            
            data = {
                "model": self.image_model,
                "prompt": enhanced_prompt,
                "width": width,
                "height": height,
                "aspect_ratio": "16:9" if width > height else "1:1",  # Flux Ultra يدعم aspect ratios
                "output_format": "jpeg",  # JPEG للصور الواقعية
                "safety_tolerance": 2  # أقل تقييد للواقعية
            }
            
            response = requests.post(
                f"{self.base_url}/v1/images/generations",
                headers=headers,
                json=data,
                timeout=180
            )
            
            if response.status_code == 200:
                result = response.json()
                if "data" in result and len(result["data"]) > 0:
                    image_url = result["data"][0]["url"]
                    return {
                        "success": True,
                        "image_url": image_url
                    }
                else:
                    return {
                        "success": False,
                        "error": "No image generated"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _enhance_prompt_with_gpt4o(self, prompt: str) -> str:
        """تحسين البرومبت باستخدام GPT-4o-mini"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.text_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a professional photography director specializing in PHOTOREALISTIC commercial photography. Your job is to enhance image prompts to achieve 100% realistic, documentary-style photographs - NOT AI-generated looking images. Focus on: camera settings, natural lighting, authentic environments, real materials, professional workers, and genuine work scenes."
                    },
                    {
                        "role": "user",
                        "content": f"Enhance this prompt for PHOTOREALISTIC documentary photography. The result must look like a real photograph taken with a professional DSLR camera, NOT an AI-generated image:\n\n{prompt}\n\nAdd specific details about: camera angle, lighting conditions, authentic worker appearance, real tool usage, genuine environment details, natural colors, and realistic textures. Make it look 100% like real documentary photography."
                    }
                ],
                "max_tokens": 400,
                "temperature": 0.6
            }
            
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                enhanced = result["choices"][0]["message"]["content"].strip()
                self.logger.info(f"✨ تم تحسين البرومبت بواسطة GPT-4o-mini")
                return enhanced
            else:
                self.logger.warning(f"فشل تحسين البرومبت، استخدام الأصلي")
                return prompt
                
        except Exception as e:
            self.logger.warning(f"خطأ في تحسين البرومبت: {e}")
            return prompt

    def _generate_single_image_detailed(self, campaign_type: str, image_type: str, product_service: str, website_url: str, keywords: List[str], brand_colors: Dict[str, str] = None, config: Dict[str, Any] = None, image_index: int = 1, website_content: str = None) -> Dict[str, Any]:
        """توليد صورة واحدة بالتفاصيل المطلوبة"""
        try:
            # إنشاء وصف الصورة المخصص
            prompt = self._create_detailed_image_prompt(
                campaign_type=campaign_type,
                image_type=image_type,
                product_service=product_service,
                website_url=website_url,
                keywords=keywords,
                brand_colors=brand_colors,
                config=config,
                image_index=image_index,
                website_content=website_content
            )
            
            # استدعاء CometAPI لتوليد الصورة
            response = self._call_cometapi_image(prompt, config)
            
            if response.get("success"):
                return {
                    "success": True,
                    "image_type": image_type,
                    "campaign_type": campaign_type,
                    "image_index": image_index,
                    "config": config,
                    "image_url": response.get("image_url"),
                    "prompt": prompt,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                logger.error(f"❌ فشل في توليد صورة {image_type}: {response.get('error')}")
                return None
                
        except Exception as e:
            logger.error(f"❌ خطأ في توليد صورة {image_type}: {str(e)}")
            return None

    def _analyze_service_type(self, service_context: str, product_service: str, keywords_text: str = "", website_description: str = "") -> Dict[str, Any]:
        """تحليل نوع الخدمة ديناميكياً لتوليد صور مخصصة"""
        
        text = f"{service_context} {product_service}".lower()
        
        # استخراج ديناميكي 100% من الموقع - لا توجد أي افتراضات ثابتة
        return self._extract_fully_dynamic_service_details(text, keywords_text, website_description)

    def _extract_fully_dynamic_service_details(self, text: str, keywords_text: str, website_description: str) -> Dict[str, Any]:
        """استخراج تفاصيل الخدمة ديناميكياً 100% من الموقع والكلمات المفتاحية فقط - بدون أي قوالب ثابتة"""

        # دمج جميع النصوص للتحليل الشامل
        all_text = f"{text} {keywords_text} {website_description}".lower()

        # استخراج ديناميكي كامل بدون أي افتراضات ثابتة
        return {
            "worker_action": self._extract_action_dynamically(all_text),
            "tools": self._extract_tools_dynamically(all_text),
            "material_color": self._extract_materials_dynamically(all_text),
            "environment": self._extract_environment_dynamically(all_text),
            "uniform_color": self._extract_uniform_dynamically(all_text)
        }

    def _extract_action_dynamically(self, text: str) -> str:
        """استخراج الإجراء ديناميكياً من النص فقط"""
        # البحث عن أفعال وإجراءات في النص
        action_patterns = [
            r"ي(\w+)",  # أفعال بالياء
            r"ن(\w+)",  # أفعال بالنون
            r"ت(\w+)",  # أفعال بالتاء
            r"(\w+)ing",  # أفعال بالـ ing
        ]

        import re
        actions = []
        for pattern in action_patterns:
            matches = re.findall(pattern, text)
            actions.extend(matches[:2])  # أول كلمتين فقط

        return actions[0] if actions else "professional work"

    def _extract_tools_dynamically(self, text: str) -> str:
        """استخراج الأدوات ديناميكياً من النص فقط"""
        # البحث عن كلمات تشير إلى الأدوات
        tool_indicators = [
            "شاحنة", "سيارة", "صناديق", "أدوات", "معدات", "حبال", "شرائط",
            "غلاف", "حماية", "فرش", "أجهزة", "ماكينات", "truck", "tools",
            "equipment", "boxes", "ropes", "tape", "wrapping", "padding"
        ]

        found_tools = []
        for indicator in tool_indicators:
            if indicator in text:
                found_tools.append(indicator)

        return found_tools[0] if found_tools else "professional equipment"

    def _extract_materials_dynamically(self, text: str) -> str:
        """استخراج المواد ديناميكياً من النص فقط"""
        # البحث عن كلمات تشير إلى المواد والألوان
        material_indicators = [
            "خشب", "معدن", "بلاستيك", "زجاج", "قماش", "جلد", "ورق",
            "أبيض", "أسود", "أزرق", "أحمر", "أخضر", "أصفر", "بني",
            "wood", "metal", "plastic", "glass", "fabric", "leather", "paper"
        ]

        found_materials = []
        for indicator in material_indicators:
            if indicator in text:
                found_materials.append(indicator)

        return found_materials[0] if found_materials else "standard materials"

    def _extract_environment_dynamically(self, text: str) -> str:
        """استخراج البيئة ديناميكياً من النص فقط"""
        # البحث عن كلمات تشير إلى البيئة
        env_indicators = [
            "شقة", "منزل", "مكتب", "مستودع", "محل", "مبنى", "خارجي", "داخلي",
            "سكني", "تجاري", "apartment", "house", "office", "warehouse", "outdoor"
        ]

        found_envs = []
        for indicator in env_indicators:
            if indicator in text:
                found_envs.append(indicator)

        return found_envs[0] if found_envs else "business location"

    def _extract_uniform_dynamically(self, text: str) -> str:
        """استخراج ألوان الزي ديناميكياً من النص فقط"""
        # البحث عن كلمات تشير إلى الألوان
        color_indicators = [
            "أزرق", "أبيض", "أسود", "أحمر", "أخضر", "أصفر", "برتقالي", "بني",
            "رمادي", "وردي", "blue", "white", "black", "red", "green", "yellow"
        ]

        found_colors = []
        for indicator in color_indicators:
            if indicator in text:
                found_colors.append(indicator)

        return found_colors[0] if found_colors else "professional uniform"
    
    def _create_detailed_image_prompt(self, campaign_type: str, image_type: str, product_service: str, website_url: str, keywords: List[str], brand_colors: Dict[str, str] = None, config: Dict[str, Any] = None, image_index: int = 1, website_content: str = None) -> str:
        """إنشاء وصف مفصل للصورة بناءً على نوع الحملة ونوع الصورة والكلمات المفتاحية"""
        
        # الحصول على معلومات الصورة
        size = config.get("size", "1200×628") if config else "1200×628"
        aspect_ratio = config.get("aspect_ratio", "1.91:1") if config else "1.91:1"
        description = config.get("description", "صورة إعلانية") if config else "صورة إعلانية"
        field_type = config.get("field_type", "AD_IMAGE") if config else "AD_IMAGE"
        
        # استخراج الموضوع الرئيسي من الكلمات المفتاحية و website_content
        top_keywords = keywords[:5] if keywords else []
        service_context = ', '.join(top_keywords) if top_keywords else product_service
        
        # استخدام website_content إذا كان متوفراً لتحسين تحليل الخدمة
        if website_content:
            service_context = f"{service_context}, {website_content[:300]}"  # أول 300 حرف من المحتوى
        
        # إنشاء برومبت ديناميكي 100% من فحص الموقع والكلمات المفتاحية
        keywords_text = ', '.join(top_keywords[:10]) if top_keywords else product_service
        
        # استخراج الوصف الكامل من محتوى الموقع الفعلي
        website_description = ""
        if website_content:
            # استخراج أول 400 حرف من محتوى الموقع
            website_description = website_content[:400].strip()
        
        # تحليل نوع الخدمة ديناميكياً من الكلمات المفتاحية
        service_analysis = self._analyze_service_type(service_context, product_service, keywords_text, website_description)
        
        # بناء البرومبت ديناميكي 100% من محتوى الموقع والكلمات المفتاحية فقط - بدون أي افتراضات ثابتة
        base_prompt = self._create_fully_dynamic_prompt(
            keywords_text, website_description
        )
        
        # توليد برومبت ديناميكي 100% بدون أي شيء ثابت - استخراج كامل من الموقع فقط
        return self._generate_purely_dynamic_prompt(
            keywords_text, website_description
        )

    def _generate_purely_dynamic_prompt(self, keywords_text: str, website_description: str) -> str:
        """توليد برومبت ديناميكي 100% بدون أي شيء ثابت - يعتمد على الذكاء الاصطناعي فقط"""

        # دمج النصوص للتحليل الشامل
        combined_text = f"{keywords_text} {website_description}"

        # استخدام الذكاء الاصطناعي لتحليل المحتوى واستخراج العناصر
        analysis_result = self._ai_analyze_content(combined_text)

        # بناء البرومبت بناءً على نتائج التحليل فقط
        prompt_parts = []

        # إضافة العناصر المستخرجة من الذكاء الاصطناعي
        for category, items in analysis_result.items():
            if items and len(items) > 0:
                prompt_parts.append(f"{category.upper()}: {', '.join(items[:3])}")

        # إذا لم نجد أي عناصر، نستخدم برومبت عام
        if not prompt_parts:
            prompt_parts.append("PROFESSIONAL: High quality professional photography")
            prompt_parts.append(f"CONTENT: {keywords_text}")
            prompt_parts.append(f"DESCRIPTION: {website_description[:200]}")

        return "\n".join(prompt_parts)

    def _extract_all_info_dynamically(self, text: str) -> Dict[str, str]:
        """استخراج جميع المعلومات ديناميكياً بدون أي قواميس ثابتة أو افتراضات"""

        info = {}

        # استخراج ديناميكي كامل بدون أي قواميس ثابتة - يعتمد فقط على تحليل النص الذكي
        all_extracted = self._analyze_text_intelligently(text)

        # تصنيف العناصر المستخرجة حسب نوعها ديناميكياً
        for category, items in all_extracted.items():
            if items and len(items) > 0:
                info[category] = f"{category}: {', '.join(items[:3])}"

        return info

    # تم إزالة جميع الدوال الثابتة - النظام الآن ديناميكي 100% يعتمد فقط على تحليل النص الذكي

    def _analyze_text_intelligently(self, text: str) -> Dict[str, List[str]]:
        """تحليل النص بالذكاء الاصطناعي لاستخراج جميع العناصر ديناميكياً بدون أي قواميس ثابتة"""

        # استخدام الذكاء الاصطناعي لتحليل النص واستخراج العناصر المهمة
        return self._ai_analyze_content(text)

    def _ai_analyze_content(self, text: str) -> Dict[str, List[str]]:
        """استخدام الذكاء الاصطناعي لتحليل المحتوى واستخراج العناصر المهمة"""

        try:
            # استخدام TEXT_MODEL لتحليل المحتوى الذكي
            prompt = f"""
            قم بتحليل النص التالي واستخرج العناصر المهمة لتوليد صور احترافية:

            النص: {text}

            قم بتصنيف العناصر في الفئات التالية:
            - location: أماكن ومدن مذكورة
            - service: خدمات وأنشطة مذكورة
            - workers: أشخاص وعاملين مذكورين
            - tools: أدوات ومعدات مذكورة
            - materials: مواد وخامات مذكورة
            - environment: أماكن وبيئات مذكورة
            - actions: أفعال وأنشطة مذكورة
            - objects: أشياء ومواد مذكورة
            - qualities: مصطلحات جودة مذكورة

            أعد النتيجة بتنسيق JSON فقط، بدون أي شرح إضافي.
            """

            # استدعاء الذكاء الاصطناعي للتحليل
            analysis_result = self._call_text_model(prompt)

            if analysis_result and analysis_result.get('success'):
                content = analysis_result.get('content', '')

                # محاولة تحليل النتيجة كـ JSON
                try:
                    import json
                    parsed_result = json.loads(content)
                    return parsed_result
                except json.JSONDecodeError:
                    # إذا لم يكن JSON صالح، نحاول استخراج المعلومات بطريقة أخرى
                    return self._parse_ai_response(content)
            else:
                # في حالة فشل الذكاء الاصطناعي، نعود إلى التحليل البسيط
                return self._fallback_text_analysis(text)

        except Exception as e:
            # في حالة وجود خطأ، نعود إلى التحليل البسيط
            return self._fallback_text_analysis(text)

    def _call_text_model(self, prompt: str) -> Dict[str, Any]:
        """استدعاء نموذج النص للتحليل"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            data = {
                "model": self.text_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "أنت محلل محتوى ذكي متخصص في استخراج العناصر من النصوص لتوليد صور احترافية. أعد النتائج بتنسيق JSON فقط."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.3
            }

            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                return {
                    "success": True,
                    "content": content
                }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code}"
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _parse_ai_response(self, content: str) -> Dict[str, List[str]]:
        """تحليل رد الذكاء الاصطناعي إذا لم يكن بتنسيق JSON"""
        elements = {
            'location': [],
            'service': [],
            'workers': [],
            'tools': [],
            'materials': [],
            'environment': [],
            'actions': [],
            'objects': [],
            'qualities': []
        }

        # استخراج الكلمات المهمة بطريقة بسيطة
        words = content.lower().split()
        for word in words:
            if len(word) > 3:
                # تصنيف الكلمات حسب أنماطها
                if any(char in word for char in ['مدينة', 'المدينة', 'مدينة']):
                    elements['location'].append(word)
                elif any(char in word for char in ['نقل', 'خدمة', 'شركة']):
                    elements['service'].append(word)
                elif any(char in word for char in ['عامل', 'مهندس', 'فني']):
                    elements['workers'].append(word)
                elif any(char in word for char in ['شاحنة', 'أداة', 'معدة']):
                    elements['tools'].append(word)
                elif any(char in word for char in ['خشب', 'معدن', 'بلاستيك']):
                    elements['materials'].append(word)

        # تنظيف النتائج
        for category in elements:
            elements[category] = list(set(elements[category]))[:3]

        return elements

    def _fallback_text_analysis(self, text: str) -> Dict[str, List[str]]:
        """تحليل احتياطي بسيط في حالة فشل الذكاء الاصطناعي"""
        elements = {
            'location': [],
            'service': [],
            'workers': [],
            'tools': [],
            'materials': [],
            'environment': [],
            'actions': [],
            'objects': [],
            'qualities': []
        }

        # استخراج بسيط للكلمات الطويلة
        words = text.split()
        long_words = [word for word in words if len(word) > 4]

        elements['objects'].extend(long_words[:5])
        elements['service'].extend([word for word in long_words if 'ing' in word or 'ment' in word])

        return elements

    def _call_cometapi_image(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """استدعاء CometAPI لتوليد الصورة"""
        try:
            if not self.cometapi_config:
                return {
                    "success": False,
                    "error": "CometAPI not configured"
                }
            
            # إضافة تعليمات صريحة بعدم وجود نص
            enhanced_prompt = f"{prompt}\n\nIMPORTANT: DO NOT include any text, words, letters, or typography in the image. Create a pure visual design without any written content. The image should be completely text-free."
            
            # إعداد البيانات للصورة
            data = {
                "model": "flux-1.1-pro",
                "prompt": enhanced_prompt,
                "width": int(config.get("size", "1200×628").split("×")[0]),
                "height": int(config.get("size", "1200×628").split("×")[1]),
                "num_inference_steps": 20,
                "guidance_scale": 7.5,
                "safety_tolerance": 2
            }
            
            # إرسال الطلب
            response = requests.post(
                f"{self.cometapi_config['base_url']}/v1/flux",
                headers={
                    "Authorization": f"Bearer {self.cometapi_config['api_key']}",
                    "Content-Type": "application/json"
                },
                json=data,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if "images" in result and len(result["images"]) > 0:
                    return {
                        "success": True,
                        "image_url": result["images"][0]["image_url"]
                    }
                else:
                    return {
                        "success": False,
                        "error": "No image generated"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _call_cometapi_image(self, prompt: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """استدعاء CometAPI لتوليد الصورة"""
        try:
            # استخراج الأبعاد من الإعدادات
            size = config.get("size", "1200×628") if config else "1200×628"
            width, height = map(int, size.split("×"))
            
            # إضافة تعليمات صريحة بعدم وجود نص
            enhanced_prompt = f"{prompt}\n\nIMPORTANT: DO NOT include any text, words, letters, or typography in the image. Create a pure visual design without any written content. The image should be completely text-free."
            
            # إعداد البيانات
            data = {
                "model": "dall-e-3",
                "prompt": enhanced_prompt,
                "width": width,
                "height": height,
                "quality": "hd",
                "n": 1,
                "response_format": "url"
            }
            
            # استدعاء API
            response = requests.post(
                f"{self.cometapi_base_url}/v1/images/generations",
                headers=self.cometapi_headers,
                json=data,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                if "data" in result and len(result["data"]) > 0:
                    return {
                        "success": True,
                        "image_url": result["data"][0]["url"],
                        "width": width,
                        "height": height
                    }
                else:
                    return {
                        "success": False,
                        "error": "No image generated"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def generate_complete_campaign_assets(self, campaign_type: str, product_service: str, website_url: str, keywords: List[str], budget: float = 25.0, language_code: str = "1019", location_ids: List[str] = None, brand_colors: Dict[str, str] = None) -> Dict[str, Any]:
        """توليد جميع أصول الحملة الكاملة (نصوص + صور)"""
        try:
            logger.info(f"🚀 بدء توليد جميع أصول الحملة: {campaign_type}")
            
            # توليد النصوص الإعلانية
            text_assets = self.generate_complete_ad_content(
                product_service=product_service,
                website_url=website_url
            )
            
            # توليد الصور الإعلانية
            image_assets = self.generate_campaign_images_detailed(
                campaign_type=campaign_type,
                product_service=product_service,
                website_url=website_url,
                keywords=keywords,
                brand_colors=brand_colors
            )
            
            # تجميع النتائج
            result = {
                "success": True,
                "campaign_type": campaign_type,
                "product_service": product_service,
                "website_url": website_url,
                "keywords": keywords,
                "budget": budget,
                "language_code": language_code,
                "location_ids": location_ids,
                "text_assets": text_assets,
                "image_assets": image_assets,
                "total_assets": {
                    "headlines": len(text_assets.get("headlines", [])),
                    "descriptions": len(text_assets.get("descriptions", [])),
                    "images": len(image_assets)
                },
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"✅ تم توليد جميع أصول الحملة بنجاح: {result['total_assets']}")
            return result
            
        except Exception as e:
            logger.error(f"❌ فشل في توليد أصول الحملة: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "فشل في توليد أصول الحملة"
            }
    
    def select_smart_video_ad_type(
        self,
        goal: str,
        budget: float,
        video_duration: int = None,
        industry: str = None,
        has_product: bool = False,
        target_audience: str = None
    ) -> Dict[str, Any]:
        """
        🤖 نظام ذكي لاختيار نوع إعلان الفيديو الأمثل
        
        Args:
            goal: الهدف ("awareness", "sales", "conversions", "discovery", "brand_message", "engagement")
            budget: الميزانية اليومية بالدولار
            video_duration: مدة الفيديو بالثواني (اختياري)
            industry: المجال/الصناعة (اختياري)
            has_product: هل يوجد منتجات؟ (اختياري)
            target_audience: الجمهور المستهدف (اختياري)
        
        Returns:
            Dict يحتوي على التوصية الكاملة مع السبب والبدائل
        """
        
        logger.info(f"🎯 بدء تحليل ذكي لاختيار نوع إعلان الفيديو...")
        logger.info(f"   الهدف: {goal}, الميزانية: ${budget}, المدة: {video_duration}s")
        
        # السيناريو 1: الوعي السريع بميزانية محدودة
        if goal == "awareness" and budget < 30:
            recommendation = {
                "video_ad_type": "VIDEO_BUMPER_AD",
                "video_ad_type_ar": "إعلان Bumper (6 ثواني)",
                "confidence": 95,
                "reason": "ميزانية محدودة - Bumper Ad يوفر أكبر وصول بأقل تكلفة",
                "reason_ar": "ميزانية محدودة ($" + str(budget) + ") - إعلان Bumper يوفر أكبر وصول بأقل تكلفة",
                "requirements": {
                    "video_duration": "6 ثواني بالضبط",
                    "video_duration_seconds": 6,
                    "cost_model": "CPM",
                    "cost_model_ar": "تكلفة الألف ظهور",
                    "estimated_cost_per_1000": "$0.40",
                    "estimated_daily_impressions": int(budget / 0.0004),
                    "estimated_daily_views": int(budget / 0.0004)
                },
                "pros": [
                    "رخيص جداً - أقل تكلفة",
                    "وصول واسع - يصل لأكبر عدد",
                    "سريع ومباشر - 6 ثواني فقط",
                    "غير قابل للتخطي - مشاهدة مضمونة 100%",
                    "مثالي للوعي السريع بالعلامة التجارية"
                ],
                "cons": [
                    "مدة قصيرة جداً (6 ثواني فقط)",
                    "رسالة محدودة - لا يمكن شرح تفاصيل كثيرة",
                    "يحتاج محتوى قوي جداً في 6 ثواني"
                ],
                "best_for": "الوعي السريع بالعلامة التجارية بميزانية محدودة",
                "best_for_ar": "الوعي السريع بالعلامة التجارية بميزانية محدودة",
                "use_cases": [
                    "شركة جديدة تريد انتشار سريع",
                    "إطلاق منتج جديد - مرحلة التعريف",
                    "حملة تذكيرية قصيرة"
                ]
            }
        
        # السيناريو 2: المبيعات والتحويلات مع فيديو طويل
        elif goal in ["sales", "conversions"] and (video_duration is None or video_duration >= 30) and budget >= 50:
            recommendation = {
                "video_ad_type": "VIDEO_TRUEVIEW_IN_STREAM_AD",
                "video_ad_type_ar": "إعلان TrueView In-Stream (قابل للتخطي)",
                "confidence": 92,
                "reason": "هدف تحويلات + ميزانية جيدة - TrueView يجذب المهتمين فقط",
                "reason_ar": "هدف مبيعات/تحويلات مع ميزانية جيدة ($" + str(budget) + ") - TrueView يجذب المهتمين فقط",
                "requirements": {
                    "video_duration": "30 ثانية أو أكثر (موصى به: 15-60 ثانية)",
                    "video_duration_seconds": "30-60",
                    "cost_model": "CPV",
                    "cost_model_ar": "تكلفة المشاهدة",
                    "estimated_cost_per_view": "$0.01-0.05",
                    "estimated_daily_views": int(budget / 0.03),
                    "estimated_daily_clicks": int(budget / 0.03 * 0.05),
                    "payment_condition": "تدفع عند مشاهدة 30 ثانية أو التفاعل"
                },
                "pros": [
                    "تدفع فقط للمهتمين - لا تدفع إذا تخطى المستخدم",
                    "معدل تحويل عالي - يجذب من لديه نية شراء",
                    "يمكن إضافة CTA قوي ومباشر",
                    "قابل للتخطي بعد 5 ثواني - يصفي الجمهور",
                    "مثالي للمبيعات والتحويلات"
                ],
                "cons": [
                    "يحتاج فيديو جيد - أول 5 ثواني مهمة جداً",
                    "تكلفة أعلى قليلاً من الأنواع الأخرى",
                    "قد يتخطى البعض - لكن هذا جيد (تصفية)"
                ],
                "best_for": "زيادة المبيعات والتحويلات المباشرة",
                "best_for_ar": "زيادة المبيعات والتحويلات المباشرة",
                "use_cases": [
                    "متجر إلكتروني يريد مبيعات",
                    "خدمة B2B تريد عملاء محتملين",
                    "تطبيق يريد تحميلات"
                ]
            }
        
        # السيناريو 3: المبيعات بميزانية متوسطة
        elif goal in ["sales", "conversions"] and budget < 50:
            recommendation = {
                "video_ad_type": "VIDEO_RESPONSIVE_AD",
                "video_ad_type_ar": "إعلان فيديو متجاوب",
                "confidence": 85,
                "reason": "هدف مبيعات + ميزانية متوسطة - Responsive Ad مرن ومناسب",
                "reason_ar": "هدف مبيعات مع ميزانية متوسطة ($" + str(budget) + ") - إعلان متجاوب مرن ومناسب",
                "requirements": {
                    "video_duration": "أي مدة (موصى به: 15-30 ثانية)",
                    "video_duration_seconds": "15-30",
                    "cost_model": "CPV أو CPM",
                    "cost_model_ar": "تكلفة المشاهدة أو تكلفة الألف ظهور",
                    "estimated_cost": "مرن - Google يحسن التكلفة تلقائياً",
                    "estimated_daily_views": int(budget / 0.02)
                },
                "pros": [
                    "الأكثر مرونة - يتكيف مع جميع المواضع",
                    "يعمل في كل الأماكن على YouTube",
                    "Google يحسنه تلقائياً - AI يختار الأفضل",
                    "أقل مخاطرة - خيار آمن",
                    "يدعم فيديوهات متعددة"
                ],
                "cons": [
                    "قد لا يكون الأفضل لهدف محدد جداً"
                ],
                "best_for": "جميع الأهداف - الخيار الأكثر أماناً ومرونة",
                "best_for_ar": "جميع الأهداف - الخيار الأكثر أماناً ومرونة",
                "use_cases": [
                    "متجر بميزانية متوسطة",
                    "حملة متعددة الأهداف",
                    "اختبار أنواع مختلفة من المحتوى"
                ]
            }
        
        # السيناريو 4: الاكتشاف والبحث
        elif goal == "discovery" or industry in ["education", "tutorial", "how-to"]:
            recommendation = {
                "video_ad_type": "IN_FEED_VIDEO_AD",
                "video_ad_type_ar": "إعلان فيديو في الخلاصة",
                "confidence": 88,
                "reason": "محتوى تعليمي/اكتشاف - In-Feed يظهر في البحث والصفحة الرئيسية",
                "reason_ar": "محتوى تعليمي أو اكتشاف - إعلان الخلاصة يظهر في البحث والصفحة الرئيسية",
                "requirements": {
                    "video_duration": "أي مدة",
                    "video_duration_seconds": "any",
                    "cost_model": "CPV",
                    "cost_model_ar": "تكلفة المشاهدة",
                    "estimated_cost_per_view": "$0.01-0.03",
                    "estimated_daily_clicks": int(budget / 0.02),
                    "payment_condition": "تدفع فقط عند النقر على الإعلان"
                },
                "pros": [
                    "يظهر في نتائج البحث على YouTube",
                    "المستخدمون يبحثون عنك - نية عالية",
                    "تدفع فقط عند الاهتمام (النقر)",
                    "مثالي للمحتوى التعليمي والدروس",
                    "يبني جمهور مهتم حقيقي"
                ],
                "cons": [
                    "وصول أقل من الأنواع الأخرى",
                    "يحتاج عنوان جذاب جداً",
                    "يحتاج صورة مصغرة احترافية"
                ],
                "best_for": "الاكتشاف والمحتوى التعليمي",
                "best_for_ar": "الاكتشاف والمحتوى التعليمي",
                "use_cases": [
                    "قناة تعليمية",
                    "شركة تقدم دروس ومحتوى",
                    "محتوى How-To"
                ]
            }
        
        # السيناريو 5: رسالة مهمة غير قابلة للتخطي
        elif goal == "brand_message" and budget >= 70 and (video_duration is None or video_duration <= 20):
            recommendation = {
                "video_ad_type": "VIDEO_NON_SKIPPABLE_IN_STREAM_AD",
                "video_ad_type_ar": "إعلان غير قابل للتخطي",
                "confidence": 90,
                "reason": "رسالة مهمة + ميزانية جيدة - Non-Skippable يضمن المشاهدة الكاملة",
                "reason_ar": "رسالة مهمة مع ميزانية جيدة ($" + str(budget) + ") - إعلان غير قابل للتخطي يضمن المشاهدة 100%",
                "requirements": {
                    "video_duration": "15-20 ثانية",
                    "video_duration_seconds": "15-20",
                    "cost_model": "CPM",
                    "cost_model_ar": "تكلفة الألف ظهور",
                    "estimated_cost_per_1000": "$2-5",
                    "estimated_daily_impressions": int(budget / 0.0035),
                    "estimated_daily_views": int(budget / 0.0035)
                },
                "pros": [
                    "مشاهدة مضمونة 100% - لا يمكن التخطي",
                    "رسالة كاملة - يشاهد كل شيء",
                    "مثالي لإطلاق منتج مهم",
                    "تأثير قوي - رسالة واضحة"
                ],
                "cons": [
                    "قد يكون مزعجاً للمستخدمين",
                    "تكلفة أعلى من الأنواع الأخرى",
                    "يحتاج محتوى قوي جداً - لا مجال للخطأ",
                    "قد يؤثر سلباً على تجربة المستخدم"
                ],
                "best_for": "إطلاق منتج جديد أو رسالة مهمة جداً",
                "best_for_ar": "إطلاق منتج جديد أو رسالة مهمة جداً",
                "use_cases": [
                    "إطلاق منتج ثوري",
                    "إعلان حكومي مهم",
                    "رسالة اجتماعية مهمة"
                ]
            }
        
        # السيناريو 6: التفاعل والمشاركة
        elif goal == "engagement":
            recommendation = {
                "video_ad_type": "VIDEO_RESPONSIVE_AD",
                "video_ad_type_ar": "إعلان فيديو متجاوب",
                "confidence": 87,
                "reason": "هدف تفاعل - Responsive Ad يزيد فرص التفاعل في جميع المواضع",
                "reason_ar": "هدف تفاعل ومشاركة - إعلان متجاوب يزيد فرص التفاعل في جميع المواضع",
                "requirements": {
                    "video_duration": "15-30 ثانية (موصى به)",
                    "video_duration_seconds": "15-30",
                    "cost_model": "CPV أو CPM",
                    "cost_model_ar": "تكلفة المشاهدة أو تكلفة الألف ظهور",
                    "estimated_daily_engagements": int(budget / 0.02 * 0.1)
                },
                "pros": [
                    "مرن - يظهر في أماكن متعددة",
                    "يزيد فرص التفاعل",
                    "Google يحسنه للتفاعل",
                    "يدعم CTAs متعددة"
                ],
                "cons": [
                    "قد يحتاج وقت للتحسين"
                ],
                "best_for": "زيادة التفاعل والمشاركة",
                "best_for_ar": "زيادة التفاعل والمشاركة",
                "use_cases": [
                    "حملة تفاعلية",
                    "مسابقة أو تحدي",
                    "بناء مجتمع"
                ]
            }
        
        # السيناريو 7: الخيار الآمن (Default)
        else:
            recommendation = {
                "video_ad_type": "VIDEO_RESPONSIVE_AD",
                "video_ad_type_ar": "إعلان فيديو متجاوب",
                "confidence": 80,
                "reason": "الخيار الأكثر مرونة وأماناً - يتكيف مع جميع المواضع والأهداف",
                "reason_ar": "الخيار الأكثر مرونة وأماناً - يتكيف مع جميع المواضع والأهداف",
                "requirements": {
                    "video_duration": "أي مدة (موصى به: 15-30 ثانية)",
                    "video_duration_seconds": "15-30",
                    "cost_model": "CPV أو CPM (مرن)",
                    "cost_model_ar": "تكلفة المشاهدة أو تكلفة الألف ظهور (مرن)",
                    "estimated_cost": "مرن - Google يحسن التكلفة تلقائياً"
                },
                "pros": [
                    "الأكثر مرونة - يعمل في كل الحالات",
                    "يعمل في كل المواضع على YouTube",
                    "Google يحسنه تلقائياً بالذكاء الاصطناعي",
                    "أقل مخاطرة - خيار آمن جداً",
                    "يدعم فيديوهات متعددة (1-5 فيديوهات)"
                ],
                "cons": [
                    "قد لا يكون الأفضل لهدف محدد جداً"
                ],
                "best_for": "جميع الأهداف - الخيار الأكثر أماناً",
                "best_for_ar": "جميع الأهداف - الخيار الأكثر أماناً",
                "use_cases": [
                    "عميل غير متأكد من هدفه",
                    "حملة متعددة الأهداف",
                    "اختبار السوق"
                ]
            }
        
        # إضافة البدائل
        alternatives = self._get_video_ad_alternatives(recommendation["video_ad_type"], goal, budget)
        
        # إضافة معلومات إضافية
        recommendation.update({
            "alternatives": alternatives,
            "input_parameters": {
                "goal": goal,
                "budget": budget,
                "video_duration": video_duration,
                "industry": industry,
                "has_product": has_product,
                "target_audience": target_audience
            },
            "next_steps": [
                "1. تأكد من أن لديك فيديو بالمدة المطلوبة",
                "2. قم برفع الفيديو إلى YouTube",
                "3. احصل على Video ID من YouTube",
                "4. استخدم Video ID في إنشاء الحملة"
            ],
            "tips": [
                "💡 أول 5 ثواني هي الأهم - اجذب الانتباه فوراً",
                "💡 أضف ترجمات للفيديو - 85% يشاهدون بدون صوت",
                "💡 استخدم CTA واضح ومباشر",
                "💡 اختبر عدة نسخ من الفيديو"
            ]
        })
        
        logger.info(f"✅ تم اختيار نوع الإعلان: {recommendation['video_ad_type']} (ثقة: {recommendation['confidence']}%)")
        
        return recommendation
    
    def _get_video_ad_alternatives(self, primary_type: str, goal: str, budget: float) -> List[Dict[str, Any]]:
        """الحصول على البدائل المقترحة"""
        alternatives = []
        
        # دائماً اقترح VIDEO_RESPONSIVE_AD كبديل آمن
        if primary_type != "VIDEO_RESPONSIVE_AD":
            alternatives.append({
                "video_ad_type": "VIDEO_RESPONSIVE_AD",
                "video_ad_type_ar": "إعلان فيديو متجاوب",
                "reason": "بديل آمن ومرن - يعمل في كل الحالات",
                "confidence": 75
            })
        
        # اقترح BUMPER إذا كانت الميزانية محدودة
        if budget < 50 and primary_type != "VIDEO_BUMPER_AD":
            alternatives.append({
                "video_ad_type": "VIDEO_BUMPER_AD",
                "video_ad_type_ar": "إعلان Bumper (6 ثواني)",
                "reason": "بديل أرخص للميزانية المحدودة - وصول أوسع",
                "confidence": 70
            })
        
        # اقترح TRUEVIEW إذا كان الهدف تحويلات
        if goal in ["sales", "conversions"] and primary_type != "VIDEO_TRUEVIEW_IN_STREAM_AD" and budget >= 50:
            alternatives.append({
                "video_ad_type": "VIDEO_TRUEVIEW_IN_STREAM_AD",
                "video_ad_type_ar": "إعلان TrueView In-Stream",
                "reason": "بديل أفضل للتحويلات - تدفع فقط للمهتمين",
                "confidence": 80
            })
        
        # اقترح IN_FEED للمحتوى التعليمي
        if goal == "discovery" and primary_type != "IN_FEED_VIDEO_AD":
            alternatives.append({
                "video_ad_type": "IN_FEED_VIDEO_AD",
                "video_ad_type_ar": "إعلان فيديو في الخلاصة",
                "reason": "بديل للاكتشاف - يظهر في البحث",
                "confidence": 75
            })
        
        return alternatives

# مثال على الاستخدام
if __name__ == "__main__":
    # تهيئة الخدمة
    generator = AIContentGenerator()
    
    # توليد المحتوى الكامل
    result = generator.generate_complete_ad_content(
        product_service="خدمات نقل الأثاث في الرياض",
        website_url="https://example.com"
    )
    
    print("نتيجة توليد المحتوى الإعلاني:")
    print(result)
    
    # اختبار نظام اختيار نوع إعلان الفيديو الذكي
    video_recommendation = generator.select_smart_video_ad_type(
        goal="sales",
        budget=100,
        video_duration=30
    )
    print("\nتوصية نوع إعلان الفيديو:")
    print(video_recommendation)

