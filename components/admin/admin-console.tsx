"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { MeResponse } from "@/lib/api-client";
import {
  assignStaffRole,
  createAdminException,
  deleteAdminException,
  fetchAdminExceptions,
  downloadAdminReportExcel,
  fetchAdminAnalytics,
  fetchAdminReport,
  fetchAdminStaff,
  fetchAdminVenue,
  patchAdminPolicy,
  patchAdminSeason,
  patchAdminShift,
  type AdminException,
  type AdminSeason,
  type AdminShift,
  type AdminStaffProfile,
  type AdminVenueSnapshot,
} from "@/lib/admin-api";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { todayInVenueTimezone } from "@/lib/venue-date";
import { AdminAnalyticsPanel } from "@/components/admin/admin-analytics-panel";
import { AdminBlogPanel } from "@/components/admin/admin-blog-panel";
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";
import { AdminSidebar, type AdminSectionId } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";

type AdminConsoleProps = {
  me: MeResponse;
  onSignOut: () => void;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function AdminConsole({ me, onSignOut }: AdminConsoleProps) {
  const t = useTranslations("adminConsole");
  const [token, setToken] = useState<string | null>(null);
  const [section, setSection] = useState<AdminSectionId>("overview");
  const [venue, setVenue] = useState<AdminVenueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [reportFrom, setReportFrom] = useState(() => addDays(todayInVenueTimezone(), -7));
  const [reportTo, setReportTo] = useState(() => todayInVenueTimezone());
  const [report, setReport] = useState<Awaited<ReturnType<typeof fetchAdminReport>> | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof fetchAdminAnalytics>> | null>(
    null,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  const [exceptions, setExceptions] = useState<AdminException[]>([]);
  const [closureDate, setClosureDate] = useState("");
  const [closureReason, setClosureReason] = useState("");

  const [staff, setStaff] = useState<AdminStaffProfile[]>([]);
  const [staffUserId, setStaffUserId] = useState("");

  useEffect(() => {
    void createSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const reloadVenue = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminVenue(token);
      setVenue(data);
    } catch {
      setError(t("errors.load"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    void reloadVenue();
  }, [reloadVenue]);

  const loadReport = useCallback(async () => {
    if (!token) {
      return;
    }
    if (reportFrom > reportTo) {
      setError(t("errors.reportRange"));
      return;
    }
    setReportLoading(true);
    setError(null);
    try {
      setReport(await fetchAdminReport(token, reportFrom, reportTo));
    } catch {
      setError(t("errors.report"));
    } finally {
      setReportLoading(false);
    }
  }, [token, reportFrom, reportTo, t]);

  const loadAnalytics = useCallback(async () => {
    if (!token) {
      return;
    }
    if (reportFrom > reportTo) {
      setError(t("errors.reportRange"));
      return;
    }
    setAnalyticsLoading(true);
    setError(null);
    try {
      setAnalytics(await fetchAdminAnalytics(token, reportFrom, reportTo));
    } catch {
      setError(t("errors.analytics"));
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token, reportFrom, reportTo, t]);

  const downloadExcel = useCallback(async () => {
    if (!token) {
      return;
    }
    if (reportFrom > reportTo) {
      setError(t("errors.reportRange"));
      return;
    }
    setExportBusy(true);
    setError(null);
    try {
      await downloadAdminReportExcel(token, reportFrom, reportTo);
    } catch {
      setError(t("errors.export"));
    } finally {
      setExportBusy(false);
    }
  }, [token, reportFrom, reportTo, t]);

  useEffect(() => {
    if (token && section === "overview") {
      void loadReport();
    }
  }, [token, section, loadReport]);

  useEffect(() => {
    if (token && section === "analytics") {
      void loadAnalytics();
    }
  }, [token, section, loadAnalytics]);

  const loadSeasonExtras = useCallback(async () => {
    if (!token) {
      return;
    }
    const from = todayInVenueTimezone();
    const to = addDays(from, 90);
    try {
      setExceptions(await fetchAdminExceptions(token, from, to));
    } catch {
      setError(t("errors.exceptions"));
    }
  }, [token, t]);

  const loadStaff = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setStaff(await fetchAdminStaff(token));
    } catch {
      setError(t("errors.staff"));
    }
  }, [token, t]);

  useEffect(() => {
    if (section === "seasons") {
      void loadSeasonExtras();
    }
    if (section === "staff") {
      void loadStaff();
    }
  }, [section, loadSeasonExtras, loadStaff]);

  async function savePolicyField(
    patch: Parameters<typeof patchAdminPolicy>[1],
  ) {
    if (!token || !venue?.bookingPolicy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await patchAdminPolicy(token, patch);
      setVenue((prev) => (prev ? { ...prev, bookingPolicy: updated } : prev));
    } catch {
      setError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleShift(shift: AdminShift) {
    if (!token) {
      return;
    }
    setBusy(true);
    try {
      const updated = await patchAdminShift(token, shift.id, { active: !shift.active });
      setVenue((prev) =>
        prev
          ? {
              ...prev,
              shifts: prev.shifts.map((row) => (row.id === shift.id ? updated : row)),
            }
          : prev,
      );
    } catch {
      setError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleSeason(season: AdminSeason) {
    if (!token) {
      return;
    }
    setBusy(true);
    try {
      const updated = await patchAdminSeason(token, season.id, { enabled: !season.enabled });
      setVenue((prev) =>
        prev
          ? {
              ...prev,
              seasons: prev.seasons.map((row) => (row.id === season.id ? updated : row)),
            }
          : prev,
      );
    } catch {
      setError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function addClosure() {
    if (!token || !closureDate) {
      return;
    }
    setBusy(true);
    try {
      await createAdminException(token, {
        exceptionDate: closureDate,
        isClosed: true,
        reason: closureReason || undefined,
      });
      setClosureDate("");
      setClosureReason("");
      await loadSeasonExtras();
    } catch {
      setError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function removeException(row: AdminException) {
    if (!token) {
      return;
    }
    setBusy(true);
    try {
      await deleteAdminException(token, row.id);
      setExceptions((prev) => prev.filter((item) => item.id !== row.id));
    } catch {
      setError(t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function grantStaff() {
    if (!token || !staffUserId.trim()) {
      return;
    }
    setBusy(true);
    try {
      await assignStaffRole(token, { userId: staffUserId.trim(), role: "STAFF" });
      setStaffUserId("");
      await loadStaff();
    } catch {
      setError(t("errors.staffAssign"));
    } finally {
      setBusy(false);
    }
  }

  const sidebarLabels = useMemo(
    (): Record<AdminSectionId, string> => ({
      overview: t("tabs.overview"),
      analytics: t("tabs.analytics"),
      blog: t("tabs.blog"),
      policy: t("tabs.policy"),
      shifts: t("tabs.shifts"),
      seasons: t("tabs.seasons"),
      staff: t("tabs.staff"),
    }),
    [t],
  );

  const sectionTitle = sidebarLabels[section];

  return (
    <div className="flex min-h-dvh w-full flex-col bg-cream-dark/20 lg:flex-row">
      <AdminSidebar
        active={section}
        onSelect={setSection}
        onSignOut={onSignOut}
        me={me}
        labels={sidebarLabels}
        eyebrow={t("eyebrow")}
        title={t("title")}
        navLabel={t("navLabel")}
        signOutLabel={t("signOut")}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line/80 bg-cream/95 px-5 py-5 shadow-sm sm:px-8">
          <h2 className="font-heading text-2xl text-forest sm:text-3xl">{sectionTitle}</h2>
          <p className="mt-1 text-sm text-muted">{t(`sections.${section}`)}</p>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          {error ? (
            <p
              className="rounded-lg border border-rust/40 bg-rust/5 px-4 py-3 text-sm text-rust shadow-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {loading && !venue ? (
            <p className="text-sm text-muted">{t("loading")}</p>
          ) : null}

          {section === "blog" ? (
            <AdminBlogPanel token={token} onError={(message) => setError(message)} />
          ) : null}

          {section === "analytics" ? (
            <AdminAnalyticsPanel
              analytics={analytics}
              loading={analyticsLoading}
              from={reportFrom}
              to={reportTo}
              onFromChange={setReportFrom}
              onToChange={setReportTo}
              onRefresh={() => void loadAnalytics()}
              refreshBusy={analyticsLoading}
            />
          ) : null}

          {venue && section === "overview" ? (
            <AdminDashboardOverview
              venue={venue}
              report={report}
              reportLoading={reportLoading}
              reportFrom={reportFrom}
              reportTo={reportTo}
              onReportFromChange={setReportFrom}
              onReportToChange={setReportTo}
              onRefreshReport={() => void loadReport()}
              onDownloadExcel={() => void downloadExcel()}
              refreshBusy={reportLoading}
              exportBusy={exportBusy}
            />
          ) : null}

          {venue?.bookingPolicy && section === "policy" ? (
            <section className="space-y-4 rounded-xl border border-line bg-cream p-6 shadow-sm">
              <p className="text-sm text-muted">{t("policy.hint")}</p>
          <PolicyField
            label={t("policy.minNotice")}
            value={venue.bookingPolicy.minNoticeMinutes}
            onSave={(value) => void savePolicyField({ minNoticeMinutes: value })}
            busy={busy}
          />
          <PolicyField
            label={t("policy.maxAdvance")}
            value={venue.bookingPolicy.maxAdvanceDays}
            onSave={(value) => void savePolicyField({ maxAdvanceDays: value })}
            busy={busy}
          />
          <PolicyField
            label={t("policy.maxParty")}
            value={venue.bookingPolicy.maxPartySize}
            onSave={(value) => void savePolicyField({ maxPartySize: value })}
            busy={busy}
          />
          <PolicyField
            label={t("policy.buffer")}
            value={venue.bookingPolicy.turnoverBufferMinutes}
            onSave={(value) => void savePolicyField({ turnoverBufferMinutes: value })}
            busy={busy}
          />
              <p className="text-sm text-muted">{t("policy.paymentsDisabled")}</p>
            </section>
          ) : null}

          {venue && section === "shifts" ? (
            <section className="space-y-3 rounded-xl border border-line bg-cream p-6 shadow-sm">
              <p className="text-sm text-muted">{t("shifts.hint")}</p>
          <ul className="divide-y divide-line rounded-sm border border-line bg-cream">
            {venue.shifts.map((shift) => (
              <li key={shift.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-forest">{shift.name}</p>
                  <p className="text-muted">
                    {shift.weekday !== null ? WEEKDAY_LABELS[shift.weekday] : shift.serviceDate} ·{" "}
                    {shift.startsAt.slice(0, 5)}–{shift.endsAt.slice(0, 5)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={shift.active ? "secondary" : "primary"}
                  disabled={busy}
                  onClick={() => void toggleShift(shift)}
                >
                  {shift.active ? t("shifts.deactivate") : t("shifts.activate")}
                </Button>
              </li>
            ))}
              </ul>
            </section>
          ) : null}

          {venue && section === "seasons" ? (
            <section className="space-y-6 rounded-xl border border-line bg-cream p-6 shadow-sm">
              <div>
                <ul className="divide-y divide-line rounded-sm border border-line bg-cream">
              {venue.seasons.map((season) => (
                <li key={season.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-forest">{season.name}</p>
                    <p className="text-muted">
                      {season.startsOn} → {season.endsOn}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={season.enabled ? "secondary" : "primary"}
                    disabled={busy}
                    onClick={() => void toggleSeason(season)}
                  >
                    {season.enabled ? t("seasons.disable") : t("seasons.enable")}
                  </Button>
                </li>
              ))}
                </ul>
              </div>
              <div className="rounded-sm border border-line bg-cream-dark/20 p-4 space-y-3">
                <h3 className="font-heading text-lg text-forest">{t("seasons.closuresTitle")}</h3>
            <div className="flex flex-wrap gap-3">
              <label className="text-sm">
                {t("seasons.date")}
                <input
                  type="date"
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="mt-1 block rounded-sm border border-line px-2 py-1"
                />
              </label>
              <label className="text-sm flex-1 min-w-[12rem]">
                {t("seasons.reason")}
                <input
                  type="text"
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  className="mt-1 block w-full rounded-sm border border-line px-2 py-1"
                />
              </label>
              <Button type="button" className="self-end" disabled={busy} onClick={() => void addClosure()}>
                {t("seasons.addClosure")}
              </Button>
            </div>
            <ul className="text-sm text-muted space-y-2">
              {exceptions.map((row) => (
                <li key={row.id} className="flex justify-between gap-2">
                  <span>
                    {row.exceptionDate}
                    {row.reason ? ` — ${row.reason}` : ""}
                    {row.isClosed ? ` (${t("seasons.closed")})` : ""}
                  </span>
                  <button
                    type="button"
                    className="text-rust underline-offset-2 hover:underline"
                    onClick={() => void removeException(row)}
                  >
                    {t("seasons.remove")}
                  </button>
                </li>
              ))}
                </ul>
              </div>
            </section>
          ) : null}

          {section === "staff" ? (
            <section className="space-y-4 rounded-xl border border-line bg-cream p-6 shadow-sm">
              <p className="text-sm text-muted">{t("staff.hint")}</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder={t("staff.userIdPlaceholder")}
                  value={staffUserId}
                  onChange={(e) => setStaffUserId(e.target.value)}
                  className="min-w-[16rem] flex-1 rounded-sm border border-line px-3 py-2 text-sm"
                />
                <Button type="button" disabled={busy} onClick={() => void grantStaff()}>
                  {t("staff.grant")}
                </Button>
              </div>
              <ul className="divide-y divide-line rounded-sm border border-line bg-cream text-sm">
                {staff.map((row) => (
                  <li key={row.id} className="px-4 py-3">
                    <span className="font-medium text-forest">{row.role}</span> · {row.displayName ?? row.id}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PolicyField({
  label,
  value,
  onSave,
  busy,
}: {
  label: string;
  value: number;
  onSave: (value: number) => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm flex-1 min-w-[10rem]">
        {label}
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-1 block w-full rounded-sm border border-line px-2 py-1"
        />
      </label>
      <Button
        type="button"
        variant="secondary"
        disabled={busy || Number(draft) === value}
        onClick={() => onSave(Number(draft))}
      >
        Save
      </Button>
    </div>
  );
}
