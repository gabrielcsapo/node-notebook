import React from 'react';
import PropTypes from 'prop-types';

import Point from './point';

class Points extends React.Component {
	render() {
		let { points, dataSetIndex, showTooltip, hideTooltip, radius, stroke, label, dots, hideLabels } = this.props;

		let lastPoint = points[points.length - 1];
		let color = lastPoint[3];
		let x = lastPoint[0];
		let y = lastPoint[1];

		return (
			<g>
				{ dots === true ?
				points.map((p, pi) =>
					<Point
            point={ p }
						dataSetIndex={ dataSetIndex }
						showTooltip={ showTooltip }
						hideTooltip={ hideTooltip }
						stroke={ stroke }
						radius={ radius }
						index={ pi }
						key={ pi }
					/>)
				: null }

				{ hideLabels !== true ?
					<text className="LineChart--label" x={ x + 5 } y={ y + 2 } fill={ color }>{ label }</text>
				: null }
			</g>
		);
	}
}

Points.propTypes = {
  points:  PropTypes.object,
  dataSetIndex: PropTypes.number,
  showTooltip: PropTypes.func,
  hideTooltip: PropTypes.func,
  radius: PropTypes.number,
  stroke: PropTypes.string,
  label: PropTypes.string,
  dots: PropTypes.boolean,
  hideLabels: PropTypes.boolean
};

Points.defaultProps = {
  points: {},
  dataSetIndex: 0,
  showTooltip: () => {},
  hideTooltip: () => {},
  radius: 0,
  stroke: '#fff',
  label: '',
  dots: true,
  hideLabels: false
};

module.exports = {
  Points
};
