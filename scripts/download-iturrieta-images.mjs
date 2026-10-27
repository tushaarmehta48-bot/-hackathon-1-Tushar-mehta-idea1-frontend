import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = "https://www.iturrieta.eus/assets/";
const files = [
  ["iturrieta-hero-caserio.jpg", "caserio.jpg"],
  ["iturrieta-about-farmhouse.jpg", "caserio-piedra.jpg"],
  ["iturrieta-apple.jpg", "manzana-negro.jpg"],
  ["iturrieta-kupelas.jpg", "kupelas.jpg"],
  ["iturrieta-orchard.jpg", "v-manzanas.jpg"],
  ["iturrieta-concerts.jpg", "v-conciertos.jpg"],
  ["iturrieta-txotx.jpg", "v-txotx.jpg"],
  ["iturrieta-terrace.jpg", "terraza.jpg"],
  ["iturrieta-hero-orchard-video.jpg", "v-manzanas.jpg"],
];

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
await mkdir(dir, { recursive: true });

for (const [local, remote] of files) {
  const url = base + remote;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) {
      console.error("FAIL", remote, res.status);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(dir, local), buf);
    console.log("OK", local);
  } catch (e) {
    console.error("ERR", remote, e.message);
  }
}
