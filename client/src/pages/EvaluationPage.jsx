import {
    useEffect,
    useState,
} from "react";

import DatasetSummaryCards from "../components/evaluation/DatasetSummaryCards";
import EvaluationControls from "../components/evaluation/EvaluationControls";
import ProviderMetricCard from "../components/evaluation/ProviderMetricCard";
import ConfusionMatrix from "../components/evaluation/ConfusionMatrix";
import ClassificationMetricsTable from "../components/evaluation/ClassificationMetricsTable";
import EvaluationCharts from "../components/evaluation/EvaluationCharts";

import {
    getDatasetSummary,
    runEvaluation,
} from "../services/evaluationService";

const EVALUATION_PROVIDERS_STORAGE_KEY =
    "evaluationSelectedProviders";

function formatProviderName(provider) {
    const providerNames = {
        openai: "OpenAI",
        gemini: "Gemini",
        deepseek: "DeepSeek",
    };

    return providerNames[provider] || provider;
}

function getInitialEvaluationProviders() {
    const savedProviders =
        localStorage.getItem(
            EVALUATION_PROVIDERS_STORAGE_KEY
        );

    if (!savedProviders) {
        /*
         * Defaulting to OpenAI only avoids accidentally
         * making multiple paid calls during development.
         */
        return ["openai"];
    }

    try {
        const parsedProviders =
            JSON.parse(savedProviders);

        if (
            Array.isArray(parsedProviders) &&
            parsedProviders.length > 0
        ) {
            return parsedProviders;
        }
    } catch {
        // Fall back to OpenAI below.
    }

    return ["openai"];
}

function EvaluationPage() {
    const [trainSummary, setTrainSummary] =
        useState(null);

    const [testSummary, setTestSummary] =
        useState(null);

    const [loadingSummaries, setLoadingSummaries] =
        useState(true);

    const [split, setSplit] =
        useState("test");

    const [sampleSize, setSampleSize] =
        useState(5);

    const [offset, setOffset] =
        useState(0);

    const [
        selectedProviders,
        setSelectedProviders,
    ] = useState(
        getInitialEvaluationProviders
    );

    const [running, setRunning] =
        useState(false);

    const [evaluationResult, setEvaluationResult] =
        useState(null);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            getDatasetSummary("train"),
            getDatasetSummary("test"),
        ])
            .then(
                ([
                    loadedTrainSummary,
                    loadedTestSummary,
                ]) => {
                    if (cancelled) {
                        return;
                    }

                    setTrainSummary(
                        loadedTrainSummary
                    );

                    setTestSummary(
                        loadedTestSummary
                    );
                }
            )
            .catch((requestError) => {
                if (!cancelled) {
                    setError(
                        requestError.response?.data
                            ?.error ||
                            "Dataset summaries could not be loaded."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingSummaries(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function handleProvidersChange(providers) {
        setSelectedProviders(providers);

        localStorage.setItem(
            EVALUATION_PROVIDERS_STORAGE_KEY,
            JSON.stringify(providers)
        );
    }

    async function handleRunEvaluation() {
        if (selectedProviders.length === 0) {
            setError(
                "Select at least one provider before running an evaluation."
            );

            return;
        }

        try {
            setRunning(true);
            setError("");
            setSuccessMessage("");
            setEvaluationResult(null);

            const result = await runEvaluation({
                split,
                sampleSize,
                offset,
                providers:
                    selectedProviders,
            });

            setEvaluationResult(result);

            setSuccessMessage(
                `Evaluation completed for ${result.dataset.evaluatedRows} dataset record(s) using ${result.configuration.selectedProviders.length} provider(s).`
            );
        } catch (requestError) {
            console.error(
                "Evaluation request failed:",
                requestError
            );

            setError(
                requestError.response?.data?.error ||
                    requestError.message ||
                    "The evaluation could not be completed."
            );
        } finally {
            setRunning(false);
        }
    }

    return (
        <main className="page-container">
            <header className="page-heading">
                <p className="eyebrow">
                    Dataset Testing
                </p>

                <h2>Model Evaluation</h2>

                <p>
                    Evaluate OpenAI, Gemini, and
                    DeepSeek against ground-truth
                    priority labels from the university
                    query dataset.
                </p>
            </header>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {successMessage && (
                <p className="success-message">
                    {successMessage}
                </p>
            )}

            <DatasetSummaryCards
                trainSummary={trainSummary}
                testSummary={testSummary}
                loading={loadingSummaries}
            />

            <EvaluationControls
                split={split}
                sampleSize={sampleSize}
                offset={offset}
                selectedProviders={
                    selectedProviders
                }
                running={running}
                onSplitChange={setSplit}
                onSampleSizeChange={
                    setSampleSize
                }
                onOffsetChange={setOffset}
                onProvidersChange={
                    handleProvidersChange
                }
                onRun={handleRunEvaluation}
            />

            {running && (
                <section className="panel evaluation-running-panel">
                    <div className="evaluation-spinner" />

                    <div>
                        <h3>
                            Evaluation in progress
                        </h3>

                        <p>
                            Dataset records are processed
                            sequentially to reduce provider
                            rate-limit errors. This may take
                            several minutes.
                        </p>
                    </div>
                </section>
            )}

            {!running && evaluationResult && (
    <>
        <section className="panel evaluation-complete-panel">
            <p className="eyebrow">
                Latest Run
            </p>

            <h3>Evaluation completed</h3>

            <div className="evaluation-run-summary">
                <p>
                    <strong>Split:</strong>{" "}
                    {
                        evaluationResult
                            .configuration.split
                    }
                </p>

                <p>
                    <strong>
                        Evaluated rows:
                    </strong>{" "}
                    {
                        evaluationResult.dataset
                            .evaluatedRows
                    }
                </p>

                <p>
                    <strong>Offset:</strong>{" "}
                    {
                        evaluationResult
                            .configuration.offset
                    }
                </p>

                <p>
                    <strong>Providers:</strong>{" "}
                    {evaluationResult.configuration
                        .selectedProviders
                        .map(formatProviderName)
                        .join(", ")}
                </p>

                <p>
                    <strong>Completed:</strong>{" "}
                    {new Date(
                        evaluationResult.completedAt
                    ).toLocaleString()}
                </p>
            </div>
        </section>

        <section className="comparison-section">
            <div className="section-title">
                <div>
                    <p className="eyebrow">
                        Overall Performance
                    </p>

                    <h3>Provider Metrics</h3>
                </div>
            </div>

            <div className="evaluation-provider-grid">
                {evaluationResult.providerMetrics.map(
                    (metrics) => (
                        <ProviderMetricCard
                            key={metrics.provider}
                            metrics={metrics}
                        />
                    )
                )}
            </div>
        </section>

        <EvaluationCharts
            providerMetrics={
                evaluationResult.providerMetrics
            }
        />

        <section className="comparison-section">
            <div className="section-title">
                <div>
                    <p className="eyebrow">
                        Detailed Evaluation
                    </p>

                    <h3>
                        Confusion Matrices and
                        Class Metrics
                    </h3>
                </div>
            </div>

            <div className="evaluation-details-list">
                {evaluationResult.providerMetrics.map(
                    (metrics) => {
                        const providerName =
                            formatProviderName(
                                metrics.provider
                            );

                        return (
                            <article
                                className="evaluation-provider-details"
                                key={`details-${metrics.provider}`}
                            >
                                <header className="evaluation-provider-details-heading">
                                    <h3>
                                        {providerName}
                                    </h3>

                                    <span>
                                        {
                                            metrics.successfulCount
                                        }{" "}
                                        successful prediction(s)
                                    </span>
                                </header>

                                <div className="evaluation-detail-grid">
                                    <ConfusionMatrix
                                        provider={
                                            providerName
                                        }
                                        matrix={
                                            metrics.confusionMatrix
                                        }
                                    />

                                    <ClassificationMetricsTable
                                        provider={
                                            providerName
                                        }
                                        classificationMetrics={
                                            metrics.classificationMetrics
                                        }
                                    />
                                </div>

                                {metrics.failures?.length >
                                    0 && (
                                    <section className="evaluation-failure-panel">
                                        <h4>
                                            Provider failures
                                        </h4>

                                        <ul>
                                            {metrics.failures.map(
                                                (
                                                    failure,
                                                    index
                                                ) => (
                                                    <li
                                                        key={`${metrics.provider}-${failure.queryId}-${index}`}
                                                    >
                                                        <strong>
                                                            Query{" "}
                                                            {
                                                                failure.queryId
                                                            }
                                                            :
                                                        </strong>{" "}
                                                        {
                                                            failure.error
                                                        }
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </section>
                                )}
                            </article>
                        );
                    }
                )}
            </div>
        </section>
    </>
)}
        </main>
    );
}

export default EvaluationPage;