"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { faCalendarDay, faClock, faChartSimple } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { AdminBookingAnalytics } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";

const FOREST = "#1e3d32";
const OLIVE = "#5c6b4a";
const GOLD = "#c4a35a";

type AdminAnalyticsPanelProps = {
  analytics: AdminBookingAnalytics | null;
  loading: boolean;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onRefresh: () => void;
  refreshBusy: boolean;
};

function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${month}/${day}`;
}

type TooltipRow = { bookings?: number; guests?: number; date?: string };

type ChartTooltipProps = {
  active?: boolean;
  label?: string;
  bookings: number;
  guests?: number;
  bookingsLabel: string;
  guestsLabel?: string;
};

function ChartTooltip({
  active,
  label,
  bookings,
  guests,
  bookingsLabel,
  guestsLabel,
}: ChartTooltipProps) {
  if (!active) {
    return null;
  }
  return (
    <div className="rounded-md border border-line bg-cream px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-forest">{label}</p>
      <p className="text-muted">
        {bookingsLabel}: <span className="font-semibold text-forest">{bookings}</span>
      </p>
      {guestsLabel && guests !== undefined ? (
        <p className="text-muted">
          {guestsLabel}: <span className="font-semibold text-forest">{guests}</span>
        </p>
      ) : null}
    </div>
  );
}

function tooltipBookings(payload: unknown): number {
  const entries = payload as ReadonlyArray<{ value?: unknown; payload?: TooltipRow }> | undefined;
  const row = entries?.[0]?.payload;
  const raw = entries?.[0]?.value ?? row?.bookings ?? 0;
  const scalar = Array.isArray(raw) ? raw[0] : raw;
  const n = typeof scalar === "number" ? scalar : Number(scalar);
  return Number.isFinite(n) ? n : 0;
}

export function AdminAnalyticsPanel({
  analytics,
  loading,
  from,
  to,
  onFromChange,
  onToChange,
  onRefresh,
  refreshBusy,
}: AdminAnalyticsPanelProps) {
  const t = useTranslations("adminConsole.analytics");

  const dateChartData = useMemo(() => {
    if (!analytics) {
      return [];
    }
    return analytics.byDate.map((row) => ({
      ...row,
      label: shortDate(row.date),
    }));
  }, [analytics]);

  const hourChartData = useMemo(() => analytics?.byHour ?? [], [analytics]);
  const weekdayChartData = useMemo(() => analytics?.byWeekday ?? [], [analytics]);

  const showDenseDateLabels = dateChartData.length > 14;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-cream p-5 shadow-sm">
        <div className="min-w-[8rem] flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">{t("from")}</label>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[8rem] flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted">{t("to")}</label>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 text-sm"
          />
        </div>
        <Button type="button" disabled={refreshBusy} onClick={onRefresh}>
          {refreshBusy ? t("loading") : t("refresh")}
        </Button>
      </div>

      {loading && !analytics ? (
        <p className="text-sm text-muted">{t("loading")}</p>
      ) : null}

      {analytics ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <HighlightCard
              icon={faChartSimple}
              label={t("totalBookings")}
              value={String(analytics.totalBookings)}
              hint={t("totalHint", { tz: analytics.timezone })}
            />
            <HighlightCard
              icon={faCalendarDay}
              label={t("peakDate")}
              value={
                analytics.peakDate
                  ? t("peakDateValue", {
                      date: analytics.peakDate.date,
                      count: analytics.peakDate.bookings,
                    })
                  : t("noData")
              }
              hint={t("peakDateHint")}
            />
            <HighlightCard
              icon={faClock}
              label={t("peakTime")}
              value={
                analytics.peakHour
                  ? t("peakTimeValue", {
                      time: analytics.peakHour.label,
                      count: analytics.peakHour.bookings,
                    })
                  : t("noData")
              }
              hint={t("peakTimeHint", { tz: analytics.timezone })}
            />
          </div>

          <ChartCard title={t("chartByDate")} lead={t("chartByDateLead")}>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dateChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: OLIVE }}
                    interval={showDenseDateLabels ? Math.floor(dateChartData.length / 8) : 0}
                    angle={showDenseDateLabels ? -35 : 0}
                    textAnchor={showDenseDateLabels ? "end" : "middle"}
                    height={showDenseDateLabels ? 52 : 28}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: OLIVE }} width={32} />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        label={payload?.[0]?.payload?.date ?? String(label ?? "")}
                        bookings={tooltipBookings(payload)}
                        guests={payload?.[0]?.payload?.guests}
                        bookingsLabel={t("bookings")}
                        guestsLabel={t("guests")}
                      />
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke={FOREST}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: GOLD, stroke: FOREST, strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: FOREST }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title={t("chartByHour")} lead={t("chartByHourLead")}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: OLIVE }} interval={1} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: OLIVE }} width={32} />
                    <Tooltip
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          label={String(label ?? "")}
                          bookings={tooltipBookings(payload)}
                          bookingsLabel={t("bookings")}
                        />
                      )}
                    />
                    <Bar dataKey="bookings" fill={FOREST} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title={t("chartByWeekday")} lead={t("chartByWeekdayLead")}>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: OLIVE }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: OLIVE }} width={32} />
                    <Tooltip
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          label={String(label ?? "")}
                          bookings={tooltipBookings(payload)}
                          bookingsLabel={t("bookings")}
                        />
                      )}
                    />
                    <Bar dataKey="bookings" fill={OLIVE} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </>
      ) : null}
    </div>
  );
}

function HighlightCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: typeof faChartSimple;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-gradient-to-br from-cream to-cream-dark/30 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
          <FontAwesomeIcon icon={icon} className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1 font-heading text-lg leading-snug text-forest">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-cream p-5 shadow-sm sm:p-6">
      <h3 className="font-heading text-xl text-forest">{title}</h3>
      <p className="mt-1 text-sm text-muted">{lead}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}
