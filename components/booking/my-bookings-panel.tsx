"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { BookingTicketCard } from "@/components/booking/booking-ticket-card";
import { ButtonLink } from "@/components/ui/button";
import { fetchMyReservations, type Reservation } from "@/lib/booking-api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function MyBookingsPanel() {
  const t = useTranslations("myBookings");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createSupabaseBrowserClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent("/bookings")}`);
        return;
      }

      try {
        const data = await fetchMyReservations(token);
        if (!cancelled) {
          setItems(data);
        }
      } catch {
        if (!cancelled) {
          setError(t("errors.load"));
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
  }, [router, t]);

  if (loading) {
    return <p className="text-center text-sm text-muted">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-center text-sm text-rust">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <p className="text-muted">{t("empty")}</p>
        <ButtonLink href="/book" variant="primary">
          {t("bookNow")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <ul className="mx-auto max-w-xl space-y-6">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={`/bookings/${item.id}`} className="block transition-transform hover:scale-[1.01]">
            <BookingTicketCard reservation={item} locale={locale} layout="summary" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
