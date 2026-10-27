"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BookingTicketCard } from "@/components/booking/booking-ticket-card";
import { Button } from "@/components/ui/button";
import type { Reservation } from "@/lib/booking-api";
import { downloadBookingTicketPdf } from "@/lib/booking-ticket-pdf";

type BookingTicketDownloadProps = {
  reservation: Reservation;
  locale: string;
  qrValue: string | null;
  qrHint: string;
};

function statusLabelKey(
  status: string,
): "statusConfirmed" | "statusCheckedIn" | "statusCancelled" | "statusPending" | "statusOther" {
  switch (status) {
    case "CONFIRMED":
      return "statusConfirmed";
    case "CHECKED_IN":
      return "statusCheckedIn";
    case "CANCELLED":
      return "statusCancelled";
    case "PENDING_PAYMENT":
      return "statusPending";
    default:
      return "statusOther";
  }
}

function formatWhen(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function BookingTicketWithDownload({
  reservation,
  locale,
  qrValue,
  qrHint,
}: BookingTicketDownloadProps) {
  const t = useTranslations("bookingTicket");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showQr =
    Boolean(qrValue) &&
    reservation.status !== "CANCELLED" &&
    reservation.status !== "PENDING_PAYMENT";

  async function handleDownload() {
    setBusy(true);
    setError(null);
    try {
      const safeRef = reservation.reference.replace(/[^\w-]+/g, "-");
      const statusKey = statusLabelKey(reservation.status);
      await downloadBookingTicketPdf({
        filename: `iturrieta-booking-${safeRef}.pdf`,
        venue: t("venue"),
        passTitle: t("passTitle"),
        reference: reservation.reference,
        statusLabel: t(statusKey, { status: reservation.status }),
        whenLabel: t("when"),
        whenValue: formatWhen(reservation.startsAt, locale),
        serviceLabel: reservation.shiftName ? t("service") : undefined,
        serviceValue: reservation.shiftName ?? undefined,
        tableLabel: reservation.tableLabel ? t("table") : undefined,
        tableValue: reservation.tableLabel ?? undefined,
        partyLabel: t("party"),
        partyValue: t("guests", { count: reservation.partySize }),
        notesLabel: reservation.specialRequest ? t("notes") : undefined,
        notesValue: reservation.specialRequest ?? undefined,
        checkInLabel: showQr ? t("checkInPass") : undefined,
        qrScanHint: showQr ? t("qrScanHint", { count: reservation.partySize }) : undefined,
        qrValue: showQr ? qrValue : null,
      });
    } catch {
      setError(t("pdfError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <BookingTicketCard
        reservation={reservation}
        locale={locale}
        layout="full"
        qrValue={qrValue}
        qrHint={qrHint}
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2 sm:w-auto"
        disabled={busy}
        onClick={() => void handleDownload()}
      >
        <FontAwesomeIcon icon={faFilePdf} className="h-4 w-4" aria-hidden />
        {busy ? t("downloadingPdf") : t("downloadPdf")}
      </Button>
      {error ? (
        <p className="text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
