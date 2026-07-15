function errorHandler(error, req, res, next) {
    console.error(error);

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map(
            (item) => item.message
        );

        return res.status(400).json({
            success: false,
            error: messages.join(" "),
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            error: "A record with that unique value already exists.",
        });
    }

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        error:
            statusCode === 500
                ? "An internal server error occurred."
                : error.message,
    });
}

module.exports = errorHandler;