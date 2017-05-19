var Docker = require('dockerode');
var docker = new Docker();
var vm = require('vm');
var util = require('util');
var re = require('requires-regex');
var Writable = require('stream').Writable;

var parse = function(result) {
    var _res = {};
    if(result && result.fn || typeof result == 'function') {
        for(var funcKey in result.fn) {
            _res[funcKey] = util.inspect(result.fn[funcKey], false);
        }
        return JSON.stringify(_res);
    } else {
        if(typeof result == 'object') {
            for(var key in result) {
                if(typeof result[key] == 'function' || typeof result[key] == 'object') {
                    result[key] = util.inspect(result[key], false);
                }
            }
        }
        return JSON.stringify(result);
    }
}

var run = function(notebook, callback) {
    // TODO: make the deliminator dynamic so that it can not be guessed by anyone
    // TODO: clean this shit up
    var npmModules = [];
    var deliminator = '----------nextEntry-------';
    var linebreak = '\'----------nextEntry-------\' + Date.now()';
    var code = "console.log('START-RUN');" + 'console.log('+linebreak+');' + notebook.join('console.log('+linebreak+');') + 'console.log('+linebreak+');';

    // Get all of the node modules that are required in this project
    var regex = new RegExp(re().source, 'gm');
    (code.match(regex)).forEach(function(module) {
        npmModules.push(re().exec(module)[2]);
    });

    var output = [];
    var environment = {};

    function handler(err, data, container) {
        var response;

        if(data.StatusCode == 0) {
            response = {};
            // This is to keep track of which notebook entry we are on
            var index = -1;
            var time = 0;
            output.forEach(function(out, i) {
                if(out.data.indexOf(deliminator) > -1) {
                    // The deliminator is responsible for seperating notebook entries
                    // The start of one is the end of another
                    var time = parseInt(out.data.substring(deliminator.length + 1, out.data.length));
                    if(response[index]) {
                        response[index].time.end = time
                    }
                    // If this is the last element do not over pack the array
                    if(i !== output.length - 1) {
                        index += 1;
                        response[index] = { data: [], time: {start: time, end:0} };
                        // We are not pushing the data because this is a junk line
                    }
                } else {
                    response[index]['data'].push(out);
                }
            });
        } else {
            response = output;
        }
        container.remove(function() {
            callback({
                environment: environment,
                statusCode: data.StatusCode,
                response: response
            });
        });
    }
    // a dummy stream to not have to deal with process stdout
    var ws = Writable();
    ws._write = function (chunk, enc, next) {
        next();
    };
    var ee = docker.run('node:6.2.1', [], ws, { Cmd: ['bash', '-c', 'npm install '+npmModules.join(' ')+';node -e "' + code + '"']}, handler);
    ee.on('container', function(container) {
        container.inspect(function (err, data) {
          environment = data.Config.Env
        });
    });
    ee.on('stream', function(stream) {
        var started = false;
        stream.on('data', function(data) {
            data = data.split('\n');
            if(data.length) {
                data.forEach(function(value) {
                    if(value !== ''){
                        if(value.indexOf('START-RUN') > -1) { started = true; return; }
                        if(started) {
                            try {
                                var sandbox = { value: '' };
                                vm.createContext(sandbox);
                                var d = vm.runInContext('value = ' + value + ';', sandbox);
                                value = sandbox.value;
                            } catch(ex) {};
                            output.push({
                                type: typeof value,
                                data: parse(value)
                            });
                        }
                    }
                })
            }
        });
    });
}
// run(['var h = "hello";console.log(h);', 'for(var i = 1; i < 10; i++) { console.log(i); }'], function(data) {
//     for(var key in data.response) {
//         console.dir(data.response[key]);
//     }
// });
run(["var moment = require('moment');console.log(moment().format('x'));", "var re = require('requires-regex');console.log(re().exec('require(\"testing\")'));", "var path = require('path'); console.log(path.resolve(__dirname));", "var object = {name: 'Gabriel J. Csapo'};console.log(object);"], function(data) {
    for(var key in data.response) {
        console.dir(data.response[key]);
    }
});
// run(['var d = {}; d.name = function() {return;};console.log(d);console.log("HELLO");'], function(data) {
//     // console.log(JSON.stringify(data));
//     console.log(data);
// });
