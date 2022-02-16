require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
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

async function setWeatherInformation() {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=tours&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then(r => r.json())
    .then(r => {
      DATA.city_temperature = Math.round(r.main.temp);
      DATA.city_weather = r.weather[0].description;
      DATA.city_weather_icon = r.weather[0].icon;
      DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      });
      DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      });
    });
}

async function setInstagramPosts() {
  const instagramImages1 = await puppeteerService.getLatestInstagramPostsFromAccount('toursvaldeloiretourisme', 3);
  DATA.img1 = instagramImages1[0];
  DATA.img2 = instagramImages1[1];
  DATA.img3 = instagramImages1[2];
  const instagramImages2 = await puppeteerService.getLatestInstagramPostsFromAccount('villedetours', 3);
  DATA.img4 = instagramImages2[0];
  DATA.img5 = instagramImages2[1];
  DATA.img6 = instagramImages2[2];
  const instagramImages3 = await puppeteerService.getLatestInstagramPostsFromAccount('bienvivreatours', 3);
  DATA.img7 = instagramImages3[0];
  DATA.img8 = instagramImages3[1];
  DATA.img9 = instagramImages3[2];
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  /**
   * Fetch Weather
   */
  await setWeatherInformation();

  /**
   * Get pictures
   */
  await setInstagramPosts();

  /**
   * Generate README
   */
  await generateReadMe();

  /**
   * Fermeture de la boutique 👋
   */
  await puppeteerService.close();
}

action();
