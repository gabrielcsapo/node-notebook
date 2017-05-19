import React from 'react';

class Main extends React.Component {
  render() {
    return (
        <div style={{ position: "relative", height: `${ window.innerHeight - 200 }`, width:"100%" }}>
          <div className="text-center" style={{ position: "absolute", width: "100%", top: "50%", transform: "translateY(-50%)" }}>
            Hello 📖
            <br/>
            <br/>
            <a href="/notebook">Start a New Notebook</a>
          </div>
        </div>
    );
  }
}

export default Main;
