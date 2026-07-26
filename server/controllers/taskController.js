const taskService = require("../services/task/taskService");

// This function handles the creation of a new task. It receives task data from the request body, calls the taskService to create the task, and returns the created task in the response.
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

// This function retrieves all tasks from the database. It calls the taskService to get the tasks and returns them in the response along with a count of the total number of tasks.
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

// This function retrieves a specific task by its ID. It calls the taskService to get the task and returns it in the response.
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

// This function updates an existing task with new data. It receives the task ID from the request parameters and the updated task data from the request body, calls the taskService to update the task, and returns the updated task in the response.
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

// This function deletes a specific task by its ID. It calls the taskService to delete the task and returns a success message along with the deleted task in the response.
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