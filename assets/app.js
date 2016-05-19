/*global CodeMirror, document, XMLHttpRequest */
var session = location.pathname !== '/' ? location.pathname.replace('/', '') : Date.now();

var parse = function(req) {
    var type = req.type;
    var response = req.result;
    var error = req.error;
    var html = '';
    if(error) {
        html += '<label>';
        html += '<span> error : ('+error+')</span>';
        html += '</label>';
    } else {
        switch (type) {
            case 'Array':
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
                html += '<label for="'+t+'">';
                html += '<span>' + type + ' ('+response+')</span>';
                html += '</label>';
                break;
        }
    }
    return html;
}

var run = function(id, code) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/run");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById(id + '-code-response').innerHTML = parse(JSON.parse(xhr.responseText));
            document.getElementById(id + '-code-response').style.display = 'block';
            document.getElementById(id + '-code-tooltip').style.display = 'none';
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
        mode: "javascript",
        lineNumbers: true
    });
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
}

startup();
