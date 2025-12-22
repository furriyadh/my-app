#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Discovery Routes
مسارات الاكتشاف
"""

from flask import Blueprint, request, jsonify
import logging

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
discovery_bp = Blueprint('discovery', __name__)

@discovery_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة الخدمة"""
    return jsonify({
        'status': 'healthy',
        'service': 'discovery',
        'message': 'Discovery service is running'
    })

@discovery_bp.route('/info', methods=['GET'])
def get_info():
    """معلومات الخدمة"""
    return jsonify({
        'service': 'discovery',
        'version': '1.0.0',
        'description': 'Discovery service for Google Ads AI Platform'
    })

# تسجيل Blueprint
logger.info("✅ تم تحميل discovery_bp")

