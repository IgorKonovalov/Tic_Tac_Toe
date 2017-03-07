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
      return <li key={index}>{message.playerValue}: <B>{message.from}</B>: {message.body}</li>
    })
    return (
      <div>
        <Input type='text' placeholder='type a message...' onKeyUp={this.handleSubmit} />
        {messages}
      </div>
    )
  }
}

const Input = styled.input`
  flex-grow: 2;
  padding: 1em;
  font-size: 1em;
  width: 100%;
  margin-right: 0.5rem;
  margin-bottom: 0.3em;
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


const B = styled.b`
  color: red;
`;
