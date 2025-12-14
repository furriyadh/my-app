'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Edit2, Sparkles, RefreshCw, Save, Play, Eye } from 'lucide-react';
import GlowButton from '@/components/ui/glow-button';
import { CardStack } from '@/components/ui/card-stack';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { getApiUrl } from '@/lib/config';

// ============================================================
// INTERFACES
// ============================================================

interface GeneratedContent {
  // SEARCH campaign fields
  headlines: string[];
  descriptions: string[];
  keywords: string[];
  // VIDEO campaign fields
  long_headlines?: string[];
  call_to_action?: string;
  action_button_label?: string;
  action_headline?: string;
}

// Video ad type configuration
interface VideoTypeConfig {
  type: string;
  name: string;
  name_ar: string;
  fields: {
    headlines?: { count: number; maxLength: number };
    long_headlines?: { count: number; maxLength: number };
    descriptions?: { count: number; maxLength: number };
    action_button?: { maxLength: number; required: boolean };
    action_headline?: { maxLength: number; required: boolean };
  };
}

const VIDEO_TYPE_CONFIGS: Record<string, VideoTypeConfig> = {
  'VIDEO_RESPONSIVE_AD': {
    type: 'VIDEO_RESPONSIVE_AD',
    name: 'Video Responsive Ad',
    name_ar: 'إعلان فيديو متجاوب',
    fields: {
      headlines: { count: 5, maxLength: 30 },
      long_headlines: { count: 5, maxLength: 90 },
      descriptions: { count: 5, maxLength: 90 },
      action_button: { maxLength: 10, required: false }
    }
  },
  'VIDEO_TRUEVIEW_IN_STREAM_AD': {
    type: 'VIDEO_TRUEVIEW_IN_STREAM_AD',
    name: 'TrueView In-Stream',
    name_ar: 'إعلان TrueView',
    fields: {
      action_button: { maxLength: 10, required: true },
      action_headline: { maxLength: 15, required: true }
    }
  },
  'IN_FEED_VIDEO_AD': {
    type: 'IN_FEED_VIDEO_AD',
    name: 'In-Feed Video',
    name_ar: 'إعلان في الخلاصة',
    fields: {
      headlines: { count: 1, maxLength: 100 },
      descriptions: { count: 2, maxLength: 35 }
    }
  },
  'VIDEO_BUMPER_AD': {
    type: 'VIDEO_BUMPER_AD',
    name: 'Bumper Ad',
    name_ar: 'إعلان بامبر',
    fields: {
      action_button: { maxLength: 10, required: false },
      action_headline: { maxLength: 15, required: false }
    }
  },
  'VIDEO_NON_SKIPPABLE_IN_STREAM_AD': {
    type: 'VIDEO_NON_SKIPPABLE_IN_STREAM_AD',
    name: 'Non-Skippable',
    name_ar: 'غير قابل للتخطي',
    fields: {
      action_button: { maxLength: 10, required: false },
      action_headline: { maxLength: 15, required: false }
    }
  }
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditAdsPage() {
  const router = useRouter();
  const { t, language, isRTL } = useTranslation();

  // State
  const [content, setContent] = useState<GeneratedContent>({
    headlines: [],
    descriptions: [],
    keywords: [],
    long_headlines: [],
    call_to_action: '',
    action_button_label: '',
    action_headline: ''
  });
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [campaignType, setCampaignType] = useState<string>('SEARCH');
  const [videoSubType, setVideoSubType] = useState<string>('VIDEO_RESPONSIVE_AD');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('ar');
  const [isRegenerating, setIsRegenerating] = useState<{ [key: string]: boolean }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // YouTube video data
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState('');
  const [youtubeVideoThumbnail, setYoutubeVideoThumbnail] = useState('');

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    const generatedContentStr = localStorage.getItem('generatedContent') || '{}';
    const campaignDataStr = localStorage.getItem('campaignData') || '{}';

    const generatedContent = JSON.parse(generatedContentStr);
    const campaignData = JSON.parse(campaignDataStr);

    const type = campaignData.campaignType || 'SEARCH';
    setCampaignType(type);

    // Get video sub-type
    const subType = campaignData.videoSubType || 'VIDEO_RESPONSIVE_AD';
    setVideoSubType(subType);

    // YouTube video info
    setYoutubeVideoTitle(campaignData.youtubeVideoTitle || '');
    setYoutubeVideoThumbnail(campaignData.youtubeVideoThumbnail || '');

    // Load content based on campaign type
    if (type === 'VIDEO') {
      const config = VIDEO_TYPE_CONFIGS[subType];
      const newContent: GeneratedContent = {
        headlines: [],
        descriptions: [],
        keywords: generatedContent.keywords || [],
        long_headlines: [],
        call_to_action: generatedContent.call_to_action || '',
        action_button_label: generatedContent.action_button_label || '',
        action_headline: generatedContent.action_headline || ''
      };

      // Fill headlines based on config
      if (config?.fields.headlines) {
        const count = config.fields.headlines.count;
        const headlines = generatedContent.headlines || [];
        while (headlines.length < count) headlines.push('');
        newContent.headlines = headlines.slice(0, count);
      }

      // Fill long headlines
      if (config?.fields.long_headlines) {
        const count = config.fields.long_headlines.count;
        const longHeadlines = generatedContent.long_headlines || [];
        while (longHeadlines.length < count) longHeadlines.push('');
        newContent.long_headlines = longHeadlines.slice(0, count);
      }

      // Fill descriptions
      if (config?.fields.descriptions) {
        const count = config.fields.descriptions.count;
        const descriptions = generatedContent.descriptions || [];
        while (descriptions.length < count) descriptions.push('');
        newContent.descriptions = descriptions.slice(0, count);
      }

      setContent(newContent);
    } else {
      // SEARCH / DISPLAY / SHOPPING - Original logic
      const minHeadlines = 30;
      const minDescriptions = 4;

      const headlines = generatedContent.headlines || [];
      const descriptions = generatedContent.descriptions || [];
      const keywords = generatedContent.keywords || [];

      while (headlines.length < minHeadlines) headlines.push('');
      while (descriptions.length < minDescriptions) descriptions.push('');

      setContent({
        headlines: headlines.slice(0, minHeadlines),
        descriptions: descriptions.slice(0, minDescriptions),
        keywords: keywords
      });
    }

    setBusinessName(campaignData.businessName || '');
    const url = campaignData.websiteUrl || '';
    setWebsiteUrl(url);

    try {
      const domain = new URL(url).hostname.replace('www.', '');
      setWebsiteDomain(domain);
    } catch {
      setWebsiteDomain(url);
    }

    const languageCode = campaignData.selectedLanguageCode || campaignData.videoDetectedLanguage || 'ar';
    setSelectedLanguageCode(languageCode);
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleEditText = (field: string, index: number | null, newText: string) => {
    const updatedContent = { ...content };

    if (index !== null) {
      // Array field (headlines, descriptions, etc.)
      (updatedContent as any)[field] = (content as any)[field].map((item: string, i: number) =>
        i === index ? newText : item
      );
    } else {
      // Single field (action_button_label, etc.)
      (updatedContent as any)[field] = newText;
    }

    setContent(updatedContent);
    setHasChanges(true);
    localStorage.setItem('generatedContent', JSON.stringify(updatedContent));
  };

  const handleRegenerateItem = async (field: string, index: number) => {
    const key = `${field}-${index}`;
    setIsRegenerating(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(getApiUrl('/api/ai-campaign/regenerate-ad-element'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          element_type: field === 'headlines' ? 'headline' : field === 'long_headlines' ? 'long_headline' : 'description',
          website_url: websiteUrl,
          existing_content: content,
          index: index,
          target_language: selectedLanguageCode
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.regenerated_text) {
          handleEditText(field, index, result.regenerated_text);
        }
      }
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsRegenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = () => {
    localStorage.setItem('generatedContent', JSON.stringify(content));
    setHasChanges(false);
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

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const getVideoConfig = () => VIDEO_TYPE_CONFIGS[videoSubType];

  // Render input field with regenerate button
  const renderTextField = (
    field: string,
    index: number,
    value: string,
    maxLength: number,
    placeholder: string,
    isTextarea: boolean = false
  ) => (
    <div
      key={`${field}-${index}`}
      className={`flex ${isTextarea ? 'items-start' : 'items-center'} gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0`}
    >
      <span className="text-xs text-gray-400 dark:text-gray-500 w-6">{index + 1}.</span>

      {isTextarea ? (
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => handleEditText(field, index, e.target.value)}
            maxLength={maxLength}
            rows={2}
            dir="ltr"
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-gray-400 text-gray-900 dark:text-white"
            placeholder={placeholder}
          />
          <div className="text-xs text-gray-400 mt-1">{value.length}/{maxLength}</div>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => handleEditText(field, index, e.target.value)}
            maxLength={maxLength}
            dir="ltr"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-white"
            placeholder={placeholder}
          />
          <span className="text-xs text-gray-400">{value.length}/{maxLength}</span>
        </>
      )}

      <button
        onClick={() => handleRegenerateItem(field, index)}
        disabled={isRegenerating[`${field}-${index}`]}
        className="p-1.5 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
        title={language === 'ar' ? 'إعادة الإنشاء بالذكاء الاصطناعي' : 'Regenerate with AI'}
      >
        {isRegenerating[`${field}-${index}`] ? (
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 text-blue-600" />
        )}
      </button>
    </div>
  );

  // Render single text field (for action buttons, etc.)
  const renderSingleField = (
    field: string,
    value: string,
    maxLength: number,
    label: string,
    label_ar: string,
    required: boolean = false
  ) => (
    <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800 mb-4">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? label_ar : label}
          </h2>
          {required && <span className="text-red-500 text-xs">*</span>}
          <span className="text-xs text-gray-500">{maxLength} {language === 'ar' ? 'حرف كحد أقصى' : 'chars max'}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => handleEditText(field, null, e.target.value)}
            maxLength={maxLength}
            dir="ltr"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
            placeholder={language === 'ar' ? `أدخل ${label_ar}...` : `Enter ${label}...`}
          />
          <span className="text-xs text-gray-400">{value.length}/{maxLength}</span>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // VIDEO CAMPAIGN FORMS
  // ============================================================

  const renderVideoForm = () => {
    const config = getVideoConfig();
    if (!config) return null;

    return (
      <div className="space-y-6">
        {/* Video Preview Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 flex items-center gap-4">
          {youtubeVideoThumbnail && (
            <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 relative">
              <img src={youtubeVideoThumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{youtubeVideoTitle || 'Your YouTube Video'}</p>
            <p className="text-white/60 text-sm">{language === 'ar' ? config.name_ar : config.name}</p>
          </div>
        </div>

        {/* Headlines */}
        {config.fields.headlines && (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'العناوين' : 'Headlines'}
                  </h2>
                  <span className="text-xs text-gray-500">{config.fields.headlines.maxLength} {language === 'ar' ? 'حرف كحد أقصى' : 'chars max'}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  {content.headlines.filter(h => h.trim().length > 0).length}/{config.fields.headlines.count}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {content.headlines.map((headline, index) =>
                renderTextField('headlines', index, headline, config.fields.headlines!.maxLength,
                  language === 'ar' ? 'أدخل العنوان...' : 'Enter headline...', false)
              )}
            </div>
          </div>
        )}

        {/* Long Headlines */}
        {config.fields.long_headlines && (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'العناوين الطويلة' : 'Long Headlines'}
                  </h2>
                  <span className="text-xs text-gray-500">{config.fields.long_headlines.maxLength} {language === 'ar' ? 'حرف كحد أقصى' : 'chars max'}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  {(content.long_headlines || []).filter(h => h.trim().length > 0).length}/{config.fields.long_headlines.count}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {(content.long_headlines || []).map((headline, index) =>
                renderTextField('long_headlines', index, headline, config.fields.long_headlines!.maxLength,
                  language === 'ar' ? 'أدخل العنوان الطويل...' : 'Enter long headline...', true)
              )}
            </div>
          </div>
        )}

        {/* Descriptions */}
        {config.fields.descriptions && (
          <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'الأوصاف' : 'Descriptions'}
                  </h2>
                  <span className="text-xs text-gray-500">{config.fields.descriptions.maxLength} {language === 'ar' ? 'حرف كحد أقصى' : 'chars max'}</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  {content.descriptions.filter(d => d.trim().length > 0).length}/{config.fields.descriptions.count}
                </span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {content.descriptions.map((desc, index) =>
                renderTextField('descriptions', index, desc, config.fields.descriptions!.maxLength,
                  language === 'ar' ? 'أدخل الوصف...' : 'Enter description...', true)
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {config.fields.action_button && renderSingleField(
          'action_button_label',
          content.action_button_label || '',
          config.fields.action_button.maxLength,
          'Action Button',
          'زر الإجراء',
          config.fields.action_button.required
        )}

        {/* Action Headline */}
        {config.fields.action_headline && renderSingleField(
          'action_headline',
          content.action_headline || '',
          config.fields.action_headline.maxLength,
          'Action Headline',
          'عنوان الإجراء',
          config.fields.action_headline.required
        )}
      </div>
    );
  };

  // ============================================================
  // SEARCH/DISPLAY CAMPAIGN FORMS (Original)
  // ============================================================

  const renderSearchForm = () => (
    <div className="space-y-6">
      {/* Headlines */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'عناوين الإعلانات' : 'Ad Headlines'}
              </h2>
              <span className="text-xs text-gray-500">{language === 'ar' ? 'الحد الأقصى 30 حرف' : '30 characters max.'}</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {content.headlines.filter(h => h.trim().length > 0).length}/30
            </span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {content.headlines.map((headline, index) =>
            renderTextField('headlines', index, headline, 30,
              language === 'ar' ? 'أدخل العنوان...' : 'Enter headline...', false)
          )}
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow border border-gray-200 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'أوصاف الإعلانات' : 'Ad Descriptions'}
              </h2>
              <span className="text-xs text-gray-500">{language === 'ar' ? 'الحد الأقصى 90 حرف' : '90 characters max.'}</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {content.descriptions.filter(d => d.trim().length > 0).length}/4
            </span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {content.descriptions.map((description, index) =>
            renderTextField('descriptions', index, description, 90,
              language === 'ar' ? 'أدخل الوصف...' : 'Enter description...', true)
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // PREVIEW CARDS
  // ============================================================

  const getPlatformBar = () => {
    if (campaignType === 'VIDEO') {
      return (
        <div className="flex items-center gap-2 bg-black rounded-lg px-3 py-1.5 border border-gray-700">
          <svg className="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z" />
          </svg>
          <span className="text-white text-[11px] font-medium">YouTube</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
          <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
        </svg>
        <span className="text-black dark:text-gray-400 text-[11px]">Search</span>
      </div>
    );
  };

  // Video preview card
  const renderVideoPreviewCard = (index: number) => (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Thumbnail */}
      <div className="relative">
        {youtubeVideoThumbnail ? (
          <img src={youtubeVideoThumbnail} alt="" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-600" />
          </div>
        )}
        {/* Skip Ad button */}
        <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded">
          Skip Ad
        </div>
        {/* Visit Advertiser */}
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Visit Advertiser
        </div>
        {/* Ad badge */}
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
          Ad
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-700"></div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium line-clamp-1">
              {content.headlines[index % Math.max(content.headlines.length, 1)] || 'Ad Headline'}
            </p>
            <p className="text-gray-400 text-xs">{websiteDomain}</p>
          </div>
        </div>
        <p className="text-gray-300 text-xs line-clamp-2">
          {content.descriptions[0] || 'Ad description will appear here...'}
        </p>
      </div>
    </div>
  );

  // Search preview card
  const renderSearchPreviewCard = (index: number) => (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-50 dark:bg-black p-2.5 border-b border-gray-200 dark:border-gray-800">
        {getPlatformBar()}
      </div>
      <div className="p-4 bg-white dark:bg-black flex-1 flex flex-col justify-center">
        <div className="mb-1.5">
          <span className="text-[10px] font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'إعلان ممول' : 'Sponsored'}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-gray-600">
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
        <div className="space-y-1.5">
          <h3 className="text-sm font-normal text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug line-clamp-1">
            {content.headlines[index % content.headlines.length] || 'Your headline here'}
          </h3>
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
  );

  const adCards = Array.from({ length: 3 }, (_, index) => ({
    id: index,
    content: campaignType === 'VIDEO' ? renderVideoPreviewCard(index) : renderSearchPreviewCard(index),
  }));

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-white dark:bg-black" dir="ltr">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'أنشأ الذكاء الاصطناعي أفضل الإعلانات لك' : 'Furriyadh AI has created the best ads for you'}
          </h1>
          {campaignType === 'VIDEO' && (
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {language === 'ar' ? getVideoConfig()?.name_ar : getVideoConfig()?.name}
            </p>
          )}
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Left Side - Edit Forms */}
          <div>
            {campaignType === 'VIDEO' ? renderVideoForm() : renderSearchForm()}
          </div>

          {/* Right Side - Card Stack Preview */}
          <div className="lg:sticky lg:top-8 h-fit flex items-center justify-center">
            <CardStack items={adCards} offset={10} scaleFactor={0.06} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-12">
          <GlowButton
            onClick={handleGoBack}
            variant="green"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {language === 'ar' ? 'رجوع' : 'Go Back'}
            </span>
          </GlowButton>

          <GlowButton
            onClick={handleSave}
            variant="blue"
            disabled={!hasChanges}
          >
            <span className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </span>
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
