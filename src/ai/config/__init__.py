# Google Ads AI Platform - Configuration Package
# Centralized configuration management for all AI components

from .google_ads_config import (
    GoogleAdsManager,
    GoogleAdsConfig,
    google_ads_manager,
    get_google_ads_client,
    authenticate_google_ads,
    validate_google_ads_config
)

__all__ = [
    'GoogleAdsManager',
    'GoogleAdsConfig', 
    'google_ads_manager',
    'get_google_ads_client',
    'authenticate_google_ads',
    'validate_google_ads_config'
]

