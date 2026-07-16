const aiOrchestrator = require(
    "../services/ai/aiOrchestrator"
);

const taskService = require(
    "../services/task/taskService"
);

async function analyzeTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const { providers } = req.body || {};

        const task = await taskService.getTaskById(
            taskId
        );

        const analysisResult =
            await aiOrchestrator.analyzeTask(
                {
                    studentQuery: task.studentQuery,
                    department: task.department,
                    daysToDeadline:
                        task.daysToDeadline,
                },
                providers
            );

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
                selectedProviders:
                    analysisResult.selectedProviders,
                successfulProviderCount:
                    analysisResult.successfulProviderCount,
                failedProviderCount:
                    analysisResult.failedProviderCount,
                totalProviderCount:
                    analysisResult.totalProviderCount,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeTask,
};