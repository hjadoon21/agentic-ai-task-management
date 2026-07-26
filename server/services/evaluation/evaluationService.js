// This service is responsible for evaluating the performance of AI providers on a dataset of student queries. It validates input parameters, retrieves dataset samples, runs analyses using multiple providers, collects results, and computes various metrics such as accuracy, precision, recall, and F1 scores. The evaluation results include detailed provider metrics, confusion matrices, and classification metrics.
const datasetService = require(
    "../dataset/datasetService"
);

const aiOrchestrator = require(
    "../ai/aiOrchestrator"
);

const supportedProviderNames = new Set([
    "openai",
    "gemini",
    "deepseek",
]);

const priorityLabels = [
    "High",
    "Medium",
    "Low",
];

// Validates the sample size for the evaluation. It ensures that the sample size is an integer between 1 and 10, throwing an error if the validation fails.
function validateSampleSize(value) {
    const sampleSize = Number(value);

    if (
        !Number.isInteger(sampleSize) ||
        sampleSize < 1 ||
        sampleSize > 10
    ) {
        const error = new Error(
            "Evaluation sample size must be an integer between 1 and 10."
        );

        error.statusCode = 400;
        throw error;
    }

    return sampleSize;
}

// Validates the offset for the evaluation. It ensures that the offset is a non-negative integer, throwing an error if the validation fails.
function validateOffset(value) {
    const offset = Number(value);

    if (
        !Number.isInteger(offset) ||
        offset < 0
    ) {
        const error = new Error(
            "Evaluation offset must be a non-negative integer."
        );

        error.statusCode = 400;
        throw error;
    }

    return offset;
}

// Validates the list of provider names for the evaluation. It checks that the input is a non-empty array of known providers, throwing an error for unknown providers or invalid input.
function validateProviders(providerNames) {
    if (
        !Array.isArray(providerNames) ||
        providerNames.length === 0
    ) {
        const error = new Error(
            "Select at least one provider for evaluation."
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedProviders = [
        ...new Set(
            providerNames.map((providerName) =>
                String(providerName)
                    .trim()
                    .toLowerCase()
            )
        ),
    ];

    const unknownProviders =
        normalizedProviders.filter(
            (providerName) =>
                !supportedProviderNames.has(
                    providerName
                )
        );

    if (unknownProviders.length > 0) {
        const error = new Error(
            `Unknown AI provider(s): ${unknownProviders.join(", ")}`
        );

        error.statusCode = 400;
        throw error;
    }

    return normalizedProviders;
}

// Creates an accumulator object for tracking metrics related to a specific AI provider during the evaluation. It initializes counts for attempted, successful, and failed analyses, as well as accumulators for confidence, response times, predictions, and failures.
function createProviderAccumulator(providerName) {
    return {
        provider: providerName,
        attemptedCount: 0,
        successfulCount: 0,
        failedCount: 0,
        correctCount: 0,
        totalConfidence: 0,
        totalResponseTimeMs: 0,
        predictions: [],
        failures: [],
    };
}

// Updates the accumulator with metrics from a successful provider result. It increments the successful count, checks for correct predictions, accumulates confidence and response time, and records the prediction details.
function updateSuccessfulProviderMetrics(
    accumulator,
    datasetRow,
    providerResult
) {
    accumulator.successfulCount += 1;

    if (
        providerResult.priority ===
        datasetRow.actualPriority
    ) {
        accumulator.correctCount += 1;
    }

    accumulator.totalConfidence +=
        providerResult.confidence;

    accumulator.totalResponseTimeMs +=
        providerResult.responseTimeMs;

    accumulator.predictions.push({
        queryId: datasetRow.queryId,
        studentQuery:
            datasetRow.studentQuery,
        actualPriority:
            datasetRow.actualPriority,
        predictedPriority:
            providerResult.priority,
        category:
            providerResult.category,
        confidence:
            providerResult.confidence,
        responseTimeMs:
            providerResult.responseTimeMs,
        reasoningSummary:
            providerResult.reasoningSummary,
    });
}

// Updates the accumulator with metrics from a failed provider result. It increments the failed count and records the failure details, including the query ID, student query, actual priority, and error message.
function updateFailedProviderMetrics(
    accumulator,
    datasetRow,
    providerResult
) {
    accumulator.failedCount += 1;

    accumulator.failures.push({
        queryId: datasetRow.queryId,
        studentQuery:
            datasetRow.studentQuery,
        actualPriority:
            datasetRow.actualPriority,
        error:
            providerResult.error ||
            "Provider evaluation failed.",
    });
}

// Rounds a number to the specified number of decimal places. It uses a multiplier to shift the decimal point, rounds the value, and then shifts it back to achieve the desired precision.
function roundNumber(value, decimalPlaces = 2) {
    const multiplier =
        10 ** decimalPlaces;

    return (
        Math.round(value * multiplier) /
        multiplier
    );
}

// Creates a confusion matrix for the evaluation, initializing counts for true positives, false positives, false negatives, and true negatives for each priority label (High, Medium, Low).
function createConfusionMatrix() {
    return {
        High: {
            High: 0,
            Medium: 0,
            Low: 0,
        },
        Medium: {
            High: 0,
            Medium: 0,
            Low: 0,
        },
        Low: {
            High: 0,
            Medium: 0,
            Low: 0,
        },
    };
}

// Builds a confusion matrix from the predictions made by the AI providers. It iterates through each prediction, updating the counts in the confusion matrix based on the actual and predicted priority labels.
function buildConfusionMatrix(predictions) {
    const matrix = createConfusionMatrix();

    for (const prediction of predictions) {
        const actual = prediction.actualPriority;
        const predicted = prediction.predictedPriority;

        if (
            matrix[actual] &&
            Object.hasOwn(matrix[actual], predicted)
        ) {
            matrix[actual][predicted] += 1;
        }
    }

    return matrix;
}

// Calculates metrics for a specific priority class based on the confusion matrix. It computes true positives, false positives, false negatives, true negatives, precision, recall, F1 score, and support for the given priority label.
function calculateClassMetrics(
    confusionMatrix,
    priority
) {
    const truePositive =
        confusionMatrix[priority][priority];

    let falsePositive = 0;
    let falseNegative = 0;

    for (const label of priorityLabels) {
        if (label !== priority) {
            falsePositive +=
                confusionMatrix[label][priority];

            falseNegative +=
                confusionMatrix[priority][label];
        }
    }

    let trueNegative = 0;

    for (const actualLabel of priorityLabels) {
        for (
            const predictedLabel of priorityLabels
        ) {
            if (
                actualLabel !== priority &&
                predictedLabel !== priority
            ) {
                trueNegative +=
                    confusionMatrix[actualLabel][
                        predictedLabel
                    ];
            }
        }
    }

    const precisionDenominator =
        truePositive + falsePositive;

    const recallDenominator =
        truePositive + falseNegative;

    const precision =
        precisionDenominator > 0
            ? truePositive /
              precisionDenominator
            : 0;

    const recall =
        recallDenominator > 0
            ? truePositive /
              recallDenominator
            : 0;

    const f1 =
        precision + recall > 0
            ? (2 * precision * recall) /
              (precision + recall)
            : 0;

    const support =
        truePositive + falseNegative;

    return {
        priority,
        truePositive,
        falsePositive,
        falseNegative,
        trueNegative,
        support,

        precision: roundNumber(
            precision,
            4
        ),

        precisionPercentage: roundNumber(
            precision * 100,
            2
        ),

        recall: roundNumber(
            recall,
            4
        ),

        recallPercentage: roundNumber(
            recall * 100,
            2
        ),

        f1: roundNumber(
            f1,
            4
        ),

        f1Percentage: roundNumber(
            f1 * 100,
            2
        ),
    };
}

// Calculates macro-averaged classification metrics across all priority classes based on the confusion matrix. It computes the average precision, recall, and F1 score, as well as their percentage representations.
function calculateClassificationMetrics(
    confusionMatrix
) {
    const perClass = priorityLabels.map(
        (priority) =>
            calculateClassMetrics(
                confusionMatrix,
                priority
            )
    );

    const macroPrecision =
        perClass.reduce(
            (sum, metrics) =>
                sum + metrics.precision,
            0
        ) / perClass.length;

    const macroRecall =
        perClass.reduce(
            (sum, metrics) =>
                sum + metrics.recall,
            0
        ) / perClass.length;

    const macroF1 =
        perClass.reduce(
            (sum, metrics) =>
                sum + metrics.f1,
            0
        ) / perClass.length;

    return {
        labels: priorityLabels,
        perClass,

        macroPrecision: roundNumber(
            macroPrecision,
            4
        ),

        macroPrecisionPercentage:
            roundNumber(
                macroPrecision * 100,
                2
            ),

        macroRecall: roundNumber(
            macroRecall,
            4
        ),

        macroRecallPercentage:
            roundNumber(
                macroRecall * 100,
                2
            ),

        macroF1: roundNumber(
            macroF1,
            4
        ),

        macroF1Percentage:
            roundNumber(
                macroF1 * 100,
                2
            ),
    };
}

// Finalizes the provider metrics by calculating accuracy, success rate, average confidence, average response time, confusion matrix, and classification metrics based on the accumulated data. It returns a structured object containing all relevant metrics for the provider.
function finalizeProviderMetrics(accumulator) {
    const accuracy =
        accumulator.successfulCount > 0
            ? accumulator.correctCount /
              accumulator.successfulCount
            : 0;

    const successRate =
        accumulator.attemptedCount > 0
            ? accumulator.successfulCount /
              accumulator.attemptedCount
            : 0;

    const averageConfidence =
        accumulator.successfulCount > 0
            ? accumulator.totalConfidence /
              accumulator.successfulCount
            : 0;

    const averageResponseTimeMs =
        accumulator.successfulCount > 0
            ? accumulator.totalResponseTimeMs /
              accumulator.successfulCount
            : 0;

    const confusionMatrix =
        buildConfusionMatrix(
            accumulator.predictions
        );

    const classificationMetrics =
        calculateClassificationMetrics(
            confusionMatrix
        );

    return {
        provider: accumulator.provider,
        attemptedCount:
            accumulator.attemptedCount,
        successfulCount:
            accumulator.successfulCount,
        failedCount:
            accumulator.failedCount,
        correctCount:
            accumulator.correctCount,

        accuracy: roundNumber(
            accuracy,
            4
        ),

        accuracyPercentage: roundNumber(
            accuracy * 100,
            2
        ),

        successRate: roundNumber(
            successRate,
            4
        ),

        successRatePercentage: roundNumber(
            successRate * 100,
            2
        ),

        averageConfidence: roundNumber(
            averageConfidence,
            4
        ),

        averageConfidencePercentage:
            roundNumber(
                averageConfidence * 100,
                2
            ),

        averageResponseTimeMs:
            roundNumber(
                averageResponseTimeMs,
                2
            ),

        confusionMatrix,
        classificationMetrics,

        predictions:
            accumulator.predictions,

        failures:
            accumulator.failures,
    };
}

// Runs the evaluation process for the specified dataset split, sample size, offset, and selected providers. It retrieves a sample of dataset rows, processes each row with the selected providers, collects results, and computes metrics for each provider. The function returns a comprehensive evaluation report including configuration details, dataset statistics, provider metrics, and individual record results.
async function runEvaluation({
    split = "test",
    sampleSize = 5,
    offset = 0,
    providers = ["openai"],
} = {}) {
    const validatedSampleSize =
        validateSampleSize(sampleSize);

    const validatedOffset =
        validateOffset(offset);

    const validatedProviders =
        validateProviders(providers);

    const sampleResult =
        await datasetService.getDatasetSample({
            split,
            size: validatedSampleSize,
            offset: validatedOffset,
        });

    if (sampleResult.data.length === 0) {
        const error = new Error(
            "No dataset rows were available for the requested evaluation range."
        );

        error.statusCode = 400;
        throw error;
    }

    const providerMetrics = new Map();

    for (const providerName of validatedProviders) {
        providerMetrics.set(
            providerName,
            createProviderAccumulator(
                providerName
            )
        );
    }

    const recordResults = [];

    /*
     * Dataset records are intentionally processed
     * sequentially to reduce the chance of provider
     * rate-limit errors.
     */
    for (const datasetRow of sampleResult.data) {
        for (
            const providerName of validatedProviders
        ) {
            providerMetrics.get(
                providerName
            ).attemptedCount += 1;
        }

        try {
            const analysisResult =
                await aiOrchestrator.analyzeTask(
                    {
                        studentQuery:
                            datasetRow.studentQuery,
                        department:
                            datasetRow.department,
                        daysToDeadline:
                            datasetRow.daysToDeadline,
                    },
                    validatedProviders
                );

            for (
                const providerResult of
                analysisResult.providerResults
            ) {
                const normalizedProviderName =
                    providerResult.provider
                        .trim()
                        .toLowerCase();

                const accumulator =
                    providerMetrics.get(
                        normalizedProviderName
                    );

                if (!accumulator) {
                    continue;
                }

                if (providerResult.success) {
                    updateSuccessfulProviderMetrics(
                        accumulator,
                        datasetRow,
                        providerResult
                    );
                } else {
                    updateFailedProviderMetrics(
                        accumulator,
                        datasetRow,
                        providerResult
                    );
                }
            }

            recordResults.push({
                queryId: datasetRow.queryId,
                studentQuery:
                    datasetRow.studentQuery,
                department:
                    datasetRow.department,
                daysToDeadline:
                    datasetRow.daysToDeadline,
                actualPriority:
                    datasetRow.actualPriority,
                providerResults:
                    analysisResult.providerResults,
                consensus:
                    analysisResult.consensus,
            });
        } catch (error) {
            /*
             * This normally means every selected
             * provider failed for the record.
             */
            const failedProviderResults =
                Array.isArray(
                    error.providerResults
                )
                    ? error.providerResults
                    : [];

            for (
                const providerName of
                validatedProviders
            ) {
                const accumulator =
                    providerMetrics.get(
                        providerName
                    );

                const matchingFailure =
                    failedProviderResults.find(
                        (result) =>
                            result.provider
                                ?.trim()
                                .toLowerCase() ===
                            providerName
                    );

                updateFailedProviderMetrics(
                    accumulator,
                    datasetRow,
                    matchingFailure || {
                        error:
                            error.message ||
                            "All providers failed.",
                    }
                );
            }

            recordResults.push({
                queryId: datasetRow.queryId,
                studentQuery:
                    datasetRow.studentQuery,
                department:
                    datasetRow.department,
                daysToDeadline:
                    datasetRow.daysToDeadline,
                actualPriority:
                    datasetRow.actualPriority,
                providerResults:
                    failedProviderResults,
                consensus: null,
                error:
                    error.message ||
                    "Evaluation failed for this record.",
            });
        }
    }

    const metrics = Array.from(
        providerMetrics.values()
    ).map(finalizeProviderMetrics);

    return {
        configuration: {
            split:
                sampleResult.split,
            sampleSize:
                sampleResult.returnedCount,
            offset:
                sampleResult.offset,
            selectedProviders:
                validatedProviders,
        },

        dataset: {
            totalRows:
                sampleResult.totalRows,
            evaluatedRows:
                sampleResult.returnedCount,
            hasMore:
                sampleResult.hasMore,
        },

        providerMetrics: metrics,
        recordResults,
        completedAt: new Date(),
    };
}

module.exports = {
    runEvaluation,
};