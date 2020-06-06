import React, { Component } from 'react';
import jwtDecode from 'jwt-decode';
import { Route, Switch, Redirect } from 'react-router-dom';


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

  render() {
    return (
      <div>
        <h1>Hello</h1>
      </div>
    )
  }
}

export default App;