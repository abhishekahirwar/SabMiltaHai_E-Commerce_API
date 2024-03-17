const User = require('../model/userModel');
const OTP = require('../model/OTPModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../util/errorhandler');
const sendToken = require('../util/jwtToken');
const sendEmail = require('../util/sendEmail');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');
const resetPasswordTemplate = require('../mail/templates/resetPasswordUrlTemplate');
const updatePasswordTemplate = require('../mail/templates/updatePasswordTemplate');
const roleUpdatedTemplate = require('../mail/templates/roleUpdateTemplate');
const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Send OTP
exports.sendOtp = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User is Already Registered.", 401));
    }

    let otp, result;

    do {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        result = await OTP.findOne({ otp });
    } while (result);

    await OTP.create({ email, otp });

    try {
        await sendEmail({
            email,
            subject: `Verify your email address`,
            message: emailTemplate(otp),
        });

        return res.status(201).json({
            success: true,
            otp,
            message: "OTP Sent Successfully.",
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

// Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, confirmPassword, otp } = req.body;

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm password", 400));
    }

    const { otp: storedOtp } = await OTP.findOne({ email }).sort({ createdAt: -1 });

    // OTP not found for the email
    if (!storedOtp || otp !== storedOtp) {
        return next(new ErrorHandler("The OTP is not valid", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "Sample_Public_id",
            url: "Sample_Url",
        },
    });

    sendToken(user, 201, 'User Registered Successfully.', res);
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, 'User Login Successfully.', res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(0),
        httpOnly: true,
    });

    return res.status(200).json({
        success: true,
        message: "Logged Out Successful.",
    });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    // Get ResetPasswordToken
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = resetPasswordTemplate(resetPasswordUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: `SabMiltaHai E-Commerce Password Recovery`,
            message,
        });

        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        });

    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(err.message, 500));
    }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Creating hash token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired.", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 201, 'Password Reset Successfully.', res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found!", 404));
    }

    return res.status(200).json({
        success: true,
        user,
        message: "User details retrieved successfully!",
    });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password is not matching with confirm password", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Update Confirmation`,
            message: updatePasswordTemplate(user.email, user.name),
        });

        sendToken(user, 200, 'Password Changed Successfully.', res);
    } catch (err) {
        console.log("Error", err);
        return next(new ErrorHandler(err.message, 500));
    }
});

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const file = req.files ? req.files.avatar : null;

    if (file) {
        try {
            const user = await User.findById(req.user.id);

            const imageId = user.avatar.public_id;
            await cloudinary.uploader.destroy(imageId);

            const myCloud = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        } catch (err) {
            return next(new ErrorHandler("Error uploading avatar"));
        }
    }

    await User.findByIdAndUpdate(
        req.user.id,
        newUserData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        },
    );

    return res.status(200).json({
        success: true,
        message: "User Profile Update Successfully.",
    });
});

// Get All Users (admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const allUser = await User.find();

    return res.status(200).json({
        success: true,
        allUser,
        message: "Successfully retrieved information for all users.",
    });
});

// Get Single Users (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with Id: ${req.params.id}`, 404));
    }

    return res.status(201).json({
        success: true,
        user,
        message: "User retrieved successfully.",
    });
});

// Update User Role (admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(
        req.params.id,
        newUserData,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        },
    );

    if (!user) {
        return next(new ErrorHandler(`User not found for the specified ID: ${req.params.id}`, 404));
    }

    try {
        await sendEmail({
            email: user.email,
            subject: `User Role Update Confirmation`,
            message: roleUpdatedTemplate(user.name, user.role),
        });

        return res.status(200).json({
            success: true,
            message: "User role update successfully.",
        });

    } catch (err) {
        console.log("Error", err);
        return next(new ErrorHandler(err.message, 500));
    }
});

// Delete User (admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with Id: ${req.params.id}`, 404));
    }

    try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
    } catch (err) {
        return next(new ErrorHandler("Error deleting user's avatar from Cloudinary"));
    }

    await user.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
    });
});