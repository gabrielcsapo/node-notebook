module.exports = {
    get: function(hash) {
        if (hash == 'test') {
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
            return [];
        }
    },
    set: function() {

    }
}
