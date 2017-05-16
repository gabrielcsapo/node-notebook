import React from 'react';

class Main extends React.Component {
  render() {
    return (
        <div className="text-center" style={{width:"100%",position: "absolute",top: "50%",transform: "translateY(-50%)"}}>
          Hello 📖
          <br/>
          <br/>
          <a href="/notebook">Start a New Notebook</a>
        </div>
    );
  }
}

export default Main;
