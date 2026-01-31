require("dotenv").config();
const fetch = require("node-fetch");

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const FALLBACKS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Tours_Hotel_de_Ville.jpg/640px-Tours_Hotel_de_Ville.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Cathedrale_Saint-Gatien_de_Tours.jpg/640px-Cathedrale_Saint-Gatien_de_Tours.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pont_Wilson_Tours.jpg/640px-Pont_Wilson_Tours.jpg/640px-Pont_Wilson_Tours.jpg".replace("/640px-Pont_Wilson_Tours.jpg/640px-Pont_Wilson_Tours.jpg","/640px-Pont_Wilson_Tours.jpg"),
];

// petit check "pas vide"
function isValidUrl(u) {
  return typeof u === "string" && u.startsWith("https://") && u.length > 10;
}

async function getImagesFromUnsplash() {
  if (!UNSPLASH_ACCESS_KEY) return [];
  const url = `https://api.unsplash.com/photos/random?query=ville+de+Tours+France&count=3&client_id=${UNSPLASH_ACCESS_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // urls.small/regular/raw existent, regular est ok
    return (Array.isArray(data) ? data : []).map((img) => img?.urls?.regular).filter(isValidUrl);
  } catch {
    return [];
  }
}

async function getImagesFromPixabay() {
  if (!PIXABAY_API_KEY) return [];
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=ville+de+Tours+France&image_type=photo&per_page=3&safesearch=true`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.hits || []).map((img) => img?.webformatURL).filter(isValidUrl);
  } catch {
    return [];
  }
}

async function getImagesFromWikimedia() {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    "&generator=categorymembers&gcmtitle=Category:Tours_(France)&gcmtype=file&gcmlimit=6" +
    "&prop=imageinfo&iiprop=url";
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];
    return Object.values(pages)
      .map((p) => p?.imageinfo?.[0]?.url)
      .filter(isValidUrl);
  } catch {
    return [];
  }
}

/**
 * Retourne toujours 3 URLs d'images
 */
async function getImagesFromSources() {
  // on tente dans l'ordre, et on cumule ce qu'on trouve
  const out = [];

  for (const fn of [getImagesFromUnsplash, getImagesFromPixabay, getImagesFromWikimedia]) {
    const imgs = await fn();
    for (const u of imgs) {
      if (isValidUrl(u) && !out.includes(u)) out.push(u);
      if (out.length >= 3) break;
    }
    if (out.length >= 3) break;
  }

  // complete si pas assez
  for (const fb of FALLBACKS) {
    if (out.length >= 3) break;
    if (!out.includes(fb)) out.push(fb);
  }

  // au pire du pire (mais tu auras 3 quoi qu'il arrive)
  while (out.length < 3) out.push("https://via.placeholder.com/600x400?text=Image+non+disponible");

  return out.slice(0, 3);
}

module.exports = { getImagesFromSources };