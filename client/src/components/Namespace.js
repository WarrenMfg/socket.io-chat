import React, { Component } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';


class Namespace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      notTypingTimeoutID: null
    };

    this.socket = io();

    // bind
    this.getMoreMessages = this.getMoreMessages.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
  }


  componentDidMount() {
    const messages = document.getElementById('messages');
    const typing = document.getElementById('typing');

    // DOMpurify config
    DOMPurify.setConfig({ALLOWED_TAGS: []});


    // listen for socket events
    this.socket.on('message', data => {
      messages.innerHTML = `
        <p data-createdat=${data.createdAt}><span class="username">${DOMPurify.sanitize(data.username)}: </span>${DOMPurify.sanitize(data.message)}</p>
        ${messages.innerHTML}
      `;
    });

    this.socket.on('typing', data => {
      typing.innerText = `${DOMPurify.sanitize(data.username)} is typing...`;
    });

    this.socket.on('notTyping', () => {
      typing.innerText = '\xa0'; // &nbsp;
    });


    // fetch messages on load
    fetch('/api/messagesOnLoad')
      .then(res => res.json())
      .then(data => {
        data.forEach(message => messages.innerHTML += `
          <p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username)}: </span>${DOMPurify.sanitize(message.message)}</p>
        `);
      })
      .catch(console.log);

    // throttled infinite scrolling
    messages.onscroll = ( () => {
      let throttledInfiniteScrollingTimeoutID;
      let messagesRect = messages.getBoundingClientRect();

      return () => {
        if (!throttledInfiniteScrollingTimeoutID) {
          // assign throttledInfiniteScrollingTimeoutID
          throttledInfiniteScrollingTimeoutID = setTimeout(() => {
            const last = messages.lastElementChild;
            const lastRect = last.getBoundingClientRect();

            if (lastRect.top <= (messagesRect.bottom + (messagesRect.height / 2))) {
              // get more messages
              this.getMoreMessages(last.dataset.createdat);
            }

            throttledInfiniteScrollingTimeoutID = null;

          }, 500);
        }
      };

    })();
  }


  getMoreMessages(last) {
    const messages = document.getElementById('messages');

    fetch(`/api/getMoreMessages/${last}`)
      .then(res => res.json())
      .then(data => {
        data.forEach(message => messages.innerHTML += `
          <p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username)}: </span>${DOMPurify.sanitize(message.message)}</p>
        `);
      })
      .catch(console.log);
  }


  handleMessageChange(e) {
    clearTimeout(this.state.notTypingTimeoutID);

    this.socket.emit('typing', {
      username: DOMPurify.sanitize(this.props.user.username)
    });

    this.setState({
      message: e.target.value,

      notTypingTimeoutID: setTimeout(() => {
        this.socket.emit('notTyping', {
          username: DOMPurify.sanitize(this.props.user.username) // not necessary to send data
        });
      }, 1000)
    });
  }


  handleSendMessage() {
    if (this.state.message) {
      clearTimeout(this.state.notTypingTimeoutID);

      this.socket.emit('notTyping', {
        username: DOMPurify.sanitize(this.props.user.username) // not necessary to send data
      });

      this.socket.emit('message', {
        username: DOMPurify.sanitize(this.props.user.username),
        message: DOMPurify.sanitize(this.state.message),
      });

      this.setState({ message: '' });
    }
  }


  render() {
    return (
      <div>

        <small id="typing">&nbsp;</small>
        <div id="messages"></div>

        <form className="mb-3">
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea className="form-control" id="message" rows="2" value={this.state.message} onChange={this.handleMessageChange}></textarea>
          </div>

          <button id="button" onClick={this.handleSendMessage} type="button" className="btn btn-dark btn-lg btn-block">Send</button>
        </form>

        <div className="list-group">
          <select className="custom-select mb-3" id="namespace-room">
            <option defaultValue value=''>Choose a chat room</option>
            {this.props.user.rooms.map(room => (
              <option key={room._id} value={room.roomId}>{room.name}</option>
            ))}
          </select>

          <div className="input-group mb-3">
            {/* <label htmlFor="add-chat-room">Add another chat room</label> */}
            <input id="add-chat-room" type="text" className="form-control" placeholder="Enter a chat room name" />
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" id="button-addon2">Add</button>
            </div>
          </div>

          <div className="input-group mb-3">
            {/* <label htmlFor="join-chat-room">Join another chat room</label> */}
            <input id="join-chat-room" type="text" className="form-control" placeholder="Enter chat room ID" />
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" id="button-addon2">Join</button>
            </div>
          </div>

        </div>

      </div>
    )
  }
}

export default Namespace;