import apiClient from "../api/client";

// This function sends a POST request to the backend API to analyze a specific task using the provided AI providers. It takes in a taskId and an array of providers, and returns the analysis results from the API response.
export async function getDatasetSummary(
    split = "test"
) {
    const response = await apiClient.get(
        "/api/evaluation/summary",
        {
            params: {
                split,
            },
        }
    );

    return response.data.data;
}

// This function sends a GET request to the backend API to retrieve a sample of the dataset for evaluation purposes. It takes in optional parameters for the dataset split, sample size, and offset, and returns the sample data from the API response.
export async function getDatasetSample({
    split = "test",
    size = 10,
    offset = 0,
} = {}) {
    const response = await apiClient.get(
        "/api/evaluation/sample",
        {
            params: {
                split,
                size,
                offset,
            },
        }
    );

    return response.data.data;
}

// This function sends a POST request to the backend API to run an evaluation of AI providers on a dataset. It takes in parameters for the dataset split, sample size, offset, and an array of providers, and returns the evaluation results from the API response.
export async function runEvaluation({
    split,
    sampleSize,
    offset,
    providers,
}) {
    const response = await apiClient.post(
        "/api/evaluation/run",
        {
            split,
            sampleSize,
            offset,
            providers,
        },
        {
            /*
             * Dataset rows run sequentially, and each
             * provider may have retry logic. This request
             * therefore needs a longer timeout than CRUD.
             */
            timeout: 300000,
        }
    );

    return response.data.data;
}