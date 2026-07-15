const OpenAI = require("openai");
const { zodTextFormat } = require("openai/helpers/zod");

const aiResponseSchema = require("../schemas/aiResponseSchema");
const {
    buildSystemPrompt,
    buildTaskPrompt,
} = require("../promptService");

const providerName = "OpenAI";

function createClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured.");
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

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