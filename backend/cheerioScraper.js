const cheerio = require('cheerio');
const axios = require('axios');

class cheerioScraper {
    static async scrape(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            let textData = '';
            let linkData = '';

            $('p').each(function () {
                textData += $(this).text() + '\n\n';

            });

            $('a').each(function() {
                linkData += $(this).text() + ' ( ' + $(this).attr('href') + ')\n';

            });

            //logging for fail-checking
            console.log("URL received:", url);
            console.log("Text Data:", textData);
            console.log("Link Data:", linkData);
            return { textData, linkData};

            

        } catch (error) {
            console.error('Error during static scraping', error);
            throw error;
        }


    }

    //finding additional links to loop through
    static async scrapeLinks(url) {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            //gather inside an empty list
            let links = [];
            $('a').each(function () {
                const href = $(this).attr('href');
                if (links.length < 5 && href && href.startsWith('http')) {
                    links.push(href);
                }
            });
            return links;
        }catch (error) {
            console.error('Error gathering links', error);
            throw error;
        }

        }
    }
    



module.exports = cheerioScraper;