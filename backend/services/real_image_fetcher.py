#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
خدمة جلب الصور الحقيقية من Unsplash و Pexels
Real Image Fetching Service
"""

import os
import requests
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.development'))

logger = logging.getLogger(__name__)

class RealImageFetcher:
    """خدمة جلب الصور الحقيقية"""
    
    def __init__(self):
        """تهيئة الخدمة"""
        # Unsplash API (مجاني)
        self.unsplash_access_key = os.getenv("UNSPLASH_ACCESS_KEY", "")
        
        # Pexels API (مجاني)
        self.pexels_api_key = os.getenv("PEXELS_API_KEY", "")
        
        self.logger = logging.getLogger(__name__)
    
    def search_real_images(self, keywords: List[str], num_images: int = 6, orientation: str = "landscape") -> List[Dict[str, Any]]:
        """
        البحث عن صور حقيقية
        
        Args:
            keywords: الكلمات المفتاحية للبحث
            num_images: عدد الصور المطلوبة
            orientation: اتجاه الصورة (landscape, portrait, square)
        
        Returns:
            قائمة بمعلومات الصور
        """
        images = []
        
        # محاولة Unsplash أولاً
        if self.unsplash_access_key:
            try:
                unsplash_images = self._search_unsplash(keywords, num_images, orientation)
                images.extend(unsplash_images)
            except Exception as e:
                self.logger.warning(f"فشل البحث في Unsplash: {e}")
        
        # إذا لم نحصل على عدد كافٍ، نجرب Pexels
        if len(images) < num_images and self.pexels_api_key:
            try:
                remaining = num_images - len(images)
                pexels_images = self._search_pexels(keywords, remaining, orientation)
                images.extend(pexels_images)
            except Exception as e:
                self.logger.warning(f"فشل البحث في Pexels: {e}")
        
        return images[:num_images]
    
    def _search_unsplash(self, keywords: List[str], num_images: int, orientation: str) -> List[Dict[str, Any]]:
        """البحث في Unsplash"""
        query = " ".join(keywords)
        
        # ترجمة الكلمات العربية للإنجليزية للبحث
        query_en = self._translate_to_english(query)
        
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": query_en,
            "per_page": num_images,
            "orientation": orientation,
            "client_id": self.unsplash_access_key
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        images = []
        
        for result in data.get("results", []):
            images.append({
                "url": result["urls"]["regular"],
                "download_url": result["urls"]["full"],
                "width": result["width"],
                "height": result["height"],
                "photographer": result["user"]["name"],
                "source": "unsplash"
            })
        
        return images
    
    def _search_pexels(self, keywords: List[str], num_images: int, orientation: str) -> List[Dict[str, Any]]:
        """البحث في Pexels"""
        query = " ".join(keywords)
        
        # ترجمة الكلمات العربية للإنجليزية
        query_en = self._translate_to_english(query)
        
        url = "https://api.pexels.com/v1/search"
        headers = {
            "Authorization": self.pexels_api_key
        }
        params = {
            "query": query_en,
            "per_page": num_images,
            "orientation": orientation
        }
        
        response = requests.get(url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        images = []
        
        for photo in data.get("photos", []):
            images.append({
                "url": photo["src"]["large"],
                "download_url": photo["src"]["original"],
                "width": photo["width"],
                "height": photo["height"],
                "photographer": photo["photographer"],
                "source": "pexels"
            })
        
        return images
    
    def _translate_to_english(self, arabic_text: str) -> str:
        """ترجمة بسيطة للكلمات الشائعة"""
        translations = {
            "عزل": "waterproofing insulation",
            "أسطح": "roofing roof",
            "سطح": "roof",
            "اسطح": "roofs",
            "مائي": "water waterproofing",
            "حراري": "thermal insulation",
            "فوم": "foam",
            "شركة": "company",
            "دبي": "dubai uae",
            "خزان": "tank water",
            "خزانات": "tanks water",
            "تنظيف": "cleaning",
            "نظافة": "clean",
            "عامل": "worker",
            "عمال": "workers"
        }
        
        # استبدال الكلمات العربية بالإنجليزية
        result = arabic_text
        for ar, en in translations.items():
            result = result.replace(ar, en)
        
        # إضافة كلمات مساعدة للدقة
        result += " construction professional work dubai uae"
        
        return result

