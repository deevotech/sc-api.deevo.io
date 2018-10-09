'use strict';

var constants = require('../utils/constants.js');
const network = require('../libs/fabric-lib/food-supply-chain-network.js');

var Product = class {

    constructor(opts) {
        this.id = opts.id,
        this.objectType = opts.objectType || constants.ObjectTypes.Product,
        this.parent = opts.parent,
        this.name = opts.name,
        this.content = opts.content;
        this.content = (opts.content && opts.content instanceof Object) ? 
                        JSON.stringify(opts.content) : opts.content;
    }

    toString()
    {        
        return "[ Product-id: " + this.id + " , name: " + this.name + 
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
        return constants.ObjectTypes.Product;
    }

    static find(id)
    {        
        return network.query('getObject', id, Product.getObjectType());
    }

    static findLogs(productId)
    {
        return network.query('getLogsOfProduct', productId);
    }

    static getAll()
    {     
        let queryString = {
            "selector": {
                "objectType":  Product.getObjectType()
            } 
        }           
        return network.query('getQueryResultForQueryString', JSON.stringify(queryString));
    }
}

module.exports = Product;