import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import jwtDecode from 'jwt-decode';


const PrivateRoute = ({ component: Component, user, ...rest }) => {
  try {
    jwtDecode(localStorage.getItem('token').split(' ')[1]); // will throw if invalid

    if (user) {
      return <Route {...rest}><Component user={user} /></Route>;
    } else {
      return null;
    }

  } catch (err) {
    localStorage.removeItem('token');
    return <Redirect to='/' />;
  }
};

export default PrivateRoute;
