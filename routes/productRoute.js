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
const { isAuthenticatedUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Product Route
router.route("/admin/product/new").post(isAuthenticatedUser, isAdmin, createProduct);

router.route("/products").get(getAllProducts);

router.route("/admin/products").get(isAuthenticatedUser, isAdmin, getAdminProducts);

router.route("/admin/product/:id")
    .put(isAuthenticatedUser, isAdmin, updateProduct)
    .delete(isAuthenticatedUser, isAdmin, deleteProduct);

router.route("/product/:id").get(getProductDetails);

// Reviews Route
router.route("/review").put(isAuthenticatedUser, createProductReview);

router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser, deleteReview);

router.route('/cart')
    .post(isAuthenticatedUser, addToCart)
    .put(isAuthenticatedUser, removeFromCart)
    .get(isAuthenticatedUser, getCartProducts);

module.exports = router; 