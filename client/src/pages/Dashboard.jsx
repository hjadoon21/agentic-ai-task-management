import { useCallback, useEffect, useState } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ProviderSelector from "../components/ProviderSelector";
import {
    deleteTask,
    getTasks,
} from "../services/taskService";
import { analyzeTask } from "../services/aiService";

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [analyzingTaskId, setAnalyzingTaskId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

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

    const [selectedProviders, setSelectedProviders] =
    useState(() => {
        const savedProviders =
            localStorage.getItem(
                "selectedAIProviders"
            );

        if (!savedProviders) {
            return [
                "openai",
                "gemini",
                "deepseek",
            ];
        }

        try {
            const parsedProviders =
                JSON.parse(savedProviders);

            return Array.isArray(parsedProviders)
                ? parsedProviders
                : [
                      "openai",
                      "gemini",
                      "deepseek",
                  ];
        } catch {
            return [
                "openai",
                "gemini",
                "deepseek",
            ];
        }
    });

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

    async function handleAnalyze(task) {
    if (selectedProviders.length === 0) {
        setError(
            "Select at least one AI provider before analyzing a task."
        );

        return;
    }

    try {
        setAnalyzingTaskId(task._id);
        setError("");
        setSuccessMessage("");

        const analysisData = await analyzeTask(
            task._id,
            selectedProviders
        );

        await loadTasks();

        const successfulProviderCount =
            analysisData.successfulProviderCount ??
            analysisData.task?.aiAnalysis
                ?.providers?.length ??
            0;

        const failedProviderCount =
            analysisData.failedProviderCount ?? 0;

        let message =
            `AI analysis completed using ` +
            `${successfulProviderCount} successful provider(s).`;

        if (failedProviderCount > 0) {
            message +=
                ` ${failedProviderCount} provider(s) failed gracefully.`;
        }

        setSuccessMessage(message);
    } catch (requestError) {
        console.error(
            "AI analysis error:",
            requestError
        );

        setError(
            requestError.response?.data?.error ||
                requestError.message ||
                "The AI analysis could not be completed."
        );
    } finally {
        setAnalyzingTaskId(null);
    }
}

    function handleProviderSelection(providers) {
    setSelectedProviders(providers);

    localStorage.setItem(
        "selectedAIProviders",
        JSON.stringify(providers)
    );
}

    return (
        <main className="dashboard page-container">

            <header className="page-heading">
                <p className="eyebrow">
                    Task Management
                </p>

                <h2>Student Tasks</h2>

                <p>
                    Create, update, analyze, and manage student
                    queries stored in MongoDB.
                </p>
            </header>

            {error && <p className="error-message">{error}</p>}
            {successMessage && (
                <p className="success-message">
                    {successMessage}
                </p>
            )}

            <ProviderSelector
                selectedProviders={selectedProviders}
                onChange={handleProviderSelection}
                disabled={analyzingTaskId !== null}
            />

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
                        onAnalyze={handleAnalyze}
                        analyzingTaskId={analyzingTaskId}
                    />
                </section>
            </div>
        </main>
    );
}

export default Dashboard;