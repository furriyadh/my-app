# Google Ads AI Platform - Google Gemini Configuration
# Configuration settings and management for Google Gemini AI

import os
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import google.generativeai as genai

logger = logging.getLogger(__name__)

class GeminiModel(Enum):
    """Available Gemini models"""
    GEMINI_PRO = "gemini-pro"
    GEMINI_PRO_VISION = "gemini-pro-vision"
    GEMINI_1_5_PRO = "gemini-1.5-pro"
    GEMINI_1_5_FLASH = "gemini-1.5-flash"

class ContentType(Enum):
    """Content generation types"""
    HEADLINES = "headlines"
    DESCRIPTIONS = "descriptions"
    KEYWORDS = "keywords"
    AD_COPY = "ad_copy"
    CAMPAIGN_STRATEGY = "campaign_strategy"
    LANDING_PAGE_CONTENT = "landing_page_content"

class LanguageCode(Enum):
    """Supported languages"""
    ENGLISH = "en"
    ARABIC = "ar"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    ITALIAN = "it"
    PORTUGUESE = "pt"
    RUSSIAN = "ru"
    CHINESE = "zh"
    JAPANESE = "ja"

@dataclass
class GenerationSettings:
    """Settings for content generation"""
    temperature: float = 0.7
    top_p: float = 0.8
    top_k: int = 40
    max_output_tokens: int = 2048
    candidate_count: int = 1
    stop_sequences: List[str] = field(default_factory=list)

@dataclass
class SafetySettings:
    """Safety settings for content generation"""
    harassment_threshold: str = "BLOCK_MEDIUM_AND_ABOVE"
    hate_speech_threshold: str = "BLOCK_MEDIUM_AND_ABOVE"
    sexually_explicit_threshold: str = "BLOCK_MEDIUM_AND_ABOVE"
    dangerous_content_threshold: str = "BLOCK_MEDIUM_AND_ABOVE"

class GeminiConfig:
    """
    Google Gemini AI configuration and management
    
    Handles all configuration settings, API initialization,
    and model management for Google Gemini AI integration.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini configuration"""
        self.api_key = api_key or os.getenv('GOOGLE_GEMINI_API_KEY')
        self.is_initialized = False
        
        # Default settings
        self.default_model = GeminiModel.GEMINI_PRO
        self.default_language = LanguageCode.ENGLISH
        
        # Generation settings for different content types
        self.content_settings = {
            ContentType.HEADLINES: GenerationSettings(
                temperature=0.8,
                top_p=0.9,
                max_output_tokens=100,
                candidate_count=5
            ),
            ContentType.DESCRIPTIONS: GenerationSettings(
                temperature=0.7,
                top_p=0.8,
                max_output_tokens=300,
                candidate_count=3
            ),
            ContentType.KEYWORDS: GenerationSettings(
                temperature=0.6,
                top_p=0.7,
                max_output_tokens=500,
                candidate_count=1
            ),
            ContentType.AD_COPY: GenerationSettings(
                temperature=0.8,
                top_p=0.9,
                max_output_tokens=200,
                candidate_count=3
            ),
            ContentType.CAMPAIGN_STRATEGY: GenerationSettings(
                temperature=0.5,
                top_p=0.7,
                max_output_tokens=1000,
                candidate_count=1
            ),
            ContentType.LANDING_PAGE_CONTENT: GenerationSettings(
                temperature=0.7,
                top_p=0.8,
                max_output_tokens=2000,
                candidate_count=1
            )
        }
        
        # Safety settings
        self.safety_settings = SafetySettings()
        
        # Model configurations
        self.model_configs = {
            GeminiModel.GEMINI_PRO: {
                "name": "gemini-pro",
                "description": "Best for text generation tasks",
                "max_tokens": 30720,
                "supports_vision": False
            },
            GeminiModel.GEMINI_PRO_VISION: {
                "name": "gemini-pro-vision",
                "description": "Best for multimodal tasks with images",
                "max_tokens": 12288,
                "supports_vision": True
            },
            GeminiModel.GEMINI_1_5_PRO: {
                "name": "gemini-1.5-pro",
                "description": "Latest pro model with enhanced capabilities",
                "max_tokens": 1048576,
                "supports_vision": True
            },
            GeminiModel.GEMINI_1_5_FLASH: {
                "name": "gemini-1.5-flash",
                "description": "Fast model for quick responses",
                "max_tokens": 1048576,
                "supports_vision": True
            }
        }
        
        # Language-specific prompts
        self.language_prompts = {
            LanguageCode.ENGLISH: {
                "system_prompt": "You are an expert Google Ads copywriter and marketing strategist.",
                "tone_instructions": "Use professional, persuasive, and engaging tone.",
                "format_instructions": "Follow Google Ads best practices and character limits."
            },
            LanguageCode.ARABIC: {
                "system_prompt": "أنت خبير في كتابة إعلانات Google Ads واستراتيجية التسويق.",
                "tone_instructions": "استخدم نبرة مهنية ومقنعة وجذابة.",
                "format_instructions": "اتبع أفضل ممارسات Google Ads وحدود الأحرف."
            }
        }
        
        # Initialize if API key is available
        if self.api_key:
            self.initialize()
    
    def initialize(self) -> bool:
        """Initialize Google Gemini AI"""
        try:
            if not self.api_key:
                logger.error("Google Gemini API key not provided")
                return False
            
            # Configure the API
            genai.configure(api_key=self.api_key)
            
            # Test the connection
            model = genai.GenerativeModel(self.default_model.value)
            test_response = model.generate_content("Test connection")
            
            if test_response:
                self.is_initialized = True
                logger.info("Google Gemini AI initialized successfully")
                return True
            else:
                logger.error("Failed to get response from Gemini API")
                return False
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Gemini AI: {str(e)}")
            return False
    
    def get_model(self, model_type: GeminiModel = None) -> genai.GenerativeModel:
        """Get configured Gemini model"""
        try:
            if not self.is_initialized:
                raise Exception("Gemini not initialized. Call initialize() first.")
            
            model_type = model_type or self.default_model
            model_name = model_type.value
            
            # Create generation config
            generation_config = genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048,
                candidate_count=1
            )
            
            # Create safety settings
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH", 
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
            
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to get Gemini model: {str(e)}")
            raise
    
    def get_generation_config(self, content_type: ContentType) -> genai.types.GenerationConfig:
        """Get generation configuration for specific content type"""
        settings = self.content_settings.get(content_type, GenerationSettings())
        
        return genai.types.GenerationConfig(
            temperature=settings.temperature,
            top_p=settings.top_p,
            top_k=settings.top_k,
            max_output_tokens=settings.max_output_tokens,
            candidate_count=settings.candidate_count,
            stop_sequences=settings.stop_sequences
        )
    
    def get_system_prompt(self, language: LanguageCode = None) -> str:
        """Get system prompt for specified language"""
        language = language or self.default_language
        return self.language_prompts.get(language, {}).get("system_prompt", "")
    
    def get_tone_instructions(self, language: LanguageCode = None) -> str:
        """Get tone instructions for specified language"""
        language = language or self.default_language
        return self.language_prompts.get(language, {}).get("tone_instructions", "")
    
    def get_format_instructions(self, language: LanguageCode = None) -> str:
        """Get format instructions for specified language"""
        language = language or self.default_language
        return self.language_prompts.get(language, {}).get("format_instructions", "")
    
    def update_settings(self, content_type: ContentType, **kwargs) -> None:
        """Update generation settings for content type"""
        if content_type not in self.content_settings:
            self.content_settings[content_type] = GenerationSettings()
        
        settings = self.content_settings[content_type]
        
        for key, value in kwargs.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
    
    def get_model_info(self, model_type: GeminiModel = None) -> Dict[str, Any]:
        """Get information about a specific model"""
        model_type = model_type or self.default_model
        return self.model_configs.get(model_type, {})
    
    def list_available_models(self) -> List[Dict[str, Any]]:
        """List all available Gemini models"""
        return [
            {
                "model": model.value,
                "enum": model,
                **config
            }
            for model, config in self.model_configs.items()
        ]
    
    def validate_api_key(self) -> bool:
        """Validate the API key"""
        try:
            if not self.api_key:
                return False
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(self.default_model.value)
            response = model.generate_content("Hello")
            
            return bool(response and response.text)
            
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return False
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics (placeholder for future implementation)"""
        return {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_tokens_used": 0,
            "average_response_time": 0.0
        }
    
    def create_prompt_template(self, 
                             content_type: ContentType,
                             language: LanguageCode = None,
                             custom_instructions: str = "") -> str:
        """Create a prompt template for specific content type"""
        language = language or self.default_language
        
        system_prompt = self.get_system_prompt(language)
        tone_instructions = self.get_tone_instructions(language)
        format_instructions = self.get_format_instructions(language)
        
        template = f"""
{system_prompt}

{tone_instructions}

{format_instructions}

Content Type: {content_type.value}

{custom_instructions}

Please generate content based on the following input:
{{input_data}}

Requirements:
{{requirements}}

Output Format:
{{output_format}}
"""
        
        return template.strip()
    
    def get_character_limits(self) -> Dict[str, Dict[str, int]]:
        """Get Google Ads character limits for different ad types"""
        return {
            "search_ads": {
                "headlines": 30,  # per headline
                "descriptions": 90,  # per description
                "max_headlines": 15,
                "max_descriptions": 4
            },
            "display_ads": {
                "short_headline": 30,
                "long_headline": 90,
                "description": 90,
                "business_name": 25
            },
            "responsive_search_ads": {
                "headlines": 30,
                "descriptions": 90,
                "max_headlines": 15,
                "max_descriptions": 4
            },
            "video_ads": {
                "headline": 100,
                "description": 35
            }
        }
    
    def validate_content_length(self, content: str, content_type: str, ad_type: str = "search_ads") -> bool:
        """Validate content length against Google Ads limits"""
        limits = self.get_character_limits()
        
        if ad_type not in limits:
            return True
        
        type_limits = limits[ad_type]
        
        if content_type in type_limits:
            max_length = type_limits[content_type]
            return len(content) <= max_length
        
        return True
    
    def get_best_practices(self, content_type: ContentType) -> List[str]:
        """Get best practices for specific content type"""
        practices = {
            ContentType.HEADLINES: [
                "Include primary keywords",
                "Use action words and emotional triggers",
                "Keep under 30 characters",
                "Test multiple variations",
                "Include brand name when relevant",
                "Use numbers and statistics when possible"
            ],
            ContentType.DESCRIPTIONS: [
                "Highlight unique value proposition",
                "Include call-to-action",
                "Keep under 90 characters",
                "Mention benefits, not just features",
                "Use relevant keywords naturally",
                "Create urgency when appropriate"
            ],
            ContentType.KEYWORDS: [
                "Include exact match keywords",
                "Add phrase match variations",
                "Consider broad match for discovery",
                "Include negative keywords",
                "Focus on commercial intent",
                "Group by theme and relevance"
            ]
        }
        
        return practices.get(content_type, [])
    
    def export_config(self) -> Dict[str, Any]:
        """Export current configuration"""
        return {
            "default_model": self.default_model.value,
            "default_language": self.default_language.value,
            "is_initialized": self.is_initialized,
            "content_settings": {
                content_type.value: {
                    "temperature": settings.temperature,
                    "top_p": settings.top_p,
                    "top_k": settings.top_k,
                    "max_output_tokens": settings.max_output_tokens,
                    "candidate_count": settings.candidate_count
                }
                for content_type, settings in self.content_settings.items()
            }
        }
    
    def import_config(self, config_data: Dict[str, Any]) -> None:
        """Import configuration from dictionary"""
        try:
            if "default_model" in config_data:
                self.default_model = GeminiModel(config_data["default_model"])
            
            if "default_language" in config_data:
                self.default_language = LanguageCode(config_data["default_language"])
            
            if "content_settings" in config_data:
                for content_type_str, settings_data in config_data["content_settings"].items():
                    content_type = ContentType(content_type_str)
                    settings = GenerationSettings(**settings_data)
                    self.content_settings[content_type] = settings
            
            logger.info("Configuration imported successfully")
            
        except Exception as e:
            logger.error(f"Failed to import configuration: {str(e)}")
            raise

