var uuidv1 = require('uuid/v1');
var express = require('express');
var bodyParser = require('body-parser');
var Party = require('../models/party.js');
var constants = require('../utils/constants.js');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.get(function (req, res, next) {      
    Party.getAll().then(parties => {       
        res.json(parties.map(i => i.Record));
    }).catch(err => {
        if(err) return next(err);
    });
})

.post(function (req, res, next) {
    var newParty = new Party({
        id: req.body.id || uuidv1(),
        objectType: constants.ObjectTypes.Party,
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    newParty.create().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the auditor : ' + newParty.id);        
        }
    }).catch(err => {
        if(err) return next(err);        
    });    
})

.delete(function (req, res, next) {
    return next(new Error('Out of scope, this action is not implemented yet.'));
});

// ======================================================

router.route('/:partyId')
.get(function (req, res, next) {    
    Party.find(req.params.partyId).then(party => {       
        if(!party)
        {
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            res.end('Could not found object with ID: ' + req.params.partyId);
        } 
        else 
        {
            res.json(party);
        }
    }).catch(err => {
        if(err) return next(err);
    });    
})

.put(function (req, res, next) {
    var updateParty = new Party({
        id: req.params.partyId,        
        parent: req.body.parent,
        name: req.body.name,
        content: req.body.content
    })
    updateParty.update().then(status => {        
        if(status == "SUCCESS")
        {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Updated the party : ' + updateParty.id);
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