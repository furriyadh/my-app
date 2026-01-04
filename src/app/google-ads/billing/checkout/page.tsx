'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    Check,
    ArrowLeft,
    Crown,
    CreditCard,
    Copy,
    AlertCircle,
    ExternalLink,
    Clock,
    Zap,
    Shield,
    Sparkles,
    Users,
    Building2,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { supabase } from '@/lib/supabase';

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

// Types
type PaymentMethod = 'visa_mastercard' | 'usdt_crypto' | 'redotpay' | 'paypal';
type CryptoNetwork = 'TRC20' | 'BEP20';

// Plan data matching billing page
const PLANS = {
    free: { id: 'free', name: 'Free', nameAr: 'مجاني', price: 0, yearlyPrice: 0, icon: Zap, color: 'gray' },
    basic: { id: 'basic', name: 'Basic', nameAr: 'أساسي', price: 49, yearlyPrice: 490, icon: CreditCard, color: 'blue' },
    pro: { id: 'pro', name: 'Pro', nameAr: 'احترافي', price: 99, yearlyPrice: 990, icon: Crown, color: 'primary' },
    agency: { id: 'agency', name: 'Agency', nameAr: 'وكالة', price: 249, yearlyPrice: 2490, icon: Users, color: 'orange' },
    enterprise: { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسي', price: -1, yearlyPrice: -1, icon: Building2, color: 'purple' }
};

// Payment methods - same as FurriyadhPaymentGateway
const PAYMENT_METHODS = [
    {
        id: 'visa_mastercard' as PaymentMethod,
        name: 'Visa / MasterCard',
        nameAr: 'فيزا / ماستركارد',
        iconPath: '/images/payment-method/visa-mastercard-v3.png',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+3.55%',
        calculateFee: (amount: number) => amount * 0.0355,
    },
    {
        id: 'usdt_crypto' as PaymentMethod,
        name: 'USDT',
        nameAr: 'تحويل USDT',
        iconPath: '/images/payment-method/usdt-v2.png',
        processingTime: '3-10 min',
        processingTimeAr: '3-10 دقائق',
        feeDisplay: '+$1',
        calculateFee: () => 1,
        popular: true
    },
    {
        id: 'redotpay' as PaymentMethod,
        name: 'RedotPay',
        nameAr: 'ريدوت باي',
        iconPath: '/images/payment-method/redotpay.png',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+$1',
        calculateFee: () => 1,
    },
    {
        id: 'paypal' as PaymentMethod,
        name: 'PayPal',
        nameAr: 'باي بال',
        iconPath: '/images/payment-method/paypal.svg',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+4.4%',
        calculateFee: (amount: number) => amount * 0.044,
    }
];

// Crypto networks for USDT
const CRYPTO_NETWORKS = [
    {
        id: 'TRC20' as CryptoNetwork,
        name: 'Tron (TRC20)',
        chain: 'TRON Network',
        chainColor: 'text-red-500',
        estimatedTime: '~3 min',
        walletAddress: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || 'TRC20_ADDRESS_NOT_CONFIGURED',
        fee: '~1 USDT',
        recommended: true
    },
    {
        id: 'BEP20' as CryptoNetwork,
        name: 'BSC (BEP20)',
        chain: 'BNB Smart Chain',
        chainColor: 'text-yellow-500',
        estimatedTime: '~5 min',
        walletAddress: process.env.NEXT_PUBLIC_USDT_BEP20_ADDRESS || 'BEP20_ADDRESS_NOT_CONFIGURED',
        fee: '~0.3 USDT',
        recommended: false
    }
];

// Payment info from env
const PAYMENT_INFO = {
    redotpay_uid: process.env.NEXT_PUBLIC_REDOTPAY_UID || 'REDOTPAY_UID_NOT_CONFIGURED',
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get URL params
    const planId = searchParams.get('plan') || 'pro';
    const cycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';

    // State
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [isRTL, setIsRTL] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'success'>('select');

    // 💳 Saved Cards State
    interface SavedCard {
        id: string;
        last4: string;  // Database column name
        brand: string;  // visa, mastercard
        cardholder_name: string;
        exp_month: number;
        exp_year: number;
        is_default: boolean;
    }
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [saveCardForFuture, setSaveCardForFuture] = useState(true);

    // Card input state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    // 🔒 Card Validation State
    interface CardValidation {
        isValid: boolean;
        cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
        error?: string;
    }
    const [cardValidation, setCardValidation] = useState<CardValidation>({ isValid: false, cardType: 'unknown' });
    const [expiryValid, setExpiryValid] = useState<boolean | null>(null);
    const [cvvValid, setCvvValid] = useState<boolean | null>(null);

    // 🔐 Luhn Algorithm - Industry standard card validation
    const validateCardNumber = (number: string): CardValidation => {
        const cleanNumber = number.replace(/\s/g, '');

        // Detect card type
        let cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' = 'unknown';
        if (/^4/.test(cleanNumber)) cardType = 'visa';
        else if (/^5[1-5]/.test(cleanNumber)) cardType = 'mastercard';
        else if (/^3[47]/.test(cleanNumber)) cardType = 'amex';
        else if (/^6(?:011|5)/.test(cleanNumber)) cardType = 'discover';

        // Check length
        const validLengths: Record<string, number[]> = {
            visa: [13, 16, 19],
            mastercard: [16],
            amex: [15],
            discover: [16],
            unknown: [13, 14, 15, 16, 17, 18, 19]
        };

        if (!validLengths[cardType].includes(cleanNumber.length)) {
            if (cleanNumber.length < 13) {
                return { isValid: false, cardType, error: undefined }; // Still typing
            }
            return { isValid: false, cardType, error: 'رقم البطاقة غير صحيح' };
        }

        // Luhn Algorithm
        let sum = 0;
        let isEven = false;
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i], 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }

        const isValid = sum % 10 === 0;
        return {
            isValid,
            cardType,
            error: isValid ? undefined : 'رقم البطاقة غير صالح'
        };
    };

    // Validate Expiry Date
    const validateExpiry = (expiry: string): boolean => {
        if (!expiry || expiry.length < 5) return false;

        const [monthStr, yearStr] = expiry.split('/');
        const month = parseInt(monthStr, 10);
        const year = 2000 + parseInt(yearStr, 10);

        if (month < 1 || month > 12) return false;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    };

    // Validate CVV
    const validateCVV = (cvv: string, cardType: string): boolean => {
        if (!cvv) return false;
        // Amex has 4 digit CVV, others have 3
        const requiredLength = cardType === 'amex' ? 4 : 3;
        return cvv.length === requiredLength && /^\d+$/.test(cvv);
    };

    // Get selected plan
    const selectedPlan = PLANS[planId as keyof typeof PLANS] || PLANS.pro;
    const planPrice = cycle === 'monthly' ? selectedPlan.price : selectedPlan.yearlyPrice;
    const savingsAmount = cycle === 'yearly' ? (selectedPlan.price * 12) - selectedPlan.yearlyPrice : 0;

    // Calculate fees
    const currentPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    const processingFee = currentPaymentMethod?.calculateFee(planPrice) || 0;
    const totalPayment = planPrice + processingFee;

    // Load user, language, and saved cards
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
        if (savedLanguage) {
            setLanguage(savedLanguage);
            setIsRTL(savedLanguage === 'ar');
        }

        // Get user email and ID, then fetch saved cards
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
                setUserId(user.id);
                // Fetch saved cards
                fetchSavedCards(user.id);
            }
        };
        fetchUser();
    }, []);

    // Fetch saved payment methods
    const fetchSavedCards = async (uid: string) => {
        try {
            const { data, error } = await supabase
                .from('user_payment_methods')
                .select('*')
                .eq('user_id', uid)
                .eq('type', 'card')
                .order('is_default', { ascending: false });

            if (data && !error) {
                setSavedCards(data);
                // Auto-select default card if exists
                const defaultCard = data.find(c => c.is_default);
                if (defaultCard) {
                    setSelectedSavedCard(defaultCard.id);
                }
            }
        } catch (err) {
            console.error('Error fetching saved cards:', err);
        }
    };

    // Save new card to database
    const saveCardToDatabase = async () => {
        if (!userId || !cardNumber || !cardExpiry) return;

        const [expiryMonth, expiryYear] = cardExpiry.split('/');
        const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4);
        const cardBrand = cardNumber.startsWith('4') ? 'visa' :
            cardNumber.startsWith('5') ? 'mastercard' : 'card';

        try {
            const { data, error } = await supabase
                .from('user_payment_methods')
                .insert({
                    user_id: userId,
                    user_email: userEmail,
                    type: 'card',
                    last4: cardLast4,
                    brand: cardBrand,
                    cardholder_name: cardholderName,
                    exp_month: parseInt(expiryMonth),
                    exp_year: 2000 + parseInt(expiryYear),
                    is_default: savedCards.length === 0 // First card is default
                })
                .select()
                .single();

            if (data && !error) {
                console.log('💳 Card saved:', data);
                setSavedCards(prev => [...prev, data]);
            }
        } catch (err) {
            console.error('Error saving card:', err);
        }
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(null), 2500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Handle subscription creation
    const handleSubscriptionCreate = async (paymentMethod: string, transactionId: string) => {
        try {
            const response = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    email: userEmail,
                    plan_id: planId,
                    billing_cycle: cycle,
                    payment_method: paymentMethod,
                    transaction_id: transactionId,
                    amount: totalPayment
                })
            });

            const data = await response.json();
            if (data.success) {
                setPaymentSuccess(true);
                setPaymentStep('success');

                // Send confirmation email
                await fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: userEmail,
                        type: 'subscription_confirmation',
                        data: {
                            planName: selectedPlan.name,
                            planNameAr: selectedPlan.nameAr,
                            amount: totalPayment.toFixed(2),
                            billingCycle: cycle,
                            transactionId: transactionId,
                            dashboardUrl: `${window.location.origin}/google-ads/billing`
                        }
                    })
                }).catch(err => console.error('Email error:', err));

            } else {
                throw new Error(data.error || 'Subscription creation failed');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            alert(isRTL ? 'فشل في إنشاء الاشتراك' : 'Failed to create subscription');
        }
    };

    // Handle PayPal success
    const handlePayPalSuccess = async (details: any) => {
        setIsProcessing(true);
        try {
            await handleSubscriptionCreate('paypal', details.id);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle manual payment confirmation
    const handleManualPaymentConfirm = async () => {
        setIsProcessing(true);
        try {
            const transactionId = `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await handleSubscriptionCreate(selectedMethod || 'manual', transactionId);
        } finally {
            setIsProcessing(false);
        }
    };

    // Render payment method selection
    const renderPaymentMethods = () => (
        <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((method) => (
                <button
                    key={method.id}
                    onClick={() => {
                        setSelectedMethod(method.id);
                        setPaymentStep('details');
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                >
                    {method.popular && (
                        <span className="absolute -top-2 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {isRTL ? 'شائع' : 'Popular'}
                        </span>
                    )}

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                        <Image
                            src={method.iconPath}
                            alt={method.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {isRTL ? method.nameAr : method.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {isRTL ? method.processingTimeAr : method.processingTime}
                            </span>
                            <span className="text-xs text-orange-500 font-medium">
                                {method.feeDisplay}
                            </span>
                        </div>
                    </div>

                    <Check className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary-500' : 'text-transparent'}`} />
                </button>
            ))}
        </div>
    );

    // Render payment details based on selected method
    const renderPaymentDetails = () => {
        if (!selectedMethod) return null;

        // USDT Crypto
        if (selectedMethod === 'usdt_crypto') {
            const network = CRYPTO_NETWORKS.find(n => n.id === selectedNetwork);
            return (
                <div className="space-y-5">
                    {/* Network Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        {CRYPTO_NETWORKS.map((net) => (
                            <button
                                key={net.id}
                                onClick={() => setSelectedNetwork(net.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${selectedNetwork === net.id
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {net.recommended && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {isRTL ? 'مُوصى' : 'BEST'}
                                    </span>
                                )}
                                <p className={`text-lg font-bold ${selectedNetwork === net.id ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                    {net.id}
                                </p>
                                <p className={`text-xs ${net.chainColor}`}>{net.chain}</p>
                            </button>
                        ))}
                    </div>

                    {/* Wallet Address */}
                    {network && (
                        <div className="bg-gray-900 rounded-xl p-5">
                            <div className="bg-black/40 rounded-xl p-4 mb-3">
                                <code className="text-sm font-mono text-green-400 break-all">
                                    {network.walletAddress}
                                </code>
                            </div>
                            <button
                                onClick={() => copyToClipboard(network.walletAddress, 'wallet')}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${copiedText === 'wallet'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    }`}
                            >
                                {copiedText === 'wallet' ? (
                                    <><Check className="w-5 h-5" />{isRTL ? 'تم النسخ!' : 'Copied!'}</>
                                ) : (
                                    <><Copy className="w-5 h-5" />{isRTL ? 'نسخ العنوان' : 'Copy Address'}</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Amount Warning */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div className="text-sm text-amber-700 dark:text-amber-300">
                                <p className="font-bold mb-1">{isRTL ? '⚠️ مهم!' : '⚠️ Important!'}</p>
                                <p>{isRTL ? `أرسل بالضبط: $${totalPayment.toFixed(2)} USDT` : `Send exactly: $${totalPayment.toFixed(2)} USDT`}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleManualPaymentConfirm}
                        disabled={isProcessing}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? (isRTL ? 'جاري المعالجة...' : 'Processing...') : (isRTL ? 'تأكيد الدفع' : 'Confirm Payment')}
                    </button>
                </div>
            );
        }

        // RedotPay
        if (selectedMethod === 'redotpay') {
            return (
                <div className="space-y-5">
                    <div className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-xl p-6 text-center">
                        <h5 className="text-lg font-bold text-white mb-2">RedotPay UID</h5>
                        <div className="bg-black/20 rounded-xl p-4 mb-4">
                            <code className="text-xl font-mono font-bold text-white">
                                {PAYMENT_INFO.redotpay_uid}
                            </code>
                        </div>
                        <button
                            onClick={() => copyToClipboard(PAYMENT_INFO.redotpay_uid, 'redotpay')}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${copiedText === 'redotpay'
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-red-600'
                                }`}
                        >
                            {copiedText === 'redotpay' ? (
                                <><Check className="w-5 h-5" />{isRTL ? 'تم النسخ!' : 'Copied!'}</>
                            ) : (
                                <><Copy className="w-5 h-5" />{isRTL ? 'نسخ UID' : 'Copy UID'}</>
                            )}
                        </button>
                    </div>

                    <a
                        href="https://helpcenter.redotpay.com/en/articles/10521793-where-can-i-find-my-redotpay-uid"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-medium"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {isRTL ? 'كيف تجد UID الخاص بك؟' : 'How to find your UID?'}
                    </a>

                    <button
                        onClick={handleManualPaymentConfirm}
                        disabled={isProcessing}
                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? (isRTL ? 'جاري المعالجة...' : 'Processing...') : (isRTL ? 'تأكيد الدفع' : 'Confirm Payment')}
                    </button>
                </div>
            );
        }

        // PayPal
        if (selectedMethod === 'paypal') {
            return (
                <div className="space-y-5">
                    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                        <PayPalButtons
                            style={{ layout: 'vertical', height: 50 }}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    intent: 'CAPTURE',
                                    purchase_units: [{
                                        amount: {
                                            currency_code: 'USD',
                                            value: totalPayment.toFixed(2)
                                        },
                                        description: `${selectedPlan.name} Plan - ${cycle} subscription`
                                    }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                const details = await actions.order?.capture();
                                if (details) {
                                    await handlePayPalSuccess(details);
                                }
                            }}
                            onError={(err) => {
                                console.error('PayPal error:', err);
                                alert(isRTL ? 'فشل الدفع عبر PayPal' : 'PayPal payment failed');
                            }}
                        />
                    </PayPalScriptProvider>
                </div>
            );
        }

        // Visa/MasterCard
        if (selectedMethod === 'visa_mastercard') {
            const handleCardPayment = async () => {
                setIsProcessing(true);

                // If new card and save for future is checked
                if ((showNewCardForm || savedCards.length === 0) && saveCardForFuture && cardNumber && cardExpiry) {
                    await saveCardToDatabase();
                }

                // Process payment
                await handleManualPaymentConfirm();
            };

            return (
                <div className="space-y-5">
                    {/* Saved Cards Section */}
                    {savedCards.length > 0 && !showNewCardForm && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {isRTL ? 'البطاقات المحفوظة' : 'Saved Cards'}
                            </h4>
                            {savedCards.map((card) => (
                                <button
                                    key={card.id}
                                    onClick={() => setSelectedSavedCard(card.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedSavedCard === card.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    {/* Card Icon */}
                                    <div className={`p-2 rounded-lg ${card.brand === 'visa' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                                        <CreditCard className={`w-5 h-5 ${card.brand === 'visa' ? 'text-blue-600' : 'text-orange-600'}`} />
                                    </div>

                                    {/* Card Details */}
                                    <div className="flex-1 text-left">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            •••• •••• •••• {card.last4}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {card.cardholder_name} • {card.exp_month.toString().padStart(2, '0')}/{card.exp_year.toString().slice(-2)}
                                        </p>
                                    </div>

                                    {/* Selection Indicator */}
                                    {selectedSavedCard === card.id && (
                                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}

                                    {/* Default Badge */}
                                    {card.is_default && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded-full">
                                            {isRTL ? 'الافتراضية' : 'Default'}
                                        </span>
                                    )}
                                </button>
                            ))}

                            {/* Add New Card Button */}
                            <button
                                onClick={() => {
                                    setShowNewCardForm(true);
                                    setSelectedSavedCard(null);
                                }}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-all"
                            >
                                <CreditCard className="w-5 h-5" />
                                {isRTL ? 'إضافة بطاقة جديدة' : 'Add New Card'}
                            </button>
                        </div>
                    )}

                    {/* New Card Form - Show if no saved cards or user chose to add new */}
                    {(savedCards.length === 0 || showNewCardForm) && (
                        <div className="space-y-4">
                            {showNewCardForm && savedCards.length > 0 && (
                                <button
                                    onClick={() => {
                                        setShowNewCardForm(false);
                                        if (savedCards.length > 0) {
                                            setSelectedSavedCard(savedCards[0].id);
                                        }
                                    }}
                                    className="text-primary-500 hover:text-primary-600 text-sm flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {isRTL ? 'العودة للبطاقات المحفوظة' : 'Back to saved cards'}
                                </button>
                            )}

                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? 'رقم البطاقة' : 'Card Number'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        placeholder="4242 4242 4242 4242"
                                        maxLength={19}
                                        className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-mono tracking-wider pr-24 ${cardNumber.length > 0
                                            ? cardValidation.isValid
                                                ? 'border-green-500'
                                                : cardValidation.error
                                                    ? 'border-red-500'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                                            value = value.replace(/(.{4})/g, '$1 ').trim();
                                            setCardNumber(value);
                                            // Validate on change
                                            const validation = validateCardNumber(value);
                                            setCardValidation(validation);
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {/* Validation indicator */}
                                        {cardNumber.length > 0 && cardValidation.isValid && (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        )}
                                        {cardNumber.length > 0 && cardValidation.error && (
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        )}
                                        {/* Card type icon */}
                                        {cardValidation.cardType === 'visa' && (
                                            <img src="/images/payment-method/visa-icon.svg" alt="Visa" className="h-6 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        )}
                                        {cardValidation.cardType === 'mastercard' && (
                                            <img src="/images/payment-method/mastercard-icon.svg" alt="Mastercard" className="h-6 w-auto" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        )}
                                        {cardValidation.cardType === 'unknown' && cardNumber.length === 0 && (
                                            <>
                                                <img src="/images/payment-method/visa-icon.svg" alt="Visa" className="h-6 w-auto opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                <img src="/images/payment-method/mastercard-icon.svg" alt="Mastercard" className="h-6 w-auto opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </>
                                        )}
                                    </div>
                                </div>
                                {/* Error message */}
                                {cardValidation.error && (
                                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {cardValidation.error}
                                    </p>
                                )}
                            </div>

                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-mono text-center pr-10 ${cardExpiry.length === 5
                                                ? expiryValid
                                                    ? 'border-green-500'
                                                    : 'border-red-500'
                                                : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 2) {
                                                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                                }
                                                setCardExpiry(value);
                                                if (value.length === 5) {
                                                    setExpiryValid(validateExpiry(value));
                                                } else {
                                                    setExpiryValid(null);
                                                }
                                            }}
                                        />
                                        {cardExpiry.length === 5 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {expiryValid ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {cardExpiry.length === 5 && !expiryValid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {isRTL ? 'البطاقة منتهية الصلاحية' : 'Card expired'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        CVV
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={cardCVV}
                                            placeholder="•••"
                                            maxLength={cardValidation.cardType === 'amex' ? 4 : 3}
                                            className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-mono text-center pr-10 ${cardCVV.length >= 3
                                                ? cvvValid
                                                    ? 'border-green-500'
                                                    : 'border-red-500'
                                                : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setCardCVV(value);
                                                if (value.length >= 3) {
                                                    setCvvValid(validateCVV(value, cardValidation.cardType));
                                                } else {
                                                    setCvvValid(null);
                                                }
                                            }}
                                        />
                                        {cardCVV.length >= 3 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {cvvValid ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardholderName}
                                        placeholder={isRTL ? 'الاسم كما يظهر على البطاقة' : 'Name as it appears on card'}
                                        className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10 ${cardholderName.length >= 3
                                            ? 'border-green-500'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        onChange={(e) => setCardholderName(e.target.value)}
                                    />
                                    {cardholderName.length >= 3 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Save Card Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={saveCardForFuture}
                                    onChange={(e) => setSaveCardForFuture(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {isRTL ? 'حفظ البطاقة للمدفوعات المستقبلية' : 'Save card for future payments'}
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Lock className="w-4 h-4" />
                        <span>{isRTL ? 'بياناتك محمية بتشفير SSL 256-bit' : 'Your data is protected with 256-bit SSL encryption'}</span>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handleCardPayment}
                        disabled={isProcessing || (
                            !selectedSavedCard && (
                                !cardValidation.isValid ||
                                !expiryValid ||
                                !cvvValid ||
                                cardholderName.length < 3
                            )
                        )}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                {isRTL ? `ادفع $${totalPayment.toFixed(2)}` : `Pay $${totalPayment.toFixed(2)}`}
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return null;
    };

    // Success Screen
    const renderSuccessScreen = () => (
        <div className="text-center py-10">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {isRTL ? '🎉 تهانينا!' : '🎉 Congratulations!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isRTL
                    ? `تم تفعيل اشتراكك في باقة ${selectedPlan.nameAr} بنجاح!`
                    : `Your ${selectedPlan.name} plan subscription is now active!`
                }
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
                <p className="text-green-700 dark:text-green-400 text-sm">
                    {isRTL
                        ? 'تم إرسال تفاصيل الاشتراك إلى بريدك الإلكتروني'
                        : 'Subscription details have been sent to your email'
                    }
                </p>
            </div>
            <button
                onClick={() => router.push('/google-ads/billing')}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg transition-colors"
            >
                {isRTL ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => paymentStep === 'details' ? setPaymentStep('select') : router.back()}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isRTL ? 'إتمام الاشتراك' : 'Complete Subscription'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isRTL ? 'آمن ومشفر 100%' : 'Secure and encrypted'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
                            {paymentStep === 'success' ? renderSuccessScreen() : (
                                <>
                                    {/* Step Indicator */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paymentStep === 'select' ? 'bg-primary-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {paymentStep === 'select' ? '1' : <Check className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                                            <div className={`h-full bg-primary-500 rounded transition-all ${paymentStep === 'details' ? 'w-full' : 'w-0'}`} />
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paymentStep === 'details' ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>
                                            2
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        {paymentStep === 'select'
                                            ? (isRTL ? 'اختر طريقة الدفع' : 'Choose Payment Method')
                                            : (isRTL ? 'أكمل الدفع' : 'Complete Payment')
                                        }
                                    </h2>

                                    {paymentStep === 'select' ? renderPaymentMethods() : renderPaymentDetails()}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                            </h3>

                            {/* Plan Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                                <div className={`p-2 rounded-lg bg-${selectedPlan.color}-100 dark:bg-${selectedPlan.color}-900/20`}>
                                    <selectedPlan.icon className={`w-6 h-6 text-${selectedPlan.color}-500`} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {isRTL ? selectedPlan.nameAr : selectedPlan.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {cycle === 'monthly' ? (isRTL ? 'شهري' : 'Monthly') : (isRTL ? 'سنوي' : 'Yearly')}
                                    </p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{isRTL ? 'سعر الباقة' : 'Plan Price'}</span>
                                    <span className="text-gray-900 dark:text-white font-medium">${planPrice.toFixed(2)}</span>
                                </div>

                                {selectedMethod && processingFee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{isRTL ? 'رسوم المعالجة' : 'Processing Fee'}</span>
                                        <span className="text-orange-500 font-medium">+${processingFee.toFixed(2)}</span>
                                    </div>
                                )}

                                {savingsAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-500">{isRTL ? 'التوفير' : 'You Save'}</span>
                                        <span className="text-green-500 font-medium">-${savingsAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-900 dark:text-white font-bold">{isRTL ? 'الإجمالي' : 'Total'}</span>
                                    <span className="text-2xl font-bold text-primary-500">${totalPayment.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                                <Shield className="w-4 h-4 text-green-500 fill-green-500" />
                                <span>{isRTL ? 'دفع آمن ومشفر' : 'Secure & Encrypted Payment'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SubscriptionCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
