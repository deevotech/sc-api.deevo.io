var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var Product = require('../models/product.js');
var constants = require('../configs/constants.js');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(function (req, res, next) {      
    return next(new Error('Out of scope, this action is not implemented yet.'));
})

.post(function (req, res, next) {
    var newProduct = new Product({
        id: req.body.id || uuidv1(),
        objectType: constants.ObjectTypes.Product,
        name: req.body.name,
        content: req.body.content
    })
    newProduct.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the Product : ' + newProduct.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:productId')
.get(function (req, res, next) {    
    Product.find(req.params.productId).then(Product => {       
        res.json(Product);
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var updateProduct = new Product({
        id: req.params.productId,
        objectType: req.body.objectType || constants.ObjectTypes.Product,
        name: req.body.name,
        content: req.body.content
    })
    updateProduct.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the Product : ' + updateProduct.id);
        }
    }).catch(err => {
        if(err) return next(err);
    });
})

.delete(function (req, res, next) {    
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

module.exports = router;