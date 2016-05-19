var low = require('lowdb')
var storage = require('lowdb/file-sync')

var db = low('db.json', {storage: storage})

module.exports = {
    get: function(hash) {
        if (hash == 'example') {
            return [{
                type: 'script',
                value: 'var i = 5;'
            },{
                type: 'text',
                value: 'you can use simple numbers?'
            },{
                type: 'script',
                value: 'i;'
            },{
                type: 'text',
                value: 'you can even show arrays'
            },{
                type: 'script',
                value: 'var array = [1,2,3];'
            },{
                type: 'script',
                value: 'array;'
            },{
                type: 'text',
                value: 'hey look errors'
            },{
                type: 'script',
                value: 'd;'
            }];
        } else {
            if(db('notebooks').find(({hash: hash}))) {
                return db('notebooks').find(({hash: hash})).values;
            } else {
                return [];
            }
        }
    },
    set: function(hash, values) {
        db('notebooks')
            .remove({hash: hash})
        db('notebooks')
            .push({hash: hash, values: values});
        return;
    }
}
