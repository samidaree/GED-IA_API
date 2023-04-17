const express = require("express");

const { generateSummary } = require("../controllers/openaiControllers");

const router = express.Router();

router.post("/summary", generateSummary)

module.exports = router;