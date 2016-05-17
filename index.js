var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var fs = require('fs');
var vm = require('./lib/vm');
var port = process.env.PORT || 3000;

try {
    fs.mkdirSync(path.resolve(__dirname, 'sandbox'));
} catch(ex) { /*don't care*/ }

app.set('views', './public')
app.set('view engine', 'pug');

app.use('/assets', express.static(__dirname + '/public/assets'));
app.use('/assets/codemirror', express.static(__dirname + '/node_modules/codemirror'));
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

app.get('/', function (req, res) {
  res.render('index');
});

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
