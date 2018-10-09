'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var Location = class {

    constructor(opts) {
        this.id = opts.id,
        this.objectType = opts.objectType || constants.ObjectTypes.Location,
        this.parent = opts.parent,
        this.name = opts.name,
        this.content = (opts.content && opts.content instanceof Object) ? 
                        JSON.stringify(opts.content) : opts.content;
    }

    toString()
    {        
        return "[ location-id: " + this.id + " , name: " + this.name + 
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
        return constants.ObjectTypes.Location;
    }

    static find(id)
    {
        return network.query('getObject', id, Location.getObjectType());
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  Location.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = Location;