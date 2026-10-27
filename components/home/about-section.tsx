import Image from "next/image";
import { faAppleWhole, faCalendarDays, faLeaf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

const statKeys = ["trees", "cider", "txotx"] as const;

const statIcons: Record<(typeof statKeys)[number], IconDefinition> = {
  trees: faAppleWhole,
  cider: faLeaf,
  txotx: faCalendarDays,
};

export async function AboutSection() {
  const t = await getTranslations("aboutSection");

  return (
    <section id="about" className="scroll-mt-24 border-b border-line bg-cream px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <p className="mt-6 text-sm leading-relaxed text-muted italic">{t("motto")}</p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {statKeys.map((key) => (
              <div key={key}>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-olive">
                  <FontAwesomeIcon icon={statIcons[key]} className="h-3.5 w-3.5" aria-hidden />
                  {t(`stats.${key}.label`)}
                </dt>
                <dd className="mt-1 font-heading text-2xl text-forest">{t(`stats.${key}.value`)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative aspect-4/3 overflow-hidden border border-line">
            <Image
              src="/images/iturrieta-about-farmhouse.jpg"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted">{t("locationCaption")}</p>
        </Reveal>
      </div>
    </section>
  );
}
