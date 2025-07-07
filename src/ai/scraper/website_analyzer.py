# Google Ads AI Platform - Website Analyzer
# Main website analysis engine using ScrapeGraphAI

import asyncio
import logging
from typing import Dict, Any, Optional, List, Tuple
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import time
from dataclasses import asdict

from .config import ScrapeConfig, AnalysisDepth, scrape_config
from .content_extractor import ContentExtractor
from .keyword_analyzer import KeywordAnalyzer
from .business_info import BusinessInfoExtractor
from .product_analyzer import ProductAnalyzer

logger = logging.getLogger(__name__)

class WebsiteAnalyzer:
    """
    Main website analysis engine using ScrapeGraphAI
    
    Provides comprehensive website analysis including:
    - Website structure analysis
    - Content extraction and processing
    - Business information extraction
    - Product/service analysis
    - SEO and metadata analysis
    """
    
    def __init__(self, config: Optional[ScrapeConfig] = None):
        """Initialize the website analyzer"""
        self.config = config or scrape_config.config
        self.session = requests.Session()
        self.session.headers.update(scrape_config.get_headers())
        
        # Initialize analyzers
        self.content_extractor = ContentExtractor(self.config)
        self.keyword_analyzer = KeywordAnalyzer(self.config)
        self.business_extractor = BusinessInfoExtractor(self.config)
        self.product_analyzer = ProductAnalyzer(self.config)
        
        # Analysis state
        self.analyzed_urls = set()
        self.analysis_results = {}
        
    async def analyze_website(self, url: str, analysis_depth: Optional[AnalysisDepth] = None) -> Dict[str, Any]:
        """
        Perform comprehensive website analysis
        
        Args:
            url: Website URL to analyze
            analysis_depth: Depth of analysis (basic, standard, deep)
            
        Returns:
            Dictionary containing complete analysis results
        """
        try:
            logger.info(f"Starting website analysis for: {url}")
            start_time = time.time()
            
            # Validate URL
            if not self._validate_url(url):
                raise ValueError(f"Invalid URL: {url}")
            
            # Get configuration for analysis depth
            if analysis_depth:
                config = scrape_config.get_config_for_depth(analysis_depth)
            else:
                config = self.config
            
            # Initialize analysis results
            analysis_results = {
                "url": url,
                "analysis_timestamp": time.time(),
                "analysis_depth": analysis_depth.value if analysis_depth else "standard",
                "status": "in_progress",
                "pages_analyzed": 0,
                "total_content_length": 0,
                "errors": [],
                "warnings": []
            }
            
            # Step 1: Analyze main page
            main_page_data = await self._analyze_single_page(url, config, is_main_page=True)
            analysis_results.update(main_page_data)
            
            # Step 2: Discover and analyze additional pages
            if config.max_pages > 1:
                additional_pages = await self._discover_important_pages(url, main_page_data, config)
                for page_url in additional_pages[:config.max_pages-1]:
                    try:
                        page_data = await self._analyze_single_page(page_url, config, is_main_page=False)
                        analysis_results = self._merge_page_data(analysis_results, page_data)
                        
                        # Delay between requests
                        await asyncio.sleep(config.delay_between_requests)
                        
                    except Exception as e:
                        logger.warning(f"Failed to analyze page {page_url}: {str(e)}")
                        analysis_results["warnings"].append(f"Failed to analyze page {page_url}: {str(e)}")
            
            # Step 3: Post-process and optimize results
            analysis_results = await self._post_process_results(analysis_results, config)
            
            # Step 4: Generate analysis summary
            analysis_results["summary"] = self._generate_analysis_summary(analysis_results)
            
            # Calculate analysis time
            analysis_results["analysis_duration"] = time.time() - start_time
            analysis_results["status"] = "completed"
            
            logger.info(f"Website analysis completed in {analysis_results['analysis_duration']:.2f} seconds")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Website analysis failed: {str(e)}")
            return {
                "url": url,
                "status": "failed",
                "error": str(e),
                "analysis_timestamp": time.time()
            }
    
    async def _analyze_single_page(self, url: str, config: ScrapeConfig, is_main_page: bool = False) -> Dict[str, Any]:
        """Analyze a single webpage"""
        try:
            # Fetch page content
            response = await self._fetch_page(url, config)
            if not response:
                return {"error": f"Failed to fetch page: {url}"}
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract basic page information
            page_data = {
                "url": url,
                "title": self._extract_title(soup),
                "meta_description": self._extract_meta_description(soup),
                "meta_keywords": self._extract_meta_keywords(soup),
                "language": self._detect_language(soup),
                "content_length": len(response.text),
                "status_code": response.status_code
            }
            
            # Extract content using ContentExtractor
            content_data = await self.content_extractor.extract_content(soup, url)
            page_data.update(content_data)
            
            # Extract keywords using KeywordAnalyzer
            if config.extract_keywords:
                keyword_data = await self.keyword_analyzer.analyze_keywords(
                    content_data.get("text_content", ""),
                    page_data.get("title", ""),
                    page_data.get("meta_description", "")
                )
                page_data["keywords"] = keyword_data
            
            # Extract business information (mainly for main page)
            if is_main_page and config.extract_business_info:
                business_data = await self.business_extractor.extract_business_info(soup, url)
                page_data["business_info"] = business_data
            
            # Extract products/services
            if config.extract_products:
                product_data = await self.product_analyzer.analyze_products(soup, url)
                page_data["products"] = product_data
            
            # Extract structured data
            structured_data = self._extract_structured_data(soup)
            if structured_data:
                page_data["structured_data"] = structured_data
            
            # Extract social media links
            social_links = self._extract_social_links(soup)
            if social_links:
                page_data["social_links"] = social_links
            
            # Calculate page quality score
            page_data["quality_score"] = self._calculate_page_quality(page_data)
            
            return page_data
            
        except Exception as e:
            logger.error(f"Failed to analyze page {url}: {str(e)}")
            return {"url": url, "error": str(e)}
    
    async def _fetch_page(self, url: str, config: ScrapeConfig) -> Optional[requests.Response]:
        """Fetch webpage content with retries"""
        for attempt in range(config.retry_attempts):
            try:
                response = self.session.get(
                    url,
                    timeout=config.timeout,
                    allow_redirects=True
                )
                
                if response.status_code == 200:
                    return response
                elif response.status_code in [301, 302, 303, 307, 308]:
                    # Handle redirects
                    redirect_url = response.headers.get('Location')
                    if redirect_url:
                        return await self._fetch_page(redirect_url, config)
                
                logger.warning(f"HTTP {response.status_code} for {url}")
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request failed for {url} (attempt {attempt + 1}): {str(e)}")
                
                if attempt < config.retry_attempts - 1:
                    await asyncio.sleep(config.retry_delay * (attempt + 1))
        
        return None
    
    async def _discover_important_pages(self, base_url: str, main_page_data: Dict[str, Any], config: ScrapeConfig) -> List[str]:
        """Discover important pages to analyze"""
        important_pages = set()
        
        # Get links from main page
        links = main_page_data.get("links", [])
        base_domain = urlparse(base_url).netloc
        
        # Priority pages to look for
        priority_keywords = [
            "about", "services", "products", "contact", "pricing",
            "portfolio", "team", "company", "solutions", "features"
        ]
        
        for link in links:
            try:
                # Convert relative URLs to absolute
                full_url = urljoin(base_url, link)
                parsed_url = urlparse(full_url)
                
                # Only analyze pages from the same domain
                if parsed_url.netloc != base_domain:
                    continue
                
                # Skip certain file types
                if any(full_url.lower().endswith(ext) for ext in ['.pdf', '.jpg', '.png', '.gif', '.zip', '.doc']):
                    continue
                
                # Prioritize important pages
                url_lower = full_url.lower()
                if any(keyword in url_lower for keyword in priority_keywords):
                    important_pages.add(full_url)
                elif len(important_pages) < config.max_pages - 1:
                    important_pages.add(full_url)
                
                if len(important_pages) >= config.max_pages - 1:
                    break
                    
            except Exception as e:
                logger.warning(f"Error processing link {link}: {str(e)}")
        
        return list(important_pages)
    
    def _merge_page_data(self, main_results: Dict[str, Any], page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Merge data from additional pages into main results"""
        # Merge text content
        if "text_content" in page_data:
            main_results.setdefault("additional_content", []).append(page_data["text_content"])
        
        # Merge keywords
        if "keywords" in page_data:
            main_keywords = main_results.setdefault("keywords", {})
            page_keywords = page_data["keywords"]
            
            # Merge keyword lists
            for key in ["primary_keywords", "secondary_keywords", "long_tail_keywords"]:
                if key in page_keywords:
                    main_keywords.setdefault(key, []).extend(page_keywords[key])
        
        # Merge products
        if "products" in page_data:
            main_results.setdefault("products", []).extend(page_data["products"])
        
        # Update counters
        main_results["pages_analyzed"] = main_results.get("pages_analyzed", 0) + 1
        main_results["total_content_length"] += page_data.get("content_length", 0)
        
        return main_results
    
    async def _post_process_results(self, results: Dict[str, Any], config: ScrapeConfig) -> Dict[str, Any]:
        """Post-process and optimize analysis results"""
        # Deduplicate and rank keywords
        if "keywords" in results:
            results["keywords"] = await self.keyword_analyzer.optimize_keywords(results["keywords"])
        
        # Deduplicate products
        if "products" in results:
            results["products"] = self._deduplicate_products(results["products"])
        
        # Generate content summary
        if "text_content" in results:
            results["content_summary"] = self._generate_content_summary(results["text_content"])
        
        # Calculate overall quality score
        results["overall_quality_score"] = self._calculate_overall_quality(results)
        
        # Determine website type
        results["website_type"] = self._determine_website_type(results)
        
        # Generate SEO insights
        results["seo_insights"] = self._generate_seo_insights(results)
        
        return results
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        title_tag = soup.find('title')
        return title_tag.get_text().strip() if title_tag else ""
    
    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description"""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        return meta_desc.get('content', '').strip() if meta_desc else ""
    
    def _extract_meta_keywords(self, soup: BeautifulSoup) -> str:
        """Extract meta keywords"""
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        return meta_keywords.get('content', '').strip() if meta_keywords else ""
    
    def _detect_language(self, soup: BeautifulSoup) -> str:
        """Detect page language"""
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            return html_tag.get('lang')
        
        meta_lang = soup.find('meta', attrs={'http-equiv': 'content-language'})
        if meta_lang:
            return meta_lang.get('content', 'en')
        
        return 'en'  # Default to English
    
    def _extract_structured_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract structured data (JSON-LD, microdata)"""
        structured_data = {}
        
        # Extract JSON-LD
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        if json_ld_scripts:
            import json
            json_ld_data = []
            for script in json_ld_scripts:
                try:
                    data = json.loads(script.string)
                    json_ld_data.append(data)
                except json.JSONDecodeError:
                    continue
            if json_ld_data:
                structured_data['json_ld'] = json_ld_data
        
        # Extract microdata
        microdata_items = soup.find_all(attrs={'itemscope': True})
        if microdata_items:
            microdata = []
            for item in microdata_items:
                item_data = {
                    'type': item.get('itemtype', ''),
                    'properties': {}
                }
                props = item.find_all(attrs={'itemprop': True})
                for prop in props:
                    prop_name = prop.get('itemprop')
                    prop_value = prop.get('content') or prop.get_text().strip()
                    item_data['properties'][prop_name] = prop_value
                microdata.append(item_data)
            structured_data['microdata'] = microdata
        
        return structured_data
    
    def _extract_social_links(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract social media links"""
        social_links = {}
        social_domains = {
            'facebook.com': 'facebook',
            'twitter.com': 'twitter',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'youtube.com': 'youtube',
            'tiktok.com': 'tiktok'
        }
        
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            for domain, platform in social_domains.items():
                if domain in href:
                    social_links[platform] = href
                    break
        
        return social_links
    
    def _calculate_page_quality(self, page_data: Dict[str, Any]) -> float:
        """Calculate page quality score (0-100)"""
        score = 0
        
        # Title quality (20 points)
        title = page_data.get("title", "")
        if title:
            if 10 <= len(title) <= 60:
                score += 20
            elif len(title) > 0:
                score += 10
        
        # Meta description quality (15 points)
        meta_desc = page_data.get("meta_description", "")
        if meta_desc:
            if 120 <= len(meta_desc) <= 160:
                score += 15
            elif len(meta_desc) > 0:
                score += 8
        
        # Content quality (25 points)
        content_length = page_data.get("content_length", 0)
        if content_length > 1000:
            score += 25
        elif content_length > 300:
            score += 15
        elif content_length > 100:
            score += 8
        
        # Keywords presence (20 points)
        if page_data.get("keywords"):
            score += 20
        
        # Structured data (10 points)
        if page_data.get("structured_data"):
            score += 10
        
        # Social links (10 points)
        if page_data.get("social_links"):
            score += 10
        
        return min(score, 100)
    
    def _calculate_overall_quality(self, results: Dict[str, Any]) -> float:
        """Calculate overall website quality score"""
        scores = []
        
        # Main page quality
        if "quality_score" in results:
            scores.append(results["quality_score"])
        
        # Business information completeness
        business_info = results.get("business_info", {})
        business_score = 0
        if business_info.get("name"):
            business_score += 25
        if business_info.get("description"):
            business_score += 25
        if business_info.get("contact_info"):
            business_score += 25
        if business_info.get("address"):
            business_score += 25
        scores.append(business_score)
        
        # Content richness
        content_score = 0
        if results.get("pages_analyzed", 0) > 3:
            content_score += 30
        if results.get("total_content_length", 0) > 5000:
            content_score += 30
        if results.get("products"):
            content_score += 40
        scores.append(content_score)
        
        return sum(scores) / len(scores) if scores else 0
    
    def _determine_website_type(self, results: Dict[str, Any]) -> str:
        """Determine the type of website"""
        content = results.get("text_content", "").lower()
        title = results.get("title", "").lower()
        
        # E-commerce indicators
        ecommerce_keywords = ["shop", "buy", "cart", "checkout", "product", "price", "order"]
        if any(keyword in content or keyword in title for keyword in ecommerce_keywords):
            return "ecommerce"
        
        # Blog indicators
        blog_keywords = ["blog", "article", "post", "news", "read more"]
        if any(keyword in content or keyword in title for keyword in blog_keywords):
            return "blog"
        
        # Restaurant indicators
        restaurant_keywords = ["menu", "restaurant", "food", "dining", "reservation"]
        if any(keyword in content or keyword in title for keyword in restaurant_keywords):
            return "restaurant"
        
        # Service business indicators
        service_keywords = ["service", "consultation", "contact us", "about us"]
        if any(keyword in content or keyword in title for keyword in service_keywords):
            return "service"
        
        return "general"
    
    def _generate_content_summary(self, content: str) -> str:
        """Generate a summary of the content"""
        if not content or len(content) < 100:
            return ""
        
        # Simple extractive summary - take first few sentences
        sentences = content.split('. ')
        summary_sentences = sentences[:3]
        summary = '. '.join(summary_sentences)
        
        if len(summary) > 300:
            summary = summary[:300] + "..."
        
        return summary
    
    def _generate_seo_insights(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate SEO insights and recommendations"""
        insights = {
            "recommendations": [],
            "strengths": [],
            "issues": []
        }
        
        # Title analysis
        title = results.get("title", "")
        if not title:
            insights["issues"].append("Missing page title")
        elif len(title) > 60:
            insights["issues"].append("Page title too long (>60 characters)")
        elif len(title) < 30:
            insights["recommendations"].append("Consider making page title longer for better SEO")
        else:
            insights["strengths"].append("Page title length is optimal")
        
        # Meta description analysis
        meta_desc = results.get("meta_description", "")
        if not meta_desc:
            insights["issues"].append("Missing meta description")
        elif len(meta_desc) > 160:
            insights["issues"].append("Meta description too long (>160 characters)")
        elif len(meta_desc) < 120:
            insights["recommendations"].append("Consider expanding meta description")
        else:
            insights["strengths"].append("Meta description length is optimal")
        
        # Content analysis
        content_length = results.get("total_content_length", 0)
        if content_length < 300:
            insights["issues"].append("Very little content on the website")
        elif content_length > 1000:
            insights["strengths"].append("Good amount of content")
        
        # Keywords analysis
        keywords = results.get("keywords", {})
        if not keywords.get("primary_keywords"):
            insights["issues"].append("No clear primary keywords identified")
        else:
            insights["strengths"].append("Primary keywords identified")
        
        # Structured data
        if results.get("structured_data"):
            insights["strengths"].append("Structured data present")
        else:
            insights["recommendations"].append("Add structured data for better search visibility")
        
        return insights
    
    def _generate_analysis_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive analysis summary"""
        return {
            "website_type": results.get("website_type", "unknown"),
            "pages_analyzed": results.get("pages_analyzed", 0),
            "content_quality": "high" if results.get("overall_quality_score", 0) > 70 else "medium" if results.get("overall_quality_score", 0) > 40 else "low",
            "has_business_info": bool(results.get("business_info")),
            "has_products": bool(results.get("products")),
            "keyword_count": len(results.get("keywords", {}).get("primary_keywords", [])),
            "seo_score": results.get("overall_quality_score", 0),
            "analysis_duration": results.get("analysis_duration", 0),
            "main_topics": results.get("keywords", {}).get("primary_keywords", [])[:5]
        }
    
    def _deduplicate_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate products"""
        seen_products = set()
        unique_products = []
        
        for product in products:
            product_key = (product.get("name", ""), product.get("price", ""))
            if product_key not in seen_products:
                seen_products.add(product_key)
                unique_products.append(product)
        
        return unique_products
    
    def _validate_url(self, url: str) -> bool:
        """Validate URL format"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False
    
    def get_analysis_status(self) -> Dict[str, Any]:
        """Get current analysis status"""
        return {
            "analyzed_urls": len(self.analyzed_urls),
            "active_sessions": len(self.analysis_results),
            "config": asdict(self.config)
        }

