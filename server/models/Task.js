const mongoose = require("mongoose");

const providerResultSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            required: true,
            trim: true,
        },

        model: {
            type: String,
            required: true,
            trim: true,
        },

        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            required: true,
        },

        category: {
            type: String,
            enum: [
                "Academic",
                "Technical Support",
                "Financial",
                "Administrative",
                "Registration",
                "Other",
            ],
            required: true,
        },

        confidence: {
            type: Number,
            min: 0,
            max: 1,
            required: true,
        },

        suggestedActions: {
            type: [String],
            default: [],
        },

        reasoningSummary: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        responseTimeMs: {
            type: Number,
            min: 0,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const consensusSchema = new mongoose.Schema(
    {
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: null,
        },

        category: {
            type: String,
            enum: [
                "Academic",
                "Technical Support",
                "Financial",
                "Administrative",
                "Registration",
                "Other",
            ],
            default: null,
        },

        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        },

        agreementCount: {
            type: Number,
            min: 0,
            default: 0,
        },

        totalProviders: {
            type: Number,
            min: 0,
            default: 0,
        },

        agreementPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
},

fastestProvider: {
    type: String,
    default: null,
    trim: true,
},

fastestResponseTimeMs: {
    type: Number,
    min: 0,
    default: null,
},

slowestProvider: {
    type: String,
    default: null,
    trim: true,
},

slowestResponseTimeMs: {
    type: Number,
    min: 0,
    default: null,
},
    },
    {
        _id: false,
    }
);

const aiAnalysisSchema = new mongoose.Schema(
    {
        providers: {
            type: [providerResultSchema],
            default: [],
        },

        consensus: {
            type: consensusSchema,
            default: null,
        },

        analyzedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const taskSchema = new mongoose.Schema(
    {
        studentQuery: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        daysToDeadline: {
            type: Number,
            required: true,
            min: 0,
        },

        actualPriority: {
            type: String,
            enum: ["High", "Medium", "Low", null],
            default: null,
        },

        source: {
            type: String,
            enum: ["manual", "dataset"],
            default: "manual",
        },

        datasetQueryId: {
            type: Number,
            default: null,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "In Progress",
                "Completed",
            ],
            default: "Pending",
        },

        aiAnalysis: {
            type: aiAnalysisSchema,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Task", taskSchema);