import React from 'react';
import PropTypes from 'prop-types';

class Tooltip extends React.Component {
  render() {
		const { value, label, x, y, color } = this.props;
    const style = {
			left: ~~x,
			top: ~~y
		};

		return (
			<span className="LineChart--tooltip" style={ style }>
					<b style={{ color: color }}>{ label }</b>
					<i>{ value }</i>
			</span>
		);
	}
}

Tooltip.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  color: PropTypes.string
};

Tooltip.defaultProps = {
  value: 0,
  label: '',
  x: 0,
  y: 0,
  color: ''
};

module.exports = {
  Tooltip
};
