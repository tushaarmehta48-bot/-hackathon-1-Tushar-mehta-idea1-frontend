/** Full-bleed homepage hero carousel — assets from iturrieta.eus */

export const heroSlideIds = [
  "orchard",
  "caserio",
  "farmhouse",
  "kupelas",
  "txotx",
  "terrace",
  "concerts",
] as const;

export type HeroSlideId = (typeof heroSlideIds)[number];

export const heroSlideSources: Record<HeroSlideId, string> = {
  orchard: "/images/iturrieta-orchard.jpg",
  caserio: "/images/iturrieta-hero-caserio.jpg",
  farmhouse: "/images/iturrieta-about-farmhouse.jpg",
  kupelas: "/images/iturrieta-kupelas.jpg",
  txotx: "/images/iturrieta-txotx.jpg",
  terrace: "/images/iturrieta-terrace.jpg",
  concerts: "/images/iturrieta-concerts.jpg",
};
