var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var vm = require('./lib/vm');
var port = process.env.PORT || 3000;

var serveStatic = require('serve-static');

app.use(serveStatic(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false,
    verify: function(req, res, buf) {
        req.rawBody = buf
    }
}));
app.use(bodyParser.json({
    verify: function(req, res, buf) {
        req.rawBody = buf
    }
}));

app.post('/api/run', function(req, res) {
    var session = req.body.session || Date.now();
    var script = req.body.script || req.rawBody.toString('utf8').replace('script=', '');
    vm.run(script, session, function(result) {
        res.send(result);
    });
});

app.listen(port, function() {
    console.log('jaas listening on http://localhost:%s', port); // eslint-disable-line no-console
});

module.exports = app;
