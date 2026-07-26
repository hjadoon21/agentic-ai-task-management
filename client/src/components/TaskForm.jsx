import { useState } from "react";
import { createTask, updateTask } from "../services/taskService";

// Displays a form for creating or editing a task, including fields for student query, department, days to deadline, priority, and status
const emptyForm = {
    studentQuery: "",
    department: "",
    daysToDeadline: "",
    actualPriority: "",
    status: "Pending",
};

// Returns the initial form data based on the provided task, or an empty form if no task is provided
function getInitialForm(task) {
    if (!task) {
        return emptyForm;
    }

    return {
        studentQuery: task.studentQuery ?? "",
        department: task.department ?? "",
        daysToDeadline: task.daysToDeadline ?? "",
        actualPriority: task.actualPriority ?? "",
        status: task.status ?? "Pending",
    };
}

// Displays a form for creating or editing a task, including fields for student query, department, days to deadline, priority, and status
function TaskForm({ taskToEdit, onSaved, onCancelEdit }) {
    const [formData, setFormData] = useState(() =>
    getInitialForm(taskToEdit)
);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");


    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        const payload = {
            studentQuery: formData.studentQuery.trim(),
            department: formData.department.trim(),
            daysToDeadline: Number(formData.daysToDeadline),
            actualPriority: formData.actualPriority || null,
            status: formData.status,
            source: taskToEdit?.source ?? "manual",
        };

        try {
            if (taskToEdit) {
                await updateTask(taskToEdit._id, payload);
            } else {
                await createTask(payload);
            }

            setFormData(emptyForm);
            onSaved();
        } catch (requestError) {
            setError(
                requestError.response?.data?.error ||
                    "The task could not be saved."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // Handles the cancellation of editing a task, resetting the form and notifying the parent component
    function handleCancel() {
        setFormData(emptyForm);
        setError("");
        onCancelEdit();
    }

    return (
        <section className="panel">
            <h2>{taskToEdit ? "Edit Task" : "Create a New Task"}</h2>

            {error && <p className="error-message">{error}</p>}

            <form className="task-form" onSubmit={handleSubmit}>
                <label htmlFor="studentQuery">Student query or task</label>
                <textarea
                    id="studentQuery"
                    name="studentQuery"
                    value={formData.studentQuery}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Example: I cannot upload my assignment and it is due tomorrow."
                    required
                />

                <label htmlFor="department">Department</label>
                <input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Example: IT Support"
                    required
                />

                <label htmlFor="daysToDeadline">Days until deadline</label>
                <input
                    id="daysToDeadline"
                    name="daysToDeadline"
                    type="number"
                    min="0"
                    value={formData.daysToDeadline}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="actualPriority">
                    Known priority label (optional)
                </label>
                <select
                    id="actualPriority"
                    name="actualPriority"
                    value={formData.actualPriority}
                    onChange={handleChange}
                >
                    <option value="">Unknown</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>

                <div className="form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? "Saving..."
                            : taskToEdit
                              ? "Update Task"
                              : "Create Task"}
                    </button>

                    {taskToEdit && (
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default TaskForm;