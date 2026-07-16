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
            error:
                error.message ||
                "Provider analysis failed.",
        };
    }
}

async function analyzeTask(task, providerNames) {
    const providers = resolveProviders(providerNames);

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