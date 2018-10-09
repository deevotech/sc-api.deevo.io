'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var Asset = class {

    constructor(opts) {
        this.id = opts.id,
        this.objectType = opts.objectType  || constants.ObjectTypes.Asset,
        this.parent = opts.parent,
        this.name = opts.name,
        this.content = (opts.content && opts.content instanceof Object) ? 
                        JSON.stringify(opts.content) : opts.content;
    }

    toString()
    {        
        return "[ Asset-id: " + this.id + " , name: " + this.name + 
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
        return constants.ObjectTypes.Asset;
    }

    static find(id)
    {
        return network.query('getObject', id, Asset.getObjectType());
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  Asset.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = Asset;