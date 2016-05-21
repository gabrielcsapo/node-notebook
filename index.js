var compression = require('compression')
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var fs = require('fs');
var figlet = require('figlet');
var vm = require('./lib/vm');
var datasource = require('./lib/datasource');
var port = process.env.PORT || 3000;

try {
    fs.mkdirSync(path.resolve(__dirname, 'sandbox'));
} catch (ex) { /*don't care*/ }

app.set('view engine', 'pug');
app.use(compression());

app.use('/assets', express.static(__dirname + '/views/assets'));
app.use('/assets/codemirror', express.static(__dirname + '/node_modules/codemirror'));
app.use('/assets/psychic-ui', express.static(__dirname + '/node_modules/psychic-ui'));
app.use('/assets/font-awesome', express.static(__dirname + '/node_modules/font-awesome'));
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

app.get('/', function(req, res) {
    res.render('index');
});

app.post('/run', function(req, res) {
    var session = req.body.session || Date.now();
    var script = req.body.script || req.rawBody.toString('utf8').replace('script=', '');
    vm.run(script, session, function(result) {
        res.send(result);
    });
});

app.get('/:hash', function(req, res) {
    var hash = req.params.hash;
    // TODO: share_url should be relative to the original url location
    res.render('index', {
        stored_values: JSON.stringify(datasource.get(hash)),
        share_url: 'http://localhost/' + hash
    });
});

app.post('/:hash', function(req, res) {
    var hash = req.params.hash;
    var values = req.body.values;
    datasource.set(hash, values);
    res.sendStatus(200);
});

app.get('/:hash/json', function(req, res) {
    var hash = req.params.hash;
    res.send(datasource.get(hash));
});

app.listen(port, function() {
    figlet('node-notebook', function(err, data) {
        console.log(data); // eslint-disable-line no-console
        console.log('node-notebook listening on http://localhost:%s', port); // eslint-disable-line no-console
    });
});

module.exports = app;
