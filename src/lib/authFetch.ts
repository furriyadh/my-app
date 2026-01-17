/**
 * 🔐 Authenticated Fetch Wrapper
 * 
 * يتعامل مع 401 errors تلقائياً:
 * 1. يكتشف 401 (Unauthorized)
 * 2. يجدد الـ access_token عبر /api/oauth/refresh
 * 3. يعيد الطلب الأصلي بالـ token الجديد
 * 4. إذا فشل الـ refresh، يطلب logout
 * 
 * الاستخدام:
 * import { authFetch } from '@/lib/authFetch';
 * const response = await authFetch('/api/user/accounts');
 */

type FetchOptions = RequestInit & {
    skipAuthRetry?: boolean; // تخطي إعادة المحاولة (لتجنب infinite loop)
};

// حالة الـ refresh (لمنع طلبات متعددة)
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * تجديد الـ access_token
 */
async function refreshToken(): Promise<boolean> {
    try {
        console.log('🔄 Attempting to refresh access token...');

        const response = await fetch('/api/oauth/refresh', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            console.log('✅ Access token refreshed successfully');
            return true;
        }

        console.error('❌ Token refresh failed:', response.status);
        return false;
    } catch (error) {
        console.error('❌ Token refresh error:', error);
        return false;
    }
}

/**
 * إطلاق حدث logout
 */
function triggerLogout() {
    console.log('🚪 Triggering logout event...');

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }
}

/**
 * Authenticated Fetch - الدالة الرئيسية
 * 
 * @param url - الرابط المطلوب
 * @param options - خيارات الـ fetch
 * @returns Promise<Response>
 */
export async function authFetch(
    url: string | URL,
    options: FetchOptions = {}
): Promise<Response> {
    const { skipAuthRetry, ...fetchOptions } = options;

    // الطلب الأول
    const response = await fetch(url, {
        ...fetchOptions,
        credentials: 'include' // دائماً نرسل الـ cookies
    });

    // ✅ إذا ليس 401، نرجع مباشرة
    if (response.status !== 401 || skipAuthRetry) {
        return response;
    }

    console.log('⚠️ Received 401 Unauthorized, attempting token refresh...');

    // 🔒 منع طلبات refresh متعددة في نفس الوقت
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });
    }

    // انتظار الـ refresh
    const refreshed = await refreshPromise;

    if (refreshed) {
        // ✅ إعادة الطلب الأصلي بعد تجديد الـ token
        console.log('🔄 Retrying original request after token refresh...');
        return fetch(url, {
            ...fetchOptions,
            credentials: 'include'
        });
    }

    // ❌ فشل الـ refresh - يجب تسجيل الخروج
    console.error('❌ Token refresh failed, user needs to re-login');
    triggerLogout();

    return response; // إرجاع الـ 401 الأصلي
}

/**
 * Authenticated Fetch JSON - للطلبات اللي ترجع JSON
 * 
 * @param url - الرابط المطلوب
 * @param options - خيارات الـ fetch
 * @returns Promise<{ data, error, status }>
 */
export async function authFetchJSON<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
        const response = await authFetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                // إذا لم يكن JSON، نستخدم text
                try {
                    errorMessage = await response.text() || errorMessage;
                } catch {
                    // ignore
                }
            }

            return {
                data: null,
                error: errorMessage,
                status: response.status
            };
        }

        const data = await response.json();
        return { data, error: null, status: response.status };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ authFetchJSON error:', errorMessage);

        return {
            data: null,
            error: errorMessage,
            status: 0
        };
    }
}

/**
 * POST request helper
 */
export async function authPost<T = unknown>(
    url: string,
    body: unknown,
    options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
    return authFetchJSON<T>(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/**
 * GET request helper
 */
export async function authGet<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
    return authFetchJSON<T>(url, {
        ...options,
        method: 'GET'
    });
}
