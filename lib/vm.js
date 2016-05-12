var util = require('util');
var vm = require('vm');
var babel = require('babel-core');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var _self = module.exports = {

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
                    error: ex + ""
                });
            } else {
                if (ex && ex.code && ex.code === 'MODULE_NOT_FOUND') {
                    try {
                        var module = ex.toString();
                        module = module.replace("Error: Cannot find module '", "").replace("'", "").replace(dir + "/node_modules/", "");

                        if (!fs.existsSync(dir)){
                            fs.mkdirSync(dir);
                            fs.mkdirSync(dir + '/node_modules');
                        }

                        var child = spawn('npm', ['install', module], {
                            cwd: dir
                        });

                        child.on('close', function() {
                            child.kill('SIGINT');
                            return _self.run(script, session, callback, ex, type);
                        });
                    } catch (ex) {
                        return callback({
                            error: ex + ""
                        });
                    }
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
          return require(path.resolve(dir, 'node_modules', module));
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
