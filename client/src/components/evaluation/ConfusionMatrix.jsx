const priorityLabels = [
    "High",
    "Medium",
    "Low",
];

// Displays a confusion matrix for a given provider and matrix data
function ConfusionMatrix({
    provider,
    matrix,
}) {
    if (!matrix) {
        return null;
    }

    return (
        <section className="evaluation-detail-card">
            <header className="evaluation-detail-heading">
                <div>
                    <p className="eyebrow">
                        Prediction Distribution
                    </p>

                    <h4>
                        {provider} Confusion Matrix
                    </h4>
                </div>
            </header>

            <p className="matrix-description">
                Rows represent actual priorities and
                columns represent predicted priorities.
            </p>

            <div className="table-scroll-container">
                <table className="confusion-matrix-table">
                    <thead>
                        <tr>
                            <th scope="col">
                                Actual \ Predicted
                            </th>

                            {priorityLabels.map(
                                (label) => (
                                    <th
                                        key={label}
                                        scope="col"
                                    >
                                        {label}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {priorityLabels.map(
                            (actualLabel) => (
                                <tr key={actualLabel}>
                                    <th scope="row">
                                        {actualLabel}
                                    </th>

                                    {priorityLabels.map(
                                        (
                                            predictedLabel
                                        ) => {
                                            const value =
                                                matrix[
                                                    actualLabel
                                                ]?.[
                                                    predictedLabel
                                                ] ?? 0;

                                            const correct =
                                                actualLabel ===
                                                predictedLabel;

                                            return (
                                                <td
                                                    className={
                                                        correct
                                                            ? "matrix-cell matrix-cell-correct"
                                                            : "matrix-cell"
                                                    }
                                                    key={
                                                        predictedLabel
                                                    }
                                                >
                                                    {value}
                                                </td>
                                            );
                                        }
                                    )}
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default ConfusionMatrix;