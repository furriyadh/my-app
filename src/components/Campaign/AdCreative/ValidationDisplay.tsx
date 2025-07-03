'use client';

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface ValidationRule {
  id: string;
  field: string;
  message: string;
  status: 'valid' | 'warning' | 'error' | 'info';
  required: boolean;
}

interface ValidationDisplayProps {
  validations: ValidationRule[];
  adType: 'search' | 'call' | 'text' | 'youtube' | 'gmail';
  className?: string;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validations,
  adType,
  className = ''
}) => {
  const getStatusIcon = (status: ValidationRule['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ValidationRule['status']) => {
    switch (status) {
      case 'valid':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const validCount = validations.filter(v => v.status === 'valid').length;
  const errorCount = validations.filter(v => v.status === 'error').length;
  const warningCount = validations.filter(v => v.status === 'warning').length;
  const requiredCount = validations.filter(v => v.required).length;
  const completedRequiredCount = validations.filter(v => v.required && v.status === 'valid').length;

  const getAdTypeTitle = (type: string) => {
    switch (type) {
      case 'search':
        return 'إعلانات البحث';
      case 'call':
        return 'إعلانات المكالمات';
      case 'text':
        return 'الإعلانات النصية';
      case 'youtube':
        return 'إعلانات YouTube';
      case 'gmail':
        return 'إعلانات Gmail';
      default:
        return 'الإعلان';
    }
  };

  const isReadyToLaunch = errorCount === 0 && completedRequiredCount === requiredCount;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">التحقق من صحة الإعلان</h3>
        <div className="flex items-center gap-2">
          {isReadyToLaunch ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              جاهز للإطلاق
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              يحتاج مراجعة
            </div>
          )}
        </div>
      </div>

      {/* ملخص الحالة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{validCount}</div>
          <div className="text-xs text-green-700">مكتمل</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs text-red-700">أخطاء</div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
          <div className="text-xs text-yellow-700">تحذيرات</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{completedRequiredCount}/{requiredCount}</div>
          <div className="text-xs text-blue-700">مطلوب</div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">التقدم الإجمالي</span>
          <span className="text-sm text-gray-600">
            {Math.round((validCount / validations.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(validCount / validations.length) * 100}%` }}
          />
        </div>
      </div>

      {/* قائمة التحققات */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800 mb-3">
          متطلبات {getAdTypeTitle(adType)}
        </h4>
        
        {validations.map((validation) => (
          <div
            key={validation.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(validation.status)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(validation.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {validation.field}
                </span>
                {validation.required && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    مطلوب
                  </span>
                )}
              </div>
              <p className="text-sm mt-1 opacity-90">
                {validation.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* نصائح للتحسين */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">نصائح للتحسين</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {errorCount > 0 && (
              <li>• أكمل جميع الحقول المطلوبة المميزة باللون الأحمر</li>
            )}
            {warningCount > 0 && (
              <li>• راجع التحذيرات لتحسين أداء الإعلان</li>
            )}
            <li>• تأكد من أن جميع الروابط تعمل بشكل صحيح</li>
            <li>• استخدم كلمات مفتاحية قوية في العناوين</li>
            <li>• تأكد من أن المحتوى يتوافق مع سياسات Google Ads</li>
          </ul>
        </div>
      )}

      {/* حالة الاستعداد للإطلاق */}
      <div className={`mt-6 p-4 rounded-lg border-2 ${
        isReadyToLaunch 
          ? 'bg-green-50 border-green-200' 
          : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-center gap-3">
          {isReadyToLaunch ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">
                  الإعلان جاهز للإطلاق! 🎉
                </div>
                <div className="text-sm text-green-700 mt-1">
                  تم استيفاء جميع المتطلبات الأساسية. يمكنك الآن المتابعة لإطلاق الحملة.
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-800">
                  يحتاج إلى مراجعة
                </div>
                <div className="text-sm text-orange-700 mt-1">
                  {errorCount > 0 && `يوجد ${errorCount} خطأ يجب إصلاحه قبل الإطلاق. `}
                  {completedRequiredCount < requiredCount && 
                    `يجب إكمال ${requiredCount - completedRequiredCount} حقل مطلوب إضافي.`
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

