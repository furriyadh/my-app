'use client';

import React, { useState } from 'react';
import { Mail, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface GmailAdsFormData {
  senderName: string;
  subject: string;
  description: string;
  finalUrl: string;
  displayUrl: string;
  logo?: File;
  headerImage?: File;
  adFormat: 'single-promotion' | 'multi-product';
  products?: {
    title: string;
    description: string;
    price: string;
    image?: File;
  }[];
}

interface GmailAdsFormProps {
  data?: GmailAdsFormData;
  onChange: (data: GmailAdsFormData) => void;
  errors?: Record<string, string>;
}

export const GmailAdsForm: React.FC<GmailAdsFormProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  const [formData, setFormData] = useState<GmailAdsFormData>(
    data || {
      senderName: '',
      subject: '',
      description: '',
      finalUrl: '',
      displayUrl: '',
      adFormat: 'single-promotion',
      products: []
    }
  );

  const handleChange = (field: keyof GmailAdsFormData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const handleFileUpload = (field: 'logo' | 'headerImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange(field, file);
    }
  };

  const addProduct = () => {
    const newProducts = [
      ...(formData.products || []),
      { title: '', description: '', price: '' }
    ];
    handleChange('products', newProducts);
  };

  const updateProduct = (index: number, field: string, value: string | File) => {
    const newProducts = [...(formData.products || [])];
    newProducts[index] = { ...newProducts[index], [field]: value };
    handleChange('products', newProducts);
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.products?.filter((_, i) => i !== index) || [];
    handleChange('products', newProducts);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">إعلانات Gmail</h3>
            <p className="text-sm text-gray-600">إعلانات تفاعلية في صندوق الوارد</p>
          </div>
        </div>

        {/* نوع الإعلان */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            نوع الإعلان *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => handleChange('adFormat', 'single-promotion')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.adFormat === 'single-promotion'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-800">ترويج واحد</div>
              <div className="text-sm text-gray-600 mt-1">إعلان لمنتج أو خدمة واحدة</div>
            </div>
            
            <div
              onClick={() => handleChange('adFormat', 'multi-product')}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.adFormat === 'multi-product'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-800">منتجات متعددة</div>
              <div className="text-sm text-gray-600 mt-1">عرض عدة منتجات في إعلان واحد</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* معلومات الإعلان الأساسية */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المرسل * (حتى 20 حرف)
              </label>
              <Input
                value={formData.senderName}
                onChange={(e) => handleChange('senderName', e.target.value)}
                placeholder="مثال: متجر الأناقة"
                maxLength={20}
                error={errors.senderName}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.senderName.length}/20 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                موضوع الرسالة * (حتى 25 حرف)
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="مثال: عروض حصرية لك!"
                maxLength={25}
                error={errors.subject}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.subject.length}/25 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف * (حتى 90 حرف)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="مثال: اكتشف مجموعتنا الجديدة من الأزياء العصرية بخصومات تصل إلى 50%"
                maxLength={90}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/90 حرف
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرابط النهائي *
              </label>
              <Input
                value={formData.finalUrl}
                onChange={(e) => handleChange('finalUrl', e.target.value)}
                placeholder="https://example.com"
                error={errors.finalUrl}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط العرض
              </label>
              <Input
                value={formData.displayUrl}
                onChange={(e) => handleChange('displayUrl', e.target.value)}
                placeholder="example.com"
              />
            </div>
          </div>

          {/* الصور والشعار */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شعار الشركة
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('logo', e)}
                  className="hidden"
                  id="gmail-logo-upload"
                />
                <label htmlFor="gmail-logo-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {formData.logo ? formData.logo.name : 'اختر شعار الشركة'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    144x144 بكسل، PNG/JPG
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الرأس
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('headerImage', e)}
                  className="hidden"
                  id="gmail-header-upload"
                />
                <label htmlFor="gmail-header-upload" className="cursor-pointer">
                  <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    {formData.headerImage ? formData.headerImage.name : 'اختر صورة الرأس'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    650x200 بكسل، PNG/JPG
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* منتجات متعددة */}
        {formData.adFormat === 'multi-product' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">المنتجات</h4>
              <Button
                variant="outline"
                onClick={addProduct}
                className="flex items-center gap-2"
                disabled={(formData.products?.length || 0) >= 4}
              >
                <Upload className="w-4 h-4" />
                إضافة منتج
              </Button>
            </div>

            {formData.products?.map((product, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المنتج
                    </label>
                    <Input
                      value={product.title}
                      onChange={(e) => updateProduct(index, 'title', e.target.value)}
                      placeholder="مثال: فستان صيفي"
                      maxLength={25}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <Input
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      placeholder="مثال: قطن عالي الجودة"
                      maxLength={35}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر
                    </label>
                    <Input
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', e.target.value)}
                      placeholder="مثال: 299 ريال"
                    />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateProduct(index, 'image', file);
                      }}
                      className="hidden"
                      id={`product-image-${index}`}
                    />
                    <label
                      htmlFor={`product-image-${index}`}
                      className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                    >
                      {product.image ? product.image.name : 'اختر صورة المنتج'}
                    </label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* معاينة الإعلان */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">معاينة الإعلان</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-md">
            {/* رأس الرسالة */}
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-800">
                    {formData.senderName || 'اسم المرسل'}
                  </div>
                  <div className="text-xs text-gray-600">إعلان</div>
                </div>
              </div>
              <div className="font-medium text-gray-800 mt-2">
                {formData.subject || 'موضوع الرسالة'}
              </div>
            </div>
            
            {/* محتوى الإعلان */}
            <div className="p-4">
              {formData.headerImage && (
                <div className="w-full h-24 bg-gray-200 rounded mb-3"></div>
              )}
              
              <div className="text-sm text-gray-700 mb-3">
                {formData.description || 'الوصف'}
              </div>
              
              {formData.adFormat === 'multi-product' && formData.products && formData.products.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.products.slice(0, 2).map((product, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{product.title || `منتج ${index + 1}`}</div>
                        <div className="text-xs text-gray-600">{product.price || 'السعر'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button size="sm" className="w-full">
                عرض التفاصيل
              </Button>
            </div>
          </div>
        </div>

        {/* نصائح لإعلانات Gmail */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">نصائح لإعلانات Gmail الفعالة</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• استخدم موضوع جذاب ومثير للاهتمام</li>
            <li>• اجعل الوصف واضحاً ومحدداً</li>
            <li>• استخدم صوراً عالية الجودة</li>
            <li>• أضف عرض قيمة واضح</li>
            <li>• تأكد من أن المحتوى متسق مع علامتك التجارية</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

