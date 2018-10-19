var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var LogisticUnit = require('../models/logistic-unit.js');
var constants = require('../utils/constants.js');

var router = express.Router();
router.use(bodyParser.json());

//=============== /api/v1/logistic-units  ===================
router.route('/')
.get(function (req, res, next) {      
    LogisticUnit.getAll().then(LogisticUnits => {       
        res.json(LogisticUnits.map(i => i.Record));
    }).catch(err => {
        if(err) return next(err);
    });
})

.post(function (req, res, next) {
    var logisticUnit = new LogisticUnit({
        id: req.body.id || uuidv1(),
        objectType: LogisticUnit.getObjectType(),
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    logisticUnit.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the Logistic-Unit : ' + logisticUnit.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

//=============== /api/v1/logistic-units/logisticUnitId  ===================
router.route('/:logisticUnitId')
.get(function (req, res, next) {    
    LogisticUnit.find(req.params.logisticUnitId).then(LogisticUnit => {       
        if(!LogisticUnit)
        {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end('Could not find object with ID: ' + req.params.logisticUnitId);
        } 
        else 
        {
            res.json(LogisticUnit);
        }
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var updateLogisticUnit = new LogisticUnit({
        id: req.params.logisticUnitId,        
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    updateLogisticUnit.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the LogisticUnit : ' + updateLogisticUnit.id);
        }
    }).catch(err => {
        if(err) return next(err);
    });
})

.delete(function (req, res, next) {    
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

module.exports = router;