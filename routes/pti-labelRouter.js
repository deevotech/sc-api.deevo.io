var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var PTILabel = require('../models/pti-label.js');
var constants = require('../utils/constants.js');

var router = express.Router();
router.use(bodyParser.json());

//=============== /api/v1/pti-labels  ===================
router.route('/')
.get(function (req, res, next) {      
    PTILabel.getAll().then(PTILabels => {       
        res.json(PTILabels.map(i => i.Record));
    }).catch(err => {
        if(err) return next(err);
    });
})

.post(function (req, res, next) {
    var newPTILabel = new PTILabel({
        id: req.body.id || uuidv1(),
        objectType: PTILabel.getObjectType(),
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    newPTILabel.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the PTILabel : ' + newPTILabel.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

//=============== /api/v1/pti-labels/ptiLabelId  ===================
router.route('/:ptiLabelId')
.get(function (req, res, next) {    
    PTILabel.find(req.params.ptiLabelId).then(PTILabel => {       
        if(!PTILabel)
        {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end('Could not find object with ID: ' + req.params.ptiLabelId);
        } 
        else 
        {
            res.json(PTILabel);
        }
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var updatePTILabel = new PTILabel({
        id: req.params.ptiLabelId,        
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    updatePTILabel.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the PTILabel : ' + updatePTILabel.id);
        }
    }).catch(err => {
        if(err) return next(err);
    });
})

.delete(function (req, res, next) {    
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

module.exports = router;