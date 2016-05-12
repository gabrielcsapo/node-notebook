var util = require('util');
var vm = require('vm');
var babel = require('babel-core');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var spawn = require('child_process').spawn;

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
            _self._run(script, dir, function(result) {
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

    _run: function(_code, dir, callback, type) {
        var vms = {};
        vms.trace = [];

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

        vms.vm = vm.createContext({
            exports: exports,
            require: req,
            module: module,
            console: {
                log: function() {
                    vms.trace.push(arguments[0]);
                }
            },
            error: undefined,
            callback: function(error) {
                if (error) {
                    vms.vm.error = error;
                } else {
                    callback({
                        trace: vms.trace,
                        result: this.response || util.inspect(vms.vm.result, {
                            showHidden: true,
                            depth: null
                        }),
                        type: _self.type(this.response || vms.vm.result)
                    });
                }
            },
            __dirname: dir,
            regeneratorRuntime: require('regenerator-runtime/runtime')
        });
        if (type == 'async') {
            var code = "'use strict'; async function run() { try { " + _code.replace(/var /g, "this.") + "; this.callback(null); } catch(error) { this.callback(error); } }; run.apply(this)";
            var regeneratedCode = babel.transform(code, {
                "ast": false,
                "presets": ["stage-0"]
            }).code;
            var _script = new vm.Script(regeneratedCode);
            vms.vm.result = _script.runInContext(vms.vm, {
                displayErrors: true,
                timeout: 30000000
            });
            if (vms.vm.error) {
                throw vms.vm.error;
            }
        } else {
            var script = new vm.Script(babel.transform(_code, {
                presets: ['es2015']
            }).code);
            var _result = script.runInContext(vms.vm);
            if (vms.vm.error) {
                throw vm.error;
            }
            callback({
                trace: vms.trace,
                result: util.inspect(_result, {
                    showHidden: true,
                    depth: null
                }),
                type: _self.type(_result)
            });
        }
    },

    type: function(_result) {
        return (_result && _result.constructor) ? _result.constructor.name : (typeof _result);
    }

}
