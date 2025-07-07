# Google Ads AI Platform - Processors Package
# Advanced data processing and campaign optimization

"""
AI Processors Package

This package contains advanced data processing and optimization modules for:
- Data processing and transformation
- Campaign optimization and enhancement
- Content validation and quality assurance
- Format conversion and standardization
- Quality checking and compliance

Main Components:
- DataProcessor: Core data processing and transformation
- CampaignOptimizer: Advanced campaign optimization algorithms
- ContentValidator: Content validation and compliance checking
- FormatConverter: Data format conversion and standardization
- QualityChecker: Quality assurance and performance validation

Usage:
    from ai.processors import DataProcessor, CampaignOptimizer
    
    # Initialize processors
    data_processor = DataProcessor()
    campaign_optimizer = CampaignOptimizer()
    
    # Process website data
    processed_data = await data_processor.process_website_data(raw_data)
    
    # Optimize campaign
    optimized_campaign = await campaign_optimizer.optimize_campaign(campaign_data)
"""

import logging
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Import main processor classes
try:
    from .data_processor import DataProcessor
    from .campaign_optimizer import CampaignOptimizer
    from .content_validator import ContentValidator
    from .format_converter import FormatConverter
    from .quality_checker import QualityChecker
    
    logger.info("AI Processors package initialized successfully")
    
except ImportError as e:
    logger.error(f"Failed to import processors: {str(e)}")
    # Fallback imports
    DataProcessor = None
    CampaignOptimizer = None
    ContentValidator = None
    FormatConverter = None
    QualityChecker = None

# Package metadata
__version__ = "1.0.0"
__author__ = "Google Ads AI Platform Team"
__description__ = "Advanced data processing and campaign optimization"

# Export main classes
__all__ = [
    "DataProcessor",
    "CampaignOptimizer", 
    "ContentValidator",
    "FormatConverter",
    "QualityChecker"
]

# Processor factory function
def create_processor_suite(config: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Create a complete suite of processors
    
    Args:
        config: Configuration dictionary for processors
        
    Returns:
        Dictionary containing all initialized processors
    """
    try:
        config = config or {}
        
        processors = {
            "data_processor": DataProcessor(config.get("data_processor", {})),
            "campaign_optimizer": CampaignOptimizer(config.get("campaign_optimizer", {})),
            "content_validator": ContentValidator(config.get("content_validator", {})),
            "format_converter": FormatConverter(config.get("format_converter", {})),
            "quality_checker": QualityChecker(config.get("quality_checker", {}))
        }
        
        logger.info("Processor suite created successfully")
        return processors
        
    except Exception as e:
        logger.error(f"Failed to create processor suite: {str(e)}")
        return {}

# Utility functions
def get_processor_status() -> Dict[str, bool]:
    """Get status of all processors"""
    return {
        "data_processor": DataProcessor is not None,
        "campaign_optimizer": CampaignOptimizer is not None,
        "content_validator": ContentValidator is not None,
        "format_converter": FormatConverter is not None,
        "quality_checker": QualityChecker is not None
    }

def validate_processor_dependencies() -> List[str]:
    """Validate processor dependencies"""
    missing_deps = []
    
    required_packages = [
        "pandas", "numpy", "scikit-learn", "nltk", 
        "spacy", "textblob", "validators", "jsonschema"
    ]
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_deps.append(package)
    
    return missing_deps

