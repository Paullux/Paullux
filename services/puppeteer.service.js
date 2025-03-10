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
      headless: true,
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
        waitUntil: 'domcontentloaded',
        timeout: 30000, // Augmente le temps d'attente pour éviter les échecs
      });

    } catch (error) {
      console.error(`Erreur lors de la navigation vers ${url} :`, error);
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
      await this.page.waitForTimeout(2000);

      // Vérification si le contenu s'affiche bien
      const htmlContent = await this.page.content();
      console.log(htmlContent); // Debugging pour voir si Instagram charge bien

      // Capture d'écran pour debug
      await this.page.screenshot({ path: 'debug.png' });

      const nodes = await this.page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).map(img => img.src).slice(0, 3);
      });

      return nodes.length > 0 ? nodes : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des posts Instagram :', error);
      return [];
    }
  }
}

const puppeteerService = new PuppeteerService();
module.exports = puppeteerService;
