const res = await fetch("https://iturrieta.eus/English/MENUS/", {
  signal: AbortSignal.timeout(30_000),
});
const html = await res.text();
console.log("status", res.status, "len", html.length);
for (const m of html.matchAll(/<img[^>]+>/gi)) console.log(m[0]);
console.log("\n--- assets ---");
for (const m of html.matchAll(/\/assets\/[^"'\s)]+\.(jpg|jpeg|png|webp)/gi)) {
  console.log(m[0]);
}
for (const m of html.matchAll(/assets\/[^"'\s)]+\.(jpg|jpeg|png|webp)/gi)) {
  console.log("/" + m[0]);
}
