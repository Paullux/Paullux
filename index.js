require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const imageService = require("./services/imageService");
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
async function setImagesFromSources() {
  try {
    console.log("📸 Récupération des images de Tours depuis des sources ouvertes...");

    const images = await imageService.getImagesFromSources();

    if (images.length > 0) {
      DATA["img_tours_1"] = images[0] || "";
      DATA["img_tours_2"] = images[1] || "";
      DATA["img_tours_3"] = images[2] || "";
    }

    console.log("✅ Images mises à jour avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des images :", error);
  }
}

/**
 * Récupère la météo actuelle de Tours via OpenWeatherMap.
 */
async function setWeatherData() {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const CITY = 'Tours,FR';
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=fr`;

    const response = await fetch(URL);
    const weatherData = await response.json();

    if (weatherData.cod === 200) {
      DATA.city_weather = weatherData.weather[0].description;
      DATA.city_temperature = Math.round(weatherData.main.temp);
      DATA.city_weather_icon = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

      // Convertir timestamp Unix en heure locale
      const sunRiseTime = new Date(weatherData.sys.sunrise * 1000);
      const sunSetTime = new Date(weatherData.sys.sunset * 1000);

      DATA.sun_rise = sunRiseTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      DATA.sun_set = sunSetTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      console.log('✅ Météo mise à jour avec succès.');
    } else {
      console.error('❌ Erreur lors de la récupération de la météo :', weatherData.message);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l’appel API OpenWeatherMap :', error);
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
  await setImagesFromSources();
  await setWeatherData();
  await generateReadMe();
}

action();
