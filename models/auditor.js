'use strict';

const network = require('../libs/fabric-lib/food-supply-chain-network');

var Auditor = class {

    constructor(opt) {
        this.id = opt.id;
        this.objectType = opt.objectType;        
        this.name = opt.name;
        this.content = opt.content;
    }

    create()
    {
        return network.invoke('createAuditor', this);        
    }

    toString()
    {
        return "[ auditor-id: " + this.id + " , name: " + this.name + 
        " , objectType: " + this.objectType + " , content: " + this.content + " ]";   
    }
}

module.exports = Auditor;