# Google Ads AI Platform - Quality Checker
# Advanced quality assessment and scoring engine

import logging
import asyncio
import re
import json
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
import numpy as np
from textblob import TextBlob
try:
    import validators
except ImportError:
    validators = None

logger = logging.getLogger(__name__)

class QualityDimension(Enum):
    """Quality assessment dimensions"""
    RELEVANCE = "relevance"
    CLARITY = "clarity"
    COMPLETENESS = "completeness"
    ACCURACY = "accuracy"
    CONSISTENCY = "consistency"
    EFFECTIVENESS = "effectiveness"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"

class QualityLevel(Enum):
    """Quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

@dataclass
class QualityMetric:
    """Single quality metric"""
    dimension: QualityDimension
    score: float
    level: QualityLevel
    description: str
    weight: float
    details: Dict[str, Any]
    recommendations: List[str]

@dataclass
class QualityAssessment:
    """Complete quality assessment"""
    overall_score: float
    overall_level: QualityLevel
    metrics: List[QualityMetric]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    assessment_time: float
    timestamp: str
    metadata: Dict[str, Any]

class QualityChecker:
    """
    Advanced quality assessment and scoring engine
    
    Evaluates quality across multiple dimensions:
    - Content relevance and clarity
    - Data completeness and accuracy
    - Campaign effectiveness potential
    - Compliance with best practices
    - Performance optimization
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize quality checker"""
        self.config = config or {}
        
        # Quality configuration
        self.quality_config = {
            "strict_mode": self.config.get("strict_mode", False),
            "min_acceptable_score": self.config.get("min_acceptable_score", 70.0),
            "enable_detailed_analysis": self.config.get("enable_detailed_analysis", True),
            "include_recommendations": self.config.get("include_recommendations", True),
            "weight_performance_metrics": self.config.get("weight_performance_metrics", True)
        }
        
        # Quality dimension weights
        self.dimension_weights = {
            QualityDimension.RELEVANCE: 0.20,
            QualityDimension.CLARITY: 0.15,
            QualityDimension.COMPLETENESS: 0.15,
            QualityDimension.ACCURACY: 0.15,
            QualityDimension.CONSISTENCY: 0.10,
            QualityDimension.EFFECTIVENESS: 0.15,
            QualityDimension.COMPLIANCE: 0.05,
            QualityDimension.PERFORMANCE: 0.05
        }
        
        # Quality level thresholds
        self.quality_thresholds = {
            QualityLevel.EXCELLENT: 90.0,
            QualityLevel.GOOD: 75.0,
            QualityLevel.FAIR: 60.0,
            QualityLevel.POOR: 40.0,
            QualityLevel.CRITICAL: 0.0
        }
        
        # Best practice patterns
        self.best_practices = {
            "headline_patterns": [
                r"\b(save|get|discover|learn|find|buy|order)\b",  # Action words
                r"\b\d+%?\b",  # Numbers/percentages
                r"\b(free|new|best|top|exclusive)\b",  # Power words
                r"\?$"  # Questions
            ],
            "description_patterns": [
                r"\b(call|click|visit|contact|order|buy|learn more)\b",  # CTAs
                r"\b(guarantee|warranty|certified|trusted)\b",  # Trust signals
                r"\b(today|now|limited|offer|deal)\b"  # Urgency
            ],
            "keyword_patterns": [
                r"\b(buy|purchase|order|get|find)\b",  # Commercial intent
                r"\b(near me|in [A-Z][a-z]+)\b",  # Local intent
                r"\b(how to|what is|guide|tips)\b"  # Informational intent
            ]
        }
        
        # Performance indicators
        self.performance_indicators = {
            "high_ctr_keywords": ["buy", "sale", "discount", "free", "new"],
            "high_conversion_terms": ["order", "purchase", "get quote", "contact"],
            "brand_protection_terms": ["official", "authorized", "genuine"],
            "seasonal_terms": ["holiday", "summer", "winter", "black friday"]
        }
        
        # Quality statistics
        self.quality_stats = {
            "total_assessments": 0,
            "average_score": 0.0,
            "score_distribution": {level.value: 0 for level in QualityLevel},
            "common_issues": {},
            "improvement_trends": []
        }
    
    async def assess_campaign_quality(self,
                                    campaign_data: Dict[str, Any],
                                    context: Dict[str, Any] = None) -> QualityAssessment:
        """
        Assess overall campaign quality
        
        Args:
            campaign_data: Campaign data to assess
            context: Additional context for assessment
            
        Returns:
            QualityAssessment with detailed scores and recommendations
        """
        start_time = datetime.now()
        
        try:
            logger.info("Assessing campaign quality")
            
            context = context or {}
            metrics = []
            
            # Assess each quality dimension
            relevance_metric = await self._assess_relevance(campaign_data, context)
            metrics.append(relevance_metric)
            
            clarity_metric = await self._assess_clarity(campaign_data, context)
            metrics.append(clarity_metric)
            
            completeness_metric = await self._assess_completeness(campaign_data, context)
            metrics.append(completeness_metric)
            
            accuracy_metric = await self._assess_accuracy(campaign_data, context)
            metrics.append(accuracy_metric)
            
            consistency_metric = await self._assess_consistency(campaign_data, context)
            metrics.append(consistency_metric)
            
            effectiveness_metric = await self._assess_effectiveness(campaign_data, context)
            metrics.append(effectiveness_metric)
            
            compliance_metric = await self._assess_compliance(campaign_data, context)
            metrics.append(compliance_metric)
            
            performance_metric = await self._assess_performance_potential(campaign_data, context)
            metrics.append(performance_metric)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(metrics)
            overall_level = self._determine_quality_level(overall_score)
            
            # Identify strengths and weaknesses
            strengths = self._identify_strengths(metrics)
            weaknesses = self._identify_weaknesses(metrics)
            
            # Generate recommendations
            recommendations = self._generate_quality_recommendations(metrics, campaign_data)
            
            # Calculate assessment time
            assessment_time = (datetime.now() - start_time).total_seconds()
            
            # Create assessment
            assessment = QualityAssessment(
                overall_score=overall_score,
                overall_level=overall_level,
                metrics=metrics,
                strengths=strengths,
                weaknesses=weaknesses,
                recommendations=recommendations,
                assessment_time=assessment_time,
                timestamp=datetime.now().isoformat(),
                metadata={
                    "campaign_type": campaign_data.get("type", "unknown"),
                    "assessment_mode": "strict" if self.quality_config["strict_mode"] else "standard",
                    "total_metrics": len(metrics),
                    "context_provided": bool(context)
                }
            )
            
            # Update statistics
            self._update_quality_statistics(assessment)
            
            logger.info(f"Campaign quality assessment completed: {overall_score:.1f}/100 ({overall_level.value})")
            return assessment
            
        except Exception as e:
            logger.error(f"Campaign quality assessment failed: {str(e)}")
            assessment_time = (datetime.now() - start_time).total_seconds()
            
            return QualityAssessment(
                overall_score=0.0,
                overall_level=QualityLevel.CRITICAL,
                metrics=[],
                strengths=[],
                weaknesses=[f"Assessment failed: {str(e)}"],
                recommendations=["Fix technical issues and retry assessment"],
                assessment_time=assessment_time,
                timestamp=datetime.now().isoformat(),
                metadata={}
            )
    
    async def assess_content_quality(self,
                                   content: str,
                                   content_type: str,
                                   context: Dict[str, Any] = None) -> QualityMetric:
        """
        Assess quality of specific content
        
        Args:
            content: Content to assess
            content_type: Type of content (headline, description, keyword)
            context: Additional context
            
        Returns:
            QualityMetric for the content
        """
        try:
            logger.info(f"Assessing {content_type} content quality")
            
            context = context or {}
            
            if content_type.lower() == "headline":
                return await self._assess_headline_quality(content, context)
            elif content_type.lower() == "description":
                return await self._assess_description_quality(content, context)
            elif content_type.lower() == "keyword":
                return await self._assess_keyword_quality(content, context)
            else:
                return await self._assess_generic_content_quality(content, context)
                
        except Exception as e:
            logger.error(f"Content quality assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.ACCURACY,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Assessment failed: {str(e)}",
                weight=1.0,
                details={},
                recommendations=["Fix technical issues and retry"]
            )
    
    async def _assess_relevance(self,
                              campaign_data: Dict[str, Any],
                              context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign relevance"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Check keyword-ad relevance
            keywords = campaign_data.get("keywords", [])
            ads = campaign_data.get("ads", [])
            
            if keywords and ads:
                relevance_scores = []
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    descriptions = ad.get("descriptions", [])
                    
                    for keyword in keywords[:10]:  # Check top 10 keywords
                        keyword_text = keyword.get("text", "") if isinstance(keyword, dict) else str(keyword)
                        
                        # Calculate keyword presence in ad copy
                        ad_text = " ".join(headlines + descriptions).lower()
                        keyword_words = keyword_text.lower().split()
                        
                        matches = sum(1 for word in keyword_words if word in ad_text)
                        relevance_score = (matches / len(keyword_words)) * 100 if keyword_words else 0
                        relevance_scores.append(relevance_score)
                
                if relevance_scores:
                    avg_relevance = statistics.mean(relevance_scores)
                    score = min(score, avg_relevance + 20)  # Bonus for good relevance
                    details["keyword_ad_relevance"] = avg_relevance
                    
                    if avg_relevance < 30:
                        recommendations.append("Improve keyword-ad relevance by including keywords in headlines")
            
            # Check landing page relevance
            landing_pages = []
            for ad in ads:
                if "final_url" in ad:
                    landing_pages.append(ad["final_url"])
            
            if landing_pages:
                details["landing_pages_count"] = len(set(landing_pages))
                if len(set(landing_pages)) > len(ads) * 0.5:
                    score -= 10  # Too many different landing pages
                    recommendations.append("Consolidate landing pages for better relevance")
            
            # Check business category alignment
            business_info = context.get("business_info", {})
            if business_info:
                category = business_info.get("category", "")
                if category and keywords:
                    category_keywords = category.lower().split()
                    keyword_texts = [k.get("text", "") if isinstance(k, dict) else str(k) for k in keywords]
                    
                    category_matches = 0
                    for keyword_text in keyword_texts[:20]:
                        if any(cat_word in keyword_text.lower() for cat_word in category_keywords):
                            category_matches += 1
                    
                    category_relevance = (category_matches / min(len(keyword_texts), 20)) * 100
                    details["category_relevance"] = category_relevance
                    
                    if category_relevance < 50:
                        score -= 15
                        recommendations.append("Add more category-specific keywords")
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.RELEVANCE,
                score=score,
                level=level,
                description=f"Campaign relevance assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.RELEVANCE],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Relevance assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.RELEVANCE,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Relevance assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.RELEVANCE],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_clarity(self,
                            campaign_data: Dict[str, Any],
                            context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign clarity"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            ads = campaign_data.get("ads", [])
            
            if ads:
                clarity_scores = []
                
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    descriptions = ad.get("descriptions", [])
                    
                    # Assess headline clarity
                    for headline in headlines:
                        if isinstance(headline, str):
                            clarity_score = self._assess_text_clarity(headline)
                            clarity_scores.append(clarity_score)
                    
                    # Assess description clarity
                    for description in descriptions:
                        if isinstance(description, str):
                            clarity_score = self._assess_text_clarity(description)
                            clarity_scores.append(clarity_score)
                
                if clarity_scores:
                    avg_clarity = statistics.mean(clarity_scores)
                    score = avg_clarity
                    details["average_clarity"] = avg_clarity
                    details["clarity_distribution"] = {
                        "excellent": len([s for s in clarity_scores if s >= 90]),
                        "good": len([s for s in clarity_scores if 75 <= s < 90]),
                        "fair": len([s for s in clarity_scores if 60 <= s < 75]),
                        "poor": len([s for s in clarity_scores if s < 60])
                    }
                    
                    if avg_clarity < 70:
                        recommendations.append("Simplify language and use clearer messaging")
                    if avg_clarity < 50:
                        recommendations.append("Rewrite ad copy for better clarity")
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.CLARITY,
                score=score,
                level=level,
                description=f"Campaign clarity assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.CLARITY],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Clarity assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.CLARITY,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Clarity assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.CLARITY],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_completeness(self,
                                 campaign_data: Dict[str, Any],
                                 context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign completeness"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Required fields checklist
            required_fields = {
                "campaign_name": campaign_data.get("name"),
                "budget": campaign_data.get("budget"),
                "keywords": campaign_data.get("keywords"),
                "ads": campaign_data.get("ads"),
                "targeting": campaign_data.get("targeting")
            }
            
            missing_fields = [field for field, value in required_fields.items() if not value]
            completeness_ratio = (len(required_fields) - len(missing_fields)) / len(required_fields)
            
            details["completeness_ratio"] = completeness_ratio
            details["missing_fields"] = missing_fields
            
            # Deduct points for missing fields
            score = completeness_ratio * 100
            
            # Check ad completeness
            ads = campaign_data.get("ads", [])
            if ads:
                ad_completeness_scores = []
                
                for ad in ads:
                    ad_score = 100.0
                    
                    headlines = ad.get("headlines", [])
                    descriptions = ad.get("descriptions", [])
                    
                    if len(headlines) < 3:
                        ad_score -= 20
                        recommendations.append("Add more headlines (minimum 3 recommended)")
                    
                    if len(descriptions) < 2:
                        ad_score -= 15
                        recommendations.append("Add more descriptions (minimum 2 recommended)")
                    
                    if not ad.get("final_url"):
                        ad_score -= 25
                        recommendations.append("Add final URL to all ads")
                    
                    ad_completeness_scores.append(ad_score)
                
                avg_ad_completeness = statistics.mean(ad_completeness_scores)
                details["ad_completeness"] = avg_ad_completeness
                score = (score + avg_ad_completeness) / 2
            
            # Check keyword completeness
            keywords = campaign_data.get("keywords", [])
            if keywords:
                keyword_completeness = 100.0
                
                if len(keywords) < 10:
                    keyword_completeness -= 20
                    recommendations.append("Add more keywords (minimum 10-20 recommended)")
                
                # Check for different match types
                match_types = set()
                for keyword in keywords:
                    if isinstance(keyword, dict):
                        match_type = keyword.get("match_type", "broad")
                        match_types.add(match_type)
                
                if len(match_types) < 2:
                    keyword_completeness -= 15
                    recommendations.append("Use different match types for better coverage")
                
                details["keyword_completeness"] = keyword_completeness
                score = (score + keyword_completeness) / 2
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.COMPLETENESS,
                score=score,
                level=level,
                description=f"Campaign completeness assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.COMPLETENESS],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Completeness assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.COMPLETENESS,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Completeness assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.COMPLETENESS],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_accuracy(self,
                             campaign_data: Dict[str, Any],
                             context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign accuracy"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Check data consistency
            ads = campaign_data.get("ads", [])
            keywords = campaign_data.get("keywords", [])
            
            # Validate URLs
            invalid_urls = 0
            total_urls = 0
            
            for ad in ads:
                final_url = ad.get("final_url", "")
                if final_url:
                    total_urls += 1
                    if not self._is_valid_url(final_url):
                        invalid_urls += 1
            
            if total_urls > 0:
                url_accuracy = ((total_urls - invalid_urls) / total_urls) * 100
                details["url_accuracy"] = url_accuracy
                score = min(score, url_accuracy + 10)
                
                if invalid_urls > 0:
                    recommendations.append(f"Fix {invalid_urls} invalid URL(s)")
            
            # Check budget accuracy
            budget = campaign_data.get("budget")
            if budget:
                try:
                    budget_value = float(budget)
                    if budget_value <= 0:
                        score -= 20
                        recommendations.append("Set a positive budget value")
                    elif budget_value < 10:
                        score -= 10
                        recommendations.append("Consider increasing budget for better performance")
                    
                    details["budget_value"] = budget_value
                except (ValueError, TypeError):
                    score -= 15
                    recommendations.append("Fix budget format (should be a number)")
            
            # Check keyword accuracy
            if keywords:
                keyword_issues = 0
                for keyword in keywords:
                    if isinstance(keyword, dict):
                        keyword_text = keyword.get("text", "")
                        if not keyword_text or len(keyword_text.strip()) < 2:
                            keyword_issues += 1
                        elif len(keyword_text) > 80:  # Google Ads limit
                            keyword_issues += 1
                
                keyword_accuracy = ((len(keywords) - keyword_issues) / len(keywords)) * 100
                details["keyword_accuracy"] = keyword_accuracy
                score = min(score, keyword_accuracy + 5)
                
                if keyword_issues > 0:
                    recommendations.append(f"Fix {keyword_issues} keyword issue(s)")
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.ACCURACY,
                score=score,
                level=level,
                description=f"Campaign accuracy assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.ACCURACY],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Accuracy assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.ACCURACY,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Accuracy assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.ACCURACY],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_consistency(self,
                                campaign_data: Dict[str, Any],
                                context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign consistency"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            ads = campaign_data.get("ads", [])
            
            if len(ads) > 1:
                # Check messaging consistency
                all_headlines = []
                all_descriptions = []
                
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    descriptions = ad.get("descriptions", [])
                    all_headlines.extend(headlines)
                    all_descriptions.extend(descriptions)
                
                # Check for consistent themes/keywords
                if all_headlines:
                    headline_consistency = self._assess_text_consistency(all_headlines)
                    details["headline_consistency"] = headline_consistency
                    score = min(score, headline_consistency + 20)
                    
                    if headline_consistency < 60:
                        recommendations.append("Improve headline consistency across ads")
                
                if all_descriptions:
                    description_consistency = self._assess_text_consistency(all_descriptions)
                    details["description_consistency"] = description_consistency
                    score = min(score, description_consistency + 20)
                    
                    if description_consistency < 60:
                        recommendations.append("Improve description consistency across ads")
                
                # Check URL consistency
                urls = [ad.get("final_url", "") for ad in ads if ad.get("final_url")]
                unique_domains = set()
                for url in urls:
                    try:
                        domain = url.split("//")[1].split("/")[0] if "//" in url else url.split("/")[0]
                        unique_domains.add(domain)
                    except:
                        pass
                
                if len(unique_domains) > 1:
                    score -= 15
                    recommendations.append("Use consistent domain across all ads")
                
                details["unique_domains"] = len(unique_domains)
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.CONSISTENCY,
                score=score,
                level=level,
                description=f"Campaign consistency assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.CONSISTENCY],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Consistency assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.CONSISTENCY,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Consistency assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.CONSISTENCY],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_effectiveness(self,
                                  campaign_data: Dict[str, Any],
                                  context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign effectiveness potential"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Check for high-performance elements
            ads = campaign_data.get("ads", [])
            keywords = campaign_data.get("keywords", [])
            
            # Assess headline effectiveness
            if ads:
                effective_headlines = 0
                total_headlines = 0
                
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    for headline in headlines:
                        if isinstance(headline, str):
                            total_headlines += 1
                            effectiveness_score = self._assess_headline_effectiveness(headline)
                            if effectiveness_score > 70:
                                effective_headlines += 1
                
                if total_headlines > 0:
                    headline_effectiveness = (effective_headlines / total_headlines) * 100
                    details["headline_effectiveness"] = headline_effectiveness
                    score = min(score, headline_effectiveness + 15)
                    
                    if headline_effectiveness < 50:
                        recommendations.append("Improve headline effectiveness with action words and benefits")
            
            # Assess keyword effectiveness
            if keywords:
                high_intent_keywords = 0
                for keyword in keywords:
                    keyword_text = keyword.get("text", "") if isinstance(keyword, dict) else str(keyword)
                    if any(indicator in keyword_text.lower() for indicator in self.performance_indicators["high_conversion_terms"]):
                        high_intent_keywords += 1
                
                keyword_effectiveness = (high_intent_keywords / len(keywords)) * 100
                details["keyword_effectiveness"] = keyword_effectiveness
                score = min(score, keyword_effectiveness + 25)
                
                if keyword_effectiveness < 30:
                    recommendations.append("Add more high-intent keywords")
            
            # Check for call-to-action presence
            cta_score = 0
            if ads:
                ads_with_cta = 0
                for ad in ads:
                    descriptions = ad.get("descriptions", [])
                    for description in descriptions:
                        if isinstance(description, str):
                            if any(pattern in description.lower() for pattern in ["call", "click", "visit", "order", "buy", "contact"]):
                                ads_with_cta += 1
                                break
                
                cta_score = (ads_with_cta / len(ads)) * 100
                details["cta_presence"] = cta_score
                
                if cta_score < 80:
                    recommendations.append("Add clear call-to-action in ad descriptions")
            
            # Combine effectiveness factors
            effectiveness_factors = [score]
            if "headline_effectiveness" in details:
                effectiveness_factors.append(details["headline_effectiveness"])
            if "keyword_effectiveness" in details:
                effectiveness_factors.append(details["keyword_effectiveness"])
            effectiveness_factors.append(cta_score)
            
            score = statistics.mean(effectiveness_factors)
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.EFFECTIVENESS,
                score=score,
                level=level,
                description=f"Campaign effectiveness assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.EFFECTIVENESS],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Effectiveness assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.EFFECTIVENESS,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Effectiveness assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.EFFECTIVENESS],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_compliance(self,
                               campaign_data: Dict[str, Any],
                               context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign compliance"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Check for policy violations
            ads = campaign_data.get("ads", [])
            
            if ads:
                policy_violations = 0
                total_text_elements = 0
                
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    descriptions = ad.get("descriptions", [])
                    
                    all_text = headlines + descriptions
                    
                    for text in all_text:
                        if isinstance(text, str):
                            total_text_elements += 1
                            
                            # Check for common policy violations
                            violations = self._check_policy_violations(text)
                            policy_violations += len(violations)
                            
                            if violations:
                                recommendations.extend([f"Fix policy violation: {v}" for v in violations])
                
                if total_text_elements > 0:
                    compliance_rate = ((total_text_elements - policy_violations) / total_text_elements) * 100
                    details["compliance_rate"] = compliance_rate
                    score = compliance_rate
                    
                    details["policy_violations"] = policy_violations
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.COMPLIANCE,
                score=score,
                level=level,
                description=f"Campaign compliance assessment: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.COMPLIANCE],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Compliance assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.COMPLIANCE,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Compliance assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.COMPLIANCE],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    async def _assess_performance_potential(self,
                                          campaign_data: Dict[str, Any],
                                          context: Dict[str, Any]) -> QualityMetric:
        """Assess campaign performance potential"""
        try:
            score = 100.0
            details = {}
            recommendations = []
            
            # Assess based on best practices
            keywords = campaign_data.get("keywords", [])
            ads = campaign_data.get("ads", [])
            
            # Keyword performance indicators
            if keywords:
                high_performance_keywords = 0
                for keyword in keywords:
                    keyword_text = keyword.get("text", "") if isinstance(keyword, dict) else str(keyword)
                    
                    # Check for high-CTR indicators
                    if any(indicator in keyword_text.lower() for indicator in self.performance_indicators["high_ctr_keywords"]):
                        high_performance_keywords += 1
                
                keyword_performance_ratio = (high_performance_keywords / len(keywords)) * 100
                details["high_performance_keywords_ratio"] = keyword_performance_ratio
                
                if keyword_performance_ratio < 20:
                    score -= 20
                    recommendations.append("Add more high-performance keywords")
            
            # Ad performance indicators
            if ads:
                performance_score = 0
                
                for ad in ads:
                    headlines = ad.get("headlines", [])
                    
                    # Check for numbers in headlines
                    has_numbers = any(re.search(r'\d', headline) for headline in headlines if isinstance(headline, str))
                    if has_numbers:
                        performance_score += 10
                    
                    # Check for power words
                    power_words = ["free", "new", "best", "save", "get", "exclusive"]
                    has_power_words = any(
                        any(word in headline.lower() for word in power_words)
                        for headline in headlines if isinstance(headline, str)
                    )
                    if has_power_words:
                        performance_score += 15
                    
                    # Check for urgency
                    urgency_words = ["today", "now", "limited", "hurry", "act fast"]
                    has_urgency = any(
                        any(word in (headlines + ad.get("descriptions", [])))
                        for word in urgency_words
                    )
                    if has_urgency:
                        performance_score += 10
                
                details["ad_performance_score"] = performance_score
                score = min(score, performance_score + 50)
            
            # Budget optimization potential
            budget = campaign_data.get("budget")
            if budget:
                try:
                    budget_value = float(budget)
                    keyword_count = len(keywords) if keywords else 1
                    
                    # Calculate budget per keyword
                    budget_per_keyword = budget_value / keyword_count
                    details["budget_per_keyword"] = budget_per_keyword
                    
                    if budget_per_keyword < 1:
                        score -= 15
                        recommendations.append("Increase budget or reduce keywords for better performance")
                    elif budget_per_keyword > 50:
                        recommendations.append("Consider expanding keyword list to utilize budget effectively")
                        
                except (ValueError, TypeError):
                    pass
            
            level = self._determine_quality_level(score)
            
            return QualityMetric(
                dimension=QualityDimension.PERFORMANCE,
                score=score,
                level=level,
                description=f"Campaign performance potential: {score:.1f}/100",
                weight=self.dimension_weights[QualityDimension.PERFORMANCE],
                details=details,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Performance assessment failed: {str(e)}")
            return QualityMetric(
                dimension=QualityDimension.PERFORMANCE,
                score=0.0,
                level=QualityLevel.CRITICAL,
                description=f"Performance assessment failed: {str(e)}",
                weight=self.dimension_weights[QualityDimension.PERFORMANCE],
                details={},
                recommendations=["Fix technical issues"]
            )
    
    def _assess_text_clarity(self, text: str) -> float:
        """Assess text clarity score"""
        try:
            score = 100.0
            
            # Check sentence length
            sentences = text.split('.')
            if sentences:
                avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
                if avg_sentence_length > 20:
                    score -= 20
                elif avg_sentence_length > 15:
                    score -= 10
            
            # Check word complexity
            words = text.split()
            complex_words = [w for w in words if len(w) > 12]
            if len(complex_words) > len(words) * 0.3:
                score -= 15
            
            # Check readability indicators
            if any(char in text for char in "!?"):
                score += 5  # Punctuation helps clarity
            
            return max(0, score)
            
        except Exception:
            return 50.0
    
    def _assess_text_consistency(self, texts: List[str]) -> float:
        """Assess consistency across multiple texts"""
        try:
            if len(texts) < 2:
                return 100.0
            
            # Extract common words
            all_words = []
            for text in texts:
                words = [w.lower() for w in text.split() if len(w) > 3]
                all_words.extend(words)
            
            if not all_words:
                return 50.0
            
            # Calculate word frequency
            word_freq = {}
            for word in all_words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # Find common words (appearing in multiple texts)
            common_words = [word for word, freq in word_freq.items() if freq > 1]
            consistency_ratio = len(common_words) / len(set(all_words))
            
            return min(100.0, consistency_ratio * 200)  # Scale to 0-100
            
        except Exception:
            return 50.0
    
    def _assess_headline_effectiveness(self, headline: str) -> float:
        """Assess headline effectiveness"""
        try:
            score = 50.0  # Base score
            
            # Check for action words
            action_words = ["get", "save", "discover", "learn", "find", "buy", "order"]
            if any(word in headline.lower() for word in action_words):
                score += 20
            
            # Check for numbers
            if re.search(r'\d', headline):
                score += 15
            
            # Check for power words
            power_words = ["free", "new", "best", "exclusive", "limited"]
            if any(word in headline.lower() for word in power_words):
                score += 10
            
            # Check length (optimal 25-35 characters)
            if 25 <= len(headline) <= 35:
                score += 5
            elif len(headline) > 40:
                score -= 10
            
            return min(100.0, score)
            
        except Exception:
            return 50.0
    
    def _check_policy_violations(self, text: str) -> List[str]:
        """Check for common policy violations"""
        violations = []
        text_lower = text.lower()
        
        # Check for excessive punctuation
        if re.search(r'[!?]{2,}', text):
            violations.append("Excessive punctuation")
        
        # Check for excessive capitalization
        if re.search(r'[A-Z]{4,}', text):
            violations.append("Excessive capitalization")
        
        # Check for misleading claims
        misleading_terms = ["guaranteed", "100% effective", "miracle", "instant"]
        for term in misleading_terms:
            if term in text_lower:
                violations.append(f"Potentially misleading claim: {term}")
        
        return violations
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid"""
        try:
            if validators:
                return validators.url(url)
            else:
                # Fallback basic check
                return url.startswith(('http://', 'https://')) and '.' in url
        except:
            # Fallback basic check
            return url.startswith(('http://', 'https://')) and '.' in url
    
    def _calculate_overall_score(self, metrics: List[QualityMetric]) -> float:
        """Calculate weighted overall score"""
        try:
            total_weighted_score = 0.0
            total_weight = 0.0
            
            for metric in metrics:
                total_weighted_score += metric.score * metric.weight
                total_weight += metric.weight
            
            return total_weighted_score / total_weight if total_weight > 0 else 0.0
            
        except Exception:
            return 0.0
    
    def _determine_quality_level(self, score: float) -> QualityLevel:
        """Determine quality level from score"""
        for level, threshold in self.quality_thresholds.items():
            if score >= threshold:
                return level
        return QualityLevel.CRITICAL
    
    def _identify_strengths(self, metrics: List[QualityMetric]) -> List[str]:
        """Identify campaign strengths"""
        strengths = []
        
        for metric in metrics:
            if metric.level in [QualityLevel.EXCELLENT, QualityLevel.GOOD]:
                strengths.append(f"Strong {metric.dimension.value}: {metric.score:.1f}/100")
        
        return strengths
    
    def _identify_weaknesses(self, metrics: List[QualityMetric]) -> List[str]:
        """Identify campaign weaknesses"""
        weaknesses = []
        
        for metric in metrics:
            if metric.level in [QualityLevel.POOR, QualityLevel.CRITICAL]:
                weaknesses.append(f"Weak {metric.dimension.value}: {metric.score:.1f}/100")
        
        return weaknesses
    
    def _generate_quality_recommendations(self,
                                        metrics: List[QualityMetric],
                                        campaign_data: Dict[str, Any]) -> List[str]:
        """Generate quality improvement recommendations"""
        recommendations = []
        
        # Collect all metric recommendations
        for metric in metrics:
            recommendations.extend(metric.recommendations)
        
        # Add general recommendations based on overall assessment
        low_scoring_metrics = [m for m in metrics if m.score < 60]
        
        if len(low_scoring_metrics) > 3:
            recommendations.append("Consider comprehensive campaign redesign")
        elif len(low_scoring_metrics) > 1:
            recommendations.append("Focus on improving weak areas systematically")
        
        # Remove duplicates and return top recommendations
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:10]  # Top 10 recommendations
    
    def _update_quality_statistics(self, assessment: QualityAssessment):
        """Update quality statistics"""
        self.quality_stats["total_assessments"] += 1
        
        # Update average score
        total = self.quality_stats["total_assessments"]
        current_avg = self.quality_stats["average_score"]
        new_avg = ((current_avg * (total - 1)) + assessment.overall_score) / total
        self.quality_stats["average_score"] = new_avg
        
        # Update score distribution
        self.quality_stats["score_distribution"][assessment.overall_level.value] += 1
        
        # Track common issues
        for weakness in assessment.weaknesses:
            if weakness not in self.quality_stats["common_issues"]:
                self.quality_stats["common_issues"][weakness] = 0
            self.quality_stats["common_issues"][weakness] += 1
    
    def get_quality_statistics(self) -> Dict[str, Any]:
        """Get quality assessment statistics"""
        return self.quality_stats.copy()
    
    def reset_statistics(self):
        """Reset quality statistics"""
        self.quality_stats = {
            "total_assessments": 0,
            "average_score": 0.0,
            "score_distribution": {level.value: 0 for level in QualityLevel},
            "common_issues": {},
            "improvement_trends": []
        }
        logger.info("Quality statistics reset")

