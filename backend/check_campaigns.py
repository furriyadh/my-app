#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
فحص الحملات الموجودة في حساب Google Ads
"""

import os
import sys
from dotenv import load_dotenv

# إضافة المسار الحالي
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from google.ads.googleads.client import GoogleAdsClient
    from google.ads.googleads.errors import GoogleAdsException
except ImportError:
    print("❌ مكتبة Google Ads غير مثبتة")
    sys.exit(1)

def main():
    """فحص الحملات الموجودة"""
    
    # تحميل متغيرات البيئة
    try:
        load_dotenv('.env.development')
    except:
        pass
    
    try:
        # إنشاء العميل
        print("🔧 إنشاء عميل Google Ads...")
        client = GoogleAdsClient.load_from_storage()
        print("✅ تم إنشاء العميل بنجاح")
        
        # معرف العميل
        customer_id = '5582327249'
        print(f"🎯 فحص الحساب: {customer_id}")
        
        # خدمة الحملات
        google_ads_service = client.get_service('GoogleAdsService')
        
        # استعلام لجلب جميع الحملات
        query = '''
            SELECT 
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.advertising_channel_type,
                campaign.start_date,
                campaign.end_date,
                campaign_budget.amount_micros
            FROM campaign 
            ORDER BY campaign.id DESC
            LIMIT 20
        '''
        
        print("🔍 جلب الحملات...")
        response = google_ads_service.search(
            customer_id=customer_id,
            query=query
        )
        
        print('\n🎯 الحملات الموجودة في الحساب:')
        print('=' * 80)
        
        campaign_count = 0
        for row in response:
            campaign_count += 1
            campaign = row.campaign
            budget = row.campaign_budget
            
            print(f'📋 الحملة #{campaign_count}:')
            print(f'   🆔 المعرف: {campaign.id}')
            print(f'   📝 الاسم: {campaign.name}')
            print(f'   📊 الحالة: {campaign.status.name}')
            print(f'   🎯 النوع: {campaign.advertising_channel_type.name}')
            print(f'   📅 تاريخ البداية: {campaign.start_date}')
            if campaign.end_date:
                print(f'   📅 تاريخ النهاية: {campaign.end_date}')
            print(f'   💰 الميزانية: {budget.amount_micros / 1_000_000:.2f} دولار')
            print('-' * 60)
        
        if campaign_count == 0:
            print('❌ لا توجد حملات في الحساب')
        else:
            print(f'✅ إجمالي الحملات: {campaign_count}')
            
    except GoogleAdsException as ex:
        print(f"❌ خطأ في Google Ads API:")
        for error in ex.failure.errors:
            print(f"   - {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"     في الحقل: {field_path_element.field_name}")
    
    except Exception as e:
        print(f"❌ خطأ عام: {e}")

if __name__ == "__main__":
    main()
