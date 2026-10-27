export type TableTier = "STANDARD" | "PREMIUM" | "GROUP";

export const TABLE_TIER_ORDER: TableTier[] = ["STANDARD", "PREMIUM", "GROUP"];

type TierPalette = {
  available: string;
  availableSelected: string;
  stroke: string;
  strokeSelected: string;
};

/** Base fills by tier; unavailable state uses a shared neutral grey in components. */
export const TABLE_TIER_PALETTE: Record<TableTier, TierPalette> = {
  STANDARD: {
    available: "#6b7c4c",
    availableSelected: "#2d5016",
    stroke: "#4a5a38",
    strokeSelected: "#1a3310",
  },
  PREMIUM: {
    available: "#8b5a2b",
    availableSelected: "#6b3f1a",
    stroke: "#5c3d1e",
    strokeSelected: "#3d2812",
  },
  GROUP: {
    available: "#3d5a6b",
    availableSelected: "#2a4250",
    stroke: "#2f4654",
    strokeSelected: "#1e2f38",
  },
};

export const TABLE_TIER_UNAVAILABLE_FILL = "#d4cfc4";
export const TABLE_TIER_UNAVAILABLE_STROKE = "#b8b0a4";

export function normalizeTableTier(value: string | undefined | null): TableTier {
  if (value === "PREMIUM" || value === "GROUP") {
    return value;
  }
  return "STANDARD";
}

/** Match backend tier resolution when the DB column is missing. */
export function effectiveTableTier(table: {
  label: string;
  maxCapacity: number;
  tableTier?: string | null;
}): TableTier {
  const fromApi = normalizeTableTier(table.tableTier);
  if (table.tableTier === "PREMIUM" || table.tableTier === "GROUP") {
    return fromApi;
  }
  const label = table.label.trim().toUpperCase();
  if (label.startsWith("G")) {
    return "GROUP";
  }
  if (label === "T2" || table.maxCapacity >= 8) {
    return "PREMIUM";
  }
  return "STANDARD";
}

export function tableTierFill(
  tier: TableTier,
  state: "available" | "unavailable",
  selected: boolean,
): { fill: string; stroke: string; strokeWidth: number } {
  if (state === "unavailable") {
    return {
      fill: TABLE_TIER_UNAVAILABLE_FILL,
      stroke: TABLE_TIER_UNAVAILABLE_STROKE,
      strokeWidth: 1,
    };
  }
  const palette = TABLE_TIER_PALETTE[tier];
  return {
    fill: selected ? palette.availableSelected : palette.available,
    stroke: selected ? palette.strokeSelected : palette.stroke,
    strokeWidth: selected ? 2.5 : 1,
  };
}
