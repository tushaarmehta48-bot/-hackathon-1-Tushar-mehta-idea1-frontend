import { apiGet, apiPost, type MeResponse } from "@/lib/api-client";

export type AvailabilityShift = {
  shiftId: string;
  name: string;
  slots: { startsAt: string; endsAt: string; availableTableCount: number }[];
};

export type AvailabilityResponse = {
  date: string;
  timezone: string;
  partySize: number;
  shifts: AvailabilityShift[];
};

export type FloorPlanTable = {
  id: string;
  areaId: string;
  label: string;
  minCapacity: number;
  maxCapacity: number;
  tableTier: "STANDARD" | "PREMIUM" | "GROUP";
  bookable: boolean;
  availabilityState: "available" | "reserved" | "blocked" | "party_size_mismatch" | "unknown";
  svg: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotationDeg: number;
  };
};

export type FloorPlanResponse = {
  date: string;
  timezone: string;
  partySize: number;
  slotStartsAt: string | null;
  areas: { id: string; name: string; description: string | null }[];
  tables: FloorPlanTable[];
};

export type Reservation = {
  id: string;
  reference: string;
  tableId: string;
  tableLabel: string | null;
  shiftId: string | null;
  shiftName: string | null;
  startsAt: string;
  endsAt: string;
  partySize: number;
  status: string;
  source: string;
  specialRequest: string | null;
  depositRequired: boolean;
  depositAmountCents: number | null;
  depositCurrency: string | null;
  depositDueAt: string | null;
  paymentStatus: string | null;
  checkedInAt: string | null;
  checkedInGuestCount?: number;
  createdAt: string;
  canCancel: boolean;
  cancellationDeadlineAt: string | null;
  qrToken?: string;
};

export async function fetchAvailability(
  date: string,
  partySize: number,
  shiftId?: string,
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({
    date,
    partySize: String(partySize),
  });
  if (shiftId) {
    params.set("shiftId", shiftId);
  }
  return apiGet<AvailabilityResponse>(`/availability?${params.toString()}`);
}

export async function fetchFloorPlan(input: {
  date: string;
  partySize: number;
  shiftId: string;
  slotStartsAt: string;
}): Promise<FloorPlanResponse> {
  const params = new URLSearchParams({
    date: input.date,
    partySize: String(input.partySize),
    shiftId: input.shiftId,
    slotStartsAt: input.slotStartsAt,
  });
  return apiGet<FloorPlanResponse>(`/floor-plan?${params.toString()}`);
}

export async function createReservation(
  accessToken: string,
  body: {
    date: string;
    shiftId: string;
    slotStartsAt: string;
    tableId: string;
    partySize: number;
    specialRequest?: string;
    acceptedTerms: boolean;
  },
): Promise<Reservation> {
  return apiPost<Reservation>("/reservations", body, accessToken);
}

export async function fetchMyReservations(accessToken: string): Promise<Reservation[]> {
  return apiGet<Reservation[]>("/reservations/mine", { accessToken });
}

export async function fetchReservation(
  accessToken: string,
  id: string,
): Promise<Reservation> {
  return apiGet<Reservation>(`/reservations/${id}`, { accessToken });
}

export async function fetchCheckInPass(
  accessToken: string,
  reservationId: string,
): Promise<{ qrPass: string }> {
  return apiGet<{ qrPass: string }>(`/reservations/${reservationId}/check-in-pass`, {
    accessToken,
  });
}

export async function cancelReservation(
  accessToken: string,
  id: string,
): Promise<Reservation> {
  return apiPost<Reservation>(`/reservations/${id}/cancel`, {}, accessToken);
}

export type CheckoutSession = {
  reservationId: string;
  paymentId: string;
  idempotencyKey: string;
  provider: string;
  amountCents: number;
  currency: string;
  depositDueAt: string | null;
  checkoutUrl: string | null;
  devSimulateAllowed: boolean;
};

export async function createPaymentCheckout(
  accessToken: string,
  reservationId: string,
): Promise<CheckoutSession> {
  return apiPost<CheckoutSession>(
    "/payments/checkout",
    { reservationId },
    accessToken,
  );
}

export async function devSimulatePaymentCapture(
  accessToken: string,
  reservationId: string,
): Promise<{ ok: true }> {
  return apiPost<{ ok: true }>(
    "/payments/dev/simulate-capture",
    { reservationId },
    accessToken,
  );
}

export type { MeResponse };
