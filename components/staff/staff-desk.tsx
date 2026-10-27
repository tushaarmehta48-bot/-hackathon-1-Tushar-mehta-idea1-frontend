"use client";

import Image from "next/image";
import {
  faCalendarDay,
  faClockRotateLeft,
  faQrcode,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { MeResponse } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import type { Reservation } from "@/lib/booking-api";
import {
  checkInConfirm,
  checkInScan,
  fetchMyCheckInHistory,
  fetchStaffDay,
  type CheckInScanResult,
  type StaffCheckInHistoryItem,
} from "@/lib/staff-api";
import { useStaffReservationsRealtime } from "@/lib/use-staff-realtime";
import { todayInVenueTimezone } from "@/lib/venue-date";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { STAFF_DESK_HERO, STAFF_DESK_SCAN } from "@/content/staff-dashboard-images";
import { Button } from "@/components/ui/button";
import { StaffQrScanner } from "@/components/staff/staff-qr-scanner";

type StaffDeskProps = {
  me: MeResponse;
  onSignOut: () => void;
};

type StaffTab = "scan" | "bookings" | "history";

export function StaffDesk({ me, onSignOut }: StaffDeskProps) {
  const t = useTranslations("staffDesk");
  const [tab, setTab] = useState<StaffTab>("scan");
  const [token, setToken] = useState<string | null>(null);
  const [date, setDate] = useState(todayInVenueTimezone());
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lookup, setLookup] = useState("");
  const [scanResult, setScanResult] = useState<CheckInScanResult | null>(null);
  const [checkInBusy, setCheckInBusy] = useState(false);
  const [checkInBanner, setCheckInBanner] = useState<
    | { kind: "invalid" }
    | { kind: "rejected"; message: string; reference: string }
    | {
        kind: "success";
        reference: string;
        guestsCheckedIn: number;
        partySize: number;
        complete: boolean;
      }
    | null
  >(null);

  const [history, setHistory] = useState<StaffCheckInHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    void createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const loadDay = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchStaffDay(token, date, search));
    } catch {
      setError(t("errors.loadDay"));
    } finally {
      setLoading(false);
    }
  }, [token, date, search, t]);

  const loadHistory = useCallback(async () => {
    if (!token) {
      return;
    }
    setHistoryLoading(true);
    try {
      setHistory(await fetchMyCheckInHistory(token, 60));
    } catch {
      setError(t("errors.loadHistory"));
    } finally {
      setHistoryLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (tab === "bookings") {
      void loadDay();
    }
  }, [tab, loadDay]);

  useEffect(() => {
    if (tab === "history") {
      void loadHistory();
    }
  }, [tab, loadHistory]);

  useStaffReservationsRealtime(() => {
    if (tab === "bookings") {
      void loadDay();
    }
  });

  const runCheckInLookup = useCallback(
    async (body: { token?: string; reference?: string }, autoConfirm: boolean) => {
      if (!token) {
        return;
      }
      setCheckInBusy(true);
      setError(null);
      setScanResult(null);
      setCheckInBanner(null);
      try {
        const result = await checkInScan(token, body);
        if (!result.canCheckIn) {
          setCheckInBanner({
            kind: "rejected",
            message: result.message,
            reference: result.reference,
          });
          return;
        }
        if (autoConfirm) {
          try {
            const updated = await checkInConfirm(token, result.reservationId);
            const guestsCheckedIn = updated.checkedInGuestCount ?? result.guestsCheckedIn + 1;
            setCheckInBanner({
              kind: "success",
              reference: result.reference,
              guestsCheckedIn,
              partySize: updated.partySize,
              complete: updated.status === "CHECKED_IN",
            });
            setLookup("");
            void loadHistory();
          } catch (confirmErr) {
            if (confirmErr instanceof ApiError && confirmErr.status === 409) {
              setCheckInBanner({ kind: "invalid" });
            } else {
              throw confirmErr;
            }
          }
          return;
        }
        setScanResult(result);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setCheckInBanner({ kind: "invalid" });
        } else if (err instanceof ApiError && err.status === 503) {
          setError(err.message || t("errors.serviceUnavailable"));
        } else {
          setError(t("errors.generic"));
        }
      } finally {
        setCheckInBusy(false);
      }
    },
    [token, loadHistory, t],
  );

  async function handleScan() {
    if (!lookup.trim()) {
      return;
    }
    const body = lookup.trim().includes("-")
      ? { reference: lookup.trim() }
      : { token: lookup.trim() };
    await runCheckInLookup(body, false);
  }

  const handleQrScan = useCallback(
    (payload: string) => {
      if (checkInBusy || !payload.trim()) {
        return;
      }
      void runCheckInLookup({ token: payload.trim() }, true);
    },
    [checkInBusy, runCheckInLookup],
  );

  async function handleConfirmCheckIn() {
    if (!token || !scanResult?.canCheckIn) {
      return;
    }
    setCheckInBusy(true);
    setError(null);
    try {
      const reference = scanResult.reference;
      const updated = await checkInConfirm(token, scanResult.reservationId);
      setScanResult(null);
      setLookup("");
      setCheckInBanner({
        kind: "success",
        reference,
        guestsCheckedIn: updated.checkedInGuestCount ?? scanResult.guestsCheckedIn + 1,
        partySize: updated.partySize,
        complete: updated.status === "CHECKED_IN",
      });
      void loadHistory();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? t("errors.duplicateCheckIn") : t("errors.generic"));
    } finally {
      setCheckInBusy(false);
    }
  }

  const tabs: { id: StaffTab; label: string; icon: typeof faQrcode }[] = [
    { id: "scan", label: t("tabs.scan"), icon: faQrcode },
    { id: "bookings", label: t("tabs.bookings"), icon: faCalendarDay },
    { id: "history", label: t("tabs.history"), icon: faClockRotateLeft },
  ];

  const formatWhen = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-3 pb-20 sm:px-4">
      <header className="relative min-h-[180px] overflow-hidden rounded-2xl border border-line/90 shadow-lg sm:min-h-[200px]">
        <Image src={STAFF_DESK_HERO.src} alt={STAFF_DESK_HERO.alt} fill className="object-cover" priority sizes="1024px" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest/92 via-forest/78 to-olive/50" />
        <div className="relative flex h-full min-h-[180px] flex-wrap items-end justify-between gap-4 p-6 sm:min-h-[200px]">
          <div className="text-cream">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/90">{t("eyebrow")}</p>
            <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-cream/85">
              {me.profile.role} · {me.email ?? me.id}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="border-cream/30 bg-cream/10 text-cream hover:bg-cream/20 hover:text-cream"
            onClick={onSignOut}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" aria-hidden />
            {t("signOut")}
          </Button>
        </div>
      </header>

      <nav
        className="flex flex-wrap gap-2 rounded-xl border border-line/80 bg-cream/95 p-2 shadow-sm"
        aria-label={t("navLabel")}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              tab === item.id ? "bg-forest text-cream shadow-md" : "text-forest hover:bg-cream-dark/50"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="rounded-lg border border-red-300/80 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm" role="alert">
          {error}
        </p>
      ) : null}

      {tab === "scan" ? (
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 rounded-xl border border-line bg-cream p-5 shadow-md lg:col-span-3">
            <h2 className="font-heading text-xl text-forest">{t("checkIn.title")}</h2>
            <p className="text-sm text-muted">{t("checkIn.hint")}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-olive">{t("checkIn.cameraTitle")}</p>
            <StaffQrScanner
              onScan={handleQrScan}
              disabled={checkInBusy || !token}
              cameraErrorLabel={t("checkIn.cameraError")}
            />
            {checkInBanner?.kind === "invalid" ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-900" role="alert">
                {t("checkIn.invalid")}
              </p>
            ) : null}
            {checkInBanner?.kind === "rejected" ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert">
                {t("checkIn.notEligible", { reference: checkInBanner.reference, message: checkInBanner.message })}
              </p>
            ) : null}
            {checkInBanner?.kind === "success" ? (
              <p className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-900" role="status">
                {checkInBanner.complete
                  ? t("checkIn.successComplete", {
                      reference: checkInBanner.reference,
                      partySize: checkInBanner.partySize,
                    })
                  : t("checkIn.successPartial", {
                      reference: checkInBanner.reference,
                      guestsCheckedIn: checkInBanner.guestsCheckedIn,
                      partySize: checkInBanner.partySize,
                    })}
              </p>
            ) : null}
            <p className="text-xs uppercase tracking-[0.15em] text-olive">{t("checkIn.manualTitle")}</p>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                placeholder={t("checkIn.placeholder")}
                className="min-w-[16rem] flex-1 rounded-md border border-line bg-cream px-3 py-2.5 text-sm shadow-sm"
              />
              <Button type="button" variant="primary" disabled={checkInBusy} onClick={() => void handleScan()}>
                {t("checkIn.lookup")}
              </Button>
            </div>
            {scanResult ? (
              <div className="rounded-lg border border-line bg-cream-dark/25 px-4 py-3 text-sm">
                <p className="font-medium text-forest">{scanResult.reference}</p>
                <p className="mt-1 text-muted">
                  {scanResult.tableLabel ?? "—"} · {scanResult.partySize} · {scanResult.message}
                </p>
                {scanResult.canCheckIn ? (
                  <Button type="button" variant="rust" className="mt-3" disabled={checkInBusy} onClick={() => void handleConfirmCheckIn()}>
                    {t("checkIn.confirm")}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="relative min-h-[240px] overflow-hidden rounded-xl border border-line shadow-md lg:col-span-2">
            <Image src={STAFF_DESK_SCAN.src} alt={STAFF_DESK_SCAN.alt} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-forest/35" />
            <p className="absolute bottom-4 left-4 right-4 text-sm leading-relaxed text-cream drop-shadow">
              {t("scanAside")}
            </p>
          </div>
        </section>
      ) : null}

      {tab === "bookings" ? (
        <section className="space-y-4 rounded-xl border border-line bg-gradient-to-br from-cream to-cream-dark/30 p-6 shadow-md">
          <h2 className="font-heading text-xl text-forest">{t("dayView.title")}</h2>
          <div className="flex flex-wrap gap-3 rounded-lg border border-line/70 bg-cream/90 p-3">
            <label className="text-xs font-medium uppercase tracking-wide text-olive">
              {t("dayView.date")}
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 block rounded-md border border-line bg-cream px-3 py-2 text-sm shadow-sm"
              />
            </label>
            <label className="min-w-[12rem] flex-1 text-xs font-medium uppercase tracking-wide text-olive">
              {t("dayView.search")}
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("dayView.searchPlaceholder")}
                className="mt-1 block w-full rounded-md border border-line bg-cream px-3 py-2 text-sm shadow-sm"
              />
            </label>
            <Button type="button" variant="secondary" className="self-end" onClick={() => void loadDay()}>
              {t("dayView.refresh")}
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted">{t("dayView.empty")}</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-cream shadow-sm">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <span className="font-medium text-forest">{row.reference}</span>
                    <span className="ml-2 text-muted">
                      {row.tableLabel ?? "—"} · {row.partySize} {t("dayView.guests")}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-olive">{row.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "history" ? (
        <section className="space-y-4 rounded-xl border border-line bg-cream p-6 shadow-md">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-xl text-forest">{t("history.title")}</h2>
            <Button type="button" variant="secondary" size="sm" disabled={historyLoading} onClick={() => void loadHistory()}>
              {t("history.refresh")}
            </Button>
          </div>
          <p className="text-sm text-muted">{t("history.hint")}</p>
          {historyLoading ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted">{t("history.empty")}</p>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-cream-dark/20">
              {history.map((row) => (
                <li key={row.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-forest">{row.reference}</p>
                    <p className="text-muted">
                      {row.tableLabel ?? "—"} · {row.partySize} {t("dayView.guests")}
                      {" · "}
                      {row.method === "QR" ? t("history.methodQr") : t("history.methodManual")}
                    </p>
                  </div>
                  <time className="text-xs text-olive" dateTime={row.checkedInAt}>
                    {formatWhen(row.checkedInAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

    </div>
  );
}
