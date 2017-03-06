import React, {Component} from 'react';
import io from 'socket.io-client';
import styled from 'styled-components';



export default class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket : props.socket,
      playerValue: props.playerValue,
      col:  props.col,
      row: props.row,
      gameCode: props.gameCode,
    }
    this.clickTile = this.clickTile.bind(this);
  }

  componentDidMount() {
    this.setState({
      value: this.props.value
    })
  }

  clickTile() {

    console.log('player num', this.props.playerNum);
    console.log('player turn', this.props.playerTurn);
    console.log('row', this.state.row);
    console.log('col', this.state.col);
    console.log('gamecode', this.state.gameCode);

    if (this.props.playerNum == this.props.playerTurn){
      this.setState({
       value: this.state.playerValue
      })
      this.state.socket.emit('click', {
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
      <TileContainer onClick={this.clickTile}>
        <TileText>{this.props.value}</TileText>
      </TileContainer>
    )
  }
}

const TileContainer = styled.div`
  background-color: hsl(240, 100%, 5%);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  width: 150px;
  border-radius: 5px;
  border: 1px solid #FFF;
  border-color: #FFF;
  &:hover {
    box-shadow: inset 0px 0px 16px #FFF;
  }
`;

const TileText = styled.p`
  font: 100px sans-serif;
  color: #FFF;
`;
