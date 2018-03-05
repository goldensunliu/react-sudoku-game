function randomChoice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

export function range(n) {
  return Array.from(Array(n).keys());
}

// TODO use immutable when this is all working
export function makePuzzle() {
  while (true) {
    try {
      const puzzle = Array.from(Array(9).keys()).map(() => Array.from(Array(9).keys()));
      const rows = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      const columns = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      const squares = Array.from(Array(9).keys()).map(() => new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      Array.from(Array(9).keys()).forEach((i) => {
        Array.from(Array(9).keys()).forEach((j) => {
          const row = rows[i];
          const column = columns[j];
          const square = squares[((Math.floor(i / 3)) * 3) + Math.floor(j / 3)];
          const choices = [...row].filter(x => column.has(x)).filter(x => square.has(x));
          const choice = randomChoice(choices);
          if (!choice) {
            // eslint-disable-next-line no-throw-literal
            throw 'dead end';
          }
          puzzle[i][j] = choice;
          column.delete(choice);
          row.delete(choice);
          square.delete(choice);
        });
      });
      return puzzle;
    } catch (e) {
      // eslint-disable-next-line no-continue
      continue;
    }
  }
}

/**
 * Answers the question: can the cell (i,j) in the puzzle contain the number
 in cell "c"
 * @param puzzle
 * @param i
 * @param j
 * @param c
 */
function canBeA(puzzle, i, j, c) {
  const x = Math.floor(c / 9);
  const y = c % 9;
  const value = puzzle[x][y];
  if (puzzle[i][j] === value) return true;
  if (puzzle[i][j] > 0) return false;
  // if not the cell itself, and the mth cell of the group contains the value v, then "no"
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const m in Array.from(Array(9).keys())) {
    const rowPeer = { x: m, y: j };
    const columnPeer = { x: i, y: m };
    const SquarePeer = {
      x: (Math.floor(i / 3) * 3) + Math.floor(m / 3),
      y: (Math.floor(j / 3) * 3) + (m % 3),
    };
    if (!(rowPeer.x === x && rowPeer.y === y) && puzzle[rowPeer.x, rowPeer.y] === value) return false;
    if (!(columnPeer.x === x && columnPeer.y === y) && puzzle[columnPeer.x, columnPeer.y] === value) return false;
    if (!(SquarePeer.x === x && SquarePeer.y === y) && puzzle[SquarePeer.x, SquarePeer.y] === value) return false;
  }
  return true;
}

/**
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
export function isPeer(a, b) {
  if (!a || !b) return false;
  const squareA = ((Math.floor(a.x / 3)) * 3) + Math.floor(a.y / 3);
  const squareB = ((Math.floor(b.x / 3)) * 3) + Math.floor(b.y / 3);
  return a.x === b.x || a.y === b.y || squareA === squareB;
}

export function pluck(allCells, n = 0) {
  const puzzle = JSON.parse(JSON.stringify(allCells));
  /**
     * starts with a set of all 81 cells, and tries to remove one (randomly) at a time,
     * but not before checking that the cell can still be deduced from the remaining cells.
     * @type {Set}
     */
  const cells = new Set(Array.from(Array(81).keys()));
  const cellsLeft = new Set(cells);
  while (cellsLeft.size && cells.size > n) {
    const cell = randomChoice([...cells]);
    const x = Math.floor(cell / 9);
    const y = cell % 9;
    cellsLeft.delete(cell);
    /**
         * row, column and square record whether another cell in those groups could also take
         * on the value we are trying to pluck. (If another cell can, then we can't use the
         * group to deduce this value.) If all three groups are True, then we cannot pluck
         * this cell and must try another one.
         */
    let row = false;
    let column = false;
    let square = false;
    range(9).forEach((i) => {
      const rowPeer = { x: i, y };
      const columnPeer = { x, y: i };
      const squarePeer = {
        x: (Math.floor(Math.floor(cell / 9) / 3) * 3) + Math.floor(i / 3),
        y: ((Math.floor(cell / 9) % 3) * 3) + (i % 3),
      };
      if (rowPeer.x !== x) {
        row = canBeA(puzzle, rowPeer.x, rowPeer.y, cell);
      }
      if (columnPeer.y !== y) {
        column = canBeA(puzzle, columnPeer.x, columnPeer.y, cell);
      }
      if (squarePeer.x !== x && squarePeer.y !== y) {
        square = canBeA(puzzle, squarePeer.x, squarePeer.y, cell);
      }
    });
    if (row && column && square) {
      // eslint-disable-next-line no-continue
      continue;
    } else {
      // this is a pluckable cell!
      // eslint-disable-next-line no-param-reassign
      puzzle[x][y] = 0; // 0 denotes a blank cell
      /**
             * remove from the set of visible cells (pluck it)
             * we don't need to reset "cellsleft" because if a cell was not pluckable
             * earlier, then it will still not be pluckable now (with less information
             * on the board).
             */
      cells.delete(cell);
    }
  }
  return { puzzle, size: cells.size };
}
