// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import SidebarMenu from "../components/Layout/SidebarMenu";
import Header from "../components/Layout/Header/index";
import Footer from "../components/Layout/Footer";
import { supabase } from "@/utils/supabase/client";

// ✨ Magic Loader Component - Particle-based loader with spinning effects
interface Particle {
  radius: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  accel: number;
  decay: number;
  life: number;
}

interface MagicLoaderProps {
  size?: number;
  particleCount?: number;
  speed?: number;
  hueRange?: [number, number];
  className?: string;
}

const MagicLoader: React.FC<MagicLoaderProps> = ({
  size = 200,
  particleCount = 1,
  speed = 1,
  hueRange = [0, 360],
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const tickRef = useRef(0);
  const globalAngleRef = useRef(0);
  const globalRotationRef = useRef(0);

  const createParticle = useCallback((centerX: number, centerY: number, tick: number, minSize: number): Particle => {
    return {
      radius: 7,
      x: centerX + Math.cos(tick / 20) * minSize / 2,
      y: centerY + Math.sin(tick / 20) * minSize / 2,
      angle: globalRotationRef.current + globalAngleRef.current,
      speed: 0,
      accel: 0.01,
      decay: 0.01,
      life: 1
    };
  }, []);

  const stepParticle = useCallback((particle: Particle, index: number) => {
    particle.speed += particle.accel;
    particle.x += Math.cos(particle.angle) * particle.speed * speed;
    particle.y += Math.sin(particle.angle) * particle.speed * speed;
    particle.angle += Math.PI / 64;
    particle.accel *= 1.01;
    particle.life -= particle.decay;

    if (particle.life <= 0) {
      particlesRef.current.splice(index, 1);
    }
  }, [speed]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle, index: number, tick: number) => {
    const hue = hueRange[0] + ((tick + (particle.life * 120)) % (hueRange[1] - hueRange[0]));
    ctx.fillStyle = ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${particle.life})`;
    
    // Draw line to previous particle
    ctx.beginPath();
    if (particlesRef.current[index - 1]) {
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particlesRef.current[index - 1].x, particlesRef.current[index - 1].y);
    }
    ctx.stroke();

    // Draw main particle circle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, Math.max(0.001, particle.life * particle.radius), 0, Math.PI * 2);
    ctx.fill();

    // Draw sparkle effects
    const sparkleSize = Math.random() * 1.25;
    const sparkleX = particle.x + ((Math.random() - 0.5) * 35) * particle.life;
    const sparkleY = particle.y + ((Math.random() - 0.5) * 35) * particle.life;
    ctx.fillRect(Math.floor(sparkleX), Math.floor(sparkleY), sparkleSize, sparkleSize);
  }, [hueRange]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const minSize = Math.min(rect.width, rect.height) * 0.5;

    // Add new particles
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(centerX, centerY, tickRef.current, minSize));
    }

    // Update particles
    particlesRef.current.forEach((particle, index) => {
      stepParticle(particle, index);
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particlesRef.current.forEach((particle, index) => {
      drawParticle(ctx, particle, index, tickRef.current);
    });

    // Update global rotation
    globalRotationRef.current += Math.PI / 6 * speed;
    globalAngleRef.current += Math.PI / 6 * speed;
    tickRef.current++;

    animationRef.current = requestAnimationFrame(animate);
  }, [createParticle, stepParticle, drawParticle, particleCount, speed]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = 'lighter';

    // Reset animation state
    particlesRef.current = [];
    tickRef.current = 0;
    globalAngleRef.current = 0;
    globalRotationRef.current = 0;
  }, [size]);

  useEffect(() => {
    setupCanvas();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setupCanvas, animate]);

  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          width: size,
          height: size
        }}
      />
    </div>
  );
};

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarActive, setSidebarActive] = useState(false);
  const authCheckDone = useRef(false);

  // ⏱️ الحد الأدنى لمدة ظهور اللودر (2 ثانية)
  const [minLoaderComplete, setMinLoaderComplete] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoaderComplete(true);
    }, 2000); // 2 ثانية
    
    return () => clearTimeout(timer);
  }, []);

  // ✅ التحقق السريع من الجلسة من localStorage أولاً
  const [authChecked, setAuthChecked] = useState(() => {
    if (typeof window !== 'undefined') {
      // إذا كان هناك token محفوظ، نعتبر المستخدم مسجل دخول مبدئياً
      const hasToken = localStorage.getItem('sb-mkzwqbgcfdzcqmkzwgy-auth-token');
      return !!hasToken;
    }
    return false;
  });
  
  const [hasSession, setHasSession] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('sb-mkzwqbgcfdzcqmkzwgy-auth-token');
      return !!hasToken;
    }
    return null;
  });

  // تحديد الصفحات التي لا تحتاج إلى dashboard layout
  const isAuthPage = pathname?.startsWith('/authentication') || 
                     pathname === '/login' || 
                     pathname === '/register' || 
                     pathname === '/forgot-password';
  
  // تحديد صفحة الـ home page (الصفحة الرئيسية للزوار)
  const isHomePage = pathname === '/';
  
  // تحديد صفحات الـ dashboard
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // 👮‍♂️ جميع الصفحات غير صفحات auth والصفحة الرئيسية تعتبر محمية وتتطلب جلسة Supabase
  const isProtectedPage = !isAuthPage && !isHomePage;

  // Toggle sidebar function
  const toggleActive = () => {
    setSidebarActive(!sidebarActive);
  };

  // تطبيق الوضع الليلي بقوة على كل الموقع
  useEffect(() => {
    if (!isAuthPage) {
      // إضافة الوضع الليلي على كل صفحات الموقع (الداشبورد و Campaign و Home)
      console.log('✅ Forcing dark mode on entire site');
      document.documentElement.classList.add('dark');
      // منع أي محاولة لإزالة الوضع الليلي
      document.documentElement.style.colorScheme = 'dark';
    } else {
      // إزالة الوضع الليلي فقط من صفحات Auth
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = '';
    }
  }, [pathname, isAuthPage, isHomePage]);

  useEffect(() => {
    // منع التحقق المتكرر
    if (authCheckDone.current) return;
    
    // التحقق من حالة المصادقة فقط للصفحات المحمية
    if (isProtectedPage) {
      const checkAuth = async () => {
        try {
          // ✅ التحقق السريع - إذا كان لدينا جلسة مبدئية من localStorage، نعرض المحتوى فوراً
          // ثم نتحقق في الخلفية
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('❌ خطأ في التحقق من الجلسة:', error);
            setHasSession(false);
            setAuthChecked(true);
            router.push('/authentication/sign-in');
            return;
          }

          setHasSession(!!session);
          setAuthChecked(true);
          authCheckDone.current = true;
        
        if (!session) {
            console.log('⚠️ لا توجد جلسة - التوجيه إلى صفحة تسجيل الدخول');
            router.push('/authentication/sign-in');
          }
        } catch (err) {
          console.error('❌ خطأ غير متوقع في التحقق من الجلسة:', err);
          setHasSession(false);
          setAuthChecked(true);
          router.push('/authentication/sign-in');
        }
      };

      // ✅ إذا كان لدينا جلسة مبدئية، نعرض المحتوى فوراً ونتحقق في الخلفية
      if (hasSession) {
        checkAuth();
      } else {
      checkAuth();
      }

      // الاستماع لتغييرات المصادقة
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        const isLoggedIn = !!session;
        setHasSession(isLoggedIn);

        if (event === 'SIGNED_OUT' || !isLoggedIn) {
          setAuthChecked(true);
          authCheckDone.current = false; // إعادة تعيين للسماح بالتحقق مرة أخرى
          router.push('/authentication/sign-in');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isProtectedPage, router]);

  // إذا كانت صفحة مصادقة أو home page، عرض المحتوى بدون dashboard layout
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  // ✅ تحديد حجم اللودر بناءً على حجم الشاشة (Responsive)
  const [loaderSize, setLoaderSize] = useState(200);
  
  useEffect(() => {
    const updateLoaderSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: 150px
        setLoaderSize(150);
      } else if (width < 1024) {
        // Tablet: 200px
        setLoaderSize(200);
      } else {
        // Desktop: 250px
        setLoaderSize(250);
      }
    };
    
    updateLoaderSize();
    window.addEventListener('resize', updateLoaderSize);
    return () => window.removeEventListener('resize', updateLoaderSize);
  }, []);

  // ⏱️ اللودر يظهر دائماً لمدة 2 ثانية على الأقل للصفحات المحمية
  const showLoader = isProtectedPage && !minLoaderComplete;
  
  // 🎨 تحديد لون اللودر بناءً على الصفحة
  const isGoogleAdsPage = pathname?.includes('/integrations/google-ads') || pathname?.includes('/integrations');
  const loaderHueRange: [number, number] = isGoogleAdsPage ? [120, 180] : [260, 330]; // أخضر للحسابات، بنفسجي للباقي
  const backgroundGlow = isGoogleAdsPage 
    ? 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.15) 40%, transparent 70%)'
    : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.15) 40%, transparent 70%)';
  
  if (showLoader) {
    // يظهر اللودر لمدة 2 ثانية على الأقل
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        {/* Background glow effect - يتغير حسب الصفحة */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ background: backgroundGlow }}
        />
        
        {/* Magic Loader - يتغير اللون حسب الصفحة */}
        {/* أخضر لصفحة الحسابات، بنفسجي/وردي للداشبورد */}
        {/* Responsive sizes: Mobile (150px), Tablet (200px), Desktop (250px) */}
        <MagicLoader 
          size={loaderSize}
          particleCount={3}
          speed={1.2}
          hueRange={loaderHueRange}
          className="relative z-10"
        />
      </div>
    );
  }

  // التخطيط الكامل للصفحات المحمية (dashboard فقط)
  return (
    <div className="main-wrapper-content min-h-screen relative">

      {/* Sidebar */}
      <div className="relative z-20 pointer-events-auto">
        <SidebarMenu />
      </div>

      {/* Main Content Area */}
      <div className="main-content relative z-10 pointer-events-auto">
        {/* Header */}
        <Header toggleActive={toggleActive} />

        {/* Page Content */}
        <div className="main-content-container bg-white dark:bg-black">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </div>

    </div>
  );
};

export default LayoutProvider;

