const aiOrchestrator = require(
    "../services/ai/aiOrchestrator"
);

const taskService = require(
    "../services/task/taskService"
);

async function analyzeTask(req, res, next) {
    try {
        const { taskId } = req.params;

        const task = await taskService.getTaskById(taskId);

        const analysisResult =
            await aiOrchestrator.analyzeTask({
                studentQuery: task.studentQuery,
                department: task.department,
                daysToDeadline: task.daysToDeadline,
            });

        const updatedTask =
            await taskService.saveAIAnalysis(
                taskId,
                analysisResult
            );

        return res.status(200).json({
            success: true,
            data: {
                task: updatedTask,
                providerResults:
                    analysisResult.providerResults,
                failedResults:
                    analysisResult.failedResults,
                consensus:
                    analysisResult.consensus,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeTask,
};