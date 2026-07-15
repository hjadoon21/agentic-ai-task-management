const openaiProvider = require("./providers/openaiProvider");
const geminiProvider = require("./providers/geminiProvider");
const deepseekProvider = require("./providers/deepseekProvider");
const consensusService = require("./consensusService");

const defaultProviders = [
    openaiProvider,
    geminiProvider,
    deepseekProvider,
];

async function runProvider(provider, task) {
    try {
        const result = await provider.analyze(task);

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        return {
            success: false,
            provider: provider.name,
            error: error.message || "Provider analysis failed.",
        };
    }
}

async function analyzeTask(task, providers = defaultProviders) {
    if (!Array.isArray(providers) || providers.length === 0) {
        throw new Error("At least one AI provider is required.");
    }

    const providerPromises = providers.map((provider) =>
        runProvider(provider, task)
    );

    const providerResults = await Promise.all(providerPromises);

    const successfulResults = providerResults.filter(
        (result) => result.success
    );

    const failedResults = providerResults.filter(
        (result) => !result.success
    );

    if (successfulResults.length === 0) {
        const error = new Error(
            "All configured AI providers failed to analyze the task."
        );

        error.statusCode = 502;
        error.providerResults = providerResults;

        throw error;
    }

    const consensus = consensusService.buildConsensus(
        successfulResults
    );

    return {
        providerResults,
        successfulResults,
        failedResults,
        consensus,
        successfulProviderCount: successfulResults.length,
        failedProviderCount: failedResults.length,
        totalProviderCount: providerResults.length,
    };
}

module.exports = {
    analyzeTask,
};