import Image from "next/image";
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

const hourKeys = ["open", "dinners", "closed", "holidays"] as const;

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
                      href={`tel:${site.contact.phoneTel}`}
                      className="text-forest underline-offset-2 hover:underline"
                    >
                      {site.contact.phone}
                    </a>
                    {" · "}
                    <a
                      href={site.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest underline-offset-2 hover:underline"
                    >
                      {t("whatsapp")}
                    </a>
                    <p className="mt-2 text-sm text-muted">{t("phoneNote")}</p>
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
            <div className="relative min-h-[280px] overflow-hidden border border-line">
              <Image
                src="/images/iturrieta-terrace.jpg"
                alt={t("imageAlt")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-forest/75 via-transparent to-transparent" />
              <p className="absolute bottom-0 p-6 text-sm leading-relaxed text-cream/95">
                {t("imageCaption")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
