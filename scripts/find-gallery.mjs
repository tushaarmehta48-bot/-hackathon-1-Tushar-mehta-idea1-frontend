const res = await fetch("https://iturrieta.eus/English/");
const html = await res.text();
const assets = [...html.matchAll(/\/assets\/[a-z0-9-]+\.(jpg|png|webp)/gi)].map((m) => m[0]);
console.log([...new Set(assets)].join("\n"));
const dataGallery = html.match(/data-gallery[^>]+>/gi);
console.log("data-gallery", dataGallery?.slice(0, 5));
const inline = html.match(/\[.*\.jpg.*\]/);
console.log(inline?.[0]?.slice(0, 500));
