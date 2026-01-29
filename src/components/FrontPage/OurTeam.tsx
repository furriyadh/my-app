"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Linkedin, Twitter, Mail } from "lucide-react";

interface TeamMember {
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    nameEn: "Ahmed Al-Rashid",
    nameAr: "أحمد الراشد",
    roleEn: "CEO & Founder",
    roleAr: "الرئيس التنفيذي والمؤسس",
    image: "/images/front-pages/team1.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/",
      twitter: "https://x.com/",
      email: "ads@furriyadh.com"
    },
  },
  {
    nameEn: "Sarah Johnson",
    nameAr: "سارة جونسون",
    roleEn: "Head of AI & Technology",
    roleAr: "رئيسة قسم الذكاء الاصطناعي والتقنية",
    image: "/images/front-pages/team2.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/",
      twitter: "https://x.com/",
      email: "ads@furriyadh.com"
    },
  },
  {
    nameEn: "Mohammed Al-Saud",
    nameAr: "محمد السعود",
    roleEn: "Head of Marketing",
    roleAr: "رئيس قسم التسويق",
    image: "/images/front-pages/team3.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/",
      twitter: "https://x.com/",
      email: "ads@furriyadh.com"
    },
  },
  {
    nameEn: "Emily Chen",
    nameAr: "إيميلي تشين",
    roleEn: "Lead Developer",
    roleAr: "مطورة رئيسية",
    image: "/images/front-pages/team4.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/",
      twitter: "https://x.com/",
      email: "ads@furriyadh.com"
    },
  },
];

const OurTeam: React.FC = () => {
  const { language, isRTL } = useTranslation();

  return (
    <>
      <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
        <div className="text-center mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
          <div className="inline-block relative mt-[10px] mb-[20px]">
            <span className="inline-block text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] rounded-md text-sm font-medium">
              {language === 'ar' ? 'فريقنا' : 'Our Team'}
            </span>
          </div>
          <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'ar'
              ? 'تعرف على الفريق وراء Furriyadh'
              : 'Meet the Team Behind Furriyadh'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'ar'
              ? 'فريق من الخبراء المتفانين في مجال الإعلانات الرقمية والذكاء الاصطناعي، يعملون لمساعدتك في تحقيق النجاح.'
              : 'A team of experts dedicated to digital advertising and AI, working to help you achieve success.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={member.image}
                  alt={language === 'ar' ? member.nameAr : member.nameEn}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Social Links Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.email && (
                    <a
                      href={`mailto:${member.socials.email}`}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                <h3 className="text-white font-semibold text-lg mb-1">
                  {language === 'ar' ? member.nameAr : member.nameEn}
                </h3>
                <span className="text-purple-400 text-sm">
                  {language === 'ar' ? member.roleAr : member.roleEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OurTeam;
