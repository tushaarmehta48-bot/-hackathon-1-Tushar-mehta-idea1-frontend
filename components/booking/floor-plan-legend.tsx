"use client";

import { TABLE_TIER_ORDER, TABLE_TIER_PALETTE, type TableTier } from "@/lib/table-tier";

type FloorPlanLegendProps = {
  tierLabels: Record<TableTier, string>;
  unavailableLabel: string;
};

export function FloorPlanLegend({ tierLabels, unavailableLabel }: FloorPlanLegendProps) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Table types">
      {TABLE_TIER_ORDER.map((tier) => (
        <li key={tier} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-5 rounded-sm border"
            style={{
              backgroundColor: TABLE_TIER_PALETTE[tier].available,
              borderColor: TABLE_TIER_PALETTE[tier].stroke,
            }}
          />
          {tierLabels[tier]}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-5 rounded-sm border border-[#b8b0a4] bg-[#d4cfc4]"
          aria-hidden
        />
        {unavailableLabel}
      </li>
    </ul>
  );
}
