const socket = io();
let timeoutID;


// emit events
button.addEventListener('click', () => {
  if (username.value && message.value) {
    clearTimeout(timeoutID);
    socket.emit('notTyping', {
      username: DOMPurify.sanitize(username.value)
    });

    socket.emit('message', {
      username: DOMPurify.sanitize(username.value),
      message: DOMPurify.sanitize(message.value),
    });

    message.value = '';
  }
});

message.addEventListener('input', () => {
  clearTimeout(timeoutID);

  socket.emit('typing', {
    username: DOMPurify.sanitize(username.value)
  });

  timeoutID = setTimeout(() => {
    socket.emit('notTyping', {
      username: DOMPurify.sanitize(username.value) // not necessary
    });
  }, 1000);



});


// listen for events
socket.on('message', data => {
  messages.innerHTML = `
    <p data-createdat=${message.createdAt}><span class="username">${DOMPurify.sanitize(data.username)}: </span>${DOMPurify.sanitize(data.message)}</p>
    ${messages.innerHTML}
  `;
});

socket.on('typing', data => {
  typing.innerText = `${DOMPurify.sanitize(data.username)} is typing...`;
});

socket.on('notTyping', data => {
  typing.innerText = '\xa0';
});