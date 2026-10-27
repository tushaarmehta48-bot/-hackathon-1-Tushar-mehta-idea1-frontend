"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PhotoCarousel } from "@/components/ui/photo-carousel";
import {
  bookingStepGalleries,
  type BookingVisualStep,
} from "@/content/booking-images";

type BookingImageCarouselProps = {
  step: BookingVisualStep;
  portraitOnLarge?: boolean;
};

/** Gallery steps use `tableType`; copy lives under `aside.table`. */
const asideKeyForStep: Record<BookingVisualStep, "when" | "time" | "table" | "details" | "done"> =
  {
    when: "when",
    time: "time",
    tableType: "table",
    table: "table",
    details: "details",
    done: "done",
  };

export function BookingImageCarousel({
  step,
  portraitOnLarge = false,
}: BookingImageCarouselProps) {
  const t = useTranslations("bookFlow");
  const asideKey = asideKeyForStep[step];

  const slides = useMemo(
    () =>
      bookingStepGalleries[step].map((slide) => ({
        src: slide.src,
        alt: t(slide.altKey),
        eyebrow: t(`aside.${asideKey}`),
        caption: t(slide.captionKey),
      })),
    [step, asideKey, t],
  );

  const aspectClass = portraitOnLarge
    ? "aspect-5/2 w-full sm:aspect-2/1 lg:aspect-4/5"
    : "aspect-5/2 w-full sm:aspect-2/1 lg:aspect-square";

  return (
    <PhotoCarousel
      key={step}
      slides={slides}
      aspectClassName={aspectClass}
      imageSizes="(max-width: 1024px) 100vw, 40vw"
      labels={{
        previous: t("gallery.previous"),
        next: t("gallery.next"),
        formatCounter: (current, total) => t("gallery.counter", { current, total }),
      }}
    />
  );
}
