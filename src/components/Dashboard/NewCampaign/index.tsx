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
  const [websiteUrlError, setWebsiteUrlError] = useState(''); // New state for URL error
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

  // Function to validate website URL
  const validateWebsiteUrl = (url: string) => {
    if (!url.startsWith('https://')) {
      return 'يجب أن يبدأ رابط الموقع بـ https://';
    }

    const forbiddenDomains = [
      'sites.google.com',
      'wix.com',
      'site123.com',
      'blogspot.com',
      'wordpress.com',
      'weebly.com',
      'jimdo.com',
      'strikingly.com',
      'squarespace.com',
      'medium.com',
      'tumblr.com',
      'github.io',
      'netlify.app',
      'vercel.app',
      'glitch.me',
      'repl.co',
      'codepen.io',
      'jsfiddle.net',
      'codesandbox.io',
      'webflow.io',
      'framer.app',
      'carrd.co',
      'page.link',
      'bit.ly',
      'tinyurl.com',
      'goo.gl',
      't.co',
      'ow.ly',
      'buff.ly',
      'rebrandly.com',
      'is.gd',
      's.id',
      'qr.net',
      'app.link',
      'linktr.ee',
      'bio.link',
      'many.link',
      'beacons.ai',
      'flowcode.com',
      'snipfeed.co',
      'allmylinks.com',
      'direct.me',
      'taplink.cc',
      'lnk.bio',
      'campsite.bio',
      'solo.to',
      'url.bio',
      'contactin.bio',
      'linkin.bio',
      'linkpop.com',
      'link.tree',
      'link.bio',
      'link.pages',
      'link.profile',
      'link.directory',
      'link.website',
      'link.page',
      'link.me',
      'link.fm',
      'link.ly',
      'link.cx',
      'link.id',
      'link.click',
      'link.fun',
      'link.link',
      'link.zone',
      'link.space',
      'link.world',
      'link.global',
      'link.site',
      'link.co',
      'link.net',
      'link.org',
      'link.info',
      'link.biz',
      'link.xyz',
      'link.top',
      'link.club',
      'link.blog',
      'link.shop',
      'link.store',
      'link.online',
      'link.tech',
      'link.digital',
      'link.media',
      'link.art',
      'link.design',
      'link.dev',
      'link.cloud',
      'link.data',
      'link.ai',
      'link.io',
      'link.app',
      'link.me',
      'link.us',
      'link.ca',
      'link.uk',
      'link.de',
      'link.fr',
      'link.es',
      'link.it',
      'link.jp',
      'link.cn',
      'link.in',
      'link.au',
      'link.nz',
      'link.za',
      'link.sg',
      'link.hk',
      'link.tw',
      'link.kr',
      'link.my',
      'link.ph',
      'link.th',
      'link.vn',
      'link.id',
      'link.mx',
      'link.br',
      'link.ar',
      'link.cl',
      'link.pe',
      'link.co',
      'link.ve',
      'link.uy',
      'link.py',
      'link.ec',
      'link.bo',
      'link.pa',
      'link.cr',
      'link.gt',
      'link.hn',
      'link.sv',
      'link.ni',
      'link.cu',
      'link.do',
      'link.pr',
      'link.jm',
      'link.tt',
      'link.bs',
      'link.bb',
      'link.lc',
      'link.gd',
      'link.vc',
      'link.dm',
      'link.ag',
      'link.kn',
      'link.ai',
      'link.tc',
      'link.vg',
      'link.ky',
      'link.bm',
      'link.gp',
      'link.mq',
      'link.gf',
      'link.bl',
      'link.mf',
      'link.pm',
      'link.sh',
      'link.fk',
      'link.gs',
      'link.hm',
      'link.aq',
      'link.bv',
      'link.cc',
      'link.cd',
      'link.cf',
      'link.cg',
      'link.ci',
      'link.cm',
      'link.cv',
      'link.dj',
      'link.dz',
      'link.eh',
      'link.er',
      'link.et',
      'link.ga',
      'link.gh',
      'link.gm',
      'link.gn',
      'link.gq',
      'link.gw',
      'link.ke',
      'link.km',
      'link.lr',
      'link.ls',
      'link.ly',
      'link.ma',
      'link.mg',
      'link.ml',
      'link.mr',
      'link.mu',
      'link.mw',
      'link.mz',
      'link.na',
      'link.ne',
      'link.ng',
      'link.rw',
      'link.sc',
      'link.sd',
      'link.sl',
      'link.sn',
      'link.so',
      'link.ss',
      'link.st',
      'link.sz',
      'link.td',
      'link.tg',
      'link.tn',
      'link.tz',
      'link.ug',
      'link.yt',
      'link.zm',
      'link.zw',
      'link.ad',
      'link.al',
      'link.am',
      'link.at',
      'link.az',
      'link.ba',
      'link.be',
      'link.bg',
      'link.by',
      'link.ch',
      'link.cy',
      'link.cz',
      'link.dk',
      'link.ee',
      'link.fi',
      'link.ge',
      'link.gr',
      'link.hr',
      'link.hu',
      'link.ie',
      'link.is',
      'link.li',
      'link.lt',
      'link.lu',
      'link.lv',
      'link.mc',
      'link.md',
      'link.me',
      'link.mk',
      'link.mt',
      'link.nl',
      'link.no',
      'link.pl',
      'link.pt',
      'link.ro',
      'link.rs',
      'link.ru',
      'link.se',
      'link.si',
      'link.sk',
      'link.sm',
      'link.tr',
      'link.ua',
      'link.va',
      'link.xk'
    ];

    const domain = new URL(url).hostname;
    const isForbidden = forbiddenDomains.some(forbiddenDomain => domain.includes(forbiddenDomain));

    if (isForbidden) {
      return 'الرجاء إدخال رابط دومين خاص (غير مجاني).';
    }

    return ''; // No error
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const error = validateWebsiteUrl(websiteUrl);
      if (error) {
        setWebsiteUrlError(error);
        return;
      } else {
        setWebsiteUrlError('');
      }
    }

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
      case 1: return websiteUrl.length > 0 && !websiteUrlError; // Check for error
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
              onChange={(e) => {
                setWebsiteUrl(e.target.value);
                setWebsiteUrlError(''); // Clear error on change
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-center text-lg ${
                websiteUrlError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {websiteUrlError && <p className="text-red-500 text-sm mt-2">{websiteUrlError}</p>}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter keywords for your campaign</h2>
              <p className="text-gray-600">أدخل الكلمات المفتاحية التي تصف منتجاتك أو خدماتك</p>
            </div>
            <textarea
              placeholder="مثال: أحذية رياضية، ملابس رجالية، تسويق رقمي"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            ></textarea>
            <p className="text-sm text-gray-500">افصل بين الكلمات المفتاحية بفاصلة (,) أو سطر جديد.</p>
          </div>
        );

      case 8:
        const { impressions, clicks } = calculateEstimatedResults();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set your daily budget</h2>
              <p className="text-gray-600">اختر ميزانيتك اليومية للحملة الإعلانية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgetOptions.map((option) => (
                <div
                  key={option.amount}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBudget === option.amount
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleBudgetSelect(option.amount)}
                >
                  <div className="font-bold text-xl text-gray-800">${option.amount}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                  {option.recommended && (
                    <span className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Recommended</span>
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
                <div className="font-bold text-xl text-gray-800">Custom</div>
                <div className="text-sm text-gray-600">Set your own daily budget</div>
              </div>
            </div>

            {selectedBudget !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-blue-800 mb-2">Estimated Results (per day)</h3>
                <div className="flex justify-around text-gray-700">
                  <div>
                    <p className="text-2xl font-bold">{impressions.toLocaleString()}</p>
                    <p className="text-sm">Impressions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{clicks.toLocaleString()}</p>
                    <p className="text-sm">Clicks</p>
                  </div>
                </div>
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
                <input
                  type="text"
                  id="companyName"
                  value={billingDetails.companyName}
                  onChange={(e) => handleBillingDetailsChange('companyName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  id="country"
                  value={billingDetails.country}
                  onChange={(e) => handleBillingDetailsChange('country', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="city"
                  value={billingDetails.city}
                  onChange={(e) => handleBillingDetailsChange('city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  value={billingDetails.postalCode}
                  onChange={(e) => handleBillingDetailsChange('postalCode', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  value={billingDetails.address}
                  onChange={(e) => handleBillingDetailsChange('address', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">VAT Number (Optional)</label>
                <input
                  type="text"
                  id="vatNumber"
                  value={billingDetails.vatNumber}
                  onChange={(e) => handleBillingDetailsChange('vatNumber', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
              <p className="text-gray-600">اختر طريقة الدفع لإتمام حملتك</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Total Amount Due: {calculateTotal().toFixed(2)} {selectedCurrency}</h3>
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
                <div className="text-sm text-gray-500">Visa, MasterCard, American Express</div>
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
                <div className="text-sm text-gray-500">Pay securely with your PayPal account</div>
              </div>
            </div>
            {hasExistingBalance && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">لديك رصيد كافٍ في حسابك. سيتم خصم المبلغ منه.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#E0F7FA] via-[#E8EAF6] to-[#E0F2F7] flex items-center justify-center p-4 overflow-hidden">
      {/* AI-inspired glowing particles/lines in background */}
      <div className="absolute inset-0 z-0 opacity-30">
        {/* Example of a simple glowing circle - more complex animations can be added */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl z-10 backdrop-filter backdrop-blur-sm bg-opacity-80">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">New Campaign</h1>
          <button onClick={() => window.location.href = '/dashboard'} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  step.completed ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                {step.completed ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <p className={`text-xs mt-2 ${step.completed ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
              {step.id < steps.length && (
                <div
                  className={`absolute left-full top-4 w-16 h-0.5 ${
                    step.completed ? 'bg-blue-500' : 'bg-gray-300'
                  } transform -translate-x-1/2`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isGeneratingAds || isProcessingPayment}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ease-in-out transform hover:scale-105 ${
              currentStep === 1 || isGeneratingAds || isProcessingPayment
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5 inline-block mr-2" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || isGeneratingAds || isProcessingPayment}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ease-in-out transform hover:scale-105 ${
              !canProceed() || isGeneratingAds || isProcessingPayment
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            }`}
          >
            {isGeneratingAds || isProcessingPayment ? 'Processing...' : getButtonText()}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPlatformModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Select a Platform</h2>
            <p className="text-gray-600 mb-6">Please select a platform to proceed.</p>
            <button onClick={() => setShowPlatformModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Got It</button>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Select an Ad Account</h2>
            <p className="text-gray-600 mb-6">Please select an ad account to proceed.</p>
            <button onClick={() => setShowAccountModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Got It</button>
          </div>
        </div>
      )}

      {showGoogleAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Connect Google Ads Account</h2>
            <p className="text-gray-600 mb-6">You chose to use your own Google Ads account. Please connect it now.</p>
            <button onClick={handleGoogleAuth} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Connect Account</button>
          </div>
        </div>
      )}

      {showCustomBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Set Custom Daily Budget</h2>
            <input
              type="number"
              placeholder="Enter amount (min $3)"
              value={customBudget}
              onChange={(e) => setCustomBudget(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowCustomBudgetModal(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCustomBudgetSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {isGeneratingAds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Generating Ads...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Please wait while we generate your ads.</p>
          </div>
        </div>
      )}

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Processing Payment...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Please wait while your payment is processed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCampaign;


