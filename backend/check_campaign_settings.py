#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
فحص إعدادات الحملة الفعلية في Google Ads
"""

import sys
import codecs
from google.ads.googleads.client import GoogleAdsClient

# إصلاح مشكلة Unicode في Windows
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

def check_campaign_settings(campaign_id):
    """فحص إعدادات الحملة"""
    
    # تحميل العميل
    client = GoogleAdsClient.load_from_storage("backend/google-ads.yaml")
    customer_id = "5582327249"
    
    ga_service = client.get_service("GoogleAdsService")
    
    # استعلام لجلب تفاصيل الحملة
    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.network_settings.target_google_search,
            campaign.network_settings.target_search_network,
            campaign.network_settings.target_content_network,
            campaign.network_settings.target_partner_search_network,
            campaign.geo_target_type_setting.positive_geo_target_type
        FROM campaign
        WHERE campaign.id = {campaign_id}
    """
    
    response = ga_service.search(customer_id=customer_id, query=query)
    
    for row in response:
        campaign = row.campaign
        print(f"\n📊 تفاصيل الحملة:")
        print(f"🆔 المعرف: {campaign.id}")
        print(f"📛 الاسم: {campaign.name}")
        print(f"📊 الحالة: {campaign.status.name}")
        print(f"📺 نوع القناة: {campaign.advertising_channel_type.name}")
        
        print(f"\n🌐 إعدادات الشبكة:")
        print(f"  ✅ Google Search: {campaign.network_settings.target_google_search}")
        print(f"  {'✅' if not campaign.network_settings.target_search_network else '❌'} Search Network: {campaign.network_settings.target_search_network}")
        print(f"  ✅ Content Network: {campaign.network_settings.target_content_network}")
        print(f"  ✅ Partner Search: {campaign.network_settings.target_partner_search_network}")
        
        print(f"\n📍 إعدادات الموقع الجغرافي:")
        print(f"  النوع: {campaign.geo_target_type_setting.positive_geo_target_type.name}")
    
    # جلب المواقع الجغرافية
    query_locations = f"""
        SELECT
            campaign_criterion.campaign,
            campaign_criterion.location.geo_target_constant,
            campaign_criterion.negative
        FROM campaign_criterion
        WHERE campaign_criterion.campaign = 'customers/{customer_id}/campaigns/{campaign_id}'
        AND campaign_criterion.type = 'LOCATION'
    """
    
    print(f"\n📍 المواقع الجغرافية المستهدفة:")
    response_locations = ga_service.search(customer_id=customer_id, query=query_locations)
    
    for row in response_locations:
        criterion = row.campaign_criterion
        location_id = criterion.location.geo_target_constant.split('/')[-1]
        is_negative = "❌ مستبعد" if criterion.negative else "✅ مستهدف"
        print(f"  {is_negative}: {location_id}")
    
    # جلب اللغات
    query_languages = f"""
        SELECT
            campaign_criterion.campaign,
            campaign_criterion.language.language_constant
        FROM campaign_criterion
        WHERE campaign_criterion.campaign = 'customers/{customer_id}/campaigns/{campaign_id}'
        AND campaign_criterion.type = 'LANGUAGE'
    """
    
    print(f"\n🌐 اللغات المستهدفة:")
    response_languages = ga_service.search(customer_id=customer_id, query=query_languages)
    
    for row in response_languages:
        criterion = row.campaign_criterion
        language_id = criterion.language.language_constant.split('/')[-1]
        print(f"  ✅ اللغة: {language_id}")

if __name__ == "__main__":
    # فحص الحملة الأخيرة
    campaign_id = "23136674879"  # آخر حملة تم إنشاؤها
    check_campaign_settings(campaign_id)

