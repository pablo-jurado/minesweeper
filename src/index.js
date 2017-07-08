import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

// -----------------------------------------------------------------------------
// APP STATE
// -----------------------------------------------------------------------------

let appState = {
  board: null,
  rowIndx: 10,
  colIndx: 10,
  minesNum: 10,
  flagNum: 10,
  isGameOver: false,
  startGame: false,
  seconds: 0
}

appState.board = createEmptyBoard()

// -----------------------------------------------------------------------------
// GLOBAL VARIABLES
// -----------------------------------------------------------------------------

let xRan = 0
let yRan = 0
let timer = null

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

function createEmptyBoard () {
  let board = []
  for (let i = 0; i < appState.rowIndx; i++) {
    let col = []
    for (let j = 0; j < appState.colIndx; j++) {
      col.push({ isClicked: false, mine: false, flag: false, showMine: false })
    }
    board.push(col)
  }
  return board
}

function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function reset () {
  clearTimeout(timer)
  appState.board = createEmptyBoard()
  appState.isGameOver = false
  appState.startGame = false
  appState.seconds = 0
}

function randomXY () {
  xRan = getRandom(0, appState.rowIndx)
  yRan = getRandom(0, appState.colIndx)
}

function startGame (x, y) {
  appState.startGame = true
  timer = setInterval(function () { appState.seconds++ }, 1000)
  for (var i = 0; i < appState.minesNum; i++) {
    randomXY()
    if ((parseInt(x, 10) === xRan && parseInt(y, 10) === yRan) || (appState.board[xRan][yRan].mine === true)) {
      i--
    } else {
      appState.board[xRan][yRan].mine = true
    }
  }
}

function checkAround (xStr, yStr) {
  let x = parseInt(xStr, 10)
  let y = parseInt(yStr, 10)
  const x0 = x - 1
  const x2 = x + 1
  const y0 = y - 1
  const y2 = y + 1
  let values = []

  if (x0 >= 0 && y0 >= 0) values.push(appState.board[x0][y0].mine)
  if (x0 >= 0) values.push(appState.board[x0][y].mine)
  if (x0 >= 0 && y2 < appState.rowIndx) values.push(appState.board[x0][y2].mine)

  if (y0 >= 0) values.push(appState.board[x][y0].mine)
  if (y2 < appState.rowIndx) values.push(appState.board[x][y2].mine)

  if (x2 < appState.colIndx && y0 >= 0) values.push(appState.board[x2][y0].mine)
  if (x2 < appState.colIndx) values.push(appState.board[x2][y].mine)
  if (x2 < appState.colIndx && y2 < appState.rowIndx) values.push(appState.board[x2][y2].mine)

  const mines = values.filter((item) => {
    return (item)
  })
  const minesNum = mines.length
  if (minesNum) return minesNum
  showEmptySquares(xStr, yStr, x0, x2, y0, y2)
}

function showEmptySquares (x, y, x0, x2, y0, y2) {
  if (x0 >= 0 && y0 >= 0) appState.board[x0][y0].isClicked = true
  if (x0 >= 0) appState.board[x0][y].isClicked = true
  if (x0 >= 0 && y2 < appState.rowIndx) appState.board[x0][y2].isClicked = true

  if (y0 >= 0) appState.board[x][y0].isClicked = true
  if (y2 < appState.rowIndx) appState.board[x][y2].isClicked = true

  if (x2 < appState.colIndx && y0 >= 0) appState.board[x2][y0].isClicked = true
  if (x2 < appState.colIndx) appState.board[x2][y].isClicked = true
  if (x2 < appState.colIndx && y2 < appState.rowIndx) appState.board[x2][y2].isClicked = true
}

function leftClick (e) {
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    appState.board[x][y].isClicked = true
    if (!appState.startGame) startGame(x, y)
  }
}

function rightClick (e) {
  e.preventDefault()
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    appState.board[x][y].flag = !appState.board[x][y].flag
    appState.flagNum--
  }
}

function showAllMines () {
  let flattened = appState.board.reduce(
    (acc, cur) => acc.concat(cur),
    []
  )

  flattened.forEach(function (square) {
    if (square.mine) square.showMine = true
  })
}

function Squares (squares, rowIndex) {
  let squaresCollection = squares.map((square, i) => {
    let classVal = 'square'
    let minesNumber = null
    if (square.flag) classVal = 'square flag'
    if (square.showMine) classVal = 'square mine-off'
    if (square.isClicked) {
      // TODO: check for winner
      if (square.mine) {
        classVal = 'square mine'
        appState.isGameOver = true
        clearTimeout(timer)
        showAllMines()
        // TODO: show flag that were wrong
      }
      if (!square.mine) {
        classVal = 'square off'
        minesNumber = checkAround(rowIndex, i)
      }
    }
    return (
      <div
        onContextMenu={rightClick}
        onClick={leftClick}
        data-row={rowIndex}
        data-col={i} key={i}
        className={classVal}>{minesNumber}
      </div>
    )
  })
  return squaresCollection
}

function addZero (number) {
  let numLength = number.toString().length
  if (numLength === 1) number = '00' + number
  if (numLength === 2) number = '0' + number
  return number
}

function createNewBoard () {

}

function Score (state) {
  let mines = addZero(state.flagNum)
  let time = addZero(state.seconds)
  let resetButton = <span>&#9786;</span>
  if (state.isGameOver) resetButton = <span>&#9785;</span>

  return (
    <div className='score'>
      <div className='mines-number'>{mines}</div>
      <div onClick={reset} className='emoji'>{resetButton}</div>
      <div className='timer'>{time}</div>
    </div>
  )
}

function Row (board) {
  let rowCollection = board.map((item, i) => {
    return <div key={i} className='row'>{Squares(item, i)}</div>
  })
  return rowCollection
}

function EditBoard () {
  return (
    <form onSubmit={createNewBoard}>
      <input type='number' placeholder='Rows' />
      <input type='number' placeholder='Columns' />
      <input type='number' placeholder='Mines' />
      <input type='submit' value='Create' />
    </form>
  )
}

function App (state) {
  return (
    <div>
      {EditBoard()}
      <div className='app'>
        {Score(state)}
        <div className='board'>
          {Row(state.board)}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Render Loop
// -----------------------------------------------------------------------------

const rootEl = document.getElementById('root')

function renderNow () {
  ReactDOM.render(App(appState), rootEl)
  window.requestAnimationFrame(renderNow)
}

window.requestAnimationFrame(renderNow)
