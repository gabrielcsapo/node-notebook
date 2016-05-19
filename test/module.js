var assert = require('chai').assert;
var notebook = require('../lib/vm');

describe('Module', function() {
    this.timeout(100000);

    it('should test module with sync code', function(done) {
        var code = 'var moment=require("moment");moment().format("x");';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isString(result.time, 'time is a string');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test /api/run with simple math', function(done) {
        var code = 'var number = 5+5;number;';

        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isString(result.time, 'time is a string');
            assert.equal(result.result, '10', 'result is 10 which is 5+5');
            assert.equal(result.type, 'Number', 'result type is Number');
            done();
        });
    });

    it('should return hello world in trace', function(done) {
        var code = 'var c = function(callback) { callback("hello-world"); }; c(function(val) { console.log(val); });';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'response is an object');
            assert.isString(result.time, 'time is a string');
            assert.equal(result.trace[0], 'hello-world', 'response trace is hello-world');
            done();
        });
    });

    it('should run a code sample with a specific version of a module', function(done) {
        var code = 'require("moment@2.13.0")().format("x");';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isString(result.time, 'time is a string');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

});
