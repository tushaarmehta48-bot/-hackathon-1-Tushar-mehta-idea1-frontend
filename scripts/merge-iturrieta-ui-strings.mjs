import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
const en = JSON.parse(await readFile(path.join(root, "en.json"), "utf8"));

const patches = {
  es: {
    hero: {
      title: "Del manzano al",
      titleAccent: "txotx.",
      leadSecondary: "Llame y reserve, o reserven online — la misma bienvenida en el caserío de Arraga.",
      callPhone: "685 72 15 93",
      scrollHint: "Desplazar",
      book: "Reservar mesa",
      viewMenu: "Ver la carta",
    },
    menuSection: {
      foodGallery: {
        title: "Cocina de sagardotegi y txotx",
        lead: "Parrilla, asados y sidra de kupela — los mismos platos del menú, incluido el chorizo a la sidra y el chuletón a la parrilla.",
        slides: {
          txotxGrill: {
            caption: "¡Txotx! Sidra de la kupela y parrilla en marcha.",
          },
          steakGrill: {
            alt: "Chuletón y platos de parrilla",
            caption: "Chuletón a la leña — el centro del menú.",
          },
        },
      },
      seasonalMenu: {
        title: "Menú de temporada · mismos 45 €",
        body: "También servimos menú de temporada al mismo precio — platos según cosecha y parrilla, con asados y aves cuando hay. Pregunte al reservar.",
      },
      produce: {
        eyebrow: "Lo que elaboramos",
        title: "Sidra, zumo y huerto",
        body: "Manzanas ecológicas de nuestros 1.400 árboles, sidra natural Iturrieta ECO y zumo para llevar — Sagarretik txotxera.",
      },
    },
    season: { bodySecondary: "Enero a mayo — sidra de barril, menú a la parrilla y ritual txotx en la kupela." },
  },
  eu: {
    hero: {
      title: "Sagondotik",
      titleAccent: "txotxera.",
      leadSecondary: "Deitu eta erreserbatu, edo online — ongi etorri bera Arragako caserioan.",
      callPhone: "685 72 15 93",
      scrollHint: "Scroll",
      book: "Mahaia erreserbatu",
      viewMenu: "Menua ikusi",
    },
    menuSection: {
      foodGallery: {
        title: "Sagardoetxe sukaldaritza eta txotx",
        lead: "Parrilla, errea eta kupelako sagardoa — menu bereko platerak, txorizoa sagardotan eta txuletoia barne.",
      },
      seasonalMenu: {
        title: "Denboraldiko menua · 45 € berdin",
        body: "Denboraldiko menua ere eskaintzen dugu — uzta eta parrillaren arabera, errea eta hegaztiak eskuragarri daudenean.",
      },
      produce: {
        eyebrow: "Ekoizten duguna",
        title: "Sagardoa, zukua eta sagarordea",
        body: "Gure 1.400 sagarondotako sagar ekologikoak, Iturrieta ECO sagardoa eta etxera eramateko zukua — Sagarretik txotxera.",
      },
    },
    season: { bodySecondary: "Urtetik maiatzera — kupelako sagardoa, parrillako menua eta txotx errituala." },
  },
};

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] ?? {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

for (const locale of ["es", "eu", "ca", "fr"]) {
  const file = path.join(root, `${locale}.json`);
  const data = JSON.parse(await readFile(file, "utf8"));
  data.hero = deepMerge(structuredClone(en.hero), patches[locale]?.hero ?? {});
  data.menuSection = deepMerge(data.menuSection ?? {}, {
    foodGallery: en.menuSection.foodGallery,
    seasonalMenu: deepMerge(en.menuSection.seasonalMenu, patches[locale]?.menuSection?.seasonalMenu ?? {}),
    produce: deepMerge(en.menuSection.produce, patches[locale]?.menuSection?.produce ?? {}),
  });
  if (patches[locale]?.menuSection?.foodGallery) {
    data.menuSection.foodGallery = deepMerge(
      data.menuSection.foodGallery,
      patches[locale].menuSection.foodGallery,
    );
  }
  data.season = deepMerge(data.season ?? {}, {
    bodySecondary: en.season.bodySecondary,
    ...(patches[locale]?.season ?? {}),
  });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("merged", locale);
}
