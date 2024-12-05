const express = require('express');
const {
    newOrder,
    getSingleOrder,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    earnings
} = require('../controllers/orderController');
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Order Route
router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

// Admin Order Route
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("Admin"), getAllOrders);

router.route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("Admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("Admin"), deleteOrder);

router.route('/admin/earnings').get(isAuthenticatedUser, authorizeRoles("Admin"), earnings);

module.exports = router;
