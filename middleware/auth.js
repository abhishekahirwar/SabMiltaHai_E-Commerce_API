const catchAsyncErrors = require('./catchAsyncErrors');
const ErrorHandler = require('../util/errorhandler');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// isAuthenticatedUser
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource.", 401));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decode.id);
    // req.user = decode;
    next();
});

// isAdmin 
// exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
//     if (req.user.role !== "Admin") {
//         return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
//     }
//     next();
// });

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    };
}
