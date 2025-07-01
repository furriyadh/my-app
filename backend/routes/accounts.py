"""
مسارات الحسابات - Accounts Routes
Google Ads AI Platform - Accounts API Routes
"""

from flask import Blueprint, request, jsonify, session
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# استيرادات مطلقة بدلاً من النسبية
from backend.services.google_ads_client import GoogleAdsClientService
from backend.services.mcc_manager import MCCManager
from backend.services.oauth_handler import OAuthHandler
from backend.utils.validators import GoogleAdsValidator
from backend.utils.helpers import format_currency, format_percentage, calculate_performance_score, generate_campaign_id, sanitize_text
from backend.utils.database import DatabaseManager
from backend.auth.auth_decorators import jwt_required_with_identity # استخدام decorator الجديد

# إنشاء Blueprint
accounts_bp = Blueprint("accounts", __name__)

# إعداد الخدمات
google_ads_client = GoogleAdsClientService()
mcc_manager = MCCManager()
oauth_handler = OAuthHandler()
db_manager = DatabaseManager()
logger = logging.getLogger(__name__)
