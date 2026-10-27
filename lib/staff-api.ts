import { apiGet, apiPost } from "@/lib/api-client";
import type { Reservation } from "@/lib/booking-api";

export type CheckInScanResult = {
  reservationId: string;
  reference: string;
  partySize: number;
  guestsCheckedIn: number;
  guestsRemaining: number;
  tableLabel: string | null;
  status: string;
  startsAt: string;
  canCheckIn: boolean;
  message: string;
};

export async function fetchStaffDay(
  accessToken: string,
  date: string,
  q?: string,
): Promise<Reservation[]> {
  const params = new URLSearchParams({ date });
  if (q?.trim()) {
    params.set("q", q.trim());
  }
  return apiGet<Reservation[]>(`/staff/reservations?${params.toString()}`, { accessToken });
}

export async function staffCreateReservation(
  accessToken: string,
  body: {
    date: string;
    shiftId: string;
    slotStartsAt: string;
    tableId: string;
    partySize: number;
    source: "PHONE" | "WALK_IN";
    specialRequest?: string;
  },
): Promise<Reservation> {
  return apiPost<Reservation>("/staff/reservations", body, accessToken);
}

export async function checkInScan(
  accessToken: string,
  body: { token?: string; reference?: string },
): Promise<CheckInScanResult> {
  return apiPost<CheckInScanResult>("/check-in/scan", body, accessToken);
}

export async function checkInConfirm(accessToken: string, reservationId: string): Promise<Reservation> {
  return apiPost<Reservation>(`/check-in/${reservationId}/confirm`, {}, accessToken);
}

export type StaffCheckInHistoryItem = {
  id: string;
  reference: string;
  partySize: number;
  tableLabel: string | null;
  reservationStartsAt: string;
  method: string;
  checkedInAt: string;
};

export async function fetchMyCheckInHistory(
  accessToken: string,
  limit = 50,
): Promise<StaffCheckInHistoryItem[]> {
  return apiGet<StaffCheckInHistoryItem[]>(`/check-in/history/mine?limit=${limit}`, {
    accessToken,
  });
}
