const taskService = require("../services/task/taskService");

async function createTask(req, res, next) {
    try {
        const task = await taskService.createTask(req.body);

        res.status(201).json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

async function getAllTasks(req, res, next) {
    try {
        const tasks = await taskService.getAllTasks();

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    } catch (error) {
        next(error);
    }
}

async function getTaskById(req, res, next) {
    try {
        const task = await taskService.getTaskById(req.params.id);

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        const task = await taskService.updateTask(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

async function deleteTask(req, res, next) {
    try {
        const task = await taskService.deleteTask(req.params.id);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully.",
            data: task,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
};