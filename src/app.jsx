import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import Board from './board.jsx';

// let socket;
let playerValue;
let playerNum;
let gameCode;

class Chat extends React.Component {
  constructor (props) {
    super(props);
    this.state = { messages: [] };
  }

  componentDidMount () {
    this.socket = io('/');
    this.socket.on('message', message => {
      this.setState({ messages: [message, ...this.state.messages]});
    })
  }

  handleSubmit = event => {
    const body = event.target.value;
    if (event.keyCode === 13 && body) {
      const message = {
        body,
        from: 'Me'
      };
      this.setState({ messages: [message, ...this.state.messages]});
      this.socket.emit('message', body);
      event.target.value = '';
    }
  }

  render () {
    const messages = this.state.messages.map((message, index) => {
      return <li key={index}><b>{message.from}:</b>{message.body}</li>
    })
    return (
      <div>
        <h1>Hello, World!</h1>
        <input type='text' placeholder='type a message...' onKeyUp={this.handleSubmit} />
        {messages}
      </div>
    )
  }
}


class TicTacToeApp extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      createCode : '',
      joinCode: '',
      player: 0,
      clicked: false
    }
    // this.socket = io('/');

    this._createRoom = this._createRoom.bind(this);
    this._joinRoom = this._joinRoom.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  componentWillMount(){
    this.socket = io('/');
  }


  componentDidMount(){
    this.socket.on('game start', (data) => {
      gameCode = this.state.createCode
    });
  }

  _handleClick() {
    this.setState({
      clicked: true
    });
  }

  _createRoom(){
    let codeOne = parseInt(Math.random() * (9 - 1) + 1);
    let codeTwo = parseInt(Math.random() * (9 - 1) + 1);
    let codeThree = parseInt(Math.random() * (9 - 1) + 1);
    let codeFour = parseInt(Math.random() * (9 - 1) + 1);
    let roomCode = "" + codeOne + codeTwo + codeThree + codeFour;
    playerValue = 'X';
    playerNum = 1;
    this.setState({
      createCode: roomCode,
      player: 1
    });
    this.socket.emit("create room", roomCode);
  }

  _joinRoom(){
    socket.emit("join room", this.state.joinCode);
    playerValue = 'O';
    playerNum = 2;
    this.setState({
      player: 2,
      createCode: this.state.joinCode,
    });
  }


  render() {
    let showRoom;
    if(this.state.createCode !== ''){
      showRoom =
        <div>
          <TextBig>{this.state.createCode}</TextBig>
          <TextBig>Ожидаем противника...</TextBig>
        </div>
    }
    return (
    <div>
      <Container>
        <InnerContainer onClick={this._createRoom}>
          <div>
            <JoinGame>Create Game Room</JoinGame>
          </div>
        </InnerContainer>
        {showRoom}
        <BottomInnerContainer>
          <TextSmall>Join Game</TextSmall>
          <Input
          onChange={(joinCode) => this.setState({joinCode})}
          ref={(input) => this._input = input}
          />
        </BottomInnerContainer>
        <JoinGameContainer >
          <div >
            <JoinGame onClick={this._joinRoom, this._handleClick}>Join Game</JoinGame>
            {this.state.clicked ? <Board socket={this.socket} playerValue={playerValue} playerNum={playerNum} gameCode={gameCode} /> : null}
          </div>
        </JoinGameContainer>
      </Container>
    </div>
    );
  }
}

// Стили

const TextBig = styled.p`
  color: black;
  font-size: 30px;
  text-align: center;
`;

const TextSmall = styled.p`
  color: black;
  font-size: 12px;
`;

const Container = styled.div`
  flex: 1;
  align-items: center;
  background-color: #FFFFFF;
  padding: 10px;
  padding-top: 150px;
`;

const InnerContainer = styled.div`
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
  border-width:  1px;
  height: 70px;
`;

const BottomInnerContainer = styled.div`
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 70px;
`;

const Input = styled.input`
  height: 40px;
  border-width: 1px;
  width: 150px;
  padding: 10px;
  margin-bottom: 20px;
`;
const JoinGame = styled.button`
  padding-left: 10px;
  padding-right: 10px;
  border-width: 1px;
`;
const JoinGameContainer = styled.div`
  justify-content: 'center';
  padding-left: 10px;
  padding-right: 10px;
  border-width: 1px;
  height: 50px;
`;


ReactDOM.render(<TicTacToeApp />, document.getElementById('root'));
