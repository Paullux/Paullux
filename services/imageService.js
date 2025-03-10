require("dotenv").config();

const fetch = require("node-fetch");

const sources = {
  wikimedia: "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&titles=Touraine.jpg&origin=*&iiprop=url",
  unsplash: "https://api.unsplash.com/photos/random?query=Tours%20France&client_id=UNSPLASH_ACCESS_KEY",
  pixabay: "https://pixabay.com/api/?key=PIXABAY_API_KEY&q=Tours+France&image_type=photo"
};

async function fetchImage(url, parser) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return parser(data);
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération d'une image : ${error}`);
    return null;
  }
}

async function getImagesFromSources() {
  const images = [];

  // Wikimedia Commons
  const wikimediaImg = await fetchImage(sources.wikimedia, (data) => {
    const pages = data.query?.pages;
    if (!pages) return null;
    return Object.values(pages)[0]?.imageinfo[0]?.url || null;
  });

  if (wikimediaImg) images.push(wikimediaImg);

  // Unsplash
  const unsplashImg = await fetchImage(sources.unsplash, (data) => data.urls?.regular || null);
  if (unsplashImg) images.push(unsplashImg);

  // Pixabay
  const pixabayImg = await fetchImage(sources.pixabay, (data) => data.hits?.[0]?.webformatURL || null);
  if (pixabayImg) images.push(pixabayImg);

  return images.slice(0, 3); // Prend jusqu'à 3 images max
}

module.exports = { getImagesFromSources };
