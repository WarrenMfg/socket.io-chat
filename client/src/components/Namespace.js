import React, { Component } from 'react';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { getHeaders, handleErrors } from '../utils/utils';


class Namespace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user, // seed data to be controlled by Namespace component
      message: '',
      radioInput: this.props.user.lastSelectedRoom._id, // seed data to be controlled by Namespace component
      notTypingTimeoutID: null,
      chatIdSelected: true,
      chatId: this.props.user.lastSelectedRoom._id // seed data to be controlled by Namespace component
    };

    this.socket = io();

    // bind
    this.getMoreMessages = this.getMoreMessages.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleRadioInputTextChange = this.handleRadioInputTextChange.bind(this);
    this.handleRadioInputChange = this.handleRadioInputChange.bind(this);
    this.handleAddOrJoin = this.handleAddOrJoin.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
  }


  componentDidMount() {
    const messages = document.getElementById('messages');
    const typing = document.getElementById('typing');


    // on someone else joining
    this.socket.on('joinMessage', data => {
      messages.innerHTML = `
        <p>${DOMPurify.sanitize(data.username)} joined the room.</p>
        ${messages.innerHTML}
      `;
    });

    // on someone else leaving
    this.socket.on('leaveMessage', data => {
      messages.innerHTML = `
        <p>${DOMPurify.sanitize(data.username)} left the room.</p>
        ${messages.innerHTML}
      `;
    });

    // listen for message
    this.socket.on('message', data => {
      messages.innerHTML = `
        <p data-createdat=${data.createdAt}><span class="username">${DOMPurify.sanitize(data.username.username)}: </span>${DOMPurify.sanitize(data.message)}</p>
        ${messages.innerHTML}
      `;
    });

    // listen for typing
    this.socket.on('typing', data => {
      typing.innerText = `${DOMPurify.sanitize(data.username)} is typing...`;
    });

    this.socket.on('notTyping', () => {
      typing.innerText = '\xa0'; // &nbsp;
    });


    // join lastSelectedRoom
    this.socket.emit('join', { previousRoom: '', currentRoom: this.state.chatId, username: this.state.user.username });
    // fetch messages on load
    fetch(`/api/getMessagesOnLoadAndRoomChange/${this.state.chatId}`, {
      method: 'GET',
      headers: getHeaders()
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(data => {
        messages.innerHTML = '';
        data.forEach(message => {
          messages.innerHTML += `<p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username.username)}: </span>${DOMPurify.sanitize(message.message)}</p>`;
        });
      })
      .catch(err => {
        if (err.unauthorized || err.expiredUser) {
          localStorage.removeItem('token');
          this.props.history.push('/');
        } else {
          console.log(err);
        }
      });


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


  componentDidUpdate(prevProps, prevState) {
    const messages = document.getElementById('messages');

    if (prevState.chatId !== this.state.chatId) {
      if (!this.state.chatId) {
        messages.innerHTML = '';
        this.socket.emit('join', { previousRoom: prevState.chatId, currentRoom: this.state.chatId, username: this.state.user.username });
        return;
      }

      // join room
      this.socket.emit('join', { previousRoom: prevState.chatId, currentRoom: this.state.chatId, username: this.state.user.username });


      // fetch messages on room change
      fetch(`/api/getMessagesOnLoadAndRoomChange/${this.state.chatId}`, {
        method: 'GET',
        headers: getHeaders()
      })
        .then(handleErrors)
        .then(res => res.json())
        .then(data => {
          messages.innerHTML = '';
          data.forEach(message => {
            messages.innerHTML += `<p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username.username)}: </span>${DOMPurify.sanitize(message.message)}</p>`;
          });
        })
        .catch(err => {
          if (err.unauthorized || err.expiredUser) {
            localStorage.removeItem('token');
            this.props.history.push('/');
          } else {
            console.log(err);
          }
        });
    }
  }


  componentWillUnmount() {
    // leave room when user logs out
    this.socket.emit('join', { previousRoom: this.state.chatId, currentRoom: '', username: this.state.user.username });
  }


  getMoreMessages(last) {
    const messages = document.getElementById('messages');

    fetch(`/api/getMoreMessages/${this.state.chatId}/${last}`, {
      method: 'GET',
      headers: getHeaders()
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(data => {
        data.forEach(message => {
          messages.innerHTML += `<p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(message.username.username)}: </span>${DOMPurify.sanitize(message.message)}</p>`;
        });
      })
      .catch(err => {
        if (err.unauthorized || err.expiredUser) {
          localStorage.removeItem('token');
          this.props.history.push('/');
        } else {
          console.log(err);
        }
      });
  }


  handleMessageChange(e) {
    clearTimeout(this.state.notTypingTimeoutID);

    this.socket.emit('typing', {
      username: DOMPurify.sanitize(this.state.user.username),
      room: DOMPurify.sanitize(this.state.chatId)
    });

    this.setState({
      message: e.target.value,

      notTypingTimeoutID: setTimeout(() => {
        this.socket.emit('notTyping', {
          room: DOMPurify.sanitize(this.state.chatId)
        });
      }, 1000)
    });
  }


  handleRoomChange(e) {
    // update db with lastSelectedRoom
    fetch('/api/lastSelectedRoom', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chatId: e.target.value })
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(user => this.setState({
        user,
        chatId: user.lastSelectedRoom._id
      }))
      .catch(err => {
        if (err.noRoom) {
          console.log('Not a valid room');
        } else {
          console.log(err);
        }
      });

    // update input radio/label and chatId
    document.querySelector('label.active').classList.remove('active');
    const chatId = document.querySelector('#chatId');
    chatId.checked = true;
    chatId.parentElement.classList.add('active');

    this.setState({ chatId: e.target.value, chatIdSelected: true, radioInput: e.target.value });
  }


  handleRadioInputTextChange(e) {
    this.setState({ radioInput: e.target.value });
  }


  handleRadioInputChange(e) {
    const placeholders = {
      chatId: 'Choose a chat room to share ID',
      addNew: 'Enter a new chat room name',
      joinNew: 'Enter chat ID'
    };

    // update placeholder text
    document.querySelector('label.active').classList.remove('active');
    e.target.parentElement.classList.add('active');
    const radioInput = document.querySelector('#radioInput');
    radioInput.placeholder = placeholders[e.target.id];

    e.target.id === 'chatId' ? this.setState({ chatIdSelected: true, radioInput: this.state.chatId }) : this.setState({ chatIdSelected: false, radioInput: '' });
  }


  handleAddOrJoin(e) {
    const action = document.querySelector('input[type="radio"]:checked').id;

    if (action === 'addNew') this.addNew(this.state.radioInput);
    else this.joinNew(this.state.radioInput);
  }


  addNew(roomname) {
    fetch('/api/addNewRoom', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ roomname })
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(user => this.setState({ user, radioInput: '' }))
      .catch(err => {
        if (err.unauthorized || err.expiredUser) {
          localStorage.removeItem('token');
          this.props.history.push('/');
        } else {
          console.log(err);
        }
      });
  }


  joinNew(chatId) {
    fetch('/api/joinNewRoom', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chatId })
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(user => this.setState({ user, radioInput: '' }))
      .catch(err => {
        if (err.unauthorized || err.expiredUser) {
          localStorage.removeItem('token');
          this.props.history.push('/');
        } else if (err.noRoom) {
          this.setState({ radioInput: 'No room with that chat ID' });
          setTimeout(() => this.setState({ radioInput: '' }), 2000);

        } else {
          console.log(err);
        }
      });
  }


  handleSendMessage() {
    if (this.state.message && this.state.chatId) {
      clearTimeout(this.state.notTypingTimeoutID);

      this.socket.emit('notTyping', {
        room: DOMPurify.sanitize(this.state.chatId)
      });

      this.socket.emit('message', {
        username: DOMPurify.sanitize(this.state.user._id),
        message: DOMPurify.sanitize(this.state.message),
        room: DOMPurify.sanitize(this.state.chatId)
      });

      this.setState({ message: '' });
    }
  }


  handleLogout() {
    fetch('/api/logout', {
      method: 'POST',
      headers: getHeaders()
    })
      .then(handleErrors)
      .then(() => {
        localStorage.removeItem('token');
        this.props.history.push('/');
      })
      .catch(err => {
        if (err.unauthorized || err.expiredUser) {
          localStorage.removeItem('token');
          this.props.history.push('/');
        } else {
          console.log(err);
        }
      });
  }


  render() {
    return (
      <div>

        <small id="typing">&nbsp;</small>
        <div className="mb-3" id="messages"></div>

        <form className="mb-3">
          <div className="form-group mb-0">
            <textarea className="form-control" id="message" rows="2" placeholder="Message..." value={this.state.message} onChange={this.handleMessageChange}></textarea>
          </div>

          <button id="button" onClick={this.handleSendMessage} type="button" className="btn btn-success btn-lg btn-block">Send</button>
        </form>

        <div className="list-group">
          <select className="custom-select mb-3" id="namespace-room" value={this.state.chatId} onChange={this.handleRoomChange}>
            {this.state.user.memberOf.map(room => (
              <option key={room._id} value={room._id}>{room.roomname}</option>
            ))}
          </select>

          <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label className="btn btn-outline-info active">
              <input type="radio" name="options" id="chatId" onClick={this.handleRadioInputChange} />Chat ID
            </label>

            <label className="btn btn-outline-info">
              <input type="radio" name="options" id="addNew" onClick={this.handleRadioInputChange} />Add New
            </label>

            <label className="btn btn-outline-info">
              <input type="radio" name="options" id="joinNew" onClick={this.handleRadioInputChange} />Join New
            </label>
          </div>

          <div className="input-group mb-3">
            <input id="radioInput" type="text" className="form-control" value={this.state.radioInput} onChange={this.handleRadioInputTextChange} placeholder="Choose a chat room to share ID" />
            {!this.state.chatIdSelected &&
              <div className="input-group-append">
                <button className="btn btn-outline-info" type="button" onClick={this.handleAddOrJoin}>Submit</button>
              </div>
            }
          </div>

        </div>

        <button type="button" className="btn btn-outline-secondary btn-lg btn-block" onClick={this.handleLogout}>Logout</button>

      </div>
    )
  }
}

export default Namespace;