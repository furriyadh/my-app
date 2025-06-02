'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const targetPath = pathname.startsWith(`/${locale}`) 
    ? pathname.replace(`/${locale}`, `/${otherLocale}`)
    : `/${otherLocale}${pathname}`;

  // Simple text-based switcher for now, styling will be done later
  return (
    <Link href={targetPath} locale={otherLocale}>
      <span className="cursor-pointer hover:text-primary-600 transition-colors">
        {otherLocale.toUpperCase()}
      </span>
    </Link>
  );
}
