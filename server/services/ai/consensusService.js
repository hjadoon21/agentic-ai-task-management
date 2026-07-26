// This service is responsible for building a consensus from the results of multiple AI providers. It analyzes the results to determine the most common values for priority and category, calculates average confidence, and identifies the fastest and slowest providers based on response times.
function getMostCommonValue(results, fieldName) {
    const counts = new Map();

    for (const result of results) {
        const value = result[fieldName];

        counts.set(value, (counts.get(value) || 0) + 1);
    }

    let selectedValue = null;
    let selectedCount = 0;

    for (const [value, count] of counts.entries()) {
        if (count > selectedCount) {
            selectedValue = value;
            selectedCount = count;
        }
    }

    return {
        value: selectedValue,
        count: selectedCount,
    };
}

// Rounds a number to the specified number of decimal places. It uses a multiplier to shift the decimal point, rounds the value, and then shifts it back to achieve the desired precision.
function roundNumber(value, decimalPlaces = 2) {
    const multiplier = 10 ** decimalPlaces;
    return Math.round(value * multiplier) / multiplier;
}

// Resolves ties in priority votes by considering the average confidence of tied priorities. If there is a single tied priority, it returns that value. If multiple priorities are tied, it calculates the average confidence for each tied priority and selects the one with the highest average confidence.
function resolvePriorityTie(results, vote) {
    const tiedPriorities = [];

    const priorityCounts = results.reduce((counts, result) => {
        counts[result.priority] =
            (counts[result.priority] || 0) + 1;

        return counts;
    }, {});

    for (const [priority, count] of Object.entries(
        priorityCounts
    )) {
        if (count === vote.count) {
            tiedPriorities.push(priority);
        }
    }

    if (tiedPriorities.length === 1) {
        return vote.value;
    }

    const confidenceByPriority = tiedPriorities.map(
        (priority) => {
            const matchingResults = results.filter(
                (result) => result.priority === priority
            );

            const totalConfidence = matchingResults.reduce(
                (sum, result) => sum + result.confidence,
                0
            );

            return {
                priority,
                averageConfidence:
                    totalConfidence / matchingResults.length,
            };
        }
    );

    confidenceByPriority.sort(
        (first, second) =>
            second.averageConfidence -
            first.averageConfidence
    );

    return confidenceByPriority[0].priority;
}

// Builds a consensus from the results of multiple AI providers. It determines the most common priority and category, calculates average confidence, computes agreement percentage, and identifies the fastest and slowest providers based on response times. The function returns a structured object containing the consensus data.
function buildConsensus(successfulResults) {
    if (
        !Array.isArray(successfulResults) ||
        successfulResults.length === 0
    ) {
        throw new Error(
            "At least one successful provider result is required."
        );
    }

    const priorityVote = getMostCommonValue(
        successfulResults,
        "priority"
    );

    const consensusPriority = resolvePriorityTie(
    successfulResults,
    priorityVote
);

    const categoryVote = getMostCommonValue(
        successfulResults,
        "category"
    );

    const totalConfidence = successfulResults.reduce(
        (sum, result) => sum + result.confidence,
        0
    );

    const averageConfidence =
        totalConfidence / successfulResults.length;

    const agreementPercentage =
        (priorityVote.count / successfulResults.length) * 100;

    const sortedByResponseTime = [...successfulResults].sort(
        (first, second) =>
            first.responseTimeMs - second.responseTimeMs
    );

    const fastestResult = sortedByResponseTime[0];
    const slowestResult =
        sortedByResponseTime[sortedByResponseTime.length - 1];

    return {
        priority: consensusPriority,
        category: categoryVote.value,
        confidence: roundNumber(averageConfidence, 2),
        agreementCount: priorityVote.count,
        totalProviders: successfulResults.length,
        agreementPercentage: roundNumber(
            agreementPercentage,
            1
        ),
        fastestProvider: fastestResult.provider,
        fastestResponseTimeMs: fastestResult.responseTimeMs,
        slowestProvider: slowestResult.provider,
        slowestResponseTimeMs: slowestResult.responseTimeMs,
    };
}

module.exports = {
    buildConsensus,
};