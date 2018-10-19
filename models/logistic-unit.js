'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var LogisticUnit = class {

    constructor(opts) {
        this.id = opts.id,
        this.objectType = opts.objectType || LogisticUnit.getObjectType(),
        this.parent = opts.parent,
        this.name = opts.name,
        this.content = opts.content;
        this.content = (opts.content && opts.content instanceof Object) ? 
                        JSON.stringify(opts.content) : opts.content;
    }

    toString()
    {        
        return "[ LogisticUnit-id: " + this.id + " , name: " + this.name + 
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
        return constants.ObjectTypes.LogisticUnit;
    }

    static find(id)
    {        
        return network.query('getObject', id, LogisticUnit.getObjectType());
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  LogisticUnit.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = LogisticUnit;