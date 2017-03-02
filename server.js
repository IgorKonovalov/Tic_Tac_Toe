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

function transpose(array) {
    return array[0].map((_, index) => array.map(row => row[index]));
}

// функция diagonals принимает оригинальный массив и возвращает диагонали

function diagonals(array) {
    const reversed = array.slice().reverse();

    return [
        array.map((element, index) => array[index][index]),
        array.map((element, index) => reversed[index][index])
    ];
}

// Проверки:

// anyEmptyCells: проверка на наличие пустых клеток, принимает массив и возвращает true если хотя бы одна из клеток пуста

function anyEmptyCells(array) {
    return array.some(row => row.some(cell => !cell));
}

// cellsContainChar: проверка что данный row полностью состоит из данного character, возвращает true/false 

function cellsContainChar(character, row) {
    return row.every(cell => cell === character);
}




io.on('connection', socket => {
  socket.on('message', body => {
    socket.broadcast.emit('message', {
      body,
      from: socket.id.slice(8)
    })
  })
})

app.use(express.static(__dirname + '/public'));
app.use(webpackDevMiddleware(webpack(webpackConfig), { stats: { colors: true }}));

server.listen(3000);
