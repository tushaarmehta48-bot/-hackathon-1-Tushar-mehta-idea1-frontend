"use client";

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroBackgroundSlide = {
  src: string;
  alt: string;
};

type HeroBackgroundCarouselProps = {
  slides: HeroBackgroundSlide[];
  autoAdvanceMs?: number;
  labels: {
    previous: string;
    next: string;
    formatCounter: (current: number, total: number) => string;
  };
};

export function HeroBackgroundCarousel({
  slides,
  autoAdvanceMs = 5000,
  labels,
}: HeroBackgroundCarouselProps) {
  const [index, setIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const total = slides.length;
  const slide = slides[index];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry?.isIntersecting ?? false);
      },
      { root: null, threshold: 0.05 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onVisibilityChange() {
      setTabHidden(document.hidden);
    }
    setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (total <= 1 || interactionPaused || tabHidden || !inView || autoAdvanceMs <= 0 || reduceMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, autoAdvanceMs);
    return () => window.clearInterval(timer);
  }, [total, interactionPaused, tabHidden, inView, autoAdvanceMs, reduceMotion]);

  if (!slide) {
    return null;
  }

  function goPrev() {
    setIndex((current) => (current - 1 + total) % total);
  }

  function goNext() {
    setIndex((current) => (current + 1) % total);
  }

  return (
    <div
      ref={rootRef}
      className="absolute inset-0"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.src + index}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="min-h-full min-w-full object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(30_61_50/0.93)_0%,rgb(30_61_50/0.52)_38%,rgb(30_61_50/0.22)_68%,rgb(30_61_50/0.1)_100%),linear-gradient(to_right,rgb(30_61_50/0.58)_0%,rgb(30_61_50/0.28)_42%,transparent_72%)]"
        aria-hidden
      />

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/35 bg-forest/60 text-cream backdrop-blur-sm transition hover:bg-forest/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:left-6"
            aria-label={labels.previous}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/35 bg-forest/60 text-cream backdrop-blur-sm transition hover:bg-forest/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-6"
            aria-label={labels.next}
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
          </button>
          <div
            className="absolute right-4 top-24 rounded-sm bg-forest/65 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-cream backdrop-blur-sm sm:right-6 sm:top-28"
            aria-live="polite"
          >
            {labels.formatCounter(index + 1, total)}
          </div>
        </>
      ) : null}
    </div>
  );
}
