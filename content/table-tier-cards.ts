import type { TableTier } from "@/lib/table-tier";

/** Unsplash (free to use via Unsplash License) — rustic dining atmosphere. */
export type TableTierCardContent = {
  tier: TableTier;
  imageSrc: string;
  titleKey: "tierCards.standard.title" | "tierCards.premium.title" | "tierCards.group.title";
  descriptionKey:
    | "tierCards.standard.description"
    | "tierCards.premium.description"
    | "tierCards.group.description";
  imageAltKey:
    | "tierCards.standard.imageAlt"
    | "tierCards.premium.imageAlt"
    | "tierCards.group.imageAlt";
  unsplashCredit: string;
};

export const TABLE_TIER_CARDS: TableTierCardContent[] = [
  {
    tier: "STANDARD",
    imageSrc: "/images/table-tier/standard.jpg",
    titleKey: "tierCards.standard.title",
    descriptionKey: "tierCards.standard.description",
    imageAltKey: "tierCards.standard.imageAlt",
    unsplashCredit: "Photo: Unsplash — shared dining room",
  },
  {
    tier: "PREMIUM",
    imageSrc: "/images/table-tier/premium.jpg",
    titleKey: "tierCards.premium.title",
    descriptionKey: "tierCards.premium.description",
    imageAltKey: "tierCards.premium.imageAlt",
    unsplashCredit: "Photo: Unsplash — premium table setting",
  },
  {
    tier: "GROUP",
    imageSrc: "/images/table-tier/group.jpg",
    titleKey: "tierCards.group.title",
    descriptionKey: "tierCards.group.description",
    imageAltKey: "tierCards.group.imageAlt",
    unsplashCredit: "Photo: Unsplash — group seating",
  },
];
