import { useEffect, useMemo, useState } from "react";

import { getTasks } from "../services/taskService";

const SELECTED_TASK_STORAGE_KEY =
    "comparisonSelectedTaskId";

// Formats a confidence score as a percentage string, or returns "N/A" if the input is not a number
function formatConfidence(confidence) {
    if (typeof confidence !== "number") {
        return "N/A";
    }

    return `${Math.round(confidence * 100)}%`;
}

// Formats the response time in milliseconds to a string in seconds with two decimal places, or returns "N/A" if the input is not a number
function formatResponseTime(milliseconds) {
    if (typeof milliseconds !== "number") {
        return "N/A";
    }

    return `${(milliseconds / 1000).toFixed(2)} s`;
}

// Sets the clamp percentage function to ensure values are between 0 and 100, returning 0 for non-numeric inputs
function clampPercentage(value) {
    if (typeof value !== "number") {
        return 0;
    }

    return Math.min(Math.max(value, 0), 100);
}

// Gets the confidence percentage by multiplying the confidence score by 100 and clamping it to the range [0, 100], returning 0 for non-numeric inputs
function getConfidencePercentage(confidence) {
    if (typeof confidence !== "number") {
        return 0;
    }

    return clampPercentage(confidence * 100);
}

// Gets the response time percentage by dividing the response time by the maximum response time, multiplying by 100, and clamping it to the range [0, 100], returning 0 for non-numeric inputs or if the maximum response time is less than or equal to 0
function getResponseTimePercentage(
    responseTimeMs,
    maximumResponseTime
) {
    if (
        typeof responseTimeMs !== "number" ||
        maximumResponseTime <= 0
    ) {
        return 0;
    }

    return clampPercentage(
        (responseTimeMs / maximumResponseTime) * 100
    );
}

// Compares AI providers' performance on a selected task, displaying consensus results, visual metrics, and individual provider results
function ComparisonPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        getTasks()
            .then((taskData) => {
                if (cancelled) {
                    return;
                }

                const analyzedTasks = taskData.filter(
    (task) =>
        task.aiAnalysis?.providers?.length > 0
);



setTasks(analyzedTasks);

if (analyzedTasks.length === 0) {
    localStorage.removeItem(
        SELECTED_TASK_STORAGE_KEY
    );

    return;
}

const savedTaskId = localStorage.getItem(
    SELECTED_TASK_STORAGE_KEY
);

const savedTaskStillExists = analyzedTasks.some(
    (task) => task._id === savedTaskId
);

setSelectedTaskId(
    savedTaskStillExists
        ? savedTaskId
        : analyzedTasks[0]._id
);
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.error ||
                            "Analyzed tasks could not be loaded."
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const selectedTask = useMemo(
        () =>
            tasks.find(
                (task) => task._id === selectedTaskId
            ) || null,
        [tasks, selectedTaskId]
    );

    const consensus =
        selectedTask?.aiAnalysis?.consensus || null;

    const providerResults = useMemo(() => {
    return selectedTask?.aiAnalysis?.providers ?? [];
}, [selectedTask]);

    const maximumResponseTime = useMemo(() => {
    if (providerResults.length === 0) {
        return 0;
    }

    return Math.max(
        ...providerResults.map(
            (result) => result.responseTimeMs || 0
        )
    );
}, [providerResults]);    

    if (loading) {
        return (
            <main className="page-container">
                <header className="page-heading">
                    <p className="eyebrow">
                        Provider Analysis
                    </p>

                    <h2>AI Comparison</h2>
                </header>

                <section className="panel">
                    <p>Loading analyzed tasks...</p>
                </section>
            </main>
        );
    }

    return (
        <main className="page-container">
            <header className="page-heading">
                <p className="eyebrow">
                    Provider Analysis
                </p>

                <h2>AI Comparison</h2>

                <p>
                    Compare priority classifications,
                    confidence scores, response times, and
                    consensus results from successful AI
                    providers.
                </p>
            </header>

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            {tasks.length === 0 ? (
                <section className="panel placeholder-panel">
                    <h3>No analyzed tasks found</h3>

                    <p>
                        Go to the Tasks page, create a task,
                        and select Analyze with AI. The results
                        will then appear here.
                    </p>
                </section>
            ) : (
                <>
                    <section className="panel comparison-selector">
                        <label htmlFor="comparisonTask">
                            Select an analyzed task
                        </label>

                        <select
                            id="comparisonTask"
                            value={selectedTaskId}
                            onChange={(event) => {
    const taskId = event.target.value;

    setSelectedTaskId(taskId);

    localStorage.setItem(
        SELECTED_TASK_STORAGE_KEY,
        taskId
    );
}}
                        >
                            {tasks.map((task) => (
                                <option
                                    key={task._id}
                                    value={task._id}
                                >
                                    {task.studentQuery}
                                </option>
                            ))}
                        </select>

                        {selectedTask && (
                            <div className="selected-task-summary">
                                <p>
                                    <strong>Department:</strong>{" "}
                                    {selectedTask.department}
                                </p>

                                <p>
                                    <strong>
                                        Days to deadline:
                                    </strong>{" "}
                                    {
                                        selectedTask.daysToDeadline
                                    }
                                </p>

                                <p>
                                    <strong>Analyzed:</strong>{" "}
                                    {selectedTask.aiAnalysis
                                        ?.analyzedAt
                                        ? new Date(
                                              selectedTask
                                                  .aiAnalysis
                                                  .analyzedAt
                                          ).toLocaleString()
                                        : "Unknown"}
                                </p>
                            </div>
                        )}
                    </section>

                    {consensus && (
                        <section className="comparison-section">
                            <div className="section-title">
                                <div>
                                    <p className="eyebrow">
                                        Combined Result
                                    </p>

                                    <h3>Consensus Summary</h3>
                                </div>
                            </div>

                            <div className="metric-grid">
                                <article className="metric-card">
                                    <span>
                                        Consensus priority
                                    </span>

                                    <strong>
                                        {consensus.priority ||
                                            "N/A"}
                                    </strong>
                                </article>

                                <article className="metric-card">
                                    <span>
                                        Consensus category
                                    </span>

                                    <strong>
                                        {consensus.category ||
                                            "N/A"}
                                    </strong>
                                </article>

                                <article className="metric-card">
                                    <span>
                                        Average confidence
                                    </span>

                                    <strong>
                                        {formatConfidence(
                                            consensus.confidence
                                        )}
                                    </strong>
                                </article>

                                <article className="metric-card">
                                    <span>
                                        Priority agreement
                                    </span>

                                    <strong>
                                        {typeof consensus.agreementPercentage ===
                                        "number"
                                            ? `${consensus.agreementPercentage}%`
                                            : "N/A"}
                                    </strong>

                                    <small>
                                        {consensus.agreementCount ??
                                            0}{" "}
                                        of{" "}
                                        {consensus.totalProviders ??
                                            0}{" "}
                                        providers
                                    </small>
                                </article>

                                <article className="metric-card">
                                    <span>
                                        Fastest provider
                                    </span>

                                    <strong>
                                        {consensus.fastestProvider ||
                                            "N/A"}
                                    </strong>

                                    <small>
                                        {formatResponseTime(
                                            consensus.fastestResponseTimeMs
                                        )}
                                    </small>
                                </article>

                                <article className="metric-card">
                                    <span>
                                        Slowest provider
                                    </span>

                                    <strong>
                                        {consensus.slowestProvider ||
                                            "N/A"}
                                    </strong>

                                    <small>
                                        {formatResponseTime(
                                            consensus.slowestResponseTimeMs
                                        )}
                                    </small>
                                </article>
                            </div>
                        </section>
                    )}

                    {providerResults.length > 0 && (
    <section className="comparison-section">
        <div className="section-title">
            <div>
                <p className="eyebrow">
                    Visual Metrics
                </p>

                <h3>Provider Performance Charts</h3>
            </div>
        </div>

        <div className="chart-grid">
            <article className="comparison-chart">
                <header className="chart-header">
                    <div>
                        <h4>Confidence</h4>

                        <p>
                            Higher percentages indicate
                            greater provider confidence.
                        </p>
                    </div>
                </header>

                <div className="chart-list">
                    {providerResults.map((result) => {
                        const confidencePercentage =
                            getConfidencePercentage(
                                result.confidence
                            );

                        return (
                            <div
                                className="chart-row"
                                key={`confidence-${result.provider}-${result.model}`}
                            >
                                <div className="chart-row-heading">
                                    <span>
                                        {result.provider}
                                    </span>

                                    <strong>
                                        {formatConfidence(
                                            result.confidence
                                        )}
                                    </strong>
                                </div>

                                <div
                                    className="chart-track"
                                    role="progressbar"
                                    aria-label={`${result.provider} confidence`}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-valuenow={Math.round(
                                        confidencePercentage
                                    )}
                                >
                                    <div
                                        className="chart-bar"
                                        style={{
                                            width: `${confidencePercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </article>

            <article className="comparison-chart">
                <header className="chart-header">
                    <div>
                        <h4>Response Time</h4>

                        <p>
                            Shorter response times indicate
                            faster provider performance.
                        </p>
                    </div>
                </header>

                <div className="chart-list">
                    {providerResults.map((result) => {
                        const responseTimePercentage =
                            getResponseTimePercentage(
                                result.responseTimeMs,
                                maximumResponseTime
                            );

                        return (
                            <div
                                className="chart-row"
                                key={`response-${result.provider}-${result.model}`}
                            >
                                <div className="chart-row-heading">
                                    <span>
                                        {result.provider}
                                    </span>

                                    <strong>
                                        {formatResponseTime(
                                            result.responseTimeMs
                                        )}
                                    </strong>
                                </div>

                                <div
                                    className="chart-track"
                                    role="progressbar"
                                    aria-label={`${result.provider} relative response time`}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-valuenow={Math.round(
                                        responseTimePercentage
                                    )}
                                >
                                    <div
                                        className="chart-bar chart-bar-response"
                                        style={{
                                            width: `${responseTimePercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="chart-note">
                    Bars are scaled relative to the slowest
                    provider for the selected task.
                </p>
            </article>
        </div>
    </section>
)}

                    <section className="comparison-section">
                        <div className="section-title">
                            <div>
                                <p className="eyebrow">
                                    Individual Results
                                </p>

                                <h3>Provider Comparison</h3>
                            </div>

                            <span className="provider-count">
                                {providerResults.length} successful
                                provider(s)
                            </span>
                        </div>

                        <div className="provider-grid">
                            {providerResults.map((result) => (
                                <article
                                    className="provider-card"
                                    key={`${result.provider}-${result.model}`}
                                >
                                    <header className="provider-card-header">
                                        <div>
                                            <h4>
                                                {result.provider}
                                            </h4>

                                            <p>
                                                {result.model}
                                            </p>
                                        </div>

                                        <span className="provider-priority">
                                            {result.priority}
                                        </span>
                                    </header>

                                    <dl className="provider-metrics">
                                        <div>
                                            <dt>Category</dt>
                                            <dd>
                                                {
                                                    result.category
                                                }
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Confidence</dt>
                                            <dd>
                                                {formatConfidence(
                                                    result.confidence
                                                )}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>
                                                Response time
                                            </dt>
                                            <dd>
                                                {formatResponseTime(
                                                    result.responseTimeMs
                                                )}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="provider-explanation">
                                        <h5>
                                            Reasoning summary
                                        </h5>

                                        <p>
                                            {
                                                result.reasoningSummary
                                            }
                                        </p>
                                    </div>

                                    <div className="provider-actions">
                                        <h5>
                                            Suggested actions
                                        </h5>

                                        {result.suggestedActions
                                            ?.length > 0 ? (
                                            <ul>
                                                {result.suggestedActions.map(
                                                    (
                                                        action,
                                                        index
                                                    ) => (
                                                        <li
                                                            key={`${result.provider}-${index}`}
                                                        >
                                                            {
                                                                action
                                                            }
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : (
                                            <p>
                                                No suggested
                                                actions were
                                                returned.
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default ComparisonPage;