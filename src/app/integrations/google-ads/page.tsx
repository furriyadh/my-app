'use client';

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

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import AnimatedList from '@/components/AnimatedList';
import { supabase, getClientRequests, subscribeToClientRequests, type ClientRequest } from '@/lib/supabase';

// Component منفصل للتعامل مع searchParams
const GoogleAdsContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState<Record<string, boolean>>({});
  const [pendingInvitations, setPendingInvitations] = useState<string[]>([]);
  
  // حالات النظام
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // دالة الاكتشاف التلقائي للحالات باستخدام المكتبة الرسمية
  const autoDiscoverAccountStatuses = async () => {
    if (!isAutoSyncEnabled) return;
    
    console.log('🔍 بدء الاكتشاف التلقائي لحالات الحسابات باستخدام Google Ads API...');
    
    try {
      let updatedCount = 0;
      
      // فحص جميع الحسابات (ليس فقط PENDING)
      for (const account of accounts) {
        // فحص الحالة من النظام الجديد
        const response = await fetch(`/api/discover-account-status/${account.customerId}`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.status_changed) {
            console.log(`🔄 تم اكتشاف تحديث: الحساب ${account.customerId}: ${data.previous_status} → ${data.status}`);
            
            // تحديد حالة العرض الجديدة
            let newDisplayStatus = '';
            let newIsLinkedToMCC = false;
            
            switch (data.status) {
              case 'PENDING':
                newDisplayStatus = 'Awaiting Acceptance';
                newIsLinkedToMCC = false;
                break;
              case 'ACTIVE':
                newDisplayStatus = 'Connected';
                newIsLinkedToMCC = true;
                break;
              case 'REJECTED':
              case 'REFUSED':
                newDisplayStatus = 'Send again';
                newIsLinkedToMCC = false;
                break;
              case 'CANCELLED':
                newDisplayStatus = 'Link Google Ads';
                newIsLinkedToMCC = false;
                break;
              case 'NOT_LINKED':
                newDisplayStatus = 'Link Google Ads';
                newIsLinkedToMCC = false;
                break;
              default:
                newDisplayStatus = account.displayStatus;
                newIsLinkedToMCC = account.isLinkedToMCC;
            }
            
            // تحديث الواجهة فوراً
            setAccounts(prevAccounts => 
              prevAccounts.map(acc => 
                acc.customerId === account.customerId 
                  ? { ...acc, isLinkedToMCC: newIsLinkedToMCC, displayStatus: newDisplayStatus }
                  : acc
              )
            );
            
            // إدارة قائمة المراقبة
            if (data.status === 'ACTIVE') {
              setPendingInvitations(prev => prev.filter(id => id !== account.customerId));
            } else if (data.status === 'PENDING') {
              setPendingInvitations(prev => 
                prev.includes(account.customerId) ? prev : [...prev, account.customerId]
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

  // تفعيل المزامنة التلقائية كل 30 ثانية (باستخدام النظام الحالي)
  useEffect(() => {
    if (isAutoSyncEnabled && accounts.length > 0) {
      const interval = setInterval(() => {
        console.log('🔄 المزامنة التلقائية - فحص الحسابات في حالة PENDING...');
        
        // فحص الحسابات في حالة PENDING فقط
        const pendingAccounts = accounts.filter(acc => acc.displayStatus === 'Awaiting Acceptance');
        
        pendingAccounts.forEach(async (account) => {
          try {
            const response = await fetch(`/api/discover-account-status/${account.customerId}`, {
              method: 'GET',
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.status === 'ACTIVE') {
                console.log(`🎉 تم اكتشاف تحديث تلقائي: الحساب ${account.customerId} أصبح Connected!`);
                
                // تحديث الواجهة فوراً
                setAccounts(prevAccounts => 
                  prevAccounts.map(acc => 
                    acc.customerId === account.customerId 
                      ? { ...acc, isLinkedToMCC: true, displayStatus: 'Connected' }
                      : acc
                  )
                );
                
                // إزالة من قائمة المراقبة
                setPendingInvitations(prev => prev.filter(id => id !== account.customerId));
              }
            }
          } catch (error) {
            console.error(`❌ خطأ في فحص الحساب ${account.customerId}:`, error);
          }
        });
        
        setLastSyncTime(new Date());
      }, 30000); // كل 30 ثانية
      
      return () => clearInterval(interval);
    }
  }, [isAutoSyncEnabled, accounts]);
  
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
      const url = new URL(window.location.href);
      url.searchParams.delete('oauth_success');
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
      
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
      
      // جلب الحسابات من Google Ads API
      const response = await fetch('/api/user/accounts', {
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
      const customerAccounts = data.google_ads || [];
      
      if (Array.isArray(customerAccounts) && customerAccounts.length > 0) {
        console.log(`📥 جلب ${customerAccounts.length} حساب من Google Ads API`);
        
        // حفظ كل حساب في قاعدة البيانات
        for (const account of customerAccounts) {
          const customerId = account.customerId || account.id;
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

  // دالة لجلب البيانات مباشرة من Supabase
  const fetchAccountsFromSupabase = async () => {
    try {
      setLoading(true);
      console.log('📥 جلب الحسابات مباشرة من Supabase...');
      
      const allClientRequests = await getClientRequests();
      console.log('📋 جميع طلبات العملاء من Supabase:', allClientRequests);
      
      // تجميع السجلات حسب customer_id واختيار أحدث سجل لكل حساب
      const clientRequestsMap = new Map<string, ClientRequest>();
      allClientRequests.forEach((req: ClientRequest) => {
        const existing = clientRequestsMap.get(req.customer_id);
        if (!existing || new Date(req.updated_at) > new Date(existing.updated_at)) {
          clientRequestsMap.set(req.customer_id, req);
        }
      });
      
      const clientRequests = Array.from(clientRequestsMap.values());
      console.log('📋 أحدث طلبات العملاء (مجمعة):', clientRequests);
      
      if (!clientRequests || clientRequests.length === 0) {
        console.log('ℹ️ لا توجد طلبات في قاعدة البيانات - جلب الحسابات من Google Ads API وحفظها');
        // إذا لم توجد طلبات في قاعدة البيانات، اجلب الحسابات من Google Ads API وحفظها
        await fetchAndSaveAccountsToDatabase();
        // إعادة جلب البيانات من قاعدة البيانات بعد الحفظ
        const allUpdatedRequests = await getClientRequests();
        
        // تجميع السجلات حسب customer_id واختيار أحدث سجل لكل حساب
        const updatedRequestsMap = new Map<string, ClientRequest>();
        allUpdatedRequests.forEach((req: ClientRequest) => {
          const existing = updatedRequestsMap.get(req.customer_id);
          if (!existing || new Date(req.updated_at) > new Date(existing.updated_at)) {
            updatedRequestsMap.set(req.customer_id, req);
          }
        });
        
        const updatedRequests = Array.from(updatedRequestsMap.values());
        if (updatedRequests && updatedRequests.length > 0) {
          console.log('✅ تم حفظ البيانات في قاعدة البيانات');
          // معالجة البيانات المحفوظة مع دمج الإحصائيات من Google Ads API
          const accountsFromSupabase = await Promise.all(
            updatedRequests.map(async (req: ClientRequest) => {
              let displayStatus = 'Link Google Ads';
              let isLinkedToMCC = false;
              
              switch (req.status as string) {
                case 'PENDING':
                  displayStatus = 'Awaiting Acceptance';
                  isLinkedToMCC = false;
                  break;
                case 'ACTIVE':
                  displayStatus = 'Connected';
                  isLinkedToMCC = true;
                  break;
                case 'REJECTED':
                case 'REFUSED':
                  displayStatus = 'Send again';
                  isLinkedToMCC = false;
                  break;
                case 'CANCELLED':
                  displayStatus = 'Link Google Ads';
                  isLinkedToMCC = false;
                  break;
                default:
                  displayStatus = 'Link Google Ads';
                  isLinkedToMCC = false;
              }
              
              // جلب الإحصائيات من Google Ads API
              let stats = { campaignsCount: 0, monthlySpend: 0 };
              try {
                const statsResponse = await fetch(`/api/google-ads/accounts/${req.customer_id}/stats`);
                if (statsResponse.ok) {
                  const statsData = await statsResponse.json();
                  if (statsData.success) {
                    stats = {
                      campaignsCount: statsData.summary?.total_campaigns || 0,
                      monthlySpend: statsData.summary?.total_cost_currency || 0
                    };
                  }
                }
              } catch (statsError) {
                console.warn(`⚠️ فشل في جلب إحصائيات الحساب ${req.customer_id}:`, statsError);
              }
              
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
                linkDetails: req.link_details,
                lastSync: req.updated_at || new Date().toISOString(),
                campaignsCount: stats.campaignsCount,
                monthlySpend: stats.monthlySpend,
                details: {}
              };
            })
          );
          
          console.log('🎯 الحسابات النهائية من Supabase مع الإحصائيات:', accountsFromSupabase);
          setAccounts(accountsFromSupabase);
        }
      } else {
        // معالجة البيانات الموجودة مع دمج الإحصائيات من Google Ads API
        const accountsFromSupabase = await Promise.all(
          clientRequests.map(async (req: ClientRequest) => {
            let displayStatus = 'Link Google Ads';
            let isLinkedToMCC = false;
            
            switch (req.status as string) {
              case 'PENDING':
                displayStatus = 'Awaiting Acceptance';
                isLinkedToMCC = false;
                break;
              case 'ACTIVE':
                displayStatus = 'Connected';
                isLinkedToMCC = true;
                break;
              case 'REJECTED':
              case 'REFUSED':
                displayStatus = 'Send again';
                isLinkedToMCC = false;
                break;
              case 'CANCELLED':
                displayStatus = 'Link Google Ads';
                isLinkedToMCC = false;
                break;
              default:
                displayStatus = 'Link Google Ads';
                isLinkedToMCC = false;
            }
            
            // جلب الإحصائيات من Google Ads API
            let stats = { campaignsCount: 0, monthlySpend: 0 };
            try {
              const statsResponse = await fetch(`/api/google-ads/accounts/${req.customer_id}/stats`);
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.success) {
                  stats = {
                    campaignsCount: statsData.summary?.total_campaigns || 0,
                    monthlySpend: statsData.summary?.total_cost_currency || 0
                  };
                }
              }
            } catch (statsError) {
              console.warn(`⚠️ فشل في جلب إحصائيات الحساب ${req.customer_id}:`, statsError);
            }
            
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
              linkDetails: req.link_details,
              lastSync: req.updated_at || new Date().toISOString(),
              campaignsCount: stats.campaignsCount,
              monthlySpend: stats.monthlySpend,
              details: {}
            };
          })
        );
        
        console.log('🎯 الحسابات النهائية من Supabase مع الإحصائيات:', accountsFromSupabase);
        setAccounts(accountsFromSupabase);
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب الحسابات من Supabase:', error);
    } finally {
      setLoading(false);
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

  // دالة مزامنة الحالات من Google Ads API
  const syncStatusesFromGoogleAds = async () => {
    try {
      setSyncing(true);
      console.log('🔄 بدء مزامنة الحالات من Google Ads API...');
      
      const response = await fetch('/api/sync-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في المزامنة');
      }

      const data = await response.json();
      console.log('✅ تمت المزامنة بنجاح:', data);
      
      // إعادة جلب البيانات من Supabase بعد المزامنة
      await fetchAccountsFromSupabase();
      
      // إظهار رسالة نجاح
      if (data.synced_count > 0) {
        alert(`✅ تمت مزامنة ${data.synced_count} حساب بنجاح!\n\nالتحديثات:\n${data.sync_results?.map((r: any) => `• ${r.customer_id}: ${r.old_status} → ${r.new_status}`).join('\n') || ''}`);
      } else {
        alert('ℹ️ جميع الحسابات محدثة بالفعل - لا توجد تغييرات');
      }
      
    } catch (error) {
      console.error('❌ خطأ في المزامنة:', error);
      alert(`❌ فشل في المزامنة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Fetch accounts from API using official Google Ads library
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching customer accounts from OAuth session...');
      console.log('🔍 Current accounts state:', accounts.length);
      
      // Check cookies first (faster check)
      const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
      console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);
      
      if (!hasGoogleAdsConnected) {
        console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
        alert('⚠️ يرجى الاتصال بـ Google Ads أولاً من صفحة التكاملات.');
        window.location.href = '/integrations';
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
      const response = await fetch('/api/user/accounts', {
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
      const customerAccounts = data.google_ads || [];
      if (Array.isArray(customerAccounts) && customerAccounts.length > 0) {
        console.log(`📥 FETCH-ACCOUNTS: Got ${customerAccounts.length} customer accounts from OAuth`);
        
        const accountsWithStats = await Promise.all(
          customerAccounts.map(async (account: any) => {
            try {
              // Validate customerId (API returns 'id' field, not 'customerId')
              const customerId = account.customerId || account.id;
              if (!customerId || customerId === 'undefined' || customerId === 'null') {
                console.warn(`⚠️ Invalid customerId for account:`, account);
                return null;
              }
              
              // Check account statistics using Next.js API
              const statsResponse = await fetch(`/api/google-ads/accounts/${customerId}/stats`);
              let stats = { campaignsCount: 0, monthlySpend: 0 };
              
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.success) {
                  stats = {
                    campaignsCount: statsData.summary?.total_campaigns || 0,
                    monthlySpend: statsData.summary?.total_cost_currency || 0
                  };
                }
              }
              
              // جلب الحالة الفعلية من Next.js API (بدلاً من Flask backend)
              console.log(`🔍 Fetching real-time status from Next.js API for account ${customerId}...`);
              
              let displayStatus = 'Link Google Ads';
              let isLinkedToMCC = false;
              let linkDetails = null;
              
              // استدعاء Next.js API للحصول على الحالة الفعلية
              try {
                const statusResponse = await fetch(`/api/discover-account-status/${customerId}`, {
                  method: 'GET',
                  credentials: 'include'
                });
                
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  console.log(`📊 Next.js API status for ${customerId}:`, statusData);
                  
                  if (statusData.success) {
                    linkDetails = statusData.link_details;
                    
                    // تحديد الحالة بناءً على Next.js API
                    switch (statusData.status) {
                      case 'PENDING':
                        displayStatus = 'Awaiting Acceptance';
                        isLinkedToMCC = false;
                        break;
                      case 'ACTIVE':
                  displayStatus = 'Connected';
                  isLinkedToMCC = true;
                        break;
                      case 'REJECTED':
                      case 'REFUSED':
                        displayStatus = 'Send again';
                  isLinkedToMCC = false;
                        break;
                      case 'CANCELLED':
                  displayStatus = 'Link Google Ads';
                  isLinkedToMCC = false;
                        break;
                      case 'NOT_LINKED':
                        displayStatus = 'Link Google Ads';
                        isLinkedToMCC = false;
                        break;
                      case 'SUSPENDED':
                        displayStatus = 'Suspended';
                        isLinkedToMCC = false;
                        break;
                      default:
                        displayStatus = 'Link Google Ads';
                        isLinkedToMCC = false;
                        break;
                    }
                    
                    console.log(`✅ Updated status for ${customerId}: ${displayStatus} (${statusData.status})`);
                    
                    // حفظ الحالة في قاعدة البيانات للتخزين
                    try {
                      const saveResponse = await fetch('/api/client-requests', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          customer_id: customerId,
                          request_type: 'link_request',
                          account_name: account.name || `Account ${customerId}`,
                          status: statusData.status, // الحالة الفعلية من Next.js API
                          link_details: statusData.link_details
                        })
                      });
                      
                      if (saveResponse.ok) {
                        console.log(`✅ تم حفظ الحالة الفعلية ${statusData.status} للحساب ${customerId} في قاعدة البيانات`);
                      } else {
                        console.warn(`⚠️ فشل في حفظ الحالة للحساب ${customerId}:`, saveResponse.status);
                      }
                    } catch (error) {
                      console.warn(`⚠️ خطأ في حفظ الحالة للحساب ${customerId}:`, error);
                    }
                  } else {
                    console.warn(`⚠️ Next.js API returned error for ${customerId}:`, statusData.error);
                  }
                } else {
                  console.warn(`⚠️ Failed to fetch status from Next.js API for ${customerId}:`, statusResponse.status);
                }
              } catch (error) {
                console.warn(`⚠️ Error calling Next.js API for ${customerId}:`, error);
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
                linkDetails: linkDetails, // Real-time link information
                lastSync: new Date().toISOString(),
                campaignsCount: stats.campaignsCount,
                monthlySpend: stats.monthlySpend,
                details: account.details || {}
              };
            } catch (error) {
              console.log(`⚠️ Error processing account ${account.customerId}:`, error);
              return {
                id: account.customerId,
                customerId: account.customerId,
                name: account.name || `Account ${account.customerId}`,
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
        
        // Filter out null accounts (invalid customerIds)
        const validAccounts = accountsWithStats.filter(account => account !== null);
        console.log('🔍 Setting accounts state with:', validAccounts);
        console.log('🔍 Account names:', validAccounts.map(acc => ({ id: acc.customerId, name: acc.name })));
        setAccounts(validAccounts);
        
        // تحديث قائمة الانتظار بناءً على قاعدة البيانات فقط
        const pendingAccounts = validAccounts.filter(acc => 
          acc.displayStatus === 'Awaiting Acceptance'
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
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Component mounted - starting account fetch...');
    console.log('🔍 Initial state - accounts:', accounts.length, 'loading:', loading);
    
    // Check cookies first (faster check)
    const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
    console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);
    
    if (!hasGoogleAdsConnected) {
      console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
      alert('⚠️ يرجى الاتصال بـ Google Ads أولاً من صفحة التكاملات.');
      window.location.href = '/integrations';
      return;
    }
    
    // If cookie exists, proceed with fetching accounts directly
    console.log('✅ Google Ads connection cookie found, proceeding with account fetch...');
    
    // التدفق الصحيح: Frontend → قاعدة البيانات مباشرة (أسرع وأكثر دقة)
    // أولاً: جلب الحسابات من قاعدة البيانات مباشرة
    fetchAccountsFromSupabase();
    
    // الاشتراك في التحديثات الفورية من Supabase
    const subscription = subscribeToClientRequests((payload) => {
      console.log('🔄 تحديث فوري من Supabase:', payload);
      // إعادة جلب البيانات عند حدوث تغيير فقط
      if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
        console.log('📥 تحديث البيانات بسبب تغيير في قاعدة البيانات');
        fetchAccountsFromSupabase();
      }
    });
    
    // Cleanup عند إلغاء تحميل المكون
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      // إلغاء الاشتراك في التحديثات الفورية
      subscription.unsubscribe();
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
        alert('ℹ️ No pending invitations to check.');
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
              
              // Update UI immediately
              setAccounts(prevAccounts => 
                prevAccounts.map(acc => 
                  acc.customerId === customerId 
                    ? { ...acc, isLinkedToMCC: true, displayStatus: 'Connected' }
                    : acc
                )
              );
            } else if (data.success && data.status === 'PENDING') {
              // Still pending
              console.log(`⏳ Account ${customerId} is still pending approval`);
            } else if (data.success && (data.status === 'REJECTED' || data.status === 'REFUSED')) {
              // Invitation rejected ❌
              console.log(`❌ Account ${customerId} invitation was rejected`);
              rejectedCount++;
              
              // Update UI to show "Send again"
              setAccounts(prevAccounts => 
                prevAccounts.map(acc => 
                  acc.customerId === customerId 
                    ? { ...acc, isLinkedToMCC: false, displayStatus: 'Send again' }
                    : acc
                )
              );
            } else if (data.success && data.status === 'CANCELLED') {
              // Invitation cancelled 🚫
              console.log(`🚫 Account ${customerId} invitation was cancelled`);
              rejectedCount++;
              
              // Update UI to show "Link Google Ads"
              setAccounts(prevAccounts => 
                prevAccounts.map(acc => 
                  acc.customerId === customerId 
                    ? { ...acc, isLinkedToMCC: false, displayStatus: 'Link Google Ads' }
                    : acc
                )
              );
            } else if (data.success && data.status === 'NOT_LINKED') {
              // Not linked yet
              console.log(`ℹ️ Account ${customerId} is not linked`);
              
              // Update UI to show "Link Google Ads"
              setAccounts(prevAccounts => 
                prevAccounts.map(acc => 
                  acc.customerId === customerId 
                    ? { ...acc, isLinkedToMCC: false, displayStatus: 'Link Google Ads' }
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
      const updatedPending = accounts.filter(acc => acc.displayStatus === 'Awaiting Acceptance').map(acc => acc.customerId);
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
      
      alert(message);
      
    } catch (error) {
      console.log('❌ Error checking invitation status:', error);
      alert('❌ Error checking invitation status. Please try again.');
    }
  };

  const handleLinkToMCC = async (customerId: string, accountName: string) => {
    try {
      // Check cookies first (faster check)
      const hasGoogleAdsConnected = document.cookie.includes('google_ads_connected=true');
      console.log('🔍 Google Ads connection cookie:', hasGoogleAdsConnected);
      
      if (!hasGoogleAdsConnected) {
        console.warn('⚠️ No Google Ads connection cookie found, redirecting to integrations...');
        alert('⚠️ يرجى الاتصال بـ Google Ads أولاً من صفحة التكاملات.');
        window.location.href = '/integrations';
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
      const account = accounts.find(acc => acc.customerId === customerId);
      if (account?.status === 'SUSPENDED') {
        alert('❌ Cannot link suspended account.\n\nPlease reactivate account in Google Ads Console first.');
        return;
      }
      
      // Set loading state for this specific account only
      setLoadingAccounts(prev => ({ ...prev, [customerId]: true }));
      console.log('🔗 Linking account to MCC:', { customerId, accountName });
      
      // فحص الحالة الحالية قبل الربط (من النظام الحالي)
      const currentAccount = accounts.find(acc => acc.customerId === customerId);
      if (currentAccount?.displayStatus === 'Connected') {
        console.log('✅ الحساب مربوط بالفعل!');
        alert('✅ This account is already connected to your MCC!');
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
          customerId: customerId,
          account_name: accountName
        })
      });
      
      if (linkResponse.ok) {
        const linkResult = await linkResponse.json();
        console.log('✅ Link request created using official API:', linkResult);
        
        // Update UI to show "Awaiting Acceptance" with fresh timestamp
        setAccounts(prevAccounts => 
          prevAccounts.map(account => 
            account.customerId === customerId 
              ? { 
                  ...account, 
                  isLinkedToMCC: false, 
                  displayStatus: 'Awaiting Acceptance',
                  lastSync: new Date().toISOString() // تحديث timestamp للتحديث المحلي
                }
              : account
          )
        );
        
        // Add to pending invitations
        setPendingInvitations(prev => [...prev, customerId]);
        
        // لا نحتاج التحديث التلقائي - Real-time subscriptions ستحدث البيانات
        console.log('✅ طلب الربط تم إرساله - Real-time subscriptions ستحدث الحالة تلقائياً');
        
        // لا نحتاج fetchAccounts() - التحديث الفوري للواجهة كافي
        console.log('✅ UI updated immediately - no need to refetch data');
        
        alert(`✅ Link invitation sent successfully using official Google Ads API!\n\n📋 Accept the invitation:\n1. Go to Google Ads Console (ads.google.com)\n2. Settings → Account Access → Account Management\n3. Find invitation from MCC account ${linkResult.mcc_customer_id}\n4. Click "Accept" on the invitation\n\n⚡ Status will update automatically in real-time!\n\n🔧 Using: ${linkResult.source}`);
        
      } else {
        const errorResult = await linkResponse.json();
        console.error('❌ Failed to create link request:', errorResult);
        
        // Handle specific error types
        if (errorResult.error_type === 'OAUTH_ERROR') {
          alert(`🔐 مشكلة في المصادقة:\n\n${errorResult.message}\n\nيرجى إعادة تسجيل الدخول إلى Google Ads`);
          // Redirect to OAuth
          window.location.href = '/api/oauth/google';
        } else if (errorResult.error_type === 'NETWORK_ERROR') {
          alert(`🌐 مشكلة في الاتصال:\n\n${errorResult.message}\n\nيرجى المحاولة مرة أخرى خلال دقائق`);
        } else if (errorResult.errors && Array.isArray(errorResult.errors)) {
          const errorMessages = errorResult.errors.map((err: any) => `• ${err.error_code}: ${err.message}`).join('\n');
          alert(`❌ Google Ads API Error:\n\n${errorMessages}\n\nRequest ID: ${errorResult.request_id || 'N/A'}`);
        } else {
          alert(`❌ فشل في إرسال طلب الربط:\n\n${errorResult.message || errorResult.error || 'خطأ غير معروف'}\n\nيرجى المحاولة مرة أخرى`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error linking account to MCC:', error);
      alert('Error linking account to MCC. Please try again.');
    } finally {
      // Remove loading state for this specific account only
      setLoadingAccounts(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const handleAccountSelect = async (account: GoogleAdsAccount, index: number) => {
    console.log('Selected account:', account);
    
    // Check status when clicking on account
    if (account.displayStatus === 'PENDING') {
      console.log(`🖱️ User clicked ${account.customerId} - checking status using official API`);
      
      try {
        const nextjsApiUrl = `/api/discover-account-status/${account.customerId}`;
        const response = await fetch(nextjsApiUrl, {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Click status check result:`, data);
          
          if (data.success && data.status === 'ACTIVE') {
            console.log(`🎉 Account ${account.customerId} is now Connected!`);
            
            // Update UI immediately
            setAccounts(prevAccounts => 
              prevAccounts.map(acc => 
                acc.customerId === account.customerId 
                  ? { ...acc, isLinkedToMCC: true, displayStatus: 'Connected' }
                  : acc
              )
            );
            
            // Remove from pending invitations
            setPendingInvitations(prev => prev.filter(id => id !== account.customerId));
            
            alert(`🎉 Excellent! Account ${account.customerId} is now Connected!\n\n✅ Status updated instantly via official Google Ads API.`);
          } else if (data.success && data.status === 'PENDING') {
            console.log(`⏳ Account ${account.customerId} is still pending`);
            alert(`⏳ Account ${account.customerId} is still pending approval.\n\nPlease check Google Ads Console to accept the invitation.`);
          } else if (data.success && (data.status === 'REJECTED' || data.status === 'REFUSED' || data.status === 'CANCELLED')) {
            console.log(`❌ Account ${account.customerId} invitation was ${data.status.toLowerCase()}`);
            
            // Update UI to show "Link Google Ads"
            setAccounts(prevAccounts => 
              prevAccounts.map(acc => 
                acc.customerId === account.customerId 
                  ? { ...acc, isLinkedToMCC: false, displayStatus: 'Link Google Ads' }
                  : acc
              )
            );
            
            // Remove from pending invitations
            setPendingInvitations(prev => prev.filter(id => id !== account.customerId));
            
            alert(`❌ Invitation for account ${account.customerId} was ${data.status.toLowerCase()}.\n\nYou can send a new invitation by clicking "Link Google Ads".`);
          }
        }
      } catch (error) {
        console.log(`❌ Status check failed for ${account.customerId}:`, error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
              <img 
                src="/images/integrations/google-ads-logo.svg" 
                alt="Google Ads" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Manage your connected accounts</p>
          </div>

          {/* Status Check Button */}
          {pendingInvitations.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⏳ {pendingInvitations.length} invitation(s) pending - Status updates automatically in real-time
              </p>
            </div>
          )}


          {/* Accounts List */}
          {accounts.length > 0 ? (
            <AnimatedList
              items={accounts.map((account) => (
                <div key={account.id} className="w-full">
                  {/* Account Display with inline Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                        <img 
                          src="/images/integrations/google-ads-logo.svg" 
                          alt="Google Ads" 
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium text-xs sm:text-sm">
                          Google Ads Account <span className="text-gray-300 font-mono ml-2 text-xs sm:text-sm">{formatCustomerId(account.customerId)}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Link Google Ads button */}
                    <div className="ml-2 sm:ml-4">
                        <button
                        onClick={() => handleLinkToMCC(account.customerId, account.name)}
                        className={`flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                          loadingAccounts[account.customerId]
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/30'
                          }`}
                        disabled={loadingAccounts[account.customerId]}
                        title="Click to link to MCC"
                      >
                        {loadingAccounts[account.customerId] ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1.5 animate-spin"></span>
                            ⏳ Linking...
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                            Link Google Ads
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              onItemSelect={handleAccountSelect}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
              className="w-full"
            />
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
                {loading ? 'Loading Accounts...' : 'No Google Ads Accounts Found'}
              </h3>
              <p className="text-white/70 mb-4 sm:mb-6 max-w-sm mx-auto text-xs sm:text-sm">
                {loading 
                  ? 'Fetching your Google Ads accounts from OAuth session...' 
                  : 'No Google Ads accounts found. Please check browser console for details and ensure you have active Google Ads accounts.'
                }
              </p>
              {!loading && (
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
  );
};

// Main component مع Suspense wrapper
const GoogleAdsAccountsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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