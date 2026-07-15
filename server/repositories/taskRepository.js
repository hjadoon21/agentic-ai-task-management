const Task = require("../models/Task");

async function createTask(taskData) {
    return Task.create(taskData);
}

async function findAllTasks() {
    return Task.find().sort({ createdAt: -1 });
}

async function findTaskById(taskId) {
    return Task.findById(taskId);
}

async function updateTaskById(taskId, updates) {
    return Task.findByIdAndUpdate(taskId, updates, {
        new: true,
        runValidators: true,
    });
}

async function deleteTaskById(taskId) {
    return Task.findByIdAndDelete(taskId);
}

module.exports = {
    createTask,
    findAllTasks,
    findTaskById,
    updateTaskById,
    deleteTaskById,
};