# Google Ads AI Platform - Text Generator
# Advanced text generation using Google Gemini AI

import logging
import asyncio
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json

from .gemini_config import GeminiConfig, ContentType, LanguageCode, GeminiModel

logger = logging.getLogger(__name__)

class TextGenerator:
    """
    Advanced text generation engine using Google Gemini AI
    
    Provides comprehensive text generation capabilities for:
    - Ad copy and marketing content
    - Headlines and descriptions
    - Landing page content
    - Email marketing content
    - Social media posts
    - Product descriptions
    """
    
    def __init__(self, config: GeminiConfig = None):
        """Initialize text generator"""
        self.config = config or GeminiConfig()
        
        # Text generation templates
        self.templates = {
            "ad_headline": {
                "structure": "{hook} {benefit} {call_to_action}",
                "max_length": 30,
                "tone": "persuasive",
                "elements": ["hook", "benefit", "urgency", "brand"]
            },
            "ad_description": {
                "structure": "{value_proposition} {features} {call_to_action}",
                "max_length": 90,
                "tone": "informative",
                "elements": ["value_proposition", "features", "benefits", "cta"]
            },
            "landing_page_headline": {
                "structure": "{problem} {solution} {outcome}",
                "max_length": 60,
                "tone": "compelling",
                "elements": ["problem", "solution", "benefit", "proof"]
            },
            "product_description": {
                "structure": "{overview} {features} {benefits} {specifications}",
                "max_length": 300,
                "tone": "descriptive",
                "elements": ["overview", "features", "benefits", "specs"]
            }
        }
        
        # Tone variations
        self.tone_styles = {
            "professional": {
                "adjectives": ["expert", "professional", "reliable", "trusted", "proven"],
                "verbs": ["deliver", "provide", "ensure", "guarantee", "achieve"],
                "phrases": ["industry-leading", "best-in-class", "comprehensive solution"]
            },
            "friendly": {
                "adjectives": ["friendly", "helpful", "easy", "simple", "convenient"],
                "verbs": ["help", "assist", "support", "guide", "make easy"],
                "phrases": ["we're here to help", "made simple", "hassle-free"]
            },
            "urgent": {
                "adjectives": ["limited", "exclusive", "immediate", "instant", "fast"],
                "verbs": ["act now", "don't wait", "hurry", "grab", "secure"],
                "phrases": ["limited time", "act fast", "don't miss out"]
            },
            "luxury": {
                "adjectives": ["premium", "exclusive", "luxury", "elite", "sophisticated"],
                "verbs": ["experience", "indulge", "enjoy", "discover", "elevate"],
                "phrases": ["premium experience", "luxury service", "exclusive access"]
            }
        }
        
        # Industry-specific vocabulary
        self.industry_vocabulary = {
            "healthcare": {
                "keywords": ["health", "wellness", "care", "treatment", "medical", "doctor"],
                "benefits": ["improve health", "feel better", "peace of mind", "expert care"],
                "ctas": ["schedule appointment", "get consultation", "learn more", "contact us"]
            },
            "technology": {
                "keywords": ["innovative", "advanced", "smart", "digital", "automated", "efficient"],
                "benefits": ["save time", "increase productivity", "streamline process", "boost performance"],
                "ctas": ["try free trial", "get demo", "start now", "upgrade today"]
            },
            "ecommerce": {
                "keywords": ["quality", "affordable", "fast shipping", "satisfaction", "guarantee"],
                "benefits": ["save money", "fast delivery", "easy returns", "best prices"],
                "ctas": ["shop now", "buy today", "add to cart", "get yours"]
            },
            "professional_services": {
                "keywords": ["expert", "experienced", "certified", "professional", "consultation"],
                "benefits": ["expert advice", "professional service", "peace of mind", "results"],
                "ctas": ["get quote", "schedule consultation", "contact expert", "learn more"]
            }
        }
        
        # Emotional triggers
        self.emotional_triggers = {
            "fear_of_missing_out": ["limited time", "exclusive offer", "while supplies last", "don't miss"],
            "social_proof": ["trusted by thousands", "5-star rated", "customer favorite", "bestseller"],
            "authority": ["expert recommended", "industry leader", "award-winning", "certified"],
            "convenience": ["easy", "simple", "hassle-free", "one-click", "instant"],
            "value": ["save money", "best price", "great deal", "affordable", "cost-effective"],
            "results": ["proven results", "guaranteed", "effective", "successful", "works"]
        }
    
    async def generate_text(self, 
                          content_type: ContentType,
                          context_data: Dict[str, Any],
                          requirements: Dict[str, Any] = None,
                          language: LanguageCode = LanguageCode.ENGLISH) -> List[str]:
        """
        Generate text content using Gemini AI
        
        Args:
            content_type: Type of content to generate
            context_data: Context information (business, products, keywords)
            requirements: Specific requirements (length, tone, etc.)
            language: Target language
            
        Returns:
            List of generated text variations
        """
        try:
            logger.info(f"Generating {content_type.value} content")
            
            # Prepare generation prompt
            prompt = await self._create_generation_prompt(
                content_type, context_data, requirements, language
            )
            
            # Get model and generation config
            model = self.config.get_model(GeminiModel.GEMINI_PRO)
            generation_config = self.config.get_generation_config(content_type)
            
            # Generate content
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config=generation_config
            )
            
            if not response or not response.text:
                logger.error("No response from Gemini AI")
                return []
            
            # Parse and clean generated content
            generated_texts = self._parse_generated_content(response.text, content_type)
            
            # Validate and filter results
            validated_texts = self._validate_generated_content(
                generated_texts, content_type, requirements
            )
            
            # Apply post-processing
            processed_texts = self._post_process_content(
                validated_texts, content_type, requirements
            )
            
            logger.info(f"Generated {len(processed_texts)} {content_type.value} variations")
            return processed_texts
            
        except Exception as e:
            logger.error(f"Text generation failed: {str(e)}")
            return []
    
    async def generate_variations(self,
                                base_text: str,
                                content_type: ContentType,
                                num_variations: int = 5,
                                variation_style: str = "tone") -> List[str]:
        """
        Generate variations of existing text
        
        Args:
            base_text: Original text to create variations from
            content_type: Type of content
            num_variations: Number of variations to generate
            variation_style: Style of variations (tone, length, structure)
            
        Returns:
            List of text variations
        """
        try:
            variation_prompt = f"""
            Create {num_variations} variations of the following {content_type.value}:
            
            Original: "{base_text}"
            
            Variation Style: {variation_style}
            
            Requirements:
            - Maintain the core message and meaning
            - Vary the {variation_style} while keeping effectiveness
            - Each variation should be unique and compelling
            - Follow Google Ads best practices
            - Stay within character limits for {content_type.value}
            
            Generate variations that are:
            1. Different in {variation_style}
            2. Equally effective
            3. Appropriate for the content type
            4. Optimized for performance
            
            Format: Return each variation on a new line, numbered 1-{num_variations}
            """
            
            model = self.config.get_model(GeminiModel.GEMINI_PRO)
            response = await asyncio.to_thread(model.generate_content, variation_prompt)
            
            if response and response.text:
                variations = self._parse_numbered_list(response.text)
                return variations[:num_variations]
            
            return []
            
        except Exception as e:
            logger.error(f"Variation generation failed: {str(e)}")
            return []
    
    async def optimize_text(self,
                          text: str,
                          content_type: ContentType,
                          optimization_goals: List[str] = None) -> Dict[str, Any]:
        """
        Optimize existing text for better performance
        
        Args:
            text: Text to optimize
            content_type: Type of content
            optimization_goals: Specific optimization goals
            
        Returns:
            Dictionary with optimized text and analysis
        """
        try:
            goals = optimization_goals or ["click_through_rate", "conversion_rate", "relevance"]
            
            optimization_prompt = f"""
            Optimize the following {content_type.value} for better performance:
            
            Original Text: "{text}"
            
            Optimization Goals:
            {chr(10).join(f"- {goal}" for goal in goals)}
            
            Please provide:
            1. Optimized version of the text
            2. Specific improvements made
            3. Reasoning for each change
            4. Expected performance impact
            5. Alternative optimization approaches
            
            Focus on:
            - Stronger emotional triggers
            - Better keyword integration
            - Clearer value proposition
            - More compelling call-to-action
            - Improved readability and flow
            
            Format your response as:
            OPTIMIZED TEXT: [optimized version]
            IMPROVEMENTS: [list of improvements]
            REASONING: [explanation of changes]
            IMPACT: [expected performance impact]
            ALTERNATIVES: [other optimization options]
            """
            
            model = self.config.get_model(GeminiModel.GEMINI_PRO)
            response = await asyncio.to_thread(model.generate_content, optimization_prompt)
            
            if response and response.text:
                return self._parse_optimization_response(response.text)
            
            return {"error": "No optimization response"}
            
        except Exception as e:
            logger.error(f"Text optimization failed: {str(e)}")
            return {"error": str(e)}
    
    async def generate_a_b_test_variants(self,
                                       base_text: str,
                                       content_type: ContentType,
                                       test_elements: List[str] = None) -> Dict[str, List[str]]:
        """
        Generate A/B test variants for specific elements
        
        Args:
            base_text: Base text for testing
            content_type: Type of content
            test_elements: Elements to test (headline, cta, value_prop, etc.)
            
        Returns:
            Dictionary with variants for each test element
        """
        try:
            elements = test_elements or ["headline", "call_to_action", "value_proposition"]
            
            test_variants = {}
            
            for element in elements:
                element_prompt = f"""
                Create A/B test variants for the {element} in this {content_type.value}:
                
                Original Text: "{base_text}"
                
                Focus Element: {element}
                
                Generate 5 different variants of the {element} while keeping other parts the same.
                Each variant should test a different approach:
                1. Emotional appeal
                2. Rational benefit
                3. Urgency/scarcity
                4. Social proof
                5. Direct value proposition
                
                Requirements:
                - Maintain the same overall message
                - Only change the {element} part
                - Each variant should be distinctly different
                - Follow character limits for {content_type.value}
                
                Format: Return each variant on a new line, numbered 1-5
                """
                
                model = self.config.get_model(GeminiModel.GEMINI_PRO)
                response = await asyncio.to_thread(model.generate_content, element_prompt)
                
                if response and response.text:
                    variants = self._parse_numbered_list(response.text)
                    test_variants[element] = variants[:5]
                else:
                    test_variants[element] = []
            
            return test_variants
            
        except Exception as e:
            logger.error(f"A/B test variant generation failed: {str(e)}")
            return {}
    
    async def generate_multilingual_content(self,
                                          base_text: str,
                                          content_type: ContentType,
                                          target_languages: List[LanguageCode]) -> Dict[str, str]:
        """
        Generate multilingual versions of content
        
        Args:
            base_text: Original text in source language
            content_type: Type of content
            target_languages: List of target languages
            
        Returns:
            Dictionary with translations for each language
        """
        try:
            translations = {}
            
            for language in target_languages:
                translation_prompt = f"""
                Translate and localize the following {content_type.value} for {language.value} market:
                
                Original Text: "{base_text}"
                Target Language: {language.value}
                Content Type: {content_type.value}
                
                Requirements:
                - Translate accurately while maintaining marketing effectiveness
                - Adapt cultural references and idioms appropriately
                - Maintain the same emotional impact and persuasiveness
                - Follow local advertising regulations and customs
                - Keep within character limits for {content_type.value}
                - Use native-sounding language, not literal translation
                
                Provide a culturally appropriate and effective translation that would resonate with {language.value} speakers.
                """
                
                model = self.config.get_model(GeminiModel.GEMINI_PRO)
                response = await asyncio.to_thread(model.generate_content, translation_prompt)
                
                if response and response.text:
                    translations[language.value] = response.text.strip()
                else:
                    translations[language.value] = base_text  # Fallback to original
            
            return translations
            
        except Exception as e:
            logger.error(f"Multilingual content generation failed: {str(e)}")
            return {}
    
    async def _create_generation_prompt(self,
                                      content_type: ContentType,
                                      context_data: Dict[str, Any],
                                      requirements: Dict[str, Any] = None,
                                      language: LanguageCode = LanguageCode.ENGLISH) -> str:
        """Create generation prompt based on content type and context"""
        
        requirements = requirements or {}
        
        # Extract context information
        business_info = context_data.get("business_info", {})
        products = context_data.get("products", [])
        keywords = context_data.get("keywords", {})
        target_audience = context_data.get("target_audience", {})
        
        # Get business category for industry-specific vocabulary
        business_category = business_info.get("category", "general")
        industry_vocab = self.industry_vocabulary.get(business_category, {})
        
        # Build context section
        context_section = f"""
        Business Context:
        - Business Name: {business_info.get('name', 'Business')}
        - Category: {business_category}
        - Description: {business_info.get('description', 'Professional business')}
        - Location: {business_info.get('location_info', {}).get('city', 'Local area')}
        
        Products/Services:
        {self._format_products_for_prompt(products[:5])}
        
        Key Keywords:
        {self._format_keywords_for_prompt(keywords.get('primary_keywords', [])[:10])}
        
        Target Audience:
        - Demographics: {target_audience.get('demographics', 'General audience')}
        - Interests: {', '.join(target_audience.get('interests', ['General interests']))}
        """
        
        # Build requirements section
        requirements_section = f"""
        Content Requirements:
        - Content Type: {content_type.value}
        - Language: {language.value}
        - Tone: {requirements.get('tone', 'professional and persuasive')}
        - Max Length: {requirements.get('max_length', self._get_default_max_length(content_type))} characters
        - Number of Variations: {requirements.get('num_variations', 5)}
        - Include Keywords: {requirements.get('include_keywords', True)}
        - Call-to-Action Style: {requirements.get('cta_style', 'action-oriented')}
        """
        
        # Build specific instructions based on content type
        specific_instructions = self._get_content_type_instructions(content_type, industry_vocab)
        
        # Build complete prompt
        prompt = f"""
        {self.config.get_system_prompt(language)}
        
        {context_section}
        
        {requirements_section}
        
        {specific_instructions}
        
        {self.config.get_tone_instructions(language)}
        
        {self.config.get_format_instructions(language)}
        
        Generate {requirements.get('num_variations', 5)} high-quality {content_type.value} variations that:
        1. Are compelling and persuasive
        2. Include relevant keywords naturally
        3. Appeal to the target audience
        4. Follow Google Ads best practices
        5. Stay within character limits
        6. Include strong calls-to-action
        7. Highlight unique value propositions
        8. Use emotional triggers appropriately
        
        Format: Return each variation on a new line, numbered 1-{requirements.get('num_variations', 5)}
        """
        
        return prompt.strip()
    
    def _get_content_type_instructions(self, content_type: ContentType, industry_vocab: Dict[str, Any]) -> str:
        """Get specific instructions for content type"""
        
        instructions = {
            ContentType.HEADLINES: f"""
            Headline-Specific Instructions:
            - Create attention-grabbing headlines that make users want to click
            - Use power words and emotional triggers: {', '.join(self.emotional_triggers.get('authority', []))}
            - Include primary keywords naturally
            - Create urgency or curiosity when appropriate
            - Highlight the main benefit or value proposition
            - Use numbers, statistics, or specific details when relevant
            - Industry keywords to consider: {', '.join(industry_vocab.get('keywords', []))}
            """,
            
            ContentType.DESCRIPTIONS: f"""
            Description-Specific Instructions:
            - Expand on the headline with compelling details
            - Highlight key benefits and features
            - Include a clear call-to-action
            - Address potential objections or concerns
            - Use social proof or credibility indicators
            - Mention guarantees, free trials, or special offers
            - Suggested benefits: {', '.join(industry_vocab.get('benefits', []))}
            - Suggested CTAs: {', '.join(industry_vocab.get('ctas', []))}
            """,
            
            ContentType.KEYWORDS: f"""
            Keyword-Specific Instructions:
            - Generate relevant, high-intent keywords
            - Include exact match, phrase match, and broad match variations
            - Consider commercial intent keywords
            - Include long-tail keyword opportunities
            - Add location-based keywords if relevant
            - Consider seasonal or trending keywords
            - Focus on buyer intent keywords
            """,
            
            ContentType.AD_COPY: f"""
            Ad Copy-Specific Instructions:
            - Create complete ad copy with headline and description
            - Ensure headline and description work together cohesively
            - Include compelling value propositions
            - Use action-oriented language
            - Create emotional connection with audience
            - Include relevant keywords in both headline and description
            - End with strong, specific call-to-action
            """,
            
            ContentType.LANDING_PAGE_CONTENT: f"""
            Landing Page Content Instructions:
            - Create compelling page headlines and subheadings
            - Write benefit-focused body content
            - Include trust signals and social proof
            - Address common objections
            - Create clear value propositions
            - Include multiple call-to-action options
            - Structure content for easy scanning
            """
        }
        
        return instructions.get(content_type, "Generate high-quality, relevant content.")
    
    def _get_default_max_length(self, content_type: ContentType) -> int:
        """Get default maximum length for content type"""
        length_limits = {
            ContentType.HEADLINES: 30,
            ContentType.DESCRIPTIONS: 90,
            ContentType.AD_COPY: 120,
            ContentType.KEYWORDS: 50,
            ContentType.LANDING_PAGE_CONTENT: 500
        }
        
        return length_limits.get(content_type, 100)
    
    def _format_products_for_prompt(self, products: List[Dict[str, Any]]) -> str:
        """Format products for prompt"""
        if not products:
            return "No specific products identified"
        
        formatted = []
        for product in products:
            name = product.get("name", "Product")
            category = product.get("category", "")
            price = product.get("price", "")
            
            product_line = f"- {name}"
            if category:
                product_line += f" ({category})"
            if price:
                product_line += f" - {price}"
            
            formatted.append(product_line)
        
        return "\n".join(formatted)
    
    def _format_keywords_for_prompt(self, keywords: List[Dict[str, Any]]) -> str:
        """Format keywords for prompt"""
        if not keywords:
            return "No specific keywords identified"
        
        formatted = []
        for kw in keywords:
            keyword = kw.get("keyword", "")
            score = kw.get("score", 0)
            formatted.append(f"- {keyword} (relevance: {score})")
        
        return "\n".join(formatted)
    
    def _parse_generated_content(self, response_text: str, content_type: ContentType) -> List[str]:
        """Parse generated content from response"""
        try:
            # Split by lines and clean
            lines = [line.strip() for line in response_text.split('\n') if line.strip()]
            
            # Extract numbered items
            content_items = []
            for line in lines:
                # Remove numbering (1., 2., etc.)
                cleaned_line = re.sub(r'^\d+\.?\s*', '', line)
                # Remove bullet points
                cleaned_line = re.sub(r'^[-•*]\s*', '', cleaned_line)
                # Remove quotes
                cleaned_line = cleaned_line.strip('"\'')
                
                if len(cleaned_line) > 3:  # Minimum length check
                    content_items.append(cleaned_line)
            
            return content_items
            
        except Exception as e:
            logger.error(f"Content parsing failed: {str(e)}")
            return []
    
    def _validate_generated_content(self,
                                  content_items: List[str],
                                  content_type: ContentType,
                                  requirements: Dict[str, Any] = None) -> List[str]:
        """Validate generated content against requirements"""
        requirements = requirements or {}
        validated_items = []
        
        max_length = requirements.get('max_length', self._get_default_max_length(content_type))
        
        for item in content_items:
            # Length validation
            if len(item) > max_length:
                # Try to truncate intelligently
                truncated = self._intelligent_truncate(item, max_length)
                if truncated:
                    validated_items.append(truncated)
            elif len(item) >= 5:  # Minimum length
                validated_items.append(item)
        
        return validated_items
    
    def _intelligent_truncate(self, text: str, max_length: int) -> str:
        """Intelligently truncate text while preserving meaning"""
        if len(text) <= max_length:
            return text
        
        # Try to truncate at word boundaries
        words = text.split()
        truncated = ""
        
        for word in words:
            if len(truncated + " " + word) <= max_length:
                truncated += (" " + word) if truncated else word
            else:
                break
        
        # Ensure we have something meaningful
        if len(truncated) < max_length * 0.7:  # If too much was cut
            return text[:max_length-3] + "..."
        
        return truncated
    
    def _post_process_content(self,
                            content_items: List[str],
                            content_type: ContentType,
                            requirements: Dict[str, Any] = None) -> List[str]:
        """Post-process generated content"""
        processed_items = []
        
        for item in content_items:
            # Clean up formatting
            processed_item = item.strip()
            
            # Ensure proper capitalization
            processed_item = self._fix_capitalization(processed_item)
            
            # Remove duplicate punctuation
            processed_item = re.sub(r'[.!?]{2,}', '.', processed_item)
            
            # Ensure proper spacing
            processed_item = re.sub(r'\s+', ' ', processed_item)
            
            processed_items.append(processed_item)
        
        return processed_items
    
    def _fix_capitalization(self, text: str) -> str:
        """Fix capitalization issues"""
        # Capitalize first letter
        if text:
            text = text[0].upper() + text[1:]
        
        # Capitalize after periods
        text = re.sub(r'(\. )([a-z])', lambda m: m.group(1) + m.group(2).upper(), text)
        
        return text
    
    def _parse_numbered_list(self, text: str) -> List[str]:
        """Parse numbered list from text"""
        lines = text.split('\n')
        items = []
        
        for line in lines:
            line = line.strip()
            # Match numbered items (1., 2., etc.)
            match = re.match(r'^\d+\.?\s*(.+)', line)
            if match:
                items.append(match.group(1).strip())
        
        return items
    
    def _parse_optimization_response(self, response_text: str) -> Dict[str, Any]:
        """Parse optimization response"""
        try:
            result = {
                "optimized_text": "",
                "improvements": [],
                "reasoning": "",
                "impact": "",
                "alternatives": []
            }
            
            sections = response_text.split('\n')
            current_section = None
            
            for line in sections:
                line = line.strip()
                
                if line.startswith('OPTIMIZED TEXT:'):
                    current_section = 'optimized_text'
                    result['optimized_text'] = line.replace('OPTIMIZED TEXT:', '').strip()
                elif line.startswith('IMPROVEMENTS:'):
                    current_section = 'improvements'
                elif line.startswith('REASONING:'):
                    current_section = 'reasoning'
                    result['reasoning'] = line.replace('REASONING:', '').strip()
                elif line.startswith('IMPACT:'):
                    current_section = 'impact'
                    result['impact'] = line.replace('IMPACT:', '').strip()
                elif line.startswith('ALTERNATIVES:'):
                    current_section = 'alternatives'
                elif line and current_section == 'improvements':
                    if line.startswith('-') or line.startswith('•'):
                        result['improvements'].append(line[1:].strip())
                elif line and current_section == 'alternatives':
                    if line.startswith('-') or line.startswith('•'):
                        result['alternatives'].append(line[1:].strip())
            
            return result
            
        except Exception as e:
            logger.error(f"Optimization response parsing failed: {str(e)}")
            return {"error": str(e)}
    
    def get_content_analysis(self, text: str, content_type: ContentType) -> Dict[str, Any]:
        """Analyze content for quality and effectiveness"""
        analysis = {
            "length": len(text),
            "word_count": len(text.split()),
            "character_limit_compliance": True,
            "readability_score": 0,
            "emotional_triggers": [],
            "keywords_present": [],
            "call_to_action_strength": "medium",
            "overall_score": 0
        }
        
        # Check character limits
        max_length = self._get_default_max_length(content_type)
        analysis["character_limit_compliance"] = len(text) <= max_length
        
        # Detect emotional triggers
        text_lower = text.lower()
        for trigger_type, triggers in self.emotional_triggers.items():
            for trigger in triggers:
                if trigger in text_lower:
                    analysis["emotional_triggers"].append(trigger_type)
                    break
        
        # Simple readability score (based on sentence length and word complexity)
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        analysis["readability_score"] = max(0, 100 - (avg_sentence_length * 2))
        
        # Calculate overall score
        score = 0
        if analysis["character_limit_compliance"]:
            score += 25
        if analysis["emotional_triggers"]:
            score += 25
        if analysis["readability_score"] > 70:
            score += 25
        if any(cta in text_lower for cta in ["buy", "get", "try", "start", "learn", "contact"]):
            score += 25
        
        analysis["overall_score"] = score
        
        return analysis

