"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/lib/hooks/useTranslation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

const HeroBanner: React.FC = () => {
  const { t, isRTL } = useTranslation();

  return (
    <>
      <div className="pt-[125px] md:pt-[145px] lg:pt-[185px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
          <div className="text-center mx-auto xl:max-w-[935px] mb-[30px] md:mb-[45px] lg:mb-[60px]">
            <h1 className="!text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] !mb-[13px] md:!mb-[22px] lg:!mb-[25px] xl:!mb-[30px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] !leading-[1.2]" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.hero.title}
            </h1>

            <p className="mx-auto leading-[1.6] md:text-[15px] lg:text-[16px] xl:text-[18px] md:max-w-[600px] lg:max-w-[650px] xl:max-w-[740px] xl:tracking-[.2px]" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.hero.subtitle}
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="inline-block lg:text-[15px] xl:text-[16px] mt-[5px] md:mt-[12px] lg:mt-[20px] xl:mt-[25px] py-[12px] px-[17px] bg-primary-600 text-white rounded-md transition-all font-medium hover:bg-primary-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      person
                    </i>
                    {t.hero.cta}
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                <Login />
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-center">
            <Image
              src="/images/front-pages/dashboard.png"
              className="inline-block"
              alt="dashboard-image"
              width={848}
              height={585}
            />
          </div>


        </div>
      </div>
    </>
  );
};

export default HeroBanner;
