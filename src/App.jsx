import React, { useEffect, useState } from 'react'
import './App.css'

// Import components
import GoogleAdsIndex from './components/Dashboard/GoogleAds'

// Import hooks
import { useAppState } from './hooks/useAppState'
import { useGoogleAuth } from './hooks/useGoogleAuth'

// Import utilities
import { WORKFLOW_STEPS } from './types'

function App() {
  const { 
    currentStep, 
    setCurrentStep, 
    error, 
    setError,
    isProcessing 
  } = useAppState();
  
  const { 
    isAuthenticated, 
    isLoading: authLoading,
    checkAuthStatus 
  } = useGoogleAuth();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check authentication status on app start
        await checkAuthStatus();
        
        // Set initial step based on auth status
        if (isAuthenticated) {
          setCurrentStep(WORKFLOW_STEPS.DASHBOARD);
        } else {
          setCurrentStep(WORKFLOW_STEPS.WEBSITE);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setError('فشل في تهيئة التطبيق');
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [isAuthenticated, checkAuthStatus, setCurrentStep, setError]);

  // Loading screen
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            جاري تحميل منصة إعلانات جوجل الذكية
          </h2>
          <p className="text-gray-500">
            يرجى الانتظار قليلاً...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            حدث خطأ
          </h1>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">
                  🚀 منصة إعلانات جوجل الذكية
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              <button
                onClick={() => setCurrentStep(WORKFLOW_STEPS.WEBSITE)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentStep === WORKFLOW_STEPS.WEBSITE
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                تحليل الموقع
              </button>
              
              {isAuthenticated && (
                <button
                  onClick={() => setCurrentStep(WORKFLOW_STEPS.DASHBOARD)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentStep === WORKFLOW_STEPS.DASHBOARD
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  لوحة التحكم
                </button>
              )}
            </nav>

            {/* User info */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-sm text-gray-700">
                    مرحباً 👋
                  </span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      👤
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  غير مسجل الدخول
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  جاري المعالجة...
                </h3>
                <p className="text-gray-500 text-sm">
                  يرجى عدم إغلاق النافذة
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Component */}
        <GoogleAdsIndex />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 منصة إعلانات جوجل الذكية. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                الدعم
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                الخصوصية
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                الشروط
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

