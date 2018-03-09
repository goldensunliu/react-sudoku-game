/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Component } from 'react';
import { Set, List, fromJS } from 'immutable';
import PropTypes from 'prop-types';
import NextHead from 'next/head';
import Color from 'color';
import InputRange from 'react-input-range';

// eslint-disable-next-line import/no-extraneous-dependencies
import css from 'styled-jsx/css';

import RangeStyle from '../input-range-style';
import LoupeIcon from '../svg/loupe.svg';
import RemoveIcon from '../svg/remove.svg';
import ReloadIcon from '../svg/reload.svg';
import ReturnIcon from '../svg/return.svg';

import { makePuzzle, pluck, isPeer as areCoordinatePeers, range } from '../sudoku';
import { backGroundBlue } from '../colors';
import Tip from '../components/tool-tip';


const Description = 'Discover the next evolution of Sudoku with amazing graphics, animations, and user-friendly features. Enjoy a Sudoku experience like you never have before with customizable game generation, cell highlighting, intuitive controls and more!';
const cellWidth = 2.5;

const LightBlue100 = '#B3E5FC';
const LightBlue200 = '#81D4FA';
const LightBlue300 = '#4FC3F7';
const Indigo700 = '#303F9F';
const DeepOrange200 = '#FFAB91';
const DeepOrange600 = '#F4511E';
const ControlNumberColor = Indigo700;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const CellStyle = css`
.cell {
    height: ${cellWidth}em;
    width: ${cellWidth}em;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color .3s ease-in-out;
}
.cell:nth-child(3n+3):not(:last-child) {
    border-right: 2px solid black;
}
.cell:not(:last-child) {
    border-right: 1px solid black;
}
.note-number {
    font-size: .6em;
    width: 33%;
    height: 33%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
}
`;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const ActionsStyle = css`
.actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    margin-top: .5em;
    padding: 0 .6em;
}
.action {
    display: flex;
    align-items: center;
    flex-direction: column;
}
.action :global(svg) {
    width: 2.5em;
    margin-bottom: .2em;
}
.redo :global(svg) {
    transform: scaleX(-1);
}
`;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const ControlStyle = css`
.control {
    padding: 0 2em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    font-family: 'Special Elite', cursive;
    transition: filter .5s ease-in-out;
    width: 100%;
}
`;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const NumberControlStyle = css`
.number {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    margin: .1em;
    width: 1.5em;
    height: 1.5em;
    color: ${ControlNumberColor};
    box-shadow: 0 1px 2px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.23);
    border-radius: 50%;
}
.number > div {
    margin-top: .3em;
}
`;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const PuzzleStyle = css`
.puzzle {
    margin-top: .5em;
    width: ${cellWidth * 9}em;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}
.row {
    display: flex;
    align-items: center;
    flex: 0;
    width: ${cellWidth * 9}em;
}
.row:not(:last-child) {
    border-bottom: 1px solid black;
}
.row:nth-child(3n+3):not(:last-child) {
    border-bottom: 2px solid black !important;
}
`;

// eslint-disable-next-line no-lone-blocks
{ /* language=CSS */ }
const CirculuarProgressStyle = css`
.circular-progress {
    display: block;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: filter .4s ease-in-out;
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
}

.circle {
    stroke: ${ControlNumberColor};
    transition: stroke-dasharray .4s ease-in-out;
    fill: none;
    stroke-width: 2.8;
    stroke-linecap: round;
}
`;

const CircularPathD = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

function getBackGroundColor({
  conflict, isPeer, sameValue, isSelected,
}) {
  if (conflict && isPeer && sameValue) {
    return DeepOrange200;
  } else if (sameValue) {
    return LightBlue300;
  } else if (isSelected) {
    return LightBlue200;
  } else if (isPeer) {
    return LightBlue100;
  }
  return false;
}

function getFontColor({ value, conflict, prefilled }) {
  if (conflict && !prefilled) {
    return DeepOrange600;
  } else if (!prefilled && value) {
    return ControlNumberColor;
  }
  return false;
}

class GenerationUI extends Component {
  constructor(props) {
    super(props);

    this.state = { value: 30 };
  }

  generateGame = () => {
    this.props.generateGame(this.state.value);
  }

  render() {
    return (
      <div className="generation">
        <div className="copy">Start with {this.state.value} cells prefilled</div>
        <InputRange
          maxValue={81}
          minValue={17}
          value={this.state.value}
          onChange={value => this.setState({ value })}
        />
        <div className="button" onClick={this.generateGame}>Play Sudoku</div>
        { /* language=CSS */ }
        <style jsx>{`
            .copy {
                text-align: center;
                font-size: 1.3em;
                margin-bottom: .5em;
            }
            .generation {
                display: flex;
                justify-content: center;
                flex-direction: column;
                width: 100%;
                align-items: center;
            }
            :global(.input-range) {
                width: 80%;
                max-width: 500px;
            }
            .button {
              margin-top: .5em;
              border-radius: .25em;
              cursor: pointer;
              font-weight: bold;
              text-decoration: none;
              color: #fff;
              position: relative;
              display: inline-block;
              transition: all .25s;
              padding: 5px 10px;
              font-size: 1.4em;
            }
            .button:active {
              transform: translate(0px, 5px);
              box-shadow: 0 1px 0 0;
            }

            .button {
              background-color: ${backGroundBlue};
              box-shadow: 0 2px 4px 0 ${Color(backGroundBlue).darken(0.5).hsl().string()};
              display: flex;
              align-items: center;
            }

            .button:hover {
              background-color: ${Color(backGroundBlue).lighten(0.2).hsl().string()};
            }
        `}
        </style>
      </div>
    );
  }
}

GenerationUI.propTypes = {
  generateGame: PropTypes.func.isRequired,
};

const NumberControl = ({ number, onClick, completionPercentage }) => (
  <div
    key={number}
    className="number"
    onClick={onClick}
  >
    <div>{number}</div>
    <CirclularProgress percent={completionPercentage} />
    <style jsx>{NumberControlStyle}</style>
  </div>
);

NumberControl.propTypes = {
  number: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  completionPercentage: PropTypes.number.isRequired,
};

NumberControl.defaultProps = {
  onClick: null,
};

const Cell = (props) => {
  const {
    value, onClick, isPeer, isSelected, sameValue, prefilled, notes, conflict,
  } = props;
  const backgroundColor = getBackGroundColor({
    conflict, isPeer, sameValue, isSelected,
  });
  const fontColor = getFontColor({ conflict, prefilled, value });
  return (
    <div className="cell" onClick={onClick}>
      {
        notes ?
          range(9).map(i =>
            (
              <div key={i} className="note-number">
                {notes.has(i + 1) && (i + 1)}
              </div>
            )) :
          value && value
      }
      {/* language=CSS */}
      <style jsx>{CellStyle}</style>
      <style jsx>{`
                .cell {
                    background-color: ${backgroundColor || 'initial'};
                    color: ${fontColor || 'initial'};
                }
            `}
      </style>
    </div>
  );
};

Cell.propTypes = {
  // current number value
  value: PropTypes.number,
  // cell click handler
  onClick: PropTypes.func.isRequired,
  // if the cell is a peer of the selected cell
  isPeer: PropTypes.bool.isRequired,
  // if the cell is selected by the user
  isSelected: PropTypes.bool.isRequired,
  // current cell has the same value if the user selected cell
  sameValue: PropTypes.bool.isRequired,
  // if this was prefilled as a part of the puzzle
  prefilled: PropTypes.bool.isRequired,
  // current notes taken on the cell
  notes: PropTypes.instanceOf(Set),
  // if the current cell does not satisfy the game constraint
  conflict: PropTypes.bool.isRequired,
};

Cell.defaultProps = {
  notes: null,
  value: null,
};

const CirclularProgress = ({ percent }) => (
  <svg viewBox="0 0 36 36" className="circular-progress">
    <path
      className="circle-bg"
      d={CircularPathD}
    />
    <path
      className="circle"
      strokeDasharray={`${percent * 100}, 100`}
      d={CircularPathD}
    />
    { /* language=CSS */ }
    <style jsx>{CirculuarProgressStyle}</style>
  </svg>
);

CirclularProgress.propTypes = {
  percent: PropTypes.number.isRequired,
};

function getClickHandler(onClick, onDoubleClick, delay = 250) {
  let timeoutID = null;
  return (event) => {
    if (!timeoutID) {
      timeoutID = setTimeout(() => {
        onClick(event);
        timeoutID = null;
      }, delay);
    } else {
      timeoutID = clearTimeout(timeoutID);
      onDoubleClick(event);
    }
  };
}

/**
 * make size 9 array of 0s
 * @returns {Array}
 */
function makeCountObject() {
  const countObj = [];
  for (let i = 0; i < 10; i += 1) countObj.push(0);
  return countObj;
}

/**
 * given a 2D array of numbers as the initial puzzle, generate the initial game state
 * @param puzzle
 * @returns {any}
 */
function makeBoard({ puzzle }) {
  // create initial count object to keep track of conflicts per number value
  const rows = Array.from(Array(9).keys()).map(() => makeCountObject());
  const columns = Array.from(Array(9).keys()).map(() => makeCountObject());
  const squares = Array.from(Array(9).keys()).map(() => makeCountObject());
  const result = puzzle.map((row, i) => (
    row.map((cell, j) => {
      if (cell) {
        rows[i][cell] += 1;
        columns[j][cell] += 1;
        squares[((Math.floor(i / 3)) * 3) + Math.floor(j / 3)][cell] += 1;
      }
      return {
        value: puzzle[i][j] > 0 ? puzzle[i][j] : null,
        prefilled: !!puzzle[i][j],
      };
    })
  ));
  return fromJS({ puzzle: result, selected: false, choices: { rows, columns, squares } });
}

/**
 * give the coordinate update the current board with a number choice
 * @param x
 * @param y
 * @param number
 * @param fill whether to set or unset
 * @param board the immutable board given to change
 */
function updateBoardWithNumber({
  x, y, number, fill = true, board,
}) {
  let cell = board.get('puzzle').getIn([x, y]);
  // delete its notes
  cell = cell.delete('notes');
  // set or unset its value depending on `fill`
  cell = fill ? cell.set('value', number) : cell.delete('value');
  const increment = fill ? 1 : -1;
  // update the current group choices
  const rowPath = ['choices', 'rows', x, number];
  const columnPath = ['choices', 'columns', y, number];
  const squarePath = ['choices', 'squares',
    ((Math.floor(x / 3)) * 3) + Math.floor(y / 3), number];
  return board.setIn(rowPath, board.getIn(rowPath) + increment)
    .setIn(columnPath, board.getIn(columnPath) + increment)
    .setIn(squarePath, board.getIn(squarePath) + increment)
    .setIn(['puzzle', x, y], cell);
}

function getNumberOfGroupsAssignedForNumber(number, groups) {
  return groups.reduce((accumulator, row) =>
    accumulator + (row.get(number) > 0 ? 1 : 0), 0);
}
// eslint-disable-next-line react/no-multi-comp
export default class Index extends Component {
  state = {};

  componentDidMount() {
    // eslint-disable-next-line no-undef
    if ('serviceWorker' in navigator) {
      // eslint-disable-next-line no-undef
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('ServiceWorker scope: ', reg.scope);
          console.log('service worker registration successful');
        })
        .catch((err) => {
          console.warn('service worker registration failed', err.message);
        });
    }
  }
  getSelectedCell() {
    const { board } = this.state;
    const selected = board.get('selected');
    return selected && board.get('puzzle').getIn([selected.x, selected.y]);
  }

  // get the min between its completion in rows, columns and squares.
  getNumberValueCount(number) {
    const rows = this.state.board.getIn(['choices', 'rows']);
    const columns = this.state.board.getIn(['choices', 'columns']);
    const squares = this.state.board.getIn(['choices', 'squares']);
    return Math.min(
      getNumberOfGroupsAssignedForNumber(number, squares),
      Math.min(
        getNumberOfGroupsAssignedForNumber(number, rows),
        getNumberOfGroupsAssignedForNumber(number, columns),
      ),
    );
  }

  generateGame = (finalCount = 20) => {
    // get a filled puzzle generated
    const solution = makePuzzle();
    // pluck values from cells to create the game
    const { puzzle } = pluck(solution, finalCount);
    // initialize the board with choice counts
    const board = makeBoard({ puzzle });
    this.setState({
      board, history: List.of(board), historyOffSet: 0, solution,
    });
  }

  addNumberAsNote = (number) => {
    let { board } = this.state;
    let selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    const prefilled = selectedCell.get('prefilled');
    if (prefilled) return;
    const { x, y } = board.get('selected');
    const currentValue = selectedCell.get('value');
    if (currentValue) {
      board = updateBoardWithNumber({
        x, y, number: currentValue, fill: false, board: this.state.board,
      });
    }
    let notes = selectedCell.get('notes') || Set();
    if (notes.has(number)) {
      notes = notes.delete(number);
    } else {
      notes = notes.add(number);
    }
    selectedCell = selectedCell.set('notes', notes);
    selectedCell = selectedCell.delete('value');
    board = board.setIn(['puzzle', x, y], selectedCell);
    this.updateBoard(board);
  };

  updateBoard = (newBoard) => {
    let { history } = this.state;
    const { historyOffSet } = this.state;
    // anything before current step is still in history
    history = history.slice(0, historyOffSet + 1);
    // add itself onto the history
    history = history.push(newBoard);
    // update the game
    this.setState({ board: newBoard, history, historyOffSet: history.size - 1 });
  };

  canUndo = () => this.state.historyOffSet > 0

  redo = () => {
    const { history } = this.state;
    let { historyOffSet } = this.state;
    if (history.size) {
      historyOffSet = Math.min(history.size - 1, historyOffSet + 1);
      const board = history.get(historyOffSet);
      this.setState({ board, historyOffSet });
    }
  };

  undo = () => {
    const { history } = this.state;
    let { historyOffSet, board } = this.state;
    if (history.size) {
      historyOffSet = Math.max(0, historyOffSet - 1);
      board = history.get(historyOffSet);
      this.setState({ board, historyOffSet, history });
    }
  };

  eraseSelected = () => {
    const selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    this.fillNumber(false);
  }

  fillSelectedWithSolution = () => {
    const { board, solution } = this.state;
    const selectedCell = this.getSelectedCell();
    if (!selectedCell) return;
    const { x, y } = board.get('selected');
    this.fillNumber(solution[x][y]);
  }


  // fill currently selected cell with number
  fillNumber = (number) => {
    let { board } = this.state;
    const selectedCell = this.getSelectedCell();
    // no-op if nothing is selected
    if (!selectedCell) return;
    const prefilled = selectedCell.get('prefilled');
    // no-op if it is refilled
    if (prefilled) return;
    const { x, y } = board.get('selected');
    const currentValue = selectedCell.get('value');
    // remove the current value and update the game state
    if (currentValue) {
      board = updateBoardWithNumber({
        x, y, number: currentValue, fill: false, board: this.state.board,
      });
    }
    // update to new number if any
    const setNumber = currentValue !== number && number;
    if (setNumber) {
      board = updateBoardWithNumber({
        x, y, number, fill: true, board,
      });
    }
    this.updateBoard(board);
  };

  selectCell = (x, y) => {
    let { board } = this.state;
    board = board.set('selected', { x, y });
    this.setState({ board });
  };

  isConflict(i, j) {
    const { value } = this.state.board.getIn(['puzzle', i, j]).toJSON();
    if (!value) return false;
    const rowConflict =
      this.state.board.getIn(['choices', 'rows', i, value]) > 1;
    const columnConflict =
      this.state.board.getIn(['choices', 'columns', j, value]) > 1;
    const squareConflict =
      this.state.board.getIn(['choices', 'squares',
        ((Math.floor(i / 3)) * 3) + Math.floor(j / 3), value]) > 1;
    return rowConflict || columnConflict || squareConflict;
  }

  renderCell(cell, x, y) {
    const { board } = this.state;
    const selected = this.getSelectedCell();
    const { value, prefilled, notes } = cell.toJSON();
    const conflict = this.isConflict(x, y);
    const peer = areCoordinatePeers({ x, y }, board.get('selected'));
    const sameValue = !!(selected && selected.get('value')
      && value === selected.get('value'));

    const isSelected = cell === selected;
    return (<Cell
      prefilled={prefilled}
      notes={notes}
      sameValue={sameValue}
      isSelected={isSelected}
      isPeer={peer}
      value={value}
      onClick={() => { this.selectCell(x, y); }}
      key={y}
      x={x}
      y={y}
      conflict={conflict}
    />);
  }

  renderNumberControl() {
    const selectedCell = this.getSelectedCell();
    const prefilled = selectedCell && selectedCell.get('prefilled');
    return (
      <div className="control">
        {range(9).map((i) => {
          const number = i + 1;
          // handles binding single click and double click callbacks
          const clickHandle = getClickHandler(
            () => { this.fillNumber(number); },
            () => { this.addNumberAsNote(number); },
          );
          return (
            <NumberControl
              key={number}
              number={number}
              onClick={!prefilled ? clickHandle : undefined}
              completionPercentage={this.getNumberValueCount(number) / 9}
            />);
        })}
        <style jsx>{ControlStyle}</style>
      </div>
    );
  }

  renderActions() {
    const { history } = this.state;
    const selectedCell = this.getSelectedCell();
    const prefilled = selectedCell && selectedCell.get('prefilled');
    return (
      <div className="actions">
        <div className="action" onClick={history.size ? this.undo : null}>
          <ReloadIcon />Undo
        </div>
        <div className="action redo" onClick={history.size ? this.redo : null}>
          <ReloadIcon />Redo
        </div>
        <div className="action" onClick={!prefilled ? this.eraseSelected : null}>
          <RemoveIcon />Erase
        </div>
        <div
          className="action"
          onClick={!prefilled ?
          this.fillSelectedWithSolution : null}
        >
          <LoupeIcon />Hint
        </div>
        <style jsx>{ActionsStyle}</style>
      </div>
    );
  }

  renderPuzzle() {
    const { board } = this.state;
    return (
      <div className="puzzle">
        {board.get('puzzle').map((row, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="row">
            {
              row.map((cell, j) => this.renderCell(cell, i, j)).toArray()
            }
          </div>
        )).toArray()}
        <style jsx>{PuzzleStyle}</style>
      </div>
    );
  }

  renderControls() {
    return (
      <div className="controls">
        {this.renderNumberControl()}
        {this.renderActions()}
        { /* language=CSS */ }
        <style jsx>{`
            .controls {
                margin-top: .3em;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
                padding: .5em 0;
            }
        `}
        </style>
      </div>
    );
  }

  renderGenerationUI() {
    return (
      <GenerationUI generateGame={this.generateGame} />
    );
  }

  renderHeader() {
    return (
      <div className="header">
        <div className="new-game" onClick={() => this.setState({ board: false })}>
          <ReturnIcon />
          <div>New Game</div>
        </div>
        <Tip />
        { /* language=CSS */ }
        <style jsx>{`
            .header {
                display: flex;
                width: 100%;
                justify-content: space-between;
                max-width: 500px;
                padding: 0 0.5em;
                box-sizing: border-box;
            }
            .new-game {
                cursor: pointer;
                margin-top: .2em;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                padding: .2em 0;
            }
            .new-game :global(svg) {
                height: 1em;
                margin-bottom: .3em;
            }
        `}
        </style>
      </div>
    );
  }

  render() {
    const { board } = this.state;
    return (
      <div className="body">
        <NextHead>
          <title>Sudoku Evolved</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content={Description} />
          <link href="https://fonts.googleapis.com/css?family=Special+Elite" rel="stylesheet" />
          <meta property="og:url" content="https://sudoku.sitianliu.com/" />
          <meta property="og:title" content="Sudoku Evolved" />
          <meta property="og:type" content="website" />
          <meta property="og:description" content={Description} />
          <meta property="og:image" content="https://sudoku.sitianliu.com/static/og-image.png" />
        </NextHead>
        {!board && this.renderGenerationUI()}
        {board && this.renderHeader()}
        {board && this.renderPuzzle()}
        {board && this.renderControls()}
        <div className="rooter">
          Made with <span>❤️</span>️ By <a href="https://www.sitianliu.com/">Sitian Liu</a> | <a href="https://medium.com/@sitianliu_57680/building-a-sudoku-game-in-react-ca663915712">Blog Post</a>
        </div>
        { /* language=CSS */ }
        <style jsx>{`
            :global(body), .body {
                font-family: 'Special Elite', cursive;
            }
            .body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                width: 100vw;
                position: relative;
            }
            @media (min-width: 800px) and (min-height: 930px){
                :global(.header, .puzzle, .controls) {
                    font-size: 1.5em;
                }
            }
            @media (max-width: 800px) and (min-width: 600px){
                :global(.header, .puzzle, .controls) {
                    font-size: 1.2em;
                }
            }
            @media (max-height: 930px) and (min-height: 800px) and (min-width: 600px){
                :global(.header, .puzzle, .controls) {
                    font-size: 1.2em;
                }
            }
            @media (max-height: 800px) and (min-height: 600px) and (min-width: 370px){
                :global(.header, .puzzle, .controls) {
                    font-size: 1em;
                }
            }
            @media (max-width: 370px){
                :global(.header, .puzzle, .controls) {
                    font-size: .8em;
                }
            }
            @media (max-height: 600px){
                :global(.header, .puzzle, .controls) {
                    font-size: .8em;
                }
            }
            :global(body) {
                margin: 0;
            }
            .rooter {
                position: fixed;
                bottom: 0;
                font-size: .8em;
                width: 100%;
                text-align: center;
            }
        `}
        </style>
        <style jsx global>{RangeStyle}</style>
      </div>
    );
  }
}
