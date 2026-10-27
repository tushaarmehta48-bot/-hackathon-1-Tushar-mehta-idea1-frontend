/** Calendar dates for booking UI — aligned with default venue policy timezone. */

export const BOOKING_TIMEZONE = "Europe/Madrid";

/** Earliest / latest **start** times for online lunch (120 min sitting until 16:00). */
export const PUBLIC_LUNCH_START_TIME = "13:00";
export const PUBLIC_LUNCH_LAST_START_TIME = "14:00";

/** `YYYY-MM-DD` for the current calendar day in the venue timezone. */
export function todayInVenueTimezone(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isPastVenueDate(dateStr: string, now: Date = new Date()): boolean {
  return dateStr < todayInVenueTimezone(now);
}

/** Public self-service booking: Thu–Sun lunch only (matches backend service_shifts). */
export function isOnlineLunchDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TIMEZONE,
    weekday: "short",
  }).format(probe);
  return weekday === "Thu" || weekday === "Fri" || weekday === "Sat" || weekday === "Sun";
}

/** `HH:mm` for a slot start in the venue timezone (24-hour). */
export function slotStartLocalTime(iso: string, timeZone: string = BOOKING_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}
