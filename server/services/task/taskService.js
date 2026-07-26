// This service provides functions to manage tasks, including creating, retrieving, updating, and deleting tasks. It also handles saving AI analysis results for tasks.
const mongoose = require("mongoose");
const taskRepository = require("../../repositories/taskRepository");

// Validates whether the provided ID is a valid MongoDB ObjectId. It uses Mongoose's built-in validation method to check the format of the ID.
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

// Creates a new task in the database using the provided task data. It delegates the creation to the taskRepository and returns the created task.
async function createTask(taskData) {
    return taskRepository.createTask(taskData);
}

// Retrieves all tasks from the database. It calls the taskRepository to fetch all task records and returns them as an array.
async function getAllTasks() {
    return taskRepository.findAllTasks();
}

// Retrieves a task by its ID. It validates the ID format, fetches the task from the repository, and throws an error if the task is not found or if the ID is invalid.
async function getTaskById(taskId) {
    if (!isValidObjectId(taskId)) {
        const error = new Error("Invalid task ID.");
        error.statusCode = 400;
        throw error;
    }

    const task = await taskRepository.findTaskById(taskId);

    if (!task) {
        const error = new Error("Task not found.");
        error.statusCode = 404;
        throw error;
    }

    return task;
}

// Updates a task by its ID with the provided updates. It validates the ID format, applies the updates through the repository, and throws an error if the task is not found or if the ID is invalid.
async function updateTask(taskId, updates) {
    if (!isValidObjectId(taskId)) {
        const error = new Error("Invalid task ID.");
        error.statusCode = 400;
        throw error;
    }

    const task = await taskRepository.updateTaskById(taskId, updates);

    if (!task) {
        const error = new Error("Task not found.");
        error.statusCode = 404;
        throw error;
    }

    return task;
}

// Deletes a task by its ID. It validates the ID format, removes the task through the repository, and throws an error if the task is not found or if the ID is invalid.
async function deleteTask(taskId) {
    if (!isValidObjectId(taskId)) {
        const error = new Error("Invalid task ID.");
        error.statusCode = 400;
        throw error;
    }

    const task = await taskRepository.deleteTaskById(taskId);

    if (!task) {
        const error = new Error("Task not found.");
        error.statusCode = 404;
        throw error;
    }

    return task;
}

// Saves the AI analysis result for a specific task. It validates the task ID, constructs the analysis data from the successful provider results, and updates the task's AI analysis field in the database. If the task is not found, it throws an error.
async function saveAIAnalysis(taskId, analysisResult) {
    if (!isValidObjectId(taskId)) {
        const error = new Error("Invalid task ID.");
        error.statusCode = 400;
        throw error;
    }

    const successfulProviders =
        analysisResult.successfulResults.map((result) => ({
            provider: result.provider,
            model: result.model,
            priority: result.priority,
            category: result.category,
            confidence: result.confidence,
            suggestedActions: result.suggestedActions,
            reasoningSummary: result.reasoningSummary,
            responseTimeMs: result.responseTimeMs,
        }));

    const aiAnalysis = {
        providers: successfulProviders,
        consensus: analysisResult.consensus,
        analyzedAt: new Date(),
    };

    const updatedTask =
        await taskRepository.updateTaskAIAnalysis(
            taskId,
            aiAnalysis
        );

    if (!updatedTask) {
        const error = new Error("Task not found.");
        error.statusCode = 404;
        throw error;
    }

    return updatedTask;
}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    saveAIAnalysis,
};