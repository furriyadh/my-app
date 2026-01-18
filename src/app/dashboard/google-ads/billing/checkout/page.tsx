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
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { supabase } from '@/lib/supabase';
import { getBackendUrl } from '@/lib/config';

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

// Types
type PaymentMethod = 'visa_mastercard' | 'usdt_crypto' | 'paypal';
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

// Paddle Price IDs (Matched with Billing Page)
const PADDLE_PRICE_IDS = {
    MONTHLY: {
        BASIC: 'pri_01ke7gzh9508w5j81azc699748',
        PRO: 'pri_01ke7h6e9d05pt54j0mxs539q2',
        AGENCY: 'pri_01ke7h8765hth3c99hgbvaaj6r'
    },
    YEARLY: {
        BASIC: 'pri_01ke7hr62ce5rgdndnpwhjz3sh',
        PRO: 'pri_01ke7hseye96pemfdssn9r5m5t',
        AGENCY: 'pri_01ke7htrekf52ar328f1esrmp3'
    }
};

// Payment info is no longer needed since RedotPay was removed

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
    const [paddle, setPaddle] = useState<Paddle>();

    // Initialize Paddle
    useEffect(() => {
        initializePaddle({
            environment: process.env.NEXT_PUBLIC_PADDLE_ENV as 'production' | 'sandbox' || 'production',
            token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        }).then((paddleInstance: Paddle | undefined) => {
            if (paddleInstance) {
                setPaddle(paddleInstance);
            }
        });
    }, []);

    // Helper to get Price ID based on selection
    const getPaddlePriceId = () => {
        // Map plan IDs from URL to Paddle keys
        // URL plans: free, basic, pro, agency, enterprise
        let planKey: 'BASIC' | 'PRO' | 'AGENCY' | null = null;

        if (planId === 'basic') planKey = 'BASIC';
        else if (planId === 'pro') planKey = 'PRO';
        else if (planId === 'agency') planKey = 'AGENCY';

        if (!planKey) return null;

        if (cycle === 'yearly') {
            return PADDLE_PRICE_IDS.YEARLY[planKey];
        } else {
            return PADDLE_PRICE_IDS.MONTHLY[planKey];
        }
    };

    const handlePaddleCheckout = (retries = 3) => {
        if (!paddle) return;

        const priceId = getPaddlePriceId();
        const successUrl = `${window.location.origin}/dashboard/google-ads/billing?payment=success&plan=${planId}`;

        if (!priceId) {
            console.error('Invalid plan selected for Paddle checkout');
            return;
        }

        // Paddle expects a class name for frameTarget, so we check for class
        const container = document.querySelector('.paddle-container');
        if (!container) {
            if (retries > 0) {
                setTimeout(() => handlePaddleCheckout(retries - 1), 200);
                return;
            }
            console.error('Error: .paddle-container not found in DOM after retries');
            return;
        }

        try {
            paddle.Checkout.open({
                items: [{ priceId, quantity: 1 }],
                settings: {
                    displayMode: 'inline',
                    frameTarget: 'paddle-container', // Matches class name below
                    frameInitialHeight: 450,
                    frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
                    theme: 'dark',
                    locale: language === 'ar' ? 'ar' : 'en',
                    successUrl: successUrl
                },
                customer: {
                    email: userEmail
                }
            });
        } catch (error: any) {
            console.error('Paddle open error:', error);
        }
    };

    // Trigger Paddle when switching to details view for Visa/MasterCard
    useEffect(() => {
        if (selectedMethod === 'visa_mastercard' && paymentStep === 'details' && paddle) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                handlePaddleCheckout();
            }, 100);
        }
    }, [selectedMethod, paymentStep, paddle]);

    // NowPayments state
    const [nowPaymentsInvoice, setNowPaymentsInvoice] = useState<{
        id: string;
        invoice_url: string;
        order_id: string;
        amount: number;
    } | null>(null);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

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
                            dashboardUrl: `${window.location.origin}/dashboard/google-ads/billing`
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

    // Create NowPayments invoice for USDT subscriptions
    const createNowPaymentsInvoice = async () => {
        if (!userEmail || planPrice <= 0) return;

        setIsCreatingInvoice(true);

        try {
            const response = await fetch('/api/payments/nowpayments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalPayment,
                    order_id: `SUB-${planId.toUpperCase()}-${cycle.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
                    description: `${selectedPlan.name} Plan - ${cycle} subscription`,
                    success_url: `${window.location.origin}/dashboard/google-ads/billing?payment=success&plan=${planId}`,
                    cancel_url: `${window.location.origin}/dashboard/google-ads/billing/checkout?plan=${planId}&cycle=${cycle}&payment=cancelled`,
                })
            });

            const data = await response.json();

            if (data.success && data.invoice) {
                console.log('✅ NowPayments invoice created:', data.invoice.id);
                // Auto-redirect to NowPayments - no second button needed
                window.open(data.invoice.invoice_url, '_blank');
                setNowPaymentsInvoice(data.invoice);
            } else {
                console.error('❌ Failed to create invoice:', data.error);
                alert(isRTL ? 'فشل إنشاء الفاتورة. حاول مرة أخرى.' : 'Failed to create invoice. Please try again.');
            }
        } catch (error) {
            console.error('❌ Invoice creation error:', error);
            alert(isRTL ? 'خطأ في الاتصال. حاول مرة أخرى.' : 'Connection error. Please try again.');
        } finally {
            setIsCreatingInvoice(false);
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
                    className={`relative p-4 rounded-md border-2 transition-all duration-300 flex items-center gap-4 ${selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                        }`}
                >
                    {method.popular && (
                        <span className="absolute -top-2 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            {isRTL ? 'شائع' : 'Popular'}
                        </span>
                    )}

                    <div className="w-12 h-12 rounded-md overflow-hidden bg-white flex items-center justify-center">
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

        // USDT Crypto with NowPayments
        if (selectedMethod === 'usdt_crypto') {
            // We no longer show "Invoice Created" screen - NowPayments opens automatically
            // Just show the payment button that creates invoice and opens payment page

            // Initial state - show create invoice button
            return (
                <div className="space-y-6">
                    {/* USDT Info Card */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">₮</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                            {isRTL ? 'ادفع بـ USDT' : 'Pay with USDT'}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                            {isRTL
                                ? 'دفع آمن وسريع عبر العملات الرقمية'
                                : 'Fast and secure payment via cryptocurrency'}
                        </p>
                        <div className="bg-white/10 backdrop-blur rounded-md p-4">
                            <p className="text-sm text-white/70">{isRTL ? 'المبلغ المطلوب' : 'Amount to Pay'}</p>
                            <p className="text-3xl font-bold">${totalPayment.toFixed(2)}</p>
                            <p className="text-xs text-white/60 mt-1">
                                {isRTL ? `اشتراك ${selectedPlan.nameAr} - ${cycle === 'monthly' ? 'شهري' : 'سنوي'}` : `${selectedPlan.name} Plan - ${cycle}`}
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                            <div className="text-green-500 text-lg mb-1">⚡</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {isRTL ? 'سريع' : 'Fast'}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                            <div className="text-green-500 text-lg mb-1">🔒</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {isRTL ? 'آمن' : 'Secure'}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 text-center">
                            <div className="text-green-500 text-lg mb-1">✓</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {isRTL ? 'تلقائي' : 'Auto'}
                            </p>
                        </div>
                    </div>

                    {/* Create Invoice Button */}
                    <button
                        onClick={createNowPaymentsInvoice}
                        disabled={isCreatingInvoice}
                        className={`w-full py-4 rounded-md font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 text-lg ${isCreatingInvoice
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isCreatingInvoice ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {isRTL ? 'جاري إنشاء الفاتورة...' : 'Creating Invoice...'}
                            </>
                        ) : (
                            <>
                                <span>₮</span>
                                {isRTL ? 'ادفع الآن بـ USDT' : 'Pay Now with USDT'}
                            </>
                        )}
                    </button>

                    {/* NowPayments Badge */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            {isRTL ? 'مدعوم بواسطة' : 'Powered by'}{' '}
                            <span className="font-semibold text-gray-600 dark:text-gray-300">NowPayments</span>
                        </p>
                    </div>
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

        // Visa/MasterCard (Paddle Integrated - Inline)
        if (selectedMethod === 'visa_mastercard') {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative min-h-[600px] w-full bg-white dark:bg-[#0c1427] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Loading State - Overlay until Paddle loads */}
                        {!paddle && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-[#0c1427]">
                                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-medium animate-pulse">{isRTL ? 'جاري تحميل بوابة الدفع الآمنة...' : 'Loading Secure Payment Gateway...'}</p>
                            </div>
                        )}
                        {/* Paddle Frame Container */}
                        <div id="paddle-container" className="paddle-container w-full h-full min-h-[600px]" />
                    </div>



                    {/* COMPLIANCE FOOTER - "Giant Site" Standard */}
                    <div className="flex flex-col items-center justify-center gap-3 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Lock className="w-3 h-3" />
                            <span>{isRTL ? 'معالجة آمنة ومشفرة 100%' : '256-bit SSL Secure Payment'}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 max-w-md leading-relaxed">
                            {isRTL
                                ? 'يتم معالجة المدفوعات بواسطة Paddle، شريكنا المعتمد للمعاملات المالية. تظهر المعاملة باسم PADDLE.NET* FURRIYADH على كشف حسابك.'
                                : 'Payments are processed by Paddle, our authorized Merchant of Record. Charges will appear as PADDLE.NET* FURRIYADH on your statement.'}
                        </p>
                        <div className="flex gap-3 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                            <Image src="/images/payment-method/visa-mastercard-v3.png" alt="Card Networks" width={100} height={20} className="h-5 w-auto object-contain" />
                        </div>
                    </div>
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
            <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4 mb-6">
                <p className="text-green-700 dark:text-green-400 text-sm">
                    {isRTL
                        ? 'تم إرسال تفاصيل الاشتراك إلى بريدك الإلكتروني'
                        : 'Subscription details have been sent to your email'
                    }
                </p>
            </div>
            <button
                onClick={() => router.push('/dashboard/dashboard/google-ads/billing')}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-bold text-lg transition-colors"
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
                        <h5 className="!mb-0">
                            {isRTL ? 'إتمام الاشتراك' : 'Complete Subscription'}
                        </h5>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isRTL ? 'آمن ومشفر 100%' : 'Secure and encrypted'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-md p-[20px] md:p-[25px]">
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

                                    <h5 className="!mb-[15px]">
                                        {paymentStep === 'select'
                                            ? (isRTL ? 'اختر طريقة الدفع' : 'Choose Payment Method')
                                            : (isRTL ? 'أكمل الدفع' : 'Complete Payment')
                                        }
                                    </h5>

                                    {paymentStep === 'select' ? renderPaymentMethods() : renderPaymentDetails()}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-md p-[20px] md:p-[25px] sticky top-6">
                            <h5 className="!mb-[15px]">
                                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                            </h5>

                            {/* Plan Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md mb-4">
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
