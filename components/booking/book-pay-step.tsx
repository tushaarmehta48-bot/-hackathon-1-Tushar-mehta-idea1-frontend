"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createPaymentCheckout,
  devSimulatePaymentCapture,
  fetchReservation,
  type CheckoutSession,
  type Reservation,
} from "@/lib/booking-api";
import { ApiError } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BookPayStepProps = {
  reservation: Reservation;
  onPaid: (reservation: Reservation) => void;
  onExpired: () => void;
};

export function BookPayStep({ reservation, onPaid, onExpired }: BookPayStepProps) {
  const t = useTranslations("bookFlow.pay");
  const locale = useLocale();
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatMoney = useCallback(
    (cents: number, currency: string) =>
      new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100),
    [locale],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      const supabase = createSupabaseBrowserClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setError(t("errors.auth"));
        setLoading(false);
        return;
      }

      try {
        const sessionView = await createPaymentCheckout(token, reservation.id);
        if (!cancelled) {
          setCheckout(sessionView);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 400) {
            setError(t("errors.expired"));
            onExpired();
          } else {
            setError(t("errors.generic"));
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCheckout();
    return () => {
      cancelled = true;
    };
  }, [reservation.id, onExpired, t]);

  async function handlePay() {
    if (!checkout) {
      return;
    }
    setPaying(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      setError(t("errors.auth"));
      setPaying(false);
      return;
    }

    try {
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      if (checkout.devSimulateAllowed) {
        await devSimulatePaymentCapture(token, reservation.id);
        const updated = await fetchReservation(token, reservation.id);
        if (updated.status === "CONFIRMED") {
          onPaid(updated);
          return;
        }
        setError(t("errors.pending"));
      } else {
        setError(t("errors.provider"));
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">{t("loading")}</p>;
  }

  const amount =
    checkout?.amountCents != null && checkout.currency
      ? formatMoney(checkout.amountCents, checkout.currency)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("eyebrow")}</p>
        <h2 className="mt-2 font-heading text-2xl text-forest sm:text-3xl">{t("title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("body")}</p>
      </div>

      {amount ? (
        <p className="rounded-sm border border-line bg-cream px-4 py-3 text-sm text-forest">
          {t("amount", { amount })}
        </p>
      ) : null}

      {checkout?.depositDueAt ? (
        <p className="text-xs text-muted">
          {t("holdDeadline", {
            time: new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(checkout.depositDueAt)),
          })}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-sm border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-sm text-red-950" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" variant="rust" disabled={paying || !checkout} onClick={handlePay} className="w-full sm:w-auto">
        {paying ? t("processing") : t("payDeposit")}
      </Button>

      {checkout?.devSimulateAllowed ? (
        <p className="text-xs text-muted">{t("devNote")}</p>
      ) : null}
    </div>
  );
}
