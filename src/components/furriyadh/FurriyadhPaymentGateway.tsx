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
    ChevronLeft,
    ChevronRight,
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
    ArrowRight,
    ArrowDownLeft,
    Download,
    Filter,
    ArrowLeft,
    Briefcase,
    Lock
} from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

// Payment method types
type PaymentMethod = 'visa_mastercard' | 'usdt_crypto' | 'paypal';
type CryptoNetwork = 'TRC20' | 'BEP20';

interface PaymentGatewayProps {
    userEmail: string;
    isRTL?: boolean;
    currentBalance?: number;
    onPaymentSuccess?: (amount: number, method: string) => void;
}


const FURRIYADH_PAYMENT_INFO = {
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
    const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');

    // 🌍 Country & Fee Auto-Detection
    const [isInternational, setIsInternational] = useState(false);
    const [countryCode, setCountryCode] = useState<string>('US');

    useEffect(() => {
        // Detect user country to apply correct Stripe fees
        const detectCountry = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.country_code) {
                    setCountryCode(data.country_code);
                    // Determine if international (Non-US)
                    // Stripe US accounts treat non-US cards as international
                    setIsInternational(data.country_code !== 'US');
                    console.log(`🌍 User Location detected: ${data.country_code} (International Fees: ${data.country_code !== 'US'})`);
                }
            } catch (error) {
                console.error('Failed to detect country:', error);
            }
        };
        detectCountry();
    }, []);

    // Payment methods configuration with DYNAMIC processing fees
    const PAYMENT_METHODS = React.useMemo(() => [
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
            description: isInternational ? 'International Card Processing' : 'Pay with credit or debit card',
            descriptionAr: isInternational ? 'معالجة بطاقات دولية' : 'الدفع ببطاقة الائتمان أو الخصم',
            processingTime: 'Instant',
            processingTimeAr: 'فوري',

            // Dynamic Fee Display
            feeDisplay: isInternational ? '+4.4%' : '+2.9%',
            feeDisplayAr: isInternational ? '+4.4%' : '+2.9%',

            // Fee calculation: Exact Reverse Calculation depending on location
            // US: 2.9% + $0.30
            // International: 4.4% + $0.30 (approx 1.5% surcharge)
            calculateFee: (amount: number) => {
                const rate = isInternational ? 0.044 : 0.029;
                const total = (amount + 0.30) / (1 - rate);
                return total - amount;
            },
            feeDescription: isInternational ? '4.4% + $0.30 (Intl)' : '2.9% + $0.30',
            popular: false
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
    ], [isInternational]);

    // NowPayments state
    const [nowPaymentsInvoice, setNowPaymentsInvoice] = useState<{
        id: string;
        invoice_url: string;
        order_id: string;
        amount: number;
    } | null>(null);
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'confirming' | 'completed' | 'failed'>('idle');

    // Balance History state
    interface Transaction {
        id: string;
        type: 'deposit' | 'campaign' | 'refund';
        method?: string;
        description?: string;
        amount: number;
        date: string;
        status: string;
    }
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

    // Pagination & Filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'campaign'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const ITEMS_PER_PAGE = 10;

    // Real-time balance polling
    const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date>(new Date());
    const BALANCE_POLL_INTERVAL = 30000; // 30 seconds

    // Low Balance Alert state
    const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);
    const [lowBalanceAlertSent, setLowBalanceAlertSent] = useState(false);
    const LOW_BALANCE_THRESHOLD = 10; // $10

    // Check for low balance on mount and when balance changes
    useEffect(() => {
        if (currentBalance !== undefined && currentBalance < LOW_BALANCE_THRESHOLD) {
            setShowLowBalanceAlert(true);

            // Send email alert once per session
            if (!lowBalanceAlertSent && userEmail) {
                setLowBalanceAlertSent(true);
                fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: userEmail,
                        type: 'low_balance_alert',
                        data: {
                            currentBalance: currentBalance.toFixed(2),
                            threshold: LOW_BALANCE_THRESHOLD,
                            activeCampaigns: 0, // TODO: Get actual count
                            addFundsUrl: `${window.location.origin}/dashboard/google-ads/billing`
                        }
                    })
                }).catch(err => console.error('Low balance email error:', err));
            }
        } else {
            setShowLowBalanceAlert(false);
        }
    }, [currentBalance, userEmail, lowBalanceAlertSent]);

    // Fetch transactions when history tab is active or filters change
    useEffect(() => {
        if (activeTab === 'history' && userEmail) {
            fetchTransactions();
        }
    }, [activeTab, userEmail, currentPage, typeFilter, dateFilter]);

    // Real-time balance polling
    useEffect(() => {
        if (!userEmail) return;

        const pollBalance = async () => {
            try {
                const response = await fetch(`/api/furriyadh?email=${encodeURIComponent(userEmail)}&action=balance`);
                if (!response.ok) return; // Silently skip if backend unavailable
                const data = await response.json();
                if (data.success && data.balance !== undefined) {
                    setLastBalanceUpdate(new Date());
                    // If balance changed significantly, refresh transactions
                    if (activeTab === 'history') {
                        fetchTransactions();
                    }
                }
            } catch {
                // Silently ignore - backend may be unavailable
            }
        };

        const intervalId = setInterval(pollBalance, BALANCE_POLL_INTERVAL);

        return () => clearInterval(intervalId);
    }, [userEmail, activeTab]);

    const fetchTransactions = async () => {
        if (!userEmail) return;
        setIsLoadingTransactions(true);
        try {
            // Build query params
            const params = new URLSearchParams({
                email: userEmail,
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString()
            });

            if (typeFilter !== 'all') params.append('type', typeFilter);

            // Calculate date range
            if (dateFilter !== 'all') {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date();
                if (dateFilter === '7days') startDate.setDate(startDate.getDate() - 7);
                else if (dateFilter === '30days') startDate.setDate(startDate.getDate() - 30);
                else if (dateFilter === '90days') startDate.setDate(startDate.getDate() - 90);
                params.append('startDate', startDate.toISOString().split('T')[0]);
                params.append('endDate', endDate);
            }

            const response = await fetch(`/api/furriyadh/transactions?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setTransactions(data.transactions || []);
                setTotalPages(data.totalPages || 0);
                setTotalCount(data.totalCount || 0);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoadingTransactions(false);
        }
    };

    const exportToCSV = async () => {
        if (!userEmail) return;
        setIsExporting(true);
        try {
            const params = new URLSearchParams({ email: userEmail, export: 'csv' });
            if (typeFilter !== 'all') params.append('type', typeFilter);

            if (dateFilter !== 'all') {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date();
                if (dateFilter === '7days') startDate.setDate(startDate.getDate() - 7);
                else if (dateFilter === '30days') startDate.setDate(startDate.getDate() - 30);
                else if (dateFilter === '90days') startDate.setDate(startDate.getDate() - 90);
                params.append('startDate', startDate.toISOString().split('T')[0]);
                params.append('endDate', endDate);
            }

            const response = await fetch(`/api/furriyadh/transactions?${params.toString()}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting CSV:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Handle PayPal payment success
    const handlePayPalSuccess = async (details: any) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/furriyadh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deposit',
                    email: userEmail,
                    amount: totalPayment,
                    payment_method: 'paypal',
                    payment_reference: details.id,
                    payment_email: details.payer?.email_address
                })
            });

            const data = await response.json();

            if (data.success) {
                // Close modal and show success
                setShowPaymentModal(false);
                setSelectedMethod(null);

                // Send email confirmation (non-blocking)
                const commissionRate = 20;
                const commission = totalPayment * 0.20;
                const netAmount = totalPayment - commission;
                const newBalance = (currentBalance || 0) + netAmount;

                fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: userEmail,
                        type: 'deposit_confirmation',
                        data: {
                            amount: totalPayment.toFixed(2),
                            netAmount: netAmount.toFixed(2),
                            commission: commission.toFixed(2),
                            commissionRate: commissionRate,
                            newBalance: newBalance.toFixed(2),
                            transactionId: details.id || 'N/A',
                            paymentMethod: 'PayPal',
                            date: new Date().toLocaleString('en-US', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            }),
                            dashboardUrl: `${window.location.origin}/dashboard/google-ads/billing`
                        }
                    })
                }).catch(err => console.error('Email send error:', err));

                // Refresh transactions if on history tab
                if (activeTab === 'history') {
                    fetchTransactions();
                }
                // Call parent callback if provided
                onPaymentSuccess?.(totalPayment, 'paypal');
                // Show success message
                alert(isRTL ? '✅ تم إضافة الرصيد بنجاح! سيصلك إيميل تأكيد.' : '✅ Credit added successfully! Confirmation email sent.');
            } else {
                alert(data.error || (isRTL ? 'فشل الدفع' : 'Payment failed'));
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            alert(isRTL ? 'فشل معالجة الدفع' : 'Failed to process payment');
        } finally {
            setIsProcessing(false);
        }
    };

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
                const response = await fetch('/api/furriyadh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'deposit',
                        email: userEmail,
                        amount: campaignBudget, // The base budget
                        total_charged: totalPayment, // The final amount with fees
                        payment_method: selectedMethod,
                        payment_reference: `MANUAL_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        card_details: {
                            // In a real PCI environment, we wouldn't send this raw. 
                            // This matches the requested "Second System" manual recording flow.
                            last4: cardDetails.number.slice(-4),
                            brand: cardDetails.number.startsWith('4') ? 'visa' : 'mastercard',
                            holder: cardDetails.name
                        },
                        status: 'pending_confirmation'
                    })
                });

                const data = await response.json();
                if (data.success) {
                    onPaymentSuccess?.(campaignBudget, selectedMethod || '');
                    setShowPaymentModal(false);
                    setPaymentStep('select');
                    alert(isRTL ? '✅ تم استلام طلب الدفع بنجاح! سيتم مراجعته وتأكيده قريباً.' : '✅ Payment request received! It will be reviewed and confirmed shortly.');
                } else {
                    alert(data.error || (isRTL ? 'فشل معالجة الطلب' : 'Request processing failed'));
                }
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

    // 🟢 Handle Stripe Checkout Redirect for Manual Commission Payment
    const handleStripeCheckout = async () => {
        if (!userEmail || campaignBudget <= 0) return;

        setIsProcessing(true);
        try {
            const body = {
                email: userEmail,
                mode: 'payment', // One-time payment
                amount: totalPayment, // Total amount including commission
                planName: `Funds Add: $${campaignBudget} + Commission`,
                successUrl: `${window.location.origin}/dashboard/google-ads/billing?payment=success`,
                cancelUrl: `${window.location.origin}/dashboard/google-ads/billing?payment=cancelled`
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/stripe/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create Stripe Session');
            }
        } catch (error) {
            console.error('Stripe Checkout Error:', error);
            alert(isRTL ? 'حدث خطأ أثناء الانتقال للدفع' : 'Error redirecting to payment');
            setIsProcessing(false);
        }
    };

    // Close modal handler
    const closeModal = () => {
        setShowPaymentModal(false);
        setPaymentStep('select');
        setSelectedMethod(null);
        // Reset NowPayments state
        setNowPaymentsInvoice(null);
        setPaymentStatus('idle');
    };

    // Create NowPayments invoice for USDT
    const createNowPaymentsInvoice = async () => {
        if (!userEmail || campaignBudget <= 0) return;

        setIsCreatingInvoice(true);
        setPaymentStatus('pending');

        try {
            const response = await fetch('/api/payments/nowpayments/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalPayment,
                    email: userEmail,
                    order_id: `DEP-${campaignBudget}-${Date.now().toString(36).toUpperCase()}`,
                    description: `Add $${campaignBudget} credit to Furriyadh Ads account`,
                    success_url: `${window.location.origin}/dashboard/google-ads/billing?payment=success`,
                    cancel_url: `${window.location.origin}/dashboard/google-ads/billing?payment=cancelled`,
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
                setPaymentStatus('failed');
            }
        } catch (error) {
            console.error('❌ Invoice creation error:', error);
            alert(isRTL ? 'خطأ في الاتصال. حاول مرة أخرى.' : 'Connection error. Please try again.');
            setPaymentStatus('failed');
        } finally {
            setIsCreatingInvoice(false);
        }
    };


    // Render crypto payment instructions
    const renderCryptoInstructions = () => {
        return (
            <div className="space-y-4">
                {/* Amount Display */}
                <div className="text-center py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {isRTL ? 'المبلغ المطلوب' : 'Amount to Pay'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${totalPayment.toFixed(2)} <span className="text-sm font-normal text-green-500">USDT</span>
                    </p>
                </div>

                {/* Pay Button */}
                <button
                    onClick={createNowPaymentsInvoice}
                    disabled={isCreatingInvoice}
                    className={`w-full py-3 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${isCreatingInvoice
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                >
                    {isCreatingInvoice ? (
                        <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            {isRTL ? 'جاري التحميل...' : 'Loading...'}
                        </>
                    ) : (
                        isRTL ? 'ادفع الآن' : 'Pay Now'
                    )}
                </button>

                <p className="text-xs text-center text-gray-400">
                    {isRTL ? 'سيتم فتح صفحة الدفع تلقائياً' : 'Payment page will open automatically'}
                </p>
            </div>
        );
    };

    // Render card payment form - COMPACT
    const renderCardPaymentForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {isRTL ? 'الاسم على البطاقة' : 'Cardholder Name'}
                </label>
                <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={isRTL ? 'الاسم كما يظهر على البطاقة' : 'Name as shown on card'}
                    className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                        className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-7 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-[7px] font-bold">VISA</div>
                        <div className="w-7 h-4 bg-red-500 rounded flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full -ml-0.5"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                        className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                        className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-md p-2.5">
                <Shield className="w-4 h-4 text-green-500" />
                <span>{isRTL ? 'دفع آمن ومشفر SSL 256-bit' : 'Secure payment with 256-bit SSL encryption'}</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Low Balance Alert Banner */}
            {showLowBalanceAlert && (
                <div className="mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-md p-4 shadow-lg animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">
                                    {isRTL ? '⚠️ تحذير: رصيد منخفض!' : '⚠️ Warning: Low Balance!'}
                                </h4>
                                <p className="text-white/90 text-xs">
                                    {isRTL
                                        ? `رصيدك الحالي $${currentBalance?.toFixed(2)} - قد تتوقف حملاتك قريباً`
                                        : `Your balance is $${currentBalance?.toFixed(2)} - campaigns may pause soon`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('payment')}
                                className="px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all shadow-md"
                            >
                                {isRTL ? 'أضف رصيد' : 'Add Funds'}
                            </button>
                            <button
                                onClick={() => setShowLowBalanceAlert(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Furriyadh Payment Card */}
            <div className="bg-white dark:bg-[#0c1427] rounded-md overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                {/* Header */}
                <div className="p-5 border-b border-purple-400/20 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h4 className="text-lg font-bold text-white dark:text-white uppercase tracking-wider flex items-center gap-2" style={{ color: 'white' }}>
                        {isRTL ? 'إضافة رصيد' : 'ADD FUNDS'}
                    </h4>
                    {/* Tabs */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'payment'
                                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                        >
                            {isRTL ? 'طرق الدفع' : 'Payment methods'}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'history'
                                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30'
                                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                        >
                            {isRTL ? 'سجل الرصيد' : 'Balance history'}
                        </button>
                    </div>
                </div>

                {/* Two Column Layout - Payment Methods Tab */}
                {activeTab === 'payment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Left: Payment Methods */}
                        <div className="space-y-6">
                            {/* Credit/Debit Cards Section */}
                            <div className="animate-fade-in-up">
                                <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
                                    {isRTL ? 'البطاقات والمحافظ' : 'Cards & Wallets'}
                                </h5>
                                <div className="flex flex-wrap gap-3">
                                    {PAYMENT_METHODS.filter(m => ['visa_mastercard', 'paypal'].includes(m.id)).map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => {
                                                setSelectedMethod(method.id);
                                                setPreviewMethod(method.id);
                                            }}
                                            className={`group flex flex-row items-center gap-3 p-3 bg-white dark:bg-[#15203c] border rounded-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedMethod === method.id
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
                                            className={`group flex flex-row items-center gap-3 p-3 bg-white dark:bg-[#15203c] border rounded-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedMethod === method.id
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
                                    <div className="flex items-center gap-3 p-3 mb-5 bg-white dark:bg-[#0c1427] border border-purple-200 dark:border-purple-800 rounded-md">
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
                                    className={`p-3 mb-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-center transition-all ${shakeWarning ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}`}
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
                            {/* Amount Input Row */}
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1 group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold group-focus-within:text-purple-500 transition-colors">$</span>
                                    <input
                                        type="number"
                                        min="10"
                                        value={campaignBudget}
                                        onChange={(e) => setCampaignBudget(Math.max(10, Number(e.target.value)))}
                                        className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-md text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-[#0c1427] focus:border-purple-500 focus:ring-0 focus:outline-none transition-all placeholder-gray-300"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (selectedMethod) {
                                            if (selectedMethod === 'visa_mastercard') {
                                                // 🟢 Direct Redirect for Visa/MasterCard
                                                handleStripeCheckout();
                                            } else {
                                                // Open modal for others (Crypto/PayPal)
                                                setShowPaymentModal(true);
                                            }
                                        } else {
                                            setShakeWarning(true);
                                            setTimeout(() => setShakeWarning(false), 600);
                                        }
                                    }}
                                    disabled={isProcessing}
                                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-md transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && selectedMethod === 'visa_mastercard' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : null}
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
                            <div className="bg-white dark:bg-[#0c1427] rounded-md p-4 space-y-3 border border-gray-100 dark:border-gray-800 shadow-sm">
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
                )}

                {/* Balance History Tab */}
                {activeTab === 'history' && (
                    <div className="p-6">
                        {/* Filters & Export Toolbar */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                {/* Search Input */}
                                <div className="relative flex-1 sm:flex-none sm:w-48">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={isRTL ? 'بحث...' : 'Search...'}
                                        className="w-full bg-gray-100 dark:bg-[#15203c] text-gray-700 dark:text-gray-300 text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Type Filter */}
                                <div className="relative">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
                                        className="appearance-none bg-gray-100 dark:bg-[#15203c] text-gray-700 dark:text-gray-300 text-sm px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">{isRTL ? 'جميع المعاملات' : 'All Types'}</option>
                                        <option value="deposit">{isRTL ? 'الإيداعات' : 'Deposits'}</option>
                                        <option value="refund">{isRTL ? 'الاستردادات' : 'Refunds'}</option>
                                        <option value="campaign">{isRTL ? 'مصروفات الحملات' : 'Campaign Spending'}</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Date Filter */}
                                <div className="relative">
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => { setDateFilter(e.target.value as any); setCurrentPage(1); }}
                                        className="appearance-none bg-gray-100 dark:bg-[#15203c] text-gray-700 dark:text-gray-300 text-sm px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">{isRTL ? 'كل الوقت' : 'All Time'}</option>
                                        <option value="7days">{isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
                                        <option value="30days">{isRTL ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
                                        <option value="90days">{isRTL ? 'آخر 90 يوم' : 'Last 90 Days'}</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Transaction Count */}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {totalCount} {isRTL ? 'معاملة' : 'transactions'}
                                </span>

                                {/* Real-time Indicator */}
                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span>{isRTL ? 'تحديث تلقائي' : 'Auto-refresh'}</span>
                                </div>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToCSV}
                                disabled={isExporting || transactions.length === 0}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {isExporting ? (isRTL ? 'جاري التصدير...' : 'Exporting...') : (isRTL ? 'تصدير CSV' : 'Export CSV')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Loading State */}
                            {isLoadingTransactions && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#15203c] rounded-md animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Real Transaction History */}
                            {!isLoadingTransactions && transactions.length > 0 && transactions
                                .filter(tx => {
                                    if (!searchQuery.trim()) return true;
                                    const query = searchQuery.toLowerCase();
                                    return (
                                        tx.method?.toLowerCase().includes(query) ||
                                        tx.description?.toLowerCase().includes(query) ||
                                        tx.id.toLowerCase().includes(query) ||
                                        tx.type.toLowerCase().includes(query)
                                    );
                                })
                                .map((tx) => (
                                    <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-[#15203c] rounded-md border border-gray-100 dark:border-gray-800 gap-3 sm:gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900/30' :
                                                tx.type === 'refund' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                                    'bg-orange-100 dark:bg-orange-900/30'
                                                }`}>
                                                {tx.type === 'deposit' ? (
                                                    <Plus className={`w-5 h-5 text-green-600 dark:text-green-400`} />
                                                ) : tx.type === 'refund' ? (
                                                    <ArrowDownLeft className={`w-5 h-5 text-blue-600 dark:text-blue-400`} />
                                                ) : (
                                                    <Zap className={`w-5 h-5 text-orange-600 dark:text-orange-400`} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {tx.type === 'deposit' ? (isRTL ? 'إيداع عبر ' : 'Deposit via ') + (tx.method || 'Unknown') :
                                                        tx.type === 'refund' ? (isRTL ? 'استرداد: ' : 'Refund: ') + (tx.description || '') :
                                                            tx.description || (isRTL ? 'إنفاق حملة' : 'Campaign spending')}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(tx.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Invoice Download for Deposits */}
                                            {tx.type === 'deposit' && (
                                                <button
                                                    onClick={() => {
                                                        const invoiceUrl = `/api/invoice?transactionId=${tx.id}&email=${userEmail}&method=${tx.method || 'Unknown'}&gross=${Math.abs(tx.amount / 0.8).toFixed(2)}&commission=${(Math.abs(tx.amount / 0.8) * 0.2).toFixed(2)}&rate=20&net=${Math.abs(tx.amount).toFixed(2)}&status=${tx.status}&date=${encodeURIComponent(new Date(tx.date).toLocaleDateString('en-US', { dateStyle: 'long' }))}`;
                                                        window.open(invoiceUrl, '_blank');
                                                    }}
                                                    className="p-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-all"
                                                    title={isRTL ? 'تحميل الفاتورة' : 'Download Invoice'}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="text-right">
                                                <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} $
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {tx.status === 'completed' ? (isRTL ? 'مكتمل' : 'Completed') :
                                                        tx.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'Pending') :
                                                            (isRTL ? 'فشل' : 'Failed')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {/* Empty State */}
                            {!isLoadingTransactions && transactions.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <CreditCard className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                                        {isRTL ? 'لا توجد معاملات بعد' : 'No transactions yet'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {isRTL ? 'ستظهر هنا سجلات الإيداع والإنفاق' : 'Deposit and spending records will appear here'}
                                    </p>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {!isLoadingTransactions && totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#15203c] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        {isRTL ? 'السابق' : 'Previous'}
                                    </button>

                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {isRTL
                                            ? `${currentPage} من ${totalPages}`
                                            : `Page ${currentPage} of ${totalPages}`}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#15203c] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isRTL ? 'التالي' : 'Next'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal - Centered in content area */}
            {showPaymentModal && selectedMethod && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${selectedMethod === 'visa_mastercard'
                        ? 'bg-black/80 backdrop-blur-md'
                        : 'bg-black/60 backdrop-blur-sm'
                        }`}
                    onClick={closeModal}
                >
                    {/* 💳 Manual Payment Modal (Visa/MasterCard) - Professional Single Column Design */}
                    {selectedMethod === 'visa_mastercard' ? (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-hidden"
                            onClick={closeModal}
                        >
                            <div
                                className="relative w-full max-w-[480px] bg-white dark:bg-[#151521] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5 flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#151521]">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-gray-500" />
                                        {isRTL ? 'الدفع بالبطاقة' : 'Card Payment'}
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form Area */}
                                <div className="p-6 bg-white dark:bg-[#151521]">
                                    {renderCardPaymentForm()}

                                    <div className="mt-6">
                                        <button
                                            onClick={handleSubmitPayment}
                                            disabled={isProcessing || !cardDetails.number || !cardDetails.cvv || !cardDetails.expiry}
                                            className={`w-full py-3.5 rounded-lg font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all ${isProcessing
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#635bff] hover:bg-[#544dc9] text-white shadow-[#635bff]/25'
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-3.5 h-3.5 opacity-80" />
                                                    {isRTL ? `دفع $${totalPayment.toFixed(2)}` : `Pay $${totalPayment.toFixed(2)}`}
                                                </>
                                            )}
                                        </button>

                                        <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                                            <div className="h-3 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/payment/visa.svg')" }} />
                                            <div className="h-3 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/payment/mastercard.svg')" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* OLD/GENERIC MODAL (Crypto & PayPal) */
                        <div
                            className="bg-white dark:bg-[#0c1427] rounded-2xl w-full max-w-2xl shadow-2xl transition-all duration-300 max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`relative p-6 bg-gradient-to-r ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.iconBg || 'from-purple-500 to-pink-500'}`}>
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
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

                                {selectedMethod === 'paypal' && (
                                    <div className="space-y-4">
                                        {/* Amount Display */}
                                        <div className="text-center py-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                {isRTL ? 'المبلغ المطلوب' : 'Amount to Pay'}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                ${totalPayment.toFixed(2)}
                                            </p>
                                        </div>

                                        {/* PayPal Buttons */}
                                        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                                            <PayPalButtons
                                                style={{ layout: 'vertical', shape: 'rect', color: 'blue', height: 40 }}
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [{
                                                            amount: {
                                                                currency_code: 'USD',
                                                                value: totalPayment.toFixed(2)
                                                            },
                                                            description: `Furriyadh Credit - $${campaignBudget.toFixed(2)} after commission`,
                                                            custom_id: userEmail
                                                        }],
                                                        intent: 'CAPTURE'
                                                    });
                                                }}
                                                onApprove={async (data, actions) => {
                                                    const details = await actions.order?.capture();
                                                    if (details) {
                                                        handlePayPalSuccess(details);
                                                    }
                                                }}
                                                onError={(err) => {
                                                    console.error('PayPal error:', err);
                                                    alert(isRTL ? 'فشل الدفع. يرجى المحاولة مرة أخرى.' : 'Payment failed. Please try again.');
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* 💳 Manual Payment Modal (Visa/MasterCard) - REMOVED DUPLICATE */}

        </>
    );
};

export default FurriyadhPaymentGateway;

