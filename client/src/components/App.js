import React, { Component } from 'react';
import jwtDecode from 'jwt-decode';
import { Route, Switch, Redirect } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Namespace from './Namespace';
import Landing from './Landing';


// Check for token on refresh
// if (localStorage.token) {
//   try {
//     jwtDecode(localStorage.token.split(' ')[1]); // will throw if invalid
//     <Redirect  />

//   } catch (err) {
//     console.log(err);
//   }
// }

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };

    this.addUserToState = this.addUserToState.bind(this);
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
          {/* <Route exact path='/'><Landing addUserToState={this.addUserToState} /></Route> */}
          <Route exact path='/' render={props => <Landing {...props} addUserToState={this.addUserToState} />} />
          <PrivateRoute exact path='/:id' component={Namespace} user={this.state.user} />
        </Switch>
      </div>
    )
  }
}

export default App;