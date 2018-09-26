'use strict';

var os = require('os');
var path = require('path');

var tempdir = path.join(os.tmpdir(), 'hfc');

module.exports = {
    tempdir: tempdir        
};

module.exports.ObjectTypes = {};
module.exports.ObjectTypes.Auditor = 'auditor';