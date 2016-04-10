var request = require('supertest');
var app = require('../server');
var assert = require('chai').assert;

describe('Sever', function() {

  it('should test /api/run with sync code', function(done) {
    this.timeout(50000);
    var code = {'script': 'var moment=require("moment");moment().format("x");'};
    request(app)
      .post('/api/run')
      .type('json')
      .send(code)
      .expect(200)
      .end(function(err, res) {
        if (err) { throw err; }
        assert.isObject(res.body, 'response is an object');
        assert.isArray(res.body.trace, 'response trace is an Array');
        assert.isString(res.body.result, 'response result is a string');
        assert.equal(res.body.type, 'String', 'response type is string');
        done();
      });
  });

  it('should test /api/run with async code', function(done) {
    this.timeout(50000);
    var code = {'type': 'async', 'script': 'var request = require("request-promise"); var response = await request({ url: "https://graph.facebook.com/?id=http://news.ycombinator.com", json: true });'};
    request(app)
      .post('/api/run')
      .type('json')
      .send(code)
      .expect(200)
      .end(function(err, res) {
        if (err) { throw err; }
        assert.isObject(res.body, 'response is an object');
        assert.isArray(res.body.trace, 'response trace is an Array');
        assert.isObject(res.body.result, 'response result is a Object');
        assert.equal(res.body.result.id, 'http://news.ycombinator.com', 'id is http://news.ycombinator.com');
        assert.isNumber(res.body.result.shares, 'shares is a number');
        assert.isNumber(res.body.result.comments, 'comments is a number');
        assert.equal(res.body.type, 'Object', 'response type is Object');
        done();
      });
  });

  it('should test /api/run with simple math', function(done) {
    this.timeout(50000);
    var code = {'script': 'var number = 5+5;number;'};
    request(app)
      .post('/api/run')
      .type('json')
      .send(code)
      .expect(200)
      .end(function(err, res) {
        if (err) { throw err; }
        assert.isObject(res.body, 'response is an object');
        assert.equal(res.body.result, '10', 'response is 10 which is 5+5');
        assert.equal(res.body.type, 'Number', 'response type is Number');
        done();
      });

  })

});
