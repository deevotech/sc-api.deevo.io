var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var AuditAction = require('../models/auditAction.js');
var constants = require('../utils/constants.js');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(function (req, res, next) {      
    let auditor = req.query.auditor;
    AuditAction.getAll(auditor).then(actions => {               
        res.json(actions.map(i => i.Record));
    }).catch(err => {
        if(err) return next(err);
    }); 
})

.post(function (req, res, next) {

    let action = undefined;
    if ( (req.body instanceof Array) && req.body.length >0 ) {
        action = req.body[0]
    }else
    {
        action = req.body;
    }

    if(action.content)
        action.content = JSON.stringify(action.content);
     
    var newAction = new AuditAction({
        id:         action.id ||uuidv1(),
        objectType: AuditAction.getObjectType(),
        time:       action.time,
        auditor:    action.auditor,
        location:   action.location,
        objectId:   action.objectId,
        content:    action.content
    })
    newAction.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the audit-action : ' + newAction.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:auditActionId')
.get(function (req, res, next) {    
    AuditAction.find(req.params.auditActionId).then(action => {       
        if(!action)
        {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end('Could not found object with ID: ' + req.params.auditActionId);
        } 
        else
        {
            res.json(action);
        }
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var newAction = new AuditAction({
        id:         req.params.auditActionId,                        
        time:       req.body.time,
        auditor:    req.body.auditor,
        location:   req.body.location,
        objectId:   req.body.objectId,
        content:    req.body.content
    })

    if(newAction.content)
        newAction.content = JSON.stringify(newAction.content);

    newAction.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the audit-action : ' + newAction.id);
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