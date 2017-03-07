const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: false }));

// Logic and data manipulation

// board prototype

const blankBoard = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

// players object

const players = {
  one: {
    id: 1,
    char: 'X',
    message: 'First player won!'
  },
  two: {
    id: 2,
    char: 'O',
    message: 'Second player won!'
  }
};



// data structure for storing:
//
// gameBoardStore = {
//   roomCode: {
//     gameBoard: gameBoard,
//     player1: socket1,
//     player2: socket2,
//     playerTurn: 1/2
//   }
// }

let gameBoardStore = {};

// logic for checking board for win/draft is simple - instead of many tests on one array, we transpose board array, including diagonals to match only rows

// function transpose gets original array and returns transposed columns => rows

function transpose(array) {
    return array[0].map((_, index) => array.map(row => row[index]));
}

// function diagonals gets original array and returns diagonals => rows

function diagonals(board) {
  const reversed = board.slice().reverse();
  return [
    board.map((element, index) => board[index][index]),
    board.map((element, index) => reversed[index][index])
  ];
}

// Tests:

// anyEmptyCells: Gets array and returns true if any of cells is empty

function anyEmptyCells(board) {
  return board.some(row => row.some(cell => !cell));
}

// cellsContainChar: tests row for given character, if row consists of this character only, returns true

function cellsContainChar(character, row) {
  return row.every(cell => cell === character);
}

// rowContainsChar concatinates original, transposed and diagonals array into one and checks for given character

function rowContainsChar(character, board) {
  return [].concat(board, transpose(board), diagonals(board))
           .some(row => {
    return cellsContainChar(character, row);
  });
}

// final check returns winning/draw message and gamestate: false for triggering end of game

function checkWin(board) {
  if (rowContainsChar(players.one.char, board)) {
    return { message: players.one.message, gamestate: false };
  }
  if (rowContainsChar(players.two.char, board)) {
    return { message: players.two.message, gamestate: false };
  }
  return { message: 'Draw!', gameState: anyEmptyCells(board) };
}



io.on('connection', socket => {
  console.log('connected!');
  socket.on('create room', roomCode => {
    if (roomCode) {
      let playerOne = socket.id;
      console.log('creating room');
      delete gameBoardStore[roomCode];
      gameBoardStore[roomCode] = {};
      gameBoardStore[roomCode].gameBoard = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
      gameBoardStore[roomCode].player1 = playerOne;
      socket.join(roomCode);
      console.log(roomCode);
      console.log('all rooms', gameBoardStore);
      console.log('board of new room', gameBoardStore[roomCode]);
      console.log('sending room');
      io.in(roomCode).emit('room created', true);
    }
  });

  // connecting player to room (using roomCode given bu host player)

  socket.on('join room', roomCode => {
      // Check if room is in the data list.
      if (gameBoardStore.hasOwnProperty(roomCode)) {
        // Check for socket.id of players is not same
        if (socket.id !== gameBoardStore[roomCode]['player1']) {
          console.log('second player joined');
          // Присоединяем второго игрока.
          let playerTwo = socket.id;
          gameBoardStore[roomCode]['player2'] = playerTwo;
          console.log('now with second player: ', gameBoardStore[roomCode]);
          socket.join(roomCode);
          io.in(roomCode).emit('game start', 'haha');
        }
      } else {
        console.log('There is no such room in room list');
      }
  });

  // updating boards in case of click, also checking winning condition, and if yes, sending message and finish game

  socket.on('click', data => {
    if (data.gameCode in gameBoardStore) {
      let playerTurn = data.value == players.one.char ? 2 : 1;

      gameBoardStore[data.gameCode].gameBoard[data.row][data.col] = data.value;

      let dataObject = {
        gameBoard: gameBoardStore[data.gameCode].gameBoard,
        playerTurn: playerTurn
      };

      console.log('Sending for update: ', dataObject);
      io.in(data.gameCode).emit('update board', dataObject);

      let winResult = checkWin(gameBoardStore[data.gameCode].gameBoard);

      if (!winResult.gameState) {
        gameBoardStore[data.gameCode].gameBoard[data.row][data.col] = blankBoard;
        io.to(data.gameCode).emit('game end', winResult.message);
      }
    } else {
      console.log('room is absent, try reloading page');
    }
  });


  // removing room if client have lost connection

  socket.on('disconnect', () => {
    console.log('disconnected!');
    Object.keys(gameBoardStore).forEach((gameCode) => {
      if (gameBoardStore[gameCode].player1 === socket.id || gameBoardStore[gameCode].player2 === socket.id) {
        let dataObject = {
          gameBoard: blankBoard,
          playerTurn: 0
        };
        io.in(gameCode).emit('game end', 'Second player is disconnected');
        io.in(gameCode).emit('update board', dataObject);
        delete gameBoardStore[gameCode];
        console.log('room ', gameCode, ' deleted');
        console.log(gameBoardStore);
        return;
      }
    });
  });

  socket.on('reset board', data => {
    gameBoardStore[data.gameCode] = blankBoard;
  })

  // Chat functionality

  socket.on('message', data => {
    if (data.from == 'Me') {
      data.from = socket.id;
    }
    socket.broadcast.to(data.gameCode).emit('message', {
      playerValue: data.playerValue,
      body: data.body,
      from: data.from
    })
  })
})

app.use(express.static(__dirname + '/public'));
app.use(webpackDevMiddleware(webpack(webpackConfig), { stats: { colors: true }}));

server.listen(3000);
