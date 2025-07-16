'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const changeLanguage = (e) => {
    const newLocale = e.target.value;
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)(\/|$)/, '/');
    // Redirect to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Langue:</span>
      <select
        onChange={changeLanguage}
        value={currentLocale}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
