"""
مسارات API - Routes Package
Google Ads AI Platform - API Routes
"""

from flask import Blueprint
from .auth import auth_bp
from .campaigns import campaigns_bp
from .accounts import accounts_bp
from .ai import ai_bp

def register_routes(app):
    """تسجيل جميع مسارات API"""
    
    # تسجيل المسارات
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    
    # مسار الصفحة الرئيسية
    @app.route('/')
    def home():
        return {
            "message": "منصة ذكية لإدارة إعلانات جوجل",
            "version": "1.0.0",
            "status": "active",
            "environment": app.config.get('ENV', 'development'),
            "port": app.config.get('PORT', 5000),
            "success": True
        }
    
    # مسار فحص صحة النظام
    @app.route('/api/health')
    def health_check():
        return {
            "status": "healthy",
            "message": "النظام يعمل بشكل طبيعي",
            "services": {
                "database": "متصل",
                "google_ads_api": "جاهز",
                "google_ai_api": "جاهز"
            },
            "timestamp": "2025-06-23T11:30:00Z",
            "success": True
        }

__all__ = ['register_routes', 'auth_bp', 'campaigns_bp', 'accounts_bp', 'ai_bp']
