import apiClient from "../api/client";

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