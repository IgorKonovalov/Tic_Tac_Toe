import React, {Component} from 'react';
import io from 'socket.io-client';
import styled from 'styled-components';
import Tile from './tile.jsx';
import Sound from 'react-sound';

export default class Board extends Component {

  constructor(props){
    super(props);
    this.state = {
  		gameBoard: [
  	        ['','',''],
  	        ['','',''],
  	        ['','','']
        ],
      gameCode: props.gameCode,
      socket: props.socket,
      playerTurn : '1',
      sound: false
    }
    this.renderBoard = this.renderBoard.bind(this);
  }

  componentDidMount(){
  	this.state.socket.on('update board', (data) => {
  		this.setState({
    			gameBoard: data.gameBoard,
    			playerTurn: data.playerTurn
    		})
  	})

  	this.state.socket.on('game end', (data) =>{
  		// When game is ended, changing playerTurn to 0, so no player can make a move
  		this.setState({
  			playerTurn: 0,
  			message: data
  		})
  	})
  }


  renderBoard() {
  	return this.state.gameBoard.map((rows, rowIndex) => {
  		let row = rows.map((value, colIndex) => {
  			let coord = colIndex.toString() + rowIndex.toString();
  			return (
  			<Tile
  				key={coord}
  				socket={this.state.socket}
  				row={rowIndex}
  				col={colIndex}
  				gameCode={this.state.gameCode}
  				playerValue={this.props.playerValue}
  				value={value}
  				playerNum = {this.props.playerNum}
  				playerTurn={this.state.playerTurn}
  			/>
  			);
  		});

  		return <RowContainer key={rowIndex} >{row}</RowContainer>
  	});
  }

  render() {
    let message;
    if ((this.state.message == 'First player won!' && this.props.playerValue == 'X')||(this.state.message == 'Second player won!' && this.props.playerValue == 'O')) {
      message = 'You won!';
      this.state.sound =
        <Sound
          url="./sound/won.mp3"
          playStatus={Sound.status.PLAYING}
          playFromPosition={0}
          onLoading={this.handleSongLoading}
          onPlaying={this.handleSongPlaying}
          onFinishedPlaying={this.handleSongFinishedPlaying} />;
    } else if ((this.state.message == 'First player won!' && this.props.playerValue == 'O')||(this.state.message == 'Second player won!' && this.props.playerValue == 'X')) {
      message = 'You lost!';
      this.state.sound =
        <Sound
          url="./sound/loose.mp3"
          playStatus={Sound.status.PLAYING}
          playFromPosition={0}
          onLoading={this.handleSongLoading}
          onPlaying={this.handleSongPlaying}
          onFinishedPlaying={this.handleSongFinishedPlaying} />;
    } else if (this.state.message == 'Draw!'){
      message = 'It\'s a draw!'
    }
    return (
		<Container>
      {this.state.sound}
  		<Label>
  			Room Code: {this.state.gameCode}
  		</Label>
  		<Label>
  			{message}
  		</Label>
  		{this.renderBoard()}

		</Container>
    )
  }
}

const Label = styled.label`
  flex-basis: 100%;
  display: block;
  font-size: 2em;
  margin-bottom: .3em;
  margin-top: .3em;
  text-align: center;
  color: #1a237e;
`;

const Container = styled.div`
  display: block;
  flex: 0;
  align-items: center;
  margin-bottom: 50px;
  width: 450px;
`;

const RowContainer = styled.div`
  display: flex;
  width: 450px;
  flex-direction: row;
  align-items: center;
`;
