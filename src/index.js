import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { createStore } from 'redux'

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

function createMines (x, y) {
  for (var i = 0; i < appState.minesNum; i++) {
    const xRan = getRandom(0, appState.rowIndx)
    const yRan = getRandom(0, appState.colIndx)
    if ((parseInt(x, 10) === xRan && parseInt(y, 10) === yRan) ||
        (appState.board[xRan][yRan].mine === true)) {
          console.log('count in', i)
      i--
    } else {
      addMine(xRan, yRan)
    }
  }
}

// this returns the number of mines around the square
function getMineNumber (xStr, yStr) {
  let xNum = parseInt(xStr, 10)
  let yNum = parseInt(yStr, 10)

  let values = []

  for (var x = xNum - 1; x < xNum + 2; x++) {
    for (var y = yNum - 1; y < yNum + 2; y++) {
      if (x >= 0 && x < appState.colIndx && y >= 0 && y < appState.rowIndx) {
        values.push(appState.board[x][y].mine)
      }
    }
  }

  const mines = values.filter((item) => {
    return (item)
  })

  const minesNum = mines.length

  if (minesNum) return minesNum
  return undefined
}

function showEmptySquares (xStr, yStr) {
  let xNum = parseInt(xStr, 10)
  let yNum = parseInt(yStr, 10)

  for (var x = xNum - 1; x < xNum + 2; x++) {
    for (var y = yNum - 1; y < yNum + 2; y++) {
      if (x >= 0 && x < appState.colIndx && y >= 0 && y < appState.rowIndx) {
        if (!appState.board[x][y].mine) handleLeftClick(x, y)
      }
    }
  }
}

function leftClick (e) {
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col

    // frist click inits game
    if (!appState.startGame) firstClick(x, y)

    if (!appState.board[x][y].isClicked) {
      handleLeftClick(x, y)
      showEmptySquares(x, y)
    }
  }
}

function rightClick (e) {
  e.preventDefault()
  if (!appState.isGameOver) {
    let x = e.target.dataset.row
    let y = e.target.dataset.col

    handleRightClick(x, y)
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
        // todo: redux
        appState.isGameOver = true
        clearTimeout(timer)
        showAllMines()
        // TODO: show flag that were wrong
      }
      if (!square.mine) {
        classVal = 'square off'
        minesNumber = getMineNumber(rowIndex, i)
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

function createNewBoard () {
  // TODO:
}

function App (state) {
  return (
    <div>
      { /* EditBoard() */ }
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
  seconds: 0,
  timer: null
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

// -----------------------------------------------------------------------------
// ACTIONS
// -----------------------------------------------------------------------------
function firstClick (x, y) {
  store.dispatch({type: 'START_GAME', payload: true })
  startTimer()
  createMines(x, y)
}

var timer = null
function startTimer () {
  timer = setInterval(updateTimer, 1000)
  // store.dispatch({type: 'START_TIMER', payload: timer })
}

function updateTimer () {
  store.dispatch({type: 'UPDATE_TIMER', payload: 1 })
}

function handleLeftClick (x, y) {
  store.dispatch({type: 'LEFT_CLICK', payload: {'x': x, 'y': y} })
}

function handleRightClick (x, y) {
  console.log('RIGHT_CLICK', x, y)
  store.dispatch({type: 'RIGHT_CLICK', payload: {'x': x, 'y': y} })
}

function addMine (x, y) {
  store.dispatch({type: 'ADD_MINE', payload: {'x': x, 'y': y} })
}

function reset () {
  let newBoard = createEmptyBoard()
  clearInterval(timer)
  const newState = {
    board: newBoard,
    isGameOver: false,
    startGame: false,
    seconds: 0,
    flagNum: 10
  }
  store.dispatch({type: 'RESET', payload: newState })
}

// -------------------------------------------------
// REDUX
// -------------------------------------------------

// create the store and set initial state
let store = createStore(reducer, appState)

// TODO: state need to be immmutable
function reducer (state, action) {
  if (action.type === 'START_GAME') {
    const x = action.payload.x
    const y = action.payload.y

    state.startGame = action.payload
  }

  if (action.type === 'UPDATE_TIMER') {
    state.seconds += action.payload
  }

  if (action.type === 'LEFT_CLICK') {
    const x = action.payload.x
    const y = action.payload.y
    state.board[x][y].isClicked = true
  }

  if (action.type === 'RIGHT_CLICK') {
    const x = action.payload.x
    const y = action.payload.y

    if (state.board[x][y].flag) {
      state.board[x][y].flag = false
      state.flagNum++
    } else {
      state.board[x][y].flag = true
      state.flagNum--
    }
  }

  if (action.type === 'ADD_MINE') {
    const x = action.payload.x
    const y = action.payload.y
    state.board[x][y].mine = true
  }

  if (action.type === 'RESET') {
    state.board = action.payload.board
    state.isGameOver = action.payload.isGameOver
    state.startGame = action.payload.startGame
    state.seconds = action.payload.seconds
    state.flagNum = action.payload.flagNum
  }

  return state
}

// connects the redux store to the react render function
store.subscribe(render)

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------

function render () {
  ReactDOM.render(
    App(store.getState()),
    document.getElementById('root')
  )
}

// init app
render()
