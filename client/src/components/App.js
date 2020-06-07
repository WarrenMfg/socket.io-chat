import React, { Component } from 'react';
import jwtDecode from 'jwt-decode';
import { Route, Switch, withRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Namespace from './Namespace';
import Landing from './Landing';
import { getHeaders } from '../utils/utils';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };

    this.addUserToState = this.addUserToState.bind(this);
  }


  componentDidMount() {
    if (localStorage.token) {
      try {
        jwtDecode(localStorage.token.split(' ')[1]);

        fetch('/api/getLoggedInUser', {
          headers: getHeaders()
        })
          .then(res => res.json())
          .then(user => {
            this.setState({ user });
            this.props.history.push(`/${user.username}`);
          })
          .catch(console.log);

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