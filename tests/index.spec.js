let should = require('should');
let io = require('socket.io-client');

let socketURL = 'http://127.0.0.1:3000';

let options = {
    transports: ['websocket'],
    'force new connection': true
};

let roomCode = "1234";

describe("The tic tac toe test", function() {

    it('create room from client should receive something', function(done) {
        let client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            should(data).be.exactly(true)
            client1.disconnect();
            done();
        })
    });

    it('player 2 join should start the game', function(done) {

        let client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client2.on("game start", function(data) {
                should(data).be.exactly('haha')
                client1.disconnect();
                client2.disconnect();
                done();
            })
        })
    });

    it('player 1 can make a move once game is started, player 2 should receive the update', function(done) {

        let client1 = io.connect(socketURL, options);

        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' }) // не отсылается второму клиенту обновление доски
                client2.on("update board", function(data) {
                    should(data.gameBoard).be.eql([
                        ['X', '', ''],
                        ['', '', ''],
                        ['', '', '']
                    ]);
                    should(data.gameBoard).be.a.Array;
                    should(data.playerTurn).be.exactly(2)
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })


            })
        })
    });

    it('player 2 make a move, and player 1 should receive the update', function(done) {
        let count = 0;
        let client1 = io.connect(socketURL, options);
        let board = [];
        let playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client2.on("update board", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                count++;
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                count++;
                setTimeout(function() {
                    if (count == 2) {
                        should(board).be.eql([
                            ['X', 'O', ''],
                            ['', '', ''],
                            ['', '', '']
                        ]);
                        should(board).be.a.Array;
                        should(playerTurn).be.exactly(1)
                        client1.disconnect();
                        client2.disconnect();
                        done();
                    }
                }, 10)
            })
        })
    });

    it('player 1 should win', function(done) {
        let count = 0;
        let client1 = io.connect(socketURL, options);
        let board = [];
        let playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {
                client2.on("update board", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client2.on("game end", function(data) {
                    should(data).be.eql("Первый игрок выиграл!");
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })

                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 1, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 1, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 2, col: 0, value: 'X' });

            })
        })
    });

    it('player 2 should win', function(done) {
        let count = 0;
        let client1 = io.connect(socketURL, options);
        let board = [];
        let playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {

                client1.emit("click", { gameCode: roomCode, row: 2, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 1, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 1, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 2, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 2, col: 1, value: 'O' });

                client2.on("update board", function(data) {
                    board = data.gameBoard;
                    playerTurn = data.playerTurn;
                })

                client2.on("game end", function(data) {
                    should(data).be.eql("Второй игрок выиграл!");
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })


            })
        })
    });

    it('should be a tie game', function(done) {
        let count = 0;
        let client1 = io.connect(socketURL, options);
        let board = [];
        let playerTurn = 1;
        client1.emit("create room", roomCode)
        client1.on("room created", function(data) {
            let client2 = io.connect(socketURL, options);
            client2.emit("join room", roomCode)
            client1.on("game start", function(data) {

                client2.on("game end", function(data) {
                    should(data).be.eql("Ничья!");
                    client1.disconnect();
                    client2.disconnect();
                    done();
                })


                client1.emit("click", { gameCode: roomCode, row: 0, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 0, col: 2, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 0, col: 1, value: 'X' });

                client2.emit("click", { gameCode: roomCode, row: 1, col: 0, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 1, col: 2, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 1, col: 1, value: 'O' });

                client1.emit("click", { gameCode: roomCode, row: 2, col: 0, value: 'X' });
                client2.emit("click", { gameCode: roomCode, row: 2, col: 1, value: 'O' });
                client1.emit("click", { gameCode: roomCode, row: 2, col: 2, value: 'X' });

            })
        })
    });
});
