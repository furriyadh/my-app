// components/Dashboard/GoogleAds/AccountSelector.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  User, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Globe,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Separator } from '../../ui/separator';
import { apiService } from '../../../services/api';
import './AccountSelector.css';

const AccountSelector = ({ 
  onAccountSelect, 
  onNext, 
  selectedAccount,
  isProcessing,
  error 
}) => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Load Google Ads accounts
  const loadAccounts = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setAuthError(null);
      
      const response = await apiService.getGoogleAdsAccounts();
      
      if (response.success) {
        setAccounts(response.accounts || []);
      } else {
        setAuthError(response.error || 'فشل في تحميل حسابات Google Ads');
      }
    } catch (error) {
      setAuthError('حدث خطأ أثناء تحميل الحسابات');
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Handle account selection
  const handleAccountSelect = (account) => {
    onAccountSelect(account);
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    try {
      const response = await apiService.getGoogleAuthUrl();
      if (response.authUrl) {
        window.open(response.authUrl, '_blank', 'width=500,height=600');
      }
    } catch (error) {
      setAuthError('فشل في بدء عملية المصادقة مع Google');
    }
  };

  // Get account type icon and info
  const getAccountInfo = (account) => {
    if (account.isManager) {
      return {
        icon: Building2,
        type: 'حساب إداري',
        description: 'يدير عدة حسابات إعلانية',
        color: 'blue'
      };
    }
    return {
      icon: User,
      type: 'حساب فردي',
      description: 'حساب إعلاني واحد',
      color: 'green'
    };
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENABLED':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'DISABLED':
        return <Badge variant="secondary">معطل</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">معلق</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="account-selector">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">جاري تحميل الحسابات...</h2>
          <p className="text-muted-foreground">يرجى الانتظار بينما نحمل حسابات Google Ads الخاصة بك</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="account-selector">
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4"
          >
            اختيار حساب Google Ads
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            اختر الحساب الذي تريد إنشاء الحملة الإعلانية فيه
          </motion.p>
        </div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-xl font-semibold">الحسابات المتاحة ({accounts.length})</h2>
          <Button
            variant="outline"
            onClick={() => loadAccounts(true)}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            تحديث
          </Button>
        </motion.div>

        {/* Error Display */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{authError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleAuth}
                  className="ml-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  ربط حساب Google
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            {accounts.map((account, index) => {
              const accountInfo = getAccountInfo(account);
              const AccountIcon = accountInfo.icon;
              const isSelected = selectedAccount?.id === account.id;
              
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                        : 'hover:border-blue-300'
                    } ${
                      account.status !== 'ENABLED' ? 'opacity-60' : ''
                    }`}
                    onClick={() => account.status === 'ENABLED' && handleAccountSelect(account)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        {/* Account Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          accountInfo.color === 'blue' 
                            ? 'bg-blue-100' 
                            : 'bg-green-100'
                        }`}>
                          <AccountIcon className={`w-6 h-6 ${
                            accountInfo.color === 'blue' 
                              ? 'text-blue-600' 
                              : 'text-green-600'
                          }`} />
                        </div>

                        {/* Account Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{account.name}</h3>
                            {getStatusBadge(account.status)}
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {accountInfo.type}
                              </Badge>
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              {account.currency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {account.timeZone}
                            </span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">
                            {accountInfo.description}
                          </p>
                        </div>

                        {/* Customer ID */}
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">معرف العميل</div>
                          <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {account.customerId}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <Card className="border-dashed border-2">
              <CardContent className="pt-12 pb-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد حسابات متاحة</h3>
                <p className="text-muted-foreground mb-6">
                  يبدو أنه لا توجد حسابات Google Ads مرتبطة بحسابك
                </p>
                <Button onClick={handleGoogleAuth} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  ربط حساب Google Ads
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Selected Account Summary */}
        <AnimatePresence>
          {selectedAccount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    الحساب المحدد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAccount.name}</h3>
                      <p className="text-muted-foreground">
                        سيتم إنشاء الحملة في هذا الحساب
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">معرف العميل</div>
                      <div className="font-mono text-sm">{selectedAccount.customerId}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            onClick={onNext}
            disabled={!selectedAccount || isProcessing}
            className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                متابعة إنشاء الحملة
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccountSelector;
