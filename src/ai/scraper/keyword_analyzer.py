# Google Ads AI Platform - Keyword Analyzer
# Advanced keyword analysis and extraction for Google Ads campaigns

import re
import logging
from typing import Dict, Any, List, Optional, Set, Tuple
from collections import Counter, defaultdict
import math

from .config import ScrapeConfig

logger = logging.getLogger(__name__)

class KeywordAnalyzer:
    """
    Advanced keyword analysis and extraction system
    
    Provides comprehensive keyword analysis including:
    - Primary keyword extraction
    - Secondary keyword identification
    - Long-tail keyword discovery
    - Keyword density analysis
    - Semantic keyword grouping
    - Competition analysis
    - Search intent classification
    """
    
    def __init__(self, config: ScrapeConfig):
        """Initialize keyword analyzer with configuration"""
        self.config = config
        
        # Common stop words (English and Arabic)
        self.stop_words = {
            'en': {
                'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
                'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
                'to', 'was', 'will', 'with', 'we', 'you', 'your', 'our', 'this',
                'these', 'they', 'them', 'their', 'have', 'had', 'can', 'could',
                'would', 'should', 'may', 'might', 'must', 'shall', 'do', 'does',
                'did', 'get', 'got', 'go', 'going', 'come', 'came', 'see', 'saw',
                'make', 'made', 'take', 'took', 'give', 'gave', 'know', 'knew'
            },
            'ar': {
                'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
                'التي', 'الذي', 'التي', 'اللذان', 'اللتان', 'اللذين', 'اللتين',
                'هو', 'هي', 'هم', 'هن', 'أنت', 'أنتم', 'أنتن', 'نحن', 'أنا',
                'كان', 'كانت', 'كانوا', 'كن', 'يكون', 'تكون', 'يكونوا', 'يكن',
                'لا', 'لم', 'لن', 'ما', 'لكن', 'لكن', 'أو', 'أم', 'بل', 'غير',
                'سوف', 'قد', 'لقد', 'كل', 'بعض', 'جميع', 'كلا', 'كلتا'
            }
        }
        
        # Commercial intent keywords
        self.commercial_keywords = {
            'buy', 'purchase', 'order', 'shop', 'store', 'sale', 'discount',
            'price', 'cost', 'cheap', 'affordable', 'best', 'top', 'review',
            'compare', 'vs', 'versus', 'deal', 'offer', 'free', 'shipping',
            'delivery', 'online', 'website', 'service', 'company', 'business'
        }
        
        # Informational intent keywords
        self.informational_keywords = {
            'how', 'what', 'why', 'when', 'where', 'guide', 'tutorial',
            'tips', 'advice', 'help', 'learn', 'understand', 'explain',
            'definition', 'meaning', 'example', 'benefits', 'advantages'
        }
        
        # Navigational intent keywords
        self.navigational_keywords = {
            'login', 'sign', 'account', 'contact', 'about', 'home', 'page',
            'site', 'website', 'official', 'main', 'headquarters', 'location'
        }
    
    async def analyze_keywords(self, text_content: str, title: str = "", meta_description: str = "") -> Dict[str, Any]:
        """
        Perform comprehensive keyword analysis
        
        Args:
            text_content: Main text content to analyze
            title: Page title
            meta_description: Meta description
            
        Returns:
            Dictionary containing keyword analysis results
        """
        try:
            logger.info("Starting keyword analysis")
            
            # Combine all text sources
            combined_text = f"{title} {meta_description} {text_content}"
            
            # Clean and preprocess text
            cleaned_text = self._preprocess_text(combined_text)
            
            # Extract keywords of different types
            analysis_results = {
                "primary_keywords": await self._extract_primary_keywords(cleaned_text, title),
                "secondary_keywords": await self._extract_secondary_keywords(cleaned_text),
                "long_tail_keywords": await self._extract_long_tail_keywords(cleaned_text),
                "branded_keywords": await self._extract_branded_keywords(cleaned_text, title),
                "local_keywords": await self._extract_local_keywords(cleaned_text),
                "commercial_keywords": await self._extract_commercial_keywords(cleaned_text),
                "keyword_density": await self._calculate_keyword_density(cleaned_text),
                "keyword_clusters": await self._create_keyword_clusters(cleaned_text),
                "search_intent": await self._analyze_search_intent(cleaned_text),
                "keyword_suggestions": await self._generate_keyword_suggestions(cleaned_text),
                "competitor_keywords": await self._identify_competitor_keywords(cleaned_text)
            }
            
            # Calculate keyword scores and rankings
            analysis_results["keyword_scores"] = await self._calculate_keyword_scores(analysis_results)
            
            # Generate keyword recommendations for Google Ads
            analysis_results["google_ads_recommendations"] = await self._generate_ads_recommendations(analysis_results)
            
            logger.info("Keyword analysis completed successfully")
            return analysis_results
            
        except Exception as e:
            logger.error(f"Keyword analysis failed: {str(e)}")
            return {"error": str(e)}
    
    async def _extract_primary_keywords(self, text: str, title: str = "") -> List[Dict[str, Any]]:
        """Extract primary keywords (1-2 words, high frequency, high relevance)"""
        try:
            # Tokenize text
            words = self._tokenize_text(text)
            
            # Remove stop words
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            
            # Count word frequencies
            word_freq = Counter(filtered_words)
            
            # Extract 1-2 word phrases
            phrases = []
            
            # Single words
            for word, freq in word_freq.most_common(50):
                if len(word) >= 3 and freq >= 2:
                    score = self._calculate_keyword_score(word, freq, text, title)
                    phrases.append({
                        "keyword": word,
                        "frequency": freq,
                        "score": score,
                        "type": "single_word"
                    })
            
            # Two-word phrases
            bigrams = self._extract_ngrams(filtered_words, 2)
            bigram_freq = Counter(bigrams)
            
            for bigram, freq in bigram_freq.most_common(30):
                if freq >= 2:
                    keyword = " ".join(bigram)
                    score = self._calculate_keyword_score(keyword, freq, text, title)
                    phrases.append({
                        "keyword": keyword,
                        "frequency": freq,
                        "score": score,
                        "type": "bigram"
                    })
            
            # Sort by score and return top keywords
            phrases.sort(key=lambda x: x["score"], reverse=True)
            return phrases[:15]
            
        except Exception as e:
            logger.error(f"Primary keyword extraction failed: {str(e)}")
            return []
    
    async def _extract_secondary_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract secondary keywords (supporting keywords, medium frequency)"""
        try:
            words = self._tokenize_text(text)
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            
            # Extract 2-3 word phrases
            phrases = []
            
            # Three-word phrases
            trigrams = self._extract_ngrams(filtered_words, 3)
            trigram_freq = Counter(trigrams)
            
            for trigram, freq in trigram_freq.most_common(25):
                if freq >= 2:
                    keyword = " ".join(trigram)
                    score = self._calculate_keyword_score(keyword, freq, text)
                    phrases.append({
                        "keyword": keyword,
                        "frequency": freq,
                        "score": score,
                        "type": "trigram"
                    })
            
            # Related terms and synonyms
            related_terms = self._find_related_terms(filtered_words)
            for term, relevance in related_terms:
                phrases.append({
                    "keyword": term,
                    "frequency": text.lower().count(term.lower()),
                    "score": relevance,
                    "type": "related"
                })
            
            # Sort by score
            phrases.sort(key=lambda x: x["score"], reverse=True)
            return phrases[:20]
            
        except Exception as e:
            logger.error(f"Secondary keyword extraction failed: {str(e)}")
            return []
    
    async def _extract_long_tail_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract long-tail keywords (4+ words, specific phrases)"""
        try:
            words = self._tokenize_text(text)
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            
            phrases = []
            
            # Four-word phrases
            fourgrams = self._extract_ngrams(filtered_words, 4)
            fourgram_freq = Counter(fourgrams)
            
            for fourgram, freq in fourgram_freq.most_common(20):
                if freq >= 1:
                    keyword = " ".join(fourgram)
                    score = self._calculate_keyword_score(keyword, freq, text)
                    phrases.append({
                        "keyword": keyword,
                        "frequency": freq,
                        "score": score,
                        "type": "long_tail"
                    })
            
            # Five-word phrases
            fivegrams = self._extract_ngrams(filtered_words, 5)
            fivegram_freq = Counter(fivegrams)
            
            for fivegram, freq in fivegram_freq.most_common(15):
                if freq >= 1:
                    keyword = " ".join(fivegram)
                    score = self._calculate_keyword_score(keyword, freq, text)
                    phrases.append({
                        "keyword": keyword,
                        "frequency": freq,
                        "score": score,
                        "type": "long_tail"
                    })
            
            # Question-based long-tail keywords
            question_keywords = self._extract_question_keywords(text)
            phrases.extend(question_keywords)
            
            # Sort by score
            phrases.sort(key=lambda x: x["score"], reverse=True)
            return phrases[:25]
            
        except Exception as e:
            logger.error(f"Long-tail keyword extraction failed: {str(e)}")
            return []
    
    async def _extract_branded_keywords(self, text: str, title: str = "") -> List[Dict[str, Any]]:
        """Extract branded keywords (company names, product names)"""
        try:
            # Extract potential brand names from title and text
            brand_patterns = [
                r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b',  # Capitalized words
                r'\b[A-Z]{2,}\b',  # Acronyms
                r'\b\w+(?:\.com|\.net|\.org)\b'  # Domain names
            ]
            
            branded_keywords = []
            combined_text = f"{title} {text}"
            
            for pattern in brand_patterns:
                matches = re.findall(pattern, combined_text)
                for match in matches:
                    if len(match) >= 2 and not match.lower() in self._get_stop_words(text):
                        frequency = combined_text.lower().count(match.lower())
                        if frequency >= 1:
                            branded_keywords.append({
                                "keyword": match,
                                "frequency": frequency,
                                "score": frequency * 2,  # Higher weight for branded terms
                                "type": "branded"
                            })
            
            # Remove duplicates and sort
            seen = set()
            unique_keywords = []
            for kw in branded_keywords:
                if kw["keyword"].lower() not in seen:
                    seen.add(kw["keyword"].lower())
                    unique_keywords.append(kw)
            
            unique_keywords.sort(key=lambda x: x["score"], reverse=True)
            return unique_keywords[:10]
            
        except Exception as e:
            logger.error(f"Branded keyword extraction failed: {str(e)}")
            return []
    
    async def _extract_local_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract local/geographic keywords"""
        try:
            # Common location indicators
            location_patterns = [
                r'\b(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
                r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:city|town|area|region|district)\b',
                r'\b(?:located|based|serving)\s+(?:in|at)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
            ]
            
            local_keywords = []
            
            for pattern in location_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0] if match[0] else match[1]
                    
                    if len(match) >= 3:
                        frequency = text.lower().count(match.lower())
                        local_keywords.append({
                            "keyword": match,
                            "frequency": frequency,
                            "score": frequency * 1.5,  # Higher weight for local terms
                            "type": "local"
                        })
            
            # Remove duplicates and sort
            seen = set()
            unique_keywords = []
            for kw in local_keywords:
                if kw["keyword"].lower() not in seen:
                    seen.add(kw["keyword"].lower())
                    unique_keywords.append(kw)
            
            unique_keywords.sort(key=lambda x: x["score"], reverse=True)
            return unique_keywords[:8]
            
        except Exception as e:
            logger.error(f"Local keyword extraction failed: {str(e)}")
            return []
    
    async def _extract_commercial_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract commercial intent keywords"""
        try:
            commercial_keywords = []
            text_lower = text.lower()
            
            for keyword in self.commercial_keywords:
                frequency = text_lower.count(keyword)
                if frequency > 0:
                    commercial_keywords.append({
                        "keyword": keyword,
                        "frequency": frequency,
                        "score": frequency * 2,  # Higher weight for commercial terms
                        "type": "commercial"
                    })
            
            # Extract price-related keywords
            price_patterns = [
                r'\$\d+(?:\.\d{2})?',
                r'\b\d+\s*(?:dollars?|usd|eur|gbp)\b',
                r'\b(?:free|cheap|affordable|expensive|premium)\b'
            ]
            
            for pattern in price_patterns:
                matches = re.findall(pattern, text_lower)
                for match in matches:
                    commercial_keywords.append({
                        "keyword": match,
                        "frequency": text_lower.count(match),
                        "score": text_lower.count(match) * 1.5,
                        "type": "price"
                    })
            
            commercial_keywords.sort(key=lambda x: x["score"], reverse=True)
            return commercial_keywords[:15]
            
        except Exception as e:
            logger.error(f"Commercial keyword extraction failed: {str(e)}")
            return []
    
    async def _calculate_keyword_density(self, text: str) -> Dict[str, float]:
        """Calculate keyword density for top keywords"""
        try:
            words = self._tokenize_text(text)
            total_words = len(words)
            
            if total_words == 0:
                return {}
            
            # Get top keywords
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            word_freq = Counter(filtered_words)
            
            density = {}
            for word, freq in word_freq.most_common(20):
                density[word] = (freq / total_words) * 100
            
            return density
            
        except Exception as e:
            logger.error(f"Keyword density calculation failed: {str(e)}")
            return {}
    
    async def _create_keyword_clusters(self, text: str) -> Dict[str, List[str]]:
        """Create semantic keyword clusters"""
        try:
            words = self._tokenize_text(text)
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            
            # Simple clustering based on co-occurrence
            clusters = defaultdict(list)
            
            # Business-related cluster
            business_terms = ['business', 'company', 'service', 'professional', 'corporate']
            for term in business_terms:
                if term in filtered_words:
                    clusters['business'].extend([w for w in filtered_words if self._words_related(term, w, text)])
            
            # Product-related cluster
            product_terms = ['product', 'item', 'goods', 'merchandise', 'solution']
            for term in product_terms:
                if term in filtered_words:
                    clusters['products'].extend([w for w in filtered_words if self._words_related(term, w, text)])
            
            # Service-related cluster
            service_terms = ['service', 'support', 'help', 'assistance', 'consultation']
            for term in service_terms:
                if term in filtered_words:
                    clusters['services'].extend([w for w in filtered_words if self._words_related(term, w, text)])
            
            # Remove duplicates from clusters
            for cluster_name in clusters:
                clusters[cluster_name] = list(set(clusters[cluster_name]))
            
            return dict(clusters)
            
        except Exception as e:
            logger.error(f"Keyword clustering failed: {str(e)}")
            return {}
    
    async def _analyze_search_intent(self, text: str) -> Dict[str, float]:
        """Analyze search intent distribution"""
        try:
            text_lower = text.lower()
            total_words = len(self._tokenize_text(text))
            
            if total_words == 0:
                return {}
            
            # Count intent indicators
            commercial_count = sum(text_lower.count(kw) for kw in self.commercial_keywords)
            informational_count = sum(text_lower.count(kw) for kw in self.informational_keywords)
            navigational_count = sum(text_lower.count(kw) for kw in self.navigational_keywords)
            
            total_intent_words = commercial_count + informational_count + navigational_count
            
            if total_intent_words == 0:
                return {"commercial": 0.33, "informational": 0.33, "navigational": 0.34}
            
            return {
                "commercial": commercial_count / total_intent_words,
                "informational": informational_count / total_intent_words,
                "navigational": navigational_count / total_intent_words
            }
            
        except Exception as e:
            logger.error(f"Search intent analysis failed: {str(e)}")
            return {}
    
    async def _generate_keyword_suggestions(self, text: str) -> List[Dict[str, Any]]:
        """Generate additional keyword suggestions"""
        try:
            suggestions = []
            
            # Extract main topics
            words = self._tokenize_text(text)
            filtered_words = [word for word in words if word.lower() not in self._get_stop_words(text)]
            word_freq = Counter(filtered_words)
            
            top_words = [word for word, freq in word_freq.most_common(10)]
            
            # Generate combinations
            for i, word1 in enumerate(top_words[:5]):
                for word2 in top_words[i+1:8]:
                    suggestion = f"{word1} {word2}"
                    suggestions.append({
                        "keyword": suggestion,
                        "type": "suggested_combination",
                        "relevance": 0.8
                    })
            
            # Add modifier suggestions
            modifiers = ['best', 'top', 'professional', 'affordable', 'quality', 'expert']
            for word in top_words[:5]:
                for modifier in modifiers:
                    suggestions.append({
                        "keyword": f"{modifier} {word}",
                        "type": "modified_keyword",
                        "relevance": 0.7
                    })
            
            return suggestions[:20]
            
        except Exception as e:
            logger.error(f"Keyword suggestion generation failed: {str(e)}")
            return []
    
    async def _identify_competitor_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Identify potential competitor keywords"""
        try:
            competitor_keywords = []
            
            # Look for competitor mentions
            competitor_patterns = [
                r'\b(?:vs|versus|compared to|alternative to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
                r'\b(?:like|similar to|such as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'
            ]
            
            for pattern in competitor_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0] if match[0] else match[1]
                    
                    competitor_keywords.append({
                        "keyword": match,
                        "type": "competitor",
                        "relevance": 0.6
                    })
            
            return competitor_keywords[:10]
            
        except Exception as e:
            logger.error(f"Competitor keyword identification failed: {str(e)}")
            return []
    
    async def _calculate_keyword_scores(self, analysis_results: Dict[str, Any]) -> Dict[str, float]:
        """Calculate overall scores for all keywords"""
        try:
            all_keywords = {}
            
            # Collect all keywords with weights
            keyword_sources = [
                ("primary_keywords", 3.0),
                ("secondary_keywords", 2.0),
                ("long_tail_keywords", 1.5),
                ("branded_keywords", 2.5),
                ("local_keywords", 2.0),
                ("commercial_keywords", 2.5)
            ]
            
            for source, weight in keyword_sources:
                keywords = analysis_results.get(source, [])
                for kw_data in keywords:
                    keyword = kw_data.get("keyword", "")
                    score = kw_data.get("score", 0) * weight
                    
                    if keyword in all_keywords:
                        all_keywords[keyword] += score
                    else:
                        all_keywords[keyword] = score
            
            return all_keywords
            
        except Exception as e:
            logger.error(f"Keyword score calculation failed: {str(e)}")
            return {}
    
    async def _generate_ads_recommendations(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Google Ads keyword recommendations"""
        try:
            recommendations = {
                "exact_match": [],
                "phrase_match": [],
                "broad_match": [],
                "negative_keywords": []
            }
            
            # Get top keywords
            primary_kw = analysis_results.get("primary_keywords", [])[:10]
            secondary_kw = analysis_results.get("secondary_keywords", [])[:15]
            long_tail_kw = analysis_results.get("long_tail_keywords", [])[:20]
            
            # Exact match - high-value, specific keywords
            for kw_data in primary_kw[:5]:
                recommendations["exact_match"].append({
                    "keyword": f'[{kw_data["keyword"]}]',
                    "score": kw_data.get("score", 0),
                    "bid_suggestion": "high"
                })
            
            # Phrase match - medium specificity
            for kw_data in primary_kw[5:] + secondary_kw[:10]:
                recommendations["phrase_match"].append({
                    "keyword": f'"{kw_data["keyword"]}"',
                    "score": kw_data.get("score", 0),
                    "bid_suggestion": "medium"
                })
            
            # Broad match - discovery keywords
            for kw_data in secondary_kw[10:] + long_tail_kw[:15]:
                recommendations["broad_match"].append({
                    "keyword": kw_data["keyword"],
                    "score": kw_data.get("score", 0),
                    "bid_suggestion": "low"
                })
            
            # Negative keywords - common irrelevant terms
            negative_terms = ['free', 'cheap', 'diy', 'tutorial', 'how to']
            for term in negative_terms:
                recommendations["negative_keywords"].append(f"-{term}")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Ads recommendations generation failed: {str(e)}")
            return {}
    
    async def optimize_keywords(self, keywords_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize and deduplicate keywords"""
        try:
            # Combine all keyword lists
            all_keywords = []
            
            for category in ["primary_keywords", "secondary_keywords", "long_tail_keywords"]:
                if category in keywords_data:
                    all_keywords.extend(keywords_data[category])
            
            # Remove duplicates based on keyword text
            seen_keywords = set()
            unique_keywords = []
            
            for kw_data in all_keywords:
                keyword = kw_data.get("keyword", "").lower()
                if keyword not in seen_keywords and len(keyword) >= 2:
                    seen_keywords.add(keyword)
                    unique_keywords.append(kw_data)
            
            # Sort by score
            unique_keywords.sort(key=lambda x: x.get("score", 0), reverse=True)
            
            # Redistribute into categories
            optimized_keywords = {
                "primary_keywords": unique_keywords[:10],
                "secondary_keywords": unique_keywords[10:25],
                "long_tail_keywords": unique_keywords[25:50]
            }
            
            # Preserve other data
            for key, value in keywords_data.items():
                if key not in optimized_keywords:
                    optimized_keywords[key] = value
            
            return optimized_keywords
            
        except Exception as e:
            logger.error(f"Keyword optimization failed: {str(e)}")
            return keywords_data
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text for analysis"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove special characters but keep spaces and basic punctuation
        text = re.sub(r'[^\w\s\-\.]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _tokenize_text(self, text: str) -> List[str]:
        """Tokenize text into words"""
        if not text:
            return []
        
        # Split on whitespace and filter empty strings
        words = [word.strip() for word in text.split() if word.strip()]
        
        # Filter out very short words and numbers
        words = [word for word in words if len(word) >= 2 and not word.isdigit()]
        
        return words
    
    def _extract_ngrams(self, words: List[str], n: int) -> List[Tuple[str, ...]]:
        """Extract n-grams from word list"""
        if len(words) < n:
            return []
        
        ngrams = []
        for i in range(len(words) - n + 1):
            ngram = tuple(words[i:i + n])
            ngrams.append(ngram)
        
        return ngrams
    
    def _get_stop_words(self, text: str) -> Set[str]:
        """Get appropriate stop words based on text language"""
        # Simple language detection
        if any(char in text for char in 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'):
            return self.stop_words['ar']
        else:
            return self.stop_words['en']
    
    def _calculate_keyword_score(self, keyword: str, frequency: int, text: str, title: str = "") -> float:
        """Calculate relevance score for a keyword"""
        score = frequency
        
        # Boost score if keyword appears in title
        if title and keyword.lower() in title.lower():
            score *= 2
        
        # Boost score for longer keywords (more specific)
        word_count = len(keyword.split())
        if word_count > 1:
            score *= (1 + (word_count - 1) * 0.2)
        
        # Boost score for commercial keywords
        if any(comm_kw in keyword.lower() for comm_kw in self.commercial_keywords):
            score *= 1.5
        
        return score
    
    def _find_related_terms(self, words: List[str]) -> List[Tuple[str, float]]:
        """Find related terms using simple co-occurrence"""
        related_terms = []
        word_freq = Counter(words)
        
        # Simple related term detection based on common patterns
        for word in word_freq.most_common(20):
            word_text = word[0]
            
            # Find words that commonly appear near this word
            related_score = word_freq[word_text] / len(words)
            if related_score > 0.01:  # Minimum threshold
                related_terms.append((word_text, related_score))
        
        return related_terms[:10]
    
    def _extract_question_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Extract question-based keywords"""
        question_keywords = []
        
        # Question patterns
        question_patterns = [
            r'\b(?:how to|what is|why do|when to|where to|which)\s+([^.?!]+)',
            r'\b(?:can you|do you|will you|should i)\s+([^.?!]+)'
        ]
        
        for pattern in question_patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                if len(match.strip()) > 5:
                    question_keywords.append({
                        "keyword": match.strip(),
                        "frequency": 1,
                        "score": 1.2,  # Questions are valuable for long-tail
                        "type": "question"
                    })
        
        return question_keywords[:10]
    
    def _words_related(self, word1: str, word2: str, text: str) -> bool:
        """Check if two words are related based on co-occurrence"""
        # Simple co-occurrence check within a window
        text_lower = text.lower()
        word1_positions = [m.start() for m in re.finditer(r'\b' + re.escape(word1.lower()) + r'\b', text_lower)]
        word2_positions = [m.start() for m in re.finditer(r'\b' + re.escape(word2.lower()) + r'\b', text_lower)]
        
        # Check if words appear within 50 characters of each other
        for pos1 in word1_positions:
            for pos2 in word2_positions:
                if abs(pos1 - pos2) <= 50:
                    return True
        
        return False

