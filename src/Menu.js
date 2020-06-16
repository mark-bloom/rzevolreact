import React from 'react';
import './App.css';
import Grid from '@material-ui/core/Grid';
import { Container } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: 'white',
    background: '#424242',
  },
  menucontainer: {
    background: '#333333',
    borderRadius: '4px',
  },
}));

function Menu() {
  const classes = useStyles();
  return (
    <div className="Menu">
        <Container maxWidth="lg" className={classes.menucontainer}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.paper}>menu xs=12</Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.paper}>menu xs=6</Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.paper}>menu xs=6</Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>menu xs=3</Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>menu xs=3</Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>menu xs=3</Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className={classes.paper}>menu xs=3</Paper>
            </Grid>
          </Grid>
        </Container>
    </div>
  );
}

export default Menu;
