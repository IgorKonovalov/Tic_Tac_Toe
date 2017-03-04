import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';


let socket;


export default class Tile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      socket : props.socket,
      playerValue: props.playerValue,
      col:  props.col,
      row: props.row,
      gameCode: props.gameCode,
    }
    this._clickTile = this._clickTile.bind(this);
  }

  componentDidMount(){
    this.setState({
      value: this.props.value
    })
  }

  _clickTile(){

    console.log("player num ", this.props.playerNum);
    console.log("player turn ", this.props.playerTurn);
    console.log('row', this.state.row);
    console.log('col', this.state.col);
    console.log('gamecode', this.state.gameCode);

    if (this.props.playerNum == this.props.playerTurn){
      this.setState({
       value: this.state.playerValue
      })
      this.state.socket.emit("click", {
        gameCode: this.state.gameCode,
        row: this.state.row,
        col: this.state.col,
        value: this.state.playerValue
      });
    } else {
      console.log("cannot press")
    }
  }

  render() {
    return (
      <TileContainer onClick={this._clickTile}>
        <TileText>{this.props.value}</TileText>
      </TileContainer>
    )
  }
}

const TileContainer = styled.div`
  background-color: #000;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  width: 100px;
  border: 1px solid white;
  border-color: #FFFFFF;
  &:hover {
    box-shadow: inset 0px 0px 16px rgba(255,255,255,1);
  }
`;

const TileText = styled.p`
  color: #FFFFFF;
  font-size : 40px;
`;
