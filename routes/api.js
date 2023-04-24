const express = require("express");

const { generateSummary } = require("../controllers/openAiController");

const { generateKeys } = require("../controllers/openAiController");

const router = express.Router();

router.post("/text", generateSummary)
router.post("/key", generateKeys)

module.exports = router; 