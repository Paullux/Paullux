const puppeteer = require('puppeteer');

class PuppeteerService {
  browser;
  page;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true, // Mode headless activé pour plus de discrétion
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--incognito',
        '--disable-blink-features=AutomationControlled', // Moins détectable par Instagram
      ],
    });
  }

  async goToPage(url) {
    try {
      if (!this.browser) {
        await this.init();
      }
      this.page = await this.browser.newPage();

      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR',
      });

      // Empêche la détection de Puppeteer par Instagram
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000, // Augmente le temps d'attente pour éviter les erreurs de chargement
      });

    } catch (error) {
      console.error(`Erreur lors de la navigation vers ${url} :`, error);
    }
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async getLatestInstagramPostsFromAccount(username, count = 3) {
    try {
      const url = `https://www.instagram.com/${username}/`;
      await this.goToPage(url);
      await this.page.waitForTimeout(3000); // Temps d'attente pour le chargement des images

      // Vérification si le contenu est bien chargé
      const htmlContent = await this.page.content();
      console.log(`HTML de ${username} chargé.`);

      // Extraction des images du profil public
      const images = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map(img => img.src)
          .slice(0, 3); // On récupère les 3 premières images visibles
      });

      if (images.length === 0) {
        console.warn(`Aucune image trouvée pour ${username}.`);
      }

      return images;
    } catch (error) {
      console.error(`Erreur lors de la récupération des posts Instagram de ${username} :`, error);
      return [];
    }
  }
}

const puppeteerService = new PuppeteerService();
module.exports = puppeteerService;
