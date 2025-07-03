'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampaignContext } from '../../../lib/context/CampaignContext';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { ConfettiEffect } from '../../../components/common/ConfettiEffect';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CheckCircle, TrendingUp, Users, MousePointer, DollarSign, Calendar, MapPin, Megaphone } from 'lucide-react';

export default function CampaignSuccessPage() {
  const router = useRouter();
  const { state, clearCampaignData } = useCampaignContext();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // إيقاف الكونفيتي بعد 5 ثوانٍ
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateNewCampaign = () => {
    clearCampaignData();
    router.push('/campaign/new');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const campaignData = state.campaignData;

  // إحصائيات متوقعة للحملة
  const estimatedStats = {
    reach: campaignData.budget?.dailyAmount ? Math.floor(campaignData.budget.dailyAmount * 50) : 1500,
    clicks: campaignData.budget?.dailyAmount ? Math.floor(campaignData.budget.dailyAmount * 5) : 75,
    cpc: campaignData.budget?.dailyAmount ? (campaignData.budget.dailyAmount / Math.floor(campaignData.budget.dailyAmount * 5)).toFixed(2) : '0.40',
    monthlyBudget: campaignData.budget?.dailyAmount ? campaignData.budget.dailyAmount * 30 : 90
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* تأثير الكونفيتي */}
      {showConfetti && <ConfettiEffect />}

      {/* نافذة النجاح */}
      {showModal && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          campaignData={campaignData}
          onCreateNew={handleCreateNewCampaign}
          onGoToDashboard={handleGoToDashboard}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎉 تم إطلاق حملتك بنجاح!
          </h1>
          <p className="text-xl text-gray-600">
            حملة "{campaignData.name || 'حملة جديدة'}" جاهزة الآن وتعمل
          </p>
        </div>

        {/* معلومات الحملة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* تفاصيل الحملة */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Megaphone className="w-6 h-6 ml-2 text-blue-600" />
              تفاصيل الحملة
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">اسم الحملة:</span>
                <span className="font-semibold">{campaignData.name || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">نوع الحملة:</span>
                <span className="font-semibold">{campaignData.type || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">الموقع الإلكتروني:</span>
                <span className="font-semibold">{campaignData.websiteUrl || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">الميزانية اليومية:</span>
                <span className="font-semibold text-green-600">
                  {campaignData.budget?.dailyAmount || 0} {campaignData.budget?.currency || 'SAR'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">الموقع المستهدف:</span>
                <span className="font-semibold">
                  {campaignData.targetLocation?.name || 'غير محدد'}
                </span>
              </div>
            </div>
          </Card>

          {/* الإحصائيات المتوقعة */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 ml-2 text-green-600" />
              الإحصائيات المتوقعة
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{estimatedStats.reach.toLocaleString()}</div>
                <div className="text-sm text-gray-600">وصول متوقع يومياً</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <MousePointer className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{estimatedStats.clicks}</div>
                <div className="text-sm text-gray-600">نقرات متوقعة يومياً</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{estimatedStats.cpc}</div>
                <div className="text-sm text-gray-600">متوسط تكلفة النقرة</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{estimatedStats.monthlyBudget}</div>
                <div className="text-sm text-gray-600">الميزانية الشهرية</div>
              </div>
            </div>
          </Card>
        </div>

        {/* الموقع المستهدف */}
        {campaignData.targetLocation && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-6 h-6 ml-2 text-red-600" />
              الموقع المستهدف
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-900">{campaignData.targetLocation.name}</div>
              <div className="text-sm text-gray-600">{campaignData.targetLocation.country}</div>
              <div className="text-xs text-gray-500 mt-1">
                التوقيت المحلي: {campaignData.targetLocation.timezone}
              </div>
            </div>
          </Card>
        )}

        {/* نصائح لتحسين الأداء */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            💡 نصائح لتحسين أداء حملتك
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">خلال أول 24 ساعة:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• راقب معدل النقر (CTR) - يجب أن يكون أعلى من 2%</li>
                <li>• تحقق من جودة النقرات والتحويلات</li>
                <li>• اضبط الميزانية حسب الأداء الأولي</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">خلال أول أسبوع:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• حلل البيانات وحدد أفضل الأوقات</li>
                <li>• اختبر عناوين وأوصاف مختلفة</li>
                <li>• وسع الاستهداف للمواقع الأكثر نجاحاً</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* أزرار العمل */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            انتقل إلى لوحة التحكم
          </Button>
          <Button
            onClick={handleCreateNewCampaign}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
          >
            إنشاء حملة جديدة
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
          >
            عرض التفاصيل مرة أخرى
          </Button>
        </div>

        {/* معلومات إضافية */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            ستتلقى تقريراً يومياً عن أداء حملتك على البريد الإلكتروني المسجل
          </p>
          <p className="text-xs mt-2">
            يمكنك تعديل إعدادات الحملة في أي وقت من لوحة التحكم
          </p>
        </div>
      </div>
    </div>
  );
}

