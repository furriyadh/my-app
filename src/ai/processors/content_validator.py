# Google Ads AI Platform - Content Validator
# Advanced content validation and compliance checking

import logging
import asyncio
import re
import json
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import nltk
from textblob import TextBlob
try:
    import validators
except ImportError:
    validators = None

logger = logging.getLogger(__name__)

class ValidationSeverity(Enum):
    """Validation issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class ContentType(Enum):
    """Content types for validation"""
    HEADLINE = "headline"
    DESCRIPTION = "description"
    AD_COPY = "ad_copy"
    KEYWORD = "keyword"
    LANDING_PAGE = "landing_page"
    BUSINESS_INFO = "business_info"
    PRODUCT_INFO = "product_info"

@dataclass
class ValidationIssue:
    """Single validation issue"""
    id: str
    severity: ValidationSeverity
    category: str
    title: str
    description: str
    content_type: ContentType
    field_name: str
    current_value: str
    suggested_fix: str
    rule_violated: str
    impact: str
    auto_fixable: bool
    confidence_score: float

@dataclass
class ValidationResult:
    """Content validation result"""
    success: bool
    content_type: ContentType
    overall_score: float
    issues: List[ValidationIssue]
    warnings: List[str]
    suggestions: List[str]
    compliance_status: Dict[str, bool]
    validation_time: float
    timestamp: str
    metadata: Dict[str, Any]

class ContentValidator:
    """
    Advanced content validation and compliance engine
    
    Validates content for:
    - Google Ads policy compliance
    - Character limits and formatting
    - Language quality and readability
    - SEO best practices
    - Brand consistency
    - Legal compliance
    - Accessibility standards
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize content validator"""
        self.config = config or {}
        
        # Validation configuration
        self.validation_config = {
            "strict_mode": self.config.get("strict_mode", False),
            "language": self.config.get("language", "en"),
            "enable_auto_fix": self.config.get("enable_auto_fix", True),
            "check_spelling": self.config.get("check_spelling", True),
            "check_grammar": self.config.get("check_grammar", True),
            "check_readability": self.config.get("check_readability", True),
            "check_compliance": self.config.get("check_compliance", True),
            "min_quality_score": self.config.get("min_quality_score", 0.7)
        }
        
        # Google Ads character limits
        self.character_limits = {
            "headline": 30,
            "long_headline": 90,
            "description": 90,
            "path": 15,
            "callout": 25,
            "sitelink": 25,
            "sitelink_description": 35
        }
        
        # Prohibited content patterns
        self.prohibited_patterns = {
            "excessive_punctuation": r"[!?]{2,}",
            "excessive_caps": r"[A-Z]{4,}",
            "repeated_words": r"\b(\w+)\s+\1\b",
            "special_characters": r"[^\w\s\-\.\,\!\?\:\;\(\)\[\]\"\'\/\&\@\#\$\%]",
            "phone_in_headline": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
            "email_in_headline": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        }
        
        # Compliance rules
        self.compliance_rules = {
            "google_ads": {
                "no_misleading_claims": True,
                "no_excessive_punctuation": True,
                "no_irrelevant_keywords": True,
                "proper_grammar": True,
                "appropriate_capitalization": True,
                "no_prohibited_content": True
            },
            "accessibility": {
                "readable_text": True,
                "appropriate_contrast": True,
                "descriptive_links": True
            },
            "legal": {
                "no_false_claims": True,
                "proper_disclaimers": True,
                "age_appropriate": True
            }
        }
        
        # Quality scoring weights
        self.quality_weights = {
            "grammar": 0.25,
            "spelling": 0.20,
            "readability": 0.20,
            "compliance": 0.15,
            "formatting": 0.10,
            "relevance": 0.10
        }
        
        # Validation statistics
        self.validation_stats = {
            "total_validations": 0,
            "passed_validations": 0,
            "failed_validations": 0,
            "auto_fixes_applied": 0,
            "average_quality_score": 0.0
        }
        
        # Initialize NLP tools
        self._initialize_nlp_tools()
    
    def _initialize_nlp_tools(self):
        """Initialize NLP tools for validation"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            
            logger.info("NLP tools initialized successfully")
            
        except Exception as e:
            logger.warning(f"Failed to initialize NLP tools: {str(e)}")
    
    async def validate_content(self,
                             content: str,
                             content_type: ContentType,
                             field_name: str = "",
                             validation_rules: Dict[str, Any] = None) -> ValidationResult:
        """
        Validate content against all applicable rules
        
        Args:
            content: Content to validate
            content_type: Type of content being validated
            field_name: Name of the field being validated
            validation_rules: Custom validation rules
            
        Returns:
            ValidationResult with issues and suggestions
        """
        start_time = datetime.now()
        issues = []
        warnings = []
        suggestions = []
        
        try:
            logger.info(f"Validating {content_type.value} content: {field_name}")
            
            # Basic validation
            if not content or not content.strip():
                issues.append(ValidationIssue(
                    id=f"empty_content_{field_name}",
                    severity=ValidationSeverity.CRITICAL,
                    category="basic_validation",
                    title="Empty content",
                    description="Content is empty or contains only whitespace",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Add meaningful content",
                    rule_violated="content_required",
                    impact="Content will not be displayed",
                    auto_fixable=False,
                    confidence_score=1.0
                ))
                
                return ValidationResult(
                    success=False,
                    content_type=content_type,
                    overall_score=0.0,
                    issues=issues,
                    warnings=warnings,
                    suggestions=suggestions,
                    compliance_status={},
                    validation_time=(datetime.now() - start_time).total_seconds(),
                    timestamp=datetime.now().isoformat(),
                    metadata={}
                )
            
            # Character limit validation
            char_limit_issues = await self._validate_character_limits(
                content, content_type, field_name
            )
            issues.extend(char_limit_issues)
            
            # Format validation
            format_issues = await self._validate_format(
                content, content_type, field_name
            )
            issues.extend(format_issues)
            
            # Language quality validation
            if self.validation_config["check_spelling"] or self.validation_config["check_grammar"]:
                language_issues = await self._validate_language_quality(
                    content, content_type, field_name
                )
                issues.extend(language_issues)
            
            # Readability validation
            if self.validation_config["check_readability"]:
                readability_issues = await self._validate_readability(
                    content, content_type, field_name
                )
                issues.extend(readability_issues)
            
            # Compliance validation
            if self.validation_config["check_compliance"]:
                compliance_issues = await self._validate_compliance(
                    content, content_type, field_name
                )
                issues.extend(compliance_issues)
            
            # Content-specific validation
            specific_issues = await self._validate_content_specific(
                content, content_type, field_name
            )
            issues.extend(specific_issues)
            
            # Generate suggestions
            suggestions = await self._generate_suggestions(
                content, content_type, issues
            )
            
            # Calculate overall quality score
            overall_score = await self._calculate_quality_score(
                content, issues, content_type
            )
            
            # Determine compliance status
            compliance_status = await self._check_compliance_status(issues)
            
            # Auto-fix issues if enabled
            if self.validation_config["enable_auto_fix"]:
                auto_fixed_content = await self._auto_fix_issues(content, issues)
                if auto_fixed_content != content:
                    suggestions.append(f"Auto-fixed version available: {auto_fixed_content}")
                    self.validation_stats["auto_fixes_applied"] += 1
            
            # Calculate validation time
            validation_time = (datetime.now() - start_time).total_seconds()
            
            # Create result
            result = ValidationResult(
                success=len([i for i in issues if i.severity in [ValidationSeverity.CRITICAL, ValidationSeverity.HIGH]]) == 0,
                content_type=content_type,
                overall_score=overall_score,
                issues=issues,
                warnings=warnings,
                suggestions=suggestions,
                compliance_status=compliance_status,
                validation_time=validation_time,
                timestamp=datetime.now().isoformat(),
                metadata={
                    "content_length": len(content),
                    "word_count": len(content.split()),
                    "validation_rules_applied": len(validation_rules) if validation_rules else 0,
                    "auto_fix_enabled": self.validation_config["enable_auto_fix"]
                }
            )
            
            # Update statistics
            self.validation_stats["total_validations"] += 1
            if result.success:
                self.validation_stats["passed_validations"] += 1
            else:
                self.validation_stats["failed_validations"] += 1
            
            self._update_average_quality_score(overall_score)
            
            logger.info(f"Content validation completed in {validation_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Content validation failed: {str(e)}")
            validation_time = (datetime.now() - start_time).total_seconds()
            
            return ValidationResult(
                success=False,
                content_type=content_type,
                overall_score=0.0,
                issues=[],
                warnings=[f"Validation error: {str(e)}"],
                suggestions=[],
                compliance_status={},
                validation_time=validation_time,
                timestamp=datetime.now().isoformat(),
                metadata={}
            )
    
    async def validate_ad_copy(self,
                             headlines: List[str],
                             descriptions: List[str],
                             paths: List[str] = None) -> Dict[str, ValidationResult]:
        """
        Validate complete ad copy
        
        Args:
            headlines: List of headlines
            descriptions: List of descriptions
            paths: List of path elements
            
        Returns:
            Dictionary of validation results by component
        """
        try:
            logger.info("Validating complete ad copy")
            results = {}
            
            # Validate headlines
            for i, headline in enumerate(headlines):
                result = await self.validate_content(
                    headline,
                    ContentType.HEADLINE,
                    f"headline_{i+1}"
                )
                results[f"headline_{i+1}"] = result
            
            # Validate descriptions
            for i, description in enumerate(descriptions):
                result = await self.validate_content(
                    description,
                    ContentType.DESCRIPTION,
                    f"description_{i+1}"
                )
                results[f"description_{i+1}"] = result
            
            # Validate paths
            if paths:
                for i, path in enumerate(paths):
                    result = await self.validate_content(
                        path,
                        ContentType.AD_COPY,
                        f"path_{i+1}"
                    )
                    results[f"path_{i+1}"] = result
            
            logger.info(f"Ad copy validation completed for {len(results)} components")
            return results
            
        except Exception as e:
            logger.error(f"Ad copy validation failed: {str(e)}")
            return {}
    
    async def validate_keywords(self,
                              keywords: List[str],
                              match_types: List[str] = None) -> List[ValidationResult]:
        """
        Validate keyword list
        
        Args:
            keywords: List of keywords to validate
            match_types: List of match types for keywords
            
        Returns:
            List of validation results for each keyword
        """
        try:
            logger.info(f"Validating {len(keywords)} keywords")
            results = []
            
            for i, keyword in enumerate(keywords):
                match_type = match_types[i] if match_types and i < len(match_types) else "broad"
                
                result = await self.validate_content(
                    keyword,
                    ContentType.KEYWORD,
                    f"keyword_{i+1}_{match_type}"
                )
                results.append(result)
            
            logger.info(f"Keyword validation completed for {len(results)} keywords")
            return results
            
        except Exception as e:
            logger.error(f"Keyword validation failed: {str(e)}")
            return []
    
    async def _validate_character_limits(self,
                                       content: str,
                                       content_type: ContentType,
                                       field_name: str) -> List[ValidationIssue]:
        """Validate character limits"""
        issues = []
        
        try:
            content_length = len(content)
            
            # Determine appropriate limit
            limit = None
            if content_type == ContentType.HEADLINE:
                limit = self.character_limits["headline"]
                if "long" in field_name.lower():
                    limit = self.character_limits["long_headline"]
            elif content_type == ContentType.DESCRIPTION:
                limit = self.character_limits["description"]
            elif "path" in field_name.lower():
                limit = self.character_limits["path"]
            elif "callout" in field_name.lower():
                limit = self.character_limits["callout"]
            elif "sitelink" in field_name.lower():
                if "description" in field_name.lower():
                    limit = self.character_limits["sitelink_description"]
                else:
                    limit = self.character_limits["sitelink"]
            
            if limit and content_length > limit:
                issues.append(ValidationIssue(
                    id=f"char_limit_{field_name}",
                    severity=ValidationSeverity.CRITICAL,
                    category="character_limits",
                    title=f"Exceeds character limit",
                    description=f"Content is {content_length} characters, limit is {limit}",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix=f"Reduce content to {limit} characters or less",
                    rule_violated="character_limit",
                    impact="Content will be truncated",
                    auto_fixable=True,
                    confidence_score=1.0
                ))
            elif limit and content_length > limit * 0.9:
                issues.append(ValidationIssue(
                    id=f"char_warning_{field_name}",
                    severity=ValidationSeverity.MEDIUM,
                    category="character_limits",
                    title=f"Approaching character limit",
                    description=f"Content is {content_length} characters, limit is {limit}",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix=f"Consider shortening to stay well under {limit} characters",
                    rule_violated="character_limit_warning",
                    impact="May be truncated on some devices",
                    auto_fixable=False,
                    confidence_score=0.8
                ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Character limit validation failed: {str(e)}")
            return []
    
    async def _validate_format(self,
                             content: str,
                             content_type: ContentType,
                             field_name: str) -> List[ValidationIssue]:
        """Validate content format"""
        issues = []
        
        try:
            # Check for excessive punctuation
            if re.search(self.prohibited_patterns["excessive_punctuation"], content):
                issues.append(ValidationIssue(
                    id=f"excessive_punct_{field_name}",
                    severity=ValidationSeverity.HIGH,
                    category="formatting",
                    title="Excessive punctuation",
                    description="Content contains excessive punctuation marks",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Use single punctuation marks",
                    rule_violated="excessive_punctuation",
                    impact="May appear unprofessional",
                    auto_fixable=True,
                    confidence_score=0.9
                ))
            
            # Check for excessive capitalization
            if re.search(self.prohibited_patterns["excessive_caps"], content):
                issues.append(ValidationIssue(
                    id=f"excessive_caps_{field_name}",
                    severity=ValidationSeverity.HIGH,
                    category="formatting",
                    title="Excessive capitalization",
                    description="Content contains excessive capital letters",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Use proper capitalization",
                    rule_violated="excessive_capitalization",
                    impact="May appear as shouting",
                    auto_fixable=True,
                    confidence_score=0.9
                ))
            
            # Check for repeated words
            if re.search(self.prohibited_patterns["repeated_words"], content, re.IGNORECASE):
                issues.append(ValidationIssue(
                    id=f"repeated_words_{field_name}",
                    severity=ValidationSeverity.MEDIUM,
                    category="formatting",
                    title="Repeated words",
                    description="Content contains repeated words",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Remove duplicate words",
                    rule_violated="repeated_words",
                    impact="May appear as error",
                    auto_fixable=True,
                    confidence_score=0.8
                ))
            
            # Check for phone numbers in headlines (not allowed)
            if content_type == ContentType.HEADLINE:
                if re.search(self.prohibited_patterns["phone_in_headline"], content):
                    issues.append(ValidationIssue(
                        id=f"phone_in_headline_{field_name}",
                        severity=ValidationSeverity.CRITICAL,
                        category="policy_violation",
                        title="Phone number in headline",
                        description="Headlines cannot contain phone numbers",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix="Move phone number to description or use extensions",
                        rule_violated="phone_in_headline",
                        impact="Ad will be disapproved",
                        auto_fixable=False,
                        confidence_score=1.0
                    ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Format validation failed: {str(e)}")
            return []
    
    async def _validate_language_quality(self,
                                        content: str,
                                        content_type: ContentType,
                                        field_name: str) -> List[ValidationIssue]:
        """Validate language quality (spelling and grammar)"""
        issues = []
        
        try:
            # Use TextBlob for basic language analysis
            blob = TextBlob(content)
            
            # Check spelling
            if self.validation_config["check_spelling"]:
                corrected = blob.correct()
                if str(corrected) != content:
                    issues.append(ValidationIssue(
                        id=f"spelling_{field_name}",
                        severity=ValidationSeverity.MEDIUM,
                        category="language_quality",
                        title="Potential spelling errors",
                        description="Content may contain spelling errors",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix=f"Consider: {str(corrected)}",
                        rule_violated="spelling_errors",
                        impact="May appear unprofessional",
                        auto_fixable=True,
                        confidence_score=0.7
                    ))
            
            # Check for basic grammar issues
            if self.validation_config["check_grammar"]:
                # Simple grammar checks
                sentences = blob.sentences
                for sentence in sentences:
                    # Check for sentence fragments (very basic)
                    if len(sentence.words) < 3 and content_type != ContentType.HEADLINE:
                        issues.append(ValidationIssue(
                            id=f"grammar_fragment_{field_name}",
                            severity=ValidationSeverity.LOW,
                            category="language_quality",
                            title="Possible sentence fragment",
                            description="Content may contain incomplete sentences",
                            content_type=content_type,
                            field_name=field_name,
                            current_value=content,
                            suggested_fix="Ensure complete sentences",
                            rule_violated="sentence_fragments",
                            impact="May affect readability",
                            auto_fixable=False,
                            confidence_score=0.6
                        ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Language quality validation failed: {str(e)}")
            return []
    
    async def _validate_readability(self,
                                  content: str,
                                  content_type: ContentType,
                                  field_name: str) -> List[ValidationIssue]:
        """Validate content readability"""
        issues = []
        
        try:
            # Calculate basic readability metrics
            words = content.split()
            sentences = content.split('.')
            
            if len(sentences) > 1:  # Only for multi-sentence content
                avg_words_per_sentence = len(words) / len(sentences)
                
                # Check for overly complex sentences
                if avg_words_per_sentence > 20:
                    issues.append(ValidationIssue(
                        id=f"readability_{field_name}",
                        severity=ValidationSeverity.MEDIUM,
                        category="readability",
                        title="Complex sentences",
                        description=f"Average {avg_words_per_sentence:.1f} words per sentence",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix="Use shorter, simpler sentences",
                        rule_violated="sentence_complexity",
                        impact="May be difficult to read",
                        auto_fixable=False,
                        confidence_score=0.7
                    ))
            
            # Check for overly long words
            long_words = [word for word in words if len(word) > 12]
            if len(long_words) > len(words) * 0.2:  # More than 20% long words
                issues.append(ValidationIssue(
                    id=f"word_complexity_{field_name}",
                    severity=ValidationSeverity.LOW,
                    category="readability",
                    title="Complex vocabulary",
                    description="Content contains many long words",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Use simpler, shorter words when possible",
                    rule_violated="word_complexity",
                    impact="May be difficult to understand",
                    auto_fixable=False,
                    confidence_score=0.6
                ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Readability validation failed: {str(e)}")
            return []
    
    async def _validate_compliance(self,
                                 content: str,
                                 content_type: ContentType,
                                 field_name: str) -> List[ValidationIssue]:
        """Validate compliance with policies"""
        issues = []
        
        try:
            content_lower = content.lower()
            
            # Check for potentially misleading claims
            misleading_terms = [
                "guaranteed", "100% effective", "miracle", "instant results",
                "no risk", "free money", "get rich quick"
            ]
            
            for term in misleading_terms:
                if term in content_lower:
                    issues.append(ValidationIssue(
                        id=f"misleading_{field_name}_{term.replace(' ', '_')}",
                        severity=ValidationSeverity.HIGH,
                        category="compliance",
                        title="Potentially misleading claim",
                        description=f"Content contains potentially misleading term: '{term}'",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix=f"Remove or qualify the term '{term}'",
                        rule_violated="misleading_claims",
                        impact="May violate advertising policies",
                        auto_fixable=False,
                        confidence_score=0.8
                    ))
            
            # Check for superlatives without substantiation
            superlatives = ["best", "greatest", "ultimate", "perfect", "unbeatable"]
            superlative_count = sum(1 for term in superlatives if term in content_lower)
            
            if superlative_count > 1:
                issues.append(ValidationIssue(
                    id=f"superlatives_{field_name}",
                    severity=ValidationSeverity.MEDIUM,
                    category="compliance",
                    title="Multiple superlatives",
                    description="Content contains multiple superlative claims",
                    content_type=content_type,
                    field_name=field_name,
                    current_value=content,
                    suggested_fix="Reduce superlatives or provide substantiation",
                    rule_violated="unsubstantiated_claims",
                    impact="May require proof of claims",
                    auto_fixable=False,
                    confidence_score=0.7
                ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Compliance validation failed: {str(e)}")
            return []
    
    async def _validate_content_specific(self,
                                       content: str,
                                       content_type: ContentType,
                                       field_name: str) -> List[ValidationIssue]:
        """Validate content-specific rules"""
        issues = []
        
        try:
            if content_type == ContentType.HEADLINE:
                # Headlines should be compelling and action-oriented
                action_words = ["get", "buy", "discover", "learn", "save", "find", "start"]
                if not any(word in content.lower() for word in action_words):
                    issues.append(ValidationIssue(
                        id=f"headline_action_{field_name}",
                        severity=ValidationSeverity.LOW,
                        category="content_optimization",
                        title="Consider adding action words",
                        description="Headlines are more effective with action words",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix="Add action words like 'Get', 'Discover', 'Save'",
                        rule_violated="headline_optimization",
                        impact="May have lower click-through rate",
                        auto_fixable=False,
                        confidence_score=0.6
                    ))
            
            elif content_type == ContentType.DESCRIPTION:
                # Descriptions should include a call-to-action
                cta_words = ["call", "click", "visit", "contact", "order", "buy", "learn more"]
                if not any(word in content.lower() for word in cta_words):
                    issues.append(ValidationIssue(
                        id=f"description_cta_{field_name}",
                        severity=ValidationSeverity.MEDIUM,
                        category="content_optimization",
                        title="Missing call-to-action",
                        description="Descriptions should include a clear call-to-action",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix="Add a call-to-action like 'Call now' or 'Learn more'",
                        rule_violated="description_optimization",
                        impact="May have lower conversion rate",
                        auto_fixable=False,
                        confidence_score=0.7
                    ))
            
            elif content_type == ContentType.KEYWORD:
                # Keywords should be relevant and not too broad
                words = content.split()
                if len(words) == 1 and len(content) < 4:
                    issues.append(ValidationIssue(
                        id=f"keyword_too_broad_{field_name}",
                        severity=ValidationSeverity.MEDIUM,
                        category="keyword_optimization",
                        title="Keyword may be too broad",
                        description="Single, short keywords are often too broad",
                        content_type=content_type,
                        field_name=field_name,
                        current_value=content,
                        suggested_fix="Consider more specific, longer keywords",
                        rule_violated="keyword_specificity",
                        impact="May have low relevance and high competition",
                        auto_fixable=False,
                        confidence_score=0.6
                    ))
            
            return issues
            
        except Exception as e:
            logger.error(f"Content-specific validation failed: {str(e)}")
            return []
    
    async def _generate_suggestions(self,
                                  content: str,
                                  content_type: ContentType,
                                  issues: List[ValidationIssue]) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        
        try:
            # General suggestions based on content type
            if content_type == ContentType.HEADLINE:
                suggestions.extend([
                    "Include your main keyword",
                    "Use numbers or statistics if relevant",
                    "Create urgency or scarcity",
                    "Ask a question to engage users"
                ])
            
            elif content_type == ContentType.DESCRIPTION:
                suggestions.extend([
                    "Highlight unique benefits",
                    "Include a strong call-to-action",
                    "Mention special offers or promotions",
                    "Address customer pain points"
                ])
            
            elif content_type == ContentType.KEYWORD:
                suggestions.extend([
                    "Use long-tail keywords for better targeting",
                    "Include location-based terms if relevant",
                    "Consider user intent (commercial vs informational)",
                    "Research competitor keywords"
                ])
            
            # Suggestions based on specific issues
            critical_issues = [i for i in issues if i.severity == ValidationSeverity.CRITICAL]
            if critical_issues:
                suggestions.append("Address critical issues first to ensure ad approval")
            
            high_issues = [i for i in issues if i.severity == ValidationSeverity.HIGH]
            if high_issues:
                suggestions.append("Fix high-priority issues to improve performance")
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Suggestion generation failed: {str(e)}")
            return []
    
    async def _calculate_quality_score(self,
                                     content: str,
                                     issues: List[ValidationIssue],
                                     content_type: ContentType) -> float:
        """Calculate overall quality score"""
        try:
            base_score = 100.0
            
            # Deduct points for issues
            for issue in issues:
                if issue.severity == ValidationSeverity.CRITICAL:
                    base_score -= 25
                elif issue.severity == ValidationSeverity.HIGH:
                    base_score -= 15
                elif issue.severity == ValidationSeverity.MEDIUM:
                    base_score -= 10
                elif issue.severity == ValidationSeverity.LOW:
                    base_score -= 5
            
            # Bonus points for good practices
            if content_type == ContentType.HEADLINE:
                # Bonus for optimal length
                if 20 <= len(content) <= 30:
                    base_score += 5
                
                # Bonus for including numbers
                if any(char.isdigit() for char in content):
                    base_score += 3
            
            elif content_type == ContentType.DESCRIPTION:
                # Bonus for call-to-action
                cta_words = ["call", "click", "visit", "contact", "order", "buy"]
                if any(word in content.lower() for word in cta_words):
                    base_score += 5
            
            # Ensure score is between 0 and 100
            return max(0.0, min(100.0, base_score))
            
        except Exception as e:
            logger.error(f"Quality score calculation failed: {str(e)}")
            return 0.0
    
    async def _check_compliance_status(self, issues: List[ValidationIssue]) -> Dict[str, bool]:
        """Check compliance status across different categories"""
        try:
            compliance_status = {
                "google_ads_policy": True,
                "character_limits": True,
                "formatting": True,
                "language_quality": True,
                "readability": True
            }
            
            for issue in issues:
                if issue.severity in [ValidationSeverity.CRITICAL, ValidationSeverity.HIGH]:
                    if issue.category in ["policy_violation", "compliance"]:
                        compliance_status["google_ads_policy"] = False
                    elif issue.category == "character_limits":
                        compliance_status["character_limits"] = False
                    elif issue.category == "formatting":
                        compliance_status["formatting"] = False
                    elif issue.category == "language_quality":
                        compliance_status["language_quality"] = False
                    elif issue.category == "readability":
                        compliance_status["readability"] = False
            
            return compliance_status
            
        except Exception as e:
            logger.error(f"Compliance status check failed: {str(e)}")
            return {}
    
    async def _auto_fix_issues(self, content: str, issues: List[ValidationIssue]) -> str:
        """Auto-fix issues where possible"""
        try:
            fixed_content = content
            
            for issue in issues:
                if issue.auto_fixable:
                    if issue.rule_violated == "excessive_punctuation":
                        fixed_content = re.sub(r'[!?]{2,}', '!', fixed_content)
                    
                    elif issue.rule_violated == "excessive_capitalization":
                        # Convert excessive caps to title case
                        words = fixed_content.split()
                        fixed_words = []
                        for word in words:
                            if len(word) > 3 and word.isupper():
                                fixed_words.append(word.title())
                            else:
                                fixed_words.append(word)
                        fixed_content = ' '.join(fixed_words)
                    
                    elif issue.rule_violated == "repeated_words":
                        # Remove repeated words
                        words = fixed_content.split()
                        fixed_words = []
                        prev_word = ""
                        for word in words:
                            if word.lower() != prev_word.lower():
                                fixed_words.append(word)
                            prev_word = word
                        fixed_content = ' '.join(fixed_words)
                    
                    elif issue.rule_violated == "character_limit":
                        # Truncate to character limit
                        limit = self._get_character_limit(issue.content_type, issue.field_name)
                        if limit:
                            fixed_content = fixed_content[:limit].rstrip()
            
            return fixed_content
            
        except Exception as e:
            logger.error(f"Auto-fix failed: {str(e)}")
            return content
    
    def _get_character_limit(self, content_type: ContentType, field_name: str) -> Optional[int]:
        """Get character limit for content type"""
        if content_type == ContentType.HEADLINE:
            return self.character_limits["long_headline"] if "long" in field_name.lower() else self.character_limits["headline"]
        elif content_type == ContentType.DESCRIPTION:
            return self.character_limits["description"]
        elif "path" in field_name.lower():
            return self.character_limits["path"]
        return None
    
    def _update_average_quality_score(self, score: float):
        """Update average quality score"""
        total = self.validation_stats["total_validations"]
        current_avg = self.validation_stats["average_quality_score"]
        
        new_avg = ((current_avg * (total - 1)) + score) / total
        self.validation_stats["average_quality_score"] = new_avg
    
    def get_validation_statistics(self) -> Dict[str, Any]:
        """Get validation statistics"""
        return self.validation_stats.copy()
    
    def reset_statistics(self):
        """Reset validation statistics"""
        self.validation_stats = {
            "total_validations": 0,
            "passed_validations": 0,
            "failed_validations": 0,
            "auto_fixes_applied": 0,
            "average_quality_score": 0.0
        }
        logger.info("Validation statistics reset")

