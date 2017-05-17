import React from 'react';
import PropTypes from 'prop-types';

class Point extends React.Component {
	mouseEnter() {
		this.props.showTooltip(this.props.point, this.props.dataSetIndex, this.props.index);
	}

	mouseLeave() {
		this.props.hideTooltip();
	}

	render() {
    const { point, stroke, radius } = this.props;
    const x = point[0];
    const y = point[1];
    const color = point[3];

		return (<circle
			cx={ x }
      cy={ y }
			r={ radius }
      fill={ color }
			strokeWidth={ stroke }
      stroke={ '#ffffff' }
			onMouseEnter={ this.mouseEnter.bind(this) }
      onMouseLeave={ this.mouseLeave.bind(this) }
    />);
	}
}

Point.propTypes = {
  point: PropTypes.array,
  stroke: PropTypes.string,
  radius: PropTypes.number,
  index: PropTypes.number,
  dataSetIndex: PropTypes.number,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func
};

Point.defaultProps = {
  point: [],
  stroke: '#fff',
  radius: 0,
  index: 0,
  dataSetIndex: 0,
  showTooltip: () => {},
  hideTooltip: () => {}
};

module.exports = Point;
