"""
AI Campaign Flow Routes - AI Campaign Creation Flow
Google Ads AI Platform - Campaign Creation Flow API
"""

import os
import logging
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import json
from datetime import datetime
import uuid

# Import services
from services.ai_campaign_selector import AICampaignSelector
from services.campaign_builder import CampaignBuilder
from services.website_analyzer import WebsiteAnalyzer
from services.google_ads_official_service import GoogleAdsOfficialService

# Create Blueprint
ai_campaign_flow_bp = Blueprint('ai_campaign_flow', __name__, url_prefix='/api/ai-campaign')

# Initialize services (lazy load AIProcessor to avoid startup errors)
ai_campaign_selector = AICampaignSelector()
campaign_builder = CampaignBuilder()
ai_processor = None  # Initialize on first use
website_analyzer = WebsiteAnalyzer()
google_ads_service = GoogleAdsOfficialService()

# Setup logging
logger = logging.getLogger(__name__)

# Helper function to get AIProcessor instance (lazy initialization)
def get_ai_processor():
    """Get or initialize AIProcessor instance"""
    global ai_processor
    if ai_processor is None:
        try:
            from services.ai_processor import AIProcessor
            ai_processor = AIProcessor()
            logger.info("✅ AIProcessor initialized successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize AIProcessor: {e}")
            logger.info("ℹ️ AIProcessor features will be unavailable")
            # Return a mock object that won't crash
            class MockAIProcessor:
                def generate_ad_copy(self, *args, **kwargs):
                    return None
            ai_processor = MockAIProcessor()
    return ai_processor

# Helper function to convert location data to Google Ads location IDs
def convert_locations_to_ids(target_locations):
    """
    Convert target_locations from frontend to Google Ads location IDs
    Uses country codes to map to Google Ads location IDs
    """
    location_ids = []
    
    # Common country code to Google Ads location ID mapping
    country_mapping = {
        'SA': '2682',  # Saudi Arabia
        'AE': '2784',  # United Arab Emirates
        'EG': '2818',  # Egypt
        'US': '2840',  # United States
        'GB': '2826',  # United Kingdom
        'CA': '2124',  # Canada
        'AU': '2036',  # Australia
        'DE': '2276',  # Germany
        'FR': '2250',  # France
        'ES': '2724',  # Spain
        'IT': '2380',  # Italy
        'JO': '2400',  # Jordan
        'LB': '2422',  # Lebanon
        'KW': '2414',  # Kuwait
        'QA': '2634',  # Qatar
        'OM': '2512',  # Oman
        'BH': '2048',  # Bahrain
        'IQ': '2368',  # Iraq
        'YE': '2887',  # Yemen
        'SY': '2760',  # Syria
        'PS': '2275',  # Palestine
        'LY': '2434',  # Libya
        'TN': '2788',  # Tunisia
        'DZ': '2012',  # Algeria
        'MA': '2504',  # Morocco
        'SD': '2729',  # Sudan
    }
    
    if not target_locations or len(target_locations) == 0:
        logger.warning("No target_locations provided")
        return location_ids
    
    for location in target_locations:
        # If location is a string (country code or ID)
        if isinstance(location, str):
            if location in country_mapping:
                location_ids.append(country_mapping[location])
            elif location.isdigit():
                location_ids.append(location)
            continue
        
        # If location is a dict (from frontend)
        if isinstance(location, dict):
            country_code = location.get('country_code')
            if country_code and country_code in country_mapping:
                location_ids.append(country_mapping[country_code])
                logger.info(f"Mapped {location.get('name')} ({country_code}) to ID {country_mapping[country_code]}")
            else:
                logger.warning(f"Could not map location: {location.get('name')} ({country_code})")
    
    logger.info(f"Converted {len(location_ids)} locations to IDs: {location_ids}")
    return location_ids

@ai_campaign_flow_bp.route('/health', methods=['GET'])
def health_check():
    """AI Campaign Flow health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Campaign Flow',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'endpoints': [
            '/get-campaign-types',
            '/get-campaign-type-info/<campaign_type>',
            '/create-campaign',
            '/generate-campaign-content',
            '/analyze-website',
            '/build-campaign',
            '/preview-campaign'
        ]
    })

@ai_campaign_flow_bp.route('/suggest-campaign-type', methods=['POST'])
def suggest_campaign_type():
    """Campaign type suggestion - disabled - use /get-campaign-types instead"""
    return jsonify({
        'success': False,
        'error': 'Feature disabled',
        'message': 'AI campaign type suggestion has been disabled. Please select campaign type manually from the available list.',
        'redirect_to': '/api/ai-campaign/get-campaign-types'
    }), 410

@ai_campaign_flow_bp.route('/analyze-website', methods=['POST'])
def analyze_website():
    """Comprehensive website analysis"""
    try:
        data = request.get_json()
        
        if not data or 'website_url' not in data:
            return jsonify({
                'success': False,
                'error': 'Website URL is required',
                'message': 'Please provide a website URL'
            }), 400
        
        website_url = data['website_url']
        analysis_type = data.get('analysis_type', 'full')  # full, keywords, performance
        
        logger.info(f"Website analysis request: {website_url} - Analysis type: {analysis_type}")
        
        if analysis_type == 'full':
            # Full analysis
            analysis_result = website_analyzer.analyze_website(website_url)
        elif analysis_type == 'keywords':
            # Keywords analysis only
            keywords_result = website_analyzer.extract_business_keywords(website_url)
            analysis_result = {
                'success': keywords_result['success'],
                'analysis': {
                    'keywords_analysis': keywords_result
                }
            }
        elif analysis_type == 'performance':
            # Performance analysis only
            performance_result = website_analyzer.analyze_page_performance(website_url)
            analysis_result = {
                'success': performance_result['success'],
                'analysis': {
                    'performance_analysis': performance_result
                }
            }
        else:
            return jsonify({
                'success': False,
                'error': 'Unsupported analysis type',
                'message': 'Supported analysis types: full, keywords, performance'
            }), 400
        
        if not analysis_result['success']:
            return jsonify(analysis_result), 400
        
        # Add unique request ID
        request_id = str(uuid.uuid4())
        analysis_result['request_id'] = request_id
        
        return jsonify(analysis_result), 200
        
    except Exception as e:
        logger.error(f"Error analyzing website: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while analyzing website'
        }), 500

@ai_campaign_flow_bp.route('/build-campaign', methods=['POST'])
def build_campaign():
    """Build a complete advertising campaign with AI"""
    try:
        data = request.get_json()
        
        # Validate required data
        required_fields = ['website_url', 'campaign_type', 'budget']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': 'Missing required data',
                'message': f'Required fields: {", ".join(missing_fields)}'
            }), 400
        
        website_url = data['website_url']
        campaign_type = data['campaign_type']
        budget = data['budget']
        business_info = data.get('business_info', {})
        target_locations = data.get('target_locations', [])
        target_languages = data.get('target_languages', ['ar'])  # Arabic by default
        
        logger.info(f"Campaign build request: {campaign_type} - Budget: {budget} - Website: {website_url}")
        
        # Create campaign request
        campaign_request = {
            'name': f"Campaign {campaign_type} - {datetime.now().strftime('%Y-%m-%d')}",
            'type': campaign_type,
            'budget': budget,
            'website_url': website_url,
            'business_info': business_info,
            'target_locations': target_locations,
            'target_languages': target_languages,
            'create_in_google_ads': data.get('create_in_google_ads', False),
            'customer_id': data.get('customer_id')
        }
        
        # Build campaign using Campaign Builder
        campaign_result = campaign_builder.build_smart_campaign(campaign_request)
        
        if not campaign_result['success']:
            return jsonify(campaign_result), 400
        
        # Add unique request ID
        request_id = str(uuid.uuid4())
        campaign_result['request_id'] = request_id
        
        return jsonify(campaign_result), 200
        
    except Exception as e:
        logger.error(f"Error building campaign: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while building campaign'
        }), 500

@ai_campaign_flow_bp.route('/create-campaign', methods=['POST'])
def create_campaign():
    """Create a new campaign using campaign_types"""
    try:
        data = request.get_json()
        
        required_fields = ['campaign_type', 'customer_id', 'campaign_name', 'budget']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': 'Missing required data',
                'message': f'Required fields: {", ".join(missing_fields)}'
            }), 400
        
        campaign_type = data['campaign_type'].upper()
        customer_id = data['customer_id']
        campaign_name = data['campaign_name']
        budget = float(data['budget'])
        
        logger.info(f"Creating campaign: {campaign_type} - Customer: {customer_id}")
        
        from campaign_types import create_campaign_instance, get_campaign_creator
        from google_ads_lib.client import GoogleAdsClient
        from google_ads_lib.config import load_from_env
        
        creator_class = get_campaign_creator(campaign_type)
        
        if not creator_class:
            return jsonify({
                'success': False,
                'error': f'Campaign type {campaign_type} not supported',
                'message': 'Campaign type not found in system'
            }), 404
        
        try:
            # Use load_from_storage to read from google_ads.yaml which includes use_proto_plus
            import os
            yaml_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'services', 'google_ads.yaml')
            google_ads_client = GoogleAdsClient.load_from_storage(yaml_path)
            logger.info("✅ Google Ads Client loaded successfully from google_ads.yaml")
        except Exception as e:
            logger.error(f"Error loading Google Ads Client: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to connect to Google Ads API',
                'message': str(e)
            }), 500
        
        creator_instance = create_campaign_instance(campaign_type, google_ads_client, customer_id)
        
        if not creator_instance:
            return jsonify({
                'success': False,
                'error': 'Failed to create campaign creator',
                'message': 'System initialization error'
            }), 500
        
        campaign_data = {
            'campaign_name': campaign_name,
            'budget_amount': budget,
            'website_url': data.get('website_url', ''),
            'product_service': data.get('product_service', ''),
            'target_locations': data.get('target_locations', []),
            'target_languages': data.get('target_languages', ['ar']),  # Arabic by default
            'keywords': data.get('keywords', []),
            'headlines': data.get('headlines', []),
            'descriptions': data.get('descriptions', [])
        }
        
        result = None
        if campaign_type == 'SEARCH':
            result = creator_instance.create_search_campaign(**campaign_data)
        elif campaign_type == 'DISPLAY':
            result = creator_instance.create_display_campaign(**campaign_data)
        elif campaign_type == 'SHOPPING':
            result = creator_instance.create_shopping_campaign(**campaign_data)
        elif campaign_type == 'VIDEO':
            result = creator_instance.create_video_campaign(**campaign_data)
        elif campaign_type == 'PERFORMANCE_MAX':
            result = creator_instance.create_performance_max_campaign(**campaign_data)
        elif campaign_type == 'DEMAND_GEN':
            result = creator_instance.create_demand_gen_campaign(**campaign_data)
        elif campaign_type == 'APP':
            result = creator_instance.create_app_campaign(**campaign_data)
        else:
            return jsonify({
                'success': False,
                'error': f'Campaign type {campaign_type} not supported',
                'message': 'Unknown campaign type'
            }), 400
        
        if result and result.get('success'):
            logger.info(f"Campaign {campaign_type} created successfully")
            return jsonify({
                'success': True,
                'campaign_type': campaign_type,
                'campaign_data': result,
                'message': 'Campaign created successfully'
            }), 201
        else:
            logger.error(f"Failed to create campaign {campaign_type}")
            return jsonify({
                'success': False,
                'error': result.get('error', 'Unknown error') if result else 'Failed to create campaign',
                'message': 'Error creating campaign'
            }), 500
        
    except Exception as e:
        logger.error(f"Error creating campaign: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error creating campaign'
        }), 500

@ai_campaign_flow_bp.route('/generate-campaign-content', methods=['POST'])
def generate_campaign_content():
    """Generate complete campaign content (headlines, descriptions, keywords, images)"""
    try:
        data = request.get_json()
        
        if not data or 'website_url' not in data or 'campaign_type' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required data',
                'message': 'Please provide website URL and campaign type'
            }), 400
        
        website_url = data['website_url']
        campaign_type = data['campaign_type'].upper()
        product_service = data.get('product_service', '')
        budget = data.get('budget', 0)
        
        logger.info(f"🎨 Generating campaign content: {campaign_type} - {website_url}")
        
        content_result = None
        generation_method = 'ai'
        
        # Use AI Content Generator (already exists)
        try:
            from services.ai_content_generator import AIContentGenerator
            ai_generator = AIContentGenerator()
            
            logger.info("Generating content with AI...")
            content_result = ai_generator.generate_complete_ad_content(
                product_service=product_service if product_service else website_url,
                website_url=website_url,
                campaign_type=campaign_type
            )
            
            if content_result and content_result.get('success'):
                logger.info("✅ AI content generation successful")
                generation_method = 'ai'
            else:
                logger.error("❌ AI generation returned no results - cannot proceed")
                return jsonify({
                    'success': False,
                    'error': 'AI content generation failed',
                    'message': 'Failed to generate ad content. Please check website URL and AI API configuration.'
                }), 500
                
        except Exception as ai_error:
            logger.error(f"❌ AI content generation failed: {str(ai_error)}")
            import traceback
            logger.error(traceback.format_exc())
            # Return error - NO FAKE DATA!
            return jsonify({
                'success': False,
                'error': f'AI content generation error: {str(ai_error)}',
                'message': 'Failed to generate campaign content. Please try again or contact support.'
            }), 500
        
        if not content_result or not content_result.get('success'):
            return jsonify({
                'success': False,
                'error': 'Failed to generate content',
                'message': 'All content generation methods failed'
            }), 500
        
        # Get campaign requirements
        try:
            from campaign_types import get_campaign_requirements
            requirements = get_campaign_requirements(campaign_type)
        except:
            requirements = {}
        
        # Prepare response
        campaign_content = {
            'success': True,
            'campaign_type': campaign_type,
            'requirements': requirements,
            'content': {
                'headlines': content_result.get('headlines', []),
                'descriptions': content_result.get('descriptions', []),
                'keywords': content_result.get('keywords', []),
                'long_headline': content_result.get('long_headline', ''),
                'business_name': content_result.get('business_name', ''),
                'call_to_action': content_result.get('call_to_action', 'Learn More')
            },
            'website_analysis': {
                'website_content': content_result.get('website_content', ''),
                'brand_colors': content_result.get('colors', {}),
                'brand_style': content_result.get('brand_style', '')
            },
            'generation_method': generation_method,
            'timestamp': datetime.now().isoformat(),
            'message': f'Campaign content generated successfully ({generation_method})'
        }
        
        logger.info(f"✅ Content generated: {len(campaign_content['content']['headlines'])} headlines, "
                   f"{len(campaign_content['content']['descriptions'])} descriptions, "
                   f"{len(campaign_content['content']['keywords'])} keywords")
        
        return jsonify(campaign_content), 200
        
    except Exception as e:
        logger.error(f"❌ Error generating campaign content: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error generating campaign content'
        }), 500

@ai_campaign_flow_bp.route('/generate-ad-copies', methods=['POST'])
def generate_ad_copies():
    """Generate ad copies with AI"""
    try:
        data = request.get_json()
        
        if not data or 'campaign_info' not in data:
            return jsonify({
                'success': False,
                'error': 'Campaign info required',
                'message': 'Please provide campaign information'
            }), 400
        
        campaign_info = data['campaign_info']
        ad_type = data.get('ad_type', 'search')  # search, display, video, shopping
        
        logger.info(f"Ad copy generation request - Ad type: {ad_type}")
        
        # Generate ad copies using AI Processor (lazy initialization)
        processor = get_ai_processor()
        ad_copies_result = processor.generate_ad_copy(campaign_info)
        
        if not ad_copies_result:
            return jsonify({
                'success': False,
                'error': 'Failed to generate ad copies',
                'message': 'Could not generate ad copies'
            }), 400
        
        # Customize copies based on ad type
        customized_copies = _customize_ad_copies_for_type(ad_copies_result, ad_type)
        
        # Add unique request ID
        request_id = str(uuid.uuid4())
        
        return jsonify({
            'success': True,
            'ad_copies': customized_copies,
            'ad_type': ad_type,
            'request_id': request_id,
            'timestamp': datetime.now().isoformat(),
            'message': 'Ad copies generated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating ad copies: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while generating ad copies'
        }), 500

@ai_campaign_flow_bp.route('/optimize-campaign', methods=['POST'])
def optimize_campaign():
    """Optimize existing campaign with AI"""
    try:
        data = request.get_json()
        
        if not data or 'campaign_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Campaign ID required',
                'message': 'Please provide campaign ID'
            }), 400
        
        campaign_id = data['campaign_id']
        performance_data = data.get('performance_data', {})
        
        logger.info(f"Campaign optimization request: {campaign_id}")
        
        # Optimize campaign using Campaign Builder
        optimization_result = campaign_builder.optimize_existing_campaign(campaign_id, performance_data)
        
        if not optimization_result['success']:
            return jsonify(optimization_result), 400
        
        # Add unique request ID
        request_id = str(uuid.uuid4())
        optimization_result['request_id'] = request_id
        
        return jsonify(optimization_result), 200
        
    except Exception as e:
        logger.error(f"Error optimizing campaign: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while optimizing campaign'
        }), 500

@ai_campaign_flow_bp.route('/get-campaign-types', methods=['GET'])
def get_campaign_types():
    """Get all supported campaign types from backend/campaign_types"""
    try:
        logger.info("Fetching campaign types")
        
        from campaign_types import CAMPAIGN_TYPES, CAMPAIGN_TYPE_NAMES
        
        campaign_types_list = []
        seen_classes = set()
        
        for campaign_type_key, campaign_class in CAMPAIGN_TYPES.items():
            if campaign_class in seen_classes:
                continue
            
            seen_classes.add(campaign_class)
            
            campaign_types_list.append({
                'id': campaign_type_key,
                'name': CAMPAIGN_TYPE_NAMES.get(campaign_type_key, campaign_type_key),
                'name_en': campaign_type_key.replace('_', ' ').title(),
                'type': campaign_type_key
            })
        
        return jsonify({
            'success': True,
            'campaign_types': campaign_types_list,
            'total': len(campaign_types_list),
            'message': 'Campaign types fetched successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching campaign types: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error fetching campaign types'
        }), 500

@ai_campaign_flow_bp.route('/get-campaign-type-info/<campaign_type>', methods=['GET'])
def get_campaign_type_info(campaign_type):
    """Get information about a specific campaign type from backend/campaign_types"""
    try:
        logger.info(f"Fetching campaign type info: {campaign_type}")
        
        from campaign_types import get_campaign_creator, get_campaign_requirements, CAMPAIGN_TYPE_NAMES
        
        campaign_type_upper = campaign_type.upper()
        
        creator_class = get_campaign_creator(campaign_type_upper)
        
        if not creator_class:
            return jsonify({
                'success': False,
                'error': f'Campaign type {campaign_type} not found',
                'message': 'Campaign type not supported'
            }), 404
        
        requirements = get_campaign_requirements(campaign_type_upper)
        
        return jsonify({
            'success': True,
            'campaign_type': campaign_type_upper,
            'name': CAMPAIGN_TYPE_NAMES.get(campaign_type_upper, campaign_type_upper),
            'name_en': campaign_type_upper.replace('_', ' ').title(),
            'requirements': requirements,
            'message': 'Campaign info fetched successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching campaign type info: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error fetching campaign type info'
        }), 500

@ai_campaign_flow_bp.route('/validate-campaign-data', methods=['POST'])
def validate_campaign_data():
    """Validate campaign data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Campaign data required',
                'message': 'Please provide campaign data'
            }), 400
        
        # Validate data
        validation_result = _validate_campaign_data(data)
        
        return jsonify(validation_result), 200
        
    except Exception as e:
        logger.error(f"Error validating campaign data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while validating campaign data'
        }), 500

@ai_campaign_flow_bp.route('/estimate-campaign-performance', methods=['POST'])
def estimate_campaign_performance():
    """Estimate expected campaign performance"""
    try:
        data = request.get_json()
        
        if not data or 'campaign_data' not in data:
            return jsonify({
                'success': False,
                'error': 'Campaign data required',
                'message': 'Please provide campaign data'
            }), 400
        
        campaign_data = data['campaign_data']
        
        logger.info("Campaign performance estimation request")
        
        # Estimate performance
        performance_estimate = _estimate_campaign_performance(campaign_data)
        
        return jsonify({
            'success': True,
            'performance_estimate': performance_estimate,
            'timestamp': datetime.now().isoformat(),
            'message': 'Campaign performance estimated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error estimating campaign performance: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while estimating campaign performance'
        }), 500

@ai_campaign_flow_bp.route('/get-keyword-cpc-data', methods=['POST'])
def get_keyword_cpc_data():
    """Get real CPC data from Google Keyword Planner based on website analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request data required',
                'message': 'Please provide request data'
            }), 400
        
        website_url = data.get('website_url')
        customer_id = data.get('customer_id', os.getenv('GOOGLE_ADS_CUSTOMER_ID', ''))
        campaign_type = data.get('campaign_type', 'SEARCH')
        daily_budget = data.get('daily_budget', 15)
        location_ids = data.get('location_ids', [])  # From user selection
        language_id = data.get('language_id', '1019')  # Arabic by default
        
        logger.info(f"Keyword CPC data request for: {website_url}")
        
        # Extract keywords from website analysis if available
        keywords = data.get('keywords', [])
        if not keywords and website_url:
            # Try to extract keywords from website
            try:
                analysis_result = website_analyzer.analyze_website(website_url)
                if analysis_result.get('success') and analysis_result.get('analysis', {}).get('keywords_suggestions'):
                    keywords = analysis_result['analysis']['keywords_suggestions'][:10]  # Top 10 keywords
                    logger.info(f"Extracted {len(keywords)} keywords from website analysis")
            except Exception as e:
                logger.warning(f"Could not extract keywords from website: {str(e)}")
        
        # If still no keywords, extract from website content directly (same as ai_content_generator.py)
        if not keywords:
            logger.warning("⚠️ No keywords provided - extracting from website content...")
            try:
                import requests
                from bs4 import BeautifulSoup
                import re
                from collections import Counter
                
                # Add protocol if missing
                if not website_url.startswith(('http://', 'https://')):
                    website_url = 'https://' + website_url
                
                response = requests.get(website_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract all text
                website_content = soup.get_text(separator=' ', strip=True)
                
                # استخراج الكلمات العربية الطويلة (أكثر من 3 أحرف) - same as ai_content_generator
                arabic_words = re.findall(r'[\u0600-\u06FF]{4,}', website_content)
                
                # أخذ أكثر 20 كلمات تكراراً
                word_counts = Counter(arabic_words)
                keywords = [word for word, count in word_counts.most_common(20)]
                
                if keywords:
                    logger.info(f"✅ Extracted {len(keywords)} keywords from website content: {keywords[:5]}")
                else:
                    logger.warning("⚠️ No Arabic keywords found, using default fallback")
                    keywords = ["منتجات", "خدمات", "عروض", "جودة", "أسعار"]
                
            except Exception as e:
                logger.error(f"Failed to extract keywords from website: {str(e)}")
                # Use default fallback keywords
                keywords = ["منتجات", "خدمات", "عروض", "جودة", "أسعار"]
                logger.warning(f"⚠️ Using default fallback keywords: {keywords}")
        
        # Get keyword ideas and CPC from Google Keyword Planner
        try:
            from services.keyword_planner_service import KeywordPlannerService
            keyword_planner = KeywordPlannerService()
            
            if not keyword_planner.is_initialized:
                logger.error("Keyword Planner not initialized - Google Ads API required")
                return jsonify({
                    'success': False,
                    'error': 'Keyword Planner not initialized',
                    'message': 'Google Ads API is not configured. Please check GOOGLE_ADS_CUSTOMER_ID and credentials.'
                }), 500
            
            # Prepare keyword planner request
            keyword_plan_request = {
                'keyword_texts': keywords,
                'page_url': website_url if website_url else None,
                'site_url': website_url if website_url else None,
                'geo_target_ids': location_ids,
                'language_id': language_id,
                'include_historical_metrics': True
            }
            
            # Get real keyword ideas from Google
            logger.info(f"Calling Google Keyword Planner with customer_id={customer_id}, keywords={keywords[:3] if len(keywords) > 3 else keywords}")
            keyword_ideas_result = keyword_planner.generate_keyword_ideas(
                customer_id=customer_id,
                keyword_plan_request=keyword_plan_request
            )
            
            # Detailed logging for debugging
            logger.info(f"Keyword Planner result: success={keyword_ideas_result.get('success')}, keywords_count={len(keyword_ideas_result.get('keywords', []))}")
            if not keyword_ideas_result.get('success'):
                logger.error(f"Keyword Planner failed: {keyword_ideas_result.get('error', 'Unknown error')}")
            if keyword_ideas_result.get('keywords'):
                logger.info(f"Sample keywords: {keyword_ideas_result['keywords'][:2]}")
            
            if keyword_ideas_result.get('success') and keyword_ideas_result.get('keywords'):
                keyword_data = keyword_ideas_result['keywords']
                
                # Calculate average CPC from real data
                total_cpc = 0
                cpc_count = 0
                
                for kw in keyword_data:
                    # Google returns CPC in micros (1 million = 1 currency unit)
                    low_bid = kw.get('low_top_of_page_bid_micros', 0)
                    high_bid = kw.get('high_top_of_page_bid_micros', 0)
                    
                    if low_bid > 0 and high_bid > 0:
                        avg_bid = (low_bid + high_bid) / 2 / 1_000_000  # Convert to currency
                        total_cpc += avg_bid
                        cpc_count += 1
                
                avg_cpc = round(total_cpc / cpc_count, 2) if cpc_count > 0 else _estimate_cpc_by_campaign_type(campaign_type, daily_budget)
                
                # Calculate estimates based on real CPC
                estimated_clicks = int(daily_budget / avg_cpc) if avg_cpc > 0 else 0
                
                # Impressions vary by campaign type
                impression_multiplier = {
                    'SEARCH': 30,
                    'DISPLAY': 100,
                    'SHOPPING': 40,
                    'VIDEO': 200,
                    'PERFORMANCE_MAX': 50,
                    'APP': 80,
                    'DEMAND_GEN': 60
                }.get(campaign_type, 50)
                
                estimated_impressions = estimated_clicks * impression_multiplier
                
                logger.info(f"Real CPC data retrieved: avg_cpc=${avg_cpc}, clicks={estimated_clicks}, impressions={estimated_impressions}")
                
                return jsonify({
                    'success': True,
                    'data_source': 'google_keyword_planner',
                    'average_cpc': avg_cpc,
                    'estimated_clicks': estimated_clicks,
                    'estimated_impressions': estimated_impressions,
                    'keywords': keywords,
                    'keyword_data': keyword_data[:10],  # Return top 10 keywords
                    'total_keywords_found': len(keyword_data),
                    'message': 'Real CPC data from Google Keyword Planner'
                }), 200
            else:
                # Return error - NO FAKE DATA!
                error_details = keyword_ideas_result.get('error', 'Unknown error')
                logger.error(f"No keyword data from Google - cannot proceed. Error: {error_details}")
                logger.error(f"Full result: {keyword_ideas_result}")
                return jsonify({
                    'success': False,
                    'error': 'No keyword data from Google',
                    'error_details': error_details,
                    'message': f'Google Keyword Planner returned no data. Error: {error_details}'
                }), 400
                
        except Exception as kp_error:
            logger.error(f"Keyword Planner error: {str(kp_error)}")
            # Return error - NO FAKE DATA!
            return jsonify({
                'success': False,
                'error': f'Keyword Planner error: {str(kp_error)}',
                'message': 'Failed to get data from Google Keyword Planner. Please check configuration.'
            }), 500
        
    except Exception as e:
        logger.error(f"Error getting keyword CPC data: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while getting keyword CPC data'
        }), 500

def _estimate_cpc_by_campaign_type(campaign_type: str, daily_budget: float) -> float:
    """Estimate CPC based on campaign type and budget"""
    # Base CPC estimates by campaign type
    base_cpc = {
        'SEARCH': 1.5,
        'DISPLAY': 0.5,
        'SHOPPING': 1.2,
        'VIDEO': 0.3,
        'PERFORMANCE_MAX': 1.8,
        'APP': 0.8,
        'DEMAND_GEN': 1.0
    }
    
    # Adjust based on budget (higher budget = higher CPC targeting)
    cpc = base_cpc.get(campaign_type, 1.0)
    
    if daily_budget > 50:
        cpc *= 1.2
    elif daily_budget > 100:
        cpc *= 1.5
    
    return round(cpc, 2)

# ===== Helper Functions =====

def _customize_ad_copies_for_type(ad_copies: Dict[str, Any], ad_type: str) -> Dict[str, Any]:
    """Customize ad copies based on ad type"""
    customized = ad_copies.copy()
    
    if ad_type == 'search':
        # Add additional headlines for search
        if 'headlines' in customized:
            customized['headlines'].extend([
                'Get the Best Prices',
                '24/7 Customer Service',
                'Quality Guaranteed'
            ])
    elif ad_type == 'display':
        # Customize for display
        if 'descriptions' in customized:
            customized['descriptions'] = [
                desc + ' - Discover more now!' for desc in customized['descriptions']
            ]
    elif ad_type == 'video':
        # Customize for video
        customized['video_scripts'] = [
            'Discover our new product',
            'See how we work',
            'Join thousands of satisfied customers'
        ]
    elif ad_type == 'shopping':
        # Customize for shopping
        customized['product_highlights'] = [
            'Free Shipping',
            'Quality Guaranteed',
            'Competitive Prices'
        ]
    
    return customized

def _validate_campaign_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate campaign data"""
    errors = []
    warnings = []
    
    # Check required fields
    required_fields = {
        'website_url': 'Website URL',
        'campaign_type': 'Campaign Type',
        'budget': 'Budget'
    }
    
    for field, field_name in required_fields.items():
        if not data.get(field):
            errors.append(f'{field_name} is required')
    
    # Validate budget
    if data.get('budget'):
        try:
            budget = float(data['budget'])
            if budget < 50:
                warnings.append('Budget is very low (less than $50)')
            elif budget > 10000:
                warnings.append('Budget is very high (more than $10,000)')
        except ValueError:
            errors.append('Budget must be a valid number')
    
    # Validate campaign type
    valid_campaign_types = ['SEARCH', 'DISPLAY', 'SHOPPING', 'VIDEO', 'APP', 'PERFORMANCE_MAX', 'CALL_ADS']
    if data.get('campaign_type') and data['campaign_type'] not in valid_campaign_types:
        errors.append(f'Invalid campaign type. Supported types: {", ".join(valid_campaign_types)}')
    
    # Validate website URL
    if data.get('website_url'):
        website_url = data['website_url']
        if not website_url.startswith(('http://', 'https://')):
            warnings.append('Website URL should start with http:// or https://')
    
    return {
        'success': len(errors) == 0,
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'message': 'Data validated successfully' if len(errors) == 0 else 'Data contains errors'
    }

def _estimate_campaign_performance(campaign_data: Dict[str, Any]) -> Dict[str, Any]:
    """Estimate expected campaign performance"""
    campaign_type = campaign_data.get('campaign_type', 'SEARCH')
    budget = float(campaign_data.get('budget', 1000))
    
    # Base estimates by campaign type
    performance_estimates = {
        'SEARCH': {
            'estimated_clicks': int(budget * 0.8),  # 0.8 clicks per dollar
            'estimated_impressions': int(budget * 15),  # 15 impressions per dollar
            'estimated_ctr': 2.5,  # 2.5%
            'estimated_cpc': 1.25,  # $1.25
            'estimated_conversions': int(budget * 0.05)  # 5% conversion rate
        },
        'DISPLAY': {
            'estimated_clicks': int(budget * 0.3),
            'estimated_impressions': int(budget * 50),
            'estimated_ctr': 0.6,
            'estimated_cpc': 3.33,
            'estimated_conversions': int(budget * 0.02)
        },
        'SHOPPING': {
            'estimated_clicks': int(budget * 0.6),
            'estimated_impressions': int(budget * 20),
            'estimated_ctr': 3.0,
            'estimated_cpc': 1.67,
            'estimated_conversions': int(budget * 0.08)
        },
        'VIDEO': {
            'estimated_clicks': int(budget * 0.1),
            'estimated_impressions': int(budget * 100),
            'estimated_ctr': 0.1,
            'estimated_cpc': 10.0,
            'estimated_conversions': int(budget * 0.01)
        },
        'PERFORMANCE_MAX': {
            'estimated_clicks': int(budget * 0.7),
            'estimated_impressions': int(budget * 25),
            'estimated_ctr': 2.8,
            'estimated_cpc': 1.43,
            'estimated_conversions': int(budget * 0.06)
        },
        'CALL_ADS': {
            'estimated_clicks': int(budget * 0.4),
            'estimated_impressions': int(budget * 12),
            'estimated_ctr': 3.33,
            'estimated_cpc': 2.5,
            'estimated_conversions': int(budget * 0.15)
        }
    }
    
    base_estimate = performance_estimates.get(campaign_type, performance_estimates['SEARCH'])
    
    # Adjust estimates based on budget
    if budget < 500:
        # Low budget - reduce estimates
        for key in base_estimate:
            if key != 'estimated_ctr' and key != 'estimated_cpc':
                base_estimate[key] = int(base_estimate[key] * 0.8)
    elif budget > 2000:
        # High budget - increase estimates
        for key in base_estimate:
            if key != 'estimated_ctr' and key != 'estimated_cpc':
                base_estimate[key] = int(base_estimate[key] * 1.2)
    
    return {
        'campaign_type': campaign_type,
        'budget': budget,
        'estimates': base_estimate,
        'confidence_level': 'medium',
        'notes': [
            'These are approximate estimates based on industry averages',
            'Actual performance may vary based on multiple factors',
            'It is recommended to monitor performance and adjust budget based on results'
        ]
    }

@ai_campaign_flow_bp.route('/launch-campaign', methods=['POST'])
def launch_campaign():
    """Save campaign to database and launch on Google Ads"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Campaign data required',
                'message': 'Please provide complete campaign data'
            }), 400
        
        # Extract campaign data
        campaign_name = data.get('campaign_name', f"Campaign {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        campaign_type = data.get('campaign_type', 'SEARCH')
        website_url = data.get('website_url', '')
        daily_budget = float(data.get('daily_budget', 15))
        currency = data.get('currency', 'USD')
        target_locations = data.get('target_locations', [])
        target_languages = data.get('target_languages', ['ar'])  # Arabic by default
        customer_id = data.get('customer_id', os.getenv('GOOGLE_ADS_CUSTOMER_ID', ''))
        user_id = data.get('user_id', 'test_user')
        
        # Additional data
        phone_number = data.get('phone_number')
        website_analysis = data.get('website_analysis')
        cpc_data = data.get('cpc_data')
        generated_content = data.get('generated_content')
        
        # Log received data
        logger.info(f"📥 Received generated_content: {generated_content is not None}")
        if generated_content:
            logger.info(f"   - Headlines: {len(generated_content.get('headlines', []))}")
            logger.info(f"   - Descriptions: {len(generated_content.get('descriptions', []))}")
            logger.info(f"   - Keywords: {len(generated_content.get('keywords', []))}")
        else:
            logger.warning("⚠️ No generated_content in request!")
        
        # Convert target_locations to Google Ads location IDs
        location_ids = convert_locations_to_ids(target_locations)
        
        logger.info(f"Campaign launch request: {campaign_name} - Type: {campaign_type} - Budget: {daily_budget}")
        logger.info(f"Target locations: {len(target_locations)} -> Location IDs: {location_ids}")
        
        # 1. Save to database first
        campaign_id = str(uuid.uuid4())
        try:
            from utils.database import DatabaseManager
            db = DatabaseManager()
            
            if db.is_connected:
                campaign_db_data = {
                    'id': campaign_id,
                    'user_id': user_id,
                    'name': campaign_name,
                    'campaign_type': campaign_type,
                    'status': 'ACTIVE',
                    'website_url': website_url,
                    'daily_budget': daily_budget,
                    'currency': currency,
                    'target_locations': target_locations,
                    'target_languages': target_languages,
                    'phone_number': phone_number,
                    'website_analysis': website_analysis,
                    'cpc_data': cpc_data,
                    'generated_content': generated_content,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }
                
                # Insert into campaigns table
                client = db.get_admin_client()
                if client:
                    result = client.from_('campaigns').insert(campaign_db_data).execute()
                    logger.info(f"Campaign saved to database: {campaign_id}")
                else:
                    logger.warning("Database client not available, skipping DB save")
            else:
                logger.warning("Database not connected, skipping DB save")
        except Exception as db_error:
            logger.error(f"Database error (non-fatal): {str(db_error)}")
            # Continue even if DB save fails
        
        # 2. Create campaign on Google Ads if customer_id available
        google_campaign_id = None
        google_campaign_created = False
        
        if customer_id and customer_id.strip():
            try:
                from campaign_types import create_campaign_instance, get_campaign_creator
                from google_ads_lib.client import GoogleAdsClient
                
                logger.info(f"Creating Google Ads campaign for customer: {customer_id}")
                
                # Load Google Ads client from google_ads.yaml
                try:
                    yaml_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'services', 'google_ads.yaml')
                    google_ads_client = GoogleAdsClient.load_from_storage(yaml_path)
                    logger.info("✅ Google Ads Client loaded successfully from google_ads.yaml")
                except Exception as client_error:
                    logger.error(f"Failed to load Google Ads client: {str(client_error)}")
                    google_ads_client = None
                
                if google_ads_client:
                    # Get campaign creator
                    creator_instance = create_campaign_instance(campaign_type, google_ads_client, customer_id)
                    
                    if creator_instance:
                        # Prepare campaign data for Google Ads
                        google_campaign_data = {
                            'campaign_name': campaign_name,
                            'budget_amount': daily_budget,
                            'website_url': website_url,
                            'target_locations': location_ids,  # Use converted location IDs
                            'target_languages': target_languages,
                            'keywords': generated_content.get('keywords', []) if generated_content else [],
                            'headlines': generated_content.get('headlines', []) if generated_content else [],
                            'descriptions': generated_content.get('descriptions', []) if generated_content else []
                        }
                        
                        # Create campaign based on type
                        result = None
                        if campaign_type == 'SEARCH':
                            result = creator_instance.create_search_campaign(**google_campaign_data)
                        elif campaign_type == 'DISPLAY':
                            result = creator_instance.create_display_campaign(**google_campaign_data)
                        elif campaign_type == 'SHOPPING':
                            result = creator_instance.create_shopping_campaign(**google_campaign_data)
                        elif campaign_type == 'VIDEO':
                            result = creator_instance.create_video_campaign(**google_campaign_data)
                        elif campaign_type == 'PERFORMANCE_MAX':
                            result = creator_instance.create_performance_max_campaign(**google_campaign_data)
                        elif campaign_type == 'DEMAND_GEN':
                            result = creator_instance.create_demand_gen_campaign(**google_campaign_data)
                        elif campaign_type == 'APP':
                            result = creator_instance.create_app_campaign(**google_campaign_data)
                        
                        if result and result.get('success'):
                            google_campaign_id = result.get('campaign_id')
                            google_campaign_created = True
                            logger.info(f"Google Ads campaign created: {google_campaign_id}")
                            
                            # Update database with Google campaign ID
                            try:
                                if db.is_connected:
                                    client = db.get_admin_client()
                                    if client:
                                        client.from_('campaigns').update({
                                            'google_campaign_id': google_campaign_id,
                                            'google_campaign_data': result,
                                            'updated_at': datetime.now().isoformat()
                                        }).eq('id', campaign_id).execute()
                                        logger.info(f"Campaign updated with Google ID: {google_campaign_id}")
                            except Exception as update_error:
                                logger.error(f"Failed to update campaign with Google ID: {str(update_error)}")
                        else:
                            logger.warning(f"Failed to create Google Ads campaign: {result}")
                    else:
                        logger.warning(f"Could not create campaign creator for type: {campaign_type}")
                else:
                    logger.warning("Google Ads client not available")
                    
            except Exception as google_error:
                logger.error(f"Google Ads creation error: {str(google_error)}")
                import traceback
                logger.error(traceback.format_exc())
        else:
            logger.info("No customer_id provided, campaign saved to DB only")
        
        # 3. Prepare response
        response_data = {
            'success': True,
            'campaign_id': campaign_id,
            'campaign_name': campaign_name,
            'campaign_type': campaign_type,
            'status': 'ACTIVE',
            'google_campaign_created': google_campaign_created,
            'google_campaign_id': google_campaign_id,
            'daily_budget': daily_budget,
            'currency': currency,
            'target_locations': target_locations,
            'website_url': website_url,
            'phone_number': phone_number,
            'estimated_performance': {
                'impressions': cpc_data.get('estimated_impressions', 0) if cpc_data else 0,
                'clicks': cpc_data.get('estimated_clicks', 0) if cpc_data else 0,
                'average_cpc': cpc_data.get('average_cpc', 0) if cpc_data else 0
            },
            'generated_content': generated_content,
            'adCreative': {
                'headlines': generated_content.get('headlines', []) if generated_content else [],
                'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                'keywords': generated_content.get('keywords', []) if generated_content else (cpc_data.get('keywords', []) if cpc_data else []),
                'phoneNumber': phone_number
            },
            'created_at': datetime.now().isoformat(),
            'message': 'Campaign launched successfully' if google_campaign_created else 'Campaign saved successfully (Google Ads creation pending)'
        }
        
        logger.info(f"Campaign launch completed: {campaign_id}")
        logger.info(f"📤 Response includes:")
        logger.info(f"   - Generated Content: {len(generated_content.get('headlines', [])) if generated_content else 0} headlines, {len(generated_content.get('descriptions', [])) if generated_content else 0} descriptions")
        logger.info(f"   - Ad Creative: {len(response_data['adCreative']['headlines'])} headlines, {len(response_data['adCreative']['descriptions'])} descriptions, {len(response_data['adCreative']['keywords'])} keywords")
        
        return jsonify(response_data), 201
        
    except Exception as e:
        logger.error(f"Error launching campaign: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while launching campaign'
        }), 500

# Register Blueprint
def register_ai_campaign_flow_routes(app):
    """Register AI campaign flow routes"""
    app.register_blueprint(ai_campaign_flow_bp)
    logger.info("AI campaign flow routes registered successfully")
