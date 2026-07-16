const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");
const aiRoutes = require("./routes/aiRoutes");
const evaluationRoutes = require(
    "./routes/evaluationRoutes"
);

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Agentic AI Task Management API is running.",
    });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/evaluation", evaluationRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found.",
    });
});

app.use(errorHandler);

module.exports = app;