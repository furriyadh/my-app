// AccountSettingsForm محدث مع Supabase
// مسار: src/components/Settings/AccountSettingsForm.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserService } from "@/services/userService";
import { UserProfile } from "@/types/user";

const AccountSettingsForm: React.FC = () => {
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

  // جلب بيانات المستخدم عند تحميل المكون
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await UserService.getCurrentUserProfile();

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setUserData(result.data);
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

      const result = await UserService.updateUserProfile(dataToSave);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("تم حفظ التغييرات بنجاح!");
        if (result.data) {
          setUserData(result.data);
        }
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع أثناء حفظ التغييرات");
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
  if (loading) {
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
              Bio
            </label>
            <textarea
              className="h-[120px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="أدخل نبذة عنك"
            ></textarea>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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
            <label className="mb-[10px] text-black dark:text-white font-medium block">
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

        <div className="flex items-center gap-[15px] mt-[25px]">
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving}
            className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-black dark:text-white bg-gray-200 dark:bg-[#172036] hover:bg-gray-300 dark:hover:bg-[#212e48]"
          >
            إلغاء
          </button>
        </div>
      </form>
    </>
  );
};

export default AccountSettingsForm;
