const Product = require('../models/product');
const Order = require('../models/order');
const JSONProduct = require('../models/json-products');

const ITEMS_PER_PAGE = 10;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    console.log(page);
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log(error);
            return next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            const total = user.cart.cartTotal;
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                cartTotal: total
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        });
    // Product.findById(prodId, (product) => {
    //     Cart.addProduct(prodId, product.price);
    // });
    // res.redirect('/cart');
};

exports.postCartDeleteProducts = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {quantity: i.quantity, product: { ...i.productId._doc }, productTotal: i.productTotal};
            });
            orderTotal = products.reduce((t, {productTotal}) => t + productTotal, 0);
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products,
                orderTotal: orderTotal
            });
            return order.save();
        })
        .then(result => {
            req.user.clearCart();
        })
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getOrders = (req, res, next) => {
    Order.find({"user.userId": req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Orders',
                orders: orders
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getJSON = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    JSONProduct.fetchAll((products) => {
        totalItems = products.length;
        const offset = ITEMS_PER_PAGE * (page - 1);
        const paginatedProducts = products.slice(offset, ITEMS_PER_PAGE * page);
        
        res.render('shop/json-products', {
            path: '/json-products',
            pageTitle: 'JSON Products', 
            prods: paginatedProducts,
            currentPage: page, 
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    })
};