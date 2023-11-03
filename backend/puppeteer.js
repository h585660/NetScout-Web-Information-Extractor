//handles dynamic javascript text if present

const puppeteer = require('puppeteer');

class PuppeteerScraper {
    static async scrape(url, selector) {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2'});
            const data = await page.$$eval(selector, elements => elements.map(el => el.innerText));
            await browser.close();
            return data.join('\n\n');
        } catch (error) {
            console.error('error during scraping:', error);
            return '';
        }
        }

    }

module.exports = PuppeteerScraper;


