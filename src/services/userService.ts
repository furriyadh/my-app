// خدمات المستخدم (User Services)
// مسار: src/services/userService.ts

import { supabase } from '@/utils/supabase/client';
import { UserProfile, UserProfileResponse } from '@/types/user';

export class UserService {
  // جلب بيانات المستخدم الحالي
  static async getCurrentUserProfile(): Promise<UserProfileResponse> {
    console.log("UserService: Attempting to fetch current user profile...");
    try {
      // الحصول على الجلسة الحالية أولاً
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error("UserService: Session error or no user in session:", sessionError);
        return {
          data: null,
          error: 'المستخدم غير مسجل الدخول أو الجلسة غير صالحة'
        };
      }

      const user = session.user; // استخدام المستخدم من الجلسة
      console.log("UserService: User found from session:", user.id);

      // جلب بيانات الملف الشخصي
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("UserService: Error fetching user profile from DB:", JSON.stringify(error, null, 2)); // سجل تصحيح مفصل
        // إذا لم يوجد ملف شخصي، إنشاء واحد جديد بالبيانات الأساسية
        if (error.code === 'PGRST116') { // PGRST116 means no rows found
          console.log("UserService: No profile found, creating new one...");
          const newProfile: Partial<UserProfile> = {
            user_id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.full_name?.split(" ")[0] || "",
            last_name: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
            phone: '',
            address: '',
            country: '',
            date_of_birth: null, // Ensure null for initial empty date
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
            console.error("UserService: Error creating new profile:", JSON.stringify(insertError, null, 2)); // سجل تصحيح مفصل
            return {
              data: null,
              error: `خطأ في إنشاء الملف الشخصي: ${insertError.message}`
            };
          }
          console.log("UserService: New profile created:", newData);
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
      console.log("UserService: Profile fetched successfully:", data);
      return {
        data: data,
        error: null
      };
    } catch (error) {
      console.error("UserService: Unexpected error in getCurrentUserProfile:", error);
      return {
        data: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // تحديث بيانات المستخدم
  static async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfileResponse> {
    console.log("UserService: Attempting to update user profile with data:", profileData);
    try {
      // الحصول على الجلسة الحالية أولاً
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error("UserService: Session error or no user in session during update:", sessionError);
        return {
          data: null,
          error: 'المستخدم غير مسجل الدخول أو الجلسة غير صالحة'
        };
      }

      const user = session.user; // استخدام المستخدم من الجلسة
      console.log("UserService: User found for update from session:", user.id);

      // استخدام upsert لإنشاء أو تحديث الملف الشخصي
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profileData,
          user_id: user.id, // تأكد من وجود user_id لتحديد السجل
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select();

      if (error) {
        console.error("UserService: Error updating user profile:", JSON.stringify(error, null, 2)); // سجل تصحيح مفصل
        return {
          data: null,
          error: `خطأ في تحديث البيانات: ${error.message}`
        };
      }

      // بما أننا أزلنا .single()، فإن data ستكون مصفوفة. نأخذ العنصر الأول.
      console.log("UserService: Profile updated successfully:", data);
      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null
      };
    } catch (error) {
      console.error("UserService: Unexpected error in updateUserProfile:", error);
      return {
        data: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // رفع صورة الملف الشخصي
  static async uploadProfileImage(file: File): Promise<{ url: string | null; error: string | null }> {
    console.log("UserService: Attempting to upload profile image...");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("UserService: Auth error or no user found for image upload:", authError);
        return {
          url: null,
          error: 'المستخدم غير مسجل الدخول'
        };
      }
      console.log("UserService: User found for image upload:", user.id);

      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      console.log("UserService: Uploading file with name:", fileName);

      // رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (error) {
        console.error("UserService: Error uploading image to storage:", error);
        return {
          url: null,
          error: `خطأ في رفع الصورة: ${error.message}`
        };
      }
      console.log("UserService: Image uploaded to storage:", data);

      // الحصول على الرابط العام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      console.log("UserService: Public URL for image:", publicUrl);

      return {
        url: publicUrl,
        error: null
      };
    } catch (error) {
      console.error("UserService: Unexpected error in uploadProfileImage:", error);
      return {
        url: null,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }

  // حذف الملف الشخصي
  static async deleteUserProfile(): Promise<{ success: boolean; error: string | null }> {
    console.log("UserService: Attempting to delete user profile...");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("UserService: Auth error or no user found for profile deletion:", authError);
        return {
          success: false,
          error: 'المستخدم غير مسجل الدخول'
        };
      }
      console.log("UserService: User found for profile deletion:", user.id);

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error("UserService: Error deleting user profile:", error);
        return {
          success: false,
          error: `خطأ في حذف الملف الشخصي: ${error.message}`
        };
      }
      console.log("UserService: User profile deleted successfully.");
      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error("UserService: Unexpected error in deleteUserProfile:", error);
      return {
        success: false,
        error: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      };
    }
  }
}