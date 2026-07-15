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

function createClient() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
}

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

function createTimeoutError(timeoutMilliseconds) {
    const error = new Error(
        `Gemini request timed out after ${timeoutMilliseconds} ms.`
    );

    error.code = "GEMINI_TIMEOUT";

    return error;
}

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

function getErrorStatus(error) {
    return (
        error.status ||
        error.statusCode ||
        error.response?.status ||
        error.error?.code ||
        null
    );
}

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