const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const instagramService = require('./services/instagram.service');

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
  const accounts = {
    toursvaldeloiretourisme: process.env.INSTAGRAM_USER_ID_1,
    villedetours: process.env.INSTAGRAM_USER_ID_2,
    bienvivreatours: process.env.INSTAGRAM_USER_ID_3,
  };

  for (const [username, userId] of Object.entries(accounts)) {
    const images = await instagramService.getLatestInstagramPosts(userId);
    if (images.length > 0) {
      DATA[`img_${username}_1`] = images[0] || '';
      DATA[`img_${username}_2`] = images[1] || '';
      DATA[`img_${username}_3`] = images[2] || '';
    }
  }
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  await setInstagramPosts();
  await generateReadMe();
}

action();
