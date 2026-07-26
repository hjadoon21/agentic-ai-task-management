// This file initializes the server, connects to the database, and starts listening for incoming requests on the specified port. It handles any errors that occur during startup and logs the server URL once it's running.
require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/db");

const PORT = process.env.PORT || 5000;

// Starts the server by connecting to the database and then listening on the specified port. If an error occurs during startup, it logs the error and exits the process.
async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();