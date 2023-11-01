import React, { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';

const ScrapingComponent = () => {
    const [url, setUrl] = useState('');
    const [scrapedText, setScrapedText] = useState('');

    const handleScrape = async () => {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const scrapedData = $('p').text();

            setScrapedText(scrapedData);

            saveTextToFile(scrapedData);
        } catch (error) {
            console.error('Error scraping data:',error);
        }

        };

    const saveTextToFile = (text) => {
        const blob = new Blob([text], { type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scraped_data.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
        <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
        />
        <button onClick={handleScrape}>Scrape Text</button>
        <div>
            {scrapedText && (
            <textarea
                style={{backgroundColor: '#282c34', color: 'white', border: 'none', outline: 'none'}}
                value={scrapedText}
                readOnly
                rows={30}
                cols={100}
            />
            )}
        </div>
        </div>
        );
    };
    
    export default ScrapingComponent;
