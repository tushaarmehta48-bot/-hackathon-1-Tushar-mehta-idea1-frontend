"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/routing";

type LocaleHtmlLangProps = {
  locale: AppLocale;
};

export function LocaleHtmlLang({ locale }: LocaleHtmlLangProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
