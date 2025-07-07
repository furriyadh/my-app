# Google Ads AI Platform - Keyword Generator
# Advanced keyword generation using Google Gemini AI

import logging
import asyncio
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime
import json

from .gemini_config import GeminiConfig, ContentType, LanguageCode, GeminiModel

logger = logging.getLogger(__name__)

class KeywordGenerator:
    """
    Advanced keyword generation engine using Google Gemini AI
    
    Generates comprehensive keyword lists for:
    - Google Ads search campaigns
    - SEO optimization
    - Content marketing
    - Competitive analysis
    - Long-tail keyword discovery
    - Local search optimization
    """
    
    def __init__(self, config: GeminiConfig = None):
        """Initialize keyword generator"""
        self.config = config or GeminiConfig()
        
        # Keyword match types
        self.match_types = {
            "exact": "[{keyword}]",
            "phrase": '"{keyword}"',
            "broad": "{keyword}",
            "broad_modified": "+{keyword_parts}"
        }
        
        # Keyword intent categories
        self.intent_categories = {
            "commercial": {
                "modifiers": ["buy", "purchase", "order", "shop", "get", "hire", "book"],
                "suffixes": ["online", "near me", "service", "company", "store", "price", "cost"],
                "intent_score": 90
            },
            "informational": {
                "modifiers": ["how to", "what is", "guide", "tips", "learn", "tutorial", "help"],
                "suffixes": ["guide", "tips", "help", "tutorial", "information", "advice"],
                "intent_score": 30
            },
            "navigational": {
                "modifiers": ["brand", "company", "website", "official", "login", "contact"],
                "suffixes": ["website", "official", "login", "contact", "location", "hours"],
                "intent_score": 60
            },
            "local": {
                "modifiers": ["near me", "local", "nearby", "in [city]", "[city]"],
                "suffixes": ["near me", "local", "nearby", "in my area", "close by"],
                "intent_score": 85
            }
        }
        
        # Industry-specific keyword patterns
        self.industry_patterns = {
            "ecommerce": {
                "product_modifiers": ["buy", "shop", "order", "purchase", "get", "find"],
                "product_suffixes": ["online", "store", "shop", "sale", "deals", "price", "reviews"],
                "category_keywords": ["clothing", "electronics", "home", "beauty", "sports"],
                "brand_modifiers": ["official", "authentic", "genuine", "original", "brand new"]
            },
            "professional_services": {
                "service_modifiers": ["professional", "expert", "certified", "licensed", "experienced"],
                "service_suffixes": ["services", "company", "firm", "consultant", "specialist"],
                "action_keywords": ["hire", "get", "find", "contact", "call", "book"],
                "location_modifiers": ["local", "near me", "in [city]", "best", "top"]
            },
            "healthcare": {
                "service_modifiers": ["medical", "health", "clinical", "professional", "certified"],
                "service_suffixes": ["doctor", "clinic", "hospital", "center", "care", "treatment"],
                "condition_keywords": ["treatment", "therapy", "diagnosis", "consultation", "checkup"],
                "urgency_modifiers": ["emergency", "urgent", "immediate", "same day", "walk in"]
            },
            "technology": {
                "product_modifiers": ["software", "app", "platform", "tool", "system", "solution"],
                "service_suffixes": ["development", "consulting", "support", "implementation", "training"],
                "tech_keywords": ["cloud", "mobile", "web", "digital", "automation", "AI"],
                "business_modifiers": ["enterprise", "business", "corporate", "professional", "custom"]
            },
            "local_business": {
                "location_modifiers": ["local", "near me", "nearby", "[city]", "in [area]"],
                "service_suffixes": ["service", "company", "business", "shop", "store"],
                "quality_modifiers": ["best", "top", "trusted", "reliable", "professional"],
                "action_keywords": ["call", "visit", "contact", "book", "schedule", "get"]
            }
        }
        
        # Keyword expansion techniques
        self.expansion_techniques = {
            "synonyms": "Generate synonym variations",
            "related_terms": "Find related and associated terms",
            "long_tail": "Create long-tail keyword variations",
            "questions": "Generate question-based keywords",
            "comparisons": "Create comparison keywords",
            "locations": "Add location-based variations",
            "modifiers": "Add descriptive modifiers",
            "misspellings": "Include common misspellings"
        }
        
        # Negative keyword categories
        self.negative_keyword_categories = {
            "job_related": ["job", "jobs", "career", "employment", "hiring", "salary", "resume"],
            "free_seekers": ["free", "gratis", "no cost", "without charge", "complimentary"],
            "diy_related": ["diy", "do it yourself", "how to make", "homemade", "tutorial"],
            "competitor_brands": [],  # Will be populated based on industry
            "irrelevant_terms": ["cheap", "discount", "wholesale", "bulk", "used", "second hand"],
            "informational_only": ["definition", "meaning", "what is", "history of", "facts about"]
        }
    
    async def generate_keywords(self,
                              website_data: Dict[str, Any],
                              seed_keywords: List[str] = None,
                              num_keywords: int = 100,
                              include_long_tail: bool = True,
                              include_local: bool = True) -> Dict[str, Any]:
        """
        Generate comprehensive keyword list
        
        Args:
            website_data: Analyzed website data
            seed_keywords: Initial keywords to expand from
            num_keywords: Target number of keywords
            include_long_tail: Include long-tail variations
            include_local: Include local search variations
            
        Returns:
            Dictionary with categorized keywords and metadata
        """
        try:
            logger.info(f"Generating {num_keywords} keywords")
            
            # Extract business context
            business_info = website_data.get("business_info", {})
            products = website_data.get("products", [])
            existing_keywords = website_data.get("keywords", {}).get("primary_keywords", [])
            
            # Prepare seed keywords
            if not seed_keywords:
                seed_keywords = self._extract_seed_keywords(business_info, products, existing_keywords)
            
            # Generate keywords using different strategies
            keyword_results = {
                "primary_keywords": [],
                "long_tail_keywords": [],
                "local_keywords": [],
                "commercial_keywords": [],
                "informational_keywords": [],
                "negative_keywords": [],
                "keyword_groups": {},
                "total_count": 0
            }
            
            # Strategy 1: Core business keywords
            core_keywords = await self._generate_core_keywords(
                business_info, products, seed_keywords
            )
            keyword_results["primary_keywords"] = core_keywords
            
            # Strategy 2: Long-tail keywords
            if include_long_tail:
                long_tail_keywords = await self._generate_long_tail_keywords(
                    core_keywords, business_info, num_keywords // 3
                )
                keyword_results["long_tail_keywords"] = long_tail_keywords
            
            # Strategy 3: Local keywords
            if include_local:
                local_keywords = await self._generate_local_keywords(
                    core_keywords, business_info, num_keywords // 4
                )
                keyword_results["local_keywords"] = local_keywords
            
            # Strategy 4: Commercial intent keywords
            commercial_keywords = await self._generate_commercial_keywords(
                core_keywords, business_info, num_keywords // 4
            )
            keyword_results["commercial_keywords"] = commercial_keywords
            
            # Strategy 5: Informational keywords
            informational_keywords = await self._generate_informational_keywords(
                core_keywords, business_info, num_keywords // 6
            )
            keyword_results["informational_keywords"] = informational_keywords
            
            # Generate negative keywords
            negative_keywords = await self._generate_negative_keywords(business_info)
            keyword_results["negative_keywords"] = negative_keywords
            
            # Group keywords by theme
            keyword_results["keyword_groups"] = self._group_keywords_by_theme(keyword_results)
            
            # Calculate total count
            keyword_results["total_count"] = sum(
                len(keywords) for key, keywords in keyword_results.items()
                if key not in ["keyword_groups", "total_count"] and isinstance(keywords, list)
            )
            
            # Score and rank all keywords
            keyword_results = self._score_and_rank_keywords(keyword_results, business_info)
            
            logger.info(f"Generated {keyword_results['total_count']} total keywords")
            return keyword_results
            
        except Exception as e:
            logger.error(f"Keyword generation failed: {str(e)}")
            return {"error": str(e)}
    
    async def expand_keywords(self,
                            base_keywords: List[str],
                            website_data: Dict[str, Any],
                            expansion_factor: int = 5) -> List[Dict[str, Any]]:
        """
        Expand a list of base keywords
        
        Args:
            base_keywords: Keywords to expand
            website_data: Website context data
            expansion_factor: Number of variations per base keyword
            
        Returns:
            List of expanded keywords with metadata
        """
        try:
            expanded_keywords = []
            business_info = website_data.get("business_info", {})
            
            for base_keyword in base_keywords:
                # Generate variations for each base keyword
                variations = await self._expand_single_keyword(
                    base_keyword, business_info, expansion_factor
                )
                expanded_keywords.extend(variations)
            
            # Remove duplicates while preserving order
            seen = set()
            unique_keywords = []
            for keyword in expanded_keywords:
                keyword_text = keyword.get("keyword", "").lower()
                if keyword_text not in seen:
                    seen.add(keyword_text)
                    unique_keywords.append(keyword)
            
            return unique_keywords
            
        except Exception as e:
            logger.error(f"Keyword expansion failed: {str(e)}")
            return []
    
    async def generate_product_keywords(self,
                                      products: List[Dict[str, Any]],
                                      website_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate keywords specifically for products"""
        try:
            product_keywords = []
            business_info = website_data.get("business_info", {})
            
            for product in products:
                product_name = product.get("name", "")
                category = product.get("category", "")
                features = product.get("features", [])
                
                # Generate product-specific keywords
                keywords = await self._generate_single_product_keywords(
                    product, business_info
                )
                product_keywords.extend(keywords)
            
            return product_keywords
            
        except Exception as e:
            logger.error(f"Product keyword generation failed: {str(e)}")
            return []
    
    async def analyze_keyword_competition(self,
                                        keywords: List[str],
                                        business_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze keyword competition and difficulty
        
        Args:
            keywords: List of keywords to analyze
            business_info: Business context
            
        Returns:
            Dictionary with competition analysis
        """
        try:
            analysis_prompt = f"""
            Analyze the competition level and difficulty for these keywords in the {business_info.get('category', 'general')} industry:
            
            Keywords to analyze:
            {chr(10).join(f"- {keyword}" for keyword in keywords[:20])}
            
            Business Context:
            - Industry: {business_info.get('category', 'general')}
            - Business Type: {business_info.get('business_type', 'service')}
            - Location: {business_info.get('location_info', {}).get('city', 'general')}
            
            For each keyword, provide:
            1. Competition level (Low/Medium/High)
            2. Estimated difficulty score (1-100)
            3. Commercial intent level (1-10)
            4. Recommended bid strategy
            5. Alternative lower-competition variations
            
            Format your response as a structured analysis for each keyword.
            """
            
            model = self.config.get_model(GeminiModel.GEMINI_PRO)
            response = await asyncio.to_thread(model.generate_content, analysis_prompt)
            
            if response and response.text:
                return self._parse_competition_analysis(response.text, keywords)
            
            return {"error": "No analysis response"}
            
        except Exception as e:
            logger.error(f"Keyword competition analysis failed: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_core_keywords(self,
                                    business_info: Dict[str, Any],
                                    products: List[Dict[str, Any]],
                                    seed_keywords: List[str]) -> List[Dict[str, Any]]:
        """Generate core business keywords"""
        core_keywords = []
        business_category = business_info.get("category", "general")
        business_name = business_info.get("name", "Business")
        
        # Add seed keywords
        for keyword in seed_keywords:
            core_keywords.append({
                "keyword": keyword,
                "type": "seed",
                "match_type": "broad",
                "intent": "commercial",
                "score": 85
            })
        
        # Add business name variations
        name_variations = [
            business_name,
            f"{business_name} services",
            f"{business_name} company",
            f"{business_name} {business_category}"
        ]
        
        for variation in name_variations:
            core_keywords.append({
                "keyword": variation,
                "type": "brand",
                "match_type": "exact",
                "intent": "navigational",
                "score": 90
            })
        
        # Add category keywords
        category_keywords = [
            business_category,
            f"{business_category} services",
            f"professional {business_category}",
            f"expert {business_category}",
            f"best {business_category}"
        ]
        
        for keyword in category_keywords:
            core_keywords.append({
                "keyword": keyword,
                "type": "category",
                "match_type": "phrase",
                "intent": "commercial",
                "score": 80
            })
        
        return core_keywords
    
    async def _generate_long_tail_keywords(self,
                                         core_keywords: List[Dict[str, Any]],
                                         business_info: Dict[str, Any],
                                         num_keywords: int) -> List[Dict[str, Any]]:
        """Generate long-tail keyword variations"""
        long_tail_keywords = []
        business_category = business_info.get("category", "general")
        location = business_info.get("location_info", {}).get("city", "")
        
        # Long-tail modifiers
        modifiers = [
            "best", "top", "professional", "expert", "affordable", "quality",
            "reliable", "trusted", "experienced", "certified", "licensed"
        ]
        
        # Long-tail suffixes
        suffixes = [
            "services", "company", "provider", "specialist", "expert",
            "consultation", "help", "solutions", "near me"
        ]
        
        # Generate combinations
        base_keywords = [kw["keyword"] for kw in core_keywords[:10]]
        
        for base_keyword in base_keywords:
            # Add modifier + keyword combinations
            for modifier in modifiers[:3]:
                long_tail = f"{modifier} {base_keyword}"
                long_tail_keywords.append({
                    "keyword": long_tail,
                    "type": "long_tail",
                    "match_type": "phrase",
                    "intent": "commercial",
                    "score": 70,
                    "base_keyword": base_keyword
                })
            
            # Add keyword + suffix combinations
            for suffix in suffixes[:3]:
                long_tail = f"{base_keyword} {suffix}"
                long_tail_keywords.append({
                    "keyword": long_tail,
                    "type": "long_tail",
                    "match_type": "phrase",
                    "intent": "commercial",
                    "score": 75,
                    "base_keyword": base_keyword
                })
            
            if len(long_tail_keywords) >= num_keywords:
                break
        
        return long_tail_keywords[:num_keywords]
    
    async def _generate_local_keywords(self,
                                     core_keywords: List[Dict[str, Any]],
                                     business_info: Dict[str, Any],
                                     num_keywords: int) -> List[Dict[str, Any]]:
        """Generate local search keywords"""
        local_keywords = []
        location_info = business_info.get("location_info", {})
        city = location_info.get("city", "")
        state = location_info.get("state", "")
        
        if not city:
            return local_keywords
        
        # Local modifiers
        local_modifiers = [
            "near me",
            f"in {city}",
            f"{city}",
            f"{city} {state}" if state else f"{city}",
            "local",
            "nearby"
        ]
        
        # Generate local variations
        base_keywords = [kw["keyword"] for kw in core_keywords[:10]]
        
        for base_keyword in base_keywords:
            for modifier in local_modifiers:
                if modifier == "near me":
                    local_keyword = f"{base_keyword} {modifier}"
                elif modifier in ["local", "nearby"]:
                    local_keyword = f"{modifier} {base_keyword}"
                else:
                    local_keyword = f"{base_keyword} {modifier}"
                
                local_keywords.append({
                    "keyword": local_keyword,
                    "type": "local",
                    "match_type": "phrase",
                    "intent": "local",
                    "score": 85,
                    "location": city,
                    "base_keyword": base_keyword
                })
            
            if len(local_keywords) >= num_keywords:
                break
        
        return local_keywords[:num_keywords]
    
    async def _generate_commercial_keywords(self,
                                          core_keywords: List[Dict[str, Any]],
                                          business_info: Dict[str, Any],
                                          num_keywords: int) -> List[Dict[str, Any]]:
        """Generate commercial intent keywords"""
        commercial_keywords = []
        
        # Commercial modifiers
        commercial_modifiers = [
            "buy", "hire", "get", "book", "order", "purchase",
            "find", "contact", "call", "schedule"
        ]
        
        # Commercial suffixes
        commercial_suffixes = [
            "service", "company", "provider", "quote", "estimate",
            "consultation", "appointment", "help", "now"
        ]
        
        # Generate commercial variations
        base_keywords = [kw["keyword"] for kw in core_keywords[:8]]
        
        for base_keyword in base_keywords:
            # Modifier + keyword
            for modifier in commercial_modifiers[:3]:
                commercial_keyword = f"{modifier} {base_keyword}"
                commercial_keywords.append({
                    "keyword": commercial_keyword,
                    "type": "commercial",
                    "match_type": "phrase",
                    "intent": "commercial",
                    "score": 90,
                    "base_keyword": base_keyword
                })
            
            # Keyword + suffix
            for suffix in commercial_suffixes[:3]:
                commercial_keyword = f"{base_keyword} {suffix}"
                commercial_keywords.append({
                    "keyword": commercial_keyword,
                    "type": "commercial",
                    "match_type": "phrase",
                    "intent": "commercial",
                    "score": 88,
                    "base_keyword": base_keyword
                })
            
            if len(commercial_keywords) >= num_keywords:
                break
        
        return commercial_keywords[:num_keywords]
    
    async def _generate_informational_keywords(self,
                                             core_keywords: List[Dict[str, Any]],
                                             business_info: Dict[str, Any],
                                             num_keywords: int) -> List[Dict[str, Any]]:
        """Generate informational keywords"""
        informational_keywords = []
        
        # Informational modifiers
        info_modifiers = [
            "how to", "what is", "guide to", "tips for",
            "learn about", "understand", "help with"
        ]
        
        # Informational suffixes
        info_suffixes = [
            "guide", "tips", "help", "information", "advice",
            "tutorial", "explanation", "overview"
        ]
        
        # Generate informational variations
        base_keywords = [kw["keyword"] for kw in core_keywords[:5]]
        
        for base_keyword in base_keywords:
            # Modifier + keyword
            for modifier in info_modifiers[:2]:
                info_keyword = f"{modifier} {base_keyword}"
                informational_keywords.append({
                    "keyword": info_keyword,
                    "type": "informational",
                    "match_type": "phrase",
                    "intent": "informational",
                    "score": 40,
                    "base_keyword": base_keyword
                })
            
            # Keyword + suffix
            for suffix in info_suffixes[:2]:
                info_keyword = f"{base_keyword} {suffix}"
                informational_keywords.append({
                    "keyword": info_keyword,
                    "type": "informational",
                    "match_type": "phrase",
                    "intent": "informational",
                    "score": 35,
                    "base_keyword": base_keyword
                })
            
            if len(informational_keywords) >= num_keywords:
                break
        
        return informational_keywords[:num_keywords]
    
    async def _generate_negative_keywords(self, business_info: Dict[str, Any]) -> List[str]:
        """Generate negative keywords"""
        negative_keywords = []
        business_category = business_info.get("category", "general")
        
        # Add general negative keywords
        negative_keywords.extend(self.negative_keyword_categories["job_related"])
        negative_keywords.extend(self.negative_keyword_categories["free_seekers"])
        negative_keywords.extend(self.negative_keyword_categories["diy_related"])
        negative_keywords.extend(self.negative_keyword_categories["irrelevant_terms"])
        
        # Add category-specific negatives
        if business_category == "professional_services":
            negative_keywords.extend(["intern", "student", "course", "training", "school"])
        elif business_category == "ecommerce":
            negative_keywords.extend(["wholesale", "bulk", "distributor", "supplier"])
        elif business_category == "healthcare":
            negative_keywords.extend(["veterinary", "animal", "pet", "vet"])
        
        return list(set(negative_keywords))  # Remove duplicates
    
    def _extract_seed_keywords(self,
                             business_info: Dict[str, Any],
                             products: List[Dict[str, Any]],
                             existing_keywords: List[Dict[str, Any]]) -> List[str]:
        """Extract seed keywords from business data"""
        seed_keywords = []
        
        # From business info
        business_name = business_info.get("name", "")
        business_category = business_info.get("category", "")
        
        if business_name:
            seed_keywords.append(business_name.lower())
        if business_category:
            seed_keywords.append(business_category.lower())
        
        # From products
        for product in products[:5]:
            product_name = product.get("name", "")
            category = product.get("category", "")
            
            if product_name:
                seed_keywords.append(product_name.lower())
            if category:
                seed_keywords.append(category.lower())
        
        # From existing keywords
        for kw in existing_keywords[:10]:
            keyword = kw.get("keyword", "")
            if keyword:
                seed_keywords.append(keyword.lower())
        
        # Remove duplicates and empty strings
        seed_keywords = list(set([kw for kw in seed_keywords if kw.strip()]))
        
        return seed_keywords[:20]  # Limit to 20 seed keywords
    
    async def _expand_single_keyword(self,
                                   base_keyword: str,
                                   business_info: Dict[str, Any],
                                   expansion_factor: int) -> List[Dict[str, Any]]:
        """Expand a single keyword into variations"""
        variations = []
        business_category = business_info.get("category", "general")
        
        # Get industry patterns
        patterns = self.industry_patterns.get(business_category, {})
        
        # Add modifier variations
        modifiers = patterns.get("service_modifiers", ["professional", "expert", "best"])
        for modifier in modifiers[:expansion_factor//2]:
            variations.append({
                "keyword": f"{modifier} {base_keyword}",
                "type": "modified",
                "match_type": "phrase",
                "intent": "commercial",
                "score": 75,
                "base_keyword": base_keyword
            })
        
        # Add suffix variations
        suffixes = patterns.get("service_suffixes", ["service", "company", "provider"])
        for suffix in suffixes[:expansion_factor//2]:
            variations.append({
                "keyword": f"{base_keyword} {suffix}",
                "type": "suffixed",
                "match_type": "phrase",
                "intent": "commercial",
                "score": 70,
                "base_keyword": base_keyword
            })
        
        return variations
    
    async def _generate_single_product_keywords(self,
                                              product: Dict[str, Any],
                                              business_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate keywords for a single product"""
        keywords = []
        product_name = product.get("name", "")
        category = product.get("category", "")
        features = product.get("features", [])
        
        if not product_name:
            return keywords
        
        # Product name variations
        product_keywords = [
            product_name,
            f"buy {product_name}",
            f"shop {product_name}",
            f"{product_name} online",
            f"{product_name} price",
            f"{product_name} reviews"
        ]
        
        for keyword in product_keywords:
            keywords.append({
                "keyword": keyword,
                "type": "product",
                "match_type": "phrase",
                "intent": "commercial",
                "score": 80,
                "product": product_name
            })
        
        # Category keywords
        if category:
            category_keywords = [
                category,
                f"buy {category}",
                f"shop {category}",
                f"{category} online"
            ]
            
            for keyword in category_keywords:
                keywords.append({
                    "keyword": keyword,
                    "type": "category",
                    "match_type": "phrase",
                    "intent": "commercial",
                    "score": 70,
                    "category": category
                })
        
        return keywords
    
    def _group_keywords_by_theme(self, keyword_results: Dict[str, Any]) -> Dict[str, List[str]]:
        """Group keywords by theme/topic"""
        groups = {}
        
        # Combine all keywords
        all_keywords = []
        for key, keywords in keyword_results.items():
            if isinstance(keywords, list) and key != "negative_keywords":
                all_keywords.extend(keywords)
        
        # Simple grouping by keyword type
        for keyword_data in all_keywords:
            if isinstance(keyword_data, dict):
                keyword_type = keyword_data.get("type", "general")
                keyword_text = keyword_data.get("keyword", "")
                
                if keyword_type not in groups:
                    groups[keyword_type] = []
                
                groups[keyword_type].append(keyword_text)
        
        return groups
    
    def _score_and_rank_keywords(self,
                               keyword_results: Dict[str, Any],
                               business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Score and rank all keywords"""
        business_category = business_info.get("category", "general")
        
        # Score each keyword category
        for category, keywords in keyword_results.items():
            if isinstance(keywords, list) and category != "negative_keywords":
                for keyword_data in keywords:
                    if isinstance(keyword_data, dict):
                        # Calculate final score based on multiple factors
                        base_score = keyword_data.get("score", 50)
                        
                        # Adjust score based on keyword type
                        type_multipliers = {
                            "brand": 1.2,
                            "commercial": 1.1,
                            "local": 1.15,
                            "product": 1.1,
                            "long_tail": 0.9,
                            "informational": 0.6
                        }
                        
                        keyword_type = keyword_data.get("type", "general")
                        multiplier = type_multipliers.get(keyword_type, 1.0)
                        
                        final_score = min(100, base_score * multiplier)
                        keyword_data["final_score"] = round(final_score, 1)
                
                # Sort by final score
                keywords.sort(key=lambda x: x.get("final_score", 0), reverse=True)
        
        return keyword_results
    
    def _parse_competition_analysis(self, response_text: str, keywords: List[str]) -> Dict[str, Any]:
        """Parse competition analysis response"""
        analysis = {
            "keywords": {},
            "summary": {
                "high_competition": 0,
                "medium_competition": 0,
                "low_competition": 0,
                "average_difficulty": 0
            }
        }
        
        lines = response_text.split('\n')
        current_keyword = None
        
        for line in lines:
            line = line.strip()
            
            # Try to identify keyword being analyzed
            for keyword in keywords:
                if keyword.lower() in line.lower():
                    current_keyword = keyword
                    analysis["keywords"][keyword] = {
                        "competition": "medium",
                        "difficulty": 50,
                        "commercial_intent": 5,
                        "bid_strategy": "automated",
                        "alternatives": []
                    }
                    break
            
            # Parse competition level
            if current_keyword and "competition" in line.lower():
                if "high" in line.lower():
                    analysis["keywords"][current_keyword]["competition"] = "high"
                    analysis["summary"]["high_competition"] += 1
                elif "low" in line.lower():
                    analysis["keywords"][current_keyword]["competition"] = "low"
                    analysis["summary"]["low_competition"] += 1
                else:
                    analysis["keywords"][current_keyword]["competition"] = "medium"
                    analysis["summary"]["medium_competition"] += 1
        
        return analysis
    
    def get_keyword_suggestions(self, business_type: str, location: str = "") -> List[str]:
        """Get quick keyword suggestions based on business type"""
        suggestions = []
        
        if business_type == "ecommerce":
            suggestions = [
                "online store", "buy online", "shop now", "best deals",
                "free shipping", "discount", "sale", "new arrivals"
            ]
        elif business_type == "professional_services":
            suggestions = [
                "professional service", "expert help", "consultation",
                "licensed", "certified", "experienced", "trusted"
            ]
        elif business_type == "local_business":
            suggestions = [
                "local business", "near me", "in area", "community",
                "neighborhood", "family owned", "locally operated"
            ]
        else:
            suggestions = [
                "professional", "expert", "quality", "reliable",
                "trusted", "experienced", "best", "top rated"
            ]
        
        # Add location-based suggestions
        if location:
            location_suggestions = [
                f"{location} {business_type}",
                f"{business_type} in {location}",
                f"{location} area {business_type}",
                f"best {business_type} {location}"
            ]
            suggestions.extend(location_suggestions)
        
        return suggestions

