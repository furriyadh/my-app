import { Suspense } from 'react';
import DarkMode from "@/components/Authentication/DarkMode"; 
import ResetPasswordForm from "@/components/Authentication/ResetPasswordForm";

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">جاري تحميل الصفحة...</h2>
      <p className="text-gray-600 dark:text-gray-400">يرجى الانتظار</p>
    </div>
  </div>
);

// Component منفصل يحتوي على ResetPasswordForm
const ResetPasswordContent: React.FC = () => {
  return (
    <>
      <DarkMode />
      <ResetPasswordForm />
    </>
  );
};

// Main page component مع Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

