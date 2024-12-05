// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

const app = require('./app');
require('dotenv').config();
const PORT = process.env.PORT || 4000;

// Database Connection
require('./config/database').connectDB();
// Cloudinary Connection
require('./config/cloudinary').cloudinaryConnect();

const server = app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(() => {
        process.exit(1);
    });
});
