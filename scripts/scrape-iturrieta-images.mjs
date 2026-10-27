const pages = [
  "https://iturrieta.eus/English/",
  "https://iturrieta.eus/English/Menus/",
  "https://iturrieta.eus/Menus/",
  "https://iturrieta.eus/Menuak/",
];

for (const page of pages) {
  try {
    const res = await fetch(page);
    if (!res.ok) {
      console.log("SKIP", page, res.status);
      continue;
    }
    const html = await res.text();
    console.log("\n===", page, "===");
    const urls = new Set();
    for (const m of html.matchAll(/(?:src|href|data-src|poster)=["']([^"']+)["']/g)) urls.add(m[1]);
    for (const m of html.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(m[1]);
    for (const u of [...urls].sort()) {
      if (/\.(jpg|jpeg|png|webp|avif)/i.test(u) || u.includes("assets/")) console.log(u);
    }
    if (/pollo|chicken|oilasko|txorizo/i.test(html)) console.log("(mentions chicken in html)");
  } catch (e) {
    console.log("ERR", page, e.message);
  }
}
