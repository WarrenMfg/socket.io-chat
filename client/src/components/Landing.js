import React, { Component } from 'react';
import { getHeaders, handleErrors } from '../utils/utils';
import jwtDecode from 'jwt-decode';
import DOMPurify from 'dompurify';


class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      usernameFeedback: '\xa0',
      password: '',
      passwordFeedback: '\xa0',
      action: 'login'
    };
    this.handleButton = this.handleButton.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }


  handleInputChange(e) {
    if (e.target.name === 'username') {
      this.setState({ username: e.target.value, usernameFeedback: '\xa0' });
    } else if (e.target.name === 'password') {
      this.setState({ password: e.target.value, passwordFeedback: '\xa0' });
    }
  }


  handleButton(e) {
    this.setState({ action: e.target.name});
  }


  handleLogin() {
    const validInput = this.validate({ username: this.state.username.trim(), password: this.state.password.trim() });

    if (validInput) {
      fetch('/api/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          username: validInput.username,
          password: validInput.password
        })
      })
        .then(handleErrors)
        .then(res => res.json())
        .then(user => {
          // set localStorage with token
          localStorage.setItem('token', user.token);

          // set App state with user
          this.props.addUserToState(user.user);

          // push to user's namespace
          this.props.history.push(`/${user.user.username}`);
        })
        .catch(err => {
          // if received feedback from backend
          if (err.isValid === false) {
            this.setState({ usernameFeedback: err.usernameFeedback, passwordFeedback: err.passwordFeedback });
          } else {
            console.log(err.message);
          }
        });
    }
  }


  handleSignup() {
    const validInput = this.validate({ username: this.state.username.trim(), password: this.state.password.trim() });

    if (validInput) {
      fetch('/api/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          username: validInput.username,
          password: validInput.password
        })
      })
        .then(handleErrors)
        .then(res => res.json())
        .then(() => {
          this.setState({
            action: 'login',
            username: '',
            password: ''
          });
          document.querySelector('input[name="username"]').focus();
        })
        .catch(err => {
          // if received feedback from backend
          if (err.isValid === false) {
            this.setState({ usernameFeedback: err.usernameFeedback, passwordFeedback: err.passwordFeedback });
          } else {
            console.log(err.message);
          }
        });
    }
  }


  validate(userData) {
    userData.username = DOMPurify.sanitize(userData.username);
    userData.password = DOMPurify.sanitize(userData.password);

    if (/^[a-zA-Z0-9]{1,15}$/.test(userData.username) && /^[a-zA-Z0-9]{1,15}$/.test(userData.password)) {
      return userData;
    } else {
      // if both are invalid
      if (!/^[a-zA-Z0-9]{1,15}$/.test(userData.username) && !/^[a-zA-Z0-9]{1,15}$/.test(userData.password)) {
        this.setState({ usernameFeedback: 'Alphanumeric and 1-15 characters only.', passwordFeedback: 'Alphanumeric and 1-15 characters only.' });

      // if only username is invalid
      } else if (!/^[a-zA-Z0-9]{1,15}$/.test(userData.username)) {
        this.setState({ usernameFeedback: 'Alphanumeric and 1-15 characters only.' });

      // if only password is invalid
      } else if (!/^[a-zA-Z0-9]{1,15}$/.test(userData.password)) {
        this.setState({ passwordFeedback: 'Alphanumeric and 1-15 characters only.' });
      }


      return false;
    }
  }


  render() {
    return (
      <div>
        <div className="row mb-5">
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
                className='form-control form-control-lg'
                placeholder='Username'
                name='username'
                value={this.state.username}
                onChange={this.handleInputChange}
                autoFocus
              />
              <div className="is-invalid mb-2 pl-2">{this.state.usernameFeedback}</div>

              <input
                type='password'
                className='form-control form-control-lg'
                placeholder='Password'
                name='password'
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              <div className="is-invalid mb-2 pl-2">{this.state.passwordFeedback}</div>

              <input type="submit" value="Login" className="btn btn-info btn-block" onClick={this.handleLogin} />
            </div>

            :

            <div className="form-group col">
              <input
                type='text'
                className='form-control form-control-lg'
                placeholder='Username'
                name='username'
                value={this.state.username}
                onChange={this.handleInputChange}
              />
              <div className="is-invalid mb-2 pl-2">{this.state.usernameFeedback}</div>

              <input
                type='password'
                className='form-control form-control-lg'
                placeholder='Password'
                name='password'
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              <div className="is-invalid mb-2 pl-2">{this.state.passwordFeedback}</div>

              <input type="submit" value="Sign Up" className="btn btn-info btn-block" onClick={this.handleSignup} />
            </div>

          }
        </div>

      </div>
    )
  }
}



export default Landing;