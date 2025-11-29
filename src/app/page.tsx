"use client";

import { useState, useEffect, useRef } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { Plus, ChevronDown, Mic, ArrowUp, Sparkles, TrendingUp, Target, Zap, BarChart3, Users, Globe, CheckCircle, ArrowRight, Brain, Rocket, Shield } from "lucide-react";
import Link from "next/link";
import { TrustedUsers } from "@/components/ui/trusted-users";
import { LogoStepper } from "@/components/ui/logo-stepper";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { GlobeSection } from "@/components/Globe/GlobeSection";
import CardSwap, { Card } from "@/components/ui/card-swap";

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [isModelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4 Turbo');
  const models = ['GPT-4 Turbo', 'Claude 3 Opus', 'Gemini Pro'];
  
  const addPopupRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addPopupRef.current && !addPopupRef.current.contains(event.target as Node)) {
        setAddPopupOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
  };

  const handleSend = () => {
    if (!prompt.trim()) {
      console.error("Please enter a prompt first!");
      return;
    }
    console.log(`Sending prompt: "${prompt}" with model: ${selectedModel}`);
    // Add your logic here
  };

  const examplePrompts = [
    "أنشئ حملة إعلانية لمطعمي في الرياض",
    "كيف أستهدف العملاء في جدة؟",
    "ما هي أفضل الكلمات المفتاحية لمتجري؟"
  ];

  const stats = [
    { icon: <Rocket className="w-8 h-8" />, number: "5000+", label: "حملة إعلانية ناجحة" },
    { icon: <TrendingUp className="w-8 h-8" />, number: "90%", label: "زيادة في معدل التحويل" },
    { icon: <Users className="w-8 h-8" />, number: "1000+", label: "عميل سعيد" },
    { icon: <Zap className="w-8 h-8" />, number: "24/7", label: "دعم بالذكاء الاصطناعي" }
  ];

  const features = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "ذكاء اصطناعي متقدم",
      description: "نستخدم أحدث نماذج الذكاء الاصطناعي لإنشاء حملات فعالة"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "استهداف دقيق",
      description: "نحدد جمهورك المثالي بدقة عالية باستخدام تحليلات متقدمة"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "تحليلات شاملة",
      description: "تقارير مفصلة وتحليلات في الوقت الفعلي لأداء حملاتك"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "تحسين تلقائي",
      description: "يحسن الذكاء الاصطناعي حملاتك تلقائياً لأفضل النتائج"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "تغطية شاملة",
      description: "ندعم جميع أنواع حملات Google Ads في كل الأسواق"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "أمان وموثوقية",
      description: "بياناتك محمية بأعلى معايير الأمان العالمية"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "صف حملتك",
      description: "أخبرنا عن منتجك أو خدمتك وأهدافك"
    },
    {
      number: "02",
      title: "دع الذكاء الاصطناعي يعمل",
      description: "سننشئ لك حملة احترافية في ثوانٍ"
    },
    {
      number: "03",
      title: "انطلق وحقق النجاح",
      description: "راقب النتائج واحصل على عملاء جدد"
    }
  ];

  return (
    <>
      <div className="front-page-body overflow-hidden bg-black min-h-screen text-white" dir="ltr">
        <Navbar />
        
        <main className="min-h-screen bg-black text-white">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              {/* Hero Text */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">مدعوم بالذكاء الاصطناعي المتقدم</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                  أنشئ حملاتك الإعلانية
                  <br />
                  بالذكاء الاصطناعي في ثوانٍ
                </h1>
                
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  منصة متكاملة تستخدم الذكاء الاصطناعي لإنشاء وإدارة حملات Google Ads بكفاءة عالية
                </p>
              </div>

              {/* AI Chatbot Component */}
              <div className="max-w-3xl mx-auto mb-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 transition-all duration-300 hover:shadow-purple-500/20 hover:shadow-3xl">
                  <textarea
                    className="w-full p-4 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-lg leading-relaxed"
                    rows={3}
                    placeholder="كيف يمكنني مساعدتك في حملتك الإعلانية؟"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                    {/* Left Controls */}
                    <div className="flex items-center gap-3">
                      <div className="relative" ref={addPopupRef}>
                        <button 
                          onClick={() => setAddPopupOpen(!isAddPopupOpen)}
                          className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-200 border border-white/10"
                        >
                          <Plus size={22} />
                        </button>
                        {isAddPopupOpen && (
                          <div className="absolute bottom-full left-0 mb-3 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-10 p-2">
                            <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors">
                              <span className="text-gray-300">إضافة صور</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors">
                              <span className="text-gray-300">إضافة ملفات</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative" ref={modelRef}>
                        <button 
                          onClick={() => setModelOpen(!isModelOpen)} 
                          className="flex items-center gap-2 h-12 px-4 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-2xl transition-all duration-200 border border-purple-500/30"
                        >
                          <Brain size={18} className="text-purple-400" />
                          <span className="font-medium hidden md:block">{selectedModel}</span>
                          <ChevronDown size={16} />
                        </button>
                        {isModelOpen && (
                          <div className="absolute bottom-full left-0 mb-3 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-10 p-2">
                            {models.map((model) => (
                              <button
                                key={model}
                                onClick={() => handleModelSelect(model)}
                                className="w-full p-3 hover:bg-white/10 rounded-xl transition-colors text-left text-gray-300"
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-3">
                      <button className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 border border-white/10">
                        <Mic size={22} />
                      </button>
                      <button 
                        onClick={handleSend}
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                          prompt.trim() 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/50' 
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUp size={22} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Example Prompts */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-all duration-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <Link
                  href="/authentication/sign-up"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 flex items-center gap-2"
                >
                  ابدأ مجاناً الآن
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold transition-all duration-200"
                >
                  شاهد العرض التوضيحي
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl mb-4 text-purple-400">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.number}
                    </div>
                    <div className="text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trusted By Section with Logo Stepper */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  يثق بنا قادة الصناعة
                </h2>
                <p className="text-lg text-gray-400">
                  شركات رائدة تستخدم منصتنا لتحقيق أهدافها الإعلانية
                </p>
              </div>

              <LogoStepper
                logos={[
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
                        src="https://logo.clearbit.com/apple.com"
                        alt="Apple"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Apple",
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
                        src="https://logo.clearbit.com/netflix.com"
                        alt="Netflix"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Netflix",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/samsung.com"
                        alt="Samsung"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Samsung",
                  },
                  {
                    icon: (
                      <img
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        alt="GitHub"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "GitHub",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/tesla.com"
                        alt="Tesla"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Tesla",
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
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 234" className="w-full h-full">
                          <path fill="#FF0000" d="M42.5 0h155C221 0 240 19 240 42.5v149c0 23.5-19 42.5-42.5 42.5h-155C19 234 0 215 0 191.5v-149C0 19 19 0 42.5 0z"/>
                          <path fill="#FFF" d="M116.9 140.8L91.1 198H70l45.7-119.5h22.6L180 198h-23.3l-26.5-57.2h-13.3zm6.5-17.6h1.3L143.9 71h-1.6l19.5 52.2h-38.4z"/>
                        </svg>
                      </div>
                    ),
                    label: "Adobe",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/openai.com"
                        alt="OpenAI"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "OpenAI",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/nvidia.com"
                        alt="NVIDIA"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "NVIDIA",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/intel.com"
                        alt="Intel"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Intel",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/sony.com"
                        alt="Sony"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Sony",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/paypal.com"
                        alt="PayPal"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "PayPal",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/uber.com"
                        alt="Uber"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Uber",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/airbnb.com"
                        alt="Airbnb"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Airbnb",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/slack.com"
                        alt="Slack"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Slack",
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
                        src="https://logo.clearbit.com/shopify.com"
                        alt="Shopify"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Shopify",
                  },
                ]}
                direction="loop"
                animationDelay={1.2}
                animationDuration={0.6}
                visibleCount={5}
              />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  لماذا تختار منصتنا؟
                </h2>
                <p className="text-xl text-gray-400">
                  مزايا قوية تجعل إدارة حملاتك الإعلانية أسهل وأكثر فعالية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  ماذا يقول عملاؤنا؟
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  آلاف الشركات تثق بمنصتنا لإدارة حملاتهم الإعلانية
                </p>

                {/* Trusted Users Component */}
                <div className="flex justify-center mb-12">
                  <TrustedUsers
                    avatars={[
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
                    ]}
                    rating={5}
                    totalUsersText={300000}
                    caption="موثوق من قبل"
                    starColorClass="text-yellow-400"
                    ringColors={[
                      "ring-purple-500",
                      "ring-blue-500",
                      "ring-pink-500",
                      "ring-green-500",
                      "ring-orange-500",
                    ]}
                  />
                </div>
              </div>

              {/* Animated Testimonials */}
              <AnimatedTestimonials
                data={[
                  {
                    name: "أحمد السعيد",
                    handle: "@ahmed_saeed",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                    description: "منصة رائعة! وفرت علينا الكثير من الوقت والجهد في إدارة حملاتنا الإعلانية. النتائج فاقت كل التوقعات."
                  },
                  {
                    name: "سارة محمد",
                    handle: "@sara_mohamed",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                    description: "الذكاء الاصطناعي ساعدني في استهداف العملاء بشكل دقيق. زادت مبيعاتي بنسبة 150% في شهر واحد!"
                  },
                  {
                    name: "خالد العتيبي",
                    handle: "@khaled_otaibi",
                    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
                    description: "أفضل استثمار قمت به لشركتي. الدعم ممتاز والنتائج مذهلة. أنصح بها بشدة!"
                  },
                  {
                    name: "فاطمة الزهراني",
                    handle: "@fatima_zahrani",
                    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                    description: "سهلة الاستخدام وفعالة جداً. حتى بدون خبرة سابقة، تمكنت من إنشاء حملات احترافية."
                  },
                  {
                    name: "عبدالله القحطاني",
                    handle: "@abdullah_qahtani",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
                    description: "التحليلات والتقارير مفصلة جداً. أستطيع اتخاذ قرارات مبنية على بيانات دقيقة."
                  },
                  {
                    name: "نورة الدوسري",
                    handle: "@noura_dosari",
                    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
                    description: "المنصة تجمع كل ما أحتاجه في مكان واحد. وفرت علي ساعات من العمل اليومي."
                  },
                  {
                    name: "محمد الشمري",
                    handle: "@mohamed_shamri",
                    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
                    description: "زادت عائداتنا بشكل ملحوظ بعد استخدام المنصة. الأتمتة الذكية توفر الكثير من الجهد."
                  },
                  {
                    name: "ريم العمري",
                    handle: "@reem_omari",
                    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
                    description: "أدوات التحليل المتقدمة ساعدتني في فهم جمهوري بشكل أفضل. منصة متكاملة ورائعة!"
                  },
                  {
                    name: "يوسف الغامدي",
                    handle: "@youssef_ghamdi",
                    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop",
                    description: "الواجهة سهلة والميزات قوية. تمكنت من إطلاق حملتي الأولى في أقل من 10 دقائق."
                  },
                  {
                    name: "مريم الحربي",
                    handle: "@mariam_harbi",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&sat=-100",
                    description: "النتائج مبهرة! حققنا أهدافنا التسويقية في نصف الوقت المتوقع."
                  },
                  {
                    name: "عمر الأحمدي",
                    handle: "@omar_ahmadi",
                    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop",
                    description: "الدعم الفني ممتاز ومتوفر دائماً. يساعدونك خطوة بخطوة حتى تحقق أفضل النتائج."
                  },
                  {
                    name: "هند المالكي",
                    handle: "@hind_malki",
                    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop",
                    description: "وفرت علي آلاف الريالات من تكاليف الإعلانات بفضل الاستهداف الذكي."
                  },
                  {
                    name: "سلطان العنزي",
                    handle: "@sultan_anzi",
                    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop",
                    description: "أداة لا غنى عنها لأي صاحب عمل. تسهل إدارة الحملات الإعلانية بشكل كبير."
                  },
                  {
                    name: "لينا الشهري",
                    handle: "@lina_shehri",
                    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop",
                    description: "التقارير التفصيلية تساعدني في فهم أداء كل حملة وتحسينها باستمرار."
                  },
                  {
                    name: "طارق السليمان",
                    handle: "@tareq_sulaiman",
                    image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop",
                    description: "منصة احترافية بسعر معقول. تستحق كل ريال تدفعه فيها!"
                  },
                  {
                    name: "جواهر القرني",
                    handle: "@jawaher_qarni",
                    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
                    description: "سهولة الربط مع جوجل أدز مذهلة. كل شيء يعمل بسلاسة تامة."
                  },
                  {
                    name: "فهد الدوسري",
                    handle: "@fahad_dosari",
                    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop",
                    description: "أفضل منصة استخدمتها لإدارة الإعلانات. تطبيق الجوال ممتاز أيضاً!"
                  },
                  {
                    name: "منى الشريف",
                    handle: "@mona_sharif",
                    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
                    description: "الذكاء الاصطناعي يقترح التحسينات بشكل دقيق. زادت معدلات التحويل بشكل ملحوظ."
                  }
                ]}
                className="w-full"
                cardClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              />
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  كيف يعمل؟
                </h2>
                <p className="text-xl text-gray-400">
                  ثلاث خطوات بسيطة للبدء
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                      <div className="text-6xl font-bold text-purple-600/20 mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-white">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-600 to-transparent"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Ad Examples Section - نماذج الإعلانات */}
          <section className="relative py-32 px-4 border-t border-white/10 overflow-hidden bg-black">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Side - Text Content */}
                <div className="text-right" dir="rtl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-600/30 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">إعلانات ذكية</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent leading-tight">
                    نسخ إعلانية احترافية بالذكاء الاصطناعي
                  </h2>
                  
                  <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                    يقوم الذكاء الاصطناعي لدينا بإنشاء نسخ إعلانية متعددة لكل حملة، مُحسّنة للحصول على أعلى معدلات التحويل والتفاعل.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3" dir="rtl">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">عناوين جذابة</h3>
                        <p className="text-gray-400">نصوص مُحسّنة للحصول على أعلى نسب النقر</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3" dir="rtl">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">أوصاف مُقنعة</h3>
                        <p className="text-gray-400">محتوى يحفّز العملاء على اتخاذ الإجراء</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3" dir="rtl">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">اختبار A/B تلقائي</h3>
                        <p className="text-gray-400">نختبر نسخاً متعددة للعثور على الأفضل</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/authentication/sign-up"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 mt-8"
                  >
                    جرّب الآن مجاناً
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Right Side - Card Swap Animation */}
                <div className="relative h-[600px]" style={{ perspective: '900px' }}>
                  <CardSwap
                    cardDistance={60}
                    verticalDistance={70}
                    delay={5000}
                    pauseOnHover={false}
                    width={500}
                    height={400}
                    skewAmount={6}
                    easing="elastic"
                  >
                    {/* Card 1 - Search Ad */}
                    <Card>
                      <div className="w-full h-full flex flex-col bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-3 border-b border-purple-200/50 backdrop-blur-md">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200/50 shadow-lg shadow-purple-500/20 w-fit">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M10.5 18C6.5 18 3 14.5 3 10.5C3 6.5 6.5 3 10.5 3C14.5 3 18 6.5 18 10.5" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
                              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" className="text-red-500" />
                              <path d="M10.5 3C14.0899 3 17 5.91015 17 9.5" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
                              <path d="M10.5 18C7.18629 18 4.5 15.3137 4.5 12" stroke="currentColor" strokeWidth="2" className="text-green-500" />
                            </svg>
                            <span className="text-gray-900 text-xs font-bold tracking-wide">SEARCH</span>
                          </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
                          <div className="mb-2">
                            <span className="text-[11px] font-black text-purple-600 uppercase tracking-wider">Sponsored</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/50 ring-2 ring-purple-200">
                              <span className="text-[11px] font-black text-white">س</span>
                            </div>
                            <div className="text-sm text-gray-900 font-black truncate">سوق الرياض</div>
                          </div>

                          <div className="text-[11px] text-green-600 font-bold mb-3 truncate">https://souq-riyadh.sa</div>

                          <div className="space-y-2">
                            <h3 className="text-base md:text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer leading-tight line-clamp-2" dir="rtl">
                              تسوق الآن من أكبر سوق إلكتروني في الرياض 🛍️
                            </h3>
                            
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                عروض حصرية على آلاف المنتجات. توصيل مجاني لجميع أنحاء المملكة.
                              </p>
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                خصومات تصل إلى 70%. اطلب الآن واستمتع بأفضل الأسعار!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Card 2 - Shopping Ad */}
                    <Card>
                      <div className="w-full h-full flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 p-3 border-b border-blue-200/50 backdrop-blur-md">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-200/50 shadow-lg shadow-blue-500/20 w-fit">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                              <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span className="text-gray-900 text-xs font-bold tracking-wide">SHOPPING</span>
                          </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
                          <div className="mb-2">
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Sponsored</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50 ring-2 ring-blue-200">
                              <span className="text-[11px] font-black text-white">م</span>
                            </div>
                            <div className="text-sm text-gray-900 font-black truncate">مول جدة</div>
                          </div>

                          <div className="text-[11px] text-green-600 font-bold mb-3 truncate">https://jeddah-mall.sa</div>

                          <div className="space-y-2">
                            <h3 className="text-base md:text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer leading-tight line-clamp-2" dir="rtl">
                              تخفيضات الموسم على الأزياء العصرية 👗
                            </h3>
                            
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                أحدث صيحات الموضة بأسعار لا تُقاوم. شحن مجاني فوق 200 ريال.
                              </p>
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                عروض محدودة! سارع بالطلب قبل نفاد الكمية.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Card 3 - Display Ad */}
                    <Card>
                      <div className="w-full h-full flex flex-col bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 p-3 border-b border-emerald-200/50 backdrop-blur-md">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-emerald-200/50 shadow-lg shadow-emerald-500/20 w-fit">
                            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                              <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span className="text-gray-900 text-xs font-bold tracking-wide">DISPLAY</span>
                          </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
                          <div className="mb-2">
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Sponsored</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-200">
                              <span className="text-[11px] font-black text-white">ت</span>
                            </div>
                            <div className="text-sm text-gray-900 font-black truncate">تقنية المستقبل</div>
                          </div>

                          <div className="text-[11px] text-green-600 font-bold mb-3 truncate">https://tech-future.com</div>

                          <div className="space-y-2">
                            <h3 className="text-base md:text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer leading-tight line-clamp-2" dir="rtl">
                              احصل على أحدث الأجهزة التقنية بأفضل الأسعار 💻
                            </h3>
                            
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                لابتوبات وهواتف ذكية من أفضل العلامات التجارية العالمية.
                              </p>
                              <p className="text-xs text-gray-700 font-medium leading-relaxed line-clamp-1" dir="rtl">
                                ضمان سنتين وخدمة ما بعد البيع متميزة. اطلب الآن!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                  </CardSwap>
                </div>
              </div>
            </div>
          </section>

          {/* AI Optimization Section - تحسين إعلاناتك 24/7 with ScrollStack */}
          <section className="relative py-32 px-4 overflow-hidden bg-black border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              {/* Header */}
              <div className="text-center mb-16" dir="rtl">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  تحسين إعلاناتك 24/7
                </h2>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  سيقوم Furriyadh بتحسين إعلاناتك على مدار الساعة في كل قناة. إيقاف الكلمات المفتاحية، إنشاء إعلانات جديدة
                  <br />
                  للاختبار A/B أو اقتراح استهداف جديد، Furriyadh يغطي كل شيء.
                </p>
              </div>

              {/* Three Cards with 3D Effects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch" style={{ perspective: '1500px' }}>
                
                {/* Card 1 - Audience Interests - 3D */}
                <div 
                  className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 min-h-[380px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(2deg) rotateY(-2deg)',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(20px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateX(2deg) rotateY(-2deg)';
                  }}
                >
                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'translateZ(-10px)' }}></div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/30 to-purple-500/20 rounded-full mb-4 border border-purple-400/40 w-fit shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                    <span className="text-sm font-semibold text-purple-200">Furriyadh AI</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">Audience Interests</h3>
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-gray-200 font-medium">Purina One</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">×</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-gray-200 font-medium">Cat at Home</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">×</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-gray-200 font-medium">Cat Lovers</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        <button className="text-gray-500 hover:text-gray-300 transition-colors">×</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-auto pt-6" dir="rtl">
                    <Target className="w-5 h-5 text-purple-400" />
                    <p className="text-base font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">اقتراح استهداف جديد</p>
                  </div>
                </div>

                {/* Card 2 - A/B Testing Ads - 3D */}
                <div 
                  className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 min-h-[380px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(0deg) rotateY(0deg) translateZ(10px)',
                    boxShadow: '0 35px 60px -15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(30px) scale(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(10px)';
                  }}
                >
                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'translateZ(-10px)' }}></div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-500/20 rounded-full mb-4 border border-blue-400/40 w-fit shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                    <span className="text-sm font-semibold text-blue-200">Furriyadh AI</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-4">A/B Testing Ads</h3>
                  
                  <div className="space-y-3 flex-1">
                    {/* Ad A */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                        <img 
                          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&h=100&fit=crop" 
                          alt="Group Trips" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-500 font-medium">AD A</span>
                        <h4 className="text-sm font-bold text-blue-400 truncate">Group Trips for Solo Travellers</h4>
                        <span className="text-[11px] text-gray-500">eventsy-tours.com</span>
                      </div>
                    </div>
                    
                    {/* Ad B */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                        <img 
                          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=100&h=100&fit=crop" 
                          alt="Events" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-500 font-medium">AD B</span>
                        <h4 className="text-sm font-bold text-blue-400 truncate">Enjoy Events in your City</h4>
                        <span className="text-[11px] text-gray-500">eventsy-tours.com</span>
                      </div>
                    </div>
                    
                    {/* Ad C */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/20">
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-500 font-medium">AD C</span>
                        <h4 className="text-sm font-bold text-blue-400 truncate">Book Cheap Tours Anywhere</h4>
                        <span className="text-[11px] text-gray-500">eventsy-tours.com</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-auto pt-6" dir="rtl">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <p className="text-base font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">إنشاء إعلانات جديدة للاختبار A/B</p>
                  </div>
                </div>

                {/* Card 3 - Campaign Keywords - 3D */}
                <div 
                  className="group relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 min-h-[380px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/40"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(2deg) rotateY(2deg)',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(20px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateX(2deg) rotateY(2deg)';
                  }}
                >
                  {/* 3D Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ transform: 'translateZ(-10px)' }}></div>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/30 to-purple-500/20 rounded-full mb-4 border border-purple-400/40 w-fit shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                    <span className="text-sm font-semibold text-purple-200">Furriyadh AI</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4 whitespace-nowrap">Campaign Keywords</h3>
                  
                  <div className="flex flex-wrap gap-2 flex-1 content-start">
                    <span className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">Beach Hotel</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-shadow cursor-pointer">
                      Canggu Indonesia
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">Swimming</span>
                    <span className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">Package</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-shadow cursor-pointer">
                      Spa Hotel
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-shadow cursor-pointer">
                      Diving Hotel
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">Bali</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-shadow cursor-pointer">
                      Best Hotel Canggu
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <span className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">Accommodation</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-auto pt-6" dir="rtl">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <p className="text-base font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">إيقاف وتحسين الكلمات المفتاحية</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Globe Section - الوصول العالمي */}
          <GlobeSection />

          {/* Final CTA Section */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  جاهز لتحويل حملاتك الإعلانية؟
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  انضم إلى آلاف الشركات التي تثق بمنصتنا لإدارة حملاتها الإعلانية
                </p>
                <Link
                  href="/authentication/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50"
                >
                  ابدأ الآن مجاناً
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
