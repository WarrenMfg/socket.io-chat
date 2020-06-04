const socket = io();
const typing = document.getElementById('typing');
const messages = document.getElementById('messages');
const startTheConversation = document.getElementById('start-the-conversation');
const username = document.getElementById('username');
const message = document.getElementById('message');
const button = document.getElementById('button');
let timeoutID;


// emit events
button.addEventListener('click', () => {
  clearTimeout(timeoutID);
  socket.emit('notTyping', {
    username: username.value
  });

  socket.emit('message', {
    username: username.value,
    message: message.value,
  });

  message.value = '';
});

message.addEventListener('input', () => {
  clearTimeout(timeoutID);

  socket.emit('typing', {
    username: username.value
  });

  timeoutID = setTimeout(() => {
    socket.emit('notTyping', {
      username: username.value // not necessary
    });
  }, 1000);



});


// listen for events
socket.on('message', data => {
  startTheConversation.style.display = 'none';
  messages.innerHTML = `
    <p><span class="username">${data.username}: </span>${data.message}</p>
    ${messages.innerHTML}
  `;
});

socket.on('typing', data => {
  typing.innerText = `${data.username} is typing...`;
});

socket.on('notTyping', data => {
  typing.innerText = '\xa0';
});