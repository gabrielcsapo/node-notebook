import React from 'react';
import PropTypes from 'prop-types';

class Result extends React.Component {
  constructor(props) {
    super(props);
  }
  getType(result) {
    let type = typeof result;

    // make sure if it is an object we check if it is an array
    if(type == 'object' && Array.isArray(result)) {
      type = 'array';
    }

    return type;
  }
  render() {
    const { result } = this.props
    const type = this.getType(result);

    return (
      <div>
        <small> Result (<i> { type } </i>) </small>

        <pre>
            { result.toString() }
        </pre>
      </div>
    )
  }
}

Result.propTypes = {
  result: PropTypes.any
};

export default Result;
