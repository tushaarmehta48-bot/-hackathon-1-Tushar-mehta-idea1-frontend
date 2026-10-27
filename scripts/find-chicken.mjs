const res = await fetch("https://iturrieta.eus/");
const html = await res.text();
for (const word of ["pollo", "oilasko", "Chicken", "chicken", "Polo"]) {
  if (html.includes(word)) console.log("found", word);
}
for (const m of html.matchAll(/assets\/[^"'\s)]+\.(jpg|png|webp)/gi)) {
  console.log(m[0]);
}
