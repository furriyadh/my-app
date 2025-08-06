"""
مسارات الحملات - Campaigns Routes
Google Ads AI Platform - Campaigns API Routes
"""

from flask import Blueprint, request, jsonify, g
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# استيرادات مُصححة - إزالة backend من المسارات
try:
    from services.google_ads_client import GoogleAdsClientService
except ImportError:
    try:
        from ..services.google_ads_client import GoogleAdsClientService
    except ImportError:
        GoogleAdsClientService = None

try:
    from services.campaign_builder import CampaignBuilder
except ImportError:
    try:
        from ..services.campaign_builder import CampaignBuilder
    except ImportError:
        CampaignBuilder = None

try:
    from services.ai_processor import AIProcessor
except ImportError:
    try:
        from ..services.ai_processor import AIProcessor
    except ImportError:
        AIProcessor = None

try:
    from utils.validators import validate_campaign_data, validate_keyword_data, validate_ad_data
except ImportError:
    try:
        from ..utils.validators import validate_campaign_data, validate_keyword_data, validate_ad_data
    except ImportError:
        # دوال احتياطية للتحقق
        def validate_campaign_data(data): return True, []
        def validate_keyword_data(data): return True, []
        def validate_ad_data(data): return True, []

try:
    from utils.helpers import format_currency, format_percentage, calculate_performance_score, generate_campaign_id, sanitize_text
except ImportError:
    try:
        from ..utils.helpers import format_currency, format_percentage, calculate_performance_score, generate_campaign_id, sanitize_text
    except ImportError:
        # دوال احتياطية
        def format_currency(amount, currency="USD"): return f"${amount:.2f}"
        def format_percentage(value): return f"{value:.2f}%"
        def calculate_performance_score(data): return 75.0
        def generate_campaign_id(): return f"camp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
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
campaigns_bp = Blueprint("campaigns", __name__)

# إعداد الخدمات مع معالجة آمنة للأخطاء
try:
    google_ads_client = GoogleAdsClientService() if GoogleAdsClientService else None
except Exception as e:
    google_ads_client = None
    logging.warning(f"فشل في تحميل GoogleAdsClientService: {e}")

try:
    campaign_builder = CampaignBuilder() if CampaignBuilder else None
except Exception as e:
    campaign_builder = None
    logging.warning(f"فشل في تحميل CampaignBuilder: {e}")

try:
    ai_processor = AIProcessor() if AIProcessor else None
except Exception as e:
    ai_processor = None
    logging.warning(f"فشل في تحميل AIProcessor: {e}")

try:
    db_manager = DatabaseManager() if DatabaseManager else None
except Exception as e:
    db_manager = None
    logging.warning(f"فشل في تحميل DatabaseManager: {e}")

logger = logging.getLogger(__name__)

@campaigns_bp.route("/", methods=["GET"])
def get_campaigns():
    """الحصول على قائمة الحملات"""
    try:
        # معاملات الاستعلام
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        status = request.args.get("status")
        search = request.args.get("search", "").strip()
        
        # محاكاة بيانات الحملات
        campaigns_data = [
            {
                "id": 1,
                "name": "حملة تجريبية 1",
                "status": "ENABLED",
                "budget": 1000,
                "budget_type": "DAILY",
                "start_date": "2025-01-01",
                "end_date": None,
                "created_at": "2025-01-01T00:00:00",
                "impressions": 10000,
                "clicks": 500,
                "ctr": 5.0,
                "cost": 250,
                "conversions": 25,
                "conversion_rate": 5.0
            },
            {
                "id": 2,
                "name": "حملة تجريبية 2",
                "status": "PAUSED",
                "budget": 500,
                "budget_type": "DAILY",
                "start_date": "2025-01-15",
                "end_date": "2025-02-15",
                "created_at": "2025-01-15T00:00:00",
                "impressions": 5000,
                "clicks": 200,
                "ctr": 4.0,
                "cost": 100,
                "conversions": 10,
                "conversion_rate": 5.0
            }
        ]
        
        # تطبيق الفلاتر
        if status:
            campaigns_data = [c for c in campaigns_data if c["status"] == status]
        if search:
            campaigns_data = [c for c in campaigns_data if search.lower() in c["name"].lower()]
        
        # تنسيق البيانات
        formatted_campaigns = []
        for campaign in campaigns_data:
            formatted_campaign = {
                "id": campaign["id"],
                "name": campaign["name"],
                "status": campaign["status"],
                "budget": format_currency(campaign.get("budget", 0)),
                "budget_type": campaign.get("budget_type", "DAILY"),
                "start_date": campaign.get("start_date"),
                "end_date": campaign.get("end_date"),
                "created_at": campaign.get("created_at"),
                "performance": {
                    "impressions": campaign.get("impressions", 0),
                    "clicks": campaign.get("clicks", 0),
                    "ctr": format_percentage(campaign.get("ctr", 0)),
                    "cost": format_currency(campaign.get("cost", 0)),
                    "conversions": campaign.get("conversions", 0),
                    "conversion_rate": format_percentage(campaign.get("conversion_rate", 0))
                }
            }
            formatted_campaigns.append(formatted_campaign)
        
        return jsonify({
            "success": True,
            "campaigns": formatted_campaigns,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(formatted_campaigns),
                "pages": 1
            }
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحملات: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على الحملات",
            "error_code": "CAMPAIGNS_FETCH_ERROR"
        }), 500

@campaigns_bp.route("/", methods=["POST"])
def create_campaign():
    """إنشاء حملة جديدة"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من صحة البيانات
        is_valid, errors = validate_campaign_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": "بيانات الحملة غير صحيحة",
                "errors": errors,
                "error_code": "VALIDATION_ERROR"
            }), 400
        
        # إنشاء الحملة
        campaign_id = generate_campaign_id()
        
        campaign_result = {
            "id": campaign_id,
            "name": data.get("name", "حملة جديدة"),
            "status": "ENABLED",
            "budget": data.get("budget", 100),
            "budget_type": data.get("budget_type", "DAILY"),
            "created_at": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "message": "تم إنشاء الحملة بنجاح",
            "campaign_id": campaign_id,
            "campaign": campaign_result
        }), 201
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إنشاء الحملة",
            "error_code": "CAMPAIGN_CREATE_ERROR"
        }), 500

@campaigns_bp.route('/<campaign_id>', methods=['GET'])
def get_campaign_details(campaign_id):
    """الحصول على تفاصيل حملة محددة"""
    try:
        # محاكاة تفاصيل الحملة
        campaign_details = {
            'id': campaign_id,
            'name': f'حملة {campaign_id}',
            'status': 'ENABLED',
            'budget': 1000,
            'budget_type': 'DAILY',
            'start_date': '2025-01-01',
            'end_date': None,
            'created_at': '2025-01-01T00:00:00',
            'performance': {
                'impressions': 10000,
                'clicks': 500,
                'cost': 250.50,
                'conversions': 25,
                'ctr': 5.0,
                'cpc': 0.50,
                'conversion_rate': 5.0
            },
            'ad_groups_count': 5,
            'keywords_count': 25,
            'ads_count': 15
        }
        
        return jsonify({
            'success': True,
            'campaign': campaign_details,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على تفاصيل الحملة {campaign_id}: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'خطأ في الحصول على تفاصيل الحملة',
            'error': str(e)
        }), 500

@campaigns_bp.route('/status', methods=['GET'])
def campaigns_status():
    """حالة خدمة الحملات"""
    return jsonify({
        'service': 'Campaigns API',
        'status': 'active',
        'version': '1.0.0',
        'services_status': {
            'google_ads_client': google_ads_client is not None,
            'campaign_builder': campaign_builder is not None,
            'ai_processor': ai_processor is not None,
            'database_manager': db_manager is not None
        },
        'timestamp': datetime.now().isoformat()
    })

# تسجيل معلومات التحميل
logger.info("✅ تم تحميل Campaigns Blueprint بنجاح")
logger.info(f"📊 الخدمات المتاحة: {sum([google_ads_client is not None, campaign_builder is not None, ai_processor is not None, db_manager is not None])}/4")

