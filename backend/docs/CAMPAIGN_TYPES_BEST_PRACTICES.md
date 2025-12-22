# دليل أفضل الممارسات 100/100 لجميع أنواع الحملات - Google Ads API v21

## 📊 نظرة عامة على أنواع الحملات

حسب المكتبة الرسمية `google.ads.googleads.v21.enums.types.advertising_channel_type`:

1. **SEARCH (2)** - حملات الشبكة الإعلانية
2. **DISPLAY (3)** - شبكة Google الإعلانية فقط
3. **SHOPPING (4)** - حملات التسوق
4. **VIDEO (6)** - حملات الفيديو
5. **MULTI_CHANNEL (7)** - حملات التطبيقات
6. **PERFORMANCE_MAX (10)** - الأداء الأقصى
7. **DEMAND_GEN (14)** - توليد الطلب

---

## 1️⃣ SEARCH CAMPAIGNS (حملات البحث)

### 📋 المتطلبات الأساسية

#### A. **Responsive Search Ads (RSA)**
```python
# المتطلبات الرسمية من Google Ads API v21
HEADLINES:
  - Count: 15-30 (للحصول على EXCELLENT)
  - Max Length: 30 characters
  - Diversity Required: أرقام، عروض، كلمات مفتاحية، CTAs

DESCRIPTIONS:
  - Count: 4-5 (للحصول على EXCELLENT) 
  - Max Length: 90 characters
  - Min Length: 60 characters
  - MUST end with CTA
```

#### B. **Assets/Extensions**
```python
REQUIRED for Quality Score 10/10:
  ✅ Sitelinks: 4-8 links
  ✅ Callouts: 6-10 callouts (25 chars each)
  ✅ Structured Snippets: 1-2 snippets (3-10 values each)
  ✅ Call Extension: phone number + call reporting
  ✅ Promotion Extension: name + target + dates
  ✅ Image Extensions: 4+ images (recommended)
```

#### C. **Bidding Strategies**
```python
# من google.ads.googleads.v21.common.types.bidding
RECOMMENDED:
  - MaximizeConversions (للتحويلات)
  - TargetCpa (لتكلفة اكتساب محددة)
  - TargetRoas (لعائد إنفاق إعلاني محدد)
  - ManualCpc + Enhanced CPC (للتحكم اليدوي)

AVOID:
  - ManualCpc without Enhanced (أداء أقل)
```

#### D. **Keywords**
```python
BEST PRACTICES:
  - Count: 20-50 كلمة مفتاحية
  - Match Types: Mix of BROAD, PHRASE, EXACT
  - 70% Broad Match (with Smart Bidding)
  - 20% Phrase Match
  - 10% Exact Match
  - استخدام Negative Keywords
```

---

## 2️⃣ DISPLAY CAMPAIGNS (حملات الشبكة الإعلانية)

### 📋 المتطلبات الأساسية

#### A. **Responsive Display Ads**
```python
HEADLINES:
  - Short Headlines: 5+ (30 chars max)
  - Long Headline: 1-5 (90 chars max)

DESCRIPTIONS:
  - Count: 5+ descriptions
  - Max Length: 90 characters

IMAGES:
  - Marketing Images: 15+ images
  - Square: 1200x1200 (required)
  - Landscape: 1200x628 (required)
  - Logo: 1200x1200 (recommended)
  - Logo Square: 1200x1200 (recommended)

VIDEOS:
  - Count: 5+ videos (recommended)
  - YouTube video IDs
```

#### B. **Targeting**
```python
TARGETING OPTIONS:
  ✅ Demographics: age, gender, parental, income
  ✅ Audiences: in-market, affinity, custom
  ✅ Topics: relevant content topics
  ✅ Placements: specific websites/apps
  ✅ Keywords: contextual targeting
  
BEST PRACTICE:
  - استخدم 2-3 طرق استهداف
  - تجنب الإفراط في الاستهداف
```

#### C. **Bidding**
```python
RECOMMENDED:
  - Target CPA (للتحويلات)
  - Maximize Conversions
  - Target ROAS
  - Viewable CPM (للوعي بالعلامة التجارية)
```

---

## 3️⃣ PERFORMANCE MAX CAMPAIGNS (الأداء الأقصى)

### 📋 المتطلبات الأساسية

#### A. **Asset Groups** (مجموعات الأصول)
```python
# كل Asset Group يجب أن يحتوي على:

HEADLINES:
  - Count: 5-15 headlines
  - Max Length: 30 characters

LONG HEADLINES:
  - Count: 1-5 headlines
  - Max Length: 90 characters

DESCRIPTIONS:
  - Count: 4-5 descriptions
  - Max Length: 90 characters

IMAGES:
  - Marketing Images: 15-20 images
  - Square: 1200x1200 (min 3)
  - Landscape: 1200x628 (min 3)
  - Portrait: 960x1200 (min 2)
  - Logo: 1200x1200 (required)

VIDEOS:
  - Count: 5+ videos
  - YouTube video IDs
  - Horizontal (16:9) + Vertical (9:16) + Square (1:1)

BUSINESS NAME:
  - Required: company name
  - Max Length: 25 characters

CALL TO ACTION:
  - Required: CTA text
  - Examples: "Shop Now", "Learn More", "Sign Up"
```

#### B. **Audience Signals** (إشارات الجمهور)
```python
REQUIRED for best performance:
  ✅ Customer Lists (قوائم العملاء)
  ✅ Website Visitors (زوار الموقع)
  ✅ In-Market Audiences
  ✅ Custom Audiences
  ✅ Demographics

MINIMUM: 2-3 audience signals
```

#### C. **Conversion Goals** (أهداف التحويل)
```python
REQUIRED:
  - ربط Conversion Actions
  - تتبع: Purchases, Leads, Sign-ups, etc.
  - Value: تعيين قيمة لكل تحويل
```

#### D. **Budget**
```python
MINIMUM DAILY BUDGET:
  - $10-15 (لتجنب budget-constrained)
  
BIDDING:
  - Maximize Conversions (default)
  - Target CPA (after 30+ conversions)
  - Target ROAS (after 50+ conversions)
```

---

## 4️⃣ VIDEO CAMPAIGNS (حملات الفيديو)

### 📋 المتطلبات الأساسية

#### A. **Video Ad Formats**
```python
AD TYPES (من google.ads.googleads.v21):
  ✅ VIDEO_RESPONSIVE (recommended)
  ✅ IN_STREAM (skippable)
  ✅ IN_STREAM_NON_SKIPPABLE
  ✅ IN_FEED
  ✅ BUMPER (6 seconds)
  ✅ OUT_STREAM

BEST CHOICE:
  - VIDEO_RESPONSIVE (most flexible)
```

#### B. **Video Assets**
```python
HEADLINES:
  - Count: 5-15 headlines
  - Max Length: 30 characters

LONG HEADLINES:
  - Count: 1-5 headlines
  - Max Length: 90 characters

DESCRIPTIONS:
  - Count: 4-5 descriptions
  - Max Length: 90 characters

VIDEOS:
  - Count: 5+ videos (different lengths)
  - Horizontal: 16:9 (required)
  - Vertical: 9:16 (recommended)
  - Square: 1:1 (recommended)
  - Durations: 6s, 15s, 30s, 60s+

COMPANION BANNERS:
  - 300x60 (required)
  - 480x70 (recommended)

CALL TO ACTION:
  - Text: "Learn More", "Shop Now", etc.
  - Max Length: 10 characters
```

#### C. **Targeting**
```python
TARGETING OPTIONS:
  ✅ Demographics: age, gender, parental
  ✅ Audiences: in-market, affinity, custom
  ✅ Topics: relevant content
  ✅ Placements: YouTube channels/videos
  ✅ Keywords: contextual

YouTube-SPECIFIC:
  ✅ YouTube Channel targeting
  ✅ YouTube Video targeting
  ✅ YouTube Search results
```

#### D. **Bidding**
```python
RECOMMENDED:
  - Target CPV (cost per view)
  - Target CPM (للوعي بالعلامة التجارية)
  - Maximize Conversions
  
CPV RANGE:
  - $0.05 - $0.30 (typical)
```

---

## 5️⃣ DEMAND GEN CAMPAIGNS (توليد الطلب)

### 📋 المتطلبات الأساسية

#### A. **Ad Creative**
```python
# Similar to Performance Max but focused on:
- Gmail
- YouTube (Home, Watch, Discover)
- Discover Feed

REQUIREMENTS (same as Performance Max):
  - Headlines: 5-15
  - Long Headlines: 1-5
  - Descriptions: 4-5
  - Images: 15-20
  - Videos: 5+
  - Logo: required
```

#### B. **Targeting**
```python
FOCUS ON:
  ✅ In-Market Audiences (high intent)
  ✅ Custom Intent Audiences
  ✅ Similar Audiences (Lookalike)
  ✅ Demographics

GOAL:
  - Generate leads
  - Drive consideration
  - Increase brand awareness
```

#### C. **Bidding**
```python
RECOMMENDED:
  - Maximize Conversions
  - Target CPA
  - Target ROAS
```

---

## 6️⃣ SHOPPING CAMPAIGNS (حملات التسوق)

### 📋 المتطلبات الأساسية

#### A. **Merchant Center Setup**
```python
REQUIRED:
  ✅ Google Merchant Center account
  ✅ Product Feed (linked)
  ✅ Products approved
  ✅ Shipping settings
  ✅ Tax settings (if applicable)
```

#### B. **Product Feed Quality**
```python
REQUIRED ATTRIBUTES:
  - id (unique product ID)
  - title (max 150 chars)
  - description (max 5000 chars)
  - link (product URL)
  - image_link (main image)
  - price
  - availability (in stock, out of stock, preorder)
  - condition (new, used, refurbished)

RECOMMENDED ATTRIBUTES:
  - brand
  - gtin (Global Trade Item Number)
  - mpn (Manufacturer Part Number)
  - color
  - size
  - age_group
  - gender
  - product_type
  - additional_image_link (up to 10)
```

#### C. **Campaign Structure**
```python
BEST PRACTICES:
  - Priority: Low, Medium, High
  - Bidding: Manual CPC or Target ROAS
  - Negative Keywords: exclude irrelevant
  - Shopping Ads: Standard or Smart
```

---

## 7️⃣ APP CAMPAIGNS (MULTI_CHANNEL)

### 📋 المتطلبات الأساسية

#### A. **App Information**
```python
REQUIRED:
  ✅ App Store/Play Store link
  ✅ App ID
  ✅ Firebase/Conversion tracking

AD ASSETS:
  - Headlines: 5+ (30 chars)
  - Descriptions: 5+ (90 chars)
  - Images: 20+ images
  - Videos: 5+ videos
  - HTML5 Ads: optional
```

#### B. **Campaign Subtypes**
```python
APP INSTALL:
  - Goal: Drive app downloads
  - Bidding: Target CPA

APP ENGAGEMENT:
  - Goal: In-app actions
  - Bidding: Target CPA or Target ROAS
```

---

## 🎯 UNIVERSAL BEST PRACTICES (لجميع أنواع الحملات)

### 1. **Conversion Tracking** (تتبع التحويل)
```python
REQUIRED:
  ✅ Google Ads Conversion Tag
  ✅ Enhanced Conversions (recommended)
  ✅ Google Analytics 4 linking
  ✅ Offline Conversion Import (if applicable)
```

### 2. **Negative Keywords** (الكلمات السلبية)
```python
SEARCH CAMPAIGNS:
  - 50-200 negative keywords
  - Brand competitors
  - Irrelevant terms
  - Job-related terms (if not relevant)
```

### 3. **Ad Schedule** (جدولة الإعلانات)
```python
BEST PRACTICES:
  - تحليل أفضل أوقات الأداء
  - Bid adjustments: +20% to -50%
  - استهداف أيام محددة (إذا كان مناسباً)
```

### 4. **Location Targeting** (استهداف المواقع)
```python
PRECISION:
  - استخدام City-level (أفضل من Country)
  - Radius targeting (للأعمال المحلية)
  - Exclude irrelevant locations
```

### 5. **Device Targeting** (استهداف الأجهزة)
```python
BID ADJUSTMENTS:
  - Mobile: -20% to +50%
  - Desktop: -20% to +30%
  - Tablet: -20% to +20%
  
BASED ON:
  - Performance data
  - Mobile-friendliness
```

### 6. **Audience Targeting** (استهداف الجمهور)
```python
LAYERS:
  ✅ Customer Match (أعلى قيمة)
  ✅ Website Visitors (Remarketing)
  ✅ Similar Audiences
  ✅ In-Market Audiences
  ✅ Affinity Audiences
  ✅ Demographics
```

---

## 📊 Quality Score Factors (عوامل نقاط الجودة)

### For ALL Campaign Types:

#### 1. **Ad Relevance** (صلة الإعلان)
```
✅ استخدام الكلمات المفتاحية في العناوين
✅ تطابق الإعلان مع نية البحث
✅ محتوى محدد وليس عام
```

#### 2. **Expected CTR** (معدل النقر المتوقع)
```
✅ عناوين جذابة مع أرقام وعروض
✅ CTAs واضحة
✅ استخدام Ad Extensions
```

#### 3. **Landing Page Experience** (تجربة الصفحة)
```
✅ سرعة التحميل < 3 ثواني
✅ محتوى مطابق للإعلان
✅ متجاوب (Mobile-friendly)
✅ HTTPS (آمن)
✅ سهولة الاستخدام
```

---

## 🔧 Implementation Checklist (قائمة التطبيق)

### ✅ لكل نوع حملة:

1. **Search Campaigns**
   - [ ] 30 عنوان متنوع
   - [ ] 5 أوصاف (80-90 حرف)
   - [ ] 8-10 Callouts
   - [ ] 2 Structured Snippets
   - [ ] 4-8 Sitelinks
   - [ ] Call Extension (إذا متاح)
   - [ ] Promotion Extension
   - [ ] 20-50 كلمة مفتاحية

2. **Display Campaigns**
   - [ ] 5+ Short Headlines
   - [ ] 5 Long Headlines
   - [ ] 5 Descriptions
   - [ ] 15+ Images (Square + Landscape)
   - [ ] Logo (1200x1200)
   - [ ] 5+ Videos
   - [ ] Audience Targeting (2-3 طرق)

3. **Performance Max**
   - [ ] 15 Headlines
   - [ ] 5 Long Headlines
   - [ ] 5 Descriptions
   - [ ] 20 Images (all sizes)
   - [ ] 5+ Videos (all formats)
   - [ ] Logo + Business Name
   - [ ] Audience Signals
   - [ ] Conversion Tracking

4. **Video Campaigns**
   - [ ] 15 Headlines
   - [ ] 5 Long Headlines
   - [ ] 5 Descriptions
   - [ ] 5+ Videos (مختلف الأطوال)
   - [ ] Companion Banners
   - [ ] CTA واضح
   - [ ] YouTube Targeting

5. **Demand Gen**
   - [ ] Same as Performance Max
   - [ ] Focus on high-intent audiences
   - [ ] Lead generation setup

6. **Shopping Campaigns**
   - [ ] Merchant Center setup
   - [ ] Product Feed (complete attributes)
   - [ ] GTIN + Brand
   - [ ] High-quality images
   - [ ] Competitive pricing

7. **App Campaigns**
   - [ ] App Store link
   - [ ] 5+ Headlines
   - [ ] 5+ Descriptions  
   - [ ] 20+ Images
   - [ ] 5+ Videos
   - [ ] Conversion Tracking

---

## 🚀 التالي: التطبيق في الكود

سأقوم الآن بتطبيق هذه المتطلبات على جميع ملفات الحملات!

