"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

const Cta: React.FC = () => {
  const { t, isRTL } = useTranslation();

  return (
    <>
      <div className="py-[60px] md:py-[80px] lg:py-[100px] xl:py-[150px]">
        <div className="container md:max-w-[960px] 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
          <div className="text-center mx-auto md:max-w-[680px] lg:max-w-[830px]">
            <h2 className="!text-[28px] md:!text-[36px] lg:!text-[45px] xl:!text-[48px] !mb-[13px] md:!mb-[20px] lg:!mb-[25px] xl:!mb-[35px] -tracking-[.5px] md:-tracking-[.8px] lg:-tracking-[1.2px] xl:-tracking-[1.5px] !leading-[1.2]" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.cta.title}
            </h2>

            <p className="mx-auto leading-[1.6] md:max-w-[650px] lg:max-w-[680px] xl:max-w-[740px] md:text-[15px] lg:text-[16px] xl:text-[18px] xl:tracking-[.2px]" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.cta.description}
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="inline-block lg:text-[15px] xl:text-[16px] mt-[5px] md:mt-[10px] lg:mt-[20px] xl:mt-[30px] py-[12px] px-[17px] bg-purple-600 text-white rounded-md transition-all font-medium hover:bg-purple-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      person
                    </i>
                    {t.cta.button}
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                <Login />
              </DialogContent>
            </Dialog>
          </div>


        </div>
      </div>
    </>
  );
};

export default Cta;
