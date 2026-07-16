const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const datasetDirectory = path.join(
    __dirname,
    "../../dataset"
);

const datasetFiles = {
    train: path.join(
        datasetDirectory,
        "university_query_train.csv"
    ),
    test: path.join(
        datasetDirectory,
        "university_query_test.csv"
    ),
};

const validPriorityLabels = new Set([
    "High",
    "Medium",
    "Low",
]);

const datasetCache = {
    train: null,
    test: null,
};

function getDatasetFile(split) {
    const normalizedSplit = String(split)
        .trim()
        .toLowerCase();

    const filePath = datasetFiles[normalizedSplit];

    if (!filePath) {
        const error = new Error(
            "Dataset split must be either train or test."
        );

        error.statusCode = 400;
        throw error;
    }

    return {
        split: normalizedSplit,
        filePath,
    };
}

function normalizePriorityLabel(value) {
    const normalizedValue = String(value || "")
        .trim()
        .toLowerCase();

    const priorityMap = {
        high: "High",
        medium: "Medium",
        low: "Low",
    };

    return priorityMap[normalizedValue] || null;
}

function normalizeDatasetRow(row, rowNumber) {
    const queryId = Number(row.Query_ID);
    const studentQuery = String(
        row.Student_Query || ""
    ).trim();

    const department = String(
        row.Department || ""
    ).trim();

    const daysToDeadline = Number(
        row.Days_To_Deadline
    );

    const priorityLabel = normalizePriorityLabel(
        row.Priority_Label
    );

    if (
        !Number.isFinite(queryId) ||
        studentQuery === "" ||
        department === "" ||
        !Number.isFinite(daysToDeadline) ||
        daysToDeadline < 0 ||
        !priorityLabel ||
        !validPriorityLabels.has(priorityLabel)
    ) {
        const error = new Error(
            `Invalid dataset row at CSV row ${rowNumber}.`
        );

        error.statusCode = 500;
        throw error;
    }

    return {
        queryId,
        studentQuery,
        department,
        daysToDeadline,
        actualPriority: priorityLabel,
    };
}

function readDatasetFile(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];
        let rowNumber = 1;

        if (!fs.existsSync(filePath)) {
            const error = new Error(
                `Dataset file was not found: ${filePath}`
            );

            error.statusCode = 500;
            reject(error);
            return;
        }

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                rowNumber += 1;

                try {
                    const normalizedRow =
                        normalizeDatasetRow(
                            row,
                            rowNumber
                        );

                    rows.push(normalizedRow);
                } catch (error) {
                    reject(error);
                }
            })
            .on("end", () => {
                resolve(rows);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}

async function loadDataset(split = "test") {
    const {
        split: normalizedSplit,
        filePath,
    } = getDatasetFile(split);

    if (datasetCache[normalizedSplit]) {
        return datasetCache[normalizedSplit];
    }

    const rows = await readDatasetFile(filePath);

    datasetCache[normalizedSplit] = rows;

    return rows;
}

function buildPriorityDistribution(rows) {
    return rows.reduce(
        (distribution, row) => {
            distribution[row.actualPriority] += 1;
            return distribution;
        },
        {
            High: 0,
            Medium: 0,
            Low: 0,
        }
    );
}

function buildDepartmentDistribution(rows) {
    return rows.reduce((distribution, row) => {
        distribution[row.department] =
            (distribution[row.department] || 0) + 1;

        return distribution;
    }, {});
}

async function getDatasetSummary(split = "test") {
    const rows = await loadDataset(split);

    const deadlines = rows.map(
        (row) => row.daysToDeadline
    );

    const totalDeadlineDays = deadlines.reduce(
        (sum, value) => sum + value,
        0
    );

    return {
        split: String(split).toLowerCase(),
        totalRows: rows.length,
        priorityDistribution:
            buildPriorityDistribution(rows),
        departmentDistribution:
            buildDepartmentDistribution(rows),
        deadlineStatistics: {
            minimumDays: Math.min(...deadlines),
            maximumDays: Math.max(...deadlines),
            averageDays:
                rows.length > 0
                    ? Number(
                          (
                              totalDeadlineDays /
                              rows.length
                          ).toFixed(2)
                      )
                    : 0,
        },
    };
}

async function getDatasetSample({
    split = "test",
    size = 10,
    offset = 0,
} = {}) {
    const rows = await loadDataset(split);

    const numericSize = Number(size);
    const numericOffset = Number(offset);

    if (
        !Number.isInteger(numericSize) ||
        numericSize < 1 ||
        numericSize > 100
    ) {
        const error = new Error(
            "Sample size must be an integer between 1 and 100."
        );

        error.statusCode = 400;
        throw error;
    }

    if (
        !Number.isInteger(numericOffset) ||
        numericOffset < 0
    ) {
        const error = new Error(
            "Sample offset must be a non-negative integer."
        );

        error.statusCode = 400;
        throw error;
    }

    const sample = rows.slice(
        numericOffset,
        numericOffset + numericSize
    );

    return {
        split: String(split).toLowerCase(),
        requestedSize: numericSize,
        offset: numericOffset,
        returnedCount: sample.length,
        totalRows: rows.length,
        hasMore:
            numericOffset + sample.length <
            rows.length,
        data: sample,
    };
}

function clearDatasetCache() {
    datasetCache.train = null;
    datasetCache.test = null;
}

module.exports = {
    loadDataset,
    getDatasetSummary,
    getDatasetSample,
    clearDatasetCache,
};