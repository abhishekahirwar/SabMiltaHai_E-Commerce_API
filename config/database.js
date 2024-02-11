const mongoose = require('mongoose');

exports.connectDB = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewURLParser: true,
        useUnifiedTopology: true,
    })
        .then((data) => {
            // console.log(`Database connect successfully at ${data.connection.host}`);
            console.log(`Database connect successfully.`);
        });
    // .catch((err) => {
    //     console.log("Database Problem!");
    //     console.log(err);
    //     process.exit(1);
    // });
};