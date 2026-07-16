const datasetService = require(
    "../services/dataset/datasetService"
);
const evaluationService = require(
    "../services/evaluation/evaluationService"
);

async function getDatasetSummary(req, res, next) {
    try {
        const split = req.query.split || "test";

        const summary =
            await datasetService.getDatasetSummary(
                split
            );

        return res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        next(error);
    }
}

async function getDatasetSample(req, res, next) {
    try {
        const result =
            await datasetService.getDatasetSample({
                split: req.query.split || "test",
                size: req.query.size || 10,
                offset: req.query.offset || 0,
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

async function runEvaluation(req, res, next) {
    try {
        const result =
            await evaluationService.runEvaluation({
                split:
                    req.body?.split ||
                    "test",

                sampleSize:
                    req.body?.sampleSize ??
                    5,

                offset:
                    req.body?.offset ??
                    0,

                providers:
                    req.body?.providers ||
                    ["openai"],
            });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDatasetSummary,
    getDatasetSample,
    runEvaluation,
};