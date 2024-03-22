const mysql = require('mysql')
const OpenAI = require('openai')

/**
 * Saves data to a MySQL Database
 * @async 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 

**/

const saveDatabase = async (req, res) => {
  const name = mysql.escape(req.body.name)
  const resumeStr = req.body.summary
  const motscleStr = req.body.keywords
  console.log('🚀 ~ saveDatabase ~ motscleStr:', motscleStr)

  console.log('resume ' + resumeStr)
  console.log('keywords ' + motscleStr)

  const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'ged',
  })

  try {
    // First, check if a tuple with the given name already exists
    connection.query(
      `SELECT id FROM ged WHERE nom = ${name}`,
      (error, results) => {
        if (error) {
          res.status(500).send('Error connection database')
          throw error
        }
        // If a tuple with the given name exists, update it
        if (results.length > 0) {
          const id = results[0].id
          connection.query(
            `UPDATE ged SET resume = ${mysql.escape(
              resumeStr,
            )}, motscle = ${mysql.escape(motscleStr)} WHERE id = '${id}'`,
            (error, results) => {
              if (error) throw error
              console.log(`Updated tuple with id = ${id}`)
              connection.end()
              res.status(200).send('Tuple updated successfully')
            },
          )
        }
        // Otherwise, create a new tuple with the next available id
        else {
          connection.query(
            `SELECT MAX(id) as max_id FROM ged`,
            (error, results) => {
              if (error) throw error

              const nextId = results.length > 0 ? results[0].max_id + 1 : 1

              connection.query(
                `INSERT INTO ged (id, nom, resume, motscle) VALUES (${nextId}, ${name}, ${mysql.escape(
                  resumeStr,
                )}, ${mysql.escape(motscleStr)})`,
                (error, results) => {
                  if (error) throw error
                  console.log(`Created new tuple with id = ${nextId}`)
                  connection.end()
                  res.status(200).send('Tuple created successfully')
                },
              )
            },
          )
        }
      },
    )
  } catch (error) {
    console.error(error)
    res.status(500).send('Database operation failed')
  }
}

/**
 * Generates a summary article per artcile using OpenAI's GPT-3
 * @async 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 

**/

const generateSummary = async (req, res) => {
  const api_key = req.body.key
  console.log('🚀 ~ generateSummary ~ api_key:', api_key)
  const openai = new OpenAI({
    apiKey: api_key,
  })
  const articleData = req.body.articleData

  const name = mysql.escape(req.body.name)
  const summary = {}

  for (const key in articleData) {
    if (articleData.hasOwnProperty(key)) {
      const article = articleData[key]
      try {
        const prompt = "Fait un resumé de 4 lignes de l'article suivant :"
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'system', content: prompt + article.content }],
          model: 'gpt-3.5-turbo',
        })

        keywords[`\n\n Résumé de l'article ${article.title} \n `] =
          completion.choices[0].message.content
      } catch (error) {
        if (error.code == 'invalid_api_key') {
          console.log('Invalid API key')
          return res.status(401).json({ error: 'Invalid API key' })
        } else {
          summary[`\n \n L'article ${article.title} `] = 'est trop long'
          console.log(error)
        }
        //console.log(`L'article ${article.title} est trop long`);
      }
    }
  }

  res.json({ summary: summary })
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
  console.log('🚀 ~ generateKeys ~ api_key:', api_key)
  const openai = new OpenAI({
    apiKey: api_key,
  })

  console.log('Fonction mots clés')
  const articleData = req.body.articleData
  console.log('🚀 ~ generateKeys ~ articleData:', articleData)
  const name = mysql.escape(req.body.name)

  const keywords = {}
  let prompt = req.body.prompt
  console.log('API key ' + api_key)
  console.log(' Prompt ' + prompt)

  if (prompt.trim().length == 0) {
    prompt = 'Donne moi les mots clés du texte suivant '
  }

  for (const key in articleData) {
    if (articleData.hasOwnProperty(key)) {
      const article = articleData[key]
      try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: 'system', content: prompt + article.content }],
          model: 'gpt-3.5-turbo',
        })
        console.log('🚀 ~ generateKeys ~ completion:', completion)

        keywords[`\n\nMots clé de l'article ${article.title} \n `] =
          completion.choices[0].message.content
      } catch (error) {
        if (error.code == 'invalid_api_key') {
          console.log('Invalid API key')
          return res.status(401).json({ error: 'Invalid API key' })
        } else {
          console.log(error)
          //console.log(`L'article ${article.title} est trop long`);
          // Handle article too long error
          keywords[`\n \n L'article ${article.title} `] = 'est trop long'
        }
      }
    }
  }

  res.json({ keywords: keywords })
}

module.exports = {
  generateSummary,
  generateKeys,
  saveDatabase,
}
