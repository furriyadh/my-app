import React from "react";

const PaymentsComponent: React.FC = () => {
  return (
    <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 rounded-lg p-6">
      <h1 className="text-2xl font-bold text-black dark:text-gray-800 mb-4">
        المدفوعات
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        هنا يمكنك عرض سجل مدفوعاتك.
      </p>
      {/* Add your payments content here */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black dark:text-gray-800 mb-4">سجل المدفوعات</h2>
        <div className="bg-white/10 backdrop-blur-md border border-blue-200/20 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            لا توجد مدفوعات سابقة لعرضها.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsComponent;