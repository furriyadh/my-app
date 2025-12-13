"""
Google Ads Client Helper
Provides a unified way to load Google Ads client from environment variables or YAML file
Works in both development and production environments
"""

import os
import logging

logger = logging.getLogger(__name__)

def get_google_ads_client():
    """
    إنشاء عميل Google Ads باستخدام متغيرات البيئة (الطريقة الموصى بها للإنتاج)
    أو ملف YAML كخيار احتياطي للتطوير المحلي
    """
    try:
        # استيراد المكتبة
        from google_ads_lib.client import GoogleAdsClient
        
        # جلب متغيرات البيئة
        developer_token = os.getenv('GOOGLE_ADS_DEVELOPER_TOKEN')
        client_id = os.getenv('GOOGLE_ADS_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_ADS_CLIENT_SECRET')
        refresh_token = os.getenv('GOOGLE_ADS_REFRESH_TOKEN')
        mcc_customer_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
        
        # التحقق من وجود جميع المتغيرات المطلوبة
        if all([developer_token, client_id, client_secret, refresh_token, mcc_customer_id]):
            logger.info("📦 تحميل Google Ads Client من متغيرات البيئة...")
            
            config_data = {
                'developer_token': developer_token,
                'client_id': client_id,
                'client_secret': client_secret,
                'refresh_token': refresh_token,
                'login_customer_id': mcc_customer_id,
                'use_proto_plus': True
            }
            
            client = GoogleAdsClient.load_from_dict(config_data, version='v21')
            logger.info("✅ تم إنشاء Google Ads Client بنجاح من متغيرات البيئة")
            return client
        
        # خيار احتياطي: استخدام ملف YAML (للتطوير المحلي فقط)
        logger.warning("⚠️ متغيرات البيئة غير مكتملة، محاولة تحميل من ملف YAML...")
        
        # محاولة إيجاد ملف YAML
        possible_paths = [
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 'services', 'google_ads.yaml'),
            os.path.join(os.path.dirname(__file__), '../services/google_ads.yaml'),
            'services/google_ads.yaml',
            'backend/services/google_ads.yaml',
        ]
        
        yaml_path = None
        for path in possible_paths:
            if os.path.exists(path):
                yaml_path = path
                break
        
        if yaml_path:
            logger.info(f"📄 تحميل Google Ads Client من ملف YAML: {yaml_path}")
            client = GoogleAdsClient.load_from_storage(yaml_path)
            logger.info("✅ تم إنشاء Google Ads Client بنجاح من ملف YAML")
            return client
        
        # لا يوجد ملف YAML ولا متغيرات بيئة كاملة
        missing_vars = []
        if not developer_token: missing_vars.append('GOOGLE_ADS_DEVELOPER_TOKEN')
        if not client_id: missing_vars.append('GOOGLE_ADS_CLIENT_ID')
        if not client_secret: missing_vars.append('GOOGLE_ADS_CLIENT_SECRET')
        if not refresh_token: missing_vars.append('GOOGLE_ADS_REFRESH_TOKEN')
        if not mcc_customer_id: missing_vars.append('MCC_LOGIN_CUSTOMER_ID')
        
        error_msg = f"❌ فشل في إنشاء Google Ads Client: متغيرات البيئة المفقودة: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
        
    except Exception as e:
        logger.error(f"❌ فشل في إنشاء Google Ads Client: {e}")
        raise e


def get_google_ads_client_for_customer(customer_id: str = None):
    """
    إنشاء عميل Google Ads مع تحديد customer_id معين
    """
    client = get_google_ads_client()
    
    if customer_id:
        # يمكن استخدام customer_id في العمليات اللاحقة
        logger.info(f"🎯 تم إنشاء Client للعميل: {customer_id}")
    
    return client


def get_customer_id() -> str:
    """
    Get the Google Ads customer ID from environment variables.
    Returns the customer ID or None if not configured.
    """
    # Try specific customer ID first
    customer_id = os.getenv('GOOGLE_ADS_CUSTOMER_ID')
    
    if customer_id:
        # Remove dashes if present (e.g., 123-456-7890 -> 1234567890)
        customer_id = customer_id.replace('-', '')
        logger.info(f"🎯 Using customer ID from GOOGLE_ADS_CUSTOMER_ID: {customer_id}")
        return customer_id
    
    # Fallback to MCC login customer ID
    mcc_id = os.getenv('MCC_LOGIN_CUSTOMER_ID')
    if mcc_id:
        mcc_id = mcc_id.replace('-', '')
        logger.info(f"🎯 Using customer ID from MCC_LOGIN_CUSTOMER_ID: {mcc_id}")
        return mcc_id
    
    logger.warning("⚠️ No customer ID found in environment variables")
    return None
