import {
  faClock,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

const hourKeys = ["weekend", "sunday", "weekdays"] as const;

export async function VisitSection() {
  const t = await getTranslations("visitSection");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapsQuery)}`;

  return (
    <section id="visit" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <dl className="space-y-8">
              <div className="flex gap-4">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="mt-1 h-5 w-5 text-rust"
                  aria-hidden
                />
                <div>
                  <dt className="font-heading text-lg text-forest">{t("address")}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                    <br />
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-forest underline-offset-2 hover:underline"
                    >
                      {t("openMaps")}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mt-1 h-5 w-5 text-rust"
                  aria-hidden
                />
                <div>
                  <dt className="font-heading text-lg text-forest">{t("telephone")}</dt>
                  <dd className="mt-1 text-sm text-muted">
                    <a
                      href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                      className="text-forest underline-offset-2 hover:underline"
                    >
                      {site.contact.phone}
                    </a>{" "}
                    {t("phoneNote")}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mt-1 h-5 w-5 text-rust"
                  aria-hidden
                />
                <div>
                  <dt className="font-heading text-lg text-forest">
                    {t("openingTimes")}
                  </dt>
                  <dd className="mt-2 space-y-3">
                    {hourKeys.map((key) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-ink">
                          {t(`hours.${key}.label`)}
                        </p>
                        <p className="text-sm text-muted">{t(`hours.${key}.detail`)}</p>
                      </div>
                    ))}
                  </dd>
                </div>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.08}>
            <div
              className="flex min-h-[280px] items-center justify-center border border-dashed border-line bg-cream-dark/60 p-8 text-center"
              role="img"
              aria-label={t("mapAria")}
            >
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                {t("mapPlaceholder")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
