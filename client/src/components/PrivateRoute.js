import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import jwtDecode from 'jwt-decode';


const PrivateRoute = ({ component: Component, user, ...rest }) => {
  try {
    jwtDecode(localStorage.getItem('token').split(' ')[1]); // will throw if invalid

    return <Route {...rest}><Component user={user} /></Route>;

  } catch (err) {
    localStorage.removeItem('token');
    return <Redirect to='/' />;
  }
};

export default PrivateRoute;
