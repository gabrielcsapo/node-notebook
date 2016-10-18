var util = require('util');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var datasource = require('./datasource');

var vm_cache = [];

var _self = module.exports = {
    parse: function(result) {
        var _res = {};
        if(result && result.fn || typeof result == 'function') {
            for(var funcKey in result.fn) {
                _res[funcKey] = util.inspect(result.fn[funcKey], false);
            }
            return JSON.stringify(_res);
        } else {
            for(var key in result) {
                if(typeof result[key] == 'function') {
                    result[key] = util.inspect(result[key], false);
                }
            }
            return JSON.stringify(result);
        }
    },
    install: function(dir, module, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('callback is not a function');
        }

        var log = "";

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir);
                fs.mkdirSync(dir + '/node_modules');
            } catch (ex) {} finally {} // eslint-disable-line no-empty
        }

        var child = spawn('npm', ['install', module], {
            cwd: dir
        });

        child.stderr.on('data', function(data) {
            log += data.toString('utf8') + "\n";
        });

        child.on('close', function() {
            child.kill('SIGINT');
            if (log.indexOf('ERR!') > -1) {
                return callback({
                    error: 'Could not install module ' + module
                });
            } else {
                callback();
            }
        });
    },
    // TODO: clean this up
    run: function(script, session, callback, error, type) {
        var dir = path.join(__dirname, '..', 'sandbox', session.toString());

        try {
            _self._run(script, dir, session, function(result) {
                datasource.record(result, script);
                callback(result);
            }, type);
        } catch (ex) {
            if (error && (ex.toString() === error.toString())) {
                return callback({
                    error: ex
                });
            } else {
                if (ex && ex.code && ex.code === 'MODULE_NOT_FOUND') {
                    var module = ex.toString();
                    module = module.replace("Error: Cannot find module '", "").replace("'", "").replace(dir + "/node_modules/", "").replace('/package.json', '');
                    _self.install(dir, module, function(err) {
                        if (err) {
                            return callback({
                                error: err
                            });
                        } else {
                            return _self.run(script, session, callback, ex, type);
                        }
                    });
                } else {
                    return callback({
                        error: ex + ""
                    });
                }
            }
        }
    },
    _run: function(_code, dir, session, callback) {
        if (!vm_cache[session]) {
            vm_cache[session] = {};
        }
        vm_cache[session].logs = [];

        var req = function(module) {
            // TODO: was I high or something?
            var name = module.indexOf('@') > -1 ? module.substring(0, module.indexOf('@')) : module;
            delete require.cache[require.resolve(path.resolve(dir, 'node_modules', name, 'package.json'))];
            return require(path.resolve(dir, 'node_modules', name));
        }
        var end, start;
        if (!vm_cache[session].vm) {
            vm_cache[session].vm = vm.createContext({
                require: req,
                module: module,
                console: {
                    log: function() {
                        if(Object.keys(arguments).length == 1) {
                            vm_cache[session].logs.push(_self.parse(arguments[0]));
                        } else {
                            var raw = '';
                            for (var key in arguments) {
                                raw += arguments[key] + ' ';
                            }
                            vm_cache[session].logs.push(raw);
                        }
                    }
                },
                error: undefined,
                __dirname: dir
            });
        }
        start = new Date;
        var script = new vm.Script(_code);

        var _result = script.runInContext(vm_cache[session].vm);
        if (vm_cache[session].vm.error) {
            throw vm.error;
        }
        end = new Date;

        callback({
            logs: vm_cache[session].logs,
            result: _self.parse(_result),
            time: (end - start),
            type: _self.type(_result)
        });
    },
    type: function(_result) {
        return (_result && _result.constructor) ? _result.constructor.name : (typeof _result);
    }

}
