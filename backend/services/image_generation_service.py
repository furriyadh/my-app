#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
خدمة توليد الصور - ديناميكية 100% تعتمد على الذكاء الاصطناعي فقط
Image Generation Service - 100% AI-Powered Dynamic Image Generation
"""

import os
import requests
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import sys
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.development'))

# إضافة مسار backend للاستيراد
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)

logger = logging.getLogger(__name__)

class ImageGenerationService:
    """خدمة توليد الصور - ديناميكية 100% تعتمد على الذكاء الاصطناعي فقط"""
    
    def __init__(self):
        """تهيئة خدمة توليد الصور الديناميكية"""
        self.api_key = os.getenv("COMETAPI_API_KEY")
        self.base_url = os.getenv("COMETAPI_BASE_URL", "https://api.cometapi.com")
        self.text_model = os.getenv("TEXT_MODEL", "gpt-4o-mini")
        self.image_model = os.getenv("IMAGE_MODEL", "black-forest-labs/flux-1.1-pro")
        
        if not self.api_key:
            raise ValueError("COMETAPI_API_KEY environment variable not set")
        
            print("تم تهيئة خدمة توليد الصور الديناميكية مع TEXT_MODEL={} و IMAGE_MODEL={}".format(self.text_model, self.image_model))
    
    def analyze_website_for_images(self, website_url: str, keywords: List[str]) -> Dict[str, Any]:
        """Analyze website with AI for image generation"""

        try:
            # Get website content
            website_content = self._get_website_content(website_url)

            # Use AI to analyze content
            analysis_prompt = f"""
            Analyze the following website and keywords to extract information needed for creating professional advertising images:

            Website URL: {website_url}
            Keywords: {', '.join(keywords)}
            Website Content: {website_content[:1000]}

            Classify and extract:
            1. Type of service or product
            2. Main visual elements
            3. Appropriate colors
            4. Environment or location
            5. Actions or processes
            6. Important elements for images

            Return result in JSON format containing:
            {{
                "service_type": "service type",
                "visual_elements": ["element1", "element2"],
                "colors": ["color1", "color2"],
                "environment": "environment",
                "actions": ["action1", "action2"],
                "key_objects": ["object1", "object2"]
            }}
            """

            analysis_result = self._call_text_ai(analysis_prompt)

            if analysis_result.get('success'):
                try:
                    content = analysis_result['content']
                    parsed = json.loads(content)
                    return parsed
                except json.JSONDecodeError:
                    return self._parse_ai_response(content)
            else:
                return self._fallback_analysis(keywords)
                
        except Exception as e:
            print(f"خطأ في تحليل الموقع: {e}")
            return self._fallback_analysis(keywords)

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

    def _parse_ai_response(self, content: str) -> Dict[str, Any]:
        """تحليل رد الذكاء الاصطناعي"""
        words = content.lower().split()
        return {
            "service_type": "خدمات عامة",
            "visual_elements": [word for word in words if len(word) > 4][:5],
            "colors": ["أزرق", "أبيض"],
            "environment": "مكان العمل",
            "actions": ["العمل", "الخدمة"],
            "key_objects": [word for word in words if len(word) > 3][:3]
        }

    def _fallback_analysis(self, keywords: List[str]) -> Dict[str, Any]:
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
                return response.text[:2000]
            else:
                return ""
        except:
            return ""

    def generate_campaign_images_ai(self, website_url: str, keywords: List[str], num_images: int = 6) -> List[Dict[str, Any]]:
        """Generate campaign images dynamically with AI"""

        print(f"Starting to create {num_images} dynamic images for website: {website_url}")

        try:
            # Analyze website with AI
            analysis = self.analyze_website_for_images(website_url, keywords)

            print(f"Website analyzed: {str(analysis.get('service_type', 'Not specified'))}")

            # Generate images based on analysis
            generated_images = []

            for i in range(num_images):
                # Create dynamic prompt for each image
                prompt = self._create_dynamic_image_prompt(analysis, keywords, i)

                # Generate image
                image_result = self._generate_single_image_ai(prompt, {"size": "1024x1024"})

                if image_result.get('success'):
                    generated_images.append({
                        'image_url': image_result['image_url'],
                        'prompt': prompt,
                        'analysis': analysis,
                        'index': i + 1
                    })

                    print(f"Image {i + 1} created: {image_result['image_url']}")
                else:
                    print(f"Failed to create image {i + 1}: {image_result.get('error')}")

            print(f"Created {len(generated_images)}/{num_images} dynamic images")
            return generated_images

        except Exception as e:
            print(f"Error creating images: {e}")
            return []

    def _create_dynamic_image_prompt(self, analysis: Dict[str, Any], keywords: List[str], index: int) -> str:
        """Create dynamic image prompt based on AI analysis"""

        # Build dynamic prompt from analysis results
        prompt_parts = ["PHOTOREALISTIC PROFESSIONAL PHOTOGRAPH"]

        # Add service type
        if analysis.get('service_type'):
            prompt_parts.append(f"SERVICE: {analysis['service_type']}")

        # Add visual elements
        if analysis.get('visual_elements'):
            prompt_parts.append(f"VISIBLE: {', '.join(analysis['visual_elements'][:3])}")

        # Add colors
        if analysis.get('colors'):
            prompt_parts.append(f"COLORS: {', '.join(analysis['colors'][:2])}")

        # Add environment
        if analysis.get('environment'):
            prompt_parts.append(f"LOCATION: {analysis['environment']}")

        # Add actions
        if analysis.get('actions'):
            prompt_parts.append(f"ACTION: {', '.join(analysis['actions'][:2])}")

        # Add key objects
        if analysis.get('key_objects'):
            prompt_parts.append(f"OBJECTS: {', '.join(analysis['key_objects'][:2])}")

        # Add keywords
        if keywords:
            prompt_parts.append(f"KEYWORDS: {', '.join(keywords[:3])}")

        # Add quality requirements
        prompt_parts.extend([
            "STYLE: Professional, high quality, commercial",
            "LIGHTING: Natural, well lit",
            "COMPOSITION: Centered, clear focus",
            "QUALITY: Sharp, detailed, realistic"
        ])

        return "\n".join(prompt_parts)

    def _generate_single_image_ai(self, prompt: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate single image with AI"""
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
            
            # Debug: Print request details
            print(f"Request URL: {self.base_url}/v1/images/generations")
            print(f"Request Model: {self.image_model}")
            print(f"Request Data Keys: {list(data.keys())}")
            print(f"Prompt length: {len(prompt)} chars")
            
            response = requests.post(
                f"{self.base_url}/v1/images/generations",
                headers=headers,
                json=data,
                timeout=180
            )
            
            # Debug: Print response details
            print(f"API Response Status: {response.status_code}")
            if response.status_code != 200:
                print(f"API Response Content: {response.text[:500]}")
            
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
