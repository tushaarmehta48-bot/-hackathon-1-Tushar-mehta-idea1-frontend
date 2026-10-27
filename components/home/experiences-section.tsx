import Image from "next/image";
import { faCompactDisc, faRoute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

const experienceItems = [
  { key: "music" as const, icon: faCompactDisc },
  { key: "visits" as const, icon: faRoute },
];

export async function ExperiencesSection() {
  const t = await getTranslations("experiencesSection");

  return (
    <section
      id="experiences"
      className="scroll-mt-24 border-y border-line bg-cream-dark/50 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
          <ul className="mt-10 space-y-8">
            {experienceItems.map((item) => (
              <li key={item.key}>
                <div className="flex gap-4">
                  <span
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-forest/10 text-forest"
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg text-forest">
                      {t(`items.${item.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(`items.${item.key}.body`)}
                    </p>
                    {item.key === "music" ? (
                      <ul className="mt-3 space-y-2 text-sm text-muted">
                        <li>
                          <span className="font-medium text-ink">{t("items.music.summerLabel")}</span>
                          {" — "}
                          {t("items.music.summerBody")}
                        </li>
                        <li>
                          <span className="font-medium text-ink">{t("items.music.winterLabel")}</span>
                          {" — "}
                          {t("items.music.winterBody")}
                        </li>
                      </ul>
                    ) : (
                      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
                        {(["farmhouse", "orchard", "making"] as const).map((point) => (
                          <li key={point}>{t(`items.visits.points.${point}`)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-4/5 overflow-hidden border border-line">
            <Image
              src="/images/iturrieta-concerts.jpg"
              alt={t("imageAlt")}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
