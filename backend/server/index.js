import express from 'express';
import socket from 'socket.io';
import apiRoutes from './api/apiRoutes';
import { connect } from '../database/index';

// setup
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.static('client'));
app.use('/api', apiRoutes);

// db and server
connect();
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// socket.io
const io = socket(server);

io.on('connection', (socket) => {

  socket.on('message', data => {
    io.sockets.emit('message', data);
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('notTyping', data => {
    socket.broadcast.emit('notTyping', data);
  });

});
