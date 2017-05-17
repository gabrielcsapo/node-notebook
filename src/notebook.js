import React from 'react';
import JSONfn from 'json-fn';
import PropTypes from 'prop-types';

import Block from './components/block';
import { LineChart } from './components/chart';

class Notebook extends React.Component {
  constructor(props) {
     super(props);
     this.state = {
       loading: true,
       notebook: {},
       error: ''
     };
  }
  componentWillMount() {
      const self = this;
      const xhr = new XMLHttpRequest();
      const hash = this.props.params && this.props.params.hash;

      if(hash) {
          xhr.open("GET", `/api/notebook/${hash}`);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                if(xhr.status == 200) {
                  const returnValues = JSON.parse(xhr.responseText).notebook;
                  returnValues.notes = returnValues.notes || {};
                  self.setState({
                      loading: false,
                      notebook: returnValues
                  });
                } else {
                    const returnValues = JSON.parse(xhr.responseText);
                    self.setState({
                        loading: false,
                        error: returnValues
                    });
                }
              }
          }
          xhr.send();
      } else {
          xhr.open("POST", `/api/notebook`);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.onreadystatechange = function() {
              if (xhr.readyState == 4 && xhr.status == 200) {
                  const returnValues = JSON.parse(xhr.responseText);
                  returnValues.notes = {};
                  self.setState({
                      loading: false,
                      notebook: returnValues
                  });
                  if(history) {
                      history.pushState({}, null, `/notebook/${returnValues._id}`);
                  }
              }
          }
          xhr.send();
      }
  }
  deleteBlock(id) {
      let { notebook } = this.state;

      notebook.notes = Object.keys(notebook.notes)
        .filter(key => key !== id)
        .reduce((obj, key) => {
          obj[key] = notebook.notes[key];
          return obj;
        }, {});

      this.setState({
          notebook
      });
  }
  runBlock(id) {
      const self = this;
      const { notebook } = this.state;
      const runnable = {} // the object that holds the runnable scripts
      const keys = Object.keys(notebook.notes);
      for(var noteIndex = 0; noteIndex <= keys.length - 1; noteIndex++) {
          if(keys[noteIndex] == id) {
              runnable[keys[noteIndex]] = notebook.notes[keys[noteIndex]].content;
              notebook.notes[keys[noteIndex]].loading = true;
              break;
          } else {
              runnable[keys[noteIndex]] = notebook.notes[keys[noteIndex]].content;
              notebook.notes[keys[noteIndex]].loading = true;
          }
      }
      // update loading state
      self.setState({
          notebook
      });

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/run");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
              const returnValues = JSONfn.parse(xhr.responseText);
              Object.keys(returnValues).forEach((key) => {
                  notebook.notes[key].returnValue = returnValues[key];
                  notebook.notes[key].loading = false;
              });
              self.setState({
                  notebook
              });
          }
      }
      xhr.send(JSON.stringify({
          runnable
      }));
  }
  onChange(id, value) {
      const { notebook } = this.state;

      notebook.notes[id].content = value;

      this.setState({
          notebook
      });
  }
  addNote() {
      const { notebook } = this.state;
      const id = Date();

      notebook.notes[id] = {
        content: '',
        returnValue: ''
      };

      this.setState({
          notebook
      });
  }
  saveNotebook() {
      const { notebook } = this.state;

      var xhr = new XMLHttpRequest();
      xhr.open("PUT", "/api/notebook");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status !== 200) {
              const returnValues = JSON.parse(xhr.responseText);
              self.setState({
                  error: returnValues
              });
          }
      }
      xhr.send(JSONfn.stringify({
          notebook
      }));
  }
  forkNotebook() {
    const { notebook } = this.state;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/notebook");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if(xhr.status === 200) {
            const returnValues = JSON.parse(xhr.responseText);
            window.location.href = `/notebook/${returnValues._id}`;
          } else {
            const returnValues = JSON.parse(xhr.responseText);
            self.setState({
                error: returnValues
            });
          }
        }
    }
    delete notebook['_id'];

    xhr.send(JSONfn.stringify({
        notebook
    }));
  }
  render() {
    const { notebook, error, loading } = this.state;
    const { notes } = notebook;

    if(loading) {
      return (
        <div style={{ position: "relative", height: `${window.innerHeight}` }}>
            <div style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span> Loading notebook ... </span>
            </div>
        </div>
      )
    }
    if(error) {
        return (
            <div style={{ position: "relative", height: `${window.innerHeight}` }}>
                <div style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <span>Error when retrieving document 🙈</span>
                    <br/>
                    <br/>
                    <a href='/notebook'> Try Creating a New Notebook </a>
                </div>
            </div>
        )
    }

    const times = Object.keys(notes).map((n => {
      return notes[n].returnValue && notes[n].returnValue.time;
    }));
    const opt = {
        data: [times],
        colors: ['#9a8585', '#a7daff', '#f7ca97'],
        labels: ['Time'],
        width: (window.innerWidth / 2) - 100,
        height: 200,
        lines: true,
        area: true,
        dots: true,
        hideLabels: false,
        grid: true
    };

    return (
        <div style={{ marginTop: '100px' }}>
            <pre className="text-center">
              {window.location.href}
            </pre>
            <div style={{ display: 'block', height: '60px' }}>
                <button style={{ float: 'left' }} className="btn btn-warning" onClick={this.forkNotebook.bind(this)}> Fork </button>
                <button style={{ float: 'right' }} className="btn btn-success" onClick={this.saveNotebook.bind(this)}> Save </button>
            </div>
            <LineChart {...opt}/>
            {notes ? Object.keys(notes).map((id) => {
                return <Block key={id} id={id} returnValue={notes[id].returnValue} content={notes[id].content} loading={notes[id].loading} deleteBlock={this.deleteBlock.bind(this)} runBlock={this.runBlock.bind(this)} onChange={this.onChange.bind(this)}/>
            }) : <div style={{ height: "300px", lineHeight: "300px", textAlign: 'center' }}> You currently have no notes, press <a href="#" onClick={this.addNote.bind(this)}> add </a> note to get some! </div> }
            <div style={{ position: "relative", borderTop: "1px solid #dedede", borderBottom: "1px solid #dedede", height: "60px" }}>
                <button style={{ float: 'left' }} className="btn btn-default" onClick={this.addNote.bind(this)}> Add </button>
                <button style={{ float: 'right' }} className="btn btn-default" onClick={this.runBlock.bind(this)}> Run All </button>
            </div>
        </div>
    );
  }
}

Notebook.propTypes = {
    params: PropTypes.objectOf({
        hash: PropTypes.string
    })
}

export default Notebook;
