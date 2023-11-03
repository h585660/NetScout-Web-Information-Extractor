const express = require('express');
const app = express();
const cors = require('cors');
const PuppeteerScraper = require('./puppeteer');



const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors({ origin: 'http://localhost:3000'}));

app.post('/scrape-static', async(req, res) => {
    const { url } = req.body;
    try {
        const { textData, linkData } = await cheerioScraper.scrape(url);
        res.json({ textData, linkData});
    } catch (error) {
        res.status(500).send(error.message);
    }

});

app.post('/scrape-dynamic', async (req, res) => {
    const { url, selector} = req.body;
    try {
        const scrapedData = await PuppeteerScraper.scrape(url, selector);
        res.json({ success: true, data: scrapedData});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }


});

app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
