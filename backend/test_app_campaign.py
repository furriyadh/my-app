# -*- coding: utf-8 -*-
"""
اختبار إنشاء حملة تطبيق - Test App Campaign Creation
=====================================================

هذا الملف يختبر إنشاء حملة تطبيق باستخدام ملف app_campaign.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google.ads.googleads.client import GoogleAdsClient
from campaign_types.app_campaign import AppCampaignCreator


def test_app_campaign_creation():
    """اختبار إنشاء حملة تطبيق"""
    
    print("=" * 60)
    print("🧪 اختبار إنشاء حملة تطبيق")
    print("=" * 60)
    
    # Check required environment variables
    required_vars = [
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET',
        'GOOGLE_ADS_REFRESH_TOKEN',
        'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
        'GOOGLE_ADS_CUSTOMER_ID'
    ]
    
    print("\n📋 فحص متغيرات البيئة...")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"   ✅ {var}: {'*' * 8}...{value[-4:] if len(value) > 4 else '****'}")
        else:
            print(f"   ❌ {var}: غير موجود!")
            return False
    
    # Create Google Ads client
    print("\n🔧 إنشاء Google Ads Client...")
    try:
        client = GoogleAdsClient.load_from_dict({
            "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
            "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
            "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
            "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
            "use_proto_plus": True
        }, version="v21")
        print("   ✅ تم إنشاء Client بنجاح")
    except Exception as e:
        print(f"   ❌ فشل إنشاء Client: {e}")
        return False
    
    # Get customer ID
    customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")
    print(f"\n👤 Customer ID: {customer_id}")
    
    # Create App Campaign Creator
    print("\n📱 إنشاء AppCampaignCreator...")
    creator = AppCampaignCreator(client, customer_id)
    
    # Get requirements
    print("\n📋 متطلبات حملات التطبيقات:")
    requirements = creator.get_campaign_requirements()
    print(f"   - Headlines: {requirements['text_requirements']['headlines']['min_count']}-{requirements['text_requirements']['headlines']['max_count']} (max {requirements['text_requirements']['headlines']['max_length']} chars)")
    print(f"   - Descriptions: {requirements['text_requirements']['descriptions']['min_count']}-{requirements['text_requirements']['descriptions']['max_count']} (max {requirements['text_requirements']['descriptions']['max_length']} chars)")
    print(f"   - Bidding: {requirements['bidding_strategy']['type']}")
    print(f"   - Goal: {requirements['bidding_strategy']['goal']}")
    
    # Test data
    print("\n📝 بيانات الاختبار:")
    test_data = {
        "campaign_name": "Test App Campaign - Furriyadh",
        "daily_budget": 10.0,  # $10/day
        "app_id": "com.google.android.apps.maps",  # Google Maps for testing
        "app_store": "GOOGLE_PLAY",
        "target_locations": ["2682"],  # Saudi Arabia
        "target_language": "1019",  # Arabic
        "headlines": [
            "Download Now",
            "Best App Ever"
        ],
        "descriptions": [
            "Experience the best app for your needs",
            "Download today and enjoy premium features"
        ]
    }
    
    for key, value in test_data.items():
        print(f"   {key}: {value}")
    
    # Ask for confirmation
    print("\n" + "=" * 60)
    confirm = input("هل تريد إنشاء الحملة؟ (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("❌ تم إلغاء الاختبار")
        return False
    
    # Create the campaign
    print("\n🚀 إنشاء الحملة...")
    try:
        campaign_id = creator.create_app_campaign(
            campaign_name=test_data["campaign_name"],
            daily_budget=test_data["daily_budget"],
            app_id=test_data["app_id"],
            app_store=test_data["app_store"],
            target_locations=test_data["target_locations"],
            target_language=test_data["target_language"],
            headlines=test_data["headlines"],
            descriptions=test_data["descriptions"]
        )
        
        print("\n" + "=" * 60)
        print(f"🎉 تم إنشاء الحملة بنجاح!")
        print(f"📊 Campaign ID: {campaign_id}")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ فشل إنشاء الحملة: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_app_campaign_creation()
    sys.exit(0 if success else 1)
