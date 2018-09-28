var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var Log = require('../models/log.js');
var constants = require('../configs/constants.js');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(function (req, res, next) {      
    return next(new Error('Out of scope, this action is not implemented yet.'));
})

.post(function (req, res, next) {
    var newLog = new Log({
        id:         req.body.id ||uuidv1(),
        objectType: req.body.objectType || constants.ObjectTypes.Log,
        time:       req.body.time,
        ref:        req.body.ref,
        cte:        req.body.cte,
        content:    req.body.content,
        asset:      req.body.asset,
        product:    req.body.product,
        location:   req.body.location
    })
    newLog.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the Log : ' + newLog.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:logId')
.get(function (req, res, next) {    
    Log.find(req.params.logId).then(Log => {       
        res.json(Log);
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var newLog = new Log({
        id:         req.params.logId,
        objectType: req.body.objectType || constants.ObjectTypes.Log,
        time:       req.body.time,
        ref:        req.body.ref,
        cte:        req.body.cte,
        content:    req.body.content,
        asset:      req.body.asset,
        product:    req.body.product,
        location:   req.body.location
    })
    newLog.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the Log : ' + newLog.id);
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