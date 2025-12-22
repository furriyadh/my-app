# Google Ads AI Platform - Content Extractor
# HTML content extraction and processing

import re
import logging
from typing import Dict, Any, List, Optional, Set
from bs4 import BeautifulSoup, Tag, NavigableString
from urllib.parse import urljoin, urlparse
import html

from .config import ScrapeConfig, ContentType

logger = logging.getLogger(__name__)

class ContentExtractor:
    """
    Advanced content extraction from HTML pages
    
    Extracts and processes various types of content:
    - Clean text content
    - Images and media
    - Links and navigation
    - Metadata and structured information
    - Forms and interactive elements
    """
    
    def __init__(self, config: ScrapeConfig):
        """Initialize content extractor with configuration"""
        self.config = config
        self.extracted_content = {}
        
    async def extract_content(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        """
        Extract all types of content from HTML soup
        
        Args:
            soup: BeautifulSoup object of the HTML page
            base_url: Base URL for resolving relative links
            
        Returns:
            Dictionary containing extracted content
        """
        try:
            content_data = {
                "base_url": base_url,
                "extraction_timestamp": __import__('time').time()
            }
            
            # Extract different content types based on configuration
            for content_type in self.config.content_types:
                if content_type == ContentType.TEXT:
                    content_data.update(await self._extract_text_content(soup))
                elif content_type == ContentType.IMAGES:
                    content_data["images"] = await self._extract_images(soup, base_url)
                elif content_type == ContentType.LINKS:
                    content_data["links"] = await self._extract_links(soup, base_url)
                elif content_type == ContentType.METADATA:
                    content_data["metadata"] = await self._extract_metadata(soup)
                elif content_type == ContentType.STRUCTURED_DATA:
                    content_data["structured_data"] = await self._extract_structured_data(soup)
                elif content_type == ContentType.FORMS:
                    content_data["forms"] = await self._extract_forms(soup, base_url)
            
            # Calculate content statistics
            content_data["content_stats"] = self._calculate_content_stats(content_data)
            
            return content_data
            
        except Exception as e:
            logger.error(f"Content extraction failed: {str(e)}")
            return {"error": str(e)}
    
    async def _extract_text_content(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract and clean text content"""
        try:
            # Remove unwanted elements
            self._remove_unwanted_elements(soup)
            
            # Extract different text elements
            text_data = {
                "headings": self._extract_headings(soup),
                "paragraphs": self._extract_paragraphs(soup),
                "lists": self._extract_lists(soup),
                "text_content": "",
                "word_count": 0,
                "reading_time": 0
            }
            
            # Get clean text content
            if self.config.include_selectors:
                # Extract from specific selectors
                text_content = ""
                for selector in self.config.include_selectors:
                    elements = soup.select(selector)
                    for element in elements:
                        text_content += element.get_text(separator=' ', strip=True) + " "
            else:
                # Extract all text
                text_content = soup.get_text(separator=' ', strip=True)
            
            # Clean and process text
            text_content = self._clean_text(text_content)
            
            # Apply length filters
            if len(text_content) < self.config.min_text_length:
                logger.warning(f"Text content too short: {len(text_content)} characters")
            elif len(text_content) > self.config.max_text_length:
                text_content = text_content[:self.config.max_text_length] + "..."
                logger.info(f"Text content truncated to {self.config.max_text_length} characters")
            
            text_data["text_content"] = text_content
            text_data["word_count"] = len(text_content.split())
            text_data["reading_time"] = max(1, text_data["word_count"] // 200)  # Assume 200 WPM
            
            return text_data
            
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            return {"text_content": "", "error": str(e)}
    
    async def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract image information"""
        images = []
        
        try:
            img_tags = soup.find_all('img')
            
            for img in img_tags:
                img_data = {
                    "src": self._resolve_url(img.get('src', ''), base_url),
                    "alt": img.get('alt', ''),
                    "title": img.get('title', ''),
                    "width": img.get('width', ''),
                    "height": img.get('height', ''),
                    "loading": img.get('loading', ''),
                    "srcset": img.get('srcset', '')
                }
                
                # Skip empty or invalid images
                if img_data["src"] and not img_data["src"].startswith('data:'):
                    images.append(img_data)
            
            # Also extract background images from CSS
            style_images = self._extract_css_background_images(soup, base_url)
            images.extend(style_images)
            
            return images
            
        except Exception as e:
            logger.error(f"Image extraction failed: {str(e)}")
            return []
    
    async def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract link information"""
        links = []
        
        try:
            link_tags = soup.find_all('a', href=True)
            
            for link in link_tags:
                href = link['href']
                resolved_url = self._resolve_url(href, base_url)
                
                link_data = {
                    "url": resolved_url,
                    "text": link.get_text(strip=True),
                    "title": link.get('title', ''),
                    "rel": link.get('rel', []),
                    "target": link.get('target', ''),
                    "type": self._classify_link_type(resolved_url, base_url)
                }
                
                # Skip empty links
                if link_data["url"] and link_data["url"] != base_url:
                    links.append(link_data)
            
            return links
            
        except Exception as e:
            logger.error(f"Link extraction failed: {str(e)}")
            return []
    
    async def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract page metadata"""
        metadata = {}
        
        try:
            # Basic meta tags
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                name = meta.get('name') or meta.get('property') or meta.get('http-equiv')
                content = meta.get('content')
                
                if name and content:
                    metadata[name] = content
            
            # Open Graph tags
            og_tags = {}
            for meta in soup.find_all('meta', property=lambda x: x and x.startswith('og:')):
                property_name = meta.get('property', '').replace('og:', '')
                content = meta.get('content', '')
                if property_name and content:
                    og_tags[property_name] = content
            
            if og_tags:
                metadata['open_graph'] = og_tags
            
            # Twitter Card tags
            twitter_tags = {}
            for meta in soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')}):
                name = meta.get('name', '').replace('twitter:', '')
                content = meta.get('content', '')
                if name and content:
                    twitter_tags[name] = content
            
            if twitter_tags:
                metadata['twitter_card'] = twitter_tags
            
            # Link tags (canonical, alternate, etc.)
            link_tags = {}
            for link in soup.find_all('link', rel=True):
                rel = link.get('rel')
                href = link.get('href')
                if rel and href:
                    rel_name = rel[0] if isinstance(rel, list) else rel
                    link_tags[rel_name] = href
            
            if link_tags:
                metadata['link_tags'] = link_tags
            
            return metadata
            
        except Exception as e:
            logger.error(f"Metadata extraction failed: {str(e)}")
            return {}
    
    async def _extract_structured_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract structured data (JSON-LD, microdata, RDFa)"""
        structured_data = {}
        
        try:
            # JSON-LD
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            if json_ld_scripts:
                import json
                json_ld_data = []
                for script in json_ld_scripts:
                    try:
                        if script.string:
                            data = json.loads(script.string.strip())
                            json_ld_data.append(data)
                    except json.JSONDecodeError as e:
                        logger.warning(f"Invalid JSON-LD: {str(e)}")
                
                if json_ld_data:
                    structured_data['json_ld'] = json_ld_data
            
            # Microdata
            microdata_items = soup.find_all(attrs={'itemscope': True})
            if microdata_items:
                microdata = []
                for item in microdata_items:
                    item_data = self._extract_microdata_item(item)
                    if item_data:
                        microdata.append(item_data)
                
                if microdata:
                    structured_data['microdata'] = microdata
            
            # RDFa (basic extraction)
            rdfa_items = soup.find_all(attrs={'typeof': True})
            if rdfa_items:
                rdfa_data = []
                for item in rdfa_items:
                    rdfa_item = {
                        'type': item.get('typeof', ''),
                        'properties': {}
                    }
                    
                    # Extract properties
                    props = item.find_all(attrs={'property': True})
                    for prop in props:
                        prop_name = prop.get('property')
                        prop_value = prop.get('content') or prop.get_text(strip=True)
                        if prop_name and prop_value:
                            rdfa_item['properties'][prop_name] = prop_value
                    
                    if rdfa_item['properties']:
                        rdfa_data.append(rdfa_item)
                
                if rdfa_data:
                    structured_data['rdfa'] = rdfa_data
            
            return structured_data
            
        except Exception as e:
            logger.error(f"Structured data extraction failed: {str(e)}")
            return {}
    
    async def _extract_forms(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract form information"""
        forms = []
        
        try:
            form_tags = soup.find_all('form')
            
            for form in form_tags:
                form_data = {
                    "action": self._resolve_url(form.get('action', ''), base_url),
                    "method": form.get('method', 'GET').upper(),
                    "enctype": form.get('enctype', ''),
                    "name": form.get('name', ''),
                    "id": form.get('id', ''),
                    "fields": []
                }
                
                # Extract form fields
                fields = form.find_all(['input', 'textarea', 'select'])
                for field in fields:
                    field_data = {
                        "tag": field.name,
                        "type": field.get('type', ''),
                        "name": field.get('name', ''),
                        "id": field.get('id', ''),
                        "placeholder": field.get('placeholder', ''),
                        "required": field.has_attr('required'),
                        "value": field.get('value', '')
                    }
                    
                    # For select fields, extract options
                    if field.name == 'select':
                        options = []
                        for option in field.find_all('option'):
                            options.append({
                                "value": option.get('value', ''),
                                "text": option.get_text(strip=True)
                            })
                        field_data["options"] = options
                    
                    form_data["fields"].append(field_data)
                
                forms.append(form_data)
            
            return forms
            
        except Exception as e:
            logger.error(f"Form extraction failed: {str(e)}")
            return []
    
    def _remove_unwanted_elements(self, soup: BeautifulSoup) -> None:
        """Remove unwanted HTML elements"""
        # Remove elements based on exclude selectors
        for selector in self.config.exclude_selectors:
            elements = soup.select(selector)
            for element in elements:
                element.decompose()
        
        # Remove common unwanted elements
        unwanted_tags = ['script', 'style', 'noscript', 'iframe']
        for tag in unwanted_tags:
            for element in soup.find_all(tag):
                element.decompose()
        
        # Remove comments
        for comment in soup.find_all(string=lambda text: isinstance(text, __import__('bs4').Comment)):
            comment.extract()
    
    def _extract_headings(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """Extract heading hierarchy"""
        headings = {}
        
        for level in range(1, 7):  # h1 to h6
            tag_name = f'h{level}'
            heading_tags = soup.find_all(tag_name)
            headings[tag_name] = [h.get_text(strip=True) for h in heading_tags if h.get_text(strip=True)]
        
        return headings
    
    def _extract_paragraphs(self, soup: BeautifulSoup) -> List[str]:
        """Extract paragraph content"""
        paragraphs = soup.find_all('p')
        return [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
    
    def _extract_lists(self, soup: BeautifulSoup) -> Dict[str, List[List[str]]]:
        """Extract list content"""
        lists = {"ordered": [], "unordered": []}
        
        # Ordered lists
        ol_tags = soup.find_all('ol')
        for ol in ol_tags:
            items = [li.get_text(strip=True) for li in ol.find_all('li') if li.get_text(strip=True)]
            if items:
                lists["ordered"].append(items)
        
        # Unordered lists
        ul_tags = soup.find_all('ul')
        for ul in ul_tags:
            items = [li.get_text(strip=True) for li in ul.find_all('li') if li.get_text(strip=True)]
            if items:
                lists["unordered"].append(items)
        
        return lists
    
    def _extract_css_background_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract background images from CSS"""
        images = []
        
        # Extract from style attributes
        elements_with_style = soup.find_all(attrs={'style': True})
        for element in elements_with_style:
            style = element.get('style', '')
            bg_images = re.findall(r'background-image:\s*url\(["\']?([^"\']+)["\']?\)', style)
            for img_url in bg_images:
                images.append({
                    "src": self._resolve_url(img_url, base_url),
                    "alt": "",
                    "title": "",
                    "type": "background"
                })
        
        return images
    
    def _extract_microdata_item(self, item: Tag) -> Optional[Dict[str, Any]]:
        """Extract microdata from an item"""
        try:
            item_data = {
                "type": item.get('itemtype', ''),
                "id": item.get('itemid', ''),
                "properties": {}
            }
            
            # Find all properties within this item
            props = item.find_all(attrs={'itemprop': True})
            for prop in props:
                prop_name = prop.get('itemprop')
                
                # Get property value
                if prop.name in ['meta', 'link']:
                    prop_value = prop.get('content') or prop.get('href', '')
                elif prop.name == 'time':
                    prop_value = prop.get('datetime') or prop.get_text(strip=True)
                else:
                    prop_value = prop.get_text(strip=True)
                
                if prop_name and prop_value:
                    # Handle multiple values for the same property
                    if prop_name in item_data['properties']:
                        if not isinstance(item_data['properties'][prop_name], list):
                            item_data['properties'][prop_name] = [item_data['properties'][prop_name]]
                        item_data['properties'][prop_name].append(prop_value)
                    else:
                        item_data['properties'][prop_name] = prop_value
            
            return item_data if item_data['properties'] else None
            
        except Exception as e:
            logger.warning(f"Microdata extraction error: {str(e)}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        # Remove control characters
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        return text
    
    def _resolve_url(self, url: str, base_url: str) -> str:
        """Resolve relative URLs to absolute URLs"""
        if not url:
            return ""
        
        try:
            return urljoin(base_url, url)
        except Exception:
            return url
    
    def _classify_link_type(self, url: str, base_url: str) -> str:
        """Classify link type (internal, external, email, tel, etc.)"""
        if not url:
            return "unknown"
        
        if url.startswith('mailto:'):
            return "email"
        elif url.startswith('tel:'):
            return "phone"
        elif url.startswith('#'):
            return "anchor"
        elif url.startswith('javascript:'):
            return "javascript"
        else:
            try:
                url_domain = urlparse(url).netloc
                base_domain = urlparse(base_url).netloc
                
                if url_domain == base_domain or not url_domain:
                    return "internal"
                else:
                    return "external"
            except Exception:
                return "unknown"
    
    def _calculate_content_stats(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate content statistics"""
        stats = {
            "total_text_length": len(content_data.get("text_content", "")),
            "word_count": content_data.get("word_count", 0),
            "reading_time_minutes": content_data.get("reading_time", 0),
            "image_count": len(content_data.get("images", [])),
            "link_count": len(content_data.get("links", [])),
            "form_count": len(content_data.get("forms", [])),
            "heading_count": sum(len(headings) for headings in content_data.get("headings", {}).values()),
            "paragraph_count": len(content_data.get("paragraphs", [])),
            "list_count": len(content_data.get("lists", {}).get("ordered", [])) + len(content_data.get("lists", {}).get("unordered", []))
        }
        
        # Content density score
        if stats["total_text_length"] > 0:
            stats["content_density"] = stats["word_count"] / (stats["total_text_length"] / 100)
        else:
            stats["content_density"] = 0
        
        return stats

