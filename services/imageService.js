require("dotenv").config();

const fetch = require("node-fetch");

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

const sources = {
  wikimedia: "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=images&titles=Touraine.jpg&origin=*&iiprop=url",
  unsplash: `https://api.unsplash.com/photos/random?query=Tours%20France&client_id=${UNSPLASH_ACCESS_KEY}`,
  pixabay: `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=Tours+France&image_type=photo`,
};

async function getImageFromUnsplash() {
  try {
    const response = await fetch(sources.unsplash);
    const data = await response.json();
    return data.urls ? data.urls.regular : null;
  } catch (error) {
    console.error("❌ Erreur Unsplash :", error);
    return null;
  }
}

async function getImageFromPixabay() {
  try {
    const response = await fetch(sources.pixabay);
    const data = await response.json();
    return data.hits.length > 0 ? data.hits[0].webformatURL : null;
  } catch (error) {
    console.error("❌ Erreur Pixabay :", error);
    return null;
  }
}

async function getImage() {
  let image = await getImageFromUnsplash();
  if (!image) {
    image = await getImageFromPixabay();
  }
  return image || "https://via.placeholder.com/600x400?text=Image+non+disponible";
}

module.exports = { getImage };

