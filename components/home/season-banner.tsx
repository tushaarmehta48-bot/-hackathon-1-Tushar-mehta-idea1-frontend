import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export async function SeasonBanner() {
  const t = await getTranslations("season");

  return (
    <section className="bg-forest px-4 py-16 text-cream sm:px-6">
      <Reveal>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/70">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl">{t("title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-cream/90">{t("body")}</p>
          </div>
          <ButtonLink href="/book" variant="rust" className="shrink-0">
            {t("cta")}
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
