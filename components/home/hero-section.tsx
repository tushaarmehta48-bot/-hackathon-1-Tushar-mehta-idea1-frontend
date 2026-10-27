"use client";

import {
  faArrowDown,
  faCalendarCheck,
  faPhone,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { HeroBackgroundCarousel } from "@/components/home/hero-background-carousel";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import { heroSlideIds, heroSlideSources } from "@/content/hero-images";

export function HeroSection() {
  const t = useTranslations("hero");
  const reduceMotion = useReducedMotion();

  const slides = useMemo(
    () =>
      heroSlideIds.map((id) => ({
        src: heroSlideSources[id],
        alt: t(`slides.${id}.alt`),
      })),
    [t],
  );

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.08 },
      };

  return (
    <section className="relative isolate w-full min-h-[calc(100svh-4.25rem)] overflow-hidden bg-forest text-cream sm:min-h-[calc(100svh-4.5rem)]">
      <HeroBackgroundCarousel
        slides={slides}
        autoAdvanceMs={5000}
        labels={{
          previous: t("gallery.previous"),
          next: t("gallery.next"),
          formatCounter: (current, total) => t("gallery.counter", { current, total }),
        }}
      />

      <div className="pointer-events-none relative z-[1] mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[calc(100svh-4.5rem)] sm:px-6 sm:pb-14 sm:pt-28">
        <motion.div className="pointer-events-auto relative" {...motionProps}>
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-cream/80">
            <FontAwesomeIcon icon={faUtensils} className="h-3.5 w-3.5 text-gold" aria-hidden />
            {t("eyebrow")}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            {t("title")}
            <span className="mt-2 block text-2xl font-normal italic text-cream/90 sm:text-3xl">
              {t("titleAccent")}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/90 sm:text-lg">{t("lead")}</p>
          <p className="mt-3 max-w-lg text-sm text-cream/75">{t("leadSecondary")}</p>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              href="/book"
              variant="rust"
              className="gap-2 shadow-lg ring-2 ring-cream/20 ring-offset-2 ring-offset-transparent"
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" aria-hidden />
              {t("book")}
            </ButtonLink>
            <ButtonLink href={{ pathname: "/", hash: "menu" }} variant="cream" className="gap-2">
              <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-forest" aria-hidden />
              {t("viewMenu")}
            </ButtonLink>
            <a
              href={`tel:${site.contact.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-cream/50 bg-forest/75 px-5 py-3 text-sm font-medium tracking-wide text-cream shadow-md backdrop-blur-sm transition hover:bg-forest/90"
            >
              <FontAwesomeIcon icon={faPhone} className="h-4 w-4" aria-hidden />
              {t("callPhone")}
            </a>
          </div>
        </motion.div>

        <motion.a
          href="#about"
          className="pointer-events-auto relative mt-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream/70 transition hover:text-cream"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: 1, duration: 0.6 },
              })}
        >
          <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3 animate-bounce motion-reduce:animate-none" />
          {t("scrollHint")}
        </motion.a>
      </div>
    </section>
  );
}
