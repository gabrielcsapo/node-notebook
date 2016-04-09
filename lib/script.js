var npm = require('npm');
var util = require('util');
var vm = require('vm');
var babel = require('babel-core');

module.exports = _self = {

    run: function(script, error, callback) {
        var ret = {}
        try {
            callback(_self._run(script));
        } catch (ex) {
            if (error && (ex.toString() === error.toString())) {
                return callback({
                    error: ex + ""
                });
            } else {
                if (ex.code === 'MODULE_NOT_FOUND') {
                    try {
                        var module = ex.toString();
                        module = module.replace("Error: Cannot find module '", "").replace("'", "");
                        npm.load({
                            loaded: false
                        }, function(err) {
                            npm.commands.install([module], function(error) {
                                if (error) {
                                    return callback({
                                        error: error + ""
                                    });
                                }
                                _self.run(script, ex, callback);
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

    _run: function(script) {
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
            __dirname: __dirname,
            regeneratorRuntime: require('regenerator/runtime')
        });
        var script = new vm.Script(babel.transform(script, {
            presets: ['es2015']
        }).code);

        var _result = script.runInContext(vms.vm);

        return {
            trace: vms.trace,
            result: util.inspect(_result, {
                showHidden: true,
                depth: null
            }),
            type: _self.type(_result)
        }
    },

    type: function(_result) {
        return (_result && _result.constructor) ? _result.constructor.name : (typeof _result);
    }

}
