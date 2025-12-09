"use client";

import { LogoStepper } from "@/components/ui/logo-stepper";

export default function PartnersSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-400 hover:text-gray-300 transition-colors">
            Leading companies use our platform to achieve their advertising goals
          </p>
        </div>

        <LogoStepper
          logos={[
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Google
                  </span>
                </div>
              ),
              label: "Google",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Microsoft
                  </span>
                </div>
              ),
              label: "Microsoft",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                    Amazon
                  </span>
                </div>
              ),
              label: "Amazon",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Meta
                  </span>
                </div>
              ),
              label: "Meta",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                    Shopify
                  </span>
                </div>
              ),
              label: "Shopify",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent">
                    Stripe
                  </span>
                </div>
              ),
              label: "Stripe",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    HubSpot
                  </span>
                </div>
              ),
              label: "HubSpot",
            },
            {
              icon: (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    Salesforce
                  </span>
                </div>
              ),
              label: "Salesforce",
            },
          ]}
          direction="loop"
          animationDelay={1.5}
          animationDuration={0.6}
          visibleCount={5}
        />
      </div>
    </section>
  );
}

