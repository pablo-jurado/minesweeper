import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

let AppState = {
  board: null,
  rowIndx: 10,
  colIndx: 10,
  minesNum: 20,
  isGameOver: false
}

AppState.board = createEmptyBoard()

function createEmptyBoard () {
  let board = []
  for (let i = 0; i < AppState.rowIndx; i++) {
    let col = []
    for (let j = 0; j < AppState.colIndx; j++) {
      col.push({ isClicked: false, mine: false, flag: false })
    }
    board.push(col)
  }
  return board
}

function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function reset () {
  AppState.board = createEmptyBoard()
  for (let i = 0; i < AppState.minesNum; i++) {
    AppState.board[getRandom(0, AppState.rowIndx)][getRandom(0, AppState.colIndx)].mine = true
  }
  AppState.isGameOver = false
  render()
}

reset()

function App (state) {
  let resetButton = <div onClick={reset} className='emoji'>&#9786;</div>
  if (AppState.isGameOver) {
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

function checkAround (xStr, yStr) {
  let x = parseInt(xStr)
  let y = parseInt(yStr)
  const x0 = x - 1
  const x2 = x + 1
  const y0 = y - 1
  const y2 = y + 1
  let values = []

  if (x0 >= 0 && y0 >= 0) values.push(AppState.board[x0][y0].mine)
  if (x0 >= 0) values.push(AppState.board[x0][y].mine)
  if (x0 >= 0 && y2 < AppState.rowIndx) values.push(AppState.board[x0][y2].mine)

  if (y0 >= 0) values.push(AppState.board[x][y0].mine)
  // let val5 = values.push(AppState.board[x][y].mine)
  if (y2 < AppState.rowIndx) values.push(AppState.board[x][y2].mine)

  if (x2 < AppState.colIndx && y0 >= 0) values.push(AppState.board[x2][y0].mine)
  if (x2 < AppState.colIndx) values.push(AppState.board[x2][y].mine)
  if (x2 < AppState.colIndx && y2 < AppState.rowIndx) values.push(AppState.board[x2][y2].mine)

  const mines = values.filter((item) => {
    return (item)
  })
  const minesNum = mines.length
  return minesNum
}

function handleClick (e) {
  if (!AppState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    AppState.board[x][y].isClicked = true
  }
  render()
}

function rightClick (e) {
  e.preventDefault()
  if (!AppState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col
    AppState.board[x][y].flag = !AppState.board[x][y].flag
  }
  render()
}

function Squares (squares, rowIndex) {
  let squaresCollection = squares.map((square, i) => {
    let classVal = 'square'
    let minesNumber = null
    if (square.flag) classVal = 'square flag'
    if (square.isClicked) {
      if (square.mine) {
        classVal = 'square mine'
        AppState.isGameOver = true
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

function render () {
  ReactDOM.render(
    App(AppState),
    document.getElementById('root')
  )
}
render()
