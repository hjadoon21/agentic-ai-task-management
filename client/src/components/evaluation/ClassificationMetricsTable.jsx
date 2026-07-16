function formatPercentage(value) {
    if (typeof value !== "number") {
        return "N/A";
    }

    return `${value.toFixed(2)}%`;
}

function ClassificationMetricsTable({
    provider,
    classificationMetrics,
}) {
    const perClass =
        classificationMetrics?.perClass || [];

    if (perClass.length === 0) {
        return null;
    }

    return (
        <section className="evaluation-detail-card">
            <header className="evaluation-detail-heading">
                <div>
                    <p className="eyebrow">
                        Class-Level Performance
                    </p>

                    <h4>
                        {provider} Classification Metrics
                    </h4>
                </div>
            </header>

            <div className="table-scroll-container">
                <table className="classification-table">
                    <thead>
                        <tr>
                            <th scope="col">
                                Priority
                            </th>

                            <th scope="col">
                                Precision
                            </th>

                            <th scope="col">
                                Recall
                            </th>

                            <th scope="col">
                                F1
                            </th>

                            <th scope="col">
                                Support
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {perClass.map((metrics) => (
                            <tr key={metrics.priority}>
                                <th scope="row">
                                    {metrics.priority}
                                </th>

                                <td>
                                    {formatPercentage(
                                        metrics.precisionPercentage
                                    )}
                                </td>

                                <td>
                                    {formatPercentage(
                                        metrics.recallPercentage
                                    )}
                                </td>

                                <td>
                                    {formatPercentage(
                                        metrics.f1Percentage
                                    )}
                                </td>

                                <td>
                                    {metrics.support}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <th scope="row">
                                Macro average
                            </th>

                            <td>
                                {formatPercentage(
                                    classificationMetrics
                                        .macroPrecisionPercentage
                                )}
                            </td>

                            <td>
                                {formatPercentage(
                                    classificationMetrics
                                        .macroRecallPercentage
                                )}
                            </td>

                            <td>
                                {formatPercentage(
                                    classificationMetrics
                                        .macroF1Percentage
                                )}
                            </td>

                            <td>—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}

export default ClassificationMetricsTable;