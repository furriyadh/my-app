# Google Ads AI Platform - Generator Package
# Google Gemini AI Content Generation System

"""
Generator Package for Google Ads AI Platform

This package provides comprehensive AI-powered content generation
capabilities using Google Gemini for creating Google Ads campaigns.

Modules:
    - gemini_config: Configuration settings for Google Gemini
    - campaign_generator: Main campaign generation engine
    - text_generator: Advanced text generation
    - headline_creator: Headline creation and optimization
    - description_creator: Description generation
    - keyword_generator: Keyword generation and expansion
    - campaign_types: Different campaign type handlers

Usage:
    from ai.generator import CampaignGenerator
    
    generator = CampaignGenerator()
    campaign = await generator.generate_campaign(website_data)
"""

from .gemini_config import GeminiConfig
from .campaign_generator import CampaignGenerator
from .text_generator import TextGenerator
from .headline_creator import HeadlineCreator
from .description_creator import DescriptionCreator
from .keyword_generator import KeywordGenerator
from .campaign_types import CampaignTypeManager

__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"

# Export main classes
__all__ = [
    "GeminiConfig",
    "CampaignGenerator",
    "TextGenerator", 
    "HeadlineCreator",
    "DescriptionCreator",
    "KeywordGenerator",
    "CampaignTypeManager"
]

# Package metadata
PACKAGE_INFO = {
    "name": "ai.generator",
    "version": __version__,
    "description": "Google Gemini AI content generation package for Google Ads campaigns",
    "author": __author__,
    "modules": [
        "gemini_config",
        "campaign_generator",
        "text_generator",
        "headline_creator", 
        "description_creator",
        "keyword_generator",
        "campaign_types"
    ]
}

