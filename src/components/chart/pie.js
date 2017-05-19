import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from './tooltip';
import { Slice } from './slice';

import './pie.css';

class Pie extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: false,
      value: '',
      label: 0,
      x: 0,
      y: 0,
      color: ''
    };
  }

  showTooltip(point) {
		this.setState({
			tooltip: true,
			value: point[2],
			label: point[3],
			x: point[0],
			y: point[1],
			color: point[4]
		});
	}

	hideTooltip() {
		this.setState({
     tooltip: false,
     value: '',
     label: 0,
     x: 0,
     y: 0,
     color: ''
   });
	}

	render() {
		const { colors, percent, labels, hole, radius, data, stroke, strokeWidth } = this.props;

		const colorsLength = colors.length;
		const diameter = radius * 2;

    let sum = data.reduce(function (carry, current) { return carry + current; }, 0);
    let _startAngle = 0;

    const opts = {
        width: diameter,
        height: diameter,
        viewBox: '0 0 ' + diameter + ' ' + diameter,
        xmlns:"http://www.w3.org/2000/svg",
        version:"1.1"
    };

		return (
      <span>
        <svg {...opts}>
          {data.map((slice, sliceIndex) => {
            const _nextAngle = _startAngle;
            const _angle = (slice / sum) * 360;
            const _percent = (slice / sum) * 100;
            _startAngle += _angle;

            return (<Slice
                key={ sliceIndex }
                value={ slice }
                percent={ percent }
                percentValue={ _percent.toFixed(1) }
                startAngle={ _nextAngle }
                angle={ _angle }
                radius={ radius }
                hole={ radius - hole }
                trueHole={ hole }
                showLabel= { labels }
                fill={ colors[sliceIndex % colorsLength] }
                stroke={ stroke }
                strokeWidth={ strokeWidth }
                showTooltip={ this.showTooltip }
                hideTooltip={ this.hideTooltip }
            />);
          })}
        </svg>
        { this.state.tooltip ?
          <Tooltip
            value={ this.state.value }
            label={ this.state.label }
            x={ this.state.x }
            y={ this.state.y - 15 }
            color={ this.state.color }
          />
        : null }
      </span>
		);
	}
}

Pie.propTypes = {
  colors: PropTypes.array,
  data: PropTypes.array,
  percent: PropTypes.boolean,
  labels: PropTypes.boolean,
  hole: PropTypes.number,
  radius: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number
};

Pie.defaultProps = {
  colors: [],
  data: [],
  percent: true,
  labels: true,
  hole: 0,
  radius: 0,
  stroke: '#fff',
  strokeWidth: 0
};

module.exports = Pie;
