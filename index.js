require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const puppeteerService = require('./services/puppeteer.service');
const fetch = require('node-fetch');

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

/**
 * Récupère les images des comptes Instagram publics via Puppeteer.
 */
async function setInstagramPosts() {
  const accounts = {
    villedetours: 'villedetours',
    bienvivreatours: 'bienvivreatours',
  };

  for (const [username, profile] of Object.entries(accounts)) {
    console.log(`Récupération des images pour ${username}...`);
    const images = await puppeteerService.getLatestInstagramPostsFromAccount(profile);
    
    if (images.length > 0) {
      DATA[`img_${username}_1`] = images[0] || '';
      DATA[`img_${username}_2`] = images[1] || '';
      DATA[`img_${username}_3`] = images[2] || '';
    } else {
      console.warn(`Aucune image trouvée pour ${username}.`);
    }
  }
}

/**
 * Récupère la météo actuelle de Tours via OpenWeatherMap.
 */
async function setWeatherData() {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      throw new Error("❌ Clé API OpenWeatherMap absente. Vérifiez votre fichier .env !");
    }

    const CITY = 'Tours,FR';
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=fr`;

    const response = await fetch(URL);
    const weatherData = await response.json();

    if (weatherData.cod === 200) {
      DATA.city_weather = weatherData.weather[0].description;
      DATA.city_temperature = Math.round(weatherData.main.temp);
      DATA.city_weather_icon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

      const sunRiseTime = new Date(weatherData.sys.sunrise * 1000);
      const sunSetTime = new Date(weatherData.sys.sunset * 1000);

      DATA.sun_rise = sunRiseTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      DATA.sun_set = sunSetTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      console.log('✅ Météo mise à jour avec succès.');
    } else {
      console.error('❌ Erreur OpenWeatherMap :', weatherData.message);
    }
  } catch (error) {
    console.error('❌ Erreur API OpenWeatherMap :', error);
  }
}

/**
 * Génère le fichier README.md avec les données mises à jour.
 */
async function generateReadMe() {
  try {
    const template = fs.readFileSync(MUSTACHE_MAIN_DIR, 'utf8');
    const output = Mustache.render(template, DATA);
    fs.writeFileSync('README.md', output);
    console.log('✅ README.md mis à jour !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération du README.md :', error);
  }
}

/**
 * Exécute les différentes tâches.
 */
async function action() {
  await setInstagramPosts();
  await setWeatherData();
  await generateReadMe();
  await puppeteerService.close(); // Ferme Puppeteer proprement
}

action();
