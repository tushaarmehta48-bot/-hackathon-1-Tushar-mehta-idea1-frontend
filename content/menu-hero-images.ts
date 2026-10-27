/** Homepage menu carousel — photos from iturrieta.eus (local copies in public/images). */

export const menuHeroSlideIds = [
  "orchard",
  "kupelas",
  "txotx",
  "terrace",
  "apple",
  "farmhouse",
] as const;

export type MenuHeroSlideId = (typeof menuHeroSlideIds)[number];

export const menuHeroSlideSources: Record<MenuHeroSlideId, string> = {
  orchard: "/images/iturrieta-orchard.jpg",
  kupelas: "/images/iturrieta-kupelas.jpg",
  txotx: "/images/iturrieta-txotx.jpg",
  terrace: "/images/iturrieta-terrace.jpg",
  apple: "/images/iturrieta-apple.jpg",
  farmhouse: "/images/iturrieta-about-farmhouse.jpg",
};
