var assert = require('chai').assert;
var fs = require('fs');
var notebook = require('../lib/vm');

describe('Module', function() {
    this.timeout(100000);

    it('should test module with sync code', function(done) {
        var code = 'var moment=require("moment");moment().format("x");';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test /api/run with simple math', function(done) {
        var code = 'var number = 5+5;number;';

        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.equal(result.result, '10', 'result is 10 which is 5+5');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'Number', 'result type is Number');
            done();
        });
    });

    it('should return hello world in trace', function(done) {
        var code = 'var c = function(callback) { callback("hello-world"); }; c(function(val) { console.log(val); });';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'response is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.equal(result.trace[0], 'hello-world', 'response trace is hello-world');
            assert.isObject(result.analytics, 'result analytics is an Array');
            done();
        });
    });

    it('should run a code sample with a specific version of a module', function(done) {
        var code = 'require("moment@2.13.0")().format("x");';
        notebook.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.isArray(result.trace, 'result trace is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test the install function', function(done) {
        notebook.install('sandbox/install', 'moment', function(){
            assert.isOk(fs.existsSync('sandbox/install/node_modules/moment/package.json'));
            done();
        });
    });

    it('should test the type function', function() {
        var type = notebook.type({});
        assert.equal(type, 'Object');
    });

});
