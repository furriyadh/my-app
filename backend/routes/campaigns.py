"""
مسارات الحملات - Campaigns Routes
Google Ads AI Platform - Campaigns API Routes
"""

from flask import Blueprint, request, jsonify, g # تم إضافة g
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# استيرادات مطلقة بدلاً من النسبية
from backend.services.google_ads_client import GoogleAdsClientService
from backend.services.campaign_builder import CampaignBuilder
from backend.services.ai_processor import AIProcessor
from backend.utils.validators import validate_campaign_data, validate_keyword_data, validate_ad_data
from backend.utils.helpers import format_currency, format_percentage, calculate_performance_score
from backend.utils.helpers import generate_campaign_id, sanitize_text
from backend.utils.database import DatabaseManager
from backend.auth.auth_decorators import jwt_required_with_identity # استخدام decorator الجديد
from backend.services.mcc_manager import MCCManager
from backend.services.oauth_handler import OAuthHandler
from backend.utils.validators import GoogleAdsValidator

# إنشاء Blueprint
campaigns_bp = Blueprint("campaigns", __name__)

# إعداد الخدمات
google_ads_client = GoogleAdsClientService()
campaign_builder = CampaignBuilder()
ai_processor = AIProcessor()
db_manager = DatabaseManager()
logger = logging.getLogger(__name__)

@campaigns_bp.route("/", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaigns():
    """الحصول على قائمة الحملات"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # معاملات الاستعلام
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))
        status = request.args.get("status")  # ENABLED, PAUSED, REMOVED
        search = request.args.get("search", "").strip()
        
        # الحصول على الحملات من قاعدة البيانات
        campaigns = db_manager.get_user_campaigns(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status,
            search=search
        )
        
        # تنسيق البيانات
        formatted_campaigns = []
        for campaign in campaigns["data"]:
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
                "total": campaigns["total"],
                "pages": campaigns["pages"]
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
@jwt_required_with_identity() # استخدام decorator الجديد
def create_campaign():
    """إنشاء حملة جديدة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
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
        
        # إنشاء الحملة باستخدام Campaign Builder
        campaign_data = {
            "user_id": user_id,
            "name": data["name"],
            "budget": float(data["budget"]),
            "budget_type": data.get("budget_type", "DAILY"),
            "target_audience": data["target_audience"],
            "keywords": data["keywords"],
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
            "bid_strategy": data.get("bid_strategy", "MANUAL_CPC"),
            "location_targets": data.get("location_targets", []),
            "language_targets": data.get("language_targets", ["ar"]),
            "device_targets": data.get("device_targets", ["DESKTOP", "MOBILE"])
        }
        
        # بناء الحملة
        campaign_result = campaign_builder.build_campaign(campaign_data)
        
        if not campaign_result["success"]:
            return jsonify({
                "success": False,
                "message": campaign_result["message"],
                "error_code": "CAMPAIGN_BUILD_ERROR"
            }), 400
        
        # حفظ الحملة في قاعدة البيانات
        campaign_id = db_manager.create_campaign(campaign_result["campaign"])
        
        if not campaign_id:
            return jsonify({
                "success": False,
                "message": "فشل في حفظ الحملة",
                "error_code": "CAMPAIGN_SAVE_ERROR"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم إنشاء الحملة بنجاح",
            "campaign_id": campaign_id,
            "campaign": campaign_result["campaign"]
        }), 201
        
    except Exception as e:
        logger.error(f"خطأ في إنشاء الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إنشاء الحملة",
            "error_code": "CAMPAIGN_CREATE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaign(campaign_id):
    """الحصول على تفاصيل حملة محددة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # الحصول على الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # الحصول على إحصائيات الأداء
        performance_data = db_manager.get_campaign_performance(campaign_id)
        
        # تنسيق البيانات
        formatted_campaign = {
            "id": campaign["id"],
            "name": campaign["name"],
            "status": campaign["status"],
            "budget": format_currency(campaign.get("budget", 0)),
            "budget_type": campaign.get("budget_type", "DAILY"),
            "bid_strategy": campaign.get("bid_strategy"),
            "start_date": campaign.get("start_date"),
            "end_date": campaign.get("end_date"),
            "created_at": campaign.get("created_at"),
            "updated_at": campaign.get("updated_at"),
            "target_audience": campaign.get("target_audience"),
            "location_targets": campaign.get("location_targets", []),
            "language_targets": campaign.get("language_targets", []),
            "device_targets": campaign.get("device_targets", []),
            "performance": {
                "impressions": performance_data.get("impressions", 0),
                "clicks": performance_data.get("clicks", 0),
                "ctr": format_percentage(performance_data.get("ctr", 0)),
                "cost": format_currency(performance_data.get("cost", 0)),
                "avg_cpc": format_currency(performance_data.get("avg_cpc", 0)),
                "conversions": performance_data.get("conversions", 0),
                "conversion_rate": format_percentage(performance_data.get("conversion_rate", 0)),
                "cost_per_conversion": format_currency(performance_data.get("cost_per_conversion", 0))
            }
        }
        
        # حساب نقاط الأداء
        performance_score = calculate_performance_score({
            "ctr": performance_data.get("ctr", 0),
            "conversion_rate": performance_data.get("conversion_rate", 0),
            "quality_score": performance_data.get("avg_quality_score", 5),
            "roas": performance_data.get("roas", 0)
        })
        
        formatted_campaign["performance_score"] = performance_score
        
        return jsonify({
            "success": True,
            "campaign": formatted_campaign
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على الحملة",
            "error_code": "CAMPAIGN_FETCH_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>", methods=["PUT"])
@jwt_required_with_identity() # استخدام decorator الجديد
def update_campaign(campaign_id):
    """تحديث حملة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # البيانات المسموح تحديثها
        allowed_fields = ["name", "budget", "status", "bid_strategy", "end_date"]
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_UPDATE_DATA"
            }), 400
        
        # تحديث الحملة
        success = db_manager.update_campaign(campaign_id, update_data)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث الحملة",
                "error_code": "CAMPAIGN_UPDATE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم تحديث الحملة بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تحديث الحملة",
            "error_code": "CAMPAIGN_UPDATE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>", methods=["DELETE"])
@jwt_required_with_identity() # استخدام decorator الجديد
def delete_campaign(campaign_id):
    """حذف حملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # حذف الحملة
        success = db_manager.delete_campaign(campaign_id)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في حذف الحملة",
                "error_code": "CAMPAIGN_DELETE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم حذف الحملة بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في حذف الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في حذف الحملة",
            "error_code": "CAMPAIGN_DELETE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/keywords", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaign_keywords(campaign_id):
    """الحصول على كلمات مفتاحية للحملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # الحصول على الكلمات المفتاحية
        keywords = db_manager.get_campaign_keywords(campaign_id)
        
        # تنسيق البيانات
        formatted_keywords = []
        for keyword in keywords:
            formatted_keyword = {
                "id": keyword["id"],
                "text": keyword["text"],
                "match_type": keyword["match_type"],
                "bid": format_currency(keyword.get("bid", 0)),
                "status": keyword["status"],
                "quality_score": keyword.get("quality_score"),
                "performance": {
                    "impressions": keyword.get("impressions", 0),
                    "clicks": keyword.get("clicks", 0),
                    "ctr": format_percentage(keyword.get("ctr", 0)),
                    "cost": format_currency(keyword.get("cost", 0)),
                    "conversions": keyword.get("conversions", 0)
                }
            }
            formatted_keywords.append(formatted_keyword)
        
        return jsonify({
            "success": True,
            "keywords": formatted_keywords,
            "total": len(formatted_keywords)
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الكلمات المفتاحية: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على الكلمات المفتاحية",
            "error_code": "KEYWORDS_FETCH_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/keywords", methods=["POST"])
@jwt_required_with_identity() # استخدام decorator الجديد
def add_campaign_keyword(campaign_id):
    """إضافة كلمة مفتاحية للحملة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # التحقق من صحة البيانات
        is_valid, errors = validate_keyword_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": "بيانات الكلمة المفتاحية غير صحيحة",
                "errors": errors,
                "error_code": "VALIDATION_ERROR"
            }), 400
        
        # إضافة الكلمة المفتاحية
        keyword_data = {
            "campaign_id": campaign_id,
            "text": data["text"],
            "match_type": data.get("match_type", "BROAD"),
            "bid": float(data.get("bid", 0)),
            "status": "ENABLED"
        }
        
        keyword_id = db_manager.create_keyword(keyword_data)
        
        if not keyword_id:
            return jsonify({
                "success": False,
                "message": "فشل في إضافة الكلمة المفتاحية",
                "error_code": "KEYWORD_CREATE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم إضافة الكلمة المفتاحية بنجاح",
            "keyword_id": keyword_id,
            "keyword": keyword_data
        }), 201
        
    except Exception as e:
        logger.error(f"خطأ في إضافة الكلمة المفتاحية: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إضافة الكلمة المفتاحية",
            "error_code": "KEYWORD_ADD_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/keywords/<int:keyword_id>", methods=["PUT"])
@jwt_required_with_identity() # استخدام decorator الجديد
def update_campaign_keyword(campaign_id, keyword_id):
    """تحديث كلمة مفتاحية للحملة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من وجود الحملة والكلمة المفتاحية
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        keyword = db_manager.get_keyword_by_id(keyword_id, campaign_id)
        if not keyword:
            return jsonify({
                "success": False,
                "message": "الكلمة المفتاحية غير موجودة",
                "error_code": "KEYWORD_NOT_FOUND"
            }), 404
        
        # البيانات المسموح تحديثها
        allowed_fields = ["text", "match_type", "bid", "status"]
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_UPDATE_DATA"
            }), 400
        
        # تحديث الكلمة المفتاحية
        success = db_manager.update_keyword(keyword_id, update_data)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث الكلمة المفتاحية",
                "error_code": "KEYWORD_UPDATE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم تحديث الكلمة المفتاحية بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الكلمة المفتاحية: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تحديث الكلمة المفتاحية",
            "error_code": "KEYWORD_UPDATE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/keywords/<int:keyword_id>", methods=["DELETE"])
@jwt_required_with_identity() # استخدام decorator الجديد
def delete_campaign_keyword(campaign_id, keyword_id):
    """حذف كلمة مفتاحية من الحملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة والكلمة المفتاحية
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        keyword = db_manager.get_keyword_by_id(keyword_id, campaign_id)
        if not keyword:
            return jsonify({
                "success": False,
                "message": "الكلمة المفتاحية غير موجودة",
                "error_code": "KEYWORD_NOT_FOUND"
            }), 404
        
        # حذف الكلمة المفتاحية
        success = db_manager.delete_keyword(keyword_id)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في حذف الكلمة المفتاحية",
                "error_code": "KEYWORD_DELETE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم حذف الكلمة المفتاحية بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في حذف الكلمة المفتاحية: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في حذف الكلمة المفتاحية",
            "error_code": "KEYWORD_DELETE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/ads", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaign_ads(campaign_id):
    """الحصول على إعلانات الحملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # الحصول على الإعلانات
        ads = db_manager.get_campaign_ads(campaign_id)
        
        # تنسيق البيانات
        formatted_ads = []
        for ad in ads:
            formatted_ad = {
                "id": ad["id"],
                "headline": ad["headline"],
                "description": ad["description"],
                "final_url": ad["final_url"],
                "status": ad["status"],
                "type": ad["type"],
                "performance": {
                    "impressions": ad.get("impressions", 0),
                    "clicks": ad.get("clicks", 0),
                    "ctr": format_percentage(ad.get("ctr", 0)),
                    "cost": format_currency(ad.get("cost", 0)),
                    "conversions": ad.get("conversions", 0)
                }
            }
            formatted_ads.append(formatted_ad)
        
        return jsonify({
            "success": True,
            "ads": formatted_ads,
            "total": len(formatted_ads)
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على الإعلانات: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على الإعلانات",
            "error_code": "ADS_FETCH_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/ads", methods=["POST"])
@jwt_required_with_identity() # استخدام decorator الجديد
def add_campaign_ad(campaign_id):
    """إضافة إعلان للحملة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # التحقق من صحة البيانات
        is_valid, errors = validate_ad_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": "بيانات الإعلان غير صحيحة",
                "errors": errors,
                "error_code": "VALIDATION_ERROR"
            }), 400
        
        # إضافة الإعلان
        ad_data = {
            "campaign_id": campaign_id,
            "headline": data["headline"],
            "description": data["description"],
            "final_url": data["final_url"],
            "type": data.get("type", "TEXT_AD"),
            "status": "ENABLED"
        }
        
        ad_id = db_manager.create_ad(ad_data)
        
        if not ad_id:
            return jsonify({
                "success": False,
                "message": "فشل في إضافة الإعلان",
                "error_code": "AD_CREATE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم إضافة الإعلان بنجاح",
            "ad_id": ad_id,
            "ad": ad_data
        }), 201
        
    except Exception as e:
        logger.error(f"خطأ في إضافة الإعلان: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في إضافة الإعلان",
            "error_code": "AD_ADD_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/ads/<int:ad_id>", methods=["PUT"])
@jwt_required_with_identity() # استخدام decorator الجديد
def update_campaign_ad(campaign_id, ad_id):
    """تحديث إعلان الحملة"""
    try:
        data = request.get_json()
        user_id = g.user_id # استخدام g.user_id
        
        if not data:
            return jsonify({
                "success": False,
                "message": "بيانات غير صحيحة",
                "error_code": "INVALID_DATA"
            }), 400
        
        # التحقق من وجود الحملة والإعلان
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        ad = db_manager.get_ad_by_id(ad_id, campaign_id)
        if not ad:
            return jsonify({
                "success": False,
                "message": "الإعلان غير موجود",
                "error_code": "AD_NOT_FOUND"
            }), 404
        
        # البيانات المسموح تحديثها
        allowed_fields = ["headline", "description", "final_url", "status"]
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({
                "success": False,
                "message": "لا توجد بيانات للتحديث",
                "error_code": "NO_UPDATE_DATA"
            }), 400
        
        # تحديث الإعلان
        success = db_manager.update_ad(ad_id, update_data)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في تحديث الإعلان",
                "error_code": "AD_UPDATE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم تحديث الإعلان بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في تحديث الإعلان: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في تحديث الإعلان",
            "error_code": "AD_UPDATE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/ads/<int:ad_id>", methods=["DELETE"])
@jwt_required_with_identity() # استخدام decorator الجديد
def delete_campaign_ad(campaign_id, ad_id):
    """حذف إعلان من الحملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة والإعلان
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        ad = db_manager.get_ad_by_id(ad_id, campaign_id)
        if not ad:
            return jsonify({
                "success": False,
                "message": "الإعلان غير موجود",
                "error_code": "AD_NOT_FOUND"
            }), 404
        
        # حذف الإعلان
        success = db_manager.delete_ad(ad_id)
        
        if not success:
            return jsonify({
                "success": False,
                "message": "فشل في حذف الإعلان",
                "error_code": "AD_DELETE_FAILED"
            }), 500
        
        return jsonify({
            "success": True,
            "message": "تم حذف الإعلان بنجاح"
        })
        
    except Exception as e:
        logger.error(f"خطأ في حذف الإعلان: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في حذف الإعلان",
            "error_code": "AD_DELETE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/performance", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaign_performance(campaign_id):
    """الحصول على أداء الحملة"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # الحصول على بيانات الأداء
        performance_data = db_manager.get_campaign_performance(campaign_id)
        
        # تنسيق البيانات
        formatted_performance = {
            "impressions": performance_data.get("impressions", 0),
            "clicks": performance_data.get("clicks", 0),
            "ctr": format_percentage(performance_data.get("ctr", 0)),
            "cost": format_currency(performance_data.get("cost", 0)),
            "avg_cpc": format_currency(performance_data.get("avg_cpc", 0)),
            "conversions": performance_data.get("conversions", 0),
            "conversion_rate": format_percentage(performance_data.get("conversion_rate", 0)),
            "cost_per_conversion": format_currency(performance_data.get("cost_per_conversion", 0))
        }
        
        return jsonify({
            "success": True,
            "performance": formatted_performance
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على أداء الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على أداء الحملة",
            "error_code": "CAMPAIGN_PERFORMANCE_ERROR"
        }), 500

@campaigns_bp.route("/<int:campaign_id>/insights", methods=["GET"])
@jwt_required_with_identity() # استخدام decorator الجديد
def get_campaign_insights(campaign_id):
    """الحصول على رؤى الحملة بالذكاء الاصطناعي"""
    try:
        user_id = g.user_id # استخدام g.user_id
        
        # التحقق من وجود الحملة
        campaign = db_manager.get_campaign_by_id(campaign_id, user_id)
        if not campaign:
            return jsonify({
                "success": False,
                "message": "الحملة غير موجودة",
                "error_code": "CAMPAIGN_NOT_FOUND"
            }), 404
        
        # الحصول على بيانات الأداء والكلمات المفتاحية والإعلانات
        performance_data = db_manager.get_campaign_performance(campaign_id)
        keywords_data = db_manager.get_campaign_keywords(campaign_id)
        ads_data = db_manager.get_campaign_ads(campaign_id)
        
        # تحليل الرؤى بالذكاء الاصطناعي
        insights = ai_processor.analyze_campaign_insights(
            campaign_data=campaign,
            performance_data=performance_data,
            keywords_data=keywords_data,
            ads_data=ads_data
        )
        
        return jsonify({
            "success": True,
            "insights": insights
        })
        
    except Exception as e:
        logger.error(f"خطأ في الحصول على رؤى الحملة: {str(e)}")
        return jsonify({
            "success": False,
            "message": "حدث خطأ في الحصول على رؤى الحملة",
            "error_code": "CAMPAIGN_INSIGHTS_ERROR"
        }), 500
