// This file defines the routes for evaluation-related operations in the application. It sets up an Express router and defines GET routes for retrieving dataset summary and sample, as well as a POST route for running an evaluation. The routes are linked to the corresponding methods in the evaluationController, which handle the logic for each operation.
const express = require("express");

const evaluationController = require(
    "../controllers/evaluationController"
);

const router = express.Router();

router.get(
    "/summary",
    evaluationController.getDatasetSummary
);

router.get(
    "/sample",
    evaluationController.getDatasetSample
);

router.post(
    "/run",
    evaluationController.runEvaluation
);

module.exports = router;