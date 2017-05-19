import React from 'react';
import PropTypes from 'prop-types';

import { LineChart } from './chart';
import Table from './table';

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        renderOption: 'print'
    }
  }

  getType(result) {
    let type = typeof result;

    // make sure if it is an object we check if it is an array
    if(type == 'object' && Array.isArray(result)) {
      type = 'array';
    }

    return type;
  }

  getRenderOptions(type, result) {
      var options = [ 'print' ];
      if(result) {
          switch(type) {
              case 'array':
                switch(Array.isArray(result[0]) ? 'array' : typeof result[0]) {
                    case 'object':
                        options.push('table');
                        break;
                    case 'array':
                        options.push('lineChart');
                        break;
                }
                break;
          }
      }
      return options;
  }

  renderResult(result, renderOption) {
      switch(renderOption) {
          case 'print':
            return result.toString();
            break;
          case 'table':
            return <Table data={result} />;
          case 'lineChart':
            return <LineChart width={ (window.innerWidth / 2) - 150 } data={result}/>;
            break;
      }
  }

  changeRenderOption(event) {
      this.setState({
          renderOption: event.target.value
      });
  }

  render() {
    const { result } = this.props
    const { renderOption } = this.state;
    const type = this.getType(result);
    const options = this.getRenderOptions(type, result);

    return (
      <div>
        <div style={{ display: 'block', height: '30px' }}>
            <small style={{ float: 'left', lineHeight: '30px' }}> Result (<i> { type } </i>) </small>
            <select style={{ float: 'right' }} onChange={ this.changeRenderOption.bind(this) }>
                { options.map((opt) => {
                    return <option value={opt}>{opt}</option>
                }) }
            </select>
        </div>
        <pre>
            { this.renderResult(result, renderOption)}
        </pre>
      </div>
    )
  }
}

Result.propTypes = {
  result: PropTypes.any
};

export default Result;
