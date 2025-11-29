'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  RefreshCw,
  ChevronRight,
  Star,
  Shield,
  Award
} from 'lucide-react';

interface BillingStats {
  currentSpend: number;
  monthlyBudget: number;
  lastMonthSpend: number;
  predictedSpend: number;
  savingsThisMonth: number;
  activeSubscriptions: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  downloadUrl?: string;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'trial';
  features: string[];
}

const BillingPage: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [stats, setStats] = useState<BillingStats>({
    currentSpend: 2847.50,
    monthlyBudget: 5000,
    lastMonthSpend: 3124.75,
    predictedSpend: 2950,
    savingsThisMonth: 277.25,
    activeSubscriptions: 3
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      last4: '8888',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 2847.50,
      status: 'paid',
      description: 'Google Ads Campaign - January 2024'
    },
    {
      id: 'INV-2024-002',
      date: '2024-01-01',
      amount: 150.00,
      status: 'paid',
      description: 'Premium Subscription - January'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 3124.75,
      status: 'paid',
      description: 'Google Ads Campaign - December 2023'
    }
  ]);

  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_premium',
    name: 'Premium Plan',
    price: 150,
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-15',
    status: 'active',
    features: [
      'Unlimited Campaigns',
      'AI-Powered Optimization',
      'Advanced Analytics',
      'Priority Support',
      'Custom Reports'
    ]
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'methods' | 'history' | 'subscription'>('overview');

  // Listen for language changes
  useEffect(() => {
    const updateLanguage = () => {
      const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsRTL(savedLanguage === 'ar');
      }
    };
    updateLanguage();
    window.addEventListener('languageChange', updateLanguage);
    return () => window.removeEventListener('languageChange', updateLanguage);
  }, []);

  // AI-Powered Predictions
  const spendTrend = ((stats.currentSpend - stats.lastMonthSpend) / stats.lastMonthSpend * 100).toFixed(1);
  const budgetUsagePercent = (stats.currentSpend / stats.monthlyBudget * 100).toFixed(1);
  const predictedSavings = stats.lastMonthSpend - stats.predictedSpend;

  // AI Recommendations
  const aiRecommendations = [
    {
      icon: Sparkles,
      title: 'Optimize Ad Spend',
      description: 'AI detected that you can save up to $280 by adjusting your campaign schedule',
      action: 'View Insights',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Upgrade Plan',
      description: 'Based on your usage, Enterprise plan could save you 15% this month',
      action: 'Compare Plans',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Payment Security',
      description: 'Enable 3D Secure authentication for enhanced payment protection',
      action: 'Enable Now',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const StatCard = ({ icon: Icon, label, value, change, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${trend === 'up' ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-orange-500/20'} backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-sm font-medium`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {change}%
            </div>
          )}
        </div>
        
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black" dir="ltr">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'الفواتير والمدفوعات' : 'Billing & Payments'}
            </h1>
            <p className="text-gray-400 text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' 
                ? 'إدارة اشتراكك والمدفوعات وسجل الفواتير' 
                : 'Manage your subscription, payments, and billing history'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/75 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Report
          </motion.button>
        </div>

        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 mb-6"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl mb-1">AI-Powered Insights Available</h3>
                <p className="text-white/80">You could save ${predictedSavings.toFixed(2)} this month with AI optimizations</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300">
              View Insights
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          label="Current Spend"
          value={`$${stats.currentSpend.toFixed(2)}`}
          change={spendTrend}
          trend={parseFloat(spendTrend) > 0 ? 'down' : 'up'}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Budget"
          value={`$${stats.monthlyBudget.toFixed(2)}`}
          change={budgetUsagePercent}
          trend="up"
        />
        <StatCard
          icon={Zap}
          label="Predicted Spend"
          value={`$${stats.predictedSpend.toFixed(2)}`}
          change="5.6"
          trend="up"
        />
        <StatCard
          icon={CheckCircle}
          label="Savings This Month"
          value={`$${stats.savingsThisMonth.toFixed(2)}`}
          change="8.9"
          trend="up"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'methods', label: 'Payment Methods', icon: CreditCard },
          { id: 'history', label: 'Billing History', icon: Clock },
          { id: 'subscription', label: 'Subscription', icon: Star }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {aiRecommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rec.color} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${rec.color} bg-opacity-20 mb-4`}>
                      <rec.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{rec.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{rec.description}</p>
                    <button className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                      {rec.action}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Budget Progress */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-xl">Monthly Budget Usage</h3>
                <span className="text-gray-400 text-sm">{budgetUsagePercent}% Used</span>
              </div>
              
              <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsagePercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    parseFloat(budgetUsagePercent) > 90
                      ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : parseFloat(budgetUsagePercent) > 70
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                ></motion.div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Used</p>
                  <p className="text-white font-bold text-lg">${stats.currentSpend.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Remaining</p>
                  <p className="text-white font-bold text-lg">${(stats.monthlyBudget - stats.currentSpend).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Budget</p>
                  <p className="text-white font-bold text-lg">${stats.monthlyBudget.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Invoices */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-xl">Recent Invoices</h3>
                <button className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <motion.div
                    key={invoice.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        invoice.status === 'paid'
                          ? 'bg-green-500/20'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${
                          invoice.status === 'paid'
                            ? 'text-green-400'
                            : invoice.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{invoice.description}</p>
                        <p className="text-gray-400 text-sm">{invoice.id} • {new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">${invoice.amount.toFixed(2)}</p>
                        <p className={`text-sm capitalize ${
                          invoice.status === 'paid'
                            ? 'text-green-400'
                            : invoice.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>{invoice.status}</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedTab === 'methods' && (
          <motion.div
            key="methods"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300"
                >
                  {method.isDefault && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
                      Default
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                      <CreditCard className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg mb-1">{method.brand}</p>
                      <p className="text-gray-400">•••• •••• •••• {method.last4}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all duration-300">
                        Set as Default
                      </button>
                    )}
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all duration-300">
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add New Card */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: paymentMethods.length * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] group"
              >
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Add New Payment Method</p>
                <p className="text-gray-400 text-sm">Connect a new card or payment method</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {selectedTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {invoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-xl ${
                    invoice.status === 'paid'
                      ? 'bg-green-500/20'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    <CheckCircle className={`w-6 h-6 ${
                      invoice.status === 'paid'
                        ? 'text-green-400'
                        : invoice.status === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg mb-1">{invoice.description}</p>
                    <p className="text-gray-400">{invoice.id}</p>
                    <p className="text-gray-500 text-sm mt-1">{new Date(invoice.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">${invoice.amount.toFixed(2)}</p>
                    <p className={`text-sm capitalize font-medium ${
                      invoice.status === 'paid'
                        ? 'text-green-400'
                        : invoice.status === 'pending'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>{invoice.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all duration-300"
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedTab === 'subscription' && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Current Plan */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-8 h-8 text-white" />
                      <h2 className="text-3xl font-bold text-white">{subscription.name}</h2>
                    </div>
                    <p className="text-white/80">Your current subscription plan</p>
                  </div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <p className="text-white font-bold capitalize">{subscription.status}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <p className="text-white/80 text-sm mb-1">Monthly Price</p>
                    <p className="text-white font-bold text-3xl">${subscription.price}</p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <p className="text-white/80 text-sm mb-1">Billing Cycle</p>
                    <p className="text-white font-bold text-xl capitalize">{subscription.billingCycle}</p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                    <p className="text-white/80 text-sm mb-1">Next Billing</p>
                    <p className="text-white font-bold text-xl">{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-white font-bold text-lg mb-4">Included Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-white">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <Star className="w-5 h-5" />
                    Upgrade Plan
                  </button>
                  <button className="px-6 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300">
                    Manage Subscription
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Plan Comparison */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700"
            >
              <h3 className="text-white font-bold text-xl mb-6">Compare Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Basic', price: 49, features: ['5 Campaigns', 'Basic Analytics', 'Email Support'] },
                  { name: 'Premium', price: 150, features: ['Unlimited Campaigns', 'AI Optimization', 'Priority Support'], current: true },
                  { name: 'Enterprise', price: 499, features: ['Everything in Premium', 'Dedicated Manager', 'Custom Integration'] }
                ].map((plan, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl border-2 ${
                      plan.current
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 bg-gray-800/50'
                    } transition-all duration-300`}
                  >
                    <h4 className="text-white font-bold text-xl mb-2">{plan.name}</h4>
                    <p className="text-4xl font-bold text-white mb-4">
                      ${plan.price}
                      <span className="text-gray-400 text-base font-normal">/month</span>
                    </p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                        plan.current
                          ? 'bg-indigo-600 text-white cursor-default'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Choose Plan'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingPage;

