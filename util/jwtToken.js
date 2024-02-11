// Create Token and saving in cookies

const sendToken = (user, statusCode, message, res) => {
    const token = user.getJWTToken();

    // options for cookies
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    user.password = undefined;

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user,
        message,
    });
};

module.exports = sendToken;