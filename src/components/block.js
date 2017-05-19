import React from 'react';
import JSONTree from 'react-json-tree';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';

import 'brace/mode/javascript';
import 'brace/theme/github';

import Result from './result';

class Block extends React.Component {
  constructor(props) {
    super(props);
  }
  onChange(value) {
      const { id, onChange } = this.props;

      onChange(id, value);
  }
  deleteBlock() {
      const { id, deleteBlock } = this.props;

      deleteBlock(id);
  }
  runBlock() {
      const { id, runBlock } = this.props;

      runBlock(id);
  }
  render() {
    const { content, returnValue, loading } = this.props;

    const { context, result, ast, error, time } = returnValue;

    if(loading) {
      return (
        <div className="spinner-overlay"  style={{ height: "200px", border: "1px solid #dedede", marginTop: "10px", marginBottom: "60px" }}>
          <div className="spinner-wrapper">
            <div className="spinner spinner-primary"></div>
          </div>
        </div>
      )
    }

    return (
        <div style={{ position: "relative", marginTop: "10px", marginBottom: "60px" }}>
            <div style={{ border: "1px solid #dedede" }}>
                <AceEditor
                    width="auto"
                    height="200px"
                    mode="javascript"
                    theme="github"
                    value={content}
                    onChange={this.onChange.bind(this)}
                />
            </div>
            <div style={{ height: "50px" }}>
                <button style={{ padding: "5px", float: "left" }} className="btn btn-warning" type="button" onClick={ this.deleteBlock.bind(this) }> Delete </button>
                <button style={{ padding: "5px", float: "right" }} className="btn btn-default" type="button" onClick={ this.runBlock.bind(this) }> Run </button>
            </div>
            { time !== undefined ? <div>
              <small> Time </small>
              <pre>
                Took {time} ms
              </pre>
            </div> : ''}
            { error ? <div>
              <small> Error </small>
              <pre>
                { error }
              </pre>
            </div> : ''}
            { context && context.console ? <div>
                <small> Console </small>
                <pre>
                    { context.console.map((value, i) => { return `${i}: ${value.toString()}`}) }
                </pre>
            </div> : '' }
            { context ? <div>
                <small> Context </small>
                <pre>
                    <JSONTree data={Object.keys(context)
                      .filter(key => key !== 'console')
                      .reduce((obj, key) => {
                        obj[key] = context[key];
                        return obj;
                      }, {})} theme={{
                      scheme: 'monokai',
                      base00: 'rgba(#ffffff, 0)',
                      base01: '#383830',
                      base02: '#49483e',
                      base03: '#75715e',
                      base04: '#a59f85',
                      base05: '#f8f8f2',
                      base06: '#f5f4f1',
                      base07: '#f9f8f5',
                      base08: '#f92672',
                      base09: '#fd971f',
                      base0A: '#f4bf75',
                      base0B: '#a6e22e',
                      base0C: '#a1efe4',
                      base0D: '#66d9ef',
                      base0E: '#ae81ff',
                      base0F: '#cc6633'
                    }} invertTheme={true} />
                </pre>
            </div> : '' }
            { result ? <Result result={ result }/> : '' }
            { ast ? <div>
              <small> AST </small>
              <pre>
                  <JSONTree data={ast} theme={{
                    scheme: 'monokai',
                    base00: 'rgba(#ffffff, 0)',
                    base01: '#383830',
                    base02: '#49483e',
                    base03: '#75715e',
                    base04: '#a59f85',
                    base05: '#f8f8f2',
                    base06: '#f5f4f1',
                    base07: '#f9f8f5',
                    base08: '#f92672',
                    base09: '#fd971f',
                    base0A: '#f4bf75',
                    base0B: '#a6e22e',
                    base0C: '#a1efe4',
                    base0D: '#66d9ef',
                    base0E: '#ae81ff',
                    base0F: '#cc6633'
                  }} invertTheme={true} />
              </pre>
            </div> : ''}
        </div>
    );
  }
}

Block.defaultProps = {
  content: '',
  id: new Date(),
  onChange: () => {},
  deleteBlock: () => {},
  runBlock: () => {},
  returnValue: {}
};

Block.propTypes = {
  id: PropTypes.string,
  loading: PropTypes.boolean,
  content: PropTypes.string,
  onChange: PropTypes.func,
  deleteBlock: PropTypes.func,
  runBlock: PropTypes.func,
  returnValue: PropTypes.object
};

export default Block;
