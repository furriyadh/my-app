from flask import Blueprint, jsonify

google_ads_bp = Blueprint('google_ads', __name__, url_prefix='/api/google-ads')

@google_ads_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Google Ads API يعمل'})

@google_ads_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'test': 'success', 'message': 'اختبار نجح'})

__all__ = ['google_ads_bp']

