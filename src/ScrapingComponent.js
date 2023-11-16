import React, { useState } from 'react';
import axios from 'axios';

const ScrapingComponent = () => {
    const [url, setUrl] = useState('');
    const [scrapedPages, setScrapedPages] = useState([]);
    const [showChatInterface, setShowChatInterface] = useState(false);

//input URL søking
    const handleScrapeAndFollowLinks = async () => {
        try {
            const response = await axios.post('http://localhost:3001/scrape-and-follow-links', { url });
            if (Array.isArray(response.data.data)) {
                setScrapedPages(response.data.data);

                const gptResponse = await axios.post('http://localhost:3001/initial-gpt-interaction', { data: response.data.data});
                const initialContext = gptResponse.data.context;
                setShowChatInterface(true);
            } else {
                console.error('Unexpected response format:', response.data);
            }

        }catch (error) {
            console.error('Error scraping and following links:', error);
        }
        console.log('Finished action');
    };


//fremtidig interface for chatGPT/scrapedData
const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    
    const sendMessage = async () => {
        const newUserMessage = { type: 'user', text: userInput};
        setMessages([...messages, newUserMessage]);

        try {
            const response = await axios.post('http://localhost:3001/interact-with-gpt', { userInput});
            const gptMessage = { type: 'gpt', text: response.data.response};
            setMessages(prevMessages => [...prevMessages, gptMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setUserInput('');
    };

    return (
        <div>
            <div className="chat-window">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        {message.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message"
                />
            <button onClick={sendMessage}>send</button>
        </div>
    );
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
        <button onClick={handleScrapeAndFollowLinks}>Scrape links</button>


        <div>

            {scrapedPages.map((page, index) => (
                <div key={ index }>
                    <a href={page.link} target="_blank" rel="noopener noreferrer" style={{ color: 'blue'}}>
                        {page.linkText || page.link}
                    </a>
                    <textarea
                        style={{ backgroundColor: '#282c32', color: 'white', border: 'none', outline: 'none'}}
                        value={page.textData}
                        readOnly
                        rows={10}
                        cols={50}
                    />
                </div>
            ))}
            {showChatInterface && <ChatInterface />}
        </div>
    </div>

    );
            };



export default ScrapingComponent;