// Displays a card summarizing the evaluation metrics for a specific AI provider
function formatPercentage(value) {
    if (typeof value !== "number") {
        return "N/A";
    }

    return `${value.toFixed(2)}%`;
}

// Formats a response time in milliseconds to a string in seconds with two decimal places
function formatResponseTime(milliseconds) {
    if (typeof milliseconds !== "number") {
        return "N/A";
    }

    return `${(milliseconds / 1000).toFixed(2)} s`;
}

// Formats a provider identifier to a human-readable name
function formatProviderName(provider) {
    const providerNames = {
        openai: "OpenAI",
        gemini: "Gemini",
        deepseek: "DeepSeek",
    };

    return providerNames[provider] || provider;
}

// Displays a card summarizing the evaluation metrics for a specific AI provider
function ProviderMetricCard({ metrics }) {
    const classificationMetrics =
        metrics.classificationMetrics || {};

    return (
        <article className="evaluation-provider-card">
            <header className="evaluation-provider-card-header">
                <div>
                    <p className="eyebrow">
                        Provider Results
                    </p>

                    <h3>
                        {formatProviderName(
                            metrics.provider
                        )}
                    </h3>
                </div>

                <span className="evaluation-accuracy-badge">
                    {formatPercentage(
                        metrics.accuracyPercentage
                    )}{" "}
                    accuracy
                </span>
            </header>

            <div className="evaluation-metric-grid">
                <div className="evaluation-metric">
                    <span>Accuracy</span>

                    <strong>
                        {formatPercentage(
                            metrics.accuracyPercentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Macro precision</span>

                    <strong>
                        {formatPercentage(
                            classificationMetrics
                                .macroPrecisionPercentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Macro recall</span>

                    <strong>
                        {formatPercentage(
                            classificationMetrics
                                .macroRecallPercentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Macro F1</span>

                    <strong>
                        {formatPercentage(
                            classificationMetrics
                                .macroF1Percentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Average confidence</span>

                    <strong>
                        {formatPercentage(
                            metrics.averageConfidencePercentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Average response</span>

                    <strong>
                        {formatResponseTime(
                            metrics.averageResponseTimeMs
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Success rate</span>

                    <strong>
                        {formatPercentage(
                            metrics.successRatePercentage
                        )}
                    </strong>
                </div>

                <div className="evaluation-metric">
                    <span>Correct predictions</span>

                    <strong>
                        {metrics.correctCount} /{" "}
                        {metrics.successfulCount}
                    </strong>
                </div>
            </div>

            <dl className="evaluation-provider-counts">
                <div>
                    <dt>Attempted</dt>
                    <dd>{metrics.attemptedCount}</dd>
                </div>

                <div>
                    <dt>Successful</dt>
                    <dd>{metrics.successfulCount}</dd>
                </div>

                <div>
                    <dt>Failed</dt>
                    <dd>{metrics.failedCount}</dd>
                </div>
            </dl>
        </article>
    );
}

export default ProviderMetricCard;