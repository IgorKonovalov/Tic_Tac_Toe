import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import Board from './board.jsx';

let playerValue;
let playerNum;
let gameCode;

class Chat extends Component {
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
      gameCode: ''
    }

    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
  }

  handleClick() {
    this.setState({ start: true });
  }

  handleChange(event) {
    this.setState({ joinCode: event.target.value });
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
        <InnerContainer onClick={this.createRoom}>
          <div>
            <JoinGame>Create Game Room</JoinGame>
          </div>
        </InnerContainer>
        {showRoom}
        <BottomInnerContainer>
          <Input
          value={this.state.joinCode} onChange={this.handleChange}
          />
        </BottomInnerContainer>
        <JoinGameContainer >
          <div >
            <JoinGame onClick={this.joinRoom}>Join Game</JoinGame>
            {this.state.start ? <Board socket={this.socket} playerValue={this.state.playerValue} playerNum={this.state.playerNum} gameCode={this.state.gameCode} /> : null}
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
  font-size: 20px;
  text-align: left;
  padding-left: 10px;
`;

const TextSmall = styled.p`
  color: black;
  font-size: 16px;
`;

const Container = styled.div`
  flex: 1;
  align-items: center;
  background-color: #FFFFFF;
  padding: 10px;
  padding-top: 20px;
`;

const InnerContainer = styled.div`
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
  height: 20px;
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
