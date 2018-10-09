'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var Supplychain = class {

    constructor(opts) {
        this.id = opts.id,
        this.objectType = opts.objectType || constants.ObjectTypes.Supplychain,
        this.name = opts.name,
        this.content = opts.content;
    }

    toString()
    {        
        return "[ Supplychain-id: " + this.id + " , name: " + this.name + 
            " , objectType: " + this.objectType + " , content: " + this.content + " ]";   
    }

    create()
    {
        return network.invoke('createTraceable', this);
    }

    update()
    {
        return network.invoke('updateTraceable', this);        
    }

    static getObjectType()
    {
        return constants.ObjectTypes.Supplychain;
    }

    static find(id)
    {
        return network.query('getObject', id, Supplychain.getObjectType());
    }

    static findLogs(supplychainId)
    {
        return network.query('getLogsOfSupplychain', supplychainId);
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  Supplychain.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = Supplychain;