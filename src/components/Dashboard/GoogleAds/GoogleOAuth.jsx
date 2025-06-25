// components/Dashboard/GoogleAds/GoogleOAuth.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  User,
  Lock,
  Globe,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { apiService } from '../../../services/api';
import './GoogleOAuth.css';

const GoogleOAuth = ({ 
  onAuthSuccess, 
  onNext, 
  isAuthenticated,
  userInfo,
  error 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStep, setAuthStep] = useState('idle');
  const [authError, setAuthError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check current authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await apiService.checkGoogleAuthStatus();
      if (response.isAuthenticated) {
        onAuthSuccess?.(response.userInfo);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Handle Google OAuth flow
  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setAuthStep('requesting');
    setAuthProgress(20);

    try {
      // Step 1: Get auth URL
      const response = await apiService.getGoogleAuthUrl();
      
      if (!response.authUrl) {
        throw new Error('فشل في الحصول على رابط المصادقة');
      }

      setAuthStep('redirecting');
      setAuthProgress(40);

      // Step 2: Open auth window
      const authWindow = window.open(
        response.authUrl, 
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      setAuthStep('waiting');
      setAuthProgress(60);

      // Step 3: Listen for auth completion
      const checkAuthCompletion = setInterval(async () => {
        try {
          if (authWindow.closed) {
            clearInterval(checkAuthCompletion);
            setAuthStep('verifying');
            setAuthProgress(80);

            // Check if auth was successful
            const authStatus = await apiService.checkGoogleAuthStatus();
            
            if (authStatus.isAuthenticated) {
              setAuthStep('completed');
              setAuthProgress(100);
              
              setTimeout(() => {
                onAuthSuccess?.(authStatus.userInfo);
              }, 1000);
            } else {
              throw new Error('فشل في إكمال عملية المصادقة');
            }
          }
        } catch (error) {
          clearInterval(checkAuthCompletion);
          setAuthError(error.message);
          setAuthStep('error');
        }
      }, 1000);

      // Cleanup if window is not closed after 5 minutes
      setTimeout(() => {
        if (!authWindow.closed) {
          authWindow.close();
          clearInterval(checkAuthCompletion);
          setAuthError('انتهت مهلة المصادقة');
          setAuthStep('error');
        }
      }, 300000);

    } catch (error) {
      setAuthError(error.message || 'حدث خطأ أثناء المصادقة');
      setAuthStep('error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle retry authentication
  const handleRetry = () => {
    setAuthError(null);
    setAuthStep('idle');
    setAuthProgress(0);
    handleGoogleAuth();
  };

  // Get step description
  const getStepDescription = (step) => {
    switch (step) {
      case 'requesting':
        return 'جاري طلب المصادقة من Google...';
      case 'redirecting':
        return 'جاري فتح نافذة المصادقة...';
      case 'waiting':
        return 'في انتظار إكمال المصادقة...';
      case 'verifying':
        return 'جاري التحقق من المصادقة...';
      case 'completed':
        return 'تم إكمال المصادقة بنجاح!';
      case 'error':
        return 'حدث خطأ في المصادقة';
      default:
        return 'جاهز للمصادقة مع Google';
    }
  };

  if (isAuthenticated && userInfo) {
    return (
      <div className="google-oauth">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4"
            >
              تم ربط الحساب بنجاح!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              تم ربط حسابك مع Google Ads بنجاح. يمكنك الآن الوصول إلى حساباتك الإعلانية
            </motion.p>
          </div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <User className="w-5 h-5" />
                  معلومات الحساب المرتبط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {userInfo.picture && (
                    <img 
                      src={userInfo.picture} 
                      alt={userInfo.name}
                      className="w-16 h-16 rounded-full border-2 border-green-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{userInfo.name}</h3>
                    <p className="text-muted-foreground">{userInfo.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        مُصادق عليه
                      </Badge>
                      <Badge variant="outline">
                        Google Ads
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Permissions Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  الصلاحيات الممنوحة
                </CardTitle>
                <CardDescription>
                  الصلاحيات التي تم منحها لتطبيقنا للوصول إلى حساب Google Ads الخاص بك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Globe,
                      title: 'قراءة حسابات Google Ads',
                      description: 'عرض قائمة حساباتك الإعلانية'
                    },
                    {
                      icon: Zap,
                      title: 'إدارة الحملات',
                      description: 'إنشاء وتعديل الحملات الإعلانية'
                    },
                    {
                      icon: User,
                      title: 'معلومات الملف الشخصي',
                      description: 'الوصول إلى اسمك وصورتك'
                    },
                    {
                      icon: Shield,
                      title: 'وصول آمن',
                      description: 'جميع البيانات محمية ومشفرة'
                    }
                  ].map((permission, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                        <permission.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{permission.title}</h4>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              onClick={onNext}
              className="px-8 py-3 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Shield className="w-5 h-5 mr-2" />
              متابعة إلى اختيار الحساب
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="google-oauth">
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
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            ربط حساب Google Ads
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            قم بربط حسابك مع Google Ads للوصول إلى حساباتك الإعلانية وإنشاء الحملات
          </motion.p>
        </div>

        {/* Authentication Progress */}
        {isAuthenticating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري المصادقة
                </CardTitle>
                <CardDescription>
                  {getStepDescription(authStep)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم</span>
                    <span>{authProgress}%</span>
                  </div>
                  <Progress value={authProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error Display */}
        {(authError || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{authError || error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة المحاولة
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />
                مصادقة Google
              </CardTitle>
              <CardDescription>
                ستتم إعادة توجيهك إلى Google لإكمال عملية المصادقة الآمنة
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Security Info */}
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <strong>آمن ومحمي:</strong> نحن نستخدم OAuth 2.0 المعيار الصناعي للمصادقة الآمنة. 
                  لن نحصل على كلمة مرورك أو أي معلومات حساسة.
                </AlertDescription>
              </Alert>

              {/* Auth Button */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleGoogleAuth}
                  disabled={isAuthenticating}
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      جاري المصادقة...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      ربط مع Google Ads
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Shield,
              title: 'أمان متقدم',
              description: 'مصادقة آمنة باستخدام معايير Google'
            },
            {
              icon: Zap,
              title: 'وصول سريع',
              description: 'ربط فوري مع جميع حساباتك الإعلانية'
            },
            {
              icon: Lock,
              title: 'خصوصية محمية',
              description: 'بياناتك محمية ولن تُشارك مع أطراف ثالثة'
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

export default GoogleOAuth;
