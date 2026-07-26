import apiClient from "../api/client";

// This function sends a GET request to the backend API to retrieve a list of tasks. It returns the list of tasks from the API response.
export async function getTasks() {
    const response = await apiClient.get("/api/tasks");
    return response.data.data;
}

// This function sends a POST request to the backend API to create a new task. It takes in taskData as a parameter and returns the created task from the API response.
export async function createTask(taskData) {
    const response = await apiClient.post("/api/tasks", taskData);
    return response.data.data;
}

// This function sends a PUT request to the backend API to update an existing task. It takes in a taskId and taskData as parameters and returns the updated task from the API response.
export async function updateTask(taskId, taskData) {
    const response = await apiClient.put(`/api/tasks/${taskId}`, taskData);
    return response.data.data;
}

// This function sends a DELETE request to the backend API to delete a specific task. It takes in a taskId as a parameter and returns the deleted task from the API response.
export async function deleteTask(taskId) {
    const response = await apiClient.delete(`/api/tasks/${taskId}`);
    return response.data.data;
}