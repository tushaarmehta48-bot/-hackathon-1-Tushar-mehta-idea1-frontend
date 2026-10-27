"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { BookingDetailPanel } from "@/components/booking/booking-detail-panel";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("bookingDetail");

  if (!params.id) {
    return <p className="text-center text-sm text-muted">{t("loading")}</p>;
  }

  return (
    <main
      id="main"
      className="flex flex-1 bg-gradient-to-b from-cream-dark/40 via-cream to-cream px-4 py-16 sm:px-6"
    >
      <BookingDetailPanel reservationId={params.id} />
    </main>
  );
}
