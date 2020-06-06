import React, { Component } from 'react';
import { getHeaders } from '../utils/utils';


class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      action: 'login'
    };
    this.handleButton = this.handleButton.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleButton(e) {
    this.setState({ action: e.target.name});
  }

  handleLogin() {
    fetch('/api/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(res => res.json())
      .then(user => {
        // set localStorage with token
        localStorage.setItem('token', user.token);

        // set App state with user
        this.props.addUserToState(user.user);

        // push to user's namespace
        this.props.history.push(`/${user.user.username}`);
      })
      .catch(console.log);
  }

  handleSignup() {
    fetch('/api/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(() => this.setState(
        {
          action: 'login',
          username: '',
          password: ''
        }))
      .catch(console.log);
  }

  render() {
    return (
      <div>
        <div className="row mb-3">
          <div className="col text-center">
            <button type="button" name="login" className="btn btn-light mr-4" onClick={this.handleButton}>Login</button>
            <button type="button" name="signup" className="btn btn-light" onClick={this.handleButton}>Sign Up</button>
          </div>
        </div>

        <div className="row">
          {this.state.action === 'login' ?

            <div className="form-group col">
              <input
                type='text'
                className='form-control form-control-lg mb-1'
                placeholder='Username'
                name='username'
                value={this.state.username}
                onChange={this.handleInputChange}
                autoFocus
              />
              <input
                type='password'
                className='form-control form-control-lg'
                placeholder='Password'
                name='password'
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Login" className="btn btn-info btn-block mt-4" onClick={this.handleLogin} />
            </div>

            :

            <div className="form-group col">
              <input
                type='text'
                className='form-control form-control-lg mb-1'
                placeholder='Username'
                name='username'
                value={this.state.username}
                onChange={this.handleInputChange}
                autoFocus
              />
              <input
                type='password'
                className='form-control form-control-lg'
                placeholder='Password'
                name='password'
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              <input type="submit" value="Sign Up" className="btn btn-info btn-block mt-4" onClick={this.handleSignup} />
            </div>

          }
        </div>

      </div>
    )
  }
}



export default Landing;