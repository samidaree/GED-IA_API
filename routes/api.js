const express = require("express");

const { generateSummary } = require("../controllers/openAiController");

const { generateKeys } = require("../controllers/openAiController");
const { saveDatabase } = require("../controllers/openAiController")

const router = express.Router();

router.post("/text", generateSummary)
router.post("/key", generateKeys)
router.post("/db", saveDatabase)


module.exports = router; 