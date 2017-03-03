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

// Логика и данные на сервере

// прототип доски

const blankBoard = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

// объект игроков

const players = {
  one: { id: 1, char: 'X', message: 'Первый игрок выиграл!' },
  two: { id: 2, char: 'O', message: 'Второй игрок выиграл!' }
};

// структура данных, описывающая игры:
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

// логика проверки на выигрыш / ничью проста - вместо того, чтобы писать отдельные тесты для рядов/столбцов/диагоналей мы преобразовываем массив доски так, чтоб можно было использовать только один тип проверки.

// функция transpose принимает оригинальный массив и возвращает транспонированый - столбцы становятся строками, а строки — столбцами

function transpose(board) {
  return board[0].map((_, index) => board.map(row => row[index]));
}

// функция diagonals принимает оригинальный массив и возвращает массив диагоналей

function diagonals(board) {
  const reversed = board.slice().reverse();
  return [
    board.map((element, index) => board[index][index]),
    board.map((element, index) => reversed[index][index])
  ];
}

// Проверки:

// anyEmptyCells: проверка на наличие пустых клеток, принимает массив и возвращает true если хотя бы одна из клеток пуста

function anyEmptyCells(board) {
  return board.some(row => row.some(cell => !cell));
}

// cellsContainChar: проверка что данный row полностью состоит из данного character, возвращает true/false

function cellsContainChar(character, row) {
  return row.every(cell => cell === character);
}

// функция высшего порядка rowContainsChar собирает полученные массивы (оригинальный, транспонированый и диагонали) в один и проверяет, присутствует ли в строке данный символ, возвращает true/false

function rowContainsChar(character, board) {
  return [].concat(board, transpose(board), diagonals(board))
           .some(row => {
    return cellsContainChar(character, row);
  });
}

// финальная проверка

function checkWin(board) {
  if (rowContainsChar(players.one.char, board)) {
    return { message: players.one.message, gamestate: false };
  }
  if (rowContainsChar(players.two.char, board)) {
    return { message: players.two.message, gamestate: false };
  }
  return { message: 'Ничья!', gameState: anyEmptyCells(gameboard) };
}

// возврат доски в начальное состояние

function resetBoard(gameRoom) {
  return gameBoardStore[gameRoom].board = blankBoard;
}




io.on('connection', socket => {
  console.log('connected!');
  socket.on('create room', roomCode => {
    if (roomCode) {
      let playerOne = socket.id;
      console.log('создаем комнату');
      gameBoardStore[roomCode] = {};
      gameBoardStore[roomCode]['gameBoard'] = blankBoard;
      gameBoardStore[roomCode]['player1'] = playerOne;
      socket.join(roomCode);
      console.log(roomCode);
      console.log('отправляем комнату');
      io.to(socket.id).emit('room created', true);
    }
  });

  // присоединяем игрока к комнате

  socket.on('join room', roomCode => {
      // Проверяем что комната уже присутствует в списке.
      if (roomCode in gameBoardStore) {
        // Проверяем что socket.id клиентов не совпадают.
        if (socket.id !== gameBoardStore[roomCode]['player1']) {
          // Присоединяем второго игрока.
          let playerTwo = socket.id;
          gameBoardStore[roomCode]['player2'] = playerTwo;
          socket.join(roomCode);
          io.in(roomCode).emit('game start', 'haha');
        }
      }
  });

  // инициализируем и передаем доску 'update board'

  socket.on('click', data => {
    let playerTurn = data.value === players.one.char ? 1 : 2;

    gameBoardStore[data.gameCode].gameBoard[data.row][data.col] = data.value;

    let dataObject = {
      gameBoard: gameBoardStore[data.gameCode].gameBoard,
      playerTurn: playerTurn
    };

    console.log('обновляю объект... ', dataObject);
    io.to(data.gameCode).emit('board update', dataObject);
    // Тестируем на выигрыш.
    let winResult = checkWin(gameBoardStore[data.gameCode].gameBoard);
    console.log(winResult.gameState);

    if (!winResult.gameState) {
      gameBoardStore[data.gameCode].gameBoard = blankBoard;
      console.log(winResult.message);
      io.to(data.gameCode).emit('game end', winResult.message);
    }
  });

  // обновляем состояние доски

  socket.on('update board', data => {
    gameBoardStore[data.gameRoom].board = data.gameBoard;
    checkWin(gameBoardStore[data.gameRoom].board);

    io.in(data.gameRoom).emit('get board updates', {
      game: gameBoardStore[data.gameRoom].board,
      result: checkWin(gameBoardStore[data.gameRoom].board)
    });
  });

  // обнуляем доску

  socket.on('reset board', data => {
    resetBoard(data);
    io.in(data).emit('reset update');
  });

  // удаляем комнату если клиент теряет связь с сервером

  socket.on('disconnect', () => {
    console.log('disconnected!');

    Object.keys(gameBoardStore).forEach((gameCode) => {
      console.log(gameCode);

      if (gameBoardStore[gameCode].player1 === socket.id || gameBoardStore[gameCode].player2 === socket.id) {
        delete gameBoardStore[gameCode];
        console.log('комната ', gameCode, ' удалена');
        return;
      }
    });
  });

  // функционал чата

  socket.on('message', body => {
    console.log('message sent from', socket.id);
    socket.broadcast.emit('message', {
      body,
      from: socket.id.slice(8)
    })
  })
})

app.use(express.static(__dirname + '/public'));
app.use(webpackDevMiddleware(webpack(webpackConfig), { stats: { colors: true }}));

server.listen(3000);
