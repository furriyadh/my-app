"use client";

import React from "react";
import Login from "@/components/ui/login";

const SignUpForm: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0e19] flex items-center justify-center py-[60px] md:py-[80px]">
      <Login initialView="signup" />
    </div>
  );
};

export default SignUpForm;
