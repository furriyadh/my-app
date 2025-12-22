# -*- coding: utf-8 -*-
"""
إعدادات استهداف الصناعات الذكية
Smart Industry Targeting Configuration
Google Ads API v21
"""

# ═══════════════════════════════════════════════════════════════════
# القيم الرسمية من Google Ads API v21
# ═══════════════════════════════════════════════════════════════════

# العمر AgeRangeType
AGE_18_24 = 503001
AGE_25_34 = 503002
AGE_35_44 = 503003
AGE_45_54 = 503004
AGE_55_64 = 503005
AGE_65_UP = 503006

# الجنس GenderType
MALE = 10
FEMALE = 11
GENDER_ALL = None

# الدخل IncomeRangeType
INCOME_0_50 = 510001
INCOME_50_60 = 510002
INCOME_60_70 = 510003
INCOME_70_80 = 510004
INCOME_80_90 = 510005
INCOME_90_UP = 510006

# الحالة الأبوية ParentalStatusType
PARENT = 300
NOT_A_PARENT = 301

# الأجهزة DeviceEnum
DEVICE_MOBILE = 2
DEVICE_TABLET = 3
DEVICE_DESKTOP = 4
DEVICE_TV = 6

# تحديد الظهور FrequencyCapTimeUnit
FREQ_DAY = 2
FREQ_WEEK = 3
FREQ_MONTH = 4

# ═══════════════════════════════════════════════════════════════════
# إعدادات 50 صناعة
# ═══════════════════════════════════════════════════════════════════

INDUSTRY_CONFIG = {
    # 1. التجارة الإلكترونية
    "ecommerce": {
        "name_ar": "تجارة إلكترونية",
        "name_en": "E-commerce",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 0.9},
        "keywords_ar": ["متجر", "تسوق", "شراء", "منتجات", "عروض", "خصومات", "توصيل", "سلة", "طلب", "دفع", "تخفيضات", "أونلاين", "ماركات", "أصلي", "ضمان", "شحن مجاني", "تقسيط", "استبدال"],
        "keywords_en": ["shop", "buy", "store", "products", "offers", "discount", "delivery", "order", "cart", "checkout", "sale", "online", "brands", "original", "warranty", "free shipping"],
        "detection_keywords": ["متجر", "shop", "store", "منتجات", "products", "تسوق", "shopping", "ecommerce", "سلة", "cart"]
    },
    
    # 2. التعليم
    "education": {
        "name_ar": "تعليم وتدريب",
        "name_en": "Education",
        "age_ranges": [AGE_18_24, AGE_25_34],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.0, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.1},
        "keywords_ar": ["تعليم", "دورة", "كورس", "تدريب", "شهادة", "معتمد", "تعلم", "مهارات", "محاضرة", "جامعة", "معهد", "دبلوم", "ماجستير", "امتحان", "منهج", "دراسة"],
        "keywords_en": ["education", "course", "training", "certificate", "online", "learn", "skills", "lecture", "university", "diploma", "master", "exam", "curriculum"],
        "detection_keywords": ["تعليم", "education", "دورة", "course", "تدريب", "training", "كورس", "معهد", "academy", "تعلم", "learn", "formation"]
    },
    
    # 3. العقارات
    "real_estate": {
        "name_ar": "عقارات",
        "name_en": "Real Estate",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["عقار", "شقة", "فيلا", "أرض", "إيجار", "بيع", "شراء", "سكن", "استثمار", "مخطط", "حي", "غرفة", "حديقة", "مسبح", "تمليك", "رهن"],
        "keywords_en": ["property", "apartment", "villa", "land", "rent", "sale", "buy", "residential", "investment", "plot", "garden", "pool", "mortgage"],
        "detection_keywords": ["عقار", "property", "شقة", "apartment", "فيلا", "villa", "إيجار", "rent", "عقارات", "real estate"]
    },
    
    # 4. المطاعم
    "restaurant": {
        "name_ar": "مطاعم وطعام",
        "name_en": "Restaurant",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 6,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.4, DEVICE_DESKTOP: 0.9, DEVICE_TABLET: 1.0},
        "keywords_ar": ["مطعم", "أكل", "طعام", "وجبات", "توصيل", "منيو", "حجز", "مشويات", "بيتزا", "برجر", "إفطار", "غداء", "عشاء", "كافيه", "قهوة", "حلويات"],
        "keywords_en": ["restaurant", "food", "meal", "delivery", "menu", "reservation", "grill", "pizza", "burger", "breakfast", "lunch", "dinner", "cafe", "coffee"],
        "detection_keywords": ["مطعم", "restaurant", "طعام", "food", "أكل", "وجبات", "meal", "كافيه", "cafe", "توصيل", "delivery"]
    },
    
    # 5. الصحة
    "healthcare": {
        "name_ar": "صحة ورعاية طبية",
        "name_en": "Healthcare",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.1, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["مستشفى", "عيادة", "طبيب", "دكتور", "علاج", "فحص", "تحليل", "أشعة", "عملية", "تأمين صحي", "طوارئ", "أسنان", "عيون", "قلب", "صيدلية", "دواء"],
        "keywords_en": ["hospital", "clinic", "doctor", "treatment", "checkup", "analysis", "xray", "surgery", "insurance", "emergency", "dental", "pharmacy", "medicine"],
        "detection_keywords": ["مستشفى", "hospital", "عيادة", "clinic", "طبيب", "doctor", "صحة", "health", "علاج", "treatment", "طبي", "medical"]
    },
    
    # 6. السفر
    "travel": {
        "name_ar": "سفر وسياحة",
        "name_en": "Travel",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.1},
        "keywords_ar": ["سفر", "سياحة", "رحلة", "حجز", "فندق", "طيران", "تذكرة", "فيزا", "منتجع", "شاطئ", "عمرة", "حج", "برنامج سياحي"],
        "keywords_en": ["travel", "tourism", "trip", "booking", "hotel", "flight", "ticket", "visa", "resort", "beach", "tour", "package"],
        "detection_keywords": ["سفر", "travel", "سياحة", "tourism", "حجز", "booking", "فندق", "hotel", "طيران", "flight", "رحلة", "trip"]
    },
    
    # 7. المالية
    "finance": {
        "name_ar": "مالية وبنوك",
        "name_en": "Finance",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": MALE,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.0, DEVICE_DESKTOP: 1.25, DEVICE_TABLET: 1.0},
        "keywords_ar": ["بنك", "حساب", "قرض", "تمويل", "بطاقة", "ائتمان", "استثمار", "أسهم", "تداول", "صندوق", "ادخار", "تحويل", "رهن", "تأمين"],
        "keywords_en": ["bank", "account", "loan", "finance", "card", "credit", "investment", "stocks", "trading", "fund", "savings", "mortgage", "insurance"],
        "detection_keywords": ["بنك", "bank", "تمويل", "finance", "استثمار", "investment", "قرض", "loan", "تداول", "trading", "مالي", "financial"]
    },
    
    # 8. الترفيه
    "entertainment": {
        "name_ar": "ترفيه",
        "name_en": "Entertainment",
        "age_ranges": [AGE_18_24, AGE_25_34],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 7,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.1},
        "keywords_ar": ["ترفيه", "ألعاب", "سينما", "فيلم", "مسلسل", "موسيقى", "حفلة", "مهرجان", "ملاهي", "نتفليكس", "يوتيوب"],
        "keywords_en": ["entertainment", "games", "cinema", "movie", "series", "music", "concert", "festival", "netflix", "youtube"],
        "detection_keywords": ["ترفيه", "entertainment", "ألعاب", "games", "سينما", "cinema", "فيلم", "movie", "موسيقى", "music"]
    },
    
    # 9. السيارات
    "automotive": {
        "name_ar": "سيارات",
        "name_en": "Automotive",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": MALE,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.15, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.0},
        "keywords_ar": ["سيارة", "سيارات", "معرض", "وكالة", "موديل", "جديد", "مستعمل", "قطع غيار", "صيانة", "إطارات", "تأمين", "تمويل", "تأجير"],
        "keywords_en": ["car", "cars", "showroom", "dealer", "model", "new", "used", "parts", "maintenance", "tires", "insurance", "finance", "rental"],
        "detection_keywords": ["سيارة", "car", "سيارات", "cars", "معرض", "showroom", "وكالة", "dealer", "صيانة", "maintenance"]
    },
    
    # 10. التقنية
    "technology": {
        "name_ar": "تقنية",
        "name_en": "Technology",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.1},
        "keywords_ar": ["تقنية", "تكنولوجيا", "برمجة", "تطبيق", "موقع", "سيرفر", "كلاود", "استضافة", "تصميم", "ذكاء اصطناعي", "بيانات", "أمن سيبراني"],
        "keywords_en": ["technology", "tech", "programming", "app", "website", "server", "cloud", "hosting", "design", "AI", "data", "cybersecurity"],
        "detection_keywords": ["تقنية", "technology", "برمجة", "programming", "تطبيق", "app", "موقع", "website", "تصميم", "design", "سوفتوير", "software"]
    },
    
    # 11. الموضة
    "fashion": {
        "name_ar": "موضة وأزياء",
        "name_en": "Fashion",
        "age_ranges": [AGE_18_24, AGE_25_34],
        "gender": FEMALE,
        "income": [INCOME_50_60, INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.1},
        "keywords_ar": ["ملابس", "فساتين", "عبايات", "جينز", "قمصان", "أحذية", "حقائب", "إكسسوارات", "ماركات", "موضة", "أزياء", "ستايل"],
        "keywords_en": ["clothes", "dresses", "jeans", "shirts", "shoes", "bags", "accessories", "brands", "fashion", "style"],
        "detection_keywords": ["ملابس", "clothes", "موضة", "fashion", "أزياء", "فساتين", "dress", "ستايل", "style"]
    },
    
    # 12. الرياضة
    "sports": {
        "name_ar": "رياضة ولياقة",
        "name_en": "Sports & Fitness",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": MALE,
        "income": None,
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.0},
        "keywords_ar": ["نادي", "جيم", "صالة", "تمارين", "لياقة", "رياضة", "يوقا", "سباحة", "كرة", "مكملات", "بروتين"],
        "keywords_en": ["gym", "fitness", "workout", "sports", "yoga", "swimming", "football", "supplements", "protein"],
        "detection_keywords": ["نادي", "gym", "رياضة", "sports", "لياقة", "fitness", "تمارين", "workout"]
    },
    
    # 13. خدمات المنازل
    "home_services": {
        "name_ar": "خدمات منزلية",
        "name_en": "Home Services",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تنظيف", "صيانة", "سباكة", "كهرباء", "تكييف", "نجارة", "دهان", "حدائق", "مكافحة حشرات", "نقل أثاث"],
        "keywords_en": ["cleaning", "maintenance", "plumbing", "electrical", "AC", "carpentry", "painting", "gardening", "pest control", "moving"],
        "detection_keywords": ["تنظيف", "cleaning", "صيانة", "maintenance", "سباكة", "plumbing", "كهرباء", "خدمات منزلية", "home services"]
    },
    
    # 14. B2B
    "b2b": {
        "name_ar": "أعمال وشركات",
        "name_en": "B2B / Business",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 0.9, DEVICE_DESKTOP: 1.3, DEVICE_TABLET: 1.0},
        "keywords_ar": ["شركات", "أعمال", "مؤسسات", "تجارة", "استيراد", "تصدير", "موردين", "مصانع", "حلول", "خدمات"],
        "keywords_en": ["business", "enterprise", "B2B", "corporate", "import", "export", "suppliers", "factories", "solutions"],
        "detection_keywords": ["شركات", "business", "مؤسسات", "enterprise", "B2B", "تجارية", "corporate", "marketing", "ads", "advertising", "publicité", "تسويق", "إعلان"]
    },
    
    # 15. الأطفال
    "kids": {
        "name_ar": "أطفال وعائلة",
        "name_en": "Kids & Family",
        "age_ranges": [AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": None,
        "parental": PARENT,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.2},
        "keywords_ar": ["أطفال", "ألعاب", "ملابس أطفال", "حفاضات", "حليب أطفال", "مدرسة", "حضانة", "تعليم أطفال", "كرتون"],
        "keywords_en": ["kids", "toys", "baby clothes", "diapers", "baby milk", "school", "nursery", "kids learning", "cartoon"],
        "detection_keywords": ["أطفال", "kids", "baby", "طفل", "ألعاب أطفال", "toys", "حضانة", "nursery"]
    },
    
    # 16. الجمال
    "beauty": {
        "name_ar": "جمال وعناية",
        "name_en": "Beauty & Cosmetics",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": FEMALE,
        "income": [INCOME_50_60, INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.1},
        "keywords_ar": ["مكياج", "عناية", "بشرة", "شعر", "صالون", "سبا", "كريم", "سيروم", "عطور", "مناكير"],
        "keywords_en": ["makeup", "skincare", "beauty", "hair", "salon", "spa", "cream", "serum", "perfume", "nails"],
        "detection_keywords": ["مكياج", "makeup", "جمال", "beauty", "بشرة", "skincare", "صالون", "salon"]
    },
    
    # 17. الحيوانات
    "pets": {
        "name_ar": "حيوانات أليفة",
        "name_en": "Pets",
        "age_ranges": [AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.05, DEVICE_TABLET: 1.0},
        "keywords_ar": ["قطط", "كلاب", "طيور", "أسماك", "حيوانات", "طعام حيوانات", "مستلزمات", "بيطري", "تربية"],
        "keywords_en": ["cats", "dogs", "birds", "fish", "pets", "pet food", "supplies", "veterinary", "breeding"],
        "detection_keywords": ["قطط", "cats", "كلاب", "dogs", "حيوانات", "pets", "pet shop"]
    },
    
    # 18. القانون
    "legal": {
        "name_ar": "قانون ومحاماة",
        "name_en": "Legal",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.15, DEVICE_DESKTOP: 1.25, DEVICE_TABLET: 1.0},
        "keywords_ar": ["محامي", "قانون", "قضية", "استشارة قانونية", "عقود", "تأسيس شركات", "توكيل", "محكمة"],
        "keywords_en": ["lawyer", "legal", "attorney", "case", "consultation", "contracts", "court"],
        "detection_keywords": ["محامي", "lawyer", "قانون", "legal", "قضية", "case", "محاماة", "attorney"]
    },
    
    # 19. التوظيف
    "jobs": {
        "name_ar": "توظيف وموارد بشرية",
        "name_en": "Jobs & HR",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.0},
        "keywords_ar": ["وظيفة", "وظائف", "عمل", "توظيف", "سيرة ذاتية", "مقابلة", "راتب", "فرص عمل", "HR"],
        "keywords_en": ["job", "jobs", "work", "employment", "resume", "CV", "interview", "salary", "career", "HR"],
        "detection_keywords": ["وظيفة", "job", "توظيف", "employment", "عمل", "work", "سيرة ذاتية", "resume"]
    },
    
    # 20. الزراعة
    "agriculture": {
        "name_ar": "زراعة وبستنة",
        "name_en": "Agriculture",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64],
        "gender": MALE,
        "income": None,
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.15, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["زراعة", "مزرعة", "نباتات", "بذور", "أسمدة", "ري", "حدائق", "مشتل", "أشجار", "زهور"],
        "keywords_en": ["farming", "farm", "plants", "seeds", "fertilizers", "irrigation", "garden", "nursery", "trees", "flowers"],
        "detection_keywords": ["زراعة", "farming", "مزرعة", "farm", "نباتات", "plants", "حديقة", "garden"]
    },
    
    # 21. المجوهرات
    "jewelry": {
        "name_ar": "مجوهرات",
        "name_en": "Jewelry",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": FEMALE,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["ذهب", "مجوهرات", "ألماس", "خواتم", "سلاسل", "أساور", "أقراط", "فضة", "لؤلؤ"],
        "keywords_en": ["gold", "jewelry", "diamond", "rings", "chains", "bracelets", "earrings", "silver", "pearl"],
        "detection_keywords": ["ذهب", "gold", "مجوهرات", "jewelry", "ألماس", "diamond"]
    },
    
    # 22. الأثاث
    "furniture": {
        "name_ar": "أثاث وديكور",
        "name_en": "Furniture & Decor",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.1},
        "keywords_ar": ["أثاث", "كنب", "سرير", "طاولة", "كراسي", "ستائر", "سجاد", "ديكور", "إضاءة", "مطبخ"],
        "keywords_en": ["furniture", "sofa", "bed", "table", "chairs", "curtains", "carpet", "decor", "lighting", "kitchen"],
        "detection_keywords": ["أثاث", "furniture", "ديكور", "decor", "كنب", "sofa", "مفروشات"]
    },
    
    # 23. الزفاف
    "wedding": {
        "name_ar": "زفاف ومناسبات",
        "name_en": "Weddings & Events",
        "age_ranges": [AGE_25_34, AGE_35_44],
        "gender": FEMALE,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.1},
        "keywords_ar": ["زفاف", "عرس", "فستان زفاف", "كوش", "تصوير", "دعوات", "حفلة", "منظم حفلات", "ورود", "زفة"],
        "keywords_en": ["wedding", "bridal", "gown", "photography", "invitations", "party", "planner", "flowers"],
        "detection_keywords": ["زفاف", "wedding", "عرس", "bridal", "فستان زفاف", "حفلة", "party"]
    },
    
    # 24. الإلكترونيات
    "electronics": {
        "name_ar": "إلكترونيات",
        "name_en": "Electronics",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": MALE,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.1},
        "keywords_ar": ["جوال", "موبايل", "لابتوب", "كمبيوتر", "شاشة", "تلفزيون", "سماعات", "ساعة ذكية", "تابلت", "ايفون", "سامسونج"],
        "keywords_en": ["phone", "mobile", "laptop", "computer", "screen", "TV", "headphones", "smartwatch", "tablet", "iPhone", "Samsung"],
        "detection_keywords": ["جوال", "phone", "لابتوب", "laptop", "إلكترونيات", "electronics", "تلفزيون", "TV"]
    },
    
    # 25. الدين
    "religious": {
        "name_ar": "دين وروحانيات",
        "name_en": "Religious",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.15, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.1},
        "keywords_ar": ["قرآن", "صلاة", "إسلام", "مصحف", "أذكار", "دعاء", "عمرة", "حج", "رمضان", "زكاة"],
        "keywords_en": ["quran", "prayer", "islamic", "hajj", "umrah", "ramadan", "zakat"],
        "detection_keywords": ["قرآن", "quran", "إسلام", "islamic", "صلاة", "prayer", "عمرة", "umrah", "حج", "hajj"]
    },
    
    # 26-50: المجالات المتبقية
    "insurance": {
        "name_ar": "تأمين",
        "name_en": "Insurance",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.1, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تأمين", "تأمين سيارات", "تأمين صحي", "تأمين حياة", "وثيقة", "تغطية", "حادث"],
        "keywords_en": ["insurance", "car insurance", "health insurance", "life insurance", "policy", "coverage"],
        "detection_keywords": ["تأمين", "insurance", "وثيقة", "policy"]
    },
    
    "printing": {
        "name_ar": "طباعة",
        "name_en": "Printing",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.15, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.0},
        "keywords_ar": ["طباعة", "مطبعة", "كروت", "بروشور", "لافتات", "استيكر", "بنر", "فلاير"],
        "keywords_en": ["printing", "print", "cards", "brochure", "banners", "sticker", "flyer"],
        "detection_keywords": ["طباعة", "printing", "مطبعة", "print"]
    },
    
    "logistics": {
        "name_ar": "نقل وشحن",
        "name_en": "Logistics",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["شحن", "نقل", "توصيل", "لوجستيك", "بريد", "تخليص جمركي", "استيراد"],
        "keywords_en": ["shipping", "transport", "delivery", "logistics", "courier", "customs", "import"],
        "detection_keywords": ["شحن", "shipping", "نقل", "transport", "توصيل", "delivery"]
    },
    
    "consulting": {
        "name_ar": "استشارات",
        "name_en": "Consulting",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.05, DEVICE_DESKTOP: 1.25, DEVICE_TABLET: 1.0},
        "keywords_ar": ["استشارات", "مستشار", "خبير", "دراسة جدوى", "تخطيط", "استراتيجية"],
        "keywords_en": ["consulting", "consultant", "expert", "feasibility", "planning", "strategy"],
        "detection_keywords": ["استشارات", "consulting", "مستشار", "consultant"]
    },
    
    "design": {
        "name_ar": "تصميم",
        "name_en": "Design",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.1},
        "keywords_ar": ["تصميم", "جرافيك", "لوقو", "هوية", "بوستر", "سوشيال ميديا", "موشن"],
        "keywords_en": ["design", "graphic", "logo", "identity", "poster", "social media", "motion"],
        "detection_keywords": ["تصميم", "design", "جرافيك", "graphic", "لوقو", "logo"]
    },
    
    "photography": {
        "name_ar": "تصوير",
        "name_en": "Photography",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": [INCOME_50_60, INCOME_60_70],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تصوير", "مصور", "فوتوغرافي", "استديو", "جلسة تصوير", "فيديو", "مونتاج"],
        "keywords_en": ["photography", "photographer", "studio", "photoshoot", "video", "editing"],
        "detection_keywords": ["تصوير", "photography", "مصور", "photographer", "استديو", "studio"]
    },
    
    "music": {
        "name_ar": "موسيقى",
        "name_en": "Music",
        "age_ranges": [AGE_18_24, AGE_25_34],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 6,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.0, DEVICE_TABLET: 1.0},
        "keywords_ar": ["موسيقى", "أغاني", "فنان", "ألبوم", "حفلة", "آلات موسيقية", "عود", "بيانو"],
        "keywords_en": ["music", "songs", "artist", "album", "concert", "instruments", "piano", "guitar"],
        "detection_keywords": ["موسيقى", "music", "أغاني", "songs", "فنان", "artist"]
    },
    
    "books": {
        "name_ar": "كتب ونشر",
        "name_en": "Books & Publishing",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_50_60, INCOME_60_70],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.2, DEVICE_TABLET: 1.2},
        "keywords_ar": ["كتب", "كتاب", "قراءة", "مكتبة", "روايات", "نشر", "مؤلف", "إلكتروني"],
        "keywords_en": ["books", "book", "reading", "library", "novels", "publishing", "author", "ebook"],
        "detection_keywords": ["كتب", "books", "كتاب", "book", "قراءة", "reading", "مكتبة", "library"]
    },
    
    "gaming": {
        "name_ar": "ألعاب فيديو",
        "name_en": "Gaming",
        "age_ranges": [AGE_18_24, AGE_25_34],
        "gender": MALE,
        "income": [INCOME_50_60, INCOME_60_70],
        "parental": None,
        "frequency_cap": 7,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.4, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["ألعاب", "قيمز", "بلايستيشن", "إكس بوكس", "PC", "أونلاين", "فورتنايت", "فيفا"],
        "keywords_en": ["games", "gaming", "playstation", "xbox", "PC", "online", "fortnite", "FIFA"],
        "detection_keywords": ["ألعاب", "games", "قيمز", "gaming", "بلايستيشن", "playstation", "إكس بوكس", "xbox"]
    },
    
    "perfume": {
        "name_ar": "عطور",
        "name_en": "Perfume",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["عطر", "عطور", "بخور", "عود", "مسك", "دهن عود", "معطر"],
        "keywords_en": ["perfume", "fragrance", "incense", "oud", "musk", "cologne"],
        "detection_keywords": ["عطر", "perfume", "عطور", "fragrance", "بخور", "incense", "عود", "oud"]
    },
    
    "watches": {
        "name_ar": "ساعات",
        "name_en": "Watches",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": MALE,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["ساعة", "ساعات", "رولكس", "كاسيو", "ذكية", "رجالية", "نسائية"],
        "keywords_en": ["watch", "watches", "rolex", "casio", "smart", "luxury"],
        "detection_keywords": ["ساعة", "watch", "ساعات", "watches"]
    },
    
    "shoes": {
        "name_ar": "أحذية",
        "name_en": "Shoes",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": GENDER_ALL,
        "income": [INCOME_50_60, INCOME_60_70],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.05, DEVICE_TABLET: 1.0},
        "keywords_ar": ["أحذية", "جزم", "نايك", "أديداس", "رياضية", "رسمية", "صنادل"],
        "keywords_en": ["shoes", "sneakers", "nike", "adidas", "sports", "formal", "sandals"],
        "detection_keywords": ["أحذية", "shoes", "جزم", "sneakers", "نايك", "nike"]
    },
    
    "bags": {
        "name_ar": "حقائب",
        "name_en": "Bags",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44],
        "gender": FEMALE,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.35, DEVICE_DESKTOP: 1.05, DEVICE_TABLET: 1.0},
        "keywords_ar": ["حقائب", "شنط", "حقيبة يد", "باكباك", "ماركات", "جلد"],
        "keywords_en": ["bags", "handbag", "backpack", "brands", "leather", "purse"],
        "detection_keywords": ["حقائب", "bags", "شنط", "handbag"]
    },
    
    "eyewear": {
        "name_ar": "نظارات",
        "name_en": "Eyewear",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["نظارات", "شمسية", "طبية", "عدسات", "إطارات", "راي بان"],
        "keywords_en": ["glasses", "sunglasses", "prescription", "lenses", "frames", "ray-ban"],
        "detection_keywords": ["نظارات", "glasses", "شمسية", "sunglasses"]
    },
    
    "cleaning_services": {
        "name_ar": "خدمات تنظيف",
        "name_en": "Cleaning Services",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.05, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تنظيف", "شركة تنظيف", "كنب", "سجاد", "موكيت", "منازل", "فلل"],
        "keywords_en": ["cleaning", "cleaning company", "sofa", "carpet", "house", "villa"],
        "detection_keywords": ["تنظيف", "cleaning", "شركة تنظيف", "cleaning company"]
    },
    
    "ac_services": {
        "name_ar": "تكييف",
        "name_en": "AC Services",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.05, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تكييف", "مكيف", "صيانة مكيفات", "تنظيف مكيفات", "سبليت", "مركزي"],
        "keywords_en": ["AC", "air conditioning", "maintenance", "split", "central"],
        "detection_keywords": ["تكييف", "AC", "مكيف", "air conditioning"]
    },
    
    "construction": {
        "name_ar": "مقاولات",
        "name_en": "Construction",
        "age_ranges": [AGE_35_44, AGE_45_54],
        "gender": MALE,
        "income": [INCOME_70_80, INCOME_80_90, INCOME_90_UP],
        "parental": None,
        "frequency_cap": 2,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.15, DEVICE_TABLET: 1.0},
        "keywords_ar": ["مقاولات", "بناء", "ترميم", "مقاول", "تشطيب", "هندسة", "معماري"],
        "keywords_en": ["construction", "building", "contractor", "renovation", "engineering", "architect"],
        "detection_keywords": ["مقاولات", "construction", "بناء", "building", "مقاول", "contractor"]
    },
    
    "oud_incense": {
        "name_ar": "عود وبخور",
        "name_en": "Oud & Incense",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80, INCOME_80_90],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["عود", "بخور", "دهن عود", "مبخر", "معطر", "عنبر", "مسك"],
        "keywords_en": ["oud", "incense", "agarwood", "amber", "musk"],
        "detection_keywords": ["عود", "oud", "بخور", "incense"]
    },
    
    "dates": {
        "name_ar": "تمور",
        "name_en": "Dates",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["تمر", "تمور", "رطب", "عجوة", "سكري", "مجدول", "خلاص"],
        "keywords_en": ["dates", "ajwa", "sukkari", "medjool", "khalas"],
        "detection_keywords": ["تمر", "dates", "تمور", "رطب"]
    },
    
    "coffee": {
        "name_ar": "قهوة",
        "name_en": "Coffee",
        "age_ranges": [AGE_18_24, AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 5,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.3, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["قهوة", "بن", "اسبريسو", "كابتشينو", "قهوة عربية", "مختصة", "محمصة"],
        "keywords_en": ["coffee", "espresso", "cappuccino", "arabic coffee", "specialty", "roaster"],
        "detection_keywords": ["قهوة", "coffee", "بن", "كافيه", "cafe"]
    },
    
    "honey": {
        "name_ar": "عسل",
        "name_en": "Honey",
        "age_ranges": [AGE_35_44, AGE_45_54, AGE_55_64, AGE_65_UP],
        "gender": GENDER_ALL,
        "income": [INCOME_60_70, INCOME_70_80],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["عسل", "عسل طبيعي", "عسل سدر", "عسل مانوكا", "عسل جبلي", "نحل"],
        "keywords_en": ["honey", "natural honey", "sidr honey", "manuka honey", "raw honey"],
        "detection_keywords": ["عسل", "honey"]
    },
    
    "natural_oils": {
        "name_ar": "زيوت طبيعية",
        "name_en": "Natural Oils",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": [INCOME_50_60, INCOME_60_70],
        "parental": None,
        "frequency_cap": 3,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.25, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": ["زيوت", "زيت طبيعي", "زيت زيتون", "زيت أرغان", "زيت جوز الهند", "زيت شعر"],
        "keywords_en": ["oils", "natural oil", "olive oil", "argan oil", "coconut oil", "hair oil"],
        "detection_keywords": ["زيوت", "oils", "زيت", "oil", "طبيعي", "natural"]
    }
}


def detect_industry(content: str) -> str:
    """
    اكتشاف الصناعة من المحتوى
    
    Args:
        content: محتوى الموقع أو الفيديو (العنوان + الوصف + الكلمات المفتاحية)
    
    Returns:
        اسم الصناعة المكتشفة أو 'general' إذا لم يتم التعرف عليها
    """
    content_lower = content.lower()
    
    # البحث عن أفضل تطابق
    best_match = None
    best_score = 0
    
    for industry_key, config in INDUSTRY_CONFIG.items():
        score = 0
        detection_keywords = config.get("detection_keywords", [])
        
        for keyword in detection_keywords:
            if keyword.lower() in content_lower:
                score += 1
        
        if score > best_score:
            best_score = score
            best_match = industry_key
    
    # إذا وجدنا تطابقاً بنتيجة 2 أو أكثر
    if best_score >= 2:
        return best_match
    
    return "general"


def get_industry_config(industry: str) -> dict:
    """
    الحصول على إعدادات الصناعة
    
    Args:
        industry: اسم الصناعة
    
    Returns:
        إعدادات الصناعة
    """
    return INDUSTRY_CONFIG.get(industry, {
        "name_ar": "عام",
        "name_en": "General",
        "age_ranges": [AGE_25_34, AGE_35_44, AGE_45_54],
        "gender": GENDER_ALL,
        "income": None,
        "parental": None,
        "frequency_cap": 4,
        "frequency_unit": FREQ_DAY,
        "device_bids": {DEVICE_MOBILE: 1.2, DEVICE_DESKTOP: 1.1, DEVICE_TABLET: 1.0},
        "keywords_ar": [],
        "keywords_en": [],
        "detection_keywords": []
    })
