import express from 'express';
import socket from 'socket.io';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('client'));
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const io = socket(server);

io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);

  socket.on('message', data => {
    io.sockets.emit('message', data);
  });
});
