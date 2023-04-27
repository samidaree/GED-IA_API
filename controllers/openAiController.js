
const mysql = require('mysql');

/**
 * Saves data to a MySQL Database
 * @async 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 

**/

const saveDatabase = async (req, res) => {
    const name = mysql.escape(req.body.name);
    const resumeStr = req.body.summary;
    const motscleStr = req.body.keywords;

    console.log("resume " + resumeStr);
    console.log("keywords " + motscleStr)

    const connection = mysql.createConnection({
        host: 'localhost',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'database'
    });

    try {
        // First, check if a tuple with the given name already exists
        connection.query(
            `SELECT id FROM ged WHERE nom = ${name}`,
            (error, results) => {
                if (error) {
                    res.status(500).send("Error connection database");
                    throw error;

                }
                // If a tuple with the given name exists, update it
                if (results.length > 0) {
                    const id = results[0].id;
                    connection.query(
                        `UPDATE ged SET resume = ${mysql.escape(resumeStr)}, motscle = ${mysql.escape(motscleStr)} WHERE id = '${id}'`,
                        (error, results) => {
                            if (error) throw error;
                            console.log(`Updated tuple with id = ${id}`);
                            connection.end();
                            res.status(200).send("Tuple updated successfully");
                        }
                    );
                }
                // Otherwise, create a new tuple with the next available id
                else {
                    connection.query(
                        `SELECT MAX(id) as max_id FROM ged`,
                        (error, results) => {
                            if (error) throw error;

                            const nextId = results.length > 0 ? results[0].max_id + 1 : 1;

                            connection.query(
                                `INSERT INTO ged (id, nom, resume, motscle) VALUES (${nextId}, ${name}, ${mysql.escape(resumeStr)}, ${mysql.escape(motscleStr)})`,
                                (error, results) => {
                                    if (error) throw error;
                                    console.log(`Created new tuple with id = ${nextId}`);
                                    connection.end();
                                    res.status(200).send("Tuple created successfully");
                                }
                            );
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send("Database operation failed");
    }
};

/**
 * Generates a summary article per artcile using OpenAI's GPT-3
 * @async 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 

**/

const generateSummary = async (req, res) => {

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
        apiKey: req.body.key
    })

    const openai = new OpenAIApi(configuration)
    const articleData = req.body.articleData;

    const name = mysql.escape(req.body.name);
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

/**
 * Generates keywords article per artcile using OpenAI's GPT-3
 * @async 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 

**/
const generateKeys = async (req, res) => {
    const api_key = req.body.key

    const { Configuration, OpenAIApi } = require("openai");

    const configuration = new Configuration({
        apiKey: api_key
    })

    const openai = new OpenAIApi(configuration)
    console.log("Fonction mots clés");
    const articleData = req.body.articleData;
    const name = mysql.escape(req.body.name);

    const keywords = {};
    let prompt = req.body.prompt
    console.log("API key " + api_key);
    console.log(" Prompt " + prompt);


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
    generateKeys,
    saveDatabase
}