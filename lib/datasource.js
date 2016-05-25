var low = require('lowdb');
var storage = require('lowdb/file-sync');

var db = low('db.json', {storage: storage});
var analytics = low('analytics.json', {storage: storage});
var beautify = require('js-beautify').js_beautify;

module.exports = {
    get: function(hash) {
        var response = [];
        if (hash == 'example') {
            [{
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
            },{
                type: 'text',
                value: 'console statements appear'
            },{
                type: 'script',
                value: 'for(var i = 0; i < 5; i++) { console.log(i); }'
            },{
                type: 'text',
                value: 'objects print out'
            },{
                type: 'script',
                value: 'var object = {name: "Gabriel J. Csapo", age: 21, gender: "Male"};\n object;'
            },{
                type: 'text',
                value: 'nested objects'
            },{
                type: 'script',
                value: 'var object = {names: ["John Doe", "Alfred Alfy", "Ben and Jerry"]};\n object;'
            },{
                type: 'script',
                value: 'var object = {people: { name: "John Doe", friends: ["Alfred Alfy", "Ben and Jerry"]}};\n object;'
            },{
                type: 'text',
                value: 'require code from npm'
            },{
                type: 'script',
                value: 'var moment = require("moment");\n moment;'
            },{
                type: 'script',
                value: 'moment().format("x");'
            },{
                type: 'text',
                value: 'require specific modules from npm'
            },{
                type: 'script',
                value: 'require("moment@2.13.0")().format("x");'
            }].forEach(function(block) {
                if(block.type == 'script') {
                    block.value = beautify(block.value);
                    block.analytics = analytics('analytics').find({code: block.value});
                    response.push(block);
                } else {
                    response.push(block);
                }
            });
            return response;
        } else {
            if(db('notebooks').find(({hash: hash}))) {
                db('notebooks').find(({hash: hash})).values.forEach(function(block) {
                    if(block.type == 'script') {
                        block.value = beautify(block.value);
                        block.analytics = analytics('analytics').find({code: block.value});
                        response.push(block);
                    } else {
                        response.push(block);
                    }
                });
                return response;
            } else {
                return {};
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
