import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import Tile from './tile.jsx';

export default class Board extends React.Component {

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
      playerTurn : '1'
    }
    this._renderBoard = this._renderBoard.bind(this);
  }

  componentDidMount(){
  	this.state.socket.on("board update", (data) => {
  		console.log(data);
		this.setState({
  			gameBoard: data.gameBoard,
  			playerTurn: data.playerTurn
  		})
  	})

  	this.state.socket.on("game end", (data) =>{
  		// когда игра закончилась, меняем playerturn на 0
  		this.setState({
  			playerTurn: 0,
  			message: data
  		})
  	})
  }

  _renderBoard(){
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
    return (
		<Container>
		<p>
			Room Code: {this.state.gameCode}
		</p>
		<p>
			{this.state.message}
		</p>
			{this._renderBoard()}
		</Container>
    )
  }
}

const Container = styled.div`
  display: block;
  flex: 1;
  align-items: center;
  margin-top: 150px;
`;

const RowContainer = styled.div`
  flex-direction: row;
  align-items: center;
`;



const styles= {
	container: {
		flex: 1,
		alignItems: 'center',
		marginTop: 150
	},
	rowContainer:{
		flexDirection: 'row',
		alignItems: 'center',
	}
}
