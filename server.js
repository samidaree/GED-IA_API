const express = require("express");
const app = express();
const multer = require('multer');
const cors = require("cors");

require("dotenv").config()

const routes = require("./routes/api")

const port = process.env.PORT

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/openai", routes)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

app.post('/upload-file', upload.single('file'), (req, res) => {
    try {
        const fileData = req.file;

        console.log('Received file:', fileData);

        if (!fileData) {
            throw new Error('No file uploaded!');
        }

        res.send('File uploaded successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Upload failed!');
    }
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})