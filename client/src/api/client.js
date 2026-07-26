import axios from "axios";

// set the local host and the content type for the client
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;