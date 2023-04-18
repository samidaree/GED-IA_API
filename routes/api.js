const express = require("express");

const { generateSummary } = require("../controllers/openAiController");

const router = express.Router();

router.post("/file", generateSummary)

module.exports = router; 