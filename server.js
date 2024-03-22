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



app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})