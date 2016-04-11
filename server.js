var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var vm = require('./lib/vm');
var port = process.env.PORT || 3000;

var serveStatic = require('serve-static');

app.use(serveStatic(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false, verify:function(req,res,buf){req.rawBody=buf}}));
app.use(bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}}));

app.post('/api/run', function(req, res) {
  var type = req.body.type || 'sync';
  var script = req.body.script || req.rawBody.toString('utf8').replace('script=', '');
  vm.run(script, type, undefined, function(result) {
    res.send(result);
  });
});

app.listen(port, function() {
  console.log('listening on localhost:', port); // eslint-disable-line no-console
});

module.exports = app;
