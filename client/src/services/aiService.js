import apiClient from "../api/client";

// This function sends a POST request to the backend API to analyze a specific task using the provided AI providers. It takes in a taskId and an array of providers, and returns the analysis results from the API response.
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