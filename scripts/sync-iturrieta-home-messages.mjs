import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "messages");
const en = JSON.parse(await readFile(path.join(root, "en.json"), "utf8"));

const homeKeys = [
  "meta",
  "nav",
  "hero",
  "aboutSection",
  "menuSection",
  "season",
  "experiencesSection",
  "visitSection",
  "footer",
  "common",
];

for (const locale of ["fr", "ca"]) {
  const file = path.join(root, `${locale}.json`);
  const data = JSON.parse(await readFile(file, "utf8"));
  for (const key of homeKeys) {
    if (en[key]) {
      data[key] = structuredClone(en[key]);
    }
  }
  if (data.meta?.bookTitle) {
    /* keep localized book titles where present */
  }
  if (locale === "fr") {
    data.meta.bookTitle = "Réserver une table";
    data.nav.book = "Réserver une table";
    data.hero.book = "Réserver une table";
    data.season.cta = "Réserver une table";
  }
  if (locale === "ca") {
    data.meta.bookTitle = "Reservar taula";
    data.nav.book = "Reservar taula";
    data.hero.book = "Reservar taula";
    data.season.cta = "Reservar taula";
  }
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("updated", locale);
}
