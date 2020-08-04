import React from 'react';
import logo from './logo.svg';
import './App.css';
//import Menu from './Menu';
import Game from './Game';
import { Container } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <Container className="FullPage">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>RZevol in React</h1>
          </header>
          <Game/>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;