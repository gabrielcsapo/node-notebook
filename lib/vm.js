var util = require('util');
var vm = require('vm');
var babel = require('babel-core');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var moment = require('moment');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;

var low = require('lowdb');
var storage = require('lowdb/file-sync');

var db = low('analytics.json', {storage: storage});
var vm_cache = [];

var parse = function(result) {
    var _res = {};
    if(result && result.fn) {
        for(var funcKey in result.fn) {
            _res[funcKey] = util.inspect(result.fn[funcKey], false);
        }
        return JSON.stringify(_res);
    } else if(typeof result == 'object') {
        for(var objKey in result) {
            _res[objKey] = util.inspect(result[objKey], false);
        }
        return JSON.stringify(_res);
    } else {
        return JSON.stringify(result);
    }
}

var record = function(result, code) {
    var previous = db('analytics').find({code: code});
    if (previous) {
        previous.runs = previous.runs || [];
        previous.runs.push([moment().format('x'), result.time]);
         db('analytics')
            .chain()
            .find({code: code})
            .assign(previous)
        result.analytics = db('analytics')
           .chain()
           .find({code: code}).value();
    } else {
        result.code = code;
        result.analytics = {};
        db('analytics')
            .push(result);
    }
}

var _self = module.exports = {

    install: function(dir, module, callback) {
        try {
            var log = "";

            if (!fs.existsSync(dir)) {
                try {
                    fs.mkdirSync(dir);
                    fs.mkdirSync(dir + '/node_modules');
                } catch(ex) {} finally {} // eslint-disable-line no-empty
            }

            var child = spawn('npm', ['install', module], {
                cwd: dir
            });

            child.stderr.on('data', function(data) {
                log += data.toString('utf8').indexOf('error') + "\n";
            });

            child.on('close', function() {
                child.kill('SIGINT');
                if (log.indexOf('error') > -1) {
                    return callback(log);
                } else {
                    callback();
                }
            });
        } catch (ex) {
            return callback({
                error: ex + ""
            });
        }
    },

    // TODO: clean this shit up
    run: function(script, session, callback, error, type) {
        var dir = path.join(__dirname, '..', 'sandbox', session.toString());

        try {
            _self._run(script, dir, session, function(result) {
                record(result, script);
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
            if (module.indexOf('@') > -1) {
                var version = module.substring(module.indexOf('@') + 1, module.length);
                var current_version = require(path.resolve(dir, 'node_modules', name, 'package.json')).version
                if (version.toString() !== current_version.toString()) {
                    delete require.cache[require.resolve(path.resolve(dir, 'node_modules', name))];
                    fse.removeSync(path.resolve(dir, 'node_modules', name));
                    return new Promise(function(next) {
                        _self.install(dir, name + '@' + version, function() {
                            next(require(path.resolve(dir, 'node_modules', name)));
                        });
                    });
                } else {
                    return require(path.resolve(dir, 'node_modules', name));
                }
            } else {
                return require(path.resolve(dir, 'node_modules', name));
            }
        }
        var end, start;
        if (!vm_cache[session].vm) {
            vm_cache[session].vm = vm.createContext({
                require: req,
                module: module,
                console: {
                    log: function() {
                        // TODO: you are an asshole for writing this
                        var raw = '';
                        var count = 0;
                        for (var key in arguments) {
                            if (count == Object.keys(arguments).length - 1) {
                                raw += arguments[key];
                            } else {
                                raw += arguments[key] + ' ';
                            }
                            count++;
                        }
                        vm_cache[session].logs.push(raw);
                    }
                },
                error: undefined,
                __dirname: dir
            });
        }
        start = new Date;
        var script = new vm.Script(babel.transform(_code, {
            presets: ['es2015']
        }).code);
        var _result = script.runInContext(vm_cache[session].vm);
        if (vm_cache[session].vm.error) {
            throw vm.error;
        }
        end = new Date;

        callback({
            logs: vm_cache[session].logs,
            result: parse(_result),
            time: (end - start),
            type: _self.type(_result)
        });
    },

    type: function(_result) {
        return (_result && _result.constructor) ? _result.constructor.name : (typeof _result);
    }

}
