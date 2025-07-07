# Google Ads AI Platform - ScrapeGraphAI Package
# Website Analysis and Data Extraction System

"""
ScrapeGraphAI Package for Google Ads AI Platform

This package provides comprehensive website analysis and data extraction
capabilities for generating Google Ads campaigns automatically.

Modules:
    - config: Configuration settings for ScrapeGraphAI
    - website_analyzer: Main website analysis engine
    - content_extractor: Advanced content extraction
    - keyword_analyzer: Keyword analysis and extraction
    - business_info: Business information extraction
    - product_analyzer: Product and service analysis

Usage:
    from ai.scraper import WebsiteAnalyzer
    
    analyzer = WebsiteAnalyzer()
    result = await analyzer.analyze_website("https://example.com")
"""

from .config import ScrapeConfig
from .website_analyzer import WebsiteAnalyzer
from .content_extractor import ContentExtractor
from .keyword_analyzer import KeywordAnalyzer
from .business_info import BusinessInfoExtractor
from .product_analyzer import ProductAnalyzer

__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"

# Export main classes
__all__ = [
    "ScrapeConfig",
    "WebsiteAnalyzer", 
    "ContentExtractor",
    "KeywordAnalyzer",
    "BusinessInfoExtractor",
    "ProductAnalyzer"
]

# Package metadata
PACKAGE_INFO = {
    "name": "ai.scraper",
    "version": __version__,
    "description": "ScrapeGraphAI package for website analysis and Google Ads campaign generation",
    "author": __author__,
    "modules": [
        "config",
        "website_analyzer", 
        "content_extractor",
        "keyword_analyzer",
        "business_info",
        "product_analyzer"
    ]
}

