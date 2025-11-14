'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Edit2, Sparkles, RefreshCw, Save } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';
import { CardStack } from '@/components/ui/card-stack';

interface GeneratedContent {
  headlines: string[];
  descriptions: string[];
  keywords: string[];
}

export default function EditAdsPage() {
  const router = useRouter();
  const [content, setContent] = useState<GeneratedContent>({
    headlines: [],
    descriptions: [],
    keywords: []
  });
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [campaignType, setCampaignType] = useState<string>('SEARCH');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('ar'); // Default to Arabic
  const [isRegenerating, setIsRegenerating] = useState<{[key: string]: boolean}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);

  // Detect language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setIsRTL(savedLanguage === 'ar');
    }
  }, []);

  useEffect(() => {
    // Load data from localStorage
    const generatedContentStr = localStorage.getItem('generatedContent') || '{}';
    const campaignDataStr = localStorage.getItem('campaignData') || '{}';
    
    const generatedContent = JSON.parse(generatedContentStr);
    const campaignData = JSON.parse(campaignDataStr);

    // Ensure minimum requirements for Google Ads
    const minHeadlines = 30; // Google Ads recommends 30 headlines
    const minDescriptions = 4; // Google Ads requires 4 descriptions
    
    const headlines = generatedContent.headlines || [];
    const descriptions = generatedContent.descriptions || [];
    const keywords = generatedContent.keywords || [];
    
    // Fill missing headlines
    while (headlines.length < minHeadlines) {
      headlines.push('');
    }
    
    // Fill missing descriptions
    while (descriptions.length < minDescriptions) {
      descriptions.push('');
    }

    setContent({
      headlines: headlines.slice(0, minHeadlines),
      descriptions: descriptions.slice(0, minDescriptions),
      keywords: keywords
    });
    
    setBusinessName(campaignData.businessName || '');
    setCampaignType(campaignData.campaignType || 'SEARCH');
    
    const url = campaignData.websiteUrl || '';
    setWebsiteUrl(url);
    
    // Extract domain from URL
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      setWebsiteDomain(domain);
    } catch {
      setWebsiteDomain(url);
    }

    // Load selected language
    const languageCode = campaignData.selectedLanguageCode || 'ar';
    setSelectedLanguageCode(languageCode);
    console.log(`🌍 Campaign language loaded: ${languageCode}`);
    console.log(`📋 Campaign data:`, campaignData);
    
    // Show alert if language is not English (for debugging)
    if (languageCode !== 'ar') {
      console.log(`⚠️ Language is ${languageCode}, NOT Arabic!`);
    }
  }, []);

  const handleEditText = (category: 'headlines' | 'descriptions' | 'keywords', index: number, newText: string) => {
    const updatedContent = {
      ...content,
      [category]: content[category].map((item, i) => i === index ? newText : item)
    };
    
    setContent(updatedContent);
    setHasChanges(true);
    
    // Auto-save to localStorage after any edit
    localStorage.setItem('generatedContent', JSON.stringify(updatedContent));
  };

  const handleRegenerateItem = async (category: 'headlines' | 'descriptions', index: number) => {
    const key = `${category}-${index}`;
    setIsRegenerating(prev => ({ ...prev, [key]: true }));

    try {
      console.log(`🔄 Regenerating ${category} #${index} with language: ${selectedLanguageCode}`);
      
      const requestData = {
        element_type: category === 'headlines' ? 'headline' : 'description',
        website_url: websiteUrl,
        existing_content: content,
        index: index,
        target_language: selectedLanguageCode
      };
      
      console.log(`📤 Sending to backend:`, requestData);
      
      // Call AI to regenerate this specific item
      const response = await fetch('http://localhost:5000/api/ai-campaign/regenerate-ad-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📥 Response from backend:`, result);
        
        if (result.success && result.regenerated_text) {
          // Update content and auto-save (handleEditText saves automatically)
          handleEditText(category, index, result.regenerated_text);
          console.log(`✅ تم توليد وحفظ ${category === 'headlines' ? 'عنوان' : 'وصف'} جديد بنجاح`);
          console.log(`✅ Generated text: "${result.regenerated_text}"`);
        } else {
          console.error('❌ فشل في توليد المحتوى:', result.error);
          alert(language === 'ar' ? 'فشل في توليد المحتوى. يرجى المحاولة مرة أخرى.' : 'Failed to generate content. Please try again.');
        }
      } else {
        console.error('❌ خطأ في الاستجابة:', response.status);
        alert(language === 'ar' ? 'حدث خطأ. يرجى التأكد من تشغيل الخادم.' : 'An error occurred. Please make sure the server is running.');
      }
    } catch (error) {
      console.error('❌ Error regenerating:', error);
      alert(language === 'ar' ? 'فشل الاتصال بالخادم. يرجى التأكد من تشغيل الباك إند.' : 'Failed to connect to server. Please make sure the backend is running.');
    } finally {
      setIsRegenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = () => {
    // Save back to localStorage
    localStorage.setItem('generatedContent', JSON.stringify(content));
    setHasChanges(false);
    
    // Go back to preview
    router.push('/campaign/preview');
  };

  const handleGoBack = () => {
    if (hasChanges) {
      const confirm = window.confirm(
        language === 'ar' 
          ? 'لديك تغييرات غير محفوظة. هل أنت متأكد من الرجوع؟' 
          : 'You have unsaved changes. Are you sure you want to go back?'
      );
      if (!confirm) return;
    }
    router.push('/campaign/preview');
  };

  // Get platform bar based on campaign type
  const getPlatformBar = () => {
    switch (campaignType) {
      case 'SEARCH':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
              <path d="M10.5 3C14.0899 3 17 5.91015 17 9.5" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
              <path d="M10.5 18C7.18629 18 4.5 15.3137 4.5 12" stroke="currentColor" strokeWidth="2" className="text-green-500" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Search</span>
          </div>
        );
      case 'DISPLAY':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-black dark:text-gray-400" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Display Ad</span>
          </div>
        );
      case 'VIDEO':
        return (
          <div className="flex items-center gap-2 bg-black dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-700 dark:border-gray-600">
            <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
            </svg>
            <span className="text-white dark:text-gray-300 text-[11px] font-medium">YouTube</span>
          </div>
        );
      case 'SHOPPING':
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" viewBox="0 0 24 24" fill="none">
              <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Shopping</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
              <path d="M10.5 3C14.0899 3 17 5.91015 17 9.5" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
              <path d="M10.5 18C7.18629 18 4.5 15.3137 4.5 12" stroke="currentColor" strokeWidth="2" className="text-green-500" />
            </svg>
            <span className="text-black dark:text-gray-400 text-[11px]">Search</span>
          </div>
        );
    }
  };

  // Create 3 ad variations for CardStack
  const adCards = Array.from({ length: 3 }, (_, index) => ({
    id: index,
    content: (
      <div className="w-full h-full flex flex-col">
        {/* Platform Bar */}
        <div className="bg-gray-50 dark:bg-black p-2.5 border-b border-gray-200 dark:border-gray-800">
          {getPlatformBar()}
        </div>

        {/* Ad Preview */}
        <div className="p-4 bg-white dark:bg-black flex-1 flex flex-col justify-center">
          <div className="mb-1.5">
            <span className="text-[10px] font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'إعلان ممول' : 'Sponsored'}
            </span>
          </div>
          
          {/* Website Info */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                {websiteDomain.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-gray-900 dark:text-white font-medium truncate">
              {websiteDomain}
            </div>
          </div>

          <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2 truncate">
            https://{websiteDomain}
          </div>

          {/* Headlines */}
          <div className="space-y-1.5">
            <h3 className="text-sm md:text-base font-normal text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug line-clamp-1">
              {content.headlines[index % content.headlines.length] || 'Your headline here'}
            </h3>
            
            {/* Descriptions */}
            <div className="space-y-0.5">
              {content.descriptions.slice(0, 2).map((desc, idx) => (
                <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-1">
                  {desc}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-black" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'أنشأ الذكاء الاصطناعي أفضل الإعلانات لك' : 'Furriyadh AI has created the best ads for you'}
          </h1>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left Side - Edit Forms */}
          <div className="space-y-6">
          
            {/* Ad Headlines Section */}
            <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'عناوين الإعلانات' : 'Ad Headlines'}</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ⓘ</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ar' ? 'الحد الأقصى 30 حرف' : '30 characters max.'}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-500">
                    {content.headlines.filter(h => h.trim().length > 0).length}/30
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {content.headlines.map((headline, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-gray-900 dark:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => handleEditText('headlines', index, e.target.value)}
                      maxLength={30}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className={`flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholder={language === 'ar' ? 'أدخل العنوان...' : 'Enter headline...'}
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">{headline.length}/30</span>
                    <button
                      onClick={() => handleRegenerateItem('headlines', index)}
                      disabled={isRegenerating[`headlines-${index}`]}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                      title={language === 'ar' ? 'إعادة الإنشاء بالذكاء الاصطناعي' : 'Regenerate with AI'}
                    >
                      {isRegenerating[`headlines-${index}`] ? (
                        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-500 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Descriptions Section */}
            <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'أوصاف الإعلانات' : 'Ad Descriptions'}</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ⓘ</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{language === 'ar' ? 'الحد الأقصى 90 حرف' : '90 characters max.'}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-500">
                    {content.descriptions.filter(d => d.trim().length > 0).length}/4
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {content.descriptions.map((description, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-gray-900 dark:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 w-6 mt-1">{index + 1}.</span>
                    <div className="flex-1">
                      <textarea
                        value={description}
                        onChange={(e) => handleEditText('descriptions', index, e.target.value)}
                        maxLength={90}
                        rows={2}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={`w-full bg-transparent text-sm resize-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholder={language === 'ar' ? 'أدخل الوصف...' : 'Enter description...'}
                      />
                      <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>{description.length}/90</div>
                    </div>
                    <button
                      onClick={() => handleRegenerateItem('descriptions', index)}
                      disabled={isRegenerating[`descriptions-${index}`]}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50 mt-1"
                      title={language === 'ar' ? 'إعادة الإنشاء بالذكاء الاصطناعي' : 'Regenerate with AI'}
                    >
                      {isRegenerating[`descriptions-${index}`] ? (
                        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-500 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side - Card Stack Preview */}
          <div className="lg:sticky lg:top-8 h-fit flex items-center justify-center">
            <CardStack items={adCards} offset={10} scaleFactor={0.06} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex justify-center gap-6 mt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <GlowButton
            onClick={handleGoBack}
            variant="green"
          >
            <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {language === 'ar' ? 'رجوع' : 'Go Back'}
            </span>
          </GlowButton>

          <GlowButton
            onClick={handleSave}
            variant="blue"
            disabled={!hasChanges}
          >
            <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Save className="w-5 h-5" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </span>
          </GlowButton>
        </div>
      </div>
    </div>
  );
}


