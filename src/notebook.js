import React from 'react';
import JSONfn from 'json-fn';
import PropTypes from 'prop-types';

import Block from './block';

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

      if(this.props.params.hash) {
          xhr.open("GET", `/api/notebook/${this.props.params.hash}`);
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
              break;
          } else {
              runnable[keys[noteIndex]] = notebook.notes[keys[noteIndex]].content;
          }
      }
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/run");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
              const returnValues = JSONfn.parse(xhr.responseText);
              Object.keys(returnValues).forEach((key) => {
                  notebook.notes[key].returnValue = returnValues[key];
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
      xhr.send(JSON.stringify({
          notebook
      }));
  }
  render() {
    const { notebook, error, loading } = this.state;

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
    return (
        <div style={{ width: "50%", position: "relative", margin: "0 auto" }}>
            <div style={{ display: 'block', height: '75px' }}>
                <a href={window.location.href} style={{ float: 'left' }} className="btn btn-info"> Share Url</a>
                <button style={{ float: 'right' }} className="btn btn-success" onClick={this.saveNotebook.bind(this)}> Save </button>
            </div>
            {notebook && notebook.notes && Object.keys(notebook.notes).length > 0 ? Object.keys(notebook.notes).map((id) => {
                return <Block key={id} id={id} returnValue={notebook.notes[id].returnValue} content={notebook.notes[id].content} deleteBlock={this.deleteBlock.bind(this)} runBlock={this.runBlock.bind(this)} onChange={this.onChange.bind(this)}/>
            }) : <div style={{ height: "300px", lineHeight: "300px", textAlign: 'center' }}> You currently have no notes, press <a href="#" onClick={this.addNote.bind(this)}> add </a> note to get some! </div> }
            <div style={{ position: "relative", borderTop: "1px solid #dedede" }}>
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
