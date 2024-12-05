const mongoose = require('mongoose');

exports.connectDB = async () => {
    const dbInstance = await mongoose.connect(process.env.MONGO_URL);
    // console.log(`Database connected successfully at ${dbInstance.connection.host}`);
    console.log(`Database connected successfully.`);
};
