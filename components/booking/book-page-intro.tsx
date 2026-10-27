import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function BookPageIntro() {
  const t = await getTranslations("bookFlow");

  return (
    <section className="relative border-b border-line bg-forest text-cream">
      <div className="absolute inset-0">
        <Image
          src="/images/iturrieta-txotx.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-linear-to-r from-forest via-forest/92 to-forest/75"
          aria-hidden
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-cream/75">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl leading-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/85">{t("lead")}</p>
      </div>
    </section>
  );
}
