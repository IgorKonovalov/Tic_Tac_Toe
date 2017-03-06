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
      playerName: ''
    }

    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleChangeJoin = this.handleChangeJoin.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
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
    <AppContainer>
      <TicTacToeContainer>
        <InnerContainer onClick={this.createRoom}>
          <button>Create Game Room</button>
        </InnerContainer>
        {showRoom}
        <BottomInnerContainer>
          <Input value={this.state.joinCode} onChange={this.handleChangeJoin} />
        </BottomInnerContainer>
        <InnerContainer>
          <button onClick={this.joinRoom}>Join Game</button>
        </InnerContainer>
        {this.state.start ? <Board socket={this.socket} playerValue={this.state.playerValue} playerNum={this.state.playerNum} gameCode={this.state.gameCode} /> : null}
      </TicTacToeContainer>
      <ChatContainer>
        <span>Введите свое имя: </span>
        <Input onChange={this.handleChangeName}/>
        {this.state.start ? <Chat socket={this.socket} name={this.state.playerName}/> : null}
      </ChatContainer>
    </AppContainer>
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

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const TicTacToeContainer = styled.div`
  width: 45%;
  flex: 1;
  align-items: center;
  background-color: #FFFFFF;
  padding: 10px;
  padding-top: 20px;
`;

const ChatContainer = styled.div`
  width: 45%;
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
  margin-top: 20px;
`;

const Input = styled.input`
  height: 40px;
  font-size: 20px;
  border-width: 1px;
  width: 120px;
  padding: 10px;
  margin-bottom: 20px;
`;


ReactDOM.render(<TicTacToeApp />, document.getElementById('root'));
