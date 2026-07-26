// OpenAI AI provider implementation for analyzing tasks and returning structured responses.
const OpenAI = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");

const aiResponseSchema = require("../schemas/aiResponseSchema");
const {
    buildSystemPrompt,
    buildTaskPrompt,
} = require("../promptService");

const providerName = "OpenAI";

// Creates an OpenAI client using the API key from environment variables. Throws an error if the API key is not configured.
function createClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// Analyzes a task using the OpenAI API. It constructs the request payload, sends it to OpenAI, and parses the structured response. The function returns the analysis result along with metadata such as the provider name, model used, and response time.
async function analyze(task) {
    const client = createClient();
    const startedAt = Date.now();

    const model = process.env.OPENAI_MODEL;

    if (!model) {
        throw new Error("OPENAI_MODEL is not configured.");
    }

    const response = await client.responses.parse({
        model,

        input: [
            {
                role: "system",
                content: buildSystemPrompt(),
            },
            {
                role: "user",
                content: buildTaskPrompt(task),
            },
        ],

        text: {
            format: zodTextFormat(
                aiResponseSchema,
                "university_task_classification"
            ),
        },
    });

    if (!response.output_parsed) {
        throw new Error(
            "OpenAI did not return a valid structured classification."
        );
    }

    return {
        provider: providerName,
        model,
        ...response.output_parsed,
        responseTimeMs: Date.now() - startedAt,
    };
}

module.exports = {
    name: providerName,
    analyze,
};