/** Venue facts — aligned with https://iturrieta.eus */

export const site = {
  name: "Iturrieta Sagardotegia",
  brand: {
    primary: "Iturrieta",
    secondary: "Sagardotegia",
  },
  address: {
    line1: "Arraga auzoa, 2",
    line2: "01169 Aramaio, Álava",
    mapsQuery: "Iturrieta Sagardotegia, Arraga, Aramaio, Álava",
  },
  contact: {
    phone: "685 72 15 93",
    phoneTel: "+34685721593",
    email: "info@iturrieta.eus",
    instagram: "https://www.instagram.com/iturrietasagardotegia/",
    whatsapp: "https://wa.me/34685721593",
  },
} as const;

/** Section ids on the homepage — always link via `pathname: "/"` so anchors work from /book etc. */
export const navAnchors = [
  { sectionId: "about", key: "about" as const },
  { sectionId: "menu", key: "menu" as const },
  { sectionId: "blog", key: "blog" as const },
  { sectionId: "experiences", key: "experiences" as const },
  { sectionId: "visit", key: "visit" as const },
] as const;
