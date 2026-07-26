// Displays a card summarizing the details of a task, including its status, priority, and AI analysis results
function TaskCard({
    task,
    onEdit,
    onDelete,
    onAnalyze,
    analyzing,
}) {
    const statusClass = task.status
        .toLowerCase()
        .replaceAll(" ", "-");

    const hasAnalysis = Boolean(
    task.aiAnalysis?.analyzedAt &&
    task.aiAnalysis?.providers?.length
);

    return (
        <article className="task-card">
            <div className="task-card-header">
                <span className={`status status-${statusClass}`}>
                    {task.status}
                </span>

                <span className="priority">
                    Priority:{" "}
                    {task.aiAnalysis?.consensus?.priority ||
                        task.actualPriority ||
                        "Not evaluated"}
                </span>
            </div>

            <h3>{task.studentQuery}</h3>

            <dl className="task-details">
                <div>
                    <dt>Department</dt>
                    <dd>{task.department}</dd>
                </div>

                <div>
                    <dt>Deadline</dt>
                    <dd>
                        {task.daysToDeadline}{" "}
                        {task.daysToDeadline === 1
                            ? "day"
                            : "days"}
                    </dd>
                </div>

                <div>
                    <dt>AI status</dt>
                    <dd>
                        {hasAnalysis
                            ? "Analyzed"
                            : "Not analyzed"}
                    </dd>
                </div>
            </dl>

            <div className="task-actions">
                <button
                    type="button"
                    onClick={() => onAnalyze(task)}
                    disabled={analyzing}
                >
                    {analyzing
                        ? "Analyzing..."
                        : hasAnalysis
                          ? "Analyze Again"
                          : "Analyze with AI"}
                </button>

                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => onEdit(task)}
                    disabled={analyzing}
                >
                    Edit
                </button>

                <button
                    className="danger-button"
                    type="button"
                    onClick={() => onDelete(task)}
                    disabled={analyzing}
                >
                    Delete
                </button>
            </div>
        </article>
    );
}

export default TaskCard;