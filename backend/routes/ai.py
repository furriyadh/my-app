"""
مسارات الذكاء الاصطناعي - AI Routes
Google Ads AI Platform - AI API Routes
"""

from flask import Blueprint, request, jsonify, g
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# استيرادات مُصححة - إزالة backend من المسارات
try:
    from services.ai_processor import AIProcessor
except ImportError:
    try:
        from ..services.ai_processor import AIProcessor
    except ImportError:
        AIProcessor = None

try:
    from services.website_analyzer import WebsiteAnalyzer
except ImportError:
    try:
        from ..services.website_analyzer import WebsiteAnalyzer
    except ImportError:
        WebsiteAnalyzer = None

try:
    from services.campaign_builder import CampaignBuilder
except ImportError:
    try:
        from ..services.campaign_builder import CampaignBuilder
    except ImportError:
        CampaignBuilder = None

try:
    from utils.validators import validate_url
except ImportError:
    try:
        from ..utils.validators import validate_url
    except ImportError:
        def validate_url(url):
            if not url or not url.startswith(('http://', 'https://')):
                return False, "رابط غير صحيح"
            return True, "صحيح"

try:
    from utils.helpers import generate_analysis_id, sanitize_text
except ImportError:
    try:
        from ..utils.helpers import generate_analysis_id, sanitize_text
    except ImportError:
        import uuid
        def generate_analysis_id(): return str(uuid.uuid4())
        def sanitize_text(text): return str(text).strip()

try:
    from utils.database import DatabaseManager
except ImportError:
    try:
        from ..utils.database import DatabaseManager
    except ImportError:
        DatabaseManager = None

try:
    from auth.auth_decorators import jwt_required_with_identity
except ImportError:
    try:
        from ..auth.auth_decorators import jwt_required_with_identity
    except ImportError:
        # decorator احتياطي
        def jwt_required_with_identity(f):
            def wrapper(*args, **kwargs):
                return f(*args, **kwargs)
            return wrapper

# إنشاء Blueprint
ai_bp = Blueprint("ai", __name__)

# إعداد الخدمات مع معالجة آمنة للأخطاء
try:
    ai_processor = AIProcessor() if AIProcessor else None
except Exception as e:
    ai_processor = None
    logging.warning(f"فشل في تحميل AIProcessor: {e}")

try:
    website_analyzer = WebsiteAnalyzer() if WebsiteAnalyzer else None
except Exception as e:
    website_analyzer = None
    logging.warning(f"فشل في تحميل WebsiteAnalyzer: {e}")

try:
    campaign_builder = CampaignBuilder() if CampaignBuilder else None
except Exception as e:
    campaign_builder = None
    logging.warning(f"فشل في تحميل CampaignBuilder: {e}")

try:
    db_manager = DatabaseManager() if DatabaseManager else None
except Exception as e:
    db_manager = None
    logging.warning(f"فشل في تحميل DatabaseManager: {e}")

logger = logging.getLogger(__name__)

@ai_bp.route("/analyze-keywords", methods=["POST"])
def analyze_keywords():
    """تحليل الكلمات المفتاحية باستخدام الذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data or 'keywords' not in data:
            return jsonify({
                'success': False,
                'message': 'قائمة الكلمات المفتاحية مطلوبة'
            }), 400
        
        keywords = data['keywords']
        if not isinstance(keywords, list) or len(keywords) == 0:
            return jsonify({
                'success': False,
                'message': 'يجب أن تكون الكلمات المفتاحية قائمة غير فارغة'
            }), 400
        
        # تحليل الكلمات المفتاحية
        if ai_processor:
            analysis_result = ai_processor.analyze_keywords(keywords)
        else:
            # نتيجة تجريبية
            analysis_result = {
                'analyzed_keywords': [
                    {
                        'keyword': kw,
                        'search_volume': 1000 + (i * 100),
                        'competition': 'MEDIUM',
                        'suggested_bid': 1.5 + (i * 0.1),
                        'relevance_score': 85 - (i * 2),
                        'related_keywords': [f"{kw} {suffix}" for suffix in ['مجاني', 'أفضل', 'رخيص']]
                    } for i, kw in enumerate(keywords[:5])
                ],
                'total_keywords': len(keywords),
                'analysis_id': generate_analysis_id()
            }
        
        return jsonify({
            'success': True,
            'message': 'تم تحليل الكلمات المفتاحية بنجاح',
            'analysis': analysis_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الكلمات المفتاحية: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحليل الكلمات المفتاحية',
            'error': str(e)
        }), 500

@ai_bp.route("/analyze-website", methods=["POST"])
def analyze_website():
    """تحليل موقع ويب لاستخراج معلومات للحملة الإعلانية"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'message': 'رابط الموقع مطلوب'
            }), 400
        
        url = data['url'].strip()
        
        # التحقق من صحة الرابط
        is_valid, message = validate_url(url)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        # تحليل الموقع
        if website_analyzer:
            analysis_result = website_analyzer.analyze_website(url)
        else:
            # نتيجة تجريبية
            analysis_result = {
                'url': url,
                'title': 'موقع تجريبي',
                'description': 'وصف تجريبي للموقع',
                'keywords': ['كلمة1', 'كلمة2', 'كلمة3'],
                'content_analysis': {
                    'main_topics': ['موضوع1', 'موضوع2'],
                    'target_audience': 'الجمهور المستهدف',
                    'business_type': 'نوع العمل'
                },
                'seo_analysis': {
                    'meta_title': 'عنوان الصفحة',
                    'meta_description': 'وصف الصفحة',
                    'h1_tags': ['عنوان رئيسي'],
                    'images_count': 5,
                    'links_count': 10
                },
                'suggested_campaigns': [
                    {
                        'name': 'حملة مقترحة 1',
                        'type': 'SEARCH',
                        'keywords': ['كلمة1', 'كلمة2'],
                        'budget_suggestion': 500
                    }
                ],
                'analysis_id': generate_analysis_id()
            }
        
        return jsonify({
            'success': True,
            'message': 'تم تحليل الموقع بنجاح',
            'analysis': analysis_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحليل الموقع: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في تحليل الموقع',
            'error': str(e)
        }), 500

@ai_bp.route("/generate-ads", methods=["POST"])
def generate_ads():
    """إنشاء إعلانات باستخدام الذكاء الاصطناعي"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'البيانات مطلوبة'
            }), 400
        
        # استخراج البيانات
        business_info = data.get('business_info', {})
        target_audience = data.get('target_audience', {})
        campaign_goals = data.get('campaign_goals', [])
        
        # إنشاء الإعلانات
        if ai_processor:
            ads_result = ai_processor.generate_ads(business_info, target_audience, campaign_goals)
        else:
            # نتيجة تجريبية
            ads_result = {
                'generated_ads': [
                    {
                        'headline1': 'عنوان إعلان 1',
                        'headline2': 'عنوان إعلان 2',
                        'description': 'وصف الإعلان التجريبي',
                        'display_url': 'www.example.com',
                        'final_url': 'https://www.example.com',
                        'ad_type': 'TEXT_AD',
                        'performance_prediction': {
                            'expected_ctr': 2.5,
                            'quality_score': 8,
                            'relevance_score': 85
                        }
                    }
                ],
                'total_ads': 1,
                'generation_id': generate_analysis_id()
            }
        
        return jsonify({
            'success': True,
            'message': 'تم إنشاء الإعلانات بنجاح',
            'ads': ads_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء الإعلانات: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'حدث خطأ في إنشاء الإعلانات',
            'error': str(e)
        }), 500

@ai_bp.route('/status', methods=['GET'])
def ai_status():
    """حالة خدمة الذكاء الاصطناعي"""
    return jsonify({
        'service': 'AI API',
        'status': 'active',
        'version': '1.0.0',
        'services_status': {
            'ai_processor': ai_processor is not None,
            'website_analyzer': website_analyzer is not None,
            'campaign_builder': campaign_builder is not None,
            'database_manager': db_manager is not None
        },
        'timestamp': datetime.now().isoformat()
    })

# تسجيل معلومات التحميل
logger.info("✅ تم تحميل AI Blueprint بنجاح")
logger.info(f"📊 الخدمات المتاحة: {sum([ai_processor is not None, website_analyzer is not None, campaign_builder is not None, db_manager is not None])}/4")

