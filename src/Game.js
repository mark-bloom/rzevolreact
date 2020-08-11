import React from 'react';
import './Game.css';
import { Button , Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import clsx from 'clsx';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

// TESTING SUDOKU CELLS
import './Sudoku.css';

const DEFAULT_RGB = [125,125,125];
const DEFAULT_HSL = [0,0,49];
const DEFAULT_COLOR = "rgb(125,125,125)";

const RANDOM_CHANCE = 0.05;
const DEFAULT_SIZE = 30;
const DEFAULT_INTERVAL = 250;

const DEFAULT_STD_DEV = 25;

const MUTATE_BASE = 0.00025;
const MUTATE_NEIGHBOUR = 0.003;
// const MUTATE_DEATH = 0.00005;

const MEAN_DEATH = 100;

const DEFAULT_RGB_BIAS = 0.4;
const DEFAULT_HSL_BIAS= 0.4;

const HSL_SPACE = false;
const POLAR_RAND = true;

const styles = (theme) => ({
  margin: {
    '& label.Mui-focused': {
      color: '#61DAFB',
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: '#61DAFB',
        },
    },
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: '14ch',
  },
  button: {
    type: 'dark',
      width: '10ch',
      verticalAlign: '10',
  },
  radiobuttons: {
      color: 'white',
      borderColor: '#61DAFB',
  },
  slider: {
      color: 'red',
      borderColor: '#61DAFB',
  }
});

const marks = [
    {
        value: 50,
        label: '50',
    },
    {
        value: 250,
        label: '250',
    },
    {
        value: 450,
        label: '450',
    },
    {
        value: 550,
        label: '∞',
    },
];
  
function valuetext(value) {
    return `${value}`;
}

function valueLabelFormat(value) {
    if (value === 550) return '∞';
    else return value;
}

class Cell extends React.Component {

    constructor(xVal, yVal) {
        super();
        this.x = xVal;
        this.y = yVal;
        this.alive = false;
        this.colorDisplay = DEFAULT_COLOR;
        this.colorRGB = DEFAULT_RGB;
        this.colorHSL = DEFAULT_HSL;
        this.deathTime = 0;
        this.age = 0;
        this.data = 0;
    }
    
}

class Game extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            isRunning: false,

            interval: DEFAULT_INTERVAL,
            displayinterval: DEFAULT_INTERVAL,

            size: DEFAULT_SIZE,
            displaysize: DEFAULT_SIZE,

            stdDev: DEFAULT_STD_DEV,
            displayStdDev: DEFAULT_STD_DEV,

            mutateChance: MUTATE_BASE,
            displaymutateChance: MUTATE_BASE*100,

            neighbourMutateChance: MUTATE_NEIGHBOUR,
            displayNeighbourChance: MUTATE_NEIGHBOUR*100,

            // deathChance: MUTATE_DEATH,
            // displayDeathChance: MUTATE_DEATH*100,

            rgbMutate: DEFAULT_RGB_BIAS,
            displayRGBMutate: DEFAULT_RGB_BIAS,

            hslMutate: DEFAULT_HSL_BIAS,
            displayHSLmutate: DEFAULT_HSL_BIAS,

            hslSpace: HSL_SPACE,
            polarRandom: POLAR_RAND,

            meanDeathAge: MEAN_DEATH,

            board: this.makeEmptyBoard(DEFAULT_SIZE),
        }
    }

    /**
     * SIMULATION HANDLING
     */
    runIteration() {
        const { board, size, mutateChance, meanDeathAge, neighbourMutateChance } = this.state;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let mutationRoll = Math.random();
                if(board[y][x].alive){ // if alive, age and check death
                    if (meanDeathAge !== 550 && (board[y][x].age > board[y][x].deathTime)){ // 550 = ∞
                        this.killCell(y, x);
                    } else {
                        board[y][x].age++;
                    }
                } else { // if dead, chance to wake and/or mutate
                    // get data about neighbours (numbers and colors)
                    let neighbourData = this.calculateneighbours(x, y);
                    let neighbourCount = neighbourData[0];
                    // neighbours impacts mutation chance
                    if ( mutationRoll <= mutateChance ) {
                        this.wakeCell(y, x);
                    } else if ( mutationRoll <= (mutateChance + (neighbourMutateChance*neighbourCount)) ) {
                        board[0][0].data = board[y][x].alive;
                        board[0][1].data = board[y][x].x+ " " +board[y][x].y;
                        this.mutateCell(y, x, neighbourData);
                    }
                }
            }
        }
        
        this.setState({ board });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    calculateneighbours(x, y) {
        const { board, size, hslSpace} = this.state;
        let neighbours = 0;
        let neighbourColors = [];
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];
            if (x1 >= 0 && x1 < size && y1 >= 0 && y1 < size && board[y1][x1].alive) {
                neighbours++;
                (hslSpace) ? neighbourColors.push([x1,y1,board[y1][x1].colorHSL])
                    : neighbourColors.push([x1,y1,board[y1][x1].colorRGB])
            }
        }
        return [neighbours,neighbourColors];
    }

    /** 
     * INTERNAL METHODS
     */
    makeEmptyBoard(rowNum) {
        let boardT = [];
        for (let y = 0; y < rowNum; y++) {
            boardT[y] = [];
            for (let x = 0; x < rowNum; x++) {
                boardT[y][x] = new Cell(y, x);
            }
        }
        return boardT;
    }

    toggleCell(y, x) {
		const { board } = this.state;
        ( board[y][x].alive ? this.killCell(y, x) : this.wakeCell(y, x) )
        this.setState( {board} );
    }
    
    wakeCell(y, x) {
        const { board, meanDeathAge } = this.state;
        board[y][x].alive = true;
        board[y][x].age = 0;
        board[y][x].deathTime = this.randn_bmDeath(meanDeathAge);
        board[y][x].colorDisplay = DEFAULT_COLOR;
        board[y][x].colorRGB = DEFAULT_RGB;
        board[y][x].colorHSL = DEFAULT_HSL;
    }

    killCell(y, x) {
        const { board } = this.state;
        board[y][x].alive = false;
        board[y][x].age = 0;
    }

    mutateCell(y, x, neighbourData) {
        const { board, hslSpace, meanDeathAge } = this.state;
        // using color of single, randomly-selected parent
        let selectedParent = neighbourData[1][Math.floor(Math.random()*neighbourData[0])];
        let parentColor = selectedParent[2];
        let newColor = this.mutateColor(parentColor);
        if (hslSpace) { // using HSL color space
            board[y][x].colorHSL = newColor; //not rounded
            board[y][x].colorDisplay = "hsl("+Math.floor(newColor[0])+","+Math.floor(newColor[1])+"%,"+Math.floor(newColor[2])+"%)";
        } else { // using RGB color space
            board[y][x].colorRGB = newColor; //not rounded
            board[y][x].colorDisplay = "rgb("+Math.floor(newColor[0])+","+Math.floor(newColor[1])+","+Math.floor(newColor[2])+")";
        }
        board[y][x].alive = true;
        board[y][x].age = 0;
        board[y][x].deathTime = this.randn_bmDeath(meanDeathAge);
    }

    mutateColor (inputColor) {
        const { hslSpace, polarRandom, stdDev, hslMutate, rgbMutate} = this.state;
        if ( hslSpace) { // if using HSL color space
            let tempHSL = [0,0,0];
            if (inputColor[0] === 0) {
                tempHSL[0] = Math.floor(Math.random()*Math.floor(360));
            }
            // Seperately handle H, S, L
            if (polarRandom) {
                tempHSL[0] += (inputColor[0] + this.randn_bmPolar(stdDev, 0.5));
                tempHSL[1] += (inputColor[1] + this.randn_bmPolar(stdDev/2, hslMutate));
                tempHSL[2] += (inputColor[2] + this.randn_bmPolar(stdDev/6, 0.5));
            } else {
                tempHSL[0] += (inputColor[0] + this.randn_bm(stdDev, 0.5));
                tempHSL[1] += (inputColor[1] + this.randn_bmPolar(stdDev/2, hslMutate));
                tempHSL[2] += (inputColor[2] + this.randn_bm(stdDev/6, 0.5));
            }
            if (tempHSL[0] > 360) tempHSL[0] = 360;
            else if (tempHSL[0] < 0 ) tempHSL[0] = 0;
            if (tempHSL[1] > 100) tempHSL[1] = 100;
            else if (tempHSL[1] < 0 ) tempHSL[1] = 0;
            if (tempHSL[2] > 100) tempHSL[2] = 100;
            else if (tempHSL[2] < 0 ) tempHSL[2] = 0;

            return tempHSL;
        } else { // if using RGB color space
            let tempRGB = [0,0,0];
            for (let c = 0; c < 3; c++) {
                if (polarRandom) {
                    tempRGB[c] = (inputColor[c] + this.randn_bmPolar(stdDev, rgbMutate));
                } else {
                    tempRGB[c] = (inputColor[c] + this.randn_bm(stdDev, rgbMutate));
                }
                if (tempRGB[c] > 255) tempRGB[c] = 255;
                else if (tempRGB[c] < 0 ) tempRGB[c] = 0;
            }
            return tempRGB;
        }
    }

    randn_bm(stdDev, skew) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.randn_bm(); // resample between 0 and 1 if out of range
        num -= skew;
        num *= (10 * stdDev); // Stretch to fill range
        return num;
    }

    randn_bmPolar(stdDev, skew) { // ALTERNATE RANDOM FOR TESTING
        let u = 0, v = 0, w = 1;
        while(w >= 1) {
          u = 2 * Math.random() - 1;
          v = 2 * Math.random() - 1;
          w = u*u + v*v;
        }
        w = Math.sqrt( -2.0 * Math.log( w ) / w);
        let output = (u * w) * stdDev;
        return (output - stdDev*skew);
      }

      randn_CLT(stdDev, skew) { // ALTERNATE RANDOM FOR TESTING
        var rand = 0;
        for (var i = 0; i < 6; i += 1) {
          rand += Math.random();
        }
        rand = rand / 6;
        rand = (rand - skew) * stdDev;
        return rand;
      }

    randn_bmDeath(meanDeath) {
        let min = meanDeath * 0.5;
        let max = meanDeath * 1.5;
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.randn_bmDeath(meanDeath); // resample between 0 and 1 if out of range
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }

    /**
     * BUTTON CLICK HANDLING
     */
    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
    }

    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    handleClear = () => {
        const { size } = this.state;
        this.stopGame();
        let newBoard = this.makeEmptyBoard(size);
        this.setState({ board: newBoard });
    }

    handleRandom = () => {
        const { board, size } = this.state;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                (Math.random() <= RANDOM_CHANCE) && (this.wakeCell(y, x));
            }
        }
        this.setState({ board });
    }

    handleDefaults = () => {
        this.setState({
            interval: DEFAULT_INTERVAL,
            displayinterval: DEFAULT_INTERVAL,

            stdDev: DEFAULT_STD_DEV,
            displayStdDev: DEFAULT_STD_DEV,

            mutateChance: MUTATE_BASE,
            displaymutateChance: MUTATE_BASE*100,

            neighbourMutateChance: MUTATE_NEIGHBOUR,
            displayNeighbourChance: MUTATE_NEIGHBOUR*100,

            // deathChance: MUTATE_DEATH,
            // displayDeathChance: MUTATE_DEATH*100,

            rgbMutate: DEFAULT_RGB_BIAS,
            displayRGBMutate: DEFAULT_RGB_BIAS,

            hslMutate: DEFAULT_HSL_BIAS,
            displayHSLmutate: DEFAULT_HSL_BIAS,

            hslSpace: HSL_SPACE,
            polarRandom: POLAR_RAND,
            meanDeathAge: MEAN_DEATH,
            
         });

         this.stopGame();

         // only reset board if size changes
         if (this.state.size !== DEFAULT_SIZE) {
            this.setState({
                size: DEFAULT_SIZE,
                displaySize: DEFAULT_SIZE,
            });
            let newBoard = this.makeEmptyBoard(DEFAULT_SIZE);
            this.setState({ board: newBoard });    
         }
    }

    /**
     * TEXT FIELD CHANGE HANDLING
     */
    handleIntervalChange = (event) => {
        let intervalVal = event.target.value;
        this.setState({ displayinterval: intervalVal });
        if(intervalVal >= 20 && !isNaN(intervalVal)) {
            this.stopGame();
            this.setState({ interval: intervalVal });
        }
    }

    handleStdDevChange = (event) => {
        let stdDevVal = event.target.value;
        this.setState({ displayStdDev: stdDevVal });
        if(stdDevVal >= 0 && !isNaN(stdDevVal)) {
            this.stopGame();
            this.setState({ stdDev: stdDevVal });
        }
    }

    handleSizeChange = (event) => {
        let sizeVal = event.target.value;
        this.setState({ displaysize: sizeVal });
        if(sizeVal >= 4 && sizeVal < 100 && !isNaN(sizeVal)) {
            this.stopGame();
            this.setState({ size: sizeVal, board: this.makeEmptyBoard(sizeVal) });
        }
    }

    handleMutateChange = (event) => {
        let mutateVal = event.target.value;
        this.setState({ displaymutateChance: mutateVal });
        if(mutateVal >= 0 && mutateVal <= 100 && !isNaN(mutateVal)) {
            this.stopGame();
            this.setState({ mutateChance: mutateVal/100 });
        }
    }

    handleNeighbourMutateChange = (event) => {
        let neighbourMutateVal = event.target.value;
        this.setState({ displayNeighbourChance: neighbourMutateVal });
        if(neighbourMutateVal >= 0 && neighbourMutateVal <= 100 && !isNaN(neighbourMutateVal)) {
            this.stopGame();
            this.setState({ neighbourMutateChance: neighbourMutateVal/100 });
        }
    }

    handleDeathChange = (event) => {
        let deathVal = event.target.value;
        this.setState({ displayDeathChance: deathVal });
        if(deathVal >= 0 && deathVal <= 100 && !isNaN(deathVal)) {
            this.stopGame();
            this.setState({ deathChance: deathVal/100 });
        }
    }

    handleRGBMutChange = (event) => {
        let rgbChange = event.target.value;
        this.setState({ displayRGBMutate: rgbChange });
        if(rgbChange >= 0 && rgbChange <= 1 && !isNaN(rgbChange)) {
            this.stopGame();
            this.setState({ rgbMutate: rgbChange });
        }
    }

    handleHSLMutChange = (event) => {
        let hslChange = event.target.value;
        this.setState({ displayHSLmutate: hslChange });
        if(hslChange >= 0 && hslChange <= 1 && !isNaN(hslChange)) {
            this.stopGame();
            this.setState({ hslMutate: hslChange });
        }
    }

    /**
     * SWITCH CHANGE HANDLING
     */
    handleDeathAgeChange = (event, value) => {
        this.setState({ meanDeathAge: value });
    }

    handleHSLSpaceSwitch = () => {
        const { hslSpace } = this.state;
        hslSpace ? this.setState({ hslSpace: false }) : this.setState({ hslSpace: true });
        this.handleClear();
    }

    handlePolarRandomSwitch = () => {
        const { polarRandom } = this.state;
        polarRandom ? this.setState({ polarRandom: false }) : this.setState({ polarRandom: true });
    }

    /** 
     * RENDERING GAME
     */
    render() {
        const { classes } = this.props;
        const {
            isRunning,
            board,
            displayinterval,
            displayStdDev,
            displaysize,
            displaymutateChance,
            displayNeighbourChance,
            // displayDeathChance,
            displayRGBMutate,
            displayHSLmutate,
            hslSpace,
            polarRandom,
            meanDeathAge,
        } = this.state;

        return (
            <div className="GameDiv">
                <div className="sudoku-board">
                    {board.map((row, i) => (
                        <div className="sudoku-row" key={`row,${i}`} >
                            {
                            row.map((cell, j) => (
                                <div key={`${cell.x},${cell.y}`}>
                                {board[i][j].alive ? (i===0
                                    ? (j===0
                                        ? <div 
                                        className={"sudoku-cell sudoku-cell-u sudoku-cell-l c"+j+"x"+i+"y"}
                                        style={{backgroundColor: board[i][j].colorDisplay}}
                                        onClick={() => this.toggleCell(i, j)}/>
                                        : <div 
                                        className={"sudoku-cell sudoku-cell-u c"+j+"x"+i+"y"}
                                        style={{backgroundColor: board[i][j].colorDisplay}}
                                        onClick={() => this.toggleCell(i, j)}/>
                                    )
                                    : (j===0
                                        ? <div 
                                        className={"sudoku-cell sudoku-cell-l c"+j+"x"+i+"y"}
                                        style={{backgroundColor: board[i][j].colorDisplay}}
                                        onClick={() => this.toggleCell(i, j)}/>
                                        : <div 
                                        className={"sudoku-cell c"+j+"x"+i+"y"}
                                        style={{backgroundColor: board[i][j].colorDisplay}}
                                        onClick={() => this.toggleCell(i, j)}/>
                                    )
                                )
                                : (i===0
                                    ? (j===0
                                        ? <div 
                                        className={"sudoku-cell sudoku-cell-u sudoku-cell-l c"+j+"x"+i+"y"}
                                        style={{backgroundColor: "#000000"}}
                                        onClick={() => this.toggleCell(i,j)}/>
                                        : <div 
                                        className={"sudoku-cell sudoku-cell-u c"+j+"x"+i+"y"}
                                        style={{backgroundColor: "#000000"}}
                                        onClick={() => this.toggleCell(i,j)}/>
                                    )
                                    : (j===0
                                        ? <div 
                                        className={"sudoku-cell sudoku-cell-l c"+j+"x"+i+"y"}
                                        style={{backgroundColor: "#000000"}}
                                        onClick={() => this.toggleCell(i,j)}/>
                                        : <div 
                                        className={"sudoku-cell c"+j+"x"+i+"y"}
                                        style={{backgroundColor: "#000000"}}
                                        onClick={() => this.toggleCell(i,j)}/>
                                    )
                                )
                                    
                                }
                                </div>
                            ))
                            }
                        </div>
                    ))}
                </div>

                <div className="ControlsContainer" >
                    <Grid className="Controls1" container spacing={1} justify="center">
                        <Grid item>
                            <FormControl className={clsx(classes.margin, classes.textField, classes.button)} variant="outlined">
                                {isRunning ?
                                    <Button size="large" color="secondary" variant="contained" className="button" onClick={this.stopGame}><StopIcon/>Stop</Button> :
                                    <Button size="large" color="primary" variant="contained" className="button" onClick={this.runGame}><PlayArrowIcon/>Run</Button>
                                }
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={clsx(classes.margin, classes.textField, classes.button)} variant="outlined">
                                <Button size="large" variant="contained" className="button" onClick={this.handleRandom}>Random</Button>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={clsx(classes.margin, classes.textField, classes.button)} variant="outlined">
                                <Button size="large" variant="contained" className="button" onClick={this.handleClear}>Clear</Button>
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={clsx(classes.margin, classes.textField, classes.button)} variant="outlined">
                                <Button size="large" variant="contained" className="button" onClick={this.handleDefaults}>Defaults</Button>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Grid className="Controls2" container spacing={1} justify="center">
                            <Grid item>
                                <TextField
                                    label="Interval speed [20,∞]"
                                    id="outlined-adornment-interval"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleIntervalChange}
                                    value={displayinterval}
                                    InputProps={{
                                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                                    className: classes.input
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                                <TextField 
                                    label="Colour Deviation [0,∞]"
                                    id="outlined-adornment-stdDevColor"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleStdDevChange}
                                    value={displayStdDev}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Board size [4,100]"
                                    id="outlined-adornment-size"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleSizeChange}
                                    value={displaysize}
                                    InputProps={{
                                    endAdornment: <InputAdornment position="end">cells</InputAdornment>,
                                    className: classes.input
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                            <TextField
                                    label="RGB Col. Bias [0,1]"
                                    id="outlined-adornment-size"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleRGBMutChange}
                                    value={displayRGBMutate}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Grid className="Controls2" container spacing={1} justify="center">
                        <Grid item >
                                <TextField 
                                    label="Mutate % [0,100]"
                                    id="outlined-adornment-mutationChance"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleMutateChange}
                                    value={displaymutateChance}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                                <TextField 
                                    label="Neighbour + % [0,100]"
                                    id="outlined-adornment-neighbourMutationChance"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleNieghbourMutatChange}
                                    value={displayNeighbourChance}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="HSL Sat+ Bias [0,1]"
                                    id="outlined-adornment-size"
                                    className={clsx(classes.margin, classes.textField)}
                                    onChange={this.handleHSLMutChange}
                                    value={displayHSLmutate}
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <Grid className="Controls3" container spacing={1} justify="center">
                            <Grid>
                                <Typography id="discrete-slider" gutterBottom className={clsx(classes.radiobuttons)}>
                                    Mean Death Age
                                </Typography>
                                <Slider
                                    className={clsx(classes.slider)}
                                    defaultValue={meanDeathAge}
                                    valueLabelFormat={valueLabelFormat}
                                    getAriaValueText={valuetext}
                                    onChangeCommitted={this.handleDeathAgeChange}
                                    aria-labelledby="discrete-slider-custom"
                                    step={50}
                                    valueLabelDisplay="auto"
                                    marks={marks}
                                    min={50}
                                    max={550}
                                />
                            </Grid>
                            <FormControlLabel
                                control={<Switch checked={hslSpace} onChange={this.handleHSLSpaceSwitch}
                                name="HSLSpaceSwitch" />}
                                label="HSL Space"
                                className={clsx(classes.margin, classes.textField, classes.radiobuttons)}
                            />
                            <FormControlLabel
                                control={<Switch checked={polarRandom} onChange={this.handlePolarRandomSwitch}
                                name="polarRandomSwitch" />}
                                label="Polar Random"
                                className={clsx(classes.margin, classes.textField, classes.radiobuttons)}
                            />
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Game);
