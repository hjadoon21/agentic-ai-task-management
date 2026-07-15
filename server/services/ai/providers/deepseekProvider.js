const axios = require("axios");

const aiResponseSchema = require("../schemas/aiResponseSchema");
const {
    buildSystemPrompt,
    buildTaskPrompt,
} = require("../promptService");

const providerName = "DeepSeek";

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

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

function getErrorStatus(error) {
    return (
        error.response?.status ||
        error.status ||
        error.statusCode ||
        null
    );
}

function getErrorMessage(error) {
    return (
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unknown DeepSeek error."
    );
}

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