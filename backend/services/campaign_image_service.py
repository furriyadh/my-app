#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
خدمة إضافة الصور للحملات الإعلانية - ديناميكية 100% تعتمد على الذكاء الاصطناعي
Campaign Image Service - 100% AI-Powered Dynamic Image Generation
"""

import os
import logging
import requests
import json
from typing import Dict, List, Any, Optional
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.development'))

from google.ads.googleads.client import GoogleAdsClient


class CampaignImageService:
    """خدمة إضافة الصور للحملات - ديناميكية 100% تعتمد على الذكاء الاصطناعي"""

    def __init__(self, client: GoogleAdsClient, customer_id: str):
        """
        تهيئة خدمة الصور الديناميكية

        Args:
            client: Google Ads API client
            customer_id: معرف العميل
        """
        self.client = client
        self.customer_id = customer_id
        self.logger = logging.getLogger(__name__)

        # إعدادات الذكاء الاصطناعي - ديناميكية 100%
        self.api_key = os.getenv("COMETAPI_API_KEY")
        self.base_url = os.getenv("COMETAPI_BASE_URL", "https://api.cometapi.com")
        self.text_model = os.getenv("TEXT_MODEL", "gpt-4o-mini")
        self.image_model = os.getenv("IMAGE_MODEL", "black-forest-labs/flux-1.1-pro")

        if not self.api_key:
            raise ValueError("COMETAPI_API_KEY environment variable not set")

        self.logger.info(f"تم تهيئة خدمة الصور الديناميكية مع TEXT_MODEL={self.text_model} و IMAGE_MODEL={self.image_model}")

    def analyze_website_with_ai(self, website_url: str, keywords: List[str]) -> Dict[str, Any]:
        """تحليل الموقع بالذكاء الاصطناعي لاستخراج المعلومات اللازمة للصور"""

        try:
            # جلب محتوى الموقع
            website_content = self._get_website_content(website_url)

            # استخدام الذكاء الاصطناعي لتحليل المحتوى
            analysis_prompt = f"""
            قم بتحليل الموقع والكلمات المفتاحية التالية واستخرج المعلومات اللازمة لإنشاء صور إعلانية احترافية:

            رابط الموقع: {website_url}
            الكلمات المفتاحية: {', '.join(keywords)}
            محتوى الموقع: {website_content[:1000]}

            قم بتصنيف واستخراج:
            1. نوع الخدمة أو المنتج
            2. العناصر البصرية الرئيسية
            3. الألوان المناسبة
            4. البيئة أو المكان
            5. الإجراءات أو العمليات
            6. العناصر المهمة للصور

            أعد النتيجة بتنسيق JSON يحتوي على:
            {{
                "service_type": "نوع الخدمة",
                "visual_elements": ["عنصر1", "عنصر2"],
                "colors": ["لون1", "لون2"],
                "environment": "البيئة",
                "actions": ["إجراء1", "إجراء2"],
                "key_objects": ["شيء1", "شيء2"]
            }}
            """

            analysis_result = self._call_text_ai(analysis_prompt)

            if analysis_result.get('success'):
                try:
                    # محاولة تحليل JSON
                    content = analysis_result['content']
                    parsed = json.loads(content)
                    return parsed
                except json.JSONDecodeError:
                    # إذا فشل التحليل، نحاول استخراج المعلومات يدوياً
                    return self._parse_ai_analysis_response(content)
            else:
                # في حالة فشل، نستخدم استخراج بسيط
                return self._fallback_website_analysis(website_content, keywords)

        except Exception as e:
            self.logger.error(f"خطأ في تحليل الموقع: {e}")
            return self._fallback_website_analysis("", keywords)

    def _call_text_ai(self, prompt: str) -> Dict[str, Any]:
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
                        "content": "أنت محلل محتوى ذكي متخصص في استخراج المعلومات من المواقع والكلمات المفتاحية لإنشاء صور إعلانية. أعد النتائج بتنسيق JSON فقط."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 800,
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

    def _parse_ai_analysis_response(self, content: str) -> Dict[str, Any]:
        """تحليل رد الذكاء الاصطناعي إذا لم يكن JSON صالح"""
        # استخراج بسيط من النص
        words = content.lower().split()
        return {
            "service_type": "خدمات عامة",
            "visual_elements": [word for word in words if len(word) > 4][:5],
            "colors": ["أزرق", "أبيض"],
            "environment": "مكان العمل",
            "actions": ["العمل", "الخدمة"],
            "key_objects": [word for word in words if len(word) > 3][:3]
        }

    def _fallback_website_analysis(self, content: str, keywords: List[str]) -> Dict[str, Any]:
        """تحليل احتياطي بسيط"""
        return {
            "service_type": "خدمات",
            "visual_elements": keywords[:3],
            "colors": ["أزرق", "أبيض"],
            "environment": "مكان العمل",
            "actions": ["العمل", "الخدمة"],
            "key_objects": keywords[:2]
        }

    def _get_website_content(self, website_url: str) -> str:
        """جلب محتوى الموقع"""
        try:
            response = requests.get(website_url, timeout=10)
            if response.status_code == 200:
                return response.text[:2000]  # أول 2000 حرف
            else:
                return ""
        except:
            return ""

    def generate_campaign_images_ai(self, website_url: str, keywords: List[str], num_images: int = 6) -> List[Dict[str, Any]]:
        """إنشاء صور الحملة ديناميكياً بالذكاء الاصطناعي"""

        self.logger.info(f"🚀 بدء إنشاء {num_images} صورة ديناميكية للموقع: {website_url}")

        try:
            # تحليل الموقع بالذكاء الاصطناعي
            analysis = self.analyze_website_with_ai(website_url, keywords)

            self.logger.info(f"✅ تم تحليل الموقع: {analysis.get('service_type', 'غير محدد')}")

            # إنشاء الصور بناءً على التحليل
            generated_images = []

            for i in range(num_images):
                # إنشاء برومبت ديناميكي لكل صورة
                prompt = self._create_dynamic_image_prompt(analysis, keywords, i)

                # إنشاء الصورة
                image_result = self._generate_single_image_ai(prompt, {"size": "1024x1024"})

                if image_result.get('success'):
                    generated_images.append({
                        'image_url': image_result['image_url'],
                        'prompt': prompt,
                        'analysis': analysis,
                        'index': i + 1
                    })

                    self.logger.info(f"✅ تم إنشاء الصورة {i + 1}: {image_result['image_url']}")
                else:
                    self.logger.error(f"❌ فشل في إنشاء الصورة {i + 1}: {image_result.get('error')}")

            self.logger.info(f"✅ تم إنشاء {len(generated_images)}/{num_images} صورة ديناميكية")
            return generated_images

        except Exception as e:
            self.logger.error(f"❌ خطأ في إنشاء الصور: {e}")
            return []

    def _create_dynamic_image_prompt(self, analysis: Dict[str, Any], keywords: List[str], index: int) -> str:
        """إنشاء برومبت ديناميكي للصورة بناءً على تحليل الذكاء الاصطناعي"""

        # بناء البرومبت ديناميكياً من نتائج التحليل
        prompt_parts = ["PHOTOREALISTIC PROFESSIONAL PHOTOGRAPH"]

        # إضافة نوع الخدمة
        if analysis.get('service_type'):
            prompt_parts.append(f"SERVICE: {analysis['service_type']}")

        # إضافة العناصر البصرية
        if analysis.get('visual_elements'):
            prompt_parts.append(f"VISIBLE: {', '.join(analysis['visual_elements'][:3])}")

        # إضافة الألوان
        if analysis.get('colors'):
            prompt_parts.append(f"COLORS: {', '.join(analysis['colors'][:2])}")

        # إضافة البيئة
        if analysis.get('environment'):
            prompt_parts.append(f"LOCATION: {analysis['environment']}")

        # إضافة الإجراءات
        if analysis.get('actions'):
            prompt_parts.append(f"ACTION: {', '.join(analysis['actions'][:2])}")

        # إضافة العناصر الرئيسية
        if analysis.get('key_objects'):
            prompt_parts.append(f"OBJECTS: {', '.join(analysis['key_objects'][:2])}")

        # إضافة الكلمات المفتاحية
        if keywords:
            prompt_parts.append(f"KEYWORDS: {', '.join(keywords[:3])}")

        # إضافة متطلبات الجودة
        prompt_parts.extend([
            "STYLE: Professional, high quality, commercial",
            "LIGHTING: Natural, well lit",
            "COMPOSITION: Centered, clear focus",
            "QUALITY: Sharp, detailed, realistic"
        ])

        return "\n".join(prompt_parts)

    def _generate_single_image_ai(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """إنشاء صورة واحدة بالذكاء الاصطناعي"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # تحديد أبعاد الصورة
            width = 1024
            height = 1024

            size = config.get("size", "1024x1024")
            if "x" in size or "×" in size:
                try:
                    dims = size.replace("×", "x").split("x")
                    width = int(dims[0])
                    height = int(dims[1])
                except:
                    width, height = 1024, 1024

            data = {
                "model": self.image_model,
                "prompt": prompt,
                "width": width,
                "height": height,
                "num_inference_steps": 50,
                "guidance_scale": 7.5,
                "output_format": "png"
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

    def upload_image_asset(self, image_url: str, asset_name: str,
                          required_width: int = None, required_height: int = None) -> str:
        """
        رفع صورة كـ Asset (طبقاً للمثال الرسمي)
        
        Args:
            image_url: رابط الصورة
            asset_name: اسم الأصل
            required_width: العرض المطلوب (اختياري)
            required_height: الارتفاع المطلوب (اختياري)
            
        Returns:
            resource_name للصورة المرفوعة
        """
        try:
            # تحميل الصورة من URL أو من ملف محلي
            if image_url.startswith('http'):
                image_bytes = self._get_image_bytes_from_url(image_url)
            else:
                with open(image_url, 'rb') as f:
                    image_bytes = f.read()
            
            # معالجة الصورة: إزالة أي نصوص وتغيير الحجم إذا لزم
            processed_image_bytes = self._process_image(
                image_bytes, 
                required_width, 
                required_height
            )
            
            # الحصول على أبعاد الصورة
            width, height = self._get_image_dimensions(processed_image_bytes)
            
            # إنشاء Asset حسب المثال الرسمي
            asset_service = self.client.get_service("AssetService")
            asset_operation = self.client.get_type("AssetOperation")
            asset = asset_operation.create
            
            asset.type_ = self.client.enums.AssetTypeEnum.IMAGE
            asset.image_asset.data = processed_image_bytes
            asset.image_asset.file_size = len(processed_image_bytes)
            asset.image_asset.mime_type = self.client.enums.MimeTypeEnum.IMAGE_JPEG
            asset.image_asset.full_size.height_pixels = height
            asset.image_asset.full_size.width_pixels = width
            asset.name = asset_name
            
            # رفع الصورة
            response = asset_service.mutate_assets(
                customer_id=self.customer_id,
                operations=[asset_operation]
            )
            
            resource_name = response.results[0].resource_name
            self.logger.info(f"✅ تم رفع الصورة: {resource_name}")
            return resource_name
            
        except Exception as e:
            self.logger.error(f"❌ خطأ في رفع الصورة: {e}")
            raise
    
    def add_image_to_ad_group(self, ad_group_resource_name: str, image_asset_resource_name: str):
        """
        إضافة صورة لمجموعة إعلانية (طبقاً للمثال الرسمي)
        
        Args:
            ad_group_resource_name: resource name للمجموعة الإعلانية
            image_asset_resource_name: resource name للصورة
        """
        try:
            ad_group_asset_service = self.client.get_service("AdGroupAssetService")
            ad_group_asset_operation = self.client.get_type("AdGroupAssetOperation")
            ad_group_asset = ad_group_asset_operation.create
            
            ad_group_asset.asset = image_asset_resource_name
            ad_group_asset.field_type = self.client.enums.AssetFieldTypeEnum.AD_IMAGE
            ad_group_asset.ad_group = ad_group_resource_name
            
            response = ad_group_asset_service.mutate_ad_group_assets(
                customer_id=self.customer_id,
                operations=[ad_group_asset_operation]
            )
            
            for result in response.results:
                self.logger.info(f"✅ تم إضافة صورة للمجموعة الإعلانية: {result.resource_name}")
                
        except Exception as e:
            self.logger.error(f"❌ خطأ في إضافة الصورة للمجموعة: {e}")
            raise
    
    def _get_image_bytes_from_url(self, url: str) -> bytes:
        """تحميل الصورة من URL"""
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content
    
    def _process_image(self, image_bytes: bytes, width: int = None, height: int = None) -> bytes:
        """
        معالجة الصورة: إزالة أي نصوص + تغيير الحجم
        
        Args:
            image_bytes: بيانات الصورة الأصلية
            width: العرض المطلوب
            height: الارتفاع المطلوب
            
        Returns:
            بيانات الصورة المعالجة
        """
        try:
            # فتح الصورة
            image = Image.open(BytesIO(image_bytes))
            
            # تحويل إلى RGB إذا لزم
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # تغيير الحجم إذا تم تحديد أبعاد
            if width and height:
                image = image.resize((width, height), Image.Resampling.LANCZOS)
            elif width or height:
                # الحفاظ على نسبة العرض للارتفاع
                original_width, original_height = image.size
                if width:
                    height = int(original_height * (width / original_width))
                else:
                    width = int(original_width * (height / original_height))
                image = image.resize((width, height), Image.Resampling.LANCZOS)
            
            # حفظ الصورة المعالجة
            output = BytesIO()
            image.save(output, format='JPEG', quality=95, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            self.logger.warning(f"⚠️ خطأ في معالجة الصورة: {e}. استخدام الصورة الأصلية.")
            return image_bytes
    
    def _get_image_dimensions(self, image_bytes: bytes) -> tuple:
        """الحصول على أبعاد الصورة"""
        image = Image.open(BytesIO(image_bytes))
        return image.size
    
    def generate_and_upload_images_for_campaign(self, campaign_type: str, 
                                               business_name: str,
                                               keywords: List[str]) -> Dict[str, List[str]]:
        """
        توليد ورفع الصور لحملة (بدون نصوص!)
        
        Args:
            campaign_type: نوع الحملة
            business_name: اسم العمل
            keywords: الكلمات المفتاحية
            
        Returns:
            Dict مع resource names للصور المرفوعة
        """
        from services.image_generation_service import ImageGenerationService
        
        image_generator = ImageGenerationService()
        uploaded_images = {
            'square': [],      # 1:1 - 1200x1200
            'landscape': [],   # 1.91:1 - 1200x628
            'portrait': [],    # 4:5 - 960x1200
            'logo': []         # مربع - 1200x1200
        }
        
        # توليد البرومبتات (بدون نصوص!)
        base_prompt = self._create_image_prompt(business_name, keywords)
        
        # توليد الصور المطلوبة
        try:
            # 1. Square images (1:1)
            print("\n🖼️ توليد صور مربعة (1200x1200)...")
            square_image = image_generator.generate_image(
                prompt=f"{base_prompt}. IMPORTANT: NO TEXT, NO WORDS on image!",
                size="1024x1024",  # سيتم تكبيرها
                quality="hd"
            )
            if square_image and 'url' in square_image:
                resource_name = self.upload_image_asset(
                    square_image['url'],
                    f"Square Image - {business_name}",
                    1200, 1200
                )
                uploaded_images['square'].append(resource_name)
            
            # 2. Landscape images (1.91:1)
            print("🖼️ توليد صور أفقية (1200x628)...")
            landscape_image = image_generator.generate_image(
                prompt=f"{base_prompt}, wide angle shot. IMPORTANT: NO TEXT, NO WORDS!",
                size="1792x1024",  # أقرب نسبة
                quality="hd"
            )
            if landscape_image and 'url' in landscape_image:
                resource_name = self.upload_image_asset(
                    landscape_image['url'],
                    f"Landscape Image - {business_name}",
                    1200, 628
                )
                uploaded_images['landscape'].append(resource_name)
            
            # 3. Portrait images (4:5)
            print("🖼️ توليد صور عمودية (960x1200)...")
            portrait_image = image_generator.generate_image(
                prompt=f"{base_prompt}, vertical composition. IMPORTANT: NO TEXT, NO WORDS!",
                size="1024x1024",  # سيتم تعديلها
                quality="hd"
            )
            if portrait_image and 'url' in portrait_image:
                resource_name = self.upload_image_asset(
                    portrait_image['url'],
                    f"Portrait Image - {business_name}",
                    960, 1200
                )
                uploaded_images['portrait'].append(resource_name)
            
            # 4. Logo (مربع بسيط)
            print("🖼️ توليد شعار (1200x1200)...")
            logo_image = image_generator.generate_image(
                prompt=f"Simple, clean logo for {business_name}. Minimalist design. NO TEXT!",
                size="1024x1024",
                quality="hd"
            )
            if logo_image and 'url' in logo_image:
                resource_name = self.upload_image_asset(
                    logo_image['url'],
                    f"Logo - {business_name}",
                    1200, 1200
                )
                uploaded_images['logo'].append(resource_name)
            
            print(f"\n✅ تم توليد ورفع الصور:")
            print(f"   - مربعة: {len(uploaded_images['square'])}")
            print(f"   - أفقية: {len(uploaded_images['landscape'])}")
            print(f"   - عمودية: {len(uploaded_images['portrait'])}")
            print(f"   - شعار: {len(uploaded_images['logo'])}")
            
            return uploaded_images
            
        except Exception as e:
            self.logger.error(f"❌ خطأ في توليد الصور: {e}")
            return uploaded_images
    
    def _create_image_prompt(self, business_name: str, keywords: List[str]) -> str:
        """إنشاء برومبت للصورة بدون نصوص"""
        # أخذ أول 3 كلمات مفتاحية
        top_keywords = keywords[:3] if keywords else []
        keywords_text = ", ".join(top_keywords)
        
        prompt = f"""Professional, high-quality image for {business_name}.
Related to: {keywords_text}.
Modern, clean, business-appropriate.
NO TEXT, NO WORDS, NO LETTERS on the image.
Pure visual content only."""
        
        return prompt


# مساعد لتحميل الصور من URL (مثل المكتبة الرسمية)
def get_image_bytes_from_url(url: str) -> bytes:
    """تحميل الصورة من URL (مثل المثال الرسمي)"""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content

