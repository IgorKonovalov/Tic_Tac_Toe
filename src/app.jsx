import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled, { keyframes } from 'styled-components';
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
          <p>Waiting for opponent...</p>
        </div>
    }
    let showNameInput;
    if (!this.state.nameSubmitted) {
      showNameInput =
        <Form onSubmit={this.handleSubmitName}>
          <Label>Name:</Label>
          <Input type="text" placeholder='Enter your name' value={this.state.playerName} onChange={this.handleChangeName} />
          <Button type="submit">Submit</Button>
        </Form>
    }
    let showCreateRoom;
    if (!this.state.start && this.state.nameSubmitted) {
      showCreateRoom =
        <div>
          <Form onSubmit={this.handleSubmitGame}>
            <Button onClick={this.createRoom}>Create Game Room</Button>
            <Label>{showRoom}</Label>
            <Input type='text' placeholder='Insert code here...' value={this.state.joinCode} onChange={this.handleChangeJoin} />
            <Button type="submit" onClick={this.joinRoom}>Join Game</Button>
          </Form>
        </div>
    }
    let showGameAndChat;
    if (this.state.start) {
      showGameAndChat =
        <AppContainer>
          <TicTacToeContainer>
            <Board socket={this.socket} playerValue={this.state.playerValue} playerNum={this.state.playerNum} gameCode={this.state.gameCode} name={this.state.playerName}/>
          </TicTacToeContainer>
          <ChatContainer>
            <Chat socket={this.socket} playerValue={this.state.playerValue} gameCode={this.state.gameCode} name={this.state.playerName}/>
          </ChatContainer>
        </AppContainer>
    }

    return (
    <div>
      {showNameInput}
      {showCreateRoom}
      {showRoom}
      {showGameAndChat}
    </div>
    );
  }
}

// Styled-Components

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Form = styled.form`
  display: flex;
  flex-flow: row wrap;
  border: 0.1em solid #1a237e;
  padding: 2em;
  max-width: 40em;
  margin: 10em auto;
  border-radius: 3px;
  box-shadow: 2px 2px 4px -2px #1a237e;
  animation: ${fadeIn} 1s linear;
`;

const Input = styled.input`
  flex-grow: 2;
  padding: 1em;
  font-size: 1.5em;
  margin-right: 0.5rem;
  margin-bottom: 0.2em;
  border: none;
  background-color: #e8eaf6;
  color: #1a237e;
`;

const Label = styled.label`
  flex-basis: 100%;
  display: block;
  font-size: 2em;
  margin-bottom: 1em;
  margin-top: 1em;
  text-align: center;
  color: #1a237e;
`;

const Button = styled.button`
  padding: 0.5em 1.2em;
  margin-bottom: 0.2em;
  font-size: 1.5em;
  flex-grow: 1;
  border-radius: 2px;
  border: none;
  outline: none;
  cursor: pointer;
  background-color: #e8eaf6;
  box-shadow: 1px 1px 1px -1px #7986cb;
  color: #1a237e;
  &:hover {
    background-color: #3f51b5;
    color: #e8eaf6;
    box-shadow: 2px 2px 2px #1a237e;
  }
  &:active {
    background-color: #283593;
    color: #e8eaf6;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const TicTacToeContainer = styled.div`
  width: 450px;
  flex-grow: 1;
  align-items: center;
`;

const ChatContainer = styled.div`
  flex-grow: 2;
  min-width: 150px;
`;


ReactDOM.render(<TicTacToeApp />, document.getElementById('root'));
