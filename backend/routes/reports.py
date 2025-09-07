#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reports Routes
مسارات التقارير
"""

from flask import Blueprint, request, jsonify
import logging

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة الخدمة"""
    return jsonify({
        'status': 'healthy',
        'service': 'reports',
        'message': 'Reports service is running'
    })

@reports_bp.route('/info', methods=['GET'])
def get_info():
    """معلومات الخدمة"""
    return jsonify({
        'service': 'reports',
        'version': '1.0.0',
        'description': 'Reports service for Google Ads AI Platform'
    })

# تسجيل Blueprint
logger.info("✅ تم تحميل reports_bp")

