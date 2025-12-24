'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import AnimatedList from '@/components/AnimatedList';
import Announcement from '@/components/seraui/Announcement';
import { supabase, subscribeToClientRequests, type ClientRequest } from '@/lib/supabase';
import { useLanguage } from '@/lib/hooks/useLanguage';

// CSS styles للتأثيرات البصرية
const styles = `
  .updated-account {
    animation: updatePulse 2s ease-in-out;
    border: 2px solid #10b981 !important;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3) !important;
  }
  
  .syncing-account {
    animation: syncPulse 1s infinite;
    border: 2px solid #3b82f6 !important;
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3) !important;
  }
  
  @keyframes updatePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  
  @keyframes syncPulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 3s ease-in-out infinite;
  }
  
  /* كارت الحسابات - تأثير التوهج المتقدم مع تتبع الماوس */
  .accounts-card {
    --glow-x: 50%;
    --glow-y: 50%;
    --glow-intensity: 0;
    --glow-radius: 1000px;
    --glow-color: 16, 185, 129;
    --border-glow: rgba(16, 185, 129, 0.7);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  /* التوهج الخارجي الكبير - يتبع الماوس */
  .accounts-card::before {
    content: '';
    position: absolute;
    inset: -40px;
    border-radius: 68px;
    background: radial-gradient(
      var(--glow-radius) circle at var(--glow-x) var(--glow-y),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 1)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.7)) 15%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.5)) 30%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.3)) 50%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.15)) 70%,
      transparent 90%
    );
    pointer-events: none;
    z-index: -1;
    transition: all 0.15s ease;
    filter: blur(25px);
    opacity: var(--glow-intensity);
  }
  
  /* التوهج الداخلي - spotlight effect */
  .accounts-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background: radial-gradient(
      700px circle at var(--glow-x) var(--glow-y),
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.35)) 0%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.2)) 25%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.1)) 45%,
      rgba(var(--glow-color), calc(var(--glow-intensity) * 0.05)) 60%,
      transparent 80%
    );
    pointer-events: none;
    z-index: 1;
    opacity: var(--glow-intensity);
    transition: opacity 0.15s ease;
  }
  
  /* تأثير hover على الكارت الرئيسي */
  .accounts-card:hover {
    transform: translateY(-2px);
  }
  
  /* تأثير الحدود المتوهجة */
  .accounts-card > div:first-child {
    transition: all 0.3s ease;
    box-shadow: 
      0 0 0 1px rgba(16, 185, 129, 0.2),
      0 4px 20px rgba(0, 0, 0, 0.3);
  }
  
  .accounts-card:hover > div:first-child {
    box-shadow: 
      0 0 0 2px rgba(16, 185, 129, 0.5),
      0 0 30px rgba(16, 185, 129, 0.3),
      0 0 60px rgba(16, 185, 129, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.4);
  }
  
  /* تأثير hover على الكروت الداخلية */
  .account-item {
    transition: all 0.3s ease;
  }
  
  .account-item:hover {
    transform: translateX(4px);
    box-shadow: 
      0 0 20px rgba(16, 185, 129, 0.15),
      inset 0 0 30px rgba(16, 185, 129, 0.05);
  }
  
  /* الكرات المتحركة - Floating particles */
  @keyframes float-slow {
    0%, 100% { 
      transform: translateY(0px) translateX(0px); 
      opacity: 0.8;
    }
    25% { 
      transform: translateY(-15px) translateX(10px); 
      opacity: 0.6;
    }
    50% { 
      transform: translateY(-25px) translateX(-5px); 
      opacity: 0.9;
    }
    75% { 
      transform: translateY(-10px) translateX(-15px); 
      opacity: 0.5;
    }
  }
  
  @keyframes float-medium {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) scale(1); 
      opacity: 0.7;
    }
    33% { 
      transform: translateY(-20px) translateX(15px) scale(1.2); 
      opacity: 0.5;
    }
    66% { 
      transform: translateY(-10px) translateX(-10px) scale(0.8); 
      opacity: 0.9;
    }
  }
  
  @keyframes float-fast {
    0%, 100% { 
      transform: translateY(0px) translateX(0px) rotate(0deg); 
      opacity: 0.6;
    }
    20% { 
      transform: translateY(-12px) translateX(8px) rotate(90deg); 
      opacity: 0.8;
    }
    40% { 
      transform: translateY(-20px) translateX(-5px) rotate(180deg); 
      opacity: 0.4;
    }
    60% { 
      transform: translateY(-8px) translateX(-12px) rotate(270deg); 
      opacity: 0.9;
    }
    80% { 
      transform: translateY(-15px) translateX(5px) rotate(360deg); 
      opacity: 0.5;
    }
  }
  
  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 6s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 4s ease-in-out infinite;
  }
  
  .status-connected {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    color: white !important;
  }
  
  .status-pending {
    background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
    color: white !important;
  }
  
  .status-link {
    background: linear-gradient(135deg, #6b7280, #4b5563) !important;
    color: white !important;
  }
`;

// دالة لتنسيق رقم الحساب الأعلاني
const formatCustomerId = (customerId: string): string => {
    // إزالة أي مسافات أو شرطات موجودة
    const cleanId = customerId.replace(/[\s-]/g, '');

    // التحقق من أن الرقم صحيح (10 أرقام)
    if (cleanId.length === 10 && /^\d+$/.test(cleanId)) {
        // تقسيم الرقم إلى 3-3-4
        return `${cleanId.slice(0, 3)}-${cleanId.slice(3, 6)}-${cleanId.slice(6, 10)}`;
    }

    // إذا لم يكن 10 أرقام، إرجاع الرقم كما هو
    return customerId;
};

// TypeScript interfaces
interface GoogleAdsAccount {
    id: string;
    customerId: string;
    name: string;
    status: 'ENABLED' | 'SUSPENDED' | 'CANCELLED';
    isTestAccount?: boolean;
    isManager?: boolean;
    accountType?: 'MCC_MANAGER' | 'REGULAR_ACCOUNT';
    isConnected: boolean;
    isLinkedToMCC: boolean;
    displayStatus: string;
    // حالة وصول الإحصائيات من Google Ads لهذا الحساب
    isAccessible?: boolean;
    accessErrorCode?: string | null;
    accessMessage?: string | null;
    // علامة للحسابات المرتبطة لكن المعطّلة (تحتاج تفعيل)
    isDisabled?: boolean;
    linkDetails?: {
        success: boolean;
        linkStatus: string;
        managerId?: string;
        managerCustomer?: string;
        clientCustomer?: string;
        lastChecked: string;
    };
    lastSync: string;
    campaignsCount: number;
    monthlySpend: number;
    details?: any;
}



// Component منفصل للتعامل مع searchParams
const GoogleAdsContent: React.FC = () => {
    // دالة مساعدة لتطبيع الحالة (Normalization) لتجنب مشاكل المسافات أو حالة الأحرف
    const normalizeStatus = (status: any): string => {
        if (!status) return 'UNKNOWN';
        return String(status).toUpperCase().trim();
    };

    // دالة مساعدة لتطبيع معرف العميل (إزالة الواصلات للتخزين المفتاحي)
    const normalizeCustomerId = (id: string): string => {
        if (!id) return '';
        return id.replace(/-/g, '');
    };

    const router = useRouter();
    const searchParams = useSearchParams();
    const { isRTL } = useLanguage();

    // ✅ Start with empty array for SSR consistency to prevent hydration mismatch
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cached accounts after hydration (client-side only)
    useEffect(() => {
        setIsHydrated(true);
        try {
            const cached = localStorage.getItem('cached_google_ads_accounts');
            if (cached) {
                const parsed = JSON.parse(cached);
                console.log('⚡ تحميل من الكاش:', parsed.length, 'حساب');
                setAccounts(parsed);
            }
        } catch (e) {
            console.warn('⚠️ فشل تحميل الكاش');
        }

        const initRefresh = async () => {
            console.log('🔄 Initial Page Load: Triggering auto-refresh...');
            // Wait a bit for hydration to settle
            await new Promise(r => setTimeout(r, 1000));
            syncStatusesFromGoogleAds();
        };

        if (typeof window !== 'undefined') {
            initRefresh();
        }
    }, []);

    const [loadingAccounts, setLoadingAccounts] = useState<Record<string, boolean>>({});
    const [pendingInvitations, setPendingInvitations] = useState<string[]>([]);
    const [pollingAccounts, setPollingAccounts] = useState<Record<string, boolean>>({}); // ✅ تتبع عمليات الفحص النشطة
    const pollingIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({}); // ✅ تخزين الـ intervals لمنع التكرار
    const syncingRef = useRef(false); // ✅ guard لمنع تكرار المزامنة المتوازية

    // دالة لاستطلاع حالة الحساب المحدد فقط (Single Account Polling)
    const startPollingForAcceptance = (customerId: string, isManualCheck: boolean = false) => {
        // ✅ منع تكرار الفحص لنفس الحساب إذا كان يعمل بالفعل
        if (pollingIntervalsRef.current[customerId]) {
            console.log(`⚠️ الفحص الذكي للحساب ${customerId} يعمل بالفعل - تخطي`);
            return;
        }

        console.log(`🚀 [POLLING] بدء نظام الفحص الذكي للحساب ${customerId} (manual: ${isManualCheck})`);

        // ✅ تخزين علامة فوراً لمنع التكرار
        pollingIntervalsRef.current[customerId] = -1 as unknown as NodeJS.Timeout;
        setPollingAccounts(prev => ({ ...prev, [customerId]: true }));

        // متغيرات الفحص
        let attempts = 0;
        const maxAttempts = isManualCheck ? 1 : 9; // محاولة واحدة فقط للفحص اليدوي
        const intervalTime = 20000; // 20 seconds

        // ✅ دالة الفحص الفعلية
        const doPolling = async () => {
            attempts++;
            console.log(`🔍 [POLLING] فحص ${attempts}/${maxAttempts} للحساب ${customerId}`);

            try {
                const response = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                    method: 'GET',
                    credentials: 'include',
                    signal: AbortSignal.timeout(15000)
                });

                if (response.ok) {
                    const data = await response.json();
                    const rawStatus = data.api_status || data.db_status || data.link_status || data.status;
                    const apiStatus = normalizeStatus(rawStatus);

                    console.log(`📊 [POLLING] الحساب ${customerId}: الحالة المستلمة (${rawStatus}) -> الحالة الموحدة (${apiStatus})`);

                    // ✅ ACTIVE = تم الربط بنجاح
                    if (apiStatus === 'ACTIVE' || apiStatus === 'ENABLED' || apiStatus === 'CONNECTED') {
                        console.log(`✅ [POLLING] تم الربط بنجاح! إيقاف النظام الآن.`);

                        // تحديث الواجهة فوراً قبل إيقاف الـ Polling لضمان الاستمرارية
                        setAccounts(prev => prev.map(acc =>
                            normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                                ? { ...acc, displayStatus: 'Connected', isLinkedToMCC: true, lastSync: new Date().toISOString() }
                                : acc
                        ));

                        setLinkNotification(null);
                        stopPolling();
                        return;
                    }

                    // ✅ REFUSED/CANCELLED/REJECTED = تم الرفض
                    if (apiStatus === 'REFUSED' || apiStatus === 'CANCELLED' || apiStatus === 'REJECTED') {
                        console.log(`❌ [POLLING] تم الرفض أو الإلغاء!`);

                        setAccounts(prev => prev.map(acc =>
                            normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                                ? { ...acc, displayStatus: 'Link Google Ads', isLinkedToMCC: false }
                                : acc
                        ));

                        setLinkNotification(null);
                        stopPolling();
                        return;
                    }

                    // 🔄 PENDING, NOT_LINKED, INACTIVE = الدعوة معلقة، الزر يبقى "Linking..."
                    // لا نغير الـ UI - نستمر في الفحص فقط
                    console.log(`⏳ [POLLING] الحالة ${apiStatus} - الزر يبقى Linking...`);
                }
            } catch (error) {
                console.warn(`⚠️ [POLLING] خطأ:`, error);
            }

            // ✅ Timeout check
            if (attempts >= maxAttempts) {
                console.log(`🛑 [POLLING] انتهى الوقت (${isManualCheck ? 'فحص يدوي' : '3 دقائق'})`);
                stopPolling();

                // ✅ إذا لم ينجح الفحص اليدوي، نعود لحالة Link كما طلب المستخدم
                // أما إذا كان فحصاً تلقائياً وانتهى الوقت، ننتقل لـ "Check Status"
                setAccounts(prev => prev.map(acc =>
                    normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                        ? { ...acc, displayStatus: isManualCheck ? 'Link Google Ads' : 'Pending' }
                        : acc
                ));

                return;
            }
        };

        // ✅ دالة إيقاف الفحص
        const stopPolling = () => {
            console.log(`🛑 [POLLING] إيقاف الفحص للحساب ${customerId}`);
            const intervalId = pollingIntervalsRef.current[customerId];
            if (intervalId && (intervalId as any) !== -1) {
                window.clearInterval(intervalId as unknown as number);
            }
            delete pollingIntervalsRef.current[customerId];
            setPollingAccounts(prev => ({ ...prev, [customerId]: false }));
        };

        // ✅ بدء الفحص الدوري
        if (isManualCheck) {
            console.log(`🔄 [POLLING] تنفيذ فحص يدوي فوري...`);
            doPolling();
        } else {
            console.log(`⏱️ [POLLING] بدء الفحص - أول فحص بعد ${intervalTime / 1000} ثانية`);
            const intervalId = window.setInterval(() => {
                console.log(`🔄 [POLLING] تنفيذ الفحص...`);
                doPolling();
            }, intervalTime);

            pollingIntervalsRef.current[customerId] = intervalId as unknown as NodeJS.Timeout;
            console.log(`✅ [POLLING] تم تخزين intervalId: ${intervalId}`);
        }
    };

    // ✅ دالة فحص إلغاء الربط (مشابهة لـ startPollingForAcceptance)
    const startPollingForUnlink = (customerId: string, isManualCheck: boolean = false) => {
        // منع تكرار الفحص
        if (pollingUnlinkIntervalsRef.current[customerId]) {
            console.log(`⚠️ [UNLINK POLLING] الفحص يعمل بالفعل للحساب ${customerId}`);
            return;
        }

        console.log(`🚀 [UNLINK POLLING] بدء نظام فحص إلغاء الربط للحساب ${customerId} (manual: ${isManualCheck})`);

        // تخزين علامة فوراً لمنع التكرار
        pollingUnlinkIntervalsRef.current[customerId] = -1 as unknown as NodeJS.Timeout;
        setPollingUnlinkAccounts(prev => ({ ...prev, [customerId]: true }));

        // متغيرات الفحص
        let attempts = 0;
        const maxAttempts = isManualCheck ? 1 : 9; // محاولة واحدة فقط للفحص اليدوي
        const intervalTime = 20000; // 20 seconds

        // ✅ دالة الفحص الفعلية
        const doPolling = async () => {
            attempts++;
            console.log(`🔍 [UNLINK POLLING] فحص ${attempts}/${maxAttempts} للحساب ${customerId}`);

            try {
                const response = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                    method: 'GET',
                    credentials: 'include',
                    signal: AbortSignal.timeout(15000)
                });

                if (response.ok) {
                    const data = await response.json();
                    const apiStatus = normalizeStatus(data.api_status || data.db_status || data.link_status);
                    const hasActive = data.has_active || data.is_effectively_linked === true;

                    console.log(`📊 [UNLINK POLLING] النتيجة: ${apiStatus}, hasActive: ${hasActive}`);

                    // ✅ تم إلغاء الربط بنجاح (الحالة لم تعد ACTIVE والمكون MCC يؤكد الانفصال)
                    if (apiStatus === 'NOT_LINKED' || apiStatus === 'REFUSED' || apiStatus === 'CANCELLED' || (!hasActive && apiStatus !== 'ACTIVE')) {
                        console.log(`✅ [UNLINK POLLING] تم إلغاء الربط بنجاح!`);

                        setAccounts(prev => prev.map(acc =>
                            normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                                ? { ...acc, displayStatus: 'Link Google Ads', isLinkedToMCC: false }
                                : acc
                        ));

                        setUnlinkNotification(null);
                        stopPolling();
                        return;
                    }
                }
            } catch (error) {
                console.warn(`⚠️ [UNLINK POLLING] خطأ:`, error);
            }

            // ✅ Timeout check
            if (attempts >= maxAttempts) {
                console.log(`🛑 [UNLINK POLLING] انتهى الوقت (${isManualCheck ? 'فحص يدوي' : '3 دقائق'})`);
                stopPolling();

                // ✅ إذا لم ينجح الفحص اليدوي لإلغاء الربط، نعود لحالة Disconnect كما طلب المستخدم
                // أما إذا كان فحصاً تلقائياً وانتهى الوقت، ننتقل لـ "Check Status"
                setAccounts(prev => prev.map(acc =>
                    normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                        ? { ...acc, displayStatus: isManualCheck ? 'Connected' : 'Pending', isLinkedToMCC: isManualCheck ? true : acc.isLinkedToMCC }
                        : acc
                ));

                return;
            }
        };

        // ✅ دالة إيقاف الفحص
        const stopPolling = () => {
            console.log(`🛑 [UNLINK POLLING] إيقاف الفحص للحساب ${customerId}`);
            const intervalId = pollingUnlinkIntervalsRef.current[customerId];
            if (intervalId && (intervalId as any) !== -1) {
                window.clearInterval(intervalId as unknown as number);
            }
            delete pollingUnlinkIntervalsRef.current[customerId];
            setPollingUnlinkAccounts(prev => ({ ...prev, [customerId]: false }));
        };

        // ✅ بدء الفحص الدوري
        if (isManualCheck) {
            console.log(`🔄 [UNLINK POLLING] تنفيذ فحص يدوي فوري...`);
            doPolling();
        } else {
            console.log(`⏱️ [UNLINK POLLING] بدء الفحص - أول فحص بعد ${intervalTime / 1000} ثانية`);
            const intervalId = window.setInterval(() => {
                console.log(`🔄 [UNLINK POLLING] تنفيذ فحص إلغاء الربط...`);
                doPolling();
            }, intervalTime);

            pollingUnlinkIntervalsRef.current[customerId] = intervalId as unknown as NodeJS.Timeout;
            console.log(`✅ [UNLINK POLLING] تم تخزين intervalId: ${intervalId}`);
        }
    };

    // حالات النظام
    const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const dataFetchedRef = useRef(false);

    // حالة الإشعار بعد إرسال طلب الربط
    const [linkNotification, setLinkNotification] = useState<{
        show: boolean;
        customerId: string;
        accountName: string;
    } | null>(null);

    // حالة إشعار الخطأ (للحسابات المعلقة أو المرتبطة بالفعل)
    const [errorNotification, setErrorNotification] = useState<{
        show: boolean;
        type: 'ACCOUNT_SUSPENDED' | 'ALREADY_LINKED' | 'PERMISSION_DENIED' | 'GENERAL_ERROR';
        customerId: string;
        message: string;
        messageEn?: string;
        helpUrl?: string;
    } | null>(null);

    // ✅ حالة إشعار إلغاء الربط
    const [unlinkNotification, setUnlinkNotification] = useState<{
        show: boolean;
        customerId: string;
        accountName: string;
    } | null>(null);
    const [pollingUnlinkAccounts, setPollingUnlinkAccounts] = useState<Record<string, boolean>>({});
    const pollingUnlinkIntervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

    // ✅ حالة للأزرار أثناء إرسال طلب الربط (Linking... أزرق)
    const [linkingAccounts, setLinkingAccounts] = useState<Record<string, boolean>>({});

    // ✅ Refs للإغلاق التلقائي للنوافذ بعد 3 دقائق
    const linkNotificationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const unlinkNotificationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // دالة إعداد Server-Sent Events للمزامنة الفورية
    const setupSSEConnection = () => {
        try {
            // إغلاق الاتصال السابق إذا كان موجوداً
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            console.log('🔄 إعداد اتصال Server-Sent Events للمزامنة الفورية...');

            // إنشاء اتصال SSE جديد
            const eventSource = new EventSource('/api/google-ads/account-status-stream');
            eventSourceRef.current = eventSource;

            // معالجة رسائل الاتصال
            eventSource.onopen = () => {
                console.log('✅ تم الاتصال بـ SSE stream بنجاح');
            };

            // معالجة تحديثات الحالة
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'connected') {
                        console.log('🔗 SSE:', data.message);
                    } else if (data.type === 'heartbeat') {
                        console.log('💓 SSE Heartbeat:', data.message);
                    } else if (data.type === 'status_update') {
                        const customerId = normalizeCustomerId(data.customer_id);
                        console.log(`🔄 تحديث فوري للحساب ${customerId}: ${data.status}`);

                        // تحديث الواجهة فوراً
                        let newDisplayStatus = '';
                        let newIsLinkedToMCC = false;

                        switch (data.status) {
                            case 'ACTIVE':
                                newDisplayStatus = 'Connected';
                                newIsLinkedToMCC = true;
                                break;
                            case 'PENDING':
                                newDisplayStatus = 'Pending';
                                newIsLinkedToMCC = false;
                                break;
                            case 'DISABLED':
                            case 'SUSPENDED':
                            case 'CUSTOMER_NOT_ENABLED':
                                newDisplayStatus = 'Connected (Inactive)';
                                newIsLinkedToMCC = true;
                                break;
                            case 'REJECTED':
                            case 'REFUSED':
                            case 'CANCELLED':
                            case 'NOT_LINKED':
                            default:
                                newDisplayStatus = 'Link Google Ads';
                                newIsLinkedToMCC = false;
                        }

                        // تحديث الحساب في الواجهة (الحفاظ على isDisabled)
                        setAccounts(prevAccounts => {
                            const updatedAccounts = prevAccounts.map(acc =>
                                normalizeCustomerId(acc.customerId) === customerId
                                    ? {
                                        ...acc,
                                        isLinkedToMCC: newIsLinkedToMCC,
                                        displayStatus: newDisplayStatus,
                                        isDisabled: acc.isDisabled, // الحفاظ على حالة التعطيل
                                        lastSync: data.updated_at
                                    }
                                    : acc
                            );

                            // التأكد من تحديث الحالة
                            console.log(`🔄 SSE Updated account ${customerId} status: ${newDisplayStatus} (linked: ${newIsLinkedToMCC}, isDisabled: ${prevAccounts.find(a => normalizeCustomerId(a.customerId) === customerId)?.isDisabled})`);

                            // التحقق من تحديث الحالة بعد التحديث
                            setTimeout(() => {
                                verifyAccountStatusUpdate(customerId, newDisplayStatus, newIsLinkedToMCC);
                            }, 100);

                            return updatedAccounts;
                        });

                        // لا توجد إشعارات للمستخدم - فقط logs في console
                        if (data.status === 'REJECTED' || data.status === 'REFUSED' || data.status === 'CANCELLED' || data.status === 'NOT_LINKED') {
                            if (data.status === 'NOT_LINKED') {
                                console.log(`🔄 العميل ألغى ربط الحساب ${customerId} من Google Ads Console`);
                            } else {
                                console.log(`❌ تم رفض دعوة الحساب ${customerId}`);
                            }
                        }

                        if (data.status === 'ACTIVE') {
                            console.log(`✅ تم قبول دعوة الحساب ${customerId}`);
                        }
                    } else if (data.type === 'error') {
                        console.error('❌ خطأ في SSE:', data.message);
                    }
                } catch (error) {
                    console.error('❌ خطأ في معالجة رسالة SSE:', error);
                }
            };

            // معالجة الأخطاء
            eventSource.onerror = (error) => {
                console.warn('⚠️ خطأ في اتصال SSE:', error);

                // التحقق من حالة الاتصال
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.log('🔄 اتصال SSE مغلق - إعادة المحاولة...');
                    // إعادة محاولة الاتصال بعد 2 ثانية
                    setTimeout(() => {
                        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
                            console.log('🔄 إعادة محاولة الاتصال بـ SSE...');
                            setupSSEConnection();
                        }
                    }, 2000);
                } else if (eventSource.readyState === EventSource.CONNECTING) {
                    console.log('🔄 محاولة الاتصال بـ SSE...');
                } else {
                    console.log('🔄 اتصال SSE في حالة غير متوقعة:', eventSource.readyState);
                }
            };

        } catch (error) {
            console.error('❌ خطأ في إعداد SSE:', error);
        }
    };

    // دالة مساعدة للتحقق من تحديث الحالة
    const verifyAccountStatusUpdate = (rawCustomerId: string, expectedStatus: string, expectedLinked: boolean) => {
        const customerId = normalizeCustomerId(rawCustomerId);
        const account = accounts.find(acc => normalizeCustomerId(acc.customerId) === customerId);
        if (account) {
            const statusMatch = account.displayStatus === expectedStatus;
            const linkedMatch = account.isLinkedToMCC === expectedLinked;

            if (statusMatch && linkedMatch) {
                console.log(`✅ Account ${customerId} status correctly updated: ${expectedStatus} (linked: ${expectedLinked})`);
                return true;
            } else {
                console.warn(`⚠️ Account ${customerId} status mismatch - Expected: ${expectedStatus} (${expectedLinked}), Actual: ${account.displayStatus} (${account.isLinkedToMCC})`);
                return false;
            }
        } else {
            console.warn(`⚠️ Account ${customerId} not found in accounts list`);
            return false;
        }
    };

    // دالة مزامنة حالة حساب واحد مع Google Ads API (سريعة ومباشرة)
    const syncSingleAccountStatus = async (rawCustomerId: string) => {
        const customerId = normalizeCustomerId(rawCustomerId);
        try {
            if (!customerId || customerId === 'undefined') {
                console.error('❌ Invalid customerId:', customerId);
                return false;
            }

            console.log(`🔄 تحديث حالة الحساب ${customerId}...`);

            // إظهار حالة التحميل للحساب المحدد فقط
            setLoadingAccounts(prev => ({ ...prev, [customerId]: true }));

            // استخدام API الاستكشاف (GET) بدلاً من المزامنة (POST) لأن الباك اند معطل جزئياً
            // وهذا الـ Endpoint تم تحديثه ليقوم بالحفظ في قاعدة البيانات أيضاً
            const response = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                method: 'GET',
                credentials: 'include',
                signal: AbortSignal.timeout(10000) // 10 seconds timeout
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`📊 نتيجة تحديث ${customerId}:`, data);

                const apiStatus = data.api_status || data.db_status;

                // تحديد الحالة الجديدة
                let newDisplayStatus = 'Link Google Ads';
                let newIsLinkedToMCC = false;

                switch (apiStatus) {
                    case 'ACTIVE':
                        newDisplayStatus = 'Connected';
                        newIsLinkedToMCC = true;
                        break;
                    case 'PENDING':
                        newDisplayStatus = 'Pending';
                        newIsLinkedToMCC = false;
                        break;
                    default:
                        newDisplayStatus = 'Link Google Ads';
                        newIsLinkedToMCC = false;
                }

                // تحديث الـ UI مباشرة (الحفاظ على isDisabled)
                setAccounts(prev => {
                    const updated = prev.map(acc => {
                        if (normalizeCustomerId(acc.customerId) === customerId) {
                            // إذا كانت الحالة الحالية Pending ولم يُرجع الباك‑إند ACTIVE أو PENDING صريحاً
                            // نحافظ على Pending (الطلب لا يزال معلقاً)
                            if (acc.displayStatus === 'Pending' && apiStatus !== 'ACTIVE' && apiStatus !== 'REJECTED' && apiStatus !== 'CANCELLED') {
                                console.log(`⏳ الحساب ${customerId} لا يزال في انتظار القبول - الإبقاء على Pending`);
                                return { ...acc, lastSync: new Date().toISOString(), isDisabled: acc.isDisabled };
                            }
                            return { ...acc, displayStatus: newDisplayStatus, isLinkedToMCC: newIsLinkedToMCC, isDisabled: acc.isDisabled, lastSync: new Date().toISOString() };
                        }
                        return acc;
                    });
                    localStorage.setItem('cached_google_ads_accounts', JSON.stringify(updated));
                    return updated;
                });

                console.log(`✅ تم تحديث ${customerId}: ${newDisplayStatus}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error(`❌ خطأ في تحديث ${customerId}:`, error);
            return false;
        } finally {
            setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
        }
    };

    // ⚠️ دالة syncAccountStatus القديمة - تم نقلها للأسفل (سطر 1320) لاستخدام Batch Refresh
    // const syncAccountStatus - MOVED TO LINE 1320
    const _legacySyncAccountStatus_DISABLED = async (customerId: string, showNotification: boolean = false) => {
        try {
            // التحقق من صحة customerId
            if (!customerId || customerId === 'undefined') {
                console.error('❌ Invalid customerId in syncAccountStatus:', customerId);
                return false;
            }

            console.log(`🔄 مزامنة حالة الحساب ${customerId}...`);

            // تم إزالة الفحص المتكرر التلقائي - التحديث يتم فقط عند الضغط على زر Refresh

            // تحديث timestamp فقط دون تغيير الحالة المرئية للمستخدم (الحفاظ على isDisabled)
            setAccounts(prevAccounts =>
                prevAccounts.map(acc =>
                    acc.customerId === customerId
                        ? {
                            ...acc,
                            isDisabled: acc.isDisabled,
                            lastSync: new Date().toISOString()
                        }
                        : acc
                )
            );

            // إظهار تأثير بصري للمزامنة
            const accountElement = document.querySelector(`[data-customer-id="${customerId}"]`);
            if (accountElement) {
                accountElement.classList.add('syncing-account');
            }

            // إضافة retry logic مع timeout
            let response;
            let retryCount = 0;
            const maxRetries = 2; // تقليل عدد المحاولات

            while (retryCount < maxRetries) {
                try {
                    // استخدام API الاستكشاف (GET) بدلاً من المزامنة (POST)
                    response = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                        method: 'GET',
                        credentials: 'include',
                        signal: AbortSignal.timeout(15000) // 15 seconds timeout
                    });
                    break; // نجحت المحاولة
                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ محاولة ${retryCount}/${maxRetries} فشلت:`, error);

                    if (retryCount >= maxRetries) {
                        throw error; // فشلت جميع المحاولات
                    }

                    // انتظار قبل المحاولة التالية
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

            if (response.ok) {
                const data = await response.json();

                if (data.success) {
                    console.log(`✅ تم مزامنة الحساب ${customerId}: ${data.db_status} → ${data.api_status}`);

                    // تحديث الواجهة فوراً (حتى لو لم تتغير الحالة)
                    let newDisplayStatus = '';
                    let newIsLinkedToMCC = false;

                    switch (data.api_status) {
                        case 'ACTIVE':
                            newDisplayStatus = 'Connected';
                            newIsLinkedToMCC = true;
                            break;
                        case 'PENDING':
                            newDisplayStatus = 'Pending';
                            newIsLinkedToMCC = false;
                            break;
                        case 'DISABLED':
                        case 'SUSPENDED':
                        case 'CUSTOMER_NOT_ENABLED':
                            newDisplayStatus = 'Connected (Inactive)';
                            newIsLinkedToMCC = true;
                            break;
                        case 'REJECTED':
                        case 'REFUSED':
                        case 'CANCELLED':
                        case 'NOT_LINKED':
                        default:
                            newDisplayStatus = 'Link Google Ads';
                            newIsLinkedToMCC = false;
                    }

                    // تحديث الواجهة فوراً مع تأثير بصري (الحفاظ على isDisabled)
                    setAccounts(prevAccounts => {
                        const updatedAccounts = prevAccounts.map(acc =>
                            acc.customerId === customerId
                                ? {
                                    ...acc,
                                    isLinkedToMCC: newIsLinkedToMCC,
                                    displayStatus: newDisplayStatus,
                                    isDisabled: acc.isDisabled,
                                    lastSync: new Date().toISOString()
                                }
                                : acc
                        );

                        // التأكد من تحديث الحالة
                        console.log(`🔄 Updated account ${customerId} status: ${newDisplayStatus} (linked: ${newIsLinkedToMCC}, isDisabled: ${prevAccounts.find(a => a.customerId === customerId)?.isDisabled})`);

                        // التحقق من تحديث الحالة بعد التحديث
                        setTimeout(() => {
                            verifyAccountStatusUpdate(customerId, newDisplayStatus, newIsLinkedToMCC);
                        }, 100);

                        return updatedAccounts;
                    });

                    // إظهار تأثير بصري للتحديث
                    const accountElement = document.querySelector(`[data-customer-id="${customerId}"]`);
                    if (accountElement) {
                        // إزالة تأثير المزامنة
                        accountElement.classList.remove('syncing-account');
                        // إضافة تأثير التحديث
                        accountElement.classList.add('updated-account');
                        setTimeout(() => {
                            accountElement.classList.remove('updated-account');
                        }, 2000);
                    }

                    if (data.status_changed) {
                        console.log(`🔄 تم اكتشاف تغيير في الحساب ${customerId}: ${newDisplayStatus} (${newIsLinkedToMCC ? 'مرتبط' : 'غير مرتبط'})`);

                        // لا توجد إشعارات للمستخدم
                    } else {
                        console.log(`ℹ️ الحساب ${customerId} محدث بالفعل: ${newDisplayStatus}`);

                        // لا توجد إشعارات للمستخدم
                    }

                    return true;
                }
            }

            // إزالة loading في نهاية الدالة
            setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));

            return false;
        } catch (error) {
            console.error(`❌ خطأ في مزامنة الحساب ${customerId}:`, error);

            // لا نحتاج لتغيير الحالة في حالة الخطأ لأننا لم نغيرها أصلاً

            // إزالة التأثير البصري للمزامنة في حالة الخطأ
            const accountElement = document.querySelector(`[data-customer-id="${customerId}"]`);
            if (accountElement) {
                accountElement.classList.remove('syncing-account');
            }

            // إزالة loading في حالة الخطأ
            setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));

            // معالجة أنواع مختلفة من الأخطاء
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.warn(`⚠️ مشكلة في الاتصال بالخادم للحساب ${customerId}`);
                if (showNotification) {
                    console.error(`⚠️ مشكلة في الاتصال بالخادم للحساب ${customerId} - يرجى المحاولة مرة أخرى.`);
                }
            } else if (error.name === 'AbortError') {
                console.warn(`⚠️ انتهت مهلة الطلب للحساب ${customerId}`);
                if (showNotification) {
                    console.error(`⚠️ انتهت مهلة الطلب للحساب ${customerId} - يرجى المحاولة مرة أخرى.`);
                }
            } else {
                console.error(`❌ خطأ غير متوقع للحساب ${customerId}:`, error);
                if (showNotification) {
                    console.error(`❌ خطأ غير متوقع للحساب ${customerId} - يرجى المحاولة مرة أخرى.`);
                }
            }

            return false;
        }
    };

    // دالة الاكتشاف التلقائي للحالات باستخدام المكتبة الرسمية
    const autoDiscoverAccountStatuses = async () => {
        if (!isAutoSyncEnabled) return;

        console.log('🔍 بدء الاكتشاف التلقائي لحالات الحسابات باستخدام Google Ads API...');

        try {
            let updatedCount = 0;

            // فحص جميع الحسابات (ليس فقط PENDING)
            for (const account of accounts) {
                const customerId = normalizeCustomerId(account.customerId);
                // مزامنة حالة الحساب أولاً
                const synced = await syncAccountStatus(customerId);
                if (synced) {
                    updatedCount++;
                    continue; // إذا تمت المزامنة، لا نحتاج للفحص الإضافي
                }

                // فحص الحالة من النظام الجديد
                const response = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success && data.status_changed) {
                        console.log(`🔄 تم اكتشاف تحديث: الحساب ${customerId}: ${data.previous_status} → ${data.status}`);

                        // تحديد حالة العرض الجديدة
                        let newDisplayStatus = '';
                        let newIsLinkedToMCC = false;

                        switch (data.status) {
                            case 'PENDING':
                                newDisplayStatus = 'Pending';
                                newIsLinkedToMCC = false;
                                break;
                            case 'ACTIVE':
                                newDisplayStatus = 'Connected';
                                newIsLinkedToMCC = true;
                                break;
                            case 'DISABLED':
                            case 'SUSPENDED':
                            case 'CUSTOMER_NOT_ENABLED':
                                newDisplayStatus = 'Connected (Inactive)';
                                newIsLinkedToMCC = true;
                                break;
                            case 'REJECTED':
                            case 'REFUSED':
                            case 'CANCELLED':
                            case 'NOT_LINKED':
                            default:
                                newDisplayStatus = 'Link Google Ads';
                                newIsLinkedToMCC = false;
                        }

                        // تحديث الواجهة فوراً (الحفاظ على isDisabled)
                        setAccounts(prevAccounts =>
                            prevAccounts.map(acc =>
                                normalizeCustomerId(acc.customerId) === customerId
                                    ? { ...acc, isLinkedToMCC: newIsLinkedToMCC, displayStatus: newDisplayStatus, isDisabled: acc.isDisabled }
                                    : acc
                            )
                        );

                        // إدارة قائمة المراقبة
                        if (data.status === 'ACTIVE') {
                            setPendingInvitations(prev => prev.filter(id => normalizeCustomerId(id) !== customerId));
                        } else if (data.status === 'PENDING') {
                            setPendingInvitations(prev =>
                                prev.some(id => normalizeCustomerId(id) === customerId) ? prev : [...prev, customerId]
                            );
                        }

                        updatedCount++;
                    }
                }
            }

            setLastSyncTime(new Date());

            if (updatedCount > 0) {
                console.log(`✅ تم تحديث ${updatedCount} حساب تلقائياً`);
            }

        } catch (error) {
            console.error('❌ خطأ في الاكتشاف التلقائي:', error);
        }
    };

    // تفعيل المزامنة التلقائية كل 30 ثانية (استدعاء Batch واحد للجميع)
    useEffect(() => {
        if (isAutoSyncEnabled && accounts.length > 0) {
            const interval = setInterval(() => {
                console.log('🔄 المزامنة التلقائية (Batch) - فحص جميع الحسابات...');
                // استدعاء Batch Refresh واحد بدلاً من N استدعاءات فردية
                syncStatusesFromGoogleAds();
                setLastSyncTime(new Date());
            }, 30000); // كل 30 ثانية

            return () => clearInterval(interval);
        }
    }, [isAutoSyncEnabled, accounts.length]); // نعتمد على length فقط لتجنب التكرار غير الضروري

    // Handle OAuth success
    useEffect(() => {
        const oauthSuccess = searchParams.get('oauth_success');
        const message = searchParams.get('message');

        if (oauthSuccess === 'true') {
            console.log('✅ OAuth completed successfully:', message);

            // استخدام HttpOnly cookies بدلاً من localStorage
            // يتم حفظ البيانات في cookies من خلال API routes
            console.log('💾 OAuth data saved in HttpOnly cookies by API routes');

            // Clear URL parameters
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('oauth_success');
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.toString());
            }

            // Wait a bit for cookies to be set, then fetch accounts
            setTimeout(() => {
                console.log('🔄 Fetching accounts after OAuth success...');
                fetchAccounts();
            }, 2000); // Wait 2 seconds for cookies to be properly set
        }
    }, [searchParams]);

    // دالة لجلب الحسابات من Google Ads API وحفظها في قاعدة البيانات فقط (بدون تحديث UI)
    const fetchAndSaveAccountsToDatabase = async () => {
        try {
            console.log('📥 جلب الحسابات من Google Ads API وحفظها في قاعدة البيانات...');

            // جلب الحسابات من Google Ads API باستخدام الـ Endpoint المحسن (Direct Proxy)
            const response = await fetch('/api/google-ads/accounts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('❌ فشل في جلب الحسابات من Google Ads API');
                return;
            }

            const data = await response.json();
            // استخدام "accounts" بدلاً من "google_ads" لأن الـ Endpoint الجديد يرجع { success: true, accounts: [...] }
            const customerAccounts = data.accounts || [];

            if (Array.isArray(customerAccounts) && customerAccounts.length > 0) {
                console.log(`📥 جلب ${customerAccounts.length} حساب من Google Ads API`);

                // حفظ كل حساب في قاعدة البيانات
                for (const account of customerAccounts) {
                    const customerId = normalizeCustomerId(account.customerId || account.id);
                    if (!customerId || customerId === 'undefined' || customerId === 'null') {
                        continue;
                    }

                    try {
                        const saveResponse = await fetch('/api/client-requests', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({
                                customer_id: customerId,
                                request_type: 'link_request',
                                account_name: account.name || `Account ${customerId}`,
                                status: 'NOT_LINKED', // الحالة الافتراضية للحسابات الجديدة
                                link_details: null
                            })
                        });

                        if (saveResponse.ok) {
                            console.log(`✅ تم حفظ الحساب ${customerId} في قاعدة البيانات`);
                        } else {
                            console.warn(`⚠️ فشل في حفظ الحساب ${customerId}:`, saveResponse.status);
                        }
                    } catch (error) {
                        console.warn(`⚠️ خطأ في حفظ الحساب ${customerId}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('❌ خطأ في جلب وحفظ الحسابات:', error);
        }
    };

    // دالة لجلب البيانات مباشرة من Supabase (مفلترة لكل مستخدم عبر API Next.js)
    const fetchAccountsFromSupabase = async () => {
        try {
            // إزالة setLoading
            console.log('📥 جلب الحسابات مباشرة من Supabase...');

            // استخدام API داخلي مفلتر بالمستخدم الحالي بدلاً من جلب كل العملاء من الباك‑إند
            const response = await fetch('/api/client-requests', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('❌ فشل في جلب client_requests من /api/client-requests:', response.status, response.statusText);
                return;
            }

            const result = await response.json();
            const allClientRequests: ClientRequest[] = Array.isArray(result.data) ? result.data : [];
            console.log('📋 جميع طلبات العملاء (حسب المستخدم الحالي) من Supabase:', allClientRequests);

            // تجميع السجلات حسب customer_id واختيار أحدث سجل لكل حساب
            const clientRequestsMap = new Map<string, ClientRequest>();
            allClientRequests.forEach((req: ClientRequest) => {
                const normalizedId = normalizeCustomerId(req.customer_id);
                const existing = clientRequestsMap.get(normalizedId);
                if (!existing || new Date(req.updated_at) > new Date(existing.updated_at)) {
                    clientRequestsMap.set(normalizedId, req);
                }
            });

            const clientRequests = Array.from(clientRequestsMap.values());
            console.log('📋 أحدث طلبات العملاء (مجمعة):', clientRequests);

            if (!clientRequests || clientRequests.length === 0) {
                console.log('ℹ️ لا توجد طلبات في قاعدة البيانات - جلب الحسابات من Google Ads API وحفظها');
                // إذا لم توجد طلبات في قاعدة البيانات، اجلب الحسابات من Google Ads API وحفظها
                await fetchAndSaveAccountsToDatabase();
                // إعادة جلب البيانات لنفس المستخدم الحالي فقط عبر API Next.js
                const updatedResponse = await fetch('/api/client-requests', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!updatedResponse.ok) {
                    console.error('❌ فشل في إعادة جلب client_requests بعد الحفظ:', updatedResponse.status, updatedResponse.statusText);
                    return;
                }

                const updatedResult = await updatedResponse.json();
                const updatedAllRequests: ClientRequest[] = Array.isArray(updatedResult.data) ? updatedResult.data : [];

                // تجميع السجلات حسب customer_id واختيار أحدث سجل لكل حساب
                const updatedRequestsMap = new Map<string, ClientRequest>();
                updatedAllRequests.forEach((req: ClientRequest) => {
                    const normalizedId = normalizeCustomerId(req.customer_id);
                    const existing = updatedRequestsMap.get(normalizedId);
                    if (!existing || new Date(req.updated_at) > new Date(existing.updated_at)) {
                        updatedRequestsMap.set(normalizedId, req);
                    }
                });

                const updatedRequests = Array.from(updatedRequestsMap.values());
                if (updatedRequests && updatedRequests.length > 0) {
                    console.log('✅ تم حفظ البيانات في قاعدة البيانات');
                    // معالجة البيانات المحفوظة من قاعدة البيانات فقط (بدون استدعاء Google Ads API)
                    // استدعاء Google Ads API يتم فقط عند الضغط على زر "Refresh"
                    const accountsFromSupabase = updatedRequests.map((req: ClientRequest) => {
                        let displayStatus = 'Link Google Ads';
                        let isLinkedToMCC = false;

                        // استخدام الحالة المحفوظة في قاعدة البيانات (بدون استدعاء Google Ads API)
                        // التحقق من link_details لمعرفة إذا كان الحساب معطّل
                        const linkDetails = req.link_details || {};
                        const isDisabledFromDB = linkDetails.is_disabled === true || linkDetails.needs_activation === true;

                        switch (req.status as string) {
                            case 'PENDING':
                                displayStatus = 'Pending';
                                isLinkedToMCC = false;
                                break;
                            case 'ACTIVE':
                                displayStatus = 'Connected';
                                isLinkedToMCC = true;
                                break;
                            case 'DISABLED':
                            case 'SUSPENDED':
                            case 'CUSTOMER_NOT_ENABLED':
                                displayStatus = 'Connected';
                                isLinkedToMCC = true;
                                break;
                            case 'REJECTED':
                            case 'REFUSED':
                            case 'CANCELLED':
                            case 'NOT_LINKED':
                            default:
                                displayStatus = 'Link Google Ads';
                                isLinkedToMCC = false;
                        }
                        console.log(`📋 الحالة المحفوظة للحساب ${req.customer_id}: ${displayStatus} (${req.status}), isDisabled=${isDisabledFromDB}`);

                        // استخدام القيم الافتراضية (بدون استدعاء Google Ads API)
                        const stats = { campaignsCount: 0, monthlySpend: 0 };
                        const isAccessible = true;
                        const accessErrorCode: string | null = null;
                        const accessMessage: string | null = null;

                        return {
                            id: req.customer_id,
                            customerId: req.customer_id,
                            name: req.account_name || `Account ${req.customer_id}`,
                            status: 'ENABLED' as const,
                            isTestAccount: false,
                            isManager: false,
                            accountType: 'REGULAR_ACCOUNT' as const,
                            isConnected: true,
                            isLinkedToMCC: isLinkedToMCC,
                            displayStatus: displayStatus,
                            isDisabled: isDisabledFromDB,
                            isAccessible,
                            accessErrorCode,
                            accessMessage,
                            linkDetails: req.link_details,
                            lastSync: req.updated_at || new Date().toISOString(),
                            campaignsCount: stats.campaignsCount,
                            monthlySpend: stats.monthlySpend,
                            details: {}
                        };
                    });

                    // فلترة الحسابات الصحيحة فقط وتطبيع المعرفات فوراً
                    const validAccounts = accountsFromSupabase.filter(acc =>
                        acc.customerId && acc.customerId !== 'undefined' && acc.customerId.trim() !== ''
                    ).map(acc => ({
                        ...acc,
                        customerId: normalizeCustomerId(acc.customerId)
                    }));

                    console.log('🎯 الحسابات النهائية من Supabase:', validAccounts);
                    console.log('📊 تفاصيل الحالات:', validAccounts.map(acc => ({
                        customerId: acc.customerId,
                        displayStatus: acc.displayStatus,
                        isLinkedToMCC: acc.isLinkedToMCC
                    })));
                    setAccounts(validAccounts);
                    // Cache accounts for instant loading next time
                    localStorage.setItem('cached_google_ads_accounts', JSON.stringify(validAccounts));
                    console.log('💾 Cached accounts to localStorage');
                }
            } else {
                // معالجة البيانات الموجودة من قاعدة البيانات فقط (بدون استدعاء Google Ads API)
                // استدعاء Google Ads API يتم فقط عند الضغط على زر "Refresh"
                const accountsFromSupabase = clientRequests.map((req: ClientRequest) => {
                    let displayStatus = 'Link Google Ads';
                    let isLinkedToMCC = false;

                    // التحقق من link_details لمعرفة إذا كان الحساب معطّل
                    const linkDetails = req.link_details || {};
                    const isDisabledFromDB = linkDetails.is_disabled === true || linkDetails.needs_activation === true;

                    // استخدام الحالة المحفوظة في قاعدة البيانات (بدون استدعاء Google Ads API)
                    switch (req.status as string) {
                        case 'PENDING':
                            displayStatus = 'Pending';
                            isLinkedToMCC = false;
                            break;
                        case 'ACTIVE':
                            displayStatus = 'Connected';
                            isLinkedToMCC = true;
                            break;
                        case 'DISABLED':
                        case 'SUSPENDED':
                        case 'CUSTOMER_NOT_ENABLED':
                            displayStatus = 'Connected';
                            isLinkedToMCC = true;
                            break;
                        case 'REJECTED':
                        case 'REFUSED':
                        case 'CANCELLED':
                        case 'NOT_LINKED':
                        default:
                            displayStatus = 'Link Google Ads';
                            isLinkedToMCC = false;
                    }
                    console.log(`📋 الحالة المحفوظة للحساب ${req.customer_id}: ${displayStatus} (${req.status}), isDisabled=${isDisabledFromDB}`);

                    // استخدام الإحصائيات المخزنة مؤقتاً أو القيم الافتراضية (بدون استدعاء Google Ads API)
                    // الإحصائيات الفعلية تُجلب فقط عند الضغط على زر "Refresh"
                    let stats = { campaignsCount: 0, monthlySpend: 0 };
                    let isAccessible = true;
                    let accessErrorCode: string | null = null;
                    let accessMessage: string | null = null;

                    // محاولة قراءة الإحصائيات من الكاش المحلي
                    try {
                        const cachedStats = localStorage.getItem(`account_stats_${req.customer_id}`);
                        if (cachedStats) {
                            const parsed = JSON.parse(cachedStats);
                            stats = {
                                campaignsCount: parsed.campaignsCount || 0,
                                monthlySpend: parsed.monthlySpend || 0
                            };
                            isAccessible = parsed.isAccessible !== false;
                            accessErrorCode = parsed.accessErrorCode || null;
                            accessMessage = parsed.accessMessage || null;
                        }
                    } catch (e) {
                        console.warn(`⚠️ فشل في قراءة الإحصائيات المخزنة للحساب ${req.customer_id}`);
                    }

                    return {
                        id: normalizeCustomerId(req.customer_id),
                        customerId: normalizeCustomerId(req.customer_id),
                        name: req.account_name || `Account ${req.customer_id}`,
                        status: 'ENABLED' as const,
                        isTestAccount: false,
                        isManager: false,
                        accountType: 'REGULAR_ACCOUNT' as const,
                        isConnected: true,
                        isLinkedToMCC: isLinkedToMCC,
                        displayStatus: displayStatus,
                        isDisabled: isDisabledFromDB,
                        isAccessible,
                        accessErrorCode,
                        accessMessage,
                        linkDetails: req.link_details,
                        lastSync: req.updated_at || new Date().toISOString(),
                        campaignsCount: stats.campaignsCount,
                        monthlySpend: stats.monthlySpend,
                        details: {}
                    };
                });

                // فلترة الحسابات الصحيحة فقط
                const validAccounts = accountsFromSupabase.filter(acc =>
                    acc.customerId && acc.customerId !== 'undefined' && acc.customerId.trim() !== ''
                );

                console.log('🎯 الحسابات النهائية من Supabase:', validAccounts);
                console.log('📊 تفاصيل الحالات:', validAccounts.map(acc => ({
                    customerId: acc.customerId,
                    displayStatus: acc.displayStatus,
                    isLinkedToMCC: acc.isLinkedToMCC,
                    isDisabled: acc.isDisabled
                })));
                setAccounts(validAccounts);
                // Cache accounts for instant loading next time
                localStorage.setItem('cached_google_ads_accounts', JSON.stringify(validAccounts));
                console.log('💾 Cached accounts to localStorage');
            }

        } catch (error) {
            console.error('❌ خطأ في جلب الحسابات من Supabase:', error);
        } finally {
            // إزالة setLoading
        }
    };

    // دالة للتحديث التلقائي من قاعدة البيانات
    const startAutoRefresh = () => {
        if (autoRefreshIntervalRef.current) {
            clearInterval(autoRefreshIntervalRef.current);
        }

        console.log('🔄 بدء التحديث التلقائي من Supabase...');
        setAutoRefreshEnabled(true);

        // تحديث البيانات كل 5 دقائق من Supabase (تقليل الطلبات)
        autoRefreshIntervalRef.current = setInterval(async () => {
            console.log('🔄 تحديث تلقائي - جلب البيانات من Supabase');
            await fetchAccountsFromSupabase();
        }, 300000); // كل 5 دقائق
    };

    const stopAutoRefresh = () => {
        if (autoRefreshIntervalRef.current) {
            clearInterval(autoRefreshIntervalRef.current);
            autoRefreshIntervalRef.current = null;
        }
        setAutoRefreshEnabled(false);
        console.log('⏹️ تم إيقاف التحديث التلقائي');
    };

    // دالة مزامنة الحالات من Supabase (تُستدعى عند الضغط على زر Refresh)
    // ✅ محسّنة: استدعاء واحد batch بدلاً من N استدعاءات
    const syncStatusesFromGoogleAds = async () => {
        if (syncingRef.current) {
            console.log('⚠️ المزامنة جارية بالفعل - تخطي الطلب المكرر');
            return;
        }

        try {
            syncingRef.current = true;
            setSyncing(true);
            console.log('🔄 بدء مزامنة الحالات (Smart Batch)...');

            // استدعاء واحد فقط لجلب كل الحسابات من Supabase + Live Status from Flask
            const batchResponse = await fetch('/api/google-ads/batch-refresh-statuses?forceRefresh=true', {
                method: 'GET',
                credentials: 'include',
                signal: AbortSignal.timeout(30000) // 30 seconds timeout (Flask may take time)
            });

            if (!batchResponse.ok) {
                console.error('❌ Batch refresh failed:', batchResponse.status);
                throw new Error(`Batch refresh failed: ${batchResponse.status}`);
            }

            const batchData = await batchResponse.json();
            console.log(`✅ Batch refresh success: ${batchData.totalAccounts} accounts, ${batchData.connectedCount} connected`);

            if (batchData.success && batchData.accounts) {
                // تحديث جميع الحسابات دفعة واحدة
                const updatedStatuses: { [key: string]: { displayStatus: string; isLinkedToMCC: boolean; isDisabled?: boolean } } = {};

                for (const accountData of batchData.accounts) {
                    const rawCustomerId = accountData.customerId;
                    const customerId = normalizeCustomerId(rawCustomerId);
                    const status = accountData.status || 'NOT_LINKED';
                    const isConnected = accountData.isConnected;
                    const linkDetails = accountData.linkDetails || {};
                    const isDisabled = linkDetails.is_disabled === true || linkDetails.needs_activation === true;

                    let newDisplayStatus = 'Link Google Ads';
                    let newIsLinkedToMCC = false;

                    switch (status) {
                        case 'ACTIVE':
                        case 'LINKED':
                        case 'ENABLED':
                            newDisplayStatus = 'Connected';
                            newIsLinkedToMCC = true;
                            break;
                        case 'PENDING':
                            newDisplayStatus = 'Pending';
                            newIsLinkedToMCC = false;
                            // ✅ إذا كانت الحالة PENDING، نتركها كما هي ليتعامل معها نظام الـ Polling
                            break;
                        case 'SUSPENDED':
                        case 'DISABLED':
                            newDisplayStatus = 'Connected (Inactive)';
                            newIsLinkedToMCC = true;
                            break;
                        case 'REJECTED':
                        case 'REFUSED':
                        case 'CANCELLED':
                        case 'NOT_LINKED':
                        default:
                            newDisplayStatus = 'Link Google Ads';
                            newIsLinkedToMCC = false;
                    }

                    // ✅ التحقق مما إذا كان الحساب يخضع حالياً لعملية ربط أو إلغاء ربط نشطة
                    // إذا كان الأمر كذلك، نتجاهل تحديث الحالة من الـ Sync لنسمح للـ Polling بالتحكم
                    const isSystemBusyWithAccount = linkingAccounts[customerId] || pollingAccounts[customerId] || pollingUnlinkAccounts[customerId];

                    if (isSystemBusyWithAccount) {
                        console.log(`🛡️ [SYNC GUARD] الحساب ${customerId} مشغول بعملية نشطة - تخطي تحديث الحالة للحفاظ على ثبات الواجهة`);
                        continue;
                    }

                    updatedStatuses[customerId] = { displayStatus: newDisplayStatus, isLinkedToMCC: newIsLinkedToMCC, isDisabled };
                    console.log(`📊 ${customerId} (normalized): ${status} → ${newDisplayStatus} (linked: ${newIsLinkedToMCC})`);
                }

                // تحديث الواجهة دفعة واحدة
                setAccounts(prevAccounts => {
                    const updated = prevAccounts.map(acc => {
                        const normalizedAccId = normalizeCustomerId(acc.customerId);
                        const newStatus = updatedStatuses[normalizedAccId];
                        if (newStatus) {
                            return {
                                ...acc,
                                displayStatus: newStatus.displayStatus,
                                isLinkedToMCC: newStatus.isLinkedToMCC,
                                isDisabled: newStatus.isDisabled,
                                lastSync: new Date().toISOString()
                            };
                        }
                        return acc;
                    });
                    localStorage.setItem('cached_google_ads_accounts', JSON.stringify(updated));
                    return updated;
                });

                setLastSyncTime(new Date());
                console.log(`✅ تم تحديث ${Object.keys(updatedStatuses).length} حساب`);
            }

        } catch (error) {
            console.error('❌ خطأ في المزامنة:', error);
        } finally {
            syncingRef.current = false;
            setSyncing(false);
        }
    };

    // دالة مزامنة حساب واحد (للتوافق مع الكود القديم)
    const syncAccountStatus = async (customerId: string, showNotification: boolean = false) => {
        console.log(`🔄 Sync single account ${customerId}...`);
        // استدعاء الـ batch refresh بدلاً من استدعاء فردي
        await syncStatusesFromGoogleAds();
        return true;
    };

    // Fetch accounts - يستخدم البيانات المحفوظة في Supabase أولاً
    // لتحديث البيانات من Google Ads API، استخدم زر "Refresh"
    const fetchAccounts = async () => {
        try {
            console.log('📥 Fetching accounts (using Supabase data)...');

            // Check cookies first (faster check)
            const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
            console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);

            if (!hasGoogleAdsConnected) {
                console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
                if (typeof window !== 'undefined') {
                    window.location.href = '/integrations';
                }
                return;
            }

            // جلب البيانات من Supabase أولاً (بدون استدعاء Google Ads API)
            await fetchAccountsFromSupabase();

            console.log('✅ Accounts loaded from Supabase');
            console.log('ℹ️ To update from Google Ads API, use the Refresh button');

        } catch (error) {
            console.error('❌ Error fetching accounts:', error);
        }
    };

    // Fetch accounts from Google Ads API (يُستدعى فقط عند الحاجة)
    const fetchAccountsFromGoogleAdsAPI = async () => {
        try {
            console.log('📥 Fetching customer accounts from Google Ads API...');
            console.log('🔍 Current accounts state:', accounts.length);

            // Check cookies first (faster check)
            const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
            console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);

            if (!hasGoogleAdsConnected) {
                console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
                if (typeof window !== 'undefined') {
                    window.location.href = '/integrations';
                }
                return;
            }

            // Try to refresh token if needed
            console.log('🔄 Attempting to refresh token if needed...');
            try {
                const refreshResponse = await fetch('/api/oauth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (refreshResponse.ok) {
                    console.log('✅ Token refreshed successfully');
                } else {
                    console.warn('⚠️ Token refresh failed, but continuing with existing token');
                }
            } catch (refreshError) {
                console.warn('⚠️ Token refresh error, but continuing:', refreshError);
            }

            // Check cookies (note: httpOnly cookies won't show here)
            console.log('🔍 Checking cookies:', {
                hasGoogleAdsConnected: document.cookie.includes('google_ads_connected=true'),
                allCookies: document.cookie,
                note: 'HttpOnly cookies (oauth tokens) are secure and not accessible via JavaScript'
            });

            // First, get accounts from the customer's OAuth session (not all MCC accounts)
            // استخدام Endpoint المحسن (Direct Proxy)
            const response = await fetch('/api/google-ads/accounts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // ضروري لإرسال cookies
            });

            console.log('📊 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();

                console.error('❌ API Error:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📊 Customer OAuth API Response:', data);

            // Handle the new API response format (customer's accounts from OAuth)
            // استخدام "accounts" بدلاً من "google_ads"
            const customerAccounts = data.accounts || [];
            if (Array.isArray(customerAccounts) && customerAccounts.length > 0) {
                console.log(`📥 FETCH-ACCOUNTS: Got ${customerAccounts.length} customer accounts from OAuth`);

                const accountsWithStats = await Promise.all(
                    customerAccounts.map(async (account: any) => {
                        try {
                            // Validate customerId (API returns 'id' field, not 'customerId')
                            const rawCustomerId = account.customerId || account.id;
                            const customerId = normalizeCustomerId(rawCustomerId);
                            if (!customerId || customerId === 'undefined' || customerId === 'null') {
                                console.warn(`⚠️ Invalid customerId for account:`, account);
                                return null;
                            }

                            // Check account statistics using Next.js API + حالة إمكانية الوصول
                            const statsResponse = await fetch(`/api/google-ads/accounts/${customerId}/stats`);
                            let stats = { campaignsCount: 0, monthlySpend: 0 };
                            let isAccessible = true;
                            let accessErrorCode: string | null = null;
                            let accessMessage: string | null = null;

                            if (statsResponse.ok) {
                                const statsData = await statsResponse.json();
                                if (statsData.success) {
                                    stats = {
                                        campaignsCount: statsData.summary?.total_campaigns || 0,
                                        monthlySpend: statsData.summary?.total_cost_currency || 0
                                    };
                                } else if (statsData.error === 'ACCOUNT_NOT_ACCESSIBLE') {
                                    // الحساب غير قابل للوصول من MCC الحالي حسب Google Ads API
                                    isAccessible = false;
                                    accessErrorCode = statsData.error;
                                    accessMessage = statsData.message || 'This Google Ads account is not accessible from the current MCC or is not enabled.';
                                }
                            } else if (statsResponse.status === 401) {
                                const errorData = await statsResponse.json();
                                if (errorData.error_type === 'OAUTH_REAUTH_REQUIRED' && errorData.redirect_to_auth) {
                                    console.warn(`⚠️ OAuth re-authentication required for account ${customerId}`);
                                    // يمكن إضافة إعادة توجيه للمصادقة هنا إذا لزم الأمر
                                }
                            }

                            // جلب الحالة الفعلية من Google Ads API مباشرة
                            console.log(`🔍 Fetching real-time status from Google Ads API for account ${customerId}...`);

                            let displayStatus = 'Link Google Ads';
                            let isLinkedToMCC = false;
                            let linkDetails = null;

                            // استدعاء API للمزامنة المباشرة مع Google Ads API مع retry
                            try {
                                let syncResponse;
                                let retryCount = 0;
                                const maxRetries = 2;

                                while (retryCount < maxRetries) {
                                    try {
                                        syncResponse = await fetch(`/api/google-ads/discover-account-status/${customerId}`, {
                                            method: 'GET',
                                            credentials: 'include',
                                            signal: AbortSignal.timeout(10000) // 10 seconds timeout
                                        });
                                        break; // نجحت المحاولة
                                    } catch (error) {
                                        retryCount++;
                                        console.warn(`⚠️ محاولة ${retryCount}/${maxRetries} فشلت للحساب ${customerId}:`, error);

                                        if (retryCount >= maxRetries) {
                                            throw error; // فشلت جميع المحاولات
                                        }

                                        // انتظار قبل المحاولة التالية
                                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                                    }
                                }

                                if (syncResponse.ok) {
                                    const syncData = await syncResponse.json();
                                    console.log(`📊 Google Ads API sync for ${customerId}:`, syncData);

                                    if (syncData.success) {
                                        linkDetails = syncData.link_details;

                                        // تحديد الحالة بناءً على Google Ads API
                                        switch (syncData.api_status) {
                                            case 'PENDING':
                                                displayStatus = 'Pending';
                                                isLinkedToMCC = false;
                                                break;
                                            case 'ACTIVE':
                                                displayStatus = 'Connected';
                                                isLinkedToMCC = true;
                                                break;
                                            case 'DISABLED':
                                            case 'SUSPENDED':
                                            case 'CUSTOMER_NOT_ENABLED':
                                                displayStatus = 'Connected (Inactive)';
                                                isLinkedToMCC = true;
                                                break;
                                            case 'REJECTED':
                                            case 'REFUSED':
                                            case 'CANCELLED':
                                            case 'NOT_LINKED':
                                            default:
                                                displayStatus = 'Link Google Ads';
                                                isLinkedToMCC = false;
                                                break;
                                        }

                                        console.log(`✅ Updated status for ${customerId}: ${displayStatus} (${syncData.api_status})`);
                                    } else {
                                        console.warn(`⚠️ Google Ads API sync failed for ${customerId}:`, syncData.error);
                                    }
                                } else {
                                    console.warn(`⚠️ Failed to sync with Google Ads API for ${customerId}:`, syncResponse.status);
                                }
                            } catch (error) {
                                console.warn(`⚠️ Error syncing with Google Ads API for ${customerId}:`, error);
                            }

                            return {
                                id: customerId,
                                customerId: customerId,
                                name: account.name || `Account ${customerId}`,
                                status: account.status || 'ENABLED', // ENABLED, SUSPENDED, CANCELLED from real API
                                isTestAccount: account.isTestAccount || false,
                                isConnected: true,
                                isLinkedToMCC: isLinkedToMCC,
                                displayStatus: displayStatus,
                                isAccessible,
                                accessErrorCode,
                                accessMessage,
                                linkDetails: linkDetails, // Real-time link information
                                lastSync: new Date().toISOString(),
                                campaignsCount: stats.campaignsCount,
                                monthlySpend: stats.monthlySpend,
                                details: account.details || {}
                            };
                        } catch (error) {
                            const rawCustomerId = account.customerId || account.id;
                            const customerId = normalizeCustomerId(rawCustomerId);
                            console.log(`⚠️ Error processing account ${customerId}:`, error);
                            return {
                                id: customerId,
                                customerId: customerId,
                                name: account.name || `Account ${customerId}`,
                                status: account.status || 'ENABLED',
                                isConnected: true,
                                isLinkedToMCC: false,
                                displayStatus: 'Link Google Ads',
                                lastSync: new Date().toISOString(),
                                campaignsCount: 0,
                                monthlySpend: 0
                            };
                        }
                    })
                );

                // Filter out null accounts and invalid customerIds
                const validAccounts = accountsWithStats.filter(account =>
                    account !== null &&
                    account.customerId &&
                    account.customerId !== 'undefined' &&
                    account.customerId.trim() !== ''
                );
                console.log('🔍 Setting accounts state with:', validAccounts);
                console.log('🔍 Account names:', validAccounts.map(acc => ({ id: acc.customerId, name: acc.name, status: acc.displayStatus })));

                // التأكد من تحديث الحالة
                validAccounts.forEach(acc => {
                    console.log(`🔄 Setting account ${acc.customerId} status: ${acc.displayStatus} (linked: ${acc.isLinkedToMCC})`);
                });

                setAccounts(validAccounts);
                // Cache accounts for instant loading next time
                localStorage.setItem('cached_google_ads_accounts', JSON.stringify(validAccounts));
                console.log('💾 Cached accounts to localStorage');

                // تحديث قائمة الانتظار بناءً على قاعدة البيانات فقط
                const pendingAccounts = validAccounts.filter(acc =>
                    acc.displayStatus === 'Pending'
                );
                setPendingInvitations(pendingAccounts.map(acc => acc.customerId));
                console.log('📋 Updated pending invitations:', pendingAccounts.map(acc => acc.customerId));

                // لا نحتاج التحديث التلقائي - نعتمد على Real-time subscriptions فقط
                console.log('✅ البيانات محملة - نعتمد على Real-time subscriptions من Supabase');

                console.log(`✅ Processed ${validAccounts.length} valid customer accounts`);
                console.log('🔍 Final accounts state should be:', validAccounts.length);
            } else {
                console.log('ℹ️ No customer accounts found after OAuth - customer may not have Google Ads accounts');
                console.log('📊 Full API response:', JSON.stringify(data, null, 2));
                setAccounts([]);
            }
        } catch (error) {
            console.error('❌ Error fetching accounts from official API:', error);
            setAccounts([]);
        } finally {
            // إزالة setLoading
        }
    };

    useEffect(() => {
        // ✅ منع التحميل المتكرر
        if (dataFetchedRef.current) return;

        console.log('🔄 Component mounted - accounts from cache:', accounts.length);

        // Check cookies first (faster check)
        const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');

        if (!hasGoogleAdsConnected) {
            console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
            window.location.href = '/integrations';
            return;
        }

        dataFetchedRef.current = true;

        // ✅ إذا كان هناك حسابات مخزنة، نعرضها فوراً ونتحقق في الخلفية
        // التحقق من المستخدم في الخلفية بدون حظر العرض
        const verifyAndLoadData = async () => {
            try {
                const response = await fetch('/api/oauth/user-info');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        const currentUserId = data.user.id;
                        const currentUserEmail = data.user.email;

                        // التحقق السريع من تطابق المستخدم
                        const cachedUserInfo = localStorage.getItem('oauth_user_info');
                        let shouldRefresh = false;

                        if (cachedUserInfo) {
                            try {
                                const parsed = JSON.parse(cachedUserInfo);
                                // إذا تغير المستخدم، نمسح الكاش ونجلب من جديد
                                if (parsed.id !== currentUserId || parsed.email !== currentUserEmail) {
                                    console.log('🔄 User changed! Clearing cache...');
                                    localStorage.removeItem('cached_google_ads_accounts');
                                    setAccounts([]);
                                    shouldRefresh = true;
                                }
                            } catch (e) {
                                shouldRefresh = true;
                            }
                        } else {
                            shouldRefresh = true;
                        }

                        // حفظ معلومات المستخدم
                        localStorage.setItem('oauth_user_info', JSON.stringify(data.user));
                        localStorage.setItem('userEmail', currentUserEmail);

                        // جلب البيانات الجديدة فقط إذا لزم الأمر أو لا توجد حسابات
                        if (shouldRefresh || accounts.length === 0) {
                            await fetchAccountsFromSupabase();
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error verifying user:', error);
                // في حالة الخطأ، نحاول جلب البيانات إذا لم تكن موجودة
                if (accounts.length === 0) {
                    await fetchAccountsFromSupabase();
                }
            }
        };

        // تشغيل التحقق في الخلفية بدون حظر العرض
        verifyAndLoadData();

        // ✅ تأخير إعداد الاتصالات حتى لا تؤثر على سرعة التحميل الأولي
        let subscription: { unsubscribe: () => void } = { unsubscribe: () => { } };
        const setupConnections = setTimeout(() => {
            // إعداد Server-Sent Events للمزامنة الفورية
            setupSSEConnection();

            // الاشتراك في التحديثات الفورية من Supabase
            subscription = subscribeToClientRequests((payload) => {
                console.log('🔄 تحديث فوري من Supabase:', payload);
                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    console.log('📥 تحديث البيانات بسبب تغيير في قاعدة البيانات');
                    fetchAccountsFromSupabase();
                }
            });
        }, 1000); // تأخير ثانية واحدة

        // Cleanup عند إلغاء تحميل المكون
        return () => {
            clearTimeout(setupConnections);
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
            // إلغاء الاشتراك في التحديثات الفورية
            subscription.unsubscribe();
            // إغلاق اتصال SSE
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log('🔌 تم إغلاق اتصال SSE');
            }
        };
    }, []);

    // Cleanup عند إلغاء تحميل المكون
    useEffect(() => {
        return () => {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
                console.log('🧹 تنظيف التحديث التلقائي عند إلغاء تحميل المكون');
            }
        };
    }, []);

    // تم إيقاف التحديث التلقائي - نعتمد على Real-time subscriptions فقط
    useEffect(() => {
        console.log('ℹ️ التحديث التلقائي معطل - نعتمد على Real-time subscriptions من Supabase');
    }, [pendingInvitations.length]);

    // Monitor accounts state changes
    useEffect(() => {
        console.log('🔍 Accounts state changed:', {
            count: accounts.length,
            accounts: accounts.map(acc => ({ id: acc.id, name: acc.name }))
        });
    }, [accounts]);

    // Function to check invitation acceptance/rejection
    const checkForAcceptedLinks = async () => {
        try {
            console.log('🔍 Checking invitation status for pending accounts...');

            const pending = pendingInvitations;

            if (pending.length === 0) {
                console.log('ℹ️ No pending invitations to check.');
                return;
            }

            console.log(`📋 Checking ${pending.length} pending accounts:`, pending);

            let acceptedCount = 0;
            let rejectedCount = 0;

            // Check each pending account from Next.js API
            for (const customerId of pending) {
                try {
                    console.log(`🔍 Checking ${customerId} using official API...`);

                    const response = await fetch(`/api/oauth/link-account`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customer_id: customerId, check_only: true })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(`📊 Status response for ${customerId}:`, data);

                        if (data.success && data.status === 'ACTIVE') {
                            // Invitation accepted ✅
                            console.log(`✅ Account ${customerId} was accepted!`);
                            acceptedCount++;

                            // Update UI immediately (الحفاظ على isDisabled)
                            setAccounts(prevAccounts =>
                                prevAccounts.map(acc =>
                                    normalizeCustomerId(acc.customerId) === customerId
                                        ? { ...acc, isLinkedToMCC: true, displayStatus: 'Connected', isDisabled: acc.isDisabled }
                                        : acc
                                )
                            );
                        } else if (data.success && data.status === 'PENDING') {
                            // Still pending - فحص إضافي للكشف عن الرفض
                            console.log(`⏳ Account ${customerId} is still pending approval`);

                            // فحص إضافي: إذا كان الحساب في PENDING لأكثر من 30 ثانية، فحص مرة أخرى
                            const account = accounts.find(acc => normalizeCustomerId(acc.customerId) === customerId);
                            if (account) {
                                const accountCreated = new Date(account.lastSync || Date.now());
                                const timeSinceCreated = Date.now() - accountCreated.getTime();
                                const thirtySeconds = 30 * 1000; // 30 ثانية

                                if (timeSinceCreated > thirtySeconds) {
                                    console.log(`🔄 Account ${customerId} in PENDING for more than 30 seconds - checking for rejection`);

                                    // فحص إضافي بعد 1 ثانية
                                    setTimeout(() => {
                                        syncAccountStatus(customerId, true);
                                    }, 1000);
                                }
                            }
                        } else if (data.success && (data.status === 'REJECTED' || data.status === 'REFUSED')) {
                            // Invitation rejected ❌
                            console.log(`❌ Account ${customerId} invitation was ${data.status.toLowerCase()}`);
                            rejectedCount++;

                            // Update UI to show "Link Google Ads" (إزالة isDisabled لأن الحساب غير مرتبط)
                            setAccounts(prevAccounts =>
                                prevAccounts.map(acc =>
                                    normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                                        ? { ...acc, isLinkedToMCC: false, displayStatus: 'Link Google Ads', isDisabled: false }
                                        : acc
                                )
                            );
                        } else if (data.success && (data.status === 'CANCELLED' || data.status === 'NOT_LINKED')) {
                            // Invitation cancelled or not linked ❌
                            console.log(`❌ Account ${customerId} invitation was ${data.status.toLowerCase()}`);
                            rejectedCount++;

                            // Update UI to show "Link Google Ads" (إزالة isDisabled لأن الحساب غير مرتبط)
                            setAccounts(prevAccounts =>
                                prevAccounts.map(acc =>
                                    normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId)
                                        ? { ...acc, isLinkedToMCC: false, displayStatus: 'Link Google Ads', isDisabled: false }
                                        : acc
                                )
                            );
                        }
                    } else {
                        console.log(`⚠️ Could not check ${customerId}: ${response.status}`);
                    }

                } catch (checkError) {
                    console.log(`❌ Error checking ${customerId}:`, checkError);
                }
            }

            // Update pending invitations list
            const updatedPending = accounts.filter(acc => acc.displayStatus === 'Pending').map(acc => acc.customerId);
            setPendingInvitations(updatedPending);

            // Show results
            let message = '🔄 Status check complete!\n\n';

            if (acceptedCount > 0) {
                message += `✅ ${acceptedCount} account(s) now show "Connected"\n`;
            }

            if (rejectedCount > 0) {
                message += `❌ ${rejectedCount} invitation(s) were rejected/expired\n`;
            }

            if (updatedPending.length > 0) {
                message += `⏳ ${updatedPending.length} invitation(s) still pending\n`;
            }

            if (acceptedCount === 0 && rejectedCount === 0) {
                message += 'ℹ️ No changes detected. Some invitations may need more time.';
            }

            console.log(message);

        } catch (error) {
            console.log('❌ Error checking invitation status:', error);
            console.error('❌ Error checking invitation status. Please try again.');
        }
    };

    // ✅ دالة إلغاء ربط الحساب من MCC
    const handleUnlinkFromMCC = async (customerId: string, accountName: string) => {
        try {
            if (!customerId || customerId === 'undefined') {
                console.error('❌ Invalid customerId in handleUnlinkFromMCC:', customerId);
                return;
            }

            console.log('🔓 Starting unlink process for:', { customerId, accountName });

            // إلغاء أي timer سابق
            if (unlinkNotificationTimerRef.current) {
                clearTimeout(unlinkNotificationTimerRef.current);
            }

            // عرض نافذة إلغاء الربط مع التعليمات
            setUnlinkNotification({
                show: true,
                customerId: customerId,
                accountName: accountName || customerId
            });

            // بدء فحص حالة إلغاء الربط
            startPollingForUnlink(customerId);

            // ✅ إغلاق النافذة تلقائياً بعد 3 دقائق
            unlinkNotificationTimerRef.current = setTimeout(() => {
                console.log('⏰ Auto-closing unlink notification after 3 minutes');
                setUnlinkNotification(null);
            }, 180000); // 3 دقائق

        } catch (error) {
            console.error('❌ Error in handleUnlinkFromMCC:', error);
        }
    };

    const handleLinkToMCC = async (customerId: string, accountName: string) => {
        try {
            // التحقق من صحة customerId
            if (!customerId || customerId === 'undefined') {
                console.error('❌ Invalid customerId in handleLinkToMCC:', customerId);
                return;
            }

            // Check cookies first (faster check)
            const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
            console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);

            if (!hasGoogleAdsConnected) {
                console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
                if (typeof window !== 'undefined') {
                    window.location.href = '/integrations';
                }
                return;
            }

            // Try to refresh token if needed
            console.log('🔄 Attempting to refresh token if needed...');
            try {
                const refreshResponse = await fetch('/api/oauth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (refreshResponse.ok) {
                    console.log('✅ Token refreshed successfully');
                } else {
                    console.warn('⚠️ Token refresh failed, but continuing with existing token');
                }
            } catch (refreshError) {
                console.warn('⚠️ Token refresh error, but continuing:', refreshError);
            }

            // Check account status before linking
            const account = accounts.find(acc => normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId));
            if (account?.status === 'SUSPENDED') {
                console.error('❌ Cannot link suspended account - please reactivate account in Google Ads Console first.');
                return;
            }

            // Set loading state for this specific account only
            setLoadingAccounts(prev => ({ ...prev, [customerId]: true }));
            // ✅ تعيين حالة Linking (أزرق متحرك)
            setLinkingAccounts(prev => ({ ...prev, [customerId]: true }));
            console.log('🔗 Linking account to MCC:', { customerId, accountName });

            // فحص الحالة الحالية قبل الربط (من النظام الحالي)
            const currentAccount = accounts.find(acc => normalizeCustomerId(acc.customerId) === normalizeCustomerId(customerId));
            if (currentAccount?.displayStatus === 'Connected') {
                console.log('✅ الحساب مربوط بالفعل!');
                setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
                return;
            }

            // حفظ طلب العميل أولاً باستخدام Next.js API route
            const saveRequestResponse = await fetch(`/api/client-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    customer_id: customerId,
                    request_type: 'link_request',
                    account_name: accountName
                })
            });

            if (saveRequestResponse.ok) {
                console.log(`💾 تم حفظ طلب العميل ${customerId}`);
            }

            // Create link request using Next.js API route (proper flow)
            const linkResponse = await fetch(`/api/oauth/link-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    customer_id: customerId,
                    account_name: accountName
                })
            });

            if (linkResponse.ok) {
                const linkResult = await linkResponse.json();
                console.log('✅ Link request created using official API:', linkResult);

                // ✅ الحفاظ على الحالة الحالية وعدم التغيير لـ Pending يدوياً
                // سيتولى نظام الـ Polling عرض حالة "Linking..." الزرقاء
                console.log('✅ طلب الربط تم إرساله - نعتمد على Polling الآن');

                // Add to pending invitations
                setPendingInvitations(prev => [...prev, customerId]);

                // ✅ الحالة تبقى Pending حتى يضغط المستخدم على زر Refresh يدوياً
                console.log('✅ طلب الربط تم إرساله - الحالة ستبقى Pending حتى الضغط على زر Refresh');

                // إلغاء أي timer سابق
                if (linkNotificationTimerRef.current) {
                    clearTimeout(linkNotificationTimerRef.current);
                }

                // إظهار إشعار مع رابط للذهاب إلى صفحة Managers في Google Ads
                setLinkNotification({
                    show: true,
                    customerId: customerId,
                    accountName: accountName
                });

                // ✅ إخفاء الإشعار تلقائياً بعد 3 دقائق (بدلاً من 30 ثانية)
                linkNotificationTimerRef.current = setTimeout(() => {
                    console.log('⏰ Auto-closing link notification after 3 minutes');
                    setLinkNotification(null);
                }, 180000); // 3 دقائق

                // ✅ بدء الفحص أولاً لضمان وجود حالة polling قبل إخفاء حالة Linking
                await startPollingForAcceptance(customerId);

                // إضافة تأخير بسيط جداً للتأكد من أن Polling قد "أمسك" بزمام الأمور في الـ State
                setTimeout(() => {
                    setLinkingAccounts(prev => ({ ...prev, [customerId]: false }));
                    setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
                }, 100);

            } else {
                let errorResult: any = {};
                try {
                    errorResult = await linkResponse.json();
                } catch (parseError) {
                    console.error('❌ Failed to parse error response:', parseError);
                    errorResult = {
                        error: 'Failed to parse response',
                        message: 'فشل في تحليل استجابة الخادم',
                        error_type: 'PARSE_ERROR'
                    };
                }

                console.error('❌ Failed to create link request:', errorResult);
                const errorStr = JSON.stringify(errorResult).toLowerCase();

                // ✅ أولاً: التحقق من PENDING INVITATION (دعوة مُعلّقة)
                // هذه الحالة تعني أن الدعوة أُرسلت بالفعل وتحتاج قبول
                // Google Ads API Error Codes for pending:
                // - ALREADY_INVITED: دعوة مُعلّقة موجودة
                // - PENDING: الحالة معلّقة
                const isPendingInvitation =
                    errorStr.includes('pending invitation') ||
                    errorStr.includes('pending_invitation') ||
                    errorStr.includes('already_invited') ||
                    errorStr.includes('already invited') ||
                    errorStr.includes('invitation already sent') ||
                    errorStr.includes('link already pending') ||
                    errorStr.includes('pending') && errorStr.includes('link') ||
                    errorStr.includes('manager_link_error') && errorStr.includes('pending');

                if (isPendingInvitation) {
                    console.log('⏳ الدعوة مُعلّقة بالفعل - إظهار نافذة انتظار القبول');

                    // إلغاء أي timer سابق
                    if (linkNotificationTimerRef.current) {
                        clearTimeout(linkNotificationTimerRef.current);
                    }

                    // إظهار نافذة Link Request Sent (الخضراء) وليس Already Linked
                    setLinkNotification({
                        show: true,
                        customerId: customerId,
                        accountName: accountName
                    });

                    // ✅ الحفاظ على الحالة الحالية وعدم التغيير لـ Pending يدوياً
                    console.log('⏳ الدعوة مُعلّقة بالفعل - نعتمد على Polling الآن');

                    // بدء الفحص الذكي
                    // ✅ بدء الفحص أولاً لضمان استمرار حالة Linking الزرقاء
                    await startPollingForAcceptance(customerId);

                    setTimeout(() => {
                        setLinkingAccounts(prev => ({ ...prev, [customerId]: false }));
                        setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
                    }, 100);

                    // إغلاق النافذة بعد 3 دقائق
                    linkNotificationTimerRef.current = setTimeout(() => {
                        console.log('⏰ Auto-closing link notification after 3 minutes');
                        setLinkNotification(null);
                    }, 180000);

                    return;
                }

                // 🟢 ثانياً: معالجة ALREADY_MANAGED (الحساب مرتبط ونشط بالفعل)
                // هذا يعني status = ACTIVE وليس PENDING
                const isAlreadyLinked =
                    errorStr.includes('already_managed') ||
                    errorStr.includes('already managed') ||
                    errorStr.includes('already_linked') ||
                    errorStr.includes('already linked') ||
                    errorStr.includes('manager_link_already_exists') ||
                    errorStr.includes('customer_already_managed') ||
                    errorStr.includes('customer already managed') ||
                    errorStr.includes('cannot invite') ||
                    (linkResponse.status === 500 && !errorStr.includes('suspended') && !errorStr.includes('policy') && !errorStr.includes('pending'));

                if (isAlreadyLinked) {
                    console.log('🟢 الحساب مرتبط بالفعل (ACTIVE) - إظهار إشعار');
                    setErrorNotification({
                        show: true,
                        type: 'ALREADY_LINKED',
                        customerId: customerId,
                        message: 'This account is already linked to the MCC. Click "Refresh Statuses" to update.',
                        messageEn: 'هذا الحساب مرتبط بالفعل. اضغط على "تحديث الحالات" لتحديث الحالة.'
                    });

                    // تحديث حالة الحساب في الواجهة إلى مرتبط (Connected)
                    setAccounts(prevAccounts =>
                        prevAccounts.map(account =>
                            normalizeCustomerId(account.customerId) === customerId
                                ? { ...account, displayStatus: 'Connected', isLinkedToMCC: true, isDisabled: false }
                                : account
                        )
                    );

                    setTimeout(() => setErrorNotification(null), 15000);
                    return;
                }

                // 🔴 معالجة خطأ 500 أو حساب معلق فعلياً
                if (linkResponse.status === 500 && (errorStr.includes('suspended') || errorStr.includes('policy_violation') || errorStr.includes('policy violation'))) {
                    console.log('🔴 الحساب معلق - إظهار إشعار');
                    setErrorNotification({
                        show: true,
                        type: 'ACCOUNT_SUSPENDED',
                        customerId: customerId,
                        message: 'This Google Ads account is suspended due to policy violation. Please contact Google Ads support to resolve this issue.',
                        helpUrl: 'https://support.google.com/google-ads/answer/1704381'
                    });

                    // تحديث حالة الحساب في الواجهة
                    setAccounts(prevAccounts =>
                        prevAccounts.map(account =>
                            normalizeCustomerId(account.customerId) === customerId
                                ? { ...account, displayStatus: 'Suspended', isDisabled: true }
                                : account
                        )
                    );

                    setTimeout(() => setErrorNotification(null), 20000);
                    return;
                }

                // Handle specific error types
                if (errorResult.error_type === 'OAUTH_ERROR') {
                    console.error(`🔐 مشكلة في المصادقة: ${errorResult.message}`);
                    // Redirect to OAuth
                    if (typeof window !== 'undefined') {
                        window.location.href = '/api/oauth/google';
                    }
                } else if (errorResult.error_type === 'NETWORK_ERROR') {
                    console.error(`🌐 مشكلة في الاتصال: ${errorResult.message}`);
                    // إظهار إشعار للمستخدم
                    setErrorNotification({
                        show: true,
                        type: 'GENERAL_ERROR',
                        customerId: customerId,
                        message: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
                        messageEn: 'Network error occurred. Please try again.'
                    });
                    setTimeout(() => setErrorNotification(null), 10000);
                } else if (errorResult.errors && Array.isArray(errorResult.errors)) {
                    const errorMessages = errorResult.errors.map((err: any) => `• ${err.error_code}: ${err.message}`).join('\n');
                    console.error(`❌ Google Ads API Error: ${errorMessages} - Request ID: ${errorResult.request_id || 'N/A'}`);
                    // إظهار إشعار للمستخدم
                    setErrorNotification({
                        show: true,
                        type: 'GENERAL_ERROR',
                        customerId: customerId,
                        message: 'حدث خطأ أثناء ربط الحساب. يرجى المحاولة مرة أخرى.',
                        messageEn: errorMessages
                    });
                    setTimeout(() => setErrorNotification(null), 15000);
                } else {
                    // Fallback for any other error type
                    const errorMessage = errorResult.message || errorResult.error || 'خطأ غير معروف';
                    const errorType = errorResult.error_type || 'UNKNOWN_ERROR';
                    console.error(`❌ فشل في إرسال طلب الربط: ${errorMessage} - نوع الخطأ: ${errorType}`);
                    // إظهار إشعار للمستخدم
                    setErrorNotification({
                        show: true,
                        type: 'GENERAL_ERROR',
                        customerId: customerId,
                        message: errorMessage,
                        messageEn: errorResult.message_en || 'An error occurred while linking the account.'
                    });
                    setTimeout(() => setErrorNotification(null), 15000);
                }
            }

        } catch (error) {
            console.error('❌ Error linking account to MCC:', error);
            // لا توجد إشعارات للمستخدم
        } finally {
            // Remove loading state for this specific account only
            setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
        }
    };

    const handleAccountSelect = async (account: GoogleAdsAccount, index: number) => {
        console.log('Selected account:', account);

        // التحقق من صحة customerId
        if (!account.customerId || account.customerId === 'undefined') {
            console.error('❌ Invalid customerId:', account.customerId);
            return;
        }

        // عند النقر على حساب، نعرض فقط البيانات المخزنة (بدون استدعاء Google Ads API)
        // للتحديث من Google Ads API، يجب الضغط على زر "Refresh"
        console.log(`🖱️ User clicked ${account.customerId} - showing cached data`);
        console.log(`📋 Account status: ${account.displayStatus}, isLinkedToMCC: ${account.isLinkedToMCC}`);

        // إذا كان الحساب في حالة "Send again"، نعرض رسالة للمستخدم
        if (account.displayStatus === 'Pending') {
            console.log(`ℹ️ Account ${account.customerId} is pending - use Refresh button to check status`);
        }
    };

    // إزالة شاشة التحميل نهائياً

    return (
        <>
            {/* CSS Styles للتأثيرات البصرية */}
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            <div className="min-h-screen p-4 sm:p-6 md:p-8 relative">
                <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
                    {/* Header + Refresh Button (button below) */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                            <img
                                src="/images/integrations/google-ads-logo.svg"
                                alt="Google Ads"
                                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                            />
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                Accounts
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            Manage your connected accounts
                        </p>

                        {/* شريط التحديث المحسّن */}
                        <div className="mt-5 flex flex-col items-center gap-3">
                            {/* معلومات آخر تحديث */}
                            {lastSyncTime && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        Last update: {(() => {
                                            const diff = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000 / 60);
                                            if (diff < 1) return 'Just now';
                                            if (diff < 60) return `${diff} min ago`;
                                            const hours = Math.floor(diff / 60);
                                            if (hours < 24) return `${hours}h ago`;
                                            return `${Math.floor(hours / 24)}d ago`;
                                        })()}
                                    </span>
                                    {/* تنبيه إذا مر وقت طويل */}
                                    {Date.now() - lastSyncTime.getTime() > 60 * 60 * 1000 && (
                                        <span className="text-amber-400 text-[10px]">(may be outdated)</span>
                                    )}
                                </div>
                            )}

                            {/* زر التحديث الرئيسي */}
                            <button
                                type="button"
                                onClick={syncStatusesFromGoogleAds}
                                disabled={syncing}
                                className={`group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${syncing
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 cursor-wait'
                                    : 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/60 hover:from-emerald-500/20 hover:to-green-500/20 hover:shadow-lg hover:shadow-emerald-500/10'
                                    }`}
                            >
                                {syncing ? (
                                    <>
                                        {/* أيقونة تحميل دوارة */}
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Checking accounts...</span>
                                    </>
                                ) : (
                                    <>
                                        {/* أيقونة تحديث */}
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Refresh Statuses</span>
                                    </>
                                )}
                            </button>

                            {/* نص توضيحي صغير */}
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Check for new link requests or status changes
                            </p>
                        </div>

                        {/* إشعار بعد إرسال طلب الربط - تصميم مثل كروت الداشبورد */}
                        {linkNotification?.show && (
                            <div className="mt-5 w-full max-w-sm mx-auto">
                                <div
                                    className="relative rounded-[20px] border border-emerald-500/30 bg-[#001008] p-5 overflow-hidden transition-all duration-300 hover:border-emerald-500/50"
                                    style={{
                                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(16, 185, 129, 0.1)'
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 pointer-events-none"></div>

                                    {/* Header */}
                                    <div className="relative flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
                                            <span className="text-emerald-400 text-sm font-semibold">Link Request Sent</span>
                                        </div>
                                        <button
                                            onClick={() => setLinkNotification(null)}
                                            className="text-gray-600 hover:text-emerald-400 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Account ID */}
                                    <div className="relative mb-4">
                                        <p className="text-gray-400 text-sm">
                                            Account <span className="font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md" dir="ltr">{formatCustomerId(linkNotification.customerId)}</span>
                                        </p>
                                    </div>

                                    {/* Steps */}
                                    <div className="relative flex items-center justify-center gap-2 text-xs text-gray-500 mb-5 py-3 px-4 rounded-xl bg-black/30 border border-emerald-500/10">
                                        <span className="text-emerald-400 font-medium">Open Google Ads</span>
                                        <svg className="w-3 h-3 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-gray-400">Managers</span>
                                        <svg className="w-3 h-3 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-emerald-400 font-medium">Accept</span>
                                    </div>

                                    {/* Button - رابط مباشر لصفحة Managers في الحساب المحدد */}
                                    <a
                                        href={`https://ads.google.com/aw/accountaccess/managers?__e=${linkNotification.customerId.replace(/-/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-black text-sm font-bold transition-all hover:from-emerald-400 hover:to-green-400 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]"
                                    >
                                        <span>Accept in Google Ads</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>

                                    {/* Bottom glow */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                </div>
                            </div>
                        )}

                        {/* ✅ إشعار إلغاء الربط - تصميم أحمر */}
                        {unlinkNotification?.show && (
                            <div className="mt-5 w-full max-w-sm mx-auto">
                                <div
                                    className="relative rounded-[20px] border border-red-500/30 bg-[#100008] p-5 overflow-hidden transition-all duration-300 hover:border-red-500/50"
                                    style={{
                                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 pointer-events-none"></div>

                                    {/* Header */}
                                    <div className="relative flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${pollingUnlinkAccounts[normalizeCustomerId(unlinkNotification.customerId)] ? 'bg-red-400 animate-pulse shadow-red-400/50' : 'bg-blue-400 shadow-blue-400/50'}`}></div>
                                            <span className="text-red-400 text-sm font-semibold">
                                                {pollingUnlinkAccounts[normalizeCustomerId(unlinkNotification.customerId)] ? 'Waiting for Unlink' : 'Check Status'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const customerId = normalizeCustomerId(unlinkNotification.customerId);
                                                // إيقاف الفحص عند إغلاق النافذة
                                                if (pollingUnlinkIntervalsRef.current[customerId]) {
                                                    clearInterval(pollingUnlinkIntervalsRef.current[customerId]);
                                                    delete pollingUnlinkIntervalsRef.current[customerId];
                                                    setPollingUnlinkAccounts(prev => ({ ...prev, [customerId]: false }));
                                                }
                                                setUnlinkNotification(null);
                                            }}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Account ID */}
                                    <div className="relative mb-4">
                                        <p className="text-gray-400 text-sm">
                                            Account <span className="font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded-md" dir="ltr">{formatCustomerId(unlinkNotification.customerId)}</span>
                                        </p>
                                    </div>

                                    {/* Steps */}
                                    <div className="relative flex items-center justify-center gap-2 text-xs text-gray-500 mb-5 py-3 px-4 rounded-xl bg-black/30 border border-red-500/10">
                                        <span className="text-red-400 font-medium">Open Google Ads</span>
                                        <svg className="w-3 h-3 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-gray-400">Managers</span>
                                        <svg className="w-3 h-3 text-red-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span className="text-red-400 font-medium">Remove</span>
                                    </div>

                                    {/* Button - رابط مباشر لصفحة Managers */}
                                    <a
                                        href={`https://ads.google.com/aw/accountaccess/managers?__e=${normalizeCustomerId(unlinkNotification.customerId).replace(/-/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold transition-all hover:from-red-400 hover:to-rose-400 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98]"
                                    >
                                        <span>Remove in Google Ads</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>

                                    {/* Manual Check Button (إذا انتهى الوقت) */}
                                    {!pollingUnlinkAccounts[normalizeCustomerId(unlinkNotification.customerId)] && (
                                        <button
                                            onClick={() => startPollingForUnlink(normalizeCustomerId(unlinkNotification.customerId))}
                                            className="relative flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-xl bg-black/40 border border-red-500/20 text-red-300 text-sm font-medium transition-all hover:bg-red-500/10 hover:border-red-500/40"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>Check Status Again</span>
                                        </button>
                                    )}

                                    {/* Bottom glow */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                </div>
                            </div>
                        )}

                        {/* 🔔 إشعار ذكي - يتغير حسب نوع الخطأ */}
                        {errorNotification?.show && (
                            <div className="mt-5 w-full max-w-sm mx-auto">
                                {/* 🟢 نافذة الحساب المرتبط بالفعل */}
                                {errorNotification.type === 'ALREADY_LINKED' ? (
                                    <div
                                        className="relative rounded-[20px] border border-blue-500/30 bg-[#080814] p-5 overflow-hidden transition-all duration-300 hover:border-blue-500/50"
                                        style={{
                                            boxShadow: '0 0 30px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(59, 130, 246, 0.1)'
                                        }}
                                    >
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>

                                        {/* Header */}
                                        <div className="relative flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"></div>
                                                <span className="text-blue-400 text-sm font-semibold">Already Linked</span>
                                            </div>
                                            <button
                                                onClick={() => setErrorNotification(null)}
                                                className="text-gray-600 hover:text-blue-400 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Account ID */}
                                        <div className="relative mb-4">
                                            <p className="text-gray-400 text-sm">
                                                Account <span className="font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md" dir="ltr">{formatCustomerId(errorNotification.customerId)}</span>
                                            </p>
                                        </div>

                                        {/* Success Icon */}
                                        <div className="relative flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center border border-blue-500/30">
                                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="relative mb-5 py-3 px-4 rounded-xl bg-black/30 border border-blue-500/10">
                                            <p className="text-gray-300 text-sm leading-relaxed text-center">
                                                {isRTL ? 'هذا الحساب مرتبط بالفعل بحساب المدير (MCC). اضغط على الزر أدناه لتحديث الحالة.' : 'This account is already linked to the MCC. Click the button below to refresh the status.'}
                                            </p>
                                        </div>

                                        {/* Refresh Button */}
                                        <button
                                            onClick={() => {
                                                setErrorNotification(null);
                                                syncStatusesFromGoogleAds();
                                            }}
                                            className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-sm font-bold transition-all hover:from-blue-400 hover:to-emerald-400 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>{isRTL ? 'تحديث الحالات' : 'Refresh Statuses'}</span>
                                        </button>

                                        {/* Bottom glow */}
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                    </div>
                                ) : (
                                    /* 🔴 نافذة الحساب المعلق أو الأخطاء الأخرى */
                                    <div
                                        className="relative rounded-[20px] border border-red-500/30 bg-[#100808] p-5 overflow-hidden transition-all duration-300 hover:border-red-500/50"
                                        style={{
                                            boxShadow: '0 0 30px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(239, 68, 68, 0.1)'
                                        }}
                                    >
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none"></div>

                                        {/* Header */}
                                        <div className="relative flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-lg shadow-red-400/50"></div>
                                                <span className="text-red-400 text-sm font-semibold">
                                                    {errorNotification.type === 'ACCOUNT_SUSPENDED' ? 'Account Suspended' : 'Error'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setErrorNotification(null)}
                                                className="text-gray-600 hover:text-red-400 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Account ID */}
                                        <div className="relative mb-4">
                                            <p className="text-gray-400 text-sm">
                                                Account <span className="font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded-md" dir="ltr">{formatCustomerId(errorNotification.customerId)}</span>
                                            </p>
                                        </div>

                                        {/* Message */}
                                        <div className="relative mb-5 py-3 px-4 rounded-xl bg-black/30 border border-red-500/10">
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {errorNotification.message}
                                            </p>
                                        </div>

                                        {/* Button */}
                                        {errorNotification.helpUrl && (
                                            <a
                                                href={errorNotification.helpUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold transition-all hover:from-red-400 hover:to-orange-400 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98]"
                                            >
                                                <span>Contact Google Support</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}

                                        {/* Bottom glow */}
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>




                    {/* Accounts List */}
                    {accounts.length > 0 ? (
                        <div
                            className="accounts-card relative group -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16"
                            onMouseMove={(e) => {
                                const card = e.currentTarget;
                                const rect = card.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;

                                // تأثير سلس مع requestAnimationFrame
                                requestAnimationFrame(() => {
                                    card.style.setProperty('--glow-x', `${x}%`);
                                    card.style.setProperty('--glow-y', `${y}%`);
                                    card.style.setProperty('--glow-intensity', '1');
                                });
                            }}
                            onMouseLeave={(e) => {
                                const card = e.currentTarget;
                                // تأخير بسيط للتلاشي السلس
                                requestAnimationFrame(() => {
                                    card.style.setProperty('--glow-intensity', '0');
                                });
                            }}
                            onMouseEnter={(e) => {
                                const card = e.currentTarget;
                                const rect = card.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                card.style.setProperty('--glow-x', `${x}%`);
                                card.style.setProperty('--glow-y', `${y}%`);
                            }}
                        >
                            {/* الحاوية الخارجية باللون الأخضر - بنفس أسلوب الداشبورد مع توهج أقوى */}
                            <div className="relative rounded-[28px] p-[2px] bg-gradient-to-br from-emerald-500/60 via-green-400/40 to-teal-500/60 shadow-2xl shadow-emerald-500/30 transition-all duration-500 hover:shadow-emerald-500/50 hover:from-emerald-400/70 hover:via-green-300/50 hover:to-teal-400/70 overflow-hidden">

                                {/* Inner container - خلفية داكنة خضراء */}
                                <div className="relative rounded-[26px] bg-[#001008] backdrop-blur-xl p-5 overflow-hidden">
                                    {/* الكرات المتحركة - خضراء */}
                                    <div className="absolute top-5 left-6 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-float-slow"></div>
                                    <div className="absolute top-10 right-12 w-1 h-1 bg-green-300/50 rounded-full animate-float-medium"></div>
                                    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-emerald-300/40 rounded-full animate-float-slow"></div>
                                    <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-teal-400/40 rounded-full animate-float-fast"></div>
                                    <div className="absolute bottom-10 right-8 w-1.5 h-1.5 bg-green-400/50 rounded-full animate-float-medium"></div>
                                    <div className="absolute bottom-14 left-12 w-1 h-1 bg-emerald-400/40 rounded-full animate-float-slow"></div>

                                    {/* Corner glows داخلية خفيفة - خضراء */}
                                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                    <AnimatedList
                                        items={accounts.map((account) => {
                                            // تحديد لون الكارت حسب حالة الاتصال
                                            const isConnected = account.displayStatus === 'Connected';
                                            const isPending = account.displayStatus === 'Pending';

                                            return (
                                                <div
                                                    key={account.id}
                                                    className={`account-item w-full relative transition-all duration-300 rounded-xl p-3 sm:p-4 ${(isPending || linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)])
                                                        ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/5'
                                                        : 'bg-[#001a0d] border border-emerald-500/20 hover:bg-[#002a15] hover:border-emerald-500/40'
                                                        }`}
                                                >
                                                    {/* Account Display - Responsive Row */}
                                                    <div className="flex items-center justify-between relative z-10 gap-2">
                                                        {/* Left: Icon + Account ID */}
                                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                            <div className={`w-9 h-9 sm:w-12 sm:h-12 flex-shrink-0 rounded-full flex items-center justify-center ${isConnected
                                                                ? 'bg-emerald-500/20 border-2 border-emerald-400/50 shadow-inner shadow-emerald-500/20'
                                                                : (isPending || linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)])
                                                                    ? 'bg-blue-500/20 border-2 border-blue-400/50 shadow-inner shadow-blue-500/20'
                                                                    : 'bg-[#0a1f15] border border-emerald-500/20'
                                                                }`}>
                                                                <img
                                                                    src="/images/integrations/google-ads-logo.svg"
                                                                    alt="Google Ads"
                                                                    className="w-5 h-5 sm:w-8 sm:h-8"
                                                                />
                                                            </div>
                                                            <span className="text-white font-medium text-sm sm:text-base whitespace-nowrap">
                                                                <span className="hidden sm:inline">Google Ads </span>
                                                                <span className="font-mono">{formatCustomerId(account.customerId)}</span>
                                                            </span>
                                                        </div>

                                                        {/* Right: Status Button */}
                                                        <button
                                                            onClick={() => {
                                                                const customerId = normalizeCustomerId(account.customerId);
                                                                if (isConnected) {
                                                                    // Disconnect the account
                                                                    handleUnlinkFromMCC(customerId, account.name);
                                                                } else if (isPending && !pollingAccounts[customerId] && !pollingUnlinkAccounts[customerId]) {
                                                                    // Timeout case - Manual check
                                                                    console.log('🔄 Manual status check triggered');
                                                                    // التحقق مما إذا كان الطلب الأصلي ربط أم إلغاء ربط
                                                                    // إذا كان الحساب غير مرتبط (isLinkedToMCC === false)، فهو طلب ربط
                                                                    if (!account.isLinkedToMCC) {
                                                                        startPollingForAcceptance(customerId, true);
                                                                    } else {
                                                                        startPollingForUnlink(customerId, true);
                                                                    }
                                                                } else {
                                                                    handleLinkToMCC(customerId, account.name);
                                                                }
                                                            }}
                                                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold border-2 flex-shrink-0 transition-all whitespace-nowrap ${
                                                                // 🔴 Disconnect (أولوية قصوى للحالة المتصلة)
                                                                isConnected
                                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-400 hover:from-red-700 hover:to-red-800 cursor-pointer'
                                                                    // 🔴 Disconnecting... (أحمر متحرك)
                                                                    : pollingUnlinkAccounts[normalizeCustomerId(account.customerId)]
                                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 animate-pulse cursor-wait'
                                                                        // 🔵 Linking... (أزرق متحرك) - أثناء إرسال الطلب أو أثناء الفحص
                                                                        : linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)]
                                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 animate-pulse cursor-wait'
                                                                            // ⚪ Check Status (أبيض) - بعد انتهاء الوقت
                                                                            : isPending
                                                                                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer'
                                                                                // 🟢 Link (أخضر غامق)
                                                                                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-400 hover:from-emerald-700 hover:to-emerald-800 cursor-pointer'
                                                                }`}
                                                            disabled={linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)] || pollingUnlinkAccounts[normalizeCustomerId(account.customerId)]}
                                                        >
                                                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                                                // Disconnecting → أسود
                                                                pollingUnlinkAccounts[normalizeCustomerId(account.customerId)] ? 'bg-black'
                                                                    // Linking (أثناء الطلب أو الفحص) → أبيض
                                                                    : linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)] ? 'bg-white'
                                                                        // Disconnect → أبيض
                                                                        : isConnected ? 'bg-white'
                                                                            // Check Status → رمادي
                                                                            : isPending ? 'bg-gray-500'
                                                                                // Link → أبيض
                                                                                : 'bg-white'
                                                                }`}></span>
                                                            {
                                                                // 🔴 Disconnect (أولوية قصوى)
                                                                isConnected ? 'Disconnect'
                                                                    // 🔴 Disconnecting...
                                                                    : pollingUnlinkAccounts[normalizeCustomerId(account.customerId)] ? 'Disconnecting...'
                                                                        // 🔵 Linking... (أثناء إرسال الطلب أو أثناء الفحص)
                                                                        : linkingAccounts[normalizeCustomerId(account.customerId)] || pollingAccounts[normalizeCustomerId(account.customerId)] ? 'Linking...'
                                                                            // ⚪ Check Status (بعد انتهاء الوقت - isPending و !pollingAccounts)
                                                                            : isPending ? 'Check Status'
                                                                                // 🟢 Link
                                                                                : 'Link'
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        onItemSelect={(item, index) => {
                                            // item هو JSX element، نحتاج للحصول على account object من accounts array
                                            const account = accounts[index];
                                            if (account) {
                                                handleAccountSelect(account, index);
                                            }
                                        }}
                                        showGradients={true}
                                        enableArrowNavigation={true}
                                        displayScrollbar={true}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/5 border border-white/10">
                                <img
                                    src="/images/integrations/google-ads-logo.svg"
                                    alt="Google Ads"
                                    className="w-6 h-6 sm:w-8 sm:h-8 opacity-50"
                                />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                No Google Ads Accounts Found
                            </h3>
                            <p className="text-white/70 mb-4 sm:mb-6 max-w-sm mx-auto text-xs sm:text-sm">
                                No Google Ads accounts found. Please check browser console for details and ensure you have active Google Ads accounts.
                            </p>
                            {(
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            console.log('🔄 Manual refresh requested');
                                            fetchAccounts();
                                        }}
                                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                                    >
                                        <span>Refresh Accounts</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Main component مع Suspense wrapper
const GoogleAdsAccountsPage: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading Google Ads...</p>
                </div>
            </div>
        }>
            <GoogleAdsContent />
        </Suspense>
    );
};

export default GoogleAdsAccountsPage;