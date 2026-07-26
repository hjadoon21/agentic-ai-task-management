// This file defines the DeepSeek AI provider service, which interacts with the DeepSeek API to analyze tasks. It includes functions for creating an API client, handling retries for failed requests, parsing and validating responses, and performing the analysis of tasks using DeepSeek's AI capabilities.
const axios = require("axios");

const aiResponseSchema = require("../schemas/aiResponseSchema");
const {
    buildSystemPrompt,
    buildTaskPrompt,
} = require("../promptService");

const providerName = "DeepSeek";

// Creates an Axios client for interacting with the DeepSeek API, using the API key from environment variables. Throws an error if the API key is not configured.
function createClient() {
    if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error("DEEPSEEK_API_KEY is not configured.");
    }

    return axios.create({
        baseURL: "https://api.deepseek.com",
        timeout: 15000,
        headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
        },
    });
}

// Waits for a specified number of milliseconds before resolving the promise. This is used to implement delays between retry attempts for failed requests.
function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

// Retrieves the HTTP status code from an error object, checking various properties to account for different error structures. Returns null if no status code is found.
function getErrorStatus(error) {
    return (
        error.response?.status ||
        error.status ||
        error.statusCode ||
        null
    );
}

// Retrieves a user-friendly error message from an error object, checking various properties to account for different error structures. Returns a default message if no specific message is found.
function getErrorMessage(error) {
    return (
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unknown DeepSeek error."
    );
}

// Determines whether an error from the DeepSeek API is retryable based on its HTTP status code or error code. Retryable errors include rate limiting (429), server errors (500, 502, 503, 504), and connection timeouts.
function isRetryableDeepSeekError(error) {
    const status = getErrorStatus(error);

    return (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
    );
}

// Performs a request to the DeepSeek API with retry logic for handling transient errors. It attempts the request up to a specified maximum number of attempts, with exponential backoff delays between retries. If all attempts fail, it throws the last encountered error.
async function requestWithRetry(
    client,
    requestBody,
    maximumAttempts = 3
) {
    let lastError;

    for (
        let attempt = 1;
        attempt <= maximumAttempts;
        attempt += 1
    ) {
        try {
            console.log(
                `Starting DeepSeek attempt ${attempt} of ${maximumAttempts}...`
            );

            const response = await client.post(
                "/chat/completions",
                requestBody
            );

            console.log(
                `DeepSeek attempt ${attempt} succeeded.`
            );

            return response;
        } catch (error) {
            lastError = error;

            console.warn(
                `DeepSeek attempt ${attempt} failed: ${getErrorMessage(error)}`
            );

            const shouldRetry =
                isRetryableDeepSeekError(error) &&
                attempt < maximumAttempts;

            if (!shouldRetry) {
                throw error;
            }

            const delayMilliseconds =
                1000 * 2 ** (attempt - 1);

            console.warn(
                `Retrying DeepSeek in ${delayMilliseconds} ms...`
            );

            await wait(delayMilliseconds);
        }
    }

    throw lastError;
}

// Parses and validates the response from the DeepSeek API. It checks that the response contains valid JSON and conforms to the expected schema. If the response is invalid or does not match the schema, it throws an error with details about the validation failure.
function parseDeepSeekResponse(response) {
    const responseText =
        response.data?.choices?.[0]?.message?.content;

    if (
        typeof responseText !== "string" ||
        responseText.trim() === ""
    ) {
        throw new Error(
            "DeepSeek did not return a classification response."
        );
    }

    let parsedResponse;

    try {
        parsedResponse = JSON.parse(responseText);
    } catch {
        throw new Error("DeepSeek returned invalid JSON.");
    }

    const validationResult =
        aiResponseSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
        const validationDetails =
            validationResult.error.issues
                .map((issue) => {
                    const field =
                        issue.path.join(".") || "response";

                    return `${field}: ${issue.message}`;
                })
                .join("; ");

        throw new Error(
            `DeepSeek response validation failed: ${validationDetails}`
        );
    }

    return validationResult.data;
}

// Analyzes a task using the DeepSeek AI provider. It constructs the request payload, sends it to the DeepSeek API with retry logic, and parses the response. The function returns the analysis result along with metadata such as the provider name, model used, and response time.
async function analyze(task) {
    const client = createClient();
    const startedAt = Date.now();

    const model =
        process.env.DEEPSEEK_MODEL ||
        "deepseek-v4-flash";

    const systemPrompt = `
${buildSystemPrompt()}

Return the answer as one valid JSON object.

Use exactly this JSON structure:
{
  "priority": "High, Medium, or Low",
  "category": "Academic, Technical Support, Financial, Administrative, Registration, or Other",
  "confidence": 0.0,
  "suggestedActions": [
    "Action 1"
  ],
  "reasoningSummary": "Brief explanation"
}

Do not include Markdown, code fences, or text outside the JSON object.
`.trim();

    const requestBody = {
        model,

        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: buildTaskPrompt(task),
            },
        ],

        response_format: {
            type: "json_object",
        },

        temperature: 0.2,
        max_tokens: 700,
        stream: false,
    };

    const response = await requestWithRetry(
        client,
        requestBody,
        3
    );

    const validatedData =
        parseDeepSeekResponse(response);

    return {
        provider: providerName,
        model,
        ...validatedData,
        responseTimeMs: Date.now() - startedAt,
    };
}

module.exports = {
    name: providerName,
    analyze,
};