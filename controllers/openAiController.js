


const generateSummary = async (req, res) => {

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
        apiKey: req.body.key
    })

    const openai = new OpenAIApi(configuration)
    const articleData = req.body.articleData;
    //console.log("recu : " + articleData);

    /*const prompt = "fait un résumé de 5 lignes du texte suivant : ";
    try {
        const response = await openai.createCompletion({

            model: "text-davinci-003",
            prompt: "donne moi un fait psychologique interessant",
            temperature: 0.5,
            max_tokens: 500,
            top_p: 1.0,
            frequency_penalty: 0.8,
            presence_penalty: 0.0,
        });
        console.log(response.data.choices);
        console.log(response.data.choices[0].text)

    } catch (error) {
        console.log(error)
    } */

    const summary = {};

    for (const key in articleData) {
        if (articleData.hasOwnProperty(key)) {
            const article = articleData[key];
            try {
                const response = await openai.createCompletion({

                    model: "text-davinci-003",
                    prompt: "fait un résumé de 4 lignes du texte suivant" + article.content,
                    temperature: 0.5,
                    max_tokens: 500,
                    top_p: 1.0,
                    frequency_penalty: 0.8,
                    presence_penalty: 0.0,
                });
                summary[`\n\nRésumé de l'article ${article.title} \n `] = response.data.choices[0].text;
            }
            catch (error) {
                if (error.response && error.response.status === 401) {
                    console.log("Invalid API key");
                    return res.status(401).json({ error: "Invalid API key" });
                } else {

                    summary[`\n \n L'article ${article.title} `] = "est trop long"
                    console.log(error);
                }
                //console.log(`L'article ${article.title} est trop long`);
            }
        }
    }


    res.json({ summary: summary });
}


const generateKeys = async (req, res) => {
    const api_key = req.body.key

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
        apiKey: api_key
    })

    const openai = new OpenAIApi(configuration)
    console.log("Fonction mots clés");
    const articleData = req.body.articleData;

    const keywords = {};
    let prompt = req.body.prompt
    console.log("API key " + api_key);
    console.log(" Prompt " + prompt);

    /*if (key.trim().length == 0) {
        throw new Error("Invalid API key");
    }*/
    if (prompt.trim().length == 0) {
        prompt = "Donne moi les mots clés du texte suivant "
    }

    for (const key in articleData) {
        if (articleData.hasOwnProperty(key)) {
            const article = articleData[key];
            try {
                const response = await openai.createCompletion({

                    model: "text-davinci-003",
                    prompt: prompt + article.content,
                    temperature: 0.5,
                    max_tokens: 500,
                    top_p: 1.0,
                    frequency_penalty: 0.8,
                    presence_penalty: 0.0,
                });
                keywords[`\n\nMots clé de l'article ${article.title} \n `] = response.data.choices[0].text;
            }
            catch (error) {
                if (error.response && error.response.status === 401) {
                    console.log("Invalid API key");
                    return res.status(401).json({ error: "Invalid API key" });
                } else {
                    console.log(error);
                    //console.log(`L'article ${article.title} est trop long`);
                    // Handle article too long error
                    keywords[`\n \n L'article ${article.title} `] = "est trop long"
                }

            }
        }
    }
    res.json({ keywords: keywords });
}

module.exports = {
    generateSummary,
    generateKeys
}