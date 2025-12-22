#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
خدمة تغيير حجم الصور لتناسب متطلبات Google Ads
Image Resizing Service for Google Ads Requirements
"""

import os
import requests
import tempfile
import logging
from typing import Dict, Tuple, Optional
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)

class ImageResizerService:
    """خدمة تغيير حجم الصور لتناسب Google Ads"""
    
    # أحجام الصور المطلوبة لـ Google Ads
    GOOGLE_ADS_SIZES = {
        "marketing_image": (1200, 628),      # نسبة 1.91:1
        "square_marketing_image": (1200, 1200),  # نسبة 1:1
        "logo": (1200, 1200),                # نسبة 1:1
        "landscape_logo": (1200, 300),       # نسبة 4:1
    }
    
    # تحويلات DALL-E إلى Google Ads
    DALLE_TO_GOOGLE_MAPPING = {
        "1792x1024": "marketing_image",      # DALL-E landscape → Marketing Image
        "1024x1024": "square_marketing_image"  # DALL-E square → Square Marketing
    }
    
    def __init__(self):
        """تهيئة خدمة تغيير الحجم"""
        self.logger = logging.getLogger(__name__)
    
    def download_and_resize_image(
        self, 
        image_url: str, 
        target_type: str,
        quality: int = 95
    ) -> Optional[str]:
        """
        تحميل صورة من URL وتغيير حجمها
        
        Args:
            image_url: رابط الصورة
            target_type: نوع الصورة المطلوب (marketing_image, square_marketing_image, etc.)
            quality: جودة الصورة (1-100)
        
        Returns:
            مسار الملف المؤقت للصورة المعدلة
        """
        try:
            # التحقق من نوع الصورة
            if target_type not in self.GOOGLE_ADS_SIZES:
                logger.error(f"❌ نوع صورة غير معروف: {target_type}")
                return None
            
            target_size = self.GOOGLE_ADS_SIZES[target_type]
            
            # تحميل الصورة
            logger.info(f"📥 تحميل الصورة من: {image_url[:80]}...")
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # فتح الصورة باستخدام PIL
            img = Image.open(BytesIO(response.content))
            original_size = img.size
            logger.info(f"📐 الحجم الأصلي: {original_size[0]}×{original_size[1]}")
            
            # تحويل إلى RGB إذا لزم الأمر (لإزالة الشفافية)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # تغيير الحجم مع الحفاظ على الجودة
            logger.info(f"🔄 تغيير الحجم إلى: {target_size[0]}×{target_size[1]}")
            img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # حفظ في ملف مؤقت
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg', mode='wb') as tmp_file:
                img_resized.save(tmp_file, format='JPEG', quality=quality, optimize=True)
                tmp_path = tmp_file.name
            
            logger.info(f"✅ تم حفظ الصورة المعدلة: {tmp_path}")
            return tmp_path
            
        except requests.RequestException as e:
            logger.error(f"❌ فشل تحميل الصورة: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ خطأ في معالجة الصورة: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def resize_local_image(
        self, 
        image_path: str, 
        target_type: str,
        quality: int = 95
    ) -> Optional[str]:
        """
        تغيير حجم صورة محلية
        
        Args:
            image_path: مسار الصورة المحلية
            target_type: نوع الصورة المطلوب
            quality: جودة الصورة
        
        Returns:
            مسار الملف المؤقت للصورة المعدلة
        """
        try:
            if not os.path.exists(image_path):
                logger.error(f"❌ الملف غير موجود: {image_path}")
                return None
            
            if target_type not in self.GOOGLE_ADS_SIZES:
                logger.error(f"❌ نوع صورة غير معروف: {target_type}")
                return None
            
            target_size = self.GOOGLE_ADS_SIZES[target_type]
            
            # فتح الصورة
            img = Image.open(image_path)
            original_size = img.size
            logger.info(f"📐 الحجم الأصلي: {original_size[0]}×{original_size[1]}")
            
            # تحويل إلى RGB
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # تغيير الحجم
            logger.info(f"🔄 تغيير الحجم إلى: {target_size[0]}×{target_size[1]}")
            img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
            
            # حفظ في ملف مؤقت
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg', mode='wb') as tmp_file:
                img_resized.save(tmp_file, format='JPEG', quality=quality, optimize=True)
                tmp_path = tmp_file.name
            
            logger.info(f"✅ تم حفظ الصورة المعدلة: {tmp_path}")
            return tmp_path
            
        except Exception as e:
            logger.error(f"❌ خطأ في معالجة الصورة: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def get_target_type_from_dalle_size(self, dalle_size: str) -> Optional[str]:
        """
        تحديد نوع الصورة المطلوب بناءً على حجم DALL-E
        
        Args:
            dalle_size: حجم صورة DALL-E (مثل "1792x1024")
        
        Returns:
            نوع الصورة المطلوب (marketing_image أو square_marketing_image)
        """
        return self.DALLE_TO_GOOGLE_MAPPING.get(dalle_size)
    
    def cleanup_temp_file(self, file_path: str):
        """حذف ملف مؤقت"""
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"🗑️ تم حذف الملف المؤقت: {file_path}")
        except Exception as e:
            logger.warning(f"⚠️ فشل حذف الملف المؤقت: {e}")


# مثال على الاستخدام
if __name__ == "__main__":
    # إعداد التسجيل
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    resizer = ImageResizerService()
    
    # مثال: تحميل صورة من URL وتغيير حجمها
    test_url = "https://example.com/image.jpg"
    resized_path = resizer.download_and_resize_image(
        test_url, 
        "marketing_image"
    )
    
    if resized_path:
        print(f"✅ تم تغيير حجم الصورة: {resized_path}")
        # استخدم الصورة هنا...
        # ثم احذفها
        resizer.cleanup_temp_file(resized_path)

