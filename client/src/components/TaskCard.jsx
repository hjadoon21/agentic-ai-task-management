function TaskCard({ task, onEdit, onDelete }) {
    return (
        <article className="task-card">
            <div className="task-card-header">
                <span className={`status status-${task.status.toLowerCase().replaceAll(" ", "-")}`}>
                    {task.status}
                </span>

                <span className="priority">
                    Priority: {task.actualPriority || "Not evaluated"}
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
                        {task.daysToDeadline === 1 ? "day" : "days"}
                    </dd>
                </div>

                <div>
                    <dt>Source</dt>
                    <dd>{task.source}</dd>
                </div>
            </dl>

            <div className="task-actions">
                <button type="button" onClick={() => onEdit(task)}>
                    Edit
                </button>

                <button
                    className="danger-button"
                    type="button"
                    onClick={() => onDelete(task)}
                >
                    Delete
                </button>
            </div>
        </article>
    );
}

export default TaskCard;