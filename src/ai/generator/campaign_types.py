# Google Ads AI Platform - Campaign Types
# Comprehensive campaign type definitions and configurations

import logging
from typing import Dict, Any, List, Optional
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class CampaignType(Enum):
    """Google Ads campaign types"""
    SEARCH = "search"
    DISPLAY = "display"
    SHOPPING = "shopping"
    VIDEO = "video"
    PERFORMANCE_MAX = "performance_max"
    APP = "app"
    LOCAL = "local"
    SMART = "smart"

class CampaignObjective(Enum):
    """Campaign objectives"""
    SALES = "sales"
    LEADS = "leads"
    WEBSITE_TRAFFIC = "website_traffic"
    PRODUCT_BRAND_CONSIDERATION = "product_brand_consideration"
    BRAND_AWARENESS_REACH = "brand_awareness_reach"
    APP_PROMOTION = "app_promotion"
    LOCAL_STORE_VISITS = "local_store_visits"

class BiddingStrategy(Enum):
    """Bidding strategies"""
    MANUAL_CPC = "manual_cpc"
    ENHANCED_CPC = "enhanced_cpc"
    MAXIMIZE_CLICKS = "maximize_clicks"
    MAXIMIZE_CONVERSIONS = "maximize_conversions"
    MAXIMIZE_CONVERSION_VALUE = "maximize_conversion_value"
    TARGET_CPA = "target_cpa"
    TARGET_ROAS = "target_roas"
    TARGET_IMPRESSION_SHARE = "target_impression_share"

@dataclass
class CampaignConfiguration:
    """Campaign configuration settings"""
    campaign_type: CampaignType
    objective: CampaignObjective
    bidding_strategy: BiddingStrategy
    budget_type: str
    recommended_budget: Dict[str, float]
    targeting_options: List[str]
    ad_formats: List[str]
    optimization_goals: List[str]
    best_practices: List[str]
    setup_requirements: List[str]

class CampaignTypeManager:
    """
    Manages different Google Ads campaign types and their configurations
    
    Provides comprehensive setup and optimization guidance for:
    - Search campaigns
    - Display campaigns
    - Shopping campaigns
    - Video campaigns
    - Performance Max campaigns
    - App campaigns
    - Local campaigns
    """
    
    def __init__(self):
        """Initialize campaign type manager"""
        self.campaign_configs = self._initialize_campaign_configs()
        
        # Budget recommendations by business size
        self.budget_recommendations = {
            "small_business": {
                "daily_min": 10,
                "daily_recommended": 50,
                "daily_max": 200,
                "monthly_min": 300,
                "monthly_recommended": 1500,
                "monthly_max": 6000
            },
            "medium_business": {
                "daily_min": 50,
                "daily_recommended": 200,
                "daily_max": 1000,
                "monthly_min": 1500,
                "monthly_recommended": 6000,
                "monthly_max": 30000
            },
            "large_business": {
                "daily_min": 200,
                "daily_recommended": 1000,
                "daily_max": 5000,
                "monthly_min": 6000,
                "monthly_recommended": 30000,
                "monthly_max": 150000
            }
        }
        
        # Industry-specific recommendations
        self.industry_recommendations = {
            "ecommerce": {
                "primary_types": [CampaignType.SHOPPING, CampaignType.SEARCH, CampaignType.PERFORMANCE_MAX],
                "secondary_types": [CampaignType.DISPLAY, CampaignType.VIDEO],
                "objectives": [CampaignObjective.SALES, CampaignObjective.WEBSITE_TRAFFIC],
                "bidding": [BiddingStrategy.TARGET_ROAS, BiddingStrategy.MAXIMIZE_CONVERSION_VALUE]
            },
            "professional_services": {
                "primary_types": [CampaignType.SEARCH, CampaignType.LOCAL],
                "secondary_types": [CampaignType.DISPLAY, CampaignType.PERFORMANCE_MAX],
                "objectives": [CampaignObjective.LEADS, CampaignObjective.LOCAL_STORE_VISITS],
                "bidding": [BiddingStrategy.TARGET_CPA, BiddingStrategy.MAXIMIZE_CONVERSIONS]
            },
            "healthcare": {
                "primary_types": [CampaignType.SEARCH, CampaignType.LOCAL],
                "secondary_types": [CampaignType.DISPLAY],
                "objectives": [CampaignObjective.LEADS, CampaignObjective.LOCAL_STORE_VISITS],
                "bidding": [BiddingStrategy.TARGET_CPA, BiddingStrategy.ENHANCED_CPC]
            },
            "technology": {
                "primary_types": [CampaignType.SEARCH, CampaignType.DISPLAY, CampaignType.VIDEO],
                "secondary_types": [CampaignType.PERFORMANCE_MAX],
                "objectives": [CampaignObjective.LEADS, CampaignObjective.WEBSITE_TRAFFIC],
                "bidding": [BiddingStrategy.TARGET_CPA, BiddingStrategy.MAXIMIZE_CONVERSIONS]
            },
            "local_business": {
                "primary_types": [CampaignType.LOCAL, CampaignType.SEARCH],
                "secondary_types": [CampaignType.DISPLAY],
                "objectives": [CampaignObjective.LOCAL_STORE_VISITS, CampaignObjective.LEADS],
                "bidding": [BiddingStrategy.MAXIMIZE_CLICKS, BiddingStrategy.TARGET_CPA]
            }
        }
    
    def get_recommended_campaigns(self,
                                business_info: Dict[str, Any],
                                budget_range: str = "medium",
                                objectives: List[str] = None) -> List[Dict[str, Any]]:
        """
        Get recommended campaign types for a business
        
        Args:
            business_info: Business information
            budget_range: Budget range (small, medium, large)
            objectives: Specific objectives to focus on
            
        Returns:
            List of recommended campaign configurations
        """
        try:
            business_category = business_info.get("category", "general")
            business_size = self._determine_business_size(business_info, budget_range)
            
            # Get industry recommendations
            industry_rec = self.industry_recommendations.get(business_category, {
                "primary_types": [CampaignType.SEARCH],
                "secondary_types": [CampaignType.DISPLAY],
                "objectives": [CampaignObjective.WEBSITE_TRAFFIC],
                "bidding": [BiddingStrategy.MAXIMIZE_CLICKS]
            })
            
            recommendations = []
            
            # Primary campaign recommendations
            for campaign_type in industry_rec["primary_types"]:
                config = self._create_campaign_recommendation(
                    campaign_type, business_info, business_size, "primary"
                )
                recommendations.append(config)
            
            # Secondary campaign recommendations (if budget allows)
            if business_size in ["medium_business", "large_business"]:
                for campaign_type in industry_rec["secondary_types"][:2]:
                    config = self._create_campaign_recommendation(
                        campaign_type, business_info, business_size, "secondary"
                    )
                    recommendations.append(config)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Campaign recommendation failed: {str(e)}")
            return []
    
    def get_campaign_config(self, campaign_type: CampaignType) -> CampaignConfiguration:
        """Get configuration for specific campaign type"""
        return self.campaign_configs.get(campaign_type)
    
    def optimize_campaign_settings(self,
                                 campaign_type: CampaignType,
                                 business_info: Dict[str, Any],
                                 performance_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Optimize campaign settings based on performance data
        
        Args:
            campaign_type: Type of campaign
            business_info: Business information
            performance_data: Historical performance data
            
        Returns:
            Optimized campaign settings
        """
        try:
            config = self.campaign_configs.get(campaign_type)
            if not config:
                return {}
            
            optimization = {
                "campaign_type": campaign_type.value,
                "current_settings": {},
                "recommended_changes": [],
                "optimization_priority": [],
                "expected_impact": {}
            }
            
            # Analyze performance and suggest optimizations
            if performance_data:
                optimization.update(self._analyze_performance_optimizations(
                    campaign_type, performance_data
                ))
            
            # Add general optimization recommendations
            optimization["recommended_changes"].extend(
                self._get_general_optimizations(campaign_type, business_info)
            )
            
            return optimization
            
        except Exception as e:
            logger.error(f"Campaign optimization failed: {str(e)}")
            return {}
    
    def create_campaign_structure(self,
                                campaign_type: CampaignType,
                                business_info: Dict[str, Any],
                                keywords: List[str] = None) -> Dict[str, Any]:
        """
        Create complete campaign structure
        
        Args:
            campaign_type: Type of campaign to create
            business_info: Business information
            keywords: Keywords for the campaign
            
        Returns:
            Complete campaign structure
        """
        try:
            config = self.campaign_configs.get(campaign_type)
            if not config:
                return {}
            
            structure = {
                "campaign": self._create_campaign_settings(campaign_type, business_info),
                "ad_groups": self._create_ad_groups(campaign_type, business_info, keywords),
                "ads": self._create_ad_templates(campaign_type, business_info),
                "keywords": self._organize_keywords(campaign_type, keywords),
                "extensions": self._create_ad_extensions(campaign_type, business_info),
                "targeting": self._create_targeting_settings(campaign_type, business_info),
                "bidding": self._create_bidding_settings(campaign_type, business_info)
            }
            
            return structure
            
        except Exception as e:
            logger.error(f"Campaign structure creation failed: {str(e)}")
            return {}
    
    def _initialize_campaign_configs(self) -> Dict[CampaignType, CampaignConfiguration]:
        """Initialize all campaign type configurations"""
        configs = {}
        
        # Search Campaign Configuration
        configs[CampaignType.SEARCH] = CampaignConfiguration(
            campaign_type=CampaignType.SEARCH,
            objective=CampaignObjective.WEBSITE_TRAFFIC,
            bidding_strategy=BiddingStrategy.ENHANCED_CPC,
            budget_type="daily",
            recommended_budget={"min": 10, "recommended": 50, "max": 500},
            targeting_options=[
                "Keywords", "Location", "Language", "Demographics",
                "Device", "Ad Schedule", "Audience"
            ],
            ad_formats=["Text Ads", "Responsive Search Ads", "Call-Only Ads"],
            optimization_goals=[
                "Increase CTR", "Improve Quality Score", "Reduce CPC",
                "Increase Conversions", "Improve Ad Relevance"
            ],
            best_practices=[
                "Use responsive search ads",
                "Include relevant keywords in headlines",
                "Add sitelink extensions",
                "Use negative keywords",
                "Optimize landing pages",
                "Test multiple ad variations"
            ],
            setup_requirements=[
                "Keyword research", "Landing page optimization",
                "Conversion tracking", "Ad extensions setup"
            ]
        )
        
        # Display Campaign Configuration
        configs[CampaignType.DISPLAY] = CampaignConfiguration(
            campaign_type=CampaignType.DISPLAY,
            objective=CampaignObjective.BRAND_AWARENESS_REACH,
            bidding_strategy=BiddingStrategy.MAXIMIZE_CLICKS,
            budget_type="daily",
            recommended_budget={"min": 5, "recommended": 25, "max": 200},
            targeting_options=[
                "Demographics", "Interests", "Topics", "Placements",
                "Keywords", "Remarketing", "Custom Audiences"
            ],
            ad_formats=[
                "Responsive Display Ads", "Image Ads", "HTML5 Ads",
                "Video Ads", "Gmail Ads"
            ],
            optimization_goals=[
                "Increase Brand Awareness", "Drive Website Traffic",
                "Generate Leads", "Increase Conversions"
            ],
            best_practices=[
                "Use high-quality images",
                "Create compelling headlines",
                "Target relevant audiences",
                "Use frequency capping",
                "Exclude irrelevant placements",
                "Test different ad sizes"
            ],
            setup_requirements=[
                "Creative assets", "Audience definition",
                "Placement strategy", "Frequency management"
            ]
        )
        
        # Shopping Campaign Configuration
        configs[CampaignType.SHOPPING] = CampaignConfiguration(
            campaign_type=CampaignType.SHOPPING,
            objective=CampaignObjective.SALES,
            bidding_strategy=BiddingStrategy.MAXIMIZE_CONVERSION_VALUE,
            budget_type="daily",
            recommended_budget={"min": 20, "recommended": 100, "max": 1000},
            targeting_options=[
                "Product Groups", "Location", "Device",
                "Ad Schedule", "Demographics"
            ],
            ad_formats=["Product Shopping Ads", "Showcase Shopping Ads"],
            optimization_goals=[
                "Increase ROAS", "Reduce CPC", "Improve Product Visibility",
                "Increase Sales Volume", "Optimize Product Feed"
            ],
            best_practices=[
                "Optimize product feed",
                "Use high-quality product images",
                "Include detailed product information",
                "Set competitive prices",
                "Use product reviews",
                "Organize products into groups"
            ],
            setup_requirements=[
                "Google Merchant Center", "Product feed optimization",
                "E-commerce tracking", "Product grouping strategy"
            ]
        )
        
        # Video Campaign Configuration
        configs[CampaignType.VIDEO] = CampaignConfiguration(
            campaign_type=CampaignType.VIDEO,
            objective=CampaignObjective.BRAND_AWARENESS_REACH,
            bidding_strategy=BiddingStrategy.MAXIMIZE_CLICKS,
            budget_type="daily",
            recommended_budget={"min": 10, "recommended": 50, "max": 300},
            targeting_options=[
                "Demographics", "Interests", "Topics", "Keywords",
                "Placements", "Remarketing", "Custom Audiences"
            ],
            ad_formats=[
                "Skippable In-Stream", "Non-Skippable In-Stream",
                "Video Discovery", "Bumper Ads", "Outstream"
            ],
            optimization_goals=[
                "Increase Video Views", "Improve View Rate",
                "Drive Website Traffic", "Generate Leads"
            ],
            best_practices=[
                "Create engaging video content",
                "Hook viewers in first 5 seconds",
                "Include clear call-to-action",
                "Optimize for mobile viewing",
                "Use compelling thumbnails",
                "Test different video lengths"
            ],
            setup_requirements=[
                "YouTube channel", "Video content creation",
                "Audience strategy", "Creative optimization"
            ]
        )
        
        # Performance Max Campaign Configuration
        configs[CampaignType.PERFORMANCE_MAX] = CampaignConfiguration(
            campaign_type=CampaignType.PERFORMANCE_MAX,
            objective=CampaignObjective.SALES,
            bidding_strategy=BiddingStrategy.MAXIMIZE_CONVERSION_VALUE,
            budget_type="daily",
            recommended_budget={"min": 50, "recommended": 200, "max": 2000},
            targeting_options=[
                "Audience Signals", "Demographics", "Location",
                "Language", "Device"
            ],
            ad_formats=[
                "Text", "Image", "Video", "HTML5",
                "Product Feeds", "Hotel Feeds"
            ],
            optimization_goals=[
                "Maximize Conversions", "Increase ROAS",
                "Expand Reach", "Improve Performance"
            ],
            best_practices=[
                "Provide high-quality assets",
                "Use audience signals effectively",
                "Set appropriate conversion goals",
                "Monitor asset performance",
                "Optimize landing pages",
                "Allow sufficient learning time"
            ],
            setup_requirements=[
                "Conversion tracking", "Asset creation",
                "Audience signals", "Goal setting"
            ]
        )
        
        # Local Campaign Configuration
        configs[CampaignType.LOCAL] = CampaignConfiguration(
            campaign_type=CampaignType.LOCAL,
            objective=CampaignObjective.LOCAL_STORE_VISITS,
            bidding_strategy=BiddingStrategy.MAXIMIZE_CLICKS,
            budget_type="daily",
            recommended_budget={"min": 15, "recommended": 75, "max": 400},
            targeting_options=[
                "Location", "Radius Targeting", "Demographics",
                "Device", "Ad Schedule"
            ],
            ad_formats=["Local Ads", "Call-Only Ads", "Location Extensions"],
            optimization_goals=[
                "Increase Store Visits", "Drive Phone Calls",
                "Improve Local Visibility", "Generate Local Leads"
            ],
            best_practices=[
                "Optimize Google My Business",
                "Use location extensions",
                "Include local keywords",
                "Set appropriate radius targeting",
                "Use call extensions",
                "Optimize for mobile"
            ],
            setup_requirements=[
                "Google My Business", "Location verification",
                "Local keyword research", "Mobile optimization"
            ]
        )
        
        return configs
    
    def _determine_business_size(self, business_info: Dict[str, Any], budget_range: str) -> str:
        """Determine business size based on info and budget"""
        # Simple logic - can be enhanced with more sophisticated analysis
        budget_mapping = {
            "small": "small_business",
            "medium": "medium_business", 
            "large": "large_business"
        }
        
        return budget_mapping.get(budget_range, "medium_business")
    
    def _create_campaign_recommendation(self,
                                      campaign_type: CampaignType,
                                      business_info: Dict[str, Any],
                                      business_size: str,
                                      priority: str) -> Dict[str, Any]:
        """Create campaign recommendation"""
        config = self.campaign_configs.get(campaign_type)
        budget_rec = self.budget_recommendations.get(business_size, {})
        
        # Adjust budget based on priority
        budget_multiplier = 1.0 if priority == "primary" else 0.6
        
        recommendation = {
            "campaign_type": campaign_type.value,
            "priority": priority,
            "objective": config.objective.value,
            "bidding_strategy": config.bidding_strategy.value,
            "recommended_budget": {
                "daily": round(budget_rec.get("daily_recommended", 50) * budget_multiplier),
                "monthly": round(budget_rec.get("monthly_recommended", 1500) * budget_multiplier)
            },
            "setup_complexity": self._get_setup_complexity(campaign_type),
            "expected_timeline": self._get_setup_timeline(campaign_type),
            "key_benefits": self._get_campaign_benefits(campaign_type),
            "setup_requirements": config.setup_requirements,
            "best_practices": config.best_practices[:5]  # Top 5 practices
        }
        
        return recommendation
    
    def _get_setup_complexity(self, campaign_type: CampaignType) -> str:
        """Get setup complexity level"""
        complexity_map = {
            CampaignType.SEARCH: "Medium",
            CampaignType.DISPLAY: "Low",
            CampaignType.SHOPPING: "High",
            CampaignType.VIDEO: "Medium",
            CampaignType.PERFORMANCE_MAX: "High",
            CampaignType.LOCAL: "Low"
        }
        return complexity_map.get(campaign_type, "Medium")
    
    def _get_setup_timeline(self, campaign_type: CampaignType) -> str:
        """Get expected setup timeline"""
        timeline_map = {
            CampaignType.SEARCH: "1-2 days",
            CampaignType.DISPLAY: "1 day",
            CampaignType.SHOPPING: "3-5 days",
            CampaignType.VIDEO: "2-3 days",
            CampaignType.PERFORMANCE_MAX: "3-4 days",
            CampaignType.LOCAL: "1-2 days"
        }
        return timeline_map.get(campaign_type, "2-3 days")
    
    def _get_campaign_benefits(self, campaign_type: CampaignType) -> List[str]:
        """Get key benefits of campaign type"""
        benefits_map = {
            CampaignType.SEARCH: [
                "High intent traffic", "Immediate visibility",
                "Precise targeting", "Measurable ROI"
            ],
            CampaignType.DISPLAY: [
                "Brand awareness", "Visual impact",
                "Broad reach", "Remarketing opportunities"
            ],
            CampaignType.SHOPPING: [
                "Product visibility", "High conversion rates",
                "Qualified traffic", "Competitive advantage"
            ],
            CampaignType.VIDEO: [
                "Engaging format", "Brand storytelling",
                "Emotional connection", "Viral potential"
            ],
            CampaignType.PERFORMANCE_MAX: [
                "AI optimization", "Cross-channel reach",
                "Automated bidding", "Goal-focused"
            ],
            CampaignType.LOCAL: [
                "Local visibility", "Store visits",
                "Mobile optimization", "Community reach"
            ]
        }
        return benefits_map.get(campaign_type, ["Increased visibility"])
    
    def _analyze_performance_optimizations(self,
                                         campaign_type: CampaignType,
                                         performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance data and suggest optimizations"""
        optimizations = {
            "performance_analysis": {},
            "recommended_changes": [],
            "optimization_priority": []
        }
        
        # Analyze key metrics
        ctr = performance_data.get("ctr", 0)
        cpc = performance_data.get("cpc", 0)
        conversion_rate = performance_data.get("conversion_rate", 0)
        quality_score = performance_data.get("quality_score", 0)
        
        # CTR optimization
        if ctr < 2.0:  # Below average CTR
            optimizations["recommended_changes"].append({
                "area": "Click-Through Rate",
                "issue": "Low CTR",
                "recommendation": "Improve ad copy and headlines",
                "priority": "High",
                "expected_impact": "15-30% CTR improvement"
            })
        
        # Quality Score optimization
        if quality_score < 7:
            optimizations["recommended_changes"].append({
                "area": "Quality Score",
                "issue": "Low Quality Score",
                "recommendation": "Optimize keywords and landing pages",
                "priority": "High",
                "expected_impact": "Reduced CPC and improved ad position"
            })
        
        # Conversion Rate optimization
        if conversion_rate < 2.0:
            optimizations["recommended_changes"].append({
                "area": "Conversion Rate",
                "issue": "Low Conversion Rate",
                "recommendation": "Optimize landing pages and targeting",
                "priority": "Medium",
                "expected_impact": "20-40% conversion improvement"
            })
        
        return optimizations
    
    def _get_general_optimizations(self,
                                 campaign_type: CampaignType,
                                 business_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get general optimization recommendations"""
        optimizations = []
        
        # Common optimizations for all campaign types
        optimizations.extend([
            {
                "area": "Targeting",
                "recommendation": "Review and refine audience targeting",
                "priority": "Medium",
                "frequency": "Weekly"
            },
            {
                "area": "Budget",
                "recommendation": "Monitor budget utilization and adjust",
                "priority": "High",
                "frequency": "Daily"
            },
            {
                "area": "Bidding",
                "recommendation": "Optimize bidding strategy based on performance",
                "priority": "High",
                "frequency": "Weekly"
            }
        ])
        
        # Campaign-specific optimizations
        if campaign_type == CampaignType.SEARCH:
            optimizations.extend([
                {
                    "area": "Keywords",
                    "recommendation": "Add negative keywords and expand keyword list",
                    "priority": "High",
                    "frequency": "Weekly"
                },
                {
                    "area": "Ad Extensions",
                    "recommendation": "Add and optimize ad extensions",
                    "priority": "Medium",
                    "frequency": "Monthly"
                }
            ])
        
        return optimizations
    
    def _create_campaign_settings(self,
                                campaign_type: CampaignType,
                                business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create campaign-level settings"""
        config = self.campaign_configs.get(campaign_type)
        
        settings = {
            "name": f"{business_info.get('name', 'Business')} - {campaign_type.value.title()}",
            "type": campaign_type.value,
            "objective": config.objective.value,
            "bidding_strategy": config.bidding_strategy.value,
            "budget": config.recommended_budget,
            "status": "PAUSED",  # Start paused for review
            "start_date": "immediate",
            "end_date": None,
            "location_targeting": self._get_location_targeting(business_info),
            "language_targeting": ["en"],
            "device_targeting": ["desktop", "mobile", "tablet"]
        }
        
        return settings
    
    def _create_ad_groups(self,
                        campaign_type: CampaignType,
                        business_info: Dict[str, Any],
                        keywords: List[str] = None) -> List[Dict[str, Any]]:
        """Create ad group structure"""
        ad_groups = []
        
        if not keywords:
            keywords = ["general"]
        
        # Group keywords by theme (simplified)
        keyword_groups = self._group_keywords_for_ad_groups(keywords)
        
        for group_name, group_keywords in keyword_groups.items():
            ad_group = {
                "name": f"{group_name.title()} - {campaign_type.value.title()}",
                "keywords": group_keywords,
                "default_bid": 1.0,  # Will be optimized
                "status": "ENABLED"
            }
            ad_groups.append(ad_group)
        
        return ad_groups
    
    def _create_ad_templates(self,
                           campaign_type: CampaignType,
                           business_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create ad templates for the campaign"""
        templates = []
        business_name = business_info.get("name", "Business")
        
        if campaign_type == CampaignType.SEARCH:
            templates.append({
                "type": "responsive_search_ad",
                "headlines": [
                    f"Professional {business_name} Services",
                    "Expert Solutions You Can Trust",
                    "Get Started Today"
                ],
                "descriptions": [
                    "Quality service with guaranteed results. Contact us for free consultation!",
                    "Trusted by thousands. Professional help when you need it most."
                ],
                "path1": "services",
                "path2": "contact"
            })
        
        return templates
    
    def _organize_keywords(self,
                         campaign_type: CampaignType,
                         keywords: List[str] = None) -> Dict[str, List[str]]:
        """Organize keywords by match type"""
        if not keywords:
            return {}
        
        organized = {
            "exact": [],
            "phrase": [],
            "broad": []
        }
        
        # Simple organization logic
        for keyword in keywords[:20]:  # Limit for initial setup
            if len(keyword.split()) == 1:
                organized["exact"].append(keyword)
            elif len(keyword.split()) == 2:
                organized["phrase"].append(keyword)
            else:
                organized["broad"].append(keyword)
        
        return organized
    
    def _create_ad_extensions(self,
                            campaign_type: CampaignType,
                            business_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create ad extensions"""
        extensions = []
        
        # Sitelink extensions
        extensions.append({
            "type": "sitelink",
            "sitelinks": [
                {"text": "About Us", "url": "/about"},
                {"text": "Services", "url": "/services"},
                {"text": "Contact", "url": "/contact"},
                {"text": "Get Quote", "url": "/quote"}
            ]
        })
        
        # Call extension
        phone = business_info.get("contact_info", {}).get("phone")
        if phone:
            extensions.append({
                "type": "call",
                "phone_number": phone,
                "call_only": False
            })
        
        return extensions
    
    def _create_targeting_settings(self,
                                 campaign_type: CampaignType,
                                 business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create targeting settings"""
        targeting = {
            "location": self._get_location_targeting(business_info),
            "language": ["en"],
            "demographics": {
                "age": ["18-24", "25-34", "35-44", "45-54", "55-64"],
                "gender": ["male", "female"]
            },
            "devices": ["desktop", "mobile", "tablet"],
            "ad_schedule": "all_time"
        }
        
        return targeting
    
    def _create_bidding_settings(self,
                               campaign_type: CampaignType,
                               business_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create bidding settings"""
        config = self.campaign_configs.get(campaign_type)
        
        bidding = {
            "strategy": config.bidding_strategy.value,
            "target_cpa": None,
            "target_roas": None,
            "max_cpc": 2.0,  # Default max CPC
            "enhanced_cpc": True if config.bidding_strategy == BiddingStrategy.ENHANCED_CPC else False
        }
        
        return bidding
    
    def _get_location_targeting(self, business_info: Dict[str, Any]) -> List[str]:
        """Get location targeting based on business info"""
        location_info = business_info.get("location_info", {})
        
        locations = []
        
        # Add city if available
        city = location_info.get("city")
        state = location_info.get("state")
        
        if city and state:
            locations.append(f"{city}, {state}")
        elif city:
            locations.append(city)
        elif state:
            locations.append(state)
        else:
            locations.append("United States")  # Default
        
        return locations
    
    def _group_keywords_for_ad_groups(self, keywords: List[str]) -> Dict[str, List[str]]:
        """Group keywords into ad groups"""
        # Simplified grouping - can be enhanced with more sophisticated logic
        groups = {
            "general": [],
            "branded": [],
            "commercial": []
        }
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            if any(word in keyword_lower for word in ["buy", "purchase", "order", "shop"]):
                groups["commercial"].append(keyword)
            elif len(keyword.split()) > 3:
                groups["general"].append(keyword)
            else:
                groups["branded"].append(keyword)
        
        # Remove empty groups
        return {k: v for k, v in groups.items() if v}
    
    def get_campaign_type_comparison(self) -> Dict[str, Any]:
        """Get comparison of all campaign types"""
        comparison = {
            "campaign_types": [],
            "comparison_matrix": {},
            "selection_guide": {}
        }
        
        for campaign_type, config in self.campaign_configs.items():
            type_info = {
                "type": campaign_type.value,
                "objective": config.objective.value,
                "complexity": self._get_setup_complexity(campaign_type),
                "timeline": self._get_setup_timeline(campaign_type),
                "budget_range": config.recommended_budget,
                "best_for": self._get_campaign_benefits(campaign_type)
            }
            comparison["campaign_types"].append(type_info)
        
        return comparison

