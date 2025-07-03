// lib/hooks/useCampaignData.ts

import { useState, useEffect, useContext } from 'react';
import { CampaignContext } from '@/lib/context/CampaignContext';
import { CampaignData, CampaignFormData, LocationData, BudgetData, ScheduleData, AdCreativeData } from '@/lib/types/campaign';

export const useCampaignData = () => {
  const context = useContext(CampaignContext);
  
  if (!context) {
    throw new Error('useCampaignData must be used within a CampaignProvider');
  }

  const { campaignData, setCampaignData } = context;

  // تحديث بيانات الحملة
  const updateCampaignData = async (data: Partial<CampaignData>) => {
    try {
      const updatedData = {
        ...campaignData,
        ...data,
        updatedAt: new Date()
      };
      
      setCampaignData(updatedData);
      
      // حفظ في Local Storage للاحتفاظ بالبيانات
      localStorage.setItem('campaignData', JSON.stringify(updatedData));
      
      return updatedData;
    } catch (error) {
      console.error('Error updating campaign data:', error);
      throw error;
    }
  };

  // تحديث المعلومات الأساسية
  const updateBasicInfo = async (data: CampaignFormData) => {
    return updateCampaignData({
      name: data.name,
      type: data.type!,
      websiteUrl: data.websiteUrl
    });
  };

  // تحديث بيانات الموقع
  const updateLocationData = async (data: LocationData) => {
    return updateCampaignData({
      targetLocation: data
    });
  };

  // تحديث بيانات الميزانية والجدولة
  const updateBudgetAndSchedule = async (budget: BudgetData, schedule: ScheduleData) => {
    return updateCampaignData({
      budget,
      schedule
    });
  };

  // تحديث بيانات الإعلان
  const updateAdCreative = async (data: AdCreativeData) => {
    return updateCampaignData({
      adCreative: data
    });
  };

  // التحقق من صحة خطوة معينة
  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1: // المعلومات الأساسية
        if (!campaignData?.name?.trim()) {
          errors.push('اسم الحملة مطلوب');
        }
        if (!campaignData?.type) {
          errors.push('نوع الإعلان مطلوب');
        }
        if (!campaignData?.websiteUrl?.trim()) {
          errors.push('رابط الموقع مطلوب');
        } else if (!campaignData.websiteUrl.startsWith('https://')) {
          errors.push('يجب أن يبدأ الرابط بـ https://');
        }
        break;

      case 2: // الاستهداف الجغرافي
        if (!campaignData?.targetLocation?.name) {
          errors.push('يجب تحديد الموقع المستهدف');
        }
        if (!campaignData?.targetLocation?.coordinates) {
          errors.push('يجب تحديد إحداثيات الموقع');
        }
        break;

      case 3: // الميزانية والجدولة
        if (!campaignData?.budget?.dailyAmount || campaignData.budget.dailyAmount < 3) {
          errors.push('الميزانية اليومية يجب أن تكون 3$ على الأقل');
        }
        if (!campaignData?.schedule?.type) {
          errors.push('يجب تحديد جدولة الإعلانات');
        }
        break;

      case 4: // تصميم الإعلان
        if (!campaignData?.adCreative?.headlines?.length) {
          errors.push('يجب إضافة عناوين للإعلان');
        }
        if (!campaignData?.adCreative?.descriptions?.length) {
          errors.push('يجب إضافة أوصاف للإعلان');
        }
        // التحقق من متطلبات نوع الإعلان المحدد
        if (campaignData?.type === 'call' && !campaignData?.adCreative?.phoneNumber) {
          errors.push('رقم الهاتف مطلوب لإعلانات الاتصال');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // التحقق من اكتمال جميع الخطوات
  const isCompleted = (): boolean => {
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step).isValid) {
        return false;
      }
    }
    return true;
  };

  // إعادة تعيين بيانات الحملة
  const resetCampaignData = () => {
    setCampaignData(null);
    localStorage.removeItem('campaignData');
  };

  // حفظ الحملة (إرسال للباك اند)
  const saveCampaign = async () => {
    try {
      if (!isCompleted()) {
        throw new Error('الحملة غير مكتملة');
      }

      const response = await fetch('/api/google-ads/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء الحملة');
      }

      const result = await response.json();
      
      // تحديث حالة الحملة
      await updateCampaignData({
        status: 'pending',
        ...result
      });

      return result;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  };

  // استرداد بيانات الحملة من Local Storage عند التحميل
  useEffect(() => {
    const savedData = localStorage.getItem('campaignData');
    if (savedData && !campaignData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCampaignData(parsedData);
      } catch (error) {
        console.error('Error parsing saved campaign data:', error);
        localStorage.removeItem('campaignData');
      }
    }
  }, [campaignData, setCampaignData]);

  return {
    campaignData,
    updateCampaignData,
    updateBasicInfo,
    updateLocationData,
    updateBudgetAndSchedule,
    updateAdCreative,
    validateStep,
    isCompleted,
    resetCampaignData,
    saveCampaign
  };
};

