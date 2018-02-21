import React, { Component } from 'react'
import  { Map, fromJS } from 'immutable'
import { makePuzzle, pluck, isPeer, range } from '../sudoku'
import NextHead from 'next/head'
import css from 'styled-jsx/css'

const cellWidth = 2.5;

const LightBlue100 = "#B3E5FC"
const LightBlue400 = "#29B6F6"
const LightBlue200 = "#81D4FA"
const LightBlue300 = "#4FC3F7"
const LightBlue600 = "#039BE5"
const Indigo700 = "#303F9F"
const DeepOrange200 = "#FFAB91"
const DeepOrange600 = "#F4511E"
const ControlNumberColor = Indigo700

{/*language=CSS*/}
const CellStyle = css`
.cell {
    height: ${cellWidth}em;
    width: ${cellWidth}em;
    display: flex;
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
`

class Cell extends Component {
    state = {}
    render() {
        const { value, onClick, isPeer, isSelected, sameValue, filled, notes, conflict } = this.props
        let backgroundColor
        let fontColor
        if (conflict && isPeer && sameValue) {
            backgroundColor = DeepOrange200
        } else if (sameValue) {
            backgroundColor = LightBlue300
        } else if (isSelected) {
            backgroundColor = LightBlue200
        } else if(isPeer) {
            backgroundColor = LightBlue100
        }
        if (conflict && !filled) {
            fontColor = DeepOrange600
        } else if (!filled && value) {
            fontColor = ControlNumberColor
        }
        return (
            <div className="cell" onClick={onClick}>
                {
                    notes ?
                        Array.from(Array(9).keys()).map((i) =>
                            (<div key={i} className="note-number">{notes.has(i+1) && (i + 1)}</div>)
                        ) :
                        value > 0 && value
                }
                {/*language=CSS*/}
                <style jsx>{CellStyle}</style>
                <style jsx>{`
                    .cell {
                        flex-wrap: wrap;
                        background-color: ${backgroundColor ? backgroundColor : "initial"};
                        color: ${fontColor ? fontColor : "initial"};
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
                `}</style>
            </div>
        )
    }
}

function getClickHandler(onClick, onDoubleClick, delay = 250) {
    let timeoutID = null;
    return function (event) {
        if (!timeoutID) {
            timeoutID = setTimeout(function () {
                onClick(event);
                timeoutID = null
            }, delay);
        } else {
            timeoutID = clearTimeout(timeoutID);
            onDoubleClick(event);
        }
    };
}

function makeCountObject() {
    const countObj = {}
    for (let i = 1; i < 10; ++i) countObj[i] = 1
    return countObj
}

export default class Index extends Component {
    state = {}
    static async getInitialProps({ req }) {
        const { puzzle } = pluck(makePuzzle(), 40)
        return { puzzle }
    }

    constructor(props) {
        super(props)
        const rows = Array.from(Array(9).keys()).map(i => makeCountObject())
        const columns = Array.from(Array(9).keys()).map(i => makeCountObject())
        const squares = Array.from(Array(9).keys()).map(i => makeCountObject())
        const puzzle = props.puzzle.map((row, i) => (
            row.map((cell, j) => {
                if (cell) {
                    rows[i][cell] = rows[i][cell] - 1
                    columns[j][cell] = columns[j][cell] - 1
                    squares[(Math.floor(i/3))*3 + Math.floor(j/3)][cell] =
                        squares[(Math.floor(i/3))*3 + Math.floor(j/3)][cell] - 1
                }
                return {
                    value: props.puzzle[i][j],
                    filled: !!props.puzzle[i][j]
                }
            })
        ))
        const board = fromJS({ puzzle, selected: false, choices : { rows, columns, squares }})
        this.state = { puzzle, selected: false, choices : { rows, columns, squares }, board}
    }

    onSingleTap = (number) => {
        this.getSelectedCell()
        const { puzzle, selected } = this.state
        const selectedCell = selected && puzzle[selected.x][selected.y]
        const filled = selectedCell && selectedCell.filled
        if (filled) return
        const notes = selectedCell.notes || new Set()
        if (notes.has(number)) {
            notes.delete(number)
        } else {
            notes.add(number)
        }
        selectedCell.notes = notes
        delete selectedCell.value
        puzzle[selected.x][selected.y] = selectedCell
        this.setState({ puzzle })
    }

    onDoubleTap = (number) => {
        const { puzzle, selected, choices } = this.state
        const { x, y } = selected
        const selectedCell = selected && puzzle[selected.x][selected.y]
        const filled = selectedCell && selectedCell.filled
        if (filled) return
        const { rows, columns, squares } = choices
        const row = rows[x]
        const column = columns[y]
        const square = squares[(Math.floor(x/3))*3 + Math.floor(y/3)]
        // TODO record last action to undo
        // TODO **SCREAMING** immutable
        if (selectedCell.value === number) {
            delete selectedCell.value
            rows[x][number] = rows[x][number] + 1
            columns[y][number] = columns[y][number] + 1
            squares[(Math.floor(x/3))*3 + Math.floor(y/3)][number] =
                squares[(Math.floor(x/3))*3 + Math.floor(y/3)][number] + 1
        } else {
            if (selectedCell.value) {
                const prevValue = selectedCell.value
                rows[x][prevValue] = rows[x][prevValue] + 1
                columns[y][prevValue] = columns[y][prevValue] + 1
                squares[(Math.floor(x/3))*3 + Math.floor(y/3)][prevValue] =
                    squares[(Math.floor(x/3))*3 + Math.floor(y/3)][prevValue] + 1
            }
            selectedCell.value = number
            rows[x][number] = rows[x][number] - 1
            columns[y][number] = columns[y][number] - 1
            squares[(Math.floor(x/3))*3 + Math.floor(y/3)][number] =
                squares[(Math.floor(x/3))*3 + Math.floor(y/3)][number] - 1
        }
        delete selectedCell.notes
        puzzle[selected.x][selected.y] = selectedCell
        this.setState({ puzzle, choices: { rows, columns, squares } })
    }

    selectCell = (x, y) => {
        let { board } = this.state
        board = board.set('selected', { x, y })
        this.setState({ selected: { x, y }, board})
    }


    renderActions() {
        const selected = this.getSelected()
        const notFilled = selected && !selected.filled
        return (
            <div className="actions">
                <div>Undo</div>
                <div>Erase</div>
                <div>Hint</div>
                { /*language=CSS*/ }
                <style>{`
                    .actions {

                    }
                `}</style>
            </div>
        )
    }

    renderCircle(percent) {
        return (
            <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                      d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                      strokeDasharray={`${percent*100}, 100`}
                      d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                { /*language=CSS*/ }
                <style jsx>{`
                    .circular-chart {
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
                `}</style>
            </svg>
        )
    }
    renderControl(numbers = Array.from(Array(9).keys())) {
        const { choices: { rows }} = this.state
        const { filled } = this.getSelected()
        return (
            <div className={`control${filled ? " disabled" : ""}`}>
                {numbers.map(i => {
                    const number = i+1
                    const clickHandle = getClickHandler(
                        () => {this.onSingleTap(number)},
                        () => {this.onDoubleTap(number)}
                    )
                    const count = rows.reduce((accumulator, row) => {
                        return accumulator + (row[number] <= 0 ? 1 : 0)
                    }, 0)
                    return (
                        <div key={number} className="number"
                             onClick={!filled ? clickHandle: undefined}>
                            <div>{number}</div>
                            {this.renderCircle(count/9)}
                        </div>
                    )
                })}
                { /*language=CSS*/ }
                <style jsx>{`
                    .control {
                        margin-top: 1em;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: space-between;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
                        font-family: 'Special Elite', cursive;
                        transition: filter .5s ease-in-out;
                    }
                    .disabled {
                        filter: opacity(20%)
                    }
                    .number {
                        display: flex;
                        position: relative;
                        justify-content: center;
                        align-items: center;
                        font-size: 2em;
                        margin: 0.02em .05em;
                        width: 1.7em;
                        height: 1.7em;
                        color: ${ControlNumberColor};
                    }
                    .number > div {
                        margin-top: .3em;
                    }
                `}
                </style>
            </div>
        )
    }

    getSelectedCell() {
        const { board } = this.state
        const selected = board.get('selected')
        return selected && board.get('puzzle').getIn([selected.x,selected.y])
    }

    getSelected() {
        const { puzzle, selected } = this.state
        return selected && puzzle[selected.x][selected.y]
    }

    isConflict(i, j) {
        const { puzzle, choices: { rows, columns, squares } } = this.state
        const { value } = puzzle[i][j]
        if (!value) return false
        const row = rows[i][value] >= 0
        const column = columns[j][value] >= 0
        const square = squares[(Math.floor(i/3))*3 + Math.floor(j/3)][value] >= 0
        return !(row && column && square)
    }

    renderPuzzle() {
        const { puzzle } = this.state
        const selected = this.getSelected()
        return (
            <div className="puzzle">
                {puzzle.map((row, i) => (
                    <div key={i} className="row">
                        {
                            row.map((cell, j) => {
                                const { value, filled, notes } = cell
                                const { x, y } = { x: i, y: j }
                                let conflict = this.isConflict(i, j)
                                const peer = isPeer({ x, y}, this.state.selected)
                                const sameValue = selected && selected.value && value === selected.value
                                const isSelected = JSON.stringify(this.state.selected) === JSON.stringify({x, y})
                                return <Cell filled={filled} notes={notes} sameValue={sameValue} isSelected={isSelected} isPeer={peer} value={value}
                                             onClick={() => { this.selectCell(x, y)}} key={j} x={x} y={y} conflict={conflict}/>
                            })
                        }
                    </div>
                ))}
                { /*language=CSS*/ }
                <style jsx>{`
                    .puzzle {
                        margin-top: 1em;
                        width: ${cellWidth*9}em;
                        cursor: pointer;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
                        font-family: 'Special Elite', cursive;
                    }
                    .row {
                        display: flex;
                        align-items: center;
                        flex: 0;
                        width: ${cellWidth*9}em;
                    }
                    .row:not(:last-child) {
                        border-bottom: 1px solid black;
                    }
                    .row:nth-child(3n+3):not(:last-child) {
                        border-bottom: 2px solid black !important;
                    }
                `}
                </style>
            </div>
        )
    }
    render() {
        return (
            <div className="body">
                <NextHead>
                    <title>Sudoku</title>
                    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                    <link href="https://fonts.googleapis.com/css?family=Special+Elite" rel="stylesheet"/>
                </NextHead>
                {this.renderPuzzle()}
                <div className="controls">
                    {this.renderControl([0,1,2,3,4,5])}
                    {this.renderControl([6,7,8])}
                </div>
                { /*language=CSS*/ }
                <style jsx>{`
                    .body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .controls {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    :global(body) {
                        margin: 0;
                        height: 100vh;
                        display: flex;
                        justify-content: center;
                    }
                `}</style>
            </div>
        )
    }
}