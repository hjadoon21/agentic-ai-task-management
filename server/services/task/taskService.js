const mongoose = require("mongoose");
const taskRepository = require("../../repositories/taskRepository");

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function createTask(taskData) {
    return taskRepository.createTask(taskData);
}

async function getAllTasks() {
    return taskRepository.findAllTasks();
}

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