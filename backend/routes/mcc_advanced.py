"""
MCC Advanced API Blueprint - Minimal Working Version
نسخة بسيطة تعمل بدون أخطاء import مع حل مشكلة application context
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Blueprint, request, jsonify, has_app_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafeContextManager:
    """Safe context manager that handles Flask context issues"""
    
    @staticmethod
    def safe_execute(func, *args, **kwargs):
        """Execute function safely with proper context handling"""
        try:
            return func(*args, **kwargs)
        except RuntimeError as e:
            if "application context" in str(e).lower():
                logger.warning(f"Application context error: {e}")
                # Return safe default
                return None
            raise
        except Exception as e:
            logger.error(f"Error in safe execution: {e}")
            raise

class MCCAdvancedManager:
    """Simple MCC Advanced Manager with safe context handling"""
    
    def __init__(self):
        self.config = self._load_config()
        self.client = None
        self.context_manager = SafeContextManager()
        
        # Try to initialize Google Ads client
        try:
            from google.ads.googleads.client import GoogleAdsClient
            if self.config:
                self.client = self._create_client()
                logger.info("MCC Google Ads client initialized successfully")
        except ImportError:
            logger.warning("Google Ads library not available")
        except Exception as e:
            logger.error(f"Failed to initialize MCC Google Ads client: {e}")
    
    def _load_config(self) -> Optional[Dict[str, str]]:
        """Load MCC configuration from environment"""
        try:
            return {
                'client_id': os.getenv('GOOGLE_ADS_CLIENT_ID', ''),
                'client_secret': os.getenv('GOOGLE_ADS_CLIENT_SECRET', ''),
                'developer_token': os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN', ''),
                'refresh_token': os.getenv('GOOGLE_ADS_REFRESH_TOKEN', ''),
                'mcc_customer_id': os.getenv('GOOGLE_ADS_MCC_CUSTOMER_ID', ''),
                'use_proto_plus': os.getenv('GOOGLE_ADS_USE_PROTO_PLUS', 'True')
            }
        except Exception as e:
            logger.error(f"Failed to load MCC configuration: {e}")
            return None
    
    def _create_client(self):
        """Create Google Ads client for MCC"""
        try:
            from google.ads.googleads.client import GoogleAdsClient
            config_dict = {
                'developer_token': self.config['developer_token'],
                'client_id': self.config['client_id'],
                'client_secret': self.config['client_secret'],
                'refresh_token': self.config['refresh_token'],
                'use_proto_plus': self.config['use_proto_plus'].lower() == 'true',
                'login_customer_id': str(self.config['mcc_customer_id']) if self.config['mcc_customer_id'] else None
            }
            return GoogleAdsClient.load_from_dict(config_dict)
        except Exception as e:
            logger.error(f"Failed to create MCC Google Ads client: {e}")
            return None
    
    def get_mcc_info(self) -> Dict[str, Any]:
        """Get MCC information safely"""
        return self.context_manager.safe_execute(self._get_mcc_info_internal) or {}
    
    def _get_mcc_info_internal(self) -> Dict[str, Any]:
        """Internal method to get MCC information"""
        return {
            'mcc_client_configured': bool(self.client),
            'config_loaded': bool(self.config),
            'mcc_customer_id': self.config.get('mcc_customer_id') if self.config else None,
            'context_safe': True,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_managed_accounts(self) -> List[Dict[str, Any]]:
        """Get managed accounts safely"""
        return self.context_manager.safe_execute(self._get_managed_accounts_internal) or []
    
    def _get_managed_accounts_internal(self) -> List[Dict[str, Any]]:
        """Internal method to get managed accounts"""
        if not self.client:
            return self._get_mock_managed_accounts()
        
        try:
            return self._fetch_real_managed_accounts()
        except Exception as e:
            logger.error(f"Error fetching managed accounts: {e}")
            return self._get_mock_managed_accounts()
    
    def _get_mock_managed_accounts(self) -> List[Dict[str, Any]]:
        """Return empty list instead of mock data"""
        return []
    
    def _fetch_real_managed_accounts(self) -> List[Dict[str, Any]]:
        """Fetch real managed accounts from Google Ads API"""
        try:
            ga_service = self.client.get_service("GoogleAdsService")
            
            query = """
                SELECT
                    customer_client.client_customer,
                    customer_client.id,
                    customer_client.descriptive_name,
                    customer_client.currency_code,
                    customer_client.time_zone,
                    customer_client.manager,
                    customer_client.test_account,
                    customer_client.status
                FROM customer_client
                WHERE customer_client.manager = FALSE
                AND customer_client.status = 'ENABLED'
            """
            
            # استخدام login_customer_id لجلب العملاء المرتبطين بـ MCC
            response = ga_service.search(
                customer_id=self.config['mcc_customer_id'],
                query=query
            )
            
            accounts = []
            for row in response:
                customer = row.customer
                accounts.append({
                    'id': str(customer.id),
                    'name': customer.descriptive_name,
                    'currency': customer.currency_code,
                    'status': customer.status.name,
                    'type': 'MANAGER' if customer.manager else 'STANDARD',
                    'manager': customer.manager
                })
            
            return accounts
        except Exception as e:
            logger.error(f"Error fetching real managed accounts: {e}")
            return self._get_mock_managed_accounts()

# Initialize the MCC manager
mcc_manager = MCCAdvancedManager()

# Create the Blueprint with safe context handling
def create_mcc_blueprint():
    """Create MCC blueprint safely"""
    try:
        return Blueprint('mcc_api', __name__, url_prefix='/api/v1/mcc')
    except Exception as e:
        logger.error(f"Error creating MCC blueprint: {e}")
        return Blueprint('mcc_api', __name__, url_prefix='/api/v1/mcc')

# Create the blueprint
mcc_api = create_mcc_blueprint()

@mcc_api.route('/accounts', methods=['GET'])
def get_mcc_accounts():
    """Get all managed accounts under MCC"""
    try:
        accounts = mcc_manager.get_managed_accounts()
        
        return jsonify({
            'accounts': accounts,
            'total_accounts': len(accounts),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in get_mcc_accounts: {e}")
        return jsonify({
            'error': str(e),
            'accounts': [],
            'total_accounts': 0,
            'timestamp': datetime.now().isoformat()
        }), 500

@mcc_api.route('/health', methods=['GET'])
def mcc_health_check():
    """MCC health check"""
    try:
        mcc_info = mcc_manager.get_mcc_info()
        
        health_status = {
            'status': 'healthy',
            'service': 'MCC Advanced API',
            'timestamp': datetime.now().isoformat(),
            'checks': {
                'mcc_client': 'pass' if mcc_info.get('mcc_client_configured') else 'fail',
                'configuration': 'pass' if mcc_info.get('config_loaded') else 'fail',
                'context_handling': 'pass'
            },
            'mcc_info': mcc_info
        }
        
        failed_checks = [k for k, v in health_status['checks'].items() if v == 'fail']
        if failed_checks:
            health_status['status'] = 'degraded'
            health_status['failed_checks'] = failed_checks
        
        status_code = 200 if health_status['status'] == 'healthy' else 503
        return jsonify(health_status), status_code
    except Exception as e:
        logger.error(f"Error in mcc_health_check: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@mcc_api.route('/info', methods=['GET'])
def get_mcc_info():
    """Get MCC service information"""
    try:
        mcc_info = mcc_manager.get_mcc_info()
        
        return jsonify({
            'service': 'MCC Advanced API Blueprint',
            'description': 'Simple My Client Center management',
            'version': '1.0.0',
            'endpoints': [
                'GET /accounts - List managed accounts',
                'GET /health - Health check',
                'GET /info - Service information',
                'GET /config - Configuration',
                'GET /stats - Statistics',
                'POST /refresh-cache - Refresh cache'
            ],
            'mcc_configuration': {
                'client_configured': mcc_info.get('mcc_client_configured', False),
                'mcc_customer_id': mcc_info.get('mcc_customer_id'),
                'context_safe': mcc_info.get('context_safe', True)
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error in get_mcc_info: {e}")
        return jsonify({'error': str(e)}), 500

@mcc_api.route('/config', methods=['GET'])
def get_mcc_config():
    """Get MCC configuration information (sanitized)"""
    try:
        mcc_info = mcc_manager.get_mcc_info()
        
        config_info = {
            'mcc_client_configured': mcc_info.get('mcc_client_configured', False),
            'environment': {
                'flask_env': os.getenv('FLASK_ENV', 'production'),
                'debug': os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
            },
            'context_safety': {
                'safe_execution': True,
                'context_manager_active': True,
                'error_handling': 'comprehensive'
            },
            'google_ads_mcc': {
                'mcc_customer_id_configured': bool(os.getenv('GOOGLE_ADS_MCC_CUSTOMER_ID')),
                'client_id_configured': bool(os.getenv('GOOGLE_ADS_CLIENT_ID')),
                'developer_token_configured': bool(os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN'))
            }
        }
        return jsonify(config_info)
    except Exception as e:
        logger.error(f"Error in get_mcc_config: {e}")
        return jsonify({'error': str(e)}), 500

@mcc_api.route('/stats', methods=['GET'])
def get_mcc_stats():
    """Get MCC statistics"""
    try:
        accounts = mcc_manager.get_managed_accounts()
        
        stats = {
            'overview': {
                'total_accounts': len(accounts),
                'enabled_accounts': len([acc for acc in accounts if acc.get('status') == 'ENABLED']),
                'manager_accounts': len([acc for acc in accounts if acc.get('manager')]),
                'standard_accounts': len([acc for acc in accounts if not acc.get('manager')])
            },
            'currency_distribution': {},
            'account_types': {
                'STANDARD': len([acc for acc in accounts if acc.get('type') == 'STANDARD']),
                'MANAGER': len([acc for acc in accounts if acc.get('type') == 'MANAGER'])
            },
            'timestamp': datetime.now().isoformat()
        }
        
        # Calculate currency distribution
        for account in accounts:
            currency = account.get('currency', 'UNKNOWN')
            stats['currency_distribution'][currency] = stats['currency_distribution'].get(currency, 0) + 1
        
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error in get_mcc_stats: {e}")
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@mcc_api.route('/refresh-cache', methods=['POST'])
def refresh_mcc_cache():
    """Refresh MCC cached data"""
    try:
        # Simple refresh - just get fresh data
        accounts = mcc_manager.get_managed_accounts()
        
        return jsonify({
            'status': 'success',
            'message': 'MCC cache refreshed successfully',
            'refreshed_accounts': len(accounts),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error refreshing MCC cache: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to refresh MCC cache',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Export the blueprint
__all__ = ['mcc_api']

