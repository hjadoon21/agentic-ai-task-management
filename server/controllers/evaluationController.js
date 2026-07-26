const datasetService = require(
    "../services/dataset/datasetService"
);
const evaluationService = require(
    "../services/evaluation/evaluationService"
);

// This function retrieves a summary of the dataset for a specified split (e.g., "train", "test", "validation"). It calls the datasetService to get the summary and returns it in the response.
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

// This function retrieves a sample of the dataset for a specified split (e.g., "train", "test", "validation"), size, and offset. It calls the datasetService to get the sample and returns it in the response.
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

// This function runs an evaluation of AI providers on a dataset based on the specified parameters (split, sample size, offset, and providers). It calls the evaluationService to perform the evaluation and returns the results in the response.
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