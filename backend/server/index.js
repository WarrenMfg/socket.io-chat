import express from 'express';
import morgan from 'morgan';
import apiRoutes from './api/apiRoutes';
import { connect } from '../database/index';
import socketConnection from './api/socketConnection';


// setup
const app = express();
const PORT = process.env.PORT || 5000;
app.disable('x-powered-by');

// middleware
app.use(morgan('dev', {
  skip: req => ['/meta/site.webmanifest', '/meta/favicon-32x32.png', '/bundle.js'].includes(req.url)
}));
app.use(express.json());
app.use(express.static('client/public'));
app.use('/api', apiRoutes);

// db and server
connect();
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// socket.io/database
socketConnection(server);
