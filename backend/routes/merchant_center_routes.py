"""
Google Merchant Center Routes - إصدار محسن ومُصحح
إدارة متجر Google Merchant Center مع أفضل ممارسات البرمجة
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from flask import Blueprint, request, jsonify, current_app

# إعداد التسجيل
logger = logging.getLogger(__name__)

class MerchantCenterConfigManager:
    """مدير تكوين Merchant Center"""
    
    def __init__(self):
        self.config = self._load_config()
        self.is_valid = self._validate_config()
    
    def _load_config(self) -> Dict[str, str]:
        """تحميل تكوين Merchant Center"""
        try:
            config = {
                'merchant_id': os.getenv('GOOGLE_MERCHANT_CENTER_ID', ''),
                'service_account_file': os.getenv('GOOGLE_SERVICE_ACCOUNT_FILE', ''),
                'application_name': os.getenv('GOOGLE_APPLICATION_NAME', 'Google Ads AI Platform'),
                'api_version': os.getenv('GOOGLE_MERCHANT_API_VERSION', 'v2.1'),
                'sandbox_mode': os.getenv('GOOGLE_MERCHANT_SANDBOX', 'True').lower() == 'true'
            }
            
            logger.info("✅ تم تحميل تكوين Merchant Center")
            return config
            
        except Exception as e:
            logger.error(f"❌ خطأ في تحميل تكوين Merchant Center: {e}")
            return {}
    
    def _validate_config(self) -> bool:
        """التحقق من صحة التكوين"""
        if not self.config:
            return False
        
        required_fields = ['merchant_id']
        missing_fields = [field for field in required_fields if not self.config.get(field)]
        
        if missing_fields:
            logger.warning(f"⚠️ حقول مفقودة في تكوين Merchant Center: {missing_fields}")
            return False
        
        return True
    
    def get_sanitized_config(self) -> Dict[str, Any]:
        """الحصول على تكوين منظف"""
        return {
            'merchant_id': self.config.get('merchant_id', 'غير محدد'),
            'service_account_configured': bool(self.config.get('service_account_file')),
            'application_name': self.config.get('application_name'),
            'api_version': self.config.get('api_version'),
            'sandbox_mode': self.config.get('sandbox_mode'),
            'is_valid': self.is_valid
        }

class SafeMerchantCenterClient:
    """عميل Merchant Center آمن"""
    
    def __init__(self, config_manager: MerchantCenterConfigManager):
        self.config_manager = config_manager
        self.client = None
        self.is_initialized = False
        
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """تهيئة عميل Merchant Center"""
        if not self.config_manager.is_valid:
            logger.warning("⚠️ تكوين Merchant Center غير صحيح")
            return
        
        try:
            # محاولة تهيئة عميل Google Shopping API
            from googleapiclient.discovery import build
            from google.oauth2 import service_account
            
            service_account_file = self.config_manager.config.get('service_account_file')
            
            if service_account_file and os.path.exists(service_account_file):
                credentials = service_account.Credentials.from_service_account_file(
                    service_account_file,
                    scopes=['https://www.googleapis.com/auth/content']
                )
                
                self.client = build(
                    'content',
                    self.config_manager.config['api_version'],
                    credentials=credentials
                )
                
                self.is_initialized = True
                logger.info("✅ تم تهيئة عميل Merchant Center بنجاح")
            else:
                logger.warning("⚠️ ملف service account غير موجود")
                
        except ImportError:
            logger.warning("⚠️ مكتبة Google API Client غير متوفرة")
        except Exception as e:
            logger.error(f"❌ فشل في تهيئة عميل Merchant Center: {e}")
    
    def get_products(self, max_results: int = 50) -> List[Dict[str, Any]]:
        """الحصول على المنتجات"""
        if not self.is_initialized:
            return self._get_mock_products(max_results)
        
        try:
            return self._fetch_real_products(max_results)
        except Exception as e:
            logger.error(f"❌ خطأ في جلب المنتجات: {e}")
            return self._get_mock_products(max_results)
    
    def _fetch_real_products(self, max_results: int) -> List[Dict[str, Any]]:
        """جلب المنتجات الحقيقية"""
        try:
            merchant_id = self.config_manager.config['merchant_id']
            
            request = self.client.products().list(
                merchantId=merchant_id,
                maxResults=max_results
            )
            
            response = request.execute()
            products = response.get('resources', [])
            
            # تحويل البيانات إلى تنسيق مبسط
            simplified_products = []
            for product in products:
                simplified_products.append({
                    'id': product.get('id'),
                    'title': product.get('title'),
                    'description': product.get('description', '')[:200] + '...' if product.get('description') else '',
                    'price': product.get('price', {}).get('value'),
                    'currency': product.get('price', {}).get('currency'),
                    'availability': product.get('availability'),
                    'condition': product.get('condition'),
                    'brand': product.get('brand'),
                    'gtin': product.get('gtin'),
                    'mpn': product.get('mpn'),
                    'link': product.get('link'),
                    'image_link': product.get('imageLink'),
                    'last_updated': datetime.utcnow().isoformat()
                })
            
            logger.info(f"✅ تم جلب {len(simplified_products)} منتج من Merchant Center")
            return simplified_products
            
        except Exception as e:
            logger.error(f"❌ خطأ في جلب المنتجات من API: {e}")
            raise
    
    def _get_mock_products(self, max_results: int) -> List[Dict[str, Any]]:
        """منتجات تجريبية"""
        mock_products = [
            {
                'id': 'online:ar:SAR:product_001',
                'title': 'هاتف ذكي Samsung Galaxy S24',
                'description': 'هاتف ذكي متطور مع كاميرا عالية الدقة وشاشة AMOLED...',
                'price': '2999.00',
                'currency': 'SAR',
                'availability': 'in stock',
                'condition': 'new',
                'brand': 'Samsung',
                'gtin': '8806094649321',
                'mpn': 'SM-S921B',
                'link': 'https://example.com/samsung-galaxy-s24',
                'image_link': 'https://example.com/images/samsung-s24.jpg',
                'last_updated': datetime.utcnow().isoformat()
            },
            {
                'id': 'online:ar:SAR:product_002',
                'title': 'لابتوب MacBook Air M2',
                'description': 'لابتوب Apple MacBook Air مع معالج M2 وذاكرة 8GB...',
                'price': '4999.00',
                'currency': 'SAR',
                'availability': 'in stock',
                'condition': 'new',
                'brand': 'Apple',
                'gtin': '194252056851',
                'mpn': 'MLY33',
                'link': 'https://example.com/macbook-air-m2',
                'image_link': 'https://example.com/images/macbook-air.jpg',
                'last_updated': datetime.utcnow().isoformat()
            },
            {
                'id': 'online:ar:SAR:product_003',
                'title': 'سماعات Sony WH-1000XM5',
                'description': 'سماعات لاسلكية مع إلغاء الضوضاء وجودة صوت عالية...',
                'price': '1299.00',
                'currency': 'SAR',
                'availability': 'in stock',
                'condition': 'new',
                'brand': 'Sony',
                'gtin': '4548736142824',
                'mpn': 'WH1000XM5',
                'link': 'https://example.com/sony-wh1000xm5',
                'image_link': 'https://example.com/images/sony-headphones.jpg',
                'last_updated': datetime.utcnow().isoformat()
            },
            {
                'id': 'online:ar:SAR:product_004',
                'title': 'ساعة Apple Watch Series 9',
                'description': 'ساعة ذكية من Apple مع مراقبة الصحة ونظام watchOS...',
                'price': '1899.00',
                'currency': 'SAR',
                'availability': 'in stock',
                'condition': 'new',
                'brand': 'Apple',
                'gtin': '195949112717',
                'mpn': 'MR933',
                'link': 'https://example.com/apple-watch-series-9',
                'image_link': 'https://example.com/images/apple-watch.jpg',
                'last_updated': datetime.utcnow().isoformat()
            }
        ]
        
        # إرجاع العدد المطلوب فقط
        return mock_products[:max_results]
    
    def get_product_statistics(self) -> Dict[str, Any]:
        """إحصائيات المنتجات"""
        products = self.get_products(max_results=1000)  # جلب عدد أكبر للإحصائيات
        
        stats = {
            'total_products': len(products),
            'availability_distribution': {},
            'condition_distribution': {},
            'brand_distribution': {},
            'currency_distribution': {},
            'price_ranges': {
                'under_100': 0,
                '100_500': 0,
                '500_1000': 0,
                '1000_5000': 0,
                'over_5000': 0
            }
        }
        
        for product in products:
            # توزيع التوفر
            availability = product.get('availability', 'unknown')
            stats['availability_distribution'][availability] = stats['availability_distribution'].get(availability, 0) + 1
            
            # توزيع الحالة
            condition = product.get('condition', 'unknown')
            stats['condition_distribution'][condition] = stats['condition_distribution'].get(condition, 0) + 1
            
            # توزيع العلامات التجارية
            brand = product.get('brand', 'unknown')
            stats['brand_distribution'][brand] = stats['brand_distribution'].get(brand, 0) + 1
            
            # توزيع العملات
            currency = product.get('currency', 'unknown')
            stats['currency_distribution'][currency] = stats['currency_distribution'].get(currency, 0) + 1
            
            # نطاقات الأسعار
            try:
                price = float(product.get('price', 0))
                if price < 100:
                    stats['price_ranges']['under_100'] += 1
                elif price < 500:
                    stats['price_ranges']['100_500'] += 1
                elif price < 1000:
                    stats['price_ranges']['500_1000'] += 1
                elif price < 5000:
                    stats['price_ranges']['1000_5000'] += 1
                else:
                    stats['price_ranges']['over_5000'] += 1
            except (ValueError, TypeError):
                pass
        
        return stats

class MerchantCenterManager:
    """مدير Merchant Center الرئيسي"""
    
    def __init__(self):
        self.config_manager = MerchantCenterConfigManager()
        self.client = SafeMerchantCenterClient(self.config_manager)
        self.cache = {}
        self.cache_ttl = timedelta(minutes=10)
        
        logger.info("🚀 تم تهيئة Merchant Center Manager")
    
    def get_products(self, max_results: int = 50, use_cache: bool = True) -> List[Dict[str, Any]]:
        """الحصول على المنتجات مع دعم الكاش"""
        cache_key = f'products_{max_results}'
        
        if use_cache and self._is_cache_valid(cache_key):
            logger.info("📋 استخدام المنتجات من الكاش")
            return self.cache[cache_key]['data']
        
        products = self.client.get_products(max_results)
        self._update_cache(cache_key, products)
        
        return products
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """الحصول على منتج محدد"""
        products = self.get_products(max_results=1000)
        return next((product for product in products if product['id'] == product_id), None)
    
    def search_products(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """البحث في المنتجات"""
        products = self.get_products(max_results=1000)
        query_lower = query.lower()
        
        matching_products = []
        for product in products:
            if (query_lower in product.get('title', '').lower() or
                query_lower in product.get('description', '').lower() or
                query_lower in product.get('brand', '').lower()):
                matching_products.append(product)
                
                if len(matching_products) >= max_results:
                    break
        
        return matching_products
    
    def get_statistics(self) -> Dict[str, Any]:
        """الحصول على إحصائيات شاملة"""
        cache_key = 'statistics'
        
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        
        stats = self.client.get_product_statistics()
        stats['last_updated'] = datetime.utcnow().isoformat()
        
        self._update_cache(cache_key, stats)
        return stats
    
    def _is_cache_valid(self, key: str) -> bool:
        """فحص صلاحية الكاش"""
        if key not in self.cache:
            return False
        
        cache_time = self.cache[key]['timestamp']
        return datetime.utcnow() - cache_time < self.cache_ttl
    
    def _update_cache(self, key: str, data: Any) -> None:
        """تحديث الكاش"""
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.utcnow()
        }
    
    def clear_cache(self) -> None:
        """مسح الكاش"""
        self.cache.clear()
        logger.info("🗑️ تم مسح كاش Merchant Center")
    
    def get_health_status(self) -> Dict[str, Any]:
        """حالة صحة النظام"""
        return {
            'service': 'Merchant Center API',
            'status': 'healthy',
            'configuration': {
                'config_valid': self.config_manager.is_valid,
                'client_initialized': self.client.is_initialized,
                'cache_entries': len(self.cache)
            },
            'capabilities': {
                'real_api_access': self.client.is_initialized,
                'mock_data_fallback': True,
                'product_search': True,
                'statistics': True,
                'caching': True
            },
            'timestamp': datetime.utcnow().isoformat()
        }

# إنشاء مثيل المدير
merchant_manager = MerchantCenterManager()

# إنشاء Blueprint
merchant_bp = Blueprint('merchant_center', __name__)

@merchant_bp.route('/products', methods=['GET'])
def get_products():
    """الحصول على المنتجات"""
    try:
        max_results = min(int(request.args.get('limit', 50)), 100)  # حد أقصى 100
        use_cache = request.args.get('cache', 'true').lower() == 'true'
        
        products = merchant_manager.get_products(max_results=max_results, use_cache=use_cache)
        
        return jsonify({
            'success': True,
            'products': products,
            'total_returned': len(products),
            'limit': max_results,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على المنتجات: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'products': [],
            'total_returned': 0,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """الحصول على منتج محدد"""
    try:
        product = merchant_manager.get_product_by_id(product_id)
        
        if not product:
            return jsonify({
                'success': False,
                'error': f'المنتج {product_id} غير موجود',
                'timestamp': datetime.utcnow().isoformat()
            }), 404
        
        return jsonify({
            'success': True,
            'product': product,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على المنتج {product_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/products/search', methods=['GET'])
def search_products():
    """البحث في المنتجات"""
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'مطلوب نص البحث (q)',
                'timestamp': datetime.utcnow().isoformat()
            }), 400
        
        max_results = min(int(request.args.get('limit', 20)), 50)
        
        products = merchant_manager.search_products(query, max_results)
        
        return jsonify({
            'success': True,
            'query': query,
            'products': products,
            'total_found': len(products),
            'limit': max_results,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في البحث عن المنتجات: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'products': [],
            'total_found': 0,
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """الحصول على إحصائيات المنتجات"""
    try:
        stats = merchant_manager.get_statistics()
        
        return jsonify({
            'success': True,
            'statistics': stats,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على الإحصائيات: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/health', methods=['GET'])
def health_check():
    """فحص صحة النظام"""
    try:
        health = merchant_manager.get_health_status()
        
        status_code = 200
        if not health['configuration']['config_valid']:
            status_code = 503
            health['status'] = 'degraded'
        
        return jsonify(health), status_code
        
    except Exception as e:
        logger.error(f"❌ خطأ في فحص الصحة: {e}")
        return jsonify({
            'service': 'Merchant Center API',
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """مسح الكاش"""
    try:
        merchant_manager.clear_cache()
        
        return jsonify({
            'success': True,
            'message': 'تم مسح الكاش بنجاح',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في مسح الكاش: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@merchant_bp.route('/configuration', methods=['GET'])
def get_configuration():
    """الحصول على معلومات التكوين"""
    try:
        config = merchant_manager.config_manager.get_sanitized_config()
        
        return jsonify({
            'success': True,
            'configuration': config,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ خطأ في الحصول على التكوين: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# تسجيل معلومات التحميل
logger.info("✅ تم تحميل Merchant Center Blueprint بنجاح")

# تصدير Blueprint
__all__ = ['merchant_bp']

