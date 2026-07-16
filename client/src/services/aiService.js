import apiClient from "../api/client";

export async function analyzeTask(taskId) {
    const response = await apiClient.post(
        `/api/ai/analyze/${taskId}`,
        {},
        {
            timeout: 90000,
        }
    );

    return response.data.data;
}