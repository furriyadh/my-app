import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Heart,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Zap,
  Shield,
  HelpCircle,
  FileText,
  Users,
  Settings,
  TrendingUp,
  Target,
  BarChart3,
  ExternalLink,
  ArrowUp,
  Clock,
  Award,
  Star
} from "lucide-react"
import { Button } from "@/components/UI/Button"
import { Input } from "@/components/UI/Input"
import { Badge } from "@/components/UI/Badge"
import { Separator } from "@/components/UI/Separator"

// Footer Links Configuration
const footerLinks = {
  product: {
    title: "المنتج",
    links: [
      { label: "الميزات", href: "/features", icon: Star },
      { label: "التسعير", href: "/pricing", icon: TrendingUp },
      { label: "التحديثات", href: "/updates", icon: Clock },
      { label: "الأمان", href: "/security", icon: Shield },
      { label: "API", href: "/api", icon: Settings }
    ]
  },
  solutions: {
    title: "الحلول",
    links: [
      { label: "الشركات الصغيرة", href: "/solutions/small-business", icon: Users },
      { label: "الشركات الكبيرة", href: "/solutions/enterprise", icon: Target },
      { label: "الوكالات", href: "/solutions/agencies", icon: BarChart3 },
      { label: "التجارة الإلكترونية", href: "/solutions/ecommerce", icon: TrendingUp },
      { label: "التطبيقات", href: "/solutions/apps", icon: Zap }
    ]
  },
  resources: {
    title: "الموارد",
    links: [
      { label: "مركز المساعدة", href: "/help", icon: HelpCircle },
      { label: "الوثائق", href: "/docs", icon: FileText },
      { label: "المدونة", href: "/blog", icon: FileText },
      { label: "الندوات", href: "/webinars", icon: Users },
      { label: "دراسات الحالة", href: "/case-studies", icon: Award }
    ]
  },
  company: {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about", icon: Users },
      { label: "الوظائف", href: "/careers", icon: Target },
      { label: "الأخبار", href: "/news", icon: FileText },
      { label: "الشراكات", href: "/partners", icon: Users },
      { label: "اتصل بنا", href: "/contact", icon: Mail }
    ]
  }
}

// Social Media Links
const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-blue-400" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com", color: "hover:text-blue-600" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com", color: "hover:text-pink-500" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-700" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com", color: "hover:text-red-500" },
  { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-gray-900" }
]

// Footer Component
const Footer = React.forwardRef(({
  showNewsletter = true,
  showSocial = true,
  showBackToTop = true,
  className,
  ...props
}, ref) => {
  const [email, setEmail] = React.useState("")
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      // Handle newsletter subscription
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className={cn(
        "bg-gray-50 border-t border-gray-200",
        className
      )}
      {...props}
    >
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-2">
                ابق على اطلاع بآخر التحديثات
              </h3>
              <p className="text-blue-100 mb-6">
                احصل على نصائح التسويق الرقمي وآخر الميزات مباشرة في بريدك الإلكتروني
              </p>

              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                    required
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    اشتراك
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-200">
                  <Star className="h-5 w-5" />
                  <span>شكراً لك! تم تسجيل اشتراكك بنجاح</span>
                </div>
              )}

              <p className="text-xs text-blue-200 mt-3">
                لن نشارك بريدك الإلكتروني مع أي طرف ثالث
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Google Ads AI
                </h3>
                <p className="text-sm text-gray-500">منصة الإعلانات الذكية</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              منصة متطورة لإدارة حملات Google Ads باستخدام الذكاء الاصطناعي.
              نساعدك في تحقيق أفضل النتائج وزيادة عائد الاستثمار.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@googleadsai.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+966 11 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">الشهادات والاعتمادات</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Google Partner
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ISO 27001
                </Badge>
                <Badge variant="outline" className="text-xs">
                  SOC 2
                </Badge>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-gray-900 mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => {
                  const Icon = link.icon
                  return (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors group"
                      >
                        <Icon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>© {currentYear} Google Ads AI. جميع الحقوق محفوظة.</span>
            <span className="hidden sm:inline">صنع بـ</span>
            <Heart className="h-4 w-4 text-red-500 hidden sm:inline" />
            <span className="hidden sm:inline">في السعودية</span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
              سياسة الخصوصية
            </a>
            <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
              شروط الاستخدام
            </a>
            <a href="/cookies" className="text-gray-600 hover:text-blue-600 transition-colors">
              سياسة الكوكيز
            </a>
          </div>

          {/* Social Links */}
          {showSocial && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200",
                      social.color
                    )}
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Language & Region */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>العربية (السعودية)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>العملة: ريال سعودي (SAR)</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">جميع الأنظمة تعمل بشكل طبيعي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-40"
          size="sm"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </footer>
  )
})
Footer.displayName = "Footer"

// Minimal Footer Component
const MinimalFooter = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      ref={ref}
      className={cn(
        "border-t border-gray-200 bg-white py-6",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Google Ads AI</span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} Google Ads AI. جميع الحقوق محفوظة.
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
              الخصوصية
            </a>
            <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
              الشروط
            </a>
            <a href="/help" className="text-gray-600 hover:text-blue-600 transition-colors">
              المساعدة
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})
MinimalFooter.displayName = "MinimalFooter"

// Sticky Footer Component
const StickyFooter = React.forwardRef(({
  children,
  className,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 p-4",
        className
      )}
      {...props}
    >
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  )
})
StickyFooter.displayName = "StickyFooter"

export { Footer, MinimalFooter, StickyFooter }

