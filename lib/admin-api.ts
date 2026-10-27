import { apiDelete, apiDownload, apiGet, apiPatch, apiPost } from "@/lib/api-client";

export type AdminBookingPolicy = {
  id: string;
  timezone: string;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  cancellationDeadlineMinutes: number;
  minPartySize: number;
  maxPartySize: number;
  defaultDurationMinutes: number;
  turnoverBufferMinutes: number;
  depositRequired: boolean;
  depositAmountCents: number | null;
  depositCurrency: string;
  depositHoldMinutes: number;
  active: boolean;
};

export type AdminDiningArea = {
  id: string;
  name: string;
  description: string | null;
  areaType: string;
  sortOrder: number;
  active: boolean;
};

export type AdminTable = {
  id: string;
  areaId: string;
  label: string;
  minCapacity: number;
  maxCapacity: number;
  tableTier: "STANDARD" | "PREMIUM" | "GROUP";
  svg: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotationDeg: number;
  };
  active: boolean;
  bookable: boolean;
};

export type AdminShift = {
  id: string;
  name: string;
  weekday: number | null;
  serviceDate: string | null;
  startsAt: string;
  endsAt: string;
  defaultDurationMinutes: number;
  active: boolean;
};

export type AdminSeason = {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  config: Record<string, unknown>;
  enabled: boolean;
};

export type AdminException = {
  id: string;
  exceptionDate: string;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
  reason: string | null;
};

export type AdminStaffProfile = {
  id: string;
  displayName: string | null;
  role: "STAFF" | "ADMIN";
  active: boolean;
};

export type AdminVenueSnapshot = {
  diningAreas: AdminDiningArea[];
  tables: AdminTable[];
  shifts: AdminShift[];
  seasons: AdminSeason[];
  bookingPolicy: AdminBookingPolicy | null;
};

export type AdminBookingAnalytics = {
  from: string;
  to: string;
  timezone: string;
  totalBookings: number;
  peakDate: { date: string; bookings: number } | null;
  peakHour: { hour: number; label: string; bookings: number } | null;
  byDate: Array<{ date: string; bookings: number; guests: number }>;
  byHour: Array<{ hour: number; label: string; bookings: number }>;
  byWeekday: Array<{ weekday: number; label: string; bookings: number }>;
};

export type AdminReportSummary = {
  from: string;
  to: string;
  timezone: string;
  reservationCount: number;
  activeCount: number;
  cancellationCount: number;
  guestSeats: number;
  checkedInCount: number;
  attendanceGuests: number;
  pendingCheckInCount: number;
  noShowCount: number;
  webBookings: number;
  walkInBookings: number;
  checkInRatePercent: number | null;
  today: {
    date: string;
    reservationCount: number;
    guestSeats: number;
    checkedInCount: number;
    attendanceGuests: number;
    pendingCheckInCount: number;
  };
};

export async function fetchAdminVenue(token: string): Promise<AdminVenueSnapshot> {
  return apiGet<AdminVenueSnapshot>("/admin/venue", { accessToken: token });
}

export async function patchAdminPolicy(
  token: string,
  body: Partial<
    Pick<
      AdminBookingPolicy,
      | "minNoticeMinutes"
      | "maxAdvanceDays"
      | "minPartySize"
      | "maxPartySize"
      | "turnoverBufferMinutes"
      | "depositRequired"
      | "depositAmountCents"
      | "depositHoldMinutes"
    >
  >,
): Promise<AdminBookingPolicy> {
  return apiPatch<AdminBookingPolicy>("/admin/booking-policy", body, token);
}

export async function patchAdminTable(
  token: string,
  id: string,
  body: Partial<{
    svgX: number;
    svgY: number;
    svgWidth: number;
    svgHeight: number;
    tableTier: "STANDARD" | "PREMIUM" | "GROUP";
    active: boolean;
    bookable: boolean;
  }>,
): Promise<AdminTable> {
  return apiPatch<AdminTable>(`/admin/tables/${id}`, body, token);
}

export async function patchAdminShift(
  token: string,
  id: string,
  body: Partial<{ active: boolean; startsAt: string; endsAt: string }>,
): Promise<AdminShift> {
  return apiPatch<AdminShift>(`/admin/shifts/${id}`, body, token);
}

export async function patchAdminSeason(
  token: string,
  id: string,
  body: Partial<{ enabled: boolean; name: string }>,
): Promise<AdminSeason> {
  return apiPatch<AdminSeason>(`/admin/seasons/${id}`, body, token);
}

export async function createAdminException(
  token: string,
  body: { exceptionDate: string; isClosed: boolean; reason?: string },
): Promise<AdminException> {
  return apiPost<AdminException>("/admin/exceptions", body, token);
}

export async function fetchAdminExceptions(
  token: string,
  from: string,
  to: string,
): Promise<AdminException[]> {
  const params = new URLSearchParams({ from, to });
  return apiGet<AdminException[]>(`/admin/exceptions?${params.toString()}`, { accessToken: token });
}

export async function deleteAdminException(token: string, id: string): Promise<{ ok: boolean }> {
  return apiDelete<{ ok: boolean }>(`/admin/exceptions/${id}`, token);
}

export async function fetchAdminStaff(token: string): Promise<AdminStaffProfile[]> {
  return apiGet<AdminStaffProfile[]>("/admin/staff-profiles", { accessToken: token });
}

export async function assignStaffRole(
  token: string,
  body: { userId: string; role: "STAFF" | "CUSTOMER" },
): Promise<AdminStaffProfile> {
  return apiPost<AdminStaffProfile>("/admin/staff-profiles/assign-role", body, token);
}

export async function fetchAdminReport(
  token: string,
  from: string,
  to: string,
): Promise<AdminReportSummary> {
  const params = new URLSearchParams({ from, to });
  return apiGet<AdminReportSummary>(`/admin/reports/summary?${params.toString()}`, {
    accessToken: token,
  });
}

export async function fetchAdminAnalytics(
  token: string,
  from: string,
  to: string,
): Promise<AdminBookingAnalytics> {
  const params = new URLSearchParams({ from, to });
  return apiGet<AdminBookingAnalytics>(`/admin/reports/analytics?${params.toString()}`, {
    accessToken: token,
  });
}

export async function downloadAdminReportExcel(
  token: string,
  from: string,
  to: string,
): Promise<void> {
  const params = new URLSearchParams({ from, to });
  return apiDownload(
    `/admin/reports/export?${params.toString()}`,
    token,
    `iturrieta-report-${from}-${to}.xlsx`,
  );
}
