from flask import Blueprint, jsonify

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/test', methods=['GET'])
def test_ai_route():
    return jsonify({'message': 'AI route test successful!', 'status': 'working'})

@ai_bp.route('/health', methods=['GET'])
def ai_health():
    return jsonify({'message': 'AI module is healthy', 'status': 'ok'})
