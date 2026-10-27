"use client";

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type PhotoCarouselSlide = {
  src: string;
  alt: string;
  caption?: string;
  eyebrow?: string;
};

type PhotoCarouselProps = {
  slides: PhotoCarouselSlide[];
  aspectClassName?: string;
  autoAdvanceMs?: number;
  imageSizes?: string;
  labels: {
    previous: string;
    next: string;
    formatCounter: (current: number, total: number) => string;
  };
  priorityFirst?: boolean;
};

export function PhotoCarousel({
  slides,
  aspectClassName = "aspect-21/9 w-full",
  autoAdvanceMs = 2000,
  imageSizes = "100vw",
  labels,
  priorityFirst = true,
}: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const total = slides.length;
  const slide = slides[index];

  useEffect(() => {
    if (total <= 1 || paused || autoAdvanceMs <= 0) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, autoAdvanceMs);

    return () => window.clearInterval(timer);
  }, [total, paused, index, autoAdvanceMs]);

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
    <figure
      className={`group relative overflow-hidden border border-line bg-cream-dark/50 ${aspectClassName}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`${slide.src}-${index}`}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.85, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            sizes={imageSizes}
            priority={priorityFirst && index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 bg-forest/75 text-cream shadow-sm transition-colors hover:bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:left-4"
            aria-label={labels.previous}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 bg-forest/75 text-cream shadow-sm transition-colors hover:bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-4"
            aria-label={labels.next}
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" aria-hidden />
          </button>
          <div
            className="absolute right-3 top-3 rounded-sm bg-forest/70 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-cream sm:right-4"
            aria-live="polite"
          >
            {labels.formatCounter(index + 1, total)}
          </div>
        </>
      ) : null}

      {slide.caption || slide.eyebrow ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-forest/90 via-forest/45 to-transparent px-4 pb-4 pt-16 text-sm leading-snug text-cream sm:px-6 sm:pb-5">
          {slide.eyebrow ? (
            <span className="block text-xs uppercase tracking-[0.15em] text-cream/75">{slide.eyebrow}</span>
          ) : null}
          {slide.caption ? <span className="mt-1 block">{slide.caption}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
