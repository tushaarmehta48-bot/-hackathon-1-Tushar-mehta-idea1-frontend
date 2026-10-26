/** Venue facts that stay consistent across locales (review with the owner). */

export const site = {
  name: "Haritz Sagardotegia",
  address: {
    line1: "Barrio Haritz, 12",
    line2: "20100 Errenteria, Gipuzkoa",
    mapsQuery: "Errenteria,Gipuzkoa,Spain",
  },
  contact: {
    phone: "+34 943 000 000",
    email: "info@haritz-sagardotegia.example",
  },
} as const;

export const navAnchors = [
  { href: "#menu", key: "menu" as const },
  { href: "#experiences", key: "experiences" as const },
  { href: "#visit", key: "visit" as const },
] as const;
