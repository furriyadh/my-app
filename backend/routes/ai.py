"""
مسارات الذكاء الاصطناعي - AI Routes
Google Ads AI Platform - AI API Routes
"""

from flask import Blueprint, request, jsonify, session
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

from services.ai_processor import AIProcessor
from services.website_analyzer import WebsiteAnalyzer
from services.campaign_builder import CampaignBuilder
from utils.validators import validate_url
from utils.helpers import generate_analysis_id, sanitize_text
from utils.helpers import sanitize_text
from services.ai_processor import AIProcessor
from utils.database import DatabaseManager
from routes.auth import login_required

# إنشاء Blueprint
ai_bp = Blueprint('ai', __name__)
# إعداد الخدمات
ai_processor = AIProcessor()
website_analyzer = WebsiteAnalyzer()
campaign_builder = CampaignBuilder()
db_manager = DatabaseManager()
logger = logging.getLogger(__name__)

@ai_bp.route('/analyze-keywords', methods=['POST'])
@login_required
def analyze_keywords():
    """تحليل الكلمات المفتاحية بالذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        # التحقق من البيانات المطلوبة
        business_info = {
            'business_name': sanitize_text(data.get('business_name', '')),
            'business_type': sanitize_text(data.get('business_type', '')),
            'services': sanitize_text(data.get('services', '')),
            'location': sanitize_text(data.get('location', '')),
            'target_audience': sanitize_text(data.get('target_audience', ''))
        }
        
        if not business_info['business_name'] or not business_info['business_type']:
            return jsonify({
                'success': False,
                'message': 'اسم النشاط ونوع النشاط مطلوبان',
                'error_code': 'MISSING_REQUIRED_DATA'
            }), 400
        
        # تحليل الكلمات المفتاحية
        keywords_analysis = ai_processor.analyze_keywords(business_info)
        
        # حفظ النتائج في قاعدة البيانات
        user_id = session.get('user_id')
        analysis_id = db_manager.save_keywords_analysis(user_id, business_info, keywords_analysis)
        
        return jsonify({
            'success': True,
            'message': 'تم تحليل الكلمات المفتاحية بنجاح',
            'analysis_id': analysis_id,
            'keywords': keywords_analysis
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الكلمات المفتاحية: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحليل الكلمات المفتاحية',
            'error_code': 'KEYWORDS_ANALYSIS_ERROR'
        }), 500

@ai_bp.route('/generate-ad-copy', methods=['POST'])
@login_required
def generate_ad_copy():
    """إنشاء النسخ الإعلانية بالذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        # التحقق من البيانات المطلوبة
        campaign_info = {
            'product_name': sanitize_text(data.get('product_name', '')),
            'benefits': sanitize_text(data.get('benefits', '')),
            'offer': sanitize_text(data.get('offer', '')),
            'target_audience': sanitize_text(data.get('target_audience', '')),
            'keywords': data.get('keywords', [])
        }
        
        if not campaign_info['product_name']:
            return jsonify({
                'success': False,
                'message': 'اسم المنتج/الخدمة مطلوب',
                'error_code': 'MISSING_PRODUCT_NAME'
            }), 400
        
        # إنشاء النسخ الإعلانية
        ad_copy = ai_processor.generate_ad_copy(campaign_info)
        
        # حفظ النتائج في قاعدة البيانات
        user_id = session.get('user_id')
        copy_id = db_manager.save_ad_copy(user_id, campaign_info, ad_copy)
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء النسخ الإعلانية بنجاح',
            'copy_id': copy_id,
            'ad_copy': ad_copy
        })
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء النسخ الإعلانية: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في إنشاء النسخ الإعلانية',
            'error_code': 'AD_COPY_GENERATION_ERROR'
        }), 500

@ai_bp.route('/analyze-website', methods=['POST'])
@login_required
def analyze_website():
    """تحليل الموقع الإلكتروني"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        website_url = data.get('url', '').strip()
        
        if not website_url:
            return jsonify({
                'success': False,
                'message': 'رابط الموقع مطلوب',
                'error_code': 'MISSING_URL'
            }), 400
        
        # التحقق من صحة الرابط
        is_valid_url, url_message = validate_url(website_url)
        if not is_valid_url:
            return jsonify({
                'success': False,
                'message': f'رابط الموقع: {url_message}',
                'error_code': 'INVALID_URL'
            }), 400
        
        # تحليل الموقع
        analysis_result = website_analyzer.analyze_website(website_url)
        
        if not analysis_result['success']:
            return jsonify({
                'success': False,
                'message': analysis_result['message'],
                'error_code': 'WEBSITE_ANALYSIS_FAILED'
            }), 400
        
        # حفظ النتائج في قاعدة البيانات
        user_id = session.get('user_id')
        analysis_id = db_manager.save_website_analysis(user_id, website_url, analysis_result['data'])
        
        return jsonify({
            'success': True,
            'message': 'تم تحليل الموقع بنجاح',
            'analysis_id': analysis_id,
            'analysis': analysis_result['data']
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الموقع: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحليل الموقع',
            'error_code': 'WEBSITE_ANALYSIS_ERROR'
        }), 500

@ai_bp.route('/analyze-performance', methods=['POST'])
@login_required
def analyze_performance():
    """تحليل أداء الحملة بالذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        campaign_id = data.get('campaign_id')
        
        if not campaign_id:
            return jsonify({
                'success': False,
                'message': 'معرف الحملة مطلوب',
                'error_code': 'MISSING_CAMPAIGN_ID'
            }), 400
        
        # التحقق من وجود الحملة
        user_id = session.get('user_id')
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        
        if not campaign:
            return jsonify({
                'success': False,
                'message': 'الحملة غير موجودة',
                'error_code': 'CAMPAIGN_NOT_FOUND'
            }), 404
        
        # الحصول على بيانات الأداء
        performance_data = db_manager.get_campaign_performance(campaign_id)
        
        # تحليل الأداء بالذكاء الاصطناعي
        ai_analysis = ai_processor.analyze_campaign_performance(performance_data)
        
        # حفظ النتائج في قاعدة البيانات
        analysis_id = db_manager.save_performance_analysis(user_id, campaign_id, ai_analysis)
        
        return jsonify({
            'success': True,
            'message': 'تم تحليل الأداء بنجاح',
            'analysis_id': analysis_id,
            'analysis': ai_analysis
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الأداء: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحليل الأداء',
            'error_code': 'PERFORMANCE_ANALYSIS_ERROR'
        }), 500

@ai_bp.route('/suggest-bid-optimization', methods=['POST'])
@login_required
def suggest_bid_optimization():
    """اقتراح تحسينات المزايدة"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        campaign_id = data.get('campaign_id')
        
        if not campaign_id:
            return jsonify({
                'success': False,
                'message': 'معرف الحملة مطلوب',
                'error_code': 'MISSING_CAMPAIGN_ID'
            }), 400
        
        # التحقق من وجود الحملة
        user_id = session.get('user_id')
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        
        if not campaign:
            return jsonify({
                'success': False,
                'message': 'الحملة غير موجودة',
                'error_code': 'CAMPAIGN_NOT_FOUND'
            }), 404
        
        # الحصول على بيانات الكلمات المفتاحية
        keywords_data = db_manager.get_campaign_keywords_performance(campaign_id)
        
        # اقتراح تحسينات المزايدة
        bid_suggestions = ai_processor.suggest_bid_optimization(keywords_data)
        
        # حفظ النتائج في قاعدة البيانات
        suggestions_id = db_manager.save_bid_suggestions(user_id, campaign_id, bid_suggestions)
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء اقتراحات المزايدة بنجاح',
            'suggestions_id': suggestions_id,
            'suggestions': bid_suggestions
        })
        
    except Exception as e:
        logger.error(f"خطأ في اقتراح تحسينات المزايدة: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في اقتراح تحسينات المزايدة',
            'error_code': 'BID_OPTIMIZATION_ERROR'
        }), 500

@ai_bp.route('/generate-landing-page-suggestions', methods=['POST'])
@login_required
def generate_landing_page_suggestions():
    """إنشاء اقتراحات لصفحة الهبوط"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        # التحقق من البيانات المطلوبة
        campaign_info = {
            'product_name': sanitize_text(data.get('product_name', '')),
            'target_audience': sanitize_text(data.get('target_audience', '')),
            'campaign_goal': sanitize_text(data.get('campaign_goal', '')),
            'keywords': data.get('keywords', [])
        }
        
        if not campaign_info['product_name']:
            return jsonify({
                'success': False,
                'message': 'اسم المنتج/الخدمة مطلوب',
                'error_code': 'MISSING_PRODUCT_NAME'
            }), 400
        
        # إنشاء اقتراحات صفحة الهبوط
        landing_page_suggestions = ai_processor.generate_landing_page_suggestions(campaign_info)
        
        # حفظ النتائج في قاعدة البيانات
        user_id = session.get('user_id')
        suggestions_id = db_manager.save_landing_page_suggestions(user_id, campaign_info, landing_page_suggestions)
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء اقتراحات صفحة الهبوط بنجاح',
            'suggestions_id': suggestions_id,
            'suggestions': landing_page_suggestions
        })
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء اقتراحات صفحة الهبوط: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في إنشاء اقتراحات صفحة الهبوط',
            'error_code': 'LANDING_PAGE_SUGGESTIONS_ERROR'
        }), 500

@ai_bp.route('/build-smart-campaign', methods=['POST'])
@login_required
def build_smart_campaign():
    """بناء حملة ذكية بالكامل"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'بيانات غير صحيحة',
                'error_code': 'INVALID_DATA'
            }), 400
        
        # التحقق من البيانات المطلوبة
        business_info = {
            'business_name': sanitize_text(data.get('business_name', '')),
            'business_type': sanitize_text(data.get('business_type', '')),
            'website_url': data.get('website_url', '').strip(),
            'budget': data.get('budget'),
            'target_location': sanitize_text(data.get('target_location', '')),
            'campaign_goal': sanitize_text(data.get('campaign_goal', ''))
        }
        
        if not all([business_info['business_name'], business_info['business_type'], business_info['budget']]):
            return jsonify({
                'success': False,
                'message': 'اسم النشاط ونوع النشاط والميزانية مطلوبة',
                'error_code': 'MISSING_REQUIRED_DATA'
            }), 400
        
        # التحقق من الرابط إذا تم توفيره
        if business_info['website_url']:
            is_valid_url, url_message = validate_url(business_info['website_url'])
            if not is_valid_url:
                return jsonify({
                    'success': False,
                    'message': f'رابط الموقع: {url_message}',
                    'error_code': 'INVALID_URL'
                }), 400
        
        # بناء الحملة الذكية
        user_id = session.get('user_id')
        business_info['user_id'] = user_id
        
        smart_campaign = campaign_builder.build_smart_campaign(business_info)
        
        if not smart_campaign['success']:
            return jsonify({
                'success': False,
                'message': smart_campaign['message'],
                'error_code': 'SMART_CAMPAIGN_BUILD_ERROR'
            }), 400
        
        # حفظ الحملة في قاعدة البيانات
        campaign_id = db_manager.create_smart_campaign(smart_campaign['campaign'])
        
        return jsonify({
            'success': True,
            'message': 'تم بناء الحملة الذكية بنجاح',
            'campaign_id': campaign_id,
            'campaign': smart_campaign['campaign']
        })
        
    except Exception as e:
        logger.error(f"خطأ في بناء الحملة الذكية: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في بناء الحملة الذكية',
            'error_code': 'SMART_CAMPAIGN_ERROR' 
        }), 500

@ai_bp.route('/history', methods=['GET'])
@login_required
def get_ai_history():
    """الحصول على تاريخ استخدام الذكاء الاصطناعي"""
    try:
        user_id = session.get('user_id')
        
        # معاملات الاستعلام
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        analysis_type = request.args.get('type')  # keywords, ad_copy, performance, etc.
        
        # الحصول على التاريخ
        history = db_manager.get_ai_analysis_history(
            user_id=user_id,
            page=page,
            limit=limit,
            analysis_type=analysis_type
        )
        
        return jsonify({
            'success': True,
            'history': history['data'],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': history['total'],
                'pages': history['pages']
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على تاريخ الذكاء الاصطناعي: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على التاريخ',
            'error_code': 'AI_HISTORY_ERROR'
        }), 500

@ai_bp.route('/analysis/<int:analysis_id>', methods=['GET'])
@login_required
def get_analysis_result(analysis_id):
    """الحصول على نتيجة تحليل محددة"""
    try:
        user_id = session.get('user_id')
        
        # الحصول على نتيجة التحليل
        analysis = db_manager.get_ai_analysis_by_id(analysis_id, user_id)
        
        if not analysis:
            return jsonify({
                'success': False,
                'message': 'التحليل غير موجود',
                'error_code': 'ANALYSIS_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على نتيجة التحليل: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على نتيجة التحليل',
            'error_code': 'ANALYSIS_FETCH_ERROR'
        }), 500

@ai_bp.route('/usage-stats', methods=['GET'])
@login_required
def get_usage_stats():
    """الحصول على إحصائيات استخدام الذكاء الاصطناعي"""
    try:
        user_id = session.get('user_id')
        
        # الحصول على الإحصائيات
        stats = db_manager.get_ai_usage_stats(user_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على إحصائيات الاستخدام: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في الحصول على الإحصائيات',
            'error_code': 'USAGE_STATS_ERROR'
        }), 500

