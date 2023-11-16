//fullt chatGPT produsert funksjon for fremtidig testing

require('dotenv').config();
const { OpenAIApi } = require('openai');

const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });

async function testGPT() {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "Translate the following English text to French: 'Hello, world!'",
            max_tokens: 60,
        });
        console.log(response.data.choices[0].text.trim());
    } catch (error) {
        console.error('Error with OpenAI request:', error);
    }
}

testGPT();
