import React from 'react';
import PropTypes from 'prop-types';

class Layout extends React.Component {
  render () {
    const { children } = this.props;

    return (
      <div style={{ width: '50%', height: '100%', margin: '0 auto', position: 'relative' }}>
        <div className="navbar">
          <div className="container">
            <div className="navbar-title">
              <a className="text-black" href="/">
                <span className="text-black">node-notebook</span>
              </a>
            </div>
            <div className="nav">
              <a className="text-black" href="/notebook">New 📓</a>
              <a className="text-black" href="https://github.com/gabrielcsapo/node-notebook">Source</a>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "60px" }}>
          { children }
        </div>
          <div className="navbar navbar-center footer">
            <div className="container text-center">
              <div className="text-black">
                <a href="https://github.com/gabrielcsapo/node-notebook">node-notebook</a>
                &nbsp;by&nbsp;
                <a href="http://gabrielcsapo.com">@gabrielcsapo</a>
              </div>
            </div>
          </div>
      </div>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.object
};

export default Layout;
