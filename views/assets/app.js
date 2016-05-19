/*global CodeMirror, document, XMLHttpRequest */
var session = location.pathname !== '/' ? location.pathname.replace('/', '') : Date.now();

var editors = [];

var parse = function(req) {
    var type = req.type;
    var response = req.result;
    var error = req.error;
    var logs = req.trace;
    var html = '';
    if(error) {
        html += '<label>';
        html += '<span> error : ('+error+')</span>';
        html += '</label>';
    } else {
        switch (type) {
            case 'Array':
                // TODO: abstract treeview creation
                var t = Date.now();
                html += '<div class="treeview"><ul>';
                html += '<li>';
                html += '<input type="checkbox" id="'+t+'">';
                html += '<label for="'+t+'">';
                html += '<span>Array ('+response.length+')</span>';
                html += '</label>';
                html += '<ul>';
                response.forEach(function(value) {
                    html += '<li><span>' + value + '</span></li>';
                });
                html += '<ul>';
                html += '</li>';
                html += '</ul></div>';
                break;
            default:
                if(type !== 'undefined') {
                    html += '<label for="'+t+'">';
                    html += '<span>' + type + ' ('+response+')</span>';
                    html += '</label>';
                }
                break;
        }
    }
    if(logs && logs.length > 0) {
        var t = Date.now();
        html += '<div class="treeview"><ul>';
        html += '<li>';
        html += '<input type="checkbox" id="'+t+'">';
        html += '<label for="'+t+'">';
        html += '<span>Array ('+logs.length+')</span>';
        html += '</label>';
        html += '<ul>';
        logs.forEach(function(value) {
            html += '<li><span>' + value + '</span></li>';
        });
        html += '<ul>';
        html += '</li>';
        html += '</ul></div>';
    }
    return html;
}

var run = function(id, code) {
    document.getElementById(id + '-code-loading').style.display = 'block';

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/run");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById(id + '-code-response').innerHTML = parse(JSON.parse(xhr.responseText));
            document.getElementById(id + '-code-response').style.display = 'block';
            document.getElementById(id + '-code-tooltip').style.display = 'none';
            document.getElementById(id + '-code-loading').style.display = 'none';
        }
    }
    xhr.send(JSON.stringify({
        script: code,
        session: session
    }));
}

var createTextBlock = function(id, text) {
    var now = Date.now();
    var div = document.createElement('div');
    var html = '<br><br><div id="'+now+'-code-form" class="editor-form">' +
    '<textarea id="'+now+'-code" style="display: none"></textarea>' +
    '<div id="'+now+'-code-response" class="code-response">' +
    '</div><i id="'+now+'-code-actions" class="code-actions"><i class="fa fa-terminal" onclick="createCodeBlock(\''+(now)+'\');">&nbsp;&nbsp;</i><i class="fa fa-pencil" onclick="createTextBlock(\''+(now)+'\');">&nbsp;&nbsp;</i><i class="fa fa-trash-o">&nbsp;&nbsp;</i></i>' +
    '</div><br><br>';
    div.innerHTML = html;
    if(id) {
        document.getElementById(id + '-code-form').parentNode.insertBefore(
            div,
            document.getElementById(id + '-code-form').parentNode.nextSibling
        );
    } else {
        document.querySelector('.code-container').appendChild(div);
    }
    var editor = CodeMirror.fromTextArea(document.getElementById(now + '-code'), {
        mode: 'none'
    });
    editors.push({type: 'text', editor: editor});
    if(text) {
        editor.setValue(text);
    }
    return editor;
}

var createCodeBlock = function(id, script) {
    var now = Date.now();
    var div = document.createElement('div');
    var html = '<br><br><div id="'+now+'-code-form" class="code-form">' +
    '<textarea id="'+now+'-code" style="display: none"></textarea>' +
    '<i id="'+now+'-code-tooltip" class="code-tooltip"><small>type code and press shift + enter to run</small></i>' +
    '<div id="'+now+'-code-response" class="code-response"></div>' +
    '<div id="'+now+'-code-loading" class="code-loading"><div class="spinner-overlay"><div class="spinner-wrapper"><div class="spinner spinner-info"></div></div></div></div>' +
    '<i id="'+now+'-code-actions" class="code-actions"><i class="fa fa-terminal" onclick="createCodeBlock(\''+(now)+'\');">&nbsp;&nbsp;</i><i class="fa fa-pencil" onclick="createTextBlock(\''+(now)+'\');">&nbsp;&nbsp;</i><i class="fa fa-trash-o">&nbsp;&nbsp;</i></i>' +
    '</div><br><br>';
    div.innerHTML = html;
    if(id) {
        document.getElementById(id + '-code-form').parentNode.insertBefore(
            div,
            document.getElementById(id + '-code-form').parentNode.nextSibling
        );
    } else {
        document.querySelector('.code-container').appendChild(div);
    }
    var editor = CodeMirror.fromTextArea(document.getElementById(now + '-code'), {
        mode: "javascript",
        lineNumbers: true
    });
    editors.push({type: 'script', editor: editor});
    if(script) {
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
            run(now, editor.getValue());
        }
    });
    editor.id = now;
    return editor;
}

var startup = function() {
    var storedValues;
    if (/PhantomJS/.test(window.navigator.userAgent)) {
        storedValues = document.querySelector('.code-container').dataset['storedValues']
    } else {
        storedValues = document.querySelector('.code-container').dataset['stored-values'];
    }

    if (storedValues) {
        if(JSON.parse(storedValues).length > 0) {
            JSON.parse(storedValues).forEach(function(v) {
                switch(v.type) {
                    case 'script':
                        var editor = createCodeBlock(undefined, v.value);
                        run(editor.id, editor.getValue());
                        break;
                    case 'text':
                        createTextBlock(undefined, v.value);
                        break;
                }
            });
        } else {
            createCodeBlock();
        }
    } else {
        createCodeBlock();
    }

    document.getElementById('btn-save').onclick = function() {
        var values = [];
        editors.forEach(function(e) {
            values.push({
                type: e.type,
                value: e.editor.getValue()
            });
        });
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/" + session);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                window.location.href = '/' + session;
            }
        }
        xhr.send(JSON.stringify({
            values: values
        }));
    }

    document.getElementById('btn-run-all').onclick = function() {
        editors.forEach(function(e) {
            if(e.type == 'script') {
                run(e.editor.id, e.editor.getValue());
            }
        });
    }
}

startup();
