# jaas

[![Build Status](https://travis-ci.org/gabrielcsapo/jaas.svg?branch=master)](https://travis-ci.org/gabrielcsapo/jaas)
[![Dependency Status](https://david-dm.org/gabrielcsapo/jaas.svg)](https://david-dm.org/gabrielcsapo/jaas)
[![devDependency Status](https://david-dm.org/gabrielcsapo/jaas/dev-status.svg)](https://david-dm.org/gabrielcsapo/jaas#info=devDependencies)

> Javascript as a Service

## installation

```
npm install
```

## example

> localhost:3000/

![jaas demo](./public/assets/code-example-sync.gif)
![jaas demo](./public/assets/code-example-async.gif)

## usage

```
/api/run
```

> examples

_synchronous_

```
curl -X POST localhost:3000/api/run --data "script=var moment=require('moment');moment().format('x');"
```

*result*

```
{
    "trace": [],
    "result": "'1460177101199'",
    "type": "String"
}
```

_async_

```
curl -X POST localhost:3000/api/run --data "script=var request = require('request-promise'); var response = await request({ url: 'https://graph.facebook.com/?id=http://news.ycombinator.com', json: true });&type=async"
```
*result*

```
{
    "trace": [],
    "result": {
        "id": "http://news.ycombinator.com",
        "shares": 9668,
        "comments": 3
    },
    "type": "Object"
}
```

## tests

# TOC
   - [Sever](#sever)
<a name=""></a>

<a name="sever"></a>
# Sever
should test /api/run with sync code.

```js
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
```

should test /api/run with async code.

```js
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
```

should test /api/run with simple math.

```js
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
```
