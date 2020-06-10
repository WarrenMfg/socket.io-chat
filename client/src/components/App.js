import React, { Component } from 'react';
import jwtDecode from 'jwt-decode';
import { Route, Switch, withRouter } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PrivateRoute from './PrivateRoute';
import Namespace from './Namespace';
import Landing from './Landing';
import { getHeaders, handleErrors } from '../utils/utils';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };

    this.addUserToState = this.addUserToState.bind(this);
  }


  componentDidMount() {
    // DOMpurify config
    DOMPurify.setConfig({ALLOWED_TAGS: ['br']});


    if (localStorage.token) {
      try {
        jwtDecode(localStorage.token.split(' ')[1]);

        fetch('/api/getLoggedInUser', {
          headers: getHeaders()
        })
          .then(handleErrors)
          .then(res => res.json())
          .then(user => {
            this.setState({ user });
            this.props.history.push(`/${user.username}`);
          })
          .catch(err => {
            if (err.unauthorized || err.expiredUser) {
              localStorage.removeItem('token');
              this.props.history.push('/');
            } else {
              console.log(err.message);
            }
          });

      } catch (err) {
        console.log(err.message);
      }
    }
  }


  addUserToState(user) {
    this.setState({ user });
  }


  render() {
    return (
      <div className="container">
        <header>
          <h1>Socketman Chat</h1>
        </header>

        <Switch>
          <Route exact path='/' render={props => <Landing {...props} addUserToState={this.addUserToState} />} />
          <PrivateRoute exact path='/:username' component={Namespace} user={this.state.user} />
        </Switch>
      </div>
    )
  }
}

export default withRouter(App);