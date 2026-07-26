const mongoose = require("mongoose");

// This function connects to the MongoDB database using the connection string provided in the MONGODB_URI environment variable. It throws an error if the connection fails or if the MONGODB_URI is not set.
async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing from the .env file.");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

module.exports = connectDatabase;