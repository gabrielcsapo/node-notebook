var compression = require('compression')
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var fs = require('fs');
var figlet = require('figlet');
var vm = require('./lib/vm');
var datasource = require('./lib/datasource');
var filesize = require('filesize');

var port = process.env.PORT || 3000;

try {
    fs.mkdirSync(path.resolve(__dirname, 'sandbox'));
} catch (ex) { /*don't care*/ }

app.set('view engine', 'pug');
app.use(compression());
app.use('/', express.static(__dirname + '/views/assets'));
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

var low = require('lowdb');
var storage = require('lowdb/file-sync');

var db = low('db.json', {storage: storage});

app.get('/', function(req, res) {
    res.render('index', {
        online: true,
        memoryUsage: filesize(process.memoryUsage().heapUsed),
        notebooks: db('notebooks').value().length,
        system: process.versions
    });
});

app.get('/notebook', function(req, res) {
    res.render('notebook/notebook');
});

app.post('/run', function(req, res) {
    var session = req.body.session || Date.now();
    var script = req.body.script || req.rawBody.toString('utf8').replace('script=', '');
    vm.run(script, session, function(result) {
        res.send(result);
    });
});

app.get('/notebook/:hash', function(req, res) {
    var hash = req.params.hash;
    res.render('notebook/notebook', {
        stored_values: JSON.stringify(datasource.get(hash)),
        share_url: req.headers.host + '/' + hash
    });
});

app.post('/notebook/:hash', function(req, res) {
    var hash = req.params.hash;
    var values = req.body.values;
    datasource.set(hash, values);
    res.sendStatus(200);
});

app.get('/notebook/:hash/run', function(req, res) {
    var hash = req.params.hash;
    var session = Date.now();
    var notebook = datasource.get(hash)
    var scripts = notebook.length - 1;
    var done = function() {
        scripts -= 1;
        if(scripts == 0) {
            res.send(notebook);
        }
    }
    notebook.forEach(function(script, index) {
        if(script.type == 'script') {
            vm.run(script.value, session, function(result) {
                notebook[index].analytics = result.analytics;
                delete result.analytics;
                notebook[index].result = result;
                done();
            });
        } else {
            done();
        }
    });
});

app.get('/notebook/:hash/json', function(req, res) {
    var hash = req.params.hash;
    var notebook = {
        share_url: req.headers.host + '/' + hash,
        data: datasource.get(hash)
    };
    res.send(notebook);
});

app.listen(port, function() {
    figlet('node-notebook', function(err, data) {
        console.log(data); // eslint-disable-line no-console
        console.log('node-notebook listening on http://localhost:%s', port); // eslint-disable-line no-console
    });
});

module.exports = app;
