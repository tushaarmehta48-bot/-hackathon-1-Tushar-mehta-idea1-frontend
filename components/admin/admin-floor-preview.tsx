"use client";

import type { AdminTable } from "@/lib/admin-api";
import { FloorPlanLegend } from "@/components/booking/floor-plan-legend";
import { normalizeTableTier, tableTierFill, type TableTier } from "@/lib/table-tier";

type AdminFloorPreviewProps = {
  tables: AdminTable[];
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
  tierLabels: Record<TableTier, string>;
  unavailableLabel: string;
};

export function AdminFloorPreview({
  tables,
  selectedTableId,
  onSelect,
  tierLabels,
  unavailableLabel,
}: AdminFloorPreviewProps) {
  const visible = tables.filter((table) => table.active);

  return (
    <div className="overflow-x-auto rounded-sm border border-line bg-cream-dark/40 p-5 shadow-inner shadow-forest/5">
      <svg viewBox="0 0 400 220" className="mx-auto h-auto w-full max-w-lg" role="img">
        <title>Floor plan layout</title>
        {visible.map((table) => {
          const selected = table.id === selectedTableId;
          const tier = normalizeTableTier(table.tableTier);
          const state = table.bookable ? "available" : "unavailable";
          const { fill, stroke, strokeWidth } = tableTierFill(tier, state, selected);

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
                className="cursor-pointer"
                onClick={() => onSelect(table.id)}
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
                pointerEvents="none"
              >
                {tierLabels[tier]}
              </text>
            </g>
          );
        })}
      </svg>
      <FloorPlanLegend tierLabels={tierLabels} unavailableLabel={unavailableLabel} />
    </div>
  );
}
