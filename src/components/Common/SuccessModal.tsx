'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X, ExternalLink, BarChart3 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { CampaignData } from '../../lib/types/campaign';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignData: CampaignData;
  onCreateNew: () => void;
  onGoToDashboard: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  campaignData,
  onCreateNew,
  onGoToDashboard
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎉 تم إطلاق الحملة بنجاح!
          </h2>

          <p className="text-gray-600">
            تم إنشاء وإطلاق حملتك الإعلانية بنجاح
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* معلومات الحملة */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">اسم الحملة:</span>
                <span className="text-sm text-green-700 font-medium">{campaignData.name || 'حملة جديدة'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">نوع الحملة:</span>
                <span className="text-sm text-green-700">{campaignData.type || 'غير محدد'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">الميزانية اليومية:</span>
                <span className="text-sm text-green-700">
                  {campaignData.budget?.dailyAmount || 0} {campaignData.budget?.currency || 'SAR'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">الحالة:</span>
                <span className="text-sm text-green-700 bg-green-200 px-2 py-1 rounded">
                  نشطة
                </span>
              </div>
            </div>
          </Card>

          {/* الخطوات التالية */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">الخطوات التالية:</h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>ستبدأ الحملة في الظهور خلال 15-30 دقيقة</span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>يمكنك متابعة الأداء من لوحة التحكم</span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>ستصلك تقارير يومية عن أداء الحملة</span>
              </div>
            </div>
          </div>

          {/* نصائح سريعة */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 نصائح لتحسين الأداء:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• راقب الأداء خلال أول 48 ساعة</li>
              <li>• اضبط الميزانية حسب النتائج</li>
              <li>• جرب كلمات مفتاحية جديدة</li>
              <li>• حسّن صفحة الهبوط للحصول على تحويلات أفضل</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onGoToDashboard}
            className="w-full flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            عرض لوحة التحكم
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onCreateNew}
              className="flex items-center justify-center gap-2"
            >
              إنشاء حملة أخرى
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center justify-center gap-2"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

