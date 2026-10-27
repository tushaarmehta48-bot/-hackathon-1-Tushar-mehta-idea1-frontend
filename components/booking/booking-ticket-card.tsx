"use client";

import { forwardRef } from "react";
import QRCode from "react-qr-code";
import { useTranslations } from "next-intl";
import type { Reservation } from "@/lib/booking-api";

export type BookingTicketLayout = "summary" | "full";

type BookingTicketCardProps = {
  reservation: Reservation;
  locale: string;
  layout: BookingTicketLayout;
  qrValue?: string | null;
  qrHint?: string;
  className?: string;
};

function statusTone(status: string): {
  header: string;
  badge: string;
  labelKey: "statusConfirmed" | "statusCheckedIn" | "statusCancelled" | "statusPending" | "statusOther";
} {
  switch (status) {
    case "CONFIRMED":
      return {
        header: "from-forest via-forest-light to-olive",
        badge: "bg-gold/25 text-gold border-gold/40",
        labelKey: "statusConfirmed",
      };
    case "CHECKED_IN":
      return {
        header: "from-olive via-forest-light to-forest",
        badge: "bg-cream/20 text-cream border-cream/30",
        labelKey: "statusCheckedIn",
      };
    case "CANCELLED":
      return {
        header: "from-muted/80 via-muted to-ink/70",
        badge: "bg-cream/15 text-cream/90 border-cream/20",
        labelKey: "statusCancelled",
      };
    case "PENDING_PAYMENT":
      return {
        header: "from-wood via-rust/90 to-rust",
        badge: "bg-cream/20 text-cream border-cream/25",
        labelKey: "statusPending",
      };
    default:
      return {
        header: "from-forest to-forest-light",
        badge: "bg-cream/15 text-cream border-cream/25",
        labelKey: "statusOther",
      };
  }
}

function formatWhen(iso: string, locale: string, full: boolean) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: full ? "full" : "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export const BookingTicketCard = forwardRef<HTMLElement, BookingTicketCardProps>(
  function BookingTicketCard(
    { reservation, locale, layout, qrValue, qrHint, className = "" },
    ref,
  ) {
    const t = useTranslations("bookingTicket");
    const tone = statusTone(reservation.status);
    const showQr =
      layout === "full" &&
      qrValue &&
      reservation.status !== "CANCELLED" &&
      reservation.status !== "PENDING_PAYMENT";

    return (
      <article
        ref={ref}
        className={`overflow-hidden rounded-xl border border-line/80 shadow-md ${className}`}
      >
        <div className={`bg-gradient-to-br ${tone.header} px-5 py-5 text-cream sm:px-6 sm:py-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-cream/75">
                {t("venue")}
              </p>
              <p className="mt-1 font-heading text-lg leading-tight sm:text-xl">
                {layout === "full" ? t("passTitle") : t("listTitle")}
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${tone.badge}`}
            >
              {t(tone.labelKey, { status: reservation.status })}
            </span>
          </div>
          <p className="mt-4 font-heading text-2xl tracking-wide sm:text-3xl">
            {reservation.reference}
          </p>
        </div>

        <div className="relative bg-gradient-to-b from-cream-dark/50 to-cream px-5 py-5 sm:px-6 sm:py-6">
          <div
            className="pointer-events-none absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-cream-dark/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-cream-dark/30"
            aria-hidden
          />
          <div className="mb-4 border-t border-dashed border-line/90" aria-hidden />

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <TicketField label={t("when")} value={formatWhen(reservation.startsAt, locale, layout === "full")} />
            {reservation.shiftName ? (
              <TicketField label={t("service")} value={reservation.shiftName} />
            ) : null}
            {reservation.tableLabel ? (
              <TicketField label={t("table")} value={reservation.tableLabel} />
            ) : null}
            <TicketField
              label={t("party")}
              value={t("guests", { count: reservation.partySize })}
            />
            {layout === "full" && reservation.specialRequest ? (
              <div className="sm:col-span-2">
                <TicketField label={t("notes")} value={reservation.specialRequest} />
              </div>
            ) : null}
          </dl>

          {reservation.checkedInGuestCount != null && reservation.checkedInGuestCount > 0 ? (
            <p className="mt-4 text-center text-sm font-medium text-forest">
              {t("checkInProgress", {
                checked: reservation.checkedInGuestCount,
                total: reservation.partySize,
              })}
            </p>
          ) : null}

          {showQr ? (
            <div className="mt-6 rounded-lg border border-line/80 bg-cream/90 p-4 text-center shadow-inner">
              <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("checkInPass")}</p>
              <div className="mx-auto mt-4 inline-block rounded-lg bg-white p-3 shadow-sm">
                <QRCode value={qrValue} size={layout === "full" ? 168 : 120} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {t("qrScanHint", { count: reservation.partySize })}
              </p>
            </div>
          ) : null}

          {layout === "full" && !showQr && reservation.status !== "CANCELLED" ? (
            <p className="mt-4 text-center text-sm text-muted">{qrHint ?? t("qrUnavailable")}</p>
          ) : null}

          {layout === "summary" ? (
            <p className="mt-4 text-right text-xs font-medium text-forest/80">{t("viewDetails")} →</p>
          ) : null}
        </div>
      </article>
    );
  },
);

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-cream/80 px-3 py-2 ring-1 ring-line/60">
      <dt className="text-[0.65rem] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-forest">{value}</dd>
    </div>
  );
}
