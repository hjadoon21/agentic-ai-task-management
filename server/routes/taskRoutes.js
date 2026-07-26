// This file defines the routes for task-related operations in the application. It sets up an Express router and defines routes for creating, retrieving, updating, and deleting tasks. The routes are linked to the corresponding methods in the taskController, which handle the logic for each operation.
const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

router
    .route("/")
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

router
    .route("/:id")
    .get(taskController.getTaskById)
    .put(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;