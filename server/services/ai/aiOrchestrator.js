// This service orchestrates the analysis of tasks using multiple AI providers. It handles provider resolution, parallel execution of analysis requests, and consensus building from the results.
const openaiProvider = require("./providers/openaiProvider");
const geminiProvider = require("./providers/geminiProvider");
const deepseekProvider = require("./providers/deepseekProvider");
const consensusService = require("./consensusService");

const providerRegistry = {
    openai: openaiProvider,
    gemini: geminiProvider,
    deepseek: deepseekProvider,
};

const defaultProviderNames = Object.keys(providerRegistry);

// Resolves the list of provider names to their corresponding provider implementations. If no provider names are provided, it defaults to using all registered providers. It validates the input and throws an error for unknown providers.
function resolveProviders(providerNames) {
    if (providerNames === undefined) {
        return defaultProviderNames.map(
            (providerName) => providerRegistry[providerName]
        );
    }

    if (
        !Array.isArray(providerNames) ||
        providerNames.length === 0
    ) {
        const error = new Error(
            "providers must be a non-empty array."
        );

        error.statusCode = 400;
        throw error;
    }

    const normalizedNames = providerNames.map((name) =>
        String(name).trim().toLowerCase()
    );

    const uniqueNames = [...new Set(normalizedNames)];

    const unknownNames = uniqueNames.filter(
        (name) => !providerRegistry[name]
    );

    if (unknownNames.length > 0) {
        const error = new Error(
            `Unknown AI provider(s): ${unknownNames.join(", ")}`
        );

        error.statusCode = 400;
        throw error;
    }

    return uniqueNames.map(
        (providerName) => providerRegistry[providerName]
    );
}

// Runs the analysis for a single provider and task. It measures the response time, logs the results, and returns a structured result object indicating success or failure along with relevant metadata.
async function runProvider(provider, task) {
    const providerName =
        provider.name || "Unknown Provider";

    const startTime = Date.now();

    console.log("\n----------------------------------------");
    console.log(`[${providerName}]`);
    console.log("Sending request...");

    try {
        const result = await provider.analyze(task);

        const responseTime =
            Date.now() - startTime;

        console.log(
            `✓ Response received (${responseTime} ms)`
        );
        console.log(
            `Priority: ${result.priority ?? "N/A"}`
        );
        console.log(
            `Category: ${result.category ?? "N/A"}`
        );
        console.log(
            `Confidence: ${result.confidence ?? "N/A"}`
        );

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        const responseTime =
            Date.now() - startTime;

        console.log(
            `✗ Request failed (${responseTime} ms)`
        );
        console.log(
            `Error: ${
                error.message ||
                "Provider analysis failed."
            }`
        );

        return {
            success: false,
            provider: providerName,
            error:
                error.message ||
                "Provider analysis failed.",
        };
    }
}

// Analyzes a task using the specified AI providers. It resolves the providers, runs their analysis in parallel, collects the results, and builds a consensus from the successful analyses. It returns a comprehensive result object containing provider results, consensus data, and counts of successful and failed analyses.
async function analyzeTask(task, providerNames) {
    const providers = resolveProviders(providerNames);

    console.log("\n========================================");
    console.log("Starting AI Analysis");
    console.log("========================================");
    console.log(
        `Selected providers: ${providers
            .map((provider) => provider.name)
            .join(", ")}`
    );

    const providerPromises = providers.map((provider) =>
        runProvider(provider, task)
    );

    const providerResults = await Promise.all(
        providerPromises
    );

    const successfulResults = providerResults.filter(
        (result) => result.success
    );

    const failedResults = providerResults.filter(
        (result) => !result.success
    );

    if (successfulResults.length === 0) {
        const error = new Error(
            "All selected AI providers failed to analyze the task."
        );

        error.statusCode = 502;
        error.providerResults = providerResults;

        throw error;
    }

    const consensus = consensusService.buildConsensus(
        successfulResults
    );

    console.log("\nGenerating consensus...");
    console.log("✓ Consensus complete");
    console.log(
        `Priority: ${consensus.priority ?? "N/A"}`
    );
    console.log(
        `Category: ${consensus.category ?? "N/A"}`
    );
    console.log(
        `Agreement: ${
            consensus.agreementCount ?? "N/A"
        }/${consensus.totalProviders ?? "N/A"}`
    );
    console.log("========================================");
    console.log("AI Analysis Finished");
    console.log("========================================\n");

    return {
        providerResults,
        successfulResults,
        failedResults,
        consensus,
        selectedProviders: providers.map(
            (provider) => provider.name
        ),
        successfulProviderCount:
            successfulResults.length,
        failedProviderCount: failedResults.length,
        totalProviderCount: providerResults.length,
    };
}

module.exports = {
    analyzeTask,
};