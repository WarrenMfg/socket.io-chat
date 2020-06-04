const socket = io();
const typing = document.getElementById('typing');
const messages = document.getElementById('messages');
const messageInfo = document.querySelector('#messages-message');
const handle = document.getElementById('handle');
const message = document.getElementById('message');
const button = document.getElementById('button');
let timeoutID;


// emit events
button.addEventListener('click', () => {
  clearTimeout(timeoutID);
  socket.emit('notTyping', {
    handle: handle.value
  });

  socket.emit('message', {
    handle: handle.value,
    message: message.value,
  });

  message.value = '';
});

message.addEventListener('input', () => {
  clearTimeout(timeoutID);

  socket.emit('typing', {
    handle: handle.value
  });

  timeoutID = setTimeout(() => {
    socket.emit('notTyping', {
      handle: handle.value
    });
  }, 1000);



});


// listen for events
socket.on('message', data => {
  messageInfo.style.display = 'none';
  messages.innerHTML = `
    <p><span class="handle">${data.handle}: </span>${data.message}</p>
    ${messages.innerHTML}
  `;
});

socket.on('typing', data => {
  typing.innerText = `${data.handle} is typing...`;
});

socket.on('notTyping', data => {
  typing.innerText = '\xa0';
});