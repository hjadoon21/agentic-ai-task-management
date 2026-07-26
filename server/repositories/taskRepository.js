// This file defines the repository functions for interacting with the Task model in the database. It provides functions to create, retrieve, update, and delete tasks, as well as a function to update the AI analysis results for a specific task.
const Task = require("../models/Task");

// This function creates a new task in the database using the provided task data. It returns the created task document.
async function createTask(taskData) {
    return Task.create(taskData);
}

// This function retrieves all tasks from the database, sorted by creation date in descending order. It returns an array of task documents.
async function findAllTasks() {
    return Task.find().sort({ createdAt: -1 });
}

// This function retrieves a specific task by its ID from the database. It returns the task document if found, or null if not found.
async function findTaskById(taskId) {
    return Task.findById(taskId);
}

// This function updates an existing task with new data based on the provided task ID. It returns the updated task document.
async function updateTaskById(taskId, updates) {
    return Task.findByIdAndUpdate(taskId, updates, {
        new: true,
        runValidators: true,
    });
}

// This function deletes a specific task by its ID from the database. It returns the deleted task document if found and deleted, or null if not found.
async function deleteTaskById(taskId) {
    return Task.findByIdAndDelete(taskId);
}

// This function updates the AI analysis results for a specific task based on the provided task ID and AI analysis data. It returns the updated task document.
async function updateTaskAIAnalysis(taskId, aiAnalysis) {
    return Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                aiAnalysis,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
}

module.exports = {
    createTask,
    findAllTasks,
    findTaskById,
    updateTaskById,
    deleteTaskById,
    updateTaskAIAnalysis,
};