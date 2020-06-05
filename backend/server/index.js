import express from 'express';
import apiRoutes from './api/apiRoutes';
import { connect } from '../database/index';
import socketConnection from './api/socketConnection';


// setup
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.static('client'));
app.use(express.json());
app.use('/api', apiRoutes);

// db and server
connect();
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// socket.io/database
socketConnection(server);
