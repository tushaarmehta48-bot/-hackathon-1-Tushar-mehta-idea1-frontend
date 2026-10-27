"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  faBan,
  faCalendarCheck,
  faChair,
  faGlobe,
  faFileExcel,
  faPersonWalking,
  faUserCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ADMIN_DASHBOARD_ACCENT,
  ADMIN_DASHBOARD_HERO,
} from "@/content/admin-dashboard-images";
import type { AdminReportSummary, AdminVenueSnapshot } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";

type AdminDashboardOverviewProps = {
  venue: AdminVenueSnapshot;
  report: AdminReportSummary | null;
  reportLoading: boolean;
  reportFrom: string;
  reportTo: string;
  onReportFromChange: (value: string) => void;
  onReportToChange: (value: string) => void;
  onRefreshReport: () => void;
  onDownloadExcel: () => void;
  refreshBusy: boolean;
  exportBusy: boolean;
};

export function AdminDashboardOverview({
  venue,
  report,
  reportLoading,
  reportFrom,
  reportTo,
  onReportFromChange,
  onReportToChange,
  onRefreshReport,
  onDownloadExcel,
  refreshBusy,
  exportBusy,
}: AdminDashboardOverviewProps) {
  const t = useTranslations("adminConsole.overview");

  const activeShifts = venue.shifts.filter((s) => s.active).length;
  const checkInPercent = report?.checkInRatePercent ?? 0;

  return (
    <div className="space-y-8">
      <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-line shadow-md sm:min-h-[260px]">
        <Image
          src={ADMIN_DASHBOARD_HERO.src}
          alt={ADMIN_DASHBOARD_HERO.alt}
          fill
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1152px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest/92 via-forest/75 to-forest/40" />
        <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/90">{t("heroEyebrow")}</p>
          <h2 className="mt-2 max-w-xl font-heading text-3xl text-cream sm:text-4xl">{t("heroTitle")}</h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/85">{t("heroLead")}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-heading text-xl text-forest">{t("todayTitle")}</h3>
            {report ? (
              <p className="text-xs text-muted">
                {t("todayDate", { date: report.today.date, tz: report.timezone })}
              </p>
            ) : null}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={faCalendarCheck}
              label={t("todayBookings")}
              value={report ? String(report.today.reservationCount) : "—"}
              loading={reportLoading}
              accent="gold"
            />
            <MetricCard
              icon={faUsers}
              label={t("todayGuests")}
              value={report ? String(report.today.guestSeats) : "—"}
              loading={reportLoading}
              accent="olive"
            />
            <MetricCard
              icon={faUserCheck}
              label={t("todayCheckedIn")}
              value={report ? String(report.today.checkedInCount) : "—"}
              loading={reportLoading}
              accent="forest"
            />
            <MetricCard
              icon={faUsers}
              label={t("todayAttendance")}
              value={report ? String(report.today.attendanceGuests) : "—"}
              loading={reportLoading}
              accent="rust"
            />
          </dl>

          <div className="rounded-lg border border-line bg-cream p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-heading text-lg text-forest">{t("checkInTitle")}</h3>
              {report && report.checkInRatePercent != null ? (
                <span className="text-sm font-medium text-forest">{report.checkInRatePercent}%</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">{t("checkInHint")}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-cream-dark/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-olive to-forest transition-all duration-500"
                style={{ width: `${Math.min(100, checkInPercent)}%` }}
              />
            </div>
            {report ? (
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <MiniStat label={t("checkedIn")} value={String(report.checkedInCount)} />
                <MiniStat label={t("pendingCheckIn")} value={String(report.pendingCheckInCount)} />
                <MiniStat label={t("attendanceGuests")} value={String(report.attendanceGuests)} />
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted">{reportLoading ? t("loadingMetrics") : t("noReportYet")}</p>
            )}
          </div>
        </section>

        <aside className="space-y-4 lg:col-span-4">
          <div className="relative h-40 overflow-hidden rounded-lg border border-line">
            <Image
              src={ADMIN_DASHBOARD_ACCENT.src}
              alt={ADMIN_DASHBOARD_ACCENT.alt}
              fill
              className="object-cover"
              sizes="400px"
            />
            <div className="absolute inset-0 bg-forest/30" />
          </div>
          <div className="rounded-lg border border-line bg-cream-dark/25 p-5">
            <h3 className="font-heading text-lg text-forest">{t("venueSnapshot")}</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <VenueRow label={t("areas")} value={String(venue.diningAreas.length)} />
              <VenueRow label={t("tables")} value={String(venue.tables.length)} />
              <VenueRow label={t("shifts")} value={String(activeShifts)} />
              <VenueRow
                label={t("seasons")}
                value={String(venue.seasons.filter((s) => s.enabled).length)}
              />
            </dl>
          </div>
        </aside>
      </div>

      <section className="rounded-xl border border-line/90 bg-gradient-to-br from-cream via-cream to-cream-dark/30 p-6 shadow-md space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl text-forest">{t("reportTitle")}</h3>
            <p className="mt-1 text-sm text-muted">{t("reportLead")}</p>
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line/80 bg-cream/90 p-3 shadow-inner">
            <label className="text-xs font-medium uppercase tracking-wide text-olive">
              {t("from")}
              <input
                type="date"
                value={reportFrom}
                onChange={(e) => onReportFromChange(e.target.value)}
                className="mt-1 block rounded-md border border-line bg-cream px-3 py-2 text-sm text-forest shadow-sm"
              />
            </label>
            <label className="text-xs font-medium uppercase tracking-wide text-olive">
              {t("to")}
              <input
                type="date"
                value={reportTo}
                onChange={(e) => onReportToChange(e.target.value)}
                className="mt-1 block rounded-md border border-line bg-cream px-3 py-2 text-sm text-forest shadow-sm"
              />
            </label>
            <Button type="button" disabled={refreshBusy || exportBusy} onClick={onRefreshReport}>
              {refreshBusy ? t("refreshing") : t("runReport")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={refreshBusy || exportBusy}
              onClick={onDownloadExcel}
            >
              <FontAwesomeIcon icon={faFileExcel} className="h-4 w-4" aria-hidden />
              {exportBusy ? t("exporting") : t("downloadExcel")}
            </Button>
          </div>
        </div>

        {report ? (
          <>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={faCalendarCheck}
                label={t("bookings")}
                value={String(report.reservationCount)}
                accent="forest"
              />
              <MetricCard
                icon={faChair}
                label={t("active")}
                value={String(report.activeCount)}
                accent="olive"
              />
              <MetricCard
                icon={faBan}
                label={t("cancelled")}
                value={String(report.cancellationCount)}
                accent="rust"
              />
              <MetricCard
                icon={faUsers}
                label={t("guests")}
                value={String(report.guestSeats)}
                accent="gold"
              />
            </dl>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={faGlobe}
                label={t("webBookings")}
                value={String(report.webBookings)}
                accent="forest"
              />
              <MetricCard
                icon={faPersonWalking}
                label={t("walkInBookings")}
                value={String(report.walkInBookings)}
                accent="olive"
              />
              <MetricCard
                icon={faUserCheck}
                label={t("checkedIn")}
                value={String(report.checkedInCount)}
                accent="gold"
              />
              <MiniStat label={t("noShows")} value={String(report.noShowCount)} className="sm:col-span-1" />
            </dl>
          </>
        ) : (
          <p className="text-sm text-muted">{reportLoading ? t("loadingMetrics") : t("noReportYet")}</p>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: typeof faCalendarCheck;
  label: string;
  value: string;
  loading?: boolean;
  accent: "forest" | "olive" | "gold" | "rust";
}) {
  const accentClass = {
    forest: "text-forest bg-forest/10",
    olive: "text-olive bg-olive/15",
    gold: "text-gold bg-gold/15",
    rust: "text-rust bg-rust/10",
  }[accent];

  return (
    <div className="rounded-lg border border-line bg-cream px-4 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${accentClass}`}>
          <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
      <dd className="mt-2 font-heading text-3xl text-forest">
        {loading ? <span className="inline-block h-8 w-16 animate-pulse rounded bg-cream-dark/60" /> : value}
      </dd>
    </div>
  );
}

function MiniStat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-sm border border-line/80 bg-cream-dark/20 px-3 py-2 ${className}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-heading text-xl text-forest">{value}</dd>
    </div>
  );
}

function VenueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line/60 pb-2 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-forest">{value}</dd>
    </div>
  );
}
