import type { AppLocale } from "@/i18n/routing";

export const RESTAURANT_TIMEZONE =
  process.env.NEXT_PUBLIC_RESTAURANT_TIMEZONE ?? "Europe/Madrid";

export function formatDate(
  date: Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: RESTAURANT_TIMEZONE,
  }).format(date);
}

export function formatTime(
  date: Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { timeStyle: "short" },
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: RESTAURANT_TIMEZONE,
  }).format(date);
}

export function formatNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
