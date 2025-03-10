require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const puppeteerService = require('./services/puppeteer.service');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Paris',
  }),
};

async function setInstagramPosts() {
  const accounts = [
    "toursvaldeloiretourisme",
    "villedetours",
    "bienvivreatours"
  ];

  for (const username of accounts) {
    const images = await puppeteerService.getLatestInstagramPostsFromAccount(username);
    if (images.length > 0) {
      DATA[`img_${username}_1`] = images[0] || '';
      DATA[`img_${username}_2`] = images[1] || '';
      DATA[`img_${username}_3`] = images[2] || '';
    } else {
      console.warn(`⚠️ Aucune image trouvée pour ${username}`);
    }
  }
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) {
      console.error("❌ Erreur de lecture du fichier Mustache :", err);
      return;
    }
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  console.log("🚀 Lancement de la récupération des images Instagram...");
  await setInstagramPosts();
  console.log("✅ Images Instagram récupérées avec succès !");
  
  console.log("📝 Génération du README...");
  await generateReadMe();
  console.log("✅ README mis à jour !");
  
  await puppeteerService.close();
}

action();
