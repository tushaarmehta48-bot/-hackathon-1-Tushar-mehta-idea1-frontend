import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
const en = JSON.parse(await readFile(path.join(root, "en.json"), "utf8"));

const localized = {
  es: {
    eyebrow: "Desde la cocina",
    title: "Esto es lo que sale de la parrilla",
    lead: "Bacalao, pulpo, chuletón y la parrilla de carbón — las mismas escenas que en nuestro menú de sagardotegi.",
    slides: {
      bacalao: { caption: "Bacalao con pimientos y cebolla crujiente." },
      pulpo: { alt: "Pulpo a la brasa", caption: "Pulpo a la brasa." },
      chuletonPlated: { alt: "Chuletón en el plato", caption: "Chuletón, ya en el plato." },
      chuletonBeforeGrill: { alt: "Chuletones antes de la brasa", caption: "Chuletones antes de la brasa." },
      charcoalGrill: { alt: "La parrilla de carbón", caption: "La parrilla de carbón." },
      kitchen: { alt: "La cocina en pleno servicio", caption: "La cocina, en pleno servicio." },
      diningRoom: { alt: "El comedor de la sidrería", caption: "El comedor de la sidrería." },
      kupelas: { alt: "Kupelas listas para el txotx", caption: "Las kupelas, listas para el txotx." },
    },
  },
  eu: {
    eyebrow: "Sukaldetik",
    title: "Hau da parrillatik ateratzen dena",
    lead: "Bakailaoa, olagarroa, txuletoia eta ikatz parrilla — gure sagardoetxe menuko irudi berak.",
    slides: {
      bacalao: { caption: "Bakailaoa piper eta tipula krispiarekin." },
      pulpo: { alt: "Olagarroa parrillan", caption: "Pulpo a la brasa." },
      chuletonPlated: { caption: "Txuletoia, platerrean." },
      chuletonBeforeGrill: { caption: "Txuletonak suaren aurretik." },
      charcoalGrill: { caption: "Ikatz parrilla." },
      kitchen: { caption: "Sukaldea, zerbitzuan." },
      diningRoom: { caption: "Sagardoetxearen comedorra." },
      kupelas: { caption: "Kupelak, txotxerako prest." },
    },
  },
};

function deepMerge(a, b) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) ? deepMerge(out[k] ?? {}, v) : v;
  }
  return out;
}

for (const locale of ["es", "eu", "ca", "fr"]) {
  const file = path.join(root, `${locale}.json`);
  const data = JSON.parse(await readFile(file, "utf8"));
  data.menuSection.foodGallery = deepMerge(
    structuredClone(en.menuSection.foodGallery),
    localized[locale] ?? {},
  );
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("synced", locale);
}
