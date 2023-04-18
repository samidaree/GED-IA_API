const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config()

const routes = require("./routes/api");

const port = process.env.PORT

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/openai", routes)

app.get("/test", (req, res) => {
    res.send("<h1> Hello</h1>")
})

app.post('/upload-text', (req, res) => {
    try {

        console.log("text recu " + req.body["text"]);

        res.send('Text uploaded successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Upload failed!');
    }
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})