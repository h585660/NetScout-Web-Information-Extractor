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

            console.log("URL received:", url);
            console.log("Text Data:", textData);
            console.log("Link Data:", linkData);
            return { textData, linkData};

            

        } catch (error) {
            console.error('Error during static scraping', error);
            throw error;
        }


    }
    


}
module.exports = cheerioScraper;