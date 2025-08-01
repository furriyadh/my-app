// AccountSettingsForm محدث مع Supabase - معدل لـ Dynamic Import
// مسار: src/components/Settings/AccountSettingsForm.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { UserService } from "@/services/userService";
import { UserProfile } from "@/types/user";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    // تحميل supabase client فقط في المتصفح
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);
  
  return supabase;
};

const AccountSettingsForm: React.FC = () => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
  
  // حالة لتخزين بيانات المستخدم
  const [userData, setUserData] = useState<UserProfile>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    date_of_birth: "",
    gender: "",
    skills: "",
    profession: "",
    company_name: "",
    company_website: "",
    bio: "",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
  });

  // حالات التحكم
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload image
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // جلب بيانات المستخدم عند تحميل المكون أو تغيير حالة المصادقة
  useEffect(() => {
    // التأكد من تحميل supabase قبل المتابعة
    if (!supabase) return;
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await UserService.getCurrentUserProfile();
        console.log("Fetch User Data Result:", result); // سجل تصحيح

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setUserData(result.data);
          console.log("User Data after setting state:", result.data); // سجل تصحيح
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع أثناء جلب البيانات");
        console.error("Error fetching user data:", err); // سجل تصحيح
      } finally {
        setLoading(false);
      }
    };

    // جلب البيانات عند تحميل المكون لأول مرة
    fetchUserData();

    // الاستماع لتغييرات حالة المصادقة مع تحديد أنواع البيانات
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          console.log("Auth state changed:", event, session); // سجل تصحيح
          fetchUserData(); // إعادة جلب البيانات عند تسجيل الدخول أو الخروج
        }
      }
    );

    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]); // إضافة supabase كتبعية

  // دالة لتحديث البيانات
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // إخفاء رسائل النجاح والخطأ عند التعديل
    if (successMessage) setSuccessMessage(null);
    if (error) setError(null);
  };

  // دالة لحفظ التغييرات
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // معالجة حقل تاريخ الميلاد: إذا كان فارغًا، أرسل null بدلاً من سلسلة فارغة
      const dataToSave = {
        ...userData,
        date_of_birth: userData.date_of_birth === "" ? null : userData.date_of_birth,
      };
      console.log("Data to Save:", dataToSave); // سجل تصحيح

      const result = await UserService.updateUserProfile(dataToSave);
      console.log("Update User Profile Result:", result); // سجل تصحيح

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("تم حفظ التغييرات بنجاح!");
        if (result.data) {
          setUserData(result.data);
          console.log("User Data after update and setting state:", result.data);
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء حفظ التغييرات");
      console.error("Error saving user data:", err); // سجل تصحيح
    } finally {
      setSaving(false);
    }
  };

  // دالة لرفع الصورة
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      try {
        setUploadingImage(true);
        setError(null);

        const result = await UserService.uploadProfileImage(file);
        console.log("Upload Image Result:", result); // سجل تصحيح

        if (result.error) {
          setError(result.error);
        } else if (result.url) {
          // تحديث رابط الصورة في البيانات
          const updatedData = { ...userData, profile_image_url: result.url };
          setUserData(updatedData);

          // حفظ رابط الصورة في قاعدة البيانات
          await UserService.updateUserProfile({ profile_image_url: result.url });

          setSuccessMessage("تم رفع الصورة بنجاح!");
        }
      } catch (err) {
        setError("حدث خطأ أثناء رفع الصورة");
        console.error("Error uploading image:", err); // سجل تصحيح
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // دالة لإعادة تعيين النموذج
  const handleCancel = () => {
    window.location.reload();
  };

  // عرض حالة التحميل
  if (loading || !supabase) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* رسائل النجاح والخطأ */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4">
            <p className="text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        <h5 className="!text-lg !mb-[6px]">Profile</h5>
        <p className="mb-[20px] md:mb-[25px]">
          Update your photo and personal details here.
        </p>
        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              First Name
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder="أدخل الاسم الأول"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Last Name
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder="أدخل اسم العائلة"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Email Address
            </label>
            <input
              type="email"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Phone Number
            </label>
            <input
              type="tel"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="أدخل رقم الهاتف"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Address
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="أدخل العنوان"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Country
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
            >
              <option value="">Select</option>
              <option value="saudi-arabia">Saudi Arabia</option>
              <option value="uae">United Arab Emirates</option>
              <option value="kuwait">Kuwait</option>
              <option value="qatar">Qatar</option>
              <option value="bahrain">Bahrain</option>
              <option value="oman">Oman</option>
              <option value="jordan">Jordan</option>
              <option value="lebanon">Lebanon</option>
              <option value="egypt">Egypt</option>
              <option value="morocco">Morocco</option>
              <option value="tunisia">Tunisia</option>
              <option value="algeria">Algeria</option>
              <option value="united-states">United States</option>
              <option value="united-kingdom">United Kingdom</option>
              <option value="canada">Canada</option>
              <option value="australia">Australia</option>
              <option value="germany">Germany</option>
              <option value="france">France</option>
              <option value="netherlands">Netherlands</option>
              <option value="sweden">Sweden</option>
              <option value="switzerland">Switzerland</option>
              <option value="japan">Japan</option>
            </select>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Date Of Birth
            </label>
            <input
              type="date"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.date_of_birth || ""}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Gender
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Your Skills
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
            >
              <option value="">Select</option>
              <option value="leadership">Leadership</option>
              <option value="project-management">Project Management</option>
              <option value="data-analysis">Data Analysis</option>
              <option value="teamwork">Teamwork</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="ui-ux-design">UI/UX Design</option>
              <option value="digital-marketing">Digital Marketing</option>
              <option value="content-writing">Content Writing</option>
              <option value="sales">Sales</option>
              <option value="customer-service">Customer Service</option>
              <option value="accounting">Accounting</option>
              <option value="finance">Finance</option>
              <option value="human-resources">Human Resources</option>
            </select>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Your Profession
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.profession}
              onChange={(e) => handleInputChange("profession", e.target.value)}
            >
              <option value="">Select</option>
              <option value="software-engineer">Software Engineer</option>
              <option value="web-developer">Web Developer</option>
              <option value="mobile-developer">Mobile Developer</option>
              <option value="data-scientist">Data Scientist</option>
              <option value="ui-ux-designer">UI/UX Designer</option>
              <option value="product-manager">Product Manager</option>
              <option value="project-manager">Project Manager</option>
              <option value="business-analyst">Business Analyst</option>
              <option value="digital-marketer">Digital Marketer</option>
              <option value="content-creator">Content Creator</option>
              <option value="graphic-designer">Graphic Designer</option>
              <option value="financial-analyst">Financial Analyst</option>
              <option value="accountant">Accountant</option>
              <option value="hr-specialist">HR Specialist</option>
              <option value="sales-representative">Sales Representative</option>
              <option value="customer-support">Customer Support</option>
              <option value="consultant">Consultant</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="freelancer">Freelancer</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Company Name
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="أدخل اسم الشركة"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Company Website
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.company_website}
              onChange={(e) => handleInputChange("company_website", e.target.value)}
              placeholder="أدخل موقع الشركة"
            />
          </div>

          <div className="sm:col-span-2 mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Bio
            </label>
            <textarea
              className="min-h-[100px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="أدخل نبذة عنك"
            ></textarea>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Facebook URL
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.facebook_url}
              onChange={(e) => handleInputChange("facebook_url", e.target.value)}
              placeholder="أدخل رابط فيسبوك"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              Twitter URL
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.twitter_url}
              onChange={(e) => handleInputChange("twitter_url", e.target.value)}
              placeholder="أدخل رابط تويتر"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              LinkedIn URL
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.linkedin_url}
              onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
              placeholder="أدخل رابط لينكد إن"
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              YouTube URL
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.youtube_url}
              onChange={(e) => handleInputChange("youtube_url", e.target.value)}
              placeholder="أدخل رابط يوتيوب"
            />
          </div>
        </div>

        <div className="mt-[25px] md:mt-[30px] lg:mt-[40px] flex items-center justify-end gap-[15px]">
          <button
            type="button"
            className="py-[15px] px-[25px] rounded-md text-black dark:text-white font-semibold text-md transition-all bg-gray-100 dark:bg-[#172036] hover:bg-gray-200 dark:hover:bg-[#1c2742]"
            onClick={handleCancel}
          >
            الغاء
          </button>
          <button
            type="submit"
            className="py-[15px] px-[25px] rounded-md text-white font-semibold text-md transition-all bg-primary-500 hover:bg-primary-400"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AccountSettingsForm;

