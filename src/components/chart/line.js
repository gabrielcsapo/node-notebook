import React from 'react';
import PropTypes from 'prop-types';

import { Curve } from './curve';
import { XAxis, YAxis } from './axis';
import { Points } from './points';
import { Tooltip } from './tooltip';

import './line.css';

class LineChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tooltip: false,
			value: '',
			dataSet: 0,
			index: 0,
			x: 0,
			y: 0,
			color: '',
			updating: false
		};
  }

	componentWillReceiveProps() {
    this.setState({ updating: true }, this.endUpdate);
	}

	endUpdate() {
		setTimeout(() => {
      this.setState({ updating: false });
		}, 300);
	}

	showTooltip(point, dataSetIndex, index) {
		this.setState({
			updating: false,
			tooltip: true,
			value: point[2],
			dataSet: dataSetIndex,
			index: index,
			x: point[0],
			y: point[1],
			color: point[3]
		});
	}

	hideTooltip() {
		this.setState({
			tooltip: false,
			value: '',
			dataSet: 0,
			index: 0,
			x: 0,
			y: 0,
			color: '',
			updating: false
		});
	}

	render() {
		const { updating, tooltip, value, x, y, color } = this.state;
		let {
			data,
			lines,
			area,
			dots,
			stroke,
			radius,
			grid,
			axis,
			width,
			height,
			colors,
			labels,
			hideLabels,
			maxValue,
			heightRatio,
			padding
		} = this.props;

		let dataSet = [];
		const size = data[0].length - 1;

		height = height || width * (9 / 16);

		// Calculate the maxValue
		dataSet = data.forEach(pts => {
			var max = Math.max.apply(null, pts);
			maxValue =	max > maxValue ? max : maxValue;
		});

		// Y ratio
		if (maxValue === 0) {
      heightRatio = 1;
		} else {
			heightRatio = height / maxValue;
		}

		// Calculate the coordinates
    dataSet = data.map((pts, di) =>
      pts.map((pt, pi) => [
      ~~((width / size) * pi + padding) + .5, // x
      ~~((heightRatio) * (maxValue - pt) + padding) + .5, // y
      pt, // value
      colors[di % colors.length] // color
    ]
    ));

		const svgOpts = {
			xmlns: 'http://www.w3.org/2000/svg',
			width: (width + padding * 2) + 'px',
			height: (height + 2 * padding) + 'px',
			viewBox: '0 0 ' + (width + 2 * padding) + ' ' + (height + 2 * padding)
		};

		return (<span className='LineChart' style={{ width: width + 2 * padding }}>
			<svg {...svgOpts}>
				{ grid ?
					<g>
						<XAxis maxValue={ maxValue } padding={ padding } width={ width } height={ height } />
						<YAxis axis={ axis } padding={ padding } width={ width } height={ height } />
					</g>
				: null }

				{ dataSet.map((p, pi) =>
					<g key={ pi }>
						<Curve
							points={ p }
							lines={ lines }
							area={ area }
							width={ width }
							height={ height }
							padding={ padding }
							color={ colors[pi % colors.length] }
							updating={ updating }
							stroke={ stroke }
						/>

						<Points hideLabels={ hideLabels } dots={ dots } label={ labels[pi] } points={ p } dataSetIndex={ pi } showTooltip={ this.showTooltip.bind(this) } hideTooltip={ this.hideTooltip.bind(this) } stroke={ stroke } radius={ radius } />
					</g>
				)}
			</svg>
			{ tooltip ?
				<Tooltip
					value={ value }
					label={ labels[this.state.dataSet] }
					x={ x }
					y={ y - 15 }
					color={ color }
				/>
			: null }
		</span>);
	}
}

LineChart.propTypes = {
	data: PropTypes.array,
	axis: PropTypes.array,
	colors: PropTypes.array,
	labels: PropTypes.array,
	lines: PropTypes.booean,
	area: PropTypes.boolean,
	dots: PropTypes.boolean,
	stroke: PropTypes.number,
	radius: PropTypes.number,
	height: PropTypes.number,
	width: PropTypes.number,
	grid: PropTypes.boolean,
	padding: PropTypes.number,
	heightRatio: PropTypes.number,
	maxValue: PropTypes.number,
	hideLabels: PropTypes.boolean
}

LineChart.defaultProps = {
  data: [],
  colors: ['#aaa', '#888'],
  labels: [],
  lines: true,
  area: true,
  dots: true,
  stroke: 1,
  radius: 3,
  grid: true,
  padding: 50,
  heightRatio: 1,
  maxValue: 0,
  hideLabels: false,
  height: 0,
  width: 400
};

module.exports = LineChart;
