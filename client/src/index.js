import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App.js';
import '../public/css/style.css';
import '../public/css/bootstrap.css';

ReactDOM.render(<Router><App /></Router>, document.getElementById('app'));