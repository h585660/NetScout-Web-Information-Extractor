const express = require('express');
const app = express();
const cors = require('cors');
const PuppeteerScraper = require('./puppeteer');
//const cheerioScraper = require('./cheerioScraper'); //Ikke lenger i bruk, kan implementeres igjen fremtidig, så fjernes ikke

//integrerer openAI
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: '...'}); //key må flyttes til .env fil for bruk


//GPT kall med samlet informasjon
async function askGPT(question) {
    console.log('chatGPT called with request:', question);
    try {
        const completion = await openai.completions.create({
            model: "gpt-3.5-turbo",
            prompt: question,
            max_tokens: 2000,
        });
        return completion.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error asking GPT:', error);
        throw error;
    }
}

//bruker local PORT
const PORT = process.env.PORT || 3001;

/* 
!!!
Er stor bruk av console.log, kan virke overkant men er for øyeblikket nødvendig for feilsøking
!!! 
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//localhost REACT kjøres på PORT 3000, node.js server på 3001
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

//Scrape av javascript basert informasjon og gjør til tekstbasert
app.post('/scrape-dynamic', async (req, res) => {
    const { url, selector} = req.body;
    try {
        let scrapedData = await PuppeteerScraper.scrape(url, selector);
        if (Array.isArray(scrapedData)) {
            scrapedData = scrapedData.filter(data => data !== '');
        }
    const textDataArray = scrapedData.map(data => JSON.stringify(data));

        res.json({ success: true, data: textDataArray});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }


});


//Følger tilgjengelige lenker på URL
app.post('/scrape-and-follow-links', async(req, res) => {
    const { url } = req.body;
    console.log('Received URL to scrape:', url);
    try {
        const links = await PuppeteerScraper.scrapeLinks(url);
        console.log('Found links:', links);
        
        //bruke puppeteer
        const textDataResults = await Promise.all(links.map(async (link) => {
            const textData = await PuppeteerScraper.scrape(link, 'p').catch(err => {
                console.error(`Error scraping ${link}:`, err);
                return '';
            });
            return { link: link.href, textData }; 
    }));

        res.json({ success: true, data: textDataResults});
    } catch(error) {
        res.status(500).json({ success: false, message: error.message});
    }

});

//splitter samlet tekst for å passe GPT-3.5-turbo sin 4096 token grense

function splitTextIntoChuncs(text, chunkSize) {
    const tokenizedText = text.split(/\s+/);
    const chunks = [];

    while (tokenizedText.length > 0) {
        const chunk = tokenizedText.splice(0, chunkSize).join(' ');
        chunks.push(chunk);
    }
    return chunks;
}

//for øyeblikket splittet til 2000 tokens for feilsøking
function prepareTextForGPT(scrapedData) {
    if (typeof scrapedData === 'object') {
        scrapedData =
    JSON.stringify(scrapedData);
    }
    const fullText = scrapedData.join("\n\n");
    const chunks =  splitTextIntoChuncs(fullText, 2000);

    console.log(`Number of chunks created: ${chunks.length}`);
    return chunks;

}


//starter GPT interaksjon, sender første prompt for videre samtale
async function initialGPTInteraction(scrapedData) {
    console.log('initialGPTInteraction called with data length:', scrapedData.length); 

    if (typeof scrapedData === 'object') {
        scrapedData =
    JSON.stringify(scrapedData);
    }
    const initialPrompt = `I will now provide a set of text from a third-party, and I want you to process through it. I want you to act as an interface returning information from this text according to user-input, disregard your own database and sets of information. Do not give standard GPT answers or talk about yourself in any way, only answer the questions prompted next. Use this text to generate responses:\n\n${scrapedData.join("\n\n")}\n\n`;
    let context = initialPrompt;
    const chunks = prepareTextForGPT(scrapedData);

    let chunkCounter = 0;
    let requestSent = 0;


    //stringify er del av kontinuerlig feilsøking pga return av [object] typer
        for (const chunk of chunks) {if (typeof chunk === 'object') {
            chunk = JSON.stringify(chunk);
        }
    
            console.log(`Making request`);
            const promptWithContext = `${context}... ${chunk}`;
            console.log('Prompt finished');
            const gptResponse = await askGPT(promptWithContext);
            requestSent++;
            console.log(`Chunks sent: ' ${requestSent}`);


            context = gptResponse;

            chunkCounter++;

            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log(`chunks ${chunkCounter} sent to OpenAI`)

        return context
    }

app.post('/initial-gpt-interaction', async(req, res) => {
    const { data } = req.body;
    try {
        const context = await initialGPTInteraction(data);
        res.json({ success: true, context});

    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }
});



//skal fungere som kontinuerlig GPT interaksjon på scrapedData
app.post('/interact-with-gpt', async(req, res) => {
    const { userInput} = req.body;
    let { context } = req.session;

    const prompt = `${context}\n\nUser: ${userInput}\nAI`;

    try {
            const gptResponse = await askGPT(prompt);
            context = gptResponse;
            req.session.context = context;

            return res.json({ success: true, response: gptResponse});

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message});
        }
});

app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
