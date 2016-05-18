var util = require('util');
var vm = require('vm');
var babel = require('babel-core');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;

var vm_cache = [];

var _self = module.exports = {

    install: function(dir, module, callback) {
        try {
            var log = "";

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
                fs.mkdirSync(dir + '/node_modules');
            }

            var child = spawn('npm', ['install', module], {
                cwd: dir
            });

            child.stderr.on('data', function(data) {
                log +=  data.toString('utf8').indexOf('error') + "\n";
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
        var dir = path.resolve(__dirname, '..', 'sandbox', session.toString());
        try {
            _self._run(script, dir, session, function(result) {
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
                        if(err) {
                            return callback({
                                error: err
                            });
                        } else {
                            return _self.run(script, session, callback, ex, type);
                        }
                    });
                } else if(ex && ex.toString() == 'SyntaxError: unknown: Unexpected token (1:63)') {
                    _self.run(script, session, function(result) {
                        callback(result);
                    }, ex, 'async');
                } else {
                    return callback({
                        error: ex + ""
                    });
                }
            }
        }
    },

    _run: function(_code, dir, session, callback, type) {
        if(!vm_cache[session]) {
            vm_cache[session] = {};
        }
        vm_cache[session].trace = [];

        var req = function(module) {
          var name = module.indexOf('@') > -1 ? module.substring(0, module.indexOf('@')) : module;
          delete require.cache[require.resolve(path.resolve(dir, 'node_modules', name, 'package.json'))];
          if(module.indexOf('@') > -1) {
              var version = module.substring(module.indexOf('@') + 1, module.length);
              var current_version = require(path.resolve(dir, 'node_modules', name, 'package.json')).version
              if(version.toString() !== current_version.toString()) {
                  delete require.cache[require.resolve(path.resolve(dir, 'node_modules', name))];
                  fse.removeSync(path.resolve(dir, 'node_modules', name));
                  return new Promise(function (next){
                      _self.install(dir, name+'@'+version, function() {
                          next(require(path.resolve(dir, 'node_modules', name)));
                      });
                  });
              } else {
                  return require(path.resolve(dir, 'node_modules', name));
              }
          } else{
              return require(path.resolve(dir, 'node_modules', name));
          }
        }
        var end, start;
        if(!vm_cache[session].vm) {
            vm_cache[session].vm = vm.createContext({
                exports: exports,
                require: req,
                module: module,
                console: {
                    log: function() {
                        vm_cache[session].trace.push(arguments[0]);
                    }
                },
                error: undefined,
                callback: function(error) {
                    if (error) {
                        vm_cache[session].vm.error = error;
                    } else {
                        callback({
                            trace: vm_cache[session].trace,
                            result: this.response || util.inspect(vm_cache[session].vm.result, {
                                showHidden: true,
                                depth: null
                            }),
                            time: (end - start) + 'ms',
                            type: _self.type(this.response || vm_cache[session].vm.result)
                        });
                    }
                },
                __dirname: dir,
                regeneratorRuntime: require('regenerator-runtime/runtime')
            });
        }
        start = new Date;
        if (type == 'async') {
            var code = "'use strict'; async function run() { try { " + _code.replace(/var /g, "this.") + "; this.callback(null); } catch(error) { this.callback(error); } }; run.apply(this)";
            var regeneratedCode = babel.transform(code, {
                "ast": false,
                "presets": ["stage-0"]
            }).code;
            var _script = new vm.Script(regeneratedCode);
            vm_cache[session].vm.result = _script.runInContext(vm_cache[session].vm, {
                displayErrors: true,
                timeout: 30000000
            });
            if (vm_cache[session].vm.error) {
                throw vm_cache[session].vm.error;
            }
            end = new Date;
        } else {
            var script = new vm.Script(babel.transform(_code, {
                presets: ['es2015']
            }).code);
            var _result = script.runInContext(vm_cache[session].vm);
            if (vm_cache[session].vm.error) {
                throw vm.error;
            }
            end = new Date;
            callback({
                trace: vm_cache[session].trace,
                result: _result,
                analytics: util.inspect(_result, {
                    showHidden: true,
                    depth: null
                }),
                time: (end - start) + 'ms',
                type: _self.type(_result)
            });
        }
    },

    type: function(_result) {
        return (_result && _result.constructor) ? _result.constructor.name : (typeof _result);
    }

}
