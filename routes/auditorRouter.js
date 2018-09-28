var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var Auditor = require('../models/auditor.js');
var constants = require('../configs/constants.js');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(function (req, res, next) {      
    return next(new Error('Out of scope, this action is not implemented yet.'));
})

.post(function (req, res, next) {
    var newAuditor = new Auditor({
        id: req.body.id ||uuidv1(),
        objectType: constants.ObjectTypes.Auditor,
        name: req.body.name,
        content: req.body.content
    })
    newAuditor.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the auditor : ' + newAuditor.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:auditorId')
.get(function (req, res, next) {    
    Auditor.find(req.params.auditorId).then(auditor => {       
        res.json(auditor);
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var newAuditor = new Auditor({
        id: req.params.auditorId,
        objectType: constants.ObjectTypes.Auditor,
        name: req.body.name,
        content: req.body.content
    })
    newAuditor.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the auditor : ' + newAuditor.id);
        }
    }).catch(err => {
        if(err) return next(err);
    });
})

.delete(function (req, res, next) {    
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:auditorId/actions')
.get(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        res.json(dish.comments);
    });
})

.post(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        for (var i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save(function (err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

// ======================================================

router.route('/:auditorId/actions/:actionId')
.get(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        res.json(dish.comments.id(req.params.commentId));
    });
})

.put(function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Dishes.findById(req.params.dishId, function (err, dish) {
        if (err) throw err;
        dish.comments.id(req.params.commentId).remove();
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(function (req, res, next) {
    Dishes.findById(req.params.dishId, function (err, dish) {
        dish.comments.id(req.params.commentId).remove();
        dish.save(function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = router;