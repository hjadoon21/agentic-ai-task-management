// Formats the priority distribution into a readable string
function formatPriorityDistribution(distribution) {
    if (!distribution) {
        return "No distribution available";
    }

    return [
        `High: ${distribution.High ?? 0}`,
        `Medium: ${distribution.Medium ?? 0}`,
        `Low: ${distribution.Low ?? 0}`,
    ].join(" · ");
}

// Displays a summary card for a dataset split (training or test)
function DatasetSummaryCard({
    title,
    summary,
}) {
    if (!summary) {
        return (
            <article className="dataset-summary-card">
                <h3>{title}</h3>
                <p>Summary unavailable.</p>
            </article>
        );
    }

    const departmentCount = Object.keys(
        summary.departmentDistribution || {}
    ).length;

    return (
        <article className="dataset-summary-card">
            <header>
                <p className="eyebrow">
                    {summary.split} split
                </p>

                <h3>{title}</h3>
            </header>

            <div className="dataset-summary-total">
                <strong>{summary.totalRows}</strong>
                <span>total rows</span>
            </div>

            <dl className="dataset-summary-details">
                <div>
                    <dt>Priority distribution</dt>
                    <dd>
                        {formatPriorityDistribution(
                            summary.priorityDistribution
                        )}
                    </dd>
                </div>

                <div>
                    <dt>Departments</dt>
                    <dd>
                        {departmentCount} unique
                        department(s)
                    </dd>
                </div>

                <div>
                    <dt>Minimum deadline</dt>
                    <dd>
                        {summary.deadlineStatistics
                            ?.minimumDays ?? 0}{" "}
                        day(s)
                    </dd>
                </div>

                <div>
                    <dt>Maximum deadline</dt>
                    <dd>
                        {summary.deadlineStatistics
                            ?.maximumDays ?? 0}{" "}
                        day(s)
                    </dd>
                </div>

                <div>
                    <dt>Average deadline</dt>
                    <dd>
                        {summary.deadlineStatistics
                            ?.averageDays ?? 0}{" "}
                        day(s)
                    </dd>
                </div>
            </dl>
        </article>
    );
}

// Displays summary cards for both training and test datasets
function DatasetSummaryCards({
    trainSummary,
    testSummary,
    loading,
}) {
    if (loading) {
        return (
            <section className="comparison-section">
                <div className="section-title">
                    <div>
                        <p className="eyebrow">
                            Dataset Information
                        </p>

                        <h3>Dataset Summary</h3>
                    </div>
                </div>

                <div className="panel">
                    <p>
                        Loading dataset summaries...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="comparison-section">
            <div className="section-title">
                <div>
                    <p className="eyebrow">
                        Dataset Information
                    </p>

                    <h3>Dataset Summary</h3>
                </div>
            </div>

            <div className="dataset-summary-grid">
                <DatasetSummaryCard
                    title="Training Dataset"
                    summary={trainSummary}
                />

                <DatasetSummaryCard
                    title="Test Dataset"
                    summary={testSummary}
                />
            </div>
        </section>
    );
}

export default DatasetSummaryCards;