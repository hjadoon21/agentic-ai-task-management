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