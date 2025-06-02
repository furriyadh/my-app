'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl'; // Added useLocale

interface FooterLinkProps {
  href: string;
  label: string;
  isExternal?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, label, isExternal = false }) => (
  <li>
    <Link 
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-gray-600 hover:text-primary-600 transition-colors text-sm" //统一小字体
    >
      {label}
    </Link>
  </li>
);

const Footer: React.FC = () => {
  const t = useTranslations('footer');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const localePrefixed = (path: string) => `/${locale}${path}`;

  // Define social media links - replace # with actual URLs
  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '/assets/images/Facebook.svg' },
    { name: 'Instagram', href: '#', icon: '/assets/images/instagram.svg' }, // Assuming instagram.svg is the correct one
    { name: 'Twitter', href: 'https://twitter.com/shown_io', icon: '/assets/images/Twitter.svg' },
    { name: 'LinkedIn', href: '#', icon: '/assets/images/linkedin.svg' },
  ];

  return (
    <footer className="bg-gray-50 py-12 md:py-16"> {/* Added background and more padding */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Logo and Brief */}
          <div className="md:col-span-2 lg:col-span-2">
            <Link href={localePrefixed('/')}>
              <Image
                src="/assets/images/logo.svg"
                alt="Shown.io Logo"
                width={120}
                height={32}
                className="h-8 w-auto mb-4"
              />
            </Link>
            <p className="text-gray-600 text-sm mb-4 pr-4">
              {t('companyBrief')}
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-500">
                  <Image src={social.icon} alt={`${social.name} logo`} width={24} height={24} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">{t('sections.product')}</h3>
            <ul className="space-y-2">
              <FooterLink href={localePrefixed('/integrations')} label={t('links.integrations')} />
              <FooterLink href={localePrefixed('/pricing')} label={t('links.pricing')} />
              <FooterLink href={localePrefixed('/partners')} label={t('links.partners')} />
              <FooterLink href={localePrefixed('/api')} label={t('links.api')} />
              <FooterLink href={localePrefixed('/roadmap')} label={t('links.roadmap')} /> {/* Assuming /roadmap exists or will exist */}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">{t('sections.company')}</h3>
            <ul className="space-y-2">
              <FooterLink href={localePrefixed('/about')} label={t('links.about')} />  {/* Assuming /about exists */}
              <FooterLink href={localePrefixed('/careers')} label={t('links.careers')} /> {/* Assuming /careers exists */}
              <FooterLink href={localePrefixed('/press')} label={t('links.press')} /> {/* Assuming /press exists */}
              <FooterLink href={localePrefixed('/contact')} label={t('links.contact')} /> {/* Assuming /contact exists */}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">{t('sections.resources')}</h3>
            <ul className="space-y-2">
              <FooterLink href="/blog" label={t('links.blog')} /> {/* Blog link often not locale prefixed */}
              {/* Links to ad platforms - these are likely external or informational pages */}
              {/* For now, linking to '#' as placeholders, replace with actual external links or internal info page links */}
              <FooterLink href="#" label={t('links.googleAds')} isExternal={true} />
              <FooterLink href="#" label={t('links.facebookAds')} isExternal={true} />
              <FooterLink href="#" label={t('links.instagramAds')} isExternal={true} />
              <FooterLink href="#" label={t('links.microsoftAds')} isExternal={true} />
              <FooterLink href="#" label={t('links.twitterAds')} isExternal={true} />
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal Links and Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              {t('copyright', { year: currentYear })}
            </div>
            <ul className="flex flex-wrap space-x-4 rtl:space-x-reverse">
              <FooterLink href={localePrefixed('/cookie-policy')} label={t('legal.cookies')} />
              <FooterLink href={localePrefixed('/privacy-policy')} label={t('legal.privacy')} />
              <FooterLink href={localePrefixed('/terms-of-use')} label={t('legal.terms')} />
              <FooterLink href={localePrefixed('/support')} label={t('legal.support')} />
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
