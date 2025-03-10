const puppeteer = require('puppeteer');

class PuppeteerService {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    if (!this.browser) {
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
        headless: true,
      });
    }
  }

  async goToPage(url) {
    try {
      await this.init();
      this.page = await this.browser.newPage();

      await this.page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR' });
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000, // Augmente le timeout pour éviter les erreurs de chargement
      });

    } catch (error) {
      console.error(`❌ Erreur lors de la navigation vers ${url} :`, error);
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getLatestInstagramPostsFromAccount(acc, n = 3) {
    try {
      const pageUrl = `https://www.instagram.com/${acc}/`;
      await this.goToPage(pageUrl);
      await this.page.waitForTimeout(3000); // Attente pour éviter les restrictions

      // Capture d'écran pour debugging
      await this.page.screenshot({ path: `debug_${acc}.png` });

      const images = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .map(img => img.src)
          .slice(0, 3);
      });

      return images.length > 0 ? images : [];

    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des posts Instagram de ${acc} :`, error);
      return [];
    }
  }
}

module.exports = new PuppeteerService();

