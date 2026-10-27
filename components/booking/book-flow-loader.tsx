"use client";

import { useTranslations } from "next-intl";

export function BookFlowLoader() {
  const t = useTranslations("bookFlow");
  return (
    <p className="mx-auto max-w-2xl text-center text-sm text-muted" aria-live="polite">
      {t("loading")}
    </p>
  );
}
