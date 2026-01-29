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

// Payment methods
const PAYMENT_METHODS = [
    {
        id: 'visa_mastercard' as PaymentMethod,
        name: 'Visa / MasterCard',
        nameAr: 'فيزا / ماستركارد',
        iconPath: '/images/payment-method/visa-mastercard-v3.png',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: 'Stripe', // Changed from +3.55%
        calculateFee: (amount: number) => 0, // Stripe fees are usually absorbed or calculated differently, set to 0 to match displayed totals usually
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

// Stripe Price IDs (Generated from Test Mode)
const STRIPE_PRICE_IDS = {
    MONTHLY: {
        BASIC: 'price_1StG5yBfC7cwGcgcWjNtlVlu',
        PRO: 'price_1StG5zBfC7cwGcgcjPvoTnRP',
        AGENCY: 'price_1StG61BfC7cwGcgckhcTyKs0'
    },
    YEARLY: {
        BASIC: 'price_1StG5zBfC7cwGcgcMbImhatg',
        PRO: 'price_1StG60BfC7cwGcgcdCNSpDwV',
        AGENCY: 'price_1StG61BfC7cwGcgcn0pX52Yo'
    }
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get URL params
    const planId = searchParams.get('plan') || 'pro';
    const cycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';
    const amountParam = searchParams.get('amount'); // For Managed Payment (20% commission)

    // State
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [isRTL, setIsRTL] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'success'>('select');
    const [isProcessing, setIsProcessing] = useState(false);

    // Get selected plan or custom amount
    const selectedPlan = PLANS[planId as keyof typeof PLANS] || PLANS.pro;

    // Determine Price
    let planPrice = 0;
    let isManagedPayment = false;

    if (amountParam && !isNaN(parseFloat(amountParam))) {
        // Managed Account Logic (One-time payment)
        planPrice = parseFloat(amountParam);
        isManagedPayment = true;
    } else {
        // Subscription Logic
        planPrice = cycle === 'monthly' ? selectedPlan.price : selectedPlan.yearlyPrice;
    }

    const currentPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    const processingFee = currentPaymentMethod?.calculateFee(planPrice) || 0;
    const totalPayment = planPrice + processingFee;

    // Load user
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
        if (savedLanguage) {
            setLanguage(savedLanguage);
            setIsRTL(savedLanguage === 'ar');
        }

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    // 🟢 Handle Stripe Checkout (Redirect)
    const handleStripeCheckout = async () => {
        setIsProcessing(true);
        try {
            // Determine Price ID or Amount
            let body: any = {
                email: userEmail,
                userId: userId,
                mode: isManagedPayment ? 'payment' : 'subscription',
                successUrl: `${window.location.origin}/dashboard/google-ads/billing?payment=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/dashboard/google-ads/billing/checkout?plan=${planId}&payment=cancelled`
            };

            if (isManagedPayment) {
                body.amount = totalPayment;
                body.planName = 'Managed Account Commission'; // Descriptive name
            } else {
                // Subscription
                // Map plan ID to Stripe Price ID
                let planKey = planId.toUpperCase(); // BASIC, PRO, AGENCY
                // Fallback for demo if IDs aren't set
                // Ideally we should fail if ID is missing, but for now we might send 'price_fake' to test endpoint handling

                // Get correctly mapped ID
                const priceMap = cycle === 'yearly' ? STRIPE_PRICE_IDS.YEARLY : STRIPE_PRICE_IDS.MONTHLY;
                const stripePriceId = priceMap[planKey as keyof typeof priceMap];

                body.priceId = stripePriceId || 'price_test_default'; // Fallback
                body.priceId = stripePriceId || 'price_test_default'; // Fallback
                body.planName = selectedPlan.name;
                body.planId = planId; // ✅ Send explicit plan ID (e.g. 'pro') for DB update
                body.billingCycle = cycle; // ✅ Send billing cycle (monthly/yearly)
            }

            const response = await fetch(`${getBackendUrl()}/api/stripe/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create Stripe Session');
            }

        } catch (error: any) {
            console.error('Stripe Checkout Error:', error);
            alert(isRTL ? 'حدث خطأ أثناء الانتقال للدفع' : 'Error redirecting to payment');
        } finally {
            setIsProcessing(false);
        }
    };

    // NowPayments (USDT) Logic
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const createNowPaymentsInvoice = async () => {
        if (!userEmail || planPrice <= 0) return;
        setIsCreatingInvoice(true);
        try {
            const response = await fetch('/api/payments/nowpayments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalPayment,
                    order_id: `SUB-${planId.toUpperCase()}-${Date.now()}`,
                    description: `${selectedPlan.name} Plan`,
                    success_url: `${window.location.origin}/dashboard/google-ads/billing?payment=success`,
                    cancel_url: `${window.location.origin}/dashboard/google-ads/billing/checkout?payment=cancelled`,
                })
            });
            const data = await response.json();
            if (data.success && data.invoice) {
                window.open(data.invoice.invoice_url, '_blank');
            } else {
                alert('Failed to create invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating invoice');
        } finally {
            setIsCreatingInvoice(false);
        }
    };

    // Render Methods
    const renderPaymentMethods = () => (
        <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                        <Image
                            src={method.iconPath}
                            alt={method.name}
                            width={48}
                            height={48}
                            className="w-8 h-8 object-contain"
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
                        </div>
                    </div>
                    <Check className={`w-5 h-5 ${selectedMethod === method.id ? 'text-primary-500' : 'text-transparent'}`} />
                </button>
            ))}
        </div>
    );

    const renderPaymentDetails = () => {
        if (!selectedMethod) return null;

        // Stripe (Visa/MasterCard)
        if (selectedMethod === 'visa_mastercard') {
            return (
                <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#0c1427] p-6 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {isRTL ? 'الدفع الآمن عبر Stripe' : 'Secure Payment via Stripe'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            {isRTL
                                ? 'سيتم توجيهك إلى صفحة دفع آمنة ومشفرة لإكمال عملية الدفع.'
                                : 'You will be redirected to a secure, encrypted payment page to complete your purchase.'}
                        </p>

                        <button
                            onClick={handleStripeCheckout}
                            disabled={isProcessing}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isRTL ? 'جاري التوجيه...' : 'Redirecting...'}
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    {isRTL ? `ادفع $${totalPayment.toFixed(2)} الآن` : `Pay $${totalPayment.toFixed(2)} Now`}
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
                            <Image src="/images/payment-method/visa-mastercard-v3.png" alt="Cards" width={120} height={24} className="h-6 w-auto grayscale" />
                        </div>
                    </div>
                </div>
            );
        }

        // USDT
        if (selectedMethod === 'usdt_crypto') {
            return (
                <div className="space-y-4">
                    <button
                        onClick={createNowPaymentsInvoice}
                        disabled={isCreatingInvoice}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {isCreatingInvoice ? 'Creating Invoice...' : `Pay $${totalPayment.toFixed(2)} with USDT`}
                    </button>
                </div>
            )
        }

        // PayPal
        if (selectedMethod === 'paypal') {
            return (
                <div className="space-y-4">
                    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                        <PayPalButtons
                            style={{ layout: 'vertical', height: 48 }}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    intent: 'CAPTURE',
                                    purchase_units: [{ amount: { currency_code: 'USD', value: totalPayment.toFixed(2) } }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                // Handle success...
                                // Ideally call backend to verify/record
                                window.location.href = `/dashboard/google-ads/billing?payment=success`;
                            }}
                        />
                    </PayPalScriptProvider>
                </div>
            )
        }

        return null;
    };

    return (
        <div className="min-h-screen p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => paymentStep === 'details' ? setPaymentStep('select') : router.back()}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {paymentStep === 'select'
                                ? (isRTL ? 'اختر طريقة الدفع' : 'Select Payment Method')
                                : (isRTL ? 'إكمال الدفع' : 'Complete Payment')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {isRTL ? 'معاملات آمنة ومشفرة' : 'Secure and encrypted transactions'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2">
                        {paymentStep === 'select' ? renderPaymentMethods() : renderPaymentDetails()}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-[#0c1427] rounded-lg p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                            </h3>

                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div className={`p-2 rounded-lg bg-${selectedPlan.color}-50 dark:bg-${selectedPlan.color}-900/20`}>
                                    <selectedPlan.icon className={`w-6 h-6 text-${selectedPlan.color}-500`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{isManagedPayment ? 'Managed Commission' : selectedPlan.name}</p>
                                    <p className="text-xs text-gray-500">{isManagedPayment ? 'One-time Payment' : (cycle === 'monthly' ? 'Monthly' : 'Yearly')}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{isRTL ? 'المبلغ' : 'Subtotal'}</span>
                                    <span className="text-gray-900 dark:text-white">${planPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{isRTL ? 'الرسوم' : 'Fees'}</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {processingFee === 0 ? (isRTL ? 'مجاني' : 'Free') : `$${processingFee.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
                                    <span className="text-gray-900 dark:text-white">{isRTL ? 'الإجمالي' : 'Total'}</span>
                                    <span className="text-primary-600">${totalPayment.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-xs text-gray-500 flex items-start gap-2">
                                <Shield className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <p>
                                    {isRTL
                                        ? 'بيانات الدفع مشفرة ومحمية. نحن لا نقوم بتخزين تفاصيل بطاقتك.'
                                        : 'Payment data is encrypted and secure. We do not store your card details.'}
                                </p>
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
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
