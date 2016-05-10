# jaas

[![Build Status](https://travis-ci.org/gabrielcsapo/jaas.svg?branch=master)](https://travis-ci.org/gabrielcsapo/jaas)
[![Dependency Status](https://david-dm.org/gabrielcsapo/jaas.svg)](https://david-dm.org/gabrielcsapo/jaas)
[![devDependency Status](https://david-dm.org/gabrielcsapo/jaas/dev-status.svg)](https://david-dm.org/gabrielcsapo/jaas#info=devDependencies)

> Javascript as a Service

## installation

```
npm install
```

## usage

```
/api/run
```

> examples

_synchronous_

```bash
curl -X POST localhost:3000/api/run --data "script=var moment=require('moment');moment().format('x');"
```

*result*

```javascript
{
    "trace": [],
    "result": "'1460177101199'",
    "type": "String"
}
```

_async_

```bash
curl -X POST localhost:3000/api/run --data "script=var request = require('request-promise'); var response = await request({ url: 'https://graph.facebook.com/?id=http://news.ycombinator.com', json: true });&type=async"
```
*result*

```javascript
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
