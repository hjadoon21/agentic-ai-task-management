import apiClient from "../api/client";

export async function getTasks() {
    const response = await apiClient.get("/api/tasks");
    return response.data.data;
}

export async function createTask(taskData) {
    const response = await apiClient.post("/api/tasks", taskData);
    return response.data.data;
}

export async function updateTask(taskId, taskData) {
    const response = await apiClient.put(`/api/tasks/${taskId}`, taskData);
    return response.data.data;
}

export async function deleteTask(taskId) {
    const response = await apiClient.delete(`/api/tasks/${taskId}`);
    return response.data.data;
}