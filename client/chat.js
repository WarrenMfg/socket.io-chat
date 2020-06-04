const socket = io();
const messages = document.getElementById('messages');
const handle = document.getElementById('handle');
const message = document.getElementById('message');
const button = document.getElementById('button');

// emit events
button.addEventListener('click', () => {
  socket.emit('message', {
    handle: handle.value,
    message: message.value,
  });

  message.value = '';
});


// listen for events
socket.on('message', data => {
  messages.innerHTML += `
    <p><span class="handle">${data.handle}: </span>${data.message}</p>
  `;
});