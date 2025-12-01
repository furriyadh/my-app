
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مسارات إنشاء الحملات الإعلانية بالذكاء الاصطناعي
AI Campaign Creator Routes
"""

from flask import Blueprint, request, jsonify
import logging
from typing import Dict, Any
from datetime import datetime
import os
import sys

# إضافة مسار backend إلى sys.path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_path)

from services.ai_content_generator import AIContentGenerator
from services.image_generation_service import ImageGenerationService

# Currency conversion rates and country mappings
COUNTRY_TO_CURRENCY = {
    # Middle East & North Africa
    'SA': {'currency': 'SAR', 'symbol': 'ر.س', 'to_usd': 3.75, 'name': 'Saudi Riyal'},
    'AE': {'currency': 'AED', 'symbol': 'د.إ', 'to_usd': 3.67, 'name': 'UAE Dirham'},
    'KW': {'currency': 'KWD', 'symbol': 'د.ك', 'to_usd': 0.31, 'name': 'Kuwaiti Dinar'},
    'QA': {'currency': 'QAR', 'symbol': 'ر.ق', 'to_usd': 3.64, 'name': 'Qatari Riyal'},
    'BH': {'currency': 'BHD', 'symbol': 'د.ب', 'to_usd': 0.38, 'name': 'Bahraini Dinar'},
    'OM': {'currency': 'OMR', 'symbol': 'ر.ع', 'to_usd': 0.38, 'name': 'Omani Rial'},
    'JO': {'currency': 'JOD', 'symbol': 'د.أ', 'to_usd': 0.71, 'name': 'Jordanian Dinar'},
    'LB': {'currency': 'LBP', 'symbol': 'ل.ل', 'to_usd': 89500, 'name': 'Lebanese Pound'},
    'EG': {'currency': 'EGP', 'symbol': 'ج.م', 'to_usd': 30.9, 'name': 'Egyptian Pound'},
    'IQ': {'currency': 'IQD', 'symbol': 'د.ع', 'to_usd': 1310, 'name': 'Iraqi Dinar'},
    'YE': {'currency': 'YER', 'symbol': 'ر.ي', 'to_usd': 250, 'name': 'Yemeni Rial'},
    'SY': {'currency': 'SYP', 'symbol': 'ل.س', 'to_usd': 2512, 'name': 'Syrian Pound'},
    'MA': {'currency': 'MAD', 'symbol': 'د.م', 'to_usd': 10.1, 'name': 'Moroccan Dirham'},
    'TN': {'currency': 'TND', 'symbol': 'د.ت', 'to_usd': 3.1, 'name': 'Tunisian Dinar'},
    'DZ': {'currency': 'DZD', 'symbol': 'د.ج', 'to_usd': 134, 'name': 'Algerian Dinar'},
    'LY': {'currency': 'LYD', 'symbol': 'د.ل', 'to_usd': 4.8, 'name': 'Libyan Dinar'},
    'SD': {'currency': 'SDG', 'symbol': 'ج.س', 'to_usd': 601, 'name': 'Sudanese Pound'},
    
    # Europe
    'GB': {'currency': 'GBP', 'symbol': '£', 'to_usd': 0.79, 'name': 'British Pound'},
    'EU': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'DE': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'FR': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'IT': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'ES': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'NL': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'BE': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'AT': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'PT': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'GR': {'currency': 'EUR', 'symbol': '€', 'to_usd': 0.92, 'name': 'Euro'},
    'CH': {'currency': 'CHF', 'symbol': 'CHF', 'to_usd': 0.88, 'name': 'Swiss Franc'},
    'SE': {'currency': 'SEK', 'symbol': 'kr', 'to_usd': 10.5, 'name': 'Swedish Krona'},
    'NO': {'currency': 'NOK', 'symbol': 'kr', 'to_usd': 10.8, 'name': 'Norwegian Krone'},
    'DK': {'currency': 'DKK', 'symbol': 'kr', 'to_usd': 6.9, 'name': 'Danish Krone'},
    'PL': {'currency': 'PLN', 'symbol': 'zł', 'to_usd': 4.0, 'name': 'Polish Zloty'},
    'CZ': {'currency': 'CZK', 'symbol': 'Kč', 'to_usd': 23.1, 'name': 'Czech Koruna'},
    'RO': {'currency': 'RON', 'symbol': 'lei', 'to_usd': 4.6, 'name': 'Romanian Leu'},
    'HU': {'currency': 'HUF', 'symbol': 'Ft', 'to_usd': 355, 'name': 'Hungarian Forint'},
    'RU': {'currency': 'RUB', 'symbol': '₽', 'to_usd': 92, 'name': 'Russian Ruble'},
    'TR': {'currency': 'TRY', 'symbol': '₺', 'to_usd': 32, 'name': 'Turkish Lira'},
    'UA': {'currency': 'UAH', 'symbol': '₴', 'to_usd': 37, 'name': 'Ukrainian Hryvnia'},
    
    # Americas
    'US': {'currency': 'USD', 'symbol': '$', 'to_usd': 1.0, 'name': 'US Dollar'},
    'CA': {'currency': 'CAD', 'symbol': 'C$', 'to_usd': 1.36, 'name': 'Canadian Dollar'},
    'MX': {'currency': 'MXN', 'symbol': '$', 'to_usd': 17.2, 'name': 'Mexican Peso'},
    'BR': {'currency': 'BRL', 'symbol': 'R$', 'to_usd': 4.97, 'name': 'Brazilian Real'},
    'AR': {'currency': 'ARS', 'symbol': '$', 'to_usd': 350, 'name': 'Argentine Peso'},
    'CL': {'currency': 'CLP', 'symbol': '$', 'to_usd': 900, 'name': 'Chilean Peso'},
    'CO': {'currency': 'COP', 'symbol': '$', 'to_usd': 3900, 'name': 'Colombian Peso'},
    'PE': {'currency': 'PEN', 'symbol': 'S/', 'to_usd': 3.7, 'name': 'Peruvian Sol'},
    
    # Asia Pacific
    'IN': {'currency': 'INR', 'symbol': '₹', 'to_usd': 83, 'name': 'Indian Rupee'},
    'PK': {'currency': 'PKR', 'symbol': '₨', 'to_usd': 278, 'name': 'Pakistani Rupee'},
    'BD': {'currency': 'BDT', 'symbol': '৳', 'to_usd': 110, 'name': 'Bangladeshi Taka'},
    'CN': {'currency': 'CNY', 'symbol': '¥', 'to_usd': 7.2, 'name': 'Chinese Yuan'},
    'JP': {'currency': 'JPY', 'symbol': '¥', 'to_usd': 149, 'name': 'Japanese Yen'},
    'KR': {'currency': 'KRW', 'symbol': '₩', 'to_usd': 1310, 'name': 'South Korean Won'},
    'SG': {'currency': 'SGD', 'symbol': 'S$', 'to_usd': 1.34, 'name': 'Singapore Dollar'},
    'MY': {'currency': 'MYR', 'symbol': 'RM', 'to_usd': 4.4, 'name': 'Malaysian Ringgit'},
    'TH': {'currency': 'THB', 'symbol': '฿', 'to_usd': 34, 'name': 'Thai Baht'},
    'PH': {'currency': 'PHP', 'symbol': '₱', 'to_usd': 56, 'name': 'Philippine Peso'},
    'ID': {'currency': 'IDR', 'symbol': 'Rp', 'to_usd': 15700, 'name': 'Indonesian Rupiah'},
    'VN': {'currency': 'VND', 'symbol': '₫', 'to_usd': 24300, 'name': 'Vietnamese Dong'},
    'HK': {'currency': 'HKD', 'symbol': 'HK$', 'to_usd': 7.8, 'name': 'Hong Kong Dollar'},
    'TW': {'currency': 'TWD', 'symbol': 'NT$', 'to_usd': 31.5, 'name': 'Taiwan Dollar'},
    'AU': {'currency': 'AUD', 'symbol': 'A$', 'to_usd': 1.52, 'name': 'Australian Dollar'},
    'NZ': {'currency': 'NZD', 'symbol': 'NZ$', 'to_usd': 1.67, 'name': 'New Zealand Dollar'},
    
    # Africa
    'ZA': {'currency': 'ZAR', 'symbol': 'R', 'to_usd': 18.5, 'name': 'South African Rand'},
    'NG': {'currency': 'NGN', 'symbol': '₦', 'to_usd': 870, 'name': 'Nigerian Naira'},
    'KE': {'currency': 'KES', 'symbol': 'KSh', 'to_usd': 129, 'name': 'Kenyan Shilling'},
    'GH': {'currency': 'GHS', 'symbol': 'GH₵', 'to_usd': 12, 'name': 'Ghanaian Cedi'},
    'ET': {'currency': 'ETB', 'symbol': 'Br', 'to_usd': 56, 'name': 'Ethiopian Birr'},
}

def detect_currency_from_locations(target_locations):
    """
    Detect currency based on target locations
    Returns currency info dict with code, symbol, conversion rate, and name
    """
    if not target_locations or len(target_locations) == 0:
        return COUNTRY_TO_CURRENCY['US']  # Default to USD
    
    # Extract country codes from locations
    country_codes = []
    for loc in target_locations:
        # Location can be: 'Saudi Arabia', 'SA', or dict with 'country_code'
        if isinstance(loc, dict):
            country_code = loc.get('country_code') or loc.get('countryCode') or loc.get('canonicalName', '')
            if country_code and len(country_code) == 2:
                country_codes.append(country_code.upper())
        elif isinstance(loc, str):
            # If 2-letter code
            if len(loc) == 2:
                country_codes.append(loc.upper())
            # Otherwise try to extract from name
            else:
                for code, info in COUNTRY_TO_CURRENCY.items():
                    if info['name'].lower() in loc.lower() or loc.lower() in info['name'].lower():
                        country_codes.append(code)
                        break
    
    # Use the first detected currency
    if country_codes:
        for code in country_codes:
            if code in COUNTRY_TO_CURRENCY:
                return COUNTRY_TO_CURRENCY[code]
    
    # Default to USD
    return COUNTRY_TO_CURRENCY['US']

# إنشاء Blueprint
ai_campaign_creator_bp = Blueprint('ai_campaign_creator', __name__)

# Add CORS headers to all responses
@ai_campaign_creator_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle OPTIONS requests for all routes (CORS preflight)
@ai_campaign_creator_bp.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    """Handle CORS preflight requests for all routes"""
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response, 200

# تهيئة الخدمات
try:
    ai_content_generator = AIContentGenerator()
    image_generation_service = ImageGenerationService()
    logger = logging.getLogger(__name__)
    logger.info("تم تهيئة خدمات الذكاء الاصطناعي بنجاح")
except Exception as e:
    logger = logging.getLogger(__name__)
    logger.error(f"خطأ في تهيئة خدمات الذكاء الاصطناعي: {e}")
    ai_content_generator = None
    image_generation_service = None

@ai_campaign_creator_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة الخدمة"""
    return jsonify({
        "status": "healthy",
        "service": "AI Campaign Creator",
        "ai_content_generator": ai_content_generator is not None,
        "image_generation_service": image_generation_service is not None
    })

@ai_campaign_creator_bp.route('/generate-content', methods=['POST'])
def generate_ad_content():
    """توليد المحتوى الإعلاني الكامل"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"🚀 بدء توليد المحتوى الإعلاني للمنتج: {product_service}")
        
        # توليد المحتوى الإعلاني
        result = ai_content_generator.generate_complete_ad_content(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد المحتوى الإعلاني بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد المحتوى الإعلاني: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد المحتوى الإعلاني: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد المحتوى الإعلاني"
        }), 500

@ai_campaign_creator_bp.route('/generate-campaign-content', methods=['POST'])
def generate_campaign_content():
    """Generate complete campaign content for frontend integration"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        website_url = data.get('website_url')
        campaign_type = data.get('campaign_type', 'SEARCH')
        budget = data.get('budget', 15)
        keywords_list = data.get('keywords_list', [])
        target_language = data.get('target_language', 'ar')  # Get language from frontend
        
        if not website_url:
            return jsonify({
                "success": False,
                "error": "website_url is required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"🚀 Generating campaign content for: {website_url}")
        logger.info(f"   Campaign Type: {campaign_type}")
        logger.info(f"   Budget: ${budget}")
        logger.info(f"   Keywords: {len(keywords_list)}")
        logger.info(f"   Language: {target_language}")
        
        # Generate ad content using AI (with target language)
        result = ai_content_generator.generate_complete_ad_content(
            product_service=f"Campaign {campaign_type}",
            website_url=website_url,
            campaign_type=campaign_type,
            keywords_list=keywords_list,
            target_language=target_language  # Pass language to AI
        )
        
        if result.get("success"):
            logger.info(f"✅ Campaign content generated successfully")
            
            # Format response for frontend
            response_data = {
                "success": True,
                "content": {
                    "headlines": result.get("headlines", []),
                    "descriptions": result.get("descriptions", []),
                    "keywords": result.get("keywords", keywords_list),
                    "colors": result.get("colors", {"primary": "#1A1A1A", "secondary": "#00BFA5"}),
                    "brand_style": result.get("brand_style", "modern professional")
                }
            }
            
            logger.info(f"   Headlines: {len(response_data['content']['headlines'])}")
            logger.info(f"   Descriptions: {len(response_data['content']['descriptions'])}")
            logger.info(f"   Keywords: {len(response_data['content']['keywords'])}")
            
            return jsonify(response_data)
        else:
            logger.error(f"❌ Failed to generate campaign content: {result.get('error')}")
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error')
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Error generating campaign content: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error generating campaign content"
        }), 500


@ai_campaign_creator_bp.route('/generate-headlines', methods=['POST'])
def generate_headlines():
    """توليد العناوين الإعلانية"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"📝 بدء توليد العناوين للمنتج: {product_service}")
        
        # توليد العناوين
        result = ai_content_generator.generate_headlines(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد العناوين بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد العناوين: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد العناوين: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد العناوين"
        }), 500

@ai_campaign_creator_bp.route('/generate-descriptions', methods=['POST'])
def generate_descriptions():
    """توليد الأوصاف الإعلانية"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"📝 بدء توليد الأوصاف للمنتج: {product_service}")
        
        # توليد الأوصاف
        result = ai_content_generator.generate_descriptions(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد الأوصاف بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد الأوصاف: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد الأوصاف: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد الأوصاف"
        }), 500

@ai_campaign_creator_bp.route('/generate-keywords', methods=['POST'])
def generate_keywords():
    """توليد الكلمات المفتاحية"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"🔑 بدء توليد الكلمات المفتاحية للمنتج: {product_service}")
        
        # توليد الكلمات المفتاحية
        result = ai_content_generator.generate_keywords(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد الكلمات المفتاحية بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد الكلمات المفتاحية: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد الكلمات المفتاحية: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد الكلمات المفتاحية"
        }), 500

@ai_campaign_creator_bp.route('/suggest-campaign-type', methods=['POST'])
def suggest_campaign_type():
    """اقتراح نوع الحملة الإعلانية"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"🎯 بدء اقتراح نوع الحملة للمنتج: {product_service}")
        
        # اقتراح نوع الحملة
        result = ai_content_generator.suggest_campaign_type(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم اقتراح نوع الحملة بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في اقتراح نوع الحملة: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في اقتراح نوع الحملة: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في اقتراح نوع الحملة"
        }), 500

@ai_campaign_creator_bp.route('/analyze-colors', methods=['POST'])
def analyze_website_colors():
    """تحليل ألوان الموقع الإلكتروني"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator:
            return jsonify({
                "success": False,
                "error": "AI Content Generator not initialized"
            }), 500
        
        logger.info(f"🎨 بدء تحليل ألوان الموقع: {website_url}")
        
        # تحليل ألوان الموقع
        result = ai_content_generator.analyze_website_colors(
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم تحليل ألوان الموقع بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في تحليل ألوان الموقع: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في تحليل ألوان الموقع: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في تحليل ألوان الموقع"
        }), 500

@ai_campaign_creator_bp.route('/generate-image', methods=['POST'])
def generate_ad_image():
    """توليد صورة إعلانية"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        campaign_type = data.get('campaign_type')
        size = data.get('size')
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not all([campaign_type, size, product_service]):
            return jsonify({
                "success": False,
                "error": "campaign_type, size, and product_service are required"
            }), 400
        
        if not image_generation_service:
            return jsonify({
                "success": False,
                "error": "Image Generation Service not initialized"
            }), 500
        
        logger.info(f"🎨 بدء توليد الصورة الإعلانية: {campaign_type} - {size}")
        
        # توليد الصورة
        result = image_generation_service.generate_image(
            campaign_type=campaign_type,
            size=size,
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد الصورة الإعلانية بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد الصورة الإعلانية: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد الصورة الإعلانية: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد الصورة الإعلانية"
        }), 500

@ai_campaign_creator_bp.route('/generate-campaign-images', methods=['POST'])
def generate_campaign_images():
    """توليد جميع صور الحملة"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        campaign_type = data.get('campaign_type')
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        
        if not all([campaign_type, product_service]):
            return jsonify({
                "success": False,
                "error": "campaign_type and product_service are required"
            }), 400
        
        if not image_generation_service:
            return jsonify({
                "success": False,
                "error": "Image Generation Service not initialized"
            }), 500
        
        logger.info(f"🎨 بدء توليد صور الحملة: {campaign_type}")
        
        # توليد صور الحملة
        result = image_generation_service.generate_campaign_images(
            campaign_type=campaign_type,
            product_service=product_service,
            website_url=website_url
        )
        
        if result.get("success"):
            logger.info(f"✅ تم توليد صور الحملة بنجاح")
            return jsonify(result)
        else:
            logger.error(f"❌ فشل في توليد صور الحملة: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"❌ خطأ في توليد صور الحملة: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في توليد صور الحملة"
        }), 500

@ai_campaign_creator_bp.route('/create-complete-campaign', methods=['POST'])
def create_complete_campaign():
    """إنشاء حملة إعلانية كاملة بالذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        product_service = data.get('product_service')
        website_url = data.get('website_url')
        campaign_type = data.get('campaign_type')  # اختياري، سيتم اقتراحه إذا لم يتم توفيره
        
        if not product_service or not website_url:
            return jsonify({
                "success": False,
                "error": "product_service and website_url are required"
            }), 400
        
        if not ai_content_generator or not image_generation_service:
            return jsonify({
                "success": False,
                "error": "AI services not initialized"
            }), 500
        
        logger.info(f"🚀 بدء إنشاء الحملة الإعلانية الكاملة للمنتج: {product_service}")
        
        # 1. توليد المحتوى الإعلاني
        content_result = ai_content_generator.generate_complete_ad_content(
            product_service=product_service,
            website_url=website_url
        )
        
        if not content_result.get("success"):
            return jsonify({
                "success": False,
                "error": "Failed to generate ad content",
                "details": content_result
            }), 500
        
        # 2. تحديد نوع الحملة
        final_campaign_type = campaign_type or content_result.get("recommended_campaign_type", "search_ads")
        
        # 3. توليد صور الحملة
        images_result = image_generation_service.generate_campaign_images(
            campaign_type=final_campaign_type,
            product_service=product_service,
            website_url=website_url
        )
        
        # 4. تجميع النتائج
        complete_result = {
            "success": True,
            "product_service": product_service,
            "website_url": website_url,
            "campaign_type": final_campaign_type,
            "ad_content": {
                "headlines": content_result.get("headlines", []),
                "descriptions": content_result.get("descriptions", []),
                "keywords": content_result.get("keywords", []),
                "recommended_campaign_type": content_result.get("recommended_campaign_type", ""),
                "confidence_score": content_result.get("confidence_score", 0),
                "reasoning": content_result.get("reasoning", ""),
                "alternative_types": content_result.get("alternative_types", [])
            },
            "brand_colors": {
                "colors": content_result.get("colors", {}),
                "color_palette": content_result.get("color_palette", []),
                "brand_style": content_result.get("brand_style", "")
            },
            "images": images_result.get("images", {}) if images_result.get("success") else {},
            "website_content": content_result.get("website_content", ""),
            "timestamp": content_result.get("timestamp", ""),
            "errors": content_result.get("errors", [])
        }
        
        # إضافة أخطاء الصور إذا وجدت
        if not images_result.get("success"):
            complete_result["errors"].append(f"خطأ في توليد الصور: {images_result.get('error')}")
        
        logger.info(f"✅ تم إنشاء الحملة الإعلانية الكاملة بنجاح")
        return jsonify(complete_result)
        
    except Exception as e:
        logger.error(f"❌ خطأ في إنشاء الحملة الإعلانية الكاملة: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "خطأ في إنشاء الحملة الإعلانية الكاملة"
        }), 500

# ==================== Frontend Integration Endpoints ====================
# These endpoints are needed by the frontend (success/page.tsx)

@ai_campaign_creator_bp.route('/get-campaign-types', methods=['GET'])
def get_campaign_types():
    """Get all available campaign types"""
    try:
        # استيراد من مسار campaign_types بشكل صحيح
        import sys
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        from campaign_types import CAMPAIGN_TYPES, CAMPAIGN_TYPE_NAMES
        
        logger.info("✅ تم تحميل أنواع الحملات بنجاح")
        
        # Get unique campaign types (exclude aliases)
        seen_classes = set()
        campaign_types = []
        
        for type_key, creator_class in CAMPAIGN_TYPES.items():
            if creator_class not in seen_classes:
                seen_classes.add(creator_class)
                campaign_types.append({
                    'type': type_key,
                    'name': CAMPAIGN_TYPE_NAMES.get(type_key, type_key),
                    'name_en': type_key.replace('_', ' ').title()
                })
        
        logger.info(f"✅ تم جلب {len(campaign_types)} نوع حملة")
        
        return jsonify({
            'success': True,
            'campaign_types': campaign_types
        })
    except Exception as e:
        logger.error(f"❌ Error fetching campaign types: {str(e)}")
        import traceback
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'فشل في جلب أنواع الحملات'
        }), 500

@ai_campaign_creator_bp.route('/get-keyword-cpc-data', methods=['POST', 'OPTIONS'])
def get_keyword_cpc_data():
    """Get keyword CPC data from Google Keyword Planner"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        website_url = data.get('website_url')
        campaign_type = data.get('campaign_type', 'SEARCH')
        daily_budget = data.get('daily_budget', 15)
        target_locations = data.get('target_locations', [])
        language_id = data.get('language_id', '1019')  # Fallback to Arabic only if not provided
        
        logger.info(f"Keyword CPC data request for: {website_url}")
        logger.info(f"📍 Received {len(target_locations)} target locations from frontend")
        
        if data.get('language_id'):
            logger.info(f"🗣️ Using user-selected language: {language_id}")
        else:
            logger.warning(f"⚠️ No language_id provided - using Arabic fallback (1019)")
        
        # Extract location_ids from target_locations - Use coordinates for precise targeting
        location_ids = []
        proximity_targets = []  # For precise location targeting
        
        logger.info(f"📍 Processing {len(target_locations)} locations...")
        
        if target_locations:
            for loc in target_locations:
                try:
                    # Handle direct location_id (string/int)
                    if isinstance(loc, (str, int)):
                        location_id = str(loc)
                        if location_id not in location_ids:
                            location_ids.append(location_id)
                    
                    elif isinstance(loc, dict):
                        # First check if it has a direct location_id field
                        if 'location_id' in loc:
                            location_id = str(loc['location_id'])
                            if location_id not in location_ids:
                                location_ids.append(location_id)
                        
                        # PRIORITY: Use coordinates directly for precise targeting
                        elif 'coordinates' in loc and 'name' in loc:
                            coords = loc['coordinates']
                            radius = loc.get('radius', 10)
                            proximity_targets.append({
                                'latitude': coords.get('lat'),
                                'longitude': coords.get('lng'),
                                'radius_km': radius,
                                'name': loc.get('name', '')
                            })
                            logger.info(f"✅ Using PRECISE proximity targeting for CPC: {loc.get('name')} (lat: {coords.get('lat')}, lng: {coords.get('lng')}, radius: {radius}km)")
                            
                            # For Keyword Planner, we need location_id (country level as fallback)
                            country_code = loc.get('countryCode', '')
                            logger.info(f"   📍 Extracted countryCode: '{country_code}' from location")
                            if country_code:
                                country_map = {
                                    'SA': '2682', 'AE': '2784', 'EG': '2818', 'US': '2840',
                                    'GB': '2826', 'DE': '2276', 'FR': '2250', 'IT': '2380',
                                    'ES': '2724', 'CA': '2124', 'AU': '2036', 'IN': '2356'
                                }
                                location_id = country_map.get(country_code)
                                if location_id:
                                    if location_id not in location_ids:
                                        location_ids.append(location_id)
                                        logger.info(f"   ✅ Added country '{country_code}' ({location_id}) for Keyword Planner")
                                    else:
                                        logger.info(f"   ℹ️ Country '{country_code}' ({location_id}) already in location_ids")
                                else:
                                    logger.warning(f"   ⚠️ Country code '{country_code}' not found in country_map")
                            else:
                                logger.warning(f"   ⚠️ No countryCode provided for location {loc.get('name')}")
                                logger.info(f"   🔍 Attempting to infer country from location name...")
                                
                                # Smart fallback: Try to detect country from location name
                                location_name_lower = loc.get('name', '').lower()
                                inferred_code = None
                                
                                # Saudi Arabia detection
                                if any(term in location_name_lower for term in ['saudi', 'السعودية', 'رياض', 'riyadh', 'jeddah', 'جدة', 'dammam', 'الدمام']):
                                    inferred_code = 'SA'
                                # UAE detection  
                                elif any(term in location_name_lower for term in ['uae', 'emirates', 'الإمارات', 'dubai', 'دبي', 'abu dhabi', 'أبو ظبي']):
                                    inferred_code = 'AE'
                                # Egypt detection
                                elif any(term in location_name_lower for term in ['egypt', 'مصر', 'cairo', 'القاهرة']):
                                    inferred_code = 'EG'
                                # Kuwait detection
                                elif any(term in location_name_lower for term in ['kuwait', 'الكويت']):
                                    inferred_code = 'KW'
                                # Qatar detection
                                elif any(term in location_name_lower for term in ['qatar', 'قطر', 'doha', 'الدوحة']):
                                    inferred_code = 'QA'
                                
                                if inferred_code:
                                    location_id = country_map.get(inferred_code)
                                    if location_id and location_id not in location_ids:
                                        location_ids.append(location_id)
                                        logger.info(f"   ✅ Inferred country '{inferred_code}' from location name, added {location_id} for Keyword Planner")
                    
                    # FALLBACK: Try to search for location by name using Google Ads API
                    elif 'name' in loc:
                        try:
                            from google.ads.googleads.client import GoogleAdsClient
                            import os
                            
                            # Initialize Google Ads client
                            yaml_path = os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml')
                            client = GoogleAdsClient.load_from_storage(yaml_path)
                            
                            # Search for location by name
                            location_name = loc.get('name', '')
                            country_code = loc.get('countryCode', '')
                            
                            logger.info(f"🔍 Searching for location: {location_name} in country: {country_code}")
                            
                            # Build search query
                            query = f"""
                                SELECT
                                    geo_target_constant.id,
                                    geo_target_constant.name,
                                    geo_target_constant.canonical_name,
                                    geo_target_constant.country_code,
                                    geo_target_constant.target_type
                                FROM geo_target_constant
                                WHERE geo_target_constant.canonical_name LIKE '%{location_name}%'
                            """
                            
                            if country_code:
                                query += f" AND geo_target_constant.country_code = '{country_code}'"
                            
                            query += " LIMIT 5"
                            
                            ga_service = client.get_service("GoogleAdsService")
                            response = ga_service.search(
                                customer_id=os.getenv('GOOGLE_ADS_CUSTOMER_ID'),
                                query=query
                            )
                            
                            # Get the first matching result
                            found_location = False
                            for row in response:
                                geo = row.geo_target_constant
                                location_id = str(geo.id)
                                logger.info(f"✅ Found location: {geo.canonical_name} (ID: {location_id})")
                                if location_id not in location_ids:
                                    location_ids.append(location_id)
                                found_location = True
                                break
                            
                            if not found_location:
                                logger.warning(f"⚠️ No Google Ads location found for: {location_name}")
                        
                        except Exception as e:
                            logger.error(f"❌ Error searching for location '{loc.get('name')}': {str(e)}")
                
                except Exception as loc_error:
                    logger.error(f"❌ Error processing location: {str(loc_error)}")
                    continue
        
        if not location_ids:
            if proximity_targets:
                # If we have proximity targets, that's enough - no location_ids needed
                logger.info("✅ Using proximity targeting only - no country-level location_ids needed")
            else:
                # NO DEFAULT - User must select locations
                logger.error("❌ No location targeting provided - user must select locations!")
                return jsonify({
                    'success': False,
                    'error': 'NO_LOCATION_SELECTED',
                    'message': 'يجب تحديد موقع جغرافي لإنشاء الحملة'
                }), 400
        
        # Extract keywords from website using ai_content_generator method
        keywords = data.get('keywords', [])
        if not keywords and website_url:
            try:
                from services.website_analyzer import WebsiteAnalyzer
                website_analyzer = WebsiteAnalyzer()
                analysis_result = website_analyzer.analyze_website(website_url)
                if analysis_result.get('success') and analysis_result.get('analysis', {}).get('keywords_suggestions'):
                    # keywords_suggestions is a dict with 'primary', 'secondary', 'long_tail' keys
                    keywords_suggestions = analysis_result['analysis']['keywords_suggestions']
                    # Combine all keyword categories, prioritizing primary
                    keywords = (
                        keywords_suggestions.get('primary', [])[:5] +
                        keywords_suggestions.get('secondary', [])[:3] +
                        keywords_suggestions.get('long_tail', [])[:2]
                    )
                    logger.info(f"Extracted {len(keywords)} keywords from website analysis")
            except Exception as e:
                logger.warning(f"Could not extract keywords from website: {str(e)}")
        
        # If still no keywords, generate SMART keywords using AI
        if not keywords and website_url:
            logger.warning("⚠️ No keywords provided - generating SMART keywords using AI...")
            try:
                # Use AI Content Generator for SMART keyword generation
                from services.ai_content_generator import AIContentGenerator
                ai_generator = AIContentGenerator()
                
                # Extract basic info from website
                import requests
                from bs4 import BeautifulSoup
                from urllib.parse import urlparse
                
                if not website_url.startswith(('http://', 'https://')):
                    website_url = 'https://' + website_url
                
                # Try to fetch with www fallback
                urls_to_try = [website_url]
                parsed = urlparse(website_url)
                if not parsed.netloc.startswith('www.'):
                    www_url = f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}"
                    if parsed.query:
                        www_url += f"?{parsed.query}"
                    urls_to_try.append(www_url)
                
                response = None
                try:
                    for url_attempt in urls_to_try:
                        try:
                            logger.info(f"🔗 Trying to fetch: {url_attempt}")
                            response = requests.get(url_attempt, timeout=15, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
                            if response.status_code == 200:
                                logger.info(f"✅ Successfully fetched: {url_attempt}")
                                break
                        except Exception as e:
                            logger.warning(f"⚠️ Failed {url_attempt}: {e}")
                            continue
                    
                    if not response or response.status_code != 200:
                        raise Exception("Could not fetch website")
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract title and meta description for context
                    title = soup.find('title')
                    title_text = title.get_text() if title else ''
                    
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    description_text = meta_desc.get('content', '') if meta_desc else ''
                    
                    # Extract main headings
                    headings = []
                    for h in soup.find_all(['h1', 'h2', 'h3']):
                        headings.append(h.get_text().strip())
                    
                    context = f"{title_text} {description_text} {' '.join(headings[:5])}"
                    logger.info(f"📝 Website context: {context[:200]}...")
                    
                except Exception as fetch_error:
                    logger.warning(f"Could not fetch website: {fetch_error}")
                    context = website_url
                
                # Generate keywords using AI
                keyword_result = ai_generator.generate_keywords(
                    product_service=context or "business",
                    website_url=website_url
                )
                
                if keyword_result.get('success') and keyword_result.get('keywords'):
                    keywords = keyword_result['keywords'][:15]  # Take top 15
                    logger.info(f"✅ AI generated {len(keywords)} SMART keywords: {keywords[:5]}")
                else:
                    logger.warning("⚠️ AI keyword generation failed, using seed keywords")
                    keywords = []
                
            except Exception as e:
                logger.error(f"Failed to generate AI keywords: {str(e)}")
                keywords = []
        
        # If STILL no keywords, use website URL as seed for Keyword Planner
        if not keywords:
            logger.info("⚠️ No keywords available - Google Keyword Planner will generate from URL only")
            keywords = []  # Let Keyword Planner generate from URL
        
        # Try to get CPC data from Google Keyword Planner
        try:
            from services.keyword_planner_service import KeywordPlannerService
            keyword_planner = KeywordPlannerService()
            
            logger.info(f"🔍 Calling Google Keyword Planner with {len(keywords)} keywords...")
            
            # Use location_ids from frontend
            if not location_ids:
                if proximity_targets:
                    # Try to infer country from proximity targets
                    logger.warning("⚠️ No location_ids but proximity_targets exist - attempting to infer country...")
                    
                    for prox in proximity_targets:
                        loc_name = prox.get('name', '').lower()
                        logger.info(f"   🔍 Analyzing proximity target: {loc_name}")
                        
                        # Saudi Arabia
                        if any(term in loc_name for term in ['saudi', 'السعودية', 'رياض', 'riyadh', 'jeddah', 'جدة', 'dammam', 'الدمام']):
                            if '2682' not in location_ids:
                                location_ids.append('2682')
                                logger.info(f"   ✅ Inferred Saudi Arabia (2682) from proximity target name")
                        # UAE
                        elif any(term in loc_name for term in ['uae', 'emirates', 'الإمارات', 'dubai', 'دبي', 'abu dhabi', 'أبو ظبي']):
                            if '2784' not in location_ids:
                                location_ids.append('2784')
                                logger.info(f"   ✅ Inferred UAE (2784) from proximity target name")
                        # Egypt
                        elif any(term in loc_name for term in ['egypt', 'مصر', 'cairo', 'القاهرة']):
                            if '2818' not in location_ids:
                                location_ids.append('2818')
                                logger.info(f"   ✅ Inferred Egypt (2818) from proximity target name")
                    
                    if not location_ids:
                        # Still no location_ids, use Saudi Arabia as default for Keyword Planner only
                        location_ids = ['2682']
                        logger.warning("⚠️ Could not infer country, using default Saudi Arabia (2682) for Keyword Planner")
                else:
                    # NO DEFAULT - User must select locations
                    logger.error("❌ No location_ids for Keyword Planner - user must select locations!")
                    raise Exception("No location targeting provided")
            
            # Prepare request according to KeywordPlannerService signature
            keyword_plan_request = {
                'language_id': language_id,
                'geo_target_ids': location_ids,  # KeywordPlannerService expects 'geo_target_ids'
                'keyword_texts': keywords,       # KeywordPlannerService expects 'keyword_texts'
                'site_url': website_url if website_url else None,  # KeywordPlannerService expects 'site_url'
                'keyword_match_type': 'BROAD'
            }
            
            # Use MCC customer ID for keyword planner (not the target customer ID)
            mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID', '9252466178')
            
            logger.info(f"📦 Keyword Planner request: {len(keywords)} keywords, {len(location_ids)} locations")
            
            # Additional check - ensure location_ids is not empty
            if not location_ids or len(location_ids) == 0:
                logger.error("❌ location_ids is empty - cannot call Keyword Planner")
                raise Exception("Empty location_ids - skipping Keyword Planner")
            
            result = keyword_planner.generate_keyword_ideas(
                customer_id=mcc_customer_id,
                keyword_plan_request=keyword_plan_request
            )
            
            if result.get('success') and result.get('keywords'):
                keyword_data = result['keywords']
                logger.info(f"✅ Google Keyword Planner returned {len(keyword_data)} keywords with CPC data")
                
                # Calculate average CPC from Google Ads bid data (in micros)
                # micros = 1/1,000,000 of the base currency unit
                cpc_values = []
                for k in keyword_data:
                    low_bid = k.get('low_top_of_page_bid_micros', 0)
                    high_bid = k.get('high_top_of_page_bid_micros', 0)
                    
                    if low_bid > 0 and high_bid > 0:
                        # Average of low and high bids, convert from micros to dollars
                        avg_bid = (low_bid + high_bid) / 2 / 1_000_000
                        cpc_values.append(avg_bid)
                        # Add avg_cpc to keyword data for later use
                        k['avg_cpc'] = round(avg_bid, 2)
                    elif low_bid > 0:
                        avg_bid = low_bid / 1_000_000
                        cpc_values.append(avg_bid)
                        k['avg_cpc'] = round(avg_bid, 2)
                    elif high_bid > 0:
                        avg_bid = high_bid / 1_000_000
                        cpc_values.append(avg_bid)
                        k['avg_cpc'] = round(avg_bid, 2)
                
                avg_cpc = sum(cpc_values) / len(cpc_values) if cpc_values else 0.5
                
                estimated_clicks = int(daily_budget / avg_cpc) if avg_cpc > 0 else int(daily_budget / 0.5)
                estimated_impressions = int(estimated_clicks * 20)  # Assuming 5% CTR
                
                logger.info(f"💰 Average CPC: ${avg_cpc:.2f}, Est. Clicks: {estimated_clicks}, Est. Impressions: {estimated_impressions}")
                logger.info(f"📊 CPC Range: ${min(cpc_values) if cpc_values else 0:.2f} - ${max(cpc_values) if cpc_values else 0:.2f}")
                
                # Extract keyword texts for response (use 'keyword' key from KeywordPlannerService)
                keyword_texts = [k.get('keyword', '') for k in keyword_data if k.get('keyword')]
                
                # Filter out low-quality keywords
                arabic_stop_words = [
                    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي',
                    'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي', 'أن', 'أو', 'لا', 'ما', 'قد'
                ]
                
                filtered_keywords = []
                for kw in keyword_texts:
                    kw_clean = kw.strip()
                    # Skip if empty, too short (less than 3 chars), or is a stop word
                    if not kw_clean or len(kw_clean) < 3:
                        continue
                    if kw_clean in arabic_stop_words:
                        continue
                    # Skip if keyword has low search volume (less than 10 monthly searches)
                    kw_data = next((k for k in keyword_data if k.get('keyword') == kw), None)
                    if kw_data and kw_data.get('avg_monthly_searches', 0) < 10:
                        continue
                    filtered_keywords.append(kw_clean)
                
                # Sort by relevance (search volume)
                keyword_data_sorted = sorted(
                    [k for k in keyword_data if k.get('keyword') in filtered_keywords],
                    key=lambda x: x.get('avg_monthly_searches', 0),
                    reverse=True
                )
                
                filtered_keywords = [k.get('keyword') for k in keyword_data_sorted]
                
                logger.info(f"📝 Filtered to {len(filtered_keywords)} high-quality keywords: {filtered_keywords[:5]}...")
                
                return jsonify({
                    'success': True,
                    'method': 'google_keyword_planner',
                    'average_cpc': round(avg_cpc, 2),
                    'estimated_clicks': estimated_clicks,
                    'estimated_impressions': estimated_impressions,
                    'keywords': filtered_keywords[:50],  # Return top 50 filtered keywords
                    'keyword_data': keyword_data_sorted[:50]
                })
            else:
                logger.warning(f"⚠️ Google Keyword Planner returned no data or failed: {result.get('error', 'Unknown error')}")
        except Exception as e:
            logger.error(f"Keyword Planner failed: {str(e)}")
        
        # Fallback to estimated data
        estimated_cpc = 0.5
        estimated_clicks = int(daily_budget / estimated_cpc)
        estimated_impressions = int(estimated_clicks * 20)
        
        return jsonify({
            'success': True,
            'method': 'estimated',
            'average_cpc': estimated_cpc,
            'estimated_clicks': estimated_clicks,
            'estimated_impressions': estimated_impressions,
            'keywords': keywords,
            'keyword_data': []
        })
        
    except Exception as e:
        logger.error(f"Error getting keyword CPC data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_campaign_creator_bp.route('/get-historical-metrics', methods=['POST', 'OPTIONS'])
def get_historical_metrics():
    """Get real historical metrics from Google Ads API with competition indicators"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        website_url = data.get('website_url', '')
        target_locations = data.get('target_locations', [])
        language_id = data.get('language_id', '1019')  # Default: Arabic
        
        logger.info(f"📊 Historical Metrics request for {len(keywords)} keywords")
        logger.info(f"🌐 Website: {website_url}")
        logger.info(f"📍 Locations: {len(target_locations)}")
        logger.info(f"🗣️ Language: {language_id}")
        
        # Detect currency from target locations
        currency_info = detect_currency_from_locations(target_locations)
        logger.info(f"💱 Detected Currency: {currency_info['currency']} ({currency_info['symbol']}) - Conversion: {currency_info['to_usd']}")
        
        # Extract location IDs from target_locations
        location_ids = []
        for loc in target_locations:
            if isinstance(loc, (str, int)):
                location_ids.append(str(loc))
            elif isinstance(loc, dict):
                if 'location_id' in loc:
                    location_ids.append(str(loc['location_id']))
                elif 'coordinates' in loc and 'countryCode' in loc:
                    country_code = loc.get('countryCode', '')
                    country_map = {
                        'SA': '2682', 'AE': '2784', 'EG': '2818', 'US': '2840',
                        'GB': '2826', 'DE': '2276', 'FR': '2250', 'IT': '2380',
                        'ES': '2724', 'CA': '2124', 'AU': '2036', 'IN': '2356',
                        'JP': '2392', 'BR': '2076', 'MX': '2484', 'AR': '2032',
                        'CO': '2170', 'CL': '2152', 'PE': '2604', 'TR': '2792',
                        'PL': '2616', 'NL': '2528', 'SE': '2752', 'NO': '2578',
                        'DK': '2208', 'FI': '2246', 'CH': '2756', 'AT': '2040',
                        'BE': '2056', 'GR': '2300', 'PT': '2620', 'IE': '2372',
                        'NZ': '2554', 'SG': '2702', 'HK': '2344', 'MY': '2458',
                        'TH': '2764', 'ID': '2360', 'PH': '2608', 'VN': '2704',
                        'ZA': '2710', 'NG': '2566', 'KE': '2404', 'MA': '2504',
                        'TN': '2788', 'DZ': '2012', 'JO': '2400', 'LB': '2422',
                        'IQ': '2368', 'KW': '2414', 'OM': '2512', 'QA': '2634',
                        'BH': '2048'
                    }
                    location_id = country_map.get(country_code)
                    if location_id and location_id not in location_ids:
                        location_ids.append(location_id)
        
        if not location_ids:
            location_ids = ['2682']  # Default: Saudi Arabia
            logger.warning(f"⚠️ No locations provided, using default: Saudi Arabia (2682)")
        
        # Generate keywords from website if not provided
        if not keywords and website_url:
            try:
                from services.ai_content_generator import AIContentGenerator
                ai_generator = AIContentGenerator()
                
                import requests
                from bs4 import BeautifulSoup
                
                if not website_url.startswith(('http://', 'https://')):
                    website_url = 'https://' + website_url
                
                try:
                    response = requests.get(website_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    title = soup.find('title')
                    title_text = title.get_text() if title else ''
                    
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    description_text = meta_desc.get('content', '') if meta_desc else ''
                    
                    headings = []
                    for h in soup.find_all(['h1', 'h2', 'h3']):
                        headings.append(h.get_text().strip())
                    
                    context = f"{title_text} {description_text} {' '.join(headings[:5])}"
                    logger.info(f"📝 Extracted context from website")
                    
                except Exception as fetch_error:
                    logger.warning(f"Could not fetch website: {fetch_error}")
                    context = website_url
                
                keyword_result = ai_generator.generate_keywords(
                    product_service=context or "business",
                    website_url=website_url
                )
                
                if keyword_result.get('success') and keyword_result.get('keywords'):
                    keywords = keyword_result['keywords'][:15]
                    logger.info(f"✅ Generated {len(keywords)} keywords from website")
                
            except Exception as e:
                logger.error(f"Failed to generate keywords: {str(e)}")
        
        if not keywords:
            return jsonify({
                'success': False,
                'error': 'No keywords provided or generated',
                'message': 'يجب توفير كلمات مفتاحية أو رابط موقع صالح'
            }), 400
        
        # Call Google Ads API for historical metrics
        try:
            from google.ads.googleads.client import GoogleAdsClient
            from google.ads.googleads.v21.services.services.google_ads_service.client import GoogleAdsServiceClient
            from google.ads.googleads.v21.services.services.keyword_plan_idea_service.client import KeywordPlanIdeaServiceClient
            
            # Initialize Google Ads client
            yaml_path = os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml')
            client = GoogleAdsClient.load_from_storage(yaml_path)
            client.use_proto_plus = True
            
            googleads_service = client.get_service("GoogleAdsService")
            keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")
            
            # Prepare request
            request_obj = client.get_type("GenerateKeywordHistoricalMetricsRequest")
            mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID', '9252466178')
            request_obj.customer_id = mcc_customer_id
            request_obj.keywords = keywords[:10]  # Limit to 10 keywords
            
            # Add geo targets
            for location_id in location_ids:
                request_obj.geo_target_constants.append(
                    googleads_service.geo_target_constant_path(location_id)
                )
            
            # Set network and language
            request_obj.keyword_plan_network = client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            request_obj.language = googleads_service.language_constant_path(language_id)
            
            logger.info(f"🚀 Calling Google Ads Historical Metrics API...")
            
            # Call API
            response = keyword_plan_idea_service.generate_keyword_historical_metrics(
                request=request_obj
            )
            
            # Process results
            results_data = []
            total_avg_monthly_searches = 0
            total_low_cpc = 0
            total_high_cpc = 0
            competition_levels = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'UNSPECIFIED': 0}
            
            logger.info(f"📊 Processing {len(response.results)} results from Google Ads API")
            
            for result in response.results:
                metrics = result.keyword_metrics
                
                # Extract competition level
                competition_enum = metrics.competition
                competition_name = competition_enum.name if hasattr(competition_enum, 'name') else 'UNSPECIFIED'
                
                # Count competition levels
                competition_levels[competition_name] = competition_levels.get(competition_name, 0) + 1
                
                # Convert CPC from micros to dollars
                # IMPORTANT: Google Ads API returns bid in ACCOUNT BILLING CURRENCY (usually USD)
                # NOT in target location currency!
                low_bid_micros = metrics.low_top_of_page_bid_micros if metrics.low_top_of_page_bid_micros > 0 else 0
                high_bid_micros = metrics.high_top_of_page_bid_micros if metrics.high_top_of_page_bid_micros > 0 else 0
                
                # Convert from micros to dollars (account currency is USD for most accounts)
                low_bid_raw = low_bid_micros / 1_000_000
                high_bid_raw = high_bid_micros / 1_000_000
                
                logger.info(f"   🔍 Raw API Response for '{result.text}':")
                logger.info(f"      ├─ Low Bid Micros: {low_bid_micros:,}")
                logger.info(f"      ├─ High Bid Micros: {high_bid_micros:,}")
                logger.info(f"      ├─ Low Top of Page Bid (USD): ${low_bid_raw:.2f}")
                logger.info(f"      └─ High Top of Page Bid (USD): ${high_bid_raw:.2f}")
                
                # CRITICAL: Top of Page Bid ≠ Actual CPC!
                # Top of Page Bid is the MAXIMUM bid to appear at top position
                # Real Average CPC is MUCH lower - typically 1-3% of Top of Page Bid
                # Based on industry averages: Real CPC ≈ 2% of Top of Page Bid
                realistic_factor = 0.02  # 2% for realistic average CPC
                low_cpc_usd = low_bid_raw * realistic_factor
                high_cpc_usd = high_bid_raw * realistic_factor
                
                logger.info(f"      ├─ Realistic Avg CPC Low (2% of top bid): ${low_cpc_usd:.2f}")
                logger.info(f"      └─ Realistic Avg CPC High (2% of top bid): ${high_cpc_usd:.2f}")
                
                # Calculate local currency values for display
                low_cpc_local = low_cpc_usd * currency_info['to_usd']
                high_cpc_local = high_cpc_usd * currency_info['to_usd']
                
                # Calculate average CPC using Google's formula: (High + Low) / 3
                if low_cpc_usd > 0 and high_cpc_usd > 0:
                    avg_cpc = (high_cpc_usd + low_cpc_usd) / 3
                elif high_cpc_usd > 0:
                    avg_cpc = high_cpc_usd / 3
                elif low_cpc_usd > 0:
                    avg_cpc = low_cpc_usd / 3
                else:
                    avg_cpc = 0
                
                # Calculate avg CPC in local currency
                if low_cpc_local > 0 and high_cpc_local > 0:
                    avg_cpc_local = (high_cpc_local + low_cpc_local) / 3
                elif high_cpc_local > 0:
                    avg_cpc_local = high_cpc_local / 3
                elif low_cpc_local > 0:
                    avg_cpc_local = low_cpc_local / 3
                else:
                    avg_cpc_local = 0
                
                logger.info(f"   💰 {result.text}: USD ${low_cpc_usd:.2f} - ${high_cpc_usd:.2f} → Avg ${avg_cpc:.2f} | {currency_info['currency']} {currency_info['symbol']}{avg_cpc_local:.2f}")
                
                low_cpc = low_cpc_usd
                high_cpc = high_cpc_usd
                
                total_avg_monthly_searches += metrics.avg_monthly_searches
                total_low_cpc += low_cpc
                total_high_cpc += high_cpc
                
                keyword_result = {
                    'keyword': result.text,
                    'avg_monthly_searches': metrics.avg_monthly_searches,
                    'competition': competition_name,
                    'competition_index': metrics.competition_index if metrics.competition_index else 0,
                    'low_cpc': round(low_cpc, 2),
                    'high_cpc': round(high_cpc, 2),
                    'avg_cpc': round(avg_cpc, 2),
                }
                
                results_data.append(keyword_result)
                
                logger.info(f"   🔑 {result.text}: {metrics.avg_monthly_searches} searches/month, {competition_name} competition, ${avg_cpc:.2f} CPC")
            
            # Calculate overall averages
            num_keywords = len(results_data)
            avg_monthly_searches = int(total_avg_monthly_searches / num_keywords) if num_keywords > 0 else 0
            avg_low_cpc = round(total_low_cpc / num_keywords, 2) if num_keywords > 0 else 0
            avg_high_cpc = round(total_high_cpc / num_keywords, 2) if num_keywords > 0 else 0
            
            # Use EXACT Google formula: Average CPC = (High + Low) / 3
            if avg_low_cpc > 0 and avg_high_cpc > 0:
                overall_avg_cpc = round((avg_high_cpc + avg_low_cpc) / 3, 2)
            elif avg_high_cpc > 0:
                overall_avg_cpc = round(avg_high_cpc / 3, 2)
            elif avg_low_cpc > 0:
                overall_avg_cpc = round(avg_low_cpc / 3, 2)
            else:
                overall_avg_cpc = 0.5  # Fallback
            
            # Calculate CPC in local currency
            overall_avg_cpc_local = round(overall_avg_cpc * currency_info['to_usd'], 2)
            avg_low_cpc_local = round(avg_low_cpc * currency_info['to_usd'], 2)
            avg_high_cpc_local = round(avg_high_cpc * currency_info['to_usd'], 2)
            
            # Determine dominant competition level
            dominant_competition = max(competition_levels.items(), key=lambda x: x[1])[0]
            
            logger.info(f"✅ Historical Metrics Summary:")
            logger.info(f"   📊 Avg Monthly Searches: {avg_monthly_searches:,}")
            logger.info(f"   💰 Avg CPC (USD): ${overall_avg_cpc}")
            logger.info(f"   💰 Avg CPC ({currency_info['currency']}): {currency_info['symbol']}{overall_avg_cpc_local}")
            logger.info(f"   📈 CPC Range (USD): ${avg_low_cpc} - ${avg_high_cpc}")
            logger.info(f"   📈 CPC Range ({currency_info['currency']}): {currency_info['symbol']}{avg_low_cpc_local} - {currency_info['symbol']}{avg_high_cpc_local}")
            logger.info(f"   🎯 Dominant Competition: {dominant_competition}")
            logger.info(f"   📋 Competition Distribution: {competition_levels}")
            
            # Sanity check - warn if CPC seems too high
            if overall_avg_cpc > 50:
                logger.warning(f"⚠️ CPC ${overall_avg_cpc} seems very high! Possible currency conversion issue?")
                logger.warning(f"   Currency: {currency_info['currency']}, Conversion Rate: {currency_info['to_usd']}")
            
            return jsonify({
                'success': True,
                'method': 'google_ads_historical_metrics',
                'currency': {
                    'code': currency_info['currency'],
                    'symbol': currency_info['symbol'],
                    'name': currency_info['name'],
                    'to_usd': currency_info['to_usd']
                },
                'summary': {
                    'avg_monthly_searches': avg_monthly_searches,
                    'avg_cpc': overall_avg_cpc,  # USD
                    'avg_cpc_local': overall_avg_cpc_local,  # Local currency
                    'low_cpc': avg_low_cpc,  # USD
                    'low_cpc_local': avg_low_cpc_local,  # Local currency
                    'high_cpc': avg_high_cpc,  # USD
                    'high_cpc_local': avg_high_cpc_local,  # Local currency
                    'competition': dominant_competition,
                    'competition_distribution': competition_levels,
                    'total_keywords': num_keywords
                },
                'keywords': results_data
            })
            
        except Exception as api_error:
            logger.error(f"❌ Google Ads API error: {str(api_error)}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Return fallback data with estimated competition
            return jsonify({
                'success': False,
                'error': str(api_error),
                'message': 'فشل في الحصول على البيانات من Google Ads API',
                'fallback': True
            }), 500
        
    except Exception as e:
        logger.error(f"❌ Error in get_historical_metrics: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في الحصول على المقاييس التاريخية'
        }), 500

@ai_campaign_creator_bp.route('/generate-forecast-metrics', methods=['POST', 'OPTIONS'])
def generate_forecast_metrics():
    """Generate real forecast metrics using Google Ads API (exactly like google-ads-official)"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        website_url = data.get('website_url', '')
        target_locations = data.get('target_locations', [])
        language_id = data.get('language_id', '1019')  # Default: Arabic
        daily_budget_usd = data.get('daily_budget_usd', 15)
        
        logger.info(f"📊 Forecast Metrics request")
        logger.info(f"   💰 Daily Budget: ${daily_budget_usd}")
        logger.info(f"   🔑 Keywords: {len(keywords)}")
        logger.info(f"   📍 Locations: {len(target_locations)}")
        logger.info(f"   🗣️ Language: {language_id}")
        
        # Extract location IDs
        location_ids = []
        for loc in target_locations:
            if isinstance(loc, (str, int)):
                location_ids.append(str(loc))
            elif isinstance(loc, dict):
                if 'location_id' in loc:
                    location_ids.append(str(loc['location_id']))
                elif 'coordinates' in loc and 'countryCode' in loc:
                    country_code = loc.get('countryCode', '')
                    country_map = {
                        'SA': '2682', 'AE': '2784', 'EG': '2818', 'US': '2840',
                        'GB': '2826', 'DE': '2276', 'FR': '2250', 'IT': '2380',
                        'ES': '2724', 'CA': '2124', 'AU': '2036', 'IN': '2356',
                        'JP': '2392', 'BR': '2076', 'MX': '2484', 'AR': '2032',
                        'CO': '2170', 'CL': '2152', 'PE': '2604', 'TR': '2792',
                        'PL': '2616', 'NL': '2528', 'SE': '2752', 'NO': '2578',
                        'DK': '2208', 'FI': '2246', 'CH': '2756', 'AT': '2040',
                        'BE': '2056', 'GR': '2300', 'PT': '2620', 'IE': '2372',
                        'NZ': '2554', 'SG': '2702', 'HK': '2344', 'MY': '2458',
                        'TH': '2764', 'ID': '2360', 'PH': '2608', 'VN': '2704',
                        'ZA': '2710', 'NG': '2566', 'KE': '2404', 'MA': '2504',
                        'TN': '2788', 'DZ': '2012', 'JO': '2400', 'LB': '2422',
                        'IQ': '2368', 'KW': '2414', 'OM': '2512', 'QA': '2634',
                        'BH': '2048'
                    }
                    location_id = country_map.get(country_code)
                    if location_id and location_id not in location_ids:
                        location_ids.append(location_id)
        
        if not location_ids:
            location_ids = ['2682']  # Default: Saudi Arabia
            logger.warning(f"⚠️ No locations provided, using default: Saudi Arabia")
        
        # Generate keywords if not provided
        if not keywords and website_url:
            try:
                from services.ai_content_generator import AIContentGenerator
                ai_generator = AIContentGenerator()
                
                import requests
                from bs4 import BeautifulSoup
                
                if not website_url.startswith(('http://', 'https://')):
                    website_url = 'https://' + website_url
                
                try:
                    response = requests.get(website_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    title = soup.find('title')
                    title_text = title.get_text() if title else ''
                    
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    description_text = meta_desc.get('content', '') if meta_desc else ''
                    
                    headings = []
                    for h in soup.find_all(['h1', 'h2', 'h3']):
                        headings.append(h.get_text().strip())
                    
                    context = f"{title_text} {description_text} {' '.join(headings[:5])}"
                    
                except Exception as fetch_error:
                    logger.warning(f"Could not fetch website: {fetch_error}")
                    context = website_url
                
                keyword_result = ai_generator.generate_keywords(
                    product_service=context or "business",
                    website_url=website_url
                )
                
                if keyword_result.get('success') and keyword_result.get('keywords'):
                    keywords = keyword_result['keywords'][:10]
                    logger.info(f"✅ Generated {len(keywords)} keywords")
                
            except Exception as e:
                logger.error(f"Failed to generate keywords: {str(e)}")
        
        if not keywords:
            return jsonify({
                'success': False,
                'error': 'No keywords provided',
                'message': 'يجب توفير كلمات مفتاحية'
            }), 400
        
        # Call Google Ads Forecast API (exactly like google-ads-official example)
        try:
            from google.ads.googleads.client import GoogleAdsClient
            from google.ads.googleads.v21.services.services.google_ads_service.client import GoogleAdsServiceClient
            from google.ads.googleads.v21.services.services.keyword_plan_idea_service.client import KeywordPlanIdeaServiceClient
            from google.ads.googleads.v21.services.types.keyword_plan_idea_service import (
                CampaignToForecast,
                CriterionBidModifier,
                ForecastAdGroup,
                BiddableKeyword,
                GenerateKeywordForecastMetricsRequest,
            )
            from datetime import datetime, timedelta
            
            # Initialize Google Ads client
            yaml_path = os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml')
            client = GoogleAdsClient.load_from_storage(yaml_path)
            client.use_proto_plus = True
            
            googleads_service = client.get_service("GoogleAdsService")
            keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")
            
            # Create campaign to forecast (EXACTLY like google-ads-official)
            campaign_to_forecast = client.get_type("CampaignToForecast")
            campaign_to_forecast.keyword_plan_network = (
                client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            )
            
            # Set bidding strategy (convert USD to micros)
            max_cpc_micros = int(daily_budget_usd * 0.5 * 1_000_000)  # 50% of daily budget as max CPC
            campaign_to_forecast.bidding_strategy.manual_cpc_bidding_strategy.max_cpc_bid_micros = max_cpc_micros
            
            logger.info(f"💰 Max CPC bid: ${max_cpc_micros / 1_000_000:.2f}")
            
            # Add geo targets
            for location_id in location_ids:
                criterion_bid_modifier = client.get_type("CriterionBidModifier")
                criterion_bid_modifier.geo_target_constant = (
                    googleads_service.geo_target_constant_path(location_id)
                )
                campaign_to_forecast.geo_modifiers.append(criterion_bid_modifier)
            
            # Add language
            campaign_to_forecast.language_constants.append(
                googleads_service.language_constant_path(language_id)
            )
            
            # Create forecast ad group with keywords
            forecast_ad_group = client.get_type("ForecastAdGroup")
            
            # Add keywords to forecast ad group
            for kw_text in keywords[:10]:  # Limit to 10 keywords
                biddable_keyword = client.get_type("BiddableKeyword")
                # Distribute budget across keywords
                biddable_keyword.max_cpc_bid_micros = int((daily_budget_usd / len(keywords[:10])) * 1_000_000)
                biddable_keyword.keyword.text = kw_text
                biddable_keyword.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                forecast_ad_group.biddable_keywords.append(biddable_keyword)
            
            campaign_to_forecast.ad_groups.append(forecast_ad_group)
            
            # Prepare forecast request
            request_obj = client.get_type("GenerateKeywordForecastMetricsRequest")
            mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID', '9252466178')
            request_obj.customer_id = mcc_customer_id
            request_obj.campaign = campaign_to_forecast
            
            # Set forecast period (30 days starting tomorrow)
            tomorrow = datetime.now() + timedelta(days=1)
            request_obj.forecast_period.start_date = tomorrow.strftime("%Y-%m-%d")
            thirty_days_from_now = datetime.now() + timedelta(days=30)
            request_obj.forecast_period.end_date = thirty_days_from_now.strftime("%Y-%m-%d")
            
            logger.info(f"📅 Forecast period: {tomorrow.strftime('%Y-%m-%d')} to {thirty_days_from_now.strftime('%Y-%m-%d')}")
            logger.info(f"🚀 Calling Google Ads Forecast Metrics API...")
            
            # Call API
            response = keyword_plan_idea_service.generate_keyword_forecast_metrics(
                request=request_obj
            )
            
            # Extract metrics (EXACTLY like google-ads-official)
            metrics = response.campaign_forecast_metrics
            
            daily_clicks = metrics.clicks
            daily_impressions = metrics.impressions
            daily_avg_cpc_micros = metrics.average_cpc_micros
            daily_avg_cpc = daily_avg_cpc_micros / 1_000_000 if daily_avg_cpc_micros > 0 else 0
            
            # Calculate monthly estimates
            monthly_clicks = int(daily_clicks * 30)
            monthly_impressions = int(daily_impressions * 30)
            monthly_conversions = int(monthly_clicks * 0.03)  # 3% conversion rate
            
            logger.info(f"✅ Forecast Metrics received from Google Ads:")
            logger.info(f"   📊 Daily Impressions: {daily_impressions:,.0f}")
            logger.info(f"   🖱️ Daily Clicks: {daily_clicks:,.0f}")
            logger.info(f"   💰 Daily Avg CPC: ${daily_avg_cpc:.2f}")
            logger.info(f"   📅 Monthly Impressions: {monthly_impressions:,}")
            logger.info(f"   📅 Monthly Clicks: {monthly_clicks:,}")
            logger.info(f"   📅 Monthly Conversions: {monthly_conversions:,}")
            
            return jsonify({
                'success': True,
                'method': 'google_ads_forecast_metrics',
                'daily': {
                    'clicks': int(daily_clicks),
                    'impressions': int(daily_impressions),
                    'avg_cpc': round(daily_avg_cpc, 2)
                },
                'monthly': {
                    'clicks': monthly_clicks,
                    'impressions': monthly_impressions,
                    'conversions': monthly_conversions,
                    'avg_cpc': round(daily_avg_cpc, 2)
                },
                'forecast_period': {
                    'start': tomorrow.strftime('%Y-%m-%d'),
                    'end': thirty_days_from_now.strftime('%Y-%m-%d')
                }
            })
            
        except Exception as api_error:
            logger.error(f"❌ Google Ads Forecast API error: {str(api_error)}")
            import traceback
            logger.error(traceback.format_exc())
            
            return jsonify({
                'success': False,
                'error': str(api_error),
                'message': 'فشل في الحصول على التنبؤات من Google Ads API'
            }), 500
        
    except Exception as e:
        logger.error(f"❌ Error in generate_forecast_metrics: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في إنشاء التنبؤات'
        }), 500

@ai_campaign_creator_bp.route('/analyze-website-and-forecast', methods=['POST', 'OPTIONS'])
def analyze_website_and_forecast():
    """Analyze website URL and generate real forecast (EXACTLY like google-ads-official)"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        website_url = data.get('website_url', '')
        target_locations = data.get('target_locations', [])
        language_id = data.get('language_id', '1019')  # Default: Arabic
        daily_budget_usd = data.get('daily_budget_usd', 15)
        
        if not website_url:
            return jsonify({
                'success': False,
                'error': 'website_url is required',
                'message': 'يجب توفير رابط الموقع'
            }), 400
        
        logger.info(f"📊 Website Analysis & Forecast request")
        logger.info(f"   🌐 Website: {website_url}")
        logger.info(f"   💰 Daily Budget: ${daily_budget_usd}")
        logger.info(f"   📍 Locations: {len(target_locations)}")
        logger.info(f"   🗣️ Language: {language_id}")
        
        # Extract location IDs
        location_ids = []
        for loc in target_locations:
            if isinstance(loc, (str, int)):
                location_ids.append(str(loc))
            elif isinstance(loc, dict):
                if 'location_id' in loc:
                    location_ids.append(str(loc['location_id']))
                elif 'coordinates' in loc and 'countryCode' in loc:
                    country_code = loc.get('countryCode', '')
                    country_map = {
                        'SA': '2682', 'AE': '2784', 'EG': '2818', 'US': '2840',
                        'GB': '2826', 'DE': '2276', 'FR': '2250', 'IT': '2380',
                        'ES': '2724', 'CA': '2124', 'AU': '2036', 'IN': '2356',
                        'JP': '2392', 'BR': '2076', 'MX': '2484', 'AR': '2032',
                        'CO': '2170', 'CL': '2152', 'PE': '2604', 'TR': '2792',
                        'PL': '2616', 'NL': '2528', 'SE': '2752', 'NO': '2578',
                        'DK': '2208', 'FI': '2246', 'CH': '2756', 'AT': '2040',
                        'BE': '2056', 'GR': '2300', 'PT': '2620', 'IE': '2372',
                        'NZ': '2554', 'SG': '2702', 'HK': '2344', 'MY': '2458',
                        'TH': '2764', 'ID': '2360', 'PH': '2608', 'VN': '2704',
                        'ZA': '2710', 'NG': '2566', 'KE': '2404', 'MA': '2504',
                        'TN': '2788', 'DZ': '2012', 'JO': '2400', 'LB': '2422',
                        'IQ': '2368', 'KW': '2414', 'OM': '2512', 'QA': '2634',
                        'BH': '2048'
                    }
                    location_id = country_map.get(country_code)
                    if location_id and location_id not in location_ids:
                        location_ids.append(location_id)
        
        if not location_ids:
            location_ids = ['2682']  # Default: Saudi Arabia
            logger.warning(f"⚠️ No locations provided, using default: Saudi Arabia")
        
        # Step 1: Generate keyword ideas from URL (EXACTLY like google-ads-official)
        try:
            from google.ads.googleads.client import GoogleAdsClient
            from google.ads.googleads.v21.services.services.google_ads_service.client import GoogleAdsServiceClient
            from google.ads.googleads.v21.services.services.keyword_plan_idea_service.client import KeywordPlanIdeaServiceClient
            from google.ads.googleads.v21.enums.types.keyword_plan_network import KeywordPlanNetworkEnum
            from datetime import datetime, timedelta
            
            # Initialize Google Ads client
            yaml_path = os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml')
            client = GoogleAdsClient.load_from_storage(yaml_path)
            client.use_proto_plus = True
            
            googleads_service = client.get_service("GoogleAdsService")
            keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")
            
            # Convert location IDs to resource names (EXACTLY like google-ads-official)
            location_rns = [
                googleads_service.geo_target_constant_path(location_id)
                for location_id in location_ids
            ]
            
            language_rn = googleads_service.language_constant_path(language_id)
            
            # Prepare keyword ideas request with URL seed (EXACTLY like google-ads-official)
            from urllib.parse import urlparse
            
            # Try with www fallback for URL seed
            urls_to_try = [website_url]
            parsed = urlparse(website_url)
            if not parsed.netloc.startswith('www.'):
                www_url = f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}"
                if parsed.query:
                    www_url += f"?{parsed.query}"
                urls_to_try.append(www_url)
            
            keywords_data = []
            keywords_list = []
            
            for url_attempt in urls_to_try:
                try:
                    keyword_ideas_request = client.get_type("GenerateKeywordIdeasRequest")
                    mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID', '9252466178')
                    keyword_ideas_request.customer_id = mcc_customer_id
                    keyword_ideas_request.language = language_rn
                    keyword_ideas_request.geo_target_constants = location_rns
                    keyword_ideas_request.include_adult_keywords = False
                    keyword_ideas_request.keyword_plan_network = (
                        client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH_AND_PARTNERS
                    )
                    
                    # Use URL seed to generate keywords from website
                    keyword_ideas_request.url_seed.url = url_attempt
                    
                    logger.info(f"🚀 Step 1: Generating keyword ideas from URL: {url_attempt}")
                    
                    # Call API to get keyword ideas
                    keyword_ideas = keyword_plan_idea_service.generate_keyword_ideas(
                        request=keyword_ideas_request
                    )
                    
                    # Extract keywords and metrics
                    for idea in keyword_ideas:
                        keyword_text = idea.text
                        metrics = idea.keyword_idea_metrics
                        competition_value = metrics.competition.name if hasattr(metrics.competition, 'name') else 'UNSPECIFIED'
                        
                        keywords_list.append(keyword_text)
                        keywords_data.append({
                            'keyword': keyword_text,
                            'avg_monthly_searches': metrics.avg_monthly_searches,
                            'competition': competition_value
                        })
                        
                        # Limit to top 10 keywords
                        if len(keywords_list) >= 10:
                            break
                    
                    if keywords_list:
                        logger.info(f"✅ Successfully generated keywords from: {url_attempt}")
                        break
                        
                except Exception as url_error:
                    logger.warning(f"⚠️ Failed to generate keywords from {url_attempt}: {url_error}")
                    continue
            
            logger.info(f"✅ Step 1 Complete: Generated {len(keywords_list)} keywords from URL")
            for kw_data in keywords_data[:5]:
                logger.info(f"   🔑 {kw_data['keyword']}: {kw_data['avg_monthly_searches']:,} searches/month, {kw_data['competition']} competition")
            
            # If still no keywords, try with domain name as keyword seed
            if not keywords_list:
                logger.warning("⚠️ No keywords from URL, trying with domain name as seed...")
                try:
                    # Extract domain and convert to keywords
                    domain = parsed.netloc.replace('www.', '')
                    domain_words = domain.split('.')[0].replace('-', ' ').replace('_', ' ')
                    
                    keyword_ideas_request2 = client.get_type("GenerateKeywordIdeasRequest")
                    keyword_ideas_request2.customer_id = mcc_customer_id
                    keyword_ideas_request2.language = language_rn
                    keyword_ideas_request2.geo_target_constants = location_rns
                    keyword_ideas_request2.include_adult_keywords = False
                    keyword_ideas_request2.keyword_plan_network = (
                        client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH_AND_PARTNERS
                    )
                    keyword_ideas_request2.keyword_seed.keywords.append(domain_words)
                    
                    logger.info(f"🔄 Trying keyword seed with: '{domain_words}'")
                    
                    keyword_ideas2 = keyword_plan_idea_service.generate_keyword_ideas(
                        request=keyword_ideas_request2
                    )
                    
                    for idea in keyword_ideas2:
                        keyword_text = idea.text
                        metrics = idea.keyword_idea_metrics
                        competition_value = metrics.competition.name if hasattr(metrics.competition, 'name') else 'UNSPECIFIED'
                        
                        keywords_list.append(keyword_text)
                        keywords_data.append({
                            'keyword': keyword_text,
                            'avg_monthly_searches': metrics.avg_monthly_searches,
                            'competition': competition_value
                        })
                        
                        if len(keywords_list) >= 10:
                            break
                    
                    logger.info(f"✅ Fallback generated {len(keywords_list)} keywords from domain")
                except Exception as fallback_error:
                    logger.error(f"❌ Fallback keyword generation failed: {fallback_error}")
            
            if not keywords_list:
                return jsonify({
                    'success': False,
                    'error': 'No keywords generated from website',
                    'message': 'لم يتم توليد كلمات مفتاحية من الموقع. جرب موقع آخر أو تأكد من صحة الرابط.',
                    'suggestion': 'تأكد من أن الرابط يعمل ويمكن الوصول إليه'
                }), 400
            
            # Step 2: Generate forecast metrics using keywords (EXACTLY like google-ads-official)
            logger.info(f"🚀 Step 2: Generating forecast metrics with {len(keywords_list)} keywords...")
            
            # Create campaign to forecast
            campaign_to_forecast = client.get_type("CampaignToForecast")
            campaign_to_forecast.keyword_plan_network = (
                client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
            )
            
            # Set bidding strategy
            max_cpc_micros = int(daily_budget_usd * 0.5 * 1_000_000)
            campaign_to_forecast.bidding_strategy.manual_cpc_bidding_strategy.max_cpc_bid_micros = max_cpc_micros
            
            # Add geo targets
            for location_id in location_ids:
                criterion_bid_modifier = client.get_type("CriterionBidModifier")
                criterion_bid_modifier.geo_target_constant = (
                    googleads_service.geo_target_constant_path(location_id)
                )
                campaign_to_forecast.geo_modifiers.append(criterion_bid_modifier)
            
            # Add language
            campaign_to_forecast.language_constants.append(
                googleads_service.language_constant_path(language_id)
            )
            
            # Create forecast ad group with keywords
            forecast_ad_group = client.get_type("ForecastAdGroup")
            
            # Add keywords to forecast
            for kw_text in keywords_list:
                biddable_keyword = client.get_type("BiddableKeyword")
                biddable_keyword.max_cpc_bid_micros = int((daily_budget_usd / len(keywords_list)) * 1_000_000)
                biddable_keyword.keyword.text = kw_text
                biddable_keyword.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                forecast_ad_group.biddable_keywords.append(biddable_keyword)
            
            campaign_to_forecast.ad_groups.append(forecast_ad_group)
            
            # Prepare forecast request
            forecast_request = client.get_type("GenerateKeywordForecastMetricsRequest")
            forecast_request.customer_id = mcc_customer_id
            forecast_request.campaign = campaign_to_forecast
            
            # Set forecast period (30 days)
            tomorrow = datetime.now() + timedelta(days=1)
            forecast_request.forecast_period.start_date = tomorrow.strftime("%Y-%m-%d")
            thirty_days_from_now = datetime.now() + timedelta(days=30)
            forecast_request.forecast_period.end_date = thirty_days_from_now.strftime("%Y-%m-%d")
            
            # Call forecast API
            forecast_response = keyword_plan_idea_service.generate_keyword_forecast_metrics(
                request=forecast_request
            )
            
            # Extract forecast metrics
            metrics = forecast_response.campaign_forecast_metrics
            
            daily_clicks = metrics.clicks
            daily_impressions = metrics.impressions
            daily_avg_cpc_micros = metrics.average_cpc_micros
            daily_avg_cpc = daily_avg_cpc_micros / 1_000_000 if daily_avg_cpc_micros > 0 else 0
            
            # Calculate monthly
            monthly_clicks = int(daily_clicks * 30)
            monthly_impressions = int(daily_impressions * 30)
            monthly_conversions = int(monthly_clicks * 0.03)
            
            logger.info(f"✅ Step 2 Complete: Forecast metrics generated")
            logger.info(f"   📊 Monthly Impressions: {monthly_impressions:,}")
            logger.info(f"   🖱️ Monthly Clicks: {monthly_clicks:,}")
            logger.info(f"   ✅ Monthly Conversions: {monthly_conversions:,}")
            logger.info(f"   💰 Avg CPC: ${daily_avg_cpc:.2f}")
            
            return jsonify({
                'success': True,
                'method': 'website_url_analysis_forecast',
                'keywords': keywords_data,
                'forecast': {
                    'daily': {
                        'clicks': int(daily_clicks),
                        'impressions': int(daily_impressions),
                        'avg_cpc': round(daily_avg_cpc, 2)
                    },
                    'monthly': {
                        'clicks': monthly_clicks,
                        'impressions': monthly_impressions,
                        'conversions': monthly_conversions,
                        'avg_cpc': round(daily_avg_cpc, 2)
                    },
                    'forecast_period': {
                        'start': tomorrow.strftime('%Y-%m-%d'),
                        'end': thirty_days_from_now.strftime('%Y-%m-%d')
                    }
                }
            })
            
        except Exception as api_error:
            logger.error(f"❌ Google Ads API error: {str(api_error)}")
            import traceback
            logger.error(traceback.format_exc())
            
            return jsonify({
                'success': False,
                'error': str(api_error),
                'message': 'فشل في تحليل الموقع وإنشاء التنبؤات'
            }), 500
        
    except Exception as e:
        logger.error(f"❌ Error in analyze_website_and_forecast: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'خطأ في تحليل الموقع'
        }), 500

@ai_campaign_creator_bp.route('/detect-website-language', methods=['POST', 'OPTIONS'])
def detect_website_language():
    """Detect the language of a website automatically"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        website_url = data.get('website_url')
        
        if not website_url:
            return jsonify({
                'success': False,
                'error': 'website_url is required'
            }), 400
        
        logger.info(f"🌍 Detecting language for website: {website_url}")
        
        # Fetch website content and detect language
        import requests as http_requests
        from bs4 import BeautifulSoup
        import re
        from urllib.parse import urlparse
        
        # Variables to track results
        detected_lang_code = None
        confidence = 'none'
        text_content = ''
        
        # Fetch the website (20 second timeout)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'ar,en,fr,es,de,it,ja,ko,zh,*;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
        
        # Try to fetch the website - with www fallback
        response = None
        urls_to_try = [website_url]
        
        # Add www variant if not present
        parsed = urlparse(website_url)
        if parsed.netloc and not parsed.netloc.startswith('www.'):
            www_url = f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}"
            if parsed.query:
                www_url += f"?{parsed.query}"
            urls_to_try.append(www_url)
        
        fetch_error_msg = None
        response = None
        for url_attempt in urls_to_try:
            try:
                logger.info(f"🔗 Fetching: {url_attempt}")
                response = http_requests.get(url_attempt, headers=headers, timeout=20, allow_redirects=True)
                if response.status_code == 200:
                    logger.info(f"✅ Website fetched successfully: {response.status_code}")
                    break
            except Exception as fetch_error:
                fetch_error_msg = str(fetch_error)
                logger.warning(f"⚠️ Failed to fetch {url_attempt}: {fetch_error}")
                response = None
                continue
        
        if not response or response.status_code != 200:
            logger.error(f"❌ Could not fetch website from any URL variant")
            return jsonify({
                'success': False,
                'error': 'Could not fetch website',
                'message': f'لم نتمكن من الوصول للموقع لتحليل اللغة. تأكد من صحة الرابط وأن الموقع يعمل.',
                'detected_language': None,
                'language_id': None,
                'confidence': 'none',
                'suggestion': 'جرب إضافة www. للرابط أو تأكد من أن الموقع يعمل',
                'error_details': fetch_error_msg
            }), 400
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Get HTML lang attribute (for reference only)
        html_lang_attr = None
        html_tag = soup.find('html')
        if html_tag and html_tag.get('lang'):
            html_lang_attr = html_tag.get('lang', '').lower().strip().split('-')[0]
            logger.info(f"📋 HTML lang attribute: {html_lang_attr}")
        
        # Remove script, style, and navigation elements for cleaner text
        for element in soup(['script', 'style', 'nav', 'noscript', 'iframe', 'svg', 'header', 'footer']):
            element.decompose()
        
        # Get main content text
        text_content = soup.get_text(separator=' ', strip=True)
        # Clean up the text - remove extra whitespace
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        logger.info(f"📝 Extracted {len(text_content)} chars of text content")
        
        if len(text_content) < 50:
            logger.error(f"❌ Not enough text content to analyze language")
            return jsonify({
                'success': False,
                'error': 'Not enough content',
                'message': 'الموقع لا يحتوي على نص كافٍ لتحليل اللغة',
                'detected_language': None,
                'language_id': None,
                'confidence': 'none'
            }), 400
        
        # ============================================================
        # SMART LANGUAGE DETECTION USING langdetect LIBRARY
        # ============================================================
        detected_lang_code = None
        confidence = 'none'
        
        try:
            from langdetect import detect, detect_langs, LangDetectException
            from langdetect import DetectorFactory
            # Make detection deterministic
            DetectorFactory.seed = 0
            
            # Use multiple text samples for better accuracy
            text_samples = [
                text_content[:2000],  # First part
                text_content[1000:3000] if len(text_content) > 3000 else text_content,  # Middle part
                text_content[-2000:] if len(text_content) > 2000 else text_content  # Last part
            ]
            
            # Get language probabilities
            all_detections = []
            for sample in text_samples:
                if len(sample) > 100:
                    try:
                        langs = detect_langs(sample)
                        for lang_prob in langs:
                            all_detections.append({
                                'lang': str(lang_prob.lang),
                                'prob': lang_prob.prob
                            })
                    except LangDetectException:
                        continue
            
            if all_detections:
                # Aggregate results - sum probabilities for each language
                lang_scores = {}
                for det in all_detections:
                    lang = det['lang']
                    if lang not in lang_scores:
                        lang_scores[lang] = 0
                    lang_scores[lang] += det['prob']
                
                # Get the best language
                best_lang = max(lang_scores, key=lang_scores.get)
                best_score = lang_scores[best_lang] / len(text_samples)  # Average probability
                
                detected_lang_code = best_lang
                confidence = 'high' if best_score > 0.7 else ('medium' if best_score > 0.4 else 'low')
                
                # Log all detected languages with scores
                sorted_langs = sorted(lang_scores.items(), key=lambda x: x[1], reverse=True)
                logger.info(f"🔍 langdetect results:")
                for lang, score in sorted_langs[:5]:
                    avg_score = score / len(text_samples)
                    logger.info(f"   📊 {lang}: {avg_score:.1%}")
                
                logger.info(f"✅ LANGDETECT: {detected_lang_code} (confidence: {confidence}, score: {best_score:.1%})")
            else:
                logger.warning("⚠️ langdetect could not detect language")
                
        except ImportError:
            logger.warning("⚠️ langdetect library not installed, using fallback method")
        except Exception as e:
            logger.warning(f"⚠️ langdetect error: {e}")
        
        # ============================================================
        # FALLBACK: Manual detection for non-Latin scripts
        # ============================================================
        if not detected_lang_code:
            logger.info("🔄 Using fallback manual detection...")
            
            # Check for non-Latin scripts
            arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text_content))
            chinese_chars = len(re.findall(r'[\u4E00-\u9FFF]', text_content))
            japanese_chars = len(re.findall(r'[\u3040-\u309F\u30A0-\u30FF]', text_content))
            korean_chars = len(re.findall(r'[\uAC00-\uD7AF]', text_content))
            cyrillic_chars = len(re.findall(r'[\u0400-\u04FF]', text_content))
            hebrew_chars = len(re.findall(r'[\u0590-\u05FF]', text_content))
            thai_chars = len(re.findall(r'[\u0E00-\u0E7F]', text_content))
            greek_chars = len(re.findall(r'[\u0370-\u03FF]', text_content))
            devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text_content))
            latin_chars = len(re.findall(r'[a-zA-Z]', text_content))
            
            total_chars = len(text_content)
            
            # Find the dominant script
            scripts = {
                'ar': arabic_chars,
                'zh': chinese_chars,
                'ja': japanese_chars,
                'ko': korean_chars,
                'ru': cyrillic_chars,
                'he': hebrew_chars,
                'th': thai_chars,
                'el': greek_chars,
                'hi': devanagari_chars,
                'en': latin_chars
            }
            
            best_script = max(scripts, key=scripts.get)
            best_count = scripts[best_script]
            
            if best_count > 50:
                detected_lang_code = best_script
                confidence = 'medium'
                logger.info(f"✅ FALLBACK: {detected_lang_code} ({best_count} chars)")
        
        # ============================================================
        # SPECIAL HANDLING: Arabic vs Persian
        # ============================================================
        if detected_lang_code in ['ar', 'fa']:
            # Persian-specific patterns
            persian_patterns = [
                r'\bاست\b', r'\bاین\b', r'\bنیست\b', r'\bخود\b', 
                r'\bآن\b', r'\bچه\b', r'\bهست\b', r'\bبرای\b',
                r'\bیک\b', r'\bمی\b', r'\bکه\b', r'\bاز\b'
            ]
            persian_score = sum(len(re.findall(p, text_content)) for p in persian_patterns)
            
            # Arabic-specific patterns (using Arabic-only letters: ة ى ؤ ئ)
            arabic_only_chars = len(re.findall(r'[ةىؤئ]', text_content))
            arabic_patterns = [
                r'\bفي\b', r'\bإلى\b', r'\bعلى\b', r'\bهذا\b', r'\bهذه\b',
                r'\bالتي\b', r'\bالذي\b', r'\bكان\b', r'\bأن\b', r'\bما\b'
            ]
            arabic_word_score = sum(len(re.findall(p, text_content)) for p in arabic_patterns)
            arabic_score = arabic_only_chars * 2 + arabic_word_score
            
            logger.info(f"   🔍 Arabic vs Persian: Arabic={arabic_score}, Persian={persian_score}")
            
            if persian_score > arabic_score and persian_score > 10:
                detected_lang_code = 'fa'
                logger.info(f"✅ PERSIAN confirmed (score: {persian_score} vs Arabic: {arabic_score})")
            else:
                detected_lang_code = 'ar'
                logger.info(f"✅ ARABIC confirmed (score: {arabic_score} vs Persian: {persian_score})")
        
        # ============================================================
        # FINAL VALIDATION
        # ============================================================
        if not detected_lang_code:
            # Last resort: use HTML lang attribute if available
            if html_lang_attr:
                detected_lang_code = html_lang_attr
                confidence = 'low'
                logger.info(f"⚠️ Using HTML lang attribute as last resort: {detected_lang_code}")
            else:
                logger.error(f"❌ Could not determine language")
                return jsonify({
                    'success': False,
                    'error': 'Could not determine language',
                    'message': 'لم نتمكن من تحديد لغة الموقع',
                    'detected_language': None,
                    'language_id': None,
                    'confidence': 'none'
                }), 400
        
        # Log final result
        if html_lang_attr and html_lang_attr != detected_lang_code:
            logger.warning(f"⚠️ HTML lang='{html_lang_attr}' but detected='{detected_lang_code}'")
        logger.info(f"🎯 FINAL LANGUAGE: {detected_lang_code} (confidence: {confidence})")
        
        # Normalize language code (Chinese detection)
        if detected_lang_code == 'zh' and text_content:
            # Check for Traditional Chinese indicators
            traditional_chinese_pattern = r'[\u3400-\u4DBF\u20000-\u2A6DF]'
            if re.search(traditional_chinese_pattern, text_content):
                detected_lang_code = 'zh-TW'
            else:
                detected_lang_code = 'zh-CN'  # Default to Simplified
        
        # Map common language codes to Google Ads language IDs (50+ languages)
        language_map = {
            'ar': '1019',    # Arabic
            'bn': '1056',    # Bengali
            'bg': '1020',    # Bulgarian
            'ca': '1038',    # Catalan
            'zh-CN': '1017', # Chinese (simplified)
            'zh-TW': '1018', # Chinese (traditional)
            'zh': '1017',    # Chinese (default to simplified)
            'cs': '1031',    # Czech
            'da': '1009',    # Danish
            'nl': '1010',    # Dutch
            'en': '1000',    # English
            'et': '1043',    # Estonian
            'fil': '1042',   # Filipino
            'fi': '1011',    # Finnish
            'fr': '1002',    # French
            'de': '1001',    # German
            'el': '1022',    # Greek
            'gu': '1047',    # Gujarati
            'he': '1027',    # Hebrew
            'hi': '1023',    # Hindi
            'hu': '1024',    # Hungarian
            'is': '1026',    # Icelandic
            'id': '1025',    # Indonesian
            'it': '1004',    # Italian
            'ja': '1005',    # Japanese
            'kn': '1048',    # Kannada
            'ko': '1012',    # Korean
            'lv': '1028',    # Latvian
            'lt': '1029',    # Lithuanian
            'ms': '1050',    # Malay
            'ml': '1049',    # Malayalam
            'mr': '1051',    # Marathi
            'no': '1013',    # Norwegian
            'fa': '1064',    # Persian
            'pl': '1030',    # Polish
            'pt': '1014',    # Portuguese
            'ro': '1032',    # Romanian
            'ru': '1015',    # Russian
            'sr': '1033',    # Serbian
            'sk': '1034',    # Slovak
            'sl': '1035',    # Slovenian
            'es': '1003',    # Spanish
            'sv': '1016',    # Swedish
            'ta': '1044',    # Tamil
            'te': '1045',    # Telugu
            'th': '1006',    # Thai
            'tr': '1037',    # Turkish
            'uk': '1036',    # Ukrainian
            'ur': '1041',    # Urdu
            'vi': '1040'     # Vietnamese
        }
        
        language_id = language_map.get(detected_lang_code, '1000')  # Default to English ID
        
        logger.info(f"✅ Final detected language: {detected_lang_code} (ID: {language_id}) - Confidence: {confidence}")
        
        return jsonify({
            'success': True,
            'language_code': detected_lang_code,
            'language_id': language_id,
            'confidence': confidence
        })
            
    except Exception as e:
        logger.error(f"❌ Error detecting website language: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        # Return error - NO GUESSING!
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'حدث خطأ أثناء تحليل لغة الموقع',
            'language_code': None,
            'language_id': None,
            'confidence': 'none'
        }), 500

@ai_campaign_creator_bp.route('/regenerate-ad-element', methods=['POST', 'OPTIONS'])
def regenerate_ad_element():
    """Regenerate a single ad element (headline or description) using AI"""
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        data = request.get_json()
        
        element_type = data.get('element_type')  # 'headline' or 'description'
        website_url = data.get('website_url')
        existing_content = data.get('existing_content', {})
        index = data.get('index', 0)
        target_language = data.get('target_language', 'ar')  # Get language from frontend
        
        if not element_type or not website_url:
            return jsonify({
                'success': False,
                'error': 'element_type and website_url are required'
            }), 400
        
        logger.info(f"🔄 Regenerating {element_type} #{index} for: {website_url} in {target_language}")
        
        # Use AI content generator to create a new element FAST
        result = ai_content_generator.generate_single_ad_element(
            element_type=element_type,
            website_url=website_url,
            existing_content=existing_content,
            keywords_list=existing_content.get('keywords', []),
            language=target_language  # Pass language to AI
        )
        
        if result.get('success') and result.get('text'):
            regenerated_text = result['text']
            logger.info(f"✅ Generated new {element_type}: {regenerated_text}")
            
            return jsonify({
                'success': True,
                'regenerated_text': regenerated_text
            })
        else:
            logger.error(f"❌ Failed to generate {element_type}: {result.get('error')}")
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to generate content')
            }), 500
        
        return jsonify({
            'success': False,
            'error': 'Invalid element_type. Must be "headline" or "description"'
        }), 400
        
    except Exception as e:
        logger.error(f"Error regenerating ad element: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_campaign_creator_bp.route('/launch-campaign', methods=['POST'])
def launch_campaign():
    """Launch campaign - create on Google Ads using SearchCampaignCreator"""
    try:
        logger.info("🚀 ===== LAUNCH CAMPAIGN ENDPOINT CALLED =====")
        import uuid
        from datetime import datetime
        import sys
        import os
        
        data = request.get_json()
        logger.info(f"📥 Received data: {data is not None}")
        
        if not data:
            logger.error("❌ No data received")
            return jsonify({
                'success': False,
                'error': 'Campaign data required'
            }), 400
        
        # Extract campaign data
        customer_id = data.get('customer_id')  # Get customer_id from frontend
        logger.info(f"🎯 Customer ID from frontend: {customer_id}")
        
        if not customer_id:
            logger.error("❌ No customer_id provided")
            return jsonify({
                'success': False,
                'error': 'Customer ID is required'
            }), 400
        
        # Remove dashes from customer_id if present (format: 558-232-7249 -> 5582327249)
        customer_id = customer_id.replace('-', '').strip()
        logger.info(f"📦 Publishing campaign to customer account: {customer_id}")
        
        campaign_name = data.get('campaign_name', f"Campaign {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        campaign_type = data.get('campaign_type', 'SEARCH')
        website_url = data.get('website_url', '')
        daily_budget = float(data.get('daily_budget', 15))
        currency = data.get('currency', 'USD')
        target_locations = data.get('target_locations', [])
        target_languages = data.get('target_languages', ['ar'])
        phone_number = data.get('phone_number')
        cpc_data = data.get('cpc_data')
        generated_content = data.get('generated_content')
        user_id = data.get('user_id', 'test_user')
        
        # استخراج Real CPC من البيانات (من التوقعات)
        real_cpc = data.get('realCPC') or data.get('maxCpcBid')
        if real_cpc:
            logger.info(f"💰 استلام Real CPC من Frontend: ${real_cpc:.2f} USD")
        else:
            logger.warning("⚠️ لم يتم استلام Real CPC من Frontend")
        
        campaign_id = str(uuid.uuid4())
        
        logger.info(f"📥 Received generated_content: {generated_content is not None}")
        if generated_content:
            logger.info(f"   - Headlines: {len(generated_content.get('headlines', []))}")
            logger.info(f"   - Descriptions: {len(generated_content.get('descriptions', []))}")
            logger.info(f"   - Keywords: {len(generated_content.get('keywords', []))}")
        
        logger.info(f"🚀 Campaign launch request: {campaign_name} - Type: {campaign_type} - Budget: {daily_budget}")
        logger.info(f"📍 Raw target locations from frontend: {target_locations}")
        
        # Extract location IDs for Google Ads API using GeoTargetConstantService
        location_ids = []
        proximity_targets = []  # For precise location targeting using coordinates (cities/neighborhoods ONLY)
        
        # Extended country map with Google Ads location IDs
        country_map = {
            'SA': '2682', 'AE': '2784', 'EG': '2818', 'US': '2840',
            'GB': '2826', 'DE': '2276', 'FR': '2250', 'IT': '2380',
            'ES': '2724', 'CA': '2124', 'AU': '2036', 'IN': '2356',
            'JP': '2392', 'KR': '2410', 'CN': '2156', 'BR': '2076',
            'MX': '2484', 'RU': '2643', 'TR': '2792', 'NL': '2528',
            'BE': '2056', 'SE': '2752', 'NO': '2578', 'DK': '2208',
            'FI': '2246', 'PL': '2616', 'AT': '2040', 'CH': '2756',
            'PT': '2620', 'GR': '2300', 'CZ': '2203', 'HU': '2348',
            'IE': '2372', 'NZ': '2554', 'SG': '2702', 'MY': '2458',
            'TH': '2764', 'ID': '2360', 'PH': '2608', 'VN': '2704',
            'PK': '2586', 'BD': '2050', 'NG': '2566', 'ZA': '2710',
            'KE': '2404', 'MA': '2504', 'TN': '2788', 'DZ': '2012',
            'IQ': '2368', 'JO': '2400', 'LB': '2422', 'KW': '2414',
            'QA': '2634', 'BH': '2048', 'OM': '2512', 'YE': '2887'
        }
        
        for loc in target_locations:
            # Handle direct location_id (string/int)
            if isinstance(loc, (str, int)):
                location_id = str(loc)
                if location_id not in location_ids:
                    location_ids.append(location_id)
            
            elif isinstance(loc, dict):
                # First check if it has a direct location_id field
                if 'location_id' in loc:
                    location_id = str(loc['location_id'])
                    if location_id not in location_ids:
                        location_ids.append(location_id)
                    continue
                
                # Get location type and other info
                location_type = loc.get('location_type', '').lower()
                location_name = loc.get('name', '')
                country_code = loc.get('country_code', '') or loc.get('countryCode', '')
                
                logger.info(f"📍 Processing location: {location_name} (type: {location_type}, country: {country_code})")
                
                # CASE 1: COUNTRY - Use location_id for full country targeting
                if location_type == 'country' or location_type == 'دولة':
                    # Try to get country code from the location data
                    if country_code and country_code in country_map:
                        location_id = country_map[country_code]
                        if location_id not in location_ids:
                            location_ids.append(location_id)
                        logger.info(f"✅ Using FULL COUNTRY targeting for: {location_name} (ID: {location_id})")
                    else:
                        # Try to extract country code from place_id or search by name
                        place_id = loc.get('place_id', '')
                        # Check if the name matches a known country
                        country_name_map = {
                            'UK': 'GB', 'United Kingdom': 'GB', 'England': 'GB', 'Britain': 'GB',
                            'USA': 'US', 'United States': 'US', 'America': 'US',
                            'Saudi Arabia': 'SA', 'السعودية': 'SA', 'المملكة العربية السعودية': 'SA',
                            'UAE': 'AE', 'United Arab Emirates': 'AE', 'الإمارات': 'AE',
                            'Egypt': 'EG', 'مصر': 'EG',
                            'Germany': 'DE', 'ألمانيا': 'DE',
                            'France': 'FR', 'فرنسا': 'FR',
                            'Spain': 'ES', 'إسبانيا': 'ES',
                            'Italy': 'IT', 'إيطاليا': 'IT',
                            'Canada': 'CA', 'كندا': 'CA',
                            'Australia': 'AU', 'أستراليا': 'AU',
                            'India': 'IN', 'الهند': 'IN',
                            'Japan': 'JP', 'اليابان': 'JP',
                            'China': 'CN', 'الصين': 'CN',
                            'Brazil': 'BR', 'البرازيل': 'BR',
                            'Mexico': 'MX', 'المكسيك': 'MX',
                            'Russia': 'RU', 'روسيا': 'RU',
                            'Turkey': 'TR', 'تركيا': 'TR',
                            'Netherlands': 'NL', 'هولندا': 'NL',
                            'Kuwait': 'KW', 'الكويت': 'KW',
                            'Qatar': 'QA', 'قطر': 'QA',
                            'Bahrain': 'BH', 'البحرين': 'BH',
                            'Oman': 'OM', 'عمان': 'OM',
                            'Jordan': 'JO', 'الأردن': 'JO',
                            'Lebanon': 'LB', 'لبنان': 'LB',
                            'Iraq': 'IQ', 'العراق': 'IQ',
                            'Morocco': 'MA', 'المغرب': 'MA',
                            'Tunisia': 'TN', 'تونس': 'TN',
                            'Algeria': 'DZ', 'الجزائر': 'DZ',
                        }
                        
                        detected_code = country_name_map.get(location_name)
                        if detected_code and detected_code in country_map:
                            location_id = country_map[detected_code]
                            if location_id not in location_ids:
                                location_ids.append(location_id)
                            logger.info(f"✅ Using FULL COUNTRY targeting for: {location_name} (ID: {location_id})")
                        else:
                            logger.warning(f"⚠️ Could not find country ID for: {location_name}")
                
                # CASE 2: REGION/STATE - Use location_id if available, search if not
                elif location_type in ['region', 'state', 'administrative_area_level_1', 'منطقة', 'ولاية']:
                    # Try to search for region in Google Ads
                    logger.info(f"🔍 Searching for region: {location_name}")
                    # For now, use country-level as fallback
                    if country_code and country_code in country_map:
                        location_id = country_map[country_code]
                        if location_id not in location_ids:
                            location_ids.append(location_id)
                        logger.info(f"   ℹ️ Using country-level targeting as fallback for region: {location_name}")
                        
                # CASE 3: CITY/NEIGHBORHOOD - Use proximity targeting for precise targeting
                elif location_type in ['city', 'locality', 'neighborhood', 'sublocality', 'مدينة', 'حي', 'منطقة فرعية']:
                    if 'coordinates' in loc:
                        coords = loc['coordinates']
                        radius = loc.get('radius', 10)
                        proximity_targets.append({
                            'latitude': coords.get('lat'),
                            'longitude': coords.get('lng'),
                            'radius_km': radius,
                            'name': location_name
                        })
                        logger.info(f"✅ Using PROXIMITY targeting for city/neighborhood: {location_name} (radius: {radius}km)")
                    
                    # Also add country for Keyword Planner compatibility
                    if country_code and country_code in country_map:
                        location_id = country_map[country_code]
                        if location_id not in location_ids:
                            location_ids.append(location_id)
                
                # CASE 4: UNKNOWN TYPE - Check if it looks like a country, otherwise use proximity
                else:
                    # Check if name matches a known country
                    country_name_map = {
                        'UK': 'GB', 'United Kingdom': 'GB', 'England': 'GB',
                        'USA': 'US', 'United States': 'US',
                        'Saudi Arabia': 'SA', 'السعودية': 'SA',
                        'UAE': 'AE', 'الإمارات': 'AE',
                        'Egypt': 'EG', 'مصر': 'EG',
                    }
                    
                    detected_code = country_name_map.get(location_name)
                    if detected_code and detected_code in country_map:
                        # It's a country - use full targeting
                        location_id = country_map[detected_code]
                        if location_id not in location_ids:
                            location_ids.append(location_id)
                        logger.info(f"✅ Detected as COUNTRY, using full targeting for: {location_name} (ID: {location_id})")
                    elif 'coordinates' in loc:
                        # Has coordinates but unknown type - use proximity
                        coords = loc['coordinates']
                        radius = loc.get('radius', 10)
                        proximity_targets.append({
                            'latitude': coords.get('lat'),
                            'longitude': coords.get('lng'),
                            'radius_km': radius,
                            'name': location_name
                        })
                        logger.info(f"⚠️ Unknown location type for: {location_name}, using proximity targeting (radius: {radius}km)")
                        
                        # Add country for compatibility if available
                        if country_code and country_code in country_map:
                            location_id = country_map[country_code]
                            if location_id not in location_ids:
                                location_ids.append(location_id)
        
        # Validate that user has selected locations
        if not location_ids and not proximity_targets:
            logger.error("❌ No locations provided by user - cannot create campaign without location targeting!")
            return jsonify({
                'success': False,
                'error': 'NO_LOCATION_SELECTED',
                'message': 'يجب تحديد موقع جغرافي لإنشاء الحملة. اختر على الأقل مدينة أو دولة واحدة.',
                'customer_id': customer_id,
                'generated_content': generated_content,
                'adCreative': {
                    'headlines': generated_content.get('headlines', []) if generated_content else [],
                    'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                    'keywords': generated_content.get('keywords', []) if generated_content else [],
                    'phoneNumber': phone_number
                }
            }), 400
        
        logger.info(f"📍 Final location targeting:")
        if location_ids:
            logger.info(f"   - Location IDs: {location_ids}")
        if proximity_targets:
            logger.info(f"   - Proximity Targets: {len(proximity_targets)} precise locations")
            for pt in proximity_targets:
                logger.info(f"     • {pt['name']} (radius: {pt['radius_km']}km)")
        
        logger.info(f"📍 Processed location IDs for Google Ads: {location_ids}")
        if proximity_targets:
            logger.info(f"📍 Proximity targets: {proximity_targets}")
        
        # Convert language code to language ID (from user's selection)
        # Only fallback to Arabic if user didn't select (should not happen)
        language_code = target_languages[0] if target_languages else 'ar'
        
        # Comprehensive language map (40+ languages)
        language_map = {
            'ar': '1019',  # Arabic
            'en': '1000',  # English
            'fr': '1002',  # French
            'de': '1001',  # German
            'es': '1003',  # Spanish
            'it': '1004',  # Italian
            'ja': '1005',  # Japanese
            'th': '1006',  # Thai
            'zh-CN': '1017', # Chinese (Simplified)
            'zh-TW': '1018', # Chinese (Traditional)
            'da': '1009',  # Danish
            'nl': '1010',  # Dutch
            'fi': '1011',  # Finnish
            'ko': '1012',  # Korean
            'no': '1013',  # Norwegian
            'pt': '1014',  # Portuguese
            'ru': '1015',  # Russian
            'sv': '1016',  # Swedish
            'bg': '1020',  # Bulgarian
            'el': '1022',  # Greek
            'hi': '1023',  # Hindi
            'hu': '1024',  # Hungarian
            'id': '1025',  # Indonesian
            'is': '1026',  # Icelandic
            'he': '1027',  # Hebrew
            'lv': '1028',  # Latvian
            'lt': '1029',  # Lithuanian
            'pl': '1030',  # Polish
            'cs': '1031',  # Czech
            'ro': '1032',  # Romanian
            'sr': '1033',  # Serbian
            'sk': '1034',  # Slovak
            'sl': '1035',  # Slovenian
            'uk': '1036',  # Ukrainian
            'tr': '1037',  # Turkish
            'ca': '1038',  # Catalan
            'vi': '1040',  # Vietnamese
            'ur': '1041',  # Urdu
            'fil': '1042', # Filipino
            'et': '1043',  # Estonian
            'ta': '1044',  # Tamil
            'te': '1045',  # Telugu
            'gu': '1047',  # Gujarati
            'kn': '1048',  # Kannada
            'ml': '1049',  # Malayalam
            'ms': '1050',  # Malay
            'mr': '1051',  # Marathi
            'bn': '1056',  # Bengali
            'fa': '1064',  # Persian
        }
        
        language_id = language_map.get(language_code, '1019')
        
        if target_languages:
            logger.info(f"🗣️ Using user-selected language: {language_code} → {language_id}")
        else:
            logger.warning(f"⚠️ No language selected by user - using Arabic fallback: ar → 1019")
        
        logger.info(f"📍 Target locations: {location_ids}")
        logger.info(f"🗣️ Target language: {language_code} → {language_id}")
        
        # Create campaign on Google Ads API (REAL API CALL - NO SIMULATION)
        try:
            logger.info(f"🎯 Creating REAL campaign on Google Ads API for account: {customer_id}")
            logger.info(f"✅ Using pre-generated content from frontend")
            
            # Import SearchCampaignCreator for direct campaign creation
            from campaign_types.search_campaign import SearchCampaignCreator
            from google.ads.googleads.client import GoogleAdsClient
            
            # Initialize Google Ads client
            yaml_path = os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml')
            client = GoogleAdsClient.load_from_storage(yaml_path)
            
            # Verify account access and get currency
            logger.info(f"🔍 Verifying account {customer_id} access and fetching currency...")
            try:
                ga_service = client.get_service("GoogleAdsService")
                query = """
                    SELECT
                        customer.id,
                        customer.descriptive_name,
                        customer.currency_code,
                        customer.status
                    FROM customer
                    LIMIT 1
                """
                response = ga_service.search(customer_id=customer_id, query=query)
                
                account_verified = False
                account_name = ""
                account_status = ""
                account_currency_code = "USD"  # Default to USD
                
                for row in response:
                    account_verified = True
                    account_name = row.customer.descriptive_name
                    account_status = row.customer.status.name
                    account_currency_code = row.customer.currency_code
                    logger.info(f"✅ Account found: {account_name}")
                    logger.info(f"   - Status: {account_status}")
                    logger.info(f"   - Currency: {account_currency_code}")
                    
                    if account_status != 'ENABLED':
                        logger.error(f"❌ Account is {account_status}, not ENABLED")
                        return jsonify({
                            'success': False,
                            'error': f'ACCOUNT_NOT_ENABLED',
                            'message': f'الحساب {customer_id} في حالة {account_status}. يجب أن يكون الحساب مفعل (ENABLED) لإنشاء الحملات.',
                            'account_status': account_status,
                            'customer_id': customer_id,
                            'generated_content': generated_content,
                            'adCreative': {
                                'headlines': generated_content.get('headlines', []) if generated_content else [],
                                'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                                'keywords': generated_content.get('keywords', []) if generated_content else [],
                                'phoneNumber': phone_number
                            }
                        }), 400
                    break
                
                if not account_verified:
                    logger.error(f"❌ Could not verify account {customer_id}")
                    return jsonify({
                        'success': False,
                        'error': 'ACCOUNT_ACCESS_DENIED',
                        'message': f'لا يمكن الوصول للحساب {customer_id}. تأكد من ربط الحساب بشكل صحيح.',
                        'customer_id': customer_id,
                        'generated_content': generated_content,
                        'adCreative': {
                            'headlines': generated_content.get('headlines', []) if generated_content else [],
                            'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                            'keywords': generated_content.get('keywords', []) if generated_content else [],
                            'phoneNumber': phone_number
                        }
                    }), 400
                    
            except Exception as verify_error:
                logger.error(f"❌ Account verification failed: {str(verify_error)}")
                error_msg = str(verify_error)
                
                if 'CUSTOMER_NOT_ENABLED' in error_msg or 'not yet enabled' in error_msg:
                    return jsonify({
                        'success': False,
                        'error': 'CUSTOMER_NOT_ENABLED',
                        'message': f'الحساب {customer_id} غير مفعل. يرجى تفعيل الحساب في Google Ads أولاً.',
                        'customer_id': customer_id,
                        'generated_content': generated_content,
                        'adCreative': {
                            'headlines': generated_content.get('headlines', []) if generated_content else [],
                            'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                            'keywords': generated_content.get('keywords', []) if generated_content else [],
                            'phoneNumber': phone_number
                        }
                    }), 400
                else:
                    return jsonify({
                        'success': False,
                        'error': str(verify_error),
                        'message': f'خطأ في التحقق من الحساب: {str(verify_error)}',
                        'customer_id': customer_id,
                        'generated_content': generated_content,
                        'adCreative': {
                            'headlines': generated_content.get('headlines', []) if generated_content else [],
                            'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                            'keywords': generated_content.get('keywords', []) if generated_content else [],
                            'phoneNumber': phone_number
                        }
                    }), 400
            
            # Convert budget from USD to account currency using LIVE exchange rates
            logger.info(f"💰 Converting budget from USD to {account_currency_code}...")
            logger.info(f"   - Budget in USD: ${daily_budget}")
            
            try:
                # استخدام نظام تحويل العملات الحية من GoogleAdsOfficialService
                from services.google_ads_official_service import currency_service
                
                if account_currency_code == 'USD':
                    converted_budget = daily_budget
                    logger.info(f"   - Budget in USD: ${converted_budget:.2f} (no conversion needed)")
                else:
                    # تحويل باستخدام الأسعار الحية
                    converted_budget = currency_service.convert(daily_budget, account_currency_code)
                    logger.info(f"   ✅ Budget converted using LIVE rates: ${daily_budget} USD → {converted_budget:.2f} {account_currency_code}")
                    
                    # عرض سعر الصرف المستخدم
                    exchange_rate = currency_service.get_rate(account_currency_code)
                    logger.info(f"   📊 Exchange Rate: 1 USD = {exchange_rate:.4f} {account_currency_code}")
                    
            except Exception as e:
                # Fallback: في حالة فشل API، استخدام USD
                converted_budget = daily_budget
                logger.error(f"   ❌ Failed to convert currency: {e}")
                logger.warning(f"   ⚠️ Using USD value as fallback: ${converted_budget}")
            
            # Convert Real CPC from USD to account currency (same as budget conversion)
            converted_real_cpc = None
            if real_cpc:
                try:
                    if account_currency_code == 'USD':
                        converted_real_cpc = real_cpc
                        logger.info(f"💰 Real CPC: ${converted_real_cpc:.2f} USD (no conversion needed)")
                    else:
                        converted_real_cpc = currency_service.convert(real_cpc, account_currency_code)
                        logger.info(f"💰 Real CPC converted: ${real_cpc:.2f} USD → {converted_real_cpc:.2f} {account_currency_code}")
                except Exception as e:
                    # Fallback: use USD value
                    converted_real_cpc = real_cpc
                    logger.error(f"   ❌ Failed to convert Real CPC: {e}")
                    logger.warning(f"   ⚠️ Using USD value for CPC: ${converted_real_cpc:.2f}")
            
            # Initialize SearchCampaignCreator
            logger.info(f"🚀 Account verified - proceeding with REAL campaign creation...")
            campaign_creator = SearchCampaignCreator(client, customer_id)
            
            # Prepare ad_copies data from generated content
            ad_copies_data = {
                'headlines': generated_content.get('headlines', [])[:15] if generated_content else [],
                'descriptions': generated_content.get('descriptions', [])[:4] if generated_content else [],
                'keywords': generated_content.get('keywords', [])[:70] if generated_content else [],
                'long_headline': generated_content.get('headlines', [''])[0] if generated_content else '',
                'business_name': 'عملي',
                'images': []
            }
            
            logger.info(f"📦 Creating campaign with:")
            logger.info(f"   - {len(ad_copies_data['headlines'])} headlines")
            logger.info(f"   - {len(ad_copies_data['descriptions'])} descriptions")
            logger.info(f"   - {len(ad_copies_data['keywords'])} keywords")
            
            # Create REAL campaign on Google Ads (NO SIMULATION)
            logger.info(f"🚀 Calling Google Ads API to create campaign...")
            logger.info(f"📍 Location IDs: {location_ids}")
            logger.info(f"📍 Proximity Targets: {len(proximity_targets)} locations")
            logger.info(f"💰 Budget: {converted_budget:.2f} {account_currency_code}")
            try:
                google_campaign_id = campaign_creator.create_search_campaign(
                    campaign_name=campaign_name,
                    daily_budget=converted_budget,  # Use converted budget in account currency
                    target_locations=location_ids if location_ids else [],
                    target_language=language_id,
                    website_url=website_url,
                    keywords=ad_copies_data['keywords'],
                    ad_copies=ad_copies_data,
                    proximity_targets=proximity_targets,
                    real_cpc=converted_real_cpc  # Pass CONVERTED Real CPC in account currency
                )
                
                if google_campaign_id:
                    logger.info(f"✅ REAL Campaign created on Google Ads with ID: {google_campaign_id}")
                    result = {
                        'success': True,
                        'google_campaign_id': google_campaign_id,
                        'google_ad_group_id': f'adgroup_{google_campaign_id}',
                        'message': 'Campaign created successfully on Google Ads',
                        'customer_id': customer_id
                    }
                else:
                    logger.error("❌ Campaign creation failed - no ID returned")
                    result = {
                        'success': False,
                        'error': 'No campaign ID returned',
                        'message': 'فشل إنشاء الحملة - لم يتم إرجاع معرف الحملة'
                    }
                    
            except Exception as campaign_error:
                error_msg = str(campaign_error)
                logger.error(f"❌ Campaign creation exception: {error_msg}")
                import traceback
                logger.error(traceback.format_exc())
                
                result = {
                    'success': False,
                    'error': error_msg,
                    'message': f'خطأ في إنشاء الحملة: {error_msg}'
                }
            
            logger.info(f"✅ Campaign creation result: {result.get('success')}")
            
            if result.get('success'):
                logger.info(f"✅ Campaign created on Google Ads successfully!")
                logger.info(f"   Google Campaign ID: {result.get('google_campaign_id')}")
                
                # Prepare response
                response_data = {
                    'success': True,
                    'campaign_id': campaign_id,
                    'campaign_name': campaign_name,
                    'campaign_type': campaign_type,
                    'status': 'ACTIVE',
                    'google_campaign_created': True,
                    'google_campaign_id': result.get('google_campaign_id'),
                    'google_ad_group_id': result.get('google_ad_group_id'),
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
                    'message': '🎉 Campaign created successfully on Google Ads!'
                }
                
                logger.info(f"✅ Campaign launch completed: {campaign_id}")
                logger.info(f"📤 Response includes:")
                logger.info(f"   - Google Campaign ID: {response_data['google_campaign_id']}")
                logger.info(f"   - Ad Creative: {len(response_data['adCreative']['headlines'])} headlines, {len(response_data['adCreative']['descriptions'])} descriptions, {len(response_data['adCreative']['keywords'])} keywords")
                
                return jsonify(response_data), 201
            else:
                error_msg = result.get('error', 'Unknown error')
                logger.error(f"❌ Failed to create campaign on Google Ads: {error_msg}")
                
                # Check if it's an account access error
                user_friendly_msg = 'Failed to create campaign on Google Ads'
                if 'not yet enabled' in error_msg or 'has been deactivated' in error_msg or 'not accessible' in error_msg:
                    user_friendly_msg = f'Account {customer_id} is not enabled or deactivated. Please activate it in Google Ads or choose a different account.'
                
                # Return error but with the generated content
                return jsonify({
                    'success': False,
                    'error': error_msg,
                    'message': user_friendly_msg,
                    'customer_id': customer_id,
                    'generated_content': generated_content,
                    'adCreative': {
                        'headlines': generated_content.get('headlines', []) if generated_content else [],
                        'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                        'keywords': generated_content.get('keywords', []) if generated_content else (cpc_data.get('keywords', []) if cpc_data else []),
                        'phoneNumber': phone_number
                    }
                }), 400
                
        except Exception as e:
            logger.error(f"❌ Error creating campaign on Google Ads: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            
            # Return error but with the generated content
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Error occurred while creating campaign on Google Ads',
                'generated_content': generated_content,
                'adCreative': {
                    'headlines': generated_content.get('headlines', []) if generated_content else [],
                    'descriptions': generated_content.get('descriptions', []) if generated_content else [],
                    'keywords': generated_content.get('keywords', []) if generated_content else (cpc_data.get('keywords', []) if cpc_data else []),
                    'phoneNumber': phone_number
                }
            }), 500
        
    except Exception as e:
        logger.error(f"Error launching campaign: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while launching campaign'
        }), 500

@ai_campaign_creator_bp.route('/get-account-currency', methods=['POST'])
def get_account_currency():
    """Get the currency of an advertising account"""
    try:
        data = request.get_json()
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return jsonify({
                'success': False,
                'error': 'customer_id is required'
            }), 400
        
        # استيراد خدمة Google Ads
        from services.google_ads_official_service import GoogleAdsOfficialService
        
        google_ads_service = GoogleAdsOfficialService()
        
        # جلب عملة الحساب
        currency_code = google_ads_service.get_account_currency(customer_id)
        
        if not currency_code:
            return jsonify({
                'success': False,
                'error': 'Could not retrieve account currency',
                'message': 'فشل في جلب عملة الحساب'
            }), 404
        
        logger.info(f"✅ Currency for account {customer_id}: {currency_code}")
        
        return jsonify({
            'success': True,
            'currency_code': currency_code,
            'customer_id': customer_id
        })
        
    except Exception as e:
        logger.error(f"Error getting account currency: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while getting account currency'
        }), 500

@ai_campaign_creator_bp.route('/get-live-exchange-rates', methods=['GET'])
def get_live_exchange_rates():
    """Get live currency exchange rates from global API"""
    try:
        # استيراد خدمة العملات
        from services.google_ads_official_service import currency_service
        
        # جلب الأسعار الحية
        rates = currency_service.get_live_rates()
        
        # معلومات إضافية
        last_update = currency_service.last_update
        cache_age_minutes = None
        if last_update:
            cache_age_minutes = int((datetime.now() - last_update).total_seconds() / 60)
        
        logger.info(f"✅ تم جلب أسعار {len(rates)} عملة")
        
        return jsonify({
            'success': True,
            'rates': rates,
            'base_currency': 'USD',
            'last_update': last_update.isoformat() if last_update else None,
            'cache_age_minutes': cache_age_minutes,
            'total_currencies': len(rates),
            'source': 'exchangerate-api.com (live)',
            'next_update_in_minutes': 60 - cache_age_minutes if cache_age_minutes else 60
        })
        
    except Exception as e:
        logger.error(f"Error getting live exchange rates: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while getting live exchange rates'
        }), 500

@ai_campaign_creator_bp.route('/convert-currency', methods=['POST'])
def convert_currency_endpoint():
    """Convert amount from USD to target currency using live rates"""
    try:
        data = request.get_json()
        amount_usd = data.get('amount_usd')
        target_currency = data.get('target_currency')
        
        if amount_usd is None or not target_currency:
            return jsonify({
                'success': False,
                'error': 'amount_usd and target_currency are required'
            }), 400
        
        # استيراد خدمة العملات
        from services.google_ads_official_service import currency_service
        
        # تحويل المبلغ
        converted_amount = currency_service.convert(float(amount_usd), target_currency)
        exchange_rate = currency_service.get_rate(target_currency)
        
        logger.info(f"✅ تحويل ${amount_usd} USD → {converted_amount:.2f} {target_currency}")
        
        return jsonify({
            'success': True,
            'amount_usd': amount_usd,
            'target_currency': target_currency,
            'converted_amount': round(converted_amount, 2),
            'exchange_rate': exchange_rate,
            'calculation': f'{amount_usd} × {exchange_rate} = {converted_amount:.2f}'
        })
        
    except Exception as e:
        logger.error(f"Error converting currency: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error occurred while converting currency'
        }), 500