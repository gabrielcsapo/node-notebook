/*global CodeMirror, document, XMLHttpRequest */
document.onreadystatechange = function() {
    if (document.readyState === 'complete') {
        var now = Date.now();
        var codeEditor = CodeMirror.fromTextArea(document.getElementById('code'), {
            mode: "javascript",
            lineNumbers: true
        });
        codeEditor.on('keydown', function(cm, e) {
            if (e.keyIdentifier == 'Enter' && e.shiftKey == true) {
                e.preventDefault();
                var xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/run");
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        document.getElementById('code-response').innerHTML = JSON.stringify(JSON.parse(xhr.responseText), null, 4);
                        document.getElementById('code-response').style.display = 'block';
                        document.querySelector('.code-tooltip').style.display = 'none';
                    }
                }
                xhr.send(JSON.stringify({
                    script: codeEditor.getValue(),
                    session: now
                }));
            }
        });
    }
};

if (window.callPhantom || window._phantom) {
  document.querySelector('.code-form').className += ' active';
}
