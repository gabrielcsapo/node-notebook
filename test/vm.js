var assert = require('chai').assert;
var expect = require('chai').expect;
var fs = require('fs');
var vm = require('../lib/vm');

describe('Module', function() {
    this.timeout(100000);

    it('should test module with sync code', function(done) {
        var code = 'var moment=require("moment");moment().format("x");';
        vm.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.isArray(result.logs, 'result logs is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test /api/run with simple math', function(done) {
        var code = 'var number = 5+5;number;';

        vm.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.equal(result.result, '10', 'result is 10 which is 5+5');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'Number', 'result type is Number');
            done();
        });
    });

    it('should return hello world in logs', function(done) {
        var code = 'var c = function(callback) { callback("hello-world"); }; c(function(val) { console.log(val); });';
        vm.run(code, Date.now(), function(result) {
            assert.isObject(result, 'response is an object');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.equal(result.logs[0], '"hello-world"', 'response logs is hello-world');
            assert.isObject(result.analytics, 'result analytics is an Array');
            done();
        });
    });

    it('should run a code sample with a specific version of a module', function(done) {
        var code = 'require("moment@2.14.1")().format("x");';
        vm.run(code, Date.now(), function(result) {
            assert.isObject(result, 'result is an object');
            assert.isUndefined(result.error, 'result has no error attribute');
            assert.isNumber(result.time, 'time is a number representing milleseconds');
            assert.isArray(result.logs, 'result logs is an Array');
            assert.isString(result.result, 'result result is a string');
            assert.isObject(result.analytics, 'result analytics is an Array');
            assert.equal(result.type, 'String', 'result type is string');
            done();
        });
    });

    it('should test the install function', function(done) {
        vm.install('sandbox/install', 'moment', function(){
            assert.isOk(fs.existsSync('sandbox/install/node_modules/moment/package.json'));
            done();
        });
    });

    it('should be able to see variable defined in previous run', function(done) {
        var session = new Date();
        vm.run('var b = 5;', session, function() {
            vm.run('b;', session, function(result){
              assert.isObject(result, 'result is an object');
              assert.equal(result.result, 5, 'result.result is equal to 5');
              assert.isUndefined(result.error, 'result has no error attribute');
              assert.isNumber(result.time, 'time is a number representing milleseconds');
              assert.isArray(result.logs, 'result logs is an Array');
              assert.isString(result.result, 'result result is a string');
              assert.isObject(result.analytics, 'result analytics is an Array');
              assert.equal(result.type, 'Number', 'result type is numer');
              done();
            });
        });
    });

    it('should fail an install and return an error', function(done) {
      vm.install('sandbox/install', 'wootwootwootwoot', function(result){
          assert.isObject(result);
          assert.equal(result.error, 'Could not install module wootwootwootwoot');
          done();
      });
    });

    it('should throw an error if the callback is not a function', function(done) {
        expect(function(){
          vm.install('sandbox/install', 'wootwootwootwoot', 'going to fail');
        }).to.throw(TypeError);
        done();
    });

    it('should parse function', function() {
      var result = function() {
        return;
      }
      assert.isString(vm.parse(result));
    });

    it('should parse objects containing functions', function() {
      var result = {
        test: function() {
          return;
        }
      };
      assert.isString(vm.parse(result));
    });

    it('should parse object that have fn', function() {
      var result = {
        fn: {
          test: function() {
            return;
          }
        }
      };
      assert.isString(vm.parse(result));
    });

    it('should test the type function', function() {
        var type = vm.type({});
        assert.equal(type, 'Object');
    });

});
