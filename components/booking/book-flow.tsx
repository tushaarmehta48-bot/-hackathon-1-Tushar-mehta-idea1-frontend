"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  createReservation,
  fetchAvailability,
  fetchFloorPlan,
  type AvailabilityShift,
  type FloorPlanTable,
  type Reservation,
} from "@/lib/booking-api";
import { ApiError } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getBookingQrToken, saveBookingQrToken } from "@/lib/qr-token-store";
import { TableTierCardPicker } from "@/components/booking/table-tier-card-picker";
import { effectiveTableTier, type TableTier } from "@/lib/table-tier";
import { BookingQrPass } from "@/components/booking/booking-qr-pass";
import { BookingStepIndicator } from "@/components/booking/booking-step-indicator";
import { BookingImageCarousel } from "@/components/booking/booking-image-carousel";
import { BookingSummary } from "@/components/booking/booking-summary";
import { BookPayStep } from "@/components/booking/book-pay-step";
import type { BookingVisualStep } from "@/content/booking-images";
import {
  isOnlineLunchDay,
  isPastVenueDate,
  PUBLIC_LUNCH_LAST_START_TIME,
  PUBLIC_LUNCH_START_TIME,
  slotStartLocalTime,
  todayInVenueTimezone,
} from "@/lib/venue-date";
import {
  clearBookFlowDraft,
  loadBookFlowDraft,
  saveBookFlowDraft,
  type BookFlowDraft,
} from "@/lib/book-flow-draft";

type Step = "when" | "time" | "tableType" | "details" | "pay" | "done";

const fieldClass =
  "mt-2 w-full rounded-sm border border-line bg-cream px-3 py-2.5 text-ink shadow-sm transition-[border-color,box-shadow] focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/15";

const PARTY_PRESETS = [2, 3, 4, 5, 6, 7, 8] as const;

export function BookFlow() {
  const t = useTranslations("bookFlow");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>("when");
  const [partySize, setPartySize] = useState(4);
  const [date, setDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(PUBLIC_LUNCH_START_TIME);
  const [shifts, setShifts] = useState<AvailabilityShift[]>([]);
  const [shiftId, setShiftId] = useState<string | null>(null);
  const [slotStartsAt, setSlotStartsAt] = useState<string | null>(null);
  const [slotEndsAt, setSlotEndsAt] = useState<string | null>(null);
  const [tables, setTables] = useState<FloorPlanTable[]>([]);
  const [tableId, setTableId] = useState<string | null>(null);
  const [selectedTableTier, setSelectedTableTier] = useState<TableTier | null>(null);
  const [specialRequest, setSpecialRequest] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const restoredDraftRef = useRef(false);

  const minBookingDate = useMemo(() => todayInVenueTimezone(), []);

  const buildDraft = useCallback(
    (draftStep: BookFlowDraft["step"]): BookFlowDraft => ({
      step: draftStep,
      date,
      partySize,
      preferredTime,
      shiftId,
      slotStartsAt,
      slotEndsAt,
      tableId,
      selectedTableTier,
      specialRequest,
      acceptedTerms,
    }),
    [
      date,
      partySize,
      preferredTime,
      shiftId,
      slotStartsAt,
      slotEndsAt,
      tableId,
      selectedTableTier,
      specialRequest,
      acceptedTerms,
    ],
  );

  const redirectToLogin = useCallback(
    (draftStep: BookFlowDraft["step"]) => {
      saveBookFlowDraft(buildDraft(draftStep));
      router.push(`/login?next=${encodeURIComponent("/book")}`);
    },
    [buildDraft, router],
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session?.access_token));
      setAuthReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.access_token));
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !isSignedIn || restoredDraftRef.current) {
      return;
    }
    const draft = loadBookFlowDraft();
    if (!draft) {
      return;
    }
    restoredDraftRef.current = true;
    clearBookFlowDraft();
    setDate(draft.date);
    setPartySize(draft.partySize);
    setPreferredTime(draft.preferredTime);
    setShiftId(draft.shiftId);
    setSlotStartsAt(draft.slotStartsAt);
    setSlotEndsAt(draft.slotEndsAt);
    setTableId(draft.tableId);
    setSelectedTableTier(draft.selectedTableTier);
    setSpecialRequest(draft.specialRequest);
    setAcceptedTerms(draft.acceptedTerms);
    setStep(draft.step);
    if (draft.date && draft.step !== "when") {
      void loadAvailability(draft.date, draft.partySize, draft.preferredTime).then(async (result) => {
        if (result.ok && result.slot) {
          await loadFloorPlan(result.slot);
        }
      });
    }
  }, [authReady, isSignedIn]);

  const selectedShift = useMemo(
    () => shifts.find((shift) => shift.shiftId === shiftId) ?? null,
    [shifts, shiftId],
  );

  const selectedTableLabel = useMemo(
    () => tables.find((table) => table.id === tableId)?.label ?? null,
    [tables, tableId],
  );

  const visualStep: BookingVisualStep =
    step === "done"
      ? "done"
      : step === "pay"
        ? "details"
        : step === "tableType"
          ? "table"
          : step;

  const availableCountByTier = useMemo(() => {
    const counts: Record<TableTier, number> = { STANDARD: 0, PREMIUM: 0, GROUP: 0 };
    for (const table of tables) {
      if (table.availabilityState === "available") {
        counts[effectiveTableTier(table)] += 1;
      }
    }
    return counts;
  }, [tables]);

  const selectedTierLabel = useMemo(() => {
    if (!selectedTableTier) {
      return null;
    }
    if (selectedTableTier === "PREMIUM") {
      return t("floor.tierPremium");
    }
    if (selectedTableTier === "GROUP") {
      return t("floor.tierGroup");
    }
    return t("floor.tierStandard");
  }, [selectedTableTier, t]);

  const stepLabels = useMemo(
    () => ({
      when: t("steps.when"),
      time: t("steps.time"),
      table: t("steps.table"),
      details: t("steps.details"),
    }),
    [t],
  );

  const formatSlotTime = useCallback(
    (iso: string) =>
      new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      ),
    [locale],
  );

  const formatDisplayDate = useCallback(
    (dateStr: string) =>
      new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(new Date(`${dateStr}T12:00:00`)),
    [locale],
  );

  const timeRangeLabel = useMemo(() => {
    if (!slotStartsAt) {
      return null;
    }
    const start = formatSlotTime(slotStartsAt);
    const end = slotEndsAt ? formatSlotTime(slotEndsAt) : "";
    return end ? `${start} – ${end}` : start;
  }, [slotStartsAt, slotEndsAt, formatSlotTime]);

  type ResolvedSlot = {
    shiftId: string;
    slotStartsAt: string;
    slotEndsAt: string;
  };

  const resolveSlotFromPreferredTime = useCallback(
    (nextShifts: AvailabilityShift[], timeValue: string): ResolvedSlot | null => {
      for (const shift of nextShifts) {
        const match = shift.slots.find(
          (slot) => slotStartLocalTime(slot.startsAt) === timeValue,
        );
        if (match) {
          return {
            shiftId: shift.shiftId,
            slotStartsAt: match.startsAt,
            slotEndsAt: match.endsAt,
          };
        }
      }
      const firstShift = nextShifts[0];
      const firstSlot = firstShift?.slots[0];
      if (firstShift && firstSlot) {
        return {
          shiftId: firstShift.shiftId,
          slotStartsAt: firstSlot.startsAt,
          slotEndsAt: firstSlot.endsAt,
        };
      }
      return null;
    },
    [],
  );

  const applySlotFromPreferredTime = useCallback(
    (nextShifts: AvailabilityShift[], timeValue: string): boolean => {
      const resolved = resolveSlotFromPreferredTime(nextShifts, timeValue);
      if (!resolved) {
        return false;
      }
      setShiftId(resolved.shiftId);
      setSlotStartsAt(resolved.slotStartsAt);
      setSlotEndsAt(resolved.slotEndsAt);
      if (
        !nextShifts.some((shift) =>
          shift.slots.some((slot) => slotStartLocalTime(slot.startsAt) === timeValue),
        )
      ) {
        setPreferredTime(slotStartLocalTime(resolved.slotStartsAt));
      }
      return true;
    },
    [resolveSlotFromPreferredTime],
  );

  async function loadAvailability(
    nextDate: string,
    nextParty: number,
    timeValue: string,
  ): Promise<{ ok: boolean; slot?: ResolvedSlot }> {
    setLoading(true);
    setError(null);
    setShiftId(null);
    setSlotStartsAt(null);
    setSlotEndsAt(null);
    try {
      const data = await fetchAvailability(nextDate, nextParty);
      setShifts(data.shifts);
      if (data.shifts.length === 0) {
        setError(t("errors.noAvailability"));
        return { ok: false };
      }
      const resolved = resolveSlotFromPreferredTime(data.shifts, timeValue);
      if (!resolved) {
        setError(t("errors.noAvailability"));
        return { ok: false };
      }
      setShiftId(resolved.shiftId);
      setSlotStartsAt(resolved.slotStartsAt);
      setSlotEndsAt(resolved.slotEndsAt);
      if (
        !data.shifts.some((shift) =>
          shift.slots.some((slot) => slotStartLocalTime(slot.startsAt) === timeValue),
        )
      ) {
        setPreferredTime(slotStartLocalTime(resolved.slotStartsAt));
        setError(t("errors.noSlotAtTime"));
      }
      return { ok: true, slot: resolved };
    } catch (err) {
      if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
        setError(t("errors.apiUnavailable"));
      } else {
        setError(t("errors.generic"));
      }
      return { ok: false };
    } finally {
      setLoading(false);
    }
  }

  async function loadFloorPlan(slotOverride?: ResolvedSlot) {
    const activeShiftId = slotOverride?.shiftId ?? shiftId;
    const activeSlotStartsAt = slotOverride?.slotStartsAt ?? slotStartsAt;
    if (!date || !activeShiftId || !activeSlotStartsAt) {
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFloorPlan({
        date,
        partySize,
        shiftId: activeShiftId,
        slotStartsAt: activeSlotStartsAt,
      });
      setTables(data.tables);
      const available = data.tables.some((table) => table.availabilityState === "available");
      if (!available) {
        setError(t("errors.noTables"));
      }
      return available;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
        setError(t("errors.apiUnavailable"));
      } else {
        setError(t("errors.generic"));
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  function handleWhenSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) {
      return;
    }
    if (isPastVenueDate(date)) {
      setError(t("errors.dateInPast"));
      return;
    }
    if (!isOnlineLunchDay(date)) {
      setError(t("errors.closedWeekday"));
      return;
    }
    void loadAvailability(date, partySize, preferredTime).then(async (result) => {
      if (!result.ok || !result.slot) {
        return;
      }
      setSelectedTableTier(null);
      setTableId(null);
      const hasTables = await loadFloorPlan(result.slot);
      if (hasTables) {
        setStep("tableType");
      }
    });
  }

  function handlePreferredTimeChange(nextTime: string) {
    setPreferredTime(nextTime);
    setError(null);
    if (shifts.length > 0) {
      const matched = applySlotFromPreferredTime(shifts, nextTime);
      if (!matched) {
        setError(t("errors.noSlotAtTime"));
      }
    }
  }

  function handleTimeContinue() {
    if (!shiftId || !slotStartsAt) {
      return;
    }
    setSelectedTableTier(null);
    setTableId(null);
    void loadFloorPlan().then(() => setStep("tableType"));
  }

  async function handleTableTypeContinue() {
    if (!selectedTableTier) {
      return;
    }
    if (availableCountByTier[selectedTableTier] === 0) {
      setError(t("tierCards.noneAvailable"));
      return;
    }
    const firstAvailable = tables.find(
      (table) =>
        effectiveTableTier(table) === selectedTableTier &&
        table.availabilityState === "available",
    );
    if (!firstAvailable) {
      setError(t("tierCards.noneAvailable"));
      return;
    }
    setTableId(firstAvailable.id);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.access_token) {
      saveBookFlowDraft({
        ...buildDraft("details"),
        tableId: firstAvailable.id,
        selectedTableTier,
      });
      router.push(`/login?next=${encodeURIComponent("/book")}`);
      return;
    }

    setStep("details");
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    if (!acceptedTerms || !tableId || !shiftId || !slotStartsAt || !date) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError(t("errors.signInRequired"));
      redirectToLogin("details");
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const reservation = await createReservation(token, {
        date,
        shiftId,
        slotStartsAt,
        tableId,
        partySize,
        specialRequest: specialRequest.trim() || undefined,
        acceptedTerms,
      });

      if (reservation.qrToken) {
        saveBookingQrToken(reservation.id, reservation.qrToken);
      }
      clearBookFlowDraft();
      setConfirmed(reservation);
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t("errors.conflict"));
        setStep("tableType");
        void loadFloorPlan();
      } else if (err instanceof ApiError && err.status === 401) {
        setError(t("errors.signInRequired"));
        redirectToLogin("details");
      } else if (err instanceof ApiError && err.status === 0) {
        setError(t("errors.apiUnavailable"));
      } else if (err instanceof ApiError && err.message && err.status >= 400) {
        setError(err.message);
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  const timeField = (
    <div>
      <label className="block">
        <span className="text-sm font-medium text-forest">{t("fields.arrivalTime")}</span>
        <input
          type="time"
          required
          min={PUBLIC_LUNCH_START_TIME}
          max={PUBLIC_LUNCH_LAST_START_TIME}
          step={900}
          value={preferredTime}
          onChange={(event) => handlePreferredTimeChange(event.target.value)}
          className={fieldClass}
        />
      </label>
      <p className="mt-2 text-xs text-muted">{t("hints.timeWindow")}</p>
    </div>
  );

  if (step === "pay" && confirmed) {
    return (
      <div className="mx-auto max-w-xl">
        <BookPayStep
          reservation={confirmed}
          onPaid={(updated) => {
            setConfirmed(updated);
            setStep("done");
          }}
          onExpired={() => {
            setError(t("pay.errors.expired"));
            setStep("when");
            setConfirmed(null);
          }}
        />
      </div>
    );
  }

  if (step === "done" && confirmed) {
    return (
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-start">
        <BookingImageCarousel step="done" portraitOnLarge />
        <div className="space-y-8 text-center lg:text-left">
          <div
            className="rounded-sm border border-green-200 bg-green-50/80 px-4 py-5 text-center lg:text-left"
            role="status"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("confirmed.eyebrow")}</p>
            <h2 className="mt-2 font-heading text-3xl text-forest sm:text-4xl">
              {confirmed.depositRequired ? t("confirmed.titlePaid") : t("confirmed.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("confirmed.body")}</p>
          </div>
          {confirmed.status === "CONFIRMED" ? (
            <BookingQrPass
              reference={confirmed.reference}
              qrValue={confirmed.qrToken ?? getBookingQrToken(confirmed.id)}
              hint={t("confirmed.qrHint")}
              referenceLabel={t("confirmed.reference")}
            />
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-start">
            <ButtonLink href={`/bookings/${confirmed.id}`} variant="primary">
              {t("confirmed.viewBooking")}
            </ButtonLink>
            <ButtonLink href="/book" variant="secondary">
              {t("confirmed.bookMore")}
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const showSummary = step !== "when" && date;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 lg:space-y-6">
            <BookingImageCarousel step={visualStep} portraitOnLarge />
            {showSummary ? (
              <BookingSummary
                labels={{
                  heading: t("summary.heading"),
                  date: t("summary.date"),
                  party: t("summary.party"),
                  service: t("summary.service"),
                  time: t("summary.time"),
                  table: t("summary.table"),
                }}
                date={formatDisplayDate(date)}
                partySize={partySize}
                serviceName={selectedShift?.name ?? null}
                timeLabel={timeRangeLabel}
                tableLabel={
                  selectedTableLabel
                    ? selectedTierLabel
                      ? `${selectedTierLabel} · ${selectedTableLabel}`
                      : selectedTableLabel
                    : selectedTierLabel
                }
              />
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="border border-line bg-cream-dark/25 px-5 py-8 shadow-[0_1px_0_rgba(30,61,50,0.06)] sm:px-8 sm:py-10">
            {step !== "when" && step !== "done" ? (
              <BookingStepIndicator
                active={step}
                labels={stepLabels}
                progressLabel={t("stepsProgress")}
              />
            ) : step === "when" ? (
              <p className="mb-6 text-sm leading-relaxed text-muted">{t("intro")}</p>
            ) : null}

            {authReady && !isSignedIn && step !== "when" && step !== "done" && step !== "pay" ? (
              <p className="mb-6 rounded-sm border border-forest/25 bg-forest/5 px-3 py-2.5 text-sm text-forest">
                {t("auth.signInToFinish")}{" "}
                <button
                  type="button"
                  className="font-medium underline underline-offset-2"
                  onClick={() => redirectToLogin(step === "details" ? "details" : "tableType")}
                >
                  {t("auth.signInLink")}
                </button>
              </p>
            ) : null}

            {error ? (
              <p
                className="mb-6 rounded-sm border border-red-200/80 bg-red-50/90 px-3 py-2.5 text-sm text-red-950"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {step === "when" ? (
              <form onSubmit={handleWhenSubmit} className="space-y-8">
                <div>
                  <span className="text-sm font-medium text-forest">{t("fields.date")}</span>
                  <input
                    type="date"
                    required
                    min={minBookingDate}
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setError(null);
                    }}
                    className={fieldClass}
                  />
                  <p className="mt-2 text-xs text-muted">{t("hints.season")}</p>
                </div>
                {timeField}
                <fieldset>
                  <legend className="text-sm font-medium text-forest">{t("fields.partySize")}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PARTY_PRESETS.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPartySize(size)}
                        className={`min-w-11 rounded-sm border px-3 py-2 text-sm transition-colors ${
                          partySize === size
                            ? "border-forest bg-forest text-cream"
                            : "border-line bg-cream text-forest hover:border-forest/40"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 block text-xs text-muted">
                    {t("fields.partyCustom")}
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={partySize}
                      onChange={(event) => setPartySize(Number(event.target.value))}
                      className={`${fieldClass} mt-1 max-w-[6rem]`}
                    />
                  </label>
                </fieldset>
                <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
                  {loading ? t("loading") : t("actions.continue")}
                </Button>
              </form>
            ) : null}

            {step === "time" ? (
              <div className="space-y-8">
                <div>
                  <span className="text-sm font-medium text-forest">{t("fields.date")}</span>
                  <p className="mt-2 rounded-sm border border-line bg-cream px-3 py-2.5 text-sm text-forest">
                    {formatDisplayDate(date)}
                  </p>
                </div>
                {timeField}
                {selectedShift ? (
                  <p className="text-sm text-forest">
                    <span className="text-muted">{t("fields.service")}: </span>
                    {selectedShift.name}
                    {timeRangeLabel ? (
                      <span className="text-muted">
                        {" "}
                        · {t("summary.time")} {timeRangeLabel}
                      </span>
                    ) : null}
                  </p>
                ) : null}
                {selectedShift && selectedShift.slots.length > 1 ? (
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-medium text-forest">{t("fields.time")}</legend>
                    {selectedShift.slots.map((slot) => {
                      const selected = slotStartsAt === slot.startsAt;
                      const localStart = slotStartLocalTime(slot.startsAt);
                      return (
                        <label
                          key={slot.startsAt}
                          className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-colors ${
                            selected
                              ? "border-forest bg-forest/5"
                              : "border-line bg-cream hover:border-forest/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="slot"
                            className="accent-forest"
                            checked={selected}
                            onChange={() => {
                              setPreferredTime(localStart);
                              setSlotStartsAt(slot.startsAt);
                              setSlotEndsAt(slot.endsAt);
                            }}
                          />
                          <span className="text-sm text-forest">
                            {formatSlotTime(slot.startsAt)} – {formatSlotTime(slot.endsAt)}
                          </span>
                        </label>
                      );
                    })}
                  </fieldset>
                ) : null}
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={() => setStep("when")}>
                    {t("actions.back")}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!shiftId || !slotStartsAt || loading}
                    onClick={handleTimeContinue}
                    className="sm:flex-1"
                  >
                    {loading ? t("loading") : t("actions.continue")}
                  </Button>
                </div>
              </div>
            ) : null}

            {step === "tableType" ? (
              <div className="space-y-8">
                <p className="text-sm text-muted">
                  {selectedShift?.name}
                  {timeRangeLabel ? ` · ${timeRangeLabel}` : ""}
                </p>
                <TableTierCardPicker
                  selectedTier={selectedTableTier}
                  onSelect={(tier) => {
                    setSelectedTableTier(tier);
                    setError(null);
                  }}
                  availableCountByTier={availableCountByTier}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={() => setStep("time")}>
                    {t("actions.back")}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!selectedTableTier || loading}
                    onClick={handleTableTypeContinue}
                    className="sm:flex-1"
                  >
                    {t("actions.continue")}
                  </Button>
                </div>
              </div>
            ) : null}

            {step === "details" && authReady && !isSignedIn ? (
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-muted">{t("auth.detailsGate")}</p>
                <Button type="button" variant="primary" onClick={() => redirectToLogin("details")}>
                  {t("auth.signInToConfirm")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep("tableType")}>
                  {t("actions.back")}
                </Button>
              </div>
            ) : null}

            {step === "details" && isSignedIn ? (
              <form onSubmit={handleConfirm} className="space-y-8">
                {selectedTierLabel ? (
                  <p className="rounded-sm border border-line bg-cream px-4 py-3 text-sm text-forest">
                    {t("tierCards.assigned", {
                      tier: selectedTierLabel,
                      table: selectedTableLabel ?? "—",
                    })}
                  </p>
                ) : null}
                <label className="block">
                  <span className="text-sm font-medium text-forest">{t("fields.specialRequest")}</span>
                  <textarea
                    value={specialRequest}
                    onChange={(event) => setSpecialRequest(event.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder={t("fields.specialRequestPlaceholder")}
                    className={fieldClass}
                  />
                </label>
                <label className="flex items-start gap-3 rounded-sm border border-line bg-cream px-4 py-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    required
                    className="mt-1 accent-forest"
                  />
                  <span>{t("fields.terms")}</span>
                </label>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={() => setStep("tableType")}>
                    {t("actions.back")}
                  </Button>
                  <Button
                    type="submit"
                    variant="rust"
                    disabled={loading || !acceptedTerms}
                    className="sm:flex-1"
                  >
                    {loading ? t("loading") : t("actions.confirm")}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
