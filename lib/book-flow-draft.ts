const STORAGE_KEY = "iturrieta.book-flow-draft.v1";

export type BookFlowDraft = {
  step: "when" | "time" | "tableType" | "details";
  date: string;
  partySize: number;
  preferredTime: string;
  shiftId: string | null;
  slotStartsAt: string | null;
  slotEndsAt: string | null;
  tableId: string | null;
  selectedTableTier: "STANDARD" | "PREMIUM" | "GROUP" | null;
  specialRequest: string;
  acceptedTerms: boolean;
};

export function saveBookFlowDraft(draft: BookFlowDraft): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function loadBookFlowDraft(): BookFlowDraft | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as BookFlowDraft;
  } catch {
    return null;
  }
}

export function clearBookFlowDraft(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}
