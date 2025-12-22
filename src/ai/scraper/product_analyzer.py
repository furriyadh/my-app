# Google Ads AI Platform - Product Analyzer
# Analyze products and services from websites for Google Ads campaigns

import re
import logging
from typing import Dict, Any, List, Optional, Set, Tuple
from bs4 import BeautifulSoup, Tag
from urllib.parse import urljoin
import json
from collections import defaultdict

from .config import ScrapeConfig

logger = logging.getLogger(__name__)

class ProductAnalyzer:
    """
    Product and service analysis from websites
    
    Analyzes and extracts:
    - Product listings and details
    - Service offerings
    - Pricing information
    - Product categories
    - Features and specifications
    - Product images and descriptions
    - Inventory and availability
    - Customer reviews and ratings
    """
    
    def __init__(self, config: ScrapeConfig):
        """Initialize product analyzer with configuration"""
        self.config = config
        
        # Price patterns (multiple currencies)
        self.price_patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # USD format
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)',  # USD with text
            r'€(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # EUR format
            r'£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # GBP format
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:EUR|euros?)',  # EUR with text
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:GBP|pounds?)',  # GBP with text
        ]
        
        # Product indicator keywords
        self.product_keywords = {
            'product', 'item', 'goods', 'merchandise', 'inventory',
            'catalog', 'shop', 'store', 'buy', 'purchase', 'order'
        }
        
        # Service indicator keywords
        self.service_keywords = {
            'service', 'consultation', 'support', 'assistance', 'help',
            'maintenance', 'repair', 'installation', 'training', 'coaching'
        }
        
        # Product category keywords
        self.category_keywords = {
            'electronics': ['electronics', 'gadgets', 'devices', 'tech', 'digital'],
            'clothing': ['clothing', 'apparel', 'fashion', 'wear', 'garments'],
            'home': ['home', 'furniture', 'decor', 'household', 'living'],
            'beauty': ['beauty', 'cosmetics', 'skincare', 'makeup', 'personal care'],
            'sports': ['sports', 'fitness', 'athletic', 'exercise', 'outdoor'],
            'automotive': ['automotive', 'car', 'vehicle', 'auto', 'parts'],
            'books': ['books', 'literature', 'reading', 'educational', 'academic'],
            'toys': ['toys', 'games', 'kids', 'children', 'play'],
            'food': ['food', 'grocery', 'snacks', 'beverages', 'organic'],
            'health': ['health', 'medical', 'wellness', 'supplements', 'pharmacy']
        }
        
        # Feature keywords
        self.feature_keywords = {
            'size', 'color', 'material', 'weight', 'dimensions', 'capacity',
            'power', 'battery', 'warranty', 'brand', 'model', 'version',
            'features', 'specifications', 'benefits', 'advantages'
        }
        
        # Availability keywords
        self.availability_keywords = {
            'in_stock': ['in stock', 'available', 'ready to ship', 'immediate delivery'],
            'out_of_stock': ['out of stock', 'sold out', 'unavailable', 'backordered'],
            'limited': ['limited stock', 'few left', 'limited quantity', 'while supplies last'],
            'pre_order': ['pre-order', 'coming soon', 'pre-sale', 'advance order']
        }
    
    async def analyze_products(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """
        Analyze products and services from webpage
        
        Args:
            soup: BeautifulSoup object of the HTML page
            url: Website URL
            
        Returns:
            List of product/service dictionaries
        """
        try:
            logger.info("Starting product analysis")
            
            products = []
            
            # Extract structured product data first
            structured_products = await self._extract_structured_products(soup)
            products.extend(structured_products)
            
            # Extract products from common e-commerce patterns
            ecommerce_products = await self._extract_ecommerce_products(soup, url)
            products.extend(ecommerce_products)
            
            # Extract services
            services = await self._extract_services(soup)
            products.extend(services)
            
            # Extract products from general content
            content_products = await self._extract_content_products(soup)
            products.extend(content_products)
            
            # Extract product categories
            categories = await self._extract_product_categories(soup)
            
            # Deduplicate and enhance products
            unique_products = self._deduplicate_products(products)
            enhanced_products = await self._enhance_products(unique_products, soup, url)
            
            # Add category information
            for product in enhanced_products:
                product['categories'] = categories
            
            # Sort by relevance/completeness
            enhanced_products.sort(key=lambda x: self._calculate_product_score(x), reverse=True)
            
            logger.info(f"Product analysis completed. Found {len(enhanced_products)} products/services")
            return enhanced_products[:50]  # Limit to top 50 products
            
        except Exception as e:
            logger.error(f"Product analysis failed: {str(e)}")
            return []
    
    async def _extract_structured_products(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract products from structured data (JSON-LD, microdata)"""
        try:
            products = []
            
            # Extract from JSON-LD
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_ld_scripts:
                try:
                    if script.string:
                        data = json.loads(script.string.strip())
                        
                        # Handle single product
                        if isinstance(data, dict):
                            product = self._parse_structured_product(data)
                            if product:
                                products.append(product)
                        
                        # Handle product list
                        elif isinstance(data, list):
                            for item in data:
                                if isinstance(item, dict):
                                    product = self._parse_structured_product(item)
                                    if product:
                                        products.append(product)
                
                except json.JSONDecodeError:
                    continue
            
            # Extract from microdata
            microdata_products = soup.find_all(attrs={'itemtype': re.compile(r'schema\.org.*Product', re.I)})
            for product_elem in microdata_products:
                product = self._parse_microdata_product(product_elem)
                if product:
                    products.append(product)
            
            return products
            
        except Exception as e:
            logger.error(f"Structured product extraction failed: {str(e)}")
            return []
    
    async def _extract_ecommerce_products(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract products from common e-commerce patterns"""
        try:
            products = []
            
            # Common product container selectors
            product_selectors = [
                '.product', '.item', '.product-item', '.product-card',
                '.listing-item', '.shop-item', '.catalog-item',
                '[class*="product"]', '[class*="item"]'
            ]
            
            for selector in product_selectors:
                product_elements = soup.select(selector)
                
                for element in product_elements[:20]:  # Limit to prevent overload
                    product = await self._parse_product_element(element, base_url)
                    if product and product.get('name'):
                        products.append(product)
            
            return products
            
        except Exception as e:
            logger.error(f"E-commerce product extraction failed: {str(e)}")
            return []
    
    async def _extract_services(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract services from webpage"""
        try:
            services = []
            
            # Look for service sections
            service_selectors = [
                '.service', '.services', '.offering', '.solution',
                '[class*="service"]', '[class*="offering"]'
            ]
            
            for selector in service_selectors:
                service_elements = soup.select(selector)
                
                for element in service_elements:
                    service = await self._parse_service_element(element)
                    if service and service.get('name'):
                        services.append(service)
            
            # Extract from navigation menus
            nav_services = await self._extract_nav_services(soup)
            services.extend(nav_services)
            
            return services
            
        except Exception as e:
            logger.error(f"Service extraction failed: {str(e)}")
            return []
    
    async def _extract_content_products(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract products mentioned in general content"""
        try:
            products = []
            
            # Get all text content
            text_content = soup.get_text()
            
            # Look for product mentions with prices
            price_contexts = self._find_price_contexts(text_content)
            for context in price_contexts:
                product = self._parse_price_context(context)
                if product:
                    products.append(product)
            
            # Look for product lists in content
            list_products = self._extract_list_products(soup)
            products.extend(list_products)
            
            return products
            
        except Exception as e:
            logger.error(f"Content product extraction failed: {str(e)}")
            return []
    
    async def _extract_product_categories(self, soup: BeautifulSoup) -> List[str]:
        """Extract product categories from webpage"""
        try:
            categories = []
            
            # Look for category navigation
            nav_elements = soup.find_all(['nav', 'ul'], class_=re.compile(r'categor|menu|nav', re.I))
            for nav in nav_elements:
                links = nav.find_all('a')
                for link in links:
                    link_text = link.get_text(strip=True).lower()
                    
                    # Check if link text matches known categories
                    for category, keywords in self.category_keywords.items():
                        if any(keyword in link_text for keyword in keywords):
                            categories.append(category)
                            break
            
            # Look for category sections
            category_sections = soup.find_all(['div', 'section'], 
                                            class_=re.compile(r'categor|department', re.I))
            for section in category_sections:
                section_text = section.get_text().lower()
                
                for category, keywords in self.category_keywords.items():
                    if any(keyword in section_text for keyword in keywords):
                        categories.append(category)
                        break
            
            return list(set(categories))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Category extraction failed: {str(e)}")
            return []
    
    async def _enhance_products(self, products: List[Dict[str, Any]], soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Enhance product data with additional information"""
        try:
            enhanced_products = []
            
            for product in products:
                # Add missing fields
                if 'type' not in product:
                    product['type'] = self._determine_product_type(product)
                
                if 'category' not in product:
                    product['category'] = self._determine_product_category(product)
                
                if 'features' not in product:
                    product['features'] = self._extract_product_features(product)
                
                if 'availability' not in product:
                    product['availability'] = 'unknown'
                
                if 'rating' not in product:
                    product['rating'] = None
                
                if 'reviews_count' not in product:
                    product['reviews_count'] = 0
                
                # Calculate completeness score
                product['completeness_score'] = self._calculate_product_completeness(product)
                
                # Add SEO-friendly data
                product['seo_title'] = self._generate_seo_title(product)
                product['seo_description'] = self._generate_seo_description(product)
                
                enhanced_products.append(product)
            
            return enhanced_products
            
        except Exception as e:
            logger.error(f"Product enhancement failed: {str(e)}")
            return products
    
    def _parse_structured_product(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse product from structured data"""
        try:
            schema_type = data.get('@type', '').lower()
            
            # Check if it's a product-related schema
            if not any(product_type in schema_type for product_type in ['product', 'offer', 'service']):
                return None
            
            product = {
                'name': data.get('name', ''),
                'description': data.get('description', ''),
                'type': 'product' if 'product' in schema_type else 'service',
                'source': 'structured_data'
            }
            
            # Extract price information
            offers = data.get('offers', {})
            if isinstance(offers, dict):
                product['price'] = offers.get('price', '')
                product['currency'] = offers.get('priceCurrency', '')
                product['availability'] = offers.get('availability', '').split('/')[-1].lower()
            elif isinstance(offers, list) and offers:
                offer = offers[0]
                product['price'] = offer.get('price', '')
                product['currency'] = offer.get('priceCurrency', '')
                product['availability'] = offer.get('availability', '').split('/')[-1].lower()
            
            # Extract additional fields
            product['brand'] = data.get('brand', {}).get('name', '') if isinstance(data.get('brand'), dict) else data.get('brand', '')
            product['model'] = data.get('model', '')
            product['sku'] = data.get('sku', '')
            product['gtin'] = data.get('gtin', '')
            
            # Extract rating
            rating_data = data.get('aggregateRating', {})
            if rating_data:
                product['rating'] = rating_data.get('ratingValue', '')
                product['reviews_count'] = rating_data.get('reviewCount', 0)
            
            # Extract images
            images = data.get('image', [])
            if isinstance(images, str):
                product['images'] = [images]
            elif isinstance(images, list):
                product['images'] = images
            else:
                product['images'] = []
            
            return product if product['name'] else None
            
        except Exception as e:
            logger.error(f"Structured product parsing failed: {str(e)}")
            return None
    
    def _parse_microdata_product(self, element: Tag) -> Optional[Dict[str, Any]]:
        """Parse product from microdata"""
        try:
            product = {
                'type': 'product',
                'source': 'microdata'
            }
            
            # Extract properties
            props = element.find_all(attrs={'itemprop': True})
            for prop in props:
                prop_name = prop.get('itemprop')
                prop_value = prop.get('content') or prop.get_text(strip=True)
                
                if prop_name and prop_value:
                    if prop_name == 'name':
                        product['name'] = prop_value
                    elif prop_name == 'description':
                        product['description'] = prop_value
                    elif prop_name == 'price':
                        product['price'] = prop_value
                    elif prop_name == 'priceCurrency':
                        product['currency'] = prop_value
                    elif prop_name == 'brand':
                        product['brand'] = prop_value
                    elif prop_name == 'model':
                        product['model'] = prop_value
                    elif prop_name == 'image':
                        product.setdefault('images', []).append(prop.get('src') or prop_value)
            
            return product if product.get('name') else None
            
        except Exception as e:
            logger.error(f"Microdata product parsing failed: {str(e)}")
            return None
    
    async def _parse_product_element(self, element: Tag, base_url: str) -> Optional[Dict[str, Any]]:
        """Parse product from HTML element"""
        try:
            product = {
                'type': 'product',
                'source': 'html_element'
            }
            
            # Extract name (from headings, links, or title attributes)
            name_selectors = ['h1', 'h2', 'h3', 'h4', '.title', '.name', '.product-title', '.product-name']
            for selector in name_selectors:
                name_elem = element.select_one(selector)
                if name_elem:
                    product['name'] = name_elem.get_text(strip=True)
                    break
            
            # If no name found, try link text or title attribute
            if not product.get('name'):
                link = element.find('a')
                if link:
                    product['name'] = link.get('title') or link.get_text(strip=True)
            
            # Extract description
            desc_selectors = ['.description', '.summary', '.excerpt', 'p']
            for selector in desc_selectors:
                desc_elem = element.select_one(selector)
                if desc_elem:
                    desc_text = desc_elem.get_text(strip=True)
                    if len(desc_text) > 20:
                        product['description'] = desc_text[:300]
                        break
            
            # Extract price
            price_info = self._extract_price_from_element(element)
            product.update(price_info)
            
            # Extract images
            images = []
            img_tags = element.find_all('img')
            for img in img_tags:
                src = img.get('src') or img.get('data-src')
                if src:
                    full_url = urljoin(base_url, src)
                    images.append(full_url)
            product['images'] = images
            
            # Extract availability
            availability_text = element.get_text().lower()
            for status, keywords in self.availability_keywords.items():
                if any(keyword in availability_text for keyword in keywords):
                    product['availability'] = status
                    break
            
            # Extract rating
            rating_elem = element.select_one('[class*="rating"], [class*="star"], [class*="review"]')
            if rating_elem:
                rating_text = rating_elem.get_text()
                rating_match = re.search(r'(\d+(?:\.\d+)?)', rating_text)
                if rating_match:
                    product['rating'] = float(rating_match.group(1))
            
            return product if product.get('name') else None
            
        except Exception as e:
            logger.error(f"Product element parsing failed: {str(e)}")
            return None
    
    async def _parse_service_element(self, element: Tag) -> Optional[Dict[str, Any]]:
        """Parse service from HTML element"""
        try:
            service = {
                'type': 'service',
                'source': 'html_element'
            }
            
            # Extract name
            name_selectors = ['h1', 'h2', 'h3', 'h4', '.title', '.name', '.service-title', '.service-name']
            for selector in name_selectors:
                name_elem = element.select_one(selector)
                if name_elem:
                    service['name'] = name_elem.get_text(strip=True)
                    break
            
            # Extract description
            desc_selectors = ['.description', '.summary', '.details', 'p']
            for selector in desc_selectors:
                desc_elem = element.select_one(selector)
                if desc_elem:
                    desc_text = desc_elem.get_text(strip=True)
                    if len(desc_text) > 20:
                        service['description'] = desc_text[:300]
                        break
            
            # Extract price
            price_info = self._extract_price_from_element(element)
            service.update(price_info)
            
            # Extract features/benefits
            features = []
            feature_lists = element.find_all(['ul', 'ol'])
            for feature_list in feature_lists:
                items = feature_list.find_all('li')
                for item in items:
                    feature_text = item.get_text(strip=True)
                    if len(feature_text) > 5:
                        features.append(feature_text)
            service['features'] = features[:10]  # Limit to 10 features
            
            return service if service.get('name') else None
            
        except Exception as e:
            logger.error(f"Service element parsing failed: {str(e)}")
            return None
    
    async def _extract_nav_services(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract services from navigation menus"""
        try:
            services = []
            
            # Look for service-related navigation
            nav_elements = soup.find_all(['nav', 'ul'], class_=re.compile(r'service|menu|nav', re.I))
            
            for nav in nav_elements:
                links = nav.find_all('a')
                for link in links:
                    link_text = link.get_text(strip=True)
                    link_href = link.get('href', '')
                    
                    # Check if link indicates a service
                    if any(keyword in link_text.lower() for keyword in self.service_keywords):
                        service = {
                            'name': link_text,
                            'type': 'service',
                            'source': 'navigation',
                            'url': link_href,
                            'description': ''
                        }
                        services.append(service)
            
            return services
            
        except Exception as e:
            logger.error(f"Navigation service extraction failed: {str(e)}")
            return []
    
    def _find_price_contexts(self, text: str) -> List[str]:
        """Find text contexts that contain prices"""
        contexts = []
        
        for pattern in self.price_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end].strip()
                contexts.append(context)
        
        return contexts
    
    def _parse_price_context(self, context: str) -> Optional[Dict[str, Any]]:
        """Parse product information from price context"""
        try:
            # Extract price
            price_match = None
            currency = ''
            
            for pattern in self.price_patterns:
                match = re.search(pattern, context, re.IGNORECASE)
                if match:
                    price_match = match
                    if '$' in pattern:
                        currency = 'USD'
                    elif '€' in pattern:
                        currency = 'EUR'
                    elif '£' in pattern:
                        currency = 'GBP'
                    break
            
            if not price_match:
                return None
            
            # Extract potential product name (words before or after price)
            words = context.split()
            price_word_index = -1
            
            for i, word in enumerate(words):
                if any(char in word for char in '$€£') or 'usd' in word.lower():
                    price_word_index = i
                    break
            
            if price_word_index == -1:
                return None
            
            # Get words around the price as potential product name
            start_idx = max(0, price_word_index - 5)
            end_idx = min(len(words), price_word_index + 3)
            
            name_words = words[start_idx:price_word_index] + words[price_word_index + 1:end_idx]
            product_name = ' '.join(name_words).strip()
            
            # Clean product name
            product_name = re.sub(r'[^\w\s-]', '', product_name)
            product_name = ' '.join(product_name.split())
            
            if len(product_name) < 3:
                return None
            
            return {
                'name': product_name,
                'price': price_match.group(1),
                'currency': currency,
                'type': 'product',
                'source': 'price_context',
                'description': context[:200]
            }
            
        except Exception as e:
            logger.error(f"Price context parsing failed: {str(e)}")
            return None
    
    def _extract_list_products(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract products from lists in content"""
        try:
            products = []
            
            # Find lists that might contain products
            lists = soup.find_all(['ul', 'ol'])
            
            for list_elem in lists:
                list_text = list_elem.get_text().lower()
                
                # Check if list contains product-related keywords
                if any(keyword in list_text for keyword in self.product_keywords):
                    items = list_elem.find_all('li')
                    
                    for item in items:
                        item_text = item.get_text(strip=True)
                        
                        # Check if item looks like a product
                        if len(item_text) > 5 and len(item_text) < 100:
                            # Check for price in item
                            price_info = self._extract_price_from_text(item_text)
                            
                            product = {
                                'name': item_text,
                                'type': 'product',
                                'source': 'content_list',
                                'description': ''
                            }
                            product.update(price_info)
                            products.append(product)
            
            return products[:20]  # Limit to 20 products
            
        except Exception as e:
            logger.error(f"List product extraction failed: {str(e)}")
            return []
    
    def _extract_price_from_element(self, element: Tag) -> Dict[str, Any]:
        """Extract price information from HTML element"""
        price_info = {'price': '', 'currency': '', 'original_price': ''}
        
        try:
            # Look for price-specific selectors
            price_selectors = [
                '.price', '.cost', '.amount', '.value',
                '[class*="price"]', '[class*="cost"]'
            ]
            
            for selector in price_selectors:
                price_elem = element.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    extracted_price = self._extract_price_from_text(price_text)
                    if extracted_price['price']:
                        price_info.update(extracted_price)
                        break
            
            # If no price found in specific selectors, search all text
            if not price_info['price']:
                element_text = element.get_text()
                extracted_price = self._extract_price_from_text(element_text)
                price_info.update(extracted_price)
            
        except Exception as e:
            logger.error(f"Price extraction from element failed: {str(e)}")
        
        return price_info
    
    def _extract_price_from_text(self, text: str) -> Dict[str, Any]:
        """Extract price from text"""
        price_info = {'price': '', 'currency': '', 'original_price': ''}
        
        try:
            for pattern in self.price_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    price_info['price'] = match.group(1)
                    
                    # Determine currency
                    if '$' in text:
                        price_info['currency'] = 'USD'
                    elif '€' in text:
                        price_info['currency'] = 'EUR'
                    elif '£' in text:
                        price_info['currency'] = 'GBP'
                    elif 'usd' in text.lower():
                        price_info['currency'] = 'USD'
                    elif 'eur' in text.lower():
                        price_info['currency'] = 'EUR'
                    elif 'gbp' in text.lower():
                        price_info['currency'] = 'GBP'
                    
                    break
            
            # Look for original/sale price patterns
            sale_patterns = [
                r'was\s*\$?(\d+(?:\.\d{2})?)',
                r'originally\s*\$?(\d+(?:\.\d{2})?)',
                r'regular\s*\$?(\d+(?:\.\d{2})?)'
            ]
            
            for pattern in sale_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    price_info['original_price'] = match.group(1)
                    break
        
        except Exception as e:
            logger.error(f"Price extraction from text failed: {str(e)}")
        
        return price_info
    
    def _determine_product_type(self, product: Dict[str, Any]) -> str:
        """Determine if item is product or service"""
        name = product.get('name', '').lower()
        description = product.get('description', '').lower()
        
        combined_text = f"{name} {description}"
        
        # Count service vs product indicators
        service_score = sum(1 for keyword in self.service_keywords if keyword in combined_text)
        product_score = sum(1 for keyword in self.product_keywords if keyword in combined_text)
        
        return 'service' if service_score > product_score else 'product'
    
    def _determine_product_category(self, product: Dict[str, Any]) -> str:
        """Determine product category"""
        name = product.get('name', '').lower()
        description = product.get('description', '').lower()
        
        combined_text = f"{name} {description}"
        
        # Score each category
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return 'general'
    
    def _extract_product_features(self, product: Dict[str, Any]) -> List[str]:
        """Extract product features from description"""
        features = []
        description = product.get('description', '')
        
        if not description:
            return features
        
        # Look for feature patterns
        feature_patterns = [
            r'features?:?\s*([^.!?]+)',
            r'includes?:?\s*([^.!?]+)',
            r'specifications?:?\s*([^.!?]+)',
            r'benefits?:?\s*([^.!?]+)'
        ]
        
        for pattern in feature_patterns:
            matches = re.findall(pattern, description, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters
                feature_items = re.split(r'[,;•\n]', match)
                for item in feature_items:
                    item = item.strip()
                    if len(item) > 3 and len(item) < 100:
                        features.append(item)
        
        return features[:10]  # Limit to 10 features
    
    def _calculate_product_score(self, product: Dict[str, Any]) -> float:
        """Calculate relevance score for product"""
        score = 0
        
        # Name quality (30 points)
        if product.get('name'):
            name_length = len(product['name'])
            if 5 <= name_length <= 100:
                score += 30
            elif name_length > 0:
                score += 15
        
        # Description quality (25 points)
        if product.get('description'):
            desc_length = len(product['description'])
            if desc_length > 50:
                score += 25
            elif desc_length > 20:
                score += 15
            elif desc_length > 0:
                score += 8
        
        # Price information (20 points)
        if product.get('price'):
            score += 20
        
        # Images (10 points)
        if product.get('images'):
            score += 10
        
        # Features (10 points)
        if product.get('features'):
            score += 10
        
        # Availability (5 points)
        if product.get('availability') and product['availability'] != 'unknown':
            score += 5
        
        return score
    
    def _calculate_product_completeness(self, product: Dict[str, Any]) -> float:
        """Calculate completeness score for product data"""
        total_fields = 10
        completed_fields = 0
        
        required_fields = [
            'name', 'description', 'price', 'type', 'category',
            'images', 'features', 'availability', 'currency', 'source'
        ]
        
        for field in required_fields:
            if product.get(field):
                completed_fields += 1
        
        return (completed_fields / total_fields) * 100
    
    def _generate_seo_title(self, product: Dict[str, Any]) -> str:
        """Generate SEO-friendly title for product"""
        name = product.get('name', '')
        category = product.get('category', '')
        price = product.get('price', '')
        
        if not name:
            return ''
        
        title_parts = [name]
        
        if category and category != 'general':
            title_parts.append(f"- {category.title()}")
        
        if price:
            currency = product.get('currency', '')
            title_parts.append(f"- {currency}{price}" if currency else f"- ${price}")
        
        return ' '.join(title_parts)[:60]  # Limit to 60 characters
    
    def _generate_seo_description(self, product: Dict[str, Any]) -> str:
        """Generate SEO-friendly description for product"""
        description = product.get('description', '')
        name = product.get('name', '')
        features = product.get('features', [])
        
        if description:
            return description[:160]  # Limit to 160 characters
        
        if name and features:
            feature_text = ', '.join(features[:3])
            return f"{name} featuring {feature_text}"[:160]
        
        return name[:160] if name else ''
    
    def _deduplicate_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate products based on name similarity"""
        unique_products = []
        seen_names = set()
        
        for product in products:
            name = product.get('name', '').lower().strip()
            
            # Simple deduplication based on name
            if name and name not in seen_names:
                seen_names.add(name)
                unique_products.append(product)
        
        return unique_products

