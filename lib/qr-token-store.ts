const prefix = "booking-qr:";

export function saveBookingQrToken(reservationId: string, token: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(`${prefix}${reservationId}`, token);
}

export function getBookingQrToken(reservationId: string): string | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage.getItem(`${prefix}${reservationId}`);
}
