// This file defines the routes for AI-related operations in the application. It sets up an Express router and defines a POST route for analyzing a task based on its ID. The route is linked to the analyzeTask method in the aiController, which handles the logic for analyzing the task using AI.
const express = require("express");
const aiController = require("../controllers/aiController");

const router = express.Router();

router.post(
    "/analyze/:taskId",
    aiController.analyzeTask
);

module.exports = router;