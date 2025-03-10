const puppeteer = require('puppeteer');

class PuppeteerService {
  browser;
  page;

  async init() {
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--incognito',
      ],
      headless: true, // On peut mettre false pour du debugging
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

      await this.page.goto(url, {
        waitUntil: 'networkidle2', // Attendre que le site soit bien chargé
        timeout: 30000,
      });

    } catch (error) {
      console.error(`❌ Erreur lors de la navigation vers ${url} :`, error);
    }
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async getLatestInstagramPostsFromAccount(acc, n = 3) {
    try {
      const page = `https://www.instagram.com/${acc}/`;

      await this.goToPage(page);
      await this.page.waitForTimeout(3000); // Attendre un peu après le chargement

      // Debugging : Vérification du HTML
      const htmlContent = await this.page.content();
      console.log(`📜 HTML de ${acc} chargé.`);

      // Capture d’écran pour débogage (activer si besoin)
      // await this.page.screenshot({ path: `debug-${acc}.png` });

      const nodes = await this.page.evaluate(() => {
        // Sélecteur mis à jour pour trouver les images sur Instagram
        const images = document.querySelectorAll('article img');
        return Array.from(images).map(img => img.src).slice(0, 3);
      });

      return nodes.length > 0 ? nodes : [];
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des posts Instagram de ${acc} :`, error);
      return [];
    }
  }
}

const puppeteerService = new PuppeteerService();
module.exports = puppeteerService;
