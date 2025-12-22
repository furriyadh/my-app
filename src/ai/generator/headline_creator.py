# Google Ads AI Platform - Headline Creator
# Specialized headline generation using Google Gemini AI

import logging
import asyncio
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json

from .gemini_config import GeminiConfig, ContentType, LanguageCode, GeminiModel

logger = logging.getLogger(__name__)

class HeadlineCreator:
    """
    Specialized headline creation engine using Google Gemini AI
    
    Creates compelling, high-converting headlines for:
    - Google Ads search campaigns
    - Display campaigns
    - Performance Max campaigns
    - Landing pages
    - Email marketing
    - Social media ads
    """
    
    def __init__(self, config: GeminiConfig = None):
        """Initialize headline creator"""
        self.config = config or GeminiConfig()
        
        # Headline formulas and templates
        self.headline_formulas = {
            "problem_solution": "{problem} + {solution}",
            "benefit_driven": "{benefit} + {timeframe}",
            "question_answer": "{question} + {answer}",
            "how_to": "How to {action} + {benefit}",
            "number_driven": "{number} + {benefit/tip}",
            "urgency_scarcity": "{urgency} + {offer}",
            "social_proof": "{social_proof} + {benefit}",
            "comparison": "{product} vs {competitor}",
            "feature_benefit": "{feature} = {benefit}",
            "testimonial": "{customer_quote}"
        }
        
        # Power words for headlines
        self.power_words = {
            "action": ["get", "discover", "unlock", "achieve", "master", "boost", "transform", "maximize"],
            "emotion": ["amazing", "incredible", "stunning", "revolutionary", "breakthrough", "exclusive"],
            "urgency": ["now", "today", "instant", "immediate", "fast", "quick", "rapid"],
            "value": ["free", "save", "discount", "deal", "offer", "bonus", "extra"],
            "authority": ["expert", "proven", "certified", "professional", "guaranteed", "trusted"],
            "curiosity": ["secret", "hidden", "revealed", "insider", "unknown", "surprising"]
        }
        
        # Headline types for different objectives
        self.headline_types = {
            "brand_awareness": {
                "focus": "brand_recognition",
                "elements": ["brand_name", "unique_value", "memorable_phrase"],
                "tone": "memorable"
            },
            "lead_generation": {
                "focus": "lead_capture",
                "elements": ["benefit", "call_to_action", "value_proposition"],
                "tone": "compelling"
            },
            "sales_conversion": {
                "focus": "purchase_intent",
                "elements": ["product_benefit", "urgency", "social_proof"],
                "tone": "persuasive"
            },
            "traffic_driving": {
                "focus": "click_through",
                "elements": ["curiosity", "benefit", "action_word"],
                "tone": "intriguing"
            }
        }
        
        # Industry-specific headline patterns
        self.industry_patterns = {
            "ecommerce": [
                "{product} - {discount}% Off",
                "Shop {category} - Free Shipping",
                "{brand} {product} - Best Price",
                "New {product} Collection",
                "{product} Sale - Limited Time"
            ],
            "professional_services": [
                "Expert {service} Services",
                "{service} Consultation - Free",
                "Professional {service} Help",
                "{location} {service} Experts",
                "Get {service} Quote Today"
            ],
            "healthcare": [
                "{treatment} - Book Appointment",
                "Expert {specialty} Care",
                "{condition} Treatment Options",
                "Schedule {service} Today",
                "Trusted {healthcare_type}"
            ],
            "technology": [
                "{software} - Free Trial",
                "Automate {process} Today",
                "{solution} for {industry}",
                "Boost {metric} by {percentage}%",
                "Try {product} - 30 Days Free"
            ],
            "local_business": [
                "{location} {service}",
                "Local {business_type}",
                "{service} Near You",
                "{location}'s Best {service}",
                "Call {business} Today"
            ]
        }
        
        # Character limits for different ad types
        self.character_limits = {
            "search_ads": 30,
            "responsive_search_ads": 30,
            "display_ads_short": 30,
            "display_ads_long": 90,
            "performance_max": 30,
            "video_ads": 100,
            "landing_page": 60
        }
    
    async def create_headlines(self,
                             website_data: Dict[str, Any],
                             focus_keywords: List[str],
                             num_headlines: int = 15,
                             ad_type: str = "search_ads",
                             objective: str = "sales_conversion") -> List[Dict[str, Any]]:
        """
        Create multiple headlines for Google Ads campaigns
        
        Args:
            website_data: Analyzed website data
            focus_keywords: Keywords to focus on
            num_headlines: Number of headlines to generate
            ad_type: Type of ad (search_ads, display_ads, etc.)
            objective: Campaign objective
            
        Returns:
            List of headline dictionaries with text, score, and metadata
        """
        try:
            logger.info(f"Creating {num_headlines} headlines for {ad_type}")
            
            # Extract business context
            business_info = website_data.get("business_info", {})
            products = website_data.get("products", [])
            
            # Get character limit for ad type
            char_limit = self.character_limits.get(ad_type, 30)
            
            # Generate headlines using different strategies
            headlines = []
            
            # Strategy 1: Keyword-focused headlines
            keyword_headlines = await self._create_keyword_headlines(
                focus_keywords, business_info, char_limit, num_headlines // 3
            )
            headlines.extend(keyword_headlines)
            
            # Strategy 2: Benefit-driven headlines
            benefit_headlines = await self._create_benefit_headlines(
                website_data, char_limit, num_headlines // 3
            )
            headlines.extend(benefit_headlines)
            
            # Strategy 3: Product/service-specific headlines
            product_headlines = await self._create_product_headlines(
                products, business_info, char_limit, num_headlines // 3
            )
            headlines.extend(product_headlines)
            
            # Strategy 4: Industry-specific headlines
            industry_headlines = await self._create_industry_headlines(
                business_info, focus_keywords, char_limit, num_headlines - len(headlines)
            )
            headlines.extend(industry_headlines)
            
            # Score and rank headlines
            scored_headlines = self._score_headlines(headlines, focus_keywords, objective)
            
            # Return top headlines
            return sorted(scored_headlines, key=lambda x: x['score'], reverse=True)[:num_headlines]
            
        except Exception as e:
            logger.error(f"Headline creation failed: {str(e)}")
            return []
    
    async def create_product_headlines(self,
                                     products: List[Dict[str, Any]],
                                     website_data: Dict[str, Any],
                                     num_headlines: int = 15) -> List[Dict[str, Any]]:
        """Create headlines specifically for products"""
        try:
            business_info = website_data.get("business_info", {})
            headlines = []
            
            for product in products[:5]:  # Focus on top 5 products
                product_name = product.get("name", "Product")
                category = product.get("category", "")
                price = product.get("price", "")
                
                # Generate product-specific headlines
                product_headlines = await self._generate_product_specific_headlines(
                    product, business_info, num_headlines // len(products[:5])
                )
                headlines.extend(product_headlines)
            
            # If not enough products, generate generic product headlines
            if len(headlines) < num_headlines:
                generic_headlines = await self._create_generic_product_headlines(
                    business_info, num_headlines - len(headlines)
                )
                headlines.extend(generic_headlines)
            
            return headlines[:num_headlines]
            
        except Exception as e:
            logger.error(f"Product headline creation failed: {str(e)}")
            return []
    
    async def optimize_headlines(self,
                               headlines: List[str],
                               performance_data: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Optimize existing headlines based on performance data
        
        Args:
            headlines: List of existing headlines
            performance_data: Performance metrics for optimization
            
        Returns:
            List of optimized headlines with improvement suggestions
        """
        try:
            optimized_headlines = []
            
            for headline in headlines:
                # Analyze current headline
                analysis = self._analyze_headline(headline)
                
                # Generate optimization suggestions
                optimization_prompt = f"""
                Optimize this Google Ads headline for better performance:
                
                Current Headline: "{headline}"
                
                Current Analysis:
                - Length: {len(headline)} characters
                - Power words: {analysis.get('power_words', [])}
                - Emotional triggers: {analysis.get('emotional_triggers', [])}
                - Call-to-action strength: {analysis.get('cta_strength', 'medium')}
                
                Performance Data: {performance_data or 'No performance data available'}
                
                Please provide:
                1. 3 optimized versions of this headline
                2. Specific improvements made in each version
                3. Expected performance impact
                
                Focus on:
                - Stronger emotional appeal
                - Better keyword integration
                - More compelling call-to-action
                - Improved click-through potential
                
                Keep within 30 characters for Google Ads.
                
                Format:
                OPTIMIZED 1: [headline]
                IMPROVEMENTS 1: [improvements]
                
                OPTIMIZED 2: [headline]
                IMPROVEMENTS 2: [improvements]
                
                OPTIMIZED 3: [headline]
                IMPROVEMENTS 3: [improvements]
                """
                
                model = self.config.get_model(GeminiModel.GEMINI_PRO)
                response = await asyncio.to_thread(model.generate_content, optimization_prompt)
                
                if response and response.text:
                    optimized_versions = self._parse_optimization_response(response.text)
                    optimized_headlines.extend(optimized_versions)
            
            return optimized_headlines
            
        except Exception as e:
            logger.error(f"Headline optimization failed: {str(e)}")
            return []
    
    async def create_a_b_test_headlines(self,
                                      base_headline: str,
                                      test_elements: List[str] = None) -> Dict[str, List[str]]:
        """
        Create A/B test variations of a headline
        
        Args:
            base_headline: Original headline to test
            test_elements: Elements to test (emotion, urgency, benefit, etc.)
            
        Returns:
            Dictionary with test variations for each element
        """
        try:
            test_elements = test_elements or ["emotion", "urgency", "benefit", "call_to_action"]
            test_variations = {}
            
            for element in test_elements:
                element_prompt = f"""
                Create 5 A/B test variations of this headline, focusing on different {element} approaches:
                
                Original Headline: "{base_headline}"
                
                Test Focus: {element}
                
                Create 5 variations that test different {element} strategies:
                1. High {element} approach
                2. Medium {element} approach  
                3. Subtle {element} approach
                4. Alternative {element} style
                5. Contrasting {element} method
                
                Requirements:
                - Keep within 30 characters
                - Maintain core message
                - Each variation should be distinctly different in {element}
                - Optimize for click-through rate
                
                Format: Return each variation on a new line, numbered 1-5
                """
                
                model = self.config.get_model(GeminiModel.GEMINI_PRO)
                response = await asyncio.to_thread(model.generate_content, element_prompt)
                
                if response and response.text:
                    variations = self._parse_numbered_list(response.text)
                    test_variations[element] = variations[:5]
            
            return test_variations
            
        except Exception as e:
            logger.error(f"A/B test headline creation failed: {str(e)}")
            return {}
    
    async def _create_keyword_headlines(self,
                                      keywords: List[str],
                                      business_info: Dict[str, Any],
                                      char_limit: int,
                                      num_headlines: int) -> List[Dict[str, Any]]:
        """Create headlines focused on keywords"""
        headlines = []
        business_name = business_info.get("name", "Business")
        
        for keyword in keywords[:num_headlines]:
            # Different headline formulas with keywords
            headline_variations = [
                f"{keyword.title()} - {business_name}",
                f"Best {keyword} Service",
                f"Expert {keyword} Help",
                f"Get {keyword} Today",
                f"{keyword} Solutions",
                f"Professional {keyword}",
                f"{keyword} Specialists",
                f"Top {keyword} Provider"
            ]
            
            # Filter by character limit
            valid_headlines = [h for h in headline_variations if len(h) <= char_limit]
            
            if valid_headlines:
                headlines.append({
                    "text": valid_headlines[0],
                    "type": "keyword_focused",
                    "keyword": keyword,
                    "length": len(valid_headlines[0])
                })
        
        return headlines
    
    async def _create_benefit_headlines(self,
                                      website_data: Dict[str, Any],
                                      char_limit: int,
                                      num_headlines: int) -> List[Dict[str, Any]]:
        """Create benefit-driven headlines"""
        headlines = []
        business_info = website_data.get("business_info", {})
        
        # Common benefits based on business type
        benefits = [
            "Save Time & Money",
            "Expert Results",
            "Fast Service",
            "Guaranteed Quality",
            "24/7 Support",
            "Free Consultation",
            "Best Prices",
            "Trusted by Thousands"
        ]
        
        for i, benefit in enumerate(benefits[:num_headlines]):
            headline_text = benefit
            
            # Ensure within character limit
            if len(headline_text) <= char_limit:
                headlines.append({
                    "text": headline_text,
                    "type": "benefit_driven",
                    "benefit": benefit,
                    "length": len(headline_text)
                })
        
        return headlines
    
    async def _create_product_headlines(self,
                                      products: List[Dict[str, Any]],
                                      business_info: Dict[str, Any],
                                      char_limit: int,
                                      num_headlines: int) -> List[Dict[str, Any]]:
        """Create product-specific headlines"""
        headlines = []
        
        if not products:
            return headlines
        
        for product in products[:num_headlines]:
            product_name = product.get("name", "Product")
            category = product.get("category", "")
            
            # Product headline variations
            product_headlines = [
                f"Shop {product_name}",
                f"New {product_name}",
                f"Best {product_name}",
                f"{product_name} Sale",
                f"Buy {product_name}",
                f"{category} Collection" if category else f"{product_name} Now"
            ]
            
            # Filter by character limit
            valid_headlines = [h for h in product_headlines if len(h) <= char_limit]
            
            if valid_headlines:
                headlines.append({
                    "text": valid_headlines[0],
                    "type": "product_focused",
                    "product": product_name,
                    "length": len(valid_headlines[0])
                })
        
        return headlines
    
    async def _create_industry_headlines(self,
                                       business_info: Dict[str, Any],
                                       keywords: List[str],
                                       char_limit: int,
                                       num_headlines: int) -> List[Dict[str, Any]]:
        """Create industry-specific headlines"""
        headlines = []
        business_category = business_info.get("category", "general")
        business_name = business_info.get("name", "Business")
        location = business_info.get("location_info", {}).get("city", "Local")
        
        # Get industry patterns
        patterns = self.industry_patterns.get(business_category, [
            f"Professional {business_category}",
            f"Expert {business_category} Service",
            f"Best {business_category} Provider",
            f"{location} {business_category}",
            f"Trusted {business_category}"
        ])
        
        for pattern in patterns[:num_headlines]:
            # Replace placeholders
            headline = pattern.format(
                service=keywords[0] if keywords else "service",
                location=location,
                business=business_name,
                category=business_category,
                business_type=business_category
            )
            
            # Ensure within character limit
            if len(headline) <= char_limit:
                headlines.append({
                    "text": headline,
                    "type": "industry_specific",
                    "pattern": pattern,
                    "length": len(headline)
                })
        
        return headlines
    
    async def _generate_product_specific_headlines(self,
                                                 product: Dict[str, Any],
                                                 business_info: Dict[str, Any],
                                                 num_headlines: int) -> List[Dict[str, Any]]:
        """Generate headlines for a specific product"""
        headlines = []
        product_name = product.get("name", "Product")
        category = product.get("category", "")
        price = product.get("price", "")
        
        # Product-specific headline templates
        templates = [
            f"{product_name} - Best Price",
            f"Buy {product_name} Online",
            f"New {product_name} Available",
            f"{product_name} - Free Shipping",
            f"Shop {product_name} Now",
            f"{category} - {product_name}" if category else f"{product_name} Sale",
            f"Get {product_name} Today",
            f"{product_name} Deals"
        ]
        
        for template in templates[:num_headlines]:
            if len(template) <= 30:  # Standard headline limit
                headlines.append({
                    "text": template,
                    "type": "product_specific",
                    "product": product_name,
                    "length": len(template)
                })
        
        return headlines
    
    async def _create_generic_product_headlines(self,
                                              business_info: Dict[str, Any],
                                              num_headlines: int) -> List[Dict[str, Any]]:
        """Create generic product headlines"""
        headlines = []
        business_name = business_info.get("name", "Business")
        
        generic_templates = [
            "Shop Our Products",
            "New Arrivals",
            "Best Deals Online",
            "Quality Products",
            "Shop Now & Save",
            "Free Shipping",
            "Best Prices",
            "Top Quality Items"
        ]
        
        for template in generic_templates[:num_headlines]:
            headlines.append({
                "text": template,
                "type": "generic_product",
                "length": len(template)
            })
        
        return headlines
    
    def _score_headlines(self,
                        headlines: List[Dict[str, Any]],
                        keywords: List[str],
                        objective: str) -> List[Dict[str, Any]]:
        """Score headlines based on various factors"""
        for headline in headlines:
            score = 0
            text = headline["text"].lower()
            
            # Keyword relevance (30 points)
            keyword_score = 0
            for keyword in keywords:
                if keyword.lower() in text:
                    keyword_score += 10
            score += min(keyword_score, 30)
            
            # Power words (20 points)
            power_word_score = 0
            for category, words in self.power_words.items():
                for word in words:
                    if word in text:
                        power_word_score += 5
            score += min(power_word_score, 20)
            
            # Length optimization (20 points)
            length = headline["length"]
            if 20 <= length <= 30:
                score += 20
            elif 15 <= length < 20 or 30 < length <= 35:
                score += 15
            else:
                score += 10
            
            # Call-to-action presence (15 points)
            cta_words = ["get", "buy", "shop", "try", "start", "call", "book", "learn"]
            if any(cta in text for cta in cta_words):
                score += 15
            
            # Emotional appeal (15 points)
            emotional_words = ["best", "new", "free", "save", "expert", "trusted", "guaranteed"]
            emotional_count = sum(1 for word in emotional_words if word in text)
            score += min(emotional_count * 5, 15)
            
            headline["score"] = score
        
        return headlines
    
    def _analyze_headline(self, headline: str) -> Dict[str, Any]:
        """Analyze headline for various qualities"""
        text_lower = headline.lower()
        
        analysis = {
            "length": len(headline),
            "word_count": len(headline.split()),
            "power_words": [],
            "emotional_triggers": [],
            "cta_strength": "low",
            "keyword_density": 0,
            "readability": "medium"
        }
        
        # Find power words
        for category, words in self.power_words.items():
            found_words = [word for word in words if word in text_lower]
            if found_words:
                analysis["power_words"].extend(found_words)
        
        # Find emotional triggers
        emotional_words = ["amazing", "incredible", "best", "new", "free", "save", "expert"]
        analysis["emotional_triggers"] = [word for word in emotional_words if word in text_lower]
        
        # Assess CTA strength
        strong_ctas = ["get", "buy", "shop", "try", "start"]
        medium_ctas = ["learn", "discover", "find", "see"]
        
        if any(cta in text_lower for cta in strong_ctas):
            analysis["cta_strength"] = "high"
        elif any(cta in text_lower for cta in medium_ctas):
            analysis["cta_strength"] = "medium"
        
        return analysis
    
    def _parse_numbered_list(self, text: str) -> List[str]:
        """Parse numbered list from text"""
        lines = text.split('\n')
        items = []
        
        for line in lines:
            line = line.strip()
            # Match numbered items
            match = re.match(r'^\d+\.?\s*(.+)', line)
            if match:
                items.append(match.group(1).strip())
        
        return items
    
    def _parse_optimization_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse optimization response"""
        optimized_headlines = []
        lines = response_text.split('\n')
        
        current_headline = None
        current_improvements = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('OPTIMIZED'):
                if current_headline:
                    optimized_headlines.append({
                        "text": current_headline,
                        "improvements": current_improvements,
                        "type": "optimized"
                    })
                
                # Extract headline
                headline_match = re.search(r'OPTIMIZED \d+:\s*(.+)', line)
                if headline_match:
                    current_headline = headline_match.group(1).strip()
                current_improvements = []
            
            elif line.startswith('IMPROVEMENTS'):
                # Extract improvements
                improvements_match = re.search(r'IMPROVEMENTS \d+:\s*(.+)', line)
                if improvements_match:
                    current_improvements.append(improvements_match.group(1).strip())
        
        # Add last headline
        if current_headline:
            optimized_headlines.append({
                "text": current_headline,
                "improvements": current_improvements,
                "type": "optimized"
            })
        
        return optimized_headlines
    
    def get_headline_suggestions(self, business_type: str, keywords: List[str]) -> List[str]:
        """Get quick headline suggestions based on business type"""
        suggestions = []
        
        if business_type == "ecommerce":
            suggestions = [
                f"Shop {keywords[0] if keywords else 'Products'}",
                "Free Shipping Today",
                "Best Deals Online",
                "New Arrivals",
                "Save Up to 50%"
            ]
        elif business_type == "professional_services":
            suggestions = [
                f"Expert {keywords[0] if keywords else 'Service'}",
                "Free Consultation",
                "Professional Help",
                "Get Quote Today",
                "Trusted Experts"
            ]
        elif business_type == "local_business":
            suggestions = [
                f"Local {keywords[0] if keywords else 'Service'}",
                "Near You",
                "Call Today",
                "Best in Area",
                "Serving Community"
            ]
        else:
            suggestions = [
                "Professional Service",
                "Expert Help",
                "Get Started Today",
                "Quality Results",
                "Trusted Provider"
            ]
        
        return suggestions

