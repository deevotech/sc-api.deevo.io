'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var Log = class {

    constructor(opts) {
        this.id = opts.id;
        this.objectType = opts.objectType || constants.ObjectTypes.Log;        
        this.time = opts.time;
        this.ref = opts.ref;
        this.cte = opts.cte;
        this.content = opts.content;
        this.supplychain_id = opts.supplychain_id;
        this.asset = opts.asset;
        this.product = opts.product;
        this.location = opts.location;
    }

    toString()
    {
        return "[ Log-id: " + this.id + " , time: " + this.time + 
        " , objectType: " + this.objectType + " , content: " + this.content + " ]";   
    }

    create()
    {
        return network.invoke('createLog', this);        
    }

    update()
    {
        return network.invoke('updateLog', this);        
    }

    static getObjectType()
    {
        return constants.ObjectTypes.Log;
    }

    static find(id)
    {
        return network.query('getObject', id, Log.getObjectType());
    }

    static getAll()
    {        
        let queryString = {
            "selector": {
                "objectType":  Log.getObjectType()
            } 
        }
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }

    static sortByTimestampDesc(obj1, obj2)
    {
        return obj2.Record.time - obj1.Record.time;
    }

    static sortByTimestampAsc(obj1, obj2)
    {
        return obj1.Record.time - obj2.Record.time;
    }
}

module.exports = Log;