import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = "https://iturrieta.eus/assets/";
/** From https://iturrieta.eus/English/MENUS/ — “This is what comes off the grill” */
const files = [
  ["iturrieta-menu-bacalao.jpg", "bacalao.jpg"],
  ["iturrieta-menu-pulpo.jpg", "pulpo.jpg"],
  ["iturrieta-menu-chuleton-plato.jpg", "chuleton-plato.jpg"],
  ["iturrieta-menu-chuleton.jpg", "chuleton.jpg"],
  ["iturrieta-menu-parrilla.jpg", "parrilla.jpg"],
  ["iturrieta-menu-cocina.jpg", "cocina.jpg"],
  ["iturrieta-menu-comedor.jpg", "comedor.jpg"],
  ["iturrieta-menu-kupelas.jpg", "kupelas.jpg"],
];

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
await mkdir(dir, { recursive: true });

for (const [local, remote] of files) {
  const res = await fetch(base + remote, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    console.error("FAIL", remote, res.status);
    continue;
  }
  await writeFile(path.join(dir, local), Buffer.from(await res.arrayBuffer()));
  console.log("OK", local);
}
