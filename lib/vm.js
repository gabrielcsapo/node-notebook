var npm = require('npm');
var util = require('util');
var vm = require('vm');
var babel = require('babel-core');

var _self = module.exports = {

    run: function(script, type, error, callback) {
        try {
            _self._run(script, type, function(result) {
              callback(result);
            });
        } catch (ex) {
            if (error && (ex.toString() === error.toString())) {
                return callback({
                    error: ex + ""
                });
            } else {
                if (ex && ex.code && ex.code === 'MODULE_NOT_FOUND') {
                    try {
                        var module = ex.toString();
                        module = module.replace("Error: Cannot find module '", "").replace("'", "");
                        npm.load({
                            loaded: false
                        }, function() {
                            npm.commands.install([module], function(error) {
                                if (error) {
                                    return callback({
                                        error: error + ""
                                    });
                                }
                                _self.run(script, type, ex, callback);
                            });
                        });
                    } catch (ex) {
                        return callback({
                            error: ex + ""
                        });
                    }
                } else {
                    return callback({
                        error: ex + ""
                    });
                }
            }
        }
    },

    _run: function(_code, type, callback) {
        var vms = {};
        vms.trace = [];
        vms.vm = vm.createContext({
            exports: exports,
            require: require,
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
            __dirname: __dirname,
            regeneratorRuntime: require('regenerator/runtime')
        });
        if (type == 'async') {
          var code = "'use strict'; async function run() { try { " + _code.replace(/var /g, "this.") + "; this.callback(null); } catch(error) { this.callback(error); } }; run.apply(this)";
          var regeneratedCode = babel.transform(code, { "ast": false, "presets": ["stage-0"] }).code;
          var _script = new vm.Script(regeneratedCode);
          vms.vm.result = _script.runInContext(vms.vm, {displayErrors: true, timeout: 30000000});
          if (vms.vm.error) { throw vms.vm.error; }
        } else {
          var script = new vm.Script(babel.transform(_code, {
            presets: ['es2015']
          }).code);
          var _result = script.runInContext(vms.vm);
          if (vms.vm.error) { throw vm.error; }
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
