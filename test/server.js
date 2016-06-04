var request = require('supertest');
var assert = require('chai').assert;
var app = require('../index');

describe('Sever', function() {
    this.timeout(100000);

    it('should test /api/run with sync code', function(done) {
        var code = {
            'script': 'var moment=require("moment");moment().format("x");'
        };
        request(app)
            .post('/run')
            .type('json')
            .send(code)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.isObject(res.body, 'response is an object');
                assert.isNumber(res.body.time, 'time is a number representing milleseconds');
                assert.isArray(res.body.logs, 'response logs is an Array');
                assert.isObject(res.body.analytics, 'response analytics is an Array');
                assert.isString(res.body.result, 'response result is a string');
                assert.equal(res.body.type, 'String', 'response type is string');
                done();
            });
    });

    it('should test /api/run with simple math', function(done) {
        var code = {
            'script': 'var number = 5+5;number;'
        };
        request(app)
            .post('/run')
            .type('json')
            .send(code)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.isObject(res.body, 'response is an object');
                assert.isNumber(res.body.time, 'time is a number representing milleseconds');
                assert.isObject(res.body.analytics, 'response analytics is an Array');
                assert.equal(res.body.result, '10', 'response is 10 which is 5+5');
                assert.equal(res.body.type, 'Number', 'response type is Number');
                done();
            });
    });

    it('should return hello world in logs', function(done) {
        var code = {
            'script': 'var c = function(callback) { callback("hello-world"); }; c(function(val) { console.log(val); });'
        };
        request(app)
            .post('/run')
            .type('json')
            .send(code)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.isObject(res.body, 'response is an object');
                assert.isNumber(res.body.time, 'time is a number representing milleseconds');
                assert.isObject(res.body.analytics, 'response analytics is an Array');
                assert.equal(res.body.logs[0], '"hello-world"', 'response logs is hello-world');
                done();
            });
    });

    // TODO: maybe put these blocks in a describe `notebook-api`?

    var now = Date.now();

    it('should test the save functionality', function(done) {
        request(app)
            .post('/notebook/' + now)
            .type('json')
            .send({
                values: [{type: "script", value: "var i = 4;i;"}, {type: "text", value: "you can use simple numbers?"}]
            })
            .expect(200)
            .end(function(err) {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('should test the get functionality', function(done) {
        request(app)
            .get('/notebook/' + now + '/json')
            .set('Host', 'node-notebook.example.com')
            .type('json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.isOk(res.body.share_url.indexOf('node-notebook.example.com/') > -1);
                done();
            });
    });

    it('should run a notebook via the api', function(done) {
        request(app)
            .get('/notebook/' + now + '/run')
            .type('json')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                assert.equal(res.body[0].result.result, '4', 'notebooks first entry should return 4');
                done();
            });
    });
});
