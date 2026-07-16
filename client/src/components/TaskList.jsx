import TaskCard from "./TaskCard";

function TaskList({
    tasks,
    loading,
    onEdit,
    onDelete,
    onAnalyze,
    analyzingTaskId,
}) {
    if (loading) {
        return <p>Loading tasks...</p>;
    }

    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <h3>No tasks found</h3>
                <p>Create your first task using the form.</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAnalyze={onAnalyze}
                    analyzing={
                        analyzingTaskId === task._id
                    }
                />
            ))}
        </div>
    );
}

export default TaskList;