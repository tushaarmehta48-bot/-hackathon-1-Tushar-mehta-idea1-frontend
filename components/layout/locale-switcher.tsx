"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("localeNames");
  const tNav = useTranslations("nav");

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="sr-only">{tNav("language")}</span>
      <select
        className="rounded-sm border border-line bg-cream px-2 py-1.5 text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value as AppLocale;
          router.replace(pathname, { locale: nextLocale });
        }}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
