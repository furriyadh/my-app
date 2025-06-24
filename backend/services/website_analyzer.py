"""
محلل المواقع - Website Analyzer
Google Ads AI Platform - Website Analysis Service
"""

import os
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Any, Optional
import re
import json
from datetime import datetime
import time

class WebsiteAnalyzer:
    """محلل المواقع الإلكترونية"""
    
    def __init__(self):
        """تهيئة محلل المواقع"""
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        self.logger.info("تم تهيئة محلل المواقع")
    
    # ===========================================
    # تحليل الموقع الأساسي
    # ===========================================
    
    def analyze_website(self, url: str) -> Dict[str, Any]:
        """تحليل شامل للموقع"""
        try:
            # تنظيف الرابط
            clean_url = self._clean_url(url)
            
            # الحصول على محتوى الصفحة
            page_content = self._fetch_page_content(clean_url)
            if not page_content:
                return {
                    'success': False,
                    'error': 'فشل في الوصول للموقع',
                    'url': clean_url
                }
            
            # تحليل المحتوى
            analysis = {
                'url': clean_url,
                'basic_info': self._extract_basic_info(page_content, clean_url),
                'seo_analysis': self._analyze_seo(page_content),
                'content_analysis': self._analyze_content(page_content),
                'technical_analysis': self._analyze_technical(page_content, clean_url),
                'business_analysis': self._analyze_business_info(page_content),
                'keywords_suggestions': self._suggest_keywords(page_content),
                'ad_opportunities': self._identify_ad_opportunities(page_content),
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'analysis': analysis,
                'message': 'تم تحليل الموقع بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل الموقع: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'url': url
            }
    
    def analyze_landing_page(self, url: str) -> Dict[str, Any]:
        """تحليل صفحة الهبوط"""
        try:
            page_content = self._fetch_page_content(url)
            if not page_content:
                return {'success': False, 'error': 'فشل في الوصول للصفحة'}
            
            analysis = {
                'conversion_elements': self._analyze_conversion_elements(page_content),
                'user_experience': self._analyze_user_experience(page_content),
                'loading_speed': self._analyze_loading_speed(url),
                'mobile_friendliness': self._analyze_mobile_friendliness(page_content),
                'trust_signals': self._analyze_trust_signals(page_content),
                'call_to_action': self._analyze_cta(page_content),
                'recommendations': self._generate_landing_page_recommendations(page_content)
            }
            
            return {
                'success': True,
                'analysis': analysis,
                'message': 'تم تحليل صفحة الهبوط بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل صفحة الهبوط: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # ===========================================
    # تحليل المحتوى والكلمات المفتاحية
    # ===========================================
    
    def extract_keywords_from_website(self, url: str) -> List[Dict[str, Any]]:
        """استخراج الكلمات المفتاحية من الموقع"""
        try:
            page_content = self._fetch_page_content(url)
            if not page_content:
                return []
            
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # استخراج النصوص
            text_content = self._extract_text_content(soup)
            
            # تحليل الكلمات المفتاحية
            keywords = self._extract_keywords_from_text(text_content)
            
            # تحليل meta keywords
            meta_keywords = self._extract_meta_keywords(soup)
            
            # دمج النتائج
            all_keywords = self._merge_keywords(keywords, meta_keywords)
            
            return all_keywords
            
        except Exception as e:
            self.logger.error(f"خطأ في استخراج الكلمات المفتاحية: {str(e)}")
            return []
    
    def analyze_competitor_website(self, url: str) -> Dict[str, Any]:
        """تحليل موقع المنافس"""
        try:
            page_content = self._fetch_page_content(url)
            if not page_content:
                return {'success': False, 'error': 'فشل في الوصول لموقع المنافس'}
            
            soup = BeautifulSoup(page_content, 'html.parser')
            
            analysis = {
                'basic_info': self._extract_basic_info(page_content, url),
                'keywords': self.extract_keywords_from_website(url),
                'content_strategy': self._analyze_content_strategy(soup),
                'pricing_strategy': self._analyze_pricing_strategy(soup),
                'value_propositions': self._extract_value_propositions(soup),
                'social_proof': self._analyze_social_proof(soup),
                'competitive_advantages': self._identify_competitive_advantages(soup)
            }
            
            return {
                'success': True,
                'analysis': analysis,
                'message': 'تم تحليل موقع المنافس بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل موقع المنافس: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # ===========================================
    # دوال التحليل المتخصصة
    # ===========================================
    
    def _fetch_page_content(self, url: str) -> Optional[str]:
        """جلب محتوى الصفحة"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            self.logger.error(f"خطأ في جلب محتوى الصفحة: {str(e)}")
            return None
    
    def _clean_url(self, url: str) -> str:
        """تنظيف الرابط"""
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        return url.strip()
    
    def _extract_basic_info(self, content: str, url: str) -> Dict[str, Any]:
        """استخراج المعلومات الأساسية"""
        soup = BeautifulSoup(content, 'html.parser')
        
        return {
            'title': soup.title.string.strip() if soup.title else '',
            'description': self._get_meta_description(soup),
            'domain': urlparse(url).netloc,
            'language': soup.get('lang', 'ar'),
            'charset': self._get_charset(soup),
            'favicon': self._get_favicon(soup, url)
        }
    
    def _analyze_seo(self, content: str) -> Dict[str, Any]:
        """تحليل SEO"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # تحليل العناوين
        headings = self._analyze_headings(soup)
        
        # تحليل الروابط
        links = self._analyze_links(soup)
        
        # تحليل الصور
        images = self._analyze_images(soup)
        
        # تحليل meta tags
        meta_tags = self._analyze_meta_tags(soup)
        
        return {
            'headings': headings,
            'links': links,
            'images': images,
            'meta_tags': meta_tags,
            'seo_score': self._calculate_seo_score(headings, links, images, meta_tags)
        }
    
    def _analyze_content(self, content: str) -> Dict[str, Any]:
        """تحليل المحتوى"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # استخراج النص
        text_content = self._extract_text_content(soup)
        
        # تحليل الكلمات
        word_count = len(text_content.split())
        
        # تحليل الكثافة
        keyword_density = self._calculate_keyword_density(text_content)
        
        # تحليل القابلية للقراءة
        readability = self._analyze_readability(text_content)
        
        return {
            'word_count': word_count,
            'character_count': len(text_content),
            'keyword_density': keyword_density,
            'readability': readability,
            'content_structure': self._analyze_content_structure(soup)
        }
    
    def _analyze_technical(self, content: str, url: str) -> Dict[str, Any]:
        """التحليل التقني"""
        soup = BeautifulSoup(content, 'html.parser')
        
        return {
            'page_size': len(content),
            'html_validation': self._validate_html(soup),
            'mobile_responsive': self._check_mobile_responsive(soup),
            'ssl_certificate': url.startswith('https://'),
            'structured_data': self._analyze_structured_data(soup),
            'performance_hints': self._analyze_performance(soup)
        }
    
    def _analyze_business_info(self, content: str) -> Dict[str, Any]:
        """تحليل معلومات الأعمال"""
        soup = BeautifulSoup(content, 'html.parser')
        
        return {
            'business_type': self._identify_business_type(soup),
            'contact_info': self._extract_contact_info(soup),
            'services': self._extract_services(soup),
            'products': self._extract_products(soup),
            'location': self._extract_location_info(soup),
            'social_media': self._extract_social_media(soup)
        }
    
    def _suggest_keywords(self, content: str) -> List[Dict[str, Any]]:
        """اقتراح الكلمات المفتاحية"""
        soup = BeautifulSoup(content, 'html.parser')
        text_content = self._extract_text_content(soup)
        
        # استخراج الكلمات المفتاحية الأساسية
        primary_keywords = self._extract_primary_keywords(text_content)
        
        # استخراج الكلمات المفتاحية الثانوية
        secondary_keywords = self._extract_secondary_keywords(text_content)
        
        # استخراج الكلمات المفتاحية طويلة الذيل
        long_tail_keywords = self._extract_long_tail_keywords(text_content)
        
        return {
            'primary': primary_keywords,
            'secondary': secondary_keywords,
            'long_tail': long_tail_keywords
        }
    
    def _identify_ad_opportunities(self, content: str) -> List[Dict[str, Any]]:
        """تحديد فرص الإعلان"""
        soup = BeautifulSoup(content, 'html.parser')
        
        opportunities = []
        
        # فرص بناءً على المحتوى
        content_opportunities = self._identify_content_opportunities(soup)
        opportunities.extend(content_opportunities)
        
        # فرص بناءً على الخدمات
        service_opportunities = self._identify_service_opportunities(soup)
        opportunities.extend(service_opportunities)
        
        # فرص بناءً على الموقع
        location_opportunities = self._identify_location_opportunities(soup)
        opportunities.extend(location_opportunities)
        
        return opportunities
    
    # ===========================================
    # دوال مساعدة للتحليل
    # ===========================================
    
    def _get_meta_description(self, soup: BeautifulSoup) -> str:
        """الحصول على meta description"""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        return meta_desc.get('content', '') if meta_desc else ''
    
    def _get_charset(self, soup: BeautifulSoup) -> str:
        """الحصول على charset"""
        charset_meta = soup.find('meta', attrs={'charset': True})
        if charset_meta:
            return charset_meta.get('charset', 'utf-8')
        
        content_type_meta = soup.find('meta', attrs={'http-equiv': 'Content-Type'})
        if content_type_meta:
            content = content_type_meta.get('content', '')
            if 'charset=' in content:
                return content.split('charset=')[1].strip()
        
        return 'utf-8'
    
    def _get_favicon(self, soup: BeautifulSoup, base_url: str) -> str:
        """الحصول على favicon"""
        favicon_link = soup.find('link', rel='icon') or soup.find('link', rel='shortcut icon')
        if favicon_link:
            href = favicon_link.get('href', '')
            return urljoin(base_url, href)
        return ''
    
    def _analyze_headings(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل العناوين"""
        headings = {}
        for i in range(1, 7):
            tag = f'h{i}'
            elements = soup.find_all(tag)
            headings[tag] = {
                'count': len(elements),
                'texts': [elem.get_text().strip() for elem in elements[:5]]  # أول 5 فقط
            }
        
        return headings
    
    def _analyze_links(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل الروابط"""
        links = soup.find_all('a', href=True)
        
        internal_links = []
        external_links = []
        
        for link in links:
            href = link.get('href', '')
            if href.startswith(('http://', 'https://')):
                external_links.append(href)
            else:
                internal_links.append(href)
        
        return {
            'total_links': len(links),
            'internal_links': len(internal_links),
            'external_links': len(external_links),
            'broken_links': 0  # يحتاج فحص إضافي
        }
    
    def _analyze_images(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل الصور"""
        images = soup.find_all('img')
        
        images_with_alt = sum(1 for img in images if img.get('alt'))
        images_without_alt = len(images) - images_with_alt
        
        return {
            'total_images': len(images),
            'images_with_alt': images_with_alt,
            'images_without_alt': images_without_alt,
            'alt_text_optimization': (images_with_alt / len(images) * 100) if images else 0
        }
    
    def _analyze_meta_tags(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل meta tags"""
        meta_tags = soup.find_all('meta')
        
        important_meta = {
            'title': soup.title.string if soup.title else '',
            'description': self._get_meta_description(soup),
            'keywords': '',
            'robots': '',
            'viewport': ''
        }
        
        for meta in meta_tags:
            name = meta.get('name', '').lower()
            if name in important_meta:
                important_meta[name] = meta.get('content', '')
        
        return important_meta
    
    def _calculate_seo_score(self, headings: Dict, links: Dict, images: Dict, meta_tags: Dict) -> int:
        """حساب نقاط SEO"""
        score = 0
        
        # نقاط العناوين
        if headings.get('h1', {}).get('count', 0) > 0:
            score += 20
        if headings.get('h2', {}).get('count', 0) > 0:
            score += 15
        
        # نقاط meta tags
        if meta_tags.get('title'):
            score += 20
        if meta_tags.get('description'):
            score += 15
        
        # نقاط الصور
        if images.get('alt_text_optimization', 0) > 80:
            score += 15
        elif images.get('alt_text_optimization', 0) > 50:
            score += 10
        
        # نقاط الروابط
        if links.get('internal_links', 0) > 5:
            score += 15
        
        return min(score, 100)
    
    def _extract_text_content(self, soup: BeautifulSoup) -> str:
        """استخراج النص من الصفحة"""
        # إزالة العناصر غير المرغوبة
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        return soup.get_text(separator=' ', strip=True)
    
    def _extract_keywords_from_text(self, text: str) -> List[Dict[str, Any]]:
        """استخراج الكلمات المفتاحية من النص"""
        # تنظيف النص
        text = re.sub(r'[^\w\s\u0600-\u06FF]', ' ', text)
        words = text.lower().split()
        
        # إزالة الكلمات الشائعة
        stop_words = {'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'أن', 'أو', 'لا', 'نحن', 'أنت', 'هو', 'هي'}
        filtered_words = [word for word in words if word not in stop_words and len(word) > 2]
        
        # حساب التكرار
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # ترتيب حسب التكرار
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        # تحويل إلى تنسيق مطلوب
        keywords = []
        for word, freq in sorted_words[:20]:  # أول 20 كلمة
            keywords.append({
                'keyword': word,
                'frequency': freq,
                'relevance': min(freq * 10, 100)
            })
        
        return keywords
    
    def _extract_meta_keywords(self, soup: BeautifulSoup) -> List[str]:
        """استخراج meta keywords"""
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            keywords_content = meta_keywords.get('content', '')
            return [kw.strip() for kw in keywords_content.split(',') if kw.strip()]
        return []
    
    def _merge_keywords(self, text_keywords: List[Dict], meta_keywords: List[str]) -> List[Dict[str, Any]]:
        """دمج الكلمات المفتاحية"""
        all_keywords = text_keywords.copy()
        
        for meta_kw in meta_keywords:
            # التحقق من عدم وجود الكلمة مسبقاً
            exists = any(kw['keyword'] == meta_kw.lower() for kw in all_keywords)
            if not exists:
                all_keywords.append({
                    'keyword': meta_kw.lower(),
                    'frequency': 1,
                    'relevance': 50,
                    'source': 'meta'
                })
        
        return all_keywords
    
    def _identify_business_type(self, soup: BeautifulSoup) -> str:
        """تحديد نوع الأعمال"""
        text_content = self._extract_text_content(soup).lower()
        
        business_indicators = {
            'متجر إلكتروني': ['متجر', 'تسوق', 'شراء', 'منتج', 'سعر', 'عربة', 'دفع'],
            'خدمات': ['خدمة', 'استشارة', 'حلول', 'دعم', 'مساعدة'],
            'مطعم': ['مطعم', 'طعام', 'وجبة', 'قائمة', 'طلب', 'توصيل'],
            'طبي': ['طبيب', 'عيادة', 'مستشفى', 'علاج', 'صحة', 'طبي'],
            'تعليمي': ['تعليم', 'دورة', 'كورس', 'تدريب', 'شهادة', 'جامعة'],
            'عقاري': ['عقار', 'شقة', 'فيلا', 'أرض', 'إيجار', 'بيع']
        }
        
        for business_type, indicators in business_indicators.items():
            if any(indicator in text_content for indicator in indicators):
                return business_type
        
        return 'عام'
    
    def _extract_contact_info(self, soup: BeautifulSoup) -> Dict[str, str]:
        """استخراج معلومات الاتصال"""
        text_content = self._extract_text_content(soup)
        
        contact_info = {}
        
        # البحث عن أرقام الهاتف
        phone_pattern = r'(\+?966|0)?[1-9]\d{8}'
        phones = re.findall(phone_pattern, text_content)
        if phones:
            contact_info['phone'] = phones[0]
        
        # البحث عن البريد الإلكتروني
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text_content)
        if emails:
            contact_info['email'] = emails[0]
        
        return contact_info
    
    def _extract_services(self, soup: BeautifulSoup) -> List[str]:
        """استخراج الخدمات"""
        services = []
        
        # البحث في العناوين
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4'])
        for heading in headings:
            text = heading.get_text().strip()
            if any(word in text.lower() for word in ['خدمة', 'خدمات', 'نقدم', 'نوفر']):
                services.append(text)
        
        # البحث في القوائم
        lists = soup.find_all(['ul', 'ol'])
        for list_elem in lists:
            items = list_elem.find_all('li')
            for item in items:
                text = item.get_text().strip()
                if len(text) < 100 and len(text) > 5:  # خدمة محتملة
                    services.append(text)
        
        return services[:10]  # أول 10 خدمات
    
    def _extract_products(self, soup: BeautifulSoup) -> List[str]:
        """استخراج المنتجات"""
        products = []
        
        # البحث عن عناصر المنتجات
        product_selectors = [
            '.product', '.item', '.card',
            '[class*="product"]', '[class*="item"]'
        ]
        
        for selector in product_selectors:
            elements = soup.select(selector)
            for element in elements[:10]:  # أول 10 فقط
                text = element.get_text().strip()
                if len(text) < 200 and len(text) > 10:
                    products.append(text)
        
        return products
    
    def _analyze_conversion_elements(self, content: str) -> Dict[str, Any]:
        """تحليل عناصر التحويل"""
        soup = BeautifulSoup(content, 'html.parser')
        
        # البحث عن أزرار الدعوة للعمل
        cta_buttons = soup.find_all(['button', 'a'], string=re.compile(r'(اشتر|اطلب|سجل|احجز|تواصل|اتصل)', re.I))
        
        # البحث عن النماذج
        forms = soup.find_all('form')
        
        # البحث عن أرقام الهاتف
        phone_numbers = re.findall(r'(\+?966|0)?[1-9]\d{8}', soup.get_text())
        
        return {
            'cta_buttons': len(cta_buttons),
            'forms': len(forms),
            'phone_numbers': len(phone_numbers),
            'conversion_score': self._calculate_conversion_score(len(cta_buttons), len(forms), len(phone_numbers))
        }
    
    def _calculate_conversion_score(self, cta_count: int, form_count: int, phone_count: int) -> int:
        """حساب نقاط التحويل"""
        score = 0
        
        if cta_count > 0:
            score += min(cta_count * 20, 40)
        if form_count > 0:
            score += min(form_count * 25, 50)
        if phone_count > 0:
            score += 10
        
        return min(score, 100)


    # ===== الدوال المفقودة المطلوبة =====
    
    def analyze_competitor_website(self, url: str) -> Dict[str, Any]:
        """تحليل موقع المنافس - دالة محدثة ومحسنة"""
        try:
            self.logger.info(f"بدء تحليل موقع المنافس: {url}")
            
            # جلب محتوى الموقع
            page_content = self._fetch_page_content(url)
            if not page_content:
                return {
                    'success': False,
                    'error': 'فشل في الوصول لموقع المنافس',
                    'url': url
                }
            
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # تحليل شامل للمنافس
            competitor_analysis = {
                'basic_info': self._extract_basic_info(page_content, url),
                'business_analysis': self._analyze_competitor_business(soup),
                'content_strategy': self._analyze_competitor_content_strategy(soup),
                'seo_strategy': self._analyze_competitor_seo_strategy(soup),
                'keywords_analysis': self._extract_competitor_keywords(soup),
                'pricing_strategy': self._analyze_competitor_pricing(soup),
                'value_propositions': self._extract_competitor_value_props(soup),
                'social_proof': self._analyze_competitor_social_proof(soup),
                'competitive_advantages': self._identify_competitor_advantages(soup),
                'weaknesses': self._identify_competitor_weaknesses(soup),
                'ad_strategies': self._analyze_competitor_ad_strategies(soup),
                'conversion_elements': self._analyze_competitor_conversion_elements(soup),
                'technical_analysis': self._analyze_competitor_technical(soup, url),
                'market_positioning': self._analyze_competitor_positioning(soup)
            }
            
            # تحليل الفجوات والفرص
            gap_analysis = self._perform_gap_analysis(competitor_analysis)
            
            # اقتراحات للتفوق على المنافس
            competitive_recommendations = self._generate_competitive_recommendations(competitor_analysis)
            
            return {
                'success': True,
                'url': url,
                'analysis': competitor_analysis,
                'gap_analysis': gap_analysis,
                'competitive_recommendations': competitive_recommendations,
                'competitive_score': self._calculate_competitive_score(competitor_analysis),
                'timestamp': datetime.now().isoformat(),
                'message': 'تم تحليل موقع المنافس بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل موقع المنافس: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'url': url,
                'message': 'فشل في تحليل موقع المنافس'
            }
    
    def extract_business_keywords(self, url: str, business_type: str = None) -> Dict[str, Any]:
        """استخراج الكلمات المفتاحية التجارية من الموقع"""
        try:
            self.logger.info(f"بدء استخراج الكلمات التجارية من: {url}")
            
            page_content = self._fetch_page_content(url)
            if not page_content:
                return {
                    'success': False,
                    'error': 'فشل في الوصول للموقع',
                    'keywords': []
                }
            
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # استخراج أنواع مختلفة من الكلمات المفتاحية
            keyword_categories = {
                'brand_keywords': self._extract_brand_keywords(soup),
                'product_keywords': self._extract_product_keywords(soup),
                'service_keywords': self._extract_service_keywords(soup),
                'location_keywords': self._extract_location_keywords(soup),
                'commercial_keywords': self._extract_commercial_keywords(soup),
                'informational_keywords': self._extract_informational_keywords(soup),
                'long_tail_keywords': self._extract_long_tail_business_keywords(soup),
                'competitor_keywords': self._extract_competitor_mention_keywords(soup),
                'seasonal_keywords': self._extract_seasonal_keywords(soup),
                'problem_solution_keywords': self._extract_problem_solution_keywords(soup)
            }
            
            # تحليل الكلمات حسب نوع الأعمال
            if business_type:
                business_specific_keywords = self._extract_business_type_keywords(soup, business_type)
                keyword_categories['business_specific'] = business_specific_keywords
            
            # تقييم قوة الكلمات المفتاحية
            keyword_strength_analysis = self._analyze_keyword_strength(keyword_categories)
            
            # اقتراحات كلمات إضافية
            additional_suggestions = self._suggest_additional_keywords(keyword_categories, business_type)
            
            # تجميع النتائج
            all_keywords = []
            for category, keywords in keyword_categories.items():
                for keyword in keywords:
                    all_keywords.append({
                        'keyword': keyword,
                        'category': category,
                        'strength': keyword_strength_analysis.get(keyword, 'متوسط'),
                        'commercial_intent': self._assess_commercial_intent(keyword),
                        'competition_level': self._estimate_keyword_competition(keyword),
                        'search_volume_estimate': self._estimate_search_volume(keyword)
                    })
            
            return {
                'success': True,
                'url': url,
                'business_type': business_type,
                'keyword_categories': keyword_categories,
                'total_keywords': len(all_keywords),
                'keywords': all_keywords,
                'keyword_strength_analysis': keyword_strength_analysis,
                'additional_suggestions': additional_suggestions,
                'recommendations': self._generate_keyword_recommendations(all_keywords),
                'message': 'تم استخراج الكلمات التجارية بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في استخراج الكلمات التجارية: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'keywords': []
            }
    
    def analyze_page_performance(self, url: str) -> Dict[str, Any]:
        """تحليل أداء الصفحة"""
        try:
            self.logger.info(f"بدء تحليل أداء الصفحة: {url}")
            
            # قياس وقت التحميل
            start_time = time.time()
            page_content = self._fetch_page_content(url)
            load_time = time.time() - start_time
            
            if not page_content:
                return {
                    'success': False,
                    'error': 'فشل في الوصول للصفحة',
                    'url': url
                }
            
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # تحليل الأداء
            performance_analysis = {
                'loading_metrics': {
                    'page_load_time': round(load_time, 2),
                    'page_size': len(page_content),
                    'page_size_mb': round(len(page_content) / (1024 * 1024), 2),
                    'load_speed_rating': self._rate_load_speed(load_time)
                },
                'resource_analysis': {
                    'total_images': len(soup.find_all('img')),
                    'total_scripts': len(soup.find_all('script')),
                    'total_stylesheets': len(soup.find_all('link', rel='stylesheet')),
                    'external_resources': self._count_external_resources(soup)
                },
                'mobile_performance': {
                    'mobile_friendly': self._check_mobile_friendly(soup),
                    'viewport_configured': bool(soup.find('meta', attrs={'name': 'viewport'})),
                    'responsive_design': self._check_responsive_design(soup)
                },
                'seo_performance': {
                    'meta_title_length': len(soup.title.string) if soup.title else 0,
                    'meta_description_length': len(self._get_meta_description(soup)),
                    'heading_structure_score': self._score_heading_structure(soup),
                    'internal_links_count': self._count_internal_links(soup)
                },
                'user_experience': {
                    'readability_score': self._calculate_readability_score(soup),
                    'content_structure_score': self._score_content_structure(soup),
                    'navigation_clarity': self._assess_navigation_clarity(soup),
                    'call_to_action_presence': self._check_cta_presence(soup)
                },
                'technical_issues': self._identify_technical_issues(soup, url),
                'optimization_opportunities': self._identify_optimization_opportunities(soup, load_time)
            }
            
            # حساب النقاط الإجمالية
            overall_score = self._calculate_overall_performance_score(performance_analysis)
            
            # توصيات التحسين
            improvement_recommendations = self._generate_performance_recommendations(performance_analysis)
            
            return {
                'success': True,
                'url': url,
                'performance_analysis': performance_analysis,
                'overall_score': overall_score,
                'performance_grade': self._get_performance_grade(overall_score),
                'improvement_recommendations': improvement_recommendations,
                'priority_fixes': self._identify_priority_fixes(performance_analysis),
                'timestamp': datetime.now().isoformat(),
                'message': 'تم تحليل أداء الصفحة بنجاح'
            }
            
        except Exception as e:
            self.logger.error(f"خطأ في تحليل أداء الصفحة: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'url': url
            }
    
    # ===== دوال مساعدة للتحليل المتقدم =====
    
    def _analyze_competitor_business(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل أعمال المنافس"""
        return {
            'business_name': self._extract_business_name(soup),
            'business_type': self._identify_business_type(soup),
            'target_audience': self._identify_target_audience(soup),
            'service_offerings': self._extract_service_offerings(soup),
            'unique_selling_points': self._extract_unique_selling_points(soup),
            'contact_information': self._extract_detailed_contact_info(soup),
            'business_hours': self._extract_business_hours(soup),
            'service_areas': self._extract_service_areas(soup)
        }
    
    def _analyze_competitor_content_strategy(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل استراتيجية المحتوى للمنافس"""
        return {
            'content_types': self._identify_content_types(soup),
            'content_volume': self._measure_content_volume(soup),
            'content_quality': self._assess_content_quality(soup),
            'content_freshness': self._assess_content_freshness(soup),
            'content_structure': self._analyze_content_structure_detailed(soup),
            'multimedia_usage': self._analyze_multimedia_usage(soup),
            'blog_presence': self._check_blog_presence(soup),
            'content_themes': self._identify_content_themes(soup)
        }
    
    def _analyze_competitor_seo_strategy(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل استراتيجية SEO للمنافس"""
        return {
            'title_optimization': self._analyze_title_optimization(soup),
            'meta_description_optimization': self._analyze_meta_description_optimization(soup),
            'heading_optimization': self._analyze_heading_optimization(soup),
            'keyword_density': self._calculate_detailed_keyword_density(soup),
            'internal_linking': self._analyze_internal_linking_strategy(soup),
            'schema_markup': self._analyze_schema_markup(soup),
            'url_structure': self._analyze_url_structure(soup),
            'image_optimization': self._analyze_image_seo_optimization(soup)
        }
    
    def _extract_competitor_keywords(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """استخراج كلمات المنافس المفتاحية"""
        text_content = self._extract_text_content(soup)
        
        return {
            'primary_keywords': self._extract_primary_keywords_advanced(text_content, soup),
            'secondary_keywords': self._extract_secondary_keywords_advanced(text_content, soup),
            'long_tail_keywords': self._extract_long_tail_keywords_advanced(text_content),
            'branded_keywords': self._extract_branded_keywords(soup),
            'local_keywords': self._extract_local_keywords_advanced(soup),
            'commercial_keywords': self._extract_commercial_keywords_advanced(text_content),
            'meta_keywords': self._extract_meta_keywords_advanced(soup)
        }
    
    def _analyze_competitor_pricing(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل استراتيجية التسعير للمنافس"""
        return {
            'pricing_visibility': self._check_pricing_visibility(soup),
            'pricing_strategy': self._identify_pricing_strategy(soup),
            'price_ranges': self._extract_price_ranges(soup),
            'pricing_models': self._identify_pricing_models(soup),
            'discounts_offers': self._extract_discounts_offers(soup),
            'payment_options': self._extract_payment_options(soup),
            'pricing_transparency': self._assess_pricing_transparency(soup)
        }
    
    def _extract_competitor_value_props(self, soup: BeautifulSoup) -> List[str]:
        """استخراج عروض القيمة للمنافس"""
        value_props = []
        
        # البحث في العناوين الرئيسية
        main_headings = soup.find_all(['h1', 'h2'], limit=10)
        for heading in main_headings:
            text = heading.get_text().strip()
            if self._is_value_proposition(text):
                value_props.append(text)
        
        # البحث في النصوص البارزة
        prominent_texts = soup.find_all(['strong', 'b', 'em'], limit=20)
        for text_elem in prominent_texts:
            text = text_elem.get_text().strip()
            if self._is_value_proposition(text) and len(text) > 10:
                value_props.append(text)
        
        # البحث في الشعارات والعبارات التسويقية
        marketing_elements = soup.find_all(class_=re.compile(r'(slogan|tagline|hero|banner|value)', re.I))
        for elem in marketing_elements:
            text = elem.get_text().strip()
            if text and len(text) < 200:
                value_props.append(text)
        
        return list(set(value_props))[:10]  # إزالة التكرارات والحد الأقصى 10
    
    def _analyze_competitor_social_proof(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """تحليل الدليل الاجتماعي للمنافس"""
        return {
            'testimonials': self._extract_testimonials(soup),
            'reviews_ratings': self._extract_reviews_ratings(soup),
            'client_logos': self._extract_client_logos(soup),
            'case_studies': self._extract_case_studies(soup),
            'awards_certifications': self._extract_awards_certifications(soup),
            'social_media_presence': self._analyze_social_media_presence(soup),
            'trust_badges': self._extract_trust_badges(soup),
            'media_mentions': self._extract_media_mentions(soup)
        }
    
    def _identify_competitor_advantages(self, soup: BeautifulSoup) -> List[str]:
        """تحديد المزايا التنافسية للمنافس"""
        advantages = []
        
        # البحث عن كلمات تدل على المزايا
        advantage_keywords = [
            'أفضل', 'الأول', 'رائد', 'متخصص', 'خبير', 'محترف',
            'سريع', 'جودة', 'ضمان', 'مضمون', 'موثوق', 'معتمد'
        ]
        
        text_content = self._extract_text_content(soup).lower()
        
        for keyword in advantage_keywords:
            if keyword in text_content:
                # البحث عن الجمل التي تحتوي على هذه الكلمات
                sentences = text_content.split('.')
                for sentence in sentences:
                    if keyword in sentence and len(sentence.strip()) > 20:
                        advantages.append(sentence.strip()[:100])
        
        return list(set(advantages))[:8]
    
    def _identify_competitor_weaknesses(self, soup: BeautifulSoup) -> List[str]:
        """تحديد نقاط الضعف المحتملة للمنافس"""
        weaknesses = []
        
        # فحص المشاكل التقنية
        if not soup.find('meta', attrs={'name': 'description'}):
            weaknesses.append('لا يوجد وصف meta للصفحة')
        
        if not soup.find('meta', attrs={'name': 'viewport'}):
            weaknesses.append('غير محسن للأجهزة المحمولة')
        
        # فحص جودة المحتوى
        if len(self._extract_text_content(soup)) < 500:
            weaknesses.append('محتوى قليل في الصفحة الرئيسية')
        
        # فحص معلومات الاتصال
        contact_info = self._extract_contact_info(soup)
        if not contact_info.get('phone') and not contact_info.get('email'):
            weaknesses.append('معلومات الاتصال غير واضحة')
        
        # فحص الصور
        images = soup.find_all('img')
        images_without_alt = [img for img in images if not img.get('alt')]
        if len(images_without_alt) > len(images) * 0.5:
            weaknesses.append('معظم الصور بدون نص بديل')
        
        return weaknesses
    
    def _perform_gap_analysis(self, competitor_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """تحليل الفجوات مقارنة بالمنافس"""
        return {
            'content_gaps': self._identify_content_gaps(competitor_analysis),
            'keyword_gaps': self._identify_keyword_gaps(competitor_analysis),
            'feature_gaps': self._identify_feature_gaps(competitor_analysis),
            'seo_gaps': self._identify_seo_gaps(competitor_analysis),
            'user_experience_gaps': self._identify_ux_gaps(competitor_analysis),
            'technical_gaps': self._identify_technical_gaps(competitor_analysis)
        }
    
    def _generate_competitive_recommendations(self, competitor_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """إنشاء توصيات للتفوق على المنافس"""
        recommendations = []
        
        # توصيات المحتوى
        content_strategy = competitor_analysis.get('content_strategy', {})
        if content_strategy.get('blog_presence'):
            recommendations.append({
                'category': 'محتوى',
                'recommendation': 'إنشاء مدونة للتنافس في المحتوى',
                'priority': 'عالي',
                'impact': 'زيادة الزيارات العضوية'
            })
        
        # توصيات SEO
        seo_strategy = competitor_analysis.get('seo_strategy', {})
        if seo_strategy.get('schema_markup'):
            recommendations.append({
                'category': 'SEO',
                'recommendation': 'تطبيق Schema Markup للتفوق في نتائج البحث',
                'priority': 'متوسط',
                'impact': 'تحسين ظهور النتائج'
            })
        
        # توصيات التسعير
        pricing_strategy = competitor_analysis.get('pricing_strategy', {})
        if not pricing_strategy.get('pricing_transparency'):
            recommendations.append({
                'category': 'تسعير',
                'recommendation': 'إظهار الأسعار بوضوح للتفوق في الشفافية',
                'priority': 'متوسط',
                'impact': 'زيادة الثقة والتحويلات'
            })
        
        return recommendations
    
    def _calculate_competitive_score(self, competitor_analysis: Dict[str, Any]) -> int:
        """حساب نقاط القوة التنافسية للمنافس"""
        score = 0
        
        # نقاط المحتوى
        content_strategy = competitor_analysis.get('content_strategy', {})
        if content_strategy.get('blog_presence'):
            score += 15
        if content_strategy.get('content_quality') == 'عالي':
            score += 20
        
        # نقاط SEO
        seo_strategy = competitor_analysis.get('seo_strategy', {})
        if seo_strategy.get('title_optimization'):
            score += 10
        if seo_strategy.get('schema_markup'):
            score += 15
        
        # نقاط الدليل الاجتماعي
        social_proof = competitor_analysis.get('social_proof', {})
        if social_proof.get('testimonials'):
            score += 10
        if social_proof.get('reviews_ratings'):
            score += 15
        
        # نقاط التقنية
        if competitor_analysis.get('technical_analysis', {}).get('mobile_friendly'):
            score += 15
        
        return min(score, 100)

# تصدير الكلاس
__all__ = ['WebsiteAnalyzer']

