import socket from 'socket.io';
import Message from '../../database/models/Message';

export default server => {
  const io = socket(server);

  io.on('connection', (socket) => {

    // message
    socket.on('message', async data => {
      try {
        const message = await Message.create(data);

        if (message) {
          io.to(data.room).emit('message', message);
        }

      } catch (err) {
        console.error(err);
      }
    });

    // typing
    socket.on('typing', data => {
      socket.broadcast.to(data.room).emit('typing', data);
    });

    socket.on('notTyping', data => {
      socket.broadcast.to(data.room).emit('notTyping');
    });

  });
};
