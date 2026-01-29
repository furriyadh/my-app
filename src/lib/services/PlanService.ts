// PlanService - خدمة إدارة الخطط والحدود مع Supabase
// يتم استخدامها للتحقق من حدود الخطة الحالية للمستخدم

import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlanLimits {
    planId: string;
    planName: string;
    planNameAr?: string;
    maxAccounts: number;
    maxCampaigns: number;
    monthlyBudget: number | null; // null = unlimited
    monthlyPrice: number; // Price per month
    yearlyPrice: number;  // Price per year
    features: {
        aiOptimization: boolean;
        prioritySupport: boolean;
        customReports: boolean;
        whiteLabel: boolean;
        apiAccess: boolean;
        dedicatedManager: boolean;
    };
}

export interface UserUsage {
    accountsCount: number;
    campaignsCount: number;
    monthlyBudgetUsed: number;
}

export interface UserSubscription {
    planId: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string | null;
}

// الحدود الافتراضية (fallback)
export const PLAN_LIMITS: Record<string, PlanLimits> = {
    free: {
        planId: 'free',
        planName: 'Free',
        planNameAr: 'مجاني',
        maxAccounts: 1,
        maxCampaigns: 1,
        monthlyBudget: 100,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: {
            aiOptimization: false,
            prioritySupport: false,
            customReports: false,
            whiteLabel: false,
            apiAccess: false,
            dedicatedManager: false,
        },
    },
    basic: {
        planId: 'basic',
        planName: 'Basic',
        planNameAr: 'أساسي',
        maxAccounts: 1,
        maxCampaigns: 3,
        monthlyBudget: null, // Unlimited
        monthlyPrice: 49,
        yearlyPrice: 490,
        features: {
            aiOptimization: false,
            prioritySupport: false,
            customReports: false,
            whiteLabel: false,
            apiAccess: false,
            dedicatedManager: false,
        },
    },
    pro: {
        planId: 'pro',
        planName: 'Pro',
        planNameAr: 'احترافي',
        maxAccounts: 3,
        maxCampaigns: 10,
        monthlyBudget: null, // Unlimited
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: {
            aiOptimization: true,
            prioritySupport: true,
            customReports: true,
            whiteLabel: false,
            apiAccess: false,
            dedicatedManager: false,
        },
    },
    agency: {
        planId: 'agency',
        planName: 'Agency',
        planNameAr: 'وكالة',
        maxAccounts: 10,
        maxCampaigns: -1,
        monthlyBudget: null,
        monthlyPrice: 249,
        yearlyPrice: 2490,
        features: {
            aiOptimization: true,
            prioritySupport: true,
            customReports: true,
            whiteLabel: true,
            apiAccess: true,
            dedicatedManager: false,
        },
    },
    enterprise: {
        planId: 'enterprise',
        planName: 'Enterprise',
        planNameAr: 'مؤسسات',
        maxAccounts: -1,
        maxCampaigns: -1,
        monthlyBudget: null,
        monthlyPrice: -1, // Custom pricing
        yearlyPrice: -1,  // Custom pricing
        features: {
            aiOptimization: true,
            prioritySupport: true,
            customReports: true,
            whiteLabel: true,
            apiAccess: true,
            dedicatedManager: true,
        },
    },
};

const DEFAULT_PLAN = 'free';

// ==================== دوال Supabase ====================

// جلب اشتراك المستخدم من Supabase
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
    try {
        const { data, error } = await supabase
            .from('user_billing_subscriptions')
            .select('plan_id, status, billing_cycle, current_period_end')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        if (error || !data) return null;

        return {
            planId: data.plan_id,
            status: data.status,
            billingCycle: data.billing_cycle,
            currentPeriodEnd: data.current_period_end,
        };
    } catch {
        return null;
    }
};

// جلب استخدام المستخدم من Supabase
export const getUserUsage = async (userId: string): Promise<UserUsage> => {
    try {
        const { data, error } = await supabase
            .from('user_billing_usage')
            .select('accounts_count, campaigns_count, monthly_budget_used')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return { accountsCount: 0, campaignsCount: 0, monthlyBudgetUsed: 0 };
        }

        return {
            accountsCount: data.accounts_count,
            campaignsCount: data.campaigns_count,
            monthlyBudgetUsed: data.monthly_budget_used,
        };
    } catch {
        return { accountsCount: 0, campaignsCount: 0, monthlyBudgetUsed: 0 };
    }
};

// تحديث عدد الحسابات
export const updateAccountsCount = async (userId: string, count: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_billing_usage')
            .upsert({
                user_id: userId,
                accounts_count: count,
                last_updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        return !error;
    } catch {
        return false;
    }
};

// تحديث عدد الحملات
export const updateCampaignsCount = async (userId: string, count: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_billing_usage')
            .upsert({
                user_id: userId,
                campaigns_count: count,
                last_updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        return !error;
    } catch {
        return false;
    }
};

// إنشاء اشتراك جديد للمستخدم
export const createUserSubscription = async (userId: string, planId: string = 'free', email?: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_billing_subscriptions')
            .insert({
                user_id: userId,
                user_email: email,
                plan_id: planId,
                status: 'active',
                billing_cycle: 'monthly',
                current_period_start: new Date().toISOString(),
            });

        return !error;
    } catch {
        return false;
    }
};

// ترقية/تغيير الخطة
export const updateUserPlan = async (userId: string, newPlanId: string, oldPlanId?: string): Promise<boolean> => {
    try {
        // تحديث الاشتراك
        const { error: updateError } = await supabase
            .from('user_billing_subscriptions')
            .update({
                plan_id: newPlanId,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (updateError) return false;

        // سجل التغيير
        const changeType = getChangeType(oldPlanId || 'free', newPlanId);
        await supabase
            .from('billing_plan_history')
            .insert({
                user_id: userId,
                old_plan_id: oldPlanId,
                new_plan_id: newPlanId,
                change_type: changeType,
            });

        return true;
    } catch {
        return false;
    }
};

// تحديد نوع التغيير
const getChangeType = (oldPlan: string, newPlan: string): string => {
    const planOrder = ['free', 'basic', 'pro', 'agency', 'enterprise'];
    const oldIndex = planOrder.indexOf(oldPlan);
    const newIndex = planOrder.indexOf(newPlan);

    if (newIndex > oldIndex) return 'upgrade';
    if (newIndex < oldIndex) return 'downgrade';
    return 'new';
};

// ==================== دوال localStorage (للتوافق) ====================

// استرجاع خطة المستخدم الحالية (من localStorage كـ fallback)
export const getCurrentPlan = (): string => {
    if (typeof window === 'undefined') return DEFAULT_PLAN;
    return localStorage.getItem('user_plan') || DEFAULT_PLAN;
};

// تعيين خطة المستخدم (في localStorage)
export const setCurrentPlan = (planId: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_plan', planId);
    }
};

// استرجاع حدود الخطة الحالية
export const getCurrentPlanLimits = (): PlanLimits => {
    const planId = getCurrentPlan();
    return PLAN_LIMITS[planId] || PLAN_LIMITS[DEFAULT_PLAN];
};

// ==================== دوال التحقق ====================

// التحقق من إمكانية إضافة حساب جديد
export const canAddAccount = (currentAccountsCount: number): { allowed: boolean; message: string; messageAr: string } => {
    const limits = getCurrentPlanLimits();

    if (limits.maxAccounts === -1) {
        return { allowed: true, message: '', messageAr: '' };
    }

    if (currentAccountsCount >= limits.maxAccounts) {
        return {
            allowed: false,
            message: `You have reached the maximum of ${limits.maxAccounts} account(s) for your ${limits.planName} plan. You currently have ${currentAccountsCount} accounts. Please upgrade to add more accounts.`,
            messageAr: `لقد وصلت للحد الأقصى وهو ${limits.maxAccounts} حساب في خطة ${limits.planName}. لديك حالياً ${currentAccountsCount} حساب. يرجى الترقية لإضافة المزيد من الحسابات.`,
        };
    }

    return { allowed: true, message: '', messageAr: '' };
};

// التحقق من إمكانية إضافة حساب (مع Supabase)
export const canAddAccountAsync = async (userId: string): Promise<{ allowed: boolean; message: string; messageAr: string }> => {
    const [subscription, usage] = await Promise.all([
        getUserSubscription(userId),
        getUserUsage(userId),
    ]);

    const planId = subscription?.planId || 'free';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS['free'];

    if (limits.maxAccounts === -1) {
        return { allowed: true, message: '', messageAr: '' };
    }

    if (usage.accountsCount >= limits.maxAccounts) {
        return {
            allowed: false,
            message: `You have reached the maximum of ${limits.maxAccounts} account(s) for your ${limits.planName} plan. You currently have ${usage.accountsCount} accounts. Please upgrade to add more accounts.`,
            messageAr: `لقد وصلت للحد الأقصى وهو ${limits.maxAccounts} حساب في خطة ${limits.planName}. لديك حالياً ${usage.accountsCount} حساب. يرجى الترقية لإضافة المزيد من الحسابات.`,
        };
    }

    return { allowed: true, message: '', messageAr: '' };
};

// التحقق من إمكانية إنشاء حملة جديدة
export const canCreateCampaign = (currentCampaignsCount: number): { allowed: boolean; message: string; messageAr: string } => {
    const limits = getCurrentPlanLimits();

    if (limits.maxCampaigns === -1) {
        return { allowed: true, message: '', messageAr: '' };
    }

    if (currentCampaignsCount >= limits.maxCampaigns) {
        return {
            allowed: false,
            message: `You have reached the maximum of ${limits.maxCampaigns} campaign(s) for your ${limits.planName} plan. You currently have ${currentCampaignsCount} campaigns. Please upgrade to create more campaigns.`,
            messageAr: `لقد وصلت للحد الأقصى وهو ${limits.maxCampaigns} حملة في خطة ${limits.planName}. لديك حالياً ${currentCampaignsCount} حملة. يرجى الترقية لإنشاء المزيد من الحملات.`,
        };
    }

    return { allowed: true, message: '', messageAr: '' };
};

// التحقق من إمكانية إنشاء حملة (مع Supabase)
export const canCreateCampaignAsync = async (userId: string): Promise<{ allowed: boolean; message: string; messageAr: string }> => {
    const [subscription, usage] = await Promise.all([
        getUserSubscription(userId),
        getUserUsage(userId),
    ]);

    const planId = subscription?.planId || 'free';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS['free'];

    if (limits.maxCampaigns === -1) {
        return { allowed: true, message: '', messageAr: '' };
    }

    if (usage.campaignsCount >= limits.maxCampaigns) {
        return {
            allowed: false,
            message: `You have reached the maximum of ${limits.maxCampaigns} campaign(s) for your ${limits.planName} plan. You currently have ${usage.campaignsCount} campaigns. Please upgrade to create more campaigns.`,
            messageAr: `لقد وصلت للحد الأقصى وهو ${limits.maxCampaigns} حملة في خطة ${limits.planName}. لديك حالياً ${usage.campaignsCount} حملة. يرجى الترقية لإنشاء المزيد من الحملات.`,
        };
    }

    return { allowed: true, message: '', messageAr: '' };
};

// ==================== دوال المساعدة ====================

// استرجاع نسبة الاستخدام
export const getUsagePercentage = (current: number, max: number): number => {
    if (max === -1) return 0;
    return Math.min((current / max) * 100, 100);
};

// استرجاع الحسابات المسموح بعرضها حسب الخطة
export const getVisibleAccounts = <T extends { customerId: string }>(
    allAccounts: T[],
    connectedOnly: boolean = true
): T[] => {
    const limits = getCurrentPlanLimits();

    if (limits.maxAccounts === -1) {
        return allAccounts;
    }

    return allAccounts.slice(0, limits.maxAccounts);
};

// التحقق من إمكانية استخدام ميزانية إضافية (مع Supabase)
export const canUseBudgetAsync = async (userId: string, additionalBudget: number): Promise<{
    allowed: boolean;
    message: string;
    messageAr: string;
    remaining: number;
    limit: number | null;
}> => {
    const [subscription, usage] = await Promise.all([
        getUserSubscription(userId),
        getUserUsage(userId),
    ]);

    const planId = subscription?.planId || 'free';
    const limits = PLAN_LIMITS[planId] || PLAN_LIMITS['free'];

    // Unlimited budget
    if (limits.monthlyBudget === null) {
        return { allowed: true, message: '', messageAr: '', remaining: Infinity, limit: null };
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // '2025-01'
    let currentUsed = usage.monthlyBudgetUsed || 0;

    // Reset if new month
    if ((usage as any).currentMonth !== currentMonth) {
        currentUsed = 0;
    }

    const remaining = limits.monthlyBudget - currentUsed;
    const monthlyBudgetNeeded = additionalBudget * 30; // Convert daily to monthly estimate

    if (monthlyBudgetNeeded > remaining) {
        return {
            allowed: false,
            message: `Monthly budget limit exceeded. Your ${limits.planName} plan allows $${limits.monthlyBudget}/month. Remaining: $${remaining.toFixed(2)}. Upgrade to increase your budget.`,
            messageAr: `تم تجاوز حد الميزانية الشهرية. خطة ${limits.planNameAr || limits.planName} تسمح بـ $${limits.monthlyBudget}/شهر. المتبقي: $${remaining.toFixed(2)}. قم بالترقية لزيادة ميزانيتك.`,
            remaining,
            limit: limits.monthlyBudget
        };
    }

    return { allowed: true, message: '', messageAr: '', remaining: remaining - monthlyBudgetNeeded, limit: limits.monthlyBudget };
};

// تحديث الميزانية الشهرية المستخدمة
export const updateMonthlyBudgetUsed = async (userId: string, amount: number): Promise<boolean> => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usage = await getUserUsage(userId);

        // Reset if new month
        let newUsed = amount;
        if ((usage as any).currentMonth === currentMonth) {
            newUsed = (usage.monthlyBudgetUsed || 0) + amount;
        }

        const { error } = await supabase
            .from('user_billing_usage')
            .upsert({
                user_id: userId,
                monthly_budget_used: newUsed,
                current_month: currentMonth,
                last_updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        return !error;
    } catch {
        return false;
    }
};

// تسجيل حملة جديدة في النظام
export const registerPlatformCampaign = async (data: {
    googleCampaignId: string;
    googleCampaignName?: string;
    customerId: string;
    source: 'furriyadh_managed' | 'self_managed';
    userId: string;
    userEmail?: string;
    campaignType?: string;
    dailyBudget?: number;
    currency?: string;
    websiteUrl?: string;
}): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('platform_created_campaigns')
            .upsert({
                google_campaign_id: data.googleCampaignId,
                google_campaign_name: data.googleCampaignName,
                customer_id: data.customerId,
                source: data.source,
                user_id: data.userId,
                user_email: data.userEmail,
                campaign_type: data.campaignType || 'SEARCH',
                daily_budget: data.dailyBudget || 0,
                currency: data.currency || 'USD',
                website_url: data.websiteUrl,
                status: 'active',
            }, { onConflict: 'google_campaign_id,customer_id' });

        if (error) {
            console.error('Error registering platform campaign:', error);
            return false;
        }

        // Update campaigns count
        await incrementCampaignsCount(data.userId);

        return true;
    } catch (e) {
        console.error('Error in registerPlatformCampaign:', e);
        return false;
    }
};

// زيادة عدد الحملات
export const incrementCampaignsCount = async (userId: string): Promise<boolean> => {
    try {
        const usage = await getUserUsage(userId);
        const newCount = (usage.campaignsCount || 0) + 1;

        const { error } = await supabase
            .from('user_billing_usage')
            .upsert({
                user_id: userId,
                campaigns_count: newCount,
                last_updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        return !error;
    } catch {
        return false;
    }
};

// جلب الحملات المنشأة من النظام فقط
export const getPlatformCampaignIds = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('platform_created_campaigns')
            .select('google_campaign_id')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error || !data) return [];

        return data.map(c => c.google_campaign_id);
    } catch {
        return [];
    }
};

// جلب كل الخطط من Supabase
export const getAllPlans = async (): Promise<PlanLimits[]> => {
    try {
        const { data, error } = await supabase
            .from('billing_plans')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (error || !data) {
            return Object.values(PLAN_LIMITS);
        }

        return data.map(plan => ({
            planId: plan.plan_id,
            planName: plan.plan_name,
            planNameAr: plan.plan_name_ar,
            maxAccounts: plan.max_accounts,
            maxCampaigns: plan.max_campaigns,
            monthlyBudget: plan.max_monthly_budget,
            monthlyPrice: plan.price_monthly || 0,
            yearlyPrice: plan.price_yearly || 0,
            features: plan.features || {},
        }));
    } catch {
        return Object.values(PLAN_LIMITS);
    }
};
