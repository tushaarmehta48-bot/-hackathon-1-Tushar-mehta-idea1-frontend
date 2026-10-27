import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CustomerAuthProvider } from "@/components/layout/customer-auth-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { HashScrollOnNav } from "@/components/layout/hash-scroll-on-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { LocaleHtmlLang } from "@/components/layout/locale-html-lang";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/content/site";

export const instant = false;

type LocaleLayoutProps = LayoutProps<"/[locale]">;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");

  return {
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: t("siteDescription"),
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as AppLocale;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <CustomerAuthProvider>
        <LocaleHtmlLang locale={locale} />
        <HashScrollOnNav />
        <SiteHeader />
        {children}
        <SiteFooter />
      </CustomerAuthProvider>
    </NextIntlClientProvider>
  );
}
