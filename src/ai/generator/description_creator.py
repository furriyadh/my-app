# Google Ads AI Platform - Description Creator
# Specialized description generation using Google Gemini AI

import logging
import asyncio
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json

from .gemini_config import GeminiConfig, ContentType, LanguageCode, GeminiModel

logger = logging.getLogger(__name__)

class DescriptionCreator:
    """
    Specialized description creation engine using Google Gemini AI
    
    Creates compelling, conversion-focused descriptions for:
    - Google Ads search campaigns
    - Display campaigns
    - Performance Max campaigns
    - Landing pages
    - Product descriptions
    - Service descriptions
    """
    
    def __init__(self, config: GeminiConfig = None):
        """Initialize description creator"""
        self.config = config or GeminiConfig()
        
        # Description templates and structures
        self.description_structures = {
            "problem_solution": "{problem_statement} {solution_offer} {call_to_action}",
            "benefit_features": "{main_benefit} {key_features} {call_to_action}",
            "social_proof": "{testimonial/stat} {value_proposition} {call_to_action}",
            "urgency_offer": "{time_sensitive_offer} {benefit} {call_to_action}",
            "question_answer": "{relevant_question} {answer_benefit} {call_to_action}",
            "comparison": "{vs_competitor} {unique_advantage} {call_to_action}",
            "guarantee": "{guarantee_statement} {benefit} {call_to_action}",
            "process": "{simple_process} {outcome} {call_to_action}"
        }
        
        # Call-to-action variations
        self.cta_variations = {
            "ecommerce": [
                "Shop Now", "Buy Today", "Order Online", "Get Yours", "Add to Cart",
                "Shop Sale", "Browse Collection", "Find Deals", "Save Now", "Purchase"
            ],
            "professional_services": [
                "Get Quote", "Call Today", "Book Consultation", "Contact Us", "Schedule Now",
                "Learn More", "Get Started", "Free Estimate", "Speak to Expert", "Request Info"
            ],
            "local_business": [
                "Visit Us", "Call Now", "Book Appointment", "Stop By", "Contact Today",
                "Get Directions", "Schedule Service", "Come In", "Call Store", "Visit Location"
            ],
            "technology": [
                "Try Free", "Start Trial", "Get Demo", "Download Now", "Sign Up Free",
                "Test Drive", "See Demo", "Start Now", "Try Today", "Get Access"
            ],
            "healthcare": [
                "Book Appointment", "Schedule Visit", "Call Office", "Get Care", "See Doctor",
                "Make Appointment", "Contact Clinic", "Schedule Today", "Get Treatment", "Call Now"
            ]
        }
        
        # Benefit categories
        self.benefit_categories = {
            "time_saving": [
                "Save time", "Quick results", "Fast service", "Instant access", "Immediate help",
                "Rapid delivery", "Same day", "Express service", "Quick turnaround", "Fast response"
            ],
            "money_saving": [
                "Save money", "Best prices", "Great deals", "Affordable rates", "Cost effective",
                "Budget friendly", "Value pricing", "Competitive rates", "Special offers", "Discounts"
            ],
            "quality_assurance": [
                "High quality", "Premium service", "Expert work", "Professional results", "Guaranteed quality",
                "Top rated", "Certified experts", "Proven results", "Excellence", "Superior service"
            ],
            "convenience": [
                "Easy process", "Simple steps", "Hassle free", "Convenient", "User friendly",
                "Streamlined", "Effortless", "Smooth experience", "No complications", "Straightforward"
            ],
            "trust_security": [
                "Trusted provider", "Secure service", "Reliable", "Dependable", "Safe choice",
                "Established business", "Licensed", "Insured", "Bonded", "Verified"
            ]
        }
        
        # Industry-specific value propositions
        self.industry_value_props = {
            "ecommerce": {
                "shipping": ["Free shipping", "Fast delivery", "Same day shipping", "Free returns"],
                "quality": ["Premium quality", "Authentic products", "Brand new", "Warranty included"],
                "service": ["24/7 support", "Easy returns", "Customer service", "Satisfaction guaranteed"],
                "pricing": ["Best prices", "Price match", "Bulk discounts", "Member pricing"]
            },
            "professional_services": {
                "expertise": ["Licensed professionals", "Years of experience", "Certified experts", "Specialized knowledge"],
                "results": ["Proven results", "Success rate", "Client satisfaction", "Track record"],
                "service": ["Personalized service", "One-on-one attention", "Custom solutions", "Dedicated support"],
                "guarantee": ["Satisfaction guaranteed", "Money back guarantee", "Quality assurance", "Risk free"]
            },
            "healthcare": {
                "care": ["Compassionate care", "Patient focused", "Comprehensive treatment", "Personalized care"],
                "expertise": ["Board certified", "Experienced doctors", "Specialized care", "Advanced training"],
                "convenience": ["Flexible scheduling", "Multiple locations", "Online booking", "Same day appointments"],
                "technology": ["Latest technology", "Advanced equipment", "Modern facilities", "State of the art"]
            }
        }
        
        # Character limits for different ad types
        self.character_limits = {
            "search_ads": 90,
            "responsive_search_ads": 90,
            "display_ads": 90,
            "performance_max": 90,
            "expanded_text_ads": 90,
            "landing_page": 150
        }
    
    async def create_descriptions(self,
                                website_data: Dict[str, Any],
                                focus_keywords: List[str],
                                num_descriptions: int = 4,
                                ad_type: str = "search_ads",
                                objective: str = "conversion") -> List[Dict[str, Any]]:
        """
        Create multiple descriptions for Google Ads campaigns
        
        Args:
            website_data: Analyzed website data
            focus_keywords: Keywords to focus on
            num_descriptions: Number of descriptions to generate
            ad_type: Type of ad (search_ads, display_ads, etc.)
            objective: Campaign objective
            
        Returns:
            List of description dictionaries with text, score, and metadata
        """
        try:
            logger.info(f"Creating {num_descriptions} descriptions for {ad_type}")
            
            # Extract business context
            business_info = website_data.get("business_info", {})
            products = website_data.get("products", [])
            
            # Get character limit for ad type
            char_limit = self.character_limits.get(ad_type, 90)
            
            # Generate descriptions using different strategies
            descriptions = []
            
            # Strategy 1: Benefit-focused descriptions
            benefit_descriptions = await self._create_benefit_descriptions(
                website_data, focus_keywords, char_limit, num_descriptions // 2
            )
            descriptions.extend(benefit_descriptions)
            
            # Strategy 2: Feature-focused descriptions
            feature_descriptions = await self._create_feature_descriptions(
                website_data, focus_keywords, char_limit, num_descriptions // 2
            )
            descriptions.extend(feature_descriptions)
            
            # Strategy 3: Social proof descriptions (if needed)
            if len(descriptions) < num_descriptions:
                social_descriptions = await self._create_social_proof_descriptions(
                    business_info, char_limit, num_descriptions - len(descriptions)
                )
                descriptions.extend(social_descriptions)
            
            # Score and rank descriptions
            scored_descriptions = self._score_descriptions(descriptions, focus_keywords, objective)
            
            # Return top descriptions
            return sorted(scored_descriptions, key=lambda x: x['score'], reverse=True)[:num_descriptions]
            
        except Exception as e:
            logger.error(f"Description creation failed: {str(e)}")
            return []
    
    async def create_product_descriptions(self,
                                        products: List[Dict[str, Any]],
                                        website_data: Dict[str, Any],
                                        num_descriptions: int = 4) -> List[Dict[str, Any]]:
        """Create descriptions specifically for products"""
        try:
            business_info = website_data.get("business_info", {})
            descriptions = []
            
            for product in products[:num_descriptions]:
                product_description = await self._generate_single_product_description(
                    product, business_info
                )
                if product_description:
                    descriptions.append(product_description)
            
            # Fill remaining slots with generic product descriptions
            while len(descriptions) < num_descriptions:
                generic_description = await self._create_generic_product_description(
                    business_info, len(descriptions) + 1
                )
                descriptions.append(generic_description)
            
            return descriptions[:num_descriptions]
            
        except Exception as e:
            logger.error(f"Product description creation failed: {str(e)}")
            return []
    
    async def optimize_descriptions(self,
                                  descriptions: List[str],
                                  performance_data: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Optimize existing descriptions based on performance data
        
        Args:
            descriptions: List of existing descriptions
            performance_data: Performance metrics for optimization
            
        Returns:
            List of optimized descriptions with improvement suggestions
        """
        try:
            optimized_descriptions = []
            
            for description in descriptions:
                # Analyze current description
                analysis = self._analyze_description(description)
                
                # Generate optimization suggestions
                optimization_prompt = f"""
                Optimize this Google Ads description for better conversion rates:
                
                Current Description: "{description}"
                
                Current Analysis:
                - Length: {len(description)} characters
                - Benefits mentioned: {analysis.get('benefits', [])}
                - Call-to-action strength: {analysis.get('cta_strength', 'medium')}
                - Emotional appeal: {analysis.get('emotional_appeal', 'medium')}
                
                Performance Data: {performance_data or 'No performance data available'}
                
                Please provide:
                1. 3 optimized versions of this description
                2. Specific improvements made in each version
                3. Expected conversion impact
                
                Focus on:
                - Stronger value proposition
                - More compelling benefits
                - Better call-to-action
                - Improved emotional appeal
                - Enhanced credibility
                
                Keep within 90 characters for Google Ads.
                
                Format:
                OPTIMIZED 1: [description]
                IMPROVEMENTS 1: [improvements]
                
                OPTIMIZED 2: [description]
                IMPROVEMENTS 2: [improvements]
                
                OPTIMIZED 3: [description]
                IMPROVEMENTS 3: [improvements]
                """
                
                model = self.config.get_model(GeminiModel.GEMINI_PRO)
                response = await asyncio.to_thread(model.generate_content, optimization_prompt)
                
                if response and response.text:
                    optimized_versions = self._parse_optimization_response(response.text)
                    optimized_descriptions.extend(optimized_versions)
            
            return optimized_descriptions
            
        except Exception as e:
            logger.error(f"Description optimization failed: {str(e)}")
            return []
    
    async def create_landing_page_descriptions(self,
                                             website_data: Dict[str, Any],
                                             page_purpose: str = "conversion") -> List[Dict[str, Any]]:
        """Create descriptions for landing pages"""
        try:
            business_info = website_data.get("business_info", {})
            products = website_data.get("products", [])
            
            # Different description types for landing pages
            description_types = [
                "hero_section",
                "value_proposition", 
                "benefits_overview",
                "social_proof",
                "call_to_action"
            ]
            
            descriptions = []
            
            for desc_type in description_types:
                description = await self._create_landing_page_section_description(
                    desc_type, website_data, page_purpose
                )
                if description:
                    descriptions.append(description)
            
            return descriptions
            
        except Exception as e:
            logger.error(f"Landing page description creation failed: {str(e)}")
            return []
    
    async def _create_benefit_descriptions(self,
                                         website_data: Dict[str, Any],
                                         keywords: List[str],
                                         char_limit: int,
                                         num_descriptions: int) -> List[Dict[str, Any]]:
        """Create benefit-focused descriptions"""
        descriptions = []
        business_info = website_data.get("business_info", {})
        business_category = business_info.get("category", "general")
        
        # Get relevant benefits for the industry
        industry_benefits = self.industry_value_props.get(business_category, {})
        
        # Get CTAs for the industry
        ctas = self.cta_variations.get(business_category, ["Learn More", "Get Started", "Contact Us"])
        
        # Create benefit-focused descriptions
        benefit_templates = [
            "Save time and money with our expert {service}. {cta} today!",
            "Get professional {service} with guaranteed results. {cta} now!",
            "Quality {service} at affordable prices. Free consultation. {cta}!",
            "Trusted by thousands. Expert {service} you can rely on. {cta}!",
            "Fast, reliable {service} with 24/7 support. {cta} today!"
        ]
        
        for i, template in enumerate(benefit_templates[:num_descriptions]):
            service = keywords[0] if keywords else "service"
            cta = ctas[i % len(ctas)]
            
            description_text = template.format(service=service, cta=cta)
            
            # Ensure within character limit
            if len(description_text) <= char_limit:
                descriptions.append({
                    "text": description_text,
                    "type": "benefit_focused",
                    "template": template,
                    "length": len(description_text)
                })
        
        return descriptions
    
    async def _create_feature_descriptions(self,
                                         website_data: Dict[str, Any],
                                         keywords: List[str],
                                         char_limit: int,
                                         num_descriptions: int) -> List[Dict[str, Any]]:
        """Create feature-focused descriptions"""
        descriptions = []
        business_info = website_data.get("business_info", {})
        business_category = business_info.get("category", "general")
        
        # Get CTAs for the industry
        ctas = self.cta_variations.get(business_category, ["Learn More", "Get Started", "Contact Us"])
        
        # Feature-focused templates
        feature_templates = [
            "Licensed professionals with years of experience. {cta} for free quote!",
            "State-of-the-art equipment and modern techniques. {cta} today!",
            "Comprehensive {service} with personalized attention. {cta} now!",
            "Advanced {service} solutions with proven results. {cta}!",
            "Full-service {service} provider with satisfaction guarantee. {cta}!"
        ]
        
        for i, template in enumerate(feature_templates[:num_descriptions]):
            service = keywords[0] if keywords else "service"
            cta = ctas[i % len(ctas)]
            
            description_text = template.format(service=service, cta=cta)
            
            # Ensure within character limit
            if len(description_text) <= char_limit:
                descriptions.append({
                    "text": description_text,
                    "type": "feature_focused",
                    "template": template,
                    "length": len(description_text)
                })
        
        return descriptions
    
    async def _create_social_proof_descriptions(self,
                                              business_info: Dict[str, Any],
                                              char_limit: int,
                                              num_descriptions: int) -> List[Dict[str, Any]]:
        """Create social proof descriptions"""
        descriptions = []
        business_category = business_info.get("category", "general")
        
        # Get CTAs for the industry
        ctas = self.cta_variations.get(business_category, ["Learn More", "Get Started", "Contact Us"])
        
        # Social proof templates
        social_templates = [
            "Trusted by 1000+ satisfied customers. 5-star rated service. {cta}!",
            "Award-winning service with 99% customer satisfaction. {cta} today!",
            "Serving the community for 10+ years. Proven track record. {cta}!",
            "Top-rated provider with excellent reviews. Join our clients. {cta}!",
            "Industry leader with certified professionals. {cta} for consultation!"
        ]
        
        for i, template in enumerate(social_templates[:num_descriptions]):
            cta = ctas[i % len(ctas)]
            description_text = template.format(cta=cta)
            
            # Ensure within character limit
            if len(description_text) <= char_limit:
                descriptions.append({
                    "text": description_text,
                    "type": "social_proof",
                    "template": template,
                    "length": len(description_text)
                })
        
        return descriptions
    
    async def _generate_single_product_description(self,
                                                 product: Dict[str, Any],
                                                 business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate description for a single product"""
        product_name = product.get("name", "Product")
        category = product.get("category", "")
        price = product.get("price", "")
        features = product.get("features", [])
        
        # Product description templates
        if price:
            description_text = f"Shop {product_name} - {price}. Quality guaranteed. Free shipping!"
        elif features:
            main_feature = features[0] if features else "premium quality"
            description_text = f"{product_name} with {main_feature}. Buy now and save!"
        else:
            description_text = f"Premium {product_name}. Best prices online. Shop today!"
        
        return {
            "text": description_text,
            "type": "product_specific",
            "product": product_name,
            "length": len(description_text)
        }
    
    async def _create_generic_product_description(self,
                                                business_info: Dict[str, Any],
                                                index: int) -> Dict[str, Any]:
        """Create generic product description"""
        generic_templates = [
            "Quality products at unbeatable prices. Free shipping on orders over $50!",
            "Shop our collection of premium items. Satisfaction guaranteed!",
            "New arrivals daily. Best deals online. Shop now and save big!",
            "Authentic products with warranty. Fast delivery. Order today!"
        ]
        
        template = generic_templates[index % len(generic_templates)]
        
        return {
            "text": template,
            "type": "generic_product",
            "length": len(template)
        }
    
    async def _create_landing_page_section_description(self,
                                                     section_type: str,
                                                     website_data: Dict[str, Any],
                                                     page_purpose: str) -> Dict[str, Any]:
        """Create description for specific landing page section"""
        business_info = website_data.get("business_info", {})
        business_name = business_info.get("name", "Business")
        
        section_templates = {
            "hero_section": f"Welcome to {business_name} - Your trusted partner for professional solutions that deliver results.",
            "value_proposition": "We provide expert services that save you time, money, and deliver guaranteed results.",
            "benefits_overview": "Experience the difference with our proven approach, dedicated support, and satisfaction guarantee.",
            "social_proof": "Join thousands of satisfied customers who trust us for reliable, professional service.",
            "call_to_action": "Ready to get started? Contact us today for a free consultation and see the difference we can make."
        }
        
        description_text = section_templates.get(section_type, "Professional service you can trust.")
        
        return {
            "text": description_text,
            "type": f"landing_page_{section_type}",
            "section": section_type,
            "length": len(description_text)
        }
    
    def _score_descriptions(self,
                          descriptions: List[Dict[str, Any]],
                          keywords: List[str],
                          objective: str) -> List[Dict[str, Any]]:
        """Score descriptions based on various factors"""
        for description in descriptions:
            score = 0
            text = description["text"].lower()
            
            # Keyword relevance (25 points)
            keyword_score = 0
            for keyword in keywords:
                if keyword.lower() in text:
                    keyword_score += 8
            score += min(keyword_score, 25)
            
            # Benefit mentions (25 points)
            benefit_words = ["save", "free", "best", "quality", "expert", "professional", "guaranteed"]
            benefit_score = sum(5 for word in benefit_words if word in text)
            score += min(benefit_score, 25)
            
            # Call-to-action strength (20 points)
            strong_ctas = ["call", "get", "buy", "shop", "try", "start", "book", "contact"]
            if any(cta in text for cta in strong_ctas):
                score += 20
            
            # Length optimization (15 points)
            length = description["length"]
            if 70 <= length <= 90:
                score += 15
            elif 60 <= length < 70 or 90 < length <= 100:
                score += 10
            else:
                score += 5
            
            # Emotional appeal (15 points)
            emotional_words = ["amazing", "incredible", "trusted", "proven", "satisfaction", "guarantee"]
            emotional_count = sum(1 for word in emotional_words if word in text)
            score += min(emotional_count * 3, 15)
            
            description["score"] = score
        
        return descriptions
    
    def _analyze_description(self, description: str) -> Dict[str, Any]:
        """Analyze description for various qualities"""
        text_lower = description.lower()
        
        analysis = {
            "length": len(description),
            "word_count": len(description.split()),
            "benefits": [],
            "cta_strength": "low",
            "emotional_appeal": "low",
            "credibility_signals": [],
            "urgency_indicators": []
        }
        
        # Find benefits
        benefit_words = ["save", "free", "best", "quality", "expert", "professional", "guaranteed", "fast"]
        analysis["benefits"] = [word for word in benefit_words if word in text_lower]
        
        # Assess CTA strength
        strong_ctas = ["call", "get", "buy", "shop", "try", "start", "book", "contact"]
        medium_ctas = ["learn", "discover", "find", "see", "visit"]
        
        if any(cta in text_lower for cta in strong_ctas):
            analysis["cta_strength"] = "high"
        elif any(cta in text_lower for cta in medium_ctas):
            analysis["cta_strength"] = "medium"
        
        # Assess emotional appeal
        emotional_words = ["amazing", "incredible", "trusted", "proven", "satisfaction", "love"]
        emotional_count = sum(1 for word in emotional_words if word in text_lower)
        
        if emotional_count >= 2:
            analysis["emotional_appeal"] = "high"
        elif emotional_count == 1:
            analysis["emotional_appeal"] = "medium"
        
        # Find credibility signals
        credibility_words = ["certified", "licensed", "experienced", "professional", "trusted", "guaranteed"]
        analysis["credibility_signals"] = [word for word in credibility_words if word in text_lower]
        
        # Find urgency indicators
        urgency_words = ["today", "now", "limited", "hurry", "fast", "immediate"]
        analysis["urgency_indicators"] = [word for word in urgency_words if word in text_lower]
        
        return analysis
    
    def _parse_optimization_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse optimization response"""
        optimized_descriptions = []
        lines = response_text.split('\n')
        
        current_description = None
        current_improvements = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('OPTIMIZED'):
                if current_description:
                    optimized_descriptions.append({
                        "text": current_description,
                        "improvements": current_improvements,
                        "type": "optimized"
                    })
                
                # Extract description
                desc_match = re.search(r'OPTIMIZED \d+:\s*(.+)', line)
                if desc_match:
                    current_description = desc_match.group(1).strip()
                current_improvements = []
            
            elif line.startswith('IMPROVEMENTS'):
                # Extract improvements
                improvements_match = re.search(r'IMPROVEMENTS \d+:\s*(.+)', line)
                if improvements_match:
                    current_improvements.append(improvements_match.group(1).strip())
        
        # Add last description
        if current_description:
            optimized_descriptions.append({
                "text": current_description,
                "improvements": current_improvements,
                "type": "optimized"
            })
        
        return optimized_descriptions
    
    def get_description_suggestions(self, business_type: str, keywords: List[str]) -> List[str]:
        """Get quick description suggestions based on business type"""
        suggestions = []
        
        if business_type == "ecommerce":
            suggestions = [
                f"Shop {keywords[0] if keywords else 'products'} with free shipping. Best prices guaranteed!",
                "Quality products, fast delivery, easy returns. Shop with confidence today!",
                "New arrivals daily. Premium quality at unbeatable prices. Order now!",
                "Authentic products with warranty. Free shipping on orders over $50!"
            ]
        elif business_type == "professional_services":
            suggestions = [
                f"Expert {keywords[0] if keywords else 'service'} with guaranteed results. Free consultation!",
                "Licensed professionals with years of experience. Call for free quote!",
                "Trusted service provider with 99% customer satisfaction. Contact us today!",
                "Professional solutions that save time and money. Get started now!"
            ]
        elif business_type == "local_business":
            suggestions = [
                f"Local {keywords[0] if keywords else 'service'} you can trust. Serving the community for years!",
                "Family-owned business with personalized service. Call us today!",
                "Your neighborhood experts. Quality service at fair prices. Visit us!",
                "Locally owned and operated. Supporting our community with great service!"
            ]
        else:
            suggestions = [
                "Professional service with guaranteed satisfaction. Contact us today!",
                "Quality results you can trust. Expert help when you need it most!",
                "Reliable service with personalized attention. Get your free quote now!",
                "Proven solutions that deliver results. Start your project today!"
            ]
        
        return suggestions

