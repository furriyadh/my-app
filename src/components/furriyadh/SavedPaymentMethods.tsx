'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    CreditCard,
    Plus,
    Trash2,
    Shield,
    AlertCircle,
    X,
    Lock,
    CheckCircle2,
    MoreVertical,
    Star,
    MapPin,
    Edit3
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/services/userService';
import Link from 'next/link';

interface SavedPaymentMethod {
    id: string;
    type: 'card';
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    cardholderName?: string;
    isDefault: boolean;
}

interface BillingAddress {
    company: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
}

interface SavedPaymentMethodsProps {
    userEmail: string;
    isRTL?: boolean;
    onPaymentMethodChange?: () => void;
}

export const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({
    userEmail,
    isRTL = false,
    onPaymentMethodChange
}) => {
    const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCard, setShowAddCard] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        if (activeMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu]);

    // Billing address - fetched from user_profiles
    const [billingAddress, setBillingAddress] = useState<BillingAddress>({
        company: '',
        street: '',
        city: '',
        country: '',
        postalCode: ''
    });

    // Fetch billing address from user profile
    useEffect(() => {
        const fetchBillingAddress = async () => {
            try {
                const result = await UserService.getCurrentUserProfile();
                if (result.data) {
                    setBillingAddress({
                        company: result.data.company_name || '',
                        street: result.data.address || '',
                        city: '',  // Can be parsed from address if needed
                        country: result.data.country || '',
                        postalCode: ''  // Can be added to user_profiles if needed
                    });
                }
            } catch (err) {
                console.error('Error fetching billing address:', err);
            }
        };
        fetchBillingAddress();
    }, []);

    // Card form states
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const [isAddingCard, setIsAddingCard] = useState(false);

    // Load saved payment methods
    useEffect(() => {
        loadPaymentMethods();
    }, [userEmail]);

    const loadPaymentMethods = async () => {
        if (!userEmail) return;
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('user_payment_methods')
                .select('*')
                .eq('user_email', userEmail)
                .eq('type', 'card')
                .order('is_default', { ascending: false });

            if (data) {
                setPaymentMethods(data.map(pm => ({
                    id: pm.id,
                    type: 'card',
                    brand: pm.brand,
                    last4: pm.last4,
                    expMonth: pm.exp_month,
                    expYear: pm.exp_year,
                    cardholderName: pm.cardholder_name,
                    isDefault: pm.is_default
                })));
            }
        } catch (err) {
            console.error('Error loading payment methods:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Format card number
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    // Format expiry
    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    // Get card brand
    const getCardBrand = (number: string): string => {
        const cleanNumber = number.replace(/\s/g, '');
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'amex';
        return 'card';
    };

    // Luhn validation
    const validateCardLuhn = (number: string): boolean => {
        const cleanNumber = number.replace(/\s/g, '');
        if (cleanNumber.length < 13) return false;
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
        return sum % 10 === 0;
    };

    // Validate expiry
    const validateExpiry = (expiry: string): boolean => {
        if (!expiry || expiry.length < 5) return false;
        const [monthStr, yearStr] = expiry.split('/');
        const month = parseInt(monthStr, 10);
        const year = 2000 + parseInt(yearStr, 10);
        if (month < 1 || month > 12) return false;
        const now = new Date();
        if (year < now.getFullYear()) return false;
        if (year === now.getFullYear() && month < now.getMonth() + 1) return false;
        return true;
    };

    const getCardValidation = () => {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length === 0) return { status: 'empty', message: '' };
        if (cleanNumber.length < 13) return { status: 'typing', message: '' };
        if (!validateCardLuhn(cardNumber)) return { status: 'invalid', message: isRTL ? 'رقم البطاقة غير صالح' : 'Invalid card number' };
        return { status: 'valid', message: '' };
    };

    const cardValidationStatus = getCardValidation();
    const expiryValid = validateExpiry(cardExpiry);
    const cvvValid = cardCvc.length >= 3;

    // Add card
    const handleAddCard = async () => {
        if (!cardNumber || !cardExpiry || !cardCvc || !cardName) return;
        if (!validateCardLuhn(cardNumber) || !validateExpiry(cardExpiry)) return;

        setIsAddingCard(true);
        try {
            const [expMonth, expYear] = cardExpiry.split('/');
            const brand = getCardBrand(cardNumber);
            const last4 = cardNumber.replace(/\s/g, '').slice(-4);

            const { error } = await supabase.from('user_payment_methods').insert({
                user_email: userEmail,
                type: 'card',
                brand: brand,
                last4: last4,
                exp_month: parseInt(expMonth),
                exp_year: parseInt('20' + expYear),
                cardholder_name: cardName,
                is_default: paymentMethods.length === 0
            });

            if (!error) {
                setShowAddCard(false);
                setCardNumber('');
                setCardExpiry('');
                setCardCvc('');
                setCardName('');
                loadPaymentMethods();
                onPaymentMethodChange?.();
            }
        } catch (err) {
            console.error('Error adding card:', err);
        } finally {
            setIsAddingCard(false);
        }
    };

    // Set default
    const setDefaultMethod = async (methodId: string) => {
        try {
            await supabase
                .from('user_payment_methods')
                .update({ is_default: false })
                .eq('user_email', userEmail);
            await supabase
                .from('user_payment_methods')
                .update({ is_default: true })
                .eq('id', methodId);
            loadPaymentMethods();
            setActiveMenu(null);
        } catch (err) {
            console.error('Error setting default:', err);
        }
    };

    // Delete method
    const deleteMethod = async (methodId: string) => {
        try {
            await supabase
                .from('user_payment_methods')
                .delete()
                .eq('id', methodId);
            loadPaymentMethods();
            onPaymentMethodChange?.();
            setActiveMenu(null);
        } catch (err) {
            console.error('Error deleting method:', err);
        }
    };

    // Get mini card gradient based on brand
    const getCardGradient = (brand: string) => {
        switch (brand) {
            case 'visa':
                return 'from-[#1a1f71] to-[#00579f]';
            case 'mastercard':
                return 'from-[#eb001b] via-[#f79e1b] to-[#ff5f00]';
            case 'amex':
                return 'from-[#006fcf] to-[#00cfff]';
            default:
                return 'from-gray-700 to-gray-900';
        }
    };

    // Card brand logo component
    const getBrandLogo = (brand: string) => {
        switch (brand) {
            case 'visa':
                return <span className="text-white text-xs font-bold tracking-wider">VISA</span>;
            case 'mastercard':
                return (
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    </div>
                );
            case 'amex':
                return <span className="text-white text-[8px] font-bold">AMEX</span>;
            default:
                return <CreditCard className="w-4 h-4 text-white" />;
        }
    };

    return (
        <div className="w-full">
            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT: Payment Methods */}
                <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
                    <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                        <div className="trezo-card-title">
                            <h5 className="!mb-0">
                                {isRTL ? 'طرق الدفع' : 'Payment Methods'}
                            </h5>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                            <Shield className="w-3 h-3" />
                            <span>{isRTL ? 'آمن' : 'Secure'}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* Stacked Cards - Compact View */}
                            <div className="space-y-3">
                                {paymentMethods.map((method, index) => (
                                    <div
                                        key={method.id}
                                        className={`relative flex items-center gap-4 p-3 rounded-md border transition-all cursor-pointer hover:shadow-sm ${method.isDefault
                                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        style={{ zIndex: paymentMethods.length - index }}
                                    >
                                        {/* Mini Card Visual */}
                                        <div className={`relative w-14 h-9 rounded-md bg-gradient-to-br ${getCardGradient(method.brand || 'card')} shadow-lg flex items-center justify-center overflow-hidden`}>
                                            {/* Card chip decoration */}
                                            <div className="absolute top-1 left-1.5 w-2.5 h-2 bg-yellow-400/80 rounded-sm" />
                                            {/* Brand logo */}
                                            <div className="absolute bottom-1 right-1">
                                                {getBrandLogo(method.brand || 'card')}
                                            </div>
                                        </div>

                                        {/* Card Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                                    {method.brand || 'Card'}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                    •••• {method.last4}
                                                </span>
                                                {method.isDefault && (
                                                    <span className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                                        <Star className="w-2.5 h-2.5 fill-current" />
                                                        {isRTL ? 'الافتراضية' : 'Default'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {isRTL ? 'تنتهي' : 'Expires'} {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}
                                            </p>
                                        </div>

                                        {/* Actions Menu */}
                                        <div className="relative" ref={activeMenu === method.id ? menuRef : null}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === method.id ? null : method.id);
                                                }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                            {activeMenu === method.id && (
                                                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-md shadow-xl py-1.5 min-w-[140px] z-20 border border-gray-100 dark:border-gray-700">
                                                    {!method.isDefault && (
                                                        <button
                                                            onClick={() => setDefaultMethod(method.id)}
                                                            className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                        >
                                                            <Star className="w-3.5 h-3.5" />
                                                            {isRTL ? 'تعيين افتراضي' : 'Set as default'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteMethod(method.id)}
                                                        className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        {isRTL ? 'حذف' : 'Remove'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {paymentMethods.length === 0 && (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-md border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <CreditCard className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {isRTL ? 'لا توجد بطاقات محفوظة' : 'No cards saved'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Add Card Button */}
                            <button
                                onClick={() => setShowAddCard(true)}
                                className="mt-4 w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-gray-500 dark:text-gray-400 hover:text-primary-600 group"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm font-medium">{isRTL ? 'إضافة بطاقة' : 'Add Card'}</span>
                            </button>
                        </>
                    )}
                </div>

                {/* RIGHT: Billing Address */}
                <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
                    <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                        <div className="trezo-card-title">
                            <h5 className="!mb-0">
                                {isRTL ? 'عنوان الفوترة' : 'Billing Address'}
                            </h5>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-100 dark:border-gray-700">
                        {billingAddress.company || billingAddress.street || billingAddress.country ? (
                            <div className="space-y-2">
                                {billingAddress.company && (
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {billingAddress.company}
                                    </p>
                                )}
                                {billingAddress.street && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {billingAddress.street}
                                    </p>
                                )}
                                {billingAddress.country && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {billingAddress.country}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {isRTL ? 'لم يتم إضافة عنوان بعد' : 'No address added yet'}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                    {isRTL ? 'أضف عنوانك من الإعدادات' : 'Add your address from Settings'}
                                </p>
                            </div>
                        )}

                        <Link
                            href="/settings"
                            className="mt-4 text-white bg-primary-500 hover:bg-primary-600 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors py-2.5 px-4 rounded-lg"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isRTL ? 'تعديل العنوان' : 'Edit Address'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Add Card Modal */}
            {showAddCard && (
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isRTL ? 'lg:pr-[250px]' : 'lg:pl-[250px]'}`}
                    onClick={() => setShowAddCard(false)}
                    dir={isRTL ? 'rtl' : 'ltr'}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {isRTL ? 'إضافة بطاقة جديدة' : 'Add New Card'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {isRTL ? 'أدخل بيانات بطاقتك' : 'Enter your card details'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddCard(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {isRTL ? 'رقم البطاقة' : 'Card Number'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        maxLength={19}
                                        placeholder="4242 4242 4242 4242"
                                        className={`w-full px-4 py-3 border-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 ${cardValidationStatus.status === 'valid' ? 'border-green-500' :
                                            cardValidationStatus.status === 'invalid' ? 'border-red-500' :
                                                'border-gray-200 dark:border-gray-700'
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {cardValidationStatus.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        {cardValidationStatus.status === 'invalid' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                </div>
                                {cardValidationStatus.status === 'invalid' && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {cardValidationStatus.message}
                                    </p>
                                )}
                            </div>

                            {/* Expiry & CVV */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry'}
                                    </label>
                                    <input
                                        type="text"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        placeholder="MM/YY"
                                        className={`w-full px-4 py-3 border-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-center ${cardExpiry.length === 5 ? (expiryValid ? 'border-green-500' : 'border-red-500') : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        CVV
                                    </label>
                                    <input
                                        type="password"
                                        value={cardCvc}
                                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        placeholder="•••"
                                        className={`w-full px-4 py-3 border-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-center ${cvvValid ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Cardholder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                                </label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                    placeholder="JOHN DOE"
                                    className={`w-full px-4 py-3 border-2 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white uppercase tracking-wide ${cardName.length >= 3 ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                />
                            </div>

                            {/* Security Note */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                <Lock className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{isRTL ? 'بياناتك مشفرة ومحمية' : 'Your data is encrypted and secure'}</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleAddCard}
                                disabled={isAddingCard || cardValidationStatus.status !== 'valid' || !expiryValid || !cvvValid || cardName.length < 3}
                                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isAddingCard ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {isRTL ? 'جاري الإضافة...' : 'Adding...'}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        {isRTL ? 'إضافة البطاقة' : 'Add Card'}
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedPaymentMethods;
