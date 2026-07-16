import apiClient from "../api/client";

export async function analyzeTask(
    taskId,
    providers
) {
    const response = await apiClient.post(
        `/api/ai/analyze/${taskId}`,
        {
            providers,
        },
        {
            timeout: 90000,
        }
    );

    return response.data.data;
}