import React from "react";

const SubscriptionsComponent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
          الاشتراكات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          اختر خطة الاشتراك التجارية الخاصة بك. لقد بدأنا مجانًا ولم نفرض كتابة كود بسيط
        </p>
      </div>

      {/* Currency Selector */}
      <div className="flex justify-end mb-8">
        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#0c1427] text-black dark:text-white">
          <option>USD</option>
          <option>EUR</option>
          <option>SAR</option>
        </select>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">⭐</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">أساسية</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            مجاني لمدة 7 أيام
          </p>
          <p className="text-4xl font-bold text-black dark:text-white mb-4">
            US$29
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/ شهر</span>
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-6">
            الترقية
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">الحملات 3</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">نص إعلاني مولد بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">بانرات وصور مولدة بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">Google, Microsoft, Meta, TikTok, Twitter</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">لوحة مؤشرات رئيسية</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">خدمات إعلانات Furriyadh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">ربط حسابات الإعلانات الخاصة بك</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">تحليلات متقدمة</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">أعضاء الفريق</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">تحسين الحملات بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">دعم المدرب</span>
            </div>
          </div>
        </div>

        {/* Advanced Plan */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">متقدمة</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            مجاني لمدة 7 أيام
          </p>
          <p className="text-4xl font-bold text-black dark:text-white mb-4">
            US$120
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/ شهر</span>
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-6">
            الترقية
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">الحملات 20</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">نص إعلاني مولد بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">بانرات وصور مولدة بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">Google, Microsoft, Meta, TikTok, Twitter</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">لوحة مؤشرات رئيسية</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">خدمات إعلانات Furriyadh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">ربط حسابات الإعلانات الخاصة بك</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">تحليلات متقدمة</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">أعضاء الفريق</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">تحسين الحملات بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-black dark:text-white">دعم المدرب</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsComponent;