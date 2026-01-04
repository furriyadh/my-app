# Trezo Template Design Standards - دليل تحويل المكونات

هذا الدليل يشرح كيفية تحويل أي مكون ليتوافق مع نمط تصميم **Trezo Template** المستخدم في المشروع.

---

## 📋 ملخص التغييرات الرئيسية

| العنصر | ❌ قبل (خاطئ) | ✅ بعد (صحيح) |
|--------|---------------|---------------|
| **حواف الكروت** | `rounded-xl` / `rounded-2xl` | `rounded-md` |
| **العنوان الرئيسي** | `<h1 className="text-2xl font-bold">` | `<h5 className="!mb-0">` |
| **عنوان الكارد** | `<h3 className="text-lg font-bold">` | `<h5 className="!mb-0">` |
| **padding الكروت** | `p-6` | `p-[20px] md:p-[25px]` |
| **خلفية الكارد** | `bg-gray-900` | `bg-[#0c1427]` |
| **Gradient headers** | `bg-gradient-to-r from-...` | خلفية بسيطة بدون gradient |

---

## 🎨 نمط الكارد الأساسي (Trezo Card Pattern)

### الهيكل الصحيح:
```tsx
<div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
    {/* Header */}
    <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
            <h5 className="!mb-0">
                {isRTL ? 'العنوان بالعربي' : 'Title in English'}
            </h5>
        </div>
        {/* Optional: Subtitle or Actions */}
        <div className="trezo-card-subtitle">
            {/* Dropdown, buttons, etc. */}
        </div>
    </div>

    {/* Content */}
    <div className="trezo-card-content">
        {/* Your content here */}
    </div>
</div>
```

---

## 📝 تفاصيل العناصر

### 1. العناوين (Titles)
```tsx
// ❌ خطأ
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Title</h1>
<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Title</h2>
<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Title</h3>

// ✅ صحيح - استخدم h5 مع !mb-0
<h5 className="!mb-0">Title</h5>

// ✅ صحيح - مع margin إذا لزم الأمر
<h5 className="!mb-[15px]">Title</h5>
```

### 2. حواف الكروت والعناصر (Border Radius)
```tsx
// ❌ خطأ
className="rounded-xl"
className="rounded-2xl"
className="rounded-lg"

// ✅ صحيح
className="rounded-md"
```

### 3. خلفية الكارد (Card Background)
```tsx
// ❌ خطأ
className="bg-white dark:bg-gray-900"
className="bg-white dark:bg-gray-800"

// ✅ صحيح
className="bg-white dark:bg-[#0c1427]"
```

### 4. Padding
```tsx
// ❌ خطأ
className="p-6"
className="p-5"

// ✅ صحيح
className="p-[20px] md:p-[25px]"
```

### 5. الأيقونات في الهيدر (Icon Boxes)
```tsx
// ❌ خطأ - مع gradient
<div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
    <Icon className="w-6 h-6 text-white" />
</div>

// ✅ صحيح - لون بسيط
<div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
</div>
```

### 6. الأزرار (Buttons)
```tsx
// ❌ خطأ
className="py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"

// ✅ صحيح
className="py-3 rounded-md bg-primary-600 hover:bg-primary-700"
```

### 7. حقول الإدخال (Inputs)
```tsx
// ❌ خطأ
className="px-4 py-3 rounded-xl border-2"

// ✅ صحيح
className="px-4 py-3 rounded-md border"
```

---

## 🔍 كيفية البحث عن العناصر التي تحتاج تحديث

### 1. البحث عن rounded-xl أو rounded-2xl:
```powershell
# في PowerShell
grep -r "rounded-xl" ./src/components/
grep -r "rounded-2xl" ./src/components/
```

### 2. البحث عن العناوين الخاطئة:
```powershell
grep -r "text-lg font-bold" ./src/
grep -r "text-2xl font-bold" ./src/
```

### 3. البحث عن الخلفيات الخاطئة:
```powershell
grep -r "dark:bg-gray-900" ./src/
grep -r "dark:bg-gray-800" ./src/
```

---

## 📁 الملفات المُحدّثة في هذه الجلسة

1. **`src/app/google-ads/billing/page.tsx`**
   - Page header → `<h5 className="!mb-0">`
   - Billing mode card → `trezo-card-header`
   - Choose your plan → `trezo-card-header`

2. **`src/app/google-ads/billing/checkout/page.tsx`**
   - Complete Subscription title → `<h5 className="!mb-0">`
   - Main card → `trezo-card rounded-md`
   - Order Summary → `trezo-card rounded-md`
   - All buttons/inputs → `rounded-md`

3. **`src/components/furriyadh/SubscriptionPaymentHistory.tsx`**
   - Removed gradient header
   - Applied `trezo-card-header` + `<h5 className="!mb-0">`

4. **`src/components/furriyadh/SavedPaymentMethods.tsx`**
   - Payment Methods card → `trezo-card-header`
   - Billing Address card → `trezo-card-header`
   - All inputs → `rounded-md`

5. **`src/components/furriyadh/FurriyadhPaymentGateway.tsx`**
   - All `rounded-xl` → `rounded-md`

6. **`src/components/furriyadh/FurriyadhBalanceCard.tsx`**
   - Header → `trezo-card-header`
   - Balance display → removed gradient
   - Stats grid → `rounded-md`

7. **`src/components/furriyadh/FurriyadhPromotionalCard.tsx`**
   - Offer cards → `rounded-md`

---

## 🎯 مرجع سريع من Trezo Template

المصدر الأساسي للتصميم: 
- **`src/components/Dashboard/HelpDesk/TicketsStatus.tsx`**

```tsx
// نموذج من TicketsStatus.tsx الأصلي
<div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
    <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
        <div className="trezo-card-title">
            <h5 className="!mb-0">Tickets Status</h5>
        </div>
        <div className="trezo-card-subtitle">
            {/* Dropdown */}
        </div>
    </div>
    <div className="trezo-card-content">
        {/* Chart or content */}
    </div>
</div>
```

---

## ⚡ أوامر استبدال سريعة

للاستبدال السريع في VS Code:
1. `Ctrl + H` للبحث والاستبدال
2. ابحث عن: `rounded-xl` → استبدل بـ: `rounded-md`
3. ابحث عن: `rounded-2xl` → استبدل بـ: `rounded-md`
4. ابحث عن: `dark:bg-gray-900` → استبدل بـ: `dark:bg-[#0c1427]`

---

## ✅ قائمة التحقق (Checklist)

- [ ] جميع الكروت تستخدم `trezo-card` class
- [ ] الخلفية `bg-white dark:bg-[#0c1427]`
- [ ] الحواف `rounded-md`
- [ ] الـ padding `p-[20px] md:p-[25px]`
- [ ] العناوين `<h5 className="!mb-0">`
- [ ] الهيدر `trezo-card-header mb-[20px] md:mb-[25px]`
- [ ] لا يوجد gradients في headers (إلا للـ CTAs)
- [ ] الأيقونات بألوان بسيطة (ليس gradient)
