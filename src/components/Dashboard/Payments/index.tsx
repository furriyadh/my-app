import React from "react";

const PaymentsComponent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6">
      <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
        المدفوعات
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        هنا يمكنك عرض سجل مدفوعاتك.
      </p>
      {/* Add your payments content here */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">سجل المدفوعات</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            لا توجد مدفوعات سابقة لعرضها.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsComponent;