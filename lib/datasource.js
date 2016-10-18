var low = require('node-flat-db');
var storage = require('node-flat-db/file-sync');

var db = low('db.json', {storage: storage});
var analytics = low('analytics.json', {storage: storage});
var beautify = require('js-beautify').js_beautify;
var moment = require('moment');

module.exports = {
    get: function(hash) {
        var response = [];
        if (hash == 'example') {
            // TODO: refactor this out into a json file, could include more examples
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
            }, {
                type: 'text',
                value: 'show functions and complex objects'
            },{
                type: 'script',
                value: 'var person = {};person.full_name = function(first, last) {return first + " " + last;};person.gender = ["male", "female", "trans"];person.planet = "Earth";console.log(person.full_name("Gabriel", "Csapo"));console.log(person);'
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
                    if(block.analytics && block.analytics.runs) {
                        block.analytics.runs = block.analytics.runs.slice(Math.max(block.analytics.runs.length - 75, 1));
                    }
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
                        if(block.analytics && block.analytics.runs) {
                            block.analytics.runs = block.analytics.runs.slice(Math.max(block.analytics.runs.length - 75, 1));
                        }
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
            .push({hash: hash, values: values, date: moment()});
        return;
    },
    record: function(result, code) {
        var previous = db('analytics').find({code: code});
        if (previous) {
            previous.runs = previous.runs || [];
            previous.runs.push([moment().format('x'), result.time]);
             db('analytics')
                .chain()
                .find({code: code})
                .assign(previous)
            result.analytics = db('analytics')
               .chain()
               .find({code: code}).value();
        } else {
            result.code = code;
            result.analytics = {};
            db('analytics')
                .push(result);
        }
    }
}
