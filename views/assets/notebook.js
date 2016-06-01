/*global CodeMirror, Chartist */
var path = location.pathname.replace('notebook', '').replace('/', '');
var session = path !== '/' ? path.replace('/', '') : Date.now();
if (session == '') {
    session = Date.now();
}

var total_time = 0;
var editors = {};

var titleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var createTree = function(response, type, title) {
    var html = '';
    var t = Date.now();

    switch (type) {
        case 'Array':
            title = title || 'Array';
            html += '<div class="treeview"><ul>';
            html += '<li>';
            html += '<input type="checkbox" id="' + t + '">';
            html += '<label for="' + t + '">';
            html += '<span> ' + title + ' (' + response.length + ')</span>';
            html += '</label>';
            html += '<ul>';
            response.forEach(function(value) {
                html += '<li><span>' + value + '</span></li>';
            });
            html += '<ul>';
            html += '</li>';
            html += '</ul></div>';
            break;
        case 'Object':
            title = title || 'Object';
            html += '<div class="treeview"><ul>';
            html += '<li>';
            html += '<input type="checkbox" id="' + t + '">';
            html += '<label for="' + t + '">';
            html += '<span> ' + title + ' (' + Object.keys(response).length + ')</span>';
            html += '</label>';
            html += '<ul>';
            for (var key in response) {
                if (Array.isArray(response[key])) {
                    html += createTree(response[key], 'Array', key);
                } else {
                    html += createTree(response[key], titleCase(typeof response[key]), key);
                }
            }
            html += '<ul>';
            html += '</li>';
            html += '</ul></div>';
            break;
        case 'String':
            html += '<li><span>' + title + ': ' + response + '</span></li>';
            break;
        default:
            html += '<li><span>' + title + ': ' + response + '</span></li>';
            break;
    }

    return html;
}

var parse = function(req) {
    var type = req.type;
    var response
    var error = req.error;
    var logs = req.logs;
    var time = req.time ? req.time + 'ms' : req.time;
    try {
        response = JSON.parse(req.result);
        type = titleCase(typeof response);
    } catch (ex) {
        response = req.result;
    }

    var html = '';

    if (time) {
        total_time += Math.floor(time.replace('ms', ''));
        html += '<span style="float: right;margin-top: -5px;" class="badge badge-default">' + time + '</span>';
    }
    if (error) {
        html += '<label>';
        html += '<span> error : (' + error + ')</span>';
        html += '</label>';
    } else {
        switch (type) {
            case 'Function':
                html += createTree(response, 'Object');
                break;
            case 'Array':
                html += createTree(response, type);
                break;
            case 'Object':
                html += createTree(response, type);
                break;
            default:
                if (type !== 'undefined') {
                    var t = Date.now();
                    html += '<label for="' + t + '">';
                    html += '<span>' + type + ' (' + response + ')</span>';
                    html += '</label>';
                }
                break;
        }
    }
    if (logs && logs.length > 0) {
        html += createTree(logs, 'Array', 'Console');
    }
    return html;
}

var showAnalytics = function(id, analytics) {
    var labels = [];
    var series = [];
    var avg_series = [];
    var avg_time = 0;
    var i = 1;


    if (analytics.runs) {
        document.querySelector('#code-chart-' + id).innerHTML = '<div class="spinner-overlay"><div class="spinner-wrapper"><div class="spinner spinner-info"></div></div></div>';
        analytics.runs.forEach(function(run) {
            avg_time += run[1];
            series.push(run[1]);
            if (i % 5 == 0) {
                labels.push(i);
            }
            i++;
        });

        avg_time = avg_time / analytics.runs.length;

        analytics.runs.forEach(function() {
            avg_series.push(avg_time);
        });

        var defaultOptions = {
            labelClass: 'ct-label',
            labelOffset: {
                x: 0,
                y: -10
            },
            textAnchor: 'middle',
            labelInterpolationFnc: Chartist.noop
        };

        Chartist.plugins = Chartist.plugins || {};
        Chartist.plugins.ctPointLabels = function(options) {

            options = Chartist.extend({}, defaultOptions, options);

            return function ctPointLabels(chart) {
                if (chart instanceof Chartist.Line) {
                    chart.on('draw', function(data) {
                        if (data.type === 'point') {
                            if (options.series ? options.series.indexOf(data.series.name) > -1 : true) {
                                data.group.elem('text', {
                                    x: data.x + options.labelOffset.x,
                                    y: data.y + options.labelOffset.y,
                                    style: 'text-anchor: ' + options.textAnchor
                                }, options.labelClass).text(options.labelInterpolationFnc(data.value.x === undefined ? data.value.y : data.value.x + ', ' + data.value.y));
                            }
                        }
                    });
                }
            };
        };

        document.querySelector('#code-chart-' + id).innerHTML = '<span id="code-chart-avg-time' + id + '" style="float: left;margin-top:5px;margin-bottom:5px;" class="badge badge-default">Avg : ' + avg_time + 'ms</span>';
        try {
            new Chartist.Line('#code-chart-' + id, {
                labels: labels,
                series: [{
                    name: 'series-runs',
                    data: series
                }, {
                    name: 'series-avg',
                    data: avg_series
                }]
            }, {
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 1
                }),
                fullWidth: true,
                low: 0,
                axisY: {
                    offset: 40,
                    labelInterpolationFnc: function(value) {
                        return value + 'ms'
                    },
                    scaleMinSpace: 15
                },
                plugins: [
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle',
                        labelInterpolationFnc: function(value) {
                            return value + 'ms'
                        },
                        series: ['series-runs']
                    })
                ],
                series: {
                    'series-runs': {
                        showArea: true
                    }
                }
            });
        } catch (ex) {} // eslint-disable-line no-empty
    }
}

var run = function(id, callback) {
    var code = editors[id].editor.getValue();
    document.getElementById(id + '-code-loading').style.display = 'block';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/run");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById(id + '-code-response').innerHTML = parse(response);
            document.getElementById(id + '-code-response').style.display = 'block';
            document.getElementById(id + '-code-tooltip').style.display = 'none';
            document.getElementById(id + '-code-loading').style.display = 'none';
            if (response.analytics) {
                showAnalytics(id, response.analytics);
            }
            if (callback) {
                callback();
            }
        }
    }
    xhr.send(JSON.stringify({
        script: code,
        session: session
    }));
}

/*eslint-disable no-unused-vars */
var deleteBlock = function(id) {
    delete editors[id];
    document.querySelector('.code-container')
            .removeChild(document.getElementById(id + '-code-form').parentNode);
}
/*eslint-enable no-unused-vars */

var createTextBlock = function(id, text) {
    var now = Date.now();
    var div = document.createElement('div');
    var html = '<div id="' + now + '-code-form" class="editor-form">' +
        '<textarea id="' + now + '-code" style="display: none"></textarea>' +
        '<div id="' + now + '-code-response" class="code-response"></div>' +
        '<i id="' + now + '-code-actions" class="code-actions"><i class="fa fa-terminal" onclick="createCodeBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i><i class="fa fa-pencil" onclick="createTextBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i><i class="fa fa-trash-o" onclick="deleteBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i></i>' +
        '</div>';
    div.innerHTML = html;
    if (id) {
        document.getElementById(id + '-code-form').parentNode.insertBefore(
            div,
            document.getElementById(id + '-code-form').nextSibling
        );
    } else {
        document.querySelector('.code-container').appendChild(div);
    }
    var editor = CodeMirror.fromTextArea(document.getElementById(now + '-code'), {
        mode: 'none'
    });
    editors[now] = ({
        type: 'text',
        editor: editor
    });
    if (text) {
        editor.setValue(text);
    }
    return editor;
}

var createCodeBlock = function(id, script, analytics) {
    var now = Date.now();
    var div = document.createElement('div');
    // TODO: all ids and classes could be abstracted to locators object
    var html = '<div id="' + now + '-code-form" class="code-form">' +
        '<textarea id="' + now + '-code" style="display: none"></textarea>' +
        '<i id="' + now + '-code-tooltip" class="code-tooltip"><small>type code and press shift + enter to run</small></i>' +
        '<div id="' + now + '-code-response" class="code-response"></div>' +
        '<div id="' + now + '-code-loading" class="code-loading"><div class="spinner-overlay"><div class="spinner-wrapper"><div class="spinner spinner-info"></div></div></div></div>' +
        '<div id="code-chart-' + now + '" class="code-analytics-chart"></div>' +
        '<i id="' + now + '-code-actions" class="code-actions"><i class="fa fa-play" onclick="run(\'' + (now) + '\');">&nbsp;&nbsp;</i><i class="fa fa-terminal" onclick="createCodeBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i><i class="fa fa-pencil" onclick="createTextBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i><i class="fa fa-trash-o" onclick="deleteBlock(\'' + (now) + '\');">&nbsp;&nbsp;</i></i>' +
        '</div>';
    div.innerHTML = html;
    if (id) {
        document.getElementById(id + '-code-form').parentNode.insertBefore(
            div,
            document.getElementById(id + '-code-form').nextSibling
        );
    } else {
        document.querySelector('.code-container').appendChild(div);
    }
    var editor = CodeMirror.fromTextArea(document.getElementById(now + '-code'), {
        mode: "javascript",
        lineNumbers: true
    });
    editors[now] = ({
        type: 'script',
        editor: editor
    });
    if (analytics) {
        showAnalytics(now, analytics);
    }
    if (script) {
        editor.setValue(script);
    }
    editor.on('keyup', function() {
        if (editor.getValue().length == 0) {
            document.getElementById(now + '-code-tooltip').style.display = 'block';
            document.getElementById(now + '-code-response').style.display = 'none';
        }
    });
    editor.on('keydown', function(cm, e) {
        if (e.keyIdentifier == 'Enter' && e.shiftKey == true) {
            e.preventDefault();
            run(now);
        }
    });
    editor.id = now;
    return editor;
}

var run_all = function() {
    total_time = 0;
    var count = 0;
    var done = function() {
        if (count == 0) {
            document.getElementById('total-time').innerHTML = total_time + 'ms';
        }
    }
    for (var key in editors) {
        if (editors[key].type == 'script') {
            count++;
            run(editors[key].editor.id, function() {
                count--;
                done();
            });
        }
    }
}

var startup = function() {
    var storedValues = document.querySelector('.code-container').dataset['storedValues'] ||
        document.querySelector('.code-container').dataset['stored-values']

    if (storedValues) {
        if (JSON.parse(storedValues).length > 0) {
            JSON.parse(storedValues).forEach(function(v) {
                switch (v.type) {
                    case 'script':
                        createCodeBlock(undefined, v.value, v.analytics);
                        break;
                    case 'text':
                        createTextBlock(undefined, v.value);
                        break;
                }
            });
            run_all();
        } else {
            createCodeBlock();
        }
    } else {
        createCodeBlock();
    }

    document.getElementById('btn-save').onclick = function() {
        var values = [];
        for (var key in editors) {
            values.push({
                type: editors[key].type,
                value: editors[key].editor.getValue()
            });
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/notebook/" + session);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                window.location.href = '/notebook/' + session;
            }
        }
        xhr.send(JSON.stringify({
            values: values
        }));
    }

    if (document.getElementById('btn-run-all')) {
        document.getElementById('btn-run-all').onclick = function() {
            run_all();
        }
    }
}

startup();
