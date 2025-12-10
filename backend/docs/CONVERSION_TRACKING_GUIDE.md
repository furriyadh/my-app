# دليل تتبع التحويلات (Conversion Tracking) - Google Ads API v21

## 📊 نظرة عامة

**تتبع التحويلات** هو العامل الأهم لنجاح أي حملة إعلانية على Google Ads. بدون تتبع التحويلات:
- ❌ لا يمكن قياس ROI (العائد على الاستثمار)
- ❌ استراتيجيات المزايدة الذكية (Smart Bidding) لن تعمل بشكل صحيح
- ❌ لا يمكن تحسين الحملات بناءً على الأداء الفعلي
- ❌ **Performance Max** و **Demand Gen** لن تعملا بدون تتبع التحويلات

---

## 1️⃣ أنواع التحويلات المتاحة

حسب `google.ads.googleads.v21.enums.types.conversion_action_type`:

### A. **Website Conversions** (تحويلات الموقع)
```python
CONVERSION_ACTION_TYPES = {
    "WEBPAGE": "زيارة صفحة معينة",
    "CLICK_TO_CALL": "الاتصال الهاتفي",
    "SALESFORCE": "تكامل Salesforce",
    "UPLOAD_CALLS": "رفع بيانات المكالمات",
    "UPLOAD_CLICKS": "رفع بيانات النقرات",
    "WEBPAGE_CODELESS": "تتبع بدون كود (Google Tag Manager)"
}
```

### B. **App Conversions** (تحويلات التطبيقات)
```python
APP_CONVERSIONS = {
    "ANDROID_APP": "تطبيق أندرويد",
    "IOS_APP": "تطبيق iOS",
    "ANDROID_IN_APP": "إجراءات داخل تطبيق أندرويد",
    "IOS_IN_APP": "إجراءات داخل تطبيق iOS"
}
```

### C. **Phone Call Conversions** (تحويلات المكالمات)
```python
PHONE_CONVERSIONS = {
    "CLICK_TO_CALL": "النقر للاتصال من الإعلان",
    "CALLS_FROM_ADS": "مكالمات من الإعلانات",
    "UPLOAD_CALLS": "رفع بيانات المكالمات"
}
```

### D. **Store Conversions** (تحويلات المتجر)
```python
STORE_CONVERSIONS = {
    "STORE_VISIT": "زيارة المتجر الفعلي",
    "STORE_SALE": "مبيعات المتجر"
}
```

---

## 2️⃣ إعداد Conversion Actions (إجراءات التحويل)

### الطريقة 1: Website Conversion (الأكثر شيوعاً)

```python
from google.ads.googleads.v21.resources.types.conversion_action import ConversionAction
from google.ads.googleads.v21.enums.types.conversion_action_category import ConversionActionCategoryEnum
from google.ads.googleads.v21.enums.types.conversion_action_status import ConversionActionStatusEnum
from google.ads.googleads.v21.enums.types.conversion_action_type import ConversionActionTypeEnum

def create_website_conversion_action(client, customer_id, conversion_name, url_pattern):
    """
    إنشاء Conversion Action لتتبع التحويلات على الموقع
    
    Args:
        conversion_name: اسم التحويل (مثل: "Purchase", "Lead Submission")
        url_pattern: نمط URL للتحويل (مثل: "example.com/thank-you")
    """
    conversion_action_service = client.get_service("ConversionActionService")
    
    # إنشاء Conversion Action
    conversion_action_operation = client.get_type("ConversionActionOperation")
    conversion_action = conversion_action_operation.create
    
    # الإعدادات الأساسية
    conversion_action.name = conversion_name
    conversion_action.type_ = ConversionActionTypeEnum.WEBPAGE
    conversion_action.category = ConversionActionCategoryEnum.PURCHASE  # أو LEAD, SIGNUP, etc.
    conversion_action.status = ConversionActionStatusEnum.ENABLED
    
    # القيمة والعملة
    conversion_action.value_settings.default_value = 100.0  # القيمة الافتراضية
    conversion_action.value_settings.always_use_default_value = True  # أو False إذا كانت القيمة ديناميكية
    conversion_action.value_settings.default_currency_code = "USD"  # أو "SAR" للريال السعودي
    
    # إعدادات الاحتساب
    conversion_action.counting_type = client.enums.ConversionActionCountingTypeEnum.ONE_PER_CLICK
    # أو MANY_PER_CLICK لحساب جميع التحويلات
    
    # نافذة التحويل (Conversion Window)
    conversion_action.click_through_lookback_window_days = 30  # 30 يوم بعد النقرة
    conversion_action.view_through_lookback_window_days = 1    # 1 يوم بعد المشاهدة
    
    # إنشاء Conversion Action
    response = conversion_action_service.mutate_conversion_actions(
        customer_id=customer_id,
        operations=[conversion_action_operation]
    )
    
    conversion_action_resource_name = response.results[0].resource_name
    print(f"✅ تم إنشاء Conversion Action: {conversion_action_resource_name}")
    
    return conversion_action_resource_name
```

### الطريقة 2: Click-to-Call Conversion

```python
def create_click_to_call_conversion(client, customer_id, phone_number):
    """
    إنشاء Conversion Action لتتبع المكالمات الهاتفية
    """
    conversion_action_service = client.get_service("ConversionActionService")
    
    conversion_action_operation = client.get_type("ConversionActionOperation")
    conversion_action = conversion_action_operation.create
    
    conversion_action.name = "Phone Calls from Ads"
    conversion_action.type_ = ConversionActionTypeEnum.CLICK_TO_CALL
    conversion_action.category = ConversionActionCategoryEnum.CONTACT
    conversion_action.status = ConversionActionStatusEnum.ENABLED
    
    # إعدادات المكالمات
    conversion_action.phone_call_duration_seconds = 60  # حد أدنى للمكالمة: 60 ثانية
    
    # القيمة
    conversion_action.value_settings.default_value = 50.0
    conversion_action.value_settings.always_use_default_value = True
    
    response = conversion_action_service.mutate_conversion_actions(
        customer_id=customer_id,
        operations=[conversion_action_operation]
    )
    
    return response.results[0].resource_name
```

### الطريقة 3: Upload Conversion (للتحويلات غير المباشرة)

```python
def create_upload_conversion_action(client, customer_id):
    """
    إنشاء Conversion Action لرفع التحويلات يدوياً
    مفيد لتتبع: المبيعات الهاتفية، المبيعات في المتجر، التحويلات CRM
    """
    conversion_action_service = client.get_service("ConversionActionService")
    
    conversion_action_operation = client.get_type("ConversionActionOperation")
    conversion_action = conversion_action_operation.create
    
    conversion_action.name = "Offline Sales"
    conversion_action.type_ = ConversionActionTypeEnum.UPLOAD_CLICKS  # أو UPLOAD_CALLS
    conversion_action.category = ConversionActionCategoryEnum.PURCHASE
    conversion_action.status = ConversionActionStatusEnum.ENABLED
    
    # القيمة الديناميكية (يتم تحديدها عند الرفع)
    conversion_action.value_settings.always_use_default_value = False
    conversion_action.value_settings.default_currency_code = "USD"
    
    response = conversion_action_service.mutate_conversion_actions(
        customer_id=customer_id,
        operations=[conversion_action_operation]
    )
    
    return response.results[0].resource_name
```

---

## 3️⃣ ربط Conversion Actions بالحملات

### تعيين Conversion Actions على مستوى الحساب

```python
def set_account_level_conversions(client, customer_id, conversion_action_resource_names):
    """
    تعيين Conversion Actions على مستوى الحساب (ستُستخدم في جميع الحملات)
    """
    customer_service = client.get_service("CustomerService")
    
    customer_operation = client.get_type("CustomerOperation")
    customer = customer_operation.update
    
    customer.resource_name = customer_service.customer_path(customer_id)
    
    # إضافة Conversion Actions
    for conversion_action_resource_name in conversion_action_resource_names:
        customer.conversion_actions.append(conversion_action_resource_name)
    
    # تحديد الحقول المراد تحديثها
    field_mask = client.get_type("FieldMask")
    field_mask.paths.append("conversion_actions")
    customer_operation.update_mask.CopyFrom(field_mask)
    
    response = customer_service.mutate_customer(
        customer_id=customer_id,
        operation=customer_operation
    )
    
    print("✅ تم ربط Conversion Actions بالحساب")
```

### تعيين Conversion Goals لحملة معينة

```python
def set_campaign_conversion_goals(client, customer_id, campaign_id, conversion_action_ids):
    """
    تعيين أهداف التحويل (Conversion Goals) لحملة محددة
    مطلوب لـ: Performance Max, Demand Gen
    """
    campaign_conversion_goal_service = client.get_service("CampaignConversionGoalService")
    
    operations = []
    
    for conversion_action_id in conversion_action_ids:
        operation = client.get_type("CampaignConversionGoalOperation")
        campaign_conversion_goal = operation.create
        
        campaign_conversion_goal.campaign = client.get_service("CampaignService").campaign_path(
            customer_id, campaign_id
        )
        campaign_conversion_goal.conversion_action = client.get_service("ConversionActionService").conversion_action_path(
            customer_id, conversion_action_id
        )
        
        operations.append(operation)
    
    response = campaign_conversion_goal_service.mutate_campaign_conversion_goals(
        customer_id=customer_id,
        operations=operations
    )
    
    print(f"✅ تم ربط {len(operations)} Conversion Goals بالحملة")
```

---

## 4️⃣ Enhanced Conversions (التحويلات المحسّنة)

**Enhanced Conversions** تحسّن دقة تتبع التحويلات باستخدام بيانات العملاء (مثل البريد الإلكتروني).

### تفعيل Enhanced Conversions

```python
def enable_enhanced_conversions(client, customer_id, conversion_action_resource_name):
    """
    تفعيل Enhanced Conversions لتحسين دقة التتبع
    """
    conversion_action_service = client.get_service("ConversionActionService")
    
    conversion_action_operation = client.get_type("ConversionActionOperation")
    conversion_action = conversion_action_operation.update
    
    conversion_action.resource_name = conversion_action_resource_name
    
    # تفعيل Enhanced Conversions
    conversion_action.value_settings.enhanced_conversions_for_leads_enabled = True
    
    # تحديد الحقول المراد تحديثها
    field_mask = client.get_type("FieldMask")
    field_mask.paths.append("value_settings.enhanced_conversions_for_leads_enabled")
    conversion_action_operation.update_mask.CopyFrom(field_mask)
    
    response = conversion_action_service.mutate_conversion_actions(
        customer_id=customer_id,
        operations=[conversion_action_operation]
    )
    
    print("✅ تم تفعيل Enhanced Conversions")
```

### رفع Enhanced Conversion Data

```python
def upload_enhanced_conversion(client, customer_id, conversion_action_id, gclid, conversion_date_time, 
                               conversion_value, email=None, phone=None):
    """
    رفع بيانات تحويل محسّن (Enhanced Conversion)
    """
    conversion_upload_service = client.get_service("ConversionUploadService")
    
    # إنشاء Click Conversion
    click_conversion = client.get_type("ClickConversion")
    click_conversion.conversion_action = client.get_service("ConversionActionService").conversion_action_path(
        customer_id, conversion_action_id
    )
    click_conversion.gclid = gclid  # Google Click ID
    click_conversion.conversion_date_time = conversion_date_time  # "2025-12-10 12:30:00+00:00"
    click_conversion.conversion_value = conversion_value
    click_conversion.currency_code = "USD"
    
    # إضافة بيانات Enhanced Conversion (مُهاشة)
    if email or phone:
        import hashlib
        
        user_identifiers = []
        
        if email:
            hashed_email = hashlib.sha256(email.lower().encode()).hexdigest()
            user_identifier = client.get_type("UserIdentifier")
            user_identifier.hashed_email = hashed_email
            user_identifiers.append(user_identifier)
        
        if phone:
            hashed_phone = hashlib.sha256(phone.encode()).hexdigest()
            user_identifier = client.get_type("UserIdentifier")
            user_identifier.hashed_phone_number = hashed_phone
            user_identifiers.append(user_identifier)
        
        click_conversion.user_identifiers.extend(user_identifiers)
    
    # رفع التحويل
    request = client.get_type("UploadClickConversionsRequest")
    request.customer_id = customer_id
    request.conversions.append(click_conversion)
    request.partial_failure = True
    
    response = conversion_upload_service.upload_click_conversions(request=request)
    
    print(f"✅ تم رفع Enhanced Conversion")
```

---

## 5️⃣ Conversion Tracking لكل نوع حملة

### A. **Search Campaigns**
```python
# المطلوب:
✅ إنشاء Conversion Action (WEBPAGE أو CLICK_TO_CALL)
✅ تثبيت Google Ads Conversion Tag على صفحة "شكراً"
✅ ربط Google Analytics 4 (اختياري لكن مُوصى به)
✅ تفعيل Enhanced Conversions (مُوصى به)

# التطبيق في الكود:
conversion_action_id = create_website_conversion_action(
    client, customer_id, 
    "Lead Submission", 
    "example.com/thank-you"
)
```

### B. **Display Campaigns**
```python
# المطلوب (نفس Search):
✅ Conversion Action
✅ Google Ads Tag
✅ Enhanced Conversions

# إضافة: Remarketing Lists
✅ إنشاء User List لإعادة الاستهداف
```

### C. **Performance Max**
```python
# المطلوب الإلزامي:
✅✅ Conversion Actions (REQUIRED - لن تعمل الحملة بدونها!)
✅ تعيين Conversion Goals للحملة
✅ Enhanced Conversions (مُوصى بشدة)
✅ Conversion Value (لاستخدام Target ROAS)

# التطبيق:
conversion_action_id = create_website_conversion_action(...)
set_campaign_conversion_goals(client, customer_id, campaign_id, [conversion_action_id])
```

### D. **Video Campaigns**
```python
# المطلوب:
✅ Conversion Actions
✅ YouTube Engaged View Conversions (مشاهدات متفاعلة)
✅ تتبع In-Stream و Bumper Ads بشكل منفصل

# نافذة التحويل:
- View-through: 1-3 أيام (مشاهدات)
- Click-through: 30 يوم (نقرات)
```

### E. **Demand Gen**
```python
# المطلوب الإلزامي (نفس Performance Max):
✅✅ Conversion Actions (REQUIRED)
✅ Conversion Goals
✅ Enhanced Conversions
✅ Audience Signals (لتحسين التحويلات)
```

### F. **Shopping Campaigns**
```python
# المطلوب:
✅ Conversion Actions (Purchase)
✅ Google Merchant Center Integration
✅ Enhanced Conversions for Purchases
✅ تتبع قيمة المنتج (Product Value Tracking)

# مُوصى به:
✅ Google Analytics 4 E-commerce Tracking
✅ Conversion Value Rules
```

---

## 6️⃣ Conversion Value Rules (قواعد قيمة التحويل)

```python
def create_conversion_value_rule(client, customer_id, conversion_action_id, 
                                 geo_location_id, value_adjustment_percent):
    """
    إنشاء قاعدة لتعديل قيمة التحويل حسب الموقع الجغرافي
    مثال: زيادة قيمة التحويلات من الرياض بنسبة 20%
    """
    conversion_value_rule_service = client.get_service("ConversionValueRuleService")
    
    operation = client.get_type("ConversionValueRuleOperation")
    conversion_value_rule = operation.create
    
    conversion_value_rule.action.operation = client.enums.ValueOperationEnum.MULTIPLY
    conversion_value_rule.action.value = 1 + (value_adjustment_percent / 100)
    
    # الشرط: الموقع الجغرافي
    geo_condition = conversion_value_rule.geo_location_condition
    geo_condition.included_geo_target_constants.append(
        client.get_service("GeoTargetConstantService").geo_target_constant_path(geo_location_id)
    )
    
    response = conversion_value_rule_service.mutate_conversion_value_rules(
        customer_id=customer_id,
        operations=[operation]
    )
    
    print(f"✅ تم إنشاء Conversion Value Rule")
```

---

## 7️⃣ تقرير التحويلات (Conversion Reporting)

```python
def get_conversion_report(client, customer_id, start_date, end_date):
    """
    الحصول على تقرير التحويلات
    """
    ga_service = client.get_service("GoogleAdsService")
    
    query = f"""
        SELECT
            campaign.id,
            campaign.name,
            metrics.conversions,
            metrics.conversions_value,
            metrics.cost_per_conversion,
            metrics.conversion_rate,
            metrics.all_conversions,
            metrics.all_conversions_value,
            segments.conversion_action_name,
            segments.conversion_action_category
        FROM campaign
        WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
        AND campaign.status = 'ENABLED'
        ORDER BY metrics.conversions DESC
    """
    
    response = ga_service.search_stream(customer_id=customer_id, query=query)
    
    for batch in response:
        for row in batch.results:
            print(f"Campaign: {row.campaign.name}")
            print(f"  Conversions: {row.metrics.conversions}")
            print(f"  Conversion Value: ${row.metrics.conversions_value:.2f}")
            print(f"  Cost per Conversion: ${row.metrics.cost_per_conversion:.2f}")
            print(f"  Conversion Rate: {row.metrics.conversion_rate:.2%}")
            print("-" * 50)
```

---

## 8️⃣ Checklist التطبيق

### ✅ **لكل حملة (بغض النظر عن النوع):**

1. [ ] إنشاء Conversion Action واحدة على الأقل
2. [ ] تثبيت Google Ads Conversion Tag على صفحات التحويل
3. [ ] التحقق من عمل التتبع (Test Conversion)
4. [ ] تفعيل Enhanced Conversions (مُوصى به)
5. [ ] ربط Google Analytics 4 (مُوصى به)
6. [ ] تحديد قيمة التحويل (Value)
7. [ ] تحديد نافذة التحويل (Conversion Window)
8. [ ] تحديد نوع الاحتساب (ONE_PER_CLICK أو MANY_PER_CLICK)

### ✅ **Performance Max و Demand Gen (إضافي):**

9. [ ] تعيين Conversion Goals للحملة
10. [ ] التأكد من وجود 30+ تحويل قبل استخدام Target CPA
11. [ ] التأكد من وجود 50+ تحويل قبل استخدام Target ROAS
12. [ ] إضافة Audience Signals

### ✅ **Shopping Campaigns (إضافي):**

13. [ ] ربط Google Merchant Center
14. [ ] تتبع Purchase Events
15. [ ] تحديد قيمة المنتج في كل تحويل

---

## 🎯 Best Practices (أفضل الممارسات)

1. **استخدم Conversion Categories بشكل صحيح:**
   - `PURCHASE` للمبيعات
   - `LEAD` لنماذج الاتصال
   - `SIGNUP` للتسجيلات
   - `PAGE_VIEW` لصفحات مهمة

2. **حدد قيمة واقعية للتحويل:**
   - استخدم متوسط قيمة الطلب (Average Order Value)
   - أو قيمة العميل المحتملة (Lead Value)

3. **استخدم Enhanced Conversions:**
   - يحسّن دقة التتبع بنسبة 20-30%
   - يقلل من فقدان البيانات (iOS 14.5+, Cookie Restrictions)

4. **تتبع تحويلات متعددة:**
   - Primary Conversion (التحويل الرئيسي): مبيعات، عملاء محتملون
   - Secondary Conversions (تحويلات ثانوية): إضافة إلى السلة، مشاهدة صفحة المنتج

5. **نافذة التحويل المناسبة:**
   - B2C: 7-30 يوم
   - B2B: 30-90 يوم
   - سلع رخيصة: 7-14 يوم
   - سلع غالية: 30-90 يوم

6. **اختبر التتبع:**
   ```bash
   # استخدم Google Tag Assistant للتحقق من عمل التتبع
   # زر صفحة التحويل وتحقق من إطلاق Tag
   ```

7. **راقب Conversion Lag:**
   - معظم التحويلات تحدث خلال 1-3 أيام من النقرة
   - انتظر 3-7 أيام قبل تقييم أداء الحملة

---

## 🚀 الخطوات التالية

1. ✅ تطبيق Conversion Tracking على جميع الحملات
2. ✅ التحقق من عمل التتبع (Test Conversion)
3. ✅ مراقبة التحويلات لمدة 7-14 يوم
4. ✅ تحسين الحملات بناءً على بيانات التحويل
5. ✅ استخدام Smart Bidding بعد جمع بيانات كافية

---

**ملاحظة:** تتبع التحويلات هو **الأساس** لنجاح أي حملة. استثمر الوقت في إعداده بشكل صحيح! 🎯

