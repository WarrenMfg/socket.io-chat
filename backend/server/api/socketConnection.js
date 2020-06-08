import socket from 'socket.io';
import Message from '../../database/models/Message';

export default server => {
  const io = socket(server);

  io.on('connection', (socket) => {
    // join
    socket.on('join', data => {
      socket.leave(data.previousRoom);
      if (data.currentRoom) {
        socket.join(data.currentRoom);
        io.to(data.currentRoom).emit('joinMessage', { username: data.username });
      }
    });

    // message
    socket.on('message', async data => {
      try {
        const message = await Message.create(data);


        if (message) {
          const populated = await message.execPopulate('room username');
          io.to(data.room).emit('message', populated);
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
