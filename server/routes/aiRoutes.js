const express = require("express");
const aiController = require("../controllers/aiController");

const router = express.Router();

router.post(
    "/analyze/:taskId",
    aiController.analyzeTask
);

module.exports = router;