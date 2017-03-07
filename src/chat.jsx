import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import styled from 'styled-components';


export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      socket: props.socket,
      gameCode: props.gameCode,
      name: props.name,
      playerValue: props.playerValue
    };
  }

  componentDidMount () {
    this.state.socket.on('message', message => {
      this.setState({ messages: [message, ...this.state.messages]});
    })
  }

  handleSubmit = event => {
    const body = event.target.value;
    if (event.keyCode === 13 && body) {
      const message = {
        gameCode: this.state.gameCode,
        body,
        from: this.state.name || 'Me',
        playerValue: this.state.playerValue
      };
      this.setState({ messages: [message, ...this.state.messages]});
      this.state.socket.emit('message', message);
      event.target.value = '';
    }
  }

  render () {
    const messages = this.state.messages.map((message, index) => {
      return <li key={index}>{message.playerValue}: <B2>{message.from}</B2>: {message.body}</li>
    })
    return (
      <div>
        <h1>Chat!</h1>
        <input type='text' placeholder='type a message...' onKeyUp={this.handleSubmit} />
        {messages}
      </div>
    )
  }
}

const B = styled.b`
  color: red;
`;
const B2 = styled(B)`
  font-size: 20px;
`;
