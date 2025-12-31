// AccountSettingsForm محدث مع Supabase و دعم الترجمة
// مسار: src/components/Settings/AccountSettingsForm.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { UserService } from "@/services/userService";
import { UserProfile } from "@/types/user";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);

  return supabase;
};

const AccountSettingsForm: React.FC = () => {
  const supabase = useSupabaseClient();
  const { t } = useTranslation();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!supabase) return;

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
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          fetchUserData();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (successMessage) setSuccessMessage(null);
    if (error) setError(null);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const dataToSave = {
        ...userData,
        date_of_birth: userData.date_of_birth === "" ? null : userData.date_of_birth,
      };

      const result = await UserService.updateUserProfile(dataToSave);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(t.settings?.saveSuccess || "Changes saved successfully!");
        if (result.data) {
          setUserData(result.data);
        }
      }
    } catch (err) {
      setError(t.settings?.saveError || "An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        setUploadingImage(true);
        setError(null);
        const result = await UserService.uploadProfileImage(file);
        if (result.error) {
          setError(result.error);
        } else if (result.url) {
          const updatedData = { ...userData, profile_image_url: result.url };
          setUserData(updatedData);
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

  const handleCancel = () => {
    window.location.reload();
  };

  if (!supabase) {
    return null;
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
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

        <h5 className="!text-lg !mb-[6px]">{t.settings?.profile || "Profile"}</h5>
        <p className="mb-[20px] md:mb-[25px]">
          {t.settings?.profileDesc || "Update your photo and personal details here."}
        </p>

        <div className="sm:grid sm:grid-cols-2 sm:gap-[25px]">
          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.firstName || "First Name"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder={t.settings?.placeholders?.firstName || "Enter first name"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.lastName || "Last Name"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder={t.settings?.placeholders?.lastName || "Enter last name"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.emailAddress || "Email Address"}
            </label>
            <input
              type="email"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t.settings?.placeholders?.email || "Enter email address"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.phoneNumber || "Phone Number"}
            </label>
            <input
              type="tel"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={t.settings?.placeholders?.phone || "Enter phone number"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.address || "Address"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={t.settings?.placeholders?.address || "Enter address"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.country || "Country"}
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
            >
              <option value="">{t.settings?.select || "Select"}</option>
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
              {t.settings?.dateOfBirth || "Date Of Birth"}
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
              {t.settings?.gender || "Gender"}
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            >
              <option value="">{t.settings?.select || "Select"}</option>
              <option value="male">{t.settings?.male || "Male"}</option>
              <option value="female">{t.settings?.female || "Female"}</option>
              <option value="prefer-not-to-say">{t.settings?.preferNotToSay || "Prefer not to say"}</option>
            </select>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.yourSkills || "Your Skills"}
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
            >
              <option value="">{t.settings?.select || "Select"}</option>
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
              {t.settings?.yourProfession || "Your Profession"}
            </label>
            <select
              className="h-[55px] rounded-md border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[13px] block w-full outline-0 cursor-pointer transition-all focus:border-primary-500 text-black dark:text-white"
              value={userData.profession}
              onChange={(e) => handleInputChange("profession", e.target.value)}
            >
              <option value="">{t.settings?.select || "Select"}</option>
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
              {t.settings?.companyName || "Company Name"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder={t.settings?.placeholders?.companyName || "Enter company name"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.companyWebsite || "Company Website"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.company_website}
              onChange={(e) => handleInputChange("company_website", e.target.value)}
              placeholder={t.settings?.placeholders?.companyWebsite || "Enter company website"}
            />
          </div>

          <div className="sm:col-span-2 mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.bio || "Bio"}
            </label>
            <textarea
              className="min-h-[100px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[15px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder={t.settings?.placeholders?.bio || "Enter your bio"}
            ></textarea>
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.facebookUrl || "Facebook URL"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.facebook_url}
              onChange={(e) => handleInputChange("facebook_url", e.target.value)}
              placeholder={t.settings?.placeholders?.facebook || "Enter Facebook URL"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.twitterUrl || "Twitter URL"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.twitter_url}
              onChange={(e) => handleInputChange("twitter_url", e.target.value)}
              placeholder={t.settings?.placeholders?.twitter || "Enter Twitter URL"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.linkedinUrl || "LinkedIn URL"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.linkedin_url}
              onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
              placeholder={t.settings?.placeholders?.linkedin || "Enter LinkedIn URL"}
            />
          </div>

          <div className="mb-[20px] sm:mb-0">
            <label className="mb-[10px] font-medium block text-black dark:text-white">
              {t.settings?.youtubeUrl || "YouTube URL"}
            </label>
            <input
              type="text"
              className="h-[55px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
              value={userData.youtube_url}
              onChange={(e) => handleInputChange("youtube_url", e.target.value)}
              placeholder={t.settings?.placeholders?.youtube || "Enter YouTube URL"}
            />
          </div>
        </div>

        <div className="mt-[25px] md:mt-[30px] lg:mt-[40px] flex items-center justify-end gap-[15px]">
          <button
            type="button"
            className="py-[15px] px-[25px] rounded-md text-black dark:text-white font-semibold text-md transition-all bg-gray-100 dark:bg-[#172036] hover:bg-gray-200 dark:hover:bg-[#1c2742]"
            onClick={handleCancel}
          >
            {t.settings?.cancel || "Cancel"}
          </button>
          <button
            type="submit"
            className="py-[15px] px-[25px] rounded-md text-white font-semibold text-md transition-all bg-primary-500 hover:bg-primary-400"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (t.settings?.saving || "Saving...") : (t.settings?.saveChanges || "Save Changes")}
          </button>
        </div>
      </form>
    </>
  );
};

export default AccountSettingsForm;
