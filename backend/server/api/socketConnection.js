import socket from 'socket.io';
import Message from '../../database/messageModel';

export default server => {
  const io = socket(server);

  io.on('connection', (socket) => {

    socket.on('message', async data => {
      try {
        const message = await Message.create(data);

        if (message) {
          io.sockets.emit('message', message);
        }


      } catch (err) {

        console.error(err);
      }
    });

    socket.on('typing', data => {
      socket.broadcast.emit('typing', data);
    });

    socket.on('notTyping', data => {
      socket.broadcast.emit('notTyping', data);
    });

  });
};
