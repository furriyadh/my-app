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
                <img
                  src="https://logo.clearbit.com/google.com"
                  alt="Google"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Google",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/microsoft.com"
                  alt="Microsoft"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Microsoft",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/amazon.com"
                  alt="Amazon"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Amazon",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/meta.com"
                  alt="Meta"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Meta",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/shopify.com"
                  alt="Shopify"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Shopify",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/stripe.com"
                  alt="Stripe"
                  className="w-full h-full object-contain"
                />
              ),
              label: "Stripe",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/hubspot.com"
                  alt="HubSpot"
                  className="w-full h-full object-contain"
                />
              ),
              label: "HubSpot",
            },
            {
              icon: (
                <img
                  src="https://logo.clearbit.com/salesforce.com"
                  alt="Salesforce"
                  className="w-full h-full object-contain"
                />
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

