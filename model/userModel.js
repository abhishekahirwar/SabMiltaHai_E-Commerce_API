const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "Please Enter Your First Name"],
            trim: true,
            minLength: [4, "First Name should have more than 4 characters"],
            maxLength: [30, "First Name can't exceed 30 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Please Enter Your Last Name"],
            trim: true,
            minLength: [4, "Last Name should have more than 4 characters"],
            maxLength: [30, "Last Name can't exceed 30 characters"],
        },
        email: {
            type: String,
            required: [true, "Please Enter Your Email"],
            unique: true,
            validate: [validator.isEmail, "Please Enter Valid Email"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please Enter Your Password"],
            minLength: [8, "Password should not be less than 8 characters"],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        },
        role: {
            type: String,
            required: true,
            enum: ["User", "Admin"],
            default: "User",
        },
        cart: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
            },
        ],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true },
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token
userSchema.methods.getJWTToken = function () {
    // const payload = { id: this._id, email: this.email, role: this.role };
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE },
    );
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Expire resetPasswordToken
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
