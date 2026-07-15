import { useCallback, useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import {
    deleteTask,
    getTasks,
} from "../services/taskService";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTasks = useCallback(async () => {
        try {
            setError("");
            const taskData = await getTasks();
            setTasks(taskData);
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "The tasks could not be loaded."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
    let cancelled = false;

    getTasks()
        .then((taskData) => {
            if (!cancelled) {
                setTasks(taskData);
            }
        })
        .catch((requestError) => {
            if (!cancelled) {
                setError(
                    requestError.response?.data?.error ||
                        "The tasks could not be loaded."
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

    async function handleDelete(task) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteTask(task._id);

            if (selectedTask?._id === task._id) {
                setSelectedTask(null);
            }

            await loadTasks();
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "The task could not be deleted."
            );
        }
    }

    async function handleSaved() {
        setSelectedTask(null);
        await loadTasks();
    }

    return (
        <main className="dashboard">
            <header className="dashboard-header">
                <div>
                    <p className="eyebrow">ITEC 4020 Project</p>
                    <h1>Agentic AI Task Management System</h1>
                    <p>
                        Create and manage student tasks before comparing
                        recommendations from multiple AI providers.
                    </p>
                </div>
            </header>

            {error && <p className="error-message">{error}</p>}

            <div className="dashboard-grid">
                <TaskForm
                    key={selectedTask?._id ?? "new-task"}
                    taskToEdit={selectedTask}
                    onSaved={handleSaved}
                    onCancelEdit={() => setSelectedTask(null)}
                />

                <section className="panel">
                    <div className="section-heading">
                        <div>
                            <h2>Task History</h2>
                            <p>{tasks.length} saved task(s)</p>
                        </div>

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={loadTasks}
                        >
                            Refresh
                        </button>
                    </div>

                    <TaskList
                        tasks={tasks}
                        loading={loading}
                        onEdit={setSelectedTask}
                        onDelete={handleDelete}
                    />
                </section>
            </div>
        </main>
    );
}

export default Dashboard;