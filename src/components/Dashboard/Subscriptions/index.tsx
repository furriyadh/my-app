import React from "react";

const SubscriptionsComponent: React.FC = () => {
  return (
    <div className="bg-transparent rounded-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-gray-800 mb-2">
          الاشتراكات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          اختر خطة الاشتراك التجارية الخاصة بك. لقد بدأنا مجانًا ولم نفرض كتابة كود بسيط
        </p>
      </div>

      {/* Currency Selector */}
      <div className="flex justify-end mb-8">
        <select className="px-4 py-2 border border-blue-300/30 rounded-lg bg-white/15 backdrop-blur-md text-black dark:text-gray-800">
          <option>USD</option>
          <option>EUR</option>
          <option>SAR</option>
        </select>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <div className="bg-white/15 backdrop-blur-md border border-purple-300/30 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-800 font-bold">⭐</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-gray-800">أساسية</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            مجاني لمدة 7 أيام
          </p>
          <p className="text-4xl font-bold text-black dark:text-gray-800 mb-4">
            US$29
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/ شهر</span>
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors mb-6">
            الترقية
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">الحملات 3</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">نص إعلاني مولد بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">بانرات وصور مولدة بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">Google, Microsoft, Meta, TikTok, Twitter</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">لوحة مؤشرات رئيسية</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">خدمات إعلانات Furriyadh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">ربط حسابات الإعلانات الخاصة بك</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">تحليلات متقدمة</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">أعضاء الفريق</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">تحسين الحملات بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">دعم المدرب</span>
            </div>
          </div>
        </div>

        {/* Advanced Plan */}
        <div className="bg-white/15 backdrop-blur-md border border-blue-300/30 rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-800 font-bold">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-black dark:text-gray-800">متقدمة</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            مجاني لمدة 7 أيام
          </p>
          <p className="text-4xl font-bold text-black dark:text-gray-800 mb-4">
            US$120
            <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/ شهر</span>
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors mb-6">
            الترقية
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">الحملات 20</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">نص إعلاني مولد بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">بانرات وصور مولدة بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">Google, Microsoft, Meta, TikTok, Twitter</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">لوحة مؤشرات رئيسية</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">خدمات إعلانات Furriyadh</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">ربط حسابات الإعلانات الخاصة بك</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">تحليلات متقدمة</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">أعضاء الفريق</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">تحسين الحملات بالذكاء الاصطناعي</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-gray-800 text-xs">✓</span>
              </div>
              <span className="text-black dark:text-gray-800">دعم المدرب</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsComponent;