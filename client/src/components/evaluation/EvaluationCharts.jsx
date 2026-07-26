// Formats the provider name for display
function formatProviderName(provider) {
    const names = {
        openai: "OpenAI",
        gemini: "Gemini",
        deepseek: "DeepSeek",
    };

    return names[provider] || provider;
}

// Clamps a numeric value to the range [0, 100]
function clampPercentage(value) {
    if (typeof value !== "number") {
        return 0;
    }

    return Math.min(Math.max(value, 0), 100);
}

// Calculates the maximum average response time from a list of provider metrics
function getMaximumResponseTime(providerMetrics) {
    if (providerMetrics.length === 0) {
        return 0;
    }

    return Math.max(
        ...providerMetrics.map(
            (metrics) =>
                metrics.averageResponseTimeMs || 0
        )
    );
}

// Displays a percentage-based chart for a given metric across providers
function PercentageChart({
    title,
    description,
    providerMetrics,
    getValue,
}) {
    return (
        <article className="evaluation-chart-card">
            <header>
                <h4>{title}</h4>
                <p>{description}</p>
            </header>

            <div className="chart-list">
                {providerMetrics.map((metrics) => {
                    const value = clampPercentage(
                        getValue(metrics)
                    );

                    return (
                        <div
                            className="chart-row"
                            key={`${title}-${metrics.provider}`}
                        >
                            <div className="chart-row-heading">
                                <span>
                                    {formatProviderName(
                                        metrics.provider
                                    )}
                                </span>

                                <strong>
                                    {value.toFixed(2)}%
                                </strong>
                            </div>

                            <div
                                className="chart-track"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={Math.round(
                                    value
                                )}
                                aria-label={`${formatProviderName(
                                    metrics.provider
                                )} ${title}`}
                            >
                                <div
                                    className="chart-bar"
                                    style={{
                                        width: `${value}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </article>
    );
}

// Displays a chart of average response times for each provider
function ResponseTimeChart({ providerMetrics }) {
    const maximumResponseTime =
        getMaximumResponseTime(providerMetrics);

    return (
        <article className="evaluation-chart-card">
            <header>
                <h4>Average Response Time</h4>

                <p>
                    Shorter bars represent faster average
                    provider performance.
                </p>
            </header>

            <div className="chart-list">
                {providerMetrics.map((metrics) => {
                    const responseTime =
                        metrics.averageResponseTimeMs || 0;

                    const width =
                        maximumResponseTime > 0
                            ? (responseTime /
                                  maximumResponseTime) *
                              100
                            : 0;

                    return (
                        <div
                            className="chart-row"
                            key={`response-${metrics.provider}`}
                        >
                            <div className="chart-row-heading">
                                <span>
                                    {formatProviderName(
                                        metrics.provider
                                    )}
                                </span>

                                <strong>
                                    {(
                                        responseTime / 1000
                                    ).toFixed(2)}{" "}
                                    s
                                </strong>
                            </div>

                            <div
                                className="chart-track"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={Math.round(
                                    width
                                )}
                                aria-label={`${formatProviderName(
                                    metrics.provider
                                )} relative response time`}
                            >
                                <div
                                    className="chart-bar chart-bar-response"
                                    style={{
                                        width: `${width}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="chart-note">
                Response-time bars are scaled relative to
                the slowest provider in this evaluation.
            </p>
        </article>
    );
}

// Displays a set of evaluation charts for multiple providers
function EvaluationCharts({ providerMetrics }) {
    if (
        !Array.isArray(providerMetrics) ||
        providerMetrics.length === 0
    ) {
        return null;
    }

    return (
        <section className="comparison-section">
            <div className="section-title">
                <div>
                    <p className="eyebrow">
                        Visual Analytics
                    </p>

                    <h3>Provider Performance Charts</h3>
                </div>
            </div>

            <div className="evaluation-chart-grid">
                <PercentageChart
                    title="Accuracy"
                    description="Percentage of successful predictions matching the dataset label."
                    providerMetrics={providerMetrics}
                    getValue={(metrics) =>
                        metrics.accuracyPercentage
                    }
                />

                <PercentageChart
                    title="Macro F1"
                    description="Balanced summary of precision and recall across all priority classes."
                    providerMetrics={providerMetrics}
                    getValue={(metrics) =>
                        metrics.classificationMetrics
                            ?.macroF1Percentage || 0
                    }
                />

                <PercentageChart
                    title="Average Confidence"
                    description="Average confidence reported by each provider."
                    providerMetrics={providerMetrics}
                    getValue={(metrics) =>
                        metrics.averageConfidencePercentage
                    }
                />

                <PercentageChart
                    title="Success Rate"
                    description="Percentage of attempted requests completed successfully."
                    providerMetrics={providerMetrics}
                    getValue={(metrics) =>
                        metrics.successRatePercentage
                    }
                />

                <ResponseTimeChart
                    providerMetrics={providerMetrics}
                />
            </div>
        </section>
    );
}

export default EvaluationCharts;