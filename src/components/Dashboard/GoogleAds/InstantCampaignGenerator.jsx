// components/Dashboard/GoogleAds/InstantCampaignGenerator.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  Search,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { apiService } from '../../../services/api';
import './InstantCampaignGenerator.css';

const InstantCampaignGenerator = ({ 
  onWebsiteSubmit, 
  onNext, 
  website, 
  isProcessing,
  error 
}) => {
  const [url, setUrl] = useState(website?.url || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      const url = new URL(string.startsWith('http' ) ? string : `https://${string}` );
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_ ) {
      return false;
    }
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setValidationResult(null);
    setShowPreview(false);
  };

  // Validate and analyze website
  const handleValidateWebsite = async () => {
    if (!url.trim()) return;

    const formattedUrl = url.startsWith('http' ) ? url : `https://${url}`;
    
    if (!isValidUrl(formattedUrl )) {
      setValidationResult({
        success: false,
        error: 'يرجى إدخال رابط صحيح للموقع الإلكتروني'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await apiService.analyzeWebsite({
        url: formattedUrl
      });

      if (response.success) {
        setValidationResult({
          success: true,
          data: response.analysis
        });
        setShowPreview(true);
      } else {
        setValidationResult({
          success: false,
          error: response.error || 'فشل في تحليل الموقع الإلكتروني'
        });
      }
    } catch (error) {
      setValidationResult({
        success: false,
        error: 'حدث خطأ أثناء تحليل الموقع الإلكتروني'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validationResult?.success) {
      await handleValidateWebsite();
      return;
    }

    const websiteData = {
      url: url.startsWith('http' ) ? url : `https://${url}`,
      ...validationResult.data
    };

    onWebsiteSubmit(websiteData );
    onNext();
  };

  // Auto-validate on URL change (debounced)
  useEffect(() => {
    if (!url.trim()) return;

    const timer = setTimeout(() => {
      if (isValidUrl(url.startsWith('http' ) ? url : `https://${url}` )) {
        handleValidateWebsite();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="instant-campaign-generator">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            إنشاء حملة إعلانية فورية
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            أدخل رابط موقعك الإلكتروني وسنقوم بإنشاء حملة إعلانية ذكية خلال دقائق باستخدام الذكاء الاصطناعي
          </motion.p>
        </div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Globe className="w-5 h-5" />
                تحليل الموقع الإلكتروني
              </CardTitle>
              <CardDescription>
                سنقوم بتحليل موقعك لفهم نشاطك التجاري وإنشاء إعلانات مخصصة
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="مثال: www.example.com أو https://example.com"
                        value={url}
                        onChange={handleUrlChange}
                        className="pl-10 h-12 text-lg"
                        disabled={isProcessing}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleValidateWebsite}
                      disabled={!url.trim( ) || isValidating || isProcessing}
                      className="px-6"
                    >
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Validation Result */}
                <AnimatePresence>
                  {validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {validationResult.success ? (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            تم تحليل الموقع بنجاح! جاهز لإنشاء الحملة الإعلانية.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription>
                            {validationResult.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Website Preview */}
                <AnimatePresence>
                  {showPreview && validationResult?.success && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            معاينة تحليل الموقع
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">عنوان الموقع</h4>
                              <p className="font-medium">{validationResult.data?.title || 'غير محدد'}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">نوع النشاط</h4>
                              <Badge variant="secondary">
                                {validationResult.data?.industry || 'عام'}
                              </Badge>
                            </div>
                          </div>
                          
                          {validationResult.data?.description && (
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">وصف الموقع</h4>
                              <p className="text-sm text-muted-foreground">
                                {validationResult.data.description}
                              </p>
                            </div>
                          )}

                          {validationResult.data?.keywords && validationResult.data.keywords.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-muted-foreground mb-2">الكلمات المفتاحية المقترحة</h4>
                              <div className="flex flex-wrap gap-2">
                                {validationResult.data.keywords.slice(0, 5).map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!validationResult?.success || isProcessing}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        إنشاء الحملة الذكية
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Sparkles,
              title: 'ذكاء اصطناعي متقدم',
              description: 'تحليل ذكي لموقعك وإنشاء إعلانات مخصصة'
            },
            {
              icon: Target,
              title: 'استهداف دقيق',
              description: 'اختيار الجمهور المناسب لنشاطك التجاري'
            },
            {
              icon: Zap,
              title: 'إطلاق فوري',
              description: 'حملتك جاهزة للإطلاق خلال دقائق'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InstantCampaignGenerator;
