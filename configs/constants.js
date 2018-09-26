'use strict';

var os = require('os');
var path = require('path');

var tempdir = path.join(os.tmpdir(), 'hfc');

module.exports = {
    tempdir: tempdir        
};

module.exports.ObjectTypes = {};
module.exports.ObjectTypes.Auditor = 'auditor';

module.exports.ChannelName = 'baotestchannel'
module.exports.ChainCodeId = 'food_supplychain'

module.exports.OrgAdmin = {}
module.exports.OrgAdmin.Username = 'admin-org1'
module.exports.OrgAdmin.Password = 'admin-org1pw'