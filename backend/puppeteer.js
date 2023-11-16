//håndterer javascript og HTML basert tekst
//håndterer lenke bevegelse på første angitt URL

const puppeteer = require('puppeteer');



class PuppeteerScraper {
    static defaultTimeout = 20000;



    static async scrapeLinks(url, timeout = PuppeteerScraper.defaultTimeout) {
        let browser;
        try {  
            console.log(`Launching browser for URL: ${url}`);
            browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
            console.log(`Browser launched. Opening new page.`);
            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(timeout);
            console.log(`Going to URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2'});

            const links = await page.evaluate(() => {
                const urls = new Set(); //forsøk på å holde til første angitt domene

                // samler href lenker
                document.querySelectorAll('link[href]').forEach(link => {
                    urls.add(link.href);
                });

                // samle flere urls
                document.querySelectorAll('meta[content]').forEach(meta => {
                    const urlRegex = /^(https?:\/\/|www\.)/;
                    if (urlRegex.test(meta.content)) {
                        urls.add(meta.content);
                    }
                });

                // samle flere urls
                document.querySelectorAll('a[href]').forEach(anchor => {
                    const href = anchor.href;
                    if (href.startsWith('http')) {
                        urls.add(href);
                    }
                });

                return Array.from(urls); // samler lenker til liste
            });

            console.log(`Links evaluated. Found:`, links.length, 'links'); //printer lenker funnet
            return links.slice(0, 2); // lav grense for å unngå GPT limit for øyeblikket, men for scraping funksjon kan denne settes ubegrenset
        } catch (error) {
            console.error('Error during scraping links:', error.message); 
            throw new Error('Error during scraping links');
        } finally {

            if (browser) {
                console.log(`Closing browser`); //søk på side gjennomført
                await browser.close();
            }
        }
    }

    //selve tekst samlingen, konsoll logger for å vise prosess, også begrensing på effektivitet pga mulig domenebegrensning
    static async scrape(url, selector, timeout = PuppeteerScraper.defaultTimeout) {
        let browser;
        try {
            console.log(`Launching browser for URL: ${url}`);
            browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();

            page.setDefaultNavigationTimeout(timeout);

            console.log(`Going to URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2'});

            console.log(`Page loaded. Evaluating content for selector: ${selector}`);
            const data = await page.$$eval(selector, elements =>
                elements.map(el => (el.innerText || '').trim())
            );
            
            //returnerer samlet data fra lenke til terminal
            console.log(`Content evaluated, Extracted data:`, data);
            return data.join('\n\n');
        } catch (error) {
            console.error('Error during scraping:', error, error.stack);
            throw new Error('Error during scraping');
        } finally {

            if (browser) {
                console.log(`Closing browser`);
                await browser.close();
            }
        }
    }

}



module.exports = PuppeteerScraper;

    // startfunksjon som indikerer at server åpner og fungerer på lenke
    PuppeteerScraper.scrapeLinks('https://www.example.com').then(links => {
        console.log(links);
    }).catch(error => {
        console.error('An error occurred:', error);
    });