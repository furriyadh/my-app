#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync Routes
مسارات المزامنة
"""

from flask import Blueprint, request, jsonify
import logging

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء Blueprint
sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة الخدمة"""
    return jsonify({
        'status': 'healthy',
        'service': 'sync',
        'message': 'Sync service is running'
    })

@sync_bp.route('/info', methods=['GET'])
def get_info():
    """معلومات الخدمة"""
    return jsonify({
        'service': 'sync',
        'version': '1.0.0',
        'description': 'Sync service for Google Ads AI Platform'
    })

# تسجيل Blueprint
logger.info("✅ تم تحميل sync_bp")

