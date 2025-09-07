import React, { useState } from "react";

const CreditsComponent: React.FC = () => {
  const [promoCode, setPromoCode] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  
  // Simulate user payment status and billing date
  const [userHasPaid, setUserHasPaid] = useState(false); // Change this to true to simulate paid user
  const [spentAmount, setSpentAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Simulate spent amounts for each credit type
  const [spentGoogle, setSpentGoogle] = useState(0); // Example: 0-150
  const [spentFurriyadhCredit, setSpentFurriyadhCredit] = useState(0); // Example: 0-300
  const [spentMicrosoft, setSpentMicrosoft] = useState(0); // Example: 0-150

  // Calculate next billing date based on payment status
  const getNextBillingDate = () => {
    if (!userHasPaid) {
      return "N/A";
    }
    // If user has paid, calculate next billing date (30 days from now)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Function to calculate progress percentage
  const calculateProgress = (spent: number, total: number) => {
    if (total === 0) return 0;
    return (spent / total) * 100;
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqItems = [
    {
      question: "How does Furriyadh Credits work?",
      answer: "Furriyadh Credits is a feature that allows you to pay your advertising budget directly through Furriyadh. You don\"t need ad accounts as we will automatically create them for you. This simplifies even more the process of campaign creation, while having a greater control over how much you spend on your different ads & channels. To use Furriyadh Credits, simply select \"Use Furriyadh Account\" during campaign creation on the respective platforms. Note that this is a paid feature. 20% fee will be taken on your advertising budget if you choose to work with Furriyadh accounts."
    },
    {
      question: "Can I refund the Furriyadh Credits?",
      answer: "Yes, you can ask for a refund of your remaining balance at any moment."
    },
    {
      question: "You offer free campaign management but when I create a campaign I have to choose a budget. So is it free or not?",
      answer: "We can understand your confusion. Our free plan will create your first ad campaign for free (if you link you existing ad accounts) but you still have to pay Google, Microsoft, and Facebook for the clicks you want to receive. We offer a free service, but you still have to decide & pay your advertising budget. You will only pay when people click on your ads. Traditional agencies charge people an extra fee to offer the service of setting up & optimizing ads."
    },
    {
      question: "Can I launch ads without using Furriyadh Credits?",
      answer: "Yes, Furriyadh Credits are optional, you can still launch ads on any platform without adding Furriyadh Credits. Note that this is possible only by linking your own Google, Microsoft, Facebook, Instagram, or Twitter accounts. By doing so, the spending will be managed directly by the ads platforms. If you choose to link your account to the ads platforms the credit card details are hidden from us. We work closely with ad platforms to optimize ads and they only give us access to campaign parameters, not to your billing information."
    },
    {
      question: "My ads are being paused if I\"m exceeding the amount added as Furriyadh Credits?",
      answer: "No, if the added credits are exceeded & your campaigns are still enabled, we will automatically top-up by charging the default payment method. You can pause your campaigns at any moment if you want to stop advertising."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 px-6 py-4">
        <div className="flex items-center text-sm text-blue-200 drop-shadow-sm mb-2">
          <span>Settings</span>
          <span className="mx-2">/</span>
          <span>Billing</span>
          <span className="mx-2">/</span>
          <span>Furriyadh Credits</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 drop-shadow-lg">
          Furriyadh Credits
        </h1>
        <p className="text-blue-100 drop-shadow-md mt-1">
          Get an overview of your balance and check your eligibility for free credits.{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">Read more</a>
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Balance */}
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-white/15 backdrop-blur-md border border-purple-300/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" fill="#FFFFFF"/>
                    <path d="M18 9H6C5.44772 9 5 9.44772 5 10V14C5 14.5523 5.44772 15 6 15H18C18.5523 15 19 14.5523 19 14V10C19 9.44772 18.5523 9 18 9Z" fill="#FFFFFF"/>
                    <path d="M9 12C9 11.4477 8.55228 11 8 11H6C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13H8C8.55228 13 9 12.5523 9 12Z" fill="#FFFFFF"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-gray-800">Balance</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">SPENT</p>
                  <p className="text-2xl font-bold text-black dark:text-gray-800">${spentAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">REMAINING</p>
                  <p className="text-2xl font-bold text-black dark:text-gray-800">${remainingAmount}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">NEXT BILLING DATE</p>
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-800 text-xs">?</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-black dark:text-gray-800">{getNextBillingDate( )}</p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
                Add credit
              </button>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wide">
                EVERYTHING YOU NEED TO KNOW
              </h3>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="flex items-center justify-between w-full text-left py-2"
                    >
                      <span className="text-sm font-medium text-black dark:text-gray-800 pr-4">
                        {item.question}
                      </span>
                      <div className="flex-shrink-0">
                        {expandedFAQ === index ? (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                    </button>
                    {expandedFAQ === index && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Get Free Credits */}
          <div className="space-y-6">
            <div className="bg-white/15 backdrop-blur-md border border-blue-200/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd"/>
                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-gray-800">Get free credit</h3>
              </div>

              {/* Google Welcome Credit */}
              <div className="bg-white/10 backdrop-blur-md border border-blue-200/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span className="font-medium text-black dark:text-gray-800">Google Welcome Credit</span>
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xs">?</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{spentGoogle} of 150</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Spend 150€ on Google ads and get 40€ free credits from Furriyadh.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculateProgress(spentGoogle, 150)}%` }}></div>
                </div>
              </div>

              {/* Furriyadh Welcome Credit */}
              <div className="bg-white/10 backdrop-blur-md border border-blue-200/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xs font-bold">F</span>
                    </div>
                    <span className="font-medium text-black dark:text-gray-800">Furriyadh Welcome Credit</span>
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xs">?</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{spentFurriyadhCredit} of 300</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Add 300€ of credits to your Furriyadh account and get 30€ free credits.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculateProgress(spentFurriyadhCredit, 300)}%` }}></div>
                </div>
              </div>

              {/* Microsoft Welcome Bonus */}
              <div className="bg-white/10 backdrop-blur-md border border-blue-200/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#F25022" d="M1 1h10v10H1z"/>
                        <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                        <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                        <path fill="#FFB900" d="M13 13h10v10H13z"/>
                      </svg>
                    </div>
                    <span className="font-medium text-black dark:text-gray-800">Microsoft Welcome Bonus</span>
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-gray-800 text-xs">?</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{spentMicrosoft} of 150</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Spend 150€ in Microsoft Ads and get 40€ free credits from Furriyadh.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculateProgress(spentMicrosoft, 150)}%` }}></div>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="bg-white/10 backdrop-blur-md border border-blue-200/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="font-medium text-black dark:text-gray-800">Unlock free credit with code</span>
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-800 text-xs">?</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter your code below & claim the reward.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter your code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-300/30 rounded-lg bg-white/15 backdrop-blur-md text-gray-800 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
                    Unlock free credit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-gray-800 rounded-full p-4 shadow-lg transition-colors flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 backdrop-blur-sm border border-blue-200/30 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-bold">?</span>
          </div>
          <span className="font-medium">Contact</span>
        </button>
      </div>
    </div>
  );
};

export default CreditsComponent;