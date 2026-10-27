"use client";

import type { FloorPlanTable } from "@/lib/booking-api";
import { FloorPlanLegend } from "@/components/booking/floor-plan-legend";
import { normalizeTableTier, tableTierFill, type TableTier } from "@/lib/table-tier";

type FloorPlanSvgProps = {
  tables: FloorPlanTable[];
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
  labels: {
    available: string;
    unavailable: string;
    selected: string;
    tierStandard: string;
    tierPremium: string;
    tierGroup: string;
    tierLegend: string;
  };
};

function tierLabel(labels: FloorPlanSvgProps["labels"], tier: TableTier): string {
  if (tier === "PREMIUM") {
    return labels.tierPremium;
  }
  if (tier === "GROUP") {
    return labels.tierGroup;
  }
  return labels.tierStandard;
}

export function FloorPlanSvg({
  tables,
  selectedTableId,
  onSelect,
  labels,
}: FloorPlanSvgProps) {
  const tierLabels: Record<TableTier, string> = {
    STANDARD: labels.tierStandard,
    PREMIUM: labels.tierPremium,
    GROUP: labels.tierGroup,
  };

  return (
    <div className="overflow-x-auto rounded-sm border border-line bg-cream-dark/40 p-5 shadow-inner shadow-forest/5">
      <svg viewBox="0 0 400 220" className="mx-auto h-auto w-full max-w-lg" role="img">
        <title>{labels.tierLegend}</title>
        {tables.map((table) => {
          const selectable = table.availabilityState === "available";
          const selected = table.id === selectedTableId;
          const tier = normalizeTableTier(table.tableTier);
          const { fill, stroke, strokeWidth } = tableTierFill(
            tier,
            selectable ? "available" : "unavailable",
            selected,
          );
          const tierName = tierLabel(labels, tier);

          return (
            <g
              key={table.id}
              transform={`rotate(${table.svg.rotationDeg} ${table.svg.x + table.svg.width / 2} ${table.svg.y + table.svg.height / 2})`}
            >
              <rect
                x={table.svg.x}
                y={table.svg.y}
                width={table.svg.width}
                height={table.svg.height}
                rx={6}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                className={selectable ? "cursor-pointer" : "cursor-not-allowed"}
                onClick={() => {
                  if (selectable) {
                    onSelect(table.id);
                  }
                }}
                aria-label={`${table.label} (${tierName}) — ${selectable ? labels.available : labels.unavailable}${selected ? ` (${labels.selected})` : ""}`}
              />
              <text
                x={table.svg.x + table.svg.width / 2}
                y={table.svg.y + table.svg.height / 2 - 2}
                textAnchor="middle"
                fill="#faf8f3"
                fontSize={11}
                fontWeight={600}
                pointerEvents="none"
              >
                {table.label}
              </text>
              <text
                x={table.svg.x + table.svg.width / 2}
                y={table.svg.y + table.svg.height / 2 + 11}
                textAnchor="middle"
                fill="#faf8f3"
                fontSize={8}
                opacity={0.92}
                pointerEvents="none"
              >
                {tierName}
              </text>
            </g>
          );
        })}
      </svg>
      <FloorPlanLegend tierLabels={tierLabels} unavailableLabel={labels.unavailable} />
    </div>
  );
}
