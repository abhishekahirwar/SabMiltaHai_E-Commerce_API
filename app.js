const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const errorMiddleware = require('./middleware/error');

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Route Imports
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');

app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use('/api/v1', payment);

// Middleware For Error
app.use(errorMiddleware);

module.exports = app;