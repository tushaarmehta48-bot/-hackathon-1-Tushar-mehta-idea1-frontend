import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-forest text-cream">
      <Image
        src="/images/hero-dining.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-70"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-forest/90 via-forest/50 to-forest/30"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-cream/80">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/90 sm:text-lg">
            {t("lead")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/book" variant="rust">
              {t("book")}
            </ButtonLink>
            <ButtonLink
              href="#menu"
              variant="secondary"
              className="border-cream/40 text-cream hover:bg-cream/10"
            >
              {t("viewMenu")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
