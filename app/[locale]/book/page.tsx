import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

type BookPageProps = PageProps<"/[locale]/book">;

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("bookTitle"),
    description: t("bookDescription"),
  };
}

export default async function BookPlaceholderPage({ params }: BookPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bookPage");

  return (
    <main id="main" className="flex flex-1 items-center px-4 py-20 sm:px-6">
      <Reveal className="mx-auto max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-olive">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-heading text-4xl text-forest">{t("title")}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">{t("body")}</p>
        <ButtonLink href="/" variant="secondary" className="mt-8">
          {t("backHome")}
        </ButtonLink>
      </Reveal>
    </main>
  );
}
