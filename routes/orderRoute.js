const express = require('express');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    earnings,
    getEarningCategoryWise
} = require('../controllers/orderController');
const router = express.Router();

const { isAuthenticatedUser, isAdmin } = require('../middleware/auth');

// Order Route
router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// Admin Order Route
router.route("/admin/orders").get(isAuthenticatedUser, isAdmin, getAllOrders);

router.route("/admin/order/:id")
    .put(isAuthenticatedUser, isAdmin, updateOrder)
    .delete(isAuthenticatedUser, isAdmin, deleteOrder);

router.route('/admin/earnings').get(isAuthenticatedUser, isAdmin, earnings);

module.exports = router;