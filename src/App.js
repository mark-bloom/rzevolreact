import React from 'react';
import logo from './logo.svg';
import './App.css';
import Menu from './Menu';
import Game from './Game';
import { Container } from '@material-ui/core';

function App() {
  return (
    <div className="App">
      <Container className="FullPage">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>

        <Menu/>
      </Container>
    </div>
  );
}

export default App;
