import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ChevronLeft, Globe, MapPin, Plus } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  completed: boolean;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface AdAccount {
  id: string;
  name: string;
  type: 'managed' | 'own';
}

const NewCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [showCustomBudgetModal, setShowCustomBudgetModal] = useState(false);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Form data
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [customBudget, setCustomBudget] = useState('');
  const [hasExistingBalance, setHasExistingBalance] = useState(false); // Simulate user balance check
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  // Billing details
  const [billingDetails, setBillingDetails] = useState({
    companyName: '',
    country: '',
    city: '',
    postalCode: '',
    address: '',
    vatNumber: ''
  });

  const steps: Step[] = [
    { id: 1, title: 'Website URL', completed: currentStep > 1 },
    { id: 2, title: 'Language', completed: currentStep > 2 },
    { id: 3, title: 'Location', completed: currentStep > 3 },
    { id: 4, title: 'Campaign Name', completed: currentStep > 4 },
    { id: 5, title: 'Platform', completed: currentStep > 5 },
    { id: 6, title: 'Ad Account', completed: currentStep > 6 },
    { id: 7, title: 'Keywords', completed: currentStep > 7 },
    { id: 8, title: 'Budget', completed: currentStep > 8 },
    { id: 9, title: 'Billing', completed: currentStep > 9 },
    { id: 10, title: 'Payment', completed: currentStep > 10 },
  ];

  const platforms: Platform[] = [
    { id: 'google', name: 'Google Ads', icon: '🔍', description: 'Search Engine Marketing', color: 'bg-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: '📘', description: 'Social Media Marketing', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📸', description: 'Visual Social Media', color: 'bg-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', description: 'Professional Networking', color: 'bg-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', description: 'Microblogging Platform', color: 'bg-blue-400' },
    { id: 'microsoft', name: 'Microsoft Ads', icon: '📊', description: 'Bing Search & Audience Network', color: 'bg-yellow-500' },
  ];

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const locations = [
    { id: 'riyadh', name: 'الرياض', country: 'السعودية' },
    { id: 'jeddah', name: 'جدة', country: 'السعودية' },
    { id: 'dammam', name: 'الدمام', country: 'السعودية' },
    { id: 'mecca', name: 'مكة المكرمة', country: 'السعودية' },
    { id: 'medina', name: 'المدينة المنورة', country: 'السعودية' },
  ];

  const adAccounts: AdAccount[] = [
    { id: 'managed', name: 'Managed Shown account', type: 'managed' },
    { id: 'own', name: 'My own ad account', type: 'own' },
  ];

  const budgetOptions = [
    { amount: 3, description: 'This is the least you must spend. Otherwise, there will be no results.', recommended: false },
    { amount: 10, description: 'We recommend to start with this amount for the most optimal results.', recommended: true },
    { amount: 25, description: 'This is the best price if you are looking for fast and better results.', recommended: false },
  ];

  const currencies = ['EUR', 'USD', 'GBP', 'INR', 'BRL'];

  const countries = [
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'KW', name: 'Kuwait' },
  ];

  const handleNext = () => {
    if (currentStep === 5 && !selectedPlatform) {
      setShowPlatformModal(true);
      return;
    }
    if (currentStep === 6 && !selectedAccount) {
      setShowAccountModal(true);
      return;
    }

    if (currentStep < 10) {
      // Check if we should skip billing details based on existing balance
      if (currentStep === 8 && hasExistingBalance) {
        setCurrentStep(10); // Skip billing and go directly to payment
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Final step - process payment
      handlePayment();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // If going back from payment and we skipped billing, go back to budget
      if (currentStep === 10 && hasExistingBalance) {
        setCurrentStep(8);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setShowPlatformModal(false);
    setCurrentStep(6);
  };

  const handleAccountSelect = (account: AdAccount) => {
    setSelectedAccount(account);
    if (account.type === 'own') {
      setShowAccountModal(false);
      setShowGoogleAuth(true);
    } else {
      setShowAccountModal(false);
      setIsGeneratingAds(true);
      setTimeout(() => {
        setIsGeneratingAds(false);
        setCurrentStep(7); // Go to keywords step
      }, 3000);
    }
  };

  const handleGoogleAuth = () => {
    setShowGoogleAuth(false);
    setIsGeneratingAds(true);
    setTimeout(() => {
      setIsGeneratingAds(false);
      setCurrentStep(7); // Go to keywords step
    }, 3000);
  };

  const handleBudgetSelect = (amount: number) => {
    setSelectedBudget(amount);
  };

  const handleCustomBudget = () => {
    setShowCustomBudgetModal(true);
  };

  const handleCustomBudgetSave = () => {
    const budget = parseFloat(customBudget);
    if (budget >= 3) {
      setSelectedBudget(budget);
      setShowCustomBudgetModal(false);
      setCustomBudget('');
    }
  };

  const handleBillingDetailsChange = (field: string, value: string) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    // Simulate payment process
    setTimeout(() => {
      setIsProcessingPayment(false);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }, 3000);
  };

  const calculateTotal = () => {
    if (!selectedBudget) return 0;
    return selectedBudget * 5; // 5 days advance payment
  };

  const calculateEstimatedResults = () => {
    if (!selectedBudget) return { impressions: 0, clicks: 0 };
    
    // Simple calculation based on budget
    const impressions = selectedBudget * 1000;
    const clicks = Math.round(selectedBudget * 50);
    
    return { impressions, clicks };
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return websiteUrl.length > 0;
      case 2: return selectedLanguage.length > 0;
      case 3: return selectedLocation.length > 0;
      case 4: return campaignName.length > 0;
      case 5: return selectedPlatform !== null;
      case 6: return selectedAccount !== null;
      case 7: return true; // Keywords are optional
      case 8: return selectedBudget !== null;
      case 9: return billingDetails.companyName && billingDetails.country && billingDetails.city && billingDetails.address;
      case 10: return selectedPaymentMethod.length > 0;
      default: return false;
    }
  };

  const getButtonText = () => {
    if (currentStep === 10) return 'إتمام الدفع';
    if (currentStep === 8 && hasExistingBalance) return 'إنشاء الحملة';
    return 'التالي';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What website do you want to promote?</h2>
              <p className="text-gray-600">أدخل رابط موقعك الإلكتروني للحملة الإعلانية</p>
            </div>
            <input
              type="url"
              placeholder="https://www.example.com"
              value={websiteUrl}
              onChange={(e ) => setWebsiteUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your campaign language</h2>
              <p className="text-gray-600">اختر اللغة التي تريد استهدافها في حملتك الإعلانية</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLanguage === lang.code
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  <div className="text-4xl mb-2">{lang.flag}</div>
                  <div className="font-medium text-gray-800">{lang.name}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your target location</h2>
              <p className="text-gray-600">اختر الدولة أو المدينة أو الحي أو الولاية أو الرمز البريدي</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLocation === loc.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedLocation(loc.id)}
                >
                  <div className="font-medium text-gray-800">{loc.name}</div>
                  <div className="text-sm text-gray-500">{loc.country}</div>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-500">
              <MapPin className="h-8 w-8 mr-2" />
              خريطة تفاعلية هنا
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign name</h2>
              <p className="text-gray-600">أدخل اسم حملتك الإعلانية</p>
            </div>
            <input
              type="text"
              placeholder="test"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a platform to advertise on</h2>
              <p className="text-gray-600">اختر المنصة الإعلانية التي ترغب في استخدامها</p>
            </div>
            {selectedPlatform && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPlatform.color}`}>
                    <span className="text-white text-xl">{selectedPlatform.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">{selectedPlatform.name}</h3>
                    <p className="text-sm text-green-700">{selectedPlatform.description}</p>
                  </div>
                </div>
              </div>
            )}
            {!selectedPlatform && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="border rounded-lg p-4 cursor-pointer transition-all border-gray-300 hover:border-gray-400"
                    onClick={() => handlePlatformSelect(platform)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${platform.color}`}>
                        <span className="text-white text-xl">{platform.icon}</span>
                      </div>
                      <span className="font-medium text-gray-800">{platform.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select the ad account you would like to use</h2>
              <p className="text-gray-600">اختر حساب الإعلان الذي ترغب في استخدامه</p>
            </div>
            {selectedAccount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <h3 className="font-semibold text-green-900">{selectedAccount.name}</h3>
                    <p className="text-sm text-green-700">
                      {selectedAccount.type === 'managed' ? 'حساب مُدار بواسطة Shown' : 'حسابك الشخصي'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!selectedAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border rounded-lg p-4 cursor-pointer transition-all border-gray-300 hover:border-gray-400"
                    onClick={() => handleAccountSelect(account)}
                  >
                    <div className="font-medium text-gray-800">{account.name}</div>
                    <div className="text-sm text-gray-500">
                      {account.type === 'managed' ? 'حساب مُدار بواسطة Shown' : 'حسابك الشخصي'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Keywords</h2>
              <p className="text-gray-600">أدخل الكلمات المفتاحية التي تصف منتجك أو خدمتك</p>
            </div>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              rows={5}
              placeholder="مثال: تسويق رقمي، إعلانات جوجل، تحسين محركات البحث"
            ></textarea>
            <div className="text-sm text-gray-500">
              <p>سيتم استخدام هذه الكلمات المفتاحية لاستهداف الجمهور المناسب.</p>
            </div>
          </div>
        );

      case 8:
        const { impressions, clicks } = calculateEstimatedResults();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your budget</h2>
              <p className="text-gray-600">اختر الميزانية التي تناسب حملتك الإعلانية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetOptions.map((option, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBudget === option.amount
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleBudgetSelect(option.amount)}
                >
                  <div className="font-bold text-xl mb-2">${option.amount}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                  {option.recommended && (
                    <span className="mt-2 inline-block text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Recommended</span>
                  )}
                </div>
              ))}
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedBudget !== null && !budgetOptions.some(opt => opt.amount === selectedBudget)
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={handleCustomBudget}
              >
                <div className="font-bold text-xl mb-2">Custom Budget</div>
                <div className="text-sm text-gray-600">أدخل ميزانية مخصصة لحملتك.</div>
              </div>
            </div>
            {selectedBudget && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-blue-900 mb-2">Estimated Results:</h3>
                <p className="text-blue-700">Impressions: {impressions.toLocaleString()}</p>
                <p className="text-blue-700">Clicks: {clicks.toLocaleString()}</p>
              </div>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Details</h2>
              <p className="text-gray-600">أدخل تفاصيل الفواتير الخاصة بك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                <input type="text" id="companyName" value={billingDetails.companyName} onChange={(e) => handleBillingDetailsChange('companyName', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <select id="country" value={billingDetails.country} onChange={(e) => handleBillingDetailsChange('country', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" id="city" value={billingDetails.city} onChange={(e) => handleBillingDetailsChange('city', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input type="text" id="postalCode" value={billingDetails.postalCode} onChange={(e) => handleBillingDetailsChange('postalCode', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" id="address" value={billingDetails.address} onChange={(e) => handleBillingDetailsChange('address', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">VAT Number (Optional)</label>
                <input type="text" id="vatNumber" value={billingDetails.vatNumber} onChange={(e) => handleBillingDetailsChange('vatNumber', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
        );

      case 10:
        const totalAmount = calculateTotal();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
              <p className="text-gray-600">اختر طريقة الدفع لإتمام حملتك</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Order Summary</h3>
              <p className="text-blue-700">Total Amount: ${totalAmount.toFixed(2)} {selectedCurrency}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentMethodSelect('credit_card')}
              >
                <div className="font-medium text-gray-800">Credit Card</div>
                <div className="text-sm text-gray-600">ادفع باستخدام بطاقتك الائتمانية.</div>
              </div>
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentMethodSelect('paypal')}
              >
                <div className="font-medium text-gray-800">PayPal</div>
                <div className="text-sm text-gray-600">ادفع باستخدام حساب PayPal الخاص بك.</div>
              </div>
            </div>
            {hasExistingBalance && (
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === 'balance'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentMethodSelect('balance')}
              >
                <div className="font-medium text-gray-800">Use Existing Balance</div>
                <div className="text-sm text-gray-600">استخدم رصيدك الحالي للدفع.</div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">New Campaign</h1>
          <button onClick={() => window.history.back()} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  currentStep === step.id
                    ? 'bg-blue-500'
                    : step.completed
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                {step.completed && currentStep !== step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <p className="text-xs mt-2 text-center text-gray-600">{step.title}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isGeneratingAds || isProcessingPayment}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || isGeneratingAds || isProcessingPayment}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAds || isProcessingPayment ? 'Processing...' : getButtonText()}
          </button>
        </div>

        {/* Modals */}
        {showPlatformModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <h3 className="text-xl font-bold mb-4">Please select a platform</h3>
              <button onClick={() => setShowPlatformModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
            </div>
          </div>
        )}

        {showAccountModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <h3 className="text-xl font-bold mb-4">Please select an ad account</h3>
              <button onClick={() => setShowAccountModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">OK</button>
            </div>
          </div>
        )}

        {showGoogleAuth && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <h3 className="text-xl font-bold mb-4">Connect to Google Ads</h3>
              <p className="mb-4">Please authorize your Google Ads account to proceed.</p>
              <button onClick={handleGoogleAuth} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Connect Google Ads</button>
            </div>
          </div>
        )}

        {showCustomBudgetModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Enter Custom Budget</h3>
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Minimum $3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowCustomBudgetModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>
                <button onClick={handleCustomBudgetSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCampaign;
// Note: This code is a simplified version of a multi-step campaign creation form.
// It does not include actual API calls or state management for production use.   