import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

let appState = {
  board: null,
  rowIndx: 10,
  colIndx: 10,
  minesNum: 20,
  isGameOver: false
}

appState.board = createEmptyBoard()

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
  appState.board = createEmptyBoard()
  for (let i = 0; i < appState.minesNum; i++) {
    appState.board[getRandom(0, appState.rowIndx)][getRandom(0, appState.colIndx)].mine = true
  }
  appState.isGameOver = false
}

reset()

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

function handleClick (e) {
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    appState.board[x][y].isClicked = true
  }
}

function rightClick (e) {
  e.preventDefault()
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    appState.board[x][y].flag = !appState.board[x][y].flag
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
      if (square.mine) {
        classVal = 'square mine'
        appState.isGameOver = true
        showAllMines()
      }
      if (!square.mine) {
        classVal = 'square off'
        minesNumber = checkAround(rowIndex, i)
      }
    }
    return (
      <div
        onContextMenu={rightClick}
        onClick={handleClick}
        data-row={rowIndex}
        data-col={i} key={i}
        className={classVal}>{minesNumber}
      </div>
    )
  })
  return squaresCollection
}

function Row (board) {
  let rowCollection = board.map((item, i) => {
    return <div key={i} className='row'>{Squares(item, i)}</div>
  })
  return rowCollection
}

function App (state) {
  let resetButton = <div onClick={reset} className='emoji'>&#9786;</div>
  if (appState.isGameOver) {
    resetButton = <div onClick={reset} className='emoji'>&#9785;</div>
  }
  return (
    <div className='app'>
      <div className='score'>
        <div className='score1'>000</div>
        {resetButton}
        <div className='score2'>000</div>
      </div>
      <div className='board'>
        {Row(state.board)}
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// Render Loop
// ---------------------------------------------------------

const rootEl = document.getElementById('root')

function renderNow () {
  ReactDOM.render(App(appState), rootEl)
  window.requestAnimationFrame(renderNow)
}

window.requestAnimationFrame(renderNow)
