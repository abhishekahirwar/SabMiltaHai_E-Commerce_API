const express = require('express');

const {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductDetails,
    createProductReview,
    getProductReviews,
    deleteReview,
    getAdminProducts,
    addToCart,
    removeFromCart,
    getCartProducts
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Product Route
router.route("/admin/product/new").post(isAuthenticatedUser, authorizeRoles("Admin"), createProduct);

router.route("/products").get(getAllProducts);

router.route("/admin/products").get(isAuthenticatedUser, authorizeRoles("Admin"), getAdminProducts);

router.route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRoles("Admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("Admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

// Reviews Route
router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser, deleteReview);

router.route('/cart')
    .post(isAuthenticatedUser, addToCart)
    .put(isAuthenticatedUser, removeFromCart)
    .get(isAuthenticatedUser, getCartProducts);

module.exports = router; 