import React from 'react';
import PropTypes from 'prop-types';

class Curve extends React.Component {
	render() {
		let { points, width, height, padding, lines, area, color, stroke, updating } = this.props;
		let path = [];
		let areaPath = [];
		let style = {	pointerEvents: 'none' };
		let fn = lines === true ? 'L' : 'R';

		height += padding;

		if (updating === true) {
      style['opacity'] = 0;
      style['transition'] = 'none';
		}

		path = points.map((p, pi) => (pi === 0  ? '' : (pi === 1 ? fn : '')) + p[0] + ',' + p[1]);
		path = 'M' + path.join(' ');

		if (lines !== true) {
			path = parsePath(path, height).join(' ');
		}

		if (area === true) {
			areaPath = path.replace('M', 'L');
			areaPath = 'M' + padding + ',' + height + areaPath;
			areaPath += 'L' + (width + padding) + ',' + height;
		}

		return (
			<g style={ style }>
				{ area === true ? <path d={ areaPath } fill={ color } fillOpacity=".05" /> : null }
				<path d={ path } fill="none" stroke={ color } strokeWidth={ stroke } />
			</g>
		);
	}
}

Curve.propTypes = {
	points: PropTypes.object,
	width: PropTypes.number,
	height: PropTypes.number,
	padding: PropTypes.number,
	lines: PropTypes.array,
	area: PropTypes.boolean,
	color: PropTypes.string,
	stroke: PropTypes.number,
	updating: PropTypes.updating
};

module.exports = {
  Curve
};

// Catmull-Rom to Bezier found here: http://jsdo.it/ynakajima/catmullrom2bezier
// Whoever wrote this is AWESOME! Thank you!
function parsePath(d, maxHeight) {
  var pathArray = [], lastX = '', lastY = '';

  if ( -1 != d.search(/[rR]/) ) {
    // no need to redraw the path if no Catmull-Rom segments are found

    // split path into constituent segments
    var pathSplit = d.split(/([A-Za-z])/);
    for (var i = 0, iLen = pathSplit.length; iLen > i; i++) {
      var segment = pathSplit[i];

      // make command code lower case, for easier matching
      // NOTE: this code assumes absolution coordinates, and doesn't account for relative command coordinates
      var command = segment.toLowerCase();
      if ( -1 != segment.search(/[A-Za-z]/) ) {
        var val = "";
        if ( "z" != command ) {
          i++;
          val = pathSplit[ i ].replace(/\s+$/, '');
        }

        if ( "r" == command ) {
          // "R" and "r" are the a Catmull-Rom spline segment

          var points = lastX + "," + lastY + " " + val;

          // convert Catmull-Rom spline to Bézier curves
          var beziers = catmullRom2bezier( points, maxHeight );
          //insert replacement curves back into array of path segments
          pathArray.push( beziers );
        } else {
          // rejoin the command code and the numerical values, place in array of path segments
          pathArray.push( segment + val );

          // find last x,y points, for feeding into Catmull-Rom conversion algorithm
          if ( "h" == command ) {
            lastX = val;
          } else if ( "v" == command ) {
            lastY = val;
          } else if ( "z" != command ) {
            var c = val.split(/[,\s]/);
            lastY = c.pop();
            lastX = c.pop();
          }
        }
      }
    }
    // recombine path segments and set new path description in DOM
  }

	return pathArray;
}

function catmullRom2bezier( points, maxHeight ) {
  var crp = points.split(/[,\s]/);

  var d = "";
  for (var i = 0, iLen = crp.length; iLen - 2 > i; i+=2) {
    var p = [];
    if ( 0 == i ) {
      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
      p.push( {x: parseFloat(crp[ i + 4 ]), y: parseFloat(crp[ i + 5 ])} );
    } else if ( iLen - 4 == i ) {
      p.push( {x: parseFloat(crp[ i - 2 ]), y: parseFloat(crp[ i - 1 ])} );
      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
    } else {
      p.push( {x: parseFloat(crp[ i - 2 ]), y: parseFloat(crp[ i - 1 ])} );
      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
      p.push( {x: parseFloat(crp[ i + 4 ]), y: parseFloat(crp[ i + 5 ])} );
    }

    // Catmull-Rom to Cubic Bezier conversion matrix
    //    0       1       0       0
    //  -1/6      1      1/6      0
    //    0      1/6      1     -1/6
    //    0       0       1       0

    var bp = [];
    bp.push( { x: p[1].x,  y: p[1].y } );
    bp.push( { x: ((-p[0].x + 6*p[1].x + p[2].x) / 6), y: ((-p[0].y + 6*p[1].y + p[2].y) / 6)} );
    bp.push( { x: ((p[1].x + 6*p[2].x - p[3].x) / 6),  y: ((p[1].y + 6*p[2].y - p[3].y) / 6) } );
    bp.push( { x: p[2].x,  y: p[2].y } );

			bp = bp.map(_ => {
				if (_.y > maxHeight) {
					_.y = maxHeight;
				}

				return _;
			});

    d += "C" + bp[1].x + "," + bp[1].y + " " + bp[2].x + "," + bp[2].y + " " + bp[3].x + "," + bp[3].y + " ";
  }

  return d;
}
