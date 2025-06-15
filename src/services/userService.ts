// خدمات المستخدم (User Services)
// مسار: src/services/userService.ts

import { supabase } from '@/utils/supabase/client';
import { UserProfile, UserProfileResponse } from '@/types/user';

export class UserService {
  // جلب بيانات المستخدم الحالي
  static async getCurrentUserProfile(): Promise<UserProfileResponse> {
    try {
      // الحصول على المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          data: null,
          error: 'المستخدم غير مسجل الدخول'
        };
      }

      // جلب بيانات الملف الشخصي
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // إذا لم يوجد ملف شخصي، إنشاء واحد جديد بالبيانات الأساسية
        if (error.code === 'PGRST116') {
          const newProfile: Partial<UserProfile> = {
            user_id: user.id,
            email: user.email || '',
            first_name: '',
            last_name: '',
            phone: '',
            address: '',
            country: '',
            date_of_birth: '',
            gender: '',
            skills: '',
            profession: '',
            company_name: '',
            company_website: '',
            bio: '',
            facebook_url: '',
            twitter_url: '',
            linkedin_url: '',
            youtube_url: ''
          };

          const { data: newData, error: insertError } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single();

          if (insertError) {
            return {
              data: null,
              error: `خطأ في إنشاء الملف الشخصي: ${insertError.message}`
            };
          }

          return {
            data: newData,
            error: null
          };
        }

        return {
          data: null,
          error: `خطأ في جلب البيانات: ${error.message}`
        };
      }

      return {
        data: data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // تحديث بيانات المستخدم
  static async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfileResponse> {
    try {
      // الحصول على المستخدم الحالي
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          data: null,
          error: 'المستخدم غير مسجل الدخول'
        };
      }

      // تحديث البيانات
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: `خطأ في تحديث البيانات: ${error.message}`
        };
      }

      return {
        data: data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // رفع صورة الملف الشخصي
  static async uploadProfileImage(file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          url: null,
          error: 'المستخدم غير مسجل الدخول'
        };
      }

      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (error) {
        return {
          url: null,
          error: `خطأ في رفع الصورة: ${error.message}`
        };
      }

      // الحصول على الرابط العام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        error: null
      };
    } catch (error) {
      return {
        url: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // حذف الملف الشخصي
  static async deleteUserProfile(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'المستخدم غير مسجل الدخول'
        };
      }

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return {
          success: false,
          error: `خطأ في حذف الملف الشخصي: ${error.message}`
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }
}