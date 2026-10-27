"use client";

import { useTranslations } from "next-intl";
import { TABLE_TIER_CARDS, type TableTierCardContent } from "@/content/table-tier-cards";
import { TABLE_TIER_PALETTE, type TableTier } from "@/lib/table-tier";

type TableTierCardPickerProps = {
  selectedTier: TableTier | null;
  onSelect: (tier: TableTier) => void;
  availableCountByTier: Record<TableTier, number>;
};

function TierCard({
  card,
  selected,
  availableCount,
  onSelect,
}: {
  card: TableTierCardContent;
  selected: boolean;
  availableCount: number;
  onSelect: () => void;
}) {
  const t = useTranslations("bookFlow");
  const disabled = availableCount === 0;
  const palette = TABLE_TIER_PALETTE[card.tier];

  const cardClass = disabled
    ? "cursor-not-allowed border-line opacity-55"
    : selected
      ? "border-forest shadow-md ring-1 ring-forest/20"
      : "border-line bg-cream hover:border-forest/35 hover:shadow-sm";

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onSelect();
        }
      }}
      onKeyDown={(event) => {
        if (disabled) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-sm border text-left transition-[border-color,box-shadow,transform] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 ${cardClass}`}
    >
      <div
        className={`relative aspect-[4/3] min-h-44 w-full shrink-0 overflow-hidden bg-cream-dark bg-cover bg-center transition-transform duration-300 ${
          disabled ? "grayscale" : "group-hover:scale-[1.02]"
        }`}
        style={{ backgroundImage: `url("${card.imageSrc}")` }}
        role="img"
        aria-label={t(card.imageAltKey)}
      >
        <span
          className="absolute left-3 top-3 rounded-sm px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-cream shadow-sm"
          style={{ backgroundColor: palette.available }}
        >
          {t(
            card.tier === "STANDARD"
              ? "floor.tierStandard"
              : card.tier === "PREMIUM"
                ? "floor.tierPremium"
                : "floor.tierGroup",
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg text-forest">{t(card.titleKey)}</h3>
          {selected ? (
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-forest">
              {t("tierCards.selected")}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted">{t(card.descriptionKey)}</p>
        <p className="mt-auto text-xs font-medium text-forest">
          {disabled
            ? t("tierCards.noneAvailable")
            : t("tierCards.availableCount", { count: availableCount })}
        </p>
      </div>
    </div>
  );
}

export function TableTierCardPicker({
  selectedTier,
  onSelect,
  availableCountByTier,
}: TableTierCardPickerProps) {
  const t = useTranslations("bookFlow");

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">{t("tierCards.lead")}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
        {TABLE_TIER_CARDS.map((card) => (
          <TierCard
            key={card.tier}
            card={card}
            selected={selectedTier === card.tier}
            availableCount={availableCountByTier[card.tier]}
            onSelect={() => onSelect(card.tier)}
          />
        ))}
      </div>
      <p className="text-[0.65rem] text-muted">{t("tierCards.photoCredit")}</p>
    </div>
  );
}
