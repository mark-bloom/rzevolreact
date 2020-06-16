import React from 'react';
import logo from './logo.svg';
import './App.css';
//import Menu from './Menu';
import Game from './Game';
import { Container } from '@material-ui/core';

function App() {
  return (
    <div className="App">
      <Container className="FullPage">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>RZevol in React</h1>
        </header>
        <div className="GameDiv">
          <Game/>
        </div>
        {/* <Container className="MenuContainer">
          <Menu/>
        </Container> */}
      </Container>
    </div>
  );
}

export default App;