// ملف الأنواع (Types) للمستخدم
// مسار: src/types/user.ts

export interface UserProfile {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  date_of_birth: string | null; // تم التعديل للسماح بقيمة null
  gender: string;
  skills: string;
  profession: string;
  company_name: string;
  company_website: string;
  bio: string;
  profile_image_url?: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileResponse {
  data: UserProfile | null;
  error: string | null;
}
