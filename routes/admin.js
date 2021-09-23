const path = require('path');
const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product', 
        path: '/admin/add-product'});
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    const newProduct = {title: req.body.title, author: req.body.author, description: req.body.description, price: req.body.price}
    products.push(newProduct);
    res.redirect('/');
});

router.get('/remove-product', (req, res, next) => {
    res.render('remove-product', {
        pageTitle: 'Remove Product',
        path: '/admin/remove-product',
        prods: products
    });
});

router.post('/remove-product', (req, res, next) => {
    let removeProduct = req.body.removeProduct;
    const index = products.findIndex(x => x.title === removeProduct);
    if (index != -1) {
        products.splice(index, 1);
    }
     res.redirect('/');   
});


exports.routes = router;
exports.products = products;
