const bodyParser = require('body-parser');
const acorn = require('acorn');
const estraverse = require('estraverse');
const escodegen = require('escodegen');
const JSONfn = require('json-fn');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const vm = require('vm');
const app = express();
const port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/node-notebook');
const NotebookSchema = new mongoose.Schema({ notes: Object }, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
const Notebook = mongoose.model('Notebook', NotebookSchema);

app.use(express.static('dist'));

app.use(bodyParser.urlencoded({
    extended: false,
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}));
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}));

function parse(code) {
    var ast = acorn.parse(code);
    var parsed = estraverse.replace(ast, {
        enter: function (node) {
            if(node.type === 'CallExpression') {
                if(node.callee && node.callee.object && node.callee.object.name && node.callee.object.name == 'console' && node.callee.property) {
                    node.callee.property.name = 'push';
                }
            }
        }
    });
    return escodegen.generate(parsed);
}

app.post('/api/notebook', (req, res) => {
    const notebook = req.body.notebook;

    Notebook.create((notebook || {}), (error, doc) => {
        if(error) {
            res.status(500);
            res.send(error);
        } else {
            res.status(200);
            res.send(doc);
        }
    });
});

app.put('/api/notebook', (req, res) => {
    const notebook = req.body.notebook;

    Notebook.findOneAndUpdate({ _id: notebook._id }, notebook, (error, doc) => {
        if(error) {
            res.status(500);
            res.send(error);
        } else {
            res.status(200);
            res.send(doc);
        }
    });
});

app.get('/api/notebook/:hash', (req, res) => {
    Notebook.findOne({ _id: req.params.hash }, (error, doc) => {
        if(error) {
            res.status(500);
            return res.send({ error });
        }
        res.send({ notebook: doc });
    });
});

app.post('/api/run', (req, res) => {
    const results = {};
    const runnable = req.body.runnable;
    const sandbox = {
        console: []
    };
    const context = new vm.createContext(sandbox, {}, {
        displayErrors: true
    });

    Object.keys(runnable).forEach((key) => {
        try {
          const value = parse(runnable[key]);
          const script = new vm.Script(value);
          results[key] = {
              result: script.runInContext(context),
              context: Object.assign({}, context),
              ast: acorn.parse(value)
          };
          // make sure the console resets
          context.console = [];
        } catch(ex) {
          results[key] = {
            error: ex.toString()
          }
        }
    });
    res.status(200);
    res.send(JSONfn.stringify(results));
});

app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`node-notebook listening on port ${port}`); // eslint-disable-line
});
