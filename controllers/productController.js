const User = require('../model/userModel');
const Product = require('../model/productModel');
const ErrorHandler = require('../util/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../util/apifeatures');
const cloudinary = require('cloudinary').v2;

//  uploadImages -> handler function
async function uploadImages(imgArr, folder) {
    let images = [];

    if (typeof imgArr === "string") {
        images.push(imgArr);
    } else {
        images = imgArr;
    }

    const options = { folder };
    options.resource_type = "auto";

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].tempFilePath, options);

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    return imagesLinks;
};

// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    const uploadedImages = await uploadImages(req.files.images, "Products");
    req.body.images = uploadedImages;
    req.body.userId = req.user.id;

    const product = await Product.create(req.body);

    return res.status(201).json({
        success: true,
        product,
        message: "Product Created Successfully.",
    });
});

// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    let products = await apiFeatures.query;

    let filteredProductsCound = products.length;

    // apiFeatures.pagination(resultPerPage);

    // products = await apiFeatures.query;

    return res.status(200).json({
        success: true,
        products,
        productCount,
        resultPerPage,
        filteredProductsCound,
        message: "All Product Fetched.",
    });
});

// Get All Product -- Admin
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.find();

    if (!product) {
        return next(new ErrorHandler("Products not found.", 400));
    }

    return res.status(201).json({
        success: true,
        product,
        message: "All Product Fetched.",
    });
});

// Get Product Details Or Get Single Product 
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    return res.status(201).json({
        success: true,
        product,
        message: "Product Detail Found.",
    });
});

// Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    // Image starts here
    let images = [];

    if (typeof req.files.images === "string") {
        images.push(req.files.images);
    } else {
        images = req.files.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(images[i].tempFilePath, {
                folder: "Products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        },
    );

    return res.status(201).json({
        success: true,
        product,
        message: "Product Update Successfully.",
    });
});

// Delete Product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    // Before Deleting Product Images Deleting From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
    });
});

// Create New Review Or Update The Review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        userId: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev => rev.userId.toString() === req.user.id.toString());

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.userId.toString() === req.user.id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach(rev => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: "Review Submited Successfully.",
    });
});

// Get All Review of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    if (product.reviews.length === 0) {
        return next(new ErrorHandler("No reviews found for this product.", 404));
    }

    return res.status(201).json({
        success: true,
        review: product.reviews,
        message: "All reviews of product.",
    });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    const isReviewed = product.reviews.find(rev => rev.userId.toString() === req.user.id.toString());

    if (!isReviewed) {
        return next(new ErrorHandler("you can't delete the review because you didn't give this review.", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.reviewId.toString());

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        },
    );

    return res.status(201).json({
        success: true,
        message: "Review Deleted Successfully.",
    });
});

// Add to Cart Products
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.body.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found.", 404));
    }

    if (req.user.cart.length === 0) {
        req.user.cart.push(product);
    } else {
        let isProductFound = false;

        for (let i = 0; i < req.user.cart.length; i++) {
            if (req.user.cart[i]._id.equals(product._id)) {
                isProductFound = true;
            }
        }

        if (isProductFound) {
            return next(new ErrorHandler("This Product is already added in your cart.", 404));
        } else {
            req.user.cart.push(product);
        }
    }

    await req.user.save();

    return res.status(200).json({
        success: true,
        message: "Add to cart successfully.",
    });
});

// Product Remove From Cart
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {

    if (!req.user.cart.includes(req.body.productId)) {
        return next(new ErrorHandler("Product with ID ${productId} not found in your cart.", 404))
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { cart: req.body.productId } },
        { new: true },
    );

    if (!user) {
        return next(new ErrorHandler("User not found.", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Product removed from the cart successfully.",
    });
});

// Get All Products of Cart
exports.getCartProducts = catchAsyncErrors(async (req, res, next) => {
    const cartProducts = await Product.find({ _id: { $in: req.user.cart } });

    return res.status(200).json({
        success: true,
        cartProducts,
        message: "Cart products retrieved successfully.",
    });
});