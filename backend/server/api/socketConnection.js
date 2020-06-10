import socket from 'socket.io';
import Message from '../../database/models/Message';

export default server => {
  const io = socket(server);

  io.on('connection', (socket) => {
    // join (and leave) event
    socket.on('join', data => {
      // leave previous room
      if (data.previousRoom) {
        socket.leave(data.previousRoom);
        socket.to(data.previousRoom).emit('leaveMessage', { username: data.username });
      }
      // join current room
      if (data.currentRoom) {
        socket.join(data.currentRoom);
        socket.to(data.currentRoom).emit('joinMessage', { username: data.username });
      }
    });

    // message
    socket.on('message', async data => {
      try {
        data.message = data.message.replace(/\r\n|\r|\n/g, '<br>');
        const message = await Message.create(data);

        if (message) {
          const populated = await message.execPopulate('room username');
          io.to(data.room).emit('message', populated);
        }

      } catch (err) {
        console.log(err);
      }
    });

    // typing
    socket.on('typing', data => {
      socket.to(data.room).emit('typing', data);
    });

    socket.on('notTyping', data => {
      socket.to(data.room).emit('notTyping');
    });

  });
};
