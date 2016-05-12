/*global CodeMirror, document, XMLHttpRequest */
var now = Date.now();
var codeEditor = CodeMirror(document.getElementById('code-editor'), {
    value: "function func(){return 100;}\n",
    mode:  "javascript"
});
codeEditor.on('keydown', function(cm, e) {
    if (e.keyIdentifier == 'Enter' && e.shiftKey == true) {
        e.preventDefault();
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/run");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                document.getElementById('code-response').innerHTML = xhr.responseText;
            }
        }
        xhr.send(JSON.stringify({script:codeEditor.getValue(), session: now}));
    }
});
