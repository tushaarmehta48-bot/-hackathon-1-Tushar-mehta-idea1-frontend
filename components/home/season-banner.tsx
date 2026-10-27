import Image from "next/image";
import { faWineGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export async function SeasonBanner() {
  const t = await getTranslations("season");

  return (
    <section className="relative overflow-hidden bg-forest px-4 py-16 text-cream sm:px-6 sm:py-20">
      <Image
        src="/images/iturrieta-kupelas.jpg"
        alt=""
        fill
        className="object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-linear-to-r from-forest via-forest/90 to-forest/75" aria-hidden />
      <Reveal>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cream/70">
              <FontAwesomeIcon icon={faWineGlass} className="h-4 w-4 text-gold" aria-hidden />
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl">{t("title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-cream/90">{t("body")}</p>
            <p className="mt-3 text-sm text-cream/75">{t("bodySecondary")}</p>
          </div>
          <ButtonLink href="/book" variant="rust" className="shrink-0 gap-2">
            {t("cta")}
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
