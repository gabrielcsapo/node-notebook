# node-notebook

[![Build Status](https://travis-ci.org/gabrielcsapo/node-notebook.svg?branch=master)](https://travis-ci.org/gabrielcsapo/node-notebook)
[![Dependency Status](https://david-dm.org/gabrielcsapo/node-notebook.svg)](https://david-dm.org/gabrielcsapo/node-notebook)
[![devDependency Status](https://david-dm.org/gabrielcsapo/node-notebook/dev-status.svg)](https://david-dm.org/gabrielcsapo/node-notebook#info=devDependencies)

> A notebook service that runs Javascript through the node vm

## installation

```
npm install
```

## usage

> module (require('node-notebook'))

```javascript
require('node-notebook').run("var moment=require('moment');moment().format('x');", function(result) {
    // result = { trace: [], result: '\'1462858310879\'', type: 'String' }
});
```

> server (node index.js)

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
curl -X POST localhost:3000/api/run --data "script=var request = require('request-promise'); var response = await request({ url: 'https://graph.facebook.com/?id=http://news.ycombinator.com', json: true });"
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
