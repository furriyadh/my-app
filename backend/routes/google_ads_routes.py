from flask import Blueprint, jsonify

google_ads_routes_bp = Blueprint('google_ads_routes', __name__, url_prefix='/api/google-ads-routes')

@google_ads_routes_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Google Ads Routes API يعمل'})

@google_ads_routes_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'test': 'success', 'message': 'اختبار Google Ads Routes نجح'})

__all__ = ['google_ads_routes_bp']

