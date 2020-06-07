import React, { Component } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { getHeaders } from '../utils/utils';


class Namespace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user, // seed data to be controlled by Namespace component
      message: '',
      room: '',
      notTypingTimeoutID: null,
      chatIdSelected: true
    };

    this.socket = io();

    // bind
    this.getMoreMessages = this.getMoreMessages.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleRadioInputChange = this.handleRadioInputChange.bind(this);
    this.handleAddJoin = this.handleAddJoin.bind(this);
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
      username: DOMPurify.sanitize(this.state.user.username),
      room: DOMPurify.sanitize(this.state.room)
    });

    this.setState({
      message: e.target.value,

      notTypingTimeoutID: setTimeout(() => {
        this.socket.emit('notTyping', {
          room: DOMPurify.sanitize(this.state.room)
        });
      }, 1000)
    });
  }


  handleRoomChange(e) {


    // change radio input to Chat ID
  }


  handleRadioInputChange(e) {
    const placeholders = {
      chatId: 'Choose a chat room to view ID',
      addNew: 'Enter a new chat room name',
      joinNew: 'Enter a new chat ID'
    };

    document.querySelector('label.active').classList.remove('active');
    e.target.parentElement.classList.add('active');
    document.querySelector('input#radioInput').placeholder = placeholders[e.target.id];

    e.target.id === 'chatId' ? this.setState({ chatIdSelected: true }) : this.setState({ chatIdSelected: false });
  }


  handleAddJoin(e) {
    const radioInput = document.querySelector('#radioInput');
    const action = document.querySelector('input[type="radio"]:checked').id;

    if (action === 'addNew') this.addNew(radioInput.value);
    else this.joinNew(radioInput.value);

    radioInput.value = '';
  }


  addNew(roomname) {
    fetch('/api/addNewRoom', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roomname, userId: this.state.user._id })
    })
      .then(res => res.json())
      .then(user => this.setState({ user }))
      .catch(console.log);
  }


  joinNew(chatId) {

  }


  handleSendMessage() {
    if (this.state.message && this.state.room) {
      clearTimeout(this.state.notTypingTimeoutID);

      this.socket.emit('notTyping', {
        room: DOMPurify.sanitize(this.state.room)
      });

      this.socket.emit('message', {
        username: DOMPurify.sanitize(this.state.user.username),
        message: DOMPurify.sanitize(this.state.message),
        room: DOMPurify.sanitize(this.state.room)
      });

      this.setState({ message: '' });
    }
  }


  handleLogout() {
    fetch('/api/logout', {
      method: 'POST',
      headers: getHeaders()
    })
      .then(() => {
        localStorage.removeItem('token');
        this.props.history.push('/');
      })
      .catch(console.log);
  }


  render() {
    return (
      <div>

        <small id="typing">&nbsp;</small>
        <div id="messages"></div>

        <form className="mb-3">
          <div className="form-group">
            <textarea className="form-control" id="message" rows="2" placeholder="Message..." value={this.state.message} onChange={this.handleMessageChange}></textarea>
          </div>

          <button id="button" onClick={this.handleSendMessage} type="button" className="btn btn-dark btn-lg btn-block">Send</button>
        </form>

        <div className="list-group">
          <select className="custom-select mb-3" id="namespace-room">
            <option defaultValue value=''>Choose a chat room</option>
            {this.state.user.memberOf.map(room => (
              <option key={room._id} value={room._id}>{room.roomname}</option>
            ))}
          </select>

          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label className="btn btn-secondary active">
              <input type="radio" name="options" id="chatId" onChange={this.handleRadioInputChange} />Chat ID
            </label>

            <label className="btn btn-secondary">
              <input type="radio" name="options" id="addNew" onChange={this.handleRadioInputChange} />Add New
            </label>

            <label className="btn btn-secondary">
              <input type="radio" name="options" id="joinNew" onChange={this.handleRadioInputChange} />Join New
            </label>
          </div>

          <div className="input-group mb-3">
            <input id="radioInput" type="text" className="form-control" placeholder="Choose a chat room to view ID" />
            {!this.state.chatIdSelected &&
              <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button" onClick={this.handleAddJoin}>Submit</button>
              </div>
            }
          </div>

        </div>

        <button type="button" className="btn btn-dark btn-lg btn-block" onClick={this.handleLogout}>Logout</button>

      </div>
    )
  }
}

export default Namespace;