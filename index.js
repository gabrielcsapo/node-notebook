var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var vm = require('./lib/script');
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false, verify:function(req,res,buf){req.rawBody=buf}}));
app.use(bodyParser.json({verify:function(req,res,buf){req.rawBody=buf}}));


app.post('/api/run', function(req, res) {
  var script = req.rawBody.toString('utf8').replace('script=', '');
  vm.run(script, undefined, function(result) {
    res.send(result);
  });
});

app.listen(port, function() {
  console.log('listening on localhost:', port);
});
