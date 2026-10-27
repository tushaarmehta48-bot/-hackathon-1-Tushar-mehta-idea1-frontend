"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { BookingTicketWithDownload } from "@/components/booking/booking-ticket-download";
import {
  cancelReservation,
  fetchCheckInPass,
  fetchReservation,
  type Reservation,
} from "@/lib/booking-api";
import { BookPayStep } from "@/components/booking/book-pay-step";
import { ApiError } from "@/lib/api-client";
import { getBookingQrToken } from "@/lib/qr-token-store";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BookingDetailPanelProps = {
  reservationId: string;
};

export function BookingDetailPanel({ reservationId }: BookingDetailPanelProps) {
  const t = useTranslations("bookingDetail");
  const locale = useLocale();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createSupabaseBrowserClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent(`/bookings/${reservationId}`)}`);
        return;
      }

      try {
        const data = await fetchReservation(token, reservationId);
        if (!cancelled) {
          setReservation(data);
          const stored = getBookingQrToken(reservationId);
          if (stored) {
            setQrToken(stored);
          } else if (data.status === "CONFIRMED" || data.status === "CHECKED_IN") {
            try {
              const pass = await fetchCheckInPass(token, reservationId);
              if (!cancelled) {
                setQrToken(pass.qrPass);
              }
            } catch {
              if (!cancelled) {
                setQrToken(null);
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 403) {
            setError(t("errors.forbidden"));
          } else {
            setError(t("errors.load"));
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reservationId, router, t]);

  async function handleCancel() {
    if (!reservation || !window.confirm(t("cancelConfirm"))) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        return;
      }
      const updated = await cancelReservation(token, reservation.id);
      setReservation(updated);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(t("errors.notCancellable"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <p className="text-center text-sm text-muted">{t("loading")}</p>;
  }

  if (error && !reservation) {
    return <p className="text-center text-sm text-rust">{error}</p>;
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      {reservation.status === "PENDING_PAYMENT" ? (
        <BookPayStep
          reservation={reservation}
          onPaid={(updated) => {
            setReservation(updated);
            setQrToken(getBookingQrToken(reservationId));
          }}
          onExpired={async () => {
            const supabase = createSupabaseBrowserClient();
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) {
              return;
            }
            try {
              setReservation(await fetchReservation(token, reservationId));
            } catch {
              setError(t("errors.load"));
            }
          }}
        />
      ) : (
        <BookingTicketWithDownload
          reservation={reservation}
          locale={locale}
          qrValue={qrToken}
          qrHint={t("qrHint")}
        />
      )}

      {error ? <p className="text-sm text-rust">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/bookings" variant="secondary" className="flex-1">
          {t("backToList")}
        </ButtonLink>
        {reservation.canCancel ? (
          <Button
            type="button"
            variant="rust"
            className="flex-1"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? t("cancelling") : t("cancel")}
          </Button>
        ) : null}
      </div>

      {reservation.cancellationDeadlineAt && reservation.canCancel ? (
        <p className="text-center text-xs text-muted">
          {t("cancelDeadline", {
            date: new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(reservation.cancellationDeadlineAt)),
          })}
        </p>
      ) : null}
    </div>
  );
}
