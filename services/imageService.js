require("dotenv").config();
const fetch = require("node-fetch");

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const sources = {
  unsplash: `https://api.unsplash.com/photos/random?query=Tours%20France&count=3&client_id=${UNSPLASH_ACCESS_KEY}`,
  pixabay: `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=Tours+France&image_type=photo&per_page=3`,
  wikimedia: `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=images&gimlimit=3&prop=imageinfo&iiprop=url&titles=Category:Tours_(France)`,
};

async function getImagesFromUnsplash() {
  try {
    const response = await fetch(sources.unsplash);
    const data = await response.json();
    return data.map(img => img.urls.regular);
  } catch (error) {
    console.error("❌ Erreur Unsplash :", error);
    return [];
  }
}

async function getImagesFromPixabay() {
  try {
    const response = await fetch(sources.pixabay);
    const data = await response.json();
    return data.hits.map(img => img.webformatURL);
  } catch (error) {
    console.error("❌ Erreur Pixabay :", error);
    return [];
  }
}

async function getImagesFromWikimedia() {
  try {
    const response = await fetch(sources.wikimedia);
    const data = await response.json();
    if (!data.query || !data.query.pages) return [];
    
    return Object.values(data.query.pages).map(page => page.imageinfo[0].url);
  } catch (error) {
    console.error("❌ Erreur Wikimedia :", error);
    return [];
  }
}

/**
 * Fonction pour récupérer des images depuis différentes sources
 * @returns {Promise<string[]>} Liste d'URLs d'images
 */
async function getImagesFromSources() {
  let images = await getImagesFromUnsplash();
  if (images.length === 0) images = await getImagesFromPixabay();
  if (images.length === 0) images = await getImagesFromWikimedia(); // Wikimedia en dernier recours
  return images.length > 0 ? images : ["https://via.placeholder.com/600x400?text=Image+non+disponible"];
}

module.exports = { getImagesFromSources };


