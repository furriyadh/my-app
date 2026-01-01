'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    Wallet,
    CreditCard,
    Copy,
    Check,
    AlertCircle,
    ChevronDown,
    ExternalLink,
    QrCode,
    RefreshCcw,
    Plus,
    X,
    CheckCircle2,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Shield,
    Sparkles,
    Zap,
    ArrowRight
} from 'lucide-react';

// Payment method types
type PaymentMethod = 'visa_mastercard' | 'binance_pay' | 'usdt_crypto' | 'redotpay' | 'paypal';
type CryptoNetwork = 'TRC20' | 'BEP20';

interface PaymentGatewayProps {
    userEmail: string;
    isRTL?: boolean;
    currentBalance?: number;
    onPaymentSuccess?: (amount: number, method: string) => void;
}

// Payment methods configuration with processing fees
const PAYMENT_METHODS = [
    {
        id: 'visa_mastercard' as PaymentMethod,
        name: 'Visa / MasterCard',
        nameAr: 'فيزا / ماستركارد',
        iconBg: 'bg-white',
        iconSvg: (
            <Image
                src="/images/payment-method/visa-mastercard-v3.png"
                alt="Visa Mastercard"
                width={56}
                height={56}
                className="w-full h-full object-contain"
            />
        ),
        description: 'Pay with credit or debit card',
        descriptionAr: 'الدفع ببطاقة الائتمان أو الخصم',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+2.94%',
        feeDisplayAr: '+2.94%',
        // Fee calculation: 2.94% + $0.30 per transaction
        calculateFee: (amount: number) => (amount * 0.0294) + 0.30,
        feeDescription: '2.94% + $0.30',
        popular: false
    },
    {
        id: 'binance_pay' as PaymentMethod,
        name: 'Binance Pay',
        nameAr: 'باينانس باي',
        iconBg: 'bg-transparent', // Image carries its own background
        iconSvg: (
            <Image
                src="/images/payment-method/binance-v2.png"
                alt="Binance"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-lg" // Added rounded-lg to match icon shape
            />
        ),
        description: 'Pay with Binance wallet',
        descriptionAr: 'الدفع من محفظة باينانس',
        processingTime: '1-5 min',
        processingTimeAr: '1-5 دقائق',
        feeDisplay: '+$1',
        feeDisplayAr: '+$1',
        // Flat $1 fee
        calculateFee: (amount: number) => 1,
        feeDescription: '$1 flat',
        popular: true
    },
    {
        id: 'usdt_crypto' as PaymentMethod,
        name: 'USDT',
        nameAr: 'تحويل USDT',
        iconBg: 'bg-transparent', // Image carries its own background
        iconSvg: (
            <Image
                src="/images/payment-method/usdt-v2.png"
                alt="USDT"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-full" // Added rounded-full to match icon shape
            />
        ),
        description: 'Send USDT via blockchain',
        descriptionAr: 'إرسال USDT عبر البلوكشين',
        processingTime: '3-10 min',
        processingTimeAr: '3-10 دقائق',
        feeDisplay: '+$1',
        feeDisplayAr: '+$1',
        // Flat $1 fee
        calculateFee: (amount: number) => 1,
        feeDescription: '$1 flat',
        popular: true
    },
    {
        id: 'redotpay' as PaymentMethod,
        name: 'RedotPay',
        nameAr: 'ريدوت باي',
        iconBg: 'bg-transparent', // Image carries its own background
        iconSvg: (
            <Image
                src="/images/payment-method/redotpay.png"
                alt="RedotPay"
                width={32}
                height={32}
                className="w-full h-full object-cover"
            />
        ),
        description: 'RedotPay card payment',
        descriptionAr: 'دفع عبر بطاقة ريدوت باي',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+$1',
        feeDisplayAr: '+$1',
        // Flat $1 fee
        calculateFee: (amount: number) => 1,
        feeDescription: '$1 flat',
        popular: false
    },
    {
        id: 'paypal' as PaymentMethod,
        name: 'PayPal',
        nameAr: 'باي بال',
        iconBg: 'bg-[#003087]',
        iconSvg: (
            <Image
                src="/images/payment-method/paypal.svg"
                alt="PayPal"
                width={32}
                height={32}
                className="w-full h-full object-contain p-1.5"
            />
        ),
        description: 'Pay safely with PayPal',
        descriptionAr: 'دفع آمن عبر باي بال',
        processingTime: 'Instant',
        processingTimeAr: 'فوري',
        feeDisplay: '+3.4%',
        feeDisplayAr: '+3.4%',
        // Fee calculation: 3.4% + $0.30 (Standard PayPal rates roughly)
        calculateFee: (amount: number) => (amount * 0.034) + 0.30,
        feeDescription: '3.4% + $0.30',
        popular: false
    }
];

// Crypto networks (TRC20 & BEP20 only - removed ERC20)
// Wallet addresses loaded from environment variables
const CRYPTO_NETWORKS = [
    {
        id: 'TRC20' as CryptoNetwork,
        name: 'Tron (TRC20)',
        chain: 'TRON Network',
        chainColor: 'text-red-500',
        confirmations: 20,
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
        confirmations: 15,
        estimatedTime: '~5 min',
        walletAddress: process.env.NEXT_PUBLIC_USDT_BEP20_ADDRESS || 'BEP20_ADDRESS_NOT_CONFIGURED',
        fee: '~0.3 USDT',
        recommended: false
    }
];

// Furriyadh Payment Details - Loaded from Environment Variables
const FURRIYADH_PAYMENT_INFO = {
    binance_pay_id: process.env.NEXT_PUBLIC_BINANCE_PAY_ID || 'BINANCE_PAY_ID_NOT_CONFIGURED',
    redotpay_uid: process.env.NEXT_PUBLIC_REDOTPAY_UID || 'REDOTPAY_UID_NOT_CONFIGURED',
    commission_rate: parseFloat(process.env.NEXT_PUBLIC_FURRIYADH_COMMISSION_RATE || '0.20')
};

export const FurriyadhPaymentGateway: React.FC<PaymentGatewayProps> = ({
    userEmail,
    isRTL = false,
    currentBalance = 0,
    onPaymentSuccess
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [previewMethod, setPreviewMethod] = useState<PaymentMethod | null>(null); // For summary preview
    const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('TRC20');
    const [campaignBudget, setCampaignBudget] = useState<number>(100); // What user wants for campaign
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'confirm'>('select');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [shakeWarning, setShakeWarning] = useState(false);

    // Quick amounts
    const quickAmounts = [50, 100, 250, 500, 1000, 2500];

    // Copy to clipboard with animation
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(null), 2500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Calculate amounts - NEW MODEL: Commission is ADDED to campaign budget
    // Campaign Budget = What the user wants for their ads
    // Commission = 20% of campaign budget (goes to Furriyadh)
    // Processing Fee = Depends on selected payment method
    // Total Payment = Campaign Budget + Commission + Processing Fee (what user pays)
    const commission = campaignBudget * FURRIYADH_PAYMENT_INFO.commission_rate;
    const subtotal = campaignBudget + commission;

    // Get processing fee based on preview/selected method
    const activeMethod = previewMethod || selectedMethod;
    const currentPaymentMethod = PAYMENT_METHODS.find(m => m.id === activeMethod);
    const processingFee = currentPaymentMethod?.calculateFee(subtotal) || 0;
    const totalPayment = subtotal + processingFee;

    // Handle payment submission
    const handleSubmitPayment = async () => {
        setIsProcessing(true);
        try {
            if (selectedMethod === 'visa_mastercard') {
                alert(isRTL ? 'سيتم تفعيل الدفع بالبطاقة قريباً' : 'Card payment coming soon');
            } else {
                const response = await fetch('/api/furriyadh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'deposit',
                        email: userEmail,
                        amount: campaignBudget,
                        payment_method: selectedMethod,
                        payment_reference: `PENDING_${Date.now()}`,
                        status: 'pending_confirmation'
                    })
                });

                const data = await response.json();
                if (data.success) {
                    onPaymentSuccess?.(campaignBudget, selectedMethod || '');
                    setShowPaymentModal(false);
                    setPaymentStep('select');
                }
            }
        } catch (err) {
            console.error('Payment error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Close modal handler
    const closeModal = () => {
        setShowPaymentModal(false);
        setPaymentStep('select');
        setSelectedMethod(null);
    };

    // Render crypto payment instructions
    const renderCryptoInstructions = () => {
        const network = CRYPTO_NETWORKS.find(n => n.id === selectedNetwork);
        if (!network) return null;

        return (
            <div className="space-y-6">
                {/* Network Selector - Premium Design */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {isRTL ? 'اختر الشبكة' : 'Select Network'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {CRYPTO_NETWORKS.map((net) => (
                            <button
                                key={net.id}
                                onClick={() => setSelectedNetwork(net.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${selectedNetwork === net.id
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                                    }`}
                            >
                                {net.recommended && (
                                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                                        {isRTL ? 'مُوصى' : 'BEST'}
                                    </span>
                                )}
                                <div className="text-center">
                                    <p className={`text-lg font-bold ${selectedNetwork === net.id ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                        {net.id}
                                    </p>
                                    <p className={`text-xs mt-1 ${net.chainColor}`}>{net.chain}</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{net.estimatedTime}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{isRTL ? 'الرسوم:' : 'Fee:'} {net.fee}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Wallet Address Card */}
                <div className="bg-gray-900 dark:bg-[#0c1427] border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${network.id === 'TRC20' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-sm font-medium text-gray-300">
                                {network.chain}
                            </span>
                        </div>
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                            USDT {network.id}
                        </span>
                    </div>

                    <div className="bg-black/40 backdrop-blur rounded-xl p-4 mb-3">
                        <code className="text-sm font-mono text-green-400 break-all leading-relaxed">
                            {network.walletAddress}
                        </code>
                    </div>

                    <button
                        onClick={() => copyToClipboard(network.walletAddress, 'wallet')}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${copiedText === 'wallet'
                            ? 'bg-green-500 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                            }`}
                    >
                        {copiedText === 'wallet' ? (
                            <>
                                <Check className="w-5 h-5" />
                                {isRTL ? 'تم النسخ!' : 'Copied!'}
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                {isRTL ? 'نسخ العنوان' : 'Copy Address'}
                            </>
                        )}
                    </button>
                </div>

                {/* Warning Box */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-amber-600 dark:text-amber-400 mb-2">
                                {isRTL ? '⚠️ مهم جداً!' : '⚠️ Important!'}
                            </p>
                            <ul className="text-amber-700 dark:text-amber-300 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                    {isRTL ? `أرسل فقط USDT عبر شبكة ${network.id}` : `Only send USDT via ${network.id} network`}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                    {isRTL ? `أرسل بالضبط: $${totalPayment.toFixed(2)}` : `Send exactly: $${totalPayment.toFixed(2)}`}
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                    {isRTL ? 'إرسال عملات أخرى سيؤدي لخسارتها' : 'Sending other tokens will result in loss'}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render Binance Pay instructions
    const renderBinancePayInstructions = () => (
        <div className="space-y-6">
            {/* Binance Pay ID Card */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500 rounded-xl p-6 text-center shadow-xl">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L6.5 7.5L8.4 9.4L12 5.8L15.6 9.4L17.5 7.5L12 2Z" />
                        <path d="M2 12L3.9 10.1L5.8 12L3.9 13.9L2 12Z" />
                        <path d="M6.5 16.5L12 22L17.5 16.5L15.6 14.6L12 18.2L8.4 14.6L6.5 16.5Z" />
                        <path d="M18.2 12L20.1 10.1L22 12L20.1 13.9L18.2 12Z" />
                        <path d="M12 9.2L9.2 12L12 14.8L14.8 12L12 9.2Z" />
                    </svg>
                </div>

                <h5 className="!mb-0 text-lg font-bold text-white">Binance Pay ID</h5>
                <p className="text-white/80 text-sm mb-4">{isRTL ? 'انسخ الـ ID وأرسل المبلغ' : 'Copy ID and send amount'}</p>

                <div className="bg-black/20 backdrop-blur rounded-xl p-4 mb-4">
                    <code className="text-2xl font-mono font-bold text-white tracking-wider">
                        {FURRIYADH_PAYMENT_INFO.binance_pay_id}
                    </code>
                </div>

                <button
                    onClick={() => copyToClipboard(FURRIYADH_PAYMENT_INFO.binance_pay_id, 'binance')}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${copiedText === 'binance'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-yellow-600 hover:bg-gray-100'
                        }`}
                >
                    {copiedText === 'binance' ? (
                        <>
                            <Check className="w-5 h-5" />
                            {isRTL ? 'تم النسخ!' : 'Copied!'}
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            {isRTL ? 'نسخ Pay ID' : 'Copy Pay ID'}
                        </>
                    )}
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h6 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {isRTL ? 'خطوات الدفع السريع' : 'Quick Payment Steps'}
                </h6>
                <div className="space-y-3">
                    {[
                        { en: 'Open Binance App', ar: 'افتح تطبيق Binance' },
                        { en: 'Tap Pay → Send', ar: 'اضغط Pay → Send' },
                        { en: 'Paste Pay ID above', ar: 'الصق Pay ID أعلاه' },
                        { en: `Enter $${totalPayment.toFixed(2)}`, ar: `أدخل $${totalPayment.toFixed(2)}` },
                        { en: 'Confirm & Done!', ar: 'أكد وخلاص!' },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                            <span className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                                {i + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {isRTL ? step.ar : step.en}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render RedotPay instructions
    const renderRedotPayInstructions = () => (
        <div className="space-y-6">
            {/* RedotPay UID Card */}
            <div className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-xl p-6 text-center shadow-xl">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                </div>

                <h5 className="!mb-0 text-lg font-bold text-white">RedotPay UID</h5>
                <p className="text-white/80 text-sm mb-4">{isRTL ? 'انسخ UID وأرسل المبلغ' : 'Copy UID and transfer'}</p>

                <div className="bg-black/20 backdrop-blur rounded-xl p-4 mb-4">
                    <code className="text-xl font-mono font-bold text-white tracking-wider">
                        {FURRIYADH_PAYMENT_INFO.redotpay_uid}
                    </code>
                </div>

                <button
                    onClick={() => copyToClipboard(FURRIYADH_PAYMENT_INFO.redotpay_uid, 'redotpay')}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${copiedText === 'redotpay'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-red-600 hover:bg-gray-100'
                        }`}
                >
                    {copiedText === 'redotpay' ? (
                        <>
                            <Check className="w-5 h-5" />
                            {isRTL ? 'تم النسخ!' : 'Copied!'}
                        </>
                    ) : (
                        <>
                            <Copy className="w-5 h-5" />
                            {isRTL ? 'نسخ UID' : 'Copy UID'}
                        </>
                    )}
                </button>
            </div>

            {/* Help Link */}
            <a
                href="https://helpcenter.redotpay.com/en/articles/10521793-where-can-i-find-my-redotpay-uid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
            >
                <ExternalLink className="w-4 h-4" />
                {isRTL ? 'كيف تجد RedotPay UID الخاص بك؟' : 'How to find your RedotPay UID?'}
            </a>

            {/* Steps */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <h6 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {isRTL ? 'خطوات التحويل' : 'Transfer Steps'}
                </h6>
                <div className="space-y-3">
                    {[
                        { en: 'Open RedotPay App', ar: 'افتح تطبيق RedotPay' },
                        { en: 'Tap Transfer', ar: 'اضغط Transfer' },
                        { en: 'Enter UID above', ar: 'أدخل UID أعلاه' },
                        { en: `Enter $${totalPayment.toFixed(2)}`, ar: `أدخل $${totalPayment.toFixed(2)}` },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                {i + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {isRTL ? step.ar : step.en}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render card payment form
    const renderCardPaymentForm = () => (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'الاسم على البطاقة' : 'Cardholder Name'}
                </label>
                <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={isRTL ? 'الاسم كما يظهر على البطاقة' : 'Name as shown on card'}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? 'رقم البطاقة' : 'Card Number'}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setCardDetails(prev => ({ ...prev, number: formatted }));
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                        <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-red-600 rounded-full -ml-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry'}
                    </label>
                    <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2);
                            }
                            setCardDetails(prev => ({ ...prev, expiry: value }));
                        }}
                        placeholder="MM/YY"
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                    </label>
                    <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardDetails(prev => ({ ...prev, cvv: value }));
                        }}
                        placeholder="123"
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <Shield className="w-5 h-5 text-green-500" />
                <span>{isRTL ? 'دفع آمن ومشفر بتقنية SSL 256-bit' : 'Secure payment with 256-bit SSL encryption'}</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Premium Furriyadh Payment Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                {/* Header */}
                <div className="p-5 border-b border-purple-400/20 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h4 className="text-lg font-bold text-white dark:text-white uppercase tracking-wider flex items-center gap-2" style={{ color: 'white' }}>
                        {isRTL ? 'إضافة رصيد' : 'ADD FUNDS'}
                    </h4>
                    {/* Tabs */}
                    <div className="flex gap-3 mt-4">
                        <button className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg transition-transform active:scale-95 border border-white/30">
                            {isRTL ? 'طرق الدفع' : 'Payment methods'}
                        </button>
                        <button className="px-5 py-2 bg-white/10 text-white/70 rounded-full text-sm font-semibold hover:bg-white/20 hover:text-white transition-colors">
                            {isRTL ? 'سجل الرصيد' : 'Balance history'}
                        </button>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                    {/* Left: Payment Methods */}
                    <div className="space-y-6">
                        {/* Credit/Debit Cards Section */}
                        <div className="animate-fade-in-up">
                            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
                                {isRTL ? 'البطاقات والمحافظ' : 'Cards & Wallets'}
                            </h5>
                            <div className="flex flex-wrap gap-3">
                                {PAYMENT_METHODS.filter(m => ['visa_mastercard', 'paypal', 'redotpay'].includes(m.id)).map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedMethod(method.id);
                                            setPreviewMethod(method.id);
                                        }}
                                        className={`group flex flex-row items-center gap-3 p-3 bg-white dark:bg-[#15203c] border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedMethod === method.id
                                            ? 'border-purple-500 shadow-purple-500/20 ring-1 ring-purple-500/20'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-lg ${method.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden`}>
                                            {method.iconSvg}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors whitespace-nowrap">
                                                {isRTL ? method.nameAr : method.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{method.feeDisplay}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Crypto Section */}
                        <div className="animate-fade-in-up md:delay-100">
                            <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
                                {isRTL ? 'العملات الرقمية' : 'Cryptocurrencies'}
                            </h5>
                            <div className="flex flex-wrap gap-3">
                                {PAYMENT_METHODS.filter(m => ['usdt_crypto', 'binance_pay'].includes(m.id)).map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedMethod(method.id);
                                            setPreviewMethod(method.id);
                                        }}
                                        className={`group flex flex-row items-center gap-3 p-3 bg-white dark:bg-[#15203c] border rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedMethod === method.id
                                            ? 'border-purple-500 shadow-purple-500/20 ring-1 ring-purple-500/20'
                                            : 'border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-lg ${method.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden`}>
                                            {method.iconSvg}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors whitespace-nowrap">
                                                {isRTL ? method.nameAr : method.name}
                                            </p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium">
                                                {method.feeDisplay}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Amount Input */}
                    <div className="bg-gray-50 dark:bg-[#15203c] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-fit">
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-5 uppercase tracking-wide flex items-center justify-between">
                            {isRTL ? 'المبلغ المراد إضافته ($):' : 'Amount to add, $:'}
                            <span className="text-xs font-normal normal-case bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded">
                                {isRTL ? 'الحد الأدنى $10' : 'Min $10'}
                            </span>
                        </h5>

                        {/* Selected Payment Method Display */}
                        {selectedMethod && (() => {
                            const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
                            if (!method) return null;
                            return (
                                <div className="flex items-center gap-3 p-3 mb-5 bg-white dark:bg-[#0c1427] border border-purple-200 dark:border-purple-800 rounded-xl">
                                    <div className={`w-10 h-10 rounded-lg ${method.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden`}>
                                        {method.iconSvg}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {isRTL ? method.nameAr : method.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{method.feeDisplay}</p>
                                    </div>
                                    <Check className="w-5 h-5 text-purple-600" />
                                </div>
                            );
                        })()}
                        {!selectedMethod && (
                            <div
                                className={`p-3 mb-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center transition-all ${shakeWarning ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}`}
                                style={shakeWarning ? {
                                    animation: 'shake 0.5s ease-in-out'
                                } : {}}
                            >
                                <style>{`
                                    @keyframes shake {
                                        0%, 100% { transform: translateX(0); }
                                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                                    }
                                `}</style>
                                <p className={`text-xs ${shakeWarning ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-yellow-700 dark:text-yellow-400'}`}>
                                    {isRTL ? 'اختر طريقة الدفع من اليسار' : 'Select a payment method from the left'}
                                </p>
                            </div>
                        )}

                        {/* Amount Input Row */}
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1 group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold group-focus-within:text-purple-500 transition-colors">$</span>
                                <input
                                    type="number"
                                    min="10"
                                    value={campaignBudget}
                                    onChange={(e) => setCampaignBudget(Math.max(10, Number(e.target.value)))}
                                    className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0c1427] focus:border-purple-500 focus:ring-0 focus:outline-none transition-all placeholder-gray-300"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (selectedMethod) {
                                        setShowPaymentModal(true);
                                    } else {
                                        setShakeWarning(true);
                                        setTimeout(() => setShakeWarning(false), 600);
                                    }
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isRTL ? 'إضافة' : 'Add'}
                            </button>
                        </div>

                        {/* Quick Amounts */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setCampaignBudget(amount)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${campaignBudget === amount
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                        : 'bg-white dark:bg-[#0c1427] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400'
                                        }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="bg-white dark:bg-[#0c1427] rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{isRTL ? 'الميزانية' : 'Budget'}</span>
                                <span className="font-bold text-gray-900 dark:text-white">${campaignBudget.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {isRTL ? 'العمولة (20%)' : 'Commission (20%)'}
                                </span>
                                <span className="font-bold text-amber-600 dark:text-amber-500">${commission.toFixed(2)}</span>
                            </div>
                            {processingFee > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-purple-600 dark:text-purple-400">{isRTL ? 'رسوم البوابة' : 'Gateway Fee'}</span>
                                    <span className="font-bold text-purple-600 dark:text-purple-400">${processingFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-2">
                                <span className="font-bold text-gray-900 dark:text-white text-base">{isRTL ? 'الإجمالي' : 'Total'}</span>
                                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 text-xl">
                                    ${totalPayment.toFixed(2)}
                                </span>
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* Payment Modal - Centered in content area (accounting for sidebar) */}
            {showPaymentModal && selectedMethod && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                    onClick={closeModal}
                >
                    {/* Modal centered in the content area, not the full viewport */}
                    <div
                        className="absolute bg-white dark:bg-[#0c1427] rounded-2xl w-full max-w-2xl shadow-2xl transition-all duration-300 max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            top: '50%',
                            left: isRTL ? 'calc(50% - 125px)' : 'calc(50% + 125px)',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Modal Header */}
                        <div className={`relative p-6 bg-gradient-to-r ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.iconBg || 'from-purple-500 to-pink-500'}`}>
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.iconSvg}
                                </div>
                                <div>
                                    <h5 className="!mb-0 text-xl font-bold text-white">
                                        {isRTL
                                            ? PAYMENT_METHODS.find(m => m.id === selectedMethod)?.nameAr
                                            : PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
                                    </h5>
                                    <p className="text-white/80 text-sm">
                                        {isRTL
                                            ? PAYMENT_METHODS.find(m => m.id === selectedMethod)?.descriptionAr
                                            : PAYMENT_METHODS.find(m => m.id === selectedMethod)?.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Amount Summary Bar */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-500">{isRTL ? 'ميزانية الحملة' : 'Campaign Budget'}</span>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">${campaignBudget}</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-sm text-yellow-600">+20%</span>
                                    <p className="text-lg font-bold text-yellow-600">+${commission.toFixed(0)}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                                <div className="text-right">
                                    <span className="text-sm text-gray-500">{isRTL ? 'المطلوب دفعه' : 'Total to Pay'}</span>
                                    <p className="text-2xl font-bold text-green-600">${totalPayment.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                            {selectedMethod === 'usdt_crypto' && renderCryptoInstructions()}
                            {selectedMethod === 'binance_pay' && renderBinancePayInstructions()}
                            {selectedMethod === 'redotpay' && renderRedotPayInstructions()}
                            {selectedMethod === 'visa_mastercard' && renderCardPaymentForm()}
                            {selectedMethod === 'paypal' && (
                                <div className="text-center py-8">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-14 h-14 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .633-.544h6.033c2.834 0 4.835 1.89 4.4 4.72-.483 3.142-3.116 5.39-6.419 5.39H7.562l-1.277 8.051a.641.641 0 0 1-.633.544h-.576z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {isRTL ? 'الدفع عبر PayPal' : 'Pay with PayPal'}
                                    </h4>
                                    <p className="text-gray-500">
                                        {isRTL ? 'سيتم توجيهك إلى PayPal لإتمام الدفع' : 'You will be redirected to PayPal'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                            {selectedMethod === 'visa_mastercard' || selectedMethod === 'paypal' ? (
                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={isProcessing}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-purple-500/30"
                                >
                                    {isProcessing ? (
                                        <RefreshCcw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-6 h-6" />
                                            {isRTL ? `ادفع $${totalPayment.toFixed(2)}` : `Pay $${totalPayment.toFixed(2)}`}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleSubmitPayment}
                                        disabled={isProcessing}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/30"
                                    >
                                        {isProcessing ? (
                                            <RefreshCcw className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-6 h-6" />
                                                {isRTL ? '✅ لقد أرسلت المبلغ' : "✅ I've sent the payment"}
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-sm text-gray-500">
                                        {isRTL
                                            ? '⏱️ سيتم تأكيد الرصيد خلال 5-30 دقيقة'
                                            : '⏱️ Balance confirmed within 5-30 minutes'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default FurriyadhPaymentGateway;
