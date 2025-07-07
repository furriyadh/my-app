# Google Ads AI Platform - ScrapeGraphAI Configuration
# Configuration settings for website analysis and data extraction

import os
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

class AnalysisDepth(Enum):
    """Analysis depth levels"""
    BASIC = "basic"
    STANDARD = "standard" 
    DEEP = "deep"

class ContentType(Enum):
    """Content types to extract"""
    TEXT = "text"
    IMAGES = "images"
    LINKS = "links"
    METADATA = "metadata"
    STRUCTURED_DATA = "structured_data"
    FORMS = "forms"

@dataclass
class ScrapeConfig:
    """ScrapeGraphAI configuration settings"""
    
    # Basic Settings
    timeout: int = 30
    max_pages: int = 10
    delay_between_requests: float = 2.0
    user_agent: str = "GoogleAdsAI-Bot/1.0"
    
    # Analysis Settings
    analysis_depth: AnalysisDepth = AnalysisDepth.STANDARD
    content_types: List[ContentType] = None
    extract_keywords: bool = True
    extract_business_info: bool = True
    extract_products: bool = True
    
    # Performance Settings
    max_concurrent_requests: int = 3
    retry_attempts: int = 3
    retry_delay: float = 1.0
    
    # Content Filtering
    min_text_length: int = 50
    max_text_length: int = 10000
    exclude_selectors: List[str] = None
    include_selectors: List[str] = None
    
    # Language Settings
    primary_language: str = "auto"
    fallback_language: str = "en"
    
    # Output Settings
    clean_html: bool = True
    extract_metadata: bool = True
    generate_summary: bool = True
    
    def __post_init__(self):
        """Initialize default values after creation"""
        if self.content_types is None:
            self.content_types = [
                ContentType.TEXT,
                ContentType.METADATA,
                ContentType.STRUCTURED_DATA
            ]
        
        if self.exclude_selectors is None:
            self.exclude_selectors = [
                "script",
                "style", 
                "nav",
                "footer",
                ".advertisement",
                ".ads",
                ".popup"
            ]
        
        if self.include_selectors is None:
            self.include_selectors = [
                "main",
                "article",
                ".content",
                ".main-content",
                "h1, h2, h3",
                "p",
                ".description"
            ]

class ScrapeGraphAIConfig:
    """Advanced ScrapeGraphAI configuration manager"""
    
    def __init__(self):
        self.config = ScrapeConfig()
        self._load_environment_settings()
    
    def _load_environment_settings(self):
        """Load settings from environment variables"""
        # Timeout settings
        if os.getenv("SCRAPE_TIMEOUT"):
            self.config.timeout = int(os.getenv("SCRAPE_TIMEOUT"))
        
        if os.getenv("SCRAPE_MAX_PAGES"):
            self.config.max_pages = int(os.getenv("SCRAPE_MAX_PAGES"))
        
        if os.getenv("SCRAPE_DELAY"):
            self.config.delay_between_requests = float(os.getenv("SCRAPE_DELAY"))
        
        # Analysis depth
        if os.getenv("SCRAPE_ANALYSIS_DEPTH"):
            depth = os.getenv("SCRAPE_ANALYSIS_DEPTH").lower()
            if depth in [e.value for e in AnalysisDepth]:
                self.config.analysis_depth = AnalysisDepth(depth)
        
        # Language settings
        if os.getenv("SCRAPE_PRIMARY_LANGUAGE"):
            self.config.primary_language = os.getenv("SCRAPE_PRIMARY_LANGUAGE")
    
    def get_config_for_depth(self, depth: AnalysisDepth) -> ScrapeConfig:
        """Get configuration optimized for specific analysis depth"""
        config = ScrapeConfig()
        
        if depth == AnalysisDepth.BASIC:
            config.max_pages = 3
            config.timeout = 15
            config.content_types = [ContentType.TEXT, ContentType.METADATA]
            config.extract_products = False
            
        elif depth == AnalysisDepth.STANDARD:
            config.max_pages = 7
            config.timeout = 30
            config.content_types = [
                ContentType.TEXT,
                ContentType.METADATA,
                ContentType.STRUCTURED_DATA
            ]
            
        elif depth == AnalysisDepth.DEEP:
            config.max_pages = 15
            config.timeout = 60
            config.content_types = [
                ContentType.TEXT,
                ContentType.IMAGES,
                ContentType.LINKS,
                ContentType.METADATA,
                ContentType.STRUCTURED_DATA,
                ContentType.FORMS
            ]
        
        return config
    
    def get_config_for_website_type(self, website_type: str) -> ScrapeConfig:
        """Get configuration optimized for specific website type"""
        config = ScrapeConfig()
        
        if website_type.lower() in ["ecommerce", "shop", "store"]:
            config.extract_products = True
            config.max_pages = 12
            config.include_selectors.extend([
                ".product",
                ".item",
                ".price",
                ".product-title",
                ".product-description"
            ])
            
        elif website_type.lower() in ["blog", "news", "article"]:
            config.max_pages = 8
            config.include_selectors.extend([
                "article",
                ".post",
                ".entry",
                ".blog-content"
            ])
            
        elif website_type.lower() in ["business", "corporate", "company"]:
            config.extract_business_info = True
            config.max_pages = 6
            config.include_selectors.extend([
                ".about",
                ".services",
                ".contact",
                ".company-info"
            ])
            
        elif website_type.lower() in ["restaurant", "food", "dining"]:
            config.extract_business_info = True
            config.include_selectors.extend([
                ".menu",
                ".hours",
                ".location",
                ".contact"
            ])
        
        return config
    
    def validate_config(self, config: ScrapeConfig) -> bool:
        """Validate configuration settings"""
        if config.timeout <= 0 or config.timeout > 300:
            return False
        
        if config.max_pages <= 0 or config.max_pages > 50:
            return False
        
        if config.delay_between_requests < 0 or config.delay_between_requests > 10:
            return False
        
        if config.max_concurrent_requests <= 0 or config.max_concurrent_requests > 10:
            return False
        
        return True
    
    def get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests"""
        return {
            "User-Agent": self.config.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": f"{self.config.primary_language},{self.config.fallback_language};q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
    
    def get_selenium_options(self) -> Dict[str, Any]:
        """Get Selenium WebDriver options"""
        return {
            "headless": True,
            "no_sandbox": True,
            "disable_dev_shm_usage": True,
            "disable_gpu": True,
            "window_size": "1920,1080",
            "user_agent": self.config.user_agent,
            "timeout": self.config.timeout,
            "page_load_strategy": "normal"
        }

# Global configuration instance
scrape_config = ScrapeGraphAIConfig()

# Predefined configurations for common use cases
BASIC_CONFIG = scrape_config.get_config_for_depth(AnalysisDepth.BASIC)
STANDARD_CONFIG = scrape_config.get_config_for_depth(AnalysisDepth.STANDARD)
DEEP_CONFIG = scrape_config.get_config_for_depth(AnalysisDepth.DEEP)

# Website type specific configurations
ECOMMERCE_CONFIG = scrape_config.get_config_for_website_type("ecommerce")
BLOG_CONFIG = scrape_config.get_config_for_website_type("blog")
BUSINESS_CONFIG = scrape_config.get_config_for_website_type("business")
RESTAURANT_CONFIG = scrape_config.get_config_for_website_type("restaurant")

