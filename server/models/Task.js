const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        studentQuery: {
            type: String,
            required: [true, "Student query is required."],
            trim: true,
            maxlength: [1000, "Student query cannot exceed 1000 characters."],
        },

        department: {
            type: String,
            required: [true, "Department is required."],
            trim: true,
        },

        daysToDeadline: {
            type: Number,
            required: [true, "Days to deadline is required."],
            min: [0, "Days to deadline cannot be negative."],
        },

        actualPriority: {
            type: String,
            enum: {
                values: ["High", "Medium", "Low"],
                message: "Priority must be High, Medium, or Low.",
            },
            default: null,
        },

        source: {
            type: String,
            enum: ["manual", "dataset"],
            default: "manual",
        },

        datasetQueryId: {
            type: Number,
            default: null,
        },

        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;