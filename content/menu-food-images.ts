/** “This is what comes off the grill” — https://iturrieta.eus/English/MENUS/ */

export const menuFoodSlideIds = [
  "bacalao",
  "pulpo",
  "chuletonPlated",
  "chuletonBeforeGrill",
  "charcoalGrill",
  "kitchen",
  "diningRoom",
  "kupelas",
] as const;

export type MenuFoodSlideId = (typeof menuFoodSlideIds)[number];

export const menuFoodSlideSources: Record<MenuFoodSlideId, string> = {
  bacalao: "/images/iturrieta-menu-bacalao.jpg",
  pulpo: "/images/iturrieta-menu-pulpo.jpg",
  chuletonPlated: "/images/iturrieta-menu-chuleton-plato.jpg",
  chuletonBeforeGrill: "/images/iturrieta-menu-chuleton.jpg",
  charcoalGrill: "/images/iturrieta-menu-parrilla.jpg",
  kitchen: "/images/iturrieta-menu-cocina.jpg",
  diningRoom: "/images/iturrieta-menu-comedor.jpg",
  kupelas: "/images/iturrieta-menu-kupelas.jpg",
};
