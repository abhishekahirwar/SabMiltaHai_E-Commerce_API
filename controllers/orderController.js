const Order = require('../model/orderModel');
const Product = require('../model/productModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../util/errorhandler');

// Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        paymentInfo,
        orderItems,
        // itemsPrice,
        taxPrice,
        shippingPrice,
        // totalPrice
    } = req.body;

    const productId = orderItems[0]["productId"];
    const quantity = orderItems[0]["quantity"];

    const product = await Product.findById(productId);

    const order = await Order.create({
        shippingInfo,
        orderItems: [
            {
                name: product.name,
                price: product.price,
                quantity,
                image: product.images,
                productId,
            }
        ],
        paymentInfo,
        itemsPrice: product.price * quantity,
        taxPrice,
        shippingPrice,
        totalPrice: (product.price * quantity) + (taxPrice + shippingPrice),
        userId: req.user.id,
        paidAt: Date.now(),
    });

    return res.status(201).json({
        success: true,
        order,
        message: "Product Ordered Successfully.",
    });
});

// Get Single Order or Order Details
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id }).populate("userId", "firstName lastName email");

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    return res.status(200).json({
        success: true,
        order,
        message: "Order retrieved successfully.",
    });
});

// Get Logged in User Order
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({ userId: req.user.id });

    if (!orders) {
        return next(new ErrorHandler("Orders not found.", 404));
    }

    return res.status(201).json({
        success: true,
        orders,
        message: "Order Found Successfully.",
    });
});

// Get All Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler("Orders not found.", 404));
    }

    let totalAmount = 0;

    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    return res.status(201).json({
        success: true,
        orders,
        totalAmount,
        message: "All orders found successfully.",
    });
});

// Update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with this Id ${req.params.id}`, 400));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    if (req.body.status === "Delivered") {
        order.orderItems.forEach(async (orders) => {
            await updateStock(orders.productId, orders.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    return res.status(201).json({
        success: true,
        message: "Order Status Update Successfully.",
    });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
};

// Delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
        return next(new ErrorHandler(`Order not found with this Id: ${req.params.id}`, 404));
    }

    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully.",
    });
});

// Earning -- Admin
exports.earnings = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    if (!orders) {
        return next(new ErrorHandler("No Order Are Places", 401));
    }

    let totalEarnings = 0;

    for (let i = 0; i < orders.length; i++) {
        if (orders[i].orderStatus === "Delivered") {
            totalEarnings += orders[i].itemsPrice;
        }
    }

    //Get Earning Category Wise
    if (req.query.category) {
        let earningCategory = await fetchCategoryWiseOrder(req.query.category);

        if (!earningCategory) {
            return next(new ErrorHandler("No earnings found for the specified category.", 404));
        }

        return res.status(200).json({
            success: true,
            earningCategory,
            message: "Earning fetched successfully.",
        });
    }

    // CATEGORY WISE EARNING FETCHING
    let mobileEarnings = await fetchCategoryWiseOrder("Mobile");
    let booksEarnings = await fetchCategoryWiseOrder("Book");
    let fashionEarnings = await fetchCategoryWiseOrder("Fashion Accessories");
    let electronicEarnings = await fetchCategoryWiseOrder("Electronics Accessories");

    let earnings = {
        totalEarnings,
        mobileEarnings,
        booksEarnings,
        fashionEarnings,
        electronicEarnings,
    };

    return res.status(200).json({
        success: true,
        earnings,
        message: "All earning fetched.",
    });
});

async function fetchCategoryWiseOrder(category) {
    let earnings = 0;
    const order = await Order.find();

    for (let i = 0; i < order.length; i++) {
        for (let j = 0; j < order[i].orderItems.length; j++) {
            const product = await Product.findById(order[i].orderItems[j].productId);
            const cate = product.category;
            if (cate.toLowerCase() === category.toLowerCase()) {
                earnings += order[i].itemsPrice;
            }
        }
    }
    return earnings;
};
