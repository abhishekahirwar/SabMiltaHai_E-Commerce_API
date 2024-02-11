const express = require('express');
const {
    registerUser,
    sendOtp,
    loginUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require('../controllers/userController');
const { isAuthenticatedUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/otp').post(sendOtp);

router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logout);

router.route('/me').get(isAuthenticatedUser, getUserDetails);

router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me/update').put(isAuthenticatedUser, updateProfile);

// Admin routes
router.route('/admin/users').get(isAuthenticatedUser, isAdmin, getAllUser);

router.route('/admin/user/:id')
    .get(isAuthenticatedUser, isAdmin, getSingleUser)
    .put(isAuthenticatedUser, isAdmin, updateUserRole)
    .delete(isAuthenticatedUser, isAdmin, deleteUser);

module.exports = router;