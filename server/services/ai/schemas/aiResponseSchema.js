const { z } = require("zod");

const aiResponseSchema = z.object({
    priority: z.enum(["High", "Medium", "Low"]),

    category: z.enum([
        "Academic",
        "Technical Support",
        "Financial",
        "Administrative",
        "Registration",
        "Other",
    ]),

    confidence: z.number().min(0).max(1),

    suggestedActions: z
        .array(z.string().trim().min(1))
        .min(1)
        .max(5),

    reasoningSummary: z.string().trim().min(1).max(500),
});

module.exports = aiResponseSchema;