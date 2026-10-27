const res = await fetch("https://iturrieta.eus/English/");
const html = await res.text();
const matches = [...html.matchAll(/assets\/[^"']+/g)].map((m) => m[0]);
console.log([...new Set(matches)].join("\n"));
