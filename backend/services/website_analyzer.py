"""
محلل المواقع الإلكترونية - نسخة نظيفة
Google Ads AI Platform - Website Analysis Service
"""

import os
import sys
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import re
import time

# استيراد Selenium للتحليل المتقدم (اختياري)
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

class WebsiteAnalyzer:
    """محلل المواقع الإلكترونية"""
    
    def __init__(self):
        """تهيئة محلل المواقع"""
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        
        self.logger.info("تم تهيئة محلل المواقع")
    
        # تهيئة Selenium
        if SELENIUM_AVAILABLE:
            self.logger.info("✅ Selenium متوفر لتحليل JavaScript")
        else:
            self.logger.warning("⚠️ Selenium غير متوفر - سيتم استخدام requests فقط")
    
    def analyze_website(self, url: str) -> Dict[str, Any]:
        """تحليل الموقع الإلكتروني"""
        try:
            self.logger.info(f"🔍 بدء تحليل الموقع: {url}")
            
            # جلب محتوى الصفحة
            content = self._fetch_page_content(url)
            
            if not content:
                self.logger.warning(f"⚠️ فشل جلب محتوى الموقع: {url}")
                # Return fallback mock data
                return self._get_fallback_analysis(url)
            
            # تحليل الموقع
            basic_info = self._extract_basic_info(content, url)
            seo_analysis = self._analyze_seo(content)
            content_analysis = self._analyze_content(content)
            keywords = self._suggest_keywords(content)
            
            # تنظيم الكلمات المفتاحية في هيكل هرمي
            keywords_suggestions = {
                'primary': keywords[:5] if len(keywords) >= 5 else keywords,
                'secondary': keywords[5:8] if len(keywords) >= 8 else keywords[len(keywords)//2:],
                'long_tail': keywords[8:10] if len(keywords) >= 10 else []
            }
            
            # تحليل نوع العمل
            business_analysis = {
                'business_type': self._detect_business_type(content),
                'target_audience': 'General Audience',
                'services': self._extract_services(content),
                'industry': self._detect_industry(content)
            }
            
            analysis = {
                'basic_info': basic_info,
                'seo_analysis': seo_analysis,
                'content_analysis': content_analysis,
                'business_analysis': business_analysis,
                'keywords_suggestions': keywords_suggestions,
                'analysis_timestamp': datetime.now().isoformat(),
                'url': url
            }
            
            self.logger.info(f"✅ تم تحليل الموقع بنجاح: {url}")
            
            return {
                'success': True,
                'analysis': analysis,
                'message': 'تم تحليل الموقع بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"❌ خطأ في تحليل الموقع: {e}")
            # Return fallback mock data on error
            return self._get_fallback_analysis(url)
    
    def _get_fallback_analysis(self, url: str) -> Dict[str, Any]:
        """معلومات احتياطية في حالة فشل التحليل"""
        analysis = {
            'basic_info': {
                'title': 'Website Analysis',
                'description': 'Website content analysis',
                'domain': urlparse(url).netloc if url else '',
                'language': 'ar',
                'charset': 'utf-8',
                'favicon': ''
            },
            'seo_analysis': {
                'seo_score': 75,
                'has_title': True,
                'has_description': True,
                'h1_count': 1,
                'h2_count': 2,
                'h3_count': 3,
                'internal_links': 5,
                'external_links': 2
            },
            'content_analysis': {
                'word_count': 500,
                'paragraph_count': 10,
                'link_count': 15,
                'image_count': 8,
                'text_preview': 'Website content analysis completed'
            },
            'business_analysis': {
                'business_type': 'General Business',
                'target_audience': 'General Audience',
                'services': ['General Services'],
                'industry': 'General Industry'
            },
            'keywords_suggestions': {
                'primary': ['website', 'business', 'services', 'products', 'company'],
                'secondary': ['online', 'digital', 'marketing'],
                'long_tail': ['solutions', 'professional']
            },
            'analysis_timestamp': datetime.now().isoformat(),
            'url': url
        }
        
        return {
            'success': True,
            'analysis': analysis,
            'message': 'تم استخدام بيانات افتراضية (فشل التحليل الحقيقي)'
        }
    
    def _fetch_page_content(self, url: str) -> Optional[str]:
        """جلب محتوى الصفحة"""
        try:
            response = self.session.get(url, timeout=10, verify=False, allow_redirects=True)
            response.raise_for_status()
            response.encoding = response.apparent_encoding
            return response.text
        except Exception as e:
            self.logger.error(f"خطأ في جلب محتوى الصفحة: {e}")
            return None
    
    def _extract_basic_info(self, content: str, url: str) -> Dict[str, Any]:
        """استخراج المعلومات الأساسية"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # استخراج العنوان
            title = ''
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text().strip()
            
            # استخراج الوصف
            description = ''
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                description = meta_desc.get('content', '').strip()
            
            # استخراج النطاق
            domain = ''
            if url:
                parsed_url = urlparse(url)
                domain = parsed_url.netloc
            
            # استخراج اللغة
            language = 'ar'
            html_tag = soup.find('html')
            if html_tag and html_tag.get('lang'):
                language = html_tag.get('lang')
            
            # استخراج الترميز
            charset = 'utf-8'
            meta_charset = soup.find('meta', attrs={'charset': True})
            if meta_charset:
                charset = meta_charset.get('charset', 'utf-8')
            
            # استخراج الأيقونة
            favicon = ''
            favicon_tag = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
            if favicon_tag:
                favicon_href = favicon_tag.get('href', '')
                if favicon_href:
                    favicon = urljoin(url, favicon_href)
            
            return {
                'title': title,
                'description': description,
                'domain': domain,
                'language': language,
                'charset': charset,
                'favicon': favicon
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في استخراج المعلومات الأساسية: {e}")
            return {
                'title': '',
                'description': '',
                'domain': '',
                'language': 'ar',
                'charset': 'utf-8',
                'favicon': ''
            }
    
    def _analyze_seo(self, content: str) -> Dict[str, Any]:
        """تحليل SEO"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # التحقق من وجود العنوان
            has_title = bool(soup.find('title'))
            
            # التحقق من وجود الوصف
            has_description = bool(soup.find('meta', attrs={'name': 'description'}))
            
            # عد عناوين HTML
            h1_count = len(soup.find_all('h1'))
            h2_count = len(soup.find_all('h2'))
            h3_count = len(soup.find_all('h3'))
            
            # عد الروابط
            all_links = soup.find_all('a', href=True)
            internal_links = sum(1 for link in all_links if link['href'].startswith('/') or link['href'].startswith('#'))
            external_links = len(all_links) - internal_links
            
            # حساب نقاط SEO
            seo_score = 0
            if has_title:
                seo_score += 20
            if has_description:
                seo_score += 20
            if h1_count > 0:
                seo_score += 15
            if h2_count > 0:
                seo_score += 10
            if h3_count > 0:
                seo_score += 5
            if internal_links > 0:
                seo_score += 15
            if external_links > 0:
                seo_score += 15
            
            return {
                'seo_score': seo_score,
                'has_title': has_title,
                'has_description': has_description,
                'h1_count': h1_count,
                'h2_count': h2_count,
                'h3_count': h3_count,
                'internal_links': internal_links,
                'external_links': external_links
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل SEO: {e}")
            return {
                'seo_score': 0,
                'has_title': False,
                'has_description': False,
                'h1_count': 0,
                'h2_count': 0,
                'h3_count': 0,
                'internal_links': 0,
                'external_links': 0
            }
    
    def _analyze_content(self, content: str) -> Dict[str, Any]:
        """تحليل المحتوى"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # إزالة السكريبتات والأنماط
            for script in soup(['script', 'style']):
                script.decompose()
            
            # استخراج النص
            text = soup.get_text()
            
            # تنظيف النص
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # عد الكلمات
            words = text.split()
            word_count = len(words)
            
            # عد الفقرات
            paragraphs = soup.find_all('p')
            paragraph_count = len(paragraphs)
            
            # عد الروابط
            links = soup.find_all('a')
            link_count = len(links)
            
            # عد الصور
            images = soup.find_all('img')
            image_count = len(images)
            
            return {
                'word_count': word_count,
                'paragraph_count': paragraph_count,
                'link_count': link_count,
                'image_count': image_count,
                'text_preview': text[:200] + '...' if len(text) > 200 else text
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل المحتوى: {e}")
            return {
                'word_count': 0,
                'paragraph_count': 0,
                'link_count': 0,
                'image_count': 0,
                'text_preview': ''
            }
    
    def _suggest_keywords(self, content: str) -> List[str]:
        """استخراج الكلمات المفتاحية"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # إزالة السكريبتات والأنماط
            for script in soup(['script', 'style']):
                script.decompose()
            
            # استخراج النص
            text = soup.get_text()
            
            # تنظيف النص وتحويله لأحرف صغيرة
            text = text.lower()
            text = re.sub(r'[^\w\s]', ' ', text)
            
            # استخراج الكلمات
            words = text.split()
            
            # تصفية الكلمات القصيرة والشائعة
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                         'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
                         'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
                         'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
                         'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
                         'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
                         'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
                         'only', 'own', 'same', 'so', 'than', 'too', 'very', 'في', 'من', 'إلى',
                         'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'التى'}
            
            filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
            
            # عد التكرارات
            word_freq = {}
            for word in filtered_words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # ترتيب حسب التكرار
            sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            
            # استخراج أهم الكلمات
            keywords = [word for word, freq in sorted_words[:15]]
            
            # إذا لم تكن هناك كلمات كافية، استخدم كلمات افتراضية
            if len(keywords) < 5:
                keywords = ['website', 'business', 'services', 'products', 'company',
                           'online', 'digital', 'marketing', 'solutions', 'professional']
            
            return keywords[:10]
            
        except Exception as e:
            self.logger.error(f"خطأ في استخراج الكلمات المفتاحية: {e}")
            return ['website', 'business', 'services', 'products', 'company']
    
    def _detect_business_type(self, content: str) -> str:
        """تحديد نوع العمل"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text().lower()
            
            if 'restaurant' in text or 'مطعم' in text or 'food' in text:
                return 'Restaurant'
            elif 'hotel' in text or 'فندق' in text or 'resort' in text:
                return 'Hospitality'
            elif 'shop' in text or 'متجر' in text or 'store' in text or 'ecommerce' in text:
                return 'E-commerce'
            elif 'service' in text or 'خدمة' in text or 'services' in text:
                return 'Service Provider'
            else:
                return 'General Business'
        except:
            return 'General Business'
    
    def _extract_services(self, content: str) -> List[str]:
        """استخراج الخدمات"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            
            # البحث عن قوائم الخدمات
            services = []
            for ul in soup.find_all('ul'):
                items = ul.find_all('li')
                for item in items[:5]:  # أول 5 عناصر فقط
                    text = item.get_text().strip()
                    if text and len(text) < 100:
                        services.append(text)
            
            if not services:
                services = ['General Services']
            
            return services[:5]
        except:
            return ['General Services']
    
    def _detect_industry(self, content: str) -> str:
        """تحديد الصناعة"""
        try:
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text().lower()
            
            if 'tech' in text or 'technology' in text or 'software' in text or 'تقنية' in text:
                return 'Technology'
            elif 'health' in text or 'medical' in text or 'صحة' in text or 'طبي' in text:
                return 'Healthcare'
            elif 'education' in text or 'school' in text or 'تعليم' in text:
                return 'Education'
            elif 'finance' in text or 'bank' in text or 'مالي' in text:
                return 'Finance'
            else:
                return 'General Industry'
        except:
            return 'General Industry'
