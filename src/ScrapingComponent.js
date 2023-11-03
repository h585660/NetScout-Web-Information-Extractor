import React, { useState } from 'react';
import axios from 'axios';

const ScrapingComponent = () => {
    const [url, setUrl] = useState('');
    const [scrapedText, setScrapedText] = useState('');
    const [scrapedLinkText, setScrapedLinkedText] = useState('');
    const [scrapedJSText, setScrapedJSText] = useState('');

    const handleStaticScrape = async () => {
        try {
            const response = await axios.post('http://localhost:3001/scrape-static', { url, selector: 'p' });
            setScrapedText(response.data.textData);
            setScrapedLinkedText(response.data.linkData);
        } catch (error) {
            console.error('Error scraping static data:', error);
        }
    };


    const handleDynamicScrape = async () => {
        try {
            const response = await axios.post('http://localhost:3001/scrape-dynamic', { url, selector: 'p'});
            setScrapedJSText(response.data.data);
        } catch (error) {
            console.error('Error scraping dynamic data:', error);
        }

    };
            
            


    return (
        <div>
        <input
            type="text"
            style={{backgroundColor: '#282c34', color: 'white', border: 'none', outline: 'none'}}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Feed URL..."
        />
        <button onClick={handleStaticScrape}>Scrape Text</button>
        <button onClick={handleDynamicScrape}>Scrape JS text</button>

        


        <div>
            
            {scrapedLinkText && (
            
            <textarea
            
                style={{backgroundColor: '#282c34', color: 'red', border: 'none', outline: 'none'}}
                value={scrapedLinkText}
                readOnly
                rows={30}
                cols={50}
            />
            
            )}
        

            {scrapedText && (
            
            <textarea
                style={{backgroundColor: '#282c34', color: 'white', border: 'none', outline: 'none'}}
                value={scrapedText}
                readOnly
                rows={30}
                cols={100}
            />

            )}

            {scrapedJSText && (
            
            <textarea
                style={{backgroundColor: '#282c34', color: 'white', border: 'none', outline: 'none'}}
                value={scrapedJSText}
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
