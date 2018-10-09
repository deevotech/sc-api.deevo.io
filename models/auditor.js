'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network');

var Auditor = class {

    constructor(opts) {
        this.id = opts.id;
        this.objectType = opts.objectType || constants.ObjectTypes.Auditor;        
        this.name = opts.name;
        this.content = (opts.content && opts.content instanceof Object) ? 
                        JSON.stringify(opts.content) : opts.content;
    }

    toString()
    {
        return "[ auditor-id: " + this.id + " , name: " + this.name + 
        " , objectType: " + this.objectType + " , content: " + this.content + " ]";   
    }

    create()
    {
        return network.invoke('createAuditor', this);        
    }

    update()
    {
        return network.invoke('updateAuditor', this);        
    }

    static getObjectType()
    {
        return constants.ObjectTypes.Auditor;
    }

    static find(auditorID)
    {
        return network.query('getObject', auditorID, Auditor.getObjectType());
    }

    static findAudits(auditorID)
    {
        return network.query('getAuditsOfAuditor', auditorID);
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  Auditor.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = Auditor;