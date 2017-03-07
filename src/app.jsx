import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import Board from './board.jsx';
import Chat from './chat.jsx';

let playerValue;
let playerNum;
let gameCode;

class TicTacToeApp extends Component {

  constructor(props){
    super(props);
    this.state = {
      createCode : '',
      joinCode: '',
      player: 0,
      start: false,
      playerValue: '',
      playerNum: '',
      gameCode: '',
      playerName: '',
      nameSubmitted: false
    }

    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleChangeJoin = this.handleChangeJoin.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleSubmitName = this.handleSubmitName.bind(this);
    this.handleSubmitGame = this.handleSubmitGame.bind(this);

  }

  componentWillMount(){
    this.socket = io('/');
  }


  componentDidMount(){
    this.socket.on('game start', (data) => {
      console.log('игра стартовала');
      this.setState({ gameCode: this.state.createCode });
      this.setState({ start: true });
    });
    this.socket.on('game end', () => {
      this.socket.emit('reset board', this.state);
    })
  }

  handleChangeJoin(event) {
    this.setState({ joinCode: event.target.value });
  }

  handleChangeName(event) {
    this.setState({ playerName: event.target.value });
  }

  handleSubmitName(event) {
    this.setState({ nameSubmitted: true })
    event.preventDefault();
  }

  handleSubmitGame(event) {
    event.preventDefault();
  }



  createRoom(){
    let codeOne = parseInt(Math.random() * (9 - 1) + 1);
    let codeTwo = parseInt(Math.random() * (9 - 1) + 1);
    let codeThree = parseInt(Math.random() * (9 - 1) + 1);
    let codeFour = parseInt(Math.random() * (9 - 1) + 1);
    let roomCode = "" + codeOne + codeTwo + codeThree + codeFour;
    this.setState({
      playerValue: 'X',
      playerNum: 1,
      createCode: roomCode,
      player: 1
    });
    this.socket.emit('create room', roomCode);
  }

  joinRoom(){
    this.socket.emit('join room', this.state.joinCode);

    this.setState({
      playerValue: 'O',
      playerNum: 2,
      player: 2,
      createCode: this.state.joinCode,
    });
  }


  render() {
    let showRoom;
    if(this.state.createCode !== '' && !this.state.start) {
      showRoom =
        <div>
          <h2>{this.state.createCode}</h2>
          <h2>Waiting for opponent...</h2>
        </div>
    }
    let showNameInput;
    if (!this.state.nameSubmitted) {
      showNameInput =
        <form onSubmit={this.handleSubmitName}>
          <label>
            Name:
            <input type="text" value={this.state.playerName} onChange={this.handleChangeName} />
          </label>
          <button type="submit">Submit</button>
        </form>
    }
    let showCreateRoom;
    if (!this.state.start && this.state.nameSubmitted) {
      showCreateRoom =
        <div>
          <div>
            <button onClick={this.createRoom}>Create Game Room</button>
          </div>
          <form onSubmit={this.handleSubmitGame}>
            <label>
              Insert code here:
              <input type='text' value={this.state.joinCode} onChange={this.handleChangeJoin} />
            </label>
            <button type="submit" onClick={this.joinRoom}>Join Game</button>
          </form>
        </div>
    }

    return (
    <div>
      {showNameInput}
      {showCreateRoom}
      {showRoom}
      {this.state.start ?
      <AppContainer>
        <TicTacToeContainer>
          <Board socket={this.socket} playerValue={this.state.playerValue} playerNum={this.state.playerNum} gameCode={this.state.gameCode} />
        </TicTacToeContainer>
        <ChatContainer>
          <Chat socket={this.socket} gameCode={this.state.gameCode} name={this.state.playerName}/>
        </ChatContainer>
      </AppContainer> : null}
    </div>
    );
  }
}

// Стили

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const TicTacToeContainer = styled.div`
  width: 45%;
  min-width: 450px;
  flex: 1;
  align-items: center;
`;

const ChatContainer = styled.div`
  width: 45%;
  min-width: 450px;
`;


ReactDOM.render(<TicTacToeApp />, document.getElementById('root'));
