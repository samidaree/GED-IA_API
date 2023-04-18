const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.API_KEY
})

const openai = new OpenAIApi(configuration)

const generateSummary = async (req, res) => {
    console.log("text");
    const { prompt } = req.body;
    console.log(prompt);

}

module.exports = { generateSummary }; 