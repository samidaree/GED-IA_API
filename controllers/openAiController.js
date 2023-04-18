
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const generateSummary = async (req, res) => {
    console.log("generate summary");
}

module.exports = {
    generateSummary,
}