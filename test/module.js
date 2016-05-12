var assert = require('chai').assert;
var jaas = require('../lib/vm');

describe('Sever', function() {
    this.timeout(100000);

    it('should test module with sync code', function(done) {
        var code = 'var moment=require("moment");moment().format("x");';
        jaas.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test /api/run with async code', function(done) {
        var code = 'var request = require("request-promise"); var response = await request({ url: "https://graph.facebook.com/?id=http://news.ycombinator.com", json: true });';
        jaas.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isObject(result.result, 'result result is a Object');
            assert.equal(result.result.id, 'http://news.ycombinator.com', 'id is http://news.ycombinator.com');
            assert.isNumber(result.result.shares, 'shares is a number');
            assert.isNumber(result.result.comments, 'comments is a number');
            assert.equal(result.type, 'Object', 'result type is Object');
            done();
        });
    });

    it('should test /api/run with simple math', function(done) {
        var code = 'var number = 5+5;number;';

        jaas.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.equal(result.result, '10', 'result is 10 which is 5+5');
            assert.equal(result.type, 'Number', 'result type is Number');
            done();
        });
    });

    it('should return hello world in trace', function(done) {
        var code = 'var c = function(callback) { callback("hello-world"); }; c(function(val) { console.log(val); });';
        jaas.run(code, Date.now(), function(result) {
            assert.isObject(result, 'response is an object');
            assert.equal(result.trace[0], 'hello-world', 'response trace is hello-world');
            done();
        });
    })

});
