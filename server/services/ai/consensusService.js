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

function roundNumber(value, decimalPlaces = 2) {
    const multiplier = 10 ** decimalPlaces;
    return Math.round(value * multiplier) / multiplier;
}

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