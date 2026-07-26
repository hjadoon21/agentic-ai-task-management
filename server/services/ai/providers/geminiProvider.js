// This file defines the Gemini AI provider for analyzing tasks. It uses the Google Gemini API to classify tasks based on their content and returns structured results including priority, category, confidence, suggested actions, and reasoning summary. The provider includes retry logic for handling transient errors and validates the response against a defined schema.
const { GoogleGenAI } = require("@google/genai");

const aiResponseSchema = require("../schemas/aiResponseSchema");
const {
    buildSystemPrompt,
    buildTaskPrompt,
} = require("../promptService");

const providerName = "Gemini";

const geminiResponseSchema = {
    type: "object",

    properties: {
        priority: {
            type: "string",
            enum: ["High", "Medium", "Low"],
        },

        category: {
            type: "string",
            enum: [
                "Academic",
                "Technical Support",
                "Financial",
                "Administrative",
                "Registration",
                "Other",
            ],
        },

        confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
        },

        suggestedActions: {
            type: "array",
            items: {
                type: "string",
            },
            minItems: 1,
            maxItems: 5,
        },

        reasoningSummary: {
            type: "string",
        },
    },

    required: [
        "priority",
        "category",
        "confidence",
        "suggestedActions",
        "reasoningSummary",
    ],

    additionalProperties: false,
};

// Creates a Google Gemini client using the API key from environment variables. Throws an error if the API key is not configured.
function createClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
}

// Waits for a specified number of milliseconds before resolving the promise. This is used to implement delays between retry attempts for failed requests.
function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

// Creates a custom error object for Gemini request timeouts, including a specific error code for identification.
function createTimeoutError(timeoutMilliseconds) {
    const error = new Error(
        `Gemini request timed out after ${timeoutMilliseconds} ms.`
    );

    error.code = "GEMINI_TIMEOUT";

    return error;
}

// Runs an asynchronous operation with a specified timeout. If the operation does not complete within the timeout period, it rejects with a timeout error.
async function runWithTimeout(operation, timeoutMilliseconds) {
    let timeoutId;

    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
            reject(createTimeoutError(timeoutMilliseconds));
        }, timeoutMilliseconds);
    });

    try {
        return await Promise.race([
            operation(),
            timeoutPromise,
        ]);
    } finally {
        clearTimeout(timeoutId);
    }
}

// Retrieves the HTTP status code from an error object, checking various properties to account for different error structures. Returns null if no status code is found.
function getErrorStatus(error) {
    return (
        error.status ||
        error.statusCode ||
        error.response?.status ||
        error.error?.code ||
        null
    );
}

// Retrieves a user-friendly error message from an error object, checking various properties to account for different error structures. Returns a default message if no specific message is found.
function getErrorMessage(error) {
    if (typeof error?.message === "string") {
        return error.message;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown Gemini error.";
    }
}

// Determines whether an error from the Gemini API is retryable based on its HTTP status code, error code, or specific message content. Retryable errors include timeouts, rate limiting (429), server errors (500, 502, 503, 504), and certain error messages indicating resource exhaustion or high demand.
function isRetryableGeminiError(error) {
    const status = getErrorStatus(error);
    const message = getErrorMessage(error).toLowerCase();

    return (
        error.code === "GEMINI_TIMEOUT" ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes('"code":429') ||
        message.includes('"code":500') ||
        message.includes('"code":502') ||
        message.includes('"code":503') ||
        message.includes('"code":504') ||
        message.includes("resource_exhausted") ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("timed out")
    );
}

// Performs a request to the Gemini API with retry logic for handling transient errors. It attempts the request up to a specified maximum number of attempts, with exponential backoff delays between retries. If all attempts fail, it throws the last encountered error.
async function generateWithRetry(
    client,
    request,
    maximumAttempts = 3,
    timeoutMilliseconds = 15000
) {
    let lastError;

    for (
        let attempt = 1;
        attempt <= maximumAttempts;
        attempt += 1
    ) {
        try {
            console.log(
                `Starting Gemini attempt ${attempt} of ${maximumAttempts}...`
            );

            const response = await runWithTimeout(
                () => client.models.generateContent(request),
                timeoutMilliseconds
            );

            console.log(
                `Gemini attempt ${attempt} succeeded.`
            );

            return response;
        } catch (error) {
            lastError = error;

            const errorMessage = getErrorMessage(error);

            console.warn(
                `Gemini attempt ${attempt} failed: ${errorMessage}`
            );

            const shouldRetry =
                isRetryableGeminiError(error) &&
                attempt < maximumAttempts;

            if (!shouldRetry) {
                throw error;
            }

            const delayMilliseconds =
                1000 * 2 ** (attempt - 1);

            console.warn(
                `Retrying Gemini in ${delayMilliseconds} ms...`
            );

            await wait(delayMilliseconds);
        }
    }

    throw lastError;
}

// Parses and validates the response from the Gemini API. It checks that the response contains valid JSON and conforms to the expected schema. If the response is invalid or does not match the schema, it throws an error with details about the validation failure.
function parseGeminiResponse(response) {
    const responseText = response.text;

    if (
        typeof responseText !== "string" ||
        responseText.trim() === ""
    ) {
        throw new Error(
            "Gemini did not return a classification response."
        );
    }

    let parsedResponse;

    try {
        parsedResponse = JSON.parse(responseText);
    } catch {
        throw new Error("Gemini returned invalid JSON.");
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
            `Gemini response validation failed: ${validationDetails}`
        );
    }

    return validationResult.data;
}

// Analyzes a task using the Gemini AI provider. It constructs the request payload, sends it to the Gemini API with retry logic, and parses the response. The function returns the analysis result along with metadata such as the provider name, model used, and response time.
async function analyze(task) {
    const client = createClient();
    const startedAt = Date.now();

    const model =
        process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const request = {
        model,

        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: buildTaskPrompt(task),
                    },
                ],
            },
        ],

        config: {
            systemInstruction: buildSystemPrompt(),
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema,
        },
    };

    /*
     * Maximum expected Gemini wait:
     *
     * Attempt 1: 15 seconds
     * Delay:      1 second
     * Attempt 2: 15 seconds
     * Delay:      2 seconds
     * Attempt 3: 15 seconds
     *
     * Approximate worst case: 48 seconds.
     */
    const response = await generateWithRetry(
        client,
        request,
        3,
        15000
    );

    const validatedData = parseGeminiResponse(response);

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