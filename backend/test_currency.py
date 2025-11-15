#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""اختبار نظام العملات الحية"""

import requests
import json

try:
    print("🌐 جاري الاتصال بـ API العملات العالمي...")
    response = requests.get('https://api.exchangerate-api.com/v4/latest/USD', timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        rates = data.get('rates', {})
        
        print("\n" + "="*60)
        print("💵 سعر الدولار الأمريكي (USD) الآن:")
        print("="*60)
        
        # الجنيه المصري
        egp_rate = rates.get('EGP', 'N/A')
        print(f"\n🇪🇬 مصر:  1 USD = {egp_rate} EGP (جنيه مصري)")
        
        # أمثلة أخرى
        print(f"\n📊 أمثلة من الشرق الأوسط:")
        print(f"🇸🇦 السعودية:  1 USD = {rates.get('SAR', 'N/A')} SAR (ريال سعودي)")
        print(f"🇦🇪 الإمارات:  1 USD = {rates.get('AED', 'N/A')} AED (درهم إماراتي)")
        print(f"🇰🇼 الكويت:  1 USD = {rates.get('KWD', 'N/A')} KWD (دينار كويتي)")
        print(f"🇶🇦 قطر:  1 USD = {rates.get('QAR', 'N/A')} QAR (ريال قطري)")
        
        print(f"\n🌍 عملات عالمية:")
        print(f"🇪🇺 أوروبا:  1 USD = {rates.get('EUR', 'N/A')} EUR (يورو)")
        print(f"🇬🇧 بريطانيا:  1 USD = {rates.get('GBP', 'N/A')} GBP (جنيه إسترليني)")
        print(f"🇯🇵 اليابان:  1 USD = {rates.get('JPY', 'N/A')} JPY (ين ياباني)")
        
        print(f"\n✅ آخر تحديث: {data.get('date', 'N/A')}")
        print(f"📊 إجمالي العملات: {len(rates)}")
        print("="*60)
        
        # حساب أمثلة
        if egp_rate != 'N/A':
            print(f"\n💡 أمثلة تحويل:")
            print(f"   $1.50 USD = {1.50 * egp_rate:.2f} EGP")
            print(f"   $10 USD = {10 * egp_rate:.2f} EGP")
            print(f"   $100 USD = {100 * egp_rate:.2f} EGP")
        
        print("\n✅ النظام يعمل بنجاح! 🎉")
        
    else:
        print(f"❌ خطأ: API returned status {response.status_code}")
        
except requests.exceptions.Timeout:
    print("❌ انتهى الوقت المحدد للاتصال بـ API")
except Exception as e:
    print(f"❌ خطأ: {e}")

